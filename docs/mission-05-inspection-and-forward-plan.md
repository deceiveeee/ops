# Mission 5 inspection, and a plan for the remaining missions

Inspection date: 2026-08-13. Inspector: Claude. Mission 5 is Codex's work; nothing
in it was edited. This is a report and a proposal.

---

## Part 1 — What I found in Mission 5

### 1.1 The typography gate fails today, at stage 1

`npx playwright test e2e/lesson-typography.spec.ts -g "if-pb-05"` fails:

```
could not answer Stage 1 of 7 after 8 interactions, so no stage past it was audited.
  tried: key: Continue to Goal › key: Continue to Runway › key: Continue to Loss
       › key: Continue to Access › key: Continue to Change
       › key: choice Capacity and liquidity changed; willingn
       › key: choice Record the $12,000 as near-term cash › key: Save readiness route
```

**Consequence: stages 2–7 of Mission 5 have never been audited by anything.** No
typography, contrast, hierarchy, or overflow check has ever run on the preflight,
the model, the repair lab, the Allocation Studio, the transfer case, or the
defense. This is consistent with the release evidence's own `Blocked -
implementation` status, which states the browser rerun is pending — Codex did not
claim otherwise.

### 1.2 The blocker is the harness, not the lesson

I drove the lesson by hand. Readiness step 6 asks **two** questions, and the
second only renders once the first is answered. Answering both enables `Save
readiness route`, the stage completes (`1 of 7 stages complete`), and `Run the
theory preflight →` enables. Verified directly:

```
saveDisabledBefore: true → saveDisabledAfterAnsweringQ2: false
counterNow: "1 of 7 stages complete"   advanceEnabled: true
```

So **the lesson works for a learner.** The gate's answer-key runner walks its
entries in one pass with a single settle between clicks, which cannot see a
control that appears *because of* the click before it. That is a defect in the
walker — my code — not in Mission 5.

### 1.3 What passes, measured rather than assumed

Stages 1 and 2, at 1265px and at 390px:

- no text below the 12px floor
- no element below its WCAG AA requirement (4.5:1, or 3:1 where AA allows)
- no page-level horizontal scroll at either width
- no content clipped by a container
- every form field carries a real accessible name — wrapping `<label>` on the
  text and radio inputs, `label[for]` on the numeric ones

I had suspected missing labels because several inputs have no `id` and two carry
React `useId()` values (`:r1:`, `:r2:`). That suspicion was wrong: the labels are
correctly associated. The unstable ids are a *testability* limitation, not an
accessibility defect — they cannot be used as stable hooks by the gate's
`type:<id>=<value>` mechanism.

### 1.4 Real defects found

| # | Finding | Severity | Scope |
| --- | --- | --- | --- |
| 1 | Gate cannot pass stage 1, so stages 2–7 are unaudited | **High** | Mission 5 + walker |
| 2 | `← Back to Investment Foundations` renders **250×18px** — a tap target less than half the 44px minimum the release evidence claims is met | Medium | **Shared layout — every IF lesson** |
| 3 | Mission 5 required **seven** answer-key entries, one per stage. The handoff describes keys as "a last resort, not the normal path" | Medium | Process |
| 4 | Two mode buttons render at 0×0 (duplicate markup, one pair hidden). Not visible, but same accessible name twice | Low | Mission 5 |

The four container overflows I first flagged are **not** defects — all are
`pointer-events-none` decorative gradients, clipped by design.

### 1.5 What I could not check

**I cannot see the page.** Screenshots require the Browser pane to be displayed
on your screen; it is not, so the renderer never composites a frame. Everything
above is measurement, and measurement does not catch what you are describing:
spacing and rhythm, alignment, crowding, visual balance, whether a panel reads as
one thing or three.

To close that, either open the Browser pane and I will screenshot every stage at
desktop and mobile, or tell me which stages look wrong and what you see. I would
rather ask than guess at a fix for a problem I cannot observe.

---

## Part 2 — Forward plan for missions 10, 11, 12, 13

### 2.1 What Mission 5 teaches about the process

Mission 5 is good work: the source audit is the most rigorous in the repo, the
finance is independently verified, and the interaction design genuinely teaches.
Two process faults showed up anyway, and both will repeat unless the process
changes.

**Fault A — Gate E is always the gate that does not get done.** Mission 9 and
Mission 5 both shipped with browser/visual QA open, for the same reason: the
agent building the lesson could not reach a browser at the moment it mattered.
Gate E is not failing because it is hard; it is failing because it is last, and
it depends on a capability that is not always available.

**Fault B — the walker and the lesson drift apart.** Seven answer keys for one
lesson means the automated check no longer understands the product. The keys sit
in a test file, far from the component, and go stale the moment copy changes.

### 2.2 Three changes I propose

**1. Each journey exports its own solution path.** Instead of `ANSWER_KEYS`
growing in the spec, every journey component exports a test-only constant beside
the content it describes:

```ts
export const __solutionPath = [
  { stage: 0, answer: ["Continue to Goal", "…", { field: "goal", value: "…" }] },
  …
];
```

The lesson and its walkthrough then live in one file and change together. A copy
edit that breaks the path breaks it in the file being edited, not in a spec
nobody opens. The spec imports the paths and keeps its generic solver as the
fallback for lessons that do not need one.

**2. The walker must handle progressive reveal.** Re-query and re-settle after
every key entry, and extend key matching to radio inputs and labels, not just
buttons. This is the fix for 1.1 and it belongs to me — I wrote the runner — but
the spec is currently Codex's file under the protocol, so it needs an explicit
transfer or Codex applies it.

**3. Gate E moves from last to continuous.** A lesson is not "implemented, then
QA'd". Whoever has browser access runs the visual pass **at the halfway point**,
when three or four stages exist, so layout faults are found while the pattern is
still cheap to change. In the two-agent setup that means the builder pauses at
the midpoint and hands over for a visual check.

### 2.3 Sequencing the remaining four

Ordered by what is actually unblocked, not by mission number:

| Order | Mission | State | First deliverable |
| --- | --- | --- | --- |
| 1 | **11 — Timing policy** | Sessions 30/33/34 have slides, quizzes, and tier-3 ASR narration; 32 the same | Narration reconciliation: promote 30/32/33/34 from tier 3 by checking ASR against slides, then the coverage matrix |
| 2 | **10 — Passive or edge** | Blocked: needs current fund-performance persistence evidence; sessions 35–37 are dated | Lock a current source (SPIVA or equivalent) in the supplemental manifest, then reconcile |
| 3 | **12 — Holdings slate** | Blocked: session 37's product landscape predates the modern ETF market | Current fund/ETF disclosure sources |
| 4 | **13 — Operating plan and IPS** | Blocked: needs rebalancing, current tax, and IPS-design sources | Supplemental sources per curriculum §6 |

Mission 11 is first because it is the only one whose block is *reconciliation
work we can do*, rather than *a source we do not yet have*. Missions 10, 12 and
13 all need an external artifact locked before any lesson work is legitimate.

Note the dependency this creates: the curriculum has 11 depending on 5 (you need
a strategic allocation before deciding whether to deviate from it). Mission 5 now
exists, so 11 is genuinely reachable.

### 2.4 Division of labour, unchanged in shape

- **Codex** keeps the spine files and mission implementation.
- **Claude** keeps new test files and source-audit documents, and does **not**
  touch spine files.
- **New:** whoever holds browser access at the time runs Gate E, regardless of
  who built the lesson. Visual QA is a capability, not an ownership claim.

### 2.5 Immediate queue

1. Fix the walker's progressive-reveal handling; re-run the gate on Mission 5 and
   audit stages 2–7 for the first time. **Blocked on: who owns the spec.**
2. Fix the 18px back-link tap target in the shared lesson layout. **Blocked on:
   shared-file ownership.**
3. Visual QA on Mission 5, all seven stages, desktop and mobile. **Blocked on:
   the Browser pane being open, or your description of what looks wrong.**
4. Then Mission 11's narration reconciliation.

Items 1 and 2 are small and I can do both immediately given the go-ahead on file
ownership.
