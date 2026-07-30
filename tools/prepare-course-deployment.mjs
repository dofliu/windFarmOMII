import { access, cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputArgumentIndex = process.argv.indexOf('--dir');
const outputName = outputArgumentIndex >= 0 ? process.argv[outputArgumentIndex + 1] : 'dist';
if (!outputName) throw new Error('Usage: node tools/prepare-course-deployment.mjs --dir <build-directory>');
const outputRoot = path.resolve(projectRoot, outputName);
const relativeOutput = path.relative(projectRoot, outputRoot);
if (!relativeOutput || relativeOutput.startsWith('..') || path.isAbsolute(relativeOutput)) {
  throw new Error(`Deployment output must be inside the project: ${outputRoot}`);
}
await access(path.join(outputRoot, 'index.html'));

const assetPackRoot = path.join(projectRoot, 'course-deployment-assets');
const manifest = JSON.parse(await readFile(path.join(assetPackRoot, 'manifest.json'), 'utf8'));
const sourceArtRoot = path.join(outputRoot, 'assets', 'source-art');
const p01Root = path.join(sourceArtRoot, 'p01');
const environmentRoot = path.join(outputRoot, 'assets', 'environment');
const p01IndexPath = path.join(p01Root, 'index.json');
const sceneIndexPath = path.join(outputRoot, 'data', 'sceneAssets.json');
const sourceArtIndex = JSON.parse(await readFile(p01IndexPath, 'utf8'));
const sceneIndex = JSON.parse(await readFile(sceneIndexPath, 'utf8'));

// 僅清理已驗證的 build 產物目錄，保留專案來源素材。 Build-output only.
await rm(sourceArtRoot, { recursive: true, force: true });
await rm(environmentRoot, { recursive: true, force: true });
await mkdir(path.join(p01Root, 'course'), { recursive: true });
await mkdir(path.join(environmentRoot, 'course'), { recursive: true });
await cp(path.join(assetPackRoot, 'portraits'), path.join(p01Root, 'course'), { recursive: true });
await cp(path.join(assetPackRoot, 'scenes'), path.join(environmentRoot, 'course'), { recursive: true });
const shinkaiRoot = path.join(sourceArtRoot, 'v2-shinkai');
await mkdir(shinkaiRoot, { recursive: true });
await writeFile(path.join(shinkaiRoot, 'index.json'), `${JSON.stringify({
  schemaVersion: '1.0',
  promptRevision: 'COURSE_DEPLOYMENT_CLASSIC_ONLY',
  generatedAt: new Date(0).toISOString(),
  total: 0,
  items: {},
}, null, 2)}\n`, 'utf8');

for (const [characterId, entry] of Object.entries(sourceArtIndex.items)) {
  entry.file = `course/${manifest.portraits[characterId] ?? manifest.portraitFallback}`;
  entry.qaStatus = manifest.portraits[characterId] ? entry.qaStatus : 'COURSE_FALLBACK';
}
sourceArtIndex.promptRevision = `${sourceArtIndex.promptRevision}-COURSE-DEPLOYMENT`;
sourceArtIndex.generatedAt = new Date(0).toISOString();
await writeFile(p01IndexPath, `${JSON.stringify(sourceArtIndex, null, 2)}\n`, 'utf8');

const sceneFile = (sceneId) => `/assets/environment/course/${manifest.scenes[sceneId] ?? manifest.sceneFallback}`;
sceneIndex.fallback.file = sceneFile(sceneIndex.fallback.sourceSceneId);
sceneIndex.fallback.qaStatus = 'COURSE_DEPLOYMENT_OPTIMIZED';
for (const [sceneId, entry] of Object.entries(sceneIndex.items)) {
  entry.file = sceneFile(sceneId);
  entry.qaStatus = manifest.scenes[sceneId] ? 'COURSE_DEPLOYMENT_OPTIMIZED' : 'COURSE_FALLBACK';
}
await writeFile(sceneIndexPath, `${JSON.stringify(sceneIndex, null, 2)}\n`, 'utf8');

async function directorySize(directory) {
  let bytes = 0;
  let files = 0;
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, item.name);
    if (item.isDirectory()) {
      const nested = await directorySize(target);
      bytes += nested.bytes;
      files += nested.files;
    } else if (item.isFile()) {
      bytes += (await stat(target)).size;
      files += 1;
    }
  }
  return { bytes, files };
}

const size = await directorySize(outputRoot);
if (size.bytes > 250 * 1024 * 1024) {
  throw new Error(`Course deployment exceeds 250 MiB: ${size.bytes} bytes`);
}
console.log(`Prepared Course deployment: ${size.files} files, ${(size.bytes / 1024 / 1024).toFixed(1)} MiB.`);
