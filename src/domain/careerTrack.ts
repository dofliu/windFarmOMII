import type { CampaignProgress } from './campaign';
import { FIVE_LEVEL_XP_THRESHOLDS, fiveLevelForXp, type FiveLevel } from './progression.ts';
import type { CharacterData } from './types';

export interface CareerTrackProgress {
  trackId: string;
  xp: number;
  level: FiveLevel;
  currentThreshold: number;
  nextThreshold: number | null;
  progress: number;
}

export interface CareerTrackRewardUpdate {
  trackId: string;
  beforeXp: number;
  afterXp: number;
  beforeLevel: FiveLevel;
  afterLevel: FiveLevel;
  newlyUnlockedCharacterIds: string[];
}

export function characterCareerLevel(character: CharacterData): FiveLevel {
  const parsed = Number(character.levelCode.replace(/^L/, ''));
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    throw new Error(`Invalid career level for ${character.id}: ${character.levelCode}`);
  }
  return parsed as FiveLevel;
}

export function careerTrackXp(
  progress: Pick<CampaignProgress, 'characterXp'>,
  characters: CharacterData[],
  trackId: string,
): number {
  return characters
    .filter((character) => character.trackId === trackId)
    .reduce((total, character) => total + Math.max(0, progress.characterXp[character.id] ?? 0), 0);
}

export function careerTrackProgress(
  progress: Pick<CampaignProgress, 'characterXp'>,
  characters: CharacterData[],
  trackId: string,
): CareerTrackProgress {
  const xp = careerTrackXp(progress, characters, trackId);
  const level = fiveLevelForXp(xp);
  const thresholds: readonly number[] = FIVE_LEVEL_XP_THRESHOLDS;
  const currentThreshold = thresholds[level - 1] ?? 0;
  const nextThreshold: number | null = level < 5 ? (thresholds[level] ?? null) : null;
  const range = nextThreshold === null ? 0 : nextThreshold - currentThreshold;
  return {
    trackId,
    xp,
    level,
    currentThreshold,
    nextThreshold,
    progress: nextThreshold === null ? 1 : Math.max(0, Math.min(1, (xp - currentThreshold) / Math.max(1, range))),
  };
}

export function isCareerCharacterUnlocked(
  progress: Pick<CampaignProgress, 'characterXp'>,
  characters: CharacterData[],
  character: CharacterData,
): boolean {
  return characterCareerLevel(character) <= careerTrackProgress(progress, characters, character.trackId).level;
}

export function unlockedCareerCharacters(
  progress: Pick<CampaignProgress, 'characterXp'>,
  characters: CharacterData[],
): CharacterData[] {
  const unlockedLevelByTrack = new Map<string, FiveLevel>();
  return characters.filter((character) => {
    let unlockedLevel = unlockedLevelByTrack.get(character.trackId);
    if (!unlockedLevel) {
      unlockedLevel = careerTrackProgress(progress, characters, character.trackId).level;
      unlockedLevelByTrack.set(character.trackId, unlockedLevel);
    }
    return characterCareerLevel(character) <= unlockedLevel;
  });
}

export function careerTrackRewardUpdates(
  before: Pick<CampaignProgress, 'characterXp'>,
  after: Pick<CampaignProgress, 'characterXp'>,
  characters: CharacterData[],
  deployedCharacterIds: string[],
): CareerTrackRewardUpdate[] {
  const characterById = new Map(characters.map((character) => [character.id, character]));
  const trackIds = [...new Set(deployedCharacterIds.map((id) => characterById.get(id)?.trackId).filter((id): id is string => Boolean(id)))];
  return trackIds.map((trackId) => {
    const beforeProgress = careerTrackProgress(before, characters, trackId);
    const afterProgress = careerTrackProgress(after, characters, trackId);
    return {
      trackId,
      beforeXp: beforeProgress.xp,
      afterXp: afterProgress.xp,
      beforeLevel: beforeProgress.level,
      afterLevel: afterProgress.level,
      newlyUnlockedCharacterIds: characters
        .filter((character) => character.trackId === trackId)
        .filter((character) => {
          const level = characterCareerLevel(character);
          return level > beforeProgress.level && level <= afterProgress.level;
        })
        .map((character) => character.id),
    };
  });
}

export function normalizeCampaignTeamIds(
  teamIds: readonly string[],
  progress: Pick<CampaignProgress, 'characterXp'>,
  characters: CharacterData[],
): [string, string, string] {
  const characterById = new Map(characters.map((character) => [character.id, character]));
  const available = unlockedCareerCharacters(progress, characters);
  if (available.length < 3) throw new Error('Campaign requires at least three unlocked career characters.');
  const availableIds = new Set(available.map((character) => character.id));
  const used = new Set<string>();
  const normalized: string[] = [];

  for (const requestedId of teamIds.slice(0, 3)) {
    const requested = characterById.get(requestedId);
    let replacement = available.find((character) => character.id === requestedId && !used.has(character.id));
    if (!replacement && requested) {
      // 被降階或匯入較舊進度時，優先保留原 Career Track，而不是隨機換職種。
      replacement = available
        .filter((character) => character.trackId === requested.trackId && !used.has(character.id))
        .sort((left, right) => characterCareerLevel(right) - characterCareerLevel(left))[0];
    }
    replacement ??= available.find((character) => !used.has(character.id));
    if (!replacement) throw new Error('Unable to normalize Campaign crew.');
    normalized.push(replacement.id);
    used.add(replacement.id);
  }

  while (normalized.length < 3) {
    const replacement = available.find((character) => !used.has(character.id));
    if (!replacement) throw new Error('Unable to fill Campaign crew.');
    normalized.push(replacement.id);
    used.add(replacement.id);
  }
  return normalized as [string, string, string];
}
