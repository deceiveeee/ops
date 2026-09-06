# The Studio workspace: what it should be

A design for the surface that replaces the six-stage wizard. Written against
[`studio-research-workspace-handoff.md`](studio-research-workspace-handoff.md) §4, §5, §7 and
§9, and against what is actually built today — not a wishlist.

## The problem this has to solve

The wizard asks six sets of questions in a fixed order and supplies almost no evidence to
answer them with. The user's objection was exact:

> You're supposed to leverage outside of site tools not just have these random input boxes.

The fix is **not** the same questions with free navigation. It is inverting the relationship
between input and evidence. Today a field asks and the learner guesses. In the workspace, a
screen shows something real — a filing, an industry, a peer table, a price history — and the
input is a *response* to it.

The handoff says the same thing in its own words: work areas "must not become five enormous
scrolling forms", and a tool must never "open an unfamiliar tool with a grid of empty metrics
or ask for expected return, discount rate, confidence, or a business thesis without explaining
how to develop the input."

## Six decisions

### 1. The home is a worklist, not a dashboard

The failure mode of a research tool is losing your thread. Returning after a week must show
what you were investigating and why the next thing matters — not a wall of totals.

The home shows, in this order:

- **What this money is for**, in one editable line. Purpose, horizon, amount.
- **The suggested next task**, with the reason it matters. Suggested, never enforced.
- **Open investigations** — every candidate by status, searchable, including rejected ones.
  This is the main body of the page.
- **Needs review** — records whose inputs changed, each naming its cause.
- **Save state**, always visible and honest.

A number on the home page is only there if a decision hangs on it.

### 2. Evidence sits beside the decision, permanently

A rail beside the active work, not a modal and not a link out. It holds three things and
always says which one you are looking at:

- **Where this came from** — period, units, the XBRL concept, the accession number, the
  definition. Every figure in Studio can already produce this; `metrics.ts` returns it.
- **What it means** — the explanation, available again after dismissal. Course completion is
  never required to reopen one.
- **Save as evidence** — attach it to the open investigation, as supporting *or challenging*,
  with the learner's own note.

This rail is the whole answer to "leverage outside tools". The filing is beside the decision.

On mobile the rail becomes a deliberate switch between **Work**, **Evidence** and
**Explanation**, preserving position in each. No postage-stamp readers.

### 3. The three kinds of input look different

The handoff separates source fact, user assumption and user judgment. A learner confusing a
filed number with their own guess is the central danger in the whole product, so the
difference must be visible at a glance, not explained in a caption.

| Kind | How it looks and behaves |
| --- | --- |
| **Filed** | Not editable. Carries its period and source inline. Clicking opens provenance in the rail. A correction creates a reviewed data revision, never an inline edit. |
| **Assumed** | Editable, sitting next to the evidence that informs it, with a worked example and its effect on the analysis shown as you change it. Saves the rationale and the scenario it applies to. |
| **Judged** | The learner's own words, preserved verbatim, never summarised back at them. Evidence and counterevidence attach here. Uncertainty is a first-class field, not a weakness. |

Continuous controls only where the effect is visible and financially meaningful. Numeric entry
always remains for precise assumptions.

### 4. Navigation is free; order is only suggested

Five work areas over one saved project, each directly reachable:

| Area | What it is | Built? |
| --- | --- | --- |
| **Goal and limits** | Cash-flow schedule, horizon, capacity *versus* willingness to lose, constraints. Shows feasibility as you type. | v1 exists, needs the evidence treatment |
| **Find investments** | Industry structure → screen → shortlist | Industry **built**; screen not |
| **Investigate** | One candidate at a time. The §9 journey. | Metrics, ROIC and prices **built**; the surface is not |
| **Compare portfolios** | Named alternatives, duplicated and set side by side | Schema **built**; surface is not |
| **Review and rules** | Operating rules, buying worksheet, review history | v1 exists |

