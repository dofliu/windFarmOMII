import { describe, expect, it } from 'vitest';
import bossesJson from '../../json/bosses.json';
import charactersJson from '../../json/characters.json';
import skillsJson from '../../json/skills.json';
import { createBossChallengeStrategyBriefing } from './bossChallengeStrategy';
import { BOSS_CLASS_RULES, BOSS_CLASS_TELEGRAPHS } from './runtime';
import type { BossData, CharacterData, SkillData } from './types';

const bosses = bossesJson as BossData[];
const characters = charactersJson as CharacterData[];
const skills = skillsJson as SkillData[];
const characterById = new Map(characters.map((character) => [character.id, character]));
const skillById = new Map(skills.map((skill) => [skill.id, skill]));
const team = (...ids: string[]) => ids.map((id) => characterById.get(id)!) as [CharacterData, CharacterData, CharacterData];

describe('Boss Challenge Strategy Briefing', () => {
  it('14 種 class 都直接映射正式 rule/telegraph 與 R01/R04/R07 branch schedule', () => {
    const representativeByClass = new Map(bosses.map((boss) => [boss.class, boss]));
    expect(representativeByClass.size).toBe(14);
    for (const [classCode, boss] of representativeByClass) {
      const briefing = createBossChallengeStrategyBriefing(boss, team('CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'), skillById);
      expect(briefing.rule).toEqual(BOSS_CLASS_RULES[classCode]);
      expect(briefing.telegraph).toEqual(BOSS_CLASS_TELEGRAPHS[classCode]);
      expect(briefing.classImpacts.map((impact) => impact.resource)).toEqual(briefing.telegraph.impacts);
      expect(briefing.classImpacts.every((impact) => impact.magnitude > 0)).toBe(true);
      expect(briefing.branchSchedule.map((branch) => branch.round)).toEqual([1, 4, 7]);
      expect(briefing.branchSchedule.every((branch) => branch.impacts.length > 0)).toBe(true);
    }
  });

  it('BOSS001 初始隊伍顯示正式 WEA 壓力、完整 coverage 與 Reactive 缺口', () => {
    const boss = bosses.find((item) => item.id === 'BOSS001')!;
    const briefing = createBossChallengeStrategyBriefing(boss, team('CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'), skillById);
    expect(briefing.classImpacts).toEqual([{ resource: 'weather', magnitude: 4 }]);
    expect(briefing).toMatchObject({ counterCount: 2, coveredStageCount: 6 });
    expect(briefing.skillTypeCounts).toEqual({ Passive: 6, Active: 6, Reactive: 0, Support: 0, Ultimate: 0 });
    expect(briefing.lowEnergyActions).toHaveLength(3);
    expect(briefing.gaps).toEqual(['NO_REACTIVE']);
  });

  it('Reactive／全隊恢復與低 Energy 選項皆從目前三名角色技能即時派生', () => {
    const boss = bosses.find((item) => item.id === 'BOSS080')!;
    const briefing = createBossChallengeStrategyBriefing(boss, team('CHR-GOV-003', 'CHR-MAR-176', 'CHR-OMI-221'), skillById);
    expect(briefing.classImpacts).toEqual([{ resource: 'safety', magnitude: 2 }, { resource: 'energy', magnitude: 2 }]);
    expect(briefing.reactiveOptions).toHaveLength(1);
    expect(briefing.teamRecoveryOptions).toHaveLength(4);
    expect(briefing.lowEnergyActions).toHaveLength(2);
    expect(briefing.coveredStageCount).toBe(6);
    expect(briefing.gaps).toEqual([]);
  });
});
