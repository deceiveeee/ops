# Studio research workspace: implementation ledger

Tracks [`studio-research-workspace-handoff.md`](../agent-prompts/studio-research-workspace-handoff.md).
Update this at every checkpoint. A later session should be able to resume from this file alone.

Branch: `feat/studio-workspace`. Started 2026-09-05.

## Milestone status

| Milestone | Status | Evidence |
| --- | --- | --- |
| M0 inspect and map | **Complete** | [`studio-research-coverage.md`](../source-audits/studio-research-coverage.md); this ledger |
| M1 data and method feasibility | **In progress** | [`studio-data-coverage.md`](../source-audits/studio-data-coverage.md) — D1 and D2 both resolved with measurements; four build items outstanding |
| M2 project state and recovery | **In progress** | v2 schema, migration and operations in `lib/studio-project/`; 16 tests. Storage adapter and conflict handling still to do |
| M3 complete stock prototype | Not started | |
| M4 curate and generalize | Not started | |
| M5 complete basic portfolio loop | Not started | |
| M6 quantitative comparison | Not started | |
| M7 simulation and robustness | Not started | |
| M8 publication preparation | Not started | |

## M0 record

### Done

- Read the handoff in full (446 lines).
- Read both user PDFs by text extraction: strategy 134 pages, report 18 pages. Resolved a
  page-count discrepancy — the session attachment claimed 23 pages for a 134-page file.
- Extracted the team's complete process into a 22-stage map, every stage given a destination.
- Transcribed the exact screening formulas, metric definitions and bank substitutions.
- Recorded five documentary discrepancies between the report and strategy documents.
- Recorded seven unresolved method questions in the screening specification.
- Retrieved and read Morgan Stanley's *Measuring the Moat*, including its explicit checklist,
  and identified nine concepts absent from the handoff's F3.
- Verified live that the SEC XBRL company-concept API returns filed financial figures with
  accession and date — the candidate solution for dependency D1.
- Inventoried the Studio code and confirmed the research-inside-holding schema defect by
  reading `lib/studio.ts`.

### Not done, deliberately

- Visual reading of strategy pp. 8-10 (workbook layout) and pp. 128-134 (weights and risk
  charts). Text extraction returns captions only; the substance is in images. Deferred to M1
  and M6 where those numbers are actually used. **No claim is made about their content.**
- Claim-level reading of *ROIC and the Investment Process*. Retrieved to
  `tmp/pdfs/firm-process/`, not yet read. Deferred to M3.
- Any code change. M0 is a mapping milestone.

### Baseline before any change

Observed 2026-09-05: `npm run typecheck` clean; `npm test` 396 passing across 34 files;
`npm run test:e2e` 53 passing, 3 skipped. No e2e test covers `/studio`. Studio screen budget
1.68 screens at 1440 and 2.44 at 390, against the project's 1.5 limit.

## Decisions taken

| # | Decision | Reason |
| --- | --- | --- |
| 1 | Treat the team's screening formula as a labeled historical example, never an OPS default | Handoff §F2; the team themselves call the z-scores a ranking device, not a distance |
| 2 | Do not cite an industry count for the team's universe | The two documents say nine and ten; unreconciled |
| 3 | Describe the ensemble as MV/ERC/CVaR, not "all four optimizers" | HRP is one of the four but receives 0% weight in the stated mix |
| 4 | Adopt SEC XBRL as the primary candidate for company fundamentals | Free, official, per-figure accession and date; verified live |
| 5 | Treat price history as the highest-risk dependency, resolved early in M1 | It gates F2 momentum, F7 covariance, F9 simulation and F10 worksheet |
| 6 | Carry the Morgan Stanley checklist concepts into the F3 design | The user asked for institutional procedure; this is a free, citable, dated primary source, and the team already adapted it |

## Open questions for the user

Neither blocks M1 work starting. Both are recorded now because they change scope, and the
handoff asks that paid-source requirements never be hidden.

1. **ESG data is paid.** The team's process weights ESG at 15% of the composite score and adds
   carbon, water and controversy penalties, all from S&P Global. The strategy document records
   that S&P Global "requires a premium" and that the team substituted a neutral score where it
   was unavailable. OPS cannot redistribute those scores. Options are to scope ESG out of the
   screen, to find a permitted alternative source, or to support user-entered scores with their
   own provenance. No decision is needed until M4.
2. **Analyst price targets** were the team's Black-Litterman views, taken from Yahoo Finance.
   Bulk redistribution terms are not established. Black-Litterman can ship with user-stated
   views instead, which is arguably better teaching. Flagged for M6.

## M1 record

### Established

- **D1 tested and answered.** SEC XBRL probed directly for Atkore and Fifth Third. One metric
  definition cannot span sectors: the bank reports no gross profit, no cost of revenue and no
  operating income, so two of the team's five Business Quality inputs are uncomputable for it.
  Metric templates must be per-sector.
- **The bank revenue trap found.** A generic revenue lookup on Fifth Third returns $577M dated
  2023 — a fee-revenue subset — while net interest income is $5,982M in 2025. Wrong by roughly
  tenfold, stale by two years, and completely silent, because the field is populated. Every
  metric needs an explicit concept mapping per sector, recorded per number.
