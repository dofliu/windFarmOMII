# OWM Web MVP 需求稽核

稽核日期：2026-07-17  
規格依據：`OWM_MASTER_PROJECT_CHARTER_v1.0.docx`、`OWM_Data_Master_v1.0.xlsx`  
目前版本：`3.27.0-source-art-batch016-r6-active-import`

## Latest increment: Source Art Batch022 R7 Samples

Three representative `BATCH-P01-022` R7 Source Art QA samples have been generated before full-batch production/import: `CHR-GOV-031` masculine, `CHR-ACA-071` androgynous, and `CHR-GOV-032` feminine. The contact sheet and QA manifest live under `assets/source-art/qa/BATCH-P01-022-r7-samples/`. `CHR-GOV-032` v001 failed the P01 aspect contract at `864x1821`; it was superseded by a valid `1024x1536` v002 sample and retained only as QA evidence. The three current candidates are materially more varied across age, face architecture, body build, task pose, camera framing, and tool interaction than the repeated cute-heroine pattern, but remain `Sample Review Required`. Samples are not referenced by the public active Source Art index. Active Source Art remains `210/300`; no gameplay logic, Campaign save schema, reward settlement, score formula, Source Art public index, or balance rule changed.

Verification: sample dimension check, contact sheet render, `pnpm validate:art`, `pnpm build`.

## Previous increment: Source Art R7 Casting Variety

The remaining 90 pending P01 Source Art prompts now use `OWM-P01-R7-CASTING-VARIETY-ANTI-CLONE`. This increment addresses the user-visible art issue where most generated characters are attractive but still read as similar young female faces and poses with only PPE/background changes. R7 keeps the workforce mix gate at 4 masculine / 2 androgynous / max 4 feminine per 10-image batch, and strengthens visible variety gates to at least 9 pose silhouettes, 7 camera angles, 8 body types, and 5 non-glamour task poses. R7 negative prompts now explicitly block copied heroine faces, only outfit/background changes, glamour/beauty poses, soft idol face in masculine or androgynous slots, and repeated cute expressions. `BATCH-P01-022` is exported as the first R7 generation pack under `assets/source-art/qa/`. This changes pending prompt metadata, validation gates, and prompt-pack workflow only; active 210 Source Art images, public Source Art index entries, gameplay logic, Campaign save schema, reward settlement, score formula, Source Art public index schema, and balance rules were not changed.

Verification: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous increment: Source Art Batch016 R6 Active Import

`BATCH-P01-016` R6 samples have been imported as active web-preview Source Art using canonical `p01/*_v001.png` filenames. Active Source Art increased from `200/300` to `210/300`, and pending decreased from `100/300` to `90/300`. Batch016 remains `Visual Review Required`: all 10 images are `1024x1536`, pass P01 2:3 aspect, and remain production-upscale pending; no user visual approval was asserted. `qa-p01-batch.ps1` was corrected so batch-level QA status only reports `Web Preview Approved` when `-UserVisualApproval` is explicitly supplied. This is asset/index import and QA-script correction only; no gameplay logic, Campaign save schema, reward settlement, score formula, Source Art public index schema, or balance rule changed.

Verification: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous increment: Source Art R6 Batch016 Full Samples

The remaining 7 R6 Batch016 QA samples have been generated, completing a full 10-image Batch016 review set before active import. The full contact sheet and QA manifest live under `assets/source-art/qa/BATCH-P01-016-r6-samples/`. All 10 current candidate images are `1024x1536` and pass the P01 2:3 aspect check; the earlier `CHR-GOV-023` ultra-tall v001 remains retained only as failed QA evidence. The set covers masculine 4 / androgynous 2 / feminine 4 with 10 unique age impressions, face shapes, pose silhouettes, and camera angles. Samples are not referenced by the public active Source Art index. Active Source Art remains `200/300`; no gameplay logic, Campaign save schema, reward settlement, score formula, Source Art public index, or balance rule changed.

Verification: sample dimension check, contact sheet render, public index sample-reference check, `pnpm validate:art`, `pnpm build`.

## Previous increment: Source Art R6 Three-Sample Review

Three representative R6 Batch016 Source Art QA samples have been generated before full-batch production: `CHR-GOV-023` masculine, `CHR-DEV-108` androgynous, and `CHR-OMI-242` mature feminine. The first `CHR-GOV-023` output failed the P01 aspect contract at `864x1821`; it was superseded by a valid `1024x1536` v002 sample and retained only as QA evidence. The current sample contact sheet and QA manifest live under `assets/source-art/qa/BATCH-P01-016-r6-samples/`. All current candidate samples are `1024x1536`, remain `Sample Review Required`, and are not referenced by the public active Source Art index. Active Source Art remains `200/300`; no gameplay logic, Campaign save schema, reward settlement, score formula, Source Art public index, or balance rule changed.

Verification: sample dimension check, public index sample-reference check, `pnpm validate:art`.

## Previous increment: Source Art R6 Batch016 Prompt Pack

`BATCH-P01-016` now has a pre-generation R6 review pack before any new image generation: JSON prompt pack, Markdown prompt pack, and HTML casting-plan sheet. Batch016 exposes masculine 4 / androgynous 2 / feminine 4, with 10 unique age impressions, 10 face shapes, 10 pose silhouettes, and 10 camera angles. The R6 workflow also now includes reusable `art:r6-sanitize` and `art:r6-pack` scripts, and `validate:art` fails feminine R6 profiles that still contain contradictory beard, moustache, or sideburn cues. Active Source Art remains unchanged at `200/300`; no public Source Art index, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule changed.

Verification: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous increment: Source Art R6 Workforce Diversity

Pending/future P01 Source Art prompts now use `OWM-P01-R6-WORKFORCE-DIVERSITY-ANTI-WAIFU`. The remaining 100 pending prompts and batch manifests were rebuilt to prevent repeated cute-heroine / waifu / idol-face collapse: every current 10-image pending batch now requires at least 4 masculine/adult-man or clearly masculine adult professionals, at least 2 androgynous adult professionals, no more than 4 feminine adult professionals, at least 8 age impressions, and at least 3 mature-adult impressions. `validate:art` now checks R6 casting locks, anti-waifu negative prompts, age diversity, mature-adult coverage, and structured profile alignment. Generated active Source Art remains unchanged at `200/300`; this does not change gameplay logic, Campaign save schema, reward settlement, score formula, Source Art index schema, or balance rules.

Verification: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous increment: Source Art Safe-Frame Rendering

Source Art surfaces now preserve full-body P01 artwork instead of cropping it: Deployment, Operation, and Collection use `object-fit: contain`, centered positioning, and safe insets. Gameplay smoke verifies the computed fit, active file path, successful decode, natural 2:3 aspect, rendered size, and containment inside the Source Art frame.

Verification: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous increment: Source Art Runtime Surface Consistency

Gameplay smoke now verifies that Deployment, Operation, and Collection all read Source Art from the same active public index. The check compares `data-source-art-*` metadata, active file path, successful decode, rendered size, and natural 2:3 image aspect. Batch021 is directly covered through `CHR-MAR-204` in Collection.

Verification: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous increment: Source Art Batch021 R5 Full Import

Batch021 R5 single-identity source-art generation is now complete and active in the web-preview index. Active Source Art is now `200/300`; pending Source Art is now `100/300`; Batch021 is 10 generated / 0 pending. QA remains `Visual Review Required` until manual approval, but the contact sheet shows materially stronger variation across age, face structure, body type, camera angle, task pose, and tool handling.

Verification: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous increment: Source Art Batch021 R5 Partial Import

The first two Batch021 R5 single-identity source-art images are now active web-preview assets (`CHR-MAR-204`, `CHR-OMI-249`). Active Source Art is now `192/300`, with Batch021 at 2 generated / 8 pending. Partial QA artifacts were added so the visual direction can be reviewed before expanding the remaining Batch021 images.

Verification: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous increment: Source Art R5 Single-Identity Prompts

Pending R5 Source Art prompts now provide one clear character identity per image instead of stacking multiple conflicting diversity profiles. This directly addresses the clone-like cute-heroine drift by keeping the diversity profile unambiguous for the image model while preserving the active 190 generated images.

Verification: `pnpm validate:art`, `pnpm build`.

## Previous increment: Collection + Debrief Tabs A11y

Collection and Debrief information surfaces now use explicit tab semantics and keyboard navigation. This extends the one-page / tabbed-information requirement beyond Deployment and Operation, while preserving save schema, scoring, reward settlement, and Source Art state.

Verification: `pnpm typecheck`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous increment: Operation GUIDE Notice Pulse

Operation GUIDE now gives the player a visible compact confirmation after click while retaining target focus/highlight. The decision prompt exports active guide metadata for QA, and compact Operation smoke verifies the notice, metadata, target highlight, and no-overflow layout.

Verification: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous increment: Operation Team Skill REC

Operation `NEXT DECISION: ACT` now recommends the best usable active skill across all deployed crew members instead of only the currently selected card. The CTA exposes stable actor/character/skill metadata and click-through settlement selects the recommended actor before using the existing `resolveTeamSkill` path.

