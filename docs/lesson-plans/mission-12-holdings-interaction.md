# Mission 12 — interaction design (Gate C)

**Reads:** `docs/source-audits/mission-12-holdings.md` (Gate A closed),
`docs/lesson-plans/mission-12-holdings.md` (Gate B closed).
**Status:** design only. No component written.

## The financial relationship, before any chrome

> What you own is not what you bought. You buy a ticker; you own a share class of a portfolio.
> And the exposure you actually carry is the sum of every fund that reaches the same issuer —
> which no fund's own page will ever tell you.

Everything below exists to make that visible. Beats 1 and 5 are largely table-driven by design.
Only the Prospectus Lens and the Overlap X-Ray earn bespoke controls.

## Two builds rejected before designing

**A fund comparison table.** Four products, rows of fees and returns, pick the best one. This is
a recommendation engine wearing a lesson's clothes. It teaches ranking, which the phase prompt
forbids, and it renders every field equally weighted — when the mission's sharpest finding is
that one filed number (SGOV's turnover) measures nothing at all. A table that presents 0% and
62% as comparable has taught the opposite of the lesson.

**A portfolio constellation for overlap.** `AGENTS.md` pattern 7 offers it and it would look
superb. Rejected: the phase prompt explicitly requires the learner to inspect the underlying
table "without relying on a constellation or heatmap", and 3,524 drifting nodes would bury a
finding that is one sentence long. The table is the primary artifact here and the diagram
serves it, not the reverse.

## Controls

### C1 — Identity resolver *(beat 1)*

| | |
| --- | --- |
| **Learner decision** | Search EDGAR for the ticker they think they are buying |
| **Visible financial result** | **No filer is found**, because none exists. The ladder then resolves — registrant → series → class — and the six share classes of series S000002848 appear under one header with their real terms: VTI at 0.03% and no minimum beside VTSAX at 0.04% and a $3,000 minimum. One portfolio, six prices |
| **Misconception exposed** | That a ticker is a fund. The failed search is the teaching moment and it is true, not staged — EDGAR has no filer called VTI |
| **Keyboard / touch** | Search is a labelled `<input>` with a listbox of valid tickers; results announce via a polite live region. The class list is a real `<table>` |
| **Reduced motion** | The ladder renders fully expanded with numbered steps instead of resolving downward |
| **Compact screen** | Ladder is already vertical. The class table scrolls inside its own `overflow-x` container; the page never scrolls sideways |

### C2 — Prospectus Lens *(beats 2 and 3, the spine)*

Filing as source code — `AGENTS.md` pattern 3, and the phase prompt's named interaction. Split
frame: the filing on one side, the passport field being answered on the other. One field at a
time, always.

| | |
| --- | --- |
| **Learner decision** | Beat 2 models it: step through VTI's passport and watch each field pin to the lines that answer it. Beat 3 reverses it: given an empty field on AGG's passport, find the passage that answers it |
| **Visible financial result** | The passport field fills with the value **and its provenance** — document, accession, date. Five finds in beat 3: the replication sentence, the fee table, turnover, the lending permission, the holdings as-of date |
| **Misconception exposed** | That a filing is prose to be read rather than a structured document to be queried. Also, at the fifth find, that the date printed largest is the date that matters |
| **Keyboard / touch** | **Not text selection.** The filing exposes a keyboard-navigable list of pinnable passages — arrow keys move the pin, Enter selects, and the excerpt is announced. Text-selection interaction would be unusable by keyboard and unreliable on touch |
| **Reduced motion** | No scroll-to-pin travel. The pin jumps and the excerpt appears in place |
| **Compact screen** | Split becomes stacked: filing above, active passport field as a pinned bottom sheet showing only that field. Never two fields at once below `lg` |

**The design decision that carries this control: a wrong answer produces a wrong passport, not a
red X.** If the learner pins `repPdEnd` as the holdings date, the passport reads
*"holdings as-of 2027-02-28"* — a date that has not happened yet. Nothing marks it incorrect.
The learner sees a fund reporting what it held in the future, and repairs it. This satisfies the
master prompt's "explain the causal reason, not only correct/incorrect" without a feedback
banner, and it is the same technique the mission is teaching: read the artifact, notice what
cannot be true.

Graduated hints, in order: clarify the field → recall the term → name the section of the filing
→ narrow to the paragraph → show the answer with its reasoning.

### C3 — The number that measures nothing *(beat 5)*

| | |
| --- | --- |
| **Learner decision** | AGG reports 62% turnover; SGOV reports 0%. Which fund trades less? |
| **Visible financial result** | Choosing SGOV opens Form N-1A Item 3(d)(ii) beside the two filings, and the calculation re-runs with the exclusion applied. The readout: **"0 of 24 positions included in the calculation."** The rate is not low — the denominator is empty |
| **Misconception exposed** | That a filed figure means what its name suggests. This is the mission's strongest single beat: the number is real, correctly filed, audited, and describes nothing about this fund |
| **Keyboard / touch** | Radiogroup, two options, 44px targets |
| **Reduced motion** | Static throughout — the recomputation is a state change, not an animation |
| **Compact screen** | The two filings stack; the rule stays pinned above the readout |

Every product's passport carries the turnover field with a "not comparable across mandates"
flag, so the learner meets the caveat before this beat explains it.

### C4 — Overlap X-Ray *(beat 4, the payoff)*

| | |
| --- | --- |
| **Learner decision** | Assign verified products to sleeves licensed in Mission 10 and set weights against Mission 5 |
| **Visible financial result** | The look-through table — issuer, direct weight, weight via each fund, total, coverage — and the headline: **99.88% of VOO is already inside VTI** |
| **Misconception exposed** | That holding two funds is diversification. The learner has built a growth sleeve out of two tickers and one portfolio |
| **Keyboard / touch** | Sleeve assignment is a radiogroup per product; weights are numeric inputs, never drag-only. The table is the primary artifact and is fully navigable |
| **Reduced motion** | Containment renders in its final geometry; no morph or draw-on |
| **Compact screen** | Table first and always. The diagram is secondary and may be omitted below `sm` without loss |

**The visual is a containment diagram, not a network.** VTI as an area, VOO drawn inside it, a
0.12% sliver outside. The geometry *is* the number, so the picture cannot drift from the data —
and it collapses to the table without losing the finding. The diagram is `aria-hidden`; the
table is its accessible equivalent, not a fallback.

Three disclosures are part of the control, not footnotes:

- **Issuer aggregation is on by default and can be turned off.** Off, Alphabet shows as two
  CUSIPs at 2.67% and 2.11%, ranking fifth and seventh. On, it is one issuer at 4.78% and ranks
  third. The toggle exists so the learner sees the difference the key makes — it is the identity
  lesson from C1, one level down.
- **A residual band.** Reported weights sum to 100.25%, 100.14%, 101.88%, 108.82%. The excess is
  drawn, labelled, and never normalised away.
- **Two as-of dates on every cross-sponsor figure.** Vanguard 2026-03-31, iShares 2026-05-31.
  There is no common snapshot and the interface does not imply one.

### C5 — What the stale file can and cannot tell you *(beat 5)*

| | |
| --- | --- |
| **Learner decision** | VTI's holdings are 138 days old. Given three claims about the slate, select the ones the data actually supports |
| **Visible financial result** | Each claim is stamped supported or unsupported against the as-of date, with the reason. The overlap figure stays on screen the whole time, gaining a staleness band rather than a warning icon |
| **Misconception exposed** | That stale data is either fine or useless. It is neither — it supports some claims and not others, and the skill is telling which |
| **Keyboard / touch** | Checkbox group with a named reason per item |
| **Reduced motion** | Static |
| **Compact screen** | Claims stack; the figure stays pinned above them |

### C6 — Order rehearsal *(beat 6)*

| | |
| --- | --- |
| **Learner decision** | Build a draft: exact identity, direction, approximate amount, order type |
| **Visible financial result** | A draft record carrying the estimated spread and friction from the Mission 8 budget, an available-cash and policy-range check against Mission 5, order-type trade-offs from the cached SEC order-types source, market-hours and price-uncertainty warnings, and directional account-context and tax flags |
| **Misconception exposed** | That naming the ticker identifies the order. The identity field **cannot be satisfied by a ticker alone** — it requires the share class, which is the whole mission arriving at the moment it matters |
| **Keyboard / touch** | Ordinary labelled form controls, visible focus, errors tied by `aria-describedby` and named locally beside the field |
| **Reduced motion** | Static |
| **Compact screen** | Single column; no field pair side by side under `sm`; nothing below 12px |

**Safety, designed in rather than disclaimed.** There is no submit control anywhere in the
lesson, because there is nothing to submit to — no endpoint exists to disable. The terminal
action reads *"Save draft to Dossier."* No brokerage chrome, no confirmation styling, no
order-status language, no field that could accept a credential or an account number. The draft
closes with a plain statement that nothing was transmitted, and that statement is a fact about
the build, not a reassurance.

## Build order under scope pressure

1. **C2, the Prospectus Lens** — it carries beats 2 and 3, half the mission, and every later
   control depends on the learner trusting a field they found themselves.
2. **C4, the X-Ray** — the payoff and the most memorable finding.
3. C1, then C6, then C3, then C5.

If only one control survives, it is C2. If two, C2 and C4.

## Non-negotiables carried into Gate D

- Every visualisation ships a table equivalent, and on narrow screens the table is the primary
  artifact rather than a fallback.
- A stage is a screen. Stages that overrun get **split**, never sealed inside a scroll box. The
  Lens is the standing risk: it must show one pinned excerpt in a fixed frame with internal
  scroll on the filing pane only.
- **LEI is the issuer key.** Not name, not CUSIP, not ticker. A name normaliser silently splits
  Alphabet and understates the largest position in the portfolio.
- Products are reached from a licensed sleeve. No screen presents the four as a menu, ranks
  them, or scores them.
- A fund beating its index is never rendered as favourable — S37-4. SGOV's positive gap against
  its spliced benchmark surfaces as a prompt to inspect the benchmark.
- No live data, no auto-refresh, no runtime scraping. Every figure is a filed value with an
  accession and an as-of date.
- Nothing computes personal tax. The account-context flags are directional warnings.
- Mission 10's Architecture License and Mission 11's Timing Policy must both be valid and
  current before C4 can save — including an explicit `no timing` policy.
- Light-surface check: no hard-coded dark surface may bypass `.ops-theme-light`; every variant
  and disabled state gets verified against its actual rendered surface, not its token.

## Gate C status: **closed**

`Blocked - implementation` not triggered. Gate D is next: the shell, six controls, progress
wiring, downstream invalidation, and the Holdings Slate artifact. Gate E is browser QA at 390,
768, 1024, 1280, 1440 and 1920 in both themes, keyboard-only, and reduced-motion, with page
height reported in screens at each width.

---

## Amendment, 2026-08-17 — C4 and C6 each split across two screens

Gate E measured C4 (Overlap X-Ray) at 1.92 screens of content and C6 (order rehearsal) at 1.96,
against the Screen Budget Rule's 1.5. Both are now two screens. No control's decision, financial
result, misconception, keyboard path, reduced-motion equivalent or compact behaviour changes —
only where the fold falls.

- **C4 → C4a look-through** (issuer/instrument toggle, blended table, coverage, as-of dates,
  identity-conflict disclosure) **and C4b the finding** (the recorded overlap headline, the
  "two funds, one portfolio" statement, the repair, and the issuer-level result after it).
- **C6 → C6a build the draft** (share-class identity, direction, order type, amount) **and C6b
  save** (draft summary with warnings behind a disclosure, upstream blockers, save).

The safety property is unchanged and remains structural rather than enforced: `OrderDraft.transmitted`
is typed `false`, there is no submit control on either screen, and no submission endpoint exists.

Result: all eight stages measure **≤1.47 screens of content at 1440×900**, the width the Screen
Budget Rule names. Narrower widths remain above the limit and are reported in the release
evidence rather than smoothed over.

---

## Amendment, 2026-08-17 — the radiogroup moved to the ARIA practice

Browser QA surfaced it: the hand-rolled `Choice` pattern, copied into Missions 11 and 12,
made every option its own tab stop and left the arrow keys inert. Operable by keyboard, but
not what a screen reader user is told a radiogroup will do, and a five-option group cost five
tab stops on the way to the next control.

`components/lessons/investment-foundations/ChoiceGroup.tsx` now provides one implementation
for both missions:

- **Roving tabindex** — exactly one option in the tab order, following the selection, or the
  first option when nothing is chosen yet.
- **Arrow keys move and select**, wrapping at both ends; **Home** and **End** jump.
- Enter and Space still select, because the options are buttons.

Two of Mission 11's groups wrapped their heading *inside* `role="radiogroup"`. The heading
moved out — both the pattern and what the group's `aria-label` already said.

Guarded by `e2e/radiogroup-a11y.spec.ts`. All four of its tests were confirmed to fail against
the previous implementation before being kept.
