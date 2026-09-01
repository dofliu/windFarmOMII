import { publicAssetUrl } from './assets';
import type { GameDatabase } from './types';

export const COURSE_STORAGE_KEY = 'owm.course.v1';
export const COURSE_RECORD_FORMAT = 'OWM_COURSE_RECORD';
export const COURSE_RELEASE = '3.57.1-course-mode-p0';

export type CoursePlatform = 'desktop' | 'mobile';
export type CourseEventKind =
  | 'MODE_SELECTED'
  | 'MISSION_DEPLOYED'
  | 'DIAGNOSIS_SELECTED'
  | 'EVIDENCE_VIEWED'
  | 'HINT_USED'
  | 'JSA_COMPLETED'
  | 'LOTO_VERIFIED'
  | 'WORK_ORDER_CREATED'
  | 'MISSION_REPLAYED'
  | 'MISSION_SETTLED'
  | 'DEBRIEF_EXPORTED';

export interface CourseAssignment {
  id: string;
  weekId: string;
  missionId: string;
  titleZh: string;
  titleEn: string;
  teamIds: [string, string, string];
  equipmentId: string;
  spareId: string;
  vesselId: string;
  randomSeed: number;
}

export interface CourseConfig {
  schemaVersion: 1;
  configVersion: string;
  releaseVersion: string;
  frozen: boolean;
  courseCode: string;
  term: string;
  unlockedWeekIds: string[];
  rosterIds: string[];
  assignments: CourseAssignment[];
}

export interface CourseEvent {
  sequence: number;
  recordedAt: string;
  kind: CourseEventKind;
  assignmentId?: string;
  missionId?: string;
  details: Record<string, unknown>;
}

export interface CourseComponentScores {
  completion: number;
  safety: number;
  evidence: number;
  time: number;
  fatigue: number;
  cost: number;
  total: number;
  grade: string;
}

export interface CourseStudentExplanation {
  conclusion: string;
  evidence: string;
  uncertainty: string;
  residualRisk: string;
}

export interface CourseAttempt {
  assignmentId: string;
  missionId: string;
  attemptNumber: number;
  randomSeed: number;
  // 每個 attempt 快照當下的 configVersion:教師每週解鎖會改版本,紀錄不因此重建。
  configVersion?: string;
  startedAt: string;
  completedAt?: string;
  decisionOrder: CourseEventKind[];
  hintUsedCount: number;
  scores?: CourseComponentScores;
  studentExplanation: CourseStudentExplanation;
}

export interface CourseRecord {
  schemaVersion: 1;
  releaseVersion: string;
  configVersion: string;
  courseCode: string;
  learnerCode: string;
  platform: CoursePlatform;
  mode: 'assessment';
  createdAt: string;
  updatedAt: string;
  activeAssignmentId?: string;
  events: CourseEvent[];
  attempts: CourseAttempt[];
}

const EVENT_KINDS: CourseEventKind[] = [
  'MODE_SELECTED',
  'MISSION_DEPLOYED',
  'DIAGNOSIS_SELECTED',
  'EVIDENCE_VIEWED',
  'HINT_USED',
  'JSA_COMPLETED',
  'LOTO_VERIFIED',
  'WORK_ORDER_CREATED',
  'MISSION_REPLAYED',
  'MISSION_SETTLED',
  'DEBRIEF_EXPORTED',
];

const DECISION_KINDS = new Set<CourseEventKind>([
  'DIAGNOSIS_SELECTED',
  'EVIDENCE_VIEWED',
  'HINT_USED',
  'JSA_COMPLETED',
  'LOTO_VERIFIED',
  'WORK_ORDER_CREATED',
]);

const emptyExplanation = (): CourseStudentExplanation => ({
  conclusion: '',
  evidence: '',
  uncertainty: '',
  residualRisk: '',
});

export function normalizeCourseCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
}

export function normalizeLearnerCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);
}

export function generateAnonymousLearnerCode(now = new Date()): string {
  const bytes = new Uint8Array(4);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    const stamp = now.getTime();
    bytes.forEach((_, index) => { bytes[index] = (stamp >> (index * 8)) & 0xff; });
  }
  const suffix = [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `OWM-${suffix.slice(0, 4)}-${suffix.slice(4)}`;
}

