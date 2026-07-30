# Phase 3 Visual Spot-Check — Premium Typography Rollout

**Date:** 2026-07-29
**Commit under test:** `6ecbdd2` `refactor(typography): roll out premium system across all lessons`
**Prior gates:** `tsc --noEmit` ✅ / `next lint` ✅ / `next build` ✅ (65/65 pages)
**Method:** Playwright (chromium) full-page captures against `next dev`, `prefers-reduced-motion: reduce`, scroll-through to mount `whileInView` reveals. 12 captures: 6 pages × {desktop 1440, mobile 390}.

## Pages captured

| Key | Route | Module |
|---|---|---|
| home | `/` | marketing homepage (hero + chapters) |
| fi | `/lessons/fixed-income-spot-rates-forward-rates-yield-curves-coupon-bonds` | Fixed-Income |
| equities | `/lessons/equity-gordon-growth-model` | Equities |
| portfolio | `/lessons/portfolio-risk-covariance-correlation` | Portfolio Theory |
| capbudget | `/lessons/irr-and-payback` | Capital Budgeting |
| em | `/lessons/active-vs-passive-investing` | Efficient Markets |

## Findings: PASS

All six pages render correctly on desktop and mobile. No regressions introduced by the monospace→Inter rollout.

| Check | Result |
|---|---|
| Monospace leakage | ✅ None. No monospace/courier typeface anywhere. |
| Table numeric alignment | ✅ Columns align; decimal points line up (desktop + mobile). |
| Mobile overflow / cut-off | ✅ None. Right margins clean, no horizontal overflow. |
| Layout integrity | ✅ No overlap, no broken sections, no horizontal scroll. |
| Type hierarchy | ✅ Fraunces serif headings + Inter sans body across lessons. |
| Formula legibility | ✅ Subscripts/fractions readable (Gordon, variance, IRR). |

## Key nuance — tabular-nums vs monospace

The vision analysis flagged one table value (`0.797`) as "monospaced" because its digits are equal width. This is **Inter tabular-nums working as designed**, not a monospace font — equal-width *numerals* inside a proportional *typeface* is exactly what aligns numeric columns. Per the AGENTS.md rule, IBM Plex Mono is no longer loaded and the Tailwind `mono` token is remapped to Inter, so no monospace font is available to render. Confirmed by the counter-observation that `$100` reads as proportional (`1` narrower than `0`). This is intended behavior, not a defect.

## Evidence quotes (grounded re-checks)

- **fi-mobile** table "1.4 What is a zero-coupon bond": Maturity / Price / Rate headers; `0.797`, `3.41%`, `0.605`, `5.13%` vertically aligned, no right-edge cut-off.
- **capbudget-mobile** table: INITIAL INVESTMENT / YEAR 1–5; `$100`, `$30`, `$40`, `$35` aligned, no overflow.
- **portfolio-desktop**: `σ²ₚ = w²ₐσ²ₐ + w²ᵦσ²ᵦ + 2wₐwᵦσₐσᵦρₐᵦ` proportional; covariance matrix cells and "75/25 portfolio" VALUE column decimals aligned.
- **equities-desktop**: `P = D₁/(r−g)` legible; "Sensitivity to the r−g gap" table right-aligned.

## Notes / follow-ups

- A **stale dev server from a prior session was squatting port 3000** and returning 404 for every route (a latent footgun for future captures). The live server for this QA ran on 3001. Recommend not leaving orphaned `next dev` processes running.
- One initial capture pass wrote to a stray `%20`-encoded path due to a Windows `URL.pathname` quirk in the capture script; fixed via `fileURLToPath`. The committed `capture.mjs` is the corrected version.
- Homepage marketing hero headline reads as bold sans (not Fraunces). This predates the rollout (unchanged by it) and is a marketing-section design choice, not a regression.

## Conclusion

The 344-file premium-typography rollout is visually clean. **Phase 3 QA gate passed.** Safe to push and/or close out the plan.
