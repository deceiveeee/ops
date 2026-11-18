# Studio Portfolio, built the way professionals build one — plan

Status: built 17 November 2026 on the current Studio, uncommitted; decisions agreed (see below). Research
behind it: the professional-procedure scan of 16 November (sources listed at the end).

## The problem, in one paragraph

Studio has most of the right tools, but runs them in an amateur order. A learner researches
investments, then types a percentage for each one. Vanguard has a name for that habit: "fund
collecting", building a portfolio "from the bottom up, focusing on investments piecemeal"
(Vanguard 2017, p. 3). Professionals work the other way round. They write the goal and the
rules first, choose how much goes to stocks, bonds and cash, fill each part with low-cost
funds, and only then make room for a few deliberate picks, which they judge against the index
fund they replace (CFA Institute, *The Portfolio Management Process and the IPS*, §5;
Vanguard 2017, p. 1). This plan changes the order and adds the four missing professional
checks: the return the goal needs, an estimated range for the chosen mix, a look inside the
funds, and a benchmark to judge picks against.

## What a learner will be able to do

1. **See the yearly return their goal needs**, worked out from what they have, what they add
   and the amount they want by a date.
2. **Choose their mix of Ready, Steady and Grow first**, and see whether that mix's estimated
   range covers the return their goal needs, and what each scenario would cost it.
3. **Split each slice and fill each part with a fund** without typing a percentage per
   holding. Studio works out each holding's weight from the steps above.
4. **Set aside a picks budget**, put individual stocks inside it, and see the index money each
   pick replaces.
5. **Look inside the whole portfolio**: the companies they own through every fund and pick,
   the US and international shares, the yearly cost in dollars, and the same figures for a
   benchmark held only in index funds.
6. **Buy, then keep it on track**: the buying worksheet as now, then Review by slice first and
   by holding after it.

Not built yet (17 November): a country-by-country look inside funds, Review's results against
the benchmark over time, and new money directed by slice rather than by holding. Each needs
data Studio does not hold yet or its own specification.

## The nine steps, page by page

Revised 17 November at the human's request: the rebuild follows the nine-step professional
procedure from the research scan, one numbered step each, in this order. Each step is one
screen (within 1.5 screens at every width). Steps 1 and 2 are on Goals, steps 3 to 8 are the
Portfolio tabs, and step 9 is Review. The old tabs map in: How much goes where becomes steps
3 to 6, Risk and cost becomes step 7, What to buy becomes step 8. Compare allocations, Return
history and the bond page stay reachable from the steps that use them.

| Step | Page | What the learner does | What is new | Professional step it matches |
| --- | --- | --- | --- | --- |
| 1 | Goals: **Write the rules first** | States the goal, date, money, monthly additions, bills, loss budget, caps, and the review schedule and review band from the operating rules. | The review schedule and band move here from the end | Objectives, constraints and the rebalancing rule, written before anything is chosen (CFA IPS paper §3, §4c; Vanguard 2017 Figure 1) |
| 2 | Goals: **The return your goal needs** | Adds an optional target amount in today's dollars. | The yearly return above inflation that bridges money now, monthly additions and the target | Required rate of return (Vanguard 2017, p. 2) |
| 3 | Portfolio: **Your mix** | Sets Ready, Steady and Grow targets and ranges, and an assumed yearly return range for each slice from a published long-run estimate. Can compare two other mixes beside it. | The main decision. Each mix shows its estimated range against the return needed, and its loss in each scenario against the loss budget | Strategic allocation with minimum and maximum weights, from objectives and long-run estimates (CFA reading §5.1.3–5.1.4) |
| 4 | Portfolio: **Split each slice** | Splits Grow between US and international stocks, and Steady between short-term and broad bonds. | A sub-allocation inside each slice | Sub-asset allocation (Vanguard 2017, component 3) |
| 5 | Portfolio: **Fill each part** | Picks one broad fund for each part from the catalog. | No per-holding percentages: each fund takes its part's share | Broad index funds as the starting point (Vanguard 2017, p. 1) |
| 6 | Portfolio: **Your picks** (optional) | Sets a picks budget as a share of the whole portfolio, then sizes each stock inside it, under the company cap. | Each pick shows the index-fund money it replaces, and whether its reason and "what would prove it wrong" are saved | Active positions measured against a benchmark (CFA reading §5.1.2) |
| 7 | Portfolio: **Check the whole portfolio** | Reads one page of results. | Companies owned through every fund and pick, US and international shares, yearly cost in dollars, limit checks, scenarios, and the same figures for the **benchmark** | Look-through review (Morningstar X-Ray); risk checks (CFA IPS paper §4b) |
| 8 | Portfolio: **Carry it out** | Works out shares, cash and costs, as on What to buy now. | Amounts come from the steps above; the account it is bought in is named | Implementation (CFA reading §5.2) |
| 9 | Review: **Monitor, rebalance, measure** | Records current values, checks drift, plans new money. | Drift by slice first, then by holding; new money to the slice furthest below target | Monitoring, rebalancing, performance evaluation (CFA reading §5.3) |

