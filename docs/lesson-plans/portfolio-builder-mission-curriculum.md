# Portfolio Builder: the mission curriculum

**Status:** proposed for approval. Designed from the verified slide content of all 38
Damodaran *Investment Philosophies* sessions, not from session titles.

**Supersedes** `portfolio-builder-core-curriculum.md`, which assumed a 10-mission spine
before the corpus was readable. That document's mission order was derived from the
session index; this one is derived from what the decks actually teach. Keep the old file
for provenance; do not implement from it.

**Source basis:** `.source-cache/` (gitignored), built by `scripts/source/fetch-session.mjs`.
38/38 slide decks, 38/38 quiz + solution files, 33/38 narration transcripts. Sessions 5,
12, 24, 27 and 32 have no caption track and their narration is **not** reviewed.

---

## 1. The one thing this course does

> Build a portfolio you can defend, holding by holding, and leave with written rules for
> what you own, what it costs, when you change it, and when you admit you were wrong.

Every mission is **one portfolio decision** that produces **one artifact**. A learner who
finishes owns a complete, implementable Portfolio Dossier. Nothing else counts as progress
— not sessions watched, not philosophies surveyed.

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

| # | Portfolio decision | Learner outcome | Artifact | Damodaran sources | Status |
|---:|---|---|---|---|---|
| 1 | Who am I building this for? | State goal, horizon, cash needs, job security, tax status, loss capacity and behavioural constraints | Investor Mandate | 1, 38 | built (1.4) |
| 2 | What do I believe about markets? | Commit to a testable market belief and name what would falsify it | Market Belief Statement | 7, 1 | built (1.1, 1.3) |
| 3 | What can a bond do to me? | Separate interest-rate risk from default risk; use duration and spreads | Bond Risk Assessment | 2 | built (2.1–2.5) |
| 4 | What can a stock do to me, and what return should I demand? | Distinguish risk measures, use and criticise CAPM, set a required return | Required Return Lens | 3 | built (3.1–3.6) |
| 5 | How much goes where, and what loss is unacceptable? | Build a strategic allocation, risk budget and concentration limits | Allocation & Risk Policy | 1, 2, 3, 30 + Finance Foundations portfolio theory + supplemental | **part-gated** |
| 6 | What is the business behind the security? | Connect the statements; read profitability, leverage and cash flow | Business Evidence Brief | 4 | built (4.1–4.6) |
| 7 | What is it worth, and at what price would I act? | Build an internally consistent value range and a decision rule | Valuation & Return Range | 5, 3, 4 | built (5.1) |
| 8 | What will acting actually cost me? | Quantify spread, price impact, cost of waiting, turnover and tax drag | Friction Budget | 6 | **ready** |
| 9 | How would I know if a strategy really works? | Apply event/portfolio/regression tests; name the cardinal sins | Evidence Test Checklist | 8 | **ready** |
| 10 | Passive core, or do I have a defensible edge? | Default to passive unless a falsifiable edge survives friction and evidence | Architecture & Edge Decision | 35, 36, 7, 8, 6 | **ready** |
| 11 | Will I try to time the market? | Price the cost of being wrong; write a no-timing or bounded-timing rule | Timing Policy | 30, 32, 33, 34 | **ready** |
| 12 | What do I actually buy? | Compare index funds, ETFs and enhanced index funds on cost, tracking, tax and liquidity | Holdings Slate | 37 + supplemental | **gated** |
| 13 | How is this maintained, and why is it coherent? | Write contribution, rebalance, tax, sell and thesis-break rules; defend the whole policy against the misfit test | Operating Plan & IPS | 36, 6, 38 + supplemental | **gated** |

Six missions are already built, four are ready to build from verified sources, and three
are blocked on sources outside this corpus.

## 4. Dependency logic

Each mission may only assume what an earlier one established.

