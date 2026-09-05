# Studio research workspace: process coverage map (M0)

Review date: 2026-09-05. Milestone: M0 of
[`studio-research-workspace-handoff.md`](../agent-prompts/studio-research-workspace-handoff.md).

This maps every stage of the team's actual process to a destination in Studio, names the
source each stage would need, and records the method questions that are still open. It is a
mapping document. It asserts no implementation and no verified financial fact.

## 0. What was read for this map

| Material | How it was read | Extent |
| --- | --- | --- |
| `Wharton Investment Comp (5).pdf` | Text extraction plus page renders from a prior session at `tmp/pdfs/wic-strategy-review/` | 134 pages, 162,061 characters of text |
| `WIC Final Report (2).pdf` | Same, at `tmp/pdfs/wic-report-review/` | 18 pages, 27,001 characters |
| Morgan Stanley, *Measuring the Moat* (Counterpoint Global, Mauboussin and Callahan) | Retrieved and extracted to `tmp/pdfs/firm-process/` | 46,332 words, including its explicit checklist |
| Morgan Stanley, *ROIC and the Investment Process* | Retrieved, not yet read at claim level | Pending M3 |
| Repository code | Direct inspection | See §3 |

**Page-count discrepancy, resolved.** The session attachment reported the strategy PDF as 23
pages. The file itself is 134 pages: a prior session rendered `page-001.png` through
`page-134.png` from it at 10:03, after the file's own 10:01 modification time, and the text
extraction yields 134 page markers. The handoff's page map is therefore valid and the
attachment figure is wrong. Anyone re-running this should confirm the same before trusting a
page reference.

**Not yet read visually.** The handoff requires reading images, not only text, for the
workbook layout (pp. 8-10) and the weight/risk comparisons (pp. 128-134). Text extraction of
pp. 128-134 returns only captions — the substance is in chart images. Those pages are read
in M1/M6, not here. This map does not claim their numbers.

## 1. The team's process, stage by stage

Reconstructed from the final report §5 and the strategy document. Each row states where the
work goes in Studio, what it needs, and what is unresolved.

| # | Team stage | Evidence | Studio destination | Needs |
| --- | --- | --- | --- | --- |
| 1 | Read the client case; derive objectives, horizon, withdrawals, required return, risk tolerance | Report p7 | F1 goal and feasibility | Cash-flow solver; nominal/real basis |
| 2 | Choose an industry universe from an official classification | Report p7 (BLS pool) | F2 industry research | An industry taxonomy and industry-level data |
| 3 | Build industry maps of suppliers, intermediaries, buyers | Report p8, adapted from *Measuring the Moat* | F2, currently unmapped | Industry map surface; MS framework as source |
| 4 | Score industries on growth, macro sensitivity, competition, ESG, externality | Report pp8-9 | F2 industry comparison | Industry ROIC/WACC, CAGR, margins, EV multiples, drawdowns, concentration |
| 5 | Correlation-test industries to avoid overlap | Strategy pp4-5 | F2 and F7 | Return history at industry level |
| 6 | Select 10 leading companies per industry | Report p10 | F2 peer group definition | Peer-group membership rule |
| 7 | Three-pillar z-score screen with winsorization | Strategy pp5-7 | F2 screen definition and run | Per-company fundamentals; see §2 for exact formulas |
| 8 | Sector-specific metric substitution for banks | Strategy p7 | F2 metric templates | Bank metric template; justification |
| 9 | ESG adjustment to the composite score | Strategy p7 | F2, blocked | S&P Global ESG is partly paid; see §4 |
| 10 | Qualitative two-page review of ~20 candidates | Report p11 | F3 company investigation | Filing reader; five-forces structure |
| 11 | Economic profitability: ROIC versus WACC | Report p11 | F3 and F4 | ROIC/WACC definitions and inputs |
| 12 | Select 10 stocks from quantitative plus qualitative | Report p11 | F3 conclusion and status | Candidate record independent of holdings |
| 13 | Estimate returns and covariance; Ledoit-Wolf shrinkage | Report p11 | F7 estimate sets | Monthly total-return history |
| 14 | Black-Litterman blending market-implied returns with analyst-target views | Report p11 | F7 advanced estimation | Market-implied prior; view construction; analyst targets |
| 15 | Four optimizers: MV, HRP, ERC, CVaR | Report p11, strategy pp128-134 | F8 construction | Solver; constraint expression |
| 16 | Ensemble blend of optimizer outputs | Report p12 | F8 blends | Blend recalculation, not averaged statistics |
| 17 | Monte Carlo, 10 years, 10,000 paths | Report p12 | F9 simulation | Reproducible seeded engine |
| 18 | Diagnostics: ENC and ENCB | Report p12 | F8 diagnostics | Effective-number definitions |
| 19 | CPPI evaluated and rejected | Report p12 | F9, optional | Only if CPPI is scoped |
| 20 | Rebalance rule: quarterly, ±25% band from target weight | Report p13 | F10 operating rules | Relative-band drift unit |
| 21 | Trading notes explaining each buy/sell | Report pp3-4 | F10 worksheet and review | Decision record with reasons |
| 22 | Portfolio-at-a-glance holdings table | Report p5 | F10 export | Export consistency |

