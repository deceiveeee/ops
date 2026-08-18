# Mission 5 source audit: Allocation and loss-budget policy

Audit date: 2026-08-12  
Status: **Gate A passed for the bounded Mission 1 Readiness Runway dependency and the
Mission 5 Allocation Studio specified in
`docs/lesson-plans/mission-05-allocation.md`, subject to the quarantines in Sections 7 and
9.**  
Gate A decision: **passed**. The current implementation decision is owned by
`docs/release-evidence/mission-05-allocation.md`; as of 2026-08-13 it is
`Blocked - implementation` while final browser and production-build evidence remains open.

This audit closes the mission-level source prerequisite. It does not make an allocation a
recommendation, turn an illustrative stress into a forecast, approve exact products, or
certify the implementation.

## 1. Edition and session lock

The controlling Damodaran source is Aswath Damodaran's official 38-webcast *Investment
Philosophies* sequence, companion to the second edition (Wiley, 2012):
<https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm>.

The mission uses these exact deck-number sessions:

| Session | Locked title | Mission role | Official artifacts |
| ---: | --- | --- | --- |
| 1 | *Introduction* | Investor first; allocation precedes selection; risk preference, horizon, cash need, and tax context shape fit. | [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session1.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz1.pdf), official video `CKuAStbkjuA` |
| 2 | *Understanding Risk I: The risk in bonds* | Interest-rate and default risk keep the stability sleeve from being labelled safe or guaranteed. | [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session2.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz2.pdf), content-matched mirror `8E6b60eN2Mc` |
| 3 | *Understanding Risk II: The risk in stocks* | Price/cash-flow, total/downside, and stand-alone/portfolio risk; diversification and model uncertainty. | [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session3.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz3.pdf), official video `Hqol9Fc0PLU` |
| 30 | *Market Timing: Setting the table* | Strategic allocation is the baseline from which any later timing tilt departs; missing markets, trading cost, and tax make opportunistic switching consequential. | [Deck](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session30.pdf), [quiz and solutions](https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz30.pdf), official video `2wYJJ_bw1QM` |

The official index currently points Session 2 to the class-overview upload. The locked
content-matched mirror is the same one reconciled in
`docs/source-audits/damodaran-investment-philosophies-session-2.md`. No newer, differently
numbered course session is substituted.

Supplemental authority is limited to the exact cached artifacts listed below:

- SEC Office of Investor Education and Advocacy, [*Investor Preparedness
  Checklist*](https://www.investor.gov/introduction-investing/general-resources/investor-preparedness-checklist), US, low decay;
- Consumer Financial Protection Bureau, [*An essential guide to building an emergency
  fund*](https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/),
  US, low decay, page last modified 2025-10-29;
- SEC Office of Investor Education and Advocacy, [*Gauge Your Risk
  Tolerance*](https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/gauge-your-risk-tolerance),
  US, low decay;
- SEC Office of Investor Education and Advocacy, [*Beginners' Guide to Asset Allocation,
  Diversification, and
  Rebalancing*](https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset),
  US, low decay;
- The Vanguard Group, [*Vanguard's Principles for Investing
  Success*](https://corporate.vanguard.com/content/dam/corp/research/pdf/vanguards_principles_for_investing_success.pdf),
  2023 edition, 32 pages, medium decay.

The built Finance Foundations bridge is locked to the existing OPS routes and their stated
MIT OpenCourseWare 15.401 provenance: `portfolio-risk-covariance-correlation`,
`portfolio-diversification-many-assets`, `portfolio-efficient-frontier`,
`portfolio-risk-free-tangency-sharpe`, `capm-tangency-becomes-market-portfolio`, and
`required-return-to-discount-rate`. Mission 5 may reuse only the five high-level mental
models mapped in Section 4. It may not copy the historical GM/Motorola dataset, reproduce
the optimizer, or introduce a new MIT-derived equation or number under this audit.

## 2. Sources reviewed

All four Damodaran decks, caption tracks, quizzes, and solutions were reviewed completely,
not only at the excerpts Mission 5 uses. The four contact sheets were inspected at original
detail. The Vanguard PDF was rendered to 32 page images; all text, figures, notes, glossary,
references, appendix, and disclaimers were read. The four regulator pages were reviewed
from their complete cached HTML-to-text artifacts. Existing detailed Session 2 and Session
3 audits were reconciled rather than silently overridden.

Complete-review ledger:

| Source | Complete coverage checked |
| --- | --- |
| S1 | Slides 1-10; captions 00:00:00-00:13:38; quiz items 1-4 and every solution/explanation on pages 1-3. |
| S2 | Slides 1-13, including both price/duration tables and rating/default-spread tables; captions 00:00:00-00:16:00; quiz items 1-4, computational bonuses, and every solution/explanation on pages 1-3. |
| S3 | Slides 1-18, including the regression image, beta-fundamentals diagram, alternative-model taxonomy, equations, and source defects; captions 00:00:00-00:27:45; quiz items 1-5 and every solution/explanation on pages 1-4. |
| S30 | Slides 1-6, including the process diagram, attribution claims, timing-payoff history, timing-cost claims, and approach list; captions 00:00:00-00:09:33; quiz items 1-5 and every solution/explanation on pages 1-3. |
| Investor.gov and CFPB | Full cached pages, including government/provenance framing, definitions, examples, limitations, related-product language, and the CFPB page date. Navigation and promotional modules were not treated as finance claims. |
| Vanguard principles | Pages 1-32: risk notice, contents, Goals pp. 4-7, Balance pp. 8-13, Cost pp. 14-17, Discipline pp. 18-25, conclusion p. 26, glossary pp. 27-29, references p. 30, DMS appendix p. 31, and provider/disclaimer page 32. |

| Artifact | Review and canonical provenance |
| --- | --- |
| S1 deck | 10 pages, 461,586 bytes, SHA-256 `7d54c42c2904fd454757521ad7d0e94f7b6cf7102af7d2c78a6c4a0ada44b27e` |
| S1 quiz/solutions | 3 pages, 62,092 bytes, SHA-256 `5161c2366c62912582a1876f872658999c0a067de9f2c6c128669fc03ff14df9` |
| S1 captions | 835 cues, 2,970 words, reviewed 00:00:00-00:13:38, SHA-256 `56d10e4686fffcf8d19d9421baac968fbb741dde21d71e594d4baa0a77f2bc02` |
| S2 deck | 13 pages, 732,276 bytes, SHA-256 `8cf39cd04356c7d93a08040171a43cd123212933813d3918ecd13b2810a6c3ca` |
| S2 quiz/solutions | 3 pages, 71,370 bytes, SHA-256 `137a3cd5829f9732afdb8124c5e98c38b35271086c6e1fb7f5cf386c9f472c93` |
| S2 captions | 929 cues, 3,467 words, reviewed 00:00:00-00:16:00, SHA-256 `95c48ae488e4d1d52db475f038e7afa6bd654484d10f840ae468db847b5c5f83` |
| S3 deck | 18 pages, 548,651 bytes, SHA-256 `da4f24014b9c1d6b86d7655e68d2445b37898cdb05a02c301f98d58340ecaba3` |
| S3 quiz/solutions | 4 pages, 64,680 bytes, SHA-256 `594118f4fb9832598c2a19308d38928e32dfbc92c977f2a3d604c35c0ff8de0d` |
| S3 captions | 1,615 cues, 5,765 words, reviewed 00:00:00-00:27:45, SHA-256 `4185cf603f82a913dc746050465f3174e6be64c768c93d56544d0c68f4dc2ac0` |
| S30 deck | 6 pages, 413,959 bytes, SHA-256 `b849d6830b97a65d41ae540d9857b55d3a31dae80731eb1971a47b7fc3df17e9` |
| S30 quiz/solutions | 3 pages, 70,069 bytes, SHA-256 `2844829cbaa2702012df55d94a6cca6362a7fa2a58269afab39f5833417f004b` |
| S30 captions | 545 cues, 1,956 words, reviewed 00:00:00-00:09:33, SHA-256 `af2a9e4b0b4aa032e4e82ab958cdacfb9c2a096c3d2eff789b3dd3d60a696c4c` |
| Investor Preparedness Checklist | fetched 2026-08-13, HTTP 200, 43,534 bytes, SHA-256 `6427c9df656d951fe78d2c1dc54afea2be1ade9b2ea954962680e93450c70d82` |
| CFPB emergency-fund guide | fetched 2026-08-13, HTTP 200, 155,673 bytes, SHA-256 `4bee17187d856e91b47e7be7cdc04b9cfcdf539c9bbbfa086621e7b125e33610` |
| Investor.gov risk tolerance | fetched 2026-08-13, HTTP 200, 59,638 bytes, SHA-256 `05260cc29a385e0f495481f955e43eabf1a6e47a670012ddc4f3fdea82570838` |
| Investor.gov allocation guide | fetched 2026-08-13, HTTP 200, 59,779 bytes, SHA-256 `b8eb04800f95dde688a54597f5457090ac4bdfcda0391bd8997b45eb10a5ec41` |
| Vanguard principles | fetched 2026-08-13, HTTP 200; 32 pages, 567,758 bytes, SHA-256 `d3bd6514709f695ae558ba439ae24c03f399cc4dcf3ec5e50722b06f9001fee2` |

Canonical provenance lives under `.source-cache/provenance/` and
`.source-cache/supplemental/provenance/`. Rendered images under `tmp/` are inspection
evidence, not an alternative citation corpus.

## 3. Source-authentic content spine

1. Start with the investor. Damodaran S1 pp. 4 and 8-10 and captions 02:54-06:19 and
   10:13-13:38 place risk preference, horizon, cash needs, and tax context before allocation,
   security selection, execution, and evaluation.
2. Define the personal goal and financial constraints. Vanguard pp. 5-8 connects goals,
   horizon, access needs, risk tolerance, risk capacity, and asset mix. Its definitions
   explicitly separate willingness from capacity.
3. Protect near-term resilience before risky deployment. Investor.gov says to identify
   goals, create a savings/investment plan, pay high-interest debt first, understand risk
   tolerance and fees, research, and diversify. CFPB defines an emergency fund as cash
   reserved for unplanned expenses and makes the amount situation-dependent.
4. Distinguish the roles and risks of cash, bonds, and equities. Investor.gov defines asset
   allocation as division among categories and ties fit to horizon and risk tolerance. S2
   establishes that bonds still carry interest-rate and default risk. S3 establishes that
   equity can expose price, cash-flow, downside, and portfolio risk.
5. Treat diversification as risk management, not loss prevention. S3 pp. 5-12 and captions
   03:32-17:45 distinguish firm-specific from market risk and preserve the assumptions and
   limitations of theory-based models. Investor.gov and Vanguard pp. 8-13 describe
   diversification across and within asset classes and state that it does not guarantee a
   gain or prevent loss.
6. Build a strategic policy before any tactical view. S30 pp. 2 and 5 and captions
   00:47-01:49 and 05:44-07:27 distinguish an allocation driven by investor constraints from
   a timing tilt, and identify missed strong periods, trading cost, and tax as timing costs.
7. Make implementation assumptions inspectable. Vanguard pp. 18-24 treats contribution,
   discipline, rebalancing, spending, and review as parts of maintaining an allocation, but
   its 60/40 and provider examples are illustrations, not personal defaults.
8. Where primary sources provide no universal personal number, label the decision as an
   OPS/learner policy. No reviewed source supplies a personal allocation, stress loss,
   target band, reserve amount, or position-size ceiling suitable for universal use.

## 4. Slide, caption, claim, prerequisite, and interaction coverage matrix

| Proposed Mission 1/5 element | Primary support | Classification and required qualification | Prerequisites before use | Learner-facing landing |
| --- | --- | --- | --- | --- |
| The investor and mandate precede allocation and products. | S1 p. 4, 02:54-06:19; S30 p. 2, 00:47-01:49. | Source-authentic mechanism. S1 is a process map, not an allocation formula. | Investor, portfolio, asset class. | Readiness ribbon; hero resolves broad roles before products. |
| Goal and target date shape the portfolio job. | S1 pp. 4, 9, 02:54-06:19, 11:16-12:17; Investor.gov allocation guide, “Time Horizon”; Vanguard pp. 5-8. | Source-authentic. Avoid “time diversifies risk” or a guaranteed goal outcome. | Goal, target date, horizon. | Readiness R1 and mandate import. |
| Near-term required spending lowers risk capacity and needs compatible liquidity. | S1 p. 9, 11:16-12:17; Investor.gov risk-tolerance page; Vanguard pp. 5-8. | Source-authentic causal relationship. The “liquidity bucket” name and exact mapping are OPS pedagogy. | Required versus optional spending; loss of principal. | Timeline/runway, Mina model, liquidity repair, transfer case. |
| High-interest debt belongs in readiness. | Investor.gov preparedness checklist. | Source-authentic checklist item. No numeric “high-interest” cutoff is supplied. | Debt, interest. | R2 non-scored flag and action plan. |
| Emergency savings protects against financial shocks. | CFPB complete guide. | Source-authentic. The reserve target is learner-selected; no universal months-of-expenses rule. | Unplanned expense, cash reserve. | R2 target/current-state input; “I do not know yet” allowed. |
| Readiness constrains personal deployment but not learning. | Investor.gov/CFPB support the inputs; the two-path routing is an OPS safety adaptation. | OPS adaptation, approved curriculum policy. Never claim regulator approval or personalized suitability. | Personal versus practice data; educational limitation. | Build mine / Practice case; personal constrained / practice only. |
| Age, jurisdiction, earned-income relevance, and account authority are verification flags, not eligibility decisions. | No reviewed Mission 5 source supplies a universal account-eligibility determination. | OPS safety adaptation. Ask broad flags only; unresolved answers route to paper learning. Naming an account rule or declaring eligibility reopens Gate A for current jurisdiction-specific authority. | Account, authority, jurisdiction; “I do not know yet.” | R4 flags and deployment action plan. |
| Capacity and willingness are distinct. | Vanguard p. 8 defines risk tolerance as willingness and capacity for loss as ability; horizon/cash flow drive capacity. Investor.gov uses a combined older definition. | Source-authentic distinction governed by Vanguard; note Investor.gov's combined terminology. | Temporary loss, required spending, ability versus preference. | R3 two parallel answers; life-change test. |
| Cash, bonds, and equities have different roles and risks. | Investor.gov allocation guide; S2 pp. 2-8, 00:00-08:43; S3 pp. 3-6, 00:43-07:17; Vanguard pp. 8-13. | Source-authentic at broad category level. “Ready / Steady / Grow” is OPS language; none is “safe.” | Bond, equity, cash, principal, price. | Role constellation and sleeve definitions. |
| Bond prices can fall and issuers can default. | S2 pp. 2-8, 00:00-08:43. | Source-authentic. Use “promised,” not generally “guaranteed.” | Coupon, rate, price, issuer. | Stability-sleeve warning and scenario explanation. |
| Equity risk has price/cash-flow, upside/downside, and stand-alone/portfolio dimensions. | S3 pp. 3-5, 00:43-05:05. | Source-authentic. Remove the false crisis-symbol etymology. | Stock/equity, cash flow, expected outcome, portfolio. | Growth-sleeve warning; no claim that volatility exhausts risk. |
| Portfolio risk depends on weights, individual volatility, and co-movement. | Existing Finance Foundations `portfolio-risk-covariance-correlation`, stated MIT 15.401 Lectures 13-14 provenance. | Reuse-only bridge proposition. Mission 5 introduces no new dataset, covariance equation, or source magnitude. | Percentage weight, return, volatility. | Preflight 1 and brief bridge/link. |
| Diversification can reduce asset-specific risk but cannot prevent loss. | S3 pp. 5-12, 03:32-17:45; Investor.gov diversification sections; Vanguard pp. 2, 12-13; Finance Foundations `portfolio-diversification-many-assets`. | Source-authentic + reuse-only bridge. Do not imply correlations are stable or all risk disappears. | Firm-specific versus common risk; co-movement. | Preflight 2 and bridge. |
| An efficient frontier is an input-dependent opportunity set, not a personal answer. | Finance Foundations `portfolio-efficient-frontier`; S3 pp. 9-12 and 12:56-17:45 supports model/parameter limits; Vanguard pp. 8-13 supplies personal fit inputs. | OPS synthesis from already taught theory and personal-policy sources. No optimizer output enters saved allocation. | Expected return, volatility, correlation, model estimate. | Preflight 3 and bridge/link. |
| Expected return, volatility, correlation, beta, and tangency results are estimates. | S3 pp. 7, 9-10, 07:17-15:03; Finance Foundations tangency/CAPM/required-return routes. | Source-authentic limitation + reuse-only bridge. No current estimate is required or supplied. | Estimate versus fact; assumption. | Preflight 4 and assumption ownership. |
| A strategic weight is a long-run policy assignment, not a forecast or optimum. | Investor.gov asset-allocation definition and “no single model”; Vanguard pp. 8-13. | “Strategic weight,” sleeve roles, and target ranges are OPS pedagogy. | Percentage, portfolio total. | Scene 2 definition; Allocation Studio. |
| Weights total 100% and map to dollars. | Arithmetic and definition of allocation. | OPS instructional invariant, independently verified. | Percent/decimal conversion; whole = 100%. | Weight-integrity repair and every save check. |
| Stress loss is `sum(weight × assumed sleeve loss)`. | No reviewed source prescribes this beginner policy. S2/S3 support scenario-specific downside; Vanguard pp. 2, 8-13 supports loss capacity. | OPS teaching model. Label every stress as hypothetical, learner/OPS-owned, not a forecast, bound, VaR, or maximum drawdown. | Percent multiplication; percentage points; scenario versus forecast. | Loss scanner, contributions table, transfer and assessment. |
| Candidate ceiling is `allowed portfolio loss contribution / assumed position loss`. | No regulator or Damodaran source supplies it. | OPS/learner policy only. It may be omitted through “I do not know yet.” | Algebraic rearrangement; loss contribution. | Separate ceiling builder and assessment. |
| Concentration means overdependence on one outcome. | Vanguard p. 12 supports issuer/asset-class/sector/location diversification; employer-stock and overlap details lack a canonical Mission 5 source. | General definition source-supported. Employer-stock, fund-overlap, and illiquidity categories are quarantined from source-authentic copy here. | Issuer, sector, diversification. | Broad warning only; no scored category checklist. |
| Strategic allocation changes for mandate changes, not recent winners. | Investor.gov “Changing Your Asset Allocation” and rebalancing sections; S30 p. 5, 05:44-07:27; Vanguard pp. 18-24. | Source-authentic distinction. Exact bands/cadence are not Mission 5 source facts. | Strategic allocation versus timing; drift. | Independent perturbation and downstream review warning. |

## 5. Assessment coverage and verified answers

The Damodaran quizzes establish source emphasis but are not copied. Mission 5's assessment
is an OPS transfer case supported by concepts already introduced and practiced.

| Assessed idea or proposed item | Support and prerequisite | Independently verified answer |
| --- | --- | --- |
| S1 quiz: which personal factors affect philosophy? | S1 pp. 7-10 and full narration. Define philosophy and strategy first. | Source answer is all listed factors: risk aversion, horizon, tax status, and wealth. Mission 5 narrows this to its approved mandate fields and does not reuse the question. |
| S2 quiz risk message | S2 pp. 2-8. | A default-free bond may have a negative one-year return if rates rise and it is sold/marked before maturity; bonds are not a “safe” zero-loss sleeve. The source's exact Q1 arithmetic is `-12.33%`, not the caption's garbled numbers, but Mission 5 does not assess this calculation. |
| S3 quiz portfolio-risk message | S3 pp. 3-12. | The marginal-investor/diversification framing concerns market exposure, not total company risk. Do not copy S3 Q3 or Q4 because their choices/solutions are defective. |
| S30 quiz timing cost | S30 p. 5, 05:44-07:27. | Trying to time markets normally raises trading and potential tax costs and risks missing strong periods. Mission 5 saves a strategic baseline; it does not assess the historical 70% claim. |
| Readiness life-change item | S1 horizon/cash-need support; Vanguard p. 8. Capacity and willingness must already be defined and modelled. | A new near-term $12,000 need lowers capacity and raises liquidity need; willingness may be unchanged. |
| Preflight: co-movement | Finance Foundations reuse-only claim. Weights, volatility, and co-movement are defined in the bridge. | Combined risk depends on weights, asset volatilities, and covariance/correlation. |
| Preflight: diversification | S3 + Investor.gov/Vanguard + Finance Foundations. | Diversification can reduce asset-specific risk; it does not make loss impossible or remove common risk. |
| Preflight: frontier and tangency | Finance Foundations reuse plus S3 model limits and Vanguard personal-fit inputs. | These are model outputs from estimated inputs; they do not select a person's suitable allocation by themselves. |
| Guided repair: 105% weights | Percent-total prerequisite. | 20% + 30% + 55% = 105%; five percentage points of capital are assigned twice. |
| Guided repair: liquidity | Dollars/weights and required cash defined first. | `9,000 / 30,000 = 30%`; a 20% bucket is $6,000 and misses the need by $3,000. |
| Guided stress repair | Stress equation is introduced, modelled, then guided. | 10/20/70 at 0/10/40 loses `0 + 2 + 28 = 30%`, or $15,000 on $50,000. The illustrative 20/35/45 repair loses `0 + 3.5 + 18 = 21.5%`, or $10,750. It is one valid policy, not a recommendation. |
| Independent perturbation | Same learned arithmetic; no hints. | Initial 10/35/55 at 0/8/40 loses `0 + 2.8 + 22 = 24.8%`, or $14,880 on $60,000. The required $15,000 is 25%. Illustrative 25/35/40 loses `0 + 2.8 + 16 = 18.8%`, or $11,280. |
| Final allocation choice | All relationships introduced and practised. | A: 15/35/50 totals 100%, covers $12,000 of $80,000, and loses `4.2 + 20 = 24.2%`, or $19,360. B loses 27.0%/$21,600; C loses 24.8%/$19,840 but funds only $8,000 liquidity; D totals 105% and loses 26.2%/$20,960. |
| Final candidate ceiling | OPS policy explicitly defined and modelled first. | `1.5% / 50% = 3%`; 3% of $80,000 is $2,400. It is not a regulator threshold or guarantee. |

## 6. Independent numerical and logical verification

All Mission 5 arithmetic in the approved Gate B/C plan was recomputed from unrounded
inputs. Use positive loss magnitudes in the explanatory equation:

`contribution in portfolio percentage points = weight% × assumed loss% / 100`

For Mina's $40,000 practice case:

| Sleeve | Weight | Dollars | Assumed loss | Contribution | Dollar loss |
| --- | ---: | ---: | ---: | ---: | ---: |
| Liquidity | 20% | $8,000 | 0% | 0.0 pp | $0 |
| Stability | 30% | $12,000 | 10% | 3.0 pp | $1,200 |
| Growth | 50% | $20,000 | 35% | 17.5 pp | $7,000 |
| **Total** | **100%** | **$40,000** | - | **20.5%** | **$8,200** |

The position-ceiling model verifies: `2% / 40% = 5%`; 5% of $40,000 is $2,000.

Grade with unrounded values; round only display. The plan's 0.01 percentage-point total
tolerance is an implementation tolerance, not a finance rule. Inputs must reject blank,
negative, non-finite, and over-100 committed weights. A zero assumed position loss makes
the ceiling division undefined and must never yield infinity or an “unlimited” position.

No optimization calculation is necessary for the mission. Expected returns, covariance
matrices, the efficient frontier, and the tangency portfolio appear only in the diagnostic
bridge as uncertain concepts. They do not generate the learner's saved weights.

## 7. Discrepancies, ambiguities, and required corrections

| Defect or ambiguity | Required Mission 5 treatment |
| --- | --- |
| S1 p. 9 and narration 12:17-12:39 generalize that a longer horizon permits a larger risky allocation and lets risk “average out.” | Preserve only the causal importance of horizon and cash need. Do not turn age or horizon into an automatic equity percentage or imply that time removes loss risk. |
| S2's official index link opens the overview; the content-matched Session 2 recording is a mirror. | Preserve the provenance note. Slides/quiz and independently checked finance terminology control. |
| S2 captions garble `$1,179.65`, `$1,085.30`, 8.53%, 4%/10-year, $1,000, and duration arithmetic. | Do not use caption numerals. Mission 5 needs only the qualitative bond-risk boundary. |
| S3 teaches the false “crisis = danger + opportunity” folk etymology. | Remove it entirely. Define risk directly as uncertain outcomes and possible loss. |
| S3 slide 7 says weekly/103 observations, while narration calls points monthly. | The slide controls. Mission 5 need not use the Amgen regression. |
| S3 quiz Q3 duplicates “undiversified investor,” and Q4's solution answers another question. | Do not copy either item. |
| S3 uses beta language that can sound like total risk. | If beta is mentioned, call it market exposure under CAPM for a diversified investor; it is not total risk or quality. |
| S30's 93.6% sentence concerns time-series variation within managed portfolios and has often been misread as a universal share of investor return. The narration further paraphrases it inconsistently. | Do not display 93.6%, 40/60, or any “allocation explains X%” slogan. Teach only that allocation is consequential. |
| S30's missed-month and 70%-80% timing figures are dated historical studies and its quiz rounds them. | Quarantine the magnitudes from Mission 5. Its strategic-versus-tactical and cost mechanisms are enough. |
| Investor.gov's older allocation guide combines ability and willingness under “risk tolerance”; Vanguard distinguishes tolerance/willingness from capacity/ability. | Use Vanguard's explicit distinction in the UI and explain the two tracks. Do not claim the terminology is universal. |
| Investor.gov says short-term goals of five years or less should avoid risky investments. | Do not turn five years into a universal cutoff. Ask for the actual cash date and reliability need. |
| Investor.gov says a stock portfolio needs “at least a dozen carefully selected” stocks. | Quarantine the stock-count sentence. It is not a universal diversification or position-size rule and products are not selected until Mission 12. |
| Vanguard's 4%/6% returns, 1901-2022 histories, 60/40 path, annual-review language, and exact charts are provider examples. | Do not use them as forecasts, defaults, target weights, stress assumptions, or universal cadences. Any reuse requires date, sample, assumptions, and provider label. |
| The FINRA concentration URL has canonical provenance status `unavailable` (HTTP 403; cached body is a Cloudflare challenge). | Do not cite FINRA in Mission 5. General across/within diversification may use Vanguard/Investor.gov. Employer-stock, correlated-fund overlap, and illiquidity diagnostics remain out of assessed/source-authentic Mission 5 copy. |
| The current Damodaran historical-returns workbook is `downloaded-not-extracted`; ERP and country-premium artifacts are high decay. | Mission 5 does not need or expose current return/covariance inputs. Quarantine all three from the Allocation Studio. |
| The existing Finance Foundations routes state MIT 15.401 provenance, but no mission-specific MIT cache/provenance package exists in `.source-cache/`. | This audit permits links and the five already-built mental-model statements only. It does not authorize copying source figures, historical datasets, equations, or new MIT claims into Mission 5. A fuller theory re-teach would reopen Gate A. |

## 8. Learner prerequisites revealed by the source

Define and model these before the learner must use them:

- goal, target date, required spending, planned withdrawal, and time horizon;
- emergency fund, high-interest debt, contribution, and employer match;
- risk, loss of principal, volatility, and a hypothetical stress scenario;
- risk capacity/ability and risk willingness/tolerance as separate tracks;
- portfolio, asset class, cash, bond, equity, broad sleeve, and liquidity bucket;
- asset allocation, strategic weight, target range, and percentage versus dollars;
- diversification across and within asset classes, firm-specific risk, common/market risk,
  covariance/correlation, and the fact that diversification does not prevent loss;
- estimate, assumption, expected return, efficient frontier, tangency portfolio, and why a
  model output does not determine personal fit;
- portfolio percentage point, loss contribution, and division by a loss assumption to
  derive a candidate ceiling;
- strategic allocation versus a tactical market-timing deviation;
- personal mode, practice mode, and why deployment constraints do not reduce learning
  access.

The source assumes percentage arithmetic and familiarity with investing vocabulary. The
OPS bridge must explicitly model `weight × loss`, percentage points, and 100% totals before
independent work. No learner is required to calculate covariance, invert a matrix, trace
an optimizer, or know convex-optimization notation.

## 9. Boundaries for the OPS adaptation

Source-authentic material is limited to the relationships in Sections 3 and 4. The
following are deliberately original OPS pedagogy/policy and must be labelled beside the
relevant result, not hidden in a final source panel:

- Build mine and Practice case as equal paths;
- personal deployment available, personal constrained, and practice-only routes;
- Ready / Steady / Grow names and the constellation/loss-scanner metaphor;
- liquidity, stability, and growth teaching sleeves;
- every illustrative weight, target range, stress loss, loss budget, and candidate ceiling;
- the Mina case and all guided, transfer, and assessment cases;
- `position weight × assumed position loss = contribution to portfolio loss` as a beginner
  sizing policy;
- the 0.01 percentage-point implementation tolerance;
- downstream `Review required` invalidation.

The implementation must not:

- recommend or auto-prescribe a personal allocation, product, fund, stock, or account;
- describe the saved allocation as optimal, efficient, safe, guaranteed, or the maximum
  possible loss;
- convert a risk questionnaire, age, horizon, or one regulator sentence into a stock
  percentage;
- impose a universal emergency reserve, debt-rate cutoff, liquidity horizon, target range,
  rebalancing cadence, stress loss, allocation, or concentration cap;
- use a 5%, 10%, 25%, twelve-stock, 60/40, 200/175-basis-point, or similar external number
  as personal suitability authority;
- call cash risk-free for every goal, call bonds safe, say bonds always offset stocks, or
  say diversification prevents loss;
- present 0% teaching stress for liquidity as a guarantee about a real bank deposit, money
  market fund, Treasury bill, inflation-adjusted purchasing power, or any product;
- cite FINRA's blocked page, a Cloudflare body, a search result, or browser memory as
  canonical evidence;
- use Damodaran's current return datasets, an efficient frontier, or a hidden optimizer to
  produce the saved policy;
- ask the learner to place an order, name anything as owned, or convert a research idea
  into a holding before Mission 12;
- retain personal exact account identifiers, credentials, or documents.

## 10. Audit conclusion

Gate A is **passed for the bounded Mission 5 specification** because every required
definition, claim, example, interaction, and assessment now has either exact primary-source
support with prerequisites or an explicit OPS-adaptation classification, and every
proposed number has been independently verified.

The source-authentic center is modest but sufficient: start with the investor; separate
ability from willingness; protect near-term needs; assign broad roles before selecting
products; recognize bond, equity, and diversification limits; and treat a strategic
allocation as a reviewable policy rather than a market forecast. Damodaran does not supply
the allocation algorithm, stress scenarios, or personal sizing rule. OPS therefore owns
those assumptions visibly.

The following quarantines are conditions of the pass:

1. no FINRA concentration citation or employer-stock/fund-overlap scored diagnostic;
2. no current/historical-return dataset, optimizer, or hidden recommended weights;
3. no new MIT-derived theory, equation, number, or dataset beyond links and the five
   already-built bridge propositions;
4. no S30 93.6%, 40/60, missed-month, or 70%-80% magnitude;
5. no provider/regulator example recast as a universal personal rule;
6. every stress, range, loss budget, and candidate ceiling visibly labelled illustrative
   or learner/OPS-owned.

If implementation crosses any of those boundaries, the status reverts to
`Blocked - source` until a new canonical artifact and claim-level matrix are reviewed.
Passing Gate A alone did not pass learner sequence, interaction, implementation,
accessibility, responsive, visual, or fresh-state QA. Those later gates and their current
decision are recorded in the release-evidence ledger; Gate A remains conditional on the
quarantines above.
