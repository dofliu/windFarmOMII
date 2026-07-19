import { describe, expect, it } from 'vitest';
import { characterSkillIds } from './data';
import type { CharacterData } from './types';

describe('Data contract', () => {
  it('角色固定提供四個技能槽', () => {
    const character = {
      passiveSkillId: 'SK1', skill1Id: 'SK2', skill2Id: 'SK3', ultimateSkillId: 'SK4',
    } as CharacterData;
    expect(characterSkillIds(character)).toEqual(['SK1', 'SK2', 'SK3', 'SK4']);
  });
});
