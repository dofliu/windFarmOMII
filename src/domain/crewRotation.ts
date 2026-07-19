import {
  campaignCrewFatigue,
  characterMastery,
  crewReadinessBand,
  isCrewMemberDeployable,
  masteryPerkModifiers,
  type CampaignProgress,
  type CrewReadinessBand,
} from './campaign';
import {
  createDispatchCrewForecast,
  createDispatchCrewForecastContext,
  type DispatchCrewForecast,
} from './dispatchForecast';
import { characterHasCrewSkillCapability, type CrewSkillCapability } from './crewCapability';
import { MISSION_STAGES, stageAffinity } from './runtime';
import type { BossData, CharacterData, EquipmentData, MissionData, SkillData, VesselData } from './types';

export type CrewReadinessFilter = 'ALL' | CrewReadinessBand;

export interface CrewRosterFilters {
  query: string;
  factionCode: 'ALL' | string;
  readiness: CrewReadinessFilter;
  minimumMastery: 0 | 1 | 2 | 3 | 4 | 5;
  capability: CrewSkillCapability;
}

export interface CrewRotationCandidate {
  character: CharacterData;
  forecast: DispatchCrewForecast;
  currentBand: CrewReadinessBand;
  masteryLevel: number;
  qualified: boolean;
  counter: boolean;
  deployable: boolean;
  stageMask: number;
  perkCount: number;
  retained: boolean;
  projectedBandRank: number;
  projectedRatioPoints: number;
  currentRatioPoints: number;
}

export interface CrewRotationScore {
  masteryReady: boolean;
  qualifiedMembers: number;
  requiredQualifiedMembers: number;
  projectedExhaustedCount: number;
  projectedCriticalOrWorseCount: number;
  projectedTiredOrWorseCount: number;
  stageCoverage: number;
  counterCoverage: number;
  masteryTotal: number;
  perkCount: number;
  retainedMembers: number;
  maxProjectedRatioPoints: number;
  totalProjectedRatioPoints: number;
  totalCurrentRatioPoints: number;
}

export interface CrewRotationRecommendation {
  candidateCount: number;
  teamIds: [string, string, string];
  candidates: [CrewRotationCandidate, CrewRotationCandidate, CrewRotationCandidate];
  score: CrewRotationScore;
  currentScore: CrewRotationScore;
  changedSlots: number;
  changesRecommended: boolean;
}

const BAND_RANK: Record<CrewReadinessBand, number> = {
  Stable: 0,
  Tired: 1,
  Critical: 2,
  Exhausted: 3,
};

const POPCOUNT_6 = Array.from({ length: 64 }, (_, mask) => {
  let value = mask;
  let count = 0;
  while (value > 0) {
    count += value & 1;
    value >>= 1;
  }
  return count;
});

export function filterCrewRoster(
  characters: CharacterData[],
  campaign: CampaignProgress,
  filters: CrewRosterFilters,
  skillById: Map<string, SkillData>,
): CharacterData[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return characters
    .filter((character) => {
      const band = crewReadinessBand(campaign, character);
      const mastery = characterMastery(campaign.characterXp[character.id] ?? 0);
      if (filters.factionCode !== 'ALL' && character.factionCode !== filters.factionCode) return false;
      if (filters.readiness !== 'ALL' && band !== filters.readiness) return false;
      if (filters.minimumMastery > 0 && mastery.level < filters.minimumMastery) return false;
      if (!characterHasCrewSkillCapability(character, skillById, filters.capability, mastery.unlockedSkillSlots)) return false;
      if (!query) return true;
      return [character.id, character.nameZh, character.nameEn, character.professionZh, character.professionEn]
        .some((value) => value.toLocaleLowerCase().includes(query));
    })
    .sort((left, right) => {
      const bandDifference = BAND_RANK[crewReadinessBand(campaign, left)] - BAND_RANK[crewReadinessBand(campaign, right)];
      if (bandDifference !== 0) return bandDifference;
      const leftRatio = campaignCrewFatigue(campaign, left.id) / Math.max(1, left.fatigueMax);
      const rightRatio = campaignCrewFatigue(campaign, right.id) / Math.max(1, right.fatigueMax);
      if (leftRatio !== rightRatio) return leftRatio - rightRatio;
      const masteryDifference = characterMastery(campaign.characterXp[right.id] ?? 0).level
        - characterMastery(campaign.characterXp[left.id] ?? 0).level;
      return masteryDifference || left.id.localeCompare(right.id);
    });
}

