import {
  MISSION_STAGES,
  branchEventForRound,
  canUseSkill,
  createCharacterRuntime,
  createMission,
  endRound,
  fatigueRatio,
  missionDebrief,
  resolveMissionBranch,
  resolveTeamSkill,
  type CharacterRuntimeState,
  type MissionDebrief,
  type MissionFailureReason,
  type MissionState,
  type TeamSkillResolution,
} from './runtime.ts';
import {
  applyLoadout,
  applyMasteryPerks,
  applyOperationReadiness,
  awardCampaignMission,
  campaignCrewFatigue,
  characterMastery,
  createInitialCampaign,
  crewReadinessBand,
  evaluateLoadout,
  evaluateOperationReadiness,
  isEquipmentServiceable,
  isCrewMemberDeployable,
  repairCampaignEquipment,
  resolveDiagnosisDecision,
  restCampaignCharacter,
  teamMasteryPerks,
  type CampaignProgress,
} from './campaign.ts';
import type {
  BossData,
  CharacterData,
  EquipmentData,
  MissionData,
  SkillData,
  TurbineData,
  VesselData,
} from './types.ts';
import {
  applyFleetConditionDispatch,
  createFleetConditionDispatchModifier,
  createInitialWindFarm,
} from './windFarm.ts';

export type BalanceProfileId = 'L1' | 'L3' | 'L5';
export type BalancePressure = 'comfortable' | 'tight' | 'critical' | 'failed';

export interface BalanceProfile {
  id: BalanceProfileId;
  masteryXp: number;
  requiredThroughChapter: number;
  rosterLevelCodes: readonly ['L1', 'L3', 'L5'];
}

export interface BalanceDatabase {
  missions: MissionData[];
  bosses: BossData[];
  characters: CharacterData[];
  skills: SkillData[];
  equipment: EquipmentData[];
  turbines: TurbineData[];
  vessels: VesselData[];
}

export interface MissionBalanceResult {
  profile: BalanceProfileId;
  missionId: string;
  order: number;
  chapter: number;
  severity: string;
  teamCharacterIds: string[];
  teamFatigueByCharacter: Record<string, number>;
  success: boolean;
  failureReason?: MissionFailureReason | 'ReadinessGate';
  pressure: BalancePressure;
  round: number;
  roundLimit: number;
  roundsRemaining: number;
  actions: number;
  branchEvents: number;
  mitigatedBranchEvents: number;
  safety: number;
  weatherWindow: number;
  evidence: number;
  reliability: number;
  averageFatiguePercent: number;
  maxFatiguePercent: number;
  score: number;
  grade: MissionDebrief['grade'];
}

export interface ProfileBalanceSummary {
  profile: BalanceProfileId;
  requiredThroughChapter: number;
  passedMissions: number;
  totalMissions: number;
  requiredPassedMissions: number;
  requiredMissions: number;
  requiredGatePassed: boolean;
  averageScore: number;
  comfortable: number;
  tight: number;
  critical: number;
  failed: number;
}

export interface CampaignBalanceReport {
  schemaVersion: 3;
  model: 'OWM_RUNTIME_DETERMINISTIC_AUTOPLAY';
  note: string;
  profiles: BalanceProfile[];
  results: MissionBalanceResult[];
  summaries: ProfileBalanceSummary[];
  maintenanceEconomy: MaintenanceEconomySummary;
  crewReadinessEconomy: CrewReadinessEconomySummary;
}

export interface MaintenanceEconomySummary {
  policy: 'FULL_REPAIR_AFTER_EACH_L5_MISSION';
  initialCredits: number;
  creditsEarned: number;
  repairSpend: number;
  endingCredits: number;
  serviceableMissions: number;
  totalMissions: number;
  repairFailures: number;
  lowestPostMissionCondition: number;
  gatePassed: boolean;
}

export interface CrewReadinessEconomySummary {
  policy: 'ROTATE_AND_REST_BEFORE_L5_MISSION';
  initialTokens: number;
  tokensEarned: number;
  tokensSpent: number;
  endingTokens: number;
  restActions: number;
  deployableMissions: number;
  completedMissions: number;
  totalMissions: number;
  exhaustedBlocks: number;
  maxPersistentFatiguePercent: number;
  gatePassed: boolean;
}

export interface BalanceGateResult {
  passed: boolean;
  errors: string[];
}

export interface ProgressActionOptions {
  energyReserveByActorIndex?: Partial<Record<number, number>>;
}

