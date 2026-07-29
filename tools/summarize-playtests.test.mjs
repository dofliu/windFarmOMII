import { describe, expect, it } from 'vitest';
import {
  buildPlaytestSummary,
  parsePlaytestExport,
  renderPlaytestSummary,
} from './summarize-playtests.mjs';

function playtestExport(code, platform, overrides = {}) {
  return {
    format: 'OWM_PLAYTEST_SESSION',
    schemaVersion: 1,
    exportedAt: '2026-07-27T02:00:00.000Z',
    session: {
      schemaVersion: 1,
      build: '3.56.0-playtest-analysis-pipeline',
      participantCode: code,
      platform,
      status: 'completed',
      startedAt: '2026-07-27T01:00:00.000Z',
      completedAt: '2026-07-27T01:30:00.000Z',
      events: [
        { sequence: 1, recordedAt: '2026-07-27T01:00:00.000Z', kind: 'SESSION_STARTED', details: {} },
        { sequence: 2, recordedAt: '2026-07-27T01:10:00.000Z', kind: 'CREW_ROTATED', details: {} },
        { sequence: 3, recordedAt: '2026-07-27T01:15:00.000Z', kind: 'RST_SPENT', details: {} },
        { sequence: 4, recordedAt: '2026-07-27T01:20:00.000Z', kind: 'EQUIPMENT_REPAIRED', details: {} },
        { sequence: 5, recordedAt: '2026-07-27T01:30:00.000Z', kind: 'SESSION_COMPLETED', details: {} },
      ],
      notes: {
        rotationDecision: '依疲勞換班',
        rstDecision: 'Critical 才使用',
        mntDecision: '保留下一關維修費',
        facilitatorNotes: '無提示完成',
      },
      ...overrides,
    },
  };
}

describe('Playtest evidence summary', () => {
  it('拒絕非 OWM export 與具名 participant code', () => {
    expect(parsePlaytestExport({ format: 'OTHER' }, 'bad.json').ok).toBe(false);
    expect(parsePlaytestExport(playtestExport('劉老師', 'desktop'), 'pii.json').ok).toBe(false);
    const invalidEvents = playtestExport('D01', 'desktop');
    invalidEvents.session.events[1].sequence = 9;
    expect(parsePlaytestExport(invalidEvents, 'events.json').ok).toBe(false);
  });

  it('3–5 人、跨裝置、完成 notes 時才標記 analysis ready', () => {
    const records = [
      parsePlaytestExport(playtestExport('D01', 'desktop'), 'D01.json').record,
      parsePlaytestExport(playtestExport('M01', 'mobile'), 'M01.json').record,
      parsePlaytestExport(playtestExport('D02', 'desktop'), 'D02.json').record,
    ];
    const summary = buildPlaytestSummary(records);

    expect(summary.analysisReady).toBe(true);
    expect(summary.decisions.rotation.actionEventCount).toBe(3);
    expect(summary.decisions.rst.evidenceParticipants).toEqual(['D01', 'M01', 'D02']);
    expect(renderPlaytestSummary(summary)).toContain('ANALYSIS READY');
  });

  it('資料不足時保留 NA，且不把 action 自動宣稱為理解', () => {
    const incomplete = playtestExport('D01', 'desktop', {
      status: 'active',
      completedAt: undefined,
      events: [{ sequence: 1, recordedAt: '2026-07-27T01:00:00.000Z', kind: 'SESSION_STARTED', details: {} }],
      notes: { rotationDecision: '', rstDecision: '', mntDecision: '', facilitatorNotes: '' },
    });
    const parsed = parsePlaytestExport(incomplete, 'D01.json');
    const report = renderPlaytestSummary(buildPlaytestSummary([parsed.record]));

    expect(report).toContain('INCOMPLETE');
    expect(report).toContain('NA');
    expect(report).toContain('does not automatically conclude');
  });
});
