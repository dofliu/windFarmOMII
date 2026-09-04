# OWM Web MVP Release Readiness

## Working candidate increment - 2026-08-13

- Local candidate：`3.58.0-course-record-integrity`；尚未 commit／push／deploy。Current published baseline 仍為 `3.57.1-course-mode-p0`。
- Course Record schema v2 已要求 event `context`／`actor`／`attemptNumber`；只有 `learner + assessment_runtime` 可進入正式 `decisionOrder`。
- Guided Practice 不再修改既有 Assessment record；system-derived JSA／LOTO／Work Order 與 Engineering Lab events 僅保留為 audit log。
- Export gate 在 UI 與 serializer 均採 fail closed：所有 attempts 必須結算、具 scores 且四欄 Debrief 完整。
- Engineering Lab 已遵守 `unlockedWeekIds`，固定 seed SCADA／CMS packs 已標示 `SYNTHETIC / GAMEPLAY ABSTRACTION`。
- Legacy v1 record 可讀取但標示 `migrated_v1`／historical only，不自動升格成 native v2 schema evidence。
- `native_v2`／`integrityPolicy.schemaEvidenceEligible=true` 只代表 client-local schema、provenance 與 export gate 一致；export 會明列 `authenticity=CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT`。它不具 tamper evidence、身分綁定或可信任收件證明；正式成績仍須 instructor-controlled receipt 或 signed/server-side collection。
- `pnpm validate` 通過 26 test files／174 tests、Data／Scene／Art／Course、Campaign／Challenge balance 與 production build；更新後 Course browser smoke 通過。
- 2026-08-03 automated flow 為 legacy v1 診斷證據，不是學生學習成效。Course-specific 真人 pilot 尚未執行。
- 現有 15 assignments 尚未構成完整 18 週 CLO matrix；W16–W18 需由正式課綱決定。
- Production art 的獨立主線仍是 90 個已核准 P01 IDs 的 final AI upscale、full-resolution QA 與通過後 promotion。

## Current increment - 2026-07-24 (user full visual approval)

- 使用者已一次性核准全部 `119` 個 Scene candidates 與 `90` 個 P01 production candidates；共用 ledger 已完成決策記錄。
- 119 個 Scene 已正式 promotion 並同步至 `public/data`；目前 Scene `148/150` integrated、`2/150` fallback、`0` visual review required。
- Scene validation、routing smoke、sandbox smoke 與 release-gate audit smoke 均通過。
- P01 90 張已通過 promotion preflight，但尚未執行 final AI upscale；production queue 仍為 `210 Upscale Pending / 90 Production QA Pending / 0 Production Approved`。
- `assets/source-art/qa/visual-approval-dashboard-2026-07-24.html` 已重建為全量 approved 狀態。

## Current increment - 2026-07-24 (scene background coverage)

