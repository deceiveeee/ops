# Handoff: Open Portfolio Studio — state, conventions, and a request

You are joining a repo another agent (Claude) has been working in. This document
is the state of it, the rules that are not obvious from the code, and a request
at the end. Read the whole thing before touching anything.

---

## 1. What the project is

`C:\Open Portfolio Studio` — a Next.js 14 / React 18 / TypeScript learning
product. Two courses: **Finance Foundations** and **Investment Foundations**. The
Investment Foundations track is being rebuilt as a 13-mission "Portfolio Builder"
path where each mission ends in an artifact, and the artifacts assemble into one
`/dossier` document.

The core product value, stated in `AGENTS.md` and worth internalising before
writing a line: **lessons teach through interaction, not illustrated prose.**
Every lesson is a gated journey — the learner answers a stage before the next one
mounts. A lesson that reads like a textbook with widgets bolted on is a failed
lesson here, regardless of whether it compiles.

## 2. Repo state right now

- Branch: `feature/onboarding-survey`, pushed, tracking `origin`
- HEAD: `adb479b`
- **PR #3 is open**: https://github.com/deceiveeee/ops/pull/3 → `main`.
  191 files, +37k. Do not merge it without the human's say-so.
- `main` has not moved in a while; the branch carries three features (accounts
  and progress sync, the onboarding survey, and the Investment Foundations
  curriculum).

**Uncommitted work in the tree** — mission 9, finished and verified, not yet
committed:

```
M  components/dossier/PortfolioDossier.tsx        (7th dossier section)
M  components/lessons/investment-foundations/shared.tsx
M  data/courses/courses.ts                        (module 7)
M  data/courses/portfolioBuilder.ts               (pb-09 → available)
M  data/lessons/lessons.ts
M  docs/lesson-plans/portfolio-builder-mission-curriculum.md
M  e2e/lesson-typography.spec.ts                  (route + answer key)
M  lib/if-progress.ts                             (EvidenceChecklist artifact)
M  lib/lessonRegistry.ts
?? components/lessons/investment-foundations/EvidenceJourney.tsx
?? components/lessons/investment-foundations/LessonIF_7_1.tsx
?? docs/lesson-plans/mission-09-evidence.md
?? docs/release-evidence/mission-09-evidence.md
```

## 3. What was just done, and why it matters to you

### The typography gate now walks every stage

`e2e/lesson-typography.spec.ts` used to measure computed typography on each
lesson's **entry stage only**. Later stages do not mount until the current one is
answered, so scenes 2-and-after of every lesson were unverified by anything. No
lesson component has a unit test either, so that was total.

It now reads the stage count from the shell, answers each stage, audits the scene
on arrival **and again once answered**, and asserts the stage index actually
moved before continuing. It walks 24 lessons, 117+ stages. **A stage it cannot
answer fails the test.**

Consequences for you, and this is the part that will bite:

- **Any lesson you add must be answerable by the walker.** It solves stages by
  searching the stage's own controls: a sweep (hold one control, try each control
  after it) and a combination search over controls grouped by their nearest
  shared ancestor. Multiple-choice, reveal-then-continue, and choose-per-question
  grids all work automatically.
- **What does not work automatically:** an answer that is a *set* (select every
  correct one), and any answer the learner must *type*. For those, add an entry
  to `ANSWER_KEYS` in that spec, keyed `"<slug>#<stageIndex>"`. Entries are
  matched on visible button text, in order; `"type:<field id>=<value>"` writes an
  exact value into a field. Keep the list short — it is a last resort, not the
  normal path.
- **Do not reshape a lesson to suit the walker.** When the gate could not answer
  a typed-number question in mission 9, the fix was to teach the gate to type,
  not to downgrade the question to multiple choice.
- There is a **self-check test** (`the gate still fails on the defects it was
  built to catch`) that plants a caption-over-group, 9px text and grey-on-grey
  into a real page and requires all three findings back. Every check in that file
  had been silently disabled once before. **Do not weaken it to make something
  pass.** If you believe a finding is a false positive, prove it structurally and
  say so in the code comment.

### Contrast and the light theme

Learning pages render under `.ops-theme-light` (`app/globals.css`), which remaps
dark-theme Tailwind utilities to dark-on-light. **Tailwind compiles each variant
to its own class**, so mapping `.text-accent-green` does nothing for
`disabled:text-accent-green` — that gap shipped a completed-action label at
**1.92:1**. Four more colours were chosen against white but actually sit on the
`#EFEFF2` panel grey and measured 4.15–4.42:1.

All fixed, and **WCAG AA is now enforced** by the gate (3:1 for large text, per
the standard). If you add a colour or a variant, measure it against
`--ops-surface-2`, not white.

## 4. Non-negotiable rules

