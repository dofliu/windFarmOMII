import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(projectRoot, 'json');
const destination = path.join(projectRoot, 'public', 'data');

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

const files = (await readdir(source)).filter((name) => name.endsWith('.json'));
for (const file of files) {
  await copyFile(path.join(source, file), path.join(destination, file));
}

console.log(`Synced ${files.length} JSON files to public/data.`);
