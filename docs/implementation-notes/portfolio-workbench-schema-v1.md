# Portfolio Workbench schema v1

Status: Phase 1 foundation for Mission 1 readiness and Mission 5 allocation. This note documents implementation behavior; it does not certify learner-facing lesson or source gates.

## Purpose

The Portfolio Workbench is the durable learner-owned artifact behind the build-while-learning curriculum. Version 1 establishes a local-first state envelope, two isolated learner modes, explicit checkpoint states, provenance for assumptions, migration of existing Investment Foundations artifacts, and downstream invalidation. It deliberately does not replace lesson completion or the existing progress synchronization contract.

The Workbench storage key is `ops-portfolio-workbench-v1`. The existing completion map and every existing lesson artifact key remain unchanged.

## Privacy boundary

Version 1 is local-only. It is not written to `user_progress.completion` and is not synchronized to Supabase. The schema never requires account credentials, account numbers, broker identifiers, or transaction authority. A learner may describe constraints and portfolio-scale assumptions, but the UI must make the local-only boundary visible before collecting personal values.

Personal (`Build mine`) and practice cases live in separate objects:

```text
PortfolioWorkbenchV1
├─ cases.personal
└─ cases.practice
```

A mode switch changes only `activeMode`; it does not copy values between cases. Factories create independent arrays and objects so mutations cannot leak through shared references.

## Envelope

```ts
interface PortfolioWorkbenchV1 {
  schemaVersion: 1;
  activeMode: "personal" | "practice";
  cases: {
    personal: WorkbenchCase;
    practice: WorkbenchCase;
  };
  legacyEvidence: Partial<Record<LegacyArtifactId, LegacyEvidenceRecord>>;
  dependencyHistory: DependencyEvent[];
  createdAt: string;
  updatedAt: string;
}
```

The schema contains only explicit, versioned fields. Unknown legacy blobs are never copied into the Workbench.

Each case contains:

- a stable mode identity;
- thirteen checkpoint records aligned to the approved missions;
- the Mission 1 mandate/readiness record;
- the Mission 5 allocation policy record;
- a typed graduation record reserved for the final dossier and transfer gate.

Empty personal and practice cases intentionally contain no fictional learner facts. A future reviewed practice-case fixture can seed practice mode without changing the state contract or inventing unaudited teaching content in infrastructure.

## Checkpoints and lifecycle

Checkpoint statuses are:

- `empty`
- `draft`
- `saved-unverified`
- `coherent`
- `review-required`
- `blocked`

Every checkpoint also stores a monotonic revision, update time, the dependency revisions it accepted, and—when invalidated—the upstream source, changed field, reason, and time.

The derived learner lifecycle is:

```text
Draft
→ Mandate drafted
→ Policy coherent
→ Research checked
→ Architecture licensed
→ Products verified
→ Operating plan ready
→ Execute-ready or Practice-complete
```

Mission completion does not write these states automatically. Mission code must satisfy its domain gate and then commit the corresponding checkpoint. In v1, allocation cannot become `coherent` unless the mandate is `coherent`. The allocation gate also requires complete 100% weights, valid target ranges, liquidity coverage against the learner-defined need, a complete stress scenario, a finite candidate ceiling, goal-impact acknowledgement, preflight or bridge completion, and a passed independent transfer case.

Final `execute-ready` and `practice-complete` states require the separate graduation record to be passed. A personal case is the only case that can derive `execute-ready`.

## Allocation representation and math

Persisted weights, ranges, losses, liquidity needs, and loss-contribution ceilings use integer basis points. `10_000` means 100%. This prevents floating-point drift and permits exact validation that target weights total 100%.

Mission 5 stores:

- learner-labeled allocation sleeves and semantic roles;
- minimum, target, and maximum weights;
- near-term liquidity need as a portfolio percentage;
- one or more versioned stress scenarios with assumption provenance;
- the learner-defined maximum total portfolio stress loss for the selected scenario;
- the maximum contribution a candidate may make to portfolio loss;
- the assumed candidate loss used to derive a position ceiling;
- preflight, bridge, transfer, and acknowledgement states.

The candidate ceiling follows the approved relationship:

```text
position weight × assumed position loss = contribution to portfolio loss
```

Therefore:

```text
maximum position weight = maximum portfolio-loss contribution ÷ assumed position loss
```

The result is floored to an integer basis point and capped at 100%. A zero assumed loss is rejected because it cannot establish a finite risk ceiling.

`portfolioStressLossBudgetBps` is a separate Gate B constraint on total selected-scenario portfolio loss. The coherent-allocation gate calculates the portfolio stress result and rejects it when it exceeds this learner-defined budget. `maximumPortfolioLossContributionBps` is narrower: it limits one candidate position's contribution to that portfolio loss. The fields must not be substituted for one another.

