import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const configPath = path.join(root, 'public', 'course', 'course-config.json');
const args = process.argv.slice(2);
const valueFor = (name) => {
  const inline = args.find((item) => item.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const weeksValue = valueFor('--weeks');
const version = valueFor('--version');

if (!weeksValue || !version) {
  console.error('Usage: pnpm course:unlock -- --weeks W01,W02 --version 2026-FALL-W02');
  process.exit(2);
}

const config = JSON.parse(await readFile(configPath, 'utf8'));
const validWeeks = new Set(config.assignments.map((assignment) => assignment.weekId));
const requestedWeeks = weeksValue.trim().toUpperCase() === 'NONE'
  ? []
  : [...new Set(weeksValue.split(',').map((value) => value.trim().toUpperCase()).filter(Boolean))];
const unknownWeeks = requestedWeeks.filter((weekId) => !validWeeks.has(weekId));
if (unknownWeeks.length > 0) {
  console.error(`Unknown Course weeks: ${unknownWeeks.join(', ')}`);
  process.exit(2);
}
if (!/^[A-Z0-9._-]{3,64}$/i.test(version)) {
  console.error('Config version may contain letters, numbers, dot, underscore, and hyphen only.');
  process.exit(2);
}

// 只接受教師明確列出的週次；不由日期、前次進度或學生端狀態推算解鎖。
config.unlockedWeekIds = requestedWeeks.sort();
config.configVersion = version;
await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
console.log(`Course weeks updated: ${config.unlockedWeekIds.join(', ') || 'NONE'} (${config.configVersion})`);