Verification: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous increment: Operation Decision GUIDE CTA

Operation `NEXT DECISION` prompt now exposes a session-only GUIDE CTA. The CTA exports stable guide metadata and focuses/highlights the current actionable target without changing settlement behavior: Branch Reactive or Accept during EVENT, Diagnosis REC during DIAG, Skill REC during ACT, and End Round during RISK/ROUND.

Verification: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous increment: Deployment Tabs A11y + Keyboard

Deployment primary tabs now expose real `tablist` / `tab` / `tabpanel` semantics and keyboard navigation. `smoke:layout` verifies ARIA wiring and ArrowLeft / ArrowRight switching before re-running the existing one-screen layout coverage. This supports the one-page UI requirement by making tabbed information surfaces explicit and testable.

Source Art `BATCH-P01-021` has been delegated to a background R5 art-only task after interrupting the stale R4 task.

Verification: `pnpm typecheck`, `pnpm smoke:layout`, `pnpm build`.

## Previous increment: Source Art R5 Anti-Clone Diversity

Pending/future P01 Source Art prompts now use `OWM-P01-R5-ANTI-CLONE-DIVERSITY-ENGINEERING`. R5 fixes the repeated slot-profile weakness in R4 by rebuilding all 110 pending prompts and batch manifests with unique anti-clone diversity signatures. The stricter validation gate now rejects duplicate pending signatures and requires stronger per-batch variety across pose, camera angle, hairstyle, expression, face shape, and body type.

Generated R3/R4 artwork remains legacy-valid. Active Source Art remains `190/300`, with `110/300` pending.

Verification: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous increment: Source Art Batch020 R4 Diverse Import

Source Art `BATCH-P01-020` has been generated and imported as active P01 web-preview assets. Active Source Art is now `190/300`, with `110/300` pending. The batch follows the structured R4 diversity profile gate: 3 masculine, 2 androgynous, and 5 feminine-presenting adult offshore-wind professionals with varied face shapes, body types, pose silhouettes, expressions, camera angles, and tool handling.

Verification: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`.

## Previous increment: Operation Branch Reactive REC Reason

Operation Branch Event `REC` Reactive CTA now exposes and displays why the recommended Reactive skill is selected. The CTA adds `data-recommended-reactive-reason`, `data-recommended-reactive-power`, `data-recommended-reactive-energy-cost`, and visible `branch-reactive-reason`. Gameplay smoke verifies the recommendation still mitigates branch loss and applies `BranchGuard`; layout smoke verifies the added copy stays within the one-screen layout.

Background Source Art Batch020 also completed during this increment, increasing active P01 Source Art from `180/300` to `190/300`; `validate:art` and `smoke:art` passed for the updated index.

Verification: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Latest increment: Operation Diagnosis REC Reason

Operation Diagnosis `REC` CTA now exposes and displays why the recommended answer is selected. The CTA adds `data-recommended-diagnosis-reason` and visible `diagnosis-rec-reason`; compact Operation smoke and full gameplay smoke verify the reason metadata matches the rendered reason and the CTA still executes the existing evidence gain path.

Verification: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## Latest increment: Operation REC Skill Reason

Operation `REC` recommended skill CTA now exposes and displays why the selected skill is recommended. The CTA adds `data-recommended-skill-reason`, `data-recommended-skill-power`, and `data-recommended-skill-stage-result`, derived from the existing `resolveTeamSkill` forecast. Compact Operation smoke and full gameplay smoke verify the metadata matches the visible reason and remains within the one-page Operation layout.

Verification: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## Latest increment: Operation Decision Reason Metadata

Operation `NEXT DECISION` prompt now exposes stable decision telemetry for ACT/DIAG/EVENT/RISK/ROUND states: `data-decision-code`, `data-decision-action`, `data-decision-reason`, and `data-decision-meta`. Compact Operation smoke and full gameplay smoke verify the metadata matches the rendered action and reason.

Verification: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## Latest increment: Route Readiness Next Reason

Route Readiness Carryover primary CTA now exposes and displays the reason behind the next recommended readiness action. The CTA adds `data-next-readiness-reason` and visible compact copy; gameplay smoke verifies pending Permit reason, post-permit PPE reason, and READY deploy reason, while compact deployment smoke confirms the added copy stays within the one-page 1366x768 layout.

Verification: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:deployment:compact`, `pnpm build`.

## Latest increment: Debrief Next Action Reason

Debrief Campaign Continue now exposes a visible recommendation reason and stable continuation metadata: `data-recommended-continue-action`, current mission ID, next mission ID, available mission count, and per-CTA `data-continue-reason`. Gameplay smoke verifies the settled `MSN-TUT-001` Debrief recommends unlocked `MSN-TUT-002`, while Return Route and Replay preserve explicit reason metadata.

Verification: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`.

## Latest increment: Operation Scene Asset Telemetry

Operation Phaser field-feed now exposes stable runtime telemetry on `.phaser-host`: requested Scene ID, source Scene ID, asset URL, fallback URL, asset version, QA status, and route availability. `smoke:operation:compact` now verifies the central Operation field-feed resolves to the expected `SCN003` integrated `offshore-field-feed_ai_v004.png` asset with `ENGINEERING_QA_PASSED`, while retaining the existing rotor axis-lock and one-screen layout checks.

Verification: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm build`.

## Latest increment: Source Art Structured Diversity Profile Gate

All 120 pending P01 Source Art items now include structured `diversityProfile` metadata in the master manifest and pending batch manifests. `validate:art` now gates every pending 10-character batch for 3 masculine, 2 androgynous, no more than 5 feminine, at least five unique pose silhouettes, at least five face shapes, and at least five body types. Generated R3 art remains unchanged.

Verification: `pnpm validate:art`, `pnpm typecheck`, `pnpm build`.

## Latest increment: Source Art Diversity Guardrails + Fleet Turbine Icon V002

Pending and future P01 Source Art prompts now use `OWM-P01-R4-DIVERSITY-ENGINEERING`; the 180 generated R3 images remain unchanged. The 120 pending prompts require visible variation across gender presentation, face shape, skin tone, hairstyle, age impression, body type, pose, expression, camera angle, and tool handling. Pending negative prompts no longer block `male character`.

Fleet Board turbine SVG icons now use `offshore-svg-v002`, adding monopile foundation, sea line, access rail, tower/nacelle highlights, and explicit hub/shaft/tower axis-lock metadata.

Verification: `pnpm typecheck`, `pnpm validate:art`, `pnpm smoke:fleet`, `pnpm smoke:art`, `pnpm build`.

## 本輪完成：Source Art Card Metadata

本輪讓 Operation preview、Deployment preview 與 Collection card 都輸出穩定 Source Art metadata，包含 active character ID、P01 version、active file、visual QA status 與 engineering QA status。`smoke:art` 會逐一比對 180 張 active card 與 `public/assets/source-art/p01/index.json`，避免 UI 載到舊圖或 metadata 不一致。這不改 art image files、Source Art index schema、Campaign save schema、gameplay formula、reward settlement、replay routing 或 balance rule。

驗證項目：
1. [x] 三個 runtime card surface 都輸出相同 Source Art metadata 欄位。
2. [x] Collection cards 逐張比對 active file / version / QA metadata。
3. [x] Batch019 代表角色納入 smoke screenshot anchors。
4. [x] 不改圖片檔、索引 schema、存檔 schema 或玩法結算。

## 本輪完成：Campaign Completion Summary Metadata

本輪讓 Campaign Completion Summary 輸出穩定 metadata，涵蓋 completion state、mission/chapter totals、average best score、scored mission count、campaign grade、S-grade count 與 mastered crew count。Gameplay smoke 使用合法全通關 fixture 驗證 `15/15` missions、`5/5` chapters、average best score `80`、grade `A`、`3` S grades、`1` L5 crew 都可由 metadata 讀取。這不改 Campaign save schema、mission completion rule、score formula、reward settlement、replay routing 或 balance rule。

驗證項目：
1. [x] Completion panel metadata 標記 complete=true。
2. [x] Mission/chapter totals 與 scored mission count 可由 metadata 驗證。
3. [x] Average best score、campaign grade、S grade count、L5 crew count 可由 metadata 驗證。
4. [x] 不新增 save 欄位、不改 score/reward/replay/balance。

## 本輪完成：Debrief Secondary CTA Metadata

本輪讓 Debrief Campaign Continue 的三個 post-settlement CTA 都輸出穩定 metadata。`continue-next-mission` 既有 `data-recommended-mission-id` 外，新增 `data-continue-action="next-mission"` 與 `data-current-mission-id`；`continue-return-route` 新增 `data-continue-action="return-route"` 與 current mission metadata；`continue-replay-mission` 新增 `data-continue-action="replay-mission"`、`data-replay-mission-id` 與 current mission metadata。Gameplay smoke 會在 `MSN-TUT-001` 結算後、前往 `MSN-TUT-002` 前驗證三個 CTA metadata。這不改 Campaign save schema、reward settlement、mission unlock formula、route selection logic 或 balance rule。

