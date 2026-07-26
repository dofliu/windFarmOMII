# OWM 下一個 Session 交接

日期：2026-07-27

穩定版本：`3.54.0-strategy-balance-v1`

基準 commit：`0067b1f`

## 已完成

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

## 下一個 Session 從這裡開始

主線進入「Playtest v1」，先驗證玩家是否理解目前策略，而不是立即再調數值。

1. 建立三段短測試流程：
   - Campaign 前三關：理解 Deployment、技能與任務階段。
   - 疲勞／維修情境：判斷何時輪調、使用 RST 或保留 MNT。
   - Boss Challenge：依 6/6 stage coverage 與 counter 選擇隊伍。
2. 建立可記錄的觀察表：完成時間、錯誤操作、求助次數、RST/MNT 決策與主觀難度。
3. 先用 3–5 位玩家測試桌機與手機。
4. 有行為資料後才進入「策略平衡 v2」；模擬結果不得冒充人因測試結果。

## 開始前檢查

```powershell
pnpm validate
pnpm smoke:gameplay
pnpm smoke:challenge
pnpm smoke:mobile:flow
```

平衡數值來源：

- `balance/campaign-balance-report.md`
- `balance/boss-challenge-balance-report.md`
- `GAMEPLAY_EXPERIENCE_AUDIT_2026-07-26.md`
