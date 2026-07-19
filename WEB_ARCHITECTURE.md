# OWM Web 架構決議

版本：3.27.0-source-art-batch016-r6-active-import  
日期：2026-07-18

## 3.29 architecture increment

- `BATCH-P01-022` now has three R7 QA sample images under `assets/source-art/qa/BATCH-P01-022-r7-samples/`, plus a sample contact sheet and sample QA manifest.
- The sample QA manifest records the `CHR-GOV-032` v001 aspect-ratio failure and the valid v002 replacement, keeping rejected evidence separate from current candidates.
- Samples are deliberately isolated from `public/assets/source-art/p01/index.json`; they cannot appear in game surfaces until explicitly imported later.
- This is asset QA staging only; active art files, public Source Art index entries, gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.28 architecture increment

- Pending/future P01 Source Art prompts now use `OWM-P01-R7-CASTING-VARIETY-ANTI-CLONE` for the remaining 90 pending images.
- The art prompt pipeline now treats character identity as a first-class QA contract before outfit/background: apparent age decade, facial architecture, body build, posture line, action silhouette, camera angle, hand gesture, and tool interaction must vary visibly.
- `validate:art` now gates R7 prompts for copied-heroine collapse, outfit/background-only variation, soft idol-face collapse in masculine/androgynous slots, stronger pose/camera/body-type coverage, and at least 5 non-glamour task poses per pending 10-image batch.
- `tools/export-r6-batch-generation-pack.mjs` now exports prompt packs using the current revision label; `BATCH-P01-022` is the first R7 pack.
- This is prompt metadata and QA workflow only; active Source Art files, public Source Art index entries, gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.27 architecture increment

- `BATCH-P01-016` R6 assets are now active web-preview Source Art under `assets/source-art/p01` and `public/assets/source-art/p01`.
- The public Source Art index now exposes 210 active entries; Batch016 contributes 10 active items while retaining `Visual Review Required` QA status.
- `qa-p01-batch.ps1` now differentiates visual-review state from true user approval at the batch level; `Web Preview Approved` requires `-UserVisualApproval`.
- This changes asset/index data and QA tooling only; gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.26 architecture increment

- R6 Batch016 now has a complete 10-image QA sample set under `assets/source-art/qa/BATCH-P01-016-r6-samples/`.
- `BATCH-P01-016-r6-full-contact-sheet.png` provides the full batch review sheet; `BATCH-P01-016-r6-full-sample-qa.json` records candidate files, aspect status, diversity coverage, and the superseded aspect-fail sample.
- Samples remain isolated from `public/assets/source-art/p01/index.json`; they are not playable card assets until an explicit future import step.
- This is asset QA staging only; active art files, public Source Art index entries, gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.25 architecture increment

- R6 Batch016 now has three QA sample images under `assets/source-art/qa/BATCH-P01-016-r6-samples/`, plus a sample contact sheet and sample QA manifest.
- Samples are deliberately isolated from `public/assets/source-art/p01/index.json`; they are review artifacts only and cannot appear in game surfaces until explicitly imported later.
- The sample QA manifest records the `CHR-GOV-023` v001 aspect-ratio failure and the valid v002 replacement, so automated and manual review can distinguish candidates from rejected evidence.
- This is asset QA staging only; active art files, public Source Art index entries, gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.24 architecture increment

- `BATCH-P01-016` now has exported R6 pre-generation review artifacts under `assets/source-art/qa`: JSON prompt pack, Markdown prompt pack, and HTML casting-plan sheet.
- `tools/export-r6-batch-generation-pack.mjs` creates reusable prompt packs for pending R6 batches; `tools/sanitize-r6-feminine-profile-contradictions.mjs` removes contradictory feminine facial-hair / sideburn cues before generation.
- `validate:art` now rejects feminine R6 profile contradictions in addition to workforce-diversity mix, age coverage, and structured prompt alignment.
- This is prompt workflow and QA coverage only; generated active art files, public Source Art index, gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.23 architecture increment

- Pending/future P01 Source Art prompts now use `OWM-P01-R6-WORKFORCE-DIVERSITY-ANTI-WAIFU` for the remaining 100 pending images.
- The art prompt pipeline now treats each 10-image pending batch as a real offshore-wind workforce ensemble: at least 4 masculine/adult-man or clearly masculine adult professionals, at least 2 androgynous adult professionals, no more than 4 feminine adult professionals, at least 8 age impressions, and at least 3 mature-adult impressions.
- `validate:art` now gates R6 casting locks, anti-waifu / anti-idol-face negative prompts, age diversity, mature-adult coverage, and structured profile alignment.
- This is pending prompt metadata and QA coverage only; generated active art files, the public Source Art index, gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.22 architecture increment

- Source Art display surfaces now share a safe-frame rendering contract: `object-fit: contain`, centered positioning, and frame-contained image bounds.
- Collection art cards use the same absolute safe-frame pattern as Deployment and Operation, avoiding intrinsic image overflow while preserving full-body P01 art.
- This is presentation and QA coverage only; active art files, Source Art index schema, gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.21 architecture increment

- Source Art runtime surfaces now share a smoke-tested contract: Deployment, Operation, and Collection must match `public/assets/source-art/p01/index.json` metadata and file paths.
- The gameplay smoke also validates image decode, rendered dimensions, and natural 2:3 aspect so a loaded-but-wrong asset cannot pass.
- This is a QA gate only; active art files, index schema, gameplay logic, save schemas, settlement formulas, and balance are unchanged.

## 3.20 architecture increment

- Batch021 is now a full active R5 source-art batch with 10 generated web-preview assets.
- The public Source Art index now exposes 200 active items, while remaining pending art is 100 P01 images.
- QA remains visual-review-gated; the import changes asset/index data only and preserves gameplay logic, save schemas, settlement formulas, and balance.

## 3.19 architecture increment

- Batch021 now supports partial R5 source-art import: generated images can become active web-preview assets while remaining batch peers stay pending.
- `validate:art` validates complete R5 diversity-profile batches rather than assuming the pending subset is always a full 10-item batch.
- The public Source Art index now exposes 192 active items; gameplay, save schemas, settlement formulas, and balance remain unchanged.

## 3.18 architecture increment

- Pending R5 Source Art prompt text now has a one-to-one mapping between `diversityProfile` and the single character-direction paragraph sent to image generation.
- `validate:art` now enforces exactly one current character-direction block for each pending R5 prompt and rejects legacy neutral-stance wording.
- This changes pending prompt metadata only; active generated art files, public art index, gameplay logic, save schemas, and balance are unchanged.

## 3.17 architecture increment

- Collection and Debrief tab surfaces now use explicit `tablist` / `tab` / `tabpanel` ARIA semantics, stable control IDs, roving `tabIndex`, and keyboard navigation.
- This brings Collection resources/save and Debrief Review/Score/Log into the same tabbed one-page UI contract already used by Deployment and Operation.
- The tab behavior is session-only UI state and preserves save schema, reward settlement, score formula, Source Art schema, and balance.

## 3.16 architecture increment

