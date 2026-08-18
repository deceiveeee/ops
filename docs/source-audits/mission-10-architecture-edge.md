# Mission 10 source audit: architecture before edge

Audit date: 2026-08-12  
Approved curriculum mission: Mission 10, "Choose passive—or prove an edge"  
Gate covered: Gate A only. This document is not a lesson plan or implementation specification.

## 1. Edition and session lock

The controlling Damodaran source is the official **Investment Philosophies** 38-webcast
sequence, companion to the second edition of *Investment Philosophies* (Wiley, 2012).
The official course index is
<https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm>. Session numbers
below are deck numbers: `sessionN.pdf` and `quizN.pdf`. Mission 10's approved source family
is Sessions 35, 36, 7, 8, and 6. The 13-mission curriculum and Workbench direction were
approved on 2026-08-12; Mission 10 remains separately blocked at Gate A.

| Session | Locked title and canonical artifacts | Canonical cache evidence |
| ---: | --- | --- |
| 35 | **The case for passive investing: Active investors' track record**. [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session35.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz35.pdf), [video](https://www.youtube.com/watch?v=s4oaIxJhrO8), 14:53. | Deck: 19 physical pages, SHA-256 `d1ed7c9783edef5673bcb2fa92b5d222998fe2fdeadfef8ee6fcbc24df5a909a`. Quiz: 4 physical pages, `574fcd0b473db69090b794a2a0f51140c10975d5d6e8ccb245e8baf11919e58c`. Official-caption VTT: `77a48d999b23446dfa09b4fa5688f0fe01b9ad42a346dbaa1f7cc5376a71560d`. |
| 36 | **More on investor performance: Continuity & Consistency**. [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session36.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz36.pdf), [video](https://www.youtube.com/watch?v=45XCT1vVWEA), 15:47. | Deck: 17 physical pages, `378d0d5bf83eb0fbc42b936bf626007c4c5426e79465a99acb69b945b7a2b53e`. Quiz: 4 physical pages, `8e063a1f8746f6c28fc76fdca603a7d4de79c4d268b84a479793723ecf645240`. Official-caption VTT: `7844ccda40892781df58aecf026dd07aab49fe3d13b112ecead058121a899859`. |
| 7 | **Market Efficiency I: Laying the Groundwork**. [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session7.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz7.pdf), [video](https://www.youtube.com/watch?v=P-iCZBjbiH4). | Deck: 13 physical pages, `c82b39ca6242b05441a9c4f37ea0aee0ab768a57e09859b0d5271ffcc97e3518`. Quiz: 4 physical pages, `e34a849e195ee052abc8d4e5dce5471ba94e3ba7e550dd2784b3565832d3978e`. Official-caption VTT: `4b11b32494c9dbc9e1e0f6f23aa9fce38c5ad4130eaeba5ec0cfd3578c720cfc`. |
| 8 | **Market Efficiency II: Testing market beating schemes and strategies**. [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session8.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz8.pdf), [video](https://www.youtube.com/watch?v=I3v2yuvJ_Qs). | Deck: 17 physical pages, `1eac315c2a914021a9f3320e905b636c08ba717935969985569ecb0056aba037`. Quiz: 5 physical pages, `e8a8768d808743ccbd5b50e6a0843f722ca2efeefd68e8747bdf5393b11aae87`. Official-caption VTT: `73a0aa6b8b6eeff168eb0b9047c6f0ff1feaf0a33227fa11ca5fa110dc93b2a6`. |
| 6 | **Trading Costs and Taxes**. [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session6.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz6.pdf). The correct trading-cost narration is the [upload labelled Session 5](https://www.youtube.com/watch?v=bUJUGsDQ16w), 27:33, because the official Session 5 and 6 video contents are swapped. | Deck: 22 physical pages, `8b6c77fe4e6a17e6e3669f186d4e6cbd1ab594c1c3053e6493a9896e0e230f16`. Quiz: 4 physical pages, `8b86299f5cb040be025ae4ec8dbdf2472fcc2b468da233ed7b9086cf33a77cb0`. Official-caption VTT: `25d8a1750a310813f70afbaa79d95db0f27b9eadbcc8980e061562bafc587a9a`. |

Three supplemental-source records are relevant:

| Source | Lock status on 2026-08-12 | Role |
| --- | --- | --- |
| Morningstar Manager Research, **US Active/Passive Barometer: June 2026**, published 2026-08-06, data through 2026-06-30. [Versioned PDF](https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/bltae9a96dd886be51f/APB_US_MidYear_2026.pdf); [official landing page](https://www.morningstar.com/business/insights/research/active-passive-barometer). | **Locked.** 44 pages, 1,098,907 bytes, SHA-256 `927a98be89971c515edd31e171f7bd697cf4e2909c1e1b3bcb2df9c7d02d4cae`; canonical source-pipeline provenance status `ok`. High-decay empirical source. | Current active/passive base rates, survivorship, category and horizon variation, and fee-quintile association. |
| William F. Sharpe, **The Sharpe Ratio**, official Stanford author-hosted HTML reprint from *The Journal of Portfolio Management*, Fall 1994. [Canonical HTML](https://web.stanford.edu/~wfsharpe/art/sr/SR.htm). | **Locked.** 43,748 bytes, SHA-256 `51c9cc84bfc04b6e496bb3c79a4bd501ba45e5318d159f38c70c1e54d9bef39d`; canonical source-pipeline provenance status `ok`. Low-decay methodology source. | Correct differential-return definition, ex ante/ex post distinction, time dependence, and correlation limits of a one-number risk-adjusted measure. |
| S&P Dow Jones Indices, **U.S. Persistence Scorecard Year-End 2025**, published 2026-05-07, data through 2025-12-31. [Official article](https://www.spglobal.com/spdji/en/spiva/article/us-persistence-scorecard/); [versioned PDF](https://www.spglobal.com/spdji/en/documents/spiva/persistence-scorecard-year-end-2025.pdf). | **Not locked.** Its findings were reviewed for audit context, but direct local retrieval of the versioned PDF returns HTTP 403. No canonical cached artifact, SHA-256, extraction, or provenance record exists. | Candidate current persistence evidence only. It is not lesson-citable and remains an open source gate. |

## 2. Sources reviewed

For each of the five Damodaran sessions, the complete deck was rendered and visually
reviewed page by page. All visible prose, equations, charts, table labels, axes, notes, and
footnotes were read. The complete official-caption track was reviewed alongside the deck,
and the complete quiz and published solution were reconciled against both. The content swap
for Sessions 5 and 6 was resolved by matching narration to subject matter rather than to the
upload title.

The Morningstar PDF was reviewed in full. All 44 pages were inspected through original-page
renders and full-document contact sheets; pages 3, 4, 5, 9, 10, and 39-41 received additional
original-resolution review because they carry the scope, headline findings, category tables,
and methodology. The extracted artifact contains 14,807 words. Page 3 defines the universe
as nearly 9,226 U.S. open-end funds and ETFs representing about USD 29 trillion, or roughly
67% of the U.S. fund market, and states that the comparison uses actual net-of-fees,
investable passive peers. Pages 39-41 establish the eligible universe, handling of closures,
share-class consolidation, survivorship, returns, fees, and success-rate method.

Sharpe's complete official HTML article was reviewed, including the ex ante and ex post
definitions, differential-return framework, time dependence, correlation discussion,
scale-independence argument, portfolio-use cases, summary, and endnotes. It is used here to
correct the course's nonstandard shorthand, not to supply a current manager-performance
base rate.

The S&P DJI report's public official presentation and findings were reviewed for audit
context. Its official summary reports that persistence can look stronger over short windows
but is generally fleeting over longer windows, and it separates continued rank, category
movement, and fund merger/liquidation. Those observations are quarantined: the complete
versioned PDF could not be admitted to `.source-cache/`, so its exact report tables and
methodology cannot enter the citable coverage matrix. A browser review without canonical
cache provenance does not pass OPS Gate A.

The Damodaran and supplemental source artifacts are copyrighted working material in
`.source-cache/` and are intentionally uncommitted. Only this original audit belongs in the
repository.

## 3. Source-authentic content spine

The following is a source-content spine, not a learner sequence.

| Source-authentic proposition | Source basis | Required qualification |
| --- | --- | --- |
| Passive investing is the evidence-based default architecture when the learner cannot identify and validate a net edge. | Sessions 35-36; Morningstar June 2026. | A default is not a claim that active success is impossible. Damodaran explicitly discusses winners, luck, and possible pockets; Morningstar reports nonzero success rates that vary by category and horizon. |
| The relevant base rate is category-, horizon-, cost-, and survivorship-specific. | Morningstar pp. 3-7 and category results, especially pp. 9-10. | Do not collapse all active approaches into one universal percentage. Date every result to 2026-06-30. |
| Historical outperformance is not by itself proof of repeatable skill; persistence must be tested against a null and must account for closures and category movement. | Session 36 pp. 2-8; Session 7 pp. 6-7. | The Damodaran evidence is historical. Current S&P persistence evidence is still noncanonical and cannot yet be used to make a current lesson claim. |
| An edge requires a specific pocket of inefficiency, an investor or process able to recognize it, a correction mechanism, tradability, resources, profit after friction, and enough durability to remain exploitable. | Session 7 pp. 2-4 and 8-10. | Complexity, confidence, or a compelling story is not an edge. Market efficiency is investor- and market-specific, not a blanket binary. |
| An edge test must be fair before it can be impressive: define the claim, use an appropriate benchmark and risk model, reserve a holdout, avoid sampling and survivor bias, separate correlation from causation, and test economic as well as statistical significance. | Session 8 pp. 2-4 and 15-17. | A positive abnormal return is a joint result about the strategy, risk model, and estimated parameters. |
| Risk-adjusted comparison must use a defined differential return, and a historic ratio is not automatically a forecast. | Sharpe, “The Ratio,” “Time Dependence,” “Correlations,” and “Summary”; Session 8 pp. 2-4 as corrected. | The course's `average return / standard deviation` shorthand is not the standard excess- or differential-return Sharpe ratio. Correlation with the rest of the portfolio is omitted by the ratio and may change the decision. |
| Gross edge is not investable edge. Commission, spread, price impact, waiting, turnover, taxes, and implementation constraints reduce the return the investor keeps. | Session 6 pp. 2-17; Sessions 35-36. | Historical cost and tax magnitudes are not current forecasts. Mission 8's saved Friction Budget is an OPS estimate with its own boundary, not a measured fact. |
| Active failure can arise from cost, tax, excess activity, cash timing, style drift, herding, window dressing, incentives, and the investor's own behavioral errors. | Session 36 pp. 9-16; Session 7 pp. 11-13. | This is a failure-channel checklist, not proof that every active strategy fails for every reason. |

## 4. Slide and caption coverage matrix

Page references in the Damodaran columns are corrected physical deck pages, not the stale
pre-fix provenance counts. Caption times refer to the reviewed official-caption tracks.

| Definition or claim eligible for Mission 10 | Damodaran deck and caption support | Supplemental support | Prerequisites required before use | Gate disposition |
| --- | --- | --- | --- | --- |
| Passive is the default when an investor has not proved a usable edge; it is not a theorem that no one can win. | S35 p. 2, 00:23-01:03; pp. 5-12, 04:27-10:29. S36 p. 17, 14:47-15:31. | Morningstar pp. 3-5 and 9-10 supplies current, nonzero, category-specific success rates. | Active versus passive; benchmark; net return; average versus individual outcome. | Supported if written as a base-rate default and dated. |
| The current ten-year all-category result is that 25% of active strategies both survived and beat their passive counterparts through June 2026. | S35-36 supplies the historical question but not the current number. | Morningstar p. 4; success-rate denominator and closure method on pp. 39-41. | Survival; fund closure; horizon; category; passive peer. | Supported only with the full definition, date, and Morningstar limitations. |
| Cost and category change the base rate; cheap active funds had higher observed success, but this does not establish causation. | S35 categorization discussion, pp. 13-19; S36 cost channels, pp. 9-14, 07:21-11:52. | Morningstar p. 4: cheapest quintile 33% versus priciest quintile 20% over ten years. Pages 5 and 9-10 show large category dispersion. | Quintile; association versus causation; comparable category and horizon. | Supported as an association only. |
| U.S. large-blend selection had a particularly low ten-year base rate in this period. | S35 pp. 5-12, 04:27-10:29 gives historical active-fund context. | Morningstar pp. 9-10: 382 active funds at the ten-year start, 62.6% survival, 10.5% success; asset-weighted annual returns 13.9% active versus 15.2% passive. | Percentage-point difference; annualization; survivorship; category scope. | Supported and dated; do not generalize to all asset classes. |
| Apparent winners can arise from luck, so a streak is not enough. | S7 pp. 6-7, 05:15-08:20. | Sharpe warns that using historic ex post measures as unbiased ex ante forecasts is subject to serious question. | Random outcome; expected frequency; ex post versus ex ante. | Supported. |
| Under a no-continuity quartile null, each next-period quartile has probability 25%. | S36 pp. 2-3 within 00:22-07:21; quiz Q1. | None required. The null is arithmetic, not an empirical finding. | Quartile; transition probability; null hypothesis. | **Supported, and this is what Mission 10 teaches.** The null and the reasoning it supports are eligible; only a current empirical persistence *result* is out of scope (§11). |
| Current persistence evidence must distinguish short-horizon rank continuation from long-horizon persistence and attrition. | S36 pp. 2-8, 00:22-07:21. | S&P official report reviewed but canonical PDF/provenance unavailable. | Rank versus return; horizon; merger/liquidation; category movement; random baseline. | **Removed from Mission 10 scope by approved narrowing, 2026-08-14 (§11).** Still not lesson-citable; the mission no longer asserts it. |
| Market efficiency means price is an unbiased estimate for a specified market and investor group; it does not mean price is always correct. | S7 pp. 2-4, 00:23-03:32. | None needed for the stable definition. | Price versus value; unbiased error; investor-specific costs and access. | Supported. Avoid blanket “markets are efficient” language. |
| A defensible edge specifies an inefficiency and explains recognition, correction, tradability, resources, profit after cost, replication pressure, and durability. | S7 pp. 8-10, 08:39-11:40. | Morningstar supplies a current default base rate, not proof of a particular edge. | Mispricing; correction catalyst; liquidity; capacity; information and transaction cost. | Supported as an evidence architecture. |
| A fair test is model-aware and guards against anecdote, no holdout, biased samples, market/risk omission, correlation-causation error, data mining, survivorship, cost, and execution failure. | S8 pp. 2-4, 00:23-07:14; pp. 15-17, 23:49-29:28. | Sharpe supplies the correct differential-return method and its limits. | Benchmark; beta; standard deviation; statistical versus economic significance; holdout. | Supported after correcting S8's Sharpe and regression-label defects. |
| A strategy must clear required return and friction; gross outperformance can become negative alpha after both. | S8 quiz Q5; S6 pp. 2-3, 00:21-03:12. | Sharpe supports differential-return reasoning; Mission 8 supplies only an OPS learner estimate of friction. | CAPM inputs; alpha; pre-/post-cost return; percentage points. | Supported calculation; a saved OPS hurdle is provisional, not source fact. |
| Trading friction includes spread, price impact, and waiting as well as explicit commission; its size depends on liquidity, order size, urgency, strategy, and scale. | S6 p. 2, 00:21-02:27; pp. 5-17, 04:54-21:14. | None required for the stable mechanism. | Bid, ask, half-spread, liquidity, order size, opportunity cost. | Supported. Do not reuse dated magnitude tables as current estimates. |
| Active implementation can leak through costs, taxes, excess activity, cash timing, behavior, style drift, herding, window dressing, and incentives. | S36 pp. 9-16, 07:21-15:31; cost/activity detail pp. 9-14, 07:21-11:52. S35 p. 3, 01:03-02:37. | Morningstar's fee result is consistent but observational. | Turnover; tax drag; cash allocation; benchmark; behavior. | Supported as possible channels, not universal causal attribution. |

## 5. Assessment coverage and verified answers

No OPS assessment has been authored. The items below are source checks that could support a
future assessment only after the lesson itself introduces and practices every prerequisite.

| Source item or assessed idea | Verified answer | Eligibility and correction |
| --- | --- | --- |
| S35 quiz Q4, ten-year compounding of a USD 1,000,000 index alternative versus a fund with a 2% front load and a return one percentage point lower. | Index ending value USD 2,158,924.997; load-fund ending value USD 1,927,808.330; gap USD 231,116.667, rounded to **USD 231,117**. | Arithmetic is correct and can model cost compounding as a historical source scenario. The assumed 8%, 7%, and 2% are teaching inputs, not current forecasts. |
| S36 quiz Q1, next-quartile probabilities under no continuity. | **25%, 25%, 25%, 25%**. | Eligible after quartiles, conditional transition, and a null model are taught. It does not prove the actual transition process is random. |
| S8 quiz Q5, 11% gross strategy return, 1% annual trading cost, 9% market return, 3% risk-free rate, beta 1.2. | 10% after-cost return; 10.2% CAPM required return; **-0.2% alpha**; break-even beta **1.1667**. | Eligible after CAPM and percentage-point arithmetic are taught. Preserve the joint-test caveat. |
| S6 quiz Q2, 10% required after-cost return over two years with a 4% round-trip spread split equally at entry and exit. | Exact annual pre-cost return **12.24489796%**, not 12.22%. | The source uses `121 × 1.02` as an exit approximation. Exact sale value divides by `0.98`; any OPS item must use the exact method. |

The source quizzes are not reusable wholesale. Their defect and expiry ledger is:

| Source | Defect or expiry | Required treatment |
| --- | --- | --- |
| S35 | Q1 includes locality and concentration findings; Q2-Q3 and Q5 depend on dated performance literature. | Do not convert locality or concentration anecdotes into beginner advice. Current active/passive figures must come from Morningstar and retain category, period, and methodology. Keep only independently verified arithmetic or stable reasoning. |
| S36 | Q3 has three answer choices in the test but five in the solution. Q5 changes the question between test and solution. Q2's Morningstar-rating predictive-power claim is specific to an old ratings design and 2002-2005 study. | Replace Q3 and Q5 rather than repairing them silently. Do not assess a current ratings claim from Session 36. |
| S8 | Deck p. 14 reverses dependent and independent variable labels. The deck and Q2 call `average return / standard deviation` a Sharpe ratio, omit the risk-free or other benchmark return, and provide no unique answer under Sharpe's standard differential-return definition. | Correct the regression labels. Do not reuse Q2. Define the ratio from Sharpe's official methodology before assessing it. |
| S6 | Q1 option `f` changes from “lots of analysts” in the test to “few analysts” in the solution. Q4 replaces choices `c` and `d` between test and solution. Q2 is approximate rather than exact. Q5's tax premise is dated and jurisdiction-specific. | Replace Q1 and Q4. Correct Q2. Do not use Q5 without current jurisdiction-specific tax authority. |

## 6. Independent numerical and logical verification

**Session 35 compounding.** With the source's assumptions:

- Index: `1,000,000 × 1.08^10 = 2,158,924.997272...`, or USD 2,158,925.
- Load fund: `1,000,000 × 0.98 × 1.07^10 = 1,927,808.330144...`, or USD 1,927,808.
- Difference: `2,158,924.997273... - 1,927,808.330144... = 231,116.667129...`, or **USD 231,117**.

The result verifies the source answer. It demonstrates compounding under stipulated inputs;
it does not estimate the future gap between every active and passive fund.

**Session 36 null quartile.** Four mutually exclusive quartiles of equal probability give
`1 / 4 = 0.25`, so a fund's next-period probability under a no-continuity null is **25% in
each quartile**. Observed transition probabilities must be compared with this null; proximity
to 25% does not itself identify why persistence is weak.

**Session 8 CAPM and net alpha.** The after-cost strategy return is
`11% - 1% = 10%`. CAPM required return is
`3% + 1.2 × (9% - 3%) = 10.2%`. Therefore net alpha is
`10% - 10.2% = -0.2%`. For break-even after costs,
`3% + beta × (9% - 3%) = 10%`, so
`beta = (10% - 3%) / (9% - 3%) = 1.166666...`, or **1.1667**.

**Session 6 exact spread hurdle.** A USD 100 cash outlay buys USD 98 of shares after a 2%
entry half-spread. The investor needs USD 121 after selling to earn 10% annually for two
years. If exit proceeds lose 2%, the pre-exit value must be
`121 / 0.98 = 123.4693878...`, not `121 × 1.02 = 123.42`. The exact annual gross return is
`(123.4693878... / 98)^(1/2) - 1 = 0.1224489796...`, or **12.24489796%**.

**Session 8 Sharpe logic.** Q2 supplies each portfolio's standalone return and standard
deviation but no risk-free return and no distribution of benchmark-relative differential
returns. Under Sharpe's official definition, those inputs do not determine a unique standard
Sharpe comparison. The published `12/30` versus `10/20` solution evaluates a return-to-risk
ratio, not the standard excess- or differential-return Sharpe ratio.

**Morningstar arithmetic and inference.** For U.S. large blend, the asset-weighted
ten-year annual-return difference is `15.2% - 13.9% = 1.3 percentage points` in favor of
passive funds. The 10.5% success rate is not that return gap; it is the proportion of starting
active funds that both survived and cleared Morningstar's passive hurdle. Likewise, 33% for
the cheapest active quintile versus 20% for the priciest is an observed association, not a
causal estimate of the effect of lowering fees.

## 7. Discrepancies, ambiguities, and required corrections

| Issue | Finding | Required correction or gate effect |
| --- | --- | --- |
| Damodaran page-count provenance | Earlier session provenance reported 23/14/18/20/18 pages for Sessions 6/7/8/35/36 because the extractor counted a trailing form feed as a page. Physical review establishes 22/13/17/19/17. | Corrected on 2026-08-12: all 38 sessions were re-extracted with the fixed counter. Canonical provenance now matches the physical page counts and records each cached caption track's bytes and SHA-256. Artifact hashes are unchanged. |
| Session 5/6 video identity | The official uploads' titles and contents are swapped. `bUJUGsDQ16w`, labelled Session 5, contains Session 6 trading-cost narration. | Bind narration by reviewed content, not title. Do not cite the upload label as the session identity without the swap note. |
| Session 6 quiz | Q1 and Q4 choices change between test and solution; Q2 uses an exit approximation; Q5 relies on dated U.S. tax assumptions. | Replace changed items, use exact 12.24489796% arithmetic, and require current tax authority for any tax assessment. |
| Session 8 definitions | Deck p. 14 reverses dependent/independent labels. The deck and quiz omit the benchmark return from “Sharpe ratio.” | Correct both before use; Sharpe's official article controls the ratio definition. |
| Session 36 quiz and ratings | Q3 and Q5 change between test and solution. Morningstar-rating claims describe an older methodology and sample. | Replace the broken items and do not present the old ratings finding as current. |
| Historical Damodaran performance evidence | Sessions 35-36 report old samples, market periods, cost conditions, and fund-rating methods. S35 locality and concentrated-portfolio anecdotes do not establish a safe sizing rule. | Use these sessions for mechanisms and historical reasoning. Use Morningstar June 2026 for the current active/passive base rate. Do not recommend concentration from the anecdotes. |
| Morningstar passive-hurdle weighting | Page 40 first calls the hurdle the asset-weighted average passive-fund return, then describes ranking funds against the equal-weighted average of passive funds; pages 40-41 repeat the equal-weighted wording. | Until Morningstar clarifies, learner-facing copy may say only **“average investable passive peer.”** Do not assert which weighting defines success. |
| Morningstar scope and outcome definition | “Success” gives equal credit to slight and large outperformance, is not risk-adjusted or after-tax, and counts closures against success. The study covers U.S. public open-end funds and ETFs, not hedge funds, SMAs, or every individual manager. Morningstar also has commercial data, ratings, software, and investment-management roles disclosed in the report. | Carry scope and conflicts into source notes. Do not use the result as a universal probability of individual skill or portfolio suitability. Preserve category and horizon. |
| S&P persistence provenance | The current official report was reviewed, but its versioned PDF returns HTTP 403 to direct local fetch. There is no canonical file, hash, extraction, or provenance record. | **Open Gate A failure.** No report claim may enter lesson copy, an interaction, or an assessment until canonical cache/provenance and complete exact-artifact review succeed. Do not substitute a secondary summary. |
| Curriculum authority | The 13-mission curriculum and Workbench direction were approved on 2026-08-12. | Architecture authority is closed. Source remediation is still required and does not imply lesson release approval. |

## 8. Learner prerequisites revealed by the source

| Prerequisite | What must be established before the learner is asked to use it | Why the sources require it |
| --- | --- | --- |
| Active, passive, benchmark, and investable passive peer | Active management chooses or times holdings in pursuit of an advantage; passive implementation follows a defined exposure. A benchmark is the relevant comparison, and an investable peer includes real fund costs. | Sessions 35-36 and Morningstar otherwise invite a false “active always loses” binary. |
| Return, annualization, percentage points, and compounding | Distinguish a one-period return from an annualized multi-period return and compound multiplicatively. | S35 Q4 and Morningstar's horizon tables cannot be interpreted safely without this. |
| Gross, net-of-fees, after-cost, and after-tax return | Identify which deductions are already inside a reported return and which remain investor-specific. | Session 6, S8 Q5, and Morningstar use different return boundaries. |
| Category, universe, share class, survival, and closure | Define the starting universe; consolidate share classes at the fund level; keep closures in the denominator. | These are essential to Morningstar's success rate and to avoiding survivor bias. |
| Quartile and transition probability | A quartile is one of four rank groups; a transition probability is conditional on the starting group; 25% is the equal-probability one-period null. | Session 36's persistence table otherwise becomes an unexplained pattern-recognition task. |
| Mispricing, market efficiency, and correction mechanism | Efficiency is an unbiased-price condition for a specified market and investor; an inefficiency is an exploitable systematic deviation; a correction mechanism explains how price and value may converge. | Session 7 requires these concepts before asking whether an edge exists. |
| Required return, beta, CAPM, alpha, and model risk | Required return is the compensation implied by a selected risk model; beta is the CAPM exposure; alpha is actual minus model-required return; model choice and parameter error remain alternative explanations. | Session 8's joint-test logic and verified Q5 calculation depend on all five. |
| Standard deviation, differential return, and Sharpe ratio | Define the benchmark-relative return first; distinguish ex post description from ex ante forecast; state that the ratio omits correlation with other holdings. | Sharpe's method corrects Session 8's shorthand and prevents a one-number ranking from masquerading as a portfolio decision. |
| Statistical versus economic significance | Statistical significance addresses sampling evidence; economic significance asks whether the effect is large and feasible enough to matter after costs. | Session 8 explicitly requires both. |
| Holdout, sampling bias, survivorship bias, and causation | A holdout is not used to discover the rule; the sample must represent the investable universe at the decision date; failed entities remain; correlation does not establish a mechanism. | Session 8's cardinal and lesser sins are prerequisites to any evidence claim. |
| Spread, price impact, waiting cost, turnover, liquidity, and capacity | Show how each friction arises, who pays it, and how strategy speed, trade size, and scale change it. | Session 6 and Session 36 make net edge conditional on implementation. |
| Behavioral failure channels | Anchoring, story preference, overconfidence, herding, loss aversion, break-even risk seeking, and unwillingness to admit error can affect both observed markets and the learner. | Sessions 7 and 36 require behavior to be treated as a control problem, not merely an explanation of other investors. |
| Existing OPS artifacts | Mission 8's saved Friction Budget is a learner-chosen estimate; Mission 9's Evidence Test Checklist records test quality. Both must be read together. | A claim that fails either evidence quality or net-of-friction feasibility is not a defensible edge. Clearing a provisional hurdle is necessary, not sufficient. |

## 9. Boundaries for the OPS adaptation

| Boundary | Source-authentic material | What would be an OPS adaptation and must be labelled as such |
| --- | --- | --- |
| Organizing idea | The sources jointly support a passive base-rate default, a stringent test for exceptions, and a net-of-friction decision. | “Architecture before edge” and any decision workflow built around it are OPS synthesis, not Damodaran or Morningstar terminology. |
| Current base-rate evidence | Morningstar's dated category and horizon results, success definition, universe, and limitations. | Any simplified display, selected category comparison, explanatory analogy, or policy threshold is OPS pedagogy. It must not erase denominator, date, or scope. |
| Historical course evidence | Damodaran's mechanisms: active-investor record, luck, persistence question, market-efficiency conditions, test design, and friction channels. | Updated cases, current dollar values, current fee assumptions, and any learner-facing portfolio rule are OPS additions. Historical percentages cannot be relabelled as current. |
| Edge claim | Session 7 supplies the need for a specific exploitable pocket, correction, cost coverage, resources, replication, and durability. Session 8 supplies the evidence hazards. | A checklist, score, pass/fail threshold, named “edge license,” or interaction is OPS design and cannot claim source authorship. Complexity, effort, or confidence may not substitute for mechanism and evidence. |
| Risk adjustment | Sharpe supplies the differential-return definition and limitations; Session 8 supplies CAPM joint-test reasoning. | Choice of benchmark, risk-free series, lookback, sampling frequency, and any forecast are OPS analytical decisions that require explicit support. |
| Friction artifact | Session 6 establishes types and causal drivers of friction. | Mission 8's saved percentages are learner-selected OPS teaching assumptions, not sourced transaction-cost forecasts. Mission 10 may use the total only as a provisional hurdle and may not treat clearing it as sufficient proof. |
| Evidence artifact | Session 8 supports holdouts, bias controls, risk adjustment, feasibility, and economic significance. | Mission 9's saved checklist, labels, scoring, and persistence format are OPS pedagogy. Downstream use must preserve its documented limits. |
| Concentration and locality | S35 reports historical subgroup findings. | OPS must not infer that beginners should hold concentrated or local portfolios. Sizing requires separately approved sources and policy. |
| Fees | Morningstar observes higher success among cheaper active funds in this sample. | OPS may explain that a lower hurdle helps, but cannot claim this comparison alone proves fee causality or predicts a particular fund. |
| S&P persistence | The reviewed report is relevant in topic and period. | No S&P number, chart, paraphrase, interaction state, or answer may be lesson-cited until the canonical PDF has a successful cache and provenance record and the exact artifact is reconciled. |
| Advice and product selection | None of the locked sources selects a suitable product for a particular learner or supplies live market data. | OPS must not turn the audit into individualized advice, a fund recommendation, a live score, or a claim of guaranteed future performance. |

No interaction, narrative sequence, lesson copy, or assessment wording is approved by this
audit. Those belong to later gates only after Gate A closes and the curriculum is approved.

## 10. Audit conclusion as first written, 2026-08-12

**This section is preserved as the record of the prior blocked state. It was superseded on
2026-08-14 by §11; read both.**

Status: `Blocked - source`

The Damodaran edition and five-session source family are locked, completely reviewed, and
mapped at claim level. The Morningstar June 2026 active/passive base-rate report is locked,
fully reviewed, dated, hashed, and recorded by the canonical supplemental pipeline. Sharpe's
official methodology is likewise locked and corrects the course's nonstandard ratio
shorthand. Required calculations and quiz defects have been independently reconciled.

Gate A nevertheless remains open for one source-integrity reason:

1. The current S&P DJI persistence report is reviewed but not canonical. Its versioned PDF
   still returns HTTP 403 to the local pipeline, so it has no canonical cache, hash,
   extraction, or provenance. It cannot be lesson-cited, and current manager-persistence
   evidence therefore remains an open Mission 10 source requirement.
To close the source gate, the exact S&P PDF must be fetched through the canonical pipeline,
hashed, extracted, visually reviewed in full, and mapped against its methodology and tables;
secondary summaries are not an acceptable substitute. The Damodaran page-count and caption-
provenance defect is closed: all 38 records were regenerated on 2026-08-12. Curriculum
approval is also closed as of 2026-08-12, but neither fact clears Mission 10's remaining
source gate or silently grants lesson release approval.

No Mission 10 lesson plan or implementation should begin from this record while the status
remains `Blocked - source`.

---

## 11. Gate A closure, 2026-08-14

Status: **`Gate A closed` — by approved narrowing, not by source acquisition.**

The S&P DJI Persistence Scorecard was **never obtained.** Nothing in §10's factual account
changed. What changed is the mission's scope.

### Re-verification before the decision

The 2026-08-12 block was not inherited on trust. Re-probed 2026-08-14:

| Target | Result |
| --- | --- |
| Versioned PDF, default client | HTTP 403 |
| Official article page | HTTP 403 |
| Versioned PDF, honest descriptive user-agent | HTTP 403 |
| `spglobal.com/robots.txt` | HTTP 403 |

`robots.txt` returning 403 establishes a **host-level block on the entire domain**, not a
user-agent rule. `scripts/source/fetch-supplemental.mjs` sets no user-agent, so a UA was the
natural first hypothesis — the same fix `missions-10-13-forward-plan.md` proposes for the SEC
403s. It is not the cause here, and no honest configuration of the canonical pipeline will
retrieve this artifact from this environment. No attempt was made to defeat the block by
impersonating a browser; an artifact obtained that way would not be canonical provenance.

### The decision

`05-mission-10-architecture.md` provides for exactly this: *"obtain explicit approval for a
narrower source-backed claim set and document exactly which current persistence claim is
removed."* The human stakeholder approved that narrowing on 2026-08-14 (authority rank 1).

**Removed from Mission 10 scope — one claim:**

> Current persistence evidence must distinguish short-horizon rank continuation from
> long-horizon persistence and attrition.

No S&P DJI number, chart, table, paraphrase, interaction state, or assessment answer may
appear in Mission 10. Mission 10 makes **no claim about what current persistence data
shows.**

**Retained — everything else in §4, all already `Supported`:** the Morningstar June 2026
base rates with their date, denominator and survivorship handling; Session 36's
no-continuity quartile null; Session 7 on luck, streaks and the anatomy of an edge;
Session 8's fair-test design as corrected; Session 6's friction channels; Sharpe's
differential-return definition.

### Why this is a narrowing and not a hole

Session 36 and Session 7 carry the pedagogical argument in full: persistence is taught as a
**test** — the 25% null against which any streak is measured — rather than as a scoreboard.
What S&P would have added is a current empirical reinforcement of a conclusion the learner
already reaches by reasoning. The method transfers; a dated statistic expires.

### Binding constraint on the implementation

The removed claim must be **additive, never load-bearing**. No stage, gate, calculation, or
assessment answer may depend on a current persistence figure. If the artifact is obtained
later — a human can fetch it in a browser and place it in `.source-cache/supplemental/raw/`
for hashing and provenance — closing Gate A properly must add a citation, not force a
redesign. The audit's other requirements (full visual review, methodology and table
reconciliation) would still apply.

### What this does not authorise

Gate A only. Mission 10 must still pass its own learning-sequence, accessibility,
screen-budget and browser gates. Curriculum approval and this closure are not lesson release
approval; an implementation agent may return at most `Ready for review`.
