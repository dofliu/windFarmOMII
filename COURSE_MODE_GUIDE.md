# OWM Course Mode 教師操作指南

## 固定版本

- 遊戲版本：`3.57.1-course-mode-p0`
- 課程代碼：`NCUT-OWM-2026`
- 課程設定：`public/course/course-config.json`
- 正式網址：`https://dofliu.github.io/windFarmOMII/`
- Assessment 不顯示 `REC`、`GUIDE` 或正確診斷提示。
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

更新後提交並推送 `main`，GitHub Actions 會重新執行 validation、建立 GitHub Pages 與離線 ZIP。

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

## CLO 工程學習頁

Course Mode 的 `Engineering Lab` 不改動既有 Campaign 平衡，15 個固定任務各自提供可重現的 SCADA／CMS 資料包：

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
