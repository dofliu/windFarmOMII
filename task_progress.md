# OWM 專案進度

更新日期：2026-07-22

## Current clean status - 2026-07-22

- Version: `3.31.0-v2-shinkai-art-engine`.
- Completed: V2 Shinkai Art Pack & Dual Art Engine architecture (`public/assets/source-art/v2-shinkai/`).
- Completed: Art Pack Switcher button (`✨ 新海誠動漫` / `🎨 經典圖庫`) in Topbar controls with localStorage persistence.
- Completed: smooth art fallback protection (resolves V2 Shinkai assets while cleanly falling back to classic P01 art).
- Completed: full UI redesign & theme system (`Daylight` light & `Deep Ops` dark) driven by `design.md`.
- Completed: Topbar single-row compact flex layout (44px min-height) fixing button overlap and line wrapping.
- Completed: full theme token migration for all sub-pages (Deployment, Fleet Dispatch, Sandbox Scenario Lab, Collection, Codex, Boss Challenge).
- Completed: page heading vertical compression pulling main interactive panels up by ~80-100px.
- Preserved: 100% of existing P01 classic artwork (`public/assets/source-art/p01/`) without deleting or overwriting any original assets.
- Verified: `npm run build` passes with zero errors; verified cross-theme and cross-artpack dynamic switching end-to-end.

## Previous clean status - 2026-07-22

- Version: `3.30.0-ui-redesign-daylight-deepops`.
- Completed: full UI redesign and theme system replacement driven by `design.md`.
- Completed: dual-theme engine (`Daylight` light default & `Deep Ops` dark toggleable) with CSS theme variables (`--owm-surface`, `--owm-border`, `--owm-accent`, `--owm-mono`, `--owm-round`).
- Completed: Topbar single-row compact flex layout (44px min-height) fixing button overlap and line wrapping.
- Completed: full theme token migration for all sub-pages (Deployment, Fleet Dispatch, Sandbox Scenario Lab, Collection, Codex, Boss Challenge).
- Completed: `CollectionScreen` thumbnail background-image rendering fix preventing 404 image errors.
- Completed: page heading vertical compression pulling main interactive panels up by ~80-100px.
- Verified: `npm run build` passes with zero errors; full game flow and theme toggling validated.

## Previous clean status - 2026-07-19

- Version: `3.29.0-source-art-batch022-r7-samples`.
- Completed: generated three representative `BATCH-P01-022` R7 Source Art QA samples before full-batch production/import: `CHR-GOV-031` masculine, `CHR-ACA-071` androgynous, and `CHR-GOV-032` feminine.
- Completed: added `BATCH-P01-022-r7-sample-contact-sheet.png` and `BATCH-P01-022-r7-sample-qa.json` under `assets/source-art/qa/BATCH-P01-022-r7-samples/`.
- Completed: rejected `CHR-GOV-032` v001 as an aspect-ratio failure (`864x1821`) and regenerated it as a valid `1024x1536` v002 candidate; the failed file is retained only as QA evidence.
- Completed: current candidate coverage is masculine 1 / androgynous 1 / feminine 1, with visibly different age, face architecture, body build, task pose, camera framing, and tool interaction.
- Guardrail: samples remain isolated from the public active Source Art index; no active Source Art file, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule changed.
- Active Source Art remains `210/300`, with `90/300` pending.
- Verified: sample dimension check, contact sheet render, `pnpm validate:art`, `pnpm build`.

## Previous clean status - 2026-07-19

- Version: `3.28.0-source-art-r7-casting-variety`.
- Completed: upgraded the remaining 90 pending P01 Source Art prompts to `OWM-P01-R7-CASTING-VARIETY-ANTI-CLONE`.
- Completed: R7 directly addresses the observed visual monotony where the art keeps producing attractive but similar young female characters with mostly outfit/background variation.
- Completed: future pending batches now require stronger visible variety: 4 masculine / 2 androgynous / max 4 feminine, at least 9 pose silhouettes, 7 camera angles, 8 body types, and 5 non-glamour task poses per 10-image batch.
- Completed: negative prompts now block copied heroine faces, only outfit/background changes, glamour/beauty poses, soft idol face in masculine/androgynous slots, and repeated cute expressions.
- Completed: exported `BATCH-P01-022` R7 generation pack under `assets/source-art/qa/` for the next image-generation batch.
- Guardrail: this changes pending prompt metadata, validation gates, and generation-pack workflow only; active 210 Source Art images, public Source Art index entries, gameplay logic, Campaign save schema, reward settlement, score formula, and balance rules were not changed.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-19

- Version: `3.27.0-source-art-batch016-r6-active-import`.
- Completed: imported `BATCH-P01-016` R6 samples as active web-preview Source Art using canonical `p01/*_v001.png` filenames.
- Completed: active Source Art increased from `200/300` to `210/300`; pending decreased from `100/300` to `90/300`.
- Completed: Batch016 QA remains `Visual Review Required`; all 10 images are `1024x1536`, pass P01 2:3 aspect, and remain production-upscale pending.
- Completed: fixed `qa-p01-batch.ps1` so batch-level QA no longer reports `Web Preview Approved` unless `-UserVisualApproval` is explicitly supplied.
- Guardrail: this is an asset/index import and QA-script correction only; gameplay logic, Campaign save schema, reward settlement, score formula, and balance rules were not changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-19

- Version: `3.26.0-source-art-r6-batch016-full-samples`.
- Completed: generated the remaining 7 R6 Batch016 QA samples and completed the full 10-image Batch016 R6 sample set.
- Completed: added `BATCH-P01-016-r6-full-contact-sheet.png` and `BATCH-P01-016-r6-full-sample-qa.json` under `assets/source-art/qa/BATCH-P01-016-r6-samples/`.
- Completed: all 10 current Batch016 R6 candidates are `1024x1536` and pass the 2:3 P01 aspect check; the earlier `CHR-GOV-023` ultra-tall v001 remains retained only as failed QA evidence.
- Completed: full sample coverage is masculine 4 / androgynous 2 / feminine 4, with 10 unique age impressions, face shapes, pose silhouettes, and camera angles.
- Guardrail: sample files remain isolated from the public active Source Art index; no generated active Source Art file, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: sample dimension check, contact sheet render, public index sample-reference check, `pnpm validate:art`, `pnpm build`.

## Previous clean status - 2026-07-19

- Version: `3.25.0-source-art-r6-three-sample-review`.
- Completed: generated three representative R6 Batch016 Source Art QA samples before full-batch production: slot 1 masculine `CHR-GOV-023`, slot 3 androgynous `CHR-DEV-108`, and slot 8 mature feminine `CHR-OMI-242`.
- Completed: rejected the first `CHR-GOV-023` sample as an aspect-ratio failure (`864x1821`), regenerated it as a valid 2:3 candidate (`1024x1536`), and preserved the failed file only as QA evidence.
- Completed: added `BATCH-P01-016-r6-sample-contact-sheet.png` and `BATCH-P01-016-r6-sample-qa.json` under `assets/source-art/qa/BATCH-P01-016-r6-samples/`.
- Completed: all three current candidate samples are `1024x1536`, visually distinct in casting/body/pose, and remain `Sample Review Required`.
- Guardrail: sample files are not referenced by the public active Source Art index; no generated active Source Art file, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: sample dimension check, public index sample-reference check, `pnpm validate:art`.

## Previous clean status - 2026-07-19

