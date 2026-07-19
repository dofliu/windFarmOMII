# Offshore Wind Masters Web

## Current clean status - 2026-07-19

- Version: `3.29.0-source-art-batch022-r7-samples`.
- Generated three representative `BATCH-P01-022` R7 Source Art QA samples before full-batch production/import: `CHR-GOV-031` masculine, `CHR-ACA-071` androgynous, and `CHR-GOV-032` feminine.
- Added `assets/source-art/qa/BATCH-P01-022-r7-samples/BATCH-P01-022-r7-sample-contact-sheet.png` and `BATCH-P01-022-r7-sample-qa.json`.
- `CHR-GOV-032` v001 failed the P01 aspect contract at `864x1821`; it is retained only as rejected QA evidence. The v002 replacement plus the other two samples are valid `1024x1536` 2:3 candidates.
- Visual direction check: the three current candidates are materially more varied across age, face architecture, body build, task pose, camera framing, and tool interaction than the repeated cute-heroine pattern; all remain `Sample Review Required`.
- Guardrail: samples remain isolated from the public active Source Art index; no active Source Art file, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule changed.
- Active Source Art remains `210/300`, with `90/300` pending.
- Verified: sample dimension check, contact sheet render, `pnpm validate:art`, `pnpm build`.

## Previous clean status - 2026-07-19

- Version: `3.28.0-source-art-r7-casting-variety`.
- Upgraded the 90 pending P01 Source Art prompts from R6 to `OWM-P01-R7-CASTING-VARIETY-ANTI-CLONE`.
- R7 directly addresses the current visual problem: attractive results were still drifting toward the same young female lead, similar face, and similar pose with only PPE/background changes.
- Strengthened future batch gates: each 10-image pending batch still requires 4 masculine / 2 androgynous / max 4 feminine, and now also requires at least 9 pose silhouettes, 7 camera angles, 8 body types, and 5 non-glamour task poses.
- Added R7 negative prompts for copied heroine face, only outfit/background changed, glamour pose, beauty portrait pose, soft idol face in masculine/androgynous slots, and repeated cute expression.
- Exported the first R7 generation pack for `BATCH-P01-022`: `assets/source-art/qa/BATCH-P01-022-r7-generation-pack.json`, Markdown pack, and HTML casting-plan sheet.
- Guardrail: this changes pending prompt metadata, validation gates, and generation-pack workflow only; active 210 Source Art images, public Source Art index entries, gameplay logic, Campaign save schema, reward settlement, score formula, and balance rules were not changed.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-19

- Version: `3.27.0-source-art-batch016-r6-active-import`.
- Imported `BATCH-P01-016` R6 samples as active web-preview Source Art using the canonical `p01/*_v001.png` filenames.
- Active Source Art increased from `200/300` to `210/300`; pending decreased from `100/300` to `90/300`.
- Batch016 QA remains `Visual Review Required`: all 10 images are `1024x1536`, pass the P01 2:3 aspect check, and remain production-upscale pending; no user visual approval was asserted.
- Fixed `qa-p01-batch.ps1` so batch-level QA no longer says `Web Preview Approved` unless `-UserVisualApproval` is explicitly supplied.
- Public Source Art index now exposes 210 active entries and includes all 10 Batch016 characters.
- Guardrail: this is an asset/index import and QA-script correction only; gameplay logic, Campaign save schema, reward settlement, score formula, and balance rules were not changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-19

- Version: `3.26.0-source-art-r6-batch016-full-samples`.
- Generated the remaining 7 R6 Batch016 QA samples and completed the full 10-image Batch016 R6 sample set.
- Added `BATCH-P01-016-r6-full-contact-sheet.png` and `BATCH-P01-016-r6-full-sample-qa.json` under `assets/source-art/qa/BATCH-P01-016-r6-samples/`.
- All 10 current Batch016 R6 candidates are `1024x1536` and pass the 2:3 P01 aspect check; the earlier `CHR-GOV-023` ultra-tall v001 remains retained only as failed QA evidence.
- The full sample set now covers masculine 4 / androgynous 2 / feminine 4, with 10 unique age impressions, face shapes, pose silhouettes, and camera angles.
- Guardrail: sample files are still isolated from the public active Source Art index; no generated active Source Art file, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: sample dimension check, contact sheet render, public index sample-reference check, `pnpm validate:art`, `pnpm build`.

## Previous clean status - 2026-07-19

- Version: `3.25.0-source-art-r6-three-sample-review`.
- Generated three R6 Batch016 representative Source Art QA samples before full-batch production: slot 1 masculine `CHR-GOV-023`, slot 3 androgynous `CHR-DEV-108`, and slot 8 mature feminine `CHR-OMI-242`.
- Rejected the first `CHR-GOV-023` sample as an aspect-ratio failure (`864x1821`), regenerated it as a valid 2:3 candidate (`1024x1536`), and preserved the failed file only as QA evidence.
- Added a sample contact sheet and QA manifest under `assets/source-art/qa/BATCH-P01-016-r6-samples/`; all three current candidate samples are `1024x1536` and remain `Sample Review Required`.
- Guardrail: sample files are not referenced by the public active Source Art index; no generated active Source Art file, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: sample dimension check, public index sample-reference check, `pnpm validate:art`.

## Previous clean status - 2026-07-19

