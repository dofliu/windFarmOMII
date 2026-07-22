# Changelog

## 3.32.0-web-audio-engine - 2026-07-23

- Built pure Web Audio API Synthesizer & Audio Asset Engine (`src/domain/audio.ts`) with zero external file dependencies.
- Added procedural ocean wave and wind ambient soundscape synthesizer (8s wave LFO modulation).
- Added theme-reactive ambient pad harmonies (Daylight A Major pad / Deep Ops A Minor sub-bass drone).
- Added interactive Sound FX: UI click, theme toggle chime, art pack switch arpeggio, PTW checklist confirmation, maritime horn ship dispatch, round advance radar pulse, and victory chords.
- Integrated Audio Control button (`🔊 Sound` / `🔇 Muted`) in Topbar controls with localStorage persistence.
- Verified: `npm run build` passes with zero errors; verified end-to-end audio toggling and SFX triggers.

## 3.31.0-v2-shinkai-art-engine - 2026-07-22

- Built and integrated the V2 Shinkai Art Pack & Dual Art Engine (`public/assets/source-art/v2-shinkai/`).
- Added persistent Art Pack Switcher button (`✨ 新海誠動漫` / `🎨 經典圖庫`) in topbar controls with `localStorage` state persistence.
- Implemented smooth art fallback protection: dynamically resolves V2 Shinkai assets while cleanly falling back to classic P01 art when a character is in queue.
- Generated initial representative Makoto Shinkai style character assets for all factions with luminous volumetric lighting, vibrant anime aesthetics, diverse poses, and attractive designs.
- Preserved 100% of existing P01 classic artwork (`public/assets/source-art/p01/`) without deleting or overwriting any original assets.
- Compacted topbar header and page headings, pulling main interactive panels up by 80-100px for single-screen optimization.
- Verified: `npm run build` passes with zero errors; verified cross-theme and cross-artpack dynamic switching end-to-end.

## 3.30.0-ui-redesign-daylight-deepops - 2026-07-22

- Completed full UI redesign and theme system replacement driven by `design.md` specification.
- Integrated dual-theme engine (`[data-theme="daylight"]` default and `[data-theme="deepops"]` dark mode) with CSS variable tokens (`--owm-surface`, `--owm-border`, `--owm-text`, `--owm-accent`, `--owm-mono`, `--owm-round`).
- Added persistent Theme Switcher (`☀️ Daylight` / `🌙 Deep Ops`) in top header control bar.
- Refactored `.topbar` to single-row compact flex layout (44px min-height) preventing header line-wrapping and button overlapping.
- Systematically migrated all page sub-panels (Deployment, Fleet Dispatch, Sandbox Scenario Lab, Collection, Codex, Boss Challenge) from hardcoded dark styles to responsive CSS theme tokens.
- Optimized character collection card thumbnail rendering using `background-image` CSS containers to prevent 404 image request failures.
- Compacted page headings and top margins to pull primary content upwards and maximize visible screen space on 1080p and 800p displays.
- Verified: `pnpm validate:art`, `pnpm build`, cross-theme toggle rendering, and end-to-end game flow verification.

## 3.29.0-source-art-batch022-r7-samples - 2026-07-19

- Generated three representative `BATCH-P01-022` R7 Source Art QA samples before full-batch production/import: `CHR-GOV-031` masculine, `CHR-ACA-071` androgynous, and `CHR-GOV-032` feminine.
- Added `assets/source-art/qa/BATCH-P01-022-r7-samples/BATCH-P01-022-r7-sample-contact-sheet.png` and `BATCH-P01-022-r7-sample-qa.json`.
- Rejected `CHR-GOV-032` v001 as an aspect-ratio failure (`864x1821`) and regenerated it as a valid `1024x1536` v002 candidate; the failed file remains retained only as QA evidence.
- Visual direction check: current candidates vary age, face architecture, body build, task pose, camera framing, and tool interaction more clearly than the repeated cute-heroine pattern; all remain `Sample Review Required`.
- Guardrail: sample files remain isolated from the public active Source Art index; no active Source Art file, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Active Source Art remains `210/300`, with `90/300` pending.
- Verified: sample dimension check, contact sheet render, `pnpm validate:art`, `pnpm build`.

## 3.28.0-source-art-r7-casting-variety - 2026-07-19

- Upgraded all 90 pending P01 Source Art prompts to `OWM-P01-R7-CASTING-VARIETY-ANTI-CLONE`.
- R7 targets the observed visual monotony where generated characters remain attractive but collapse toward the same young female lead, similar face, and similar pose with different PPE/backgrounds.
- Strengthened prompt guardrails so identity must be decided before outfit/background: age decade, facial architecture, eye/nose/mouth/jaw proportions, cheek mass, neck/shoulder proportion, skin tone, hairline/hairstyle, body build, posture line, action silhouette, expression, camera angle, hand gesture, and tool interaction.
- Strengthened batch gates to require at least 9 unique pose silhouettes, 7 camera angles, 8 body types, and 5 non-glamour task poses while preserving the 4 masculine / 2 androgynous / max 4 feminine workforce mix.
- Added R7 negative prompts against copied heroine faces, only outfit/background changes, glamour/beauty poses, soft idol face in masculine or androgynous slots, and repeated cute expressions.
- Exported `BATCH-P01-022` as the first R7 generation pack: JSON prompt pack, Markdown prompt pack, and HTML casting plan.
- Guardrail: pending prompt metadata, validation gates, and generation-pack workflow only; no active Source Art file, public Source Art index entry, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 3.27.0-source-art-batch016-r6-active-import - 2026-07-19

- Imported `BATCH-P01-016` R6 samples as active web-preview Source Art using canonical `p01/*_v001.png` filenames.
- Active Source Art increased from `200/300` to `210/300`; pending decreased from `100/300` to `90/300`.
- Batch016 QA remains `Visual Review Required`: all 10 images are `1024x1536`, pass P01 2:3 aspect, and remain production-upscale pending; no user visual approval was asserted.
- Fixed `qa-p01-batch.ps1` so batch-level QA no longer reports `Web Preview Approved` unless `-UserVisualApproval` is explicitly supplied.
- Public Source Art index now exposes 210 active entries and includes all 10 Batch016 characters.
- Guardrail: asset/index import and QA-script correction only; no gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 3.26.0-source-art-r6-batch016-full-samples - 2026-07-19

- Generated the remaining 7 R6 Batch016 QA samples and completed the full 10-image Batch016 R6 sample set.
- Added `assets/source-art/qa/BATCH-P01-016-r6-samples/BATCH-P01-016-r6-full-contact-sheet.png` and `BATCH-P01-016-r6-full-sample-qa.json`.
- All 10 current Batch016 R6 candidates are `1024x1536` and pass the 2:3 P01 aspect check; the earlier `CHR-GOV-023` ultra-tall v001 remains retained only as failed QA evidence.
- Full sample coverage is masculine 4 / androgynous 2 / feminine 4, with 10 unique age impressions, 10 face shapes, 10 pose silhouettes, and 10 camera angles.
- Guardrail: sample files remain isolated from the public active Source Art index; no generated active Source Art file, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: sample dimension check, contact sheet render, public index sample-reference check, `pnpm validate:art`, `pnpm build`.

## 3.25.0-source-art-r6-three-sample-review - 2026-07-19

- Generated three representative R6 Batch016 Source Art QA samples before full-batch production: `CHR-GOV-023` masculine, `CHR-DEV-108` androgynous, and `CHR-OMI-242` mature feminine.
- Rejected the first `CHR-GOV-023` sample as an aspect-ratio failure (`864x1821`), regenerated it as a valid 2:3 candidate (`1024x1536`), and preserved the failed file only as QA evidence.
- Added `assets/source-art/qa/BATCH-P01-016-r6-samples/BATCH-P01-016-r6-sample-contact-sheet.png` and `BATCH-P01-016-r6-sample-qa.json`.
- All three current candidate samples are `1024x1536`, visually distinct in casting/body/pose, and remain `Sample Review Required`; no sample was imported into the active public Source Art index.
- Guardrail: no generated active Source Art file, public Source Art index entry, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: sample dimension check, public index sample-reference check, `pnpm validate:art`.

## 3.24.0-source-art-r6-batch016-pack - 2026-07-19

- Exported a pre-generation R6 review pack for `BATCH-P01-016`: `BATCH-P01-016-r6-generation-pack.json`, `BATCH-P01-016-r6-generation-pack.md`, and `BATCH-P01-016-r6-casting-plan.html`.
- Added reusable scripts: `art:r6-sanitize` for removing contradictory feminine facial-hair / sideburn cues from pending R6 profiles, and `art:r6-pack` for exporting batch prompt packs.
- Sanitized 9 pending feminine R6 profiles with contradictory beard / moustache / sideburn cues, then regenerated affected batch manifests.
- Batch016 now has a reviewable diversity plan before image generation: masculine 4 / androgynous 2 / feminine 4, with 10 unique age impressions, 10 face shapes, 10 pose silhouettes, and 10 camera angles.
- Strengthened `validate:art` to fail feminine R6 profiles that still contain contradictory beard, moustache, or sideburn cues.
- Guardrail: no generated active Source Art file, public Source Art index, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 3.23.0-source-art-r6-workforce-diversity - 2026-07-18

- Upgraded pending/future P01 Source Art prompts to `OWM-P01-R6-WORKFORCE-DIVERSITY-ANTI-WAIFU`.
- Rebuilt all 100 pending P01 prompts and batch manifests so future generation treats each 10-image batch as a real offshore-wind workforce ensemble instead of one repeated cute heroine model in different PPE/backgrounds.
- R6 requires at least 4 masculine/adult-man or clearly masculine adult professionals, at least 2 androgynous adult professionals, no more than 4 feminine adult professionals, at least 8 age impressions, and at least 3 mature-adult impressions per 10-image batch.
- Strengthened character negative prompts against waifu / bishoujo / idol heroine / generic anime girl / default pretty heroine / feminine-face collapse in masculine or androgynous slots.
- Strengthened `validate:art` to verify R6 casting locks, anti-waifu negative prompts, batch age diversity, mature-adult coverage, and structured profile alignment.
- Guardrail: no generated active Source Art file, public Source Art index, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 3.22.0-source-art-safe-frame-rendering - 2026-07-18

- Changed Deployment, Operation, and Collection Source Art rendering from crop-prone `object-fit: cover` to full-body-preserving `object-fit: contain` with centered positioning and safe insets.
- Updated Collection card images to use absolute safe-frame layout so intrinsic image height cannot overflow the card artwork frame.
- Strengthened `smoke:gameplay` to verify computed `object-fit: contain`, active file path, successful decode, natural 2:3 aspect, rendered size, and image bounds inside the Source Art frame.
- Guardrail: no active Source Art file, Source Art index schema, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## 3.21.0-source-art-runtime-surface-consistency - 2026-07-18

- Strengthened `smoke:gameplay` to verify Source Art consistency across Deployment, Operation, and Collection surfaces against `public/assets/source-art/p01/index.json`.
- The new check compares `data-source-art-*` metadata, active image file path, successful image decode, rendered size, and natural 2:3 aspect.
- Added direct Batch021 runtime coverage by asserting the Collection card for `CHR-MAR-204`.
- Guardrail: no active Source Art file, Source Art index schema, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Active Source Art remains `200/300`, with `100/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`.

## 3.20.0-source-art-batch021-r5-full-import - 2026-07-18

- Completed the remaining 8 R5 single-identity Batch021 P01 images and imported Batch021 as a full active web-preview Source Art batch.
- Active Source Art increased from `192/300` to `200/300`; pending decreased to `100/300`; Batch021 is now 10 generated / 0 pending.
- Added full Batch021 QA JSON and contact sheet for visual review.
- Visual direction check: Batch021 now varies age, face structure, body type, camera angle, task pose, and tool handling more clearly than the earlier repeated cute-heroine direction; all 10 remain `Visual Review Required`.
- Guardrail: asset/index import only; no gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 3.19.0-source-art-batch021-r5-partial-import - 2026-07-18

- Imported the first 2 R5 single-identity Batch021 P01 images as active web-preview Source Art: `CHR-MAR-204` and `CHR-OMI-249`.
- Active Source Art increased from `190/300` to `192/300`; pending decreased to `108/300`; Batch021 is now 2 generated / 8 pending.
- Added partial Batch021 QA JSON and contact sheet for visual review before expanding the rest of the batch.
- Updated `validate:art` so partially imported R5 batches are still validated as complete 10-profile diversity batches instead of requiring every remaining pending subset to contain 10 items.
- Guardrail: asset/index import only; no gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 3.18.0-source-art-r5-single-identity-prompts - 2026-07-18

- Cleaned all 110 pending R5 P01 Source Art prompts so each image has exactly one explicit character identity direction instead of three competing profile paragraphs.
- Preserved the R5 pending mix at masculine 44 / feminine 44 / androgynous 22, with no legacy `neutral confident stance` text remaining.
- Strengthened `validate:art` to fail pending R5 prompts with zero or multiple current character-direction blocks, or with legacy neutral stance wording.
- Guardrail: no generated active Source Art file, public active art index, gameplay logic, save schema, score formula, reward settlement, or balance rule changed.
- Source Art remains `190/300`, with `110/300` pending.
- Verified: `pnpm validate:art`, `pnpm build`.

## 3.17.0-collection-debrief-tabs-a11y - 2026-07-18

- Upgraded Collection tabs to real `tablist` / `tab` / `tabpanel` semantics with stable ARIA wiring and keyboard navigation.
- Upgraded Debrief Review / Score / Log tabs to real `tablist` / `tab` / `tabpanel` semantics with stable ARIA wiring and keyboard navigation.
- Extended `smoke:layout` to verify Collection tab metadata and keyboard switching; extended `smoke:gameplay` to verify Debrief tab metadata and keyboard switching.
- Guardrail: no Campaign save schema, reward settlement, score formula, Collection data projection, Source Art file/index schema, or balance rule changed.
- Source Art remains `190/300`, with `110/300` pending.
- Verified: `pnpm typecheck`, `pnpm smoke:layout`, `pnpm smoke:gameplay`, `pnpm build`.

## 3.16.0-operation-guide-notice-pulse - 2026-07-18

- Added a visible Operation GUIDE notice after clicking the GUIDE CTA, showing the target label and stable target test ID.
- Added session-only active guide metadata to the decision prompt: `data-decision-guide-active`, `data-decision-guide-active-target`, `data-decision-guide-active-label`, and `data-decision-guide-pulse`.
- Compact Operation smoke now verifies guide notice text, notice metadata, prompt active metadata, target highlight/focus, and no 1366x768 overflow.
- Guardrail: no Operation settlement path, team skill recommendation formula, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule changed.
- Source Art remains `190/300`; Batch021 R5 image-only task did not import new active art.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## 3.15.0-operation-team-skill-rec - 2026-07-18

- Upgraded Operation `NEXT DECISION: ACT` recommendation from selected-card-only to all deployed crew members.
- The recommended skill CTA now exposes `data-recommended-actor-index`, `data-recommended-character-id`, `data-recommended-skill-id`, reason, power, and stage result; clicking it selects the recommended actor and uses the existing skill settlement path.
- Compact Operation and full gameplay smoke verify team-aware recommendation metadata and click-through settlement while keeping 1366x768 / 1440x900 one-screen layouts intact.
- Guardrail: no skill power formula, mission settlement, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule changed.
- Source Art remains `190/300`; Batch021 R5 image-only task is running separately.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## 3.14.0-operation-decision-guide-cta - 2026-07-18

- Added a compact Operation `NEXT DECISION` GUIDE CTA with stable target metadata: `data-decision-guide-target` and `data-decision-guide-label`.
- GUIDE highlights and focuses the existing actionable target for ACT/DIAG/EVENT/RISK/ROUND decisions: recommended skill, diagnosis recommendation, Branch Reactive/Accept, or End Round.
- Compact Operation smoke now verifies guide metadata, target parity, target highlight, and no 1366x768 overflow; full gameplay and layout smoke still pass.
- Guardrail: no Operation settlement path, skill recommendation formula, diagnosis rule, branch resolution, round forecast, Campaign save schema, Source Art file/index schema, or balance rule changed.
- Source Art remains `190/300`; Batch021 R5 art-only task is running separately.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm build`.

## 3.13.0-deployment-tabs-a11y-keyboard - 2026-07-18

- Upgraded Deployment primary tabs to real `tablist` / `tab` / `tabpanel` semantics with stable ARIA wiring and roving focus.
- Added ArrowLeft / ArrowRight / Home / End keyboard navigation for Deployment tabs.
- Extended `smoke:layout` to verify tab role metadata, `aria-controls`, tabpanel role, and keyboard switching before existing one-screen layout checks.
- Delegated Source Art `BATCH-P01-021` to a new R5 art-only background task after interrupting the stale R4 task.
- Guardrail: no gameplay settlement, deployment readiness formula, Campaign save schema, Source Art index schema, active Source Art file, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:layout`, `pnpm build`.

## 3.12.0-source-art-r5-anti-clone-diversity - 2026-07-18

- Upgraded pending/future P01 Source Art rules to `OWM-P01-R5-ANTI-CLONE-DIVERSITY-ENGINEERING`.
- Rebuilt all 110 pending P01 prompts and batch manifests so profile slots no longer repeat across batches; each pending character now has a unique anti-clone diversity signature.
- Strengthened `validate:art` to fail duplicate pending diversity signatures and require stricter per-batch uniqueness for pose, camera angle, hairstyle, expression, face shape, and body type.
- Generated R3/R4 artwork remains legacy-valid; active Source Art remains `190/300`, pending remains `110/300`.
- Guardrail: no active Source Art file, Source Art index schema, gameplay logic, Campaign save schema, or balance rule changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 3.11.0-source-art-batch020-r4-diverse-import - 2026-07-18

