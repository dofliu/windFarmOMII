import type { CourseAssignment } from './course';

export type CourseFaultFamily =
  | 'DRIVETRAIN'
  | 'PITCH_YAW_HYDRAULIC'
  | 'GENERATOR_ELECTRICAL';

export interface ScadaCmsSample {
  timestamp: string;
  loadKw: number | null;
  temperatureC: number | null;
  vibrationMmS: number | null;
  alarm: string | null;
  event: string | null;
  missingFields: Array<'loadKw' | 'temperatureC' | 'vibrationMmS'>;
}

export interface ReliabilityInput {
  periodHours: number;
  plannedMaintenanceHours: number;
  unplannedDowntimeHours: number;
  repairHours: number;
  failures: number;
  lostProductionMWh: number;
  electricityPricePerMWh: number;
  laborCost: number;
  partsCost: number;
  vesselCost: number;
}

export interface ReliabilityKpis {
  observableHours: number;
  uptimeHours: number;
  availabilityPercent: number;
  mtbfHours: number;
  mttrHours: number;
  downtimeHours: number;
  lostRevenue: number;
  opex: number;
}

export interface MissionEngineeringPack {
  schemaVersion: 1;
  assignmentId: string;
  missionId: string;
  randomSeed: number;
  faultFamily: CourseFaultFamily;
  sampleIntervalMinutes: number;
  samples: ScadaCmsSample[];
  reliabilityInput: ReliabilityInput;
}

export const LOTO_STEPS = [
  'SHUTDOWN',
  'ISOLATE',
  'LOCK_TAG',
  'CONTROL_RESIDUAL_ENERGY',
  'VERIFY_ZERO_ENERGY',
] as const;

export type LotoStep = typeof LOTO_STEPS[number];

export interface LotoProcedureState {
  completedSteps: LotoStep[];
  rejectedActions: number;
  verified: boolean;
}

export const WORK_ORDER_STEPS = [
  'TRIGGER',
  'ACKNOWLEDGE',
  'DISPATCH',
  'EXECUTE',
  'VERIFY',
  'CLOSE_OUT',
] as const;

export type WorkOrderStep = typeof WORK_ORDER_STEPS[number];

export interface WorkOrderState {
  completedSteps: WorkOrderStep[];
  rejectedActions: number;
  closed: boolean;
}

export interface AlarmTesterConfig {
  threshold: number;
  hysteresis: number;
  delaySeconds: number;
  persistenceSamples: number;
  sampleIntervalSeconds: number;
  interlockEnabled: boolean;
}

export interface AlarmTracePoint {
  index: number;
  elapsedSeconds: number;
  value: number;
  persistenceCount: number;
  alarm: boolean;
  interlockTrip: boolean;
  reason: 'BELOW_THRESHOLD' | 'PERSISTING' | 'ALARM_SET' | 'HYSTERESIS_HOLD' | 'ALARM_RESET';
}

export interface AlarmTestResult {
  config: AlarmTesterConfig;
  trace: AlarmTracePoint[];
  alarmSetAtSeconds: number | null;
  interlockTripAtSeconds: number | null;
  structuredText: string;
}

export interface CourseCaseModule {
  id: string;
  titleZh: string;
  titleEn: string;
  evidenceTypes: string[];
  decisionFocus: string;
}

