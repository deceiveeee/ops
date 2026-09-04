# Portfolio Builder real-case reconstruction plan

Status: **proposed design authority — stakeholder review required before implementation**  
Scope: all 13 Portfolio Builder missions, their Workbench checkpoints, and the compiled
Portfolio Dossier  
Implementation decision: **planning only; this document does not authorize lesson or UI
changes**

## 1. Decision

Portfolio Builder should be reconstructed around a small set of real, dated, reproducible
evidence cases. A case earns a place only when it teaches a decision the learner must later
save to the Portfolio Dossier.

The course should no longer use a fictional person or invented company as the default proof
that a finance idea works. Real public policies, filings, securities, market events, studies,
and fund documents should carry the modeling and guided-practice work. Controlled simulations
remain only where the object itself is personal, future-facing, or unobservable—for example a
learner's future cash need, a stress-loss assumption, or a policy flight test. Those simulations
must be named as **OPS/learner assumptions**, not disguised as historical cases.

The learner-facing rhythm becomes:

> **Example → Investigate → Reproduce → Apply & Save**

Every mission must therefore show:

1. a completed specimen built from real evidence;
2. the exact source and the small part of it that matters;
3. a reproducible lookup or calculation;
4. the Dossier field that the work prepares;
5. a scaffolded application with evidence already carried forward; and
6. an independent transfer check before the checkpoint becomes coherent.

This solves the two problems in the required order:

1. **Major reconstruction:** remove decorative hypotheticals and rebuild the learning sequence
   around real cases and Dossier-producing research.
2. **Later simplification:** once the evidence and field contracts are stable, reduce the UI to
   one repeated research-and-save shell with one decision per screen.

## 2. What this plan preserves from OPS

This is a reconstruction of the current OPS curriculum, not a new course.

The following remain authoritative:

- the 13-mission spine in `data/courses/portfolioBuilder.ts`;
- the learner promise and persistent Workbench model in
  `docs/lesson-plans/portfolio-builder-guided-workbench.md`;
- the approved mission curriculum in
  `docs/lesson-plans/portfolio-builder-mission-curriculum.md`;
- the source locks, qualifications, corrections, and quarantines in `docs/source-audits/`;
- the dependency and review-required behavior in `lib/portfolio-workbench.ts`;
- the existing artifact meanings in `lib/if-progress.ts`;
- personal and practice paths as equally valid course-completion routes;
- research-only status before architecture, holdings, and operating gates permit anything
  further;
- no order transmission, personalized tax calculation, eligibility determination, or claim
  that a course-selected security is suitable for the learner; and
- the OPS release sequence: source integrity → learner sequence → interaction design →
  implementation → functional/accessibility/responsive/visual verification.

The required knowledge sequence remains:

> introduce → model → guided practice → independent application → assessment

The reconstruction changes the evidence and scaffolding inside that sequence. It does not
weaken it.

## 3. Authority cleanup before case reconstruction

OPS currently contains several status statements that disagree with the implemented course
spine. These must be reconciled before anyone treats this document as build authority.

| Conflict | Governing decision for reconstruction | Required documentation repair |
| --- | --- | --- |
| The guided Workbench still calls Mission 2 **Hypothesis Forge**. | Curriculum amendment 1 governs: Mission 2 produces a **Market Observation Note**; Mission 9 produces the eventual **Market Belief Statement**. | Replace the stale Mission 2 row and diagram language. |
| The mission curriculum still labels Missions 11–13 gated. | The course data marks all three available with explicit source boundaries, and the mission audits close Gate A later in their files. | Reconcile each mission to one terminal status and link the controlling release evidence. |
| Mission 11 and Mission 13 source-audit headers say Gate A is in progress while their conclusions say closed. | The dated closing decision at the end governs if no later reversal exists. | Update the headers and remove duplicate pending sections. |
| Mission 12's audit contains a stale line implying Session 37 is not reviewed after recording the full review. | The completed review and current EDGAR case set govern. | Remove or annotate the superseded line. |
| Workbench checkpoint `beliefs` now stores an observation before a later belief exists. | Preserve the checkpoint ID for migration; distinguish the two records in visible labels and evidence lineage. | Document the compatibility rule and Mission 9 handoff. |

No learner-facing reconstruction should begin while two documents give different answers to
what a mission produces or whether its source gate is closed.

### 3.1 Persistence and Dossier blockers discovered in the current implementation

Real-case copy cannot simply be dropped into the existing artifact layer. The current data
architecture would mix, omit, or mislabel some of the new evidence.

| Current condition | Why it blocks reconstruction | Required design decision before lesson work |
| --- | --- | --- |
| Only Mandate and Allocation are typed inside `cases.personal` and `cases.practice` in `lib/portfolio-workbench.ts`; the other eleven artifacts live in browser-wide `ops-if-*` records in `lib/if-progress.ts`. | Personal and practice evidence is not isolated for Missions 2–4 and 6–13. | Move or reference every artifact through a case-specific Workbench record without erasing legacy local progress. |
| `recordArtifactCheckpoint` always commits those global artifacts to the **personal** case. | Practice research can advance a personal checkpoint and switching modes can display the same artifact. | Make mode explicit at save time; migrate existing global records as unconfirmed personal evidence and require review. |
| The public `PortfolioDossier.tsx` currently stops after Mission 10. Timing, Holdings, and Operating Plan/IPS are absent. | The learner cannot see the final three artifacts in the promised compiled Dossier. | Add all 13 artifact sections and make Mission 13 compile the same canonical view. |
| Mission 1 appears as both a real Mandate and a global “Investment philosophy draft”; the true Mandate is written inside the Mission 5 journey. | The course cannot show a clear Mission 1 outcome, and the learner meets mandate fields at the wrong time. | Give Mission 1 sole ownership of the Mandate; migrate useful fit/process fields or move them to their actual downstream artifact. |
| Most saved artifacts contain conclusions but no entity/security identity, URL, accession, period, units, as-of date, or retrieval date. | A real case would still become source-less canned prose after save. | Add evidence lineage to the artifact contract before replacing any case. |
| Mission 8 stores `estimatedAnnualDrag` as a decimal fraction, but Missions 11 and 12 divide that raw value as though it were percentage points. | A saved 1.9% drag (`0.019`) can be carried downstream as roughly 0.019%, understating it by 100×. | Define one unit for all stored rates, migrate/validate existing values, and add cross-mission unit tests before rebuilding friction-dependent cases. |

