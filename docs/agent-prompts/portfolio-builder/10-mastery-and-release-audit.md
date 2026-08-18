# Phase 10 prompt — mastery, transfer, and full release audit

Paste after `00-master-operating-prompt.md`.

---

## Objective

Prove—or accurately disprove—that the complete Portfolio Builder teaches a first-time
learner to build, explain, stress-test, and operate a coherent personal or practice
portfolio.

Audit all 13 missions at curriculum level. At implementation level, inspect every currently
available route. If a required mission remains planned or gated, do not call the course
release-ready; record the exact open gate and audit the implemented subset.

This phase evaluates mastery, not aesthetics alone and not completion clicks.

## Required audit artifacts

Create or update, rather than duplicate:

- `docs/source-audits/portfolio-builder-13-mission-gate-a-ledger.md`
- `docs/learner-sequence-audits/portfolio-builder-13-mission-mastery-audit.md`
- `docs/release-evidence/portfolio-builder-mastery-sequence-qa.md`

### Gate A inheritance audit

Before the learner-sequence audit can support a course release, inventory source integrity
for every mission—including inherited built missions. One row per mission must identify:

- exact edition/session/current-source lock;
- complete deck visual review evidence;
- complete official narration review or documented unavailable-caption boundary;
- quiz/solution reconciliation;
- provenance and hashes for cached artifacts;
- claim-level coverage matrix path;
- assessment-answer and numerical verification path;
- source-authentic versus OPS-adaptation labeling;
- exact remaining gap and gate status.

Do not treat the complete 38-session corpus audit as a substitute for a mission's claim,
interaction, prerequisite, and assessment mapping. When an inherited mission lacks a
mission-level matrix, build the matrix from already canonical sources before releasing it;
if complete review evidence cannot be established, mark the mission `Blocked - source`.

The course cannot be `Ready for review` as a full release until all 13 Gate A rows pass.
Do not rewrite a source audit merely to make its status green.

The mastery audit has one row per mission:

| Field | Required evidence |
| --- | --- |
| Mission and actual status | available/planned and source/learning/implementation gate |
| Portfolio decision | observable decision the learner can make |
| Saved checkpoint | exact Workbench evidence |
| Prerequisites | exact earlier lessons/missions |
| New vocabulary | every first-use term |
| Introduce | exact scene with positive definition |
| Model | completed specimen and causal explanation |
| Guided practice | supported change and visible result |
| Workbench application | saved portfolio decision |
| Independent perturbation | new unaided case |
| Assessment | scored/progression evidence |
| Feedback | why, consequence, next step |
| Mastery evidence | stronger than completion |
| Downstream reuse | later missions depending on the skill |
| Defect/open gate | priority, location, remediation |

For every assessed idea, add an exact trace:

```text
Assessed idea:
Introduced at:
Modeled at:
Guided practice at:
Independent application at:
Assessed at:
Completion/checkpoint written at:
```

`Covered in the module` is not evidence.

## Khan-caliber learning checks

### Concept sequence

- Every abstraction is positively defined before use.
- Every finance term is followed by a concrete cause-and-effect example.
- Numerical examples identify event, price/portfolio effect, learner action, and condition
  that changes the conclusion.
- A completed model precedes learner construction.
- Guided practice changes one meaningful variable at a time.
- Workbench application follows model and practice.
- Independent perturbation uses genuinely new facts and no answer-revealing hints.
- Assessment is answerable from the course, not external knowledge.

### Scaffolding and feedback

- A Preflight cannot penalize and routes immediately to prerequisite help.
- Hints graduate from clarification to concept cue, evidence cue, first step, parallel
  worked example, then full explanation.
- Guided hint use is safe, but mastery still requires a fresh unaided item.
- Incorrect feedback explains the misconception and financial consequence.
- Correct feedback explains why the reasoning works and when it would stop working.
- Retry language is precise and psychologically safe.

### Progress and transfer

- Progress shows capability/checkpoint state, not time, scroll, opened scenes, or button
  clicks.
