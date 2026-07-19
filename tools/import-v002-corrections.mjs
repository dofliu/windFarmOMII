import { copyFile, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const manifestPath = path.join(artRoot, 'p01-manifest.json');
const batchPath = path.join(artRoot, 'batches', 'BATCH-P01-001.json');
const qaPath = path.join(artRoot, 'qa', 'BATCH-P01-001-qa.json');
const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));

const argumentsByName = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  argumentsByName.set(process.argv[index], process.argv[index + 1]);
}

const corrections = [
  {
    argument: '--mfg',
    characterId: 'CHR-MFG-126',
    outputFile: 'CHR-MFG-126_L1_P01_v002.png',
  },
  {
    argument: '--omi',
    characterId: 'CHR-OMI-221',
    outputFile: 'CHR-OMI-221_L1_P01_v002.png',
  },
  {
    argument: '--dig',
    characterId: 'CHR-DIG-271',
    outputFile: 'CHR-DIG-271_L1_P01_v002.png',
  },
];

const requestedCorrections = corrections.filter((correction) =>
  argumentsByName.has(correction.argument),
);
if (requestedCorrections.length === 0) {
  throw new Error('Provide at least one correction source: --mfg, --omi, or --dig');
}

const [manifest, batch] = await Promise.all(
  [manifestPath, batchPath].map(async (filePath) =>
    parseJson(await readFile(filePath, 'utf8')),
  ),
);

for (const correction of requestedCorrections) {
  const sourcePath = argumentsByName.get(correction.argument);

  const destinationPath = path.join(artRoot, 'p01', correction.outputFile);
  let shouldCopy = true;
  try {
    await stat(destinationPath);
    const [sourceBuffer, destinationBuffer] = await Promise.all([
      readFile(sourcePath),
      readFile(destinationPath),
    ]);
    const sourceHash = createHash('sha256').update(sourceBuffer).digest('hex');
    const destinationHash = createHash('sha256').update(destinationBuffer).digest('hex');
    if (sourceHash !== destinationHash) {
      throw new Error(`Refusing to overwrite different existing v002: ${destinationPath}`);
    }
    shouldCopy = false;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  if (shouldCopy) await copyFile(sourcePath, destinationPath);
  const buffer = await readFile(destinationPath);
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error(`Not a valid PNG: ${destinationPath}`);
  }

  const metadata = {
    version: 'v002',
    file: `p01/${correction.outputFile}`,
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    bytes: buffer.length,
    sha256: createHash('sha256').update(buffer).digest('hex'),
    promptRevision: 'OWM-P01-R3-FEMALE-ENGINEERING',
    generatedAt: new Date().toISOString(),
    status: 'QA Pending',
  };

  const aspectRatio = metadata.width / metadata.height;
  const aspectPass = Math.abs(aspectRatio - (2 / 3)) <= 0.005;
  if (!aspectPass) {
    throw new Error(
      `Correction must be 2:3: ${correction.outputFile} is ${metadata.width}x${metadata.height}`,
    );
  }

  for (const collection of [manifest.items, batch.items]) {
    const item = collection.find((candidate) => candidate.characterId === correction.characterId);
    if (!item) throw new Error(`Character not found: ${correction.characterId}`);
    item.correctionVersion = metadata.version;
    item.correctionFile = metadata.file;
    item.correctionMetadata = metadata;
    item.correctionGenerationStatus = 'Generated; QA Pending';
    // Review candidate 可先在遊戲中檢視，但不代表人工 QA 已核准。
    item.activeVersion = metadata.version;
    item.activeFile = metadata.file;
    item.activeWidth = metadata.width;
    item.activeHeight = metadata.height;
    item.activeAspectRatio = Number(aspectRatio.toFixed(6));
    item.activeAspectStatus = 'Pass';
    item.engineeringQaStatus ??= 'Review Pending';
    item.qaStatus = 'Correction QA Pending';
    item.qaNotes = '2:3 v002 review candidate is connected; user visual approval remains pending.';
    item.webStatus = 'Active v002 review candidate';
  }
}

manifest.summary.correctionQaPending = manifest.items.filter(
  (item) => item.qaStatus === 'Correction QA Pending',
).length;
manifest.summary.reframeRequired = manifest.items.filter(
  (item) => (item.activeAspectStatus ?? item.aspectStatus) === 'Fail',
).length;
batch.qaStatus = 'Correction QA Pending';
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
}

await Promise.all([
  writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
  writeFile(batchPath, `${JSON.stringify(batch, null, 2)}\n`, 'utf8'),
]);

try {
  const qaReport = parseJson(await readFile(qaPath, 'utf8'));
  for (const correction of requestedCorrections) {
    const manifestItem = manifest.items.find(
      (candidate) => candidate.characterId === correction.characterId,
    );
    const qaItem = qaReport.items?.find(
      (candidate) => candidate.characterId === correction.characterId,
    );
    if (!manifestItem || !qaItem) continue;
    qaItem.correctionFile = manifestItem.correctionFile;
    qaItem.correctionDimensions = `${manifestItem.activeWidth}x${manifestItem.activeHeight}`;
    qaItem.activeVersion = manifestItem.activeVersion;
    qaItem.activeAspectStatus = manifestItem.activeAspectStatus;
    qaItem.qaStatus = manifestItem.qaStatus;
  }
  qaReport.summary = batch.qaSummary;
  await writeFile(qaPath, `${JSON.stringify(qaReport, null, 2)}\n`, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

console.log(`Imported ${requestedCorrections.length} non-destructive v002 correction(s).`);
