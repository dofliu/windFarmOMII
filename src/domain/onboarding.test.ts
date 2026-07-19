import { afterEach, describe, expect, it, vi } from 'vitest';
import { CAMPAIGN_STORAGE_KEY } from './campaign';
import {
  ONBOARDING_STEPS,
  ONBOARDING_STORAGE_KEY,
  advanceOnboarding,
  completeOnboarding,
  createInitialOnboarding,
  currentOnboardingStep,
  loadOnboardingProgress,
  normalizeOnboardingProgress,
  restartOnboarding,
  resumeOnboardingAtDeployment,
  saveOnboardingProgress,
  skipOnboarding,
} from './onboarding';

afterEach(() => vi.unstubAllGlobals());

describe('First-play onboarding state machine', () => {
  it('使用獨立 storage key，首次進入從部署開始', () => {
    const progress = createInitialOnboarding();
    expect(ONBOARDING_STORAGE_KEY).not.toBe(CAMPAIGN_STORAGE_KEY);
    expect(ONBOARDING_STEPS).toEqual(['DEPLOYMENT', 'EVENT_DECK', 'REACTIVE_WINDOW', 'DIAGNOSIS_GATE', 'DEBRIEF']);
    expect(progress).toEqual({ schemaVersion: 1, status: 'active', stepIndex: 0 });
    expect(currentOnboardingStep(progress)).toBe('DEPLOYMENT');
  });

  it('只接受 schema v1 與合法狀態，並限制 stepIndex 邊界', () => {
    expect(normalizeOnboardingProgress({ schemaVersion: 2, status: 'completed', stepIndex: 4 })).toEqual(createInitialOnboarding());
    expect(normalizeOnboardingProgress({ schemaVersion: 1, status: 'unknown', stepIndex: 3 })).toEqual(createInitialOnboarding());
    expect(normalizeOnboardingProgress({ schemaVersion: 1, status: 'active', stepIndex: 99 }).stepIndex).toBe(4);
    expect(normalizeOnboardingProgress({ schemaVersion: 1, status: 'active', stepIndex: -2 }).stepIndex).toBe(0);
  });

  it('能依序推進、完成、跳過與重播', () => {
    let progress = createInitialOnboarding();
    for (let index = 1; index < ONBOARDING_STEPS.length; index += 1) progress = advanceOnboarding(progress);
    expect(currentOnboardingStep(progress)).toBe('DEBRIEF');
    expect(completeOnboarding(progress).status).toBe('completed');
    expect(advanceOnboarding(completeOnboarding(progress))).toEqual(completeOnboarding(progress));
    expect(skipOnboarding(progress).status).toBe('skipped');
    expect(restartOnboarding()).toEqual(createInitialOnboarding());
  });

  it('reload 遺失 mission session 時退回 event deck，不影響已完成或已跳過狀態', () => {
    const activeBattle = { ...createInitialOnboarding(), stepIndex: 3 };
    expect(resumeOnboardingAtDeployment(activeBattle)).toEqual({ ...activeBattle, stepIndex: 1 });
    expect(resumeOnboardingAtDeployment(completeOnboarding(activeBattle)).status).toBe('completed');
    expect(resumeOnboardingAtDeployment(skipOnboarding(activeBattle)).status).toBe('skipped');
  });

  it('可由獨立 localStorage 完整保存與還原', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
    const progress = { ...createInitialOnboarding(), stepIndex: 2 };
    saveOnboardingProgress(progress);
    expect(values.has(CAMPAIGN_STORAGE_KEY)).toBe(false);
    expect(loadOnboardingProgress()).toEqual(progress);
  });
});