- Version: `3.24.0-source-art-r6-batch016-pack`.
- Exported the first R6 small-batch generation review pack for `BATCH-P01-016`: JSON prompt pack, Markdown prompt pack, and HTML casting-plan sheet.
- Added reusable Source Art utilities: `pnpm art:r6-sanitize` removes contradictory feminine facial-hair / sideburn cues from pending R6 profiles, and `pnpm art:r6-pack -- BATCH-P01-016` exports a batch-ready prompt pack.
- Batch016 now exposes a pre-generation diversity summary: masculine 4 / androgynous 2 / feminine 4, with 10 unique age impressions, 10 face shapes, 10 pose silhouettes, and 10 camera angles.
- Strengthened `validate:art` to fail feminine R6 profiles that still contain contradictory beard, moustache, or sideburn cues.
- Guardrail: no generated active Source Art file, public Source Art index, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.23.0-source-art-r6-workforce-diversity`.
- Pending/future P01 Source Art prompts now use `OWM-P01-R6-WORKFORCE-DIVERSITY-ANTI-WAIFU`.
- R6 treats the remaining 100 pending images as a real offshore-wind workforce ensemble: each 10-image batch requires at least 4 masculine/adult-man or clearly masculine adult professionals, at least 2 androgynous adult professionals, and no more than 4 feminine adult professionals.
- R6 prompt text now explicitly blocks the repeated cute heroine / waifu / idol-face collapse, while preserving credible PPE, non-sexualized presentation, source-art framing, and the existing three-bladed turbine engineering guardrails.
- `validate:art` now verifies R6 casting locks, anti-waifu negative prompts, batch age diversity, mature-adult coverage, and per-profile prompt alignment.
- Guardrail: no generated active Source Art file, public Source Art index, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.22.0-source-art-safe-frame-rendering`.
- Deployment, Operation, and Collection Source Art surfaces now render P01 images with `object-fit: contain`, centered positioning, and a safe inset instead of cropping full-body artwork with `cover`.
- Collection card art now uses the same absolute safe-frame model as Deployment and Operation, preventing intrinsic image height from overflowing its frame.
- `smoke:gameplay` now verifies the safe-frame rendering contract: computed `object-fit: contain`, active file path, successful decode, natural 2:3 aspect, rendered size, and image bounds contained inside the Source Art frame.
- Guardrail: no active Source Art file, Source Art index schema, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.21.0-source-art-runtime-surface-consistency`.
- `smoke:gameplay` now verifies Source Art consistency across Deployment, Operation, and Collection surfaces against `public/assets/source-art/p01/index.json`.
- The new regression gate checks `data-source-art-*` metadata, active image file path, successful image decode, and natural 2:3 aspect for the active character artwork.
- Batch021 is directly covered through the Collection assertion for `CHR-MAR-204`, so the newly imported R5 art is part of the gameplay smoke path.
- Guardrail: no active Source Art file, Source Art index schema, gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.20.0-source-art-batch021-r5-full-import`.
- Completed the remaining 8 R5 single-identity Batch021 P01 images and imported the full batch as active web-preview Source Art.
- Active Source Art increased from `192/300` to `200/300`; pending decreased to `100/300`; Batch021 is now 10 generated / 0 pending.
- Added full Batch021 QA artifacts: `assets/source-art/qa/BATCH-P01-021-qa.json` and `assets/source-art/qa/BATCH-P01-021-contact-sheet.png`.
- Visual direction check: Batch021 shows stronger variation across age, face structure, body type, camera angle, task pose, and tool handling; all 10 remain `Visual Review Required` until manual approval.
- `smoke:art` now verifies the runtime Source Art index and Collection rendering for 200 active characters.
- Guardrail: this is an asset/index import only; no gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.19.0-source-art-batch021-r5-partial-import`.
- Imported the first 2 R5 single-identity Batch021 P01 images as active web-preview Source Art: `CHR-MAR-204` and `CHR-OMI-249`.
- Active Source Art increased from `190/300` to `192/300`; pending decreased to `108/300`. Batch021 is now 2 generated / 8 pending.
- Added partial Batch021 QA artifacts: `assets/source-art/qa/BATCH-P01-021-partial-qa.json` and `assets/source-art/qa/BATCH-P01-021-partial-contact-sheet.png`.
- `smoke:art` now verifies the runtime Source Art index and Collection rendering for 192 active characters.
- Guardrail: this is an asset/index import only; no gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.18.0-source-art-r5-single-identity-prompts`.
- Pending R5 P01 Source Art prompts now contain exactly one explicit character identity direction per image, preventing the model from averaging multiple conflicting profiles into the same cute heroine template.
- The 110 pending prompts keep the R5 mix at masculine 44 / feminine 44 / androgynous 22, with no legacy `neutral confident stance` prompt text remaining.
- `validate:art` now fails if any pending R5 prompt has zero or multiple current character-direction blocks, or if it still contains the legacy neutral stance.
- Guardrail: generated 190 active Source Art files and the public active art index were not changed; no gameplay logic, Campaign save schema, reward settlement, score formula, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending.
- Verified: `pnpm validate:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.17.0-collection-debrief-tabs-a11y`.
- Collection and Debrief tabs now use real `tablist` / `tab` / `tabpanel` semantics with stable `aria-controls`, `aria-labelledby`, roving `tabIndex`, and ArrowLeft / ArrowRight / Home / End keyboard navigation.
- `smoke:layout` verifies Collection tab ARIA metadata and keyboard navigation; `smoke:gameplay` verifies Debrief tab ARIA metadata and keyboard navigation through Review / Score / Log.
- Guardrail: no Campaign save schema, reward settlement, score formula, Collection data projection, Source Art file/index schema, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.16.0-operation-guide-notice-pulse`.
- Operation GUIDE now shows a compact visible notice after click: `GUIDE → target label · target test id`, while preserving target highlight/focus.
- The decision prompt exports session-only active guide metadata: `data-decision-guide-active`, `data-decision-guide-active-target`, `data-decision-guide-active-label`, and `data-decision-guide-pulse`.
- Compact Operation smoke verifies guide notice text, notice metadata, prompt active metadata, target highlight, and 1366x768 no-overflow layout.
- Guardrail: no Operation settlement path, team skill recommendation formula, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending; Batch021 R5 image-only task did not import new active art.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.15.0-operation-team-skill-rec`.
- Operation `NEXT DECISION: ACT` recommendation now evaluates all three deployed crew members, not only the currently selected card.
- The `REC` skill CTA exposes stable team-aware metadata: `data-recommended-actor-index`, `data-recommended-character-id`, `data-recommended-skill-id`, reason, power, and stage result; clicking it switches to the recommended actor and uses the existing skill settlement path.
- Compact Operation and full gameplay smoke verify the team-aware recommendation metadata and click-through settlement while preserving one-screen layouts.
- Guardrail: no Operation settlement formula, skill power formula, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule was changed.
- Source Art status remains `190/300`, with `110/300` pending; Batch021 R5 art-only background task is running separately.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.14.0-operation-decision-guide-cta`.
- Operation `NEXT DECISION` prompt now includes a compact `GUIDE` CTA with stable `data-decision-guide-target` and `data-decision-guide-label` metadata.
- GUIDE is session-only UI assistance: it highlights/focuses the existing actionable target for ACT/DIAG/EVENT/RISK/ROUND decisions, including Skill REC, Diagnosis REC, Branch Reactive/Accept, or End Round.
- Compact Operation smoke verifies guide metadata, guide button target parity, target highlight, and the existing 1366x768 no-overflow layout.
- Guardrail: no Operation settlement path, skill recommendation formula, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.13.0-deployment-tabs-a11y-keyboard`.
- Deployment primary tabs now use real `tablist` / `tab` / `tabpanel` semantics with stable `aria-controls`, `aria-labelledby`, roving `tabIndex`, and ArrowLeft / ArrowRight / Home / End keyboard navigation.
- `smoke:layout` now verifies Deployment tab ARIA metadata and keyboard navigation before checking the existing one-screen route/readiness/crew/loadout/forecast layout.
- R5 Batch021 Source Art has been delegated to a background art-only task; the task must use R5 anti-clone rules and cannot continue the old R4 template.
- Guardrail: no gameplay settlement, deployment readiness formula, Campaign save schema, Source Art index schema, active Source Art file, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:layout`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.12.0-source-art-r5-anti-clone-diversity`.
- Pending/future P01 Source Art prompts now use `OWM-P01-R5-ANTI-CLONE-DIVERSITY-ENGINEERING`.
- R5 fixes the R4 repetition issue: pending batches can no longer reuse the same slot profile across batches; every pending character now carries a unique anti-clone diversity signature across face structure, facial feature, age impression, body type, pose, expression, camera angle, hand gesture, and tool handling.
- `validate:art` now gates all 11 pending batches for stricter per-batch variety: 4 masculine, 2 androgynous, 4 feminine-presenting professionals, at least 8 pose silhouettes, 6 camera angles, 8 hairstyles, 8 expressions, 8 face shapes, and 7 body types.
- Active Source Art remains `190/300`; pending remains `110/300`. Generated R3/R4 images are legacy-valid and were not regenerated.
- Guardrail: no active Source Art file, gameplay logic, Reactive recommendation sort, branch resolution, event penalty formula, mission runtime settlement, Campaign save schema, or balance rule was changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.10.0-operation-branch-reactive-rec-reason`.
- Operation Branch Event `REC` Reactive CTA now exposes and displays why the recommended Reactive skill is selected.
- CTA metadata includes `data-recommended-reactive-reason`, `data-recommended-reactive-power`, and `data-recommended-reactive-energy-cost`; the visible `branch-reactive-reason` matches the metadata.
- Full gameplay smoke verifies the Branch Event recommendation still mitigates branch loss and applies `BranchGuard`; layout smoke verifies the added reason copy does not break the one-screen layout.
- Background Source Art Batch020 completed during this increment; active P01 Source Art is now `190/300`, with `110/300` pending.
- Guardrail: no Reactive recommendation sort, branch resolution, event penalty formula, mission runtime settlement, Campaign save schema, Source Art file, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.09.0-operation-diagnosis-rec-reason`.
- Operation Diagnosis `REC` CTA now exposes and displays why the recommended answer is selected, using `data-recommended-diagnosis-reason` and visible `diagnosis-rec-reason`.
- Compact Operation smoke and full gameplay smoke verify the diagnosis recommendation has a stable ID, reason metadata, matching visible reason, and still executes the existing evidence gain path.
- Guardrail: no diagnosis scoring rule, evidence reward, mission runtime settlement, Campaign save schema, Source Art file, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.08.0-operation-rec-skill-reason`.
- Operation `REC` recommended skill CTA now exposes and displays why the selected skill is recommended, including `data-recommended-skill-reason`, `data-recommended-skill-power`, and `data-recommended-skill-stage-result`.
- The CTA reason is derived from the existing `resolveTeamSkill` forecast: highest available power, applied power, and whether the action clears or leaves the current stage.
- Compact Operation smoke and full gameplay smoke verify the reason metadata matches the visible `recommended-skill-reason`, power is numeric, and stage result is `clear` or `remains`.
- Guardrail: no skill recommendation formula, skill settlement, Operation decision projection, Campaign save schema, Source Art file, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.07.0-operation-decision-reason-metadata`.
- Operation `NEXT DECISION` prompt now exposes stable decision telemetry: `data-decision-code`, `data-decision-action`, `data-decision-reason`, and `data-decision-meta`.
- The visible decision detail remains the same player-facing reason, and browser smoke verifies the metadata matches the rendered action/reason for ACT/DIAG/EVENT/RISK/ROUND decision states.
- Guardrail: no Operation settlement path, skill recommendation formula, diagnosis rule, round forecast, Campaign save schema, Source Art file, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.06.0-route-readiness-next-reason`.
- Route Readiness Carryover primary CTA now exposes and displays the reason behind the next recommended readiness action through `data-next-readiness-reason` and `route-readiness-next-reason`.
- The reason advances with the existing CTA flow: pending Permit/PPE/Access confirmations explain the planning confirmation step; READY explains that deploy uses the existing Campaign dispatch flow.
- `smoke:gameplay` verifies pending reason, post-permit PPE reason, and READY deploy reason; `smoke:deployment:compact` verifies the added copy does not break the 1366×768 one-page Deployment layout.
- Guardrail: no Campaign save schema, readiness formula, deployment guard, route selection logic, Source Art file, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:deployment:compact`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.05.0-debrief-next-action-reason`.
- Debrief Campaign Continue now exposes a clear recommended next-action reason after settlement, including `data-recommended-continue-action`, current mission ID, next mission ID, available mission count, and per-CTA `data-continue-reason`.
- The visible Debrief summary now states why the next mission is recommended, while Return Route and Replay keep explicit reason metadata for QA and future UI tuning.
- `smoke:gameplay` now verifies the post-debrief recommendation points from `MSN-TUT-001` to unlocked `MSN-TUT-002`, including summary metadata and next/return/replay reason strings.
- Guardrail: no Campaign save schema, reward settlement, mission unlock formula, route selection logic, Source Art file, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.04.0-operation-scene-asset-telemetry`.
- Operation Phaser field-feed host now exposes stable scene asset telemetry: requested Scene ID, source Scene ID, asset URL, fallback URL, asset version, QA status, and integrated/fallback availability.
- `smoke:operation:compact` now verifies the central Operation field-feed uses the expected `SCN003` integrated `offshore-field-feed_ai_v004.png` asset with `ENGINEERING_QA_PASSED`, alongside the existing rotor hub/shaft/tower axis-lock checks and one-screen LOG/SUMMARY/OBJECTIVES layout checks.
- Guardrail: no Source Art file, Source Art index schema, Campaign save schema, gameplay settlement, scene route data, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.03.0-source-art-diversity-profile-gate`.
- All 120 pending P01 Source Art items now include structured `diversityProfile` metadata in the master manifest and pending batch manifests.
- `validate:art` now enforces R4 batch diversity gates: 3 masculine, 2 androgynous, no more than 5 feminine, at least five unique pose silhouettes, at least five face shapes, and at least five body types per pending 10-character batch.
- Generated R3 Source Art remains unchanged; no active Source Art file, Source Art index schema, Campaign save schema, gameplay settlement, Operation field-feed route, or balance rule was changed.
- Verified: `pnpm validate:art`, `pnpm typecheck`, `pnpm build`.

## Previous clean status - 2026-07-18

- Version: `3.02.0-art-diversity-turbine-icon-v002`.
- Pending and future P01 Source Art prompts now use `OWM-P01-R4-DIVERSITY-ENGINEERING`; the already generated 180 R3 images remain unchanged.
- The 120 pending prompts now require visible diversity across gender presentation, face, skin tone, hairstyle, age impression, body type, pose, expression, camera angle, and tool handling; `male character` is no longer blocked in pending negative prompts.
- Fleet Board turbine icons are upgraded to `offshore-svg-v002` with monopile foundation, sea line, access rail, tower/nacelle highlights, and explicit hub/shaft/tower axis-lock metadata.
- Guardrail: no active Source Art file, Source Art index schema, Campaign save schema, gameplay settlement, balance, or Operation field-feed route was changed.
- Verified: `pnpm typecheck`, `pnpm validate:art`, `pnpm smoke:fleet`, `pnpm smoke:art`, `pnpm build`, `pnpm smoke:operation:compact`.

## Previous clean status - 2026-07-18

- Version: `3.01.0-source-art-card-metadata`.
- Source Art runtime cards now expose stable metadata for active character ID, P01 version, active file, visual QA status, and engineering QA status in Operation preview, Deployment preview, and Collection cards.
- `smoke:art` now verifies all 180 active character cards load the active art-index file and expose matching card metadata; Batch019 representative screenshots include `CHR-OMI-246` and `CHR-GOV-028`.
- No art image file, Source Art index schema, Campaign save schema, gameplay formula, reward settlement, replay routing, or balance rule was changed.
- Active Source Art is `180/300`; Batch019 is complete and Batch020 is delegated as a background art-only task with diversity rules.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:art`, `pnpm build`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `3.00.0-campaign-completion-summary-metadata`.
- Campaign Completion Summary now exposes stable metadata for completion state, mission/chapter totals, average best score, scored mission count, campaign grade, S-grade count, and mastered crew count.
- Gameplay smoke verifies the injected full-completion Campaign state renders `15/15` missions, `5/5` chapters, average best score `80`, grade `A`, `3` S grades, and `1` L5 crew through metadata.
- No Campaign save schema, mission completion rule, score formula, reward settlement, replay routing, or balance rule was changed.
- Active Source Art remains `180/300`; `smoke:art` remains part of the verification set.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`, `pnpm smoke:art`.

## Previous clean status - 2026-07-18

- Version: `2.99.0-debrief-secondary-cta-metadata`.
- Debrief Campaign Continue actions now expose stable metadata for all three post-settlement choices.
- `continue-next-mission` adds `data-continue-action="next-mission"` and `data-current-mission-id`; `continue-return-route` adds `data-continue-action="return-route"` and current mission metadata; `continue-replay-mission` adds `data-continue-action="replay-mission"` and `data-replay-mission-id`.
- Gameplay smoke verifies next/return/replay metadata after `MSN-TUT-001` settlement before routing to `MSN-TUT-002`.
- No Campaign save schema, reward settlement, mission unlock formula, route selection logic, or balance rule was changed.
- Active Source Art is now `180/300`; `smoke:art` verifies all 180 active character cards load.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`, `pnpm smoke:art`.

