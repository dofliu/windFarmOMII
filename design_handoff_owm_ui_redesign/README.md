# Handoff: Offshore Wind Masters — UI Redesign (7 screens)

## Overview
The current game UI packs too much information into small panels: body text runs 6–11px, and on the Operation screen the main character portrait is a small thumbnail even though it's the most important visual element. This redesign reworks the 7 main screens to:

1. Fit each screen's primary content into one viewport — no page-level scrolling.
2. Move secondary/overflow information behind in-panel tabs instead of stacking it all at once.
3. Raise all text well above the old 6–11px range (12px minimum, most body text 13–16px, key numbers 17–32px).
4. Automatically switch to a single-column, larger-touch-target layout on narrow/mobile widths.

All 7 screens keep the existing dark offshore-HUD visual language (same colors, same Consolas/Inter type system) — this is a layout and information-architecture pass, not a re-skin.

## About the Design Files
The files in this bundle (`*.dc.html`) are **design references**, not production code to copy verbatim. They were built in an internal prototyping format: plain HTML + inline styles, with all layout/state logic written as a small class that computes React-style JS style objects (no external CSS, no CSS media queries — responsive switching is done by reading `window.matchMedia` in JS and branching inline style values).

**Open each file directly in a browser to see it render** — they are self-contained. The task is to **recreate these designs in the project's existing React + TypeScript + Phaser codebase** (`OWM_Project_Package_v1.0`), following its existing patterns:
- Reuse the existing `styles.css` class-based approach (don't port the "inline style object" technique — that was a constraint of the prototyping tool, not a recommendation).
- Reuse the existing component structure in `src/App.tsx` (e.g. `DebriefPanel`, `CollectionScreen`, `CodexScreen`, `BossChallengeRoutePanel`, `SandboxScenarioPanel`, the Deployment tab system) — this redesign changes their **layout, tab structure, and type scale**, not their underlying data/props/handlers.
- All game data shown (turbine IDs, mission titles, character names, codex entries, boss names) was pulled from the project's real JSON (`public/data/*.json`) for accuracy; wire the real data back in instead of the hardcoded arrays in the prototype JS.

## Fidelity
**High-fidelity.** Exact colors, type scale, spacing, and component layout are final. Copy point diagrams below.

## Design Tokens

**Colors** (unchanged from the existing `styles.css` `:root`):
| Token | Hex / value | Use |
|---|---|---|
| Background base | `#06141c` (page), gradient `radial-gradient(circle at 55% 0%, #123745 0, #071820 46%, #041017 100%)` | App background |
| Panel fill | `linear-gradient(145deg, rgba(13,40,51,.92), rgba(6,24,33,.94))` | Card/panel background |
| Border / hairline | `rgba(141,184,196,.22)` | All panel/card borders |
| Muted text | `#88aab3` | Secondary labels |
| Bright text | `#f0fbfc` / `#e8f5f6` | Headings, primary values |
| Cyan (MAR faction / primary accent) | `#42dbc8` | Active tabs, primary CTAs, MAR faction |
| Gold (warning / mastery / rewards) | `#f2c66f` | Confirm states, XP/MNT rewards, warnings |
| Purple (Boss Challenge / mastery perks) | `#b99df1` | Boss Challenge accent, mastery perk unlocks |
| Red (hazard / critical) | `#f1745b` | Severity S3–S4, critical fatigue, abort |
| OMI faction accent (new — not in original CSS) | `oklch(78% 0.13 230)` — a soft blue at the same lightness/chroma as the cyan MAR accent | OMI faction highlights (was previously untokened) |

**Typography:**
- UI/body text: `'Inter', 'Noto Sans TC', system-ui, sans-serif` — loaded via Google Fonts (`Inter` weights 400–900, `Noto Sans TC` weights 400–900).
- Codes/IDs/stat numbers: `'Consolas', 'SFMono-Regular', monospace`.
- Scale used throughout: 10–11px (chip labels only) → 12–15px (body/meta) → 16–20px (card/section headings) → 22–32px (hero stat numbers, grades).
- **Rule applied everywhere:** nothing below 12px; most text 13px+.

**Spacing/structure:**
- Page padding: 18–26px desktop, 10–12px mobile.
- Panel padding: 14–18px.
- Standard gap between grid/flex children: 8–14px.
- Tab buttons: 38–44px min-height (44px+ on mobile for touch).

## Responsive Behavior
Two independent thresholds are used (this distinction matters — conflating them caused layout bugs during prototyping):
1. **Topbar breakpoint — `max-width: 1080px`** (tracked via `window.matchMedia`): below this, the topbar's brand/lang/mode-nav/dataset-strip rows wrap onto multiple lines instead of trying to fit on one row. This threshold is wide because the topbar's un-shrinkable content (mode nav + dataset chips + lang button) genuinely needs ~1050px+ to lay out in one row.
2. **Content grids — no JS breakpoint at all.** Every multi-column content grid (turbine cards, mission chapters, crew cards, codex cards, boss cards, sliders, etc.) uses CSS `grid-template-columns: repeat(auto-fit, minmax(Npx, 1fr))`. This lets column count adjust continuously with available width with no JS involved and no risk of a "dead zone" between two mismatched breakpoints.
3. On the Operation screen specifically (which has a 3-column layout: Mission Control / Field / Crew), below 1080px it collapses to a **single visible panel at a time**, switched via a bottom tab bar (任務 / 現場 / 小隊).

Implementation note for the dev team: reproduce this as two real CSS media queries (`@media (max-width: 1080px)` for the header/nav chrome, and `auto-fit`/`auto-fill` grid templates with no query for content grids) rather than one JS-driven breakpoint controlling everything — that mismatch was the exact bug the prototype hit and fixed.

**Important cross-browser note:** wherever a container only needs to scroll on one axis (e.g. `overflow-y: auto`), explicitly set the other axis to `hidden` (e.g. `overflow-x: hidden`). Setting only one axis makes the browser compute the other as `auto` too per the CSS overflow spec, which produced stray empty scrollbars in testing.

## Screens

### 1. Operation (`OWM Operation Screen Redesign.dc.html`)
**Purpose:** the live mission-execution screen — the one the user originally flagged (too dense, portrait too small).
**Layout:** 3-column grid on desktop (`350px / minmax(560px,1fr) / 390px` → tightened to `300px / minmax(420px,1fr) / 330px`), collapsing to one full-height panel + bottom tab bar (任務/現場/小隊) below 1080px.
- **Left — Mission Control:** risk-event select, current stage badge + counter, hazard chip, then 3 sub-tabs: **事件** (mission event deck: R01/R04/R07 trigger chips), **階段** (6-step stage list, current step highlighted), **資源** (stage metrics + weather/safety/evidence meters). A footer (always visible, not tabbed) holds the round-progress bar and the primary Confirm-End-Round button (two-step confirm: first click shows a gold "will trigger WEATHER_ESCALATION" warning, second click commits) plus Abort/Return.
- **Center — Field:** live status strip (turbine/scene chips), fleet-condition strip, a large hero image (the field-feed background) with overlaid labels, a formula strip, a "NEXT DECISION" banner, then 3 sub-tabs: **LOG / SUMMARY / OBJECTIVES**.
- **Right — Crew:** top-level tabs for the 3 deployed crew slots (MAR 1 / MAR 2 / OMI 3), each with 3 sub-tabs: **角色** (a large hero-style portrait card — image fills ~60% of panel height with a gradient nameplate overlay, name/role/level, AP/Energy/Int stat row, fatigue bar), **行動** (recommended-skill CTA + skill list), **裝備** (task equipment/supply/vessel + mastery perks).
**Key fix from the original complaint:** the crew portrait is now a flex:1 hero image instead of a ~110×140px thumbnail.
**Tweaks exposed:** `density` (comfortable/spacious font scale), `reduceMotion` (disables the live-feed pulse animation).

### 2. Deployment / Route (`OWM Deployment Route Redesign.dc.html`)
**Purpose:** mission selection, readiness checks, crew/loadout assignment, and dispatch forecast before a mission.
**Layout:** single full-height panel below a 5-tab row: **任務航線 / 作業許可 / Crew / 裝備 / 出勤預測**.
- **任務航線** has its own 3 sub-tabs: **風場** (6 turbine status cards — reliability/backlog/availability), **任務** (5-chapter × 3-mission grid, current/available/locked states), **簡報** (selected mission's boss briefing, learning objectives, event deck, readiness chips, Deploy CTA).
- **作業許可**: site/weather/sea-state metrics + a 5-item readiness checklist (permit/PPE/access/vessel/mastery).
- **Crew**: search + faction/readiness filters, scrollable roster list with per-row select/deselect.
- **裝備**: current task equipment/spare/vessel cards + inventory counts.
- **出勤預測**: equipment-wear, MNT reward, and crew-fatigue forecast cards + Crew Rotation Advisor summary + Deploy CTA.

### 3. Debrief / Mission Result (`OWM Debrief Redesign.dc.html`)
**Purpose:** post-mission settlement screen.
**Layout:** grade badge + summary line, then 3 tabs: **結算摘要 (Review) / 分數 (Score) / Log**.
- Review: this-run vs. best-before vs. best-after comparison strip, XP/MNT/RST/fleet/codex reward cards, and a continue-actions row (Next mission / Return route / Replay).
- Score: 6-metric grid (Completion/Safety/Evidence/Time/Fatigue/Cost).
- Log: full operation log list.

### 4. Collection (`OWM Collection Redesign.dc.html`)
**Purpose:** crew card browsing / career progression, and save + inventory management.
**Layout:** 2 tabs: **Crew 卡牌 / 資源與存檔**.
- Crew cards: faction filter chips + search, then a card grid — each card has a large 2:3 portrait, name/role, mastery progress bar, and a fatigue/readiness strip.
- Resources: equipment inventory summary, crew readiness counts, and a save-manager card (generate/import/download JSON).

### 5. Codex (`OWM Codex Redesign.dc.html`)
**Purpose:** unlockable knowledge-base entries.
**Layout:** category filter row + a responsive card grid. Unlocked cards show title/summary/key-points/safety-boundary note; locked cards show a lock state naming the mission that unlocks them.

### 6. Boss Challenge (`OWM Boss Challenge Redesign.dc.html`)
**Purpose:** the standalone per-boss leaderboard mode.
**Layout:** 3 tabs: **總覽 (Overview) / Boss 列表 (Roster) / 簡報 (Briefing)**.
- Overview: summary metrics, fixed-ruleset chips (Mastery L3 / 10 rounds / fixed L1 loadout / isolated save), and draft-portfolio counts.
- Roster: severity-filterable boss card grid with each boss's best score.
- Briefing: selected boss detail + Challenge CTA.

### 7. Sandbox (`OWM Sandbox Redesign.dc.html`)
**Purpose:** free-form scenario testing (no save mutation).
**Layout:** 3 tabs: **情境 (Scenario) / 場景 (Scene) / 簡報 (Briefing)**.
- Scenario: preset buttons (Calm/Standard/Storm/Custom), a slider-card grid (sea state / weather window / safety / evidence / round limit), and a vessel-projection card.
- Scene: integrated/fallback coverage summary + filterable scene card grid.
- Briefing: selected boss detail + session-start CTA.

## Interactions & Behavior (shared across screens)
- All tab switches are simple state toggles — no animation required, but a quick opacity/border-color transition on tab active-state is fine to add.
- Two-step destructive/consequential confirms (Operation's End Round, Abort/Return) show a warning line after the first click and only act on the second click.
- No loading/error states were designed here — these screens assume data is already loaded, matching the current app's behavior.
- Buttons/tabs use `cursor: pointer` and a visible active/selected state (colored border + tinted background); no custom hover styles were specified beyond what the codebase's existing button hover treatment already provides — reuse that.

## Assets
Real game assets copied from the project during this redesign (already present in the repo — no new art was generated):
| File | Source | Used for |
|---|---|---|
| `CHR-MAR-196_L1_P01_v002.png` | `public/assets/source-art/p01/` | Crew slot 1 portrait (潮風見習・ROV操作員) |
| `CHR-MAR-197_L2_P01_v001.png` | same | Crew slot 2 portrait (浪脈執行者・ROV操作員) |
| `CHR-MAR-198_L3_P01_v001.png` | same | Collection grid (風域專家・ROV操作員) |
| `CHR-MAR-199_L4_P01_v001.png` | same | Collection grid (海疆導師・ROV操作員) |
| `CHR-MAR-200_L5_P01_v001.png` | same | Collection grid (天穹大師・ROV操作員) |
| `CHR-OMI-241_L1_P01_v001.png` | same | Crew slot 3 / Collection grid (潮風見習・高壓電工程師) |
| `offshore-field-feed_scn003_rain_v001.png` | `public/assets/environment/` | Operation screen hero/field-feed image |

## Files in this bundle
| File | Screen |
|---|---|
| `OWM Operation Screen Redesign.dc.html` | Operation (live mission) |
| `OWM Deployment Route Redesign.dc.html` | Deployment / Campaign Route |
| `OWM Debrief Redesign.dc.html` | Mission Result / Debrief |
| `OWM Collection Redesign.dc.html` | Collection (crew archive) |
| `OWM Codex Redesign.dc.html` | Knowledge Codex |
| `OWM Boss Challenge Redesign.dc.html` | Boss Challenge |
| `OWM Sandbox Redesign.dc.html` | Sandbox |

Open any file directly in a browser to see the live, interactive reference.
