# OWM Course Mode 教師操作指南

## Working candidate 版本

- 現行版本：`3.59.0-student-quick-start`
- 課程來源與公開部署均由 `main` 維護；發布狀態以 GitHub Actions 最新 successful deployment 為準。
- 課程代碼：`NCUT-OWM-2026`
- 課程設定：`public/course/course-config.json`
- 正式網址：`https://dofliu.github.io/windFarmOMII/`
- Assessment 不顯示 `REC`、`GUIDE` 或正確診斷提示；OBJECTIVES 分頁也不顯示技能建議與回合預測，僅保留階段目標、學習目標與現況資訊。
- Course Record 僅使用匿名 learner code，不設姓名、Email、學號欄位。
- Course 首頁預設聚焦最新已解鎖週次；其他已解鎖週次可由週次進度列切換，Locked weeks 不會提前公開任務配置。Engineering Lab 預設收合，學生需要資料或程序練習時再展開。

## 手動解鎖週次

週次不會依日期或學生進度自動解鎖。教師明確指定目前可使用的週次：

```powershell
pnpm course:unlock -- --weeks W01,W02 --version 2026-FALL-W02
pnpm validate:course
```

若要暫停全部 Assessment：

```powershell
pnpm course:unlock -- --weeks NONE --version 2026-FALL-PAUSED
```

更新後提交並推送 `main`，GitHub Actions 會重新執行 validation、建立 GitHub Pages 與離線 ZIP。`smoke:course` 以部署站上的 `course-config.json` 為準做動態斷言，因此解鎖任何週次組合（含 `NONE` 暫停）都不會使 CI 失敗。

每週解鎖改變 `configVersion` **不會**清除學生瀏覽器中的 Course Record：既有紀錄會沿用，且每個 attempt 都記錄它執行當下的 `configVersion`，評分時可據此比對週次發布狀態。

## Assessment 固定條件

每個 assignment 固定：

- `missionId`
- 三個 `teamIds`
- `equipmentId`
- `spareId`
- `vesselId`
- `randomSeed`

Course Mode 使用 24 個職業角色代表，不使用 300 名角色的收藏／稀有度作為 Assessment 決策。

## Learning Record

候選版 Assessment 匯出 `OWM_COURSE_RECORD` schema v2 JSON。每個 event 明列 `context`、`actor`，可定位時另含 `attemptNumber`。

正式 `decisionOrder` 與提示次數只接受 `context=assessment_runtime`、`actor=learner`。目前自動產生的 fixed preflight JSA、stage-derived LOTO、settlement-derived Work Order 都是 system event；Engineering Lab 是 `practice_lab`，均可留在 audit log，但不能解讀成學生正式決策。

JSON 至少包含：

- release／config version
- course／learner anonymous code
- 任務與嘗試次數
- 決策順序
- 提示使用次數與 Assessment policy
- completion／safety／evidence／time／fatigue／cost 分項分數
- 結論／證據／不確定性／殘餘風險
- `DIAGNOSIS_SELECTED`
- `EVIDENCE_VIEWED`
- `HINT_USED`
- `JSA_COMPLETED`（目前為 system-derived）
- `LOTO_VERIFIED`（system 或 practice provenance）
- `WORK_ORDER_CREATED`（system 或 practice provenance）
- `MISSION_REPLAYED`
- `DEBRIEF_EXPORTED`

舊 v1 record 仍可讀取，但會標示 `integrityOrigin=migrated_v1`，只供歷史查閱；要取得正式 v2 evidence，需重設後重新完成 Assessment。

匯出 gate 會檢查所有 attempts，而非只檢查目前一筆：每筆都必須已結算、具 component scores，且四欄 Debrief 完整。Domain serializer 同樣會拒絕不完整資料。

### Authenticity boundary

`integrityOrigin=native_v2` 與 `integrityPolicy.schemaEvidenceEligible=true` 是 client-local 的 schema evidence eligibility：只表示匯出當下的資料結構、event provenance 與 completion／Debrief gate 彼此一致。export 同時固定標示 `integrityPolicy.authenticity=CLIENT_LOCAL_UNVERIFIED_NOT_TAMPER_EVIDENT`。它們不提供 cryptographic signature、tamper evidence、可信任時間戳、學生身分綁定或送件收據；瀏覽器 localStorage 與下載的 JSON 仍可能在裝置端被複製或修改。

