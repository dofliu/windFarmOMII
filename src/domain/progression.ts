// Career Track 與個人 Mastery 共用同一組五階門檻，避免兩套成長曲線日後漂移。
export const FIVE_LEVEL_XP_THRESHOLDS = [0, 100, 250, 500, 900] as const;

export type FiveLevel = 1 | 2 | 3 | 4 | 5;

export function fiveLevelForXp(xp: number): FiveLevel {
  const normalized = Math.max(0, Number.isFinite(xp) ? xp : 0);
  let level: FiveLevel = 1;
  FIVE_LEVEL_XP_THRESHOLDS.forEach((threshold, index) => {
    if (normalized >= threshold) level = (index + 1) as FiveLevel;
  });
  return level;
}
