# OWM 課程運維系統檢視報告

檢視日期:2026-08-31
檢視對象:`main` @ `37fb419`(版本 `3.57.1-course-mode-p0`,課程 `NCUT-OWM-2026`,學期 `2026-FALL`,目前僅 `W01` 解鎖)
檢視目的:以「與課程連結的運維教學系統」角度,確認上線前需要注意的事項、未完成的功能與 bug。

> **修復狀態(2026-08-31 更新)**:A 節六項 P0 已全部修復並驗證(見 CHANGELOG `3.57.1-course-mode-p0 - 2026-08-31` 條目與 `task_progress.md` 同日 increment);B/C/D/E/F 節維持待辦。A 節以下內容保留為當時的檢視紀錄。
>
> **修復狀態(2026-09-02 更新)**:依 H 節順序完成第 5–8 步與第 10 步的教師端工具:**B1**(移除非 assessment 的 `HINT_USED` 寫入)、**B2**(scores 驗證與重算、`recordDigest`、教師核對腳本 `pnpm course:summary`)、**B4**(Work Order 改 `closed` 觸發並記錄 `rejectedActions`)、**B8**(匯出摘要加 `weekId`/`assignmentId` 與 `unlockedWeekIdsAtExport`)、**C1**(course-config soft-fail)、**C2**(所有 `localStorage` 寫入包 try/catch、audio constructor 防禦、重複 theme effect 合併)、**C3**(sync-data 白名單)、**F**「教師端 Course Record 彙整/核對工具」。仍待辦:B3/B5/B6/B7、C4/C5/C6、D 節、F 其餘項目。見 CHANGELOG `3.57.1-course-mode-p0 - 2026-09-02`。
>
> **修復狀態(2026-09-04 更新)**:已將 Course Record v2 integrity gate 與 2026-09-02 P1 修正整合為 `3.58.0-course-record-integrity`。**B3** 改為所有 attempts 均須結算、score 合法且四欄 Debrief 完整才可匯出；**B5** 的 system-derived events 保留 audit provenance，但不再進入正式 `decisionOrder`；**B7** 的新 Assessment 入口強制 `OWM-XXXX-XXXX`。B6、C4/C5/C6、D 節與正式 server-side receipt 仍未完成。

---

## 0. 總體結論

系統整體成熟度高:自動驗證管線完備且全綠(見附錄 G)、Course Mode 的隔離設計正確(固定隊伍/裝備/船舶、疲勞歸零、艦隊快照重建、mastery 固定 L5、任務模擬無任何 `Math.random`,Assessment 結果確實可跨學生重現)、CI 會在部署前跑完整驗證與瀏覽器 smoke、匿名代碼設計符合去識別化要求。

但存在 **6 個開學前必須處理的問題(P0)**:其中 2 個直接破壞 Assessment 效度(答案/建議在 UI 與 DOM 洩漏)、1 個會在教師第一次解鎖 W02 時**卡死整條部署管線**、1 個會在每週解鎖時**靜默清除所有學生的本機紀錄**。以 2026-09 開學時程,A1 與 A2 會在第二週準時發生。

---

## A. 開學前必修(P0)

### A1. 每週解鎖流程會靜默清除學生的全部課程紀錄
- `tools/set-course-unlocks.mjs:38` 每次解鎖都會改寫 `configVersion`;`COURSE_MODE_GUIDE.md` 教的每週指令正是 `--version 2026-FALL-W02` 這種逐週遞增版本。
- `src/App.tsx:725-732`:`startCourseAssessment` 只要 `configVersion` 不同(或 learner code 打錯字),就直接 `createCourseRecord` 蓋掉 localStorage 既有紀錄——沒有警告、沒有確認、沒有備份。
- 後果:學生做完 W01,教師解鎖 W02 後,學生按下「開始 Assessment」的那一刻,W01 的 attempts、分數、四欄 Debrief 全部消失。
- 建議修法(擇一):unlock-only 變更不 bump `configVersion`;或 configVersion 改記錄在 attempt 層;或版本不符時強制「先匯出再確認」的攔截對話框。

