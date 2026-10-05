import { describe, expect, it } from 'vitest';
import type { CourseAssignment } from './course';
import {
  calculateReliabilityKpis,
  COURSE_CASE_LIBRARY,
  createLotoProcedure,
  createMissionEngineeringPack,
  createWorkOrder,
  defaultPackTier,
  deriveAlarmTestSignal,
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

  it('pins the 15-week engineering pack output so reordering or renumbering weeks cannot silently change KPI answers', () => {
    const rows = Array.from({ length: 15 }, (_, index) => {
      const pack = createMissionEngineeringPack(assignment(index), index);
      const kpis = calculateReliabilityKpis(pack.reliabilityInput);
      const tempSum = pack.samples.reduce((sum, sample) => sum + (sample.temperatureC ?? 0), 0);
      return `${index + 1}|${pack.samples[0].timestamp}|${Math.round(tempSum * 100)}|${JSON.stringify(pack.reliabilityInput)}|${kpis.availabilityPercent}`;
    });
    expect(rows.join('\n')).toMatchInlineSnapshot(`
      "1|2026-01-05T00:00:00.000Z|84260|{"periodHours":720,"plannedMaintenanceHours":12,"unplannedDowntimeHours":8,"repairHours":5.8,"failures":1,"lostProductionMWh":33.6,"electricityPricePerMWh":105,"laborCost":18000,"partsCost":24000,"vesselCost":35000}|98.87
      2|2026-01-06T00:00:00.000Z|68680|{"periodHours":720,"plannedMaintenanceHours":14,"unplannedDowntimeHours":9.7,"repairHours":7,"failures":1,"lostProductionMWh":40.7,"electricityPricePerMWh":105,"laborCost":19250,"partsCost":27500,"vesselCost":37000}|98.63
      3|2026-01-07T00:00:00.000Z|85940|{"periodHours":720,"plannedMaintenanceHours":16,"unplannedDowntimeHours":11.4,"repairHours":8.2,"failures":1,"lostProductionMWh":47.9,"electricityPricePerMWh":105,"laborCost":20500,"partsCost":31000,"vesselCost":39000}|98.38
      4|2026-01-08T00:00:00.000Z|85900|{"periodHours":720,"plannedMaintenanceHours":12,"unplannedDowntimeHours":13.1,"repairHours":9.4,"failures":1,"lostProductionMWh":55,"electricityPricePerMWh":105,"laborCost":21750,"partsCost":34500,"vesselCost":41000}|98.15
      5|2026-01-09T00:00:00.000Z|69050|{"periodHours":720,"plannedMaintenanceHours":14,"unplannedDowntimeHours":14.8,"repairHours":10.7,"failures":1,"lostProductionMWh":62.2,"electricityPricePerMWh":105,"laborCost":23000,"partsCost":38000,"vesselCost":43000}|97.9
      6|2026-01-10T00:00:00.000Z|86550|{"periodHours":720,"plannedMaintenanceHours":16,"unplannedDowntimeHours":16.5,"repairHours":11.9,"failures":2,"lostProductionMWh":69.3,"electricityPricePerMWh":105,"laborCost":24250,"partsCost":41500,"vesselCost":45000}|97.66
      7|2026-01-11T00:00:00.000Z|86200|{"periodHours":720,"plannedMaintenanceHours":12,"unplannedDowntimeHours":18.2,"repairHours":13.1,"failures":2,"lostProductionMWh":76.4,"electricityPricePerMWh":105,"laborCost":25500,"partsCost":45000,"vesselCost":47000}|97.43
      8|2026-01-12T00:00:00.000Z|69310|{"periodHours":720,"plannedMaintenanceHours":14,"unplannedDowntimeHours":19.9,"repairHours":14.3,"failures":2,"lostProductionMWh":83.6,"electricityPricePerMWh":105,"laborCost":26750,"partsCost":48500,"vesselCost":49000}|97.18
      9|2026-01-13T00:00:00.000Z|86690|{"periodHours":720,"plannedMaintenanceHours":16,"unplannedDowntimeHours":21.6,"repairHours":15.6,"failures":2,"lostProductionMWh":90.7,"electricityPricePerMWh":105,"laborCost":28000,"partsCost":52000,"vesselCost":51000}|96.93
      10|2026-01-14T00:00:00.000Z|86430|{"periodHours":720,"plannedMaintenanceHours":12,"unplannedDowntimeHours":23.3,"repairHours":16.8,"failures":2,"lostProductionMWh":97.9,"electricityPricePerMWh":105,"laborCost":29250,"partsCost":55500,"vesselCost":53000}|96.71
      11|2026-01-15T00:00:00.000Z|69530|{"periodHours":720,"plannedMaintenanceHours":14,"unplannedDowntimeHours":25,"repairHours":18,"failures":3,"lostProductionMWh":105,"electricityPricePerMWh":105,"laborCost":30500,"partsCost":59000,"vesselCost":55000}|96.46
      12|2026-01-16T00:00:00.000Z|87370|{"periodHours":720,"plannedMaintenanceHours":16,"unplannedDowntimeHours":26.7,"repairHours":19.2,"failures":3,"lostProductionMWh":112.1,"electricityPricePerMWh":105,"laborCost":31750,"partsCost":62500,"vesselCost":57000}|96.21
      13|2026-01-17T00:00:00.000Z|86630|{"periodHours":720,"plannedMaintenanceHours":12,"unplannedDowntimeHours":28.4,"repairHours":20.4,"failures":3,"lostProductionMWh":119.3,"electricityPricePerMWh":105,"laborCost":33000,"partsCost":66000,"vesselCost":59000}|95.99
      14|2026-01-18T00:00:00.000Z|69730|{"periodHours":720,"plannedMaintenanceHours":14,"unplannedDowntimeHours":30.1,"repairHours":21.7,"failures":3,"lostProductionMWh":126.4,"electricityPricePerMWh":105,"laborCost":34250,"partsCost":69500,"vesselCost":61000}|95.74
      15|2026-01-19T00:00:00.000Z|87660|{"periodHours":720,"plannedMaintenanceHours":16,"unplannedDowntimeHours":31.8,"repairHours":22.9,"failures":3,"lostProductionMWh":133.6,"electricityPricePerMWh":105,"laborCost":35500,"partsCost":73000,"vesselCost":63000}|95.48"
    `);
  });

  it('defaults packTier to floor(index/3)+1 and lets an explicit packTier override severity', () => {
    expect(Array.from({ length: 15 }, (_, index) => defaultPackTier(index))).toEqual([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5]);
    const implicit = createMissionEngineeringPack(assignment(9), 9);
    const explicit = createMissionEngineeringPack({ ...assignment(9), packTier: defaultPackTier(9) }, 9);
    expect(explicit).toEqual(implicit);
    const harder = createMissionEngineeringPack({ ...assignment(9), packTier: 5 }, 9);
    expect(harder.samples[11].temperatureC!).toBeGreaterThan(implicit.samples[11].temperatureC!);
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

  // Per the 2026-08-31 ops review: with hysteresis=0 the set and reset points are the same value,
  // so a "<=" reset would immediately clear an alarm set by that same value, chattering every
  // sample. A held-at-threshold signal should latch the alarm instead of oscillating.
  it('does not chatter between ALARM_SET and ALARM_RESET when hysteresis is 0 and the value holds exactly at the threshold', () => {
    const result = runAlarmTest([72, 72, 72, 72, 72], {
      threshold: 72,
      hysteresis: 0,
      delaySeconds: 0,
      persistenceSamples: 1,
      sampleIntervalSeconds: 5,
      interlockEnabled: false,
    });
    expect(result.trace.map((point) => point.reason)).toEqual([
      'ALARM_SET',
      'HYSTERESIS_HOLD',
      'HYSTERESIS_HOLD',
      'HYSTERESIS_HOLD',
      'HYSTERESIS_HOLD',
    ]);
    expect(result.trace.every((point) => point.alarm)).toBe(true);
  });

  // Per the 2026-08-31 ops review: the Alarm/Interlock tester previously replayed one hardcoded
  // 9-point sample for all 15 weeks. The signal and recommended threshold must now come from that
  // week's own data pack, so different weeks produce different demo traces.
  it('derives the Alarm/Interlock tester signal and threshold from the week\'s own data pack, deterministically', () => {
    const packA = createMissionEngineeringPack(assignment(0), 0);
    const packB = createMissionEngineeringPack(assignment(9), 9);
    const signalA = deriveAlarmTestSignal(packA);
    const signalB = deriveAlarmTestSignal(packB);
    expect(signalA.values).toHaveLength(packA.samples.length);
    expect(signalA.values.every((value) => Number.isFinite(value))).toBe(true);
    expect(signalA.values).not.toEqual(signalB.values);
    expect(deriveAlarmTestSignal(packA)).toEqual(signalA);
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
    const resetThreshold = Number(structuredText.match(/ResetCondition := ProcessValue < (-?[\d.]+);/)?.[1]);
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
      if (value < resetThreshold) {
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