Every stage has a destination. Stages 3, 9, 14 and 19 have open dependencies, recorded in §4.

## 2. Screening method, exactly as specified

Transcribed from strategy pp5-7. Recorded so it can be reproduced as a **labeled historical
example**. It is not an OPS default, a recommended strategy, or a validated ranking formula.

Pillar scores, each input winsorized at the 5th/95th percentiles and converted to a z-score
within its industry peer group:

```
zPrice           = 0.50·z(earnings yield) + 0.30·z(FCF yield) + 0.20·z(sales yield)
zBusinessQuality = 0.35·z(ROIC) + 0.20·z(margin stability) + 0.20·z(leverage)
                 + 0.15·(−z(accruals)) + 0.10·z(cash conversion)
zMomentum        = z(12-month total return)

CompositeAlpha   = 0.55·zPrice + 0.35·zBusinessQuality + 0.10·zMomentum
AdjustedAlpha    = CompositeAlpha + 0.15·z(ESG) − 0.10·z(carbon)
                 − 0.05·z(water) − 0.10·z(controversy)
```

Metric definitions as the team defined them:

| Metric | Definition |
| --- | --- |
| Earnings yield | TTM EPS / price |
| FCF yield | TTM free cash flow / enterprise value |
| Sales yield | TTM sales / enterprise value |
| ROIC | NOPAT / invested capital |
| Margin stability | Negative standard deviation of gross margin over 12 quarters |
| Leverage | Net debt / EBITDA, negated |
| Accruals ratio | (Net income − cash flow from operations) / average total assets |
| Cash conversion | Cash flow from operations / net income |
| Momentum | 12-month total return, frozen 2024-11-15 to 2025-11-15 |

Bank substitutions (credit intermediation), strategy p7: FCF yield becomes dividend yield
(TTM DPS / price); sales yield becomes revenue yield (TTM revenue / market cap); ROIC becomes
ROA (TTM net income / average total assets); leverage becomes equity-to-assets.

Price-based inputs were measured as of **2025-11-17 after extended hours** and held fixed.

### Method questions this raises, unresolved

These must be settled in a written method spec before any OPS screen is built. The source
does not answer them.

1. Winsorization at the 5th/95th percentiles of a **ten-name** peer group clips at roughly the
   single most extreme observation at each end. The team says so themselves — strategy p5
   states z-scores are "primarily used for ranking rather than precise standardized distance
   estimates." Any OPS surface must carry that caution, not present the score as a distance.
2. Sample versus population standard deviation is unstated. With n=10 the choice moves every
   score.