1. **Never commit `tmp/` or `.source-cache/`.** They hold the Damodaran course
   corpus — ~1 GB of lecture audio, captions and PDFs. Both are now in
   `.gitignore` and the reason is written there. It is copyrighted material; only
   original OPS analysis belongs in `docs/`.
2. **No monospace.** `font-mono` is banned repo-wide; the Tailwind `mono` token
   is remapped to Inter. Sentence case. No difficulty badges.
3. **12px is the floor** for any rendered text, labels and navigation included.
4. **Do not commit or push without the human asking.** The working tree stays
   dirty for review via `npm run dev`. "Commit and push" is authorisation;
   nothing less is.
5. **Verify in a browser, desktop and mobile**, not just by passing tests.
   Visual changes need it.
6. Source-locked content: every claim in a lesson traces to a session in
   `.source-cache/`, historical figures are labelled and dated, and there is no
   live market data anywhere.

## 5. The verification bar

```bash
npm run typecheck     # tsc --noEmit, must be clean
npm run lint          # 2 pre-existing exhaustive-deps warnings are expected
npm test              # vitest, 108/108
npx playwright test   # 32 passed, 1 skipped
```

Note: on a **cold** dev server the first-load compile of a route can exceed
Playwright's 30s timeout and produce spurious failures. Re-run on a warm server
before believing a failure in `onboarding.spec.ts` or `progress.spec.ts`.

## 6. Where the curriculum stands

`docs/lesson-plans/portfolio-builder-mission-curriculum.md` is the current working
proposal. It does not become authoritative until the stakeholder approves the 13-mission
spine.

- **Built:** missions 1, 2, 3, 4, 6, 7, 8, 9 (24 lessons)
- **Source-gated, must not be authored:** mission 10 still needs canonical current
  fund-performance persistence evidence; mission 11 still needs source-topic Session 32
  narration reconciliation; missions 5, 12, and 13 still need the supplemental sources
  named in curriculum §6.

Mission 10 is the course's payoff decision, and it must read **both** the Friction
Budget (mission 8) and the Evidence Test Checklist (mission 9): a claim that fails
either one is not an edge.

The build pattern is: source audit → lesson plan in `docs/lesson-plans/` →
journey component + lesson component → wire (`shared.tsx` source basis,
`data/lessons/lessons.ts`, `data/courses/courses.ts`, `lib/lessonRegistry.ts`,
`data/courses/portfolioBuilder.ts`, the artifact in `lib/if-progress.ts`, a
dossier section) → add the route to the gate → gates → browser QA → release
evidence in `docs/release-evidence/`. `docs/lesson-plans/mission-09-evidence.md`
and its release-evidence counterpart are the most recent worked example.

## 7. Known gaps, honestly

- **Lesson components have no unit tests.** The typography gate is the only
  automated thing that exercises their later scenes, and it judges typography
  only — it would not notice a lesson marking a wrong answer correct.
- Two Supabase migrations (`0001_user_progress.sql`, `0002_user_onboarding.sql`)
  have never been applied. Auth and cloud sync will not work in a deployed
  environment until an operator runs them.
- `.superpowers/` holds process artifacts and is untracked by choice.

---

## 8. What I am asking you for

Two things, in this order.

**First: propose the division of labour.** Write back a short cooperation
protocol covering who owns what. The real constraint is that every lesson touches
the same spine files — `lib/if-progress.ts`, `data/lessons/lessons.ts`,
`data/courses/courses.ts`, `lib/lessonRegistry.ts`,
`data/courses/portfolioBuilder.ts`, `components/dossier/PortfolioDossier.tsx`,
`e2e/lesson-typography.spec.ts` — so two agents building two missions in parallel
will collide there, in exactly the files where a bad merge silently breaks a
learner's saved progress.

My proposal, which you should accept, amend or reject with reasons:

- **You (Codex) take mission 10 end to end** — source audit, plan, build, wire,
  gate, browser QA, release evidence. You own every file it touches, including
  the spine files, for the duration.
- **I (Claude) stay off the spine files entirely** and take the work that cannot
  collide: unit-test coverage for the lesson components (the gap above), and the
  source audit for sessions 30/32/33/34 that mission 11 will need. Docs and new
  test files only.
- **Handover point:** when mission 10's spine edits are committed, ownership of
  those files returns to whoever picks up mission 11.
- Neither of us commits or pushes without the human asking. PR #3 stays open.

Tell me if you would rather split it differently — for instance, if you would
prefer to take the test infrastructure and leave mission 10 to me, that is a
perfectly good answer and I would rather know now than merge-conflict later.

**Second: say what you need from me that this document does not give you** —
conventions I have left implicit, decisions I made that you disagree with, or
context that is missing. I would rather revise this handoff than have you guess.

One request either way: when you find something wrong in what I built, say so
plainly. Mission 9's gate integration was fixed because a test refused to pass,
and three bugs in the walker itself surfaced the same way. I would rather be
corrected than agreed with.