export const COURSE_CASE_LIBRARY: CourseCaseModule[] = [
  {
    id: 'CASE-SENSOR-DRIFT',
    titleZh: '風速計漂移與 Data Fault',
    titleEn: 'Anemometer drift and data fault',
    evidenceTypes: ['SCADA', 'Redundant sensor', 'Missing values'],
    decisionFocus: 'Sensor validation and confidence limits',
  },
  {
    id: 'CASE-SCADA-COMMS',
    titleZh: 'PLC／SCADA 通訊中斷',
    titleEn: 'PLC/SCADA communications outage',
    evidenceTypes: ['OPC UA quality', 'Heartbeat', 'Network event'],
    decisionFocus: 'Process fault versus communications fault',
  },
  {
    id: 'CASE-HISTORIAN-TIME',
    titleZh: 'Historian 時間同步與 Alarm flood',
    titleEn: 'Historian time synchronization and alarm flood',
    evidenceTypes: ['Timestamp offset', 'Alarm/Event', 'Sequence of events'],
    decisionFocus: 'Causal ordering under clock drift',
  },
  {
    id: 'CASE-GEARBOX-OIL',
    titleZh: 'Gearbox 潤滑、油液與內視鏡',
    titleEn: 'Gearbox lubrication, oil, and borescope',
    evidenceTypes: ['Oil debris', 'Viscosity', 'Borescope image'],
    decisionFocus: 'Triangulating condition evidence',
  },
  {
    id: 'CASE-BRAKE',
    titleZh: 'Brake 與偏航煞車',
    titleEn: 'Brake and yaw brake',
    evidenceTypes: ['Brake pressure', 'Temperature', 'Position feedback'],
    decisionFocus: 'Fail-safe stopping and residual risk',
  },
  {
    id: 'CASE-CONVERTER-COOLING',
    titleZh: '變流器與冷卻系統',
    titleEn: 'Converter and cooling system',
    evidenceTypes: ['DC-link', 'Coolant flow', 'IGBT temperature'],
    decisionFocus: 'Derating versus shutdown',
  },
  {
    id: 'CASE-SUBSEA-CABLE',
    titleZh: '海纜、海上變電站與電氣保護',
    titleEn: 'Subsea cable, offshore substation, and protection',
    evidenceTypes: ['Relay event', 'Cable temperature', 'Insulation test'],
    decisionFocus: 'Protection coordination and isolation boundary',
  },
  {
    id: 'CASE-MARINE-LOGISTICS',
    titleZh: 'CTV／SOV、Weather Window 與排程',
    titleEn: 'CTV/SOV, weather window, and scheduling',
    evidenceTypes: ['Forecast', 'Vessel capacity', 'Crew certification'],
    decisionFocus: 'Resource-constrained dispatch planning',
  },
  {
    id: 'CASE-SPARES',
    titleZh: '備品與人員排程衝突',
    titleEn: 'Spare-parts and workforce scheduling conflict',
    evidenceTypes: ['Inventory', 'Shift roster', 'Lead time'],
    decisionFocus: 'Downtime and OPEX trade-off',
  },
  {
    id: 'CASE-WO-AUTOMATION',
    titleZh: '自動 Work Order 建立失敗',
    titleEn: 'Automated work-order creation failure',
    evidenceTypes: ['CMMS audit log', 'API status', 'Dispatch queue'],
    decisionFocus: 'Fallback workflow and accountability',
  },
  {
    id: 'CASE-FALSE-ALARM',
    titleZh: '誤警報與 Alarm rationalization',
    titleEn: 'False alarm and alarm rationalization',
    evidenceTypes: ['Alarm rate', 'Deadband', 'Operator response'],
    decisionFocus: 'Threshold, hysteresis, delay, and persistence',
  },
  {
    id: 'CASE-INTERLOCK',
    titleZh: 'Interlock 測試與失效處理',
    titleEn: 'Interlock testing and failure handling',
    evidenceTypes: ['Cause/effect matrix', 'Proof test', 'Bypass log'],
    decisionFocus: 'Safe-state verification and residual risk',
  },
];

const faultFamilyForMission = (missionId: string): CourseFaultFamily => {
  const match = missionId.match(/(\d{3})$/);
  const ordinal = match ? Number(match[1]) : 1;
  if (ordinal % 3 === 1) return 'DRIVETRAIN';
  if (ordinal % 3 === 2) return 'PITCH_YAW_HYDRAULIC';
  return 'GENERATOR_ELECTRICAL';
};

const round = (value: number, digits = 1): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

/**
 * 每個 Assignment 以固定 seed 產生相同資料，讓不同學生面對可比較的工程證據。
 */
