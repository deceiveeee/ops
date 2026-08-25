# Portfolio Builder: the mission curriculum

**Amendment 1, 2026-08-24 — Missions 2 and 9.** Mission 2 no longer asks a learner to
originate a market belief. Review found that Lesson 1.1 requests the belief before anything
has given a novice grounds for one: four stages teach the shape of a belief through other
people's reasoning, then a blank field appears whose placeholder is a named anomaly in
expert language. Mission 2 now produces a **Market Observation Note** from dated real
events, and the **Market Belief Statement moves to Mission 9**, where the evidence method
that makes a belief defensible is taught. The `beliefs` checkpoint is satisfied by the
observation note; the belief statement rides on Mission 9's `evidence-test` checkpoint,
because Mission 9 owns the evidence method and the learner's own belief is the first claim
that method is applied to. Rationale and the case set:
`docs/lesson-plans/if-1-1-real-market-cases-design-brief.md`.

Unchanged by this amendment: the dependency graph, every other mission, and the open
question of whether Lesson 1.3 belongs to Mission 2 or to the optional catalogue.

**Status:** **approved curriculum authority** on 2026-08-12. Designed from the verified
slide content of all 38 Damodaran *Investment Philosophies* sessions, not from session
titles. Approval fixes the 13-mission build-as-you-learn direction; it does not clear an
unbuilt or source-gated mission for release.

**Supersedes** `portfolio-builder-core-curriculum.md`, which assumed a 10-mission spine
before the corpus was readable. That document's mission order was derived from the
session index; this one is derived from what the decks actually teach. Keep the old file
for provenance; do not implement from it.

**Source basis:** `.source-cache/` (gitignored), built by `scripts/source/fetch-session.mjs`.
Tier 1 contains 38/38 hashed slide decks and 38/38 hashed quiz + solution files. Tier 2
contains 33/38 official caption tracks and is citation-grade. Source-topic Sessions 5, 12,
24, 27, and 32 have no official caption track. Noncanonical local ASR currently exists in
`tmp/damodaran-corpus/` for Sessions 12, 24, 27, and 32 and may be used only for navigation
or topic scope; a prior Session 5 ASR review is documented, but its source artifact is no
longer present. New claim-level narration citations therefore remain gated for all five.

**Practical workflow:** the Damodaran project/tool review and current-primary-source layer
are recorded in `docs/source-audits/portfolio-builder-practical-tools.md`. The proposed
persistent interaction, data, accessibility, and graduation contract is
`docs/lesson-plans/portfolio-builder-guided-workbench.md`.

---

## 1. The one thing this course does

> Build, explain, and operate a diversified long-term portfolio for a stated goal—or prove
> the same decisions in a realistic practice case—with written rules for readiness,
> allocation, security selection, costs, evidence, rebalancing, and mistakes.

Every mission is **one portfolio decision** saved into **one persistent Portfolio
Workbench**. The final Portfolio Dossier and Investment Policy Statement are compiled from
that work; they are not separate end-of-course worksheets. Nothing else counts as mastery—
not sessions watched, philosophies surveyed, or fields filled without independent proof.

The course offers two equal modes from Mission 1: **Build mine** and **Practice case**. A
minor, a learner without account authority or earned income, or anyone with unresolved debt,
emergency-reserve, jurisdiction, or readiness constraints still completes all 13 missions
with a paper portfolio and deployment action plan. “Execute-ready” is conditional and is
not the definition of graduation.

The portfolio advances through controlled states:

```text
mandate → strategic weights → research-only watchlist → architecture license
        → timing policy → product slate → order rehearsal → operating plan
```

No researched company becomes a holding before Missions 8–10 test friction, evidence, and
the passive default. Exact products enter only in Mission 12, and the course never submits a
real order.

## 2. Why this order is not Damodaran's order

Damodaran's 38 sessions are arranged as a *survey of investment philosophies*: framework
(1–8), then a long catalogue of strategies people claim work (9–29), then market timing
(30–34), then the passive case and how to pick a philosophy (35–38).

That is the right shape for a semester course and the wrong shape for building a portfolio,
because the catalogue arrives before the learner has any means of judging it. Reordered for
construction, three things move decisively:

1. **Friction moves early.** Session 6 (trading costs and taxes) is the single largest
   destroyer of returns in the whole corpus — "the average active money manager makes about
   1% less than the market" and the Value Line paper-versus-real-fund gap. It must be
   quantified *before* the active/passive decision, not filed as a footnote after it.
2. **Evidence method becomes its own mission.** Session 8 teaches event studies, portfolio
   studies, regressions and "the cardinal sins in testing strategies." It is the most
   transferable skill in the course and the only defence against the catalogue. It is
   required, and it comes before any strategy is examined.
3. **The catalogue becomes optional evidence.** Sessions 9–29 and 31 stop being a syllabus
   and become 22 test cases the learner may run against the friction budget and the evidence
   checklist. Each investigation answers one question: *does this survive?*

Session 38 also does double duty. Its self-assessment — job security, cash needs, tax
status, "signs of a misfit" — is the natural opening frame *and* the closing test.

## 3. The required missions

Status key: **built** = lessons exist; **ready** = sources verified, not yet built;
**gated** = needs a primary source Damodaran does not provide (see §6).

| # | Portfolio decision | Learner outcome | Workbench checkpoint | Damodaran sources | Status |
|---:|---|---|---|---|---|
| 1 | Who am I building this for? | State goal, horizon, cash needs, readiness, loss capacity and behavioural constraints; choose personal or practice mode | Mandate & Readiness Runway | 1, 38 | built (1.4 + Readiness Runway Workbench retrofit implemented with Mission 5; stakeholder review pending) |
| 2 | What can I actually observe about markets? | Read a dated disclosure, observe the price response, and separate what the evidence supports from what it does not | Market Observation Note | 7, 1, 8, 38 | **redesign approved 2026-08-24, not built** (1.1; see amendment 1) |
| 3 | What can a bond do to me? | Separate interest-rate risk from default risk; use duration and spreads | Bond Risk Assessment | 2 | built (2.1–2.5) |
| 4 | What can a stock do to me, and what return should I demand? | Distinguish risk measures, use and criticise CAPM, set a required return | Required Return Lens | 3 | built (3.1–3.6) |
| 5 | How much goes where, and what loss is unacceptable? | Build a strategic allocation, liquidity bucket and stress-loss budget; derive any position ceiling transparently | Allocation and Risk Policy | 1, 2, 3, 30 + Finance Foundations portfolio theory + supplemental | built (Mission 5 Workbench; exact implementation pending stakeholder review) |
| 6 | What is the business behind the security? | Connect the statements; read profitability, leverage and cash flow without treating research as permission to buy | Business Evidence Brief & Research-Only Watchlist | 4 | built (4.1–4.6; Workbench retrofit required) |
| 7 | What is it worth, and at what price would I act? | Build an internally consistent value range, decision rule and thesis-break variables | Valuation Range & Watchlist Gate | 5, 3, 4 | built (5.1; Workbench retrofit required) |
| 8 | What will acting actually cost me? | Quantify spread, price impact, cost of waiting, turnover and tax drag | Friction Budget | 6 | built (6.1) |
| 9 | How would I know if a strategy really works? | Apply event/portfolio/regression tests; name the cardinal sins; then state a market belief and what would falsify it | Evidence Test Checklist **and Market Belief Statement** | 8, 7, 1 | built (7.1); belief statement pending amendment 1 |
| 10 | Passive core, or do I have a defensible edge? | Default to passive unless a falsifiable edge survives base rate, evidence, friction, capacity, durability and size limits | Architecture & Edge License | 35, 36, 7, 8, 6 | built (8.1; Gate A closed 2026-08-14 by approved narrowing — no current manager-persistence claim is made) |
| 11 | Will I try to time the market? | Price the cost of being wrong; write a no-timing or bounded-timing rule | Timing Policy | 30, 32, 33, 34 | **gated — Session 32 narration** |
| 12 | What do I actually buy? | Verify exact product identity, exposure, structure, fees, tracking, liquidity, source dates and overlap; rehearse but do not place an order | Fund Passports, Holdings Slate & Order Draft | 37 + supplemental | **gated** |
| 13 | How is this maintained, and why is it coherent? | Write contribution, withdrawal, rebalance, tax-warning, sell and thesis-break rules; pass a portfolio flight test and defend the policy | Operating Plan, IPS & Capstone | 36, 6, 38 + supplemental | **gated** |

