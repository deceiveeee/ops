# The profit pool

What the profit pool may say, the sentence in the paper that lets it say so, and what the data
behind it can and cannot carry.

Same edition as the other Moat audits: Mauboussin and Callahan, *Measuring the Moat*, Consilient
Observer, **15 October 2024**, read from
[`docs/source-pdfs/measuring-the-moat-2024-10-15.pdf`](../source-pdfs/measuring-the-moat-2024-10-15.pdf).
This audit covers **pp. 15-17** (the profit pool, Exhibits 10-12), the checklist's Lay of the Land
question on **p. 67**, and the notes on intangible adjustment on **pp. 52 and 70**. The ROIC
definition it rests on is **p. 7**, already audited for the industry surface.

## Where it comes from in the paper

The pool is the paper's next step after the industry map, and it says so:

> Now that we have a sense of the relevant companies and entities in an industry, we turn to
> understanding how the economic profit is distributed among the participants. Creating a profit
> pool is an effective tool for this analysis. (p. 15)

The checklist asks it as a question: "What is the aggregate economic profit, and how has it
evolved?" (p. 67)

## The definitions the surface uses

| Surface says | The paper says | Page |
| --- | --- | --- |
| Economic profit is the gap between the return and the cost of capital, times the capital invested | "Economic profit equals the spread between ROIC and WACC times invested capital (Economic Profit = [ROIC − WACC] × Invested Capital)." | 15 |
| Height is the gap, width is the capital, area is the economic profit | "the y-axis shows value creation as a percent (width), and the x-axis shows how much money is invested (length). The economic profit for a company equals its area (width × length)." | 15 |
| You can see where the money is made | "At a glance, a business analyst can see where the money is being made." | 15 |
| Return on capital is profit after tax from operations over the capital put in | "ROIC is defined as net operating profit after taxes (NOPAT) divided by invested capital... how much the company makes (NOPAT) compared to how much it has spent on its business (invested capital)." | 7 |
| The paper's term for the cost of capital is WACC, the weighted average cost of capital | "weighted average cost of capital (WACC)" | 1 |

Exhibit 11 (p. 16) is the form Studio draws: "Profit Pool – U.S. Airline Industry by Company", with
"ROIC Minus WACC (Percent)" on the vertical axis and "Share of Industry Invested Capital" on the
horizontal, one block per company. Exhibit 10 (p. 15) is the other form — by activity across a
whole value chain, airlines beside airports beside fuel — and Studio does not draw it (below).

## The cautions the surface carries

The paper gives three, p. 15, and a fourth follows from its own exhibits' notes:

1. **One year is not a cycle.** "looking at results over a business cycle is generally instructive
   because it reduces the impact of short-term or cyclical factors." Studio has each company's
   latest full year and no other, and says so beside the chart.
2. **One snapshot is not a story.** "periodic snapshots can indicate how competitive dynamics change
   over time", and p. 17: "consider whether there is a narrative that explains how and why the
   aggregate economic profit has changed." Exhibit 11 shows 2013, 2018 and 2023; Studio shows one
   year, so the checklist's "how has it evolved?" is unanswered here, and the surface says that
   rather than implying an answer.
3. **A large pool draws challengers.** "large profit pools may indicate opportunities or threats...
   a company's large economic profit may draw competitors seeking to capture some of that profit."
   The surface says it once and points to the threat of new entrants on the competition surface,
   which is where a learner works that question through.
4. **Studio's returns are not adjusted for intangibles; the paper's are.** Exhibit 11's note: "ROICs
   are adjusted for internally-generated intangible assets." The paper explains the adjustment
   "recognizes the rise of intangible investments that companies expense on the income statement"
   (p. 70) and reports that it "tends to pull the very high and very low ROICs toward the middle"
   (p. 70; similarly p. 52). Studio's ROIC is the traditional one defined in `roic.ts`. The surface
   says so and says which way the difference runs, which is all the paper supports.

## What the data behind it is

Every figure is already in `lib/studio-project/data/industries.json`, built from SEC XBRL on
2026-09-06 by `scripts/source/fetch-industry.mjs` and audited in
[`studio-industry-view.md`](studio-industry-view.md): each leading company's return on invested
capital and the invested capital it was computed on, for its latest full fiscal year. Invested
capital is OPS's own definition — borrowings plus equity less cash, leases outside it — set out and
argued in `roic.ts`.

The cost of capital is the industry's, from Damodaran (January 2026), rebuilt on the US Treasury's
most recent 10-year auction exactly as Investigate does by default, and audited in
[`studio-cost-of-capital.md`](studio-cost-of-capital.md). **Every company in an industry is judged
against the same figure.** That is an OPS simplification and the surface names it: a company's own
cost of capital differs with its own risk and borrowing, and no company reports one.

## Who is in each pool, and who is left out

