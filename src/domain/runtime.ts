import type { BossData, CharacterData, EquipmentData, MissionBranchCode, MissionData, SkillData, VesselData } from './types';

export type { MissionBranchCode } from './types';

export const MISSION_STAGES = ['Detect', 'Diagnose', 'Isolate', 'Repair', 'Verify', 'Restore'] as const;
export type MissionStage = (typeof MISSION_STAGES)[number];
export type FatigueBand = 'Stable' | 'Tired' | 'Critical' | 'Exhausted';
export type MissionFailureReason = 'TeamExhausted' | 'RoundLimit' | 'WeatherWindow' | 'Safety';

export interface CharacterRuntimeState {
  characterId: string;
  fatigue: number;
  actionPoints: number;
  energy: number;
  fatigueProtection: number;
  cooldowns: Record<string, number>;
  statuses: string[];
}

export interface MissionState {
  bossId: string;
  stageIndex: number;
  phase: number;
  progress: number;
  requirement: number;
  round: number;
  roundLimit: number;
  weatherWindow: number;
  safety: number;
  evidence: number;
  reliability: number;
  cost: number;
  fleetConditionApplied?: boolean;
  complete: boolean;
  failed: boolean;
  failureReason?: MissionFailureReason;
}

export interface SkillResolution {
  ok: boolean;
  message: string;
  appliedPower: number;
  stageAdvanced: boolean;
  actor: CharacterRuntimeState;
  mission: MissionState;
  counterMultiplier: number;
  stageMultiplier: number;
  fatigueMultiplier: number;
  equipmentBonus: number;
}

export interface TeamSkillResolution extends SkillResolution {
  team: CharacterRuntimeState[];
  recoveredTeamFatigue: number;
}

export interface RoundResolution {
  mission: MissionState;
  team: CharacterRuntimeState[];
  fatigueDamage: number;
  fatigueDamageByCharacter: Record<string, number>;
  safetyLoss: number;
  weatherLoss: number;
  classEvent?: BossClassRule;
}

export interface EndRoundForecast {
  fatigueDamage: number;
  fatigueDamageByCharacter: Record<string, number>;
  safetyLoss: number;
  weatherLoss: number;
  nextRound: number;
  safetyAfter: number;
  weatherAfter: number;
  evidenceLoss: number;
  reliabilityLoss: number;
  progressLoss: number;
  costIncrease: number;
  energyDrain: number;
  exhaustedAfter: number;
  failureReason?: MissionFailureReason;
  classEvent?: BossClassRule;
}

export interface BossClassRule {
  code: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  fatigueBonus: number;
  safetyBonus: number;
  weatherBonus: number;
  evidenceLoss: number;
  reliabilityLoss: number;
  progressLoss: number;
  costIncrease: number;
  energyDrain: number;
}

export type BossImpactResource = 'fatigue' | 'safety' | 'weather' | 'evidence' | 'reliability' | 'progress' | 'cost' | 'energy';

export interface BossClassTelegraph {
  code: string;
  icon: string;
  accent: string;
  pattern: 'squall' | 'oxidation' | 'fracture' | 'shock' | 'arc' | 'oscillation' | 'pressure' | 'sonar' | 'blackout' | 'glitch' | 'grid' | 'swell' | 'delay' | 'resonance';
  impacts: BossImpactResource[];
}

export interface BranchPenalty {
  weatherLoss: number;
  safetyLoss: number;
  evidenceLoss: number;
  reliabilityLoss: number;
  progressLoss: number;
  costIncrease: number;
  energyDrain: number;
}

export interface MissionBranchEvent {
  code: MissionBranchCode;
  icon: string;
  accent: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  intensity: number;
  triggerRound?: number;
  missionSpecific: boolean;
  penalty: BranchPenalty;
}

export interface BranchResolution {
  ok: boolean;
  message: string;
  mission: MissionState;
  team: CharacterRuntimeState[];
  mitigated: boolean;
  mitigationRate: number;
  appliedPenalty: BranchPenalty;
}

export interface MissionDebrief {
  totalScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  safetyScore: number;
  completionScore: number;
  evidenceScore: number;
  timeScore: number;
  fatigueScore: number;
  costScore: number;
}

const STARTING_ENERGY = 4;
// 高階角色的 Support／Ultimate 成本為 6–8；每回合回復 3 才能讓 L3/L5 技能組合形成正向成長曲線。
const ENERGY_PER_ROUND = 3;
const MAX_ENERGY = 10;

