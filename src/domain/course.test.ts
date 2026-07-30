import { describe, expect, it, vi } from 'vitest';
import {
  COURSE_STORAGE_KEY,
  appendCourseEvent,
  completeCourseAttempt,
  createCourseRecord,
  generateAnonymousLearnerCode,
  isCourseDebriefComplete,
  loadCourseRecord,
  normalizeCourseConfig,
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
  releaseVersion: '3.57.1-course-mode-p0',
  frozen: true,
  courseCode: 'NCUT-OWM-2026',
  term: '2026-FALL',
  unlockedWeekIds: ['W01'],
  rosterIds: ['CHR-1', 'CHR-2', 'CHR-3'],
  assignments: [assignment],
};

describe('Course Mode learning record', () => {
  it('正規化教師手動解鎖設定，不依日期推算', () => {
    expect(normalizeCourseConfig(config)).toEqual(config);
    expect(normalizeCourseConfig({ ...config, unlockedWeekIds: ['W01', '2026-09-01'] })?.unlockedWeekIds).toEqual(['W01']);
  });

  it('Assessment 固定配置並記錄決策順序、提示數與分項分數', () => {
    const started = startCourseAttempt(
      createCourseRecord(config, ' owm-a001 ', 'desktop', new Date('2026-09-01T00:00:00.000Z')),
      assignment,
      new Date('2026-09-01T00:01:00.000Z'),
    );
    const diagnosed = appendCourseEvent(started, 'DIAGNOSIS_SELECTED', { optionId: 'D1' }, new Date('2026-09-01T00:02:00.000Z'));
    const completed = completeCourseAttempt(diagnosed, {
      completion: 100,
      safety: 90,
      evidence: 80,
      time: 70,
      fatigue: 60,
      cost: 50,
      total: 78,
      grade: 'B',
    }, {}, new Date('2026-09-01T00:03:00.000Z'));
    const explained = updateCourseExplanation(completed, { conclusion: '需停機檢查主軸承。', evidence: '溫升與振動同時異常。' });
    const exported = JSON.parse(serializeCourseRecord(explained, new Date('2026-09-01T00:04:00.000Z')));

    expect(explained.learnerCode).toBe('OWM-A001');
    expect(explained.attempts[0]).toMatchObject({
      randomSeed: 357101,
      decisionOrder: ['JSA_COMPLETED', 'DIAGNOSIS_SELECTED'],
      hintUsedCount: 0,
      scores: { total: 78, grade: 'B' },
    });
    expect(exported).toMatchObject({
      format: 'OWM_COURSE_RECORD',
      version: '3.57.1-course-mode-p0',
      attemptCount: 1,
      hintUsage: { total: 0, assessmentPolicy: 'REC_AND_GUIDE_DISABLED' },
    });
    expect(exported.studentExplanations[0].conclusion).toBe('需停機檢查主軸承。');
  });

  it('重玩任務增加 attempt 並加入 MISSION_REPLAYED', () => {
    const first = startCourseAttempt(createCourseRecord(config, 'OWM-A002', 'mobile'), assignment);
    const replay = startCourseAttempt(first, assignment);
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

  it('requires all four engineering explanation fields before a completed debrief is export-ready', () => {
    const now = new Date('2026-09-01T00:00:00.000Z');
    const record = completeCourseAttempt(
      startCourseAttempt(createCourseRecord(config, 'OWM-1111-2222', 'desktop', now), assignment, now),
      {
        completion: 100,
        safety: 90,
        evidence: 80,
        time: 70,
        fatigue: 60,
        cost: 50,
        total: 78,
        grade: 'B',
      },
      {},
      now,
    );
    expect(isCourseDebriefComplete(record.attempts[0])).toBe(false);
    const completed = updateCourseExplanation(record, {
      conclusion: 'Main bearing anomaly',
      evidence: 'Temperature and vibration trends',
      uncertainty: 'One missing vibration sample',
      residualRisk: 'Confirm with oil debris analysis',
    }, now);
    expect(isCourseDebriefComplete(completed.attempts[0])).toBe(true);
  });
});
