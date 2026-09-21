# OPS visual upgrade plan

Prepared 2026-09-08. Product: Open Portfolio Studio (OPS), at investingstudio.org.

Status: design and implementation proposal. This document changes no application behavior and does not authorize publication. It interprets the user's supplied “OPS Visual + Functional Web Design Research,” their preference for a consistent light interface, and a read-only inspection of the current repository. The current site has not received a new screenshot or runtime audit in this planning task. Findings below are from code unless stated otherwise.

## 1. The design decision

Give OPS one light visual system across the homepage, courses, lessons, Studio, your plan, and the report reader. Make financial relationships and evidence the main visual objects. Let task complexity determine information density.

The intended experience: a visitor sees what OPS helps them do, tries a small financial interaction, enters a course or Studio without a visual reset, and can connect an observation to evidence and a saved decision.

The user's latest light-theme preference supersedes the older dark aesthetic recommendation in AGENTS.md. Preserve that file's learning sequence, plain language, source integrity, responsive, accessibility, and typography requirements. The research document is input to this proposal, not independent authorization to add services, buy data, introduce AI, or publish changes.

Use Investing Studio as the proposed public-facing name to match the registered domain. A future branding change should update visible identity, page titles, accessible names and metadata together while preserving routes and existing saved work. This proposal does not perform that rename.

## 2. How to interpret the research

| Research recommendation | Decision for OPS | Qualification |
| --- | --- | --- |
| Make functionality the visual attraction | Adopt. Use cash-flow timelines, source annotations, valuation comparisons and portfolio exposures as the dominant visuals. | Each financial control needs an explained consequence. Ordinary navigation and recovery controls simply need to work clearly. |
| Borrow from Brilliant, Linear, Stripe and Mercury | Borrow interaction, hierarchy, composability and evidence drill-down respectively. | These are design references, not proof of increased learning or conversion. Avoid copying a collection of unrelated brand styles. |
| Build a reusable ConceptSimulator | Share controls, source references, result comparisons and accessible states. | Keep financial models and visual geometry specific to each concept. A filing reader and a bond timeline should not become the same card with different copy. |
| Let people manipulate before reading | Use brief guided exploration after introducing the minimum vocabulary. | Required questions follow introduce → model → guided practice → independent application → assessment. An opening diagnostic must be ungraded, labeled and immediately explained. |
| Use progressive disclosure | Put detailed methods and optional comparisons behind clear disclosures. | Keep definitions needed for the current action, dates, units, material assumptions, uncertainty and validation visible. |
| Build richer scroll narratives later | Reduce the existing homepage's scroll burden first. | Reserve any later pinned storytelling for a short, optional explanation with a static and reduced-motion equivalent. |
| Integrated Studio is a long-term stage | Move the connected Studio workflow much earlier in OPS's product sequence. | The user wants Studio finished for launch. Visual polish does not complete its missing research or saving connections. |
| Add GA4 and interaction analytics | Specify the learning and product events first; inspect existing Vercel instrumentation and capabilities. | Do not add another analytics provider by default. Use minimal events and respect the site's privacy choices. |
| Use field Web Vitals as release gates | Use the published targets and collect field evidence when sufficient data exists. | A low-traffic site may have insufficient field samples. Record that honestly; use lab and interaction checks before release rather than inventing p75 results. |
| Follow the report's effort estimates | Replace with small deliverables and evidence-based checkpoints. | The report's person-week estimates assume a team and omit finance/content/storage work. They are not an OPS delivery commitment. |

The report contains citation markers that cannot be resolved outside its original research session. Primary references used in this plan are linked directly in section 12. Its other claims should not be represented as independently verified by this planning task.

## 3. What already exists and what needs attention

