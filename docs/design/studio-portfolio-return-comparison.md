# Two allocations over the same past months, 27 September 2026

Compare allocations answers "what would these weights do in a hypothetical
shock?". It could not answer "how would these two saved allocations have
behaved over the same historical months, and what explains the difference?".
Return history now can, in a new **Two allocations** view. The method, sources
and reference numbers are in the [source audit](../source-audits/studio-portfolio-return-comparison.md);
this record covers what was built and why.

## What a learner can do

Open **Studio → Portfolio → Return history → Two allocations**, or, from a
proposal on Compare allocations, **See both over past months in Return
history →**, which carries both allocations in the address
(`/studio/portfolio/returns?view=compare&a=…&b=…`).

1. **Choose data.** Pick two saved allocations. A table shows each investment's
   weight of all money in both, cash (the reserve plus anything unassigned),
   and which monthly history covers it: the fund's SEC reports, a local
   import, or a choice between several. A missing history is a button,
   **None · import one**, that opens the existing importer with the investment
   already chosen and returns to the comparison once the history is saved. The
   page then states the months both share, what was left out at either end
   and why nothing is filled, skipped or swapped; **Use fewer months** narrows
   the range for both.
2. **Compare.** Three definitions (monthly volatility, largest fall, rebalanced
   monthly) come first, then the two growth-of-100 paths on one scale beside a
   results table: compounded return, monthly volatility and largest fall with
   its high and low months. A line states "past months only: not a forecast, a
   limit on future losses, or proof your goals will be met". The calculation,
   a worked example, the covariance table and every source sit behind **How
   these are calculated, and the data used**.
3. **Inspect a month.** A keyboard slider, with previous and next buttons, steps
   through the months. Each row is an investment's contribution in percentage
   points of all money, with its weight and that month's return; beyond the
   four largest, the rest are one **Other holdings (n)** row that opens on
   request, so the visible rows and cash always add up to the month's return.
4. **Saved.** A name and a reason save the comparison with its own months,
   weights and history values. Reopening recomputes from those, never from
   today's inputs; if an allocation's weights, a history's values or a source
   changed since, the notice lists what changed, keeps the old results, and
   offers **Compare again with today’s inputs**. Saving never changes the
   selected allocation.

## Substantive choices

