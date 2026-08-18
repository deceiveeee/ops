# Mission 5 — Allocation and loss-budget policy

**Status:** Gate A passed and the Gate B/C specification is complete. Current rendered
implementation verification and decision are recorded in
`docs/release-evidence/mission-05-allocation.md` (`Blocked - implementation` while final
browser and production-build evidence remains open).

**Curriculum authority:**
`docs/lesson-plans/portfolio-builder-mission-curriculum.md`

**Workbench authority:**
`docs/lesson-plans/portfolio-builder-guided-workbench.md`

**Implementation prompt:**
`docs/agent-prompts/portfolio-builder/03-mission-05-allocation.md`

This plan does not itself clear Mission 5 for release. Gate A passed in
`docs/source-audits/mission-05-allocation.md`; this plan fixes the novice sequence,
interaction, examples, assessed-idea trace, and acceptance rules so the implementation can
be checked against the approved source boundary and learning design. The release-evidence
ledger records the completed implementation checks.

## 1. Decision and learner promise

Mission 5 answers one question:

> How much goes where, and what loss is unacceptable for this mandate?

The learner finishes with strategic sleeve weights that total 100%, a liquidity bucket,
target ranges, an inspectable stress-loss calculation, and an optional candidate ceiling
derived from a stated position loss budget. The output is a policy to explain and review,
not a personalized recommendation, forecast, guarantee, or mathematical optimum.

The mission has two prerequisites:

1. a valid Mission 1 mandate/readiness record for the selected personal or practice mode;
2. a fresh, unaided pass of the non-penalizing portfolio-theory Preflight.

Existing Mission 1 completion credit remains intact. A migrated learner missing new
readiness fields completes the short Readiness Runway bridge; no learner is sent back to
repeat the existing Mission 1 journey.

## 2. Vocabulary contract

Define these before the learner must use them:

| Term | Required direct definition | Immediate concrete example |
| --- | --- | --- |
| Risk capacity | The financial ability to absorb a loss without disrupting required spending, debt payments, or a stated goal. | A tuition payment in 18 months lowers capacity because a market loss could leave too little cash when the bill arrives. |
| Risk willingness | The amount of price fluctuation and temporary loss the investor is prepared to experience while following a written plan. | Two people with the same ten-year horizon can choose different volatility because one would abandon the plan during a large decline. |
| Liquidity bucket | Money assigned to near-term or required spending and kept in an asset compatible with the date and reliability of that need. | A $6,000 payment due next year belongs in the liquidity bucket rather than depending on equities being up on that date. |
| Sleeve | A broad portfolio role grouped by its job, such as liquidity, stability, or long-term growth. | A bond sleeve may dampen some equity risk; it is not an individual bond recommendation. |
| Strategic weight | The long-run target percentage assigned to a sleeve under the current mandate. | A 40% sleeve in a $50,000 practice portfolio represents about $20,000. |
| Target range | An allowed interval around a strategic weight that identifies meaningful drift without pretending a single percentage is exact. | A 35% target with a learner-owned 30–40% range is reviewed outside that range; the range itself is not a universal rule. |
| Stress assumption | An explicit hypothetical loss applied to a sleeve to examine consequences; it is not a forecast or worst-case bound. | Applying a 40% equity loss asks what the portfolio would lose if that scenario occurred. |
| Loss contribution | The percentage-point portfolio loss attributable to one sleeve under the selected stress: `sleeve weight × assumed sleeve loss`. | A 50% equity weight under a 35% equity loss contributes 17.5 percentage points to portfolio loss. |
| Concentration | Exposure whose outcome depends too heavily on one issuer, sector, employer, strategy, or closely related group. | Employer stock plus job income can make one company affect both wealth and income. Categories remain an OPS diagnostic unless Gate A supplies canonical support. |
| Candidate position ceiling | A maximum weight calculated from a learner-selected portfolio-loss contribution and an explicit assumed position loss. | A 2% maximum portfolio-loss contribution divided by a 40% assumed position loss yields a 5% candidate ceiling. This is an OPS/learner policy, not a regulator's rule. |
| Efficient frontier | The model-estimated set of portfolios with the highest expected return for each modeled volatility, given the inputs and constraints. | Changing expected returns or correlations can move the frontier; it cannot choose a personally suitable portfolio by itself. |

Use **stress loss**, not “maximum drawdown,” for the lesson calculation. A simple
scenario is not a forecast of peak-to-trough market drawdown.

