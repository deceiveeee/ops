# Studio research workspace: implementation ledger

Tracks [`studio-research-workspace-handoff.md`](../agent-prompts/studio-research-workspace-handoff.md).
Update this at every checkpoint. A later session should be able to resume from this file alone.

Branch: `feat/studio-workspace`. Started 2026-09-05.

## Milestone status

| Milestone | Status | Evidence |
| --- | --- | --- |
| M0 inspect and map | **Complete** | [`studio-research-coverage.md`](../source-audits/studio-research-coverage.md); this ledger |
| M1 data and method feasibility | **In progress** | [`studio-data-coverage.md`](../source-audits/studio-data-coverage.md), [`studio-price-snapshot.md`](../source-audits/studio-price-snapshot.md), [`studio-metric-mapping.md`](../source-audits/studio-metric-mapping.md). D1 and D2 resolved; price ingestion and per-sector metric mapping both built and run. Two build items outstanding |
| M2 project state and recovery | **In progress** | v2 schema, migration, validation, IndexedDB/session storage, atomic conflicts, backups and recovery implemented; saved investigations added to the schema with migration (`85101cd`). Native-browser verification in `e2e/studio-storage.spec.ts`; integration notes in `studio-project-storage.md`. The workspace runs on v2 and the wizard is retired (Phase 1, 2026-09-10). Remaining: no screen yet lets a learner reject an investment with a reason or record a decision, though storage holds both and its tests show rejected research survives; and the dependency graph behind `needs review` |
| M3 complete stock prototype | **In progress** | Industry surface and disaggregated ROIC built and verified: [`studio-industry-view.md`](../source-audits/studio-industry-view.md), route `/studio/industry`. Investigate surface built: route `/studio/investigate`, seven entered figures with checks, peer interpretation and cost of capital, saved per company (`e2e/studio-investigate.spec.ts`). Five forces, value stick and industry map not started |
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
| 7 | The workspace opens in practice for a newcomer; one action switches to personal | Decided by the user 2026-09-10. The wizard already does this, and the two modes are stored separately, so switching loses nothing |
| 8 | Goal and Rules move into the workspace unchanged in Phase 1 | Decided by the user 2026-09-10. A goal is learner-authored, so a form suits it; the evidence-first rule applies where evidence exists |
| 9 | Workspace Phase 1 moves in only what already works; the Atkore journey is Phase 2's acceptance test | Decided by the user 2026-09-10. Retires the wizard using tested parts without shipping partial valuation; the §9 bar is kept, not lowered. See [`studio-workspace-design.md`](../agent-prompts/studio-workspace-design.md) |
| 10 | Strategy is left out of workspace Phase 1 | Decided by the user 2026-09-10. Nothing is behind it yet: no storage for a philosophy, and its teaching must be written and source-checked first. A section that cannot be used would be a promise Studio cannot keep |
| 11 | OPS is non-commercial | Decided by the user 2026-09-10. This settles the data terms that turn on commercial use. CGS lets CUSIPs taken from public sources be stored for non-commercial use, so Studio may carry them from SEC filings and Treasury records (never as a download). See [`studio-online-data-and-tools.md`](../source-audits/studio-online-data-and-tools.md) §5.4 |
| 12 | Fix the borrowing rate, move the filing reader into Studio, and measure corporate bond prices from one bond-fund filing | Decided by the user 2026-09-10, answering §12 of the research report |

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
  2023 — a fee-revenue subset — against a bank revenue of $9,017M in 2025 (net interest income
  $5,982M plus noninterest income $3,035M). Wrong by about **fifteen times**, stale by two
  years, and completely silent, because the field is populated. Every metric needs an explicit
  concept mapping per sector, recorded per number. Built; see below.
- **D2 resolved.** Commercial feeds were the wrong place to look. Tiingo and Alpha Vantage free
  tiers are internal-use only; Stooq's terms could not be established. The answer is
  public-domain SEC data: N-PORT positions carry a share count and a USD value, so price =
  value ÷ shares. All three worries about it were then measured and cleared.
  - **Accuracy.** VTI and VOO both reported 2026-03-31 and file independently. Keyed on the
    security rather than the issuer they share 501 securities, and their implied prices agree
    for **501 of 501**, worst difference 0.000000%. Apple $253.79 in both, NVIDIA $174.40 in
    both. *This supersedes an earlier 486-of-487 reading and its explanation; see the
    correction under "Price ingestion built and run" below.*
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

### Price ingestion built and run

`scripts/source/fetch-nport-prices.mjs` with `scripts/source/nport-manifest.json`; extraction
rules in `lib/studio-project/prices.ts`, 27 tests. Node strips the types so the script and the
app share one implementation instead of a copy. Report:
[`studio-price-snapshot.md`](../source-audits/studio-price-snapshot.md).

First real snapshot, `2026-09-05`: **90,028 observations, 13,549 securities, 18 report dates**
from 2025-01-31 to 2026-06-30, built from 24 filings by VTI, VOO, VXUS and VTHR. 112 MB of raw
filings live in the gitignored `.source-cache/`; only the report is committed.

**Four defects found by measuring, each of which would have been silent.** They are the reason
the module looks the way it does, and each has a test.

1. **LEI is an issuer, not a security.** 217 of 5,378 issuers in one filing carry more than one
   security under one LEI. Cemex is $12.30 as a US ADR and $1.23 as a Mexican local share;
   Banco Santander Chile $31.98 and $0.08. Keys are ISIN, then CUSIP, never LEI.
2. **A third of international positions have no LEI and no CUSIP.** Only 718 of 8,777 foreign
   positions carried a CUSIP. The earlier LEI+CUSIP key would have dropped 34% of the
   international universe — the securities the user specifically asked Studio to support.
3. **One security can carry several prices on one day.** Barrick appears in one filing on three
   exchanges: New York $39.3400 and Toronto $39.2903 at Level 1, London $39.3401 at Level 2
   because that exchange had closed. Currency and country are part of the key.
4. **Level 3 is two different populations.** Of 490 Level 3 observations, 282 are priced under
   a hundredth of a cent — sanctioned Russian holdings, delisted shells, suspended listings —
   against 12 of 89,538 quoted observations that cheap. The rest are large holdings caught
   mid-event: Emirates Telecommunications at $5.16 on a $259M position, Samsung Biologics at
   $855. `isMarketPrice` separates them; charting a write-down as a price would show a company
   collapsing to zero when it merely stopped trading.

**A correction to the earlier M1 record.** The 486-of-487 cross-fund agreement was reported as
one money-market outlier with "a different unit convention". That was wrong. Both entries were
`NS`, and the real cause was two share classes of one fund sharing an LEI with no CUSIP and no
ISIN — the same identifier collision as Cemex. With security-identifier keys the agreement is
**501 of 501, worst difference 0.000000%**, and across the full snapshot no security reported
by more than one filing disagreed at all.

**Independent verification.** `valUSD` was arbitrated by `pctVal`, a field the pipeline never
reads: across **93,408 positions in all 24 filings, every one reproduces inside the filing's
own truncation window** of 1e-12. The first attempt at this check failed, and the diagnosis
mattered — the filings *truncate* `pctVal` rather than rounding it, and a uniform relative
tolerance is meaningless on positions worth nine cents. The pipeline was right; the check was
wrong.

**Design notes worth keeping.** Registrants file one NPORT-P per fund and the submissions index
does not say which — `primaryDocDescription` is empty. Only the document names the series, and
SEC ignores `Range` headers, so the script streams a filing and cancels after `</genInfo>`:
16 KB instead of 3.1 MB, a 99.5% saving, and every `seriesId` in the manifest was read that way
rather than guessed. Trusts keep different fiscal year-ends, so three of them cover all twelve
month-ends of 2025 — though per security rather than per filing a US stock reaches eight and an
international one four. Monthly coverage needs a monthly filer such as iShares Trust, deferred
to M4 because which funds to add depends on the universe.

**Limits that must travel with these numbers.** They are price returns, not total returns —
dividends are not in them. Coverage is per filing, not per security. Level 1 and Level 2 are
not the same kind of number and any display must say which.

### Per-sector metric mapping built and run

`lib/studio-project/metrics.ts` with 29 tests; `scripts/source/fetch-fundamentals.mjs` and
`fundamentals-manifest.json`. Audit:
[`studio-metric-mapping.md`](../source-audits/studio-metric-mapping.md). Twelve companies
spanning banking, insurance, real estate, utilities, transport, energy, software,
semiconductors, retail, pharma, telecom and industrials, each chosen because it breaks
something a single definition would assume.

**The design conclusion is stronger than the plan anticipated.** The ledger called for
per-sector concept tables. Tables are necessary but *not sufficient*: resolution must be
**for a stated period**, because filers migrate their tagging. A concept qualifies only if it
carries a value covering the requested period; preference then decides among the ones that
qualify. Sector lists constrain meaning, period qualification constrains currency, and
neither alone is enough.

**Four silent failures, each measured.**

1. **Wrong concept for the sector.** Fifth Third's contract revenue is $577M — a fee subset —
   against net interest income $5,982M and noninterest income $3,035M. Wrong by about fifteen
   times. A bank's revenue is now assembled as a sum, and the contract-revenue concepts are
   excluded from the banking list on purpose. A test pins the old behaviour for contrast.
2. **Concepts companies abandon.** The largest class, and **not a sector problem**: 11 of 113
   first-choice resolutions returned data staler than the company's own latest period.
   NVIDIA's old capex tag last appears in **2012**; Verizon's cost of revenue in 2014;
   Prologis's depreciation in 2015; Microsoft's `CostOfRevenue` in 2017; Costco's
   `GrossProfit` in 2019. Every one still resolves and is populated.
3. **Metrics that do not apply.** Gross profit is undefined for a bank, an insurer, a REIT, a
   railroad or a utility — six of the twelve report neither gross profit nor any cost of
   revenue. That is now a distinct outcome from "missing", with the reason naming the shape.
   Free cash flow is likewise refused for banks and insurers, which both the competition team
   (dividend yield substitution) and Morgan Stanley (financials excluded for accounting
   reasons) independently support.
4. **Names that resemble the answer.** NextEra tags `CapitalExpendituresIncurredButNotYetPaid`
   at $7.64B, an accrual rather than cash spending. Prologis tags `PaymentsToAcquireRealEstate`
   at $1.80B, which is buying buildings rather than maintaining them. Verizon, Exxon and Union
   Pacific all report `CostsAndExpenses`, total operating expense — subtracting it from revenue
   yields operating income wearing the name of gross profit. All three are excluded by name.

**A fifth failure, outside the metric layer entirely: a ticker is not an identity.** `XOM`
resolves to **ExxonMobil Holdings Corp**, a 2026 reorganisation entity with 94 concepts and
**zero** annual revenue periods, whose `entityName` still reads "Exxon Mobil Corporation". The
operating company, CIK 0000034088, has 438 concepts and fifteen years. Nothing in the payload
distinguishes them. CIKs are now pinned in the manifest, the cache is keyed by **CIK rather
than ticker** — the first run reused a stale ticker-keyed file and served the wrong entity, so
this is a fixed bug and not a hypothetical — and any entity with fewer than three annual
periods is rejected.

**Verification.** A false-negative check that could have failed: are the "unavailable" gross
margins real? Verizon, Exxon and Union Pacific report no cost-of-revenue concept for the
current year — only `CostsAndExpenses`. Using it would have made Verizon's gross profit
$29.26B, which is its operating income. The refusals are correct.

**This is the Morgan Stanley prerequisite.** Disaggregated ROIC, profit pool and the value
stick all need metric definitions that survive crossing from an industrial to a bank. The
Moat appendix's own exclusion of financials "for accounting reasons" is the same finding
arrived at independently.

## M3 record — the industry surface

The first Moat-shaped build. `lib/studio-project/industry.ts` with 21 tests,
`scripts/source/fetch-industry.mjs` and `industry-manifest.json`, the committed dataset at
`lib/studio-project/data/industries.json`, the surface at
`components/studio/IndustryView.tsx` on route `/studio/industry`, and the audit at
[`studio-industry-view.md`](../source-audits/studio-industry-view.md).

**Definitions are the paper's, transcribed rather than reconstructed.** Market share
instability is the average absolute change in share between two periods, which *Measuring the
Moat* attributes to Bruce Greenwald, with its stated rule of thumb that a five-year average of
two points or less is relatively stable. Concentration is HHI and C4 as the paper defines them.
The profit pool is (ROIC − WACC) × invested capital, drawn as spread by capital so the area is
the economic profit.

**Validated against the paper's own published answers**, which is genuinely independent of this
code. Exhibit 13 (US search engines, 2018-2023) and Exhibit 14 (US airlines) give both inputs
and result; the implementation reproduces 1% and 0.9% respectively. The web-browser and
social-media exhibits are deliberately **not** used: their printed per-company changes do not
reconcile with their printed shares — Safari is shown moving 14% to 20% with a stated change of
5% — because the changes were computed from unrounded shares and only the shares were rounded.

**Six defects found by measuring, each of which changed a headline number.**

1. **Truncated registrant lists.** The first version stopped at 600 and browse-edgar returns
   alphabetically, cutting Pfizer, Merck, Lilly and Johnson & Johnson out of pharmaceuticals —
   $261B, more than the $184B that remained. HHI fell from 2186 to 788 once the loop ran to
   exhaustion. The first figure was fiction.
2. **A name is not an identity, for the third time this project.** Union Pacific filed as
   "UNION PACIFIC CORPORATION" in 2019 and "UNION PACIFIC CORP" in 2024; matched on name that
   is a 30-point exit plus a 32-point entry, and it alone took railroads from 1.6% to 9.0%.
3. **The largest concept is not always right.** Burlington Northern files $91M of `Revenues`
   against $23.4B of contract revenue, where larger is right. Tigo Energy's own filing tags
   $54.0M and $54,014.0M for the same period, where it is wrong and made a small solar company
   10.4% of semiconductors, ahead of Intel. Preferring `Revenues` fixes Tigo and breaks BNSF;
   preferring the larger does the reverse. Past 100× the company is dropped and reported.
4. **An exclusion must apply to both periods.** Dropping BNSF from 2024 while leaving it in
   2019 read as an exit and pushed railroads to 10.5% — the exclusion inventing the mobility it
   existed to avoid distorting.
5. **Truncating each period separately invents entries and exits.** Analog Devices filed in
   both years; slipping from tenth to eleventh had the surface say "no longer filing", a strong
   claim and false. The named set is now the union of each period's leaders.
6. **Instability depends on the number of rows averaged.** Over all 313 pharmaceutical filers
   it collapses to 0.1%; over the paper's shape of leaders-plus-Other it is 2.0%. Only the
   second is comparable to the paper's rule of thumb, and both are reported.

**Both of the paper's cautions are on the page, not in a footnote**, because each changes what
a reader should conclude: variance within industries exceeds variance across them, so this
narrows a search and never settles it; and concentration is not reliably linked to value
creation, so share leads and HHI is offered as description.

**Verified in the browser.** All five industries render with the right leaders — semiconductors
show NVIDIA 4.1% → 28.1% against Intel 27.2% → 11.5% across the five years, which is the story
that actually happened. No console errors. Tables scroll inside themselves and the page never
scrolls sideways.

**Over the screen budget, and stated rather than hidden.** 1.60 screens at 1440 and 2.49 at
375, against the project's 1.5 limit — better than Studio's own 1.68 and 2.44 but still over.
The remaining excess is the cautions panel, kept visible deliberately.

### Disaggregated ROIC

`lib/studio-project/roic.ts` with 24 tests, wired through `fetch-industry.mjs` so every
industry's leaders carry the split, and shown as a third view on `/studio/industry`.

**Definitions from the papers.** ROIC is NOPAT over invested capital. It decomposes DuPont
style into NOPAT margin times invested capital turnover — the sales cancel — and the split is
what distinguishes **differentiation** (high margin, satisfactory turnover) from **cost
leadership** (satisfactory margin, high turnover). Validated against an example the paper
works in prose: 10% margin × 1.5x turnover = 15%, and after the supplier cuts price, 7.5% ×
2.0x = the same 15%.

**What the papers do not give, so this decides and says so.** Neither states a line-item
formula for invested capital. OPS uses **interest-bearing debt + equity − cash**, because
NOPAT is the profit available to lenders and shareholders together so the denominator must be
what both put in. The common alternative — assets less non-debt current liabilities — was
measured against it across twelve companies and runs **5% to 28% higher**, since it leaves
long-term non-debt liabilities in the base. Operating leases sit outside and are reported
beside it: $19.0B at Verizon, $16.5B at Microsoft, large enough to change the answer.

**Two corrections the first run forced, both grounded in the papers' own wording.**

1. **Prologis computed to a 46.9% margin on 0.10x turnover**, reading as textbook
   differentiation. It is an artefact — a property company's capital is buildings at
   depreciated cost. Both papers exclude financial and real-estate companies "because their
   accounting is different than the rest", so banking, insurance and real estate are declined.
2. **Atkore's loss year came out as "cost leadership"** on a 0.6% margin, because its capital
   happened to turn over fast. The paper describes these as the routes by which companies
   "enjoy attractive ROICs"; they explain a good return, not a bad one. Below an 8% hurdle the
   route is withheld and the split still shown.

**Four coverage gaps found and fixed, one rejected.**

- **Foreign issuers were invisible.** Restricting to 10-K excluded every 20-F filer;
  STMicroelectronics reports `Assets` only under 20-F and looked like a company with no annual
  period. 20-F and 40-F are now annual forms — directly relevant to the foreign-share support
  the user asked for.
- **Oracle's debt** is tagged `DebtLongtermAndShorttermCombinedAmount`, EA's is `SeniorNotes`.
  Both added.
- **Debt-free companies were being refused.** ServiceNow and Shopify report no borrowings;
  requiring the tag excluded them. Absent debt is now zero, recorded as an assumption. The
  trap avoided: everything matching "Debt" at ServiceNow is
  `AvailableForSaleSecuritiesDebtSecurities`, $6.3B of investments it **owns**, and reading
  that as borrowing would invert the balance sheet.
