import { ONBOARDING_STEPS, currentOnboardingStep, type OnboardingProgress } from '../domain/onboarding';
import type { Language } from '../domain/types';

export type OnboardingSurface = 'deployment' | 'operation' | 'branch' | 'diagnosis' | 'debrief' | 'away';

interface OnboardingGuideProps {
  progress: OnboardingProgress;
  surface: OnboardingSurface;
  language: Language;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  practiceMode?: boolean;
  canDeploy?: boolean;
  onAdvance: () => void;
  onDeploy: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onReturnToCampaign: () => void;
}

interface GuideCopy {
  eyebrow: string;
  title: string;
  body: string;
  tasks: string[];
  success: string;
  terms: Array<{ term: string; meaning: string }>;
  primary?: string;
  action: 'advance' | 'deploy' | 'complete' | 'return' | 'none';
  waiting?: boolean;
}

const STEP_LABELS = {
  zh: ['部署', '事件卡組', 'Reactive', '診斷', '結算'],
  en: ['Deploy', 'Event deck', 'Reactive', 'Diagnosis', 'Debrief'],
} as const;

function guideCopy(progress: OnboardingProgress, surface: OnboardingSurface, language: Language): GuideCopy {
  const step = currentOnboardingStep(progress);
  const zh = language === 'zh';

  if (surface === 'away') {
    return {
      eyebrow: zh ? '導覽已暫停' : 'GUIDE PAUSED',
      title: zh ? '回到 Campaign 繼續' : 'Return to Campaign',
      body: zh ? '導覽只追蹤 Campaign 的實際操作，不會修改 Sandbox、Collection 或 Codex。' : 'The guide follows Campaign actions only and does not modify Sandbox, Collection, or Codex.',
      tasks: [zh ? '按「返回戰役」，繼續目前的練習進度。' : 'Select Return to Campaign to resume the current lesson.'],
      success: zh ? '回到任務部署畫面。' : 'You are back on the mission deployment screen.',
      terms: [],
      primary: zh ? '返回戰役' : 'Return to Campaign',
      action: 'return',
    };
  }

  if ((step === 'REACTIVE_WINDOW' || step === 'DIAGNOSIS_GATE' || step === 'DEBRIEF') && surface === 'deployment') {
    return {
      eyebrow: zh ? '任務需要重新進場' : 'MISSION SESSION ENDED',
      title: zh ? '從 event deck 重新部署' : 'Redeploy from the event deck',
      body: zh ? 'Campaign 進度仍在；只有暫時性的戰鬥 session 未保存。' : 'Campaign progress remains intact; only the temporary mission session was not saved.',
      tasks: [zh ? '回到事件卡組，再次檢查 5/5 Readiness 後部署。' : 'Return to the event deck, check 5/5 Readiness, and deploy again.'],
      success: zh ? '重新進入 Operation。' : 'Operation starts again.',
      terms: [{ term: 'Session', meaning: zh ? '單次任務的暫存狀態' : 'Temporary state for one mission' }],
      primary: zh ? '回到事件卡組' : 'Return to event deck',
      action: 'return',
    };
  }

  if (step === 'DEPLOYMENT') {
    return {
      eyebrow: '01 · DEPLOYMENT',
      title: zh ? '先確認隊伍與任務配置' : 'Review team and mission loadout',
      body: zh ? '你的目標是派出一支可安全出勤的三人隊伍。這一頁不是作戰，而是先排除「人、裝備、船舶或程序不合格」。' : 'Your goal is to dispatch a safe three-person team. This screen removes crew, equipment, vessel, and procedure blockers before the operation.',
      tasks: zh
        ? ['先看 Route，確認目前解鎖的任務。', '到 Readiness 勾選工作許可、PPE、進場條件。', '依序查看 Crew、Loadout、Forecast；先不用追求最佳配置。']
        : ['Check Route for the unlocked mission.', 'Open Readiness and confirm permit, PPE, and access.', 'Review Crew, Loadout, and Forecast; an optimal build is not required yet.'],
      success: zh ? 'Operation Readiness 顯示 5/5，部署按鈕可使用。' : 'Operation Readiness shows 5/5 and the deploy button is enabled.',
      terms: [
        { term: 'Fatigue', meaning: zh ? '技師疲勞；越高越不適合連續出勤' : 'Crew fatigue; higher values make repeat dispatch risky' },
        { term: 'RST', meaning: zh ? 'Rest Token；讓一名技師恢復' : 'Rest Token; recovers one crew member' },
        { term: 'MNT', meaning: zh ? 'Maintenance；修復裝備或風場狀態' : 'Maintenance resource for equipment or fleet condition' },
      ],
      primary: zh ? '下一步：事件卡組' : 'Next: event deck',
      action: 'advance',
    };
  }

  if (step === 'EVENT_DECK') {
    return {
      eyebrow: '02 · MISSION EVENT DECK',
      title: zh ? '先讀固定回合事件' : 'Read the fixed-round events',
      body: zh ? 'Event Deck 是這關已知的風險時程。先知道哪一回合會發生什麼，再決定要不要保留 Energy 與資源。' : 'The Event Deck is the known risk schedule. Read when hazards occur before deciding whether to conserve Energy and resources.',
      tasks: zh
        ? ['讀 R01、R04、R07 三張事件卡。', '確認每張卡的影響倍率；倍率越高，未處理時損失越大。', '確認 Readiness 5/5，按「開始第一關」。']
        : ['Read the R01, R04, and R07 event cards.', 'Check each impact multiplier; higher values increase unmitigated loss.', 'Confirm 5/5 Readiness and start the first mission.'],
      success: zh ? '進入 Operation，看到 Mission／Decision／Action 三段導覽列。' : 'Operation opens with the Mission, Decision, and Action navigation.',
      terms: [
        { term: 'R01', meaning: zh ? '第 1 回合觸發，不是卡牌編號' : 'Triggers on round 1, not a card number' },
        { term: 'Readiness', meaning: zh ? '部署前的五項合格檢查' : 'Five pre-deployment qualification checks' },
      ],
      primary: zh ? '開始第一關' : 'Start first mission',
      action: 'deploy',
    };
  }

  if (step === 'REACTIVE_WINDOW') {
    const ready = surface === 'branch';
    return {
      eyebrow: '03 · REACTIVE WINDOW',
      title: ready ? (zh ? '處理風險事件窗口' : 'Resolve the risk event window') : (zh ? '等待風險事件窗口' : 'Await the risk event window'),
      body: ready
        ? (zh ? 'L1 隊伍尚未解鎖 Reactive，可先承受完整後果；Career Track 達 L3 後即可用 Reactive skill 將 Power 轉成減傷。' : 'An L1 crew has not unlocked Reactive responses yet; accept the full consequence now. Reactive skills convert Power into mitigation after Career Track L3 unlocks.')
        : (zh ? '使用角色技能推進 Detect，然後結束回合；R01 事件出現時導覽會自動聚焦。' : 'Use character skills to advance Detect, then end the round. The guide focuses automatically when the R01 event appears.'),
      tasks: ready
        ? [zh ? '閱讀事件造成的 Weather／Safety／Fatigue 影響。' : 'Read the Weather, Safety, and Fatigue impact.', zh ? '若沒有 Reactive 選項，選擇承受後果並觀察資源變化。' : 'If no Reactive option is unlocked, accept the consequence and observe resource changes.']
        : [zh ? '切到 Action，選擇符合 Detect 階段的技能。' : 'Open Action and choose a skill matching Detect.', zh ? 'Energy 用完或完成本輪操作後，按「結束回合」。' : 'After spending Energy or finishing the round, select End round.'],
      success: ready ? (zh ? '事件窗口關閉，能繼續下一回合。' : 'The event window closes and the next round can continue.') : (zh ? 'R01 事件窗口出現。' : 'The R01 event window appears.'),
      terms: [
        { term: 'Energy', meaning: zh ? '本回合可執行技能的行動點' : 'Action points available this round' },
        { term: 'Reactive', meaning: zh ? '事件發生時用 Power 抵銷損害' : 'Uses Power to mitigate an event when it occurs' },
      ],
      action: 'none',
      waiting: !ready,
    };
  }

  if (step === 'DIAGNOSIS_GATE') {
    const ready = surface === 'diagnosis';
    return {
      eyebrow: '04 · DIAGNOSIS GATE',
      title: ready ? (zh ? '依證據完成診斷判斷' : 'Make an evidence-based diagnosis') : (zh ? '推進到 Diagnose 階段' : 'Advance to Diagnose'),
      body: ready
        ? (zh ? '先閱讀三個診斷選項再作答；正確判斷增加 Evidence，錯誤判斷會降低 Safety。' : 'Read all three options before deciding. A correct diagnosis adds Evidence; an incorrect one reduces Safety.')
        : (zh ? '繼續用符合目前階段的技能；進入 Diagnose 後必須先完成判斷，才能使用 Diagnose skill。' : 'Continue with stage-matched skills. At Diagnose, the decision gate must be resolved before Diagnose skills can be used.'),
      tasks: ready
        ? [zh ? '先看目前 Evidence 與 Safety。' : 'Check current Evidence and Safety.', zh ? '閱讀三個選項，依線索選出最合理原因。' : 'Read all three options and choose the cause best supported by evidence.']
        : [zh ? '依畫面目前階段選擇同類型技能。' : 'Choose a skill matching the current stage.', zh ? '不要只看 Power；先確認技能是否推進當前目標。' : 'Do not look at Power alone; confirm that the skill advances the current objective.'],
      success: ready ? (zh ? '診斷結果顯示，Diagnose skill 解鎖。' : 'Diagnosis feedback appears and Diagnose skills unlock.') : (zh ? '進入 Diagnose 並看到三個診斷選項。' : 'Diagnose begins and three choices appear.'),
      terms: [
        { term: 'Evidence', meaning: zh ? '證據品質；會影響結果與分數' : 'Evidence quality; affects outcome and score' },
        { term: 'Safety', meaning: zh ? '安全裕度；降到 0 可能任務失敗' : 'Safety margin; reaching 0 can fail the mission' },
      ],
      action: 'none',
      waiting: !ready,
    };
  }

  const ready = surface === 'debrief';
  return {
    eyebrow: '05 · MISSION DEBRIEF',
    title: ready ? (zh ? '讀取任務結算' : 'Review the mission debrief') : (zh ? '完成六個工程階段' : 'Complete all six stages'),
    body: ready
      ? (zh ? '總分由完成度、安全、證據、時間、疲勞與成本構成；Campaign 會保存最佳分、XP、下一關與 Codex。' : 'The score combines completion, safety, evidence, time, fatigue, and cost. Campaign saves best score, XP, the next mission, and Codex.')
      : (zh ? '繼續管理 Energy、fatigue 與事件；任務完成後導覽會聚焦結算面板。' : 'Keep managing Energy, fatigue, and events. The guide focuses the debrief when the mission ends.'),
    tasks: ready
      ? [zh ? '查看分數構成，不只看總分。' : 'Review the score breakdown, not only the total.', zh ? '確認技師 Fatigue、RST、MNT 與下一關是否解鎖。' : 'Check crew Fatigue, RST, MNT, and whether the next mission unlocked.']
      : [zh ? '完成剩餘工程階段並處理事件。' : 'Complete the remaining engineering stages and resolve events.', zh ? '若資源不足，先保 Safety，再考慮分數。' : 'If resources run short, protect Safety before score.'],
    success: ready ? (zh ? '理解這次出勤如何影響下一關；完成後會回到正式測試頁。' : 'You understand how this sortie affects the next one; completion returns to Playtest.') : (zh ? '出現 Mission Debrief。' : 'Mission Debrief appears.'),
    terms: [
      { term: 'XP', meaning: zh ? '角色成長與技能解鎖進度' : 'Character growth and skill unlock progress' },
      { term: 'Debrief', meaning: zh ? '任務結算與下一關準備依據' : 'Mission result and input for the next dispatch' },
    ],
    primary: ready ? (zh ? '完成首次導覽' : 'Complete onboarding') : undefined,
    action: ready ? 'complete' : 'none',
    waiting: !ready,
  };
}

