export const ONBOARDING_STORAGE_KEY = 'owm.onboarding.v1';

export const ONBOARDING_STEPS = [
  'DEPLOYMENT',
  'EVENT_DECK',
  'REACTIVE_WINDOW',
  'DIAGNOSIS_GATE',
  'DEBRIEF',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
export type OnboardingStatus = 'active' | 'completed' | 'skipped';

export interface OnboardingProgress {
  schemaVersion: 1;
  status: OnboardingStatus;
  stepIndex: number;
}

export function createInitialOnboarding(): OnboardingProgress {
  return { schemaVersion: 1, status: 'active', stepIndex: 0 };
}

export function normalizeOnboardingProgress(value: unknown): OnboardingProgress {
  const initial = createInitialOnboarding();
  if (!value || typeof value !== 'object') return initial;
  const candidate = value as Partial<OnboardingProgress>;
  if (candidate.schemaVersion !== 1) return initial;
  if (candidate.status !== 'active' && candidate.status !== 'completed' && candidate.status !== 'skipped') return initial;

  const rawIndex = typeof candidate.stepIndex === 'number' && Number.isFinite(candidate.stepIndex)
    ? Math.floor(candidate.stepIndex)
    : 0;
  return {
    schemaVersion: 1,
    status: candidate.status,
    stepIndex: Math.max(0, Math.min(ONBOARDING_STEPS.length - 1, rawIndex)),
  };
}

export function currentOnboardingStep(progress: OnboardingProgress): OnboardingStep {
  return ONBOARDING_STEPS[progress.stepIndex] ?? ONBOARDING_STEPS[0];
}

export function advanceOnboarding(progress: OnboardingProgress): OnboardingProgress {
  if (progress.status !== 'active') return progress;
  const nextIndex = Math.min(ONBOARDING_STEPS.length - 1, progress.stepIndex + 1);
  return { ...progress, stepIndex: nextIndex };
}

export function completeOnboarding(progress: OnboardingProgress): OnboardingProgress {
  return { ...progress, status: 'completed', stepIndex: ONBOARDING_STEPS.length - 1 };
}

export function skipOnboarding(progress: OnboardingProgress): OnboardingProgress {
  return { ...progress, status: 'skipped' };
}

export function restartOnboarding(): OnboardingProgress {
  return createInitialOnboarding();
}

export function resumeOnboardingAtDeployment(progress: OnboardingProgress): OnboardingProgress {
  if (progress.status !== 'active' || progress.stepIndex <= 1) return progress;
  // 任務 session 不做持久化；reload 後退回 event deck，避免導覽停在不存在的戰鬥畫面。
  return { ...progress, stepIndex: 1 };
}

export function loadOnboardingProgress(): OnboardingProgress {
  if (typeof localStorage === 'undefined') return createInitialOnboarding();
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    return normalizeOnboardingProgress(raw ? JSON.parse(raw) : null);
  } catch {
    return createInitialOnboarding();
  }
}

export function saveOnboardingProgress(progress: OnboardingProgress): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(progress));
}
