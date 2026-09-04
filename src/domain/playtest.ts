import { removeLocalStorage, writeLocalStorage } from './storage.ts';
export const PLAYTEST_STORAGE_KEY = 'owm.playtest.v1';
export const PLAYTEST_BUILD = '3.58.0-course-record-integrity';

export type PlaytestPlatform = 'desktop' | 'mobile';
export type PlaytestStatus = 'active' | 'completed';
export type PlaytestEventKind =
  | 'SESSION_STARTED'
  | 'VIEW_CHANGED'
  | 'CREW_ROTATED'
  | 'RST_SPENT'
  | 'EQUIPMENT_REPAIRED'
  | 'FLEET_MAINTAINED'
  | 'MISSION_DEPLOYED'
  | 'MISSION_SETTLED'
  | 'DIAGNOSIS_SELECTED'
  | 'EVIDENCE_VIEWED'
  | 'HINT_USED'
  | 'JSA_COMPLETED'
  | 'LOTO_VERIFIED'
  | 'WORK_ORDER_CREATED'
  | 'MISSION_REPLAYED'
  | 'DEBRIEF_EXPORTED'
  | 'SESSION_COMPLETED';

export interface PlaytestEvent {
  sequence: number;
  recordedAt: string;
  kind: PlaytestEventKind;
  details: Record<string, unknown>;
}

export interface PlaytestNotes {
  rotationDecision: string;
  rstDecision: string;
  mntDecision: string;
  facilitatorNotes: string;
}

export interface PlaytestSession {
  schemaVersion: 1;
  build: string;
  participantCode: string;
  platform: PlaytestPlatform;
  status: PlaytestStatus;
  startedAt: string;
  completedAt?: string;
  events: PlaytestEvent[];
  notes: PlaytestNotes;
}

const EVENT_KINDS: PlaytestEventKind[] = [
  'SESSION_STARTED',
  'VIEW_CHANGED',
  'CREW_ROTATED',
  'RST_SPENT',
  'EQUIPMENT_REPAIRED',
  'FLEET_MAINTAINED',
  'MISSION_DEPLOYED',
  'MISSION_SETTLED',
  'DIAGNOSIS_SELECTED',
  'EVIDENCE_VIEWED',
  'HINT_USED',
  'JSA_COMPLETED',
  'LOTO_VERIFIED',
  'WORK_ORDER_CREATED',
  'MISSION_REPLAYED',
  'DEBRIEF_EXPORTED',
  'SESSION_COMPLETED',
];

const EMPTY_NOTES: PlaytestNotes = {
  rotationDecision: '',
  rstDecision: '',
  mntDecision: '',
  facilitatorNotes: '',
};

export function normalizeParticipantCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 24);
}

export function createPlaytestSession(
  participantCode: string,
  platform: PlaytestPlatform,
  now = new Date(),
): PlaytestSession {
  const normalizedCode = normalizeParticipantCode(participantCode);
  if (!normalizedCode) throw new Error('Participant code is required.');
  const startedAt = now.toISOString();
  const session: PlaytestSession = {
    schemaVersion: 1,
    build: PLAYTEST_BUILD,
    participantCode: normalizedCode,
    platform,
    status: 'active',
    startedAt,
    events: [],
    notes: { ...EMPTY_NOTES },
  };
  return appendPlaytestEvent(session, 'SESSION_STARTED', { platform }, now);
}

export function appendPlaytestEvent(
  session: PlaytestSession,
  kind: PlaytestEventKind,
  details: Record<string, unknown> = {},
  now = new Date(),
): PlaytestSession {
  if (session.status !== 'active') return session;
  const event: PlaytestEvent = {
    sequence: session.events.length + 1,
    recordedAt: now.toISOString(),
    kind,
    details,
  };
  return { ...session, events: [...session.events, event] };
}

export function updatePlaytestNotes(
  session: PlaytestSession,
  notes: Partial<PlaytestNotes>,
): PlaytestSession {
  return { ...session, notes: { ...session.notes, ...notes } };
}

export function completePlaytestSession(session: PlaytestSession, now = new Date()): PlaytestSession {
  if (session.status === 'completed') return session;
  const withEvent = appendPlaytestEvent(session, 'SESSION_COMPLETED', {
    eventCountBeforeCompletion: session.events.length,
  }, now);
  return { ...withEvent, status: 'completed', completedAt: now.toISOString() };
}

export function normalizePlaytestSession(value: unknown): PlaytestSession | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<PlaytestSession>;
  if (candidate.schemaVersion !== 1) return null;
  if (candidate.status !== 'active' && candidate.status !== 'completed') return null;
  if (candidate.platform !== 'desktop' && candidate.platform !== 'mobile') return null;
  if (typeof candidate.startedAt !== 'string' || Number.isNaN(Date.parse(candidate.startedAt))) return null;
  const participantCode = normalizeParticipantCode(candidate.participantCode ?? '');
  if (!participantCode) return null;

  const validEvents = Array.isArray(candidate.events)
    ? candidate.events.slice(0, 2000).flatMap((event, index): PlaytestEvent[] => {
        if (!event || typeof event !== 'object') return [];
        const item = event as Partial<PlaytestEvent>;
        if (!EVENT_KINDS.includes(item.kind as PlaytestEventKind)) return [];
        if (typeof item.recordedAt !== 'string' || Number.isNaN(Date.parse(item.recordedAt))) return [];
        const details = item.details && typeof item.details === 'object' && !Array.isArray(item.details)
          ? item.details as Record<string, unknown>
          : {};
        return [{
          sequence: index + 1,
          recordedAt: item.recordedAt,
          kind: item.kind as PlaytestEventKind,
          details,
        }];
      })
    : [];
  const events = validEvents.map((event, index) => ({ ...event, sequence: index + 1 }));
  const rawNotes = candidate.notes && typeof candidate.notes === 'object'
    ? candidate.notes as Partial<PlaytestNotes>
    : {};
  const notes = Object.fromEntries(
    Object.keys(EMPTY_NOTES).map((key) => [
      key,
      typeof rawNotes[key as keyof PlaytestNotes] === 'string'
        ? rawNotes[key as keyof PlaytestNotes]!.slice(0, 4000)
        : '',
    ]),
  ) as unknown as PlaytestNotes;

  return {
    schemaVersion: 1,
    build: typeof candidate.build === 'string' ? candidate.build : PLAYTEST_BUILD,
    participantCode,
    platform: candidate.platform,
    status: candidate.status,
    startedAt: candidate.startedAt,
    completedAt: candidate.status === 'completed' && typeof candidate.completedAt === 'string'
      ? candidate.completedAt
      : undefined,
    events,
    notes,
  };
}

export function loadPlaytestSession(): PlaytestSession | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PLAYTEST_STORAGE_KEY);
    return normalizePlaytestSession(raw ? JSON.parse(raw) : null);
  } catch {
    return null;
  }
}

export function savePlaytestSession(session: PlaytestSession | null): boolean {
  if (!session) return removeLocalStorage(PLAYTEST_STORAGE_KEY);
  return writeLocalStorage(PLAYTEST_STORAGE_KEY, JSON.stringify(session));
}

export function serializePlaytestSession(session: PlaytestSession, now = new Date()): string {
  return JSON.stringify({
    format: 'OWM_PLAYTEST_SESSION',
    schemaVersion: 1,
    exportedAt: now.toISOString(),
    studyObjective: 'Crew rotation, RST spending, and MNT retention comprehension',
    session,
  }, null, 2);
}