### A2. 教師解鎖 W02 會讓 CI smoke 失敗、阻斷 GitHub Pages 部署
- `tools/smoke-course-mode.mjs:44-52` 硬編碼斷言 `'1/15 已開放'`、`W01=true`、`W02=false`;`deploy-course-pages.yml` 的 `deploy` job `needs: build`,smoke 失敗 → 新設定永遠上不了線。
- `tools/validate-course-config.mjs:52-54` 卻明確允許任意週次組合,兩道 gate 互相矛盾。暫停全部(`--weeks NONE`)也會炸掉 W01 斷言。
- 建議修法:smoke 從 `public/course/course-config.json` 讀出預期的解鎖數/週次再斷言(順帶移除硬編碼中文字串與 `3.57.1-course-mode-p0` 版本字串)。

### A3. Assessment 洩題(一):OBJECTIVES 分頁明文顯示推薦技能與回合預測
- `src/App.tsx:1188-1210` 計算 `recommendedSkill`/`selectedSkillForecast` 沒有 `assessmentMode` 守門;`:1333-1360` 組出 `SKILL FORECAST`(技能名稱+威力+疲勞/能量代價)與 `END ROUND FORECAST`(失敗原因、尚未觸發的分支事件代碼);`:1846-1854` 無條件渲染。
- 學生不需要 DevTools——點 OBJECTIVES 分頁就看得到,而點該分頁還會被記成 `EVIDENCE_VIEWED`(`:1317-1323`),等於「看提示」被記錄成「查證據」。這直接違反 `:1262-1265` 自己顯示的政策文案與 `COURSE_MODE_GUIDE.md` 的承諾。
- CI 抓不到:smoke 只檢查 `operation-decision-prompt` 的 innerText 與幾個 testid 是否存在,從未檢查 objectives 面板內容。

### A4. Assessment 洩題(二):正確診斷選項標記在 DOM 上
- `src/App.tsx:5400`:`data-testid={option.correct ? 'diagnosis-choice-correct' : ...}` 無條件輸出;右鍵檢查即得答案。一行修正(改用 `option.id`,正確性只在 `showRecommendation` 時以另一屬性暴露)。
- 同類:`:1775-1776` 的 `data-decision-guide-target`/`data-decision-guide-label` 在 assessment 下仍輸出 `diagnosis-rec-cta`/`SKILL REC` 等指引屬性。
- 附帶說明:`public/data/missions.json` 本身就含 `diagnosisOptions[].correct`(靜態站架構固有,見 E 節),但 A4 把「要會抓 JSON」降低成「右鍵檢查」,仍應修。

### A5. Engineering Lab 與週卡完全無視週次鎖
- `src/components/CourseModePanel.tsx:187` 把 `config.assignments`(全部 15 週)傳給 `CourseEngineeringLab`,而非 `availableAssignments`;學生第一天就能在下拉選單看 W15 的 SCADA/CMS 資料包、fault family 與五個 KPI 答案。從 Lab 觸發的 `LOTO_VERIFIED`/`WORK_ORDER_CREATED` 還會把**鎖定週**的 assignmentId 寫進課程紀錄。
- `:143-167` 鎖定週卡片也完整顯示任務、三人隊伍職業、裝備、備品、船舶與 SEED。
- 另外 `startCourseAssessment`(`App.tsx:724`)不re-check `unlockedWeekIds`,DevTools 移除 disabled 即可開跑鎖定週(見 E 節,但 handler 補一行檢查是便宜的)。

### A6. 一鍵重設與換代碼都會無確認地銷毀紀錄
- `CourseModePanel.tsx:224` 的「一鍵重設課程進度」直接 `localStorage.removeItem`,沒有 confirm、沒有「先匯出」提示,而且就放在匯出鈕旁邊。誤觸一次,整學期證據消失。
- 加上 A1 的換代碼/換版本靜默覆蓋,共機教室情境(下一位同學輸入自己的代碼)預設就會清掉上一位的未匯出紀錄。
- 建議:重設與「偵測到不同代碼/版本」都走二段式確認 + 強制先觸發匯出(專案在 End Round 已有現成的二段式確認模式可複用)。