## 3. Readiness Runway bridge (Mission 1 dependency)

This is a non-penalizing prerequisite bridge owned by the Mission 1 mandate checkpoint.
It appears only when the selected mode lacks the new readiness fields.

### R0 — Choose the equally complete path

Offer **Build mine** and **Practice case** with equal visual weight and identical later
assessment standards. Personal mode asks for approximate values or ranges and states that
information remains local. Practice mode supplies all facts for a fictional learner.

Changing modes preserves both records. It never copies personal data into the practice
record.

### R1 — Name the goal and its clock

Collect goal, target-date band, expected contributions, planned withdrawals, and near-term
cash needs. Use date/range chips plus editable plain-language fields. Do not request exact
account identifiers or documents.

Visible result: a timeline divides **needed soon** from **available for longer-term risk**.
It never predicts whether the goal will be achieved.

### R2 — Protect the runway

Collect the learner-selected emergency-reserve target and current state, high-interest-debt
status, and an employer-match flag where relevant. “I do not know yet” is a valid answer
that creates an action-plan item rather than invented precision.

No universal reserve amount or interest-rate threshold is scored. A gap routes personal
mode to **Personal constrained** and preserves the full paper-learning path.

### R3 — Separate ability from willingness

Use two parallel semantic choice groups:

- capacity: could a substantial temporary loss disrupt required spending or liabilities?
- willingness: could the learner follow the written plan through substantial volatility?

Model the causal difference: a new job loss or cash obligation lowers capacity even if the
person's emotional willingness does not change.

### R4 — Authority and deployment flags

Collect broad jurisdiction, age/earned-income relevance, and account-authority flags only.
These are prompts for verification, not legal conclusions. Missing authority, uncertainty,
or a readiness gap creates **Practice only** or **Personal constrained**; education never
locks.

### R5 — Life-change check and save

Independent item: “Jordan still likes market risk, but a job loss makes $12,000 necessary
within nine months. What changed?” Correct response: capacity and the liquidity need
changed; willingness may be unchanged. The learner must move the near-term amount out of
risky capital or choose the practice route, then explain why.

Save one route:

- **Personal deployment available** — no recorded readiness blocker, still not advice or
  authorization;
- **Personal constrained** — paper portfolio plus named deployment action plan;
- **Practice only** — complete fictional portfolio.

## 4. Mission 5 scene sequence

### Scene 0 — Hero: the portfolio before products

Use a near-full-screen **portfolio constellation** that begins as three unlabeled masses
and resolves into the jobs **Ready**, **Steady**, and **Grow**. One sentence dominates:

> Allocation gives every dollar a job before any product gets a name.

Show the imported goal, time horizon, readiness route, capacity, and willingness as a small
mandate ribbon. The primary action is **Run preflight**. No ticker, expected-return promise,
or recommended allocation appears.

### Scene 1 — Preflight (diagnostic, non-penalizing)

Label the scene exactly **Preflight — this does not affect your score**. Give four items,
each with **I don't know yet**:

1. Two volatile assets that do not always move together can have lower combined volatility
   than either weighted-average intuition suggests. Which relationship matters? Correct:
   how their returns move together (covariance/correlation), alongside weights and each
   asset's volatility.
2. If more assets are added, does loss become impossible? Correct: no; diversification can
   reduce asset-specific risk, while common/systematic risks remain.
3. Does the efficient frontier select the right portfolio for this learner? Correct: no;
   it describes an estimate-based opportunity set, while goals, liquidity, capacity, and
   willingness determine fit.
4. Are expected return, volatility, correlation, and a tangency portfolio known facts?
   Correct: no; they depend on estimates and assumptions.

Any miss opens a 4–7 minute bridge that defines, models, and practices only the missed
relationship using already source-gated Finance Foundations material. Link to the full
lessons for depth. After the bridge, require one fresh unaided isomorphic item. Mission 5
remains locked until all four relationships pass; no covariance matrix or convex-
optimization notation is required.

### Scene 2 — Introduce: four truths on one canvas

Use one sticky canvas with short scroll-linked reveals:

1. the goal clock reserves the liquidity bucket;
2. capacity and willingness remain separate tracks;
3. strategic weights describe broad roles, not exact securities;
4. stress assumptions turn weights into inspectable loss consequences.

Introduce all vocabulary in Section 2 here. Motion should draw causal connections, not
decorate. Reduced motion shows four discrete, fully labelled states.

