# Scene Visual Approval Packet

更新日期：2026-07-24

## 使用者全量核准結果

- 使用者已於 2026-07-24 明確核准全部 `119` 個 Scene 候選與全部 `90` 個 P01 production candidates。
- 共用 ledger 已記錄：Scene `119 approved / 0 pending / 0 rejected`；P01 `90 approved / 0 pending / 0 rejected`。
- 119 個 Scene 已完成 promotion，`json/sceneAssets.json` 的狀態改為 `ENGINEERING_QA_PASSED`，並同步至 `public/data`。
- Scene coverage 維持 `148/150` integrated、`2/150` shared fallback（SCN035、SCN041）；目前 `0` 個 Scene 留在 `VISUAL_REVIEW_REQUIRED`。
- P01 尚未宣告 production approved：90 張仍需最後 AI upscale 與 production manifest promotion；目前 `4096x6144` 檔案仍是 deterministic staging resize。

## 目前狀態

- Scene coverage：`148/150` integrated、`2/150` shared fallback（SCN035、SCN041）。
- 候選數量：`119`，全部已完成視覺核准與 Scene promotion。
- 119 個候選均已完成 `1915x821 RGB` runtime 尺寸檢查；本文件不會自動改寫 QA status。
- 主要總覽：[scene-pack-contact-sheet-all-v018.png](assets/source-art/qa/scene-pack-2026-07-24/scene-pack-contact-sheet-all-v018.png)。
  （`assets/source-art/` 未進版控；乾淨 clone 沒有這些檔案，需用 `pnpm scene:generate` 等指令在本機重建。）
- 完整機器清單：[scene-pack-manifest.json](assets/source-art/qa/scene-pack-2026-07-24/scene-pack-manifest.json)。

## 建議審查順序

1. 先查看總覽接觸表，標記需要放大檢查的 Scene ID。
2. 對需要放大的候選，查看 `assets/source-art/scene-backgrounds/` 與 `public/assets/environment/` 的同名檔案。
3. 只對明確通過的 ID 執行 dry-run；確認無誤後才移除 `--dry-run`。

## 核准指令範本

```powershell
# 先驗證，不會修改任何檔案
pnpm scene:approve -- --dry-run --scene-id SCN146 --scene-id SCN150

# 使用者完成視覺確認後，才正式 promotion
pnpm scene:approve -- --scene-id SCN146 --scene-id SCN150
```

## 核准規則

- 風機可見時：三片直葉片、單一中心輪轂、葉片不彎曲、不脫離、不偏心。
- 甲板、纜線、吊臂、工作艇、ROV 與安全設備必須有合理支撐與連接。
- 不接受可辨識的文字、logo、UI、浮空物件或不合理重複結構。
- 目前未核准候選數為零；若後續替換素材，仍須重新走同一套視覺核准與尺寸驗證。

## 其他 release gate

- P01 production queue：`210 Upscale Pending / 90 Production QA Pending / 0 Production Approved`；90 張已完成使用者視覺核准，但仍等待 final AI upscale 與 promotion。
- `pnpm validate:production-art` 已通過；正式 AI upscale 必須等使用者逐批核准後執行。
- P01 production QA 總表：`assets/source-art/qa/production-visual-engineering-qa-2026-07-24.md`；Batch022–030 的 production contact sheet 與 full-resolution 檔案均已隔離，尚未覆蓋 runtime preview。
- P01 production 九批總覽：`assets/source-art/qa/production-p01-2026-07-24/production-contact-sheet-all-v001.png`；對應清單：`production-contact-sheet-all-v001.json`，可先用批次總覽篩選，再檢查指定 full-resolution 檔案。
- 總覽可由 `pnpm art:production-review-sheet` 重建；它只讀取既有 per-batch contact sheets，不會改寫 active art 或 QA 狀態。
- 共用決策 ledger：`assets/source-art/qa/visual-approval-ledger-2026-07-24.json`，可由 `pnpm qa:visual-ledger` 重建；ledger 的 approved/rejected 只代表人工決策紀錄，不會自動 promotion。
- 記錄人工決策範本：`pnpm qa:record-visual -- --kind scene --id SCN146 --decision approved --note "視覺確認通過"`；P01 使用 `--kind p01 --id CHR-GOV-031`。此命令只更新 ledger，不會改寫 QA 或 runtime。
- Release-gate snapshot：`assets/source-art/qa/release-gate-audit-2026-07-24.json`；這是 read-only 數量與 gate 快照，不代表任何人工核准。
- 單頁審查 dashboard：`assets/source-art/qa/visual-approval-dashboard-2026-07-24.html`；由 `pnpm qa:visual-dashboard` 重建，可搜尋、分批查看與下載 ledger，仍不會自動 promotion。
- Promotion preflight：`pnpm qa:promotion-preflight -- --kind scene --id SCN146`（P01 改用 `--kind p01 --id <characterId>`）；只有 ledger 明確 `approved` 且尺寸／來源檢查通過才會回報 ready，仍不會修改檔案。
- 建議先審核場景候選，再逐批審核 P01 production candidates；兩者都維持明確的 pending 狀態，避免把 technical pass 誤當成視覺核准。