// 陣營只提供階段加成而非硬性封鎖，讓跨專業隊伍有策略差異，也避免單一缺卡造成死局。
export const FACTION_STAGE_SPECIALTIES: Record<string, readonly MissionStage[]> = {
  GOV: ['Detect', 'Isolate', 'Restore'],
  ACA: ['Detect', 'Diagnose', 'Verify'],
  DEV: ['Isolate', 'Repair', 'Restore'],
  MFG: ['Repair', 'Verify', 'Restore'],
  MAR: ['Detect', 'Isolate', 'Repair'],
  OMI: ['Diagnose', 'Isolate', 'Repair', 'Verify', 'Restore'],
  DIG: ['Detect', 'Diagnose', 'Verify', 'Restore'],
};

// 每個 Boss class 都有可觀察、可測試的回合壓力；數值為 gameplay balance，不代表真實故障率。
export const BOSS_CLASS_RULES: Record<string, BossClassRule> = {
  WEA: bossRule('WEA', '天候惡化', 'Weather escalation', '天候窗口額外縮短。', 'Weather window closes faster.', { weatherBonus: 4 }),
  COR: bossRule('COR', '腐蝕擴散', 'Corrosion spread', '可靠度下降並增加處置成本。', 'Reliability falls and intervention cost rises.', { reliabilityLoss: 4, costIncrease: 2 }),
  BLD: bossRule('BLD', '裂紋延伸', 'Crack propagation', '安全壓力增加，當前階段進度受損。', 'Safety pressure rises and current progress is lost.', { safetyBonus: 3, progressLoss: 1 }),
  DRV: bossRule('DRV', '傳動衝擊', 'Drivetrain shock', '全隊承受額外疲勞。', 'The crew receives extra fatigue.', { fatigueBonus: 2 }),
  ELE: bossRule('ELE', '電氣危害', 'Electrical hazard', '安全餘裕額外下降。', 'Safety margin falls faster.', { safetyBonus: 4 }),
  CTL: bossRule('CTL', '控制振盪', 'Control oscillation', '當前工程階段進度回退。', 'Current engineering progress regresses.', { progressLoss: 3 }),
  HYD: bossRule('HYD', '液壓洩壓', 'Hydraulic pressure loss', '增加疲勞與安全壓力。', 'Fatigue and safety pressure increase.', { fatigueBonus: 1, safetyBonus: 2 }),
  CAB: bossRule('CAB', '海纜定位成本', 'Cable localization cost', '海纜定位與船期增加成本。', 'Cable localization and vessel time add cost.', { costIncrease: 4 }),
  COM: bossRule('COM', '通訊盲區', 'Communication blackout', '遙測證據流失。', 'Telemetry evidence is lost.', { evidenceLoss: 4 }),
  DIG: bossRule('DIG', '資料污染', 'Data contamination', '證據可信度下降並消耗 Energy。', 'Evidence confidence falls and Energy is drained.', { evidenceLoss: 6, energyDrain: 1 }),
  GRD: bossRule('GRD', '電網擾動', 'Grid disturbance', '安全壓力增加並消耗更多 Energy。', 'Safety pressure rises and more Energy is drained.', { safetyBonus: 2, energyDrain: 2 }),
  SEA: bossRule('SEA', '海況衝擊', 'Sea-state impact', '天候窗口縮短且增加疲勞。', 'Weather window and crew endurance deteriorate.', { weatherBonus: 2, fatigueBonus: 2 }),
  OPS: bossRule('OPS', '調度延誤', 'Logistics delay', '船期延誤增加成本並壓縮天候窗口。', 'Logistics delay adds cost and consumes weather window.', { weatherBonus: 1, costIncrease: 3 }),
  STR: bossRule('STR', '結構共振', 'Structural resonance', '安全壓力增加並使進度回退。', 'Safety pressure rises and progress regresses.', { safetyBonus: 1, progressLoss: 4 }),
};

