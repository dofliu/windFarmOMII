# OWM 下一次工作交接 — 2026-09-04

## 目前權威狀態

- Version：`3.58.0-course-record-integrity`
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

## 驗證結果

- `pnpm validate`：28 test files／183 tests；Data／Scene／Art／Course、Campaign／Challenge balance、production build 全數通過。
- `pnpm smoke:course`：W01-only、Desktop／390px Mobile、Assessment no-hints、v2 export、teacher summary、Lab provenance、config failure degradation 全數通過。
- `pnpm smoke:onboarding`、`smoke:mobile:flow`、`smoke:layout`、`smoke:deployment:compact`、`smoke:operation:compact`、`smoke:gameplay`：全數通過。
- Balance 保持：Campaign L1 6/6、L3 12/12、L5 15/15 required missions；Boss 100/100；MNT 55；最大持續疲勞 76%；未依 automated evidence 調整難度。
- GitHub `main` 已更新；Actions run `33829151062` 的 build／Desktop-Mobile Course smoke／offline backup／Pages deploy 全數成功。
- 公開站 `https://dofliu.github.io/windFarmOMII/` 回應 HTTP 200；公開 CourseConfig 已回讀為 `3.58.0-course-record-integrity`。

## 學生體驗觀察

- [RESULT] 功能與版面 smoke 均通過，Desktop 1366×768 與 Mobile 390px 無水平溢位，主要流程可完成。
- [RESULT] Assessment 畫面已移除明示推薦，現場畫面與下一步區塊保持清楚。
- [INFERENCE] Mobile Course 首頁完整高度約 2724px；Locked weeks 與 Engineering Lab 在開始任務前佔用大量垂直空間，會增加首次進場摩擦。
- [INFERENCE] 目前週卡採橫向瀏覽，390px 只露出下一張卡的一小部分；可理解為可滑動，但主要 CTA 的視覺焦點仍可更集中。
- [BLOCKER] 尚無真人學生的 time-to-first-action、任務完成時間、誤觸、卡關點與主觀吸引力資料；automated smoke 不能取代人因證據。

## 下一個建議增量

先做一個不改平衡的 `Student Quick Start` UI 增量：

1. Course 首屏只突出「本週任務」與一個主要 CTA，Locked weeks 收合成進度列。
2. Engineering Lab 預設收合，完成或選定本週任務後再展開；Mobile 先顯示任務目標、預估 8–12 分鐘與目前進度。
3. Guided Practice 增加即時因果回饋；Assessment 只在行動後顯示結果，不提供下一步推薦。
4. 加入本機、匿名的週任務完成摘要與視覺成就回饋，不新增帳號、排行榜、gradebook 或 continuous telemetry。
5. 完成後執行 3–5 位真人學生 W09→W10 Desktop／Mobile think-aloud pilot，量測首次操作時間、完成時間、返回／誤觸次數、卡關點與 1–5 吸引力評分，再決定是否調整教學訊息或平衡。
