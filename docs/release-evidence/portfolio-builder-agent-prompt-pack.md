# Release evidence: Portfolio Builder agent prompt pack

**Date:** 2026-08-12

**Status:** Ready for review

## Outcome

Created a repository-aware execution system for Claude Code, Codex, or another coding
agent to continue the approved Portfolio Builder in bounded phases. The pack translates
Apple's focus/craft heuristics, Khan Academy's mastery/feedback practices, and OPS's
source-integrity and finance-native interaction rules without copying either benchmark's
visual identity or product mechanics.

This record covers prompt documentation only. It does not approve or implement a Workbench,
mission, homepage change, or learner release.

## Files

- Loader: `CLAUDE.md`
- Index and operating contract:
  `docs/agent-prompts/portfolio-builder/README.md` and
  `docs/agent-prompts/portfolio-builder/00-master-operating-prompt.md`
- Bounded core phases: Workbench schema, Workbench shell, Mission 1 readiness dependency
  plus Mission 5 allocation, existing-mission retrofit, Missions 10–13, experience polish,
  and mastery/release audit
- Optional phases: Investment Committee Studio, homepage/discovery, and 22-session Edge
  Investigation Labs
- Review and extension tools: independent release-review prompt and reusable task template

## Authority reviewed

- `AGENTS.md`
- `docs/curriculum-approvals/portfolio-builder-2026-08-12.md`
- `docs/lesson-plans/portfolio-builder-mission-curriculum.md`
- `docs/lesson-plans/portfolio-builder-guided-workbench.md`
- `docs/source-audits/portfolio-builder-practical-tools.md`
- `docs/source-audits/damodaran-investment-philosophies-corpus-audit.md`
- `docs/source-audits/mission-10-architecture-edge.md`
- `scripts/source/supplemental-manifest.json`
- the OPS lesson-release skill and its canonical release-status reference
- current progress, course, Dossier, lesson-shell, route, test, theme, and marketing anchors

Historical 10-mission plans, handoffs, and visual audits are explicitly quarantined as
provenance/baseline context rather than current authority.

## External benchmark review

Official Apple Human Interface Guidelines were used for purpose, hierarchy, agency,
adaptability, feedback, motion restraint, accessibility, and craft. Official Khan Academy
mastery/practice guidance and its Wonder Blocks repository were used for observable
mastery, immediate practice, layered hints, causal feedback, diagnostic progress, safe
retry, and component/accessibility discipline. WCAG 2.2 AA remains the web accessibility
baseline.

No Apple or Khan assets, layouts, fonts, colors, scoring, or branding were copied. The
optional committee prompt records the current Wharton external-course eligibility boundary
and forbids competition-prep positioning without organizer permission.

## Independent review and corrections

A separate read-only reviewer challenged the first draft. The pack was corrected to:

- require Mission 1 readiness in both personal and practice modes;
- provide a non-penalizing portfolio-theory Preflight/bridge before Mission 5;
- enforce every Mission 1–12 dependency, including architecture before timing and timing
  before product verification;
- invalidate the complete downstream timing/product/order/flight-test/operating/IPS chain
  when an upstream decision changes;
- block both graduation modes on any missing or unresolved Mission 1–12 checkpoint;
- use the canonical OPS release labels and reserve `Release-ready` for stakeholder-approved
  implementations;
- inventory Gate A for every inherited mission during the full release audit;
- prevent the homepage from marketing an incomplete 13-mission path as completable;
- give the remaining 22 Damodaran sessions an optional, non-core Edge Labs owner.

## Verification

- Confirmed all named current code anchors and six Finance Foundations prerequisite slugs
  exist.
- Confirmed the index contains all 15 numbered prompts plus the task template.
- Checked 18 new prompt/loader files for unbalanced Markdown fences, Unicode replacement
  characters, trailing whitespace, extra EOF blank lines, and final newlines: no structural
  issues.
- Confirmed the prompt pack uses the canonical statuses: `Blocked - source`,
  `Blocked - learning`, `Blocked - implementation`, `Ready for review`, and
  `Release-ready`.
- Reviewed the pack against the current dirty worktree without modifying or removing
  unrelated changes.

No TypeScript, unit, Playwright, browser, responsive, theme, or visual check was run because
this deliverable changes documentation and agent instructions only. No commit or push was
performed.

## Next action

Start with `01-workbench-schema-and-migration.md`. Do not begin the visual Workbench shell
or Mission 5 until the versioned state/migration contract passes review.
