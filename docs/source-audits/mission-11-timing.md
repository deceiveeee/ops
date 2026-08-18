# Mission 11 — market timing policy: source audit

**Status:** Gate A in progress. Session 30 complete; Sessions 32, 33, 34 pending.

**Phase prompt:** `docs/agent-prompts/portfolio-builder/06-mission-11-timing.md`

**Approved source family:** Damodaran *Investment Philosophies* Sessions 30, 32, 33, 34.

## Source locks

| Session | Title | Slides | Quiz | Official captions | SHA-256 (slides) |
| --- | --- | ---: | ---: | --- | --- |
| 30 | Market Timing: Setting the table | 6 pp | 3 pp | yes — 545 cues | `b849d683…f17e9` |
| 32 | Market Timing Approaches: Mean Reversion & Macro Fundamentals | 13 pp | 3 pp | **none** | `471b369b…65065d6` |
| 33 | Market Timing Approaches: Valuing the Market | 14 pp | 4 pp | yes — 689 cues | pending |
| 34 | Market Timing: Does it work? | 17 pp | 4 pp | yes — 979 cues | pending |

Canonical URLs are `pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session{N}.pdf` and
`…/invphiltests/quiz{N}.pdf`, recorded with byte counts and hashes in
`.source-cache/provenance/session{N}.json`. Cached artifacts are never committed.

### Session 32 narration limitation — recorded per phase prompt

Session 32 has **no official caption track** (`captionStatus: "no-caption-track"`). Its
narration has not been reviewed and cannot supply claim-level citations. Any Mission 11
claim that would rest on Session 32 narration must instead rest on its canonical slides, or
be dropped. Local ASR for Session 32 is navigation-only evidence and is not citable.

### Tooling note

Neither poppler nor a working Python install is present on this machine, so the decks were
reviewed visually by rendering each page through Chrome's new-headless PDF engine via
Playwright. Old headless Chromium has no PDF viewer and silently downloads the file
instead — a fragment-only `#page=N` change also does not re-navigate the viewer, which
returns page 1 every time. Both were corrected before review.

## Session 30 — verified claims

Reviewed visually, all 6 pages, plus the complete official caption track and the quiz with
its solutions.

| # | Claim | Canonical location | OPS usable? |
| --- | --- | --- | --- |
| S30-1 | Asset allocation, security selection and market timing are the three steps of the investment process; timing is a tilt away from the allocation your risk aversion, horizon and tax status imply | Slide 2; narration 00:01:06–00:01:26 | Yes — this is Mission 11's framing: timing is a **deviation from the Mission 5 strategic allocation** |
| S30-2 | A 1986 study estimated as much as **93.6% of the variation in quarterly performance** at professionally managed portfolios was explained by the stock/bond/cash mix | Slide 3, bullet 1 | **Restricted — see defect D1** |
| S30-3 | Ibbotson, 94 balanced mutual funds and 58 pension funds, ten years through 1998: about **40% of the differences in returns across funds** from asset allocation, **60% from security selection** | Slide 3, bullet 2 | Yes, labelled as a historical study period ending 1998 |
| S30-4 | Shilling (1992): an investor who missed the **50 weakest months between 1946 and 1991** would have seen annual returns rise from **11.2% to 19%** | Slide 4; quiz 30 Q3 solution | Yes — must be labelled 1946–1991 and as hindsight-dependent |
| S30-5 | Sharpe (1975): unless you can tell a good year from a bad year **7 times out of 10**, you should not try market timing | Slide 5, bullet 1; quiz 30 Q4 solution ("about 70%") | Yes — the core break-even claim |
| S30-6 | Chua, Woodward and To: Monte Carlo on the Canadian market confirms you must be right **70–80% of the time to break even** from market timing | Slide 5, bullet 1 | Yes |
| S30-7 | Timing studies typically exclude transactions costs; a timer trades far more, and a stock/cash switch can mean liquidating the entire equity portfolio | Slide 5, bullet 2; narration 00:06:26–00:06:47 | Yes — connects directly to the saved Mission 8 friction budget |
| S30-8 | Timing raises tax liability because it realises capital gains that would not otherwise have been taken | Slide 5, bullet 3; narration 00:06:47–00:07:08 | Yes, as a directional warning only — **never** a personal tax calculation |
| S30-9 | Five families of timing approach: non-financial indicators, technical indicators, mean reversion, macroeconomic variables, fundamentals | Slide 6 | Yes — the taxonomy for the signal step |
| S30-10 | "The payoff if you're a good market timer is immense; the cost if you're a bad market timer is also immense" | Narration 00:07:27 | Yes — the symmetry Mission 11 must make visible |

