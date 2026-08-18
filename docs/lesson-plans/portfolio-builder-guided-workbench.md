# Portfolio Builder: guided Workbench specification

**Status:** **approved design authority** on 2026-08-12. Current implementation status is
owned by each mission's release-evidence record; this design document does not grant release.

**Research basis:** `docs/source-audits/portfolio-builder-practical-tools.md`

**Curriculum basis:** `docs/lesson-plans/portfolio-builder-mission-curriculum.md`

**Implementation status:** consult `docs/release-evidence/mission-XX-*.md`. Mission 5's
current decision is recorded in `docs/release-evidence/mission-05-allocation.md`.

## 1. Learner promise

Portfolio Builder should make a narrower, testable promise than “become an investment
expert”:

> Build, explain, and operate a diversified long-term portfolio for a stated goal—or prove
> the same decisions in a realistic practice case—using written rules for readiness,
> allocation, security selection, costs, evidence, rebalancing, and mistakes.

Finishing the course should demonstrate that a learner can independently complete a
beginner portfolio process. It should not imply that the learner can advise others, predict
markets, value every security, calculate personal taxes, or safely use leverage, options,
short selling, or concentrated bets.

“Execute-ready” is a conditional state, not the graduation promise. A learner can graduate
with a complete paper portfolio and deployment plan when age, account authority, debt,
emergency savings, jurisdiction, or another readiness issue prevents real-money action.

## 2. One course, one persistent object

The learner should not collect 13 disconnected worksheets. Every mission edits one
persistent **Portfolio Workbench**. At the end, the Workbench compiles into a human-readable
**Portfolio Dossier** and Investment Policy Statement.

```text
Mission 1        5                 7          10              12             13
mandate ──► policy weights ──► watchlist ──► architecture ──► product slate ──► operating plan
                 │                  │           license          │                │
                 └── loss budget    └── research only           └── order draft   └── flight test
```

The visible state names are:

1. **Mandate drafted**
2. **Policy coherent**
3. **Research checked**
4. **Architecture licensed**
5. **Products verified**
6. **Operating plan ready**
7. **Execute-ready** or **Practice-complete**

No lesson may skip a state by merely marking itself complete.

## 3. Two equal learner modes

Mission 1 asks the learner to choose a mode. Both modes receive the same teaching,
interactions, independent practice, assessments, and capstone standard.

| Mode | Uses | Completion state |
| --- | --- | --- |
| **Build mine** | The learner's own goal, horizon, approximate resources, constraints, and existing exposures. Exact account numbers and credentials are never requested. | Execute-ready only if the readiness runway has no unresolved blocker; otherwise paper portfolio plus deployment action plan. |
| **Practice case** | A realistic fictional household or young-investor case with all facts supplied. | Practice-complete. It never implies permission to invest for the fictional or real learner. |

The learner may switch from personal to practice mode without losing conceptual progress.
Personal values remain local and are never copied into the practice case.

## 4. Workbench information model

The eventual implementation should use one versioned state object. Field names below are a
design contract, not an approved code schema.

```ts
type PortfolioWorkbench = {
  version: number
  mode: "personal" | "practice"
  lifecycle:
    | "draft"
    | "policy-coherent"
    | "research-checked"
    | "architecture-licensed"
    | "products-verified"
    | "execute-ready"
    | "practice-complete"
  mandate: {
    goal: string
    horizon: string
    contributionPlan: string
    cashNeeds: string
    capacityForLoss: string
    willingnessForLoss: string
    readiness: string
  }
  allocation: {
    sleeves: Array<{ id: string; targetWeight: number; range?: [number, number] }>
    liquidityBucket: number
    stressAssumptions: Array<{ label: string; loss: number }>
    maximumLossContribution: number
  }
  research: {
    candidates: Array<{ identity: string; status: "watchlist" | "rejected" | "eligible" }>
    sourceSnapshots: Array<{ source: string; asOf: string; retrievedAt: string }>
    valuationRanges: unknown[]
  }
  gates: {
    friction: unknown
    evidence: unknown
    architecture: unknown
    timing: unknown
  }
  holdings: {
    products: unknown[]
    overlap: unknown
    orderDrafts: unknown[]
  }
  operatingRules: {
    contributions: string
    rebalancing: string
    withdrawals: string
    sellAndReplace: string
    thesisBreak: string
    reviewCadence: string
  }
  assumptions: Array<{ value: unknown; owner: "source" | "learner" | "OPS"; asOf?: string }>
  warnings: string[]
  dependencyHistory: Array<{ changedField: string; affectedMissions: number[] }>
}
```