驗證項目：
1. [x] Next mission CTA 保留 recommended mission ID 並輸出 action/current mission metadata。
2. [x] Return route CTA 輸出 return-route action 與 current mission metadata。
3. [x] Replay mission CTA 輸出 replay-mission action 與 replay mission ID。
4. [x] 不新增 save 欄位、不改 reward 或 mission unlock。

## 本輪完成：Operation Return Notice Metadata

本輪讓 Operation abort/return notice 輸出穩定 metadata：`data-return-mission-id`、`data-return-reason`、`data-return-selected`、`data-return-can-redeploy`。Route shortcut 也輸出 `data-return-action`、`data-target-mission-id`、`data-target-selected`。Gameplay smoke 會在 desktop abort flow 驗證 notice 指向 `MSN-TUT-002`，並在獨立 mobile touch flow 驗證 notice 指向 `MSN-TUT-001`；兩者 reason 都是 `abort`、目前 mission 已選取、且沒有 direct redeploy path。這不改 Campaign save schema、abort behavior、mission settlement、reward formula 或 deployment route。

驗證項目：
1. [x] Desktop abort notice 輸出 mission/reason/selected/canRedeploy metadata。
2. [x] Route shortcut 輸出 action/target metadata。
3. [x] Mobile abort notice 輸出同一組 metadata，並指向 mobile flow 的 `MSN-TUT-001`。
4. [x] 不新增 save 欄位、不改 abort 或 settlement。

## 本輪完成：Route Readiness Next Gap Metadata

本輪讓 Route Readiness Carryover 的主要 CTA 輸出穩定 next-gap metadata：`data-next-readiness-gap`、`data-next-readiness-action`、`data-next-readiness-tab`。Gameplay smoke 驗證第一個缺口是 `permit / confirm-permit / readiness`，確認後推進到 `ppe / confirm-ppe`，全部整備完成後變成 `READY / deploy / operation`。這不改 Campaign save schema、readiness formula、deployment guard、route selection logic 或 balance rule。

驗證項目：
1. [x] CTA 在 pending 狀態輸出目前下一個缺口。
2. [x] CTA metadata 會隨 shortcut settlement 推進。
3. [x] CTA 在 ready 狀態輸出 deploy metadata。
4. [x] 不新增 save 欄位、不改 readiness 或 deployment guard。

## 本輪完成：Debrief Next Mission REC

本輪將 Debrief REVIEW 的 `continue-next-mission` 標記為推薦 continuation action。當下一個 Campaign mission 存在時，CTA 會輸出 `data-recommended-mission-id`，gameplay smoke 會先驗證該 ID 再點擊 route。這不改 Campaign save schema、reward settlement、mission unlock formula 或 route selection logic。

驗證項目：
1. [x] Debrief next mission CTA 有 recommended styling。
2. [x] CTA 輸出穩定 `data-recommended-mission-id`。
3. [x] `smoke:gameplay` 驗證推薦 ID 為 `MSN-TUT-002` 後才點擊。
4. [x] 不新增 save 欄位、不改 reward 或 mission unlock。

## 本輪完成：Round Decision REC Settlement Gate

本輪將 `round-decision-cta` 從 confirmation-only 驗證提升為 click-through settlement 驗證。Compact smoke 在需要 confirmation 時會第二次點擊 CTA，並要求 Operation log 增加，以及 round / branch event / debrief 狀態發生推進。另補 1366×768 compact Branch Event layout，避免回合觸發事件後 field feed 被壓到不可玩高度。這不改 End Round formula、branch trigger rule、mission settlement、Campaign save schema 或 balance rule。

驗證項目：
1. [x] `round-decision-cta` 可完成二段式 End Round commit。
2. [x] Smoke 驗證 CTA path 後 Operation log 增加。
3. [x] Smoke 驗證 round/event/debrief 狀態有推進。
4. [x] 1366×768 Branch Event opened state 不造成 document overflow，且 field feed 保持可玩高度。
5. [x] 不新增 runtime formula、save 欄位或 balance 規則。

## 本輪完成：Round Decision REC CTA

本輪把 `NEXT DECISION: ROUND/RISK` 的下一步提示補強為可直接執行的 End Round CTA。`round-decision-cta` 呼叫既有 `requestNextRound()`，並保留 branch / failure / low-margin forecast 下既有的二段式 confirmation。這不改 End Round formula、branch trigger rule、mission settlement、Campaign save schema 或 balance rule。

驗證項目：
1. [x] ROUND/RISK 狀態顯示 `round-decision-cta`。
2. [x] CTA 輸出 `data-round-confirmation-required` 與 `data-round-confirming`，供 browser smoke 驗證。
3. [x] `smoke:operation:compact` 會把 session 推進到 ROUND/RISK，點擊 CTA，並確認進入 End Round confirmation。
4. [x] 不新增 runtime formula、save 欄位或 balance 規則。

## 本輪完成：Diagnosis REC CTA

本輪把 Diagnosis Gate 的下一步提示補強為可直接執行的訓練推薦 CTA。當 mission definition 有 correct diagnosis option 時，`DiagnosisPanel` 會顯示 `diagnosis-rec-cta`，輸出 `data-recommended-diagnosis-id`，並呼叫既有 `chooseDiagnosis(optionId)`。這不改 diagnosis scoring、mission settlement、Campaign save schema 或 balance rule。

驗證項目：
1. [x] Diagnosis Gate panel 顯示 `diagnosis-rec-cta`。
2. [x] CTA 帶有穩定 diagnosis option ID，供 browser smoke 驗證。
3. [x] `smoke:gameplay` 實際點擊 CTA，確認 Campaign diagnosis stage 會增加 evidence。
4. [x] 不新增 runtime formula、save 欄位或 balance 規則。

## 本輪完成：Branch Reactive REC CTA

本輪把 Branch Event 的下一步提示從「只列出 Reactive options」補強為可直接執行的 `REC` CTA。當 pending branch event 至少有一個可用 Reactive skill 時，`BranchEventPanel` 會從既有 `reactiveOptions` 派生一個推薦動作，輸出 `data-recommended-character-id` / `data-recommended-skill-id`，並呼叫既有 `resolveBranch(actorIndex, skillId)`。這不改 branch penalty、Reactive settlement、Campaign save schema 或 balance rule。

驗證項目：
1. [x] Branch Event panel 只在有可用 Reactive skill 時顯示 `branch-reactive-cta`。
2. [x] CTA 帶有穩定角色與技能 ID，供 browser smoke 驗證。
3. [x] `smoke:gameplay` 實際點擊 CTA，確認第一個 Campaign branch event 仍被 Reactive mitigation 正常結算。
4. [x] 不新增 runtime formula、save 欄位或 balance 規則。

## 本輪完成：Operation REC CTA Settlement Gate

本輪將 `REC` CTA 從 presence-only 驗證提升為 click-through 驗證。Smoke 會點擊推薦技能 CTA，並檢查 AP -1、Energy 依 CTA 顯示成本下降，以及 stage 改變或 progress 增加；compact Operation smoke 另確認 Operation log 增加一筆。此驗證直接覆蓋既有 `useSelectedSkill(recommendedSkill)` → `resolveTeamSkill` flow，不新增公式、不改 settlement/save/balance。

驗收狀態：
1. [x] Operation summary stage / progress 有穩定 test hook。
2. [x] Active runtime AP / Energy 有穩定 test hook。
3. [x] `smoke:operation:compact` 點擊 `recommended-skill-cta` 並驗證 AP、Energy、stage/progress、log。
4. [x] `smoke:gameplay` 點擊 desktop ACT CTA 並驗證 AP、Energy、stage/progress。
5. [x] 不改 runtime formula、mission settlement function、Campaign save schema 或 balance rule。

## 本輪完成：Operation Recommended Skill CTA

本輪把 `NEXT DECISION: ACT` 從文字提示推進成可直接操作的 UI。當目前 selected crew 有可用主動技能時，右側角色欄會顯示 `REC` CTA，列出推薦技能、預估 power、AP/Energy cost 與 stage result；點擊後呼叫同一個 `useSelectedSkill(recommendedSkill)` flow。這只增加 derived UI guidance，不改 mission runtime、settlement、Campaign save schema 或 balance formula。

驗收狀態：
1. [x] ACT 狀態顯示 `recommended-skill-cta`。
2. [x] CTA 具有 `data-recommended-skill-id`，可由 smoke test 驗證。
3. [x] CTA 顯示 applied power、AP -1、Energy cost 與 Stage clear/remains。
4. [x] 1366×768 compact Operation smoke 驗證 ACT 只有一顆推薦 CTA。
5. [x] Gameplay smoke 驗證 desktop ACT flow 仍完整。
6. [x] 不改 mission runtime、settlement、save schema 或 balance。

## 本輪完成：Operation Field-feed v004

