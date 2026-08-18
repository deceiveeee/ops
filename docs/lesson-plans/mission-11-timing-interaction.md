# Mission 11 — interaction design (Gate C)

**Reads:** `docs/source-audits/mission-11-timing.md` (Gate A closed),
`docs/lesson-plans/mission-11-timing.md` (Gate B closed).
**Status:** design only. No component written.

## The financial relationship, before any chrome

> A deviation from policy weights costs something in **both** directions, and the cost is set
> less by the exit than by the return — how long you are out, what you pay to move, and
> whether anything written down ever brings you back.

Everything below exists to make that visible. If a beat can be carried by a paragraph or a
static table, it is — beats 1 and 3 are largely table-driven by design, and only beats 2 and
4 earn a bespoke control.

## Why not a slider

The obvious build is a slider that changes an annual return number. It is rejected: it
teaches that timing is a dial with a payoff curve, when the source says the failure is
structural — you are out at the wrong time (S30-7), you pay to move (Mission 8), and you have
no rule that returns you (S34-9). A number that moves smoothly with a handle communicates the
opposite of every finding in the audit. The controls below change a **path and its
consequence**; the numbers are readouts, never the interaction.

## Controls

### C1 — Exit decision *(beat 2)*

| | |
| --- | --- |
| **Learner decision** | On an illustrative, source-labelled path, choose when to leave the Mission 5 strategic weights: hold policy, leave on the first drop, or leave after the drop confirms |
| **Visible financial result** | The tactical path forks from the policy line at the chosen point. Readout: size of deviation, time out of policy so far, and friction charged from the saved Mission 8 budget |
| **Misconception exposed** | That the exit is the decision. Choosing an exit alone leaves the path unresolved — the mission's real question is C2 |
| **Keyboard / touch** | Three discrete buttons in a radiogroup; arrow keys move, Enter selects; 44px minimum targets. No dragging anywhere in this lesson |
| **Reduced motion** | The fork renders in its final position with an ordered "1 → 2 → 3" annotation instead of drawing along the path |
| **Compact screen** | Path stays horizontal, readout stacks beneath. Never more than one path at a time below `lg` |

### C2 — Re-entry rule *(beat 2, the centrepiece)*

| | |
| --- | --- |
| **Learner decision** | Choose how the deviation ends: a fixed expiry date, a written stop rule tied to an observation, or "when it feels safe" |
| **Visible financial result** | Expiry and stop rule both resolve — the path rejoins policy, and the readout closes with total time out, friction paid, and the gap against policy. **"When it feels safe" never resolves.** The path continues past the recovery with an open end and the readout shows opportunity cost still accruing beside an end date that reads "none" |
| **Misconception exposed** | That waiting for comfort is a neutral, cost-free action. This is the phase prompt's explicit requirement, and here it is not asserted in prose — the learner watches their own choice fail to terminate |
| **Keyboard / touch** | Radiogroup as C1. The unresolved state is announced once via a polite live region, not looped |
| **Reduced motion** | No extending line. The unresolved case renders as a static terminal state labelled "no end date — still out of policy", with the same readout |
| **Compact screen** | Readout becomes a two-row table directly under the path |

C2 is the strongest interaction in the mission and should be built first. If only one control
survives scope pressure, it is this one.

### C3 — Signal test *(beat 3)*

| | |
| --- | --- |
| **Learner decision** | Given a macro claim and the matching record (S32-4 T-bill table, or S32-7 GDP table), judge whether the signal meets the evidence conditions they wrote in Mission 9 |
| **Visible financial result** | The claim is stamped against the learner's own bar. Where it fails, the timeline **refuses the deviation** — C1 and C2 are disabled for that scenario with the failed condition named |
| **Misconception exposed** | That a plausible story is evidence. The tables refute the rule of thumb printed two slides earlier, in the source's own numbers |
| **Keyboard / touch** | The record is a real `<table>`, readable and navigable; judgement is a radiogroup |
| **Reduced motion** | No change — this beat is already static |
| **Compact screen** | Table scrolls inside its own `overflow-x` container; the page never scrolls sideways |

Carries F4 intact ("an 82/83-year US sample, period not stated on the source slide"), shows
cell sizes and standard deviations, and handles the F10 hazard by naming the difference
between *what follows if you believe a premise* and *what the evidence shows* before either
quiz-derived item appears.

### C4 — Policy writer *(beat 4)*

| | |
| --- | --- |
| **Learner decision** | Declare no timing with a reason, or specify a bounded tilt: signal, benchmark, maximum deviation, eligible sleeve, expiry, falsifier/stop, review date |
| **Visible financial result** | The friction cost of the stated maximum deviation, computed from the Mission 8 budget, plus a replay of what this exact policy would have done on the beat-2 path |
| **Misconception exposed** | That a rule without an expiry is a policy. An incomplete bounded rule cannot be saved, and the missing field is named locally rather than in a summary error banner |
| **Keyboard / touch** | Ordinary labelled form controls, visible focus, errors tied by `aria-describedby` |
| **Reduced motion** | Replay renders as its end state plus the same table |
| **Compact screen** | Single column; no field below 12px; no field pair side by side under `sm` |

No speculative sleeve is offered at any size or under any label — F8.

### C5 — Headline perturbation *(beat 5)*

| | |
| --- | --- |
| **Learner decision** | A novel headline with an ambiguous signal that does not meet their written conditions: act, or decline and name the condition that failed |
| **Visible financial result** | Declining is recorded as a policy-consistent action against the saved policy. Acting is not scored "wrong" — it is shown as a deviation their own written policy did not authorise |
| **Misconception exposed** | That confidence substitutes for a met condition. Backed by S34-5: newsletters raised equity weights 58% of the time before upturns and 53% before downturns |
| **Keyboard / touch** | Radiogroup plus a named-condition select |
| **Reduced motion** | Static throughout |
| **Compact screen** | Headline card then choices, stacked |

## Non-negotiables carried into Gate D

- Every visualisation ships a table equivalent. The Missing-Time Timeline's table is the
  primary artifact on narrow screens, not a fallback.
- A stage is a screen. Stages that overrun get **split**, never sealed inside a scroll box —
  see the comment in `ValuationJourneyShell.tsx` for what that cost the five existing
  missions.
- Illustrative paths are labelled as illustrative and source-derived. No live data, no
  forecast, no current market view.
- Mission 10's Architecture License must be valid and current before C4 can save.
- Nothing here computes personal tax. S30-8 is a directional warning only.

## Gate C status: **closed**

`Blocked - implementation` not triggered. Gate D (implementation) is next: the shell, the
five controls, progress wiring, and the Workbench artifact. Gate E is browser QA at the six
required widths in both themes, keyboard-only, and reduced-motion.
