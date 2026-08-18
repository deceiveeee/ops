# Release evidence — Mission 10: Choose Passive, or Prove an Edge

**Date:** 2026-08-14 · **Lesson:** `if-8-1-choose-passive-or-prove-an-edge` · **Spine:** `pb-10`
**Plan:** `docs/lesson-plans/mission-10-architecture.md`
**Audit:** `docs/source-audits/mission-10-architecture-edge.md` (§11 records Gate A closure)

**Release status:** `Ready for review`, with one gate explicitly **not met** — the screen
budget. See §5. Nothing here was committed or pushed.

## 1. Gate A closed by narrowing, not by acquisition

The S&P DJI Persistence Scorecard was never obtained. Re-probed 2026-08-14: the versioned
PDF, the article page, an honest descriptive user-agent, and `spglobal.com/robots.txt` all
return **HTTP 403** — a host-level block, not the missing-user-agent problem diagnosed for
the SEC sources. No browser impersonation was attempted.

The stakeholder approved a narrowed claim set on 2026-08-14 (authority rank 1). Exactly one
coverage-matrix row was removed: *current persistence evidence must distinguish short-horizon
rank continuation from long-horizon persistence and attrition.* **Mission 10 makes no claim
about what current persistence data shows.** It teaches persistence as a test — Session 36's
25% no-continuity null — which is a complete argument without the statistic.

The removed claim is **additive, not load-bearing**: no stage, gate, calculation or
assessment answer depends on a persistence figure, so obtaining the artifact later adds a
citation rather than forcing a redesign.

Recorded in the data model as `sourceBoundary`, a new field kept distinct from `sourceGap`.
An open gap blocks a mission and forces `planned`; a boundary is resolved and shippable. A
unit test now enforces that no mission claims both.

## 2. What ships

A six-stage journey ending in a saved Architecture and Edge Decision, the eighth dossier
section.

1. **Default** — passive as the evidence-based starting point. Morningstar's 25% is shown
   with its denominator, date and survivorship handling, never as a bare percentage.
2. **Model** — a strategy two points a year ahead of the market, charged for risk and for the
   learner's own friction, ending at **−0.2% alpha**.
3. **Streak** — a four-year top-quartile run against the 25% null.
4. **Licence** — the switchboard. Every unmet condition is named beside a disabled control.
5. **Transfer** — an unfamiliar proposal with a strong record, no hints.
6. **Decision** — saved. **A fully passive portfolio is a complete mastery outcome.**

## 3. Calculations independently recomputed

Recomputed here rather than copied from the source solution or the audit:

| Quantity | Expected | Rendered |
| --- | --- | --- |
| After-cost return, 11% gross less 1% | 10% | 10% |
| CAPM required, 3% + 1.2 × (9% − 3%) | 10.2% | 10.2% |
| Alpha | **−0.2%** | −0.2% |
| Break-even beta, (10 − 3) ÷ (9 − 3) | 1.1667 | — (not surfaced) |
| Quartile null, 1 ÷ 4 | 25% | 25% |
| Net edge, 4% gross less 1.2% friction | 2.8% | 2.80% |
| Loss contribution, 20% × 40% | 8 points | blocks against a 6-point budget |
| Morningstar large-blend gap, 15.2 − 13.9 | 1.3 pp | quoted as scope, not as success rate |

The 10.5% success rate and the 1.3pp return gap are deliberately never conflated, in code or
copy.

## 4. Tests

| Command | Result |
| --- | --- |
| `npm run typecheck` | Clean |
| `npm run lint` | 2 pre-existing warnings in onboarding, no errors |
| `npm test` | **200 passed**, 22 files |
| `npx playwright test` | **46 passed, 1 skipped, 0 failed** |
| `npm run build` | Pass — 98 static pages |

**`lib/architecture-license.test.ts` — 19 tests, and they can fail.** The gate evaluator was
verified by planting a defect: disabling the loss-budget check turned exactly one test red —
the one that claims to guard it — and no others. Reverted and re-confirmed green.

Behaviour covered in `e2e/mission-10-architecture.spec.ts`:

- a 40% claimed edge with nothing behind it leaves the sleeve disabled and **all nine**
  unmet conditions named;
- a sleeve licenses only when every condition is met;
- a sleeve breaching mission 5's loss budget or position ceiling stays disabled;
- a fully passive decision saves, survives a reload, and reaches the dossier **without**
  rendering empty sleeve rows.

