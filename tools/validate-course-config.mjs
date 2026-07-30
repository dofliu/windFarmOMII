import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));

const [config, packageJson, missions, characters, equipment, vessels] = await Promise.all([
  readJson('public', 'course', 'course-config.json'),
  readJson('package.json'),
  readJson('public', 'data', 'missions.json'),
  readJson('public', 'data', 'characters.json'),
  readJson('public', 'data', 'equipment.json'),
  readJson('public', 'data', 'vessels.json'),
]);

const fail = (message) => {
  throw new Error(`Course config validation failed: ${message}`);
};
const unique = (items) => new Set(items).size === items.length;
const missionIds = new Set(missions.map((item) => item.id));
const characterById = new Map(characters.map((item) => [item.id, item]));
const equipmentIds = new Set(equipment.map((item) => item.id));
const vesselIds = new Set(vessels.map((item) => item.id));

if (config.schemaVersion !== 1) fail('schemaVersion must be 1');
if (config.releaseVersion !== packageJson.version) fail(`releaseVersion ${config.releaseVersion} does not match package ${packageJson.version}`);
if (config.frozen !== true) fail('semester release must be frozen');
if (!/^[A-Z0-9_-]{3,32}$/.test(config.courseCode ?? '')) fail('courseCode must be anonymous-safe');
if (!Array.isArray(config.rosterIds) || config.rosterIds.length < 18 || config.rosterIds.length > 24 || !unique(config.rosterIds)) {
  fail('Course roster must contain 18-24 unique role IDs');
}
if (config.rosterIds.some((id) => !characterById.has(id))) fail('roster references an unknown character');
if (new Set(config.rosterIds.map((id) => characterById.get(id).trackId)).size !== config.rosterIds.length) {
  fail('Course roster must use one representative per occupational track');
}
if (!Array.isArray(config.assignments) || config.assignments.length !== 15) fail('15 fixed Campaign assignments are required');
if (!unique(config.assignments.map((item) => item.id))) fail('assignment IDs must be unique');
if (!unique(config.assignments.map((item) => item.weekId))) fail('week IDs must be unique');
if (!unique(config.assignments.map((item) => item.randomSeed))) fail('random seeds must be unique and fixed');

for (const assignment of config.assignments) {
  if (!/^W\d{2}$/.test(assignment.weekId)) fail(`${assignment.id} has invalid weekId`);
  if (!missionIds.has(assignment.missionId)) fail(`${assignment.id} references an unknown mission`);
  if (!Array.isArray(assignment.teamIds) || assignment.teamIds.length !== 3 || !unique(assignment.teamIds)) fail(`${assignment.id} must use three unique roles`);
  if (assignment.teamIds.some((id) => !config.rosterIds.includes(id))) fail(`${assignment.id} uses a role outside the Course roster`);
  if (!equipmentIds.has(assignment.equipmentId) || !equipmentIds.has(assignment.spareId)) fail(`${assignment.id} references unknown equipment`);
  if (!vesselIds.has(assignment.vesselId)) fail(`${assignment.id} references an unknown vessel`);
  if (!Number.isSafeInteger(assignment.randomSeed)) fail(`${assignment.id} randomSeed must be an integer`);
}

const weekIds = new Set(config.assignments.map((item) => item.weekId));
if (!Array.isArray(config.unlockedWeekIds) || !unique(config.unlockedWeekIds) || config.unlockedWeekIds.some((id) => !weekIds.has(id))) {
  fail('unlockedWeekIds must be a unique manual subset of assignment weeks');
}

// 靜態課程設定不得出現學生姓名、學號或日期式自動解鎖欄位，避免部署時誤收個資或自行推進週次。
const serialized = JSON.stringify(config).toLowerCase();
for (const forbidden of ['studentname', 'studentid', 'email', 'unlockdate', 'coursestartdate', 'autounlock']) {
  if (serialized.includes(forbidden)) fail(`forbidden field detected: ${forbidden}`);
}

console.log(`Course config passed: ${config.releaseVersion}, ${config.rosterIds.length} roles, ${config.assignments.length} fixed assignments, ${config.unlockedWeekIds.length} manually unlocked.`);
