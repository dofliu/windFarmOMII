# OWM 開發規劃

更新日期：2026-09-02 · 版本基準：`3.57.1-course-mode-p0`（學期凍結中）

問題的完整診斷在 [`OPS_SYSTEM_REVIEW_2026-08-31.md`](OPS_SYSTEM_REVIEW_2026-08-31.md)，
本文件只負責**排序、驗收條件與凍結期界線**。

## 凍結期界線

`public/course/course-config.json` 的 `frozen: true` 代表 `2026-FALL` 學期版不調整平衡。
學期中只能做三件事：

1. 手動變更 `unlockedWeekIds`
2. 修正阻斷性 bug
3. 不改變分數或任務條件的 accessibility 修正

下表的 P1／P2 **多數落在第 2 類**（成績證據錯誤屬阻斷性），但凡是會改變分數語意的，
一律留到下一個 release version，不覆寫本學期 Course Record 的版本語意。

---

## P1 — 成績證據可信度（本學期內應完成）

這些欄位現在正被當成學習證據使用，錯誤會直接影響評分公平性。

### P1-1　移除 `HINT_USED` 反向記帳
- **問題**：`src/App.tsx:1284` 在「非 assessment」session 點 GUIDE 時寫入課程紀錄，
  被 `appendCourseEvent` 歸到最後一次 assessment attempt，`hintUsedCount` 與 `decisionOrder` 都被污染。
  匯出檔會出現非零 hint 數與 `REC_AND_GUIDE_DISABLED` 並存的矛盾。
- **做法**：刪掉該分支的課程紀錄寫入（`EVIDENCE_VIEWED`／`DIAGNOSIS_SELECTED` 已是正向守門，照抄即可）。
- **驗收**：新增 domain 測試 —— 練習模式事件不得改變既有 attempt 的 `hintUsedCount` 與 `decisionOrder`。
- **規模**：單點修正。凍結期允許（修正錯誤紀錄，不改分數公式）。

### P1-2　`scores` 驗證與紀錄防偽
- **問題**：`src/domain/course.ts:423` 的 `scores` 是 normalize 時**唯一未驗證**的欄位，
  DevTools 改 `{total:100, grade:'S'}` 後重整、匯出都有效。匯出檔也沒有任何防偽。
- **做法**：
  1. normalize 時驗證分項範圍與等第枚舉，並由六個分項重算 `total`；
  2. 匯出加 `recordDigest`（canonical record 的 SHA-256）；
  3. 摘要欄位與內嵌 `record` 做一致性檢查；
  4. 附教師端核對腳本（十行內）。
- **驗收**：竄改 localStorage 後匯出，核對腳本應判定不一致；正常流程應通過。
- **注意**：靜態站無法提供不可偽造的成績單（見 review E 節），這只是把門檻從「記事本」提高到「要會寫腳本」。

### P1-3　程序練習的證據要真實
- **問題**：`CourseEngineeringLab.tsx:85` 在第一步 TRIGGER 就觸發，卻寫入硬編碼的完整六階段 lifecycle；
  兩個程序唯一的量測值 `rejectedActions`（違序次數）**從未寫入紀錄**。
- **做法**：改在 `workOrder.closed` 時觸發，記錄實際 `completedSteps` 與 `rejectedActions`；LOTO 同理。
- **驗收**：只按 TRIGGER 不得產生 `WORK_ORDER_CREATED`；違序十次後匯出檔看得出來。

### P1-4　Debrief 匯出閘門涵蓋所有 attempt
- **問題**：`src/App.tsx:757` 只檢查最新 attempt，結算後再開新嘗試會讓舊 attempt 的空白 Debrief 放行。
  另有兩套 active-attempt 定義並存（`attempts.at(-1)` vs `activeAssignmentId` 反查）。
- **做法**：統一 active-attempt 解析；閘門檢查所有已結算 attempt。

### P1-5　learner code 格式驗證
- **問題**：`CourseModePanel.tsx:172` 只要非空即可開始，打 `A`、打同學代碼、打真實姓名都收。
- **做法**：runtime 強制 `OWM-XXXX-XXXX`（產生器與 smoke 已假設此格式）。

---

## P2 — 教學內容正確性（會被外審檢視）

