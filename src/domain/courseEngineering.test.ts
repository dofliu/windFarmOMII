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
  type AlarmTesterConfig,
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

  it('calculates Availability, MTBF, MTTR, Downtime, lost revenue, OPEX, and total downtime cost from explicit inputs', () => {
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
      opex: 6_000,
      totalDowntimeCost: 8_000,
    });
  });

  it('reports Availability as N/A when there are no observable hours, and MTBF/MTTR as N/A on zero recorded failures (not the worst-case 0)', () => {
    const zeroFailures = calculateReliabilityKpis({
      periodHours: 100,
      plannedMaintenanceHours: 10,
      unplannedDowntimeHours: 0,
      repairHours: 0,
      failures: 0,
      lostProductionMWh: 0,
      electricityPricePerMWh: 100,
      laborCost: 500,
      partsCost: 0,
      vesselCost: 0,
    });
    expect(zeroFailures.mtbfHours).toBeNull();
    expect(zeroFailures.mttrHours).toBeNull();
    expect(zeroFailures.availabilityPercent).toBe(100);

    const zeroObservable = calculateReliabilityKpis({
      periodHours: 100,
      plannedMaintenanceHours: 100,
      unplannedDowntimeHours: 0,
      repairHours: 0,
      failures: 0,
      lostProductionMWh: 0,
      electricityPricePerMWh: 100,
      laborCost: 0,
      partsCost: 0,
      vesselCost: 0,
    });
    expect(zeroObservable.availabilityPercent).toBeNull();
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

  // Independently re-derives the alarm timing from the *generated ST text* itself (not from the
  // trainer's own implementation) so the two can never silently drift apart again, per the
  // 2026-08-31 ops review finding that the previous test only grepped for identifier strings.
  function simulateGeneratedStructuredText(
    structuredText: string,
    values: number[],
    sampleIntervalSeconds: number,
  ): { alarmSetAtSeconds: number | null; interlockTripAtSeconds: number | null } {
    const threshold = Number(structuredText.match(/HighCondition := ProcessValue >= ([\d.]+);/)?.[1]);
    const resetThreshold = Number(structuredText.match(/ResetCondition := ProcessValue <= (-?[\d.]+);/)?.[1]);
    const persistenceSamples = Number(structuredText.match(/PersistCounter\(IN := HighCondition, PV := (\d+)\);/)?.[1]);
    const delaySeconds = Number(structuredText.match(/AlarmDelay\(IN := HighCondition, PT := T#(\d+)s\);/)?.[1]);
    const interlockEnabled = /InterlockTrip := AlarmActive AND TRUE;/.test(structuredText);
    expect([threshold, resetThreshold, persistenceSamples, delaySeconds].every(Number.isFinite)).toBe(true);

    let alarmActive = false;
    let persistCount = 0;
    let timerStartSeconds: number | null = null;
    let alarmSetAtSeconds: number | null = null;
    let interlockTripAtSeconds: number | null = null;
    values.forEach((value, index) => {
      const elapsedSeconds = index * sampleIntervalSeconds;
      const highCondition = value >= threshold;
      if (highCondition) {
        persistCount += 1;
        if (timerStartSeconds === null) timerStartSeconds = elapsedSeconds;
      } else {
        persistCount = 0;
        timerStartSeconds = null;
      }
      const persistCounterQ = persistCount >= persistenceSamples;
      const alarmDelayQ = timerStartSeconds !== null && elapsedSeconds - timerStartSeconds >= delaySeconds;
      if (value <= resetThreshold) {
        alarmActive = false;
      } else if (persistCounterQ && alarmDelayQ) {
        alarmActive = true;
        alarmSetAtSeconds ??= elapsedSeconds;
      }
      if (alarmActive && interlockEnabled) interlockTripAtSeconds ??= elapsedSeconds;
    });
    return { alarmSetAtSeconds, interlockTripAtSeconds };
  }

  it('keeps the generated IEC 61131-3 ST semantically in sync with the alarm trainer simulation', () => {
    const cases: Array<{ values: number[]; config: AlarmTesterConfig }> = [
      {
        values: [68, 72, 74, 75, 76, 73, 67],
        config: { threshold: 72, hysteresis: 3, delaySeconds: 10, persistenceSamples: 3, sampleIntervalSeconds: 5, interlockEnabled: true },
      },
      {
        values: [50, 60, 65, 68, 70, 71, 40],
        config: { threshold: 60, hysteresis: 5, delaySeconds: 0, persistenceSamples: 1, sampleIntervalSeconds: 2, interlockEnabled: false },
      },
      {
        values: [10, 12, 15, 20, 22, 25, 30, 9],
        config: { threshold: 20, hysteresis: 4, delaySeconds: 6, persistenceSamples: 4, sampleIntervalSeconds: 3, interlockEnabled: true },
      },
    ];
    for (const { values, config } of cases) {
      const result = runAlarmTest(values, config);
      const reDerived = simulateGeneratedStructuredText(result.structuredText, values, config.sampleIntervalSeconds);
      expect(reDerived).toEqual({
        alarmSetAtSeconds: result.alarmSetAtSeconds,
        interlockTripAtSeconds: result.interlockTripAtSeconds,
      });
    }
  });
});