- **Rejected: deriving operating income** as gross profit less SG&A and R&D, to rescue the
  five big pharma companies whose `OperatingIncomeLoss` is stale — J&J last tagged it in
  **2014**. Checked against companies reporting both: NVIDIA exact, Texas Instruments 1.9%
  out, **Microsoft 22.3% out**. Not adopted; those five stay declined with the reason.

37 of 43 industry leaders now compute. Semiconductors: NVIDIA 71.3% earning it both ways,
Broadcom and Texas Instruments by charging more, Applied Materials by turning capital faster.
Variety stores: Costco 37.5% on a 2.8% margin and 13.29x turnover, which is the whole model in
two numbers.

**The surface** plots the margin-turnover plane the paper reads advantage off, with peer
medians rather than invented thresholds. Loss-making companies are off the chart and named
underneath — the paper truncates its own axes for the same reason. That view runs **2.0
screens at 1440**, over the 1.5 budget, because it carries a chart and a table.

### Not built, and why

`profitPool` is implemented and tested but still has no surface. It now has ROIC and invested
capital, but still needs a WACC, which is not derivable from filings at all: it needs a cost of
equity, so it is an input carrying its own provenance rather than a fact read off a statement.

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

- The dependency graph that marks downstream work `needs review` when an input changes.
- Connect the v2 workspace adapter to the rebuilt Studio interface, including visible save/conflict/recovery actions. The current wizard remains on v1; do not claim its storage was switched by this milestone.

### 2026-09-05 continuation: storage, backups, and conflicts

The user selected **durable saving, backups, and conflict handling** as the next task.
The previously pending navigation-only changes in `components/studio/stages.tsx` and
`components/studio/IndustryView.tsx` were committed as explicitly requested:
`4a64cac` (`Connect Studio research to the industry view`). Nothing was pushed.
The storage work described here is left uncommitted for review; local settings remain untouched.

Implemented:

- Full v2 validation before reading/saving/importing. The old reader trusted any object
  declaring `schemaVersion: 2`; malformed objects and unknown nested fields now fail and retain
  the original. No coercion of missing numeric data into zero.
- Native IndexedDB storage with separate practice/personal slots. Revision comparison and
  write are in one transaction, so competing tabs cannot both overwrite the same revision.
- Import/reset archive the previous saved project in that same transaction. Failed retries
  preserve the archive requirement; unknown future schemas cannot be replaced by reset.
- Serialized session edits, failed-save draft retention, export/retry, explicit conflict
  reload, cross-tab notification and focus/visibility recheck. Notifications do not replace drafts.
- Non-destructive legacy adoption: leave v1 localStorage intact and retain its exact raw text
  in migrated history. Simultaneous first opens converge on the committed winner.
- Validated v2 backup round trips and the `useStudioProject(mode)` integration adapter.
  Research remains independent of holdings and alternatives across save/reload/import.

Design and API contract: [`studio-project-storage.md`](studio-project-storage.md).

Verification in this continuation:

- `npm run typecheck`: passed after implementation.
- `npm test`: **523 passing across 40 files**, including 11 additional backup/validation cases.
- `npm run test:studio-storage`: **13 passing** in real Chromium. No Next server needed.
  Includes a forced native transaction abort after the put-success event, independent-tab
  conflict without notifications, quota-error injection, import/reset recovery, and future records.
- `npm run lint`: passed with the same two pre-existing onboarding hook warnings.
- Full `npm run test:e2e -- --workers=2`: **66 passed, 3 skipped**, including all 13 new storage journeys. Reused the existing dev server; no server was started by this task.
- Build not run while the existing dev server owns `.next`; port 3000 responds successfully.
  This task adds no visible surface or finance content and does not claim a fresh visual release audit.

The first native-browser launch was denied by the process sandbox before tests ran. Re-running
with approved browser-process access passed. No expectation was loosened. Storage tests use an
isolated synthetic origin, not the user's actual browser profile or saved project.

### Next concrete action

The industry half of the Moat backbone exists, and disaggregated ROIC with it. What is left is
the qualitative company work.

1. The five forces and the value stick as company surfaces, plus the industry map, which is
   qualitative and has no data pipeline behind it.
2. A WACC input with its own provenance, which is the last thing the profit pool needs.
3. Field inventory for one complete investigation and one portfolio comparison.
4. Confirm permitted use of Damodaran's NYU industry data files.
5. Read strategy pp. 8-10 as images before designing the screen surface.
6. Check per-security price coverage once the universe is fixed, and add a monthly filer if
   the gaps matter.

M2 schema work is source-independent and proceeds in parallel with any of these.

## Working files

| Path | Contents | Durable? |
| --- | --- | --- |
| `tmp/pdfs/wic-strategy-review/` | 134 page renders plus `strategy.txt` | No — scratch |
| `tmp/pdfs/wic-report-review/` | 18 page renders plus `report.txt` | No — scratch |
| `tmp/pdfs/firm-process/` | Morgan Stanley papers and extraction | No — scratch, retrievable |
| `.source-cache/nport/` | 24 raw filings, 112 MB, plus the built snapshots | No — gitignored cache, rebuildable |
| `.source-cache/fundamentals/` | XBRL company facts for 12 companies, keyed by CIK | No — gitignored cache, rebuildable |
| `docs/source-audits/studio-research-coverage.md` | The M0 map | Yes |
| This file | The ledger | Yes |

The user's PDFs and the Morgan Stanley papers are not redistributed in the repository. `tmp/`
is gitignored.

## 2026-09-06: cost of capital, the investigate loop, and a citation correction

### A citation error, corrected at source

Every reference to *Measuring the Moat* in committed code and generated audits dated the
paper **2025**. It is dated **15 October 2024** on its own first page — "CONSILIENT OBSERVER |
October 15, 2024". The 2025 came from the PDF's copyright footer, which is a copyright year
and not a publication date. Caught by Codex's proposal, verified against the extracted text,
and corrected in `industry.ts`, `roic.ts`, `industry.test.ts`, `fetch-industry.mjs` and both
regenerated outputs. Commit messages `c10201e` and `66fa327` still carry the wrong year and
cannot be edited; this note is the correction of record.

### Direction settled with the user

A long design conversation changed the product thesis. Studio is a **guideline**, not a data
warehouse. The learner researches their own company's figures — on SEC, or a general finance
site — and enters them. Studio's job is to show **which metrics matter and why**, to catch
what is typed wrong, and to interpret the result against real peers. Precise numbers are
obtainable elsewhere; the interpretation is not.

Also settled: no generated portfolio suggestions ever; philosophy is a **companion** that
blocks finalising rather than exploring; several contrasting philosophies are taught, with
five having complete practical paths and trend-following deliberately excluded from those
because month-end pricing cannot support it honestly; stocks, bonds, funds and cash only; one
portfolio may hold several named strategies; finalising requires evidence review, a costed
comparison and downside scenarios, with accepted trade-offs recorded rather than blocked;
challenge is deterministic checks first, with a capped, citation-constrained AI critic later;
market-implied expectations replace analyst consensus; and the end state is an **operating
position**, not an export.

### Built

- **`lib/studio-project/investigate.ts`** with 23 tests. Seven figures, where each lives, what
  other sites call it. Deterministic checks written for a person rather than a parser — profit
  exceeding revenue, cash swallowing the capital base, a bank stopped before it starts with a
  reason and an alternative, a margin four times the industry median questioned as possibly
  gross profit. The hardest requirement is the inverse: Costco's real 13.29x capital turnover
  must pass untouched, and a test pins it.
- **`lib/studio-project/cost-of-capital.ts`** and `scripts/source/fetch-cost-of-capital.mjs`
  with 13 tests. 96 industries from Damodaran. Audit:
  [`studio-cost-of-capital.md`](../source-audits/studio-cost-of-capital.md).

### The vintage problem, and what was done about it

His page carries no date and the server sends no `Last-Modified`. The newest dated file in his
archive is the January 2025 update. A risk-free rate from then, used now, is wrong by however
much yields have moved — and it is the one component anyone can look up in seconds.

He publishes cost of equity but not its inputs. Since every industry uses the same rate and
premium with only beta varying, regressing cost of equity on beta recovers both: **risk-free
3.96%, equity risk premium 4.45%**. Verified rather than assumed — worst residual across 96
industries is **2.33bp against 2.23bp explicable by beta being published to two decimals
alone**. A second check confirms cost of capital rebuilds from its weighted parts to 0.86bp.
Both abort the run if they stop holding.

So the surface shows the rate, says it is undated, and lets the learner replace it with
today's Treasury yield. Accepting the default reproduces his published figure exactly; a test
pins the step between the published and rebuilt paths at under a twentieth of a point.

Permitted use confirmed from his stated rules: acknowledgement optional, no commercial or
redistribution restriction, industry-level only, and he says explicitly not to use it for
individual company analysis — which is exactly the split Studio makes.

## 2026-09-10: what landed after the last entry, and Phase 1 scope

### Built between 2026-09-06 and 2026-09-10

Four Studio commits landed without a ledger entry:

- `6694568` — `/studio/investigate`. The learner enters seven figures from one annual report;
  the page checks them, interprets them against real peers, and sets return on capital against
  the cost of capital. Linked from the wizard's Research step.
- `85101cd` — investigations are part of the v2 project schema, with validation, migration and
  operations, so the research survives outside any holding.
- `3109aa2` — the investigate page saves as it is typed.
- `05cc236` — several companies can be investigated and switched between;
  `e2e/studio-investigate.spec.ts` covers it.

`6e0b607`, the site-wide light refresh, relit the Studio pages through the shared shell. It did
not restyle Studio's own components.

### Baseline before Phase 1

Measured 2026-09-10 on a production build. Page height in screens:

| Route | 1440x900 | 390x900 | Notes |
| --- | --- | --- | --- |
| `/studio` (wizard, Goal step) | 1.33 | 2.31 | At 390, steps 5 and 6 sit off the edge of the step bar |
| `/studio/investigate` | 1.16 | 2.00 | No `<h1>`; the page title is styled text |
| `/studio/industry` | 1.46 | 2.11 | No `<h1>` |

No sideways scroll on any of them. The only failed requests were Vercel's analytics scripts,
which exist only when deployed on Vercel. Studio still uses its own teal and amber accents where
the rest of the site now uses blue: it renders light and legible, but does not match.

### Decided with the user

Decisions 7–9 above: open in practice, keep Goal and Rules as they are, and a narrower Phase 1
whose acceptance test moves to Phase 2 rather than being lowered.

### Review approved, 2026-09-10

The review of the mockup against the built code was published as a private page, "Studio
Workspace Phase 1" (https://claude.ai/code/artifact/91a172c8-17c2-4410-91aa-415e2814cfe8), and
approved by the user together with decision 10.

Findings that shape the build:

- The v2 storage already holds candidate records, evidence roles, named alternatives and decision
  records. None has a screen; only `InvestigateView` uses `useStudioProject`.
- `lib/studio-project/workspace.ts` already adapts the v1 stage forms to the working alternative
  (`projectToPlan`, `applyPlanChange`).
- The mockup's Goals, Portfolio and Review screens ask for a target amount, several goals and a
  purpose per investment. None is stored; all wait.
- Mockup defects not to copy: icons that never load (a blank phone menu button), a malformed
  Flexibility select, Review's first control past half a screen, stacked dividers.

### Next concrete action

Build Phase 1 in the approved order, leaving Studio working after each step:

1. The frame: sidebar, project bar, work area and source panel at six widths, under the site header.
2. The v2 storage: confirm the migration picks up work saved by the wizard, then switch.
3. Goal and Rules unchanged; Build, Risk and cost, and Buying into Portfolio through the adapter.
4. Research: Investigate and Industry inside, with real `<h1>`s; provenance into the source panel.
5. Overview, built only from saved work.
6. The project bar: save state, practice or personal, backup and recovery.
7. Retire the wizard and `useStudioPlan`; update the tests; measure six widths.

After Phase 1 and before Phase 2: screens for candidate records, evidence attachment and decision
records, and the `needs review` flags. Under decision 9 the older M3 items — five forces, value
stick, industry map, profit pool — are not Phase 1 work.

## 2026-09-10: Phase 1 build, steps 1 to 3

### Built

- The workspace frame, `components/studio/workspace/StudioFrame.tsx`: a section sidebar from
  1024px, a Section menu labelled in words below that, and a project bar with the portfolio's
  name, its save state and the Practice / Your own switch. The guide sits beside the work from
  1280px and stays above it on narrower screens, as the wizard's did, so a definition still comes
  before the questions that use it.
- `components/studio/workspace/WorkspaceProvider.tsx`: one v2 session shared by every section,
  through `useStudioProject` and the existing `projectToPlan` / `applyPlanChange` adapter. The
  mode opened is the learner's last explicit choice (`ops-studio-mode`); failing that, their own
  portfolio if it already holds work, because Investigate saved there before the workspace
  existed; otherwise practice. That check only reads, and never creates a project.
- Routes inside the `(workspace)` route group, so `/studio` keeps the wizard until step 7:
  `/studio/goals`, `/studio/research`, `/studio/portfolio` with `/risk` and `/buying`, and
  `/studio/review`.
- The stage forms are shared by both. In the workspace, section names replace "Step N", each title
  is the page's `<h1>`, copy no longer points at step numbers, and the downloads carry the whole v2
  project, research included. The weight box became `NumberInput` in `shared.tsx`: a plain
  controlled input drops keystrokes once saves are asynchronous, because React restores the old
  value while a queued write is still in flight.
- `useStudioProject` takes an `internal` predicate, so moving between sections raises no "leave
  Studio?" warning. Nothing is lost by it: the layout keeps the session open.
- `app/(app)/studio/(workspace)/workspace.css`: Studio's cyan takes the site blue, inside
  `.studio-app` only. Amber is left alone because Studio uses it for warnings.

### Verified

`tsc` exit 0; `next lint` clean; Vitest 48 files, 612 tests. Headless Chromium against the dev
server ran 14 checks, all passing, with no page errors and no dialogs. Stored values were read
back from IndexedDB, not from the page's own save line:

- a goal edit reaches storage; an investment added in Research appears in Portfolio;
- moving between sections raises no dialog;
- typing "100" quickly into a weight box stores 100;
- Your own opens the other portfolio without practice work in it, the choice survives a reload,
  and practice work is intact after switching back;
- the phone Section menu reaches Review;
- `/studio` (the wizard), `/studio/investigate` and `/studio/industry` still render.

Page height in screens:

| Page | 1440x900 | 390x900 |
| --- | --- | --- |
| Goals | 1.14 | 2.17 |
| Research | 3.03 | 4.73 |
| Portfolio: how much goes where | 1.17 | 1.47 |
| Portfolio: risk and cost | 1.30 | 2.55 |
| Portfolio: what to buy | 1.24 | 1.48 |
| Review | 1.34 | 2.70 |

Research is over the 1.5 budget, but not because of this change: the wizard's Research step
measures 3.23 at 1440 and 5.00 at 390. It is restructured in step 4.

Not yet run: the full Playwright suite. Its production build writes to the same `.next` the dev
server uses, so it runs at step 7 with the dev server stopped.

### Next concrete action

Step 4. Investigate and Industry move inside the frame on the shared session, with `<h1>`s and a
Research breadcrumb in place of "Back to your plan", and their "Where these numbers come from"
in the side panel from 1280px. Research comes within 1.5 screens at 1440 without dropping any of
its content.

## 2026-09-10: Phase 1 build, steps 4 to 6

### Built

- **Step 4, Research.** `/studio/investigate` and `/studio/industry` moved into the `(workspace)`
  route group at the same URLs. Investigate now uses the workspace's session instead of opening
  its own `useStudioProject("personal")`, so its investigations follow the open portfolio; a
  returning learner whose own portfolio already holds Investigate work opens there. Both pages
  have an `<h1>` and a Research breadcrumb in place of "Back to your plan". Industry's decorative
  amber is the site blue; its "check revenue" warning stays amber. Each page's "Where these
  numbers come from" is drawn in the side panel from 1280px through `StudioAside`, and stays
  inline below that.
- **Two save-honesty fixes in Investigate.** During its 600ms typing pause the workspace's
  `draft` flag makes the project bar say "Saving…" rather than "Saved". It also writes the pending
  edit when it unmounts, because moving to another section inside the pause otherwise lost it.
- **Research within budget, nothing removed.** No catalogue entry opens by default; the two ways
  in sit side by side; the catalogue is two columns, with the add button in each card's corner so
  names use the full width; "What you cannot research here yet" is a disclosure; copy is shorter.
- **Step 5, Overview,** at `/studio/overview` until step 7: what the money is for, one suggested
  next step taken from what is missing, the companies investigated (each opening that company via
  `/studio/investigate?company=<id>`), the investments read about including ones taken out of the
  portfolio, and a line when the other portfolio holds work, which counts the old form's
  not-yet-migrated record for practice. Built only from saved work; nothing is sample content.
- **Step 6, the project bar.** `ProjectMenu`: download a backup, restore from a file, start again,
  and earlier versions from the recovery store, each with download and restore. Every storage
  problem now carries its remedy: unsaved (try again, download the draft), conflict (download this
  version, load the saved one), a newer version elsewhere (load it), unreadable (download the
  original), storage unavailable (try again).

### Verified

- `tsc` exit 0, lint clean and Vitest 48 files / 612 tests after each step.
- The existing Playwright specs `studio-investigate` (6 tests) and `visual-refresh` (2) pass
  against the dev server with Investigate inside the workspace.
- Headless Chromium, with stored values read back from IndexedDB: 8 checks for step 4, 17 for
  step 5 and 15 for step 6, all passing, with no page errors. The only dialogs were the three
  confirmations the step-6 check accepted deliberately.
- **Step 2's condition, met with the old form itself.** A goal typed and an investment added at
  `/studio` appear in the workspace; the new project's `migratedFrom.raw` equals the old record
  exactly; the `ops-studio-portfolio-v1` value is unchanged.
- One check failed first, and the script was at fault: it typed the second company before
  "+ Another company" had cleared the sheet, so the name was wiped. With the wait the
  `studio-investigate` spec already uses, both companies store under their own names.
