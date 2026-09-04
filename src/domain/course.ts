import { publicAssetUrl } from './assets';
import { digestCanonical } from './digest.ts';
import { DEBRIEF_SCORE_COMPONENTS, debriefGrade, debriefTotalScore } from './scoring.ts';
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from './storage.ts';
import type { GameDatabase } from './types';

export const COURSE_STORAGE_KEY = 'owm.course.v1';
export const COURSE_RECORD_FORMAT = 'OWM_COURSE_RECORD';
export const COURSE_RELEASE = '3.59.0-student-quick-start';

export type CoursePlatform = 'desktop' | 'mobile';
export type CourseEventContext = 'assessment_runtime' | 'practice_lab' | 'guided_practice' | 'system' | 'legacy_unknown';
export type CourseEventActor = 'learner' | 'system' | 'instructor' | 'unknown';
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
  context: CourseEventContext;
  actor: CourseEventActor;
  assignmentId?: string;
  missionId?: string;
  attemptNumber?: number;
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
  // 週次快照：匯出摘要不必再由教師以 assignmentId 反查 config。
  weekId?: string;
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
  schemaVersion: 2;
  integrityOrigin: 'native_v2' | 'migrated_v1' | 'invalid_v2' | 'unknown';
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

const EVENT_CONTEXTS: CourseEventContext[] = [
  'assessment_runtime',
  'practice_lab',
  'guided_practice',
  'system',
  'legacy_unknown',
];

const EVENT_ACTORS: CourseEventActor[] = ['learner', 'system', 'instructor', 'unknown'];

const DECISION_KINDS = new Set<CourseEventKind>([
  'DIAGNOSIS_SELECTED',
  'EVIDENCE_VIEWED',
  'HINT_USED',
  'JSA_COMPLETED',
  'LOTO_VERIFIED',
  'WORK_ORDER_CREATED',
]);

export interface AppendCourseEventOptions {
  context: CourseEventContext;
  actor: CourseEventActor;
  now?: Date;
  assignment?: CourseAssignment;
}

export type CourseExportBlockReason = 'NO_ATTEMPTS' | 'ATTEMPT_ID_INVALID' | 'DECISION_PROVENANCE_INVALID' | 'ATTEMPT_NOT_SETTLED' | 'DEBRIEF_INCOMPLETE';

const isFormalAssessmentDecision = (
  kind: CourseEventKind,
  context: CourseEventContext,
  actor: CourseEventActor,
): boolean => DECISION_KINDS.has(kind) && context === 'assessment_runtime' && actor === 'learner';

const legacyEventProvenance = (
  kind: CourseEventKind,
  details: Record<string, unknown>,
): Pick<CourseEvent, 'context' | 'actor'> => {
  if (kind === 'DIAGNOSIS_SELECTED' || kind === 'EVIDENCE_VIEWED') {
    return { context: 'assessment_runtime', actor: 'learner' };
  }
  if (kind === 'HINT_USED') return { context: 'guided_practice', actor: 'learner' };
  if (kind === 'LOTO_VERIFIED' || kind === 'WORK_ORDER_CREATED') {
    return details.source === 'COURSE_ENGINEERING_LAB'
      ? { context: 'practice_lab', actor: 'learner' }
      : { context: 'assessment_runtime', actor: 'system' };
  }
  if (kind === 'JSA_COMPLETED' || kind === 'MISSION_DEPLOYED' || kind === 'MISSION_REPLAYED' || kind === 'MISSION_SETTLED') {
    return { context: 'assessment_runtime', actor: 'system' };
  }
  if (kind === 'DEBRIEF_EXPORTED') return { context: 'system', actor: 'learner' };
  if (kind === 'MODE_SELECTED') return { context: 'system', actor: 'system' };
  return { context: 'legacy_unknown', actor: 'unknown' };
};

export const LEARNER_CODE_PATTERN = /^OWM-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * scores 是 normalize 時唯一不驗證的欄位（OPS review B2）：六個分項各自檢查範圍，
 * total 與 grade 一律由分項重算，DevTools 改成 `{ total: 100, grade: 'S' }` 不會存活。
 */
