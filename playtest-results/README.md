# Playtest Results

將每位參與者下載的 `OWM_playtest_<代碼>_<裝置>.json` 放在此目錄，再執行：

```powershell
pnpm playtest:summary
```

工具會產生 `PLAYTEST_SUMMARY.md` 與 `PLAYTEST_SUMMARY.json`。原始 participant JSON 與產生的 summary 已由 `.gitignore` 排除，不應提交至 repository。

只有 3–5 位、Desktop／Mobile 均有覆蓋、全部 session 已完成、四個觀察欄位皆填寫且匿名代碼唯一時，summary 才會標記 `ANALYSIS READY`。事件只證明行為發生，不會自動判定玩家理解。
