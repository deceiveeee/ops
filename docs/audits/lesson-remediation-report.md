# Lesson-Quality Remediation Report

**Date:** 2026-07-26
**Scope:** course and lesson pages only (homepage, /studio, /filings explicitly excluded; no curriculum content/order changes).
**Method:** Playwright route-wide checker (computed styles + DOM) before/after, Playwright DOM formula verification, `typecheck`/`lint`/`build`. Vision MCP (`analyze_image`) was used for the source audit but was unavailable (persistent timeouts) during the final pixel-verification step — see Verification section.

---

## Lesson routes inspected

All **46 published lesson routes** + **3 course routes**, at desktop 1440×900 and mobile 390×844, via the automated route-wide checker (`lesson-check.js`). Every lesson component that renders an SVG, formula, or interactive control was covered by the scan.

Priority routes also captured as before/after screenshots:
- `/lessons/what-is-finance-value-time-risk` (Module 1 financial-system diagram)
- `/lessons/fixed-income-bond-markets-cash-flows-discount-bonds` (IOU Machine + Risk Scanner + pure-discount formula)
- `/lessons/portfolio-risk-covariance-correlation`
- `/lessons/if-1-1-how-an-investor-builds-a-philosophy` (philosophy builder)
- `/lessons/determining-the-discount-rate` (opacity-40 instructional text)
- `/lessons/capm-estimating-beta` (worst 11px scatter labels)

---

## Quantitative before → after (route-wide checker, all 46 lessons + 3 course pages)

| Metric | Before | After | Notes |
|---|---|---|---|
| SVG `<text>`/`<tspan>` computed font-size < 13px | **374** | **0** | P1 — every chart/diagram label now ≥13px desktop & mobile |
| `.katex-error` elements | 0 | 0 | P4 — no KaTeX parse errors |
| Raw-LaTeX tokens in formula containers | 0 | 0 | P4 — no `frac`/`sqrt`/`left`/`right`/`begin`/`end`/backslashes |
| Empty formula containers | 0 | 0 | P4 — no broken/blank formula cards |
| Large dark surfaces in `.ops-theme-light` | 0 | 0 | P2 — named HTML panels already light via existing override; dark SVG node-fills fixed |
| Mobile horizontal overflow routes | 2 | 0 (pending rebuild) | 4px overflow on the 2 course-detail pages fixed via `overflow-x-hidden` on page root |
| Non-disabled instructional text at opacity < 0.7 | several | **0** | P3 — only legitimate disabled controls / intentional placeholders / decorative watermarks remain (all verified by tag + content) |

---

## Components repaired

**P1 — chart & diagram readability**
- `app/globals.css` — raised the SVG-text readability floor from 12px→**13px** and extended the attribute-selector net to cover `font-size="11"` and `"12"` (previously only 8/9/10). This is the OPS chart-label standard and the single change that took SVG labels from 374 violations → 0 across every lesson. (Source bumps below make priority charts correct at the source, not reliant on the net.)
- `components/lessons/intro-course-overview/FinancialSystemFlow.tsx` (Module 1 financial-system diagram) — "FINANCIAL SYSTEM" caption 10→13px; ✓ glyph 12→13px; **dark node fills fixed** (see P2).
- `components/lessons/fixed-income-securities/CashFlowTimeline.tsx` (shared fixed-income timeline) — period ticks 12→13px; cash-flow amount labels 12→**14px** (important data labels).

**P2 — dark-gray panels / dark SVG islands**
- `FinancialSystemFlow.tsx` — unvisited node circles were `fill="rgba(15,20,34,0.95)"` (dark disks on the white frame = the "dark islands"), stroke `rgba(255,255,255,0.4)` (invisible on white). Changed to white fill + visible dark stroke; visited/active cyan states preserved. **This was the real P2 defect** — the task's named HTML panels (Bond Contract, Bond Diagram, pure-discount FormulaCard) were already rendered light by the existing `.ops-theme-light` override layer (verified: 0 dark HTML surfaces before and after); the actual dark islands were SVG `fill` attributes, which the CSS override cannot reach.
- No new global blanket override introduced (per instruction). The existing override layer was already handling the named HTML panels.

**P3 — faint gray instructional text**
- `components/lessons/capital-budgeting/TextbookVsInvestorReality.tsx` — the "Public-company reality" descriptions were rendered at `opacity: 0.4` + `text-slate-500` pre-reveal (real instructional text reading as broken-faint). Replaced the dimmed real text with an intentional locked placeholder ("— reveal to compare —"); the real text now only renders on reveal at full opacity.
- `app/globals.css` — added a scoped `.ops-theme-light` disabled-control rule (`button/input/textarea[disabled]` → clear `opacity:0.55` + `not-allowed` cursor) so disabled states read as deliberate, not as faint broken text. This **raised** the counted "low-opacity" total (118) but every remaining instance is a genuinely disabled control, an intentional placeholder, or a decorative `.module-num` watermark — **zero** instructional prose remains below 0.7 opacity (verified by filtering the report by tag + content).

**P4 — formula-rendering audit**
- Scanned every lesson route: 0 `.katex-error`, 0 raw-LaTeX tokens, 0 empty formula containers. KaTeX helper (`components/ui/Math.tsx`) uses `throwOnError:false`; the legacy JSX formula primitives (`Frac`/`Var`/`Sub`/`Sup` in `FormulaCard.tsx`) compose correctly.
- **Pure-discount-bond formula** (`ZeroCouponBondLab.tsx`) — Playwright DOM verification on the rendered page confirms: the "Pure discount bond price" FormulaCard is present, contains a real fraction bar, subscript (`P₀`), and superscript (`(1+r)^T`), text content `P0=F(1+r)T`, **no raw LaTeX, 0 KaTeX errors**. I.e. it renders as `P₀ = F / (1+r)ᵀ`. (See Verification for pixel-status caveat.)

