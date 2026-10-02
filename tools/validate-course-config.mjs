import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { validateCourseConfig } from './lib/course-config-validator.mjs';

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