本輪將 Operation 中央視窗升級為 `offshore-field-feed_ai_v004.png`。v004 使用濕甲板 SOV / 海況 2–3 / 灰藍霧化日光 / 清楚三葉片 offshore wind turbine 的 field camera 視角，並保存負面提示詞，明確排除四葉、彎曲葉片、離軸 rotor、錯誤 foundation、人物、文字、logo、watermark 與 fantasy machinery。Fallback、SCN002、SCN003 已改指向 V004；2.88 的 turbine axis lock 仍保留。

驗收狀態：
1. [x] `offshore-field-feed_ai_v004.png` 已存在於 `public/assets/environment/`。
2. [x] `offshore-field-feed_ai_v004.prompt.md` 已保存 prompt 與 negative guardrails。
3. [x] `sceneAssets.json` fallback 指向 V004。
4. [x] `sceneAssets.json` SCN002 / SCN003 指向 V004。
5. [x] `public/data/sceneAssets.json` 已同步。
6. [x] 1366×768 compact Operation smoke 通過，中央 field-feed 不破壞單頁。
7. [x] 1440×900 layout smoke 通過，Operation summary 顯示 V004。
8. [x] Gameplay smoke 通過，desktop/mobile flow 保持可玩。

## 結論

目前版本已是可操作、可結算、可保存進度的單機 Web MVP。Charter 定義的五種模式中，教學任務、風場戰役、Boss 挑戰與沙盒模擬已有可玩流程；合作任務需要多人同步、帳號與後端，因此明確列為 Web MVP 外。

尚未達到的是 production asset completion，而不是核心遊戲無法運作：300 名角色 P01、150 個場景、Boss／Equipment 原畫及 production resolution 仍需分批完成。

## 本輪完成：Turbine Axis Lock v1

本輪針對「風機圖示不能離軸旋轉、不能看起來像不合理葉片數」補強 Fleet Board SVG icon 與 Operation field-feed rotor telemetry。Fleet Board 的 rotor animation origin 現在直接使用 hub 座標，該 hub 同時也是 shaft start、tower center 與 nacelle axis 的基準；Operation field-feed 也輸出 hub lock、`0/120/240` 三葉片角度與 transform origin，並把容易被誤讀成額外葉片的垂直參考線改成固定 bearing ring。

驗收項目：

1. [x] Fleet Board 每座 turbine icon 仍固定 3 個 rotor blade polygon。
2. [x] SVG rotor animation origin 等於 hub 座標，並標記 `hub-shaft-tower` axis lock。
3. [x] Operation field-feed telemetry 顯示 `hubLocked=true`、`bladeAngles=0,120,240` 與 hub transform origin。
4. [x] 1366×768 compact Operation smoke 維持一頁式 no-overflow gate。
5. [x] 沒有修改 mission runtime、settlement、save schema 或 balance formula。

## 上一輪完成：Operation Info Heading v1

本輪修正 active Operation 下方資訊 panel 的可讀性。先前玩家切到 `SUMMARY` 或 `OBJECTIVES` 時，panel 標題仍固定顯示 `OPERATION LOG`，容易讓人誤判 tab 沒有切換；現在 heading 會隨 info tab 顯示 `OPERATION LOG`、`OPERATION SUMMARY` 或 `OPERATION OBJECTIVES`。

驗收項目：

1. [x] 切到 `LOG` 時 heading 顯示 `OPERATION LOG`。
2. [x] 切到 `SUMMARY` 時 heading 顯示 `OPERATION SUMMARY`。
3. [x] 切到 `OBJECTIVES` 時 heading 顯示 `OPERATION OBJECTIVES`。
4. [x] 1366×768 compact Operation smoke 驗證 heading 與內容同步。
5. [x] 沒有修改 mission runtime、settlement、save schema 或 balance formula。

## 上一輪完成：Operation Field-feed v003

本輪新增並接入 `offshore-field-feed_ai_v003.png`，用於 Operation 中央視窗。v003 以 SOV 濕甲板、海況 2–3、霧化灰藍日光、遠近三葉片風機與實際 offshore O&M field camera 為基準；fallback、SCN002、SCN003 已從 V002 升到 V003。prompt 與 negative guardrails 已保存，明確排除四葉風機、彎曲葉片、離軸 rotor、文字、logo、人物與 fantasy machinery。

驗證項目：
1. [x] `offshore-field-feed_ai_v003.png` 已存在於 `public/assets/environment/`。
2. [x] `offshore-field-feed_ai_v003.prompt.md` 已保存 prompt 與 negative guardrails。
3. [x] `sceneAssets.json` fallback 指向 V003。
4. [x] `sceneAssets.json` SCN002 指向 V003。
5. [x] `sceneAssets.json` SCN003 指向 V003。
6. [x] `public/data/sceneAssets.json` 已同步。
7. [x] 1440×900 Operation layout smoke 通過，中央 field-feed 不破壞單頁。
8. [x] 1366×768 compact Operation smoke 通過，field-feed 高度仍可用。
9. [x] Scene routing smoke 通過，Campaign scene integrated route 與 Sandbox fallback provenance 保持正常。

## 本輪完成：Campaign Route Sub-tabs v1

本輪針對「畫面盡量一頁可見、資訊用 tab 切換」先處理 Campaign Deployment Route。Route 不再把 Wind Farm Operations Board、15 個 mission nodes、任務簡報與 readiness/event deck 全部垂直堆疊；改為 `FLEET / MISSIONS / BRIEFING` 三個內部分頁。`MISSIONS` 保留完整 5 章 15 個 mission nodes，點選任務後直接進入 `BRIEFING`，讓下一步出勤條件與 event deck 在同一個 compact panel 內完成。

驗收項目：

1. [x] Campaign Route 顯示 `FLEET / MISSIONS / BRIEFING` 三個 sub-tab。
2. [x] `FLEET` 聚焦風場與 Fleet Board history，不再同時堆疊任務地圖與簡報。
3. [x] `MISSIONS` 顯示 5 章共 15 個 mission nodes。
4. [x] 點選 mission node 後進入 `BRIEFING`。
5. [x] `BRIEFING` 顯示 selected mission、Route Readiness Carryover 與 Mission Event Deck。
6. [x] Route sub-tab state 不會在切換 Deployment tab 時被非同步重設覆蓋。
7. [x] 1366×768 compact smoke 驗證 Route 三個 sub-tab 無 document overflow。
8. [x] Gameplay smoke 已對齊新 UX，包含 abort return notice、reload progress 與 completion summary。

## 上一輪完成：Fleet Turbine Icon Rigging v2

本輪針對 Route / Fleet Board 的風機圖示再補強。風機 SVG 不再在 React component 內以零散 magic number 手刻，而是改由 `fleetTurbineIconGeometry` 提供 hub、shaft、tower、nacelle、platform 座標。六張風機卡的圖示放大並補強 nacelle / tower / platform / hub / rotor 對比；smoke gate 也從「有 metadata」提升為「實際 SVG 座標同軸且實際渲染 3 個 blade polygon」。

驗證項目：
1. [x] Route 六張風機卡仍顯示 6 個 turbine SVG icon。
2. [x] 每個 icon 實際渲染恰好 3 個 `.fleet-turbine-rotor polygon`。
3. [x] 每個 icon 的 shaft start 座標等於 hub 座標。
4. [x] 每個 icon 的 shaft y 等於 hub y，shaft end x 位於 hub 右側。
5. [x] 每個 icon 的 tower center x 等於 hub x。
6. [x] 每個 icon 的 nacelle axis y 等於 hub y。
7. [x] 1440×900 Fleet Board 仍維持單頁可視。
8. [x] 768px Fleet Board 不產生水平 overflow。

## 本輪完成：Round Commit Confirmation v1

本輪在 Operation `End Round` 新增高風險二次確認。若下一次回合結算會觸發 branch event、forecast failure，或讓 weather / safety 掉到低 margin，第一次點擊只顯示 session-only commit warning；第二次點擊才真正提交回合。安全回合維持單次點擊。這個 gate 不改 `previewEndRound` / `endRound` 公式、不寫入 save schema，也不提前結算。

驗證項目：
1. [x] 桌面 `next-round` 高風險回合會先顯示 `round-commit-confirmation`。
2. [x] 手機 `mobile-next-round` 高風險回合會先顯示 `mobile-round-commit-copy`。
3. [x] 第二次確認才觸發 branch event / end-round settlement。
4. [x] Abort / Return Route 會清除 End Round confirmation，避免確認 UI 疊加。
5. [x] 1440x900 layout smoke 通過，維持單頁。
6. [x] 1366x768 compact smoke 通過，Operation panel 不 overflow。
7. [x] 768px mobile gameplay smoke 通過，action dock 不被 onboarding guide 擋住。

## 本輪完成：Skill Forecast v1

本輪在 Operation `OBJECTIVES` tab 新增 `SKILL FORECAST`。玩家可以在使用技能前看到目前選中技師的推薦技能、預期 applied power、是否會清掉 stage，以及 AP / Energy / Fatigue 成本。Forecast 直接使用既有 `resolveTeamSkill` pure resolver，不在 UI 建第二套公式，也不寫入存檔或提前結算任務。