### Defects and reconciliations

**D1 — the 93.6% statistic is stated two different ways, and only one is defensible.**

The slide says 93.6% of the variation in quarterly performance **at** professionally managed
portfolios. The narration at 00:03:24 says 93.6% of the variation in quarterly performance
**across money managers**. These are different questions. The first is a time-series result
— why a given portfolio's return moves quarter to quarter, which is dominated by market
exposure. The second is cross-sectional — why one manager differs from another — and the
slide's own next bullet answers it at roughly **40%**, not 93.6%.

Damodaran's own quiz makes the correction explicit: quiz 30 Q2's solution reads *"While an
early study suggested that almost all of the variation (>90%) came from asset allocation
differences, more recent studies suggest a more even break, with 40% from asset allocation
and 60% from stock picking."*

**OPS ruling:** never state or imply that ~93.6% of the differences between investors comes
from asset allocation. Where Mission 11 needs a number for why the mix matters, use S30-3
(40/60 across funds, through 1998). This is the misread the phase prompt warned about, and
the narration is the version that carries it.

**D2 — the caption track corrupts the Shilling figure.**

Narration 00:04:36 reads "…would have gone from about 11.2% to **9%**." The slide and the
quiz solution both say **19%**. A drop from 11.2% to 9% by avoiding the market's worst
months is also arithmetically backwards. This is an ASR digit loss, not a discrepancy in the
source. The canonical slide value **19%** governs; the caption is not citable for this claim.

**D3 — quiz 30 Q2 has no cleanly correct option.**

The solution describes "a more even break, with 40% from asset allocation and 60% from stock
picking." Option (e) reads "About half from security selection and half from asset
allocation" and option (c) reads "Mostly stock selection differences." A 40/60 split is
defensible as either. OPS will not reuse this item as written; if the idea is assessed, the
item must state the split numerically.

**D4 — quiz 30 Q3's solution rounds inconsistently.**

The solution says "from 11% to more than 19%"; the slide says "from 11.2% to 19%." OPS uses
the slide's **11.2% → 19%** and cites the slide, not the solution.

**D5 — quiz 30 Q1 is true only under an unstated condition.**

The official answer to "a good market timer would have generated higher annual returns than
a good stock picker" is **True**, explained by avoiding down periods. That is only true
*conditional on* being a good timer, which slides 4–5 establish is the hard part. OPS may
teach the payoff asymmetry (S30-10) but must not present Q1's bare framing to a learner
without the 70–80% break-even condition attached.

## Boundaries carried into the lesson

From the phase prompt and confirmed against the reviewed material:

- Historical timing relationships are period- and regime-specific. Shilling is 1946–1991;
  Ibbotson ends 1998. Neither is a live signal.
- Both Shilling's result and the "missed the best months" mirror depend on hindsight. The
  learner must see that the months are only identifiable after the fact.
- Nothing in Session 30 supports a speculative sleeve as a beginner default.
- "Wait until it feels safe" is not a neutral action — S30-4 and S30-5 together make the
  opportunity cost of being out explicit, in both directions.

## Session 32 — verified claims

Slides reviewed visually (13 pp). **No narration exists for this session**, so every claim
below rests on canonical slides alone. Prose slides were additionally cross-read against the
layout extraction; slides 3, 4, 5, 8, 10–13 are chart or table slides where the extraction
recovers a title and no data, and were reviewed only as rendered pages.

