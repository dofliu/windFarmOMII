// Debrief 六個分項 → 總分 → 等第，是任務結算與 Course Record 驗證的唯一公式來源。
// missionDebrief（runtime.ts）與 normalizeCourseScores（course.ts）都由此推導，
// 學生在 DevTools 改 total/grade 後重新載入或匯出，都會被重算回分項對應的值。

export const DEBRIEF_SCORE_WEIGHTS = {
  safety: 0.25,
  completion: 0.3,
  evidence: 0.15,
  time: 0.1,
  fatigue: 0.1,
  cost: 0.1,
} as const;

export type DebriefScoreComponent = keyof typeof DEBRIEF_SCORE_WEIGHTS;
export type DebriefGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export const DEBRIEF_SCORE_COMPONENTS = Object.keys(DEBRIEF_SCORE_WEIGHTS) as DebriefScoreComponent[];

export function debriefTotalScore(components: Record<DebriefScoreComponent, number>): number {
  return Math.round(DEBRIEF_SCORE_COMPONENTS.reduce((sum, key) => sum + components[key] * DEBRIEF_SCORE_WEIGHTS[key], 0));
}

export function debriefGrade(totalScore: number): DebriefGrade {
  return totalScore >= 90 ? 'S' : totalScore >= 80 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : 'D';
}
