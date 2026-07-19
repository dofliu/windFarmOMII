import { describe, expect, it } from 'vitest';
import {
  applyLoadout,
  applyMasteryPerks,
  applyOperationReadiness,
  awardCampaignMission,
  campaignCrewFatigue,
  campaignEquipmentCondition,
  campaignCompletionSummary,
  campaignContinueTargets,
  campaignMissionGrade,
  campaignMissionStatus,
  characterMastery,
  createInitialCampaign,
  crewReadinessBand,
  crewRestQuote,
  evaluateLoadout,
  evaluateOperationReadiness,
  evaluateSandboxLoadout,
  equipmentRepairQuote,
  isEquipmentServiceable,
  isCrewMemberDeployable,
  isSkillSlotUnlocked,
  MASTERY_PERKS,
  masteryPerkModifiers,
  maintainCampaignTurbine,
  maintainCampaignTurbinePlan,
  isCodexEntryUnlocked,
  normalizeCampaignProgress,
  parseCampaignSave,
  recordFleetConditionDispatch,
  repairCampaignEquipment,
  restCampaignCharacter,
  resolveDiagnosisDecision,
  serializeCampaignSave,
  teamMasteryPerks,
  unlockedMasteryPerks,
  unlockedCodexEntries,
} from './campaign';
import { createMission, missionDebrief } from './runtime';
import type {
  BossData,
  CharacterData,
  CodexEntryData,
  EquipmentData,
  MissionData,
  TurbineData,
  VesselData,
} from './types';

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
const turbine: TurbineData = {
  id: 'WTG-OWM-001', nameZh: '測試風機', nameEn: 'Test turbine', zone: 'T-01', ratedPowerMw: 12,
  initialReliability: 88, initialOpenFaults: 1,
};
const mission: MissionData = {
  id: 'MSN-1', chapter: 1, order: 1, titleZh: '任務一', titleEn: 'Mission one', briefingZh: '', briefingEn: '',
  bossId: boss.id, sceneId: 'SCN001', turbineId: 'WTG-OWM-001', recommendedFactionCodes: ['OMI'], recommendedEquipmentId: equipment.id,
  recommendedSpareId: spare.id, recommendedVesselId: vessel.id, unlockRequires: null, rewardXp: 100,
  rewardEquipmentTier: null,
  operationProfile: {
    siteCode: 'OWM-T01', siteNameZh: '測試風場', siteNameEn: 'Test wind farm',
    weatherZh: '短暫陣雨', weatherEn: 'Brief showers', seaState: 2,
    workPermitCode: 'PTW-TEST', workPermitZh: '測試工作許可', workPermitEn: 'Test work permit',
    minimumMasteryLevel: 1, minimumQualifiedMembers: 2,
    requiredPpeZh: ['救生衣'], requiredPpeEn: ['Lifejacket'],
    accessRequirementZh: '確認登塔窗口', accessRequirementEn: 'Confirm access window',
    allowedVesselClasses: ['SOV'], initialWeatherWindow: 91, mobilizationCost: 5,
    gameplayAbstraction: true,
  },
  branchEventDeck: [
    { round: 1, eventCode: 'WEATHER_ESCALATION', intensity: 0.75 },
    { round: 4, eventCode: 'SECONDARY_FAULT', intensity: 1 },
  ],
  learningObjectivesZh: [], learningObjectivesEn: [],
  diagnosisOptions: [
    { id: 'OK', labelZh: '正確', labelEn: 'Correct', correct: true, feedbackZh: '', feedbackEn: '' },
    { id: 'NO', labelZh: '錯誤', labelEn: 'Wrong', correct: false, feedbackZh: '', feedbackEn: '' },
  ],
};
const mission2: MissionData = { ...mission, id: 'MSN-2', order: 2, unlockRequires: mission.id };
const equipmentL2: EquipmentData = { ...equipment, id: 'EQ-A-L2', tier: 'L2', nameZh: '中級感測器', nameEn: 'Intermediate sensor' };
const spareL2: EquipmentData = { ...spare, id: 'EQ-S-L2', tier: 'L2', nameZh: '中級備品', nameEn: 'Intermediate spare' };
const equipmentL5: EquipmentData = { ...equipment, id: 'EQ-A-L5', tier: 'L5', nameZh: '傳奇感測器', nameEn: 'Mythic sensor' };
const allEquipment = [equipment, spare, equipmentL2, spareL2, equipmentL5];
const codexEntry: CodexEntryData = {
  id: 'KDX-001', unlockMissionId: mission.id, category: 'TEST', titleZh: '測試知識', titleEn: 'Test knowledge',
  summaryZh: '摘要', summaryEn: 'Summary', keyPointsZh: ['重點'], keyPointsEn: ['Point'],
  safetyNoteZh: '安全', safetyNoteEn: 'Safety', sourceNoteZh: '來源', sourceNoteEn: 'Source',
};
const character: CharacterData = {
  id: 'CHR-1', trackId: 'TRK001', artKey: '', nameZh: '', nameEn: '', factionCode: 'OMI', factionZh: '', factionEn: '',
  professionZh: '', professionEn: '', levelCode: 'L1', levelZh: '', levelEn: '', rarity: 'Common', stars: 1,
  fatigueMax: 100, fatigueRecovery: 7, actionPoints: 2, atk: 50, def: 50, intel: 50, speed: 50,
  passiveSkillId: '', skill1Id: '', skill2Id: '', ultimateSkillId: '', personality: '', toolsZh: '', toolsEn: '',
  ppe: '', story: '', palette: '', portraitFile: '', artStatus: '',
};