The suggested order is the paper's outside-in one — industry before company — because that is
what *Measuring the Moat* argues and what the industry surface already teaches. But a learner
who wants to open a company first may.

### 5. Nothing is "complete"; work is supported or open

Progress means a decision has supporting work **and** recorded unresolved questions. A filled
textarea, a ticked source box or a high simulated return is not progress and must never render
as a completion tick.

So the vocabulary is: *supported by*, *open questions*, *needs review*. Never a progress bar,
never a percentage, never a green check on a judgment.

### 6. `needs review` names its cause

Each saved record stores what it depended on — the dataset version and the figures used. When
a newer reviewed snapshot arrives or an assumption changes, only the affected records are
flagged, and each says **why**:

> Your Atkore valuation used operating profit from the year to 2025-09-30. A newer filing
> changed it. The conclusion is unchanged until you review it.

Not every record goes stale, and a new allocation is never silently adopted.

## What the workspace must never do

- Become five scrolling forms.
- Ask for a discount rate, expected return or business thesis without first teaching how to
  form one.
- Show a filed fact and a guess in the same visual treatment.
- Delete research when a position is removed. The v2 schema exists to prevent exactly this.
- Report an edit as a save. The storage session already distinguishes `dirty`, `saving`,
  `unsaved`, `conflict` and `blocked`; all five must reach the interface.
- Require a course to be finished before an explanation can be reopened.

## Standing on what is built

The workspace has more underneath it than the wizard ever did:

- **Prices** — 90,028 dated observations, fair-value level carried per observation.
- **Metrics** — per sector and per period, with a stated reason whenever it refuses.
- **Industry** — share, concentration, five-year instability, all against Morgan Stanley's
  method and validated on its published figures.
- **ROIC** — the DuPont split, with the advantage read withheld below an 8% return.
- **Storage** — v2 project, IndexedDB, atomic cross-tab conflicts, backups, recovery.
- **Filings** — `lib/filings/edgar.ts` and the `/filings` reader.
- **Arithmetic** — `lib/studio.ts`'s cents-safe allocation and order rounding, still correct
  and still worth keeping.

## Phasing, honestly

The full §8 specification is very large. This is the order in which it should ship.

**Phase 1 — the shell and the journey.** Project home as worklist; the evidence rail; the
three input treatments; goal, investigate and compare on the data that already exists; the
industry view pulled in rather than linked out. `useStudioProject` replaces `useStudioPlan`
here, and this is the commit where the wizard actually goes.

**Phase 2 — what a decision needs.** Screening with visible score decomposition; valuation
with sensitivities; bond cash-flow timelines. Each is a new surface over existing pipelines
plus new maths.

**Phase 3 — portfolio construction.** Covariance and shrinkage, the optimizers, scenarios and
simulation. This phase needs either vetted dependencies or hand-written implementations with
independent verification; the handoff forbids inventing an optimizer for convenience.

Phase 1 is the one that changes what the user sees. Phases 2 and 3 deepen it.

## The test this design has to pass

The §9 Atkore journey, end to end, without leaving Studio for an essential fact. Find,
understand, investigate, test explanations, value, compare, decide, revisit — with the
research surviving rejection, and prior reasoning preserved when a newer snapshot arrives.

If any step needs another website, asks the learner to invent a metric, or buries the evidence
behind an external link, the design has failed and gets repaired before it is copied across
the universe.

## Open questions for the user

1. **Practice and personal modes.** The storage layer keeps them separate. Should the workspace
   open in practice by default for someone arriving without Investment Foundations?
2. **How much of the wizard's content survives.** Goal and Rules are genuinely useful forms.
   Build them as they are inside the new shell, or rework them to the evidence-first rule?
3. **Phase 1 scope.** Is "the Atkore journey works end to end" the right bar for the first
   release of the workspace, or should Phase 1 ship narrower — home, goal and investigate only?
