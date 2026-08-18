# Damodaran Investment Philosophies: complete 38-session corpus audit

Status: **Complete for the approved curriculum architecture at the slide/test layer;
claim-level narration gate pending for Sessions 5, 12, 24, 27, and 32.** All 38 official
slide decks and tests have been reviewed. The canonical cache contains 33 official caption
tracks. Historical architecture work also consulted local ASR for source-topic Sessions 5
and 12, but local ASR is not citation-grade and the Session 5 source artifact is no longer
present. The 13-mission architecture was approved on 2026-08-12. This record does not
authorize copying every historical claim or quiz item into OPS or bypass a mission-level
release gate.

## 1. Controlling source and edition lock

- Instructor: Aswath Damodaran
- Course: *Investment Philosophies*, 38-webcast online class
- Controlling sequence: the [official 38-webcast course index](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm)
- Companion: *Investment Philosophies: Successful Strategies and the Investors Who Made Them Work*, second edition, 2012, John Wiley & Sons
- Companion support: the [official second-edition support page](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/invphil3edbook.htm)
- Locked session identity: the title, chapter, video, slide deck, and post-session test attached to each row of the 38-webcast course index

The 38-webcast course index is the controlling sequence. The companion support page now exposes a longer and differently numbered overhead list: it labels Session 34 as value investing, inserts alternative-investment material after Session 37, and places “The Grand Finale” later in the sequence. Those rows are not part of this audit and must not be merged into the 38-webcast curriculum without a separate edition decision.

## 2. Evidence actually reviewed

| Evidence | Completed review |
| --- | --- |
| Official course and companion pages | Edition, chapter placement, all 38 titles, descriptions, and download rows reconciled |
| Official slide decks | 38 of 38 decks; 503 pages; all pages rendered, read, and visually inspected, including charts, tables, equations, footnotes, and image-only pages |
| Official tests and solutions | 38 of 38 files; 143 pages; every question, answer choice, solution, and numerical explanation read |
| Official videos | 38 of 38 videos matched to source topic; 33 official caption tracks are canonical and citation-grade |
| Caption and ASR coverage | No official caption track exists for source-topic Sessions 5, 12, 24, 27, and 32. Noncanonical local ASR currently exists for 12, 24, 27, and 32; a prior Session 5 ASR review is documented but its artifact is absent. New claim-level narration citations remain gated for all five. |
| Existing detailed OPS audits | Sessions 2, 3, 4, and 5 retained as the more granular records for those sessions |

Total PDF review: **76 official files and 646 rendered pages**. Hashed citation sources and provenance live in `.source-cache/`. Text extraction, page renders, contact sheets, and noncanonical ASR working files under `tmp/damodaran-corpus/` are staging evidence, not a second citable corpus.

Detailed audits already present:

- `docs/source-audits/damodaran-investment-philosophies-session-2.md`
- `docs/source-audits/damodaran-investment-philosophies-session-3.md`
- `docs/source-audits/damodaran-investment-philosophies-session-4.md`
- `docs/source-audits/damodaran-session-5-valuation-basics.md`

## 3. Source reconciliation and defect ledger

These findings affect what OPS may teach or assess.