**Benchmark** is already defined in Studio's Review guidance. Here it means one specific
thing: the learner's own mix, held only in the broad index funds of each slice, with no picks.
It answers "did my picks and choices beat simply owning the index at the same mix?"

## Worked examples

Original OPS numbers, not advice. Each was recalculated independently
(`check-plan-numbers.mjs` in the session scratchpad; to be rewritten as unit tests first).

**The return the goal needs.** $10,000 now, $200 added at the end of each month, $50,000
wanted in 10 years, all in today's dollars. Without growth that is $34,000. Reaching $50,000
needs about **5.9% a year above inflation**. At 3% a year it reaches about $41,300; at 5%,
about $47,200. Vanguard's own example: $1 million in 40 years from $10,000 a year needs about
4% (Vanguard 2017, p. 2; recalculated as 4.05% with each deposit at the start of a year).

**A mix against that need.** Invented ranges, not forecasts: Grow 4–8% a year, Steady 2–4%,
Ready 0–1%. A 70 / 25 / 5 mix gives 3.3% if every slice lands at its low end at once, and
6.65% if every slice lands at its high end. The goal's 5.9% sits near the top of that range.
The learner sees three honest choices: more Grow and a larger fall in a bad year, more money
each month, or a later date. Studio never picks one for them.

**A picks budget.** A $20,000 portfolio with Grow at 70% holds $14,000 in Grow. A picks budget
of 10% of the whole portfolio is $2,000; a company cap of 5% allows up to $1,000 in any one
company. The index funds in Grow then hold $12,000, and each pick shows the index money it
took.

**New money before selling.** Targets 70 / 25 / 5 on $20,000. Grow has grown to $15,000
(75%), Steady is $4,000 (20%), Ready is $1,000 (5%). Rather than selling, the next $1,000 goes
to Steady, the slice furthest below its target. This extends Vanguard's guidance to redirect
incoming cash, such as dividends and interest, to the parts below target instead of trading
(Vanguard, *Rebalancing your portfolio*). Applying it to new contributions is an OPS rule.

## What each rule rests on

| Rule | Basis | Status |
| --- | --- | --- |
| Goal and limits come first; every later choice is checked against them | CFA reading §5.1.1–5.1.2; CFA IPS paper (2010) §3; Vanguard 2017 p. 3, Figure 1 | Read in full on 16 Nov; needs entry in a source audit |
| Top-down order: mix, then parts, then funds | Vanguard 2017 pp. 1–2 (five components); CFA reading Figure 1 | Read; needs audit entry |
| The return a goal needs | Vanguard 2017 p. 2 (required rate of return) | Read; the formula and timing conventions are an OPS specification |
| Target weights with minimum and maximum | CFA reading §5.1.4; Mission 5 already teaches slices, strategic weights and target ranges | Backed; Mission 5 vocabulary kept |
| Estimated return ranges for each slice | CFA reading §5.1.3 says long-run estimates are needed. Studio bundles no numbers: the learner enters a range from a published estimate, which Studio labels as their assumption | Decision 2, as built |
| A mix's result in each of the last ten years | Each fund's calendar-year returns as printed in its own prospectus (the annual returns bar chart) | Later: data step. Step 3 uses the learner's scenarios until then |
| Broad index funds as the default fill | Vanguard 2017 p. 1 | Read; needs audit entry |
| Picks judged against the index they replace | CFA reading §5.1.2 (active means holdings differ from the benchmark) | Read; needs audit entry |
| Look inside funds | Industry practice (Morningstar X-Ray); Mission 12 already shows top holdings with their coverage | Backed by existing Mission 12 data, partial |
| Review yearly; trade only past a band; new money first | Vanguard *Rebalancing your portfolio*; CFA IPS paper §4c | Read; Vanguard gives 5 points only as an example, so no default number |

No new limit gets a default number, as in the goals and limits plan. Firms flag a single stock
anywhere from 5% to 20% of a portfolio (Russell, Schwab, T. Rowe Price); that disagreement is
the reason to leave the cap to the learner.