Ten missions are already built. Three remain gated by supplemental sources, narration,
learning design, or implementation evidence. Curriculum approval removes the architecture
gate only; each remaining mission must still pass its own ordered OPS release gates.

## 4. Dependency logic

Each mission may only assume what an earlier one established.

```
1 mandate ──► 2 observations ──► 3 bond risk ──┐
                                          ├──► 5 allocation ──┐
                            4 equity risk ─┘                  │
                                                              │
              6 business evidence ──► 7 value & range ────────┤
                                                              │
                            8 friction ──► 9 evidence method ─┤
                                                              ▼
                                              10 passive or edge
                                                       │
                                        11 timing policy│
                                                       ▼
                                              12 holdings
                                                       ▼
                                    13 operating rules & defence
```

The non-obvious edges, and why they exist:

- **3 and 4 before 5.** A learner cannot budget risk across asset classes before knowing
  what each class does under stress. Duration and default risk are prerequisites for
  holding bonds on purpose rather than by default.
- **8 and 9 before 10.** The active/passive decision is only honest once friction is
  costed and the learner can test a claim. Reversing this is how people talk themselves
  into active management.
- **7 before 10.** An edge claim is unfalsifiable without a value estimate to be wrong about.
- **11 after 5.** Tactical deviation is meaningless without a strategic allocation to
  deviate from. Session 30's cost-of-timing evidence lands only once something is at stake.
- **13 closes back to 1.** Session 38's misfit test is applied to the finished dossier: a
  coherent portfolio the investor cannot personally hold is still a failure.

## 5. Every session has a destination

All 38 sessions are accounted for: 16 in the required path, 22 as optional investigations.
No session is orphaned, and no session becomes a required mission merely because it exists.

**Required path (16):** 1, 2, 3, 4, 5, 6, 7, 8, 30, 32, 33, 34, 35, 36, 37, 38

**Optional investigations (22).** Each is opened from mission 10, and each ends with the
same question: does this claim survive the Friction Budget and the Evidence Test Checklist?

| Investigation | Sessions | The claim under test |
|---|---|---|
| Momentum and technical patterns | 9, 10, 11, 31 | Past prices, seasonal effects and indicators predict returns |
| Value investing | 12, 13, 14, 15, 16 | Cheap, contrarian or activist positions earn excess returns |
| Growth, small cap and IPOs | 17, 18, 19, 20, 21 | Growth, size, new issues or venture stakes are systematically underpriced |
| Information trading | 22, 23, 24, 25, 26 | Insiders, analysts, earnings and corporate events are tradable |
| Arbitrage | 27, 28, 29 | Mispricings can be captured with limited risk |

This is the pedagogical core of the design. Session 16 ("Where is the beef?" — six myths of
value investing) and session 29 (hedge fund survival bias) are not counterarguments bolted
on; they are what the learner is *equipped* to reach after missions 8 and 9. Sessions 35
and 36 then supply the base rate: manager records, survivor bias, transition probabilities,
and the five named reasons active managers fail — costs, taxes, over-activity, cash drag
and behaviour.

## 6. What Damodaran does not give us

Seven implementation areas are required for a safe beginner portfolio and are not taught to
sufficient depth in this corpus. Every affected mission still needs its own primary-source
coverage matrix; an OPS adaptation must be labelled rather than attributed to Damodaran:

1. **Investment readiness.** The corpus discusses fit, cash needs, horizon, job security and
   tax status, but it does not screen emergency savings, high-interest debt, account
   authority, or whether a learner should remain in a paper-portfolio path.