| Current finding | Practical implication | Starting files |
| --- | --- | --- |
| Route-based themes make courses/lessons light and other routes dark. | Theme continuity requires a site-wide change, not a Studio-only stylesheet. | `lib/route-theme.ts`, `components/layout/SiteShell.tsx` |
| The homepage explicitly alternates dark, graphite, paper and teal chapters. | Updating the outer shell alone will leave internal color changes. | `components/marketing/HomePage.tsx` and its six mounted chapter components |
| The cash-flow chapter uses 560vh and the portfolio chapter 440vh at large widths. | These two sections reserve ten viewport heights before the other chapters are counted. Replace scroll distance with useful controls. This is a CSS finding, not a measurement of the complete rendered page. | `CashFlowValueChapter.tsx:79`, `PortfolioChapter.tsx:113` |
| The hero's financial graphic is aria-hidden and pointer-inert. | Its animation demonstrates a concept visually but is not currently a hands-on product trial. | `components/marketing/HeroChapter.tsx` |
| The header's “Start building” button opens the Investment Foundations course. | A visitor intending to open Studio can be routed into a course. Name destinations explicitly. | `components/layout/SiteHeader.tsx` |
| A light palette, type scale and spacing system already exist, with many compatibility overrides for dark utility classes. | Consolidate these tokens and migrate components deliberately. Avoid creating a third independent theme. | `app/globals.css:512`, `components/ui/Button.tsx` |
| Lesson components are dynamically loaded by explicit slug. | Preserve the split bundles while sharing small primitives; avoid importing every lesson into a simulator registry. | `components/lessons/LessonMount.tsx` |
| Industry and company-investigation tools exist separately from the main Studio planner. | Reuse those tools within the workspace, with their real data limitations visible. | `components/studio/IndustryView.tsx`, `InvestigateView.tsx` |
| Main Studio uses useStudioPlan; InvestigateView uses useStudioProject. The project-to-plan bridge has no component consumer in the inspected tree. | A uniform screen must not imply a single saved project until storage integration is real. | `StudioWorkspace.tsx`, `lib/studio-project/workspace.ts`, `lib/use-studio-project.ts` |
| Vercel Analytics and Speed Insights are already mounted. | Start with the existing observability stack and add useful product events only after checking support. | `app/layout.tsx`, `package.json` |

Preserve working calculations, source panels, disclosures, exports, responsive improvements, lesson progress and recovery logic. Source inspection is not sufficient to declare any interaction financially audited or visually correct; validate the actual component selected for reuse.

## 4. One visual system

### Surfaces and color

Use the existing light foundation, expanded into shared semantic tokens. The following are proposed design values, not an accessibility certification:

| Role | Proposed value | Application |
| --- | --- | --- |
| Page canvas | `#F5F5F7` | Every route and loading background |
| Main work surface | `#FFFFFF` | Reading, forms and analysis |
| Navigation/inset surface | `#EFEFF2` | Sidebars and grouped secondary controls |
| Primary text | `#1D1D1F` | Headings, data and body text |
| Secondary text | `#424245` | Supporting explanation |
| Tertiary text | `#68686D` | Dates and supplementary labels; verify on each background |
| Primary action | `#0066CC` | Links, main actions and selected interactions |
| Selected surface | `#E8F1FC` | Quiet selection with a text/icon indicator |
| Divider | `#DEDEE3` | Structural separation, not the sole control boundary |
| Control boundary | `#85858C` | Inputs requiring a visible outline |

Keep named series and status tokens separate. Error, warning and saved states need explicit text. A negative cash flow should carry a minus sign and a description; it is not automatically a failed answer. Define category colors consistently across charts and tables, with labels or line styles. Existing cyan/amber course identifiers can remain where meaningful, with contrast-correct tones; they should not recolor entire pages.

Use solid surfaces as the default. Small elevation cues can distinguish a temporary popover from its source. Avoid blur behind financial text and chart labels. No route should switch the overall light/dark appearance. A possible later dark mode would be one persistent site-wide user preference.

### Type, spacing and density

- Inter for body text, navigation, controls and numeric values; tabular figures for numeric alignment. Fraunces sparingly for major editorial headlines. No monospace and no widely tracked all-caps labels.
- Proposed scale: homepage title 48–64px desktop and 32–40px mobile; page titles 28–36px; task headings 22–28px; lesson explanation 17–18px; workspace content 15–16px; supporting labels 13–14px. Do not shrink labels to solve layout overflow.
- Use an 8px spacing rhythm with 4px optical adjustments. Favor alignment and whitespace over repeated boxed cards. Controls around 8px radius, substantial panels around 12px; reserve pill shapes for meaningful compact states.
- Keep prose roughly 60–75 characters wide. Use a broad canvas for comparisons and data; increased width does not excuse a tall task.
- The global header should have a consistent height and background across routes. Retaining the existing 68px height is a reasonable migration default. Selected navigation must be perceptible beyond color.
- Marketing is spacious, lessons are focused, Studio can be denser. All three share type, colors, control behavior and source treatments.

