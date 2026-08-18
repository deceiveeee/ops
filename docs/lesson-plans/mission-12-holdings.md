# Mission 12 — Choose the actual holdings: lesson plan (Gate B)

**Source authority:** `docs/source-audits/mission-12-holdings.md` (Gate A closed 2026-08-16).
**Release evidence:** `docs/release-evidence/mission-12-holdings.md`.
**Phase prompt:** `docs/agent-prompts/portfolio-builder/07-mission-12-holdings.md`.
**Mission record:** `pb-12`, artifact `holdings`, "Holdings Slate", 40 target minutes.
**Artifact produced:** Holdings Slate — verified products mapped to licensed sleeves, an overlap
X-ray, and a non-executing order rehearsal.

## What the learner walks out able to do

Take a ticker, establish what legal thing it actually is, read the four or five facts that
decide whether it fits a sleeve they already licensed, find the exposure they are holding twice
without knowing it, and rehearse an order they never send.

The mission teaches **how to verify a product against its filing**. It never teaches which fund
to own. That line has to hold in the interaction, not in a disclaimer.

## Upstream inputs and downstream effects

| Reads from | Used for |
| --- | --- |
| Mission 5 strategic weights | The sleeve sizes a product is being fitted to |
| Mission 8 friction budget | The spread and cost estimate in the order rehearsal |
| Mission 9 evidence test | The standard a product claim has to clear |
| Mission 10 Architecture License | No holding may enter a sleeve that is not licensed |
| Mission 11 Timing Policy | Must be valid and current, **including an explicit `no timing` policy** |

Changing allocation, architecture, timing, evidence or friction marks the slate, the overlap
result, the order drafts, the flight test and the operating plan `Review required`. Source
staleness and product changes do the same.

## Prerequisite terms — each defined positively at the point of use

**Design constraint, recorded because it is the mission's main risk.** The phase prompt names
thirteen terms to define. At 40 minutes, defining them up front turns this mission into a
glossary and blows the screen budget before the learner acts. Every term below is therefore
defined **inside the Prospectus Lens at the moment the learner first needs it**, against the
real line of the real filing that uses it — never in a preamble.

| Term | Defined as | First used |
| --- | --- | --- |
| Registrant (CIK) | The legal entity that files with the SEC — usually a trust, never the ticker | Beat 1 |
| Series | The fund itself: one portfolio, one manager, one turnover figure | Beat 1 |
| Share class | One way of buying that portfolio, with its own ticker, price and terms | Beat 1 |
| Prospectus | The filing where the fund states its objective, costs and risks | Beat 2 |
| Expense ratio | The percentage of your money the fund charges each year | Beat 2 |
| Replication | Whether the fund holds every index security or a sample of them | Beat 2 |
| Turnover | How much of the portfolio was traded in a year, as the SEC defines it | Beat 3 |
| Holdings file (N-PORT) | The quarterly filing that lists what the fund actually held, on a stated date | Beat 3 |
| As-of date | The date the holdings were true — not the date they were filed | Beat 3 |
| Securities lending | Lending portfolio securities for a fee; a permission and a practice | Beat 3 |
| Overlap / look-through | The same issuer reached through more than one fund | Beat 4 |
| Issuer vs instrument | One company can be several securities; exposure adds up by company | Beat 4 |
| Premium / discount | Paying more or less than the fund's own net asset value | Beat 6 |
| Bid-ask spread | The gap between what a buyer offers and a seller accepts | Beat 6 |

## Beats

Sequence: introduce → model → guided practice → Workbench application → independent
perturbation → assessment. One screen per beat; controls pinned; no beat is a scroll.

### Beat 1 — A ticker is not a product *(introduce)*

The learner searches EDGAR for "VTI" and finds **no filer**, because none exists. The identity
ladder resolves instead:

```
VANGUARD INDEX FUNDS                          CIK 0000036405   the filer
  └── Vanguard Total Stock Market Index Fund  S000002848       the portfolio
        └── ETF Shares (VTI)                  C000007808       what you buy
```

Then the six classes of that one series are revealed — VTSMX, VTSAX, VITSX, VTI, VSMPX, VSTSX.
Six tickers, one portfolio.

Claims: the verified identity records; S37-1 for the taxonomy of passive choices.

**Why this is first, and not the fee.** Every later step depends on it. Overlap arithmetic is
wrong without issuer identity; the trap in Beat 2 is invisible without class identity; and the
learner cannot check a holdings file against a prospectus without knowing they describe the
same series. This is also the one place the mission's structure is not an OPS invention — it is
EDGAR's, and the learner is looking at it.

### Beat 2 — The Fund Passport, and a trap that is not a trick *(model)*

A complete passport is modelled on VTI through the **Prospectus Lens**: the filing rendered as
source code, with the exact lines that answer each field pinned to it.

Fields filled: legal name, CIK/series/class, structure and listing, objective, target index
(CRSP US Total Market), replication (**sampling**), total expense (0.03%), turnover (3%), nine
principal risks, tracking against the stated index, holdings source and as-of date, spread and
premium/discount, securities lending, and *no leverage, inverse exposure or margin described* —
a negative finding the passport states rather than omits.

Then the trap: **VTSAX**. Same series, same index, same sampling, same 3% turnover — a
different price.

| | VTI | VTSAX |
| --- | --- | --- |
| Total expense | 0.03% | 0.04% |
| 10-year cost per $10,000 | $39 | $51 |
| Account service fee | none | $25/yr below $5,000,000 |
| Minimum to open | none | $3,000 |

The trap is not that these are confusable. It is that they are **the same product** with
different access terms, and only the class ID separates them.

Claims: S37-2, S37-5, the P1 and VTSAX records.

**Handling of defect D3.** Session 37 states ETFs cost slightly more than index funds; the
filings falsify it on this exact pair. The mission **never repeats that claim** and does not
stage a contradiction of Damodaran for the learner — a novice does not need a fight between
sources. The framework survives; the dated claim is simply not used.

### Beat 3 — Find one fact at a time *(guided practice)*

The learner works AGG's filing packet in the Prospectus Lens, one field per prompt, each
answered from a real line. Five finds, in order:

1. **The sentence that says how it tracks** — "representative sampling", which the filing
   itself defines. Contrast with VOO's replication sentence.
2. **The fee, and what the table means** — BlackRock's unitary structure, where "Other
   Expenses 0.00%" is a different statement than Vanguard's.
3. **The turnover** — 62%, against VTI's 3%.
4. **The lending permission** — up to one-third of total assets.
5. **The holdings as-of date** — 2026-05-31, from `repPdDate`, and *not* the 2027-02-28
   `repPdEnd` sitting beside it.

Two findings are then put to the learner as the same question in different clothes:

- The prospectus permits lending a third of the fund. The holdings file shows **zero** on loan.
  **Permitted and observed are different fields.**
- The index has 13,972 issues. The fund reports 13,269 positions. Sampling is not a claim to
  believe — it is visible in the count.

Claims: P3-1 through P3-11, S37-3.

### Beat 4 — The Overlap X-Ray *(Workbench application)*

The learner maps verified products to sleeves they already licensed in Mission 10, sets weights
against Mission 5, and saves the slate. The X-Ray then runs the look-through:

`issuer exposure = direct weight + Σ(fund weight × issuer weight inside fund)`

The result that carries the beat: **99.88% of VOO sits inside VTI**. Two funds, two tickers,
two prospectuses, essentially one portfolio. Exactly two positions differ.

Three disclosures ride along, none of them optional:

- **Aggregate by issuer, not by instrument.** Alphabet appears twice in VTI's holdings under two
  CUSIPs, 2.67% and 2.11%. Shown separately it ranks fifth and seventh; shown correctly it is
  the third-largest position in a 60/40 blend. The identity lesson from Beat 1, one level down.