// Telegraph 只描述即時 UI/VFX，不參與數值結算；圖示、文字與色彩並用以符合可及性要求。
export const BOSS_CLASS_TELEGRAPHS: Record<string, BossClassTelegraph> = {
  WEA: { code: 'WEA', icon: '≋', accent: '#67c9e8', pattern: 'squall', impacts: ['weather'] },
  COR: { code: 'COR', icon: '◌', accent: '#d99b62', pattern: 'oxidation', impacts: ['reliability', 'cost'] },
  BLD: { code: 'BLD', icon: '⌁', accent: '#f07b69', pattern: 'fracture', impacts: ['safety', 'progress'] },
  DRV: { code: 'DRV', icon: '✦', accent: '#f1ba62', pattern: 'shock', impacts: ['fatigue'] },
  ELE: { code: 'ELE', icon: 'ϟ', accent: '#f3df67', pattern: 'arc', impacts: ['safety'] },
  CTL: { code: 'CTL', icon: '⌇', accent: '#b796ff', pattern: 'oscillation', impacts: ['progress'] },
  HYD: { code: 'HYD', icon: '◒', accent: '#4fb7e3', pattern: 'pressure', impacts: ['fatigue', 'safety'] },
  CAB: { code: 'CAB', icon: '◎', accent: '#62d6bd', pattern: 'sonar', impacts: ['cost'] },
  COM: { code: 'COM', icon: '⌁', accent: '#8c9eb0', pattern: 'blackout', impacts: ['evidence'] },
  DIG: { code: 'DIG', icon: '▦', accent: '#d47ee8', pattern: 'glitch', impacts: ['evidence', 'energy'] },
  GRD: { code: 'GRD', icon: '↯', accent: '#7ca9ff', pattern: 'grid', impacts: ['safety', 'energy'] },
  SEA: { code: 'SEA', icon: '≈', accent: '#56b9c8', pattern: 'swell', impacts: ['weather', 'fatigue'] },
  OPS: { code: 'OPS', icon: '◷', accent: '#daaa73', pattern: 'delay', impacts: ['weather', 'cost'] },
  STR: { code: 'STR', icon: '⋈', accent: '#ed826f', pattern: 'resonance', impacts: ['safety', 'progress'] },
};

// 分支事件使用固定順序與可重現排程，讓教學、測試與 replay 不受隨機數影響。
export const MISSION_BRANCH_EVENTS: readonly MissionBranchEvent[] = [
  branchEvent('WEATHER_ESCALATION', '≋', '#67c9e8', '天候惡化', 'Weather escalation', '作業窗口快速縮短，需立即判斷是否中止或調整程序。', 'The operating window closes rapidly; stop or adapt the procedure.', { weatherLoss: 8 }),
  branchEvent('SPARE_DELAY', '◷', '#d99b62', '備品延誤', 'Spare delay', '備品與船期延誤增加成本並降低修復可靠度。', 'Spare and vessel delay increase cost and reduce repair reliability.', { reliabilityLoss: 3, costIncrease: 8 }),
  branchEvent('SECONDARY_FAULT', '⌁', '#f07b69', '二次故障', 'Secondary fault', '相鄰系統出現異常，安全餘裕與當前進度受損。', 'An adjacent system degrades, reducing safety margin and progress.', { safetyLoss: 7, progressLoss: 2 }),
  branchEvent('COMMS_OUTAGE', '⌁', '#8c9eb0', '通訊中斷', 'Communications outage', '遙測鏈暫時中斷，證據與全隊 Energy 受影響。', 'Telemetry is interrupted, affecting evidence and team Energy.', { evidenceLoss: 10, energyDrain: 1 }),
  branchEvent('FALSE_ALARM', '◇', '#b796ff', '誤警報', 'False alarm', '錯誤訊號造成判斷成本與證據可信度下降。', 'A false signal adds decision cost and reduces evidence confidence.', { evidenceLoss: 6, costIncrease: 2 }),
];

export function bossClassRule(classCode: string): BossClassRule {
  return BOSS_CLASS_RULES[classCode] ?? bossRule(classCode, '一般風險', 'General hazard', '套用標準回合壓力。', 'Standard round pressure applies.', {});
}

export function bossClassTelegraph(classCode: string): BossClassTelegraph {
  return BOSS_CLASS_TELEGRAPHS[classCode] ?? { code: classCode, icon: '◇', accent: '#8db8c4', pattern: 'swell', impacts: ['fatigue'] };
}

export function missionBranchEventDefinition(code: MissionBranchCode): MissionBranchEvent {
  const event = MISSION_BRANCH_EVENTS.find((candidate) => candidate.code === code);
  if (!event) throw new Error(`未知 Mission branch event：${code}`);
  return event;
}

export function branchEventForRound(boss: BossData, completedRound: number, mission?: MissionData): MissionBranchEvent | undefined {
  if (mission) {
    const trigger = mission.branchEventDeck.find((candidate) => candidate.round === completedRound);
    if (!trigger) return undefined;
    const event = missionBranchEventDefinition(trigger.eventCode);
    return {
      ...event,
      intensity: trigger.intensity,
      triggerRound: trigger.round,
      missionSpecific: true,
      penalty: scaleBranchPenalty(event.penalty, trigger.intensity),
    };
  }
  if (completedRound < 1 || (completedRound - 1) % 3 !== 0) return undefined;
  const bossNumber = Number(boss.id.match(/(\d+)/)?.[1] ?? 1);
  const index = Math.abs(bossNumber + completedRound - 2) % MISSION_BRANCH_EVENTS.length;
  return MISSION_BRANCH_EVENTS[index];
}

