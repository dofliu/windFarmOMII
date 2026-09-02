# OWM 下一個 Session 交接

建立日期：2026-09-02
取代：[NEXT_SESSION_HANDOFF_2026-07-27.md](NEXT_SESSION_HANDOFF_2026-07-27.md)（已過時）

## 一分鐘進入狀況

| 項目 | 現況 |
|---|---|
| 版本 | `3.57.1-course-mode-p0`（學期凍結中） |
| 課程 | `NCUT-OWM-2026` · `2026-FALL` · 目前只解鎖 `W01` |
| 主線分支 | `main` @ `488ee4a`（PR #2 已合併） |
| 線上版 | <https://dofliu.github.io/windFarmOMII/> — CI run #3 部署成功（2026-09-01） |
| 自動驗證 | `pnpm validate` 全綠；25 test files／**160 tests** |
| 本學期還能改什麼 | 只允許：手動變更 `unlockedWeekIds`、修阻斷性 bug、不影響分數的 accessibility 修正 |

**先讀這三份**：本檔 →
[`DEVELOPMENT.md`](DEVELOPMENT.md)（怎麼跑、怎麼改）→
[`ROADMAP.md`](ROADMAP.md)（接下來做什麼、優先序）。
教師端操作看 [`COURSE_MODE_GUIDE.md`](COURSE_MODE_GUIDE.md)。

## 上一個 session（2026-08-31 ~ 09-01）做了什麼

1. **完整運維系統檢視** → [`OPS_SYSTEM_REVIEW_2026-08-31.md`](OPS_SYSTEM_REVIEW_2026-08-31.md)
   （A 節 P0、B 節成績可信度、C 節穩定性與部署、D 節教學內容正確性、E 節架構固有限制、F 節未完成項目）。
2. **修完 A 節六項 P0 阻斷性問題**（已合併並上線，詳見 CHANGELOG `3.57.1-course-mode-p0 - 2026-08-31`）：
   - 每週解鎖不再清除學生 Course Record；每個 attempt 快照自己的 `configVersion`。
   - 更換匿名代碼需二次確認，並自動先匯出舊紀錄。
   - 重設課程進度改為二段式（可取消）。
   - Assessment 不再從 OBJECTIVES 分頁或 DOM 洩漏建議與正確答案。
   - Engineering Lab 只提供已解鎖週次；`startCourseAssessment` 啟動時再驗一次週次鎖。
   - `smoke:course` 改為讀部署站上的 `course-config.json` 動態斷言 —— **教師解鎖任何週次組合都不會再讓 CI 失敗、擋住部署**。
3. **3 分鐘專案介紹影片** → `promo/`（場景 HTML + 分鏡表進版控，成品 MP4 不進版控）。

## 從這裡開始：三條並行的線

主線是 **P1 成績可信度**（B 節），因為那些欄位現在正在被當成學習證據使用。
另外兩條（真人 Playtest、美術 production）維持既有狀態，沒有被這次修復改動。

詳細清單與驗收條件在 [`ROADMAP.md`](ROADMAP.md)。摘要：

1. **P1-1 移除 `HINT_USED` 反向記帳**（`src/App.tsx:1284`）——
   練習模式點 GUIDE 會把提示計入 Assessment attempt，匯出檔會自相矛盾。單點修正，最便宜。
2. **P1-2 `scores` 驗證 + record digest**（`src/domain/course.ts:423`）——
   `scores` 是 normalize 時唯一未驗證的欄位；同時加 SHA-256 摘要與教師端核對腳本。
3. **P1-3 Work Order 事件時機與 `rejectedActions`**（`src/components/CourseEngineeringLab.tsx:85`）——
   目前在第一步就記「完整六階段」，且違序次數從未寫入紀錄。
4. **P2 教學內容正確性**（D 節）——
   OPEX 把損失電費算進營運支出、產生的 ST 與模擬器時序語意不一致、KPI 零故障回 0。
5. **教師端 Course Record 彙整工具**（目前完全不存在，一班 × 15 週只能人工開檔）。

## 開始前檢查

```powershell
pnpm install --frozen-lockfile
pnpm validate                 # 25 files / 160 tests + 資料/Scene/Art gate + 平衡模擬 + build
pnpm validate:teaching-deployment   # CI 同款管線（含 build:pages）
```

瀏覽器 smoke 需要 Chromium；非 Windows 環境設 `CHROME_PATH`（腳本已支援覆寫）：

```bash
pnpm build:pages
pnpm exec vite preview --host 127.0.0.1 --port 4174 --base /windFarmOMII/ --outDir dist &
CHROME_PATH=/path/to/chrome COURSE_BASE_URL=http://127.0.0.1:4174/windFarmOMII/ pnpm smoke:course
```

## 護欄（沿用，未因這次修復放寬）

- **學期凍結**：不改平衡公式、任務條件或分數語意；要調數值請開下一個 release version，不要覆寫本學期 Course Record 的版本語意。
- **真人 Playtest 仍為 0 筆**：`playtest-results/` 是空的。不得把自動化測試、smoke 或模擬結果宣稱為「玩家已理解」。
- **P01 production art 未 promotion**：queue 仍是 `210 Upscale Pending / 90 Production QA Pending / 0 Production Approved`；`4096x6144` staging 檔是 deterministic resize，不冒充 final AI upscale。
- **成績證據**：`attemptCount`、`hintUsage`、`componentScores`、`decisionOrder` 在 P1 修完前都不可盡信，評分請以四欄 Debrief 為主（理由見 review B 節）。

## 數值來源（要引用數字時看這裡，不要憑印象）

- `balance/campaign-balance-report.md`、`balance/boss-challenge-balance-report.md`
- `GAMEPLAY_EXPERIENCE_AUDIT_2026-07-26.md`
- 內容規模直接數 `json/`：300 角色（60 職涯路線）／500 技能／200 裝備／150 場景／100 事故／15 任務