| # | Claim | Canonical location | OPS usable? |
| --- | --- | --- | --- |
| S32-1 | Mean-reversion timing assumes assets have a normal trading range and deviation from it signals mispricing; for stocks the range is defined on PE ratios, for bonds on interest rates | Slide 2 | Yes — defines "signal" for the lesson |
| S32-2 | Regressing annual change in treasury bond rates on the prior year-end level, 1970–1995: `Δ Rate(t) = 0.0139 − 0.1456 × Rate(t−1)`, **R² = .0728**, t-statistics 1.29 and 1.81 | Slide 5 | Yes — and the weak fit is the point, see F1 |
| S32-3 | Rules of thumb hold that it is best to buy stocks when T-bill rates are low, T-bond rates have dropped, or GNP growth is strong | Slide 7 | Yes — **only** as the claim to be tested, never as guidance |
| S32-4 | Sorted by change in T-bill rate, next-year stock returns were: drop >1% → 12 yrs, 66.67% up, **9.65%** avg; drop 0–1% → 28 yrs, 75.00%, **12.90%**; rise 0–1% → 28 yrs, 71.43%, **12.37%**; rise >1% → 15 yrs, 66.67%, **11.78%** | Slide 8 | Yes — see F2 |
| S32-5 | Breen, Glosten and Jagannathan (1989): switching between stock and cash on the level of the T-bill rate would have added about **2% in excess returns** to an actively managed portfolio | Slide 9 | Yes, with F3 attached |
| S32-6 | Abhyankar and Davies (2002), sub-periods 1929–2000: almost all predictability of stock returns from short rates comes from **1950–1975**, and short rates have had **almost no predictive power since 1975** | Slide 9 | Yes — the single most useful claim in this deck |
| S32-7 | Sorted by real GDP growth, next-year stock returns over 82 years were: >5% → 23 yrs, **10.04%**; 3.5–5% → 25 yrs, **13.38%**; 2–3.5% → 9 yrs, **14.08%**; 0–2% → 7 yrs, **−3.40%**; <0% → 17 yrs, **15.11%**; all years **11.16%** | Slide 13 | Yes — see F2 |

### Findings

**F1 — the mean-reversion regression is weak, on its own slide.** R² = .0728 means the prior
year's rate level explains about 7% of the variation in the next year's change, and both
t-statistics (1.29, 1.81) fall short of conventional 5% significance. The relationship exists
directionally but is not a dependable signal. Mission 11 should show the coefficient and the
R² together; presenting the coefficient alone would misrepresent the source.

**F2 — two canonical tables refute the rule of thumb printed two slides earlier.** Slide 7
lists "buy when T-bill rates are low / have dropped" and "buy when GNP growth is strong."
Slide 8 shows the *largest* rate drops produced the **lowest** average next-year return
(9.65%, versus 11.78% after the largest increases). Slide 13 shows the **highest** average
next-year return followed years of **negative** GDP growth (15.11%), while the worst followed
mild 0–2% growth (−3.40%), and the strongest growth years (>5%) returned 10.04%, below the
82-year average of 11.16%.

This is the best available material for the phase's required "a headline that does not meet
the written signal" scenario: the learner can hold a plausible macro headline against the
actual record and watch it fail. Cell sizes are small (7 and 9 years) and standard deviations
large (up to 29.84%), which must be shown — the lesson's point is that the differences are
not reliable, not that negative GDP growth is bullish.

**F3 — Breen/Glosten/Jagannathan must never be presented without Abhyankar/Davies.** S32-5 is
a "this worked" result; S32-6 establishes that the same class of signal drew almost all its
power from 1950–1975 and had almost none after 1975. Presenting the first without the second
would teach a live macro signal, which the phase prompt forbids. Paired, they are the
course's cleanest real example of a signal with an expiry — which is exactly the policy
element Mission 11 asks the learner to write.

**F4 — sample periods are not recoverable for the two headline tables.** Slides 8 and 13 give
year counts (83 and 82) but no explicit start or end year, and Session 32 has no narration to
supply one. OPS must present these as "an 82/83-year US sample, period not stated on the
source slide" rather than infer dates. This is a direct consequence of the missing caption
track and is the sharpest cost of that gap so far.

**F5 — source typo.** Slide 8's fourth row reads "Incrase more than 1%". Do not reproduce.

## Session 33 — verified claims

Slides (14 pp) plus the 689-cue official caption track.