export function resolveMissionBranch(
  mission: MissionState,
  team: CharacterRuntimeState[],
  event: MissionBranchEvent,
  response?: { actorIndex: number; character: CharacterData; skill: SkillData },
): BranchResolution {
  if (mission.complete || mission.failed) return rejectedBranch('任務已結束', mission, team, event.penalty);

  let mitigationRate = 0;
  let nextTeam = [...team];
  if (response) {
    const actor = team[response.actorIndex];
    if (!actor || actor.characterId !== response.character.id) return rejectedBranch('事件回應角色無效', mission, team, event.penalty);
    if (response.skill.type !== 'Reactive') return rejectedBranch('此事件只能使用 Reactive skill', mission, team, event.penalty);
    const availability = canUseSkill(actor, response.character, response.skill);
    if (!availability.ok) return rejectedBranch(availability.reason ?? 'Reactive skill 目前不可用', mission, team, event.penalty);
    mitigationRate = clamp(0.35 + response.skill.power / 400, 0.35, 0.8);
    const statuses = uniqueStatus(actor.statuses, response.skill.statusEffect, 'BranchGuard');
    nextTeam[response.actorIndex] = {
      ...actor,
      fatigue: clamp(actor.fatigue + response.skill.fatigueDelta, 0, response.character.fatigueMax),
      actionPoints: actor.actionPoints - 1,
      energy: actor.energy - response.skill.energyCost,
      cooldowns: response.skill.cooldown > 0 ? { ...actor.cooldowns, [response.skill.id]: response.skill.cooldown } : actor.cooldowns,
      statuses,
    };
  }

  const scale = 1 - mitigationRate;
  const appliedPenalty = scaleBranchPenalty(event.penalty, scale);
  nextTeam = nextTeam.map((runtime) => ({ ...runtime, energy: Math.max(0, runtime.energy - appliedPenalty.energyDrain) }));
  const weatherWindow = Math.max(0, mission.weatherWindow - appliedPenalty.weatherLoss);
  const safety = Math.max(0, mission.safety - appliedPenalty.safetyLoss);
  const failureReason: MissionFailureReason | undefined = safety <= 0
    ? 'Safety'
    : weatherWindow <= 0
      ? 'WeatherWindow'
      : mission.failureReason;
  const nextMission: MissionState = {
    ...mission,
    weatherWindow,
    safety,
    evidence: Math.max(0, mission.evidence - appliedPenalty.evidenceLoss),
    reliability: Math.max(0, mission.reliability - appliedPenalty.reliabilityLoss),
    progress: Math.max(0, mission.progress - appliedPenalty.progressLoss),
    cost: mission.cost + appliedPenalty.costIncrease,
    failed: Boolean(failureReason),
    failureReason,
  };
  return {
    ok: true,
    message: response ? 'Reactive skill 已降低事件衝擊' : '分支事件後果已結算',
    mission: nextMission,
    team: nextTeam,
    mitigated: Boolean(response),
    mitigationRate,
    appliedPenalty,
  };
}

export function createCharacterRuntime(
  character: CharacterData,
  modifiers: { startingEnergyBonus?: number; fatigueProtection?: number; statuses?: string[] } = {},
  initialFatigue = 0,
): CharacterRuntimeState {
  return {
    characterId: character.id,
    // Campaign 可帶入任務間累積疲勞；Sandbox 與既有呼叫未傳值時仍從 0 開始。
    fatigue: clamp(initialFatigue, 0, character.fatigueMax),
    actionPoints: character.actionPoints,
    energy: Math.min(MAX_ENERGY, STARTING_ENERGY + Math.max(0, modifiers.startingEnergyBonus ?? 0)),
    fatigueProtection: Math.max(0, modifiers.fatigueProtection ?? 0),
    cooldowns: {},
    statuses: [...new Set(modifiers.statuses ?? [])],
  };
}

export function fatigueRatio(runtime: CharacterRuntimeState, character: CharacterData): number {
  return character.fatigueMax <= 0 ? 0 : Math.min(1, runtime.fatigue / character.fatigueMax);
}

export function fatigueBand(runtime: CharacterRuntimeState, character: CharacterData): FatigueBand {
  const ratio = fatigueRatio(runtime, character);
  if (ratio >= 1) return 'Exhausted';
  if (ratio >= 0.7) return 'Critical';
  if (ratio >= 0.4) return 'Tired';
  return 'Stable';
}

export function stageAffinity(factionCode: string, stage: MissionStage): number {
  return FACTION_STAGE_SPECIALTIES[factionCode]?.includes(stage) ? 1.25 : 1;
}

