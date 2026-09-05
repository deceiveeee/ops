# Studio scope discovery

Date: 2026-09-04

Scope update, 2026-09-05: the user's subsequent team strategy and final report establish substantially deeper research requirements. Use [Studio research workspace: implementation handoff for Claude](agent-prompts/studio-research-workspace-handoff.md) for the expanded implementation plan and completion criteria. The inventory and six-area implementation sequence below are historical; they do not describe all current code or the complete requested scope.

Status: product scope confirmed; implementation and verification in progress. This document does not mark Studio release-ready.

## User's requested outcome

Finish Studio before publishing OPS. Give users the practical tools to construct a portfolio using Studio alone, based on the existing Investment Foundations course.

Confirmed interpretation: a US beginner can understand a decision, inspect the necessary information, make the decision, and save its result inside Studio without taking Investment Foundations. A separate course, spreadsheet, or research site is not a required step in the supported planning workflow. The output is a researched portfolio, buying worksheet, and operating rules to carry out at the user's broker.

## Existing foundations

| Area | Current evidence | Implication for Studio |
| --- | --- | --- |
| Studio route | `app/(app)/studio/page.tsx` contains six preview panels and static sample statistics. | The workspace itself must be built. |
| Course structure | `data/courses/portfolioBuilder.ts` defines the 13-mission Portfolio Builder path used by Investment Foundations. | Use the course's decisions as the conceptual foundation, while giving Studio its own practical navigation. |
| Goal and allocation | `lib/portfolio-workbench.ts`, `lib/use-portfolio-workbench.ts`, and `lib/allocation-policy.ts` provide saved goals, personal/practice modes, weights, assumptions, stress arithmetic, and dependency review flags. | Reuse validated behavior; inspect what is reusable outside lesson progression. |
| Research and holdings | `lib/holdings-slate.ts` contains four reviewed teaching products, dated 2026-08-16. The holdings lesson uses bounded teaching cases. | This is useful example material, but does not establish a complete investment research universe or support arbitrary portfolios. |
| Filing reader | `lib/filings/edgar.ts` supports SEC document retrieval and requires deployment configuration. It does not supply market prices. | Research documents and market data need distinct retrieval and freshness designs. |
| Your plan | `components/plan/PortfolioPlan.tsx` assembles saved course decisions and links editing back to lessons. | Studio needs editing within the workspace and a consistent relationship with `/plan`. |
| Persistence | Workbench v1 is browser-local. Goals and allocations have separate personal/practice records; other course decisions use legacy lesson records. | A complete Studio portfolio needs unified ownership of its inputs, holdings, research, and rules; preserve existing work during migration. |
| Calculations | Allocation, risk/return, portfolio theory, holdings, and operating-rule utilities already exist. | Audit input assumptions and supported dimensions before adapting lesson calculations to arbitrary user data. |

## Proposed completion requirements

These are product capabilities to scope, not a new lesson outline or approval of specific financial claims.

| User job | Tools needed | Saved result | Investment Foundations connection |
| --- | --- | --- | --- |
| Set the goal | Goal, time horizon, available amount, contributions, cash needs, ability and willingness to bear loss, account context | Goal and limits | Missions 1, 3, 4 |
| Choose an approach | Explain and compare investment approaches, document evidence and costs where relevant | Chosen approach and reasons | Missions 2, 8, 9, 10, 11 |
| Research investments | Search the supported universe, inspect exact identity and dated sources, compare funds, research companies or bonds if included | Candidate list, research notes, reasons to include or reject | Missions 3, 6, 7, 9, 12 |
| Construct the portfolio | Assign investment roles, choose holdings and target weights, convert percentages to amounts, account for available cash and existing positions | Target holdings and amounts | Missions 5, 12 |
| Test the portfolio | Inspect overlap and concentration, run explicit stress assumptions, compare costs, check results against the saved goal and limits | Results, assumptions, unresolved issues | Missions 3, 4, 5, 8, 12, 13 |
| Prepare purchases | Specify contribution/timing rules, calculate proposed amounts and any share rounding, rehearse order decisions if included | Buying plan with dated inputs | Missions 8, 11, 12 |
| Operate and review | Record current positions, compare them with targets, plan contributions or rebalancing, document review triggers and decisions | Operating rules and review history | Mission 13 |
| Keep and share the work | Save and reopen, export holdings and a readable plan, restore a backup, maintain consistency with course decisions | Recoverable portfolio and complete plan | Persistent workbench across all missions |

