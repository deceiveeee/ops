# Lesson Premium Typography & Restraint — Design Spec

**Date:** 2026-07-26
**Status:** Approved by user, ready for plan authoring
**Scope:** Lesson pages first (pilot + rollout). Course map, course detail, homepage, studio, filings adopt the same tokens in a later pass.
**Reference:** Apple.com — simple, coherent, premium. Finance-editorial soul via Fraunces headlines (FT / Economist / Bloomberg Businessweek pattern).

---

## 1. Problem

Lessons currently feel dense and undesigned despite a completed light-theme migration and a recent readability remediation. Three root causes:

1. **Timid serif.** `Fraunces` is registered as the display face but used 16 times across lessons at 15-18px for tiny card labels — the wrong scale for a serif display face. It reads as "slightly fancy sans," not editorial.
2. **Generic buttons.** The primary button's `shadow-glow` (neon cyan halo) reads as SaaS template, not premium. Cyan is used as fill, glow, AND ambient brand color, diluting its impact.
3. **Loose density.** Body line-length is uncapped, vertical rhythm is uneven, hierarchy is flat (most text clusters in the 15-18px range with no clear headline jump).

The existing migration plan (`docs/superpowers/plans/2026-07-21-learning-pages-light-theme.md`) handled dark→light conversion mechanically. It did not address editorial typography, button refinement, or density discipline. This spec fills that gap.

---

## 2. Decisions (locked with user)

| # | Decision | Choice |
|---|---|---|
| 1 | Scope | Lessons pilot first, then expand to course map/detail/homepage |
| 2 | Typography | Fraunces headlines at scale + Inter body |
| 3 | Buttons | Cyan solid (no glow), text+arrow secondary, refined padding |
| 4 | Color | Disciplined palette, drop purple, max 2 accents per screen |
| 5 | Execution | Pilot lesson with portable primitives, then rollout |

---

## 3. Architecture

### 3.1 Token-first, pilot-validated, rolled-out

Three phases:

1. **Pilot.** Redesign `/lessons/present-value-cashflows-assets-npv` end-to-end using *new* primitives (not inline hacks) designed for reuse. Iterate with user until the feel is right.
2. **Promote.** Lift pilot primitives into `app/globals.css` (tokens) and `components/lessons/intro-course-overview/shared.tsx` (shared primitives).
3. **Roll out.** Apply promoted primitives to remaining 45 lessons. Trust tokens + compat layer for propagation. Audit hardcoded patterns lesson-by-lesson (existing Phase 10 mechanism). Spot-check 5 representative lessons at desktop + mobile via `lesson-check.js`.

### 3.2 Relationship to the existing migration plan

This spec **supersedes** these sections of `2026-07-21-learning-pages-light-theme.md`:
- Phase 2 Task 2.1 token definitions (the type/spacing/color tokens below replace them)
- Phase 5 Task 5.1 Button refactor (the button specs below replace it)
- Phase 5 Task 5.3 Shared lesson primitives (the primitive refactors below replace it)

This spec **inserts** a new pilot phase between Phase 5 and Phase 6 of the migration plan. The pilot must complete and win user sign-off before any course-map or course-detail work begins.

---

## 4. Type scale

**Philosophy:** Fraunces used rarely and big. Inter for everything else. Strong size jumps create hierarchy; generous line-height creates breathing room.

### 4.1 Display scale (Fraunces serif)

| Token | Size | Weight | Line-height | Tracking | Used for |
|---|---|---|---|---|---|
| `d-hero` | 60px desktop / 40px mobile | 600 | 1.05 | -0.02em | Lesson opener H1 — once per lesson |
| `d-section` | 38px desktop / 28px mobile | 600 | 1.1 | -0.015em | Major section H2 |

Fraunces italic (weight 400, italic style) is permitted for occasional editorial pull-quotes at `d-section` size.

**Constraint:** No other use of `font-display`. All 16 existing call sites using `font-display` at 15-20px are removed during the audit phase.

### 4.2 Sans scale (Inter)