- Version: `3.24.0-source-art-r6-batch016-pack`.
- Completed: exported the first R6 small-batch generation review pack for `BATCH-P01-016`.
- Completed: added reusable `pnpm art:r6-sanitize` and `pnpm art:r6-pack -- BATCH-P01-016` utilities for pending R6 Source Art workflow.
- Completed: sanitized 9 pending feminine R6 profiles with contradictory beard / moustache / sideburn cues, then regenerated affected batch manifests.
- Completed: Batch016 now has a reviewable pre-generation diversity plan: masculine 4 / androgynous 2 / feminine 4; 10 unique age impressions, face shapes, pose silhouettes, and camera angles.
- Completed: `validate:art` now fails feminine R6 profiles that still contain contradictory facial-hair or sideburn cues.
- Guardrail: no generated active Source Art file, public Source Art index, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.23.0-source-art-r6-workforce-diversity`.
- Completed: upgraded pending/future P01 Source Art prompts to `OWM-P01-R6-WORKFORCE-DIVERSITY-ANTI-WAIFU`.
- Completed: rebuilt all 100 pending P01 prompts and batch manifests with explicit workforce diversity casting locks.
- Completed: R6 now limits each 10-image pending batch to no more than 4 feminine adult professionals, requires at least 4 masculine/adult-man or clearly masculine adult professionals, and requires at least 2 androgynous adult professionals.
- Completed: R6 negative prompts now block repeated cute heroine, waifu, idol-face, generic anime girl, and feminine-face collapse in masculine/androgynous slots.
- Completed: `validate:art` now gates R6 casting locks, anti-waifu prompt terms, batch age diversity, mature-adult coverage, and structured profile alignment.
- Guardrail: no generated active Source Art file, public Source Art index, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.22.0-source-art-safe-frame-rendering`.
- Completed: Source Art surfaces in Deployment, Operation, and Collection now preserve full-body P01 artwork with `object-fit: contain`, centered positioning, and safe insets instead of crop-prone `cover`.
- Completed: Collection card art now uses absolute safe-frame layout, matching Deployment and Operation and preventing image overflow from intrinsic sizing.
- Completed: `smoke:gameplay` now verifies object-fit, active file path, image decode, natural 2:3 aspect, rendered size, and bounds containment inside the Source Art frame.
- Guardrail: no active Source Art file, Source Art index schema, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.21.0-source-art-runtime-surface-consistency`.
- Completed: `smoke:gameplay` now verifies Source Art metadata and image loading across Deployment, Operation, and Collection against the active public Source Art index.
- Completed: the regression gate checks `data-source-art-*`, active image file path, successful decode, rendered size, and natural 2:3 aspect.
- Completed: Batch021 is directly covered through `CHR-MAR-204` in Collection during gameplay smoke.
- Guardrail: no active Source Art file, Source Art index schema, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.20.0-source-art-batch021-r5-full-import`.
- Completed: generated and imported the remaining 8 Batch021 R5 single-identity P01 Source Art images.
- Completed: active Source Art is now `200/300`; pending is now `100/300`; Batch021 is 10 generated / 0 pending.
- Completed: added full Batch021 QA JSON and contact sheet for visual review.
- Completed: visual direction is materially more varied across age, face structure, body type, camera angle, task pose, and tool handling; all 10 remain `Visual Review Required` pending manual approval.
- Guardrail: this is an asset/index import only; no gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.19.0-source-art-batch021-r5-partial-import`.
- Completed: imported `CHR-MAR-204` and `CHR-OMI-249` from Batch021 as active R5 single-identity P01 Source Art.
- Completed: active Source Art is now `192/300`; pending is now `108/300`; Batch021 is 2 generated / 8 pending.
- Completed: added partial Batch021 QA JSON and contact sheet for visual review before expanding the remaining 8 Batch021 images.
- Completed: `validate:art` now supports partially imported R5 batches by validating the complete 10-profile R5 batch, not only the pending subset.
- Guardrail: this is an asset/index import only; no gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.18.0-source-art-r5-single-identity-prompts`.
- Completed: all 110 pending R5 P01 Source Art prompts now use one explicit character identity direction per image instead of three competing profile paragraphs.
- Completed: pending prompt mix remains masculine 44 / feminine 44 / androgynous 22, with no legacy `neutral confident stance` wording.
- Completed: `validate:art` now fails if pending R5 prompt text has zero or multiple current character-direction blocks, or if the legacy neutral stance remains.
- Guardrail: generated 190 active Source Art files and the public active art index were not changed; no gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending.
- Verified: `pnpm validate:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.17.0-collection-debrief-tabs-a11y`.
- Completed: Collection tabs now expose real `tablist` / `tab` / `tabpanel` semantics with stable ARIA wiring and keyboard navigation.
- Completed: Debrief Review / Score / Log tabs now expose real `tablist` / `tab` / `tabpanel` semantics with stable ARIA wiring and keyboard navigation.
- Completed: `smoke:layout` verifies Collection tab metadata and keyboard switching; `smoke:gameplay` verifies Debrief tab metadata and keyboard switching.
- Guardrail: no Campaign save schema, reward settlement, score formula, Collection data projection, Source Art file/index schema, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.16.0-operation-guide-notice-pulse`.
- Completed: Operation GUIDE now shows a compact visible notice after click with the target label and stable target test ID.
- Completed: decision prompt now exports active guide metadata: `data-decision-guide-active`, `data-decision-guide-active-target`, `data-decision-guide-active-label`, and `data-decision-guide-pulse`.
- Completed: compact Operation smoke verifies guide notice text, notice metadata, prompt active metadata, target highlight, and 1366x768 no-overflow layout.
- Guardrail: no Operation settlement path, team skill recommendation formula, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending. Batch021 R5 image-only task did not import new active art.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.15.0-operation-team-skill-rec`.
- Completed: Operation `NEXT DECISION: ACT` recommendation now evaluates all three deployed crew members instead of only the selected card.
- Completed: `REC` skill CTA exports stable team-aware metadata: `data-recommended-actor-index`, `data-recommended-character-id`, skill ID, reason, power, and stage result.
- Completed: clicking the team-aware `REC` selects the recommended actor and uses the existing `resolveTeamSkill` settlement path.
- Guardrail: no Operation settlement formula, skill power formula, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending. Batch021 R5 art-only background task is running separately and has not yet imported new active art.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.14.0-operation-decision-guide-cta`.
- Completed: Operation `NEXT DECISION` prompt now includes a compact `GUIDE` CTA.
- Completed: GUIDE exports stable `data-decision-guide-target` and `data-decision-guide-label`, then highlights/focuses the current actionable target: Branch Reactive/Accept, Diagnosis REC, Skill REC, or End Round.
- Guardrail: this is session-only UI guidance; no Operation settlement path, skill recommendation formula, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending. Batch021 R5 art-only background task is running separately and has not yet imported new active art.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.13.0-deployment-tabs-a11y-keyboard`.
- Completed: Deployment primary tabs now expose real `tablist` / `tab` / `tabpanel` semantics with stable ARIA wiring.
- Completed: Deployment tabs now support ArrowLeft / ArrowRight / Home / End keyboard navigation with roving focus.
- Completed: `smoke:layout` now verifies tab role metadata, `aria-controls`, active tabpanel role, and keyboard switching before the existing one-screen layout checks.
- Completed: interrupted the stale R4 Source Art background task and delegated `BATCH-P01-021` to a new R5 art-only background task.
- Guardrail: no gameplay settlement, deployment readiness formula, Campaign save schema, Source Art index schema, active Source Art file, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending while Batch021 R5 runs in the background.
- Verified: `pnpm typecheck`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.12.0-source-art-r5-anti-clone-diversity`.
- Completed: pending/future P01 Source Art prompts now use `OWM-P01-R5-ANTI-CLONE-DIVERSITY-ENGINEERING`.
- Completed: rebuilt all 110 pending P01 prompts and pending batch manifests with unique anti-clone diversity signatures; R5 no longer reuses the same slot profile across batches.
- Completed: `validate:art` now rejects duplicate pending diversity signatures and requires stricter per-batch uniqueness for pose silhouette, camera angle, hairstyle, expression, face shape, and body type.
- Guardrail: generated R3/R4 art remains legacy-valid; no active Source Art file, Source Art index schema, gameplay settlement, Campaign save schema, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 本次完成

- [x] 確認改為純 Web，不再使用 Unity。
- [x] 建立 React + TypeScript + Phaser + Vite 專案。
- [x] 同步全部 JSON 至 Web public data，保留 stable ID 與 Source of Truth。
- [x] 移植資料 count、unique ID、FK、四技能與 P01–P10 驗證。
- [x] CharacterRuntime：AP、Energy、fatigue、cooldown、status、回合恢復。
- [x] MissionResolver：六工程階段、Boss phase、counter faction、回合疲勞。
- [x] 可玩任務流程：部署編隊、裝備選擇、六階段作業、回合風險與任務結算。
- [x] 繁中／英文、非純色彩疲勞狀態及鍵盤 focus。
- [x] 58 個 domain tests、typecheck、production build 與 browser smoke。
- [x] 移除 Unity 專案並更新 README、CHANGELOG 與架構文件。
- [x] 建立 300 名角色 P01 manifest、30 個跨 faction 批次與版本化檔名。
- [x] 生成並匯入 `BATCH-P01-001` 共 10 張 Source Art preview。
- [x] 完成尺寸、比例、hash 與 Web preview QA：8 張通過、2 張需 reframe。
- [x] 將 P01 接入 Web 角色卡，並完成三名首發角色 browser smoke。
- [x] 新增三葉片風機 Engineering Background prompt guardrails 與共用負面提示詞。
- [x] 將 300 筆 P01 prompt 升級為 `OWM-P01-R3-FEMALE-ENGINEERING`，鎖定可愛專業成年女性角色方向與風機幾何。
- [x] 依人工工程審查將 `CHR-MFG-126`、`CHR-OMI-221` 標記為 `Regenerate Required`。
- [x] 完成 `CHR-MFG-126`、`CHR-OMI-221` R3 v002 重生並依人工確認標記為 `Approved`。
- [x] 建立 active Source Art index，以版本與 QA 狀態選擇遊戲實際載入的圖片。
- [x] 將現有 10 張 P01 接入遊戲，新增「已完成原畫」切換選單。
- [x] 完成 10 名角色 Source Art browser smoke，v002 版本、圖片尺寸與 console error scan 皆通過。
- [x] 完成 `CHR-DIG-271` 2:3 v002 reframe，保留角色、PPE、工具與原視覺方向。
- [x] 將 `CHR-DIG-271` v002 接入 active Source Art index 作為遊戲 review candidate，人工 QA 仍維持 `Correction QA Pending`。
- [x] 修正 correction QA summary 的比例計算，以 active version 為準；目前 `reframeRequired = 0`。
- [x] 生成並依角色 ID 匯入 `BATCH-P01-002` 共 10 張 P01 v001。
- [x] 完成 Batch 002 尺寸、比例、hash、PPE、工具、風機幾何與單一角色 QA。
- [x] 發現並修正 `CHR-MAR-177` 額外背景人物、`CHR-DIG-272` 非 2:3 構圖，保留 v001 並匯入 v002 candidate。
- [x] 新增可重複使用的 visual QA override 與通用 correction import 工具。
- [x] 現有 20 名角色全數接入遊戲並通過 browser smoke。
- [x] 生成並匯入 `BATCH-P01-003` 共 10 張 L3–L5 P01，全數為 `1024×1536`。
- [x] 完成 Batch 003 視覺 QA；背景與手持縮尺 rotor 皆為三葉片，無新增 regenerate 項目。
- [x] 現有 30 名角色全數接入遊戲並通過 browser smoke。
- [x] 生成並匯入 `BATCH-P01-004` 共 10 張 P01，全數為 `1024×1536`。
- [x] 完成 Batch 004 視覺 QA；7 張 v001 通過，`CHR-DEV-090`、`CHR-ACA-046`、`CHR-MFG-131` 依 R3 規則產生 v002。
- [x] v002 移除額外人物與多餘 rotor、改為封閉式 wave-basin laboratory，並修正為可辨識 weld gauge。
- [x] 修正 QA 工具，使尺寸與比例依 active asset 判定，且 visual override 後正確重算全域 `correctionQaPending`。
- [x] 現有 40 名角色全數接入遊戲並通過 browser smoke，三張 Batch 004 v002 卡牌畫面載入正確。
- [x] 生成並依角色 ID 匯入 `BATCH-P01-005` 共 10 張 P01 v001，全數為 `1024×1536`。
- [x] 完成 Batch 005 角色、PPE、工具、風機三葉片幾何與單一人物視覺 QA；無新增 regenerate 或 reframe 項目。
- [x] 現有 50 名角色全數接入遊戲並通過 browser smoke，Batch 005 的 OMI、DIG、GOV 代表卡牌載入正確。
- [x] 生成並匯入 `BATCH-P01-006` 共 10 張 P01；`CHR-MFG-133`、`CHR-DIG-278`、`CHR-GOV-009` 以 v002 修正並設為 active candidate。
- [x] 生成並匯入 `BATCH-P01-007` 共 10 張 P01；`CHR-MFG-135` 以 v002 修正為 `1024×1536`。
- [x] 現有 70 名角色 active 圖片全數通過 2:3 與 browser 載入 smoke；無新增 regenerate 或 reframe 項目。
- [x] 新增 Deployment 畫面；Campaign 依 Career Track 選擇已解鎖角色，Sandbox 可選 100 個 Boss、300 名角色與 200 項裝備，並檢查隊伍重複與六階段涵蓋。
- [x] 任務 runtime 加入階段專長、裝備 reliability、全隊 Support、換班、天候、安全、證據、成本與失敗條件。
- [x] 新增 Debrief 結算，依完成度、安全、證據、時間與疲勞給出 S–D 評級。
- [x] 新增可重複執行的 gameplay smoke，完整走過「部署 → 回合風險 → 六階段 → 結算」。
- [x] 修正 Source Art 切換 loaded-state race condition，以及 Phaser scene 重建後 telemetry 階段不同步問題。
- [x] 新增 `missions.json` 與 `vessels.json`，資料驗證涵蓋 Mission/Boss/Scene/Equipment/Spare/Vessel/Unlock FK。
- [x] 建立第一章三個連續教學任務：主軸承過熱、變槳失效、發電機絕緣劣化。
- [x] Deployment 加入 Mission、任務裝備、SPARES 與 CTV/SOV/USV 選擇，並顯示 3/3 配置品質與成本。
- [x] Diagnose 階段加入工程判斷 gate；正確答案 Evidence +15，錯誤答案 Safety -8。
- [x] 船舶參數接入每回合天候、安全與疲勞風險；結算新增 cost score。
- [x] 新增版本化 campaign save：總 XP、角色 XP、最佳分數、完成任務與解鎖鏈。
- [x] Gameplay smoke 驗證第一關結算、第二關解鎖與重新整理後 save persistence。
- [x] 修正 React StrictMode 重掛 Phaser 時殘留重複 canvas 的 lifecycle 問題。
- [x] 新增 Chapter 02 三個進階任務，Campaign 現為 6 關連續 prerequisite 鏈。
- [x] 新增 Campaign／Sandbox／Collection 頂部模式導覽。
- [x] Sandbox 可自由挑戰 100 個 Boss，開放全部技能且不修改 Campaign save。
- [x] 新增角色 Mastery 門檻與技能槽解鎖：L1 Skill 1、L2 Skill 2、L3 Ultimate。
- [x] 新增 Collection UI，顯示 300 名角色、Source Art、角色 XP、Mastery bar 與四技能鎖定狀態。
- [x] Gameplay smoke 擴充至 Collection 300 cards、角色 XP、Sandbox 100 Boss 與 save isolation。
- [x] 實作 WEA、COR、BLD、DRV、ELE、CTL、HYD、CAB、COM、DIG、GRD、SEA、OPS、STR 共 14 種 Boss class 回合事件規則與 UI 提示。
- [x] 新增 Campaign save JSON envelope、下載／匯入 UI、舊版裸進度 migration 與錯誤版本拒絕。
- [x] 新增 Chapter 03 三個 S3 任務，Campaign 擴充為 9 關連續 prerequisite 鏈。
- [x] Gameplay smoke 擴充至 Boss class event、1/9 reload persistence、save envelope 產生與 STR Sandbox 規則。
- [x] 建立 14 種 `BOSS_CLASS_TELEGRAPHS`，每種具有獨立 pattern、圖示、accent 與影響資源契約。
- [x] 將 Boss event pulse 接入 React telegraph card 與 Phaser 場景 VFX，規則結算仍保留在 pure TypeScript runtime。
- [x] 新增角色 runtime status icons、Boss impact tags 與 Operation Log 文字回饋，狀態不只依賴顏色。
- [x] 新增「降低動態」切換，停止 Phaser 循環動畫與強烈 pulse，同步縮短 CSS animation。
- [x] 完成 768px 單欄 Mission／Card／Field 版面、44px touch target 與固定回合操作列。
- [x] Gameplay smoke 新增 desktop telegraph 與 768px reduced-motion／touch／horizontal-overflow 驗證。
- [x] 新增五類 Mission branch event：天候惡化、備品延誤、二次故障、通訊中斷與誤警報。
- [x] 建立 deterministic branch schedule；事件每三個已完成回合提供一次可重現的決策窗口。
- [x] 實作 Reactive skill response：驗證技能類型、消耗 AP／Energy、套用 fatigue／cooldown／status，並依 Power 降低事件後果。
- [x] 一般工程階段禁止 Reactive skill 推進進度；事件 pending 時鎖定一般技能與下一回合。
- [x] 曾以 `CHR-OMI-223` 驗證 Reactive 首回合流程；v2.21 已改回合法 L1 `CHR-OMI-221`，Reactive browser regression 改用達 Track L3 的進度測試。
- [x] 新增 branch event panel、完整 penalty preview、Reactive 選項、承受完整後果按鈕與 Operation Log 結果。
- [x] Gameplay smoke 驗證桌面／768px Reactive response、天候減傷、BranchGuard、事件解除與後續六階段結算。
- [x] 新增 Chapter 04 三個 S4 Mission，Campaign 擴充為 12 關連續 prerequisite 鏈。
- [x] 新增 `codex.json` 共 12 筆雙語工程概念、安全邊界與場站／OEM 程序聲明。
- [x] Codex 解鎖直接由 `completedMissionIds` 推導，舊 save、JSON 匯入與 reload 不需 schema migration。
- [x] 新增 Knowledge Codex 導覽、分類篩選、鎖定卡片、1/12–12/12 進度與任務結算解鎖提示。
- [x] Gameplay smoke 驗證任務完成後 `KDX-001` 解鎖、reload 後仍為 1/12、12 任務與 12 條目完整顯示。
- [x] 以四章十二關 Campaign mission map 取代 Mission 下拉選單，直接顯示 completed／available／locked 與 prerequisite 路線。
- [x] 任務節點顯示 Boss severity/class、XP、selected 狀態、完成後最佳評級與鎖定所需前置關卡。
- [x] 點選 available 任務會同步推薦 Equipment、Spare 與 Vessel；locked 任務保持 disabled。
- [x] 新增 `campaignMissionStatus`／`campaignMissionGrade` pure functions 與 domain test。
- [x] Gameplay smoke 驗證初始 1 available／11 locked、reload 後第一關 completed、第二關 available、第三關 locked，以及 768px 無水平 overflow。
- [x] 12 個 Mission 各新增三段 `branchEventDeck`，共 36 個 deterministic trigger，指定回合、事件與 intensity。
- [x] Runtime 改為 Campaign 依 Mission deck 觸發；Sandbox 保留通用 deterministic fallback。
- [x] Chapter 01 intensity 由 `×0.75` 起步，Chapter 04 逐步升級為 `×1.15 / ×1.35 / ×1.55`。
- [x] Deployment 與 Mission Control 顯示 event deck timeline，Branch panel、penalty preview 與 log 顯示 intensity。
- [x] 資料 QA 驗證 event code、三段 deck、遞增回合及 `0.5–2.0` intensity。
- [x] Gameplay smoke 驗證第一關 `×0.75` Reactive mitigation，以及 S4 軸承關 `×1.15` 完整天候 penalty = 9。
- [x] 實作 Mastery L4「專家整備」：個人起始 Energy +2、團隊初始 Evidence +3。
- [x] 實作 Mastery L5「資深防護」：個人回合 fatigue damage -2、團隊初始 Reliability +4。
- [x] Campaign 依實際角色 XP 啟用 perk；Sandbox 開放全技能與全部 L4/L5 perk。
- [x] 換班帶入新角色個人 perk，但不重複疊加部署時 team bonus。
- [x] Deployment、主角色卡與 Collection 顯示 L4/L5 locked／active 狀態與團隊 bonus。
- [x] Gameplay smoke 驗證 L5+L4+L1 隊伍為 3/6 perks、Evidence +6、Reliability +4、L5 Energy 6、fatigue protection 2、任務 Evidence 18。
- [x] 新增 Chapter 05 三個 S5 終局 Mission，Campaign 擴充為五章十五關連續 prerequisite 鏈。
- [x] Chapter 05 三組 event deck 由 `×1.35` 提升至最終 `×2.00`，共新增 9 個 deterministic trigger。
- [x] 新增 `KDX-013` 至 `KDX-015`，維持 15 Mission 對 15 Codex 一對一解鎖。
- [x] 新增 Campaign completion summary，顯示完成任務／章節、平均最佳分、整體評級、S-grade 與 L5 技師數。
- [x] 最終任務完成後顯示戰役完成，所有 completed Mission 保持可選取重玩。
- [x] Data QA 驗證 1–15 連續 order、完整 prerequisite、五章各三關、S5 final deck 與 Mission/Codex 對應。
- [x] Gameplay smoke 驗證 Chapter 05 S5 deck、15/15 completion summary、最終 `×2.00` deck 與 15/15 Codex。
- [x] 新增 15 關 deterministic balance simulator，直接重用正式 runtime 而非另寫簡化公式。
- [x] L1／L3／L5 Mastery profile 使用相同 L1/L3/L5 career-role 混合隊伍，共執行 45 組 autoplay。
- [x] 新增 progression gate 與 Markdown／JSON report，並明確標示不是風場、SCADA 或實驗數據。
- [x] Baseline 定位 S5 WeatherWindow 與高階技能 Energy economy 問題；每回合 Energy recovery 由 2 調為 3。
- [x] SOV weather protection 由 4 調為 5，使 L5 能完成三個 S5，同時保留 tight／critical 終局壓力。
- [x] Readiness Gate 導入前的純 runtime 基準為 L1 12/15、L3 15/15、L5 15/15；後續已由 Chapter Mastery gate 收斂為 6/12/15。
- [x] `validate_project.ps1` 與 `pnpm validate` 納入 balance gate。
- [x] 新增五段 first-play guided onboarding：Deployment、event deck、Reactive window、Diagnosis gate、Debrief。
- [x] Reactive／Diagnosis 由實際操作推進；Debrief 出現後才可完成，並支援跳過與 Topbar 重播。
- [x] Onboarding 使用獨立 `owm.onboarding.v1`；Campaign save schema、匯出與 migration 均不變。
- [x] reload 遺失 mission session 時 active 導覽安全回到 event deck，不會清除 Campaign 進度。
- [x] 新增 focus／waiting／五段進度 UI，修正等待卡攔截技能操作，並完成 768px responsive QA。
- [x] 新增 onboarding domain tests 與 `pnpm smoke:onboarding` 完整瀏覽器流程。
- [x] 為 15 個 Mission 建立雙語 Operation Profile：虛構場址、weather／Sea State、work permit、最低 Mastery、PPE、access requirement 與允許船舶。
- [x] 新增 5 項 Operation Readiness gate；permit／PPE／access 由玩家確認，vessel 與至少兩名技師 Mastery 由系統核對。
- [x] Gate 未達 5/5 時鎖定 Deployment 與 onboarding CTA，並列出 blocked reason；切換 Mission 會重置人工確認。
- [x] Gate 通過後將 initial weather window 與 mobilization cost 套入正式 runtime；Sandbox 維持不受 gate 限制。
- [x] Browser 與 Python data QA 驗證唯一場址、Chapter Mastery progression、雙語 PPE、船舶類別、數值範圍與 gameplay abstraction 標記。
- [x] Balance simulator 納入 Readiness Gate，結果為 L1 6/15、L3 12/15、L5 15/15，progression gate PASS。
- [x] 將 200 項 Equipment 分為 L1–L5 各 40 項；新 Campaign 起始持有 40 項 L1。
- [x] 第 3／6／9／12 關完成時依序解鎖 L2／L3／L4／L5，Debrief 顯示 tier reward 與取得數量。
- [x] Campaign Equipment／SPARES selector 顯示全部項目，但以 disabled 鎖定未持有裝備；Sandbox 開放全部 200 項。
- [x] Collection 新增 inventory 總數、tier 與 category 統計，並納入 browser smoke。
- [x] Campaign save 升級至 v2 與 `owm.campaign.v2`；v1 localStorage／envelope／裸進度可自動 migration 並依 milestone 重建 inventory。
- [x] Save normalization 移除未知及尚未取得的裝備 ID，避免 soft-lock 與超前解鎖。
- [x] Python／TypeScript 資料 QA 驗證 5×40 tier 分布、15 關推薦 tier 與四個 reward milestone。
- [x] 新增 Equipment Condition 0–100 與 25% serviceable threshold；只損耗實際部署的 Equipment／SPARES。
- [x] 新增 Maintenance Credits（MNT）、任務整備獎勵與依缺損／tier 計算的完整維修費用。
- [x] Campaign save 升級至 v3；v1/v2 可 migration，condition 採 sparse map 並清除未知／未持有／非法項目。
- [x] Deployment 顯示 condition meter、維修報價、grounded reason；低於 25% 不可出勤但仍可選取維修。
- [x] Debrief 顯示 MNT 與 before→after wear；Collection 顯示 MNT、serviceable 與 worn 統計。
- [x] Balance 新增 full-repair economy gate：15/15 可出勤，80 + 654 − 438 = 296 MNT，最低任務後 Condition 84%。
- [x] Campaign Crew fatigue 改為跨任務保存；Mission runtime 由 save 中的角色疲勞初始化，不再每場歸零。
- [x] 新增 `crewFatigue` sparse map、Stable／Tired／Critical／Exhausted readiness band 與 100% Exhausted deployment gate。
- [x] 新增 Rest Token（RST）：初始 3、任務依船舶取得 1–2、手動 Rest 消耗 1 並恢復至少 20 或 fatigueMax 的 40%。
- [x] 任務後部署角色依船舶套用返航恢復，未出勤 Reserve 依角色 recovery 自動恢復；中途換班離隊者也納入結算。
- [x] Deployment、Topbar、Debrief 與 Collection 完成 Crew readiness／Rest／recovery UI，並標示為 gameplay abstraction。
- [x] Campaign save 升級至 v4 與 `owm.campaign.v4`；v1/v2/v3 localStorage、envelope、裸進度均可 migration。
- [x] Balance 新增 sequential Crew readiness economy gate：15/15 可部署、15/15 完成、結餘 32 RST、最高持久疲勞 1%。
- [x] Gameplay smoke 注入 100% Exhausted 技師，驗證阻擋出勤、Rest 100→60、RST 1→0 與恢復 Deploy。
- [x] Desktop Deployment 使用任務航線／作業許可／Crew／裝備／出勤預測五個 Tab，底部 Deploy action bar 固定留在單一 viewport。
- [x] Collection 改為 Crew／Resources Tab；300 名角色加入 faction filter、ID／姓名／職種搜尋與每頁 5 張分頁，Codex 改為每頁 3 筆。
- [x] Operation 中央視窗接入寫實海上風場 field-feed bitmap；主場景與遠端風機均依 R3 Engineering QA 維持三葉片。
- [x] 以 `turbineGeometry.ts` 建立共用三葉片 tapered polygon；三支葉片以同一 hub 為原點、120° 等距，Phaser 只旋轉同一 rotor container。
- [x] 新增 1440×900 single-screen layout smoke，驗證 Deployment 四 Tab、Collection 兩 Tab、Codex 與 Operation 無文件層級 overflow。
- [x] Subagent 完成 `BATCH-P01-008` 10 張 P01 v001，全部為 `1024×1536`、2:3，active Source Art 累計 80/300。
- [x] Batch 008 技術與人工預檢未見四葉、彎曲、離軸 rotor 或額外人物；維持 `Visual Review Required` 等待最終人工核准。
- [x] Subagent 完成 `BATCH-P01-009` 10 張 P01；`CHR-DEV-098` 尺寸異常版本未匯入，重生為 `1024×1536` 後才同步，active Source Art 累計 90/300。
- [x] Batch 009 10/10 aspect pass、無 reframe／regenerate；三張代表圖已在 Collection 畫面抽查，維持 `Visual Review Required` 等待最終人工核准。
- [x] Campaign Deployment 新增「出勤預測」第五個 Tab，顯示 success/failure Equipment Condition、MNT reward／完整修復成本、Crew fatigue envelope 與 RST 收支。
- [x] Dispatch Forecast 直接重用正式 wear、MNT、Mastery fatigue protection、Boss class baseline 與 vessel recovery 規則，沒有建立第二套結算公式。
- [x] 新增 2 項 Dispatch Forecast tests，並擴充 single-screen／gameplay smoke 驗證預測值、五個 Tab 與 onboarding 導頁 regression。
- [x] Crew Tab 新增 ID／姓名／職種、Faction、Readiness 與最低 Mastery filters；手動 filter 不改變自動建議的完整 roster 範圍。
- [x] 新增 `crewRotation.ts`，完整比較傳入 roster 的三人組合；Campaign 傳入所有已解鎖角色，300 人效能測試仍覆蓋全 roster 上限。
- [x] Crew 與 Dispatch Forecast 均可一鍵套用輪班建議；三個 stable character IDs 與 forecast 即時同步，同分時保留現有隊伍。
- [x] Readiness band 統一使用 `40% / 70% / 100%` domain 門檻，移除 Forecast 原先不同的顯示門檻。
- [x] 完成 60 條 Career Track 的 L1→L5 Campaign availability；Track XP 由五張角色既有 XP 加總，與 Mastery 共用 `0／100／250／500／900` 門檻，不新增 save 欄位。
- [x] 新 Campaign roster 固定為 60 名 L1；Deployment selector、輪班 Advisor、預設／onboarding team 與 deploy guard 只接受已解鎖角色，Sandbox 仍維持全 300 名開放。
- [x] Collection 300 張卡新增 Career lock、Track XP／下一階門檻；Debrief 顯示各 Track 任務前後 XP 與新解鎖角色，reload／v1–v3 migration 沿用 v4 persistence。
- [x] 首次導覽改用三名 L1；Reactive window 先教完整承擔，達 Track L3 後才可用 Reactive 角色卡，移除新 Campaign 偷渡 `CHR-OMI-223` 的矛盾。
- [x] 新增獨立 Boss Challenge mode；100 Boss 與 300 角色全開，但固定 Mastery L3（250 XP）、10 回合及 `EQ0051 + EQ0126 + VES002` L1 配置。
- [x] 初版新增 `bossChallenge.ts` 與獨立 `owm.challenge.v1`；每個 Boss 只保留 local best，高分優先，同分時完成優先，再以較少回合決勝；現已由 v2 migration 接手。
- [x] Challenge runtime、換班、Reactive 與技能鎖都使用固定 L3 projection；Campaign XP、MNT、RST、疲勞、Condition、解鎖與 v4 save 完全不變。
- [x] Deployment 新增公平規則、100 Boss selector、300 crew filters、全局摘要、選定 Boss 紀錄與不可變更的 fixed loadout；Sandbox 維持全 L5／自由配置／不計分。
- [x] Operation 新增 Challenge mode label、固定 L3 顯示與 local-best 結果面板；結果只顯示／寫入 Challenge persistence。
- [x] 新增 `smoke:challenge`：完成一場實際 Challenge，驗證 reload local best、Campaign raw save 逐字隔離、1440×900 single-screen 與 768px 無水平 overflow。
- [x] Desktop Operation 角色卡壓縮為同一 viewport 可見；完成結果不再因自動聚焦把 Topbar 推離畫面。
- [x] Subagent 完成 `BATCH-P01-010` 10 張 P01，全部 `1024×1536`、2:3；active Source Art 累計 100/300，仍待人工視覺核准與 production upscale。
- [x] 新增 100 Boss deterministic Challenge audit；三種 counter set 各精確比較 `C(300,3)=4,455,100` 組隊伍，再以 balanced／power／survival 候選逐 Boss 實跑正式 runtime。
- [x] 首輪確認 `BOSS080` 因固定 L1 配裝在 GRD S5 的 Weather／Energy 壓力形成十回合死局；新增 Challenge-only GRD reserve，不改 Campaign、Boss master data 或原始 vessel。
- [x] Challenge audit gate 現為 100/100 可通關；每 Boss 至少三隊成功、無 severity inversion，S5 維持 17 tight／3 critical／0 comfortable。
- [x] Challenge Route 新增 Severity、14 Class、紀錄狀態交集篩選，以及 ID／Severity／best-score／Audit Hardest 排序；零結果時鎖定 Deploy。
- [x] 將完整稽核壓成 `bossChallengeAudit.json` 100 筆遊戲 snapshot；啟動與 Python data gate 都驗證 schema、100/100、Boss FK、hard-outlier FK 與 gates PASS。
- [x] Route 顯示所選 Boss 的 pressure、score、成功候選隊、candidate clear rate 與 audit round，並標示 `BOSS075／079／080` 為低分但可通關 hard outliers。
- [x] Challenge audit compact snapshot 新增每個 Boss 的三個推薦角色 stable IDs；browser／Python data gate 驗證三人唯一、角色 FK 與成功稽核。
- [x] 新增 `bossChallengeSquad.ts`；100/100 Boss 推薦隊伍皆達六階段 6/6 coverage，其中 80 組為 2 名 counter、20 組為 3 名 counter。
- [x] Challenge Crew 右側新增 Squad Advisor，顯示 audit score／round／candidate clear rate、三名固定 M3 技師、counter 與六階段 coverage，並可一鍵套用。
- [x] 一鍵套用只更新 Challenge deployment stable IDs；BOSS001 實際 browser flow 驗證 Campaign raw save 逐字不變。
- [x] 視覺 QA 修正 Crew 摘要回合上限由錯誤的 loadout 11 回合改為 Challenge 固定 10 回合，並維持 1440×900 單頁。
- [x] 新增 `compareBossChallengeSquads`，以相同 domain profile 比較目前隊伍與 audit 隊伍的 Counter、6-stage coverage、共用成員與逐階段 delta。
- [x] Squad Advisor 新增 CURRENT／AUDIT 矩陣、三名角色 `KEEP／SWAP` 與 `目前→audit` stage 數值；手動換人後即時重新派生。
- [x] 「恢復稽核隊伍」可在任一手動變更後套回三個 stable IDs；完全一致時顯示 `VERIFIED · AUDIT TEAM` 並鎖定重複操作。
- [x] 比較面板明確限制為固定 M3／標準裝備／10 回合的 gameplay audit snapshot，不宣稱現場或真實成功率。
- [x] 新增 `bossChallengeStrategy.ts`，直接重用正式 14 class rule／telegraph、`branchEventForRound`、stage coverage 與角色技能 stable IDs。
- [x] Route／Crew 顯示 Boss base fatigue、class 每回合壓力、Challenge R01／R04／R07 branch windows 與事件影響資源。
- [x] 目前隊伍即時統計 Reactive、正式全隊 fatigue recovery、≤4 Energy 一般技能、Stage／Counter；換人後無需 reload。
- [x] 結構缺口涵蓋無 Reactive、fatigue class 無全隊恢復、energy class 無低 Energy 一般技能與六階段缺口；不推導成功率或現場安全判斷。
- [x] 新增 `crewCapability.ts`，Strategy Briefing 與 Crew roster 共用 Reactive／全隊 fatigue recovery／≤4 Energy 一般技能正式判定。
- [x] Crew roster 新增 Skill Capability filter；Campaign 只計當前 Mastery 已解鎖技能槽，Challenge M3 固定四槽對應 Reactive 60／全隊恢復 300／低 Energy 240 名角色。
- [x] Strategy 三種技能缺口可一鍵切換 Crew Tab 與對應 filter；導引會清除殘留交集條件，但不自動改隊或宣稱通過 audit。
- [x] Challenge browser flow 實際從 BOSS001 Route 的 Reactive gap 開啟 Crew `60/300`，並通過 Campaign raw save 隔離、1440×900 單頁與 768px 無水平 overflow。
- [x] 新增 `bossChallengeCandidate.ts`；每位 capability 候選完整評估三個單席替換，先保留每人最佳席位，再依缺口、Stage、Counter、技能 readiness 與 stable ID deterministic 排序。
- [x] BOSS001 Reactive 缺口實際比較 60 名候選×3 席＝180 swaps；前三名均使 Reactive `0→1`、Counter `2/3→3/3`、Stage 維持 `6/6`。
- [x] Crew 新增三張 Strategy Gap Candidate cards，同時顯示 Reactive／恢復／低 Energy／Counter／Stage before→after，支援單席套用與一鍵復原上一隊。
- [x] Candidate 固定標示 `NOT AUDIT VERIFIED`，只比較結構、不實跑 runtime 或推導成功率，且不寫入 Campaign／audit persistence。
- [x] Subagent 完成 `BATCH-P01-011` 原子匯入；10/10 為 `1024×1536`、2:3 技術 QA pass，active Source Art 累計 110/300。
- [x] Boss Challenge save 升級為 `owm.challenge.v2`；v1 local best 可自動 migration，`bestByBossId` 與 `draftByBossId` 分離保存。
- [x] Route Boss 切換、手動換人、Candidate 套用／復原及 audit restore 均更新目前 Boss 的三人 stable-ID draft；切換回原 Boss 或 reload 精確還原。
- [x] 新增 100 Boss draft FK、三人唯一性、best/draft provenance 及 no-op persistence tests；Challenge v2 與 Campaign v4 保持隔離。
- [x] Route 新增 `DRAFTED／UNDRAFTED` 交集篩選與 `DRAFTED FIRST` deterministic sort，可盤點 100 Boss 規劃狀態。
- [x] Route draft strip 顯示三人 stable IDs、正式 Counter、6-stage 與 Strategy gaps，支援不離開 Route 的一鍵 reload/resume。
- [x] 修正未規劃 Boss 的瀏覽語意；切換 Boss 不再自動寫入 default draft，只有實際隊伍變更才保存。
- [x] UNDRAFTED Route 新增「採用 AUDIT 隊伍」；以三個 `recommendedTeamIds` 建立 draft，立即顯示正式 Counter／Stage／gaps。
- [x] 新增 audit-seed domain contract，核對 Boss、success、三人唯一性與 character FK；100 Boss 全數可建立且同隊伍 idempotent。
- [x] BOSS004 audit seed 為 Counter 3/3、Stage 6/6，但保留「無 Reactive」結構缺口；runtime verified 與 structural preview 不混為同一證據。
- [x] Route 對所有 draft 派生 `GAP_FREE／HAS_GAPS` 與四種 gap type，新增 readiness 交集篩選及 deterministic sort。
- [x] Boss Challenge briefing 新增 DRAFTED／GAP-FREE／HAS GAPS portfolio；固定聲明只代表 Strategy structure，不取代 runtime audit。
- [x] 手動換人會即時重算 portfolio；BOSS002 移除 Reactive 成員時由 `1 gap-free／2 gaps` 變為 `0／3`，換回後恢復。
- [x] 100 組 audit recommendation 精確 portfolio 為 `0 GAP-FREE／100 HAS GAPS`，100 組皆缺 Reactive，但仍維持 runtime 100/100 clear。
- [x] `BATCH-P01-012` 完成 10/10 原子匯入；全部 `1024×1536`、2:3 技術 QA pass，active Source Art 累計 120/300。
- [x] HAS-GAPS Route 新增 deterministic Top Structural Repair；三種技能缺口路由到正式 capability，Stage-only 缺口比較 297 人×三席。
- [x] Top repair 顯示 stable ID、取代席位與 Gaps／Counter／Stage before→after；固定 `NOT AUDIT VERIFIED`，不推導 runtime 成功率。
- [x] Route 一鍵 Apply 與一層 Undo 都更新目前 Boss draft；selected summary／全域 portfolio 即時重算，reload 後保存，Campaign v4 維持逐字隔離。
- [x] 100 Boss audit draft top candidate 重複計算結果一致；另補四種 gap routing 與 Stage 3/6→6/6 fallback 測試。
- [x] Challenge Portfolio 同列新增 Repair Queue；顯示 stable-ID queue 位置、四種剩餘 gap 數與本次 session 修補數，不增加桌面頁面高度。
- [x] Queue 由未篩選 Route 派生，固定以 Boss ID 排序；`NEXT` 會清除不相容 filter 並聚焦 `DRAFTED + HAS GAPS`，但不自動改隊。
- [x] Route Apply／Undo 即時重算 queue 與 portfolio；Apply 離開 gap filter 後仍保留結果與 Undo，session count 在 reload 後刻意歸零。
- [x] BOSS004→BOSS003 連續 queue flow、filter reset、draft 不變、Apply／Undo、reload 與 Campaign raw save 隔離均完成 browser 驗證。
- [x] Drafted Boss Route 新增按需 deterministic Draft Verification；直接重用正式 Challenge autoplay 與固定 L3／10 回合／L1 contract。
- [x] 驗證列顯示 stable-ID input、CLEAR／FAILED、grade、score、round 與 `RUNTIME ONLY` provenance；換 Boss／換隊／reload 即清除。
- [x] 100 Boss audit recommendation 的 success／score／grade／round／pressure 全數與 compact audit snapshot 一致；BOSS080 修改隊伍可重現 FAILED。
- [x] Draft Verification 不寫入 Challenge local best／draft、Campaign v4 或 static audit；1440×900 單頁與 768px 無水平 overflow browser smoke 通過。
- [x] FAILED Draft Verification 直接標示 priority structural gap 與 Top Repair 加入／取代 stable IDs，維持 runtime 與 structure evidence 分層。
- [x] Apply Top Repair 後保存 before IDs／結果並切換 `RE-VERIFY`；同列比較 score delta、round before→after 與 `REPAIR CLEAR／STILL FAILED`。
- [x] BOSS015 固定案例為 FAILED→Top Repair→CLEAR；BOSS080 為 FAILED→Top Repair→STILL FAILED，兩條 deterministic path 均有 domain 與 browser 證據。
- [x] Route Undo 精確恢復 before IDs 與原 verification；repair／reverify 不建立 local best、不改 Campaign／static audit，1440／768 layout 通過。
- [x] `BATCH-P01-013` 完成 10/10 原子匯入；全部 `1024×1536`、2:3 技術 QA pass，active Source Art 累計 130/300，130-art browser smoke 通過。
- [x] `STILL FAILED` Route 新增按需 Runtime Repair Escalation；排除已嘗試 Top Repair 後實跑其餘 59 名單席 structural candidates。
- [x] Runtime ranking 固定依 CLEAR、score、round、stable IDs；同列 dropdown 顯示 top 6 replacement ID／結果，玩家確認後才 Apply。
- [x] BOSS080 固定回報 `0 CLEAR / 59 EVALUATED`，最佳 `CHR-ACA-043 · FAILED 34 · R8`；不把最佳失敗候選提升為 CLEAR。
- [x] Evaluate 不寫檔；可套用非第一名 shortlist candidate，一層 Undo 精確恢復前一隊、runtime comparison 與 shortlist，Campaign／local best／audit 仍隔離。
- [x] Runtime Repair selected preview 會在 Apply 前顯示 current→candidate score／round delta、真正 slot replacement、Counter／Stage／remaining gaps。
- [x] 候選明確分為 `CLEAR／IMPROVED FAILED／NO IMPROVEMENT`；shortlist 保留無改善對照但預設選取最佳改善候選。
- [x] 修正 Apply 後 Repair panel 卸載；Undo 恢復完整 shortlist／comparison／Top Repair team，reload 僅保存明確套用的 draft stable IDs。
- [x] CLEAR repair 新增 local-best settlement preview；grade／score／round／team stable IDs 只在玩家明確 Confirm 後寫入當時的 `owm.challenge.v2`；v2.41 起由 v3 接手。
- [x] 新增 pure draft settlement preview／confirm contract；FAILED 拒絕、preview 建立無副作用、previous-best fingerprint 可拒絕過期確認。
- [x] BOSS015 完成 CLEAR preview→取消復原→再次 CLEAR→確認→reload；BOSS080 FAILED runtime candidate 不顯示 settlement，Campaign／audit 仍隔離。
- [x] Boss Challenge save 升級為 `owm.challenge.v3`；best record 永久保存 `OPERATION／DRAFT_CONFIRMATION` source，v1／v2 migration 預設為 `OPERATION` 並保留 v2 draft map。
- [x] Route／Result／CLEAR settlement 顯示來源；來源不參與 best 排序，相同成績不覆寫既有 provenance。
- [x] BOSS015 DRAFT_CONFIRMATION 與 BOSS001 OPERATION best 完成 coexist／compare／reload browser flow；Campaign v4 逐字隔離，1440 單頁與 768 無水平 overflow 通過。
- [x] Challenge Route 新增 source filter，可將 `OPERATION／DRAFT_CONFIRMATION` 與完成狀態等既有條件交集；Briefing 顯示兩種來源的 best／clear 統計。
- [x] 新增 Challenge-only `OWM_CHALLENGE_SAVE` v3 serialize／parse contract 與「挑戰存檔」Tab；支援下載、v1／v2 migration 與 v3 覆寫匯入。
- [x] Challenge importer 重新驗證 Boss／Character FK、三人唯一性與 source，拒絕 Campaign envelope、損壞 JSON、未來版本；不讀寫 Campaign v4。
- [x] Browser 完成 source filter 交集、JSON generate、Campaign reject、empty replace、restore、reload；1440 單頁與 768 無水平 overflow 通過。
- [x] Challenge import 改為 pure preflight→Confirm contract；先顯示 best／OPERATION／DRAFT_CONFIRMATION／squad draft 的目前→匯入後數量與 added／changed／removed stable IDs，確認前不寫檔。
- [x] Confirm 加入 current/incoming fingerprint 防護；過期 progress 或被竄改 preview 拒絕覆寫。
- [x] 確認後提供 React session 一層 Undo，可跨 Deployment Tab；匯入後再變更會使 Undo 過期，reload 不保存 Undo。
- [x] Browser 完成 Campaign reject、empty v3 preview/cancel、v2 migration preview/confirm、跨 Tab Undo、reload isolation；Campaign raw JSON 全程不變，1440 單頁與 768 無水平 overflow 通過。
- [x] 完成 v2.43 全模式 browser regression：Campaign 15 關、Challenge、Collection、Codex、Sandbox、Onboarding、1440×900 單頁與 768px touch／responsive 全數通過，無需追加修正。
- [x] 依 Master Charter 與 Data Master 完成 Web MVP requirement audit；教學、Campaign、Boss Challenge、Sandbox 為可玩完成，合作任務列為 Web MVP 外。
- [x] Sandbox 新增 Scenario Lab：CALM／STANDARD／STORM／EXTREME preset、自訂 Sea State、Weather Window、Safety、Evidence、Round Limit 與 Vessel protection 即時預覽。
- [x] Scenario config 只存在 deployment／session state；不修改 Vessel master data、Campaign v4 或 Challenge v3，Operation 顯示完整 snapshot。
- [x] 新增 Sandbox domain tests 與 focused Chrome smoke；1440×900 全控制單頁、768px 無水平 overflow。
- [x] 建立 `sceneAssets.json`，將 150 Scene metadata 與實際 runtime asset availability／版本／QA／fallback provenance 分離。
- [x] 15 個 Campaign Mission node 顯示 `sceneId` 與 `INTEGRATED／FALLBACK`；Operation 保留 requested Scene 名稱與實際圖片來源。
- [x] Sandbox Route 可選 150 個 Scene 並預覽 location／mood／variant／provenance；選擇只存在本次 session，不修改 Campaign／Challenge save。
- [x] Phaser 依 scene route 載入 primary／fallback，新增 scene-ready browser gate，避免空白 canvas 被誤判成完成。
- [x] Scene routing domain／Python data QA／Chrome smoke 通過；Campaign／Sandbox 在 1440×900 單頁，768px 無水平 overflow。

## 驗證證據

- `tools/validate_owm_data.py`：資料 counts、IDs、FK、完整 100 Boss audit snapshot、P01–P10 與 `public/data` 同步通過。
- Vitest：20 test files、118 tests 通過；新增 Scene direct／fallback routing、requested metadata preservation 與 broken-FK rejection；既有 Sandbox scenario、Challenge import、Campaign／Challenge isolation、60×5 Track 與 15 關 progression tests 均保留。
- TypeScript：`tsc --noEmit` 通過。
- Vite：production build 通過；React 主 chunk 414.16 kB，Phaser lazy chunk 1,381.35 kB。
- Gameplay browser smoke：部署、Source Art、Phaser canvas、回合資源、技能、六階段推進與 Debrief 通過，且無 console error。
- `tools/validate-art-prompts.mjs`：300 筆 P01 均包含三葉片正向約束與風機幾何負面提示詞。
- Source Art browser smoke：active index 內 130 名角色全數載入成功，且 browser console 無錯誤。
- `CHR-DIG-271` v002：`1024×1536`、SHA-256 `f8c9c7b800b697c2c8025be63bff57b4b665802225e2ce804328eccb72524678`，2:3 比例通過。
- `CHR-MAR-177` v002：`1024×1536`、SHA-256 `18e6d7a75236fe83c54c19a52b428ff37f737f5e82dde6f92f00a2d1da6c08a3`。
- `CHR-DIG-272` v002：`1024×1536`、SHA-256 `587b7fe9a2c8f09667ee5936137e9b7ef2b8b6d33dbbfd7506177dff50310724`。
- Source Art browser smoke：20 名角色全數載入、三張 candidate 顯示 `P01 V002`，且無 console error。
- Batch 003 QA：10/10 比例通過，`reframeRequired = 0`、`visualRegenerateRequired = 0`。
- Source Art browser smoke：30 名角色全數通過，L5 `CHR-GOV-005`、`CHR-ACA-045` 卡牌圖像載入正確。
- `CHR-DEV-090` v002：`1024×1536`、SHA-256 `9fdd9851d8f420565b3e5b76ba96fb9c981fa8a593058243f18789685c56d2fe`。
- `CHR-ACA-046` v002：`1024×1536`、SHA-256 `6cbb604c8b15399b1882619f99e1b3d468ab71d1e5ded4bc847cc86b6c85a86d`。
- `CHR-MFG-131` v002：`1024×1536`、SHA-256 `54155dbdc3e9e89ae04ceea96fb7e6714ac545a471f1b2aa3a744d38ee94f623`。
- Batch 004 QA：10/10 active 版本比例通過，`reframeRequired = 0`、`visualRegenerateRequired = 0`、`correctionQaPending = 3`。
- Batch 005 QA：10/10 active 版本比例通過，無新增 `visualRegenerateRequired` 或 `reframeRequired`。
- 完整 Art manifest：`generated = 100`、`pending = 200`、`correctionQaPending = 10`、`upscalePending = 100`。
- Source Art browser smoke：40 名角色全數通過，三張 Batch 004 candidate 均顯示 `P01 V002`。
- Source Art browser smoke：50 名角色全數通過，Batch 005 的 `CHR-OMI-226`、`CHR-DIG-276`、`CHR-GOV-008` 顯示正確，且無 console error。
- Batch 006/007 QA：20/20 active 版本比例通過，`reframeRequired = 0`、`visualRegenerateRequired = 0`。
- Source Art browser smoke：70 名角色全數載入成功，active index、圖片尺寸與 console error scan 通過。
- Campaign browser smoke：正確診斷影響 Evidence、Debrief 發放 XP、解鎖 `MSN-TUT-002`，重載後進度仍可選取。
- Modes browser smoke：Collection 300 張角色卡、角色 XP 與 70 張 Source Art 顯示通過；Sandbox 暴露 100 Boss、無技能鎖且不改 Campaign localStorage。
- Class/save browser smoke：DRV 事件寫入回合 log、Collection 產生 `OWM_CAMPAIGN_SAVE` v4 envelope、BOSS100 顯示 STR 規則，重載後 Campaign 顯示 1/15。
- Responsive browser smoke：桌面 telegraph 與 Phaser event pulse 顯示正確；768px 可開啟低動態、部署、由 touch action 結束回合，且 `scrollWidth` 不超過 viewport。
- Reactive browser smoke：第一回合出現天候惡化 `-8`，Reactive response 將實際損失降為 `-4`，AP／Energy／cooldown／BranchGuard 與 log 均正確；Campaign 仍完成並保存 1/15。
- Codex browser smoke：第一關結算顯示 Knowledge Codex reward；reload 後 `KDX-001` 為唯一解鎖條目，15 張卡片、分類篩選與全文安全聲明均可讀，console 無錯誤。
- Mission map browser smoke：五章／15 節點、完成評級、locked disabled、available selection、3/3 推薦配置與 desktop／768px layout 均通過。
- Mission event deck browser smoke：第一關 R01/R04/R07 預告、`×0.75` 事件與 Reactive 減傷、S4 `×1.15/1.35/1.55` 預告及未減傷天候 `-9` 均通過。
- Mastery perk browser smoke：部署 3/6、Evidence +6、Reliability +4；L5 runtime Energy 6、fatigue protection -2；Collection L4/L5 狀態均通過。
- Chapter 05 browser smoke：完成前四章後 `MSN-FNL-013` 為 S5 available，deck 顯示 `×1.35 / ×1.60 / ×1.85`。
- Campaign finale browser smoke：15/15 Mission、5/5 Chapter、平均最佳分與整體評級顯示正確；最終 deck 到 `×2.00`，15/15 Codex 全部解鎖。
- Balance simulation：45 組 run 全部輸出；progression gate PASS，L5 三個 S5 於第 7 回合完成且維持 tight／critical。
- Onboarding browser smoke：五段 focus、Reactive／Diagnosis 自動推進、Debrief 完成、reload、重播、跳過與獨立 persistence 全數通過。
- Onboarding responsive smoke：768px 無水平 overflow；導覽卡不攔截底層 gameplay 操作。
- Operation Readiness browser smoke：初始 2/5 且 Deploy disabled；三項確認後為 5/5 READY，初始天候與動員成本進入 runtime，desktop／768px 均無水平 overflow。
- Equipment inventory browser smoke：新 Campaign 為 40/200、L2–L5 locked；Collection 顯示 tier/category 持有數，v4 export 保存 40 IDs，v1 九關存檔 migration 為 160/200，Sandbox 全部 200 項可用。
- Equipment maintenance browser smoke：新裝備 100%、任務後 EQ 92%／SP 95%、reload 保留損耗；完整維修恢復 100% 並扣 MNT，20% grounded 會鎖定 deploy，修復後立即恢復出勤。
- Maintenance economy simulation：L5 全 15 關逐關完整維修，15/15 serviceable、0 repair failure、結餘 296 MNT。
- Crew readiness browser smoke：Debrief 發放 RST 並顯示三人任務末→返航後疲勞；reload、Collection 300 人統計與 v4 JSON 保留狀態；100% Exhausted 阻擋 Deployment，Rest 後恢復出勤。
- Crew readiness economy simulation：完整 L5 route 15/15 deployable、15/15 complete、0 exhausted block，RST 3 + 29 − 0 = 32；數值只代表 deterministic gameplay policy。
- Single-screen browser smoke：1440×900 下 Deployment 五個 Tab、Roster filters、Crew Rotation Advisor、Collection Crew／Resources、Codex 與 Operation 均無垂直／水平文件 overflow。
- Turbine geometry tests：恰好 3 支葉片、120° 等距、葉尖等長、root 位於 hub 範圍且無偏心矩形葉片。
- Batch 008 QA：10/10 aspect pass、`reframeRequired = 0`、`visualRegenerateRequired = 0`；80 名 active Source Art browser smoke 通過。
- Batch 009 QA：10/10 aspect pass、`reframeRequired = 0`、`visualRegenerateRequired = 0`；90 名 active Source Art browser smoke 通過，人工核准仍為 false。
- Batch 010 QA：10/10 aspect pass、`reframeRequired = 0`、`visualRegenerateRequired = 0`；100 名 active Source Art browser smoke 通過。本輪另抽查 `CHR-DIG-283／CHR-DEV-099／CHR-MAR-189`，未見多餘人物、文字、風機葉片或離軸 rotor；最終人工核准仍為 false。
- Dispatch Forecast browser smoke：第一關 Equipment 顯示 `100→92/86` 與 `100→95/91`，MNT 顯示 success `+24–34`／failure `+11`、修滿後 `97–107/79`，SOV 顯示 `3→5 RST`。
- Crew Rotation browser smoke：新 Campaign 初始 60/300、鎖定 L3 搜尋為 0、L1 搜尋為 1；Advisor 只完整搜尋 60 名已解鎖角色，一鍵套用後三席與 Forecast 同步為 `OPTIMAL`。
- Career Track browser smoke：進度注入後 62/300，任務結算兩條 Track 由 95 跨越 100 並解鎖兩名 L2；reload 後 Collection 維持 64/300，1440×900 與 768px 無水平 overflow。
- Boss Challenge browser smoke：100 Boss、S5 20/100、S5+GRD 1/100=`BOSS080`、Audit Hardest、零結果鎖定 Deploy、300/300 roster、固定 L3／10 回合／L1、local best reload 與 Campaign raw JSON 完全不變均通過。
- Challenge Squad Advisor browser smoke：BOSS001 顯示 VERIFIED、score 80、R2、100% candidate clear、3/3 counter 與 6/6 coverage；一鍵套用精確三人隊伍後 Campaign raw JSON 不變，Crew 仍為 1440×900 單頁。
- Challenge Squad Compare browser smoke：BOSS001 初始 CURRENT `2/3 Counter、6/6 Stage、0/3 Members` 對 AUDIT `3/3、6/6、3/3`；套用後 3/3 members、手動換人後回到 2/3 並可恢復，Campaign raw JSON 全程不變。
- Challenge Strategy Briefing browser smoke：BOSS080 GRD 顯示 Safety／Energy `-2/R`，BOSS001 WEA 顯示 Weather `-4/R` 與 R01／R04／R07；`CHR-GOV-003` 使 Reactive `0 GAP→1 READY`，恢復 audit 隊伍後同步返回 GAP。
- Crew Skill Capability browser smoke：BOSS001 Route 「找 Reactive」一鍵開啟 Crew `60/300`；TEAM_RECOVERY `300/300`、LOW_ENERGY `240/300`、ALL `300/300`，Campaign raw JSON 全程不變。
- Strategy Gap Candidate browser smoke：BOSS001 顯示 `60 CREW / 180 SWAPS`、Reactive `0→1`、Counter `2→3/3`、Stage `6→6/6`；套用 `CHR-MAR-178` 後 Strategy 為 READY，復原後回到原隊與 GAP，Campaign raw JSON 不變。
- Boss Squad Draft browser smoke：BOSS002／BOSS003 各自換入不同 stable ID，Route 切換與 reload 後正確還原；BOSS001 結算後 best team 與目前 draft 同時保留，Campaign raw JSON 全程不變。
- Challenge Draft Route browser smoke：DRAFTED 為 2/100、UNDRAFTED 為 98/100；選定 draft 顯示 IDs／Counter／Stage／gaps 並可一鍵 reload，瀏覽未規劃 Boss 不新增 draft，Campaign raw JSON 不變。
- Audit-seeded Draft browser smoke：BOSS004 由 UNDRAFTED 一鍵建立為第三個 draft，精確保存 audit IDs、best map 保持空白；reload 後仍為 Counter 3/3、Stage 6/6 與無 Reactive gap，Campaign raw JSON 不變。
- Draft Readiness browser smoke：三個 draft 顯示 `1 GAP-FREE／2 HAS GAPS`；BOSS002 換掉／換回 Reactive 成員時即時變為 `0／3` 再恢復，GAP-FREE／HAS-GAPS／NO-REACTIVE filter 與 Readiness sort 均通過。
- Route Top Repair browser smoke：BOSS004 顯示 Reactive top repair、`60 CREW / 180 SWAPS`、Gaps `1→0`、Stage `6→6/6`；Apply／Undo 即時改變 portfolio，第二次 Apply 跨 reload 保存，Campaign raw JSON 全程不變。
- Repair Queue browser smoke：由 BOSS004 修補後顯示 `NEXT · BOSS003`；即使套用 S5 filter 仍可一鍵回到 BOSS003 的 `DRAFTED + HAS GAPS`，且載入時不改隊。連續 Apply／Undo 正確更新 `—/0→1/1` 與 session `1→0`，Campaign raw JSON 不變。
- Draft Verification browser smoke：BOSS004 audit draft 為 `VERIFIED CLEAR · B · 76 · R4/10`；BOSS080 audit draft為 `CLEAR · D · 58 · R8/10`，改成預設隊伍後為 `VERIFIED FAILED`。換隊失效、reload isolation、static audit／local best／Campaign raw save 隔離均通過。
- Repair Re-Verify browser smoke：BOSS015 預設隊伍 FAILED，Top Repair 換入 `CHR-MFG-128` 後 `REPAIR CLEAR`；BOSS080 同路徑為 `STILL FAILED`。兩者顯示 before／after IDs、score／round delta，Undo、local best／Campaign／audit isolation、1440 單頁與 768 無水平 overflow 均通過。
- Runtime Repair Preview browser smoke：BOSS080 預設 `CHR-ACA-043 · IMPROVED FAILED · 33→34 (+1)`；實際改選 `NO IMPROVEMENT · 33→33 (+0)` 後 Apply 仍 FAILED。slot／Counter／Stage／gaps、Evaluate no-save、Apply draft-only、完整 shortlist Undo、reload isolation、1440 單頁及 768 無水平 overflow 均通過。
- Draft Settlement browser smoke：BOSS015 CLEAR 後顯示 `BEST NONE→54` 與 `NO SAVE UNTIL CONFIRMED`；取消回到 FAILED 且 best 保持空白，再次確認後只寫 BOSS015 local best。reload 清除 preview 但保留 best；BOSS080 FAILED 無確認按鈕，1440 單頁與 768 無水平 overflow 均通過。
- Best Source browser smoke：BOSS015 confirmed draft 保存／reload 為 `DRAFT_CONFIRMATION`，BOSS001 正式出勤保存／reload 為 `OPERATION`；兩筆 best 與各 Boss draft 可同時存在於 v3，Campaign raw JSON 全程不變。
- Challenge Source Filter browser smoke：`DRAFT_CONFIRMATION + CLEARED` 精確得到 BOSS015，`OPERATION + CLEARED` 精確得到 BOSS001；Briefing 為兩者各 `1/1`。
- Challenge Backup browser smoke：v3 envelope 保留 BOSS001／BOSS015 source 與 6 筆 draft；Campaign JSON 被拒絕，empty replace 後可由原備份恢復並跨 reload 保存，Campaign raw JSON 全程不變。1440 單頁與 768 無水平 overflow 通過。
- Challenge Import Preflight browser smoke：empty v3 顯示 `BEST 2→0／DRAFT 6→0` 後取消且 raw save 不變；v2 顯示 migration、affected／removed IDs，確認後只保留 BOSS015 並正規化為 OPERATION。Undo 跨 Tab 還原 BOSS001／BOSS015 source 與 6 drafts，reload 後 Undo 清除，Campaign raw JSON 全程不變。
- Batch 011 QA：10/10 active 版本比例通過，`reframeRequired = 0`、`upscalePending = 10`；110 名 active Source Art browser smoke 全數載入。Subagent precheck 通過，正式 `userVisualApproval=false`。
- Batch 012 QA：10/10 active 版本比例通過，`reframeRequired = 0`、`upscalePending = 10`；active Source Art 累計 120/300，120 名角色 browser smoke 全數載入，正式 `userVisualApproval=false`。
- Batch 013 QA：10/10 active 版本比例通過，`reframeRequired = 0`、`upscalePending = 10`；active Source Art 累計 130/300，130 名角色 browser smoke 全數載入，正式 `userVisualApproval=false`。
- Challenge single-screen smoke：1440×900 的 Route／Crew／Loadout／Operation／Result 無文件 overflow，完成頁 Topbar 仍可見；768px 無水平 overflow。
- Boss Challenge balance audit：100/100 clear；S1–S2 candidate clear 98%，S5 candidate clear 55%，S5 17 tight／3 critical／0 comfortable；Markdown／JSON 報告與 gates 均 PASS。
- v2.43 全模式 regression：`smoke:gameplay`、`smoke:layout`、`smoke:onboarding`、`smoke:art` 全數通過；Campaign v4 migration／15 關 completion、五個 Deployment Tab、Operation、Collection／Codex／Sandbox、768px touch flow 與 130 名 Source Art 均無回歸。
- v2.44 Sandbox Scenario Lab：preset／自訂資源／Sea State vessel projection／session snapshot／Campaign isolation focused smoke 通過；`smoke:gameplay`、`smoke:challenge`、`smoke:layout` regression 全數通過。
- v2.45 Mission Scene Routing：15 Campaign routes、Sandbox 150 selector、Phaser primary／fallback、provenance、Campaign isolation focused smoke 通過；`smoke:gameplay`、`smoke:challenge`、`smoke:sandbox`、`smoke:layout` regression 全數通過。
- v2.46 Wind Farm Operations Board：6 個 stable Turbine IDs、15 Mission assignments、availability／reliability／backlog 結算、Campaign v5 migration 與 reload persistence 完成。
- Wind Farm Board browser smoke：1440×900 同頁顯示 6 機組與 15 Missions；選定風機、Operation status、Debrief 前後差異、v5 fleet state reload 與 768px 無水平 overflow 通過。
- v2.46 驗證：21 test files／123 tests、data gate、TypeScript、Campaign 6/12/15 balance、15/15 Maintenance／Crew readiness economy、production build 與 Campaign／Challenge／Sandbox／Scene／Layout／Onboarding smoke 全數通過。
- v2.47 Fleet Maintenance Action：Board 可獨立選擇風機，deterministic quote 顯示 priority／reliability／backlog／availability／MNT 前後值；Prepare／Cancel 不存檔，Confirm 才原子扣 MNT、更新 fleet state 並累計 action count。
- Fleet Maintenance browser smoke：WTG-004 第一次 `76→86%／2→1／80→48 MNT`，reload 後第二次 `86→94%／1→0／48→23 MNT`；最後回到 AVAILABLE，1440×900 單頁及 768px 無水平 overflow 通過。
- v2.47 驗證：21 test files／127 tests、data／art gate、TypeScript、Campaign／Challenge balance、production build，以及 Fleet／Campaign／Challenge／Sandbox／Scene／Layout／Onboarding／Source Art smoke 全數通過。
- v2.48 Fleet Dispatch Priority：六座風機全部依 availability pressure、priority、backlog、reliability deficit、單次 availability recovery 與 reliability gain 建立 deterministic `#01–#06` queue；同分再以 reliability／cost／stable ID 排序。
- Queue UI 在既有六張卡內顯示 R／B 前後、MNT、READY／SHORT／CLEAR、AVL impact；選取卡片顯示整場 AVL／平均 R／Backlog 投影，Confirm 後以最新 MNT 與 fleet state 即時重排。
- Fleet Dispatch browser smoke：初始排名 `006→004→002→001→005→003`、`4 ACTION／4 READY`、WTG-002 `AVL +1`；WTG-004 兩次確認後 23 MNT 情境重算為 `3 ACTION／0 READY`，reload、1440×900 單頁及 768px 無水平 overflow 通過。
- v2.48 驗證：21 test files／128 tests、data／art gate、TypeScript、Campaign／Challenge balance、production build，以及 Fleet／Campaign／Challenge／Sandbox／Scene／Layout／Onboarding／Source Art smoke 全數通過。
- v2.49 Fleet Maintenance Plan：SINGLE／PLAN Tab 共用 compact panel；多部選項去重後依 stable ID 執行，每一步保存 R／B／AVL／MNT 前後值與整場 summary，超出剩餘 MNT 的項目不可加入或確認。
- Plan preview／add／remove／prepare／cancel 不寫檔；Confirm 由 `maintainCampaignTurbinePlan` 一次原子更新 Campaign v5 的總 MNT 與完整 fleet state。
- Fleet Plan browser smoke：反向點選 `WTG-004→001` 正規化為 `001→004`、逐步 `80→55→23 MNT`、第三部顯示 `PLAN SHORT`；取消不寫檔，確認後兩部結果與 reload 一致，1440×900 單頁及 768px 無水平 overflow 通過。
- v2.49 驗證：21 test files／132 tests、data／art gate、TypeScript、Campaign／Challenge balance、production build，以及 Fleet／Campaign／Challenge／Sandbox／Scene／Layout／Onboarding／Source Art smoke 全數通過。
- v2.50 Fleet Condition Dispatch Modifier：Campaign deploy 依目標風機 availability／reliability／backlog 派生 NOMINAL／ELEVATED／HIGH／CRITICAL pressure，並一次性修正 mobilization cost、initial safety、initial reliability；Readiness、Dispatch Forecast、Operation field feed 顯示同一組 before／after projection，Sandbox／Boss Challenge 不套用。
- v2.50 驗證：21 test files／135 tests、TypeScript、Campaign balance、production build、layout／fleet／gameplay browser smoke 通過；layout smoke 新增 Fleet Condition 三處斷言與截圖。
- v2.51 Fleet Operations History：Campaign deploy、mission outcome、Fleet Maintenance single confirm、Fleet Maintenance plan confirm 都 append 到 `fleetOperationsHistory`，最多保留最近 30 筆 gameplay state 摘要；既有 v1/v2/v3/v4/v5 存檔 normalize 時補空 history 並過濾未知 Mission／Turbine ID。
- Wind Farm Operations Board 新增 `DISPATCH／HISTORY` Tab；History 使用 compact pagination 顯示事件、MNT、R／B／availability 或 dispatch cost／safety／reliability before-after，維持 1440×900 route 單頁。
- v2.51 驗證：21 test files／136 tests、TypeScript、production build、validate、layout smoke、fleet smoke、gameplay smoke 通過；browser smoke 驗證空 History、deploy DISPATCH history、single／plan maintenance history 與 reload persistence。
- v2.52 Mission Result Review：Operation Debrief 改為 `REVIEW／SCORE／LOG` Tab；REVIEW 預設集中顯示 XP、MNT、Equipment wear、Crew fatigue、Wind Farm delta 與 Codex unlock，SCORE 保留六項評分，LOG 保留操作紀錄但限制高度。
- v2.52 驗證：21 test files／136 tests、TypeScript、production build、layout smoke、gameplay smoke 通過；gameplay smoke 新增 REVIEW／SCORE／LOG 與 Debrief single-screen 斷言。
- v2.53 Mission Replay Compare：`awardCampaignMission` 在覆寫 `bestScores` 前派生本次 score/grade、任務前 best、任務後 best 與 `FIRST_BEST／NEW_BEST／BEST_HELD`；REVIEW Tab 顯示「本次／任務前 BEST／任務後 BEST」，不新增 Campaign save 欄位。
- v2.53 驗證：21 test files／137 tests、TypeScript、production build、layout smoke、gameplay smoke 通過；domain tests 覆蓋 first/new/held，gameplay smoke 驗證 compare card 與 Debrief single-screen。
- v2.54 Campaign Continue CTA：`campaignContinueTargets` 只由 Campaign progress、missions 與 current mission ID 派生下一個可出勤 Mission、目前任務與戰役完成狀態；REVIEW Tab 顯示「下一個任務／返回 Route／重玩本任務」compact action，不新增 Campaign save 欄位。
- v2.54 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過；gameplay smoke 驗證 CTA 文案並實際點擊「下一個任務」回到 Route。
- v2.55 Debrief Route Readiness Carryover：Campaign Route briefing 新增 compact readiness chips，從 Debrief CTA 回到下一關後可直接看到 Permit／PPE／Access／Vessel／Mastery／Crew／Loadout 缺口；chip 與「處理下一個缺口」只切換既有 Tab，不新增 Campaign save 欄位。
- v2.55 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過；gameplay smoke 驗證 CTA → Route → readiness reminder → Readiness Tab。
- v2.56 Route Reminder Action Shortcuts：Route reminder 的 Permit／PPE／Access 缺口可在 Route 內 explicit 一鍵確認；Crew／Loadout chips 導向對應 Tab；shortcut 前後不改 `owm.campaign.v5`，也不自動部署。
- v2.56 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過；gameplay smoke 驗證 shortcuts 前後不改 `owm.campaign.v5`，並達到 Route 7/7 READY、Readiness 5/5 READY。
- v2.57 Ready Route Deploy CTA：Route reminder 達到 7/7 READY 且既有 deploy guard 通過後，primary CTA 改為「立即出勤」並呼叫原本 `onDeploy`；不新增第二套出勤路徑或 Campaign save 欄位。
- v2.57 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過；gameplay smoke 驗證 Route READY → 立即出勤 → Operation，並使用既有 Campaign dispatch flow。
- v2.58 Operation Quick Return：Operation 進行中新增二段式 `Abort / Return Route`；Cancel 保持 active sortie，Confirm 只清除 React session 回 Route，不呼叫 mission settlement、不寫 reward／completed mission／best score／mission outcome history。
- v2.58 Source Art Batch015：背景 subagent 完成 10 張 P01 active import，active Source Art 更新為 150/300；`CHR-MAR-196` 以 v002 修正尺寸，Batch015 10/10 通過 `1024×1536`／2:3 precheck，仍待人工 visual QA。
- v2.58 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過；gameplay smoke 驗證 abort open／cancel／confirm 與 `MSN-TUT-002` abort 後不新增 settlement 資料。
- v2.59 Operation Return Context：Campaign Operation abort 回 Route 後新增 session-only notice，說明本次 sortie 未結算、未寫 mission result／reward／best score／mission outcome history，並提供同一任務 Route shortcut；不提供 direct redeploy shortcut、不新增 Campaign save 欄位。
- v2.59 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過；gameplay smoke 驗證 Return Notice 顯示 `MSN-TUT-002` abort context、同任務 Route shortcut 可見、notice 顯示期間不改 `owm.campaign.v5`，且 reload 後自然消失。
- v2.60 Operation Return Notice Dismiss：`OperationReturnNoticePanel` 新增手動 `Dismiss notice` action；玩家可在不 reload 的情況下清除 abort return context，且不改 Campaign save、不重新部署、不新增 save 欄位。
- v2.60 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過；gameplay smoke 驗證 dismiss 與 Collection→Campaign mode switch 都會清除 notice，且不改 `owm.campaign.v5`。
- v2.61 Operation Return Notice Mobile Copy：Abort return notice 新增 `未結算／未寫存檔／僅回 Route` compact flags；768px Route notice 改為單欄、狀態文字可換行、actions 等寬，避免 mobile 上長句造成誤讀或水平 overflow。
- v2.61 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過；gameplay smoke 驗證 768px abort → return notice → dismiss flow、mobile copy、水平 overflow 與 `owm.campaign.v5` 不變。
- v2.62 Operation Abort Mobile Confirmation Copy：Mobile bottom dock 的 abort confirm 狀態新增短 copy，明確說明 Return 只中止 sortie、未結算、未寫任務結果；Cancel 保持 active Operation，Confirm 才回 Route notice。
- v2.62 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過；gameplay smoke 驗證 768px mobile abort confirm copy、Cancel 保持 active Operation、Confirm 回 Route notice，且不改 `owm.campaign.v5`。
- v2.63 Operation Abort Desktop Confirmation Copy：Desktop sidebar 的 abort confirm 與 mobile wording 對齊，明確說明 Return 只中止 sortie、不寫 mission result／reward／best score／mission outcome history；Cancel 保持 active Operation 且不改 `owm.campaign.v5`。
- v2.63 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過；gameplay smoke 驗證 desktop abort confirm copy、Cancel 保持 active Operation、不改 `owm.campaign.v5`，Confirm 仍走 Route notice。
- v2.64 Operation Info Tabs：Active Operation 下方資訊區新增 `LOG／SUMMARY` session-only tabs；SUMMARY 彙整 stage、progress、weather、safety、evidence、Scene、Turbine 與 Fleet pressure，避免把更多資訊堆高頁面。
- v2.64 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過；layout smoke 驗證 Operation SUMMARY tab 內容完整、可切回 LOG，且 1440×900 仍無文件 overflow。
- v2.65 Operation Info Mobile Tabs：768px mobile Operation 的 SUMMARY tab 改為 2 欄 compact grid，gameplay smoke 實際切換 SUMMARY／LOG 並驗證 mobile summary 無水平 overflow。
- v2.65 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過；gameplay smoke 驗證 768px Operation SUMMARY／LOG tab 切換、summary 內容與水平 overflow。
- v2.66 Operation Info Tab Reset：每次 Campaign／Sandbox／Boss Challenge 建立新 Operation session 前都將 info tab 重設為 LOG；gameplay smoke 覆蓋 SUMMARY→abort→Route→redeploy 後新 Operation 預設回 LOG。
- v2.66 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過；gameplay smoke 驗證 SUMMARY→abort→Route→redeploy 後新 Operation 預設回 LOG。
- v2.67 Operation Info Tab Reset Coverage：補 browser smoke 證據，Sandbox deploy 與 Boss Challenge deploy 後都斷言新 Operation 預設 LOG；Campaign return-route redeploy 覆蓋仍保留。
- v2.67 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過；gameplay smoke 驗證 Sandbox deploy 預設 LOG，challenge smoke 驗證 Boss Challenge deploy 預設 LOG。
- v2.68 Operation Info Tab A11y：`LOG／SUMMARY` 補標準 tablist／tab／tabpanel 語意與 `aria-controls`；LOG tabpanel 內保留 `role="log"` live region，layout／gameplay smoke 改用 role 驗證 desktop 與 mobile tabpanel。
- v2.68 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過；layout／gameplay smoke 以 role 驗證 desktop 與 768px mobile 的 LOG／SUMMARY tabpanel。
- v2.69 Operation Info Tab Keyboard：LOG／SUMMARY tabs 支援 ArrowLeft／ArrowRight／Home／End 鍵盤切換，切換後同步 focus、`aria-selected` 與 tabpanel 狀態。
- v2.69 驗證：21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過；layout smoke 實際按 ArrowRight／ArrowLeft 驗證 LOG／SUMMARY tab 鍵盤切換。
- v2.70 Operation Compact Desktop Smoke：新增 1366×768 低高度 desktop compact mode，壓縮 Mission Control、Field Feed、Operation Info、Card/Skills 三欄內容，讓 Operation 可在單一 viewport 內操作。
- v2.70 驗證：`pnpm validate`、`pnpm smoke:layout`、`pnpm smoke:operation:compact` 通過；compact smoke 實際部署任務，驗證 LOG／SUMMARY、document overflow、Mission／Field／Event／Card panel internal overflow，field feed 實測 425px 高度。
- v2.71 Rotor Structure Telemetry：Rotor digital twin 補 nacelle、tower、shaft axis 與 `SHAFT LOCK` label；`rotorTelemetryGeometry` 統一提供 blade/hub/nacelle/shaft/tower 尺寸，Phaser 只旋轉同一 rotor container。
- v2.71 驗證：focused turbine geometry test 3 tests、TypeScript、production build、layout smoke、compact Operation smoke、`pnpm validate` 通過；完整 test suite 為 21 files／139 tests，browser smoke 驗證 rotor metadata = 3 blades／shaft locked／nacelle／tower。
- v2.72 Scene Feed Variants：`sceneAssets.json` 接入 SCN001–SCN005 dawn/day/rain/dusk/night 五個寫實 Operation field-feed；Campaign SCN003 由 fallback 改為 integrated，SCN006 仍保留 verified fallback route。
- v2.72 驗證：focused scene routing test 4 tests、data validation、TypeScript、production build、scene smoke、layout smoke、`pnpm validate` 通過；scene smoke 驗證 Campaign／Sandbox integrated+fallback provenance、1440 single-screen、768px 無水平 overflow。
- v2.73 Campaign Scene Feed Coverage：新增 `tools/generate-scene-feed-variants.py` 並補齊 15 個 Campaign mission 實際使用的 Scene direct field-feed asset（SCN003、SCN023–026、SCN042–046、SCN082–086）；SCN006 保留為 Sandbox fallback 驗證案例。
- v2.73 驗證：`validate:data` 新增 Campaign Scene direct asset gate；TypeScript、production build、scene smoke、`pnpm validate`、layout smoke、compact Operation smoke 通過。Scene smoke 驗證 Campaign 15 個 scene route badge 全部為 `INTEGRATED`，Sandbox SCN006 fallback provenance、Campaign isolation、1440 單頁與 768px 無水平 overflow 仍通過。
- v2.74 Operation Summary Scene Route：Operation `SUMMARY` tab 維持 8 格 compact layout，但新增 Scene route details：requested Scene／availability、source Scene／asset version、QA status；安全與證據仍由左側 runtime meters 顯示，不增加 event panel 高度。
- v2.74 驗證：TypeScript、layout smoke、compact Operation smoke、`pnpm validate`、gameplay smoke 通過；layout/gameplay smoke 驗證 desktop 與 768px mobile SUMMARY 均顯示 `SOURCE`、`QA`、`SCN003`、`INTEGRATED`、`V001`、`ENGINEERING QA PASSED`，且 1366×768 無 overflow。
- v2.75 Sandbox Scene Availability Filter：Sandbox Route 的 Scene selector 新增 `ALL／INTEGRATED／FALLBACK` tab 與 coverage summary，顯示 19/150 direct asset、131 fallback route；filter 只改清單可見性，不會偷改目前選中的 Scene。
- v2.75 驗證：TypeScript、scene smoke、`pnpm validate`、Sandbox Scenario smoke、layout smoke、compact Operation smoke 通過；scene smoke 驗證 coverage summary、Integrated 19 options、Fallback current+131 options、hidden current selection preserved、Campaign isolation、1440 單頁與 768px 無水平 overflow。
- v2.76 Fleet Board Turbine Icon：六張風機卡新增共用三葉片 SVG icon，包含 tower、nacelle、shaft、hub 與 3 片 120° rotor blade；Route UI 重用 `turbineBladePolygon`，不另寫一套風機幾何。
- v2.76 驗證：TypeScript、focused turbine geometry test、Fleet smoke、layout smoke 通過；Fleet smoke 驗證 6 個 icon 的 blade count = 3、shaft locked、nacelle、tower metadata，且 1440 單頁與 768px 無水平 overflow。
- v2.77 Sandbox Scene Feed Coverage：新增 SCN007–SCN016 direct field-feed asset，涵蓋 monopile、jacket foundation 與 floating turbine 起始批次；Sandbox direct coverage 由 19/150 提升為 29/150，SCN006 仍保留 fallback provenance regression。
- v2.77 驗證：`sync:data`、`validate:data`、TypeScript、production build、Scene smoke、layout smoke、compact Operation smoke、`pnpm validate` 通過；Scene smoke 驗證 29/150 integrated、121 fallback 與 fallback filter 122 options，1440 單頁與 768px 無水平 overflow 維持通過。
- v2.78 Operation Decision Prompt：active Operation 的 event panel 新增 compact `NEXT DECISION` guidance，依 pending branch、diagnosis gate、低 weather/safety、可用主動技能或回合狀態派生 `EVENT／DIAG／RISK／ACT／ROUND`，避免玩家必須從 log、stage 與 disabled skill 自行推論下一步。
- v2.78 驗證：TypeScript、layout smoke、compact Operation smoke、gameplay smoke 通過；layout/gameplay smoke 斷言 decision prompt 存在且顯示有效狀態碼，compact smoke 確認 1366×768 無 document 或 panel overflow。
- Source Art Batch017：背景 subagent 完成 10 張 P01 並匯入 active index；active Source Art 更新為 160/300，manifest summary 為 generated 160／pending 140／upscalePending 160／correctionQaPending 10，Batch017 10/10 通過 `1024×1536`／2:3 precheck，仍待人工 visual QA。