驗證項目：
1. [x] Operation OBJECTIVES 顯示 `SKILL FORECAST`。
2. [x] Forecast 顯示技能 power 預估。
3. [x] Forecast 顯示 `AP -1 / E -x / Fatigue ±x` 成本。
4. [x] 1440x900 layout smoke 通過，OBJECTIVES 不破壞單頁。
5. [x] 1366x768 compact smoke 通過，OBJECTIVES panel 不 overflow。
6. [x] 768px mobile gameplay smoke 通過，forecast 不造成水平 overflow。

## 本輪完成：End Round Forecast v1

本輪新增 `previewEndRound` domain forecast，讓玩家在按 End Round 前可於 Operation `OBJECTIVES` tab 看到疲勞、安全、天候的預期變化，以及下一回合、branch trigger 或 failure risk。Forecast 與正式 `endRound` 共用公式，不新增存檔欄位，也不提前執行 settlement。

驗證項目：
1. [x] `previewEndRound` 與 `endRound` 的 fatigue / safety / weather / failure 數值一致。
2. [x] Operation OBJECTIVES 顯示 `END ROUND FORECAST`。
3. [x] Forecast 顯示 `F +x / S -x / W -x`。
4. [x] 1440x900 layout smoke 通過，OBJECTIVES 不破壞單頁。
5. [x] 1366x768 compact smoke 通過，OBJECTIVES panel 不 overflow。
6. [x] 768px mobile gameplay smoke 通過，forecast 不造成水平 overflow。

## 本輪完成：Operation Objectives Tab v1

本輪把 active Operation 的資訊區從 `LOG / SUMMARY` 擴充為 `LOG / SUMMARY / OBJECTIVES`。OBJECTIVES 顯示 Stage target、Learning objective、Diagnosis gate、Branch event 與 Risk floor，全部由目前 runtime state 與 mission definition 派生；不新增 save 欄位，不改 mission settlement。

驗證項目：
1. [x] Desktop Operation 顯示 OBJECTIVES tab。
2. [x] OBJECTIVES tab 具備 `aria-controls` 與 `role="tabpanel"`。
3. [x] OBJECTIVES 顯示 Stage target、Learning objective、Diagnosis gate、Branch event、Risk floor。
4. [x] 1440x900 layout smoke 通過，Operation 仍維持單頁。
5. [x] 1366x768 compact Operation smoke 通過，OBJECTIVES 不造成 document / panel overflow。
6. [x] 768px mobile gameplay smoke 通過，OBJECTIVES 不造成水平 overflow。

## 本輪完成：Operation Decision Prompt v1

本輪針對「遊戲本身運作邏輯可讀性」補上 active Operation 的下一步提示。`NEXT DECISION` 不新增頁面、不改結算，只根據當前 runtime state 派生玩家下一步：分支事件、診斷 gate、低天候/安全、可用主動技能，或回合結束/換人。

驗證範圍：
1. [x] Active Operation 顯示 `NEXT DECISION` prompt。
2. [x] Prompt 至少顯示 `ACT / DIAG / EVENT / RISK / ROUND` 其中一種狀態碼。
3. [x] Prompt 只讀 runtime state，不新增 save schema。
4. [x] 1440×900 layout smoke 通過，Operation 單頁仍可視。
5. [x] 1366×768 compact Operation smoke 通過，event panel 無 internal overflow。

## 本輪完成：Sandbox Scene Feed Coverage v1

本輪把 Sandbox direct field-feed 從 19/150 擴充到 29/150。新增 SCN007–SCN016，涵蓋 monopile turbine foundation、jacket turbine foundation 與 floating wind turbine。SCN006 刻意保留 fallback，作為 regression fixture，確保 fallback provenance 不會被誤標為專屬場景圖。

驗證範圍：
1. [x] `sceneAssets.json` direct item 數量為 29。
2. [x] `public/data/sceneAssets.json` 同步後 direct item 數量為 29。
3. [x] SCN007–SCN016 圖片檔均存在於 `public/assets/environment/`。
4. [x] Scene smoke 驗證 Sandbox coverage 為 `29/150 INTEGRATED` 與 `121 FALLBACK`。
5. [x] Scene smoke 實際部署 SCN011，Phaser operation route 顯示 `SCN011 · INTEGRATED`，且 1440 單頁與 768px 無水平 overflow 通過。

## 本輪完成：Fleet Board Turbine Icon v1

本輪補強 Route 內 Wind Farm Operations Board 的風機卡視覺。六張風機卡現在不再只靠文字與 availability symbol，而是顯示共用三葉片 SVG icon；每個 icon 都包含 tower、nacelle、shaft、hub 與 3 片 120° rotor blade，並重用既有 `turbineGeometry.ts`，避免 Route UI 產生另一套不一致的風機畫法。

驗證範圍：
1. [x] Fleet Board 顯示 6 張風機卡與 6 個 turbine SVG icon。
2. [x] 每個 icon 都標記 `data-blade-count=3`。
3. [x] 每個 icon 都標記 `data-shaft-locked=true`、`data-nacelle=true`、`data-tower=true`。
4. [x] 1440×900 Fleet Board 仍維持單頁可視。
5. [x] 768px Fleet maintenance smoke 無水平 overflow。

## 本輪完成：Sandbox Scene Availability Filter v1

本輪針對「同一頁看到所有內容、資訊用 tab 切換」補強 Sandbox Route。Scene selector 不再只是一個 150 筆長清單，而是先顯示 `ALL / INTEGRATED / FALLBACK` tab 與 coverage summary；玩家能直接分辨哪些 Scene 有專屬 field-feed，哪些目前仍是 fallback。

驗證範圍：
1. [x] Sandbox Route 顯示 `29/150 INTEGRATED` 與 `121 FALLBACK`。
2. [x] Integrated filter 僅顯示 29 個 direct Scene。
3. [x] Fallback filter 顯示目前選取的 `CURRENT` Scene 加 121 個 fallback route，且不自動改變已選 Scene。
4. [x] 1440×900 Sandbox Route 維持單頁可視。
5. [x] 768px Scene Route smoke 無水平 overflow。

## 本輪完成：Operation Summary Scene Route v1

本輪把 Scene routing 的關鍵資訊搬進 Operation `SUMMARY` tab。玩家不用只看 field-feed 頂端狀態列，也能在同一個資訊 tab 看到 requested Scene、availability、實際 source Scene、asset version、QA status、Turbine 與 Fleet pressure。版面仍維持 8 格，不增加 panel 高度，也不寫入任何 save schema。

驗證範圍：
1. [x] Desktop SUMMARY 顯示 `SCENE／SOURCE／QA`。
2. [x] Desktop SUMMARY 顯示 `SCN003／INTEGRATED／V001／ENGINEERING QA PASSED`。
3. [x] 768px mobile SUMMARY 顯示相同 scene routing details。
4. [x] 1366×768 compact Operation smoke 無 document overflow 或 panel internal overflow。
5. [x] `pnpm validate` 與 `pnpm smoke:gameplay` 通過。

## 本輪完成：Campaign Scene Feed Coverage v1

本輪把中央 Operation field-feed 從「少數基礎情境」推進到「15 個 Campaign mission 實際使用的 Scene 全部有 direct asset」。新增的場景涵蓋 offshore substation、jack-up installation、heavy-lift deck、condition-monitoring lab 與 high-voltage switchgear room；未整合的其他 Sandbox Scene 仍會顯示 verified fallback provenance，不會假裝成專屬圖。

驗證範圍：
1. [x] `sceneAssets.json` 覆蓋 15 個 Campaign mission sceneId。
2. [x] `validate:data` 會阻擋缺少 direct asset 的 Campaign Scene。
3. [x] `smoke:scene` 驗證 Campaign 15 個 scene route badge 全部為 `INTEGRATED`。
4. [x] Sandbox `SCN006` fallback provenance 仍保留。
5. [x] 1440×900 與 768px scene smoke 無水平 overflow，且不改 Campaign save。

## 本輪完成：Scene Feed Variants v1

Operation 中央視窗已從單一共用 field-feed 擴充為 SCN001–SCN005 五個寫實海上風場情境，涵蓋 dawn、day、rain、dusk、night。Campaign 第一關使用的 SCN003 現在會走專屬雨天圖；Sandbox 仍可切換 150 個 Scene，且 SCN006 之後會保留 verified fallback provenance。

驗證項目：

1. [x] `sceneAssets.json` 中 SCN001–SCN005 均有版本化 asset URL 與 `ENGINEERING_QA_PASSED`。
2. [x] Campaign map 同時顯示 `INTEGRATED` 與 `FALLBACK` route。
3. [x] Campaign Operation 的 SCN003 使用 `INTEGRATED` 專屬場景圖。
4. [x] Sandbox preview 驗證 SCN003 integrated 與 SCN006 fallback。
5. [x] 1440×900 與 768px scene smoke 無水平 overflow，且不改 Campaign save。

## 本輪完成：Rotor Structure Telemetry v1