## Data each step needs

| Step | Data | Have it? |
| --- | --- | --- |
| Return the goal needs | Target amount (new field), money, contributions, date | Missing only the target amount |
| Your mix: estimated range | Long-run return range for each slice, with a date and source | Entered by the learner (decision 2) |
| Your mix: last ten years | Calendar-year returns for each slice's fund | **No.** Studio's monthly history covers 18 months, for VTI, VOO and VXUS only, and no bond fund. Later route: the yearly returns each fund prints in its prospectus |
| Look inside | Fund holdings with coverage, from N-PORT filings | Partly: Mission 12 top positions (between about 5% and 33% of each fund); countries need a new reading of the same filings |
| Yearly cost | Expense ratios from each fund's report | Yes |
| Benchmark results | Same-period returns of the index funds | Partly: the same 18 months for VTI, VOO and VXUS; nothing for bonds |

## What happens to saved work

Saved projects keep their holdings and weights. On first opening after the change, Studio adds
up each slice from the existing holdings and shows that as the starting mix, so nothing is
lost and nothing is silently rebalanced. Saved allocations from Compare allocations stay
readable. The schema stays at v2, with optional new fields, unless decision 1 picks the
reconstruction branch, which uses v3.

## Decisions, agreed 17 November

The human accepted all four recommendations ("Otherwise proceed") and asked that the rebuild
follow the nine steps. Decision 2 is built in its fallback form until a quotation check
clears a named firm's published ranges: the learner types the range and its source.

1. **What to build on.** Agreed: **build this on the current Studio, step by step.**
   Codex's unmerged `codex/portfolio-reconstruction` branch (11 commits, 97b6066) already
   replaces Portfolio with calculated portfolios, but it starts from the chosen securities
   rather than the mix and needs a Python calculator running on the web server. The
   3 November review found three blockers for a public release
   (`docs/audits/portfolio-integration-review-2026-11-03.md`); the 4 November work prepared a
   local preview and left the hosting, data and source checks open. This plan's arithmetic is
   simple enough to run in the browser. The branch's reviewed
   Treasury model, research inputs and robustness tests stay valuable and can be brought in
   later, at the mix level, where a calculator has three to five slices to work with instead
   of a handful of securities with short histories. The alternative is to add these steps in
   front of the branch's journey and resolve its blockers first.
2. **Where the estimated ranges come from.** Recommended: published long-run ranges from a
   named firm, shown with their date and a link, after a check of what may be quoted. If none
   can be used, step 3 shows the goal's needed return and the scenario losses only, and says
   the estimate is unavailable. Past average returns are not shown as estimates.
3. **Today's dollars for the target amount.** Recommended, so the learner does not have to
   guess inflation. The page says so beside the field.
4. **Picks budget starts unset.** Agreed. A learner who wants no picks skips step 6.

## Not in this plan

- Several accounts and which investments go in which (taxable or retirement). Goals stores one
  account type, and step 8 names it; placing holdings across accounts is its own
  specification, with its own tax sources.
- Taxes on selling.
- Probability of reaching the goal, simulations and optimisers. They belong with decision 1's
  later work, at the mix level.
- Changes to lessons. Studio keeps the course's names for slices, loss budget and limits.

## How we will know it works

- Every worked example above written as a test first and seen failing, with inputs that would
  catch a wrong timing convention (start or end of period) and a dropped cash amount.
- A first-time learner can go from an empty project to a buying worksheet without typing a
  percentage for any single fund.
- A project saved before the change opens with the same holdings, weights and decisions, and a
  starting mix that equals the sum of its holdings.
- Every new term is explained before it is used: the return your goal needs, estimated range,
  picks budget, look inside. Reviewed as wording, separately from layout and tests.
- Each step within 1.5 screens at 390, 768, 1024, 1280, 1440 and 1920 px, nothing scrolling
  sideways, checked with keyboard and touch.

## Build order

Each step is tested on its own. Nothing is committed unless the human asks.

1. The construction record and its arithmetic: the return a goal needs, a mix's range, the
   split, the fill, the picks, and holding weights worked out from all of them. Unit tests
   first, from the worked examples.
2. Steps 1–2 on Goals: target amount, the return the goal needs, review schedule and band.
3. Steps 3–6 as Portfolio tabs; an existing project starts from the mix its holdings add up to.
4. Step 7: look inside, cost, limits, scenarios and the benchmark on one page.
5. Steps 8–9: What to buy names the account; Review shows drift by slice first.
6. The whole suite, then every step at six widths.