- One defect was found by looking rather than measuring: the Overview's suggested-step button
  used `text-white`, which the light theme maps to dark ink site-wide, giving about 3:1 on the
  blue. It is now `text-[#ffffff]`, white on #0066CC at about 5.6:1.

Page height in screens:

| Page | 1440x900 | 390x900 |
| --- | --- | --- |
| Research | 1.48 | 3.10 |
| Investigate | 1.35 | 2.14 |
| Industry | 1.46 | 2.25 |
| Overview, fresh | 1.19 | 1.57 |

### Next concrete action

Step 7. The Overview moves to `/studio`. The wizard page, `components/studio/StudioWorkspace.tsx`,
`lib/use-studio-plan.ts` and the temporary `/studio/overview` route are deleted.
`visual-refresh.spec.ts` asserts the workspace's navigation instead of "Studio steps". The full
Playwright suite runs on a production build with the dev server stopped, and every page is
measured at six widths.

## 2026-09-10: Phase 1 build, step 7, and Phase 1's final checks

### Built

- The Overview is now `/studio` (`app/(app)/studio/(workspace)/page.tsx`). It keeps the wizard
  page's title; its description now names the workspace's sections. The sidebar's Overview entry
  matches `/studio` exactly, because every other section also starts with `/studio`, and
  `isWorkspacePath` treats `/studio` as inside the workspace.
- Retired: `app/(app)/studio/page.tsx` (the six-step form), `components/studio/StudioWorkspace.tsx`,
  `lib/use-studio-plan.ts` and the temporary `/studio/overview` route. No code or test refers to
  them; only earlier notes do. `lib/studio.ts` stays: the v2 project still uses its plan model,
  validation and text export, and reads its old `ops-studio-portfolio-v1` record to migrate it.
- `e2e/visual-refresh.spec.ts` asserts the workspace's "Studio sections" navigation where it
  asserted "Studio steps".
- From the six-width measurement: the empty "How much goes where" and "What to buy" pages had no
  control at all and warned in amber. Each now says what to do, in a neutral tone, with a link to
  where it can be done. Portfolio pages drop the "Portfolio" label the tabs already state and the
  tab bar sits closer, which moves Risk and cost's first box from 481px to 447px.
- `headingFor` no longer falls back to the wizard's "Step N".

### Verified, on a production build

- Rerun on the final code: `tsc` exit 0; Vitest 48 files, 612 tests, all passed; lint exit 0,
  with two warnings, both in onboarding files this work did not touch
  (`components/onboarding/OnboardingFlow.tsx`, `lib/onboarding/store.tsx`).
- The full Playwright suite on a production build, rerun on the final code: 74 passed, none
  failed, 4 skipped. The suite's only skips are switches for optional screenshots, deck rendering,
  a Supabase test project and a capture address, none set for this run. The storage spec runs
  under this config as well as its own.
- Every workspace page at 390, 768, 1024, 1280, 1440 and 1920 wide: exactly one `<h1>` and no
  sideways scroll anywhere. At 1440x900 every page is within 1.5 screens, with its first control
  within half a screen.

| Page | 390 | 768 | 1024 | 1280 | 1440 | 1920 | First control at 1440 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/studio` (Overview) | 1.63 | 1.25 | 1.19 | 1.19 | 1.19 | 1.19 | 407px |
| `/studio/goals` | 2.22 | 1.49 | 1.39 | 1.14 | 1.14 | 1.14 | 357px |
| `/studio/research` | 3.10 | 2.45 | 1.83 | 1.53 | 1.48 | 1.48 | 302px |
| `/studio/investigate` | 2.20 | 1.63 | 1.27 | 1.35 | 1.35 | 1.35 | 393px |
| `/studio/industry` | 2.30 | 1.65 | 1.59 | 1.53 | 1.46 | 1.46 | 340px |
| `/studio/portfolio` | 1.49 | 1.07 | 1.01 | 1.17 | 1.17 | 1.17 | 345px |
| `/studio/portfolio/risk` | 2.57 | 1.75 | 1.59 | 1.26 | 1.26 | 1.26 | 447px |
| `/studio/portfolio/buying` | 1.52 | 1.07 | 1.01 | 1.24 | 1.24 | 1.24 | 345px |
| `/studio/review` | 2.75 | 1.67 | 1.67 | 1.43 | 1.34 | 1.34 | 357px |

- The only failed requests were `/_vercel/insights/script.js` and
  `/_vercel/speed-insights/script.js`, 54 each (nine pages at six widths). Both exist only when the
  site is deployed on Vercel. There were no other errors.
- Both menus open, close on Escape and hand focus back to their button: Section at 390, and
  Backup and restore at 390 and 1440. The check fails if a menu never opens.

### Known limits

- Research and Industry reach 1.53 screens at 1280, just over the budget at that width. The rule
  is measured at 1440, where they are 1.48 and 1.46. Narrower widths stack and run longer, as the
  wizard's did: its Goal step was 2.31 screens at 390, and Goals is now 2.22.
- Against the baseline above, Goals is shorter (1.33 to 1.14 at 1440), but Investigate is longer:
  1.16 to 1.35 at 1440 and 2.00 to 2.20 at 390. Industry is unchanged at 1440 (1.46) and longer at
  390 (2.11 to 2.30). All three stay within the 1440 budget. Which part of the frame adds the
  height was not isolated.
- On a phone the project bar takes three rows: the Section menu with the portfolio's name, then
  Backup and restore, then the Practice / Your own switch. It works, but it is tall.
- `ReviewStage` in `stages.tsx` still carries the wizard's single-record download fallbacks, now
  unreachable. They go when `stages.tsx` is broken into focused tools, as handoff §3 and §10 ask.
- No full keyboard-only or screen-reader walkthrough was run. Beyond the Escape check, this rests
  on labelled controls and focus styles in the code, and on the existing Playwright specs.
- Nothing is committed.

### Next concrete action

After Phase 1 and before Phase 2: screens for candidate records, evidence attachment and decision
records, and the `needs review` flags. Phase 2's acceptance test is the Atkore journey in
handoff §9.

## 2026-09-10: online data and tools research, checkpoint

Running [`studio-online-data-and-tools-research.md`](../agent-prompts/studio-online-data-and-tools-research.md)
at the user's request. Findings go into
[`studio-online-data-and-tools.md`](../source-audits/studio-online-data-and-tools.md) as they
are established. Nothing is committed and no product code has changed.

Established so far, each verified in that file:

- The SEC's data cannot be called from a learner's browser (no CORS on company facts, plus the
  User-Agent rule). It stays on the server or in snapshots.
- Atkore's filing has revenue by product line, regions and customer concentration in its own
  XBRL data file. None of it is in company facts.
- Implied Treasury bill prices from N-PORT agree with Treasury's published bill rates for the
  same day: 22 of 22 within 0.05 points, at T+1 settlement.
- Fund total returns are tagged XBRL in shareholder reports (N-CSR, `oef`).
- BLS producer prices for Atkore's inputs are public domain and need no key.
- FRED forbids storing data, and the Board's download program is being retired toward it, so
  rates come from Treasury directly.
- A walk of today's Studio found 4 outside sites needed to finish the Atkore journey, 1 dead end
  (Atkore's industry is missing), and 1 stale learner-facing claim (Investigate's "undated,
  January 2025" risk-free-rate note).

## 2026-09-10: online data and tools research, complete

The report is [`studio-online-data-and-tools.md`](../source-audits/studio-online-data-and-tools.md).
Its §1 is the one-screen summary, and §12 lists the questions only the user can answer. M1 items
1, 2 and 4 are closed in
[`studio-data-coverage.md`](../source-audits/studio-data-coverage.md).

### Established, beyond the checkpoint above

- Every essential fact of the Atkore journey has a free, lawful public source, except corporate
  bond prices (unmeasured; one 15.9 MB filing awaits the user's go-ahead). Private competitors
  cannot come from SEC data.
- SIC 3690 is mostly battery and EV-charging makers, so Atkore's peer set must be chosen
  deliberately.
- Fiscal Data's auction records give a dated risk-free rate under open terms: 4.683% for the
  10-year note auctioned 2026-08-12. Studio uses 3.96%. Filter out inflation-indexed notes, which
  share the "10-Year" label.
- Treasury's daily par curve and FedInvest prices are not usable for display on the terms found.
  FRED forbids storing data.
- No free price source permits public display. Tiingo's own pricing page confirms the 2026-09-05
  audit.

### Next concrete action

The user's decisions in the report's §12. Then R1, a dated Treasury rate, which fixes the live
stale note. Then the research record with its evidence panel (R2). Nothing is committed.

## 2026-09-11: the borrowing rate, company reports inside Studio, and a lost click

The user's answers to the research report's §12: download the bond filing, OPS is
non-commercial, fix the borrowing rate, move the filing reader into Studio.

### Built

- **A dated government borrowing rate.** `scripts/source/fetch-treasury-rate.mjs` takes the most
  recent ordinary 10-year Treasury note auction from Fiscal Data, whose terms are open and need no
  key: 4.834% on 2026-09-09, CUSIP `91282CRF0`. Data in `lib/studio-project/data/treasury-rate.json`,
  audit in [`studio-treasury-rate.md`](../source-audits/studio-treasury-rate.md).
  - Inflation-protected notes carry the same "10-Year" label and a real yield about two points
    lower. The query excludes them, and the run fails if one gets through anyway.
  - `cost-of-capital.ts` rebuilds each industry's figure on that rate by default and says so in
    words, naming the source's own implied 3.96% beside it. A typed rate still wins, and
    `estimate()` with no rate still reproduces the published figure exactly.
  - Investigate's old note is gone: "undated — the newest dated file in the archive is the January
    2025 update — so check it against today's Treasury yield". It was wrong, and it sent the
    learner to another website.
- **The vintage was mislabelled, not missing.** The pipeline read `datafile/wacc.htm`; his data
  index links `datafile/wacc.html`, which ends "Last Updated in January 2026". Both pages were
  parsed with the pipeline's own parser and compared: identical tables, 96 industries, 3.958% and
  4.45% recovered from each. The pipeline now reads the linked page. The regenerated dataset
  changed only its retrieval date, source URL, vintage and the new `vintageStated`; no industry
  figure moved.
- **Company reports moved inside Studio**, to `/studio/filings` and
  `/studio/filings/[cik]/[accession]`, under Research in the workspace frame. Permanent redirects
  keep every old `/filings` link working, including the homepage's.
  - One section at a time. Each opens with about 900 characters and keeps the rest of the excerpt
    behind "Keep reading this section". The old page stacked all seven sections: 9.52 screens at
    1440.
  - "What to look for" sits beside the reading at 1280 and wider.
  - Header, footer and sitemap point at the new place. The header now marks only the most specific
    match as current, so Studio and Company reports are never both current.
  - Investigate and the Research card link to it.
- **A lost click, found and fixed.** Typing a company's name and then clicking anything below the
  companies row did nothing: leaving the box saved the record, the row appeared, and the target
  moved 66px between the press and the release. Measured before the fix: the link at y=476 when
  pressed, y=542 three tenths of a second later, no navigation. The row is now always there,
  holding the company in hand as a label until it is saved.

### Verified

- `tsc` 0. Lint clean apart from two older onboarding warnings. Vitest 48 files, 619 tests.
- Playwright on a production build: 78 passed, 4 skipped, none failed. The new checks cover the
  redirects, Company reports opening inside the workspace under Research with only one navigation
  item current, and the lost click twice over: through the Company reports link and through a
  figure's "?".
- Six widths across 13 workspace routes. At 1440x900 every page is within 1.5 screens with its
  first control within half a screen. Problems: none. The report pages are 1.14 and 1.22 screens,
  down from 2.06 and 1.94; Investigate 1.45 with its first box at 429px; Research 1.48.
- The rendered provenance was read back from the page: "The 4.83% government rate is the yield at
  the US Treasury's 10-year note auction on 9 September 2026. The source's own figures, last
  updated January 2026, used 3.96%; its equity risk premium and beta are kept."

### Known limits

- Investigate still asks the learner to type the seven figures. Filling them from the filing is R3
  in the research report's roadmap.
- The reader still shows an excerpt of each section, so the whole text is still at the SEC. Outside
  websites needed to finish the Atkore journey: 3, down from 4.
- Company facts can lag a filing (TSMC), so any prefill needs the filing's own data file as a
  fallback.
- Nothing is committed.

## 2026-09-11: Investigate fills its own figures

R3 in the research roadmap. Committed work up to this point is `c1d9598`.

### Built

- **One button fills the seven figures from the company's own filing.** Type a ticker in
  Investigate, press "Fill these from the SEC", and the seven arrive from SEC company facts with
  the company's name, the year they cover, and the filing that reported them. Atkore's FY2025 10-K
  gives all seven; the reading follows immediately, where before it needed seven numbers hunted out
  of 400,000 characters.
- **Every supplied figure carries its source, and keeps it.** Clicking a figure's name opens the
  XBRL tag it was read from, how it was combined if it is a sum, and the period. The provenance is
  saved with the investigation, so reopening it later still shows which numbers were the company's.
  Investigate was the one surface in Studio where a figure could not be traced to anything.
- **Typing over a figure takes its source away.** The box loses its highlight and its label stops
  saying the company filed it; the others keep theirs. When the last one goes, so does the filing
  reference. A false source note on a number the learner changed would be worse than none.
- **The dead end now speaks.** Where the SEC files a company under an industry Studio has not
  researched — Atkore under 3690, mostly battery and EV-charging makers — the page says so and
  names the industry the peers and cost of capital actually come from. It still preselects one; it
  no longer does it silently.
- **A gap is a gap.** A figure the filing does not tag stays an empty box, is named under the form,
  and explains itself when clicked. None is ever filled with a zero.
- **The lookup runs on the server** (`app/api/studio/company-figures/route.ts`), because
  `data.sec.gov`'s company-facts endpoint sends no cross-origin header and a browser cannot set
  the User-Agent SEC fair access asks for. It returns seven numbers rather than the 2.3 MB they
  were read out of.

### Verified

- **Measured against twelve real companies before any of it was built**, using the cached facts and
  the manifest that spans a bank, an insurer, a REIT, a utility, a railroad and a loss year:
  `scripts/source/check-prefill-coverage.mjs`, audit in
  [`studio-investigate-prefill.md`](../source-audits/studio-investigate-prefill.md). 8 of 12 give
  all seven. The four short all lack operating profit, which they do not tag.
- **That measurement found three defects in total borrowings, each of which produced a plausible
  number rather than an error.** A noncurrent tag drops the instalment due this year (Costco $75m,
  Pfizer $3.0bn, NextEra $3.5bn); a combined tag already contains short-term borrowings, so adding
  them counted Verizon's $441m twice; and Exxon's only borrowing tag bundles $2.7bn of finance
  leases in with the debt, which is not what the box asks for, so it is refused rather than
  supplied. All twelve totals were worked out by hand first, then asserted.
- **Live against EDGAR**, not only against fixtures: ATKR returns all seven in about a second and
  matches the fixture to the dollar; COST's assembled $5,788m matches the hand figure; an unknown
  ticker, a name that is not a ticker, and an IFRS filer (SAP) each return their own message.
- `tsc` 0. Lint clean apart from the two older onboarding warnings. Vitest 49 files, 630 tests
  (11 new, on real filings trimmed to size).
- Playwright on a production build: **87 passed, 4 skipped, none failed**. Nine new checks cover the
  fill, the provenance behind a figure, the industry warning, survival across a reload read back out
  of IndexedDB, overtyping dropping one source and not the others, both refusal paths, and the
  named gaps.
- Six widths across every workspace route: **problems none**. Investigate is 1.45 screens at 1440
  with its first box at 429px — unchanged, because the lookup replaced the paragraph that was there
  rather than being added below it.

### Known limits

- **Filled, the page runs to 1.84 screens at 1440.** That is not this change: filling the same seven
  by hand measures 1.84 too, and the growth is the reading appearing, which is the page doing its
  job. On a phone the difference is real — 3.65 against 3.31 — and it is the provenance block and
  the industry warning. Combining them into one block took it from 3.83.
- **US GAAP only.** An IFRS filer's figures cannot be read; it says so rather than showing an empty
  form. An IFRS concept map is its own piece of work.
- **Operating profit is often not tagged**, including by Exxon and Pfizer. It is not derived from
  total costs: that subtraction gives operating income wearing the name of gross profit.
- **Company facts can lag a filing** (TSMC, measured 2026-09-10). The period read is the newest
  company facts holds, and the filing named is the one that reported it — not necessarily the
  company's newest.
- The reasons a figure could not be filled are not saved; they last the visit that fetched them.
  The empty box and its "?" still say what the figure is.

## 2026-09-11: the research record, and evidence for and against

R2 in the research roadmap. Committed work up to this point is `fb65670`.

### Built

- **A record for every investment in the catalogue, held or not.** The three note boxes used to
  appear only once something was in the portfolio, so the one conclusion a beginner most needs to
  keep — "I read this and decided against it" — had nowhere to go. It now sits inside each
  catalogue entry, and writing in it starts the record if there is none.
- **Where this stands**, as the learner's own judgment: still reading, worth a closer look, decided
  to buy, decided against. Choosing "decided against" opens a box for the reason. Studio never sets
  the judgment: adding a position leaves it at "still reading", because owning something in a draft
  portfolio is not the same as having concluded anything about it. Where the two disagree — rejected
  but still held — the page says so instead of quietly removing the position.
- **Evidence for and against.** Each piece says which way it argues (for it, against it,
  background), points at one of the sources listed in that same card, takes an optional "where in
  it", and carries the learner's own words. Nothing counts the sides or draws a verdict from the
  balance: two weak reasons for and one decisive reason against is an ordinary shape for a decision,
  and a tally would misrepresent it.
- **Sources have ids now**, so a saved note points at a specific document. For anything filed with
  the SEC the id is the accession number, which is what EDGAR calls the filing and what a filing
  read inside Studio already carries — nothing new was invented. The one source that is not a
  filing, the Treasury auction page, gets a readable slug. Evidence whose source has since left the
  catalogue says so rather than showing a label that no longer matches what was read.
- **The Overview says where each one got to** — "Decided against · not in your portfolio; your
  notes are kept · 1 thing you read" — so a rejection is findable, not merely stored.
- **A control that said "Remove" twice.** The catalogue card's own Remove takes the position out of
  the portfolio; the evidence list's took a note away. Two controls reading the same word in one
  card is ambiguous to anyone navigating by control rather than by sight, and it caught a test
  written by someone who knew the layout. The evidence one is now "Remove this note".

### Verified

- `tsc` 0. Lint clean apart from the two older onboarding warnings. Vitest 50 files, 642 tests
  (12 new: ten on the operations, two on source identity).
- Playwright on a production build: **95 passed, 4 skipped, none failed**. Eight new checks, every
  one of them reading IndexedDB or the app's own backup file rather than the screen — what is on
  screen a moment after typing proves only that React has state.
  - A note kept for an investment in no portfolio, with nothing added to one to make it possible.
  - A rejection and its reason reaching storage.
  - Moving off "decided against" keeping the reason, so a misclick costs nothing.
  - Evidence saved with its role, its locator and an SEC accession as its source id.
  - Both sides kept, in order, with no tally on the page.
  - **A rejection outliving the position and a reload**: added to the portfolio, rejected with a
    reason and a piece of evidence, then removed and reloaded. Under v1 this deleted the research.
  - **Evidence surviving a real backup and restore**, taken through the app's own download button
    and file input, with a reset in between so the restore had something to restore.
- Six widths across every workspace route: **problems none**, and every figure identical to before
  this change. The record costs nothing at rest because it lives inside a card the learner opens.
- The source-identity test was proved able to fail by changing one accession by a digit.

### Known limits

- **An open catalogue card is long, and was before this.** Measured at 1440 by removing the record
  from the flow and reading the page again: 2.13 screens with a card open and no record, 2.46 with
  it. At 390 it is 4.09 and 4.80. So the record costs 298px and 595px; the card itself is what needs
  shortening, and that is separate work.
- With the evidence form open and one piece saved, an open card reaches 3.00 screens at 1440 and
  5.70 at 390. Both are states the learner opened deliberately.
- `openQuestions` is still written by nothing. It is in the record, and the text export prints it,
  but no surface collects it. Unchanged by this work rather than made worse.
- The status radios are visually hidden inside their labels. Mouse and keyboard both work — arrow
  keys move between the four and write the change — but an automated tool clicking the input rather
  than the label will miss, which the specs handle by clicking the label as a person does.

### Next concrete action

R4 in the roadmap: the reader with whole sections and find-in-filing, which would take the outside
websites needed to finish the Atkore journey from two to one, and would let a passage be saved as
evidence straight from the filing — which is what the record was built to receive.

## 2026-09-13: the whole report, searchable, with passages kept as evidence

R4 in the research roadmap, with the user's decision that passages attach to the company's
investigation in Investigate rather than to a catalogue record. Committed work up to this point is
`ccb980c`.

### Built

- **Every section readable in full, a page at a time.** The reader showed 2,600 characters of each
  section and linked to sec.gov for the rest. Atkore's first mention of PVC resin, the input whose
  price moves its margins, is 8,274 characters into its business section, where no excerpt reached.
  Pages break between paragraphs, never inside one.
- **Pages sized by the height they take, not by characters.** Counting characters, a page of
  management's discussion that was really a financial table — dozens of one-line paragraphs —
  rendered 1,708px at 1440 against 968px for business prose of similar length. The model was
  calibrated on 56 paragraphs measured in the reader: a 643px column, 28px lines, 89 characters to a
  line, and a Keep button that makes each paragraph's last line 32px. It put every one on the right
  number of lines, and on four whole pages its estimate matched the measured height to the pixel.
- **Find in this report.** Ignores capitals and spacing; does not stem, guess synonyms or rank. Each
  hit names its section and page, with about eight words either side, eight at a time. It searches
  the seven sections the reader extracts, and the page says so.
- **Keep a passage.** A Keep beside every paragraph keeps it; selecting words inside the paragraph
  first keeps just those. It goes to the learner's investigation of this company, matched on the
  SEC's company number, on a passage already kept from it, or on EDGAR's exact name — never on a
  name that is merely close. With no such investigation, keeping starts one and says so, and Undo
  takes back both. A passage arrives as background; the judgment is made in Investigate. Each Keep
  is named for its paragraph's number and opening words, so no two on a page share a name.
- **Kept passages in Investigate**, under "From its own filings", absent until one is kept: the
  quote, where it came from, For it / Against it / Background, what it shows, "Open it in the
  report", and Remove. Deleting the company warns that its passages go too.
- **Found again in a fresh copy of the report.** Opening a kept passage sends its anchor — the exact
  words, 32 characters either side and where it began — to a new route, which fetches and
  re-extracts the filing and looks across the whole section by position, then by the words with
  their surroundings, then by the words alone, then ignoring spacing and capitals. When it has
  moved the page says so; when it cannot be found the learner is told, with a search for its
  opening words.
- **Report fixtures instead of sec.gov in the browser tests.** `OPS_EDGAR_FIXTURE_DIR`, set only in
  `playwright.config.ts`, serves Atkore's FY2025 10-K trimmed from 2,358 KB to 108 KB of its own
  text, a minimal filing index, and passages anchored in the live filing. A missing fixture is "not
  found"; nothing falls through to the network. See `e2e/fixtures/edgar/README.md`.

### Found and fixed on the way

- **Storage refused every whole paragraph.** The validator checked a kept quote with the rule for
  ids, which stops at 200 characters; paragraphs run past 2,000. The unit test used a 71-character
  quote and passed. The browser suite caught it. There is now a test at 2,303 characters, the
  longest paragraph in Atkore's business section.
- **Investigate's autosave would have deleted kept passages.** It rebuilds the record from what is on
  its page, and its page knows nothing of passages. `saveInvestigation` now carries them over, and
  a test types a figure after keeping one.
- **A search hit arrived before the page did.** The workspace shows "Opening your work…" until saved
  work loads, so the browser's jump to `#passage` found nothing. The passage now brings itself into
  view when it appears.
