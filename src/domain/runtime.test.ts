import { describe, expect, it } from 'vitest';
import {
  BOSS_CLASS_RULES,
  BOSS_CLASS_TELEGRAPHS,
  MISSION_BRANCH_EVENTS,
  beginTurn,
  bossClassTelegraph,
  branchEventForRound,
  createCharacterRuntime,
  createMission,
  endRound,
  fatigueBand,
  missionDebrief,
  previewEndRound,
  resolveMissionBranch,
  resolveSkill,
  resolveTeamSkill,
  stageAffinity,
  teamStageCoverage,
} from './runtime';
import type { BossData, CharacterData, EquipmentData, MissionData, SkillData } from './types';

const character: CharacterData = {
  id: 'CHR-TEST', trackId: 'TRK001', artKey: 'ART-TEST', nameZh: '測試工程師', nameEn: 'Test Engineer',
  factionCode: 'OMI', factionZh: '運維與檢測', factionEn: 'O&M', professionZh: '工程師', professionEn: 'Engineer',
  levelCode: 'L5', levelZh: '傳奇', levelEn: 'Mythic', rarity: 'Mythic', stars: 5,
  fatigueMax: 100, fatigueRecovery: 7, actionPoints: 4, atk: 50, def: 50, intel: 90, speed: 60,
  passiveSkillId: 'SK-P', skill1Id: 'SK-A', skill2Id: 'SK-B', ultimateSkillId: 'SK-U',
  personality: '', toolsZh: '', toolsEn: '', ppe: '', story: '', palette: '', portraitFile: '', artStatus: 'Prompt Ready',
};

const boss: BossData = {
  id: 'BOSS-TEST', class: 'WEA', nameZh: '測試風險', nameEn: 'Test Hazard', severity: 'S1',
  fatigueDamage: 12, resilience: 120, phases: 2, counterFactions: 'OMI,MAR', mechanic: '', fileName: '',
};

const activeSkill: SkillData = {
  id: 'SK-A', trackId: 'TRK001', faction: 'OMI', nameZh: '診斷', nameEn: 'Diagnose', type: 'Active', target: 'Boss',
  energyCost: 2, cooldown: 1, fatigueDelta: 8, power: 100, effectZh: '', statusEffect: 'Evidence', vfx: '', sfx: '',
};

const equipment: EquipmentData = {
  id: 'EQ-TEST', category: 'TOOLS', nameZh: '測試工具', nameEn: 'Test tool', tier: 'L3', rarity: 'Epic',
  fatigueRelief: 8, reliabilityBonus: 11, compatibleFaction: 'ALL', description: '', fileName: '',
};

const missionDefinition: MissionData = {
  id: 'MSN-TEST', chapter: 4, order: 10, titleZh: '測試任務', titleEn: 'Test mission', briefingZh: '', briefingEn: '',
  bossId: boss.id, sceneId: 'SCN001', turbineId: 'WTG-OWM-001', recommendedFactionCodes: ['OMI'], recommendedEquipmentId: equipment.id,
  recommendedSpareId: 'EQ-SPARE', recommendedVesselId: 'VES001', unlockRequires: null, rewardXp: 100,
  rewardEquipmentTier: null,
  operationProfile: {
    siteCode: 'OWM-T10', siteNameZh: '測試場址', siteNameEn: 'Test site', weatherZh: '強風', weatherEn: 'Strong wind', seaState: 4,
    workPermitCode: 'PTW-TEST', workPermitZh: '測試許可', workPermitEn: 'Test permit', minimumMasteryLevel: 3, minimumQualifiedMembers: 2,
    requiredPpeZh: ['救生衣'], requiredPpeEn: ['Lifejacket'], accessRequirementZh: '雙人確認', accessRequirementEn: 'Two-person verification',
    allowedVesselClasses: ['SOV'], initialWeatherWindow: 96, mobilizationCost: 6, gameplayAbstraction: true,
  },
  branchEventDeck: [
    { round: 1, eventCode: 'SPARE_DELAY', intensity: 0.75 },
    { round: 4, eventCode: 'SECONDARY_FAULT', intensity: 1.35 },
    { round: 7, eventCode: 'COMMS_OUTAGE', intensity: 1.55 },
  ],
  learningObjectivesZh: [], learningObjectivesEn: [],
  diagnosisOptions: [{ id: 'D-OK', labelZh: '', labelEn: '', correct: true, feedbackZh: '', feedbackEn: '' }],
};

