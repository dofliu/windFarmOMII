import { createBossChallengeStrategyBriefing, type ChallengeStrategyGap } from './bossChallengeStrategy';
import { characterHasCrewSkillCapability, type CrewSkillCapability } from './crewCapability';
import type { BossData, CharacterData, SkillData } from './types';

export interface ChallengeStrategyStructureMetrics {
  reactive: number;
  teamRecovery: number;
  lowEnergy: number;
  counter: number;
  stage: number;
  gaps: ChallengeStrategyGap[];
}

export interface BossChallengeGapCandidate {
  character: CharacterData;
  replaces: CharacterData;
  slotIndex: 0 | 1 | 2;
  teamIds: [string, string, string];
  before: ChallengeStrategyStructureMetrics;
  after: ChallengeStrategyStructureMetrics;
  requestedDelta: number;
  closesRequestedGap: boolean;
}

export interface BossChallengeGapCandidatePreview {
  capability: Exclude<CrewSkillCapability, 'ALL'>;
  eligibleCandidateCount: number;
  evaluatedSwapCount: number;
  before: ChallengeStrategyStructureMetrics;
  candidates: BossChallengeGapCandidate[];
}

export type BossChallengeRepairTarget = Exclude<CrewSkillCapability, 'ALL'> | 'STAGE_COVERAGE';

export interface BossChallengeRouteRepairPreview {
  gap: ChallengeStrategyGap;
  target: BossChallengeRepairTarget;
  eligibleCandidateCount: number;
  evaluatedSwapCount: number;
  before: ChallengeStrategyStructureMetrics;
  candidate?: BossChallengeGapCandidate;
  candidates: BossChallengeGapCandidate[];
}

const GAP_REPAIR_PRIORITY: ChallengeStrategyGap[] = [
  'NO_REACTIVE',
  'NO_TEAM_RECOVERY',
  'NO_LOW_ENERGY_ACTION',
  'STAGE_GAP',
];

export function createBossChallengeGapCandidatePreview(
  boss: BossData,
  currentTeam: [CharacterData, CharacterData, CharacterData],
  roster: CharacterData[],
  skillById: Map<string, SkillData>,
  capability: Exclude<CrewSkillCapability, 'ALL'>,
  limit = 3,
): BossChallengeGapCandidatePreview {
  if (new Set(currentTeam.map((character) => character.id)).size !== 3) {
    throw new Error('Strategy Gap Candidate Preview requires three unique current members.');
  }
  const currentIds = new Set(currentTeam.map((character) => character.id));
  const before = strategyMetrics(createBossChallengeStrategyBriefing(boss, currentTeam, skillById));
  const eligible = roster
    .filter((character) => !currentIds.has(character.id))
    .filter((character) => characterHasCrewSkillCapability(character, skillById, capability, 4))
    .sort((left, right) => left.id.localeCompare(right.id));

  const candidates = eligible.map((character) => {
    const swaps = ([0, 1, 2] as const).map((slotIndex): BossChallengeGapCandidate => {
      const nextTeam = [...currentTeam] as [CharacterData, CharacterData, CharacterData];
      const replaces = nextTeam[slotIndex];
      nextTeam[slotIndex] = character;
      const after = strategyMetrics(createBossChallengeStrategyBriefing(boss, nextTeam, skillById));
      const requestedDelta = capabilityCount(after, capability) - capabilityCount(before, capability);
      return {
        character,
        replaces,
        slotIndex,
        teamIds: nextTeam.map((member) => member.id) as [string, string, string],
        before,
        after,
        requestedDelta,
        closesRequestedGap: capabilityCount(after, capability) > 0,
      };
    });
    return swaps.sort(compareGapCandidates)[0];
  }).sort(compareGapCandidates);

  return {
    capability,
    eligibleCandidateCount: eligible.length,
    evaluatedSwapCount: eligible.length * 3,
    before,
    candidates: candidates.slice(0, Math.max(0, limit)),
  };
}

/**
 * Route 只顯示一個可立即採用的修補方案，因此固定依 gameplay 結構風險排序缺口，
 * 再完整比較 roster × 三席；不執行 runtime，也不把結果冒充 audit recommendation。
 */