## 尚未完成

- Active Source Art 為 160/300；Batch017 已匯入 public art index，10/10 通過 `1024×1536`／2:3 engineering precheck，但正式 QA 仍為 `Visual Review Required`／`userVisualApproval=false`。
- `p01-manifest.json` 目前 summary 為 generated 160／pending 140／upscalePending 160；後續批次可繼續生成，但匯入仍需維持 engineering QA 與人工視覺 QA 分流。
- 現有 10 張 v002 correction candidate 仍待人工視覺 QA 確認。
- Batch 002 其餘 8 張 v001 已通過技術 QA，仍待人工視覺核准。
- 現有 160 張為 Web preview resolution，production `4096×6144` upscale 尚未完成。
- 多人、帳號、雲端存檔與後端 API 不在本次 Web MVP 範圍。

## 下一個可驗收批次

1. Source Art Batch017 已完成匯入；下一批可接 Batch018，仍維持 engineering QA、人工 visual QA 與 upscale 分流。
2. Runtime 場景圖的 Campaign 15 關已完成 direct coverage；Sandbox direct coverage 已推到 29/150，下一步可繼續逐批補 CTV/SOV/port/substation 其他 Scene，或把 AI 生成版替換到相同 scene asset 檔名。
3. 若先延續 gameplay，可把 decision prompt 擴充成可點擊的 guided action（例如切到可用技師、跳到診斷選項、或 highlight 可用 Reactive），但仍需維持 session-only，不改結算。
## Current clean status - 2026-07-18