export function createCrewRotationRecommendation(
  campaign: CampaignProgress,
  mission: MissionData,
  boss: BossData,
  equipment: EquipmentData,
  vessel: VesselData,
  characters: CharacterData[],
  currentTeamIds: [string, string, string],
): CrewRotationRecommendation {
  const currentIds = new Set(currentTeamIds);
  const counters = new Set(boss.counterFactions.split(',').map((value) => value.trim()).filter(Boolean));
  const context = createDispatchCrewForecastContext(boss, equipment, vessel);
  const requiredMastery = mission.operationProfile.minimumMasteryLevel;
  const requiredQualifiedMembers = mission.operationProfile.minimumQualifiedMembers;
  const allCandidates = characters.map((character): CrewRotationCandidate => {
    const masteryLevel = characterMastery(campaign.characterXp[character.id] ?? 0).level;
    const forecast = createDispatchCrewForecast(campaign, character, context);
    return {
      character,
      forecast,
      currentBand: crewReadinessBand(campaign, character),
      masteryLevel,
      qualified: masteryLevel >= requiredMastery,
      counter: counters.has(character.factionCode),
      deployable: isCrewMemberDeployable(campaign, character),
      stageMask: stageMaskForFaction(character.factionCode),
      perkCount: masteryPerkModifiers(campaign.characterXp[character.id] ?? 0).unlockedPerkIds.length,
      retained: currentIds.has(character.id),
      projectedBandRank: BAND_RANK[forecast.roundLimitBand],
      projectedRatioPoints: ratioPoints(forecast.afterRoundLimit, character.fatigueMax),
      currentRatioPoints: ratioPoints(forecast.before, character.fatigueMax),
    };
  });
  const deployable = allCandidates
    .filter((candidate) => candidate.deployable)
    .sort((left, right) => left.character.id.localeCompare(right.character.id));
  if (deployable.length < 3) throw new Error('At least three deployable crew members are required.');

  let best: [CrewRotationCandidate, CrewRotationCandidate, CrewRotationCandidate] | undefined;
  let bestScore: CrewRotationScore | undefined;
  // 300 人完整搜尋僅需 C(300, 3)；內圈只比較預先計算的整數，保持 deterministic 且不以近似候選池犧牲結果。
  for (let first = 0; first < deployable.length - 2; first += 1) {
    const a = deployable[first];
    for (let second = first + 1; second < deployable.length - 1; second += 1) {
      const b = deployable[second];
      for (let third = second + 1; third < deployable.length; third += 1) {
        const c = deployable[third];
        if (!bestScore || isCandidateTripleBetter(a, b, c, requiredQualifiedMembers, bestScore)) {
          best = [a, b, c];
          bestScore = scoreCandidates(a, b, c, requiredQualifiedMembers);
        }
      }
    }
  }
  if (!best || !bestScore) throw new Error('Unable to create a crew rotation recommendation.');

  const currentById = new Map(allCandidates.map((candidate) => [candidate.character.id, candidate]));
  const current = currentTeamIds.map((id) => currentById.get(id));
  if (current.some((candidate) => !candidate)) throw new Error('Current crew contains an unknown character.');
  const currentCandidates = current as [CrewRotationCandidate, CrewRotationCandidate, CrewRotationCandidate];
  const currentScore = scoreCandidates(...currentCandidates, requiredQualifiedMembers);
  const ordered = orderToPreserveSlots(best, currentTeamIds);
  const teamIds = ordered.map((candidate) => candidate.character.id) as [string, string, string];
  const changedSlots = teamIds.filter((id, index) => id !== currentTeamIds[index]).length;
  return {
    candidateCount: deployable.length,
    teamIds,
    candidates: ordered,
    score: bestScore,
    currentScore,
    changedSlots,
    changesRecommended: compareCrewRotationScores(bestScore, currentScore) > 0 && changedSlots > 0,
  };
}

