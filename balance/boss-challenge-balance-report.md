# OWM Boss Challenge Balance Audit

> 這是 deterministic gameplay simulation，只反映目前 Challenge 規則、候選隊伍評分與 autoplay 策略；不是實際風場、SCADA、人因或實驗數據。

Gate：**PASS**

## Fixed contract

| Mastery | Round limit | Equipment | Spare | Vessel | Eligible crew | Counter sets | Exact C(300,3) / set |
|---:|---:|---|---|---|---:|---:|---:|
| L3 / 250 XP | 10 | EQ0051 | EQ0126 | VES002 | 300 | 3 | 4,455,100 |

候選策略：balanced / power / survival，每個 counter set 與策略保留前 8 隊；重複隊伍合併後逐 Boss 實跑正式 runtime。
Challenge-only GRD reserve：S4 Weather Protection +1；S5 Weather Protection +3、每回合 Energy reserve +1。Campaign 數值不變。

## Fairness gates

| Check | Result |
|---|---|
| allBossesClearable | PASS |
| candidateDiversity | PASS |
| lowSeverityAccessible | PASS |
| severityProgression | PASS |
| endgamePressure | PASS |

## Overall

| Cleared | Completion | Avg score | Score range | Avg round | Grades S/A/B/C/D | Pressure comfortable/tight/critical/failed |
|---:|---:|---:|---:|---:|---|---|
| 100/100 | 100% | 75 | 54-80 | 3 | 0/31/47/19/3 | 79/17/4/0 |

## Severity distribution

| Severity | Cleared | Avg score | Range | Avg round | Candidate clear | Grades S/A/B/C/D | Pressure C/T/X/F |
|---|---:|---:|---:|---:|---:|---|---|
| S1 | 20/20 | 79 | 78-80 | 2 | 98% | 0/9/11/0/0 | 20/0/0/0 |
| S2 | 20/20 | 79 | 77-80 | 2 | 98% | 0/8/12/0/0 | 20/0/0/0 |
| S3 | 20/20 | 80 | 77-80 | 2 | 98% | 0/14/6/0/0 | 20/0/0/0 |
| S4 | 20/20 | 73 | 54-76 | 4 | 65% | 0/0/18/1/1 | 19/0/1/0 |
| S5 | 20/20 | 65 | 55-68 | 6 | 55% | 0/0/0/18/2 | 0/17/3/0 |

## Outliers

- Unclearable：None
- Candidate fragile（少於三隊成功）：None
- Over-hard：BOSS075, BOSS079, BOSS080
- Comfortable S5：None
- Severity inversion > 8：None

## Per-Boss results

