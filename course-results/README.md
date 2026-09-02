# Course Results

將學生匯出的 `OWM_COURSE_RECORD_<課程代碼>_<匿名代碼>.json` 放在此目錄，再執行：

```powershell
pnpm course:summary
```

工具會產生 `COURSE_SUMMARY.md` 與 `COURSE_SUMMARY.json`：

- 重算每份匯出的 `recordDigest`（SHA-256 over canonical record），匯出後被改過的檔案標記 `MISMATCH`。
- 由六個分項重算 total／grade，並核對摘要欄位（attemptCount、componentScores、studentExplanations、decisionOrder、hintUsage）與內嵌 `record` 一致。
- 以「學生 × 週次 × 嘗試」列出結算時間、分數、四欄 Debrief 完成度、提示數、決策數、Engineering Lab 的 LOTO／Work Order 完成與違序次數。
- 依 `public/course/course-config.json`（可用 `--config <path>` 覆寫）標記超前解鎖週次的嘗試；同一匿名代碼多份匯出時以 `exportedAt` 最新者為準。

原始 JSON 與產生的 summary 已由 `.gitignore` 排除，不應提交至 repository。評分仍以四欄 Debrief 為主，機器欄位只作佐證；靜態站無法阻止有腳本能力的偽造，重要考核請搭配現場觀察或口試。
