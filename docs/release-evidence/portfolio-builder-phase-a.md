# Release evidence: Portfolio Builder unified mission spine (superseded)

Status: **Historical only. Superseded by the proposed 13-mission curriculum and guided
Portfolio Workbench research completed 2026-08-12. Do not use the 10-mission counts or
gates below for current implementation.**

Current records:

- `docs/lesson-plans/portfolio-builder-mission-curriculum.md`
- `docs/lesson-plans/portfolio-builder-guided-workbench.md`
- `docs/source-audits/portfolio-builder-practical-tools.md`

Date: 2026-08-09

## Scope

This revision removes the competing mission-versus-module direction from the Investment Foundations course page and applies the corpus-audited architecture:

- 10 required portfolio missions totaling 410 guided minutes;
- 10 one-to-one Portfolio Dossier artifacts;
- one learner-facing mission rail;
- all old lesson routes preserved and credited through the missions;
- Damodaran sessions displayed as source provenance, not progress steps;
- optional strategy investigations kept outside core completion;
- the scanning animation retained and remapped to the ten portfolio decisions.

The Finance Foundations course continues to use its existing module curriculum. Only the Portfolio Builder hides the legacy module rail.

## Source gate

- Complete corpus record: `docs/source-audits/damodaran-investment-philosophies-corpus-audit.md`
- Session-to-mission map: `docs/source-audits/damodaran-investment-philosophies-38-session-curriculum-map.md`
- Unified mission plan: `docs/lesson-plans/portfolio-builder-core-curriculum.md`
- All 38 slide decks and all 38 test/solution files reviewed in full.
- Narration reviewed for 35 source topics.
- Sessions 24, 27, and 32 have no official caption track and still require local transcription/reconciliation.
- No historical quiz item is treated as a ready OPS assessment; the audit records formula, wording, answer-choice, date, legal, and pedagogy defects.
- New lesson claims remain blocked where they need strategic allocation, position sizing, current fund/ETF due diligence, rebalancing, current tax/legal rules, or IPS/benchmark sources.

## Learner-sequence evidence

The required direction is now:

`mandate → asset roles → allocation/risk → evidence → value → passive/edge decision → holdings → sizing → operating rules → defense`

- Investor fit from Sessions 1 and 38 appears before strategy selection and returns at the capstone.
- Risk precedes allocation and sizing.
- Business evidence precedes valuation.
- Valuation and evidence testing precede an active-edge decision.
- Passive is the valid default; an active sleeve requires a falsifiable edge after friction.
- Execution, rebalance, sell, and review rules precede final defense.
- Each mission identifies its supporting source sessions without turning them into learner tasks.

## Progress and route preservation

- Existing lesson slugs are unchanged.
- Existing `ops-if-completion-v1` state is read directly and not rewritten.
- Missions 1–5 map the strongest existing guided journeys into the new sequence.
- A mapped mission becomes complete only when all of its legacy core scenes are complete.
- Partial legacy completion produces `In progress`.
- Missions 6–10 remain `Planned` and display `Awaiting source gate` rather than linking to incomplete content.
- Each dossier artifact now rolls up from exactly one mission, eliminating ambiguous artifact status.

Automated coverage:

- `data/courses/portfolioBuilder.test.ts`
- `lib/portfolio-builder-progress.test.ts`

## Interaction and visual evidence

The in-app browser inspected `/courses/investment-foundations` after the change.

Desktop, 1280 × 720:

- hero reports 7 core hours, 10 missions, and 38 source sessions;
- dossier scanner shows all ten artifacts as two balanced rows;
- completion, scanning, open, and ahead states remain distinct without relying on the moving sweep;
- the old module curriculum is absent from the page structure;
- source ranges compress cleanly, including `6-29, 34-36`;
- no browser error or warning was reported beyond normal development analytics messages.

Responsive, 375 × 844 content viewport:

- scanner becomes two columns without clipped labels;
- mission metadata, source ranges, artifact chips, and CTAs wrap without overlap;
- document `clientWidth` and `scrollWidth` both equal 375, confirming no root horizontal overflow;
- the existing mobile header remains functional and does not cover the mission content.

Reduced motion remains supported by the existing `useReducedMotion` branch, which removes the animated sweep while preserving all artifact states.

## Verification

- `npm.cmd run typecheck` — passed.
- `npm.cmd test -- data/courses/portfolioBuilder.test.ts lib/portfolio-builder-progress.test.ts` — 2 files and 9 tests passed.
- `npm.cmd test` — 16 files and 99 tests passed.
- `npm.cmd run lint` — passed with two pre-existing onboarding hook warnings outside this scope.
- scoped `git diff --check` — passed; Git reported only the repository’s existing LF/CRLF conversion notices.

## Open gates

- Reconcile narration for Sessions 24, 27, and 32.
- Lock primary sources for strategic allocation, sizing/concentration, current fund/ETF selection, rebalancing, current tax/legal guidance, and IPS/benchmark design.
- Build an exact claim/prerequisite/practice/assessment matrix before curating Mission 1.
- Run the normal functional, accessibility, responsive, theme, and visual gates again whenever a mission’s learner content changes.

Release decision: **The single-direction information architecture is ready for review. New source-authentic lesson authoring remains gated.**
