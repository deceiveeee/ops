# Mission 12 — holdings: release evidence

**Retrieval date for every snapshot below: 2026-08-16.**
Source audit and claim-level coverage: `docs/source-audits/mission-12-holdings.md`.

No cached source artifact is committed. Each row names the exact filing, so any figure in the
mission can be re-fetched and re-checked from EDGAR alone.

## Access pattern used

Requests declare a User-Agent with a contact address, per SEC fair-access policy.
`www.sec.gov/cgi-bin/browse-edgar` is **not usable** — it returns 403 and then "File
Unavailable" even with a declared User-Agent, and is never cited. Everything below came from
`data.sec.gov`, `www.sec.gov/files`, `www.sec.gov/Archives` or `efts.sec.gov`.

## Identity snapshots

Ticker → identity resolved from `https://www.sec.gov/files/company_tickers_mf.json`; series and
class names confirmed against each filing's SGML header
(`…/{accession}-index-headers.html`).

| Product | Registrant | CIK | Series ID | Series legal name | Class ID | Class name |
| --- | --- | --- | --- | --- | --- | --- |
| VTI | Vanguard Index Funds | 0000036405 | S000002848 | Vanguard Total Stock Market Index Fund | C000007808 | ETF Shares |
| VOO | Vanguard Index Funds | 0000036405 | S000002839 | Vanguard 500 Index Fund | C000092055 | ETF Shares |
| AGG | iShares Trust | 0001100663 | S000004362 | iShares Core U.S. Aggregate Bond ETF | C000012092 | — (single class) |
| SGOV | iShares Trust | 0001100663 | S000068768 | iShares 0-3 Month Treasury Bond ETF | C000219740 | — (single class) |

Share-class trap evidence — read from the SGML header of `0000036405-26-000181` (485BPOS,
filed 2026-04-28). VTI and VTSAX are **the same series**, S000002848:

| Class ID | Class name | Ticker |
| --- | --- | --- |
| C000007805 | Investor Shares | VTSMX |
| C000007806 | Admiral Shares | VTSAX |
| C000007807 | Institutional Shares | VITSX |
| C000007808 | ETF Shares | **VTI** |
| C000155407 | Institutional Plus Shares | VSMPX |
| C000170276 | Institutional Select Shares | VSTSX |

Series S000002839 carries the same relationship for VOO/VFIAX: C000007773 (VFINX), C000007774
(VFIAX), C000092055 (**VOO**), C000170274 (VFFSX).

## Prospectus snapshots

All four are Form 497K summary prospectuses. Each header was confirmed to cover exactly the
series and class in the slate before any figure was taken from it.

| Product | Accession | Document | Filed | Effective | Prospectus date |
| --- | --- | --- | --- | --- | --- |
| VTI | `0000036405-26-000197` | `f44849d1.htm` | 2026-04-28 | 2026-04-28 | April 28, 2026 |
| VOO | `0000036405-26-000183` | `f44783d1.htm` | 2026-04-28 | 2026-04-28 | April 28, 2026 |
| AGG | `0001193125-26-287958` | `d128878d497k.htm` | 2026-06-29 | 2026-06-29 | June 29, 2026 |
| SGOV | `0001193125-26-287938` | `d126195d497k.htm` | 2026-06-29 | 2026-06-29 | June 29, 2026 |
| **VTSAX** (trap, not a slate product) | `0000036405-26-000214` | `f44873d1.htm` | 2026-04-28 | 2026-04-28 | April 28, 2026 |

Statutory prospectus and SAI of the same date are incorporated by reference into each.

**Trap evidence.** VTSAX (class C000007806) and VTI (class C000007808) are the same series,
S000002848 — same objective wording, same CRSP US Total Market Index, same sampling
replication, same 3% turnover. They differ only in access terms: total annual operating
expenses 0.04% vs 0.03%, ten-year cost per $10,000 of $51 vs $39, a $25 annual account service
fee below $5,000,000 that the ETF class does not carry, and a $3,000 minimum to open against
none.

## Holdings snapshots

All four are Form NPORT-P. **`repPdDate` is the holdings as-of date; `repPdEnd` is the fiscal
year end and must never be shown as the holdings date.**