- Generated and imported Source Art `BATCH-P01-020` as active P01 web-preview assets, raising active coverage from `180/300` to `190/300`.
- Batch020 follows the structured R4 diversity gate: 3 masculine, 2 androgynous, and 5 feminine-presenting adult offshore-wind professionals with varied face shapes, body types, pose silhouettes, expressions, camera angles, and tool handling.
- Added Batch020 QA output and contact sheet; all 10 active images are `1024×1536`, aspect `Pass`, `Visual Review Required`, and `Upscale Pending`.
- Guardrail: no gameplay logic, Reactive recommendation sort, branch resolution, mission runtime settlement, Campaign save schema, Source Art index schema, or balance rule changed.
- Verified: `pnpm sync:art`, `pnpm validate:art`, `pnpm smoke:art`.

## 3.10.0-operation-branch-reactive-rec-reason - 2026-07-18

- Added visible and stable reason metadata to the Operation Branch Event `REC` Reactive CTA: `data-recommended-reactive-reason`, `data-recommended-reactive-power`, and `data-recommended-reactive-energy-cost`.
- Gameplay smoke now verifies the Branch Event recommendation has stable character/skill IDs, matching visible reason, numeric power/energy metadata, and still mitigates branch loss with `BranchGuard`.
- Layout smoke verifies the added reason copy keeps the one-screen layout intact.
- Background Source Art Batch020 completed; active P01 Source Art increased from `180/300` to `190/300`.
- Guardrail: no Reactive recommendation sort, branch resolution, event penalty formula, mission runtime settlement, Campaign save schema, Source Art file, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate:art`, `pnpm smoke:art`, `pnpm build`.

## 3.09.0-operation-diagnosis-rec-reason - 2026-07-18

- Added visible and stable reason metadata to the Operation Diagnosis `REC` CTA through `data-recommended-diagnosis-reason` and `diagnosis-rec-reason`.
- Compact Operation smoke and full gameplay smoke now verify the diagnosis recommendation has a stable ID, matching visible reason, and still executes the existing evidence gain path.
- Guardrail: no diagnosis scoring rule, evidence reward, mission runtime settlement, Campaign save schema, Source Art file, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## 3.08.0-operation-rec-skill-reason - 2026-07-18

- Added visible and stable reason metadata to the Operation `REC` recommended skill CTA: `data-recommended-skill-reason`, `data-recommended-skill-power`, and `data-recommended-skill-stage-result`.
- The reason is derived from the existing `resolveTeamSkill` forecast and explains highest available power, applied power, and whether the action clears or leaves the current stage.
- Compact Operation smoke and full gameplay smoke now verify the reason metadata matches the rendered `recommended-skill-reason`, power is numeric, and stage result is `clear` or `remains`.
- Guardrail: no skill recommendation formula, skill settlement, Operation decision projection, Campaign save schema, Source Art file, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## 3.07.0-operation-decision-reason-metadata - 2026-07-18

- Added stable Operation `NEXT DECISION` telemetry: `data-decision-code`, `data-decision-action`, `data-decision-reason`, and `data-decision-meta`.
- Browser smoke now verifies the decision metadata matches the rendered action/reason and uses a valid ACT/DIAG/EVENT/RISK/ROUND code.
- Guardrail: no Operation settlement path, skill recommendation formula, diagnosis rule, round forecast, Campaign save schema, Source Art file, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm build`.

## 3.06.0-route-readiness-next-reason - 2026-07-18

- Added Route Readiness Carryover primary CTA reason metadata through `data-next-readiness-reason`.
- The primary CTA now displays the active reason for the next readiness step: planning confirmation while pending, existing Campaign dispatch flow when READY.
- `smoke:gameplay` verifies pending Permit reason, post-permit PPE reason, and READY deploy reason; `smoke:deployment:compact` verifies the added copy keeps the 1366×768 one-page Deployment layout.
- Guardrail: no Campaign save schema, readiness formula, deployment guard, route selection logic, Source Art file, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:deployment:compact`, `pnpm build`.

## 3.05.0-debrief-next-action-reason - 2026-07-18

- Added Debrief Campaign Continue recommendation metadata: `data-recommended-continue-action`, current mission ID, next mission ID, available mission count, and per-CTA `data-continue-reason`.
- The visible Debrief continue summary now explains why the next mission is recommended after settlement.
- `smoke:gameplay` now verifies the post-debrief recommendation from `MSN-TUT-001` to unlocked `MSN-TUT-002`, including next/return/replay reason metadata.
- Guardrail: no Campaign save schema, reward settlement, mission unlock formula, route selection logic, Source Art file, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`.

## 3.04.0-operation-scene-asset-telemetry - 2026-07-18

- Added stable scene asset telemetry to the Operation Phaser field-feed host: requested Scene ID, source Scene ID, asset URL, fallback URL, asset version, QA status, and availability.
- `smoke:operation:compact` now verifies the central Operation field-feed resolves to the expected `SCN003` integrated `offshore-field-feed_ai_v004.png` asset with `ENGINEERING_QA_PASSED`.
- Guardrail: no Source Art file, Source Art index schema, Campaign save schema, gameplay settlement, scene route data, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:operation:compact`, `pnpm build`.

## 3.03.0-source-art-diversity-profile-gate - 2026-07-18

- Added structured `diversityProfile` metadata to all 120 pending P01 Source Art manifest items and their pending batch manifests.
- `prompt-guardrails.json` now defines the required R4 diversity profile schema.
- `validate:art` now gates all pending batches for structured diversity: 3 masculine, 2 androgynous, no more than 5 feminine, at least five unique pose silhouettes, at least five face shapes, and at least five body types per 10-character batch.
- Guardrail: generated R3 Source Art remains unchanged; no active Source Art file, Source Art index schema, Campaign save schema, gameplay settlement, Operation field-feed route, or balance rule was changed.
- Verified: `pnpm validate:art`, `pnpm typecheck`, `pnpm build`.

## 3.02.0-art-diversity-turbine-icon-v002 - 2026-07-18

- Updated pending and future P01 Source Art prompts from `OWM-P01-R3-FEMALE-ENGINEERING` to `OWM-P01-R4-DIVERSITY-ENGINEERING`.
- The 120 pending P01 prompts now require batch-level diversity across gender presentation, face shape, skin tone, hairstyle, age impression, body type, pose, expression, camera angle, and tool handling; generated R3 art remains unchanged.
- Removed `male character` from pending negative prompts and added repeated-face / repeated-pose negative guardrails.
- Fleet Board turbine SVG icons now use `offshore-svg-v002` details: monopile foundation, sea line, access rail, tower highlight, nacelle highlight, and explicit hub/shaft/tower axis-lock metadata.
- Guardrail: this does not change active Source Art files, Source Art index schema, Campaign save schema, gameplay settlement, balance, or Operation field-feed routing.
- Verified: `pnpm typecheck`, `pnpm validate:art`, `pnpm smoke:fleet`, `pnpm smoke:art`, `pnpm build`, `pnpm smoke:operation:compact`.

## 3.01.0-source-art-card-metadata - 2026-07-18

- Added stable Source Art metadata to Operation preview, Deployment preview, and Collection cards: character ID, active P01 version, active file, visual QA status, and engineering QA status.
- `smoke:art` now verifies every active card matches `public/assets/source-art/p01/index.json`, not only that an image loaded.
- Added Batch019 representative smoke screenshots for `CHR-OMI-246` and `CHR-GOV-028`.
- No art image file, Source Art index schema, Campaign save schema, gameplay formula, reward settlement, replay routing, or balance rule changed.
- Active Source Art is `180/300`; Batch019 is complete and Batch020 is delegated as a background art-only task with diversity rules.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm smoke:art`, `pnpm build`, `pnpm validate`.

## 3.00.0-campaign-completion-summary-metadata - 2026-07-18

- Added stable metadata to Campaign Completion Summary for completion state, mission/chapter totals, average best score, scored mission count, campaign grade, S-grade count, and mastered crew count.
- Gameplay smoke now verifies the full-completion fixture reports `15/15` missions, `5/5` chapters, average best score `80`, grade `A`, `3` S grades, and `1` L5 crew through metadata.
- No Campaign save schema, mission completion rule, score formula, reward settlement, replay routing, or balance rule changed.
- Active Source Art remains `180/300`; `smoke:art` remains part of the verification set.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`, `pnpm smoke:art`.

## 2.99.0-debrief-secondary-cta-metadata - 2026-07-18

- Added stable metadata to all Debrief Campaign Continue CTAs.
- `continue-next-mission` now exposes `data-continue-action="next-mission"` plus current mission metadata; `continue-return-route` exposes `data-continue-action="return-route"` and current mission metadata; `continue-replay-mission` exposes `data-continue-action="replay-mission"` plus `data-replay-mission-id`.
- Gameplay smoke verifies next/return/replay metadata after `MSN-TUT-001` settlement before routing to `MSN-TUT-002`.
- No Campaign save schema, reward settlement, mission unlock formula, route selection logic, or balance rule changed.
- Active Source Art is now `180/300`; `smoke:art` verifies all 180 active character cards load.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`, `pnpm smoke:art`.

## 2.98.0-operation-return-notice-metadata - 2026-07-18

- Added stable metadata to the Operation abort/return notice: `data-return-mission-id`, `data-return-reason`, `data-return-selected`, and `data-return-can-redeploy`.
- Added stable metadata to the Route shortcut: `data-return-action`, `data-target-mission-id`, and `data-target-selected`.
- Gameplay smoke now verifies the desktop abort notice identifies `MSN-TUT-002`, the mobile abort notice identifies `MSN-TUT-001`, both use reason `abort`, selected state `true`, and no direct redeploy path.
- No Campaign save schema, abort behavior, mission settlement, reward formula, or deployment route changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.

## 2.97.0-route-readiness-next-gap-metadata - 2026-07-18

- Added stable next-gap metadata to the Route Readiness Carryover primary CTA: `data-next-readiness-gap`, `data-next-readiness-action`, and `data-next-readiness-tab`.
- Gameplay smoke now verifies the CTA points to `permit / confirm-permit / readiness`, advances to `ppe / confirm-ppe`, and becomes `READY / deploy / operation` once all route readiness gaps are cleared.
- No Campaign save schema, readiness formula, deployment guard, route selection logic, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm smoke:gameplay`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.

## 2.96.0-debrief-next-mission-rec - 2026-07-18

- Marked Debrief `continue-next-mission` as the recommended continuation action when a next Campaign mission exists.
- Added `data-recommended-mission-id` and gameplay smoke verification before routing to the next mission.
- The CTA still calls the existing `onSelectMission(nextMission.id)` path.
- No Campaign save schema, reward settlement, mission unlock formula, or route selection logic changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm smoke:operation:compact`, `pnpm validate`.

## 2.95.0-round-decision-rec-settlement - 2026-07-18

- Upgraded the `round-decision-cta` smoke from confirmation-only to click-through End Round settlement verification.
- Compact Operation smoke now clicks the CTA a second time when confirmation is required, then verifies Operation log growth and round/event/debrief state movement.
- Added compact Branch Event layout rules for 1366×768 so a round-triggered event no longer shrinks the field feed below the playable threshold.
- No End Round formula, branch trigger rule, mission settlement function, Campaign save schema, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.

## 2.94.0-round-decision-rec-cta - 2026-07-18

- Added a compact `REC` End Round CTA to `NEXT DECISION: ROUND/RISK` states.
- The CTA calls the existing `requestNextRound()` path and preserves the existing two-step confirmation for branch/failure/low-margin risk.
- Compact Operation smoke now drives an Operation into ROUND/RISK, clicks the CTA, and verifies End Round confirmation while preserving one-screen layout.
- No End Round formula, branch trigger rule, mission settlement function, Campaign save schema, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.

## 2.93.0-diagnosis-rec-cta - 2026-07-18

- Added a Diagnosis Gate training `REC` CTA with a stable recommended diagnosis ID.
- The CTA is derived from the existing correct diagnosis option and calls the same `chooseDiagnosis(optionId)` path as manual diagnosis choices.
- Gameplay smoke now verifies the CTA exposes a stable recommendation ID and uses it to add evidence during Campaign diagnosis.
- No diagnosis scoring formula, mission settlement function, Campaign save schema, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.

## 2.92.0-branch-reactive-rec-cta - 2026-07-18

