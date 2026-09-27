# Studio: valuation and defensible portfolio weights

Research date: 2026-09-20. Status: proposed product framework, with repository inspection and targeted primary-source research complete. This is not a released model specification or a completed lesson source audit.

Implementation update: the first valuation workspace now saves stable-growth scenarios, assumptions, source snapshots and dated price comparisons. Portfolio → Return history supplies exact-class SEC fund total returns and validated local monthly imports. The inventory below records the starting point for this proposal; see `docs/source-audits/studio-total-returns-and-valuation-workspace.md` for the implemented methods and verification. Expanded valuation models and portfolio optimization remain proposed work.

## Finding

Studio has an existing roadmap for valuation, return/risk estimation, portfolio construction, and robustness testing. The implemented workspace currently stops short of connecting those decisions. Manual weight entry cannot explain why a holding deserves 3% rather than 10%.

The proposed foundation is an OPS synthesis of named public investment-firm sources. It must not be labeled Morgan Stanley's proprietary process, an institutional certification, or a guarantee of an optimal real-world allocation. Defensibility means traceable evidence, explicit assumptions and objectives, reproducible calculations, visible constraints, and tests of how the decision changes when the assumptions change.

## What exists, verified in the current checkout

| Capability | Current evidence | Remaining work |
| --- | --- | --- |
| Goals and limits | `lib/studio-project/schema.ts`: purpose, horizon, budget, cash reserve, contributions, account type, loss tolerance, and free-text constraints | A numerical goal amount and dated spending needs; distinguish willingness to accept losses from ability to fund obligations after losses; structured allocation constraints |
| Industry and company research | Industry, investigation, filing-reader and peer-comparison surfaces | Connect the evidence to dated forward assumptions without interpreting a peer ranking as an expected return |
| Limited valuation | `components/studio/WorthView.tsx`, reached through the annual-report reader's **What a price assumes** tab; arithmetic in `lib/studio-project/valuation.ts` | A discoverable valuation workspace, saved scenarios, suitable models for supported businesses, and a return-assumption handoff |
| Existing valuation boundary | A single stable-growth model, reverse implied growth, sensitivity grid, and enterprise-to-equity bridge; source conventions in `docs/source-audits/studio-quantitative-methods.md` section 3 | Multi-stage forecasts and terminal assumptions need additional source review. Loss-making and financial companies are not supported by this model. Inputs currently live in component state rather than saved valuation records |
| Manual allocation | `BuildStage` in `components/studio/stages.tsx`; Portfolio tab **How much goes where** | Explain and compare candidate weights under an explicit objective and constraints |
| Basic risk review | User-defined asset-class shocks, fees, and overlap checks in the current Studio calculation path | Estimated covariance, risk contributions, issuer/sector exposure coverage, and joint adverse scenarios |
| Reusable lesson mathematics | `lib/risk-return.ts` and `lib/portfolio-theory.ts` | The latter's analytical optimization calls a three-by-three inverse. It is not a general constrained solver for Studio's arbitrary holdings |
| Advanced roadmap | `docs/agent-prompts/studio-research-workspace-handoff.md`, F4 and F7-F9, milestones M6-M7 | Versioned estimate sets, validated solvers, saved comparisons, and reproducible simulation are still required |

The roadmap already names mean-variance, hierarchical risk parity, equal risk contribution, conditional value-at-risk, covariance shrinkage, and Black-Litterman. Naming these methods is not an audited specification or proof that they improve a learner's portfolio. The historical student-team strategy recorded in `docs/source-audits/studio-research-coverage.md` is an example, not investment-firm authority. Its optimizer blend percentages are not OPS defaults.

## Primary-source foundations and attribution limits

All links below were opened on 2026-09-20. These are published articles and methodology pages, not course sessions; no session number or video is assigned to them.

