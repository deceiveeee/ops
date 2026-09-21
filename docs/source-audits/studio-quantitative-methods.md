# Studio's quantitative methods: definitions, conventions and reference calculations

One file per method, written **before** the method is implemented, because a screen that ranks
companies is a set of choices and every one of them changes the answer. Each section states the
choice, the reason, what the primary source does and does not settle, and an independent
calculation that the code is checked against.

Started 2026-09-15 with the peer screen. Other methods join it as they are built.

---

## 1. The peer screen

**What a learner can do with it.** Put the company they are investigating beside the competitors
its own annual report names, on the same measures, read from each company's own filings, and see
every step between the filed figures and the order the companies end up in.

**What they cannot do with it.** They cannot take the order as a verdict. A screen narrows a
search; it does not settle one. Two cautions are carried onto the surface itself, not left here:

- The composite is a **ranking device, not a distance**. The team whose published screen is
  recorded in `studio-research-coverage.md` §2 say this of their own z-scores — "primarily used
  for ranking rather than precise standardized distance estimates" (strategy p5). A company
  0.4 above another is ahead of it on these measures for this year. That is all it is.
- **The peer group decides the answer.** Every z-score here is relative to the companies in the
  list. Add a competitor, drop one, and every number moves. The list comes from the learner, so
  the screen shows who is in it on the same screen as the scores.

### 1.1 The measures, and why these

Studio can source these five from what a company files with the SEC, for the company's own latest
annual period, using the concept-resolution rules in `lib/studio-project/metrics.ts` and the
definitions in `lib/studio-project/roic.ts`:

| Measure | Definition | Counted better when | Source |
| --- | --- | --- | --- |
| Return on invested capital | NOPAT ÷ (debt + equity − cash) | Higher | `roic.ts`, from the seven figures |
| Profit margin after tax | NOPAT ÷ revenue | Higher | `roic.ts` |
| Capital turnover | Revenue ÷ invested capital | Higher | `roic.ts` |
| Profit left after everything | Net income ÷ revenue | Higher | `metrics.ts`, the `netIncome` primitive |
| Borrowings against equity | Total borrowings ÷ shareholders' equity | Lower | The seven figures directly |

The first three are *Measuring the Moat*'s decomposition, already used and already sourced in
`roic.ts`: the return, and the two things it is made of. The last is here because a direction that
runs the other way has to be visible for a learner to understand that direction is a choice
somebody makes. Its label on screen says so: less borrowed is not automatically better.

**The bottom line is in the set because of what the filings actually hold.** Measured on
2026-09-15 across ten large companies (Nucor, Eaton, Hubbell, nVent, Atkore, Caterpillar, Deere,
PepsiCo, Coca-Cola and Apple): three tag no operating profit Studio will read, and three tag no
borrowings that exclude finance leases, so on the first four measures alone Nucor and Deere would
have shown an empty row. All ten tag net income. It is a coarser measure — interest and one-off
items sit inside it — and the surface says so, but a company that cannot be compared at all is
worse than a company compared on a coarse measure with its name on it.

**The published screen in `studio-research-coverage.md` §2 is not reproduced.** Five of its nine
inputs need a price on a stated date (earnings yield, FCF yield, sales yield, momentum) or twelve
quarters of history (margin stability), which Studio does not hold for an arbitrary company. It
stays what that file calls it: a labeled historical example.

### 1.2 The seven questions the source leaves open, answered

`studio-research-coverage.md` §2 records seven method questions the published strategy does not
answer. A screen cannot be built until they are, so they are answered here.

**1. Quantile convention.** Linear interpolation between order statistics, the convention
NumPy, Excel's `PERCENTILE.INC`, R's type 7 and d3 all use by default: for a sorted list of `n`
values and a fraction `p`, take `h = (n − 1)p`, and interpolate between the values at `⌊h⌋` and
`⌈h⌉`. Chosen because it is the most widely implemented one, so a learner who checks a limit in a
spreadsheet gets the same number. With `n = 1` it returns that one value.

