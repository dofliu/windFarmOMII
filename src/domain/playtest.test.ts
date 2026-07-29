import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PLAYTEST_BUILD,
  PLAYTEST_STORAGE_KEY,
  appendPlaytestEvent,
  completePlaytestSession,
  createPlaytestSession,
  loadPlaytestSession,
  normalizeParticipantCode,
  normalizePlaytestSession,
  savePlaytestSession,
  serializePlaytestSession,
  updatePlaytestNotes,
} from './playtest';

afterEach(() => vi.unstubAllGlobals());

describe('Playtest observation session', () => {
  it('建立匿名代碼 session 並記錄穩定序號', () => {
    const started = createPlaytestSession(' p-03 ', 'mobile', new Date('2026-07-27T01:00:00.000Z'));
    const updated = appendPlaytestEvent(started, 'RST_SPENT', { before: 3, after: 2 }, new Date('2026-07-27T01:02:00.000Z'));

    expect(normalizeParticipantCode(' 劉老師 p-03! ')).toBe('P-03');
    expect(updated.build).toBe(PLAYTEST_BUILD);
    expect(updated.events.map((event) => [event.sequence, event.kind])).toEqual([
      [1, 'SESSION_STARTED'],
      [2, 'RST_SPENT'],
    ]);
  });

  it('完成後拒絕新增行為事件，但保留觀察筆記', () => {
    const started = createPlaytestSession('D01', 'desktop', new Date('2026-07-27T01:00:00.000Z'));
    const noted = updatePlaytestNotes(started, { rotationDecision: '先換掉 Critical 技師' });
    const completed = completePlaytestSession(noted, new Date('2026-07-27T01:30:00.000Z'));
    const unchanged = appendPlaytestEvent(completed, 'MISSION_DEPLOYED', { missionId: 'MSN-TUT-001' });

    expect(completed.status).toBe('completed');
    expect(completed.notes.rotationDecision).toBe('先換掉 Critical 技師');
    expect(completed.events.at(-1)?.kind).toBe('SESSION_COMPLETED');
    expect(unchanged).toBe(completed);
  });

  it('只還原合法 schema，並清理無效 event 與過長筆記', () => {
    const normalized = normalizePlaytestSession({
      schemaVersion: 1,
      build: PLAYTEST_BUILD,
      participantCode: ' D-02 ',
      platform: 'desktop',
      status: 'active',
      startedAt: '2026-07-27T01:00:00.000Z',
      events: [
        { sequence: 100, recordedAt: 'invalid', kind: 'RST_SPENT', details: {} },
        { sequence: 99, recordedAt: '2026-07-27T01:01:00.000Z', kind: 'CREW_ROTATED', details: { missionId: 'M1' } },
      ],
      notes: { facilitatorNotes: 'x'.repeat(5000) },
    });

    expect(normalized?.participantCode).toBe('D-02');
    expect(normalized?.events).toHaveLength(1);
    expect(normalized?.events[0].sequence).toBe(1);
    expect(normalized?.notes.facilitatorNotes).toHaveLength(4000);
    expect(normalizePlaytestSession({ schemaVersion: 2 })).toBeNull();
  });

  it('使用獨立 localStorage 保存、清除與匯出', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    const session = createPlaytestSession('M01', 'mobile', new Date('2026-07-27T01:00:00.000Z'));

    savePlaytestSession(session);
    expect(values.has(PLAYTEST_STORAGE_KEY)).toBe(true);
    expect(loadPlaytestSession()?.participantCode).toBe('M01');
    expect(JSON.parse(serializePlaytestSession(session, new Date('2026-07-27T02:00:00.000Z'))).format).toBe('OWM_PLAYTEST_SESSION');
    savePlaytestSession(null);
    expect(values.has(PLAYTEST_STORAGE_KEY)).toBe(false);
  });
});