export const BALANCE_PROFILES: readonly BalanceProfile[] = [
  { id: 'L1', masteryXp: 0, requiredThroughChapter: 2, rosterLevelCodes: ['L1', 'L3', 'L5'] },
  { id: 'L3', masteryXp: 250, requiredThroughChapter: 4, rosterLevelCodes: ['L1', 'L3', 'L5'] },
  { id: 'L5', masteryXp: 900, requiredThroughChapter: 5, rosterLevelCodes: ['L1', 'L3', 'L5'] },
] as const;

export function simulateCampaignBalance(database: BalanceDatabase): CampaignBalanceReport {
  const missions = [...database.missions].sort((left, right) => left.order - right.order);
  const results = BALANCE_PROFILES.flatMap((profile) => missions.map((mission) => simulateMission(database, mission, profile)));
  return {
    schemaVersion: 3,
    model: 'OWM_RUNTIME_DETERMINISTIC_AUTOPLAY',
    note: 'Gameplay simulation only; not field, SCADA or experimental evidence.',
    profiles: [...BALANCE_PROFILES],
    results,
    summaries: BALANCE_PROFILES.map((profile) => summarizeProfile(results, profile)),
    maintenanceEconomy: simulateMaintenanceEconomy(database, missions, results),
    crewReadinessEconomy: simulateCrewReadinessEconomy(database, missions),
  };
}

export function evaluateBalanceGates(report: CampaignBalanceReport): BalanceGateResult {
  const errors: string[] = [];
  for (const summary of report.summaries) {
    if (!summary.requiredGatePassed) {
      errors.push(`${summary.profile} must clear Chapter 01-${String(summary.requiredThroughChapter).padStart(2, '0')}: ${summary.requiredPassedMissions}/${summary.requiredMissions}`);
    }
  }

  const l5Finale = report.results.filter((result) => result.profile === 'L5' && result.chapter === 5);
  if (l5Finale.length !== 3 || l5Finale.some((result) => !result.success)) {
    errors.push(`L5 must clear all three Chapter 05 missions: ${l5Finale.filter((result) => result.success).length}/3`);
  }
  if (l5Finale.length === 3 && l5Finale.every((result) => result.pressure === 'comfortable')) {
    errors.push('Chapter 05 is too easy for L5: all finale missions are comfortable.');
  }
  if (!report.maintenanceEconomy.gatePassed) {
    errors.push(`L5 maintenance economy must keep all missions serviceable with full repair: ${report.maintenanceEconomy.serviceableMissions}/${report.maintenanceEconomy.totalMissions}, repair failures ${report.maintenanceEconomy.repairFailures}, ending MNT ${report.maintenanceEconomy.endingCredits}`);
  }
  if (!report.crewReadinessEconomy.gatePassed) {
    errors.push(`L5 crew readiness economy must keep all missions deployable and complete with rotation/rest: deployable ${report.crewReadinessEconomy.deployableMissions}/${report.crewReadinessEconomy.totalMissions}, complete ${report.crewReadinessEconomy.completedMissions}/${report.crewReadinessEconomy.totalMissions}, exhausted blocks ${report.crewReadinessEconomy.exhaustedBlocks}, ending RST ${report.crewReadinessEconomy.endingTokens}`);
  }

  return { passed: errors.length === 0, errors };
}