- **The heading block was 170px at 1440**, because the long facts line pushed search underneath it;
  it is 92px. The section tabs wrapped to two rows and are one.
- **Two code comments said things that were not so**: that the catalogue imports `edgar.ts` (it has
  its own copy of the helper), and that filings repeat their own subheadings (never checked). Both
  were rewritten to what is true.

### Verified

- `tsc` 0. Lint clean apart from the two older onboarding warnings. Vitest 54 files, 691 tests: 49
  new, on paging and the height model's two measured line breaks, search, kept passages and their
  validation, and anchoring.
- **Anchoring on text that really shifted.** Four sentences were anchored in the live filing's text
  and looked for in the fixture, whose spacing differs. Before checking, the strategy for each was
  written down from why it should hold: the two whose context stays inside their paragraph by
  context, the two whose context crosses a line break by the words alone. All four held. One word
  changed is not found.
- Playwright on a production build with fixtures: **108 passed, 4 skipped, none failed**. Thirteen
  new checks, reading IndexedDB rather than the screen: paging; PVC resin found in four sections,
  and a hit opening the passage marked and in view; distinct Keep names; every reading and search
  view within budget; a kept paragraph starting an investigation of Atkore Inc.; a selection keeping
  only its words; keeping twice keeping once; undo; an existing investigation receiving the passage;
  passages surviving Investigate's autosave; a role and note stored; a passage reopened from
  Investigate landing marked; and, through a real backup and restore, a passage anchored in the live
  filing found again after the text shifted, with the moved note, beside one whose words are gone,
  reported missing with a search.
- Six widths across every workspace route and seven reader views: **problems none**. At 1440 the
  reader's first page is 1.22 screens, other pages 1.41 to 1.43, searches 1.00 and 1.34, and a page
  carrying the moved note 1.50. Every other Studio route measures as it did before.

### Known limits

- **Outside websites needed to finish the Atkore journey: 1**, down from 2 — the broker quote in
  What to buy, which is R5.
- The height model is calibrated at 1440, where the budget is measured. At 390 reader pages measure
  2.80 to 3.35 screens, and at 1024 up to 1.96.
- Not in the budget: the confirmation under a paragraph just kept, and the "Kept in …" line under
  each paragraph already kept. Each adds a line; neither was measured.
- A selection running from one paragraph into the next keeps the whole paragraph whose Keep was
  pressed, not the selection.
- Anchoring is proved on one real kind of shift, re-flowed spacing between two extractions of one
  filing. Other changes to the extractor are covered only by the unit tests' constructed cases.
- As decided, passages from the reader go to company investigations; a catalogue investment's record
  still cites only its listed sources.
- A dev server that Playwright reuses without `OPS_EDGAR_FIXTURE_DIR` fetches live. Reuse stays off on
  the production path.

### Next concrete action

R5 in the roadmap: research prices in the app, which removes the broker quote, the last outside
website on the Atkore journey. The smaller alternative is shortening the open catalogue card, 2.13
screens at 1440 before R2's record was added to it.

## 2026-09-13: can Studio price what a learner buys? A research pass before R5

R4 is committed as `550e130`. Nothing was built in this pass; the findings are in
[`studio-fund-prices.md`](../source-audits/studio-fund-prices.md).

### Why it was needed

Checked against Studio's price snapshot, R5 as written would have priced one more investment. Apple
had a dated quoted price and the Treasury note its auction price, but VTI, VOO, VXUS, AGG, SGOV and
TSMC's American share had none: the snapshot is built from the holdings of stock index funds, which
hold stocks rather than other funds.

### Found

- **All six can be priced from other funds' holdings filings**, dated, at quoted market prices. On the
  newest usable date, 30 June 2026: VTI $370.04, VOO $686.81, VXUS $85.49, AGG $98.98, SGOV $100.67,
  TSMC's American share $477.57.
- **The method was checked where it could fail.** Unrelated funds reporting the same month-end agreed
  to the cent on every date where more than one was read, for all six, with as many as nine funds on
  one date.
- **A price is about two months old when it becomes usable:** filings went public 37 to 60 days after
  the month they report.
- **Names are not a safe key.** Matching "Taiwan Semiconductor" also finds a different company at
  $2.03. A price must be matched on the CUSIP of the listing a learner buys.
- **Routes that do not work:** the funds' own shareholder reports tag no per-share value; the SEC's
  quarterly holdings data sets would work but run to 387–483 MB each and are not needed.

### Limits

- A price exists only while other funds hold the investment. VXUS is the thinnest, with two agreeing
  funds on 30 June.
- EDGAR's full-text search returned server errors when queried 400ms apart, and succeeded 1.5 seconds
  apart with retries.
- That funds file holdings every month was observed in these filings, not read in the rule.

### Next concrete action

R5, built as `studio-fund-prices.md` suggests: a source step that records each catalogue investment's
CUSIP, finds holders through full-text search, reads a few small filings, and takes the newest
month-end on which at least two unrelated funds agree; then "What to buy" starts from that dated
price, with the broker's quote as an optional override.

## 2026-09-13: What to buy starts from a dated price

R5 in the research roadmap. The research notes behind it are committed as `2a8c8f5`.

### Built

- **A dated price for every investment in the catalogue.** Seven come from other funds' SEC holdings
  filings, all for 30 June 2026: VTI $370.04, VOO $686.81, VXUS $85.49, AGG $98.98, SGOV $100.67,
  AAPL $289.36 and TSM, the American share, $477.57. The Treasury note keeps its auction price,
  99.540696 per $100 of face value on 12 August 2026.
- **`scripts/source/fetch-catalog-prices.mjs`**, reading `catalog-prices-manifest.json`. For each
  listing it finds holdings filings that name its CUSIP through EDGAR's full-text search, paced
  1.5 seconds apart with retries; reads the most recently filed of them, skipping any over 4 MB,
  with the extraction rules `prices.ts` already had; keeps only holdings of that exact listing; and
  takes the newest month-end on which funds under two different registrants agree within the
  snapshot's own tolerance. It writes `lib/studio-project/data/catalog-prices.json` and the audit
  page `docs/source-audits/studio-catalog-prices.md`, naming every filing that agreed.
- **`lib/studio-project/catalog-prices.ts`**: the selection rules, pure and unit-tested. A price is
  one a fund actually reported, never an average. A newer month-end that only one registrant
  reported is set aside with the reason, not skipped silently.
- **The catalogue** records each listing's CUSIP and a sentence saying what its price is, and reads
  its prices from the data file. A missing or malformed entry gives no price, and the worksheet
  asks for a broker quote as before.
- **What to buy** no longer says Studio holds no market prices. Under each investment a line says
  which price its amounts are worked out from, and the date that price was true. The broker price
  fields are marked optional, and an entered price replaces the one on record for that investment.
  The worksheet's warning now reads "This is the last price on record, not today's."

### Found and fixed on the way

- **A date check rejected every price, silently.** A backslash was lost between my edit and the
  file, turning `\d` into `d`, so no date matched. Type-check passed, because the broken pattern
  was still a valid one. The catalogue tests passed too, because the old guard only checked that
  nothing but the Treasury note had a price. It is now written without backslashes, and the
  rewritten test, which asserts that every entry is priced, would have failed on it. This is the
  same lost backslash that broke R4's Keep-button pattern; patterns are now written with `[0-9]`.
- **"Unrelated funds" said more than the rule does.** The rule counts registrants, and AGG's three
  are two Columbia trusts and Catalyst. The code and audit page now say "registrants" and state that
  one sponsor can file under two; the sentence a learner reads no longer claims a count.
- **The guard test was rewritten, not deleted.** It said a fund gaining a price "is a licence
  question and not a detail to slip through". It now states the new rule and why that question is
  answered: SEC terms allow the filings to be copied and redistributed, and each price needs funds
  under two registrants to agree.

### Verified

- `tsc` 0. Lint clean apart from the two older onboarding warnings. Vitest 55 files, 702 tests: 11
  new, nine on the selection rules and two on the catalogue's prices.
- **The script re-derived the research pass's prices through the app's own extraction rules**, and
  all seven were identical to the figures read by hand earlier the same day.
- Playwright on a production build: **110 passed, 4 skipped, none failed**. Two new checks: with a
  portfolio of VTI and AGG, What to buy works out both from dated prices with no broker quote and
  flags each as not today's; and an entered broker price replaces the price for that investment
  only.
- Six widths across every workspace route: problems none, every figure as before. What to buy with a
  two-investment portfolio measures 1.44 screens at 1440, the first time it has been measured with a
  portfolio in it; 2.14 at 1024 and 3.22 at 390.

### Known limits

- **A price is two to three months old when a learner sees it.** On 13 September the newest
  usable month-end is 30 June. Every price shows its date and says it is not today's.
- A price exists only while other funds hold the listing. VXUS has two registrants, and all 19 of
  its holders were read.
- Registrants are the nearest thing the filings record to independence, not a perfect one.
- The refresh is a script someone runs once a month, not automatic.
- The Treasury note's price is what it sold for at auction, not a market price since.

**Outside websites needed to finish the Atkore journey: 0**, from 4 when the research report measured
them.

### Next concrete action

Commit R5. Then, from the roadmap, R6: fund returns and costs from shareholder reports. The smaller
alternative is shortening the open catalogue card in Research, 2.13 screens at 1440 before R2's
record was added to it.

## 2026-09-13: fund returns and costs from annual reports

R6 in the research roadmap, the last of the six items listed before or alongside the research record.

### Built

- **Each fund's card in Research shows what it returned and cost, from its own annual report.** A
  table gives the average return a year over 1, 5 and 10 years, or since a younger share class began.
  A sentence gives the date the periods end, says the figures are before any tax, and says what the
  share class cost over that year on $10,000. The card quotes the report's own statement that past
  performance does not predict. The block sits after the fund's main risks. Company shares and the
  Treasury note show none.
- **The figures, for the year each report covers:** VTI 17.14%, 13.08% and 14.25%, and VOO 17.84%,
  14.38% and 14.78%, both to 31 December 2025; VXUS 24.83%, 11.27% and 7.86%, to 31 October 2025;
  AGG 6.24%, 0.41% and 1.94%, and SGOV 4.11%, 3.35% and 2.91% since 26 May 2020, both to 28 February
  2026. Costs on $10,000: $3, $3, $7, $3 and $9.
- **`lib/studio-project/fund-reports.ts`**, pure and unit-tested. It reads a report's contexts and
  facts for exactly one share class; takes the return series the report prints as net asset value,
  every figure of which must equal a tagged fact; reads the year's costs; and refuses, with the
  reason, whatever cannot be checked. It also reads a filing's EDGAR header and checks a ticker three
  ways.
- **`scripts/source/fetch-fund-reports.mjs`**, reading `fund-reports-manifest.json`. It finds each
  share class in the SEC's fund ticker list, reads the registrant's annual reports newest first by
  their EDGAR headers, tens of kilobytes each, until one lists the class, and only then fetches that
  report's data file, 0.67 to 9.12 MB. It writes `lib/studio-project/data/fund-reports.json`, a
  verbatim excerpt per fund under `fund-report-excerpts/` (23 to 55 KB), and the audit page
  `docs/source-audits/studio-fund-reports.md`. It refuses to write if an excerpt does not read exactly
  as the whole report does.
- **The catalogue** carries each fund's report and lists it among the card's sources, so it can be
  cited as evidence in the research record.

### Found and fixed on the way

- **VOO's report labels its two return series the wrong way round in its data file.** VTI's report
  tags net asset value with no further dimension and market price on the sales-load axis. VOO's,
  filed the same day, does the opposite, and puts the "Net Asset Value" label on the market-price
  figures: 17.82% for the year, against the 17.84% it prints. Choosing by tag or by label would have
  shown the wrong series for one of the two. Studio takes the printed row instead, and VTI's and
  VOO's prospectuses, in Mission 12's records, give the same figures. The audit page records the
  disagreement.
- **VXUS has two true costs.** Its report year cost 0.06%; the prospectus of February 2026 in the
  catalogue gives 0.05%. The card says where each comes from rather than choosing one, and a test
  pins VXUS as the only fund where they differ.