| Product | Accession | Filed | Holdings as-of | `repPdEnd` | Positions | Net assets | Staleness |
| --- | --- | --- | --- | --- | ---: | ---: | ---: |
| VTI | `0000036405-26-000323` | 2026-05-28 | **2026-03-31** | 2026-12-31 | 3,524 | $1,991,691,212,321.29 | 138 days |
| VOO | `0000036405-26-000325` | 2026-05-28 | **2026-03-31** | 2026-12-31 | 519 | $1,421,263,311,402.89 | 138 days |
| AGG | `0001410368-26-075254` | 2026-07-24 | **2026-05-31** | 2027-02-28 | 13,269 | $136,455,697,043.74 | 77 days |
| SGOV | `0002071691-26-016719` | 2026-07-24 | **2026-05-31** | 2027-02-28 | 24 | $91,903,313,184.45 | 77 days |

Coverage caveats that must be visible wherever these holdings are used:

- Reported position weights sum to 100.25% (VTI), 100.14% (VOO), 101.88% (AGG) and 108.82%
  (SGOV). None is 100%. Do not normalise silently.
- **The two sponsors are on different fiscal calendars.** No overlap figure spanning a
  Vanguard product and an iShares product can be computed from a single as-of date.
- Quarterly N-PORT is not live holdings, and at 138 days VTI's snapshot is nearly five months
  old at retrieval.

## Overlap results

**The aggregation key changes the answer, so both are reported.**

| Pair | By instrument (CUSIP) | By issuer (LEI) | As-of dates |
| --- | ---: | ---: | --- |
| VOO inside VTI | **99.88%** of VOO's reported weight; 2 positions not found | 100.01% across 501 issuers | Both 2026-03-31 — aligned |
| SGOV inside AGG | 0.94% across 2 positions | **107.88% across 1 issuer** | Both 2026-05-31 — aligned |
| AGG inside VTI | 0.00% across 0 positions | **14.94% across 469 issuers** | 2026-05-31 vs 2026-03-31 — **not aligned** |

VOO's two non-VTI positions: NXP Semiconductors NV (N6596X109, 0.0886%) and Amcor PLC
(G0250X107, 0.0328%).

**Correction to this document's first reading.** AGG-inside-VTI was recorded as a clean zero.
That holds only at the instrument level. Keyed on issuer it is **14.94%**, and the match is
genuine — the matched AGG positions are 14.93% corporate debt (asset category DBT), led by
JPMorgan Chase, Bank of America, Morgan Stanley, Goldman Sachs, Wells Fargo, Oracle, Citigroup,
AT&T, Verizon and Amazon, every one an issuer whose equity VTI also holds. The learner-facing
statement is not "stocks and bonds do not overlap" but "your stability sleeve lends money to the
same companies your growth sleeve owns".

The SGOV-inside-AGG pair was also described here as two Treasury obligations. It is not: both
are **BlackRock Funds III**, CUSIP 066922477 — the funds' cash management, not their mandate.
That single CUSIP is filed under three different names and two different LEIs across the two
funds, with one row carrying no LEI at all. Neither key is universally correct: CUSIP finds this
overlap and misses the Treasury one, LEI does the reverse. The implementation keys on LEI, falls
back to CUSIP, and surfaces the conflict rather than silently picking a winner.

LEI coverage — the disclosed unknown share, measured rather than assumed: VTI 3.34% of net
assets across 1,031 positions, VOO 1.60% across 29, AGG 5.67% across 686, SGOV 0.00%.

## Findings recorded against the required product record

| Field of the required record | Evidence state |
| --- | --- |
| Legal name, ticker, share class, CIK, structure | Complete for all four, from filing headers |
| Objective and tracked index | Complete for all four |
| Full vs sampled replication | Complete — VOO full; VTI, AGG, SGOV sampled |
| Principal risks | Complete — 9 / 9 / 24 / 15 named risks |
| Fee table and documented costs | Complete for all four |
| Turnover | Filed for all four. **SGOV's 0% is a formula artifact**, verified against Form N-1A Item 3 instruction (d)(ii): securities with maturities of one year or less at acquisition are excluded from both numerator and denominator. Ships with a "not comparable across mandates" flag *and* an explanation |
| Benchmark/performance period with date | Complete — all periods ended 2025-12-31 |
| Tracking behaviour and limitations | Computed from filed returns, labelled as computed. **SGOV exceeds its own index in every period shown**; cause not established and not asserted |
| Holdings source, coverage, as-of date | Complete for all four, with weight-sum and staleness caveats above |
| Securities lending | AGG and SGOV permit up to one-third of total assets; **all four report zero positions on loan** in these snapshots. Permission and practice recorded separately |
| Derivatives | AGG describes regular TBA use and up to 10% in futures/options/swaps; no position in the parsed snapshots carried a `derivativeInfo` block |
| Leverage / inverse / margin | None described in any of the four filings — recorded as a negative finding |
| ETF spread and premium/discount | **Qualitative only.** No filing carries figures; see O1 in the source audit |
| Material changes | **Complete for all four (O2 closed 2026-08-17).** Each current prospectus compared field by field against the prior year: VTI management fee 0.02%→0.03% with other expenses 0.01%→0.00% and the total unchanged, turnover 2%→3%; VOO nothing substantive; AGG turnover 81%→62% and the acquired-fund-fee waiver extended to 2027-06-30; SGOV as already recorded. Prior-year sources `0001683863-25-004087`, `0001683863-25-004106`, `0001193125-25-151199` |
| Policy sleeve and reason for fit | Assigned at Gate 0; not an EDGAR matter |
| Source snapshots and retrieved dates | This document |

