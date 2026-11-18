# Portfolio integration review — 3 November 2026

## Decision

**Hold the direct merge into a publicly deployed main.** The local implementation is a substantial review candidate, but it does not currently isolate an internal preview from the normal Studio workflow. A preview label alone will not resolve the runtime and storage issues below.

Reviewed candidate: `97b6066` on `codex/portfolio-reconstruction`, against local main `be4609d06476e4eddde98728859ac1fb143e265b`. All 11 commits form a linear stack on that base; 281 files, 50,295 insertions and 2,579 deletions. Candidate checkout was clean. This is a source/integration review and a targeted execution of the host guard, not a fresh financial-model certification or full browser/visual audit. No merge, push or deployment performed. Remote branch/deployment settings were not inspected.

## Findings

### P1 — The public workflow is replaced while calculation is restricted to loopback

`app/(app)/studio/(workspace)/portfolio/page.tsx` renders `PortfolioJourney` unconditionally. The layout, navigation, Overview/Goals/Research/Valuation entry points and `next.config.js` redirects replace the ordinary tools. There is no environment switch retaining the existing public Portfolio.

`lib/portfolio/engine-boundary.ts:5` requires both an enabled environment flag and loopback URL/Host, with matching browser origin. `app/api/studio/portfolio/route.ts:8` returns 503 otherwise. `PortfolioJourney.tsx:58` calls that same-origin API. Setting the flag on a public preview is insufficient.

Reproduction: executed the actual transpiled guard with an isolated environment; enabled local accepted, enabled public rejected, enabled hosted preview rejected, local reconstructed URL with public Host rejected, disabled local rejected. Results: `tmp/portfolio-integration-review-2026-11-03/guard-results.json`.

Impact: a valid learner input can reach Compare and then fail because the deployed service is deliberately unavailable. Data gaps may block some learners earlier; filling them does not fix this runtime condition.

Required before public integration: either preserve the existing public workflow behind a complete feature boundary, or qualify a hosted calculation service before replacing it. The boundary must include page selection, old-link redirects, navigation and upstream entry points. Do not loosen the host guard as a deployment shortcut.

### P1 — The current engine package is a local development environment

`lib/portfolio/engine-server.ts:21` defaults to a private ignored `.venv` interpreter; the next line spawns a Python CLI from the checkout. `services/portfolio-engine/engine_api_cli.py` imports `engine_models`, which needs CVXPY, NumPy, SciPy, CLARABEL and reference/diagnostic modules. The lock pins the tested Windows development environment; the README explicitly leaves deployment qualification open.

The retained `.next/server/app/api/studio/portfolio/route.js.nft.json` contains 22 entries. It names the Windows `Scripts/python.exe`, schema and API CLI, but none of `engine_models.py`, `engine_diagnostics.py`, the reference package or native scientific dependencies. This is evidence about the saved local build, not a claim that a fresh remote build was inspected. A full checkout and installed private environment make local tests pass; that is different from a self-contained function package.

Required hosted design: define a reproducible runtime image/environment containing the complete Python application and native dependencies; choose its actual operating system and resource budget; make the web app call a bounded service adapter; preserve request validation and independent answer verification. Qualify startup, parallel requests, timeout/abort/process cleanup, queue limits, request/response size and failure handling on that target. The existing two-active/16-waiting limiter is per Node process, not a service-wide capacity policy. A dedicated Python service is a reasonable proposed architecture; it has not been selected or implemented by this review.

### P1 — Hiding Portfolio alone does not isolate the storage upgrade

`lib/use-studio-project.ts:36` creates and reloads the shared project session when the Studio workspace opens. `lib/studio-project/session.ts:100` persists a migrated project immediately, with the original archived transactionally. The candidate schema is v3 (`schema.ts:19`); main is v2. Main's reader deliberately refuses newer records.

Impact: a learner visiting Goals or Research can acquire a v3 saved project even if a feature flag hides Portfolio. Rolling the site back to current main then prevents that learner reopening the upgraded project. Original-byte archives and refusal to overwrite are useful protections, but they do not make the old site a functioning rollback reader.

Required preview isolation: use a separate preview origin with test data or explicitly imported backups. Browser storage will then be separate. Do not direct preview testers to the public production origin. If integration on the public origin is required, preserve v2 behavior until rollout or first implement a forward-compatible recovery/read path and test it against exact old/new saved projects. A navigation-only flag is insufficient.