The typography gate walks all six stages. **One keyed stage**, within the budget of one: the
final stage needs a review date, and the solver's generic `fillFields` only fills text
fields, so a date input needs `type:passive-review=2027-08-14`. All prose fields are filled
generically.

## 4a. Stage 4 rebuilt after review — it was leaving the learner stranded

Stakeholder review of the first build found stage 4 unusable, and the criticism was correct.
The stage asked the learner to *produce* an edge claim, which broke the sequence
`AGENTS.md` requires (introduce → model → guided practice → independent application) and the
rule that a learner must be able to answer from the lesson itself. The phase prompt had
specified guided practice one field at a time; the first build collapsed it into a blank
form. Three specific defects:

1. **No subject.** The plan called for "their watchlist candidate **or a supplied practice
   candidate**" and the practice candidate was never built, so a learner without mission 7
   work faced empty boxes with nothing to write about.
2. **Labels were jargon, not questions.** "The pocket that is mispriced" names the concept
   and gives no clue what to type.
3. **It marked the learner down before they started** — an untouched form showed a red
   −1.00% net edge.

Fixed:

- A written practice claim — a spin-off stub story — now sits at the top of the stage. It is
  deliberately *not* pre-sorted into the fields: extracting the structure from a narrative is
  the exercise. It also suggests a 20% position, which trips the mission 5 ceiling and loss
  budget when the learner takes the suggestion at face value.
- Every label is a plain question ("Who is selling too cheaply, and why do they do it?"),
  with a one-line reason it is being asked and a concrete worked example beneath the box.
  The example sits under the field rather than as placeholder text, which vanishes exactly
  when it is still needed.
- The net-edge readout stays neutral until a figure is entered.
- The stage instruction and guide line now say what to do rather than naming the widget.

## 4b. Rail defect found in review — wrong module shown on mission 10

Stakeholder review found the sidebar rail showing **"Investment Foundations · Missions 1-2"**
on mission 10's page, listing the four philosophy lessons.

`IFProgressRail` picks the group whose lessons contain the active slug and **falls back to
the first group when nothing matches**. `IF_MODULE_8_LESSONS` was created in `shared.tsx` but
never added to `JOURNEY_GROUPS`, so mission 10 hit that fallback and rendered a confidently
wrong module rather than failing visibly.

Scope, measured rather than assumed — every IF lesson was checked in the browser:

| Lesson | Before | After |
| --- | --- | --- |
| `if-1-1` … `if-7-1` (8 lessons) | correct module | unchanged |
| `if-8-1-choose-passive-or-prove-an-edge` | **Missions 1-2** | **Mission 10** |

So the defect was confined to mission 10 — my omission, not a course-wide fault.

Also fixed in the same pass: the rail's saved-artifact counter never included
`architectureDecision`, so saving mission 10's artifact would not have incremented "N saved
lesson artifacts".

`components/lessons/investment-foundations/IFProgressRail.test.ts` now asserts that every IF
lesson resolves to exactly one rail group, that no lesson is listed twice, and that every
listed lesson actually renders. **Verified it can fail:** removing the module 8 group turns
it red naming `if-8-1-choose-passive-or-prove-an-edge`, and nothing else. The silent fallback
remains — it is the right runtime behaviour — but a missing module is now a failing test
rather than a page that looks fine.

## 4c. Licence stage rebuilt, one question at a time

Stakeholder review found the licence stage unusable: eleven empty textareas with
noun-phrase labels and no claim to write about. The first repair — adding a practice
claim, help lines and worked examples — fixed the confusion and **tripled the stage's
height**, which a new screenshot harness then caught.

Both defects had one cause. The phase prompt specifies *"guided practice tests one field at
a time and reveals why the sleeve stays disabled"*; a single eleven-field form was built
instead.

Rebuilt as one question per step: eleven questions, each with its own plain-language
question, a reason it is being asked and a worked example, then a verdict step showing every
condition met and unmet. The claim sits in a strip that is open on question one and collapses
after, and it can be reopened. Declining is offered from the first question rather than after
answering eleven. Advancing requires an answer, so the flow cannot be skipped.

Measured at the licence stage, learner's working window versus content inside it:

| | 390px | 1440px |
| --- | --- | --- |
| Original form | 246px / **6,600px** | 442px / **3,672px** |
| After one-question rebuild | 217px / 1,357px | 446px / 831px |
| After collapsing the claim strip (steady-state question) | 217px / 795px | 446px / 645px |
| After tightening the six stage guides | **322px** / 795px | 446px / 645px |

