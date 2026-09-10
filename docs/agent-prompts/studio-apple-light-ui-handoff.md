# Claude handoff: a light Studio workspace

Prepared September 7, 2026. Scope: Studio UI design only.

## 1. Assignment and authority

The user asks: “Can you help design just the studio UI using Apple standards. Just design it and send a prompt to claude. It must be good like Apple's UI, I prefer light color themed than dark as now.”

Review and develop this design before changing production code. This handoff does not authorize implementation, commits, pushes, purchasing, publishing, or a site-wide rename. Although the receiving conversation is called “Portfolio Builder real-case reconstruction,” this assignment concerns the Studio workspace; it does not restart a Portfolio Builder lesson phase.

Read `C:/Open Portfolio Studio/AGENTS.md` and `C:/Open Portfolio Studio/CLAUDE.md`. The user's explicit preference for light Studio surfaces supersedes the repository's suggested dark aesthetic. Keep the existing site identity until a rename is separately authorized.

The accompanying interactive design is:
`C:/Users/suiyh/.codex/visualizations/2026/09/05/01a06ee1-511e-7381-9618-242e5c18a076/studio-light-workspace.html`

It demonstrates layout, hierarchy, and interactions. Prototype illustrations and simulated states are not production capabilities or verified investment research.

## 2. What the interface must accomplish

Studio should help a beginner define goals, develop an investment philosophy, investigate investments, construct portfolio alternatives, examine consequences, and retain their reasoning. Investment Foundations completion is not required.

Preserve the user's ownership of investment judgment. No AI-selected portfolio, unexplained recommendation score, or automatic investment conclusion. The design must support stocks, foreign stocks, bonds, funds, and cash. Company analysis uses Measuring the Moat; bonds and funds need their own appropriate views.

Rigor should appear through connected work: a source informs an observation, an observation informs an assumption, an assumption changes a calculation, and the calculation informs a recorded decision. Keep explanations reachable beside the relevant action.

The design uses Apple's guidance on hierarchy, familiar controls, restrained materials, and accessible interaction. Geometry, colors, breakpoints, and web behavior below are original Studio decisions, not Apple-mandated measurements or an Apple endorsement.

## 3. One workspace, six destinations

Use one persistent project frame with six sidebar destinations:

| Destination | Primary work |
| --- | --- |
| Overview | Resume recent work and inspect unresolved questions. |
| Goals | Define one or several objectives and their constraints. |
| Strategy | Develop and record philosophy, practical rules, and supporting evidence. |
| Research | Explore investments and maintain investigations, including rejections. |
| Portfolio | Construct, copy, compare, and test named alternatives. |
| Review | Examine evidence, costs, downside outcomes, and operating rules. |

Goals are required before user-specific portfolio construction. Explain that dependency in place and link directly to the missing work. A clearly labelled historical example can demonstrate the workspace without inventing personal goals or research.

Returning users reopen the last meaningful working location. Overview shows a compact goal summary, a concrete continuation such as “Review the margin assumption you changed,” recent investigations, and changes requiring attention. Avoid decorative totals, research completion percentages, and a blank dashboard.

Project identity, practice/personal mode, and save status remain visible. Keep research selection and reading position when switching destinations. Provide navigable URLs for substantial locations in eventual implementation; navigation should remain understandable with browser Back.

## 4. Desktop frame and responsive behavior

At 1280px and above, use a sidebar about 208px wide, a single project toolbar about 64px high, and a broad white working surface. An optional source/details inspector occupies approximately 320px beside the work. It opens for the selected datum, passage, or assumption and closes without losing state. Keep a useful working width; do not force three narrow columns.

At 1024px, retain sidebar and work. Opening the inspector temporarily replaces the main work with a clearly labelled source or explanation view. Its Back control restores the exact work context.

From 768px to 1023px, use compact navigation with a destination menu and the same work/detail replacement. Do not squeeze desktop columns onto a tablet.