The moat workspace proposal is explicit: "A profit-pool view must say which profit measure it uses
and what participants it covers." So each pool states the share of its industry's counted revenue
that its companies account for, and names every leading company it leaves out, with the reason.
Five reasons exist, each checked in `profit-pool.ts`. One, **no capital** (invested capital of
zero or less, which leaves nothing to give a block its width), is checked but applies to no company
in the current data. The other four:

- **Never counted.** The industry dataset already drops a company whose two revenue figures are too
  far apart to choose between, before any share is worked out. **Burlington Northern Santa Fe** is
  one: $23.4B of revenue against Union Pacific's $24.3B. The railroads' pool covers 99.4% of the
  revenue *counted*, and without naming BNSF that figure would read as nearly the whole industry.
  Every such company is named first in the pool's list of who is missing.

- **No return to draw.** The pipeline could not compute one — for five of the ten largest drug
  makers (Johnson & Johnson, Merck, Pfizer, Bristol-Myers Squibb and Eli Lilly), because
  their filings do not carry the operating profit line it reads. The drug makers' pool therefore
  covers about a fifth of that industry's revenue, and says so in the sentence under its chart, in
  the warning colour, not in a footnote.
- **Not in dollars.** The industry pipeline reads each company's filed facts across every currency
  they are tagged in and does not record which, so a company reporting in another currency
  arrives with its return correct (a ratio) and its invested capital in that currency. Drawn on a
  dollar axis it would be several times too wide. The check: the revenue behind the return
  (NOPAT over NOPAT margin) against the revenue the SEC's dollar-only frames record for the same
  company. Two are left out on it — **NetEase**, whose figures run 7.8 times its dollar revenue, and
  **JinkoSolar**, 5.2 times — both consistent with Chinese yuan. The check cannot see a currency
  worth about as much as the dollar, and the source panel says so. Every company kept runs between
  0.89 and 1.65 times, the spread explained by the two figures covering different years.
- **A figure Studio cannot stand behind.** **Universe Pharmaceuticals** is recorded with $23.0B of
  revenue for 2024 and $29.7B of invested capital, and its share of its industry's revenue went from
  0.008% in 2019 to 3.9% in 2024 — nearly five hundredfold. The pipeline's own check, which drops a
  company whose competing revenue figures are a thousandfold apart, could not test it because it
  filed only one. Studio cannot reach the SEC from here to check the filing, so it is left out
  rather than drawn as a loss of nearly $5 billion. The rule is general: a company whose share rose more
  than a hundredfold between the two years is held back and named. It catches this one company and
  no other.

This third finding is also a defect in the industry surface, which shows Universe Pharmaceuticals
as a leading drug maker. It is recorded in the ledger and not fixed here: the fix is a rebuilt
dataset, and rebuilding needs the SEC.

## What is deliberately not built

- **Exhibit 10's pool by activity** — suppliers, customers and the industry side by side, as the
  learner's industry map lays them out. It would need a return and invested capital for every kind of
  participant on the map. The paper's own came from IATA and McKinsey studies of aviation, and
  Studio has nothing equivalent for any industry.
- **Pools over time.** One year per company is all the dataset holds.
- **A pool for an industry Studio has not researched.** A learner's company outside the five is not
  placed in any of them. If its figures were filled from the SEC and it is one of a pool's companies,
  it is marked; otherwise the surface says nothing about where it would sit, because its figures are
  in whatever units the learner typed and a width needs dollars.

## What is OPS's, not the paper's

- **Why capital has a cost.** "That money has a cost, since lenders and shareholders could have put
  it elsewhere" is OPS's one-sentence gloss, the ordinary meaning of a cost of capital. The paper
  names WACC without explaining it at this point.
- **The worked example is a real block, not an invented one.** The page opens on the widest block in
  the pool that creates value — Nvidia, Union Pacific, Walmart, AbbVie or Microsoft — and works its
  arithmetic in words. When the learner has investigated a company that is in a pool, it opens on
  that one instead. Choosing either is OPS pedagogy; the numbers are the dataset's.
- **The three exclusion rules and their limits** (threefold for currency, hundredfold for a share
  rise) are OPS's, set in `profit-pool.ts` with the evidence for each.
- **Where it lives.** A page of its own under Research, reached from the industry page's breadcrumb
  row and from the map's source panel. It was planned as a fourth view on the industry page, and
  measuring that page first ruled it out: its existing "How they earn it" view is already 1.86
  screens at 1440, so a chart with its arithmetic had no room under its figures.

## Terms defined in place

*Economic profit*, *invested capital*, *cost of capital* (with WACC named once as the paper's term),
*profit pool* (the paper's term, glossed as where the money is made). Return on capital is taught on
the same page's "How they earn it" view and defined again here in one sentence, because a learner may
open this view first.