3. Quantile convention for winsorization is unstated.
4. Zero-variance peer groups and undefined ratios (negative EBITDA in net debt/EBITDA,
   negative earnings in earnings yield) have no stated handling.
5. Weight normalization when a metric is missing for a company is unstated.
6. Tie handling is unstated.
7. Enterprise value is a denominator for two price metrics; its own definition (cash netting,
   minority interest, leases) is unstated and materially changes both.

### Reconciliation: the two documents disagree

| Item | Final report | Strategy document | Treatment |
| --- | --- | --- | --- |
| Industries scored | "narrowed our universe to 10 industries" (p7) | Nine industries listed with scores (p4) | Unreconciled. Do not cite a count. |
| Final six industries | BLS categories: Electrical Equipment; Medical Equipment; Credit Intermediation; Electric Power Generation; Data Processing; Computing Infrastructure (p9) | Colloquial: Cybersecurity; AI Infra & Data-Center Supply Chain; Power & Grid Equipment; Healthcare Services & Equipment; Renewable Energy; Banks (p5) | Same six under two naming systems; the mapping is not stated in either document and is not obvious |
| Missing ESG | "treated the quantitative score as the industry mean" (p10) | "assign ESG z score = 0" (p6) | Equivalent — the mean is z=0 by construction. Not a conflict. |
| ESG adjustment | Single +15% ESG weight (p10) | Four terms including carbon, water and controversy penalties (p7) | The report simplifies. The strategy formula is the operative one. |
| Ensemble mix | "60% MV, 15% ERC, and 25% CVaR" (p12) | Four optimizers run | HRP receives **0%** despite being one of the four. Sums to 100%. Record as-is; do not describe the ensemble as "all four." |

## 3. Repository inventory

Inspected 2026-09-05 on branch `feat/studio-workspace`.

| File | Lines | Role |
| --- | --- | --- |
| `components/studio/stages.tsx` | 819 | All six stages in one module — the monolith the handoff warns against extending |
| `lib/studio.ts` | 511 | Schema v1, validation, allocation, rounding, fees, stress, overlap, export |
| `lib/studio-catalog.ts` | 498 | Eight seed instruments |
| `lib/studio-catalog.test.ts` | 336 | Catalog and calculation checks |
| `components/studio/shared.tsx` | 217 | UI primitives |
| `components/studio/StudioWorkspace.tsx` | 193 | Shell and navigation |
| `lib/studio-guidance.ts` | 172 | Per-stage teaching copy |
| `lib/use-studio-plan.ts` | 135 | Browser-local persistence with conflict handling |
| `lib/filings/edgar.ts` + `sections.ts` | 468 | Live SEC retrieval and section parsing, with tests |

**Structural defect confirmed by reading the code.** In `lib/studio.ts`, `StudioResearch` is a
field inside `StudioHolding`, and `removeStudioHolding` drops the holding entire. A rejected
candidate's investigation cannot survive, because it has nowhere to live. This is the schema
change M2 exists for, and it blocks the F3 requirement that research outlive rejection.

**Baseline commands** (`package.json`): `npm run typecheck`, `npm test`, `npm run lint`,
`npm run build`, `npm run test:e2e`. Last observed green on 2026-09-05 before M0: typecheck
clean, 396 unit tests, 53 Playwright tests, 3 skipped. No e2e test covers `/studio`.

## 4. Open source and method dependencies

Named here rather than assumed away. Each blocks a specific capability, not the milestone.

