# OWM 介面重新設計 — 開發交付文件

**設計來源檔：** `OWM Daylight UI.dc.html`（唯一權威來源，含雙主題 + 全 7 頁）
**版本：** Daylight 明亮教學（預設） + Deep Ops 深色（可切換）
**日期：** 2026-07

---

## 0. 設計目標（本次重做要解決的問題）

1. **一個畫面呈現** — 資訊不需上下 / 左右捲動即可看完主要內容。
2. **分頁化** — 過多資訊改用分頁（tab）切換，不再全部塞在同一畫面。
3. **字體夠大** — 內文 / 標籤 ≥ 13px，關鍵數字 18–38px（原版過小已修正）。
4. **手機自動切版** — 寬度 ≤ 1080px 自動改為單欄堆疊；格線用 `auto-fit` 自適應欄數。
5. **主要角色圖放大** — 作業畫面角色改為整塊 hero 大圖，姓名 / 數值疊在圖上。

---

## 1. 主題系統（Theme Tokens）

整套 UI 由 **一個 theme 物件** 驅動。程式端只要切換 `data-theme` 或等效變數，就能整站換膚。
兩個主題唯一的「結構差異」是圓角：`round=false`（Deep Ops，全直角）/ `round=true`（Daylight，圓角）。其餘皆為顏色 token。

### 1.1 建議的 CSS 變數（可直接貼進專案）

```css
/* ---- 預設：Daylight 明亮教學 ---- */
:root, [data-theme="daylight"] {
  --owm-round: 1;                /* 1=圓角 0=直角，見 §1.2 */
  --owm-body: radial-gradient(circle at 50% -10%, #ffffff 0, #eef3f2 55%, #e4ebe9 100%);
  --owm-surface: #ffffff;        /* 面板 / 卡片底 */
  --owm-surface-2: #f2f6f5;      /* 次要底（格子、輸入框、狀態列） */
  --owm-border: #dde5e3;
  --owm-shadow: 0 10px 30px rgba(30,55,50,.08);
  --owm-text: #2a3a37;           /* 內文 */
  --owm-muted: #6c7d79;          /* 次要文字 / 標籤 */
  --owm-bright: #12211d;         /* 標題 / 強調文字 */
  --owm-accent: #0f766e;         /* 主色（青綠） */
  --owm-gold: #b7791f;           /* 分數 / 獎勵 / 貨幣 */
  --owm-danger: #c0432c;         /* 高風險 / S4 */
  --owm-purple: #6d5ac0;         /* 熟練度 / RST */
  --owm-on-accent: #ffffff;      /* 主色上的文字 */
  --owm-mark-color: #ffffff;     /* OWM logo 字色 */
  --owm-track: #e4ebe9;          /* 進度條軌道 */
  --owm-meter-blue: #2f8fb0;     /* 天候窗口條 */
  --owm-badge-bg: rgba(255,255,255,.9);  /* 疊在圖片上的徽章底 */
  --owm-control-bg: #ffffff;     /* 頂部控制列 */
  --owm-control-text: #2a3a37;
  --owm-control-border: #dde5e3;
  --owm-font: 'Inter','Noto Sans TC',system-ui,sans-serif;
  --owm-mono: ui-monospace,'SFMono-Regular',monospace;
}

/* ---- Deep Ops 深色（切換用） ---- */
[data-theme="deepops"] {
  --owm-round: 0;
  --owm-body: radial-gradient(circle at 55% 0%, #123745 0, #071820 46%, #041017 100%);
  --owm-surface: linear-gradient(145deg, rgba(13,40,51,.92), rgba(6,24,33,.94));
  --owm-surface-2: rgba(4,17,24,.55);
  --owm-border: rgba(141,184,196,.22);
  --owm-shadow: 0 15px 50px rgba(0,0,0,.22);
  --owm-text: #e8f5f6;
  --owm-muted: #88aab3;
  --owm-bright: #f0fbfc;
  --owm-accent: #42dbc8;
  --owm-gold: #f2c66f;
  --owm-danger: #f1745b;
  --owm-purple: #b99df1;
  --owm-on-accent: #052029;
  --owm-mark-color: #06141c;
  --owm-track: rgba(141,184,196,.2);
  --owm-meter-blue: #62a8db;
  --owm-badge-bg: rgba(4,16,22,.6);
  --owm-control-bg: #04140b;
  --owm-control-text: #eaf6f4;
  --owm-control-border: rgba(255,255,255,.12);
  --owm-font: 'Inter','Noto Sans TC',system-ui,sans-serif;
  --owm-mono: 'Consolas','SFMono-Regular',monospace;
}
```

### 1.2 圓角規則

