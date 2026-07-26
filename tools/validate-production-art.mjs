import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const manifest = JSON.parse(await readFile(path.join(artRoot, 'p01-manifest.json'), 'utf8'));
const index = JSON.parse(await readFile(path.join(projectRoot, 'public', 'assets', 'source-art', 'p01', 'index.json'), 'utf8'));
const generated = manifest.items.filter((item) => item.generationStatus === 'Generated');
const failures = [];

for (const item of generated) {
  const relativeFile = item.activeFile ?? item.generatedFile;
  if (!relativeFile) {
    failures.push(`${item.characterId}: generated item has no activeFile/generatedFile`);
    continue;
  }
  const absoluteFile = path.join(artRoot, relativeFile);
  let buffer;
  try {
    buffer = await readFile(absoluteFile);
  } catch {
    failures.push(`${item.characterId}: missing ${relativeFile}`);
    continue;
  }
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    failures.push(`${item.characterId}: not a PNG`);
    continue;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (Math.abs(width / height - 2 / 3) > 0.005) failures.push(`${item.characterId}: invalid aspect ${width}x${height}`);
  if (!['Upscale Pending', 'Production QA Pending', 'Production Approved'].includes(item.productionResolutionStatus)) {
    failures.push(`${item.characterId}: invalid productionResolutionStatus=${item.productionResolutionStatus ?? 'missing'}`);
  }
  if (item.productionResolutionStatus === 'Production Approved' && (width !== 4096 || height !== 6144)) {
    failures.push(`${item.characterId}: Production Approved without 4096x6144 source (${width}x${height})`);
  }
  if (['Production QA Pending', 'Production Approved'].includes(item.productionResolutionStatus)) {
    if (!item.productionFile) {
      failures.push(`${item.characterId}: ${item.productionResolutionStatus} without productionFile`);
    } else {
      try {
        const productionBuffer = await readFile(path.join(artRoot, item.productionFile));
        const productionWidth = productionBuffer.readUInt32BE(16);
        const productionHeight = productionBuffer.readUInt32BE(20);
        if (productionBuffer.toString('ascii', 1, 4) !== 'PNG' || productionWidth !== 4096 || productionHeight !== 6144) {
          failures.push(`${item.characterId}: invalid production source ${productionWidth}x${productionHeight}`);
        }
      } catch {
        failures.push(`${item.characterId}: missing production source ${item.productionFile}`);
      }
    }
  }
}

if (manifest.summary.generated !== generated.length) failures.push(`manifest generated summary mismatch: ${manifest.summary.generated} vs ${generated.length}`);
if (manifest.summary.upscalePending !== generated.filter((item) => item.productionResolutionStatus === 'Upscale Pending').length) {
  failures.push('manifest upscalePending summary mismatch');
}
if (manifest.summary.productionQaPending !== generated.filter((item) => item.productionResolutionStatus === 'Production QA Pending').length) {
  failures.push('manifest productionQaPending summary mismatch');
}
if (index.total !== Object.keys(index.items).length) failures.push(`active index count mismatch: ${index.total} vs ${Object.keys(index.items).length}`);
if (index.total !== generated.length) failures.push(`active index/generated mismatch: ${index.total} vs ${generated.length}`);
for (const [characterId, item] of Object.entries(index.items)) {
  try {
    await stat(path.join(artRoot, 'p01', item.file));
  } catch {
    failures.push(`${characterId}: active index file missing ${item.file}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Production art queue audit passed: ${generated.length} active P01 assets, ${manifest.summary.upscalePending} awaiting upscale, ${manifest.summary.productionQaPending} production QA pending, ${manifest.summary.productionApproved} Production Approved.`);