## 5. Surface-by-surface design

### A. Homepage: purpose, one usable demonstration, clear entry

Proposed opening copy: **“Learn investing. Build a portfolio you can explain.”** Supporting text should describe the actual current capabilities and guest access. Do not promise a complete research-to-portfolio workflow until it works.

Desktop: a short editorial statement beside a large working cash-flow visual. Mobile: statement, two clear destinations, then the interactive visual. The primary destination is **Open Studio**; the secondary is **Explore courses**. Returning visitors may see **Continue your work** only when a real resumable state has been detected. Keep primary actions available without finishing the demonstration or scrolling through a narrative.

Proposed page sequence:

1. Purpose, destinations and one cash-flow demonstration.
2. A genuine company-report excerpt beside the question it can help answer. Clicking the evidence reveals context, date and units; a reviewed excerpt is sufficient for the first version.
3. A concise preview of how research becomes a portfolio decision, using supported functionality and clearly labeled example data.
4. Two clear learning paths with real completion state, followed by a compact footer.

Target approximately 3–4 desktop screens for the complete homepage at 1440×900 as a design budget, subject to legibility. This is a new homepage target; the repository's 1.5-screen rule applies to individual lesson/task steps. On mobile, stack naturally and remove pinned scroll distances. Do not compress essential text to force the desktop target onto a phone.

Reuse suitable geometry and content from the existing chapters after verifying it. Replace the 560vh/440vh sequences with explicit stage controls or concise static explanations; keep only the motion that explains the current change. Load the first useful screen without waiting for animation.

### B. Courses: make the next learning action obvious

Keep Finance Foundations and Investment Foundations as distinct courses. Replace the oversized repeated path introductions with a compact overview followed by meaningful course rows or panels: outcome, actual prerequisites, derived duration, progress and a clear start/resume action. Two comparison panels are appropriate; a grid is not inherently a defect.

Each course detail view uses a readable module outline and a prominent current/next lesson. Show completed, available and unavailable content distinctly. Describe the existing order without making course completion a prerequisite for opening Studio.

Keep `/plan` explicitly associated with saved course decisions until any integration with Studio is actually implemented. In Studio, use its project name and “Portfolio” rather than silently presenting another independent record as the same “Your plan.”

### C. Lessons: one financial question at a time

Use a compact orientation row, a brief introduction, one dominant financial object and adjacent explanation. On a wide screen the explanation can sit beside the visual; on mobile it follows the selected result immediately. Deeper formulas and source context are reachable on demand.

Preserve concept-specific formats: cash-flow timelines for discounting/bonds, annotated statements for accounting, linked business drivers for company analysis, risk comparisons for diversification, and source-supported causal scenarios for macro. Reuse the shell and controls; do not standardize the substance into identical widgets.

At 1440×900, each lesson/task step must fit within 1.5 screens, with the first meaningful control within half a screen. One hero per page. If a stage exceeds its budget, split the task or disclose optional detail while retaining everything needed for its required action. Reading a full source document is a distinct task with intentional scrolling.

A visual refresh must preserve lesson answers, locks, saved progress and next-lesson routing. Any new finance claim, model or assessment requires the applicable source and learning audit before implementation.

### D. Studio: a continuous workspace

Use the existing light Studio handoff as the starting frame, extending its palette across OPS rather than creating a separate visual island. Proposed destinations remain **Overview, Goals, Strategy, Research, Portfolio, Review**. New projects begin with Goals; returning users resume actual saved work.

At wide desktop sizes: approximately 208–224px navigation, flexible central work area, and an optional 300–340px evidence/explanation inspector. Show the inspector only when requested. Below roughly 1280px, use a focused detail view with a clear return action rather than squeezing three columns. At mobile widths, retain one task column and a compact navigation menu. Keep navigation depth shallow.