- Version：`2.85.0-operation-field-feed-v003`。
- Completed：Generated and integrated `offshore-field-feed_ai_v003.png` for Operation center field-feed.
- Completed：Fallback, SCN002, and SCN003 scene routes now use V003 with saved prompt/negative guardrails.
- Guardrail：The v003 prompt explicitly blocks four-blade, warped-blade, detached-blade, off-axis rotor, text/logo/watermark, people, and fantasy machinery.
- Verified：`pnpm sync:data`、`pnpm validate:data`、`pnpm smoke:scene`、`pnpm smoke:layout`、`pnpm smoke:operation:compact`.

## Previous clean status - 2026-07-18

- Version：`2.84.0-fleet-turbine-icon-rigging`。
- Completed：Fleet Board turbine icon geometry now comes from `fleetTurbineIconGeometry`, keeping shaft, hub, tower, and nacelle on one main axis.
- Completed：Fleet icons are larger and visually clearer while keeping 1440 desktop and 768px mobile Fleet Board single-screen/no-horizontal-overflow gates.
- Guardrail：Fleet smoke now verifies real SVG axis coordinates and actual 3 blade polygons, not only metadata flags.
- Verified：`pnpm test -- src/domain/turbineGeometry.test.ts`、`pnpm typecheck`、`pnpm smoke:fleet`、`pnpm smoke:layout`.