export function teamStageCoverage(characters: CharacterData[]): Record<MissionStage, number> {
  return Object.fromEntries(
    MISSION_STAGES.map((stage) => [
      stage,
      characters.filter((character) => stageAffinity(character.factionCode, stage) > 1).length,
    ]),
  ) as Record<MissionStage, number>;
}

export function canUseSkill(
  runtime: CharacterRuntimeState,
  character: CharacterData,
  skill: SkillData,
): { ok: boolean; reason?: string } {
  if (skill.type === 'Passive') return { ok: false, reason: '被動技能會自動生效' };
  if (fatigueBand(runtime, character) === 'Exhausted') return { ok: false, reason: '角色已耗竭' };
  if (runtime.actionPoints < 1) return { ok: false, reason: '本回合 AP 已用完' };
  if (runtime.energy < skill.energyCost) return { ok: false, reason: `需要 ${skill.energyCost} Energy` };
  if ((runtime.cooldowns[skill.id] ?? 0) > 0) return { ok: false, reason: '技能冷卻中' };
  return { ok: true };
}

export function beginTurn(
  runtime: CharacterRuntimeState,
  character: CharacterData,
): CharacterRuntimeState {
  const cooldowns = Object.fromEntries(
    Object.entries(runtime.cooldowns)
      .map(([skillId, turns]) => [skillId, Math.max(0, turns - 1)] as const)
      .filter(([, turns]) => turns > 0),
  );

  return {
    ...runtime,
    fatigue: Math.max(0, runtime.fatigue - character.fatigueRecovery),
    actionPoints: character.actionPoints,
    energy: Math.min(MAX_ENERGY, runtime.energy + ENERGY_PER_ROUND),
    cooldowns,
  };
}

export function applyHazardFatigue(
  runtime: CharacterRuntimeState,
  character: CharacterData,
  amount: number,
): CharacterRuntimeState {
  return {
    ...runtime,
    fatigue: clamp(runtime.fatigue + amount, 0, character.fatigueMax),
  };
}

export function createMission(boss: BossData): MissionState {
  const severity = severityRank(boss.severity);
  return {
    bossId: boss.id,
    stageIndex: 0,
    phase: 1,
    progress: 0,
    requirement: Math.max(1, Math.ceil(boss.resilience / (boss.phases * MISSION_STAGES.length))),
    round: 1,
    roundLimit: Math.max(7, 10 + boss.phases * 2 - severity),
    weatherWindow: 100,
    safety: 100,
    evidence: 0,
    reliability: 0,
    cost: 0,
    complete: false,
    failed: false,
  };
}

export function resolveSkill(
  mission: MissionState,
  boss: BossData,
  runtime: CharacterRuntimeState,
  character: CharacterData,
  skill: SkillData,
  equipment?: EquipmentData,
): SkillResolution {
  if (mission.complete || mission.failed) {
    return rejected('任務已結束', runtime, mission);
  }
  if (skill.type === 'Reactive') {
    return rejected('Reactive skill 只能在風險事件窗口使用', runtime, mission);
  }

  const availability = canUseSkill(runtime, character, skill);
  if (!availability.ok) {
    return rejected(availability.reason ?? '技能目前不可用', runtime, mission);
  }

  const statuses = skill.statusEffect && !runtime.statuses.includes(skill.statusEffect)
    ? [...runtime.statuses, skill.statusEffect]
    : runtime.statuses;
  const nextActor: CharacterRuntimeState = {
    ...runtime,
    fatigue: clamp(runtime.fatigue + skill.fatigueDelta, 0, character.fatigueMax),
    actionPoints: runtime.actionPoints - 1,
    energy: runtime.energy - skill.energyCost,
    cooldowns: skill.cooldown > 0
      ? { ...runtime.cooldowns, [skill.id]: skill.cooldown }
      : runtime.cooldowns,
    statuses,
  };

  const currentStage = MISSION_STAGES[mission.stageIndex];
  const counterFactions = boss.counterFactions.split(',').map((value) => value.trim());
  const counterMultiplier = counterFactions.includes(character.factionCode) ? 1.25 : 1;
  const stageMultiplier = stageAffinity(character.factionCode, currentStage);
  const fatigueMultiplier = fatigueEfficiency(fatigueBand(runtime, character));
  const equipmentBonus = compatibleEquipmentBonus(equipment, character);
  const appliedPower = Math.max(
    0,
    Math.ceil((skill.power + equipmentBonus) * counterMultiplier * stageMultiplier * fatigueMultiplier),
  );
  const remainingNeed = Math.max(0, mission.requirement - mission.progress);
  const creditedPower = Math.min(appliedPower, remainingNeed);
  const accumulated = mission.progress + appliedPower;
  const stageAdvanced = accumulated >= mission.requirement;
  const progressedMission: MissionState = {
    ...mission,
    progress: stageAdvanced ? 0 : accumulated,
    reliability: Math.min(boss.resilience, mission.reliability + creditedPower),
    evidence: evidenceStage(currentStage)
      ? Math.min(100, mission.evidence + Math.ceil(creditedPower * 0.45))
      : mission.evidence,
    cost: mission.cost + skill.energyCost + 1,
  };
  const nextMission = stageAdvanced
    ? advanceOneStage(progressedMission, boss.phases)
    : progressedMission;

  return {
    ok: true,
    message: stageAdvanced ? '工程階段完成' : '技能執行完成',
    appliedPower,
    stageAdvanced,
    actor: nextActor,
    mission: nextMission,
    counterMultiplier,
    stageMultiplier,
    fatigueMultiplier,
    equipmentBonus,
  };
}