2. **Strategic asset allocation — implementation only.** The *theory* is already built, in
   Finance Foundations: `portfolio-risk-covariance-correlation`,
   `portfolio-diversification-many-assets`, `portfolio-efficient-frontier`,
   `portfolio-risk-free-tangency-sharpe`, `capm-tangency-becomes-market-portfolio` and
   `required-return-to-discount-rate`. Mission 5 should **reference** those rather than
   re-teach them. What is genuinely missing is the step from a frontier to a real
   allocation for a person with a horizon, a tax status and a behavioural limit. The
   bounded Mission 5 implementation deliberately uses visible OPS/learner stress
   assumptions rather than current return/covariance estimates or optimizer output.
   Adding an optimizer or live expected-return/risk inputs would reopen Mission 5 Gate A.
   Session 1 covers risk preference, horizon and tax status but produces no allocation.
3. **Position sizing and concentration policy.** Absent from the corpus. No SEC or FINRA
   source supplies a universal personal percentage cap. Mission 5 must derive a candidate
   ceiling from an explicit loss budget and label it as an OPS/learner policy; fund
   diversification statutes must not be misrepresented as personal suitability rules.
4. **Current fund and ETF due diligence.** Session 37's product landscape predates the
   modern ETF market; expense ratios, structures and tracking practice have all moved.
5. **Rebalancing method and cadence.** Session 36 explains why turnover hurts but gives no
   rebalancing rule.
6. **Current tax and account rules.** Session 6's tax treatment is dated and US-specific.
7. **IPS and benchmark design.** Session 38 assesses fit but produces no policy document.

Additionally, historical performance and product-cost claims throughout sessions 35–37
need current evidence rather than reuse.

### Status of the supplemental sources (verified 2026-08-12)

Locked jurisdiction: **US**. Manifest: `scripts/source/supplemental-manifest.json`;
fetcher: `scripts/source/fetch-supplemental.mjs`. Every manifest URL was fetch-tested. A
source that works in a browser but cannot be cached and hashed is recorded under
`inaccessible`, not presented as citation-grade.

| Subject | Source | Status |
| --- | --- | --- |
| 1. Investment readiness | Investor.gov, *Investor Preparedness Checklist*; CFPB emergency-fund guide | **locked**; no universal reserve amount |
| 2. Allocation — inputs | Learner mandate facts plus visibly labelled OPS/learner stress assumptions | **closed for bounded Mission 5**. Current return/covariance inputs and optimizer output are quarantined and would require a new Gate A review. |
| 2. Allocation — method | Investor.gov asset-allocation/rebalancing guide; Vanguard, *Principles for Investing Success* | **locked** |
| 3. Sizing and concentration | FINRA concentration-risk page | Browser-reviewed; local fetch **403**. Numerical cap is an OPS loss-budget policy, not a source fact. |
| 4. Fund and ETF diligence | SEC EDGAR submissions API; SEC investor.gov fund basics | **locked**. Form N-1A and N-PORT overview pages remain locally inaccessible; exact EDGAR filings control. |
| 5. Rebalancing | Investor.gov beginner's guide; Vanguard, *The Rebalancing Edge* | **locked**. The Vanguard paper is provider evidence, not a personal 200/175-basis-point rule. |
| 6. Tax and accounts (US) | IRS Publications 550, 590-A, 590-B (270 pp combined) | **locked** |
| 7. IPS and benchmark | CFA Institute, *Elements of an IPS for Individual Investors* (27 pp) | **locked** |
| Order rehearsal | SEC order-types and brokerage-account bulletins | **locked**; rehearsal only, no order transmission |
| Current active/passive base rate | Morningstar Manager Research, *US Active/Passive Barometer: June 2026* | **locked for source audit** |
| Current fund-performance persistence | S&P DJI, *U.S. Persistence Scorecard Year-End 2025* | **open — canonical local fetch blocked** |

Three course-level boundaries remain before the later gated missions can ship:

- **Position sizing is an OPS design boundary, not a missing universal rule.** The search
  for a regulator-approved personal percentage cap is closed because no such standard was
  found and institutional fund tests answer a different legal question. Mission 5 closes
  its bounded sizing design by deriving an optional candidate ceiling from a learner-owned
  loss-contribution budget and a visibly hypothetical loss assumption. FINRA employer-stock
  and fund-overlap claims remain quarantined until canonical provenance is available.
