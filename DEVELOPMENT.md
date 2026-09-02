# OWM 開發與操作說明

Offshore Wind Masters（OWM）的開發、驗證與部署操作手冊。
教師端的課程操作（解鎖週次、Assessment 政策、學習紀錄）另見 [`COURSE_MODE_GUIDE.md`](COURSE_MODE_GUIDE.md)。

## 環境需求

| 項目 | 版本 | 備註 |
|---|---|---|
| Node.js | 22 | CI 使用 22 |
| pnpm | 11.7.0 | `packageManager` 已鎖定 |
| Python | 3.11+ | 資料／場景驗證與素材工具 |
| Chromium／Chrome | 任一 | 只有瀏覽器 smoke 需要 |

```bash
pnpm install --frozen-lockfile
```

## 最常用的六個指令

```bash
pnpm dev          # 開發伺服器（會先 sync:data 與 sync:art）
pnpm test         # vitest：25 test files / 160 tests
pnpm typecheck    # tsc --noEmit
pnpm validate     # 完整驗證：資料/Scene/Art gate + 測試 + 平衡模擬 + build
pnpm build:pages  # GitHub Pages 版（base = /windFarmOMII/）+ 課程素材包
pnpm build:offline # 離線版（base = ./）
```

`pnpm validate:teaching-deployment` 是 CI 跑的那一條，等於
`simulate:challenge → sync:data → validate_owm_data --course-deployment → validate:course → test → simulate:balance → build:pages`。
推 `main` 前跑這個最保險。

## 專案結構

```
src/
├─ App.tsx                  # 主畫面與流程（Campaign / Course / Challenge / Sandbox）
├─ components/              # OffshoreScene(Phaser)、CourseModePanel、CourseEngineeringLab、
│                           # OnboardingGuide、PlaytestPanel
└─ domain/                  # 純邏輯，無 DOM 依賴 —— 測試都打在這一層
   ├─ course.ts             # 課程紀錄 schema、attempt、匯出
   ├─ courseEngineering.ts  # SCADA 資料包、可靠度 KPI、LOTO/Work Order、Alarm tester
   ├─ runtime.ts            # 任務模擬核心（無隨機性）
   ├─ campaign.ts           # 戰役進度、存檔遷移、獎勵結算
   ├─ windFarm.ts           # 風機可用率／可靠度／故障積壓
   └─ bossChallenge*.ts     # 事故演練與推薦隊伍
json/                       # 資料來源（真實來源，會 sync 到 public/data）
public/course/course-config.json   # 教師發布設定（週次解鎖）
tools/                      # 驗證、smoke、素材與模擬腳本
promo/                      # 專案介紹影片場景與分鏡（見 promo/README.md）
```

**資料流**：`json/` →（`pnpm sync:data`）→ `public/data/` → 執行時 fetch。
`public/data/` 已 gitignore，所以**乾淨 clone 後要先 `pnpm sync:data`**，否則
`pnpm validate:course` 會出現 `ENOENT: public/data/missions.json`。

## 常見工作流程

### 改課程週次發布（教師操作）

```powershell
pnpm course:unlock -- --weeks W01,W02 --version 2026-FALL-W02
pnpm validate:course
```

推 `main` 後 GitHub Actions 會自動驗證並重新部署。
`smoke:course` 以部署站上的 `course-config.json` 做動態斷言，任何週次組合（含 `NONE` 全部暫停）都不會讓 CI 失敗。
解鎖改變 `configVersion` **不會**清除學生瀏覽器內的 Course Record。

### 改 domain 邏輯

測試都在 `src/domain/*.test.ts`，環境是 node、不需瀏覽器：

```bash
pnpm test                                   # 全部
pnpm exec vitest run src/domain/course      # 單一檔案
```

改動任何影響分數、任務條件或存檔語意的東西之前，先確認學期凍結政策（見交接文件護欄）。

### 跑瀏覽器 smoke

smoke 腳本需要 Chromium。全部腳本都支援 `CHROME_PATH` 覆寫：

```bash
pnpm build && pnpm exec vite preview --host 127.0.0.1 --port 4173 &
CHROME_PATH=/usr/bin/chromium pnpm smoke:gameplay
```

課程模式的 smoke 走 Pages base path，要用另一組參數：

```bash
pnpm build:pages
pnpm exec vite preview --host 127.0.0.1 --port 4174 --base /windFarmOMII/ --outDir dist &
CHROME_PATH=/usr/bin/chromium COURSE_BASE_URL=http://127.0.0.1:4174/windFarmOMII/ pnpm smoke:course
```

可用的 smoke：`gameplay`、`challenge`、`layout`、`deployment:compact`、`operation:compact`、
`mobile:flow`、`playtest`、`course`、`sandbox`、`scene`、`fleet`、`onboarding`、`art`、
`visual-ledger`、`release-audit`、`visual-dashboard`。

> 註：`smoke:gameplay`、`smoke:layout`、`smoke:operation:compact` 的斷言綁定**完整本機素材庫**
> （寫死 PNG 檔名與 `ENGINEERING_QA_PASSED` 狀態）。只有精簡課程素材包時它們會失敗，
> 這是既有的環境相依，不是程式退化。

### 產生／更新介紹影片

見 [`promo/README.md`](promo/README.md)。改單景文案只要編輯該景 HTML 再單景重渲，不必重做整支；
換配樂只需重跑 assemble 一步。

## 部署

`.github/workflows/deploy-course-pages.yml` 在 push `main` 時觸發：

1. `pnpm validate:teaching-deployment`（驗證不過就不部署）
2. Desktop／Mobile Course Mode smoke
3. 上傳 Pages artifact → 部署
4. 另外打包離線 ZIP 為 workflow artifact

離線包本機產生：`pnpm package:offline`（Windows PowerShell），輸出
`OWM_COURSE_OFFLINE_3.57.1.zip`，解壓後執行 `START_OFFLINE.bat`。

## 疑難排解

| 症狀 | 原因與處理 |
|---|---|
| `ENOENT: public/data/missions.json` | 乾淨 clone 未同步資料 → 先 `pnpm sync:data` |
| smoke 報 `Chrome executable not found` | 設 `CHROME_PATH` 指向瀏覽器執行檔 |
| smoke 報 source-art／scene metadata mismatch | 本機只有精簡課程素材包（見上方註記），非程式問題 |
| `git status` 每次 build 後都髒 | `sync:art` 會把 `generatedAt` 寫進被追蹤的 `public/assets/source-art/p01/index.json` |
| Pages 版資源 404 | 確認用 `build:pages`（base `/windFarmOMII/`），不是 `build` |

## 版控慣例

- `json/` 是資料真實來源；`public/data/` 是產物，不要手改。
- 圖片、渲染產物、離線包、playtest 原始 JSON 都在 `.gitignore` 內。
- 課程部署素材包（`course-deployment-assets/`）是刻意追蹤的精簡集合。
- 影片場景 HTML 與 `storyboard.json` 進版控，MP4 與影格不進。