export function resolveTeamSkill(
  mission: MissionState,
  boss: BossData,
  team: CharacterRuntimeState[],
  characters: Map<string, CharacterData>,
  actorIndex: number,
  skill: SkillData,
  equipment?: EquipmentData,
): TeamSkillResolution {
  const actor = team[actorIndex];
  const character = requiredCharacter(characters, actor.characterId);
  const resolution = resolveSkill(mission, boss, actor, character, skill, equipment);
  if (!resolution.ok) {
    return { ...resolution, team, recoveredTeamFatigue: 0 };
  }

  const nextTeam = [...team];
  nextTeam[actorIndex] = resolution.actor;
  let recoveredTeamFatigue = Math.max(0, actor.fatigue - resolution.actor.fatigue);
  const affectsAllies = /Allies|All units/i.test(skill.target) && skill.fatigueDelta < 0;

  if (affectsAllies) {
    nextTeam.forEach((runtime, index) => {
      if (index === actorIndex) return;
      const teammate = requiredCharacter(characters, runtime.characterId);
      const fatigue = clamp(runtime.fatigue + skill.fatigueDelta, 0, teammate.fatigueMax);
      recoveredTeamFatigue += runtime.fatigue - fatigue;
      nextTeam[index] = {
        ...runtime,
        fatigue,
        statuses: skill.statusEffect && !runtime.statuses.includes(skill.statusEffect)
          ? [...runtime.statuses, skill.statusEffect]
          : runtime.statuses,
      };
    });
  }

  return { ...resolution, team: nextTeam, recoveredTeamFatigue };
}

export function endRound(
  mission: MissionState,
  boss: BossData,
  team: CharacterRuntimeState[],
  characters: Map<string, CharacterData>,
  equipment?: EquipmentData,
  vessel?: VesselData,
): RoundResolution {
  if (mission.complete || mission.failed) {
    return { mission, team, fatigueDamage: 0, fatigueDamageByCharacter: {}, safetyLoss: 0, weatherLoss: 0 };
  }

  const { forecast, damaged } = computeEndRoundForecast(mission, boss, team, characters, equipment, vessel);
  const classEvent = forecast.classEvent!;

  const nextTeam = damaged.map((runtime) => {
    const character = requiredCharacter(characters, runtime.characterId);
    if (fatigueBand(runtime, character) === 'Exhausted') return runtime;
    const refreshed = beginTurn(runtime, character);
    return { ...refreshed, energy: Math.max(0, refreshed.energy - classEvent.energyDrain) };
  });

  return {
    mission: {
      ...mission,
      round: forecast.nextRound,
      safety: forecast.safetyAfter,
      weatherWindow: forecast.weatherAfter,
      evidence: Math.max(0, mission.evidence - forecast.evidenceLoss),
      reliability: Math.max(0, mission.reliability - forecast.reliabilityLoss),
      progress: Math.max(0, mission.progress - forecast.progressLoss),
      cost: mission.cost + forecast.costIncrease,
      failed: Boolean(forecast.failureReason),
      failureReason: forecast.failureReason,
    },
    team: nextTeam,
    fatigueDamage: forecast.fatigueDamage,
    fatigueDamageByCharacter: forecast.fatigueDamageByCharacter,
    safetyLoss: forecast.safetyLoss,
    weatherLoss: forecast.weatherLoss,
    classEvent,
  };
}

export function previewEndRound(
  mission: MissionState,
  boss: BossData,
  team: CharacterRuntimeState[],
  characters: Map<string, CharacterData>,
  equipment?: EquipmentData,
  vessel?: VesselData,
): EndRoundForecast {
  return computeEndRoundForecast(mission, boss, team, characters, equipment, vessel).forecast;
}

