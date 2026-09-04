import { useEffect, useMemo, useState } from 'react';
import {
  type CourseEventKind,
  canStartCourseAttempt,
  courseRecordBlockingAttempt,
  generateAnonymousLearnerCode,
  isCourseRecordExportReady,
  normalizeLearnerCode,
  unlockedCourseAssignments,
  type CourseAssignment,
  type CourseConfig,
  type CourseEventActor,
  type CourseEventContext,
  type CoursePlatform,
  type CourseRecord,
  type CourseStudentExplanation,
} from '../domain/course';
import type { GameDatabase, Language } from '../domain/types';
import { CourseEngineeringLab } from './CourseEngineeringLab';

export function CourseModePanel({
  language,
  database,
  config,
  record,
  onStartPractice,
  onStartAssessment,
  onUpdateExplanation,
  onExport,
  onReset,
  onRecordEvent,
}: {
  language: Language;
  database: GameDatabase;
  config: CourseConfig;
  record: CourseRecord | null;
  onStartPractice: () => void;
  onStartAssessment: (learnerCode: string, platform: CoursePlatform, assignment: CourseAssignment) => void;
  onUpdateExplanation: (explanation: Partial<CourseStudentExplanation>) => void;
  onExport: () => void;
  onReset: () => void;
  onRecordEvent: (
    kind: CourseEventKind,
    details: Record<string, unknown>,
    provenance: { context: CourseEventContext; actor: CourseEventActor },
  ) => void;
}) {
  const isZh = language === 'zh';
  const [learnerCode, setLearnerCode] = useState(record?.learnerCode ?? '');
  const [platform, setPlatform] = useState<CoursePlatform>(record?.platform ?? 'desktop');
  const availableAssignments = useMemo(() => unlockedCourseAssignments(config), [config]);
  const activeAttempt = courseRecordBlockingAttempt(record) ?? record?.attempts.at(-1);
  const activeAssignment = config.assignments.find((assignment) => assignment.id === activeAttempt?.assignmentId);
  const normalizedCode = normalizeLearnerCode(learnerCode);
  const recordReusable = !record || (
    record.integrityOrigin === 'native_v2'
    && record.releaseVersion === config.releaseVersion
    && record.configVersion === config.configVersion
    && record.courseCode === config.courseCode
    && record.learnerCode === normalizedCode
    && record.platform === platform
  );
  const exportReady = isCourseRecordExportReady(record) && recordReusable;
  const assessmentStartReady = canStartCourseAttempt(record) && recordReusable;
  const recordWritable = Boolean(record && recordReusable);

  useEffect(() => {
    if (record?.learnerCode) setLearnerCode(record.learnerCode);
    if (record?.platform) setPlatform(record.platform);
  }, [record?.learnerCode, record?.platform]);

  return (
    <section
      className="course-mode-shell"
      data-testid="course-mode-screen"
      data-course-version={config.releaseVersion}
      data-course-config-version={config.configVersion}
      data-course-frozen={config.frozen ? 'true' : 'false'}
    >
      <header className="course-mode-heading">
        <div>
          <span className="section-kicker">COURSE MODE · {config.term}</span>
          <h2>{isZh ? '離岸風電運維課程模式' : 'Offshore wind O&M course mode'}</h2>
          <p>{isZh
            ? '練習導覽與 Assessment 完全分流；Assessment 不顯示 REC／GUIDE，且只保存匿名學習紀錄。'
            : 'Guided practice and Assessment are separate. Assessment hides REC/GUIDE and stores anonymous learning records only.'}</p>
        </div>
        <div className="course-release-badge">
          <strong>{config.releaseVersion}</strong>
          <span>{config.frozen ? (isZh ? '學期凍結版' : 'SEMESTER FREEZE') : (isZh ? '開發版' : 'DEVELOPMENT')}</span>
          <small>{config.courseCode} · {config.configVersion}</small>
        </div>
      </header>

      <div className="course-path-grid">
        <article className="course-path-card practice" data-testid="course-guided-practice-card">
          <span>01 · GUIDED PRACTICE</span>
          <b>{isZh ? '有導覽的標準練習' : 'Standard guided practice'}</b>
          <p>{isZh
            ? '可使用教學提示，不建立 Assessment Course Record。'
            : 'Teaching prompts are available and no Assessment Course Record is created.'}</p>
          <button type="button" data-testid="course-start-practice" onClick={onStartPractice}>
            {isZh ? '開始練習導覽' : 'Start guided practice'}
          </button>
        </article>

        <article className="course-path-card assessment" data-testid="course-assessment-card">
          <span>02 · ASSESSMENT</span>
          <b>{isZh ? '固定條件的工程判斷' : 'Fixed-condition engineering judgment'}</b>
          <p>{isZh
            ? '任務、角色、裝備、船舶與 seed 固定；REC／GUIDE 完全停用。'
            : 'Mission, crew, equipment, vessel, and seed are fixed; REC/GUIDE are disabled.'}</p>
          <div className="course-policy-chips">
            <i>NO REC</i><i>NO GUIDE</i><i>ANONYMOUS</i><i>FIXED SEED</i>
          </div>
        </article>
      </div>

      <section className="course-identity-panel">
        <div>
          <span className="section-kicker">ANONYMOUS ACCESS</span>
          <b>{isZh ? '匿名代碼' : 'Anonymous learner code'}</b>
          <small>{isZh ? '請勿輸入姓名、Email 或學號。' : 'Do not enter a name, email, or student ID.'}</small>
        </div>
        <label>
          <span>{isZh ? '代碼' : 'Code'}</span>
          <input
            data-testid="course-learner-code"
            value={learnerCode}
            maxLength={24}
            disabled={Boolean(record)}
            onChange={(event) => setLearnerCode(event.target.value)}
            placeholder="OWM-7A2C-91F0"
          />
        </label>
        <button
          type="button"
          className="course-generate-code"
          data-testid="course-generate-code"
          disabled={Boolean(record)}
          onClick={() => setLearnerCode(generateAnonymousLearnerCode())}
        >
          {isZh ? '一鍵產生匿名代碼' : 'Generate anonymous code'}
        </button>
        <label>
          <span>{isZh ? '裝置' : 'Device'}</span>
          <select data-testid="course-platform" value={platform} disabled={Boolean(record)} onChange={(event) => setPlatform(event.target.value as CoursePlatform)}>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>
        </label>
      </section>

      <section className="course-week-panel">
        <header>
          <div>
            <span className="section-kicker">TEACHER-CONTROLLED RELEASE</span>
            <b>{isZh ? '每週任務由教師手動解鎖' : 'Weekly assignments are unlocked manually by the instructor'}</b>
          </div>
          <strong data-testid="course-unlocked-count">{availableAssignments.length}/{config.assignments.length} {isZh ? '已開放' : 'OPEN'}</strong>
        </header>
        <div className="course-assignment-list" data-testid="course-assignment-list">
          {config.assignments.map((assignment) => {
            const unlocked = config.unlockedWeekIds.includes(assignment.weekId);
            const mission = database.missionById.get(assignment.missionId);
            const team = assignment.teamIds.map((id) => database.characterById.get(id)).filter(Boolean);
            const equipment = database.equipmentById.get(assignment.equipmentId);
            const spare = database.equipmentById.get(assignment.spareId);
            const vessel = database.vesselById.get(assignment.vesselId);
            const attempts = record?.attempts.filter((attempt) => attempt.assignmentId === assignment.id).length ?? 0;
            return (
              <article
                key={assignment.id}
                className={`course-assignment-card${unlocked ? ' unlocked' : ' locked'}`}
                data-testid={`course-assignment-${assignment.weekId}`}
                data-course-unlocked={unlocked ? 'true' : 'false'}
              >
                <div>
                  <span>{assignment.weekId} · {assignment.missionId}</span>
                  <b>{isZh ? assignment.titleZh : assignment.titleEn}</b>
                  <small>{mission ? (isZh ? mission.titleZh : mission.titleEn) : assignment.missionId}</small>
                </div>
                <ul>
                  <li>{team.map((character) => isZh ? character!.professionZh : character!.professionEn).join(' · ')}</li>
                  <li>{equipment ? (isZh ? equipment.nameZh : equipment.nameEn) : assignment.equipmentId}</li>
                  <li>{spare ? (isZh ? spare.nameZh : spare.nameEn) : assignment.spareId} · {vessel ? vessel.class : assignment.vesselId}</li>
                  <li>SEED {assignment.randomSeed} · {isZh ? `嘗試 ${attempts}` : `${attempts} ATTEMPTS`}</li>
                </ul>
                <button
                  type="button"
                  data-testid={`course-start-assessment-${assignment.weekId}`}
                  disabled={!unlocked || !normalizedCode || !assessmentStartReady}
                  title={!assessmentStartReady
                    ? (isZh ? '請先完成目前 Assessment 與四欄 Debrief，或重設未完成紀錄。' : 'Complete the current Assessment and four-field Debrief, or reset the incomplete record.')
                    : undefined}
                  onClick={() => onStartAssessment(normalizedCode, platform, assignment)}
                >
                  {unlocked && !assessmentStartReady
                    ? (isZh ? '先完成目前 Assessment' : 'FINISH CURRENT ASSESSMENT')
                    : unlocked
                    ? (attempts > 0 ? (isZh ? '重做 Assessment' : 'Replay Assessment') : (isZh ? '開始 Assessment' : 'Start Assessment'))
                    : (isZh ? '尚未開放' : 'LOCKED')}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <CourseEngineeringLab
        language={language}
        assignments={availableAssignments}
        onLotoVerified={(assignment) => onRecordEvent('LOTO_VERIFIED', {
          assignmentId: assignment.id,
          missionId: assignment.missionId,
          source: 'COURSE_ENGINEERING_LAB',
          procedure: ['SHUTDOWN', 'ISOLATE', 'LOCK_TAG', 'CONTROL_RESIDUAL_ENERGY', 'VERIFY_ZERO_ENERGY'],
        }, { context: 'practice_lab', actor: 'learner' })}
        onWorkOrderCreated={(assignment) => onRecordEvent('WORK_ORDER_CREATED', {
          assignmentId: assignment.id,
          missionId: assignment.missionId,
          source: 'COURSE_ENGINEERING_LAB',
          trigger: 'TRIGGER',
          procedureReference: ['TRIGGER', 'ACKNOWLEDGE', 'DISPATCH', 'EXECUTE', 'VERIFY', 'CLOSE_OUT'],
        }, { context: 'practice_lab', actor: 'learner' })}
      />

      {record && (
        <section className="course-record-panel" data-testid="course-record-panel">
          <header>
            <div>
              <span className="section-kicker">LEARNING RECORD</span>
              <b>{record.learnerCode} · {record.attempts.length} {isZh ? '次嘗試' : 'ATTEMPTS'}</b>
              <small>{activeAssignment ? `${activeAssignment.weekId} · ${activeAssignment.missionId}` : (isZh ? '尚未開始任務' : 'No active assignment')}</small>
            </div>
            <div>
              <button
                type="button"
                data-testid="course-export-record"
                disabled={!exportReady}
                title={!exportReady
                  ? (isZh ? '所有 Assessment 必須完成結算與四欄 Debrief 後才能匯出。' : 'Complete settlement and all four Debrief fields for every Assessment before export.')
                  : undefined}
                onClick={onExport}
              >
                {!exportReady
                  ? (isZh ? '完成 Assessment 與 Debrief 後匯出' : 'Complete Assessment and Debrief to export')
                  : (isZh ? '匯出 Course Record' : 'Export Course Record')}
              </button>
              <button type="button" className="course-reset-button" data-testid="course-reset" onClick={onReset}>{isZh ? '一鍵重設課程進度' : 'One-click course reset'}</button>
            </div>
          </header>
          <div className="course-record-grid">
            <div className="course-event-stream" data-testid="course-event-stream">
              {record.events.slice(-10).reverse().map((event) => (
                <span key={event.sequence}><i>#{event.sequence}</i><b>{event.kind}</b><small>{event.missionId ?? 'COURSE'}</small></span>
              ))}
            </div>
            {activeAttempt && (
              <div className="course-attempt-summary">
                <span><small>ATTEMPT</small><b>#{activeAttempt.attemptNumber}</b></span>
                <span><small>HINTS</small><b>{activeAttempt.hintUsedCount}</b></span>
                <span><small>SCORE</small><b>{activeAttempt.scores ? `${activeAttempt.scores.grade} · ${activeAttempt.scores.total}` : 'PENDING'}</b></span>
                <span><small>DECISIONS</small><b>{activeAttempt.decisionOrder.length}</b></span>
              </div>
            )}
          </div>
          {record.integrityOrigin !== 'native_v2' && (
            <p className="course-integrity-warning" data-testid="course-integrity-warning">
              {record.integrityOrigin === 'migrated_v1'
                ? (isZh
                    ? 'LEGACY RECORD · 舊 v1 紀錄僅供歷史查閱；請重設並重新完成 Assessment，才能產生 v2 schema 證據。'
                    : 'LEGACY RECORD · This v1 migration is historical only. Reset and complete a new Assessment for v2 schema evidence.')
                : (isZh
                    ? 'INVALID RECORD · provenance 不完整或資料損壞；本紀錄不可作 schema 證據，請重設後重新完成 Assessment。'
                    : 'INVALID RECORD · Provenance is incomplete or corrupted. Reset and complete a new Assessment for schema evidence.')}
            </p>
          )}
          {activeAttempt?.completedAt && (
            <div className="course-reflection" data-testid="course-reflection">
              <b>{isZh ? '學生說明：結論／證據／不確定性／殘餘風險' : 'Student explanation: conclusion / evidence / uncertainty / residual risk'}</b>
               <ReflectionField testId="course-explanation-conclusion" label={isZh ? '結論' : 'Conclusion'} value={activeAttempt.studentExplanation.conclusion} disabled={!recordWritable} onChange={(conclusion) => onUpdateExplanation({ conclusion })} />
               <ReflectionField testId="course-explanation-evidence" label={isZh ? '證據' : 'Evidence'} value={activeAttempt.studentExplanation.evidence} disabled={!recordWritable} onChange={(evidence) => onUpdateExplanation({ evidence })} />
               <ReflectionField testId="course-explanation-uncertainty" label={isZh ? '不確定性' : 'Uncertainty'} value={activeAttempt.studentExplanation.uncertainty} disabled={!recordWritable} onChange={(uncertainty) => onUpdateExplanation({ uncertainty })} />
               <ReflectionField testId="course-explanation-residual-risk" label={isZh ? '殘餘風險' : 'Residual risk'} value={activeAttempt.studentExplanation.residualRisk} disabled={!recordWritable} onChange={(residualRisk) => onUpdateExplanation({ residualRisk })} />
            </div>
          )}
        </section>
      )}
    </section>
  );
}

function ReflectionField({
  testId,
  label,
  value,
  disabled,
  onChange,
}: {
  testId: string;
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <textarea data-testid={testId} value={value} maxLength={4000} disabled={disabled} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
