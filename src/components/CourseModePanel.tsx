import { useEffect, useMemo, useState } from 'react';
import {
  type CourseEventKind,
  generateAnonymousLearnerCode,
  isCourseDebriefComplete,
  normalizeLearnerCode,
  unlockedCourseAssignments,
  type CourseAssignment,
  type CourseConfig,
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
  onRecordEvent: (kind: CourseEventKind, details: Record<string, unknown>) => void;
}) {
  const isZh = language === 'zh';
  const [learnerCode, setLearnerCode] = useState(record?.learnerCode ?? '');
  const [platform, setPlatform] = useState<CoursePlatform>(record?.platform ?? 'desktop');
  const [resetArmed, setResetArmed] = useState(false);
  const [codeSwitchArmedId, setCodeSwitchArmedId] = useState<string | null>(null);
  const availableAssignments = useMemo(() => unlockedCourseAssignments(config), [config]);
  const activeAttempt = record?.attempts.at(-1);
  const activeAssignment = config.assignments.find((assignment) => assignment.id === activeAttempt?.assignmentId);
  const debriefComplete = isCourseDebriefComplete(activeAttempt);
  const normalizedCode = normalizeLearnerCode(learnerCode);
  const codeMismatch = Boolean(record && normalizedCode && record.learnerCode !== normalizedCode);

  useEffect(() => {
    if (record?.learnerCode) setLearnerCode(record.learnerCode);
    if (record?.platform) setPlatform(record.platform);
  }, [record?.learnerCode, record?.platform]);

  useEffect(() => {
    setCodeSwitchArmedId(null);
  }, [normalizedCode]);

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
            onChange={(event) => setLearnerCode(event.target.value)}
            placeholder="OWM-7A2C-91F0"
          />
        </label>
        <button
          type="button"
          className="course-generate-code"
          data-testid="course-generate-code"
          onClick={() => setLearnerCode(generateAnonymousLearnerCode())}
        >
          {isZh ? '一鍵產生匿名代碼' : 'Generate anonymous code'}
        </button>
        <label>
          <span>{isZh ? '裝置' : 'Device'}</span>
          <select data-testid="course-platform" value={platform} onChange={(event) => setPlatform(event.target.value as CoursePlatform)}>
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
                  <span>{unlocked ? `${assignment.weekId} · ${assignment.missionId}` : assignment.weekId}</span>
                  <b>{isZh ? assignment.titleZh : assignment.titleEn}</b>
                  {unlocked && <small>{mission ? (isZh ? mission.titleZh : mission.titleEn) : assignment.missionId}</small>}
                </div>
                {unlocked ? (
                  <ul>
                    <li>{team.map((character) => isZh ? character!.professionZh : character!.professionEn).join(' · ')}</li>
                    <li>{equipment ? (isZh ? equipment.nameZh : equipment.nameEn) : assignment.equipmentId}</li>
                    <li>{spare ? (isZh ? spare.nameZh : spare.nameEn) : assignment.spareId} · {vessel ? vessel.class : assignment.vesselId}</li>
                    <li>SEED {assignment.randomSeed} · {isZh ? `嘗試 ${attempts}` : `${attempts} ATTEMPTS`}</li>
                  </ul>
                ) : (
                  <ul>
                    <li>{isZh ? '任務配置與資料包於教師解鎖後公布' : 'Loadout and data pack are revealed after the instructor unlocks this week'}</li>
                  </ul>
                )}
                <button
                  type="button"
                  data-testid={`course-start-assessment-${assignment.weekId}`}
                  data-course-code-switch={!unlocked || !codeMismatch ? 'none' : codeSwitchArmedId === assignment.id ? 'armed' : 'required'}
                  disabled={!unlocked || !normalizedCode}
                  onClick={() => {
                    if (codeMismatch && codeSwitchArmedId !== assignment.id) {
                      setCodeSwitchArmedId(assignment.id);
                      return;
                    }
                    setCodeSwitchArmedId(null);
                    onStartAssessment(normalizedCode, platform, assignment);
                  }}
                >
                  {!unlocked
                    ? (isZh ? '尚未開放' : 'LOCKED')
                    : codeMismatch && codeSwitchArmedId === assignment.id
                      ? (isZh ? '再按一次：匯出舊紀錄並以新代碼開始' : 'Press again: export the old record and restart with the new code')
                      : codeMismatch
                        ? (isZh ? '代碼與既有紀錄不同（按下確認）' : 'Code differs from the saved record (press to confirm)')
                        : attempts > 0 ? (isZh ? '重做 Assessment' : 'Replay Assessment') : (isZh ? '開始 Assessment' : 'Start Assessment')}
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
        })}
        onWorkOrderCreated={(assignment) => onRecordEvent('WORK_ORDER_CREATED', {
          assignmentId: assignment.id,
          missionId: assignment.missionId,
          source: 'COURSE_ENGINEERING_LAB',
          lifecycle: ['TRIGGER', 'ACKNOWLEDGE', 'DISPATCH', 'EXECUTE', 'VERIFY', 'CLOSE_OUT'],
        })}
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
                disabled={Boolean(activeAttempt?.completedAt) && !debriefComplete}
                title={activeAttempt?.completedAt && !debriefComplete
                  ? (isZh ? '請先完成結論、證據、不確定性與殘餘風險。' : 'Complete conclusion, evidence, uncertainty, and residual risk first.')
                  : undefined}
                onClick={onExport}
              >
                {activeAttempt?.completedAt && !debriefComplete
                  ? (isZh ? '完成 Debrief 後匯出' : 'Complete debrief to export')
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
          {activeAttempt?.completedAt && (
            <div className="course-reflection" data-testid="course-reflection">
              <b>{isZh ? '學生說明：結論／證據／不確定性／殘餘風險' : 'Student explanation: conclusion / evidence / uncertainty / residual risk'}</b>
              <ReflectionField testId="course-explanation-conclusion" label={isZh ? '結論' : 'Conclusion'} value={activeAttempt.studentExplanation.conclusion} onChange={(conclusion) => onUpdateExplanation({ conclusion })} />
              <ReflectionField testId="course-explanation-evidence" label={isZh ? '證據' : 'Evidence'} value={activeAttempt.studentExplanation.evidence} onChange={(evidence) => onUpdateExplanation({ evidence })} />
              <ReflectionField testId="course-explanation-uncertainty" label={isZh ? '不確定性' : 'Uncertainty'} value={activeAttempt.studentExplanation.uncertainty} onChange={(uncertainty) => onUpdateExplanation({ uncertainty })} />
              <ReflectionField testId="course-explanation-residual-risk" label={isZh ? '殘餘風險' : 'Residual risk'} value={activeAttempt.studentExplanation.residualRisk} onChange={(residualRisk) => onUpdateExplanation({ residualRisk })} />
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
  onChange,
}: {
  testId: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <textarea data-testid={testId} value={value} maxLength={4000} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