function simulateCrewReadinessEconomy(
  database: BalanceDatabase,
  missions: MissionData[],
): CrewReadinessEconomySummary {
  const profile = required(BALANCE_PROFILES as BalanceProfile[], (item) => item.id === 'L5', 'L5 profile');
  let progress = createInitialCampaign(missions, database.equipment, database.turbines);
  const initialTokens = progress.recoveryTokens;
  let tokensEarned = 0;
  let tokensSpent = 0;
  let restActions = 0;
  let deployableMissions = 0;
  let completedMissions = 0;
  let exhaustedBlocks = 0;
  let maxPersistentFatiguePercent = 0;

  for (const mission of missions) {
    const team = selectRepresentativeTeam(database.characters, mission, profile);

    // 只有在角色已 Exhausted、確實會阻擋 Deployment 時才使用 RST；其餘疲勞交給輪調與 Reserve recovery。
    for (const character of team) {
      while (!isCrewMemberDeployable(progress, character)) {
        const rested = restCampaignCharacter(progress, character);
        if (!rested) break;
        progress = rested.progress;
        tokensSpent += 1;
        restActions += 1;
      }
    }

    const deploymentReady = team.every((character) => isCrewMemberDeployable(progress, character));
    if (!deploymentReady) {
      exhaustedBlocks += 1;
      continue;
    }
    deployableMissions += 1;

    const result = simulateMission(database, mission, profile, progress);
    if (result.success) completedMissions += 1;
    const debrief: MissionDebrief = {
      totalScore: result.score,
      grade: result.grade,
      safetyScore: result.safety,
      completionScore: result.success ? 100 : 0,
      evidenceScore: result.evidence,
      timeScore: Math.max(0, result.roundsRemaining),
      fatigueScore: Math.max(0, 100 - result.averageFatiguePercent),
      costScore: 0,
    };
    const vessel = required(database.vessels, (candidate) => candidate.id === mission.recommendedVesselId, `Vessel ${mission.recommendedVesselId}`);
    const awarded = awardCampaignMission(
      progress,
      mission,
      debrief,
      result.success,
      result.teamCharacterIds,
      missions,
      database.equipment,
      [mission.recommendedEquipmentId, mission.recommendedSpareId],
      database.characters,
      vessel,
      result.teamFatigueByCharacter,
    );
    progress = awarded.progress;
    tokensEarned += awarded.reward.recoveryTokensEarned;
    for (const character of database.characters) {
      const band = crewReadinessBand(progress, character);
      if (band === 'Stable' && campaignCrewFatigue(progress, character.id) === 0) continue;
      const percent = Math.round((campaignCrewFatigue(progress, character.id) / Math.max(1, character.fatigueMax)) * 100);
      maxPersistentFatiguePercent = Math.max(maxPersistentFatiguePercent, percent);
    }
  }

  return {
    policy: 'ROTATE_AND_REST_BEFORE_L5_MISSION',
    initialTokens,
    tokensEarned,
    tokensSpent,
    endingTokens: progress.recoveryTokens,
    restActions,
    deployableMissions,
    completedMissions,
    totalMissions: missions.length,
    exhaustedBlocks,
    maxPersistentFatiguePercent,
    gatePassed: deployableMissions === missions.length
      && completedMissions === missions.length
      && exhaustedBlocks === 0
      && progress.recoveryTokens >= 0,
  };
}

function simulateMaintenanceEconomy(
  database: BalanceDatabase,
  missions: MissionData[],
  results: MissionBalanceResult[],
): MaintenanceEconomySummary {
  let progress = createInitialCampaign(missions, database.equipment, database.turbines);
  const initialCredits = progress.maintenanceCredits;
  let creditsEarned = 0;
  let repairSpend = 0;
  let repairFailures = 0;
  let serviceableMissions = 0;
  let lowestPostMissionCondition = 100;

  for (const mission of missions) {
    const result = required(results, (item) => item.profile === 'L5' && item.missionId === mission.id, `L5 result ${mission.id}`);
    const deployedIds = [mission.recommendedEquipmentId, mission.recommendedSpareId];
    if (deployedIds.every((id) => isEquipmentServiceable(progress, id))) serviceableMissions += 1;
    const debrief: MissionDebrief = {
      totalScore: result.score,
      grade: result.grade,
      safetyScore: result.safety,
      completionScore: result.success ? 100 : 0,
      evidenceScore: result.evidence,
      timeScore: Math.max(0, result.roundsRemaining),
      fatigueScore: Math.max(0, 100 - result.averageFatiguePercent),
      costScore: 0,
    };
    const awarded = awardCampaignMission(
      progress,
      mission,
      debrief,
      result.success,
      result.teamCharacterIds,
      missions,
      database.equipment,
      deployedIds,
      database.characters,
      required(database.vessels, (candidate) => candidate.id === mission.recommendedVesselId, `Vessel ${mission.recommendedVesselId}`),
      Object.fromEntries(result.teamCharacterIds.map((characterId) => [characterId, 0])),
    );
    progress = awarded.progress;
    creditsEarned += awarded.reward.maintenanceCreditsEarned;
    lowestPostMissionCondition = Math.min(lowestPostMissionCondition, ...awarded.reward.equipmentWear.map((item) => item.after));

    for (const equipmentId of deployedIds) {
      const item = required(database.equipment, (candidate) => candidate.id === equipmentId, `Equipment ${equipmentId}`);
      const repaired = repairCampaignEquipment(progress, item);
      if (!repaired) {
        repairFailures += 1;
        continue;
      }
      repairSpend += repaired.cost;
      progress = repaired.progress;
    }
  }

  return {
    policy: 'FULL_REPAIR_AFTER_EACH_L5_MISSION',
    initialCredits,
    creditsEarned,
    repairSpend,
    endingCredits: progress.maintenanceCredits,
    serviceableMissions,
    totalMissions: missions.length,
    repairFailures,
    lowestPostMissionCondition,
    gatePassed: serviceableMissions === missions.length && repairFailures === 0 && progress.maintenanceCredits >= 0,
  };
}