| # | Claim | Canonical location | OPS usable? |
| --- | --- | --- | --- |
| S33-1 | The market can be valued with the same intrinsic (DCF) and relative (multiples) tools used on a single stock; a level below the model's output reads as undervalued | Slide 2 | Yes |
| S33-2 | Worked intrinsic valuation of the S&P 500 **as of 1 January 2011**: index at 1257.64; dividends plus buybacks 53.96; 5-year expected growth 6.95%; terminal growth 3.29% set equal to the risk-free rate; equity risk premium 5%; cost of equity 8.29%; beta assumed 1.0; **index value 1307.48** | Slides 3–4 | Yes, strictly as a dated worked example |
| S33-3 | Intrinsic models succeed more often as input quality improves and the horizon lengthens; markets do seem to revert to intrinsic value, but "eventually can be a long time coming" | Slide 5 | Yes — a core Mission 11 idea |
| S33-4 | There is a significant cost to acting on an intrinsic model that calls the market overvalued, because the logical next step is not investing in stocks | Slide 5 | Yes — the opportunity-cost half of the timeline |

**F6 — S33-2 is a 2011 snapshot and must never render as a current market view.** Every input
carries a 1 January 2011 date. It is usable as a worked mechanic; it is not a valuation of
any present market, and Mission 11 must not let a learner read it as one.

## Session 34 — verified claims

Slides (17 pp) plus the 979-cue official caption track.

| # | Claim | Canonical location | OPS usable? |
| --- | --- | --- | --- |
| S34-1 | Fund managers time implicitly through cash balances; tactical asset allocation funds do so explicitly | Slides 2–4 | Yes |
| S34-2 | Tactical asset allocation funds were beaten over the period shown both by 100% S&P 500 and by unmanaged "couch potato" 50/50 and 75/25 mixes | Slide 7 chart; narration 00:03:43 | Yes, with F7 |
| S34-3 | Updated studies find tactical funds can sometimes time markets, but the gain is wiped out because they are "so terrible at everything else in investing" | Narration 00:04:08 | Yes |
| S34-4 | Hedge funds show some timing evidence in bond and currency markets but **none in equity markets**; a study of 221 timing hedge funds found a few could time direction and volatility; funds that cut exposure ahead of illiquidity beat those that do not by **3.6–4.9% a year** risk-adjusted | Slide 9; narration 00:04:33–00:04:53 | Yes |
| S34-5 | Campbell and Harvey (1996), 237 investment newsletters, **1980–1992**: **183 of 237 (77%)** delivered lower returns than buy-and-hold. Equity weights rose **58%** of the time before upturns — and **53%** of the time before downturns. Bad timing advice persists more reliably than good | Slide 11 | Yes — the strongest single claim for the lesson |
| S34-6 | Chance and Hemler (2001): 30 professional timers monitored by MoniResearch did show timing ability, but calls were short-term and frequent — one timer made 303 signals between 1989 and 1994, about 15 per year across all 30 | Slide 13 | Yes, with the frequency and cost caveat attached |
| S34-7 | Sixteen named Wall Street strategists' same-date recommended mixes ranged from **50% to 80% stocks** and **0% to 25% cash** | Slide 15 | Yes — professional disagreement made concrete |
| S34-8 | Four timing strategies: adjust asset allocation, switch styles, rotate sectors, speculate with leverage or derivatives | Slide 17 | Yes |
| S34-9 | An all-or-nothing allocation switch — 100% equity when you think the market is cheap, 100% cash when you think it is dear — **increases the cost of being wrong** | Slide 18 | Yes — the canonical basis for requiring a bounded deviation |
| S34-10 | Kao and Shumaker: **perfect-foresight** style switching 1979–1997 would have returned 20.86% a year for large cap and 27.30% for small cap, against 10.33% across all stocks | Slide 20 | Yes, only if labelled perfect foresight |
| S34-11 | Speculation on market direction using leverage or derivatives is "a high risk, high return strategy" — right, you earn an immense amount; wrong, you could lose it | Slide 24 | Yes, as a warning |
| S34-12 | If your timing is undercutting your asset selection, you should abandon timing and focus on selection | Slide 27 | Yes — a clean stop rule |

### Findings

**F7 — S34-2 carries Damodaran's own caveat and OPS must carry it too.** At 00:03:43 he says
of his own chart, "I know this is unfair, you're saying it's one time period, it's a short
time." The chart slide states no date range. OPS presents this as one period's comparison,
never as a general law, and pairs it with S34-3, which is the durable version of the finding.