- Added a Branch Event `REC` Reactive CTA for unresolved branch events with at least one usable Reactive skill.
- The CTA is derived from the existing Reactive options and calls the same `resolveBranch(actorIndex, skillId)` path as manual branch response buttons.
- Gameplay smoke now verifies the CTA exposes stable recommended character/skill IDs and uses it to mitigate the first Campaign branch event.
- No branch penalty formula, Reactive settlement function, Campaign save schema, or balance rule changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:gameplay`, `pnpm smoke:operation:compact`, `pnpm smoke:layout`, `pnpm validate`.

## 2.91.0-operation-rec-cta-settlement - 2026-07-18

- Upgraded the `REC` recommended skill CTA smoke from presence-only to click-through settlement verification.
- Added stable test hooks for Operation summary stage/progress and active runtime AP/Energy.
- Compact Operation smoke now clicks the CTA and verifies AP decreases by 1, Energy decreases by the CTA cost, stage/progress changes, and the Operation log gains an entry.
- Gameplay smoke performs the same AP/Energy/stage-progress verification in the desktop campaign flow.
- No runtime formula, mission settlement function, Campaign save schema, or balance rule changed.

## 2.90.0-operation-recommended-skill - 2026-07-18

- Added a right-side `REC` recommended skill CTA for active Operation `NEXT DECISION: ACT` states.
- The CTA uses the existing recommended active skill and `resolveTeamSkill` forecast, showing applied power plus AP/Energy/stage outcome before the player clicks.
- Added smoke coverage that ACT decisions expose exactly one recommended skill CTA with a stable skill ID.
- This is derived UI guidance only; no mission runtime, settlement, Campaign save schema, or balance formula changed.
- Verified: `pnpm typecheck`, `pnpm build`, `pnpm smoke:operation:compact`, `pnpm smoke:gameplay`, `pnpm smoke:layout`, `pnpm validate`.

## 2.89.0-operation-field-feed-v004 - 2026-07-18

- Added AI-generated `public/assets/environment/offshore-field-feed_ai_v004.png` for the Operation center field-feed.
- Routed fallback, `SCN002`, and `SCN003` to V004 in `sceneAssets.json`; `sync:data` updates `public/data/sceneAssets.json`.
- Saved `offshore-field-feed_ai_v004.prompt.md` with explicit negative guardrails against malformed turbine blades, off-axis rotors, impossible offshore structures, people, text, logos, watermarks, and fantasy machinery.
- Enlarged Fleet Board turbine icons from 52×46 to 58×50 while preserving the hub/shaft/tower axis lock and one-screen layout.
- Updated layout/gameplay smoke expectations from V003 to V004.
- No runtime logic, settlement, save schema, or balance formulas changed.

## 2.88.0-turbine-axis-lock - 2026-07-18

- Fleet Board 的 SVG turbine rotor 現在以 hub 座標作為 CSS `transform-origin`，並以 `data-rotor-axis-lock="hub-shaft-tower"` 標記 shaft、nacelle、tower 的共同主軸。
- Operation field-feed 的 rotor telemetry 新增 `hubLocked`、`bladeAngles=0,120,240` 與 transform origin；視覺上移除容易被誤讀成額外葉片的垂直參考線，改為固定 bearing ring。
- `smoke:fleet`、`smoke:layout`、`smoke:operation:compact` 會檢查 3 葉片、hub/shaft/tower 同軸、rotor animation origin 與 1366×768 compact no-overflow。
- 不改 mission runtime、settlement、Campaign save schema 或 balance formula。

## 2.87.0-operation-info-heading - 2026-07-18

- Operation 下方資訊 panel 的標題會跟隨目前 tab 切換：`LOG` 顯示 `OPERATION LOG`、`SUMMARY` 顯示 `OPERATION SUMMARY`、`OBJECTIVES` 顯示 `OPERATION OBJECTIVES`。
- 這是 React session-only UI clarity 修正，不改 mission runtime、settlement、save schema 或任何 balance formula。
- `smoke:operation:compact` 新增 heading 斷言，確認 1366×768 下三個 info tabs 的標題與內容同步，且仍無 document / panel overflow。
- 驗證：`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay`、`pnpm smoke:fleet`、`pnpm validate` 全部通過。

## 2.86.0-campaign-route-subtabs - 2026-07-18

- Campaign Deployment Route 改為 `FLEET / MISSIONS / BRIEFING` 內部分頁；Route 頁不再同時堆疊 Wind Farm Board、15 個 mission nodes 與任務簡報，符合「一個頁面看到所有內容、資訊用 tab 切換」原則。
- `CampaignMissionMap` 新增 `focus` 模式：`fleet` 只顯示風場狀態，`missions` 顯示 5 章共 15 個 mission nodes 與完成摘要，`briefing` 顯示選定任務、Route Readiness Carryover 與 event deck。
- 修正 Route sub-tab state：離開 Deployment tab 不再非同步重設 Route sub-tab，避免玩家剛切到 `MISSIONS` 或 `BRIEFING` 又被拉回 `FLEET`。
- 新增 `pnpm smoke:deployment:compact`，在 1366×768 驗證 Deployment 5 個主 tab、Campaign Route 3 個內部分頁、Fleet Board history 都沒有 document 或 panel overflow。
- Gameplay smoke 已更新為新 UX：點 mission node 後自動進入 `BRIEFING`，abort return notice、reload progress、completion summary 都切到正確 Route sub-tab 後再驗證。
- 驗證：`pnpm typecheck`、`pnpm smoke:deployment:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay`、`pnpm smoke:fleet`、`pnpm validate` 全部通過。

## 2.85.0-operation-field-feed-v003 - 2026-07-18

- 新增 AI 生成 `public/assets/environment/offshore-field-feed_ai_v003.png`，作為 Operation 中央 field-feed runtime draft。
- v003 採 SOV 濕甲板視角、海況 2–3、霧化灰藍日光與遠近風機配置，提供比 v002 更接近實際海上 O&M 的中間視窗背景。
- `sceneAssets.json` 將 fallback、SCN002、SCN003 從 `offshore-field-feed_ai_v002.png` 升到 `offshore-field-feed_ai_v003.png`，版本顯示 V003。
- 新增 `offshore-field-feed_ai_v003.prompt.md`，保存 prompt 與負面提示詞，明確禁止四葉、彎曲葉片、離軸 rotor、文字、logo、人物與 fantasy machinery。
- 驗證：`pnpm sync:data`、`pnpm validate:data`、`pnpm smoke:scene`、`pnpm smoke:layout`、`pnpm smoke:operation:compact`、`pnpm smoke:gameplay`、`pnpm validate` 通過。

## 2.84.0-fleet-turbine-icon-rigging - 2026-07-18

- Fleet Board SVG 風機圖示改用 `fleetTurbineIconGeometry` domain helper，避免 React UI 以 magic number 手刻 tower / nacelle / shaft / hub 座標。
- Route 六張風機卡的風機圖示放大，補強 nacelle、tower、platform、shaft、hub 與三葉 rotor 的辨識度。
- Fleet smoke gate 從 metadata 字串檢查升級為座標一致性檢查：shaft start 必須等於 hub、shaft y 必須等於 hub y、tower center 必須等於 hub x、nacelle axis 必須等於 hub y。
- Fleet smoke 另驗證每個 icon 實際渲染恰好 3 個 `.fleet-turbine-rotor polygon`，避免只標 `data-blade-count=3` 但 SVG 畫錯。
- 驗證：`pnpm test -- src/domain/turbineGeometry.test.ts`、`pnpm typecheck`、`pnpm smoke:fleet`、`pnpm smoke:layout` 通過。

## 2.83.0-round-commit-confirmation - 2026-07-18

- Operation `End Round` 對高風險結算新增二次確認：branch event、forecast failure、或回合後 weather / safety margin 過低時，第一次點擊只顯示 commit warning。
- 桌面 `next-round` 與手機 `mobile-next-round` 共用同一個 `requestNextRound` gate；安全回合仍維持單次點擊。
- Abort / Return Route 會清除 End Round confirmation，避免兩種確認 UI 疊在一起。
- Mobile onboarding guide bottom offset 調整，避免二次確認後 action dock 變高而擋住 Confirm button。
- 驗證：`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay` 通過。

## 2.82.0-skill-forecast - 2026-07-18

- Operation `OBJECTIVES` tab 新增 `SKILL FORECAST`，顯示目前選中技師的推薦可用技能、預期 applied power、是否 stage clear，以及 AP / Energy / Fatigue 成本。
- Skill Forecast 直接呼叫既有 `resolveTeamSkill` pure resolver，不在 UI 重算 power / stage / equipment / counter / fatigue multiplier。
- Forecast 在 diagnosis gate、branch event 或 mission ended 時顯示 blocked / waiting 狀態，不寫 Campaign / Challenge save，也不改 mission settlement。
- Layout / compact / gameplay smoke 新增 `SKILL FORECAST` 與成本文字 gate，確認 1440x900、1366x768、768px 仍不 overflow。
- 驗證：`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay` 通過。

## 2.81.0-end-round-forecast - 2026-07-18

- 新增 `previewEndRound` domain pure function，End Round Forecast 與正式 `endRound` 共用同一套 fatigue / safety / weather / failure formula。
- Operation `OBJECTIVES` tab 新增 `END ROUND FORECAST`，顯示 `F +x / S -x / W -x`、下一回合或 branch trigger / failure risk。
- Forecast 使用與實際 End Round 相同的 equipment / vessel / sandbox / challenge vessel projection，不寫 save、不改 settlement。
- Runtime domain test 新增 forecast-vs-settlement 一致性驗證。
- Layout / compact / gameplay smoke 皆新增 forecast 文字與 overflow gate。
- 驗證：`pnpm test -- src/domain/runtime.test.ts`、`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay` 通過。

## 2.80.0-operation-objectives-tab - 2026-07-18

- Active Operation info tabs 擴充為 `LOG / SUMMARY / OBJECTIVES`，新增 session-only Objective Checklist。
- `OBJECTIVES` tab 顯示 Stage target、Learning objective、Diagnosis gate、Branch event 與 Risk floor；資料完全由目前 runtime / mission definition 派生，不寫 Campaign save、不改 mission settlement。
- Desktop layout smoke 新增 OBJECTIVES tab 的 ARIA linkage、tabpanel 與單頁驗證。
- Compact Operation smoke 新增 1366x768 OBJECTIVES tab overflow gate。
- Gameplay smoke 新增 desktop / mobile OBJECTIVES tab 覆蓋，確認 768px 不水平溢位。
- Source Art Batch018 背景任務完成，active Source Art index 從 160/300 更新為 170/300。
- 驗證：`pnpm typecheck`、`pnpm smoke:operation:compact`、`pnpm smoke:layout`、`pnpm smoke:gameplay` 通過；Batch018 子任務回報 `pnpm sync:art`、`pnpm validate:art`、`pnpm smoke:art` 通過。

## 2.79.0-fieldfeed-layout-geometry - 2026-07-18

- Operation 中央 field-feed 接入 AI 生成 `offshore-field-feed_ai_v002.png`，目前用於 fallback／SCN002／SCN003，並新增 prompt/negative guardrails 文件。
- Fleet Board SVG icon 改成同軸 rotor：shaft 穿過 hub、tower 對齊 hub、nacelle 位於同一主軸後方，新增 axis metadata。
- Phaser rotor telemetry 新增 `data-rotor-axis-consistent`、hub/shaft start/end metadata；layout/compact smoke 會直接驗證 hub 與 shaft 同軸。
- 1440×900 Operation layout 壓緊左側 MISSION CONTROL，新增 smoke gate 確認 `End Round` 與 `Abort / Return Route` 沒有被 panel 裁切。
- 驗證：`pnpm sync:data`、`pnpm validate:data`、`pnpm typecheck`、`pnpm build`、`pnpm smoke:layout`、`pnpm smoke:operation:compact`、`pnpm smoke:fleet`、`pnpm smoke:gameplay` 通過。

## 2.78.0-operation-decision-prompt - 2026-07-18

- Operation event panel 新增 compact `NEXT DECISION` 提示，避免玩家必須從 stage、log、skill disabled 狀態自行推論下一步。
- 提示由目前 runtime state 派生：分支事件顯示 `EVENT`、診斷 gate 顯示 `DIAG`、低天候/安全顯示 `RISK`、有可用主動技能顯示 `ACT`、否則顯示 `ROUND`。
- 這批只新增 derived UI，不改 runtime settlement、balance、save schema 或 Campaign/Challenge/Sandbox isolation。
- Layout/gameplay smoke 新增 decision prompt 斷言；compact Operation smoke 確認 1366×768 仍無 document 或 panel overflow。
- 驗證：`pnpm typecheck`、`pnpm smoke:layout`、`pnpm smoke:operation:compact`、`pnpm smoke:gameplay` 通過。

## 2.77.0-sandbox-scene-feed-coverage - 2026-07-18

- Sandbox direct field-feed coverage 從 19/150 推進到 29/150；新增 SCN007–SCN016 的 monopile、jacket 與 floating turbine 起始批次。
- `tools/generate-scene-feed-variants.py` 新增 monopile、jacket foundation 與 floating turbine overlay，可重跑產生相同版本化場景圖。
- `sceneAssets.json` 接入 10 個新增 direct Scene asset；SCN006 仍保留為 fallback regression fixture，避免 fallback provenance 被漏測。
- Scene smoke 更新 coverage gate：29 個 `INTEGRATED`、121 個 `FALLBACK`，fallback filter 仍保留目前 hidden current selection。
- 驗證：`pnpm sync:data`、`pnpm validate:data`、`pnpm typecheck`、`pnpm build`、`pnpm smoke:scene`、`pnpm smoke:layout`、`pnpm smoke:operation:compact`、`pnpm validate` 通過。

## 2.76.0-fleet-board-turbine-icon - 2026-07-18

- Fleet Board 六張風機卡新增共用三葉片 SVG icon，補上 tower、nacelle、shaft、hub 與 3 片 120° rotor blade。
- SVG icon 直接重用 `turbineBladePolygon` geometry，避免 Route UI 另外手刻錯誤葉片角度或離軸旋轉關係。
- Fleet smoke 新增六張卡的 icon metadata 驗證：`data-blade-count=3`、`data-shaft-locked=true`、`data-nacelle=true`、`data-tower=true`。
- 背景 Source Art Batch017 已匯入 active index，active Source Art 進度更新為 160/300；Batch017 QA 仍為 `Visual Review Required` 與 `Upscale Pending`。
- 驗證：`pnpm typecheck`、`pnpm test -- src/domain/turbineGeometry.test.ts`、`pnpm smoke:fleet`、`pnpm smoke:layout`、`pnpm validate`、`pnpm smoke:gameplay`、`pnpm smoke:art` 通過。

## 2.75.0-sandbox-scene-availability-filter - 2026-07-18

- Sandbox Route 的 Scene selector 新增 `ALL / INTEGRATED / FALLBACK` tab，避免 150 個 Scene 全部攤在同一個無分組清單。
- Route 上直接顯示 Scene asset coverage：目前 19/150 `INTEGRATED`、131 `FALLBACK`。
- 當目前選中的 Scene 被 filter 隱藏時，select 會保留 `CURRENT` 選項，不會因切換 tab 偷改 Sandbox scene。
- Scene smoke 新增 coverage、filter 選項數、hidden current selection、1440 單頁與 768px 無水平 overflow 驗證。
- 驗證：`pnpm typecheck`、`pnpm smoke:scene`、`pnpm validate`、`pnpm smoke:sandbox`、`pnpm smoke:layout`、`pnpm smoke:operation:compact` 通過。

## 2.74.0-operation-summary-scene-route - 2026-07-18

- Operation `SUMMARY` tab 的 8 格資訊改為包含 Scene routing 詳細狀態：requested Scene、`INTEGRATED/FALLBACK` availability、source Scene、asset version 與 QA status。
- 這批只讀既有 `sceneRoute` runtime resolution，不新增 Campaign save 欄位、不改 mission settlement、不改 Sandbox isolation。
- Layout smoke 與 gameplay smoke 新增 SUMMARY 斷言：桌機與 768px mobile 都必須顯示 `SOURCE`、`QA`、`SCN003`、`INTEGRATED`、`V001`、`ENGINEERING QA PASSED`。
- 驗證：`pnpm typecheck`、`pnpm smoke:layout`、`pnpm smoke:operation:compact`、`pnpm validate`、`pnpm smoke:gameplay` 通過。

## 2.73.0-campaign-scene-feed-coverage - 2026-07-18

- 新增 `tools/generate-scene-feed-variants.py`，可從已通過 QA 的 offshore field-feed 產生 Campaign mission 專用場景變體。
- `sceneAssets.json` 現在覆蓋 15 個 Campaign mission 實際使用的 Scene：SCN003、SCN023–026、SCN042–046、SCN082–086，並保留 SCN001–SCN005 基礎情境。
- `validate:data` 新增 gate：所有 Campaign mission sceneId 必須有 direct Scene asset；SCN006 仍留作 Sandbox fallback provenance 驗證。
- `smoke:scene` 升級為要求 15 個 Campaign scene badge 全部為 `INTEGRATED`，同時保留 Sandbox fallback、Campaign isolation、1440 單頁與 768px 無水平 overflow 檢查。
- 驗證：`pnpm validate:data`、`pnpm typecheck`、`pnpm build`、`pnpm smoke:scene`、`pnpm validate`、`pnpm smoke:layout`、`pnpm smoke:operation:compact` 通過。

## 2.72.0-scene-feed-variants - 2026-07-18

- `sceneAssets.json` 正式接入 SCN001–SCN005 五個 Operation field-feed 版本：dawn、day、rain、dusk、night。
- Scene Routing smoke 從舊的「SCN003 必須 fallback」更新為「SCN003 Campaign Operation 使用專屬圖，SCN006 仍驗證 fallback provenance」。
- 這批只擴充中央海上場景 asset routing，不改 Campaign save schema、mission settlement 或 Sandbox isolation。
- 驗證：`pnpm test -- src/domain/sceneRouting.test.ts`、`pnpm validate:data`、`pnpm typecheck`、`pnpm build`、`pnpm smoke:scene`、`pnpm smoke:layout`、`pnpm validate` 通過。

## 2.71.0-rotor-structure-telemetry - 2026-07-18

- Rotor digital twin 補上 nacelle、tower、shaft axis 與 `SHAFT LOCK` label，讓三葉片明確接在同一主軸/hub 上旋轉。
- 新增 `rotorTelemetryGeometry` domain model，Phaser 視覺尺寸由同一幾何來源推導，不在 canvas layer 自行拼接偏心尺寸。
- Layout smoke 與 compact Operation smoke 會等 `data-scene-ready="true"` 後驗證 rotor metadata：3 葉片、shaft locked、nacelle、tower。
- 驗證：`pnpm test -- src/domain/turbineGeometry.test.ts`、`pnpm typecheck`、`pnpm build`、`pnpm smoke:layout`、`pnpm smoke:operation:compact`、`pnpm validate` 通過；完整測試為 21 files / 139 tests。

## 2.70.0-operation-compact-smoke - 2026-07-18

- 新增 1366×768 Operation compact desktop layout：低高度 desktop 下壓縮 Mission Control、Field Feed、Operation Info、Card/Skills 三欄，維持單頁可視。
- 新增 `pnpm smoke:operation:compact`，部署任務後驗證 `LOG / SUMMARY` tabs、document overflow、三欄 panel internal overflow，並確認 field feed 高度仍可用。
- 驗證：`pnpm validate`、`pnpm smoke:layout`、`pnpm smoke:operation:compact` 通過。

## 2.69.0-operation-info-tab-keyboard - 2026-07-18

- Operation `LOG／SUMMARY` tabs 新增 ArrowLeft／ArrowRight／Home／End 鍵盤切換。
- 切換 tab 後會同步移動 focus，並維持 `aria-selected` 與 tabpanel 狀態一致。
- Layout smoke 新增鍵盤切換斷言，實際按 ArrowRight 到 SUMMARY、ArrowLeft 回 LOG。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過。

## 2.68.0-operation-info-tab-a11y - 2026-07-18

- Operation `LOG／SUMMARY` tabs 補上標準 `tablist／tab／tabpanel` 語意、`aria-controls` 與 `aria-labelledby`。
- LOG tabpanel 內保留 `role="log"` live region，避免失去操作紀錄的即時朗讀語意。
- Layout/gameplay smoke 改用 role 驗證 desktop 與 768px mobile 的 SUMMARY／LOG tabpanel。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過。

## 2.67.0-operation-info-tab-reset-coverage - 2026-07-18

- 補齊 Operation info tab reset 的 browser smoke 覆蓋：Sandbox deploy 後必須預設 LOG。
- Boss Challenge smoke 也在實際 Challenge Operation deploy 後檢查預設 LOG。
- 此批次只補測試與文件證據，不改 Campaign save schema 或 mission settlement。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、challenge smoke、Source Art smoke 通過。

## 2.66.0-operation-info-tab-reset - 2026-07-18

- 新 Operation session 建立前會重設 `LOG／SUMMARY` info tab 為 LOG，避免上一場停在 SUMMARY 污染下一次出勤。
- 重設涵蓋 Campaign、Sandbox 與 Boss Challenge deploy path；不新增 Campaign save 欄位。
- Gameplay smoke 新增 return-route 二次部署斷言：先切 SUMMARY、abort 回 Route、再部署，確認新 Operation 預設回 LOG。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 2.65.0-operation-info-mobile-tabs - 2026-07-18

- 768px mobile Operation 的 `SUMMARY` tab 改為 2 欄 compact grid，避免 stage/resource/Scene/Turbine 資訊造成水平 overflow。
- Gameplay smoke 新增 mobile Operation info tabs 斷言，實際切換 SUMMARY／LOG，檢查 Summary 內容與 768px document width。
- 此批次只調整 session-only UI 與 smoke coverage，不新增 Campaign save 欄位。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 2.64.0-operation-info-tabs - 2026-07-18

- Active Operation 下方資訊區新增 `LOG／SUMMARY` tabs；LOG 保留操作紀錄，SUMMARY 顯示 stage、progress、weather、safety、evidence、Scene、Turbine 與 Fleet pressure。
- Operation info tab 是 session-only UI state，不新增 Campaign save 欄位，也不影響 mission settlement。
- Layout smoke 新增 Operation summary tab 斷言，確認 tab 切換後仍維持 1440×900 單頁。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 2.63.0-operation-abort-desktop-confirmation-copy - 2026-07-18

- Desktop Operation abort confirmation 與 mobile wording 對齊，明確說明 Return 只中止 sortie，未結算、未寫任務結果、reward、best score 或 mission outcome history。
- Gameplay smoke 新增 desktop confirmation copy 與 Cancel save 斷言，驗證 Cancel 後仍停留 active Operation，且不改 `owm.campaign.v5`。
- README Source Art 進度修正為 Batch015／150 active，避免舊的 130/300 敘述造成誤判。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 2.62.0-operation-abort-mobile-confirmation-copy - 2026-07-18

- Mobile bottom dock 的 abort confirmation 新增短 copy：Return 只中止 sortie，未結算、未寫任務結果。
- Mobile smoke 新增 confirmation copy 與 Cancel 斷言，驗證 Cancel 後仍停留 active Operation，且不改 `owm.campaign.v5`。
- Confirm 仍回到既有 Route return notice，不新增 mission settlement 或 direct redeploy flow。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 2.61.0-operation-return-notice-mobile-copy - 2026-07-18

- `OperationReturnNoticePanel` 新增 compact status flags：`未結算／未寫存檔／僅回 Route`，讓 mobile / narrow Route 不只依賴長句說明。
- 768px 以下 Route notice 改為單欄、狀態文字可換行、actions 等寬，降低水平 overflow 與誤讀風險。
- Gameplay smoke 新增 768px abort → return notice → dismiss flow，驗證 mobile copy、水平 overflow 與 `owm.campaign.v5` 不變。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 2.60.0-operation-return-notice-dismiss - 2026-07-18

- `OperationReturnNoticePanel` 新增手動 `Dismiss notice` action；玩家可在不 reload 的情況下清除 abort return context。
- Dismiss 只清除 React session-only notice，不改 Campaign save、不重新部署、不新增 save 欄位。
- Gameplay smoke 新增 dismiss 與 main mode switch 斷言，驗證清除提示與切換 Collection → Campaign 都不會修改 `owm.campaign.v5`。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke、Source Art smoke 通過。

## 2.59.0-operation-return-context - 2026-07-18

- Abort confirm 回 Campaign Route 後新增 session-only `OperationReturnNoticePanel`，清楚標示本次 sortie 未結算、未寫 mission result、reward、best score 或 mission outcome history。
- Notice 在同一任務仍被選取時提供 compact Route shortcut；不直接 deploy，不建立新 flow。
- Gameplay smoke 新增 Return Notice 斷言，驗證 notice 顯示 `MSN-TUT-002` abort context、同任務 Route shortcut 可見、沒有 direct redeploy shortcut、notice 顯示期間不改 `owm.campaign.v5`，且 reload 後自然消失。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

## 2.58.0-operation-quick-return - 2026-07-18

- Active Operation 新增二段式 `Abort / Return Route` control，避免第一次點擊就直接丟失 sortie。
- Confirm abort 只清除目前 React session 回 Route；不呼叫 mission settlement，不新增 reward、completed mission、best score 或 mission outcome history。
- Mobile action dock 同步提供 compact abort flow；既有任務結束後 Redeploy 行為維持不變。
- Gameplay smoke 新增 abort open／cancel／confirm flow，並驗證 `MSN-TUT-002` abort 後沒有 mission settlement 資料；Campaign deploy 的既有 DISPATCH history 仍保留。
- Source Art Batch015 已匯入 active index，active Source Art 進度更新為 150/300；`validate:art` 與 `smoke:art` 通過。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

## 2.57.0-ready-route-deploy - 2026-07-18

- Route reminder 達到 `7/7 READY` 後，primary CTA 由「處理下一個缺口」切換為「立即出勤」。
- Ready Route Deploy CTA 直接呼叫既有 `onDeploy`，沿用既有 duplicate team、inventory、Crew readiness、Operation readiness guards；不新增第二套出勤路徑或 Campaign save 欄位。
- Operation grid 新增穩定 `mission-operation` test id，供 browser smoke 驗證 Route READY → Deploy → Operation flow。
- Gameplay smoke 覆蓋 shortcuts → Route 7/7 READY → Readiness 5/5 READY → Route Deploy → Operation，並確認 dispatch 使用既有 Campaign flow。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

## 2.56.0-route-reminder-shortcuts - 2026-07-18

- Route Readiness Carryover 新增 explicit action shortcuts：Permit、PPE、Access 缺口可在 Route 直接點擊確認。
- Crew 與 Loadout chips 維持導向對應 Tab，讓玩家處理疲勞、輪調或裝備 Condition，不自動部署。
- Shortcuts 只更新目前 React deployment confirmations 或切換 Tab，不新增 Campaign save 欄位；gameplay smoke 驗證 shortcut 前後 `owm.campaign.v5` 未改變。
- Gameplay smoke 會驗證 Debrief CTA → Route reminder → shortcuts → 7/7 READY → Readiness 5/5；layout smoke 驗證 Route 單頁保留 shortcuts。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

## 2.55.0-route-readiness-carryover - 2026-07-18

- Campaign Route briefing 新增 Route Readiness Carryover，將 Permit、PPE、Access、Vessel、Mastery、Crew 與 Loadout 狀態顯示為 compact chips。
- 從 Debrief 的「下一個任務」CTA 回到 Route 後，玩家可直接看到下一關尚缺的 readiness 條件；點擊 chip 或「處理下一個缺口」會切到 Readiness／Crew／Loadout Tab。
- Carryover 只讀目前 Operation Readiness、deployment confirmations、Crew readiness、Career unlock 與 Equipment condition，不新增 Campaign save 欄位。
- Gameplay smoke 新增 CTA → Route → readiness reminder → Readiness Tab 斷言；layout smoke 新增 initial Route reminder 斷言。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

## 2.54.0-campaign-continue-cta - 2026-07-18

- Mission Result REVIEW 新增 Campaign Continue CTA，提供「下一個任務／返回 Route／重玩本任務」三個 compact action。
- 新增 `campaignContinueTargets` pure helper，只由 Campaign progress、missions 與 current mission ID 派生下一個可出勤任務、目前任務與戰役完成狀態；不新增 Campaign save 欄位。
- Gameplay smoke 會驗證 CTA 文案、下一個可出勤 Mission，並實際點擊「下一個任務」確認回到 Campaign Route 且選中下一關。
- 驗證：21 test files / 138 tests、TypeScript、production build、validate、layout smoke、gameplay smoke 通過。

## 2.53.0-mission-replay-compare - 2026-07-18

- `CampaignReward` 新增本次分數／評級、任務前 best、任務後 best 與 `FIRST_BEST / NEW_BEST / BEST_HELD` 狀態；比較在 `awardCampaignMission` 覆寫 `bestScores` 前派生，不新增 Campaign save 欄位。
- Mission Result REVIEW 新增 score compare card，顯示「本次 / 任務前 BEST / 任務後 BEST」與首次 best、刷新 best、best 維持狀態。
- Domain tests 覆蓋 first best、new best、best held 三種 replay compare 情境；gameplay smoke 驗證 REVIEW 預設 tab 顯示 compare card 且保持 Debrief single-screen。
- 驗證：21 test files / 137 tests、TypeScript、production build、layout smoke、gameplay smoke 通過。

## 2.52.0-mission-result-review - 2026-07-18

- Operation Debrief 改為 `REVIEW / SCORE / LOG` Tab；任務結束後預設開啟 REVIEW，集中顯示 XP、MNT、Equipment wear、Crew fatigue、Wind Farm delta 與 Codex unlock。
- SCORE Tab 保留原本六項評分，LOG Tab 保留完整操作紀錄並限制高度，避免任務完成後靠長 log 找結算資訊或撐破單頁 layout。
- gameplay smoke 新增 Mission Result Review 預設 tab、score tab、log tab 與 Operation debrief single-screen 斷言，並輸出 Debrief review/score/log 截圖。
- 驗證：21 test files / 136 tests、TypeScript、production build、layout smoke、gameplay smoke 通過。

## 2.51.0-fleet-operations-history - 2026-07-18

- 新增 Fleet Operations History：Campaign deploy 的 Fleet Condition projection、mission outcome、single turbine maintenance confirm 與 fleet maintenance plan confirm 都會 append 到 `campaign.fleetOperationsHistory`。
- History 採 bounded append-only 設計，最多保留最近 30 筆 gameplay state 摘要；v1/v2/v3/v4/v5 既有存檔 normalize 時會補空 history 並過濾未知 Mission／Turbine ID。
- Wind Farm Operations Board 新增 `DISPATCH／HISTORY` Tab；HISTORY 以 compact pagination 顯示事件、MNT、R／B／availability 或 dispatch cost／safety／reliability before-after，不增加 Route 頁面高度。
- Collection 的 Campaign save 標籤修正為 `CAMPAIGN SAVE V5`，說明匯出 JSON 會包含 fleet state 與 operations history。
- 驗證：21 test files / 136 tests、TypeScript、production build、validate、layout smoke、fleet smoke、gameplay smoke 通過；layout smoke 驗證空 History 單頁與 deploy DISPATCH history persistence，fleet smoke 驗證 single／plan maintenance history 與 reload persistence。

## 2.50.0-fleet-condition-dispatch-modifier - 2026-07-18

- 新增 Fleet Condition Dispatch Modifier：Campaign deploy 會依目標風機 availability、reliability 與 fault backlog 派生 `NOMINAL / ELEVATED / HIGH / CRITICAL` 壓力，並 deterministic 調整 mobilization cost、initial safety 與 initial reliability。
- `windFarm.ts` 新增 pure domain projection/apply API，`MissionState` 增加 idempotent `fleetConditionApplied` flag，避免同一場任務重複套用；Sandbox 與 Boss Challenge 不受此 modifier 影響。
- Readiness、Dispatch Forecast、Operation field feed 都顯示 Fleet Condition 的 before/after 數值與 gameplay abstraction 標記，讓玩家能在同一頁理解風場狀態如何影響出勤。
- Balance simulator 已納入 Campaign runtime modifier；L1/L3/L5 progression gates 仍通過，L5 15/15 complete，fleet pressure 只增加決策壓力，不破壞主線可完成性。
- 驗證：21 test files / 135 tests、TypeScript、campaign balance、production build、layout smoke、fleet smoke、gameplay smoke 通過；layout smoke 新增 readiness/forecast/operation 三處 Fleet Condition 斷言與截圖。

## 2.49.0-fleet-maintenance-plan - 2026-07-17

- Fleet Maintenance 區塊新增 `SINGLE／PLAN` Tab；PLAN 使用同一個 compact panel，不新增桌面垂直區塊，維持 1440×900 單頁。
- 新增 pure TypeScript `createFleetMaintenancePlan`：多部風機選項先去重並依 stable ID 排序，再逐步套用既有單次 quote，產生每一步 Reliability／Backlog／AVL／MNT 前後值與整場 summary。
- Plan 每部風機最多加入一次；加入下一部會先以剩餘 MNT 重算完整 plan，超出預算顯示 `PLAN SHORT` 並鎖定，未知機組、零 backlog、空 plan 或 MNT 不足都無法 Confirm。
- Preview、加入／移除、Prepare 與 Cancel 全部只存在 React session；Confirm 才由 `maintainCampaignTurbinePlan` 一次原子更新 Campaign v5 的 MNT 與完整 fleet state。
- Focused Chrome smoke 驗證反向點選 `WTG-004→001` 仍以 `001→004` stable-ID 順序執行、逐步 `80→55→23 MNT`、第三部超預算鎖定、no-save cancel、兩部原子 settlement、reload、1440 單頁與 768px 無水平 overflow。
- 21 test files／132 tests、TypeScript、data／art gates、Campaign／Challenge balance、production build，以及 Fleet／Campaign／Challenge／Sandbox／Scene／Layout／Onboarding／Source Art browser smoke 全數通過。React 主 chunk 433.00 kB，Phaser lazy chunk 1,381.35 kB。

## 2.48.0-fleet-dispatch-priority - 2026-07-17

- 新增 pure TypeScript `createFleetDispatchPriority`：六座風機全部進入 deterministic queue，依 availability pressure、maintenance priority、open fault backlog、reliability deficit、單次 availability recovery 與 reliability gain 排序；分數明確只是 gameplay abstraction。
- 原本固定位置的 6 張風機卡升級為 priority queue：顯示 `#01–#06`、Reliability／Backlog 前後值、單次 MNT、`READY／SHORT／CLEAR` 與 `AVL +N`，同一畫面即可比較先修哪一部。
- Queue header 顯示 ACTION／READY、AVL／DGD／OFF、平均 Reliability 與總 Backlog；選取卡片後顯示整場 availability、平均 reliability 與 backlog 的單次維修前後投影。
- `READY` 只表示目前 MNT 可立即確認該單次操作；每次 Confirm 後 queue、rank、budget status 與 fleet projection 都由新 Campaign v5 狀態重新計算，沒有批次自動扣款或新增 save 欄位。
- Fleet focused Chrome smoke 新增六機組 rank、READY／SHORT、AVL impact、低預算重算與 selected fleet projection 驗證；既有 Prepare／Cancel no-save、Confirm-only settlement、reload、1440×900 單頁與 768px 無水平 overflow 均保留。
- 21 test files／128 tests、TypeScript、data／art gates、Campaign／Challenge balance、production build，以及 Fleet／Campaign／Challenge／Sandbox／Scene／Layout／Onboarding／Source Art browser smoke 全數通過。React 主 chunk 426.94 kB，Phaser lazy chunk 1,381.35 kB。

