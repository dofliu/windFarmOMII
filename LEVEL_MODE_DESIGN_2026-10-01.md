# 關卡模式轉換設計草案(階段 0:僅設計,無程式變更)

日期:2026-10-01 · 狀態:草案,待擁有者確認後再分階段實作
範圍:`course-config.json` 的 `frozen` 語意、`tools/validate-course-config.mjs`、相關 UI 文案與文件。

## 1. 現況盤點(已查證)

- `unlockedWeekIds` 已經是教師手動指定的任意子集:validator(`validate-course-config.mjs:52`)只要求「唯一且屬於 assignment 週次」,`tools/set-course-unlocks.mjs` 也只接受明列週次。**教師自由開關任意關卡組合,技術上今天就做得到**,不需要放寬這一條。
- 真正與關卡模式衝突的是學期遺留語意:
  1. `frozen` 欄位:validator 第 27 行強制 `frozen === true`,否則 CI 失敗;UI(`CourseModePanel.tsx:121`)顯示「學期凍結版 / SEMESTER FREEZE」;`COURSE_MODE_GUIDE.md`「學期凍結」一節把它定義為「學期中不調整平衡公式」。
  2. `term: "2026-FALL"`、`configVersion: "2026-FALL-manual-release-v1"`、`set-course-unlocks` 用法範例 `2026-FALL-W02`:命名仍綁學期。
  3. validator 的 `rosterIds` 18–24 人、`assignments.length === 15` 為固定數字;屬內容結構檢查,與開放哪些關卡無關,建議保留(見 §3)。
  4. 禁止欄位清單(`unlockdate`、`autounlock` 等)是刻意設計:教師手動決定,不由日期推算。與關卡模式一致,保留。

## 2. 提議的新語意

`frozen` 在關卡模式下重新定義為 **「內容/計分已鎖版」**,而非「學期凍結」:

| 項目 | 舊語意 | 新語意 |
|---|---|---|
| `frozen: true` | 本學期不得改平衡 | 本 `releaseVersion` 的分數公式與任務條件已定版;要改就 bump 版本,Course Record 以 `releaseVersion` 區分語意 |
| `frozen: false` | 開發版(CI 不允許) | 開發/預覽版;允許,但 UI 明示「開發版」,且 validator 輸出警告 |
| 開放關卡 | 手動子集 | 不變(手動子集,含 `NONE`) |

要點:Course Record 已內含 `releaseVersion`(schema v2),所以「改分數 → bump 版本」本來就是證據邊界,不需靠「凍結」維持。

## 3. Validator 調整提議(階段 1)

保留(擋真正的設定錯誤):schemaVersion、releaseVersion 與 package 一致、courseCode 匿名安全、roster 角色存在且每職類一人、15 個 assignment 的 mission/equipment/vessel 參照存在、teamIds 屬 roster、seed 唯一、`unlockedWeekIds` 唯一且屬於已定義週次、禁止欄位。

調整:
1. `frozen` 檢查由「必須 true」改為「必須是 boolean」;`false` 時印出 warning(不失敗)。
2. 新增:`unlockedWeekIds` 為空陣列時印出 warning(合法,但學生端將無可玩關卡)。
3. 新增:`configVersion` 必須非空且符合 `set-course-unlocks` 同一 regex,避免手改漏填,導致 Course Record 的 `configVersion` 無法區分不同開放組合。
4. `term` 改為選填的顯示標籤(舊 config 仍相容);不再要求學期格式。
5. 不放寬 18–24 人與 15 關這兩個固定數字:改變它們屬於內容變更,應與 schema/版本一起改,而不是靠放寬 validator。

## 4. UI / 文案(階段 2)

- 徽章「學期凍結版 / SEMESTER FREEZE」→「定版 / LOCKED RELEASE」;`frozen:false` 維持「開發版」。
- 面板 kicker `COURSE MODE · {term}`:`term` 缺省時不顯示尾段。
- `set-course-unlocks` 用法範例與 `configVersion` 命名建議改為 `level-YYYYMMDD-W01-W02` 之類,不含學期。
- `COURSE_MODE_GUIDE.md`「學期凍結」節改寫為「定版與開放關卡」。

## 5. 需要擁有者拍板的問題

1. `frozen` 是改語意保留欄位(建議),還是更名為 `locked`/移除?更名會動 schema(需 schemaVersion 2 與 Course Record 相容處理),成本較高。
2. 是否接受 `frozen:false` 能通過 CI(僅警告)?若部署站只應放定版內容,可改為「`frozen:false` 時 PR 驗證通過、但 Pages 部署 workflow 失敗」。
3. `term` 是否直接移除?(會動 `CourseConfig` 型別、Course Record export 欄位,建議階段 2 之後再議。)

## 6. 實作階段與風險

- 階段 1:validator + 測試(目前 validator 無單元測試,需先抽出可測函式或加 fixture 測試)+ guide 文字。不動型別、不動分數。
- 階段 2:UI 文案、`set-course-unlocks` 說明、smoke 斷言調整;bump 版本五處。
- 階段 3(視 §5 決定):schema/型別變更。
- 風險:`data-course-frozen` 屬性被 smoke 使用(`grep` 確認後再改);Course Record 內已匯出的 `term` 欄位須保持讀取相容。

## 7. 邊界聲明

本草案不依任何人因證據調整難度或平衡;真人 pilot 資料仍為 0 筆。
