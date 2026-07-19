import { describe, expect, it } from 'vitest';
import charactersJson from '../../json/characters.json';
import equipmentJson from '../../json/equipment.json';
import missionsJson from '../../json/missions.json';
import vesselsJson from '../../json/vessels.json';
import { awardCampaignMission, createInitialCampaign, evaluateOperationReadiness, type CampaignProgress } from './campaign';
import {
  careerTrackProgress,
  careerTrackRewardUpdates,
  isCareerCharacterUnlocked,
  normalizeCampaignTeamIds,
  unlockedCareerCharacters,
} from './careerTrack';
import type { MissionDebrief } from './runtime';
import type { CharacterData, EquipmentData, MissionData, VesselData } from './types';

const characters = charactersJson as CharacterData[];
const equipment = equipmentJson as EquipmentData[];
const missions = missionsJson as MissionData[];
const vessels = vesselsJson as VesselData[];
const progress = (characterXp: Record<string, number> = {}): Pick<CampaignProgress, 'characterXp'> => ({ characterXp });

describe('Career Track progression', () => {
  it('新 Campaign 的 60 條 Track 各只開放 L1', () => {
    const unlocked = unlockedCareerCharacters(progress(), characters);
    expect(unlocked).toHaveLength(60);
    expect(new Set(unlocked.map((character) => character.trackId))).toHaveLength(60);
    expect(unlocked.every((character) => character.levelCode === 'L1')).toBe(true);
  });

  it('Track XP 會加總同 Track 五張卡，並在 100/250/500/900 精確解鎖下一階', () => {
    const cases = [
      [99, 1], [100, 2], [249, 2], [250, 3], [499, 3], [500, 4], [899, 4], [900, 5],
    ] as const;
    for (const [xp, level] of cases) {
      expect(careerTrackProgress(progress({ 'CHR-GOV-001': Math.floor(xp / 2), 'CHR-GOV-002': Math.ceil(xp / 2) }), characters, 'TRK001').level).toBe(level);
    }
    const atL2 = progress({ 'CHR-GOV-001': 75, 'CHR-GOV-002': 25 });
    expect(isCareerCharacterUnlocked(atL2, characters, characters.find((character) => character.id === 'CHR-GOV-001')!)).toBe(true);
    expect(isCareerCharacterUnlocked(atL2, characters, characters.find((character) => character.id === 'CHR-GOV-002')!)).toBe(true);
    expect(isCareerCharacterUnlocked(atL2, characters, characters.find((character) => character.id === 'CHR-GOV-003')!)).toBe(false);
  });

  it('任務跨越門檻時只回報真正新增的 Career cards', () => {
    const updates = careerTrackRewardUpdates(
      progress({ 'CHR-GOV-001': 95 }),
      progress({ 'CHR-GOV-001': 105 }),
      characters,
      ['CHR-GOV-001'],
    );
    expect(updates).toEqual([expect.objectContaining({
      trackId: 'TRK001', beforeLevel: 1, afterLevel: 2, newlyUnlockedCharacterIds: ['CHR-GOV-002'],
    })]);
  });

  it('降階或空白存檔會把鎖定席位換成同 Track 最高可用角色', () => {
    expect(normalizeCampaignTeamIds(
      ['CHR-GOV-005', 'CHR-MAR-180', 'CHR-OMI-223'],
      progress(),
      characters,
    )).toEqual(['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221']);
  });

  it('固定三名 L1 可沿 15 關累積 Mastery 並把三條 Track 推進到 L5', () => {
    const teamIds = ['CHR-GOV-001', 'CHR-MAR-176', 'CHR-OMI-221'];
    const team = teamIds.map((id) => characters.find((character) => character.id === id)!);
    const debrief: MissionDebrief = {
      totalScore: 80,
      grade: 'A',
      safetyScore: 80,
      completionScore: 100,
      evidenceScore: 80,
      timeScore: 70,
      fatigueScore: 80,
      costScore: 80,
    };
    let campaign = createInitialCampaign(missions, equipment);

    for (const mission of [...missions].sort((left, right) => left.order - right.order)) {
      const vessel = vessels.find((candidate) => candidate.id === mission.recommendedVesselId)!;
      expect(evaluateOperationReadiness(mission, team, campaign, vessel, { permit: true, ppe: true, access: true }).masteryReady).toBe(true);
      campaign = awardCampaignMission(
        campaign,
        mission,
        debrief,
        true,
        teamIds,
        missions,
        equipment,
        [mission.recommendedEquipmentId, mission.recommendedSpareId],
        characters,
        vessel,
        {},
      ).progress;
    }

    expect(team.map((character) => careerTrackProgress(campaign, characters, character.trackId).level)).toEqual([5, 5, 5]);
    expect(unlockedCareerCharacters(campaign, characters)).toHaveLength(72);
  });
});
