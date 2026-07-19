import { describe, expect, it } from 'vitest';
import bosses from '../../json/bosses.json';
import characters from '../../json/characters.json';
import equipment from '../../json/equipment.json';
import missions from '../../json/missions.json';
import skills from '../../json/skills.json';
import turbines from '../../json/turbines.json';
import vessels from '../../json/vessels.json';
import { evaluateBalanceGates, simulateCampaignBalance, type BalanceDatabase } from './balance';

const database = { missions, bosses, characters, skills, equipment, turbines, vessels } as unknown as BalanceDatabase;

describe('Campaign balance simulation', () => {
  it('以相同跨層級代表隊伍完成 45 組 deterministic run', () => {
    const report = simulateCampaignBalance(database);
    expect(report.results).toHaveLength(45);
    expect(report.note).toContain('not field, SCADA or experimental evidence');

    for (const mission of missions) {
      const teams = report.results
        .filter((result) => result.missionId === mission.id)
        .map((result) => result.teamCharacterIds.join(','));
      expect(new Set(teams).size).toBe(1);
    }
  });

  it('L1/L3/L5 progression gates 與 S5 壓力分層通過', () => {
    const report = simulateCampaignBalance(database);
    expect(evaluateBalanceGates(report)).toEqual({ passed: true, errors: [] });

    expect(report.summaries.map((summary) => [summary.profile, summary.passedMissions])).toEqual([
      ['L1', 6],
      ['L3', 12],
      ['L5', 15],
    ]);
    expect(report.maintenanceEconomy).toMatchObject({
      policy: 'FULL_REPAIR_AFTER_EACH_L5_MISSION',
      serviceableMissions: 15,
      totalMissions: 15,
      repairFailures: 0,
      gatePassed: true,
    });
    expect(report.maintenanceEconomy.endingCredits).toBeGreaterThanOrEqual(0);
    expect(report.crewReadinessEconomy).toMatchObject({
      policy: 'ROTATE_AND_REST_BEFORE_L5_MISSION',
      deployableMissions: 15,
      completedMissions: 15,
      totalMissions: 15,
      exhaustedBlocks: 0,
      gatePassed: true,
    });
    expect(report.crewReadinessEconomy.endingTokens).toBeGreaterThanOrEqual(0);

    const finale = report.results.filter((result) => result.chapter === 5);
    expect(finale.filter((result) => result.profile === 'L1' && result.success)).toHaveLength(0);
    expect(finale.filter((result) => result.profile === 'L3' && result.success)).toHaveLength(0);
    expect(finale.filter((result) => result.profile === 'L5' && result.success)).toHaveLength(3);
    expect(report.results.filter((result) => result.failureReason === 'ReadinessGate')).toHaveLength(12);
    expect(finale.filter((result) => result.profile === 'L5').every((result) => result.pressure !== 'comfortable')).toBe(true);
  });
});