---

## B. 成績證據可信度(P1)

教師實際會拿 `OWM_COURSE_RECORD` JSON 評分,以下問題決定哪些欄位可信:

1. **HINT_USED 反向記帳污染 Assessment 紀錄**:`App.tsx:1284-1290` 在「非 assessment」session(戰役/演練/練習)點 GUIDE 時寫入課程紀錄,而 `appendCourseEvent`(`course.ts:301-311`)會把它歸到**最後一次 assessment attempt** 頭上——`hintUsedCount` 增加、`decisionOrder` 混入假決策,匯出時與 `assessmentPolicy: 'REC_AND_GUIDE_DISABLED'` 自相矛盾。`EVIDENCE_VIEWED`/`DIAGNOSIS_SELECTED` 都是 `if (assessmentMode)` 正向守門,只有這一處反向。建議直接移除此寫入。
2. **scores 是 normalize 時唯一不驗證的欄位**:`course.ts:423` 原樣通過;學生在 DevTools 改 `{total:100, grade:'S'}` 後重新整理、匯出都有效。建議 normalize 時驗證範圍/等第枚舉、由六個分項重算 total,並在匯出加 `recordDigest`(SHA-256 over canonical record)+ 提供教師端五行核對腳本;摘要欄位與內嵌 `record` 目前也沒有一致性檢查,偽造者甚至不用改到一致。
3. **Debrief 匯出閘門只看「最新」attempt**:`App.tsx:757-758` 只在最新 attempt 已結算且四欄未填時才擋;結算後再開新的一次嘗試(或另一週),舊 attempt 的空白 Debrief 就放行了。`CourseModePanel.tsx:44` 用 `attempts.at(-1)`、domain 用 `activeAssignmentId` 反查,兩套 active-attempt 定義並存,目前恰好一致但脆弱。
4. **Work Order 事件是假證據**:`CourseEngineeringLab.tsx:85-87` 在第一步 TRIGGER 就觸發,`CourseModePanel.tsx:194-199` 卻寫入硬編碼的完整六階段 lifecycle;`workOrder.closed` 從未被檢查。且兩個程序練習唯一的量測值 `rejectedActions`(違序次數)**從未寫入紀錄**——亂按十次跟一次做對,匯出檔完全相同。建議:改在 `closed` 時觸發、記錄實際 `completedSteps` 與 `rejectedActions`。
5. **decisionOrder 大半是系統自動事件**:`JSA_COMPLETED` 在開始時自動蓋章(`course.ts:280-283`,`fixedPreflight: true`)、Assessment 內的 `LOTO_VERIFIED` 是「通過 Isolate 階段」的代理指標(`App.tsx:575-590`)、`WORK_ORDER_CREATED` 在結算時自動附加(`:560-564`)。面板上的 DECISIONS 數字不是能力量測,評分準則需明確排除。
6. **attemptCount 不可作為評分依據**:一鍵重設/清 site data/換瀏覽器都會歸零且不留 `MISSION_REPLAYED` 痕跡。若重試次數要納入評分,唯一可行設計是「每次重玩前強制匯出、教師保留序列」。
7. **learner code 無格式驗證**:`CourseModePanel.tsx:172` 只要非空即可開始;打 `A`、打同學代碼、打真實姓名(`JOHNSMITH`)都收。建議 runtime 強制 `OWM-XXXX-XXXX` 格式(產生器與 smoke 已假設此格式)。
8. **匯出摘要缺 weekId/assignmentId**:`course.ts:479-497` 只以 missionId+attemptNumber 為鍵,教師要對照 config 手動映射週次;也未快照當時的 `unlockedWeekIds`,無法在評分時發現「超前進度」的嘗試。

