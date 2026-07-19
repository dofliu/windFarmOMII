import type { MissionData, TurbineData } from './types';
import type { MissionState } from './runtime';

export type TurbineAvailability = 'AVAILABLE' | 'DEGRADED' | 'OFFLINE';

export interface TurbineOperationalState {
  turbineId: string;
  reliability: number;
  availability: TurbineAvailability;
  openFaults: number;
  completedMissions: number;
  failedMissions: number;
  maintenanceActions: number;
  lastMissionId?: string;
}

export type WindFarmState = Record<string, TurbineOperationalState>;

export interface TurbineMissionUpdate {
  turbineId: string;
  completed: boolean;
  reliabilityDelta: number;
  backlogDelta: number;
  before: TurbineOperationalState;
  after: TurbineOperationalState;
}

export interface WindFarmSummary {
  available: number;
  degraded: number;
  offline: number;
  averageReliability: number;
  totalBacklog: number;
}

export type TurbineMaintenancePriority = 'NORMAL' | 'HIGH' | 'CRITICAL';

export interface TurbineMaintenanceQuote {
  turbineId: string;
  priority: TurbineMaintenancePriority;
  cost: number;
  availableCredits: number;
  canMaintain: boolean;
  canAfford: boolean;
  reliabilityGain: number;
  beforeReliability: number;
  afterReliability: number;
  beforeBacklog: number;
  afterBacklog: number;
  beforeAvailability: TurbineAvailability;
  afterAvailability: TurbineAvailability;
}

export interface TurbineMaintenanceSettlement {
  turbineId: string;
  quote: TurbineMaintenanceQuote;
  beforeCredits: number;
  afterCredits: number;
  before: TurbineOperationalState;
  after: TurbineOperationalState;
}

export type FleetDispatchBudgetStatus = 'READY' | 'INSUFFICIENT' | 'NO_BACKLOG';

export interface FleetDispatchPriorityItem {
  rank: number;
  turbineId: string;
  impactScore: number;
  budgetStatus: FleetDispatchBudgetStatus;
  quote: TurbineMaintenanceQuote;
  projectedSummary: WindFarmSummary;
}

export interface FleetDispatchPriority {
  availableCredits: number;
  actionableCount: number;
  affordableCount: number;
  currentSummary: WindFarmSummary;
  items: FleetDispatchPriorityItem[];
}

export type FleetMaintenancePlanIssue = 'EMPTY_PLAN' | 'UNKNOWN_TURBINE' | 'NO_BACKLOG' | 'INSUFFICIENT_MNT';

export interface FleetMaintenancePlanStep {
  order: number;
  turbineId: string;
  quote: TurbineMaintenanceQuote;
  beforeCredits: number;
  afterCredits: number;
  beforeSummary: WindFarmSummary;
  afterSummary: WindFarmSummary;
  before: TurbineOperationalState;
  after: TurbineOperationalState;
}

export interface FleetMaintenancePlanQuote {
  turbineIds: string[];
  steps: FleetMaintenancePlanStep[];
  initialCredits: number;
  afterCredits: number;
  totalCost: number;
  beforeSummary: WindFarmSummary;
  afterSummary: WindFarmSummary;
  canConfirm: boolean;
  issue?: FleetMaintenancePlanIssue;
  issueTurbineId?: string;
}

export interface FleetMaintenancePlanSettlement {
  quote: FleetMaintenancePlanQuote;
  beforeCredits: number;
  afterCredits: number;
  totalCost: number;
  turbineIds: string[];
  steps: FleetMaintenancePlanStep[];
  beforeSummary: WindFarmSummary;
  afterSummary: WindFarmSummary;
}

export type FleetConditionPressure = 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface FleetConditionDispatchModifier {
  turbineId: string;
  pressure: FleetConditionPressure;
  availability: TurbineAvailability;
  sourceReliability: number;
  openFaults: number;
  mobilizationCostDelta: number;
  safetyPenalty: number;
  reliabilityPenalty: number;
}

export interface FleetConditionDispatchProjection {
  modifier: FleetConditionDispatchModifier;
  mobilizationCostBefore: number;
  mobilizationCostAfter: number;
  safetyBefore: number;
  safetyAfter: number;
  reliabilityBefore: number;
  reliabilityAfter: number;
}

