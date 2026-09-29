# OWM 下一次工作交接 — 2026-09-28

> **已取代**:請改讀 `NEXT_SESSION_HANDOFF_2026-09-29.md`。


## 目前權威狀態

- Version：`3.62.0-course-content-integrity`（本輪改動了顯示中的教學內容，故五處版本號同步 bump）
- CourseConfig：`2026-FALL-manual-release-v1`（沿用既有 config id，內容未變）
- Semester policy：`frozen=true`（**尚未依關卡模式調整，見下方「關卡模式轉換」待辦**）
- Released weeks：W01 only（未變）
- Assignments：W01–W15，共 15 組
- Course Record：schema v2；正式 `decisionOrder` 僅接受 `learner + assessment_runtime`
- Assessment：REC／GUIDE、skill forecast、end-round forecast、正確診斷 DOM 標記均停用
- 資料範圍：只收匿名代碼與學生主動 Save／Export 的 compact Course Record；不建立帳號、gradebook 或 continuous telemetry

## 專案定位（擁有者 2026-09-22 決定，沿用中）

專案不再與學生學期綁定，朝「關卡模式」發展：教師隨時決定開放哪些關卡，不受 `2026-FALL` 學期日程約束。過去因「會改變分數語意或顯示數值」而被列為「必須等下一個學期版」的項目仍然可以做。本輪選擇的是 `OPS_SYSTEM_REVIEW_2026-08-31.md` D 節第 5 項，會改變 Course 首頁政策徽章文案，依此政策直接動手並 bump 版本號。

## 2026-09-28 增量：D5 randomSeed 作用範圍標示、FIXED SEED 徽章文案修正、決定性守門測試

1. **問題**（`OPS_SYSTEM_REVIEW_2026-08-31.md` D 節第 5 項）：
   - `randomSeed` 只有 `createMissionEngineeringPack`（SCADA/CMS 溫度通道雜訊相位與缺值位置）會讀取；assignment 的 `teamIds`／`equipmentId`／`spareId`／`vesselId`、診斷內容、正確答案與計分全部來自以 `missionId` 查詢的固定資料，本身沒有可播種的執行期隨機性。
   - 任務可重現的真正原因是「這條路徑完全沒有隨機性」，不是「seed 把隨機性鎖住了」；`CourseModePanel.tsx` 首頁的政策徽章列（`NO REC`／`NO GUIDE`／`ANONYMOUS`／`FIXED SEED`）卻用 `FIXED SEED` 暗示了後者，屬於教學內容/系統機制描述不準確。
   - 未來若有人在部署／結算路徑誤植 `Math.random()`（例如加入難度變異或抽樣題序），先前沒有任何測試會抓到重現性被破壞。
2. **修復**：
   - `src/domain/course.ts`：`CourseAssignment.randomSeed` 與 `CourseAttempt.randomSeed` 補上 JSDoc／註解，明確標示只餵給 SCADA/CMS 資料包雜訊，與診斷內容、計分無關。
   - `src/components/CourseModePanel.tsx`：政策徽章由 `FIXED SEED` 改為 `DETERMINISTIC`。`src/components/CourseEngineeringLab.tsx` 逐週資料包旁的 `FIXED SEED`（準確標示該週資料包實際使用的 seed 值）維持不變。
   - `COURSE_MODE_GUIDE.md`：補充 `randomSeed` 實際作用範圍與兩個徽章差異的說明。
   - `src/domain/course.test.ts`：新增 domain test，mock `Math.random` 使其丟例外，驗證「部署並結算同一 assignment 兩次」全程不呼叫 `Math.random`、且兩次 `attempts`／`events` 完全一致。
3. **測試**：測試數由 187 增至 188（仍 28 test files）。
4. `OPS_SYSTEM_REVIEW_2026-08-31.md` D 節第 5 項已標記已修復。

## 驗證結果

- `pnpm install --frozen-lockfile` ✅
- `pnpm sync:data` ✅（乾淨 clone 必跑）
- `pnpm typecheck` ✅、`pnpm test` ✅ 28 test files／188 tests（187 → 188，新增 1 個 domain test）
- `pnpm validate:teaching-deployment`（`simulate:challenge` → `sync:data` → `validate_owm_data.py --course-deployment` → `validate:course` → `test` → `simulate:balance` → `build:pages`）✅ 全綠；`validate-course-config.mjs` 確認 `releaseVersion` 與 `package.json` 一致（`3.62.0-course-content-integrity`）
- `pnpm smoke:course`（`CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`）✅ 全流程通過（含新的 `DETERMINISTIC` 徽章、版本斷言）
- Balance 保持不變：Campaign L1 6/6、L3 12/12、L5 15/15 required；Boss 100/100；MNT 55；最大持續疲勞 76%；未依 automated evidence 調整難度
- 公開 config 版本、`unlockedWeekIds`（W01-only）、`frozen=true` 均未變動（除 `releaseVersion` 依五處同步規則 bump 外）