For portfolio stress loss, all unrounded sleeve numerators are summed first and the portfolio result is rounded once. Per-sleeve display values may be rounded independently, but grading and persisted portfolio output must use the once-rounded total.

The infrastructure contains no universal allocation, reserve, liquidity, drawdown, or position-size recommendation. Those quantities must come from learner constraints, reviewed sources, or explicitly labeled OPS illustrations.

## Provenance

Assumptions that affect allocation carry:

- `value`;
- `owner`: `source`, `learner`, or `ops`;
- `asOf` date;
- a short note.

`null` distinguishes an unanswered numeric assumption from a valid zero. UI surfaces should show ownership and age wherever a value can materially change an allocation decision.

## Legacy migration

The following keys are read independently:

| Legacy artifact | Storage key |
| --- | --- |
| Philosophy draft | `ops-if-philosophy-draft-v1` |
| Bond risk brief | `ops-if-bond-risk-brief-v1` |
| Equity risk policy | `ops-if-equity-risk-policy-v1` |
| Statement brief | `ops-if-statement-brief-v1` |
| Valuation range | `ops-if-valuation-range-v1` |
| Friction budget | `ops-if-friction-budget-v1` |
| Evidence checklist | `ops-if-evidence-checklist-v1` |

Migration behavior is intentionally conservative:

1. Each old key is parsed and sanitized independently.
2. Only known typed fields are copied.
3. The original key and bytes are never modified or removed.
4. Migrated data is stored at the root as `migrated-unconfirmed` evidence, not assigned to personal or practice mode.
5. Migration never marks a checkpoint `coherent` and never advances lifecycle state.
6. A valid source `updatedAt` is retained. Missing or invalid source time is labeled `synthesized` and receives migration time.
7. A canonical source signature makes repeated migration idempotent. A changed legacy artifact creates a new migrated snapshot without deleting the source.
8. Corrupt legacy JSON is reported and skipped; it does not prevent a fresh Workbench from being used.

Keeping migrated evidence mode-neutral avoids two unsafe assumptions: that all historical work belonged to the learner’s personal case, or that personal values may be copied into a fictional practice case.

## Recovery and forward compatibility

Load results are discriminated:

- `ok`: valid and writable;
- `recovered-with-issues`: known v1 data was partially malformed; valid fields are available in a safe in-memory recovery, while original bytes remain untouched;
- `corrupt`: JSON or the envelope is unusable; a safe empty in-memory case is returned and original bytes remain untouched;
- `future-version`: the stored schema version is newer than this build; original bytes remain untouched.

The React hook blocks writes for recovered, corrupt, and future-version states. A future recovery UI must ask for an explicit learner decision before replacing preserved data. Storage quota and access failures are returned as visible write errors rather than reported as successful saves.

Server rendering uses an empty deterministic in-memory envelope and performs no browser access. The hook loads local state after mount.

## Dependency invalidation

Dependencies are defined centrally as stable checkpoint IDs. A changed upstream checkpoint walks the directed graph transitively. Any downstream state that was `saved-unverified`, `coherent`, or already `review-required` becomes `review-required`; empty, draft, blocked, sibling, and opposite-mode states are left alone.

Every actual invalidation appends a typed audit event containing the mode, upstream checkpoint and revision, changed field, reason, affected checkpoints, and time. Re-saving byte-identical data with the same status is a no-op and creates no invalidation event.

Important v1 paths include:

- mandate → allocation → architecture → timing → holdings → policy;
- evidence and valuation → architecture, holdings, and policy;
- friction and evidence test → architecture, timing, and policy.

Review-required is not an automatic failure and is not silently resolved. The affected mission must be reopened, reconsidered, and explicitly saved against the new upstream revisions.

## Event contract

Durable writes dispatch `ops-portfolio-workbench-change` in the same tab. The hook also listens for:

- that same-tab event;
- the browser `storage` event for the Workbench and legacy keys;
- the existing `ops-if-progress` event so newly saved legacy evidence can be reconciled.

The existing progress event and legacy storage keys are not renamed.

## Phase 1 verification boundary

The focused tests cover:

- an empty Workbench and SSR-safe loading;
- every legacy artifact alone and all artifacts together;
- idempotent repeat migration and timestamp semantics;
- corrupt legacy JSON, corrupt Workbench JSON, partial v1 recovery, and future versions;
- preservation of all legacy source bytes;
- personal/practice isolation;
- mandate-before-allocation coherence;
- allocation domain gates and lifecycle derivation;
- transitive invalidation, sibling isolation, opposite-mode isolation, and no-op writes;
- quota-style write failure;
- same-tab and cross-tab event behavior;
- basis-point boundaries, range validation, liquidity, stress math, single-round portfolio grading, and candidate ceiling guards.

This phase does not claim learner-facing Mission 5 readiness. Source integrity, learner sequence, interaction, accessibility, themes, responsive behavior, motion reduction, and visual QA remain separate release gates for the UI vertical slice.
