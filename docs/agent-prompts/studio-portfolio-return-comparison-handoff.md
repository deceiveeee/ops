# Claude handoff: portfolio return and risk comparison

Prepared September 27, 2026. Read this as an implementation assignment when the user gives it to you. The repository observations below are a starting point to verify, not a substitute for inspecting the current tree.

## Outcome

Build a complete Studio feature that answers: **“How would these two saved allocations have behaved over the same historical months, and what explains the difference?”**

The learner chooses allocations and compatible return histories, sees the common period and assumptions, compares growth and historical variation, inspects a month, and saves a reproducible comparison with a reason. Saving the comparison leaves the chosen portfolio allocation unchanged. Connect it to the existing allocation and return-history workflows.

Carry the work through source review, implementation, independent numerical verification, browser tests, visual review, and updated documentation. A plan, a calculation utility, or a mockup alone does not complete this assignment. Resolve routine implementation choices yourself within this scope.

## 1. Establish the correct starting point

Read `AGENTS.md` and `CLAUDE.md` completely. This is the Studio research workspace, not a new Portfolio Builder mission. Apply the relevant source, learning, wording, accessibility, and visual gates without importing an unrelated lesson implementation phase.

Inspect the working tree, branch, worktrees, current main, relevant open PRs, and the actual diff before editing. Preserve existing work. Keep your build output, server port, and test process separate from another active checkout.

Known coordination issues to recheck:

- PRs #13 and #14 shipped the allocation comparison and phone-label improvements. PR #12 contained additional fixes: exactly-100% weights rejected by floating-point error; loss-scenario rows failing to explain the full total with more than three holdings; and saving an unchanged selected allocation as a duplicate. Determine whether these have since landed. Retain the unique fixes and the wrapping native selection controls when reconciling code. Do not replace a file with an older branch's version wholesale.
- At preparation time, `C:/Open Portfolio Studio` was on `feat/stress-scenarios`, with tracked and untracked work for several hypothetical loss scenarios. Its design note is `docs/design/studio-several-scenarios-2026-09-26.md`. Preserve that work and its schema fields. Check whether it is now committed or merged before choosing a base. Historical return comparison is a separate calculation from those scenarios.
- Use a suitable free checkout or isolate the work if another process owns the current one. Record the base commit and final tested commit, or identify the exact uncommitted tree. Never reset, clean, stash, force-push, or discard someone else's changes to obtain a clean start.

Follow the user's existing Git authorization and `CLAUDE.md`; this prompt alone supplies no new authorization to commit, push, merge, close PRs, or deploy. Finish the reviewable local implementation and verification before requesting any missing release authorization.

Inspect at least these existing implementations and records:

- `lib/studio-project/total-returns.ts`, its tests, `nport-returns.ts`, and `data/fund-total-returns.json`.
- `components/studio/workspace/ReturnHistoryWorkspace.tsx`, `PortfolioWeightsWorkspace.tsx`, `PortfolioNav.tsx`, `WorkspaceProvider.tsx`, and their styles.
- `lib/studio-project/portfolio-weights.ts`, `schema.ts`, `validate.ts`, `storage.ts`, `operations.ts`, and the workspace/session mutation and backup paths.
- `lib/studio.ts`, `lib/portfolio-theory.ts`, and any current scenario/limit changes. The old three-by-three inverse is not a general portfolio engine.
- `docs/source-audits/studio-total-returns-and-valuation-workspace.md`, `studio-portfolio-weights.md`, and relevant portions of `studio-quantitative-methods.md`.
- `docs/design/studio-valuation-and-portfolio-weights-2026-09-20.md` and the F4/F7-F9, M6-M7 portions of `docs/agent-prompts/studio-research-workspace-handoff.md`. These describe a broader roadmap; this assignment implements the historical comparison slice only.
- `package.json`, `playwright.config.ts`, existing return-history/allocation browser tests, `.agents/skills/visual-audit/SKILL.md`, and `agent/rubrics/visual-quality.md`.

