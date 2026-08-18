# Mission 5 release evidence: Allocation and Risk Policy

**Decision:** `Blocked - implementation`  
**Evidence date:** 2026-08-13 (America/Phoenix; supplemental `fetchedAt` values fall on
2026-08-13 UTC)  
**Route:** `/lessons/if-pb-05-set-allocation-and-risk-limits`  
**Module / lesson:** `if-pb05-allocation-policy` / `if-pb-05-set-allocation-and-risk-limits`  
**Workbench:** schema v1, local key `ops-portfolio-workbench-v1`  
**Saved artifact:** Allocation and Risk Policy

The learner-facing implementation is complete and its source, learning, finance, and
static code gates pass. Final browser-matrix and production-build evidence could not be
completed in this cycle because localhost browser access and the network request required
by `next/font` were denied by the desktop safety layer. This record therefore does not use
`Ready for review` or `Release-ready`.

## 1. Controlling records and scope

- Source gate: `docs/source-audits/mission-05-allocation.md`.
- Learning and interaction specification: `docs/lesson-plans/mission-05-allocation.md`.
- Workbench schema note: `docs/implementation-notes/portfolio-workbench-schema-v1.md`.
- Curriculum authority: `docs/lesson-plans/portfolio-builder-mission-curriculum.md`.

The mission implements build-while-learning through two isolated paths: **Build mine** and
**Practice case**. Both complete the same seven-stage sequence: Readiness Runway,
non-penalizing theory preflight, worked model, guided repair, policy build, unfamiliar
transfer, and final defense. A learner leaves with a persistent mandate plus strategic
weights/ranges, liquidity coverage, a selected illustrative stress, a total loss budget,
an optional candidate ceiling, and a rationale linking the policy to the mandate.

The bounded scope excludes products, live market data, optimizer output, trades, universal
weights/reserves/caps, forecasts, and recommendations.

## 2. Ordered release gates

### Gate A — source integrity: passed

The exact 38-webcast edition is locked. Sessions 1, 2, 3, and 30 were reviewed across the
complete decks, captions, quizzes, and solutions. Complete Investor.gov/CFPB pages and the
32-page Vanguard provider artifact were reviewed. The claim matrix distinguishes
source-authentic relationships from OPS teaching adaptations and quarantines dated
Session 30 magnitudes, unsupported FINRA concentration claims, optimizer inputs, and
provider examples recast as personal rules.

### Gate B — learner sequence: passed

The rendered sequence follows introduce → model → guided practice → independent transfer →
assessment. Each required term is positively defined before use. The diagnostic preflight
is explicitly non-penalizing, includes “I don't know yet,” opens only the missed concept
bridges, and requires a fresh item after remediation. Migrated evidence never supplies
fresh Readiness or assessment credit.

### Gate C — interaction design: passed

| Control | Learner decision | Visible finance result | Misconception exposed | Equivalent paths |
| --- | --- | --- | --- | --- |
| Personal / practice selector | Which isolated case to build | Active case, readiness route, checkpoint count | A fictional case is not personal advice | 44px button; keyboard/touch; mode text persists without motion |
| Readiness steps | Goal, clock, cash need, capacity, willingness, authority | Explained deployment route and action plan | Willingness is not capacity; unresolved readiness is not failure | Native fields/radios; descriptive step labels; compact vertical flow |
| Preflight choices | Theory relationship or “I don't know yet” | Targeted definition, example, fresh retry | More tickers do not guarantee safety; frontier output is not suitability | Native radio groups; no motion dependency |
| Contribution reveal | Read one sleeve at a time | Weight × hypothetical loss → portfolio loss contribution | Sleeve loss is not portfolio loss | Button/keyboard; immediate table/cards; reduced motion unchanged |
| Repair inputs | Any coherent weights plus trade-off | Weight total, cash coverage, stress loss, causal feedback | The illustrated repair is not the only answer | Labelled number entry and 44px ± controls; desktop table/mobile cards |
| Allocation Studio | Targets, ranges, budget, optional ceiling and rationale | Role constellation, dollars, contributions, budget status, ceiling | Stress is not forecast; ranges are not return forecasts; no hidden optimum | Direct inputs + buttons; summary table/cards; static reduced-motion constellation |
| Transfer and defense | Repair changed mandate; identify invalidation; calculate ceiling | Independent coherence checks and saved Dossier artifact | A mandate change must reopen downstream decisions | Native controls; textual feedback; no animation required |

