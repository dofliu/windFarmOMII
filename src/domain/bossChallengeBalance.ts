import {
  BALANCE_PROFILES,
  chooseProgressAction,
  chooseReactiveResponse,
  classifyPressure,
  type BalanceDatabase,
  type BalancePressure,
  type BalanceProfile,
} from './balance.ts';
import {
  BOSS_CHALLENGE_EQUIPMENT_ID,
  BOSS_CHALLENGE_MASTERY_LEVEL,
  BOSS_CHALLENGE_MASTERY_XP,
  BOSS_CHALLENGE_ROUND_LIMIT,
  BOSS_CHALLENGE_SPARE_ID,
  BOSS_CHALLENGE_VESSEL_ID,
  BOSS_CHALLENGE_GRID_WEATHER_PROTECTION_BONUS,
  BOSS_CHALLENGE_GRID_ENERGY_RESERVE_BONUS,
  bossChallengeRoundTeamProjection,
  bossChallengeVesselProjection,
  createBossChallengeCampaignProjection,
} from './bossChallenge.ts';
import {
  applyLoadout,
  applyMasteryPerks,
  createInitialCampaign,
  evaluateSandboxLoadout,
  teamMasteryPerks,
} from './campaign.ts';
import {
  FACTION_STAGE_SPECIALTIES,
  MISSION_STAGES,
  branchEventForRound,
  createCharacterRuntime,
  createMission,
  endRound,
  fatigueRatio,
  missionDebrief,
  resolveMissionBranch,
  type CharacterRuntimeState,
  type MissionFailureReason,
  type MissionState,
} from './runtime.ts';
import type { BossData, CharacterData, EquipmentData, SkillData, VesselData } from './types.ts';

export type ChallengeTeamSelectionPolicy = 'balanced' | 'power' | 'survival';

export interface BossChallengeBalanceOptions {
  topTeamsPerPolicy?: number;
}

export interface BossChallengeCandidateTeam {
  teamIds: [string, string, string];
  policies: ChallengeTeamSelectionPolicy[];
  coverageCount: number;
  counterCount: number;
}

export interface BossChallengeBalanceResult {
  bossId: string;
  severity: string;
  class: string;
  counterFactions: string[];
  teamIds: [string, string, string];
  candidateTeamsEvaluated: number;
  successfulCandidateTeams: number;
  candidateCompletionRate: number;
  success: boolean;
  failureReason?: MissionFailureReason | 'AutoplayGuard';
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
  grade: ReturnType<typeof missionDebrief>['grade'];
}

export interface BossChallengeSeveritySummary {
  severity: string;
  bosses: number;
  completed: number;
  completionRate: number;
  averageScore: number;
  minimumScore: number;
  maximumScore: number;
  averageRound: number;
  averageCandidateCompletionRate: number;
  gradeCounts: Record<'S' | 'A' | 'B' | 'C' | 'D', number>;
  pressureCounts: Record<BalancePressure, number>;
}

export interface BossChallengeBalanceSummary {
  totalBosses: number;
  completedBosses: number;
  completionRate: number;
  averageScore: number;
  minimumScore: number;
  maximumScore: number;
  averageRound: number;
  gradeCounts: Record<'S' | 'A' | 'B' | 'C' | 'D', number>;
  pressureCounts: Record<BalancePressure, number>;
}

export interface BossChallengeSeverityInversion {
  class: string;
  easierBossId: string;
  harderBossId: string;
  easierScore: number;
  harderScore: number;
}

export interface BossChallengeBalanceReport {
  schemaVersion: 1;
  model: 'OWM_CHALLENGE_DETERMINISTIC_AUTOPLAY';
  note: string;
  contract: {
    masteryLevel: number;
    masteryXp: number;
    roundLimit: number;
    equipmentId: string;
    spareId: string;
    vesselId: string;
    gridWeatherProtectionBonusBySeverity: Readonly<Record<string, number>>;
    gridEnergyReserveBonusBySeverity: Readonly<Record<string, number>>;
  };
  candidatePolicy: {
    eligibleCharacters: number;
    counterSets: number;
    policies: ChallengeTeamSelectionPolicy[];
    topTeamsPerPolicy: number;
    exactThreePersonCombinationsPerCounterSet: number;
  };
  summary: BossChallengeBalanceSummary;
  bySeverity: BossChallengeSeveritySummary[];
  outliers: {
    unclearableBossIds: string[];
    fragileBossIds: string[];
    overHardBossIds: string[];
    overEasyBossIds: string[];
    severityInversions: BossChallengeSeverityInversion[];
  };
  results: BossChallengeBalanceResult[];
}