| Boss | Severity | Class | Result | Pressure | Round | Safety | Weather | Avg fatigue | Score | Grade | Candidate clear | Branch mitigation | Team |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|---:|---:|---|
| BOSS001 | S1 | WEA | PASS | comfortable | 2/10 | 99 | 83 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS002 | S2 | WEA | PASS | comfortable | 2/10 | 99 | 89 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS003 | S3 | WEA | PASS | comfortable | 2/10 | 90 | 87 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS004 | S4 | WEA | PASS | comfortable | 4/10 | 85 | 55 | 0% | 76 | B | 16/24 (67%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS005 | S5 | WEA | PASS | critical | 6/10 | 58 | 15 | 0% | 68 | C | 8/24 (33%) | 0/2 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS006 | S1 | WEA | PASS | comfortable | 2/10 | 99 | 83 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS007 | S2 | WEA | PASS | comfortable | 2/10 | 99 | 89 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS008 | S3 | WEA | PASS | comfortable | 2/10 | 90 | 87 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS009 | S4 | WEA | PASS | comfortable | 4/10 | 85 | 55 | 0% | 76 | B | 16/24 (67%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS010 | S5 | WEA | PASS | critical | 6/10 | 58 | 15 | 0% | 68 | C | 8/24 (33%) | 0/2 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS011 | S1 | COR | PASS | comfortable | 2/10 | 99 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS012 | S2 | COR | PASS | comfortable | 2/10 | 99 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS013 | S3 | COR | PASS | comfortable | 2/10 | 90 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS014 | S4 | COR | PASS | comfortable | 4/10 | 85 | 67 | 0% | 75 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS015 | S5 | COR | PASS | tight | 6/10 | 58 | 35 | 0% | 67 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS016 | S1 | BLD | PASS | comfortable | 2/10 | 97 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS017 | S2 | BLD | PASS | comfortable | 2/10 | 96 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS018 | S3 | BLD | PASS | comfortable | 2/10 | 87 | 91 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS019 | S4 | BLD | PASS | comfortable | 4/10 | 76 | 67 | 0% | 73 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS020 | S5 | BLD | PASS | tight | 6/10 | 43 | 35 | 0% | 64 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS021 | S1 | DRV | PASS | comfortable | 2/10 | 99 | 87 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS022 | S2 | DRV | PASS | comfortable | 2/10 | 99 | 93 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS023 | S3 | DRV | PASS | comfortable | 2/10 | 90 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS024 | S4 | DRV | PASS | comfortable | 4/10 | 85 | 67 | 0% | 76 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS025 | S5 | DRV | PASS | tight | 6/10 | 58 | 35 | 0% | 68 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS026 | S1 | DRV | PASS | comfortable | 2/10 | 99 | 87 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS027 | S2 | DRV | PASS | comfortable | 2/10 | 99 | 93 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS028 | S3 | DRV | PASS | comfortable | 2/10 | 90 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS029 | S4 | DRV | PASS | comfortable | 4/10 | 85 | 67 | 0% | 76 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS030 | S5 | DRV | PASS | tight | 6/10 | 58 | 35 | 0% | 68 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS031 | S1 | ELE | PASS | comfortable | 2/10 | 96 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS032 | S2 | ELE | PASS | comfortable | 2/10 | 95 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS033 | S3 | ELE | PASS | comfortable | 2/10 | 86 | 91 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS034 | S4 | ELE | PASS | comfortable | 4/10 | 73 | 67 | 0% | 73 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS035 | S5 | ELE | PASS | tight | 6/10 | 38 | 35 | 0% | 63 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS036 | S1 | CTL | PASS | comfortable | 2/10 | 99 | 87 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS037 | S2 | CTL | PASS | comfortable | 2/10 | 99 | 93 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS038 | S3 | CTL | PASS | comfortable | 2/10 | 90 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS039 | S4 | CTL | PASS | comfortable | 4/10 | 85 | 67 | 0% | 76 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS040 | S5 | CTL | PASS | tight | 6/10 | 58 | 35 | 0% | 68 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS041 | S1 | CTL | PASS | comfortable | 2/10 | 99 | 87 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS042 | S2 | CTL | PASS | comfortable | 2/10 | 99 | 93 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS043 | S3 | CTL | PASS | comfortable | 2/10 | 90 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS044 | S4 | CTL | PASS | comfortable | 4/10 | 85 | 67 | 0% | 76 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS045 | S5 | CTL | PASS | tight | 6/10 | 58 | 35 | 0% | 68 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS046 | S1 | HYD | PASS | comfortable | 2/10 | 98 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS047 | S2 | HYD | PASS | comfortable | 2/10 | 97 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS048 | S3 | HYD | PASS | comfortable | 2/10 | 88 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS049 | S4 | HYD | PASS | comfortable | 4/10 | 79 | 67 | 0% | 74 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS050 | S5 | HYD | PASS | tight | 6/10 | 48 | 35 | 0% | 65 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS051 | S1 | ELE | PASS | comfortable | 2/10 | 96 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS052 | S2 | ELE | PASS | comfortable | 2/10 | 95 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS053 | S3 | ELE | PASS | comfortable | 2/10 | 86 | 91 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS054 | S4 | ELE | PASS | comfortable | 4/10 | 73 | 67 | 0% | 73 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS055 | S5 | ELE | PASS | tight | 6/10 | 38 | 35 | 0% | 63 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS056 | S1 | ELE | PASS | comfortable | 2/10 | 96 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS057 | S2 | ELE | PASS | comfortable | 2/10 | 95 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS058 | S3 | ELE | PASS | comfortable | 2/10 | 86 | 91 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS059 | S4 | ELE | PASS | comfortable | 4/10 | 73 | 67 | 0% | 73 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS060 | S5 | ELE | PASS | tight | 6/10 | 38 | 35 | 0% | 63 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS061 | S1 | CAB | PASS | comfortable | 2/10 | 99 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS062 | S2 | CAB | PASS | comfortable | 2/10 | 99 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS063 | S3 | CAB | PASS | comfortable | 2/10 | 90 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS064 | S4 | CAB | PASS | comfortable | 4/10 | 85 | 67 | 0% | 74 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS065 | S5 | CAB | PASS | tight | 6/10 | 58 | 35 | 0% | 67 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS066 | S1 | COM | PASS | comfortable | 2/10 | 99 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS067 | S2 | COM | PASS | comfortable | 2/10 | 99 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS068 | S3 | COM | PASS | comfortable | 2/10 | 90 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS069 | S4 | COM | PASS | comfortable | 4/10 | 85 | 67 | 0% | 74 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS070 | S5 | COM | PASS | tight | 6/10 | 58 | 35 | 0% | 65 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS071 | S1 | DIG | PASS | comfortable | 2/10 | 99 | 87 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS072 | S2 | DIG | PASS | comfortable | 2/10 | 99 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS073 | S3 | DIG | PASS | comfortable | 2/10 | 90 | 91 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS074 | S4 | DIG | PASS | comfortable | 6/10 | 75 | 45 | 0% | 66 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS075 | S5 | DIG | PASS | critical | 8/10 | 44 | 1 | 12% | 55 | D | 8/24 (33%) | 0/3 | CHR-ACA-045 / CHR-ACA-050 / CHR-OMI-270 |
| BOSS076 | S1 | GRD | PASS | comfortable | 3/10 | 96 | 82 | 0% | 78 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS077 | S2 | GRD | PASS | comfortable | 3/10 | 94 | 86 | 0% | 77 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS078 | S3 | GRD | PASS | comfortable | 3/10 | 83 | 82 | 0% | 77 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS079 | S4 | GRD | PASS | critical | 10/10 | 37 | 10 | 10% | 54 | D | 8/24 (33%) | 0/3 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS080 | S5 | GRD | PASS | tight | 8/10 | 30 | 22 | 10% | 58 | D | 8/24 (33%) | 0/3 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS081 | S1 | SEA | PASS | comfortable | 2/10 | 99 | 85 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS082 | S2 | SEA | PASS | comfortable | 2/10 | 99 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS083 | S3 | SEA | PASS | comfortable | 2/10 | 90 | 89 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS084 | S4 | SEA | PASS | comfortable | 4/10 | 85 | 61 | 0% | 76 | B | 16/24 (67%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS085 | S5 | SEA | PASS | tight | 6/10 | 58 | 25 | 0% | 68 | C | 8/24 (33%) | 0/2 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS086 | S1 | SEA | PASS | comfortable | 2/10 | 99 | 85 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS087 | S2 | SEA | PASS | comfortable | 2/10 | 99 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS088 | S3 | SEA | PASS | comfortable | 2/10 | 90 | 89 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS089 | S4 | SEA | PASS | comfortable | 4/10 | 85 | 61 | 0% | 76 | B | 16/24 (67%) | 0/1 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS090 | S5 | SEA | PASS | tight | 6/10 | 58 | 25 | 0% | 68 | C | 8/24 (33%) | 0/2 | CHR-MAR-200 / CHR-MAR-220 / CHR-OMI-270 |
| BOSS091 | S1 | OPS | PASS | comfortable | 2/10 | 99 | 86 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS092 | S2 | OPS | PASS | comfortable | 2/10 | 99 | 92 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS093 | S3 | OPS | PASS | comfortable | 2/10 | 90 | 90 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS094 | S4 | OPS | PASS | comfortable | 4/10 | 85 | 64 | 0% | 75 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS095 | S5 | OPS | PASS | tight | 6/10 | 58 | 30 | 0% | 67 | C | 8/24 (33%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS096 | S1 | STR | PASS | comfortable | 2/10 | 99 | 87 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS097 | S2 | STR | PASS | comfortable | 2/10 | 98 | 93 | 0% | 79 | B | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS098 | S3 | STR | PASS | comfortable | 2/10 | 89 | 91 | 0% | 80 | A | 24/24 (100%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS099 | S4 | STR | PASS | comfortable | 4/10 | 82 | 67 | 0% | 75 | B | 16/24 (67%) | 0/1 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |
| BOSS100 | S5 | STR | PASS | tight | 6/10 | 53 | 35 | 0% | 67 | C | 16/24 (67%) | 0/2 | CHR-ACA-045 / CHR-MFG-165 / CHR-OMI-270 |

