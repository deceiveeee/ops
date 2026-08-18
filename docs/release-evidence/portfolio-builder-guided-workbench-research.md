# Release evidence: Portfolio Builder practical-tools and guided-Workbench research

**Date:** 2026-08-12

**Status:** curriculum and Workbench design approved 2026-08-12; source and design research
complete. This historical research record does not track later mission implementation;
consult each mission's release-evidence ledger.

**Release decision:** no new mission is cleared for learner release by this record

## Scope completed

- Reviewed Damodaran's official course project, syllabus, portfolio-management process,
  DCF checklist, trading notes, spreadsheet directory, and four practical workbooks.
- Reconciled those tools with the locked 38-session corpus and mapped one practical
  component to every proposed mission.
- Reviewed current official investor tools for readiness, emergency savings, risk
  tolerance, allocation, rebalancing, concentration, fund disclosure, fund holdings,
  brokerage accounts, order types, taxes, and IPS construction.
- Designed one versioned Portfolio Workbench that accumulates decisions across all 13
  missions and compiles into a Portfolio Dossier and IPS.
- Defined equal personal and practice-case paths, controlled portfolio state transitions,
  a transfer-case capstone, critical-failure overrides, accessibility requirements, and a
  legacy-progress migration contract.

## Controlling records

- Practical source and limitation audit:
  `docs/source-audits/portfolio-builder-practical-tools.md`
- Guided interaction and graduation specification:
  `docs/lesson-plans/portfolio-builder-guided-workbench.md`
- Proposed curriculum, updated to reference both:
  `docs/lesson-plans/portfolio-builder-mission-curriculum.md`
- Supplemental source manifest:
  `scripts/source/supplemental-manifest.json`

The older `docs/release-evidence/portfolio-builder-phase-a.md` is explicitly marked
superseded because its 10-mission counts no longer describe the course.

## Research conclusions that affect implementation

1. Damodaran supplies the analytical engine, not the complete retail implementation
   chassis.
2. A learner builds one portfolio throughout the course, but Missions 6–7 create only a
   research watchlist. A product cannot become a proposed holding before friction,
   evidence, and architecture gates pass.
3. Exact products enter in Mission 12, followed by an order rehearsal that never submits a
   transaction. Mission 13 operates and stress-tests the completed policy.
4. Learners who cannot or should not deploy money still complete the full course in a
   practice case and graduate with a paper portfolio plus deployment action plan.
5. No universal SEC or FINRA personal position-size cap was found. OPS must derive a
   candidate ceiling from an explicit loss budget and label it as an OPS/learner policy.
   Investment-company and RIC diversification tests must not be used as personal rules.
6. Vanguard's *Rebalancing Edge* is provider-scale target-date-fund evidence, not a DIY
   threshold. Investor.gov's three action methods and a learner-selected, cost-aware policy
   control the beginner workflow.
7. Course completion requires both the learner's Dossier and an unfamiliar transfer case.
   Critical safety errors override a passing numerical score.

## Supplemental-source pipeline results

New canonical records successfully fetched, extracted, hashed, and given provenance on
2026-08-12:

- `investor-preparedness`
- `cfpb-emergency-fund`
- `investor-risk-tolerance`
- `investor-allocation-rebalancing`
- `sec-order-types`
- `sec-brokerage-accounts`

The complete official FINRA concentration-risk page, SEC Form N-1A PDF, and SEC N-PORT data
page were reviewed in the browser, but direct local fetch returned HTTP 403. They are
recorded under `inaccessible`, not under the locked `sources` list. They may guide design
but are not lesson-citable until canonical local provenance succeeds. The already locked
EDGAR endpoint remains the controlling path for exact current fund filings.

## Existing code metadata changed

`data/courses/portfolioBuilder.ts` now states the narrower learner promise and records the
known source/design gates on Missions 5 and 10–13. The mission count, route slugs, existing
completion mappings, and target minutes did not change. Mission artifacts remain one-to-one
checkpoints for compatibility; the proposed Workbench will compose them after approval.

No new journey, screen, live-data connection, trading integration, or saved-state migration
was implemented in this research pass.

## Verification record

- supplemental manifest JSON parse: passed; 18 locked sources, one endpoint, six
  inaccessible records, one open source gap, and one explicit design boundary.
- `node scripts/source/fetch-supplemental.mjs --check`: 19/19 locked source and endpoint
  URLs reachable on 2026-08-12.
- full supplemental cache rebuild with the bundled PDF extractor: 18/19 usable; the one
  exception is the intentional `downloaded-not-extracted` legacy Damodaran `.xls`, which is
  hashed and carries an explicit limitation. All six newly locked HTML sources have status
  `ok`, extracted text, hashes, and provenance.
- `npm.cmd test -- data/courses/portfolioBuilder.test.ts`: one file, eight tests passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd test`: 17 files, 108 tests passed.
- scoped `git diff --check`: passed; only normal LF/CRLF conversion notices were emitted.

Browser, responsive, keyboard, screen-reader, reduced-motion, theme, and visual QA are not
claimed. The new Workbench is a design specification, not a rendered learner interface.

## Open gates

Historical-status note (2026-08-12): the Mission 5 Gate A/B items, Workbench schema,
local-storage privacy boundary, migration, dependency invalidation, and rendered QA listed
below were subsequently addressed in the Mission 5 source audit, lesson plan, implementation
note, tests, and `docs/release-evidence/mission-05-allocation.md`. The list is preserved as
the research-phase handoff; it is not the current Mission 5 release decision.

- Mission 5 Gate A/B records for readiness, allocation, loss-budget sizing, and concentration
  feedback. **Closed subsequently; see the Mission 5 release record.**
- Mission 10's canonical current manager-persistence evidence.
- Session 32 narration boundary for Mission 11.
- Mission 12 claim-level EDGAR/prospectus/holdings matrix and product-identity assessment.
- Mission 13 current tax/account claim matrix and transfer-case validation.
- Workbench schema, local-storage privacy design, legacy migration, dependency invalidation,
  and automated tests. **Closed for the Mission 5 v1 scope.**
- Complete learner-sequence and browser QA after implementation. **Closed for Mission 5;
  later missions retain their own gates.**