export interface BossChallengeBalanceGateResult {
  passed: boolean;
  checks: {
    allBossesClearable: boolean;
    candidateDiversity: boolean;
    lowSeverityAccessible: boolean;
    severityProgression: boolean;
    endgamePressure: boolean;
  };
  errors: string[];
}

interface CandidateCharacterStats {
  character: CharacterData;
  coverageMask: number;
  activePower: number;
  supportPower: number;
  reactivePower: number;
  durability: number;
  tempo: number;
}

interface RankedTeam {
  score: number;
  key: string;
  indexes: [number, number, number];
  policy: ChallengeTeamSelectionPolicy;
  coverageCount: number;
  counterCount: number;
}

interface CandidateSimulation extends BossChallengeBalanceResult {
  resourceFloor: number;
}

const CHALLENGE_PROFILE = required(BALANCE_PROFILES as BalanceProfile[], (profile) => profile.id === 'L3', 'L3 balance profile');
const TEAM_SELECTION_POLICIES: ChallengeTeamSelectionPolicy[] = ['balanced', 'power', 'survival'];
const GRADE_ORDER = ['S', 'A', 'B', 'C', 'D'] as const;
const PRESSURE_ORDER: BalancePressure[] = ['comfortable', 'tight', 'critical', 'failed'];
const BIT_COUNTS = Array.from({ length: 1 << MISSION_STAGES.length }, (_, value) => bitCount(value));

