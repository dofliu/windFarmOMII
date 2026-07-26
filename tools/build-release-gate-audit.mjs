import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));
const readJson = async (relativePath) => parseJson(await readFile(path.join(projectRoot, relativePath), 'utf8'));

const [scenes, sceneAssets, p01Manifest, ledger] = await Promise.all([
  readJson('json/scenes.json'),
  readJson('json/sceneAssets.json'),
  readJson('assets/source-art/p01-manifest.json'),
  readJson('assets/source-art/qa/visual-approval-ledger-2026-07-24.json'),
]);

const sceneItems = Object.values(sceneAssets.items);
const fallbackFile = sceneAssets.fallback.file;
const dedicatedFiles = new Set(sceneItems.filter((item) => item.file !== fallbackFile).map((item) => item.file));
const sceneReviewCount = sceneItems.filter((item) => item.qaStatus === 'VISUAL_REVIEW_REQUIRED').length;
const routedSceneIds = new Set(sceneItems.map((item) => item.sceneId));
const fallbackSceneIds = scenes.map((item) => item.id).filter((sceneId) => !routedSceneIds.has(sceneId));
const sceneFallbackCount = fallbackSceneIds.length;
const generated = p01Manifest.items.filter((item) => item.generationStatus === 'Generated');
const queue = {
  upscalePending: generated.filter((item) => item.productionResolutionStatus === 'Upscale Pending').length,
  productionQaPending: generated.filter((item) => item.productionResolutionStatus === 'Production QA Pending').length,
  productionApproved: generated.filter((item) => item.productionResolutionStatus === 'Production Approved').length,
};

const audit = {
  schemaVersion: '1.0',
  generatedAt: new Date().toISOString(),
  mode: 'read-only release-gate snapshot',
  scene: {
    total: scenes.length,
    integratedRoutes: sceneItems.length,
    dedicatedRuntimeFiles: dedicatedFiles.size,
    sharedFallbackRoutes: sceneFallbackCount,
    visualReviewRequired: sceneReviewCount,
    fallbackSceneIds,
    fallbackFile,
  },
  p01: {
    activePreview: generated.length,
    queue,
  },
  approvalLedger: ledger.summary,
  manualGates: [
    'User visual approval for scene candidates and P01 production candidates',
    'Final AI upscale for explicitly approved P01 candidates',
    'Promotion of only approved final files into runtime art',
  ],
  automatedEvidence: [
    'pnpm validate',
    'pnpm validate:production-art',
    'pnpm validate:scene',
    'pnpm smoke:visual-ledger',
    'pnpm test (21 files / 142 tests)',
  ],
};

const outputPath = path.join(projectRoot, 'assets/source-art/qa/release-gate-audit-2026-07-24.json');
await writeFile(outputPath, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');
console.log(`Release-gate audit written: ${path.relative(projectRoot, outputPath)}`);
console.log(`Scene ${audit.scene.integratedRoutes}/${audit.scene.total} integrated; ${audit.scene.sharedFallbackRoutes} fallback; ${audit.scene.visualReviewRequired} visual review required.`);
console.log(`P01 queue ${queue.upscalePending}/${queue.productionQaPending}/${queue.productionApproved} (upscale / production QA / approved).`);
console.log('Manual approval, final AI upscale, and promotion remain explicit gates.');