- Added one hundred and nineteen isolated scene-feed candidates covering selected vessel, port, CTV, SOV, tower-interior, nacelle, rotor-hub, blade-access, cable-landfall, SCADA, CMS, switchgear, warehouse, SOV maintenance, ROV support, control-room, storm-front, helideck, heavy-lift, emergency-response, workshop, fog, crane, monitoring, meteorological, and handover variants.
- The latest five candidates (SCN146-SCN150) satisfy the runtime 1915x821 RGB dimension contract and are routed from `json/sceneAssets.json`.
- Sandbox scene coverage is now `148/150` integrated and `2/150` fallback; the fallback path remains intentionally covered by smoke tests.
- These one hundred and nineteen assets are now user-approved and promoted; none remain `VISUAL_REVIEW_REQUIRED`.
- The new `pnpm validate:scene` check passes: 146 dedicated assets are `1915x821 RGB`; fallback routes remain explicitly isolated at `1672x941`.
- Sandbox Scene UI smoke passes after a contrast fix for Daylight cards and active selection states.
- Full gameplay regression remains green across gameplay, Challenge, Deployment, Operation, Fleet, Onboarding, Source Art, Scene, Sandbox, Layout, balance simulations, and 142 tests.
- Contact sheet and QA matrix: `assets/source-art/qa/scene-pack-2026-07-24/`.
- Consolidated visual review entry point: `assets/source-art/qa/scene-pack-2026-07-24/scene-pack-contact-sheet-all-v018.png` (all 119 candidates).
- Scene coverage roadmap: `SCENE_COVERAGE_ROADMAP.md`; all 150 scene IDs now have explicit routes or documented shared fallback provenance.
- After explicit visual approval, promote only selected IDs with `pnpm scene:approve -- --scene-id SCN006` (repeat `--scene-id` for additional approved candidates); use `--dry-run` first when needed.
- Release-gate audit: the 119-candidate scene approval dry-run passed with no files changed.
- Visual approval packet: `SCENE_VISUAL_APPROVAL_PACKET.md`，包含總覽、核准順序與安全指令範本。
- P01 production 九批總覽：`assets/source-art/qa/production-p01-2026-07-24/production-contact-sheet-all-v001.png`；由 `pnpm art:production-review-sheet` 可重建，仍維持 `Production QA Pending`。
- 共用視覺決策 ledger：`assets/source-art/qa/visual-approval-ledger-2026-07-24.json`；由 `pnpm qa:visual-ledger` 重建，僅記錄人工決策，不會改寫 runtime。
- 人工決策可用 `pnpm qa:record-visual -- --kind <scene|p01> --id <ID> --decision <approved|rejected>` 記錄；promotion 仍需後續獨立 gate。
- Read-only release-gate snapshot：`assets/source-art/qa/release-gate-audit-2026-07-24.json`；由 `pnpm qa:release-audit` 重建，並由 `pnpm smoke:release-audit` 檢查數量與 queue 一致性。
- 單頁人工審查 dashboard：`assets/source-art/qa/visual-approval-dashboard-2026-07-24.html`；由 `pnpm qa:visual-dashboard` 重建，匯出仍需人工放回 ledger，且不會自動 promotion。
- Promotion 前置檢查：`pnpm qa:promotion-preflight -- --kind <scene|p01> --id <ID>`；只接受 ledger approved 的候選，並且保持 read-only。
- Revalidated on 2026-07-24 after the approval packet: `pnpm validate`、`pnpm validate:production-art`、`pnpm validate:scene`、21 test files/142 tests、gameplay/layout/scene/art smoke 全部通過。

Production art gate baseline：`3.53.0-batch030-production-qa`

## 已驗證完成

- Classic P01 active preview：`300/300`，全部已同步到 `public/assets/source-art/p01/` 與 public art index。
- 90 張 production candidate 已隔離於 `assets/source-art/production/p01/`，尺寸均為 `4096x6144`。
- Production queue：`210` Upscale Pending、`90` Production QA Pending、`0` Production Approved。
- `pnpm validate:production-art` passes with the same queue counts; no production candidate was promoted。
- `pnpm validate` 通過，包含資料、art prompt、142 個 automated tests、campaign/boss balance simulation 與 production build。
- Gameplay、Challenge、Deployment compact、Operation compact、Sandbox、Scene routing、Fleet maintenance、Onboarding、single-screen layout、300 人 source-art smoke 全部通過。
- P01 runtime art 與 V2 Shinkai square key-art pack 維持分離，不互相覆蓋 metadata 或尺寸契約。

## 尚未宣告完成的 gate

1. 依已記錄的全量核准結果執行 90 張 P01 production candidates 的最終 AI upscale；目前的 `4096x6144` staging 檔案是 deterministic resize，不冒充 final AI upscale。
2. 對 upscale 結果執行 full-resolution QA，確認無誤後才將 production 狀態由 `Production QA Pending` 改為 `Production Approved`。

## Course Mode 下一主線

- 先建立 18 週 CLO evidence matrix 與 Course-specific pilot protocol，再執行 3–5 位真人學生 W09→W10 pilot。
- 真人證據完成前，不調整 frozen Course balance。

## Production-art workstream 下一步

- 直接以 ledger 的 90 個 approved P01 IDs 執行 final AI upscale 與 full-resolution QA，不需重複人工點選。
- 若發現錯誤，只替換對應 batch 的 production candidate，不回退已通過的 active preview。
- QA 完成後再更新 queue、production manifest 與本文件；在此之前 P01 production 檔案仍維持隔離。
