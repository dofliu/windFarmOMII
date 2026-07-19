import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artRoot = path.join(projectRoot, 'assets', 'source-art');
const qaRoot = path.join(artRoot, 'qa');
const batchId = process.argv[2] ?? 'BATCH-P01-016';

const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));
const batch = await readFile(path.join(artRoot, 'batches', `${batchId}.json`), 'utf8').then(parseJson);
const revisionLabel = String(batch.promptRevision ?? 'current').match(/R\d+/)?.[0] ?? 'CURRENT';
const revisionSlug = revisionLabel.toLowerCase();

const currentItems = batch.items.filter((item) => item.generationStatus === 'Pending');
if (currentItems.length === 0) {
  throw new Error(`${batchId} has no pending items to export.`);
}

const countBy = (field) =>
  Object.fromEntries(
    Object.entries(
      currentItems.reduce((acc, item) => {
        const value = item.diversityProfile?.[field] ?? 'UNKNOWN';
        acc[value] = (acc[value] ?? 0) + 1;
        return acc;
      }, {}),
    ).sort(([a], [b]) => a.localeCompare(b)),
  );

const imagegenPrompt = (item) => [
  'Use case: stylized-concept',
  'Asset type: Offshore Wind Masters P01 full-body Source Art for web-preview card game asset',
  `Character ID: ${item.characterId}`,
  `Expected output filename after import: ${item.outputFile}`,
  'Primary request: Generate exactly one original fictional adult offshore-wind professional as full-body character key art.',
  `Positive prompt: ${item.positivePrompt}`,
  `Avoid: ${item.negativePrompt}`,
  'Composition/framing: strict vertical 2:3 portrait, one full-body character, head-to-boots visible, face/hands/tools/feet inside a 12 percent safe zone, no baked card frame.',
  'Output constraints: no text, no letters, no numbers, no logo, no watermark, no HUD, no UI overlay, no extra character.',
].join('\n');

const exported = {
  schemaVersion: '1.0',
  generatedAt: new Date().toISOString(),
  batchId,
  promptRevision: batch.promptRevision,
  intendedMode: 'built-in imagegen, one image per prompt',
  expectedAspect: '2:3',
  expectedPreviewResolution: '1024x1536',
  outputDirectoryAfterImport: 'assets/source-art/p01',
  summary: {
    total: currentItems.length,
    genderPresentation: countBy('genderPresentation'),
    ageImpressions: Object.keys(countBy('ageImpression')).length,
    faceShapes: Object.keys(countBy('faceShape')).length,
    poseSilhouettes: Object.keys(countBy('poseSilhouette')).length,
    cameraAngles: Object.keys(countBy('cameraAngle')).length,
  },
  items: currentItems.map((item) => ({
    characterId: item.characterId,
    nameEn: item.nameEn,
    professionEn: item.professionEn,
    outputFile: item.outputFile,
    relativePath: item.relativePath,
    diversityProfile: item.diversityProfile,
    imagegenPrompt: imagegenPrompt(item),
  })),
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const md = [
  `# ${batchId} ${revisionLabel} Source Art Generation Pack`,
  '',
  `Prompt revision: \`${batch.promptRevision}\``,
  '',
  '## Batch diversity summary',
  '',
  `- Total pending prompts: ${exported.summary.total}`,
  `- Gender presentation: ${Object.entries(exported.summary.genderPresentation).map(([key, value]) => `${key} ${value}`).join(' / ')}`,
  `- Unique age impressions: ${exported.summary.ageImpressions}`,
  `- Unique face shapes: ${exported.summary.faceShapes}`,
  `- Unique pose silhouettes: ${exported.summary.poseSilhouettes}`,
  `- Unique camera angles: ${exported.summary.cameraAngles}`,
  '',
  '## Casting plan',
  '',
  '| Slot | Character | Casting | Age | Face | Body | Pose | Camera | Output |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...exported.items.map((item) => {
    const p = item.diversityProfile;
    return `| ${p.slot} | ${item.characterId} ${item.professionEn} | ${p.genderPresentation} | ${p.ageImpression} | ${p.faceShape}; ${p.facialFeature} | ${p.bodyType} | ${p.poseSilhouette} | ${p.cameraAngle} | ${item.outputFile} |`;
  }),
  '',
  '## Full prompts',
  '',
  ...exported.items.flatMap((item) => [
    `### ${item.characterId} - ${item.professionEn}`,
    '',
    '```text',
    item.imagegenPrompt,
    '```',
    '',
  ]),
].join('\n');

