# Lesson 1.1 redesign brief: Observe the market before forming a belief

Status: **Approved direction — implementation scheduled after the mission review pass**

Target: Investment Foundations, Lesson 1.1, *Philosophy Before Strategy*

Amended 2026-08-24 after review against the approved mission curriculum and the live
Workbench spine. Four changes, recorded here rather than silently applied:

1. **The artifact question is answered.** The first draft moved the belief out of 1.1
   without naming where it went, which would have left Mission 2 producing nothing.
   See *OPS curriculum role*.
2. **Sessions 22 and 25 are removed.** Curriculum §5 assigns them to the Information
   trading investigation, opened from Mission 10. Sessions 1, 7, 8 and 38 carry the
   argument without reaching into the optional catalogue.
3. **The market-reaction citations are relabelled.** Two links presented as Reuters
   resolve to Investing.com.
4. **The screen-budget claim is demoted to a measurement task.** No lesson in the
   course currently meets that limit; asserting it here would be a claim, not a fact.

## Verification status, 2026-08-24

Gate A is partly closed. What was checked, against what, and what remains open:

| Claim group | Status | Checked against |
| --- | --- | --- |
| Netflix: revenue $7,868M, +9.8% Y/Y, memberships 221.64M, net adds −0.20M, Q2 forecast −2.00M, "revenue growth has slowed considerably" | **Verified** | Netflix Q1 2022 shareholder letter, dated April 19, 2022, page 1 summary table and opening paragraph |
| NVIDIA: revenue $7.19B, −13% Y/Y, +19% Q/Q, record Data Center $4.28B, Q2 outlook $11.00B ±2% | **Verified** | NVIDIA's own Q1 FY2024 results release |
| Netflix's and NVIDIA's one-day price reactions | **Stated as bands, decided 2026-08-24** | No exchange-published archive is reachable; see *Price reactions are stated as bands* |
| GameStop: all prices, dates and the causal-restraint reading | **Not verified** | SEC staff report not retrievable — see below |

Two corrections from the verification:

- Netflix's own label is **"Global Streaming Paid Memberships"**, not "global paid
  memberships". The letter's table note reads "Figures are consolidated, including DVD",
  so the membership line is specifically streaming. Use the source's wording.
- NVIDIA's release states revenue as **$7.19 billion**. The brief's $7.192 billion is
  more precise than the cited source; either cite the financial statements for the extra
  digit or match the release.

### Price reactions are stated as bands

Decided 2026-08-24, after five access routes were tried. No exchange-published archive of
2022–2023 daily closes is reachable: the SEC serves no price data, Nasdaq's own endpoint
returns records only for a recent window, Stooq sits behind a bot check that must not be
bypassed, and Yahoo refuses automated requests. Every remaining route is a secondary
aggregator of the same tier as the news article the brief originally cited, so fetching one
would add a second copy of the same evidence grade rather than raise it.

The precise percentage is not load-bearing. This brief already forbids any causal claim
resting on the size of the one-day move, and its own NVIDIA sequence lists "whether the
price move was too large or too small" among the things the learner cannot know. A figure
the lesson is not allowed to reason from does not need decimal precision it cannot source.

**Convention:** state the direction and a magnitude band — "fell by roughly a third",
"rose by roughly a quarter" — cited to a named market-data vendor with a retrieval date.
Bands also survive stock splits, which raw prices do not; Netflix has split since the April
2022 event, so a split-unaware price comparison would be wrong as well as unsourced.

GameStop is the exception and keeps its exact figures. Those come from the SEC staff
report, a regulator's primary document rather than a vendor, so the constraint there is
access rather than evidence tier.

### Blocked — source access

The SEC refuses automated requests that do not declare a contact address, and the
repository's configured User-Agent carries none:

    "Open Portfolio Studio educational research (contact via repository owner)"

Every sec.gov fetch returns *"Your Request Originates from an Undeclared Automated Tool"*.
The Netflix and NVIDIA figures were therefore verified against the companies' own
publications of the same results rather than the SEC exhibits the brief cites, which is
adequate for the figures but does not verify the filing index or the exhibit itself.

The GameStop case cannot be verified at all this way: its evidence packet comes from the
SEC staff report, which has no company-published equivalent.