## Previous clean status - 2026-07-18

- Version：`2.83.0-round-commit-confirmation`。
- Completed：High-risk End Round now requires session-only two-step commit confirmation before branch/failure/low-margin settlement.
- Completed：Desktop and 768px mobile End Round buttons both use the same confirmation gate while safe rounds remain one click.
- Guardrail：No save schema, end-round formula, or settlement mutation was introduced.
- Verified：`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay`.

## Previous clean status - 2026-07-18

- Version：`2.82.0-skill-forecast`。
- Completed：Operation `OBJECTIVES` tab now includes `SKILL FORECAST`.
- Completed：Skill Forecast shows recommended usable skill、applied power、stage clear/remains、AP / Energy / Fatigue cost.
- Guardrail：Forecast reuses existing `resolveTeamSkill` pure resolver; no UI-side power formula, no save schema or settlement change.
- Verified：`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay`.

## Previous clean status - 2026-07-18

- Version：`2.81.0-end-round-forecast`。
- Completed：Added `previewEndRound` domain pure function for End Round Forecast.
- Completed：Operation `OBJECTIVES` tab now shows `END ROUND FORECAST` with `F +x / S -x / W -x` and branch / failure risk note.
- Guardrail：Forecast uses the same formula and vessel projection path as actual `endRound`; no save schema or settlement change.
- Verified：`pnpm test -- src/domain/runtime.test.ts`、`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay`.