## Damodaran Session 37 — source lock

Reviewed 2026-08-16 at claim level; 14 claims verified, 3 defects recorded. Cached 2026-08-13;
artifacts are not committed. Provenance: `.source-cache/provenance/session37.json`.

| Artifact | Canonical URL | Bytes | SHA-256 | Extent |
| --- | --- | ---: | --- | --- |
| Slides | `pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session37.pdf` | 595,463 | `b6a0df1f…c906dfcc` | 10 pp |
| Quiz | `pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz37.pdf` | 66,776 | `aab22bf8…106c6cf0` | 3 pp |
| Captions | video `eQbZlbmbIJs` | 140,628 | `057d6d76…0d486eaf88` | 803 cues, 2,838 words |

**Source-era boundary:** Figure 13.2 ends at 2010 and the active-share chart at 2009. Session 37
supplies taxonomy and a measurement standard, never a current product claim.

**Defects carried forward:**

| # | Defect | Handling |
| --- | --- | --- |
| D1 | Quiz Q3's marked answer ("b. False") contradicts its own explanation, which argues you *can* be an active investor holding only index funds | Use the explanation; never reproduce the marked letter |
| D2 | Quiz Q1 option lettering differs between the Test page (correct text at c) and the Solution page (correct text at d) | Cite answer text, never option letters |
| D3 | The claim that ETFs cost more than index funds is falsified by this mission's own filings — VTI 0.03% vs VTSAX 0.04% on one series | Restricted to source-era history; not usable as a current claim |

## Form N-1A — source lock

Retrieved 2026-08-16, HTTP 200 with a declared User-Agent, 960,165 bytes, from
`https://www.sec.gov/files/form-n-1a.pdf` (also 200 at `sec.gov/about/forms/formn-1a.pdf`).
Cited for the portfolio-turnover computation only.

**This corrects the forward plan.** `docs/lesson-plans/missions-10-13-forward-plan.md` §3
records Mission 12 as blocked on `sec-form-n1a` and `sec-nport-datasets` returning 403, and
schedules the mission last on that basis. Form N-1A is reachable — the recorded 403 was a wrong
URL. N-PORT holdings never required the dataset overview page; they come from each fund's own
`NPORT-P` filing. Neither blocker was real. The supplemental manifest entries should be
repointed.

## Outstanding

O1 spread/premium-discount figures, O2 material changes for three products, O4
index-methodology questions — all detailed in the source audit. None is a `Blocked - source`
condition; each ships labelled rather than asserted. **O3 (turnover definition) and O5
(Session 37 review) are closed.**

## Gate D — implementation, 2026-08-17

| File | Purpose |
| --- | --- |
| `lib/holdings-slate.ts` | Product passports, bounded holdings subsets, LEI-keyed overlap, staleness |
| `lib/holdings-slate.test.ts` | 43 tests: shipped-constant integrity, identity, aggregation, overlap, look-through |
| `lib/holdings-slate-artifact.test.ts` | 15 tests: slate completion rules and upstream blockers |
| `lib/if-progress.ts` | `HoldingsSlate`, `OrderDraft`, `isHoldingsSlateComplete`, `holdingsSlateBlockers`, storage and hook wiring |
| `components/lessons/investment-foundations/HoldingsJourney.tsx` | Six-stage journey |
| `components/lessons/investment-foundations/LessonIF_PB_12.tsx` | Lesson shell |
| `components/lessons/investment-foundations/shared.tsx` | `IF_MODULE_12_LESSONS`, `IF_PB_12_SOURCE_BASIS` |
| `components/lessons/investment-foundations/IFProgressRail.tsx` | Mission 12 rail entry |
| `lib/lessonRegistry.ts`, `data/lessons/lessons.ts`, `data/courses/courses.ts` | Route, lesson record, course module |
| `data/courses/portfolioBuilder.ts` | `pb-12` released; `sourceGap` replaced by `sourceBoundary` |
| `data/courses/portfolioBuilder.test.ts` | Open-gap list now `[13]` — Mission 12's gap closed by verification |
| `e2e/lesson-typography.spec.ts` | Mission 12 added to the walked list |

