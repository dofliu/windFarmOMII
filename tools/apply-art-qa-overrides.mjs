import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const manifestPath = path.join(artRoot, 'p01-manifest.json');
const overridesPath = path.join(artRoot, 'engineering-qa-overrides.json');
const batchRoot = path.join(artRoot, 'batches');
const qaRoot = path.join(artRoot, 'qa');
const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));

const [manifest, overrides] = await Promise.all(
  [manifestPath, overridesPath].map(async (filePath) =>
    parseJson(await readFile(filePath, 'utf8')),
  ),
);

const overrideByCharacterId = new Map(
  overrides.items.map((item) => [item.characterId, item]),
);

for (const item of manifest.items) {
  const override = overrideByCharacterId.get(item.characterId);
  if (!override) continue;

  // 保留角色已核准部分，只針對工程背景問題要求新版本，避免誤覆寫 v001。
  item.engineeringQaStatus = override.engineeringQaStatus;
  item.engineeringIssues = override.engineeringIssues;
  item.requiredCorrection = override.requiredCorrection;
  item.engineeringResolutionStatus = override.resolutionStatus ?? null;
  if (override.engineeringQaStatus === 'Approved') {
    if (!item.correctionFile) {
      throw new Error(`Approved correction file is missing: ${item.characterId}`);
    }
    item.activeVersion = override.approvedVersion;
    item.activeFile = item.correctionFile;
    if (item.correctionMetadata) {
      item.activeWidth = item.correctionMetadata.width;
      item.activeHeight = item.correctionMetadata.height;
      item.activeAspectRatio = Number(
        (item.correctionMetadata.width / item.correctionMetadata.height).toFixed(6),
      );
      item.activeAspectStatus = Math.abs(item.activeAspectRatio - (2 / 3)) <= 0.005
        ? 'Pass'
        : 'Fail';
    }
    item.correctionGenerationStatus = 'Approved';
    if (item.correctionMetadata) item.correctionMetadata.status = 'Approved';
    item.qaStatus = 'Web Preview Approved';
    item.qaNotes = `R3 ${override.approvedVersion} engineering correction approved by user; production resolution upscale remains pending.`;
    item.webStatus = `Active ${override.approvedVersion}`;
  } else {
    item.qaStatus = 'Regenerate Required';
    item.qaNotes = [item.qaNotes, override.requiredCorrection].filter(Boolean).join(' ');
  }
}

manifest.summary.engineeringRegenerateRequired = manifest.items.filter(
  (item) => item.engineeringQaStatus === 'Regenerate Required',
).length;
manifest.summary.correctionQaPending = manifest.items.filter(
  (item) => item.qaStatus === 'Correction QA Pending',
).length;
manifest.summary.reframeRequired = manifest.items.filter(
  (item) => (item.activeAspectStatus ?? item.aspectStatus) === 'Fail',
).length;
manifest.summary.approved = manifest.items.filter(
  (item) => item.qaStatus === 'Web Preview Approved',
).length;

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

for (let batchNumber = 1; batchNumber <= manifest.batchCount; batchNumber += 1) {
  const batchId = `BATCH-P01-${String(batchNumber).padStart(3, '0')}`;
  const batchPath = path.join(batchRoot, `${batchId}.json`);
  const batch = parseJson(await readFile(batchPath, 'utf8'));
  let changed = false;

  for (const item of batch.items) {
    const manifestItem = manifest.items.find((candidate) => candidate.characterId === item.characterId);
    if (!manifestItem?.engineeringQaStatus) continue;
    for (const property of ['engineeringQaStatus', 'engineeringIssues', 'requiredCorrection', 'engineeringResolutionStatus', 'activeVersion', 'activeFile', 'activeWidth', 'activeHeight', 'activeAspectRatio', 'activeAspectStatus', 'correctionGenerationStatus', 'correctionMetadata', 'qaStatus', 'qaNotes', 'webStatus']) {
      item[property] = manifestItem[property];
    }
    changed = true;
  }

  if (changed) {
    const outstandingCount = batch.items.filter(
      (item) => item.qaStatus !== 'Web Preview Approved',
    ).length;
    batch.qaStatus = outstandingCount === 0 ? 'Web Preview Approved' : 'Partially Approved';
    batch.engineeringRegenerateRequired = batch.items.filter(
      (item) => item.engineeringQaStatus === 'Regenerate Required',
    ).length;
    batch.correctionQaPending = batch.items.filter(
      (item) => item.qaStatus === 'Correction QA Pending',
    ).length;
    if (batch.qaSummary) {
      batch.qaSummary.webPreviewApproved = batch.items.filter(
        (item) => item.qaStatus === 'Web Preview Approved',
      ).length;
      batch.qaSummary.reframeRequired = batch.items.filter(
        (item) => (item.activeAspectStatus ?? item.aspectStatus) === 'Fail',
      ).length;
      batch.qaSummary.engineeringRegenerateRequired = batch.engineeringRegenerateRequired;
    }
    await writeFile(batchPath, `${JSON.stringify(batch, null, 2)}\n`, 'utf8');

    const qaPath = path.join(qaRoot, `${batchId}-qa.json`);
    try {
      const qaReport = parseJson(await readFile(qaPath, 'utf8'));
      for (const qaItem of qaReport.items ?? []) {
        const manifestItem = manifest.items.find(
          (candidate) => candidate.characterId === qaItem.characterId,
        );
        if (!manifestItem?.engineeringQaStatus) continue;
        qaItem.engineeringQaStatus = manifestItem.engineeringQaStatus;
        qaItem.engineeringIssues = manifestItem.engineeringIssues;
        qaItem.requiredCorrection = manifestItem.requiredCorrection;
        qaItem.qaStatus = manifestItem.qaStatus;
      }
      qaReport.summary = batch.qaSummary;
      await writeFile(qaPath, `${JSON.stringify(qaReport, null, 2)}\n`, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

console.log(`Applied ${overrides.items.length} engineering QA overrides.`);
