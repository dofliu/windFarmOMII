import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { validateCourseConfig } from './lib/course-config-validator.mjs';

const root = path.resolve(import.meta.dirname, '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));

// 乾淨 clone 的 public/data 是 gitignored 的同步產物;缺少時自動同步,避免 ENOENT(review C6)。
if (!existsSync(path.join(root, 'public', 'data', 'missions.json'))) {
  console.warn('public/data 不存在,先執行 sync-data 同步資料…');
  const synced = spawnSync(process.execPath, [path.join(root, 'tools', 'sync-data.mjs')], { stdio: 'inherit', cwd: root });
  if (synced.status !== 0) throw new Error('自動 sync-data 失敗,請先手動執行 pnpm sync:data 並檢查 json/ 是否存在。');
}

const [config, packageJson, missions, characters, equipment, vessels] = await Promise.all([
  readJson('public', 'course', 'course-config.json'),
  readJson('package.json'),
  readJson('public', 'data', 'missions.json'),
  readJson('public', 'data', 'characters.json'),
  readJson('public', 'data', 'equipment.json'),
  readJson('public', 'data', 'vessels.json'),
]);

const { errors, warnings } = validateCourseConfig(config, {
  packageVersion: packageJson.version,
  missions,
  characters,
  equipment,
  vessels,
});
for (const warning of warnings) console.warn(`Course config warning: ${warning}`);
if (errors.length > 0) {
  throw new Error(`Course config validation failed: ${errors.join('; ')}`);
}

console.log(`Course config passed: ${config.releaseVersion}, ${config.rosterIds.length} roles, ${config.assignments.length} fixed assignments, ${config.unlockedWeekIds.length} manually unlocked.`);