Three implementation rules are mandatory:

- Every assumption is visibly marked **source**, **learner choice**, or **OPS teaching
  assumption**.
- When an upstream decision changes, dependent outputs are marked **Review required**.
  They are not silently recalculated into a new approved state.
- Existing saved progress is preserved. The current separate records in
  `lib/if-progress.ts`—philosophy, bond risk, equity risk, investor statement, valuation,
  friction, and evidence—need an explicit migration into the versioned Workbench. Existing
  lesson slugs and completion keys remain stable.

## 5. Mission-by-mission guided build

| # | Guided interaction | What the learner changes in the portfolio | Independent proof | Unlock or stop condition |
| ---: | --- | --- | --- | --- |
| 1 | **Readiness Runway**: a visual route from goal to investable surplus, with separate capacity and willingness tracks. | Goal, date, near-term cash, emergency-reserve target/current state, high-interest debt, contribution capacity, account authority, and personal/practice mode. | Explain why a changed job or cash need changes ability to bear loss even when willingness is unchanged. | Produces **personal deployment available**, **personal constrained**, or **practice only**. No course lockout. |
| 2 | **Hypothesis Forge**: assemble claimed mispricing → who is wrong → why → correction mechanism → evidence → falsifier. | Market belief and a condition that would reverse it. | Diagnose a new belief that is persuasive but not falsifiable. | Belief cannot affect holdings unless a falsifier and correction mechanism exist. |
| 3 | **Bond Shock Lab**: scan a cash-flow timeline, then apply rate and default shocks. | Bond role, duration tolerance, credit-quality boundary, and liquidity purpose. | Rank unfamiliar bonds or bond funds under a new shock without a drag-only control. | Saved bond policy must distinguish interest-rate and default risk. |
| 4 | **Risk X-Ray and Required-Return Builder**: reveal price risk, cash-flow risk, standalone risk, and portfolio-added risk; build the required-return equation piece by piece. | Equity-risk boundary and a required-return range with dated inputs. | Rebuild the return after one input changes and explain why the result is uncertain. | No unexplained CAPM number or false precision. |
| 5 | **Allocation Studio and Loss-Budget Allocator**: place sleeves, apply scenario chips, view dollar loss and goal impact, then derive concentration from loss contribution. | Strategic weights, liquidity bucket, target ranges, stress loss, and candidate position ceiling. | Repair an unfamiliar allocation with weights not totaling 100% or a liquidity mismatch. | Weights equal 100%; near-term cash is covered; stress result is acknowledged; no regulatory threshold is misused as a personal cap. |
| 6 | **Filing-as-Source-Code Scanner**: connect filing lines through the money machine from customers to free cash flow. | One business evidence brief, source dates, and unanswered questions. | Trace a changed operating event into the statements and cash-flow consequence. | Candidate remains **watchlist**; missing source evidence is visible. |
| 7 | **Valuation Gravity**: growth, margin, reinvestment, and risk move a bear/base/bull range; price is compared only after assumptions are visible. | Valuation range, action price, and thesis-break variables. | Diagnose an internally inconsistent new case. | Candidate remains **watchlist**; valuation does not grant ownership. |
| 8 | **Trade-Path Scanner**: scan entry, spread, impact, waiting, turnover, tax, and exit. | Personal friction estimate and minimum gross edge required. | Correct a scenario that treats a two-sided spread as a one-time surcharge. | Any strategy must clear the saved friction hurdle. |
| 9 | **Backtest Autopsy**: reveal leakage from benchmark choice, risk model, no holdout, data mining, survivorship, execution, and economic significance. | Evidence checklist and abandon rule. | Audit an unseen strategy claim and reject or qualify it with reasons. | Any edge claim must pass every required evidence field; standard Sharpe uses differential return. |
| 10 | **Architecture Switchboard and Edge License**: start from the current passive base rate, then route each proposed active sleeve through mechanism, evidence, friction, capacity, durability, size, and falsifier checks. | Passive core, any licensed active sleeve, maximum active weight, benchmark, and review date. | Decide an unfamiliar active proposal without relying on confidence or a winning streak. | Passive is the default. Failed or incomplete evidence leaves the sleeve disabled. |
| 11 | **Missing-Time Timeline**: compare the strategic policy with missed-return and false-signal paths; any tilt visibly expires. | No-timing rule or bounded signal, maximum deviation, expiry, and stop rule. | Apply the policy to a novel market headline. | No open-ended “wait until things feel safe” state; speculative sleeve is not a beginner default. |
| 12 | **Prospectus Lens, Fund Passport, Overlap X-Ray, and Order Rehearsal**. | Exact legal product identity, share class/ticker, structure, objective/index, replication, risks, fees, turnover, tracking, holdings, overlap, source dates, account context, and draft order. | Detect a wrong ticker/share class, stale holdings source, hidden overlap, leverage, or margin assumption in an unfamiliar slate. | Products must map to policy sleeves; identity and source date must pass; course never submits an order. |
| 13 | **Portfolio Flight Test, Rebalancing Control Room, and IPS Compiler**. | Contribution, withdrawal, rebalancing, tax-warning, sell/replace, thesis-break, review, benchmark, and governance rules. | Operate an unfamiliar portfolio through a crash, income loss, cash need, contribution, and drift event. | Coherence scanner and transfer case pass; critical safety errors block graduation. |

