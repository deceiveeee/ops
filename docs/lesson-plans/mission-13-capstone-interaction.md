# Mission 13 — interaction design (Gate C)

**Reads:** `docs/source-audits/mission-13-capstone.md` (Gate A closed),
`docs/lesson-plans/mission-13-capstone.md` (Gate B closed).
**Status:** design only. No component written.

## The financial relationship, before any chrome

> A portfolio is not a decision. It is a series of decisions you will have to make later, under
> pressure, about money you have already committed. The rules you write now are the only ones
> you will trust then.

Everything below exists to make that visible. The mission's whole claim is that a rule written
calmly in advance outperforms a judgement made in a downturn — so every control has to resolve
against **the learner's own saved words**, not against a model answer.

## Three builds rejected before designing

**A score dashboard.** The mission ends in an assessed transfer case with a numeric threshold,
so it is tempting to make everything a gauge. Rejected on two grounds: critical failures are a
**gate, not a deduction** — a plan with hidden leverage is not an 88 — and a visible running
score invites optimising the number instead of the plan. The 80/100 threshold is also an
unvalidated pilot choice, which is not something to put a needle on.

**A "what would you do?" quiz for the flight test.** This is the obvious build and it teaches the
wrong thing: it tests recall against a model answer. The scenario must resolve against **the
learner's saved policy**, so that two learners with different, coherent policies both pass with
different answers — and a learner whose policy is silent discovers that instead of guessing.

**An IPS styled as an official document.** The phase prompt requires a human-readable Dossier and
IPS, so a document view is in scope — but it must not be dressed as a regulated artifact. No
letterhead, no signature block, no statement or advisory-agreement styling. Same family of rule
as Mission 12's ban on brokerage mimicry: the moment it looks official, it starts to function as
advice.

## Controls

### C1 — Readiness map *(beat 1)*

| | |
| --- | --- |
| **Learner decision** | Enter in practice mode, or leave and close a gap first |
| **Visible financial result** | Twelve checkpoints, each green, stale or missing, with one line on *what it is and why this mission needs it*, and a link straight to the mission that produces it |
| **Misconception exposed** | That a capstone is a summary. It is a dependency check: this mission cannot compute a rebalance without Mission 5's weights or price friction without Mission 8's budget |
| **Keyboard / touch** | A real list; each row's link is an ordinary anchor. Status is text, never colour alone |
| **Reduced motion** | Static. No progress-ring animation |
| **Compact screen** | One row per line, status text under the name rather than beside it |

**The wall is a map, not a refusal.** Practice mode stays open with the cost stated:
`Execute-ready` is unreachable until the gaps close, and the screen says which ones and why.

### C2 — Worked scenario *(beat 2)*

| | |
| --- | --- |
| **Learner decision** | None yet — this is the model. The learner steps through one crash scenario and sees all six answers produced |
| **Visible financial result** | What changed, which policy controls, the consequence in their own numbers, the action or non-action, the downstream work affected, and the evidence that would change it — then the IPS rule that scenario implies, written out |
| **Misconception exposed** | That a stop-loss order is protection. **SEC-4: a stop order becomes a market order once triggered**, inheriting SEC-1 and SEC-2's unguaranteed prices exactly when prices move fastest |
| **Keyboard / touch** | Stepper with ordinary buttons; each step is a landmark |
| **Reduced motion** | Steps appear in place, no transition |
| **Compact screen** | One answer per screen with the scenario pinned above |

The stop-order point also forces the distinction against Mission 11: a stop **rule** is a
condition you check; a stop **order** is a standing instruction to a broker with its own failure
mode. The interface names both and never lets them share a word.

### C3 — Rebalancing Control Room *(beat 3, the centrepiece)*

| | |
| --- | --- |
| **Learner decision** | Choose which of three methods to apply to their own drift: sell overweight and buy underweight; add new money to underweights; or redirect contributions and distributions |
| **Visible financial result** | A row per method: drift repaired, **remaining deviation**, estimated friction from the Mission 8 budget, tax flags, liquidity effect, and which written rule the action satisfies |
| **Misconception exposed** | That rebalancing is free, and that "back to target" is a single achievable state. Remaining deviation is shown for every method, because none of them lands exactly on target |
| **Keyboard / touch** | Methods are a radiogroup using the shared `ChoiceGroup`; the comparison is a real `<table>` that scrolls inside its own container |
| **Reduced motion** | Drift bars render at final position; no animated repair |
| **Compact screen** | Table first, one method per card below `sm`, comparison retained as the primary artifact |

**No method is declared optimal.** Method 3 renders first because it avoids selling entirely, and
the interface immediately says why "first" is not "best": it is unavailable to a learner who is
no longer contributing. The phase prompt forbids the claim and the sources do not support it.

**The band is the learner's.** Per IG-7, the trigger percentage is one *"you've identified in
advance"* — entered by the learner, labelled personal policy on the page. Vanguard is not cited
in this control at all, per D3.

### C4 — Rule writer and IPS compiler *(beat 4)*