| ID | Source and edition | Supported principle and review scope |
| --- | --- | --- |
| S1 | Morgan Stanley Wealth Management, Dan Hunt, [Why Having a Goal Is Key to Investing](https://www.morganstanley.com/articles/investing-goals-achieving-your-objectives), February 11, 2026 | Goals, available resources, time horizon and risk inform the broad asset mix; review progress over time. Relevant article text reviewed. It does not provide a universal household stock allocation or a security-sizing formula |
| S2 | Morgan Stanley Counterpoint Global, Michael J. Mauboussin and Dan Callahan, [The Math of Value and Growth](https://www.morganstanley.com/im/en-us/individual-investor/insights/articles/the-math-of-value-and-growth.html), June 9, 2020 | Growth, incremental return on capital and discount rates drive valuation; competitive advantage can fade. Official article summary reviewed. Full paper and numerical methods require a separate audit before extending the valuation engine |
| S3 | Morgan Stanley Counterpoint Global, Mauboussin and Callahan, [BIN There, Done That: How to Reduce the Sources of Forecasting Error](https://www.morganstanley.com/im/publication/insights/articles/article_bintheredonethat_us.pdf), cover date March 19, 2020; retrieved PDF has 2026 copyright footer | Pages 6 and 8 distinguish investment selection from sizing and describe construction through inputs, constraints and objectives. Inputs include expected returns, volatility and correlations; constraints include position/industry/sector limits, volume and leverage. Relevant extracted text and footnote 43 reviewed. PDF screenshot retrieval failed, so this is not a complete visual audit |
| S4 | BlackRock Investment Institute, [Capital market assumptions](https://www.blackrock.com/us/financial-professionals/insights/capital-market-assumptions), August 2026 display, underlying data June 30, 2026 | Methodology sections on uncertainty, optimization and the stochastic engine explicitly distinguish uncertain return estimates from variability around them. They describe robust construction using alternative paths and investor constraints. Methodology text reviewed; no proprietary engine, numerical forecast dataset, or recommended allocation reproduced |

These sources support the architecture. Specific OPS formulas, estimator choices, thresholds, defaults and interface behavior below are proposals. Each needs its own method specification and numerical validation before release. The existing Morgan Stanley *Measuring the Moat* research supports the industry/company investigation stage; its coverage is recorded separately in the repository and was not re-audited here.

## Proposed decision sequence

**Goals and limits → broad asset mix → industry research → company research → valuation → return and risk assumptions → portfolio weights → stress tests → buying and review.**

The broad asset mix determines how much of the portfolio can be committed to stocks, bonds and available cash. Industry-first research is a useful path inside the stock allocation. It should not silently turn every investor's goal into an all-stock portfolio. Broad-fund users should retain a complete path without having to value each underlying company.

Navigation remains freely accessible, consistent with the existing workspace design. Dependencies govern which calculations have enough evidence to run, rather than locking research behind a wizard.

| Decision | Required output | Foundation and OPS adaptation |
| --- | --- | --- |
| Goals and broad mix | Dated cash needs, investable amount, long-term asset-class targets/ranges, benchmark and loss limits | S1 supports the order. The exact structured fields, ranges and feasibility calculation are OPS design |
| Industry and company research | Evidence, economic drivers, competing explanations, and a reason to investigate or reject | Existing research surfaces; avoid converting research scores directly into portfolio percentages |
| Valuation | Saved downside/base/upside assumptions, estimated value range, price/date, sensitivity and the expectations embedded in price | S2 supplies driver relationships; scenario layout and model selection are OPS design |
| Return and risk assumptions | A common investment horizon, return basis, dated estimates and uncertainty; consistent risk inputs | S3 identifies required inputs. S4 supports explicitly treating estimation uncertainty. Exact estimators remain to be specified |
| Portfolio weights | Comparable candidate allocations with cash, position and exposure limits, costs, and explanations of binding constraints | S3 supports constraints and objectives; comparator choices and interface are OPS design |
| Stress and review | Joint adverse scenarios, goal shortfalls, assumption sensitivity, saved selection and reasons | S1 and S4 support review and uncertainty-aware construction; stress magnitudes and acceptance thresholds are OPS/user choices |

## The valuation-to-return bridge must be explicit

A present-value estimate and a dated future selling-price estimate answer different questions. A current estimated value above the market price does not specify when a price gap closes or what return the investor earns.

For a simple, explicitly one-year scenario with an end-year price `P1`, dividends `D1` received at year end, and purchase price `P0`, before costs and taxes:

`R = (P1 + D1 - P0) / P0`.

Store those assumptions and the year, rather than relabeling a valuation discount as expected return. If scenarios have probabilities, record their source or the user's judgment and require them to sum to one. Without probabilities, display a range rather than manufacture an expectation. Multi-year cash flows require defined timing and reinvestment conventions; a scenario's compound annual growth rate is not automatically the arithmetic expected return a mean-variance optimizer needs.

Valuation must also preserve financial-period and currency alignment, normalized earnings versus a reported unusual year, reinvestment, debt and other claims, excess cash, share count, and depositary-receipt conversion where applicable. Explain model exclusions. Funds and individual bonds need instrument-appropriate return models, including fees, distributions, maturity, default/reinvestment assumptions where relevant, and currency exposure.

## Two visible additions to Studio

### Valuation

Make valuation a first-class workspace destination linked to each company investigation. Explain it on entry as estimating what an investment is worth under stated assumptions.

The learner selects a supported model, checks sourced inputs, changes a small set of business assumptions, and sees the value range and sensitivity change immediately. The existing reverse-price tool remains available as a limited model. Save every scenario independently of whether the company is selected for a portfolio.

The visual focus should be a linked business-driver/value chart and sensitivity view. Source details and calculation steps belong beside the work or in disclosures. New terms are defined before use and followed by a numerical example.

### Portfolio weights

Use **Portfolio weights** as the plain-language destination, with **Compare allocations** as its principal action. Introduce optimization in place as finding weights that best meet a stated mathematical objective while respecting limits.

Within this workspace provide assumptions, comparison, and stress-test views. Show current/manual weights and an understandable reference alongside a validated constrained model. An equal-weight reference applies within the selected investment slice; it must not silently equal-weight cash, bonds and stocks across an approved asset mix. If a reference violates a limit, show the violation or name the documented adjustment.

The main comparison should connect money weights, contributions to modeled risk, overlap/exposures, goal outcomes, and costs. Selecting a holding should explain what limits its weight and how the result changes when its assumptions change. Risk contributions can be negative for hedging exposures; they must not be forced into a positive-only pie chart.

Respect the screen budget at all six repository widths. A dedicated workspace is needed; extending the current single weight table into a long page would not solve the decision flow.

## First quantitative method and later comparisons

Proposed initial optimized comparison: constrained minimum variance at several feasible expected-return targets. This is a member of the existing roadmap's mean-variance family, not a claim to reproduce a firm's optimizer. It exposes the tradeoff between modeled return and volatility without requiring a beginner to invent a mathematical risk-aversion coefficient.

Before implementation, specify and audit the objective, common return frequency, covariance estimator, cash treatment, cost treatment, numerical solver/tolerance, and complete constraint representation. Return targets are model assumptions, not promises. A required return that cannot be reached within the user's limits must produce an infeasibility explanation and meaningful alternatives such as a later goal or larger contribution.

Constraints should be machine-readable and attached to their reason: long-only/unlevered scope, available cash, asset-class ranges, issuer/position/sector caps, dated cash needs, and a defined turnover or trading-cost budget. Measure direct and fund-held exposure together where coverage exists; show coverage gaps.

Add the roadmap's equal-risk-contribution, hierarchical-risk-parity, and conditional-value-at-risk comparisons only with individually audited objectives and limitations. Risk-based methods do not necessarily use valuation views, so show what inputs each method actually uses. Conditional value-at-risk requires a specified loss distribution/scenario set and tail convention. Black-Litterman is an advanced return-estimation method, not a substitute for deciding the investment goal and constraints. Any future blend must recalculate portfolio risk from combined weights.

## Worked explanation of a weight limit

**Original OPS hypothetical example; these numbers are not firm recommendations.** All weights and loss contributions below refer to the entire portfolio, including reserved cash.

The learner sets a 1.5% whole-portfolio loss budget for a single company under a specified adverse scenario. The company's price falls 30% in that scenario, with no offsetting distribution. Its weight must satisfy:

`weight × 30% ≤ 1.5%`, so `weight ≤ 5%`.

At an 8% weight its direct loss contribution is 2.4% of the portfolio; at 5% it is 1.5%. For a $100,000 portfolio these are $2,400 and $1,500. Other positions can lose at the same time. Existing exposure through funds, sector limits, total-portfolio stress results, or uncertain valuation could justify a lower allocation.

This computes a scenario-dependent ceiling, not the weight to choose and not a guaranteed maximum loss. A worse company outcome breaches that scenario budget. Studio must still compare portfolio alternatives and obtain the learner's reasoned selection.

The existing schema stores weights as a percentage of money left after the reserve. If $20,000 of the $100,000 is reserved, a $5,000 position is 6.25% of the $80,000 investable amount and 5% of the whole portfolio. The interface and solver must preserve that distinction.

## Data and release requirements

The project already has N-PORT-derived dated price observations. `docs/source-audits/studio-price-snapshot.md` reports 18 dates spanning January 2025 to June 2026. `periodReturns` in `lib/studio-project/prices.ts` preserves unequal date gaps and explicitly excludes dividends. This is not a general, aligned, corporate-action-adjusted total-return dataset for the supported holdings.

Before a personal portfolio can use an estimated risk matrix, resolve permitted data access, distribution and split adjustments, listing/currency identity, date alignment, history sufficiency, missing observations, stale marks and the treatment of individual bonds. Do not interpret one-, five- and ten-year fund performance summaries as synchronized return observations. A demonstration can use an explicitly synthetic or properly sourced curated dataset, with its status visible; arbitrary selected holdings must not be quietly omitted or replaced by proxies.

Every model run should preserve input/source snapshots, valuation revisions, estimate-method version, constraints, solver status, computed outputs, and the user's final choice/reason. Changed source facts or prices mark dependent results for review. They must not silently replace selected weights.

Proposed implementation order:

1. Make existing valuation discoverable and persistent; design the source coverage matrix for expanded models and return assumptions.
2. Add structured goal, broad-mix and position/exposure constraints and explain their units.
3. Resolve the return-data contract and independently verify estimates and a general constrained solver.
4. Add comparable allocations, binding-limit explanations, joint stress tests, and assumption sensitivity.
5. Complete the additional advanced comparisons and simulation required by the broader roadmap.

Acceptance examples include a cheap company receiving a small weight because of shared exposure; a holding shrinking when an adverse scenario worsens; infeasible limits producing no false solution; missing data remaining visible; and a changed assumption flagging only dependent records. Verify calculations against independent reference cases, then run functional, fresh-learner, terminology, accessibility, six-width visual, and regression gates for any product changes.

This research change adds only this document. No application UI or calculation behavior was changed, and application tests were not rerun for this documentation-only work. The hypothetical sizing and reserve-conversion arithmetic was checked independently with direct PowerShell calculations.