| Session | Finding | OPS disposition |
| ---: | --- | --- |
| 5–6 | The official YouTube uploads titled Session 5 and Session 6 contain the opposite session’s topic. The row titled Session 5 plays trading costs; the row titled Session 6 plays valuation. | Match narration by content, not upload title. Session 5 uses the valuation narration from the Session 6-labelled upload; Session 6 uses the trading-cost narration from the Session 5-labelled upload. |
| 6 | Quiz Q1 changes an answer choice between test and solution. Q2 approximates the 2% selling haircut by multiplying by 1.02 instead of dividing by 0.98. | Rewrite Q1. Correct Q2 annual pre-cost return is about **12.2449%**; the published 12.22% is a close approximation, not exact arithmetic. |
| 8 | Slide 14 reverses independent and dependent variable labels. Slides and quiz call average return divided by standard deviation a “Sharpe ratio,” omitting the risk-free return. | Correct the regression labels. Use the standard excess-return definition and a modern primary reference. Do not reuse quiz Q2 unchanged. |
| 10 | Narration briefly calls January the worst month before the rest of the explanation correctly treats it as historically strong. Quiz Q4’s solution answers a different question from the test. | Treat the narration phrase as a slip; replace Q4. Historical calendar claims require current evidence. |
| 12 | Narration presents Charlie Munger as one of Graham’s Columbia students and simplifies owner earnings. Several Buffett observations are time-bound to the recording period. | Do not teach the biography or owner-earnings formula from this source alone. Preserve the broader lessons on discipline, risk adjustment, scale, access, and patience. |
| 13 | The stable-growth price-to-book expression appears malformed. Quiz Q1’s explanation says low-price-to-book companies have higher ROE while the slide logic says low ROE can justify low price-to-book. | Re-derive the formula independently and replace Q1. Preserve only the cheapness + risk + growth + reinvestment framework. |
| 17 | Quiz Q3 uses a ten-year horizon in the test and five years in the solution. | Replace the item; retain the long-horizon point. |
| 19 | Quiz Q5 asks which company has the greatest growth value without sufficient duration, base, or reinvestment information. | Do not reuse. Teach value of growth through excess returns and explicit assumptions. |
| 20 | Quiz Q3 conflates the fair post-money ownership share with the negotiated share sought by the venture capitalist. | Separate valuation from negotiation in any adaptation. |
| 21 | Quiz Q2 has no answer exactly matching the solution. Q4’s numerical result is sound: a $25 price, 30% EPS growth for five years, and terminal P/E of 25 imply about $92.82 and a 13.17% annualized return from a $50 purchase. | Replace Q2; Q4 may be adapted only with the assumptions visible. |
| 23 | The insider definition and regulatory framing are dated, and the source discusses clues from illegal trading as a potential payoff. | Use only as an ethics, legality, and signal-quality case with current SEC sources. Never frame illegal information as a learner action. |
| 24 | Quiz Q4’s answer choice is materially different in the solution from the test. Analyst impact and forecast evidence are historical. | Replace the item and refresh empirical claims. Preserve analyst evidence as an input rather than authority. |
| 25 | Quiz Q3’s solution substitutes a different answer choice. | Replace the item; preserve expectations, surprise, and cash-quality reasoning. |
| 27 | Quiz Q4 correctly identifies a $1 put-arbitrage gap but its explanation states the intrinsic-value subtraction in the wrong order. | Correct put intrinsic value to `max(strike − stock price, 0)`. Re-verify all option relationships before use. |
| 29 | “Sharpe ratio” again omits the risk-free return. Historical hedge-fund results have survivorship and period dependence. | Use the standard definition and updated evidence. Preserve the pure/near/speculative risk taxonomy. |
| 30 | The 93.6% asset-allocation statistic is easy to misstate: it concerns variation through time in a plan, not a universal cross-sectional claim that allocation explains 93.6% of every investor’s return. | Teach allocation as consequential without repeating the slogan. Add a dedicated strategic-allocation source. |
| 31 | Quiz Q1 asks for a statistical test but the solution does not address that part. | Replace the item; retain causality, leading-versus-contemporaneous, and data-mining checks. |
| 33 | The constant-growth market valuation example correctly yields `90 / (7.5% − 3%) = 2,000`; extracted source text contains a decimal/OCR defect. | Show the equation explicitly and label the simplifying assumptions. |
| 34 | The source suggests that investors who insist on timing might reserve 5–10% for it. | Do not adopt this as a beginner default. Any speculative sleeve needs a separately approved risk limit and evidence rule. |
| 35 | The load-fund compounding example is arithmetically sound: about $2,158,925 versus $1,927,808, a $231,117 gap. Performance samples and “local/concentrated investor” findings are dated and do not establish a beginner concentration rule. | Preserve cost compounding and the passive default; refresh performance evidence and reject concentration as generic advice. |
| 36 | Quiz Q3 and Q5 change wording or answer sets between test and solution. Morningstar methodology and predictive-power claims are period-specific. | Replace those items and use current fund-selection evidence. Preserve turnover, tax, timing, incentive, and behavior checks. |
| 37 | Quiz Q1’s test choices overlap for a capitalization-weighted index and change in the solution. Q5 overstates what the slides establish about enhanced indexing. Product-cost comparisons are dated. | Rewrite the assessment. Use current fund documents for expense ratio, spread, tracking difference, liquidity, tax, and securities-lending review. |
| 38 | Narration twice reverses value-style examples, including describing passive value as high-P/E. It also suggests an impatient person choose a short-term strategy. | Use the slide definition, not the slips. Treat impatience as a behavior risk to design around, not a reason to encourage short-term trading. |

