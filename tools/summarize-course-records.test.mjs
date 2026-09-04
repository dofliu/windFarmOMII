import { describe, expect, it } from 'vitest';
import {
  buildCourseSummary,
  canonicalJson,
  parseCourseExport,
  recordDigest,
  renderCourseSummary,
} from './summarize-course-records.mjs';
import { serializeCourseRecord, createCourseRecord, startCourseAttempt, completeCourseAttempt, updateCourseExplanation, appendCourseEvent } from '../src/domain/course.ts';
import { canonicalJson as browserCanonicalJson, digestCanonical } from '../src/domain/digest.ts';

const assignment = {
  id: 'COURSE-W01',
  weekId: 'W01',
  missionId: 'MSN-TUT-001',
  titleZh: '主軸承診斷',
  titleEn: 'Main bearing diagnosis',
  teamIds: ['CHR-1', 'CHR-2', 'CHR-3'],
  equipmentId: 'EQ-1',
  spareId: 'EQ-2',
  vesselId: 'VES-1',
  randomSeed: 357101,
};
const config = {
  schemaVersion: 1,
  configVersion: '2026-FALL-W01',
  releaseVersion: '3.58.0-course-record-integrity',
  frozen: true,
  courseCode: 'NCUT-OWM-2026',
  term: '2026-FALL',
  unlockedWeekIds: ['W01'],
  rosterIds: ['CHR-1', 'CHR-2', 'CHR-3'],
  assignments: [assignment],
};
const now = new Date('2026-09-08T01:00:00.000Z');
const scores = { completion: 100, safety: 90, evidence: 80, time: 70, fatigue: 60, cost: 50, total: 83, grade: 'A' };

function exportFor(code, { explain = true, hints = 0 } = {}) {
  let record = startCourseAttempt(createCourseRecord(config, code, 'desktop', now), assignment, now);
  record = appendCourseEvent(record, 'LOTO_VERIFIED', { assignmentId: assignment.id, source: 'COURSE_ENGINEERING_LAB', rejectedActions: 2, zeroEnergy: true }, { context: 'practice_lab', actor: 'learner', now, assignment });
  record = appendCourseEvent(record, 'WORK_ORDER_CREATED', { assignmentId: assignment.id, source: 'COURSE_ENGINEERING_LAB', rejectedActions: 0, closed: true, lifecycle: ['TRIGGER', 'ACKNOWLEDGE', 'DISPATCH', 'EXECUTE', 'VERIFY', 'CLOSE_OUT'] }, { context: 'practice_lab', actor: 'learner', now, assignment });
  for (let index = 0; index < hints; index += 1) {
    record = appendCourseEvent(record, 'HINT_USED', {}, { context: 'assessment_runtime', actor: 'learner', now, assignment });
  }
  record = completeCourseAttempt(record, scores, { success: true, round: 1 }, now);
  record = updateCourseExplanation(record, { conclusion: 'A', evidence: 'B', uncertainty: 'C', residualRisk: 'D' }, now);
  const exported = JSON.parse(serializeCourseRecord(record, now, { unlockedWeekIds: config.unlockedWeekIds, assignments: config.assignments }));
  if (!explain) {
    exported.record.attempts[0].studentExplanation = { conclusion: '', evidence: '', uncertainty: '', residualRisk: '' };
    Object.assign(exported.studentExplanations[0], exported.record.attempts[0].studentExplanation);
    exported.recordDigest = recordDigest(exported.record);
  }
  return exported;
}

