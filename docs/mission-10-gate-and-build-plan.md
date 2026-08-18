# Mission 10 — gate decision and build plan

**Date:** 2026-08-14 · **Author:** Claude · **Status:** proposal, not authority ·
**Spine id:** `pb-10` · **Mission:** "Choose passive, or prove an edge"

This is **not** the Mission 10 lesson plan. `docs/source-audits/mission-10-architecture-edge.md`
ends with `Blocked - source` and states that no Mission 10 lesson plan or implementation
should begin while that status holds. This document exists to resolve that gate, not to
step around it.

---

## 1. Where the build actually stands

Mission 9 shipped into the working tree: `EvidenceJourney.tsx`, `LessonIF_7_1.tsx`, wired at
`if-7-1-test-the-claim`, `pb-09` set to `available`, and a seventh dossier artifact at
`ops-if-evidence-checklist-v1`. All of it is **untracked** — nothing has been committed
since `adb479b`.

Mission 10 is the next required mission and the course's payoff decision. Missions 8 and 9
exist to feed it: a claim that fails either the Friction Budget or the Evidence Test
Checklist is not an edge.

## 2. A document conflict that must be reported, not resolved by convenience

Two records disagree about whether Mission 10 is blocked.

| Record | Claim | Authority rank (master prompt §"If records conflict") |
| --- | --- | ---: |
| `docs/source-audits/mission-10-architecture-edge.md` | `Blocked - source` | 4 — applicable complete source audit |
| `docs/lesson-plans/missions-10-13-forward-plan.md` §3 | "**Status: unblocked.** The block is satisfied; it needs an audit, not a source hunt." | self-declared "proposal, not authority" |

**The audit is correct and the forward plan is wrong.** The forward plan conflated two
different evidence needs:

- the **current active/passive base rate** — closed by Morningstar's June 2026 barometer,
  which is cached, hashed, and provenance-`ok`; and
- the narrower **current winner-persistence** claim — which only the S&P DJI Persistence
  Scorecard supplies, and which is not cached at all.

The audit anticipated exactly this error: *"Morningstar's June 2026 Active/Passive Barometer
closes the current base-rate need; it does not automatically close the narrower
winner-persistence claim."* The curriculum spine agrees with the audit — `pb-10`'s
`sourceGap` field in `data/courses/portfolioBuilder.ts` says the same thing.

**Action:** correct §3 of `missions-10-13-forward-plan.md` before it is used to schedule
work. It is currently the only record telling a future agent that Mission 10 is ready.

## 3. Gate A, re-verified today

The audit's 403 is dated 2026-08-12. I did not inherit it — I re-probed on 2026-08-14:

| Target | Result |
| --- | --- |
| Versioned PDF, default client | HTTP 403 |
| Official article page | HTTP 403 |
| Versioned PDF, honest descriptive user-agent | HTTP 403 |
| `spglobal.com/robots.txt` | HTTP 403 |

`robots.txt` returning 403 is the decisive detail. This is a **host-level block on the whole
domain**, not a user-agent rule. `scripts/source/fetch-supplemental.mjs` sets no user-agent
at all, so the natural first guess was that a UA would fix it — as the forward plan proposes
for the SEC 403s. It does not, and no honest configuration of the pipeline will. Gate A
**cannot be closed from this environment.**

I did not attempt to defeat the block by impersonating a browser. Spoofing past an access
control is not a source-integrity procedure, and an artifact obtained that way would not be
the canonical provenance the audit requires.

## 4. Three routes, and the one I recommend

### Route A — narrow the claim set (recommended)

`05-mission-10-architecture.md` permits exactly this: *"obtain explicit approval for a
narrower source-backed claim set and document exactly which current persistence claim is
removed."* That approval is a human decision (authority rank 1) and has not been given.

**Precisely what is removed** — one row of the audit's §4 coverage matrix:

> *"Current persistence evidence must distinguish short-horizon rank continuation from
> long-horizon persistence and attrition."* — and the "current empirical" half of the
> quartile-null row.

**Everything else in the matrix is already `Supported`**, including:

- Morningstar June 2026 base rates — 25% ten-year all-category success; U.S. large blend
  10.5% success on 382 starting funds with 62.6% survival; 13.9% active vs 15.2% passive
  asset-weighted; cheapest quintile 33% vs priciest 20% *as association only*. Dated to
  2026-06-30, described only as an "average investable passive peer."
- Session 36's no-continuity quartile null — 25% per quartile, independently verified.
- Session 7 on luck, streaks, and the anatomy of an edge.
- Session 8's fair-test design, with the regression labels and Sharpe definition corrected.
- Session 6's friction channels.

