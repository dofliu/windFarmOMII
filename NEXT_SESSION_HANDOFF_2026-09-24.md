# OWM 下一次工作交接 — 2026-09-24

> **[已取代]** 本檔已由 `NEXT_SESSION_HANDOFF_2026-09-25.md` 取代,請以該檔為準。以下內容保留為當時的交接紀錄。

## 目前權威狀態

- Version：`3.60.0-course-content-integrity`
- CourseConfig：`2026-FALL-manual-release-v1`（沿用既有 config id，內容未變）
- Semester policy：`frozen=true`（**尚未依關卡模式調整，見下方「關卡模式轉換」待辦**）
- Released weeks：W01 only（未變）
- Assignments：W01–W15，共 15 組
- Course Record：schema v2；正式 `decisionOrder` 僅接受 `learner + assessment_runtime`
- Assessment：REC／GUIDE、skill forecast、end-round forecast、正確診斷 DOM 標記均停用
- 資料範圍：只收匿名代碼與學生主動 Save／Export 的 compact Course Record；不建立帳號、gradebook 或 continuous telemetry

## 專案定位更新（擁有者 2026-09-22 決定，重要）

專案不再與學生學期綁定，朝「關卡模式」發展：教師隨時決定開放哪些關卡，不受 `2026-FALL` 學期日程約束。過去因「會改變分數語意或顯示數值」而被列為「必須等下一個學期版」的項目**現在可以做**。本輪即是在此政策下推進 `OPS_SYSTEM_REVIEW_2026-08-31.md` D 節的第一批項目。

`course-config.json` 的 `frozen: true` 語意與 `tools/validate-course-config.mjs` 的硬性檢查**仍是舊學期模型**，尚未重新設計成關卡模式（教師自由開關任意關卡組合、CI 仍能擋下真正的設定錯誤）。這是下一個建議的大項，見下方。

## 2026-09-24 增量：D1–D3 教學內容正確性修復

1. **D1 OPEX**：`src/domain/courseEngineering.ts` 的 `calculateReliabilityKpis` 不再把 lost revenue 併入 `opex`（`opex` 現在只是 labor + parts + vessel）；新增 `totalDowntimeCost = lostRevenue + opex`。`CourseEngineeringLab.tsx` 的 KPI grid 新增獨立「Total downtime cost」卡片，OPEX 公式文字改為「Labor + parts + vessel (excludes lost revenue)」。
2. **D2 IEC 61131-3 ST 語意**：`generateStructuredText` 的 `AlarmDelay` 改為 `IN := HighCondition`（直接由高值條件觸發，與 `PersistCounter` 並行起算），alarm 判斷改為 `PersistCounter.Q AND AlarmDelay.Q`，不再是 `AlarmDelay(IN := PersistCounter.Q, ...)` 的串聯語意。修正後與 `runAlarmTest` 模擬器的既有行為完全一致（此前預設參數下兩者差 10 秒）。
3. **D3 KPI 零值語意**：`availabilityPercent`（`observableHours <= 0` 時）、`mtbfHours`／`mttrHours`（`failures === 0` 時）改回傳 `null`；UI 顯示 `N/A` 而非會被誤讀為「最差狀況」的 `0`。目前 15 週生成資料 `failures >= 1` 恆成立，這是地雷修復，UI 顯示數字不受影響。
4. 測試：新增「零故障/零觀測回 N/A」與「ST 文字獨立重新解析＋重新模擬，與模擬器輸出比對（多組參數，含 default/delay=0/persistence=1 邊界）」兩個 domain test，取代原本只 grep `PersistCounter`／`AlarmDelay` 字串的弱測試。測試數 183 → 185（仍 28 test files）。
5. 版本號五處同步（`package.json`、`course-config.json`、`COURSE_RELEASE`、`deploy-course-pages.yml` 離線 ZIP 檔名 ×2）；順便修正 `deploy-course-pages.yml` 的 ZIP 檔名先前已停留在 `3.58.0`（比 `package.json` 舊一版）的既有落差。
6. `OPS_SYSTEM_REVIEW_2026-08-31.md` 的 D1–D3 已標記已修復並附版本號；H 節第 9 項同步更新。
7. `COURSE_MODE_GUIDE.md`、`CHANGELOG.md`、`task_progress.md`、`README.md`、`RELEASE_READINESS.md` 已同步更新（測試數快照、OPEX／N/A 語意說明）。