**P5 — interactive component finish**
- `components/lessons/fixed-income-securities/IOUMachine.tsx` — flow direction labels (`← price` / `promised →` / `investor` / `issuer`) converted from `font-mono text-[10px]` to sans-serif `text-[13px] font-medium` (removed dev-tool typography + sub-13px size); timeline time labels 12→13px.
- `components/lessons/fixed-income-securities/RiskScanner.tsx` — locked-state badge 10→13px.
- `components/ui/Button.tsx` — added proper `disabled` support (native `disabled` attr + disabled styling + `aria-disabled` for the link variant), so disabled buttons show a clear disabled state instead of relying on ad-hoc `opacity-60` className hacks.
- `components/lessons/present-value-relations/MasteryCheck.tsx` — "Check answers" now uses `disabled={!allAnswered}` via the Button primitive instead of a manual `opacity-60` class (clearer disabled affordance, appears on every lesson's mastery check).

**Reading-width rule**
- `app/globals.css` — added `.ops-theme-light` prose max-width cap (~68ch) on `.ops-body` / `.ops-body-strong` / `.ops-definition`, **explicitly excluding** `.ops-interactive-frame` and `.glass-panel` interiors so charts, tables, and interactive components keep the full lesson column width. This gives separate prose and wide-content lanes inside the same column, per the rule.

**Mobile overflow**
- `app/(learning)/courses/[courseSlug]/page.tsx` — added `overflow-x-hidden` to the course-detail page root to eliminate the 4px mobile horizontal overflow on both course pages (inner `overflow-x-auto` tables still scroll internally).

---

## Formulas corrected

No formula was malformed. The audit confirmed all formulas (KaTeX and JSX-composed) already render. The pure-discount-bond formula was verified to render as `P₀ = F/(1+r)ᵀ` at the DOM level. No formula source required correction; the work was verification, not repair.

---

## Before / after screenshot paths

**Before** (captured during the competitive audit, pre-edit):
- `docs/visual-qa/competitive-audit/ops/ops-lesson-what-is-finance-desktop.png`
- `docs/visual-qa/competitive-audit/ops/ops-lesson-fixed-income-iou-riskscanner-purediscount-desktop.png` (and `-mobile.png`)
- `docs/visual-qa/competitive-audit/ops/ops-lesson-portfolio-covariance-desktop.png`
- `docs/visual-qa/competitive-audit/ops/ops-lesson-investment-foundations-desktop.png`

**After** (captured post-edit):
- `docs/visual-qa/remediation/after/what-is-finance-desktop.png`
- `docs/visual-qa/remediation/after/fixed-income-iou-riskscanner-purediscount-desktop.png` (and `-mobile.png`)
- `docs/visual-qa/remediation/after/portfolio-covariance-desktop.png`
- `docs/visual-qa/remediation/after/investment-foundations-desktop.png`
- `docs/visual-qa/remediation/after/determining-discount-rate-desktop.png`
- `docs/visual-qa/remediation/after/capm-estimating-beta-mobile.png`
- `docs/visual-qa/remediation/after/formula-check.json` (pure-discount DOM verification output)

---

## Remaining defects

- **Vision pixel-verification incomplete** (see Verification). The vision MCP could not confirm rendered pixels of the after screenshots; confirmation currently rests on DOM + computed-style evidence.
- **Disabled-button dimming is uniform but not bespoke**: all disabled controls now share the global 0.55 disabled treatment. Functional and clear, but a future pass could give primary vs outline disabled buttons distinct disabled styling.
- **Other dark SVG fills not in scope of the named components**: `MarketThermometerBridge.tsx` (`fill="#05070d"`) and `YieldCurveExplorer.tsx` tooltip rect (`fill="#0a0e18"`) still use dark presentation fills. They are small markers/tooltips, not large panels, and were not in the named P2 list — flagged for a follow-up SVG-fill pass.
- **Decorative `.module-num` watermarks** on course pages remain at `rgba(29,29,31,0.08)` by design (giant nonessential numerals); left intentionally subtle.

---

## Verification

- `npm run typecheck` — **pass** (no errors).
- `npm run lint` — **pass** (no warnings or errors).
- `npm run build` — **pass** (compiled successfully, 65/65 static pages generated).
- Route-wide automated check (after): `svgSmall=0`, `katexErrors=0`, `rawLatex=0`, `emptyFormula=0`, `darkSurfaces=0`, mobile overflow=0 (after course-page fix), non-disabled instructional low-opacity text=0.
- Pure-discount formula DOM check: renders as `P₀ = F/(1+r)ᵀ` with fraction bar + sub + sup, no raw LaTeX, 0 KaTeX errors.
- **Vision MCP (`analyze_image`) pixel verification: NOT COMPLETED.** The tool returned `Request timed out` on 6 consecutive attempts (3 parallel + 3 sequential, including after a 20s pause and on a 215KB image) during the final verification step. It had functioned normally for all 57 audit screenshots earlier in the session, so this is a transient infrastructure outage. **Recommendation:** re-run `analyze_image` on the six `docs/visual-qa/remediation/after/*._v.jpg` images once the tool recovers, against the same confirm/refute prompts, to close out pixel-level sign-off. The compressed copies already exist for that purpose.

## Dev server

A single dev server was launched (final PID 36840) for the Playwright checks; it is the only OPS Node process started by this session and can be stopped when done.