- Lesson completion, artifact saved, decision coherent, and mastery demonstrated are
  distinct.
- Important skills recur later in mixed contexts.
- The final transfer case does not label the needed tool or copy the learner's data.
- Critical safety failures override an aggregate score.

### Course dependency checks

- Missions 3/4 precede allocation in Mission 5.
- Mission 5 precedes timing in Mission 11.
- Mission 7 creates falsifiable value evidence before Mission 10.
- Missions 8/9 control Mission 10.
- Passive remains the default absent a complete Edge License.
- A valid current Mission 10 Architecture License is required before Mission 11 timing,
  including the explicit no-timing path.
- A valid current Mission 11 timing policy is required before Mission 12 verifies products
  or rehearses orders.
- Mission 12 cannot turn an unverified candidate or ambiguous identity into a holding.
- Mission 13 returns to Mission 1 and tests investor fit; it cannot grant either graduation
  state unless every Mission 1–12 checkpoint is valid and current.
- No required skill lives only in an optional lab.
- An upstream change visibly invalidates every dependent checkpoint.

## Defect priority

- `P0`: learner can progress without required competence; critical misconception passes;
  planned work appears complete; hidden prerequisite blocks a novice; controlled portfolio
  state is violated.
- `P1`: missing introduction, model, guided practice, independent application, causal
  feedback, meaningful retry, or required checkpoint behavior.
- `P2`: confusing term, weak transition, ambiguous instruction, poor next-action guidance,
  or avoidable cognitive load without altered finance logic.

Source gaps remain `Blocked - source`; do not disguise them as pedagogy defects.

## Remediation authority

After completing the matrix, fix the smallest coherent P0/P1 defects in currently available
routes only when the existing locked source and state architecture already support the fix.

Permitted:

- move an existing definition earlier;
- add a direct source-supported definition;
- add a model or guided step;
- split guided practice from independent assessment;
- add a parallel transfer item using verified logic;
- improve causal feedback or layered hints;
- clarify transition/next action;
- correct metadata that overpromises the core route;
- add targeted answer/progression tests.

Stop and document rather than improvise if a fix requires a new claim, source, persistence
schema, or unbuilt mission.

## Fresh-learner browser protocol

For every available mission, record:

- first visit;
- definition/model state;
- guided attempt;
- incorrect attempt and feedback;
- each hint layer;
- fresh retry;
- independent perturbation;
- assessment;
- save and checkpoint state;
- reload/resume;
- upstream-change invalidation;
- next route;
- keyboard-only behavior;
- narrow-screen behavior;
- both themes and reduced motion;
- console result.

Use isolated test data. Do not erase the user's saved data. If browser tooling is
unavailable, leave the browser and full-release gate open.

## Required automated checks

Run targeted tests throughout, then at least:

```text
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run test:e2e
```

If the app requires a warmed dev server for reliable E2E, record both cold and warm
behavior rather than dismissing failures. Never weaken the typography/progression walker to
make a route pass. Add exact answer keys for typed or set-valued assessments when needed.

## Acceptance criteria

- All 13 missions appear in the mastery audit.
- Every available core lesson and assessment maps to an exact mission.
- Every assessed idea has the complete learning trace.
- No optional lab is a hidden prerequisite.
- No mission outcome promises an absent skill.
- Passive consumption or unsupported field entry cannot grant competence.
- Hinted practice is followed by unaided transfer.
- Feedback explains finance cause and effect.
- Planned/gated missions remain accurately unavailable.
- Slugs, keys, IDs, and saved progress remain stable.
- No unsupported claim is introduced.
- Tests and browser evidence exist or their gates remain explicitly open.

## Explicit non-goals

Do not:

- reorder or redesign the approved curriculum;
- implement a gated mission;
- close a source gap through a secondary summary;
- create a second mastery store or gamification system;
- copy Khan's scoring, gems, streaks, colors, or layout;
- redesign the visual system in this phase;
- claim advisory competence, accreditation, guaranteed returns, or competition success;
- commit or push.

The final response reports separate gate statuses for the implemented mission set and the
complete 13-mission course.

---
