# OWM 下一次工作交接 — 2026-08-13

## 先讀順序

1. `OWM_MASTER_PROJECT_CHARTER_v1.0.docx`
2. `OWM_WEB_COURSE_MODE_ADDENDUM_v1.0.md`
3. `COURSE_MODE_GUIDE.md`
4. 本文件
5. `reports/README.md`

## 目前權威狀態

- Release：`3.58.0-course-record-integrity`
- CourseConfig：`2026-FALL-manual-release-v1`
- Semester policy：`frozen=true`
- Released weeks：W01 only
- Assignments：W01–W15，共 15 組
- Git base：本次開始時 `main=origin/main=37fb419`
- 本次成果目前是 working-tree changes；未自行 commit、push 或發布。
- 既有 `reports/` 兩個 2026-08-03 檔案是 legacy v1 automated evidence，不是 human pilot。
- `integrityOrigin=native_v2`／`integrityPolicy.schemaEvidenceEligible=true` 只代表 client-local schema、provenance 與 export gate 一致；export 會標示 `authenticity=CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT`。它不具 tamper evidence、身分綁定或可信任收件證明，不能直接作為正式成績真實性依據。

## 本次完成：Course Record Integrity Gate

1. Course Record schema 升為 v2；events 增加 `context`／`actor`，可定位 Assessment attempt 時另含 `attemptNumber`。
2. 正式 `decisionOrder` 僅接受 `learner + assessment_runtime`。
3. 自動 JSA／LOTO／Work Order 明列 `actor=system`，不得當作學生程序證據。
4. Guided Practice 不再修改 Assessment Course Record。
5. Engineering Lab events 使用 `practice_lab` provenance，不影響 formal decisions。
6. 所有 attempts 均須結算、具 scores 且四欄 Debrief 完整，才能匯出；serializer 同樣 fail closed。
7. Legacy v1 可讀取並標為 `migrated_v1`／historical only；缺 provenance 的 v2 event 會降為 `legacy_unknown/unknown`、排除 formal decisions，並將 integrity origin 標為 invalid，而非拒絕整份歷史資料。
8. Engineering Lab 僅顯示已解鎖 assignments，SCADA／CMS packs 明標 synthetic provenance。
9. `pnpm course:summary` 從 `MISSION_SETTLED` 重建 outcome，解決舊 full-flow summary 的 `success/round=null`。

## 驗證基準

```text
pnpm validate
26 test files / 174 tests passed
Data / Scene / Art / Course validation passed
Campaign / Challenge balance passed
production build passed

pnpm smoke:course
Desktop / Mobile / Assessment / export-integrity smoke passed
```

完整 16 組 browser smoke 最近一次全量基準仍是 2026-07-30；本次只重新執行受影響的 Course smoke，不把歷史結果改寫成本輪結果。

Legacy evidence 可執行：

```powershell
pnpm course:summary -- reports/OWM_COURSE_RECORD_STUDENT_FULL_RUN.json
```

可重建 16 attempts、15 missions 的 outcome；工具會明列 `LEGACY_PROVENANCE_UNVERIFIED` warning。

## 尚未完成

1. 尚無 18 週 CLO→週次→活動→評量證據→rubric matrix；目前只有 W01–W15。
2. 尚無 Course-specific human pilot protocol；既有 `PLAYTEST_PROTOCOL_2026-07-27.md` 是 Campaign protocol，不可直接替代。
3. 尚未執行 3–5 位真人學生 W09→W10 pilot。
4. 2026-08-03 DOCX 尚未重產；應改名為 `Automated Course Flow Validation Report`、時區改為 `Asia/Taipei`，並修正 header spacing。
5. ignored `.codex_qa/student-full/` 的 15 週 browser runner 尚未移入 tracked CI；本次已先提供 tracked summary 與更嚴格的 Course smoke。
6. `OWM_COURSE_OFFLINE_3.58.0.zip` 尚未重新封裝；發布前執行 `pnpm package:offline`。
7. 尚未建立正式評量的 authenticity chain；在 instructor-controlled receipt 或 signed/server-side collection 完成前，native v2 export 只能視為待收件的本機 Assessment artifact。

## 下一個建議增量

先交付兩份 working documents，不先改程式或 balance：

1. `OWM_18_WEEK_CLO_EVIDENCE_MATRIX_v1.0.xlsx`
2. `COURSE_MODE_PILOT_PROTOCOL_v1.0.docx`

矩陣需由正式課綱決定 W16–W18，不自行填入推測內容。Pilot protocol 固定 W09→W10、3–5 位真人學生、Desktop／Mobile、think-aloud、moderator notes、CLO rubric 與 native v2 Course Record。取得真人證據前不調整 frozen W10–W15 balance。

Pilot protocol 必須同時定義 Course Record 收件鏈：至少採 instructor-controlled receipt，若要讓平台本身提供正式成績真實性，則需另建 signed/server-side collection。不得把 client-local `schemaEvidenceEligible=true` 當成 tamper-evident receipt。

P01 final AI upscale 可獨立平行進行，但不是 Course Mode 下一主線。