## Previous clean status - 2026-07-18

- Version: `2.98.0-operation-return-notice-metadata`.
- Operation abort/return notice now exposes stable metadata: `data-return-mission-id`, `data-return-reason`, `data-return-selected`, and `data-return-can-redeploy`.
- The Route shortcut also exposes `data-return-action`, `data-target-mission-id`, and `data-target-selected`.
- Gameplay smoke verifies the desktop abort notice identifies `MSN-TUT-002`, the mobile abort notice identifies `MSN-TUT-001`, both use reason `abort`, selected state `true`, and no direct redeploy path.
- No Campaign save schema, abort behavior, mission settlement, reward formula, or deployment route was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.97.0-route-readiness-next-gap-metadata`.
- Route Readiness Carryover primary CTA now exposes stable next-gap metadata through `data-next-readiness-gap`, `data-next-readiness-action`, and `data-next-readiness-tab`.
- Gameplay smoke verifies the CTA starts at `permit / confirm-permit / readiness`, advances to `ppe / confirm-ppe`, then becomes `READY / deploy / operation`.
- No Campaign save schema, readiness formula, deployment guard, route selection logic, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.96.0-debrief-next-mission-rec`.
- Debrief `continue-next-mission` is now marked as the recommended continuation action when a next mission exists.
- The CTA exposes `data-recommended-mission-id`, and gameplay smoke verifies it points to `MSN-TUT-002` before routing.
- The recommended styling is visual-only and still calls the existing `onSelectMission(nextMission.id)` path.
- No Campaign save schema, reward settlement, mission unlock formula, or route selection logic was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm smoke:operation:compact`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.95.0-round-decision-rec-settlement`.
- `round-decision-cta` smoke is now click-through: when confirmation is required, compact smoke clicks the CTA a second time and verifies End Round settlement.
- Compact Branch Event layout now compresses the branch response panel at 1366×768 so the field feed remains playable after a round-triggered event opens.
- The settlement smoke requires Operation log growth and round/event/debrief state movement after the CTA path.
- No End Round formula, branch trigger rule, mission settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.94.0-round-decision-rec-cta`.
- `NEXT DECISION: ROUND/RISK` now exposes a compact `REC` End Round CTA inside the Operation decision prompt.
- The CTA calls the existing `requestNextRound()` path, including the existing two-step confirmation when branch/failure/low-margin risk is forecast.
- Compact Operation smoke now drives the session into ROUND/RISK and verifies the CTA enters End Round confirmation without document or panel overflow.
- No End Round formula, branch trigger rule, mission settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.93.0-diagnosis-rec-cta`.
- Diagnosis Gate panels now expose a training `REC` CTA with a stable recommended diagnosis ID.
- The CTA is derived from the existing correct diagnosis option and calls the same `chooseDiagnosis(optionId)` path as manual diagnosis choices.
- Gameplay smoke now verifies the Diagnosis CTA has a stable ID and uses it to add evidence during the Campaign diagnosis stage.
- No diagnosis scoring formula, mission settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.92.0-branch-reactive-rec-cta`.
- Branch Event panels now expose a `REC` Reactive CTA when at least one usable Reactive skill is available.
- The CTA is derived from the existing branch response options and calls the same `resolveBranch(actorIndex, skillId)` path as the normal Reactive buttons.
- Gameplay smoke now verifies the Branch Event CTA has stable character/skill IDs and uses it to mitigate the first Campaign branch event.
- No branch penalty formula, Reactive settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.91.0-operation-rec-cta-settlement`.
- `REC` recommended skill CTA is now covered by click-through smoke: clicking it must consume AP, consume the displayed Energy cost, and either advance the stage or increase progress.
- Added stable non-visual test hooks for Operation summary stage/progress and active runtime AP/Energy so browser smoke verifies actual runtime settlement rather than CSS position or OCR.
- Compact smoke also verifies the Operation log gains a new entry after the CTA action.
- No runtime formula, settlement function, Campaign save schema, or balance rule was changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.90.0-operation-recommended-skill`.
- Operation `NEXT DECISION: ACT` now exposes a right-side `REC` skill CTA that directly executes the recommended active skill for the selected crew member.
- The CTA is derived from the existing `recommendedSkill` / `resolveTeamSkill` forecast and is session-only UI guidance; it does not change runtime settlement, save schema, or balance formulas.
- Browser smoke verifies ACT exposes exactly one recommended skill CTA with a stable skill ID while preserving 1366×768 compact Operation no-overflow and gameplay flow.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.89.0-operation-field-feed-v004`.
- Operation center field-feed now uses AI-generated `offshore-field-feed_ai_v004.png`, with saved negative guardrails for malformed turbine blades, off-axis rotors, text/logo/watermark, people, and fantasy machinery.
- Fleet Board turbine icons keep the `2.88.0` hub/shaft/tower axis-lock work and are slightly enlarged for better readability without breaking the one-screen layout.
- Smoke checks verify V004 scene routing, 3-blade hub-locked rotor telemetry, 1366×768 compact Operation no-overflow, Fleet icon animation origin, 1440×900 layout, and gameplay flow.
- Runtime logic, settlement, save schema, and balance formulas are unchanged.
- Verified: `pnpm sync:data`, `pnpm typecheck`, `pnpm test -- src/domain/turbineGeometry.test.ts`, `pnpm validate:data`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:fleet`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.88.0-turbine-axis-lock`.
- Fleet Board SVG turbine rotors now rotate around the exact hub coordinate shared by shaft, nacelle, and tower; the animation origin is exported as telemetry and checked by smoke tests.
- Operation field-feed rotor telemetry now exposes hub lock, 0/120/240 blade angles, and transform origin; the visual bearing ring replaces the previous axis guide so it does not read as an extra blade.
- This is a visual/QA hardening pass only; runtime logic, settlement, save schema, and balance formulas are unchanged.
- Verified: `pnpm typecheck`, `pnpm test -- src/domain/turbineGeometry.test.ts`, `pnpm smoke:operation:compact`, `pnpm smoke:fleet`, `pnpm smoke:layout`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.87.0-operation-info-heading`.
- Operation info panel heading now follows the selected tab: `OPERATION LOG`, `OPERATION SUMMARY`, or `OPERATION OBJECTIVES`.
- This improves in-game readability when switching tabs without changing runtime logic, settlement, save schema, or balance.
- `pnpm smoke:operation:compact` now verifies the heading switch at 1366×768 while preserving no-overflow guarantees.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm smoke:fleet`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version: `2.86.0-campaign-route-subtabs`.
- Campaign Route now uses `FLEET / MISSIONS / BRIEFING` sub-tabs so Route content stays inside one viewport instead of stacking wind-farm status, mission map, and briefing vertically.
- `MISSIONS` shows all 15 mission nodes across 5 chapters; selecting a mission moves directly to `BRIEFING`, where Route Readiness Carryover and the Mission Event Deck stay in the same compact panel.
- Added `pnpm smoke:deployment:compact` for 1366×768 Deployment single-screen verification, including Route sub-tabs and Fleet Board history.
- Verified: `pnpm typecheck`, `pnpm smoke:deployment:compact`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm smoke:fleet`, `pnpm validate`.

## Previous clean status - 2026-07-18

- Version：`2.85.0-operation-field-feed-v003`。
- Operation field-feed：新增 AI 生成 `offshore-field-feed_ai_v003.png`，濕甲板、海況 2–3、遠近三葉片風機與實際 O&M 視角更清楚。
- Scene routing：fallback、SCN002、SCN003 已由 V002 升到 V003；prompt 與 negative guardrails 以 `offshore-field-feed_ai_v003.prompt.md` 保存。
- Verified：data validation、scene routing smoke、layout smoke、compact Operation smoke、gameplay smoke、validate。

## Previous clean status - 2026-07-18

- Version：`2.84.0-fleet-turbine-icon-rigging`。
- Fleet Board turbine icon：Route 六張風機卡改用 `fleetTurbineIconGeometry` domain helper，hub、shaft、tower、nacelle 使用同一主軸座標，不再以散落 magic number 手刻。
- Visual QA：圖示放大並補強 nacelle / tower / platform / hub / rotor 對比；smoke 直接驗證 shaft start = hub、shaft y = hub y、tower center = hub x、nacelle axis = hub y、且恰好 3 個 blade polygon。
- Verified：focused turbine geometry test、typecheck、fleet smoke、layout smoke。

## Previous clean status - 2026-07-18

- Version：`2.83.0-round-commit-confirmation`。
- Operation End Round：高風險結算（branch event、forecast failure、低 weather / safety margin）改為二次確認；第一次只顯示 session-only commit warning，第二次才提交回合。
- Layout policy：桌面與 768px mobile 都保留單頁操作；確認提示放在既有 action stack / mobile dock，不新增向下捲動。
- Verified：typecheck、compact smoke、layout smoke、gameplay smoke。

## Previous clean status - 2026-07-18

- Version：`2.82.0-skill-forecast`。
- Operation OBJECTIVES：新增 `SKILL FORECAST`，顯示推薦技能、applied power、stage clear / remains、AP / Energy / Fatigue 成本。
- Logic boundary：forecast 直接使用既有 `resolveTeamSkill` pure resolver；不寫 save、不改 settlement。
- Verified：typecheck、compact smoke、layout smoke、gameplay smoke。

## Previous clean status - 2026-07-18

- Version：`2.81.0-end-round-forecast`。
- Operation OBJECTIVES：新增 `END ROUND FORECAST`，在按 End Round 前顯示 fatigue / safety / weather 預估與 branch / failure 風險。
- Logic boundary：forecast 由 `previewEndRound` domain function 產生，與正式 `endRound` 共用公式；不寫 save、不改 settlement。
- Verified：runtime focused test、typecheck、compact smoke、layout smoke、gameplay smoke。

## Previous clean status - 2026-07-18

- Version：`2.80.0-operation-objectives-tab`。
- Operation info tabs：`LOG / SUMMARY / OBJECTIVES`；OBJECTIVES 顯示 Stage target、Learning objective、Diagnosis gate、Branch event、Risk floor。
- Layout policy：Operation 仍維持單頁；新增資訊放入 tab，不增加垂直堆疊。
- Source Art：Batch018 已完成，active Source Art index 目前 `170/300`。
- Verified：`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay`。

## Previous milestone snapshot

- 歷史版本：`2.79.0-fieldfeed-layout-geometry`。
- 中央 Operation field-feed 已升級為 AI 生成的 `offshore-field-feed_ai_v003.png`，用於 default／SCN002／SCN003，並保留 R3 negative guardrails prompt。
- Fleet Board 風機 SVG 與 Phaser rotor telemetry 已加強同軸約束：3 blades、hub、shaft start/end、axis consistency 由 smoke test 驗證。
- 1440×900 Operation layout 已壓緊左側 MISSION CONTROL，End Round / Abort action 完整可見；1366×768 compact、Fleet、Gameplay smoke 均通過。

## 最新進度

- 目前版本：`2.78.0-operation-decision-prompt`。
- Operation event panel 新增 compact `NEXT DECISION` 提示，會依目前狀態顯示 `ACT / DIAG / EVENT / RISK / ROUND`，讓玩家不用從 log、stage、skill disabled 狀態自行推論下一步。
- Fleet Board 六張風機卡新增共用三葉片 SVG icon；每張卡都包含 tower、nacelle、shaft、hub 與 3 片 120° 葉片，smoke 會驗證 blade count 與 shaft lock metadata。
- Sandbox Scene selector 新增 `ALL / INTEGRATED / FALLBACK` tab 篩選與 coverage summary；目前 29/150 Scene 有 direct field-feed，121 個缺圖 Scene 仍清楚標示 fallback，不把共用圖誤認成專屬圖。
- Operation `SUMMARY` tab 現在直接顯示 Scene requested ID／availability、實際 source Scene／asset version、QA status、Turbine 與 Fleet pressure；維持 8 格 layout，不增加 panel 高度。
- 15 個 Campaign mission 實際使用的 Scene 現在都有專屬 Operation field-feed asset；`validate:data` 會阻擋缺少 direct asset 的 Campaign Scene，`smoke:scene` 會驗證 15 個 mission scene badge 全部為 `INTEGRATED`。
- Operation 中央 field-feed 已接入 SCN001–SCN005 五個基礎寫實海上風場情境（dawn/day/rain/dusk/night），並補上 Sandbox monopile、jacket、floating turbine 起始批次，以及 Campaign 用到的 substation、jack-up、heavy-lift、condition-lab、switchgear 變體；SCN006 仍保留作為 Sandbox fallback 驗證案例。
- Rotor digital twin 已補 nacelle、tower、shaft axis 與 `SHAFT LOCK` 標示；layout/compact smoke 會驗證 3 葉片、shaft locked、nacelle/tower metadata。
- Operation compact desktop 已新增 1366×768 smoke gate：部署任務後驗證 `LOG / SUMMARY`、document overflow、三欄 panel internal overflow，並確認 field feed 仍有可用高度。
- `LOG / SUMMARY` tabs 支援 ArrowLeft／ArrowRight／Home／End 鍵盤切換與 focus 移動，layout smoke 會實際按鍵驗證。
- `LOG / SUMMARY` 已補標準 `tablist / tab / tabpanel` 語意與 `aria-controls`，desktop 與 mobile smoke 會用 role 驗證。
- 每次新 Operation 建立時，`LOG / SUMMARY` 會預設回 LOG；上一場停在 SUMMARY 不會污染下一次出勤。
- Operation 下方資訊區新增 `LOG / SUMMARY` tabs；LOG 保留操作紀錄，SUMMARY 在同一頁切換顯示 stage、progress、weather、safety、evidence、Scene、Turbine 與 Fleet pressure。Desktop 與 768px mobile 都已驗證不增加水平 overflow。
- Desktop 與 mobile 的 Abort confirmation 都會先顯示「Return 只中止 sortie；未結算、未寫任務結果」，Cancel 會留在 Operation，Return 才回 Route notice；不改 Campaign save。
- Abort 回 Route 後會顯示 session-only context notice，說明本次 sortie 未結算、未寫入任務結果，並提供回到同一任務 Route 的 compact shortcut；notice 可手動清除，切換主模式或 reload 後也會自然消失，且不改 Campaign save。窄版 Route 會額外顯示 `未結算／未寫存檔／僅回 Route` compact flags，避免 mobile 上誤判為正式紀錄。
- Operation 進行中新增二段式 `Abort / Return Route`：第一次點擊只開啟確認，Confirm 後才清除目前 sortie 回 Route；不寫入 mission result、reward、best score 或 mission outcome history。
- Route reminder 達到 `7/7 READY` 後，primary CTA 會改為「立即出勤」，直接沿用既有 deploy guard 進入 Operation；仍需玩家明確點擊。
- Route readiness reminder 新增 explicit shortcuts：Permit／PPE／Access 可在 Route 直接點擊確認，Crew／Loadout chip 會導向對應 Tab；不自動部署、不新增 Campaign save 欄位。
- Campaign Route briefing 會顯示「下一關整備提醒」，把 Permit／PPE／Access／Vessel／Mastery／Crew／Loadout 狀態壓成 compact chips，從 Debrief CTA 回 Route 後可直接看到缺口。
- Mission Result REVIEW 會顯示「下一個任務／返回 Route／重玩本任務」compact action；下一個可出勤 Mission 由當前 Campaign progress 派生，不新增 save 欄位。
- Mission Result REVIEW 會顯示「本次 / 任務前 BEST / 任務後 BEST」，重玩已完成任務時可直接判斷是否刷新最佳分數。
- 任務完成後 Debrief 改為 `REVIEW／SCORE／LOG` Tab；REVIEW 預設集中顯示 XP、MNT、Equipment wear、Crew fatigue、Wind Farm delta 與 Codex unlock。
- Wind Farm Operations Board 新增 `HISTORY` Tab；Campaign deploy、mission outcome、Fleet Maintenance single／plan confirm 都會寫入最多最近 30 筆 operations history。
- Campaign deploy 會依目標風機 availability、reliability 與 fault backlog 計算 Fleet Condition 壓力，並在 Readiness、Dispatch Forecast、Operation field feed 顯示 mobilization cost、initial safety、initial reliability 的 before/after。
- Active Source Art 目前為 160/300；Batch017 已進入 public art index，正式視覺 QA 仍維持人工確認。
- 此 modifier 只套用於 Campaign，Sandbox 與 Boss Challenge 維持原本 isolation；所有數值仍標記為 gameplay abstraction。

Offshore Wind Masters（OWM）現已改為純 Web 策略卡牌 MVP，不需要 Unity。遊戲採 `React + TypeScript + Phaser`，直接使用原有 Excel／JSON Source of Truth。

## 已完成

- 桌面版以 1440×900 單一 viewport 為設計基準：Deployment 使用任務航線／作業許可／Crew／裝備／出勤預測五個 Tab；Collection 與 Codex 使用 Tab、搜尋及分頁，不必向下捲動找主要資訊。
- Campaign Deployment 另有「出勤預測」Tab：出勤前預覽 success/failure Equipment wear、MNT reward／完整修復成本、Crew 每回合 baseline／返航後上界與 RST 收支。
- 60 條 Career Track 各含 L1–L5 五張角色卡；新 Campaign 只開放 60 名 L1，Track 內既有 `characterXp` 加總達 `100／250／500／900` 時新增 L2–L5，低階卡不會被取代。
- Crew Tab 提供 ID／姓名／職種、Faction、Readiness、最低 Mastery 與 Skill Capability filters；Capability 可找 Reactive、正式全隊 fatigue recovery 或 `≤4 Energy` 一般技能，Campaign 只列入當前 Mastery 已解鎖技能槽。Crew Rotation Advisor 仍完整比較所有已解鎖且可出勤角色的三人組合。
- 輪班建議可在 Crew 或出勤預測頁一鍵套用；三個席位與 Crew forecast 立即同步，若現有隊伍已是同條件最佳建議則保持不變。
- Operation 中央視窗使用寫實海上風場 field-feed；15 個 Campaign mission scene 已有專屬版本，動態 rotor digital twin 固定為三支 120° 等距葉片，繞同一個 hub origin 旋轉。
- Mission Scene Routing 會將 15 關既有 `sceneId` 連到 150 筆 Scene metadata 與版本化 asset index；畫面明確顯示 requested Scene、`INTEGRATED／FALLBACK` 與 provenance，不把共用背景誤標為專屬場景圖。
- Campaign Route 新增 Wind Farm Operations Board：6 座風機使用固定 `WTG-OWM-NNN` ID，15 個 Mission 各自指派機組；單頁即可看到 availability、reliability 與 fault backlog，選定任務會同步標示目標風機。
- 六張風機卡使用同一套三葉片 SVG icon，明確顯示 tower、nacelle、shaft、hub 與同軸 rotor；這是 Route 層級狀態圖示，不影響 Operation 的 Phaser field-feed。
- 風機卡可在不改變 Mission 目標的情況下獨立選取並開啟 Fleet Maintenance；報價會顯示 priority、reliability、backlog、availability 與 MNT 的前後值。
- Fleet Maintenance 只有在玩家明確確認後才原子扣除 MNT、提升 reliability、清除一筆 backlog 並保存 action count；Prepare／Cancel 都不寫入 Campaign v5。
- 六張風機卡同時是 Fleet Dispatch Priority queue：依風險與單次維修效益排列 `#01–#06`，顯示 R／B 前後值、MNT、`READY／SHORT／CLEAR` 與 availability impact；選取後可看整場 AVL／平均 R／Backlog 投影。
- Queue 只提供 deterministic gameplay 決策資訊，不自動執行或預測真實風場風險；每次玩家確認維修後才用最新 Campaign v5 狀態重新排名。
- Fleet Maintenance 提供 `SINGLE／PLAN` Tab；PLAN 可選多部風機，每部一次，依 stable ID 顯示逐步 R／B／AVL／MNT 與整場結果，超出剩餘預算的項目不可加入。
- 多部 Plan 的加入、移除、Prepare 與 Cancel 都不寫檔；一次 explicit Confirm 後才原子扣除總 MNT 並保存所有風機結果。
- Wind Farm Operations Board 另有 `DISPATCH／HISTORY` Tab；History 以 compact pagination 顯示 deploy dispatch modifier、mission result、single maintenance 與 plan maintenance 事件，仍維持桌面單頁 layout。
- 任務成功會降低對應風機 backlog 並提升 reliability，失敗會累積故障並可能轉為 `DEGRADED／OFFLINE`；Operation Field 與 Debrief 都顯示本次機組狀態及前後差異，數值明確標示為 gameplay abstraction。
- Operation Debrief 使用 `REVIEW／SCORE／LOG` Tab；REVIEW 先顯示任務獎勵、資源變化、「本次 / 任務前 BEST / 任務後 BEST」比較與下一步 CTA，SCORE 顯示六項評分，LOG 保留完整操作紀錄。
- Operation 進行中會在 LOG／SUMMARY tab 上方顯示 `NEXT DECISION` compact prompt；提示只由目前 runtime state 派生，不寫入存檔，也不改任務結算。
- Campaign Route briefing 會同步顯示下一關 readiness carryover；Permit／PPE／Access 缺口可在 Route 明確確認，Crew／Loadout 缺口會導向可處理的 Tab。
- Sandbox 可從全部 150 個 Scene 選擇作業場景，並用 `ALL / INTEGRATED / FALLBACK` tab 篩選 29 個 direct asset 與 121 個 fallback route；filter 不會改變目前選中的 Scene，直到玩家明確重新選取。
- Sandbox 新增 Scenario Lab：可在單一 Tab 調整 Sea State、Weather Window、Safety、Evidence 與 Round Limit，並在部署前預覽海況對 Vessel weather／safety／fatigue protection 的投影；所有設定僅作用於本次 session，不修改 Campaign。
- 任務部署：選擇 Boss、三名不重複角色與一項裝備，先檢查六階段專業涵蓋再出勤。
- 第一章三個連續教學 Mission：主軸承過熱、變槳失效、發電機絕緣劣化。
- 第二章三個進階 Mission：齒輪箱多源診斷、變槳雙重隔離、發電機局部放電。
- 第三章三個 S3 Mission：嚴重軸承過熱、偏航控制偏差、嚴重發電機絕緣劣化；Campaign 共 9 關連續解鎖。
- 第四章三個 S4 Mission：危急軸承過熱、危急偏航失效、危急發電機絕緣劣化；Campaign 共 12 關連續解鎖。
- 第五章三個 S5 終局 Mission：軸承熱失控、偏航聯鎖失效、最終絕緣危機；Campaign 共 15 關連續解鎖。
- Campaign mission map 以五個 Chapter 顯示全部 15 關，直接標示 completed／available／locked、前置關卡、最佳評級與選取狀態。
- Boss Challenge 是獨立計分模式：可選 100 個 Boss 與 300 名角色，固定 Mastery L3（250 XP）、10 回合、`EQ0051 + EQ0126 + VES002` L1 配置；沿用正式 S–D 評分，各 Boss local best 與未出勤的三人 squad draft 分開寫入 `owm.challenge.v3`，既有 v1／v2 會自動 migration。每筆最佳紀錄永久保存 `OPERATION` 或 `DRAFT_CONFIRMATION` 來源，reload 後仍可辨識，來源不參與最佳分數排序。
- Boss Challenge deterministic audit 會為三種 counter set 各精確比較 `C(300,3)=4,455,100` 組隊伍，再以 balanced／power／survival 候選實跑 100 Boss；目前 100/100 可通關，S5 為 17 tight／3 critical／0 comfortable。GRD S4/S5 reserve 只存在 Challenge，不改 Campaign。
- Boss Challenge Route 可依 Severity、14 種 Class、未挑戰／已通關／未通關及 `DRAFTED／UNDRAFTED` 狀態交集篩選，並支援 ID、Severity、best-score、Audit Hardest 與 Drafted First 排序；選定 Boss 會顯示 pressure、候選隊通關率、稽核回合及 `BOSS075／079／080` hard-outlier 標示。
- Boss Challenge Crew Tab 會顯示每個 Boss 的 deterministic audit 推薦三人隊伍、score／round／候選通關率、Boss counter 與六階段 coverage；可一鍵套用三個 stable character IDs，固定 L3 規則與 Campaign save 均不受影響。
- Squad Compare 會即時並排目前手動隊伍與 audit 隊伍的 Counter、六階段 coverage、共用成員及每階段數值差；換人後立即更新 `KEEP／SWAP`，可一鍵恢復 audit 隊伍。比較只描述 gameplay 結構，不宣稱真實成功率。
- Challenge Strategy Briefing 直接讀取正式 14 class rule／telegraph、Challenge `R01／R04／R07` branch schedule 與目前三人固定 M3 技能，顯示每回合受壓資源、Reactive、全隊疲勞恢復、低 Energy 一般技能、Stage／Counter 與結構缺口；三種技能缺口可一鍵開啟 Crew Capability filter 與單席替換候選。
- Strategy Gap Candidates 完整比較每位 capability 候選在三個席位的替換結果，依缺口、Stage、Counter、技能結構與 stable ID 排序；顯示五項 before→after，可套用與復原上一隊。這是 `NOT AUDIT VERIFIED` 結構預覽，不執行 runtime 或預測成功率。
- HAS-GAPS draft 會直接在 Route 顯示最佳單席修補：三種技能缺口路由到正式 Crew capability，Stage 缺口則比較其餘 297 名角色的三個席位。套用與一層 Undo 會即時更新 draft／portfolio 並可跨 reload 保存；結果仍標示 `NOT AUDIT VERIFIED`。
- Challenge Portfolio 內建 Repair Queue，顯示目前位置、四種剩餘 gap 數與本次 session 修補數；可一鍵前往下一個 stable-ID HAS-GAPS draft。Queue 會清除不相容 Route filter，但只載入既有 draft，仍需玩家逐筆確認後才套用修補。
- Drafted Boss 可在 Route 按需執行 deterministic Draft Verification；它重用正式 Challenge audit autoplay，顯示輸入 stable IDs、CLEAR／FAILED、score、grade 與 round。結果只存在本次畫面，換隊或 reload 即清除，且不寫入 local best、Campaign 或 static audit snapshot。
- FAILED 驗證會直接連到既有 Top Repair：先顯示 priority structural gap 與預計替換 stable IDs，套用後以 `RE-VERIFY` 比較修補前後 score／round。結果明確分為 `REPAIR CLEAR` 或 `STILL FAILED`，不把結構補齊誤當成 runtime 通關。
- `STILL FAILED` 可按需執行 Runtime Repair Escalation：評估 59 組尚未嘗試的單席 structural candidates，dropdown 顯示 top 6。選取時會在 Apply 前即時顯示 current→candidate score／round delta、slot replacement、Counter／Stage／gaps，並區分 `CLEAR／IMPROVED FAILED／NO IMPROVEMENT`；清單保留無改善對照但不預設選取，若全部失敗會明確顯示 `0 CLEAR`。
- CLEAR repair 會先顯示 local-best settlement preview，不會因候選評估或 RE-VERIFY 自動寫分。玩家可取消並復原，或明確確認後才將 grade／score／round／team stable IDs 與 `DRAFT_CONFIRMATION` 來源寫入 `owm.challenge.v3`；preview 不跨 reload，Campaign 與 static audit 不受影響。
- Challenge Route 可依 `OPERATION／DRAFT_CONFIRMATION` source 與完成狀態交集篩選，頂部同步顯示兩種來源的 best／clear 統計。
- Challenge 的「挑戰存檔」Tab 可產生、下載與匯入獨立 `OWM_CHALLENGE_SAVE` v3 JSON；v1／v2 會 migration，匯入時重驗 Boss／Character FK 與三人唯一性。Import 會先顯示 best／source／draft 的目前→匯入後數量、added／changed／removed stable IDs，確認前不寫檔；確認後提供本次 session 一層 Undo。Campaign JSON 會被拒絕，`owm.campaign.v5` 不會被讀寫。
- 每個 Challenge Boss 各自保存目前三人規劃；Route 會顯示 draft stable IDs、Counter、Stage 與結構缺口並可一鍵重新載入。單純瀏覽未規劃 Boss 不建立 draft；手動換人、Candidate 套用／復原及 audit restore 後才更新，切回或 reload 可恢復，同時不覆蓋該 Boss 的實際 local best team。
- UNDRAFTED Boss 可直接在 Route 採用 deterministic audit 的三人推薦建立 draft；domain 會驗證 Boss、success 與角色 FK。建立後立即顯示結構摘要，但 audit runtime 成功與 Strategy structural gap 仍分開呈現。
- Challenge briefing 會統計全 100 Boss 的 DRAFTED、GAP-FREE 與 HAS GAPS；Route 可依 readiness 或四種 gap type 篩選並以 Readiness 排序。所有數字只表示固定 M3 隊伍的 Strategy 結構，不取代 runtime audit 或預測成功率。
- 15 個 Mission 各有雙語 Operation Profile：虛構場址、weather／Sea State、work permit、最低 Mastery、PPE、access requirement、允許船舶、初始天候與動員成本。
- Campaign 部署使用 5 項 Operation Readiness gate：玩家明確確認 permit／PPE／access，系統核對 vessel 與至少兩名技師的 Mastery；未達 5/5 不可開始任務。
- Gate 通過後，Profile 的 initial weather window 與 mobilization cost 會進入正式 runtime；所有值均標示為 gameplay abstraction，並非現場限制或工作授權。Sandbox 不套用此 gate。
- Equipment inventory 將 200 項裝備分為 L1–L5、每階 40 項；新 Campaign 起始持有全部 L1，完成第 3／6／9／12 關依序解鎖 L2–L5。
- Campaign loadout selector 會顯示但鎖定尚未持有的 Equipment／SPARES；Collection 可稽核各 tier 與 category 持有數，Sandbox 則開放全部 200 項。
- 每次 Campaign 任務會對實際攜帶的 Equipment／SPARES 產生 deterministic Condition 損耗；低於 25% 時不可出勤，但可在 Deployment 選取並完整維修。
- 新 Campaign 起始有 80 Maintenance Credits（MNT），任務成功或失敗都會取得整備資源；完整修復費用依缺損與 equipment tier 計算。所有數值都是 gameplay abstraction。
- Crew fatigue 會跨 Mission 保存；100% Exhausted 技師不可部署，玩家可改派其他角色或消耗 Rest Token（RST）恢復。未出勤 Reserve 與返航隊員會依角色／船舶規則自動恢復。
- Deployment 顯示三名技師的 Stable／Tired／Critical／Exhausted、fatigue meter 與 Rest 操作；Debrief 顯示任務末→返航後疲勞，Collection 彙整 300 人 readiness。
- 首次遊玩 guided onboarding 依序聚焦 Deployment、Mission event deck、Reactive window、Diagnosis gate 與 Debrief；首發 L1 隊伍先學會承受完整事件，Track 達 L3 後才開放 Reactive 角色卡。支援跳過、重播與完成狀態保存。
- 完成第 15 關後顯示 Campaign completion summary：整體評級、平均最佳分數、完成章節、S 評級數與 L5 技師數；全部任務保留可重玩。
- 內建 15 關 deterministic balance simulator，以相同 L1/L3/L5 career-role 混合隊伍切換 Mastery profile，共執行 45 組實際 runtime autoplay；Readiness progression 為 L1 `6/15`、L3 `12/15`、L5 `15/15`。Maintenance 與 Crew readiness economy gates 另驗證 L5 連續路線仍可 15/15 出勤。
- 可配置任務裝備、SPARES 與 CTV／SOV／USV；正確配置提供 evidence／reliability，船舶影響每回合天候、安全與疲勞。
- 任務作業：技能、AP、Energy、cooldown、fatigue、換班、天候窗口、安全、證據與成本同步運作。
- 14 種 Boss class 各有不同回合事件，分別影響 fatigue、safety、weather、evidence、reliability、progress、cost 或 Energy。
- 14 種事件各有圖示、代碼、色彩、影響資源與 Phaser telegraph pulse；Operation Log 同步保留文字結果。
- 新增天候惡化、備品延誤、二次故障、通訊中斷與誤警報五類 Mission branch event。
- 風險事件後進入 Reactive window；玩家可消耗角色 AP／Energy／cooldown 降低事件衝擊，或承受完整後果。
- 15 個 Mission 各自定義三段 deterministic event deck，指定觸發回合、事件種類與 intensity；Chapter 01 由 `×0.75` 起步，Chapter 05 最高升至 `×2.00`。
- Deployment 與 Mission Control 會預告 event deck；事件窗口、penalty preview 與 Operation Log 均顯示實際 intensity。
- Diagnose 階段加入工程判斷 gate；正確判斷建立證據，錯誤判斷會降低安全。
- Detect → Diagnose → Isolate → Repair → Verify → Restore 六工程階段；Counter Faction 與階段專長各提供 `Power × 1.25`。
- 任務結算：依完成度、安全、證據、時間與疲勞計算總分及 S–D 評級。
- Campaign progress v5 使用 `owm.campaign.v5` 保存 XP、角色 XP、最佳分數、任務解鎖、`ownedEquipmentIds`、MNT、sparse `equipmentCondition`、RST、sparse `crewFatigue`、6 座風機 fleet state 與最多最近 30 筆 Fleet Operations History；Career Track XP 仍由角色 XP 派生。Collection 可產生、下載與匯入 v5 JSON，既有 v1/v2/v3/v4 存檔會自動 migration；onboarding 仍獨立保存於 `owm.onboarding.v1`。
- Boss Challenge 與 Campaign 完全隔離：不修改 XP、MNT、RST、持久疲勞、Equipment Condition、任務或角色解鎖；同分時依完成狀態與較少回合決定 local best。
- Sandbox 可自由選擇全部 100 個 Boss、開放全部技能與 L4/L5 perks，並可自由配置 200 項裝備與情境資源；不保存挑戰分數，也不修改 Campaign save。
- Collection 以 Crew／Resources Tab 呈現全部 300 名角色、Career lock、Track XP／下一階門檻、150 張現有 Source Art、個人 Mastery、readiness、Equipment inventory 與存檔；Crew 支援 faction filter、搜尋與每頁 5 張卡牌。
- Knowledge Codex 提供 15 筆雙語工程與安全摘要；每完成一個 Mission 解鎖對應條目，狀態直接由 Campaign progress 推導。
- Mastery L1 開放 Passive／Skill 1，L2 開放 Skill 2，L3 開放 Ultimate。
- Mastery L4「專家整備」提供個人初始 Energy +2、團隊 Evidence +3；L5「資深防護」提供個人回合疲勞傷害 -2、團隊 Reliability +4。
- Campaign 依角色實際 XP 啟用 perks；Sandbox 固定開放全部技能與 L4/L5 perks，且不修改 Campaign save。
- Phaser 離岸風場動態視覺與 React 卡牌／任務 UI 分離；寫實背景使用 `public/assets/environment/offshore-field-feed_v001.png`，三葉片 geometry 由 pure TypeScript 產生。
- 角色來源原畫與動態卡框分離；已有 P01 時載入正式 Web preview，缺件時仍使用明確 placeholder。
- 遊戲由 active Source Art index 選擇核准版本或 review candidate；目前 150 名角色可在部署與換班介面載入。
- 繁體中文／英文介面、文字化疲勞狀態與鍵盤 focus 樣式。
- 支援「降低動態」模式；關閉風機／光暈循環動畫與強烈事件 pulse，但保留靜態圖形、代碼及文字提示。
- 768px 窄螢幕使用單欄任務流程、44px touch target 與固定回合操作列，不再依賴 1180px 桌面最小寬度。
- 預設隊伍使用三名合法 L1：`CHR-GOV-001`、`CHR-MAR-176`、`CHR-OMI-221`；不再讓新 Campaign 借用尚未解鎖的 L3 角色。
- 驗證 300 角色、500 技能、1,200 關聯、200 裝備、100 Boss、150 場景、6 座風機、15 個任務指派與 3,000 prompts。