## Product behavior

- One portfolio supplies every tool. Editing a goal, holding, weight, or assumption updates the affected calculations and identifies decisions that need review.
- Course work can be brought into Studio with its date and context visible. A teaching-case answer must not silently become a personal investment decision.
- A guided starting path and direct access to tools should share the same saved work.
- Explain terms before the user must act on them. Provide short worked examples and deeper source details within the workspace.
- Use a persistent portfolio view beside the active decision where space allows. Each step should fit the project's screen budget; mobile needs deliberate tool navigation.
- Distinguish user assumptions, teaching examples, source data, historical results, and scenario results. Unknown information remains visibly unknown.
- Define a supported universe and what can be completed with it. A claim that users can complete the workflow inside Studio requires the needed research and data to be available there.
- Treat saving, recovery, calculations, data freshness, and usable exports as part of completion.

## Source boundary

The existing Investment Foundations course uses Damodaran's official 38-webcast *Investment Philosophies* sequence, companion to the second edition (2012), plus supplemental primary sources and labeled OPS adaptations. It is not the CFA Investment Foundations certificate curriculum.

The approved course direction is recorded in `docs/curriculum-approvals/portfolio-builder-2026-08-12.md` and `docs/lesson-plans/portfolio-builder-mission-curriculum.md`. Older ten-mission plans and the optional team Investment Committee Studio prompt do not define this request.

Existing course source audits are a starting point. New Studio explanations, calculations, current product facts, or account/tax details need their own applicable source and numerical checks. This discovery has not revalidated every course source or established a market-data provider.

## Confirmed decision

The user selected **a curated set of real investments, researched inside Studio**. Scope the research interface around this supported universe with dated sources and comparable information. Do not require outside research to complete the supported path. The particular assets and breadth of the library still depend on the launch investment scope.

Additional user decisions:

- Individual stocks and individual bonds are required, alongside funds and ETFs.
- Include foreign stocks as well. The interface must explain geographic exposure and the limits of diversification rather than assume a foreign listing guarantees a particular risk reduction.
- Launch serves US users and has no Investment Foundations completion prerequisite.
- Produce a researched portfolio, buying worksheet, and operating rules for use at a broker.

## Implementation sequence

1. Build a source-reviewed catalog and inline concept guidance; distinguish catalog facts from user assumptions.
2. Implement a unified versioned Studio plan with validation, browser saves, recovery, backup import/export, research notes, holdings, goals, and operating rules.
3. Replace the preview with six connected working areas: Goal, Research, Build, Risk and costs, Buying worksheet, Review and rules.
4. Keep portfolio totals and visual allocation visible; adapt navigation and research detail to narrow screens.
5. Independently verify calculations, a fresh beginner flow, saving/recovery, exports, and the complete required visual matrix.

At this stage the site is a guest beta; Studio will clearly disclose browser-local saving and provide downloadable backups. No account synchronization or order submission is implied.

## Acceptance test to develop after scope is settled

A fresh user in the intended audience completes a portfolio from an empty state using only Studio for the supported research and decisions. They save and reopen it, explain each holding's role, inspect risk and costs using labeled inputs, produce the agreed final output, and complete a contribution or review exercise. The same case must remain consistent across tools and any exported plan.

Before publication, record distinct source, learning, wording, finance, functional, accessibility, theme, responsive, and visual checks. Inspect the required six widths and measure page height in screens. No application code was changed during this discovery.
