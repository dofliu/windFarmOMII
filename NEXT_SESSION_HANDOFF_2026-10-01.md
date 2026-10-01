# OWM 下一次工作交接 — 2026-10-01

> 取代 [NEXT_SESSION_HANDOFF_2026-09-30.md](NEXT_SESSION_HANDOFF_2026-09-30.md)。

## 目前權威狀態

- Version:`3.62.0-course-content-integrity`(未變);`frozen=true`、W01-only、schema v2 未變。
- 專案為「關卡模式」定位,不綁學期。

## 2026-10-01 增量:關卡模式轉換 階段 0(設計草案)

- 新增 `LEVEL_MODE_DESIGN_2026-10-01.md`:盤點 `frozen`/`term`/validator 的學期遺留語意,提議 `frozen` 改為「內容/計分已鎖版」、validator 對 `frozen:false` 與空解鎖僅警告、新增 `configVersion` 檢查,並列出 3 個待擁有者拍板問題。
- 查證:`unlockedWeekIds` 本來就可任意子集,教師自由開關關卡今天就能做到。
- 僅文件變更,無程式、分數、存檔、平衡或版本變動。

## 下一個建議增量

1. 擁有者回覆設計草案 §5 的問題後,實作階段 1(validator + 測試 + guide)。若無回覆,可依草案建議預設(保留欄位改語意、`frozen:false` 僅警告)直接進階段 1。
2. D4 設計草案(資料包由 randomSeed 派生;會改 KPI 答案,需 bump 版本)。
3. actions SHA pinning(需可連 api.github.com)。

## 仍待擁有者處理

- 真人 pilot／playtest(真人資料仍 0 筆)、P01 final AI upscale、課務決策。