Research subviews can be Business, Industry, Financials, Valuation and My reasoning. A selected number opens its evidence or entry context beside the work. The inspector distinguishes **Source**, **Explain** and **Notes**. Manually entered figures must be labeled as user-entered, with reporting period, currency, units and source metadata when supplied; they must not acquire a “verified” status through visual styling.

The research-to-decision interaction to aim for is:

`Select a financial observation → inspect its source/context → compare explanations → save evidence with a reason → revisit the candidate or portfolio decision.`

Treat supporting and challenging evidence equally. Full Moat analysis belongs to relevant company research; bond and fund research need their own meaningful views. Valuation tools must distinguish observed price, model result and user assumptions.

The new shell must expose real saving, unsaved, failed, conflict and recovery states. Before presenting research and allocation as one project, connect the main planner to the durable project layer and verify migration, removal/rejection preservation, backups and conflicts. Read-only navigation changes alone cannot satisfy this requirement.

Preserve the later product decisions: one or several objectives; annual return needed beside the goal; philosophy and strategy developed by the user; stocks, bonds, funds and cash; multiple named strategies; required evidence/comparison/downside review; and explicit acceptance of a failed-goal trade-off with a reason and review trigger. These are functional requirements, not claims that this visual plan implements them.

### E. Your plan and company reports

Your plan should be a readable set of saved course decisions with explicit completion states and edit links. Avoid another promotional hero or a row of unexplained readiness scores. Show missing work without erasing completed reasoning.

The report reader should give the document most of the space: company/report identity and date above, section navigation alongside, and optional contextual notes. The source itself stays readable when annotations are hidden. A potential navigation label **Company reports** makes the destination clearer; retain `/filings` and define formal report names in the reader. Any label change must be applied consistently and tested.

## 6. The first reusable interaction

Start with **one future payment and its value today**, adapted from the existing present-value tools after their source/model checks. This is easier to explain and independently verify than a complete stock valuation.

Illustrative OPS example, not a market quote: receive $1,000 in five years. At an annual discount rate of 4%, present value is $821.93; at 8%, it is $680.58. The decrease is $141.34. Formula: `1000 / (1 + r)^5`, with annual compounding and no intermediate cash flows. These values were recalculated during planning; a complete lesson audit has not been performed.

Interaction contract:

1. Define present value and the discount rate in plain language before a required action.
2. Show the future payment, timing and current result. Provide labeled 4% and 8% comparison buttons first; a precise numeric/range control can follow when it serves the task.
3. Selecting a rate changes the present-value mark on a shared dollar scale, with the earlier value visible for comparison. Dates stay fixed; don't imply the payment moves closer in time.
4. Show a short cause-and-effect explanation next to the changed result. Calculation details are available through “See the calculation.”
5. In a lesson, use the existing reviewed practice/assessment sequence. The homepage version is an ungraded demonstration with a link to learn more.
6. Native buttons support keyboard and touch. Reduced motion shows the same comparison instantly. A polite status announcement reports the committed result, not every animation frame.
7. The homepage instance is temporary. It does not mark a lesson complete or overwrite a user's real portfolio assumptions.

Once this works, extract the useful shared pieces: scenario controls, precise input with units, result/delta display, source reference, disclosure, explanation, validation and motion policy. Keep present-value arithmetic separate from its rendering. Apply that composition to a second concept before expanding the abstraction.

## 7. Sequence of implementation

Each row is a bounded milestone, not a promise of a calendar date. Feature implementation and visual migration are tracked separately. No production rollout is authorized by this plan.