**目前可信的欄位**:四欄 `studentExplanations`(這本來就是主要評分物)、`configVersion`/`releaseVersion`;**不可盡信**:`attemptCount`、`hintUsage`、`componentScores`、`decisionOrder`、Lab 來源的 LOTO/WO 事件。

---

## C. 穩定性與部署(P1)

1. **course-config 壞掉會拖垮整個 app**:`App.tsx:453` 把 `loadCourseConfig` 串在主載入鏈,throw 後 `:622-625` 的死路錯誤頁(硬編碼中文、無重試、無「略過課程模式」)連戰役/演練都進不去。資料更新若移除 config 引用的角色 ID,normalize 回 null 一樣全站死。`data.ts:37-45` 的 Shinkai index soft-fail 是現成的正確模式,建議比照:課程模式載入失敗時降級隱藏課程分頁即可。
2. **所有 `localStorage.setItem` 都沒有 try/catch**(`course.ts:464`、`campaign.ts:577`、`onboarding.ts:81`、`playtest.ts:205`、`bossChallenge.ts:249`、`App.tsx:412,426,441`、`audio.ts:38`):讀取端全都包了,寫入端全裸,QuotaExceeded 或封鎖儲存時會變成 render crash——而且 `saveCourseRecord` 是在 setState updater 裡呼叫的。更嚴重的是 `audio.ts:14` 在 module-scope constructor 直接 `localStorage.getItem`(`:300` 即時實例化、被 App 靜態 import):在封鎖第三方儲存的環境(例如把遊戲**嵌入 Moodle/Canvas iframe**、Safari 全面封鎖 Cookie)會在 React mount 前就 throw → 白屏。若有 LMS 內嵌計畫,這是第一個會炸的點。
3. **部署包一半是永遠不會被讀取的檔案**:`sync-data.mjs:12` 全量複製 `json/`,但 `data.ts:48-62` 只 fetch 14 個檔;`prompts.json` **4.98 MB**(全部 AI 繪圖 prompt,也不宜對學生公開)與 `character_skills.json` 162 KB 白佔 10.0 MiB 部署包的一半。首載也因 `Promise.all` 順帶變慢。改成白名單三行解決。
4. **換角色會整個銷毀重建 Phaser WebGL**:`OffshoreScene.tsx:297-307` 的建游戲 effect 依賴 `accent`(陣營色,只畫一個 5×56px 色條),點不同陣營隊員就 `game.destroy(true)` + `new Phaser.Game(...)`。教室等級硬體會明顯卡頓,且瀏覽器 WebGL context 有上限。應改成像 `updateTelemetry` 一樣的 runtime setter。
5. **CI 結構**:只有 push main 觸發、無 PR 驗證(所有錯誤都是上線後才發現);離線 ZIP 打包步驟失敗會連 Pages 部署一起擋掉(應拆 job);`CHROME_PATH` 硬指 `/usr/bin/google-chrome` 且 `??` 讓 fallback 清單失效;actions 用 mutable major tag、無 `timeout-minutes`;ZIP 名 `OWM_COURSE_OFFLINE_3.57.1.zip` 是第 5 處硬編碼版本。
6. **教師指南指令在乾淨 clone 會失敗**:`pnpm validate:course` 依賴 `public/data/`(gitignored),須先 `pnpm sync:data`,否則 ENOENT;指南 `COURSE_MODE_GUIDE.md:16-18` 的兩行指令組合會中招。腳本開頭補跑 sync 或給友善訊息。

---

## D. 教學內容正確性(P1–P2)