本輪針對「風機圖示太簡陋、轉起來不在主軸上」補強 Operation 右下 rotor digital twin。視覺層新增 nacelle、tower、shaft axis 與 `SHAFT LOCK` 標示，葉片仍由同一 hub 原點的三葉片 geometry 產生並只旋轉同一 rotor container。

驗證項目：

1. [x] Domain geometry 固定為 3 葉片、120° 等分、葉根落在 hub 外緣。
2. [x] `rotorTelemetryGeometry` 明確包含 hub、blade、nacelle、shaft、tower 尺寸。
3. [x] Browser smoke 等 `data-scene-ready="true"` 後驗證 rotor metadata：3 葉片、shaft locked、nacelle、tower。
4. [x] 1440×900 layout smoke 與 1366×768 compact Operation smoke 均通過。
5. [x] `pnpm validate` 通過，完整測試為 21 files / 139 tests。

## 本輪完成：Operation Compact Desktop Smoke v1

本輪針對「畫面盡量一頁可視、不要往下滑」補上 1366×768 desktop Operation compact mode。低高度 desktop 下，Mission Control、Field Feed、Operation Info、Card/Skills 三欄會壓縮內容密度，維持同一 viewport 內操作。

驗證項目：

1. [x] 1366×768 Operation LOG / SUMMARY 兩個 tab 均可視。
2. [x] document 無水平或垂直 overflow。
3. [x] Mission panel、Field panel、Event panel、Card panel 無 internal overflow。
4. [x] Field feed 高度維持可用，compact smoke 實測 425px。
5. [x] `pnpm validate`、`pnpm smoke:layout`、`pnpm smoke:operation:compact` 通過。

## 模式逐項稽核

| Charter 模式 | MVP 狀態 | 現有證據 | 後續缺口 |
| --- | --- | --- | --- |
| 教學任務 | 可玩完成 | Chapter 01 三個教學 Mission、五段 onboarding、Diagnosis gate、Codex 解鎖 | 後續可增加教學內容，不阻塞 MVP |
| 風場戰役 | 可玩完成 | 15 關／5 Chapter、6 座 stable-ID 風機、Mission assignment、persistent availability／reliability／backlog、XP／Crew fatigue／Equipment condition／MNT／RST、結局摘要 | 後續可增加空間化海圖與主動維護排程，不阻塞 MVP |
| Boss 挑戰 | 可玩完成 | 100 Boss、固定 L3 規則、10 回合、local best、squad draft、deterministic audit 100/100 clear | 稀有素材／傳奇卡獎勵仍屬後續內容 |
| 沙盒模擬 | 可玩完成 | 100 Boss、300 角色、200 Equipment；v2.44 新增 Sea State、Weather、Safety、Evidence、Round Limit 情境控制與船舶投影 | 可再加入逐項故障參數，但目前已符合「自由調整海況、故障與資源」的 MVP 入口 |
| 合作任務 | MVP 外 | 無假裝完成 | 需要多人同步、房間、帳號、權限、後端 API 與雲端資料一致性 |

## 核心循環稽核

| Charter 核心循環 | 狀態 | Web 實作 |
| --- | --- | --- |
| 接收風場任務 | 完成 | Mission briefing、Boss、天候、Sea State、時間／回合限制 |
| 規劃隊伍 | 完成 | 3 名角色、技能、Equipment、SPARES、Vessel、Readiness gate、Route Readiness Carryover |
| 取得海況窗口 | 完成 | Campaign Operation Profile；Sandbox Scenario Lab；Vessel protection |
| 診斷風險 | 完成 | Diagnosis choice gate、Evidence、Boss telegraph、branch event |
| 執行工作 | 完成 | Detect → Diagnose → Isolate → Repair → Verify → Restore 六階段 |
| 管理疲勞 | 完成 | 跨任務 fatigue、換班、Rest Token、Reserve／返航恢復、Exhausted gate |
| 結算與成長 | 完成 | S–D grade、XP、Career Track、Inventory、Condition、MNT、RST、Codex、Fleet Operations History、Mission Result Review、Mission Replay Compare、Campaign Continue CTA、Route Readiness Carryover |

## 資料與資產狀態

- Data Master：300 Characters、500 Skills、1,200 CharacterSkills、200 Equipment、100 Bosses、150 Scenes、3,000 Prompts；Web runtime 另有 6 個 stable-ID Turbines 與 15 個 Mission assignments。JSON 主鍵、外鍵與 runtime gate 已納入 `pnpm validate`。
- 角色 Source Art：目前 active Source Art 為 160/300；Batch017 已進入 public art index，10/10 通過 `1024×1536`／2:3 engineering precheck，正式視覺 QA 仍為 `Visual Review Required`／`userVisualApproval=false`。
- Scene：150 筆 metadata 與 prompt 已存在；v2.45 已完成 Mission／Sandbox stable-ID routing、availability 與 fallback provenance。專屬 runtime 圖目前覆蓋 19 個 Scene，其中包含 15 個 Campaign mission 實際使用的 Scene；其餘 Sandbox Scene 仍需逐批生成與 QA。
- 風機視覺：寫實 field-feed 搭配 pure TypeScript 三葉片、同軸、120° rotor geometry；動態圖層不再以偏心矩形葉片拼接。
- Production resolution：現有角色圖仍多為 `1024×1536` Web preview；Charter 建議的 `4096×6144` production source 尚未完成。

## 本輪完成：Operation Info Tab Keyboard v1

本輪補上 Operation `LOG／SUMMARY` tabs 的鍵盤操作。玩家可在 tab 上用 ArrowRight／ArrowLeft 在 LOG 與 SUMMARY 間切換，也可用 Home／End 跳到第一／最後一個 tab；切換後會同步 focus 與 `aria-selected` 狀態。

驗收條件：

1. [x] ArrowRight 可從 LOG 切到 SUMMARY。
2. [x] ArrowLeft 可從 SUMMARY 切回 LOG。
3. [x] Home／End 支援第一／最後 tab。
4. [x] 鍵盤切換後 `aria-selected` 與 tabpanel 可見狀態一致。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過。

## 上一輪完成：Operation Info Tab A11y v1

本輪把 Operation `LOG／SUMMARY` tabs 補成標準 tab 語意。Tablist 下的 LOG／SUMMARY button 現在有 `role="tab"`、`aria-controls` 與選取狀態；內容區有 `role="tabpanel"` 與 `aria-labelledby`。LOG panel 內仍保留操作紀錄 live region，不影響原本的操作紀錄朗讀。

驗收條件：

1. [x] Operation info buttons 具備 `role="tab"` 與 `aria-controls`。
2. [x] LOG／SUMMARY 內容區具備 `role="tabpanel"`。
3. [x] LOG panel 內保留 `role="log"` live region。
4. [x] Desktop 與 768px mobile smoke 使用 role 驗證 tabpanel 可見。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過。

## 上一輪完成：Operation Info Tab Reset Coverage v1

本輪補齊 browser smoke 證據。v2.66 已在 Campaign、Sandbox、Boss Challenge 三條 deploy path 都重設 Operation info tab；本輪新增 Sandbox deploy 與 Boss Challenge deploy 的實際 browser 斷言，確認新 Operation 都預設顯示 LOG。

驗收條件：

1. [x] Campaign return-route redeploy 後新 Operation 預設 LOG。
2. [x] Sandbox deploy 後新 Operation 預設 LOG。
3. [x] Boss Challenge deploy 後新 Operation 預設 LOG。
4. [x] 此批次不新增 Campaign save 欄位，也不改任務結算。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過。

## 上一輪完成：Operation Info Tab Reset v1

本輪讓每次新 Operation session 建立時都預設回 LOG。玩家上一場如果停在 SUMMARY，abort 回 Route 後再次出勤不會沿用 SUMMARY；Campaign、Sandbox 與 Boss Challenge 的 deploy path 都在建立 session 前重設。這仍是 session-only UI state，不保存、不匯出、不進入 Campaign schema。

驗收條件：

1. [x] Campaign 新 Operation 預設顯示 LOG。
2. [x] 上一場停在 SUMMARY 後，再部署新 Operation 會重設回 LOG。
3. [x] Reset 不寫入 `owm.campaign.v5`，不新增 save 欄位。
4. [x] Sandbox／Boss Challenge deploy path 同樣在建立 session 前重設 tab state。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 上一輪完成：Operation Info Mobile Tabs v1

本輪補上 Operation `LOG／SUMMARY` tabs 的 mobile layout 與 smoke coverage。768px 下 SUMMARY 改成 2 欄 compact grid；gameplay smoke 會在 mobile Operation 中實際切到 SUMMARY，確認 stage、progress、Scene、Turbine 等資訊存在且沒有水平 overflow，再切回 LOG。

驗收條件：

1. [x] 768px mobile Operation 顯示 `LOG／SUMMARY` tabs。
2. [x] Mobile SUMMARY 顯示 stage、progress、Scene、Turbine 等關鍵資訊。
3. [x] Mobile SUMMARY 不造成水平 overflow。
4. [x] 切回 LOG 後仍顯示既有 operation log。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 上一輪完成：Operation Info Tabs v1

