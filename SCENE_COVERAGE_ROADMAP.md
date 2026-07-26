# Scene Coverage Roadmap

## 2026-07-24 snapshot

以 `json/scenes.json` 與 `json/sceneAssets.json` 為唯一來源，目前 150 個 Sandbox／Operation Scene 的狀態如下：

| 狀態 | 數量 | 說明 |
| --- | ---: | --- |
| Integrated route | 148 | 有專屬路由資料，可由 Sandbox Scene selector 選取 |
| Dedicated runtime file | 146 | 符合 `1915x821 RGB`；其中 SCN002／SCN003 共用既有 fallback 檔案 |
| Shared fallback | 2 | 明確顯示 fallback provenance，不冒充專屬背景 |
| Visual review required | 119 | 新增候選，等待人工核准；集中總覽見 `assets/source-art/qa/scene-pack-2026-07-24/scene-pack-contact-sheet-all-v018.png` |

## 下一批優先順序

### P1：完成後續視覺核准與 production promotion

- `SCN146-SCN150` 已全部具備顯式路由；下一步不再生成新的 Scene ID，改為依接觸表執行人工視覺核准。
- 原因：150 個 Scene 現在都有專屬路由或明確 shared fallback，剩餘風險是視覺核准、production upscale 與 approved promotion，而非覆蓋率不足。

### P2：補足控制／海纜任務環境

- `SCN071-SCN075`：海纜登陸站五時段。
- `SCN076-SCN080`：SCADA 控制室五時段。
- 原因：直接支援海纜與監控任務，能讓 Operation 的任務類型不再集中於海上甲板與塔架內部。

### P3：補足高風險與訓練環境

- `SCN087-SCN100`：高壓開關室、備品倉庫、GWO 訓練中心。
- `SCN101-SCN115`：ROV 巡檢、商業潛水、離岸打樁。
- 原因：這些場景應使用獨立的室內／水下／施工構圖，不能用海上風場 fallback 取代。

### P4：補足特殊天候與事件環境

- `SCN116-SCN150`：海纜敷設、氣象站、颱風前夕、雷雨緊急、海霧、航空障礙燈、日出交班。
- 原因：先完成 P1-P3 後，再按任務使用率與天候差異分批生成；每批仍維持 `VISUAL_REVIEW_REQUIRED`，不直接升級為 engineering approved。

## 不變的核准規則

1. 新圖先生成至 workspace，完成接觸表與尺寸驗證後才加入 `json/sceneAssets.json`。
2. 專用檔案必須是 `1915x821 RGB`；共用 fallback 維持既有 `1672x941` 例外。
3. 風機可見時必須是三片直葉片、中心輪轂；禁止四片、彎曲、重複、脫離或偏心葉片。
4. 未經人工視覺確認，不執行 `pnpm scene:approve`，也不改寫 `ENGINEERING_QA_PASSED`。