- Operation GUIDE notice pulse: clicking GUIDE now sets session-only active-guide metadata and renders a compact visible confirmation inside the decision prompt.
- The notice references the same stable target test ID as the GUIDE CTA and target highlight, keeping player guidance, QA telemetry, and actionable UI target aligned.
- This remains UI assistance only; it does not modify settlement, recommendation formulas, save schema, Source Art, or balance.

## 3.15 architecture increment

- Operation ACT recommendation now ranks usable active skills across the entire deployed team instead of only the selected crew card.
- The team-aware CTA carries stable actor/character/skill metadata and still calls the existing `resolveTeamSkill` settlement path; if the best actor differs, the session selected index is updated as part of the same player-confirmed action.
- This is recommendation/routing UI only. It preserves skill power calculation, mission settlement formulas, diagnosis gating, branch resolution, round forecast, save schemas, Source Art schemas, and balance.

## 3.14 architecture increment

- Operation decision GUIDE CTA: the `NEXT DECISION` prompt now exports guide target metadata and provides a compact session-only CTA that highlights/focuses the existing recommended actionable element.
- The GUIDE target is derived from the existing ACT/DIAG/EVENT/RISK/ROUND projection only; it preserves skill recommendation, diagnosis answer logic, branch resolution, round forecast, settlement, save schema, and balance.

## 3.13 architecture increment

- Deployment primary tabs now use explicit `tablist` / `tab` / `tabpanel` ARIA semantics, stable control IDs, roving `tabIndex`, and keyboard navigation.
- The tab behavior is session-only UI state; it preserves deployment readiness, mission selection, save schema, and balance formulas.
- Layout smoke verifies the tab semantics before the existing one-screen Deployment and Operation checks.

## 3.12 architecture increment

- Source Art R5 anti-clone diversity: pending/future P01 prompts use `OWM-P01-R5-ANTI-CLONE-DIVERSITY-ENGINEERING`.
- R5 treats repeated slot profiles as invalid and requires unique pending diversity signatures across facial structure, age impression, body silhouette, pose, expression, camera angle, hand gesture, and tool handling.
- The validation gate is manifest-only and prompt-only; generated R3/R4 artwork remains legacy-valid and no gameplay or save schema is changed.

## 3.11 architecture increment

- Source Art Batch020 R4 import: 10 generated P01 assets are now active in the runtime Source Art index, raising active coverage to `190/300`.
- Batch020 consumes the structured `diversityProfile` metadata introduced in 3.03 and keeps diversity auditable at manifest/QA level: gender presentation, face shape, body type, pose silhouette, expression, camera angle, and tool handling.
- The import is asset/index-only; it preserves gameplay logic, Reactive recommendation sort, branch resolution, mission runtime settlement, save schema, and balance.

## 3.10 architecture increment

- Operation Branch Reactive REC reason: the Branch Event recommendation CTA now exports and renders a compact reason from the existing highest-power Reactive selection.
- The reason is metadata/UI guidance only; it preserves Reactive recommendation sort, branch resolution, event penalty formula, mission runtime settlement, save schema, and balance.

## 3.09 architecture increment

- Operation diagnosis REC reason: the Diagnosis Gate recommendation now exports and renders a compact reason for the evidence-backed recommended answer.
- The reason is metadata/UI guidance only and preserves the existing diagnosis answer, evidence reward, mission runtime settlement, save schema, and balance.

## 3.08 architecture increment

- Operation REC skill reason: the recommended active-skill CTA now exports and renders a compact reason from the existing `resolveTeamSkill` forecast.
- The CTA reason includes applied power and stage result metadata while preserving the existing recommendation sort, skill settlement path, Operation decision projection, save schema, and balance.

## 3.07 architecture increment

- Operation decision telemetry: the `NEXT DECISION` prompt now exposes code, action, reason, and meta as stable `data-*` fields for ACT/DIAG/EVENT/RISK/ROUND states.
- The telemetry is derived from the existing decision projection only; it does not modify skill recommendation, diagnosis gating, round forecast, settlement, save schema, or balance.

## 3.06 architecture increment

- Route Readiness next-action reason: the primary Route Readiness CTA now exports `data-next-readiness-reason` and visible compact reason copy for the active next step.
- The reason is derived from the existing readiness gap/action/tab state only; it does not introduce new save fields, readiness formulas, deployment guards, or route-selection behavior.

## 3.05 architecture increment

- Debrief continuation guidance: `CampaignContinueActions` now exports recommended continuation action, current mission ID, next mission ID, available mission count, and per-CTA reason metadata.
- Gameplay smoke locks the post-settlement route from `MSN-TUT-001` to unlocked `MSN-TUT-002`, including visible recommendation copy and next/return/replay reason metadata.

## 3.04 architecture increment

- Operation scene asset telemetry: the Phaser `.phaser-host` now exports requested/source Scene IDs, primary/fallback asset URLs, asset version, QA status, and route availability as stable `data-*` metadata.
- Compact Operation visual gate: `smoke:operation:compact` verifies the central Operation feed resolves to `SCN003` with integrated `offshore-field-feed_ai_v004.png` and `ENGINEERING_QA_PASSED`, in addition to rotor axis-lock and no-overflow layout checks.

## 3.03 architecture increment

- Structured Source Art diversity profiles: every pending P01 item now carries `diversityProfile` fields for gender presentation, face shape, skin tone, hairstyle, age impression, body type, pose silhouette, expression, camera angle, and tool handling.
- Art validation gate: `tools/validate-art-prompts.mjs` now checks each pending 10-character batch for the required R4 mix and uniqueness thresholds before new art is counted.

## 3.02 architecture increment

- Source Art diversity guardrails: pending/future P01 prompts now use `OWM-P01-R4-DIVERSITY-ENGINEERING`, requiring variation across gender presentation, face, skin tone, hair, age impression, body type, pose, expression, camera angle, and tool handling. Generated R3 art remains unchanged.
- Fleet turbine icon v002: Fleet Board SVG turbine icons now expose `data-icon-revision="offshore-svg-v002"`, monopile foundation, sea line, access rail, tower/nacelle highlights, and hub/shaft/tower axis-lock metadata checked by `smoke:fleet`.

## 架構