**Order draft is untransmittable by type.** `OrderDraft.transmitted` is typed `false`, not
`boolean`, so no code path can set it. There is no submission endpoint and no submit control
anywhere in the lesson.

### Two defects found by verification, not by review

1. **Four `shownCoveragePct` values were stated rather than computed** and were wrong — figures
   a learner would have read as "you are looking at N% of this fund". `holdings-slate.test.ts`
   now derives each from the shipped positions. The original wrong value was planted back to
   confirm the test reports it:
   `AssertionError: expected 30.0699 to be 29.069`. Three `top10Pct` values and one fabricated
   issuer position-count were corrected in the same pass.
2. **The typography gate's hierarchy rule caught two captions doing a heading's job** — the
   Fund Passport above a 15-row list, and "Order type" above a radiogroup. Both now carry real
   headings.

### Commands run

```text
npx tsc --noEmit                 clean
npx next lint                    clean for Mission 12 files; 2 pre-existing warnings in
                                 components/onboarding/OnboardingFlow.tsx and lib/onboarding/store.tsx
npx vitest run                   26 files, 280 tests, all passing
npx next build                   succeeded
npx playwright test              51 tests: 48 passed, 3 skipped, 0 failed
```

The typography gate walks Mission 12's six stages with **no `ANSWER_KEYS` entry** — the budget
was one keyed stage and none was needed.

Note against `docs/lesson-plans/missions-10-13-forward-plan.md` §6: the Mission 5 preflight
retry test recorded there as red now passes in the full run above.

## Gate E — screen budget, measured 2026-08-17

Every stage walked at every width, page height in screens (`scrollHeight / innerHeight`).
Measured with a real Chromium against the dev server, not estimated.

| Width | St1 identity | St2 passport | St3 filing | St4 overlap | St5 checks | St6 rehearsal | Max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 390 | 3.34 | 4.70 | 4.17 | 5.99 | 3.38 | 5.88 | **5.99** |
| 768 | 2.61 | 3.43 | 3.07 | 4.43 | 2.69 | 4.32 | **4.43** |
| 1024 | 2.32 | 3.25 | 2.85 | 4.23 | 2.44 | 4.16 | **4.23** |
| 1280 | 2.05 | 2.82 | 2.49 | 3.79 | 2.17 | 3.65 | **3.79** |
| 1440 | 2.05 | 2.82 | 2.49 | 3.79 | 2.17 | 3.65 | **3.79** |
| 1920 | 2.05 | 2.82 | 2.49 | 3.79 | 2.17 | 3.65 | **3.79** |

No horizontal overflow at any width. No console errors at any width.

**This fails the Screen Budget Rule at every width and on every stage.** The limit is 1.5
screens per stage.

Two rounds of fixes are already in, both driven by these measurements:

- **Stage 3 (the Prospectus Lens)** stacked all five find-cards, measuring 3.92 screens at 1440
  and 6.26 at 390. It now steps one field at a time with a running passport summary — the
  behaviour the Gate C record specified and the first build did not honour. 3.92 → **2.49**.
- **Stage 2 (the passport)** showed all fifteen rows, measuring 3.21 at 1440. The nine fields
  that decide fit stay on screen; the rest sits behind a disclosure. 3.21 → **2.82**.
- **Stage 5 (the checks)** now steps one check at a time. → **2.17**.

**Still open, and the reason this mission is not release-ready:**

| Stage | 1440 | Cause |
| --- | ---: | --- |
| St4 overlap | 3.79 | Key toggle, recorded-overlap callout, look-through table, identity-conflict table and repair panel all stacked |
| St6 rehearsal | 3.65 | Identity radiogroup, two option cards, amount field and an eleven-row draft summary all stacked |
| St2 passport | 2.82 | Nine rows plus prose plus provenance |
| St1 identity | 2.05 | Hero plus ladder plus six-class table |