function computeEndRoundForecast(
  mission: MissionState,
  boss: BossData,
  team: CharacterRuntimeState[],
  characters: Map<string, CharacterData>,
  equipment?: EquipmentData,
  vessel?: VesselData,
): { forecast: EndRoundForecast; damaged: CharacterRuntimeState[] } {
  if (mission.complete || mission.failed) {
    return {
      forecast: {
        fatigueDamage: 0,
        fatigueDamageByCharacter: {},
        safetyLoss: 0,
        weatherLoss: 0,
        nextRound: mission.round,
        safetyAfter: mission.safety,
        weatherAfter: mission.weatherWindow,
        evidenceLoss: 0,
        reliabilityLoss: 0,
        progressLoss: 0,
        costIncrease: 0,
        energyDrain: 0,
        exhaustedAfter: 0,
      },
      damaged: team,
    };
  }

  const classEvent = bossClassRule(boss.class);
  const relief = Math.floor((equipment?.fatigueRelief ?? 0) / 2) + (vessel?.fatigueRelief ?? 0);
  const fatigueDamage = Math.max(1, boss.fatigueDamage + classEvent.fatigueBonus - relief);
  const fatigueDamageByCharacter: Record<string, number> = {};
  const damaged = team.map((runtime) => {
    const character = requiredCharacter(characters, runtime.characterId);
    const shieldedDamage = runtime.statuses.includes('RiskShield')
      ? Math.max(1, Math.ceil(fatigueDamage * 0.75))
      : fatigueDamage;
    const appliedDamage = Math.max(1, shieldedDamage - runtime.fatigueProtection);
    fatigueDamageByCharacter[runtime.characterId] = appliedDamage;
    return applyHazardFatigue(runtime, character, appliedDamage);
  });
  const exhaustedAfter = damaged.filter((runtime) => {
    const character = requiredCharacter(characters, runtime.characterId);
    return fatigueBand(runtime, character) === 'Exhausted';
  }).length;
  const anyAvailable = exhaustedAfter < damaged.length;
  const equipmentProtection = Math.floor((equipment?.reliabilityBonus ?? 0) / 4);
  const safetyLoss = Math.max(1, Math.ceil(boss.fatigueDamage / 4) + classEvent.safetyBonus + exhaustedAfter * 8 - equipmentProtection - (vessel?.safetyProtection ?? 0));
  const weatherLoss = Math.max(1, 8 + severityRank(boss.severity) * 2 + classEvent.weatherBonus - (vessel?.weatherProtection ?? 0));
  const nextRound = mission.round + 1;
  const safetyAfter = Math.max(0, mission.safety - safetyLoss);
  const weatherAfter = Math.max(0, mission.weatherWindow - weatherLoss);
  const failureReason: MissionFailureReason | undefined = !anyAvailable
    ? 'TeamExhausted'
    : safetyAfter <= 0
      ? 'Safety'
      : weatherAfter <= 0
        ? 'WeatherWindow'
        : nextRound > mission.roundLimit
          ? 'RoundLimit'
          : undefined;

  // Forecast 與 endRound 共用同一段公式，避免 UI 顯示的風險預估與真正結算分歧。
  return {
    forecast: {
      fatigueDamage,
      fatigueDamageByCharacter,
      safetyLoss,
      weatherLoss,
      nextRound,
      safetyAfter,
      weatherAfter,
      evidenceLoss: classEvent.evidenceLoss,
      reliabilityLoss: classEvent.reliabilityLoss,
      progressLoss: classEvent.progressLoss,
      costIncrease: classEvent.costIncrease,
      energyDrain: classEvent.energyDrain,
      exhaustedAfter,
      failureReason,
      classEvent,
    },
    damaged,
  };
}

export function missionDebrief(
  mission: MissionState,
  boss: BossData,
  team: CharacterRuntimeState[],
  characters: Map<string, CharacterData>,
): MissionDebrief {
  const totalStages = boss.phases * MISSION_STAGES.length;
  const completedStages = mission.complete
    ? totalStages
    : (mission.phase - 1) * MISSION_STAGES.length
      + mission.stageIndex
      + Math.min(1, mission.progress / mission.requirement);
  const completionScore = Math.round(clamp((completedStages / totalStages) * 100, 0, 100));
  const timeScore = Math.round(clamp(100 - ((mission.round - 1) / Math.max(1, mission.roundLimit - 1)) * 100, 0, 100));
  const averageFatigue = team.reduce((sum, runtime) => {
    const character = requiredCharacter(characters, runtime.characterId);
    return sum + fatigueRatio(runtime, character);
  }, 0) / Math.max(1, team.length);
  const fatigueScore = Math.round(clamp(100 - averageFatigue * 100, 0, 100));
  const costBudget = 40 + boss.phases * 10 + severityRank(boss.severity) * 5;
  const costScore = Math.round(clamp(100 - (mission.cost / costBudget) * 100, 0, 100));
  const totalScore = Math.round(
    mission.safety * 0.25
    + completionScore * 0.3
    + mission.evidence * 0.15
    + timeScore * 0.1
    + fatigueScore * 0.1
    + costScore * 0.1,
  );

  return {
    totalScore,
    grade: totalScore >= 90 ? 'S' : totalScore >= 80 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : 'D',
    safetyScore: mission.safety,
    completionScore,
    evidenceScore: mission.evidence,
    timeScore,
    fatigueScore,
    costScore,
  };
}

