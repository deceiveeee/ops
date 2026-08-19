# Mission 13 — operating plan, flight test and IPS: source audit

**Status:** Gate A in progress. Session 38 reviewed at slide and test level. Sessions 1, 6 and
36 and the supplemental set are cached and pending review.

**Phase prompt:** `docs/agent-prompts/portfolio-builder/08-mission-13-capstone.md`
**Mission record:** `pb-13`, artifact `policy`, "Operating Plan and IPS", 40 target minutes.

## Source inventory — verified 2026-08-17

Unlike Mission 12, nothing here needs live retrieval. Every source is already cached.

### Damodaran sessions

| Session | Title | Slides | Quiz | Captions | Tier |
| ---: | --- | ---: | ---: | --- | :---: |
| 1 | Introduction / investment process | 10 pp | 3 pp | official, 835 cues, 2,970 words | 2 |
| 6 | Trading costs and taxes | 22 pp | 4 pp | official, 1,559 cues, 5,589 words | 2 |
| 36 | Active investing: the record | 17 pp | 4 pp | official, 877 cues, 3,084 words | 2 |
| 38 | The Grand Finale: choosing a philosophy | 13 pp | 3 pp | official, 939 cues, 2,740 words | 2 |

All four carry an official caption track, so all four are tier 2 and may be cited with a
timestamp. No ASR-only session is in scope for this mission.

### Supplemental sources

All fetched 2026-08-13, provenance status `ok`.

| Source | Bytes | Used for |
| --- | ---: | --- |
| `cfa-ips-individual` | 198,330 | IPS structure |
| `investor-allocation-rebalancing` | 59,779 | Regulator rebalancing guidance |
| `investor-preparedness` | 43,534 | Emergency and shock preparation |
| `vanguard-rebalancing-edge` | 1,184,460 | Rebalancing method — **provider research, never a personal threshold** |
| `irs-pub550` | 2,401,930 | Dated warning-level tax statements only |
| `irs-pub590a` | 1,817,459 | Same |
| `irs-pub590b` | 2,097,777 | Same |
| `sec-order-types` | 51,744 | Execution mechanics in the operating plan |
| `sec-brokerage-accounts` | 59,455 | Account mechanics |

Standing limits from the phase prompt, recorded before any claim is written: no personal tax
liability, no universal account placement, no individualised legal eligibility, and no
conversion of Vanguard's provider research into a personal rebalancing threshold. Any cadence,
band or trigger the learner picks is OPS or personal policy, labelled as such.

## Session 38 — verified claims

Reviewed at slide level, all 13 pages, plus the 5-item test and its solutions. This is the
mission's spine: it is the only session in the course that asks whether the whole plan fits the
person who wrote it.