export function turbineAvailability(reliability: number, openFaults: number): TurbineAvailability {
  if (reliability < 40 || openFaults >= 4) return 'OFFLINE';
  if (reliability < 80 || openFaults > 0) return 'DEGRADED';
  return 'AVAILABLE';
}

export function createInitialWindFarm(turbines: TurbineData[]): WindFarmState {
  return Object.fromEntries(turbines.map((turbine) => {
    const reliability = clampInteger(turbine.initialReliability, 0, 100);
    const openFaults = clampInteger(turbine.initialOpenFaults, 0, 9);
    return [turbine.id, {
      turbineId: turbine.id,
      reliability,
      availability: turbineAvailability(reliability, openFaults),
      openFaults,
      completedMissions: 0,
      failedMissions: 0,
      maintenanceActions: 0,
    } satisfies TurbineOperationalState];
  }));
}

export function normalizeWindFarmState(value: unknown, turbines: TurbineData[]): WindFarmState {
  const initial = createInitialWindFarm(turbines);
  if (!value || typeof value !== 'object') return initial;
  const candidate = value as Record<string, unknown>;

  return Object.fromEntries(turbines.map((turbine) => {
    const fallback = initial[turbine.id];
    const saved = candidate[turbine.id];
    if (!saved || typeof saved !== 'object') return [turbine.id, fallback];
    const record = saved as Partial<TurbineOperationalState>;
    const reliability = validInteger(record.reliability, fallback.reliability, 0, 100);
    const openFaults = validInteger(record.openFaults, fallback.openFaults, 0, 9);
    const normalized: TurbineOperationalState = {
      turbineId: turbine.id,
      reliability,
      availability: turbineAvailability(reliability, openFaults),
      openFaults,
      completedMissions: validInteger(record.completedMissions, 0, 0, Number.MAX_SAFE_INTEGER),
      failedMissions: validInteger(record.failedMissions, 0, 0, Number.MAX_SAFE_INTEGER),
      maintenanceActions: validInteger(record.maintenanceActions, 0, 0, Number.MAX_SAFE_INTEGER),
      ...(typeof record.lastMissionId === 'string' ? { lastMissionId: record.lastMissionId } : {}),
    };
    return [turbine.id, normalized];
  }));
}

export function settleWindFarmMission(
  state: WindFarmState,
  mission: MissionData,
  completed: boolean,
  score: number,
): { state: WindFarmState; update?: TurbineMissionUpdate } {
  const before = state[mission.turbineId];
  if (!before) return { state };

  const reliabilityDelta = completed
    ? 4 + clampInteger(Math.ceil(score / 25), 1, 4)
    : -(8 + mission.chapter * 2);
  const backlogDelta = completed ? (before.openFaults > 0 ? -1 : 0) : 1;
  const reliability = clampInteger(before.reliability + reliabilityDelta, 0, 100);
  const openFaults = clampInteger(before.openFaults + backlogDelta, 0, 9);
  const after: TurbineOperationalState = {
    ...before,
    reliability,
    availability: turbineAvailability(reliability, openFaults),
    openFaults,
    completedMissions: before.completedMissions + Number(completed),
    failedMissions: before.failedMissions + Number(!completed),
    lastMissionId: mission.id,
  };

  return {
    state: { ...state, [mission.turbineId]: after },
    update: {
      turbineId: mission.turbineId,
      completed,
      reliabilityDelta: after.reliability - before.reliability,
      backlogDelta: after.openFaults - before.openFaults,
      before: { ...before },
      after,
    },
  };
}

