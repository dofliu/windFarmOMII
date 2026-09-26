# OWM 下一次工作交接 — 2026-09-25

> **[已取代]** 本檔已由 `NEXT_SESSION_HANDOFF_2026-09-26.md` 取代,請以該檔為準。以下內容保留為當時的交接紀錄。

## 目前權威狀態

- Version：`3.60.0-course-content-integrity`（本輪為 in-place stability hotfix，版本號未變）
- CourseConfig：`2026-FALL-manual-release-v1`（沿用既有 config id，內容未變）
- Semester policy：`frozen=true`（**尚未依關卡模式調整，見下方「關卡模式轉換」待辦**）
- Released weeks：W01 only（未變）
- Assignments：W01–W15，共 15 組
- Course Record：schema v2；正式 `decisionOrder` 僅接受 `learner + assessment_runtime`
- Assessment：REC／GUIDE、skill forecast、end-round forecast、正確診斷 DOM 標記均停用
- 資料範圍：只收匿名代碼與學生主動 Save／Export 的 compact Course Record；不建立帳號、gradebook 或 continuous telemetry

## 專案定位（擁有者 2026-09-22 決定，沿用中）

專案不再與學生學期綁定，朝「關卡模式」發展：教師隨時決定開放哪些關卡，不受 `2026-FALL` 學期日程約束。過去因「會改變分數語意或顯示數值」而被列為「必須等下一個學期版」的項目仍然可以做。本輪選擇的是關卡模式解禁範圍外、C 節穩定性中一個獨立、不涉及分數語意的技術性修復。

## 2026-09-25 增量：C4 換角色銷毀重建 Phaser WebGL 修復

1. **問題**：`OffshoreScene.tsx` 建游戲 `useEffect` 的依賴陣列包含 `accent`（陣營色，只用來畫一個 5×56px 色條）。玩家在戰鬥中切換不同陣營的隊員時，整個 Phaser 遊戲會 `game.destroy(true)` 再 `new Phaser.Game(...)`，在教室等級硬體上會有明顯卡頓，且瀏覽器對同時存活的 WebGL context 數量有上限。
2. **修復**：新增 `WindFieldScene.updateAccent(accent: string)` runtime setter（比照既有 `updateTelemetry`／`updateHazard` 的模式，用 `Phaser.GameObjects.Rectangle.setFillStyle` 原地更新色條），並將 `accent` 從建游戲 effect 的依賴陣列移除，改由獨立的 `useEffect(() => sceneRef.current?.updateAccent(accent), [accent])` 呼叫。現在只有 `reducedMotion` 或 `sceneRoute`（scene asset／fallback／QA 狀態／版本等）真的變動時，才會整個銷毀重建 Phaser game。
3. **測試**：
   - `tools/smoke-gameplay.mjs` 新增斷言：在第一回合切換隊員之前，先在 `.phaser-host canvas` 元素上標記一個 `data-` 屬性；輪流點擊全部 3 個隊員分頁後，驗證同一個 canvas 元素（同一個 WebGL context）仍帶著該標記——若被銷毀重建，新 canvas 不會有這個標記，斷言即失敗。
   - 由於本環境的 `sync:art` 只同步了課程模式精簡素材（0 個本機 P01 全解析度檔），`smoke-gameplay.mjs` 會在更早的 `.portrait-placeholder.has-source-art` 斷言逾時，屬於既有已知的環境限制（見 `NEXT_SESSION_HANDOFF_2026-09-24.md` 對 gameplay/layout/operation:compact smoke 的說明），與本次改動無關，未觸及新增的 canvas 持續性斷言。
   - 因此另外寫了一支**不落地**的暫存 Playwright 驗證腳本（僅在本次 session 執行後即刪除，未提交），繞過 crew-profile 素材頁、直接走 campaign deploy → crew tabs 切換流程，直接驗證本次修復的行為：**修復前**執行會在 canvas 持續性斷言處失敗（確認舊行為確實會重建），**修復後**執行則通過。新增到 `smoke-gameplay.mjs` 的斷言邏輯與這支暫存腳本完全一致，只是受限於本環境的素材缺口，尚未在 CI 或本環境的 `pnpm smoke:gameplay` 完整流程中被實際跑到；下次有完整本機素材庫的環境跑 `pnpm smoke:gameplay` 時會自然覆蓋到。
