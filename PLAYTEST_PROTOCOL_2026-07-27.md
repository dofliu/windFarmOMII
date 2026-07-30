# OWM 策略決策 Playtest Protocol v1

日期：2026-07-27
適用版本：`3.57.1-course-mode-p0`
目標人數：3–5 位未參與開發的玩家
裝置配置：至少 1 位桌機、1 位手機

## 測試目的

本輪只回答三個人因問題：

1. 玩家何時理解應輪調技師，而不是持續沿用同一隊？
2. 玩家何時願意花費 RST，何時選擇保留？
3. 玩家能否理解 Equipment／Fleet Maintenance 共用 MNT，並做出保留或支出的取捨？

自動 simulation、smoke test 與事件數量不能替代玩家理解；正式結論必須來自本 protocol 的真人操作與訪談紀錄。

## 測試前準備

1. 啟動 Web MVP，確認版本為 `3.57.1-course-mode-p0`。
2. 每位參與者使用獨立瀏覽器 profile，或在開始前清除 OWM localStorage。
3. 由頂部「測試」進入 Playtest 頁面，先按「第一次玩：開始練習導覽」；此階段不輸入參與者代碼，也不記錄正式事件。
4. 依畫面完成一次 Deployment、Event Deck、Reactive window、Diagnosis gate 與 Debrief。主持人可以協助閱讀操作指示，但不補充畫面未提供的最佳策略。
5. 練習完成後會自動回到 Playtest 頁；只輸入匿名代碼，例如 `D01`、`M01`，不得輸入姓名、Email 或學號。
6. 選擇實際使用的 Desktop／Mobile，按「開始正式測試與紀錄」。
7. 主持人說明正式階段採 think-aloud，且不再解釋 Fatigue、RST 或 MNT 的正確策略。

練習導覽是所有新手都接受的標準化教學，不屬於正式測試資料。若參與者已玩過相同版本，可略過練習，但需在主持人觀察欄註明。

## 任務流程

每位參與者依序執行：

1. 進入 Campaign，自行完成部署與至少三個任務；若時間允許，繼續至首次主動輪調、使用 RST 或維修。
2. 每次看到 Tired／Critical／Exhausted 時，先說明是否換人及理由，再操作。
3. 每次使用 Rest 時，先說明為何現在花 RST。
4. 每次 Equipment／Fleet Maintenance 前，先說明為何現在花 MNT；若選擇不修，也需說明保留理由。
5. 回到「測試」頁，由主持人填寫四個觀察欄位。
6. 按「完成本次測試」，下載 `OWM_playtest_<代碼>_<裝置>.json`。

收齊 JSON 後放入 `playtest-results/`，執行：

```powershell
pnpm playtest:summary
```

工具會驗證匿名代碼、schema、完成狀態、3–5 人數、Desktop／Mobile 覆蓋與四個觀察欄位，並產生 `PLAYTEST_SUMMARY.md`／`.json`。未達 gate 時狀態維持 `INCOMPLETE`。

主持人只可使用中性提示：

- 「你現在看到哪些資訊？」
- 「你預期按下去後會發生什麼？」
- 「你為什麼選擇現在做／不做？」

不得說「應該換人」、「RST 要省」或「先不要維修」。

## 紀錄與判讀

JSON 會保存：

- `CREW_ROTATED`：換班前後 stable IDs、兩隊疲勞、當時 RST／MNT。
- `RST_SPENT`：角色、疲勞前後、RST 前後。
- `EQUIPMENT_REPAIRED`／`FLEET_MAINTAINED`：維修目標與 MNT 前後。
- `MISSION_DEPLOYED`／`MISSION_SETTLED`：任務、隊伍、資源與結算。
- 四個真人觀察欄位。

判讀時需將「做了某個動作」與「理解為何做」分開。事件 log 只證明行為發生；理解必須由 think-aloud 與主持人筆記支持。

## 完成門檻

本輪資料可進入教學訊息／門檻調整，必須同時符合：

- 有 3–5 份已完成 JSON。
- Desktop 與 Mobile 均有覆蓋。
- 每位參與者四個觀察欄位均已填寫。
- 所有結論都能回指匿名 participant code 與原始事件；未觀察到的項目標示 `NA`。

在取得上述資料前，不宣稱玩家已理解輪調、RST 或 MNT，也不以自動 simulation 結果代替人因證據。