export function normalizeCourseConfig(value: unknown, database?: GameDatabase): CourseConfig | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<CourseConfig>;
  if (candidate.schemaVersion !== 1 || !Array.isArray(candidate.assignments) || !Array.isArray(candidate.rosterIds)) return null;
  const courseCode = normalizeCourseCode(candidate.courseCode ?? '');
  if (!courseCode || typeof candidate.configVersion !== 'string' || typeof candidate.releaseVersion !== 'string') return null;
  const unlockedWeekIds = Array.isArray(candidate.unlockedWeekIds)
    ? [...new Set(candidate.unlockedWeekIds.filter((item): item is string => typeof item === 'string' && /^W\d{2}$/.test(item)))]
    : [];
  const rosterIds = [...new Set(candidate.rosterIds.filter((item): item is string => typeof item === 'string'))];
  const assignments = candidate.assignments.flatMap((item): CourseAssignment[] => {
    if (!item || typeof item !== 'object') return [];
    const assignment = item as Partial<CourseAssignment>;
    if (
      typeof assignment.id !== 'string'
      || !/^W\d{2}$/.test(assignment.weekId ?? '')
      || typeof assignment.missionId !== 'string'
      || typeof assignment.titleZh !== 'string'
      || typeof assignment.titleEn !== 'string'
      || !Array.isArray(assignment.teamIds)
      || assignment.teamIds.length !== 3
      || new Set(assignment.teamIds).size !== 3
      || assignment.teamIds.some((id) => typeof id !== 'string')
      || typeof assignment.equipmentId !== 'string'
      || typeof assignment.spareId !== 'string'
      || typeof assignment.vesselId !== 'string'
      || !Number.isSafeInteger(assignment.randomSeed)
    ) return [];
    return [{
      id: assignment.id,
      weekId: assignment.weekId!,
      missionId: assignment.missionId,
      titleZh: assignment.titleZh,
      titleEn: assignment.titleEn,
      teamIds: assignment.teamIds as [string, string, string],
      equipmentId: assignment.equipmentId,
      spareId: assignment.spareId,
      vesselId: assignment.vesselId,
      randomSeed: assignment.randomSeed!,
    }];
  });
  if (assignments.length !== candidate.assignments.length || new Set(assignments.map((item) => item.id)).size !== assignments.length) return null;
  if (database) {
    if (rosterIds.some((id) => !database.characterById.has(id))) return null;
    for (const assignment of assignments) {
      if (
        !database.missionById.has(assignment.missionId)
        || assignment.teamIds.some((id) => !database.characterById.has(id) || !rosterIds.includes(id))
        || !database.equipmentById.has(assignment.equipmentId)
        || !database.equipmentById.has(assignment.spareId)
        || !database.vesselById.has(assignment.vesselId)
      ) return null;
    }
  }
  return {
    schemaVersion: 1,
    configVersion: candidate.configVersion,
    releaseVersion: candidate.releaseVersion,
    frozen: candidate.frozen === true,
    courseCode,
    term: typeof candidate.term === 'string' ? candidate.term.slice(0, 48) : '',
    unlockedWeekIds,
    rosterIds,
    assignments,
  };
}

export async function loadCourseConfig(database?: GameDatabase): Promise<CourseConfig> {
  const response = await fetch(publicAssetUrl('course/course-config.json'), { cache: 'no-store' });
  if (!response.ok) throw new Error(`Course config load failed (${response.status})`);
  const config = normalizeCourseConfig(await response.json(), database);
  if (!config) throw new Error('Course config is invalid or references unknown game data.');
  return config;
}

export function unlockedCourseAssignments(config: CourseConfig): CourseAssignment[] {
  return config.assignments.filter((assignment) => config.unlockedWeekIds.includes(assignment.weekId));
}

export function createCourseRecord(
  config: CourseConfig,
  learnerCode: string,
  platform: CoursePlatform,
  now = new Date(),
): CourseRecord {
  const normalized = normalizeLearnerCode(learnerCode);
  if (!normalized) throw new Error('Anonymous learner code is required.');
  const timestamp = now.toISOString();
  return appendCourseEvent({
    schemaVersion: 1,
    releaseVersion: config.releaseVersion,
    configVersion: config.configVersion,
    courseCode: config.courseCode,
    learnerCode: normalized,
    platform,
    mode: 'assessment',
    createdAt: timestamp,
    updatedAt: timestamp,
    events: [],
    attempts: [],
  }, 'MODE_SELECTED', { mode: 'assessment', hints: 'disabled' }, now);
}