const htmlCards = exported.items.map((item) => {
  const p = item.diversityProfile;
  return `<article class="card ${escapeHtml(p.genderPresentation)}">
    <header><span>${escapeHtml(String(p.slot).padStart(2, '0'))}</span><strong>${escapeHtml(item.characterId)}</strong></header>
    <h2>${escapeHtml(item.professionEn)}</h2>
    <dl>
      <dt>Casting</dt><dd>${escapeHtml(p.genderPresentation)} · ${escapeHtml(p.ageImpression)}</dd>
      <dt>Face</dt><dd>${escapeHtml(p.faceShape)} · ${escapeHtml(p.facialFeature)}</dd>
      <dt>Hair / skin</dt><dd>${escapeHtml(p.hairstyle)} · ${escapeHtml(p.skinTone)}</dd>
      <dt>Body</dt><dd>${escapeHtml(p.bodyType)}</dd>
      <dt>Pose</dt><dd>${escapeHtml(p.poseSilhouette)}</dd>
      <dt>Camera</dt><dd>${escapeHtml(p.cameraAngle)}</dd>
      <dt>Hands/tools</dt><dd>${escapeHtml(p.handGesture)} · ${escapeHtml(p.toolHandling)}</dd>
      <dt>Anti-clone</dt><dd>${escapeHtml(p.antiCloneCue)}</dd>
    </dl>
    <footer>${escapeHtml(item.outputFile)}</footer>
  </article>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>${escapeHtml(batchId)} ${escapeHtml(revisionLabel)} Casting Plan</title>
<style>
  :root { color-scheme: dark; font-family: Inter, Segoe UI, Arial, sans-serif; background: #101719; color: #e8f2ef; }
  body { margin: 0; padding: 24px; }
  h1 { margin: 0 0 8px; font-size: 28px; }
  .summary { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; color: #9fb9b3; }
  .summary span { border: 1px solid #28453f; background: #162522; padding: 6px 10px; border-radius: 999px; }
  .grid { display: grid; grid-template-columns: repeat(5, minmax(220px, 1fr)); gap: 12px; }
  .card { border: 1px solid #2c4d47; background: linear-gradient(180deg, #182421, #111b1a); border-radius: 14px; padding: 12px; min-height: 360px; box-shadow: 0 12px 30px #0008; }
  .card.masculine { border-top: 5px solid #6fb7ff; }
  .card.androgynous { border-top: 5px solid #c4a3ff; }
  .card.feminine { border-top: 5px solid #ff9fb7; }
  header { display: flex; justify-content: space-between; color: #9fb9b3; font-size: 12px; letter-spacing: .08em; }
  h2 { font-size: 16px; min-height: 38px; margin: 8px 0 10px; color: #fff; }
  dl { display: grid; grid-template-columns: 66px 1fr; gap: 6px 8px; margin: 0; font-size: 12px; line-height: 1.35; }
  dt { color: #70d7c6; text-transform: uppercase; font-size: 10px; letter-spacing: .08em; }
  dd { margin: 0; color: #d4e3df; }
  footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid #2c4d47; color: #8da59f; font-size: 11px; }
</style>
<body>
  <h1>${escapeHtml(batchId)} ${escapeHtml(revisionLabel)} Casting Plan</h1>
  <div class="summary">
    <span>${escapeHtml(batch.promptRevision)}</span>
    <span>${escapeHtml(Object.entries(exported.summary.genderPresentation).map(([key, value]) => `${key}: ${value}`).join(' / '))}</span>
    <span>Age impressions: ${exported.summary.ageImpressions}</span>
    <span>Face shapes: ${exported.summary.faceShapes}</span>
    <span>Poses: ${exported.summary.poseSilhouettes}</span>
    <span>Cameras: ${exported.summary.cameraAngles}</span>
  </div>
  <section class="grid">${htmlCards}</section>
</body>
</html>
`;

await mkdir(qaRoot, { recursive: true });
await writeFile(path.join(qaRoot, `${batchId}-${revisionSlug}-generation-pack.json`), `${JSON.stringify(exported, null, 2)}\n`, 'utf8');
await writeFile(path.join(qaRoot, `${batchId}-${revisionSlug}-generation-pack.md`), `${md}\n`, 'utf8');
await writeFile(path.join(qaRoot, `${batchId}-${revisionSlug}-casting-plan.html`), html, 'utf8');

console.log(`Exported ${batchId} ${revisionLabel} generation pack with ${exported.items.length} prompts.`);