### Scene 3 — Model: Mina's $40,000 practice portfolio

Facts supplied:

- goal: long-term flexibility in more than seven years;
- required near-term cash: $8,000 already assigned to an expense;
- readiness route: practice case;
- capacity: moderate;
- willingness: comfortable following a written plan through volatility;
- teaching sleeves: 20% liquidity, 30% stability, 50% growth;
- teaching stress: liquidity 0%, stability −10%, growth −35%.

Reveal in decision order, never all at once:

| Sleeve | Weight | Approx. dollars | Stress assumption | Portfolio loss contribution |
| --- | ---: | ---: | ---: | ---: |
| Liquidity | 20% | $8,000 | 0% | 0.0 pp / $0 |
| Stability | 30% | $12,000 | −10% | 3.0 pp / $1,200 |
| Growth | 50% | $20,000 | −35% | 17.5 pp / $7,000 |
| **Total** | **100%** | **$40,000** | — | **20.5% / $8,200** |

Narration: the liquidity amount matches the known $8,000 need; the stress loss is the sum
of sleeve contributions; it is a transparent hypothetical, not a forecast, guarantee, or
claim that worse loss is impossible. Show one nearby alternative to demonstrate that
multiple coherent policies can fit the same facts.

Then model the position-ceiling equation separately:

`2% allowed portfolio-loss contribution ÷ 40% assumed position loss = 5% candidate weight`

On $40,000, 5% is $2,000. Label both inputs **learner/OPS policy** and the output **candidate
ceiling**, with an “I don't know yet” route. Never display it as a suitability rule.

### Scene 4 — Guided repair: three faults, one at a time

Use a **loss-budget scanner** across the allocation. Each repair changes a meaningful
financial consequence; the strongest visual is the repaired timeline/loss path, not the
control.

1. **Weight integrity:** 20% + 30% + 55% = 105%. Learner reduces one or more sleeves until
   the total equals 100%; show over-allocation as dollars assigned twice.
2. **Liquidity mismatch:** $30,000 portfolio, $9,000 required in twelve months, only 20%
   ($6,000) in the compatible liquidity bucket. Learner must make the bucket at least 30%
   ($9,000), with plain-language cause and effect.
3. **Stress concentration:** $50,000, 10% liquidity at 0%, 20% stability at −10%, 70%
   growth at −40%. Contributions are 0, 2, and 28 pp; total stress loss is 30% or $15,000.
   The case budget is 22%. Learner reallocates from growth and watches the contribution
   change. One valid example is 20% / 35% / 45%: 0 + 3.5 + 18 = 21.5%, or $10,750. Do not
   prescribe a unique target; accept any 100% allocation at or below 22% when the learner
   explains the trade-off.

Hints first point to the affected relationship; only the final hint shows arithmetic.

### Scene 5 — Apply: build the learner's policy

Personal and practice modes use the same controls and checks. Seed nothing as a
recommendation. Offer an optional fictional specimen and blank learner-owned starting
point.

Use a three-role constellation with synchronized controls:

- direct numeric percentage inputs;
- increment/decrement buttons;
- optional drag handles with no exclusive functionality;
- approximate-dollar toggle using a learner-chosen or fictional amount;
- target-range inputs;
- scenario chips that clearly state every sleeve stress assumption;
- an editable learner-owned loss budget;
- optional candidate position-ceiling builder.

Every edit updates a table and a plain-language sentence: **What changed? Why it matters?
What will need review?** Announce only committed changes or validation states, not every
pointer movement. Save remains disabled while the total is invalid, the known near-term
need is uncovered, an input is non-finite/negative, or stress ownership is hidden.

### Scene 6 — Independent perturbation: the mandate changes

No hints. Use this exact unfamiliar case:

- $60,000 practice portfolio;
- saved allocation: 10% liquidity, 35% stability, 55% growth;
- stress assumptions: 0%, −8%, −40%;
- new fact: a $15,000 required payment moves to eleven months away;
- willingness is unchanged;
- case loss budget: no more than 20% under the stated teaching stress.

Before repair, contributions are 0 + 2.8 + 22.0 = **24.8%**, or **$14,880**. A valid
illustrative repair is 25% liquidity, 35% stability, 40% growth: 0 + 2.8 + 16.0 = **18.8%**,
or **$11,280**. Accept any allocation that:

- totals 100% within the documented tolerance;
- assigns at least $15,000 (25%) to the compatible bucket;
- produces no more than 20% stress loss under the supplied assumptions;
- states that capacity/liquidity changed while willingness did not necessarily change.

The learner must identify that Mission 5 and its downstream architecture, timing,
products, orders, flight test, operating plan, and IPS require review after the mandate
change.

### Scene 7 — Assessment and save

Use a fresh case with no hints:

- $80,000 portfolio;
- $12,000 is required within one year, so the compatible liquidity minimum is 15%;
- supplied teaching stress: liquidity 0%, stability −12%, growth −40%;
- stated stress-loss budget: 25%;
- capacity and willingness are recorded separately.

Ask the learner to select the coherent policy and explain why:

| Option | Weights (liquidity / stability / growth) | Result |
| --- | --- | --- |
| A | 15% / 35% / 50% | **Correct:** totals 100%, covers $12,000, loss = 4.2 + 20 = **24.2% / $19,360**. |
| B | 15% / 25% / 60% | Totals/covers liquidity, but loss = 3 + 24 = **27.0% / $21,600**, over budget. |
| C | 10% / 40% / 50% | Loss = 4.8 + 20 = **24.8%**, but $8,000 liquidity misses the $12,000 need. |
| D | 15% / 35% / 55% | Totals **105%** and loss is 26.2%; capital is assigned twice. |

Then require one position-ceiling calculation: a learner permits at most 1.5 percentage
points of portfolio loss from one position and assumes that position could lose 50%.
Correct candidate ceiling: `1.5% ÷ 50% = 3%`, or **$2,400** of $80,000. The correct
explanation must say it is learner/OPS policy based on a hypothetical loss, not a regulator
threshold or guarantee.

Saving assembles **Allocation and Risk Policy** only after both items pass. Celebration is
for a coherent, independently demonstrated policy, not for clicking Save.

## 5. Assessed-idea trace

| Assessed idea | Introduced | Modelled | Guided practice | Independent/assessment evidence |
| --- | --- | --- | --- | --- |
| Capacity differs from willingness | Readiness R3; Scene 2 | Mina facts | liquidity repair explanation | Scene 6 job/cash change explanation |
| Weights must total 100% | Scene 2 | Scene 3 | Scene 4.1 | Scene 7 option D |
| Near-term need requires a compatible bucket | R1; Scene 2 | $8,000 Mina match | Scene 4.2 | Scene 6 and Scene 7 option C |
| Diversification changes risk but cannot remove all loss | Preflight items 1–2 | Scene 3 contribution table | Scene 4.3 | Preflight fresh item and Scene 7 reasoning |
| Frontier/model outputs depend on estimates and do not select personal fit | Preflight items 3–4 | Scene 2 canvas | Preflight bridge | fresh unaided Preflight item |
| Stress loss is transparent and assumption-owned | Scene 2 | Scene 3 | Scene 4.3 | Scenes 6–7 arithmetic/explanation |
| Loss contribution equals weight × assumed loss | Scene 2 | Scene 3 | Scene 4.3 | Scene 7 options A/B |
| Position ceiling is derived policy, not regulation | Scene 3 | 2% ÷ 40% model | optional builder in Scene 5 | 1.5% ÷ 50% assessment |
| Upstream mandate changes require downstream review | Workbench explanation in Scene 5 | consequence ribbon | save preview | Scene 6 dependency identification |

## 6. Semantic controls and Apple-level hierarchy

- One dominant question and one primary action per scene. Advanced assumptions live behind
  progressive disclosure but the current stress inputs and ownership never hide.
- Use large Fraunces editorial headings sparingly; use Inter and tabular numerals for all
  inputs, tables, and explanations. No monospace and no wide uppercase labels.
- The constellation is the memory anchor: sleeve area indicates weight, the stress scan
  drains each node by the supplied loss, and a line lands on the goal consequence. Color,
  area, and motion always have labelled/table equivalents.
- Use OPS surfaces and semantic accent colors. Do not copy Apple composition, materials,
  icons, typography, language, or branding.
- Keep source, learner, and OPS ownership visible beside every assumption. Never bury it in
  a source panel.
- Scanning runs after a deliberate scenario selection, repair, or save; it never loops
  behind reading or imitates loading.

## 7. Responsive, keyboard, and reduced-motion contract

- Desktop may use a sticky visual with the decision panel beside it. At narrow widths the
  visual becomes an in-flow summary followed by controls and the full table; no essential
  horizontal scroll.