The official quizzes are evidence of intended emphasis, not ready-made OPS assessments. An OPS question is eligible only after its concept has been introduced and practiced, its wording matches the reviewed source, and its answer has been independently verified.

## 4. Session-by-session content and curriculum verdict

“Core” means the session contributes evidence to a required portfolio decision. It does not mean the whole session becomes required learner content. “Lab” means the strategy mechanics remain available as optional depth.

| Session | What the complete source establishes | Curriculum verdict and boundary |
| ---: | --- | --- |
| 1 | Philosophy is a coherent belief about how markets work; strategy implements it. The investment process runs from investor constraints through allocation, selection, execution, and evaluation. | **Core.** Start with mandate, horizon, liquidity, tax, and risk. Pair with Session 38. It does not teach how to calculate an allocation. |
| 2 | Bonds carry interest-rate risk even without default; duration links timing to price sensitivity; default risk requires a spread. | **Core.** Asset role, rate/default risk, and required yield. Advanced duration and credit analysis stay in a lab. |
| 3 | Equity risk can be framed across price/cash-flow, total/downside, and stand-alone/portfolio dimensions; diversification changes relevant risk; CAPM is one model among several. | **Core.** Risk budget, diversification, and required return. Alternative measures stay in a lab. |
| 4 | Balance sheet, income statement, and cash-flow statement are connected but accounting categories differ from investor economics. | **Core.** Business evidence, earnings quality, debt, reinvestment, and cash. Detailed recasts stay in a lab. |
| 5 | Intrinsic value depends consistently on cash flow, growth, and discount rate; relative value also needs controls for cash flow, growth, and risk; growth can destroy value. | **Core.** Valuation range and expected-return discipline. A full DCF is optional depth. |
| 6 | Trading cost includes commission, spread, price impact, and waiting; liquidity, order size, urgency, strategy, turnover, and taxes change realized return. | **Core.** Implementation drag and after-tax rules. Legal/tax details need current sources. |
| 7 | Efficiency means price is an unbiased estimate, not always correct. An edge needs a pocket of inefficiency, a correction mechanism, tradability, and profit after friction. Behavioral bias affects both markets and the investor. | **Core.** Define the edge claim and behavioral guardrails. |
| 8 | Event studies, characteristic portfolios, and regressions test strategy claims; risk adjustment, holdouts, survivorship, cost, execution, and economic significance matter. | **Core.** Evidence gate for any active claim; methods can be simplified in core and practiced in a lab. |
| 9 | Return dependence changes by horizon: microstructure at very short intervals, short reversal, intermediate momentum, and long reversal; costs and inflection points matter. | **Lab.** Use in core only to show horizon instability and why backtests need an execution model. |
| 10 | January, weekend, and intraday patterns have changed or weakened and are difficult to exploit. | **Lab.** Useful as a data-mining and decay case, not a required strategy. |
| 11 | Technical indicators can be grouped by their claimed behavioral mechanism; success requires a causal story, test, horizon, execution, and cost check. | **Lab.** Preserve as an edge-testing case; several indicators are dated. |
| 12 | Value investing focuses on assets in place and appears as passive screening, contrarian, or activist value. Graham and Buffett illustrate discipline more than copyable rules. | **Lab with core definition.** Teach style identity and investor-resource fit; do not turn famous-investor screens into defaults. |
| 13 | A useful value screen combines cheapness with risk, growth, and quality of reinvestment; cheap can be justified by weak fundamentals. | **Core contribution + lab.** Use the value-trap check in holding selection; retain multiple-specific mechanics as optional. |
| 14 | Contrarian returns depend on overreaction, correction, horizon, transaction cost, patience, and client fit; a good company can be a bad investment at the wrong price. | **Core price-versus-quality insight + lab.** Do not make loser portfolios required. |
| 15 | Activist value requires a catalyst, control or influence, capital, concentrated research, and persistence; value can change through assets, financing, payout, or governance. | **Lab.** Use only the catalyst/control/resource fit test in core. |
| 16 | Active value funds historically failed to deliver the promised edge. DCF, risk assessment, price discipline, and changing intrinsic value remain necessary; margin of safety does not replace them. | **Core.** Supports passive default and corrects value-investing myths. Historical performance needs refresh. |
| 17 | Growth investing claims an advantage in valuing growth assets; small-cap implementation brings information, transaction, volatility, and diversification problems. | **Lab with core fit warning.** Small-company exposure is not a substitute for diversification. |
| 18 | IPO allocation creates selection bias; underpricing averages hide overpriced issues, hot/cold cycles, access constraints, and weak long-run results. | **Lab.** Core may use IPOs to teach selection bias and new-issue guardrails. |
| 19 | Historical and forecast growth screens are weak; high P/E and PEG rules can ignore risk, growth duration, and reinvestment quality. | **Core contribution + lab.** Teach value of growth through excess return rather than PEG shortcuts. |
| 20 | Venture capital uses pre/post-money valuation, target return, active involvement, staged survival risk, and exit; it is illiquid and resource-intensive. | **Specialist lab.** Not a beginner portfolio requirement. |
| 21 | Growth research can matter more where firms are smaller and harder to value, but scale, macro exposure, and cost of growth constrain the edge; growth creates value only with excess returns. | **Core.** Connect financial statements, valuation, and edge. Detailed style evidence stays optional. |
| 22 | Prices may adjust instantly, slowly, or by overreaction; trading before, on, or after news has different information, legal, speed, and cost requirements. | **Core monitoring concept + lab.** Teach news versus expectations and legal boundaries, not “trade ahead.” |
| 23 | Reported insider activity is delayed and noisy; signal strength varies; legal and illegal information are distinct. | **Ethics/reference lab.** Require current SEC material before any actionable lesson. |
| 24 | Analysts are somewhat more useful for short-horizon estimates than long-horizon forecasts; revisions, recommendations, narratives, following, and conflicts affect impact. | **Core evidence-literacy contribution + lab.** Analyst opinion is an input, never delegated judgment. |
| 25 | Earnings news is actual versus expected, not merely positive versus negative; price response, delayed reports, accrual/cash quality, and execution speed matter. | **Core.** Monitoring rules should compare results with thesis and expectations; drift trading stays optional. |
| 26 | Acquisition value accrues more reliably to targets than acquirers; synergy and capital allocation require evidence; splits and dividend changes carry limited or changing information. | **Core.** Supports thesis-break, dilution, acquisition, and payout monitoring. Event trading stays optional. |
| 27 | Pure arbitrage requires identical cash flows, simultaneous price difference, costs below the gap, and guaranteed convergence; replication is the proof. | **Lab with core taxonomy.** Use the cash-flow scanner to distinguish a guarantee from a forecast. |
| 28 | Near arbitrage relaxes identical-cash-flow or guaranteed-convergence conditions; capital, control, convertibility, liquidity, tax, and timing remain risks. | **Lab.** Core uses it to challenge “low risk” labels. |
| 29 | Pairs and merger trades are speculative, not riskless; convergence can fail and leverage magnifies tail risk; winner-skew and survivorship matter. | **Core guardrail + lab.** Never label convergence assumptions as arbitrage. |
| 30 | Every allocation embeds timing choices; successful timing has large hindsight payoff but missing strong periods, turnover, and tax are costly. | **Core.** Establish a strategic allocation and a written timing boundary. Add a separate allocation-construction source. |
| 31 | Nonfinancial, price, calendar, volume, volatility, and sentiment indicators need economic causality and true lead time; many are spurious, contemporaneous, or unstable. | **Core evidence warning + lab.** Do not teach indicator lists as signals. |
| 32 | Mean-reversion timing assumes a stable normal for valuation or rates; normals and macro relationships can shift by regime. | **Core context + lab.** Market valuation may inform risk discussion, not act as an automatic switch. |
| 33 | A market can be valued from dividends/buybacks or compared over time/across markets, but results depend on rates, growth, risk, and historical stability. | **Core valuation context + lab.** Not a precise timing device. |
| 34 | Mutual funds, tactical allocators, newsletters, and strategists show weak timing evidence; timing can enter through allocation, style, sector, or derivatives. | **Core.** Default to no timing or a tightly bounded, testable tilt; stop when evidence fails. |
| 35 | Average active individuals and funds historically underperformed relevant indices; activity and costs worsen outcomes; subgroup results do not create an easy selection rule. | **Core.** Passive is the default architecture. Concentration anecdotes are not beginner sizing guidance. |
| 36 | Performance persistence is weak beyond short “hot hands”; turnover, cost, tax, cash timing, style drift, herding, window dressing, and incentives explain leakage. | **Core.** Manager and strategy selection need persistence, cost, behavior, and benchmark checks. |
| 37 | Passive choices include full or sampled index funds, ETFs, and enhanced index funds; tracking and exposure matter more than market-beating claims. | **Core, but dated implementation data.** Add current fund due-diligence sources before teaching product choice. |
| 38 | A philosophy must fit patience, risk tolerance, independent/group behavior, available time, age, job security, capital, cash needs, taxes, and market beliefs; combined philosophies must be compatible and hierarchical. | **Core opening and capstone.** Convert personality observations into safe constraints and written review rules. |

