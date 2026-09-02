# OWM Course Mode 教師操作指南

## 固定版本

- 遊戲版本：`3.57.1-course-mode-p0`
- 課程代碼：`NCUT-OWM-2026`
- 課程設定：`public/course/course-config.json`
- 正式網址：`https://dofliu.github.io/windFarmOMII/`
- Assessment 不顯示 `REC`、`GUIDE` 或正確診斷提示；OBJECTIVES 分頁也不顯示技能建議與回合預測，僅保留階段目標、學習目標與現況資訊。
- Course Record 僅使用匿名 learner code，不設姓名、Email、學號欄位。

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

Assessment 匯出 `OWM_COURSE_RECORD` JSON，至少包含：

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
- `JSA_COMPLETED`
- `LOTO_VERIFIED`
- `WORK_ORDER_CREATED`
- `MISSION_REPLAYED`
- `DEBRIEF_EXPORTED`

紀錄保護：

- 「重設課程進度」需要第二次點擊確認才會刪除，並可取消；刪除前請先匯出。
- 在同一瀏覽器輸入**不同的匿名代碼**開始 Assessment 需要第二次點擊確認，且會先自動下載既有代碼的 Course Record，再重建新紀錄（共機教室換人使用時的保護）。
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
| `studentExplanations`（結論／證據／不確定性／殘餘風險） | **主要評分物** | 學生自己寫的工程說明；digest 保證匯出後未被改動。 |
| `componentScores`、`recordDigest`、`configVersion`、`releaseVersion` | 可核對 | 分項分數由 `course:summary` 重算；digest 對不上即視為匯出後竄改。 |
| `hintUsage` | 應恆為 0 | Assessment 完全停用 REC／GUIDE；出現非零值請視為異常。 |
| `decisionOrder`／DECISIONS 數 | 僅佐證 | 含系統自動蓋章的 `JSA_COMPLETED`、階段代理的 `LOTO_VERIFIED` 與結算附加的 `WORK_ORDER_CREATED`，不是能力量測。 |
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

完成 Assessment 後，Debrief 必須填寫「結論／證據／不確定性／殘餘風險」，四欄完整後才可匯出 Course Record。

## 延伸案例庫

P2 題材先以 12 個 elective case packs 放入 Course Mode，不改動凍結學期版的 15 個 Campaign 任務數值。案例涵蓋 Sensor drift、PLC／SCADA communications、Historian time synchronization、Alarm flood、Gearbox oil／borescope、Brake、Converter／cooling、Subsea cable／offshore substation、CTV／SOV scheduling、spares／crew planning、Work Order automation failure、false alarm 與 Interlock proof test。

Course Mode 導覽僅顯示 24 個職業角色、固定任務與案例數量；`Boss Challenge` 在課程脈絡改稱 `Critical Incident Exercise／重大事故演練`，並隱藏收藏導向入口。

## 離線備援

本機建立：

```powershell
pnpm package:offline
```

輸出 `OWM_COURSE_OFFLINE_3.57.1.zip`。解壓縮後執行 `START_OFFLINE.bat`。

GitHub Actions 每次正式發布也會附加同名 workflow artifact。

## 學期凍結

`frozen: true` 代表學期版本不調整平衡公式。學期中只允許：

- 手動變更 `unlockedWeekIds`
- 修正阻斷性 bug
- 不改變分數或任務條件的 accessibility 修正

數值平衡變更應另開下一個 release version，不能覆寫本學期 Course Record 的版本語意。
