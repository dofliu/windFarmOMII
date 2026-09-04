# OWM Web／Course Mode Addendum v1.0

狀態：Draft implementation clarification（待劉老師核准並發布）  
生效日期：2026-08-13  
適用版本：`3.58.0-course-record-integrity`

## 1. 目的與權責

本 Addendum 補充 `OWM_MASTER_PROJECT_CHARTER_v1.0.docx` 尚未涵蓋的 Web／Course Mode 實作，不覆寫 Charter 的資料完整性、角色與技能、任務、裝備、場景及安全原則。

權責分工：

1. 最新明確使用者指示優先。
2. Charter、`OWM_Data_Master_v1.0.xlsx` 與同步 JSON 管理核心資料與不變規則。
3. 本 Addendum 管理 Web／Course Mode 的平台、Assessment、Learning Record 與教學發布規則。
4. `public/course/course-config.json` 僅管理學期 release、roster、固定 assignments 與 `unlockedWeekIds`，不取代 Data Master。
5. Web 是目前核准的執行平台；Charter 中 Unity 規格保留為另一實作目標，不用來否定已核准的 Web runtime。

## 2. 課程發布與學期凍結

- CourseConfig schema 維持 v1；目前 `configVersion=2026-FALL-manual-release-v1`、`frozen=true`。
- Assessment 與 Engineering Lab 均只顯示教師明確列入 `unlockedWeekIds` 的週次。
- 不依日期、登入、學生進度或本機時間自動解鎖。
- 學期凍結期間可修正證據完整性、accessibility 與阻斷性 bug；不得原地改寫任務條件、評分或 frozen balance。

## 3. Guided Practice 與 Assessment 邊界

- Guided Practice 可顯示 REC／GUIDE／提示，但不得建立或修改 Assessment Course Record。
- Assessment 固定 mission、team、equipment、spare、vessel 與 random seed，並隱藏 REC／GUIDE／正確答案提示。
- Course Engineering Lab 是 practice context；其操作可保留在 audit event log，但不得算入正式 Assessment `decisionOrder`。

## 4. Course Record v2 integrity contract

每個 event 必須包含：

- `context`：`assessment_runtime`、`practice_lab`、`guided_practice`、`system` 或 legacy fallback。
- `actor`：`learner`、`system`、`instructor` 或 legacy fallback。
- 可定位時包含 `assignmentId`、`missionId`、`attemptNumber`。

正式 `decisionOrder` 與 `hintUsedCount` 只接受：

```text
context = assessment_runtime
actor   = learner
```

目前自動建立的 fixed preflight JSA、stage-derived LOTO 與 settlement-derived Work Order 均為 `actor=system`，不能解讀為學生已完成程序操作。若課程要將三者作為正式學習證據，必須另建學生可操作且可評量的流程。

匯出必須同時符合：

1. 至少有一個 attempt。
2. 所有 attempts 均已結算並具 component scores。
3. 每個 attempt 的 conclusion、evidence、uncertainty、residual risk 均非空白。
4. UI 與 serializer 使用同一 fail-closed 規則。

舊 v1 record 可保留並讀取；migration 必須標記 `integrityOrigin=migrated_v1`。它是歷史診斷資料，不得自動宣稱符合 native v2 formal-evidence contract。

### 4.1 Authenticity boundary

`integrityOrigin=native_v2` 與 export 中的 `integrityPolicy.schemaEvidenceEligible=true` 只表示 client-local record 符合本節的 schema、provenance 與 export gate。export 必須同時宣告 `integrityPolicy.authenticity=CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT`。這是 schema evidence eligibility，不是 authenticity attestation；目前 client 不提供 cryptographic signature、tamper evidence、可信任時間戳、學生身分綁定或不可否認的 submission receipt。

因此，native v2 record 不得單獨作為「學生本人完成」或正式成績真實性的充分證明。正式評量必須另具至少一種受控收件鏈：

1. `instructor-controlled receipt`：由教師控制 Assessment session、收件入口與原始檔保存，並保留可追溯的收件紀錄。
2. `signed/server-side collection`：由受控 server 直接接收 record，並產生可驗證的 signature 或 server-side receipt。

在上述機制完成前，native v2 record 僅可作為 client-local Assessment artifact、教學診斷或形成性回饋來源；若用於計分，必須由教師透過受控收件鏈另行確認。

## 5. 工程資料 provenance

SCADA／CMS packs 是由固定 seed 產生的 deterministic teaching data，必須標示：

```text
SYNTHETIC / GAMEPLAY ABSTRACTION
```

它們可用於資料品質、KPI、診斷與控制邏輯教學，不得描述為現場量測、實機驗證或真人學習成效。

## 6. 證據界線與下一個 gate

- Unit tests、browser smoke、simulation 與 automated agent flow 證明的是軟體行為，不證明學生理解。
- 2026-08-03 report／JSON 是 legacy v1 automated-flow 診斷證據。
- 正式 Course pilot 需另建 protocol 與 CLO rubric，使用 3–5 位真人學生、Desktop／Mobile、W09→W10 固定順序、think-aloud notes 與 native v2 Course Record。
- 目前 config 僅有 W01–W15；W16–W18 與完整 CLO→週次→活動→證據→rubric 矩陣須由正式課綱決定。
- 真人證據完成前，不調整 frozen W10–W15 balance。