export function turbineMaintenanceQuote(
  state: WindFarmState,
  turbineId: string,
  availableCredits: number,
): TurbineMaintenanceQuote | null {
  const turbine = state[turbineId];
  if (!turbine) return null;
  const priority: TurbineMaintenancePriority = turbine.availability === 'OFFLINE'
    ? 'CRITICAL'
    : turbine.openFaults >= 2 || turbine.reliability < 70
      ? 'HIGH'
      : 'NORMAL';
  const reliabilityGain = turbine.availability === 'OFFLINE' ? 12 : turbine.openFaults >= 2 ? 10 : 8;
  const conditionPressure = Math.ceil((100 - turbine.reliability) / 10) * 2;
  const availabilityPressure = turbine.availability === 'OFFLINE' ? 8 : turbine.availability === 'DEGRADED' ? 2 : 0;
  const cost = 14 + turbine.openFaults * 5 + conditionPressure + availabilityPressure;
  const canMaintain = turbine.openFaults > 0;
  const beforeBacklog = turbine.openFaults;
  const afterBacklog = canMaintain ? Math.max(0, turbine.openFaults - 1) : turbine.openFaults;
  const beforeReliability = turbine.reliability;
  const afterReliability = canMaintain ? Math.min(100, turbine.reliability + reliabilityGain) : turbine.reliability;
  const normalizedCredits = Math.max(0, Math.round(availableCredits));
  return {
    turbineId,
    priority,
    cost,
    availableCredits: normalizedCredits,
    canMaintain,
    canAfford: canMaintain && normalizedCredits >= cost,
    reliabilityGain,
    beforeReliability,
    afterReliability,
    beforeBacklog,
    afterBacklog,
    beforeAvailability: turbine.availability,
    afterAvailability: turbineAvailability(afterReliability, afterBacklog),
  };
}

export function performTurbineMaintenance(
  state: WindFarmState,
  turbineId: string,
  availableCredits: number,
): { state: WindFarmState; settlement: TurbineMaintenanceSettlement } | null {
  const quote = turbineMaintenanceQuote(state, turbineId, availableCredits);
  const before = state[turbineId];
  if (!quote || !before || !quote.canMaintain || !quote.canAfford) return null;
  const after: TurbineOperationalState = {
    ...before,
    reliability: quote.afterReliability,
    availability: quote.afterAvailability,
    openFaults: quote.afterBacklog,
    maintenanceActions: before.maintenanceActions + 1,
  };
  const beforeCredits = quote.availableCredits;
  return {
    state: { ...state, [turbineId]: after },
    settlement: {
      turbineId,
      quote,
      beforeCredits,
      afterCredits: beforeCredits - quote.cost,
      before: { ...before },
      after,
    },
  };
}

export function createFleetDispatchPriority(
  state: WindFarmState,
  availableCredits: number,
): FleetDispatchPriority {
  const normalizedCredits = Math.max(0, Math.round(availableCredits));
  const currentSummary = summarizeWindFarm(state);
  const candidates = Object.values(state).map((turbine) => {
    const quote = turbineMaintenanceQuote(state, turbine.turbineId, normalizedCredits);
    if (!quote) return null;
    const projectedState = quote.canMaintain
      ? {
          ...state,
          [turbine.turbineId]: {
            ...turbine,
            reliability: quote.afterReliability,
            availability: quote.afterAvailability,
            openFaults: quote.afterBacklog,
          },
        }
      : state;
    const availabilityRecovery = availabilityRank(quote.afterAvailability) - availabilityRank(quote.beforeAvailability);
    // 排名同時重視停機風險、故障量、可靠度缺口與單次維修能否恢復 availability；
    // 數字只用於可重現的 gameplay 排序，不代表真實風場風險模型。
    const impactScore = quote.canMaintain
      ? availabilityPressureScore(quote.beforeAvailability)
        + maintenancePriorityScore(quote.priority)
        + quote.beforeBacklog * 25
        + (100 - quote.beforeReliability)
        + availabilityRecovery * 120
        + quote.reliabilityGain
      : 0;
    const budgetStatus: FleetDispatchBudgetStatus = !quote.canMaintain
      ? 'NO_BACKLOG'
      : quote.canAfford
        ? 'READY'
        : 'INSUFFICIENT';
    return {
      rank: 0,
      turbineId: turbine.turbineId,
      impactScore,
      budgetStatus,
      quote,
      projectedSummary: summarizeWindFarm(projectedState),
    } satisfies FleetDispatchPriorityItem;
  }).filter((item): item is FleetDispatchPriorityItem => item !== null);

  candidates.sort((left, right) =>
    Number(right.quote.canMaintain) - Number(left.quote.canMaintain)
    || right.impactScore - left.impactScore
    || left.quote.beforeReliability - right.quote.beforeReliability
    || left.quote.cost - right.quote.cost
    || left.turbineId.localeCompare(right.turbineId));
  const items = candidates.map((item, index) => ({ ...item, rank: index + 1 }));
  return {
    availableCredits: normalizedCredits,
    actionableCount: items.filter((item) => item.quote.canMaintain).length,
    affordableCount: items.filter((item) => item.budgetStatus === 'READY').length,
    currentSummary,
    items,
  };
}

