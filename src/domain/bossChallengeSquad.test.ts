import { describe, expect, it } from 'vitest';
import auditJson from '../../json/bossChallengeAudit.json';
import bossesJson from '../../json/bosses.json';
import charactersJson from '../../json/characters.json';
import { compareBossChallengeSquads, createBossChallengeSquadRecommendation } from './bossChallengeSquad';
import type { BossChallengeAuditData, BossData, CharacterData } from './types';

const audit = auditJson as BossChallengeAuditData;
const bosses = bossesJson as BossData[];
const characters = charactersJson as CharacterData[];
const auditByBossId = new Map(audit.items.map((item) => [item.bossId, item]));

describe('Boss Challenge Squad Advisor', () => {
  it('100 Boss 都提供三名唯一角色、六階段完整涵蓋與至少兩名 counter', () => {
    for (const boss of bosses) {
      const recommendation = createBossChallengeSquadRecommendation(boss, auditByBossId.get(boss.id)!, characters);
      expect(new Set(recommendation.teamIds).size).toBe(3);
      expect(recommendation.coveredStageCount).toBe(6);
      expect(recommendation.counterCount).toBeGreaterThanOrEqual(2);
      expect(recommendation.auditScore).toBeGreaterThan(0);
    }
  });

  it('相同 snapshot 產生相同 stable IDs，且拒絕錯置 Boss', () => {
    const boss = bosses.find((item) => item.id === 'BOSS080')!;
    const auditItem = auditByBossId.get(boss.id)!;
    const first = createBossChallengeSquadRecommendation(boss, auditItem, characters);
    const second = createBossChallengeSquadRecommendation(boss, auditItem, characters);
    expect(second.teamIds).toEqual(first.teamIds);
    expect(first).toMatchObject({ coveredStageCount: 6, counterCount: 2, auditScore: 58, auditRound: 8 });
    expect(() => createBossChallengeSquadRecommendation(bosses[0], auditItem, characters)).toThrow(/沒有可套用/);
  });

  it('比較目前隊伍與 audit 隊伍，並在換人後 deterministic 更新差異', () => {
    const boss = bosses.find((item) => item.id === 'BOSS001')!;
    const recommendation = createBossChallengeSquadRecommendation(boss, auditByBossId.get(boss.id)!, characters);
    const characterById = new Map(characters.map((character) => [character.id, character]));
    const initialMembers = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'].map((id) => characterById.get(id)!) as [CharacterData, CharacterData, CharacterData];
    const initial = compareBossChallengeSquads(boss, initialMembers, recommendation);
    expect(initial).toMatchObject({
      sharedMemberCount: 0,
      sameMembers: false,
      exactOrder: false,
      counterDelta: 1,
      coveredStageDelta: 0,
    });
    expect(initial.current).toMatchObject({ counterCount: 2, coveredStageCount: 6, uniqueMemberCount: 3 });
    expect(initial.audit).toMatchObject({ counterCount: 3, coveredStageCount: 6, uniqueMemberCount: 3 });

    const applied = compareBossChallengeSquads(boss, recommendation.members, recommendation);
    expect(applied).toMatchObject({ sharedMemberCount: 3, sameMembers: true, exactOrder: true, counterDelta: 0, coveredStageDelta: 0 });
    expect(applied.auditMemberPresent).toEqual([true, true, true]);
    expect(Object.values(applied.stageCoverageDelta).every((delta) => delta === 0)).toBe(true);
  });

  it('相同成員換位視為 composition 相同，但仍可恢復 audit 順序', () => {
    const boss = bosses.find((item) => item.id === 'BOSS080')!;
    const recommendation = createBossChallengeSquadRecommendation(boss, auditByBossId.get(boss.id)!, characters);
    const reordered = [recommendation.members[1], recommendation.members[0], recommendation.members[2]] as [CharacterData, CharacterData, CharacterData];
    const comparison = compareBossChallengeSquads(boss, reordered, recommendation);
    expect(comparison).toMatchObject({ sharedMemberCount: 3, sameMembers: true, exactOrder: false, counterDelta: 0, coveredStageDelta: 0 });
  });
});