export function createMissionEngineeringPack(
  assignment: CourseAssignment,
  assignmentIndex = 0,
): MissionEngineeringPack {
  const faultFamily = faultFamilyForMission(assignment.missionId);
  const baseTime = Date.UTC(2026, 0, 5 + assignmentIndex, 0, 0, 0);
  const sampleIntervalMinutes = 10;
  const phase = (assignment.randomSeed % 17) / 10;
  const severity = 1 + Math.floor(assignmentIndex / 3) * 0.16;
  const samples = Array.from({ length: 12 }, (_, index): ScadaCmsSample => {
    const escalation = index >= 5 ? (index - 4) * severity : 0;
    const loadKw = round(4_600 + Math.sin(index / 2 + phase) * 420 - escalation * 35, 0);
    const temperatureC = round(
      (faultFamily === 'DRIVETRAIN' ? 68 : faultFamily === 'PITCH_YAW_HYDRAULIC' ? 54 : 74)
        + Math.sin(index / 3 + phase) * 1.8
        + escalation * (faultFamily === 'GENERATOR_ELECTRICAL' ? 1.4 : 1.05),
    );
    const vibrationMmS = round(
      (faultFamily === 'DRIVETRAIN' ? 3.1 : faultFamily === 'PITCH_YAW_HYDRAULIC' ? 1.8 : 2.3)
        + Math.cos(index / 3 + phase) * 0.25
        + escalation * (faultFamily === 'DRIVETRAIN' ? 0.22 : 0.09),
      2,
    );
    const missingFields: ScadaCmsSample['missingFields'] = [];
    let outputLoad: number | null = loadKw;
    let outputTemperature: number | null = temperatureC;
    let outputVibration: number | null = vibrationMmS;
    const missingIndex = 2 + (assignment.randomSeed % 5);
    if (index === missingIndex) {
      const field = assignment.randomSeed % 3;
      if (field === 0) {
        outputLoad = null;
        missingFields.push('loadKw');
      } else if (field === 1) {
        outputTemperature = null;
        missingFields.push('temperatureC');
      } else {
        outputVibration = null;
        missingFields.push('vibrationMmS');
      }
    }
    return {
      timestamp: new Date(baseTime + index * sampleIntervalMinutes * 60_000).toISOString(),
      loadKw: outputLoad,
      temperatureC: outputTemperature,
      vibrationMmS: outputVibration,
      alarm: index === 8 ? `${faultFamily}_WARNING` : index === 10 ? `${faultFamily}_HIGH` : null,
      event: index === missingIndex
        ? 'QUALITY_BAD'
        : index === 5
          ? 'CONDITION_DEVIATION_DETECTED'
          : index === 11
            ? 'OPERATOR_ACKNOWLEDGED'
            : null,
      missingFields,
    };
  });
  const failures = 1 + Math.floor(assignmentIndex / 5);
  const unplannedDowntimeHours = round(8 + assignmentIndex * 1.7, 1);
  const repairHours = round(unplannedDowntimeHours * 0.72, 1);
  return {
    schemaVersion: 1,
    assignmentId: assignment.id,
    missionId: assignment.missionId,
    randomSeed: assignment.randomSeed,
    faultFamily,
    sampleIntervalMinutes,
    samples,
    reliabilityInput: {
      periodHours: 720,
      plannedMaintenanceHours: 12 + (assignmentIndex % 3) * 2,
      unplannedDowntimeHours,
      repairHours,
      failures,
      lostProductionMWh: round(unplannedDowntimeHours * 4.2, 1),
      electricityPricePerMWh: 105,
      laborCost: 18_000 + assignmentIndex * 1_250,
      partsCost: 24_000 + assignmentIndex * 3_500,
      vesselCost: 35_000 + assignmentIndex * 2_000,
    },
  };
}

export function calculateReliabilityKpis(input: ReliabilityInput): ReliabilityKpis {
  const observableHours = Math.max(0, input.periodHours - input.plannedMaintenanceHours);
  const downtimeHours = Math.min(observableHours, Math.max(0, input.unplannedDowntimeHours));
  const uptimeHours = Math.max(0, observableHours - downtimeHours);
  const failures = Math.max(0, Math.trunc(input.failures));
  const lostRevenue = Math.max(0, input.lostProductionMWh) * Math.max(0, input.electricityPricePerMWh);
  return {
    observableHours: round(observableHours, 2),
    uptimeHours: round(uptimeHours, 2),
    availabilityPercent: observableHours > 0 ? round((uptimeHours / observableHours) * 100, 2) : 0,
    mtbfHours: failures > 0 ? round(uptimeHours / failures, 2) : 0,
    mttrHours: failures > 0 ? round(Math.max(0, input.repairHours) / failures, 2) : 0,
    downtimeHours: round(downtimeHours, 2),
    lostRevenue: round(lostRevenue, 2),
    opex: round(
      lostRevenue
      + Math.max(0, input.laborCost)
      + Math.max(0, input.partsCost)
      + Math.max(0, input.vesselCost),
      2,
    ),
  };
}

export function createLotoProcedure(): LotoProcedureState {
  return { completedSteps: [], rejectedActions: 0, verified: false };
}

