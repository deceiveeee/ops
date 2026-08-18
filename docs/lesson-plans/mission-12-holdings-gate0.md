# Mission 12 — holdings: Gate 0 orientation

**Phase prompt:** `docs/agent-prompts/portfolio-builder/07-mission-12-holdings.md`
**Status:** superseded by Gate A, completed 2026-08-16. The slate below is locked and every
product is now verified against its own filing — see `docs/source-audits/mission-12-holdings.md`
and `docs/release-evidence/mission-12-holdings.md`. This file is kept as the orientation record.

## Task and non-goals

Convert licensed policy sleeves into a **verified product slate**, an **overlap X-ray**, and a
**non-executing order rehearsal**. This is the first mission in which an exact legal security
enters the learner's proposed portfolio.

Non-goals, from the phase prompt: no order is ever transmitted, no brokerage connection, no
credentials, no brokerage-confirmation mimicry, no personal tax calculation, no
recommendation list. The learner moves from *policy role → evidence → product*, never from a
list of suggested funds to a purchase.

The mission teaches **how to verify a product against its filing**. It does not teach which
fund to own. That distinction is what keeps this educational rather than advisory, and it has
to hold in the UI, not just in a disclaimer.

## Source inventory

| Requirement | State |
| --- | --- |
| Damodaran Session 37 (source-era product framework) | **Cached** — slides, quiz, captions |
| SEC / Investor.gov fund and ETF guidance | **Cached** — `sec-funds-and-etfs.txt` |
| SEC brokerage account guidance | **Cached** — `sec-brokerage-accounts.txt` |
| SEC order types | **Cached** — `sec-order-types.txt` |
| **Exact EDGAR prospectus and N-PORT records per model product** | **Not cached — blocking** |

Everything except the last row is already local. The last row is the whole schedule risk: it
needs live retrieval per product, and the phase prompt is explicit that an inaccessible
Form N-1A/N-PORT overview page may **not** be treated as canonically locked, that quarterly
N-PORT is not live holdings, and that ticker text alone is never identity.

## Why this cannot proceed on an invented slate

The phase prompt requires a real legal product record — legal name, CIK, share class,
structure, objective and tracked index, replication, principal risks, fee table, turnover,
benchmark period, tracking behaviour, holdings source and as-of date, spread and
premium/discount, securities lending or derivatives where material, and material changes —
and stops `Blocked - source` if any of that cannot be verified.

An illustrative slate would defeat the mission: the skill being taught is reading a real
filing, and the near-identical-wrong-share-class trap the prompt requires only exists because
real products have share classes.

## Product slate — locked 2026-08-16

Approved by the human after a proposal-and-approval round. Chosen for verification and
overlap teaching value, explicitly **not** as investment selections, and deliberately spread
across two sponsors so the lesson reads as examples of a category rather than one firm's
product line.

| # | Sleeve | Product | Teaches |
| --- | --- | --- | --- |
| 1 | growth | Vanguard Total Stock Market ETF (VTI) | Identity — a ticker is not a legal product. The baseline passport. |
| 2 | growth | Vanguard S&P 500 ETF (VOO) | **The overlap lesson.** Paired with VTI the look-through shows most of the second fund inside the first. |
| 3 | stability | iShares Core US Aggregate Bond ETF (AGG) | Sampling versus full replication, tracking difference, and a clean negative overlap result. |
| 4 | liquidity | iShares 0–3 Month Treasury Bond ETF (SGOV) | "Cash" is a security with a filing, a fee, a spread and a duration. |
| trap | — | VTSAX, the mutual-fund sibling of VTI | Share class is not ticker: same index, different structure, minimum and fee. |

No figure for any product is asserted until it is read from that product's own filing. Nothing
in this table is a recommendation, and the lesson attaches products to sleeves the learner
already licensed rather than presenting a list to choose from.

## Superseded decision required before Gate A

Two choices change the work materially and are not mine to make. Recorded here so the answer
travels with the mission.

1. **Who chooses the model products** — a fixed slate the human names, or candidates proposed
   here for approval before any is written into a lesson.
2. **How many** — the overlap X-ray needs at least two funds with genuine issuer overlap to
   teach anything, so the practical floor is roughly three to four products across the
   sleeves Mission 10 licenses.

## Dirty-worktree overlap

Mission 11 touched `lib/if-progress.ts`, `data/courses/portfolioBuilder.ts`,
`data/lessons/lessons.ts`, `data/courses/courses.ts`, `lib/lessonRegistry.ts`,
`e2e/lesson-typography.spec.ts` and the IF shared/rail files. Mission 12 will touch the same
spine. One owner at a time — Mission 11 is finished and reviewed, so the spine is free.

## Verification planned

Same ladder as Mission 11: unit tests for the overlap arithmetic and any identity checks
before UI; typecheck, lint, full unit suite; the lesson added to the typography gate's walked
list; capture at all six widths; visual read at 390 and 1440.