describe('Character runtime', () => {
  it('使用 Charter 疲勞門檻', () => {
    expect(fatigueBand({ ...createCharacterRuntime(character), fatigue: 39 }, character)).toBe('Stable');
    expect(fatigueBand({ ...createCharacterRuntime(character), fatigue: 40 }, character)).toBe('Tired');
    expect(fatigueBand({ ...createCharacterRuntime(character), fatigue: 70 }, character)).toBe('Critical');
    expect(fatigueBand({ ...createCharacterRuntime(character), fatigue: 100 }, character)).toBe('Exhausted');
  });

  it('分離 AP 與 Energy，並於新回合恢復', () => {
    const runtime = beginTurn({ ...createCharacterRuntime(character), fatigue: 20, actionPoints: 0, energy: 4 }, character);
    expect(runtime.actionPoints).toBe(4);
    expect(runtime.energy).toBe(7);
    expect(runtime.fatigue).toBe(13);
  });

  it('Mastery perk 會提高初始 Energy 並降低個人回合疲勞傷害', () => {
    const runtime = createCharacterRuntime(character, {
      startingEnergyBonus: 2,
      fatigueProtection: 2,
      statuses: ['SpecialistReady', 'VeteranGuard'],
    });
    expect(runtime.energy).toBe(6);
    expect(runtime.fatigueProtection).toBe(2);
    expect(runtime.statuses).toEqual(['SpecialistReady', 'VeteranGuard']);
    const result = endRound(createMission(boss), boss, [runtime], new Map([[character.id, character]]), equipment);
    expect(result.fatigueDamage).toBe(8);
    expect(result.fatigueDamageByCharacter[character.id]).toBe(6);
    expect(result.team[0].fatigue).toBe(0);
  });

  it('previews the next End Round pressure with the same numbers used by settlement', () => {
    const runtime = createCharacterRuntime(character, {
      fatigueProtection: 2,
      statuses: ['VeteranGuard'],
    }, 88);
    const mission = { ...createMission(boss), safety: 18, weatherWindow: 30 };
    const characters = new Map([[character.id, character]]);
    const forecast = previewEndRound(mission, boss, [runtime], characters, equipment);
    const settled = endRound(mission, boss, [runtime], characters, equipment);

    expect(forecast.fatigueDamage).toBe(settled.fatigueDamage);
    expect(forecast.fatigueDamageByCharacter[character.id]).toBe(settled.fatigueDamageByCharacter[character.id]);
    expect(forecast.safetyLoss).toBe(settled.safetyLoss);
    expect(forecast.weatherLoss).toBe(settled.weatherLoss);
    expect(forecast.safetyAfter).toBe(settled.mission.safety);
    expect(forecast.weatherAfter).toBe(settled.mission.weatherWindow);
    expect(forecast.failureReason).toBe(settled.mission.failureReason);
  });
});