At 767px and below, use one focused view, a compact project bar, and explicit Work / Sources switching when evidence is available. A menu exposes all six destinations with their text labels. Preserve the selected source, position, and unsaved input between views. Notes and explanations are reachable inside the details view.

At 1920px, maintain readable reading columns and use the additional width for genuine comparison, not stretched prose. Data tables may expand when additional columns remain useful.

The toolbar contains project-level actions: project name, save state, help, and a restrained More menu for backup/import/recovery. Destination navigation belongs in the sidebar. Context actions belong near their content. Avoid a second marketing hero, fake macOS window buttons, or floating toolbar stacks.

Account for the existing shared site header and footer. The Studio design should have one clear navigation hierarchy; any later shell adaptation must be scoped to Studio and reviewed before implementation.

## 5. Light visual system

Use semantic tokens scoped to Studio:

| Role | Initial value |
| --- | --- |
| Canvas | #f5f5f7 |
| Main working surface | #ffffff |
| Sidebar | #f0f1f3 |
| Primary text | #1d1d1f |
| Secondary text | #62646c |
| Action blue | #0066cc |
| Selected background | #e8f1fc |
| Quiet separator | #dedee3 |
| Input outline | #85858c |

Quiet separators group content; they must not be the only boundary identifying an interactive field. Use the stronger outline for inputs. Focus gets a distinct visible blue ring with separation from the component.

Suggested semantic states: dark green for confirmed saving, amber-brown for attention, and dark red for errors, each accompanied by text and an appropriate icon. Do not reuse financial gain/loss colors as the sole selection or completion signal. Verify every actual foreground/background pair.

Use Inter for interface, body, controls, and tabular figures. Main workspace headings are approximately 24–28px, semibold, sans serif; body text is normally 15–16px. Smaller metadata must remain legible. Fraunces can appear sparingly in editorial case introductions, not every panel title.

Use an 8px spacing rhythm, approximately 8px control corners and 12px grouped-surface corners. Use whitespace and hairline grouping more often than boxed cards. Reserve shadows for genuine overlays or elevation.

Prefer opaque white tables and document surfaces. If translucency is used, restrict it to a quiet navigation or toolbar layer, with a fully opaque fallback. Do not put colorful glass, blur, or moving backgrounds behind financial data.

Use existing permitted icons or original simple vectors. Do not download or redistribute Apple's fonts, SF Symbols, logos, or product artwork to imitate a native app.

## 6. Goals: start with purpose and show its consequences

The first task asks what the money is for, the target amount, the date, and how flexible that target is. Present one objective at a time with an “Add another goal” action and a compact summary list.

Group inputs by the decision they support: desired outcome, existing money/contributions, then limits. Explain shared funding when several goals draw on the same available money. Distinguish ability to withstand loss from willingness to accept it.

Place the conversion tool immediately beside the active objective. A user can enter “double the starting amount in six years”; the result is **12.25% annual return needed**, compounded, assuming no additional cash flows. Never label that result expected return or suggest that it is achievable simply because it was calculated.

Offer precise numeric entry, editable time/contribution alternatives, and a small timeline showing the changed result. Contributions require timing-aware calculations rather than reusing the no-contribution formula.

A historical institutional example is secondary and clearly sourced, with its date and circumstances. Users may inspect it without having its objectives copied into their plan. Do not invent an institution's portfolio or future return.

## 7. Strategy: develop a philosophy through evidence

Use a readable strategy page, not a questionnaire asking novices to invent a market belief. Begin with a short concrete observation, contrasting explanations, and a route to broader historical evidence. Then help users connect a provisional belief to their circumstances and practical rules.

Provide several contrasting approaches with appropriate tools across the permitted instruments. Company fundamental research must not become the assumed philosophy for everyone. Never force bond or fund users through a company-moat worksheet.

A saved strategy records what the user believes, supporting and challenging evidence, circumstances in which it could fail, and what would cause reconsideration. Allow uncertainty and revision.

Several named strategies can coexist inside one portfolio, each with a purpose, assigned capital, and rules. Highlight contradictory instructions with the actual conflict described. Do not resolve philosophical disagreement by selecting a strategy for the user.

