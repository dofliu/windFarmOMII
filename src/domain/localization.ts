import type { BossData, CharacterData, Language, SkillData } from './types';

export function characterName(character: CharacterData, language: Language): string {
  return language === 'en' ? character.nameEn : character.nameZh;
}

export function professionName(character: CharacterData, language: Language): string {
  return language === 'en' ? character.professionEn : character.professionZh;
}

export function skillName(skill: SkillData, language: Language): string {
  return language === 'en' ? skill.nameEn : skill.nameZh;
}

export function bossName(boss: BossData, language: Language): string {
  return language === 'en' ? boss.nameEn : boss.nameZh;
}
