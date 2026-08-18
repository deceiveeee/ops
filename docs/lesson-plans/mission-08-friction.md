# Mission 8: Count the friction

**Status:** built. Exact-math repair, browser stage path, and narrow-layout QA verified;
hard-refresh persistence, keyboard-only, and reduced-motion gates remain open.

**Artifact:** Friction Budget · **Target:** 35 min · **Spine id:** `pb-08`

**Why this mission exists and why it comes before mission 10.** Session 6 contains the
single most consequential number in the corpus: the average active manager trails the
market by about 1%, and if active trading adds nothing, that gap *is* the trading cost.
A learner who has not costed friction cannot honestly decide between a passive core and
an active sleeve — they will decide on hope. So friction is required, and it precedes the
architecture decision.

## 1. Edition and source lock

- Course: Aswath Damodaran, *Investment Philosophies*, 38-webcast sequence (2nd edition companion, Wiley 2012)
- Session: **6 of 38** — "Trading Costs and Taxes"
- Slides: `https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session6.pdf` — 22 physical pages
- Test and solutions: `https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz6.pdf` — 4 physical pages
- Narration: `https://www.youtube.com/watch?v=bUJUGsDQ16w` — 5,589 words

**Video identity warning.** That upload is titled *"Session 5: Valuation - The Basics"*
but contains the Session 6 trading-costs narration. The Session 5 and Session 6 uploads
are swapped. Verified by keyword analysis of the caption track — price impact ×21, tax
×38, bid-ask ×12, trading cost ×14, against zero hits for valuation, cash flow, discount
rate or perpetuity — and cross-checked against the deck. Recorded in
`scripts/source/manifest.json` under `anomalies`.

## 2. Sources actually reviewed

| Source | Coverage |
| --- | --- |
| Slides | 22 of 22 physical pages read, including the block-trade cost table and the Value Line chart |
| Test and solutions | All 5 questions, all answer choices, all explanations read |
| Narration | Full transcript reviewed; timestamps cited below |

Text extracted via `scripts/source/fetch-session.mjs`. This deck encodes ligatures onto
**real lowercase letters** (`d`=ft, `f`=tt, `p`=tf, `k`=tti), which no structural rule can
detect: it produced `ader`, `bofom`, `oden`, `befer`, `afention`, `porpolio`, `pukng`,
`quanFFes`. All were repaired and verified before this matrix was written. Notably
`market maker` was checked and left alone — a blanket rule would have turned it into
"market matter".

## 3. Source defects found

Both are mismatches between the printed test and its own solution. **Do not reproduce
either as-is.**

1. **Question 1, option (f).** The test reads "a small market-cap stock, with a low stock
   price and **lots** of analysts tracking it", which duplicates option (d). The solution
   marks (f) correct and reads "**few** analysts". The test as printed has no correct
   answer. OPS uses the solution's wording.
2. **Question 4, options (c) and (d).** The test offers "Momentum/Contrarian trading,
   based upon your judgment of value"; the solution replaces them with "Passive
   growth/value investing". OPS rewrites this item cleanly rather than merging editions.

## 4. Independently verified calculations

- **Trading-cost drag.** Return to an active manager = expected return for risk + return
  from active trading − trading costs. If active trading adds zero across all managers and
  they trail by ~1%, trading costs are ~1%. (Slide 3; narration 00:00:21–00:01:05.)
- **The compounding hurdle — the lesson's centrepiece.** Two-year horizon, 4% average
  spread, 10% required annual return after costs:
  - need after two years: $100 × 1.10² = **$121.00**
  - $100 buys only **$98.00** of shares after paying half the spread on entry
  - to net $121 after a 2% exit haircut, sell for $121 ÷ 0.98 = **$123.4694**
  - required pre-cost annual return = (123.4694 ÷ 98)^½ − 1 =
    **12.2449%**, or about **12.24%**

  Damodaran's published answer is **12.22%**. It approximates the exit reversal by
  multiplying $121 by 1.02, producing $123.42; exact bid/ask treatment divides by
  0.98. OPS displays the source approximation but assesses the independently verified
  12.24% result. The naive answer, 10% + 4%/2 = **12.00%**, also ignores compounding.
- **Spread by trading volume.** Top quintile by volume averaged 0.62% of price; bottom
  quintile averaged 2.06%. (Slide 8.)
- **Real assets.** Residential real-estate commission 5–6% of asset value; commodities
  lowest because units are standardised; art and collectibles highest. (Slide 18.)

## 5. Coverage matrix

Every claim the lesson makes, where it comes from, and what the learner must already know.