- **SGOV's card made the whole page scroll sideways on a phone.** At 390px its "Since 26 May 2020"
  heading would not wrap, and the card list is a grid, whose items grow to fit such content, so every
  card widened to 418px. The cards may now shrink (`min-w-0`), and the "Since" heading wraps. Fixing
  that exposed two more faults at 390. VTI's table needed 334px of the 324 available and scrolled
  inside its box, so the padding after each column is now 12px, and none after the last. And with
  every heading free to wrap, SGOV's "5 years" split over two lines and read as two labels, so only a
  "Since" heading may wrap. Each fault has a test, and each test failed against the build that had
  the fault: by 44px, by 10px, and by a second line.
- **The data test first built its excerpt path with `new URL(..., import.meta.url)`, which under
  vitest resolved to a file named "undefined".** It resolves from the repository root instead.

### Verified

- `tsc` 0; lint clean on every changed file. Vitest 57 files, 730 tests, 28 new: 19 on the reading
  rules, 6 reading the data against its excerpts, 3 in the catalogue.
- **The checks can fail.** Four deliberate breaks in the reading rules each failed at least one test:
  taking the first series, reading every share class, counting an index as a series, and missing the
  leap day in a ten-year period. So did four edits to the data file: VOO given its market-price
  figure, VTI tagged with the Admiral ticker, AGG pointed at another share class, and SGOV's cost
  changed by hand. The files were restored and compared after each.
- **The check this roadmap item names is met.** Every figure equals the tagged fact: the data test
  reads each verbatim excerpt again and must get the data exactly. Every share class is matched to
  its ticker by three records that agree, and the four funds in Mission 12's records name the same
  classes. Where the periods coincide, VTI's and VOO's figures equal their prospectuses'.
- **The script was run twice**, and the second run wrote identical data and excerpts. It dates its
  retrieval in UTC, so the audit page says 14 September.
- Playwright on a production build: **114 passed, 4 skipped, none failed**, with the four new checks
  as first written. After the three phone fixes the app was rebuilt, and the Research specs, now with
  a fifth check, re-ran on the final build: 15 passed.
- Six widths across every workspace route: problems none, and every height as before. That was
  measured on the build before the heading fix, which changes only an opened card. With one card
  open at a time, the returns block adds 141px at 1440 for VTI and SGOV and 161px for VXUS, whose
  card carries the sentence about its two costs; at 390, 241, 201 and 261px. No page scrolls
  sideways at any width, and no table scrolls inside its box at 390.

### Known limits

- **An open fund card is long, and longer now.** At 1440 VTI's is 2.70 screens, and 2.52 without the
  returns block; R2 measured 2.46 with the record. The report's line in the sources list is not
  counted in the "without" figure. The card needs shortening as a whole, which is still separate work.
- **Figures are as old as the report.** VXUS's run to 31 October 2025, so on 13 September 2026 they
  are over ten months old; the card shows the date the periods end. The next annual reports cover
  the years to 31 December 2026, 31 October 2026 and 28 February 2027, and the refresh is a script
  someone runs.
- **Returns are shown at net asset value only.** The market-price series is read and recorded on the
  audit page, not shown. In these reports it is within 0.23 of a percentage point, the widest being
  VXUS's year: 24.83% against 24.60%.
- **SGOV's figures rest on the tags alone.** Its report tags one return series for the class and no
  returns table the data file carries, so there is no printed row to check them against. The audit
  page says so.
- Distributions are not shown, and semiannual reports, which carry costs but not returns, are not
  read. A "since" period is named by the date its context starts, not by the report's own wording.

### Next concrete action

Commit R6. Then, from the roadmap, Phase 2, starting with R7: a peer set for Atkore. The smaller
alternative is shortening the open catalogue card in Research, now 2.70 screens at 1440 for VTI.

## 2026-09-13: Atkore's peers, chosen by product

R7 in the research roadmap, the first item of Phase 2. R6 is committed as `eb05c4d`.

### Built

- **The industry view offers "Atkore's peers, by product".** It says why Atkore is there: the SEC files
  it under industry code 3690, where it lists mostly battery and EV-charger makers, so the set is
  chosen by what Atkore's own annual report says it makes, with that passage one click away. Each peer
  has a row: its filing, why it is in, what its annual report says it makes, and what the company
  mostly does. The seven competitors no SEC filing covers are named in a sentence, with the reason for
  each one click away, and so are the five companies a search found but left out. Choosing the set
  hides the SEC-industry share figures, which mean nothing for a hand-chosen set.
- **The set.** Atkore's 10-K names eleven main competitors across its two segments. Nucor, Eaton,
  Hubbell and nVent file annual reports and are in. Westlake, which Atkore does not name, is in because
  its own report says it makes conduit pipe; a full-text search for "electrical conduit" found it.
  Missing: Zekelman, Mitsubishi, Southwire, Dura-Line, Prysmian, ABB and Haydon. Left out: Quanta,
  Otter Tail, Advanced Drainage Systems, Worthington and Fastenal. The eight product phrases searched
  were "electrical conduit", "PVC conduit", "metal-clad cable", "electrical metallic tubing", "cable
  tray", "metal framing", "HDPE conduit" and "armored cable", in 10-Ks filed from 1 January 2025.
- **`lib/studio-project/peer-sets.ts`**, pure and unit-tested. It reads a filing's text so a quote can
  be found word for word; reads the competitor list a company prints into names by segment, keeping
  "Industries, Inc." whole; checks every named competitor is accounted for exactly once; tells from a
  filing history whether a company still files annual reports; and counts a word over a whole report.
- **`scripts/source/fetch-peer-sets.mjs`**, from `peer-sets-manifest.json`. Before writing anything it
  checks against EDGAR: Atkore's latest annual report is the one quoted and holds every quoted passage;
  every competitor it names is in the set or on the missing list; each peer still files annual
  reports, its latest is the one quoted, and it holds the passages quoted from it; each company found
  by search is found by that search again; each missing company files no annual report under any SEC
  record given, and the filings its note describes exist; each reason that says a word appears once is
  counted over the whole report; and the short list of what Atkore makes uses only its own words. It
  writes `lib/studio-project/data/peer-sets.json` and `docs/source-audits/studio-peer-sets.md`. A set
  with a failed check is not shown.
- **Investigate's note** about a company in an industry Studio has not researched links to the set
  when there is one: "See Atkore's competitors, chosen by what they make". The industry view opens on
  the set from `?set=atkore`.

### Found and fixed on the way

- **A quote copied from the fixture did not match the live filing.** Atkore's report closes an italic
  span just before "Infrastructure:"; the fixture, rebuilt from extracted paragraphs, reads
  "Infrastructure :". The script caught it. Text reading now drops a space before closing punctuation,
  so both read alike, and the manifest quotes the live filing's spelling.
- **A form the script required for Southwire did not exist.** Its 2013 filing is the tender-offer
  notice; the offer itself was filed on 6 January 2014. The note was right and the required forms were
  wrong. They are now the filings as dated.
- **Two reasons said "only" on the strength of a partial read.** "Conduit" was then counted over the
  whole of Otter Tail's and Advanced Drainage Systems' reports: once each, in a lawsuit's allegation and
  in a joint-venture note. The reasons now say exactly that, and the script counts again on every run.
- **The first passage script matched nothing.** A shell heredoc collapsed `\\s` to `\s`, which a
  JavaScript string reads as a plain "s", so "electrical conduit" never matched and 26 MB were read for
  nothing. Scripts with patterns are now written with the Write tool, and the rewrite tested its own
  pattern before making any request.
- **The set was too long, and its chip pushed the industry view over budget.** The first version was
  2.47 screens at 1440, and the industry view went from 1.46 to 1.51 because the new chip wrapped to a
  second row. Passages went behind "Its own words" and "Why each is missing", peers became rows, and the
  heading's description became one line: 1.55. A wrapped "Annual report, 2025" was making most rows a
  line taller; with a shorter link and tighter spacing, 1.42. A browser test now fails if either view is
  over 1.5 at 1440. It failed on the industry view at 1.512 on the first build, and on the set at 1.552
  on the second.

### Verified

- `tsc` 0; lint clean on every changed file. Vitest 59 files, 749 tests, 19 new: 12 on the rules, 7
  checking the set against Atkore's own report in the fixture.
- **The checks can fail.** Ten deliberate breaks each failed at least one test. Five in the rules:
  splitting "Inc." from its name, counting a deregistration from before the latest annual report,
  letting a space before a colon matter, accepting a list whose end cannot be found, and treating inline
  tags as word breaks. Five in the data: dropping Haydon, leaving Westlake with no reason, changing a
  word in Atkore's quote, recording a failed check, and putting a left-out company in the set. The files
  were restored and compared after each. The word count and the short product list came after that run
  and have their own tests.
- **The check this roadmap item names is met.** The Find step shows why Atkore appears, in its own
  report's words, and every peer has a stated reason with a filing to check it in. The browser tests
  and the data test both require it.
- **The source script ran clean against EDGAR**: every passage, filing record, search result and count
  confirmed, 13.19 MB read.
- Playwright on a production build of the final code: **121 passed, 4 skipped, none failed**, with six
  new checks, and the Investigate test now requires the link to the set.
- Six widths across every workspace route: problems none. The industry view is 1.48 screens at 1440.
  Atkore's set is 1.42 at 1440, 1.48 at 1280, 1.44 at 1024 and 2.58 at 390; with the left-out list open,
  1.71 at 1440.

### Known limits

- **One set, for Atkore.** Any other company whose industry code Studio has not researched still gets
  only the note that says so.
- **Hand-chosen, then checked, not discovered.** A competitor that Atkore does not name and none of the
  eight searches finds is absent without a word. Hubbell is in on Atkore's naming alone: its own report
  describes no overlapping product in words a search finds, and the set says so.
- **No figures yet.** Revenue, margins and returns for the peers are R10's peer screen. Investigate
  still compares Atkore's figures with semiconductors, and says so.
- **A missing company's record is matched by name**, as EDGAR's company search returns it: Dura-Line
  Corporation to Dura-Line Holdings, for instance. No corporate relationship is stated beyond that.
- **The set goes stale** when Atkore or a peer files a new annual report. Atkore's next covers the year
  to 30 September 2026. The script then reports a problem, and Studio hides the set until the manifest
  is reviewed and the script run again.
- The industry heading's description was shortened to fit the extra chip row, from "who competes and
  how much of the split has changed" to "Look at the industry before deciding whether any one company is
  worth your time".

### Next concrete action

Commit R7. Then R8: product lines, regions and customers from Atkore's filing data file, checked by the
shares reconciling to total revenue.

## 2026-09-13: where revenue comes from, read from the filing's data file

R8 in the research roadmap. R7 is committed as `87f6b73`.

### Built

- **A "Where revenue comes from" tab in the company-report reader, on annual reports**, right after
  Business, which says in words what the company sells. The tab shows the same report's own figures:
  revenue by product line (with the segment each sits in), by region and by segment, each with its share
  and amount, and the customers the company depends on, as a share of sales or of what customers owed at
  the year end. For Atkore's year to 30 September 2025: six product lines, four regions and two
  segments, each adding exactly to $2,850m; Sonepar USA is 10% of sales, and Sonepar USA and CED National
  are 13% and 12% of what customers owed.
- **`lib/filings/revenue.ts`**, pure and unit-tested. It reads a filing's XBRL data file and its labels,
  from the label file or from the schema, where Nucor keeps them; takes the year's total revenue in US
  dollars; and builds each breakdown, shown only when its parts add up to that total within the rounding
  the filing declares. Where every part together overshoots, it uses the largest set that adds up, if no
  other set of that size does and each part left out is the sum of parts kept. Customer concentration is
  read as a share of sales or of receivables, and nothing else.
- **`lib/filings/revenue-source.ts`** finds the data and label files in the filing's index, fetches them
  through two new helpers in `lib/filings/edgar.ts`, and caches the answer for a week. An EDGAR failure
  is never cached, and test-fixture answers are kept apart from live ones.
- **`scripts/source/check-revenue-breakdowns.mjs`** runs the same rules over eight companies' latest
  10-Ks and writes `docs/source-audits/studio-revenue-breakdowns.md`.
- **Fixtures:** Atkore's filing index as EDGAR serves it, and its data and label files trimmed to 47.5 KB
  and 21.1 KB, written only after they read exactly as the full files do.

### Found and fixed on the way

- **Filings tag more than clean breakdowns.** Apple's "Products" row is the sum of four others; Nucor
  tags intersegment amounts beside segment sales; Netflix tags one region on its own, 41% of revenue;
  Hubbell tags a restatement axis. Each is now handled or refused with its reason.
- **Eaton's total is tagged twice**, $27,448m and $27.4bn, and the first rule, wanting one value, read
  nothing. Figures that round to each other at their own stated precision are now one total; figures
  that do not are refused, and the page says why.
- **The rounding allowance was looser than claimed.** First a floor of 0.01% of revenue, then a
  floating-point term of a billionth of revenue, $3 on $3bn, let parts a dollar past the rounding
  through. It is now the declared rounding and only true floating-point error, and a test fails at one
  dollar over.
- **Revenue in another currency would have been printed as dollars.** Units are now read, and anything
  but US dollars is refused by name.
- **Four of ten deliberate breaks first went unnoticed**: a restatement axis combined with a breakdown
  axis, eliminations counted in, the subtotal check skipped, and credit exposure read as a customer
  share. Four tests were added from real cases, among them Nucor's eliminations and Apple's credit
  exposure, and all ten breaks now fail a test.
- **A browser check matched the wrong row.** "Electrical" found the product line "Metal Electrical
  Conduit and Fittings" before the segment. Each list is now named by its heading and rows are matched by
  exact name, which also helps anyone using a screen reader.
- **The new tab was out of view at 1440**, at the end of a row that scrolls sideways. It now sits right
  after Business.
- **The reader's header was squeezed on a phone, before this work.** At 390 the facts under the title
  kept their row beside the search box and ran one word to a line. The column now has a width of its own:
  the reader's Business page fell from 2.63 to 2.09 screens at 390, and the revenue tab from 2.83 to
  2.29. Both new checks failed against the build before the fix, with a facts column 23px wide and "Risk
  factors" second in the row.
- **A long shell heredoc failed to parse** again, before anything ran. The patch scripts were written as
  files instead.

### Verified

- `tsc` 0; lint clean on every changed file. Vitest with the other session's `tmp/` copy excluded: 60
  files, 771 tests, 22 new in `lib/filings/revenue.test.ts`. Run over the whole folder, vitest also picks
  up `tmp/homepage-redesign/review/`, a gitignored review copy holding Playwright specs, which fail under
  vitest. None of it is this work's, and it was not touched.
- **The checks can fail.** Ten deliberate breaks in the rules each failed at least one test, and the file
  was restored and compared after each.
- The rules on Atkore's real, untrimmed files gave the figures above, and the trimmed fixtures read the
  same.
- **Live:** on a preview server fetching from EDGAR rather than fixtures, the tab rendered the same
  figures, and the browser test passed against it.
- Playwright on a production build: **129 passed, 4 skipped, none failed**, with seven revenue checks
  among them.
- Six widths across every workspace route: problems none. The revenue tab is 1.23 screens at 1440
  (1,106px), 1.32 at 1280, 1.40 at 1024, 1.69 at 768 and 2.29 at 390, with no sideways scroll anywhere.
- **Coverage, 35.14 MB read:** for all eight companies, every list shown adds up. Not shown: Nucor's
  regions and nVent's product lines, which are not tagged, and Eaton's product lines, which come to 82.3%
  of its revenue.

### Known limits

- **Annual reports under US accounting rules only.** Quarterly reports do not offer the tab, and 20-F and
  40-F filers tag accounting concepts this does not read.
- **One year**, the one the report covers. No trend across years yet.
- **Names are the filing's own labels**, as written: Atkore's "UNITED STATES" in capitals, nVent's "One
  Customer". Where a filing has no label, a member's own name is split into words, which can read
  awkwardly.
- **Customer concentration only where it is tagged.** A customer named only in the words of Business is
  not picked up, and not tagged does not mean no large customer; the page says the data file "tags no
  single customer's share".
- **A first visit fetches the files.** Only the answer is cached, so the first visit to a filing's tab
  reads its data and label files, 3.5 MB for Atkore.
- The tab is not yet linked from Investigate.

### Next concrete action

Commit R8. Then R9: input-cost series, each tied to an input the filing itself names, checked by every
series citing that passage.

## 2026-09-13: what Atkore's inputs cost, each index tied to the passage naming its input

R9 in the research roadmap. R8 is committed as `1ded065`.

### Built

- **An "Input costs" tab in the company-report reader, on Atkore's annual report for the year to 30
  September 2025**, after "Where revenue comes from". A learner can:
  - read what the report says its input costs did in fiscal 2024 and 2025, for the whole company and each
    segment, as the report's own words, each opening the whole sentence marked in the report, where it can
    be kept as evidence;
  - set beside that the nearest producer price index for each raw material the report names, with how near
    it is, a link to the passage naming the input, and its change by fiscal year: steel mill products
    −8.2% and −2.5%, copper and copper alloy rod, bar and shapes +3.9% and +12.3%, thermoplastic resins
    −4.3% and −0.5%, for fiscal 2024 and 2025 against the year before;
  - see the three indexes month by month, rebased so fiscal 2023's average is 100, because their own base
    periods, 1982 and December 2003, make their raw numbers incomparable;
  - read, on the page, that moving the same way is not proof and moving differently is not disproof, and why.
- **The roadmap's check, every series cites that passage, is enforced three times**: when the data is built,
  against the live filing on EDGAR; in the data test, against the fixture copy; and when the page is drawn,
  against the copy being read, where an index or sentence whose passage cannot be found is not shown and the
  page says how many were not.
- **`lib/studio-project/input-costs.ts`**, pure and unit-tested: BLS months, with preliminary months marked
  and BLS's annual average left out; fiscal years; an average only over all twelve months; year-on-year
  change; rebasing; naming a word only as a word; and placing a sentence in the management's discussion by
  the headings above it, so its year and segment are read, not assumed.