export function simulateBossChallengeBalance(
  database: BalanceDatabase,
  options: BossChallengeBalanceOptions = {},
): BossChallengeBalanceReport {
  const topTeamsPerPolicy = Math.max(1, Math.min(20, Math.trunc(options.topTeamsPerPolicy ?? 8)));
  const counterKeys = [...new Set(database.bosses.map((boss) => normalizedCounterKey(boss.counterFactions)))].sort();
  const candidatesByCounterKey = Object.fromEntries(counterKeys.map((counterKey) => [
    counterKey,
    selectBossChallengeCandidateTeams(database.characters, database.skills, counterKey.split(','), topTeamsPerPolicy),
  ]));
  const projection = createBossChallengeCampaignProjection(createInitialCampaign(database.missions, database.equipment), database.characters);
  const equipment = required(database.equipment, (item) => item.id === BOSS_CHALLENGE_EQUIPMENT_ID, BOSS_CHALLENGE_EQUIPMENT_ID);
  const spare = required(database.equipment, (item) => item.id === BOSS_CHALLENGE_SPARE_ID, BOSS_CHALLENGE_SPARE_ID);
  const vessel = required(database.vessels, (item) => item.id === BOSS_CHALLENGE_VESSEL_ID, BOSS_CHALLENGE_VESSEL_ID);
  const characterMap = new Map(database.characters.map((character) => [character.id, character]));
  const skillMap = new Map(database.skills.map((skill) => [skill.id, skill]));
  const loadout = evaluateSandboxLoadout(equipment, spare, vessel);

  const results = [...database.bosses]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((boss) => {
      const candidates = candidatesByCounterKey[normalizedCounterKey(boss.counterFactions)];
      if (!candidates?.length) throw new Error(`Boss ${boss.id} 沒有 Challenge candidate team`);
      const simulations = candidates.map((candidate) => simulateCandidate(
        boss,
        candidate,
        database.characters,
        characterMap,
        skillMap,
        equipment,
        vessel,
        loadout,
        projection,
      ));
      const best = [...simulations].sort(compareCandidateSimulations)[0];
      const successfulCandidateTeams = simulations.filter((result) => result.success).length;
      return {
        ...best,
        candidateTeamsEvaluated: simulations.length,
        successfulCandidateTeams,
        candidateCompletionRate: ratioPercent(successfulCandidateTeams, simulations.length),
      } satisfies BossChallengeBalanceResult;
    });

  const bySeverity = ['S1', 'S2', 'S3', 'S4', 'S5'].map((severity) => summarizeResults(results.filter((result) => result.severity === severity), severity));
  const severityInversions = findSeverityInversions(results);
  return {
    schemaVersion: 1,
    model: 'OWM_CHALLENGE_DETERMINISTIC_AUTOPLAY',
    note: 'Deterministic gameplay simulation only; not field, SCADA, human-factors or experimental evidence.',
    contract: {
      masteryLevel: BOSS_CHALLENGE_MASTERY_LEVEL,
      masteryXp: BOSS_CHALLENGE_MASTERY_XP,
      roundLimit: BOSS_CHALLENGE_ROUND_LIMIT,
      equipmentId: BOSS_CHALLENGE_EQUIPMENT_ID,
      spareId: BOSS_CHALLENGE_SPARE_ID,
      vesselId: BOSS_CHALLENGE_VESSEL_ID,
      gridWeatherProtectionBonusBySeverity: BOSS_CHALLENGE_GRID_WEATHER_PROTECTION_BONUS,
      gridEnergyReserveBonusBySeverity: BOSS_CHALLENGE_GRID_ENERGY_RESERVE_BONUS,
    },
    candidatePolicy: {
      eligibleCharacters: database.characters.length,
      counterSets: counterKeys.length,
      policies: [...TEAM_SELECTION_POLICIES],
      topTeamsPerPolicy,
      exactThreePersonCombinationsPerCounterSet: combinationsOfThree(database.characters.length),
    },
    summary: summarizeResults(results),
    bySeverity,
    outliers: {
      unclearableBossIds: results.filter((result) => !result.success).map((result) => result.bossId),
      fragileBossIds: results.filter((result) => result.successfulCandidateTeams < Math.min(3, result.candidateTeamsEvaluated)).map((result) => result.bossId),
      overHardBossIds: results.filter((result) => !result.success || result.score < 60 || (severityRank(result.severity) <= 2 && result.pressure === 'critical')).map((result) => result.bossId),
      overEasyBossIds: results.filter((result) => result.severity === 'S5' && result.pressure === 'comfortable').map((result) => result.bossId),
      severityInversions,
    },
    results,
  };
}

export function simulateBossChallengeTeam(
  database: BalanceDatabase,
  boss: BossData,
  teamIds: [string, string, string],
): BossChallengeBalanceResult {
  if (new Set(teamIds).size !== 3) throw new Error('Boss Challenge verification requires three unique character IDs.');
  const projection = createBossChallengeCampaignProjection(createInitialCampaign(database.missions, database.equipment), database.characters);
  const equipment = required(database.equipment, (item) => item.id === BOSS_CHALLENGE_EQUIPMENT_ID, BOSS_CHALLENGE_EQUIPMENT_ID);
  const spare = required(database.equipment, (item) => item.id === BOSS_CHALLENGE_SPARE_ID, BOSS_CHALLENGE_SPARE_ID);
  const vessel = required(database.vessels, (item) => item.id === BOSS_CHALLENGE_VESSEL_ID, BOSS_CHALLENGE_VESSEL_ID);
  const characterMap = new Map(database.characters.map((character) => [character.id, character]));
  const skillMap = new Map(database.skills.map((skill) => [skill.id, skill]));
  const loadout = evaluateSandboxLoadout(equipment, spare, vessel);
  const simulation = simulateCandidate(
    boss,
    { teamIds: [...teamIds], policies: [], coverageCount: 0, counterCount: 0 },
    database.characters,
    characterMap,
    skillMap,
    equipment,
    vessel,
    loadout,
    projection,
  );
  const { resourceFloor: _resourceFloor, ...result } = simulation;
  return result;
}

