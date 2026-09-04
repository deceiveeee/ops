# Phase 4 prompt — retrofit existing missions into one Workbench

Paste after `00-master-operating-prompt.md`. Run only after Phases 1–3 are stable.

---

## Objective

Connect every currently built Portfolio Builder mission to the authoritative Workbench so
the learner's prior decisions become one coherent portfolio record without changing lesson
slugs, erasing saved progress, or rebuilding source-authentic content.

Expected scope is Missions 1–4 and 6–9. Verify current code and metadata rather than relying
on that historical count.

## Required audit before editing

For each available core lesson:

- map the route slug to mission ID, artifact ID, legacy completion key, current progress
  write, plan read, and downstream dependencies;
- identify learner-facing module/mission labels that contradict the approved 13-mission
  spine;
- identify any final shell text copied from the wrong domain;
- identify any promise in `data/courses/portfolioBuilder.ts` that the current core route
  does not actually fulfill;
- identify hard-coded source, theme, typography, and saved-state assumptions;
- capture the fresh and existing saved-state rendering before edits.

Update or create a migration/retrofit matrix in `docs/implementation-notes/` with one row per
legacy artifact.

Create or update `docs/release-evidence/portfolio-workbench-retrofit.md`; keep inherited
lesson evidence separate from browser and migration checks performed in this phase.

## Required mapping

Preserve the approved meaning:

- Mission 1: mandate/readiness inputs; a retrofit may expose missing readiness fields but
  must not fabricate them from an old philosophy artifact.
- Mission 2: market belief, correction mechanism, and falsifier.
- Mission 3: bond role, rate/default risk, and duration/credit boundary.
- Mission 4: equity risk boundary and required-return range with dated inputs.
- Mission 6: Business Evidence Brief and research-only watchlist candidate.
- Mission 7: valuation range and watchlist gate; no ownership.
- Mission 8: exact Friction Budget; two-sided spread treatment must remain mathematically
  correct.
- Mission 9: Evidence Checklist; standard Sharpe uses differential/excess return rather
  than return divided by standard deviation.

Do not grant **Policy coherent** from legacy Missions 1–4 alone; Mission 5 owns that state.
Do not grant **Architecture licensed** before Mission 10 or **Products verified** before
Mission 12.

## Migration semantics in the UI

- Show migrated work as available evidence or a draft needing confirmation under the new
  Workbench standard.
- Preserve legacy lesson completion credit for navigation compatibility.
- Clearly separate `lesson completed`, `artifact migrated`, `decision confirmed`, and
  `checkpoint coherent`.
- If a required new Workbench field was never captured by the old lesson, show it as
  incomplete and route the learner to the correct mission; do not infer an answer.
- Personal and practice values remain separate.
- Changing a migrated upstream answer triggers the same dependency invalidation as a new
  answer.

## Plan page behavior

Refactor the plan page only as needed to read the Workbench through its authoritative API.
It must:

- compile one learner-readable portfolio document rather than duplicate storage;
- show assumption ownership and source dates;
- show rejected candidates and review-required records;
- distinguish research-only candidates from later product holdings;
- avoid empty-section flicker and hydration mismatch;
- retain a useful view of legacy evidence while missing later missions are planned;
- never imply that a migrated record is execute-ready.

## Verification

Add or update tests for every mapping and the distinction among completion, migration,
confirmation, and coherence. Test all legacy artifacts individually and together.

In the browser, inspect:

- fresh learner;
- one legacy artifact;
- all legacy artifacts;
- partially corrupt legacy data;
- Build mine and Practice case;
- refresh and cross-tab update;
- an upstream edit producing downstream `Review required`;
- plan output before and after confirmation;
- every affected lesson's final save state on desktop/mobile, light/dark, keyboard, and
  reduced motion.

## Explicit non-goals

Do not:

- change source-authentic finance claims merely to fit the new schema;
- implement Mission 10 or later;
- rename routes, slugs, storage keys, mission IDs, or artifact IDs;
- erase legacy storage;
- mark research candidates owned;
- infer missing learner inputs;
- redesign every lesson into the same template;
- commit or push.

Finish with a route/artifact mapping summary and the master report.

---
