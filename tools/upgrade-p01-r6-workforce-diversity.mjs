import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const manifestPath = path.join(artRoot, 'p01-manifest.json');
const batchRoot = path.join(artRoot, 'batches');
const guardrailsPath = path.join(artRoot, 'prompt-guardrails.json');

const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));

const [manifest, guardrails] = await Promise.all([
  readFile(manifestPath, 'utf8').then(parseJson),
  readFile(guardrailsPath, 'utf8').then(parseJson),
]);

const currentRevision = guardrails.revision;
const turbinePositive = guardrails.windTurbineGeometry.positiveConstraint;
const characterNegativeParts = guardrails.characterDirection.negativePrompt
  .split(',')
  .map((part) => part.trim())
  .filter(Boolean);

const genderCastingLock = (profile) => {
  if (profile.genderPresentation === 'masculine') {
    return 'explicit visual casting lock: adult man or clearly masculine adult worker; avoid pretty young woman, tomboy heroine, feminine idol face, soft waifu facial proportions, and feminine face under masculine clothing for this slot';
  }
  if (profile.genderPresentation === 'androgynous') {
    return 'explicit visual casting lock: genuinely androgynous adult worker with mixed facial/body cues; avoid default feminine anime face, waifu softness, soft idol face, and young heroine proportions for this slot';
  }
  return 'explicit visual casting lock: adult woman with a non-repeated face; avoid default waifu, idol heroine, doll face, and same pretty young woman template for this slot';
};

const currentCharacterBlock = (item) => {
  const profile = item.diversityProfile;
  return [
    'R7 casting variety lock: this character belongs to a real offshore-wind workforce ensemble, not one attractive young female lead copied into different PPE and backgrounds.',
    `${genderCastingLock(profile)}.`,
    `Single-person identity must stay visually distinct: ${profile.genderPresentation}-presenting ${profile.ageImpression}, ${profile.faceShape}, ${profile.facialFeature}, ${profile.skinTone}, ${profile.hairstyle}, ${profile.bodyType}, ${profile.poseSilhouette}, ${profile.expression}, ${profile.cameraAngle}, ${profile.handGesture}, ${profile.toolHandling}.`,
    `Anti-clone cue: ${profile.antiCloneCue}; do not average this with any earlier P01 face, pose, expression, or body silhouette.`,
    'Character identity must be decided before costume/background: vary apparent age decade, eye shape, nose bridge, mouth, jaw, cheek mass, neck/shoulder proportion, posture line, hand placement, action silhouette, and tool interaction before varying PPE color or scenery.',
    'Prefer credible non-glamour work poses whenever the profile allows it: crouching, kneeling, leaning into wind, stepping from vessel to platform, reading a permit, fastening harness hardware, calibrating equipment, carrying a heavy case, or bracing against sea spray.',
    'Keep credible task-appropriate PPE, adult proportions, professional non-sexualized presentation, and the existing cinematic semi-realistic anime rendering quality without collapsing into a generic anime girl.',
  ].join(' ');
};

const replaceCharacterBlock = (prompt, block) => {
  const blockWithEngineering = `${block} ${turbinePositive}`;
  const r5Pattern = /Character direction is not gender-locked and anti-clone diversity is mandatory:[\s\S]*?Engineering background accuracy is mandatory\./;
  const genericPattern = /Character direction is not gender-locked and must actively avoid clone-like repetition:[\s\S]*?Engineering background accuracy is mandatory\./;
  const r6Pattern = /R6 workforce diversity lock:[\s\S]*?Engineering background accuracy is mandatory\./;
  const r7Pattern = /R7 casting variety lock:[\s\S]*?Engineering background accuracy is mandatory\./;
  if (r7Pattern.test(prompt)) return prompt.replace(r7Pattern, blockWithEngineering);
  if (r6Pattern.test(prompt)) return prompt.replace(r6Pattern, blockWithEngineering);
  if (r5Pattern.test(prompt)) return prompt.replace(r5Pattern, blockWithEngineering);
  if (genericPattern.test(prompt)) return prompt.replace(genericPattern, blockWithEngineering);
  if (prompt.includes('Engineering background accuracy is mandatory.')) {
    return prompt.replace('Engineering background accuracy is mandatory.', blockWithEngineering);
  }
  return `${prompt} ${blockWithEngineering}`;
};

const mergeNegativePrompt = (negativePrompt) => {
  const parts = negativePrompt
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== 'male character');
  for (const part of characterNegativeParts) {
    if (!parts.includes(part)) parts.push(part);
  }
  return parts.join(', ');
};

const pendingItems = manifest.items.filter((item) => item.generationStatus === 'Pending');
for (const item of pendingItems) {
  if (!item.diversityProfile) {
    throw new Error(`${item.characterId} is pending but has no diversityProfile.`);
  }
  item.promptRevision = currentRevision;
  item.positivePrompt = replaceCharacterBlock(item.positivePrompt, currentCharacterBlock(item));
  item.negativePrompt = mergeNegativePrompt(item.negativePrompt);
}

manifest.promptRevision = currentRevision;
manifest.generatedAt = new Date().toISOString();
manifest.characterDiversityPolicy = guardrails.batchDiversityPolicy.positiveConstraint;
manifest.summary.pending = manifest.items.filter((item) => item.generationStatus === 'Pending').length;
manifest.summary.generated = manifest.items.filter((item) => item.generationStatus === 'Generated').length;

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const batchIds = [...new Set(manifest.items.map((item) => item.batchId))];
for (const batchId of batchIds) {
  const batchPath = path.join(batchRoot, `${batchId}.json`);
  const existingBatch = await readFile(batchPath, 'utf8').then(parseJson);
  const batchItems = manifest.items.filter((item) => item.batchId === batchId);
  const batchRevision = batchItems.every((item) => item.promptRevision === currentRevision)
    ? currentRevision
    : existingBatch.promptRevision;
  await writeFile(
    batchPath,
    `${JSON.stringify({ ...existingBatch, promptRevision: batchRevision, items: batchItems }, null, 2)}\n`,
    'utf8',
  );
}

console.log(`Upgraded ${pendingItems.length} pending P01 prompts to ${currentRevision}.`);
