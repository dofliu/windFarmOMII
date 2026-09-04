# OWM Course Mode W09–W10 Pilot Candidate

此候選版僅供 3–5 位學生進行 W09→W10 的 Desktop／Mobile 小規模測試，不是公開課程版本，也不是學習成效證據。

## 候選範圍

- Git branch：`codex/course-w09-w10-pilot`
- Course release：`3.59.0-student-quick-start`
- Config version：`2026-FALL-PILOT-W09-W10-v1`
- 手動開放週次：`W09`、`W10`
- `frozen=true`
- 不修改 W10–W15 balance、scoring、seed、mission 或角色配置。
- 不收集姓名、學號、email、gradebook 或 continuous telemetry；學生只在完成時匯出匿名 Course Record。

## 發佈邊界

- GitHub Pages workflow 只接受 `main` push 或手動 dispatch；推送此 branch 不會更新公開站。
- 公開 `main` 應維持 `2026-FALL-manual-release-v1`、`W01`、`frozen=true`。
- 不要將本 branch 的 pilot unlock config 直接 merge 至 `main`。

## 本機執行

```powershell
pnpm install --frozen-lockfile
pnpm validate:teaching-deployment
pnpm exec vite preview --host 127.0.0.1 --port 4174 --base /windFarmOMII/
```

另開 PowerShell 後執行：

```powershell
$env:COURSE_BASE_URL='http://127.0.0.1:4174/windFarmOMII/'
pnpm smoke:course
```

離線候選包由 `pnpm package:offline` 產生，檔名會包含 release/config version；使用前必須核對 ZIP 內 `course-config.json` 的 config version 與開放週次。

## 2026-09-04 自動驗證收據

- `pnpm validate:teaching-deployment`：PASS；28 個 test files、183 tests，2/15 週手動開放，Pages build 完成。
- GitHub Pages base smoke：PASS；Desktop、Mobile、Assessment no-hints。
- 解壓後 offline-package smoke：PASS；Desktop、Mobile、Assessment no-hints。
- 候選包：`OWM_COURSE_OFFLINE_3.59.0-student-quick-start-2026-FALL-PILOT-W09-W10-v1.zip`
- SHA-256：`1A620CCAD0449A54D320DDDA059502CF7EE6752661D97E418D3B4D2733E5AB5E`
- 以上僅為 software/browser evidence，不是學生理解、吸引力或學習成效證據。

## Pilot 停止條件

- 顯示的 release/config version 不符。
- W09/W10 以外的週次可進入，或公開站設定被改動。
- Desktop／Mobile 有 P0/P1 阻斷、橫向溢位或首屏無法開始。
- Assessment 暴露 REC/GUIDE，或 Course Record 無法匯出／內容遺失。
- 任何可識別個人資料被要求或寫入。

## 回復方式

立即停止使用候選包，改回 `main`／公開 W01 版本。Pilot 結束前不合併 branch；結果先記入既有 observation workbook，再決定是否需要程式或 balance 調整。
