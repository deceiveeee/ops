# OPS Competitive Visual Audit

**Date:** 2026-07-25
**Method:** Playwright-rendered browser capture + Z.AI Vision MCP (`analyze_image`) on every screenshot, plus two direct `ui_diff_check` comparisons, plus source verification of one contested vision finding.
**Scope:** 3 benchmarks (Apple, Brilliant, Khan Academy) × 3 viewports + 10 OPS routes × 3 viewports = **57 screenshots**, all analyzed by the vision model. No code was modified during this audit.

> **Methodological note (read first).** Vision-model observations are excellent at *relative* judgments (contrast, hierarchy, alignment, density) and corroborate each other strongly across viewports and across the two `ui_diff_check` runs. They are **unreliable on exact specifics** — the model invents plausible hex codes, px values, and occasionally literal tokens. Where a vision claim was concrete and falsifiable, I verified it against source. One such claim (raw LaTeX on the fixed-income lesson) was **source-verified false** and is recorded as a misread, not a defect. Treat all "≈#ccc / ≈12px" figures in this report as qualitative, not measured.

---

## Executive assessment

OPS has a genuinely strong differentiator — hand-built, instructionally purposeful finance interactives wired into a real curriculum (IOU Machine, Risk Scanner, price-yield curve, portfolio covariance tools, philosophy builder). The **content is competitive with Brilliant and deeper than most consumer finance courses.** The homepage is cinematic and on-brand.

**But OPS still loses to Apple, Brilliant, and Khan Academy on execution polish, not on concept.** The gap is concentrated in four systemic failures, each visible on nearly every page:

1. **Type/contrast debt.** Secondary and metadata text — breadcrumbs, "X LESSONS", durations, source-basis labels, panel captions, the "MOCK / STATIC" disclaimer — is rendered in pale gray that fails readability, and the problem gets worse at smaller viewports. No benchmark ships text this faint this often.
2. **Diagram/chart legibility.** Inline SVG charts and diagrams routinely use 10–11px labels and tiny axis text (home revenue strip, IOU Machine, Risk Scanner, portfolio scatter plots, donut chart, financial-actors diagram). Brilliant and Khan keep instructional labels large enough to read at a glance.
3. **Unfinished concept pages presented as product.** `/studio` is six literal "INTERACTIVE PANEL" placeholders; `/filings` is a "FORM 10-K — MOCK PREVIEW" with a "Static mock data. Not investment advice" footer. Both feel like wireframes, not features.
4. **Inconsistent primitives.** Card radii, borders, shadows, button styling, and column width vary page-to-page and component-to-component. The catalog's two course cards don't even match each other.

Net: OPS reads as **a serious prototype with a great spine and unfinished skin.** The fix surface is design-system and token-level, not architectural.

---

## Overall scores (1–10)

Apple / Brilliant / Khan scores are benchmarks of execution in their domain; OPS scores are explained below.

