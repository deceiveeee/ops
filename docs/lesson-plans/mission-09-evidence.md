# Mission 9: Test the claim

**Status:** source gate passed; ready to implement.

**Artifact:** Evidence Test Checklist · **Target:** 35 min · **Spine id:** `pb-09`

**Why this mission exists and why it comes before mission 10.** Mission 8 told the learner
what acting costs. This one tells them how to know whether anything is worth paying that
cost for. Session 8 is the corpus's answer to "how would I know if this actually works?",
and without it the active/passive decision in mission 10 is a matter of taste. The order
is deliberate: cost the friction, learn the test, *then* decide whether you have an edge.
Reversing it is how people talk themselves into active management.

## 1. Edition and source lock

- Course: Aswath Damodaran, *Investment Philosophies*, 38-webcast sequence (2nd edition companion, Wiley 2012)
- Session: **8 of 38** — "Market Efficiency II: Testing market beating schemes and strategies"
- Slides: `https://pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session8.pdf` — 18 pages, 10,596 chars
- Test and solutions: `https://pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz8.pdf`
- Narration: caption track present and **reviewed** — this session is not one of the five
  (5, 12, 24, 27, 32) recorded as narration-unreviewed
- Modern methodology: William F. Sharpe, ["The Sharpe Ratio"](https://web.stanford.edu/~wfsharpe/art/sr/SR.htm),
  Stanford University, reprinted from *The Journal of Portfolio Management* (Fall 1994).
  This primary source controls the ratio's differential-return definition.

## 2. Sources actually reviewed

| Source | Coverage |
| --- | --- |
| Slides | 18 of 18 pages, including the low-PE excess-return table and both sin lists |
| Test and solutions | All 5 questions plus the bonus, all options, all explanations |
| Narration | Full transcript; timestamps cited in the coverage matrix |
| Sharpe methodology | Complete official Stanford article; definition and worked comparison reviewed |

## 3. Source defects found

Extraction artefacts in the slide text, repaired before use. None change meaning, but the
raw text must not be quoted as-is:

1. `dentify` → `identify` (step 1 of the event-study procedure)
2. `scaoer plots` → `scatter plots` (step 3 of the regression procedure)
3. `become increasing unwieldy` → `increasingly` (regression rationale)

One authorial inconsistency, left alone: the slides label the regression's return variable
"Independent variable" in step 1 and "Dependent variables" for the predictors in step 2 —
the two are transposed relative to standard usage. **OPS teaches it correctly** (returns are
the dependent variable; the strategy's variables are the independent ones) and says so
explicitly, rather than reproducing the slip or silently correcting it.

One methodological defect is corrected rather than reproduced: Session 8 and quiz question
2 divide total return by standard deviation and call the result a Sharpe ratio. Sharpe's
official Stanford article requires a differential return; with a risk-free benchmark this is
`(return − risk-free rate) ÷ standard deviation`. OPS shows a 3% illustrative risk-free
rate and identifies the correction in its source record.

## 4. Independently verified calculations

- **Sharpe comparison, corrected to the standard definition.** With the clearly labelled
  illustrative risk-free rate of 3%, strategy `(12% − 3%) ÷ 30% = 0.30`; market
  `(10% − 3%) ÷ 20% = 0.35`. The strategy *beat* the market on raw return and *lost* on
  excess return per unit of total risk. The verdict is unchanged, but the source solution's
  0.40 and 0.50 are not standard Sharpe ratios and are not reproduced.
- **Risk- and cost-adjusted excess return.** Expected return = 3% + 1.2 × (9% − 3%) =
  10.2%. Realised after costs = 11% − 1% = 10.0%. Excess = **−0.2%**. Matches the solution.
- **Break-even beta.** 3% + β × 6% = 10% → β = 7/6 = **1.1667**. Matches the bonus answer.
- **Extreme-portfolio spread.** Low-PE 2.61% versus high-PE −1.95% over 1988–1992 →
  **4.56%**. Matches the slide's own arithmetic.
- **Option-listing event study.** Cumulative excess return ≈ 1.8% across the 21-day window,
  ≈ 1.34% from day 0 — the only part a learner could actually have traded. Narration
  [00:13:15]–[00:13:39]. t-statistics marginal; the study does not establish a tradable edge.

All five are dated historical evidence and are labelled as such wherever they appear. No
live market data.

## 5. Coverage matrix

| Claim | Source | Where it lands |
| --- | --- | --- |
| Any test of efficiency is a joint test of efficiency and the risk model | Slides p.1; narration [00:00:45] | Stage 1 |
| Beating an index unadjusted is not a fair test at unequal risk | Narration [00:01:27]–[00:01:49] | Stage 1 |
| Sharpe = (return − risk-free rate) ÷ σ; Information = (return − index) ÷ tracking error | Sharpe (1994), "The Ratio" and "Related Measures"; Damodaran slides p.2 and narration [00:02:33] supply the comparison context | Stage 2 |
| Jensen's alpha = actual − CAPM expected; Treynor = (return − rf) ÷ β | Slides p.2; narration [00:03:39] | Stage 2 |
| Every performance measure has a bias active managers can exploit; use several | Narration [00:06:50]–[00:07:14] | Stage 2 |
| Event study: four steps, announcement date not event date | Slides pp.4–5; narration [00:08:23] | Stage 3 |
| Statistical significance (t > 2) is not economic significance | Slides p.5 | Stages 3, 7 |
| Portfolio study: five steps; classify at the *start* of the period | Slides pp.7–8 | Stage 4 |
| Low-PE 1988–92: 4.56% spread between extreme portfolios | Slides p.9 | Stage 4 |
| Regression: needed when variables multiply and within-class spread matters | Slides p.10 | Stage 5 |
| Six cardinal sins | Slides p.12 | Stage 6 |
| Four lesser sins: data mining, survivor bias, costs, execution | Slides p.13 | Stage 6 |
| Skeptic's guide: testable, fair, economically significant, tried before | Slides p.14 | Stage 7 |

## 6. Learner sequence

Per `AGENTS.md` — introduce → model → guided practice → independent application → assessment.

1. **The joint test** (introduce). A strategy shows excess returns under CAPM. What follows?
   The answer is *any of the above*: it beat the market, or the model is wrong, or beta was
   misestimated. Establishes that every later stage is testing two things at once.
2. **Pick the yardstick** (model). Sharpe, Information, Jensen, Treynor — what each controls
   for. Guided: with a visible 3% illustrative risk-free rate, `(12 − 3)/30 = 0.30`
   against `(10 − 3)/20 = 0.35`, where raw return and risk-adjusted return disagree.
3. **Event study** (guided practice). The four steps on the option-listing case; read the
   cumulative excess return column; separate pre-announcement drift, announcement jump, and
   post-announcement drift, and say what each implies.
4. **Portfolio study** (guided practice). The five steps on low PE; compute the extreme
   spread; name what the 4.56% does *not* establish.
5. **Regression** (guided practice). When portfolios stop being enough; which variable is
   dependent; what R² and t-statistics do and do not tell you.
6. **The sins** (independent application). Six cardinal, four lesser. The learner picks the
   defensible sampling design for a small-cap/low-institutional-holding claim — the survivor
   bias question, where three of four answers look reasonable.
7. **The checklist** (assessment). Apply the economic-significance test using the learner's
   own friction number from mission 8, then write and save the Evidence Test Checklist.

Every assessed idea is introduced in this mission or an earlier one. The cost figure in
stage 7 comes from mission 8's Friction Budget; the required-return arithmetic comes from
mission 4's Required Return Lens.

## 7. Artifact specification

`EvidenceChecklist`, stored at `ops-if-evidence-checklist-v1`, surfaced in the dossier:

| Field | Meaning |
| --- | --- |
| `benchmark` | The risk-adjusted measure this learner will judge a claim by |
| `testDesign` | Event, portfolio, or regression — and why that one fits their claim |
| `holdoutRule` | The period or universe held back from the one the idea came from |
| `samplingRule` | How the sample is formed so survivors are not the only members |
| `hurdleRule` | The return the claim must clear after risk and after their own friction |
| `abandonRule` | What result would make them drop the claim |
| `updatedAt` | Save stamp |

## 8. Interaction design

Not prose with widgets. Each stage is a decision with a visible consequence:

- Stage 2 shows raw return and risk-adjusted return disagreeing on the same strategy, and
  makes the learner commit to a verdict before revealing both Sharpe ratios.
- Stage 3 is a readable event window: the learner assigns a cause to each of the three
  segments before the interpretation appears.
- Stage 4 hands over the actual 1988–92 table and asks for the extreme spread as a number.
- Stage 7 is a live calculator seeded with the learner's saved friction number, showing the
  claim's excess return going negative once risk and costs are both charged.

Reduced motion supported; no `font-mono`; sentence case; 12px type floor.

## 9. Open items

- Mission 10 must read this artifact alongside the Friction Budget: an edge claim that
  fails either one is not an edge.
- The dossier gains a seventh section.
- Spine `pb-09` flips from `planned` to `available` only once the lesson ships and its
  browser QA passes.
- §3 of `portfolio-builder-mission-curriculum.md` still lists missions 8 and 9 as **ready**;
  update both to **built** when this ships.