**Why this narrowing costs the mission almost nothing.** Mission 10 needs to teach *that a
streak is not evidence of skill and must be tested against a null*. Session 36 and Session 7
carry that argument completely as method. What S&P would add is a current empirical
reinforcement of a conclusion the learner already reaches by reasoning.

**The design rule that makes this safe:** build the mission so the blocked claim is
**additive, never load-bearing**. No stage, gate, calculation, or assessment answer may
depend on a current persistence figure. If Route B later succeeds, the figure drops into an
existing evidence panel as a citation — not a redesign.

### Route B — operator-supplied artifact

The block is on this network, not on the public. The document is free to read in a browser.
A human can fetch `persistence-scorecard-year-end-2025.pdf` and place it in
`.source-cache/supplemental/raw/`; the pipeline then hashes, extracts, and records
provenance, with the record stating that acquisition was manual rather than automated. The
audit's remaining requirements — full visual review, methodology and table reconciliation —
still apply and are real work.

This is your call to make, not mine to perform. Route B can also run *after* Route A ships.

### Route C — reorder to Mission 11 or 13

Available but it only defers the problem. Mission 11 has its own gate (Session 32 has no
official caption track), and Mission 13 is the capstone that reads every prior artifact, so
it wants 10–12 finished. Mission 10 is also the mission that gives missions 8 and 9 their
point. I would not reorder.

---

## 5. Clear the inherited debt before adding an eighth artifact

**Cleared on 2026-08-14**, before any Mission 10 code. Full results in
`docs/release-evidence/mission-09-evidence.md`.

| Item | Outcome |
| --- | --- |
| Hard-refresh persistence | Closed — and it found a real defect. `EvidenceJourney` never passed `initialCompleted`/`initialStage`, so a reload showed "0 of 7 stages complete" while the artifact sat saved in the dossier. Fixed with mission 5's restore pattern. |
| Keyboard-only | Closed. Stage 1 answerable with Tab and Enter alone. |
| Reduced motion | Closed as a content-visibility gate — see the motion finding below. |
| Screen budget | Measured for the first time: **1.00 screens at all six widths**, no sideways scroll. |
| Red e2e (mission 5 preflight retry) | Fixed. It assumed clearing the preflight auto-advances; only the readiness save does. |
| `npm run build` | Run for the first time — **passes**, 97 pages. Vercel's failure is genuinely the missing `NEXT_PUBLIC_SUPABASE_*` env vars, an operator step, not code. |
| Full suite | typecheck clean, lint 2 pre-existing warnings, 179 unit tests, **40 e2e passed / 1 skipped / 0 failed**. |
| Uncommitted work | Still uncommitted — no commit or push was requested. |

All three accessibility gates are now tests rather than manual checks, which is why they
went unrun after the Stage 2 correction in the first place.

### Carried into Mission 10: the shell's motion never runs

`ValuationJourneyShell` gates a guide-mark pulse and a 240ms stage transition on
`useReducedMotion()`, and neither animates at any preference — verified 2026-08-14 with the
media query confirmed false, `initial={{opacity:0,x:18}}` never landing, and
`document.getAnimations()` empty. `useReducedMotion` appears in 472 places, so motion may be
inert far beyond this shell.

Mission 10 inherits this shell, so its "leakage from gross to net edge" visual should not be
planned around motion until this is diagnosed. It is an app-wide investigation, deliberately
not folded into this build.

---

## 6. The mission, once approved

### Learner sequence

Six stages, each a screen, following introduce → model → guided practice → independent
application → assessment.

1. **The default.** The learner's own Mission 5 sleeves appear with passive implementation
   enabled and the active sleeve disabled. Defines active, passive, benchmark, investable
   passive peer, base rate. Morningstar's 25% is shown with its denominator, date, and
   survivorship handling visible — never as a bare percentage.
2. **A proposal that fails** (model). A worked active sleeve that looks convincing gross and
   dies once the risk model and the learner's *own saved friction number* are charged. This
   is the mission's central visual: the leakage from gross edge → risk-adjusted → net.
3. **Streak or skill** (guided). The learner predicts a top-quartile fund's next quartile,
   then meets the 25% null. Teaches the persistence *test* without asserting any current
   persistence fact.
4. **Build the license** (guided → application). The Architecture Switchboard. Each gate is
   a field; the UI names every unmet condition holding the sleeve disabled. No single field
   and no impressive number unlocks it. Applied to the learner's watchlist candidate or a
   supplied practice candidate.
5. **Unfamiliar proposal** (independent perturbation). A fresh candidate with a winning
   streak the learner has not seen. Enable or disable, and name the evidence that would
   reverse the decision.
6. **Decide and save** (assessment). **A fully passive portfolio is a complete, valid
   mastery outcome** — the mission must never imply the active sleeve is the better answer,
   nor that passive is proof nobody can win.

