import type { BalanceDatabase } from './balance';
import { createBossChallengeRouteRepairPreview } from './bossChallengeCandidate';
import type { ChallengeStrategyGap } from './bossChallengeStrategy';
import { verifyBossChallengeDraft, type BossChallengeDraftVerification } from './bossChallengeVerification';

export interface BossChallengeRuntimeRepairCandidate {
  rank: number;
  structuralRank: number;
  teamIds: [string, string, string];
  slotIndex: 0 | 1 | 2;
  replacementCharacterId: string;
  replacedCharacterId: string;
  remainingStructuralGaps: number;
  counterCount: number;
  coveredStageCount: number;
  verification: BossChallengeDraftVerification;
}

export type BossChallengeRuntimeRepairVerdict = 'CLEAR' | 'IMPROVED_FAILED' | 'NO_IMPROVEMENT';

export interface BossChallengeRuntimeRepairSelectionPreview {
  bossId: string;
  currentTeamIds: [string, string, string];
  candidateTeamIds: [string, string, string];
  slotIndex: 0 | 1 | 2;
  replacementCharacterId: string;
  replacedCharacterId: string;
  verdict: BossChallengeRuntimeRepairVerdict;
  scoreDelta: number;
  roundDelta: number;
  remainingStructuralGaps: number;
  counterCount: number;
  coveredStageCount: number;
  currentVerification: BossChallengeDraftVerification;
  candidateVerification: BossChallengeDraftVerification;
}

export interface BossChallengeRuntimeRepairEscalation {
  schemaVersion: 1;
  model: 'OWM_CHALLENGE_RUNTIME_REPAIR_ESCALATION';
  provenance: 'ON_DEMAND_RUNTIME_SHORTLIST';
  bossId: string;
  sourceTeamIds: [string, string, string];
  excludedTeamIds?: [string, string, string];
  priorityGap: ChallengeStrategyGap;
  eligibleStructuralCandidates: number;
  evaluatedCandidates: number;
  shortlistedCandidates: number;
  clearCandidates: number;
  candidates: BossChallengeRuntimeRepairCandidate[];
}

export function createBossChallengeRuntimeRepairEscalation(
  database: BalanceDatabase,
  bossId: string,
  sourceTeamIds: [string, string, string],
  priorityGap: ChallengeStrategyGap,
  excludedTeamIds?: [string, string, string],
  limit = 6,
): BossChallengeRuntimeRepairEscalation {
  const normalizedLimit = Math.max(1, Math.min(12, Math.trunc(limit)));
  const boss = database.bosses.find((candidate) => candidate.id === bossId);
  if (!boss) throw new Error(`Unknown Boss Challenge ID: ${bossId}`);
  const characterById = new Map(database.characters.map((character) => [character.id, character]));
  const sourceTeam = sourceTeamIds.map((id) => {
    const character = characterById.get(id);
    if (!character) throw new Error(`Unknown Boss Challenge character ID: ${id}`);
    return character;
  }) as [typeof database.characters[number], typeof database.characters[number], typeof database.characters[number]];
  const runtimePoolLimit = 60;
  const preview = createBossChallengeRouteRepairPreview(
    boss,
    sourceTeam,
    database.characters,
    new Map(database.skills.map((skill) => [skill.id, skill])),
    runtimePoolLimit,
  );
  if (!preview || preview.gap !== priorityGap) {
    throw new Error(`Runtime Repair Escalation priority gap mismatch for ${bossId}.`);
  }
  const excludedKey = excludedTeamIds?.join('|');
  const simulations = preview.candidates
    .map((candidate, structuralIndex) => ({
      candidate,
      structuralRank: structuralIndex + 1,
      verification: verifyBossChallengeDraft(database, bossId, candidate.teamIds),
    }))
    .filter(({ candidate }) => candidate.teamIds.join('|') !== excludedKey)
    .sort((left, right) => Number(right.verification.success) - Number(left.verification.success)
      || right.verification.score - left.verification.score
      || left.verification.round - right.verification.round
      || left.candidate.teamIds.join('|').localeCompare(right.candidate.teamIds.join('|')));
  const rankedCandidates = simulations.map(({ candidate, structuralRank, verification }, index): BossChallengeRuntimeRepairCandidate => ({
    rank: index + 1,
    structuralRank,
    teamIds: [...candidate.teamIds],
    slotIndex: candidate.slotIndex,
    replacementCharacterId: candidate.character.id,
    replacedCharacterId: candidate.replaces.id,
    remainingStructuralGaps: candidate.after.gaps.length,
    counterCount: candidate.after.counter,
    coveredStageCount: candidate.after.stage,
    verification,
  }));
  const currentVerification = verifyBossChallengeDraft(database, bossId, excludedTeamIds ?? sourceTeamIds);
  const shortlist = rankedCandidates.slice(0, normalizedLimit);
  const noImprovementCandidate = rankedCandidates.find((candidate) => (
    createBossChallengeRuntimeRepairSelectionPreview(currentVerification, candidate).verdict === 'NO_IMPROVEMENT'
  ));
  // 清單保留一個誠實的無改善對照，讓玩家知道不是每個結構候選都能改善 runtime；最佳候選仍固定在第一位。
  if (normalizedLimit > 1 && noImprovementCandidate
    && !shortlist.some((candidate) => candidate.teamIds.join('|') === noImprovementCandidate.teamIds.join('|'))) {
    shortlist[shortlist.length - 1] = noImprovementCandidate;
  }
  const candidates = shortlist.map((candidate, index) => ({ ...candidate, rank: index + 1 }));
  return {
    schemaVersion: 1,
    model: 'OWM_CHALLENGE_RUNTIME_REPAIR_ESCALATION',
    provenance: 'ON_DEMAND_RUNTIME_SHORTLIST',
    bossId,
    sourceTeamIds: [...sourceTeamIds],
    excludedTeamIds: excludedTeamIds ? [...excludedTeamIds] : undefined,
    priorityGap,
    eligibleStructuralCandidates: preview.eligibleCandidateCount,
    evaluatedCandidates: rankedCandidates.length,
    shortlistedCandidates: candidates.length,
    clearCandidates: rankedCandidates.filter((candidate) => candidate.verification.success).length,
    candidates,
  };
}