function simulateMission(
  database: BalanceDatabase,
  missionDefinition: MissionData,
  profile: BalanceProfile,
  carriedProgress?: CampaignProgress,
): MissionBalanceResult {
  const boss = required(database.bosses, (item) => item.id === missionDefinition.bossId, `Boss ${missionDefinition.bossId}`);
  const equipment = required(database.equipment, (item) => item.id === missionDefinition.recommendedEquipmentId, `Equipment ${missionDefinition.recommendedEquipmentId}`);
  const spare = required(database.equipment, (item) => item.id === missionDefinition.recommendedSpareId, `Spare ${missionDefinition.recommendedSpareId}`);
  const vessel = required(database.vessels, (item) => item.id === missionDefinition.recommendedVesselId, `Vessel ${missionDefinition.recommendedVesselId}`);
  const characters = selectRepresentativeTeam(database.characters, missionDefinition, profile);
  const characterMap = new Map(database.characters.map((character) => [character.id, character]));
  const skillMap = new Map(database.skills.map((skill) => [skill.id, skill]));
  const freshProgress: CampaignProgress = {
      schemaVersion: 5,
      totalXp: 0,
      completedMissionIds: [],
      unlockedMissionIds: [missionDefinition.id],
      bestScores: {},
      characterXp: {},
      ownedEquipmentIds: [equipment.id, spare.id],
      maintenanceCredits: 80,
      equipmentCondition: {},
      recoveryTokens: 3,
      crewFatigue: {},
      windFarm: createInitialWindFarm(database.turbines),
      fleetOperationsHistory: [],
    };
  const baseProgress = carriedProgress ?? freshProgress;
  const progress: CampaignProgress = {
    ...baseProgress,
    characterXp: {
      ...baseProgress.characterXp,
      ...Object.fromEntries(characters.map((character) => [character.id, profile.masteryXp])),
    },
  };
  const perks = teamMasteryPerks(characters.map((character) => character.id), progress);
  let team = characters.map((character) => createCharacterRuntime(
    character,
    perks.byCharacterId[character.id],
    campaignCrewFatigue(progress, character.id),
  ));
  const loadout = evaluateLoadout(missionDefinition, equipment, spare, vessel);
  let mission = applyMasteryPerks(applyLoadout(createMission(boss), loadout), perks);
  const readiness = evaluateOperationReadiness(missionDefinition, characters, progress, vessel, { permit: true, ppe: true, access: true });
  const readinessBlocked = !readiness.ready;
  const fleetCondition = createFleetConditionDispatchModifier(progress.windFarm, missionDefinition.turbineId);
  if (!readinessBlocked) {
    mission = applyOperationReadiness(mission, readiness);
    if (fleetCondition) mission = applyFleetConditionDispatch(mission, fleetCondition);
  }
  let diagnosisResolved = false;
  let actions = 0;
  let branchEvents = 0;
  let mitigatedBranchEvents = 0;

  // 上限只防止規則回歸造成無限迴圈；正常流程會由 complete 或 runtime failure 結束。
  for (let turnGuard = 0; turnGuard < 40 && !readinessBlocked && !mission.complete && !mission.failed; turnGuard += 1) {
    for (let actionGuard = 0; actionGuard < 40 && !mission.complete && !mission.failed; actionGuard += 1) {
      if (MISSION_STAGES[mission.stageIndex] === 'Diagnose' && !diagnosisResolved) {
        const correct = required(missionDefinition.diagnosisOptions, (option) => option.correct, `${missionDefinition.id} correct diagnosis`);
        mission = resolveDiagnosisDecision(mission, correct).mission;
        diagnosisResolved = true;
      }

      const candidate = chooseProgressAction(mission, boss, team, characters, skillMap, equipment, profile);
      if (!candidate) break;
      mission = candidate.resolution.mission;
      team = candidate.resolution.team;
      actions += 1;
    }

    if (mission.complete || mission.failed) break;
    const completedRound = mission.round;
    const round = endRound(mission, boss, team, characterMap, equipment, vessel);
    mission = round.mission;
    team = round.team;
    if (mission.failed) break;

    const event = branchEventForRound(boss, completedRound, missionDefinition);
    if (event) {
      branchEvents += 1;
      const response = chooseReactiveResponse(mission, team, characters, skillMap, event, profile);
      const branch = resolveMissionBranch(
        mission,
        team,
        event,
        response ? { actorIndex: response.actorIndex, character: response.character, skill: response.skill } : undefined,
      );
      mission = branch.mission;
      team = branch.team;
      if (branch.mitigated) mitigatedBranchEvents += 1;
    }
  }

  const debrief = missionDebrief(mission, boss, team, characterMap);
  const fatigueRatios = team.map((runtime) => fatigueRatio(runtime, requiredCharacter(characters, runtime.characterId)) * 100);
  const averageFatiguePercent = Math.round(fatigueRatios.reduce((sum, value) => sum + value, 0) / Math.max(1, fatigueRatios.length));
  const maxFatiguePercent = Math.round(Math.max(0, ...fatigueRatios));
  const roundsRemaining = Math.max(0, mission.roundLimit - mission.round);

  return {
    profile: profile.id,
    missionId: missionDefinition.id,
    order: missionDefinition.order,
    chapter: missionDefinition.chapter,
    severity: boss.severity,
    teamCharacterIds: characters.map((character) => character.id),
    teamFatigueByCharacter: Object.fromEntries(team.map((runtime) => [runtime.characterId, runtime.fatigue])),
    success: mission.complete,
    failureReason: readinessBlocked ? 'ReadinessGate' : mission.failureReason,
    pressure: classifyPressure(mission, averageFatiguePercent, roundsRemaining),
    round: mission.round,
    roundLimit: mission.roundLimit,
    roundsRemaining,
    actions,
    branchEvents,
    mitigatedBranchEvents,
    safety: mission.safety,
    weatherWindow: mission.weatherWindow,
    evidence: mission.evidence,
    reliability: mission.reliability,
    averageFatiguePercent,
    maxFatiguePercent,
    score: debrief.totalScore,
    grade: debrief.grade,
  };
}