Content fell **88%** at 390px, and the working window grew 48% once the guide copy was cut.
The nested-scroll ratio went from roughly 30× to 2.5×.

**Not fixed, and not mission 10's to fix.** The remaining constraint is the shell itself: at
390px the progress header, guide panel and footer consume about 480px of an 800px frame,
leaving 322px to work in. That is `ValuationJourneyShell` and `IFLessonLayout`, shared by
every Investment Foundations lesson, and changing it needs its own QA pass across the course.

## 4d. The harness that caught it

`e2e/capture-ui.spec.ts` renders any route at the six required widths and writes screenshots
plus a report of page height, **nested scroll regions** and console errors. It skips unless
`OPS_CAPTURE_URL` is set. `agent/rubrics/visual-quality.md` holds the review criteria,
ordered by what has actually caught defects here; `.claude/skills/visual-audit/` makes it a
procedure rather than a good intention.

This exists because every defect a human found in this mission — the textarea wall, the wrong
rail module, the nested-scroll trap — passed every DOM and typography assertion. The first
run also produced a false positive worth recording: a `fullPage` capture shows a `sticky`
header stranded mid-page. It was verified as an artifact rather than reported as a bug, and
that guardrail is now written into the rubric.

## 5. Screen budget — not met, and a correction to mission 9's record

Measured at six widths, 900px tall, after the layout fix below:

| Width | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Mission 10 | 3.12 | 2.71 | 2.34 | 2.24 | 2.24 | 2.24 |
| Mission 9 | 2.98 | 2.58 | 2.24 | 2.12 | 2.12 | 2.12 |

No sideways scroll at any width. **The limit is 1.5 screens, so this gate fails.**

**A correction.** Mission 9's evidence originally recorded 1.00 screens at all six widths.
That was a bad measurement taken while the dev server was still compiling the route, so
`scrollHeight` equalled `innerHeight` on a blank page. Exactly 1.00 at six different widths
is the signature of an empty page. It has been withdrawn in that file; mission 9 was over
budget when it shipped and the gate simply never measured it.

**A regression this mission did introduce, and fixed.** Mission 10 first measured 2.64 at
1440px against mission 9's 2.12. The cause was not lesson content: the sidebar progress rail
lists every module, so adding mission 10's module grew it from 1245px to **1736px**, at which
point the rail overtook the lesson column and the *course's own length* set page height —
getting worse with every future mission. `IFLessonLayout`'s rail is now sticky with a
viewport height cap and internal scroll. Mission 10 dropped to 2.24, within 0.12 screens of
mission 9.

**The remaining breach is structural and course-wide.** Page chrome is ~608px and the journey
shell ~804px, so ~1.57 screens is the floor for any Investment Foundations lesson before a
single word of hero copy. Bringing the course under 1.5 means changing the shared page
composition, which touches every IF lesson and needs its own QA pass. Reported rather than
absorbed into this mission.

## 6. Browser verification

Verified through the dev server on `localhost:3000`: the lesson renders, reports "Stage 1 of
6 · Default", exposes all six rail stages, and logs no console errors. Playwright drove the
full walk in both the passive and licensed-sleeve paths.

**Not done:** visual screenshots. The Browser pane was not displayed in this session, so the
page could not composite frames and every screenshot attempt timed out. All browser evidence
above is text-based — DOM, computed styles and network — and no claim here rests on having
looked at the rendered page.

## 7. Open items

- **Screen budget fails** at every width for this mission and for mission 9. Structural.
- The shared shell's `motion/react` animations do not run at any preference (verified
  2026-08-14). Mission 10's leakage bar and switchboard therefore use CSS transitions and
  SVG rather than the motion library, so the mission does not depend on the defect being
  fixed. Tracked separately.
- No visual/screenshot review, per §6.
- Mission 11 must read this artifact: a timing policy needs a licensed architecture to
  deviate from.
- Mission 5's ceiling and stress assumptions are currently the lesson's own visible teaching
  values (15% ceiling, 40% assumed sleeve loss, 6-point budget) rather than being read from
  the learner's saved workbench allocation. Wiring those through is the natural next
  increment.
- `IF_LESSON_SLUGS` in `lib/if-progress.ts` is exported but consumed nowhere; it was already
  stale and is now accurate. It is dead code.
- Nothing committed or pushed.
