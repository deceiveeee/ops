# Studio working pages — September 15, 2026

Goals and Research extend the Studio overview's lavender, charcoal and lime visual direction. Both pages use the existing saved project and its calculations.

## What changed

- Goals has three freely accessible panels: your goal, your money and your limits. Arrow keys, Home and End move between them. The money graphic separates the cash reserve from the amount available for investments and explains the arithmetic. The context below it shows the time horizon, twelve months of contributions, or the selected hypothetical loss amount.
- Research has investment search and type filters, three initial results, and a control to reveal the complete library. Company investigation and report tools remain directly accessible.
- Opening an investment replaces the library with a focused reader. Overview and risks, returns and costs, and holdings and sources each have their own view. The saved research record is available independently of whether the investment is in the portfolio.
- The existing definitions, worked examples, terminology and teaching sources remain available under “How to do this, with an example.” The first Goals view also introduces the portfolio and goal before asking for either.
- The research record, source facts, annual-report figures, dates, qualifications, rejected decisions and evidence actions retain their existing data and behavior. No data migration, dependency or market-data service was added.
- Mobile removes repeated section labels, stacks the cash graphic below the active form, and keeps the research controls within the page width. Inputs use 16px text on phones. The page respects reduced motion.

## Review and corrections

The first screenshot pass found a P1 screen-budget defect: several mobile views reached 1.51–1.73 screens. Research also repeated its introduction above each selected investment. Separating returns from risks, shortening the selected reader's heading and reducing the initial list to three results resolved that without removing source material.

The subsequent craft pass corrected the mobile cash bar's horizontal inset, shortened examples that overflowed the initial textarea height, and restored paragraph spacing within fund-return facts. Screenshots were inspected at 390 and 1440 pixels for the changed surfaces, with additional tablet, intermediate and 1920-pixel checks. No P0, P1 or P2 rendering defect remains in the eight captured resting views.

## Verification

The isolated review tree is commit `230175b` plus the Studio overview and working-page changes. Concurrent unfinished company-tool and course changes in the main checkout are outside this verification.

- Production build, TypeScript and lint checks passed.
- Unit suite: **765 passed in 59 files**.
- Full production browser suite: **141 passed, 3 optional tests skipped**. The skips are cloud sign-in progress, the separate shared-visual capture and slide-deck rendering.
- Functional coverage includes rapid goal edits, keyboard tabs, reserve arithmetic, an excessive reserve, search and filter recovery, switching facts and saved reasoning, portfolio additions and removals, all fund-return tables on phones, rejected decisions, evidence persistence, backup and restore, and separate practice/personal storage.
- Forty-eight production screenshots cover eight views at 390, 768, 1024, 1280, 1440 and 1920 pixels, all at 900px viewport height. Every captured view has an asserted 1.5-screen limit, no sideways overflow, no nested scroll area and no application exception.
- A manual in-app-browser check at phone width confirmed that $12,000 available and $3,000 reserved show $9,000 for investments, with a proportional cash graphic. A $150 monthly contribution shows $1,800 over twelve months. No browser error was logged during that check.

| Width | Tallest Goals panel | Research library | Tallest research reader view |
| --- | --- | --- | --- |
| 390 | 1.48 screens | 1.47 screens | 1.48 screens |
| 768 | 1.20 screens | 1.40 screens | 1.27 screens |
| 1024 | 1.20 screens | 1.34 screens | 1.20 screens |
| 1280 | 1.22 screens | 1.32 screens | 1.21 screens |
| 1440 | 1.22 screens | 1.32 screens | 1.21 screens |
| 1920 | 1.22 screens | 1.32 screens | 1.21 screens |

Measurements include site navigation and footer. These are the resting views with the teaching disclosure closed and the research record initially empty. Expanding explanations, revealing all investments, or adding research evidence intentionally reveals further content; those expanded states are not included in the resting-height figures.

Evidence is in `.agent-shots/studio-working-2026-09-15/`: `studio-working-report.json` and the corresponding `studio-goals-*` and `studio-research-*` images. Functional and capture coverage is in `e2e/studio-working-pages.spec.ts`, alongside the existing research-record, fund-return and buying tests.

The tested production preview runs at `http://localhost:3310`, from `tmp/studio-design-next/review`. The source changes remain uncommitted in the main checkout.