1. **OPEX 把損失電費算進去**(`courseEngineering.ts:321-327`,卡片標籤 "OPEX — Lost revenue + labor + parts + vessel"):lost revenue 是機會成本不是營運支出,學生日後算 margin/LCOE 會重複計算。建議改名 Total downtime cost,OPEX 另列。
2. **產生的 IEC 61131-3 ST 與模擬器行為不一致**:模擬器(`:405-415`)的 delay 從第一個超限樣本起算、與 persistence **並行**;產生的 ST(`:370-371`)是 `PersistCounter.Q` 之後才啟動 TON 的**串聯**語意。預設參數下兩者警報時間差 10 秒,而 `courseEngineering.test.ts` 只 grep 字串,把錯誤鎖進測試。教 PLC 的頁面給出對不上的參考程式,外審會抓。
3. **MTBF/MTTR/Availability 在零故障/零觀測時回傳 0**(`:316-318`):語意顛倒(零故障=最好卻顯示 0h=最差)。目前生成資料 `failures >= 1` 不會觸發,屬潛在地雷;建議回 `null` 顯示 `N/A`。
4. **資料包以 `assignmentIndex` 為鍵、不是 seed**(`:229-232, 281-302`):在 config 重排/插入一週,會靜默改變之後所有週的時間戳、嚴重度與**全部 KPI 答案**,而 randomSeed 與「可重現」宣稱不變。validator 也沒 pin 順序。建議全部改由 `randomSeed` 派生。
5. **randomSeed 沒有進入任務模擬**:只有 SCADA pack 用它(相位與缺值位置);任務可重現是因為模擬本身無隨機性,不是 seed 的功勞。UI 的 `FIXED SEED` chip 暗示了不存在的控制;未來若有人在 runtime 加入隨機性,沒有任何測試會抓到重現性破裂。建議加一個「同一 assignment 兩次模擬結果一致」的 domain test 當守門。
6. **Availability 未標示口徑**(IEC 61400-26 的 time-based/production-based/contractual 未註明,分母排除計畫保養是契約性選擇)、MTBF 的區間慣例(n vs n-1)未標註;`hysteresis=0` 時 set/reset 條件在閾值處重疊會抖動;Alarm tester 用硬編碼 9 點樣本(`CourseEngineeringLab.tsx:31`)而非該週資料包,15 週內容相同。
7. **Assessment 的 `LOTO_VERIFIED` 是 stage 代理指標**(`App.tsx:575-590`,過 Isolate 階段即記 `zeroEnergy: true`),不是學生執行了五步 LOTO;評分語意需向教師說明。
8. `codex.sourceNoteZh/En`(知識庫出處註記)有載入、有驗證、但從未渲染(`App.tsx:5271` 只顯示 safetyNote)——教學工具丟掉出處是內容缺口。
9. 角色卡顯示的 `INT` 屬性(`App.tsx:1920`)與 `atk/def/speed` 在 runtime 完全無作用(只有離線平衡工具讀),學生會誤以為有影響。

---

## E. 架構固有限制(改文件與教學設計,不是改程式)

純靜態 GitHub Pages + localStorage 的先天性質,程式無法「修掉」,但必須明文化:

- **答案可取得**:`missions.json` 含全部 15 題 `diagnosisOptions[].correct` 與回饋文字;config 可被本機覆寫;離線 ZIP 更是整包可改。
- **紀錄可偽造/可重置**:無伺服器就無不可偽造的成績單;上面 B2 的 digest 只是把門檻從「記事本」提高到「要會寫腳本」。
- **因此評分設計上**:以四欄 Debrief(結論/證據/不確定性/殘餘風險)為主要評分物、機器欄位僅作佐證;重要考核採現場監考或搭配口試;`COURSE_MODE_GUIDE.md` 應加一節「哪些欄位可信、哪些不可信」。
- **localStorage 單一紀錄**(`owm.course.v1`):一個瀏覽器 profile 只有一份紀錄;共機、換裝置、隱私模式、清資料都會遺失 → 課堂 SOP 必須是「每次下課前匯出」。線上版與離線包是不同 origin,紀錄不互通。

---

## F. 未完成項目(多數為文件已承認的既定狀態)

