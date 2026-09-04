import { describe, expect, it, vi } from 'vitest';
import {
  COURSE_STORAGE_KEY,
  appendCourseEvent,
  canStartCourseAttempt,
  completeCourseAttempt,
  courseRecordExportBlockReason,
  createCourseRecord,
  generateAnonymousLearnerCode,
  isCourseDebriefComplete,
  isCourseRecordExportReady,
  loadCourseRecord,
  normalizeCourseConfig,
  normalizeCourseRecord,
  saveCourseRecord,
  serializeCourseRecord,
  startCourseAttempt,
  updateCourseExplanation,
  type CourseConfig,
} from './course';

const assignment = {
  id: 'COURSE-W01',
  weekId: 'W01',
  missionId: 'MSN-TUT-001',
  titleZh: '主軸承診斷',
  titleEn: 'Main bearing diagnosis',
  teamIds: ['CHR-1', 'CHR-2', 'CHR-3'] as [string, string, string],
  equipmentId: 'EQ-1',
  spareId: 'EQ-2',
  vesselId: 'VES-1',
  randomSeed: 357101,
};

const config: CourseConfig = {
  schemaVersion: 1,
  configVersion: '2026-FALL-v1',
  releaseVersion: '3.58.0-course-record-integrity',
  frozen: true,
  courseCode: 'NCUT-OWM-2026',
  term: '2026-FALL',
  unlockedWeekIds: ['W01'],
  rosterIds: ['CHR-1', 'CHR-2', 'CHR-3'],
  assignments: [assignment],
};

const scores = {
  completion: 100,
  safety: 90,
  evidence: 80,
  time: 70,
  fatigue: 60,
  cost: 50,
  total: 78,
  grade: 'B',
};

const fullExplanation = {
  conclusion: 'Main bearing anomaly',
  evidence: 'Temperature and vibration trends',
  uncertainty: 'One missing vibration sample',
  residualRisk: 'Confirm with oil debris analysis',
};

const settleDetails = { success: true, round: 4 };