describe('Course Record teacher summary', () => {
  it('shares the canonical JSON and digest rules with the browser export', () => {
    const sample = { z: [1, { b: undefined, a: 'x' }], a: null };
    expect(canonicalJson(sample)).toBe(browserCanonicalJson(sample));
    expect(recordDigest(sample)).toBe(digestCanonical(sample));
    const exported = exportFor('OWM-1A2B-3C4D');
    expect(parseCourseExport(exported, 'a.json').export.digestStatus).toBe('VERIFIED');
  });

  it('verifies digest, recomputed scores, and summary/record consistency', () => {
    const exported = exportFor('OWM-1A2B-3C4D');
    const parsed = parseCourseExport(exported, 'ok.json', { unlockedWeekIds: ['W01'], assignments: config.assignments });
    expect(parsed.ok).toBe(true);
    expect(parsed.export.attempts[0]).toMatchObject({
      weekId: 'W01',
      completed: true,
      debriefFields: 4,
      flags: [],
      lab: { lotoVerified: 1, lotoRejectedActions: 2, workOrdersClosed: 1, workOrderRejectedActions: 0 },
    });

    const tampered = JSON.parse(JSON.stringify(exported));
    tampered.record.attempts[0].scores.total = 100;
    tampered.record.attempts[0].scores.grade = 'S';
    const flagged = parseCourseExport(tampered, 'tampered.json');
    expect(flagged.ok).toBe(false);
    expect(flagged.errors.some((error) => error.startsWith('recordDigest'))).toBe(true);
    expect(flagged.errors.some((error) => error.includes('scores invalid'))).toBe(true);
    expect(flagged.errors.some((error) => error.startsWith('componentScores[0]'))).toBe(true);

    const consistentForgery = JSON.parse(JSON.stringify(exported));
    consistentForgery.record.attempts[0].studentExplanation.conclusion = 'edited';
    consistentForgery.studentExplanations[0].conclusion = 'edited';
    const forged = parseCourseExport(consistentForgery, 'forged.json');
    expect(forged.ok).toBe(false);
    expect(forged.errors).toEqual(['recordDigest does not match the embedded record (edited after export).']);
  });

  it('flags ahead-of-release attempts, incomplete debriefs, hints, and non-standard codes', () => {
    const early = parseCourseExport(exportFor('OWM-1A2B-3C4D', { explain: false, hints: 1 }), 'early.json', { unlockedWeekIds: [] });
    expect(early.ok).toBe(true);
    expect(early.export.attempts[0].flags).toEqual(['DEBRIEF_INCOMPLETE', 'HINT_USED', 'WEEK_NOT_IN_CURRENT_CONFIG']);
    const named = parseCourseExport(exportFor('JOHNSMITH'), 'named.json');
    expect(named.ok).toBe(true);
    expect(named.warnings[0]).toContain('not in OWM-XXXX-XXXX form');
    const legacy = exportFor('OWM-AAAA-BBBB');
    delete legacy.recordDigest;
    expect(parseCourseExport(legacy, 'legacy.json').export.digestStatus).toBe('MISSING');
  });

  it('builds a learner × week summary, keeps the latest export per code, and renders markdown', () => {
    const first = exportFor('OWM-1A2B-3C4D');
    const later = { ...exportFor('OWM-1A2B-3C4D'), exportedAt: '2026-09-09T01:00:00.000Z' };
    const other = exportFor('OWM-9999-0000', { explain: false });
    const summary = buildCourseSummary([
      parseCourseExport(first, 'first.json'),
      parseCourseExport(later, 'later.json'),
      parseCourseExport(other, 'other.json'),
      { ok: false, sourceFile: 'broken.json', errors: ['Unreadable JSON: x'], warnings: [] },
    ], { now, unlockedWeekIds: ['W01'], courseCode: 'NCUT-OWM-2026' });
    expect(summary.learners.map((learner) => learner.learnerCode)).toEqual(['OWM-1A2B-3C4D', 'OWM-9999-0000']);
    expect(summary.learners[0]).toMatchObject({ sourceFile: 'later.json', supersededFiles: ['first.json'] });
    expect(summary.byWeek).toEqual([{ weekId: 'W01', learners: 2, attempts: 2, settled: 2, debriefComplete: 1, averageTotal: 83 }]);
    expect(summary.integrity).toMatchObject({ files: 4, valid: 3, invalid: 1, digestVerified: 3, scoreMismatch: 0 });
    expect(summary.allVerified).toBe(false);
    const markdown = renderCourseSummary(summary);
    expect(markdown).toContain('| OWM-9999-0000 | W01 | MSN-TUT-001 | 1 | 2026-FALL-W01 | 2026-09-08 01:00 | A · 83 | 0/4 | 0 | 0 | 1 (2) | 1 (0) | VERIFIED | DEBRIEF_INCOMPLETE |');
    expect(markdown).toContain('older export `first.json` superseded by `later.json`');
    expect(markdown).toContain('Status: **REVIEW FLAGS**');
  });
});
