import { describe, expect, it } from 'vitest';
import bosses from '../../json/bosses.json';
import characters from '../../json/characters.json';
import equipment from '../../json/equipment.json';
import missions from '../../json/missions.json';
import skills from '../../json/skills.json';
import vessels from '../../json/vessels.json';
import type { BalanceDatabase } from './balance';
import {
  createBossChallengeRuntimeRepairEscalation,
  createBossChallengeRuntimeRepairSelectionPreview,
  selectDefaultBossChallengeRuntimeRepairCandidate,
} from './bossChallengeRepairEscalation';
import { verifyBossChallengeDraft } from './bossChallengeVerification';

const database = { missions, bosses, characters, skills, equipment, vessels } as unknown as BalanceDatabase;
const sourceTeamIds: [string, string, string] = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'];
const firstRepairTeamIds: [string, string, string] = ['CHR-MFG-128', 'CHR-MAR-176', 'CHR-OMI-221'];

describe('Boss Challenge runtime repair escalation', () => {
  it('is deterministic and excludes the already-tried structural repair', () => {
    const first = createBossChallengeRuntimeRepairEscalation(database, 'BOSS080', sourceTeamIds, 'NO_REACTIVE', firstRepairTeamIds);
    const second = createBossChallengeRuntimeRepairEscalation(database, 'BOSS080', sourceTeamIds, 'NO_REACTIVE', firstRepairTeamIds);
    expect(second).toEqual(first);
    expect(first).toMatchObject({
      provenance: 'ON_DEMAND_RUNTIME_SHORTLIST',
      bossId: 'BOSS080',
      sourceTeamIds,
      excludedTeamIds: firstRepairTeamIds,
      evaluatedCandidates: 59,
      shortlistedCandidates: 6,
    });
    expect(first.candidates.some((candidate) => candidate.teamIds.join('|') === firstRepairTeamIds.join('|'))).toBe(false);
  });

  it('ranks runtime clears before failures, then score, round and stable IDs', () => {
    const result = createBossChallengeRuntimeRepairEscalation(database, 'BOSS080', sourceTeamIds, 'NO_REACTIVE', firstRepairTeamIds);
    expect(result.candidates).toHaveLength(6);
    expect(result.clearCandidates).toBe(result.candidates.filter((candidate) => candidate.verification.success).length);
    for (let index = 1; index < result.candidates.length; index += 1) {
      const previous = result.candidates[index - 1];
      const current = result.candidates[index];
      expect(Number(previous.verification.success)).toBeGreaterThanOrEqual(Number(current.verification.success));
      if (previous.verification.success === current.verification.success) {
        expect(previous.verification.score).toBeGreaterThanOrEqual(current.verification.score);
      }
    }
  });

  it('reports an honest no-clear shortlist instead of promoting a failed candidate', () => {
    const result = createBossChallengeRuntimeRepairEscalation(database, 'BOSS080', sourceTeamIds, 'NO_REACTIVE', firstRepairTeamIds);
    expect(result.clearCandidates).toBe(0);
    expect(result.candidates.every((candidate) => candidate.verification.status === 'FAILED')).toBe(true);
  });

  it('builds deterministic selected-candidate deltas and never defaults to a no-improvement option', () => {
    const current = verifyBossChallengeDraft(database, 'BOSS080', firstRepairTeamIds);
    const result = createBossChallengeRuntimeRepairEscalation(database, 'BOSS080', sourceTeamIds, 'NO_REACTIVE', firstRepairTeamIds);
    const previews = result.candidates.map((candidate) => createBossChallengeRuntimeRepairSelectionPreview(current, candidate));
    const selected = selectDefaultBossChallengeRuntimeRepairCandidate(current, result.candidates);
    const selectedPreview = selected && createBossChallengeRuntimeRepairSelectionPreview(current, selected);

    expect(previews.some((preview) => preview.verdict === 'IMPROVED_FAILED')).toBe(true);
    expect(previews.some((preview) => preview.verdict === 'NO_IMPROVEMENT')).toBe(true);
    expect(selectedPreview?.verdict).toBe('IMPROVED_FAILED');
    expect(selectedPreview).toMatchObject({
      currentTeamIds: firstRepairTeamIds,
      replacedCharacterId: 'CHR-MFG-128',
      scoreDelta: 1,
      roundDelta: 0,
      counterCount: 1,
      coveredStageCount: 6,
      remainingStructuralGaps: 0,
    });
    expect(createBossChallengeRuntimeRepairSelectionPreview(current, selected!)).toEqual(selectedPreview);
  });

  it('labels a runtime-clearing candidate as CLEAR', () => {
    const current = verifyBossChallengeDraft(database, 'BOSS015', sourceTeamIds);
    const result = createBossChallengeRuntimeRepairEscalation(database, 'BOSS015', sourceTeamIds, 'NO_REACTIVE');
    const clearCandidate = result.candidates.find((candidate) => candidate.verification.success);

    expect(clearCandidate).toBeDefined();
    expect(createBossChallengeRuntimeRepairSelectionPreview(current, clearCandidate!).verdict).toBe('CLEAR');
  });
});