**Baseline check, so the number is read fairly.** Mission 11's entry stage measures **2.24**
screens at 1440 and **3.84** at 390 with the same instrument. Mission 12's entry stage is
**2.05** / **3.34** — slightly shorter. The ~2-screen entry is a house-wide condition across
Investment Foundations, not something this mission introduced; stages 4 and 6 are this
mission's own excess and are the ones to fix.

The measurement script lives in `tmp/` and is deliberately not committed. It walks every stage
at every width and reports overflow and console errors alongside the heights; it should become
a repo artifact so the number can be re-run rather than re-derived.

## Browser QA — not yet complete

The dev server was started and the lesson rendered without console errors at all six widths,
and the Playwright walk exercised every stage. **Screenshots were not captured** — the browser
pane was not displayed in this session, so no visual read at 390 and 1440 has been done, and
neither has the keyboard-only pass, the reduced-motion pass, the dark/light theme pass, nor
save/resume and downstream invalidation. None of that is claimed.

## Release label: `Blocked - implementation`

Source and learner-sequence gates are closed and evidenced. The build is complete and every
automated gate passes. The responsive gate fails on measurement, and the visual, keyboard,
reduced-motion and theme passes have not been run.

---

## Gate E — screen budget, final measurement 2026-08-17

Superseding the table above. Three trim rounds were applied between the two, each driven by a
measurement rather than an estimate. The instrument now separates what this mission controls
from what it inherits.

### Stage content — `#lesson-journey` height ÷ viewport height

| Width | St1 identity | St2 passport | St3 filing | St4 overlap | St5 checks | St6 rehearsal |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 390 | **0.94** | 2.42 | 1.95 | 2.70 | **1.16** | 3.00 |
| 768 | **0.74** | 1.64 | **1.31** | 2.02 | **0.94** | 2.06 |
| 1024 | **0.74** | 1.75 | **1.38** | 2.06 | **0.97** | 2.10 |
| 1280 | **0.70** | 1.52 | **1.23** | 1.92 | **0.91** | 1.96 |
| 1440 | **0.70** | 1.52 | **1.23** | 1.92 | **0.91** | 1.96 |
| 1920 | **0.70** | 1.52 | **1.23** | 1.92 | **0.91** | 1.96 |

Bold = inside the 1.5-screen limit. **Four of six stages pass on desktop**; stage 2 is
marginal at 1.52, and stages 4 and 6 are the real overrun at ~1.95.

### Page total — `scrollHeight` ÷ viewport height

| Width | St1 | St2 | St3 | St4 | St5 | St6 |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1440 | 1.96 | 2.79 | 2.49 | 3.18 | 2.17 | 3.27 |
| 390 | 3.20 | 4.68 | 4.17 | 4.92 | 3.38 | 5.34 |

No horizontal overflow at any width. No console errors at any width.

### Where the page total goes, measured

At a 720px viewport the fixed furniture is **1.31 screens before any lesson content**:

| Element | Screens |
| --- | ---: |
| Site header | 0.10 |
| Lesson hero | 0.68 |
| **Site footer** | **0.53** |
| Stage 1 journey content | 0.98 |

This is shared across every Investment Foundations lesson and is not Mission 12's to fix.
Mission 11's entry stage measures **2.24** page-screens at 1440 against Mission 12's **1.96**,
which puts the two in the same band and confirms the floor is structural.

### What the three trim rounds changed

| Change | Stage | Before → after (1440, page total) |
| --- | --- | --- |
| Prospectus Lens steps one field at a time with a running passport summary — the behaviour the Gate C record specified and the first build did not honour | 3 | 3.92 → 2.49 |
| Passport shows the nine fields that decide fit; the rest behind a disclosure | 2 | 3.21 → 2.79 |
| Checks step one at a time | 5 | — → 2.17 |
| Identity-conflict panel behind a disclosure; look-through table 8 rows → 5; recorded headline folded onto the table | 4 | 3.79 → 3.18 |
| Direction, order type and amount in one row; draft summary compressed with warnings behind a disclosure; product options paired | 6 | 3.65 → 3.27 |
| Leading paragraphs removed where the shell already renders `guide` and `instruction` — the page was saying the same thing twice | 1, 2, 4 | — |

### Still open

Stages 4 and 6 remain at ~1.95 screens of content. `AGENTS.md` prescribes the remedy — *"stages
that overrun get split, never sealed inside a scroll box"* — which means splitting the overlap
stage into look-through and repair, and the rehearsal into order and save, taking the mission
from six stages to eight. That changes the beat structure recorded in the Gate B and Gate C
documents, so it is a deliberate design decision rather than a tidy-up, and it is not made here.