因此，native v2 JSON 可作教學診斷、形成性回饋與待收件的 Assessment artifact，但不可單獨證明正式成績的真實性。若要納入正式評量，教師必須使用下列其中一種收件機制：

1. `instructor-controlled receipt`：在教師控制的 Assessment session／裝置或收件流程中接收原始 export，並由教師端保存可追溯的收件紀錄。
2. `signed/server-side collection`：由受控服務直接接收 record，並產生可驗證的 signature 或 server-side receipt。

在上述機制建立前，指南中的 `schemaEvidenceEligible` 只能解讀為「本機 schema/provenance/gate 合格」，不能解讀為「已驗證學生本人完成」或「可直接登錄正式成績」。

## CLO 工程學習頁

Course Mode 的 `Engineering Lab` 不改動既有 Campaign 平衡，只顯示教師已列入 `unlockedWeekIds` 的 assignments。每個資料包均是固定 seed 產生的教學資料，UI 明標 `SYNTHETIC / GAMEPLAY ABSTRACTION`，不是現場量測資料。

紀錄保護：

- 「重設課程進度」需要第二次點擊確認才會刪除，並可取消；刪除前請先匯出。
- 在同一瀏覽器輸入**不同的匿名代碼**開始 Assessment，需要先完成目前 Assessment 與四欄 Debrief，再經第二次點擊確認；系統會先自動下載既有代碼的 Course Record，才重建新紀錄（共機教室換人使用時的保護）。
- Course Record 僅存在該瀏覽器的 localStorage：每次課堂結束前請學生匯出 JSON（見下方課堂 SOP）。
- 匯出檔含 `recordDigest` 與 `unlockedWeekIdsAtExport`，教師以 `pnpm course:summary` 核對；分項分數在載入與匯出時都由六個分項重算。
- 課程設定（`course-config.json`）載入失敗時只隱藏課程分頁，戰役／演練照常可用；瀏覽器封鎖儲存時不會白屏。

## 課堂 SOP：每堂課結束前先匯出

Course Record 只存在該瀏覽器的 localStorage（`owm.course.v1`）：共機、換裝置、隱私模式、清除網站資料都會遺失；線上版與離線包是不同 origin，紀錄不互通。因此：

1. 每堂課結束前，每位學生按「匯出 Course Record」下載 JSON，並上傳至教師指定位置。
2. 重做任務之前也先匯出；`attemptCount` 會因重設或換瀏覽器歸零，教師保留匯出序列才能還原重試次數。
3. 若瀏覽器封鎖儲存（例如嵌入 LMS iframe），系統不會崩潰，但紀錄可能無法保存；請改用獨立分頁開啟正式網址。

## 教師端彙整與核對：`pnpm course:summary`

把全班的 `OWM_COURSE_RECORD_<課程代碼>_<匿名代碼>.json` 放進 `course-results/`，執行：

```powershell
pnpm course:summary
```

工具會產生 `course-results/COURSE_SUMMARY.md` 與 `.json`，並：

- 重算每份匯出的 `recordDigest`（SHA-256 over canonical `record`）；匯出後被改過的檔案標記 `MISMATCH`。
- 由六個分項重算 total／grade，並核對摘要欄位（attemptCount、componentScores、studentExplanations、decisionOrder、hintUsage）與內嵌 `record` 一致。
- 以「學生 × 週次 × 嘗試」列出結算時間、分數、四欄 Debrief 完成度、提示數、決策數、Engineering Lab 的 LOTO／Work Order 完成數與違序次數。
- 依 `public/course/course-config.json`（可用 `--config <path>` 覆寫）標記超前解鎖週次的嘗試；同一代碼多份匯出時以 `exportedAt` 最新者為準，並警告不符合 `OWM-XXXX-XXXX` 格式的代碼（可能是姓名或學號）。

## 哪些欄位可信、哪些不可信