## 驗證結果

- `pnpm install --frozen-lockfile` ✅
- `pnpm sync:data` ✅（乾淨 clone 必跑）
- `pnpm typecheck` ✅、`pnpm test` ✅ 28 test files／185 tests
- `pnpm validate:teaching-deployment`（`simulate:challenge` → `sync:data` → `validate_owm_data.py --course-deployment` → `validate:course` → `test` → `simulate:balance` → `build:pages`）✅ 全綠
- `pnpm smoke:course`（Chromium headless，`/windFarmOMII/` base）✅ 全流程通過，含更新後的 6 張 KPI 卡斷言（`tools/smoke-course-mode.mjs` 已從 5 改為 6）
- Balance 保持不變：Campaign L1 6/6、L3 12/12、L5 15/15 required；Boss 100/100；MNT 55；最大持續疲勞 76%；未依 automated evidence 調整難度
- 公開 config 版本、`unlockedWeekIds`（W01-only）、`frozen=true` 均未變動，只有 `releaseVersion` 隨版本號更新

## 下一個建議增量（可自動推進，依優先序）

1. **D4**：資料包目前以 `assignmentIndex`（陣列位置）為鍵，不是 `randomSeed` 派生；config 重排/插入一週會靜默改變之後所有週的時間戳、嚴重度與全部 KPI 答案。建議先出設計草案（如何從 `randomSeed` 純函式派生現有 15 週的既定輸出，避免學生既有作業的正確答案被意外改變），下一輪再實作＋補 `validate-course-config` 的順序 pin 檢查。屬於「大型項目拆階段」的候選。
2. **關卡模式轉換**：重新設計 `course-config.json` 的 `frozen` 語意與 `validate-course-config.mjs` 的檢查規則，讓教師能自由開關任意關卡組合而 CI 仍擋得下真正的設定錯誤。建議先出設計草案文件（新 schema、驗證規則、與現有 `unlockedWeekIds` 手動流程的相容性），再分階段實作。
3. **C 節穩定性**：換角色銷毀重建 Phaser WebGL（`OffshoreScene.tsx` 的 `accent` 依賴應改 runtime setter）；CI 無 PR 驗證；離線 ZIP 打包失敗擋住 Pages 部署（應拆 job）；actions 用 mutable major tag、無 `timeout-minutes`。
4. **D5-D9**：Availability 口徑標示、`hysteresis=0` 抖動、Alarm tester 改用該週資料包而非硬編碼樣本、`LOTO_VERIFIED` 評分語意向教師說明、`codex.sourceNoteZh/En` 未渲染、角色卡 `INT`/`atk`/`def`/`speed` runtime 無作用的誤導性顯示。
5. smoke 未覆蓋完整 Assessment 結算/計分/Debrief 生命週期（`tools/smoke-course-mode.mjs` 目前只玩到任務中途就匯出）。

## 仍待擁有者親自處理（不可自動化，已提醒過）

- 真人 pilot／playtest 的招募與執行（`pilot-results-private/` 仍為 0 筆真人資料；`COURSE_MODE_PILOT_PROTOCOL_v1.0.docx`／`COURSE_MODE_PILOT_OBSERVATION_v1.0.xlsx` 空白 kit 已就緒）。
- P01 production art 的 final AI upscale（需 GPU 與模型權重；staging 檔仍為 deterministic resize，Queue 210 Upscale Pending／90 QA Pending／0 Approved）。
- 課務與教學現場決策（含關卡模式下實際要開放哪些關卡組合）。