- React：任務控制、卡牌、技能、狀態、語言與可及性 UI。
- Operation compact desktop：1366×768 低高度 desktop 使用 CSS compact mode，壓縮三欄內容並以 `smoke:operation:compact` 驗證 document 與 panel internal overflow。
- Operation field-feed v004：Fallback、SCN002、SCN003 指向 `offshore-field-feed_ai_v004.png`；prompt guardrails 保存在同目錄 `.prompt.md`，明確排除 malformed blades、off-axis rotor、text/logo/watermark、people 與 fantasy machinery。這只替換 runtime bitmap asset，不改 mission settlement、save schema 或 balance。
- Operation recommended skill CTA：`NEXT DECISION: ACT` 狀態會在右側角色欄顯示 `REC` CTA。CTA 只由 `recommendedSkill`、`selectedSkillForecast` 與目前 runtime state 派生，點擊後走既有 `useSelectedSkill`；不新增 save 欄位、不改 settlement/balance。
- Route Readiness next-gap metadata：Campaign Route 的 primary readiness CTA 會輸出 `data-next-readiness-gap`、`data-next-readiness-action`、`data-next-readiness-tab`，讓 browser smoke 與後續 UI guide 能穩定知道下一步是確認 planning 項目、切 tab，或直接 deploy；不新增 save 欄位、不改 readiness formula。
- Operation Return Notice metadata：Operation abort/return notice 會輸出 `data-return-mission-id`、`data-return-reason`、`data-return-selected`、`data-return-can-redeploy`，Route shortcut 另輸出 target/action metadata。此 notice 只描述 session-only abort context，不提供 direct redeploy path，不寫 Campaign save。
- Operation REC CTA settlement gate：browser smoke 會實際 click CTA，檢查 AP/Energy 消耗、stage/progress 變化與 log entry，確保 CTA 連到既有 runtime settlement，而不是只顯示 UI。
- Branch Reactive REC CTA：pending Branch Event 有可用 Reactive skill 時，Branch Event panel 會顯示一個 `REC` CTA。CTA 從既有 `reactiveOptions` 派生，保留 stable recommended character/skill IDs，並呼叫既有 `resolveBranch(actorIndex, skillId)`；不新增 branch penalty formula、settlement path、Campaign save 欄位或 balance rule。
- Diagnosis REC CTA：Campaign Diagnosis Gate 有 correct option 時，Diagnosis panel 會顯示 training `REC` CTA。CTA 保留 stable recommended diagnosis ID，並呼叫既有 `chooseDiagnosis(optionId)`；不新增 diagnosis scoring formula、settlement path、Campaign save 欄位或 balance rule。
- Round Decision REC CTA：`NEXT DECISION: ROUND/RISK` 會顯示 compact `REC` End Round CTA。CTA 呼叫既有 `requestNextRound()`，並保留 branch/failure/low-margin forecast 下的二段式 confirmation；不新增 End Round formula、branch trigger rule、settlement path、Campaign save 欄位或 balance rule。
- Round Decision REC settlement gate：compact browser smoke 會把 ROUND/RISK CTA 點到 settlement，驗證 Operation log 增加與 round/event/debrief 狀態推進。1366×768 Branch Event opened state 使用 compact branch layout，避免 event panel 壓縮 field feed 到不可玩高度。
- Debrief Next Mission REC：Debrief REVIEW 的 `continue-next-mission` 在有下一個 Campaign mission 時標記為 recommended continuation action，並輸出 stable `data-recommended-mission-id`。CTA 仍呼叫既有 `onSelectMission(nextMission.id)`；不新增 Campaign save 欄位、不改 reward settlement 或 mission unlock。
- Debrief secondary CTA metadata：Debrief Campaign Continue 的 next/return/replay 三個 CTA 都輸出 `data-continue-action` 與任務 ID metadata，讓 smoke 與後續 UI guide 能穩定分辨下一關、返回 Route、重玩本任務三條 post-settlement path；不新增 save 欄位、不改 reward settlement。
- Campaign Completion Summary metadata：全通關摘要輸出 completion state、mission/chapter totals、average best score、scored mission count、campaign grade、S-grade count 與 mastered crew count 的 `data-*` metadata；來源仍是 `campaignCompletionSummary` pure domain projection，不寫入新的 save 欄位。
- Source Art card metadata：Operation preview、Deployment preview 與 Collection card 都輸出 active character ID、P01 version、active file、visual QA status 與 engineering QA status。`smoke:art` 逐張比對 runtime card 與 `public/assets/source-art/p01/index.json`，確保遊戲畫面載入的是 active Source Art；這不改 art index schema、圖片檔、Campaign save 或 gameplay settlement。
- Turbine axis lock：Fleet Board SVG icon 與 Operation Phaser field-feed 共用 `turbineGeometry.ts` 的三葉片幾何。SVG rotor 以 hub 座標設定 `transform-origin`，並輸出 `data-rotor-axis-lock="hub-shaft-tower"`；Phaser host 輸出 `hubLocked`、`bladeAngles=0,120,240` 與 transform origin，讓 smoke test 可直接驗證 rotor 不會離軸旋轉或出現二/四/五葉片語意。
- TypeScript domain：資料契約、FK 驗證、CharacterRuntime 與 MissionResolver；不依賴 React，便於測試。
- Phaser：只負責離岸風場動態視覺，不保存遊戲規則或角色數值。
- JSON：`json/` 為唯一 Source of Truth；`public/data/` 由同步腳本產生。
- Campaign save v5：只保存 stable ID、XP、最佳分數、任務狀態、`ownedEquipmentIds`、MNT、sparse `equipmentCondition`、RST、sparse `crewFatigue`、6 座風機 operational state 與最多 30 筆 `fleetOperationsHistory` 至 `owm.campaign.v5`；JSON envelope 可下載／匯入。v1/v2/v3/v4 envelope、裸進度與舊 localStorage 會補足 fleet state/history 並正規化為 v5，不複製角色／任務／裝備／風機主資料。
- Career Track progression：60 Track 各含 L1–L5；`careerTrackXp` 加總同 Track 五名角色的既有 `characterXp`，用共用 `0／100／250／500／900` 門檻派生 availability，因此不增加 save 欄位，也不讓舊存檔失效。
- Onboarding save：首次導覽使用獨立 `owm.onboarding.v1`，只保存 `status` 與五段 `stepIndex`；不加入 Campaign schema，也不進入 Campaign 匯出檔。
- Boss Challenge save：`owm.challenge.v3` 以獨立 map 保存各 Boss local best 與未出勤的三人 squad draft；每筆 best 永久保存 `OPERATION` 或 `DRAFT_CONFIRMATION` source。v1／v2 會 migration 為 v3 並將舊 best 正規化為 `OPERATION`，不進入 Campaign v5、onboarding 或 Campaign 匯出檔。獨立 `OWM_CHALLENGE_SAVE` envelope 支援 v1／v2／v3 import 與 v3 export；parser 重驗 Boss／Character FK，並拒絕 Campaign envelope 與未來版本。Import 先由 pure preflight 派生 count／stable-ID diff，不寫 localStorage；Confirm 以 current/incoming fingerprint 防止過期覆寫，成功後建立僅存於 React session 的一層 Undo，Undo 也會拒絕匯入後已變更的存檔。
- Boss Challenge audit snapshot：完整報告仍輸出於 `balance/`；UI 只載入 `json/bossChallengeAudit.json` 的 100 筆 compact projection。每筆另保留三個已驗證 `recommendedTeamIds`；啟動與 data gate 均要求 gates PASS、100/100、完整 Boss／Character FK 與隊伍唯一性。
- Vite：開發伺服器與 production build；Phaser 採 lazy chunk，主 UI 可先載入。
- Desktop workspace：以 `100dvh` 為邊界；Deployment／Collection／Codex 使用 Tab 與 pagination 將資訊留在單一 viewport，`≤900px` 才回到可捲動單欄模式。
- Campaign Route sub-tabs：Deployment Route 在 campaign mode 內分為 `FLEET / MISSIONS / BRIEFING`。`FLEET` 聚焦 Wind Farm Operations Board，`MISSIONS` 顯示 5 章 15 個 mission nodes 與 completion summary，`BRIEFING` 顯示選定任務、Route Readiness Carryover 與 Mission Event Deck。此層是 React session UI state，不改 Campaign save schema；1366×768 smoke 驗證三個 Route sub-tab 都不產生 document 或 panel overflow。
- Offshore field feed：Phaser 載入版本化寫實海上風場 bitmap；`turbineGeometry.ts` 只產生以 hub 為原點的三葉片 polygon，避免視覺層自行拼接偏心葉片。
- Rotor structure telemetry：`rotorTelemetryGeometry` 同時提供 blade、hub、nacelle、shaft、tower 尺寸，Phaser scene ready 後在 host dataset 暴露 3 葉片、shaft locked、nacelle、tower metadata 供 browser smoke 驗證。
- Fleet Board Turbine Icon：Route 內六張風機卡使用 React SVG 顯示 tower、nacelle、shaft、hub 與三葉片 rotor；blade polygon 與 icon rigging 直接由 `turbineGeometry.ts` 的 `turbineBladePolygon` / `fleetTurbineIconGeometry` 產生。Fleet smoke 驗證每張卡的 blade count、實際 3 個 blade polygon、shaft start = hub、shaft y = hub y、tower center = hub x、nacelle axis = hub y。這層只改善狀態視覺，不參與 windFarm 結算與 save schema。
- Sandbox Scenario Lab：以 session-only 設定自由調整 Sea State、Weather Window、Safety、Evidence 與 Round Limit；海況只投影 Vessel weather／safety／fatigue protection，不修改 Vessel master data、Campaign save 或 Challenge save。
- Mission Scene Routing：`Mission.sceneId` 與 Sandbox scene selector 先解析 `scenes.json` metadata，再由 `sceneAssets.json` 決定專屬版本化圖片或共用 fallback。15 個 Campaign mission 實際使用的 Scene 均有 direct Operation field-feed asset；data gate 會阻擋缺少 direct asset 的 Campaign Scene。Sandbox selector 以 `ALL / INTEGRATED / FALLBACK` tab 顯示 29/150 direct coverage 與 121 fallback route，filter 只改變清單可見性、不改目前選取值。SCN006 仍可 fallback 到 SCN002 verified feed，作為 Sandbox provenance 驗證案例。React 顯示 requested Scene／provenance，Phaser 只接收已解析的 asset URL；Scene 切換不進入任何 save schema。
- Wind Farm Operations：`turbines.json` 保存 6 座風機主資料，`Mission.turbineId` 建立固定 assignment；`windFarm.ts` 以 pure functions 初始化／正規化／結算 availability、reliability 與 backlog。Campaign v5 只保存狀態，不複製主資料；React Board、Operation Field 與 Debrief 讀同一份結算結果。
- Fleet Maintenance：`turbineMaintenanceQuote` 只由目前 fleet state 與可用 MNT 派生 priority、cost、reliability gain 與 backlog delta；Prepare／Cancel 保持純預覽，`maintainCampaignTurbine` 只在 Confirm 後原子更新 MNT、fleet state 與 `maintenanceActions`。Equipment repair 與 turbine maintenance 使用不同公式，但共用同一個 Campaign MNT budget。
- Fleet Dispatch Priority：`createFleetDispatchPriority` 將六座風機的 state 與每部單次 quote 投影為 immutable queue；排序使用 availability pressure、priority、backlog、reliability deficit、availability recovery 與 reliability gain，最後以 reliability／cost／stable ID deterministic tie-break。React 只顯示排名與 selected projection，Confirm 邊界仍由 Fleet Maintenance 掌管。
- Fleet Maintenance Plan：`createFleetMaintenancePlan` 將去重後的 turbine IDs 依 stable ID 排序，以 working fleet state／MNT 逐步呼叫既有單次 maintenance settlement；每一步保存 before／after state、fleet summary 與 credits。React 只保存未確認 plan；`maintainCampaignTurbinePlan` 在 Confirm 後才一次替換 Campaign 的 MNT 與 `windFarm`。
- Fleet Condition Dispatch Modifier：Campaign deploy 會從目標 `Mission.turbineId` 讀取 `campaign.windFarm`，將 availability、reliability 與 fault backlog 投影成 dispatch pressure，並一次性套用到 mission mobilization cost、initial safety 與 initial reliability。Readiness、Dispatch Forecast 與 Operation 顯示相同 before／after projection；Sandbox 與 Boss Challenge 不套用。
- Fleet Operations History：Campaign deploy 的 Fleet Condition projection、mission outcome、single turbine maintenance 與 fleet maintenance plan confirmation 會 append 到 bounded history。History 只保存 gameplay state 摘要與 stable IDs，最多最近 30 筆；Wind Farm Operations Board 以 `DISPATCH／HISTORY` Tab 切換，避免增加 Route 頁高度。
- Mission Result Review：Operation Debrief 以 `REVIEW／SCORE／LOG` Tab 呈現。REVIEW 預設顯示 Campaign reward、MNT、Equipment wear、Crew fatigue、Wind Farm delta 與 Codex unlock；SCORE 保留六項評分；LOG 保留操作紀錄但限制高度，避免 Debrief 撐破單頁 layout。
- Mission Replay Compare：`awardCampaignMission` 在覆寫 `bestScores` 前先派生本次 score/grade、任務前 best、任務後 best 與 `FIRST_BEST／NEW_BEST／BEST_HELD` 狀態，透過 `CampaignReward` 傳給 REVIEW；不新增 Campaign save 欄位。
- Campaign Continue CTA：`campaignContinueTargets` 只從目前 Campaign progress、missions 與 current mission ID 派生下一個可出勤 Mission、目前任務與戰役完成狀態。REVIEW 的三個 action 只切換 React session/deployment route，不新增 Campaign save 欄位。
- Route Readiness Carryover：Campaign Route briefing 由目前 `OperationReadinessEvaluation`、deployment confirmations、Crew readiness、Career unlock 與 Equipment condition 派生 compact chips；chip 只切換現有 Deployment tabs，不保存新狀態。
- Route Reminder Action Shortcuts：Permit／PPE／Access shortcuts 只更新目前 React deployment confirmations；Crew／Loadout shortcuts 只切換 Tab。這些操作不自動 deploy，也不寫入 Campaign save schema。
- Ready Route Deploy CTA：當 Route reminder 已無缺口且既有 deploy guard 通過時，primary CTA 會呼叫原本 `onDeploy`；不建立第二套 deployment flow，也不新增 save 欄位。
- Operation Quick Return：active Operation 提供二段式 Abort confirmation；Confirm 只清除目前 React session 回 Route，不呼叫 mission settlement，不新增 completed mission、best score、reward 或 mission outcome history。Campaign deploy 既有 DISPATCH history 仍保留。
- Operation Return Context：Campaign abort 回 Route 後保留 session-only notice，明確標示本次 sortie 未結算且未寫 mission outcome；notice 只提供回到同一任務 Route 的 shortcut，不直接 deploy、不新增 Campaign save 欄位，reload 後自然消失。
- Operation Return Notice Dismiss：Abort return notice 額外提供手動 dismiss；dismiss、主模式切換與 reload 都只清除 React session-only UI，不寫 `owm.campaign.v5`，也不建立直接 redeploy flow。
- Operation Return Notice Mobile Copy：Abort return notice 增加 compact status flags，窄版 Route 以單欄、可換行狀態文字與等寬 actions 呈現；mobile smoke 驗證 768px abort return notice 不水平溢位、不寫 Campaign save。
- Operation Abort Mobile Confirmation Copy：Mobile bottom dock 的 abort confirmation 顯示短 copy，先說明 Return 只中止 sortie、不結算任務；Cancel 保持 active Operation，Confirm 才回 Route notice，且不寫 Campaign save。
- Operation Abort Desktop Confirmation Copy：Desktop sidebar 的 abort confirmation 與 mobile wording 對齊，明確說明 Return 只中止 sortie、不寫 mission result／reward／best score／mission outcome history；Cancel 不寫 Campaign save，Confirm 才回 Route notice。
- Operation Info Tabs：active Operation 下方 event panel 改為 `LOG／SUMMARY` session-only tabs；SUMMARY 維持 8 格 compact layout，彙整 stage、progress、weather、Scene availability、source Scene/version、QA status、Turbine 與 Fleet pressure，避免增加垂直高度或寫入 Campaign save。
- Operation Info Heading：active Operation event panel 的 heading 由目前 info tab 派生；`LOG` 顯示 `OPERATION LOG`，`SUMMARY` 顯示 `OPERATION SUMMARY`，`OBJECTIVES` 顯示 `OPERATION OBJECTIVES`。此層只修正可讀性，不改 mission runtime、settlement、save schema 或 balance formula。
- Operation Decision Prompt：active Operation 的 event panel 會在 `LOG／SUMMARY` 上方顯示一列 derived `NEXT DECISION`，依目前 `pendingBranch`、diagnosis gate、weather/safety、selected crew skill availability 與 stage progress 派生 `EVENT／DIAG／RISK／ACT／ROUND`。這是 React session-only guidance，不改 mission runtime、settlement 或任何 save schema。
- Operation Objectives Tab：active Operation info tabs 擴充為 `LOG / SUMMARY / OBJECTIVES`。OBJECTIVES 只從目前 `MissionState`、mission learning objectives、diagnosis state、pending branch event 與 weather/safety 派生 Stage target、Learning objective、Diagnosis gate、Branch event、Risk floor；不寫 Campaign / Challenge save，也不改 mission settlement。
- End Round Forecast：`previewEndRound` 與 `endRound` 共用 fatigue、safety、weather、failure formula；Operation OBJECTIVES 只顯示 forecast summary，不執行 settlement、不寫任何 save。Campaign、Sandbox、Boss Challenge 各自使用與正式 End Round 相同的 vessel projection。
- Skill Forecast：Operation OBJECTIVES 會用既有 `resolveTeamSkill` pure resolver 預覽目前選中技師的推薦可用技能、applied power、stage clear / remains 與 AP / Energy / Fatigue cost；UI 不另建 power 公式，不寫 save，也不改 settlement。
- Round Commit Confirmation：Operation `End Round` 在 branch event、forecast failure、或 weather / safety 低 margin 時會先進入 session-only confirmation；第二次點擊才呼叫正式 `endRound`。此 gate 只控制 UI commit timing，不改 `previewEndRound`、`endRound` 公式、不寫 save schema。
- Operation Info Mobile Tabs：`≤900px` 下 SUMMARY 使用 2 欄 compact grid，mobile gameplay smoke 會實際切換 SUMMARY／LOG 並檢查 768px 無水平 overflow。
- Operation Info Tab Reset：每次 sandbox／challenge／campaign 建立新 Operation session 前都重設 info tab 為 LOG；此狀態不保存、不匯出、不進入 Campaign schema。
- Operation Info Tab Reset Coverage：browser smoke 直接覆蓋 Campaign return-route redeploy、Sandbox deploy 與 Boss Challenge deploy 三條路徑的新 Operation 預設 LOG 行為。
- Operation Info Tab A11y：`LOG／SUMMARY` 使用標準 tablist／tab／tabpanel 與 `aria-controls` 關聯；log panel 內保留 live region，desktop／mobile smoke 用 role 驗證。
- Operation Info Tab Keyboard：LOG／SUMMARY tabs 支援 ArrowLeft／ArrowRight／Home／End 鍵盤切換，切換後同步更新 focus 與 selected tab state。