- **`scripts/source/fetch-input-costs.mjs`** with `input-costs-manifest.json` writes
  `lib/studio-project/data/input-costs.json` and `docs/source-audits/studio-input-costs.md`: one BLS query for
  eight series, three chosen and five considered and not chosen; each series' BLS page, for its title and
  base period; and Atkore's filing record and report from EDGAR, 2.79 MB. A newer annual report, a title
  that differs from BLS's, a missing or preliminary month in a compared year, or a mention of input costs
  not accounted for is written as a problem, and Studio then shows no tab.

### What the evidence shows (inferred, not a finding about Atkore)

- **Fiscal 2024.** The report says cost of sales fell partly on "lower input costs of steel, copper and PVC
  resin of $103.1 million". Steel and resin indexes fell, 8.2% and 4.3%; every copper index checked rose:
  rod, bar and shapes 3.9%, the wider mill group 3.9%, wire and cable 5.1%. The sentence names the three
  together, so it need not mean each one fell. That is the kind of thing a learner should notice and weigh.
- **Fiscal 2025.** Electrical's earnings fell on "lower average selling prices and higher input costs";
  Safety & Infrastructure's rose on "decreases in input costs outpacing decreases in selling prices".
  In Atkore's own words (R7), Electrical makes metal and plastic conduit and electrical cable, and Safety &
  Infrastructure mechanical tube and metal framing. Copper rose 12.3% and steel fell 2.5%, and only
  Electrical makes cable, so the two sentences can both be true. The indexes do not show that they are.
- **The resin choice changes nothing**: the narrower BLS index with the same title moved identically.

### Found and fixed on the way

- **The script's accounting caught a selective first manifest.** It found four mentions of input costs the
  manifest did not account for: two table rows, and the two fiscal 2024 segment sentences, one of them saying
  Safety & Infrastructure's input costs were higher. Leaving those out would have shown only the sentences
  that agree. All are now accounted for: the sentences shown, and the table rows listed with why, since their
  4.7% and 0.5% are the sentences' $103.1m of $2,179.3m and $10.1m of $2,124.2m.
- **The fixture stops before fiscal 2024's segment results**, so those two sentences are not in the test
  copy. The page shows the four it finds and says two were not found, and the tests name which two rather
  than skipping them.
- **Over the screen budget.** The first version was 1,857px at 1440 on the fixture and 1,897px live, against
  1,350: six whole sentences inside the table's year columns took 325px, and each index's note on how near
  it is 140 to 160px a row. Each sentence is now shown as its words about costs, checked to be the passage's
  own and to mention input costs, linking to the whole sentence, in two columns of their own. That second
  version still came to 1,420px live, so the index notes became one line and the chart 120px tall.
  Now 1,299px live, with all six sentences, and within 1,350 on the fixture copy in the browser test.
- **On a phone, the changes were off the screen, and no check caught it; a screenshot did.** The table kept
  the page from scrolling sideways by scrolling inside itself, which put every change past the right edge at
  390, and the chart, which scrolls too, was cut off where the years compared begin. The table now fits, with
  its year headings on two lines, and the chart opens on its latest months. A browser check for both was
  added and failed against the build before the fix: the first change ended at 432px on a 390px screen, and
  the chart's right edge sat at 560px in a frame ending at 374px.
- **Three unit tests failed first, all in the tests**: a missing month miscounted, and two exact comparisons
  of floating-point results.
- **One test could not fail.** Its case for "the line a passage starts in is not a heading" gave the same
  answer with the rule removed; it was replaced by one that does not.

### Verified

- `tsc` 0; lint clean on every changed file. Vitest, with the other session's `tmp/` copy excluded: 62 files, 795 tests, 24 of them new in `lib/studio-project/input-costs.test.ts` and `input-costs.data.test.ts`.
- **The checks can fail.** 20 of 20 deliberate breaks, in the rules and in the built data, each failed
  at least one test, and each file was restored and compared afterwards.
- Playwright on a production build: 136 passed, 4 skipped, none failed, with seven Input costs checks among them.
- The Input costs tab at six widths, live from EDGAR with all six sentences: 1.44 screens at 1440 and 1920 (1,299px), 1.59 at 1280, 1.76 at 1024, 1.82 at 768 and 2.84 at 390, with no sideways scroll, one page heading and no page errors at any width. At 390 it rose from 2.73 once the table stopped scrolling inside itself and fitted the screen.
- Six widths across every workspace route: problems none. At 1440 the Input costs tab's first control is 292px down; the only failed requests are Vercel's analytics scripts, which a local build does not serve.

### Known limits

- **One report.** The indexes are chosen by hand for Atkore's fiscal 2025 annual report. Any other report,
  Atkore's next included, offers no tab until the manifest is reviewed and the script run again.
- **No index is for exactly what Atkore buys**: BLS has none for PVC or HDPE resin alone, and steel mill
  products covers far more than Atkore buys. Each says so on the page.
- **Fiscal-year averages of monthly prices**, with no allowance for inventory, contracts or timing, which the
  page gives as reasons moving together proves nothing.
- **Demand is not built.** The roadmap row pairs input costs with Census construction spending; that half
  is still to do.
- **Evidence for and against is kept with the reader's Keep button**, as any passage is. There is no screen
  yet that sets explanations side by side, and the tab is not linked from Investigate.
- **The chart's last four months are preliminary**, as fetched; BLS may revise them. The years compared are
  final.
- **Below 1440 the tab runs past a screen and a half**, as several workspace pages do: the budget is held
  at 1440, and each width's height is under Verified. Below 1280 the guidance and the definition of a price
  index sit above the tab's content rather than beside it, so its first link is lower on the page.

### Next concrete action

Commit R9. Then R10: the peer screen with its working shown; valuation with sensitivities; bond cash flows
and accrued interest, checked against handoff §12 cases 3, 4 and 5.

## 2026-09-14: competitors and input costs for any company, replacing the Atkore-only versions

R7 (committed as `87f6b73`) and R9 (the entry above, not committed) were built for Atkore alone: a hand-picked
peer set on the Industry page, an Input costs tab on one Atkore report, and "such as ATKR" in Investigate. The
user rejected that on 2026-09-14, since a learner researching any other company got nothing from them. Atkore
is now the test fixture only, and every screen built here has to work for whichever company a learner picks.

### What a learner can do now

- **On any company's annual report, a Competitors tab** lists the companies the report itself names in its
  words about competition, each with what the SEC's list of companies says of it and a link to where the
  report names it. The learner counts the ones that belong, and counting keeps that passage as the reason.
  Where a report names none, as Apple's, Walmart's and Netflix's do not, the tab says so, shows where the
  report writes about competition, and lets the learner add a company by its ticker.
- **On any company's annual report, an Input costs tab** lists what the report mentions from a checked
  library of 31 US producer price indexes, with the sentences, those about buying first. A mention is not a
  purchase, so nothing is linked until the learner says a sentence shows the company buys the input. Then
  the index's change by fiscal year, a chart restated to a common base, and the caution that moving
  together is not proof appear beside it.
- **Investigate names no company.** Its ticker box says "Its ticker symbol", its messages say what a ticker
  is, and its note on an industry Studio has not researched links to the company's own reports, where the
  Competitors tab is.
- **The Industry page** keeps its industries by SEC code, without the Atkore set.

### How it works, and what it rests on

- **Research first: how eight annual reports name competitors** (25.9 MB of latest 10-Ks). Atkore lists
  them by segment, one line each, after "listed below:"; Caterpillar in long lists ending "Co., Ltd." and
  "AG"; Delta as airline names with no "Inc."; Coca-Cola names PepsiCo mid-sentence. Apple, Walmart and
  Netflix name none. No free database lists competitors.
- **`lib/filings/competitors.ts`**, pure and unit-tested: passages about competition ("competitive" does not
  count), names read as runs of capitalised words, and a name offered only when it is plainly a company:
  it ends in a company word, or it is two words or more and exactly one company's name in EDGAR's ticker
  file once "Inc." and the like are set aside. Nothing is matched on being close, the company itself is
  never offered, and where two companies share a name none is chosen.
- **`lib/studio-project/input-costs.ts`, reworked**: the library, whole-word mentions with excluded phrases
  ("commercial paper" is not paper), the sentence around each mention, buying words first, and a fiscal
  year read from any report's period end, 52- and 53-week years included.
- **`scripts/source/fetch-input-cost-library.mjs`** with `input-cost-library-manifest.json` writes
  `lib/studio-project/data/input-cost-library.json` and `docs/source-audits/studio-input-cost-library.md`: two
  BLS queries and 31 series pages. Every title matched its BLS page, and every index has unbroken months
  from January 2017 to August 2026, the last four preliminary. It writes the data only if every check passes.
- **Storage**: a company investigation gains `inputs` and `peers`, each resting on a kept passage (a
  competitor added by ticker has none). Investigate's autosave carries them; letting a passage go takes an
  input linked through it; a restored backup whose link rests on a passage that is not kept is refused.
  `/api/studio/company-lookup` looks a ticker up for adding a competitor.
- **Removed**: the Atkore peer set (its view, module, data, script, manifest, audit page and tests, all in
  git history at `87f6b73`) and the uncommitted Atkore-only input-cost script, manifest, data and audit page.

### Found on the way

- **Atkore's own named competitors first gave no suggestions.** Its report puts "listed below:" and each
  segment's list on lines of their own. Lists are now followed through the lines that carry them, and stop
  at the next heading.
- **Three misreads in Caterpillar's lists**, fixed: "Part of Doosan Group", "Siemens Energy AG." with a
  sentence's full stop, and names on two lines run together. One is left: "Australia and New Zealand Banking
  Group Limited" reads as "New Zealand Banking Group Limited", because that "and" cannot be told from a
  list's.
- **The first three mentions of steel would have hidden the sentence that shows Atkore buys it.** Sentences
  with words about buying now come first.
- **Investigate's autosave would have wiped every link.** It rebuilds a company's record from its own page
  and carried over only kept passages. It now carries inputs and competitors too, and a test fails if not.
- **Over the screen budget with an index linked**: 1,387px at 1440 against 1,350, most of it a one-column list
  of mentioned inputs, 48px a row, each carrying its index's full title. Rows now hold the input and its count,
  in two columns from 1024px, with the title inside the opened row.
- **A heading counted as a passage about competition.** Apple's report sets "Competition" on a line of its
  own, and the tab for a report that names nobody offered that one word as the first place to read. A
  passage now needs four words or more; seen in a screenshot of the live tab, with a test added.
- **Two checks could not fail.** Of 24 deliberate breaks, two first went unnoticed: a line break no longer
  ending a name, because every multi-line case in the tests ended its lines on a colon or a stop; and a
  sentence split at "Inc. is", because the only case put the mention before "Inc.". A test was added for
  each, and every break, 25 with the one added for headings, now fails a test.
- **Two existing reader bugs, flagged as separate tasks and not fixed here**: the Business section is not
  found in Nucor's and Hubbell's latest 10-Ks, and extracted text keeps character codes such as
  "Nestl&#233;".

### Verified

- `tsc` 0; lint clean on every changed file. Vitest, with the other session's `tmp/` copy excluded: 62 files, 800 tests.
- **The checks can fail.** 25 of 25 deliberate breaks, in the competitor and input-cost rules, the
  storage and validation of links, and the library data, each failed at least one test, and each file was
  restored and compared afterwards.
- The affected browser specs on a production build: 52 checks across the seven affected specs, 51 passed at first; the one failure, the Input costs tab at 1,387px with an index linked, is under Found on the way.
- Playwright, the full suite on a production build: 137 passed, 4 skipped, none failed, the Input costs budget check with an index linked among them.
- **Live, on reports fetched from EDGAR:** both tabs on the latest annual reports of Atkore, Caterpillar, Apple and Coca-Cola, at six widths each, with no sideways scroll, one page heading and no page errors anywhere. The Competitors tab offered 10 names for Atkore, 45 for Caterpillar and 10 for Coca-Cola, and for Apple said it names none; the Input costs tab found 7, 6, 1 and 11 inputs. At 1440 the Competitors tab is 1,309px (952px for Apple) and the Input costs tab 1,154px, or 1,224px live with steel linked, against 1,350.
- Six widths across every workspace route: problems none, with both new tabs among the routes; each workspace page's first control within the top half at 1440, and the only failed requests Vercel's analytics scripts, which a local build does not serve.

### Known limits

- **Suggestions miss some competitors.** A name with no company word that is not exactly one company's name
  in the ticker file is not offered ("Alaska Airlines" is listed as Alaska Air Group), nor is a single bare
  word ("Prysmian"). The learner can add them by ticker.
- **Being in the SEC's ticker file is not proof of annual reports.** ABB and Siemens Energy are listed for
  shares traded over the counter, and the tab says only what the list says.
- **Only the Business section is read for competitors**, and only reports this reader can split into
  sections.
- **The library is 31 indexes.** An input outside it gets no suggestion, and a word can mean something else
  in a report ("pulp" in fruit juice); the learner decides.
- **Fiscal-year changes need the library's months**, which start in January 2017, so reports for fiscal
  years before 2019 show none.
- **The Industry page does not list a learner's competitors**, and their figures are not yet set side by
  side; that is R10's peer screen.
- **Demand**, from Census construction spending, is still not built.

### Next concrete action

Commit this work, with R9, when the user asks. Then R10: the peer screen with its working shown; valuation
with sensitivities; bond cash flows and accrued interest, checked against handoff §12 cases 3, 4 and 5.

## 2026-09-15: the peer screen, with its working shown (R10, the first of its three parts)

R10 asks for three things: the peer screen with its working shown, valuation with sensitivities, and bond
cash flows with accrued interest. This is the first, and it rests on the Competitors tab built the day
before: a learner counts the companies a report names, and can now set them beside it on the same measures.

**The method was written before the code.** `studio-research-coverage.md` §2 records a published screen and
then lists seven things it never states — the quantile convention, the winsorization limits, sample or
population standard deviation, zero variance, undefined ratios, weights when a measure is missing, and
ties — each of which changes the answer. Those are settled in `docs/source-audits/studio-quantitative-methods.md`
§1, worked by hand in §1.4, and `screen.ts` implements that file and nothing else.

### What a learner can do now

- **On any company's annual report, a Side by side tab** sets the company against the competitors they
  counted, on five measures read from each company's own latest annual filing: return on capital, profit
  kept from sales, sales per dollar of capital, profit left after everything, and borrowings against equity.
  The first three are the decomposition Investigate already computes for the learner's own company, from the
  same code, so the numbers mean the same thing on both screens.
- **They can read every step.** "How this order was worked out" names the figures, the measures, what
  winsorizing did and to whom, the average and spread of each measure, how a score is turned round for the
  one measure counted better when lower, and how the scores are averaged over the measures a company has.
- **They see what is not there.** A figure the SEC does not hold, a ratio that is not defined, a bank whose
  accounting means something else: each shows as a dash with its reason rather than a zero, and the row says
  how many of the five measures its combined number rests on.
- **They are told what the comparison cannot carry.** That the combined number ranks these companies on
  these measures for one year and is not a distance or a verdict; that changing who is in the list changes
  every number; that the years compared do not always line up, with a company whose newest tagged year is
  far older than the report's marked on its own row.
- **Nothing happens until they ask.** The tab reads nothing from the SEC until the learner presses the
  button, and says so; with no competitors counted it points at the tab where they are counted.

### How it works

- `lib/studio-project/screen.ts` is the arithmetic and nothing else: quantiles by interpolation, winsorizing
  at the 10th and 90th percentiles but only from four companies up, sample standard deviation, ties sharing a
  place, weights rescaled over the measures a company holds, and every intermediate value returned so the
  page can show it rather than assert it.
- `lib/studio-project/peer-measures.ts` turns the seven figures into the five measures, reusing `roic.ts` for
  the three that decompose a return, with the same effective tax rate rule Investigate uses.
- `app/api/studio/peer-figures/route.ts` reads company facts for up to ten companies, one after another, and
  returns only the figures and their tags. Company facts run to megabytes a company — Atkore's is 2.3 MB — so
  the server reads them and the browser does the arithmetic on the small answer it is shown.

### Found on the way

- **Large companies do not tag what a screen needs.** Measured across ten: three tag no operating profit
  Studio will read (Nucor, Deere, Eaton) and three no borrowings that exclude finance leases (Nucor, Deere,
  Coca-Cola). All ten tag net income, so the bottom line became the fifth measure — coarser, and labelled
  as such, but it is what keeps such a company in the comparison instead of showing an empty row.
- **How hard a company works its capital needs no profit figure**, and was waiting on one anyway because it
  was lifted out of the return's decomposition. Worked out on its own, Eaton went from two measures to three.
- **Winsorizing a group of three pulls every company towards the middle.** The live screen showed both
  companies of a two-company measure "pulled in", which is clipping where there is no outlier to clip. The
  limits now apply only from four companies up, and the surface says which of the two happened.
- **A table's width leaked into the page.** At 390 the page came out 585px wide while the table itself sat
  still inside its scrolling box. The browser was counting the table's width as the page's; `contain: paint`
  on the box stops it. The check was written first and failed before the fix.
- **ABB's newest US-accounting year is 2023** while the companies beside it filed for 2025, and it led the
  order. A row whose year ended more than 370 days before the report's year now says so in amber.

### Verified

- `tsc` 0; lint clean. Vitest, with the other sessions' `tmp/` copies excluded: 64 files, 827 tests.
- **The checks can fail.** 14 of 14 deliberate breaks — each convention in the method file, and each
  refusal in the measures — failed at least one test, and every file was restored and compared afterwards.
  The two browser checks that could not be broken that way were checked by hand: the phone one failed before
  its fix, and the older-year one failed with its rule switched off.
- The tab's own browser spec: 10 checks, every score in it worked out by hand from a fixed payload rather
  than from the page.
- Playwright, the full suite on a production build: 157 passed, 5 skipped, none failed. An earlier run of the same suite
  reported four failures in `studio-reader` and `studio-overview`; each passed twice on its own afterwards
  and the final run was clean, so they are the suite's known contention under load rather than this work.