| # | Claim | Location | OPS usable? |
| --- | --- | --- | --- |
| S38-1 | Choosing a philosophy requires understanding your own personal characteristics, your financial characteristics, and your beliefs about how markets work — **"An investment philosophy that does not match your needs or your views about markets will ultimately fail."** | Slide 2 | Yes — the thesis of the entire mission |
| S38-2 | Five personal characteristics shape the choice: patience, risk aversion, individual-or-group thinker, time willing to spend, and age | Slide 3 | Yes |
| S38-3 | **The sleep test** — lying awake thinking about your portfolio means you hold more risk than you are comfortable with. Low-risk strategies have lower expected returns, but the cost of taking too much risk is greater | Slide 4 | Yes — flight-test scenario 1 |
| S38-4 | **The life change test** — long-term movements should affect when you retire and what you do next; day-to-day movements should not. In every downturn, older investors near retirement postpone it because of portfolio damage | Slide 4 | Yes — flight-test scenario 2 |
| S38-5 | **The second guessing test** — if you re-examine your choices every time you read a contrary opinion, reconsider the strategy | Slide 4 | Yes — flight-test scenario 3 |
| S38-6 | Four financial characteristics: job security, funds available, cash needs, tax status — and they change over time, so choices must be modified | Slide 5 | Yes — the review-trigger basis |
| S38-7 | In a recession even the employed demand larger risk premiums; philosophy is heavily influenced by *perceived* earning capacity. Income that barely covers expenses forces a portfolio tailored to cash needs | Slide 6 | Yes — income-loss scenario |
| S38-8 | Choices expand as available funds increase, and the count should include pension funds, IRAs and insurance savings, some of which restrict what you may hold | Slide 7 | Yes, as a directional statement — **not** as account-placement advice |
| S38-9 | Unpredictable cash withdrawal demands are a central peril; for individuals they arise from personal crises such as illness not covered by insurance. Forced liquidation loses long-term return potential. You cannot forecast the timing but you can weigh the probability, and expected cash need shortens the horizon | Slide 8 | Yes — urgent-cash scenario |
| S38-10 | Investors facing high income taxes should prefer strategies that reduce or defer tax. Different portions of the same person's income face different treatment — a tax-exempt pension fund can hold an income-generating strategy that personal savings should not | Slide 9 | Yes, as a **directional warning only**. Never a calculation, never placement advice |
| S38-11 | Much of what people believe about markets comes from anecdote. Beliefs will change over time, and all you can do is choose on what you know today | Slide 10 | Yes |
| S38-12 | **"It would be foolhardy to stay consistent as the evidence accumulates against the philosophy."** Consistency matters, but not against the record | Slide 10 | Yes — the canonical basis for the thesis-break rule |
| S38-13 | Philosophies map onto a horizon × approach matrix: short/medium/long term against momentum, contrarian and opportunistic | Slide 11 | Yes, as a taxonomy |
| S38-14 | You may pick a single best philosophy, or combine — but **never mix strategies that make contradictory assumptions about market behaviour over the same period** (relative-strength buying against post-negative-earnings buying: one assumes slow learning, the other overreaction) | Slide 12 | Yes — the coherence test the dossier must pass |
| S38-15 | When combining, **separate the dominant strategy from the secondary ones**, so you know which wins when they conflict | Slide 12 | Yes — required by any multi-sleeve plan |
| S38-16 | You must look within before you look outside; the best strategy matches both personality and needs, and since beliefs follow experience, strategies must follow suit | Slide 13 | Yes — the closing frame |
| F38-1 | Time horizon is affected by patience, age, job security **and** health — all of them | Test Q1, answer (e) | Yes |
| F38-2 | Believing markets overreact to news and holding a medium-term horizon points to information trading on very negative earnings surprises held for months | Test Q2, answer (d) | Yes, as a worked example of fit — **not** a strategy OPS offers |
| F38-3 | A market timer **can** also be a stock picker; the two may supplement each other | Test Q3, answer (b) False | Yes |
| F38-4 | Technical momentum investing and contrarian market timing are incompatible: one assumes markets learn slowly, the other the opposite | Test Q4, answer (d) | Yes — the concrete instance of S38-14 |
| F38-5 | The best philosophy is the one that fits your own characteristics and needs | Test Q5, answer (e) | Yes |

### Why this session carries the mission

Missions 1–12 each produced an artifact. Session 38 supplies the only thing that can judge them
as a set: **fit**. S38-1 states the failure mode, S38-3/4/5 give three concrete tests for it,
S38-14 and S38-15 give the coherence rule for a portfolio built from several decisions, and
S38-12 gives the condition under which a learner should abandon a position they wrote down
themselves. The flight test the phase prompt requires is not an OPS invention — its shape comes
from here.

### Notes and cautions

- **S38-2's age claim is a generalisation about willingness to take risk, not a rule.** Carry it
  as a prompt to re-examine, never as an instruction to de-risk at a given age.
- **F38-2 is a worked example of fit, not a recommended strategy.** Mission 10 licenses a
  passive core; nothing in Mission 13 may present information trading as an option.
- **S38-10 is the tax boundary.** It supports "different money is taxed differently, so check"
  and nothing beyond it. The IRS sources are for dated warning-level statements only.
- No defect of the kind found in Sessions 5, 6, 8 and 37 has surfaced in Session 38 so far: the
  test options match the solution options, and the explanations agree with the marked answers.
  The caption track is still to be reviewed and may change that.

## Pending

Sessions 1, 6 and 36 at slide and caption level; the caption track for Session 38; and the nine
supplemental sources. Then the claim-level coverage matrix for every flight-test scenario the
phase prompt requires.

## Session 36 — verified claims

Reviewed at slide level, all 17 pages, plus the 5-item test and its solutions. Mission 10
already used this session for the architecture decision; Mission 13 needs it for a different
job — the operating plan's bias toward inaction, and the conditions under which a learner
should stop doing something they licensed themselves to do.

