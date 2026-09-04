import { useEffect, useMemo, useState } from 'react';
import {
  type CourseEventKind,
  LEARNER_CODE_PATTERN,
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
  const [resetArmed, setResetArmed] = useState(false);
  const [codeSwitchArmedId, setCodeSwitchArmedId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [labExpanded, setLabExpanded] = useState(false);
  const availableAssignments = useMemo(() => unlockedCourseAssignments(config), [config]);
  const selectedAssignment = availableAssignments.find((assignment) => assignment.id === selectedAssignmentId)
    ?? availableAssignments.at(-1);
  const activeAttempt = courseRecordBlockingAttempt(record) ?? record?.attempts.at(-1);
  const activeAssignment = config.assignments.find((assignment) => assignment.id === activeAttempt?.assignmentId);
  const selectedMission = selectedAssignment ? database.missionById.get(selectedAssignment.missionId) : undefined;
  const selectedTeam = selectedAssignment
    ? selectedAssignment.teamIds.map((id) => database.characterById.get(id)).filter(Boolean)
    : [];
  const selectedEquipment = selectedAssignment ? database.equipmentById.get(selectedAssignment.equipmentId) : undefined;
  const selectedSpare = selectedAssignment ? database.equipmentById.get(selectedAssignment.spareId) : undefined;
  const selectedVessel = selectedAssignment ? database.vesselById.get(selectedAssignment.vesselId) : undefined;
  const selectedAttempts = selectedAssignment
    ? record?.attempts.filter((attempt) => attempt.assignmentId === selectedAssignment.id) ?? []
    : [];
  const selectedLatestAttempt = selectedAttempts.at(-1);
  const selectedExplanationReady = Boolean(selectedLatestAttempt?.completedAt && Object.values(selectedLatestAttempt.studentExplanation).every((value) => value.trim()));
  const normalizedCode = normalizeLearnerCode(learnerCode);
  const recordLineageValid = !record || (
    record.integrityOrigin === 'native_v2'
    && record.releaseVersion === config.releaseVersion
    && record.courseCode === config.courseCode
  );
  const codeMismatch = Boolean(record && normalizedCode && record.learnerCode !== normalizedCode);
  const learnerCodeValid = LEARNER_CODE_PATTERN.test(normalizedCode);
  const exportReady = isCourseRecordExportReady(record) && recordLineageValid;
  const assessmentStartReady = recordLineageValid && (
    !record || (codeMismatch ? exportReady : canStartCourseAttempt(record))
  );
  const recordWritable = Boolean(record && recordLineageValid && !codeMismatch);

  useEffect(() => {
    if (record?.learnerCode) setLearnerCode(record.learnerCode);
    if (record?.platform) setPlatform(record.platform);
  }, [record?.learnerCode, record?.platform]);

  useEffect(() => {
    setCodeSwitchArmedId(null);
  }, [normalizedCode]);

  useEffect(() => {
    if (!availableAssignments.some((assignment) => assignment.id === selectedAssignmentId)) {
      // 教師採累進解鎖時，最新週次是預設焦點；舊週次仍可由進度列切回。
      setSelectedAssignmentId(availableAssignments.at(-1)?.id ?? '');
    }
  }, [availableAssignments, selectedAssignmentId]);

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

      <section className="course-quick-start" data-testid="course-quick-start">
        <header className="course-quick-heading">
          <div>
            <span className="section-kicker">STUDENT QUICK START</span>
            <b>{isZh ? '本週任務，三步開始' : 'This week\'s mission in three steps'}</b>
            <small>{isZh ? '預估 8–12 分鐘 · 先完成匿名代碼，再進入固定條件 Assessment。' : 'Estimated 8–12 minutes · Create an anonymous code, then enter the fixed-condition Assessment.'}</small>
          </div>
          <div className="course-quick-progress" data-testid="course-quick-progress">
            <span data-state={learnerCodeValid ? 'done' : 'current'}><i>1</i>{isZh ? '匿名代碼' : 'Anonymous code'}</span>
            <span data-state={selectedLatestAttempt?.completedAt ? 'done' : learnerCodeValid ? 'current' : 'pending'}><i>2</i>{isZh ? '執行任務' : 'Run mission'}</span>
            <span data-state={exportReady ? 'done' : selectedLatestAttempt?.completedAt ? 'current' : 'pending'}><i>3</i>{isZh ? '說明並匯出' : 'Explain & export'}</span>
          </div>
        </header>

        <div className="course-quick-grid">
          <article className="course-current-mission" data-testid="course-current-assignment">
            {selectedAssignment ? (
              <>
                <div className="course-current-mission-title">
                  <span>{selectedAssignment.weekId} · {selectedAssignment.missionId}</span>
                  <b>{isZh ? selectedAssignment.titleZh : selectedAssignment.titleEn}</b>
                  <small>{selectedMission ? (isZh ? selectedMission.titleZh : selectedMission.titleEn) : selectedAssignment.missionId}</small>
                </div>
                <div className="course-mission-meta">
                  <span><small>{isZh ? '任務隊伍' : 'TEAM'}</small><b>{selectedTeam.map((character) => isZh ? character!.professionZh : character!.professionEn).join(' · ')}</b></span>
                  <span><small>{isZh ? '主裝備' : 'EQUIPMENT'}</small><b>{selectedEquipment ? (isZh ? selectedEquipment.nameZh : selectedEquipment.nameEn) : selectedAssignment.equipmentId}</b></span>
                  <span><small>{isZh ? '備品／船舶' : 'SPARE / VESSEL'}</small><b>{selectedSpare ? (isZh ? selectedSpare.nameZh : selectedSpare.nameEn) : selectedAssignment.spareId} · {selectedVessel?.class ?? selectedAssignment.vesselId}</b></span>
                  <span><small>{isZh ? '固定條件' : 'FIXED CONDITION'}</small><b>SEED {selectedAssignment.randomSeed} · {isZh ? `${selectedAttempts.length} 次嘗試` : `${selectedAttempts.length} ATTEMPTS`}</b></span>
                </div>
                <div
                  className="course-week-achievement"
                  data-testid="course-week-achievement"
                  data-state={exportReady && selectedExplanationReady ? 'complete' : selectedLatestAttempt?.completedAt ? 'debrief' : selectedLatestAttempt ? 'active' : 'ready'}
                >
                  <i>{exportReady && selectedExplanationReady ? '✓' : selectedLatestAttempt?.completedAt ? '3' : selectedLatestAttempt ? '2' : '1'}</i>
                  <div>
                    <b>{exportReady && selectedExplanationReady
                      ? (isZh ? '本週完成，可以匯出 Course Record' : 'Week complete — Course Record is ready to export')
                      : selectedLatestAttempt?.completedAt
                        ? (isZh ? '任務已結算，完成四欄工程說明' : 'Mission settled — complete the four engineering explanations')
                      : selectedLatestAttempt
                        ? (isZh ? 'Assessment 進行中' : 'Assessment in progress')
                        : (isZh ? '任務已就緒' : 'Mission ready')}</b>
                    <small>{isZh ? '狀態只由本機匿名紀錄產生，不上傳個人資料。' : 'Status is derived from the local anonymous record; no personal data is uploaded.'}</small>
                  </div>
                </div>
              </>
            ) : (
              <div className="course-current-mission-title">
                <span>{isZh ? '等待教師解鎖' : 'WAITING FOR RELEASE'}</span>
                <b>{isZh ? '目前沒有已開放的週次' : 'No week is currently open'}</b>
                <small>{isZh ? '教師解鎖後，本週任務會顯示於此。' : 'This week\'s mission appears here after the instructor unlocks it.'}</small>
              </div>
            )}
          </article>

          <aside className="course-quick-access course-assessment-card" data-testid="course-assessment-card">
            <div>
              <span className="section-kicker">ANONYMOUS ACCESS</span>
              <b>{isZh ? '準備進入 Assessment' : 'Prepare for Assessment'}</b>
              <small>{isZh ? '請勿輸入姓名、Email 或學號。' : 'Do not enter a name, email, or student ID.'}</small>
            </div>
            <label>
              <span>{isZh ? '匿名代碼' : 'Anonymous code'}</span>
              <input
                data-testid="course-learner-code"
                value={learnerCode}
                maxLength={24}
                onChange={(event) => setLearnerCode(event.target.value)}
                placeholder="OWM-7A2C-91F0"
              />
            </label>
            <div className="course-quick-access-row">
              <button type="button" className="course-generate-code" data-testid="course-generate-code" onClick={() => setLearnerCode(generateAnonymousLearnerCode())}>
                {isZh ? '產生匿名代碼' : 'Generate code'}
              </button>
              <label>
                <span>{isZh ? '裝置' : 'Device'}</span>
                <select data-testid="course-platform" value={platform} onChange={(event) => setPlatform(event.target.value as CoursePlatform)}>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                </select>
              </label>
            </div>
            <div className="course-policy-chips"><i>NO REC</i><i>NO GUIDE</i><i>ANONYMOUS</i><i>FIXED SEED</i></div>
            {selectedAssignment && (
              <button
                type="button"
                className="course-primary-cta"
                data-testid={`course-start-assessment-${selectedAssignment.weekId}`}
                data-course-code-switch={!codeMismatch ? 'none' : codeSwitchArmedId === selectedAssignment.id ? 'armed' : 'required'}
                disabled={!learnerCodeValid || !assessmentStartReady}
                title={!assessmentStartReady
                  ? (isZh ? '請先完成目前 Assessment 與四欄 Debrief，或重設未完成紀錄。' : 'Complete the current Assessment and four-field Debrief, or reset the incomplete record.')
                  : undefined}
                onClick={() => {
                  if (codeMismatch && codeSwitchArmedId !== selectedAssignment.id) {
                    setCodeSwitchArmedId(selectedAssignment.id);
                    return;
                  }
                  setCodeSwitchArmedId(null);
                  onStartAssessment(normalizedCode, platform, selectedAssignment);
                }}
              >
                {!assessmentStartReady
                  ? (isZh ? '先完成目前 Assessment' : 'FINISH CURRENT ASSESSMENT')
                  : codeMismatch && codeSwitchArmedId === selectedAssignment.id
                    ? (isZh ? '再按一次：匯出舊紀錄並以新代碼開始' : 'Press again: export the old record and restart with the new code')
                  : codeMismatch
                    ? (isZh ? '代碼與既有紀錄不同（按下確認）' : 'Code differs from the saved record (press to confirm)')
                    : selectedAttempts.length > 0 ? (isZh ? '重做本週 Assessment' : 'Replay this week\'s Assessment') : (isZh ? '開始本週 Assessment' : 'Start this week\'s Assessment')}
              </button>
            )}
          </aside>
        </div>

        <div className="course-week-progress">
          <div>
            <span className="section-kicker">TEACHER-CONTROLLED RELEASE</span>
            <b>{isZh ? '課程週次' : 'Course weeks'}</b>
          </div>
          <strong data-testid="course-unlocked-count">{availableAssignments.length}/{config.assignments.length} {isZh ? '已開放' : 'OPEN'}</strong>
          <div className="course-assignment-list" data-testid="course-assignment-list">
            {config.assignments.map((assignment) => {
              const unlocked = config.unlockedWeekIds.includes(assignment.weekId);
              const selected = selectedAssignment?.id === assignment.id;
              return (
                <button
                  key={assignment.id}
                  type="button"
                  className={`${unlocked ? 'unlocked' : 'locked'}${selected ? ' selected' : ''}`}
                  data-testid={`course-assignment-${assignment.weekId}`}
                  data-course-unlocked={unlocked ? 'true' : 'false'}
                  aria-current={selected ? 'step' : undefined}
                  disabled={!unlocked}
                  title={unlocked
                    ? (isZh ? `${assignment.weekId}：${assignment.titleZh}` : `${assignment.weekId}: ${assignment.titleEn}`)
                    : (isZh ? `${assignment.weekId} 尚未開放` : `${assignment.weekId} is locked`)}
                  onClick={() => { setSelectedAssignmentId(assignment.id); setLabExpanded(false); }}
                >
                  <b>{assignment.weekId}</b>
                  <small>{unlocked ? (selected ? (isZh ? '本週' : 'NOW') : (isZh ? '已開放' : 'OPEN')) : '—'}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="course-guided-inline" data-testid="course-guided-practice-card">
          <div>
            <span className="section-kicker">FIRST TIME HERE?</span>
            <b>{isZh ? '先熟悉操作，不寫入 Assessment 紀錄' : 'Learn the controls without creating an Assessment record'}</b>
          </div>
          <button type="button" data-testid="course-start-practice" onClick={onStartPractice}>
            {isZh ? '開啟練習導覽' : 'Open guided practice'}
          </button>
        </div>
      </section>

      <section className="course-lab-disclosure" data-testid="course-lab-disclosure">
        <header>
          <div>
            <span className="section-kicker">OPTIONAL ENGINEERING LAB</span>
            <b>{isZh ? '需要查資料或練習程序時再展開' : 'Open when you need data or procedure practice'}</b>
            <small>{isZh ? 'SCADA／CMS、可靠度、LOTO、Work Order 與 Alarm／Interlock。' : 'SCADA/CMS, reliability, LOTO, Work Order, and Alarm/Interlock.'}</small>
          </div>
          <button type="button" data-testid="course-lab-toggle" aria-expanded={labExpanded} onClick={() => setLabExpanded((current) => !current)}>
            {labExpanded ? (isZh ? '收合工程實驗室' : 'Close Engineering Lab') : (isZh ? '開啟工程實驗室' : 'Open Engineering Lab')}
          </button>
        </header>
        <div data-testid="course-lab-content" hidden={!labExpanded}>
          <CourseEngineeringLab
            language={language}
            assignments={availableAssignments}
            activeAssignmentId={selectedAssignment?.id}
            onLotoVerified={(assignment, state) => onRecordEvent('LOTO_VERIFIED', {
              assignmentId: assignment.id,
              missionId: assignment.missionId,
              source: 'COURSE_ENGINEERING_LAB',
              procedure: [...state.completedSteps],
              rejectedActions: state.rejectedActions,
              zeroEnergy: state.verified,
            }, { context: 'practice_lab', actor: 'learner' })}
            onWorkOrderCreated={(assignment, state) => onRecordEvent('WORK_ORDER_CREATED', {
              assignmentId: assignment.id,
              missionId: assignment.missionId,
              source: 'COURSE_ENGINEERING_LAB',
              lifecycle: [...state.completedSteps],
              rejectedActions: state.rejectedActions,
              closed: state.closed,
            }, { context: 'practice_lab', actor: 'learner' })}
          />
        </div>
      </section>

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
              {resetArmed ? (
                <>
                  <button type="button" data-testid="course-reset-cancel" onClick={() => setResetArmed(false)}>{isZh ? '取消' : 'Cancel'}</button>
                  <button
                    type="button"
                    className="course-reset-button"
                    data-testid="course-reset-confirm"
                    title={isZh ? '刪除前請先匯出 Course Record；此動作無法復原。' : 'Export the Course Record before deleting; this cannot be undone.'}
                    onClick={() => { setResetArmed(false); onReset(); }}
                  >
                    {isZh ? `確認刪除 ${record.attempts.length} 次嘗試紀錄` : `Confirm: delete ${record.attempts.length} attempts`}
                  </button>
                </>
              ) : (
                <button type="button" className="course-reset-button" data-testid="course-reset" onClick={() => setResetArmed(true)}>{isZh ? '重設課程進度…' : 'Reset course progress…'}</button>
              )}
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
