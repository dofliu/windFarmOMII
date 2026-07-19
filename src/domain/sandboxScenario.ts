import type { MissionState } from './runtime';
import type { VesselData } from './types';

export type SandboxScenarioPreset = 'CALM' | 'STANDARD' | 'STORM' | 'EXTREME';

export interface SandboxScenarioConfig {
  seaState: number;
  weatherWindow: number;
  safety: number;
  evidence: number;
  roundLimit: number;
}

export interface SandboxSeaStateModifier {
  weatherProtection: number;
  safetyProtection: number;
  fatigueRelief: number;
}

export const SANDBOX_SCENARIO_LIMITS = {
  seaState: { min: 1, max: 6 },
  weatherWindow: { min: 20, max: 100 },
  safety: { min: 20, max: 100 },
  evidence: { min: 0, max: 60 },
  roundLimit: { min: 6, max: 20 },
} as const;

export const SANDBOX_SCENARIO_PRESETS: Record<SandboxScenarioPreset, SandboxScenarioConfig> = {
  CALM: { seaState: 1, weatherWindow: 100, safety: 100, evidence: 25, roundLimit: 16 },
  STANDARD: { seaState: 3, weatherWindow: 100, safety: 100, evidence: 0, roundLimit: 12 },
  STORM: { seaState: 5, weatherWindow: 55, safety: 65, evidence: 0, roundLimit: 9 },
  EXTREME: { seaState: 6, weatherWindow: 35, safety: 45, evidence: 0, roundLimit: 7 },
};

export const DEFAULT_SANDBOX_SCENARIO = SANDBOX_SCENARIO_PRESETS.STANDARD;

const SEA_STATE_MODIFIERS: Record<number, SandboxSeaStateModifier> = {
  1: { weatherProtection: 2, safetyProtection: 1, fatigueRelief: 1 },
  2: { weatherProtection: 1, safetyProtection: 0, fatigueRelief: 0 },
  3: { weatherProtection: 0, safetyProtection: 0, fatigueRelief: 0 },
  4: { weatherProtection: -1, safetyProtection: 0, fatigueRelief: 0 },
  5: { weatherProtection: -2, safetyProtection: -1, fatigueRelief: -1 },
  6: { weatherProtection: -3, safetyProtection: -2, fatigueRelief: -1 },
};

export function normalizeSandboxScenario(input?: Partial<SandboxScenarioConfig>): SandboxScenarioConfig {
  return {
    seaState: boundedInteger(input?.seaState, DEFAULT_SANDBOX_SCENARIO.seaState, SANDBOX_SCENARIO_LIMITS.seaState),
    weatherWindow: boundedInteger(input?.weatherWindow, DEFAULT_SANDBOX_SCENARIO.weatherWindow, SANDBOX_SCENARIO_LIMITS.weatherWindow),
    safety: boundedInteger(input?.safety, DEFAULT_SANDBOX_SCENARIO.safety, SANDBOX_SCENARIO_LIMITS.safety),
    evidence: boundedInteger(input?.evidence, DEFAULT_SANDBOX_SCENARIO.evidence, SANDBOX_SCENARIO_LIMITS.evidence),
    roundLimit: boundedInteger(input?.roundLimit, DEFAULT_SANDBOX_SCENARIO.roundLimit, SANDBOX_SCENARIO_LIMITS.roundLimit),
  };
}

export function applySandboxScenario(mission: MissionState, input?: Partial<SandboxScenarioConfig>): MissionState {
  const scenario = normalizeSandboxScenario(input);
  return {
    ...mission,
    weatherWindow: scenario.weatherWindow,
    safety: scenario.safety,
    evidence: scenario.evidence,
    roundLimit: scenario.roundLimit,
  };
}

export function sandboxSeaStateModifier(seaState: number): SandboxSeaStateModifier {
  const normalized = boundedInteger(seaState, DEFAULT_SANDBOX_SCENARIO.seaState, SANDBOX_SCENARIO_LIMITS.seaState);
  return SEA_STATE_MODIFIERS[normalized];
}

export function sandboxVesselProjection(vessel: VesselData, seaState: number): VesselData {
  const modifier = sandboxSeaStateModifier(seaState);
  // Sandbox 只投影單次 session 的海況壓力，不修改 vessels.json 或 Campaign 規則。
  return {
    ...vessel,
    weatherProtection: Math.max(0, vessel.weatherProtection + modifier.weatherProtection),
    safetyProtection: Math.max(0, vessel.safetyProtection + modifier.safetyProtection),
    fatigueRelief: Math.max(0, vessel.fatigueRelief + modifier.fatigueRelief),
  };
}

export function sandboxScenarioPreset(input: SandboxScenarioPreset): SandboxScenarioConfig {
  return { ...SANDBOX_SCENARIO_PRESETS[input] };
}

function boundedInteger(
  value: number | undefined,
  fallback: number,
  limits: { readonly min: number; readonly max: number },
): number {
  const candidate = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(limits.max, Math.max(limits.min, candidate));
}
