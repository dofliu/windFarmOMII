import { copyFile, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const manifestPath = path.join(artRoot, 'p01-manifest.json');
const visualOverridesPath = path.join(artRoot, 'visual-qa-overrides.json');
const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const characterId = args.get('--character-id');
const sourcePath = args.get('--source');
const version = args.get('--version') ?? 'v002';
if (!characterId || !sourcePath) {
  throw new Error('Usage: node tools/import-art-correction.mjs --character-id <ID> --source <PNG> [--version v002]');
}
if (!/^v\d{3}$/.test(version)) throw new Error(`Invalid version: ${version}`);

const manifest = parseJson(await readFile(manifestPath, 'utf8'));
const manifestItem = manifest.items.find((item) => item.characterId === characterId);
if (!manifestItem) throw new Error(`Character not found: ${characterId}`);

const outputFile = manifestItem.outputFile.replace(/_v\d{3}\.png$/i, `_${version}.png`);
if (outputFile === manifestItem.outputFile) {
  throw new Error(`Cannot derive versioned correction filename from ${manifestItem.outputFile}`);
}
const relativeFile = `p01/${outputFile}`;
const destinationPath = path.join(artRoot, 'p01', outputFile);

const sourceBuffer = await readFile(sourcePath);
if (sourceBuffer.toString('ascii', 1, 4) !== 'PNG') {
  throw new Error(`Not a valid PNG: ${sourcePath}`);
}
const sourceHash = createHash('sha256').update(sourceBuffer).digest('hex');

let shouldCopy = true;
try {
  await stat(destinationPath);
  const existingBuffer = await readFile(destinationPath);
  const existingHash = createHash('sha256').update(existingBuffer).digest('hex');
  if (existingHash !== sourceHash) {
    throw new Error(`Refusing to overwrite different existing correction: ${destinationPath}`);
  }
  shouldCopy = false;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
if (shouldCopy) await copyFile(sourcePath, destinationPath);

const buffer = await readFile(destinationPath);
const width = buffer.readUInt32BE(16);
const height = buffer.readUInt32BE(20);
const aspectRatio = width / height;
if (Math.abs(aspectRatio - (2 / 3)) > 0.005) {
  throw new Error(`Correction must be 2:3: ${outputFile} is ${width}x${height}`);
}

const metadata = {
  version,
  file: relativeFile,
  width,
  height,
  bytes: buffer.length,
  sha256: sourceHash,
  promptRevision: manifest.promptRevision,
  generatedAt: new Date().toISOString(),
  status: 'QA Pending',
};

const batchPath = path.join(artRoot, 'batches', `${manifestItem.batchId}.json`);
const qaPath = path.join(artRoot, 'qa', `${manifestItem.batchId}-qa.json`);
const batch = parseJson(await readFile(batchPath, 'utf8'));
const batchItem = batch.items.find((item) => item.characterId === characterId);
if (!batchItem) throw new Error(`Character missing from batch ${manifestItem.batchId}: ${characterId}`);

for (const item of [manifestItem, batchItem]) {
  item.correctionVersion = version;
  item.correctionFile = relativeFile;
  item.correctionMetadata = metadata;
  item.correctionGenerationStatus = 'Generated; QA Pending';
  // Candidate 先進遊戲檢視，QA status 仍明確表示未經人工核准。
  item.activeVersion = version;
  item.activeFile = relativeFile;
  item.activeWidth = width;
  item.activeHeight = height;
  item.activeAspectRatio = Number(aspectRatio.toFixed(6));
  item.activeAspectStatus = 'Pass';
  item.qaStatus = 'Correction QA Pending';
  item.qaNotes = `${version} review candidate is connected; user visual approval remains pending.`;
  item.webStatus = `Active ${version} review candidate`;
  if (item.visualQaStatus === 'Regenerate Required') {
    item.visualQaStatus = 'Correction QA Pending';
    item.visualResolutionStatus = `${version} generated; user visual approval pending`;
  }
}

manifest.summary.correctionQaPending = manifest.items.filter(
  (item) => item.qaStatus === 'Correction QA Pending',
).length;
manifest.summary.reframeRequired = manifest.items.filter(
  (item) => (item.activeAspectStatus ?? item.aspectStatus) === 'Fail',
).length;
manifest.summary.visualRegenerateRequired = manifest.items.filter(
  (item) => item.visualQaStatus === 'Regenerate Required',
).length;

batch.correctionQaPending = batch.items.filter(
  (item) => item.qaStatus === 'Correction QA Pending',
).length;
batch.visualRegenerateRequired = batch.items.filter(
  (item) => item.visualQaStatus === 'Regenerate Required',
).length;
batch.qaStatus = 'Correction QA Pending';
if (batch.qaSummary) {
  batch.qaSummary.webPreviewApproved = batch.items.filter(
    (item) => item.qaStatus === 'Web Preview Approved',
  ).length;
  batch.qaSummary.reframeRequired = batch.items.filter(
    (item) => (item.activeAspectStatus ?? item.aspectStatus) === 'Fail',
  ).length;
  batch.qaSummary.correctionQaPending = batch.correctionQaPending;
  batch.qaSummary.visualRegenerateRequired = batch.visualRegenerateRequired;
}

await Promise.all([
  writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
  writeFile(batchPath, `${JSON.stringify(batch, null, 2)}\n`, 'utf8'),
]);

try {
  const visualOverrides = parseJson(await readFile(visualOverridesPath, 'utf8'));
  const override = visualOverrides.items.find((item) => item.characterId === characterId);
  if (override) {
    override.visualQaStatus = 'Correction QA Pending';
    override.resolutionStatus = `${version} generated; user visual approval pending`;
    await writeFile(
      visualOverridesPath,
      `${JSON.stringify(visualOverrides, null, 2)}\n`,
      'utf8',
    );
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

try {
  const qaReport = parseJson(await readFile(qaPath, 'utf8'));
  const qaItem = qaReport.items?.find((item) => item.characterId === characterId);
  if (qaItem) {
    qaItem.correctionFile = relativeFile;
    qaItem.correctionDimensions = `${width}x${height}`;
    qaItem.activeVersion = version;
    qaItem.activeAspectStatus = 'Pass';
    qaItem.visualQaStatus = manifestItem.visualQaStatus;
    qaItem.qaStatus = manifestItem.qaStatus;
  }
  qaReport.summary = batch.qaSummary;
  await writeFile(qaPath, `${JSON.stringify(qaReport, null, 2)}\n`, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

console.log(`Imported ${characterId} ${version}: ${width}x${height}, sha256 ${sourceHash}`);