export function performLotoStep(state: LotoProcedureState, step: LotoStep): LotoProcedureState {
  const expected = LOTO_STEPS[state.completedSteps.length];
  if (!expected || expected !== step) {
    return { ...state, rejectedActions: state.rejectedActions + 1 };
  }
  const completedSteps = [...state.completedSteps, step];
  return {
    completedSteps,
    rejectedActions: state.rejectedActions,
    verified: completedSteps.length === LOTO_STEPS.length,
  };
}

export function createWorkOrder(): WorkOrderState {
  return { completedSteps: [], rejectedActions: 0, closed: false };
}

export function performWorkOrderStep(state: WorkOrderState, step: WorkOrderStep): WorkOrderState {
  const expected = WORK_ORDER_STEPS[state.completedSteps.length];
  if (!expected || expected !== step) {
    return { ...state, rejectedActions: state.rejectedActions + 1 };
  }
  const completedSteps = [...state.completedSteps, step];
  return {
    completedSteps,
    rejectedActions: state.rejectedActions,
    closed: completedSteps.length === WORK_ORDER_STEPS.length,
  };
}

function generateStructuredText(config: AlarmTesterConfig): string {
  return [
    '(* IEC 61131-3 ST reference logic generated by OWM Course Mode *)',
    `HighCondition := ProcessValue >= ${config.threshold.toFixed(1)};`,
    `ResetCondition := ProcessValue <= ${(config.threshold - config.hysteresis).toFixed(1)};`,
    `PersistCounter(IN := HighCondition, PV := ${Math.max(1, Math.trunc(config.persistenceSamples))});`,
    `AlarmDelay(IN := PersistCounter.Q, PT := T#${Math.max(0, Math.trunc(config.delaySeconds))}s);`,
    'IF ResetCondition THEN',
    '  AlarmActive := FALSE;',
    'ELSIF AlarmDelay.Q THEN',
    '  AlarmActive := TRUE;',
    'END_IF;',
    `InterlockTrip := AlarmActive AND ${config.interlockEnabled ? 'TRUE' : 'FALSE'};`,
  ].join('\n');
}

export function runAlarmTest(values: number[], input: AlarmTesterConfig): AlarmTestResult {
  const config: AlarmTesterConfig = {
    threshold: Number.isFinite(input.threshold) ? input.threshold : 0,
    hysteresis: Math.max(0, Number.isFinite(input.hysteresis) ? input.hysteresis : 0),
    delaySeconds: Math.max(0, Math.trunc(input.delaySeconds)),
    persistenceSamples: Math.max(1, Math.trunc(input.persistenceSamples)),
    sampleIntervalSeconds: Math.max(1, Math.trunc(input.sampleIntervalSeconds)),
    interlockEnabled: input.interlockEnabled,
  };
  let persistenceCount = 0;
  let persistenceStartedAt: number | null = null;
  let alarm = false;
  let alarmSetAtSeconds: number | null = null;
  let interlockTripAtSeconds: number | null = null;
  const trace = values.map((value, index): AlarmTracePoint => {
    const elapsedSeconds = index * config.sampleIntervalSeconds;
    let reason: AlarmTracePoint['reason'];
    if (alarm && value <= config.threshold - config.hysteresis) {
      alarm = false;
      persistenceCount = 0;
      persistenceStartedAt = null;
      reason = 'ALARM_RESET';
    } else if (alarm) {
      reason = 'HYSTERESIS_HOLD';
    } else if (value >= config.threshold) {
      persistenceCount += 1;
      if (persistenceStartedAt === null) persistenceStartedAt = elapsedSeconds;
      const persistedSeconds = elapsedSeconds - persistenceStartedAt;
      if (persistenceCount >= config.persistenceSamples && persistedSeconds >= config.delaySeconds) {
        alarm = true;
        alarmSetAtSeconds ??= elapsedSeconds;
        reason = 'ALARM_SET';
      } else {
        reason = 'PERSISTING';
      }
    } else {
      persistenceCount = 0;
      persistenceStartedAt = null;
      reason = 'BELOW_THRESHOLD';
    }
    const interlockTrip = alarm && config.interlockEnabled;
    if (interlockTrip) interlockTripAtSeconds ??= elapsedSeconds;
    return {
      index,
      elapsedSeconds,
      value,
      persistenceCount,
      alarm,
      interlockTrip,
      reason,
    };
  });
  return {
    config,
    trace,
    alarmSetAtSeconds,
    interlockTripAtSeconds,
    structuredText: generateStructuredText(config),
  };
}