describe('Mission loadout and teaching decision', () => {
  it('把正確裝備、備品與船舶轉成可稽核的任務初始值', () => {
    const evaluation = evaluateLoadout(mission, equipment, spare, vessel);
    const loaded = applyLoadout(createMission(boss), evaluation);
    expect(evaluation.matchedChoices).toBe(3);
    expect(loaded.evidence).toBe(12);
    expect(loaded.reliability).toBe(15);
    expect(loaded.cost).toBe(16);
  });

  it('錯誤診斷會扣安全，正確診斷會建立證據', () => {
    const base = createMission(boss);
    expect(resolveDiagnosisDecision(base, mission.diagnosisOptions[1]).mission.safety).toBe(92);
    expect(resolveDiagnosisDecision(base, mission.diagnosisOptions[0]).mission.evidence).toBe(15);
  });

  it('Sandbox 只計部署成本，不取得教學配置 bonus', () => {
    const evaluation = evaluateSandboxLoadout(equipment, spare, vessel);
    expect(evaluation.matchedChoices).toBe(0);
    expect(evaluation.evidenceBonus).toBe(0);
    expect(evaluation.initialCost).toBe(16);
  });

  it('Operation readiness 必須同時通過確認、船舶與 Mastery，通過後才套用環境後果', () => {
    const team = [character, { ...character, id: 'CHR-2' }, { ...character, id: 'CHR-3' }];
    const progress = { ...createInitialCampaign([mission], allEquipment), characterXp: { [character.id]: 100, 'CHR-2': 100 } };
    const blocked = evaluateOperationReadiness(mission, team, progress, vessel, { permit: false, ppe: false, access: false });
    expect(blocked).toMatchObject({ ready: false, matchedChecks: 2, vesselReady: true, masteryReady: true, qualifiedMembers: 3 });
    expect(() => applyOperationReadiness(createMission(boss), blocked)).toThrow('readiness gate');

    const ready = evaluateOperationReadiness(mission, team, progress, vessel, { permit: true, ppe: true, access: true });
    expect(ready).toMatchObject({ ready: true, matchedChecks: 5, initialWeatherWindow: 91, mobilizationCost: 5 });
    expect(applyOperationReadiness(createMission(boss), ready)).toMatchObject({ weatherWindow: 91, cost: 5 });

    const wrongVessel = { ...vessel, class: 'CTV' as const };
    expect(evaluateOperationReadiness(mission, team, progress, wrongVessel, { permit: true, ppe: true, access: true }).ready).toBe(false);
  });
});