**To unblock:** supply a contact address for the SEC User-Agent, per their fair-access
policy. That is a decision for the repository owner; an agent should not invent one, and
should not substitute an unofficial mirror for a regulator's primary document.

Everything else below is proposed, not checked.

## Decision

Lesson 1.1 should stop asking a new learner to originate a personal market belief.
It should begin with a guided investigation of three dated, real market events:

1. Netflix's April 2022 subscriber and growth reset;
2. NVIDIA's May 2023 revenue-outlook surprise; and
3. GameStop's January 2021 price, volume, attention, and short-interest episode.

The learner should leave 1.1 with a **Market Observation Note**, not a completed
**Market Belief Statement**. The note records what happened, what the available
sources support, what remains uncertain, and what evidence would be needed next.

This is not a cosmetic substitution of real tickers for fictional ones. It changes
the learning sequence from:

> define a philosophy → ask for a belief → ask the learner to defend it

to:

> define evidence → model how to read a real event → compare different market
> reactions → separate observation from inference → identify a research question

A learner may complete 1.1 by concluding **“these cases are not enough to support a
general market belief.”** That is the most evidence-literate answer available from
three cases.

## Why this is rooted in OPS

### OPS curriculum role

The approved Portfolio Builder curriculum defines Mission 2 as **“What do I believe
about markets?”** and names its final artifact the **Market Belief Statement**. The
current 1.1 lesson asks for that artifact before the learner has studied risk,
financial statements, valuation, friction, or the evidence-testing methods taught
later in Mission 9.

OPS should preserve the eventual artifact while changing when the learner earns it:

- **Lesson 1.1 (Mission 2):** create a Market Observation Note from real public evidence.
- **Mission 9, *Judge a market-beating claim*:** convert accumulated observations into a
  Market Belief Statement and name a falsifier, once the evidence method has been taught.
- **Mission 10:** use that statement when choosing a passive default or defending an
  active edge.

### The spine consequence, and what it requires

Moving the belief out of 1.1 is not a lesson-local change. `if-1-1` is Mission 2's only
lesson, and the `beliefs` checkpoint feeds `architecture` and `policy` — Missions 10 and
13 both consume it. If 1.1 stops writing a belief and nothing replaces it, Mission 2
produces no artifact, `beliefs` never reaches `coherent`, and `Execute-ready` becomes
unreachable for every learner. That defect existed until 2026-08-19 and was fixed in
`04605fd`; this redesign must not reintroduce it.

The resolution, which requires amending the mission curriculum rather than only this
lesson:

- **Mission 2's artifact becomes the Market Observation Note**, and the `beliefs`
  checkpoint is satisfied by it. The mission's question changes from *"What do I believe
  about markets?"* to *"What can I actually observe about markets?"*
- **The Market Belief Statement becomes Mission 9's second artifact**, written once the
  learner can test a claim. Mission 9 already owns the Evidence Test Checklist; the
  belief is the first thing that checklist is applied to.
- **Mission 9 imports the 1.1 observation note**, so the learner sees the distance
  between what they first noticed and what a defensible claim requires.

The mission curriculum is an approved authority and its Mission 2 row states the current
artifact. It must be amended before this is built, not after. Until that amendment is
approved, this brief is a proposal against the curriculum, not an implementation of it.

This preserves the Portfolio Dossier's logic. It also prevents an empty early opinion
from becoming a pseudo-commitment merely because the interface saved it.

### Damodaran source spine

The controlling OPS source remains Aswath Damodaran's *Investment Philosophies*
38-webcast course, as locked in
[the existing OPS corpus audit](../source-audits/damodaran-investment-philosophies-corpus-audit.md).
The [official course index](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm)
defines the relevant boundaries:

| Source | What it contributes | Boundary in 1.1 |
| --- | --- | --- |
| Session 1, *Introduction* | An investment philosophy is a coherent view of how markets work; a strategy implements that view. | Define philosophy and strategy, but do not imply a beginner already has a defensible view. |
| Session 7, *Market Efficiency I* | Prices can differ from value; an edge also requires a pocket of inefficiency, a correction mechanism, tradability, and profit after friction. | A large price move is not itself an edge. |
| Session 8, *Market Efficiency II* | An event study requires a sample of affected companies and returns adjusted for risk and market performance. | Three illustrative cases cannot establish a repeatable anomaly. |
| Session 38, *The Grand Finale* | A philosophy should be developed from evidence, experience, and investor fit. | The personal commitment belongs after evidence exposure, not before it. |