## 資料流

```text
Excel / json Source of Truth
        ↓ sync + validation
Browser data index (stable IDs)
        ↓
Pure TypeScript runtime
        ├──> deterministic balance autoplay → Markdown / JSON gate report
        ├──> Dispatch Forecast → success/failure wear + MNT + Crew envelope + RST
        ├──> Career Track aggregate XP → unlocked Campaign roster
        ├──> Crew Rotation Advisor → unlocked roster exact search → recommended 3 stable IDs
        ├──> Boss Challenge audit → compact 100-Boss snapshot → Route filters / pressure / outliers
        │                  ├──> Squad Advisor → 3 stable IDs + current-vs-audit compare
        │                  ├──> Draft Strategy gaps → deterministic top one-slot repair → repair queue / portfolio
        │                  └──> Draft Verification → same deterministic autoplay → ephemeral CLEAR / FAILED evidence
        │                                      └──> Top Repair → before/after runtime comparison → CLEAR / STILL FAILED
        │                                                              └──> on-demand runtime repair → pre-Apply delta/verdict → CLEAR settlement preview → explicit confirm → local best
        ├──> Boss class rule + telegraph + branch schedule + current skills → Strategy Briefing
        ├──> Boss Challenge fixed projection → L3 / 10 rounds / L1 loadout → per-Boss local best
        ├──> Campaign reward → ownedEquipmentIds → locked loadout selector
        ├──> deployed loadout → condition wear → MNT repair → serviceable gate
        ├──> deployed/Reserve crew → fatigue recovery → RST Rest → deployable gate
        ├──> Mission / Sandbox sceneId → Scene metadata + asset index → dedicated image or verified fallback
        ├──> Mission turbineId + outcome → fleet reliability / backlog → availability → Campaign v5
        ├──> selected turbine + MNT → maintenance quote → explicit confirm → atomic fleet/MNT settlement
        ├──> all turbine quotes + current MNT → deterministic dispatch rank / READY / SHORT / selected fleet projection
        ├──> selected stable turbine IDs → stepwise plan / total MNT → explicit confirm → atomic multi-turbine settlement
        ↓
React UI state ── telemetry ──> Phaser scene
        ├──> onboarding event observer → independent localStorage
        └──> Challenge team edits / settlement → owm.challenge.v3 draft / best + source only
```

