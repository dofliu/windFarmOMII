import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));
const readJson = async (filePath) => parseJson(await readFile(filePath, 'utf8'));

const [manifest, guardrails, overrides, visualOverrides] = await Promise.all([
  readJson(path.join(artRoot, 'p01-manifest.json')),
  readJson(path.join(artRoot, 'prompt-guardrails.json')),
  readJson(path.join(artRoot, 'engineering-qa-overrides.json')),
  readJson(path.join(artRoot, 'visual-qa-overrides.json')),
]);

if (manifest.total !== 300 || manifest.items.length !== 300) {
  throw new Error(`Expected 300 P01 items, found ${manifest.items.length}.`);
}

const legacyRevisions = new Set(guardrails.legacyRevisions ?? []);
const currentRevision = guardrails.revision;
const hasEngineeringGuardrails = (item) =>
  item.positivePrompt.includes('exactly three') &&
  item.positivePrompt.includes('120 degrees') &&
  item.negativePrompt.includes('four-bladed wind turbine') &&
  item.negativePrompt.includes('warped blade') &&
  item.negativePrompt.includes('blade intersecting tower');
const hasLegacyFemaleDirection = (item) =>
  legacyRevisions.has(item.promptRevision) &&
  item.positivePrompt.includes('original fictional adult woman') &&
  item.negativePrompt.includes('sexualized character');
const hasLegacyDiversityDirection = (item) =>
  legacyRevisions.has(item.promptRevision) &&
  (item.positivePrompt.includes('not gender-locked') ||
    item.positivePrompt.includes('R6 workforce diversity lock')) &&
  item.negativePrompt.includes('same face') &&
  !item.negativePrompt.includes('male character');
const hasCurrentDiversityDirection = (item) =>
  item.promptRevision === currentRevision &&
  item.positivePrompt.includes('R7 casting variety lock') &&
  item.positivePrompt.includes('real offshore-wind workforce ensemble') &&
  item.positivePrompt.includes('explicit visual casting lock') &&
  item.positivePrompt.includes('Character identity must be decided before costume/background') &&
  item.negativePrompt.includes('same face') &&
  item.negativePrompt.includes('copy-pasted face') &&
  item.negativePrompt.includes('waifu') &&
  item.negativePrompt.includes('default pretty heroine') &&
  item.negativePrompt.includes('only outfit changed') &&
  item.negativePrompt.includes('only background changed') &&
  item.negativePrompt.includes('repeated front-facing pose') &&
  !item.negativePrompt.includes('male character');

const invalidPrompts = manifest.items.filter((item) => {
  if (!hasEngineeringGuardrails(item)) return true;
  if (item.generationStatus === 'Pending') return !hasCurrentDiversityDirection(item);
  return !hasLegacyFemaleDirection(item) && !hasLegacyDiversityDirection(item) && !hasCurrentDiversityDirection(item);
});

if (invalidPrompts.length > 0) {
  throw new Error(`Engineering guardrails missing from ${invalidPrompts.length} P01 prompts.`);
}

const duplicateCharacterIds = manifest.items
  .map((item) => item.characterId)
  .filter((id, index, all) => all.indexOf(id) !== index);
if (duplicateCharacterIds.length > 0) {
  throw new Error(`Duplicate character IDs in P01 manifest: ${duplicateCharacterIds.join(', ')}`);
}

const requiredDiversityFields = guardrails.batchDiversityPolicy?.profileSchema?.requiredFields ?? [];
const genderValues = new Set(guardrails.batchDiversityPolicy?.profileSchema?.genderPresentationValues ?? []);
const minimumBatchMix = guardrails.batchDiversityPolicy?.minimumBatchMix ?? {};
const currentProfileByBatch = new Map();
for (const item of manifest.items.filter(
  (candidate) => candidate.promptRevision === currentRevision && candidate.diversityProfile,
)) {
  currentProfileByBatch.set(item.batchId, [...(currentProfileByBatch.get(item.batchId) ?? []), item]);
}

const diversitySignature = (item) =>
  [
    item.diversityProfile?.genderPresentation,
    item.diversityProfile?.faceShape,
    item.diversityProfile?.facialFeature,
    item.diversityProfile?.skinTone,
    item.diversityProfile?.hairstyle,
    item.diversityProfile?.ageImpression,
    item.diversityProfile?.bodyType,
    item.diversityProfile?.poseSilhouette,
    item.diversityProfile?.expression,
    item.diversityProfile?.cameraAngle,
    item.diversityProfile?.handGesture,
    item.diversityProfile?.toolHandling,
    item.diversityProfile?.antiCloneCue,
  ].join(' | ');

