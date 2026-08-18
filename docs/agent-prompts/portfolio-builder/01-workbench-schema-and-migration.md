# Phase 1 prompt — freeze the Portfolio Workbench schema and migration

Paste after `00-master-operating-prompt.md`.

---

## Objective

Implement the versioned, local-first Portfolio Workbench state foundation that can safely
accumulate all 13 missions without erasing or reinterpreting existing learner work.

This phase succeeds when:

- one authoritative, documented Workbench schema exists in code;
- every existing Investment Foundations artifact can be migrated idempotently;
- upstream changes produce explicit downstream `Review required` states;
- corrupt, partial, absent, and future-version data fail safely;
- current lesson slugs, completion keys, and legacy artifact records remain readable;
- tests prove the migration and invalidation behavior.

This is state infrastructure only. Do not build or visually redesign a Workbench sidecar,
Mission 5, or any later mission in this phase.

## Required inspection

After the master-prompt reads, inspect completely:

- `lib/if-progress.ts`
- `lib/if-progress.test.ts`
- `lib/progress/store.tsx` and its tests
- `lib/progress/merge.ts` and its tests
- `lib/portfolio-builder-progress.ts` and its tests
- `data/courses/portfolioBuilder.ts` and its tests
- `components/dossier/PortfolioDossier.tsx`
- `components/courses/PortfolioBuilderPath.tsx`
- the Supabase progress adapter/migrations if local state can later synchronize through them
- all reads and writes of `ops-if-*`, `ops-portfolio-*`, `legacyCompletionSlugs`, and
  `PROGRESS_EVENT` found with repository search.

The Workbench type sketch in
`docs/lesson-plans/portfolio-builder-guided-workbench.md` is a design contract, not an
approved code schema. Reconcile it with existing artifacts before choosing types and
storage boundaries.

## Architecture decisions to record before editing

Write a short schema decision record under `docs/implementation-notes/` or the closest
existing approved location. It must define:

1. the authoritative storage key and schema version;
2. the version-upgrade interface;
3. personal and practice data separation;
4. lifecycle state versus lesson-completion compatibility state;
5. mission checkpoint ownership;
6. assumption provenance: `source`, `learner`, or `OPS`;
7. validation and recovery behavior;
8. cross-tab and same-tab update behavior;
9. downstream dependency graph and invalidation events;
10. what remains in legacy keys and for how long;
11. how import/export can be added later without exposing sensitive data;
12. how local state relates to optional authenticated progress sync without making cloud
    storage a requirement.

Create or update
`docs/release-evidence/portfolio-workbench-schema-migration.md` with the exact fixtures,
migrations, tests, and open UI gates completed in this phase.

Do not place unversioned `unknown` blobs into production merely because the design sketch
uses `unknown` as a placeholder. Use discriminated, evolvable records or explicitly
versioned envelopes.

## Required behavior

### Non-destructive migration

- Migration is idempotent: running it repeatedly yields the same valid Workbench.
- It copies or references existing valid artifacts without deleting legacy records.
- It never marks a portfolio decision mastered solely because a legacy lesson completion
  key is true.
- It distinguishes migrated evidence from decisions newly confirmed under the Workbench
  standard.
- It preserves timestamps when trustworthy and labels synthesized/migrated timestamps.
- Missing fields receive safe incomplete states, not invented learner answers.
- Personal answers never leak into Practice case, and switching modes does not destroy
  either mode's work.
- A future unsupported schema version is preserved and reported, not overwritten by an
  older client.

### Validation and recovery

- Invalid JSON, wrong primitive types, invalid enum values, non-finite numbers, negative or
  impossible weights, and partial arrays cannot crash rendering.
- Recovery must identify which record is invalid and retain recoverable fields.
- Reset controls are not part of this phase, but the API must allow future scoped reset of
  practice data, personal inputs, completion, or the whole Workbench.
- Do not collect account credentials, IDs, exact addresses, or unnecessary personal data.

### Dependency invalidation

Create and test an explicit dependency model. At minimum:

- mandate/readiness changes can invalidate allocation, architecture, holdings, and
  operating rules;
- allocation changes can invalidate timing, architecture sizing, holdings, overlap, order
  drafts, rebalancing, and the IPS;
- watchlist/valuation changes can invalidate any later active-license and product mapping;
- friction/evidence changes can invalidate an active Edge License and the downstream timing
  checkpoint; even a passive/no-timing policy must be reconfirmed against the current
  architecture and evidence state;
- architecture changes can invalidate timing, product slate, order draft, and operating
  rules;
- timing-policy changes can invalidate product mapping, order drafts, flight-test results,
  and operating rules, even when the valid policy is `no timing`;
- product identity or source-date changes can invalidate overlap, order draft, and the
  flight test;
- operating-rule changes invalidate the compiled Dossier/IPS assessment result.

Invalidation marks the dependent record `Review required` with the changed field, affected
mission, time, and reason. It must not silently recalculate a new approved decision.

Avoid a brittle matrix keyed only by display labels. Use stable field or checkpoint IDs.

### State semantics

Preserve the approved visible states:

1. Mandate drafted
2. Policy coherent
3. Research checked
4. Architecture licensed
5. Products verified
6. Operating plan ready
7. Execute-ready or Practice-complete

Do not let a record enter a later state while a required earlier checkpoint is incomplete
or marked for review. `Execute-ready` is conditional and never means recommended to trade.

## Tests required

Add focused tests for:

- empty first run;
- each legacy artifact migrating alone;
- all current artifacts migrating together;
- repeat migration;
- partial and corrupt legacy JSON;
- partial and corrupt Workbench JSON;
- unsupported future schema version;
- personal/practice mode isolation and reversible switching;
- no deletion or mutation of legacy keys;
- same-tab and storage-event refresh;
- every dependency edge;
- unaffected siblings staying valid;
- SSR/no-`window` safety;
- stable lesson completion behavior;
- optional progress-sync adapter behavior if touched.

Use fixture builders rather than huge snapshots. Assert semantic fields and transitions.

## Acceptance criteria

- There is one authoritative Workbench state API; UI code does not manually parse its
  localStorage record.
- Existing `useIFProgress` consumers continue to work or are migrated in a backwards-
  compatible way.
- Existing saved values render identically before and after migration.
- Migration never upgrades learning competence beyond the evidence it has.
- Every changed upstream checkpoint can name its affected downstream work.
- Typecheck and all relevant progress tests pass.
- No learner-facing visual QA is claimed unless this phase incidentally changes rendered
  behavior; if it does, perform the master prompt's browser matrix.

## Explicit non-goals

Do not:

- build the sidecar, mobile drawer, Allocation Studio, or any new mission;
- rewrite lesson copy or assessments;
- rename slugs, mission IDs, artifact IDs, or legacy keys;
- delete legacy storage;
- add account credentials or brokerage data;
- implement live market data;
- mark migrated work as `Execute-ready`;
- add a new dependency without proving the existing stack is insufficient;
- commit or push.

End with the master prompt's required report and gate label.

---
