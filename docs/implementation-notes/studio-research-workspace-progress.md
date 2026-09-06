# Studio research workspace: implementation ledger

Tracks [`studio-research-workspace-handoff.md`](../agent-prompts/studio-research-workspace-handoff.md).
Update this at every checkpoint. A later session should be able to resume from this file alone.

Branch: `feat/studio-workspace`. Started 2026-09-05.

## Milestone status

| Milestone | Status | Evidence |
| --- | --- | --- |
| M0 inspect and map | **Complete** | [`studio-research-coverage.md`](../source-audits/studio-research-coverage.md); this ledger |
| M1 data and method feasibility | **In progress** | [`studio-data-coverage.md`](../source-audits/studio-data-coverage.md), [`studio-price-snapshot.md`](../source-audits/studio-price-snapshot.md), [`studio-metric-mapping.md`](../source-audits/studio-metric-mapping.md). D1 and D2 resolved; price ingestion and per-sector metric mapping both built and run. Two build items outstanding |
| M2 project state and recovery | **In progress** | v2 schema, migration and operations in `lib/studio-project/`; 16 tests. Storage adapter and conflict handling still to do |
| M3 complete stock prototype | **In progress** | Industry surface and disaggregated ROIC built and verified: [`studio-industry-view.md`](../source-audits/studio-industry-view.md), route `/studio/industry`. Five forces, value stick and industry map not started |
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

- Storage adapter, with IndexedDB for the larger research state.
- Multi-tab conflict detection and failed-save reporting carried over from `use-studio-plan.ts`.
- Backup import and export round trips on the v2 record.
- The dependency graph that marks downstream work `needs review` when an input changes.

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
