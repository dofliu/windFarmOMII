import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const manifestPath = path.join(artRoot, 'p01-manifest.json');
const overridesPath = path.join(artRoot, 'visual-qa-overrides.json');
const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));

const [manifest, overrides] = await Promise.all(
  [manifestPath, overridesPath].map(async (filePath) =>
    parseJson(await readFile(filePath, 'utf8')),
  ),
);

const touchedBatchIds = new Set();
for (const override of overrides.items) {
  const item = manifest.items.find(
    (candidate) => candidate.characterId === override.characterId,
  );
  if (!item) throw new Error(`Visual QA character not found: ${override.characterId}`);

  item.visualQaStatus = override.visualQaStatus;
  item.visualIssues = override.visualIssues;
  item.visualRequiredCorrection = override.requiredCorrection;
  item.visualResolutionStatus = override.resolutionStatus ?? null;
  if (override.visualQaStatus !== 'Approved') {
    item.qaStatus = override.visualQaStatus;
    item.qaNotes = override.requiredCorrection;
  }
  touchedBatchIds.add(item.batchId);
}

manifest.summary.visualRegenerateRequired = manifest.items.filter(
  (item) => item.visualQaStatus === 'Regenerate Required',
).length;
// Visual override 在 engineering override 之後套用，因此此處要重算全域待複核數，避免摘要停留在舊值。
manifest.summary.correctionQaPending = manifest.items.filter(
  (item) => item.qaStatus === 'Correction QA Pending',
).length;
manifest.summary.approved = manifest.items.filter(
  (item) => item.qaStatus === 'Web Preview Approved',
).length;

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

for (const batchId of touchedBatchIds) {
  const batchPath = path.join(artRoot, 'batches', `${batchId}.json`);
  const qaPath = path.join(artRoot, 'qa', `${batchId}-qa.json`);
  const batch = parseJson(await readFile(batchPath, 'utf8'));

  for (const batchItem of batch.items) {
    const manifestItem = manifest.items.find(
      (candidate) => candidate.characterId === batchItem.characterId,
    );
    if (!manifestItem?.visualQaStatus) continue;
    for (const property of [
      'visualQaStatus',
      'visualIssues',
      'visualRequiredCorrection',
      'visualResolutionStatus',
      'qaStatus',
      'qaNotes',
    ]) {
      batchItem[property] = manifestItem[property];
    }
  }

  batch.visualRegenerateRequired = batch.items.filter(
    (item) => item.visualQaStatus === 'Regenerate Required',
  ).length;
  batch.correctionQaPending = batch.items.filter(
    (item) => item.qaStatus === 'Correction QA Pending',
  ).length;
  const outstandingCount = batch.items.filter(
    (item) => item.qaStatus !== 'Web Preview Approved',
  ).length;
  batch.qaStatus = batch.visualRegenerateRequired > 0
    ? 'Correction Required'
    : outstandingCount === 0
      ? 'Web Preview Approved'
      : 'Partially Approved';
  if (batch.qaSummary) {
    batch.qaSummary.visualRegenerateRequired = batch.visualRegenerateRequired;
    batch.qaSummary.correctionQaPending = batch.correctionQaPending;
    batch.qaSummary.webPreviewApproved = batch.items.filter(
      (item) => item.qaStatus === 'Web Preview Approved',
    ).length;
  }
  await writeFile(batchPath, `${JSON.stringify(batch, null, 2)}\n`, 'utf8');

  try {
    const qaReport = parseJson(await readFile(qaPath, 'utf8'));
    for (const qaItem of qaReport.items ?? []) {
      const manifestItem = manifest.items.find(
        (candidate) => candidate.characterId === qaItem.characterId,
      );
      if (!manifestItem?.visualQaStatus) continue;
      qaItem.visualQaStatus = manifestItem.visualQaStatus;
      qaItem.visualIssues = manifestItem.visualIssues;
      qaItem.requiredCorrection = manifestItem.visualRequiredCorrection;
      qaItem.qaStatus = manifestItem.qaStatus;
    }
    qaReport.summary = batch.qaSummary;
    await writeFile(qaPath, `${JSON.stringify(qaReport, null, 2)}\n`, 'utf8');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

console.log(`Applied ${overrides.items.length} visual QA override(s).`);