**2. Winsorization limits: the 10th and 90th percentiles**, not the 5th and 95th the published
strategy uses. Its own peer groups are ten names, where the 5th percentile falls at `h = 0.45`,
not quite half way from the lowest value to the second-lowest, so clipping barely reaches the most
extreme observation. A learner's list here is often smaller still. At the 10th percentile with ten
names the limit falls at `h = 0.9`, nine tenths of the way to the second value, which actually
pulls a lone extreme in. The screen states the two limits it used, and says which companies were
pulled to them — including "none", which is the common answer for short lists.

**And only from four companies up.** Winsorizing exists to stop one unusual company setting the
scale, and in a group of two or three every company is an edge: with three values the 10th
percentile falls a fifth of the way from the lowest to the middle one, so clipping pulls *both*
ends towards the centre and shortens real differences rather than a freak one. This was seen on
the live screen before it was fixed — Atkore against three competitors had two companies on the
return measure, and both of them were "pulled in". Below four holders the values are standardised
as they stand, and the surface says which of the two happened. The reference calculation in §1.4
is unaffected: its two measures have five and four holders.

**3. Sample or population standard deviation: sample**, dividing by `n − 1`. It is the unbiased
estimator for a group read as a sample of the companies that could have been compared, and it is
what a spreadsheet's `STDEV`/`STDEV.S` gives. The choice matters and is stated: with `n = 10`,
population standard deviation would divide by a number about 5% smaller, scaling every z-score on
that measure by about 1.054. Within one measure that cannot change the order. Across measures it
can, because a company missing one measure is scored on a different set of `n`s from its peers.

**4. Zero variance and undefined ratios.** If every company in the list has the same value for a
measure, the standard deviation is zero; no division happens, every z-score is zero, and the
surface says the companies are level on that measure rather than showing a false order. A ratio
that is not defined — negative or zero equity for borrowings against equity, non-positive
invested capital or revenue for the three returns — is **not** a zero and is never treated as
one. It is reported as missing with the reason, which is what `roic.ts` already does. A measure
only one company in the list holds is the same case from the other side: a single value has
nothing to be standardised against, so no z-score comes out of it and that company's row says so.

**5. Weights when a measure is missing.** Equal weights across the measures a company has, with
the weights rescaled to sum to one over just those measures, and the count shown on the row: "on
3 of the 5 measures". The alternative, refusing a composite for any company with a gap, drops
exactly the companies a learner most wants to see — a foreign filer reporting under IFRS, a bank
whose return on capital is meaningless. Rescaling has a cost and the surface carries it: a
company scored on one measure is not measured against the others on equal terms, and a row scored
on fewer measures says so beside its number.

**6. Ties.** Equal values give equal z-scores and share a place, with the next place skipped:
1, 1, 3. No tie is broken by anything else, because any rule that broke it would be inventing an
ordering the figures do not support.

**7. Enterprise value** is not used by any measure here, so its definition does not arise. If a
price-based measure is ever added, its definition is settled in this file first.

### 1.3 The steps, in the order the surface shows them

1. **Read the figures.** For each company, the seven figures and the bottom line for its own latest annual period,
   from SEC company facts, each carrying the tag it was read from and the period it covers
   (`prefill.ts`). Nothing is carried across from a different year, and a figure that cannot be
   established is missing rather than zero.
2. **Work out the measures** (§1.1). Anything undefined is reported with its reason.
3. **Winsorize** each measure across the companies that have it, at the limits in §1.2.
4. **Standardise**: z = (winsorized value − mean) ÷ sample standard deviation, then negate where
   the measure counts better when lower.
5. **Combine**: the mean of a company's z-scores across the measures it has (§1.2 answer 5).
6. **Order** by that composite, ties sharing a place.

### 1.4 Reference calculation, worked by hand

Five companies, two measures, chosen to exercise winsorization at both ends, a reversed
direction, a tie, and a missing observation. Calculated by hand below, then cross-checked against
an independent implementation of the formulas (not the module under test). `screen.test.ts`
asserts these values.

**Measure A, return on capital, counted better when higher**, in percent:
P 10, Q 20, R 30, S 40, T 100.