| Dimension | Apple | Brilliant | Khan | OPS | OPS rationale |
|---|---|---|---|---|---|
| Visual hierarchy | 9 | 8 | 8 | **5** | Headlines are strong; secondary hierarchy collapses because metadata is too faint and CTAs (e.g. underlined "Explore" links) lack weight. |
| Typography | 10 | 8 | 8 | **4** | Good headline type, but pervasive pale-gray secondary text, an over-wide reading column (~900–1000px vs Khan's ~600–700px), and monospace leaking into the IOU Machine. |
| Composition | 9 | 8 | 8 | **5** | Hero and feature sections are well-staged; course/curriculum pages are either dense-cluttered (FF module list) or hollow-sparse (IF curriculum, courses catalog). |
| Readability | 9 | 8 | 9 | **4** | Long line lengths + low-contrast helper text + tiny chart labels drag body and diagram readability below all three benchmarks. |
| Interaction design | — | 9 | 7 | **6** | The interactions themselves are pedagogically strong; they lose points on *finish* (flat, no clear hover/feedback affordance) and dev-tool styling (monospace IOU labels). |
| Educational clarity | — | 9 | 9 | **7** | Concept sequencing, definition cards, worked examples, and mastery checks are serious and clear. This is OPS's strongest dimension. |
| Consistency | 9 | 8 | 8 | **4** | Card radii, borders, shadows, button shapes, and column widths vary across pages and even within pages (4px vs 8px cards; 4px vs 6px buttons). |
| Responsiveness | 9 | 8 | 8 | **6** | Good news: layouts reflow and stack with no horizontal overflow at 1024/390. Bad news: diagrams become illegible at 390, hamburger/lesson-row touch targets are marginal. |
| Perceived finish | 10 | 8 | 8 | **4** | `/studio` ("INTERACTIVE PANEL" ×6) and `/filings` ("MOCK PREVIEW" + mock-data disclaimer) read as wireframes; the catalog imagery is generic; sparse IF curriculum looks incomplete. |

---

## Benchmark observations

### Apple
- **One focal point per section, separated by generous vertical rhythm.** No cards/borders/shadows as crutches — sections are divided by whitespace and background color shifts (`apple-home-desktop`).
- **Type does the hierarchy work.** Massive heavy headlines, short line-length headlines, clearly stepped sub-headings; restraint over decoration.
- **Full-bleed imagery with overlaid/adjacent type**, alternating tall immersive sections with shorter scannable ones (`apple-product-desktop`, `apple-typography-desktop`).
- **Transferable to OPS:** premium-ness comes from *restraint, spacing, and one dominant idea per viewport* — not from gradients or glow.

### Brilliant
- **Problem-first, interactive-first.** Algebra blanks, cursor-over-grid cues, arrow annotations *visually promise* "you will do, not read" (`brilliant-home-desktop`).
- **Uniform card system.** Identical padding/radius/shadow, flat color icons, consistent title/desc/metadata hierarchy across hundreds of cards (`brilliant-courses-desktop`, `brilliant-course-desktop`). "NEW" badges and subject color-coding are consistent.
- **Transferable to OPS:** a single disciplined course-card primitive + large interactive previews beat varied one-off layouts.

### Khan Academy
- **Reading-first.** Content constrained to ~600–700px; clear H1→H2→body weight steps; high-contrast black-on-white (`khan-lesson-desktop`).
- **Navigation clarity + progress everywhere.** Persistent sidebar with unit→lesson indentation, ✓/☐/★ status icons per lesson (`khan-course-desktop`).
- **Predictable chunking.** heading → subtopics → blue "Practice" buttons, repeated identically; the page *feels finished* because every section follows the same rhythm.
- **Transferable to OPS:** a constrained reading column, a consistent lesson shell, and per-item progress markers make dense curricula scannable and trustworthy.

---

## OPS findings by page

### Homepage (`/`) — `ops-home-*`
- Hero is strong (big headline, cyan wave, two clear CTAs). This is the high-water mark of OPS polish.
- **Defects:** every subsequent section's supporting copy is pale-gray and hard to read ("Behind every ticker" subhead; "What the business sells" caption under the `$24.6B` figure; the `Y0–Y4` strip is tiny). The `15.2%` portfolio section's line chart is good but its caption is faint. The promise set by the hero is not sustained in later sections' typography.

### Course discovery (`/courses`) — `ops-courses-*`
- **Defects:** the two course cards use generic abstract imagery and *don't match each other* (different internal spacing/padding). "Hours / Modules / Lessons" metadata is faint and poorly aligned. Secondary "Explore" links are underlined text with no button weight — `ui_diff_check` scored this catalog ~65% match vs Brilliant, flagging card inconsistency, weak metadata contrast, irregular grid rhythm, and underwhelming CTAs. Flat cards, no shadow.

### Course detail — Finance Foundations (`/courses/finance-foundations`) — `ops-course-finance-foundations-*`
- **Defects:** module list is over-dense (tight ~8px spacing, cramped titles). Module numbers are pale gray / low contrast. No progress markers (no checkmarks/states). "Start course" vs "Enter the studio" use different radii. Mixed radii across cards. Some lesson labels ("Interactive lesson" / "Case study") vary in size/color.

### Course detail — Investment Foundations (`/courses/investment-foundations`) — `ops-course-investment-foundations-*`
- **Defects:** the curriculum is "1 module · 1 lesson," and the page wraps it in a large empty gap that reads as **unfinished, not minimal.** Module card (4px) vs lesson card (8px) radius inconsistency. Tiny unlabeled yellow dots under the flow steps look like placeholders. Footer literally says "Static mock data."

### Lesson shell (`app/(learning)/lessons/...`)
- Breadcrumbs ("FINANCE FOUNDATIONS > MODULE 01") are 12px pale gray — hard to read. Sidebar "X LESSONS" and "SOURCE BASIS" labels share the same problem. The lesson shell is otherwise consistent across lessons — a plus — but the prev/next and sidebar metadata inherit the contrast debt.

### Lesson content — "What Is Finance?" (`/lessons/what-is-finance-value-time-risk`) — `ops-lesson-what-is-finance-*`
- **Defects (corroborated by `ui_diff_check` vs Khan, ~60% match):** content column is **too wide (~900–1000px)** vs Khan's ~600–700px ideal, hurting line-length and scannability. The "Main Actors in the Financial System" diagram uses ~11px labels inside circles — illegible. Table headers ("What is it worth?" / "What should I do?") lack weight differentiation. TRY IT (4px) vs Enter the studio (6px) radius mismatch.

### Interactive diagrams — IOU Machine, Risk Scanner (`/lessons/fixed-income-bond-markets-cash-flows-discount-bonds`) — `ops-lesson-fixed-income-iou-riskscanner-purediscount-*`
- The interactives are pedagogically sound. **But** the IOU Machine uses **monospace labels** inconsistent with the surrounding sans-serif lesson (dev-tool feel), its buttons look flat with no clear affordance, and the Risk Scanner's scan-line is too subtle and its risk labels ("Market risk", "Credit risk") are small and faint. These read as "unfinished developer tools," not Brilliant-grade teaching components.

### Charts (cross-cutting) — `ops-home`, `ops-lesson-fixed-income`, `ops-lesson-portfolio-covariance`
- Inline SVG charts consistently ship with 10–11px `font-mono` axis/label text (`PriceYieldCurve` uses `fontSize="10"` in source). On desktop this is borderline; on tablet/mobile the portfolio scatter plots and the fixed-income donut chart lose all label legibility. This is the single biggest reason OPS "looks technical/unfinished."

### Formula displays (cross-cutting)
- Formulas render cleanly via JSX composition (`Frac`/`Var`/`Sub`/`Sup` in `ZeroCouponBondLab.tsx:42-49`) and KaTeX with `throwOnError: false` (`components/ui/Math.tsx:17`). **No raw LaTeX was actually visible** — the desktop vision model's "frac/left(" claim was source-verified as a misread and was *not* reproduced on the tablet/mobile re-analysis of the same lesson. Formula size/spacing is acceptable; not a defect class.
- **Caveat:** because `throwOnError: false` silently swallows KaTeX parse errors into red error text, a live audit should confirm no formula is currently in error state.

### Studio (`/studio`) — `ops-studio-*`
- Clean dark grid, strong heading, good stat hierarchy. **But** all six core "tools" are literal `INTERACTIVE PANEL` placeholders, and the stats are explicitly labeled "MOCK / STATIC · NO LIVE MARKET DATA." This is a concept page, not a feature. The mock-data disclaimer text itself is faint.

### Filings (`/filings`) — `ops-filings-*`
- The main panel is titled `FORM 10-K — MOCK PREVIEW`; the footer says "Static mock data. Not investment advice." The annotation features the page advertises (section pinning, hover-to-explain, jump-to-section) are **described in text but not visually represented** — no pin icons, no highlight states, no callouts. Large empty space below content; a floating "Open the course" button sits disconnected. Reads as a wireframe.

### Mobile experience (390px) — all `ops-*-mobile`
- **Good:** every tested route reflows to a single column with **no horizontal overflow**; primary CTAs go full-width and remain tappable. This is real, working responsive behavior.
- **Bad:** the pale-gray contrast problem gets worse at small sizes; charts/diagrams become illegible; the hamburger and inline lesson-row targets read as marginal (<44px) on several pages. The `what-is-finance` and `portfolio-covariance` mobile vision passes were partly **speculative** ("would likely…") rather than describing the rendered pixels, so treat their specific defect lists as lower-confidence than the desktop/tablet findings.

---

## Critical defects

| # | Severity | Route | Component | Screenshot | Visible evidence | Benchmark comparison | Recommendation |
|---|---|---|---|---|---|---|---|
| 1 | **Critical** | `/studio` | Studio panels | `ops-studio-desktop.png` | Six identical `INTERACTIVE PANEL` placeholders; "MOCK / STATIC" stats | Brilliant surfaces real interactive previews; Apple ships no placeholder UI | Either gate `/studio` behind "coming soon" with a deliberate concept treatment, or ship one real panel. Repeating "INTERACTIVE PANEL" reads as unfinished. |
| 2 | **Critical** | `/filings` | Filing reader | `ops-filings-desktop.png` | "FORM 10-K — MOCK PREVIEW" + "Static mock data. Not investment advice"; advertised annotation features have no visual representation | Khan/Brilliant never ship a described-but-absent feature | Render at least one pin/highlight/annotation affordance on real-looking text, or relabel as concept. |
| 3 | **High** | all lessons + home | secondary text token | `ops-lesson-what-is-finance-desktop.png`, `ops-home-desktop.png`, every course page | Breadcrumbs, "X LESSONS", durations, source-basis, chart captions all pale-gray, below comfortable contrast | Khan keeps all instructional text high-contrast black | Introduce a single `text-secondary` token at WCAG-AA contrast on light backgrounds; audit every `text-slate-400/500` use. |
| 4 | **High** | lessons + home | SVG chart/diagram labels | `ops-lesson-portfolio-covariance-*.png`, `ops-home-desktop.png`, `ops-lesson-fixed-income-*` | 10–11px `font-mono` axis/labels; illegible at tablet/mobile | Brilliant/Khan keep labels ≥13–14px | Enforce a minimum `fontSize` (≥13) on SVG `<text>`; add a chart-label token; test at 390px. |
| 5 | **High** | `/courses`, both course pages, lessons | card/button primitives | `ops-courses-desktop.png`, `ops-course-investment-foundations-desktop.png`, `ops-lesson-what-is-finance-desktop.png` | Module card 4px vs lesson card 8px radius; TRY IT 4px vs Enter the studio 6px; mixed shadows/borders | Brilliant uses one uniform card/button system | Collapse to a single `radius`/`border`/`shadow` scale; one button component family. |
| 6 | **High** | `/courses` | course cards | `ops-courses-desktop.png` | Two cards don't match (spacing/padding); generic abstract imagery; flat, no shadow | Brilliant cards are uniform with rich flat-icon previews | Make one `<CourseCard>` primitive; replace generic abstract art with intentional per-course visuals. |
| 7 | **Medium** | `/courses/investment-foundations` | curriculum block | `ops-course-investment-foundations-desktop.png` | "1 module · 1 lesson" wrapped in a large empty gap; unlabeled yellow dots | Apple uses negative space *with* a focal point | Either add a real focal element (a "continue" card, an intro visual) or tighten spacing so sparseness reads as minimal, not empty. |
| 8 | **Medium** | fixed-income lesson | IOU Machine / Risk Scanner | `ops-lesson-fixed-income-iou-riskscanner-purediscount-desktop.png` | Monospace labels; flat buttons; subtle scan-line; dev-tool feel | Brilliant interactives have clear affordances and feedback styling | Match the surrounding sans-serif; add hover/active states; strengthen the scan-line and risk labels. |
| 9 | **Medium** | lessons (content column) | prose container | `ops-lesson-what-is-finance-desktop.png` (`ui_diff_check` vs Khan) | Column ~900–1000px wide vs ideal ~600–700px | Khan constrains reading width | Cap lesson prose `max-width` (~68ch / ~680px) and center or left-align consistently. |
| 10 | **Medium** | mobile (several) | nav / inline lesson rows | `ops-*-mobile.png` | Hamburger and lesson-row targets read as marginal <44px | Apple/Brilliant/Khan keep tappable rows ≥44px | Enforce a 44px min-height on all tappable rows and the hamburger hit area. |

> **Rejected defect (recorded for rigor):** vision model reported "raw LaTeX (`frac`, `left(`)" on the fixed-income lesson (`ops-lesson-fixed-income-iou-riskscanner-purediscount-desktop.png`). Verified against source: the pure-discount formula is JSX-composed (`Frac`/`Var`/`Sub`/`Sup`, `ZeroCouponBondLab.tsx:42`) and KaTeX uses `throwOnError:false` (`components/ui/Math.tsx:17`). The mobile re-analysis of the same lesson reported "no raw LaTeX." **This is a misread, not a defect.** Recommend a one-time live pass to confirm no KaTeX formula is in error state.

---

## Systemic design problems

These are the *system-level* sources behind the per-page defects — fixing these resolves most of the list at once.

1. **Contrast/secondary-text tokens (root of defects #3).** There is no enforced AA secondary-text token; `text-slate-400/500` is used freely for real content. This is why faint text appears on every single page and worsens on mobile.
2. **Chart-label standard (root of #4).** No minimum font-size or label token for SVG `<text>`. Each inline chart author picks `fontSize="10"` independently.
3. **Component primitives (root of #5, #6).** No single shared `<Card>`, `<Button>`, `<CourseCard>` enforcing radius/border/shadow — hence per-page drift.
4. **Reading-column system (root of #9).** No enforced prose `max-width`; lessons sprawl full content width.
5. **Spacing system (root of #7, and catalog rhythm).** Spacing is per-page ad-hoc, producing both cramped module lists and hollow curriculum gaps.
6. **"Concept vs. product" policy (root of #1, #2).** `/studio` and `/filings` ship as mocks labeled honestly but presented at full nav weight. There's no visual language distinguishing "concept preview" from "shipped feature," so the mocks drag perceived finish down.
7. **Dark-theme residue on light pages (defect #8 adjacency).** Monospace leaking into the IOU Machine and occasional dark elements on light lesson pages suggest the light theme was layered onto components authored for dark.
8. **Diagram touch/legibility at breakpoints (defect #4 mobile).** SVGs scale by width but fixed `viewBox` font sizes don't scale up, so the same 10px label that's borderline at 1440 is unreadable at 390.

---

## Priority roadmap

### Priority 0 — broken or unreadable
- **P0.1** Replace `/studio`'s six `INTERACTIVE PANEL` placeholders: ship one real panel or relabel the page as an explicit concept preview with a distinct, intentional treatment (not "INTERACTIVE PANEL"). *(Defect #1)*
- **P0.2** `/filings`: render at least one real annotation affordance (a pin, a highlight, a callout) on representative text, or relabel as concept. Remove the disconnected floating "Open the course" button. *(Defect #2)*
- **P0.3** Fix SVG chart/diagram label sizes site-wide to a ≥13px floor; verify portfolio scatter plots, fixed-income donut, home revenue strip at 390px. *(Defect #4)*

### Priority 1 — visibly unfinished
- **P1.1** Introduce and enforce a WCAG-AA secondary-text token; replace faint breadcrumbs/metadata/source-basis/chart captions. *(Defect #3)*
- **P1.2** `/courses/investment-foundations`: resolve the hollow curriculum — add a focal element or tighten spacing so the page reads as minimal, not empty. *(Defect #7)*
- **P1.3** Polish IOU Machine + Risk Scanner: sans-serif labels, hover/active states, stronger scan-line, larger risk labels. *(Defect #8)*

### Priority 2 — quality and consistency
- **P2.1** Unify card/button primitives (single radius/border/shadow scale; one `<CourseCard>`, one `<Button>` family). *(Defects #5, #6)*
- **P2.2** Cap lesson prose column to ~680px / ~68ch. *(Defect #9)*
- **P2.3** Enforce ≥44px touch targets on hamburger and lesson rows. *(Defect #10)*
- **P2.4** Define a spacing scale and apply to module lists (FF) and curriculum blocks (IF).

### Priority 3 — premium refinement
- **P3.1** Course catalog: replace generic abstract card art with intentional per-course visuals; add subtle shadow/depth matching Brilliant.
- **P3.2** Strengthen homepage section typography so later sections sustain the hero's polish (larger captions, less reliance on pale gray).
- **P3.3** Add lesson-level progress markers (✓/in-progress) on module lists, à la Khan, to make curricula feel finished and navigable.

---

## Comparison summary (direct, screenshot-based)

| OPS page | Closest benchmark | The concrete gap |
|---|---|---|
| Homepage | Apple | Hero matches Apple's restraint; later sections lose Apple's type discipline (faint captions, tiny `Y0–Y4`). |
| Course discovery | Brilliant courses | `ui_diff_check` ~65% match. Brilliant = one uniform card system + rich icons; OPS = two mismatched cards + generic art + faint metadata. |
| Course detail | Brilliant course detail | Brilliant previews each lesson with an icon; OPS lists lessons as plain rows with faint durations and no progress markers. |
| Lesson page | Khan lesson | `ui_diff_check` ~60% match. Khan constrains reading width and keeps all text high-contrast; OPS runs wide (~900–1000px) with faint helper text and tiny diagram labels. |
| Interactive components | Brilliant | OPS interactives are pedagogically competitive but stylistically raw (monospace, flat affordances); Brilliant's look finished and inviting. |
| Information density / restraint | Apple | Where Apple's empty space is deliberate (one focal point), OPS's empty space (IF curriculum, `/filings`) reads as unfinished. |

---

## Appendix — what was captured and analyzed

- **Benchmarks captured:** 9 (Apple ×3, Brilliant ×3, Khan ×3) × 3 viewports = 27.
- **OPS routes captured:** 10 (`/`, `/courses`, `/courses/finance-foundations`, `/courses/investment-foundations`, `/lessons/what-is-finance-value-time-risk`, `/lessons/fixed-income-bond-markets-cash-flows-discount-bonds` [IOU Machine + Risk Scanner + pure-discount formula, all in one lesson], `/lessons/portfolio-risk-covariance-correlation`, `/lessons/if-1-1-how-an-investor-builds-a-philosophy`, `/studio`, `/filings`) × 3 viewports = 30.
- **Vision analyses run:** `analyze_image` on all 57 screenshots + 2 `ui_diff_check` runs.
- **Note on route mapping:** the IOU Machine, Risk Scanner, *and* pure-discount-bond formula are all in a single lesson (`fixed-income-bond-markets-cash-flows-discount-bonds` / `Lesson3_1`), captured once as `ops-lesson-fixed-income-iou-riskscanner-purediscount-*`.

See `docs/visual-qa/competitive-audit/index.md` for the per-screenshot evidence index.
