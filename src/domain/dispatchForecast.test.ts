import { describe, expect, it } from 'vitest';
import { createInitialCampaign } from './campaign';
import { createDispatchForecast } from './dispatchForecast';
import type { BossData, CharacterData, EquipmentData, MissionData, TurbineData, VesselData } from './types';

const boss: BossData = {
  id: 'BOSS001', class: 'WEA', nameZh: '測試風險', nameEn: 'Test hazard', severity: 'S1',
  fatigueDamage: 12, resilience: 80, phases: 1, counterFactions: 'OMI', mechanic: '', fileName: '',
};
const equipment: EquipmentData = {
  id: 'EQ-A', category: 'SENSOR', nameZh: '感測器', nameEn: 'Sensor', tier: 'L1', rarity: 'Common',
  fatigueRelief: 2, reliabilityBonus: 3, compatibleFaction: 'ALL', description: '', fileName: '',
};
const spare: EquipmentData = { ...equipment, id: 'EQ-S', category: 'SPARES', nameZh: '備品', nameEn: 'Spare' };
const vessel: VesselData = {
  id: 'VES-A', class: 'SOV', nameZh: '支援船', nameEn: 'SOV', weatherProtection: 4, safetyProtection: 3,
  fatigueRelief: 3, deploymentCost: 12, descriptionZh: '', descriptionEn: '',
};
const mission: MissionData = {
  id: 'MSN-1', chapter: 1, order: 1, titleZh: '任務一', titleEn: 'Mission one', briefingZh: '', briefingEn: '',
  bossId: boss.id, sceneId: 'SCN001', turbineId: 'WTG-OWM-001', recommendedFactionCodes: ['OMI'], recommendedEquipmentId: equipment.id,
  recommendedSpareId: spare.id, recommendedVesselId: vessel.id, unlockRequires: null, rewardXp: 100,
  rewardEquipmentTier: null,
  operationProfile: {
    siteCode: 'OWM-T01', siteNameZh: '測試風場', siteNameEn: 'Test wind farm', weatherZh: '陣雨', weatherEn: 'Showers', seaState: 2,
    workPermitCode: 'PTW-TEST', workPermitZh: '測試許可', workPermitEn: 'Test permit', minimumMasteryLevel: 1,
    minimumQualifiedMembers: 2, requiredPpeZh: ['救生衣'], requiredPpeEn: ['Lifejacket'], accessRequirementZh: '確認進場',
    accessRequirementEn: 'Confirm access', allowedVesselClasses: ['SOV'], initialWeatherWindow: 91, mobilizationCost: 5, gameplayAbstraction: true,
  },
  branchEventDeck: [
    { round: 1, eventCode: 'WEATHER_ESCALATION', intensity: 0.75 },
    { round: 4, eventCode: 'SECONDARY_FAULT', intensity: 1 },
  ],
  learningObjectivesZh: [], learningObjectivesEn: [], diagnosisOptions: [],
};
const turbine: TurbineData = {
  id: 'WTG-OWM-001', nameZh: '測試風機', nameEn: 'Test turbine', zone: 'T-01', ratedPowerMw: 12,
  initialReliability: 88, initialOpenFaults: 1,
};
const crew: CharacterData[] = [0, 1, 2].map((index) => ({
  id: `CHR-${index + 1}`, trackId: 'TRK001', artKey: '', nameZh: `技師${index + 1}`, nameEn: `Crew ${index + 1}`,
  factionCode: 'OMI', factionZh: '', factionEn: '', professionZh: '', professionEn: '', levelCode: 'L1', levelZh: '', levelEn: '',
  rarity: 'Common', stars: 1, fatigueMax: 100, fatigueRecovery: 7, actionPoints: 2, atk: 50, def: 50, intel: 50, speed: 50,
  passiveSkillId: '', skill1Id: '', skill2Id: '', ultimateSkillId: '', personality: '', toolsZh: '', toolsEn: '', ppe: '', story: '',
  palette: '', portraitFile: '', artStatus: '',
}));

describe('Campaign Dispatch Forecast', () => {
  it('重用正式 wear、MNT 與 RST 規則產生成功／失敗預測', () => {
    const campaign = createInitialCampaign([mission], [equipment, spare]);
    const forecast = createDispatchForecast(campaign, mission, boss, equipment, spare, vessel, crew);

    expect(forecast.equipment.map((item) => [item.afterSuccess, item.afterFailure])).toEqual([[92, 86], [95, 91]]);
    expect(forecast.maintenance).toMatchObject({
      current: 80,
      successRewardMin: 24,
      successRewardMax: 34,
      failureReward: 11,
      successRepairCost: 7,
      failureRepairCost: 12,
      afterSuccessFullRepairMin: 97,
      afterSuccessFullRepairMax: 107,
      afterFailureFullRepair: 79,
    });
    expect(forecast.recoveryTokens).toEqual({ current: 3, earned: 2, after: 5 });
    expect(forecast.branchEventCount).toBe(2);
  });

  it('Crew forecast 顯示每回合 baseline、返航恢復與 round-limit 上界', () => {
    const campaign = {
      ...createInitialCampaign([mission], [equipment, spare]),
      crewFatigue: { 'CHR-1': 20 },
      characterXp: { 'CHR-1': 900 },
    };
    const forecast = createDispatchForecast(campaign, mission, boss, equipment, spare, vessel, crew);
    const veteran = forecast.crew[0];
    const baseline = forecast.crew[1];

    expect(forecast.roundLimit).toBe(11);
    expect(veteran).toMatchObject({ before: 20, perRoundDamage: 6, transitRecovery: 6, afterOneRound: 20, afterRoundLimit: 80, oneRoundBand: 'Stable', roundLimitBand: 'Critical' });
    expect(baseline).toMatchObject({ before: 0, perRoundDamage: 8, transitRecovery: 6, afterOneRound: 2, afterRoundLimit: 82, oneRoundBand: 'Stable', roundLimitBand: 'Critical' });
  });

  it('Forecast 使用 target turbine 與正式 loadout/mastery 顯示 fleet condition 前後值', () => {
    const campaign = createInitialCampaign([mission], [equipment, spare], [turbine]);
    const forecast = createDispatchForecast(campaign, mission, boss, equipment, spare, vessel, crew);
    expect(forecast.fleetCondition).toMatchObject({
      modifier: {
        turbineId: turbine.id,
        pressure: 'ELEVATED',
        availability: 'DEGRADED',
        sourceReliability: 88,
        openFaults: 1,
        mobilizationCostDelta: 5,
        safetyPenalty: 5,
        reliabilityPenalty: 3,
      },
      mobilizationCostBefore: 5,
      mobilizationCostAfter: 10,
      safetyBefore: 100,
      safetyAfter: 95,
      reliabilityBefore: 15,
      reliabilityAfter: 12,
    });
  });
});