const pendingSignatures = new Map();
const nonGlamourPosePattern =
  /(crouch|crouching|kneel|kneeling|leaning|stepping|walking|squatting|reaching|bracing|calibrating|connect|fasten|tightening|checking|reading|carrying|gripping|aligning|testing|shielding|gangway|permit|harness|case|tool bag|equipment case|sensor cable|carabiner|crate|rail|portable analyzer)/i;

for (const [batchId, items] of currentProfileByBatch) {
  if (items.length !== manifest.batchSize) {
    throw new Error(`Current diversity batch ${batchId} must contain ${manifest.batchSize} items, found ${items.length}.`);
  }
  const profileErrors = [];
  for (const item of items) {
    const profile = item.diversityProfile;
    if (!profile || typeof profile !== 'object') {
      profileErrors.push(`${item.characterId}: missing diversityProfile`);
      continue;
    }
    for (const field of requiredDiversityFields) {
      if (!(field in profile) || String(profile[field]).trim() === '') {
        profileErrors.push(`${item.characterId}: missing diversityProfile.${field}`);
      }
    }
    if (!genderValues.has(profile.genderPresentation)) {
      profileErrors.push(`${item.characterId}: invalid genderPresentation ${profile.genderPresentation}`);
    }
    const currentDirectionMentions = (item.positivePrompt.match(/R7 casting variety lock/g) ?? []).length;
    if (currentDirectionMentions !== 1) {
      profileErrors.push(`${item.characterId}: expected exactly one current character direction block, found ${currentDirectionMentions}`);
    }
    if (item.generationStatus === 'Pending' && item.positivePrompt.includes('Character direction is not gender-locked')) {
      profileErrors.push(`${item.characterId}: pending R7 prompt still contains legacy R5 character direction wording`);
    }
    if (item.generationStatus === 'Pending' && item.positivePrompt.includes('R6 workforce diversity lock')) {
      profileErrors.push(`${item.characterId}: pending R7 prompt still contains legacy R6 character direction wording`);
    }
    if (item.generationStatus === 'Pending' && item.positivePrompt.includes('neutral confident stance')) {
      profileErrors.push(`${item.characterId}: pending R7 prompt still contains legacy neutral confident stance`);
    }
    if (profile.genderPresentation === 'masculine' && !item.positivePrompt.includes('adult man or clearly masculine adult worker')) {
      profileErrors.push(`${item.characterId}: masculine R7 prompt does not lock adult man / clearly masculine casting`);
    }
    if (profile.genderPresentation === 'androgynous' && !item.positivePrompt.includes('genuinely androgynous adult worker')) {
      profileErrors.push(`${item.characterId}: androgynous R7 prompt does not block default feminine-face collapse`);
    }
    if (profile.genderPresentation === 'feminine' && !item.positivePrompt.includes('adult woman with a non-repeated face')) {
      profileErrors.push(`${item.characterId}: feminine R7 prompt does not require non-repeated face`);
    }
    if (
      profile.genderPresentation === 'feminine' &&
      /(beard|moustache|mustache|sideburns)/i.test(`${Object.values(profile).join(' ')} ${item.positivePrompt}`)
    ) {
      profileErrors.push(`${item.characterId}: feminine R7 profile contains contradictory facial-hair or sideburn cues`);
    }
    if (
      !item.positivePrompt.includes(profile.genderPresentation) ||
      !item.positivePrompt.includes(profile.faceShape) ||
      !item.positivePrompt.includes(profile.facialFeature) ||
      !item.positivePrompt.includes(profile.skinTone) ||
      !item.positivePrompt.includes(profile.hairstyle) ||
      !item.positivePrompt.includes(profile.ageImpression) ||
      !item.positivePrompt.includes(profile.bodyType) ||
      !item.positivePrompt.includes(profile.poseSilhouette) ||
      !item.positivePrompt.includes(profile.expression) ||
      !item.positivePrompt.includes(profile.cameraAngle) ||
      !item.positivePrompt.includes(profile.handGesture) ||
      !item.positivePrompt.includes(profile.toolHandling) ||
      !item.positivePrompt.includes(profile.antiCloneCue)
    ) {
      profileErrors.push(`${item.characterId}: positive prompt does not reflect structured diversityProfile`);
    }
    const signature = diversitySignature(item);
    const existing = pendingSignatures.get(signature);
    if (existing) {
      profileErrors.push(`${item.characterId}: diversityProfile duplicates ${existing}`);
    }
    pendingSignatures.set(signature, item.characterId);
  }
  if (profileErrors.length > 0) {
    throw new Error(`R5 diversity profile errors in ${batchId}: ${profileErrors.join('; ')}`);
  }
  const genderCounts = Object.groupBy(items, (item) => item.diversityProfile.genderPresentation);
  const masculineCount = genderCounts.masculine?.length ?? 0;
  const androgynousCount = genderCounts.androgynous?.length ?? 0;
  const feminineCount = genderCounts.feminine?.length ?? 0;
  const uniquePoseCount = new Set(items.map((item) => item.diversityProfile.poseSilhouette)).size;
  const uniqueCameraCount = new Set(items.map((item) => item.diversityProfile.cameraAngle)).size;
  const uniqueHairCount = new Set(items.map((item) => item.diversityProfile.hairstyle)).size;
  const uniqueExpressionCount = new Set(items.map((item) => item.diversityProfile.expression)).size;
  const uniqueFaceCount = new Set(items.map((item) => item.diversityProfile.faceShape)).size;
  const uniqueBodyCount = new Set(items.map((item) => item.diversityProfile.bodyType)).size;
  const uniqueAgeCount = new Set(items.map((item) => item.diversityProfile.ageImpression)).size;
  const matureAgePattern = /(40|50|60|veteran|senior|mentor|supervisor|consultant|retired)/i;
  const matureAgeCount = items.filter((item) => matureAgePattern.test(item.diversityProfile.ageImpression)).length;
  const nonGlamourTaskPoseCount = items.filter((item) =>
    nonGlamourPosePattern.test(
      [
        item.diversityProfile.poseSilhouette,
        item.diversityProfile.handGesture,
        item.diversityProfile.toolHandling,
        item.diversityProfile.antiCloneCue,
      ].join(' '),
    ),
  ).length;
  if (
    masculineCount < minimumBatchMix.maleOrMasculinePresentation ||
    androgynousCount < minimumBatchMix.androgynousOrGenderNeutralPresentation ||
    feminineCount > minimumBatchMix.femaleOrFemininePresentationMaximum ||
    uniqueAgeCount < (minimumBatchMix.minimumAgeImpressions ?? 5) ||
    matureAgeCount < (minimumBatchMix.minimumMatureAgeImpressions ?? 0) ||
    uniquePoseCount < (minimumBatchMix.minimumUniquePoseSilhouettes ?? 5) ||
    uniqueCameraCount < (minimumBatchMix.minimumUniqueCameraAngles ?? 5) ||
    uniqueHairCount < (minimumBatchMix.minimumUniqueHairstyles ?? 5) ||
    uniqueExpressionCount < (minimumBatchMix.minimumUniqueExpressions ?? 5) ||
    uniqueFaceCount < (minimumBatchMix.minimumUniqueFaceShapes ?? 5) ||
    uniqueBodyCount < (minimumBatchMix.minimumUniqueBodyTypes ?? 5) ||
    nonGlamourTaskPoseCount < (minimumBatchMix.minimumNonGlamourTaskPoses ?? 0)
  ) {
    throw new Error(`R7 diversity mix failed for ${batchId}: masculine=${masculineCount}, androgynous=${androgynousCount}, feminine=${feminineCount}, ages=${uniqueAgeCount}, matureAges=${matureAgeCount}, poses=${uniquePoseCount}, cameras=${uniqueCameraCount}, hairstyles=${uniqueHairCount}, expressions=${uniqueExpressionCount}, faces=${uniqueFaceCount}, bodies=${uniqueBodyCount}, nonGlamourTaskPoses=${nonGlamourTaskPoseCount}.`);
  }
}

for (const override of overrides.items) {
  const item = manifest.items.find((candidate) => candidate.characterId === override.characterId);
  if (!item || item.engineeringQaStatus !== override.engineeringQaStatus) {
    throw new Error(`Engineering QA override not applied: ${override.characterId}`);
  }
}

for (const override of visualOverrides.items) {
  const item = manifest.items.find((candidate) => candidate.characterId === override.characterId);
  if (!item || item.visualQaStatus !== override.visualQaStatus) {
    throw new Error(`Visual QA override not applied: ${override.characterId}`);
  }
}

console.log(
  `OWM art prompt validation passed: ${manifest.items.length} P01 prompts use current ${currentRevision} for pending casting-variety art and legacy revisions for completed art; ${currentProfileByBatch.size} current-revision batches passed structured diversity gates; ${overrides.items.length} engineering and ${visualOverrides.items.length} visual QA overrides applied.`,
);
