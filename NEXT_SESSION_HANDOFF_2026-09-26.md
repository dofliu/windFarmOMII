# OWM 下一次工作交接 — 2026-09-26

## 目前權威狀態

- Version：`3.60.0-course-content-integrity`（本輪為 CI/工具鏈 in-place stability hotfix，版本號未變）
- CourseConfig：`2026-FALL-manual-release-v1`（沿用既有 config id，內容未變）
- Semester policy：`frozen=true`（**尚未依關卡模式調整，見下方「關卡模式轉換」待辦**）
- Released weeks：W01 only（未變）
- Assignments：W01–W15，共 15 組
- Course Record：schema v2；正式 `decisionOrder` 僅接受 `learner + assessment_runtime`
- Assessment：REC／GUIDE、skill forecast、end-round forecast、正確診斷 DOM 標記均停用
- 資料範圍：只收匿名代碼與學生主動 Save／Export 的 compact Course Record；不建立帳號、gradebook 或 continuous telemetry

## 專案定位（擁有者 2026-09-22 決定，沿用中）

專案不再與學生學期綁定，朝「關卡模式」發展：教師隨時決定開放哪些關卡，不受 `2026-FALL` 學期日程約束。過去因「會改變分數語意或顯示數值」而被列為「必須等下一個學期版」的項目仍然可以做。本輪選擇的是 C 節穩定性與部署中的 CI 結構項目，不涉及分數／教學內容語意。

## 2026-09-26 增量：C5 CI 結構強化（PR 驗證、拆分離線打包 job、CHROME_PATH fallback 一致化）

1. **問題**（`OPS_SYSTEM_REVIEW_2026-08-31.md` C 節第 5 項）：CI 只有 push main 觸發，沒有 PR 驗證，所有錯誤都是上線後才發現；離線 ZIP 打包步驟失敗會連 Pages 部署一起擋掉；`smoke:course` 之外的其他 12 支 Playwright smoke 腳本各自硬編碼一個 Windows-only 的 `CHROME_PATH` fallback，未設環境變數時在 Linux/macOS 直接失敗；actions 用 mutable major tag、無 `timeout-minutes`。
2. **修復**：
   - 新增 `.github/workflows/pr-validation.yml`：`pull_request → main` 觸發，跑與 push 相同的 `validate:teaching-deployment` + Course Mode 瀏覽器 smoke + `build:offline` 驗證。
   - `deploy-course-pages.yml` 拆出獨立 `offline-package` job（`needs: build`）；`deploy` job 改成只 `needs: build`，離線 ZIP 打包失敗不再連帶擋住 Pages 部署。
   - 兩個 workflow 的所有 job 都補上 `timeout-minutes`。
   - 新增共用 `tools/lib/chrome-path.mjs`（`CHROME_PATH` 優先，否則依序偵測 Windows／`google-chrome`／`google-chrome-stable`／`chromium`／`chromium-browser`），13 支 smoke 腳本全部改用同一個偵測邏輯，取代先前各自寫死、多數無效的 fallback。
3. **未修復**：actions 仍用 mutable major tag（`@v4`/`@v5`）而非 commit SHA。本次自動化 session 的網路存取範圍僅限本 repo，`curl https://api.github.com/...` 對第三方 repo 回傳 403（proxy 明確拒絕），無法解析並驗證正確的上游 commit SHA，因此**沒有**寫入未經驗證的 SHA。這是下一個有較廣網路存取（或人工核對）的 session 該做的收尾。
4. `OPS_SYSTEM_REVIEW_2026-08-31.md` C 節第 5 項已標記「部分修復」並列出仍待辦的 SHA pinning。
5. `CHANGELOG.md`、`task_progress.md` 已同步更新本輪增量。純 CI/工具鏈變動，未觸及教師可見行為或驗證基準（測試數不變），故未觸碰 `COURSE_MODE_GUIDE.md`／`README.md`／`RELEASE_READINESS.md`。

## 驗證結果