function advanceOneStage(mission: MissionState, bossPhases: number): MissionState {
  if (mission.stageIndex < MISSION_STAGES.length - 1) {
    return { ...mission, stageIndex: mission.stageIndex + 1 };
  }
  const bossPhasesComplete = mission.phase >= bossPhases;
  if (bossPhasesComplete) {
    return { ...mission, complete: true };
  }
  return { ...mission, stageIndex: 0, phase: mission.phase + 1 };
}

function rejected(
  message: string,
  actor: CharacterRuntimeState,
  mission: MissionState,
): SkillResolution {
  return {
    ok: false,
    message,
    appliedPower: 0,
    stageAdvanced: false,
    actor,
    mission,
    counterMultiplier: 1,
    stageMultiplier: 1,
    fatigueMultiplier: 1,
    equipmentBonus: 0,
  };
}

function compatibleEquipmentBonus(equipment: EquipmentData | undefined, character: CharacterData): number {
  if (!equipment) return 0;
  return equipment.compatibleFaction === 'ALL' || equipment.compatibleFaction === character.factionCode
    ? equipment.reliabilityBonus
    : 0;
}

function fatigueEfficiency(band: FatigueBand): number {
  if (band === 'Tired') return 0.85;
  if (band === 'Critical') return 0.65;
  if (band === 'Exhausted') return 0;
  return 1;
}

function evidenceStage(stage: MissionStage): boolean {
  return stage === 'Detect' || stage === 'Diagnose' || stage === 'Verify';
}

function bossRule(
  code: string,
  titleZh: string,
  titleEn: string,
  descriptionZh: string,
  descriptionEn: string,
  effects: Partial<BossClassRule>,
): BossClassRule {
  return {
    code,
    titleZh,
    titleEn,
    descriptionZh,
    descriptionEn,
    fatigueBonus: 0,
    safetyBonus: 0,
    weatherBonus: 0,
    evidenceLoss: 0,
    reliabilityLoss: 0,
    progressLoss: 0,
    costIncrease: 0,
    energyDrain: 0,
    ...effects,
  };
}

function branchEvent(
  code: MissionBranchCode,
  icon: string,
  accent: string,
  titleZh: string,
  titleEn: string,
  descriptionZh: string,
  descriptionEn: string,
  penalty: Partial<BranchPenalty>,
): MissionBranchEvent {
  return {
    code,
    icon,
    accent,
    titleZh,
    titleEn,
    descriptionZh,
    descriptionEn,
    intensity: 1,
    missionSpecific: false,
    penalty: {
      weatherLoss: 0,
      safetyLoss: 0,
      evidenceLoss: 0,
      reliabilityLoss: 0,
      progressLoss: 0,
      costIncrease: 0,
      energyDrain: 0,
      ...penalty,
    },
  };
}

function scaleBranchPenalty(penalty: BranchPenalty, scale: number): BranchPenalty {
  return Object.fromEntries(
    Object.entries(penalty).map(([key, value]) => [key, Math.round(value * scale)]),
  ) as unknown as BranchPenalty;
}

function rejectedBranch(message: string, mission: MissionState, team: CharacterRuntimeState[], penalty: BranchPenalty): BranchResolution {
  return { ok: false, message, mission, team, mitigated: false, mitigationRate: 0, appliedPenalty: penalty };
}

function uniqueStatus(statuses: string[], ...values: Array<string | undefined>): string[] {
  return [...new Set([...statuses, ...values.filter((value): value is string => Boolean(value))])];
}

function severityRank(severity: string): number {
  const match = severity.match(/(\d+)/);
  return clamp(match ? Number(match[1]) : 1, 1, 5);
}

function requiredCharacter(
  characters: Map<string, CharacterData>,
  characterId: string,
): CharacterData {
  const character = characters.get(characterId);
  if (!character) throw new Error(`找不到角色：${characterId}`);
  return character;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
