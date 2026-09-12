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

### Next concrete action

R2 in the roadmap: the research record with its evidence panel. Or R4, the reader with whole
sections and find-in-filing, which would remove another outside site.
