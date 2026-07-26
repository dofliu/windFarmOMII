# OWM 遊戲邏輯與操作體驗檢視

日期：2026-07-26  
範圍：Web MVP 的 Campaign、Boss Challenge、Deployment、Operation、手機操作與策略壓力

## 結論

目前版本已具備可完整測試的遊戲循環：

`選擇任務 → 作業許可 → 編組技師 → 配置裝備 → 確認出勤 → 現場決策 → 任務結算 → 保存進度`

Campaign、Boss Challenge、Sandbox、Fleet Maintenance、Onboarding、場景路由與存檔隔離均通過自動回歸。遊戲「能運作、能完成、能保存」已確認；下一個主要風險不是圖片量，而是疲勞、維修資源與隊伍組合的策略壓力仍偏弱。

## 運作邏輯

- Campaign 共有 5 個章節、15 個任務，任務解鎖、前置關卡、部署資格與結算保存均能正確銜接。
- 每回合會在 `ACT / DIAG / EVENT / RISK / ROUND` 之間給出下一步提示，並連結到技能、診斷、事件處置或結束回合操作。
- Weather、Safety、Evidence、Fatigue、AP、Energy、裝備與船舶修正會進入任務計算；高風險結束回合需要二次確認。
- Boss Challenge 100/100 可完成，沒有不可解或難度倒置案例；S4、S5 的壓力明顯高於 S1–S3。
- Campaign 與 Sandbox 的資料保存互相隔離；Fleet Dispatch、Maintenance、Crew Recovery 與任務獎勵可保存並在重新載入後恢復。

## 策略檢視

策略平衡 v1 已完成三個調整：

1. Crew Fatigue / RST：新增跨任務出勤負荷、降低返航與 Reserve recovery，RST 改為 SOV 每三關補給節點取得 1 點。15 關輪調路線最高持續疲勞由 1% 提高為 76%，實際使用 2 RST，結束保有 6 RST。
2. Maintenance：任務 MNT 總收入由 652 降為 413；完整維修支出 438，結束 MNT 由 294 降為 55。所有 15 關仍能保持裝備可出勤，但 Fleet Maintenance 會與裝備全修競爭同一資源。
3. Boss Challenge：counter 倍率由 ×1.25 提高為 ×1.35；候選先維持 6/6 stage coverage，再最大化 counter，並在 5 分內的成功 audit variant 中依 Boss 輪替。推薦隊伍由 6 組提高為 18 組，單隊最高重複由 70 次降為 12 次，100/100 Boss 仍可完成。

平衡 gate 現在會阻止三種退化：MNT 再度出現過大盈餘、輪調路線完全不需 RST，以及 Boss 推薦重新被單一萬用隊壟斷。

## 操作體驗重整

Deployment 改為五個清楚步驟：

1. 選擇任務
2. 作業許可
3. 編組技師
4. 配置裝備
5. 確認出勤

Operation 改為三個聚焦畫面：

1. 任務情勢：風險、階段、資源與回合操作
2. 現場決策：場景、目前決策與必要摘要
3. 技師行動：選人、技能與裝備

桌機預設只開啟「現場決策」，不再同時顯示左右兩個資訊面板。手機使用固定三步驟導覽與固定回合操作列，390px 寬度可完成部署與三個 Operation 畫面切換；觸控按鈕高度至少 44px，頁面沒有水平溢位。

## 驗證結果

- TypeScript typecheck：通過
- Unit tests：21 files / 143 tests 通過
- Campaign balance：L1 6/6、L3 12/12、L5 15/15 必要任務皆可完成
- Boss Challenge：100/100 完成，0 unclearable、0 inversion
- Data validator：通過
- Production build：通過
- Gameplay、Challenge、Layout、Deployment compact、Operation compact、390px mobile flow、Sandbox、Scene、Fleet、Onboarding、Source Art smoke：全部通過

重要畫面：

- `.codex_qa/owm-layout-operation-mission-step.png`
- `.codex_qa/owm-layout-operation.png`
- `.codex_qa/owm-layout-operation-crew-step.png`
- `.codex_qa/owm-mobile-flow-mission.png`
- `.codex_qa/owm-mobile-flow-decision.png`
- `.codex_qa/owm-mobile-flow-action.png`

## 下一步

策略平衡 v1 完成後，下一個增量應進行 3–5 位玩家的桌機／手機 playtest，觀察玩家是否理解「何時輪調、何時花 RST、何時保留 MNT」，再依行為記錄調整教學訊息與門檻；在取得 playtest 資料前不把模擬值冒充人因結果。