export function compareCrewRotationScores(left: CrewRotationScore, right: CrewRotationScore): number {
  const priorities: Array<[number, number]> = [
    [Number(left.masteryReady), Number(right.masteryReady)],
    [-left.projectedExhaustedCount, -right.projectedExhaustedCount],
    [-left.projectedCriticalOrWorseCount, -right.projectedCriticalOrWorseCount],
    [-left.projectedTiredOrWorseCount, -right.projectedTiredOrWorseCount],
    [left.stageCoverage, right.stageCoverage],
    [left.counterCoverage, right.counterCoverage],
    [left.masteryTotal, right.masteryTotal],
    [left.perkCount, right.perkCount],
    [left.retainedMembers, right.retainedMembers],
    [-left.maxProjectedRatioPoints, -right.maxProjectedRatioPoints],
    [-left.totalProjectedRatioPoints, -right.totalProjectedRatioPoints],
    [-left.totalCurrentRatioPoints, -right.totalCurrentRatioPoints],
  ];
  for (const [leftValue, rightValue] of priorities) {
    if (leftValue !== rightValue) return leftValue > rightValue ? 1 : -1;
  }
  return 0;
}

function scoreCandidates(
  a: CrewRotationCandidate,
  b: CrewRotationCandidate,
  c: CrewRotationCandidate,
  requiredQualifiedMembers: number,
): CrewRotationScore {
  const members = [a, b, c];
  const qualifiedMembers = members.filter((candidate) => candidate.qualified).length;
  const projectedRanks = members.map((candidate) => candidate.projectedBandRank);
  const projectedRatios = members.map((candidate) => candidate.projectedRatioPoints);
  return {
    masteryReady: qualifiedMembers >= requiredQualifiedMembers,
    qualifiedMembers,
    requiredQualifiedMembers,
    projectedExhaustedCount: projectedRanks.filter((rank) => rank >= BAND_RANK.Exhausted).length,
    projectedCriticalOrWorseCount: projectedRanks.filter((rank) => rank >= BAND_RANK.Critical).length,
    projectedTiredOrWorseCount: projectedRanks.filter((rank) => rank >= BAND_RANK.Tired).length,
    stageCoverage: POPCOUNT_6[a.stageMask | b.stageMask | c.stageMask],
    counterCoverage: members.filter((candidate) => candidate.counter).length,
    masteryTotal: members.reduce((sum, candidate) => sum + candidate.masteryLevel, 0),
    perkCount: members.reduce((sum, candidate) => sum + candidate.perkCount, 0),
    retainedMembers: members.filter((candidate) => candidate.retained).length,
    maxProjectedRatioPoints: Math.max(...projectedRatios),
    totalProjectedRatioPoints: projectedRatios.reduce((sum, value) => sum + value, 0),
    totalCurrentRatioPoints: members.reduce((sum, candidate) => sum + candidate.currentRatioPoints, 0),
  };
}