export function chooseProgressAction(
  mission: MissionState,
  boss: BossData,
  team: CharacterRuntimeState[],
  characters: CharacterData[],
  skillMap: Map<string, SkillData>,
  equipment: EquipmentData,
  profile: BalanceProfile,
  options: ProgressActionOptions = {},
): { resolution: TeamSkillResolution; actorIndex: number; skill: SkillData } | undefined {
  const candidates = team.flatMap((runtime, actorIndex) => {
    const character = requiredCharacter(characters, runtime.characterId);
    const unlockedSlots = characterMastery(profile.masteryXp).unlockedSkillSlots;
    return characterSkillIds(character).slice(0, unlockedSlots).flatMap((skillId) => {
      const skill = skillMap.get(skillId);
      if (!skill || skill.type === 'Passive' || skill.type === 'Reactive') return [];
      const resolution = resolveTeamSkill(mission, boss, team, new Map(characters.map((item) => [item.id, item])), actorIndex, skill, equipment);
      if (!resolution.ok) return [];
      const energyReserve = options.energyReserveByActorIndex?.[actorIndex] ?? 0;
      if (resolution.team[actorIndex].energy < energyReserve) return [];
      const remainingNeed = Math.max(0, mission.requirement - mission.progress);
      const creditedPower = Math.min(remainingNeed, resolution.appliedPower);
      // 優先完成當前階段，再保留 Energy 給後續高階技能與 Reactive window；回復疲勞作為次要收益。
      const score = Number(resolution.stageAdvanced) * 100_000
        + resolution.recoveredTeamFatigue * 3
        + creditedPower * 10
        - skill.energyCost * 30
        - skill.cooldown;
      return [{ resolution, actorIndex, skill, score }];
    });
  });
  return candidates
    .sort((left, right) => right.score - left.score || left.actorIndex - right.actorIndex || left.skill.id.localeCompare(right.skill.id))[0];
}