- Every drag action has direct numeric entry plus 44×44 minimum increment/decrement
  buttons. Arrow-key adjustment uses documented steps; Home/End are optional and must not
  create invalid hidden values.
- Use native fieldsets, legends, labels, input modes, error associations, and meaningful
  button names. Focus follows the decision order and returns from any dialog/drawer.
- A restrained live region announces totals, validation failures, scenario completion,
  and save status. Do not announce every animation frame or pointer move.
- At 200% zoom, the table may reflow to labelled rows rather than clip. Approximate dollars
  never replace percentages as the canonical value.
- Reduced motion replaces constellation travel and the scan line with an immediate
  before/after highlight and identical causal text.
- Light and dark themes use semantic tokens; no hard-coded dark panel is allowed inside a
  converted light route.

## 8. Completion, persistence, and invalidation

Mission 5 becomes **Policy coherent** only when:

- selected-mode Mission 1 readiness is complete; personal and practice use equally complete
  records;
- the learner passed all fresh unaided Preflight relationships after any bridge;
- finite strategic weights remain between 0% and 100% and total 100% within 0.01 percentage
  point; compute with unrounded values, round only the display, and reject negative, NaN,
  infinite, or blank committed values;
- known near-term cash need is covered by a compatible bucket;
- capacity and willingness are stored separately;
- each target range stays within 0%–100% and satisfies
  `minimum <= strategic target <= maximum`; its ownership is visible;
- stress assumptions, source/learner/OPS ownership, sleeve contributions, total percentage
  loss, approximate dollar loss, and goal consequence are visible;
- any candidate ceiling exposes its equation and is not attributed to a regulator;
- Scene 6 independent perturbation and Scene 7 assessment pass;
- the learner explicitly saves the policy to the Workbench.

Stress calculations use positive loss magnitudes for explanation:
`contribution in percentage points = weight% × assumed loss% ÷ 100`. Sum unrounded
contributions, show portfolio stress loss to one decimal percentage point and approximate
dollars to the nearest dollar, and grade from unrounded values. A displayed rounded total
must never become a second source of truth.

Saving never marks exact products selected or owned. Changing mode, goal/horizon, cash need,
capacity, willingness, weights, stress assumptions, ranges, or ceiling after coherence marks
the allocation and every dependent architecture, timing, holdings, overlap, order,
flight-test, operating, and IPS record **Review required** with the field and reason. It
does not silently approve recalculated work.

## 9. Hidden prerequisites and unsafe claims to reject

Hidden prerequisites to address explicitly:

- percent/decimal conversion and percentage-point contribution;
- weights versus dollars;
- broad sleeves versus securities/products;
- volatility/correlation/diversification mental models;
- capacity versus willingness;
- a scenario versus a forecast, and stress loss versus maximum drawdown;
- policy ranges versus return forecasts;
- migrated lesson completion versus newly demonstrated Workbench competence.

Reject these claims or interactions:

- “This is your optimal/right/recommended allocation.”
- “This loss is the most you can experience.”
- “A long horizon means you should hold more stocks.”
- “A questionnaire score determines a stock percentage.”
- “Diversification prevents losses.”
- “Cash is risk-free for every goal” (inflation and opportunity cost still exist; only the
  teaching stress input is zero here).
- “Bonds always rise when stocks fall” or “stability means safe.”
- “5%, 10%, or 25% is the regulatory personal position limit.”
- “The efficient frontier is stable, unique, or personally sufficient.”
- optimizing an unsupported maximum-drawdown objective or hiding model inputs.
- presenting an approximate dollar or a paper portfolio as a live holding or trade.

## 10. Gate status and implementation verification

Gate A passed in `docs/source-audits/mission-05-allocation.md`: the exact source edition and
artifacts are locked, the required decks and captions were reviewed completely, the
Finance Foundations bridge was reconciled, and the coverage matrix separates
source-authentic claims from OPS adaptations. Gate B and Gate C are specified in this plan;
the release-evidence ledger records their rendered verification plus Gates D and E.

Finance calculations, semantics, state transitions, persistence, typecheck, unit tests,
lint, and static checks pass. Responsive, theme, reduced-motion, keyboard, migrated-state,
and console observations from 2026-08-12 predate the final lifecycle/hydration fixes, so
the final Gate E browser matrix and clean production build remain open. The current
decision is `Blocked - implementation`; after those gates pass, exact stakeholder approval
is still required before any record can use `Release-ready`.
