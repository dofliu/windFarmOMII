# OWM 專案介紹影片（promo/）

3 分鐘 1080p30 介紹影片的**可重製來源**。由 `repo-intro-video` 技能產生：
每景是一支 standalone HTML 動畫，用無頭瀏覽器逐格渲成 MP4，再用 ffmpeg xfade 串接並混入配樂。

## 檔案

| 檔案 | 用途 |
|---|---|
| `scene01_open.html` … `scene21_cta.html` | 21 個場景（1920×1080，離線、無外部資源） |
| `storyboard.json` | 分鏡表：每景秒數與轉場刀法（總長 180.0s） |
| `_build_scenes.py` | 場景產生器（改共用樣式或批次改文案時用） |
| `_measure_bounds.py` | 版面安全框量測：把動畫快轉到結尾（鏡頭推近至 1.055）後檢查有無切邊 |
| `_template.html` | 技能原始模板（保留參考） |
| `work/intro/` | 渲染產物：各景 MP4 與 `check_*.png` 抽查格（已 gitignore） |

## 要改東西時

先設 `export CHROMIUM_PATH=/opt/pw-browsers/chromium`，並令
`SK=<repo-intro-video 技能目錄>`。

**改某一景的文案／版面** → 直接編輯該景 HTML，先跑版面量測（數秒，比渲染快得多，
可在渲染前先攔下切邊問題），再單景重渲 + 重新串接：

```bash
CHROMIUM_PATH=/opt/pw-browsers/chromium python3 _measure_bounds.py   # 應為 0/21 有切邊風險
```


```bash
python3 $SK/scripts/render_scenes.py storyboard.json --workdir work/intro --only scene08_kpi
python3 $SK/scripts/assemble_video.py storyboard.json --workdir work/intro --out OWM_intro_3min.mp4 --bed
```

**換背景音樂**（不用重渲場景，數秒完成）：

```bash
python3 $SK/scripts/assemble_video.py storyboard.json --workdir work/intro \
    --out OWM_intro_3min.mp4 --music your_track.mp3            # 真實音樂，-16 LUFS
python3 $SK/scripts/assemble_video.py storyboard.json --workdir work/intro \
    --out OWM_intro_3min.mp4 --music your_track.mp3 --loudness -20   # 想更像背景音
python3 $SK/scripts/assemble_video.py storyboard.json --workdir work/intro \
    --out OWM_intro_3min.mp4                                    # 無聲版，留給後製
```

**改秒數或轉場** → 編輯 `storyboard.json`（改秒數需重渲該景；只改 `transition` 可直接重新串接）。

**改章節色調** → `_build_scenes.py` 的 `TONE` 字典，然後 `python3 _build_scenes.py` 重生全部場景。

## 內容注意

影片中的數字均取自實際程式與資料（`json/`、`courseEngineering.ts` 的公式輸出、測試數）。
更動平衡數值、資料規模或測試數後，記得同步 `scene08_kpi`（KPI 推導）、
`scene19_scale`（規模）與 `scene20_quality`（測試數）三景。