Sorted: 10, 20, 30, 40, 100. With `n = 5`, the 10th percentile is at `h = 4 × 0.1 = 0.4`, so the
lower limit is `10 + 0.4 × (20 − 10) = 14`; the 90th is at `h = 3.6`, so the upper limit is
`40 + 0.6 × (100 − 40) = 76`.

Winsorized: 14, 20, 30, 40, 76. Mean = 180 ÷ 5 = **36**. Deviations −22, −16, −6, 4, 40; their
squares 484, 256, 36, 16, 1600 sum to 2392; sample variance = 2392 ÷ 4 = 598; standard deviation
= √598 = **24.4540**.

z: −0.8996, −0.6543, −0.2454, +0.1636, +1.6357.

**Measure B, borrowings against equity, counted better when lower**:
P 0.5, Q 0.5, R 1.0, S 2.0, T undefined — its equity is negative, so the ratio is refused, not
zeroed.

Sorted over the four that have it: 0.5, 0.5, 1.0, 2.0. With `n = 4`, `h = 3 × 0.1 = 0.3` gives a
lower limit of `0.5 + 0.3 × (0.5 − 0.5) = 0.5`; `h = 2.7` gives an upper limit of
`1.0 + 0.7 × (2.0 − 1.0) = 1.7`.

Winsorized: 0.5, 0.5, 1.0, 1.7. Mean = 3.7 ÷ 4 = **0.925**. Deviations −0.425, −0.425, 0.075,
0.775; squares 0.180625, 0.180625, 0.005625, 0.600625 sum to 0.9675; sample variance = 0.3225;
standard deviation = **0.5679**.

Before direction, z: −0.7484, −0.7484, +0.1321, +1.3647. The measure counts better when lower, so
each is negated: **+0.7484, +0.7484, −0.1321, −1.3647**. P and Q tie, and share first place on
this measure.

**Composites**, equal weights over the measures each company has:

| Company | Measure A z | Measure B z | Composite | Measures scored | Place |
| --- | --- | --- | --- | --- | --- |
| T | +1.6357 | — | **+1.6357** | 1 of 2 | 1 |
| Q | −0.6543 | +0.7484 | **+0.0470** | 2 of 2 | 2 |
| P | −0.8996 | +0.7484 | **−0.0756** | 2 of 2 | 3 |
| R | −0.2454 | −0.1321 | **−0.1887** | 2 of 2 | 4 |
| S | +0.1636 | −1.3647 | **−0.6006** | 2 of 2 | 5 |

T heads the list on one measure out of two, which is the point of showing the count: a learner who
reads that column sees immediately that T's place rests on a single number.

**Zero variance**, worked separately: four companies all at 1.0 on a measure. Standard deviation
is 0, so every z-score is 0 and no order comes out of that measure. The other measures still
score, and the surface says the companies are level on this one.

### 1.5 What this is checked against

- The hand calculation above, and an independent implementation of the same formulas written for
  the check rather than by calling the module.
- Deliberate breaks: each convention in §1.2 is mutated in turn and a test must fail.
- The figures feeding it are already covered: `metrics.ts` refuses a concept that does not cover
  the stated period, `roic.ts` refuses a ratio it cannot define, and both have their own tests.

---

## 2. An individual bond: day count, accrued interest, price and yield

**What a learner can do with it.** Put a settlement date against the issue in Studio's catalog and
see what leaves the account that day — the price of the loan itself, the interest built up since the
last payment, and a broker's fee — then what the bond pays afterwards, and the yield the price
implies. The accrued figure can be carried into the buying worksheet, which has always been able to
hold one and never able to work one out.

**What they cannot do with it.** Anything but a fixed-rate, semiannual Treasury note or bond with a
regular first interest period. A short or long first period, a floating rate note, an
inflation-protected security and a corporate issue on 30/360 each have a different rule; each would
need its own source and its own checks, so each is refused rather than approximated.

### 2.1 The sources