## Previous clean status - 2026-07-18

- Version：`2.80.0-operation-objectives-tab`。
- Completed：Active Operation info tabs now include `OBJECTIVES` beside `LOG / SUMMARY`.
- Completed：OBJECTIVES tab displays Stage target、Learning objective、Diagnosis gate、Branch event、Risk floor from runtime state only.
- Guardrail：No Campaign save schema change、no mission settlement change、no Sandbox / Challenge isolation change.
- Source Art：Batch018 completed; active Source Art index is now `170/300`.
- Verified：`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay`; Batch018 reported `pnpm sync:art`、`pnpm validate:art`、`pnpm smoke:art`.

- 版本：`2.79.0-fieldfeed-layout-geometry`。
- 已完成：Operation 中央 field-feed 接入 AI v002；fallback／SCN002／SCN003 指向 `offshore-field-feed_ai_v002.png`。
- 已完成：Fleet Board SVG icon 與 Phaser rotor telemetry 加強同軸約束，smoke 會檢查 3 blades、shaft lock、axis consistency、hub/shaft metadata。
- 已完成：1440×900 Operation 左側 MISSION CONTROL 壓緊；layout smoke 新增 End Round / Abort 不裁切 gate。
- 已驗證：`pnpm sync:data`、`pnpm validate:data`、`pnpm typecheck`、`pnpm build`、`pnpm smoke:layout`、`pnpm smoke:operation:compact`、`pnpm smoke:fleet`、`pnpm smoke:gameplay`。
- 背景：`source_art_batch_018_retry` 仍在跑，尚未回報完成；目前 active Source Art 仍為 160/300。
## Current clean status - 2026-07-18

