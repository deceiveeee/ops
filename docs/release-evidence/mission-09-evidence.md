# Release evidence — Mission 9: Test the Claim

**Date:** 2026-08-12 · **Lesson:** `if-7-1-test-the-claim` · **Spine:** `pb-09`
**Plan:** `docs/lesson-plans/mission-09-evidence.md`
**Source:** Damodaran, *Investment Philosophies*, Session 8 of 38 — "Market
Efficiency II: Testing market beating schemes and strategies"
**Modern methodology:** William F. Sharpe, ["The Sharpe Ratio"](https://web.stanford.edu/~wfsharpe/art/sr/SR.htm),
Stanford University; reprinted from *The Journal of Portfolio Management*, Fall 1994
**Release status:** `Ready for review` as of 2026-08-14 — the three gates that held this at
`Blocked - implementation` are closed, and closing the first one exposed and fixed a real
persistence defect. See "Gate closure, 2026-08-14" below.

## What ships

A seven-stage guided journey ending in a saved Evidence Test Checklist, the
seventh artifact in the Portfolio Dossier.

1. **Joint test** — excess returns are evidence about the strategy *and* the risk
   model. The only defensible answer is "any of the above".
2. **Yardstick** — Sharpe, Information, Jensen, Treynor. The learner judges one
   strategy on raw return, then on excess return per unit of total risk using a
   clearly shown 3% illustrative risk-free rate, and finds the two disagree.
3. **Event study** — the four steps, then reading a window: drift before, jump
   on the day, drift after, each assigned a cause.
4. **Portfolio study** — the five steps and the source's own low-PE table; the
   learner computes the extreme spread as a number.
5. **Regression** — which variable is dependent, and what a significant
   coefficient does not establish.
6. **The sins** — six cardinal, four quieter; the learner picks the sampling
   design that survives survivor bias.
7. **Checklist** — the claim is charged for risk and for the learner's own
   friction budget from mission 8, then the checklist is written and saved.

## Calculations verified against the source's own solutions

Each was recomputed here and then read back out of the running page:

| Quantity | Expected | Rendered |
| --- | --- | --- |
| Sharpe, strategy ((12% − 3%) ÷ 30%) | 0.30 | 0.30 |
| Sharpe, market ((10% − 3%) ÷ 20%) | 0.35 | 0.35 |
| Extreme PE spread, 2.61% − (−1.95%) | 4.56% | accepted as correct |
| Required return, 3% + 1.2 × (9% − 3%) | 10.2% | 10.2% |
| Delivered after costs, 11% − 1% | 10.0% | 10.0% |
| Excess | −0.2% | −0.2% |
| Break-even beta, (11 − 1 − 3) ÷ 6 | 1.1667 | 1.1667 |

The friction charge is the learner's own saved figure when they have one, and
falls back to the source's 1% when they do not.

## Source handling

Three extraction artefacts repaired before use (`dentify`, `scaoer plots`,
`increasing unwieldy`). One authorial slip left visible rather than silently
corrected: the source's regression slide transposes "independent" and
"dependent". OPS teaches it correctly and says so in the feedback, because a
learner who later reads the deck should not think they misremembered.

One source-era methodological defect is corrected explicitly. Damodaran's slide
and quiz divide total return by standard deviation and call the result Sharpe.
Sharpe's official Stanford article defines the ratio using differential return;
with a risk-free benchmark, OPS therefore uses `(return − risk-free rate) ÷
standard deviation`. The illustrative 3% rate produces 0.30 versus 0.35 and
preserves the source exercise's verdict without preserving its formula error.

Both worked studies are dated historical evidence — CBOE option listings from the
1970s, NYSE low-PE portfolios 1988–1992 — and are labelled as such on the page.
No live market data. The corpus itself stays untracked.

## Verification

Sharpe-correction checks run on 2026-08-12:

- `npm run typecheck` — clean
- `npm test` — 108/108 across 17 files, including all-artifact persistence round trips
- In-app browser Stage 2 walk — the 3% illustrative risk-free rate, standard Sharpe
  formula, 0.30 strategy result, 0.35 market result, wrong-answer feedback, and correct
  advance path all rendered as intended; no lesson console errors were observed
- `npx playwright test e2e/lesson-typography.spec.ts --grep "if-6-1|if-7-1"` — 2
  lessons passed. Mission 9 walked all 7 stages and passed the 375px no-horizontal-overflow
  audit

The remaining observations below are retained as the original Mission 9 implementation
evidence. They are not presented as fresh verification of the corrected Stage 2 render:

- `npx playwright test` — 32 passed, 1 skipped, including the typography gate
  walking all **24** lessons (`if-7-1` walks 7 of 7 stages)
- Browser, desktop: h1 60px Fraunces, lead 20px Inter, stage title 30px, no
  monospace anywhere, no horizontal scroll
- Browser, 375px: page does not scroll sideways, nothing under the 12px floor.
  The one element wider than its box is the source panel's decorative blur,
  which is `overflow-hidden` by design — no text is clipped
- Walked the whole lesson by hand: all seven stages answer, the shell reports
  7 of 7 complete, the artifact writes to `ops-if-evidence-checklist-v1`, and
  the dossier renders it as "1 of 7 artifacts recorded" with all six fields

## Gate note

The typography gate could not answer stage 4 on its first run — it asks the
learner to *type* the spread, and no search can guess a number. Rather than
lower the question to multiple choice to suit the test, the gate's answer-key
mechanism was extended to type exact values (`type:pe-spread=4.56`). The test
now walks the lesson without the lesson being reshaped around the test.

## Gate closure, 2026-08-14

The three open gates were left as manual checks, which is why they were never re-run after
the Stage 2 Sharpe correction. They are now tests in `e2e/mission-09-evidence.spec.ts`, so
they run every time. All commands below were actually executed on 2026-08-14.

### A real defect, found by closing the persistence gate

`EvidenceJourney` never passed `initialCompleted` / `initialStage` to
`ValuationJourneyShell`. The shell supports durable restore and mission 5 uses it; mission 9
did not wire it. **A hard refresh reset all seven stages to "0 of 7 stages complete" while
the saved checklist was still in the dossier.** The learner's artifact survived; the visible
record of their work did not.

Fixed by restoring from `evidenceChecklist.updatedAt`, gated on the store's `ready` flag,
with a remount key — artifacts load in an effect, so the shell's state initialisers see
nothing on first paint. This is the same pattern mission 5 uses.

The test failed on this defect before the fix and passes after it, with the assertion
unchanged. It is a real gate, not a fix confirming itself.

### Results

| Gate | Result |
| --- | --- |
| Hard-refresh persistence | **Pass, after the fix above.** Walk all 7 stages, save, `page.reload()`, still "7 of 7 stages complete"; `/dossier` renders all six fields and the learner's own text. |
| Keyboard-only | **Pass.** Stage 1 answered with Tab and Enter alone — option reachable, `aria-pressed` flips, check button reachable, shell advance offered. No mouse in the test. |
| Reduced motion | **Pass, as a content-visibility gate.** Every stage stays fully opaque and the lesson stays completable. Deliberately not a differential motion assertion — see the finding below. |
| Screen budget, 6 widths | ~~Pass, 1.00 screens at every width~~ — **withdrawn, that measurement was wrong. See the correction below.** |
| `npm run typecheck` | Pass, clean. |
| `npm run lint` | Pass; 2 pre-existing `react-hooks/exhaustive-deps` warnings in onboarding, no errors. |
| `npm test` | 179 passed, 21 files. |
| `npx playwright test` | **40 passed, 1 skipped** (the cloud-merge test), 0 failed. |
| `npm run build` | **Pass** — 97 static pages. Never run during missions 8, 9 or the gate work before today. |

Also fixed in the same pass: `e2e/portfolio-workbench.spec.ts`'s "teaches and retries an
incorrect Preflight relationship", red since mission 5. It assumed clearing the preflight
auto-advances. Only the readiness save does; both preflight paths move on from the shell, so
the test now presses it, matching what the all-correct path already did.

### Correction: the screen-budget measurement was wrong, and mission 9 is over budget

The first run of this gate reported **1.00 screens at all six widths**. That was a bad
measurement: the dev server was still compiling the route, so `scrollHeight` equalled
`innerHeight` on a page that had not rendered. Exactly 1.00 at six different widths is the
signature of an empty page, and it should not have been reported as a pass.

Re-measured on 2026-08-14 with a settle delay, alongside mission 10:

| Lesson | 390px | 1440px |
| --- | ---: | ---: |
| `if-7-1-test-the-claim` | **2.98 screens** | **2.12 screens** |
| `if-8-1-choose-passive-or-prove-an-edge` | **3.12 screens** | **2.64 screens** |

The limit in `AGENTS.md` is 1.5. **Both missions breach it**, and mission 9's breach is not
caused by mission 10 — it was there when mission 9 shipped and this gate simply never
measured it correctly.

The journey shell itself is ~820px and fits inside a 900px viewport. The overflow is the
surrounding page: the lesson hero, the source panel and the layout chrome stack beneath the
shell rather than beside it. That is `IFLessonLayout`, shared by every Investment Foundations
lesson, so the fix is a layout change with course-wide blast radius rather than a mission 9
or mission 10 edit. Recorded as an open item, not silently left as a pass.

### Finding, out of scope and not fixed: the shell's motion never runs

While building the reduced-motion gate, two candidate differential assertions both proved
vacuous. `ValuationJourneyShell` gates two effects on `useReducedMotion()` — a pulsing guide
mark and a 240ms stage enter transition — and **neither animates, whatever the preference.**

Probed 2026-08-14 with `prefers-reduced-motion: no-preference`, media query confirmed
`false`: the stage container is only ever `opacity:1;transform:none`, so the declared
`initial={{ opacity: 0, x: 18 }}` never lands, and both `element.getAnimations()` and
`document.getAnimations()` are empty.

This is why the reduced-motion test asserts content visibility instead: a test claiming
"reduced motion removes the animation" would pass on a still element and prove nothing. The
first version of the test did exactly that, and its paired self-check is what caught it.

`useReducedMotion` appears in 472 places across the app, so if the cause is shared, motion
may be inert well beyond this shell — `AGENTS.md`'s animation rules would not be reaching
the learner. Diagnosing that is an app-wide investigation, not mission 9's QA, so it is
reported rather than fixed.

## Open items

- Mission 10 must read this checklist alongside the Friction Budget: a claim that
  fails either is not an edge.
- The motion finding above is unresolved.
- Mission 10's Gate A was closed on 2026-08-14 by stakeholder-approved narrowing, not by
  source acquisition; the S&P persistence report is still uncached. See
  `docs/mission-10-gate-and-build-plan.md`.
- Nothing in this pass was committed or pushed.
