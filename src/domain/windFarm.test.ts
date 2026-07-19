import { describe, expect, it } from 'vitest';
import {
  createInitialWindFarm,
  createFleetDispatchPriority,
  createFleetMaintenancePlan,
  createFleetConditionDispatchModifier,
  normalizeWindFarmState,
  performFleetMaintenancePlan,
  applyFleetConditionDispatch,
  projectFleetConditionDispatch,
  performTurbineMaintenance,
  settleWindFarmMission,
  summarizeWindFarm,
  turbineAvailability,
  turbineMaintenanceQuote,
} from './windFarm';
import type { WindFarmState } from './windFarm';
import type { MissionData, TurbineData } from './types';

const turbines: TurbineData[] = [
  { id: 'WTG-OWM-001', nameZh: '一號', nameEn: 'One', zone: 'A-01', ratedPowerMw: 12, initialReliability: 88, initialOpenFaults: 1 },
  { id: 'WTG-OWM-002', nameZh: '二號', nameEn: 'Two', zone: 'A-02', ratedPowerMw: 12, initialReliability: 94, initialOpenFaults: 0 },
];

const mission = {
  id: 'MSN-1', turbineId: turbines[0].id, chapter: 2,
} as MissionData;

function createDispatchState(): WindFarmState {
  return {
    'WTG-OWM-001': { turbineId: 'WTG-OWM-001', reliability: 88, availability: 'DEGRADED', openFaults: 1, completedMissions: 0, failedMissions: 0, maintenanceActions: 0 },
    'WTG-OWM-002': { turbineId: 'WTG-OWM-002', reliability: 82, availability: 'DEGRADED', openFaults: 1, completedMissions: 0, failedMissions: 0, maintenanceActions: 0 },
    'WTG-OWM-003': { turbineId: 'WTG-OWM-003', reliability: 94, availability: 'AVAILABLE', openFaults: 0, completedMissions: 0, failedMissions: 0, maintenanceActions: 0 },
    'WTG-OWM-004': { turbineId: 'WTG-OWM-004', reliability: 76, availability: 'DEGRADED', openFaults: 2, completedMissions: 0, failedMissions: 0, maintenanceActions: 0 },
    'WTG-OWM-005': { turbineId: 'WTG-OWM-005', reliability: 91, availability: 'AVAILABLE', openFaults: 0, completedMissions: 0, failedMissions: 0, maintenanceActions: 0 },
    'WTG-OWM-006': { turbineId: 'WTG-OWM-006', reliability: 69, availability: 'DEGRADED', openFaults: 2, completedMissions: 0, failedMissions: 0, maintenanceActions: 0 },
  };
}