Phaser 不反向修改遊戲狀態；所有技能、疲勞、階段與 Boss 規則均由 TypeScript domain 決定。

## 可玩流程

```text
Deployment
Mission + 3 unique characters + equipment + spare + vessel
        ↓
Operation Readiness Gate
permit + PPE + access confirmations + vessel compatibility + team Mastery
        ↓ 5/5 only
Operation
profile weather window + mobilization cost + safety + evidence + fatigue
Detect → Diagnose decision gate → Isolate → Repair → Verify → Restore
        ↓
Debrief
completion + safety + evidence + time + fatigue + cost → grade S–D
        ↓
Campaign
XP + character XP + Track XP/new career cards + best score + next mission/Codex unlock
        + Chapter milestone Equipment tier reward
        + Maintenance Credits - deployed Equipment/SPARES wear
        + Rest Token + deployed transit/Reserve fatigue recovery
        + Assigned Turbine reliability + fault backlog + availability
        + Confirmed Fleet Maintenance actions - shared MNT budget
        ↓ 第 15 關完成
Campaign completion summary
average best score + overall grade + chapter/S-grade/L5 statistics + replay
```

- 角色陣營對特定工程階段具有 `×1.25` 專長倍率；Boss counter faction 另計 `×1.25`。
- 裝備提供 reliability bonus，並在回合風險結算時抵銷部分 fatigue damage。
- Fatigue 依 Stable、Tired、Critical、Exhausted 降低技能效率；100 時退出任務。
- Support 技能可回復全隊疲勞；換班會讓新角色以 AP 0 進場，並增加安全與成本代價。
- 每回合降低天候窗口與安全；完成、超時、天候關閉、安全歸零或全隊耗竭都會進入結算。
- 14 種 Boss class 由 `BOSS_CLASS_RULES` 定義不同回合壓力；React 僅顯示事件，所有數值變化仍由 pure TypeScript runtime 結算。
- `BOSS_CLASS_TELEGRAPHS` 將 14 種 class 映射到 icon、accent、pattern 與受影響資源；`eventPulse` 只驅動 React／Phaser 回饋，不參與勝負計算。
- `MISSION_BRANCH_EVENTS` 定義五類基礎 branch penalty；每個 `missions.json` 記錄再以 `branchEventDeck` 指定回合、event code 與 intensity。
- `branchEventForRound` 在 Campaign 依 deck 精確觸發並先縮放 penalty；Boss Challenge／Sandbox 無 Mission definition 時使用 deterministic fallback schedule。
- Branch event 會暫停一般技能與下一回合；`resolveMissionBranch` 統一處理完整後果或 Reactive mitigation，再解除事件窗口。
- Reactive skill 只可在事件窗口使用，會消耗 AP、Energy、fatigue 與 cooldown；一般工程階段不會將它當作 Active skill 推進關卡。
- `missions.json` 定義 briefing、learning objectives、正確配置、診斷選項、XP、prerequisite、三段 branch event deck 與 `operationProfile`；`vessels.json` 與 Operation Profile 的數值均為 gameplay abstraction。
- `evaluateOperationReadiness` 將 permit／PPE／access 三項玩家確認，與 vessel class、實際角色 XP 派生的 Mastery 組成 5 項 gate；Campaign 必須 5/5，Sandbox 不呼叫此 gate。
- `applyOperationReadiness` 只在 gate 通過後將 Profile 的 initial weather window 與 mobilization cost 套入 `MissionState`，讓 UI、runtime 與 balance simulator 共用同一後果。
- `missions.json.rewardEquipmentTier` 只在第 3／6／9／12 關指定 L2／L3／L4／L5；`awardCampaignMission` 依 master data 發放該 tier 的 40 項 stable ID。
- `normalizeCampaignProgress` 以完成 milestone 推導 entitlement：補回 v1 應得裝備、移除未知 ID，並拒絕尚未取得的高階裝備，避免匯入存檔繞過 progression。
- Equipment Condition 為 `0–100`；未寫入 sparse map 的已持有項目視為 100。任務成功時主裝備損耗 `6 + Chapter×2`、備品損耗 `4 + Chapter`，失敗再增加 `6/4`。
- `MIN_SERVICEABLE_CONDITION = 25`；低於門檻仍可在 selector 選取進行維修，但 `deploy` domain guard 會拒絕出勤。完整維修費用為 `ceil(missingCondition × tierRank / 2)` MNT。
- 任務 MNT 獎勵為成功 `18 + Chapter×6 + floor(score/10)`、失敗 `8 + Chapter×3`；這些是可版本化的 gameplay balance，不代表現場維修工時或成本。
- `crewFatigue` 以 character stable ID 保存正值；`createCharacterRuntime` 在 Campaign 由該值初始化。100% Exhausted 不可部署，Critical 保留為玩家可選的策略風險。
- `createDispatchForecast` 重用正式 wear／MNT／Mastery／Boss class／vessel recovery 規則；Condition、MNT 與 RST 為 deterministic outcome，Crew 則只呈現 1 round baseline 至 round-limit 的 envelope，排除玩家技能、Support、RiskShield、branch decision 與換班。
- `crewReadinessBandForFatigue` 統一 Deployment、Forecast 與 Rotation Advisor 的 `40% / 70% / 100%` 門檻；不得在顯示層另建 band 判定。
- `unlockedCareerCharacters` 先依 Track aggregate XP 產生 Campaign roster；新進度為 60 名 L1。`normalizeCampaignTeamIds` 遇到降階匯入時優先回退到同 Track 最高可用角色，deploy guard 再次拒絕任何鎖定 stable ID。
- `createCrewRotationRecommendation` 先預算全部已解鎖且可出勤角色的 Mastery、current／round-limit fatigue、stage bitmask、counter 與 perk，再完整比較 `C(U,3)`；`U` 為當下可用 roster。排序依序為 Mastery gate、Exhausted／Critical／Tired 人數、六階段 coverage、Boss counter、Mastery／perk、保留現有成員與疲勞比例。
- Crew filters 只縮小玩家手動 selector 的可見 roster；Advisor 永遠搜尋全部已解鎖且可部署角色，避免 filter 意外改變建議規則。套用只更新三個 stable character IDs，既有 Dispatch Forecast 會由同一 state 重新派生。
- 任務結算時，實際部署及中途換班離隊角色先保存 Mission 結束疲勞，再依船舶 `fatigueRelief×2` 套用返航恢復；未出勤但已有疲勞的 Reserve 依角色 `fatigueRecovery×2` 自動恢復。
- 新 Campaign 起始 3 RST；SOV 任務取得 2 RST，其他船舶取得 1 RST。手動 Rest 消耗 1 RST，恢復 `max(20, ceil(fatigueMax×40%))`；以上均為 gameplay balance，不代表現場輪班規範。
- `codex.json` 以 `unlockMissionId` 對應 Mission；解鎖狀態只由已完成任務推導，不重複寫入 save，避免兩份進度失去一致性。

