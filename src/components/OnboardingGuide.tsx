import { ONBOARDING_STEPS, currentOnboardingStep, type OnboardingProgress } from '../domain/onboarding';
import type { Language } from '../domain/types';

export type OnboardingSurface = 'deployment' | 'operation' | 'branch' | 'diagnosis' | 'debrief' | 'away';

interface OnboardingGuideProps {
  progress: OnboardingProgress;
  surface: OnboardingSurface;
  language: Language;
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
      primary: zh ? '返回戰役' : 'Return to Campaign',
      action: 'return',
    };
  }

  if ((step === 'REACTIVE_WINDOW' || step === 'DIAGNOSIS_GATE' || step === 'DEBRIEF') && surface === 'deployment') {
    return {
      eyebrow: zh ? '任務需要重新進場' : 'MISSION SESSION ENDED',
      title: zh ? '從 event deck 重新部署' : 'Redeploy from the event deck',
      body: zh ? 'Campaign 進度仍在；只有暫時性的戰鬥 session 未保存。' : 'Campaign progress remains intact; only the temporary mission session was not saved.',
      primary: zh ? '回到事件卡組' : 'Return to event deck',
      action: 'return',
    };
  }

  if (step === 'DEPLOYMENT') {
    return {
      eyebrow: '01 · DEPLOYMENT',
      title: zh ? '先確認隊伍與任務配置' : 'Review team and mission loadout',
      body: zh ? '先完成工作許可、PPE 與進場確認；系統會再核對船舶與兩名技師的 Mastery。裝備、備品與船舶也會改變初始資源。' : 'Confirm the work permit, PPE, and access condition. The system also checks vessel compatibility and two crew members\' Mastery before deployment.',
      primary: zh ? '下一步：事件卡組' : 'Next: event deck',
      action: 'advance',
    };
  }

  if (step === 'EVENT_DECK') {
    return {
      eyebrow: '02 · MISSION EVENT DECK',
      title: zh ? '先讀固定回合事件' : 'Read the fixed-round events',
      body: zh ? 'R01、R04、R07 代表事件觸發回合；倍率越高，資源損失越大。完成 Operation Readiness 5/5 後即可開始。' : 'R01, R04, and R07 are trigger rounds. Higher multipliers increase resource loss. Complete Operation Readiness 5/5 to start.',
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
    primary: ready ? (zh ? '完成首次導覽' : 'Complete onboarding') : undefined,
    action: ready ? 'complete' : 'none',
    waiting: !ready,
  };
}

export function OnboardingGuide(props: OnboardingGuideProps) {
  if (props.progress.status !== 'active') return null;
  const step = currentOnboardingStep(props.progress);
  const copy = guideCopy(props.progress, props.surface, props.language);
  const primaryAction = copy.action === 'advance'
    ? props.onAdvance
    : copy.action === 'deploy'
      ? props.onDeploy
      : copy.action === 'complete'
        ? props.onComplete
        : copy.action === 'return'
          ? props.onReturnToCampaign
          : undefined;

  return (
    <aside
      className={`onboarding-guide${copy.waiting ? ' waiting' : ''}`}
      data-testid="onboarding-guide"
      data-step={step}
      aria-live="polite"
    >
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
      <div className="onboarding-actions">
        <button type="button" className="onboarding-skip" data-testid="onboarding-skip" onClick={props.onSkip}>{props.language === 'zh' ? '跳過導覽' : 'Skip guide'}</button>
        {primaryAction && <button type="button" className="onboarding-primary" data-testid="onboarding-primary" disabled={copy.action === 'deploy' && props.canDeploy === false} onClick={primaryAction}>{copy.primary}</button>}
      </div>
    </aside>
  );
}
