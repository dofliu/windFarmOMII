# OWM 下一次工作交接 — 2026-09-27

## 目前權威狀態

- Version：`3.61.0-course-content-integrity`（本輪改動了顯示中的教學內容，故五處版本號同步 bump）
- CourseConfig：`2026-FALL-manual-release-v1`（沿用既有 config id，內容未變）
- Semester policy：`frozen=true`（**尚未依關卡模式調整，見下方「關卡模式轉換」待辦**）
- Released weeks：W01 only（未變）
- Assignments：W01–W15，共 15 組
- Course Record：schema v2；正式 `decisionOrder` 僅接受 `learner + assessment_runtime`
- Assessment：REC／GUIDE、skill forecast、end-round forecast、正確診斷 DOM 標記均停用
- 資料範圍：只收匿名代碼與學生主動 Save／Export 的 compact Course Record；不建立帳號、gradebook 或 continuous telemetry

## 專案定位（擁有者 2026-09-22 決定，沿用中）

專案不再與學生學期綁定，朝「關卡模式」發展：教師隨時決定開放哪些關卡，不受 `2026-FALL` 學期日程約束。過去因「會改變分數語意或顯示數值」而被列為「必須等下一個學期版」的項目仍然可以做。本輪選擇的是 `OPS_SYSTEM_REVIEW_2026-08-31.md` D 節第 6 項，會改變 Engineering Lab 顯示內容（KPI 卡文字、Alarm tester 示範值），依此政策直接動手並 bump 版本號。

## 2026-09-27 增量：D6 Availability/MTBF 口徑標示、hysteresis=0 抖動修復、Alarm tester 改用該週資料包

1. **問題**（`OPS_SYSTEM_REVIEW_2026-08-31.md` D 節第 6 項）：
   - Availability 未標示是 time-based（IEC 61400-26）、production-based 還是 contractual；分母排除計畫保養其實是一個契約性選擇，未言明。
   - MTBF 的區間慣例（除以故障數 n，還是 n-1）未標註，容易與其他文獻的定義混淆。
   - `runAlarmTest` 的 `hysteresis=0` 時，set 與 reset 門檻是同一個值；原本 `ResetCondition := ProcessValue <= threshold` 會讓 held-at-threshold 的訊號每個樣本在 ALARM_SET／ALARM_RESET 間抖動。
   - Alarm/Interlock tester 的示範訊號是 `CourseEngineeringLab.tsx:33` 寫死的 9 點樣本 `[68, 71, 72.5, 74, 76, 75, 73, 70, 68]`，15 週完全相同，不反映各週資料包的差異。
2. **修復**：
   - KPI 卡片（`Availability`／`MTBF`）與 `ReliabilityKpis` 型別的 JSDoc 加註：Availability 為 time-based（分母排除計畫保養，非 production-based／contractual）；MTBF 為 n-based 慣例。純標示，計算數值不變。
   - `runAlarmTest` 與 `generateStructuredText` 的 `ResetCondition` 由 `<=` 改為嚴格 `<`（domain 邏輯與產生的 ST 文字同步修正，保持兩者語意一致）。
   - 新增 `deriveAlarmTestSignal(pack)`：從該週資料包的溫度通道（缺值向前補值）推導示範訊號，並依故障家族基準（DRIVETRAIN 68／PITCH_YAW_HYDRAULIC 54／GENERATOR_ELECTRICAL 74，+4 作為建議門檻）推導建議 `AlarmTesterConfig`。`CourseEngineeringLab.tsx` 改用此函式，切換週次時自動重設為新週次的建議設定；Control 分頁新增訊號來源說明文字。
3. **測試**：新增 2 個 `courseEngineering.test.ts` 案例——(a) hysteresis=0 時 held-at-threshold 訊號應 latch 於 `HYSTERESIS_HOLD` 不抖動；(b) 不同週次的資料包會推導出不同且決定性可重現的訊號。既有的 ST／模擬器一致性測試（`simulateGeneratedStructuredText`）同步更新為嚴格 `<` 比對。測試數由 185 增至 187（仍 28 test files）。
4. `OPS_SYSTEM_REVIEW_2026-08-31.md` D 節第 6 項已標記已修復。`COURSE_MODE_GUIDE.md` 同步加註 Availability／MTBF 口徑與 Alarm tester 訊號來源的教師可見說明。

## 驗證結果

