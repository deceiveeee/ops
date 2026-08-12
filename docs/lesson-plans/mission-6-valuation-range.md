# Mission 6 lesson plan: Estimate a valuation range

Status: ready for implementation

Target time: 50 minutes

Portfolio artifact: Valuation Range

## Portfolio decision

What is a sensible value range, what required return supports it, and what price would create a sufficient decision buffer?

## Learner promise

By the end of the mission, the learner will be able to explain why growth can destroy value, reject a low-multiple shortcut, and save a range-based buy/watch/avoid rule to the Portfolio Dossier.

## Learning objectives

The learner will:

1. Choose whether a valuation is for the whole business or only equity and pair the claim with the matching cash flow and discount rate.
2. Define intrinsic value as an estimate based on cash flow, growth, and risk.
3. Calculate a no-growth perpetuity and explain why a naive growing perpetuity overstates value when reinvestment is omitted.
4. Calculate reinvestment rate as growth divided by return on capital.
5. Explain with numbers why growth creates value only when return on capital exceeds cost of capital.
6. Define relative valuation and evaluate a low-P/E claim after controlling for cash flow, growth, and risk.
7. Produce a valuation range with a required return, price gap, decision buffer, and evidence triggers.

## Fresh-learner sequence

### Scene 1 — Price is the signal; value is the investigation (3 minutes)

- A smooth scan line passes across six dossier layers and locks onto Valuation.
- Direct definition: price is the market quote; value is an estimate of what the cash flows are worth under explicit assumptions.
- Concrete cause and effect: if required return rises while cash flow and growth do not change, present value falls.
- Learner sees the mission output before any formula: a range, not a single authoritative number.

### Scene 2 — Choose the claim before the math (7 minutes)

- Introduce firm value and equity value positively.
- Guided decision: route “cash flow after taxes and reinvestment but before debt payments” to the whole business.
- Model the consistent pairings:
  - FCFF → cost of capital → enterprise value.
  - equity cash flow → cost of equity → equity value.
- Immediate feedback explains why mixing claims creates a broken valuation.

### Scene 3 — Scan the four valuation pillars (5 minutes)

- Existing cash flow: what current assets produce after the spending needed to sustain them.
- Growth: future cash-flow change caused by new investment or better use of existing assets.
- Competitive period: how long excess returns can persist before maturity.
- Required return: compensation for time and risk, used as the discount rate.
- Each abstraction is followed by one event → cash-flow effect → investor implication example.

### Scene 4 — Model a no-growth business (6 minutes)

- Define a perpetuity before using the word.
- Guided calculation: `$120m / 10% = $1.2b`.
- Connect business value to equity value in an all-equity company.
- Explicitly state that a value estimate depends on the assumptions, not the number of rows in a model.

### Scene 5 — Growth gravity lab (12 minutes)

- Diagnostic reveal: applying 4% growth without reinvestment raises apparent value to `$2.0b`.
- Teach the missing cause: growth requires reinvestment.
- Learner scans three 4%-growth cases while the required return stays at 10%:
  - ROC 8% → reinvestment 50% → cash flow $60m → value $1.0b.
  - ROC 10% → reinvestment 40% → cash flow $72m → value $1.2b.
  - ROC 12% → reinvestment 33.3% → cash flow $80m → value $1.333b.
- The visual result is stronger than the control: growth visibly pulls value up only when return on capital clears the cost-of-capital line.
- Reduced-motion users get the same states without travel animation.

### Scene 6 — Peer scanner (6 minutes)

- Define P/E directly as price divided by earnings.
- Diagnostic: company P/E 10 versus peer median 15.
- Learner chooses whether that alone proves cheapness.
- Reveal the necessary controls: cash flow, growth, and risk.
- Correct conclusion: the clearest favorable case combines the lower multiple with higher growth and lower risk, all else equal.
- Add the source-authentic qualification that intrinsic and relative conclusions can disagree.

### Scene 7 — Build the Valuation Range artifact (7 minutes)

- Original OPS decision case, labeled as an adaptation:
  - observed market value: $1.1b;
  - defensible intrinsic range: $1.0b–$1.333b;
  - base value: $1.2b;
  - required return: 10%.
- Learner chooses a 5%, 20%, or 30% decision buffer and sees when the price clears the rule.
- Default 20% threshold: `$1.2b × (1 - 20%) = $960m`.
- At $1.1b the saved rule is Watch: below base value but above the buffered buy threshold.
- Saved evidence triggers:
  - downgrade if ROC falls below cost of capital;
  - revise if growth requires more reinvestment than modeled;
  - reject a peer comparison that does not control for growth and risk.

### Scene 8 — Independent mastery (4 minutes)

Five questions, pass mark 4/5:

1. Firm cash flow pairs with cost of capital.
2. All four intrinsic drivers affect value; this repairs source test item 1.
3. Growth creates value when ROC exceeds cost of capital.
4. Low P/E alone does not prove cheapness.
5. Intrinsic and relative valuation can disagree.

Completion requires the assessment pass. The artifact can be saved before or after the pass; passing marks the lesson complete.

## Transition logic

- Mission 5 ends with cash available to investors; Mission 6 asks what that cash is worth.
- Claim selection precedes formula selection because the cash-flow recipient determines the matching discount rate.
- The no-growth model precedes growth so the learner has a stable benchmark.
- The naive growth result is diagnostic and non-penalizing; the missing reinvestment concept is taught immediately afterward.
- Intrinsic valuation precedes relative valuation so the learner can recognize the same cash-flow, growth, and risk controls in both methods.
- The range builder comes last because it combines method, uncertainty, and the portfolio action rule.

## Interaction and accessibility requirements

- Buttons, scenario chips, and assessment controls must be keyboard reachable and have visible focus states.
- Every color-coded growth state must also have a text label and comparison symbol.
- No timed interaction.
- The scan line is decorative and hidden from assistive technology.
- `prefers-reduced-motion` removes travel animation without hiding content or state changes.
- All outputs use tabular figures in Inter; no monospace.
- Mobile order preserves definition → example → action → feedback.
- No horizontal page overflow at 320 CSS pixels.

## Theme requirements

- Use OPS semantic surfaces and text tokens; no hard-coded near-black lesson panel.
- Validate both light and dark themes.
- Amber represents assumptions/attention, green value-creating growth, red value-destroying growth, and cyan neutral model structure.
- Meaning never depends on hue alone.

## Assessment evidence map

| Assessed idea | Introduced | Modeled | Guided practice | Independent assessment |
| --- | --- | --- | --- | --- |
| Claim/cash-flow/discount-rate consistency | Scene 2 | Pairing map | Firm-cash-flow routing | Question 1 |
| Intrinsic value drivers | Scenes 1 and 3 | Four-pillar scan | Worked $120m model | Question 2 |
| Growth quality | Scene 5 | 8%/10%/12% ROC comparison | Scenario scan | Question 3 |
| Relative-value controls | Scene 6 | P/E 10 versus 15 | Peer conclusion choice | Question 4 |
| Method disagreement and uncertainty | Scenes 6 and 7 | Range artifact | Buffer selection | Question 5 |

## Depth deferred by design

The core mission does not ask a beginner to estimate a real company’s full WACC, multi-stage DCF, terminal value, employee-option value, or regression multiple. Those belong in the optional full-company valuation lab after the learner can apply the consistency rules safely.