The UI can show evidence checks and incomplete reasoning. This handoff does not authorize introducing an AI critic; that remains a separate product decision.

## 8. Research: evidence beside a useful analytical view

Research uses a searchable investigation list and a selected investment. Preserve rejected and unheld candidates. Separate starting research from adding a position.

For company research, use five readable subviews:

| Subview | Coverage |
| --- | --- |
| Business | Business model, customer value, activity choices, competitive advantage, and durability. |
| Industry | Industry boundaries, participants, competition, entry barriers, structure, and changing shares. |
| Financials | Returns on capital, margins, capital turnover, reinvestment, accounting qualifications, and multi-period evidence. |
| Valuation | Price expectations, forward assumptions, return duration, reinvestment, and valuation sensitivity. |
| My reasoning | Explanations, supporting/challenging evidence, open questions, and the user's conclusion. |

These headings organize the complete Moat investigation; they must not reduce it to five scores or remove competition, durability, or price. Retain the reviewed October 15, 2024 source edition and clearly distinguish original Studio pedagogy.

The default Financials view should be a readable financial table and purposeful chart, with one selected item opening the inspector. Put units, currency, period, and missing values beside the figures. A chart selection should explain a meaningful relationship or expose its evidence.

Preserve the current manual-entry path. Group the seven inputs by statement/relationship, show exact numeric entry, and explain where a figure can be found. Unknown report dates, units, or sources must be explicitly unknown; do not fabricate metadata.

The inspector has Source / Explain / Notes tabs. Source shows the document identity, relevant location, date, and passage or data lineage when available. Explain defines the selected concept with a concrete example. Notes captures the user's interpretation and whether evidence supports, challenges, or provides context.

Keep five distinctions visible:

- **Source fact:** reviewed document value, read-only with source and period.
- **Entered figure:** supplied by the user; verification status explicit.
- **Calculation:** method and inputs accessible.
- **Assumption:** editable with rationale and observable effect.
- **Judgment:** the user's words, with evidence and open questions.

Use labels, placement, and behavior as well as color. Source corrections should preserve the previous basis of saved reasoning.

Missing analytical tools may appear in the design as documented future states. Production must never offer a successful-looking valuation, comparison, or source attachment without the corresponding behavior and evidence.

## 9. Portfolio: make allocation changes assessable

Use a holdings table with instrument, strategy, allocation, amount, and relevant warnings. A compact allocation graphic accompanies the table. Editing a weight changes the amount, remaining money, and other available consequences together.

Keep cash explicit. Distinguish unassigned money from an intentional cash allocation. Preserve the existing units, bond quote conventions, accrued interest, fractional-share rules, fees, and cents-safe rounding.

Named alternatives are first-class. Duplicate an alternative, change its construction, and compare it without destroying the original. The comparison selects a small number of meaningful differences: goal outcomes, exposures, costs, and downside results with assumptions accessible.

A bond detail view should emphasize dated payments, maturity, price/yield, issuer risk, and applicable sensitivity. Fund detail should expose mandate, costs, holdings overlap, and underlying exposure. Foreign-stock detail must distinguish domicile, listing currency, and reporting currency.

Never equate more holdings with sufficient diversification, or a historical scenario result with a forecast. Keep unavailable portfolio analytics visibly unavailable.

## 10. Review and persistent states

Required final review covers supporting and challenging evidence, an appropriate comparison including costs, and downside scenarios affecting the user's goals.

A missed goal does not automatically prevent finalizing. Show the affected objective, scenario, magnitude of shortfall, and assumptions. “Accept this trade-off” requires the user's reason and a review trigger; the failed scenario remains attached to the decision. Impossible balances and structurally invalid records can block finalization.

Draft saving remains available while research is incomplete. Finalizing records a decision; it does not place a trade. Retain operating rules and subsequent review history.

Design the full state set:

| State | Visible behavior |
| --- | --- |
| Loading | Stable layout and specific opening status. |
| Empty | One useful action and an optional labelled example. |
| Saving | Quiet persistent acknowledgement. |
| Saved | “Saved in this browser,” only after persistence confirms it. |
| Unsaved/error | Retained draft, clear cause, retry and backup actions. |
| Conflict | Explain another tab changed the record; preserve draft and offer deliberate recovery choices. |
| Blocked/unknown version | Preserve original data and expose recovery/export without presenting an empty success. |
| Missing/stale data | Name what is unavailable or dated and its effect on this analysis. |
| Needs review | Name the changed input and affected reasoning. |
| Deletion | Explain the exact affected record; protect research when removing a holding. |

Do not turn completion ticks into investment-quality judgments. Saved, supported, and reviewed are different states.

## 11. Current implementation to respect

Inspect current files again before proposing changes:

- `C:/Open Portfolio Studio/components/studio/StudioWorkspace.tsx`: v1 wizard using `useStudioPlan`.
- `C:/Open Portfolio Studio/components/studio/stages.tsx`: existing goal, catalog, allocation, risk, buying, rules, and export surfaces.
- `C:/Open Portfolio Studio/components/studio/IndustryView.tsx`: real industry comparison views.
- `C:/Open Portfolio Studio/components/studio/InvestigateView.tsx`: seven entered figures, peer interpretation, cost of capital, saved investigations.
- `C:/Open Portfolio Studio/components/studio/shared.tsx`: shared controls, including asynchronous typing protection.
- `C:/Open Portfolio Studio/lib/use-studio-project.ts` and `C:/Open Portfolio Studio/lib/studio-project/`: durable sessions, validation, conflicts, backups, independent research, alternatives, and calculation adapter.
- `C:/Open Portfolio Studio/lib/studio.ts`: existing arithmetic to preserve.
- `C:/Open Portfolio Studio/components/layout/SiteShell.tsx`, `C:/Open Portfolio Studio/lib/route-theme.ts`, and `C:/Open Portfolio Studio/app/globals.css`: shared shell and existing theme boundaries.

Quantitative figure investigations and qualitative candidate records are not yet connected. Several proposed features exceed the current schema. Identify those gaps explicitly.

Earlier design proposals and the September 6 progress ledger contain different product assumptions. Preserve implemented manual entry; do not silently adopt claimed later AI decisions or undo user-confirmed requirements. This assignment resolves UI presentation, not every product-policy discrepancy.

## 12. Review and acceptance

Deliver an annotated desktop/mobile design, reusable component/state inventory, and a prioritized implementation proposal. Identify what is purely visual, what needs integration, and what needs additional product/data work. Wait for implementation authorization.

Review all six required widths: 390, 768, 1024, 1280, 1440, and 1920px. At 1440×900, keep each normal work step within 1.5 page-height screens and the first meaningful control within half a screen. Purposeful document/table scrolling must be explicit; do not hide explanatory overflow to pass the measurement.

Verify keyboard navigation, logical focus order, visible focus, Escape behavior, focus restoration, labelled controls, screen-reader names, non-color state identification, reduced motion, and comfortable touch targets. Use a 44px target where practical, including mobile; keep dense visual rows independently operable. Check 4.5:1 normal-text contrast and 3:1 meaningful control/graphic contrast.

Exercise Goals → Research → Portfolio → Review, returning after navigation, missing-data states, unsaved/conflicting edits, rejected research, and a mobile source round trip. Report measured layout and interaction findings; do not call the design production-ready because a prototype looks convincing.

Apple references reviewed for the design direction: [principles](https://developer.apple.com/design/human-interface-guidelines/design-principles), [sidebars](https://developer.apple.com/design/human-interface-guidelines/sidebars), [toolbars](https://developer.apple.com/design/human-interface-guidelines/toolbars), [materials](https://developer.apple.com/design/human-interface-guidelines/materials), [color](https://developer.apple.com/design/human-interface-guidelines/color), [accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility), and [buttons](https://developer.apple.com/design/human-interface-guidelines/buttons).