## PR 與合併

- PR：`fix(course): label randomSeed scope, correct FIXED SEED badge wording, guard determinism (D5)` → `main`
- CI（`pr-validation.yml` 與 `deploy-course-pages.yml` 的 `build` job）需於合併前／後在最新 commit 上跑一次全綠。
- 合併後應確認：(a) Pages 部署成功；(b) 公開 `course/course-config.json` 的 `releaseVersion` 讀回 `3.62.0-course-content-integrity`、`unlockedWeekIds` 仍為 W01-only、`frozen=true` 不變。

## 下一個建議增量（可自動推進，依優先序）

1. **actions SHA pinning**（C5 剩餘項）：仍需要能連線 `api.github.com`（或其他可信來源）解析第三方 action 目前 major tag 對應的 commit SHA。本次自動化 session 再次嘗試 `curl https://api.github.com/...`，proxy 仍回傳 403（網路存取範圍僅限本 repo），因此仍未處理，留給下一個有較廣網路存取的 session。
2. **D4**：資料包目前以 `assignmentIndex`（陣列位置）為鍵，不是 `randomSeed` 派生；config 重排/插入一週會靜默改變之後所有週的時間戳、嚴重度與全部 KPI 答案。建議先出設計草案文件（如何從 `randomSeed` 純函式派生現有 15 週的既定輸出，避免學生既有作業的正確答案被意外改變），下一輪再實作＋補 `validate-course-config` 的順序 pin 檢查。屬於「大型項目拆階段」的候選。
3. **關卡模式轉換**：重新設計 `course-config.json` 的 `frozen` 語意與 `validate-course-config.mjs` 的檢查規則，讓教師能自由開關任意關卡組合而 CI 仍擋得下真正的設定錯誤。建議先出設計草案文件（新 schema、驗證規則、與現有 `unlockedWeekIds` 手動流程的相容性），再分階段實作。
4. **D7-D9**（文件性任務／內容缺口，較小工作量）：
   - D7：`LOTO_VERIFIED` 是 stage 代理指標（過 Isolate 階段即記 `zeroEnergy: true`），評分語意需向教師說明（`COURSE_MODE_GUIDE.md` 補一節）。
   - D8：`codex.sourceNoteZh/En` 有載入、有驗證但從未渲染（`App.tsx:5271` 只顯示 `safetyNote`），是內容缺口，可考慮在 Codex 詳情補一行來源出處，或若確定不需要則移除驗證與載入邏輯（先確認二擇一的教學需求）。
   - D9：角色卡顯示的 `INT`／`atk`／`def`／`speed` 在 runtime 完全無作用（只有離線平衡工具讀取），學生會誤以為有影響；建議在卡片加註「僅供平衡設計參考，不影響戰鬥結果」或移除顯示。
5. smoke 未覆蓋完整 Assessment 結算/計分/Debrief 生命週期（`tools/smoke-course-mode.mjs` 目前只玩到任務中途就匯出）。
6. **環境相依的 smoke 缺口**：若未來的自動化 session 拿到完整本機素材庫，建議跑一次完整 `pnpm smoke:gameplay`／`smoke:layout`／`smoke:operation:compact`，確認共用 `resolveChromePath()` 之後這些 smoke 在真正的 CI 素材環境下仍能通過。

## 仍待擁有者親自處理（不可自動化，已提醒過）

- 真人 pilot／playtest 的招募與執行（`pilot-results-private/` 仍為 0 筆真人資料；`COURSE_MODE_PILOT_PROTOCOL_v1.0.docx`／`COURSE_MODE_PILOT_OBSERVATION_v1.0.xlsx` 空白 kit 已就緒）。
- P01 production art 的 final AI upscale（需 GPU 與模型權重；staging 檔仍為 deterministic resize，Queue 210 Upscale Pending／90 QA Pending／0 Approved）。
- 課務與教學現場決策（含關卡模式下實際要開放哪些關卡組合）。