| | |
| --- | --- |
| **Learner decision** | Write the two genuinely new elements — the review process and the rebalancing process — plus contribution, withdrawal, sell/replace and thesis-break rules |
| **Visible financial result** | The compiled Dossier and IPS, assembled from twelve missions. Every material assumption chipped **source**, **learner** or **OPS**; every high-decay fact carrying its as-of date |
| **Misconception exposed** | That the capstone is where you write everything down. Fourteen of the sixteen CFA elements are already answered — the compiler shows them filling themselves, which is the point |
| **Keyboard / touch** | Ordinary labelled fields, errors named locally and tied by `aria-describedby` |
| **Reduced motion** | The document assembles in final form, no sequential reveal |
| **Compact screen** | Single column; the document view scrolls internally rather than growing the page |

**It compiles; it never re-asks.** A question answered in Missions 1–12 is read, not posed again.
A missing input names its mission and links there — the same behaviour as C1, because it is the
same problem surfacing later.

**Mission 12's as-of dates become live warnings here.** A holdings date 138 days old is trivia in
Mission 12 and a dependency in Mission 13, because the policy being written rests on it.

**Execute-ready and Practice-complete are visibly different states**, and the document states in
plain words that neither is a recommendation or an authorization to trade.

### C5 — Eight flight scenarios *(beat 5)*

| | |
| --- | --- |
| **Learner decision** | For each: what changed, which policy controls, the consequence, act or do not act or review, what downstream work is affected, and what evidence would change the answer |
| **Visible financial result** | The scenario resolves **against their own saved policy**, in their own numbers — not against a model answer |
| **Misconception exposed** | That there is a right answer. Two coherent policies produce two different correct responses. **And when no saved rule covers the scenario, the finding is "your plan is silent here"** — which is the most useful outcome the flight test can produce |
| **Keyboard / touch** | Radiogroups and short text; no drag, no timed input |
| **Reduced motion** | Static throughout |
| **Compact screen** | One scenario per screen, policy reference in a disclosure |

"Your plan has no rule for this" is a **result, not a failure state**. It sends the learner back
to C4 with a specific gap rather than a score.

### C6 — Transfer case and defence *(beat 6)*

| | |
| --- | --- |
| **Learner decision** | Diagnose, repair and operate a genuinely new investor's portfolio, with **no labels saying which mission skill applies** |
| **Visible financial result** | The repaired portfolio and the reasoning behind each change, then a defence of the choices against the case's stated mandate |
| **Misconception exposed** | That competence is recall. The case is deliberately unlabelled, so the learner must notice that a share class is wrong or that liquidity sits in the wrong sleeve without being asked about it |
| **Keyboard / touch** | Forms and radiogroups; the portfolio is a real table |
| **Reduced motion** | Static |
| **Compact screen** | Case brief, then portfolio, then findings — stacked, never side by side |

**Critical failures are a gate, not a deduction.** Any one of the eight fails the case outright,
because each is a learner who would do real harm: weights not totalling 100%; near-term liquidity
in incompatible risky assets; hidden leverage or margin; wrong security, share class or product
identity; unsupported concentration or active edge; stale provenance shown as current; no defined
response to loss, drift or broken thesis; or treating the exercise as advice or trade
authorization.

Two of those are Mission 12's lessons arriving as assessment — a plan that cannot name its own
share class has identified nothing, and a source date presented as current is the defect that
mission spent eight stages teaching.

**The 80/100 threshold is labelled a pilot design choice on the page**, not only in the evidence
file, and is not represented as validated. No learner calibration has been run.

## Build order under scope pressure

1. **C3, the Control Room** — the only control that operates the learner's real numbers, and the
   mission's centrepiece.
2. **C4, the compiler** — the artifact everything else feeds.
3. C1, then C5, then C2, then C6.

If the mission overruns at Gate D, the honest lever is **moving C6 to an optional lab**, not
thinning C5. The flight test is where the teaching is.

## Non-negotiables carried into Gate D

- **Eleven stages, planned now.** Mission 12 was designed as six, measured over budget on two,
  and split to eight afterwards. This mission is larger; it is built as eleven from the start and
  measured at 1440×900 before Gate E, not after.
- Every visualisation ships a table equivalent, and the table is primary on narrow screens.
- The shared `ChoiceGroup` is used for every radiogroup — roving tabindex, arrow keys, Home/End.
- No score gauge, no letterhead, no signature block, no advisory-agreement styling.
- No personal tax calculation, no account placement, no eligibility ruling. Tax appears as
  directional flags sourced from S6-3, S6-5, S6-6 and S38-10, with the IRS pubs cited by edition
  as the pointer of record and never quoted, per D4.
- Nothing computes a recommendation. `Execute-ready` is a state of the learner's own document,
  not an endorsement of it.

## Gate C status: **closed**

`Blocked - implementation` not triggered. Gate D is next: the shell, six controls across eleven
stages, the compiler's read-only wiring to twelve artifacts, and the Operating Plan and IPS
artifact itself.