```
1 mandate ──► 2 beliefs ──► 3 bond risk ──┐
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

Six subjects are required for an implementable portfolio and are not taught to sufficient
depth in this corpus. Missions 5, 12 and 13 are gated on them and **must not be authored**
until primary, current sources are locked:

1. **Strategic asset allocation — implementation only.** The *theory* is already built, in
   Finance Foundations: `portfolio-risk-covariance-correlation`,
   `portfolio-diversification-many-assets`, `portfolio-efficient-frontier`,
   `portfolio-risk-free-tangency-sharpe`, `capm-tangency-becomes-market-portfolio` and
   `required-return-to-discount-rate`. Mission 5 should **reference** those rather than
   re-teach them. What is genuinely missing is the step from a frontier to a real
   allocation for a person with a horizon, a tax status and a behavioural limit — plus
   current return/risk inputs. Session 1 covers risk preference, horizon and tax status
   but produces no allocation.
2. **Position sizing and concentration policy.** Absent from the corpus.
3. **Current fund and ETF due diligence.** Session 37's product landscape predates the
   modern ETF market; expense ratios, structures and tracking practice have all moved.
4. **Rebalancing method and cadence.** Session 36 explains why turnover hurts but gives no
   rebalancing rule.
5. **Current tax and account rules.** Session 6's tax treatment is dated and US-specific.
6. **IPS and benchmark design.** Session 38 assesses fit but produces no policy document.

Additionally, historical performance and product-cost claims throughout sessions 35–37
need current evidence rather than reuse.

### Status of the supplemental sources (verified 2026-08-10)

Locked jurisdiction: **US**. Manifest: `scripts/source/supplemental-manifest.json`;
fetcher: `scripts/source/fetch-supplemental.mjs`. Every URL was fetch-tested — during the
survey two candidates returned 404 and one returned 403, so nothing here is taken on trust.

| Subject | Source | Status |
| --- | --- | --- |
| 1. Allocation — inputs | Damodaran, *Equity Risk Premiums* (78 pp); Country Default Spreads (167 country rows) | **locked** |
| 1. Allocation — method | Vanguard, *Principles for Investing Success* (33 pp) | **locked** |
| 2. Sizing and concentration | none | **open** — see manifest `openGaps` |
| 3. Fund and ETF diligence | SEC EDGAR submissions API; SEC investor.gov fund basics | **locked** |
| 4. Rebalancing | Vanguard, *The Rebalancing Edge* (15 pp) | **locked** |
| 5. Tax and accounts (US) | IRS Publications 550, 590-A, 590-B (270 pp combined) | **locked** |
| 6. IPS and benchmark | CFA Institute, *Elements of an IPS for Individual Investors* (27 pp) | **locked** |

Two things remain genuinely unresolved:

- **Position sizing and concentration policy** has no primary source yet. The best
  candidates are US regulatory diversification tests real funds must satisfy — Investment
  Company Act §5(b)(1) and the RIC diversification requirements — which need locating on a
  canonical government domain and fetch-testing.
- **Index methodology is not machine-accessible.** S&P's methodology PDF returns 403 to
  automated fetch. Teach index construction from a fund prospectus via EDGAR instead: it
  describes the index it tracks, it is accessible, and it is the document a real investor
  would read.

Five sources are marked `decay: high` because their figures change at least annually
(risk premiums, tax thresholds). Lesson copy must cite them with a date and must never
hardcode the numbers.

## 7. What happens to the lessons already built

22 lessons exist across sessions 1–5 — four, five, six, six and one. (The superseded plan
said 21; that was an undercount, verified against `lib/lessonRegistry.ts` and the 22 lesson
components on disk.) **No slug changes and no content rebuilds.** Slugs
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

## 8. Release gates

Before any gated mission is authored:

- lock primary current sources for the six subjects in §6;
- build a claim-level coverage matrix per mission, citing slide and narration timestamps
  from `.source-cache/`;
- for sessions 5, 12, 24, 27 and 32, record narration as **not reviewed** — no caption
  track exists and this environment has no speech-to-text.

Before any mission ships:

- the learner-sequence check in `AGENTS.md` (introduce → model → guided practice →
  independent application → assessment);
- every assessed idea traceable to an introduction earlier in the same or a prior mission;
- functional, accessibility, responsive and theme QA in a browser, not by code audit.
