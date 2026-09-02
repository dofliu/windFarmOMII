# OWM 下一個 Session 交接

建立日期：2026-07-27
更新日期：2026-07-30

現行版本：`3.57.1-course-mode-p0`

策略平衡基準：`3.54.0-strategy-balance-v1`

遠端整合基準：本次完成後 `origin/main` 與本地 `main` 同步

## 已完成

- Course Mode P0 已完成：Guided Practice／Assessment 分流、REC／GUIDE 停用、15 個固定任務、24 人職業角色池、教師手動週次發布、匿名 Learning Record、一鍵重設、GitHub Pages 與離線 ZIP。
- Course Mode P1／P2 課程層已完成：每任務 SCADA／CMS data pack、可靠度／OPEX 計算、五步 LOTO、六階段 Work Order、Alarm／Interlock tester、Debrief 四項必填與 12 個 elective case packs；Campaign 平衡未更動。
- 2026-07-30 驗證：25 test files／159 tests、完整 `pnpm validate`、16 組 browser smoke、Pages build 與離線包流程均通過。
- Web MVP 已完成 Campaign、Boss Challenge、Sandbox、Fleet、Deployment、Operation、Debrief、Collection 與存檔流程。
- Deployment 使用五個逐步畫面；Operation 使用三個聚焦畫面，桌機與 390×844 手機流程均已驗證。
- 300/300 名角色已有可用 P01 Source Art；目前主線不再是繼續生圖。
- 策略平衡 v1 已完成：
  - L5 Campaign `15/15` 完成。
  - 最高持續疲勞 `76%`，輪調路線消耗 `2 RST`、結束剩餘 `6 RST`。
  - 完整裝備維修後剩餘 `55 MNT`。
  - Boss counter 為 `×1.35`。
  - Boss 推薦隊伍共 18 組，單隊最多重複 12 次；100/100 Boss 可完成。
- `pnpm validate` 通過：21 個測試檔、143 項測試、資料／Scene／Art gate、Campaign／Boss balance 與 production build。
- Gameplay、Challenge、1440×900 layout、390×844 mobile flow smoke 通過。
- Playtest observation 已完成：匿名 participant session、Campaign 決策事件、四個主持人觀察欄與 JSON export。
- Evidence pipeline 已完成：`pnpm playtest:summary` 驗證 3–5 人、Desktop／Mobile 覆蓋、完成狀態、匿名代碼唯一性與四個觀察欄。
- 新手練習與正式測試已分流；練習不寫入正式 Playtest session。
- 導覽卡可完全收起，頂部「導覽 n/5」會從原進度展開；底層 Deployment tabs 與 Readiness controls 在 Desktop／Mobile 均可操作。
- 最新完整驗證基準為 23 個測試檔、150 項測試；仍不得把自動驗證宣稱為玩家理解。

- 2026-08-31／09-02 課程系統審查修正：P0 六項（紀錄保護、防洩題、週次鎖、CI 動態斷言）與 P1 的 B1／B2／B4／B8／C1／C2／C3 已完成；匯出檔含 `recordDigest`，教師以 `pnpm course:summary` 核對全班紀錄。尚待辦項目見 `OPS_SYSTEM_REVIEW_2026-08-31.md` 頂部修復狀態。

## 下一個 Session 從這裡開始

系統與記錄工具已完成，主線是執行「Playtest v1」真人測試，先驗證玩家是否理解目前策略，而不是立即再調數值。

1. 依 `PLAYTEST_PROTOCOL_2026-07-27.md` 讓每位新手先完成標準化練習。
2. 使用匿名代碼啟動正式測試，至少完成三關並記錄 Rotation、RST、MNT 與理解障礙。
3. 收集 3–5 位玩家，且至少包含 1 位 Desktop、1 位 Mobile。
4. 將完成 JSON 放入 `playtest-results/`，執行 `pnpm playtest:summary`。
5. Summary 達到 `ANALYSIS READY` 後才討論教學調整或策略平衡 v2；未觀察項目維持 `NA`。

## 開始前檢查

```powershell
pnpm validate
pnpm smoke:gameplay
pnpm smoke:challenge
pnpm smoke:mobile:flow
pnpm smoke:onboarding
pnpm smoke:playtest
```

平衡數值來源：

- `balance/campaign-balance-report.md`
- `balance/boss-challenge-balance-report.md`
- `GAMEPLAY_EXPERIENCE_AUDIT_2026-07-26.md`
