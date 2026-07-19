import { describe, expect, it } from 'vitest';
import { createInitialCampaign, crewReadinessBandForFatigue } from './campaign';
import { createCrewRotationRecommendation, filterCrewRoster } from './crewRotation';
import type { BossData, CharacterData, EquipmentData, MissionData, SkillData, VesselData } from './types';

const character = (id: string, factionCode: string): CharacterData => ({
  id,
  trackId: `TRK-${id}`,
  artKey: '',
  nameZh: `${factionCode} 技師`,
  nameEn: `${factionCode} crew`,
  factionCode,
  factionZh: '',
  factionEn: '',
  professionZh: '測試工程師',
  professionEn: 'Test engineer',
  levelCode: 'L1',
  levelZh: '',
  levelEn: '',
  rarity: 'Common',
  stars: 1,
  fatigueMax: 100,
  fatigueRecovery: 8,
  actionPoints: 3,
  atk: 50,
  def: 50,
  intel: 50,
  speed: 50,
  passiveSkillId: '',
  skill1Id: '',
  skill2Id: '',
  ultimateSkillId: '',
  personality: '',
  toolsZh: '',
  toolsEn: '',
  ppe: '',
  story: '',
  palette: '',
  portraitFile: '',
  artStatus: '',
});

const characters = [
  character('CHR-GOV', 'GOV'),
  character('CHR-ACA', 'ACA'),
  character('CHR-DEV', 'DEV'),
  character('CHR-MFG', 'MFG'),
  character('CHR-MAR', 'MAR'),
  character('CHR-OMI', 'OMI'),
  character('CHR-DIG', 'DIG'),
];
const skillById = new Map<string, SkillData>();

const boss: BossData = {
  id: 'BOSS-ROTATION', class: 'DRV', nameZh: '', nameEn: '', severity: 'S2', fatigueDamage: 10,
  resilience: 80, phases: 1, counterFactions: 'OMI,MAR', mechanic: '', fileName: '',
};
const equipment: EquipmentData = {
  id: 'EQ-ROTATION', category: 'SENSOR', nameZh: '', nameEn: '', tier: 'L1', rarity: 'Common',
  fatigueRelief: 2, reliabilityBonus: 0, compatibleFaction: 'ALL', description: '', fileName: '',
};
const vessel: VesselData = {
  id: 'VES-ROTATION', class: 'SOV', nameZh: '', nameEn: '', weatherProtection: 4, safetyProtection: 4,
  fatigueRelief: 3, deploymentCost: 10, descriptionZh: '', descriptionEn: '',
};
const mission: MissionData = {
  id: 'MSN-ROTATION', chapter: 1, order: 1, titleZh: '', titleEn: '', briefingZh: '', briefingEn: '',
  bossId: boss.id, sceneId: 'SCN001', turbineId: 'WTG-OWM-001', recommendedFactionCodes: ['OMI'], recommendedEquipmentId: equipment.id,
  recommendedSpareId: 'EQ-SPARE', recommendedVesselId: vessel.id, unlockRequires: null, rewardXp: 100, rewardEquipmentTier: null,
  operationProfile: {
    siteCode: 'ROT', siteNameZh: '', siteNameEn: '', weatherZh: '', weatherEn: '', seaState: 2,
    workPermitCode: 'PTW', workPermitZh: '', workPermitEn: '', minimumMasteryLevel: 2, minimumQualifiedMembers: 2,
    requiredPpeZh: ['PPE'], requiredPpeEn: ['PPE'], accessRequirementZh: '', accessRequirementEn: '',
    allowedVesselClasses: ['SOV'], initialWeatherWindow: 90, mobilizationCost: 5, gameplayAbstraction: true,
  },
  branchEventDeck: [], learningObjectivesZh: [], learningObjectivesEn: [], diagnosisOptions: [],
};