## 模式邊界

- Campaign：使用五章十五關 prerequisite 鏈、Career Track availability、診斷 gate、Mastery 技能鎖、Equipment inventory、maintenance economy 與 Crew readiness；結算會寫入 XP、MNT、RST、角色 XP、持久疲勞、最佳分數、任務／裝備解鎖及實際 loadout 損耗，Track 狀態再由角色 XP 派生。
- Equipment progression：初始持有 40 項 L1；第 3／6／9／12 關完成後依序取得 40 項 L2／L3／L4／L5。未持有項目在 selector 保持可見但 disabled，部署時由 domain 再次檢查 ownership。
- Operation Profile：Chapter 01–02 要求 L1、Chapter 03 要求 L2、Chapter 04 要求 L3、Chapter 05 要求 L4，且三人隊伍至少兩人達標；切換 Mission 會重置人工確認。
- Campaign mission map：由 `campaignMissionStatus` 將進度派生為 completed／available／locked；`campaignMissionGrade` 只對已完成任務顯示最佳評級，locked 節點不觸發部署資料變更。
- Campaign finale：`campaignCompletionSummary` 只由 Campaign progress 與 Mission master data 派生；第 15 關完成後顯示平均最佳分、整體評級、章節、S-grade 與 L5 crew 統計，completed 節點仍可重玩。
- Boss Challenge：100 Boss 與 300 角色皆可選，固定 Mastery L3（250 XP）、10 回合及 `EQ0051／EQ0126／VES002` L1 配置；使用正式 runtime／debrief S–D 評分。只以最高分、完成優先、較少回合為同分 tie-break 保存每個 Boss 的 local best，禁止呼叫 Campaign reward 或修改 v5 狀態。每個 Boss 另保存三個唯一且有效 character stable IDs 作為 squad draft；與 best record 的實際出勤隊伍分離。
- Boss Challenge Route：`bossChallengeRoute.ts` 將 static audit 與 `owm.challenge.v3` best/draft map 合併；提供 Severity、Class、UNATTEMPTED／CLEARED／FAILED、`OPERATION／DRAFT_CONFIRMATION`、DRAFTED／UNDRAFTED、GAP-FREE／HAS-GAPS 與四種 gap type 交集篩選，以及 ID、Severity、best-score、Audit Hardest、Drafted First、Readiness deterministic sort。每個 draft 以正式 Strategy Briefing 派生 stable IDs、Counter、Stage、gaps 與 portfolio；手動隊伍變更後由同一 state 即時重算。篩選為空時 Route 不提供 Boss 並鎖定 Deploy。切換 Boss 只還原既有 draft 或預設隊伍，不因瀏覽而建立 draft。UNDRAFTED 的 audit-seed 動作由 `seedBossChallengeSquadDraftFromAudit` 驗證 Boss／success／character FK 後寫入 draft map；不修改 best map。Route 與 Result 都顯示 best source，`compareChallengeRecords` 仍只依 score／completed／round 排序。
- Boss Challenge Squad Advisor：`bossChallengeSquad.ts` 只接受成功且 Boss ID 相符的 audit，解析三個有效且不重複的角色 stable IDs，再以正式 `teamStageCoverage` 與 Boss counter factions 派生 6-stage／counter 指標。一鍵套用只更新 Challenge 的 deployment team；Campaign v5、roster progression 與持久 fatigue 不變。
- Boss Challenge Squad Compare：`compareBossChallengeSquads` 將目前三人與 audit 三人各自轉為同一份 profile，再計算 Counter、covered stage、每階段 coverage delta、set-based 共用成員與 order-based 精確席位。UI 只呈現 deterministic gameplay 結構差異，不由 delta 推導成功機率或現場判斷。
- Boss Challenge Strategy Briefing：`createBossChallengeStrategyBriefing` 直接引用正式 class rule／telegraph 與 `branchEventForRound`，以 Challenge 固定十回合派生 R01／R04／R07 事件；隊伍能力由三名角色的四個 M3 skill stable IDs 計算。全隊恢復依 runtime 的 `target=Allies` 且負 `fatigueDelta` 判定，不假設只有 `Support` type 才有效。
- Crew Skill Capability：`crewCapability.ts` 是 Strategy 與 roster filter 共用的唯一判定層；Reactive 依 skill type，全隊恢復依 `target=Allies|All units + fatigueDelta<0`，低 Energy 一般行動排除 Passive／Reactive 且要求 `energyCost<=4`。Campaign 傳入當前 Mastery 的 `unlockedSkillSlots`；Challenge 固定傳入 4。Strategy gap 按鈕只切換 Crew filter，不自動套用成員或宣稱 audit 通過。
- Strategy Gap Candidate Preview：`createBossChallengeGapCandidatePreview` 將當前隊伍與 capability roster 的每位非現役角色做三席替換；每人先保留缺口數、Stage、Counter、技能 readiness 最佳的席位，再以同順序與 character stable ID 做 deterministic 全局排序。UI 更新 deployment team IDs、保留一層 undo，並寫入目前 Boss 的 Challenge draft；不改 audit／Campaign save，也不執行 mission runtime。
- Route Top Repair：`createBossChallengeRouteRepairPreview` 依 `NO_REACTIVE → NO_TEAM_RECOVERY → NO_LOW_ENERGY_ACTION → STAGE_GAP` 固定優先序選取第一個缺口。前三者重用 capability candidate search；Stage 路徑比較其餘 roster 的全部三席並以 6/6 coverage 優先。React 只顯示第一名與一層 undo；apply／undo 都經既有 Challenge draft persistence，因此 portfolio 即時重算且 reload 可還原，provenance 固定為 `NOT AUDIT VERIFIED`。
- Repair Queue：`createBossChallengeRepairQueue` 只讀未篩選 Route items，取 `HAS_GAPS` draft 後以 Boss stable ID 排序，派生 current position、next ID 與四種 gap counts。Queue 導覽會把 UI filter 正規化為 `DRAFTED + HAS_GAPS`，但不寫 save；只有玩家 Apply／Undo 才沿用 Challenge draft persistence。Session repaired count 僅存在 React state，reload 不保存。
- Challenge-only GRD reserve：S4 將固定 vessel 投影為 Weather Protection +1；S5 為 Weather Protection +3 並於回合結束提供全隊 Energy +1。這只修正固定 L1 配裝在高階 Grid event 的十回合死局；原始 vessel、Boss 與 Campaign runtime 數值不變。
- Sandbox：100 個 Boss、200 項裝備與四個技能槽全部開放，不呼叫 Campaign reward／save mutation。
- Collection：Crew Tab 以 faction／搜尋／每頁 5 張卡牌瀏覽 300 名角色，明確顯示 Career locked/unlocked、Track XP／下一階門檻及個人 `characterXp` 派生的 Mastery；Resources Tab 顯示全 roster readiness、Equipment inventory、MNT、serviceable／worn 與 Campaign save v5 JSON 備份／匯入。
- Knowledge Codex：呈現 15 筆雙語工程知識、安全邊界與場站程序聲明；完成對應任務後才顯示全文，桌面每頁顯示 3 筆。
- Mastery 門檻為 `0 / 100 / 250 / 500 / 900 XP`。這些是可版本化的 gameplay balance，不回寫角色主資料。
- L4/L5 perk 由 `masteryPerkModifiers` 依角色 XP 派生；`teamMasteryPerks` 聚合部署時 Evidence／Reliability，個人 Energy 與 fatigue protection 則保存在 `CharacterRuntimeState`。
- 換班只建立新角色的個人 runtime perk，不重新計算任務初始 team bonus，避免中途反覆換班疊加 Evidence／Reliability。
- Sandbox 以 `unlockAll` 建立全 L5 team modifiers，但不寫入角色 XP 或 Campaign progress。
- Boss Challenge 以新的 Campaign projection 將 300 人固定為 250 XP 並清空持久疲勞；projection 為新物件，只借用 Mastery／roster API，不回寫原 Campaign。

