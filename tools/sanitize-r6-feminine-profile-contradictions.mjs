import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const manifestPath = path.join(artRoot, 'p01-manifest.json');
const batchRoot = path.join(artRoot, 'batches');

const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));

const replacements = [
  ['sparse moustache', 'fine smile lines'],
  ['short beard shadow', 'subtle cheek scar'],
  ['close shaved black hair with visible sideburns', 'close-cropped black hair under helmet'],
  ['ginger crew cut and short sideburns', 'short ginger pixie cut under helmet'],
];

const applyReplacements = (value) => {
  if (typeof value !== 'string') return value;
  return replacements.reduce((text, [from, to]) => text.split(from).join(to), value);
};

const manifest = await readFile(manifestPath, 'utf8').then(parseJson);
let changedCount = 0;

for (const item of manifest.items) {
  if (item.generationStatus !== 'Pending') continue;
  if (item.diversityProfile?.genderPresentation !== 'feminine') continue;

  const before = JSON.stringify(item.diversityProfile);
  for (const [key, value] of Object.entries(item.diversityProfile)) {
    item.diversityProfile[key] = applyReplacements(value);
  }
  item.positivePrompt = applyReplacements(item.positivePrompt);
  if (JSON.stringify(item.diversityProfile) !== before) changedCount += 1;
}

manifest.generatedAt = new Date().toISOString();
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const batchIds = [...new Set(manifest.items.map((item) => item.batchId))];
for (const batchId of batchIds) {
  const batchPath = path.join(batchRoot, `${batchId}.json`);
  const existingBatch = await readFile(batchPath, 'utf8').then(parseJson);
  await writeFile(
    batchPath,
    `${JSON.stringify({ ...existingBatch, items: manifest.items.filter((item) => item.batchId === batchId) }, null, 2)}\n`,
    'utf8',
  );
}

console.log(`Sanitized ${changedCount} pending feminine R6 profiles with contradictory facial-hair / sideburn cues.`);
