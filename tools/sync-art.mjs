import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(projectRoot, 'assets', 'source-art', 'p01');
const destination = path.join(projectRoot, 'public', 'assets', 'source-art', 'p01');
const manifestPath = path.join(projectRoot, 'assets', 'source-art', 'p01-manifest.json');
const parseJson = (text) => JSON.parse(text.replace(/^\uFEFF/, ''));

await mkdir(destination, { recursive: true });

const files = (await readdir(source)).filter((name) => name.endsWith('.png'));
for (const file of files) {
  await copyFile(path.join(source, file), path.join(destination, file));
}

const manifest = parseJson(await readFile(manifestPath, 'utf8'));
const indexItems = Object.fromEntries(
  manifest.items
    .filter((item) => item.activeFile ?? item.generatedFile)
    .map((item) => [
      item.characterId,
      {
        characterId: item.characterId,
        version: item.activeVersion ?? 'v001',
        file: path.basename(item.activeFile ?? item.generatedFile),
        qaStatus: item.qaStatus,
        engineeringQaStatus: item.engineeringQaStatus ?? 'Not Reviewed',
      },
    ]),
);

await writeFile(
  path.join(destination, 'index.json'),
  `${JSON.stringify({
    schemaVersion: '1.0',
    promptRevision: manifest.promptRevision,
    generatedAt: new Date().toISOString(),
    total: Object.keys(indexItems).length,
    items: indexItems,
  }, null, 2)}\n`,
  'utf8',
);

console.log(`Synced ${files.length} P01 files and ${Object.keys(indexItems).length} active art-index entries.`);
