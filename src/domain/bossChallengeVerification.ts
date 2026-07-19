import type { BalanceDatabase, BalancePressure } from './balance';
import type { BossChallengeRouteRepairPreview } from './bossChallengeCandidate';
import { simulateBossChallengeTeam } from './bossChallengeBalance';
import type { MissionFailureReason } from './runtime';
import type { ChallengeStrategyGap } from './bossChallengeStrategy';

export const BOSS_CHALLENGE_DRAFT_VERIFICATION_MODEL = 'OWM_CHALLENGE_DRAFT_DETERMINISTIC_AUTOPLAY' as const;

export interface BossChallengeDraftVerification {
  schemaVersion: 1;
  model: typeof BOSS_CHALLENGE_DRAFT_VERIFICATION_MODEL;
  provenance: 'DRAFT_RUNTIME_ONLY';
  bossId: string;
  teamIds: [string, string, string];
  status: 'CLEAR' | 'FAILED';
  success: boolean;
  score: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  round: number;
  roundLimit: number;
  pressure: BalancePressure;
  failureReason?: MissionFailureReason | 'AutoplayGuard';
}

export type BossChallengeDraftVerificationOutcome = 'CLEARED_AFTER_REPAIR' | 'STILL_FAILED' | 'CLEAR_HELD' | 'REGRESSED';

export interface BossChallengeDraftRepairEvidence {
  bossId: string;
  failedTeamIds: [string, string, string];
  priorityGap: ChallengeStrategyGap;
  repairTeamIds: [string, string, string];
  replacementCharacterId: string;
  replacedCharacterId: string;
}

export interface BossChallengeDraftVerificationComparison {
  bossId: string;
  beforeTeamIds: [string, string, string];
  afterTeamIds: [string, string, string];
  outcome: BossChallengeDraftVerificationOutcome;
  scoreDelta: number;
  roundDelta: number;
  before: BossChallengeDraftVerification;
  after: BossChallengeDraftVerification;
}

export function verifyBossChallengeDraft(
  database: BalanceDatabase,
  bossId: string,
  teamIds: [string, string, string],
): BossChallengeDraftVerification {
  const boss = database.bosses.find((candidate) => candidate.id === bossId);
  if (!boss) throw new Error(`Unknown Boss Challenge ID: ${bossId}`);
  const simulation = simulateBossChallengeTeam(database, boss, teamIds);
  return {
    schemaVersion: 1,
    model: BOSS_CHALLENGE_DRAFT_VERIFICATION_MODEL,
    provenance: 'DRAFT_RUNTIME_ONLY',
    bossId,
    teamIds: [...teamIds],
    status: simulation.success ? 'CLEAR' : 'FAILED',
    success: simulation.success,
    score: simulation.score,
    grade: simulation.grade,
    round: simulation.round,
    roundLimit: simulation.roundLimit,
    pressure: simulation.pressure,
    failureReason: simulation.failureReason,
  };
}

export function createBossChallengeDraftRepairEvidence(
  verification: BossChallengeDraftVerification,
  preview: BossChallengeRouteRepairPreview | undefined,
): BossChallengeDraftRepairEvidence | undefined {
  if (verification.success || !preview?.candidate) return undefined;
  return {
    bossId: verification.bossId,
    failedTeamIds: [...verification.teamIds],
    priorityGap: preview.gap,
    repairTeamIds: [...preview.candidate.teamIds],
    replacementCharacterId: preview.candidate.character.id,
    replacedCharacterId: preview.candidate.replaces.id,
  };
}

export function compareBossChallengeDraftVerifications(
  before: BossChallengeDraftVerification,
  after: BossChallengeDraftVerification,
): BossChallengeDraftVerificationComparison {
  if (before.bossId !== after.bossId) throw new Error('Draft Verification comparison requires the same Boss ID.');
  const outcome: BossChallengeDraftVerificationOutcome = before.success
    ? after.success ? 'CLEAR_HELD' : 'REGRESSED'
    : after.success ? 'CLEARED_AFTER_REPAIR' : 'STILL_FAILED';
  return {
    bossId: before.bossId,
    beforeTeamIds: [...before.teamIds],
    afterTeamIds: [...after.teamIds],
    outcome,
    scoreDelta: after.score - before.score,
    roundDelta: after.round - before.round,
    before,
    after,
  };
}