describe('Crew rotation advisor', () => {
  it('readiness band 與 forecast 共用 40%／70%／100% 門檻', () => {
    expect([39, 40, 69, 70, 99, 100].map((value) => crewReadinessBandForFatigue(value, 100)))
      .toEqual(['Stable', 'Tired', 'Tired', 'Critical', 'Critical', 'Exhausted']);
  });

  it('可依文字、陣營、readiness 與最低 Mastery 篩選 roster', () => {
    const campaign = {
      ...createInitialCampaign([mission], [equipment]),
      characterXp: { 'CHR-OMI': 500 },
      crewFatigue: { 'CHR-GOV': 40, 'CHR-ACA': 70, 'CHR-DEV': 100 },
    };
    expect(filterCrewRoster(characters, campaign, { query: 'engineer', factionCode: 'OMI', readiness: 'Stable', minimumMastery: 4, capability: 'ALL' }, skillById)
      .map((item) => item.id)).toEqual(['CHR-OMI']);
    expect(filterCrewRoster(characters, campaign, { query: '', factionCode: 'ALL', readiness: 'Exhausted', minimumMastery: 0, capability: 'ALL' }, skillById)
      .map((item) => item.id)).toEqual(['CHR-DEV']);
  });

  it('完整 roster 搜尋會保留合格成員、移除 Exhausted，並補齊 coverage／counter', () => {
    const campaign = {
      ...createInitialCampaign([mission], [equipment]),
      characterXp: { 'CHR-GOV': 100, 'CHR-ACA': 100, 'CHR-OMI': 100 },
      crewFatigue: { 'CHR-ACA': 100 },
    };
    const recommendation = createCrewRotationRecommendation(
      campaign,
      mission,
      boss,
      equipment,
      vessel,
      characters,
      ['CHR-GOV', 'CHR-ACA', 'CHR-DEV'],
    );

    expect(new Set(recommendation.teamIds)).toEqual(new Set(['CHR-GOV', 'CHR-MAR', 'CHR-OMI']));
    expect(recommendation.score).toMatchObject({
      masteryReady: true,
      qualifiedMembers: 2,
      projectedExhaustedCount: 0,
      projectedCriticalOrWorseCount: 3,
      stageCoverage: 6,
      counterCoverage: 2,
      retainedMembers: 1,
    });
    expect(recommendation.changesRecommended).toBe(true);
    expect(recommendation.candidates.every((candidate) => candidate.deployable)).toBe(true);
  });

  it('同分時保留現有三人，避免沒有收益的輪調', () => {
    const l1Mission = {
      ...mission,
      operationProfile: { ...mission.operationProfile, minimumMasteryLevel: 1 as const },
    };
    const noCounterBoss = { ...boss, counterFactions: 'NONE' };
    const campaign = createInitialCampaign([l1Mission], [equipment]);
    const recommendation = createCrewRotationRecommendation(
      campaign,
      l1Mission,
      noCounterBoss,
      equipment,
      vessel,
      characters,
      ['CHR-GOV', 'CHR-MAR', 'CHR-OMI'],
    );

    expect(recommendation.teamIds).toEqual(['CHR-GOV', 'CHR-MAR', 'CHR-OMI']);
    expect(recommendation.changedSlots).toBe(0);
    expect(recommendation.changesRecommended).toBe(false);
  });

  it('300 人 roster 仍以完整組合搜尋並在互動時間內完成', () => {
    const factions = ['GOV', 'ACA', 'DEV', 'MFG', 'MAR', 'OMI', 'DIG'];
    const fullRoster = Array.from({ length: 300 }, (_, index) => character(
      `CHR-${String(index + 1).padStart(3, '0')}`,
      factions[index % factions.length],
    ));
    const l1Mission = { ...mission, operationProfile: { ...mission.operationProfile, minimumMasteryLevel: 1 as const } };
    const campaign = createInitialCampaign([l1Mission], [equipment]);
    const startedAt = performance.now();
    const recommendation = createCrewRotationRecommendation(
      campaign,
      l1Mission,
      boss,
      equipment,
      vessel,
      fullRoster,
      ['CHR-001', 'CHR-002', 'CHR-003'],
    );
    const elapsed = performance.now() - startedAt;

    expect(new Set(recommendation.teamIds).size).toBe(3);
    expect(recommendation.score.masteryReady).toBe(true);
    expect(elapsed).toBeLessThan(1_000);
  });
});