## 2.47.0-fleet-maintenance-action - 2026-07-17

- Wind Farm Operations Board 的 6 座風機卡改為可獨立選取；維修選擇不會改變目前 Mission 目標，讓玩家可先處理其他 degraded／offline 機組。
- 新增 pure TypeScript `turbineMaintenanceQuote`：依 availability、reliability 與 open fault backlog 派生 `NORMAL／HIGH／CRITICAL`、固定 reliability gain、清除一筆 backlog 與所需 MNT；所有數值標記為 gameplay abstraction。
- 維修採兩階段操作：Prepare 只顯示 reliability、backlog、availability 與 MNT 前後值，並明示 `NO SAVE UNTIL CONFIRMED`；Cancel 不寫檔，Confirm 才原子扣除 MNT、更新 fleet state 並增加 `maintenanceActions`。
- `performTurbineMaintenance` 與 `maintainCampaignTurbine` 會拒絕零 backlog 或 MNT 不足的操作；Campaign v5 normalize 會為舊存檔補上 `maintenanceActions=0`，不需升級 save key。
- 新增 Fleet Maintenance focused Chrome smoke，驗證 WTG-004 兩次維修、報價 deterministic、取消／確認的存檔邊界、reload persistence、backlog 清空、1440×900 單頁與 768px 無水平 overflow。
- 21 test files／127 tests、TypeScript、data／art gates、Campaign／Challenge balance、production build，以及 Fleet／Campaign／Challenge／Sandbox／Scene／Layout／Onboarding／Source Art browser smoke 全數通過。React 主 chunk 424.53 kB，Phaser lazy chunk 1,381.35 kB。

## 2.46.0-wind-farm-operations-board - 2026-07-17

- 新增 `turbines.json`：6 座虛構風機使用 `WTG-OWM-001`–`006` stable ID，保存雙語名稱、區位、額定容量與可重現初始狀態；15 個 Campaign Mission 全數建立 `turbineId` FK。
- Campaign Route 新增 compact Wind Farm Operations Board，同頁顯示 6 機組 availability、reliability、fault backlog 與選定 Mission 的目標風機。
- 任務成功依分數提升 reliability 並清除一筆 backlog；失敗依 Chapter 壓力降低 reliability、增加 backlog，並以明確門檻派生 `AVAILABLE／DEGRADED／OFFLINE`。
- Operation Field 顯示目標風機即時狀態；Debrief 顯示 reliability／backlog 前後差異並將結果寫入長期 fleet state。所有數值標記為 gameplay abstraction。
- Campaign save 升級為 v5／`owm.campaign.v5`，加入 fleet state；v1/v2/v3/v4 localStorage、裸進度及 envelope 均可 migration，未知 Turbine ID 會移除、缺少項目會由主資料補回。
- Python data gate 驗證 6 個 Turbine IDs、15 個 mission assignments、FK 與每機至少兩個任務；balance simulator 仍通過 6/12/15 progression、15/15 maintenance 與 15/15 crew readiness gates。
- 21 test files／123 tests、TypeScript、production build、Campaign／Challenge／Sandbox／Scene／Layout／Onboarding browser smoke 全數通過；1440×900 Route 單頁顯示，768px 無水平 overflow。React 主 chunk 420.05 kB，Phaser lazy chunk 1,381.35 kB。

## 2.45.0-mission-scene-routing - 2026-07-17

- 新增 `sceneAssets.json` runtime asset index；Scene metadata 與實際圖片 availability 分離，專屬資產與共用 fallback 都保存版本、QA 狀態及來源。
- 15 個 Campaign Mission node 直接顯示各自 `sceneId` 與 `INTEGRATED／FALLBACK`；Operation 保留 requested Scene 名稱，即使缺圖也不會將 fallback 假裝成該場景專屬圖。
- Sandbox Route 新增 150 Scene selector 與 metadata／mood／variant／provenance preview；場景選擇只存在 deployment／session，不修改 Campaign 或 Challenge save。
- Phaser 可依 session scene route 重建背景；primary 載入失敗時再使用 verified fallback，並提供 scene-ready browser gate，避免 canvas 建立但背景尚未完成時誤判通過。
- `SCN002` 直接接入既有寫實 offshore field-feed；其餘尚無專屬圖片的 149 Scene 明確回退 `SCN002`，保留後續逐批置換的 stable-ID 契約。
- 新增 Scene routing domain tests、Python／browser asset validation 與 focused Chrome smoke，涵蓋 15 Campaign routes、Sandbox 150 selector、Phaser 切換、Campaign isolation、1440×900 單頁與 768px 無水平 overflow。
- 20 test files／118 tests、Challenge 100/100 與 Campaign 6/12/15 progression gates、TypeScript、production build、Scene／Campaign／Challenge／Sandbox／layout Chrome smoke 全數通過；React 主 chunk 414.16 kB，Phaser lazy chunk 1,381.35 kB。

## 2.44.0-sandbox-scenario-lab - 2026-07-17