export function OnboardingGuide(props: OnboardingGuideProps) {
  if (props.progress.status !== 'active') return null;
  const step = currentOnboardingStep(props.progress);
  const copy = guideCopy(props.progress, props.surface, props.language);
  const rawPrimaryAction = copy.action === 'advance'
    ? props.onAdvance
    : copy.action === 'deploy'
      ? props.onDeploy
      : copy.action === 'complete'
        ? props.onComplete
        : copy.action === 'return'
          ? props.onReturnToCampaign
          : undefined;
  const primaryAction = rawPrimaryAction
    ? () => {
        rawPrimaryAction();
        if (copy.action !== 'complete') props.onCollapsedChange(true);
      }
    : undefined;

  if (props.collapsed) return null;

  return (
    <aside
      className={`onboarding-guide${copy.waiting ? ' waiting' : ''}`}
      data-testid="onboarding-guide"
      data-step={step}
      data-collapsed="false"
      aria-live="polite"
    >
      <div className="onboarding-toolbar">
        {props.practiceMode
          ? <div className="onboarding-mode" data-testid="onboarding-practice-mode">{props.language === 'zh' ? '練習模式 · 不記入正式測試資料' : 'PRACTICE MODE · NOT RECORDED'}</div>
          : <span />}
        <button type="button" data-testid="onboarding-collapse" onClick={() => props.onCollapsedChange(true)}>
          {props.language === 'zh' ? '縮小後操作' : 'Minimize to interact'}
        </button>
      </div>
      <div className="onboarding-progress" aria-label={props.language === 'zh' ? '首次導覽進度' : 'Onboarding progress'}>
        {ONBOARDING_STEPS.map((item, index) => (
          <span key={item} className={index < props.progress.stepIndex ? 'done' : index === props.progress.stepIndex ? 'current' : ''}>
            <i>{index < props.progress.stepIndex ? '✓' : index + 1}</i>{STEP_LABELS[props.language][index]}
          </span>
        ))}
      </div>
      <small>{copy.eyebrow}</small>
      <h2 data-testid="onboarding-step">{copy.title}</h2>
      <p>{copy.body}</p>
      <div className="onboarding-instructions">
        <strong>{props.language === 'zh' ? '現在請做' : 'DO THIS NOW'}</strong>
        <ol>
          {copy.tasks.map((task) => <li key={task}>{task}</li>)}
        </ol>
      </div>
      <div className="onboarding-success">
        <b>{props.language === 'zh' ? '完成條件' : 'DONE WHEN'}</b>
        <span>{copy.success}</span>
      </div>
      {copy.terms.length > 0 && (
        <dl className="onboarding-terms">
          {copy.terms.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.meaning}</dd></div>)}
        </dl>
      )}
      <div className="onboarding-actions">
        <button type="button" className="onboarding-skip" data-testid="onboarding-skip" onClick={props.onSkip}>{props.language === 'zh' ? '跳過導覽' : 'Skip guide'}</button>
        {primaryAction && <button type="button" className="onboarding-primary" data-testid="onboarding-primary" disabled={copy.action === 'deploy' && props.canDeploy === false} onClick={primaryAction}>{copy.primary}</button>}
      </div>
    </aside>
  );
}