| OPS claim | Source location | Prerequisite | Status |
| --- | --- | --- | --- |
| Trading cost has four components: brokerage, bid-ask spread, price impact, cost of waiting | Slide 2 | none | source-authentic |
| Brokerage is the most visible and usually the smallest component | Slide 2 | none | source-authentic |
| Active managers trail by ~1%, which implies ~1% of trading cost | Slide 3; narration 00:00:21–00:01:05 | what an index return means | source-authentic |
| A paper portfolio and a real fund diverge once costs are real (Value Line) | Slide 4 | none | source-authentic |
| The spread compensates the dealer for inventory risk, order processing, and trading against informed investors | Slide 5 | none | source-authentic |
| Spread rises with illiquidity, risk, opacity, insider holdings; falls with price level and volume | Slides 6, 8 | none | source-authentic |
| Low-priced stocks carry a higher spread as a percent of price | Slide 8 | percentage-of-price reasoning | source-authentic |
| Damodaran publishes a 12.22% approximation for a 4% spread over two years; exact bid/ask arithmetic gives about 12.24%, not 12% | Quiz Q2 and solution; independent recalculation | compounding | source example with documented OPS correction |
| Price impact arises from illiquidity (temporary) and from information (persistent) | Slide 12; narration 00:01:25–00:02:02 | none | source-authentic |
| Price impact is worst for large investors in small-cap stocks | Slide 14; quiz Q3 | market cap | source-authentic |
| Strategies that must trade instantly, or that scale up, suffer most | Slide 15 | none | source-authentic |
| Waiting has a cost: the price may move away, or the opportunity may vanish | Slide 16; narration 00:18:53–00:19:10 | none | source-authentic |
| Waiting costs most on private information, in crowded markets, on short-horizon and momentum strategies | Slide 17 | momentum vs contrarian | source-authentic |
| Turnover drives the tax bite; longer holding periods and index funds reduce it | Slides 19–22; quiz Q5; narration 00:22:19–00:23:04 | none | source-authentic |
| Do not invest purely to avoid tax | Slide 22 | none | source-authentic |
| A provisional annual drag estimate assembled from clearly labelled illustrative scenario weights | — | all of the above | **OPS adaptation; not a measured cost or forecast** |
| The "beat this before you beat the index" rule | — | the provisional drag estimate | **OPS adaptation; mission 10 must treat it as an assumption to validate** |

US tax specifics are deliberately excluded here. Session 6's tax treatment is dated;
current rules live in mission 13 via IRS Publication 550, and the learner is told so.

## 6. Learner sequence

Introduce → model → guided practice → independent application → assessment. No stage
assesses an idea it has not already taught.

| Stage | Learner does | Teaches |
| --- | --- | --- |
| 1. Drag | Given the return decomposition and a 1% shortfall, infer what trading costs must be | Costs are the residual, not a footnote |
| 2. Spread | Pick the stock with the highest spread from four profiles | Price level, coverage and liquidity drive the spread |
| 3. Hurdle | Compute the exact pre-cost return needed at a 4% spread over two years and distinguish it from the source's approximation | Friction raises the bar you must clear, and exact entry/exit treatment matters |
| 4. Impact | Choose the investor/stock pairing with the worst price impact | Size interacts with liquidity |
| 5. Waiting | Choose the strategy most damaged by waiting | Patience is not free |
| 6. Taxes | Choose the holding period and fund type that minimise the tax bite | Turnover is a tax decision |
| 7. Budget | Assemble a personal Friction Budget and state the hurdle it implies | Friction becomes a number you own |

Stage 3 is the mission's hinge: the learner meets the naive 12% answer and Damodaran's
published 12.22% approximation, then uses the exact method to derive a roughly 12.24%
hurdle.

## 7. Artifact specification

`FrictionBudget`, stored at `ops-if-friction-budget-v1`, surfaced in the dossier:

| Field | Meaning |
| --- | --- |
| `turnoverExpectation` | How often the learner expects to trade |
| `spreadClass` | The liquidity band their intended holdings sit in |
| `priceImpactExposure` | Whether their size and targets create impact |
| `waitingSensitivity` | How much their strategy depends on trading promptly |
| `taxSetting` | Account type and intended holding period |
| `estimatedAnnualDrag` | Their provisional total from illustrative OPS scenario weights, in percent; not a measured account cost |
| `hurdleRule` | A sentence preserving that estimate boundary before mission 10 uses it |
| `updatedAt` | Save stamp |

## 8. Interaction design

Not prose with widgets. Each stage is a decision with a visible consequence:

- Stage 1 reveals the decomposition only after the learner commits to a number.
- Stage 3 is a live calculator: move spread and horizon, watch the exact pre-cost
  return move, with the naive figure shown alongside so the gap is visible. The source's
  published 12.22% approximation is labelled rather than silently repeated.
- Stage 4 uses the source's own block-trade cost table as a selectable matrix.
- Stage 7 assembles the learner's choices into the artifact and states the hurdle.

Reduced motion supported; no `font-mono`; sentence case.

## 9. Open items

- Mission 10 must read this artifact as a provisional learner estimate, not measured fact,
  so the friction assumption constrains rather than proves the edge decision.
- Browser-level hard-refresh persistence, keyboard-only, and reduced-motion QA remain open
  after the exact-math copy change. Desktop light-theme and 375px overflow checks passed.