- 依 Master Charter 完成 Web MVP requirement audit；教學、Campaign、Boss Challenge 與 Sandbox 列為可玩完成，合作任務明確列為需後端／多人同步的 MVP 外範圍。
- Sandbox Readiness 改為 Scenario Lab，可用 CALM／STANDARD／STORM／EXTREME preset 或自訂 Sea State、Weather Window、Safety、Evidence 與 Round Limit。
- Sea State 以 pure domain projection 影響 Vessel weather／safety／fatigue protection；不修改 vessel master data，也不讀寫 Campaign v4 或 Challenge v3。
- Operation 顯示本次沙盒情境 snapshot 與投影後 Vessel protection；回合資源、風險與回合上限均使用同一份 session config。
- 新增 Sandbox domain tests 與 Chrome smoke，驗證 preset、自訂滑桿、session snapshot、Campaign isolation、1440×900 單頁及 768px 無水平 overflow。
- 下一個 gameplay 批次鎖定 Mission Scene Routing，依既有 `sceneId` 將 15 關 Mission 接到版本化場景圖與安全 fallback。
- 19 test files／115 tests、Challenge 100/100 與 Campaign 6/12/15 progression gates、TypeScript、production build、Sandbox／Campaign／Challenge／layout Chrome smoke 全數通過；React 主 chunk 410.89 kB，Phaser lazy chunk 1,380.69 kB。

## 2.43.0-challenge-import-preflight - 2026-07-17

- Challenge JSON import 改為兩階段：解析成功只建立 `CHALLENGE_IMPORT_CONFIRMATION_REQUIRED` preflight，顯示 best、OPERATION、DRAFT_CONFIRMATION、squad draft 的目前→匯入後數量。
- Preflight 明列 best／draft 的 added、changed、removed 數量，以及所有 affected／完全被移除的 Boss stable IDs；確認前 `owm.challenge.v3` 不寫入。
- Confirm 會重新驗證 current 與 incoming progress fingerprint；目前存檔或 preview payload 已變動時拒絕過期覆寫。
- 確認成功後提供本次 React session 一層 Undo；可跨 Deployment Tab 使用，但 reload 不保存。匯入後若又有新變更，Undo fingerprint 會拒絕覆寫。
- Browser flow 驗證 Campaign JSON reject、空 v3 preview/cancel、v2→v3 migration preview/confirm、跨 Tab Undo、reload isolation；Campaign v4 全程逐字不變。
- 全模式 regression 驗證 Campaign 15 關、Challenge、Collection、Codex、Sandbox、Onboarding、五個 Deployment Tab、1440×900 單頁與 768px touch／responsive，均無回歸。
- 18 test files／112 tests、TypeScript、production build 與 Chrome smoke 通過；preflight 在 1440×900 維持單頁，768px 無水平 overflow；React 主 chunk 404.07 kB，Phaser lazy chunk 1,380.69 kB。

## 2.42.0-challenge-backup-source-filter - 2026-07-17

- Challenge Route 新增 `OPERATION／DRAFT_CONFIRMATION` source filter，可與完成狀態、Severity、Class、draft 與 readiness 交集使用；Briefing 同步顯示兩種來源的 best／clear 數量。
- 新增獨立「挑戰存檔」Tab 與 `OWM_CHALLENGE_SAVE` v3 envelope，可產生、下載、匯入並覆寫 Challenge local best／source／squad draft。
- v1／v2 Challenge envelope 與裸進度可 migration；import 重新正規化 Boss／Character FK、三人唯一性及來源。Campaign envelope、損壞 JSON 與未來版本會明確拒絕。
- Browser flow 驗證產生備份、拒絕 Campaign raw JSON、以空 Challenge 覆寫、從原備份恢復及 reload；`owm.campaign.v4` 全程逐字不變。
- 18 test files／110 tests、TypeScript、production build 與 Chrome smoke 通過；Challenge backup 在 1440×900 維持單頁，768px 無水平 overflow；React 主 chunk 397.12 kB，Phaser lazy chunk 1,380.69 kB。

## 2.41.0-best-source-provenance - 2026-07-17

- Boss Challenge save 升級為 `owm.challenge.v3`；local-best record 新增永久 `OPERATION／DRAFT_CONFIRMATION` source，Route、Result 與 CLEAR settlement confirmation 都顯示來源。
- v1／v2 best 會安全 migration 為 `OPERATION`；v2 draft map 保留。合法 v3 `DRAFT_CONFIRMATION` 會原樣保存，reload 後仍可辨識。
- source 不參與 local-best 排序；最佳紀錄仍只依高分、完成優先與較少回合決勝。相同 score／round 的 OPERATION 不會覆寫既有 DRAFT_CONFIRMATION。
- Browser flow 驗證 BOSS015 confirmed draft 與 BOSS001 operation best 可同時保存、比較與 reload；Challenge 仍與 Campaign v4 隔離。
- 18 test files／107 tests、TypeScript、production build 與 Chrome smoke 通過；1440×900 Route 維持單頁，768px 無水平 overflow；React 主 chunk 390.47 kB，Phaser lazy chunk 1,380.69 kB。

## 2.40.0-draft-settlement-confirmation - 2026-07-17

- CLEAR repair 不再直接寫入 Challenge local best；先建立 `DRAFT_RUNTIME_CONFIRMATION_REQUIRED` preview，同列顯示 grade、score、round、目前→預計 best 與三人 stable IDs。
- 新增 pure domain `createBossChallengeDraftSettlementPreview`／`confirmBossChallengeDraftSettlement`；只有 CLEAR verification 可建立 preview，建立本身無副作用，確認後才更新 `owm.challenge.v2`。
- Confirm contract 會保存 previous-best fingerprint；若 local best 在預覽後已改變，過期 preview 會被拒絕，避免覆寫較新的紀錄。
- `取消並復原` 會回到修補前隊伍與 FAILED verification，不建立 local best；確認後顯示 `NEW LOCAL BEST SAVED` 與 save provenance，reload 後 best 保留而 preview 清除。
- FAILED／IMPROVED FAILED／NO IMPROVEMENT runtime candidates 均不顯示結算按鈕；BOSS080 apply 仍只更新 draft，Campaign、static audit 與 local best 保持隔離。
- 真實資料掃描確認目前 `STILL FAILED` escalation 沒有 CLEAR 候選；domain 以 BOSS015 真實 CLEAR runtime candidate 驗證 future path，browser 則共用 BOSS015 CLEAR repair 流程驗證取消／確認／reload。
- 18 test files／105 tests、TypeScript、production build 與 Chrome smoke 通過；1440×900 settlement row 通過單頁 gate，768px 無水平 overflow；React 主 chunk 389.74 kB，Phaser lazy chunk 1,380.69 kB。

## 2.39.0-runtime-repair-preview - 2026-07-16

- Runtime Repair dropdown 改為 Apply 前即時計算 current→candidate preview；同列顯示 score／round delta、實際 slot replacement、Counter、Stage 與 remaining structural gaps。
- 候選結果明確分為 `CLEAR／IMPROVED FAILED／NO IMPROVEMENT`；最佳改善候選維持預設選取，shortlist 固定保留一筆無改善對照供玩家檢查，但不自動選取。
- 新增 pure domain selection-preview／default-selection contracts，驗證 stable team IDs、Boss 一致性與目前隊伍真正被替換的成員；BOSS080 預設為 `33→34 (+1)`，無改善對照為 `33→33 (+0)`。
- 修正 Runtime candidate Apply 後 Repair panel 卸載問題；Undo 現在會重新呈現完整原 shortlist、先前 runtime comparison 與 Top Repair team，預設回到推薦改善候選。
- Browser smoke 新增 shortlist Apply／Undo／reload isolation；runtime shortlist 與 verification 不跨 reload，只有明確套用的 draft stable IDs 保存，local best、Campaign 與 static audit 仍隔離。
- 18 test files／103 tests、TypeScript、production build 與 Chrome smoke 通過；Runtime Repair Escalation 在 1440×900 通過單頁 gate，768px 無水平 overflow；React 主 chunk 385.90 kB，Phaser lazy chunk 1,380.69 kB。

## 2.38.0-runtime-repair-escalation - 2026-07-16

- `STILL FAILED` Route 新增按需 Runtime Repair Escalation；從原始 priority-gap team 產生 60 名 structural pool，排除已嘗試 Top Repair 後實跑其餘 59 隊正式 deterministic autoplay。
- 依 CLEAR 優先、score 降冪、round 升冪、stable IDs 排序，畫面以單一 dropdown 顯示 top 6 每隊 replacement ID、CLEAR／FAILED、score 與 round，不增加桌面頁面高度。
- 玩家可選擇任一 shortlist candidate 後再 Apply；Evaluate 本身不寫檔、不改隊。Apply 只更新 draft，local best、Campaign 與 static audit 保持隔離。
- BOSS080 誠實回報 `0 CLEAR / 59 EVALUATED`，最佳為 `CHR-ACA-043 · FAILED 34 · R8`；不將「最佳失敗候選」誤標為可通關。
- 套用非第一名候選後保持 `STILL FAILED`，一層 Undo 會精確恢復先前 Top Repair team、runtime comparison、完整 shortlist 與選前狀態。
- 18 test files／101 tests、TypeScript、production build 與 Chrome smoke 通過；1440×900 單頁、768px 無水平 overflow；React 主 chunk 383.89 kB，Phaser lazy chunk 1,380.69 kB。

## 2.37.0-repair-reverify - 2026-07-16

- FAILED Draft Verification 會在原列直接標示最高優先結構缺口與預計 Top Repair 的加入／取代 stable IDs；runtime failure 與 structural recommendation 仍分層呈現。
- 套用 Top Repair 後保留修補前隊伍與原 runtime 結果，按鈕切換為 `RE-VERIFY`；修補後同列顯示 `REPAIR CLEAR／STILL FAILED`、score delta 與 round before→after。
- 新增 pure domain repair evidence／verification comparison contract，固定區分 `CLEARED_AFTER_REPAIR／STILL_FAILED／CLEAR_HELD／REGRESSED` 四種結果。
- BOSS015 固定案例由預設隊伍 FAILED，套用 `CHR-MFG-128` 後轉為 CLEAR；BOSS080 同一結構修補後仍 FAILED，證明補齊結構不會被誤宣稱為必定通關。
- Undo 會精確恢復修補前 stable IDs 與先前驗證結果；repair／reverify 只存在 session，不建立 local best、不改 Campaign 或 static audit snapshot。
- `BATCH-P01-013` 10 張完成原子匯入；全部 `1024×1536`、2:3 技術 QA pass，active Source Art 累計 130/300，130 名角色遊戲載入 smoke 通過；正式人工核准仍為 false。
- 17 test files／98 tests、TypeScript、production build 與 Chrome smoke 通過；1440×900 仍為單頁，768px 無水平 overflow；React 主 chunk 379.66 kB，Phaser lazy chunk 1,380.69 kB。

## 2.36.0-draft-verification - 2026-07-16

- Drafted Boss 的 Route 新增按需 `RUN VERIFY`；直接以固定 Mastery L3、10 回合與 `EQ0051 + EQ0126 + VES002` 執行正式 deterministic autoplay。
- 驗證重用 100 Boss balance audit 的同一套 runtime、策略與 Challenge-only GRD reserve；100 組 audit recommendation 的 success、score、grade、round、pressure 逐筆完全一致。
- 同一列顯示輸入隊伍 stable IDs、`VERIFIED CLEAR／FAILED`、score、grade、round 與 `RUNTIME ONLY` provenance，不增加 1440×900 Route 的頁面高度。
- 驗證結果只存在目前 React session；換 Boss／換隊會失效，reload 後回到 UNVERIFIED，不寫入 local best、draft save、Campaign v4 或 static audit snapshot。
- Browser smoke 實測 BOSS004 audit draft 為 `CLEAR · 76 · B · R4/10`，BOSS080 audit draft 為 `CLEAR · 58 · D · R8/10`，改成預設隊伍則為 FAILED。
- 17 test files／96 tests、TypeScript、production build 與 Chrome smoke 通過；React 主 chunk 377.74 kB，Phaser lazy chunk 1,380.69 kB。

## 2.35.0-repair-queue - 2026-07-16

- Boss Challenge Portfolio 同列新增 HAS-GAPS Repair Queue；顯示 stable-ID queue 位置、剩餘 `Reactive／Fatigue recovery／Energy／Stage` gap 數與本次 session 已修補數。
- Queue 永遠由未篩選的 100 Boss Route 派生並以 Boss stable ID 排序；目前 Severity／Class／status／readiness filter 不會把下一筆工作藏起來。
- `NEXT · BOSSxxx` 會清除不相容 filter、聚焦 `DRAFTED + HAS GAPS` 並載入下一個既有 draft；不自動套用候選、不修改隊伍。
- Route repair Apply 使目前 Boss 離開 gap filter 時會保留結果摘要與一層 Undo；Apply／Undo 即時更新 queue、portfolio 與 session counter，reload 只保存 draft、不保存 session counter。
- Chrome smoke 驗證 BOSS004→BOSS003 導覽、filter reset、連續 Apply／Undo、reload、Campaign raw save 隔離、1440×900 單頁及 768px 無水平 overflow。
- 16 test files／93 tests、TypeScript 與 production build 通過；React 主 chunk 371.79 kB，Phaser lazy chunk 1,380.69 kB。

## 2.34.0-route-top-repair - 2026-07-16

- HAS-GAPS draft 的 Route 直接顯示 deterministic 最佳單席修補，不必先跳 Crew Tab；完整比較相符 roster 的三個替換席位。
- `NO_REACTIVE／NO_TEAM_RECOVERY／NO_LOW_ENERGY_ACTION` 分別路由到正式 Crew capability；`STAGE_GAP` 會完整比較其餘 297 名角色×三席，優先補成 6/6。
- 候選列顯示角色 stable ID、被取代成員、Gaps／Counter／Stage before→after、候選數與 swap 數，並固定標示 `NOT AUDIT VERIFIED`。
- 一鍵套用後立即更新 selected draft 與全 100 Boss portfolio，支援一層 Undo；apply、undo 與 reload 都保存於 `owm.challenge.v2` draft map，不改 local best 或 Campaign v4。
- 100 Boss audit drafts 的 top repair deterministic 測試、Stage-only fallback、四種 gap routing、Apply/Undo/reload、Campaign isolation、1440×900 單頁與 768px 無水平 overflow 均通過。
- 16 test files／92 tests、TypeScript 與 production build 通過；React 主 chunk 369.65 kB，Phaser lazy chunk 1,380.69 kB。

## 2.33.0-draft-readiness-portfolio - 2026-07-16

- Challenge Route 對每個 draft 以正式 `createBossChallengeStrategyBriefing` 派生 `GAP_FREE／HAS_GAPS`，並保留 `NO_REACTIVE／NO_TEAM_RECOVERY／NO_LOW_ENERGY_ACTION／STAGE_GAP` 四種 gap type。
- Route 新增 readiness/gap type 交集篩選與 `READINESS` deterministic sort；排序為 Gap-free、Has-gaps、Undrafted，同組再依 gap 數及 Boss stable ID。
- Boss Challenge briefing 新增全 100 Boss portfolio：DRAFTED、GAP-FREE、HAS GAPS；固定標示 `STRATEGY STRUCTURE ONLY`，不取代 runtime audit 或推導成功率。
- 手動換人、Candidate、audit restore 與 seed draft 後 portfolio 立即重算；BOSS002 實測移除 Reactive 成員時 `1/2→0/3`，換回後恢復。
- 目前 100 組 deterministic audit recommendation 的精確 portfolio 為 `0 GAP-FREE／100 HAS GAPS`，且 100 組皆為 `NO_REACTIVE`；這不否定 100/100 runtime clear，只揭露不同層級的結構證據。
- `BATCH-P01-012` 10 張已原子匯入；全部 `1024×1536`、2:3 技術 QA 通過，active Source Art 累計 120/300，120 名角色遊戲載入 smoke 通過。正式人工核准仍為 false。
- 16 test files／89 tests、TypeScript 與 production build 通過；Chrome smoke 驗證 filter/sort、即時重算、reload、Campaign isolation、1440×900 單頁及 768px 無水平 overflow。

## 2.32.0-audit-seeded-drafts - 2026-07-16

- UNDRAFTED Route 新增「採用 AUDIT 隊伍」；直接使用該 Boss compact audit snapshot 的三個 `recommendedTeamIds` 建立並載入 Challenge draft，不必先開 Crew Tab。
- 新增 `seedBossChallengeSquadDraftFromAudit` domain contract；強制核對 Boss ID、audit success、三人唯一性與 character FK，相同隊伍保持 idempotent。
- 建立後若原本位於 UNDRAFTED filter，Route 會回到 ALL 並留在目前 Boss，立即顯示 DRAFTED、stable IDs、Counter、Stage 與 gaps；local best 不會被建立或覆蓋。
- BOSS004 實測 audit 隊伍為 Counter `3/3`、Stage `6/6`，且正式結構摘要仍保留「無 Reactive 事件回應」；runtime audit 成功不會被誤寫成 structural gap-free。
- 16 test files／88 tests、TypeScript 與 production build 通過；Chrome smoke 驗證 2→3 drafts、reload、best provenance、Campaign raw save 隔離、1440×900 單頁與 768px 無水平 overflow。

## 2.31.0-challenge-draft-route - 2026-07-16

- Boss Challenge Route 新增 `ALL／DRAFTED／UNDRAFTED` 規劃狀態交集篩選與 `DRAFTED FIRST` deterministic sort；可直接盤點 100 個 Boss 的規劃覆蓋率。
- 選定 Boss 的 Route 新增 squad draft strip，顯示三個 character stable IDs、正式 Counter、6-stage coverage 與 Strategy structural gaps，並可在 Route 一鍵重新載入 draft。
- Route draft 摘要直接重用 `createBossChallengeStrategyBriefing`；Counter、Stage 與 gaps 不在 React 顯示層重複判定。
- 修正 UNDRAFTED 瀏覽語意：單純切換 Boss 只載入既有 draft 或預設隊伍，不會自動建立新 draft；手動換人、Candidate 與 audit restore 仍會保存。
- 新增 100 Boss draft FK／摘要、DRAFTED／UNDRAFTED 與 drafted-first tests；16 test files／86 tests、TypeScript、production build 及 Challenge browser smoke 全數通過。
- Chrome smoke 驗證兩個 drafted／98 個 undrafted、瀏覽不寫入、reload、one-click resume、Campaign raw save 隔離、1440×900 單頁及 768px 無水平 overflow。

