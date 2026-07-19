# OWM Campaign Balance Simulation

> 這是 deterministic gameplay simulation，只反映目前遊戲規則與 autoplay 策略，不是實際風場、SCADA 或實驗數據。三個 profile 使用相同的 L1/L3/L5 career-role 混合隊伍，只改變角色 Mastery XP。

Gate：PASS

| Profile | Required route | Cleared | Required cleared | Avg score | Comfortable | Tight | Critical | Failed |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| L1 | Ch.01-02 | 6/15 | 6/6 | 80 | 6 | 0 | 0 | 9 |
| L3 | Ch.01-04 | 12/15 | 12/12 | 79 | 9 | 3 | 0 | 3 |
| L5 | Ch.01-05 | 15/15 | 15/15 | 78 | 11 | 1 | 3 | 0 |

## Equipment maintenance economy

> Policy: L5 deterministic route uses each Mission recommended loadout and performs a full repair after every Mission. MNT and Condition are gameplay abstractions.

| Serviceable missions | Initial MNT | Earned MNT | Repair spend | Ending MNT | Lowest post-mission condition | Repair failures | Gate |
|---:|---:|---:|---:|---:|---:|---:|---|
| 15/15 | 80 | 652 | 438 | 294 | 84% | 0 | PASS |

## Crew readiness economy

> Policy: the sequential L5 route carries Crew fatigue between Missions, rotates by recommended factions, and spends one RST only when an Exhausted crew member would block Deployment. RST and fatigue are gameplay abstractions.

| Deployable missions | Completed missions | Initial RST | Earned RST | Spent RST | Ending RST | Rest actions | Exhausted blocks | Max persistent fatigue | Gate |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 15/15 | 15/15 | 3 | 29 | 0 | 32 | 0 | 0 | 1% | PASS |