| # | Claim | Location | OPS usable? |
| --- | --- | --- | --- |
| S36-1 | Fund managers argue good managers stay good and bad managers drag the average down. **"The evidence indicates otherwise."** | Slide 2 | Yes |
| S36-2 | Transition probabilities across quartiles are close to random. Updated table: a first-quartile fund goes to Q1 24%, Q2 26%, Q3 19%, Q4 23% — and **8% merge or liquidate** | Slides 3–4 | Yes, **dated** — see D1 |
| S36-3 | **25% of fourth-quartile funds merged or were liquidated**, against 8% of first-quartile funds | Slide 4 | Yes, dated — the survivorship point, and the strongest number on the slide |
| S36-4 | Morningstar revamped its ratings in 2002: 48 subgroups instead of four, downside risk properly captured (before 2002 a fund counted as risky only if returns fell below the T-bill rate, however volatile), and multiple share classes consolidated into one fund | Slide 6 | Yes — and note the share-class consolidation echoes Mission 12's identity lesson |
| S36-5 | Ratings had little predictive power before 2002; a study of June 2002 ratings against July 2002–June 2005 returns found higher-rated funds did deliver significantly higher returns | Slide 6; test Q2 answer (c) | Yes, with both periods stated |
| S36-6 | Repeat-winner percentages: 65.10% across 1971–79, falling to **51.70% across 1980–90** — close to a coin flip in the later period | Slide 7 | Yes, dated and by period — see D1 |
| S36-7 | Five reasons active managers fail: high transaction costs, high taxes, too much activity, failure to stay fully invested, and behavioural factors | Slide 9 | Yes — the spine of the operating plan's "why the default is to do nothing" |
| S36-8 | **Activity generates negative returns.** Comparing actual fund returns against the same portfolio left untouched for the year, the frozen portfolios win, and the gap scales with how much activity the fund undertook | Slide 14; test Q5 answer (c) | Yes — the canonical basis for a rebalance-band rather than continuous trading |
| S36-9 | **Style inconsistency is expensive.** Brown and Van Harlow, several thousand funds 1991–2000: funds that switched styles had much higher expense ratios and much lower returns than funds that kept a consistent style | Slide 16 | Yes — the direct argument for holding a written policy, and the mission's best evidence for it |
| S36-10 | Herd behaviour: institutions tend to buy or sell the same investments at the same time | Slide 16 | Yes |
| S36-11 | Window dressing: managers rearrange portfolios just before reporting dates, selling losers and buying winners after the fact. O'Neal (2001) finds it most prevalent in December and that it imposes a significant cost | Slide 16 | Yes, with the citation and date |
| S36-12 | Funds that trade more have **lower returns and lower risk-adjusted returns than the market** | Test Q4 answer (c) | Yes |
| S36-13 | Under no continuity, a first-quartile fund should show 25% / 25% / 25% / 25% next period | Test Q1 answer (d) | Yes — the null the learner tests a streak against |
| S36-14 | "The performance of active money managers provides the best evidence yet that indexing may be the best strategy for many investors" | Slide 17 | Yes — as Damodaran's conclusion, not as OPS advice |

### Defect and quarantine

**D1 — every performance percentage in this session is dated, and Mission 10 already quarantined
them.** The transition table, the 65.10%/51.70% repeat-winner figures and the Morningstar study
all describe periods ending 2005 at the latest. `docs/source-audits/mission-10-architecture-edge.md`
records that the current active/passive base rate comes from the Morningstar barometer with data
through 30 June 2026, and that Damodaran's own historical percentages are not reused as current
evidence. **Mission 13 inherits that rule unchanged.** These figures may appear only as dated,
labelled history illustrating a mechanism — never as the rate a learner should expect today.

S36-8 and S36-9 are the exceptions worth leaning on, because they are *mechanisms* rather than
rates: activity costs return, and style-switching costs more than it earns. Both survive the
quarantine and both argue for the same thing — a written policy the learner does not casually
depart from, which is exactly what Mission 13 asks them to produce.

## Session 1 — verified claims

Reviewed from the canonical slide text, 10 pages. Session 1 opened the course; Mission 13 is
where the learner returns to it with every box filled in by their own work.

| # | Claim | Location | OPS usable? |
| --- | --- | --- | --- |
| S1-1 | An investment philosophy is **a coherent way of thinking about markets, how they work and sometimes do not, and the types of mistakes you believe consistently underlie investor behaviour** | Slide 2 | Yes |
| S1-2 | Philosophy and strategy are not the same: a strategy is much narrower, a way of *putting a philosophy into practice*. A philosophy is **"a set of core beliefs that you can go back to in order to generate new strategies when old ones do not work"** | Slide 2 | Yes — the reason the IPS records beliefs and not only weights |
| S1-3 | Without a philosophy you are **"easy prey for charlatans and pretenders,"** each claiming to have found the magic strategy that beats the market | Slide 3 | Yes |
| S1-4 | Without one you **switch from strategy to strategy**, changing the portfolio, **incurring high transaction costs and paying more in taxes** | Slide 3 | Yes — the same finding S36-9 measures, stated as a mechanism |
| S1-5 | Without one you may hold a strategy inappropriate for your objectives, risk aversion and personal characteristics — and beyond underperformance, **"you are likely to find yourself with an ulcer or worse"** | Slide 3 | Yes — the source's own precursor to Session 38's sleep test |
| S1-6 | **Figure 1.1, the investment process.** The client supplies utility functions, risk aversion and tolerance, investment horizon and tax status. The manager's job then runs: asset allocation → security selection → trading execution → performance evaluation, with views on risk and return, market efficiency, trading costs and risk models feeding each stage | Slide 4 | Yes — the closing frame for the whole course |
| S1-7 | Philosophies divide three ways: market timing versus asset selection; activist versus passive; and by time horizon | Slide 5 | Yes, as a taxonomy |