describe('Mission resolver', () => {
  it('高 power 技能一次最多推進一個工程階段', () => {
    const runtime = createCharacterRuntime(character);
    const result = resolveSkill(createMission(boss), boss, runtime, character, activeSkill);
    expect(result.ok).toBe(true);
    expect(result.stageAdvanced).toBe(true);
    expect(result.mission.stageIndex).toBe(1);
    expect(result.mission.complete).toBe(false);
    expect(result.appliedPower).toBe(125);
  });

  it('六階段完成後進入下一個 Boss phase', () => {
    let mission = createMission(boss);
    let runtime = createCharacterRuntime(character);
    const freeSkill = { ...activeSkill, energyCost: 0, cooldown: 0, fatigueDelta: 0 };
    for (let index = 0; index < 6; index += 1) {
      const result = resolveSkill(mission, boss, runtime, character, freeSkill);
      mission = result.mission;
      runtime = { ...result.actor, actionPoints: 4 };
    }
    expect(mission.phase).toBe(2);
    expect(mission.stageIndex).toBe(0);
    expect(mission.complete).toBe(false);
  });

  it('把職系階段專長、Boss 克制與裝備加成組合成可稽核倍率', () => {
    const aca = { ...character, id: 'CHR-ACA', factionCode: 'ACA' };
    const result = resolveSkill(createMission(boss), boss, createCharacterRuntime(aca), aca, activeSkill, equipment);
    expect(stageAffinity('ACA', 'Detect')).toBe(1.25);
    expect(result.stageMultiplier).toBe(1.25);
    expect(result.counterMultiplier).toBe(1);
    expect(result.equipmentBonus).toBe(11);
    expect(result.appliedPower).toBe(139);
  });

  it('友軍技能會恢復整隊疲勞，而不是只改施術者', () => {
    const ally = { ...character, id: 'CHR-ALLY', factionCode: 'MAR' };
    const characters = new Map([[character.id, character], [ally.id, ally]]);
    const team = [
      { ...createCharacterRuntime(character), fatigue: 30, energy: 10 },
      { ...createCharacterRuntime(ally), fatigue: 40, energy: 10 },
    ];
    const support = { ...activeSkill, target: 'Allies', fatigueDelta: -10, energyCost: 0 };
    const result = resolveTeamSkill(createMission(boss), boss, team, characters, 0, support);
    expect(result.team.map((member) => member.fatigue)).toEqual([20, 30]);
    expect(result.recoveredTeamFatigue).toBe(20);
  });

  it('回合風險會扣除天候與安全，裝備降低疲勞衝擊', () => {
    const characters = new Map([[character.id, character]]);
    const result = endRound(createMission(boss), boss, [createCharacterRuntime(character)], characters, equipment);
    expect(result.fatigueDamage).toBe(8);
    expect(result.team[0].fatigue).toBe(1);
    expect(result.mission.weatherWindow).toBe(86);
    expect(result.mission.safety).toBeLessThan(100);
  });

  it('結算同時考量完成度、安全、證據、時間、疲勞與成本', () => {
    const mission = { ...createMission(boss), complete: true, evidence: 80, safety: 90 };
    const debrief = missionDebrief(mission, boss, [createCharacterRuntime(character)], new Map([[character.id, character]]));
    expect(debrief.completionScore).toBe(100);
    expect(debrief.costScore).toBeGreaterThan(0);
    expect(debrief.totalScore).toBeGreaterThanOrEqual(80);
    expect(['S', 'A', 'B']).toContain(debrief.grade);
  });

  it('隊伍涵蓋率可指出六個階段的專業缺口', () => {
    const coverage = teamStageCoverage([
      { ...character, factionCode: 'ACA' },
      { ...character, id: 'CHR-MAR', factionCode: 'MAR' },
      { ...character, id: 'CHR-OMI', factionCode: 'OMI' },
    ]);
    expect(coverage.Detect).toBe(2);
    expect(coverage.Diagnose).toBe(2);
    expect(coverage.Repair).toBe(2);
    expect(coverage.Restore).toBe(1);
  });

  it('14 種 Boss class 具有不同且可稽核的事件組合', () => {
    expect(Object.keys(BOSS_CLASS_RULES)).toHaveLength(14);
    const signatures = Object.values(BOSS_CLASS_RULES).map((rule) => [
      rule.fatigueBonus, rule.safetyBonus, rule.weatherBonus, rule.evidenceLoss,
      rule.reliabilityLoss, rule.progressLoss, rule.costIncrease, rule.energyDrain,
    ].join(':'));
    expect(new Set(signatures).size).toBe(14);
  });

  it('14 種 Boss class 具有獨立 telegraph pattern、圖示與影響資源', () => {
    expect(Object.keys(BOSS_CLASS_TELEGRAPHS)).toHaveLength(14);
    expect(new Set(Object.values(BOSS_CLASS_TELEGRAPHS).map((item) => item.pattern)).size).toBe(14);
    Object.values(BOSS_CLASS_TELEGRAPHS).forEach((item) => {
      expect(item.icon.length).toBeGreaterThan(0);
      expect(item.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(item.impacts.length).toBeGreaterThan(0);
    });
    expect(bossClassTelegraph('UNKNOWN').code).toBe('UNKNOWN');
  });

  it('通訊、控制、腐蝕與數位事件會修改不同任務資源', () => {
    const characters = new Map([[character.id, character]]);
    const base = { ...createMission(boss), evidence: 20, reliability: 20, progress: 10 };
    const team = [createCharacterRuntime(character)];
    const com = endRound(base, { ...boss, class: 'COM' }, team, characters);
    const ctl = endRound(base, { ...boss, class: 'CTL' }, team, characters);
    const cor = endRound(base, { ...boss, class: 'COR' }, team, characters);
    const dig = endRound(base, { ...boss, class: 'DIG' }, team, characters);
    expect(com.mission.evidence).toBe(16);
    expect(ctl.mission.progress).toBe(7);
    expect(cor.mission.reliability).toBe(16);
    expect(cor.mission.cost).toBe(2);
    expect(dig.team[0].energy).toBe(6);
  });

  it('Sandbox 五類 branch event 保留固定 fallback 排程', () => {
    const firstRoundEvents = Array.from({ length: 5 }, (_, index) => branchEventForRound({ ...boss, id: `BOSS00${index + 1}` }, 1)?.code);
    expect(firstRoundEvents).toEqual(MISSION_BRANCH_EVENTS.map((event) => event.code));
    const penaltySignatures = MISSION_BRANCH_EVENTS.map((event) => Object.values(event.penalty).join(':'));
    expect(new Set(penaltySignatures).size).toBe(5);
    expect(branchEventForRound(boss, 2)).toBeUndefined();
    expect(branchEventForRound(boss, 4)).toBeDefined();
  });

  it('Campaign 依任務 event deck 的回合、事件與強度產生可重現 escalation', () => {
    const first = branchEventForRound(boss, 1, missionDefinition);
    const second = branchEventForRound(boss, 4, missionDefinition);
    expect(first?.code).toBe('SPARE_DELAY');
    expect(first?.missionSpecific).toBe(true);
    expect(first?.intensity).toBe(0.75);
    expect(first?.penalty.costIncrease).toBe(6);
    expect(branchEventForRound(boss, 2, missionDefinition)).toBeUndefined();
    expect(second?.code).toBe('SECONDARY_FAULT');
    expect(second?.intensity).toBe(1.35);
    expect(second?.penalty.safetyLoss).toBe(9);
    expect(second?.penalty.progressLoss).toBe(3);
  });

  it('Reactive skill 會消耗 AP／Energy 並降低 branch event 後果', () => {
    const event = MISSION_BRANCH_EVENTS[0];
    const base = createMission(boss);
    const team = [{ ...createCharacterRuntime(character), energy: 10 }];
    const full = resolveMissionBranch(base, team, event);
    const reactive = { ...activeSkill, type: 'Reactive' as const, power: 100, fatigueDelta: 5, cooldown: 2 };
    const mitigated = resolveMissionBranch(base, team, event, { actorIndex: 0, character, skill: reactive });
    expect(full.mission.weatherWindow).toBe(92);
    expect(mitigated.ok).toBe(true);
    expect(mitigated.mitigated).toBe(true);
    expect(mitigated.mission.weatherWindow).toBeGreaterThan(full.mission.weatherWindow);
    expect(mitigated.team[0].actionPoints).toBe(3);
    expect(mitigated.team[0].energy).toBe(8);
    expect(mitigated.team[0].statuses).toContain('BranchGuard');
  });

  it('Active skill 不可冒充 Reactive event response', () => {
    const event = MISSION_BRANCH_EVENTS[2];
    const team = [createCharacterRuntime(character)];
    const result = resolveMissionBranch(createMission(boss), team, event, { actorIndex: 0, character, skill: activeSkill });
    expect(result.ok).toBe(false);
    expect(result.mission.safety).toBe(100);
    expect(result.team).toEqual(team);
  });

  it('Reactive skill 不會在一般工程階段被當成 Active skill 使用', () => {
    const reactive = { ...activeSkill, type: 'Reactive' as const };
    const result = resolveSkill(createMission(boss), boss, createCharacterRuntime(character), character, reactive);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('事件窗口');
  });
});
