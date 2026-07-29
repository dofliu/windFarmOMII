import { useState } from 'react';
import {
  normalizeParticipantCode,
  serializePlaytestSession,
  type PlaytestNotes,
  type PlaytestPlatform,
  type PlaytestSession,
} from '../domain/playtest';
import type { Language } from '../domain/types';
import type { OnboardingStatus } from '../domain/onboarding';

export function PlaytestPanel({
  language,
  session,
  onStart,
  onUpdateNotes,
  onComplete,
  onClear,
  onOpenCampaign,
  onboardingStatus,
  onStartPractice,
}: {
  language: Language;
  session: PlaytestSession | null;
  onStart: (participantCode: string, platform: PlaytestPlatform) => void;
  onUpdateNotes: (notes: Partial<PlaytestNotes>) => void;
  onComplete: () => void;
  onClear: () => void;
  onOpenCampaign: () => void;
  onboardingStatus: OnboardingStatus;
  onStartPractice: () => void;
}) {
  const [participantCode, setParticipantCode] = useState('');
  const [platform, setPlatform] = useState<PlaytestPlatform>('desktop');
  const isZh = language === 'zh';
  const normalizedParticipantCode = normalizeParticipantCode(participantCode);

  if (!session) {
    return (
      <section className="playtest-shell" data-testid="playtest-screen">
        <header className="playtest-heading">
          <div>
            <span className="section-kicker">PLAYTEST OBSERVATION V1</span>
            <h2>{isZh ? '策略決策理解測試' : 'Strategy decision comprehension test'}</h2>
            <p>{isZh ? '只使用匿名代碼；資料留在此瀏覽器，直到測試完成後手動下載 JSON。' : 'Use an anonymous code only. Data stays in this browser until the JSON is downloaded manually.'}</p>
          </div>
          <strong>{isZh ? '先練習，再測試' : 'PRACTICE, THEN TEST'}</strong>
        </header>
        <section className="playtest-learning-path" data-testid="playtest-learning-path">
          <div className="playtest-learning-copy">
            <span className="section-kicker">FIRST TIME HERE?</span>
            <h3>{isZh ? '完全不知道怎麼玩，請先走練習導覽' : 'New to OWM? Start with guided practice'}</h3>
            <p>{isZh ? '練習會帶你完成一次部署、事件處理、診斷與結算；不建立參與者、不記錄正式測試事件。' : 'Practice guides one deployment, event response, diagnosis, and debrief without creating a participant or recording formal test events.'}</p>
          </div>
          <ol className="playtest-learning-steps">
            <li><b>1</b><span><strong>{isZh ? '理解目標' : 'Understand'}</strong>{isZh ? '安全完成六個工程階段' : 'Complete six engineering stages safely'}</span></li>
            <li><b>2</b><span><strong>{isZh ? '練習操作' : 'Practice'}</strong>{isZh ? '部署 → Action → 事件 → 診斷' : 'Deploy → Action → Event → Diagnose'}</span></li>
            <li><b>3</b><span><strong>{isZh ? '開始測試' : 'Test'}</strong>{isZh ? '不看答案，說明你的決策理由' : 'Explain decisions without answer prompts'}</span></li>
          </ol>
          <button type="button" className="playtest-practice-button" data-testid="playtest-start-practice" onClick={onStartPractice}>
            {onboardingStatus === 'completed'
              ? (isZh ? '重新練習導覽' : 'Replay guided practice')
              : (isZh ? '第一次玩：開始練習導覽' : 'First time: start guided practice')}
          </button>
          {onboardingStatus === 'completed' && <small className="playtest-practice-complete" data-testid="playtest-practice-complete">{isZh ? '✓ 已完成一次練習，可開始正式測試' : '✓ Practice complete; formal testing is ready'}</small>}
        </section>
        <section className="playtest-goal-brief">
          <div>
            <span className="section-kicker">WHAT AM I TESTING?</span>
            <h3>{isZh ? '正式測試只觀察三個策略決策' : 'Formal testing observes three strategy decisions'}</h3>
            <p>{isZh ? '不是測手速，也不是要求第一次就拿高分。請在做決定前說出理由。' : 'This is not a speed or high-score test. Explain the reason before deciding.'}</p>
          </div>
          <div className="playtest-glossary">
            <span><b>Fatigue</b>{isZh ? '技師疲勞，影響是否換班' : 'Crew fatigue; informs rotation'}</span>
            <span><b>RST</b>{isZh ? 'Rest Token，恢復技師' : 'Rest Token; recovers crew'}</span>
            <span><b>MNT</b>{isZh ? 'Maintenance，維修裝備／風場' : 'Maintenance for equipment or fleet'}</span>
          </div>
        </section>
        <div className="playtest-start-grid">
          <article className="playtest-card">
            <span>01 · ROTATION</span>
            <b>{isZh ? '何時輪調技師？' : 'When should crew rotate?'}</b>
            <p>{isZh ? '觀察玩家是否能從疲勞狀態與下一關需求做出換班決策。' : 'Observe whether fatigue and the next mission drive a rotation decision.'}</p>
          </article>
          <article className="playtest-card">
            <span>02 · RST</span>
            <b>{isZh ? '何時花 Rest Token？' : 'When should RST be spent?'}</b>
            <p>{isZh ? '觀察玩家是否把 RST 留給 Critical／Exhausted 或關鍵隊員。' : 'Observe whether RST is reserved for critical, exhausted, or essential crew.'}</p>
          </article>
          <article className="playtest-card">
            <span>03 · MNT</span>
            <b>{isZh ? '何時維修、何時保留 MNT？' : 'When should MNT be spent or retained?'}</b>
            <p>{isZh ? '觀察裝備、Fleet 與後續任務之間的資源取捨。' : 'Observe tradeoffs among equipment, fleet condition, and upcoming missions.'}</p>
          </article>
        </div>
        <div className="playtest-start-form">
          <div className="playtest-form-heading">
            <b>{isZh ? '已熟悉玩法：開始正式測試' : 'Already familiar: start formal test'}</b>
            <small>{isZh ? '輸入匿名代碼後才會開始記錄。' : 'Recording starts only after an anonymous code is entered.'}</small>
          </div>
          <label>
            <span>{isZh ? '匿名參與者代碼' : 'Anonymous participant code'}</span>
            <input
              data-testid="playtest-participant-code"
              value={participantCode}
              maxLength={24}
              placeholder="D01 / M01"
              onChange={(event) => setParticipantCode(event.target.value)}
            />
          </label>
          <label>
            <span>{isZh ? '測試裝置' : 'Test device'}</span>
            <select data-testid="playtest-platform" value={platform} onChange={(event) => setPlatform(event.target.value as PlaytestPlatform)}>
              <option value="desktop">{isZh ? '桌機' : 'Desktop'}</option>
              <option value="mobile">{isZh ? '手機' : 'Mobile'}</option>
            </select>
          </label>
          <button
            type="button"
            data-testid="playtest-start"
            disabled={!normalizedParticipantCode}
            onClick={() => onStart(normalizedParticipantCode, platform)}
          >
            {isZh ? '開始正式測試與紀錄' : 'Start formal test and recording'}
          </button>
        </div>
      </section>
    );
  }

  const exportText = serializePlaytestSession(session);
  const active = session.status === 'active';
  const recentEvents = session.events.slice(-8).reverse();
  return (
    <section className="playtest-shell" data-testid="playtest-screen" data-playtest-status={session.status}>
      <header className="playtest-heading">
        <div>
          <span className="section-kicker">PLAYTEST {active ? 'RECORDING' : 'COMPLETE'}</span>
          <h2>{session.participantCode} · {session.platform === 'desktop' ? (isZh ? '桌機' : 'Desktop') : (isZh ? '手機' : 'Mobile')}</h2>
          <p>{isZh ? '事件只記錄遊戲決策與資源狀態，不輸入姓名、Email 或其他個資。' : 'Events contain game decisions and resource state only. Do not enter names, email, or other personal data.'}</p>
        </div>
        <strong data-testid="playtest-event-count">{session.events.length} EVENTS</strong>
      </header>

      <div className="playtest-active-grid">
        <section className="playtest-protocol">
          <h3>{isZh ? '測試流程' : 'Test flow'}</h3>
          <ol>
            <li>{isZh ? '進入 Campaign，自行完成部署與任務。' : 'Open Campaign and complete deployment and missions independently.'}</li>
            <li>{isZh ? '遇到疲勞時，說明為何換人或保留原隊伍。' : 'When fatigue appears, explain why the team is changed or retained.'}</li>
            <li>{isZh ? '遇到 Rest／Maintenance 決策時，先說出理由再操作。' : 'Explain the reason before each Rest or Maintenance action.'}</li>
            <li>{isZh ? '至少完成 3 關，或直到三類決策都實際出現。' : 'Complete at least 3 missions, or continue until all three decisions occur.'}</li>
            <li>{isZh ? '主持人只記錄理解障礙，不提示正確答案。' : 'The facilitator records confusion without giving the correct answer.'}</li>
          </ol>
          <div className="playtest-completion-check">
            <b>{isZh ? '可以結束的條件' : 'READY TO FINISH'}</b>
            <span>□ {isZh ? '說明過一次換班／不換班理由' : 'Explained one rotate/retain decision'}</span>
            <span>□ {isZh ? '說明過一次 RST 使用／保留理由' : 'Explained one spend/retain RST decision'}</span>
            <span>□ {isZh ? '說明過一次 MNT 使用／保留理由' : 'Explained one spend/retain MNT decision'}</span>
            <span>□ {isZh ? '主持人已填四個觀察欄位' : 'Facilitator completed all four note fields'}</span>
          </div>
          {active && <button type="button" data-testid="playtest-open-campaign" onClick={onOpenCampaign}>{isZh ? '前往 Campaign' : 'Open Campaign'}</button>}
          <div className="playtest-event-list" data-testid="playtest-event-list">
            {recentEvents.map((event) => (
              <div key={event.sequence}>
                <span>#{event.sequence}</span>
                <b>{event.kind}</b>
                <small>{new Date(event.recordedAt).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="playtest-notes">
          <h3>{isZh ? '行為後訪談／觀察' : 'Post-action interview and observation'}</h3>
          <PlaytestNote
            label={isZh ? '輪調：玩家依據什麼決定換人？' : 'Rotation: what drove the crew change?'}
            value={session.notes.rotationDecision}
            disabled={!active}
            testId="playtest-note-rotation"
            onChange={(rotationDecision) => onUpdateNotes({ rotationDecision })}
          />
          <PlaytestNote
            label={isZh ? 'RST：玩家為何使用或保留？' : 'RST: why was it spent or retained?'}
            value={session.notes.rstDecision}
            disabled={!active}
            testId="playtest-note-rst"
            onChange={(rstDecision) => onUpdateNotes({ rstDecision })}
          />
          <PlaytestNote
            label={isZh ? 'MNT：玩家如何判斷維修優先順序？' : 'MNT: how were maintenance priorities chosen?'}
            value={session.notes.mntDecision}
            disabled={!active}
            testId="playtest-note-mnt"
            onChange={(mntDecision) => onUpdateNotes({ mntDecision })}
          />
          <PlaytestNote
            label={isZh ? '主持人觀察：卡住、誤解、需要提示的時點' : 'Facilitator: confusion, hesitation, or prompts required'}
            value={session.notes.facilitatorNotes}
            disabled={!active}
            testId="playtest-note-facilitator"
            onChange={(facilitatorNotes) => onUpdateNotes({ facilitatorNotes })}
          />
        </section>
      </div>

      <footer className="playtest-actions">
        {active && <button type="button" data-testid="playtest-complete" onClick={onComplete}>{isZh ? '完成本次測試' : 'Complete session'}</button>}
        <a
          data-testid="playtest-download"
          download={`OWM_playtest_${session.participantCode}_${session.platform}.json`}
          href={`data:application/json;charset=utf-8,${encodeURIComponent(exportText)}`}
        >
          {isZh ? '下載 JSON' : 'Download JSON'}
        </a>
        {!active && <button type="button" data-testid="playtest-clear" onClick={onClear}>{isZh ? '建立下一位參與者' : 'Create next participant'}</button>}
      </footer>
    </section>
  );
}

function PlaytestNote({
  label,
  value,
  disabled,
  testId,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  testId: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      <span>{label}</span>
      <textarea data-testid={testId} value={value} disabled={disabled} maxLength={4000} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
