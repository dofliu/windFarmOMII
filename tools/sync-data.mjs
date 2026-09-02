import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(projectRoot, 'json');
const destination = path.join(projectRoot, 'public', 'data');

// 只同步瀏覽器實際 fetch 的資料檔（src/domain/data.ts）。
// prompts.json（約 5 MB 的 AI 繪圖 prompt，不宜對學生公開）與 character_skills.json 只供離線工具使用，
// 不進部署包；tools/validate_owm_data.py 以同一份清單核對 public/data。
export const WEB_DATA_FILES = [
  'manifest.json',
  'factions.json',
  'tracks.json',
  'characters.json',
  'skills.json',
  'equipment.json',
  'bosses.json',
  'bossChallengeAudit.json',
  'scenes.json',
  'sceneAssets.json',
  'missions.json',
  'turbines.json',
  'codex.json',
  'vessels.json',
];

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

for (const file of WEB_DATA_FILES) {
  await copyFile(path.join(source, file), path.join(destination, file));
}

console.log(`Synced ${WEB_DATA_FILES.length} runtime JSON files to public/data (offline-only data excluded).`);