The measurement script lives in `tmp/` and is deliberately uncommitted. It walks every stage at
every width and reports page height, stage-content height, horizontal overflow and console
errors. It should become a repo artifact so this number can be re-run rather than re-derived.

## Verification re-run after the trim rounds

```text
npx tsc --noEmit                 clean
npx next lint                    clean for Mission 12 files
npx vitest run                   26 files, 280 tests, all passing
npx playwright test              full suite 48 passed, 3 skipped, 0 failed
typography gate (if-pb-12)       6 stages walked, no ANSWER_KEYS entry, passing
```

## Browser QA — still not complete

The dev server ran clean at all six widths with no console errors, and a real Chromium walked
every stage. **No screenshots were captured** — the browser pane was not displayed in this
session. Not done, and not claimed: visual read at 390 and 1440, keyboard-only completion,
reduced-motion behaviour, light and dark theme, save/resume, and downstream invalidation.

## Release label: `Blocked - implementation`

Source and learner-sequence gates are closed and evidenced. The build is complete and every
automated gate passes. Two stages exceed the screen budget on content, and the visual,
keyboard, reduced-motion and theme passes have not been run.

---

## Gate E — screen budget after the eight-stage split, 2026-08-17

Supersedes both tables above. The overlap stage and the order rehearsal were each split in two,
per `AGENTS.md` — *"stages that overrun get split, never sealed inside a scroll box"* — taking
the mission from six stages to eight. The pedagogy is unchanged; the amendments are recorded in
`docs/lesson-plans/mission-12-holdings.md` and `-interaction.md`.

### Stage content — `#lesson-journey` height ÷ viewport height

| Width | St1 | St2 | St3 | St4 | St5 | St6 | St7 | St8 | Max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 390 | 0.94 | 2.30 | 1.95 | 2.05 | 1.43 | 1.16 | 1.90 | 1.85 | 2.30 |
| 768 | 0.74 | 1.54 | 1.31 | 1.53 | 1.07 | 0.94 | 1.23 | 1.38 | 1.54 |
| 1024 | 0.74 | 1.65 | 1.38 | 1.58 | 1.11 | 0.97 | 1.25 | 1.43 | 1.65 |
| 1280 | 0.70 | 1.45 | 1.23 | 1.47 | 1.04 | 0.91 | 1.17 | 1.26 | **1.47** |
| **1440** | **0.70** | **1.45** | **1.23** | **1.47** | **1.04** | **0.91** | **1.17** | **1.26** | **1.47 — passes** |
| 1920 | 0.70 | 1.45 | 1.23 | 1.47 | 1.04 | 0.91 | 1.17 | 1.26 | **1.47** |

**At 1440×900, the width the Screen Budget Rule names, every one of the eight stages is inside
the 1.5-screen limit.** Worst stage 1.47. Stage 4 went 1.92 → 1.47 and stage 6 (now 7 and 8)
1.96 → 1.17 / 1.26.

Narrower widths remain above the limit — 1.65 at 1024, 2.30 at 390 — and are reported rather
than smoothed over. Mobile is the next thing to work on if this is pushed further.

### Page total — `scrollHeight` ÷ viewport height

| Width | St1 | St2 | St3 | St4 | St5 | St6 | St7 | St8 | Max |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1440 | 1.96 | 2.79 | 2.49 | 2.73 | 2.30 | 2.17 | 2.44 | 2.52 | 2.79 |
| 390 | 3.16 | 4.64 | 4.17 | 4.26 | 3.65 | 3.38 | 4.12 | 4.06 | 4.64 |

Page totals stay above 1.5 because **1.31 screens are shared furniture** — site header 0.10,
lesson hero 0.68, site footer 0.53 — measured at a 720px viewport and present on every
Investment Foundations lesson. Mission 11's entry stage measures 2.24 page-screens against
Mission 12's 1.96. Under a strict page-total reading of the rule, no lesson in the course
currently complies, and fixing that means changing shared layout rather than this mission.

No horizontal overflow at any width. No console errors at any width.

### Verification after the split

```text
npx tsc --noEmit                 clean
npx next lint                    clean for Mission 12 files
npx vitest run                   26 files, 280 tests, all passing
npx playwright test              51 tests: 48 passed, 3 skipped, 0 failed
npx next build                   compiled successfully, 100 static pages generated
typography gate (if-pb-12)       8 stages walked, still no ANSWER_KEYS entry, passing
```

## Release label after the split: `Blocked - implementation`