### Artifact

`ops-if-architecture-decision-v1` — the eighth dossier section.

| Field | Meaning |
| --- | --- |
| `mode` | `passive-only` or `active-sleeve` |
| `coreExposure`, `coreBenchmark` | The passive core and what it is judged against |
| `pocket`, `whoIsWrong`, `correctionMechanism`, `horizon` | The claimed inefficiency and how it resolves |
| `capability` | Why *this* learner could recognise and execute it |
| `falsifiableClaim`, `disconfirming` | The claim and what would refute it |
| `baseRate`, `baseRateDate`, `baseRateScope` | Current category base rate, dated and scoped |
| `evidenceDesign` | Inherited from Mission 9's checklist |
| `grossEdge`, `frictionCost`, `netEdgeRange` | Friction from Mission 8; a range, not false precision |
| `maxAllocation`, `lossContribution` | Inherited from Mission 5's loss budget |
| `durabilityRisk`, `thesisBreak`, `reviewDate` | Imitation risk and the exit condition |
| `sourceDates`, `updatedAt` | High-decay source stamps |

Changing the Mission 5, 7, 8, or 9 artifacts — or a high-decay source date — marks this
record and everything downstream `Review required`.

### Files (one-owner rule applies to the spine)

| File | Change |
| --- | --- |
| `lib/architecture-license.ts` + `.test.ts` | **New.** Pure gate evaluation, unit-tested away from the browser, so "why is this sleeve disabled" is provable |
| `components/.../ArchitectureJourney.tsx`, `LessonIF_8_1.tsx` | **New.** The journey and its lesson wrapper |
| `data/courses/portfolioBuilder.ts` | `pb-10` `planned` → `available`; add `startLessonSlug` and `legacyCompletionSlugs`; replace `sourceGap` with the narrowed-scope note |
| `data/lessons/lessons.ts`, `lib/lessonRegistry.ts` | Register the new slug |
| `lib/if-progress.ts` | Artifact key and dependency invalidation |
| `components/dossier/PortfolioDossier.tsx` | Eighth section |
| `e2e/lesson-typography.spec.ts` | Stage walker — **budget: at most one keyed stage** |
| `docs/source-audits/mission-10-architecture-edge.md` | Record what closed the gate and what was removed; preserve the prior blocked state |
| `docs/lesson-plans/mission-10-architecture.md` | **Only after approval** — the lesson plan proper |
| `docs/release-evidence/mission-10-architecture-edge.md` | Evidence record |

### Definition of done

All eight conditions from `missions-10-13-forward-plan.md` §5, and specifically:

- five commands green — `typecheck`, `lint`, `test`, `playwright test`, **`build`**;
- screen budget measured at **390, 768, 1024, 1280, 1440, 1920** and reported in screens;
- a browser walk of every stage, desktop and mobile, keyboard-only and reduced-motion —
  not code inspection;
- the license evaluator ships with a test that **plants a defect and requires the check to
  report it**;
- release evidence states only what was actually run, including failures.

### Non-goals

No recommendation of active management and no implication that passive is always superior.
No undated empirical numbers. No promise of market-beating results. No watchlist candidate
promoted to an exact product — that is Mission 12. No live fund rankings or market APIs. No
Session 35 locality or concentration anecdote turned into beginner sizing advice. No commit
or push without an explicit request.

---

## 7. Stakeholder decision — recorded 2026-08-14

The human stakeholder was asked and answered on 2026-08-14. This is authority rank 1 under
the master prompt's conflict order.

| Decision | Answer |
| --- | --- |
| Gate A route | **Route A approved** — narrow the claim set. The current manager-persistence claim is removed; the mission is built so that claim is additive, never load-bearing. |
| Sequencing | **Clear the inherited Mission 9 / build debt in §5 first**, before an eighth artifact is added. |

Scope of the approval, stated exactly:

- **Removed:** the audit §4 row *"Current persistence evidence must distinguish
  short-horizon rank continuation from long-horizon persistence and attrition,"* and the
  "current empirical" half of the quartile-null row. No S&P DJI number, chart, paraphrase,
  interaction state, or assessment answer may appear in Mission 10.
- **Retained:** every other row of the §4 matrix, all already marked `Supported`.
- **Not approved by this decision:** lesson release. Mission 10 must still pass its own
  learning, accessibility, screen-budget, and browser gates, and an implementation agent may
  return at most `Ready for review`.

Route B stays open and can run later. Because the narrowing is additive-only, closing Gate A
afterwards adds a citation rather than forcing a redesign.

**Gate A status:** closed by approved narrowing, not by source acquisition. The audit must
record it that way — preserving the prior blocked state and naming exactly what was removed.