export function startCourseAttempt(
  record: CourseRecord,
  assignment: CourseAssignment,
  now = new Date(),
): CourseRecord {
  const attemptNumber = record.attempts.filter((attempt) => attempt.assignmentId === assignment.id).length + 1;
  const attempt: CourseAttempt = {
    assignmentId: assignment.id,
    missionId: assignment.missionId,
    attemptNumber,
    randomSeed: assignment.randomSeed,
    configVersion: record.configVersion,
    startedAt: now.toISOString(),
    decisionOrder: [],
    hintUsedCount: 0,
    studentExplanation: emptyExplanation(),
  };
  let next: CourseRecord = {
    ...record,
    activeAssignmentId: assignment.id,
    attempts: [...record.attempts, attempt],
    updatedAt: now.toISOString(),
  };
  if (attemptNumber > 1) {
    next = appendCourseEvent(next, 'MISSION_REPLAYED', { attemptNumber }, now, assignment);
  }
  next = appendCourseEvent(next, 'JSA_COMPLETED', {
    fixedPreflight: true,
    checks: ['permit', 'ppe', 'access', 'vessel', 'qualifiedCrew'],
  }, now, assignment);
  return appendCourseEvent(next, 'MISSION_DEPLOYED', {
    attemptNumber,
    teamIds: assignment.teamIds,
    equipmentId: assignment.equipmentId,
    spareId: assignment.spareId,
    vesselId: assignment.vesselId,
    randomSeed: assignment.randomSeed,
  }, now, assignment);
}

export function appendCourseEvent(
  record: CourseRecord,
  kind: CourseEventKind,
  details: Record<string, unknown> = {},
  now = new Date(),
  assignment?: CourseAssignment,
): CourseRecord {
  const activeAssignmentId = assignment?.id ?? record.activeAssignmentId;
  const activeAttemptIndex = [...record.attempts].reverse().findIndex((attempt) => attempt.assignmentId === activeAssignmentId);
  const resolvedAttemptIndex = activeAttemptIndex < 0 ? -1 : record.attempts.length - 1 - activeAttemptIndex;
  const attempts = record.attempts.map((attempt, index) => {
    if (index !== resolvedAttemptIndex) return attempt;
    return {
      ...attempt,
      decisionOrder: DECISION_KINDS.has(kind) ? [...attempt.decisionOrder, kind] : attempt.decisionOrder,
      hintUsedCount: kind === 'HINT_USED' ? attempt.hintUsedCount + 1 : attempt.hintUsedCount,
    };
  });
  const event: CourseEvent = {
    sequence: record.events.length + 1,
    recordedAt: now.toISOString(),
    kind,
    assignmentId: assignment?.id ?? activeAssignmentId,
    missionId: assignment?.missionId ?? attempts[resolvedAttemptIndex]?.missionId,
    details,
  };
  return {
    ...record,
    updatedAt: now.toISOString(),
    attempts,
    events: [...record.events, event],
  };
}

export function completeCourseAttempt(
  record: CourseRecord,
  scores: CourseComponentScores,
  details: Record<string, unknown> = {},
  now = new Date(),
): CourseRecord {
  const index = [...record.attempts].reverse().findIndex((attempt) => attempt.assignmentId === record.activeAssignmentId);
  if (index < 0) return record;
  const attemptIndex = record.attempts.length - 1 - index;
  const attempts = record.attempts.map((attempt, currentIndex) => currentIndex === attemptIndex
    ? { ...attempt, completedAt: now.toISOString(), scores }
    : attempt);
  return appendCourseEvent({ ...record, attempts }, 'MISSION_SETTLED', { ...details, scores }, now);
}

export function updateCourseExplanation(
  record: CourseRecord,
  explanation: Partial<CourseStudentExplanation>,
  now = new Date(),
): CourseRecord {
  const index = [...record.attempts].reverse().findIndex((attempt) => attempt.assignmentId === record.activeAssignmentId);
  if (index < 0) return record;
  const attemptIndex = record.attempts.length - 1 - index;
  return {
    ...record,
    updatedAt: now.toISOString(),
    attempts: record.attempts.map((attempt, currentIndex) => currentIndex === attemptIndex
      ? {
          ...attempt,
          studentExplanation: Object.fromEntries(Object.entries({
            ...attempt.studentExplanation,
            ...explanation,
          }).map(([key, value]) => [key, String(value).slice(0, 4000)])) as unknown as CourseStudentExplanation,
        }
      : attempt),
  };
}

export function isCourseDebriefComplete(attempt: CourseAttempt | undefined): boolean {
  if (!attempt?.completedAt) return false;
  return Object.values(attempt.studentExplanation).every((value) => value.trim().length > 0);
}