## First-play onboarding

- 五段流程固定為 Deployment → Mission event deck → Reactive window → Diagnosis gate → Debrief；首次 L1 roster 沒有 Reactive card，玩家先承受完整後果，Track L3 解鎖後才可選擇 Reactive response。
- Deployment／event deck 由導覽 CTA 推進，但 event deck 的開始按鈕在 Operation Readiness 未達 5/5 前保持 disabled；Reactive 與 Diagnosis 必須完成實際遊戲互動才前進；Debrief 顯示後才可標記完成。
- 當導覽等待事件或階段時，資訊卡不攔截底層技能操作；目標元件以 outline、文字與進度節點共同標示，不只依賴顏色。
- `completed` 與 `skipped` 重新整理後不自動開啟；Topbar 可隨時重播。若 reload 遺失暫時性的 mission session，active 導覽退回 event deck，而 Campaign 進度保持不變。
- Chrome smoke 驗證五個焦點畫面、完成／跳過／重播 persistence、onboarding 與 Campaign v5 inventory／maintenance／Crew readiness／fleet state save 隔離，以及 768px 無水平 overflow。

## Balance gate

- `balance.ts` 直接呼叫正式 `createMission`、`resolveTeamSkill`、`endRound`、`resolveMissionBranch`、診斷與 Debrief，不維護第二套簡化公式。
- L1／L3／L5 profile 使用相同的 L1/L3/L5 career-role 混合隊伍，只將 Mastery XP 固定為 `0 / 250 / 900`，避免把角色技能組成差異誤判為 Mastery 效果。
- Gate 要求 L1 完成 Chapter 01–02、L3 完成 Chapter 01–04、L5 完成全部 Chapter 05；L5 終局不得全部落在 comfortable。
- 納入 Readiness Gate 後 L1 為 6/15、L3 為 12/15、L5 為 15/15；低階 profile 只會進入其 Mastery 可負責的 Chapter，L5 終局仍維持 tight／critical。
- Maintenance economy gate 使用 L5 deterministic 結果與每關推薦 loadout，採每關結束完整維修策略；15/15 皆可出勤，80 初始 MNT + 654 獎勵 − 438 維修 = 296 結餘，最低任務後 Condition 84%。
- Crew readiness economy gate 依序執行完整 L5 route，帶入前一場 `crewFatigue`、推薦 faction 輪調、返航／Reserve recovery，並只在 Exhausted 阻擋時使用 RST；結果 15/15 可部署、15/15 完成，3 初始 + 29 獎勵 − 0 使用 = 32 RST，最高持久疲勞 1%。另以 browser fixture 強制 100% Exhausted，驗證 Rest 100→60 與 deployment gate。
- 為支援成本 6–8 的高階技能，每回合 Energy 回復由 `2` 調為 `3`；SOV weather protection 由 `4` 調為 `5`。S4/S5 round limit 與 Chapter 05 `×2.00` deck 保留。
- `balance/campaign-balance-report.*` 明確標記為 gameplay simulation，不得視為風場、SCADA 或實驗數據。
- `bossChallengeBalance.ts` 對每個 counter set 精確比較全部 `C(300,3)=4,455,100` 組隊伍，保留 balanced／power／survival 各前 8 隊並逐 Boss 實跑正式 runtime。Gate 要求 100/100 可通關、每 Boss 至少三隊成功、S1/S2 可及性、無超過 8 分 severity inversion，且 S5 不得全部 comfortable。
- `balance/boss-challenge-balance-report.*` 目前為 100/100；S5 17 tight／3 critical／0 comfortable。這仍是 gameplay simulation，不是現場、SCADA、人因或實驗證據。
- `simulate:challenge` 先產生 compact audit，`validate` 再同步與驗證資料後執行 tests/build；避免 UI 打包上一版稽核結果。