半徑不是固定值，而是「主題開關」。定義一個 helper，Deep Ops 一律回傳 `0`：

```
radius(v)  =  round ? v : 0
```

各元件用到的基準值（Daylight 值 / Deep Ops 皆 0）：

- 面板 / 卡片：`14px`
- 內部格線、meter 軌道容器、輸入框：`10px`
- 按鈕、分頁、徽章：`8–9px`
- 小標籤 / chip：`6px`
- 進度條填充：`999px`（膠囊）

> 半透明色階一律用 `color-mix(in srgb, <token> N%, <tintBase>)`。
> tintBase：Daylight = `#ffffff`，Deep Ops = `#0a2129`（避免深色主題被洗白）。

---

## 2. 字級 / 排版規範

| 用途 | 大小 | 字重 | 字體 |
|---|---|---|---|
| 頁面主標題 H2 | 24px（手機 20） | 700 | sans |
| 面板標題 / 角色名 | 18–20px | 700–900 | sans |
| 內文 / 描述 | 14px, line-height 1.55 | 400–600 | sans |
| 標籤 / 次要文字 | 12–13px | 600–800 | sans |
| Eyebrow 小標 | 11px, letter-spacing .12em | 800 | sans |
| 關鍵數字（AP/分數/計數） | 18–38px | 700 | **mono** |
| 資料列數字（data strip） | 16px | 700 | **mono** |

- 所有「數值」一律用等寬字（`--owm-mono`），語意上與敘述文字區隔。
- 最小可讀下限：內文不小於 13px；觸控目標 ≥ 44px（按鈕 min-height 48px、分頁 36px）。

---

## 3. 版面結構（三層）

```
shell (100dvh, flex column, 背景 = --owm-body)
├── controlBar   ← 產品層級的「主題切換 + 頁面切換」（見備註）
└── stage (flex:1, padding 16/24px)
    ├── topbar   ← 品牌 + 模式導覽 + 資料列（所有頁共用，固定不捲動）
    └── pageArea ← flex:1, overflow-y:auto  ← 唯一允許捲動的區域
        └── <目前頁面內容>
```

**備註 — controlBar 的定位：** 這是「設計檢視器」用來切換主題 / 頁面的外殼。
正式整合時：

- **主題切換**（Daylight / Deep Ops）→ 建議保留為使用者設定（存 localStorage）。
- **頁面切換** → 對應遊戲既有的路由 / view state，不是新的 UI，直接沿用現有導覽。

**topbar 三段：**

1. 品牌區：`OWM` 方標（accent 底）+ eyebrow + 標題，過長以 ellipsis 截斷。
2. 模式導覽：戰役 / Boss 挑戰 / 沙盒 / 收藏 / 知識庫；當前頁對應的模式高亮。橫向可捲動（`overflow-x:auto; overflow-y:hidden`）。
3. 資料列（右）：角色 / 技能 / Boss / XP / MNT / RST 六格數字。

---

## 4. 響應式規則

- **單一斷點：`max-width: 1080px`** → `isMobile`。觸發時：topbar 換行、模式導覽與資料列改為整寬可橫捲、面板 padding 縮小、格線最小欄寬縮小。
- **內容格線一律用 `repeat(auto-fit, minmax(Npx, 1fr))`**，欄數隨寬度連續自適應，不依賴 JS 斷點（避免中間寬度出現破版）。各頁最小欄寬：
  - 作業畫面面板 290px｜艦隊卡 130px｜收藏卡 210px｜知識庫卡 300px｜Boss 卡 230px｜結算獎勵 210px / 分數 110px｜沙盒滑桿 240px / 場景 200px
- **成對 overflow 一定要寫齊**（`overflow-x` + `overflow-y`），避免瀏覽器自動補出多餘捲軸。

---

## 5. 頁面清單與內容

| 分頁 | key | 對應模式 | 主要區塊 |
|---|---|---|---|
| 作業畫面 | operation | 戰役 | 3 欄：任務控制（階段/需求/meter/結束回合）、現場即時影像（hero + log）、角色 hero 大圖 + AP/E/INT + 推薦技能 |
| 出勤航線 | deployment | 戰役 | 艦隊狀態格 + 任務簡報卡 + 作業許可（PTW/PPE…）+ DEPLOY |
| 任務結算 | debrief | 戰役 | 評級 A/86 + 獎勵卡（XP/MNT/RST/Fleet）+ 六項分數 + 續行按鈕 |
| 收藏 | collection | 收藏 | 角色卡格（大圖 + 陣營徽章 + 熟練度條） |
| 知識庫 | codex | 知識庫 | 知識條目卡（已解鎖含安全邊界 / 未解鎖降透明度） |
| Boss 挑戰 | boss | Boss 挑戰 | 統計摘要 4 格 + Boss 卡格（嚴重度色條 + 最佳分） |
| 沙盒 | sandbox | 沙盒 | 情境滑桿 5 項 + 場景素材覆蓋率格 |