- **The weights do not sum to 100%.** 100.25%, 100.14%, 101.88%, 108.82%. The residual is shown,
  never normalised away.
- **Two as-of dates.** Vanguard's snapshot is 2026-03-31, iShares' is 2026-05-31. Any
  cross-sponsor figure displays both. There is no common snapshot and the mission does not
  pretend there is.

The underlying table is inspectable in full without the visualisation, per the phase prompt.

Claims: the overlap computations and their vintage limits, as recorded in the audit.

### Beat 5 — Three things that look fine *(independent perturbation)*

An unfamiliar slate is presented and the learner must find what is wrong with it. Three
perturbations, all drawn from verified filings rather than invented:

1. **A diversified-looking slate that is not.** Growth sleeve filled with both VTI and VOO. The
   learner must find the 99.88% and repair the slate.
2. **A number that means nothing.** SGOV reports **0%** turnover next to AGG's 62%. The learner
   must not conclude SGOV trades less. Form N-1A Item 3(d)(ii) excludes securities maturing
   within a year of acquisition from both sides of the ratio — every SGOV holding is excluded,
   so the rate is 0% by construction. **The figure is real, correctly filed, and measures
   nothing here.** This is the mission's sharpest lesson: reading a filing means knowing what a
   figure is *defined* to measure.
3. **A stale holdings file.** VTI's as-of date is 138 days old at retrieval. The learner states
   what could have changed and what the overlap number therefore is and is not.

The correct action on each is to name the defect and repair or annotate — not to reject the
product.

### Beat 6 — Order rehearsal and assessment

A **draft only**. No endpoint exists that could transmit it; there is nothing to disable.

The rehearsal records exact identity (series and class, not the ticker alone), direction,
approximate amount, order-type education with trade-offs, a market-hours and price-uncertainty
warning, an available-cash and policy-range check against Mission 5, an estimated spread and
friction cost drawn from Mission 8, account-context and tax flags as directional warnings only,
and a closing confirmation that nothing was sent.

Spread and premium/discount are taught as **concepts with no published figure** — open item O1.
Every prospectus in the slate describes them and none carries numbers, so the passport says so
rather than inventing one.

Passing requires a rejection or repair from Beat 5 **and** a completed rehearsal whose identity
field names the share class. Clicking through does not pass.

## Coverage matrix

| Assessed idea | Introduced | Modelled | Guided | Applied | Assessed |
| --- | --- | --- | --- | --- | --- |
| A ticker is a share class, not a fund or a filer | Beat 1 | Beat 1 | Beat 2 | Beat 4 | Beat 6 |
| One portfolio can have several classes at different prices | Beat 1 | Beat 2 | Beat 2 | Beat 4 | Beat 6 |
| Replication is full or sampled, and the filing says which | Beat 2 | Beat 2 | Beat 3 | Beat 4 | Beat 5 |
| The fee table's meaning depends on the fee structure | Beat 2 | Beat 2 | Beat 3 | Beat 4 | Beat 6 |
| A filed figure measures what it is defined to measure | Beat 3 | Beat 3 | Beat 3 | Beat 5 | Beat 5 |
| Permitted and observed are different fields | Beat 3 | Beat 3 | Beat 3 | Beat 4 | Beat 5 |
| Holdings have an as-of date, and it is not the filing date | Beat 3 | Beat 3 | Beat 3 | Beat 4 | Beat 5 |
| Exposure aggregates by issuer, not by instrument | Beat 1 | Beat 4 | Beat 4 | Beat 4 | Beat 6 |
| Two funds can be one portfolio | Beat 2 | Beat 4 | Beat 4 | Beat 4 | Beat 5 |
| Disclosed weights need not sum to 100% | Beat 4 | Beat 4 | Beat 4 | Beat 4 | Beat 6 |
| Products are fitted to a licensed sleeve, never chosen from a list | Beat 1 | Beat 4 | Beat 4 | Beat 4 | Beat 6 |
| An order rehearsal is a draft and identity must be exact | Beat 6 | Beat 6 | Beat 6 | Beat 6 | Beat 6 |

