# Portfolio reconstruction — research source ledger

Research date: 7 October 2026, America/Phoenix. This supports a product/engineering proposal, not a new source-authentic course lesson or a released implementation. Every interaction, ranking rule, cash policy, illustrative number and UI sequence in the [proposal](../design/portfolio-reconstruction-2026-10-07.md) is an Investing Studio adaptation unless explicitly identified otherwise.

## Source lock and scope of review

| ID | Primary source / locked material | Review scope and use |
| --- | --- | --- |
| V1 | Vanguard, [A framework for considering cash in your portfolio](https://investor.vanguard.com/investor-resources-education/article/a-framework-for-considering-cash-in-your-portfolio), 25 April 2024 | Read framework, both hypothetical cases, diagram's accessible description and limitations. Supports goal/horizon/funding/risk inputs; supplies no universal cash percentage. |
| V2 | Vanguard, [Four principles for investment success](https://corporate.vanguard.com/content/corporatesite/us/en/corp/about-our-funds/how-we-invest/principles-for-investing-success.html), public page inspected 7 October | Goals, balance, cost and discipline inform the lifecycle. No proprietary Vanguard model is replicated or represented as public software. |
| J1 | J.P. Morgan Asset Management, [2026 Long-Term Capital Market Assumptions](https://am.jpmorgan.com/us/en/asset-management/adv/insights/portfolio-insights/ltcma/), 30th annual edition, page copyright 2025 | Read horizon, matrices description, passive/asset-class boundaries and distribution/model limitations. The 10–15-year assumptions are methodological context, not licensed application data or stock forecasts. Full report/matrices not audited. |
| G1 | Guangliang He and Robert Litterman, Goldman Sachs Quantitative Resources Group, [The Intuition Behind Black–Litterman Model Portfolios](https://people.duke.edu/~charvey/Teaching/BA453_2002/GS_The_intuition_behind.pdf), December 1999, copyright Goldman Sachs | Original publisher document hosted by Duke. Confirmed title/date/authors. Read executive/technical passages and appendices; inspected cover and imposed-layout figures. The 20-page file is a print-imposition version with repeated/rotated logical pages, not the later 27-page SSRN upload. Supports prior/views/uncertainty; unconstrained examples do not establish long-only product suitability. |
| G2 | Goldman Sachs, [official Black–Litterman history](https://www.goldmansachs.com/our-firm/history/moments/1990-black-litterman-model), public page inspected 7 October | Confirms model origin at Goldman; not a computational implementation reference. |
| M2 | MOSEK [Portfolio Optimization Cookbook 1.6.0, chapter 2](https://docs.mosek.com/portfolio-cookbook/markowitz.html) | Reviewed mean–variance formulations, frontier, budget/holding/group/long-only/turnover constraints and matrix conditions. Formulation reference independent of solver procurement. |
| M4 | MOSEK [Portfolio Optimization Cookbook 1.6.0, chapter 4](https://docs.mosek.com/portfolio-cookbook/estimationerror.html) | Reviewed mean-estimation instability, Black–Litterman equations and covariance shrinkage. Supports explicit estimation before optimization, not guarantees of stable forecasts. |
| M8 | MOSEK [Portfolio Optimization Cookbook 1.6.0, chapter 8](https://docs.mosek.com/portfolio-cookbook/riskmeasures.html) | Reviewed scenario loss, tail-risk formulation and limitations of variance. Implementation review must preserve the discrete tail-mass convention. |
| M9 | MOSEK [Portfolio Optimization Cookbook 1.6.0, chapter 9](https://docs.mosek.com/portfolio-cookbook/risk_parity.html) | Reviewed Euler risk contributions and risk-budget formulations, including restrictions on extra constraints. Supports exact versus approximate constrained risk-balancing distinction. |
| MS | MOSEK [Modeling Cookbook 3.4.0, section 3.3.4](https://docs.mosek.com/modeling-cookbook/cqo.html) | Positive-excess-return Sharpe transformation; do not apply it blindly to nonpositive-return or zero-risk cases. |
| LW | [scikit-learn LedoitWolf implementation documentation](https://scikit-learn.org/stable/modules/generated/sklearn.covariance.LedoitWolf.html), page identifies documentation 1.9.1 | Reviewed learned intensity, centering and scaled-identity target; cites Ledoit–Wolf's 2004 Journal of Multivariate Analysis paper. This fixes the estimator variant; no implementation package installed or version adopted this turn. |
| H1 | Marcos López de Prado, [author's software index](https://www.quantresearch.org/Software.htm), HRP entry version 20151227; [HRP reference source](https://www.quantresearch.org/HRP.py.txt) and [Monte Carlo source](https://www.quantresearch.org/HRP_MC.py.txt) | Read algorithm/reference experiment as source text; did not execute it. Author index links the 2016 paper. Original code's stated commercial-use conditions require review before product reuse. No universal outperformance claim is adopted. |
| H2 | [PyPortfolioOpt official other-optimizers documentation](https://pyportfolioopt.readthedocs.io/en/latest/OtherOptimizers.html), page identifies 1.5.4 | Read HRP API, clustering, permission statement and implementation limitations. Useful reference implementation; native arbitrary hard constraints are not claimed. Version pin/license/deployment decision remains an implementation gate. |
| R1 | Rockafellar and Uryasev, [Optimization of Conditional Value-at-Risk](https://sites.math.washington.edu/~rtr/papers/rtr179-CVaR1.pdf), author-hosted manuscript dated 5 September 1999, 26 pages | Read sections 1–3's definitions and scenario linear-program formulation, relevant numerical/hedging examples and appendix material; rendered all pages for inspection. Original continuous-density definition is qualified; discrete implementation follows the finite-scenario objective with probability mass handled correctly. Do not relabel this file as the later 2000 published layout. |
| E1 | [CVXPY official documentation](https://www.cvxpy.org/) and [solver guide](https://www.cvxpy.org/tutorial/solvers/index.html); [HiGHS official site](https://highs.dev/) | Establish maintained modeling/solver candidates. Performance/runtime and actual dependency versions are untested in this proposal. |
| D1 | [Alpha Vantage official API documentation](https://www.alphavantage.co/documentation/) | Confirmed historical/adjusted-price and corporate-action endpoint families as one data-feed candidate. No entitlement, display/redistribution agreement, production completeness or accuracy was verified. |

### Sources deliberately not promoted to authority

The Vanguard portfolio-construction framework PDF URL appeared in search, but a direct fetch produced a 404 HTML page under a PDF extension. The downloaded response failed `%PDF-` validation; it is not a reviewed PDF. Use V1/V2's verified content for this proposal.

Ledoit–Wolf's author-hosted Honey PDF and Roncalli's ERC PDF were discovered but timed out or failed TLS retrieval. No claim of complete paper review is made. LW's official implementation documentation and M9's mathematical formulations supply the specific contracts proposed here. Constant-correlation shrinkage is a different variant and is not silently substituted.

Searches of Jane Street's public material did not locate a directly applicable, reproducible personal portfolio-construction method in this research. This is not a claim that none exists. No Jane Street allocation or proprietary strategy is inferred from its reputation, careers material or public holdings.

No institution endorses the proposed product. Research PDFs, proprietary forecasts and author code are not automatically redistributable assets. Primary-source reading does not establish permission to bundle datasets or copy source code.

## Source-to-product coverage

| Proposed function | Support | Learner prerequisites / original specification |
| --- | --- | --- |
| Goal, date, cash needs and loss inputs | V1, V2; existing goals/limits audit | Define goal money and dates. Exact reserve calculation and willingness/capacity collection are product rules to audit. |
| Explicit estimate set and source window | J1, M4, LW | Explain historical observation versus expected return; source/period/currency precede results. |
| Constrained frontier / computed percentages | M2, MS | Define allocation, return and volatility with a two-asset model; no initial holdings target input. |
| Optional views and uncertainty | G1, M4 | Introduce prior, investment view and uncertainty with an example; do not assume familiarity with Bayesian vocabulary. |
| Risk bars and exact versus approximate ERC | M9 | Define each holding's contribution, then compare capital and risk. Approximation criteria and constraints are product adaptations. |
| Clustering / HRP / disclosed projection | H1, H2 | Explain related investments moving together. Constrained projection is separately named and independently tested. |
| Tail-loss calculation and scenario probabilities | R1, M8 | Define loss sign, time horizon, worst-tail mass and scenario assumptions before decisions. |
| Costs, buying and later review | V2, M2; existing OPS arithmetic/audits | Explain target versus actual holdings, dated quotes, fees and rounding. Full implementation worksheet needs additional instrument-specific audit. |
| Goal selection, simulation and blend policy | Original Investing Studio specification informed by these sources and F8–F10 | Default ranking, path model, selection thresholds and blend metrics need independent review; no source supplies the complete product. |

## Independent numerical checks this turn

Using invented, transparent inputs and analytic formulas, recomputed two-asset minimum variance (80/20), equal-risk contribution (2/3, 1/3), positive-excess-return maximum Sharpe (16/23, 7/23), volatilities and whole-portfolio scaling with 20% fixed cash. Also checked a discrete expected-shortfall example with partial mass at the threshold. Evidence: `tmp/portfolio-reconstruction-research-2026-10-07/independent-math.json`.

These establish the examples in the proposal. They do not validate a new solver, a live data pack or the unimplemented replacement. The October 7 Claude P1 reproductions must become regression cases in implementation.

## Preserved source evidence and remaining gates

Private staging directory: `tmp/portfolio-reconstruction-research-2026-10-07/`. It contains extracted source text, rendered original pages, download manifest and analytic results. Do not ship those research PDF copies as product assets.

- G1 SHA256: `93f07c32854730017be1304fb7a5a2b5f75fbbc3d9ee48bf33cf3f85fc654d67`.
- R1 SHA256: `34aff2161733085ca8e5a067053a8f144cba52f556e253d69c932f7d22d842f4`.

Before implementation/release: complete the method-specific equation/reference review, curated-data entitlement/coverage review, production runtime/solver benchmark and independent numerical cases. Any new course lesson requires its own complete source/teaching coverage and assessments; this research ledger does not override the repository's deck/caption/source-integrity requirements. New UI requires a fresh learner journey, wording/accessibility audit and six-width visual audit.

Audit conclusion: authentic primary sources support this reconstruction proposal and its stated mathematical distinctions. Production data, code correctness, new teaching content and release readiness are explicitly unverified. The plan preserves the full requested completion boundary rather than presenting the October partial optimizer as completion.
