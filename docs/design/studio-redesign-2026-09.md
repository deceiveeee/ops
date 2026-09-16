# Studio overview redesign — September 14, 2026

Studio now carries the homepage's visual direction into the saved workspace: lavender, charcoal and lime, Inter with a Fraunces accent, original document artwork, and a portfolio diagram connected to the learner's actual allocation.

## Product behavior

- One suggested action follows the existing sequence: goal, research, amounts, operating rules, then risk and cost. Every section remains available.
- The portfolio ring shows target percentages of the budget after the cash reserve. It is not a performance chart. The amount and description use the existing Studio calculation. A total above 100% explicitly shows the excess and asks the learner to check the weights.
- The goal and recent research come from saved work. Rejected investments remain visible, with their status and evidence count. Company links reopen the selected investigation.
- Desktop shows the three most recently updated records in each research list, with a button to show all. Mobile puts these same lists behind a native keyboard-accessible “Your research” disclosure with saved-record counts.
- The shared Studio frame adds section icons and a clear active state. Its mobile toolbar fits on two rows, and the backup panel stays inside the viewport. Save status, recovery, persistence and practice/personal switching retain their existing behavior.
- The mobile Studio footer is compact. Its links and storage information remain available.

## Implementation boundaries

Changes are confined to the Studio overview and shared frame, a scoped CSS module, original SVG icons, and overview browser tests. No new library, external data call, example portfolio or storage migration was introduced. Research tools being developed in parallel are outside this change.

The desktop research list and mobile disclosure use CSS visibility with distinct heading IDs. The browser therefore selects the layout before hydration; there is no JavaScript viewport switch that moves the page after it loads. Document motion uses transforms and is disabled for reduced motion.

## Verification

The isolated review tree is based on commit `230175b` plus this change, so concurrent unfinished research-tool edits do not affect its build or results.

- Unit suite: 765 tests in 59 files passed.
- Overview tests cover allocation after the reserve, a total above 100%, rejected research, older records, mode switching, keyboard disclosure, backup-menu positioning, responsive dimensions and reduced motion.
- Screenshots cover 390, 768, 1024, 1280, 1440 and 1920 pixels, each at a 900-pixel viewport height. Both fresh and populated states were inspected, including their mobile compositions.
- The first visual pass found excessive mobile toolbar wrapping and page height. The mobile toolbar, research disclosure and footer resolve those. The populated-state pass also identified and corrected cramped ring text.

The complete production browser suite passed **136 tests**, with three optional checks skipped. After the final ring-label refinement, a fresh production build passed all **7 focused overview and capture checks**. Next's build also completed its TypeScript and lint checks.

| Width | Fresh overview | Saved overview |
| --- | --- | --- |
| 390 | 1.42 screens | 1.49 screens |
| 768 | 1.28 screens | 1.45 screens |
| 1024 | 1.22 screens | 1.39 screens |
| 1280 | 1.26 screens | 1.38 screens |
| 1440 | 1.25 screens | 1.39 screens |
| 1920 | 1.25 screens | 1.39 screens |

Measurements include the site header and footer. The saved fixture has a goal, a cash reserve, one allocated investment, one rejected investment and one company investigation. Expanding research or showing all records deliberately reveals additional content. No sideways overflow or nested scroll region was found. No P0, P1 or P2 visual defect remains in the checked overview states.

The runtime check found no application exception or unexpected failed resource. Local production returns 404 for the two Vercel-injected analytics scripts (`/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js`); their URLs are recorded separately from application errors.

Evidence: `.agent-shots/studio-release-{width}.png`, `.agent-shots/studio-saved-{width}.png`, `studio-release-report.md`, `studio-saved-report.json` and `studio-runtime-report.json`. Browser coverage lives in `e2e/studio-overview.spec.ts`.