describe('wind farm operations state', () => {
  it('由風機主資料建立可重現的初始 reliability、availability 與 backlog', () => {
    const state = createInitialWindFarm(turbines);
    expect(state['WTG-OWM-001']).toMatchObject({ reliability: 88, availability: 'DEGRADED', openFaults: 1 });
    expect(state['WTG-OWM-002']).toMatchObject({ reliability: 94, availability: 'AVAILABLE', openFaults: 0 });
    expect(summarizeWindFarm(state)).toEqual({ available: 1, degraded: 1, offline: 0, averageReliability: 91, totalBacklog: 1 });
  });

  it('成功會降低 backlog 並提升 reliability，且不修改輸入狀態', () => {
    const initial = createInitialWindFarm(turbines);
    const result = settleWindFarmMission(initial, mission, true, 86);
    expect(result.update).toMatchObject({ turbineId: 'WTG-OWM-001', reliabilityDelta: 8, backlogDelta: -1 });
    expect(result.state['WTG-OWM-001']).toMatchObject({ reliability: 96, availability: 'AVAILABLE', openFaults: 0, completedMissions: 1, failedMissions: 0, lastMissionId: mission.id });
    expect(initial['WTG-OWM-001']).toMatchObject({ reliability: 88, openFaults: 1, completedMissions: 0 });
  });

  it('失敗會累積 backlog、降低 reliability，達門檻時轉為 OFFLINE', () => {
    const initial = createInitialWindFarm(turbines);
    const risk = {
      ...initial,
      'WTG-OWM-001': { ...initial['WTG-OWM-001'], reliability: 42, openFaults: 3, availability: 'DEGRADED' as const },
    };
    const result = settleWindFarmMission(risk, mission, false, 20);
    expect(result.update).toMatchObject({ reliabilityDelta: -12, backlogDelta: 1 });
    expect(result.state['WTG-OWM-001']).toMatchObject({ reliability: 30, availability: 'OFFLINE', openFaults: 4, completedMissions: 0, failedMissions: 1 });
    expect(turbineAvailability(79, 0)).toBe('DEGRADED');
    expect(turbineAvailability(90, 4)).toBe('OFFLINE');
  });

  it('migration 只保留已知 Turbine ID，補回缺少項目並重算 availability', () => {
    const restored = normalizeWindFarmState({
      'WTG-OWM-001': { turbineId: 'WRONG', reliability: 37, availability: 'AVAILABLE', openFaults: 2, completedMissions: 3, failedMissions: -4, lastMissionId: 'MSN-OLD' },
      UNKNOWN: { reliability: 100, openFaults: 0 },
    }, turbines);
    expect(Object.keys(restored)).toEqual(['WTG-OWM-001', 'WTG-OWM-002']);
    expect(restored['WTG-OWM-001']).toMatchObject({ turbineId: 'WTG-OWM-001', reliability: 37, availability: 'OFFLINE', openFaults: 2, completedMissions: 3, failedMissions: 0, lastMissionId: 'MSN-OLD' });
    expect(restored['WTG-OWM-002']).toMatchObject({ reliability: 94, availability: 'AVAILABLE' });
  });

  it('maintenance quote 使用獨立公式並在確認前保持純讀取', () => {
    const initial = createInitialWindFarm(turbines);
    const quote = turbineMaintenanceQuote(initial, 'WTG-OWM-001', 80);
    expect(quote).toMatchObject({
      priority: 'NORMAL', cost: 25, availableCredits: 80, canMaintain: true, canAfford: true,
      beforeReliability: 88, afterReliability: 96, beforeBacklog: 1, afterBacklog: 0,
      beforeAvailability: 'DEGRADED', afterAvailability: 'AVAILABLE',
    });
    expect(initial['WTG-OWM-001']).toMatchObject({ reliability: 88, openFaults: 1, maintenanceActions: 0 });
  });

  it('確認 maintenance 才扣 MNT、處理一筆 backlog 並保存 action count', () => {
    const initial = createInitialWindFarm(turbines);
    const result = performTurbineMaintenance(initial, 'WTG-OWM-001', 80);
    expect(result?.settlement).toMatchObject({ turbineId: 'WTG-OWM-001', beforeCredits: 80, afterCredits: 55 });
    expect(result?.state['WTG-OWM-001']).toMatchObject({ reliability: 96, availability: 'AVAILABLE', openFaults: 0, maintenanceActions: 1 });
    expect(initial['WTG-OWM-001']).toMatchObject({ reliability: 88, openFaults: 1, maintenanceActions: 0 });
  });

  it('無 backlog 或 MNT 不足時拒絕 settlement，OFFLINE quote 使用 critical 壓力', () => {
    const initial = createInitialWindFarm(turbines);
    expect(turbineMaintenanceQuote(initial, 'WTG-OWM-002', 80)).toMatchObject({ canMaintain: false, canAfford: false });
    expect(performTurbineMaintenance(initial, 'WTG-OWM-001', 24)).toBeNull();
    const offline = {
      ...initial,
      'WTG-OWM-001': { ...initial['WTG-OWM-001'], reliability: 30, openFaults: 4, availability: 'OFFLINE' as const },
    };
    expect(turbineMaintenanceQuote(offline, 'WTG-OWM-001', 80)).toMatchObject({
      priority: 'CRITICAL', cost: 56, reliabilityGain: 12, afterReliability: 42, afterBacklog: 3, afterAvailability: 'DEGRADED',
    });
  });

  it('依風場風險與單次效益建立六機組 deterministic dispatch queue', () => {
    const dispatchState = createDispatchState();
    const queue = createFleetDispatchPriority(dispatchState, 33);
    expect(queue.items.map((item) => item.turbineId)).toEqual([
      'WTG-OWM-006', 'WTG-OWM-004', 'WTG-OWM-002', 'WTG-OWM-001', 'WTG-OWM-005', 'WTG-OWM-003',
    ]);
    expect(queue).toMatchObject({
      availableCredits: 33,
      actionableCount: 4,
      affordableCount: 3,
      currentSummary: { available: 2, degraded: 4, offline: 0, averageReliability: 83, totalBacklog: 6 },
    });
    expect(queue.items[0]).toMatchObject({
      rank: 1,
      turbineId: 'WTG-OWM-006',
      impactScore: 411,
      budgetStatus: 'INSUFFICIENT',
      quote: { cost: 34, beforeReliability: 69, afterReliability: 79, beforeBacklog: 2, afterBacklog: 1 },
      projectedSummary: { available: 2, degraded: 4, offline: 0, averageReliability: 85, totalBacklog: 5 },
    });
    expect(queue.items[2]).toMatchObject({
      turbineId: 'WTG-OWM-002',
      budgetStatus: 'READY',
      projectedSummary: { available: 3, degraded: 3, averageReliability: 85, totalBacklog: 5 },
    });
    expect(dispatchState['WTG-OWM-006']).toMatchObject({ reliability: 69, openFaults: 2 });
  });

  it('multi-action plan 依 stable ID 預覽逐步結果與總 MNT，且不修改輸入', () => {
    const initial = createDispatchState();
    const plan = createFleetMaintenancePlan(initial, ['WTG-OWM-004', 'WTG-OWM-001', 'WTG-OWM-004'], 80);
    expect(plan).toMatchObject({
      turbineIds: ['WTG-OWM-001', 'WTG-OWM-004'],
      initialCredits: 80,
      afterCredits: 23,
      totalCost: 57,
      canConfirm: true,
      beforeSummary: { available: 2, degraded: 4, averageReliability: 83, totalBacklog: 6 },
      afterSummary: { available: 3, degraded: 3, averageReliability: 86, totalBacklog: 4 },
    });
    expect(plan.steps).toHaveLength(2);
    expect(plan.steps[0]).toMatchObject({
      order: 1, turbineId: 'WTG-OWM-001', beforeCredits: 80, afterCredits: 55,
      beforeSummary: { available: 2, totalBacklog: 6 },
      afterSummary: { available: 3, totalBacklog: 5 },
      before: { reliability: 88, openFaults: 1 }, after: { reliability: 96, openFaults: 0, maintenanceActions: 1 },
    });
    expect(plan.steps[1]).toMatchObject({
      order: 2, turbineId: 'WTG-OWM-004', beforeCredits: 55, afterCredits: 23,
      beforeSummary: { available: 3, totalBacklog: 5 },
      afterSummary: { available: 3, totalBacklog: 4 },
      before: { reliability: 76, openFaults: 2 }, after: { reliability: 86, openFaults: 1, maintenanceActions: 1 },
    });
    expect(initial['WTG-OWM-001']).toMatchObject({ reliability: 88, openFaults: 1, maintenanceActions: 0 });
    expect(initial['WTG-OWM-004']).toMatchObject({ reliability: 76, openFaults: 2, maintenanceActions: 0 });
  });

  it('plan 超出預算時保留可驗證的 prefix 但禁止原子 settlement', () => {
    const initial = createDispatchState();
    const plan = createFleetMaintenancePlan(initial, ['WTG-OWM-006', 'WTG-OWM-004'], 50);
    expect(plan).toMatchObject({
      turbineIds: ['WTG-OWM-004', 'WTG-OWM-006'],
      canConfirm: false,
      issue: 'INSUFFICIENT_MNT',
      issueTurbineId: 'WTG-OWM-006',
      totalCost: 32,
      afterCredits: 18,
    });
    expect(plan.steps.map((step) => step.turbineId)).toEqual(['WTG-OWM-004']);
    expect(performFleetMaintenancePlan(initial, ['WTG-OWM-006', 'WTG-OWM-004'], 50)).toBeNull();
    expect(initial['WTG-OWM-004']).toMatchObject({ reliability: 76, maintenanceActions: 0 });
  });

  it('確認 plan 才一次產生兩部風機的新 state 與 settlement', () => {
    const initial = createDispatchState();
    const result = performFleetMaintenancePlan(initial, ['WTG-OWM-004', 'WTG-OWM-001'], 80);
    expect(result?.settlement).toMatchObject({
      turbineIds: ['WTG-OWM-001', 'WTG-OWM-004'], beforeCredits: 80, afterCredits: 23, totalCost: 57,
      beforeSummary: { available: 2, totalBacklog: 6 }, afterSummary: { available: 3, totalBacklog: 4 },
    });
    expect(result?.state['WTG-OWM-001']).toMatchObject({ reliability: 96, openFaults: 0, maintenanceActions: 1 });
    expect(result?.state['WTG-OWM-004']).toMatchObject({ reliability: 86, openFaults: 1, maintenanceActions: 1 });
    expect(initial['WTG-OWM-001']).toMatchObject({ reliability: 88, maintenanceActions: 0 });
  });

  it('由 target turbine 狀態派生可重現的 dispatch pressure 與前後投影', () => {
    const initial = createDispatchState();
    const modifier = createFleetConditionDispatchModifier(initial, 'WTG-OWM-001')!;
    expect(modifier).toEqual({
      turbineId: 'WTG-OWM-001',
      pressure: 'ELEVATED',
      availability: 'DEGRADED',
      sourceReliability: 88,
      openFaults: 1,
      mobilizationCostDelta: 5,
      safetyPenalty: 5,
      reliabilityPenalty: 3,
    });
    const missionState = {
      bossId: 'BOSS001', stageIndex: 0, phase: 1, progress: 0, requirement: 10, round: 1, roundLimit: 11,
      weatherWindow: 100, safety: 100, evidence: 12, reliability: 15, cost: 21, complete: false, failed: false,
    };
    expect(projectFleetConditionDispatch(missionState, 5, modifier)).toMatchObject({
      mobilizationCostBefore: 5, mobilizationCostAfter: 10,
      safetyBefore: 100, safetyAfter: 95,
      reliabilityBefore: 15, reliabilityAfter: 12,
    });
    const applied = applyFleetConditionDispatch(missionState, modifier);
    expect(applied).toMatchObject({ cost: 26, safety: 95, reliability: 12, fleetConditionApplied: true });
    expect(applyFleetConditionDispatch(applied, modifier)).toEqual(applied);
    expect(missionState).toMatchObject({ cost: 21, safety: 100, reliability: 15 });
  });

  it('OFFLINE target 使用 CRITICAL 上限，健康機組保持 NOMINAL 零修正', () => {
    const initial = createDispatchState();
    const offline = {
      ...initial,
      'WTG-OWM-006': { ...initial['WTG-OWM-006'], reliability: 30, openFaults: 4, availability: 'OFFLINE' as const },
    };
    expect(createFleetConditionDispatchModifier(offline, 'WTG-OWM-006')).toMatchObject({
      pressure: 'CRITICAL', mobilizationCostDelta: 20, safetyPenalty: 20, reliabilityPenalty: 10,
    });
    expect(createFleetConditionDispatchModifier(initial, 'WTG-OWM-003')).toMatchObject({
      pressure: 'NOMINAL', mobilizationCostDelta: 0, safetyPenalty: 0, reliabilityPenalty: 0,
    });
    expect(createFleetConditionDispatchModifier(initial, 'UNKNOWN')).toBeNull();
  });
});