export function normalizeCourseScores(value: unknown): CourseComponentScores | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const candidate = value as Record<string, unknown>;
  const components = {} as Record<(typeof DEBRIEF_SCORE_COMPONENTS)[number], number>;
  for (const key of DEBRIEF_SCORE_COMPONENTS) {
    const component = candidate[key];
    if (typeof component !== 'number' || !Number.isFinite(component) || component < 0 || component > 100) return undefined;
    components[key] = component;
  }
  const total = debriefTotalScore(components);
  return { ...components, total, grade: debriefGrade(total) };
}

export function courseRecordDigest(record: CourseRecord): string {
  return digestCanonical(record);
}

const emptyExplanation = (): CourseStudentExplanation => ({
  conclusion: '',
  evidence: '',
  uncertainty: '',
  residualRisk: '',
});

const hasValidAttemptIdentitySequence = (attempts: CourseAttempt[]): boolean => {
  const seen = new Set<string>();
  const latestByAssignment = new Map<string, number>();
  for (const attempt of attempts) {
    if (
      !attempt.assignmentId.trim()
      || !attempt.missionId.trim()
      || !Number.isInteger(attempt.attemptNumber)
      || attempt.attemptNumber <= 0
    ) return false;
    const key = `${attempt.assignmentId}::${attempt.attemptNumber}`;
    if (seen.has(key)) return false;
    seen.add(key);
    const expected = (latestByAssignment.get(attempt.assignmentId) ?? 0) + 1;
    if (attempt.attemptNumber !== expected) return false;
    latestByAssignment.set(attempt.assignmentId, attempt.attemptNumber);
  }
  return true;
};

const hasValidDecisionProvenance = (record: CourseRecord): boolean => {
  const formalEvents = record.events.filter((event) => (
    isFormalAssessmentDecision(event.kind, event.context, event.actor)
  ));
  if (formalEvents.some((event) => record.attempts.filter((attempt) => (
    event.assignmentId === attempt.assignmentId
    && event.missionId === attempt.missionId
    && event.attemptNumber === attempt.attemptNumber
  )).length !== 1)) return false;
  return record.attempts.every((attempt) => {
    const attemptEvents = formalEvents.filter((event) => (
      event.assignmentId === attempt.assignmentId
      && event.missionId === attempt.missionId
      && event.attemptNumber === attempt.attemptNumber
    ));
    const expectedOrder = attemptEvents.map((event) => event.kind);
    const expectedHints = attemptEvents.filter((event) => event.kind === 'HINT_USED').length;
    return attemptEvents.filter((event) => event.kind === 'DIAGNOSIS_SELECTED').length <= 1
      && JSON.stringify(attempt.decisionOrder) === JSON.stringify(expectedOrder)
      && Number.isInteger(attempt.hintUsedCount)
      && attempt.hintUsedCount === expectedHints;
  });
};

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
    schemaVersion: 2,
    integrityOrigin: 'native_v2',
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
  }, 'MODE_SELECTED', { mode: 'assessment', hints: 'disabled' }, {
    context: 'system',
    actor: 'system',
    now,
  });
}

export function startCourseAttempt(
  record: CourseRecord,
  assignment: CourseAssignment,
  now = new Date(),
): CourseRecord {
  if (!canStartCourseAttempt(record)) return record;
  const attemptNumber = record.attempts.filter((attempt) => attempt.assignmentId === assignment.id).length + 1;
  const attempt: CourseAttempt = {
    assignmentId: assignment.id,
    weekId: assignment.weekId,
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
    next = appendCourseEvent(next, 'MISSION_REPLAYED', { attemptNumber }, {
      context: 'assessment_runtime',
      actor: 'system',
      now,
      assignment,
    });
  }
  next = appendCourseEvent(next, 'JSA_COMPLETED', {
    fixedPreflight: true,
    completionBasis: 'SYSTEM_FIXED_PRECHECK',
    learnerAction: false,
    checks: ['permit', 'ppe', 'access', 'vessel', 'qualifiedCrew'],
  }, {
    context: 'assessment_runtime',
    actor: 'system',
    now,
    assignment,
  });
  return appendCourseEvent(next, 'MISSION_DEPLOYED', {
    attemptNumber,
    teamIds: assignment.teamIds,
    equipmentId: assignment.equipmentId,
    spareId: assignment.spareId,
    vesselId: assignment.vesselId,
    randomSeed: assignment.randomSeed,
  }, {
    context: 'assessment_runtime',
    actor: 'system',
    now,
    assignment,
  });
}