| Token | Size | Weight | Line-height | Tracking | Used for |
|---|---|---|---|---|---|
| `t-subsection` | 22px | 600 | 1.25 | -0.01em | Subsection H3 |
| `t-card-title` | 17px | 600 | 1.3 | -0.005em | Card / list-item titles |
| `body-lead` | 20px | 400 | 1.6 | 0 | First paragraph after a head |
| `body` | 18px | 400 | 1.65 | 0 | Default body |
| `body-strong` | 18px | 500 | 1.65 | 0 | Emphasis |
| `definition` | 19px | 400 | 1.65 | 0 | Definition card body |
| `small` | 15px | 400 | 1.55 | 0 | Secondary text, captions |
| `eyebrow` | 13px | 600 | 1.4 | 0.02em | Section labels — **sentence case** |
| `micro` | 12px | 500 | 1.4 | 0.04em | Data labels, metadata |

**Hierarchy rule:** every lesson page shows exactly one `d-hero` (the opener), at most three `d-section` heads, and any number of `t-subsection`. If a page needs more than three `d-section` heads, the design is wrong — restructure into subsections instead.

### 4.3 Font roles

- **Fraunces** — registered as `--font-display`. Loaded weights: 400 (regular + italic), 500, 600, 700. Used ONLY for `d-hero` and `d-section`.
- **Inter** — registered as `--font-sans`. Loaded weights: 400, 500, 600, 700. Used for all body, labels, UI, captions.
- **IBM Plex Mono** — registered as `--font-mono`. Used only for code blocks, formula notation when it must be monospaced, and chart axis labels.

---

## 5. Spacing & widths

### 5.1 Vertical rhythm

| Token | Desktop | Mobile | Used between |
|---|---|---|---|
| `--space-section` | 96px | 64px | Major sections |
| `--space-subsection` | 56px | 40px | Subsections within a section |
| `--space-block` | 32px | 24px | Paragraphs / cards within a subsection |
| `--space-element` | 16px | 16px | Related elements (label + value, etc.) |

Spacing is the primary density fix. Bigger section gaps + width-capped prose together resolve the "dense" complaint.

### 5.2 Content widths

| Token | Width | Used for |
|---|---|---|
| `--width-prose` | 680px | Body paragraphs, definition lists |
| `--width-wide` | 960px | Charts, diagrams, tables, interactive visuals |
| `--width-lesson` | 1120px | Full lesson container (content + sidebar) |

Prose is width-capped. Long lines are the #1 density complaint. Charts get the wide lane. Lesson content currently bunches everything into one wide column; the new system gives prose and wide-content distinct lanes inside the same lesson column. Interactive components and `.glass-panel` interiors explicitly excluded from the prose cap (per recent remediation).

---

## 6. Color & buttons

### 6.1 Color tokens (light scope only)

| Role | Token | Value |
|---|---|---|
| Page background | `--ops-bg` | `#F5F5F7` |
| Surface (cards, panels) | `--ops-surface` | `#FFFFFF` |
| Surface variant 2 (insets, hover) | `--ops-surface-2` | `rgba(0,0,0,0.03)` |
| Surface border | `--ops-surface-border` | `rgba(0,0,0,0.08)` |
| Text primary | `--ops-text-primary` | `#1d1d1f` (Apple near-black) |
| Text secondary | `--ops-text-secondary` | `#424245` |
| Text tertiary | `--ops-text-tertiary` | `#6e6e73` |
| Brand accent (strong) | `--ops-accent-strong` | `#007A8A` (AGENTS.md prescribed) |
| Brand accent (fill) | `--ops-accent-fill` | `#22d3ee` — charts/graphics only |
| Warm accent (strong) | `--ops-accent-warm-strong` | `#8A5A00` |
| Success | `--ops-success-strong` | `#1F6F43` |
| Warning | `--ops-warning-strong` | `#8A5A00` |
| Error | `--ops-error-strong` | `#B0181A` |

### 6.2 Color discipline rules