export function createBossChallengeRouteRepairPreview(
  boss: BossData,
  currentTeam: [CharacterData, CharacterData, CharacterData],
  roster: CharacterData[],
  skillById: Map<string, SkillData>,
  limit = 1,
): BossChallengeRouteRepairPreview | undefined {
  if (new Set(currentTeam.map((character) => character.id)).size !== 3) {
    throw new Error('Route Repair Preview requires three unique current members.');
  }
  const before = strategyMetrics(createBossChallengeStrategyBriefing(boss, currentTeam, skillById));
  const gap = GAP_REPAIR_PRIORITY.find((candidate) => before.gaps.includes(candidate));
  if (!gap) return undefined;
  const target = challengeGapRepairTarget(gap);

  if (target !== 'STAGE_COVERAGE') {
    const preview = createBossChallengeGapCandidatePreview(boss, currentTeam, roster, skillById, target, limit);
    return {
      gap,
      target,
      eligibleCandidateCount: preview.eligibleCandidateCount,
      evaluatedSwapCount: preview.evaluatedSwapCount,
      before,
      candidate: preview.candidates[0],
      candidates: preview.candidates,
    };
  }

  const currentIds = new Set(currentTeam.map((character) => character.id));
  const eligible = roster
    .filter((character) => !currentIds.has(character.id))
    .sort((left, right) => left.id.localeCompare(right.id));
  const candidates = eligible.flatMap((character) => ([0, 1, 2] as const).map((slotIndex): BossChallengeGapCandidate => {
    const nextTeam = [...currentTeam] as [CharacterData, CharacterData, CharacterData];
    const replaces = nextTeam[slotIndex];
    nextTeam[slotIndex] = character;
    const after = strategyMetrics(createBossChallengeStrategyBriefing(boss, nextTeam, skillById));
    return {
      character,
      replaces,
      slotIndex,
      teamIds: nextTeam.map((member) => member.id) as [string, string, string],
      before,
      after,
      requestedDelta: after.stage - before.stage,
      closesRequestedGap: after.stage === 6,
    };
  })).sort(compareGapCandidates);
  const shortlisted = candidates.slice(0, Math.max(0, limit));
  return {
    gap,
    target,
    eligibleCandidateCount: eligible.length,
    evaluatedSwapCount: eligible.length * 3,
    before,
    candidate: shortlisted[0],
    candidates: shortlisted,
  };
}

export function challengeGapRepairTarget(gap: ChallengeStrategyGap): BossChallengeRepairTarget {
  if (gap === 'NO_REACTIVE') return 'REACTIVE';
  if (gap === 'NO_TEAM_RECOVERY') return 'TEAM_RECOVERY';
  if (gap === 'NO_LOW_ENERGY_ACTION') return 'LOW_ENERGY';
  return 'STAGE_COVERAGE';
}

function strategyMetrics(briefing: ReturnType<typeof createBossChallengeStrategyBriefing>): ChallengeStrategyStructureMetrics {
  return {
    reactive: briefing.reactiveOptions.length,
    teamRecovery: briefing.teamRecoveryOptions.length,
    lowEnergy: briefing.lowEnergyActions.length,
    counter: briefing.counterCount,
    stage: briefing.coveredStageCount,
    gaps: [...briefing.gaps],
  };
}

function capabilityCount(metrics: ChallengeStrategyStructureMetrics, capability: Exclude<CrewSkillCapability, 'ALL'>): number {
  if (capability === 'REACTIVE') return metrics.reactive;
  if (capability === 'TEAM_RECOVERY') return metrics.teamRecovery;
  return metrics.lowEnergy;
}

function compareGapCandidates(left: BossChallengeGapCandidate, right: BossChallengeGapCandidate): number {
  const priorities: Array<[number, number]> = [
    [Number(left.closesRequestedGap), Number(right.closesRequestedGap)],
    [-left.after.gaps.length, -right.after.gaps.length],
    [left.after.stage, right.after.stage],
    [left.after.counter, right.after.counter],
    [structureReadiness(left.after), structureReadiness(right.after)],
    [left.requestedDelta, right.requestedDelta],
  ];
  for (const [leftValue, rightValue] of priorities) {
    if (leftValue !== rightValue) return rightValue - leftValue;
  }
  const characterOrder = left.character.id.localeCompare(right.character.id);
  return characterOrder || left.slotIndex - right.slotIndex;
}

function structureReadiness(metrics: ChallengeStrategyStructureMetrics): number {
  return Number(metrics.reactive > 0)
    + Number(metrics.teamRecovery > 0)
    + Number(metrics.lowEnergy > 0)
    + Number(metrics.stage === 6);
}
