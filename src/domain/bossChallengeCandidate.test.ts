import { describe, expect, it } from 'vitest';
import bossesJson from '../../json/bosses.json';
import auditJson from '../../json/bossChallengeAudit.json';
import charactersJson from '../../json/characters.json';
import skillsJson from '../../json/skills.json';
import {
  challengeGapRepairTarget,
  createBossChallengeGapCandidatePreview,
  createBossChallengeRouteRepairPreview,
} from './bossChallengeCandidate';
import { createCrewSkillCapabilityProfile } from './crewCapability';
import type { BossChallengeAuditData, BossData, CharacterData, SkillData } from './types';

const bosses = bossesJson as BossData[];
const characters = charactersJson as CharacterData[];
const skills = skillsJson as SkillData[];
const audit = auditJson as BossChallengeAuditData;
const characterById = new Map(characters.map((character) => [character.id, character]));
const skillById = new Map(skills.map((skill) => [skill.id, skill]));
const team = (...ids: string[]) => ids.map((id) => characterById.get(id)!) as [CharacterData, CharacterData, CharacterData];

describe('Boss Challenge Strategy Gap Candidate Preview', () => {
  it('BOSS001 Reactive 缺口完整比較 60 名候選的三個替換席位', () => {
    const boss = bosses.find((item) => item.id === 'BOSS001')!;
    const preview = createBossChallengeGapCandidatePreview(
      boss,
      team('CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'),
      characters,
      skillById,
      'REACTIVE',
    );

    expect(preview).toMatchObject({ capability: 'REACTIVE', eligibleCandidateCount: 60, evaluatedSwapCount: 180 });
    expect(preview.before).toMatchObject({ reactive: 0, counter: 2, stage: 6, gaps: ['NO_REACTIVE'] });
    expect(preview.candidates).toHaveLength(3);
    expect(new Set(preview.candidates.map((candidate) => candidate.character.id)).size).toBe(3);
    expect(preview.candidates.every((candidate) => candidate.after.reactive > 0 && candidate.closesRequestedGap)).toBe(true);
    expect(preview.candidates.every((candidate) => new Set(candidate.teamIds).size === 3)).toBe(true);
  });

  it('相同輸入 deterministic，並優先保留 Stage／Counter 後才以 stable ID tie-break', () => {
    const boss = bosses.find((item) => item.id === 'BOSS001')!;
    const args = [
      boss,
      team('CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'),
      characters,
      skillById,
      'REACTIVE' as const,
    ] as const;
    const first = createBossChallengeGapCandidatePreview(...args);
    const second = createBossChallengeGapCandidatePreview(...args);

    expect(second.candidates.map((candidate) => [candidate.character.id, candidate.slotIndex, candidate.teamIds]))
      .toEqual(first.candidates.map((candidate) => [candidate.character.id, candidate.slotIndex, candidate.teamIds]));
    expect(first.candidates.map((candidate) => ({
      id: candidate.character.id,
      slot: candidate.slotIndex,
      counter: candidate.after.counter,
      stage: candidate.after.stage,
    }))).toEqual([
      { id: 'CHR-MAR-178', slot: 0, counter: 3, stage: 6 },
      { id: 'CHR-MAR-183', slot: 0, counter: 3, stage: 6 },
      { id: 'CHR-MAR-188', slot: 0, counter: 3, stage: 6 },
    ]);
  });

  it('300 人 roster 的三席比較維持互動時間，且不執行 runtime 成敗模擬', () => {
    const boss = bosses.find((item) => item.id === 'BOSS080')!;
    const noLowEnergyTeam = characters
      .filter((character) => createCrewSkillCapabilityProfile(character, skillById, 4).lowEnergyActions.length === 0)
      .slice(0, 3) as [CharacterData, CharacterData, CharacterData];
    expect(noLowEnergyTeam).toHaveLength(3);
    const startedAt = performance.now();
    const preview = createBossChallengeGapCandidatePreview(
      boss,
      noLowEnergyTeam,
      characters,
      skillById,
      'LOW_ENERGY',
    );
    const elapsed = performance.now() - startedAt;

    expect(preview.eligibleCandidateCount).toBeGreaterThan(0);
    expect(preview.evaluatedSwapCount).toBe(preview.eligibleCandidateCount * 3);
    expect(preview.candidates.every((candidate) => candidate.requestedDelta > 0)).toBe(true);
    expect(elapsed).toBeLessThan(500);
  });

  it('四種 Strategy gap 固定路由到對應 repair target', () => {
    expect(challengeGapRepairTarget('NO_REACTIVE')).toBe('REACTIVE');
    expect(challengeGapRepairTarget('NO_TEAM_RECOVERY')).toBe('TEAM_RECOVERY');
    expect(challengeGapRepairTarget('NO_LOW_ENERGY_ACTION')).toBe('LOW_ENERGY');
    expect(challengeGapRepairTarget('STAGE_GAP')).toBe('STAGE_COVERAGE');
  });

  it('Stage-only 缺口會完整比較 297 人×三席並優先補成 6/6', () => {
    const boss = bosses.find((item) => item.id === 'BOSS001')!;
    const preview = createBossChallengeRouteRepairPreview(
      boss,
      team('CHR-MAR-178', 'CHR-MAR-183', 'CHR-MAR-188'),
      characters,
      skillById,
    );

    expect(preview).toMatchObject({
      gap: 'STAGE_GAP',
      target: 'STAGE_COVERAGE',
      eligibleCandidateCount: 297,
      evaluatedSwapCount: 891,
      before: { stage: 3, gaps: ['STAGE_GAP'] },
    });
    expect(preview?.candidate?.after.stage).toBe(6);
    expect(preview?.candidate?.closesRequestedGap).toBe(true);
  });

  it('100 Boss audit drafts 都產生 deterministic top repair，且不改寫 runtime audit 證據', () => {
    const first = audit.items.map((item) => {
      const boss = bosses.find((candidate) => candidate.id === item.bossId)!;
      const preview = createBossChallengeRouteRepairPreview(
        boss,
        team(...item.recommendedTeamIds),
        characters,
        skillById,
      );
      expect(item.success).toBe(true);
      expect(preview?.gap).toBe('NO_REACTIVE');
      expect(preview?.target).toBe('REACTIVE');
      expect(preview?.candidate?.closesRequestedGap).toBe(true);
      return [item.bossId, preview?.candidate?.character.id, preview?.candidate?.slotIndex, preview?.candidate?.teamIds] as const;
    });
    const second = audit.items.map((item) => {
      const boss = bosses.find((candidate) => candidate.id === item.bossId)!;
      const preview = createBossChallengeRouteRepairPreview(boss, team(...item.recommendedTeamIds), characters, skillById);
      return [item.bossId, preview?.candidate?.character.id, preview?.candidate?.slotIndex, preview?.candidate?.teamIds] as const;
    });

    expect(first).toHaveLength(100);
    expect(second).toEqual(first);
  });
});