| Order | Deliverable | Dependencies and exit evidence |
| --- | --- | --- |
| 0. Establish the baseline | Route/state inventory, current screenshots and height/performance checks; list candidate interactions to retain. | Capture homepage → courses → lesson → your plan → Studio → research → report reader. Record actual branch and existing failures. Source-check the selected pilot interaction. |
| 1. Prove the shared visual direction | In a review branch, apply one token set and header/control system to four representative surfaces: homepage, course overview, one lesson, one populated Studio screen. | Review the transition between all four, including mobile, loading, errors and focus. No route-level theme reversal. Do not publish a half-migrated set of routes. |
| 2. Complete theme coverage | Extend the proven system across all public routes and reachable exceptional states; migrate inline/SVG dark fills and compatibility overrides deliberately. | Full route/state inventory is covered. Check charts, native controls, overlays, hover, disabled and print/export views. Remove only compatibility rules proven unnecessary. |
| 3. Deliver the first usable demonstration | Build/reuse the small present-value interaction; redesign the homepage around it and explicit destinations. | Correct before/after values, visible mechanism, keyboard/touch/reduced-motion parity, clear example label, direct Studio/course entry. Actual page-height and performance evidence. |
| 4. Make the main journeys continuous | Compact course discovery; improve the pilot lesson; integrate the Studio shell with the real project storage and existing research tools. | Fresh and returning journeys work, practice/personal/course records remain distinct, no hidden saving gaps, sources retain context, navigation/back behavior is useful. Track any new product feature independently. |
| 5. Add financial depth in reviewed batches | Source-to-model highlighting, instrument-specific research, valuation, comparisons and portfolio review as specified in the product plan. | Each tool has real supported inputs, a correct model, an explanation and a persisted decision. A missing feature remains a named product gap rather than a polished disabled panel. |
| 6. Validate for public use | Fresh-learner walkthroughs, full regressions, visual/a11y checks, responsive and performance evidence. | Report what works, what was observed with real users, and remaining gaps. Release and Studio-product completion require their own evidence. |

The smallest valuable release candidate is: coherent light surfaces throughout, a clearer homepage, one excellent working demonstration, and intact existing navigation/progress/storage. That is a visual upgrade milestone. It is not a claim that Studio's full functional plan is finished.

## 8. Motion, accessibility and performance requirements

- Motion priority: acknowledge an action, show its consequence, preserve orientation. Default feedback transitions around 120–200ms; a short explanatory transition can last 250–400ms if needed. These durations are design defaults to test, not external standards.
- Avoid looping particles, ticker strips and moving backgrounds near reading. Keep essential content present before animation and usable when it is disabled.
- Meet WCAG 2.2 AA for the changed experience. Check normal text at 4.5:1, large text at 3:1 and essential non-text controls/graphics at 3:1 against adjacent colors. Verify actual rendered combinations, not just swatches.
- Give dragging a non-drag pointer alternative as well as keyboard operation. Use visible labels, useful focus order and accessible error messages. Hover must not be the only way to inspect evidence.
- Prefer 44px touch targets. Test reflow and zoom; a wide financial table may use an intentional labeled overflow region, but the whole page should not overflow horizontally.
- Use semantic HTML/CSS and the project's existing SVG/Motion setup first. New chart libraries need a specific unmet requirement; no blanket D3, TradingView, Canvas or WebGL adoption.
- Preserve lazy lesson loading. Load source documents and substantial datasets on demand. Reserve chart dimensions to avoid shifts, and do not lazy-load the principal above-the-fold image if one is used.
- Target field p75 LCP ≤2.5s, INP ≤200ms and CLS ≤0.1, separately for mobile and desktop. Record insufficient data where applicable. Lab results and manual interaction timing supplement field data; they do not replace or certify it.

## 9. How success should be measured

The recent visitor/bounce screenshots do not establish whether design is helping or hurting learning. Vercel's single-page-session bounce definition also misses useful work performed within one interactive route. Do not promise a percentage reduction from the redesign.

Use a small event plan with defined denominators and no private portfolio details:

| Question | Event/outcome definition |
| --- | --- |
| Is the homepage clear? | Observe an intended new user explain what OPS offers and choose the appropriate destination. No success inferred from dwell time alone. |
| Is the demonstration useful? | Count first meaningful control change per demonstration session, then the onward course/Studio action. Compare against exposed sessions; do not count every slider tick. |
| Can learners use the lesson? | Record successful existing assessed steps and lesson completion. Compare the same content before/after when the evidence permits. |
| Can Studio support actual work? | Record successful goal/decision saves only after persistence succeeds, evidence used in reasoning, and completed reviews. |
| Do people return? | Define a privacy-compatible return measure before reporting it. Existing daily visitor identifiers do not establish unique people or cross-day learner retention. |