本輪把 active Operation 下方資訊區改為 `LOG／SUMMARY` tabs。LOG 保留既有操作紀錄；SUMMARY 在不增加頁面高度的情況下彙整 stage、progress、weather、safety、evidence、Scene、Turbine 與 Fleet pressure。這是 session-only UI state，不新增 Campaign save 欄位，也不影響任務結算。

驗收條件：

1. [x] Active Operation 顯示 `LOG／SUMMARY` tabs。
2. [x] SUMMARY 顯示 stage、progress、resources、Scene、Turbine 與 Fleet pressure。
3. [x] 切回 LOG 後仍顯示既有 operation log。
4. [x] Tab 切換後仍維持 1440×900 單頁 layout。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 上一輪完成：Operation Abort Desktop Confirmation Copy v1

本輪把 desktop Operation sidebar 的 abort confirmation 與 mobile wording 對齊。玩家在桌面版按下 `Abort / Return Route` 後，確認區會明確說明 Return 只中止本次 sortie；未結算、未寫任務結果、reward、best score 或 mission outcome history。Cancel 仍留在 active Operation，且不修改 `owm.campaign.v5`；Confirm 才回 Route notice。

驗收條件：

1. [x] Desktop abort confirmation 顯示短 copy，說明 Return 只中止 sortie、不結算任務。
2. [x] Desktop Cancel 後仍留在 active Operation。
3. [x] Desktop Cancel 不修改 `owm.campaign.v5`。
4. [x] Confirm 後仍走既有 Route return notice，不新增 direct redeploy flow。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 上一輪完成：Operation Abort Mobile Confirmation Copy v1

本輪補上 mobile bottom dock abort confirmation 的短說明。玩家按下 mobile Abort 後，確認區會先顯示「Return 只中止 sortie；未結算、未寫任務結果」；Cancel 會留在 active Operation，Return 才回 Route notice。這個確認階段不寫 Campaign save，也不觸發 mission settlement。

驗收條件：

1. [x] Mobile abort confirmation 顯示短 copy，說明 Return 只中止 sortie、不結算任務。
2. [x] Mobile Cancel 後仍留在 active Operation。
3. [x] Mobile Cancel 不修改 `owm.campaign.v5`。
4. [x] Confirm 後仍走既有 Route return notice，不新增 direct redeploy flow。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 上一輪完成：Operation Return Notice Mobile Copy v1

本輪讓 abort return notice 在 768px / mobile Route 更清楚：notice 新增 `未結算／未寫存檔／僅回 Route` compact flags，窄版改成單欄、狀態文字可換行、actions 等寬。Gameplay smoke 會在 768px 實際 abort 回 Route，檢查 notice copy、水平 overflow、dismiss 以及 Campaign save 不變。

驗收條件：

1. [x] Notice 提供 compact flags，明確標示未結算、未寫存檔、僅回 Route。
2. [x] 768px Route notice 使用單欄與可換行狀態文字，不因長句造成水平 overflow。
3. [x] Mobile abort return notice 顯示與 dismiss 都不寫入 `owm.campaign.v5`。
4. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

下一個可驗收批次建議為 **Source Art Batch018 Review / Runtime Scene Coverage v2**：背景角色圖若完成則先做 active index 與 QA 回收；若先延續 runtime 視覺，則補 CTV/SOV/port/substation 其他 Scene 專屬 field-feed asset，降低 fallback 依賴。

## 上一輪完成：Operation Return Notice Dismiss v1

本輪補上 abort return notice 的手動清除流程。玩家在 Campaign Operation abort 回 Route 後，仍會看到 session-only notice 說明本次 sortie 未結算；現在可直接按 `Dismiss notice` 清除提示。Dismiss、切換主模式與 reload 都只影響 React session UI，不修改 Campaign save，也不新增直接 redeploy flow。

驗收條件：

1. [x] Notice 提供手動 dismiss action。
2. [x] Dismiss 後 notice 立即消失，不需 reload。
3. [x] Dismiss 不寫入 `owm.campaign.v5`。
4. [x] 切換 Collection／Campaign 等主模式時 notice 會清除，且不寫 Campaign save。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

## 上一輪完成：Operation Return Context v1

本輪讓 Campaign Operation abort 回 Route 後保留明確上下文：畫面會出現 session-only notice，標示本次 sortie 未結算、未寫入任務結果，並提供回到同一任務 Route 的 compact shortcut。Notice 只存在目前 React session，不直接 deploy，也不新增 Campaign save 欄位。

驗收條件：

1. [x] Confirm abort 回 Route 後顯示 operation return notice，指向剛中止的 Mission。
2. [x] Notice 明確說明本次 sortie 未結算，未寫 mission result、reward、best score 或 mission outcome history。
3. [x] Notice 提供同任務 Route shortcut，不提供 direct redeploy shortcut。
4. [x] Gameplay smoke 驗證 notice 顯示期間 `owm.campaign.v5` 不變，且 reload 後自然消失。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

此段建議的 **Operation Return Notice Dismiss v1** 已於 v2.60 完成；下一個 gameplay 批次建議為 Operation Return Notice Mobile Copy v1，補 mobile action dock 的 abort return copy 與窄版 smoke。

## 上一輪完成：Operation Quick Return v1

本輪讓 active Operation 可安全返回 Route。玩家第一次點擊 `Abort / Return Route` 只會開啟確認；只有 Confirm 才會清除目前 React session。此流程不觸發 Campaign mission settlement，因此不寫入 reward、completed mission、best score 或 mission outcome history；Campaign deploy 既有 DISPATCH history 仍保留。

驗收條件：

1. [x] Operation 進行中提供 compact Return/Abort confirmation，避免誤觸直接清除 session。
2. [x] Cancel 後仍停留在 active Operation，且下一回合 control 維持可用。
3. [x] Confirm abort 只回 Route，不呼叫 mission settlement。
4. [x] Gameplay smoke 驗證 abort 後不新增 `MSN-TUT-002` completed mission、best score 或 mission outcome history。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

此段建議的 **Operation Return Context v1** 已於 v2.59 完成；下一個 gameplay 批次改為 Operation Return Notice Dismiss v1。

## 上一輪完成：Ready Route Deploy CTA v1

本輪讓 Route reminder 在達到 `7/7 READY` 後直接提供「立即出勤」primary CTA。此 CTA 呼叫既有 `onDeploy`，沿用原本 duplicate team、inventory、Crew readiness 與 Operation readiness guards，不建立第二套出勤路徑，也不新增 Campaign save 欄位。

驗收條件：

1. [x] 只有 Route reminder 全部 ready 且既有 deploy guard 通過時，primary CTA 才能出勤。
2. [x] CTA 呼叫既有 `onDeploy`，不複製 deployment flow。
3. [x] 出勤後進入 Operation，且 Campaign dispatch history 仍由既有 flow 寫入。
4. [x] 不新增 Campaign save 欄位。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

此段建議的 **Operation Quick Return v1** 已於 v2.58 完成；下一個 gameplay 批次改為 Operation Return Context v1。

## 上一輪完成：Route Reminder Action Shortcuts v1

本輪讓 Route reminder 不只顯示缺口，也能處理最常見的三個作業確認：Permit、PPE、Access 缺口在 Route 內提供 explicit shortcut button；Crew 與 Loadout chips 則導向對應 Tab，避免自動輪調、維修或部署。

驗收條件：

1. [x] Permit／PPE／Access shortcuts 都是玩家明確點擊，且只更新目前 React deployment confirmations。
2. [x] Crew／Loadout chips 只切換到 Crew／Loadout Tab，不自動改隊伍、不自動維修、不自動部署。
3. [x] Shortcuts 不新增 Campaign save 欄位；gameplay smoke 驗證 shortcut 前後 `owm.campaign.v5` 不變。
4. [x] 完成三個作業確認後 Route reminder 顯示 `7/7 READY`，Readiness Tab 顯示 `5/5 READY`。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

此段建議的 **Ready Route Deploy CTA v1** 已於 v2.57 完成；下一個 gameplay 批次改為 Operation Quick Return v1。

## 上一輪完成：Debrief Route Readiness Carryover v1

本輪讓 Debrief CTA 回到 Route 後不只是選中下一關，也能直接看到下一關還缺哪些出勤條件。Campaign Route briefing 新增 Route Readiness Carryover，將 Permit、PPE、Access、Vessel、Mastery、Crew 與 Loadout 狀態壓成 compact chips；點擊缺口 chip 或「處理下一個缺口」會切到對應的 Readiness、Crew 或 Loadout Tab。

驗收條件：

1. [x] Carryover 只讀目前 Operation Readiness、deployment confirmations、Crew readiness、Career unlock 與 Equipment condition，不新增 Campaign save 欄位。
2. [x] Route briefing 顯示 READY/PENDING、尚缺條件與七個 compact chips。
3. [x] 從 Debrief CTA 點擊「下一個任務」回到 Route 後，下一關會顯示 Permit/PPE/Access 等 pending reminder。
4. [x] 點擊「處理下一個缺口」會直接切到 Readiness Tab。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