Source and learner-sequence gates closed and evidenced. Build complete, every automated gate
passing, and the screen budget now met at the width the rule specifies. **What keeps this from
`Ready for review` is browser QA that has not been run**: no screenshots were captured because
the browser pane was not displayed, so there has been no visual read at 390 or 1440, no
keyboard-only completion, no reduced-motion check, no light/dark theme pass, and no save/resume
or downstream-invalidation walk. None of it is claimed.

---

## Browser QA — run 2026-08-17

Driven with Playwright against the dev server, screenshots written to `tmp/qa/` and read.
Scripts live in `tmp/` and are deliberately uncommitted: `browser-qa.js` (visual capture, light
surface, reduced motion, save/resume, invalidation), `keyboard-qa.js` (keyboard-only
completion), `screen-budget.js` (six-width heights), `rm-scope.js` (reduced-motion scope).

| Check | Result |
| --- | --- |
| Visual capture, 8 stages × 2 widths | 16 screenshots, read at 1440 and 390 |
| Light surface | `.ops-theme-light` applied; **0** opaque dark-on-dark surfaces |
| Console / page errors | **0** at every width |
| Keyboard-only completion | **Reached stage 8 of 8.** Every required control reachable by Tab and operable by Enter |
| Visible focus | **0** controls focused without a visible ring |
| Reduced motion | Journey completes; **0** page errors after the fix below |
| Save | Slate written: 2 lines, key recorded, `classId` present, `transmitted: false` |
| Resume | Reload lands on stage 8 with the saved badge |
| Downstream invalidation | Removing the Mission 11 timing policy surfaces the blocker |
| Horizontal overflow | None at any width |

Theme note: lesson theme is route-derived (`lib/route-theme.ts` — `/courses` and `/lessons` are
light, everything else dark), so there is no user toggle to test. The light surface was verified
instead.

### Defects found and fixed during QA

1. **Stale copy after the eight-stage split.** The hero still read "Six guided stages", and the
   Checks stage's own button still said "Continue to the rehearsal" while the stage list said
   "Continue to the order". Both fixed.
2. **A selection the interface claimed and denied at once.** Stage 4 rendered
   `aria-checked="true"` on "Instrument (CUSIP)" while its continue button read *"Choose a key
   to continue"* and was disabled — because `keyMode` started empty while the view defaulted to
   instrument. Wrong for a sighted learner and a lie to a screen reader. Instrument is now a
   real default and the false gate is gone; switching to issuer remains the lesson.
3. **Hydration failure under reduced motion — site-wide, not this mission.**
   `components/layout/SiteShell.tsx` rendered `children` bare when `useReducedMotion()` was
   true and wrapped them in a `motion.div` otherwise. The hook returns `null` on the server, so
   SSR always emitted the wrapper and a client with `prefers-reduced-motion: reduce` did not
   expect it: *"Did not expect server HTML to contain a `<div>` in `<div>`"*, after which React
   discarded the server markup and re-rendered the entire root.

   Measured before the fix, with interaction during hydration:

   | Route | no-preference | reduce |
   | --- | ---: | ---: |
   | `/` | 0 | 1 |
   | `/courses` | 0 | 1 |
   | `/courses/investment-foundations` | 0 | 1 |
   | `/lessons/if-pb-12-…` | 0 | 2 |

   The wrapper is now rendered unconditionally and only its animation is reduced, so the DOM is
   identical on both sides. After the fix: 0 on every route except
   `/courses/investment-foundations`, which has the same pattern in
   `components/courses/PortfolioBuilderPath.tsx:76`.

   This was fixed rather than merely recorded because it blocked Mission 12's reduced-motion
   gate. Mission 5's reduced-motion e2e test still passes, and the full suite is green.

### Recorded, not fixed — outside this phase

- ~~`components/courses/PortfolioBuilderPath.tsx:76`~~ — **fixed 2026-08-17.** Same DOM branch,
  same fix: the decorative scan is now rendered unconditionally and reduced by CSS
  (`motion-reduce:hidden`) plus a zero-duration transition. Verified hidden under reduce
  (`display: none`) and visible without it, and the Mission 5 e2e test asserts *hidden* rather
  than absent, so the contract is unchanged.

  **The reduced-motion hydration defect is now closed site-wide:** 0 mismatches on `/`,
  `/courses`, `/courses/investment-foundations` and the Mission 12 lesson, under both
  `no-preference` and `reduce`.