- **Live, on reports fetched from EDGAR:** the tab on the latest annual reports of Atkore, Caterpillar and Coca-Cola, at six widths each, with competitors counted through the page itself: 5, 3 and 3 companies compared, no sideways scroll, one page heading and no page errors anywhere. At 1440 it is 1,278px, 1,139px and 1,219px against the 1,350 budget, and 1,721px at 390.
- Six widths across every workspace route: no page over its height budget, and the new tab among the routes. Two problems, neither in this work: the Overview and Research pages now put their first control at 494px and 464px, past half a screen at 1440. Both pages are being changed by another session in this same working tree.

### Known limits

- **One year, and not always the same year.** Each company's own latest annual period is used; the tab says
  when the years differ and marks one far older, but it does not restate them onto a common year.
- **Ten companies at a time**, the learner's own included.
- **A competitor with no SEC number cannot be compared**, which is most of the private ones a report names.
- **An IFRS filer has nothing to read**, as in Investigate: `metrics.ts` reads `us-gaap` only.
- **A company scored on fewer measures can still lead the order.** The count sits beside its number in amber,
  and the working explains it, but the arithmetic does not hold it back.
- **No prices**, so no valuation measure — earnings yield and the rest need a dated price Studio does not
  hold for an arbitrary company.
- **The other two parts of R10 are not built**: valuation with sensitivities, and bond cash flows with
  accrued interest.

### Next concrete action

Commit this work — R9, the any-company rework and the peer screen — when the user asks. Then the rest of R10:
valuation with sensitivities, and bond cash flows with accrued interest, against handoff §12 cases 4 and 5.

## 2026-09-15: a bond on the day you settle (R10, the second of its three parts)

Studio has had a bond engine since the fixed-income lessons — cash flows, price from yield, duration —
and no day count, so it could not say what a bond costs on a particular day. The catalog's Treasury
note carried `accruedInterestPer100: null`, the buying worksheet warned that its total was
incomplete, and both were telling the truth. This is the part that was missing.

**The rule is the issuer's, not a textbook's.** 31 CFR part 356, appendix B (retrieved 2026-09-15
from eCFR) gives the day count and the price formula, and Treasury's own auction record for this
note gives four published figures to check them against. Both are in
`docs/source-audits/studio-quantitative-methods.md` §2.

### What a learner can do now

- **Put a settlement date against the note** at `/studio/portfolio/bond` and see what leaves the
  account that day: the loan itself at the quoted price, the interest built up since the last
  payment, and a broker's fee, added beside the price rather than inside it.
- **See the day count that produced it** — "31 of 184 days since 15 August 2026" — so the figure is
  a rule they can follow rather than a number to accept.
- **See what the bond pays afterwards**: how many payments are left, what each one is, when the last
  one comes with the face value, and everything still to come.
- **See the yield their price implies**, worked out by the issuer's own formula.
- **Carry the interest figure into What to buy**, where the worksheet has always been able to hold
  one and never able to work one out. The bond's row there now links here.
- **Be refused rather than misled**: a date before interest starts, a date after maturity, a price
  no yield can produce, a face value below the smallest piece on offer.

### How it works

- `lib/studio-project/bond-cash-flows.ts`: the payment schedule counted back from maturity, the
  period a settlement date falls in, accrued interest on actual days, appendix B's price formula
  with **simple** interest on the part-period, yield by bisection, and money rounded once in cents.
- `setAccruedInterest` in `operations.ts` writes the figure against the position that holds the
  bond, and null puts it back to unknown rather than zero.
- The catalog gains one fact it was missing: the note's dated date, 2026-08-15, from the auction
  record. It is two days before the note was issued, which is exactly why a buyer at issue already
  owed two days of interest.

### Found on the way

- **A textbook's discounting is not the issuer's.** Compounding the part-period as `v^(r/s)` gives
  99.540981 where Treasury charged 99.540696 — $2.85 on a million, and a price nobody paid. Appendix
  B divides by `1 + (r/s)(i/2)` instead, and the tests hold the code to Treasury's number.
- **Treasury cuts its published yields to three decimals rather than rounding them.** The
  reopening's price implies 4.834993% and is published as 4.834%; pricing at a literal 4.834% gives
  98.368792 against the 98.361116 that was paid. Recorded in the method file so the next person does
  not read it as a disagreement.
- **Deriving the dated date from the price date would have been wrong.** This note was priced at
  auction on 2026-08-12, three days before interest starts, so a derivation would have put the
  schedule six months out. It is a stated fact in the catalog instead.
- **A rounding break survived the first set of checks.** Stepping the face value down when rounding
  each part to the cent tips the total over the budget could be removed without failing a test,
  because no case in the suite reached the half-cent boundary. One was worked out and added, and the
  break then failed.

### Verified

- `tsc` 0; lint clean. Vitest, with the other sessions' `tmp/` copies excluded: 65 files, 851 tests.
- **Against the issuer's own figures**, not Studio's: accrued interest of 0.25136 and 3.89606 per
  $1,000 at this note's two auctions, and prices of 99.540696 and 98.361116 whose implied yields are
  what Treasury published. A third check prices a coupon date against the lessons' own bond engine,
  which shares no code with this one, and the two agree to nine decimals.
- **The checks can fail.** 11 of 11 deliberate breaks — 30/360 in place of actual days, a
  month-end schedule, a settlement on a payment date, compounding the part-period, counting the
  part-period twice, folding interest into the price, overspending a budget by the rounding, and
  three more — each failed at least one test, and every file was restored and compared afterwards.
- The page's own browser spec: 9 checks, every figure in it Treasury's.
- Playwright, the full suite on a production build: 166 passed, 5 skipped, none failed.
- The page at six widths: 1,270px at 1440 against the 1,350 budget, its first control 273px down, one page heading, no sideways scroll at any of six widths, and 2,430px at 390.

### Known limits

- **Semiannual Treasury notes and bonds with a regular first period only.** A short or long first
  period, a floating rate note, an inflation-protected security and a corporate issue on 30/360 each
  have their own rule; each is refused rather than approximated.
- **One issue.** The catalog holds a single Treasury note, so the page has one bond to work on.
- **Settlement is the learner's to choose.** Studio does not know a broker's settlement convention,
  and says so beside the figure.
- **2,430px at 390.** It is a worksheet with five inputs and eight figures, and on a phone that is
  2.7 screens — the tallest page in Studio, though within the range the risk and review pages
  already occupy.
- **No credit analysis.** The handoff also asks for issuer strength, refinancing and call terms for
  a corporate bond; none of that is here, and no corporate bond is either.

### Next concrete action

Commit this work — R9, the any-company rework, the peer screen and this — when the user asks. Then
the last part of R10: valuation with sensitivities, against handoff §12 case 4.
## 2026-09-15: what a price assumes (R10, the last of its three parts)

The third part of R10 is valuation with sensitivities. What the handoff asks for is not a price
target — it asks for sourced inputs before editable assumptions, named scenarios, sensitivity
tables, and "a reverse question about what assumptions the observed price requires", with the
warning that uncertainty must not disappear into a single confident number. So the reverse question
is the headline: a learner puts in the price someone is asking and reads back the growth it is
buying.

### What a learner can do now

- **On any company's annual report, a "What a price assumes" tab** reads the company's own figures —
  operating profit, the tax it actually paid, borrowings, cash and shares — and values the business
  standing still.
- **Change the three assumptions that matter**: the growth they would assume, what new money earns,
  and what money costs, the last from Studio's sourced industry table with the industry picked by
  the learner.
- **Put in a price and see what it assumes.** "This price assumes 6.8% growth, every year, for
  ever" is a sentence a learner can argue with; "$230 is 15% overvalued" is not.
- **See how little it takes to move it**: a grid of value per share across four growth rates and
  three costs of capital, with a cell left empty wherever the business cannot pay for that growth.
- **See where every figure came from**, tag by tag, including the caveats: the share count is the
  year's diluted average, and the return on new money is last year's, which is a choice.

### How it works

- `lib/studio-project/valuation.ts` holds the model — `NOPAT × (1 − g/ROC) ÷ (r − g)` — the bridge
  from the whole business to one share, the closed-form reverse question and the grid. Every refusal
  carries its reason.
- The figures come from the same SEC route the peer screen uses, which now also reads the share
  count; the cost of capital comes from the existing Damodaran table; the return on new money starts
  from the company's own return on capital, computed by `roic.ts`.
- Conventions and their reasons: `docs/source-audits/studio-quantitative-methods.md` §3.

### Found on the way

- **The model had to be chosen by what is sourced, not by what is standard.** A multi-stage DCF with
  a terminal value is the textbook answer, and the audited session marks terminal-value mechanics as
  deferred, so a multi-stage model would have put four unsourced assumptions on the screen. The
  single-stage model the session does verify is what got built, and §3 says why.
- **The closed-form reverse question has roots the model refuses.** A price of 900 for a business
  worth 1,200 standing still comes back as 30% growth, which is an artefact of the rearrangement.
  Every root is now substituted back and rejected if it does not reproduce the price.
- **An empty box read as a zero left the whole page blank.** The cost-of-capital field falls back to
  the sourced figure when empty, and an empty string parsed to 0 instead of null, so every value came
  out as "no answer" until it was found by driving the page.
- **Atkore is the honest worst case.** Its 1.4% return on capital last year means every growth row
  refuses: growth bought at 1.4% costs more than it earns. That is correct, and it needed a line
  explaining the empty cells rather than leaving a learner to think the tab was broken.

### Verified

- `tsc` 0; lint clean. Vitest, with the other sessions' `tmp/` copies excluded: 66 files, 868 tests.
- **Against the project's own audited figures**: the five cases in
  `damodaran-session-5-valuation-basics.md` §"Independently verified calculations", including the
  neutrality of growth at a return equal to the cost of capital, and the 1,000 and 1,333.33 either
  side of it.
- **The checks can fail.** 11 of 11 deliberate breaks — growth taken for free, the
  reinvestment rate inverted, the lenders added instead of paid, cash dropped from the bridge, a
  receipt divided instead of multiplied, the reverse question left unchecked, and five more — each
  failed at least one test, and the file was restored and compared every time.
- The tab's own browser spec: 10 checks against a fixed payload whose arithmetic is worked by hand
  in the file's own comments.
- Playwright, the full suite on a production build: 176 passed, 5 skipped, none failed.
- Live: the tab on Apple's and Atkore's latest annual reports at six widths each, no sideways scroll, one page heading and no page errors. At 1440 it is 1,164px for Apple and 1,276px for Atkore against the 1,350 budget, and 1,957px and 2,196px at 390. Apple at $230 a share reads as 6.8% growth for ever; Atkore, on a 1.4% return on capital, is worth $1.38 a share standing still and refuses every growth row, which is the honest answer at those assumptions

### Known limits

- **One growth rate, for ever.** No stages, no fade, no terminal switch. Deliberate, and stated.
- **No multiples.** Peer multiples need a price for every peer, which Studio does not hold; the peer
  screen compares what companies earn instead.
- **The price is the learner's.** Studio holds no live prices, so what a share costs today comes from
  their broker, as everywhere else in Studio.
- **The share count is a yearly average**, not what is in issue today.
- **A loss-making year cannot be valued** by this model at all, which is most of what a beginner
  will meet in a bad year for a cyclical company.
- **Financial companies are out of scope** for the same reason the return on capital is: their
  accounting puts a different meaning on both the profit and the capital.

### Next concrete action

R10 is complete: the peer screen, the bond worksheet and this. Commit the four pieces — R9, the
any-company rework, and R10's three parts — when the user asks. R10 was the last item in §10's Phase 2;
after it the roadmap turns to Phase 3, portfolio construction, which needs price histories Studio does not
hold for an arbitrary company. The nearer piece of work is the gap this phase measured: three of ten large
companies tag no operating profit this reader will accept, and three no borrowings that exclude finance
leases, which weakens the peer screen, the valuation tab and Investigate together.

## 2026-09-15: borrowings for the companies that report debt and leases on one line

R10's peer screen and valuation tab both start from Investigate's seven figures, and building them
made a gap measurable: of ten large companies, three tag no borrowing figure Studio will read. A
company with no borrowings has no invested capital, so it scores on almost nothing — Nucor came out
on one of the peer screen's five measures.

### What a learner can do now

- **Borrowings resolve for a company that reports debt and finance leases on one line**, as long as
  it also tags the lease, because the lease can then be taken out. Nucor's figure is $6,863m where
  it was empty before, and on the peer screen it now scores on three of the five measures instead
  of one, moving from last place to second.
- **Nothing changes for a company that tags no lease to take out.** Coca-Cola and Exxon still show
  an empty box, and the reason now says exactly why: no lease-free figure, and no lease tagged on
  its own to subtract from a combined one.

### How it works

- `prefill.ts` reads a lease-free tag first, as before. Only where none covers the year does it try
  the combined route, and only where the filer states the lease itself: the figure that includes
  current maturities less the whole lease, or the noncurrent figure less the noncurrent lease plus
  the instalment due this year.
- The provenance says what happened — "long-term borrowings and finance leases, less the finance
  leases, plus the instalment due within the year, plus short-term borrowings" — so a learner
  checking against the balance sheet can follow it.

### Found on the way

- **How common the shape is, measured rather than guessed.** In the SEC's CY2025Q4I frame, 2,770
  filers tag a lease-free borrowing figure, 218 tag only a combined one, and 148 of those — 68% —
  also tag the lease. So the rule reaches 148 filers and the other 70 keep their empty box.
- **AT&T is the check on the rule itself.** It tags both shapes: 136,100 of debt and leases, 1,382
  of finance leases, and 134,718 of lease-free debt. The subtraction reproduces its own figure to
  the dollar, and because the lease-free tag is read first, the provenance still names that tag.
- **The two shapes are not interchangeable.** Chevron's combined tag already includes the 2,345 due
  within the year; adding the instalment again would have made its borrowings 41,658 instead of
  39,313, which is exactly the "total debt of 40,758 less 1,445 of finance leases" its own report
  states.
- **Deere still cannot be read**, and that is a different gap: it tags no long-term borrowing
  figure at all, lease-free or combined, so there is nothing to subtract from.
- **Operating profit is still missing for Nucor, Eaton and Deere.** They tag no
  `OperatingIncomeLoss`, and deriving one from total costs is the subtraction `metrics.ts` already
  refuses to make — Deere's total costs include interest, so revenue less costs is its pre-tax
  profit, not an operating one.

### Verified

- `tsc` 0; lint clean. Vitest, with the other sessions' `tmp/` copies excluded: 66 files, 873 tests.
- **Against three companies' own filings**, each with a different tagging shape: Nucor's debt note
  ($258m of finance leases inside $6,999m, and short-term borrowings of $122m it splits into $33m
  and $89m), Chevron's total debt of $40,758m less $1,445m of leases, and AT&T's own lease-free
  figure of $134,718m.
- **The checks can fail.** 7 of 7 deliberate breaks — the leases left inside, a missing
  lease treated as zero, the whole lease taken off the noncurrent part, the instalment dropped or
  double-counted, the subtraction reversed, and a combined tag preferred over a lease-free one —
  each failed at least one test, and the file was restored and compared every time.
- Playwright, the full suite on a production build: 176 passed, 5 skipped, none failed.
- **Live, through the app:** Nucor's borrowings read $6,863,000,000 from
  `LongTermDebtAndCapitalLeaseObligations + FinanceLeaseLiabilityNoncurrent + LongTermDebtCurrent +
  ShortTermBorrowings`, and its peer-screen row moved from "on 1 of 5 measures" to "on 3 of 5".

### Known limits

- **148 filers gain a figure, not all of them.** The 70 that tag no lease keep an empty box.
- **A filer that tags neither shape is untouched**, which is Deere's case.
- **The figure is a carrying value**, as the balance sheet reports it, not the principal a debt note
  totals: Nucor's own note gives $6.93bn of principal against the $6.74bn of long-term debt carried,
  the difference being the unamortized discount netted against it.
- **Operating profit remains the larger gap** for the same three companies, and it needs its own
  measurement and its own source before anything derives one.

### Next concrete action

Commit this with the rest when the user asks. The operating-profit gap is the next piece of the same
work: measure how many filers tag no `OperatingIncomeLoss`, and decide per shape what, if anything,
can be read instead without inventing a subtraction.

## 2026-09-16: any company from Research's search, and a report reader that reads quarterly reports and tables

The user saw Research's eight investments, asked where searching for any company was, and sent a
screenshot of Netflix's quarterly report whose Risk factors tab was "just random phrases". Both were
real. R10 had never been a search: the any-company tools existed, but only on pages a learner had to
know to open, and Research's search box filtered the eight and said nothing matched "Netflix".

### What was wrong with the report

- **The reader only knew the annual layout.** A 10-Q numbers its Items differently (Part I: Item 1
  statements, Item 2 management's discussion, Item 3 market risk; Part II: Item 1 legal, Item 1A risk
  factors, Item 2 share sales and buybacks). Read with 10-K numbers, only "Item 1A. Risk Factors"
  matched in Netflix's report for the quarter to 30 June 2026, and six of seven sections were "not
  found".
- **A section ended only at the next section OPS reads.** So that Risk factors tab ran from its single
  sentence to the end of the document: the buyback table, Other information, Exhibits. The same rule
  ran every annual report's Risk factors through Unresolved Staff Comments, Cybersecurity and
  Properties, and Financial statements through Items 9–16.
- **Tables became loose lines.** A row became a line, and a heading cell holding its own block of
  markup became several, each with a Keep button: "Period", "Average Price Paid per Share (2)",
  "(in thousands)", "April 1 - 30, 2026 16,922,312 $ 97.47 …".
- **Page furniture became paragraphs**: bare page numbers, "Table of Contents", Apple's "Apple Inc. |
  Q3 2026 Form 10-Q | 23", each with a Keep button.

### How it works now

