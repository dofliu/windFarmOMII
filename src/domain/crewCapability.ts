import { characterSkillIds } from './data';
import type { CharacterData, SkillData } from './types';

export type CrewSkillCapability = 'ALL' | 'REACTIVE' | 'TEAM_RECOVERY' | 'LOW_ENERGY';

export interface CrewSkillCapabilityProfile {
  skills: SkillData[];
  reactiveSkills: SkillData[];
  teamRecoverySkills: SkillData[];
  lowEnergyActions: SkillData[];
}

export function createCrewSkillCapabilityProfile(
  character: CharacterData,
  skillById: Map<string, SkillData>,
  unlockedSkillSlots = 4,
): CrewSkillCapabilityProfile {
  const skillIds = characterSkillIds(character).slice(0, Math.max(0, Math.min(4, unlockedSkillSlots)));
  const skills = skillIds.map((skillId) => {
    const skill = skillById.get(skillId);
    if (!skill) throw new Error(`${character.id} Skill Capability 找不到技能：${skillId}`);
    return skill;
  });
  return {
    skills,
    reactiveSkills: skills.filter((skill) => skill.type === 'Reactive'),
    // 與正式 runtime/Strategy 判定共用 target 與 fatigueDelta，避免 UI 自創「恢復」定義。
    teamRecoverySkills: skills.filter((skill) => /Allies|All units/i.test(skill.target) && skill.fatigueDelta < 0),
    // Reactive 只能用於 branch window，因此不列入一般回合的低 Energy 行動。
    lowEnergyActions: skills.filter((skill) => skill.type !== 'Passive' && skill.type !== 'Reactive' && skill.energyCost <= 4),
  };
}

export function characterHasCrewSkillCapability(
  character: CharacterData,
  skillById: Map<string, SkillData>,
  capability: CrewSkillCapability,
  unlockedSkillSlots = 4,
): boolean {
  if (capability === 'ALL') return true;
  const profile = createCrewSkillCapabilityProfile(character, skillById, unlockedSkillSlots);
  if (capability === 'REACTIVE') return profile.reactiveSkills.length > 0;
  if (capability === 'TEAM_RECOVERY') return profile.teamRecoverySkills.length > 0;
  return profile.lowEnergyActions.length > 0;
}
