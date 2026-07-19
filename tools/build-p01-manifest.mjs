import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonRoot = path.join(projectRoot, 'json');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const outputPath = path.join(artRoot, 'p01-manifest.json');
const batchRoot = path.join(artRoot, 'batches');
const guardrailsPath = path.join(artRoot, 'prompt-guardrails.json');

const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));
const readJson = async (name) =>
  parseJson(await readFile(path.join(jsonRoot, name), 'utf8'));

const [characters, prompts, guardrails] = await Promise.all([
  readJson('characters.json'),
  readJson('prompts.json'),
  readFile(guardrailsPath, 'utf8').then(parseJson),
]);

let existingManifest;
try {
  existingManifest = parseJson(await readFile(outputPath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const existingItemsByCharacterId = new Map(
  (existingManifest?.items ?? []).map((item) => [item.characterId, item]),
);

const charactersById = new Map(characters.map((character) => [character.id, character]));
const p01Prompts = prompts.filter((prompt) => prompt.variantCode === 'P01');

// 以 prompt 的 stable ID 為主鍵，避免日後角色排序改變時錯接圖片。
const items = p01Prompts.map((prompt, index) => {
  const character = charactersById.get(prompt.characterId);
  if (!character) {
    throw new Error(`Missing character for ${prompt.id}: ${prompt.characterId}`);
  }

  const existingItem = existingItemsByCharacterId.get(character.id) ?? {};
  return {
    sequence: index + 1,
    promptId: prompt.id,
    characterId: character.id,
    trackId: character.trackId,
    factionCode: character.factionCode,
    levelCode: character.levelCode,
    nameZh: character.nameZh,
    nameEn: character.nameEn,
    professionZh: character.professionZh,
    professionEn: character.professionEn,
    ...existingItem,
    promptRevision: guardrails.revision,
    positivePrompt: `${prompt.positivePrompt} ${guardrails.characterDirection.positiveConstraint} ${guardrails.windTurbineGeometry.positiveConstraint}`,
    negativePrompt: `${prompt.negativePrompt}, ${guardrails.characterDirection.negativePrompt}, ${guardrails.windTurbineGeometry.negativePrompt}`,
    aspect: prompt.aspect,
    requestedSourceResolution: prompt.targetResolution,
    outputFile: prompt.outputFile,
    relativePath: `p01/${prompt.outputFile}`,
    generationMode: 'built-in imagegen',
    generationStatus: existingItem.generationStatus ?? 'Pending',
    qaStatus: existingItem.qaStatus ?? 'Pending',
    webStatus: existingItem.webStatus ?? 'Not Connected',
  };
});

if (items.length !== characters.length || items.length !== 300) {
  throw new Error(`Expected 300 P01 items, found ${items.length}`);
}

// 首批就涵蓋不同 faction，讓風格、PPE 與場景問題能提早被 QA 發現。
const factionOrder = [...new Set(items.map((item) => item.factionCode))];
const factionQueues = new Map(
  factionOrder.map((factionCode) => [
    factionCode,
    items.filter((item) => item.factionCode === factionCode),
  ]),
);
const productionOrder = [];

while (productionOrder.length < items.length) {
  for (const factionCode of factionOrder) {
    const next = factionQueues.get(factionCode).shift();
    if (next) productionOrder.push(next);
  }
}

productionOrder.forEach((item, index) => {
  item.productionSequence = index + 1;
  item.batchId = `BATCH-P01-${String(Math.floor(index / 10) + 1).padStart(3, '0')}`;
  item.batchSequence = (index % 10) + 1;
});

const manifest = {
  ...existingManifest,
  schemaVersion: '1.1',
  generatedAt: new Date().toISOString(),
  purpose: 'One P01 full-body source-art image for each OWM character',
  canonicalSourceDirectory: 'assets/source-art/p01',
  overlayPolicy: 'No frame, text, number, logo, watermark, HUD, UI, fatigue meter, skill icon, or rarity badge baked into source art.',
  requestedAspect: '2:3',
  requestedSourceResolution: '4096x6144 PNG',
  promptRevision: guardrails.revision,
  engineeringBackgroundPolicy: guardrails.windTurbineGeometry.positiveConstraint,
  total: items.length,
  batchSize: 10,
  batchCount: Math.ceil(items.length / 10),
  summary: {
    ...(existingManifest?.summary ?? {}),
    pending: items.filter((item) => item.generationStatus === 'Pending').length,
    generated: items.filter((item) => item.generationStatus === 'Generated').length,
    approved: items.filter((item) => item.qaStatus === 'Web Preview Approved').length,
    rejected: items.filter((item) => item.qaStatus === 'Rejected').length,
  },
  items,
};

await mkdir(path.join(artRoot, 'p01'), { recursive: true });
await mkdir(batchRoot, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

for (let batchNumber = 1; batchNumber <= manifest.batchCount; batchNumber += 1) {
  const batchId = `BATCH-P01-${String(batchNumber).padStart(3, '0')}`;
  const batchItems = productionOrder.filter((item) => item.batchId === batchId);
  const batchPath = path.join(batchRoot, `${batchId}.json`);
  let existingBatch;
  try {
    existingBatch = parseJson(await readFile(batchPath, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(
    batchPath,
    `${JSON.stringify({ ...existingBatch, batchId, promptRevision: guardrails.revision, total: batchItems.length, items: batchItems }, null, 2)}\n`,
    'utf8',
  );
}

console.log(
  `Created ${path.relative(projectRoot, outputPath)} with ${items.length} P01 items in ${manifest.batchCount} batches.`,
);
