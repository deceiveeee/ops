# Portfolio Builder practical-tools research

**Research date:** 2026-08-12

**Status:** complete for curriculum design; not a substitute for each mission's Gate A audit

**Scope:** practical tools that can turn the proposed 13-mission curriculum into a
build-as-you-learn portfolio workflow

## 1. Research decision

Damodaran's 38-session *Investment Philosophies* sequence can supply the analytical engine
for Portfolio Builder, but it cannot supply the complete implementation chassis for a
beginning US investor.

The course should therefore preserve Damodaran's decision logic while adding a single
persistent **Portfolio Workbench** backed by current primary sources. The learner's work
must advance through these controlled states:

```text
mandate → strategic weights → research-only watchlist → architecture license
        → timing policy → product slate → order rehearsal → operating plan
```

A company investigated in Missions 6–7 is not yet a holding. It stays on a research-only
watchlist until the learner has quantified friction, tested the evidence, and passed the
passive-versus-active architecture gate in Missions 8–10. Actual products enter only in
Mission 12. This is the central safety and pedagogy finding from the research.

## 2. Damodaran source lock

The controlling course remains Aswath Damodaran's official 38-webcast *Investment
Philosophies* sequence, companion to the second edition (Wiley, 2012):
<https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm>.

The complete session-level source and defect record is maintained in:

- `docs/source-audits/damodaran-investment-philosophies-corpus-audit.md`
- `docs/source-audits/damodaran-investment-philosophies-38-session-curriculum-map.md`

The following additional official Damodaran resources were reviewed for practical workflow
design:

| Official resource | What it contributes | OPS boundary |
| --- | --- | --- |
| [Investment Philosophies course project](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/invphilcourse/InvPhilProject.htm) | The culminating prospectus asks for a philosophy, strategy, constraints/capacity, evidence, backtest, evaluation frequency, yardstick, and portfolio. | The class assignment's portfolio of at least 25 stocks is a professional active-fund exercise, not a universal personal-portfolio rule. OPS adapts the process, not the stock count. |
| [Course syllabus](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/invphilcourse/InvPhilSyll.htm) | Tells students to begin the project well before the final week. | Supports build-as-you-learn sequencing rather than an end-only capstone. |
| [Introduction to Portfolio Management](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/background/portmgmt.htm) | Defines the process as understanding the client, asset allocation, asset selection, execution, and evaluation; connects philosophy to strategy and investor constraints. | It is a conceptual process, not a personal readiness screen, product-selection checklist, or operating policy. |
| [Investment Philosophies book and tools](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/invphilbook.htm) | Links chapter datasets and models for risk, ratings, ratios, and bond value. | Many datasets and product claims are dated. Stable mechanics may be adapted; current magnitudes require current evidence. |
| [Spreadsheet collection](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/spreadsh.htm) | Shows how assumptions, calculations, diagnostics, and outputs can remain inspectable. | The spreadsheets are expert tools and are too dense to expose wholesale to a novice. |
| [DCF checklist](https://pages.stern.nyu.edu/~adamodar/pdfiles/eqnotes/DCFtodolist.pdf) | A concrete research sequence from company and filings through risk, cost of capital, cash flow, growth, and value. | It is appropriate for an optional deep valuation path, not required product selection for every learner. |
| [Trading implementation notes](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/invemgmt/trading.htm) | Connects coherent strategy, waiting cost, execution, capacity, and post-trade analysis. | Current order mechanics and brokerage safeguards require regulator sources. |

### Spreadsheet inspection

Four official files were downloaded into ignored research storage and inspected structurally.
They are exploratory design references, not yet canonical learner-facing source artifacts.

| File | SHA-256 | Useful interaction pattern | Do not carry forward |
| --- | --- | --- | --- |
| [`fcffsimpleginzu.xlsx`](https://pages.stern.nyu.edu/~adamodar/pc/fcffsimpleginzu.xlsx) | `d6ffb67d965dc22463e4d013636befab3da431e7fc608936a82612fa73198e72` | Seventeen sheets separate inputs, story-to-numbers assumptions, valuation outputs, diagnostics, option value, synthetic rating, R&D and lease conversion, cost of capital, data, distributions, and answer keys. It demonstrates visible assumption lineage and diagnostic questions. | Do not reproduce the workbook as a beginner UI or treat its current company example as portfolio advice. |
| [`risk.xls`](https://pages.stern.nyu.edu/~adamodar/pc/risk.xls) | `f596e6f17dd265b04de0a6f048e571cd809b3275d19b6e4824649da6eb0508eb` | Builds alpha, beta, R-squared, and volatility from a transparent return series. | Do not depend on its historical data or present a single beta as known truth. |
| [`ratings.xls`](https://pages.stern.nyu.edu/~adamodar/pc/ratings.xls) | `45d1f61c67f02fb595661e95ef294e72524a105c9db85ee198a918386d580d3c` | Maps interest coverage and firm characteristics into a synthetic rating and debt cost. | Default-spread tables decay; use the mechanism only with current, dated inputs. |
| [`finratio.xls`](https://pages.stern.nyu.edu/~adamodar/pc/finratio.xls) | `6372470cb66d51a918407fc74aded6e72c59c8ef40e3673927291da1239693c9` | Links statement inputs, adjustments, ratios, returns, leverage, coverage, WACC, and economic value added. It supports a filing-as-source-code visual model. | The full model is too large for the required path, and its accounting treatment must be reconciled to current filings. |

The design lesson from these files is not “put a spreadsheet in the browser.” It is to
make every output inspectable: show the learner the source datum, assumption, transformation,
result, warning, and review date.

## 3. Mission-to-tool coverage

Page references are physical slide pages. Caption times refer to the canonical official
caption tracks. Missing and defective source material remains governed by the corpus audit.

| Mission | Practical component | Damodaran support | What OPS must add |
| ---: | --- | --- | --- |
| 1 | **Mandate Interview and Life-Change Test** | S1 p. 4 and pp. 8–10, 02:54–06:19 and 10:13–13:17; S38 pp. 2–9, 00:20–07:35; sleep/life-change/second-guessing checks at S38 p. 4, 02:35–03:59. | Emergency-reserve and high-interest-debt readiness, account authority, earned-income/account eligibility prompts, and a non-punitive practice path. |
| 2 | **Market Belief and Falsifier Builder** | S1 pp. 2 and 7, 01:10–01:55 and 09:06–10:13; S7 pp. 2–4 and 8–10, 00:23–03:32 and 08:39–11:40. | Explicit falsification is an OPS synthesis, later grounded by S8's fair-test method. |
| 3 | **Bond Shock Lab** | S2 p. 4, 01:51–03:41; pp. 5–6, 03:41–06:51; pp. 8–10, 07:33–11:08; pp. 12–13, 12:29–13:53. | Current bond-fund mechanics and clearly dated illustrative rates/spreads; inflation, reinvestment, call, and liquidity warnings. |
| 4 | **Equity Risk X-Ray and Required-Return Builder** | S3 p. 3, 00:28–02:39; p. 6, 05:05–07:09; pp. 8–10, 09:12–14:51; p. 15, 21:45–23:14; p. 17, 24:43–26:01. | Dated risk-free rate, equity-risk-premium, and beta inputs; visible uncertainty rather than false precision. |
| 5 | **Allocation Studio and Loss-Budget Test** | S1 p. 4, 02:54–06:19; S30 p. 2, 00:47–01:49; p. 5, 05:44–07:27. | Damodaran supplies no allocation algorithm, return/covariance set, personal position-size rule, or numeric concentration cap. OPS must derive sizing transparently from the learner's loss budget and label it as an OPS policy. |
| 6 | **Filing-to-Cash-Flow Scanner** | S4 pp. 3–7, 01:00–07:20; pp. 8–11, 07:20–12:14; pp. 13–16, 13:09–18:20; pp. 17–18, 18:20–20:20. | Current filing/accounting authority and a source-date trail. Output is a research brief, not permission to buy. |
| 7 | **Valuation Range and Watchlist Gate** | S5 pp. 2–13; optional four-stage active-stock screen at S13 pp. 14–15, 19:11–23:28. | S5 has no official caption track, so new narration claims remain gated. Bear/base/bull assumptions and action price are OPS scaffolding. Candidate remains research-only. |
| 8 | **Friction Checkout** | S6 p. 2, 00:21–02:27; p. 3, 02:27–03:12; pp. 5–17, 04:54–21:14. | The exact two-sided haircut result is 12.2449%, not the source's 12.22% approximation. Saved costs are learner assumptions, not measured forecasts. |
| 9 | **Claim Test Lab** | S8 pp. 2–4, 00:23–07:14; procedures at pp. 5–14; skeptic checks at pp. 15–17, 23:49–29:28. | Correct S8's reversed regression labels and nonstandard Sharpe shorthand; require benchmark, holdout, bias, risk, cost, economic-significance, and abandon checks. |
| 10 | **Architecture Gate and Edge License** | S35 p. 2, 00:23–01:03 and pp. 5–12, 04:27–10:29; S36 pp. 2–8, 00:22–07:21 and pp. 9–16, 07:21–15:31; S7, S8, and S6 gates. | Current active/passive base rates and persistence evidence. An active sleeve is disabled until mechanism, evidence, friction, capacity, durability, size, and thesis-break rules pass. |
| 11 | **Timing Policy Simulator** | S30 pp. 2 and 5, 00:47–01:49 and 05:44–07:27; S32 pp. 2 and 5–13; S33 pp. 3–5 and 7–14, 00:41–07:02 and 07:24–13:01; S34 pp. 2–17, 00:00–17:27. | S32 has no official captions. Reject S34's 5–10% speculative-sleeve suggestion as a beginner default. Require either no timing or a bounded, expiring deviation rule. |
| 12 | **Fund Passport, Holdings X-Ray, and Order Rehearsal** | S37 pp. 2–3, 00:40–03:30; p. 6, 04:41–06:11; pp. 7–10, 06:11–12:56; exposure/diversification close, 12:56–13:38. | Current prospectus, shareholder report, holdings, fee, spread, tracking, security-identity, account, and order-type evidence. No live order submission. |
| 13 | **Portfolio Flight Test and IPS Compiler** | S1 p. 4, 05:41–06:19; S36 pp. 9–16, 07:21–14:47; S38 p. 4, 02:35–03:59 and p. 12, 11:51–12:57; optional monitoring logic at S25 pp. 3 and 8, 01:08–01:56 and 07:52–09:00, and S26 p. 13, 17:42–20:24. | Formal IPS, contribution/withdrawal rules, personal rebalancing method, account placement, current tax warnings, and an unfamiliar-case transfer assessment. |

The other 22 Damodaran sessions remain optional edge laboratories rather than additional
required missions. Each lab must finish at the saved Mission 8 Friction Budget and Mission 9
Evidence Test before it can affect the architecture decision.

## 4. Current primary-source tool layer

Damodaran does not cover several personal-implementation decisions to current, beginner-safe
depth. The following official tools and documents define the supplemental layer.

| Need | Current primary source | Local source status | Intended OPS use and boundary |
| --- | --- | --- | --- |
| Investment readiness | [Investor.gov Investor Preparedness Checklist](https://www.investor.gov/introduction-investing/general-resources/investor-preparedness-checklist); [CFPB emergency-fund guide](https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/) | **Locked** in the supplemental source pipeline on 2026-08-12. | Mission 1 readiness runway: goals, high-interest debt, emergency reserve, risk, fees, research, and diversification. No source supplies a universal emergency-reserve number; the learner chooses and explains a target. |
| Goal math | [Investor.gov Savings Goal Calculator](https://www.investor.gov/financial-tools-calculators/calculators/savings-goal-calculator) | Official tool reviewed; not cached because it is an interactive service rather than lesson evidence. | Model the connection among goal amount, time, current savings, and contributions. OPS must not imply a forecast or guaranteed return. |
| Risk capacity and willingness | [Investor.gov risk-tolerance guide](https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/gauge-your-risk-tolerance); [CFA Institute portfolio planning and construction](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/basics-of-portfolio-planning-and-construction) | Investor.gov page **locked**; CFA article is a reviewed design reference, not yet in the pipeline. | Keep ability to bear loss separate from willingness; feed both into Mission 5. Do not convert a questionnaire score directly into a prescribed stock percentage. |
| Allocation and rebalancing | [Investor.gov asset allocation guide](https://www.investor.gov/introduction-investing/getting-started/asset-allocation); [Investor.gov beginner's guide](https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset); [Vanguard retail rebalancing guidance](https://investor.vanguard.com/investor-resources-education/portfolio-management/rebalancing-your-portfolio) | Investor.gov beginner's guide **locked**; the other pages are reviewed design references. | Teach target weights, drift, annual review, and three action methods: trade, add to underweights, or redirect contributions. Any numeric drift band is an OPS policy. Vanguard's *Rebalancing Edge* is a target-date-fund provider study, not a DIY rule. |
| Concentration and overlap | [FINRA concentration-risk guidance](https://www.finra.org/investors/insights/concentration-risk) | Complete official page browser-reviewed; local canonical fetch returned **403**, so Mission 5/12 citation remains gated. | Look through issuer, sector, employer-stock, correlated-fund, and illiquidity concentrations. No SEC or FINRA source provides a universal personal position cap; fund statutes are not personal suitability rules. |
| Fund cost comparison | [FINRA Fund Analyzer](https://www.finra.org/investors/tools-and-calculators/fund-analyzer) | Official service reviewed; link-out only. | Compare up to three funds over a chosen holding period. Do not scrape or embed it; teach the method and preserve the learner's source date. |
| Fund and ETF diligence | [SEC fund and ETF guide](https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-1); [SEC Form N-1A](https://www.sec.gov/files/form-n-1a.pdf); [SEC tailored shareholder-report guide](https://www.sec.gov/resources-small-businesses/small-business-compliance-guides/tailored-shareholder-reports-mutual-funds-exchange-traded-funds-fee-information-investment-company); [Form N-PORT datasets](https://www.sec.gov/data-research/sec-markets-data/form-n-port-data-sets) | Fund guide and EDGAR endpoint **locked**. Form N-1A and N-PORT pages were browser-reviewed but local canonical fetch returned **403**. | Build the Fund Passport, prospectus lens, and overlap X-ray from exact current EDGAR filings. N-PORT is quarterly; timestamp every result and disclose coverage. |
| Order rehearsal | [SEC order-types bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-14); [SEC brokerage-account bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-43) | Both **locked** in the supplemental source pipeline on 2026-08-12. | Verify exact security identity, dollars/weight, cash versus margin, order type, spread, fractional-share support, and expected confirmation. The course never transmits an order. |
| Taxes and accounts | IRS Publications 550, 590-A, and 590-B in `scripts/source/supplemental-manifest.json` | **Locked**, US only, high-decay. | Add account-context warnings and tax-aware operating rules. Flag possible issues rather than calculate liability or recommend an account. |
| IPS | CFA Institute, *Elements of an Investment Policy Statement for Individual Investors*, in the supplemental manifest | **Locked**. | Compile objectives, constraints, allocation, benchmark, rebalancing, governance, and review rules. The learner's document is educational, not fiduciary advice. |

### Position-size derivation

OPS should not borrow the 5%, 10%, or 25% thresholds found in investment-company and tax
diversification rules. Those tests govern fund classification or tax status; they are not a
personal suitability standard.

Instead, Mission 5 should make the policy visible:

```text
position weight × assumed position loss = contribution to portfolio loss
```

The learner chooses the maximum portfolio loss contribution they can defend, then derives a
candidate position ceiling under explicit stress assumptions. The UI must label the result
**OPS loss-budget policy**, show every input, and allow “I do not know yet.” It is not a
source fact, guarantee, or personalized recommendation.

## 5. Learner eligibility and the two equal paths

Portfolio Builder serves learners who may be minors, may not control an account, or may not
be financially ready to invest. Mission 1 therefore begins with two equally complete modes:

- **Build mine:** use the learner's own goal and circumstances. Personal execution stays
  locked when readiness or authority is unresolved.
- **Practice case:** build the same portfolio dossier for a realistic fictional investor
  with no real money and no reduced curriculum.

A learner with high-interest debt, an emergency-reserve gap, no earned income, no account
authority, or another deployment constraint can still finish all 13 missions and demonstrate
portfolio competence. Their capstone is a paper portfolio plus a deployment action plan.
The course must not encourage a learner to bypass custodial, eligibility, jurisdiction, or
readiness constraints.

## 6. Source boundaries that must survive implementation

1. Stable mechanisms may come from Damodaran; current empirical magnitudes, market inputs,
   products, tax rules, and regulation need current dated authority.
2. Damodaran's project validates build-as-you-learn work, but its 25-stock active portfolio
   is not a core-course mandate.
3. No real trade, owned-state claim, or product conversion appears before Mission 12.
4. Mission 10 keeps passive as the default architecture unless a specific edge clears the
   learner's saved evidence and friction hurdles. A base rate does not prove no one can win.
5. Damodaran does not supply a personal allocation algorithm, numeric concentration rule,
   current product checklist, rebalancing policy, account-location rule, current tax advice,
   or formal IPS. These are explicitly labeled OPS adaptations.
6. Current manager-persistence evidence remains a Mission 10 source gap until a canonical
   primary artifact is cached, hashed, extracted, and reconciled.
7. Sessions without official caption tracks and all corpus defects remain governed by the
   master audit. Noncanonical ASR may navigate a source but cannot close a claim gate.

## 7. Approval conclusion

The 13-mission build-as-you-learn direction was **approved on 2026-08-12**, including the
controlled state sequence above and the separate personal/practice modes. This approval
does not approve the remaining gated missions for release.

The detailed interaction, data, accessibility, and graduation specification is in
`docs/lesson-plans/portfolio-builder-guided-workbench.md`.
