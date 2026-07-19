import { describe, expect, it } from 'vitest';
import { createMission } from './runtime';
import {
  applySandboxScenario,
  DEFAULT_SANDBOX_SCENARIO,
  normalizeSandboxScenario,
  sandboxScenarioPreset,
  sandboxSeaStateModifier,
  sandboxVesselProjection,
} from './sandboxScenario';
import type { BossData, VesselData } from './types';

const boss: BossData = {
  id: 'BOSS001', class: 'WEA', nameZh: '測試風險', nameEn: 'Test hazard', severity: 'S1',
  fatigueDamage: 12, resilience: 80, phases: 1, counterFactions: 'MAR,OMI', mechanic: '', fileName: '',
};

const vessel: VesselData = {
  id: 'VES002', class: 'SOV', nameZh: '支援船', nameEn: 'SOV', weatherProtection: 5,
  safetyProtection: 3, fatigueRelief: 3, deploymentCost: 12, descriptionZh: '', descriptionEn: '',
};

describe('Sandbox scenario lab', () => {
  it('正規化外部數值並保留可重現的標準預設', () => {
    expect(normalizeSandboxScenario()).toEqual(DEFAULT_SANDBOX_SCENARIO);
    expect(normalizeSandboxScenario({ seaState: 9, weatherWindow: 4, safety: 120, evidence: -5, roundLimit: 99 })).toEqual({
      seaState: 6,
      weatherWindow: 20,
      safety: 100,
      evidence: 0,
      roundLimit: 20,
    });
    expect(sandboxScenarioPreset('STORM')).toEqual({ seaState: 5, weatherWindow: 55, safety: 65, evidence: 0, roundLimit: 9 });
  });

  it('只覆寫 Sandbox 起始資源與回合限制，不破壞 Boss 任務結構', () => {
    const base = createMission(boss);
    const configured = applySandboxScenario(base, { seaState: 5, weatherWindow: 55, safety: 65, evidence: 20, roundLimit: 9 });
    expect(configured).toMatchObject({
      bossId: boss.id,
      stageIndex: base.stageIndex,
      requirement: base.requirement,
      weatherWindow: 55,
      safety: 65,
      evidence: 20,
      roundLimit: 9,
    });
  });

  it('Sea State 投影單次船舶防護，且不修改原始 Vessel master data', () => {
    const calm = sandboxVesselProjection(vessel, 1);
    const storm = sandboxVesselProjection(vessel, 5);
    expect(calm).toMatchObject({ weatherProtection: 7, safetyProtection: 4, fatigueRelief: 4 });
    expect(storm).toMatchObject({ weatherProtection: 3, safetyProtection: 2, fatigueRelief: 2 });
    expect(sandboxSeaStateModifier(6)).toEqual({ weatherProtection: -3, safetyProtection: -2, fatigueRelief: -1 });
    expect(vessel).toMatchObject({ weatherProtection: 5, safetyProtection: 3, fatigueRelief: 3 });
  });
});