export function createFleetMaintenancePlan(
  state: WindFarmState,
  turbineIds: string[],
  availableCredits: number,
): FleetMaintenancePlanQuote {
  // Plan 永遠依 stable ID 執行，避免玩家點選順序讓相同選項產生不同存檔結果。
  const normalizedIds = [...new Set(turbineIds)].sort((left, right) => left.localeCompare(right));
  const initialCredits = Math.max(0, Math.round(availableCredits));
  const beforeSummary = summarizeWindFarm(state);
  if (normalizedIds.length === 0) {
    return {
      turbineIds: [],
      steps: [],
      initialCredits,
      afterCredits: initialCredits,
      totalCost: 0,
      beforeSummary,
      afterSummary: beforeSummary,
      canConfirm: false,
      issue: 'EMPTY_PLAN',
    };
  }

  let workingState = state;
  let workingCredits = initialCredits;
  const steps: FleetMaintenancePlanStep[] = [];
  let issue: FleetMaintenancePlanIssue | undefined;
  let issueTurbineId: string | undefined;
  for (const turbineId of normalizedIds) {
    const quote = turbineMaintenanceQuote(workingState, turbineId, workingCredits);
    if (!quote) {
      issue = 'UNKNOWN_TURBINE';
      issueTurbineId = turbineId;
      break;
    }
    if (!quote.canMaintain) {
      issue = 'NO_BACKLOG';
      issueTurbineId = turbineId;
      break;
    }
    if (!quote.canAfford) {
      issue = 'INSUFFICIENT_MNT';
      issueTurbineId = turbineId;
      break;
    }
    const beforeStepSummary = summarizeWindFarm(workingState);
    const result = performTurbineMaintenance(workingState, turbineId, workingCredits);
    if (!result) {
      issue = 'INSUFFICIENT_MNT';
      issueTurbineId = turbineId;
      break;
    }
    workingState = result.state;
    workingCredits = result.settlement.afterCredits;
    steps.push({
      order: steps.length + 1,
      turbineId,
      quote,
      beforeCredits: result.settlement.beforeCredits,
      afterCredits: result.settlement.afterCredits,
      beforeSummary: beforeStepSummary,
      afterSummary: summarizeWindFarm(workingState),
      before: result.settlement.before,
      after: result.settlement.after,
    });
  }
  return {
    turbineIds: normalizedIds,
    steps,
    initialCredits,
    afterCredits: workingCredits,
    totalCost: initialCredits - workingCredits,
    beforeSummary,
    afterSummary: summarizeWindFarm(workingState),
    canConfirm: !issue && steps.length === normalizedIds.length,
    ...(issue ? { issue } : {}),
    ...(issueTurbineId ? { issueTurbineId } : {}),
  };
}

export function performFleetMaintenancePlan(
  state: WindFarmState,
  turbineIds: string[],
  availableCredits: number,
): { state: WindFarmState; settlement: FleetMaintenancePlanSettlement } | null {
  const quote = createFleetMaintenancePlan(state, turbineIds, availableCredits);
  if (!quote.canConfirm) return null;
  let workingState = state;
  let workingCredits = quote.initialCredits;
  for (const turbineId of quote.turbineIds) {
    const result = performTurbineMaintenance(workingState, turbineId, workingCredits);
    if (!result) return null;
    workingState = result.state;
    workingCredits = result.settlement.afterCredits;
  }
  return {
    state: workingState,
    settlement: {
      quote,
      beforeCredits: quote.initialCredits,
      afterCredits: quote.afterCredits,
      totalCost: quote.totalCost,
      turbineIds: quote.turbineIds,
      steps: quote.steps,
      beforeSummary: quote.beforeSummary,
      afterSummary: quote.afterSummary,
    },
  };
}

