import { describe, expect, it } from 'vitest';
import { summarizeCourseRecordExport } from './summarize-course-record.mjs';

const completeAttempt = {
  assignmentId: 'COURSE-W01',
  missionId: 'MSN-TUT-001',
  attemptNumber: 1,
  startedAt: '2026-08-13T00:00:00.000Z',
  completedAt: '2026-08-13T00:05:00.000Z',
  randomSeed: 357101,
  decisionOrder: ['EVIDENCE_VIEWED', 'DIAGNOSIS_SELECTED'],
  hintUsedCount: 0,
  scores: {
    completion: 100,
    safety: 90,
    evidence: 80,
    time: 70,
    fatigue: 60,
    cost: 50,
    total: 78,
    grade: 'B',
  },
  studentExplanation: {
    conclusion: 'Bearing anomaly',
    evidence: 'Temperature and vibration',
    uncertainty: 'One missing sample',
    residualRisk: 'Confirm by inspection',
  },
};

describe('Course Record summary', () => {
  it('從 MISSION_SETTLED 重建 success 與 round，不讀不存在的 attempt.outcome', () => {
    const summary = summarizeCourseRecordExport({
      schemaVersion: 2,
      record: {
        schemaVersion: 2,
        integrityOrigin: 'native_v2',
        courseCode: 'NCUT-OWM-2026',
        learnerCode: 'OWM-TEST-1',
        releaseVersion: '3.58.0-course-record-integrity',
        attempts: [completeAttempt],
        events: [
          { kind: 'EVIDENCE_VIEWED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'DIAGNOSIS_SELECTED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'MISSION_SETTLED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'system', details: { success: true, round: 4 } },
        ],
      },
    });
    expect(summary.integrityPassed).toBe(true);
    expect(summary.attempts[0]).toMatchObject({ success: true, round: 4, score: 78 });
    expect(summary.authenticity).toBe('CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT');
  });

  it('缺 outcome 或不完整 Debrief 時回報 ERROR，不產生假性全綠', () => {
    const summary = summarizeCourseRecordExport({
      schemaVersion: 2,
      record: {
        schemaVersion: 2,
        integrityOrigin: 'native_v2',
        attempts: [{ ...completeAttempt, completedAt: undefined, scores: undefined, decisionOrder: [] }],
        events: [],
      },
    });
    expect(summary.integrityPassed).toBe(false);
    expect(summary.findings.map((finding) => finding.code)).toEqual(['OUTCOME_MISSING', 'EXPORT_GATE_INCOMPLETE']);
  });

  it('零 attempt 與 decisionOrder/event 不一致時不得 false-green', () => {
    const empty = summarizeCourseRecordExport({
      schemaVersion: 2,
      record: { schemaVersion: 2, integrityOrigin: 'native_v2', attempts: [], events: [] },
    });
    expect(empty.integrityPassed).toBe(false);
    expect(empty.findings).toContainEqual(expect.objectContaining({ code: 'NO_ATTEMPTS' }));

    const mismatch = summarizeCourseRecordExport({
      schemaVersion: 2,
      record: {
        schemaVersion: 2,
        integrityOrigin: 'native_v2',
        attempts: [{ ...completeAttempt, decisionOrder: [] }],
        events: [
          { kind: 'DIAGNOSIS_SELECTED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'MISSION_SETTLED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'system', details: { success: true, round: 4 } },
        ],
      },
    });
    expect(mismatch.integrityPassed).toBe(false);
    expect(mismatch.findings).toContainEqual(expect.objectContaining({ code: 'DECISION_PROVENANCE_VIOLATION' }));
  });

  it('重複 attempt identity 與重複 settlement 均不得通過 integrity check', () => {
    const summary = summarizeCourseRecordExport({
      schemaVersion: 2,
      record: {
        schemaVersion: 2,
        integrityOrigin: 'native_v2',
        attempts: [completeAttempt, { ...completeAttempt }],
        events: [
          { kind: 'EVIDENCE_VIEWED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'DIAGNOSIS_SELECTED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'MISSION_SETTLED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'system', details: { success: true, round: 4 } },
          { kind: 'MISSION_SETTLED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'system', details: { success: true, round: 4 } },
        ],
      },
    });
    expect(summary.integrityPassed).toBe(false);
    expect(summary.findings).toContainEqual(expect.objectContaining({ code: 'ATTEMPT_ID_INVALID' }));
    expect(summary.findings).toContainEqual(expect.objectContaining({ code: 'SETTLEMENT_DUPLICATE' }));
  });

  it('malformed component scores 不得通過 export integrity gate', () => {
    const summary = summarizeCourseRecordExport({
      schemaVersion: 2,
      record: {
        schemaVersion: 2,
        integrityOrigin: 'native_v2',
        attempts: [{ ...completeAttempt, scores: { total: 78, grade: 'B' } }],
        events: [
          { kind: 'EVIDENCE_VIEWED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'DIAGNOSIS_SELECTED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'MISSION_SETTLED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'system', details: { success: true, round: 4 } },
        ],
      },
    });
    expect(summary.integrityPassed).toBe(false);
    expect(summary.findings).toContainEqual(expect.objectContaining({ code: 'EXPORT_GATE_INCOMPLETE' }));
  });

  it('native v2 settlement 缺正式 provenance 或 attempt identity 時不得全綠', () => {
    const summary = summarizeCourseRecordExport({
      schemaVersion: 2,
      record: {
        schemaVersion: 2,
        integrityOrigin: 'native_v2',
        attempts: [completeAttempt],
        events: [
          { kind: 'EVIDENCE_VIEWED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'DIAGNOSIS_SELECTED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', attemptNumber: 1, context: 'assessment_runtime', actor: 'learner' },
          { kind: 'MISSION_SETTLED', assignmentId: 'COURSE-W01', missionId: 'MSN-TUT-001', context: 'practice_lab', actor: 'learner', details: { success: true, round: 4 } },
        ],
      },
    });
    expect(summary.integrityPassed).toBe(false);
    expect(summary.findings).toContainEqual(expect.objectContaining({ code: 'SETTLEMENT_PROVENANCE_INVALID' }));
    expect(summary.findings).toContainEqual(expect.objectContaining({ code: 'OUTCOME_MISSING' }));
  });

  it('空白 assignmentId 或 missionId 不得通過 summary identity gate', () => {
    const blankIdentity = { ...completeAttempt, assignmentId: '', missionId: '' };
    const summary = summarizeCourseRecordExport({
      schemaVersion: 2,
      record: {
        schemaVersion: 2,
        integrityOrigin: 'native_v2',
        attempts: [blankIdentity],
        events: [{
          kind: 'MISSION_SETTLED',
          assignmentId: '',
          missionId: '',
          attemptNumber: 1,
          context: 'assessment_runtime',
          actor: 'system',
          details: { success: true, round: 4 },
        }],
      },
    });
    expect(summary.integrityPassed).toBe(false);
    expect(summary.findings).toContainEqual(expect.objectContaining({ code: 'ATTEMPT_ID_INVALID' }));
  });

  it('legacy v1 outcome 可依 settlement 次序重建，但明確標示 provenance 未驗證', () => {
    const summary = summarizeCourseRecordExport({
      schemaVersion: 1,
      record: {
        schemaVersion: 1,
        attempts: [completeAttempt],
        events: [{ kind: 'MISSION_SETTLED', assignmentId: 'COURSE-W01', details: { success: false, round: 7 } }],
      },
    });
    expect(summary.integrityPassed).toBe(true);
    expect(summary.attempts[0]).toMatchObject({ success: false, round: 7 });
    expect(summary.findings).toContainEqual(expect.objectContaining({ severity: 'WARNING', code: 'LEGACY_PROVENANCE_UNVERIFIED' }));
  });
});