### Why Session 1 belongs in the capstone

**Figure 1.1 is the course.** Mission 1 set the client inputs, Mission 5 the asset allocation,
Missions 9–11 the views on efficiency and timing, Mission 12 the security selection and trading
execution, and Mission 13 supplies the last box — performance evaluation — and then asks whether
the chain holds together. Ending where the course began is not an OPS framing device; the figure
already has that shape.

S1-4 and S36-9 are the same finding at different resolutions: Session 1 asserts that strategy
switching costs money, Session 36 measures it across several thousand funds over a decade.
S1-5 and S38-3 pair the same way — an ulcer in Session 1, the sleep test in Session 38.
Mission 13 can use the pair rather than either alone, and should attribute both.

## Session 6 — verified claims

Reviewed from the canonical slide text, 22 pages. Mission 8 already built the Friction Budget
from this session; Mission 13 needs only the subset that governs **rebalancing cost and tax
warnings**, and inherits Mission 8's recorded defects rather than re-litigating them.

| # | Claim | Location | OPS usable? |
| --- | --- | --- | --- |
| S6-1 | Trading cost has four components: **brokerage cost** (most explicit, usually the smallest), **bid-ask spread**, **price impact**, and the **opportunity cost of waiting** — patience reduces spread and impact but costs profit on trades that decay while you wait | Slide 2 | Yes — already the spine of Mission 8's budget; Mission 13 applies it to rebalancing |
| S6-2 | Return on an active manager = expected return for risk + return from active trading − trading costs. The average active manager makes **about 1% less than the market**; if the return to active trading is zero, trading costs are roughly that 1% | Slide 3 | Yes, dated and as an order of magnitude, not a current figure |
| S6-3 | **Keep trading to a minimum** — the more you trade, the higher the tax liability | "How to manage taxes" slide | Yes — the tax half of the argument for bands over continuous rebalancing |
| S6-4 | **Factor in taxes when buying** — account for expected tax drag on returns | Same slide | Yes, but see D2: the rate comparison attached to this claim is not usable |
| S6-5 | **Factor in taxes when selling** — consider the tax effect of trades, and match losing sales against gains | Same slide | Yes, as a directional warning. Never as a personal calculation, and never as an instruction to harvest |
| S6-6 | **Do not invest just to avoid taxes** — investments structured primarily to avoid tax are often bad investments and are more likely to be challenged by tax authorities | Same slide | Yes — a clean, still-true warning, and a good closing line for the tax section |

### D2 — the dividend-versus-capital-gains rate claim is dated and is not reproduced

Session 6 states, inside S6-4, that *"if dividends are taxed at a rate higher than capital
gains, you will pay more in taxes,"* and concludes that an investor who does not need the cash
should prefer stocks delivering price appreciation.

That relative-rate premise is **source-era and not generally true under current US rules**,
where qualified dividends and long-term capital gains share the same preferential brackets
while non-qualified dividends and short-term gains are taxed as ordinary income. The comparison
therefore turns on *qualification and holding period*, not on dividends versus gains as
categories.

**Mission 13 does not repeat the rate comparison.** What survives is the conditional shape —
different kinds of investment income can be taxed differently, so check before you assume — and
that is the same boundary S38-10 draws. The current locked IRS sources are the authority for any
dated warning-level statement, and none of them is used to compute a learner's liability.

This is the same class of defect already recorded against this session for Mission 8, where the
published 12.22% hurdle was independently recalculated as about 12.24%. Session 6 is a reliable
source for *mechanisms* and an unreliable one for *current rates*.

## CFA Institute — Elements of an Investment Policy Statement for Individual Investors

Locked source: *Elements of an Investment Policy Statement for Individual Investors*, CFA
Institute, May 2010, ISBN 978-0-938367-31-4. Cached 2026-08-13, 198,330 bytes.