4. **版本號**：未改動分數、任務條件或存檔語意，維持 `3.60.0-course-content-integrity`，比照既有 in-place stability hotfix 模式（如 `3.57.1-course-mode-p0` 的 08-31／09-02 P0/P1 熱修），不需要五處版本號同步。
5. `OPS_SYSTEM_REVIEW_2026-08-31.md` C 節第 4 項已標記已修復並附版本號。
6. `CHANGELOG.md`、`task_progress.md` 已同步更新本輪增量。教師可見行為與驗證基準（測試數）皆未變動，故未觸碰 `COURSE_MODE_GUIDE.md`／`README.md`／`RELEASE_READINESS.md`。

## 驗證結果

- `pnpm install --frozen-lockfile` ✅
- `pnpm sync:data` ✅（乾淨 clone 必跑）
- `pnpm typecheck` ✅、`pnpm test` ✅ 28 test files／185 tests（與 09-24 基準相同，本輪未新增 domain test，屬 UI-only 修復）
- `pnpm validate:teaching-deployment`（`simulate:challenge` → `sync:data` → `validate_owm_data.py --course-deployment` → `validate:course` → `test` → `simulate:balance` → `build:pages`）✅ 全綠
- `pnpm smoke:course`（Chromium headless，`/windFarmOMII/` base）✅ 全流程通過
- `pnpm smoke:gameplay` ❌ 在本環境於既有已知的 source-art 環境限制處逾時（與本次改動無關，未觸及新增斷言）；改用暫存 Playwright 腳本直接驗證核心修復行為，已在修復前確認失敗、修復後確認通過（見上）
- Balance 保持不變：Campaign L1 6/6、L3 12/12、L5 15/15 required；Boss 100/100；MNT 55；最大持續疲勞 76%；未依 automated evidence 調整難度
- 公開 config 版本、`unlockedWeekIds`（W01-only）、`frozen=true` 均未變動

## 下一個建議增量（可自動推進，依優先序）

1. **D4**：資料包目前以 `assignmentIndex`（陣列位置）為鍵，不是 `randomSeed` 派生；config 重排/插入一週會靜默改變之後所有週的時間戳、嚴重度與全部 KPI 答案。建議先出設計草案（如何從 `randomSeed` 純函式派生現有 15 週的既定輸出，避免學生既有作業的正確答案被意外改變），下一輪再實作＋補 `validate-course-config` 的順序 pin 檢查。屬於「大型項目拆階段」的候選。
2. **關卡模式轉換**：重新設計 `course-config.json` 的 `frozen` 語意與 `validate-course-config.mjs` 的檢查規則，讓教師能自由開關任意關卡組合而 CI 仍擋得下真正的設定錯誤。建議先出設計草案文件（新 schema、驗證規則、與現有 `unlockedWeekIds` 手動流程的相容性），再分階段實作。
3. **C 節剩餘項**：CI 無 PR 驗證（只有 push main 觸發）；離線 ZIP 打包步驟失敗會連 Pages 部署一起擋掉（應拆 job）；`CHROME_PATH` 硬指 `/usr/bin/google-chrome` 且 `??` 讓 fallback 清單失效；actions 用 mutable major tag、無 `timeout-minutes`。
4. **D5-D9**：Availability 口徑標示、`hysteresis=0` 抖動、Alarm tester 改用該週資料包而非硬編碼樣本、`LOTO_VERIFIED` 評分語意向教師說明、`codex.sourceNoteZh/En` 未渲染、角色卡 `INT`/`atk`/`def`/`speed` runtime 無作用的誤導性顯示。
5. smoke 未覆蓋完整 Assessment 結算/計分/Debrief 生命週期（`tools/smoke-course-mode.mjs` 目前只玩到任務中途就匯出）。
6. **環境相依的 smoke 缺口**：若未來的自動化 session 拿到完整本機素材庫，建議跑一次完整 `pnpm smoke:gameplay`，確認本輪新增的 canvas 持續性斷言在真正的 CI 素材環境下也能通過（邏輯已用暫存腳本驗證，只是本環境跑不到那一段）。

## 仍待擁有者親自處理（不可自動化，已提醒過）

- 真人 pilot／playtest 的招募與執行（`pilot-results-private/` 仍為 0 筆真人資料；`COURSE_MODE_PILOT_PROTOCOL_v1.0.docx`／`COURSE_MODE_PILOT_OBSERVATION_v1.0.xlsx` 空白 kit 已就緒）。
- P01 production art 的 final AI upscale（需 GPU 與模型權重；staging 檔仍為 deterministic resize，Queue 210 Upscale Pending／90 QA Pending／0 Approved）。
- 課務與教學現場決策（含關卡模式下實際要開放哪些關卡組合）。
