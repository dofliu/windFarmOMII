import { describe, expect, it } from 'vitest';
import charactersJson from '../../json/characters.json';
import skillsJson from '../../json/skills.json';
import { createBossChallengeCampaignProjection } from './bossChallenge';
import { createCrewSkillCapabilityProfile } from './crewCapability';
import { filterCrewRoster, type CrewRosterFilters } from './crewRotation';
import { createInitialCampaign } from './campaign';
import type { CharacterData, SkillData } from './types';

const characters = charactersJson as CharacterData[];
const skills = skillsJson as SkillData[];
const skillById = new Map(skills.map((skill) => [skill.id, skill]));
const baseFilters: CrewRosterFilters = {
  query: '',
  factionCode: 'ALL',
  readiness: 'ALL',
  minimumMastery: 0,
  capability: 'ALL',
};

describe('Crew Skill Capability filter', () => {
  it('300 名角色皆以四個正式技能 stable IDs 派生 capability', () => {
    expect(characters).toHaveLength(300);
    const profiles = characters.map((character) => createCrewSkillCapabilityProfile(character, skillById, 4));
    expect(profiles.every((profile) => profile.skills.length === 4)).toBe(true);
    expect(profiles.reduce((sum, profile) => sum + profile.reactiveSkills.length, 0)).toBeGreaterThan(0);
    expect(profiles.reduce((sum, profile) => sum + profile.teamRecoverySkills.length, 0)).toBeGreaterThan(0);
    expect(profiles.reduce((sum, profile) => sum + profile.lowEnergyActions.length, 0)).toBeGreaterThan(0);
  });

  it('Challenge 固定 M3 可 deterministic 篩選 Reactive／全隊恢復／低 Energy 一般技能', () => {
    const campaign = createBossChallengeCampaignProjection(createInitialCampaign([], []), characters);
    const select = (capability: CrewRosterFilters['capability']) => filterCrewRoster(
      characters,
      campaign,
      { ...baseFilters, capability },
      skillById,
    ).map((character) => character.id);
    const reactive = select('REACTIVE');
    const teamRecovery = select('TEAM_RECOVERY');
    const lowEnergy = select('LOW_ENERGY');

    expect(reactive).toEqual([...reactive].sort());
    expect(teamRecovery).toEqual([...teamRecovery].sort());
    expect(lowEnergy).toEqual([...lowEnergy].sort());
    expect(new Set(reactive).size).toBe(reactive.length);
    expect([reactive.length, teamRecovery.length, lowEnergy.length]).toEqual([60, 300, 240]);
  });

  it('Campaign 只計入當前 Mastery 已解鎖的技能槽', () => {
    const character = characters.find((item) => {
      const l1 = createCrewSkillCapabilityProfile(item, skillById, 2);
      const l3 = createCrewSkillCapabilityProfile(item, skillById, 4);
      return l1.teamRecoverySkills.length === 0 && l3.teamRecoverySkills.length > 0;
    });
    expect(character).toBeDefined();
    const campaign = createInitialCampaign([], []);
    const l1Result = filterCrewRoster([character!], campaign, { ...baseFilters, capability: 'TEAM_RECOVERY' }, skillById);
    const l3Result = filterCrewRoster(
      [character!],
      { ...campaign, characterXp: { [character!.id]: 250 } },
      { ...baseFilters, capability: 'TEAM_RECOVERY' },
      skillById,
    );
    expect(l1Result).toEqual([]);
    expect(l3Result.map((item) => item.id)).toEqual([character!.id]);
  });
});