- `pnpm install --frozen-lockfile` ✅
- `pnpm sync:data` ✅（乾淨 clone 必跑）
- `pnpm typecheck` ✅、`pnpm test` ✅ 28 test files／185 tests（與 09-25 基準相同，本輪為 CI/工具鏈修復，未新增 domain test）
- `pnpm validate:teaching-deployment`（`simulate:challenge` → `sync:data` → `validate_owm_data.py --course-deployment` → `validate:course` → `test` → `simulate:balance` → `build:pages`）✅ 全綠
- `pnpm smoke:course`（本環境用 Playwright 內建 Chromium 執行檔 `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` 當 `CHROME_PATH`，驗證新的 `resolveChromePath()` 路徑）✅ 全流程通過
- 純 Node 腳本另外驗證了 `resolveChromePath()` 的 auto-detect 邏輯本身（`existsSync` 依序尋找候選路徑）正確
- 兩份新／改動的 workflow YAML 都經 `yaml.safe_load` 語法檢查通過
- Balance 保持不變：Campaign L1 6/6、L3 12/12、L5 15/15 required；Boss 100/100；MNT 55；最大持續疲勞 76%；未依 automated evidence 調整難度
- 公開 config 版本、`unlockedWeekIds`（W01-only）、`frozen=true` 均未變動

## PR 與合併

- PR：`fix(ci): add PR validation, split offline packaging job, unify chrome-path fallback (C5)` → `main`
- CI（`Deploy Course Mode to GitHub Pages` 的 build job，本次修改前的既有 push-trigger 流程）需於合併後在 `main` 上跑一次全綠；由於本次改動的正是 workflow 檔本身，新的 `pr-validation.yml` 只有在 PR 事件時才會觸發，本次 PR 本身即是它的第一次真實驗證。
- 合併後應確認：(a) `pr-validation.yml` 在本 PR 上跑綠；(b) push 到 `main` 後 `deploy-course-pages.yml` 的 `build` → `offline-package`／`deploy` 三個 job 都能正確觸發、`deploy` 不再等待 `offline-package`；(c) Pages 部署成功、`course/course-config.json` 版本與 `unlockedWeekIds` 不變。

## 下一個建議增量（可自動推進，依優先序）

1. **actions SHA pinning**（本輪 C5 剩餘項）：需要能連線 `api.github.com`（或其他可信來源）解析 `actions/checkout`、`pnpm/action-setup`、`actions/setup-node`、`actions/configure-pages`、`actions/upload-pages-artifact`、`actions/upload-artifact`、`actions/deploy-pages` 目前 major tag 對應的最新 commit SHA，才能安全釘選。
2. **D4**：資料包目前以 `assignmentIndex`（陣列位置）為鍵，不是 `randomSeed` 派生；config 重排/插入一週會靜默改變之後所有週的時間戳、嚴重度與全部 KPI 答案。建議先出設計草案（如何從 `randomSeed` 純函式派生現有 15 週的既定輸出，避免學生既有作業的正確答案被意外改變），下一輪再實作＋補 `validate-course-config` 的順序 pin 檢查。屬於「大型項目拆階段」的候選。
3. **關卡模式轉換**：重新設計 `course-config.json` 的 `frozen` 語意與 `validate-course-config.mjs` 的檢查規則，讓教師能自由開關任意關卡組合而 CI 仍擋得下真正的設定錯誤。建議先出設計草案文件（新 schema、驗證規則、與現有 `unlockedWeekIds` 手動流程的相容性），再分階段實作。
4. **D5-D9**：Availability 口徑標示、`hysteresis=0` 抖動、Alarm tester 改用該週資料包而非硬編碼樣本、`LOTO_VERIFIED` 評分語意向教師說明、`codex.sourceNoteZh/En` 未渲染、角色卡 `INT`/`atk`/`def`/`speed` runtime 無作用的誤導性顯示。
5. smoke 未覆蓋完整 Assessment 結算/計分/Debrief 生命週期（`tools/smoke-course-mode.mjs` 目前只玩到任務中途就匯出）。
6. **環境相依的 smoke 缺口**：若未來的自動化 session 拿到完整本機素材庫，建議跑一次完整 `pnpm smoke:gameplay`／`smoke:layout`／`smoke:operation:compact`，確認共用 `resolveChromePath()` 之後這些 smoke 在真正的 CI 素材環境下仍能通過。

## 仍待擁有者親自處理（不可自動化，已提醒過）

- 真人 pilot／playtest 的招募與執行（`pilot-results-private/` 仍為 0 筆真人資料；`COURSE_MODE_PILOT_PROTOCOL_v1.0.docx`／`COURSE_MODE_PILOT_OBSERVATION_v1.0.xlsx` 空白 kit 已就緒）。
- P01 production art 的 final AI upscale（需 GPU 與模型權重；staging 檔仍為 deterministic resize，Queue 210 Upscale Pending／90 QA Pending／0 Approved）。
- 課務與教學現場決策（含關卡模式下實際要開放哪些關卡組合）。