## 快速啟動

```powershell
pnpm install
pnpm dev
```

瀏覽器開啟：`http://127.0.0.1:4173`

## 驗證與建置

```powershell
.\validate_project.ps1
```

此指令會先更新 100 Boss Challenge audit snapshot，再同步 JSON、執行資料 QA、Vitest、45 組 Campaign runtime、maintenance／Crew readiness gates、TypeScript typecheck 與 production build。建置結果位於 `dist/`。

只執行 Campaign balance simulation：

```powershell
pnpm simulate:balance
```

結果輸出至 `balance/campaign-balance-report.md` 與 `.json`。這是 gameplay simulation，不是實際風場、SCADA 或實驗數據。

只執行 Boss Challenge balance audit：

```powershell
pnpm simulate:challenge
```

結果輸出至 `balance/boss-challenge-balance-report.md` 與 `.json`，同樣只代表 deterministic gameplay simulation。

需要重跑實際瀏覽器流程時：

```powershell
pnpm dev -- --port 4173
pnpm smoke:gameplay
pnpm smoke:challenge
pnpm smoke:onboarding
pnpm smoke:layout
pnpm smoke:operation:compact
pnpm smoke:sandbox
pnpm smoke:scene
pnpm smoke:art
```

## 專案結構

```text
src/
├─ components/OffshoreScene.tsx   # Phaser 動態風場
├─ components/OnboardingGuide.tsx # 五段首次遊玩導覽
├─ domain/data.ts                 # JSON 載入與 runtime 驗證
├─ domain/runtime.ts              # 疲勞、技能、MissionResolver
├─ domain/campaign.ts             # Readiness、Inventory、Maintenance、Crew Rest、Fleet Operations History、獎勵與 v1/v2/v3/v4→v5 migration
├─ domain/windFarm.ts             # 風機 availability／reliability／backlog 與任務結算
├─ domain/balance.ts              # 15 關 deterministic autoplay 與 progression gates
├─ domain/onboarding.ts           # 獨立 persistence 與導覽 state machine
├─ domain/bossChallenge.ts        # 固定規則、各 Boss local best 與獨立 persistence
├─ domain/bossChallengeBalance.ts # 100 Boss deterministic candidate-team audit
├─ domain/bossChallengeRoute.ts   # Route filters、排序與 audit snapshot mapping
├─ domain/bossChallengeSquad.ts   # Audit 推薦三人隊伍、counter 與六階段 coverage
├─ domain/bossChallengeStrategy.ts # 14 class 壓力、branch schedule 與目前隊伍技能準備
├─ domain/dispatchForecast.ts     # 出勤前 Condition／MNT／Crew／RST 預測
├─ domain/careerTrack.ts          # 60 Track 的 L1–L5 availability、XP 與隊伍正規化
├─ domain/progression.ts          # Career／Mastery 共用五階 XP 門檻
├─ domain/crewRotation.ts         # 已解鎖 roster readiness filter 與 deterministic 三人輪班建議
├─ domain/sandboxScenario.ts      # 沙盒海況、資源、回合與 Vessel protection session projection
├─ domain/sceneRouting.ts         # Mission／Sandbox Scene metadata、版本化資產與 fallback provenance
├─ domain/turbineGeometry.ts      # 三葉片同軸 rotor 幾何
├─ domain/*.test.ts               # domain tests
├─ App.tsx                        # 單頁遊戲流程
└─ styles.css                     # Responsive desktop game UI
json/                             # Source of Truth
├─ bossChallengeAudit.json        # 100 Boss gates PASS 的遊戲用稽核 snapshot
├─ sceneAssets.json               # Scene stable-ID 專屬圖片與 verified fallback index
├─ missions.json                  # 任務、Operation Profile、診斷選項與解鎖鏈
├─ codex.json                     # 任務解鎖式雙語工程知識摘要
└─ vessels.json                   # 船舶 gameplay abstraction
public/data/                      # 啟動/建置前自動同步
tools/sync-data.mjs
tools/sync-art.mjs
tools/smoke-gameplay.mjs
tools/smoke-challenge.mjs
tools/smoke-onboarding.mjs
tools/smoke-layout.mjs
tools/smoke-sandbox-scenario.mjs
tools/smoke-scene-routing.mjs
tools/simulate-campaign-balance.ts
tools/simulate-boss-challenge-balance.ts
tools/import-art-correction.mjs
tools/apply-visual-qa-overrides.mjs
tools/validate_owm_data.py
balance/                           # 可稽核的 Markdown／JSON simulation report
```

## 尚未完成的資產門檻

目前美術範圍定為 300 名角色各 1 張 P01，不生產每名角色的 P02–P10。全部 prompt 已套用 [Engineering Background Guardrails](assets/source-art/PROMPT_GUARDRAILS.md)，要求每座完整 rotor 恰好三支葉片、120° 等間距且風機幾何合理。`BATCH-P01-001` 至 `BATCH-P01-019` 已原子匯入 180 張 Web preview；active 版本皆通過 2:3 技術 QA，180 名角色已完成遊戲載入 smoke test。Batch019 的 QA JSON 明確記錄 `userVisualApproval=false`、`Visual Review Required`；尚未核准的 preview 仍需人工確認，全部 180 張也都需升至 4096×6144，才符合 production source resolution。Scene metadata 為 150/150；目前 29/150 Scene 有 direct runtime field-feed，其餘透過已驗證 fallback 顯示。