- **The `Choice` radiogroup pattern**, inherited unchanged from Mission 11, makes every option a
  tab stop and does not implement roving tabindex or arrow-key navigation. It is fully operable
  by keyboard — verified above — but it is not the APG radiogroup pattern. House-wide, worth a
  deliberate pass rather than a per-mission fix.
- On mobile, stage 7's Direction and Order type cards have noticeably different heights because
  only one carries hint text. Cosmetic.

### Verification after all QA fixes

```text
npx tsc --noEmit                 clean
npx next lint                    clean for Mission 12 files
npx vitest run                   26 files, 280 tests, all passing
npx playwright test              51 tests: 48 passed, 3 skipped, 0 failed
npx next build                   compiled successfully, 100 static pages
screen budget                    max 1.47 screens of stage content at 1440x900
```

## Release label: `Ready for review`

Every gate this phase owns is closed and evidenced: source, learner sequence, interaction
design, implementation, automated tests, screen budget at the specified width, and browser QA
including keyboard-only completion and reduced motion. Remaining limits are stated rather than
hidden — narrower viewports still exceed the stage budget, page totals carry 1.31 screens of
shared furniture, and O1, O2 and O4 in the source audit ship labelled rather than asserted.

`Release-ready` is not claimed: it requires explicit stakeholder approval of the exact
implemented release, which is not recorded.

---

## Radiogroup accessibility — closed 2026-08-17

The last item recorded as "not fixed, outside this phase" after browser QA. Closed because the
component was shared, the fix was one file, and a regression test could be made to fail first.

| | Before | After |
| --- | --- | --- |
| Tab stops per group | one per option | **one per group**, following the selection |
| Arrow keys | inert | **move and select**, wrapping at both ends |
| Home / End | inert | **jump to first / last** |
| Implementations | two hand-rolled copies | **one shared `ChoiceGroup.tsx`** |

Migrated: Mission 12 (six groups) and Mission 11 (six groups). Both local `Choice` components
deleted as dead code. Two Mission 11 groups had their heading inside `role="radiogroup"`; it
moved out.

**The tests were proven able to fail.** `e2e/radiogroup-a11y.spec.ts` has four tests. With the
previous behaviour planted back — every option `tabIndex={0}`, no key handler — **all four
failed**; on restore, all four passed.

Keyboard-only completion of Mission 12 re-confirmed after the migration: **stage 8 of 8, zero
controls without a visible focus ring, no traps**. Screen budget unchanged at 1.47 screens of
stage content at 1440×900.

### Verification after the radiogroup migration

```text
npx tsc --noEmit                 clean
npx next lint                    clean
npx vitest run                   26 files, 284 tests, all passing
npx playwright test              55 tests: 52 passed, 3 skipped, 0 failed
npx next build                   compiled successfully, 100 static pages
```

**A trap worth recording for whoever runs this next.** `playwright.config.ts` sets
`reuseExistingServer: !process.env.CI` and points at port 3000. If anything is already
listening there — another session's dev server, a leftover process — the entire suite runs
against *that* app instead of starting its own, with no warning. During this run a stale
server on 3000 was returning 404 for every lesson route, and the suite reported ten failures
that were all `page.goto` timeouts and `net::ERR_ABORTED` rather than real assertion failures.

The numbers above come from a dedicated server on a free port. Two symptoms identify the
problem: failures are navigation errors rather than assertion errors, and `netstat` shows a
process on 3000 that the run did not start. Running two dev servers against the same `.next`
directory corrupts chunks and produces the same class of failure.

---

## Release label: `Release-ready`

**Signed off by the human stakeholder on 2026-08-17**, on the exact implemented release recorded
in this document.

Confirmed against the repository's own Playwright configuration after the stale process on port
3000 was stopped, so the numbers below come from the standard command with no override:

```text
npx tsc --noEmit                 clean
npx next lint                    clean
npx vitest run                   26 files, 284 tests, all passing
npx playwright test              55 tests: 52 passed, 3 skipped, 0 failed
npx next build                   compiled successfully, 100 static pages
screen budget                    max 1.47 screens of stage content at 1440x900
keyboard-only                    all 8 stages, 0 controls without a visible focus ring
reduced motion                   journey completes, 0 page errors, 0 hydration mismatches site-wide
```

Limits ship stated rather than hidden: O1 (no filing in the slate publishes a bid-ask spread or
premium/discount figure) and O4 (index-methodology questions, flagged as inference and excluded)
remain open by their nature; narrower viewports still exceed the stage budget, and page totals
carry 1.31 screens of shared furniture common to every Investment Foundations lesson.