| 欄位 | 可信度 | 說明 |
|---|---|---|
| `studentExplanations`（結論／證據／不確定性／殘餘風險） | **主要評分物** | 學生自己寫的工程說明；仍須配合教師收件流程判讀。 |
| `componentScores`、`recordDigest`、`configVersion`、`releaseVersion` | 可核對 | 分項分數由 `course:summary` 重算；digest 可偵測未同步修改，但不是 cryptographic signature 或身分證明。 |
| `hintUsage` | 應恆為 0 | Assessment 完全停用 REC／GUIDE；出現非零值請視為異常。 |
| `decisionOrder`／DECISIONS 數 | 僅佐證 | v2 僅納入 `learner + assessment_runtime`；系統自動 JSA／LOTO／Work Order 不計入，但事件順序仍不是能力量測。 |
| Engineering Lab 的 `LOTO_VERIFIED`／`WORK_ORDER_CREATED` | 僅佐證 | 程序練習的完成與違序次數，不代表 Assessment 任務中的實際操作。 |
| `attemptCount` | 不可作為評分依據 | 一鍵重設、清除網站資料、換瀏覽器都會歸零且不留痕跡。 |

靜態網站加 localStorage 的架構無法阻止有腳本能力的偽造（`missions.json` 本身含正確診斷選項）；digest 只是把門檻從「記事本」提高到「要會寫腳本」。重要考核請搭配現場監考或口試。

## CLO 工程學習頁

Course Mode 的 `Engineering Lab` 不改動既有 Campaign 平衡，只顯示**已解鎖週次**的資料包（資料包內容以週次編號為鍵，與解鎖組合、config 順序無關），每個固定任務各自提供可重現的 SCADA／CMS 資料包：

- Timestamp、Load、Temperature、Vibration
- Alarm／Event sequence
- 明確標示的 missing value
- Availability、MTBF、MTTR、Downtime、OPEX 輸入、公式與結果

程序練習會強制依序完成：

- LOTO：Shutdown → Isolate → Lock/Tag → Residual energy control → Zero-energy verification
- Work Order：Trigger → Acknowledge → Dispatch → Execute → Verify → Close-out

Alarm／Interlock tester 支援 Threshold、Hysteresis、Delay、Persistence 與 Interlock，並同步產生 IEC 61131-3 ST reference logic。

完成 Assessment 後，Debrief 必須填寫「結論／證據／不確定性／殘餘風險」；所有嘗試均完成四欄後才可匯出 Course Record。

## 延伸案例庫

P2 題材先以 12 個 elective case packs 放入 Course Mode，不改動凍結學期版的 15 個 Campaign 任務數值。案例涵蓋 Sensor drift、PLC／SCADA communications、Historian time synchronization、Alarm flood、Gearbox oil／borescope、Brake、Converter／cooling、Subsea cable／offshore substation、CTV／SOV scheduling、spares／crew planning、Work Order automation failure、false alarm 與 Interlock proof test。

Course Mode 導覽僅顯示 24 個職業角色、固定任務與案例數量；`Boss Challenge` 在課程脈絡改稱 `Critical Incident Exercise／重大事故演練`，並隱藏收藏導向入口。

## 離線備援

本機建立：

```powershell
pnpm package:offline
```

輸出 `OWM_COURSE_OFFLINE_3.58.0.zip`。解壓縮後執行 `START_OFFLINE.bat`。

GitHub Actions 每次正式發布也會附加同名 workflow artifact。

## 學期凍結

`frozen: true` 代表學期版本不調整平衡公式。學期中只允許：

- 手動變更 `unlockedWeekIds`
- 修正阻斷性 bug
- 不改變分數或任務條件的 accessibility 修正

數值平衡變更應另開下一個 release version，不能覆寫本學期 Course Record 的版本語意。

## 目前課程範圍與證據限制

- 現行 config 定義 W01–W15；W16–W18 尚未由正式課綱定義。
- 尚未完成 CLO→週次→活動→評量證據→rubric 的 18 週矩陣。
- Automated flow、smoke 與 simulation 只證明軟體行為，不代表學生理解。
- 下一個教學 gate 是 Course-specific W09→W10 真人 pilot；取得證據前不調整 frozen balance。
- 平台與證據權責詳見 `OWM_WEB_COURSE_MODE_ADDENDUM_v1.0.md`。