| 項目 | 狀態 | 出處 |
|---|---|---|
| Playtest v1 真人測試(3–5 人) | 未執行,`playtest-results/` 為空;這是文件明定的下一步主線 | `NEXT_SESSION_HANDOFF_2026-07-27.md` |
| P01 production art final AI upscale + full-res QA | Queue 210 Upscale Pending / 90 QA Pending / 0 Approved;staging 檔為 deterministic resize | `RELEASE_READINESS.md` |
| Scene 覆蓋 | 148/150 integrated、2/150 刻意 fallback(有 smoke 覆蓋) | `RELEASE_READINESS.md` |
| **教師端 Course Record 彙整/核對工具** | **不存在**(playtest 有 `playtest:summary`,course 沒有對應物);一班 × 15 週的 JSON 全靠人工開檔 | 本次檢視 |
| smoke 未覆蓋完整 Assessment 生命週期 | smoke 只玩到任務中途就匯出;結算、計分、Debrief 閘門在 CI 無測試 | `tools/smoke-course-mode.mjs` |
| `config.frozen` | 僅顯示徽章與 build-time 檢查,runtime 無任何行為 | `CourseModePanel.tsx:60,72` |

---

## G. 本次驗證紀錄(2026-08-31,乾淨 clone)

| 項目 | 結果 |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ |
| `tsc --noEmit` | ✅ |
| `vitest run` | ✅ 25 files / 159 tests |
| `pnpm sync:data` + `validate_owm_data.py` | ✅(本機無圖檔的 Scene 警告屬預期) |
| `pnpm validate:course` | ✅(但需先 sync:data,見 C6) |
| `pnpm simulate:challenge` / `simulate:balance` | ✅ 與文件基準一致(100/100 Boss、L5 15/15、SEED 55 MNT / 6 RST / 疲勞 76%) |
| `pnpm build:pages` | ✅ 70 檔 / 10.0 MiB |
| `smoke:course` 對 build 產物(`/windFarmOMII/` base、Chromium headless) | ✅ 全流程通過 |
| GitHub Actions 最新 run(main@37fb419,2026-07-30) | ✅ build+deploy success(run #1 失敗已由 37fb419 修復) |
| 線上 config 與 repo 一致性 | 未能直接驗證(本環境對 github.io 網路受限);Actions 成功紀錄間接佐證。開學前請人工開 `https://dofliu.github.io/windFarmOMII/course/course-config.json` 核對 |

其他觀察:`pnpm dev/build` 會改寫被追蹤的 `public/assets/source-art/p01/index.json`(`generatedAt` 時間戳),每次建置後 git 都是髒的;`App.tsx:422-428` 與 `:438-443` 是重複的 theme effect(合併殘留)。

---

## H. 建議修復順序

1. **A2** smoke 改讀 config 斷言(否則 W02 解鎖即卡管線)。
2. **A1 + A6** 停止 configVersion 誤殺 + 重設/換碼二段確認與強制匯出。
3. **A3 + A4** OBJECTIVES 洩題兩列加 `assessmentMode` 守門;`diagnosis-choice-correct` testid 改掉;smoke 補 objectives 面板斷言。
4. **A5** Lab 改吃 `availableAssignments`;`startCourseAssessment` 補 unlock re-check;鎖定卡收斂顯示。
5. **B1** 移除非 assessment 的 `HINT_USED` 課程紀錄寫入。
6. **B2 + B4** scores 驗證/重算 + recordDigest + 教師核對腳本;WO 事件改 `closed` 觸發並記錄 `rejectedActions`。
7. **C1 + C2** course-config soft-fail;`save*` 全包 try/catch;audio constructor 防禦(LMS 內嵌前必修)。
8. **C3** sync-data 白名單(部署包 -5.1 MB)。
9. **D1–D4** OPEX 改名、ST 產生器修語意、KPI 零故障回 N/A、資料包改 seed 派生。
10. **F** 新增 `course:summary` 教師端彙整工具;smoke 補完整結算+Debrief 流程;`COURSE_MODE_GUIDE.md` 補「欄位可信度」與「每堂課先匯出」SOP。

---

*本報告由自動化驗證(附錄 G)與兩輪逐檔程式碼稽核產出;所有 file:line 均經人工複核。*