export function normalizeCourseRecord(value: unknown): CourseRecord | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<CourseRecord>;
  if (
    candidate.schemaVersion !== 1
    || candidate.mode !== 'assessment'
    || (candidate.platform !== 'desktop' && candidate.platform !== 'mobile')
    || typeof candidate.createdAt !== 'string'
    || typeof candidate.updatedAt !== 'string'
    || !Array.isArray(candidate.events)
    || !Array.isArray(candidate.attempts)
  ) return null;
  const learnerCode = normalizeLearnerCode(candidate.learnerCode ?? '');
  const courseCode = normalizeCourseCode(candidate.courseCode ?? '');
  if (!learnerCode || !courseCode) return null;
  const events = candidate.events.slice(0, 5000).flatMap((item, index): CourseEvent[] => {
    if (!item || typeof item !== 'object') return [];
    const event = item as Partial<CourseEvent>;
    if (!EVENT_KINDS.includes(event.kind as CourseEventKind) || typeof event.recordedAt !== 'string') return [];
    return [{
      sequence: index + 1,
      recordedAt: event.recordedAt,
      kind: event.kind as CourseEventKind,
      assignmentId: typeof event.assignmentId === 'string' ? event.assignmentId : undefined,
      missionId: typeof event.missionId === 'string' ? event.missionId : undefined,
      details: event.details && typeof event.details === 'object' && !Array.isArray(event.details)
        ? event.details as Record<string, unknown>
        : {},
    }];
  });
  const attempts = candidate.attempts.flatMap((item): CourseAttempt[] => {
    if (!item || typeof item !== 'object') return [];
    const attempt = item as Partial<CourseAttempt>;
    if (
      typeof attempt.assignmentId !== 'string'
      || typeof attempt.missionId !== 'string'
      || !Number.isInteger(attempt.attemptNumber)
      || !Number.isSafeInteger(attempt.randomSeed)
      || typeof attempt.startedAt !== 'string'
    ) return [];
    const rawExplanation = attempt.studentExplanation ?? emptyExplanation();
    return [{
      assignmentId: attempt.assignmentId,
      missionId: attempt.missionId,
      attemptNumber: attempt.attemptNumber!,
      randomSeed: attempt.randomSeed!,
      configVersion: typeof attempt.configVersion === 'string' ? attempt.configVersion : undefined,
      startedAt: attempt.startedAt,
      completedAt: typeof attempt.completedAt === 'string' ? attempt.completedAt : undefined,
      decisionOrder: Array.isArray(attempt.decisionOrder)
        ? attempt.decisionOrder.filter((kind): kind is CourseEventKind => EVENT_KINDS.includes(kind as CourseEventKind))
        : [],
      hintUsedCount: Number.isInteger(attempt.hintUsedCount) ? Math.max(0, attempt.hintUsedCount!) : 0,
      scores: attempt.scores,
      studentExplanation: {
        conclusion: String(rawExplanation.conclusion ?? '').slice(0, 4000),
        evidence: String(rawExplanation.evidence ?? '').slice(0, 4000),
        uncertainty: String(rawExplanation.uncertainty ?? '').slice(0, 4000),
        residualRisk: String(rawExplanation.residualRisk ?? '').slice(0, 4000),
      },
    }];
  });
  return {
    schemaVersion: 1,
    releaseVersion: typeof candidate.releaseVersion === 'string' ? candidate.releaseVersion : COURSE_RELEASE,
    configVersion: typeof candidate.configVersion === 'string' ? candidate.configVersion : 'unknown',
    courseCode,
    learnerCode,
    platform: candidate.platform,
    mode: 'assessment',
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    activeAssignmentId: typeof candidate.activeAssignmentId === 'string' ? candidate.activeAssignmentId : undefined,
    events,
    attempts,
  };
}

export function loadCourseRecord(): CourseRecord | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COURSE_STORAGE_KEY);
    return normalizeCourseRecord(raw ? JSON.parse(raw) : null);
  } catch {
    return null;
  }
}

export function saveCourseRecord(record: CourseRecord | null): void {
  if (typeof localStorage === 'undefined') return;
  if (!record) {
    localStorage.removeItem(COURSE_STORAGE_KEY);
    return;
  }
  localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(record));
}

export function serializeCourseRecord(record: CourseRecord, now = new Date()): string {
  return JSON.stringify({
    format: COURSE_RECORD_FORMAT,
    schemaVersion: 1,
    exportedAt: now.toISOString(),
    version: record.releaseVersion,
    courseCode: record.courseCode,
    learnerCode: record.learnerCode,
    mode: record.mode,
    configVersion: record.configVersion,
    missions: [...new Set(record.attempts.map((attempt) => attempt.missionId))],
    attemptCount: record.attempts.length,
    decisionOrder: record.attempts.map((attempt) => ({
      missionId: attempt.missionId,
      attemptNumber: attempt.attemptNumber,
      decisions: attempt.decisionOrder,
    })),
    hintUsage: {
      total: record.attempts.reduce((total, attempt) => total + attempt.hintUsedCount, 0),
      assessmentPolicy: 'REC_AND_GUIDE_DISABLED',
    },
    componentScores: record.attempts.map((attempt) => ({
      missionId: attempt.missionId,
      attemptNumber: attempt.attemptNumber,
      scores: attempt.scores ?? null,
    })),
    studentExplanations: record.attempts.map((attempt) => ({
      missionId: attempt.missionId,
      attemptNumber: attempt.attemptNumber,
      ...attempt.studentExplanation,
    })),
    record,
  }, null, 2);
}
