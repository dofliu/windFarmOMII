import { useMemo, useState } from 'react';
import type { CourseAssignment } from '../domain/course';
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
  type LotoProcedureState,
  type LotoStep,
  type WorkOrderState,
  type WorkOrderStep,
} from '../domain/courseEngineering';
import type { Language } from '../domain/types';

type LabTab = 'data' | 'procedures' | 'control' | 'cases';

const defaultAlarmConfig: AlarmTesterConfig = {
  threshold: 72,
  hysteresis: 3,
  delaySeconds: 10,
  persistenceSamples: 3,
  sampleIntervalSeconds: 5,
  interlockEnabled: true,
};

const sampleSignal = [68, 71, 72.5, 74, 76, 75, 73, 70, 68];

export function CourseEngineeringLab({
  language,
  assignments,
  onLotoVerified,
  onWorkOrderCreated,
}: {
  language: Language;
  assignments: CourseAssignment[];
  onLotoVerified?: (assignment: CourseAssignment, state: LotoProcedureState) => void;
  onWorkOrderCreated?: (assignment: CourseAssignment, state: WorkOrderState) => void;
}) {
  const isZh = language === 'zh';
  const [tab, setTab] = useState<LabTab>('data');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id ?? '');
  const assignment = assignments.find((item) => item.id === selectedAssignmentId) ?? assignments[0];
  // 資料包內容以週次編號為鍵，不用陣列位置：教師只解鎖部分週次或調整 config 順序時，各週答案不變。
  const packIndex = assignment ? Math.max(0, Number.parseInt(assignment.weekId.slice(1), 10) - 1) : 0;
  const pack = useMemo(
    () => assignment ? createMissionEngineeringPack(assignment, packIndex) : null,
    [assignment, packIndex],
  );
  const kpis = useMemo(
    () => pack ? calculateReliabilityKpis(pack.reliabilityInput) : null,
    [pack],
  );
  const [loto, setLoto] = useState(createLotoProcedure);
  const [workOrder, setWorkOrder] = useState(createWorkOrder);
  const [alarmConfig, setAlarmConfig] = useState(defaultAlarmConfig);
  const alarmResult = useMemo(() => runAlarmTest(sampleSignal, alarmConfig), [alarmConfig]);

  if (!assignment || !pack || !kpis) {
    return (
      <section className="course-engineering-lab" data-testid="course-engineering-lab">
        <header className="course-lab-heading">
          <div>
            <span className="section-kicker">ENGINEERING LAB · CLO ALIGNMENT</span>
            <b>{isZh ? 'SCADA／CMS 證據、可靠度、程序安全與控制邏輯' : 'SCADA/CMS evidence, reliability, procedural safety, and control logic'}</b>
          </div>
        </header>
        <p data-testid="course-lab-empty">
          {isZh ? '尚未開放任何週次；資料包將於教師解鎖後提供。' : 'No week is unlocked yet; data packs appear after the instructor releases a week.'}
        </p>
      </section>
    );
  }

  const resetProcedures = () => {
    setLoto(createLotoProcedure());
    setWorkOrder(createWorkOrder());
  };

  const changeAssignment = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    resetProcedures();
  };

  // 事件在 updater 之外觸發：StrictMode 重複執行 updater 時不會重複記錄。
  const applyLoto = (step: LotoStep) => {
    const next = performLotoStep(loto, step);
    setLoto(next);
    if (!loto.verified && next.verified) onLotoVerified?.(assignment, next);
  };

  // Work Order 事件只在 CLOSE_OUT 完成時寫入，並帶實際完成步驟與違序次數（不再於 TRIGGER 就記成完整六階段）。
  const applyWorkOrder = (step: WorkOrderStep) => {
    const next = performWorkOrderStep(workOrder, step);
    setWorkOrder(next);
    if (!workOrder.closed && next.closed) onWorkOrderCreated?.(assignment, next);
  };

  return (
    <section className="course-engineering-lab" data-testid="course-engineering-lab">
      <header className="course-lab-heading">
        <div>
          <span className="section-kicker">ENGINEERING LAB · CLO ALIGNMENT</span>
          <b>{isZh ? 'SCADA／CMS 證據、可靠度、程序安全與控制邏輯' : 'SCADA/CMS evidence, reliability, procedural safety, and control logic'}</b>
          <small className="course-data-provenance" data-testid="course-data-provenance">
            {isZh
              ? 'SYNTHETIC／GAMEPLAY ABSTRACTION · 固定 seed 產生的教學資料，非現場量測資料'
              : 'SYNTHETIC / GAMEPLAY ABSTRACTION · Fixed-seed training data, not field measurements'}
          </small>
        </div>
        <label>
          <span>{isZh ? '固定任務資料包' : 'Fixed mission data pack'}</span>
          <select
            data-testid="course-lab-assignment"
            value={assignment.id}
            onChange={(event) => changeAssignment(event.target.value)}
          >
            {assignments.map((item) => (
              <option key={item.id} value={item.id}>{item.weekId} · {item.missionId} · {isZh ? item.titleZh : item.titleEn}</option>
            ))}
          </select>
        </label>
      </header>

      <nav className="course-lab-tabs" aria-label="Course engineering lab">
        {([
          ['data', isZh ? 'SCADA／KPI' : 'SCADA/KPI'],
          ['procedures', isZh ? 'LOTO／Work Order' : 'LOTO/Work Order'],
          ['control', isZh ? 'Alarm／Interlock' : 'Alarm/Interlock'],
          ['cases', isZh ? '延伸案例庫' : 'Case library'],
        ] as Array<[LabTab, string]>).map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-testid={`course-lab-tab-${id}`}
            className={tab === id ? 'active' : ''}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'data' && (
        <div className="course-lab-data" data-testid="course-lab-data">
          <div className="course-data-meta">
            <span><small>MISSION</small><b>{pack.missionId}</b></span>
            <span><small>FAULT FAMILY</small><b>{pack.faultFamily}</b></span>
            <span><small>FIXED SEED</small><b>{pack.randomSeed}</b></span>
            <span><small>INTERVAL</small><b>{pack.sampleIntervalMinutes} min</b></span>
          </div>
          <div className="course-scada-table-wrap">
            <table className="course-scada-table">
              <thead>
                <tr>
                  <th>Timestamp</th><th>Load kW</th><th>Temp °C</th><th>Vibration mm/s</th><th>Alarm</th><th>Event</th>
                </tr>
              </thead>
              <tbody>
                {pack.samples.map((sample) => (
                  <tr key={sample.timestamp} className={sample.missingFields.length ? 'missing' : ''}>
                    <td>{sample.timestamp.slice(0, 16).replace('T', ' ')}</td>
                    <td>{sample.loadKw ?? '—'}</td>
                    <td>{sample.temperatureC ?? '—'}</td>
                    <td>{sample.vibrationMmS ?? '—'}</td>
                    <td>{sample.alarm ?? '—'}</td>
                    <td>{sample.event ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="course-kpi-grid" data-testid="course-kpi-grid">
            <KpiCard label="Availability" value={`${kpis.availabilityPercent}%`} formula="Uptime ÷ observable hours" />
            <KpiCard label="MTBF" value={`${kpis.mtbfHours} h`} formula="Uptime ÷ failures" />
            <KpiCard label="MTTR" value={`${kpis.mttrHours} h`} formula="Repair hours ÷ failures" />
            <KpiCard label="Downtime" value={`${kpis.downtimeHours} h`} formula="Unplanned unavailable hours" />
            <KpiCard label="OPEX" value={`$${Math.round(kpis.opex).toLocaleString('en-US')}`} formula="Lost revenue + labor + parts + vessel" />
          </div>
          <details className="course-kpi-derivation">
            <summary>{isZh ? '顯示計算輸入與推導' : 'Show calculation inputs and derivation'}</summary>
            <code>
              Observable = {pack.reliabilityInput.periodHours} − {pack.reliabilityInput.plannedMaintenanceHours} = {kpis.observableHours} h{'\n'}
              Uptime = {kpis.observableHours} − {pack.reliabilityInput.unplannedDowntimeHours} = {kpis.uptimeHours} h{'\n'}
              Availability = {kpis.uptimeHours} ÷ {kpis.observableHours} × 100 = {kpis.availabilityPercent}%{'\n'}
              OPEX = lost revenue {kpis.lostRevenue} + labor {pack.reliabilityInput.laborCost} + parts {pack.reliabilityInput.partsCost} + vessel {pack.reliabilityInput.vesselCost} = {kpis.opex}
            </code>
          </details>
        </div>
      )}

      {tab === 'procedures' && (
        <div className="course-procedure-grid" data-testid="course-lab-procedures">
          <ProcedureCard
            title="LOTO"
            subtitle={isZh ? '必須依序完成，最後執行零能量驗證' : 'Complete in order and finish with zero-energy verification'}
            steps={LOTO_STEPS}
            completed={loto.completedSteps}
            rejected={loto.rejectedActions}
            finished={loto.verified}
            onStep={(step) => applyLoto(step as LotoStep)}
          />
          <ProcedureCard
            title="WORK ORDER"
            subtitle={isZh ? 'Trigger → Acknowledge → Dispatch → Execute → Verify → Close-out' : 'Trigger → Acknowledge → Dispatch → Execute → Verify → Close-out'}
            steps={WORK_ORDER_STEPS}
            completed={workOrder.completedSteps}
            rejected={workOrder.rejectedActions}
            finished={workOrder.closed}
            onStep={(step) => applyWorkOrder(step as WorkOrderStep)}
          />
          <button type="button" className="course-procedure-reset" data-testid="course-procedure-reset" onClick={resetProcedures}>
            {isZh ? '重設程序練習' : 'Reset procedure practice'}
          </button>
        </div>
      )}

      {tab === 'control' && (
        <div className="course-control-tester" data-testid="course-control-tester">
          <div className="course-control-inputs">
            <NumberControl label="Threshold" value={alarmConfig.threshold} onChange={(threshold) => setAlarmConfig((current) => ({ ...current, threshold }))} />
            <NumberControl label="Hysteresis" value={alarmConfig.hysteresis} min={0} onChange={(hysteresis) => setAlarmConfig((current) => ({ ...current, hysteresis }))} />
            <NumberControl label="Delay (s)" value={alarmConfig.delaySeconds} min={0} onChange={(delaySeconds) => setAlarmConfig((current) => ({ ...current, delaySeconds }))} />
            <NumberControl label="Persistence" value={alarmConfig.persistenceSamples} min={1} onChange={(persistenceSamples) => setAlarmConfig((current) => ({ ...current, persistenceSamples }))} />
            <label className="course-interlock-toggle">
              <input
                type="checkbox"
                checked={alarmConfig.interlockEnabled}
                onChange={(event) => setAlarmConfig((current) => ({ ...current, interlockEnabled: event.target.checked }))}
              />
              <span>Interlock enabled</span>
            </label>
          </div>
          <div className="course-control-results">
            <div className="course-trace">
              {alarmResult.trace.map((point) => (
                <span key={point.index} className={point.interlockTrip ? 'trip' : point.alarm ? 'alarm' : ''}>
                  <small>t+{point.elapsedSeconds}s</small>
                  <b>{point.value}</b>
                  <i>P{point.persistenceCount} · {point.reason}</i>
                </span>
              ))}
            </div>
            <div className="course-trip-result">
              <span>ALARM SET <b>{alarmResult.alarmSetAtSeconds === null ? 'NO' : `t+${alarmResult.alarmSetAtSeconds}s`}</b></span>
              <span>INTERLOCK <b>{alarmResult.interlockTripAtSeconds === null ? 'NO TRIP' : `TRIP t+${alarmResult.interlockTripAtSeconds}s`}</b></span>
            </div>
            <pre data-testid="course-generated-st"><code>{alarmResult.structuredText}</code></pre>
          </div>
        </div>
      )}

      {tab === 'cases' && (
        <div className="course-case-library" data-testid="course-case-library">
          {COURSE_CASE_LIBRARY.map((module) => (
            <article key={module.id}>
              <span>{module.id}</span>
              <b>{isZh ? module.titleZh : module.titleEn}</b>
              <small>{module.evidenceTypes.join(' · ')}</small>
              <p>{module.decisionFocus}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function KpiCard({ label, value, formula }: { label: string; value: string; formula: string }) {
  return <article><span>{label}</span><b>{value}</b><small>{formula}</small></article>;
}

function ProcedureCard({
  title,
  subtitle,
  steps,
  completed,
  rejected,
  finished,
  onStep,
}: {
  title: string;
  subtitle: string;
  steps: readonly string[];
  completed: readonly string[];
  rejected: number;
  finished: boolean;
  onStep: (step: string) => void;
}) {
  const expected = steps[completed.length];
  return (
    <article className={`course-procedure-card${finished ? ' finished' : ''}`}>
      <header>
        <div><span>{title}</span><small>{subtitle}</small></div>
        <b>{completed.length}/{steps.length}</b>
      </header>
      <div className="course-procedure-steps">
        {steps.map((step, index) => {
          const done = completed.includes(step);
          return (
            <button
              type="button"
              key={step}
              data-testid={`course-procedure-${title.toLowerCase().replaceAll(' ', '-')}-${step.toLowerCase().replaceAll('_', '-')}`}
              className={done ? 'done' : expected === step ? 'next' : ''}
              disabled={done || finished}
              onClick={() => onStep(step)}
            >
              <i>{done ? '✓' : index + 1}</i>
              <span>{step.replaceAll('_', ' ')}</span>
            </button>
          );
        })}
      </div>
      <footer><span>Rejected out-of-order actions: {rejected}</span><b>{finished ? 'VERIFIED' : `NEXT · ${expected?.replaceAll('_', ' ') ?? '—'}`}</b></footer>
    </article>
  );
}

function NumberControl({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <input type="number" value={value} min={min} step="1" onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