## 2. Keep the first release bounded

Implement historical comparisons of two saved, long-only, unlevered target allocations. Include cash and every investment with a positive target weight in either allocation. Support the actual number of holdings allowed by the project, with bounded input sizes and useful pagination.

Reuse the existing public exact-share-class fund monthly total returns and validated local imports. At preparation time, the bundled histories covered VTI, VOO, and VXUS on a USD net-asset-value basis; local imports store their currency, basis, source, and observations. Verify the current bundle rather than hard-code that inventory.

Deliver these results for one common period:

1. Two growth-of-100 paths and their compounded returns over that period.
2. Monthly volatility, introduced as the standard deviation of monthly returns: how much those monthly returns varied around their average.
3. Largest observed fall from an earlier month-end peak, with the peak and trough dates. Explain that monthly observations miss losses within a month.
4. A month inspector showing how each allocation's investment and cash contributions produce that month's total return.
5. A saved comparison that can be reopened with its original data, method, weights, and explanation.

Keep expected-return forecasts, valuation-to-return assumptions, automatic weight selection, optimization, efficient frontiers, annualized metrics, risk-contribution models, Monte Carlo, new commercial/live data feeds, currency conversion, and individual-bond return modeling outside this release. They require separate specifications. Do not label the historical winner “best,” recommend an allocation, or turn a valuation price gap into a return forecast.

## 3. Audit the method before building the results UI

Create `docs/source-audits/studio-portfolio-return-comparison.md`. Record each source's title, edition/date where available, canonical URL, exact sections read, and retrieval date. Map each financial definition, formula, example, and interpretation to its supporting source or explicitly identified OPS modeling choice. Independently verify the calculations below.

Starting primary references:

- [NIST/SEMATECH e-Handbook, section 6.5.4.1: Mean Vector and Covariance Matrix](https://www.itl.nist.gov/div898/handbook/pmc/section5/pmc541.htm), for sample covariance using the `n - 1` denominator. This section was opened while preparing the prompt; it does not validate OPS's implementation.
- [CFA Institute, GIPS Standards Handbook for Firms](https://www.gipsstandards.org/standards/gips-standards-for-firms/gips-standards-handbook-for-firms/), the relevant calculation-methodology discussion of geometric linking, including Provision 2.A.24. Review the actual text and formulas. This is supporting methodology, not a claim that an OPS hypothetical comparison is GIPS-compliant.
- The existing SEC N-PORT/N-1A audit for the bundled monthly returns and their distribution treatment. Inspect the current data and source metadata before relying on prior audit claims.

Add appropriate primary support for any further financial interpretation. If you adapt a course session, follow the repository's full edition, deck, and transcript requirements. Do not invent a course attribution for this original OPS workspace tool. Clearly distinguish source-supported mathematics from choices such as monthly rebalancing, zero cash interest, supported data bases, and minimum sample size.

### Data eligibility and alignment

- Match histories to the actual instrument/listing/share class. Retain the public filing/source metadata and imported source identity. A matching ticker alone is insufficient to substitute a different listing or share class.
- Use decimal monthly total returns internally. Preserve the existing strict CSV contracts and validation: distributions and splits included, consecutive unique months, finite values, and returns greater than -100%. The existing restriction on total loss remains a disclosed input limitation; changing it is a separate model decision.
- If several histories are eligible for an investment, let the learner explicitly choose. Do not silently prefer the newest import or splice histories/providers to extend coverage.
- Build a single aligned monthly matrix for the union of positively weighted investments across both allocations. Trim only the outer dates to the common contiguous overlap; show the actual start, end, sample count, and excluded outer months. A date-range change affects both allocations together.
- Never forward-fill, interpolate, fill a missing return with zero, drop a held investment, replace it with a proxy, or renormalize the supported subset. Do not estimate different pairs on different months. Show the exact missing/incompatible investment and a useful route to import or change the selected history.
- For this first release, require the same return currency and valuation basis across non-cash histories, compatible with the portfolio's money unit. Preserve the existing USD convention if that is still the only supported portfolio currency. A USD listing does not remove its underlying foreign exposure. Explain mixed NAV/market-price or currency failures; do not create implicit conversions.
- Require at least two common months for a full comparison, because sample covariance needs two observations. This is a mathematical minimum, not evidence of a reliable long-term risk estimate. Keep period and sample count beside the results and explain limited historical coverage. One month may be inspected as a history but cannot produce a completed risk comparison.
- A positively weighted individual bond remains unsupported in this release. Explain why and preserve the allocation. A zero-weight position in both allocations requires no return history. When one allocation is entirely cash, use the other allocation's common months. If both are entirely cash, require an explicit period instead of inventing market coverage.

### Portfolio and calculation conventions

Use current target weights, including reserved and unassigned cash, as a hypothetical allocation reset at the start of each month. State this visibly as “rebalanced monthly,” with an explanation of the reset. These are today's chosen weights replayed against past observations, not the learner's actual account performance or evidence of an investable historical strategy.

Use no external contributions or withdrawals, trading costs, personal taxes, or inflation adjustment in this comparison. Fund expenses/distributions already incorporated by the source stay incorporated once. Explain that monthly rebalancing can incur costs excluded here. Do not reuse the hypothetical cash shock from Risk and cost as a cash return.

Cash earns an explicitly stated assumed 0% per month in this first version. That assumption applies consistently to reserved and unassigned cash. Present cash as part of the portfolio and preserve its effect on the denominator; do not imply zero inflation risk or a promised bank rate.

For budget `B > 0`, reserve `C` with `0 <= C <= B`, and saved after-reserve percentage `p_i`:

```text
whole-portfolio weight w_i = ((B - C) / B) * (p_i / 100)
cash weight w_cash = 1 - sum(w_i)
monthly portfolio return r_p,t = sum(w_i * r_i,t) + w_cash * 0
growth G_0 = 100; G_t = G_(t-1) * (1 + r_p,t)
period return = G_n / 100 - 1
mean monthly return = sum(r_p,t) / n
sample covariance S_ij = sum((r_i,t - mean_i) * (r_j,t - mean_j)) / (n - 1)
monthly portfolio variance = w^T S w
monthly volatility = sqrt(monthly portfolio variance)
running peak P_t = max(G_0, ..., G_t)
month-end fall D_t = 1 - G_t / P_t
largest observed fall = max(D_t)
```

Include the initial 100 in the peak calculation and identify its date as the boundary before the first return month. Specify deterministic treatment of equal peaks/troughs and the no-decline case. A first-month loss must appear in drawdown.

Use the same rounded-weight validity convention as the allocation engine so exact-100% inputs behave consistently. Reject meaningful overweight, negative weights, nonfinite values, invalid budgets/reserves, and unsafe numerical outputs. Define scale-aware floating-point tolerances; clamp only demonstrable rounding noise, not substantive negative variance or invalid data.

Compute the covariance matrix for arbitrary supported holding counts. Verify that `w^T S w` agrees with the independently calculated sample variance of the portfolio's monthly return series. No matrix inverse is needed. Constant or collinear histories are valid for this calculation; a singular matrix alone is not an error. If you expose correlations in calculation details, a constant series has undefined correlation, not zero or one.

Do not average holding volatilities to obtain portfolio volatility, sum monthly percentage returns to obtain cumulative return, or average each holding's whole-period compounded return to represent a monthly-rebalanced portfolio. Keep calculation precision through the model and round only the displayed results.

## 4. Design the learner's work, then implement it

Extend the existing Return history area, with a direct entry from Compare allocations that carries the relevant allocation identifiers. Preserve history inspection and importing. Use a stable URL/state pattern consistent with the workspace; do not add another top-level Studio destination or a second import system.

Use focused views such as **Choose data**, **Compare**, **Inspect a month**, and **Saved comparisons**. Adapt the exact labels to the established navigation, keeping one name per concept. The comparison's dominant visual should be the two growth paths on the same scale. Use direct labels and a keyboard-operable month selector; explain the selected month's gain/loss with signed contribution rows. A hidden group of holdings must have an “Other holdings” aggregate, so visible rows plus cash equal the displayed monthly total. Provide a way to inspect the members without forcing a long page.

Place the allocation names, common dates, sample count, monthly-rebalancing rule, and cash assumption within easy reach of the chart. Define volatility and drawdown before the learner must interpret them, using a short worked example and reachable calculation details. Explain that historical volatility describes variation, and historical drawdown describes an observed decline; neither bounds future losses or certifies that goals/limits will be met.

Support these states deliberately: fresh/empty portfolio; choosing histories; usable public fund histories; missing or incompatible data; no overlap; insufficient months; complete comparison; month inspection; save pending/failure; reopened saved comparison; and changed inputs requiring review. Preserve the learner's selections and unfinished reason across navigation/reload using established draft patterns. Save and navigation races must not mix two projects or allocations.

Retain Studio's current light workspace, Inter UI/numbers, Fraunces display type, wrapping selection labels, visible focus, and normal keyboard behavior. Use semantic controls, readable chart labels, text alternatives for results, and restrained/reduced motion. No decorative controls or new heavy charting library unless the existing SVG/CSS tools demonstrably cannot handle the need.

A focused view must fit the screen budget. Measure full page height, including shared chrome, at 390, 768, 1024, 1280, 1440, and 1920 pixels wide with a 900-pixel viewport. Target at most 1.5 screens for each primary state at every required width, with the first control within half a screen. Put source/calculation details behind accessible views or disclosures. Do not meet the budget by clipping text, hiding failures, shrinking everything, or making the work area a cramped nested scroller. Treat existing shared-shell violations as documented baseline defects; do not claim the new view passes because the excess is outside its component.

## 5. Save evidence that can actually be reproduced

Introduce a bounded, validated comparison record using the repository's migration and storage conventions. Preserve older projects and backups, including any newly added stress-scenario fields. Do not raise existing storage limits casually; inspect `MAX_PROJECT_BYTES` and handle full storage without losing work.

Each saved comparison must retain:

- Its identity, date, name, learner reason, and method version.
- Both allocation identities and snapshots of their relevant positions, weights, budget/reserve, and cash convention.
- The chosen source histories and exact aligned observations, currency, basis, date range, sample count, and source/release metadata needed to reproduce the result. Imported observations must remain local.
- Calculation settings and results. Revalidate inputs and recompute/verify derived values when reading untrusted backups; a pasted result number is not authoritative.

Use immutable snapshots or immutable referenced records that survive deletion and export. Ordinary mutable IDs pointing to today's histories are insufficient. Reopening a result must reproduce the earlier calculation after a history import, public data update, allocation edit, or source deletion. Show which inputs changed and provide an explicit action to create a new comparison. Never silently refresh a saved result or change the selected allocation.

Classify dependencies precisely: a weight, reserve, return observation, basis, or method change affects this comparison; a renamed note or an unrelated hypothetical stress scenario does not change its historical numbers. Backup round trips, project duplication, practice/personal switching, concurrent save conflicts, and position/history removal must preserve the intended evidence and isolation.

## 6. Prove the numbers and behavior

Start with independent reference cases. The following is an original, synthetic OPS test fixture, not market data or a sufficiency claim:

| Month | Investment A | Investment B |
| --- | ---: | ---: |
| 1 | +10% | 0% |
| 2 | -10% | +4% |
| 3 | +5% | -2% |

Budget 100,000; reserve 20,000; after-reserve targets 50% A and 50% B. Whole-portfolio weights are 40% A, 40% B, 20% cash. Monthly portfolio returns are +4%, -2.4%, +1.2%. Growth of 100 ends at **102.722048**, a **2.722048%** period return. The largest month-end fall is **2.4%**. Monthly sample variance is **0.0010293333333333333** in decimal-return-squared units; monthly standard deviation is approximately **3.2083225108042575%**. Sample covariance of A and B is **-0.002666666666666667**.

These reference values were checked with a separate PowerShell calculation while preparing the prompt. Independently verify them again; do not obtain expected test values by calling the production function. The mean monthly return, approximately 0.933333%, is neither the compounded period return nor a forecast.

Meaningful unit/property coverage must include:

- The fixture above; +10% then -10% compounding to -1%; and a first-month decline establishing the correct drawdown from the initial value.
- Covariance/portfolio-series variance agreement; symmetric covariance; invariance to holding order; identical, offsetting, constant, and collinear series; more than three investments; and finite behavior near numerical limits.
- Whole-portfolio versus after-reserve weights; extra unassigned cash; one/both allocations entirely cash; exact-100% floating-point cases; and invalid allocations that never render plausible zero results.
- Differing outer dates, empty overlap, a missing internal month, duplicates/out-of-order dates, one month, currency/basis/listing mismatches, multiple eligible imports, and a holding present only in the second allocation. Both sides always use the same dates and method.
- Saving/reopening exact evidence, data/allocation changes, removal, malformed/tampered backups, older backups, deep-copy behavior, storage failures, and project/mode isolation.

Browser coverage must complete a fresh-user journey with actual UI actions: choose two allocations; inspect coverage; fix a missing-history problem through the existing importer; compare; inspect a month and add up its visible contributions; save a reason; reload; reopen; change an input; and verify the old result remains intact while a new run reflects the change. Verify that this flow never changes `selectedAlternativeId`. Cover keyboard operation, long allocation/source names, four or more holdings, blocked states, and save failure recovery.

Use fixtures for deterministic numerical/browser tests, clearly labeled as synthetic. Also exercise the currently bundled public fund histories through the actual UI. Distinguish this from a live upstream fetch; do not claim that fixture tests prove network access or freshness. No new live data integration is required.

Run the repository's current typecheck, full unit suite, lint, and full production-build browser suite. At preparation time, `npm run test:e2e` itself ran the production build/server when `E2E_DEV_SERVER` was not enabled; verify the current configuration, use an unused port, and do not attach to another checkout's server. Run the dedicated storage checks when the changed persistence paths require them. Report exact results and justified skips without weakening assertions or treating old test counts as current evidence.

Capture the important populated, blocked, long-label, month-detail, and saved/stale states at all six widths. Read the images, including phone and desktop captures of every major state and intermediate-width captures. Record page heights in screens, horizontal overflow, console errors, keyboard/focus results, and ranked visual defects. Automated height assertions alone are not a visual review. Repair defects, rerun affected checks, and finish the full suite on the final tree after any functional/copy changes.

## 7. Deliver a reviewable result

Keep the scope focused and record substantive choices in `docs/design/studio-portfolio-return-comparison.md`. Finish the source audit with actual numerical and release evidence, including a separate fresh-learner walkthrough and terminology review. Preserve historical documentation; append dated corrections rather than rewriting earlier test results as though they tested this version.

Your final response must state what a learner can now do, where to open it, the base/final Git state, the financial conventions and coverage limits, test/build results, six-width measurements, and any remaining defects. Link the implementation and audit/design records and include representative screenshots. An agent walkthrough must not be described as real learner testing.

Completion means the feature works end to end, its saved result is reproducible, every positively weighted investment is accounted for, both allocations use the same months and assumptions, independent calculations agree, and functional, storage, learning, accessibility, and visual gates have evidence. If a necessary gate remains blocked, state the exact blocker and complete the unaffected work; do not label the feature finished.
