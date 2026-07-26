import { copyFile, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// R7 sample import 與正式 production import 分離，避免尚未完成使用者視覺核准的圖卡被誤標成 Approved。
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const batchId = process.argv[2] ?? 'BATCH-P01-022';
const sampleRoot = path.join(artRoot, 'qa', `${batchId}-r7-samples`);
const manifestPath = path.join(artRoot, 'p01-manifest.json');
const batchPath = path.join(artRoot, 'batches', `${batchId}.json`);
const qaPath = path.join(sampleRoot, `${batchId}-r7-full-sample-qa.json`);
const destinationRoot = path.join(artRoot, 'p01');

const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));
const readJson = async (filePath) => parseJson(await readFile(filePath, 'utf8'));
const writeJson = async (filePath, value) => writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const [manifest, batch, qa] = await Promise.all([
  readJson(manifestPath),
  readJson(batchPath),
  readJson(qaPath),
]);

const currentItems = qa.items.filter((item) => ['Sample Review Required', 'Active Preview QA Pending'].includes(item.qaStatus));
const manifestById = new Map(manifest.items.map((item) => [item.characterId, item]));
const batchById = new Map(batch.items.map((item) => [item.characterId, item]));
const imported = [];

for (const qaItem of currentItems) {
  const sourcePath = path.join(sampleRoot, qaItem.sampleFile);
  const destinationName = qaItem.sampleFile.replace(/_sample\.png$/i, '.png');
  const destinationPath = path.join(destinationRoot, destinationName);
  const sourceBuffer = await readFile(sourcePath);
  const sourceHash = createHash('sha256').update(sourceBuffer).digest('hex');
  let shouldCopy = true;
  try {
    const existingBuffer = await readFile(destinationPath);
    const existingHash = createHash('sha256').update(existingBuffer).digest('hex');
    if (existingHash !== sourceHash) {
      throw new Error(`Refusing to overwrite different active preview: ${destinationPath}`);
    }
    shouldCopy = false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (shouldCopy) await copyFile(sourcePath, destinationPath);

  const metadata = await stat(destinationPath);
  const width = sourceBuffer.readUInt32BE(16);
  const height = sourceBuffer.readUInt32BE(20);
  const aspectRatio = width / height;
  if (Math.abs(aspectRatio - (2 / 3)) > 0.005) {
    throw new Error(`${qaItem.characterId} must be 2:3; received ${width}x${height}`);
  }

  const relativeFile = `p01/${destinationName}`;
  const reviewStatus = qaItem.sampleVersion === 'v002' ? 'Correction QA Pending' : 'Technical QA Pending';
  const webStatus = `Active ${qaItem.sampleVersion} review candidate`;
  const importedAt = new Date().toISOString();
  const update = (item) => {
    item.generatedFile = relativeFile;
    item.generatedWidth = width;
    item.generatedHeight = height;
    item.generatedBytes = metadata.size;
    item.sha256 = sourceHash;
    item.importedAt = importedAt;
    item.generationStatus = 'Generated';
    item.activeVersion = qaItem.sampleVersion;
    item.activeFile = relativeFile;
    item.activeWidth = width;
    item.activeHeight = height;
    item.activeAspectRatio = Number(aspectRatio.toFixed(6));
    item.activeAspectStatus = 'Pass';
    item.productionResolutionStatus = 'Upscale Pending';
    item.visualQaStatus = 'Visual Review Required';
    item.visualResolutionStatus = `${qaItem.sampleVersion} active preview connected; user visual approval pending`;
    item.engineeringQaStatus ??= 'Not Reviewed';
    item.qaStatus = reviewStatus;
    item.qaNotes = `${qaItem.sampleVersion} sample is connected for active preview; user visual approval and production upscale remain pending.`;
    item.webStatus = webStatus;
  };

  const manifestItem = manifestById.get(qaItem.characterId);
  const batchItem = batchById.get(qaItem.characterId);
  if (!manifestItem || !batchItem) throw new Error(`Missing manifest or batch item: ${qaItem.characterId}`);
  const alreadyConnected = manifestItem.activeFile === relativeFile && manifestItem.activeVersion === qaItem.sampleVersion;
  update(manifestItem);
  update(batchItem);
  if (!alreadyConnected) {
    qaItem.activeImportStatus = 'Imported to active preview; QA Pending';
    imported.push(qaItem.characterId);
  }
}

manifest.summary.pending = manifest.items.filter((item) => item.generationStatus === 'Pending').length;
manifest.summary.generated = manifest.items.filter((item) => item.generationStatus === 'Generated').length;
manifest.summary.approved = manifest.items.filter((item) => item.qaStatus === 'Web Preview Approved').length;
manifest.summary.rejected = manifest.items.filter((item) => item.qaStatus === 'Rejected').length;
manifest.summary.correctionQaPending = manifest.items.filter((item) => item.qaStatus === 'Correction QA Pending').length;
manifest.summary.technicalQaPending = manifest.items.filter((item) => item.qaStatus === 'Technical QA Pending').length;
manifest.summary.upscalePending = manifest.items.filter(
  (item) => item.generationStatus === 'Generated' && item.productionResolutionStatus === 'Upscale Pending',
).length;
manifest.summary.productionQaPending = manifest.items.filter((item) => item.productionResolutionStatus === 'Production QA Pending').length;
manifest.summary.productionApproved = manifest.items.filter((item) => item.productionResolutionStatus === 'Production Approved').length;

batch.generationStatus = batch.items.every((item) => item.generationStatus === 'Generated') ? 'Generated' : 'Pending';
batch.qaStatus = 'Active Preview QA Pending';
batch.importedAt = new Date().toISOString();
batch.correctionQaPending = batch.items.filter((item) => item.qaStatus === 'Correction QA Pending').length;
batch.technicalQaPending = batch.items.filter((item) => item.qaStatus === 'Technical QA Pending').length;
batch.visualRegenerateRequired = batch.items.filter((item) => item.visualQaStatus === 'Regenerate Required').length;
qa.summary.activeImportCount = qa.items.filter((item) => item.activeImportStatus?.startsWith('Imported')).length;

await Promise.all([
  writeJson(manifestPath, manifest),
  writeJson(batchPath, batch),
  writeJson(qaPath, qa),
]);

console.log(`${batchId} R7 active preview import complete: ${imported.length} new candidate(s), ${qa.summary.activeImportCount} total active-preview candidates.`);