| Profile | Mission | Ch. | Result | Pressure | Round | Safety | Weather | Avg fatigue | Score | Grade | Branch mitigation |
|---|---|---:|---|---|---:|---:|---:|---:|---:|---|---:|
| L1 | MSN-TUT-001 | 1 | PASS | comfortable | 3/11 | 93 | 87 | 0% | 80 | A | 1/1 |
| L1 | MSN-TUT-002 | 1 | PASS | comfortable | 3/11 | 91 | 84 | 0% | 81 | A | 1/1 |
| L1 | MSN-TUT-003 | 1 | PASS | comfortable | 3/11 | 92 | 90 | 0% | 80 | A | 1/1 |
| L1 | MSN-ADV-004 | 2 | PASS | comfortable | 3/10 | 93 | 84 | 0% | 80 | A | 1/1 |
| L1 | MSN-ADV-005 | 2 | PASS | comfortable | 3/10 | 90 | 84 | 0% | 79 | B | 1/1 |
| L1 | MSN-ADV-006 | 2 | PASS | comfortable | 3/10 | 87 | 84 | 0% | 79 | B | 1/1 |
| L1 | MSN-ELT-007 | 3 | FAIL:ReadinessGate | failed | 1/9 | 100 | 100 | 0% | 53 | D | 0/0 |
| L1 | MSN-ELT-008 | 3 | FAIL:ReadinessGate | failed | 1/9 | 100 | 100 | 0% | 53 | D | 0/0 |
| L1 | MSN-ELT-009 | 3 | FAIL:ReadinessGate | failed | 1/9 | 100 | 100 | 0% | 53 | D | 0/0 |
| L1 | MSN-MST-010 | 4 | FAIL:ReadinessGate | failed | 1/10 | 100 | 100 | 0% | 53 | D | 0/0 |
| L1 | MSN-MST-011 | 4 | FAIL:ReadinessGate | failed | 1/10 | 100 | 100 | 0% | 53 | D | 0/0 |
| L1 | MSN-MST-012 | 4 | FAIL:ReadinessGate | failed | 1/10 | 100 | 100 | 0% | 53 | D | 0/0 |
| L1 | MSN-FNL-013 | 5 | FAIL:ReadinessGate | failed | 1/11 | 100 | 100 | 0% | 54 | D | 0/0 |
| L1 | MSN-FNL-014 | 5 | FAIL:ReadinessGate | failed | 1/11 | 100 | 100 | 0% | 54 | D | 0/0 |
| L1 | MSN-FNL-015 | 5 | FAIL:ReadinessGate | failed | 1/11 | 100 | 100 | 0% | 54 | D | 0/0 |
| L3 | MSN-TUT-001 | 1 | PASS | comfortable | 3/11 | 93 | 87 | 0% | 80 | A | 1/1 |
| L3 | MSN-TUT-002 | 1 | PASS | comfortable | 3/11 | 91 | 84 | 0% | 81 | A | 1/1 |
| L3 | MSN-TUT-003 | 1 | PASS | comfortable | 3/11 | 92 | 90 | 0% | 80 | A | 1/1 |
| L3 | MSN-ADV-004 | 2 | PASS | comfortable | 3/10 | 93 | 84 | 0% | 80 | A | 1/1 |
| L3 | MSN-ADV-005 | 2 | PASS | comfortable | 3/10 | 90 | 84 | 0% | 79 | B | 1/1 |
| L3 | MSN-ADV-006 | 2 | PASS | comfortable | 3/10 | 87 | 84 | 0% | 79 | B | 1/1 |
| L3 | MSN-ELT-007 | 3 | PASS | comfortable | 3/9 | 98 | 74 | 0% | 84 | A | 1/1 |
| L3 | MSN-ELT-008 | 3 | PASS | comfortable | 3/9 | 98 | 78 | 0% | 83 | A | 1/1 |
| L3 | MSN-ELT-009 | 3 | PASS | comfortable | 3/9 | 81 | 78 | 0% | 77 | B | 1/1 |
| L3 | MSN-MST-010 | 4 | PASS | tight | 6/10 | 85 | 36 | 2% | 77 | B | 2/2 |
| L3 | MSN-MST-011 | 4 | PASS | tight | 6/10 | 82 | 41 | 1% | 75 | B | 2/2 |
| L3 | MSN-MST-012 | 4 | PASS | tight | 6/10 | 66 | 41 | 1% | 71 | B | 2/2 |
| L3 | MSN-FNL-013 | 5 | FAIL:ReadinessGate | failed | 1/11 | 100 | 100 | 0% | 54 | D | 0/0 |
| L3 | MSN-FNL-014 | 5 | FAIL:ReadinessGate | failed | 1/11 | 100 | 100 | 0% | 54 | D | 0/0 |
| L3 | MSN-FNL-015 | 5 | FAIL:ReadinessGate | failed | 1/11 | 100 | 100 | 0% | 54 | D | 0/0 |
| L5 | MSN-TUT-001 | 1 | PASS | comfortable | 3/11 | 93 | 84 | 0% | 81 | A | 0/1 |
| L5 | MSN-TUT-002 | 1 | PASS | comfortable | 3/11 | 91 | 84 | 0% | 81 | A | 0/1 |
| L5 | MSN-TUT-003 | 1 | PASS | comfortable | 3/11 | 92 | 90 | 0% | 81 | A | 0/1 |
| L5 | MSN-ADV-004 | 2 | PASS | comfortable | 3/10 | 93 | 84 | 0% | 81 | A | 0/1 |
| L5 | MSN-ADV-005 | 2 | PASS | comfortable | 3/10 | 90 | 84 | 0% | 80 | A | 0/1 |
| L5 | MSN-ADV-006 | 2 | PASS | comfortable | 3/10 | 87 | 84 | 0% | 79 | B | 0/1 |
| L5 | MSN-ELT-007 | 3 | PASS | comfortable | 3/9 | 98 | 70 | 1% | 84 | A | 0/1 |
| L5 | MSN-ELT-008 | 3 | PASS | comfortable | 3/9 | 98 | 78 | 1% | 83 | A | 0/1 |
| L5 | MSN-ELT-009 | 3 | PASS | comfortable | 3/9 | 81 | 78 | 1% | 77 | B | 0/1 |
| L5 | MSN-MST-010 | 4 | PASS | tight | 5/10 | 87 | 43 | 3% | 80 | A | 1/2 |
| L5 | MSN-MST-011 | 4 | PASS | comfortable | 5/10 | 84 | 52 | 0% | 77 | B | 1/2 |
| L5 | MSN-MST-012 | 4 | PASS | comfortable | 5/10 | 68 | 52 | 2% | 74 | B | 1/2 |
| L5 | MSN-FNL-013 | 5 | PASS | critical | 7/11 | 65 | 5 | 4% | 75 | B | 1/2 |
| L5 | MSN-FNL-014 | 5 | PASS | critical | 7/11 | 67 | 16 | 0% | 73 | B | 1/2 |
| L5 | MSN-FNL-015 | 5 | PASS | critical | 7/11 | 42 | 9 | 0% | 69 | C | 1/2 |