function isCandidateTripleBetter(
  a: CrewRotationCandidate,
  b: CrewRotationCandidate,
  c: CrewRotationCandidate,
  requiredQualifiedMembers: number,
  currentBest: CrewRotationScore,
): boolean {
  const qualifiedMembers = Number(a.qualified) + Number(b.qualified) + Number(c.qualified);
  const masteryReady = qualifiedMembers >= requiredQualifiedMembers;
  if (masteryReady !== currentBest.masteryReady) return masteryReady;

  const exhaustedCount = Number(a.projectedBandRank >= BAND_RANK.Exhausted)
    + Number(b.projectedBandRank >= BAND_RANK.Exhausted)
    + Number(c.projectedBandRank >= BAND_RANK.Exhausted);
  if (exhaustedCount !== currentBest.projectedExhaustedCount) return exhaustedCount < currentBest.projectedExhaustedCount;
  const criticalCount = Number(a.projectedBandRank >= BAND_RANK.Critical)
    + Number(b.projectedBandRank >= BAND_RANK.Critical)
    + Number(c.projectedBandRank >= BAND_RANK.Critical);
  if (criticalCount !== currentBest.projectedCriticalOrWorseCount) return criticalCount < currentBest.projectedCriticalOrWorseCount;
  const tiredCount = Number(a.projectedBandRank >= BAND_RANK.Tired)
    + Number(b.projectedBandRank >= BAND_RANK.Tired)
    + Number(c.projectedBandRank >= BAND_RANK.Tired);
  if (tiredCount !== currentBest.projectedTiredOrWorseCount) return tiredCount < currentBest.projectedTiredOrWorseCount;

  const stageCoverage = POPCOUNT_6[a.stageMask | b.stageMask | c.stageMask];
  if (stageCoverage !== currentBest.stageCoverage) return stageCoverage > currentBest.stageCoverage;
  const counterCoverage = Number(a.counter) + Number(b.counter) + Number(c.counter);
  if (counterCoverage !== currentBest.counterCoverage) return counterCoverage > currentBest.counterCoverage;
  const masteryTotal = a.masteryLevel + b.masteryLevel + c.masteryLevel;
  if (masteryTotal !== currentBest.masteryTotal) return masteryTotal > currentBest.masteryTotal;
  const perkCount = a.perkCount + b.perkCount + c.perkCount;
  if (perkCount !== currentBest.perkCount) return perkCount > currentBest.perkCount;
  const retainedMembers = Number(a.retained) + Number(b.retained) + Number(c.retained);
  if (retainedMembers !== currentBest.retainedMembers) return retainedMembers > currentBest.retainedMembers;
  const maxProjectedRatioPoints = Math.max(a.projectedRatioPoints, b.projectedRatioPoints, c.projectedRatioPoints);
  if (maxProjectedRatioPoints !== currentBest.maxProjectedRatioPoints) return maxProjectedRatioPoints < currentBest.maxProjectedRatioPoints;
  const totalProjectedRatioPoints = a.projectedRatioPoints + b.projectedRatioPoints + c.projectedRatioPoints;
  if (totalProjectedRatioPoints !== currentBest.totalProjectedRatioPoints) return totalProjectedRatioPoints < currentBest.totalProjectedRatioPoints;
  const totalCurrentRatioPoints = a.currentRatioPoints + b.currentRatioPoints + c.currentRatioPoints;
  return totalCurrentRatioPoints < currentBest.totalCurrentRatioPoints;
}

function stageMaskForFaction(factionCode: string): number {
  return MISSION_STAGES.reduce((mask, stage, index) => (
    stageAffinity(factionCode, stage) > 1 ? mask | (1 << index) : mask
  ), 0);
}

function ratioPoints(value: number, maximum: number): number {
  return Math.round(value / Math.max(1, maximum) * 10_000);
}

function orderToPreserveSlots(
  selected: [CrewRotationCandidate, CrewRotationCandidate, CrewRotationCandidate],
  currentTeamIds: [string, string, string],
): [CrewRotationCandidate, CrewRotationCandidate, CrewRotationCandidate] {
  const remaining = [...selected];
  const ordered: Array<CrewRotationCandidate | undefined> = [undefined, undefined, undefined];
  currentTeamIds.forEach((characterId, index) => {
    const retainedIndex = remaining.findIndex((candidate) => candidate.character.id === characterId);
    if (retainedIndex >= 0) ordered[index] = remaining.splice(retainedIndex, 1)[0];
  });
  ordered.forEach((candidate, index) => {
    if (!candidate) ordered[index] = remaining.shift();
  });
  return ordered as [CrewRotationCandidate, CrewRotationCandidate, CrewRotationCandidate];
}