- **D2 resolved.** Commercial feeds were the wrong place to look. Tiingo and Alpha Vantage free
  tiers are internal-use only; Stooq's terms could not be established. The answer is
  public-domain SEC data: N-PORT positions carry a share count and a USD value, so price =
  value ÷ shares. All three worries about it were then measured and cleared.
  - **Accuracy.** VTI and VOO both reported 2026-03-31 and share 487 securities. Their
    independently filed implied prices agree to within 0.01% for **486 of 487**, median
    difference exactly zero. Apple $253.79 in both, NVIDIA $174.40 in both. The one outlier is
    an internal money-market fund with a different unit convention.
  - **Valuation level is geographic.** VTI is 100.25% Level 1 — real quoted prices. VXUS is
    88.24% Level 2 — fair values adjusted after foreign exchanges close. Both usable, not the
    same thing, and the interface must say which.
  - **Frequency.** Trusts have different fiscal year-ends, so pooling eight of them gives 12 of
    12 months in 2024, 12 of 12 in 2025 and 6 of 6 so far in 2026. iShares Trust alone files
    monthly. This matches the monthly frequency the team used.
  - **Unmeasured caveat.** This shows some fund reported at each month end, not that a given
    security was held by one. Per-security coverage needs checking when the universe is fixed,
    and sparse names must show their real observation dates rather than an interpolated line.
- **Maths inventory complete.** Reusable as-is: `lib/fixed-income.ts`, `lib/risk-return.ts`,
  `lib/allocation-policy.ts`, `lib/operating-plan.ts`, `lib/valuation-basics.ts`,
  `lib/northstar-case.ts`. `lib/portfolio-theory.ts` is **three-asset only** — its solvers call
  an `inv3x3` helper — and unconstrained. Quantiles, winsorization, z-scores, covariance
  matrices, general linear algebra, constrained optimisation, WACC and CAPM as functions,
  accrued interest, and diversification measures do not exist and must be written. Six modules
  carrying most of the maths have **no tests**.
- **Atkore is a good prototype for an unexpected reason.** Its latest year shows net income of
  −$15,175,000 and EPS of −$0.45, exercising both the deteriorating-profitability tension the
  handoff wants taught and the undefined-earnings-yield method question.

## M2 record

### Done

- **Schema v2** in `lib/studio-project/schema.ts`. A `CandidateInvestigation` is now a
  first-class record; a `PortfolioPosition` only points at one. `PortfolioAlternative` supports
  named comparisons, and `DecisionRecord` gives changed inputs somewhere to record their cause.
- **Non-destructive migration** in `migrate.ts`. The original v1 text is kept byte-for-byte on
  `migratedFrom.raw`, so a migration bug can never be why a learner loses work. A newer unknown
  schema is refused and handed back rather than coerced.
- **Operations** in `operations.ts`. `removePosition` removes a position and nothing else.
- **16 tests**, including one that pins the *old* behaviour: it runs v1's `removeStudioHolding`
  and asserts the research is gone from the serialized plan. The contrast is demonstrated
  rather than claimed, and it guards against anyone reintroducing research-inside-holding.

### Deliberate deviation from the plan

The plan named `lib/studio/` for this code. `lib/studio.ts` already exists and has three
importers, so a same-named directory is a module-resolution hazard — the handoff warns about
exactly this. v2 is therefore additive in **`lib/studio-project/`**, touching nothing that
works today. Consolidation behind a compatibility facade belongs with the milestone that
actually switches the UI over.

### Still to do in M2

- Storage adapter, with IndexedDB for the larger research state.
- Multi-tab conflict detection and failed-save reporting carried over from `use-studio-plan.ts`.
- Backup import and export round trips on the v2 record.
- The dependency graph that marks downstream work `needs review` when an input changes.

### Next concrete action

1. Build the price-snapshot ingestion: pool N-PORT filings across trusts, exclude non-share unit
   types, and record the fair-value level with every observation.
2. Field inventory for one complete investigation and one portfolio comparison.
3. Confirm permitted use of Damodaran's NYU industry data files.
4. Read strategy pp. 8-10 as images before designing the screen surface.
5. Build the per-sector concept-mapping tables that Findings 1 and 2 require.

M2 schema work is source-independent and proceeds in parallel while price data is unresolved.

## Working files

| Path | Contents | Durable? |
| --- | --- | --- |
| `tmp/pdfs/wic-strategy-review/` | 134 page renders plus `strategy.txt` | No — scratch |
| `tmp/pdfs/wic-report-review/` | 18 page renders plus `report.txt` | No — scratch |
| `tmp/pdfs/firm-process/` | Morgan Stanley papers and extraction | No — scratch, retrievable |
| `docs/source-audits/studio-research-coverage.md` | The M0 map | Yes |
| This file | The ledger | Yes |

The user's PDFs and the Morgan Stanley papers are not redistributed in the repository. `tmp/`
is gitignored.