The real companies and events below are **OPS case selections**, not examples supplied
by Damodaran. Their source documents, prompts, sequencing, and instructional wording
must be labeled as OPS adaptations.

## New learner contract

Open the investigation with this promise:

> You do not need an investing opinion yet. Your job is to read what a company
> disclosed, observe how the market responded, and separate what the evidence shows
> from what it does not show.

Define the three objects the learner will inspect:

- **Event:** dated information that reached the market.
- **Price response:** the observed change after the information became public.
- **Inference:** a possible explanation connecting the event and the response.

Then state the evidence rule:

> One event can illustrate a mechanism. It cannot prove that the mechanism repeats,
> survives risk and costs, or supports a strategy.

This language should precede every prediction, classification, or synthesis prompt.

## The real case set

### Case 1 — Netflix: results can be positive while expectations deteriorate

**Event lock**

- Company: Netflix, Inc. (NASDAQ: NFLX)
- Disclosure: Form 8-K and Q1 2022 shareholder letter
- Filed: April 19, 2022, after the regular market close
- Primary source:
  [SEC filing index](https://www.sec.gov/Archives/edgar/data/1065280/0001065280-22-000144-index.htm)
  and
  [Exhibit 99.1](https://www.sec.gov/Archives/edgar/data/1065280/000106528022000144/ex991_q122.htm)
- Market-reaction source:
  Investing.com, April 20, 2022 —
  https://www.investing.com/news/economy/nasdaq-futures-slip-on-netflix-earnings-shock-2806853
  (secondary; a named market-data source with a retrieval date is still required)

**Evidence packet**

Show only the lines necessary for a beginner:

- Q1 revenue was $7.868 billion, up 9.8% year over year.
- Global paid memberships were 221.64 million.
- Paid net additions were negative 0.20 million in Q1.
- Netflix forecast negative 2.00 million paid net additions for Q2.
- Management wrote that revenue growth had slowed considerably.
- Netflix shares fell by roughly a third during the April 20 regular session.

**Teaching job**

This is the modeled case. It illustrates how revised expectations about a company's
future can coincide with a large repricing; a filing cannot be read by sorting every
reported number into simply positive or negative. Revenue was still growing, but
subscriber growth and the forward outlook changed the information investors were
evaluating.

**Learner sequence**

1. Read the dated SEC excerpt before seeing the share-price response.
2. Mark each fact as **past result**, **current condition**, or **forward expectation**.
3. Answer: “Which disclosure most directly changed the future growth picture?”
4. Reveal the size of the one-day decline as a band: the shares fell by roughly a third.
5. Sort conclusions:
   - Supported: investors received materially weaker subscriber-growth information.
   - Plausible: the revised growth outlook contributed to the price decline.
   - Not established: the decline was an overreaction or created a buying opportunity.

**Do not teach**

- “The market panicked.”
- “A 35% fall means the stock became cheap.”
- “Subscriber losses always cause a price decline.”
- Any hindsight trade.

### Case 2 — NVIDIA: forward guidance can outweigh a backward-looking decline

**Event lock**

- Company: NVIDIA Corporation (NASDAQ: NVDA)
- Disclosure: Form 8-K, Q1 fiscal 2024 results, and Q2 outlook
- Filed: May 24, 2023, after the regular market close
- Primary source:
  [SEC filing index](https://www.sec.gov/Archives/edgar/data/1045810/0001045810-23-000087-index.htm)
  and
  [Exhibit 99.1](https://www.sec.gov/Archives/edgar/data/1045810/000104581023000087/q1fy24pr.htm)
- Market-reaction source:
  Investing.com, May 25, 2023 —
  https://www.investing.com/news/stock-market-news/nvidia-close-to-becoming-first-trilliondollar-chip-firm-after-stellar-forecast-3090653
  (secondary; a named market-data source with a retrieval date is still required)

**Evidence packet**

- Q1 revenue was $7.192 billion, down 13% year over year and up 19% quarter over
  quarter.
- Data Center revenue reached a record $4.28 billion.
- NVIDIA forecast Q2 revenue of $11.00 billion, plus or minus 2%.
- Management said it was increasing supply to meet demand for accelerated computing
  and generative-AI products.
- NVIDIA shares rose by roughly a quarter during the May 25 regular session.

Use percentages rather than raw share prices. NVIDIA's later stock split makes an
unlabeled historical-price chart an unnecessary source of confusion.

**Teaching job**

This is the guided-practice case. A novice who looks only at “revenue down 13% year over
year” can miss the forward-looking information. The learner must locate the disclosure
that most changed expectations, then explain the observed direction without claiming the
market response was correct in size.

**Learner sequence**

1. Display the current-quarter results and forward guidance with the price hidden.
2. Ask the learner to select the line most relevant to future expectations.
3. Ask for a direction only: **more favorable**, **less favorable**, or
   **insufficient information**.
4. Reveal the size of the one-day rise as a band: the shares rose by roughly a quarter.
5. Ask what remains unknown: whether the new expectations were accurate, whether the
   price move was too large or too small, and whether similar events repeat.

**Do not teach**

- “AI news makes semiconductor stocks rise.”
- “A revenue beat predicts the next month's return.”
- “The market had failed to price AI.”
- A causal claim based solely on the size of the one-day move.

### Case 3 — GameStop: some price moves have several interacting causes

**Event lock**

- Company: GameStop Corp. (NYSE: GME)
- Observation period: January 11–29, 2021
- Company disclosure:
  [GameStop's January 11, 2021 Form 8-K](https://www.sec.gov/Archives/edgar/data/1326380/000132638021000006/gme-20210111.htm)
- Primary analytical source:
  [SEC Staff Report on Equity and Options Market Structure Conditions in Early
  2021](https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf)
- Source context:
  [SEC release announcing the report](https://www.sec.gov/newsroom/press-releases/2021-212)

**Evidence packet**

The SEC report documents:

- a January 11 announcement that Ryan Cohen would join GameStop's board;
- a January 13 close of $31.40, up from $19.95 on January 12;
- a January 27 close of $347.51, more than 1,600% above the January 11 close;
- a January 28 intraday high of $483;
- large changes in price and volume alongside high short interest, frequent Reddit
  mentions, and extensive media attention.

Keep the SEC report's original, pre-split price scale. GameStop stated that trading
would begin on a four-for-one
[split-adjusted basis on July 22, 2022](https://www.sec.gov/Archives/edgar/data/1326380/000132638022000100/a991-stocksplitannouncement.htm).
Do not combine the report's prices with split-adjusted chart data unless the
transformation is explicit.

**Teaching job**

This is the independent application case. Unlike the earnings cases, the evidence does
not support one clean “business news changed expected cash flow” story. The learner must
resist collapsing attention, short positioning, trading volume, market structure, and the
board announcement into a single confident cause.

The case is especially valuable because the SEC report does not support the common
shortcut that short covering alone explains the entire episode. The correct beginner
conclusion is that several forces were present and the evidence shown does not isolate one
complete causal account.

**Learner sequence**

1. Reveal the timeline in dated layers: company announcement, price, volume, short
   interest, social attention, and trading restrictions.
2. Ask which statement is most defensible:
   - “One board announcement explains the full move.”
   - “Short covering explains the full move.”
   - “Several documented forces coincided, and this evidence does not isolate one
     complete cause.”
3. Require the learner to identify one missing piece of evidence before making a
   stronger claim.
4. End without a buy, sell, or hold decision.

**Do not teach**

- A short-squeeze trading playbook.
- That social-media attention is a reliable signal.
- That the price move was rational or irrational.
- That volatility creates an exploitable edge.

## Why these three cases belong together

| Case | Source of new evidence | Observed response | What the learner can say |
| --- | --- | --- | --- |
| Netflix | Company results and weaker forward membership expectations | Large negative one-day move | Expectations can change even when some reported results remain positive. |
| NVIDIA | Company results and unusually strong forward revenue guidance | Large positive one-day move | Forward expectations can matter more than one backward-looking comparison. |
| GameStop | Company news plus attention, positioning, volume, and market-structure forces | Extreme multi-day volatility | Not every price move has one clean fundamental explanation. |

Together, the cases support a modest OPS conclusion:

> Prices respond to changing information, expectations, and trading conditions.
> Different events can produce different reactions, and a small set of memorable
> examples is not enough to establish a repeatable investing edge.

They do **not** support a belief in underreaction, overreaction, momentum, reversal,
fundamental efficiency, or a profitable news-trading strategy.

## Proposed six-screen learner sequence

Each numbered stage should be one application screen. The OPS limit is 1.5 viewports of
stage content at 1440×900, measured as `#lesson-journey` height ÷ viewport height — the
convention Mission 12's evidence establishes. **This is a measurement task, not a claim.**
No Investment Foundations lesson currently meets that limit on the page-total metric, and
three filing packets with staged reveals will be tall. Measure at all six widths before
asserting compliance.

| Screen | Learning function | Learner action | Visible result |
| ---: | --- | --- | --- |
| 1. Evidence desk | Introduce event, response, inference, and the one-case boundary. | Open a short source note and identify its date and source type. | The interface labels **observed**, **possible**, and **not established**. |
| 2. Netflix | Model the complete reasoning process. | Classify past results and forward expectations. | The price response is revealed only after the source evidence is read. |
| 3. NVIDIA | Guided practice with a contrasting event. | Select the disclosure most relevant to future expectations. | The learner sees why “revenue down year over year” was not the whole information set. |
| 4. GameStop | Independent application. | Choose the most defensible causal statement and name missing evidence. | A layered timeline prevents a one-headline explanation. |
| 5. Compare | Synthesize without overgeneralizing. | Sort claims into supported, plausible, and unsupported. | The three cases align in one evidence matrix. |
| 6. Observation note | Record learning and assess the boundary. | Save two observations, one uncertainty, and one next research question. | A Market Observation Note enters the Workbench; no personal belief is required. |

The learner should reach the first source interaction within half a viewport. Case context
belongs beside the filing excerpt and market reaction, not stacked underneath as a second
page of reading.

## Workbench artifact recommendation

### Replace the 1.1 completion artifact

Do not ask for:

- “What do you currently believe about markets?”
- “Why might the opportunity persist?”
- “What evidence would make you change your mind?”

Ask the learner to save:

| Field | Prompt | Input design |
| --- | --- | --- |
| Observation 1 | What did one company disclose? | Structured selection populated from the source packet |
| Observation 2 | What did price do after the disclosure? | Automatic event-window fact |
| Interpretation | What is the narrowest explanation supported by the case? | Guided choice |
| Uncertainty | What does this case not establish? | Guided choice with optional note |
| Next evidence | What would you need before generalizing? | Guided choice: more events, benchmark comparison, risk adjustment, costs, or longer horizon |

Artifact label: **Market Observation Note 0.1**

Completion must accept:

> I do not yet have enough evidence to state a market belief.

That response is evidence of discipline, not indecision.

### Move the commitment to Mission 9

The Market Belief Statement should be written after the learner has practiced the OPS
evidence method — which is Mission 9, *Judge a market-beating claim*. At that point the
existing three fields become appropriate:

- current market belief;
- why the claimed opportunity might persist; and
- evidence that would weaken or reject the belief.

The later checkpoint should import the 1.1 observation note so the learner can see the
difference between the first cases they noticed and the broader evidence required to
support a claim.

## Assessment plan

The case interactions are guided practice and should be retryable without penalty. The
final 1.1 assessment should test evidence boundaries, not investing opinions.

### Assessed idea 1: expectations

**Prompt:** Netflix reported year-over-year revenue growth, yet its shares fell sharply
after the Q1 disclosure. Which conclusion is best supported by the lesson?

**Answer:** Investors received weaker information about future membership and revenue
growth; a positive current metric did not preserve the previous outlook.

### Assessed idea 2: observation versus strategy

**Prompt:** NVIDIA's shares rose by roughly a quarter after its May 2023 disclosure. What
would be required
before turning that observation into a strategy?

**Answer:** A broader sample, a comparison with expected market returns, risk adjustment,
realistic execution, and costs.

### Assessed idea 3: causal restraint

**Prompt:** What is the strongest conclusion supported by the GameStop evidence packet?

**Answer:** Several documented forces coincided, and the evidence shown does not isolate
one complete cause.

### Assessed idea 4: philosophy vocabulary

**Prompt:** Which item is an investment philosophy rather than an event, observation,
strategy, or trade?

The correct option must provide a coherent, testable account of how a market opportunity
could arise. The lesson should provide the definition and a modeled example before asking
this question.

No assessed item should require the learner to predict a stock, endorse active investing,
or infer that a dramatic historical move was foreseeable.

## Coverage matrix

| Proposed claim or activity | Supporting source | Prerequisite introduced in 1.1 | Classification |
| --- | --- | --- | --- |
| Philosophy guides strategy | Damodaran Session 1; OPS corpus audit | Positive definition of philosophy and strategy | Source-authentic |
| A large move is not automatically an edge | Damodaran Sessions 7–8 | Edge and single-case boundary | Source-authentic, simplified |
| Netflix's disclosed metrics and forecast | Netflix April 19, 2022 SEC exhibit | Read a source date and metric | Real-case fact |
| Netflix fell by roughly a third on April 20 | Named market-data vendor, retrieval date recorded | Price response | Real-case direction and magnitude band |
| NVIDIA's Q1 metrics and $11 billion outlook | NVIDIA May 24, 2023 SEC exhibit | Past result versus forward expectation | Real-case fact |
| NVIDIA rose by roughly a quarter on May 25 | Named market-data vendor, retrieval date recorded | Price response | Real-case direction and magnitude band |
| GameStop's January timeline and prices | SEC October 2021 staff report | Event timeline and causal uncertainty | Real-case fact and regulator analysis |
| One case illustrates but does not prove a strategy | Damodaran Session 8; OPS pedagogy | Observation versus inference | Source-authentic boundary plus OPS wording |
| Supported / plausible / not established sort | OPS adaptation | All three definitions modeled first | Original OPS pedagogy |
| Market Observation Note | OPS Portfolio Workbench adaptation | Completed cases and synthesis | Original OPS artifact |

## Source and design guardrails

- Freeze every case to the dated event window. Do not use a live market feed.
- Lead with the filing or regulator source, not a news headline.
- Show the security symbol, disclosure date, market-reaction date, source link, and
  whether prices are adjusted for a later stock split.
- Keep company-reported figures separate from market-price reporting.
- Preserve “contributed to” or “coincided with” language unless a source supports a
  stronger causal conclusion.
- Do not use the three cases to claim post-earnings drift, momentum, reversal, or
  overreaction.
- Do not ask for a buy, sell, hold, price target, or portfolio allocation.
- Do not make the most dramatic outcome the rewarded answer.
- Offer transcripts or text equivalents for every source-document and chart view.
- Use static snapshots so every learner receives the same evidence and assessment.
- State each company's price reaction as a direction and a magnitude band, not a decimal
  percentage, and cite a named market-data vendor with a retrieval date. Bands survive
  stock splits; raw prices do not. The SEC/company filings remain the primary sources for
  company disclosures, and the SEC staff report is primary for the GameStop prices, which
  keep their exact figures because a regulator published them.

## Acceptance criteria for a future implementation

The redesign is ready for implementation review only when:

- every displayed number matches the linked source;
- the event time and next regular trading session are explicit;
- all historical price series use a documented adjustment convention;
- each conclusion is labeled supported, plausible, or not established;
- “not enough evidence” is a valid completion path;
- no personal market belief is requested or saved in 1.1;
- the Workbench clearly distinguishes the observation note from the later belief
  statement;
- the final assessment tests source reading and evidentiary restraint;
- the mission curriculum has been amended to move the Market Belief Statement to
  Mission 9, so Mission 2's `beliefs` checkpoint is satisfied by the observation note;
- every screen stays within the OPS screen budget at all six required widths; and
- the lesson passes a separate fresh-learner sequence review before visual QA.

## Recommendation

Adopt this case set and make 1.1 an **evidence desk**, not a belief generator.

The important OPS move is not that learners see famous stocks. It is that they learn a
professional habit:

> Read the dated source, observe the response, state only what the evidence supports,
> and keep the next question open.

That habit gives learners something real to build beliefs from later.