These are reconstruction prerequisites, not optional cleanup. A simplified UI on top of the
current model would still compile mixed personal, practice, canned, and source-less records.

### 3.2 Dependency graph the plan must preserve

The current Workbench invalidation graph is:

```text
M1  ─► M5, M10, M12, M13
M2  ─► M10, M13
M3  ─► M5, M10, M13
M4  ─► M5, M10, M13
M5  ─► M10, M11, M12, M13
M6  ─► M10, M12, M13
M7  ─► M10, M12, M13
M8  ─► M10, M11, M13
M9  ─► M10, M11, M13
M10 ─► M11, M12, M13
M11 ─► M12, M13
M12 ─► M13
```

The real-case schema must preserve those invalidations and add source-freshness triggers. It
must also enforce the approved learner sequence more consistently: today only Missions 5 and
10–13 have explicit coherence prerequisites, so earlier checkpoints can be saved out of order.
A save may preserve work, but it should remain `saved-unverified` until its pedagogical and
coherence prerequisites are satisfied.

## 4. The real-case standard

### 4.1 Two legitimate evidence modes

Every activity must declare one of two modes.

#### Locked specimen

A fixed historical packet used for modeling, guided practice, or assessment.

- The legal entity, security, document, accession, reporting period, event window, data
  convention, calculation, and expected answer are frozen.
- The learner can reproduce the same answer later.
- The outcome is hidden until the source work is complete when hindsight would weaken the
  task.
- A changed current filing does not rewrite the specimen.

#### Dated field investigation

A current lookup used when the learner applies the method to their own Dossier.

- The learner records identity, source, period, units, as-of date, retrieval date, and method.
- OPS grades provenance and reasoning, not a hardcoded live number.
- A different value triggers reconciliation—new filing, restatement, fiscal-calendar
  difference, vendor normalization, TTM versus annual, rounding—not an automatic wrong answer.
- A changed source marks dependent Workbench fields **Review required**.

The locked specimen makes the lesson reproducible. The dated investigation makes the skill
real.

### 4.2 Case admission test

A proposed case is rejected unless all seven answers are yes.

1. **Authentic:** Are the entity, event, security, and documents real?
2. **Primary-first:** Does an issuer, regulator, agency, official filing, or original research
   document control the material fact?
3. **Pinned:** Can OPS identify an exact edition, accession, period, release, or vintage?
4. **Reproducible:** Can another learner follow the steps and get the same result or a valid
   dated result?
5. **Necessary:** Does the case teach a named Dossier field or checkpoint rule?
6. **Transferable:** Does the lesson explicitly state what transfers to an individual investor
   and what does not?
7. **Bounded:** Does it distinguish what the evidence supports, what is merely plausible, and
   what it does not establish?

Fame, a good story, a recognizable investor, or a dramatic return does not pass this test by
itself.

### 4.3 Source hierarchy

Use this hierarchy consistently across all missions.

1. **Controlling finance mechanism:** the locked Damodaran deck, captions, test record, and
   already approved supplemental conceptual sources.
2. **Primary case fact:** SEC filing/XBRL, fund filing, issuer document, regulator, Treasury,
   Federal Reserve Board/FOMC, BLS, BEA, CFPB, IRS, or the institution's own policy.
3. **Original methodology:** the original paper, author, or research publisher, with universe,
   period, denominator, survivorship treatment, limitations, and conflicts retained.
4. **Secondary research surface:** Yahoo Finance or a named market-data/news vendor, used to
   locate, compare, or record market data—not to overrule a filing.
5. **Not evidence:** search snippets, unattributed charts, copied news narratives, AI summaries,
   unsourced screenshots, or a value labeled only “latest.”

### 4.4 When a controlled simulation is still allowed

The aim is not to ban all assumptions. Finance decisions necessarily contain assumptions. The
aim is to stop presenting invented narrative as evidence.

| Allowed controlled element | Why a real historical answer cannot replace it | Required label |
| --- | --- | --- |
| Personal/practice mandate facts | Private household facts should not be harvested, and one real person's circumstances are not a universal starting point. | `Controlled practice dataset` or `Learner-owned fact` |
| Allocation stress losses and loss budget | They are policy assumptions, not forecasts or historical maxima. | `OPS teaching assumption` or `Learner assumption` |
| Valuation bear/base/bull inputs | Value depends on expectations that must remain visible and challengeable. | Owner, date, and thesis trigger for every input |
| Personal spread, tax, impact, and waiting estimates | They depend on account, order, timing, size, and jurisdiction. | `Provisional learner estimate` |
| Future timing and operating scenarios | A policy must work before the future event exists. | `Policy flight test`, never `historical outcome` |
| Transfer assessment with complete facts | Privacy, comparability, and scoring sometimes require a stable dataset. | `Controlled transfer case`; no fictional personality or decorative backstory |

Before retaining one, the team must record why real public evidence cannot do the teaching job.

## 5. A small reusable OPS case spine

Thirteen unrelated “real stories” would still overload a beginner. The reconstructed course
should reuse five core evidence spines plus one historical policy tape.

| Spine | Proposed source-locked cases | Missions | Teaching purpose | Status |
| --- | --- | ---: | --- | --- |
| **A. Public policy** | CalPERS 2024 Total Fund Investment Policy, including objective, ranges, benchmarks, liquidity, and governance | 1, 4, 5, 13 | See what a written mandate and operating policy look like; separate institutional rules from individual transfer | **Candidate; Gate A packet required.** Official policy is public, but the exact sections and permissions still need review. |
| **B. Market observation** | Netflix April 2022; NVIDIA May 2023; GameStop January 2021 | 2, 9, 11 | Distinguish disclosure, expectation, price response, inference, and what a small sample cannot prove | **Already verified for Mission 2.** Reuse requires a new downstream coverage row, not a new story. |
| **C. Security and company investigation** | Berkshire/Protégé zero-coupon Treasury STRIPS; Bed Bath & Beyond 2024 notes and 2023 going-concern/bankruptcy record; Costco FY2025 Form 10-K and dated price checks | 3, 4, 6, 7, 8, 9 | Connect rate/default/residual claims to one real business investigation, cash flow, valuation, cost, and hindsight limits | **Candidate; exact artifact reviews required.** Costco's filing identity is verified; full OPS Gate A review remains open. |
| **D. Active/passive evidence** | Berkshire/Protégé ten-year bet; current locked Morningstar active/passive base-rate packet; one source-audited active fund filing | 8, 9, 10, 11 | Test a claim, charge costs, preserve denominator and horizon, and decide architecture without hero worship | Morningstar is already locked for Mission 10; the other packets require Gate A review. |
| **E. Product implementation** | VTI, VOO, AGG, SGOV, and VTSAX filings and N-PORT records | 8, 10, 12, 13 | Move from a ticker to legal identity, fees, holdings, overlap, source dates, and an order rehearsal | **Already source-audited in Mission 12.** |
| **Supporting historical policy tape** | March 2020 drawdown/recovery and one 2022 rates-and-inflation sequence using licensable originating sources | 11, 13 | Run a rule against information available at the time rather than a tidy invented path | **Candidate; data rights and vintage source must close before use.** |

