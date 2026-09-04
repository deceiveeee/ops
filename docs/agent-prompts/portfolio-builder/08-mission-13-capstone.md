# Phase 8 prompt — Mission 13 flight test, operating plan, and IPS

Paste after `00-master-operating-prompt.md`.

---

## Objective

Close Mission 13's source and learner-sequence gates, then make the learner operate and
defend the completed portfolio.

The mission must compile the Workbench into a human-readable plan and Investment Policy
Statement, run the learner through realistic shocks, and administer an unfamiliar transfer
case. Passing demonstrates beginner portfolio competence for a stated personal or practice
case; it does not grant an advisory credential or authorization to trade.

## Mandatory Gate A/B work

Create a mission-specific source audit, claim coverage matrix, lesson plan, and
prerequisite/practice/assessment matrix. Review completely:

- Damodaran Sessions 1, 6, 36, and 38 at the pages/timestamps recorded in the practical
  tools audit;
- CFA Institute's locked IPS source;
- Investor.gov's current rebalancing and investor guidance;
- current locked IRS sources only for dated warning-level statements;
- SEC order/account sources where the operating plan refers to execution mechanics;
- optional S25/S26 monitoring logic only within the documented source boundaries.

Do not calculate personal tax liability, universal account placement, or individualized
legal eligibility. Do not turn Vanguard provider rebalancing research into a personal
threshold. Any cadence, band, or trigger selected by the learner is an OPS/personal policy.

Stop `Blocked - source` or `Blocked - learning` if the complete flight test requires a claim or
prerequisite not yet supported.

Create or update `docs/release-evidence/mission-13-capstone.md`. Keep pilot rubric behavior,
browser transfer-test evidence, and any actual learner calibration evidence separate; do
not call the proposed threshold validated from code tests alone.

## Learner experience

### Portfolio Flight Test

Test the actual saved policy, not a generic quiz. Include at least:

- market crash;
- income loss/job change;
- urgent cash need;
- new contribution;
- allocation drift;
- thesis-breaking company/fund fact;
- stale product source;
- active Edge License expiry;
- proposed change that conflicts with the original mandate.

Each scenario asks the learner to identify:

- what changed;
- which policy or checkpoint controls;
- financial consequence;
- action, no-action, or review response;
- affected downstream work;
- evidence that would change the response.

### Rebalancing Control Room

Compare three methods:

1. sell overweight assets and buy underweights;
2. add new money to underweights;
3. redirect contributions or distributions.

Show drift repaired, remaining deviation, estimated friction, possible tax flags, liquidity
effect, and why a chosen action fits the written policy. Never calculate tax liability or
declare one method universally optimal.

### Operating rules and plan compiler

Compile, do not re-ask, the learner's:

- goal, horizon, readiness, capacity, willingness, and liquidity;
- strategic allocation, ranges, loss budget, and assumptions;
- research-only and rejected ideas;
- passive/active architecture and benchmark;
- timing policy;
- exact product slate, identity, costs, source dates, and overlap;
- contribution and withdrawal rules;
- rebalancing rule;
- sell/replace and thesis-break rules;
- review cadence and governance;
- unresolved warnings and dependency history.

Every material assumption is marked source, learner, or OPS. Every high-decay fact has an
as-of date. The document distinguishes **Execute-ready** from **Practice-complete** and
states that neither is a recommendation.

### Unfamiliar transfer case

Use a genuinely new investor and portfolio. Do not label which mission skill applies. The
learner must diagnose, repair, and operate it without copying saved answers.

Critical failures override score:

- weights do not total 100%;
- near-term liquidity is placed in incompatible risky assets;
- hidden/unacknowledged leverage or margin;
- wrong security/share class/product identity;
- unsupported concentration or active edge;
- stale/missing provenance represented as current;
- no defined response to loss, drift, or broken thesis;
- treating the exercise as advice or trade authorization.

The proposed 80/100 threshold is an OPS pilot design choice. Do not represent it as
validated until learner testing calibrates it.

## Learning sequence

1. Define operating policy, rebalancing, drift, thesis break, replacement, benchmark,
   governance, and IPS.
2. Model one fully worked scenario and the corresponding IPS rule.
3. Guided practice operates the learner's portfolio with visible policy references.
4. Learner writes/edits operating rules and compiles the plan.
5. Independent flight scenarios remove hints.
6. Transfer case and defense assess integrated competence.

## Completion states

- `Practice-complete`: complete, coherent practice/paper plan plus transfer pass and no
  critical failure.
- `Execute-ready`: only when the personal plan is coherent, readiness blockers are
  resolved, transfer passes, and no critical failure remains. It still is not advice or a
  transaction authorization.

Both states require every Mission 1–12 checkpoint to be valid and current, including
mandate/readiness, market belief/falsifier, bond policy, equity-risk/required-return policy,
allocation, business evidence, valuation/watchlist gate, friction, evidence, architecture,
timing, and products/order rehearsal. Any unresolved mandatory `Review required` item,
missing prerequisite, stale
high-decay source that the policy depends on, or incomplete prior checkpoint blocks both
completion modes.

Completion records rubric evidence and failed critical checks. It must never overwrite or
hide unresolved `Review required` records.

## Tests and QA

Test all scenario branches, each critical failure, score boundaries, unresolved review
items blocking both completion modes, every missing Mission 1–12 checkpoint, plan compilation,
missing/stale sources, rebalancing math,
refresh/resume, print/export where implemented, and no order transmission.

Run complete fresh-state E2E through all 13 missions, plus a migrated-state path, keyboard,
screen-reader-oriented semantics, reduced motion, light/dark, desktop/mobile, print or
export layout, and console checks.

## Explicit non-goals

Do not:

- certify professional competence or suitability to advise others;
- promise investment returns or competition success;
- calculate personal tax liability or give individualized legal advice;
- use one universal rebalance threshold;
- place trades or connect accounts;
- let a high aggregate score override a critical failure;
- let the learner pass by copying their own plan into the transfer case;
- commit or push.

End with the complete-course gate status, not only the mission's local status.

---