**Dating note.** This is a 2010 document, and that is acceptable here in a way Session 36's
percentages are not: it specifies the *structure* of an IPS, not a rate, a return or a tax
threshold. Nothing in it is superseded by market data. It is cited for skeleton only.

| # | Element | OPS usable? |
| --- | --- | --- |
| C-1 | The IPS **"serves as a strategic guide to the planning and implementation of an investment program"** and exists because taking a person's full circumstances into account requires a disciplined approach | Yes — the mission's definition of the artifact |
| C-2 | **1. Scope and Purpose** — 1a define the context, 1b define the investor, 1c define the structure | Yes |
| C-3 | **2. Governance** — 2a who determines, executes and monitors policy; 2b the process for reviewing and updating the IPS; 2c responsibility for engaging and discharging external advisers; 2d responsibility for asset allocation including inputs and the criteria behind them; 2e responsibility for risk management, monitoring and reporting | Yes, with the adaptation below |
| C-4 | **3. Investment, Return and Risk Objectives** — 3a the overall objective, 3b return, distribution and risk requirements, 3c the investor's risk tolerance, 3d relevant constraints, 3e other considerations | Yes |
| C-5 | **4. Risk Management** — 4a performance measurement and reporting accountabilities, 4b metrics for risk measurement and evaluation, **4c the process for rebalancing portfolios to target allocations** | Yes — 4c is the canonical home for the learner's rebalance rule |

### The skeleton already fits the course

Every element has an OPS artifact behind it, which is the strongest argument for using CFA's
structure rather than inventing one:

| CFA element | Supplied by |
| --- | --- |
| 1b define the investor | Mission 1 — Investor Mandate |
| 3a overall objective, 3d constraints | Mission 1 |
| 3b return, distribution and risk requirements | Missions 4 and 5 |
| 3c risk tolerance | Missions 1 and 5 |
| 2d asset allocation responsibility and inputs | Mission 5 |
| 4a, 4b performance measurement and metrics | Missions 9 and 10 |
| Security selection and execution | Mission 12 |
| 2b review and update process | **Mission 13 — new** |
| 4c rebalancing process | **Mission 13 — new** |

Mission 13 therefore writes two elements the course has never produced, and compiles the rest.
That is a much better basis for the lesson than a generic "now write it all up" summary: only
2b and 4c are genuinely new work.

### Adaptation — governance for a solo investor

**C-3 assumes an institution.** An individual doing this alone is simultaneously the person who
determines policy, executes it, monitors it, and decides when to change it. OPS must not stage a
governance committee that does not exist, and must not imply the learner has or needs an adviser
(2c). What survives, and matters more for a solo investor than for an institution:

- **naming yourself as the responsible party**, explicitly, because the alternative is that no
  one is; and
- **2b, the review and update process** — the one governance element with real force here, since
  it is what stops a policy being rewritten in the middle of a market shock to justify a decision
  already made.

The mission states this adaptation on the page rather than silently dropping the section.

## Investor.gov — Beginners' Guide to Asset Allocation, Diversification, and Rebalancing

US Securities and Exchange Commission, Investor.gov. Cached 2026-08-13, 59,779 bytes.

| # | Claim | OPS usable? |
| --- | --- | --- |
| IG-1 | **Rebalancing is bringing your portfolio back to your original asset allocation mix.** It is necessary because some investments grow faster than others and drift out of alignment; rebalancing stops the portfolio overemphasising a category and returns it to a comfortable level of risk | Yes — the definition |
| IG-2 | Worked example: stocks set at 60% reach 80% after a market rise, so you sell some stock **or** buy into an under-weighted category to restore the mix | Yes — the regulator's own worked example, usable as-is |
| IG-3 | When rebalancing, also review the investments **within** each category and correct any that have drifted from their intended role | Yes — and it is what makes Mission 12's slate part of the review, not just the sleeve weights |
| IG-4 | **Three ways to rebalance:** sell from over-weighted categories and buy under-weighted ones; buy new investments into under-weighted categories; or, if contributing continuously, **steer contributions** toward under-weighted categories until balance returns | Yes — the third route is the one that avoids selling entirely |
| IG-5 | **Before rebalancing, consider whether the method will trigger transaction fees or tax consequences** | Yes — wires directly into the Mission 8 friction budget and S6-3 |
| IG-6 | Rebalancing **forces you to buy low and sell high**: cutting back current winners and adding to current losers is not easy but can be wise | Yes — the behavioural argument, from a regulator rather than OPS |
| IG-7 | **Two triggers.** Calendar-based — many experts suggest a regular interval such as every six or twelve months, and the calendar itself is the reminder. Or investment-based — rebalance only when a class's relative weight moves more than **"a certain percentage that you've identified in advance,"** so the investments tell you when | Yes — the shape of the rule, with the number explicitly the investor's own |
| IG-8 | **"In either case, rebalancing tends to work best when done on a relatively infrequent basis."** | Yes — and it is corroborated twice over by S36-8 and S6-3 |