**F8 — the 5–10% speculative sleeve is rejected, as the phase prompt requires, and here is
the basis.** It appears **only in narration** (00:14:49: "maybe 5, 10% of your portfolio
dedicated to speculation"), never on a slide, and it is explicitly conditional — "if you're
right over time, more often right than wrong." Session 30 establishes what that condition
costs: Sharpe's 7-in-10 and the Chua/Woodward/To 70–80% break-even. A beginner has no basis
to assert that hit rate. Mission 11 will not offer a speculative sleeve as a default, an
option, or a suggested size.

**F9 — S34-5 is the lesson's centrepiece.** That newsletters raised equity weights 58% of the
time before upturns and 53% before downturns is the most legible demonstration in the whole
source family that a confident signal can be almost pure noise — a 5-point spread, from paid
professionals, across 237 newsletters and twelve years. It motivates the falsifier and review
date the mission asks the learner to write, and it does so without a single formula.

## Quizzes 32, 33, 34 — reconciled

Every numeric solution was recomputed independently rather than accepted.

| Item | Official answer | Independent check | Result |
| --- | --- | --- | --- |
| Q32-1 | 1760 | earnings 100 × 1.10 = 110; 110 × normal PE 16 = **1760** | agrees |
| Q32-2 | (e) more bonds, more stocks, less cash | conditional on believing in a normal range: high rates are more likely to fall; falling rates help bonds and help stocks more | agrees — but see F10 |
| Q32-3 | **False** | corroborates slide 8 | agrees, and see F11 |
| Q32-4 | most bullish (b) E/P 10% vs 5% bond; most bearish (c) E/P 5% vs 10% bond | E/P = 1/PE; (b) = 1/10 = 10%, (c) = 1/20 = 5% | agrees |
| Q32-5 | **False** | see F12 | agrees |
| Q33-1 | undervalued by 10% | 90 / (0.075 − 0.03) = **2000**; index 1800 is 10% below 2000 | agrees |
| Q33-3 | PE 20 | E/P = 0.02 + 0.75(0.04) = 0.05; PE = 1/0.05 = **20** | agrees |
| Q34-2 | (e) worse than both the market and fixed mixes | matches S34-2 | agrees |
| Q34-3 | (d) lower returns, with continuity stronger for bad timing | matches S34-5 | agrees |
| Q34-4 | (d) very short term and far too frequent | matches S34-6 (303 signals; ~15/yr per timer) | agrees |

**F10 — quizzes 32 Q2 and 32 Q3 will read as a contradiction unless the lesson separates
them.** Q2 asks what *follows if you believe* rates have a normal range, and its answer takes
mean reversion at face value. Q3 asks what the *record actually shows*, and its answer is that
there is none. Both are correct because they answer different questions — one is internal
consistency of a belief, the other is evidence for it. Mission 11 must never present them
adjacently without naming that difference; a learner who meets both cold will conclude the
course contradicts itself. This is a **Gate B hazard**, carried into the sequence below.

**F11 — Damodaran's own quiz states the rule of thumb is false, in words.** Quiz 32 Q3's
solution reads: *"Historically, there is no basis for this statement. Stocks seem just as
likely to go up in a year after short term interest rates go up as down."* This is stronger
and clearer than reading it off slide 8's table, and it is the citation Mission 11 should use
when the learner tests the T-bill signal.

**F12 — quiz 32 Q5 supplies the causal mechanism the slides omit.** Asked whether a strong
economy means stocks do well that year, the answer is False, because *"it depends on
expectations. If the market was expecting an even stronger economy, this would be a negative
surprise, leading to lower stock prices."*

This is the missing explanation for why the GDP table (S32-7) is non-monotonic: prices embed
expectations, so the *level* of growth is not the signal — the *surprise* is. Without it the
table looks like a curiosity; with it, the learner understands why macro rules of thumb fail
in general rather than memorising one table. It becomes the conceptual spine of beat 3 below.

## Gate A status: **closed**

All four decks reviewed visually, all available narration reviewed, all four quizzes
reconciled with every numeric solution independently recomputed. Every claim Mission 11
requires is canonically supported.

`Blocked - source` is **not** triggered. Two limitations are carried, not resolved: the
Session 32 sample periods (F4) and the Session 34 single-period chart caveat (F7).

## Open

- Gate B prerequisite/practice/assessment map.
- `docs/release-evidence/mission-11-timing.md` — created after Gate A closes.
- Gate B prerequisite/practice/assessment map.
- `docs/release-evidence/mission-11-timing.md` — not started; created after Gate A closes.