export function createBossChallengeRuntimeRepairSelectionPreview(
  currentVerification: BossChallengeDraftVerification,
  candidate: BossChallengeRuntimeRepairCandidate,
): BossChallengeRuntimeRepairSelectionPreview {
  if (currentVerification.bossId !== candidate.verification.bossId) {
    throw new Error('Runtime Repair selection preview requires the same Boss ID.');
  }
  if (!candidate.teamIds.every((id, index) => candidate.verification.teamIds[index] === id)) {
    throw new Error('Runtime Repair candidate verification does not match its stable team IDs.');
  }
  const scoreDelta = candidate.verification.score - currentVerification.score;
  const roundDelta = candidate.verification.round - currentVerification.round;
  const improvedFailed = !candidate.verification.success
    && (scoreDelta > 0 || (scoreDelta === 0 && roundDelta < 0));
  return {
    bossId: currentVerification.bossId,
    currentTeamIds: [...currentVerification.teamIds],
    candidateTeamIds: [...candidate.teamIds],
    slotIndex: candidate.slotIndex,
    replacementCharacterId: candidate.replacementCharacterId,
    // 候選是從原始失敗隊伍產生；預覽必須顯示目前畫面上真正會被換掉的成員。
    replacedCharacterId: currentVerification.teamIds[candidate.slotIndex],
    verdict: candidate.verification.success ? 'CLEAR' : improvedFailed ? 'IMPROVED_FAILED' : 'NO_IMPROVEMENT',
    scoreDelta,
    roundDelta,
    remainingStructuralGaps: candidate.remainingStructuralGaps,
    counterCount: candidate.counterCount,
    coveredStageCount: candidate.coveredStageCount,
    currentVerification,
    candidateVerification: candidate.verification,
  };
}

export function selectDefaultBossChallengeRuntimeRepairCandidate(
  currentVerification: BossChallengeDraftVerification,
  candidates: BossChallengeRuntimeRepairCandidate[],
): BossChallengeRuntimeRepairCandidate | undefined {
  // 保留無改善候選供比較，但預設優先放在確實改善或可通關的選項。
  return candidates.find((candidate) => createBossChallengeRuntimeRepairSelectionPreview(currentVerification, candidate).verdict !== 'NO_IMPROVEMENT')
    ?? candidates[0];
}
