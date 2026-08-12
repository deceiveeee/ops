# Release evidence — the typography gate now walks every stage

**Date:** 2026-08-12
**Change:** `e2e/lesson-typography.spec.ts` (rewritten), `app/globals.css`,
`components/lessons/investment-foundations/IFSourcePanel.tsx`,
`components/dossier/PortfolioDossier.tsx`

## What the gate could see before

The spec measured computed typography — size, contrast, caption-versus-content
hierarchy — on the **entry stage of each lesson only**. Every stage after the
first is gated behind a correct answer, so nothing in the suite had ever looked
at them. Its own closing comment said so. Since no lesson component has a unit
test either, scenes 2 and later of all 23 Investment Foundations lessons were
unverified by anything except a person looking at them.

## What it does now

For each lesson it reads the stage count from the shell, then repeats:

1. audit the rendered scene on arrival;
2. answer the stage;
3. audit it again with feedback and result panels on screen;
4. advance, and **assert the stage index actually moved**.

A stage it cannot answer fails the test, naming the lesson, the stage and the
clicks it tried. Silently auditing only what happens to be reachable is exactly
how the entry stage became the only verified part of the product.

There is no per-lesson answer key. Completion is read from the counter each
shell already prints for the learner ("3 of 7 stages complete", "2/4 verified"),
and the answer is found by two searches over the stage's own controls:

- a **sweep** — hold one control, try each control after it — which covers
  reveal-then-continue, single choice with a commit button, and written answers;
- a **combination search** over controls grouped by their parent, for stages
  that hold several questions at once and complete only when every one is right,
  plus the artifact stages that need choices followed by a save.

Wrong answers are harmless here — nothing locks out after a miss — and the
incorrect-feedback panels a search opens are lesson copy the audit should be
reading anyway.

## The gate's own gate

`the gate still fails on the defects it was built to catch` plants a caption
over a parallel group, 9px text, and a grey-on-grey line into a real lesson page
and requires all three kinds of finding to come back. Every check in this file
has been silently disabled once already — an over-permissive eyebrow exemption
made the hierarchy check unreachable while the suite stayed green — so the
checker is now itself checked.

## Defects this found (all fixed)

**Contrast** — five of the six are one root cause: a colour picked against white
that is actually used on the `#EFEFF2` panel grey, or a Tailwind variant the
light theme never mapped.

| Where | Measured | Cause |
| --- | --- | --- |
| `disabled:text-accent-green` on completed actions ("−22% revenue · tested") | **1.92:1** | light theme remaps `.text-accent-*` and their `hover:` variants but not `disabled:`, so the dark-theme green rendered on a white panel |
| Disabled advance button ("Find the widest spread →") | 4.15:1 | same gap, `disabled:text-slate-500` |
| "stage complete" lines, `#15803D` | 4.37:1 | light-theme green chosen against white; the lines sit on `--ops-surface-2` grey |
| Cyan accent `#007A8A` ("Investor question:") | 4.41:1 | same, chosen against white |
| `--ops-text-tertiary` `#6e6e73` on inset panels | 4.42:1 | same |
| `/dossier` "Not yet" status pill | 4.23:1 | `text-slate-500` on the dark dossier page |

**Size** — the shared `MasteryCheck` (`components/lessons/present-value-relations/`)
renders its title, its pass rule ("Pass with 4 of 5 correct"), its question
numbers and its completion banner at **11px**, under the 12px floor the
readability pass established. It sits at the end of a gated journey, so nothing
had ever reached it. Raised to 12px; this component is shared with Finance
Foundations, so those lessons gain the fix too.

**Hierarchy** — six artifact summary cards ("Research card ready", "Provisional
fit charter", "Decision record", …) titled their three-to-six rows of content
with a 12px caption, the smallest text in the block. Each is now an `h3` at 15px
in the same typeface and accent colour. The lesson source panel's title and the
dossier empty state gained heading semantics with no visual change.

Four of the contrast defects, the size defects and all six hierarchy defects were
invisible to the old gate because they only exist once a stage is answered; the
remaining two because the audit was scoped to the journey element, not `main`.

WCAG AA is now **enforced** rather than reported (3:1 for large text, per the
standard's own rule), which is what those fixes bought.

## Gates

- `npm run typecheck` — clean
- `npm run lint` — clean (2 pre-existing `react-hooks/exhaustive-deps` warnings
  in the onboarding code, untouched here)
- `npm test` — 104/104
- `npx playwright test e2e/lesson-typography.spec.ts` — **27/27**, every stage of
  all 23 lessons walked (117 stages, each audited on arrival and again once
  answered)
- `npx playwright test` — 31 passed, 1 skipped: the whole e2e suite, including
  onboarding and progress

The walker was made deterministic before this was called done: at an 8ms settle
it read the DOM before React had committed under parallel load, and a different
set of lessons failed on each run. It now waits two frames plus 40ms, and two
consecutive full runs named the same result.

## Known limits

- Two stages are answered from a written-out key (`ANSWER_KEYS`) rather than by
  search: a "select every correct answer" question, where the answer is a set,
  and a stage that asks five questions in a row. If that copy changes, the gate
  fails with a `key miss:` line naming the label it could not find.
- The audit reads what is painted at desktop width, then checks horizontal
  overflow at 375px on the last stage reached. It does not judge spacing,
  rhythm, or whether a scene reads well — that still needs a person.
- Lesson components still have no unit tests. This gate is the only automated
  check that exercises their later scenes at all.