1. **Drop purple entirely.** Existing `accent.purple` (`#a78bfa`) is removed from the palette and from all lesson `ConceptTag` records.
2. **Max 2 accents per viewport.** A lesson page as a whole may use the brand accent plus multiple semantic colors across its length, but at any single scroll position the visible viewport should show no more than 2 accent hues — the brand accent (`--ops-accent-strong` or fill) plus at most one semantic color (success/warning/error).
3. **Semantic colors only on feedback states.** Success green, warning amber, error red are reserved for feedback components, validation states, and risk/return concept encoding (where the mapping is genuinely meaningful).
4. **ConceptTag differentiation without purple.** Tags that previously used purple switch to weight + icon differentiation (e.g. bordered vs filled, icon prefix) instead of a new hue.
5. **Bright cyan (`#22d3ee`) is a fill color, never a text color.** On light backgrounds it has insufficient contrast for text. Strong teal (`#007A8A`) is the text/link/border variant (AGENTS.md §Accent rule).

### 6.3 Button specs

Pill shape (`border-radius: 9999px`) is retained. The cheap-feeling element was the glow + aggressive cyan fill, not the shape.

| Variant | Background | Text | Border | Padding | Font | Hover |
|---|---|---|---|---|---|---|
| `primary` | `--ops-accent-strong` `#007A8A` | `#FFFFFF` | none | 14×28 | 15px / 600 / -0.01em | darken 8%, add `--ops-shadow-elevated` |
| `secondary` | transparent | `--ops-accent-strong` | none | 8×0 (text-only) | 15px / 500 | underline + chevron `→` translates 2px right |
| `outline` | transparent | `--ops-text-primary` | 1px `rgba(0,0,0,0.15)` | 14×28 | 15px / 600 / -0.005em | background `--ops-surface-2` |
| `ghost` | transparent | `--ops-text-secondary` | none | 8×12 | 15px / 500 | background `--ops-surface-2`, text `--ops-text-primary` |

**Removed from primary:** `shadow-glow`, the cyan fill, the `border-accent-cyan/40` ring, the cyan-on-black text. The `primary` is now solid teal on white — solid, confident, premium.

**Focus ring (all variants):** `ring-2 ring-offset-2` in `--ops-accent-strong` at 50% opacity. Visible on white.

**Disabled (all variants):** `opacity: 0.55`, `cursor: not-allowed`, no hover changes (already implemented in recent remediation).

**Sizes:** `sm` (13px / 10×18), `md` (15px / 12×24), `lg` (17px / 14×32). Default is `md`.

---

## 7. Shared primitive refactors

These primitives in `components/lessons/intro-course-overview/shared.tsx` get refactored during the pilot. The refactor is the spec — not described separately per primitive here.

### 7.1 `SectionHeading`

- Adds `emphasis` prop (default false).
- Numeral (when present) renders in `--ops-text-tertiary` by default, `--ops-accent-strong` when `emphasis`.
- Heading text uses `d-section` token (Fraunces 38px / 600).
- Eyebrow label uses `eyebrow` token (Inter 13px / 600 / sentence case).

### 7.2 `DefinitionCard`

- Surface: `--ops-surface` white, 1px border `--ops-surface-border`, padding 24×28, no resting shadow.
- Term: `t-card-title` token, color `--ops-accent-strong`.
- Body: `definition` token (Inter 19px / 1.65), color `--ops-text-secondary`.
- Hover (when interactive): `--ops-shadow-elevated`.

### 7.3 `ConceptTag`

- One style record per concept, **without** purple.
- Cyan / amber / red / green remain for genuinely meaningful categories (risk=red, return=green, etc.).
- Differentiation for non-meaningful categories: weight + icon + border style, not new hues.
- Soft accent background, strong accent text, `eyebrow` token sizing.

### 7.4 `Feedback`

- Semantic tokens only: `--ops-success-strong` / `--ops-warning-strong` / `--ops-error-strong`.
- Soft background via `color-mix(in srgb, var(--token) 8%, white)`.
- Border via `color-mix(in srgb, var(--token) 25%, white)`.
- Status label uses `eyebrow` token. Body uses `body` token.

### 7.5 `TryItTag`

- Soft accent bg, strong text, sentence case, `eyebrow` sizing.

### 7.6 `Panel`

- Always `glass-panel` (token-driven). The `tone="dark"` prop is retired (its only purpose was dark-scope override; tokens handle scope now).

---

## 8. New typography primitives

New components created during pilot, promoted after approval.

### 8.1 `<LessonH1>`

Renders Fraunces `d-hero`. Used once per lesson. Accepts optional `eyebrow` prop rendered above (Inter `eyebrow` token, sentence case).