| What | Where | Retrieved |
| --- | --- | --- |
| The day-count and price rules | 31 CFR part 356, appendix B (Uniform Offering Circular), sections I.A and II.A, on eCFR | 2026-09-15 |
| The issue's terms and the issuer's own figures | US Treasury Fiscal Data, auctions query, CUSIP 91282CRF0 | 2026-09-15 |

Appendix B states the two halves of the rule outright. A semiannual payment is half the annual
interest "regardless of the actual number of days in the half-year". Where a buyer settles part-way
through a period, the daily share is based on "the actual number of calendar days in the half-year",
which its own table gives as 181, 182, 183 or 184.

### 2.2 The conventions, and why

**1. Day count: actual/actual on the half-year.** Accrued interest per $100 is
`(C/2) × days since the period started ÷ days in the period`. Not 30/360, which is the corporate
convention and would give a different number for the same day.

**2. The schedule is counted back from maturity.** A note maturing on 15 August pays on 15 February
and 15 August, whatever its dated date. Where the maturity day does not exist in a month — 31 August
back to February — the last day of that month is used.

**3. Settling on a payment date starts the next period.** The buyer is not entitled to that day's
payment, so nothing has accrued and one fewer payment remains. Appendix B says the same thing from
the other side: `n` is reduced by one when the settlement date is a coupon frequency date.

**4. Price from yield is appendix B's formula, not a textbook's.**

    P[1 + (r/s)(i/2)] = (C/2)(r/s) + (C/2)aₙ + 100vₙ

with r the days from settlement to the next payment and s the days in that period. The part-period
is discounted with **simple** interest. Compounding it as `v^(r/s)`, which is what a textbook and
several libraries do, gives 99.540981 for the issue below where Treasury charged 99.540696 — a
difference of 0.000285 per $100, or $2.85 on a million, and a price the issuer would not have
charged.

**5. Yield from price is found by halving the interval**, to within 0.000001 of the price, and
refuses rather than returning a number when no yield produces that price.

**6. Money is rounded once, in cents.** The price times the face value, the accrued interest and the
fee are each rounded to the cent and then added, and the accrued interest is added **beside** the
price rather than folded into it — which is what stops a worksheet counting it twice. Where a budget
has to cover all three, the face value steps down until the rounded total fits inside it.

### 2.3 Reference calculation: the issuer's own figures

Treasury auctioned CUSIP 91282CRF0 — 4.625% due 15 August 2036, dated 15 August 2026 — twice, and
published what each buyer owed. Nothing below is Studio's own arithmetic.

| Settlement | Days accrued | Treasury's accrued per $1,000 | Studio | Treasury's price | Yield Studio reads from that price |
| --- | --- | --- | --- | --- | --- |
| 2026-08-17, at issue | 2 of 184 | 0.25136 | 0.251359 | 99.540696 | 4.683072% |
| 2026-09-15, at the reopening | 31 of 184 | 3.89606 | 3.896060 | 98.361116 | 4.834993% |

Treasury published those prices against high yields of 4.683% and 4.834%. The first agrees to every
digit published. The second looks like a disagreement of a thousandth and is not: **Treasury cuts
the yield to three decimals rather than rounding it**, so 4.834993% is published as 4.834%. Pricing
the reopening at a literal 4.834% gives 98.368792, which is not the price anyone paid. This is
recorded because it is exactly the kind of quiet difference a check like this exists to find.

A third check runs the other way: on a payment date, where there is no part-period, the price this
produces agrees to nine decimals with the lessons' own bond engine (`lib/fixed-income.ts`), which
sums discounted cash flows and shares no code with it.

---

## 3. What a price assumes: a stable-growth valuation

**What a learner can do with it.** Take the company whose annual report they are reading, see what it
is worth standing still, change the three assumptions that matter, and — the point of the screen —
put in the price somebody is asking and read back the growth that price is buying.

**What they cannot do with it.** Get a price target. The model is one growth rate for ever bought at
one return on capital; it is a way of asking what a price assumes, not a way of deciding what a
company is worth. The surface says so where a learner will read it.

### 3.1 The source, and the model it allows