| # | Dependency | Blocks | Status |
| --- | --- | --- | --- |
| D1 | Per-company fundamentals with one consistent definition per metric | F2 screen, F3 statements, F4 valuation | **Candidate solution identified.** SEC XBRL company-concept API returns filed figures with accession and date. Verified live: Apple FY2025 revenue $416.2bn from `0000320193-25-000079`. Definition mapping across companies is unproven and is M1's main task. |
| D2 | Price and total-return history | F2 momentum, F7 covariance, F9 simulation, F10 worksheet | **Unresolved.** SEC publishes no prices. Treasury publishes auction prices only. Needs a permitted source or an explicitly scoped-out capability. Highest-risk dependency. |
| D3 | S&P Global ESG scores | F2 ESG adjustment | **Blocked, paid.** The team hit this too — strategy p7 records that S&P Global "requires a premium" and that they substituted z=0 for missing names. OPS cannot redistribute these. Either scope ESG out, or find a permitted alternative. |
| D4 | Analyst price targets | F7 Black-Litterman views | **Blocked as a bulk source.** The team used Yahoo Finance. Redistribution terms are not established. Black-Litterman can still ship with user-stated views. |
| D5 | Industry-level ROIC, WACC, margins, EV multiples | F2 industry scoring | **Likely solvable.** Damodaran publishes these free at NYU Stern and the final report cites them (report p15). Same author as the IF course. Needs terms review. |
| D6 | Industry classification and membership | F2 universe | Partly solvable. BLS gives a taxonomy; mapping companies to it is the work. |
| D7 | Currency history | F6 foreign holdings | Not yet investigated. |
| D8 | A solver for MV/CVaR under constraints in the browser | F8 | Not yet investigated. Handoff requires no invented optimizer. |

## 5. What the institutional research adds that the handoff does not cover

Morgan Stanley's *Measuring the Moat* carries an explicit **"Checklist for Measuring
Sustainable Value Creation"** (pp. 67-69). Compared against handoff F3, the following are
genuinely absent from OPS's plan, and each is a discrete, teachable surface:

| Concept | What it asks | Why it matters here |
| --- | --- | --- |
| Industry map | How do companies interact — suppliers, intermediaries, buyers | The team used exactly this and OPS has no destination for it |
| Profit pool | Where in the value chain the profit actually sits | Explains why two firms in one industry differ |
| Market share instability | How much share moves between competitors | A quantitative stability measure; nothing in F3 does this |
| Industry structure classification | Fragmented, consolidating, or concentrated | Sets expectations before any company is examined |
| Minimum efficient scale | Smallest viable size, and its links to addressable market and share change | A concrete barrier-to-entry test |
| The value stick | Willingness to pay versus willingness to sell | A plain-language model of value creation, well suited to a beginner |
| Role of government | Tariffs, industrial policy, antitrust, tax, trade | Currently absent from OPS entirely |
| Disaggregated ROIC | Whether advantage is cost leadership or differentiation | Turns one number into a diagnosis |
| Regression toward the mean | ROIC reverts; high returns fade | Directly disciplines F4's forward assumptions |

**One finding challenges the team's own method, and should be taught rather than hidden.**
The paper reports that for US companies 1963-2023, "the variance within industries is greater
than the variance across industries," and concludes the industry "is important but does not
dictate a firm's destiny. All industries have companies that create and destroy value." The
team's process selects industries first and then picks within them. Studio should present
both: industry structure matters, and it is not sufficient.

**A second finding validates a design constraint.** The same appendix excludes ADRs "because
they reflect foreign companies" and financial-sector companies "for accounting reasons" from
its ROIC analysis. That is independent support for two things already in the repository: the
foreign-share separation of domicile from listing, and the team's bank-specific metric
substitutions. Sector-specific metric templates are not an OPS nicety.

## 6. State of this map

M0's exit condition is that every major stage of the team's process has a destination and that
open questions are named. §1 gives 22 stages, all mapped. §2 records the seven unresolved
method questions and five documentary discrepancies. §4 records eight dependencies, two of
them blocked on paid or unpermitted sources and one — price history — unresolved and
load-bearing for four functional areas.

Not established by this document: any implementation, any verified financial fact, the visual
content of strategy pp. 8-10 and 128-134, and the claim-level content of *ROIC and the
Investment Process*.