## 可及性與窄螢幕

- Fatigue、Boss class 與 runtime status 同時使用文字、圖形與樣式，不以顏色作為唯一訊息。
- 「降低動態」偏好同步控制 CSS 與 Phaser；事件仍以靜態 telegraph 顯示，不會失去結果資訊。
- 寫實 field-feed 為靜態背景；右下 rotor digital twin 恰為三葉片且繞單一 hub origin 旋轉，降低動態時停止 tween。
- `≤900px` 改為 Mission → Card/Skills → Field/Log 單欄順序，提供最小 44px touch target 與固定回合操作列。
- Desktop 與 768px viewport 均由 Chrome smoke 驗證 Crew filters／Rotation Advisor／Dispatch Forecast、實際部署、Boss event、console 與水平 overflow。
- Browser smoke 會驗證第一回合開啟天候 branch、一般操作鎖定、Reactive 減傷、`BranchGuard` 狀態與 768px touch 回應。

## Web MVP 假設

Charter 同時定義 Action Points 與技能 Energy Cost，但沒有 Energy 回復公式。Web MVP 採以下可逆規則：

- 每次主動技能消耗 1 AP。
- 每回合 AP 重設為角色 `actionPoints`。
- 初始 Energy = 4；每回合恢復 3；上限 10。
- 技能仍依資料欄位扣除 `energyCost`。

此規則讓高能量 Ultimate 可在多回合策略中使用，且未改動 Excel／JSON 原始數值。

## 非目標

- 目前不包含多人連線、帳號、雲端存檔、付費系統或後端 API。
- 未核准 Source Art 不會被打包成完成卡牌。
## Current clean architecture note - 2026-07-18

- 版本：`2.79.0-fieldfeed-layout-geometry`。
- Operation field-feed runtime route：fallback／SCN002／SCN003 目前指向 AI 生成 `offshore-field-feed_ai_v003.png`，並保留 prompt 與 negative guardrails。v003 採 SOV 濕甲板、海況 2–3、遠近三葉片風機與 O&M field camera 視角；此資產只替換 runtime 背景，不改 scene metadata、mission settlement 或 save schema。
- Turbine geometry route：Fleet Board SVG 與 Phaser overlay 共用 deterministic 3-blade geometry；browser smoke 驗證 hub/shaft 同軸 metadata。
- Layout route：desktop Operation 保持單頁，資訊透過 LOG/SUMMARY tabs，MISSION CONTROL action 不允許被 panel 裁切。
