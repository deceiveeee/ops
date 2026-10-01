# Studio: how two saved allocations behaved over the same past months

Method review: 2026-09-27. Scope: a historical comparison of two saved,
long-only, unlevered target allocations over one common set of past months:
growth of 100, compounded return, monthly volatility, largest observed
month-end fall, a month-by-month breakdown, and a saved, reproducible record.
This is an original OPS workspace tool. It adapts no course session and makes
no claim of GIPS compliance, investability or forecast. Expected returns,
optimization, annualized figures, risk contributions, simulation, currency
conversion, live data and individual-bond returns are outside this release.

## 1. Sources and edition lock

| Source | Edition / date | Sections read (retrieved 2026-09-27) | Used for |
| --- | --- | --- | --- |
| NIST/SEMATECH e-Handbook of Statistical Methods, [6.5.4.1 Mean Vector and Covariance Matrix](https://www.itl.nist.gov/div898/handbook/pmc/section5/pmc541.htm) | Online edition, page as served | Whole section, including the 5 × 3 worked example and its matrix `S` | Sample covariance with the `n − 1` denominator; the variance-covariance matrix; an independent test case |
| NIST/SEMATECH e-Handbook, [1.3.5.6 Measures of Scale](https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm) | Online edition | "Definitions of variability" (variance, standard deviation) and the note that variance "can be greatly affected by the tail behavior" | Sample variance and standard deviation as its square root; a caution for the learner |
| NIST/SEMATECH e-Handbook, [2.5.5 Propagation of error considerations](https://www.itl.nist.gov/div898/handbook/mpc/section5/mpc55.htm) | Online edition | Treatment of covariance terms: they must be included when the quantity is a summation | Why portfolio variance keeps every covariance term. The page's extracted formula text was garbled, so no formula is quoted from it; the identity used is derived in §3 and verified numerically |
| CFA Institute, [GIPS Standards Handbook for Firms](https://www.gipsstandards.org/standards/gips-standards-for-firms/gips-standards-handbook-for-firms/), Explanation of the Provisions in Sections 1-8 | November 2020 | Provision 2.A.24 and its discussion, including the formula image `2.A.24.1.png`: `r = [(1 + r1) × (1 + r2) × … × (1 + rI)] − 1` | Geometric linking of periodic returns; returns at least monthly, at month end. Supporting methodology only: an OPS hypothetical comparison is not a GIPS composite and claims no compliance |
| Prasad Ramani, CFA, [Sculpting Investment Portfolios: Maximum Drawdown and Optimal Portfolio Strategy](https://rpc.cfainstitute.org/blogs/enterprising-investor/2013/sculpting-investment-portfolios-maximum-drawdown-and-optimal-portfolio-strategy), CFA Institute Enterprising Investor | 12 February 2013 | Definitions of drawdown and maximum drawdown; the caution that "the magnitude of drawdowns also depends on the frequency of measurement" | Interpretive (secondary) support for a fall "from the previous local maximum to a subsequent trough", and for telling the learner that month-end data miss falls within a month |
| Existing [total returns and valuation audit](studio-total-returns-and-valuation-workspace.md), SEC Form N-PORT Item B.5 and Form N-1A Item 26(b)(1) | Method lock 2026-09-20 | Re-read in full; bundled data inspected 2026-09-27 (below) | Fund-reported monthly total returns with distributions reinvested, exact share class, NAV basis; local import contracts |

Bundled data inspected 2026-09-27 (`lib/studio-project/data/fund-total-returns.json`,
built 2026-09-20): VTI (series S000002848, class C000007808) and VOO (S000002839,
C000092055) 2025-01 to 2026-06; VXUS (S000002932, C000094038) 2024-11 to
2026-04. Each has 18 consecutive monthly returns, USD, net asset value, and six
SEC sources with accession, URL, filing, report and retrieval dates and a SHA-256
of the retrieved XML; every month names its accession. Earlier audit claims were
checked against this file, not assumed.

## 2. Coverage: each definition and choice, and what supports it

| Item | Support | Learner prerequisite / where introduced |
| --- | --- | --- |
| Monthly total return of a fund includes reinvested distributions once | Existing N-PORT / N-1A audit | Return history heading defines total return |
| Growth of 100 compounds monthly returns: `G_t = G_(t−1) × (1 + r_t)`; period return `G_n / 100 − 1` | GIPS 2.A.24 geometric linking | Compare view states "100 grows month by month"; worked example +10% then −10% is −1%, not 0 |
| Portfolio monthly return `r_p,t = Σ w_i r_i,t + w_cash × 0` with whole-portfolio weights | Arithmetic of a portfolio reset to fixed weights; **OPS modeling choice: rebalanced monthly** | Shown beside the chart with the reset explained before results |
| Whole-portfolio weight `w_i = ((B − C) / B) × p_i / 100`; cash `1 − Σ w_i` | Existing Studio allocation convention (portfolio-weights audit §3) | Choose data shows both allocations' weights of all money |
| Cash earns **0% a month** | **OPS modeling choice**, stated; not a bank rate, not inflation-free | Stated beside the chart and in the month breakdown |
| Sample mean, variance (`n − 1`), standard deviation | NIST 1.3.5.6 | Defined before the result: "how much the monthly returns varied around their average", with a worked example |
| Sample covariance matrix `S` | NIST 6.5.4.1 | Calculation details only; not needed to read the result |
| Monthly portfolio variance `wᵀ S w`, equal to the sample variance of `r_p` | Derivation in §3; NIST 2.5.5 on keeping covariance terms; verified numerically | Calculation details |
| Largest observed fall: running peak `P_t = max(G_0 … G_t)`, `D_t = 1 − G_t / P_t`, maximum over t | Standard definition; Ramani (2013) for peak-to-trough and measurement frequency | Defined before the result with the dates of peak and trough |
| Minimum two common months for a complete comparison | Mathematical minimum for a sample variance; **not** evidence of a reliable estimate | Stated with the period and sample count |
| Same currency and basis for every history; USD only | **OPS scope choice**: no conversion in this release | Blocked state names the mismatch |
| Individual bonds with positive weight are unsupported | **OPS scope choice**: no bond return model in this release | Blocked state explains and preserves the allocation |

## 3. Method

For budget `B > 0`, reserve `0 ≤ C ≤ B` and saved after-reserve percentages
`p_i` (each 0-100, total no more than 100 after the engine's six-decimal
rounding, so 5.4 + 69.9 + 24.7 is exactly 100):

```text
w_i = ((B − C) / B) × (p_i / 100)          w_cash = 1 − Σ w_i
r_p,t = Σ w_i r_i,t + w_cash × 0
G_0 = 100, G_t = G_(t−1) × (1 + r_p,t)     period return = G_n / 100 − 1
mean = Σ r_p,t / n
S_ij = Σ_t (r_i,t − mean_i)(r_j,t − mean_j) / (n − 1)
variance = wᵀ S w                           volatility = √variance
P_t = max(G_0, …, G_t)                      D_t = 1 − G_t / P_t      largest fall = max D_t
```

**Why `wᵀ S w` equals the portfolio series' own sample variance.** With
`r_p,t − mean_p = Σ_i w_i (r_i,t − mean_i)` (the cash term is the constant 0),
`Σ_t (r_p,t − mean_p)² / (n − 1) = Σ_i Σ_j w_i w_j Σ_t (r_i,t − mean_i)(r_j,t − mean_j) / (n − 1) = wᵀ S w`.
The implementation computes both and requires them to agree to a scale-aware
tolerance; a disagreement is reported as a calculation failure, not rounded
away. No matrix inverse is used, so constant, identical or collinear histories
are valid inputs. A constant series has undefined correlation; none is shown.

**Conventions fixed by this audit.**

- The months are one aligned matrix for the union of every investment with a
  positive weight in either allocation. Only the outer months are trimmed to the
  common contiguous overlap; the actual start, end, count and excluded outer
  months are shown. A narrower date range applies to both allocations.
- Nothing is forward-filled, interpolated, zero-filled, dropped, replaced by a
  proxy or renormalized. A missing history blocks the comparison and names the
  investment.
- Where several histories exist for one investment, the learner chooses. Public
  and imported histories are never spliced.
- The growth path starts at 100 on the boundary before the first return month,
  and that starting value counts as a peak, so a first-month loss is a fall. The
  peak is the first month-end at the running maximum (a later equal value does
  not move it). The trough is the first month-end at the largest fall. With no
  fall, the largest fall is 0 and no dates are shown.
- Floating-point tolerance: variance within `1e-12 × (1 + Σ|w_i w_j S_ij|)` of
  zero is treated as zero; anything more negative is an error.
- An allocation entirely in cash takes the other allocation's months. When both
  are entirely cash no market history is needed, so the learner must state the
  period.
- No contributions, withdrawals, trading costs, personal taxes or inflation.
  Fund expenses and distributions stay as the source reports them, once.
  Rebalancing monthly would cost trading in practice; that cost is excluded.

Displayed wording: "rebalanced monthly" means the allocation is reset to its
saved weights at the start of each month. These are today's weights replayed
against past months, not the learner's account performance and not evidence of
an investable historical strategy. Volatility describes past variation;
the largest fall describes a past month-end decline. Neither bounds a future
loss or shows that goals or limits will be met. No result is called "best".

## 4. Independent reference cases

Computed in PowerShell 5.1 on 2026-09-27, without calling the implementation.
Original OPS synthetic fixture, not market data:

| Month | Investment A | Investment B |
| --- | ---: | ---: |
| 1 | +10% | 0% |
| 2 | −10% | +4% |
| 3 | +5% | −2% |

Budget 100,000, reserve 20,000, after-reserve 50% A and 50% B: whole-portfolio
weights 0.4, 0.4, cash 0.2. Portfolio returns +4%, −2.4%, +1.2%. Growth 104,
101.504, 102.722048: period return 2.722048%. Largest fall 2.4% (peak month 1 at
104, trough month 2). Mean monthly return 0.933333…%, which is neither the period
return nor a forecast. Sample variance of the portfolio series
0.0010293333333333337; `wᵀ S w` 0.0010293333333333335; volatility
3.2083225108042575%. Cov(A, B) −0.002666666666666667; Var(A) 0.010833333…;
Var(B) 0.000933333….

Further cases: +10% then −10% compounds to −1%. NIST 6.5.4.1's 5 × 3 matrix
reproduces `S` = 0.025, 0.0075, 0.00175 / 0.0070, 0.00135 / 0.00043. Unit tests
add a first-month loss, identical, offsetting, constant and collinear series,
more than three investments, order invariance, an all-cash allocation, unequal
outer dates, gaps, duplicates, currency and basis mismatches and saved-record
tampering.

## 5. Learner sequence

| Step | Introduce | Model | Practice / decision |
| --- | --- | --- | --- |
| Choose data | Which months both allocations share, and why missing months block | Coverage per investment with its source | Pick allocations and, where there is a choice, histories; import a missing one |
| Compare | Growth of 100; rebalanced monthly; cash at 0% | Two paths on one scale; worked +10% / −10% example | Read period return, volatility and largest fall with their definitions beside them |
| Inspect a month | A month's portfolio return is the sum of weighted returns | Signed rows plus cash add to the total | Step through months with the keyboard |
| Saved | A saved comparison keeps its data and weights | Reopen and compare with today's inputs | Record a reason; start a new comparison when inputs changed |

There is no graded assessment. Release evidence is appended below after the
implementation, with a separate fresh-learner walkthrough and terminology
review.

## 6. Release evidence, 27 September 2026

Appended after the implementation. Sections 1-5 above are the method as locked
before building; where the built page differs, the correction is dated here
rather than rewritten above.

### What was built

- Calculation and alignment: `lib/studio-project/return-comparison.ts` (no data
  imports). Saved records, their validation and the recomputation that
  re-verifies every stored result: `return-comparison-saved.ts`. Today's
  histories and what changed since a save: `return-comparison-sources.ts`, the
  only module that loads the public return bundle.
- Storage: `schema.ts` gains the optional `returnComparisons` (at most 20);
  `validate.ts` refuses a record whose data does not reproduce its results.
  Older projects and backups, which lack the field, read unchanged.
- Page: `components/studio/workspace/ReturnComparisonWorkspace.tsx` and its
  stylesheet, as the Two allocations view of Return history
  (`ReturnHistoryWorkspace.tsx`, which also sends a missing history to the
  existing importer and returns); the entry link from Compare allocations
  (`PortfolioWeightsWorkspace.tsx`); the shared `WrappingSelect.tsx`.
- Design record: [studio-portfolio-return-comparison.md](../design/studio-portfolio-return-comparison.md).

### Corrections to sections 2 and 5 (27 September 2026)

- §2 row 2 and §5 "Compare": the +10% then −10% example and the three-month
  volatility example are inside the Compare view's **How these are calculated,
  and the data used**. The view itself shows the starting value on the chart's
  axis ("100 at the start of Jan 2025") and each path's end value beside its
  line.
- §2 rows 3, 6 and 9 and §5 "Compare": the definitions of monthly volatility,
  largest fall and rebalanced monthly sit **above** the chart and results, not
  beside them, so they are read first. The period's rules (months, rebalanced
  monthly, cash earns 0%) head the view.
- The results table has no "100 became" row: the end values are the chart's
  labels and its text alternative. It shows compounded return, monthly
  volatility and largest fall with its high and low months ("Jan–Apr 2025").

### Numerical evidence

Plain loops over `lib/studio-project/data/fund-total-returns.json` in Node,
27 September 2026, sharing no code with the implementation. Whole-portfolio
weights are 0.8 × each saved percentage (budget 100,000, reserve 20,000).

| Case | Months | 100 became | Monthly volatility | Largest fall |
| --- | --- | ---: | ---: | --- |
| VTI 60% + synthetic AGG 40% | Jan-Dec 2025 | 108.81 | 1.54% | 3.87%, Jan to Apr 2025 |
| VTI 30% + synthetic AGG 70% | Jan-Dec 2025 | 105.23 | 0.75% | 1.74%, Jan to Apr 2025 |
| The first, after VTI changed to 50% | Jan-Dec 2025 | 107.43 | 1.28% | 3.20%, Jan to Apr 2025 |
| VTI 50%, VXUS 30%, VOO 10% (public only) | Jan 2025-Apr 2026 | 121.87 | 2.62% | 4.45%, Feb to Mar 2026 |
| VTI 30%, VXUS 50%, VOO 10% (public only) | Jan 2025-Apr 2026 | 125.04 | 2.55% | 5.04%, Feb to Mar 2026 |

The synthetic AGG series is an OPS test fixture (+0.4, −0.3, +0.6, +0.2, −0.5,
+0.3, +0.1, +0.7, −0.2, +0.5, −0.1, +0.4% a month), not market data. Every row
matches the page. The browser tests recompute every row with their own loops
and compare them with what the page shows. In a browser check the same day,
March 2026's month rows in the public-only case added to −4.45% and −5.04%,
the month's totals.

The reference fixture of §4 is asserted by `return-comparison.test.ts` from
the values computed in PowerShell, not from the implementation.

### Tests and build (final tree, 27 September 2026)

- Typecheck, `npx tsc --noEmit`: passes.
- Lint, `npm run lint`: no errors; two warnings, both in onboarding files this
  work does not touch.
- Unit, `npx vitest run --exclude "tmp/**"`: 89 files, 1,239 tests passed,
  including 50 in `return-comparison.test.ts` and
  `return-comparison-saved.test.ts`.
- Browser, full suite against a production build and server started by
  Playwright on port 3301 (no other server attached): 245 passed, 0 failed,
  5 skipped. The skips are existing tests that run only when an environment
  variable asks for them (capture, EDGAR, Supabase, deck rendering, optional
  screenshots). `e2e/studio-return-comparison.spec.ts` has 7 tests.
- Storage, `npm run test:studio-storage`: 13 passed.
- Of three further full runs on the final tree, two passed completely and one
  failed a single existing test outside this work: the valuation editor saved
  "Ne capital…" for typed "New capital…". It passes alone (14 of 14, twice
  over). It is a real race in `ValuationEditor.tsx`, not a test fault: its
  re-sync from the saved record can overwrite a keystroke made while a save
  finishes. It is recorded as a separate task, not fixed here.
- An earlier full run the same day failed 14 tests, and both causes were this
  work. Thirteen were the storage harness, which loads `lib` modules into a
  page and cannot load JSON: `validate.ts` had come to import the public
  return bundle through the saved-record module. The bundle now loads only in
  `return-comparison-sources.ts`. The fourteenth expected the arrow key to go
  from Inspect history to Import; the new Two allocations tab now sits between
  them, and the test says so.
- The new browser tests fail when the code is wrong: dividing the variance by
  `n` instead of `n − 1` fails the journey's volatility row; a retry that adds
  a copy fails the save-failure test with two saved comparisons; removing the
  "Other holdings" row fails the many-holdings test.
- Six widths: every state in the [design record's table](../design/studio-portfolio-return-comparison.md#layout-and-screen-budget).
  Blocked, choose, compare, month and saved are within 1.5 screens at all six
  widths. A reopened comparison with changed inputs (1.68) and the long-name
  choose (1.82), compare (1.59) and month (1.62) states exceed 1.5 at 390
  pixels; this is not met, and is recorded there with the page's own 0.69
  screens of frame, heading and footer at that width. No horizontal overflow,
  no text under 12px, no monospace, no page or console errors.

### Fresh-learner walkthrough (an agent's, not a learner's)

No learner has used this view. What follows is Claude working through the
flow as a novice who has set goals, saved two allocations on Compare
allocations and has not met volatility or drawdown. It is a design check, not
learner testing, and makes no claim about how people learn from the page.

1. **Arriving.** From a saved proposal on Compare allocations, "See both over
   past months in Return history →" opens the Two allocations view with both
   allocations chosen. Return history's heading defines total return first.
2. **Choose data.** The table of investments showed 48.0% for VTI where the
   learner had saved 60%. Nothing visible said why. *Changed:* the table is
   captioned "Shares of all money and monthly histories", the term Compare
   allocations already uses, and the cash row reads "reserve and unassigned".
   AGG had no history: "None · import one" opened the importer with AGG
   already chosen, and saving the file came straight back.
3. **Compare.** Once the step line was replaced by the period's rules, nothing
   visible said the lines start at 100, so "108.81" had no anchor. *Changed:*
   the axis reads "100 at the start of Jan 2025". The three definitions come
   before the numbers. "Compounded return" relies on the Inspect history view's
   own "compounded return" and the worked example in the details; it is not
   separately defined on this view.
4. **Inspect a month.** Rows read "+1.49 points"; "points" was not explained.
   *Changed:* the note says the rows are in percentage points, the unit
   Compare allocations introduces ("subtracts 3 percentage points").
5. **Saving.** With storage full, a second press of Save would have stored the
   comparison twice. *Changed:* the unsaved attempt is labelled "Not yet
   stored in this browser" and a retry replaces it.
6. **Long names.** With 80-character allocation names the chart's labels ran
   off the page. *Changed:* long names are keyed First and Second with the
   full names shown in the key.
7. **Reopening after a change.** The notice named the allocation whose weights
   changed, kept the saved results and offered a fresh comparison, which then
   reflected the new weight.

Remaining for a real learner study: whether "largest fall" is read as a loss
limit despite the line saying it is not, and whether learners notice the
"Other holdings" row can be opened.

### Terminology review

| Term on screen | Where it is introduced | Consistent with |
| --- | --- | --- |
| Total return | Return history heading | Inspect history, the N-PORT audit |
| Allocation, "· selected" | Compare allocations | Compare allocations' picker |
| Share / weight "of all money" | Choose data caption; month note | Compare allocations ("10% of all money") |
| Percentage points ("points") | Month note | Compare allocations' change rows |
| Growth of 100; "100 at the start of …" | Chart axis and labels; details | Return history's Growth of 100 view |
| Compounded return | Results table | Inspect history ("compounded return") |
| Monthly volatility (standard deviation) | Definition above the results; worked example in details | Handoff wording |
| Largest fall, month-end high | Definition above the results | Handoff: "largest observed fall" |
| Rebalanced monthly | Definition above the results; period rules | Audit §3 |
| Cash earns 0% | Period rules; cash rows | Audit §2 (OPS choice) |
| Fund net asset value, market price | Importer's basis note; blocked state | Importer |
| First, Second | Key above the chart or month table, only for names over 24 characters | This view only |

One name per concept holds within the view. One possible confusion remains:
the view named **Compare** inside Two allocations and the separate page
**Compare allocations** both use "compare"; the first compares two past paths,
the second compares proposed weights.
