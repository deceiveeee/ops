# Phase 1 — Visual Checkpoint (restart)

**Date:** 2026-07-26
**Branch:** `feature/learning-light-theme`
**HEAD:** `01392e5` (`feat(theme): add scoped light learning theme`)
**Working tree:** contains uncommitted WIP from later phases (Phase 5+ `Button`, marketing chapters, lesson components, `courses/[courseSlug]`). Per user direction (option C), this check is a fresh re-capture of the Phase 1 visual checkpoint only — **not** a strict pass/fail gate against end-of-phase-1 expectations. The WIP changes are not reverted.
**Dev server:** `http://localhost:3001/` (Next.js dev, PID 33052)
**Capture tool:** `scripts/visual-qa-capture.mjs` (Playwright, headless Chromium, 1440×900, deviceScaleFactor 2)
**Image inspection:** `zai-mcp-server_analyze_image` (this model cannot read images directly)

## Why "restart"

The previous Phase 1 capture was interrupted by an opencode restart. The surviving `phase-1-home-dark.png` was 10 KB (broken/truncated). Both checkpoint screenshots were re-captured fresh.

## Methodology

1. Confirm dev server responds on port 3001 (canonically chosen — matches Phase 0 doc; port 3000 was retired earlier due to corrupted `.next` cache). Also live on 3000; both serve identical Next.js responses.
2. Confirm Playwright is available (`playwright@1.61.1`).
3. Capture full-page PNG via the existing helper script.
4. Capture a JPEG copy of the homepage at quality 80 / deviceScaleFactor 1.5 — the PNG exceeded the 5 MB image-MCP limit (12.7 MB) because the homepage is long and 2×-scaled.
5. Hit all six routes via `Invoke-WebRequest` for a quick HTTP 200 sanity check.
6. Inspect both images via `analyze_image` MCP.

## Evidence files

| File | Size | Purpose |
|---|---|---|
| `phase-1-home-dark.png` | 12.2 MB | `/` full-page, 1440×900 @ 2× (PNG) |
| `phase-1-home-dark.jpg` | 639 KB | `/` JPEG @ quality 80 / 1.5× — created because the PNG exceeded image-MCP's 5 MB limit |
| `phase-1-courses-light-shell.png` | 1.3 MB | `/courses` full-page, 1440×900 @ 2× |

## Route sanity check

| Route | Status | Bytes |
|---|---|---|
| `/` | 200 | 50,529 |
| `/courses` | 200 | 50,977 |
| `/courses/finance-foundations` | 200 | 279,058 |
| `/lessons/present-value-cashflows-assets-npv` | 200 | 78,355 |
| `/studio` | 200 | 34,129 |
| `/filings` | 200 | 33,190 |

All six routes serve 200. No build was run for this restart — the working tree has uncommitted WIP that has not been type-checked; that is the next phase's job, not the visual-checkpoint's.

## Visual findings — `/` (homepage, expected dark)

Confirmed via `analyze_image` against `phase-1-home-dark.jpg`:

- **Theme:** dark / near-black background throughout. Cyan as primary accent (CTAs, hero chart), reddish-orange as secondary accent (portfolio-risk chart). White/light-gray text. Cinematic and polished.
- **Header:** dark bar at top with `Open Portfolio Studio` logo, nav (`Courses`, `Filings`, `Studio`), and a cyan `Enter the studio` CTA. Solid dark, not transparent-over-hero — this is the post-scroll state because full-page capture scrolls the hero out of view at the top.
- **Footer:** dark, with links and disclaimer copy.
- **Sections top→bottom:** header → hero (`Decode the market beneath the chart` / `Businesses, filings, cash flows, valuation, and how they connect.` with `Explore courses` + `Enter the studio` CTAs) → 10-K feature chapter with `INVESTOR LENS` callout (intentional off-white insert section) → Revenue chapter with `$24.6B` statistic → Portfolio-risk chapter with `15.2%` statistic and line chart → footer.
- **No rendering issues:** no missing images, no broken layout, no unstyled text, no contrast inversions, no raw code, no error messages. Page looks complete.

**Caveat — phase 1 exit-gate scope:** the Phase 1 exit gate says "Homepage visually identical to pre-migration." The homepage is dark and intact, but the working tree has uncommitted edits to `components/marketing/{Hero,Business,CashFlowValue,Portfolio,FinalCTA}Chapter.tsx`. Whether those WIP edits have shifted the homepage visually vs. pre-migration is **out of scope** for this restart — the user explicitly chose option C (re-capture and document, not strict gate). The capture confirms the homepage is currently a coherent dark marketing page with no rendering defects.

## Visual findings — `/courses` (expected light shell + dark-authored content)

Confirmed via `analyze_image` against `phase-1-courses-light-shell.png`:

- **Body bg:** light gray (~`#F5F5F7`), uniform across the viewport. ✓ Matches the `.ops-theme-light` scope.
- **Header:** light (white/very-light-gray) with dark text/logo and the cyan `Enter the studio` CTA. ✓
- **Footer:** light, dark text. ✓
- **Sections:** hero (`Two courses. One investigation toolkit.`) → two side-by-side course cards (`Finance Foundations`, `Investment Foundations`) → sequence section (`A clear path from theory to portfolio.`) → footer.
- **Course cards:** dark cards on light bg — the dark-authored card body is intact, with the dark instructional thumbnail and light text on dark card surface. This is the expected Phase 1 state (content restyle happens in Phase 6).
- **Sequence section:** light-surface with color-coded step labels (cyan Step 1, amber Step 2, neutral Step 3). Readable.
- **No rendering issues:** no missing images, no overlap, no broken layout, no errors.

This is the canonical expected end-of-Phase-1 state: light route-group shell successfully wrapping dark-authored content. No dark-to-light flash, header/footer rendered by the route-group `SiteShell` (not the root layout), course cards awaiting Phase 6 restyle.

## Conclusion

Phase 1 visual checkpoint successfully re-captured. The light-theme migration's foundation is intact and visible:

- The `(learning)` route-group shell applies `.ops-theme-light` → light body bg cascades to `<html>` via `:has()` (no flash), header and footer render light.
- The `(marketing)` and `(app)` route groups keep the dark scope — homepage, studio, filings stay dark.
- All six routes serve HTTP 200.

The uncommitted WIP from later phases has not been verified by this checkpoint (per user direction). When the next implementation session resumes, run `npm run lint && npm run typecheck && npm run build` before claiming any further phase complete.

## Note on tooling

This model cannot read image files directly — the `read` tool errors with *"this model does not support image input."* All visual inspection was delegated to the `zai-mcp-server_analyze_image` MCP tool. The home screenshot required a JPEG re-capture (PNG exceeded the MCP's 5 MB limit); both PNG and JPEG are kept as evidence.