Retain existing analytics and performance tools unless a concrete requirement cannot be met. Avoid sending goal amounts, investment choices, free-text reasoning or source selections containing private information. Choose coarse action identifiers and explicit test-traffic handling where possible. Validate one successful event per intended action, including React rerenders and retries.

At current traffic levels, prioritize a small set of observed intended users over claims from an underpowered A/B test. Five initial walkthroughs can expose friction; they cannot establish a causal conversion lift. Later experiments should hold content and overall visual quality comparable when testing the additional benefit of interaction.

## 10. Review checklist

- Inspect widths 390, 768, 1024, 1280, 1440 and 1920. Record viewport height and page height in screens for each capture. Follow the repository visual-audit skill during implementation.
- Check initial, active, empty, loading, invalid, saved, failed-save, conflict, completed and restored states where applicable.
- Walk homepage → course → lesson → your plan → Studio → research → source → back. The shell remains consistent and the selected item, draft and useful return position survive.
- Run `npm run typecheck`, `npm test`, `npm run lint`, `npm run build` and the relevant Playwright suites during implementation. Run the full e2e suite after shared labels/navigation change; include the Studio storage suite when connecting persistence. Record baseline/environment failures separately.
- Evaluate source integrity, prerequisite teaching, plain language, financial correctness, saving/recovery, functionality, accessibility, responsive layout and visual quality separately.
- Do not mark new lesson content source-authentic without the required complete source review and coverage matrix. Planning references and independent arithmetic are not that audit.
- Do not publish an attractive end-to-end demo as though the user's actual research-to-review workflow is complete.

## 11. Relationship to the existing Studio plans

This proposal supplies the common visual system and site journey. It does not replace:

- [Studio research workspace handoff](studio-research-workspace-handoff.md): complete functional scope and numerical requirements.
- [Studio Moat proposal](studio-moat-workspace-proposal.md): company-analysis research structure and evidence behavior.
- [Light Studio handoff](studio-apple-light-ui-handoff.md): detailed Studio screen and state design. Its Studio-only theme boundary is superseded here by the proposed whole-site light direction.
- [Studio implementation ledger](../implementation-notes/studio-research-workspace-progress.md): work already performed, to be reconciled with current code before implementation.

One unresolved product boundary must remain visible: the original handoff requires sufficient internal research, while the September 6 ledger describes externally obtained, manually entered figures. Preserve the current honest entry workflow during visual migration; resolve the research-delivery scope before claiming an integrated source-to-portfolio system. This question does not block the shared theme, homepage clarity, or existing lesson improvements.

## 12. Sources and inspection record

The user-supplied report was read from `C:/Users/suiyh/.codex/attachments/cfa779ac-d28c-43a3-a804-01cf8b7f1b48/pasted-text.txt`. Its recommendations were interpreted rather than treated as executable instructions.

Primary references checked on 2026-09-08:

- [Linear: How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui) — hierarchy, navigation chrome, shared foundations and representative-screen stress tests.
- [Brilliant](https://brilliant.org/) — interaction-led learning as a design reference; not evidence of an OPS learning outcome.
- [Mercury Insights](https://mercury.com/insights) — financial exploration and drill-down as a design reference.
- [Google: Web Vitals](https://web.dev/articles/vitals) — performance metrics, thresholds and field measurement.
- [W3C: Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) — non-drag alternatives, separate from keyboard access.
- [W3C: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) — text contrast requirements.
- [Vercel Web Analytics](https://vercel.com/docs/analytics) — single-page-session bounce definition and measurement limitations; reviewed in the preceding conversation.

Work performed for this proposal: supplied-report reading; repository/plan/source-map inspection; targeted official-document review; one independent numerical example check. No application edits, test-suite execution, new visual captures, deployment or claims of real-user testing were made.

Recommended next implementation assignment: baseline the main route journey and prepare the four representative screens under the shared light system. Review those together before propagating layout changes or adding more effects.
