# Studio data coverage and feasibility (M1, in progress)

Review date: 2026-09-05. Milestone M1 of the
[handoff](../agent-prompts/studio-research-workspace-handoff.md). Continues
[`studio-research-coverage.md`](./studio-research-coverage.md).

Status: **in progress.** Findings 1-4 are established by direct probe or by reading the
source. Sections marked *outstanding* are not yet done and no claim is made for them.

## Finding 1 — one metric definition cannot span sectors, and the filings prove it

The handoff and the user's final report (p14) both say the team's process broke on
inconsistent metric definitions across companies. This was tested directly rather than
assumed, by pulling SEC XBRL company facts for an operating company and a bank:

- **Atkore Inc.** (ATKR, CIK 0001666138) — the M3 prototype target
- **Fifth Third Bancorp** (FITB, CIK 0000035527) — a bank the team actually held

Probe results, latest 10-K annual figures:

| Screening input | Atkore | Fifth Third |
| --- | --- | --- |
| Revenue | present, 9 annual periods | **misleading — see Finding 2** |
| Gross profit | present, 12 periods | **absent** |
| Cost of revenue | present | **absent** |
| Operating income | present, 12 periods | **absent** |
| Net income | present, 12 periods | present, 19 periods |
| Cash flow from operations | present, 12 periods | present, 15 periods |
| Total assets / equity | present | present |
| Depreciation and amortisation | present | present |
| Dividends per share | absent (pays none) | present |
| Interest and dividend income | absent | present, 19 periods |
| Provision for loan losses | absent | present, 16 periods |

**Consequence for the screen.** Of the team's five Business Quality inputs, two are
uncomputable for a bank from these filings: *margin stability* needs gross margin, which the
bank does not report, and *leverage as net debt / EBITDA* needs operating income, which it
also does not report. This is not a data-quality problem to be patched. It is the reason the
team substituted ROA and equity-to-assets, and it means **metric templates must be per-sector
and the system must refuse to compute a metric whose inputs are absent** rather than
substituting a differently-defined concept.

## Finding 2 — the bank revenue trap

The most dangerous result, because nothing looks wrong.

Asking SEC XBRL for Fifth Third's revenue through the ordinary US-GAAP revenue concepts
returns **`RevenueFromContractWithCustomerIncludingAssessedTax` = $577,000,000, period ending
2023-12-31.**

The bank's actual economics for 2025, from the same filings:

| Concept | Value |
| --- | --- |
| `InterestAndDividendIncomeOperating` | $9,903M |
| `InterestIncomeExpenseNet` (net interest income) | $5,982M |
| `InterestIncomeExpenseAfterProvisionForLoanLoss` | $5,320M |
| `NoninterestExpense` | $5,144M |

The $577M figure is a **fee-revenue subset**, and it is also **two years stale** relative to
the rest. A screen that reads "revenue" generically would compute this bank's sales yield from
a number roughly an order of magnitude too small, drawn from a different year, measuring a
different thing — and would rank it against operating companies on that basis. Nothing in the
response signals the problem. The field is populated.

**Requirement this creates.** Every metric in Studio needs an explicit *concept mapping per
sector template*, not a generic field name, and the data layer must record which concept
produced each number so the user can see it. A metric whose sector template has no mapping is
unavailable, stated as unavailable, and excluded from the score — never silently filled.

## Finding 3 — price history is licence-blocked on the obvious sources

The gating dependency D2. SEC publishes no prices; Treasury publishes auction prices only.

| Source | Position |
| --- | --- |
| Tiingo | Free and paid individual/commercial plans are **internal use only**. Display or redistribution needs a separate licence. |
| Alpha Vantage | Free tier carries attribution and **no-resale** terms. Same restriction. |
| Stooq | Free bulk downloads exist and an API key is now required. **Redistribution terms could not be established** from available documentation and would need to be confirmed with the provider directly. |

A learner-facing product that displays prices is redistribution, not internal use. **None of
the three free tiers is established as permitting what Studio needs.**

Options, none yet chosen:

1. **Curated dated snapshots.** Hand-build a reviewed price/return history for the curated
   universe only, versioned like the catalog, with terms confirmed per source. Full control,
   real maintenance cost, cannot extend beyond the curated set.
2. **A paid licence** for a commercial redistribution tier.
3. **Scope price-dependent features out** for launch, which removes momentum scoring,
   covariance, simulation, and share quantities in the worksheet — that is, most of M6 and M7.

**Decision taken 2026-09-05: curated dated snapshots.** Studio will carry a reviewed price and
total-return history for the curated universe only, versioned like the catalog. This changes
the licensing problem rather than removing it — a snapshot still needs a source it may lawfully
be taken from, and that source is chosen below.

### A public-domain price source, tested and working

N-PORT holdings filings report, for each position, a share count (`balance` with `units` of
`NS`) and a US-dollar value (`valUSD`). **Implied price = valUSD ÷ shares.** SEC filings are
public domain, so a price derived this way carries no redistribution restriction.