The model comes from the course session this project already audited:
`damodaran-session-5-valuation-basics.md`. Three claims from it, each recorded there as
source-authentic and independently verified:

- Firm cash flow is after taxes and reinvestment and before debt payments.
- **Growth has to be bought**: reinvestment rate = growth ÷ return on capital.
- Growth is therefore neutral where that return equals the cost of capital, adds value above it and
  destroys value below it.

So the value of the firm is `NOPAT × (1 − g/ROC) ÷ (r − g)`.

**What is deliberately not built.** A multi-stage forecast with its own terminal value. That audit
lists terminal-value mechanics as a deferred topic, so there is no reviewed source in this project
for the choices such a model needs — how long the first stage runs, how growth fades, what the
terminal return on capital is. Building one anyway would put four unsourced assumptions on a
learner's screen. When a source for it is audited, §3 gets a second model and this one stays.

### 3.2 The conventions, and why

**1. One stage, for ever.** Stated on the surface in those words, because a learner who does not
know the model is one stage will read the number as more than it is.

**2. Refusals rather than numbers that mean nothing.** Growth at or above the cost of capital (the
arithmetic is unbounded); a return on new money at or below zero (growth cannot be bought); a
loss-making year (nothing to grow); a shrinking business (out of scope, and the reverse question
still reports negative growth where a price implies it); growth that needs more than the whole
profit put back; and a business whose lenders' claim exceeds it, where a share price would come out
negative.

**3. The bridge is explicit**: firm value − borrowings + cash = what the shares are worth, divided
by the shares. Reconciling it back is a check a learner can repeat, and the test does.

**4. Shares are the year's diluted weighted average**, from the filing, because it is the basis
every per-share figure in that filing uses and it covers the same year as the profit beside it.
Buybacks and issues since the year end are not in it, and the surface says so.

**5. A depositary receipt is converted by its own ratio**, which the learner supplies from the
filing's cover — five company shares to one receipt for TSMC. Studio does not hold ratios, and
guessing one would silently multiply every per-share figure by the wrong number.

**6. The cost of capital is Damodaran's, by industry**, through Studio's existing sourced table,
with the industry picked by the learner. Its SIC map covers only the five companies in the catalog,
so for anyone else the picker is the honest route: which industry a company belongs in is a
judgement, and the figure stays sourced.

**7. The return on new money starts from what the company earned on the capital it already has**,
which is a *choice*, not a fact, and is labelled as one. Where last year was unusual — Atkore's
1.4% return in a year with a large write-down — the whole screen says so loudly, because every
growth row refuses.

**8. The reverse question is solved in closed form and then checked.** Rearranging for g gives
`g = (NOPAT − EV·r) ÷ (NOPAT/ROC − EV)`, and that rearrangement has roots the model itself
refuses: a price of 900 for a business worth 1,200 standing still comes back as 30% growth. The root
is substituted back and rejected when it does not reproduce the price, with a reason that says which
way growth runs for this business.

### 3.3 Reference calculation

From the audit's own independently verified set — 120 of after-tax profit, a 10% cost of capital —
and the bridge and receipt cases added here. None of these numbers comes from the code.

| Case | Reinvestment | Cash flow | Value |
| --- | --- | --- | --- |
| No growth | 0 | 120 | 1,200 |
| 2% growth at a 10% return | 20% | 96 | 1,200 |
| 4% growth at a 10% return | 40% | 72 | 1,200 |
| 4% growth at an 8% return | 50% | 60 | 1,000 |
| 4% growth at a 12% return | 33⅓% | 80 | 1,333.33 |

The first three are the neutrality the source teaches: at a return equal to the cost of capital,
growth changes nothing at all. The last two are the whole point of the screen.

**The bridge**: 1,200 of firm value, 300 of borrowings and 100 of cash leaves 1,000 for 100 shares —
$10.00 a share, and 1,000 + 200 = 1,200 back. With five company shares behind one receipt, a
$12.00 share is a $60.00 receipt.

**The reverse question**: 1,000 read backwards at an 8% return on new money gives exactly the 4%
growth that produced it; 1,300, for the same value-destroying business, gives −5%.