- `pnpm install --frozen-lockfile` ✅
- `pnpm sync:data` ✅（乾淨 clone 必跑）
- `pnpm typecheck` ✅、`pnpm test` ✅ 28 test files／187 tests（185 → 187，新增 2 個 domain test）
- `pnpm validate:teaching-deployment`（`simulate:challenge` → `sync:data` → `validate_owm_data.py --course-deployment` → `validate:course` → `test` → `simulate:balance` → `build:pages`）✅ 全綠；`validate-course-config.mjs` 確認 `releaseVersion` 與 `package.json` 一致（`3.61.0-course-content-integrity`）
- `pnpm smoke:course`（`CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`）✅ 全流程通過，含 Control 分頁與產生的 ST 文字斷言
- Balance 保持不變：Campaign L1 6/6、L3 12/12、L5 15/15 required；Boss 100/100；MNT 55；最大持續疲勞 76%；未依 automated evidence 調整難度
- 公開 config 版本、`unlockedWeekIds`（W01-only）、`frozen=true` 均未變動（除 `releaseVersion` 依五處同步規則 bump 外）

## PR 與合併

- PR：`fix(course): label Availability/MTBF basis, fix hysteresis=0 alarm chatter, wire tester to weekly data pack (D6)` → `main`
- CI（`pr-validation.yml` 與 `deploy-course-pages.yml` 的 `build` job）需於合併前／後在最新 commit 上跑一次全綠。
- 合併後應確認：(a) Pages 部署成功；(b) 公開 `course/course-config.json` 的 `releaseVersion` 讀回 `3.61.0-course-content-integrity`、`unlockedWeekIds` 仍為 W01-only、`frozen=true` 不變。

## 下一個建議增量（可自動推進，依優先序）

1. **actions SHA pinning**（C5 剩餘項）：仍需要能連線 `api.github.com`（或其他可信來源）解析第三方 action 目前 major tag 對應的 commit SHA。本次自動化 session 再次嘗試 `curl https://api.github.com/...`，proxy 仍回傳 403（網路存取範圍僅限本 repo），因此仍未處理，留給下一個有較廣網路存取的 session。
2. **D4**：資料包目前以 `assignmentIndex`（陣列位置）為鍵，不是 `randomSeed` 派生；config 重排/插入一週會靜默改變之後所有週的時間戳、嚴重度與全部 KPI 答案。建議先出設計草案文件（如何從 `randomSeed` 純函式派生現有 15 週的既定輸出，避免學生既有作業的正確答案被意外改變），下一輪再實作＋補 `validate-course-config` 的順序 pin 檢查。屬於「大型項目拆階段」的候選。
3. **D5**：`randomSeed` 沒有進入任務模擬本身（只有 SCADA pack 用它），任務可重現是因為模擬無隨機性，不是 seed 的功勞；UI 的 `FIXED SEED` chip 暗示了不存在的控制。建議加一個「同一 assignment 兩次模擬結果一致」的 domain test 當守門，並考慮調整 chip 文案避免誤導。
4. **關卡模式轉換**：重新設計 `course-config.json` 的 `frozen` 語意與 `validate-course-config.mjs` 的檢查規則，讓教師能自由開關任意關卡組合而 CI 仍擋得下真正的設定錯誤。建議先出設計草案文件（新 schema、驗證規則、與現有 `unlockedWeekIds` 手動流程的相容性），再分階段實作。
5. **D7-D9**：`LOTO_VERIFIED` 是 stage 代理指標（過 Isolate 階段即記 `zeroEnergy: true`），評分語意需向教師說明（文件性任務）；`codex.sourceNoteZh/En` 有載入、有驗證但從未渲染（`App.tsx:5271` 只顯示 `safetyNote`），是內容缺口；角色卡顯示的 `INT`／`atk`／`def`／`speed` 在 runtime 完全無作用，只有離線平衡工具讀取，學生會誤以為有影響。
6. smoke 未覆蓋完整 Assessment 結算/計分/Debrief 生命週期（`tools/smoke-course-mode.mjs` 目前只玩到任務中途就匯出）。
7. **環境相依的 smoke 缺口**：若未來的自動化 session 拿到完整本機素材庫，建議跑一次完整 `pnpm smoke:gameplay`／`smoke:layout`／`smoke:operation:compact`，確認共用 `resolveChromePath()` 之後這些 smoke 在真正的 CI 素材環境下仍能通過。

## 仍待擁有者親自處理（不可自動化，已提醒過）

- 真人 pilot／playtest 的招募與執行（`pilot-results-private/` 仍為 0 筆真人資料；`COURSE_MODE_PILOT_PROTOCOL_v1.0.docx`／`COURSE_MODE_PILOT_OBSERVATION_v1.0.xlsx` 空白 kit 已就緒）。
- P01 production art 的 final AI upscale（需 GPU 與模型權重；staging 檔仍為 deterministic resize，Queue 210 Upscale Pending／90 QA Pending／0 Approved）。
- 課務與教學現場決策（含關卡模式下實際要開放哪些關卡組合）。