### 8.2 `<LessonH2>`

Renders Fraunces `d-section`. Used for major section heads. Accepts optional `index` prop (numeral, tertiary by default).

### 8.3 `<Subsection>`

Renders Inter `t-subsection`. Used for subsection heads inside a major section.

### 8.4 `<BodyLead>`

Renders Inter `body-lead`. Used for the first paragraph after any head. Slightly larger than default body to create a "lead" feel (newspaper/FT pattern).

### 8.5 `<BodyText>`

Renders Inter `body`. Default body text. Width-capped to `--width-prose` via parent `.lesson-prose` class.

---

## 9. Pilot lesson

### 9.1 Selection

`/lessons/present-value-cashflows-assets-npv` — chosen because:
- Used as the canonical example throughout the existing migration plan
- Rich content: prose, formulas, definition cards, interactive charts, mastery check
- Not trivially short — properly stress-tests the new system
- Already light-theme via compat layer, so the pilot isolates typography/spacing/button work

### 9.2 Pilot deliverables

1. Redesigned lesson using new primitives (`<LessonH1>`, `<LessonH2>`, refined `<Button>`, refreshed shared primitives).
2. Before/after screenshots at desktop 1440×900 and mobile 390×844.
3. Side-by-side comparison image.
4. A short write-up of what changed and why.

### 9.3 Pilot exit gate

User signs off on the feel before any rollout work begins. If the feel isn't right, iterate on the pilot only — do not promote or roll out.

---

## 10. Rollout (after pilot approval)

1. **Promote primitives to tokens.** Lift pilot typography sizes/weights/line-heights into `:root` variables in `app/globals.css`. Lift button variants into scoped CSS.
2. **Promote shared primitive refactors.** Merge refined `SectionHeading`, `DefinitionCard`, `ConceptTag`, `Feedback`, `TryItTag`, `Panel` into `components/lessons/intro-course-overview/shared.tsx`.
3. **Audit hardcoded patterns.** All 46 lessons inspected for:
   - `font-display` at sizes other than `d-hero` / `d-section` → replace with appropriate Inter token
   - Inline `text-[Npx]` font sizes → replace with token utility classes
   - Inline `text-white`, `text-slate-*` outside compat scope → already covered by compat layer; verify
   - Old button class hooks → already covered by Button.tsx refactor
4. **Spot-check 5 representative lessons** at desktop + mobile via `lesson-check.js` (the existing route-wide checker).
5. **Final visual QA pass.** Capture screenshots, run `analyze_image` MCP, document.

---

## 11. Verification

Per the verification-before-completion skill — no completion claims without fresh evidence.

- **Build:** `npm run lint && npm run typecheck && npm run build` after every task. All three must pass.
- **Pilot visual:** before/after screenshots at desktop + mobile, inspected via `analyze_image` MCP (this model cannot read images directly).
- **Rollout visual:** spot-check 5 lessons at desktop + mobile.
- **Automated checker:** existing `lesson-check.js` for SVG label sizes, KaTeX errors, raw LaTeX, dark surfaces, mobile overflow, low-opacity text. All counts must remain at post-remediation levels (0/0/0/0/0/0).
- **Color discipline:** add a checker rule for "max 2 accent hues per screen" if feasible during rollout; otherwise manual spot-check.

---

## 12. Out of scope

- Course map (`/courses`) and course detail (`/courses/[courseSlug]`) — later pass adopting the same tokens.
- Homepage, studio, filings — stay dark; not affected.
- Curriculum content or lesson ordering.
- New lesson authors tooling.
- Charts library replacement (Recharts stays).
- Mobile navigation refactor (only button + typography touch).

---

## 13. Open questions to resolve in plan

These are flagged for the writing-plans phase, not blockers for this spec:

- Whether to introduce new `font-display` weights (currently 400/500/600/700 loaded; pilot may need only 600). Loading fewer weights improves performance.
- Whether `BodyLead` should be a true component or just a `.body-lead` utility class. Plan decides based on usage frequency in the pilot.
- Exact migration order during rollout (which of the 46 lessons first, by module or by complexity).
- Whether to add an automated "max 2 accent hues per screen" checker rule, or leave as manual spot-check.