Every assessed idea is introduced and practised before it is assessed. No beat asks the learner
to infer an unstated prerequisite.

## The no-recommendation guarantee

Four constraints, together, keep this educational rather than advisory:

1. The learner reaches a product **from a sleeve they already licensed**, never from a menu.
   Canonically supported by **S37-13**: you pick a fund to bring an exposure into the portfolio,
   not because you judge the index cheap.
2. The four products are worked examples of a category, spread across two sponsors so the
   mission reads as method rather than a firm's product line.
3. No product is ranked, scored or preferred. The passport reports fields; it does not grade.
4. Under **S37-4**, a fund beating its index is not a mark in its favour — the standard is
   tracking. SGOV's positive gap against its spliced benchmark is therefore a prompt to inspect
   the benchmark, and never a reason to prefer it.

## Gate B status: **closed**

`Blocked - learning` is not triggered. Every term is defined positively before use, every
assessed idea is introduced and practised first, and the learner sequence the phase prompt
requires is canonically supported rather than asserted.

## Notes for Gate C

1. **The X-Ray must not be a constellation.** The finding is "these two funds are one
   portfolio". A picture that is prettier than that sentence is a failure. Start from the
   table; earn the visual.
2. **The Prospectus Lens is the mission's spine and its biggest screen-budget risk.** A filing
   is long and a stage is a screen. The Lens must show one pinned excerpt at a time inside a
   fixed frame with internal scroll, not render a prospectus down the page.
3. **Walker contract.** Six stages, and the budget is **at most one keyed stage** for
   `ANSWER_KEYS` in `e2e/lesson-typography.spec.ts`. Beat 3's five-find sequence is the likely
   offender; it needs a solvable interaction shape, not a key. State stage-completion behaviour
   in a comment beside the shell call.
4. **Screen budget at 390, 768, 1024, 1280, 1440, 1920**, reported in screens, six numbers in
   the release evidence.
5. **LEI is the issuer key** in any implementation — not name, not CUSIP, not ticker. N-PORT
   publishes one per position. A name normaliser will silently split Alphabet.
6. Per-control records — learner decision, visible financial result, misconception exposed,
   keyboard and touch path, reduced-motion equivalent, compact-screen behaviour — are still to
   be written for the Lens, the X-Ray and the rehearsal.

---

## Amendment, 2026-08-17 — six beats, eight screens

Approved after Gate E measurement. The pedagogy is unchanged: the six beats above, their
sequence, and the coverage matrix all stand. Two beats now occupy two screens each, because
measurement put them over the Screen Budget Rule and `AGENTS.md` prescribes splitting rather
than sealing a stage inside a scroll box.

| Beat | Screens |
| --- | --- |
| 1 A ticker is not a product | Stage 1 — Identity |
| 2 The Fund Passport and the trap | Stage 2 — Passport |
| 3 Find one fact at a time | Stage 3 — Filing |
| **4 The Overlap X-Ray** | **Stage 4 — X-ray** (key toggle, look-through table, identity conflicts) and **Stage 5 — Repair** (the recorded finding, the repair, the issuer-level result) |
| 5 Three things that look fine | Stage 6 — Checks |
| **6 Order rehearsal and assessment** | **Stage 7 — Order** (identity, direction, type, amount) and **Stage 8 — Save** (draft summary, blockers, save) |

The split improves the sequence rather than merely fitting it: the learner now reads the
look-through table before being told what it means, instead of meeting the headline and the
evidence at once. Assessment is unchanged — a rejection or repair from Beat 5 plus a completed
rehearsal whose identity field names the share class.