### Gate D — finance and state integrity: passed

Independent checks use unrounded inputs and basis-point integer policy math:

- Model: `20%×0% + 30%×10% + 50%×35% = 20.5%`, or `$8,200` of `$40,000`.
- Guided stress repair: `20%×0% + 35%×10% + 45%×40% = 21.5%`, or `$10,750` of `$50,000`.
- Transfer before repair: `10%×0% + 35%×8% + 55%×40% = 24.8%`, or `$14,880` of `$60,000`.
- Transfer repair: `25%×0% + 35%×8% + 40%×40% = 18.8%`, or `$11,280`.
- Final policy: `15%×0% + 35%×12% + 50%×40% = 24.2%`, or `$19,360` of `$80,000`.
- Candidate ceiling: `1.5% ÷ 50% = 3%`, or `$2,400` of `$80,000`.

Guards reject incomplete totals, impossible ranges, nonfinite/fractional/out-of-range basis
points, liquidity shortfalls, over-budget stresses, candidate-policy mismatches, and mandate
amount/cash-need drift. The exact mandate cash need survives non-even basis-point round
trips. A semantic mandate change invalidates allocation and all downstream checkpoints;
timestamp-only acknowledgement changes do not. Personal and practice cases remain isolated.

The loader preserves future-version raw storage, recovers malformed v1 data with precise
issues, imports all seven older Mission artifacts as neutral `migrated-unconfirmed`
evidence, and never infers mastery from legacy completion. v1 is deliberately local-only;
it is not written into the boolean-union progress document or Supabase.

### Gate E — accessibility, responsive, theme, and visual QA: pending

An earlier implementation state was walked from fresh practice state, saved, reloaded at
7/7, opened in the Dossier, and switched between isolated modes. Earlier visual checks
covered 1440×900, 1280×720, 1024×768, 390×844, 320×800, and a 640×450 effective 200%
reflow. Those observations remain useful historical evidence, but they do not close Gate E
for the final lifecycle/hydration fixes in this record.

Code inspection and earlier browser evidence confirm 44px controls, a 12px typography
floor, mobile labelled cards, native keyboard controls, semantic errors, and a reduced-motion
fallback. The final required fresh/migrated, correct/incorrect, keyboard-completion,
responsive, theme, invalidation, Dossier, and console matrix is still pending. The in-app
browser was denied access to `http://localhost:3000` by the desktop safety layer; no alternate
browser surface was used to circumvent that decision.

## 3. Verification ledger

- `npm.cmd run typecheck` — passed after the final lifecycle/hydration fixes.
- Focused Mission 5 tests — 4 files, 70 tests passed.
- `npm.cmd test` — 21 files, 179 tests passed.
- `npm.cmd run lint` — passed with two pre-existing onboarding hook warnings outside
  Mission 5.
- `git diff --check` — passed (line-ending notices only).
- Earlier focused Playwright and typography runs passed before the final state fixes; the
  current-cycle browser rerun is pending and is not represented as final evidence.
- `npm.cmd run build` reached successful compilation and type/lint validation, then the
  shared `.next` output failed at page-data collection. An isolated-output retry was blocked
  because its configured Google-font request was denied. A clean final production build is
  still required.

## 4. Residual boundaries

- This is educational policy construction, not investment advice, suitability approval,
  account eligibility, product selection, or permission to trade.
- “Ready / Steady / Grow,” cases, ranges, stress losses, and ceiling examples are OPS
  pedagogy or learner-owned policy, not source forecasts or universal defaults.
- The candidate ceiling is optional. No regulator-supplied personal position cap is claimed.
- The Workbench remains local to this browser in schema v1. Cross-device/cloud sync needs a
  separate version-aware document and privacy design.
- A personal learner with a usable planning amount can finish a constrained paper policy
  and deployment action plan. A learner without a usable personal planning amount completes
  the same assessed policy through Practice case while preserving the personal deployment
  action plan; Mission 5 does not unlock live-money status.
- Product identity, orders, taxes, rebalancing, and operating rules remain later missions.

## 5. Stakeholder decision

`Blocked - implementation` — rerun and record the final browser matrix and clean production
build before requesting stakeholder review. Only after those gates pass may this record move
to `Ready for review`; only explicit approval of that exact implementation permits a later
record to use `Release-ready`.