- **One place, not a new destination.** The comparison is a view of Return
  history, beside the existing inspection and import views, which are
  unchanged apart from a shorter introduction ("Total return: price changes
  plus reinvested payouts, such as dividends, each counted once"). The address
  keeps the view and both allocations, so reload and links return to it;
  unfinished choices, range, name and reason are kept for the tab in session
  storage, as other Studio drafts are.
- **One history per investment, chosen, never spliced.** Public histories are
  matched by exact share class; imports keep their currency and basis. A
  blocked state names the investment and the reason: no history, an
  individual bond, another currency, a mix of market-price and net-asset-value
  bases, no shared month, or too few months.
- **Two months is the minimum for a complete comparison.** One shared month can
  be compared and inspected but shows "Needs 2 months" for volatility and
  cannot be saved.
- **Direct labels, and keys only when names are long.** Each line is labelled at
  its end with the allocation's name and where 100 ended. Where the chart has
  no room beside the lines (a phone, or the half-width chart at 768 to 1280
  pixels) the same labels sit in a key above it. When either name is longer
  than 24 characters the chart, the results table and the month table say
  **First** and **Second**, with both full names in the key and in each column
  heading for screen readers. Names are never cut off.
- **No "100 became" row.** The end of each path is already on the chart's
  labels and in its text alternative; repeating it cost a row on every screen.
  The table keeps compounded return, volatility and largest fall.
- **Terms before numbers.** The three definitions sit above the chart and table,
  not below; the period's rules (months, rebalanced monthly, cash at 0%) head
  the view, and the chart's axis gives the dates and the starting value ("100
  at the start of Jan 2025", "End of Dec 2025"). The table of investments is
  captioned "Shares of all money and monthly histories", the term Compare
  allocations uses, so 60% of the money after a 20% reserve reads as 48.0%.
- **A failed save cannot duplicate.** Storage keeps a failed edit in the page's
  draft (Studio's shared behaviour). The comparison appears as "Not yet stored
  in this browser", the name and reason stay, and saving again replaces that
  attempt instead of adding a copy. Saving rebuilds the comparison from the
  project at the moment of saving and refuses if the allocations or histories
  changed underneath it.
- **Validation does not load the fund data.** Reading today's histories (the
  public bundle and a project's imports) and listing what changed since a save
  live in `return-comparison-sources.ts`. The calculation and the saved-record
  checks that every project load runs import no data, so Studio pages that only
  open a project do not download the return bundle.
- **Which changes matter.** A changed weight, budget, reserve, history value or
  removed history affects a saved comparison; a renamed allocation or an
  unrelated stress scenario does not change its numbers and is only noted.

## States

Fresh project with one allocation (asks for a second, links to Compare
allocations); choosing histories; public histories only; missing history;
individual bond; currency or basis mismatch; no overlap; one month; complete
comparison; month inspection with and without "Other holdings"; both
allocations entirely cash (the learner states the months); save pending, saved,
failed and retried; reopened unchanged; reopened with changed inputs; the most
saved comparisons (20).

## Layout and screen budget

Measured by `e2e/studio-return-comparison.spec.ts` in the production build,
900-pixel-high viewport, whole page including Studio's frame and footer, in
screens (page height ÷ 900). Fixture: bundled VTI with a synthetic AGG series,
12 shared months; "long" adds six holdings and two 80-character names.

| State | 390 | 768 | 1024 | 1280 | 1440 | 1920 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Blocked (no AGG history) | 1.37 | 1.25 | 1.19 | 1.20 | 1.20 | 1.20 |
| Choose data | 1.43 | 1.25 | 1.19 | 1.20 | 1.20 | 1.20 |
| Compare | 1.49 | 1.33 | 1.27 | 1.23 | 1.24 | 1.24 |
| Inspect a month | 1.34 | 1.24 | 1.18 | 1.19 | 1.17 | 1.17 |
| Saved | 1.39 | 1.32 | 1.27 | 1.25 | 1.25 | 1.25 |
| Reopened, inputs changed | **1.68** | 1.46 | 1.40 | 1.34 | 1.35 | 1.35 |
| Long names, choose | **1.82** | 1.48 | 1.42 | 1.38 | 1.38 | 1.38 |
| Long names, compare | **1.59** | 1.42 | 1.36 | 1.29 | 1.32 | 1.32 |
| Long names, month | **1.62** | 1.42 | 1.36 | 1.37 | 1.35 | 1.35 |

No state scrolls sideways at any width; no text is under 12px; nothing is set
in a monospace face; no page errors and no console errors. (Vercel's two
analytics scripts return 404 from a local production server on every page; the
test ignores exactly those two paths, as `studio-overview.spec.ts` does.)

**Baseline.** The existing Inspect history view measures 1.36 screens at 390
and 768, 1.30 at 1024 and 1.24 from 1280. Above the comparison's own tabs,
Studio's frame and the Return history heading take 0.50 screens at 390, 0.49 at
768 and 0.43-0.44 from 1024; the footer and the gap above it take 0.19-0.23. At
390 that leaves the comparison 0.81 screens of the 1.5.

**Not met.** The four bold cells exceed 1.5 at 390 pixels. A reopened
comparison with changed inputs adds its notice (what was saved, the learner's
reason, what changed, and two actions, in one paragraph and one row) to a Compare view already at 1.49, and six holdings
with 80-character names and long source names need more rows and lines than
0.81 screens hold. Fitting them would mean hiding the notice or the holdings,
or shrinking type, which the brief rules out. The test holds each to its
measured ceiling plus 0.01 so it cannot grow unnoticed. Every primary state
(blocked, choose, compare, month, saved) is within 1.5 at all six widths.

How the height was brought down, measured at each step: the chart and results
side by side wherever the panel is at least 640 pixels wide; definitions moved
above both; the step line replaced by the period's rules; the dates onto the
chart's axis; the growth end values kept on the chart only; the month table's
weights inline where it is wide; the months-shared sentence and the
"never filled or skipped" note merged; **Use fewer months** beside **Compare**;
each allocation picker's label inside its box ("First: …", still the
control's name for a screen reader); a shorter Return history introduction; on
a phone, a 112-pixel plot (a half-width chart beside the table keeps 150
pixels), 6-pixel table rows and a 24-pixel disclosure line (touch screens keep 44-pixel targets
through an enlarged hit area).

## Accessibility

Both rows of views are tabs with arrow-key, Home and End movement, and focus
stays on a tab when it is chosen. The **Compare →** button moves focus to the
Compare view's heading. The chart is hidden from assistive technology and
described by a text alternative with both end values and the dates; the results
table carries the same results. The month slider has a visible label, reads the
month as its value, and has 44-pixel previous and next buttons on touch
screens. Each blocked state and a failed save are announced. Selection lists
wrap long names rather than truncating them.

## Verification

- `lib/studio-project/return-comparison.test.ts` (34) and
  `return-comparison-saved.test.ts` (16): the audit's reference cases computed
  independently, the NIST matrix, alignment and blocking, weights and cash,
  saving, reopening, tampering, backup round trips, mode isolation and a full
  browser storage.
- `e2e/studio-return-comparison.spec.ts`: a fresh learner's journey (choose,
  import a missing history through the importer, compare against an
  independent calculation, step to a month by keyboard and add up its rows,
  save a reason, reload, reopen, change a weight on the Portfolio page, see the
  old result kept and a new run reflect the change, `selectedAlternativeId`
  unchanged throughout); the bundled VTI, VXUS and VOO histories compared
  through the page against an independent calculation; every blocked state; several histories for one
  investment with long names and six holdings; a full-storage failure and
  retry; six widths for nine states; and the Return history baseline.
- The browser tests were shown to fail when the code is wrong: dividing the
  variance by `n` instead of `n − 1`, letting a retry add a copy, and dropping
  the "Other holdings" row each fail the test written for them.

## Remaining limits

The four 390-pixel exceedances above. The comparison covers USD histories on
one basis, funds and stocks with a monthly history, and no individual bonds.
Monthly data cannot see a fall within a month. Cash earns 0%. No trading
costs, taxes, contributions or inflation. These are today's weights replayed
over past months, not an account's performance or an investable strategy.
