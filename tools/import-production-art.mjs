import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const productionRoot = path.join(artRoot, 'production', 'p01');
const manifestPath = path.join(artRoot, 'p01-manifest.json');

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const characterId = args.get('--character-id');
const sourcePath = args.get('--source');
if (!characterId || !sourcePath) throw new Error('Usage: node tools/import-production-art.mjs --character-id <ID> --source <4096x6144 PNG>');

const manifest = JSON.parse((await readFile(manifestPath, 'utf8')).replace(/^\uFEFF/, ''));
const item = manifest.items.find((entry) => entry.characterId === characterId);
if (!item) throw new Error(`Character not found: ${characterId}`);
if (item.productionResolutionStatus === 'Production Approved') throw new Error(`${characterId} is already Production Approved; use a reviewed replacement workflow.`);

const sourceBuffer = await readFile(sourcePath);
if (sourceBuffer.toString('ascii', 1, 4) !== 'PNG') throw new Error(`Not a PNG: ${sourcePath}`);
const width = sourceBuffer.readUInt32BE(16);
const height = sourceBuffer.readUInt32BE(20);
if (width !== 4096 || height !== 6144) throw new Error(`${characterId} production source must be exactly 4096x6144; received ${width}x${height}`);
const sourceHash = createHash('sha256').update(sourceBuffer).digest('hex');
const version = item.activeVersion ?? 'v001';
const outputName = `${characterId}_${item.levelCode}_P01_${version}_production.png`;
const destinationPath = path.join(productionRoot, outputName);
await mkdir(productionRoot, { recursive: true });

try {
  const existingBuffer = await readFile(destinationPath);
  const existingHash = createHash('sha256').update(existingBuffer).digest('hex');
  if (existingHash !== sourceHash) throw new Error(`Refusing to overwrite different production source: ${destinationPath}`);
} catch (error) {
  if (error.code === 'ENOENT') await copyFile(sourcePath, destinationPath);
  else throw error;
}

const metadata = await stat(destinationPath);
const productionFile = `production/p01/${outputName}`;
const productionMetadata = {
  productionFile,
  productionWidth: width,
  productionHeight: height,
  productionBytes: metadata.size,
  productionSha256: sourceHash,
  productionImportedAt: new Date().toISOString(),
  productionResolutionStatus: 'Production QA Pending',
  productionQaStatus: 'Pending',
  qaNotes: `${version} production source connected; production QA and user visual approval remain pending.`,
};
Object.assign(item, productionMetadata);

const batchPath = path.join(artRoot, 'batches', `${item.batchId}.json`);
const batch = JSON.parse((await readFile(batchPath, 'utf8')).replace(/^\uFEFF/, ''));
const batchItem = batch.items.find((entry) => entry.characterId === characterId);
if (!batchItem) throw new Error(`Character not found in batch: ${characterId}`);
Object.assign(batchItem, productionMetadata);
batch.productionQaPending = batch.items.filter((entry) => entry.productionResolutionStatus === 'Production QA Pending').length;
batch.productionApproved = batch.items.filter((entry) => entry.productionResolutionStatus === 'Production Approved').length;

manifest.summary.upscalePending = manifest.items.filter((entry) => entry.generationStatus === 'Generated' && entry.productionResolutionStatus === 'Upscale Pending').length;
manifest.summary.productionQaPending = manifest.items.filter((entry) => entry.productionResolutionStatus === 'Production QA Pending').length;
manifest.summary.productionApproved = manifest.items.filter((entry) => entry.productionResolutionStatus === 'Production Approved').length;
await Promise.all([
  writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
  writeFile(batchPath, `${JSON.stringify(batch, null, 2)}\n`, 'utf8'),
]);
console.log(`Imported ${characterId} production candidate: ${width}x${height}, ${productionFile}`);