- **Exact product evidence must come from current EDGAR filings.** S&P index methodology,
  SEC Form N-1A and the N-PORT overview page were browser-reviewed but local fetches are
  blocked. This does not justify secondary summaries; Mission 12 should inspect the exact
  prospectus and holdings record available through the locked EDGAR path and timestamp it.
- **Current fund-performance persistence is not yet canonical.** S&P DJI's versioned
  Year-End 2025 Persistence Scorecard is public and has been reviewed, but its server
  returns HTTP 403 to the checked-in fetch pipeline. Do not cite its figures in a lesson
  until the PDF is cached with provenance and a hash. Morningstar's June 2026 report closes
  the current active/passive base-rate need, not this narrower winner-persistence question.

Sources marked `decay: high` contain figures that change at least annually. Lesson copy
must cite them with a date and must never hardcode the numbers.

## 7. What happens to the lessons already built

24 lessons exist across lesson groups 1–7 — four, five, six, six, one, one, and one.
(The superseded plan said 21; that was an undercount, verified against
`lib/lessonRegistry.ts` and the lesson components on disk.) **No slug changes and no
content rebuilds.** Slugs
are the keys in `ops-if-completion-v1` and in `legacyCompletionSlugs`, so renaming them
would silently erase saved learner progress. Only learner-facing labels change: the module
eyebrows, sidebar and headings are restated as missions.

| Existing lessons | Now serve | Change required |
|---|---|---|
| 1.1 Philosophy Before Strategy | Mission 2 | Relabel; it is a beliefs lesson, not a module opener |
| 1.2 Where Philosophy Enters | Missions 1–2 | Relabel; the investment-process map frames the whole dossier |
| 1.3 Six Ways Investors Claim an Edge | Hub for the optional investigations | Re-point: it previews the catalogue, so it belongs beside mission 10, not in the required opening |
| 1.4 Investor–Philosophy Fit | Mission 1 | Relabel; also referenced by mission 13's misfit test |
| 2.1–2.5 bond risk | Mission 3 | Relabel only |
| 3.1–3.6 equity risk | Mission 4 | Relabel only |
| 4.1–4.6 statements | Mission 6 | Relabel only |
| 5.1 Valuation range | Mission 7 | Relabel, and fix the "Mission 6 mastery" string — the rail credits this as mission 7 under this plan and credited it as 5 under the old one; the lesson has always displayed the wrong number |

The one structural change: **1.3 moves out of the required opening.** Surveying six
philosophy families before the learner can test any of them is the same mistake as the
original session order, one module down.

## 8. Competence and graduation

Completion is not competence. A learner graduates only after both of these pass:

1. the learner's personal or practice Portfolio Dossier, including source dates,
   assumptions, rejected ideas, loss response, product identity and operating rules; and
2. an unfamiliar transfer case in which the learner diagnoses, repairs and operates a new
   portfolio without copying saved answers.

Weights that do not total 100%, a liquidity mismatch, hidden leverage, the wrong security,
unsupported concentration or active edge, missing provenance, or no response to loss,
drift or a broken thesis are critical failures regardless of the numerical score. The
proposed rubric and 80-point pilot threshold are defined in the guided Workbench
specification; the threshold must be calibrated in learner testing before it is represented
as a competence standard.

Graduation demonstrates a beginner's ability to build, explain and operate a diversified
long-term portfolio for a stated case. It does not certify advisory competence, market
prediction, personal tax calculation, or safe use of leverage, derivatives, short selling
or concentrated speculation.

## 9. Release gates

Before any gated mission is authored:

- close or explicitly quarantine the affected implementation boundaries in §6;
- build a claim-level coverage matrix per mission, citing slide and narration timestamps
  from `.source-cache/`;
- for Sessions 5, 12, 24, 27, and 32, record that no official caption track exists. Local
  ASR is noncanonical navigation evidence only; it does not close a claim-level citation
  gate without reconciliation and recorded provenance.

Before any mission ships:

- the learner-sequence check in `AGENTS.md` (introduce → model → guided practice →
  independent application → assessment);
- every assessed idea traceable to an introduction earlier in the same or a prior mission;
- functional, accessibility, responsive and theme QA in a browser, not by code audit.
