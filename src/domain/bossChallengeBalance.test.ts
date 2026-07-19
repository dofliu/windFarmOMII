import { beforeAll, describe, expect, it } from 'vitest';
import bosses from '../../json/bosses.json';
import characters from '../../json/characters.json';
import equipment from '../../json/equipment.json';
import missions from '../../json/missions.json';
import skills from '../../json/skills.json';
import vessels from '../../json/vessels.json';
import type { BalanceDatabase } from './balance';
import {
  evaluateBossChallengeBalanceGates,
  simulateBossChallengeBalance,
  type BossChallengeBalanceReport,
} from './bossChallengeBalance';

const database = { missions, bosses, characters, skills, equipment, vessels } as unknown as BalanceDatabase;
let report: BossChallengeBalanceReport;

beforeAll(() => {
  report = simulateBossChallengeBalance(database);
});

describe('Boss Challenge deterministic balance audit', () => {
  it('逐 counter set 精確比較全部 C(300,3)，並實跑 100 Boss', () => {
    expect(report.results).toHaveLength(100);
    expect(report.candidatePolicy).toMatchObject({
      eligibleCharacters: 300,
      counterSets: 3,
      policies: ['balanced', 'power', 'survival'],
      topTeamsPerPolicy: 8,
      exactThreePersonCombinationsPerCounterSet: 4_455_100,
    });
    expect(report.note).toContain('not field, SCADA, human-factors or experimental evidence');
  });

  it('100 Boss 公平性 gates 全部通過', () => {
    expect(evaluateBossChallengeBalanceGates(report)).toEqual({
      passed: true,
      checks: {
        allBossesClearable: true,
        candidateDiversity: true,
        lowSeverityAccessible: true,
        severityProgression: true,
        endgamePressure: true,
      },
      errors: [],
    });
    expect(report.results.every((result) => result.round <= result.roundLimit)).toBe(true);
  });

  it('S5 全數可通關但不出現 comfortable，BOSS080 不再是固定配裝死局', () => {
    const s5 = report.bySeverity.find((summary) => summary.severity === 'S5');
    expect(s5).toMatchObject({ bosses: 20, completed: 20, completionRate: 100 });
    expect(s5?.pressureCounts.comfortable).toBe(0);
    expect((s5?.pressureCounts.tight ?? 0) + (s5?.pressureCounts.critical ?? 0)).toBe(20);

    const gridFinale = report.results.find((result) => result.bossId === 'BOSS080');
    expect(gridFinale).toMatchObject({ success: true, class: 'GRD', severity: 'S5' });
    expect(gridFinale?.successfulCandidateTeams).toBeGreaterThanOrEqual(3);
    expect(gridFinale?.weatherWindow).toBeGreaterThan(0);
  });
});