### This, not Vanguard, is where the rebalancing rule comes from

The phase prompt forbids turning Vanguard's provider research into a personal threshold. That
constraint is comfortably satisfied, because **the regulator already supplies the rule's shape
and explicitly leaves the number to the investor**: IG-7 says the band is "a certain percentage
that you've identified in advance." So:

- **Method and trigger types** — Investor.gov (IG-4, IG-7).
- **The learner's own cadence or band** — OPS/personal policy, labelled as such on the page.
- **Vanguard** — supporting research on why rebalancing is a risk-control exercise rather than a
  return-seeking one. Never a recommended threshold, never a default the learner inherits.

IG-8 is the keystone of the operating plan. "Relatively infrequent" from the SEC, "activity
generates negative returns" from S36-8, and "keep trading to a minimum" from S6-3 are three
independent sources converging on the same instruction, and IG-5 supplies the reason it costs
money to ignore. A learner who wants to rebalance monthly is arguing with all four.

**Not carried:** the guide's suggestion to consult a financial professional or tax adviser.
OPS is educational and does not route learners to advice; the cost-and-tax *consideration* in
IG-5 is what survives.

## Investor.gov — investor preparedness checklist

Cached 2026-08-13, 43,534 bytes. Reviewed and found **thin for this mission**.

The page is a getting-started checklist: identify goals, create a plan, pay off high-interest
debt first, use the employer match, check that a professional is registered, understand risk
tolerance and fees, research investments, **check your investments regularly and maintain a
diversified portfolio**, avoid opportunities that sound too good to be true.

| # | Claim | OPS usable? |
| --- | --- | --- |
| IP-1 | Check your investments regularly and maintain a diversified portfolio | Yes — a regulator-sourced warrant for having *any* review cadence, though not for a particular one |

Everything else on the page belongs to Mission 1's readiness work and is already used there.
**The flight test's urgent-cash and income-loss scenarios are not sourced from here** — they
rest on S38-9 (unpredictable cash demands, forced liquidation loses long-term return) and S38-7
(perceived earning capacity in a downturn), which are stronger and specific to the decision the
learner has to make.

## Vanguard — "The rebalancing edge" (December 2024)

**Correction to this document's own earlier framing.** This source was provisionally described
as supporting research on why rebalancing is a risk-control rather than a return-seeking
exercise. Having read it, that is wrong in both halves, and the paper is far narrower than the
mission needs.

*The rebalancing edge: Optimizing target-date fund rebalancing through threshold-based
strategies.* Zhang, Ahluwalia, Daga and Zi, Vanguard research, December 2024. Cached
2026-08-13.

What it actually is:

- **The population is target-date funds**, not individual investors. It compares monthly,
  quarterly and threshold-based approaches **"commonly used by TDF providers"** and proposes an
  optimal policy for them.
- **The framing is partly return-seeking.** For a 60/40 portfolio it reports that threshold-based
  rebalancing is "expected to generate higher annual returns relative to calendar-based
  approaches due to reduced transaction costs," alongside lower allocation deviation.
- **The benefit is quantified for a TDF investor**: 15–22 bps a year during accumulation and
  22–25 bps during decumulation against monthly rebalancing; 5–8 bps and 6–10 bps against
  quarterly.
- **Tax does not appear in the cost model.** That is coherent for the population studied — a TDF
  rebalances inside the fund wrapper, so it creates no taxable event for the holder — and it is
  precisely why the result does not transfer.

### D3 — this source is quarantined to a single mechanism

An individual rebalancing a taxable account realises gains. The cost model that makes threshold
rebalancing optimal for a TDF provider **omits the largest cost the learner faces**, and the
provider also enjoys institutional execution and daily monitoring that the learner does not.
Carrying the 15–25 bps figures to a learner would be wrong on population, on cost structure and
on framing at once — exactly the failure the phase prompt names.

**Usable from this source: nothing quantitative, and nothing normative.** The one idea that
survives is that a rebalancing policy trades **transaction cost against allocation drift**, and
that idea is already carried by IG-5 and IG-7 from the regulator, in a form that leaves the
number to the investor.