### P2 — Initial screens do not clearly identify the unfinished preview

`PortfolioJourney.tsx:79` opens with ordinary Portfolio step navigation and instructions. Compare's initial calculation panel does not explain the local-service requirement; that message appears only after a failed request. Research qualifications occur later, including on saved results and chosen drafts.

Required for the isolated review preview: show its research status and incomplete inputs before learners enter facts; explain availability before offering Calculate; keep preservation/export of earlier decisions reachable. Suggested opening copy: “Portfolio research preview. Some investment data is incomplete. Calculations are available in the configured test environment.” Check final copy and page height at all six widths when implemented.

### P2 — Release documentation contains superseded status

The engine README still says it is not connected to the app, although the API and journey now connect it locally. The combined ledger/runbook has historical open Treasury future-path statements alongside the newer scheduled-payment implementation. Treasury evidence records 2 November verification, but the combined candidate ledger still identifies earlier containing commits.

Before integrating, update the candidate ledger to identify `97b6066` and distinguish implemented scheduled-date research paths from open actual-payment/settlement and production gates. Preserve old check results as history. Do not present the November browser run as a clean full-suite pass: it had 295 passed, five skipped and two failures; affected rerun passed 15/15 after the Treasury test correction and reader rerun.

## Combined stack and overlap

| Commit | Contribution reviewed at integration boundaries |
| --- | --- |
| `ef871f1` | Mathematical contracts, reference runtime and proof fixtures |
| `636c80a` | v3 records, automatic migration, recovery and storage |
| `0485e4e` | Offline research inputs and source qualification |
| `81cc2b6` | Input preparation, calculation engine and checked-answer transport |
| `d5b3522` | Replacement Portfolio journey and normal entry paths |
| `92183a2` | Goal checks, scenarios and future evaluation |
| `17e3177` | Buying quantities, operating reviews and exports |
| `1fa5103` | Integration, draft recovery and release evidence |
| `5d0f2d6` | Ordinary reviewed-input connection |
| `e7d5b9f` | Fund annual-return reconciliation and admission checks |
| `97b6066` | Treasury common-model preparation and maturity-aware paths |

Preserve the ordered stack; do not cherry-pick the earlier allocation-guidance prototype. Local main is still the common base, so committed history has no divergence here. That does not establish merge readiness against current remote main.

Primary main currently holds unrelated, uncommitted sharing/link-preview and daily-puzzle work. Its product paths do not directly overlap this Portfolio branch in the inspected diff (including lesson/course pages, global layout/header and sitemap). Existing untracked Portfolio planning/audit documents occupy paths the branch adds; compare their bytes before any checkout/integration. Preserve all existing edits and use an isolated integration checkout. Combined header/footer/layout effects and all browser tests need verification once both feature sets are combined; individual pass counts cannot be added.

The JavaScript dependency change adds exact `@noble/hashes` 2.4.0; its lock requires Node >=20.19.0. The repository does not pin the hosting Node version in package engines or a version file. Verify the actual selected build/runtime version. No inference about current hosting settings is made here.

`git diff --check` reports one trailing space in the retained Treasury source XML. Preserve raw source bytes/checksums; do not mechanically format this evidence file to silence the check.

## Concrete next work

1. Prepare an isolated internal preview on a separate origin, with a working configured calculation environment and explicit opening status. Decide whether to keep the web app and Python in one controlled host or use a separate Python service; the current function trace is not deployable evidence for either.
2. Implement and verify the chosen deployment adapter/package using synthetic and legacy fixtures, including exact saved-answer replay. Keep the host protection until a reviewed hosted boundary exists.
3. Exercise fresh and imported projects on the preview origin; prove the public origin remains v2 and unaffected. Verify safe forward recovery and document a rollback that remains able to open saved work.
4. Update candidate/runbook documentation; review the integrated patch and rerun affected and combined checks. Any new learner-facing notice/navigation requires screenshot review at six widths.
5. Separately close data coverage/rights, reviewed real assumptions and independent finance/source review before public use. AGG/SGOV reconciliation is one part: AAPL/TSM histories, adequate production inputs, exposure coverage, Treasury actual payment/settlement and runtime qualification also remain open. An issuer response alone cannot establish release readiness.

No full-suite rerun was needed for this source review: no product code changed. Prior tests are reported from the committed evidence and retain their original scope. Current review establishes the integration blockers above; it does not certify every algorithm or learner interaction in the 281-file change.