- `lib/filings/sections.ts`: `QUARTERLY_SECTIONS` beside the annual list, chosen by the form or, when
  the filing list does not say, by the document's `dei:DocumentType` tag or its cover. Titles tell
  Part I's and Part II's Item 1 and Item 2 apart. A section ends at the next Item heading of any kind.
  Headings must start a line (every real one measured does; NVIDIA's `Refer to "Item 1A. Risk
  Factors - …"` does not). A quarterly contents entry that lists statements before its page number is
  recognised as contents. An annual Item 8 that only points elsewhere (NVIDIA, Netflix) is read from
  Item 15 to the end, where the statements are. Part II Item 2 is labelled "Buybacks".
- `lib/filings/tables.ts`: a table of figures keeps its rows and columns. A column starts where a value
  starts in the body; a lone "$" joins the figure after it and ")" or "%" the figure before; a heading
  spans the columns that start under it; two starts are one column when a cell at the first reaches
  over the second and no row fills both (Netflix's "$" + 12,559,938 beside a 33.4% that fills both).
  Bullets, paragraph cells, merged rows and single rows stay text.
- `filingToText` puts each table row on one line, its cells a space apart, and records where the rows
  are, so search, kept passages, Competitors and Input costs read the same text as before.
- `lib/filings/pages.ts`: rows are sized as table rows (33px), a page breaks between rows, a table opens
  only with its headings and first figures together, and a page that continues a table repeats its
  headings. `sectionPages` is the one paging that search, passage lookup and the reader all use. Page
  furniture is skipped as paragraphs but stays in the text, so no offset moves.
- `FilingPassages` draws a table as a table, with one "Keep table" for its rows on the page; figures
  align right and do not wrap, headings wrap, and a wide table scrolls inside its own frame.
- `lib/filings/company-search.ts` and `/api/studio/company-search`: EDGAR's ticker file searched on the
  server by exact ticker, ticker prefix, name word, then name contains (spaces ignored, so "JP Morgan"
  finds JPMORGAN), in EDGAR's own order, one row per company. Research shows up to three "Other
  companies" under the library, each one line with "Reports" and "Investigate" (named for the company
  to assistive technology), and says they cannot go in a portfolio yet. When two or more of the
  library's own investments match, the companies wait behind one "Show N companies at the SEC" button
  beside "Show all": both lists open took a phone to 1.63 screens for "vanguard".
  `/studio/investigate?ticker=` reopens a company already investigated or starts one and looks its
  figures up, then takes the ticker out of the address.
- The Research gap note no longer says no company's financial results are available; it says why a
  searched company cannot be added (no checked dated price).

### Found on the way

- **The SEC's ticker file, measured 2026-09-16:** 798 KB, 10,422 tickers for 8,022 companies, ordered
  from the largest down (NVIDIA, Apple, Alphabet, Microsoft first). Alphabet alone is listed four times.
- **Nine real filings checked by hand** (the 10-Q and 10-K of Netflix, Apple, Coca-Cola and NVIDIA, and
  Atkore's 10-Q): every section now starts at its heading and ends at the next Item; 426 tables parsed
  with every row's text equal to its line; extraction takes 17–110ms.
- **Netflix's quarterly report has no "Item 1." heading before its statements**, so Financial
  statements is honestly reported not found there.
- **A ticker left in Investigate's address came back after a delete.** Deleting the company and
  reloading `?ticker=nflx` started it again. The ticker is now removed with `history.replaceState` as
  soon as it is read; `router.replace` was tried first and lost to a quick reload in the e2e test,
  which is how the test showed it can fail.

### Verified

- `tsc` 0; lint clean on every changed file.
- Vitest, excluding other sessions' `tmp/` copies: 68 files, 897 tests.
- **The checks can fail.** 22 deliberate breaks across sections, tables, pages and company search:
  every one failed at least one test after the page-break tests were tightened (three had passed
  under the first, looser versions); each file was restored afterwards.
- Playwright, the full suite on a production build: 180 passed, 5 skipped, none failed, including four
  new company-search tests.
- **Research with a search, at 390, 768, 1024, 1280, 1440 and 1920** for "", "netflix", "coca",
  "apple", "vanguard" and "etf": 1.20–1.49 screens, nothing sideways; company links 44px tall on phones.
- In the browser at 1440: Netflix's quarterly report opens on management's discussion; Risk factors is
  its one sentence; Buybacks is a five-column table under its own headings; Apple's quarterly income
  statement reads as a statement. Searching "netflix" in Research finds NETFLIX INC, "Reports"
  lists its filings, and "Investigate" fills all seven figures; a second visit reopened the same
  record (the test record was deleted afterwards).

### Known limits

- A 20-F or 40-F is still read with the annual numbering, which does not fit it.
- A searched company cannot be added to a portfolio: that needs a dated price for its shares.
- A passage kept from text an old section wrongly swallowed (for example Properties inside Risk
  factors) will no longer be found in that section.
- **The report reader fits the budget only at 1440 and 1920.** Measured today: 1.39–1.48 screens there,
  but 1.48–1.59 at 1280, 1.55–1.78 at 768–1024 and 1.81–2.42 at 390, and a management's-discussion
  page with no table at all is among the tallest, so this is the paging model's calibration at 1440
  (pages.ts), not the tables. Tables scroll sideways inside their own frame at 390, by design.
- No end-to-end test opens a quarterly report or a table: the EDGAR fixtures are Atkore's 10-K, rebuilt
  from paragraphs. Unit tests cover both on miniatures of Netflix's markup.

## 2026-09-16: reports that read as documents, not a column of quotations

After the tables work the user said every company's filing still looked like "gibberish random
quotes". Opening Apple, Netflix, Coca-Cola and NVIDIA showed why, and it was true of all of them.

### What was wrong

- **Character codes shown as text.** Only seven references were decoded, so Apple's "iPhone &#174;",
  "iPhone Air&#8482;" and every risk-factor bullet ("&#8226; our ability…") reached the page as code.
  Paragraphs showing a code, measured across nine reports: NVIDIA 10-K 111, Netflix 10-K 68,
  Coca-Cola 10-K 57, Atkore 10-Q 40, Apple 10-K 25.
- **Sentences split where the printed page turned.** The markup closes a block at the page foot, so
  Coca-Cola's "…to produce finished" and "beverages. The finished beverages…" were two passages.
- **Subheadings as passages.** "Products", "iPhone", "COMPETITION", "(In millions)" were paragraphs,
  each with its own Keep button, and a Keep button after every paragraph made the page a column of
  quotations.

### How it reads now

- `lib/filings/entities.ts` decodes every numeric reference and the named ones filings use, in one
  pass (so "&amp;#174;" stays literal). Quotes and dashes still become straight quotes and a hyphen,
  as search and kept passages have always relied on. A space before ®, ™ or ℠ is dropped.
- `stitchPageBreaks` in `sections.ts` joins a line of 60+ characters that does not end a sentence to
  the next text line when that line starts in lower case, turning the break and any page number or
  "Table of Contents" between into spaces, so the text keeps its length and no offset moves. Shorter
  lines are headings and are never joined (Apple's "iPhone" above "iPhone net sales…").
- `isSubheading` in `pages.ts`: short, has words, no figures, does not end a sentence (or is in
  capitals). The reader draws these as headings with no Keep button.
- Keep buttons wait until the paragraph is pointed at, or the button is reached from the keyboard;
  on a device without hover they stay visible. Each is held on a line with its paragraph's last word,
  and its word is drawn by CSS, so a hidden button never leaves a blank line and the paragraph's text
  is only its text.

### Found on the way

- **Decoding broke Coca-Cola's annual report entirely.** It names Coca-Cola İçecek; "İ" lower-cases to
  two characters, the case-folding helper noticed the length change and fell back to case-sensitive
  matching, and none of Coca-Cola's upper-case headings were found. Folding now touches only A–Z.
- After the change, across the nine reports: no paragraph shows a character code, and the lower-case
  continuations left are headings ("iPhone"), table footnotes, a numbered list item and one Coca-Cola
  sentence broken before a bracket.

### Verified

- `tsc` 0; lint clean. Vitest: 69 files, 906 tests. Playwright, full suite on a production build: 180
  passed, 5 skipped, none failed.
- **The checks can fail.** 9 deliberate breaks (codes left as code, decoding twice, no stitching,
  headings joined, stitching changing length, full lower-casing, and each of the heading rules) each
  failed at least one test; files restored.
- In the browser at 1440: Apple's Business opens "Company Background" as a heading, then its
  paragraph, "Products", "iPhone", and "iPhone® is the Company's line of smartphones…"; Netflix's opens
  ABOUT US, BUSINESS SEGMENTS, COMPETITION as headings; NVIDIA's risk factors show "•" bullets under
  their headings. Keep buttons measured at opacity 0 until hovered, 1 on the hovered paragraph only,
  and none alone on a line.

### Known limits

- A kept passage whose quote contains a character code ("&#174;") will not be found again in the
  decoded text, and says so.
- A heading is recognised by shape. A short line without a full stop that is really a sentence
  fragment would be drawn as a heading.

## 2026-09-16: the reader measured across 38 companies, and the layouts that failed

The user asked whether, once pushed, no report would show garbled text anywhere. Nine reports from five
companies could not answer that, so the latest 10-K and 10-Q (or 20-F/40-F) of 38 companies were fetched
and measured the way the reader shows them: sections found, character codes, sentences split across
lines, rows of figures shown as loose text, and short scraps that are neither headings nor sentences.

### What the first measurement found

- Tables with a cell merged down a column were all left as text, cell by cell, so lone "$", ")" and "-"
  lines: 55 such tables in IBM's quarterly report, 20 in Exxon's. Exxon's quarterly report was 56% scraps.
- One footnote longer than 300 characters rejected a whole table of figures (Exxon's segment table).
- Tables of a single row went through cell by cell: Johnson & Johnson's "$" then "11.1".
- Running page headers read as passages or as new sections: "Alphabet Inc." 90 times; Mastercard's
  "PART I / ITEM 1. BUSINESS" on every page ended its Business tab after one page; Microsoft's bare
  "Item 7" did the same once bare Items could be headings.
- Separators other than a full stop were not recognised: Costco "Item 1A-Risk Factors", J&J "Item 1 -
  Financial statements", Shopify "Item 1: Business". Each read as no sections at all.
- Microsoft's markup splits words inside its headings ("ITEM 1A. RIS K FACTORS"), which is why its
  Business and Risk factors tabs had always been missing.
- Intel, GE and McDonald's annual reports have no Item headings in the body, only a cross-reference index
  at the end. The old reader built its sections out of that index: Intel's "Risk factors" was 149
  characters of page references, GE's "Business" 33.
- Rows of dashes and underscores (Home Depot, Ford) showed as passages.

### What changed

- `tables.ts`: merged-down cells occupy their columns in the rows below; a table is rejected for long
  cells only when it has fewer than eight figures for each; a table that is not drawn as one keeps each
  row on one line (`tableLines`).
- `sections.ts`: Item markers accept ".", ":", "-" or a same-line space; titles are compared with spaces
  ignored; a candidate heading must have something under it; contents and index entries ending in page
  ranges ("24-31", "Pages 37 - 51", "Not applicable") are rejected, while a figure such as "33,460,252"
  is not read as pages; repeated company names and Part/Item page headers become spaces (the first Item
  header is kept only when the report has no other heading for that Item); bare "Item 7" lines and
  separator rows are page furniture.

### Measured afterwards, on the same 71 US reports

- 48 open every section; 5 open none and say so: McDonald's 10-K, Intel's 10-K and 10-Q, GE's 10-K and
  10-Q, all laid out only through a cross-reference index. Foreign 20-F and 40-F reports open none.
- Across 44,611 paragraphs: 2 with a character code (Pfizer), 1 split sentence, 16 rows of figures shown as
  a line of text rather than a table (readable rows such as Bank of America's "Equity securities
  10 - 40 %").
- Scraps above 2%: Alphabet 10-K 9.1% (numbered list markers "3.", "4." on their own lines), Crocs 10-K
  6.2% and Disney 10-K 4.6% (exhibit numbers and short bullets), IBM 10-K 4.2%, Deckers 10-K 2.3%,
  Walmart 10-Q 2.3%.
- Against the reader as it was this morning, the only reports with fewer sections are Intel's and GE's,
  whose earlier sections were the index scraps described above.

### Verified

- `tsc` 0; lint clean. Vitest: 69 files, 916 tests. Playwright, full suite on a production build: 180
  passed, 5 skipped, none failed.
- 10 deliberate breaks of the new rules each failed at least one test; one test had to be tightened
  first, because sentence stitching also covered its case.

### Known limits

- Reports organised by a cross-reference index, and all 20-F and 40-F reports, show the "read it at the
  SEC" notice rather than sections.
- 38 companies are a sample of about 8,000 with tickers; other layouts will exist.

## 2026-09-17: the reader draws each report's own document

After the push the user asked: "If its a "reader" can you not just change the mechanism so it doesnt
just pull out random texts?" The mechanism was the problem. The reader stripped every filing to plain
text and then guessed where its paragraphs, tables and headings had been; every rule added on
2026-09-16 fixed one layout's guesses, and scraps came from wherever a guess still missed.

### How it reads now

- `lib/filings/document.ts` parses the filing's HTML (parse5) into the blocks its company made:
  paragraphs, list items, headings and tables. What is drawn is rebuilt from an allow-list: bold,
  italic, superscript, subscript and line breaks, and table rows and cells with their spans,
  alignment, indent and rules. Scripts, links, images, styles, iframes, hidden XBRL and anything set
  not to display never reach the page.
- Each block's text and HTML are written side by side, one character for each, so search, kept
  passages and section finding read the text, and a mark is placed in the drawn HTML at the same
  offsets. A table's text puts a space between cells and a line between rows; those spaces are
  drawn by the table's layout and their places are recorded.
- A table is drawn as a table when it holds figures: two rows, a figure after some row's first
  cell, no table inside it, and at most one paragraph-length cell for every eight figures (the
  2026-09-16 rules). Bullets, headings and paragraphs laid out in tables read as text, a row to a
  paragraph; a page set inside one cell reads as its own blocks. "$", "(", ")" and "%" set in cells
  of their own join their figure in the text ("$11.1", "(175,685)"), so search finds them as typed.
- Lists: a `display: inline` div is not a block and a flex box's children are spaced, so Microsoft's
  and Oracle's bullets keep their text; a marker in a box beside a box of text ("(a)", "3.") joins
  it, only where the two are all their parent holds.
- Page furniture stays in the text, where a page number after a contents entry is what tells the
  entry from a heading, but is never drawn, paged or found by search. Added forms: "4." (Alphabet's
  page numbers, which the 2026-09-16 notes took for list markers), "F- 1" (Crocs), "Page 7",
  "- 8 -", "Table of Contents 13".
- Reports set one printed line to a positioned box (Deckers) have their lines joined into
  paragraphs; bold runs into bold only from a full line, so a short bold line stays a heading.
- Sections are whole blocks. Pages break between blocks and between table rows, repeat a table's
  headings (not a caption-length first row) on a page that continues it, and never end on a
  heading: Netflix's "Forward-Looking Statements" had a page to itself, its paragraph on the next.
- Blocks are plain data; the parse tree (about 280 MB for JPMorgan's 13 MB annual report) is let
  go. `lib/filings/reading.ts` keeps the last four reports read, so turning a page does not read the
  report again.
- `tables.ts` and `entities.ts` are gone: parse5 decodes character references.

### Found on the way

- Dropping page numbers while reading made contents entries look like headings (the quarterly
  contents test caught it), hence furniture kept but undrawn.
- The first version was two to seven times slower than the old reader. Writing a character at a
  time, escaping each character with four replaces, and WeakMap caches over millions of elements
  were the causes. Best of three, reading only: JPMorgan 10-K 1.7 s (old 0.7 s), Microsoft 10-K
  1.0 s (0.14 s), Apple 10-K 0.18 s (0.05 s). About half is parse5 itself. With the cache, a page
  turn in Microsoft's report measured 0.13 s against 1.2 s for the first page, fetch included.
- A search snippet near the end of a section cut its last word ("to publishers." showed as "to").

### Measured, on 80 cached reports of 41 companies

- Every report opens the same sections as before the change: 56 open every section; McDonald's
  10-K, Intel's 10-K and 10-Q and GE's 10-K and 10-Q open none, as before.
- Across 47,275 paragraphs: drawn text differs from the text search reads in none; a mark over a
  random stretch lands on exactly that stretch in every paragraph and table part checked.
- On the 71 reports measured on 2026-09-16: short scraps 518 before, 328 now plus 4 lone bullets;
  sentences split across paragraphs 1 before, 0 now; rows of figures shown as a line of text 16
  before, 6 now. Above 2%: Pfizer 10-K 4.0% (its own labels, "2025 v. 2024"), Disney 10-K 2.5%
  (short bullets), Walmart 10-Q 2.3% ("See accompanying notes.").

### Verified

- `tsc` 0; lint clean. Vitest: 68 files, 927 tests. Playwright, full suite on a production build:
  180 passed, 5 skipped, none failed.
- 29 deliberate breaks of the document rules, 3 of the heading-with-its-text rule and 1 of the
  caption rule each failed at least one test. One break was missed at first (a list number taken
  from among several siblings), and a test for a page number opening a run of paragraphs was added.
- In the browser, production build: Netflix's quarterly Risk factors tab is its heading and one
  sentence; its management's discussion opens with the heading and its paragraph together; a
  results table is drawn as a table, 13px Inter, 15.5:1 contrast, within its frame. Microsoft's
  bullets read "• Tackling security…", and a search for "investing significant resources" marks
  exactly those words.

### Known limits

- Screen budget on a page with a table (Netflix 10-Q): 2.33 screens at 390, 1.52 at 768, 1.96 at
  1024, 1.74 at 1280, 1.49 at 1440, 1.25 at 1920. As before this change, pages fit only at 1440 and
  1920.
- Netflix's quarterly report has no "Item 1" heading above its statements, so its Financial
  statements tab is missing, as it was before.
- The first open of a very large report takes one to two seconds.
- Reports organised by a cross-reference index, and 20-F and 40-F reports, still show the notice.