- Version: `2.86.0-campaign-route-subtabs`.
- Completed: Campaign Deployment Route now uses `FLEET / MISSIONS / BRIEFING` internal tabs to keep Route content in one viewport.
- Completed: `CampaignMissionMap` supports focused rendering for fleet-only and missions-only views; `BRIEFING` keeps selected mission briefing, Route Readiness Carryover, and Mission Event Deck compact.
- Guardrail: Route sub-tab state no longer resets asynchronously when moving between Deployment tabs, preventing `MISSIONS` / `BRIEFING` from being overwritten by `FLEET`.
- Verified: `pnpm typecheck`, `pnpm smoke:deployment:compact`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm smoke:fleet`, `pnpm validate`.
## Current clean status - 2026-07-18

- Version: `2.87.0-operation-info-heading`.
- Completed: active Operation info panel heading now follows the selected tab: `OPERATION LOG`, `OPERATION SUMMARY`, or `OPERATION OBJECTIVES`.
- Guardrail: this is a session-only UI clarity change; no mission runtime, settlement, save schema, or balance formula was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm smoke:fleet`, `pnpm validate`.
- Source Art Batch019: background subagent was re-issued but has not produced files yet; active Source Art remains `170/300` from the current validation output.

## Current clean status - 2026-07-18

- Version: `2.88.0-turbine-axis-lock`.
- Completed: Fleet Board SVG turbine rotor animation now uses the actual hub coordinate as `transform-origin`, with `data-rotor-axis-lock="hub-shaft-tower"` for smoke verification.
- Completed: Operation Phaser field-feed rotor telemetry now exposes hub lock, `0,120,240` blade angles, and transform origin; the visual guide was changed to a bearing ring so it does not read as an extra blade.
- Guardrail: this is a visual/QA hardening change only; no mission runtime, settlement, Campaign save schema, or balance formula was changed.
- Verified: `pnpm typecheck`, `pnpm test -- src/domain/turbineGeometry.test.ts`, `pnpm smoke:operation:compact`, `pnpm smoke:fleet`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art Batch019: background subagent is continuing separately; do not count new art until it reports manifest/QA/sync results.

## Current clean status - 2026-07-18

- Version: `2.89.0-operation-field-feed-v004`.
- Completed: Operation center field-feed now uses `public/assets/environment/offshore-field-feed_ai_v004.png`; fallback, SCN002, and SCN003 route to V004.
- Completed: `offshore-field-feed_ai_v004.prompt.md` stores the positive prompt and negative guardrails for malformed blades, off-axis rotor, impossible offshore structures, people, text/logo/watermark, and fantasy machinery.
- Completed: Fleet Board turbine icon readability was increased to 58×50 while preserving the 2.88 hub/shaft/tower rotor axis-lock.
- Guardrail: this is an asset/layout/QA pass only; no mission runtime, settlement, Campaign save schema, or balance formula was changed.
- Verified: `pnpm sync:data`, `pnpm typecheck`, `pnpm test -- src/domain/turbineGeometry.test.ts`, `pnpm validate:data`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:fleet`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm validate`.
- Source Art Batch019: the spawned background agent did not generate new role art and accidentally touched main UI; active Source Art remains `170/300`.

## Current clean status - 2026-07-18

- Version: `2.90.0-operation-recommended-skill`.
- Completed: Operation `NEXT DECISION: ACT` now exposes a right-side `REC` recommended skill CTA that directly calls `useSelectedSkill(recommendedSkill)`.
- Completed: CTA displays the selected recommendation's applied power, AP/Energy cost, and stage clear/remains forecast from existing runtime logic.
- Guardrail: this is derived UI guidance only; no mission runtime, settlement, Campaign save schema, or balance formula was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art status remains `170/300`; no new Batch019 art is counted.

## Current clean status - 2026-07-18

- Version: `2.91.0-operation-rec-cta-settlement`.
- Completed: `recommended-skill-cta` click-through is now verified in browser smoke; AP must decrease by 1 and Energy must decrease by the CTA-displayed cost.
- Completed: settlement smoke accepts either progress increase or stage transition, matching `resolveTeamSkill` behavior when a skill clears the stage and progress resets.
- Completed: compact Operation smoke verifies the Operation log gains an entry after the CTA action.
- Guardrail: this adds test hooks and smoke coverage only; no runtime formula, mission settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art status remains `170/300`; no new Batch019 art is counted.

## Current clean status - 2026-07-18

- Version: `2.92.0-branch-reactive-rec-cta`.
- Completed: pending Branch Event panels now show a `branch-reactive-cta` recommendation when a usable Reactive skill exists.
- Completed: the CTA exposes stable recommended character/skill IDs and calls the existing `resolveBranch(actorIndex, skillId)` path.
- Completed: gameplay smoke clicks the CTA to mitigate the first Campaign branch event instead of relying on the first raw Reactive button.
- Guardrail: this is derived UI guidance and smoke coverage only; no branch penalty formula, Reactive settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art status remains `170/300`; Batch019 art-only subagent did not produce new art.

