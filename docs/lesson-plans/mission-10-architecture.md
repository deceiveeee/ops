# Mission 10: Choose passive, or prove an edge

**Status:** Gate A closed 2026-08-14 by approved narrowing; ready to implement.

**Artifact:** Architecture and Edge Decision · **Target:** 40 min · **Spine id:** `pb-10`

**Why this mission exists and why it comes after 8 and 9.** This is the decision the course
was reordered to make honest. Damodaran's sequence puts the catalogue of market-beating
strategies (sessions 9–29) before the learner has any means of judging it. Here, friction is
costed (mission 8) and the learner can test a claim (mission 9) *before* they are asked
whether they have an edge. The curriculum states the reason plainly: reversing this order is
how people talk themselves into active management.

It is also the state gate. Nothing researched in mission 6 or valued in mission 7 can become
a holding until the architecture is licensed here. `research-only watchlist → architecture
license`.

## 1. Edition and source lock

- Course: Aswath Damodaran, *Investment Philosophies*, 38-webcast sequence (2nd edition companion, Wiley 2012)
- Sessions: **35** (the case for passive investing), **36** (continuity and consistency),
  **7** (market efficiency I), **8** (market efficiency II), **6** (trading costs and taxes)
- All five decks, quizzes and official caption tracks are hashed in `.source-cache/`; hashes
  and page counts are recorded in `docs/source-audits/mission-10-architecture-edge.md` §1
- Narration: all five have official caption tracks and are **tier 2**. None is among the five
  narration-unreviewed sessions (5, 12, 24, 27, 32)
- Session 5/6 video identity is swapped upstream; the correct trading-cost narration is the
  upload labelled Session 5. Bind by reviewed content, never by upload title
- Current base rate: Morningstar Manager Research, *US Active/Passive Barometer: June 2026*,
  published 2026-08-06, data through 2026-06-30. Locked, 44 pages, SHA-256 `927a98be…d4cae`