export function createFleetConditionDispatchModifier(
  state: WindFarmState,
  turbineId: string,
): FleetConditionDispatchModifier | null {
  const turbine = state[turbineId];
  if (!turbine) return null;
  const reliabilityPressure = Math.max(0, Math.ceil((90 - turbine.reliability) / 10));
  const availabilityCost = turbine.availability === 'OFFLINE' ? 6 : turbine.availability === 'DEGRADED' ? 2 : 0;
  const availabilityReliabilityPenalty = turbine.availability === 'OFFLINE' ? 3 : turbine.availability === 'DEGRADED' ? 1 : 0;
  const pressure: FleetConditionPressure = turbine.availability === 'OFFLINE'
    ? 'CRITICAL'
    : turbine.availability === 'DEGRADED' && (turbine.openFaults >= 2 || turbine.reliability < 70)
      ? 'HIGH'
      : turbine.availability === 'DEGRADED' || turbine.openFaults > 0 || turbine.reliability < 90
        ? 'ELEVATED'
        : 'NOMINAL';
  return {
    turbineId,
    pressure,
    availability: turbine.availability,
    sourceReliability: turbine.reliability,
    openFaults: turbine.openFaults,
    mobilizationCostDelta: availabilityCost + turbine.openFaults * 2 + reliabilityPressure,
    safetyPenalty: Math.min(20, availabilityCost + turbine.openFaults * 2 + reliabilityPressure),
    reliabilityPenalty: availabilityReliabilityPenalty + turbine.openFaults + Math.ceil(reliabilityPressure / 2),
  };
}

export function projectFleetConditionDispatch(
  mission: MissionState,
  mobilizationCost: number,
  modifier: FleetConditionDispatchModifier,
): FleetConditionDispatchProjection {
  return {
    modifier,
    mobilizationCostBefore: mobilizationCost,
    mobilizationCostAfter: mobilizationCost + modifier.mobilizationCostDelta,
    safetyBefore: mission.safety,
    safetyAfter: Math.max(0, mission.safety - modifier.safetyPenalty),
    reliabilityBefore: mission.reliability,
    reliabilityAfter: Math.max(0, mission.reliability - modifier.reliabilityPenalty),
  };
}

export function applyFleetConditionDispatch(
  mission: MissionState,
  modifier: FleetConditionDispatchModifier,
): MissionState {
  if (mission.fleetConditionApplied) return mission;
  return {
    ...mission,
    safety: Math.max(0, mission.safety - modifier.safetyPenalty),
    reliability: Math.max(0, mission.reliability - modifier.reliabilityPenalty),
    cost: mission.cost + modifier.mobilizationCostDelta,
    fleetConditionApplied: true,
  };
}

export function summarizeWindFarm(state: WindFarmState): WindFarmSummary {
  const turbines = Object.values(state);
  const totalReliability = turbines.reduce((total, turbine) => total + turbine.reliability, 0);
  return {
    available: turbines.filter((turbine) => turbine.availability === 'AVAILABLE').length,
    degraded: turbines.filter((turbine) => turbine.availability === 'DEGRADED').length,
    offline: turbines.filter((turbine) => turbine.availability === 'OFFLINE').length,
    averageReliability: turbines.length > 0 ? Math.round(totalReliability / turbines.length) : 0,
    totalBacklog: turbines.reduce((total, turbine) => total + turbine.openFaults, 0),
  };
}

function availabilityRank(availability: TurbineAvailability): number {
  if (availability === 'AVAILABLE') return 2;
  if (availability === 'DEGRADED') return 1;
  return 0;
}

function availabilityPressureScore(availability: TurbineAvailability): number {
  if (availability === 'OFFLINE') return 500;
  if (availability === 'DEGRADED') return 200;
  return 0;
}

function maintenancePriorityScore(priority: TurbineMaintenancePriority): number {
  if (priority === 'CRITICAL') return 150;
  if (priority === 'HIGH') return 120;
  return 20;
}

function validInteger(value: unknown, fallback: number, minimum: number, maximum: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? clampInteger(value, minimum, maximum)
    : fallback;
}

function clampInteger(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}
