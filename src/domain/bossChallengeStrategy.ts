import { BOSS_CHALLENGE_ROUND_LIMIT } from './bossChallenge';
import { createCrewSkillCapabilityProfile } from './crewCapability';
import {
  MISSION_STAGES,
  bossClassRule,
  bossClassTelegraph,
  branchEventForRound,
  teamStageCoverage,
  type BossClassRule,
  type BossClassTelegraph,
  type BossImpactResource,
  type MissionBranchEvent,
} from './runtime';
import type { BossData, CharacterData, SkillData } from './types';

export type ChallengeStrategyGap = 'NO_REACTIVE' | 'NO_TEAM_RECOVERY' | 'NO_LOW_ENERGY_ACTION' | 'STAGE_GAP';

export interface ChallengeStrategyImpact {
  resource: BossImpactResource;
  magnitude: number;
}

export interface ChallengeStrategySkillOption {
  characterId: string;
  skillId: string;
  type: SkillData['type'];
  energyCost: number;
  power: number;
}

export interface ChallengeStrategyBranch {
  round: number;
  event: MissionBranchEvent;
  impacts: BossImpactResource[];
}

export interface BossChallengeStrategyBriefing {
  bossId: string;
  classCode: string;
  rule: BossClassRule;
  telegraph: BossClassTelegraph;
  classImpacts: ChallengeStrategyImpact[];
  baseFatigueDamage: number;
  branchSchedule: ChallengeStrategyBranch[];
  skillTypeCounts: Record<SkillData['type'], number>;
  reactiveOptions: ChallengeStrategySkillOption[];
  teamRecoveryOptions: ChallengeStrategySkillOption[];
  lowEnergyActions: ChallengeStrategySkillOption[];
  counterCount: number;
  coveredStageCount: number;
  gaps: ChallengeStrategyGap[];
}

const SKILL_TYPES: readonly SkillData['type'][] = ['Passive', 'Active', 'Reactive', 'Support', 'Ultimate'];
const IMPACT_VALUE: Record<BossImpactResource, keyof BossClassRule> = {
  fatigue: 'fatigueBonus',
  safety: 'safetyBonus',
  weather: 'weatherBonus',
  evidence: 'evidenceLoss',
  reliability: 'reliabilityLoss',
  progress: 'progressLoss',
  cost: 'costIncrease',
  energy: 'energyDrain',
};

export function createBossChallengeStrategyBriefing(
  boss: BossData,
  team: [CharacterData, CharacterData, CharacterData],
  skillById: Map<string, SkillData>,
): BossChallengeStrategyBriefing {
  const rule = bossClassRule(boss.class);
  const telegraph = bossClassTelegraph(boss.class);
  const capabilityProfiles = team.map((character) => ({
    characterId: character.id,
    profile: createCrewSkillCapabilityProfile(character, skillById, 4),
  }));
  const skills = capabilityProfiles.flatMap(({ characterId, profile }) => (
    profile.skills.map((skill) => ({ characterId, skill }))
  ));
  const toOption = ({ characterId, skill }: (typeof skills)[number]): ChallengeStrategySkillOption => ({
    characterId,
    skillId: skill.id,
    type: skill.type,
    energyCost: skill.energyCost,
    power: skill.power,
  });
  const reactiveOptions = capabilityProfiles.flatMap(({ characterId, profile }) => (
    profile.reactiveSkills.map((skill) => toOption({ characterId, skill }))
  ));
  const teamRecoveryOptions = capabilityProfiles.flatMap(({ characterId, profile }) => (
    profile.teamRecoverySkills.map((skill) => toOption({ characterId, skill }))
  ));
  const lowEnergyActions = capabilityProfiles.flatMap(({ characterId, profile }) => (
    profile.lowEnergyActions.map((skill) => toOption({ characterId, skill }))
  ));
  const stageCoverage = teamStageCoverage(team);
  const coveredStageCount = MISSION_STAGES.filter((stage) => stageCoverage[stage] > 0).length;
  const counterFactions = new Set(boss.counterFactions.split(',').map((value) => value.trim()));
  const counterCount = team.filter((character) => counterFactions.has(character.factionCode)).length;
  const classImpacts = telegraph.impacts.map((resource) => ({
    resource,
    magnitude: Number(rule[IMPACT_VALUE[resource]]),
  }));
  const branchSchedule = [1, 4, 7]
    .filter((round) => round < BOSS_CHALLENGE_ROUND_LIMIT)
    .map((round) => {
      const event = branchEventForRound(boss, round);
      if (!event) throw new Error(`${boss.id} R${round} 缺少 Challenge branch event`);
      return { round, event, impacts: branchImpactResources(event) };
    });
  const gaps: ChallengeStrategyGap[] = [
    reactiveOptions.length === 0 ? 'NO_REACTIVE' : undefined,
    telegraph.impacts.includes('fatigue') && teamRecoveryOptions.length === 0 ? 'NO_TEAM_RECOVERY' : undefined,
    telegraph.impacts.includes('energy') && lowEnergyActions.length === 0 ? 'NO_LOW_ENERGY_ACTION' : undefined,
    coveredStageCount < MISSION_STAGES.length ? 'STAGE_GAP' : undefined,
  ].filter((gap): gap is ChallengeStrategyGap => Boolean(gap));

  return {
    bossId: boss.id,
    classCode: boss.class,
    rule,
    telegraph,
    classImpacts,
    baseFatigueDamage: boss.fatigueDamage,
    branchSchedule,
    skillTypeCounts: Object.fromEntries(SKILL_TYPES.map((type) => [type, skills.filter(({ skill }) => skill.type === type).length])) as Record<SkillData['type'], number>,
    reactiveOptions,
    teamRecoveryOptions,
    lowEnergyActions,
    counterCount,
    coveredStageCount,
    gaps,
  };
}

function branchImpactResources(event: MissionBranchEvent): BossImpactResource[] {
  return [
    event.penalty.weatherLoss > 0 ? 'weather' : undefined,
    event.penalty.safetyLoss > 0 ? 'safety' : undefined,
    event.penalty.evidenceLoss > 0 ? 'evidence' : undefined,
    event.penalty.reliabilityLoss > 0 ? 'reliability' : undefined,
    event.penalty.progressLoss > 0 ? 'progress' : undefined,
    event.penalty.costIncrease > 0 ? 'cost' : undefined,
    event.penalty.energyDrain > 0 ? 'energy' : undefined,
  ].filter((impact): impact is BossImpactResource => Boolean(impact));
}