此段建議的 **Route Reminder Action Shortcuts v1** 已於 v2.56 完成；下一個 gameplay 批次改為 Ready Route Deploy CTA v1。

## 上一輪完成：Campaign Continue CTA v1

本輪讓任務結算後的 REVIEW 直接提供下一步操作：`campaignContinueTargets` 只從 Campaign progress、missions 與 current mission ID 派生下一個可出勤 Mission、目前任務與戰役完成狀態；REVIEW 顯示「下一個任務 / 返回 Route / 重玩本任務」三個 compact action，點擊後回到 Campaign Route 並選定對應任務。

驗收條件：

1. [x] CTA 只切換 React session/deployment route，不新增 Campaign save 欄位。
2. [x] 首次通關後「下一個任務」指向新解鎖的下一關；未完成或失敗情境仍可派生目前可出勤任務；全戰役完成時不提供下一個任務。
3. [x] REVIEW Tab 顯示下一步摘要、下一個任務、返回 Route、重玩本任務，維持 compact layout。
4. [x] Domain tests 覆蓋 next/current/complete targets；gameplay smoke 驗證 CTA 文案並實際點擊下一個任務。
5. [x] 21 test files／138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

此段建議的 **Debrief Route Readiness Carryover v1** 已於 v2.55 完成；下一個 gameplay 批次改為 Route Reminder Action Shortcuts v1。

## 上一輪完成：Mission Replay Compare v1

本輪讓重玩已完成 Mission 的 Debrief 能直接比較本次分數與歷史最佳：`awardCampaignMission` 在覆寫 `bestScores` 前派生本次 score/grade、任務前 best、任務後 best 與 `FIRST_BEST／NEW_BEST／BEST_HELD` 狀態，REVIEW Tab 顯示「本次 / 任務前 BEST / 任務後 BEST」compact card。

驗收條件：

1. [x] 比較資料只存在本次 `CampaignReward`，不新增 Campaign save 欄位。
2. [x] 首次通關顯示 `FIRST_BEST`；重玩高於舊 best 顯示 `NEW_BEST`；未刷新顯示 `BEST_HELD`。
3. [x] REVIEW Tab 顯示本次、任務前 best、任務後 best 與狀態，維持 compact layout。
4. [x] Domain tests 覆蓋 first/new/held 三種情境；gameplay smoke 驗證 REVIEW 預設 tab 具備 compare card。
5. [x] 21 test files／137 tests、TypeScript、production build、layout smoke、gameplay smoke 通過。

此段建議的 **Campaign Continue CTA v1** 已於 v2.54 完成；下一個 gameplay 批次改為 Debrief Route Readiness Carryover v1。

## 上一輪完成：Mission Result Review v1

本輪把任務完成後的 Debrief 改為可切換的 compact review：`REVIEW` 預設集中顯示 XP、MNT、Equipment wear、Crew fatigue、Wind Farm delta 與 Codex unlock；`SCORE` 保留六項評分；`LOG` 保留操作紀錄但限制高度，避免任務完成後靠長 log 找結算資訊或撐破單頁 layout。

驗收條件：

1. [x] Operation Debrief 新增 `REVIEW／SCORE／LOG` Tab，任務結束後預設開啟 REVIEW。
2. [x] REVIEW 只讀本次 session reward/debrief，不新增外部資料或存檔欄位。
3. [x] 既有 `campaign-reward`、`maintenance-reward`、`crew-recovery-reward`、`wind-farm-reward`、`codex-reward` test id 保留，避免 regression。
4. [x] LOG Tab 保留操作紀錄並限制高度；SCORE Tab 保留原六項 score breakdown。
5. [x] 21 test files／136 tests、TypeScript、production build、layout smoke、gameplay smoke 通過；gameplay smoke 新增 REVIEW／SCORE／LOG 與 Debrief single-screen 斷言。

此段建議的 **Mission Replay Compare v1** 已於 v2.53 完成；下一個 gameplay 批次改為 Campaign Continue CTA v1。

## 上一輪完成：Fleet Operations History v1

本輪把 Campaign 的風場操作串成可回看的短歷史紀錄：正式 Campaign deploy 會保存 Fleet Condition dispatch projection；任務結算會保存 mission outcome 與風機狀態前後；Fleet Maintenance single／plan 只有在 Confirm 後才保存 maintenance event。Wind Farm Operations Board 新增 `DISPATCH／HISTORY` Tab，用 compact pagination 顯示最近 30 筆，不增加 Route 頁高度。

驗收條件：

1. [x] `CampaignProgress` 新增 `fleetOperationsHistory`，既有 v1/v2/v3/v4/v5 存檔 normalize 時補空 history 並過濾未知 Mission／Turbine ID。
2. [x] Campaign deploy、mission outcome、single maintenance confirm、plan maintenance confirm 都會 append deterministic sequence event；Prepare／Cancel 不寫入。
3. [x] History 最多保留最近 30 筆 gameplay state 摘要，不引入現場 SCADA 或維護實測資料。
4. [x] Wind Farm Operations Board 新增 `HISTORY` Tab，與既有 `DISPATCH` Tab 切換，1440×900 route layout smoke 通過。
5. [x] 21 test files／136 tests、TypeScript、production build、validate、layout smoke、fleet smoke、gameplay smoke 通過；browser smoke 驗證 DISPATCH history、single／plan maintenance history 與 reload persistence。

此段建議的 **Mission Result Review v1** 已於 v2.52 完成；下一個 gameplay 批次改為 Mission Replay Compare v1。

## 上一輪完成：Fleet Condition Dispatch Modifier v1

本輪把目標風機狀態正式接回 Campaign 出勤：Mission deploy 會讀取目標 `Mission.turbineId` 的 availability、reliability 與 fault backlog，派生 deterministic Fleet Condition pressure，並一次性修正 mobilization cost、initial safety 與 initial reliability。Readiness、Dispatch Forecast 與 Operation field feed 都顯示同一組 before／after projection，並標示為 gameplay abstraction。

驗收條件：

1. [x] `windFarm.ts` 提供 pure projection/apply API，`MissionState` 用 `fleetConditionApplied` 防止重複套用。
2. [x] Campaign create-session 與 balance simulator 都套用同一套 modifier；Sandbox／Boss Challenge 維持隔離。
3. [x] Readiness、Dispatch Forecast、Operation field feed 都顯示 pressure、source state、cost／safety／reliability before-after。
4. [x] 1440×900 single-screen layout smoke 新增三處 Fleet Condition 斷言與截圖，確認沒有把一頁版撐破。
5. [x] 21 test files／135 tests、TypeScript、campaign balance、production build、layout／fleet／gameplay browser smoke 通過。

此段建議的 **Fleet Operations History v1** 已於 v2.51 完成；下一個 gameplay 批次改為 Mission Result Review v1。

## 上一輪完成：Fleet Maintenance Plan v1

本輪把單部 Fleet Maintenance 擴充為可預覽的多部計畫：玩家可在同一 compact panel 選擇多部風機、查看 stable-ID 逐步結果與總 MNT，超出預算無法加入，最後仍需 explicit confirm 才原子寫入。所有數值均標示為 gameplay abstraction。

驗收條件：

1. [x] SINGLE／PLAN Tab 共用同一個 maintenance panel，不增加桌面頁面高度。
2. [x] Plan 選項去重並依 stable ID 執行；每步顯示 R／B／AVL／MNT 前後值及整場 summary。
3. [x] 超出剩餘 MNT 的項目不可加入或 Confirm；Preview／Cancel 不寫檔。
4. [x] Confirm 一次原子保存多部 fleet state 與總 MNT；reload 結果一致，1440×900 單頁及 768px 無水平 overflow。
5. [x] 21 test files／132 tests、balance compatibility、production build 與全模式 browser smoke 通過。

此段當時選定的 **Fleet Condition Dispatch Modifier v1** 已於 v2.50 完成；下一個 gameplay 批次改為 Fleet Operations History v1。

## 本輪驗證基準

```powershell
pnpm validate
pnpm smoke:fleet
pnpm smoke:sandbox
pnpm smoke:scene
pnpm smoke:layout
pnpm smoke:gameplay
pnpm smoke:challenge
```

本文件只將已由程式、資料或 browser smoke 證實的項目列為完成；尚未生成或未經 QA 的美術資產不算完成。
## Current clean audit note - 2026-07-18

- 版本：`2.79.0-fieldfeed-layout-geometry`。
- 本輪完成 field-feed / layout / turbine geometry 修正：AI v002 中央場景圖、SCN002／SCN003 scene asset route、Fleet SVG 同軸 rotor、Phaser hub/shaft metadata、1440×900 action button no-clip gate。
- 已通過：`sync:data`、`validate:data`、`typecheck`、`build`、`smoke:layout`、`smoke:operation:compact`、`smoke:fleet`、`smoke:gameplay`。