describe('Course Mode learning record', () => {
  it('正規化教師手動解鎖設定，不依日期推算', () => {
    expect(normalizeCourseConfig(config)).toEqual(config);
    expect(normalizeCourseConfig({ ...config, unlockedWeekIds: ['W01', '2026-09-01'] })?.unlockedWeekIds).toEqual(['W01']);
  });

  it('Assessment 只把 learner assessment_runtime 納入正式決策', () => {
    const started = startCourseAttempt(
      createCourseRecord(config, ' owm-a001 ', 'desktop', new Date('2026-09-01T00:00:00.000Z')),
      assignment,
      new Date('2026-09-01T00:01:00.000Z'),
    );
    const diagnosed = appendCourseEvent(started, 'DIAGNOSIS_SELECTED', { optionId: 'D1' }, {
      context: 'assessment_runtime',
      actor: 'learner',
      now: new Date('2026-09-01T00:02:00.000Z'),
    });
    const completed = completeCourseAttempt(diagnosed, scores, settleDetails, new Date('2026-09-01T00:03:00.000Z'));
    const explained = updateCourseExplanation(completed, fullExplanation);
    const exported = JSON.parse(serializeCourseRecord(explained, new Date('2026-09-01T00:04:00.000Z')));

    expect(explained.learnerCode).toBe('OWM-A001');
    expect(started.events.find((event) => event.kind === 'JSA_COMPLETED')).toMatchObject({
      context: 'assessment_runtime',
      actor: 'system',
      attemptNumber: 1,
    });
    expect(explained.attempts[0]).toMatchObject({
      randomSeed: 357101,
      decisionOrder: ['DIAGNOSIS_SELECTED'],
      hintUsedCount: 0,
      scores: { total: 78, grade: 'B' },
    });
    expect(exported).toMatchObject({
      format: 'OWM_COURSE_RECORD',
      schemaVersion: 2,
      version: '3.58.0-course-record-integrity',
      attemptCount: 1,
      hintUsage: { total: 0, assessmentPolicy: 'REC_AND_GUIDE_DISABLED' },
      integrityPolicy: {
        decisionOrder: 'LEARNER_ASSESSMENT_RUNTIME_ONLY',
        schemaEvidenceEligible: true,
        authenticity: 'CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT',
      },
    });
    expect(exported.integrityPolicy).not.toHaveProperty('formalEvidenceEligible');
    expect(exported.studentExplanations[0].conclusion).toBe(fullExplanation.conclusion);
  });

  it('保留 Practice、Guided 與 system audit events，但不污染 decisionOrder', () => {
    let record = startCourseAttempt(createCourseRecord(config, 'OWM-AUDIT-1', 'desktop'), assignment);
    record = appendCourseEvent(record, 'EVIDENCE_VIEWED', { surface: 'objectives' }, {
      context: 'assessment_runtime', actor: 'learner',
    });
    record = appendCourseEvent(record, 'LOTO_VERIFIED', { source: 'COURSE_ENGINEERING_LAB' }, {
      context: 'practice_lab', actor: 'learner',
    });
    record = appendCourseEvent(record, 'WORK_ORDER_CREATED', { source: 'assessment-debrief' }, {
      context: 'assessment_runtime', actor: 'system',
    });
    record = appendCourseEvent(record, 'HINT_USED', { target: 'recommended-skill-cta' }, {
      context: 'guided_practice', actor: 'learner',
    });
    record = appendCourseEvent(record, 'DIAGNOSIS_SELECTED', { optionId: 'D1' }, {
      context: 'assessment_runtime', actor: 'learner',
    });

    expect(record.events.map((event) => event.kind)).toContain('LOTO_VERIFIED');
    expect(record.events.map((event) => event.kind)).toContain('HINT_USED');
    expect(record.attempts[0].decisionOrder).toEqual(['EVIDENCE_VIEWED', 'DIAGNOSIS_SELECTED']);
    expect(record.attempts[0].hintUsedCount).toBe(0);
  });

  it('重玩任務增加 attempt 並加入 MISSION_REPLAYED', () => {
    const first = startCourseAttempt(createCourseRecord(config, 'OWM-A002', 'mobile'), assignment);
    const completed = updateCourseExplanation(completeCourseAttempt(first, scores, settleDetails), fullExplanation);
    const replay = startCourseAttempt(completed, assignment);
    expect(replay.attempts).toHaveLength(2);
    expect(replay.attempts[1].attemptNumber).toBe(2);
    expect(replay.events.some((event) => event.kind === 'MISSION_REPLAYED')).toBe(true);
  });

  it('匿名代碼不包含姓名或學號欄位，並可獨立保存與還原', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    const code = generateAnonymousLearnerCode(new Date('2026-09-01T00:00:00.000Z'));
    const record = createCourseRecord(config, code, 'desktop');
    saveCourseRecord(record);
    expect(values.has(COURSE_STORAGE_KEY)).toBe(true);
    expect(loadCourseRecord()?.learnerCode).toMatch(/^OWM-[A-F0-9]{4}-[A-F0-9]{4}$/);
    expect(JSON.stringify(record)).not.toContain('studentId');
    expect(JSON.stringify(record)).not.toContain('name');
  });

  it('所有 attempts 均須結算且四欄完整，serializer 亦 fail closed', () => {
    const now = new Date('2026-09-01T00:00:00.000Z');
    const empty = createCourseRecord(config, 'OWM-1111-2222', 'desktop', now);
    expect(courseRecordExportBlockReason(empty)).toBe('NO_ATTEMPTS');
    const started = startCourseAttempt(empty, assignment, now);
    expect(courseRecordExportBlockReason(started)).toBe('ATTEMPT_NOT_SETTLED');
    expect(() => serializeCourseRecord(started, now)).toThrow('ATTEMPT_NOT_SETTLED');

    const settled = completeCourseAttempt(started, scores, settleDetails, now);
    expect(isCourseDebriefComplete(settled.attempts[0])).toBe(false);
    expect(courseRecordExportBlockReason(settled)).toBe('DEBRIEF_INCOMPLETE');
    expect(() => serializeCourseRecord(settled, now)).toThrow('DEBRIEF_INCOMPLETE');
    expect(canStartCourseAttempt(settled)).toBe(false);

    const completed = updateCourseExplanation(settled, fullExplanation, now);
    expect(isCourseDebriefComplete(completed.attempts[0])).toBe(true);
    expect(isCourseRecordExportReady(completed)).toBe(true);
    expect(canStartCourseAttempt(completed)).toBe(true);

    const replay = startCourseAttempt(completed, assignment, now);
    expect(courseRecordExportBlockReason(replay)).toBe('ATTEMPT_NOT_SETTLED');
    expect(() => serializeCourseRecord(replay, now)).toThrow('ATTEMPT_NOT_SETTLED');
  });

  it('拒絕無效 settlement，且重複結算不會新增第二筆事件', () => {
    const started = startCourseAttempt(createCourseRecord(config, 'OWM-SETTLE-1', 'desktop'), assignment);
    const invalidScores = { ...scores, grade: '' };
    expect(completeCourseAttempt(started, invalidScores, settleDetails)).toBe(started);
    expect(completeCourseAttempt(started, scores, { success: true, round: 0 })).toBe(started);

    const completed = completeCourseAttempt(started, scores, settleDetails);
    const repeated = completeCourseAttempt(completed, scores, settleDetails);
    expect(repeated).toBe(completed);
    expect(completed.events.filter((event) => event.kind === 'MISSION_SETTLED')).toHaveLength(1);
  });

  it('v2 malformed scores、重複或不連續 attempt identity 均標記 invalid 並 fail closed', () => {
    const started = startCourseAttempt(createCourseRecord(config, 'OWM-ID-1', 'desktop'), assignment);
    const malformed = JSON.parse(JSON.stringify(started)) as any;
    malformed.attempts[0].scores = {};
    expect(normalizeCourseRecord(malformed)?.integrityOrigin).toBe('invalid_v2');

    const completed = updateCourseExplanation(completeCourseAttempt(started, scores, settleDetails), fullExplanation);
    const duplicate = JSON.parse(JSON.stringify(completed)) as any;
    duplicate.attempts.push({ ...duplicate.attempts[0] });
    const duplicateNormalized = normalizeCourseRecord(duplicate);
    expect(duplicateNormalized?.integrityOrigin).toBe('invalid_v2');
    expect(courseRecordExportBlockReason(duplicateNormalized!)).toBe('ATTEMPT_ID_INVALID');

    const gap = JSON.parse(JSON.stringify(completed)) as any;
    gap.attempts[0].attemptNumber = 2;
    const gapNormalized = normalizeCourseRecord(gap);
    expect(gapNormalized?.integrityOrigin).toBe('invalid_v2');
    expect(courseRecordExportBlockReason(gapNormalized!)).toBe('ATTEMPT_ID_INVALID');

    const emptyId = JSON.parse(JSON.stringify(completed)) as any;
    emptyId.attempts[0].assignmentId = '';
    expect(normalizeCourseRecord(emptyId)?.integrityOrigin).toBe('invalid_v2');
  });

  it('每個 attempt 僅允許一筆 matching MISSION_SETTLED', () => {
    const completed = updateCourseExplanation(
      completeCourseAttempt(startCourseAttempt(createCourseRecord(config, 'OWM-DUP-1', 'desktop'), assignment), scores, settleDetails),
      fullExplanation,
    );
    const duplicatedSettlement = appendCourseEvent(completed, 'MISSION_SETTLED', settleDetails, {
      context: 'assessment_runtime',
      actor: 'system',
    });
    expect(courseRecordExportBlockReason(duplicatedSettlement)).toBe('ATTEMPT_NOT_SETTLED');
    expect(() => serializeCourseRecord(duplicatedSettlement)).toThrow('ATTEMPT_NOT_SETTLED');

    const practiceSettlement = appendCourseEvent(completed, 'MISSION_SETTLED', settleDetails, {
      context: 'practice_lab',
      actor: 'learner',
    });
    expect(courseRecordExportBlockReason(practiceSettlement)).toBe('ATTEMPT_NOT_SETTLED');
  });

  it('serializer 會拒絕 mission 不一致的 settlement 與 decisionOrder tampering', () => {
    const completed = updateCourseExplanation(
      completeCourseAttempt(startCourseAttempt(createCourseRecord(config, 'OWM-PROV-1', 'desktop'), assignment), scores, settleDetails),
      fullExplanation,
    );
    const wrongMission = {
      ...completed,
      events: completed.events.map((event) => event.kind === 'MISSION_SETTLED'
        ? { ...event, missionId: 'MSN-WRONG' }
        : event),
    };
    expect(courseRecordExportBlockReason(wrongMission)).toBe('ATTEMPT_NOT_SETTLED');

    const tamperedDecision = {
      ...completed,
      attempts: completed.attempts.map((attempt) => ({ ...attempt, decisionOrder: ['EVIDENCE_VIEWED' as const] })),
    };
    expect(courseRecordExportBlockReason(tamperedDecision)).toBe('DECISION_PROVENANCE_INVALID');
    expect(normalizeCourseRecord(tamperedDecision)?.integrityOrigin).toBe('invalid_v2');
  });

  it('保守升級 legacy v1：可信 DIAG／EVIDENCE 保留，Practice／system／Guided 排除', () => {
    let record = startCourseAttempt(createCourseRecord(config, 'OWM-LEGACY-1', 'desktop'), assignment);
    record = appendCourseEvent(record, 'EVIDENCE_VIEWED', {}, { context: 'assessment_runtime', actor: 'learner' });
    record = appendCourseEvent(record, 'LOTO_VERIFIED', { source: 'COURSE_ENGINEERING_LAB' }, { context: 'practice_lab', actor: 'learner' });
    record = appendCourseEvent(record, 'HINT_USED', {}, { context: 'guided_practice', actor: 'learner' });
    record = appendCourseEvent(record, 'DIAGNOSIS_SELECTED', {}, { context: 'assessment_runtime', actor: 'learner' });
    const legacy = JSON.parse(JSON.stringify(record)) as any;
    legacy.schemaVersion = 1;
    legacy.events.forEach((event: Record<string, unknown>) => {
      delete event.context;
      delete event.actor;
      delete event.attemptNumber;
    });
    legacy.attempts[0].decisionOrder = ['JSA_COMPLETED', 'LOTO_VERIFIED', 'HINT_USED', 'EVIDENCE_VIEWED', 'DIAGNOSIS_SELECTED'];
    legacy.attempts[0].hintUsedCount = 1;

    const migrated = normalizeCourseRecord(legacy);
    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.integrityOrigin).toBe('migrated_v1');
    expect(migrated?.events).toHaveLength(record.events.length);
    expect(migrated?.events.find((event) => event.kind === 'LOTO_VERIFIED')).toMatchObject({ context: 'practice_lab', actor: 'learner' });
    expect(migrated?.events.find((event) => event.kind === 'JSA_COMPLETED')).toMatchObject({ context: 'assessment_runtime', actor: 'system' });
    expect(migrated?.events.find((event) => event.kind === 'HINT_USED')).toMatchObject({ context: 'guided_practice', actor: 'learner' });
    expect(migrated?.attempts[0].decisionOrder).toEqual(['EVIDENCE_VIEWED', 'DIAGNOSIS_SELECTED']);
    expect(migrated?.attempts[0].hintUsedCount).toBe(0);
    expect(normalizeCourseRecord({ ...legacy, schemaVersion: 3 })).toBeNull();
  });

  it('v2 event 缺少 provenance 時 fail closed，不推定為 learner evidence', () => {
    let record = startCourseAttempt(createCourseRecord(config, 'OWM-TAMPER-1', 'desktop'), assignment);
    record = appendCourseEvent(record, 'EVIDENCE_VIEWED', {}, { context: 'assessment_runtime', actor: 'learner' });
    const tampered = JSON.parse(JSON.stringify(record)) as any;
    const event = tampered.events.find((item: { kind: string }) => item.kind === 'EVIDENCE_VIEWED');
    delete event.context;
    delete event.actor;

    const normalized = normalizeCourseRecord(tampered);
    expect(normalized?.events.find((item) => item.kind === 'EVIDENCE_VIEWED')).toMatchObject({
      context: 'legacy_unknown',
      actor: 'unknown',
    });
    expect(normalized?.attempts[0].decisionOrder).toEqual([]);
    expect(normalized?.integrityOrigin).toBe('invalid_v2');
  });
});