## Construction arithmetic, as built

Every percentage is a share of the whole portfolio, cash included, like the limits. The cash
set aside on Goals is part of Ready. With W the whole portfolio:

- Ready is held as cash. Ready below the cash set aside is a problem to fix, not a rounding.
- Grow money is Grow% × W. International stocks take the learner's share of it; US stocks
  the rest. A pick comes out of the part it belongs to (AAPL from US stocks, TSM from
  international), and that is the index money it replaces.
- Steady money is Steady% × W, split between short-term and broad bonds by the learner's share.
- Each part's fund gets its part's money. A part with money and no fund leaves that money in
  cash, said on the page.
- A holding's stored weight is its money divided by the money after the cash set aside, which
  is what the existing calculation reads, so every later page keeps working.

## Sources

Read in full or in the cited sections on 16 November 2026:

- CFA Institute, [*Elements of an Investment Policy Statement for Individual Investors*](https://rpc.cfainstitute.org/-/media/documents/article/position-paper/investment-policy-statement-individual-investors.pdf) (May 2010).
- CFA Institute, [*The Portfolio Management Process and the Investment Policy Statement*](https://www.cfainstitute.org/-/media/documents/article/refresher-readings-free/rr-2018-l2v6r47.pdf), from Maginn, Tuttle, Pinto and McLeavey (eds.), *Managing Investment Portfolios: A Dynamic Process*, 3rd ed. (© 2006 CFA Institute).
- Donaldson, Walker, Stockton, Balsamo and Zilbering, [*Vanguard's framework for constructing globally diversified portfolios*](https://assets.informa.com/MarketingImages/2017/Vanguard_2017/ISGCGP_032017.pdf) (Vanguard Research, March 2017). A June 2021 revision exists; reconcile before citing in product copy.
- Vanguard, [*Rebalancing your portfolio*](https://investor.vanguard.com/investor-resources-education/portfolio-management/rebalancing-your-portfolio).

Checked through official pages only:

- [Morningstar Portfolio X-Ray help](https://www.morningstar.com/help-center/portfolio/xray); [CPP Investments reference portfolio](https://cppinvestments.com/?p=8107) (a two-index benchmark for a whole fund, 85% global stocks and 15% government bonds).
- Single-stock flags: [Russell Investments](https://russellinvestments.com/us/blog/concentrated-stock-positions), [Schwab](https://www.schwab.com/learn/story/3-strategies-highly-appreciated-stocks), [T. Rowe Price](https://www.troweprice.com/en/us/insights/concentrated-company-stock-reduce-concentration-risk).

Before any of this becomes learner-facing copy, each rule needs its entry in a source audit
under `docs/source-audits/`, as the project's source-integrity rule requires.

## What was built, 17 November

- `lib/studio-project/construction.ts` holds the arithmetic, tested in `construction.test.ts` (27 cases
  from the worked examples). A project-level `construction` record keeps the target amount, inflation,
  estimates and compared mixes; each portfolio's optional `build` keeps its split, funds and picks.
  The mix is the Ready, Steady and Grow targets already saved with the limits.
- Every save through Goals, the limits or the steps re-derives the weights of each portfolio that has a
  build, so a weight never lags the choices behind it. A holding the build does not use stays at 0%,
  never removed by Studio; step 5 lists such funds with a Remove button.
- A portfolio typed by hand keeps its weights. Steps 4 to 6 offer "Build from these holdings", which lists
  each holding's weight now and after, and which fund's money moves into another, before changing anything.
  A proposal saved on Compare allocations is typed by hand and carries no build.
- Goals: five tabs. Steps 1 and 2 are named in the eyebrow; the review schedule and drift threshold use
  Review's own labels. The caps moved to Your limits; the slice targets moved to step 3.
- Portfolio tabs are steps 3 to 8. Scenarios and costs, Compare allocations and Return history are linked
  from step 7, and the bond page from step 8; each keeps its step's tab current.
- The per-holding "what limits this weight" line of the old table is gone with the table. The same limits
  are checked on step 7 and Review, the company cap refuses an oversized pick on step 6, and the
  downloadable plan still writes each holding's room.
- Measured: every step within 1.5 screens at 390, 768, 1024, 1280, 1440 and 1920 x 900, with nothing
  scrolling sideways (`e2e/studio-nine-steps.spec.ts`). Some phone layouts drop a chart or a summary
  line that repeats the table beside it.