## Current clean status - 2026-07-18

- Version: `2.93.0-diagnosis-rec-cta`.
- Completed: Diagnosis Gate panels now show a `diagnosis-rec-cta` training recommendation when a correct diagnosis option exists.
- Completed: the CTA exposes `data-recommended-diagnosis-id` and calls the existing `chooseDiagnosis(optionId)` path.
- Completed: gameplay smoke uses the CTA during Campaign diagnosis and verifies evidence increases.
- Guardrail: this is training guidance and smoke coverage only; no diagnosis scoring formula, mission settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art status remains `170/300`; strict Batch019 art-only subagent is still running.

## Current clean status - 2026-07-18

- Version: `2.94.0-round-decision-rec-cta`.
- Completed: `NEXT DECISION: ROUND/RISK` now shows a compact `round-decision-cta` recommendation in the Operation decision prompt.
- Completed: the CTA calls existing `requestNextRound()` and preserves existing confirmation behavior via `data-round-confirmation-required` / `data-round-confirming`.
- Completed: compact Operation smoke drives the session into ROUND/RISK, clicks the CTA, and verifies End Round confirmation without overflow.
- Guardrail: this is derived UI guidance and smoke coverage only; no End Round formula, branch trigger rule, mission settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art status remains `170/300`; strict Batch019 art-only subagent is still running.

## Current clean status - 2026-07-18

- Version: `2.95.0-round-decision-rec-settlement`.
- Completed: compact Operation smoke now clicks `round-decision-cta` through confirmation and verifies End Round settlement via log growth and round/event/debrief movement.
- Completed: compact Branch Event layout is compressed at 1366×768 so the field feed remains above the playable height threshold after a round-triggered event opens.
- Guardrail: this is smoke/layout hardening only; no End Round formula, branch trigger rule, mission settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art status remains `170/300`; strict Batch019 art-only subagent is still running.

## Current clean status - 2026-07-18

- Version: `3.00.0-campaign-completion-summary-metadata`.
- Completed: Campaign Completion Summary now exposes stable metadata for completion state, mission/chapter totals, average best score, scored mission count, campaign grade, S-grade count, and mastered crew count.
- Completed: gameplay smoke verifies the full-completion fixture reports `15/15` missions, `5/5` chapters, average best score `80`, grade `A`, `3` S grades, and `1` L5 crew through metadata.
- Guardrail: this is completion summary metadata and smoke coverage only; no Campaign save schema, mission completion rule, score formula, reward settlement, replay routing, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`, `pnpm smoke:art`.
- Source Art status remains `180/300`; strict Batch019 art-only subagent is still running.

## Previous clean status - 2026-07-18

- Version: `2.99.0-debrief-secondary-cta-metadata`.
- Completed: Debrief Campaign Continue CTAs now expose stable metadata for next mission, return route, and replay mission actions.
- Completed: gameplay smoke verifies `continue-next-mission`, `continue-return-route`, and `continue-replay-mission` metadata after `MSN-TUT-001` settlement before routing to `MSN-TUT-002`.
- Guardrail: this is CTA metadata and smoke coverage only; no Campaign save schema, reward settlement, mission unlock formula, route selection logic, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`, `pnpm smoke:art`.
- Source Art status is now `180/300`; `sync:art` synced 192 P01 files and 180 active art-index entries, and `smoke:art` passed for 180 characters.

## Previous clean status - 2026-07-18

- Version: `2.98.0-operation-return-notice-metadata`.
- Completed: Operation abort/return notice now exposes stable `data-return-mission-id`, `data-return-reason`, `data-return-selected`, and `data-return-can-redeploy` metadata.
- Completed: the Route shortcut exposes `data-return-action`, `data-target-mission-id`, and `data-target-selected`; gameplay smoke verifies the desktop abort notice identifies `MSN-TUT-002`, the mobile abort notice identifies `MSN-TUT-001`, both use reason `abort`, selected state `true`, and no direct redeploy path.
- Guardrail: this is notice metadata and smoke coverage only; no Campaign save schema, abort behavior, mission settlement, reward formula, or deployment route was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art status remains `170/300`; strict Batch019 art-only subagent is still running.

## Previous clean status - 2026-07-18

- Version: `2.97.0-route-readiness-next-gap-metadata`.
- Completed: Route Readiness Carryover primary CTA now exposes stable `data-next-readiness-gap`, `data-next-readiness-action`, and `data-next-readiness-tab` metadata.
- Completed: gameplay smoke verifies pending metadata starts at `permit / confirm-permit / readiness`, advances to `ppe / confirm-ppe`, and switches to `READY / deploy / operation` when all route readiness gaps are cleared.
- Guardrail: this is CTA metadata and smoke coverage only; no Campaign save schema, readiness formula, deployment guard, route selection logic, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.
- Source Art status remains `170/300`; strict Batch019 art-only subagent is still running.

## Previous clean status - 2026-07-18

- Version: `2.96.0-debrief-next-mission-rec`.
- Completed: Debrief `continue-next-mission` now has recommended styling and `data-recommended-mission-id` when a next mission exists.
- Completed: gameplay smoke verifies the recommended mission ID is `MSN-TUT-002` before clicking through to the next Campaign Route.
- Guardrail: this is continuation CTA metadata/styling only; no Campaign save schema, reward settlement, mission unlock formula, or route selection logic was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm smoke:operation:compact`, `pnpm validate`.
- Source Art status remains `170/300`; strict Batch019 art-only subagent is still running.

## Current clean status - 2026-07-18

- Version: `3.03.0-source-art-diversity-profile-gate`.
- Completed: all 120 pending P01 Source Art items now carry structured `diversityProfile` metadata in the master manifest and pending batch manifests.
- Completed: `prompt-guardrails.json` now defines the required R4 diversity profile schema.
- Completed: `validate:art` now gates every pending 10-character batch for 3 masculine, 2 androgynous, no more than 5 feminine, at least five unique pose silhouettes, at least five face shapes, and at least five body types.
- Guardrail: generated R3 art remains unchanged; no active Source Art file, Source Art index schema, Campaign save schema, gameplay settlement, Operation field-feed route, or balance rule was changed.
- Verified: `pnpm validate:art`, `pnpm typecheck`, `pnpm build`.
- Source Art status remains `180/300`; Batch020 R4 art-only task should be re-issued after this gate.

## Previous clean status - 2026-07-18

- Version: `3.02.0-art-diversity-turbine-icon-v002`.
- Completed: pending/future P01 prompts now use `OWM-P01-R4-DIVERSITY-ENGINEERING`; generated R3 art remains unchanged.
- Completed: 120 pending prompts now require diversity across gender presentation, face, skin tone, hair, age impression, body type, pose, expression, camera angle, and tool handling; pending negative prompts no longer block `male character`.
- Completed: Fleet Board turbine SVG icon upgraded to `offshore-svg-v002` with monopile foundation, sea line, access rail, tower/nacelle highlights, and explicit hub/shaft/tower axis-lock metadata.
- Guardrail: no active Source Art image, Source Art index schema, Campaign save schema, gameplay settlement, Operation field-feed route, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm validate:art`, `pnpm smoke:fleet`, `pnpm smoke:art`, `pnpm build`, `pnpm smoke:operation:compact`.
- Source Art status remains `180/300`; Batch020 has been re-issued with R4 diversity rules.

## Previous clean status - 2026-07-18

- Version: `3.01.0-source-art-card-metadata`.
- Completed: Operation preview, Deployment preview, and Collection cards now expose stable Source Art metadata for character ID, P01 version, active file, visual QA status, and engineering QA status.
- Completed: `smoke:art` now verifies every active character card matches `public/assets/source-art/p01/index.json` metadata and keeps Batch019 representative screenshots for `CHR-OMI-246` and `CHR-GOV-028`.
- Guardrail: this is UI metadata and smoke coverage only; no art image file, Source Art index schema, Campaign save schema, gameplay formula, reward settlement, replay routing, or balance rule was changed.
- Source Art status is `180/300`; Batch019 is complete, and Batch020 is delegated as a background art-only task with the new diversity rules.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:art`, `pnpm build`, `pnpm validate`.

## Current clean status - 2026-07-18

- Version: `3.04.0-operation-scene-asset-telemetry`.
- Completed: Operation Phaser field-feed host now exposes stable scene asset telemetry for requested Scene ID, source Scene ID, asset URL, fallback URL, asset version, QA status, and integrated/fallback availability.
- Completed: `smoke:operation:compact` now verifies the central Operation field-feed resolves to `SCN003`, source `SCN003`, `/assets/environment/offshore-field-feed_ai_v004.png`, `v004`, `ENGINEERING_QA_PASSED`, and `INTEGRATED`.
- Guardrail: no Source Art file, Source Art index schema, Campaign save schema, gameplay settlement, scene route data, or balance rule was changed.
- Source Art status remains `180/300`; Batch020 R4 art-only subagent is running in the background.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`.

## Current clean status - 2026-07-18

- Version: `3.05.0-debrief-next-action-reason`.
- Completed: Debrief Campaign Continue now exposes stable recommendation metadata: `data-recommended-continue-action`, `data-current-mission-id`, `data-next-mission-id`, `data-available-mission-count`, and per-CTA `data-continue-reason`.
- Completed: the visible Debrief continue summary now explains why the next unlocked mission is recommended after settlement.
- Completed: `smoke:gameplay` verifies the `MSN-TUT-001` Debrief recommends `next-mission`, points to unlocked `MSN-TUT-002`, and preserves explicit next/return/replay reason metadata.
- Guardrail: no Campaign save schema, reward settlement, mission unlock formula, route selection logic, Source Art file, scene route data, or balance rule was changed.
- Source Art status remains `180/300`; Batch020 R4 art-only subagent is still running in the background.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`.

## Current clean status - 2026-07-18

- Version: `3.06.0-route-readiness-next-reason`.
- Completed: Route Readiness Carryover primary CTA now exposes `data-next-readiness-reason` and visible compact reason copy through `route-readiness-next-reason`.
- Completed: the reason follows the existing readiness state: pending Permit/PPE/Access explain planning confirmation; READY explains deploy uses the existing Campaign dispatch flow.
- Completed: `smoke:gameplay` verifies pending Permit reason, post-permit PPE reason, and READY deploy reason; `smoke:deployment:compact` verifies the added copy keeps Deployment in one 1366x768 viewport.
- Guardrail: no Campaign save schema, readiness formula, deployment guard, route selection logic, Source Art file, scene route data, or balance rule was changed.
- Source Art status remains `180/300`; Batch020 R4 art-only subagent is still running in the background.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:deployment:compact`, `pnpm build`.

## Current clean status - 2026-07-18

- Version: `3.07.0-operation-decision-reason-metadata`.
- Completed: Operation `NEXT DECISION` prompt now exposes stable decision telemetry: `data-decision-code`, `data-decision-action`, `data-decision-reason`, and `data-decision-meta`.
- Completed: compact Operation smoke and full gameplay smoke verify the decision code is one of ACT/DIAG/EVENT/RISK/ROUND, the action is rendered, and the visible reason matches `data-decision-reason`.
- Guardrail: no Operation settlement path, skill recommendation formula, diagnosis rule, round forecast, Campaign save schema, Source Art file, scene route data, or balance rule was changed.
- Source Art status remains `180/300`; Batch020 R4 art-only subagent is still running in the background.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## Current clean status - 2026-07-18

- Version: `3.11.0-source-art-batch020-r4-diverse-import`.
- Completed: generated and imported `BATCH-P01-020` as active P01 Source Art; active coverage is now `190/300`, with `110/300` pending.
- Completed: Batch020 applies R4 structured diversity profiles across 3 masculine, 2 androgynous, and 5 feminine-presenting adult offshore-wind professionals; each item varies face shape, body type, pose silhouette, expression, camera angle, and tool handling.
- Completed: Batch020 QA report and contact sheet were created; all 10 images are `1024×1536`, aspect `Pass`, `Visual Review Required`, and `Upscale Pending`.
- Guardrail: no gameplay logic, Reactive recommendation sort, branch resolution, mission runtime settlement, Campaign save schema, Source Art index schema, or balance rule was changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`.

## Previous clean status - 2026-07-18

- Version: `3.10.0-operation-branch-reactive-rec-reason`.
- Completed: Operation Branch Event `REC` Reactive CTA now exposes and displays why the recommended Reactive skill is selected.
- Completed: CTA metadata includes `data-recommended-reactive-reason`, `data-recommended-reactive-power`, and `data-recommended-reactive-energy-cost`; visible `branch-reactive-reason` matches the metadata.
- Completed: full gameplay smoke verifies stable branch recommendation IDs, reason metadata, branch loss mitigation, and `BranchGuard`; layout smoke verifies the added copy keeps the one-screen layout intact.
- Completed: background Source Art Batch020 finished during this increment; active P01 Source Art increased from `180/300` to `190/300`, leaving `110/300` pending.
- Guardrail: no Reactive recommendation sort, branch resolution, event penalty formula, mission runtime settlement, Campaign save schema, Source Art file, scene route data, or balance rule was changed.
- Source Art status is now `190/300`; Batch020 manifest status is `Generated` for all 10 items.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Current clean status - 2026-07-18

- Version: `3.09.0-operation-diagnosis-rec-reason`.
- Completed: Operation Diagnosis `REC` CTA now exposes `data-recommended-diagnosis-reason` and visible `diagnosis-rec-reason`.
- Completed: compact Operation smoke and full gameplay smoke verify stable recommended diagnosis ID, matching reason metadata/rendered reason, and existing evidence gain after clicking.
- Guardrail: no diagnosis scoring rule, evidence reward, mission runtime settlement, Campaign save schema, Source Art file, scene route data, or balance rule was changed.
- Source Art status remains `180/300`; Batch020 R4 art-only subagent is still running in the background.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## Current clean status - 2026-07-18

- Version: `3.08.0-operation-rec-skill-reason`.
- Completed: Operation `REC` recommended skill CTA now exposes and displays why the selected skill is recommended.
- Completed: CTA metadata includes `data-recommended-skill-reason`, `data-recommended-skill-power`, and `data-recommended-skill-stage-result`; the visible `recommended-skill-reason` matches the metadata.
- Completed: compact Operation smoke and full gameplay smoke verify reason metadata, numeric power, `clear/remains` stage result, and one-page Operation layout.
- Guardrail: no skill recommendation formula, skill settlement, Operation decision projection, Campaign save schema, Source Art file, scene route data, or balance rule was changed.
- Source Art status remains `180/300`; Batch020 R4 art-only subagent is still running in the background.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.