## 2.30.0-boss-squad-drafts - 2026-07-16

- Boss Challenge save 升級為 `owm.challenge.v2`；啟動時可由既有 v1 local best 自動 migration，並將每個 Boss 的 `draftByBossId` 與 `bestByBossId` 分開保存。
- Route 切換、Crew 手動換人、Strategy Gap Candidate 套用／復原及 audit 隊伍恢復都會更新目前 Boss 的三人 stable-ID draft；切換回原 Boss 或 reload 後會精確還原。
- 完成挑戰後保留「實際 local best team」與「目前規劃 draft」兩份 provenance；Challenge v2 仍不寫入 Campaign v4、onboarding 或 Campaign 匯出檔。
- 新增 schema v1→v2、100 Boss draft FK、三人唯一性、best/draft 分離與 no-op persistence tests；16 test files／84 tests、TypeScript 與 production build 全數通過。
- Chrome smoke 驗證 BOSS002／BOSS003 draft 切換與 reload、BOSS001 best/draft 並存、Campaign raw save 隔離、1440×900 單頁及 768px 無水平 overflow。

## 2.29.0-strategy-gap-candidates - 2026-07-16

- 新增 pure TypeScript `bossChallengeCandidate.ts`；對 capability roster 的每位角色完整比較三個單席替換，先為每人保留最佳席位，再依缺口數、Stage、Counter、技能結構與 stable ID deterministic 排序。
- BOSS001 Reactive 缺口會實際評估 60 名候選 × 3 席＝180 個 swaps；前三名皆將 Reactive `0→1`、Counter `2/3→3/3` 且保持 Stage `6/6`。
- Crew 新增 Strategy Gap Candidates；三張卡同時顯示 Reactive、全隊恢復、低 Energy、Counter 與 Stage 的 before→after，可一鍵套用單席 stable ID 並復原上一隊。
- Candidate panel 固定標示 `STRUCTURAL PREVIEW · NOT AUDIT VERIFIED`；只做結構比較，不執行 runtime、不推導成功率，也不改寫 Squad Advisor 的 audit 來源。
- `BATCH-P01-011` 10 張已原子匯入；全部 `1024×1536`、2:3 技術 QA 通過，active Source Art 為 110/300，110 名角色遊戲載入 smoke 通過。正式人工核准仍為 false。
- 16 test files／82 tests、TypeScript、production build、Challenge apply/restore、Campaign raw save 隔離、1440×900 單頁與 768px 無水平 overflow 全數通過。

## 2.28.0-crew-capability-filters - 2026-07-16

- 新增 pure TypeScript `crewCapability.ts`，將 Reactive、全隊 fatigue recovery 與 `≤4 Energy` 一般技能統一為可重用判定；Strategy Briefing 與 Crew roster 不再各自維護條件。
- Crew roster 新增 Skill Capability filter：`ALL／REACTIVE／TEAM_RECOVERY／LOW_ENERGY`；Campaign 只計算當前 Mastery 已解鎖技能槽，Challenge 固定 M3 計算四個技能槽。
- Strategy 的 Reactive／全隊恢復／低 Energy 缺口新增一鍵導引；按下後清除殘留的手動交集條件、切換 Crew Tab 並套用對應 filter，不自動改隊或宣稱已通過 audit。
- 300 人正式資料在 Challenge M3 下 deterministic 結果為 Reactive 60、全隊恢復 300、低 Energy 一般技能 240；排序仍沿用 readiness、fatigue、Mastery 與 stable ID。
- Chrome smoke 實際由 BOSS001 Route 的 Reactive gap 一鍵切到 Crew `60/300`，並驗證三個 filter、Campaign raw save 逐字隔離、1440×900 單頁與 768px 無水平 overflow。
- 15 test files／79 tests、TypeScript 與 production build 全數通過；React 主 chunk 354.44 kB，Phaser lazy chunk 1,380.69 kB。

## 2.27.0-challenge-strategy-briefing - 2026-07-16

- 新增 pure TypeScript `bossChallengeStrategy.ts`；直接重用 `BOSS_CLASS_RULES`、`BOSS_CLASS_TELEGRAPHS`、`branchEventForRound`、`teamStageCoverage` 與角色四個固定 M3 技能欄位，不建立第二套勝負或 mitigation 規則。
- Route／Crew 新增 Challenge Strategy Briefing：顯示 Boss base fatigue、class 每回合受壓資源、正式 `R01／R04／R07` branch windows 與每次事件影響資源。
- 目前三人隊伍會即時統計 Reactive event response、所有 `target=Allies + fatigueDelta<0` 的正式全隊恢復技能、一般回合 `≤4 Energy` 選項、6-stage coverage 與 Boss counter。
- 結構缺口包含無 Reactive、受 fatigue class 但無全隊恢復、受 energy class 但無低 Energy 一般技能，以及六階段未完整；UI 明確聲明這只是 gameplay 準備資訊，不是現場安全建議或成功率預測。
- Chrome smoke 驗證 BOSS080 顯示 GRD `Safety -2/R、Energy -2/R`，BOSS001 顯示 WEA `Weather -4/R`；換入 `CHR-GOV-003` 後 Reactive 由 `0 GAP` 即時變為 `1 READY`，恢復 audit 隊伍後缺口同步返回。
- 14 test files／76 tests、TypeScript、production build、完整 Challenge runtime、Campaign raw save 隔離、1440×900 單頁與 768px 無水平 overflow 全數通過。

## 2.26.0-challenge-squad-compare - 2026-07-16

- 新增 pure TypeScript `compareBossChallengeSquads`，以正式 `teamStageCoverage` 與 Boss counter factions 比較目前手動隊伍和 audit 推薦隊伍；輸出 Counter、6-stage coverage、共用成員、每階段 delta、相同 composition 與精確席位狀態。
- Challenge Crew 的 Squad Advisor 改為 CURRENT／AUDIT 比較矩陣；三名推薦角色即時標示 `KEEP／SWAP`，六階段顯示 `目前→audit` 數值與 delta，手動換人後不需重新整理。
- 「恢復稽核隊伍」會套回三個推薦 stable IDs；已完全套用時顯示 `VERIFIED · AUDIT TEAM` 並鎖定按鈕。相同三人但席位不同仍辨識為相同 composition，並允許恢復 audit 順序。
- 比較面板明確聲明只描述固定 M3、標準裝備、10 回合下的 deterministic gameplay 結構，不代表現場或真實成功率。
- Challenge browser smoke 驗證 BOSS001 初始 `2/3 Counter、6/6 Stage、0/3 Members` 對 audit `3/3、6/6、3/3`；套用、手動換人、即時重算、再次恢復、完整 runtime、Campaign raw save 隔離均通過。
- 13 test files／73 tests、TypeScript、production build、1440×900 單頁與 768px 無水平 overflow 全數通過。

## 2.25.0-challenge-squad-advisor - 2026-07-16

- Challenge audit compact snapshot 新增每個 Boss 的三個 `recommendedTeamIds`；browser 與 Python data gate 都會拒絕角色不存在、重複或非三人隊伍的資料。
- 新增 pure TypeScript `bossChallengeSquad.ts`，由 Boss、audit 與角色 Source of Truth 派生推薦成員、Boss counter 數與六階段 coverage；100/100 推薦隊伍皆為唯一三人且達到 6/6 coverage。
- Challenge Crew 右側加入 Squad Advisor，顯示 audit score／round／candidate clear rate、三名技師與固定 M3、counter 及 stage coverage；玩家可一鍵套用三個 stable IDs，套用後狀態立即確認。
- Advisor 只更新暫時性的 Challenge deployment state，不修改 `owm.campaign.v4`；BOSS001 browser flow 驗證精確套用 `CHR-MAR-200／CHR-MAR-220／CHR-OMI-270` 與 Campaign raw JSON 逐字不變。
- 視覺 QA 修正 Challenge Crew 摘要誤顯示 loadout 加成後 11 回合的問題，現在與 runtime、briefing 一致固定為 10 回合。
- 13 test files／71 tests、TypeScript、production build 與 Challenge smoke 通過；1440×900 Crew Advisor 保持單頁無捲動，768px 無水平 overflow。

## 2.24.0-challenge-route-intelligence - 2026-07-16

- Boss Challenge Route 新增 Severity、14 Class、未挑戰／已通關／未通關交集篩選，以及 ID、Severity、best-score 升降冪與 Audit Hardest 排序；篩選零結果時 Deploy 會鎖定。
- Route 顯示所選 Boss 的 deterministic audit pressure、score、成功候選隊／總候選隊、candidate clear rate 與完成回合；`BOSS075／079／080` 以 hard-outlier 樣式標示為低分但已證明可通關。
- 新增 `bossChallengeRoute.ts` 與 3 項 domain tests；排序 tie-break、狀態分類與交集篩選不依賴 React。
- `simulate:challenge` 另輸出 `json/bossChallengeAudit.json` compact snapshot；browser 與 Python data validation 均要求 schema v1、gates PASS、100/100 Boss FK 與有效 hard-outlier IDs。
- 調整 validation 順序，先更新 Challenge audit，再同步 `public/data`、執行 12 test files／69 tests 與 production build，避免 UI 打包過期 snapshot。
- `smoke:challenge` 實際驗證 S5 20/100、S5+GRD=`BOSS080`、Audit Hardest、空結果部署鎖定、1440×900 單頁、768px 無水平 overflow、Challenge persistence 與 Campaign isolation。

## 2.23.0-challenge-balance-audit - 2026-07-16

- 新增 100 Boss deterministic Challenge balance audit；三種 counter set 各精確比較 `C(300,3)=4,455,100` 組三人隊伍，再以 balanced／power／survival 各前 8 隊逐 Boss 實跑正式 runtime。
- 新增 `balance/boss-challenge-balance-report.md/.json`、公平性 gates 與 `pnpm simulate:challenge`；`pnpm validate`、`validate_project.ps1` 現在都會阻擋無解 Boss、候選隊伍不足、低階不可及、severity inversion 或缺少 S5 壓力的版本。
- 首輪 audit 找到唯一固定配裝死局 `BOSS080`；加入 Challenge-only GRD reserve：S4 Weather Protection +1，S5 Weather Protection +3 並每回合 Energy +1。Campaign、Boss master data 與原始 VES002 數值完全不變。
- 最終 audit 為 100/100 clear、每 Boss 至少三隊成功、0 severity inversion；S5 為 17 tight／3 critical／0 comfortable，沒有用全域 buff 洗平終局難度。
- 新增 4 項 regression tests；11 test files／66 tests、TypeScript 與 Challenge audit 全數通過。

## 2.22.0-boss-challenge - 2026-07-16

- 新增獨立 Boss Challenge mode：可選全部 100 Boss 與 300 角色；固定 Mastery L3（250 XP）、10 回合及 `EQ0051 + EQ0126 + VES002` L1 配置，與自由全開的 Sandbox 明確分離。
- 新增 pure TypeScript `bossChallenge.ts` 與 `owm.challenge.v1`：沿用正式 Mission runtime／S–D debrief，只保存每個 Boss local best；高分優先，同分時完成優先，再以較少回合決勝。
- Challenge runtime、換班與 Reactive skill 全部使用固定 L3；不讀取或寫回 Campaign XP、MNT、RST、持久疲勞、Equipment Condition、解鎖或任務進度。
- Deployment 新增公平條件、完成數／平均最佳／S grade 摘要、選定 Boss 紀錄、300 人 filters 與鎖定的標準 loadout；Operation 與結果頁明確顯示模式與 Campaign isolation。
- 1440×900 的角色卡資訊進一步壓縮，技能與 Challenge 結果仍留在單一 viewport；768px 維持無水平 overflow。
- Subagent 完成 `BATCH-P01-010` 10 張 P01；active Source Art 增至 100/300。10/10 為 `1024×1536`、2:3，無 reframe／regenerate，仍保留 `Visual Review Required` 與 upscale pending。

### 驗證狀態

- 10 test files／62 tests、TypeScript、15 關 balance、資料 QA、300 筆 R3 prompt QA 與 production build 全數通過。
- `smoke:challenge` 實際完成一場 Challenge，驗證 100 Boss、300 crew、固定 L3／10 回合／L1、local best reload、Campaign save 逐字不變、1440 single-screen 與 768px 無水平 overflow。
- 既有 gameplay、Sandbox、onboarding、single-screen layout 與 100 張 Source Art browser smoke 全數通過；Batch010 三張代表圖只完成本輪視覺抽查，不等同最終人工核准。

## 2.21.0-career-track-progression - 2026-07-16

- 新增 pure TypeScript `careerTrack.ts` 與共用 `progression.ts`：60 條 Track 各含 L1–L5；同 Track 五名角色的 `characterXp` 加總達 `100／250／500／900` 時依序新增高階卡，L1 與所有已解鎖低階卡永久保留。
- 新 Campaign roster 由 300 人改為 60 名 L1；Deployment selector、Crew Rotation Advisor、預設／onboarding team 與 deploy guard 只使用已解鎖角色。Sandbox 仍開放全部 300 名與所有技能。
- Track XP 完全由既有角色 XP 派生，不新增 persistence 欄位；v4 save、v1/v2/v3 migration、JSON export/import 均維持相容。匯入較低進度時，鎖定席位會優先回退到同 Track 最高可用角色。
- Crew Rotation Advisor 改為完整比較 `C(U,3)`，`U` 是當下所有已解鎖且可出勤角色；手動 filters 仍不縮小 Advisor 搜尋範圍，畫面直接顯示實際搜尋人數。
- Collection 卡牌新增 Career locked/unlocked、Track L、aggregate XP 與下一階門檻；Debrief 顯示部署 Track 的 XP 前後值及本次新解鎖角色。
- 首次導覽改用 `CHR-GOV-001／CHR-MAR-176／CHR-OMI-221` 三名 L1。首次 Reactive window 先教玩家承受完整後果；Track L3 後才會出現 Reactive 角色卡，不再預借鎖定的 `CHR-OMI-223`。

### 驗證狀態

- 9 test files／58 tests：含 60×5 資料結構、四個精確門檻、Track XP 加總、隊伍降階正規化、15 關固定 L1 隊伍達成三條 L5，以及既有 300 人 Advisor 效能 regression。
- 1440×900 single-screen 驗證新 Campaign `60/300`、鎖定 L3 不進 selector、Advisor 只搜尋 60 人；gameplay 驗證任務後兩條 Track 跨越門檻、Debrief 解鎖兩名 L2、reload 後 Collection `64/300`。
- Gameplay、onboarding、v1–v3 migration、save v4 isolation、768px flow、Campaign balance、TypeScript 與 production build 全數通過。

## 2.20.0-crew-rotation-advisor - 2026-07-16

- Campaign Crew Tab 新增 roster 搜尋、Faction、Readiness 與最低 Mastery filters；篩選只影響手動 selector，不縮小自動建議的 300 人搜尋範圍。
- 新增 pure TypeScript `crewRotation.ts`：完整比較 `C(300,3)` 組合，依序優先滿足 Mission Mastery gate、降低 round-limit Exhausted／Critical／Tired、補齊六階段涵蓋與 Boss counter，再比較 Mastery perk、保留現有成員與疲勞比例。
- 建議結果保持 deterministic；同分時保留現有隊伍，避免沒有 gameplay 收益的無謂輪調。300 人完整搜尋測試約 150 ms，沒有使用近似候選池。
- Crew 右側分析區顯示三名建議技師、目前→回合上限疲勞、Mastery、coverage、counter 與風險改善，並可一鍵套用三個席位。
- Dispatch Forecast 串接同一份建議；套用後 Crew forecast 立即重新計算，Advisor 轉為 `OPTIMAL`，不建立第二套疲勞公式。
- 將 Readiness `40% / 70% / 100%` 門檻抽為共用 domain function，修正 Forecast 先前使用 `50% / 75%` 的顯示差異。
- `smoke:layout` 新增 300/300 roster、ID/Faction filter、一鍵套用、Forecast 同步與 1440×900 無 overflow 驗證；gameplay smoke 新增 768px Crew／Forecast 水平 overflow 與 advisor 顯示檢查。
- Subagent 完成 `BATCH-P01-009` 10 張 P01；`CHR-DEV-098` 首次輸出尺寸異常時未匯入，重新生成為 `1024×1536` 後才原子式同步，active Source Art 增至 90/300。

### 驗證狀態

- 8 test files／53 tests、TypeScript、完整 gameplay、onboarding、1440×900 single-screen 與 768px Crew／Forecast smoke 通過。
- 完整 `validate` 通過：15/15 Campaign progression、maintenance 與 Crew readiness balance 維持 PASS；300 筆 R3 prompts、90 名 active Source Art 載入、TypeScript 與 production build 均通過。
- 所有輪班與疲勞數值維持 gameplay abstraction，不代表現場人因或排班規範；Batch 009 只完成技術 QA，仍標記 `Visual Review Required`。

## 2.19.0-dispatch-forecast - 2026-07-16