Initial primary-source anchors for Gate A—not yet permission to copy claims into a lesson:

- [CalPERS investment-policy index](https://www.calpers.ca.gov/investments/about-investment-office/policies)
  and [2024 Total Fund Investment Policy](https://www.calpers.ca.gov/documents/total-fund-investment-policy/download?inline=)
- [Berkshire Hathaway 2017 shareholder letter](https://www.berkshirehathaway.com/letters/2017ltr.pdf)
- Bed Bath & Beyond [November 2022 Form 10-Q, accession 0000886158-23-000026](https://www.sec.gov/Archives/edgar/data/886158/000088615823000026/0000886158-23-000026-index.htm)
  and [April 2023 Chapter 11 Form 8-K, accession 0001193125-23-111754](https://www.sec.gov/Archives/edgar/data/886158/000119312523111754/0001193125-23-111754-index.htm)
- Costco [FY2025 Form 10-K, accession 0000909832-25-000101](https://www.sec.gov/Archives/edgar/data/909832/000090983225000101/0000909832-25-000101-index.htm)
- the existing local [Mission 2 real-case brief](./if-1-1-real-market-cases-design-brief.md)
  and [Mission 12 source audit](../source-audits/mission-12-holdings.md)

### Transfer rule for institutional and famous-investor cases

Every such case must end with two adjacent boxes:

- **What transfers:** objective, horizon, cash obligation, benchmark, decision rule, evidence
  standard, costs, review process, and governance discipline.
- **What does not transfer:** scale, tax status, liquidity access, staffing, asset access,
  regulatory duties, borrowing authority, risk capacity, and the ability to negotiate fees.

OPS must not turn “CalPERS does this” or “Buffett won this bet” into a recommendation. A prior
success is a case record, not proof of universal future success.

## 6. Mission-by-mission reconstruction

### Mission 1 — Define your investor mandate

**Current problem:** the learner is asked to produce personal constraints while the main model
is a named fictional learner. The empty personal form arrives before the learner has seen a
real completed mandate.

**Reconstruction:** use the CalPERS policy as the completed specimen. The task is not to copy
its allocation. The learner locates the fund's purpose, obligations, liquidity rule, allocation
ranges, benchmarks, and decision authority, then identifies why an institutional mandate is
coherent for its owner.

**Reproducible assignment:** “Open the policy. Find one sentence that states a cash/liquidity
obligation, one that constrains allocation, and one that assigns review authority. Record the
section/page and explain which individual-investor field each resembles.”

**Dossier destination:** `goal`, `targetDate`, `horizon`, `contributionPlan`,
`plannedWithdrawals`, `nearTermCashNeeds`, reserve status, capacity for loss, willingness for
loss, readiness route, and deployment actions.

**Blank-space protection:** show a completed institutional excerpt and its translated Dossier
excerpt first. Then ask one bounded question at a time. For personal mode, offer ranges and “I
do not know yet.” For practice mode, replace the Mina narrative with either a consented,
anonymized real mandate or a plainly labeled **Practice Mandate P-01** dataset with no invented
personality.

**Boundary:** public-policy discipline transfers; CalPERS weights, liquidity access, governance,
and risk capacity do not.

### Mission 2 — Observe what markets actually do

**Current problem:** the curriculum amendment is correct, but the live lesson and guided
Workbench authority have not fully caught up. The old early-belief path must not survive in a
parallel component.

**Reconstruction:** implement the already verified Netflix, NVIDIA, and GameStop packets from
`docs/lesson-plans/if-1-1-real-market-cases-design-brief.md`.

**Sequence:**

1. model Netflix: actual versus management guidance, then reveal the price-response band;
2. guide NVIDIA: current results versus forward outlook, with price hidden until the learner
   identifies the expectation-changing line;
3. transfer to GameStop: separate price/volume/attention facts from unsupported causal claims;
4. explicitly decline to generalize from three cases; and
5. save a narrow observation, uncertainty, and next-evidence requirement.

**Dossier destination:** `caseId`, `disclosure`, `priceResponse`, `interpretation`,
`uncertainty`, `nextEvidence`, and `declinedToGeneralise` in the Market Observation Note.

**Reproducible assignment:** open the exact SEC filing or regulator report; find the specified
line; classify it as result, condition, or expectation; record what the subsequent price move
does and does not establish.

**Boundary:** Mission 2 cannot save a market belief, strategy, or hindsight trade. Mission 9
must visibly import this note and finish the belief handoff.

### Mission 3 — Price the risk in a bond

**Current problem:** Northstar Transit makes every bond fact conveniently available, but the
learner never handles a real security identity or sees how a promise and a deteriorating issuer
appear in public records.

**Reconstruction:** use two real claims.

- **Rate-risk model:** the zero-coupon Treasury STRIPS used in the Berkshire/Protégé wager.
  The official Berkshire record supplies purchase cost, face value, original yield, later
  market value, and later yield. The learner reconstructs why a long zero-coupon claim moved
  when yields changed.
- **Default-risk investigation:** Bed Bath & Beyond's 3.749% senior notes due 2024. Freeze the
  original note identity, then reveal the November 2022 Form 10-Q's negative operating cash
  flow, liquidity warning, covenant/default facts, failed exchange record, and later Chapter 11
  filing in stages.

**Reproducible assignment:** identify issuer, coupon, maturity, priority, and payment promise;
calculate one simplified duration/price response with visible assumptions; then cite two filing
facts that change default risk. Hide the bankruptcy outcome until the evidence decision is
saved.

**Dossier destination:** `paymentPromise`, `rateRisk`, `durationFinding`, `defaultEvidence`,
and `pricingDecision`.

**Boundary:** a Treasury claim models rate sensitivity, not personal suitability; a bankruptcy
outcome does not prove the warning was perfectly priced. Historical spread/rating tables stay
dated, and any synthetic rating remains table-, date-, and size-dependent.

### Mission 4 — Set your equity risk policy

**Current problem:** Northstar, Harbor Grocery, and the scholarship fund make the examples easy
to control but abstract the core point: the same public evidence means something different to
a creditor, a residual claimant, and a diversified portfolio owner.

**Reconstruction:**

- retain the real Amgen regression from the locked Session 3 source as the beta model;
- use Bed Bath & Beyond's capital-structure outcome to show residual-claim risk after the bond
  investigation;
- use Costco's actual 10-K risk factors, low-margin operating model, membership economics,
  leases, and geographic/operational exposures for fundamental-driver guided practice; and
- use the CalPERS mandate only to model portfolio context and the limit of a stand-alone risk
  measure.

**Reproducible assignment:** find two risk factors and one balance-sheet or income-statement
fact in the exact 10-K; classify each as product demand, operating leverage, financial leverage,
or portfolio-context risk. If Yahoo supplies a beta, record its label/date as a secondary
estimate and run a sensitivity range rather than treating it as a fact.

**Dossier destination:** `riskDefinition`, `portfolioContext`, `betaInterpretation`,
`fundamentalDrivers`, `methodStack`, `priceRule`, `decision`, and `remainingUncertainty`.

**Boundary:** beta is an estimated historical relationship, not total risk or a forecast.
Institutional diversification does not supply the learner's required return.

### Mission 5 — Set allocation and risk limits

**Current problem:** Mina's complete fictional policy is doing both the modeling and the
application work. The controlled stress arithmetic is useful, but the narrative makes the
whole allocation feel invented.

**Reconstruction:** show the CalPERS policy's targets, ranges, liquidity reserve, benchmarks,
and rebalance governance as the real model. Optionally compare one source-audited target-date
fund glide path to show that horizon and obligation change a policy. Then move to the learner's
own or Practice Mandate P-01 facts.

**Reproducible assignment:** reproduce the public policy's weights and verify they total 100%;
locate a range and the rule that applies after a breach; identify a liquidity obligation; then
state why the institution's answer cannot be imported into the learner's mandate.

**Dossier destination:** reference amount, near-term need, sleeve roles and ranges, stress
scenario, loss budget, candidate loss contribution, mandate rationale, and goal-impact
acknowledgment.

**Controlled component retained:** the stress losses, maximum acceptable loss, and candidate
ceiling remain learner/OPS assumptions. They are necessary policy inputs. The interface must
show the owner beside every number and never call the result a forecast, VaR, maximum drawdown,
or regulator-approved cap.

**Blank-space protection:** start with a real policy extract, then a fully worked `weight ×
assumed loss` specimen, then a guided repair. The learner sees a prefilled sentence—“This sleeve
exists to ___; its range is ___ because ___”—rather than an empty policy essay.

### Mission 6 — Read the business evidence

**Current problem:** Cedar Works reconciles perfectly because OPS invented every line. It teaches
mechanics, but it never proves the learner can navigate a filing, distinguish reported from
calculated facts, or reconcile a vendor display.

**Reconstruction:** replace Cedar Works as the evidence spine with Costco's FY2025 Form 10-K,
accession `0000909832-25-000101`. Costco is a candidate because the customer-to-membership-to-
retail-margin money machine is understandable and its filing contains operations, risks,
financial statements, leases, cash flow, and XBRL.

The miniature transaction sandbox may remain for one purpose only: demonstrating how one
transaction connects the statements. It must be labeled **mechanism sandbox**, not company
evidence, and it must not populate the Dossier.

**SEC assignment:**

1. search EDGAR by legal company name or ticker;
2. filter to 10-K and open the pinned accession;
3. record fiscal year-end, filing date, units, and audited/unaudited status;
4. find revenue, operating income, net income, cash from operations, capital expenditures, and
   one debt/lease fact;
5. trace one operating event through income, balance sheet, and cash flow; and
6. record one question the statements cannot answer.

**Yahoo reconciliation assignment:** manually find annual revenue or operating cash flow on
Yahoo Finance, record Yahoo's label, units, period, and retrieval date, then reconcile it to the
exact 10-K/XBRL fact. Valid explanations include rounding, normalization, fiscal timing, annual
versus TTM, and metric definition. The filing controls.

**Dossier destination:** `statementMap`, `balanceSheetFinding`, `financialRecast`,
`profitabilityFinding`, `adjustmentFinding`, `cashFlowFinding`, `decision`, and
`remainingQuestion`, with source lineage attached.

**Boundary:** reported accounting, analyst recast, and learner inference must remain three
visibly different evidence types.

### Mission 7 — Estimate value and a decision range

**Current problem:** the current $1.1 billion company and all scenarios are OPS inventions. The
finance is internally checked, but the learner cannot reproduce the starting facts or see where
filing evidence ends and valuation judgment begins.

**Reconstruction:** continue the pinned Costco investigation at a fixed historical information
date. Freeze the 10-K, shares, debt/cash convention, and a documented market-price observation.
Build bear/base/bull assumptions from only the evidence then available. Hide later returns.

**Reproducible assignment:** re-derive one no-growth or growth-with-reinvestment value from the
visible inputs; change return on capital or required return; identify which assumption moves the
range and why; compare the result with a dated price only after assumptions are complete.

**Dossier destination:** `claim`, `method`, `requiredReturn`, `lowValue`, `baseValue`,
`highValue`, `observedPrice`, `decisionBuffer`, `buyBelow`, `decision`, `relativeCheck`, and
`evidenceTriggers`.

**Controlled component retained:** forecasts, scenario ranges, and the action buffer remain
OPS/learner assumptions. Every one needs an owner, as-of date, and falsifying evidence trigger.

**Boundary:** a worked historical range is not a current valuation or recommendation. A good
business and a good investment price are separate findings. Relative and intrinsic checks may
disagree.

### Mission 8 — Count the friction

**Current problem:** the lesson's percentages are transparent OPS assumptions, but the learner
mostly selects invented cost bands rather than inspecting a real fee table, turnover definition,
or market quote.

**Reconstruction:** combine three real records.

- The Berkshire/Protégé bet models layered fees and the difference between gross effort and
  net investor outcome.
- The VTI/VTSAX same-series records show real product/share-class identity and cost/access
  differences without inventing two products.
- VTI, AGG, and SGOV prospectuses show reported fees, cost examples, and turnover definitions;
  the SGOV turnover finding demonstrates why a reported 0% can be true by construction.

**Reproducible assignment:** locate the fee table, cost example, and turnover definition in an
exact filing; compute one annualized hurdle and one round-trip spread treatment; record a
same-time bid/ask observation manually from an approved secondary surface if available, with
timestamp and delayed-data warning.

**Dossier destination:** `turnoverExpectation`, `spreadClass`, `priceImpactExposure`,
`waitingSensitivity`, `taxSetting`, `estimatedAnnualDrag`, and `hurdleRule`.

**Controlled component retained:** a learner's future spread, impact, waiting, tax, and turnover
drag are provisional estimates. Validate the method and provenance, not an exact live answer.

**Boundary:** no mandatory task may depend on a live quote or third-party login. Filing-based
fallbacks remain available. Mission 8 does not calculate personal tax liability.

### Mission 9 — Judge a market-beating claim

**Current problem:** the lesson uses real historical studies but still feels detached from the
learner's early observations and later architecture. The belief amendment is not yet complete.

**Reconstruction:** use the Berkshire/Protégé wager as a fully specified real test-design
autopsy: claim, benchmark, horizon, competing portfolios, net-of-fee outcome, and limitations.
Do not present a participant's account as neutral proof; record the hidden fund identities,
selection, one-period nature, and participant perspective. Keep the source-authentic option-
listing and low-P/E studies as supporting cases where their dated scope is explicit.

Then import the Mission 2 Market Observation Note. The learner must decide what larger sample,
benchmark, risk adjustment, holdout, friction treatment, and abandon rule would be needed before
turning that observation into a belief.

**Reproducible assignment:** complete the evidence checklist against the real wager or study;
then rewrite one Mission 2 inference into a falsifiable belief—or explicitly state that the
evidence still does not support one.

**Dossier destination:** `benchmark`, `testDesign`, `holdoutRule`, `samplingRule`, `hurdleRule`,
`abandonRule`, plus the Market Belief Statement's `marketBelief`, `persistenceReason`,
`evidenceGap`, and summary.

**Boundary:** the 3% risk-free number may not remain a context-free illustrative fact. A fixed
specimen must use a dated primary rate; a live investigation records the rate source and date.
A single famous winning bet does not prove all passive choices beat all active choices.

### Mission 10 — Choose passive, or prove an edge

**Current problem:** the current active proposal comes from a fictional friend. It is easy to
reject because OPS controls every missing field; the learner does not have to distinguish a
real fund's stated process from evidence that the process produces investable edge.

**Reconstruction:** preserve the current, dated Morningstar Active/Passive Barometer packet and
its denominator, category, horizon, survivorship handling, and limitations. Replace the friend
with one source-audited public active-fund filing. ARK Innovation ETF is a candidate, not an
approved selection; Gate A must confirm the exact current prospectus/shareholder report and
whether its language creates a fair beginner case.

The task is not “Did this fund win?” It is:

1. What exposure and benchmark are relevant?
2. What does the filing say the process is?
3. Who or what must be wrong for the process to add value?
4. What correction mechanism and capability are claimed?
5. What evidence would disconfirm it?
6. Does the claim survive the Mission 8 friction and Mission 9 evidence rules?
7. What maximum allocation fits Mission 5's loss budget?

**Dossier destination:** passive-only or active-sleeve `mode`, `coreExposure`,
`coreBenchmark`, dated `baseRate` and scope, and—only for a licensed sleeve—`pocket`,
`whoIsWrong`, `correctionMechanism`, `capability`, `falsifiableClaim`, `disconfirming`,
`evidenceDesign`, gross/friction/net edge, maximum weight, loss contribution, durability risk,
thesis break, and review date.

**Boundary:** passive-only is a complete outcome. A prospectus proves what a fund says it will
do, not that it has an edge. Current manager-persistence evidence remains outside the lesson
under the approved source narrowing until its canonical artifact passes OPS review.

### Mission 11 — Set a market-timing policy

**Current problem:** the Missing-Time Timeline is explicitly illustrative. It teaches the
two-decision problem but gives the learner no real dated information set to inspect.

**Reconstruction:** replace the invented path with a fixed historical policy tape, proposed as
March 2020 and its subsequent recovery, plus a 2022 rates/inflation countercase. Each frame must
show only what was publicly known at that date: issuer/event disclosure, Treasury or originating
agency data, release date, and the price/return convention. Later revisions and outcomes stay
hidden until the learner commits the next action.

**Reproducible assignment:** write the signal and action using the first vintage; reveal the next
dated event; charge the saved Mission 8 friction; require a re-entry decision; compare with the
learner's strategic policy. Then write either no timing or a bounded rule.

**Dossier destination:** `mode`, `reason`, and, for bounded timing, `signal`, `benchmark`,
`maxDeviationPct`, `eligibleSleeve`, `expiryDate`, `falsifier`, `reviewDate`, and imported
`frictionCostPct`.

**Boundary:** the historical tape is not a current signal. OPS must resolve price-data rights,
adjustment conventions, and macro vintages before Gate A closes. FRED may be a learner link-out,
but originating Treasury, BLS, BEA, and Federal Reserve Board sources are preferred for cached
course artifacts. No “wait until it feels safe” state and no beginner speculative sleeve.

### Mission 12 — Choose the actual holdings

**Current problem:** this mission is the strongest existing model for the reconstruction and
should not be replaced. Its main opportunity is to export its source discipline to Missions
1–11.

**Retain:** the audited VTI, VOO, AGG, SGOV, and VTSAX records; CIK → registrant → series →
class/ticker identity; exact 497K/485BPOS and N-PORT accessions; holdings dates; turnover
definitions; replication differences; VTI/VOO overlap; instrument-versus-issuer identity;
staleness; and the non-transmitting order draft.

**Strengthen:** make the learner perform at least one direct EDGAR lookup rather than only read
an OPS-rendered extract. Provide exact lookup steps and a static fallback. Carry the source
record directly into the Holdings Slate.

**Dossier destination:** each line's ticker, series ID, class ID, sleeve, and target weight;
issuer-key mode; overlap and staleness acknowledgments; and order-draft identity, direction,
amount, type, friction, and `transmitted: false`.

**Boundary:** no product ranking, suitability score, or order transmission. A prospectus says
what is permitted; N-PORT shows one dated observed portfolio. Bid/ask and premium/discount stay
qualitative when no approved source supplies a figure.

### Mission 13 — Write the rules and defend the portfolio

**Current problem:** the compiler is correctly designed, but the nine flight-test prompts are
mostly generic hypotheticals and the page risks feeling like another large form after twelve
missions.

**Reconstruction:** preserve the compiler: it must assemble prior work rather than re-ask it.
Model a real operating policy with the CalPERS liquidity/range/review clauses and the official
Investor.gov rebalancing methods, then explicitly adapt governance to a solo investor.

Split the flight test by evidence type:

- **Historical replay:** the market-crash scenario uses the same source-locked March 2020 tape
  from Mission 11; a product-change or stale-data scenario uses an actual Mission 12 filing
  change/date.
- **Learner-owned contingency:** income stops, urgent cash need, contribution, and mandate
  change remain controlled future events because the point is to test the learner's policy.
- **Evidence-expiry test:** thesis break, stale holdings, and edge-license review reuse the exact
  Dossier evidence and dates rather than generic prose.

**Dossier destination:** `reviewProcess`, rebalance trigger/cadence-or-band/method,
`contributionRule`, `withdrawalRule`, `sellReplaceRule`, `thesisBreakRule`, nine structured
scenario responses, transfer result, and critical failures.

**Blank-space protection:** show the compiled twelve-mission Dossier before asking for the two
genuinely new IPS elements. Each scenario asks only action, controlling rule, affected field,
and evidence that would change the answer. No final blank essay.

**Boundary:** policy silence is a valid finding and routes to repair. Any critical safety error
blocks graduation regardless of score. Personal tax remains a directional warning with current
IRS pointers, not a calculation.

## 7. Mandatory research assignments

### 7.1 SEC filing investigation pattern

Every issuer or fund mission should use the same seven-step skill so the learner becomes faster
rather than learning a new interface each time.

1. **Identify:** legal entity, ticker/security, CIK, and—for funds—series and class.
2. **Filter:** choose the form and date range.
3. **Pin:** record accession, filing date, reporting period, and exact document.
4. **Find:** search for a section, label, or XBRL concept—not a trivia fact.
5. **Record:** value, unit, scale, period, audited status, and page/section.
6. **Interpret:** state what the fact supports and what it does not establish.
7. **Route:** save it into the named Dossier field with a review trigger.

Suggested progression:

| Mission | Filing task | What is assessed |
| ---: | --- | --- |
| 2 | Find guidance/result lines in a pinned 8-K exhibit | Result versus expectation; causal restraint |
| 3 | Find note terms and going-concern/default evidence | Security promise versus issuer capacity |
| 4 | Find risk factors and one leverage/operating fact | Fundamental risk classification |
| 6 | Reconcile three statements and one XBRL fact | Identity, period, units, cash-flow linkage |
| 7 | Carry exact filing inputs into a valuation | Fact versus assumption; formula lineage |
| 8 | Find fee, cost-example, and turnover language | Definition and cost method |
| 10 | Find an active fund's stated strategy and risks | Stated process versus demonstrated edge |
| 12 | Resolve registrant → series → class and N-PORT date | Exact product identity, staleness, overlap |
| 13 | Detect whether a source date or material fact has changed | Review-required behavior |

Mandatory assignments must always have a no-account primary-source path and a minimal static
fallback so an outage, geography restriction, or site redesign cannot prevent completion. OPS
grades the evidence record, never success at navigating a third-party site.

### 7.2 Yahoo Finance reconciliation pattern

Yahoo Finance is a useful beginner research surface, but it is not a controlling OPS source.
Its official help says financial statements and valuation data are supplied by Morningstar and
provided as-is. Its terms restrict automated collection and redistribution. Therefore:

- use Yahoo only as a human-operated link-out;
- do not scrape, cache, embed, or republish its tables or screenshots;
- do not require a paid feature or account;
- do not use it as the answer key;
- record the displayed label, units, period, and retrieval date; and
- reconcile the value against the exact filing before saving it as evidence.

The repeated prompt should be:

> Find the metric on Yahoo Finance. Record exactly what Yahoo calls it, its period, units,
> and today's retrieval date. Then find the corresponding line in the pinned filing. If they
> differ, explain whether the cause is rounding, normalization, fiscal timing, TTM versus
> annual presentation, or a different definition. The filing controls the reported fact.

Good Mission 6 metrics are annual revenue, operating income, net income, cash from operations,
cash, and debt. Valuation ratios and beta may be recorded only as dated secondary estimates.

Official boundaries:

- [Yahoo Finance financial-data help](https://help.yahoo.com/kb/finance/SLN2310.html)
- [Yahoo terms](https://legal.yahoo.com/xw/en/yahoo/terms/otos/index.html)

## 8. The Dossier must stop being a blank page

### 8.1 One evidence-to-field contract

Every field displayed to the learner should carry this small contract:

| Element | Learner sees | Stored meaning |
| --- | --- | --- |
| Example | One completed sentence from the real case | Shape and quality bar, never copied as learner policy |
| Evidence | One to three selected facts with source badge | Provenance attached to the field |
| Prompt | A sentence stem or bounded choice | Decision, not recollection |
| Uncertainty | One explicit unknown | Prevents false completeness |
| Review trigger | What new fact would reopen the field | Dependency and freshness behavior |
| Preview | The exact Dossier sentence being built | No surprise at Mission 13 |

### 8.2 Three evidence badges only

Use the same visible ownership language everywhere:

- **Primary source**
- **Secondary check**
- **OPS/learner assumption**

The underlying source record may be detailed. The learner should not have to interpret a new
taxonomy in every mission.

### 8.3 Field scaffolding rules

- Never open a mission with a large empty textarea.
- A new term is defined before the learner is asked to use it.
- The first actionable control appears within half a viewport.
- A free-response field appears only after the learner has selected or reproduced supporting
  evidence.
- Prefer one claim, one reason, one uncertainty, and one review trigger over an essay.
- Supply “I do not know yet” when uncertainty is a legitimate state; route it to evidence or a
  practice path.
- Show the completed real-case Dossier excerpt next to the learner's in-progress excerpt.
- Carry identity, citation, period, and units forward automatically; do not make the learner
  retype them.
- When an upstream value changes, mark downstream fields **Review required** and show why. Do
  not silently recompute a new approved decision.

### 8.4 Practice mode

Practice mode remains necessary and equal. It should no longer feel like a collection of
invented characters.

- Use the same real market, issuer, and product evidence as personal mode.
- Supply a stable **Practice Mandate P-01** only for personal facts that cannot ethically or
  reproducibly come from a public case.
- Give it a data dictionary, version, owner, and reason each field exists.
- Remove decorative biography that does not affect a decision.
- Keep conceptual work, independent transfer, and capstone standards identical.
- Never imply the learner has authority to act for the practice case.

## 9. Canonical reproducibility packet

Every approved case needs a machine-readable record and a human-readable audit. The record
should contain at least:

```text
caseId
missionIds
pedagogicalJob
dossierDestination
mode: locked-snapshot | live-fieldwork

entityLegalName
securityName / ticker
CIK
fundRegistrant / seriesId / classId (when applicable)

sourceTier
publisher
title
form
accession
documentName
canonicalUrl
filingOrReleaseDate
reportingPeriod
eventTimestampAndTimeZone
page / section / XBRL concept

retrievalDate
canonicalArtifactHash
jurisdiction
decayClass
accessOrLicenseConstraint
fallback

metricLabel
value
unitAndScale
instantOrDuration
annual / quarterly / TTM
auditedOrUnaudited
priceAdjustmentConvention
formulaAndTransformations
roundingAndTolerance

supports
plausibleButUnproved
doesNotEstablish
learnerLookupSteps
validationRule
expectedOutput
reviewTrigger
```

Fund packets also record prospectus and N-PORT accessions, holdings `repPdDate`, staleness,
reported-weight sum, unmatched share, issuer identity rule, and permitted-versus-observed facts.
Macro packets record originating agency/table/series, observation period, release date, vintage,
frequency, units, seasonal adjustment, and revision status.

### SEC implementation boundary for the later build

SEC submissions and Company Facts endpoints do not require an API key and update throughout the
day, but `data.sec.gov` does not support browser CORS. Any automated future OPS retrieval needs a
server-side or build-time cache, a truthful contact-bearing User-Agent, fair-access controls,
pinned accessions for fixed cases, and review of custom XBRL tags, units, and contexts.

Official reference: [SEC EDGAR APIs](https://www.sec.gov/search-filings/edgar-application-programming-interfaces)

### Market and macro data boundary

Publicly visible does not mean licensed for redistribution. For fixed course packets, prefer
originating agencies such as Treasury, BLS, BEA, and the Federal Reserve Board. Use FRED/ALFRED
as link-out/discovery surfaces only until storage, API, and third-party rights are cleared. A
price case must state trading session, split/dividend convention, and whether it uses price or
total return. If a primary exact price is unavailable, use a sourced magnitude band rather than
inventing precision.

## 10. Content reconstruction work plan

### Phase 0 — Reconcile authority

Deliverables:

- one authoritative row per mission;
- one terminal source/release status per mission;
- corrected Mission 2/Mission 9 artifact handoff;
- a crosswalk from legacy artifact keys to the current Workbench; and
- explicit superseded markers instead of contradictory prose;
- a decision to make all 13 artifacts case-specific;
- a complete 13-section Dossier contract;
- one stored-rate unit and a repair/test plan for the Mission 8 → Missions 11/12 friction
  conversion; and
- Mission 1 ownership of the actual Mandate rather than deferral into Mission 5.

Exit criterion: a reviewer can answer what each mission produces and whether it is buildable by
reading one linked authority chain.

### Phase 1 — Complete the hypothetical inventory

For every existing scene, prompt, chart, number, and assessment item, record:

- mission and lesson;
- current case/name;
- teaching job;
- source-authentic, real case, mechanism sandbox, OPS assumption, or decorative fiction;
- Dossier field served;
- keep, replace, merge, or remove decision; and
- upstream/downstream checkpoint effect.

Exit criterion: no invented element survives merely because it is already implemented.

### Phase 2 — Lock the shared case packets

Work in this order:

1. reuse and package Mission 2's already verified Netflix/NVIDIA/GameStop sources;
2. reuse and package Mission 12's audited fund records;
3. audit CalPERS 2024 policy;
4. audit Berkshire/Protégé Treasury and active/passive records with an independent-perspective
   limitation;
5. audit the Bed Bath & Beyond note/going-concern/bankruptcy sequence;
6. audit Costco FY2025 filing, XBRL contexts, and a licensable dated price source;
7. select and audit one public active-fund filing for Mission 10; and
8. resolve the historical timing tape's data/vintage rights.

Exit criterion: each approved case has a complete reproducibility packet, coverage matrix,
independently checked calculation, and allowed-use decision.

### Phase 3 — Freeze the Dossier field contracts

Before rewriting content:

- map every case fact and activity to the exact current artifact field;
- add evidence lineage, uncertainty, and review trigger to the design contract;
- decide how Mission 2 observation and Mission 9 belief coexist under the stable `beliefs`
  checkpoint ID;
- preserve legacy completion slugs and local saved progress;
- specify personal/practice separation; and
- define which changes invalidate downstream work;
- persist exact case/source identity rather than saving only the resulting prose;
- expose Timing, Holdings, and Operating Plan in the same compiled Dossier; and
- add unit-aware migration and validation for all stored percentages and decimal fractions.

Exit criterion: no mission contains an activity without a field destination, and no required
Dossier field appears for the first time as a blank in Mission 13.

### Phase 4 — Rebuild content in dependency-safe waves

#### Wave A — Learner entry and evidence posture

Missions 1, 2, 5, and 9.

This wave fixes the earliest blank-page problem, implements observation-before-belief, replaces
the dominant fictional mandate model, and closes the Mission 2 → Mission 9 handoff. Mission 2
and Mission 9 ship together or remain behind the same release boundary.

#### Wave B — Security investigation

Missions 3, 4, 6, 7, and 8.

Replace Northstar/Cedar Works as evidence spines; preserve only labeled mechanism sandboxes and
assumptions. Test the complete path from security promise and shareholder risk through 10-K,
cash flow, valuation, and friction.

#### Wave C — Architecture and timing

Missions 10 and 11.

Replace the fictional active proposal, connect the real base rate to the saved evidence and
friction rules, and replace the invented timing path with a source-locked historical tape.

#### Wave D — Products and operating plan

Missions 12 and 13.

Preserve Mission 12's verified case, export its filing discipline, then compile all prior
evidence into the IPS and run mixed historical/controlled flight tests.

Each wave repeats OPS Gates A–F. Passing source integrity in an earlier version does not approve
new company facts, current prices, or a new assessment.

### Phase 5 — Course-level mastery audit

Run the complete course from a fresh Workbench in both personal and practice modes. For every
assessed idea, record where it was introduced, modeled, guided, independently applied, and
saved. Confirm:

- all 13 checkpoints can become coherent;
- every upstream edit creates the correct review-required state;
- research-only candidates cannot skip architecture or holdings gates;
- Mission 13 compiles rather than re-asks;
- all live investigations have a fallback;
- all fixed answers reproduce within tolerance; and
- practice-complete and execute-ready remain distinct.

## 11. UI simplification phase — after content stabilizes

This phase is deliberately second. Simplifying the current UI before deciding which evidence
and decisions survive would polish the wrong structure.

### 11.1 One repeated shell

Every mission should use the same four states:

1. **Example:** completed real-case evidence and resulting Dossier excerpt.
2. **Investigate:** one source, one target, two to four find prompts.
3. **Reproduce:** structured value/label/unit/period/source fields with reconciliation feedback.
4. **Apply & Save:** prefilled learner Dossier excerpt; edit only the decision, uncertainty, and
   review trigger.

Desktop places the source on the left and current Dossier field on the right. Mobile presents
the same states sequentially. Source metadata lives behind a disclosure; identity and as-of date
remain visible.

### 11.2 Simplification rules

- One decision per screen and no stage over 1.5 viewports at 1440×900.
- One page hero; no component hero that restates it.
- One primary action at a time.
- No generic card grid when a filing, timeline, cash-flow scan, or policy comparison carries the
  concept better.
- Keep mission-native visuals—filing scanner, cash-flow timeline, valuation gravity, overlap
  X-ray—but place them inside the same cognitive shell.
- Replace large instruction blocks with a short task line and optional evidence drawer.
- Keep progress as Dossier fields completed, not scenes visited.
- Show only the current field and the two immediately relevant dependencies; the full Dossier
  remains available on demand.
- Preserve reduced motion, keyboard access, 44-pixel targets, semantic controls, and the six OPS
  widths: 390, 768, 1024, 1280, 1440, and 1920.

### 11.3 What not to do

- Do not turn 13 missions into one uniform worksheet.
- Do not hide source identity to make a screen look cleaner.
- Do not add a live market dashboard whose data is not needed for the decision.
- Do not replace a large blank textarea with several smaller blank textareas.
- Do not use completion animations as a substitute for evidence feedback.
- Do not widen a tall page and call it simplified.

## 12. Acceptance criteria

The reconstruction is ready for stakeholder sign-off only when all of the following are true.

### Course coherence

- The 13 mission decisions and artifacts remain intact.
- Mission 2 produces observation; Mission 9 produces evidence checklist and belief.
- Every activity names a Dossier destination.
- Every Dossier field is modeled before independent entry.
- Mission 13 asks only for genuinely new operating rules and transfer decisions.

### Case quality

- Every evidence case passes the seven-part admission test.
- Every locked case has exact source identity and reproducible calculations.
- Every live investigation grades provenance and reasoning rather than a stale number.
- Famous investors and institutions carry explicit transfer limits.
- Success cases include limitations or countercases; no survivorship or hindsight narrative is
  presented as a law.
- Remaining simulations have a recorded necessity and visible assumption owner.

### Source integrity

- Every new claim appears in a mission coverage matrix with prerequisite and assessment use.
- Source-authentic content and OPS adaptations are visibly separated.
- SEC, fund, macro, and price records carry exact dates and identity.
- Yahoo is secondary reconciliation only and is not scraped or redistributed.
- Licensing, caching, staleness, vintage, and price-adjustment rules are resolved or the claim is
  narrowed.

### Learner usability

- No mission begins with a large blank field.
- The learner can see a finished case excerpt before creating their own.
- The first action is available within half a viewport.
- Unknown is an allowed state when evidence is insufficient.
- Personal and practice paths meet the same skill standard.
- A third-party outage cannot block required course completion.

### Release

- Fresh-state personal and practice journeys pass end to end.
- Dependencies and review-required states behave correctly.
- Calculations are independently verified.
- Functional, accessibility, responsive, theme, and visual gates pass separately.
- Screen budgets are measured at all six required widths and reported in screens.

## 13. Decisions required from the stakeholder

The plan can proceed through source auditing without these choices, but implementation should
not begin until they are resolved.

1. Approve the five-spine model and the principle that some clearly labeled controlled policy
   scenarios remain.
2. Approve CalPERS as the proposed recurring public-policy case, subject to Gate A.
3. Approve Costco FY2025 as the proposed company-investigation spine, subject to Gate A.
4. Approve the Berkshire/Protégé and Bed Bath & Beyond records as proposed success/failure
   cases, subject to source and framing review.
5. Decide whether OPS should seek a consented anonymized individual mandate or use the neutral
   Practice Mandate P-01 dataset.
6. Approve selecting one real active fund for Mission 10 only after an explicit fairness and
   source audit; the plan does not yet approve ARKK or any other product.
7. Approve keeping UI simplification as a separate phase after content and Dossier contracts
   are stable.

## 14. Immediate next deliverables after approval

No lesson code should be the first deliverable. The next artifacts should be:

1. authority/status reconciliation patch;
2. complete 13-mission hypothetical inventory;
3. reusable case registry with proposed/verified/rejected states;
4. Gate A audits for CalPERS, Berkshire/Protégé, Bed Bath & Beyond, Costco, the active-fund
   candidate, and the historical timing tape;
5. exact mission-to-Dossier field and evidence-lineage schema;
6. rewritten mission plans and assessment maps; and only then
7. implementation briefs for each dependency-safe wave.

That order prevents another cycle in which a polished interaction is later discovered to teach
the wrong case, write to the wrong artifact, or rely on evidence OPS cannot reproduce.