**Mission 13 therefore does not cite Vanguard for the rebalancing rule at all.** Nothing is
blocked by this: the rule is fully supported by Investor.gov (IG-4, IG-7, IG-8) for shape and
trigger type, by S36-8 and S6-3 for why infrequency wins, and by the learner's own Mission 8
friction budget for what a rebalance actually costs them. The narrowing removes a source; it
does not remove a claim.

## IRS publications — locked, current, and deliberately not quoted

| Publication | Edition | Prepared | Cat. No. |
| --- | --- | --- | --- |
| Pub 550, *Investment Income and Expenses* | 2025 | 6-Mar-2026 | — |
| Pub 590-A, *Contributions to IRAs* | 2025 | 15-Jan-2026 | 13329Q |
| Pub 590-B, *Distributions from IRAs* | 2025 | 21-Jan-2026 | 63966F |

All three are the **current** editions for the 2025 tax year, cached 2026-08-13.

### D4 — the extracted text is column-interleaved and cannot be quoted

The PDF-to-text conversion reads across two columns, so consecutive lines splice sentences from
different columns together. Verbatim from the Pub 550 extraction:

> Example 1. You bought stock in 2012 for $100. In the stock. Whether you report the loss as a
> long-term or 2015, you received a nondividend distribution of $80. You short-term capital loss
> depends on how long you held the did not include this amount in your income, but you re- stock.

Two separate passages, interleaved line by line. **Any quotation drawn from this text risks
joining two unrelated sentences into one plausible-sounding claim**, which on a tax page is
exactly the kind of error that must not reach a learner.

**Consequence: Mission 13 quotes nothing from the IRS publications.** They are used for two
things only, neither of which requires reading the body text:

1. **Dating and identification** — naming the current edition so a learner knows which document
   to open and how current it is. The metadata above is from page headers and footers, not from
   the column-mangled body.
2. **As the pointer of record** — "how this is taxed depends on your circumstances; the current
   authority is IRS Publication 550 (2025)."

The directional warnings the mission actually makes are carried by sources that *are* reliably
readable: S6-3 (trading raises tax liability), S6-5 (consider the tax effect of trades), S6-6
(do not invest primarily to avoid tax) and S38-10 (different money is taxed differently, so
check). None of those is a rate, a threshold or a calculation, so none needs an IRS quotation.

**If a future gate needs verbatim IRS text**, the fix is to render the specific page through
Chrome's PDF viewer and read it visually — the same route used for the Damodaran decks, which
handles columns correctly. That work is not needed for this mission and has not been done.

This keeps Mission 13 inside the phase prompt's boundary by construction: no personal tax
liability is calculated, no account placement is recommended, and no eligibility rule is
asserted, because the mission never makes a claim specific enough to require one.

## SEC — order types and brokerage accounts

Both from Investor.gov / SEC, cached 2026-08-13. Unlike the IRS PDFs these extract cleanly and
**are quotable**.

| # | Claim | OPS usable? |
| --- | --- | --- |
| SEC-1 | A **market order** buys or sells at the best available price and generally executes immediately, but **the price is not guaranteed**. The last-traded price is not necessarily the execution price, and in fast-moving markets execution "often deviates from the last-traded price or 'real time' quote" | Yes — already used in Mission 12's rehearsal |
| SEC-2 | A large market order may execute **in parts at different prices** — the SEC's own example splits 1,000 shares between $3.00 and higher | Yes |
| SEC-3 | A **limit order** executes at a specific price or better — buy limits at or below, sell limits at or above — but is **not guaranteed to execute**, filling only if the market reaches the limit | Yes |
| SEC-4 | A **stop order becomes a market order once the stop price is reached** | Yes — and see below |
| SEC-5 | Brokerage firms generally offer a **cash account**, where you must pay the full amount for securities purchased, and a **margin account** | Yes, as description only. **No account recommendation, no placement advice** |

### SEC-4 is the sharpest claim for the crash scenario

A stop-loss order is the instrument a frightened investor reaches for, and the regulator's own
description is that **it converts into a market order at exactly the moment markets move
fastest** — inheriting every price risk in SEC-1 and SEC-2 precisely when those risks are
largest. That is a concrete, sourced answer to "should my policy include an automatic sell,"
and it belongs in the flight test's market-crash scenario rather than in a glossary.

It also closes a loop with Mission 11: a stop rule written into a *timing policy* is a stated
condition the learner checks, whereas a stop *order* is a standing instruction to a broker. The
mission must not let the two blur, because one is a decision rule and the other is an execution
mechanism with its own failure mode.

