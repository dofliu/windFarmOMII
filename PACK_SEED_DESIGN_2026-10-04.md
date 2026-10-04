# D4 設計草案:工程資料包改由 randomSeed 派生(階段 0,僅文件)

> 對應 `OPS_SYSTEM_REVIEW_2026-08-31.md` D4。本文件只提案,**未改任何程式、分數、存檔或版本**。

## 1. 現況(已查證程式碼)

`createMissionEngineeringPack(assignment, assignmentIndex)`(`src/domain/courseEngineering.ts`)中:

| 輸出 | 由誰決定 |
| --- | --- |
| 時間戳基準 `Date.UTC(2026,0,5+index)` | `assignmentIndex` |
| `severity`(症狀升級速度) | `floor(index/3)` |
| `failures`、`unplannedDowntimeHours`、`repairHours`、`lostProductionMWh` | `index` |
| `plannedMaintenanceHours`、`laborCost`、`partsCost`、`vesselCost` | `index` |
| 雜訊相位、缺值位置與欄位 | `randomSeed` |
| `faultFamily` | `missionId` 末三碼 |

`CourseEngineeringLab.tsx:51` 的 `packIndex` 取自 `weekId`(`W07`→6),**不是**陣列順序;因此在 `course-config.json` 重排 assignments 不會變動資料包,但「改 weekId」或「週次改號」會靜默改變該週全部 KPI 標準答案,而 `randomSeed` 與 `FIXED CONDITION` 顯示維持不變。validator 目前未 pin `weekId ↔ 位置` 對應,也未 pin 任何 KPI 答案。

(註:原 review 描述為「`assignmentIndex` 為鍵」,實際上游是 `weekId`;風險性質相同。)

## 2. 設計取捨

資料包的 index 驅動同時承擔「**難度遞增**」教學功能(後期週次 downtime、成本、症狀都較大)。若單純改成 seed 派生,難度曲線會變成亂數,學生週與週之間不可比較。因此需分離兩個概念:

- **難度階層 tier(教學設計決定,顯式)**:控制 severity / failures / downtime 基準與成本級距。
- **seed(可重現雜訊)**:控制相位、缺值、時間戳偏移、tier 內的微幅抖動。

## 3. 提案

1. `CourseAssignment` 新增選填 `packTier`(整數 1–5);缺省時以現行公式 `floor(weekIndex/3)+1` 推導,**保證現行 15 週輸出完全不變**(以快照測試 pin 住)。
2. 時間戳基準改為 `Date.UTC(2026,0,5) + (seed % 28) * 1 day`;tier 內微抖動用小型 deterministic PRNG(mulberry32,`seed` 播種),取代 `index * 係數`。
3. validator 新增檢查:`packTier` 範圍;(可選)輸出 15 週資料包的 KPI 指紋雜湊並與 `course-config.json` 內 `packFingerprint` 比對,讓重排或改號在 CI 就被擋下。
4. `CourseAttempt` 已快照 `randomSeed`;需評估是否也快照 `packTier`(僅在 schema 升版時),避免離線重算與現行 config 脫鉤。

## 4. 影響評估

- **會改變 KPI 標準答案**:若採 §3.2 的新時間戳/抖動,現行週次答案會改。關卡模式下已允許,但須 bump 版本(五處同步)並在 CHANGELOG 明列;已存的 Course Record 以舊版重算會對不上,需決定是否在 record 帶 `packVersion`。
- 保守替代方案(推薦先做):**只做 §3.1 + §3.3**——不改輸出、只把隱性依賴顯式化並以指紋守門;確認後再單獨決定是否真的改成 seed 派生。

## 5. 待擁有者確認

1. 是否接受「tier 顯式 + seed 雜訊」的分離(而非全部 seed 派生)?
2. 先做保守階段(輸出不變、加指紋守門),還是直接改輸出並 bump 版本?
3. 是否需要 `packVersion` 寫入 Course Record 以保護舊紀錄重算?

## 6. 分階段

- 階段 1:`packTier` + 快照測試 + validator 指紋(輸出不變,不 bump)。
- 階段 2:(依 §5 決定)改為 seed 派生並 bump 版本。