export function evaluateBossChallengeBalanceGates(report: BossChallengeBalanceReport): BossChallengeBalanceGateResult {
  const lowSeverity = report.results.filter((result) => severityRank(result.severity) <= 2);
  const finalSeverity = report.results.filter((result) => result.severity === 'S5');
  const checks = {
    allBossesClearable: report.summary.completedBosses === report.summary.totalBosses,
    candidateDiversity: report.results.every((result) => result.successfulCandidateTeams >= Math.min(3, result.candidateTeamsEvaluated)),
    lowSeverityAccessible: lowSeverity.every((result) => result.success && result.score >= 60 && result.candidateCompletionRate >= 25),
    severityProgression: report.outliers.severityInversions.length === 0,
    endgamePressure: finalSeverity.length > 0
      && finalSeverity.every((result) => result.success)
      && finalSeverity.some((result) => result.pressure === 'tight' || result.pressure === 'critical'),
  };
  const errors = [
    !checks.allBossesClearable ? `All 100 bosses must be clearable: ${report.summary.completedBosses}/${report.summary.totalBosses}` : '',
    !checks.candidateDiversity ? `Every boss needs at least three successful audited candidate teams: ${report.outliers.fragileBossIds.join(', ')}` : '',
    !checks.lowSeverityAccessible ? `S1-S2 must score >=60 with >=25% candidate completion: ${lowSeverity.filter((result) => !result.success || result.score < 60 || result.candidateCompletionRate < 25).map((result) => result.bossId).join(', ')}` : '',
    !checks.severityProgression ? `Severity score inversions exceed 8 points: ${report.outliers.severityInversions.map((item) => `${item.easierBossId}->${item.harderBossId}`).join(', ')}` : '',
    !checks.endgamePressure ? 'S5 must all clear while retaining at least one tight or critical result.' : '',
  ].filter(Boolean);
  return { passed: errors.length === 0, checks, errors };
}

export function selectBossChallengeCandidateTeams(
  characters: CharacterData[],
  skills: SkillData[],
  counterFactions: string[],
  topTeamsPerPolicy: number = 8,
): BossChallengeCandidateTeam[] {
  const limit = Math.max(1, Math.min(20, Math.trunc(topTeamsPerPolicy)));
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]));
  const counterSet = new Set(counterFactions);
  const stats = [...characters]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((character) => candidateCharacterStats(character, skillMap));
  const rankedByPolicy = Object.fromEntries(TEAM_SELECTION_POLICIES.map((policy) => [policy, [] as RankedTeam[]])) as Record<ChallengeTeamSelectionPolicy, RankedTeam[]>;

  // 300 人的 C(300,3)=4,455,100 組逐一比較；只保留各 policy 前 N 名，不建立巨型中間陣列。
  for (let first = 0; first < stats.length - 2; first += 1) {
    const left = stats[first];
    for (let second = first + 1; second < stats.length - 1; second += 1) {
      const middle = stats[second];
      const pairCoverage = left.coverageMask | middle.coverageMask;
      const pairCounter = Number(counterSet.has(left.character.factionCode)) + Number(counterSet.has(middle.character.factionCode));
      for (let third = second + 1; third < stats.length; third += 1) {
        const right = stats[third];
        const coverageCount = BIT_COUNTS[pairCoverage | right.coverageMask];
        const counterCount = pairCounter + Number(counterSet.has(right.character.factionCode));
        const factionDiversity = uniqueFactionCount(left.character.factionCode, middle.character.factionCode, right.character.factionCode);
        const activePower = left.activePower + middle.activePower + right.activePower;
        const supportPower = left.supportPower + middle.supportPower + right.supportPower;
        const reactivePower = left.reactivePower + middle.reactivePower + right.reactivePower;
        const durability = left.durability + middle.durability + right.durability;
        const tempo = left.tempo + middle.tempo + right.tempo;
        const indexes: [number, number, number] = [first, second, third];

        considerRankedTeam(rankedByPolicy.balanced, limit, {
          score: coverageCount * 1_000_000_000_000 + counterCount * 10_000_000_000 + Math.min(2, reactivePower) * 10_000_000 + Math.min(2, supportPower) * 1_000_000 + factionDiversity * 100_000 + activePower * 100 + durability,
          key: '', indexes, policy: 'balanced', coverageCount, counterCount,
        }, stats);
        considerRankedTeam(rankedByPolicy.power, limit, {
          score: coverageCount * 1_000_000_000_000 + counterCount * 10_000_000_000 + activePower * 1_000_000 + tempo * 1_000 + reactivePower * 10 + durability,
          key: '', indexes, policy: 'power', coverageCount, counterCount,
        }, stats);
        considerRankedTeam(rankedByPolicy.survival, limit, {
          score: coverageCount * 1_000_000_000_000 + counterCount * 10_000_000_000 + supportPower * 10_000_000 + reactivePower * 1_000_000 + durability * 1_000 + activePower,
          key: '', indexes, policy: 'survival', coverageCount, counterCount,
        }, stats);
      }
    }
  }

  const unique = new Map<string, BossChallengeCandidateTeam>();
  for (const policy of TEAM_SELECTION_POLICIES) {
    for (const ranked of rankedByPolicy[policy]) {
      const teamIds = ranked.indexes.map((index) => stats[index].character.id) as [string, string, string];
      const key = teamIds.join('|');
      const existing = unique.get(key);
      if (existing) {
        if (!existing.policies.includes(policy)) existing.policies.push(policy);
      } else {
        unique.set(key, { teamIds, policies: [policy], coverageCount: ranked.coverageCount, counterCount: ranked.counterCount });
      }
    }
  }
  return [...unique.values()].sort((left, right) => left.teamIds.join('|').localeCompare(right.teamIds.join('|')));
}

