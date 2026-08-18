# Portfolio Workbench shell evidence

**Decision:** `Blocked - implementation`

**Evidence date:** 2026-08-13 (America/Phoenix)

**Schema:** v1

**Browser storage key:** `ops-portfolio-workbench-v1`

The shell architecture is implemented, including the Mission 1 Readiness Runway retrofit
delivered with Mission 5. This record does not claim `Ready for review`: the required
browser-state, accessibility, responsive, theme, persistence, and screenshot evidence has
not yet been recorded here. Stakeholder review follows only after those gates close.

## 1. Authority and scope

- Curriculum authority:
  `docs/lesson-plans/portfolio-builder-mission-curriculum.md`.
- Guided product contract:
  `docs/lesson-plans/portfolio-builder-guided-workbench.md`.
- Schema implementation: `lib/portfolio-workbench.ts`.
- React persistence adapter: `lib/use-portfolio-workbench.ts`.
- Learner-facing companion: `components/portfolio-workbench/WorkbenchCompanion.tsx`.
- First connected mission flow:
  `components/lessons/investment-foundations/Mission05AllocationJourney.tsx`.
- Schema design note:
  `docs/implementation-notes/portfolio-workbench-schema-v1.md`.

The shell persists portfolio decisions while the learner moves through the approved
13-mission curriculum. It does not place orders, connect to a brokerage, synchronize to an
OPS account, or convert a completed lesson into permission to trade.

## 2. Implemented architecture confirmed by code inspection

### Versioned, case-isolated state

- Schema v1 stores separate `personal` and `practice` cases plus an explicit active mode.
- Each case owns its own mandate, allocation, checkpoint map, and graduation record, so a
  practice answer cannot silently overwrite personal work.
- The schema defines the 13 curriculum checkpoints: mandate, beliefs, bond risk, required
  return, allocation, evidence, valuation, friction, evidence test, architecture, timing,
  holdings, and policy.
- Checkpoints carry status, revision, update time, accepted dependency revisions, and an
  optional review record. Supported states are `empty`, `draft`, `saved-unverified`,
  `coherent`, `review-required`, and `blocked`.

### Readiness Runway and allocation records

- The mandate retains normalized routing fields and the learner's exact Readiness Runway
  answers. Exact fields include the planning amount, reserve and debt state, employer-match
  context, loss capacity and willingness, jurisdiction, account authority, earned-income
  context, and life-change transfer answers.
- Coherent mandate saves require a goal, horizon, positive planning amount, a non-negative
  near-term need no greater than that amount, assessed capacity and willingness, a resolved
  route, and acknowledgement. Practice and personal route types are validated separately.
- The allocation record stores source/learner/OPS ownership for assumptions, strategic
  sleeve ranges and targets, scenario losses, liquidity need, total loss budget, optional
  candidate-position inputs, rationale, preflight status, transfer status, and save time.
- A coherent allocation requires a coherent mandate and validates weights, ranges,
  liquidity coverage, stress-budget arithmetic, mandate amount/cash-need consistency,
  optional candidate-ceiling completeness, rationale, preflight, transfer, and learner
  acknowledgement.

### Dependency and review behavior

- The Workbench defines a directed dependency graph and walks it transitively after a
  semantic upstream change.
- A changed upstream checkpoint marks already-saved dependents `review-required`, records
  the changed field and reason, and appends a dependency-history event.
- Timestamp-only mandate acknowledgement does not count as an economic change and therefore
  does not invalidate downstream work.
- Coherent downstream saves are blocked until their declared prerequisites are coherent.

### Persistence, migration, and recovery

- The React adapter persists to browser local storage, publishes same-tab change events,
  listens for cross-tab storage events, and exposes validated mutation results to the UI.
- Seven pre-Workbench artifacts can be copied into `legacyEvidence`. They are labelled
  `migrated-unconfirmed`; migration preserves provenance and does not award a coherent
  checkpoint or assessment credit.
- Invalid nested fields recover to safe defaults with recorded issues. Corrupt JSON,
  unsupported schema versions, read failures, and newer future versions preserve the raw
  stored record rather than silently replacing it.
- When recovery or future-version review is required, the React adapter blocks mutation and
  tells the learner the original local record was preserved.

### Learner-facing companion

- The companion exposes a semantic Build mine / Practice case selector, a seven-state
  portfolio lifecycle summary, review-required badges, and a browser-local storage notice.
- The displayed lifecycle is derived from coherent checkpoints rather than lesson-watch
  completion. Graduation distinguishes `execute-ready` for an eligible personal case from
  `practice-complete` for a paper case.

## 3. Deliberate boundaries

- Browser local storage is the only persistence layer in v1; there is no cloud backup or
  cross-device synchronization.
- Mission 1 mandate and Mission 5 allocation are the first fully connected records. Later
  checkpoint types and dependency edges exist in the shell, but their mission-specific
  authoring and browser evidence remain future work.
- Migrated legacy work is evidence to review, not proof of fresh competence.
- `execute-ready` is a lifecycle label, not financial advice, account eligibility, or an
  instruction to trade.

## 4. Open release evidence

The following items remain pending and must be recorded from direct browser evidence before
the shell can move to `Ready for review`:

- [ ] Fresh personal case from empty storage, including constrained-readiness routing.
- [ ] Fresh practice case from empty storage and confirmation that the personal case remains
      unchanged when modes switch.
- [ ] Refresh and reload persistence after mandate and allocation saves.
- [ ] Rendered legacy-migration state showing `migrated-unconfirmed` evidence without fresh
      Readiness Runway, preflight, transfer, or completion credit.
- [ ] Corrupt-record, recovered-field, and future-version UI states, including confirmation
      that the original record is not overwritten.
- [ ] Same-session and post-refresh semantic mandate changes that reopen allocation and all
      applicable downstream checkpoints as `review-required`.
- [ ] Timestamp-only re-acknowledgement that leaves coherent dependent work intact.
- [ ] Complete keyboard path, visible focus, semantic labels, error announcements, and
      disabled-state behavior.
- [ ] Desktop and narrow viewport inspection for fresh, partial, coherent, review-required,
      recovery, and mode-switch states.
- [ ] Route-supported light/dark surfaces and reduced-motion behavior.
- [ ] Horizontal overflow, clipping, sticky obstruction, text contrast, and minimum target
      size checks.
- [ ] Browser console inspection with no new errors or warnings.
- [ ] Named screenshots with route, viewport, theme, state, and date recorded.
- [ ] Current-cycle typecheck, unit/integration tests, lint, production build, and full
      browser-suite commands recorded with exact results.

### Current static verification

- `npm.cmd run typecheck` passed after the final per-mode hydration fix.
- Four focused Mission 5 files passed 70 tests; the complete Vitest run passed 21 files
  and 179 tests.
- `npm.cmd run lint` passed with two pre-existing onboarding hook warnings outside the
  Workbench and Mission 5 surfaces.
- `git diff --check` passed (line-ending notices only).
- The final browser matrix remains pending because the in-app browser was denied localhost
  access by the desktop safety layer. A clean isolated-output production build also remains
  pending because the configured `next/font` network request was denied. Neither result is
  represented as a product failure or as passing evidence.

## 5. Release decision

Status remains `Blocked - implementation` because Gate E learner-state and visual QA is
open in this evidence record. Once every applicable item above has direct evidence, the
shell may be reassessed for `Ready for review`. Only stakeholder approval after all gates
pass can support `Release-ready`.