### P2-1　OPEX 定義
`courseEngineering.ts:321` 把 lost revenue 併入 OPEX。損失電費是機會成本不是營運支出，
學生日後算 margin／LCOE 會重複計算。改名 `totalDowntimeCost`，`opex` 另列。**會改變顯示數值 → 排下一個 release。**

### P2-2　產生的 ST 與模擬器時序不一致
模擬器（`:405`）delay 從第一個超限樣本起算、與 persistence **並行**；
產生的 ST（`:370`）是 `PersistCounter.Q` 之後才啟動 TON 的**串聯**語意。預設參數下差 10 秒。
`courseEngineering.test.ts` 只 grep 字串，把錯誤鎖進測試。教 PLC 的頁面給出對不上的參考程式，外審會抓。

### P2-3　KPI 零故障語意
`:316-318` 在零故障／零觀測時回 0 —— 語意顛倒（零故障是最好的結果卻顯示 0h）。改回 `null` 顯示 `N/A`。
目前生成資料 `failures >= 1` 不會觸發，屬潛在地雷。

### P2-4　資料包改由 seed 派生
`:229-232` 以 `assignmentIndex` 為鍵。已修掉「部分解鎖」的情境（改用週次編號），
但 config 重排仍會改變答案。改為全部由 `randomSeed` 派生可徹底解耦。

### P2-5　其他
Availability 未標示 IEC 61400-26 口徑；MTBF 區間慣例未註明；`hysteresis=0` 在閾值處抖動；
Alarm tester 用硬編碼樣本而非該週資料包（15 週內容相同，無評量鑑別度）。

---

## P3 — 穩定性與部署（不影響成績，但影響上課體驗）

| 項目 | 問題 | 出處 |
|---|---|---|
| course-config soft-fail | 設定壞掉會拖垮整個 app（連戰役都進不去），錯誤頁是死路 | review C1 |
| `localStorage.setItem` 全裸 | 寫入端無 try/catch；`audio.ts:14` 在 module 載入時就讀 localStorage —— **嵌入 LMS iframe 會白屏** | review C2 |
| 部署包瘦身 | `sync-data.mjs` 全量複製，`prompts.json` 4.98 MB 前端從不讀取（且不宜對學生公開） | review C3 |
| Phaser 重建 | 換角色會 `game.destroy(true)` + 重建 WebGL（`accent` 進了建游戲 effect 的依賴） | review C4 |
| CI 結構 | 無 PR 驗證；離線 ZIP 失敗會擋住 Pages 部署；actions 用 mutable tag | review C5 |

**若有 LMS 內嵌計畫，C2 要提到 P1**。

---

## 缺少的工具

- **教師端 Course Record 彙整**（完全不存在）：一班 × 15 週的 JSON 目前只能人工開檔。
  playtest 有 `pnpm playtest:summary` 可直接照抄結構，加上 P1-2 的 digest 核對。
- **smoke 未覆蓋完整 Assessment 生命週期**：目前只玩到中途就匯出，
  結算、計分、Debrief 閘門在 CI 無測試。

---

## 兩條未受影響的既有主線

### 真人 Playtest v1（`playtest-results/` 仍為 0 筆）
依 [`PLAYTEST_PROTOCOL_2026-07-27.md`](PLAYTEST_PROTOCOL_2026-07-27.md) 收 3–5 位、含 Desktop／Mobile，
執行 `pnpm playtest:summary` 達 `ANALYSIS READY` 後，才討論教學調整或策略平衡 v2。
**在此之前不得把自動化驗證宣稱為玩家理解。**

### P01 production art
queue 維持 `210 Upscale Pending / 90 Production QA Pending / 0 Production Approved`。
下一步是對 ledger 已核准的 90 個 ID 執行 final AI upscale 與 full-resolution QA；
在建立可重現的 model／weights／checksum contract 前，deterministic resize 不冒充 final upscale。
詳見 [`RELEASE_READINESS.md`](RELEASE_READINESS.md)。

---

## 建議順序

1. **P1-1**（單點、最便宜，先把錯誤紀錄止血）
2. **P1-3 + P1-4 + P1-5**（同屬紀錄正確性，可一批處理）
3. **P1-2**（digest 與核對腳本，含教師端工具）
4. **教師端彙整工具** + **smoke 補完整生命週期**
5. **P3-C2**（若要 LMS 內嵌則提前）、**P3 部署瘦身**
6. **P2 教學內容**（多數會改顯示數值 → 併入下一個 release version）