export function chooseReactiveResponse(
  mission: MissionState,
  team: CharacterRuntimeState[],
  characters: CharacterData[],
  skillMap: Map<string, SkillData>,
  event: NonNullable<ReturnType<typeof branchEventForRound>>,
  profile: BalanceProfile,
): { actorIndex: number; character: CharacterData; skill: SkillData } | undefined {
  const candidates = team.flatMap((runtime, actorIndex) => {
    const character = requiredCharacter(characters, runtime.characterId);
    const unlockedSlots = characterMastery(profile.masteryXp).unlockedSkillSlots;
    return characterSkillIds(character).slice(0, unlockedSlots).flatMap((skillId) => {
      const skill = skillMap.get(skillId);
      if (!skill || skill.type !== 'Reactive' || !canUseSkill(runtime, character, skill).ok) return [];
      const resolution = resolveMissionBranch(mission, team, event, { actorIndex, character, skill });
      if (!resolution.mitigated) return [];
      return [{ actorIndex, character, skill, mitigationRate: resolution.mitigationRate }];
    });
  });
  return candidates.sort((left, right) => right.mitigationRate - left.mitigationRate || left.actorIndex - right.actorIndex)[0];
}

function selectRepresentativeTeam(characters: CharacterData[], mission: MissionData, profile: BalanceProfile): CharacterData[] {
  const selected: CharacterData[] = [];
  mission.recommendedFactionCodes.forEach((factionCode, index) => {
    const levelCode = profile.rosterLevelCodes[index % profile.rosterLevelCodes.length];
    const candidate = characters
      .filter((character) => character.factionCode === factionCode && character.levelCode === levelCode && !selected.some((item) => item.id === character.id))
      .sort((left, right) => left.id.localeCompare(right.id))[0];
    if (candidate) selected.push(candidate);
  });
  const fallbacks = characters
    .filter((character) => profile.rosterLevelCodes.includes(character.levelCode as 'L1' | 'L3' | 'L5') && !selected.some((item) => item.id === character.id))
    .sort((left, right) => left.id.localeCompare(right.id));
  while (selected.length < 3 && fallbacks.length > 0) selected.push(fallbacks.shift()!);
  if (selected.length !== 3) throw new Error(`${mission.id} 無法建立 ${profile.id} 三人代表隊伍`);
  return selected;
}

function summarizeProfile(results: MissionBalanceResult[], profile: BalanceProfile): ProfileBalanceSummary {
  const profileResults = results.filter((result) => result.profile === profile.id);
  const requiredResults = profileResults.filter((result) => result.chapter <= profile.requiredThroughChapter);
  const successfulScores = profileResults.filter((result) => result.success).map((result) => result.score);
  return {
    profile: profile.id,
    requiredThroughChapter: profile.requiredThroughChapter,
    passedMissions: profileResults.filter((result) => result.success).length,
    totalMissions: profileResults.length,
    requiredPassedMissions: requiredResults.filter((result) => result.success).length,
    requiredMissions: requiredResults.length,
    requiredGatePassed: requiredResults.every((result) => result.success),
    averageScore: successfulScores.length > 0 ? Math.round(successfulScores.reduce((sum, score) => sum + score, 0) / successfulScores.length) : 0,
    comfortable: profileResults.filter((result) => result.pressure === 'comfortable').length,
    tight: profileResults.filter((result) => result.pressure === 'tight').length,
    critical: profileResults.filter((result) => result.pressure === 'critical').length,
    failed: profileResults.filter((result) => result.pressure === 'failed').length,
  };
}

export function classifyPressure(mission: MissionState, averageFatiguePercent: number, roundsRemaining: number): BalancePressure {
  if (!mission.complete) return 'failed';
  const resourceFloor = Math.min(mission.safety, mission.weatherWindow, 100 - averageFatiguePercent);
  if (resourceFloor >= 45 && roundsRemaining >= 2) return 'comfortable';
  if (resourceFloor >= 20 && roundsRemaining >= 1) return 'tight';
  return 'critical';
}

function characterSkillIds(character: CharacterData): string[] {
  return [character.passiveSkillId, character.skill1Id, character.skill2Id, character.ultimateSkillId];
}

function requiredCharacter(characters: CharacterData[], id: string): CharacterData {
  return required(characters, (character) => character.id === id, `Character ${id}`);
}

function required<T>(items: T[], predicate: (item: T) => boolean, label: string): T {
  const item = items.find(predicate);
  if (!item) throw new Error(`缺少 balance simulation 資料：${label}`);
  return item;
}