- Risk-adjustment methodology: William F. Sharpe, ["The Sharpe Ratio"](https://web.stanford.edu/~wfsharpe/art/sr/SR.htm),
  Stanford, reprinted from *The Journal of Portfolio Management*, Fall 1994. Locked

## 2. The approved narrowing

Gate A was closed by **scope reduction, not source acquisition**. The S&P DJI U.S.
Persistence Scorecard was never obtained — `spglobal.com` returns HTTP 403 at host level,
including `robots.txt`, verified 2026-08-14.

**Out of scope.** Mission 10 makes no claim about what current persistence data shows. No
S&P number, chart, table, paraphrase, interaction state or assessment answer appears.

**In scope.** Persistence is taught as a *test*, not a scoreboard: Session 36's no-continuity
quartile null and Session 7's luck reasoning. This is a complete argument on its own — the
learner reaches "a streak is not skill" by reasoning, not by being shown a statistic.

**Binding on implementation.** The removed claim must stay **additive, never load-bearing**.
No stage, gate, calculation or assessment answer may depend on a current persistence figure,
so that obtaining the artifact later adds a citation rather than forcing a redesign.

## 3. Source defects found, and how each is handled

| Source | Defect | Treatment |
| --- | --- | --- |
| S35 Q1 | Bundles locality and concentration findings from dated literature | **Not used.** Never convert a locality or concentrated-portfolio anecdote into beginner sizing advice |
| S35 Q2–Q3, Q5 | Depend on dated performance literature | Not used. Current figures come from Morningstar with category, period and method attached |
| S36 Q3 | Three answer choices in the test, five in the solution | Replaced, not silently repaired |
| S36 Q5 | The question itself changes between test and solution | Replaced |
| S36 Q2 | Morningstar-rating predictive claim describes an old ratings design and a 2002–2005 study | Not assessed. Not presented as current |
| S8 deck p.14 | Reverses the dependent and independent variable labels | Already corrected in mission 9; the correction carries forward |
| S8 Q2 | Calls `average return / standard deviation` a Sharpe ratio, omitting the benchmark return | Not reused. Sharpe's official article controls the definition |
| S6 Q1, Q4 | Answer choices change between test and solution | Replaced |
| S6 Q2 | Uses `121 × 1.02` as an exit approximation | If used, exact method only: `121 / 0.98` |
| S6 Q5 | Dated, US-specific tax premise | Not used without current jurisdiction authority |
| Morningstar pp. 40–41 | Describes the passive hurdle as asset-weighted in one place and equal-weighted in others | Learner-facing copy may say only **"average investable passive peer."** Do not assert which weighting defines success |

## 4. Independently verified calculations

Each was recomputed here, not copied from the source solution or the audit.

- **Net alpha on the model proposal.** After-cost return `11% − 1% = 10%`. CAPM required
  return `3% + 1.2 × (9% − 3%) = 10.2%`. Alpha = **−0.2%**. A strategy two points a year
  ahead of the market destroyed value once risk and cost were both charged.
- **Break-even beta.** `3% + β × 6% = 10%` → `β = 7/6 =` **1.1667**.
- **Quartile null.** Four equal-probability quartiles → `1/4 =` **25%** per quartile.
- **Cost compounding (S35 Q4).** Index `1,000,000 × 1.08^10 = 2,158,924.997`; load fund
  `1,000,000 × 0.98 × 1.07^10 = 1,927,808.330`; gap **USD 231,117**. Stipulated inputs, not
  a forecast.
- **Morningstar large blend.** Asset-weighted ten-year annual returns `15.2% − 13.9% =` **1.3
  percentage points** favouring passive. This is **not** the 10.5% success rate; the success
  rate is the share of starting active funds that both survived and cleared the passive
  hurdle. The two must never be conflated in copy.
- **Fee quintiles.** Cheapest 33% vs priciest 20% = 13 percentage points. **Association
  only** — not a causal estimate of lowering fees.

All Morningstar figures are dated to 2026-06-30 and labelled high-decay wherever they appear.

## 5. Coverage matrix

| Claim | Source | Where it lands |
| --- | --- | --- |
| Passive is the evidence-based default when no net edge is validated; it is not proof nobody can win | S35 p.2, 00:23–01:03; S36 p.17, 14:47 | Stage 1 |
| Ten-year all-category success was 25%, survivorship included, through 2026-06-30 | Morningstar p.4; method pp. 39–41 | Stage 1 |
| Base rate is category-, horizon-, cost- and survivorship-specific | Morningstar pp. 3–7, 9–10 | Stage 1 |
| US large blend: 382 starting funds, 62.6% survival, 10.5% success; 13.9% vs 15.2% asset-weighted | Morningstar pp. 9–10 | Stage 1 |
| Cheaper active funds succeeded more often — association, not causation | Morningstar p.4; S36 pp. 9–14 | Stage 1 |
| Excess return is a joint result about the strategy *and* the risk model | S8 pp. 2–4; S7 pp. 6–7 | Stage 2 |
| Gross edge is not investable edge: fees, spread, impact, waiting, turnover and tax reduce it | S6 pp. 2–17; S35–36 | Stage 2 |
| Risk adjustment uses a defined differential return; a historic ratio is not a forecast | Sharpe, "The Ratio", "Time Dependence" | Stage 2 |
| Apparent winners can arise from luck; a streak is not skill | S7 pp. 6–7, 05:15–08:20 | Stage 3 |
| Under a no-continuity null each next-period quartile has probability 25% | S36 pp. 2–3; quiz Q1 | Stage 3 |
| An edge requires a specific pocket, a party who is wrong, a correction mechanism, tradability, capability, profit after friction and durability | S7 pp. 2–4, 8–10, 08:39–11:40 | Stage 4 |
| A fair test needs a benchmark, holdout, survivor-safe sample and economic significance | S8 pp. 2–4, 15–17 | Stage 4 (read from mission 9) |
| Active failure channels: cost, tax, over-activity, cash drag, style drift, herding, behaviour | S36 pp. 9–16; S7 pp. 11–13 | Stage 5 |
| Market efficiency is market-, investor- and cost-specific; price is an unbiased estimate, not a correct one | S7 pp. 2–4, 00:23–03:32 | Stage 1 definition panel |

## 6. Learner sequence

Per `AGENTS.md` — introduce → model → guided practice → independent application →
assessment. Six stages, each a screen.

1. **The default** (introduce). The learner's own mission 5 sleeves appear with passive
   implementation enabled and the active sleeve disabled. Defines active, passive, benchmark,
   investable passive peer, base rate. Morningstar's 25% is shown with denominator, date and
   survivorship visible — never as a bare percentage.
2. **A proposal that fails** (model). A worked active sleeve, persuasive on gross return,
   dies once the risk model and the learner's **own** friction number are charged. The
   learner commits to a verdict before the −0.2% alpha is revealed.
3. **Streak or skill** (guided practice). The learner predicts a three-year top-quartile
   fund's next quartile, then meets the 25% null. No current persistence statistic is used or
   needed.
4. **Build the license** (guided practice → application). The Architecture Switchboard. Each
   gate is a field; the UI names every unmet condition holding the sleeve disabled. Applied
   to the learner's own watchlist candidate, or a supplied practice candidate.
5. **An unfamiliar proposal** (independent perturbation). A fresh candidate with a winning
   streak the learner has not seen, and no hints. Enable or disable, and name the evidence
   that would reverse the decision.
6. **Decide and save** (assessment). A justified enable/disable decision. **A fully passive
   portfolio is a complete mastery outcome.**

Every assessed idea is introduced here or earlier. The friction figure comes from mission 8;
the CAPM arithmetic from mission 4; the evidence design from mission 9; the loss budget and
sleeve weights from mission 5.

## 7. Artifact specification

`ArchitectureDecision`, stored at `ops-if-architecture-decision-v1`, the eighth dossier
section.

| Field | Meaning |
| --- | --- |
| `mode` | `passive-only` or `active-sleeve` |
| `coreExposure`, `coreBenchmark` | The passive core and what it is judged against |
| `pocket`, `whoIsWrong`, `correctionMechanism`, `horizon` | The claimed inefficiency and how it resolves |
| `capability` | Why this learner could recognise and execute it |
| `falsifiableClaim`, `disconfirming` | The claim, and what would refute it |
| `baseRate`, `baseRateDate`, `baseRateScope` | Category base rate, dated and scoped |
| `evidenceDesign` | Inherited from mission 9's checklist |
| `grossEdge`, `frictionCost`, `netEdgeRange` | Friction from mission 8; a range, never false precision |
| `maxAllocation`, `lossContribution` | Inherited from mission 5's loss budget |
| `durabilityRisk`, `thesisBreak`, `reviewDate` | Imitation risk and the exit condition |
| `sourceDates`, `updatedAt` | High-decay stamps and save time |

`mode: passive-only` requires only the core, benchmark, base rate and review date. The sleeve
fields are required only when a sleeve is proposed.

**Invalidation.** Changing the mission 5, 7, 8 or 9 artifacts — or a high-decay source date —
marks this record and every downstream record `Review required`.

## 8. Interaction design

Not prose with widgets. Each stage is a decision with a visible consequence.

- **Stage 2** is the leakage visual: gross edge → risk-adjusted → net, with the learner's own
  friction number cutting the last segment. The bar crosses zero on screen.
- **Stage 3** makes the learner commit to a prediction before the null is shown.
- **Stage 4** is the switchboard: the sleeve is physically disabled, and every unmet
  condition is named beside it. No single field and no impressive number unlocks it.
- **Stage 5** withholds all hints and supplies an unfamiliar candidate.

**Implementation constraint.** Build the leakage and switchboard transitions with CSS
transitions and SVG, **not** `motion/react`. Verified 2026-08-14: the shared
`ValuationJourneyShell` declares two `useReducedMotion()`-gated effects and neither animates
at any preference (`initial={{opacity:0,x:18}}` never lands; `document.getAnimations()` is
empty). Until that is diagnosed, motion-library animation cannot be assumed to run.

Reduced motion supported; no `font-mono`; sentence case; 12px type floor; one hero per page;
each stage within 1.5 viewports at 390/768/1024/1280/1440/1920.

## 9. Non-goals

No recommendation of active management, and no implication that passive is always superior.
No undated empirical number. No promise of market-beating results. Past performance, ratings,
complexity, confidence and backtests are never treated as edge. An active sleeve may not
bypass mission 8 or 9. No watchlist candidate is promoted to an exact product — that is
mission 12. No live fund rankings or market APIs. No optional 22-session edge labs in this
phase.

## 10. Open items

- The dossier gains an eighth section.
- Spine `pb-10` flips from `planned` to `available` only once the lesson ships and browser QA
  passes; its `sourceGap` field is replaced with the narrowed-scope note.
- §3 of `portfolio-builder-mission-curriculum.md` lists mission 10 as **gated**; update to
  **built** when this ships, and record that the gate closed by narrowing.
- Mission 11 must read this artifact: a timing policy is meaningless without a licensed
  architecture to deviate from.
- The inert-motion finding is unresolved and is tracked separately.