- Campaign Deployment 新增第五個「出勤預測」Tab；在出勤前同頁顯示 Equipment Condition、MNT、Crew fatigue envelope 與 RST 可能影響。
- `createDispatchForecast` 直接重用正式 `equipmentWearForMission`、`maintenanceCreditsForMission`、Mastery fatigue protection、Boss class baseline 與 vessel recovery 規則，不維護第二套結算公式。
- Equipment 同時顯示成功／失敗後 Condition 與 wear；MNT 顯示任務 reward range、任務後完整修復成本，以及修滿後預估餘額。
- Crew 顯示目前疲勞、每回合 baseline、1 回合返航後與 round-limit 上界；明確排除主動技能 fatigue、Support、RiskShield、branch decision 與換班，避免將 envelope 誤解為必然結果。
- RST 顯示目前值、依 CTV／SOV／USV 正式規則取得量與任務後餘額；所有數值維持 gameplay abstraction 標示。
- 新增 `dispatchForecast.test.ts` 兩項 pure domain tests；驗證第一章 success/failure wear、MNT reward/repair liability、SOV +2 RST、L5 fatigue protection 與返航恢復。
- `smoke:layout` 擴充為五個 Deployment Tab，並驗證第一關 `C100→92/86`、`C100→95/91`、`+24–34/+11 MNT`、`97–107/79 MNT` 與 `3→5 RST`。
- 修正 onboarding active step effect：切換 Deployment Tab 不再因 dependency 變更被重設回 Route；onboarding desktop／768px regression 通過。

### 驗證狀態

- 7 test files／48 tests、TypeScript、gameplay、onboarding 與 1440×900 single-screen layout smoke 通過。
- 完整 gameplay smoke 仍涵蓋 v1/v2/v3→v4 migration、15 missions、Codex、Collection、Sandbox、maintenance、Crew readiness 與 768px touch flow。

## 2.18.0-single-screen-field-feed - 2026-07-16

- 桌面版改為單一 viewport 工作區：Deployment 分為「任務航線／作業許可／Crew／裝備」四個 Tab，底部部署動作列維持可見，不再靠整頁向下捲動找設定。
- Collection 分為「Crew 卡牌／資源與存檔」兩個 Tab；300 名角色以每頁 5 張呈現，新增 faction filter、ID／姓名／職種搜尋與分頁。Codex 改為每頁 3 筆。
- Operation 中央視窗接入 AI 生成的寫實海上風場 field-feed 背景，使用 SOV 甲板視角、合理海況與多座三葉片風機。
- 移除舊的矩形葉片風機圖示；新增 `turbineGeometry.ts`，以單一 hub origin 建立三支 120° 等距 tapered blade，Phaser tween 只旋轉同一 rotor container。
- 新增兩項 turbine geometry tests，驗證葉尖長度、120° 間距、root 落在 hub 內與不產生 off-axis rectangle。
- 新增 `smoke:layout`：在 Chrome 1440×900 驗證 Deployment 四個 Tab、Collection 兩個 Tab、Codex 與 Operation 都沒有文件層級水平／垂直 overflow。
- 更新 gameplay 與 Source Art smoke，使既有完整流程依 Tab／分頁操作；Campaign、Sandbox、onboarding、save v4、maintenance 與 Crew readiness 行為維持不變。
- Subagent 完成 `BATCH-P01-008` 10 張 P01 v001；active Source Art 增至 80/300，全部為 1024×1536、2:3，未新增 reframe 或 regenerate 項目，保留 `Visual Review Required` 等待人工確認。

### 驗證狀態

- 6 test files／46 tests、TypeScript、production build、gameplay、onboarding、80 張 Source Art 與 1440×900 single-screen layout smoke 全數通過。
- 寫實 field-feed 內可見風機皆為三葉片；rotor digital twin 使用同一 hub 中心旋轉，並受「降低動態」設定控制。

## 2.17.0-crew-readiness - 2026-07-16

- Campaign 新增 mission-to-mission Crew fatigue：任務開始會載入角色既有疲勞，任務完成後保存實際部署與換班離隊角色的最終狀態，不再每場歸零。
- `crewFatigue` 採 sparse stable-ID map；未列角色視為 0。100% Exhausted 會由 domain 與 Deployment UI 共同阻擋出勤，Critical 仍允許玩家承擔風險。
- 新增 Rest Token（RST）：新 Campaign 起始 3；SOV 任務取得 2、其他船舶取得 1。手動 Rest 消耗 1 RST，恢復 `max(20, ceil(fatigueMax×40%))`。
- 任務後自動套用返航恢復：部署角色依船舶 `fatigueRelief×2` 恢復，Reserve 角色依個人 `fatigueRecovery×2` 恢復，形成輪調與休息 resource loop。
- Deployment 新增三人 Crew Readiness cards、Stable／Tired／Critical／Exhausted、fatigue meter、Rest 操作與 blocked reason；Topbar 顯示 RST。
- Debrief 顯示 RST reward、任務末→返航後疲勞與 Reserve recovery；Collection 顯示 300 人 readiness 統計與各角色持久疲勞。
- Campaign save 升級至 v4，使用 `owm.campaign.v4` 並新增 `recoveryTokens`、`crewFatigue`；v1/v2/v3 localStorage、envelope 與裸進度均會 migration。
- Balance report 新增 sequential L5 Crew readiness economy gate：15/15 可部署、15/15 完成、起始 3 + 任務取得 29 = 結餘 32 RST；正常推薦輪調路線不需手動 Rest，最高持久疲勞 1%。
- Gameplay smoke 另注入 100% Exhausted 狀態，驗證 Deploy blocked、消耗 1 RST 後 100→60 並恢復出勤；同時涵蓋 v1/v3→v4 migration、reload、Collection 與 save envelope。
- Vitest 擴充至 5 files / 44 tests；新增疲勞 normalization、deployable gate、Rest、返航恢復與 Reserve recovery 測試。

### 驗證狀態

- 44 tests、TypeScript、資料 QA、45 次 runtime + maintenance + Crew readiness balance、production build、gameplay／onboarding／Source Art browser smoke 全數通過。
- Desktop 與 768px Crew Readiness UI 無水平 overflow；browser console 無錯誤。
- Fatigue、RST、Rest 與 recovery 數值是 gameplay simulation，不是人因工時、現場輪班規範、SCADA 或實驗數據。

## 2.16.0-equipment-maintenance - 2026-07-16

- Campaign 新增 Equipment Condition `0–100`；任務結算只損耗實際攜帶的 Equipment／SPARES，成功與失敗使用不同 deterministic wear。
- Condition 低於 25% 時 domain 與 UI 共同阻擋部署；已持有的 grounded 項目仍可在 selector 選取，以便玩家指定維修。
- 新增 Maintenance Credits（MNT）：新 Campaign 起始 80，任務依 Chapter、完成狀態與分數發放；完整維修費用依缺損與 L1–L5 tier 計算。
- Deployment 新增雙裝備 condition meter、serviceable／grounded 狀態、維修報價與按鈕；Topbar、inventory strip 與 Collection 顯示 MNT、serviceable 及 worn 統計。
- Debrief 顯示 MNT reward 與兩件裝備 `before → after` 損耗；所有 wear、repair 與 MNT 數值均標示為 gameplay abstraction。
- Campaign save 升級至 v3，使用 `owm.campaign.v3` 並新增 `maintenanceCredits`、sparse `equipmentCondition`；v1/v2 localStorage、envelope 與裸進度均可 migration。
- Save normalization 只保留已持有裝備的合法 `0–99` condition；未列項目視為 100，避免 200 項完整狀態造成存檔膨脹。
- Balance report 升級並加入 full-repair economy gate：L5 15/15 可出勤，獲得 654 MNT、支出 438、結餘 296，最低任務後 Condition 84%。
- Gameplay smoke 驗證任務損耗、reload persistence、完整維修扣款、低於 25% grounded、v1→v3 migration、Collection/save v3、Sandbox isolation 與 768px layout。
- Vitest 擴充至 5 files / 43 tests；新增 condition normalization、serviceable threshold、tier repair quote、資金不足與完整維修測試。

### 驗證狀態

- 43 tests、TypeScript、資料 QA、45 次 runtime + maintenance balance、production build、gameplay／onboarding／Source Art browser smoke 全數通過。
- Desktop 與 768px Maintenance UI 無水平 overflow；browser console 無錯誤。
- Condition、MNT、wear 與 repair cost 是 gameplay simulation，不是現場工時、維修費、SCADA 或實驗數據。

## 2.15.0-equipment-inventory - 2026-07-16

- 將 200 項 Equipment 正式納入 Campaign inventory：L1–L5 各 40 項，新戰役起始持有全部 L1。
- 第 3／6／9／12 關新增 L2／L3／L4／L5 tier reward；任務資料、TypeScript 與 Python QA 共同驗證四個唯一 milestone。
- Campaign selector 顯示全部 Equipment／SPARES，但未持有項目以 `🔒` disabled；deploy domain guard 會再次拒絕未持有 loadout。Sandbox 維持全部 200 項開放。
- Collection 新增 inventory 總數、tier 及八種 category 統計；Debrief 顯示章末 tier reward 與取得數量。
- Campaign save 升級為 v2，加入 `ownedEquipmentIds` 並改用 `owm.campaign.v2`；v1 localStorage、envelope 與裸進度會依已完成 milestone 自動重建應得 inventory。
- Save normalization 移除未知 ID 與尚未取得的高階裝備，避免不完整舊檔造成下一章 soft-lock，也避免匯入超前 inventory。
- Gameplay smoke 驗證初始 40/200、locked selector、Collection 統計、v2 persistence/export、v1→v2 160/200 migration、Sandbox 全解鎖與 768px layout。
- Vitest 擴充至 5 files / 42 tests；新增 milestone reward、v1 migration、inventory reconstruction 與非法項目清理測試。

### 驗證狀態

- 42 tests、TypeScript、資料 QA、45 次 balance run、production build、gameplay／onboarding／Source Art browser smoke 全數通過。
- Desktop 與 768px inventory UI 無水平 overflow；browser console 無錯誤。
- Equipment、weather、cost 與 progression 數值均為 gameplay abstraction，不是風場、SCADA、法規或實驗數據。

## 2.14.0-operation-readiness - 2026-07-16

- 15 個 Mission 新增雙語 `operationProfile`：虛構場址、weather／Sea State、work permit、最低 Mastery、PPE、access requirement、允許船舶、初始天候與動員成本。
- Campaign 新增 5 項 Operation Readiness gate；permit／PPE／access 由玩家明確確認，vessel compatibility 與至少兩名合格技師由系統計算。
- 未達 5/5 時 Deployment 與 onboarding 開始按鈕維持 disabled，並列出 blocked reason；切換 Mission 會清除三項人工確認。
- Gate 通過後將 `initialWeatherWindow` 與 `mobilizationCost` 套用至正式 Mission runtime，並寫入 Operation Log；Sandbox 維持自由部署。
- UI 新增 site code、forecast、Sea State、PTW、PPE、access、vessel 與 Mastery 稽核狀態；中英文均標示為 gameplay abstraction。
- Browser runtime 與 Python data QA 同步驗證 15 個唯一 site code、Chapter Mastery progression、雙語 PPE、允許船舶、天候／成本範圍與 abstraction 標記。
- Balance simulator 納入 readiness：L1 `6/15`、L3 `12/15`、L5 `15/15`；12 個 profile-mission 組合由 `ReadinessGate` 阻擋，既有 progression gate 仍為 PASS。
- Vitest 擴充至 5 files / 41 tests；gameplay 與 onboarding smoke 新增 5/5 gate、disabled CTA、runtime consequences 與 768px layout 驗證。

### 驗證狀態

- 41 tests、TypeScript、資料 QA、45 次 balance run、production build、gameplay／onboarding／Source Art browser smoke 全數通過。
- Desktop 與 768px 均無水平 overflow；browser console 無錯誤。
- 所有 Operation Profile 數值只用於 gameplay，不是風場、SCADA、法規或實驗數據。

## 2.13.0-guided-onboarding - 2026-07-16

- 新增五段首次遊玩導覽：Deployment、Mission event deck、Reactive window、Diagnosis gate、Debrief。
- Reactive 與 Diagnosis 步驟綁定玩家實際回應；Debrief 出現後才能完成導覽，不以假按鈕跳過 gameplay。
- 新增目標 focus 樣式、五段進度列、等待狀態、跳過與 Topbar 重播入口；繁中／英文均有對應說明。
- 導覽狀態獨立保存於 `owm.onboarding.v1`；Campaign `owm.campaign.v1` schema、匯出 envelope 與 migration 保持不變。
- reload 遺失非持久化 mission session 時，active 導覽回復至 event deck，避免停在不存在的戰鬥畫面。
- 修正等待導覽卡攔截技能 click 的問題；desktop 等待卡移至上方，並只讓導覽 action buttons 接收 pointer events。
- 新增 `pnpm smoke:onboarding`，驗證五個焦點畫面、完成／重播／跳過 persistence、save isolation 與 768px horizontal overflow。
- Vitest 擴充至 5 files / 40 tests。

### 驗證狀態

- First-play → 五段引導 → 任務完成 → reload → replay → skip 全流程通過，browser console 無錯誤。
- Campaign save 維持原六個欄位，沒有寫入 onboarding 狀態。
- 既有 gameplay、balance、Source Art、typecheck 與 production build regression 保持必過。

## 2.12.0-balance-simulator - 2026-07-16

- 新增 `balance.ts` deterministic autoplay，直接使用正式 runtime、診斷、branch、loadout、Mastery perk 與 Debrief 規則。
- `pnpm simulate:balance` 執行 15 Mission × L1/L3/L5 Mastery 共 45 組 simulation，輸出 Markdown 與 JSON 報告。
- 三個 profile 使用相同的 L1/L3/L5 career-role 混合隊伍，避免角色技能組成造成不合理的 progression inversion。
- 新增 progression gates：L1 通過 Chapter 01–02、L3 通過 Chapter 01–04、L5 通過 Chapter 01–05，且 L5 S5 不得全部 comfortable。
- Baseline 發現 S5 在 round limit 前先因 WeatherWindow 失敗；每回合 Energy 回復由 `2` 校準為 `3`，SOV weather protection 由 `4` 校準為 `5`。
- 校準結果：L1 `12/15`、L3 `15/15`、L5 `15/15`；L1 三個 S5 全數失敗，L3/L5 S5 均為 tight／critical。
- S4/S5 round limit、reward XP 與 Chapter 05 最高 `×2.00` event deck 保留，避免在根因修正後過度放寬終局。
- `validate_project.ps1` 與 `pnpm validate` 現在將 balance simulation 納入必過 gate。
- Vitest 擴充至 4 files / 35 tests。

### 驗證狀態

- 45/45 deterministic runs 均輸出回合、天候、安全、疲勞、分數與 branch mitigation，可重現且無隨機數。
- L5 三個 S5 分別於第 7 回合完成，仍保留 11–22 WeatherWindow 與 tight／critical 壓力。
- 報告明確標示為 gameplay simulation，不是實際風場、SCADA 或實驗數據。

## 2.11.0-campaign-finale - 2026-07-16

- 新增 Chapter 05 三個 S5 終局 Mission：軸承熱失控、偏航聯鎖失效與最終絕緣危機。
- Campaign 擴充為五章十五關單一路徑 prerequisite 鏈；每章固定三關。
- Chapter 05 使用 `BOSS030 / BOSS045 / BOSS035` S5 Boss，event deck 強度由 `×1.35` 升至最終 `×2.00`。
- 新增 `KDX-013` 至 `KDX-015`，Knowledge Codex 擴充為 15 筆並維持每關一筆對應。
- 新增 `campaignCompletionSummary`，統計完成任務／章節、平均最佳分、Campaign grade、S 評級數與 L5 技師數。
- 第 15 關完成時 Debrief 顯示戰役完成；Deployment mission map 顯示完成摘要，全部 15 關維持可重玩。
- Data QA 新增連續 order、完整 prerequisite、五章各三關、S5 final deck 與 Mission/Codex 一對一驗證。
- Gameplay smoke 新增 Chapter 05 S5 deck、15/15 completion summary、最後一關 deck 與 15/15 Codex 驗證。
- Vitest 擴充至 3 files / 33 tests。

### 驗證狀態

- 15 個 Mission 共 45 個 deterministic trigger 通過資料與 Browser runtime 驗證。
- S5 第一關顯示 `×1.35 / ×1.60 / ×1.85`；最終關顯示 `×1.45 / ×1.70 / ×2.00`。
- 完成摘要顯示 `15/15` 任務、`5/5` 章節、平均分數與整體評級，completed 任務仍可選取。

## 2.10.0-mastery-perks - 2026-07-16

- 將原本保留的 Mastery L4/L5 門檻落成兩個可運作 perk。
- L4「專家整備」：個人起始 Energy +2，並為團隊初始 Evidence +3。
- L5「資深防護」：個人每回合 fatigue damage -2，並為團隊初始 Reliability +4。
- 團隊 bonus 會按三名角色各自 XP 累加；Campaign 使用實際 XP，Sandbox 開放全部六個 perk。
- 換班角色會依自身 XP 帶入起始 Energy、fatigue protection 與 perk status，但不重新套用部署時團隊 bonus。
- Deployment 新增 `TEAM MASTERY PERKS` 摘要；角色卡與 Collection 顯示 L4/L5 locked／active 狀態。
- Gameplay smoke 驗證 L5 + L4 + L1 隊伍為 `3/6` perks、Evidence +6、Reliability +4；進場後 L5 角色 Energy = 6、fatigue protection = 2、初始 Evidence = 18。
- Vitest 擴充至 3 files / 32 tests。

### 驗證狀態

- Campaign、Sandbox、換班與回合疲勞均使用同一組 perk domain modifiers。
- 900 XP 角色同時顯示兩個 active perk；500 XP 角色只顯示 L4，L5 保持 900 XP locked。
- 完整 Gameplay、Mission deck、Codex、Collection、Sandbox 與 768px regression 通過。

## 2.9.0-mission-event-decks - 2026-07-16

