import { describe, expect, it } from 'vitest';
import type { CourseAssignment } from './course';
import {
  calculateReliabilityKpis,
  COURSE_CASE_LIBRARY,
  createLotoProcedure,
  createMissionEngineeringPack,
  createWorkOrder,
  LOTO_STEPS,
  performLotoStep,
  performWorkOrderStep,
  runAlarmTest,
  WORK_ORDER_STEPS,
} from './courseEngineering';

const assignment = (index: number): CourseAssignment => ({
  id: `COURSE-W${String(index + 1).padStart(2, '0')}`,
  weekId: `W${String(index + 1).padStart(2, '0')}`,
  missionId: `MSN-TUT-${String(index + 1).padStart(3, '0')}`,
  titleZh: `任務 ${index + 1}`,
  titleEn: `Mission ${index + 1}`,
  teamIds: ['CHR-1', 'CHR-2', 'CHR-3'],
  equipmentId: 'EQ-1',
  spareId: 'EQ-2',
  vesselId: 'VES-1',
  randomSeed: 357101 + index,
});

describe('Course Engineering Lab', () => {
  it('creates deterministic SCADA/CMS packs with timestamps, alarms, events, and missing data for all 15 missions', () => {
    const packs = Array.from({ length: 15 }, (_, index) => createMissionEngineeringPack(assignment(index), index));
    expect(new Set(packs.map((pack) => pack.assignmentId)).size).toBe(15);
    for (const pack of packs) {
      expect(pack.samples).toHaveLength(12);
      expect(pack.samples.every((sample) => /^\d{4}-\d{2}-\d{2}T/.test(sample.timestamp))).toBe(true);
      expect(pack.samples.some((sample) => sample.alarm)).toBe(true);
      expect(pack.samples.some((sample) => sample.event)).toBe(true);
      expect(pack.samples.some((sample) => sample.missingFields.length > 0)).toBe(true);
    }
    expect(createMissionEngineeringPack(assignment(0), 0)).toEqual(createMissionEngineeringPack(assignment(0), 0));
  });

  it('calculates Availability, MTBF, MTTR, Downtime, lost revenue, and OPEX from explicit inputs', () => {
    expect(calculateReliabilityKpis({
      periodHours: 100,
      plannedMaintenanceHours: 10,
      unplannedDowntimeHours: 18,
      repairHours: 12,
      failures: 3,
      lostProductionMWh: 20,
      electricityPricePerMWh: 100,
      laborCost: 1_000,
      partsCost: 2_000,
      vesselCost: 3_000,
    })).toEqual({
      observableHours: 90,
      uptimeHours: 72,
      availabilityPercent: 80,
      mtbfHours: 24,
      mttrHours: 4,
      downtimeHours: 18,
      lostRevenue: 2_000,
      opex: 8_000,
    });
  });

  it('enforces the ordered five-step LOTO procedure and six-step Work Order lifecycle', () => {
    let loto = createLotoProcedure();
    loto = performLotoStep(loto, 'ISOLATE');
    expect(loto.rejectedActions).toBe(1);
    for (const step of LOTO_STEPS) loto = performLotoStep(loto, step);
    expect(loto.verified).toBe(true);
    expect(loto.completedSteps).toEqual(LOTO_STEPS);

    let workOrder = createWorkOrder();
    for (const step of WORK_ORDER_STEPS) workOrder = performWorkOrderStep(workOrder, step);
    expect(workOrder.closed).toBe(true);
    expect(workOrder.completedSteps).toEqual(WORK_ORDER_STEPS);
  });

  it('tests threshold, hysteresis, delay, persistence, and interlock while generating IEC ST', () => {
    const result = runAlarmTest([68, 72, 74, 75, 76, 73, 67], {
      threshold: 72,
      hysteresis: 3,
      delaySeconds: 10,
      persistenceSamples: 3,
      sampleIntervalSeconds: 5,
      interlockEnabled: true,
    });
    expect(result.alarmSetAtSeconds).toBe(15);
    expect(result.interlockTripAtSeconds).toBe(15);
    expect(result.trace.at(-1)?.reason).toBe('ALARM_RESET');
    expect(result.structuredText).toContain('PersistCounter');
    expect(result.structuredText).toContain('AlarmDelay');
    expect(result.structuredText).toContain('InterlockTrip');
    expect(COURSE_CASE_LIBRARY).toHaveLength(12);
  });
});