---

## 6. 元件樣式規格（重點）

**面板 panel**：`background:--owm-surface; border:1px --owm-border; radius(14); box-shadow:--owm-shadow; padding:16px(手機14); flex column`。

**主按鈕 primaryBtn**：`min-height:48px; bg:--owm-accent; color:--owm-on-accent; weight:900; 15px; radius(10)`。
**次按鈕 ghostBtn**：`border:--owm-border; bg:--owm-surface-2; color:--owm-text`。

**分頁 tab（頁面 / 模式）**：active = 邊框 accent + 底 `mix(accent 10–12% surface)` + 字色 accent/bright；inactive = 邊框 border + 底 surface-2 + 字 muted。

**meter 進度條**：軌道 `--owm-track` 高 8px radius(999)；填充天候=`--owm-meter-blue`、證據/熟練度=`--owm-purple`、一般=accent。

**狀態色（艦隊 / Boss 嚴重度）**：

- Reliability ≥85 或 S1 → accent；≥70 或 S2 → gold；S3 → 橘（Daylight `#d97828` / DeepOps `#f5995f`）；<70 或 S4 → danger。
- 卡片左側 4px 色條標示狀態。

**角色 hero（作業畫面 / 收藏）**：

- 大圖 `object-fit:cover; object-position:center 14%`。
- 作業畫面：底部漸層遮罩 `linear-gradient(to top, rgba(9,26,24,.92), transparent 55%)`，姓名 / 職種 / 陣營疊在圖上（白字，遮罩兩主題共用）。
- **收藏卡的圖用 `background-image` 的 div，不要用 `<img src>` 綁動態值**（見 §8 注意事項）。

**疊在圖片上的元素**（徽章、hero 標籤）用固定深色底（`--owm-badge-bg` / `rgba(9,30,27,.72)`），兩主題皆維持白字可讀，不隨主題變。

---

## 7. 素材（Assets）

作業畫面 / 收藏用到的真實遊戲原畫（來自 `OWM_Project_Package_v1.0`）：

| 檔案 | 用途 |
|---|---|
| `assets/offshore-field-feed_scn003_rain_v001.png` | 作業畫面・現場即時影像（SCN003 雨天） |
| `assets/CHR-MAR-196_L1_P01_v002.png` | 潮風見習・ROV操作員（L1） |
| `assets/CHR-MAR-197_L2_P01_v001.png` | 浪脈執行者・ROV操作員（L2） |
| `assets/CHR-MAR-198_L3_P01_v001.png` | 風域專家・ROV操作員（L3） |
| `assets/CHR-MAR-199_L4_P01_v001.png` | 海疆導師・ROV操作員（L4） |
| `assets/CHR-MAR-200_L5_P01_v001.png` | 天穹大師・ROV操作員（L5） |
| `assets/CHR-OMI-241_L1_P01_v001.png` | 潮風見習・高壓電工程師（L1） |

整合時請改指向專案既有的 `portraitFile` / 場景資產路徑；上表僅為設計稿對應。

---

## 8. 整合注意事項（實作陷阱）

1. **動態圖片路徑**：清單迴圈中的縮圖請用 `style="background-image:url(...)"` 的 `div`，**不要**用 `<img src={動態值}>`。原因：串流 / 首次渲染時未綁定的值會讓瀏覽器抓取字面字串而報 404。（框架若有值即渲染則無此問題，但 background-image 較保險。）
2. **成對 overflow**：任何 `overflow-x:auto` 一律補 `overflow-y:hidden`（反之亦然），否則跨瀏覽器會多出幽靈捲軸。
3. **格線用 auto-fit**，勿硬寫欄數綁 JS 斷點——中間寬度會破版（本次已修正過的雷）。
4. **數字用等寬字**、敘述用一般字，維持資訊層級。
5. **主題只差顏色 + 圓角**：實作成 CSS 變數 + 一個 `--owm-round` 判斷即可，勿為兩主題複製兩套版面。
6. 一個畫面看完：`pageArea` 是唯一捲動區；設計目標是主要內容在 1280×800 以上不需捲動。

---

## 9. 檔案

- **權威設計稿：** `OWM Daylight UI.dc.html`（雙主題 + 7 頁，可直接開瀏覽器互動）
- 早期單頁詳版（Deep Ops，供細節參考）：`OWM Operation Screen Redesign.dc.html` 等 7 檔
- 風格比較器（三方案挑選紀錄）：`OWM Style Explorer.dc.html`