## 5. What the corpus can and cannot support

The 38 sessions strongly support these required decisions:

- define the investor and the job of the portfolio;
- understand bond and equity risks;
- read business and cash-flow evidence;
- connect price with cash flow, growth, reinvestment, and risk;
- test an active claim against evidence and implementation friction;
- choose passive as a valid default and demand proof for an active sleeve;
- set timing, turnover, tax, liquidity, behavior, and review guardrails;
- choose a philosophy that fits the investor and revise it when evidence changes.

The corpus does **not** provide a complete beginner method for:

- constructing a strategic asset allocation from goals and capacity;
- translating risk capacity into position sizes and concentration limits;
- comparing current mutual funds and ETFs using live disclosures;
- selecting a rebalancing rule;
- coordinating taxable and tax-advantaged accounts under current law;
- writing a complete investment policy statement and benchmark policy.

Those are not minor omissions. They are the supplemental-source and explicit OPS-design agenda for Portfolio Builder. Damodaran supplies the philosophy, evidence, valuation, and implementation guardrails; OPS must add current primary sources where they exist and label original policy choices where no universal source rule exists. The practical-tools research and boundary record is `docs/source-audits/portfolio-builder-practical-tools.md`.

## 6. Curriculum-level release decision

The source corpus is sufficiently audited to support replacing the provisional “38 sessions become source families” sketch with one proposed evidence-backed mission spine. Stakeholder approval is still required before that spine becomes authoritative. Sessions remain provenance, not learner navigation. No session is discarded: core excerpts support mission decisions, strategy mechanics become optional labs, and the complete source sequence remains reference material. New claim-level narration use from Sessions 5, 12, 24, 27, and 32 remains provisional until canonical evidence is reconciled.

New mission implementation remains **blocked — source/design** where it requires investment-readiness screening, strategic allocation, a validated OPS loss-budget sizing policy, current fund/ETF selection, rebalancing, current tax/legal rules, or current manager-performance persistence evidence. There is no universal regulator-supplied personal position cap; fund diversification tests must not be used as one. Sessions 5, 12, 24, 27, and 32 also remain **blocked — narration** for new claim-level citation. Before each mission is outlined, its claims and assessments still need a claim-level coverage matrix that cites exact slide pages or canonical caption intervals and the approved supplemental source.

Subsequent authority note (2026-08-12): the stakeholder approved the 13-mission curriculum,
and Mission 5 later passed its own bounded claim-level Gate A in
`docs/source-audits/mission-05-allocation.md`. That pass covers the Readiness Runway and
Allocation Studio using visible OPS/learner stress assumptions; it does not authorize live
return/covariance inputs, an optimizer, regulator-branded personal caps, or any other mission.
