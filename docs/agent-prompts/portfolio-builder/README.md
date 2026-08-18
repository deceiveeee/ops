# Portfolio Builder agent prompt pack

**Version:** 1.0

**Prepared:** 2026-08-12

**Purpose:** let Claude Code, Codex, or another repository-aware coding agent continue the
approved Portfolio Builder build without losing the source discipline, learning logic, or
design quality behind the curriculum.

This is not one giant "make the website beautiful" prompt. The work is split into bounded
passes because the same progress, registry, course, dossier, and end-to-end files are touched
by nearly every mission. One agent owns those shared files at a time.

## The quality equation

Use the benchmarks for principles, not imitation:

> **Apple-level focus and craft** + **Khan-style mastery and feedback** +
> **OPS finance authenticity and interaction**

- Apple contributes focus, hierarchy, adaptive layout, purposeful motion, accessibility,
  and finish. Do not copy Apple page compositions, typography, icons, product language,
  Liquid Glass, or trade dress.
- Khan Academy contributes observable mastery, immediate practice, layered hints,
  explanatory feedback, diagnostic progress, safe retry, and cumulative transfer checks.
  Do not copy Khan's colors, illustrations, scoring, gems, streaks, or exact mastery rules.
- OPS contributes the finance-native visual metaphors, verified Damodaran source backbone,
  current primary-source layer, and one persistent portfolio built through decisions.

Official benchmark references:

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Apple design principles](https://developer.apple.com/design/human-interface-guidelines/design-principles)
- [Apple motion guidance](https://developer.apple.com/design/human-interface-guidelines/motion)
- [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Khan Academy mastery system](https://support.khanacademy.org/hc/en-us/articles/115002552631-What-are-Course-and-Unit-Mastery)
- [Khan Academy practice, hints, and rationales](https://blog.khanacademy.org/how-should-people-practice-on-khan-academy/)
- [Khan Academy Wonder Blocks](https://github.com/Khan/wonder-blocks)
- [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)

## How to use this pack

For each phase:

1. Start a new coding-agent conversation in `C:\Open Portfolio Studio`.
2. Paste the complete contents of `00-master-operating-prompt.md`.
3. Paste exactly one numbered phase prompt.
4. Tell the agent whether it may implement or is limited to an audit. The phase prompts
   assume implementation is authorized once their source and learning gates pass.
5. Keep only one implementation agent active on shared spine files.
6. Review the agent's evidence report before starting the next phase.
7. Do not authorize a commit or push until the working tree and browser result have been
   reviewed.

The prompts are designed for agents that can inspect and edit the repository. If an agent
cannot access the workspace, give it the controlling documents listed in the master prompt
and ask only for a plan or critique; do not let it invent code against an unseen codebase.

For Claude Code opened at the repository root, the short start message is:

```text
Read CLAUDE.md and every authority it names. Then execute
docs/agent-prompts/portfolio-builder/01-workbench-schema-and-migration.md.
Do not commit or push. Stop at any source or learning gate and report it exactly.
```

Change only the phase filename for the next pass. In a chat product without workspace file
access, paste the master and phase prompts in full instead.

## Recommended execution order

| Order | Prompt | Outcome |
| ---: | --- | --- |
| 0 | `00-master-operating-prompt.md` | Persistent constitution pasted before every phase |
| 1 | `01-workbench-schema-and-migration.md` | Versioned state, safe legacy migration, dependency invalidation |
| 2 | `02-workbench-shell.md` | Persistent desktop/mobile Workbench interface |
| 3 | `03-mission-05-allocation.md` | Mission 1 readiness dependency and Mission 5 policy allocation |
| 4 | `04-retrofit-existing-missions.md` | Existing missions write into the same Workbench |
| 5 | `05-mission-10-architecture.md` | Passive default and active Edge License, after Gate A closes |
| 6 | `06-mission-11-timing.md` | No-timing or bounded-timing policy, after narration boundary closes |
| 7 | `07-mission-12-holdings.md` | Exact product slate, overlap audit, and order rehearsal |
| 8 | `08-mission-13-capstone.md` | Flight test, operating rules, IPS, and transfer assessment |
| 9 | `09-course-experience-polish.md` | Coherent Apple-caliber experience without homogenizing lessons |
| 10 | `10-mastery-and-release-audit.md` | Full-course Khan-caliber learning and OPS release verification |
| After each phase | `12-independent-release-review.md` | Read-only skeptical review before accepting a handoff |
| Optional | `11-investment-committee-studio.md` | Competition-neutral team research and defense extension |
| Optional | `13-homepage-and-course-discovery.md` | Cinematic homepage and clear route into the course |
| Optional | `14-edge-investigation-labs.md` | Preserve the remaining Damodaran sessions as gated investigations |

Do not jump directly to the polish prompt. Visual polish cannot repair a weak state model,
an unsupported finance claim, or an incoherent learner sequence.

## One-owner rule for shared files

Unless the current code has moved the responsibility elsewhere, treat these as the shared
Portfolio Builder spine:

- `lib/if-progress.ts`
- any new Workbench state or migration module
- `data/lessons/lessons.ts`
- `data/courses/courses.ts`
- `data/courses/portfolioBuilder.ts`
- `lib/lessonRegistry.ts`
- `components/dossier/PortfolioDossier.tsx`
- `components/courses/PortfolioBuilderPath.tsx`
- `e2e/lesson-typography.spec.ts`

Two agents may research independent sources or create isolated audit documents in parallel.
They must not implement separate missions against this spine at the same time. A handoff is
explicit and does not depend on a commit.

## Required handoff from every phase

The agent's final response must state:

1. outcome first;
2. gate status: `Blocked - source`, `Blocked - learning`, `Blocked - implementation`,
   `Ready for review`, or `Release-ready`;
3. files changed and why;
4. finance calculations independently checked;
5. tests and browser scenarios run, with exact results;
6. viewports, themes, keyboard path, and reduced-motion state inspected;
7. anything not tested or still open;
8. whether it committed or pushed (default: neither).

Never accept "looks good," "tests pass," or "production ready" without the corresponding
evidence.

An implementation agent may return at most `Ready for review` unless the required human
stakeholder has explicitly approved that exact release after all gates passed. Curriculum
approval does not pre-approve a future implementation.

For a high-risk or learner-facing phase, open a separate read-only agent conversation with
`12-independent-release-review.md` after the builder finishes. Give the reviewer the
builder's final report and the current diff. Let the implementation owner address accepted
findings; do not let two agents edit the spine simultaneously.

## Current authority and stale records

The approved direction is recorded in
`docs/curriculum-approvals/portfolio-builder-2026-08-12.md`. The current implementation
authority is `docs/lesson-plans/portfolio-builder-mission-curriculum.md` plus
`docs/lesson-plans/portfolio-builder-guided-workbench.md`.

The following are provenance or historical context, not current implementation authority:

- `docs/lesson-plans/portfolio-builder-core-curriculum.md` — superseded 10-mission spine;
- `docs/release-evidence/portfolio-builder-phase-a.md` — explicitly superseded;
- `docs/handoff-to-codex.md` and `docs/handoff-to-codex-reply.md` — historical coordination
  snapshots whose status counts and ownership may be stale;
- `.superpowers/` — untracked process artifacts.

If the current repository contradicts this README, the agent must identify the exact
conflict and follow the hierarchy in the master prompt instead of silently guessing.