## 6. The repeatable novice rhythm

Every mission uses the same cognitive rhythm even when its visual metaphor changes:

1. **Introduce:** define the new concept in a direct positive statement.
2. **Model:** show a completed specimen and narrate cause and effect.
3. **Guided practice:** the learner changes one decision with immediate explanatory feedback.
4. **Apply to the Workbench:** the learner makes and saves the portfolio decision.
5. **Independent perturbation:** a new fact changes; the learner must respond without hints.
6. **Assess and save:** the learner explains the decision, sees the downstream dependencies,
   and commits it to the Dossier.

An opening diagnostic is allowed only when it is labelled **Preflight**, cannot reduce a
score, and immediately routes “I don't know yet” to a four-to-seven-minute prerequisite
bridge. The bridge is not a fourteenth mission. Mission completion still requires the
independent application.

## 7. Detailed high-leverage components

### 7.1 Readiness Runway

The runway shows why “not ready to deploy money” and “not ready to learn portfolio
construction” are different statements.

Required inputs:

- goal, target date, expected contribution, and planned withdrawals;
- emergency-reserve target and current state, chosen by the learner rather than imposed as
  a universal number;
- high-interest debt status and employer-match opportunity;
- age/jurisdiction, earned-income relevance, and account authority as plain-language flags;
- existing account and holding categories, never credentials or exact account identifiers;
- ability to bear loss and willingness to bear loss as two separate answers.

The output is a route, not a score: proceed personally, proceed with constraints, or use the
practice case. Every route reaches Mission 13.

### 7.2 Allocation Studio

The visual result must be stronger than the control. As weights change, the learner sees:

- target percentage and approximate dollars;
- near-term goal funding versus risky capital;
- each sleeve's contribution to a selected stress loss;
- issuer, sector, employer-stock, and fund-overlap concentration;
- the reason a target range exists and what action a breach would trigger.

Dragging is optional. Keyboard buttons and direct numeric entry provide equivalent control.
The learner must be able to explain the loss budget without reading a chart.

### 7.3 Edge License

An active idea enters as a disabled sleeve. The license asks for:

- exposure it would replace and the correct benchmark;
- specific inefficiency and correction mechanism;
- falsifiable claim and disconfirming evidence;
- current category base rate;
- gross expected edge and saved fees, turnover, spread, tax, and capacity costs;
- maximum allocation and portfolio loss contribution;
- thesis-break condition and review date.

No single impressive number can flip the decision. The UI reveals which unmet condition
keeps the sleeve disabled.

### 7.4 Fund Passport and overlap calculation

Each product record must distinguish the legal fund, share class, ticker, and structure.
The passport captures objective, tracked index, replication method, principal risks, fee
table, turnover, benchmark/performance period, tracking behavior, holdings source, ETF
spread/premium-discount considerations, material changes, and every source's as-of date.

Look-through exposure uses a transparent approximation:

```text
issuer exposure = direct portfolio weight
                + Σ(fund portfolio weight × issuer weight inside that fund)
```

The result must disclose coverage and staleness. Quarterly N-PORT data must not be presented
as live holdings. A sponsor file may be fresher, but the format and date must remain visible.

### 7.5 Rebalancing Control Room

The control room imports target ranges and lets the learner compare three actions:

1. sell overweight assets and buy underweights;
2. add new money to underweights;
3. redirect contributions or distributions.

For each route it shows drift repaired, estimated friction, possible tax flags, and remaining
deviation. It may flag a possible wash-sale window from current IRS authority but must not
calculate tax liability. A learner-selected threshold is labelled an OPS/personal policy,
not a universal best practice.

## 8. Graduation standard

Graduation requires two demonstrations:

1. **Own or practice Dossier:** the completed Workbench, with source dates, assumptions,
   decisions, rejected ideas, operating rules, and an oral-or-written defence.