export function appendCourseEvent(
  record: CourseRecord,
  kind: CourseEventKind,
  details: Record<string, unknown> = {},
  options: AppendCourseEventOptions,
): CourseRecord {
  const now = options.now ?? new Date();
  const assignment = options.assignment;
  const activeAssignmentId = assignment?.id ?? record.activeAssignmentId;
  const activeAttemptIndex = [...record.attempts].reverse().findIndex((attempt) => attempt.assignmentId === activeAssignmentId);
  const resolvedAttemptIndex = activeAttemptIndex < 0 ? -1 : record.attempts.length - 1 - activeAttemptIndex;
  const attempts = record.attempts.map((attempt, index) => {
    if (index !== resolvedAttemptIndex) return attempt;
    return {
      ...attempt,
      decisionOrder: isFormalAssessmentDecision(kind, options.context, options.actor)
        ? [...attempt.decisionOrder, kind]
        : attempt.decisionOrder,
      hintUsedCount: kind === 'HINT_USED' && options.context === 'assessment_runtime' && options.actor === 'learner'
        ? attempt.hintUsedCount + 1
        : attempt.hintUsedCount,
    };
  });
  const activeAttempt = attempts[resolvedAttemptIndex];
  const event: CourseEvent = {
    sequence: record.events.length + 1,
    recordedAt: now.toISOString(),
    kind,
    context: options.context,
    actor: options.actor,
    assignmentId: assignment?.id ?? activeAssignmentId,
    missionId: assignment?.missionId ?? activeAttempt?.missionId,
    attemptNumber: options.context === 'assessment_runtime' ? activeAttempt?.attemptNumber : undefined,
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
  const normalizedScores = normalizeCourseScores(scores);
  if (
    !normalizedScores
    || typeof details.success !== 'boolean'
    || !Number.isInteger(details.round)
    || Number(details.round) <= 0
  ) return record;
  const index = [...record.attempts].reverse().findIndex((attempt) => attempt.assignmentId === record.activeAssignmentId);
  if (index < 0) return record;
  const attemptIndex = record.attempts.length - 1 - index;
  const activeAttempt = record.attempts[attemptIndex];
  if (activeAttempt.completedAt || record.events.some((event) => (
    event.kind === 'MISSION_SETTLED'
    && event.assignmentId === activeAttempt.assignmentId
    && event.attemptNumber === activeAttempt.attemptNumber
    && event.context === 'assessment_runtime'
  ))) return record;
  const attempts = record.attempts.map((attempt, currentIndex) => currentIndex === attemptIndex
    ? { ...attempt, completedAt: now.toISOString(), scores: normalizedScores }
    : attempt);
  return appendCourseEvent({ ...record, attempts }, 'MISSION_SETTLED', { ...details, scores: normalizedScores }, {
    context: 'assessment_runtime',
    actor: 'system',
    now,
  });
}

export function updateCourseExplanation(
  record: CourseRecord,
  explanation: Partial<CourseStudentExplanation>,
  now = new Date(),
): CourseRecord {
  const blockingDebriefIndex = record.attempts.findIndex((attempt) => (
    Boolean(attempt.completedAt && attempt.scores) && !isCourseDebriefComplete(attempt)
  ));
  const activeIndex = [...record.attempts].reverse().findIndex((attempt) => attempt.assignmentId === record.activeAssignmentId);
  const attemptIndex = blockingDebriefIndex >= 0
    ? blockingDebriefIndex
    : activeIndex < 0
      ? -1
      : record.attempts.length - 1 - activeIndex;
  if (attemptIndex < 0) return record;
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

export function courseRecordBlockingAttempt(record: CourseRecord | null | undefined): CourseAttempt | undefined {
  return record?.attempts.find((attempt) => (
    !attempt.completedAt || !normalizeCourseScores(attempt.scores) || !isCourseDebriefComplete(attempt)
  ));
}

export function courseRecordExportBlockReason(record: CourseRecord): CourseExportBlockReason | null {
  if (!record.attempts.length) return 'NO_ATTEMPTS';
  if (!hasValidAttemptIdentitySequence(record.attempts)) return 'ATTEMPT_ID_INVALID';
  if (!hasValidDecisionProvenance(record)) return 'DECISION_PROVENANCE_INVALID';
  const allSettlementsValid = record.events
    .filter((event) => event.kind === 'MISSION_SETTLED')
    .every((event) => record.attempts.filter((attempt) => (
      event.assignmentId === attempt.assignmentId
      && event.missionId === attempt.missionId
      && event.attemptNumber === attempt.attemptNumber
      && event.context === 'assessment_runtime'
      && event.actor === 'system'
    )).length === 1);
  if (!allSettlementsValid) return 'ATTEMPT_NOT_SETTLED';
  if (record.attempts.some((attempt) => {
    if (!attempt.completedAt || !normalizeCourseScores(attempt.scores)) return true;
    const settlements = record.events.filter((event) => (
      event.kind === 'MISSION_SETTLED'
      && event.assignmentId === attempt.assignmentId
      && event.missionId === attempt.missionId
      && event.attemptNumber === attempt.attemptNumber
      && event.context === 'assessment_runtime'
      && event.actor === 'system'
    ));
    if (settlements.length !== 1) return true;
    const details = settlements[0].details;
    return typeof details.success !== 'boolean' || !Number.isInteger(details.round) || Number(details.round) <= 0;
  })) return 'ATTEMPT_NOT_SETTLED';
  if (record.attempts.some((attempt) => !isCourseDebriefComplete(attempt))) return 'DEBRIEF_INCOMPLETE';
  return null;
}

export function isCourseRecordExportReady(record: CourseRecord | null | undefined): record is CourseRecord {
  return Boolean(record) && courseRecordExportBlockReason(record!) === null;
}

export function canStartCourseAttempt(record: CourseRecord | null | undefined): boolean {
  return !record?.attempts.length || isCourseRecordExportReady(record);
}

export function normalizeCourseRecord(value: unknown): CourseRecord | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Omit<Partial<CourseRecord>, 'schemaVersion'> & { schemaVersion?: number };
  if (
    (candidate.schemaVersion !== 1 && candidate.schemaVersion !== 2)
    || candidate.mode !== 'assessment'
    || (candidate.platform !== 'desktop' && candidate.platform !== 'mobile')
    || typeof candidate.createdAt !== 'string'
    || typeof candidate.updatedAt !== 'string'
    || !Array.isArray(candidate.events)
    || !Array.isArray(candidate.attempts)
  ) return null;
  const sourceSchemaVersion = candidate.schemaVersion;
  const learnerCode = normalizeLearnerCode(candidate.learnerCode ?? '');
  const courseCode = normalizeCourseCode(candidate.courseCode ?? '');
  if (!learnerCode || !courseCode) return null;
  let invalidEventCount = Math.max(0, candidate.events.length - 5000);
  const parsedEvents = candidate.events.slice(0, 5000).flatMap((item): CourseEvent[] => {
    if (!item || typeof item !== 'object') {
      invalidEventCount += 1;
      return [];
    }
    const event = item as Partial<CourseEvent>;
    if (!EVENT_KINDS.includes(event.kind as CourseEventKind) || typeof event.recordedAt !== 'string') {
      invalidEventCount += 1;
      return [];
    }
    const kind = event.kind as CourseEventKind;
    const details = event.details && typeof event.details === 'object' && !Array.isArray(event.details)
      ? event.details as Record<string, unknown>
      : {};
    const legacyProvenance = legacyEventProvenance(kind, details);
    const v2ProvenanceValid = EVENT_CONTEXTS.includes(event.context as CourseEventContext)
      && EVENT_ACTORS.includes(event.actor as CourseEventActor);
    if (sourceSchemaVersion === 2 && !v2ProvenanceValid) invalidEventCount += 1;
    const context = sourceSchemaVersion === 2
      ? (EVENT_CONTEXTS.includes(event.context as CourseEventContext) ? event.context as CourseEventContext : 'legacy_unknown')
      : legacyProvenance.context;
    const actor = sourceSchemaVersion === 2
      ? (EVENT_ACTORS.includes(event.actor as CourseEventActor) ? event.actor as CourseEventActor : 'unknown')
      : legacyProvenance.actor;
    return [{
      sequence: 0,
      recordedAt: event.recordedAt,
      kind,
      context,
      actor,
      assignmentId: typeof event.assignmentId === 'string' ? event.assignmentId : undefined,
      missionId: typeof event.missionId === 'string' ? event.missionId : undefined,
      attemptNumber: Number.isInteger(event.attemptNumber) && event.attemptNumber! > 0
        ? event.attemptNumber
        : undefined,
      details,
    }];
  });
  const normalizedEvents = parsedEvents.map((event, index) => ({ ...event, sequence: index + 1 }));
  const legacyActiveAttemptByAssignment = new Map<string, number>();
  const events = normalizedEvents.map((event) => {
    if (sourceSchemaVersion === 2 || !event.assignmentId) return event;
    const detailAttemptNumber = Number.isInteger(event.details.attemptNumber) && Number(event.details.attemptNumber) > 0
      ? Number(event.details.attemptNumber)
      : undefined;
    if (detailAttemptNumber) legacyActiveAttemptByAssignment.set(event.assignmentId, detailAttemptNumber);
    return {
      ...event,
      attemptNumber: detailAttemptNumber ?? legacyActiveAttemptByAssignment.get(event.assignmentId),
    };
  });
  let invalidAttemptCount = 0;
  const normalizedAttempts = candidate.attempts.flatMap((item): CourseAttempt[] => {
    if (!item || typeof item !== 'object') {
      invalidAttemptCount += 1;
      return [];
    }
    const attempt = item as Partial<CourseAttempt>;
    if (
      typeof attempt.assignmentId !== 'string'
      || !attempt.assignmentId.trim()
      || typeof attempt.missionId !== 'string'
      || !attempt.missionId.trim()
      || !Number.isInteger(attempt.attemptNumber)
      || attempt.attemptNumber! <= 0
      || !Number.isSafeInteger(attempt.randomSeed)
      || typeof attempt.startedAt !== 'string'
    ) {
      invalidAttemptCount += 1;
      return [];
    }
    const rawExplanation = attempt.studentExplanation ?? emptyExplanation();
    const normalizedScores = normalizeCourseScores(attempt.scores);
    if (sourceSchemaVersion === 2 && attempt.scores !== undefined && !normalizedScores) invalidAttemptCount += 1;
    return [{
      assignmentId: attempt.assignmentId,
      weekId: typeof attempt.weekId === 'string' && /^W\d{2}$/.test(attempt.weekId) ? attempt.weekId : undefined,
      missionId: attempt.missionId,
      attemptNumber: attempt.attemptNumber!,
      randomSeed: attempt.randomSeed!,
      configVersion: typeof attempt.configVersion === 'string' ? attempt.configVersion : undefined,
      startedAt: attempt.startedAt,
      completedAt: typeof attempt.completedAt === 'string' ? attempt.completedAt : undefined,
      // v2 一律由具 provenance 的 event log 重建；舊 v1 decisionOrder 不具可驗證來源，因此不沿用。
      decisionOrder: [],
      hintUsedCount: 0,
      scores: normalizedScores,
      studentExplanation: {
        conclusion: String(rawExplanation.conclusion ?? '').slice(0, 4000),
        evidence: String(rawExplanation.evidence ?? '').slice(0, 4000),
        uncertainty: String(rawExplanation.uncertainty ?? '').slice(0, 4000),
        residualRisk: String(rawExplanation.residualRisk ?? '').slice(0, 4000),
      },
    }];
  });
  const rawAttemptsStructurallyAligned = invalidAttemptCount === 0
    && normalizedAttempts.length === candidate.attempts.length;
  if (sourceSchemaVersion === 2 && !hasValidAttemptIdentitySequence(normalizedAttempts)) invalidAttemptCount += 1;
  const attempts = normalizedAttempts.map((attempt, index) => {
    const formalEvents = events.filter((event) => (
      event.assignmentId === attempt.assignmentId
      && event.missionId === attempt.missionId
      && event.attemptNumber === attempt.attemptNumber
      && isFormalAssessmentDecision(event.kind, event.context, event.actor)
    ));
    const decisionOrder = formalEvents.map((event) => event.kind);
    const hintUsedCount = formalEvents.filter((event) => event.kind === 'HINT_USED').length;
    if (sourceSchemaVersion === 2 && rawAttemptsStructurallyAligned) {
      const rawAttempt = candidate.attempts![index] as Partial<CourseAttempt>;
      if (
        !Array.isArray(rawAttempt.decisionOrder)
        || JSON.stringify(rawAttempt.decisionOrder) !== JSON.stringify(decisionOrder)
        || rawAttempt.hintUsedCount !== hintUsedCount
      ) invalidAttemptCount += 1;
    }
    return {
      ...attempt,
      decisionOrder,
      hintUsedCount,
    };
  });
  const normalizedIntegrityOrigin = sourceSchemaVersion === 1
    ? 'migrated_v1'
    : invalidEventCount > 0 || invalidAttemptCount > 0
      ? 'invalid_v2'
      : candidate.integrityOrigin === 'native_v2' || candidate.integrityOrigin === 'migrated_v1' || candidate.integrityOrigin === 'invalid_v2'
        ? candidate.integrityOrigin
        : 'unknown';
  return {
    schemaVersion: 2,
    integrityOrigin: normalizedIntegrityOrigin,
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
  try {
    const raw = readLocalStorage(COURSE_STORAGE_KEY);
    return normalizeCourseRecord(raw ? JSON.parse(raw) : null);
  } catch {
    return null;
  }
}

/** 寫入失敗（儲存被封鎖、配額用盡）回傳 false，呼叫端據此提醒學生立即匯出。 */
export function saveCourseRecord(record: CourseRecord | null): boolean {
  if (!record) return removeLocalStorage(COURSE_STORAGE_KEY);
  return writeLocalStorage(COURSE_STORAGE_KEY, JSON.stringify(record));
}

export interface CourseExportContext {
  /** 匯出當下教師已解鎖的週次；教師端據此偵測「超前進度」的嘗試。 */
  unlockedWeekIds?: string[];
  assignments?: Pick<CourseAssignment, 'id' | 'weekId'>[];
}

export const COURSE_DIGEST_SPEC = {
  algorithm: 'SHA-256',
  canonicalization: 'sorted-keys-json',
  scope: 'record',
} as const;

export function buildCourseExport(record: CourseRecord, now = new Date(), context: CourseExportContext = {}) {
  const blockedBy = courseRecordExportBlockReason(record);
  if (blockedBy) throw new Error(`Course Record is not export-ready: ${blockedBy}`);
  const weekById = new Map((context.assignments ?? []).map((assignment) => [assignment.id, assignment.weekId]));
  const weekOf = (attempt: CourseAttempt) => attempt.weekId ?? weekById.get(attempt.assignmentId) ?? null;
  const attemptKey = (attempt: CourseAttempt) => ({
    assignmentId: attempt.assignmentId,
    weekId: weekOf(attempt),
    missionId: attempt.missionId,
    attemptNumber: attempt.attemptNumber,
    configVersion: attempt.configVersion ?? null,
  });
  return {
    format: COURSE_RECORD_FORMAT,
    schemaVersion: 2,
    exportedAt: now.toISOString(),
    version: record.releaseVersion,
    courseCode: record.courseCode,
    learnerCode: record.learnerCode,
    mode: record.mode,
    configVersion: record.configVersion,
    unlockedWeekIdsAtExport: context.unlockedWeekIds ? [...context.unlockedWeekIds] : null,
    integrityPolicy: {
      decisionOrder: 'LEARNER_ASSESSMENT_RUNTIME_ONLY',
      exportGate: 'ALL_ATTEMPTS_SETTLED_AND_DEBRIEF_COMPLETE',
      legacyV1: 'AUDIT_EVENTS_PRESERVED_UNVERIFIED_DECISIONS_EXCLUDED',
      origin: record.integrityOrigin,
      schemaEvidenceEligible: record.integrityOrigin === 'native_v2',
      authenticity: 'CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT',
    },
    missions: [...new Set(record.attempts.map((attempt) => attempt.missionId))],
    weeks: [...new Set(record.attempts.map(weekOf).filter((weekId): weekId is string => typeof weekId === 'string'))],
    attemptCount: record.attempts.length,
    decisionOrder: record.attempts.map((attempt) => ({
      ...attemptKey(attempt),
      decisions: attempt.decisionOrder,
    })),
    hintUsage: {
      total: record.attempts.reduce((total, attempt) => total + attempt.hintUsedCount, 0),
      assessmentPolicy: 'REC_AND_GUIDE_DISABLED',
    },
    componentScores: record.attempts.map((attempt) => ({
      ...attemptKey(attempt),
      scores: attempt.scores ?? null,
    })),
    studentExplanations: record.attempts.map((attempt) => ({
      ...attemptKey(attempt),
      ...attempt.studentExplanation,
    })),
    digest: COURSE_DIGEST_SPEC,
    recordDigest: courseRecordDigest(record),
    record,
  };
}

export function serializeCourseRecord(record: CourseRecord, now = new Date(), context: CourseExportContext = {}): string {
  return JSON.stringify(buildCourseExport(record, now, context), null, 2);
}