Tested against the VXUS filing already in hand (`0000736054-26-000191`, period 2026-04-30):
**8,774 of 8,878 positions — 98.8% — carry both figures.** Spot checks return plausible prices
across currencies, for example Samsung Fire & Marine at USD 312.29 and Korea Petrochemical at
USD 123.50, each with the filing's own `exchangeRt` recorded alongside so the local-currency
price is recoverable.

Real limitations, none of them fatal but all of which must reach the interface:

1. **Frequency.** Funds file monthly but only the third month of each quarter becomes public,
   so a single fund yields roughly four observations a year. Different fund families have
   different fiscal quarter-ends, so pooling across filers should improve this for widely-held
   names. Frequency must be measured, not assumed.
2. **It is a valuation, not a market close.** The Glanbia position above carries
   `fairValLevel` 2 — a Level 2 fair value, not a Level 1 quoted price. Studio must label
   these as fund-reported valuations rather than trade prices.
3. **Coverage** is limited to securities held by N-PORT filers. Broad for liquid names,
   absent for anything no US registered fund holds.
4. **FX is embedded.** `valUSD` is already converted; the local price requires dividing by the
   filing's stated rate, and that rate is itself dated.

This is a candidate, not a conclusion. Before it is relied upon, the achievable observation
frequency for the intended universe must be measured directly, and the Level 1/2/3 mix
inspected. Both are M1 work still outstanding.

## Finding 4 — what mathematics already exists, and what does not

Established by a full read of the repository. `package.json` contains **no** maths,
statistics, optimisation, matrix or RNG dependency; every numeric routine here is hand-written.

**Reusable as-is:**

| Module | Provides |
| --- | --- |
| `lib/fixed-income.ts` | Complete bond engine: cash-flow schedules, price from YTM, YTM by bracketed bisection, Macaulay and modified duration, convexity, portfolio duration. Gap: **no accrued interest or day-count** |
| `lib/risk-return.ts` | Mean, geometric mean, sample variance and SD, covariance, correlation, annualisation, portfolio expected return |
| `lib/allocation-policy.ts` | Integer basis-point allocation, stress contribution as weight × loss, position ceiling from a loss budget. Tested |
| `lib/operating-plan.ts` | Drift against target bands, one-sided turnover, three rebalance methods. Tested |
| `lib/valuation-basics.ts` | The Damodaran identity: reinvestment = g/ROC, FCFF, EV = FCFF/(WACC−g), value spread. Tested |
| `lib/northstar-case.ts` | Two-stage dividend model, Gordon value, implied cost of equity and implied growth from price |
| `lib/holdings-slate.ts` | Issuer aggregation by LEI, overlap between two holdings sets, staleness. Look-through is right but reads a hardcoded fund map and needs parameterising |

**Reusable only after repair:** `lib/portfolio-theory.ts` has global-minimum-variance,
frontier and tangency solvers — but all three call an `inv3x3` helper that destructures
exactly three rows. **They are three-asset only and return garbage beyond that.** A general
inverse is needed before any of it serves a real portfolio. The solvers are also unconstrained
and will return negative weights.

**Private but valuable:** `lib/studio.ts` holds `apportion` (largest-remainder cent
distribution), `cents`, `money` and `pct` as module-private functions. These should be
exported rather than rewritten.

**Absent entirely, and required:**

- Quantiles, percentiles, median — **so winsorization and the whole z-score screening layer
  must be built from nothing**
- Covariance and correlation *matrices* from a returns panel; only pairwise exists
- General n×n linear algebra, Cholesky, eigendecomposition
- Constrained optimisation of any kind
- WACC and CAPM cost of equity as executable functions, not rendered formulas
- Accrued interest and day-count conventions
- Diversification measures — effective number of constituents and of correlated bets, which
  the team's ensemble decision turned on
- A Monte Carlo harness. A seeded `mulberry32` RNG with Box-Muller normals exists, correct and
  production-quality, **copy-pasted verbatim in six lesson components** and belonging in none
  of them

**Test coverage warning.** The six modules carrying nearly all the statistics, portfolio, bond
and cents-safe arithmetic — `portfolio-theory`, `risk-return`, `fixed-income`,
`northstar-case`, `studio`, `utils` — have **no test files**. Anything depending on them needs
its own verification first.

## Finding 5 — the prototype target has negative earnings

Incidental but useful. Atkore's most recent annual figures show **net income of
−$15,175,000 and diluted EPS of −$0.45** for the year ended 2025-09-30, against gross profit
of $676M and operating cash flow of $403M.

This makes it an unusually good prototype. It exercises the deteriorating-profitability
tension the handoff's §9 asks the Atkore journey to teach, and it breaks earnings yield — an
undefined ratio from negative earnings, which is one of the seven unresolved method questions
recorded in the coverage map. The prototype cannot avoid answering it.

## Outstanding for M1

Not done. No claim is made for any of these.

1. Full field inventory for one complete investigation and one portfolio comparison.
2. Damodaran NYU industry data — permitted-use confirmation.
3. Strategy PDF pp. 8-10 read as images for the workbook layout.
4. A decision on Finding 3, which requires the user.
5. Concept-mapping tables per sector template, following from Findings 1 and 2.