2. **Unfamiliar transfer case:** a new investor and portfolio that the learner must diagnose,
   repair, and operate without copying saved answers.

Proposed rubric:

| Dimension | Points | Evidence |
| --- | ---: | --- |
| Goal, readiness, horizon, and liquidity | 15 | Mandate fits the stated person and distinguishes capacity from willingness. |
| Allocation and loss response | 20 | Weights total 100%; near-term needs and stress losses are handled; concentration is justified through loss budget. |
| Business/value reasoning | 10 | Claims trace to source evidence; valuation assumptions are coherent and uncertain. |
| Friction, evidence, and architecture | 20 | Costs and bias tests affect the decision; active exposure, if any, has a valid license. |
| Product diligence and identity | 15 | Exact securities, structure, fees, exposure, overlap, and source dates are verified. |
| Operating rules | 15 | Contributions, withdrawals, rebalancing, review, thesis-break, sell/replace, and benchmark rules are actionable. |
| Explanation and transfer | 5 | Learner can defend choices and adapt them to the unfamiliar case. |

Proposed passing standard: **80/100 overall**, a completed transfer case, and no critical
failure. This threshold is an OPS assessment design choice and must be validated in learner
testing before release.

Critical failures override the score:

- portfolio weights do not total 100%;
- near-term liquidity need is funded by an incompatible risky asset;
- hidden or unacknowledged leverage/margin;
- wrong security, share class, or product identity;
- unsupported concentration or active edge;
- no defined response to a loss, drift, or broken thesis;
- stale or missing source provenance represented as current;
- the learner treats a paper exercise as authorization or personalized advice.

## 9. Accessibility, responsive, and motion contract

- No task relies on dragging, color, hover, animation, or chart reading alone.
- Every visualization has a table or plain-language equivalent.
- Desktop persistent sidecar becomes an in-flow summary plus bottom sheet or drawer on small
  screens; no essential control is hidden behind horizontal overflow.
- Inputs and targets are at least 44 by 44 CSS pixels where applicable; focus order follows
  the decision sequence; validation and recalculation announcements use restrained live
  regions.
- Reduced motion replaces scanning, orbit, and path transitions with discrete highlighted
  states. The finance relationship remains visible.
- The Workbench always answers three questions: **What changed? Why does it matter? What do
  I need to review next?**

## 10. Privacy and data handling

- Default storage is local-only and versioned.
- Do not request brokerage credentials, account numbers, tax identification numbers, exact
  addresses, or documents containing unnecessary personal data.
- Dollar values may be entered as ranges or a fictional amount.
- Export is explicit and produces a learner-readable Dossier; importing requires schema
  validation and a preview of changed fields.
- A reset must distinguish practice data, personal inputs, course completion, and the entire
  Workbench so the learner does not erase more than intended.

## 11. Approved implementation sequence

1. Freeze the Workbench schema and migration contract; add unit tests for legacy keys and
   downstream invalidation.
2. Prototype the persistent sidecar/mobile sheet with Missions 1 and 5 before authoring a
   gated later mission.
3. Retrofit existing missions to save into the Workbench without changing slugs or deleting
   legacy progress.
4. Complete the Gate A and Gate B records for Missions 5 and 10–13 independently.
5. Build Missions 10–13 in dependency order, with Mission 12 product diligence preceding
   the Mission 13 flight test.
6. Run fresh-learner pedagogy, keyboard, screen-reader, reduced-motion, theme, desktop, and
   mobile QA for the complete 13-mission path.
7. Pilot the capstone and transfer case. Calibrate the proposed 80-point threshold from
   observed misconceptions before representing it as a competence standard.

## 12. Approval questions resolved by this design

- **Will learners build as they learn?** Yes. Every mission changes one persistent
  Workbench, and the final Dossier is the accumulated course work rather than a separate
  end project.
- **Will every Damodaran session still matter?** Yes. Sixteen sessions support required
  decisions; the other 22 are optional edge labs that feed the same friction and evidence
  gates.
- **Will every learner finish with a portfolio?** Yes: a personal portfolio when appropriate
  or a fully assessed paper portfolio and deployment plan when real-money action is not
  appropriate.
- **Does course completion prove competence?** Only after the Dossier, unfamiliar transfer
  case, and critical-error gate pass. Watching lessons or filling fields is insufficient.
- **Does this authorize real investing?** No. Execute-ready means the educational dossier is
  coherent and readiness flags are resolved; it is not a recommendation, guarantee, or
  substitute for legal, tax, or personalized financial advice.
