# OWM 下一次工作交接 — 2026-09-04

## 目前權威狀態

- Version：`3.59.0-student-quick-start`
- CourseConfig：`2026-FALL-manual-release-v1`
- Semester policy：`frozen=true`
- Released weeks：W01 only
- Assignments：W01–W15，共 15 組
- Course Record：schema v2；正式 `decisionOrder` 僅接受 `learner + assessment_runtime`
- Assessment：REC／GUIDE、skill forecast、end-round forecast、正確診斷 DOM 標記均停用
- 資料範圍：只收匿名代碼與學生主動 Save／Export 的 compact Course Record；不建立帳號、gradebook 或 continuous telemetry

## 2026-09-04 整合內容

1. 保留本地 Course Record v2 fail-closed gate：所有 attempts 必須結算、score 合法且四欄 Debrief 完整才可 export。
2. 併入遠端 P0/P1：教師解鎖不清空紀錄、兩段式 reset／換代碼、Assessment 防洩題、Engineering Lab 真實程序狀態、localStorage 容錯、runtime data 白名單。
3. 統一 score 重算、SHA-256 `recordDigest`、`weekId`／`configVersion` snapshot 與班級彙整工具。
4. 指令分流：`pnpm course:summary` 彙整 `course-results/`；`pnpm course:inspect-legacy -- <file>` 檢查舊 v1 單檔。
5. 保留證據邊界：digest 可檢查資料一致性，但不是 signature、身分綁定或可信任收件證明；正式成績仍需 instructor-controlled receipt 或 signed/server-side collection。

## 2026-09-04 Student Quick Start 增量

1. Course 首頁只聚焦最新已解鎖週次；其他已解鎖週次由緊湊進度列切換，Locked weeks 不公開任務配置。
2. 匿名代碼、裝置選擇與 Assessment 主 CTA 合併為單一操作區，三步狀態顯示「匿名代碼／執行任務／說明並匯出」。
3. 新增 local-only 週任務狀態回饋；不建立帳號、排行榜、gradebook 或 continuous telemetry。
4. Guided Practice 降為次要入口；Engineering Lab 預設收合，需要 SCADA／CMS 或程序練習時再展開。
5. 390px Mobile 首頁完整高度由變更前約 2724px 降為 1668px（約減少 39%）；Assessment 主 CTA 位於第一個 844px viewport 內。

## 2026-09-04 W09 至 W10 真人 pilot 就緒包

1. 新增 9 頁 `COURSE_MODE_PILOT_PROTOCOL_v1.0.docx`，定義 3–5 位、Desktop／Mobile、W09→W10 think-aloud 流程與中性主持話術。
2. 新增 `COURSE_MODE_PILOT_OBSERVATION_v1.0.xlsx`，包含 Instructions、Participants、Task Log、Observations、Summary 五個工作表。
3. Workbook 只收匿名代碼、手動 observation、time-to-first-action、completion time、Assistance／Backtrack／Mistap／Stuck、severity 與 1–5 吸引力／順暢性。
4. Summary 會檢查 sample/device/task rows，並以 P0/P1、80% completion 與 smoothness median 4 產生 `INCOMPLETE`／`REVISE`／`GO` decision aid；小樣本仍不作學習成效或統計推論。
5. `.gitignore` 新增 `pilot-results-private/`；真人資料必須複製到該資料夾後填寫，不得改寫已追蹤的空白 template。

## 驗證結果

- `pnpm validate`：28 test files／183 tests；Data／Scene／Art／Course、Campaign／Challenge balance、production build 全數通過。
- `pnpm smoke:course`：W01-only、Desktop／390px Mobile、Assessment no-hints、v2 export、teacher summary、Lab provenance、config failure degradation 全數通過。
- `pnpm smoke:onboarding`、`smoke:mobile:flow`、`smoke:layout`、`smoke:deployment:compact`、`smoke:operation:compact`、`smoke:gameplay`：全數通過。
- Pilot Protocol：DOCX 9 頁逐頁 render 無裁切／重疊；accessibility audit 為 0 finding。
- Pilot workbook：5 sheets 全數 render；初始狀態為 `INCOMPLETE`，synthetic QA 的完整 3 人案例為 `GO`，加入 P1 後為 `REVISE`，formula error scan 為 0。Synthetic QA 未寫入交付檔，也不是學生資料。
- Pilot-kit commit `b0ba990` 已推送 `main`；GitHub Actions run `33833318924` 的 teaching deployment validation、Desktop／Mobile Course smoke、offline backup 與 Pages deploy 全數成功。公開 CourseConfig 回讀仍為 `3.59.0-student-quick-start`、`frozen=true`、W01-only。
- Balance 保持：Campaign L1 6/6、L3 12/12、L5 15/15 required missions；Boss 100/100；MNT 55；最大持續疲勞 76%；未依 automated evidence 調整難度。
- GitHub `main` 已更新；Actions run `33829151062` 的 build／Desktop-Mobile Course smoke／offline backup／Pages deploy 全數成功。
- GitHub Actions run `33831521060` 的 validation、Desktop／Mobile Course smoke、offline backup 與 Pages deployment 全數成功；公開 CourseConfig 已回讀為 `3.59.0-student-quick-start`。

## 學生體驗觀察

- [RESULT] 功能與版面 smoke 均通過，Desktop 1366×768 與 Mobile 390px 無水平溢位，主要流程可完成。
- [RESULT] Assessment 畫面已移除明示推薦，現場畫面與下一步區塊保持清楚。
- [RESULT] Mobile Course 首頁完整高度已由約 2724px 降為 1668px（約減少 39%）；Locked weeks 改為進度列，Engineering Lab 預設收合。
- [RESULT] 390px × 844px 的第一個 viewport 已包含匿名代碼區與主要 Assessment CTA。
- [BLOCKER] 尚無真人學生的 time-to-first-action、任務完成時間、誤觸、卡關點與主觀吸引力資料；automated smoke 不能取代人因證據。

## 下一個建議增量

`Student Quick Start` UI 與空白 pilot kit 已完成；下一步以真人 pilot 驗證，不先調整 frozen balance：

1. 由教師核准獨立 staging/local pilot candidate 與日期，只在該 candidate 解鎖 W09/W10；公開 W01-only 不變。
2. 複製空白 workbook 到 `pilot-results-private/`，執行 3–5 位真人學生 Desktop／Mobile think-aloud pilot。
3. 依真人 evidence 決定是否調整 Guided Practice 因果回饋、教學訊息或下一版遊戲節奏；任何 scoring/balance 變更另建 release。