describe('Campaign progression', () => {
  it('初始只解鎖無前置任務的第一關', () => {
    const initial = createInitialCampaign([mission, mission2], allEquipment);
    expect(initial.unlockedMissionIds).toEqual([mission.id]);
    expect(initial.ownedEquipmentIds).toEqual([equipment.id, spare.id]);
  });

  it('任務地圖能區分完成、可出勤與鎖定狀態', () => {
    const initial = createInitialCampaign([mission, mission2], allEquipment);
    expect(campaignMissionStatus(mission, initial)).toBe('available');
    expect(campaignMissionStatus(mission2, initial)).toBe('locked');
    const progressed = normalizeCampaignProgress({ completedMissionIds: [mission.id], bestScores: { [mission.id]: 86 } }, [mission, mission2], allEquipment);
    expect(campaignMissionStatus(mission, progressed)).toBe('completed');
    expect(campaignMissionStatus(mission2, progressed)).toBe('available');
    expect(campaignMissionGrade(mission.id, progressed)).toBe('A');
    expect(campaignMissionGrade(mission2.id, progressed)).toBeNull();
  });

  it('任務結算後的 Continue CTA 只從當前進度推導下一個可出勤任務', () => {
    const initial = createInitialCampaign([mission, mission2], allEquipment);
    expect(campaignContinueTargets([mission, mission2], initial, mission.id)).toMatchObject({
      currentMission: mission,
      nextAvailableMission: mission,
      availableMissionCount: 1,
      campaignComplete: false,
    });

    const progressed = normalizeCampaignProgress({ completedMissionIds: [mission.id], bestScores: { [mission.id]: 86 } }, [mission, mission2], allEquipment);
    expect(campaignContinueTargets([mission, mission2], progressed, mission.id)).toMatchObject({
      currentMission: mission,
      nextAvailableMission: mission2,
      availableMissionCount: 1,
      campaignComplete: false,
    });

    const completed = normalizeCampaignProgress({ completedMissionIds: [mission.id, mission2.id], bestScores: { [mission.id]: 86, [mission2.id]: 91 } }, [mission, mission2], allEquipment);
    expect(campaignContinueTargets([mission, mission2], completed, mission2.id)).toMatchObject({
      currentMission: mission2,
      nextAvailableMission: undefined,
      availableMissionCount: 0,
      campaignComplete: true,
    });
    expect(Object.keys(completed)).not.toContain('continueTarget');
  });

  it('全任務完成後會產生章節、平均評級與 Mastery 統計', () => {
    const partial = normalizeCampaignProgress({ completedMissionIds: [mission.id], bestScores: { [mission.id]: 94 } }, [mission, mission2], allEquipment);
    expect(campaignCompletionSummary(partial, [mission, mission2]).complete).toBe(false);

    const completed = normalizeCampaignProgress({
      completedMissionIds: [mission.id, mission2.id],
      bestScores: { [mission.id]: 94, [mission2.id]: 86 },
      characterXp: { 'CHR-L5': 900, 'CHR-L4': 899 },
    }, [mission, mission2], allEquipment);
    expect(campaignCompletionSummary(completed, [mission, mission2])).toMatchObject({
      complete: true,
      completedMissions: 2,
      totalMissions: 2,
      completedChapters: 1,
      totalChapters: 1,
      averageBestScore: 90,
      campaignGrade: 'S',
      sGradeCount: 1,
      masteredCharacterCount: 1,
    });
  });

  it('Codex 只由已完成任務解鎖，reload 後不需要額外保存狀態', () => {
    const initial = createInitialCampaign([mission, mission2], allEquipment);
    expect(isCodexEntryUnlocked(codexEntry, initial)).toBe(false);
    const restored = normalizeCampaignProgress({ completedMissionIds: [mission.id] }, [mission, mission2], allEquipment);
    expect(isCodexEntryUnlocked(codexEntry, restored)).toBe(true);
    expect(unlockedCodexEntries([codexEntry], restored)).toEqual([codexEntry]);
  });

  it('完成任務會保存最佳分數、分配角色 XP 並解鎖下一關', () => {
    const state = createInitialCampaign([mission, mission2], allEquipment, [turbine]);
    const runtimeMission = { ...createMission(boss), complete: true, evidence: 80, safety: 90 };
    const debrief = missionDebrief(runtimeMission, boss, [{ characterId: character.id, fatigue: 0, actionPoints: 1, energy: 1, fatigueProtection: 0, cooldowns: {}, statuses: [] }], new Map([[character.id, character]]));
    const result = awardCampaignMission(state, mission, debrief, true, [character.id], [mission, mission2], allEquipment, [equipment.id, spare.id], [character], vessel, { [character.id]: 20 });
    expect(result.progress.completedMissionIds).toContain(mission.id);
    expect(result.progress.unlockedMissionIds).toContain(mission2.id);
    expect(result.progress.characterXp[character.id]).toBe(result.reward.earnedXp);
    expect(result.reward.newlyUnlockedMissionId).toBe(mission2.id);
    expect(result.reward.campaignCompleted).toBe(false);
    expect(result.reward).toMatchObject({
      currentScore: debrief.totalScore,
      currentGrade: debrief.grade,
      bestScoreAfter: debrief.totalScore,
      bestGradeAfter: debrief.grade,
      scoreRecordStatus: 'FIRST_BEST',
    });
    expect(result.reward.maintenanceCreditsEarned).toBe(33);
    expect(result.reward.equipmentWear.map((item) => item.after)).toEqual([92, 95]);
    expect(result.progress.maintenanceCredits).toBe(113);
    expect(result.reward.recoveryTokensEarned).toBe(2);
    expect(result.progress.recoveryTokens).toBe(5);
    expect(result.progress.crewFatigue[character.id]).toBe(14);
    expect(result.reward.windFarmUpdate).toMatchObject({ turbineId: turbine.id, reliabilityDelta: 8, backlogDelta: -1 });
    expect(result.progress.windFarm[turbine.id]).toMatchObject({ reliability: 96, availability: 'AVAILABLE', openFaults: 0, completedMissions: 1 });
    expect(result.progress.fleetOperationsHistory).toHaveLength(1);
    expect(result.progress.fleetOperationsHistory[0]).toMatchObject({
      sequence: 1,
      kind: 'MISSION',
      missionId: mission.id,
      turbineId: turbine.id,
      outcome: 'CLEAR',
      grade: 'S',
      creditsDelta: 33,
      reliabilityBefore: 88,
      reliabilityAfter: 96,
      backlogBefore: 1,
      backlogAfter: 0,
      availabilityBefore: 'DEGRADED',
      availabilityAfter: 'AVAILABLE',
    });

    const finalResult = awardCampaignMission(result.progress, mission2, debrief, true, [character.id], [mission, mission2], allEquipment, [equipment.id, spare.id], [character], vessel, { [character.id]: 35 });
    expect(finalResult.reward.newlyUnlockedMissionId).toBeUndefined();
    expect(finalResult.reward.campaignCompleted).toBe(true);
    expect(finalResult.progress.completedMissionIds).toEqual([mission.id, mission2.id]);
    expect(finalResult.progress.fleetOperationsHistory.map((item) => item.sequence)).toEqual([1, 2]);
  });

  it('重玩任務會比較本次分數與任務前 best，不新增存檔欄位', () => {
    const state = {
      ...createInitialCampaign([mission], allEquipment, [turbine]),
      completedMissionIds: [mission.id],
      bestScores: { [mission.id]: 99 },
    };
    const runtimeMission = { ...createMission(boss), complete: true, evidence: 80, safety: 90 };
    const debrief = missionDebrief(runtimeMission, boss, [{ characterId: character.id, fatigue: 0, actionPoints: 1, energy: 1, fatigueProtection: 0, cooldowns: {}, statuses: [] }], new Map([[character.id, character]]));
    const held = awardCampaignMission(state, mission, debrief, true, [character.id], [mission], allEquipment, [equipment.id, spare.id], [character], vessel, { [character.id]: 20 });
    expect(held.reward).toMatchObject({
      currentScore: debrief.totalScore,
      previousBestScore: 99,
      bestScoreAfter: 99,
      bestGradeAfter: 'S',
      scoreRecordStatus: 'BEST_HELD',
    });
    expect(held.progress.bestScores[mission.id]).toBe(99);

    const improved = awardCampaignMission({ ...state, bestScores: { [mission.id]: 10 } }, mission, debrief, true, [character.id], [mission], allEquipment, [equipment.id, spare.id], [character], vessel, { [character.id]: 20 });
    expect(improved.reward).toMatchObject({
      previousBestScore: 10,
      bestScoreAfter: debrief.totalScore,
      scoreRecordStatus: 'NEW_BEST',
    });
    expect(improved.progress.bestScores[mission.id]).toBe(debrief.totalScore);
  });

  it('損壞或舊版 save 會被正規化，不帶入未知任務', () => {
    const restored = normalizeCampaignProgress({ totalXp: -5, unlockedMissionIds: ['UNKNOWN'], completedMissionIds: ['MSN-1'], ownedEquipmentIds: ['UNKNOWN', equipmentL5.id] }, [mission, mission2], allEquipment);
    expect(restored.totalXp).toBe(0);
    expect(restored.unlockedMissionIds).toEqual([mission.id, mission2.id]);
    expect(restored.completedMissionIds).toEqual([mission.id]);
    expect(restored.ownedEquipmentIds).toEqual([equipment.id, spare.id]);
  });

  it('角色 XP 依門檻解鎖 Skill 2 與 Ultimate', () => {
    const novice = characterMastery(0);
    const trained = characterMastery(250);
    expect(novice.level).toBe(1);
    expect(isSkillSlotUnlocked(1, novice)).toBe(true);
    expect(isSkillSlotUnlocked(2, novice)).toBe(false);
    expect(trained.level).toBe(3);
    expect(isSkillSlotUnlocked(3, trained)).toBe(true);
  });

  it('L4/L5 Mastery perk 會產生個人與團隊任務 bonus', () => {
    expect(MASTERY_PERKS).toHaveLength(2);
    expect(unlockedMasteryPerks(499)).toHaveLength(0);
    expect(unlockedMasteryPerks(500).map((perk) => perk.id)).toEqual(['SPECIALIST_READINESS']);
    expect(unlockedMasteryPerks(900).map((perk) => perk.id)).toEqual(['SPECIALIST_READINESS', 'VETERAN_GUARD']);
    expect(masteryPerkModifiers(900)).toMatchObject({ startingEnergyBonus: 2, fatigueProtection: 2, evidenceBonus: 3, reliabilityBonus: 4 });

    const progress = { ...createInitialCampaign([mission], allEquipment), characterXp: { 'CHR-L5': 900, 'CHR-L4': 500 } };
    const perks = teamMasteryPerks(['CHR-L5', 'CHR-L4', 'CHR-L1'], progress);
    expect(perks.unlockedPerkCount).toBe(3);
    expect(perks.evidenceBonus).toBe(6);
    expect(perks.reliabilityBonus).toBe(4);
    const loaded = applyMasteryPerks(createMission(boss), perks);
    expect(loaded.evidence).toBe(6);
    expect(loaded.reliability).toBe(4);
  });

  it('可將戰役進度匯出並由 envelope 完整還原', () => {
    const progress = {
      ...createInitialCampaign([mission, mission2], allEquipment),
      totalXp: 360,
      completedMissionIds: [mission.id],
      unlockedMissionIds: [mission.id, mission2.id],
      bestScores: { [mission.id]: 88 },
      characterXp: { [character.id]: 120 },
    };
    const result = parseCampaignSave(serializeCampaignSave(progress), [mission, mission2], allEquipment);
    expect(result).toEqual({ ok: true, progress, migratedLegacy: false });
  });

  it('可 migration 舊版裸 CampaignProgress 並清除未知任務', () => {
    const legacy = JSON.stringify({ totalXp: 90, completedMissionIds: [mission.id, 'UNKNOWN'], unlockedMissionIds: ['UNKNOWN'] });
    const result = parseCampaignSave(legacy, [mission, mission2], allEquipment);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.migratedLegacy).toBe(true);
      expect(result.progress.completedMissionIds).toEqual([mission.id]);
      expect(result.progress.unlockedMissionIds).toEqual([mission.id, mission2.id]);
    }
  });

  it('拒絕損壞 JSON 與未支援的未來版本', () => {
    expect(parseCampaignSave('{oops', [mission], allEquipment)).toEqual({ ok: false, error: 'INVALID_JSON' });
    expect(parseCampaignSave(JSON.stringify({ format: 'OWM_CAMPAIGN_SAVE', schemaVersion: 6, progress: {} }), [mission], allEquipment))
      .toEqual({ ok: false, error: 'UNSUPPORTED_VERSION' });
    expect(parseCampaignSave(JSON.stringify({ format: 'OTHER_SAVE', schemaVersion: 2, totalXp: 5 }), [mission], allEquipment))
      .toEqual({ ok: false, error: 'INVALID_FORMAT' });
    expect(parseCampaignSave(JSON.stringify({ schemaVersion: 6, totalXp: 5 }), [mission], allEquipment))
      .toEqual({ ok: false, error: 'UNSUPPORTED_VERSION' });
  });

  it('章末 Mission 會解鎖下一 Tier，v1 save migration 可由完成紀錄重建 inventory', () => {
    const milestone = { ...mission, rewardEquipmentTier: 'L2' as const };
    const runtimeMission = { ...createMission(boss), complete: true, evidence: 80, safety: 90 };
    const debrief = missionDebrief(runtimeMission, boss, [{ characterId: character.id, fatigue: 0, actionPoints: 1, energy: 1, fatigueProtection: 0, cooldowns: {}, statuses: [] }], new Map([[character.id, character]]));
    const result = awardCampaignMission(createInitialCampaign([milestone], allEquipment), milestone, debrief, true, [character.id], [milestone], allEquipment, [equipment.id, spare.id], [character], vessel, { [character.id]: 20 });
    expect(result.reward.newlyUnlockedEquipmentTier).toBe('L2');
    expect(result.reward.newlyUnlockedEquipmentIds).toEqual([equipmentL2.id, spareL2.id]);
    expect(result.progress.ownedEquipmentIds).toEqual([equipment.id, spare.id, equipmentL2.id, spareL2.id]);

    const legacyEnvelope = JSON.stringify({
      format: 'OWM_CAMPAIGN_SAVE', schemaVersion: 1,
      progress: { schemaVersion: 1, completedMissionIds: [milestone.id], unlockedMissionIds: [milestone.id], ownedEquipmentIds: [equipmentL5.id] },
    });
    const migrated = parseCampaignSave(legacyEnvelope, [milestone], allEquipment);
    expect(migrated.ok).toBe(true);
    if (migrated.ok) {
      expect(migrated.migratedLegacy).toBe(true);
      expect(migrated.progress.schemaVersion).toBe(5);
      expect(migrated.progress.ownedEquipmentIds).toEqual([equipment.id, spare.id, equipmentL2.id, spareL2.id]);
      expect(migrated.progress.maintenanceCredits).toBe(80);
      expect(migrated.progress.equipmentCondition).toEqual({});
      expect(migrated.progress.recoveryTokens).toBe(3);
      expect(migrated.progress.crewFatigue).toEqual({});
    }
  });

  it('v4 save migration 會補上六機組狀態並輸出 v5 envelope', () => {
    const legacyV4 = JSON.stringify({
      format: 'OWM_CAMPAIGN_SAVE', schemaVersion: 4,
      progress: { schemaVersion: 4, totalXp: 50, completedMissionIds: [], unlockedMissionIds: [mission.id] },
    });
    const migrated = parseCampaignSave(legacyV4, [mission], allEquipment, [], [turbine]);
    expect(migrated.ok).toBe(true);
    if (!migrated.ok) return;
    expect(migrated.migratedLegacy).toBe(true);
    expect(migrated.progress.schemaVersion).toBe(5);
    expect(migrated.progress.windFarm[turbine.id]).toMatchObject({ reliability: 88, availability: 'DEGRADED', openFaults: 1 });
    expect(migrated.progress.fleetOperationsHistory).toEqual([]);
    expect(JSON.parse(serializeCampaignSave(migrated.progress))).toMatchObject({ schemaVersion: 5, progress: { schemaVersion: 5 } });
  });

  it('Fleet maintenance confirmation 會原子更新 MNT 與 v5 windFarm state', () => {
    const initial = createInitialCampaign([mission], allEquipment, [turbine]);
    const result = maintainCampaignTurbine(initial, turbine.id);
    expect(result?.settlement).toMatchObject({ beforeCredits: 80, afterCredits: 55 });
    expect(result?.progress).toMatchObject({ maintenanceCredits: 55 });
    expect(result?.progress.windFarm[turbine.id]).toMatchObject({ reliability: 96, availability: 'AVAILABLE', openFaults: 0, maintenanceActions: 1 });
    expect(result?.progress.fleetOperationsHistory).toHaveLength(1);
    expect(result?.progress.fleetOperationsHistory[0]).toMatchObject({
      sequence: 1,
      kind: 'MAINTENANCE',
      turbineId: turbine.id,
      actionCount: 1,
      creditsBefore: 80,
      creditsAfter: 55,
      creditsDelta: -25,
      reliabilityBefore: 88,
      reliabilityAfter: 96,
      backlogBefore: 1,
      backlogAfter: 0,
    });
    expect(initial).toMatchObject({ maintenanceCredits: 80 });
    expect(initial.fleetOperationsHistory).toEqual([]);
    expect(initial.windFarm[turbine.id]).toMatchObject({ reliability: 88, openFaults: 1, maintenanceActions: 0 });
  });

  it('Fleet maintenance plan confirmation 會一次原子更新多部風機與 MNT', () => {
    const secondTurbine: TurbineData = {
      id: 'WTG-OWM-004', nameZh: '測試四號', nameEn: 'Test Four', zone: 'T-04', ratedPowerMw: 15,
      initialReliability: 76, initialOpenFaults: 2,
    };
    const initial = createInitialCampaign([mission], allEquipment, [turbine, secondTurbine]);
    const result = maintainCampaignTurbinePlan(initial, [secondTurbine.id, turbine.id]);
    expect(result?.settlement).toMatchObject({
      turbineIds: [turbine.id, secondTurbine.id], beforeCredits: 80, afterCredits: 23, totalCost: 57,
    });
    expect(result?.progress).toMatchObject({ maintenanceCredits: 23 });
    expect(result?.progress.windFarm[turbine.id]).toMatchObject({ reliability: 96, availability: 'AVAILABLE', openFaults: 0, maintenanceActions: 1 });
    expect(result?.progress.windFarm[secondTurbine.id]).toMatchObject({ reliability: 86, availability: 'DEGRADED', openFaults: 1, maintenanceActions: 1 });
    expect(result?.progress.fleetOperationsHistory[0]).toMatchObject({
      sequence: 1,
      kind: 'MAINTENANCE_PLAN',
      turbineIds: [turbine.id, secondTurbine.id],
      actionCount: 2,
      creditsBefore: 80,
      creditsAfter: 23,
      creditsDelta: -57,
      reliabilityBefore: 82,
      reliabilityAfter: 91,
      backlogBefore: 3,
      backlogAfter: 1,
      fleetBefore: { available: 0, degraded: 2, offline: 0, averageReliability: 82, totalBacklog: 3 },
      fleetAfter: { available: 1, degraded: 1, offline: 0, averageReliability: 91, totalBacklog: 1 },
    });
    expect(initial).toMatchObject({ maintenanceCredits: 80 });
    expect(initial.windFarm[turbine.id]).toMatchObject({ reliability: 88, openFaults: 1, maintenanceActions: 0 });
    expect(initial.windFarm[secondTurbine.id]).toMatchObject({ reliability: 76, openFaults: 2, maintenanceActions: 0 });
  });

  it('Fleet Condition dispatch 會寫入 bounded operations history 並保留最近 30 筆', () => {
    const initial = createInitialCampaign([mission], allEquipment, [turbine]);
    const dispatched = recordFleetConditionDispatch(initial, mission, {
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
      mobilizationCostBefore: 2,
      mobilizationCostAfter: 7,
      safetyBefore: 100,
      safetyAfter: 95,
      reliabilityBefore: 15,
      reliabilityAfter: 12,
    });
    expect(dispatched.fleetOperationsHistory[0]).toMatchObject({
      sequence: 1,
      kind: 'DISPATCH',
      missionId: mission.id,
      turbineId: turbine.id,
      pressure: 'ELEVATED',
      costBefore: 2,
      costAfter: 7,
      safetyBefore: 100,
      safetyAfter: 95,
      reliabilityBefore: 15,
      reliabilityAfter: 12,
      backlogBefore: 1,
      backlogAfter: 1,
      availabilityBefore: 'DEGRADED',
      availabilityAfter: 'DEGRADED',
    });
    expect(initial.fleetOperationsHistory).toEqual([]);

    const history = Array.from({ length: 35 }, (_, index) => ({
      id: `OLD-${index}`,
      sequence: index + 1,
      kind: 'DISPATCH' as const,
      missionId: mission.id,
      turbineId: turbine.id,
    }));
    const normalized = normalizeCampaignProgress({ fleetOperationsHistory: history }, [mission], allEquipment, [], [turbine]);
    expect(normalized.fleetOperationsHistory).toHaveLength(30);
    expect(normalized.fleetOperationsHistory[0].sequence).toBe(6);
    expect(normalized.fleetOperationsHistory.at(-1)?.sequence).toBe(35);

    const withInvalid = normalizeCampaignProgress({
      fleetOperationsHistory: [
        { id: 'OK', sequence: 1, kind: 'MISSION', missionId: mission.id, turbineId: turbine.id, outcome: 'CLEAR' },
        { id: 'BAD-KIND', sequence: 2, kind: 'UNKNOWN' },
        { id: 'BAD-IDS', sequence: 3, kind: 'MISSION', missionId: 'NOPE', turbineId: 'NOPE', outcome: 'NOPE' },
      ],
    }, [mission], allEquipment, [], [turbine]);
    expect(withInvalid.fleetOperationsHistory).toHaveLength(2);
    expect(withInvalid.fleetOperationsHistory[0]).toMatchObject({ missionId: mission.id, turbineId: turbine.id, outcome: 'CLEAR' });
    expect(withInvalid.fleetOperationsHistory[1]).not.toHaveProperty('missionId');
    expect(withInvalid.fleetOperationsHistory[1]).not.toHaveProperty('turbineId');
  });

  it('任務損耗會降低實際攜帶裝備 Condition，維修依 Tier 扣除 MNT 並恢復至 100', () => {
    const worn = normalizeCampaignProgress({
      schemaVersion: 3,
      maintenanceCredits: 20,
      ownedEquipmentIds: [equipment.id, spare.id],
      equipmentCondition: { [equipment.id]: 20, [spare.id]: 70, UNKNOWN: 10 },
    }, [mission], allEquipment);
    expect(campaignEquipmentCondition(worn, equipment.id)).toBe(20);
    expect(isEquipmentServiceable(worn, equipment.id)).toBe(false);
    expect(isEquipmentServiceable(worn, spare.id)).toBe(true);
    expect(worn.equipmentCondition).toEqual({ [equipment.id]: 20, [spare.id]: 70 });

    const quote = equipmentRepairQuote(worn, equipment);
    expect(quote).toMatchObject({ condition: 20, missingCondition: 80, cost: 40, serviceable: false, canAfford: false });
    expect(repairCampaignEquipment(worn, equipment)).toBeNull();

    const funded = { ...worn, maintenanceCredits: 50 };
    const repaired = repairCampaignEquipment(funded, equipment);
    expect(repaired?.cost).toBe(40);
    expect(repaired?.progress.maintenanceCredits).toBe(10);
    expect(campaignEquipmentCondition(repaired!.progress, equipment.id)).toBe(100);
    expect(isEquipmentServiceable(repaired!.progress, equipment.id)).toBe(true);
  });

  it('Crew fatigue 會跨任務保存，Reserve 自動恢復，RST 可讓 Exhausted 技師重新出勤', () => {
    const reserve = { ...character, id: 'CHR-2', fatigueRecovery: 8 };
    const exhausted = normalizeCampaignProgress({
      schemaVersion: 4,
      recoveryTokens: 1,
      crewFatigue: { [character.id]: 100, [reserve.id]: 50, UNKNOWN: 80 },
    }, [mission], allEquipment, [character, reserve]);
    expect(campaignCrewFatigue(exhausted, character.id)).toBe(100);
    expect(crewReadinessBand(exhausted, character)).toBe('Exhausted');
    expect(isCrewMemberDeployable(exhausted, character)).toBe(false);
    expect(exhausted.crewFatigue).toEqual({ [character.id]: 100, [reserve.id]: 50 });

    const quote = crewRestQuote(exhausted, character);
    expect(quote).toMatchObject({ before: 100, recovery: 40, after: 60, tokenCost: 1, canRest: true });
    const rested = restCampaignCharacter(exhausted, character)!;
    expect(rested.progress.recoveryTokens).toBe(0);
    expect(campaignCrewFatigue(rested.progress, character.id)).toBe(60);
    expect(isCrewMemberDeployable(rested.progress, character)).toBe(true);

    const runtimeMission = { ...createMission(boss), complete: true, evidence: 80, safety: 90 };
    const debrief = missionDebrief(runtimeMission, boss, [{ characterId: character.id, fatigue: 70, actionPoints: 1, energy: 1, fatigueProtection: 0, cooldowns: {}, statuses: [] }], new Map([[character.id, character]]));
    const result = awardCampaignMission(rested.progress, mission, debrief, true, [character.id], [mission], allEquipment, [equipment.id, spare.id], [character, reserve], vessel, { [character.id]: 70 });
    expect(result.progress.crewFatigue[character.id]).toBe(64);
    expect(result.progress.crewFatigue[reserve.id]).toBe(34);
    expect(result.reward.crewFatigueUpdates).toEqual(expect.arrayContaining([
      expect.objectContaining({ characterId: character.id, source: 'deployed', missionEnd: 70, recovery: 6, after: 64 }),
      expect.objectContaining({ characterId: reserve.id, source: 'reserve', before: 50, recovery: 16, after: 34 }),
    ]));
  });
});