- `missions.json` 的 12 個 Mission 各新增三段 `branchEventDeck`，明確定義觸發回合、event code 與 intensity。
- Runtime 依 Mission deck 產生 deterministic event，先按 intensity 縮放 penalty，再由 Reactive skill 執行 mitigation；Sandbox 保留原通用 fallback 排程。
- Chapter 01 intensity 由 `×0.75` 漸進至 `×1.00`；Chapter 04 為 `×1.15 / ×1.35 / ×1.55`。
- 三個 S4 關卡採不同事件組合：軸承偏重天候／備品／次生故障，偏航偏重通訊／誤警報，電氣關先處理次生故障再驗證通訊與告警。
- Deployment 與 Mission Control 新增 event deck timeline；Branch panel、penalty preview 與 Operation Log 顯示 intensity。
- 資料 QA 新增 deck 長度、event code、正整數遞增回合與 `0.5–2.0` intensity 驗證。
- Gameplay smoke 驗證第一關 `×0.75` Reactive mitigation，以及 S4 軸承關 `×1.15` 天候事件實際造成 `-9` weather penalty。
- Vitest 擴充至 3 files / 30 tests。

### 驗證狀態

- 12 個 Mission 共 36 個 trigger 均通過 JSON／Browser runtime 驗證。
- S4 部署畫面顯示 `R01 天候 ×1.15 → R04 備品 ×1.35 → R07 二次故障 ×1.55`。
- 第一關 Reactive response 會對已縮放的 `×0.75` penalty 減傷；Chapter 04 未回應時完整扣除 9 點天候。

## 2.8.0-campaign-map - 2026-07-16

- 以四章十二關 Campaign mission map 取代 Mission 下拉選單，玩家可直接查看整條 prerequisite 路線。
- 任務節點顯示 completed／available／locked、selected、前置關卡、Boss severity／class、XP 與最佳評級。
- 選取可出勤節點時自動恢復該任務推薦 Equipment、Spare 與 Vessel；locked 節點維持不可操作。
- 新增 `campaignMissionStatus` 與 `campaignMissionGrade` pure functions，供 UI 與測試共用。
- Gameplay smoke 驗證初始 1 available／11 locked、完成後 1 completed／1 available、reload、第二關選取、3/3 推薦配置與 768px 無水平 overflow。
- Vitest 擴充至 3 files / 29 tests。

### 驗證狀態

- Desktop：四章十二關同屏顯示；第一關完成後顯示最佳評級，第二關可選，第三關仍鎖定。
- 768px：Chapter 以 2×2 排列，12 節點完整顯示且 `scrollWidth ≤ clientWidth`。
- 完整 Campaign、Codex、Collection、Sandbox、Reactive branch 與 Source Art 流程不受影響。

## 2.7.0-codex-chapter4 - 2026-07-16

- 新增 Chapter 04 三個 S4 Mission，Campaign 擴充為 12 關 prerequisite 鏈。
- 新增 `codex.json` 共 12 筆雙語工程概念、安全邊界與來源聲明，資料驗證包含 Mission FK 與中英文重點對齊。
- Knowledge Codex 解鎖直接由 `completedMissionIds` 推導，不新增 save 欄位，舊存檔與 reload 自動相容。
- 新增 Codex 分類篩選、鎖定條目、任務完成解鎖提示與 1/12–12/12 進度。
- Gameplay smoke 驗證第一關完成後 Codex 1/12、reload persistence、12 關選單及 12 筆條目。
- Vitest 擴充至 3 files / 28 tests。

### 驗證狀態

- 資料 QA：12 Mission、12 Codex entry 及所有 Boss／Scene／Equipment／Vessel／Unlock FK 通過。
- Browser：任務結算顯示 Codex 解鎖；reload 後 `KDX-001` 保持解鎖，其餘 11 筆維持鎖定；無 console error。
- 完整 production build、Source Art sync 與 768px touch flow 通過。

## 2.6.0-reactive-branches - 2026-07-15

- 新增天候惡化、備品延誤、二次故障、通訊中斷與誤警報五類 Mission branch event。
- Branch event 採 deterministic schedule，每三個已完成回合產生一次可重現事件。
- 新增 Reactive response state machine：消耗 AP／Energy、套用 fatigue／cooldown／status，依 Power 降低 branch penalty。
- Pending event 期間鎖定一般技能與下一回合；Reactive skill 不可在一般工程階段推進任務。
- 預設隊伍改用 `CHR-OMI-223`，其 L1 Reactive skill 可在第一回合回應天候惡化。
- 新增 branch event panel、完整後果預覽、Reactive 選項與「承受完整後果」操作。
- 修正 browser smoke 將 `160 XP` 中的 `0 XP` 誤判為零分的字串檢查。
- Vitest 擴充至 3 files / 27 tests。

### 驗證狀態

- Desktop：天候 branch 顯示 `-8`；Reactive response 後實際損失 `-4`，角色獲得 `RiskShield`／`BranchGuard` 並正確扣除 Energy。
- 768px：可透過 touch flow 完成相同 Reactive response；事件解除後 fixed action dock 恢復可用。
- 完整 Campaign smoke 仍可進入 Debrief、保存 XP、解鎖第二關並於 reload 顯示 1/9。

## 2.5.0-telegraph-and-touch - 2026-07-15

- 新增 14 種資料驅動 Boss telegraph 契約，各自包含 icon、accent、pattern 與受影響資源。
- Boss 回合事件同時觸發 React event card、Phaser scene pulse 與 Operation Log 文字結果。
- Mission Control 顯示 impact tags；角色卡新增 Fatigue、換班與 cooldown runtime status icons。
- 新增「降低動態」切換，停用 Phaser 循環動畫與強烈 pulse，並縮短 CSS animation。
- 新增 `≤900px` 單欄操作版面、44px touch targets 與固定回合 action dock。
- Gameplay smoke 增加 768×1024 viewport：實際切換低動態、部署、從 action dock 觸發 DRV event，並檢查無水平 overflow。
- Vitest 擴充至 3 files / 23 tests。

### 驗證狀態

- Desktop：DRV telegraph、impact tags、runtime status、Phaser event pulse 與回合 log 均顯示正確。
- 768px：`scrollWidth ≤ clientWidth`、低動態 `aria-pressed=true`、mobile action dock 可完成回合操作。

## 2.4.0-class-events-and-saves - 2026-07-15

- 實作 14 種 Boss class 的獨立回合事件，涵蓋 fatigue、safety、weather、evidence、reliability、progress、cost 與 Energy。
- Mission Control 顯示 Boss class 規則卡；每回合 Operation Log 記錄實際觸發的 class event。
- 新增 Campaign save JSON v1 envelope，可在 Collection 產生、下載、貼上並匯入。
- 匯入流程支援舊版裸 `CampaignProgress` migration，並拒絕損壞 JSON 與未支援版本。
- 新增 Chapter 03 三個 S3 Mission，Campaign 擴充為 9 關 prerequisite 鏈。
- Gameplay smoke 擴充至 DRV／STR class 規則、1/9 reload persistence、JSON envelope、300 角色 Collection 與 100 Boss Sandbox。
- Vitest 擴充至 3 files / 22 tests。

### 驗證狀態

- Campaign 第一關結算後顯示 1/9，reload 後第二關仍可選取。
- Collection 產生 `OWM_CAMPAIGN_SAVE` schema v1；Sandbox `BOSS100` 顯示 STR 規則且不修改 Campaign localStorage。

## 2.3.0-modes-and-collection - 2026-07-15

- 新增 Chapter 02 三個進階 Mission，Campaign 擴充為 6 關 prerequisite 鏈。
- 新增 Campaign／Sandbox／Collection 模式導覽。
- Sandbox 開放全部 100 個 Boss 與四技能槽，且不寫入 Campaign progress。
- 新增角色 Mastery 門檻 `0 / 100 / 250 / 500 / 900 XP` 與 Skill 2／Ultimate 解鎖。
- 新增 300 名角色 Collection grid，顯示 Source Art、character XP、Mastery bar 與技能槽狀態。
- Collection Source Art 採 lazy loading；browser QA 會等待首屏圖片 decode 後截圖。
- Gameplay smoke 驗證 300 collection cards、角色 XP、100 Boss Sandbox、全技能開放與 save isolation。
- Vitest 擴充至 3 files / 17 tests。

### 驗證狀態

- Campaign 第一關結算後顯示 1/6 並解鎖第二關。
- Collection 讀取實際角色 XP；Sandbox 部署 `BOSS100` 後 Campaign localStorage 維持不變。

## 2.2.0-training-campaign - 2026-07-15

- 新增 `missions.json`、`vessels.json` 及完整 Web/runtime FK 驗證。
- 建立 Chapter 01 三個連續教學 Mission 與 prerequisite 解鎖鏈。
- Deployment 加入裝備、SPARES、CTV/SOV/USV 配置與 3/3 loadout feedback。
- Diagnose 階段新增工程判斷 gate，答案直接影響 Evidence 或 Safety。
- Vessel gameplay abstraction 接入 fatigue、weather 與 safety 回合風險；Debrief 新增 cost score。
- 新增版本化 localStorage campaign save，保存總 XP、角色 XP、最佳分數、完成與解鎖狀態。
- Gameplay smoke 新增診斷、XP、下一關解鎖與 reload persistence 驗證。
- 修正 React StrictMode 下 Phaser host 可能殘留重複 canvas 的 lifecycle 問題。
- Vitest 擴充至 3 files / 15 tests。

### 驗證狀態

- 第一關可從 3/3 loadout 進入六階段作業，完成後解鎖 `MSN-TUT-002`。
- 正確診斷 Evidence +15，reload 後 campaign XP、完成度與解鎖選項仍存在。

## 2.1.0-playable-slice - 2026-07-15

- 新增 Deployment：100 個 Boss、300 名角色與 200 項裝備可選，限制三人隊伍不可重複並顯示六階段專業涵蓋。
- 將 Charter 核心循環落成「部署 → 作業 → 結算」垂直切片。
- Runtime 新增 faction stage affinity、equipment reliability、全隊 Support、換班、天候窗口、安全、證據、成本與任務失敗條件。
- 新增 Debrief 五維計分與 S–D 評級；完整支援 Detect → Diagnose → Isolate → Repair → Verify → Restore。
- 新增 `smoke:gameplay`，自動完成部署、回合風險、技能使用、六階段推進與結算。
- 修正部署 Source Art 快速切換時的 loaded-state race condition。
- 修正 Phaser scene 因陣營色重建後，telemetry 未同步最新 stage／risk 的問題。
- 完成 `BATCH-P01-006` 與 `BATCH-P01-007`，Source Art 累計 70/300；70 名角色 browser smoke 通過。
- Vitest 擴充至 2 files / 10 tests。

### 驗證狀態

- Gameplay browser smoke：部署 → Operation → 六階段 Debrief 通過，Phaser 與 Source Art 正常，無 console error。
- Source Art browser smoke：active index 內 70 名角色全數載入通過。
- Art manifest：`generated = 70`、`pending = 230`、`correctionQaPending = 10`、`upscalePending = 70`。

## 2.0.0-web-mvp - 2026-07-14

- 依使用者決策由 Unity 遷移為純 Web 專案。
- 建立 React 19、TypeScript 7、Vite 8 與 Phaser 4 架構。
- 將資料驗證、fatigue、AP、Energy、cooldown、status 與 MissionResolver 移植為 pure TypeScript domain。
- 完成單頁 Boss 任務 UI、三人隊伍、技能操作、回合推進與雙語介面。
- 將 Phaser 打包為 lazy chunk；React 主 UI production bundle 約 206 kB、Phaser chunk 約 1.38 MB。
- 加入 5 個 Vitest tests、production build、資料同步與 headless browser 互動 smoke test。
- 移除 Unity 專案與 Unity 專用 smoke harness。
- 建立 300 名角色各 1 張 P01 的 production manifest，跨 7 個 faction 分為 30 批。
- 完成 `BATCH-P01-001` 10 張 Source Art preview、匯入、SHA-256／尺寸紀錄與 QA report。
- 8 張通過 2:3 Web preview；2 張標記 `Reframe Required`；10 張皆標記 `Upscale Pending`。
- Web 角色卡接入 P01 asset fallback，首發三名角色完成 Source Art smoke test。
- 依 Engineering QA 新增三葉片風機正向幾何約束與負面提示詞，套用至全部 300 筆 P01。
- 鎖定後續角色為原創成年女性：可愛但專業、自然成年比例、PPE 合理且不性感化。
- 將 `CHR-MFG-126`、`CHR-OMI-221` 回標為 `Regenerate Required`，保留 v001 且禁止覆寫。
- 完成 `CHR-MFG-126`、`CHR-OMI-221` R3 v002，依人工確認通過 Engineering QA 並設為 active 版本。
- 新增 Source Art active index，依版本與 QA 紀錄提供遊戲載入，不再寫死 v001 檔名。
- 新增「已完成原畫」選單，可在遊戲內切換與預覽現有 10 名角色。
- 完成 `CHR-DIG-271` 2:3 v002 reframe，以 `Correction QA Pending` 狀態接入遊戲 review candidate。
- 擴充 v002 correction import 工具，支援單張匯入、相同檔案安全重跑、active version 尺寸與比例紀錄。
- 修正 reframe summary 以 active correction 比例為準，避免已修復的 v001 繼續被計為失敗。
- 完成 `BATCH-P01-002` 10 張 Source Art 生成、ID-safe import、尺寸／hash／比例與視覺 QA。
- 修正批次匯入工具，強制以 manifest 檔名對應，避免並行生成時依完成順序誤配角色。
- 新增可稽核的 visual QA overrides，偵測 `CHR-MAR-177` 額外背景人物。
- 完成 `CHR-MAR-177`、`CHR-DIG-272` v002 correction，以 review candidate 狀態接入 active index。
- 新增通用 `import-art-correction.mjs`，支援任意角色的版本化匯入、hash、2:3 gate、QA report 與 summary 更新。
- 完成 `BATCH-P01-003` 10 張 L3–L5 Source Art 生成、ID-safe import 與全項 QA；10/10 為 2:3。
- 將風能研究員手持縮尺 rotor 納入 Engineering QA，確認三葉片與支撐 mast 的幾何關係。
- 完成 `BATCH-P01-004` 10 張 Source Art 生成、ID-safe import、尺寸／hash／比例與視覺 QA；10/10 active 版本為 2:3。
- 對 `CHR-DEV-090`、`CHR-ACA-046`、`CHR-MFG-131` 產生非破壞性 v002，分別移除額外人物／多餘 rotor、封閉 wave-basin 背景及修正 weld gauge。
- 修正 `qa-p01-batch.ps1`，技術 QA 改以 active asset 尺寸與檔名判定，避免 v002 被 v001 metadata 誤報。
- 修正 visual QA override 摘要重算，完整 manifest 現可正確顯示 6 張 `Correction QA Pending`。
- Source Art smoke 擴充至 40 名角色，並輸出三張 Batch 004 v002 的完整遊戲畫面。
- 完成 `BATCH-P01-005` 10 張 Source Art 生成、ID-safe import、尺寸／hash／比例與視覺 QA；10/10 為 2:3，無新增 regenerate 或 reframe 項目。
- Source Art smoke 擴充至 50 名角色，並輸出 Batch 005 的 OMI、DIG、GOV 代表卡牌完整遊戲畫面。

### 驗證狀態

- JSON counts、unique IDs、FK、四技能、P01–P10 與 Web data sync：通過。
- TypeScript typecheck：通過。
- Vitest：2 files / 5 tests 通過。
- Vite production build：通過。
- Browser smoke：Phaser canvas、技能、隊員切換、回合、疲勞 log、語言切換與 console error scan 通過。
- Source Art smoke：首發三名角色載入、切換、裁切與 console error scan 通過。
- Source Art index smoke：10 名角色全數載入通過，v002 激活狀態正確且無 console error。
- DIG v002 smoke：遊戲卡顯示 `P01 V002`，active index、2:3 比例與 console error scan 通過。
- Batch 002 Source Art smoke：active index 內 20 名角色全數載入，`CHR-MAR-177`、`CHR-DIG-272` 顯示 v002，無 console error。
- Batch 003 Source Art smoke：active index 內 30 名角色全數載入，L5 角色卡與 console error scan 通過。
- Batch 004 Source Art smoke：active index 內 40 名角色全數載入，三張新增 v002 顯示正確且無 console error。
- Batch 005 Source Art smoke：active index 內 50 名角色全數載入，三張代表卡牌顯示正確且無 console error。
- Art prompt validation：300 筆 P01 均包含 exactly-three-blades、120° spacing、blade deformation/intersection guardrails。

## 1.1.0-runtime-mvp - 2026-07-14

- 建立 Unity 2022.3 LTS 專案結構、Packages 與 assembly definitions。
- 將全部 JSON 同步到 `Assets/StreamingAssets/OWM/`。
- 修正 manifest/summary 檔案清單遺漏 `factions.json` 與 `tracks.json`。
- 補齊全部資料模型與 manifest/FK/ID/prompt variant 驗證。
- 將 `GLOBAL/ALL` 明定為跨職涯、跨陣營共用技能契約。
- 實作 CharacterRuntime、MissionResolver 與 OWMGameSession。
- 實作 CardView、CardFrameOverlay、SkillButtonView 與 Addressables Sprite loader。
- 加入繁中/英文顯示與非純色彩的疲勞狀態提示。
- 加入 Editor 驗證選單、EditMode tests、獨立 Python QA 與 .NET smoke harness。

### 驗證狀態

- Python 資料驗證：通過。
- .NET 全部 runtime/UI C# syntax compile 與 core smoke：通過；僅有 Unity Inspector serialized field 的預期未指派警告。
- Unity Test Runner：未執行；本機 Unity 安裝目錄缺少 `Unity.exe`。

> 1.1.0 Unity 路線已由 2.0.0 Web 路線取代，Unity 檔案不再保留。
