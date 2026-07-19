import { MISSION_STAGES, teamStageCoverage, type MissionStage } from './runtime';
import type { BossChallengeAuditItemData, BossData, CharacterData } from './types';

export interface BossChallengeSquadRecommendation {
  bossId: string;
  teamIds: [string, string, string];
  members: [CharacterData, CharacterData, CharacterData];
  stageCoverage: Record<MissionStage, number>;
  coveredStageCount: number;
  counterCount: number;
  auditScore: number;
  auditRound: number;
  candidateCompletionRate: number;
}

export interface BossChallengeSquadProfile {
  teamIds: [string, string, string];
  stageCoverage: Record<MissionStage, number>;
  coveredStageCount: number;
  counterCount: number;
  uniqueMemberCount: number;
}

export interface BossChallengeSquadComparison {
  current: BossChallengeSquadProfile;
  audit: BossChallengeSquadProfile;
  sharedMemberCount: number;
  sameMembers: boolean;
  exactOrder: boolean;
  auditMemberPresent: [boolean, boolean, boolean];
  counterDelta: number;
  coveredStageDelta: number;
  stageCoverageDelta: Record<MissionStage, number>;
}

function createSquadProfile(boss: BossData, members: [CharacterData, CharacterData, CharacterData]): BossChallengeSquadProfile {
  const teamIds = members.map((member) => member.id) as [string, string, string];
  const stageCoverage = teamStageCoverage(members);
  const counterFactions = new Set(boss.counterFactions.split(',').map((value) => value.trim()));
  return {
    teamIds,
    stageCoverage,
    coveredStageCount: MISSION_STAGES.filter((stage) => stageCoverage[stage] > 0).length,
    counterCount: members.filter((character) => counterFactions.has(character.factionCode)).length,
    uniqueMemberCount: new Set(teamIds).size,
  };
}

export function createBossChallengeSquadRecommendation(
  boss: BossData,
  audit: BossChallengeAuditItemData,
  characters: CharacterData[],
): BossChallengeSquadRecommendation {
  if (audit.bossId !== boss.id || !audit.success) throw new Error(`${boss.id} 沒有可套用的成功 Challenge audit`);
  const characterById = new Map(characters.map((character) => [character.id, character]));
  const teamIds = [...audit.recommendedTeamIds] as [string, string, string];
  if (new Set(teamIds).size !== 3) throw new Error(`${boss.id} audit 推薦隊伍角色重複`);
  const members = teamIds.map((id) => {
    const character = characterById.get(id);
    if (!character) throw new Error(`${boss.id} audit 推薦角色不存在：${id}`);
    return character;
  }) as [CharacterData, CharacterData, CharacterData];
  const profile = createSquadProfile(boss, members);
  return {
    bossId: boss.id,
    teamIds,
    members,
    stageCoverage: profile.stageCoverage,
    coveredStageCount: profile.coveredStageCount,
    counterCount: profile.counterCount,
    auditScore: audit.score,
    auditRound: audit.round,
    candidateCompletionRate: audit.candidateCompletionRate,
  };
}

export function compareBossChallengeSquads(
  boss: BossData,
  currentMembers: [CharacterData, CharacterData, CharacterData],
  recommendation: BossChallengeSquadRecommendation,
): BossChallengeSquadComparison {
  if (recommendation.bossId !== boss.id) throw new Error(`${boss.id} 與 Challenge audit 推薦不相符`);
  const current = createSquadProfile(boss, currentMembers);
  const audit = createSquadProfile(boss, recommendation.members);
  const currentIdSet = new Set(current.teamIds);
  const auditIdSet = new Set(audit.teamIds);
  const sharedMemberCount = recommendation.teamIds.filter((id) => currentIdSet.has(id)).length;
  return {
    current,
    audit,
    sharedMemberCount,
    sameMembers: currentIdSet.size === 3 && auditIdSet.size === 3 && sharedMemberCount === 3,
    exactOrder: recommendation.teamIds.every((id, index) => current.teamIds[index] === id),
    auditMemberPresent: recommendation.teamIds.map((id) => currentIdSet.has(id)) as [boolean, boolean, boolean],
    counterDelta: audit.counterCount - current.counterCount,
    coveredStageDelta: audit.coveredStageCount - current.coveredStageCount,
    stageCoverageDelta: Object.fromEntries(MISSION_STAGES.map((stage) => [stage, audit.stageCoverage[stage] - current.stageCoverage[stage]])) as Record<MissionStage, number>,
  };
}
