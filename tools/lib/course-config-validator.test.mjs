import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateCourseConfig } from './course-config-validator.mjs';

const root = path.resolve(import.meta.dirname, '..', '..');
const readJson = (...segments) => JSON.parse(readFileSync(path.join(root, ...segments), 'utf8'));
const baseConfig = () => readJson('public', 'course', 'course-config.json');
const context = () => ({
  packageVersion: readJson('package.json').version,
  missions: readJson('public', 'data', 'missions.json'),
  characters: readJson('public', 'data', 'characters.json'),
  equipment: readJson('public', 'data', 'equipment.json'),
  vessels: readJson('public', 'data', 'vessels.json'),
});
const run = (mutate) => {
  const config = baseConfig();
  mutate?.(config);
  return validateCourseConfig(config, context());
};

describe('validateCourseConfig (level mode)', () => {
  it('accepts the shipped config without errors', () => {
    expect(run().errors).toEqual([]);
  });

  it('allows any manual subset of levels, including non-contiguous ones', () => {
    const result = run((c) => { c.unlockedWeekIds = ['W03', 'W07', 'W15']; });
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('warns (does not fail) on an empty unlock list', () => {
    const result = run((c) => { c.unlockedWeekIds = []; });
    expect(result.errors).toEqual([]);
    expect(result.warnings.join(' ')).toMatch(/unlockedWeekIds is empty/);
  });

  it('warns (does not fail) on frozen=false but rejects non-boolean frozen', () => {
    const dev = run((c) => { c.frozen = false; });
    expect(dev.errors).toEqual([]);
    expect(dev.warnings.join(' ')).toMatch(/frozen=false/);
    expect(run((c) => { c.frozen = 'yes'; }).errors.join(' ')).toMatch(/frozen must be a boolean/);
  });

  it('treats term as an optional label', () => {
    expect(run((c) => { delete c.term; }).errors).toEqual([]);
    expect(run((c) => { c.term = 42; }).errors.join(' ')).toMatch(/term must be a string/);
  });

  it('requires a well-formed configVersion', () => {
    expect(run((c) => { delete c.configVersion; }).errors.join(' ')).toMatch(/configVersion/);
    expect(run((c) => { c.configVersion = 'bad version!'; }).errors.join(' ')).toMatch(/configVersion/);
    expect(run((c) => { c.configVersion = 'level-20261002-W01-W02'; }).errors).toEqual([]);
  });

  it('still blocks real configuration errors', () => {
    expect(run((c) => { c.unlockedWeekIds = ['W01', 'W01']; }).errors.join(' ')).toMatch(/unlockedWeekIds/);
    expect(run((c) => { c.unlockedWeekIds = ['W99']; }).errors.join(' ')).toMatch(/unlockedWeekIds/);
    expect(run((c) => { c.releaseVersion = '0.0.0'; }).errors.join(' ')).toMatch(/releaseVersion/);
    expect(run((c) => { c.assignments[0].missionId = 'NOPE'; }).errors.join(' ')).toMatch(/unknown mission/);
    expect(run((c) => { c.assignments[1].randomSeed = c.assignments[0].randomSeed; }).errors.join(' ')).toMatch(/random seeds/);
    expect(run((c) => { c.rosterIds = c.rosterIds.slice(0, 5); }).errors.join(' ')).toMatch(/18-24/);
    expect(run((c) => { c.autoUnlock = true; }).errors.join(' ')).toMatch(/forbidden/);
  });
});