function simulateCandidate(
  boss: BossData,
  candidate: BossChallengeCandidateTeam,
  characters: CharacterData[],
  characterMap: Map<string, CharacterData>,
  skillMap: Map<string, SkillData>,
  equipment: EquipmentData,
  vessel: VesselData,
  loadout: ReturnType<typeof evaluateSandboxLoadout>,
  projection: ReturnType<typeof createBossChallengeCampaignProjection>,
): CandidateSimulation {
  const selectedCharacters = candidate.teamIds.map((id) => requiredCharacter(characterMap, id));
  const perks = teamMasteryPerks(candidate.teamIds, projection);
  let team = selectedCharacters.map((character) => createCharacterRuntime(character, perks.byCharacterId[character.id]));
  let mission: MissionState = {
    ...applyMasteryPerks(applyLoadout(createMission(boss), loadout), perks),
    roundLimit: BOSS_CHALLENGE_ROUND_LIMIT,
  };
  let actions = 0;
  let branchEvents = 0;
  let mitigatedBranchEvents = 0;
  let guardExhausted = true;

  for (let turnGuard = 0; turnGuard < 40 && !mission.complete && !mission.failed; turnGuard += 1) {
    const energyReserveByActorIndex = reactiveEnergyReserveForRound(boss, mission.round, selectedCharacters, skillMap);
    for (let actionGuard = 0; actionGuard < 40 && !mission.complete && !mission.failed; actionGuard += 1) {
      const action = chooseProgressAction(mission, boss, team, selectedCharacters, skillMap, equipment, CHALLENGE_PROFILE, { energyReserveByActorIndex });
      if (!action) break;
      mission = action.resolution.mission;
      team = action.resolution.team;
      actions += 1;
    }
    if (mission.complete || mission.failed) {
      guardExhausted = false;
      break;
    }
    const completedRound = mission.round;
    const round = endRound(mission, boss, team, characterMap, equipment, bossChallengeVesselProjection(vessel, boss));
    mission = round.mission;
    team = bossChallengeRoundTeamProjection(round.team, boss);
    if (mission.failed) {
      guardExhausted = false;
      break;
    }
    const event = branchEventForRound(boss, completedRound);
    if (event) {
      branchEvents += 1;
      const response = chooseReactiveResponse(mission, team, selectedCharacters, skillMap, event, CHALLENGE_PROFILE);
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
  const fatigueRatios = team.map((runtime) => fatigueRatio(runtime, requiredCharacter(characterMap, runtime.characterId)) * 100);
  const averageFatiguePercent = Math.round(fatigueRatios.reduce((sum, value) => sum + value, 0) / Math.max(1, fatigueRatios.length));
  const maxFatiguePercent = Math.round(Math.max(0, ...fatigueRatios));
  const roundsRemaining = Math.max(0, mission.roundLimit - mission.round);
  const resourceFloor = Math.min(mission.safety, mission.weatherWindow, 100 - averageFatiguePercent);
  return {
    bossId: boss.id,
    severity: boss.severity,
    class: boss.class,
    counterFactions: boss.counterFactions.split(',').map((value) => value.trim()),
    teamIds: candidate.teamIds,
    candidateTeamsEvaluated: 1,
    successfulCandidateTeams: Number(mission.complete),
    candidateCompletionRate: mission.complete ? 100 : 0,
    success: mission.complete,
    failureReason: guardExhausted && !mission.complete && !mission.failed ? 'AutoplayGuard' : mission.failureReason,
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
    resourceFloor,
  };
}

function reactiveEnergyReserveForRound(
  boss: BossData,
  round: number,
  characters: CharacterData[],
  skillMap: Map<string, SkillData>,
): Partial<Record<number, number>> {
  if (!branchEventForRound(boss, round)) return {};
  const candidates = characters.flatMap((character, actorIndex) => characterSkillIds(character).flatMap((skillId) => {
    const skill = skillMap.get(skillId);
    return skill?.type === 'Reactive' ? [{ actorIndex, skill }] : [];
  }));
  const best = candidates.sort((left, right) => left.skill.energyCost - right.skill.energyCost || right.skill.power - left.skill.power || left.actorIndex - right.actorIndex)[0];
  return best ? { [best.actorIndex]: best.skill.energyCost } : {};
}

function candidateCharacterStats(character: CharacterData, skillMap: Map<string, SkillData>): CandidateCharacterStats {
  const skills = characterSkillIds(character).map((id) => required(skillMap, id, `Skill ${id}`));
  const activeSkills = skills.filter((skill) => skill.type !== 'Passive' && skill.type !== 'Reactive');
  const supportSkills = skills.filter((skill) => skill.type === 'Support');
  const reactiveSkills = skills.filter((skill) => skill.type === 'Reactive');
  return {
    character,
    coverageMask: factionCoverageMask(character.factionCode),
    activePower: activeSkills.reduce((sum, skill) => sum + skill.power, 0),
    supportPower: supportSkills.reduce((sum, skill) => sum + Math.max(1, skill.power), 0),
    reactivePower: reactiveSkills.reduce((sum, skill) => sum + Math.max(1, skill.power), 0),
    durability: character.fatigueMax * 4 + character.fatigueRecovery * 8 + character.def * 2,
    tempo: character.actionPoints * 30 + character.intel * 2 + character.speed + character.atk,
  };
}

function considerRankedTeam(
  ranked: RankedTeam[],
  limit: number,
  candidate: RankedTeam,
  stats: CandidateCharacterStats[],
): void {
  const worst = ranked[ranked.length - 1];
  if (ranked.length >= limit && candidate.score < worst.score) return;
  candidate.key = candidate.indexes.map((index) => stats[index].character.id).join('|');
  if (ranked.length >= limit && candidate.score === worst.score && candidate.key >= worst.key) return;
  ranked.push(candidate);
  ranked.sort((left, right) => right.score - left.score || left.key.localeCompare(right.key));
  if (ranked.length > limit) ranked.length = limit;
}

function compareCandidateSimulations(left: CandidateSimulation, right: CandidateSimulation): number {
  if (left.success !== right.success) return left.success ? -1 : 1;
  if (left.score !== right.score) return right.score - left.score;
  if (left.round !== right.round) return left.round - right.round;
  if (left.resourceFloor !== right.resourceFloor) return right.resourceFloor - left.resourceFloor;
  return left.teamIds.join('|').localeCompare(right.teamIds.join('|'));
}

function summarizeResults(results: BossChallengeBalanceResult[]): BossChallengeBalanceSummary;
function summarizeResults(results: BossChallengeBalanceResult[], severity: string): BossChallengeSeveritySummary;
function summarizeResults(results: BossChallengeBalanceResult[], severity?: string): BossChallengeSeveritySummary | BossChallengeBalanceSummary {
  const scores = results.map((result) => result.score);
  const completed = results.filter((result) => result.success).length;
  const common = {
    completedBosses: completed,
    completionRate: ratioPercent(completed, results.length),
    averageScore: average(scores),
    minimumScore: scores.length > 0 ? Math.min(...scores) : 0,
    maximumScore: scores.length > 0 ? Math.max(...scores) : 0,
    averageRound: average(results.map((result) => result.round)),
    gradeCounts: Object.fromEntries(GRADE_ORDER.map((grade) => [grade, results.filter((result) => result.grade === grade).length])) as Record<'S' | 'A' | 'B' | 'C' | 'D', number>,
    pressureCounts: Object.fromEntries(PRESSURE_ORDER.map((pressure) => [pressure, results.filter((result) => result.pressure === pressure).length])) as Record<BalancePressure, number>,
  };
  if (severity) {
    return {
      severity,
      bosses: results.length,
      completed,
      completionRate: common.completionRate,
      averageScore: common.averageScore,
      minimumScore: common.minimumScore,
      maximumScore: common.maximumScore,
      averageRound: common.averageRound,
      averageCandidateCompletionRate: average(results.map((result) => result.candidateCompletionRate)),
      gradeCounts: common.gradeCounts,
      pressureCounts: common.pressureCounts,
    };
  }
  return {
    totalBosses: results.length,
    completedBosses: common.completedBosses,
    completionRate: common.completionRate,
    averageScore: common.averageScore,
    minimumScore: common.minimumScore,
    maximumScore: common.maximumScore,
    averageRound: common.averageRound,
    gradeCounts: common.gradeCounts,
    pressureCounts: common.pressureCounts,
  };
}

function findSeverityInversions(results: BossChallengeBalanceResult[]): BossChallengeSeverityInversion[] {
  const inversions: BossChallengeSeverityInversion[] = [];
  for (const classCode of [...new Set(results.map((result) => result.class))].sort()) {
    const classResults = results.filter((result) => result.class === classCode).sort((left, right) => severityRank(left.severity) - severityRank(right.severity));
    for (let index = 1; index < classResults.length; index += 1) {
      const easier = classResults[index - 1];
      const harder = classResults[index];
      if (harder.score > easier.score + 8) {
        inversions.push({
          class: classCode,
          easierBossId: easier.bossId,
          harderBossId: harder.bossId,
          easierScore: easier.score,
          harderScore: harder.score,
        });
      }
    }
  }
  return inversions;
}

function factionCoverageMask(factionCode: string): number {
  return (FACTION_STAGE_SPECIALTIES[factionCode] ?? []).reduce((mask, stage) => mask | (1 << MISSION_STAGES.indexOf(stage)), 0);
}

function uniqueFactionCount(first: string, second: string, third: string): number {
  return 1 + Number(second !== first) + Number(third !== first && third !== second);
}

function normalizedCounterKey(value: string): string {
  return value.split(',').map((item) => item.trim()).filter(Boolean).sort().join(',');
}

function characterSkillIds(character: CharacterData): string[] {
  return [character.passiveSkillId, character.skill1Id, character.skill2Id, character.ultimateSkillId];
}

function severityRank(severity: string): number {
  const match = severity.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function combinationsOfThree(total: number): number {
  return total < 3 ? 0 : (total * (total - 1) * (total - 2)) / 6;
}

function ratioPercent(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function average(values: number[]): number {
  return values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function bitCount(value: number): number {
  let count = 0;
  for (let current = value; current > 0; current >>= 1) count += current & 1;
  return count;
}

function requiredCharacter(map: Map<string, CharacterData>, id: string): CharacterData {
  const character = map.get(id);
  if (!character) throw new Error(`缺少 Challenge balance 角色：${id}`);
  return character;
}

function required<T>(items: T[], predicate: (item: T) => boolean, label: string): T;
function required<T>(items: Map<string, T>, key: string, label: string): T;
function required<T>(items: T[] | Map<string, T>, predicateOrKey: ((item: T) => boolean) | string, label: string): T {
  const item = items instanceof Map
    ? items.get(predicateOrKey as string)
    : items.find(predicateOrKey as (candidate: T) => boolean);
  if (!item) throw new Error(`缺少 Challenge balance 資料：${label}`);
  return item;
}