**Not carried from SEC-5:** anything resembling advice on which account type to open. The phase
prompt forbids universal account placement, and the distinction is carried only so the operating
plan can say that a plan written for a cash account is not automatically valid in a margin one.

## Claim coverage matrix — the nine flight-test scenarios

The phase prompt names nine scenarios. Each must be supported before it can be built; a scenario
with no canonical support is a `Blocked - source` condition. Prior-mission artifacts are listed
where the scenario tests the learner's own saved work rather than a source claim.

| # | Scenario | Canonical support | Reads from |
| ---: | --- | --- | --- |
| 1 | **Market crash** | S38-3 sleep test · S38-4 life change test · SEC-1, SEC-2 market orders carry unguaranteed prices · **SEC-4 a stop order becomes a market order** · S36-8 activity destroys return · IG-6 rebalancing forces buy low / sell high | Mission 5 weights, Mission 11 timing policy |
| 2 | **Income loss or job change** | S38-7 perceived earning capacity, and income that barely covers expenses forces a cash-tailored portfolio · S38-6 financial characteristics change, so choices must change | Mission 1 mandate, Mission 5 |
| 3 | **Urgent cash need** | S38-9 unpredictable withdrawals, personal crisis, forced liquidation loses long-term return, expected cash need shortens the horizon · S6-5 consider the tax effect of a sale · IG-4 the contribution route avoids selling | Mission 1 readiness, Mission 12 slate |
| 4 | **New contribution** | IG-4 route three — steer contributions to under-weighted categories · IG-5 fees and tax consequences · S6-3 keep trading to a minimum | Mission 5, Mission 8 friction budget |
| 5 | **Allocation drift** | IG-1 definition · IG-2 the 60%→80% worked example · IG-3 review within categories too · IG-7 calendar or threshold, number chosen in advance by the investor · IG-8 infrequent works best · S36-8 | Mission 5 weights, Mission 12 slate |
| 6 | **Thesis-breaking company or fund fact** | **S38-12 "foolhardy to stay consistent as the evidence accumulates against the philosophy"** · S1-2 a philosophy generates new strategies when old ones stop working | Mission 9 evidence test, Mission 10 thesis-break condition |
| 7 | **Stale product source** | Mission 12's holdings record: quarterly N-PORT is not live holdings, and its as-of date was 138 days old at retrieval · IG-3 | Mission 12 slate and its as-of dates |
| 8 | **Active Edge Licence expiry** | S36-13 the 25/25/25/25 no-continuity null · S36-2 transition probabilities close to random · **S36-3 25% of fourth-quartile funds merged or liquidated** — all carried as dated history under D1 | Mission 10 licence and review date |
| 9 | **Change conflicting with the original mandate** | S38-1 a philosophy that does not match your needs will fail · **S38-14 never mix contradictory assumptions** · S38-15 separate dominant from secondary · C-3 element 2b, the review process | Mission 1 mandate, every saved artifact |

**Every scenario is supported. No `Blocked - source` condition exists.**

Two observations worth carrying into Gate B:

- **Scenario 8 is the only one resting on quarantined figures.** Under D1 those percentages may
  appear only as dated history illustrating a mechanism. The mechanism — a streak tested against
  a 25% null — is what the learner applies, and it comes from Mission 10's own evidence test
  rather than from the 2005-era numbers.
- **Scenarios 1 and 9 are the assessment.** One tests whether the plan survives fear, the other
  whether it survives a good-sounding idea. Session 38 supplies both, and they are the two ways a
  written policy actually dies.

## Gate A status: **closed**

All four Damodaran sessions reviewed at claim level, the CFA IPS skeleton mapped onto existing
artifacts, both regulator sources reviewed and quotable, and the nine scenarios covered.

Four defects recorded, and in each case the mission narrowed rather than stopped:

| | Defect | Effect |
| --- | --- | --- |
| D1 | Session 36's performance percentages are dated | Carried as labelled history only; Mission 10's quarantine inherited unchanged |
| D2 | Session 6's dividend-versus-capital-gains rate premise is source-era | The rate comparison is not reproduced; the conditional shape survives |
| D3 | The Vanguard paper studies target-date **funds**, frames the benefit as higher returns, and omits tax from its cost model | Not cited for the rebalancing rule at all |
| D4 | The IRS extractions are column-interleaved and splice unrelated sentences | Nothing is quoted from them; they are cited for edition and as the pointer of record |

**Gate B is next:** the beat structure and prerequisite/practice/assessment matrix for the
Dossier and IPS compilation, the nine-scenario flight test, and the unfamiliar transfer case.
