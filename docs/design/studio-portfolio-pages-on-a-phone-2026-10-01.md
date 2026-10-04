# How much goes where and What to buy, within a screen and a half, 1 October 2026

The last two Portfolio pages measured over the 1.5-screen budget. With three
holdings, How much goes where was 1.82 screens on a phone and 1.66 at 1024px;
What to buy was 3.20 on a phone and 1.80 even at 1440px. With five holdings
they reached 2.17 and 4.84.

## What to buy

Every investment's worksheet was open at once: a price line, three inputs
stacked, four figures and a warning that repeated under every investment.

- **A list and one worksheet.** A table pages through every investment, what to buy
  and its estimated total, then the total and what stays in cash. A worksheet
  opens from the list: side by side from 1440px; narrower, the list comes
  first, the worksheet opens from it, and "← All investments" goes back. The
  same pattern as Risk with several scenarios. (First built side by side from
  768px; see the audit below.)
- **The broker's price, date and fee are behind "Use your broker's price, date
  and fee".** They are optional. The section opens by itself once any of them
  is set, so a price that changes the figures is never hidden.
- **Each warning once, where it belongs.** "Not today's price" is said in the
  line about the price, and once under the list; a bond's unknown interest is
  said beside the link that works it out. The readable plan and the spreadsheet
  keep every warning as before (`PRICE_ON_RECORD_WARNING`,
  `ACCRUED_UNKNOWN_WARNING` in `lib/studio.ts`).
- **"Nothing here places an order" is in the subtitle**, not a box of its own.
- Below 1440px, while a worksheet is open, the title stays and the subtitle and
  "Before you start" are left out (`StageHeading`'s `narrowTitleOnly`): the
  worksheet is only reached from the list, where both are read, and a reload
  returns to the list.

The list's total and what stays in cash add back to the starting amount: each
order's total and leftover make its target, and the reserve and unassigned
money are the rest. A browser test holds that.

## How much goes where

- **Each holding is two lines and its limit one.** On a phone the symbol and
  name share a line, and what the weight comes to sits under them beside the
  box. What limits the weight is the readable plan's sentence in a one-line
  form (`describeRoomShort`); the readable plan keeps the full sentence.
- **The total is the table's last line**, with one sentence under it, instead of
  a box of its own.
- **Below 1280px, three holdings at a time**, as Compare allocations shows them,
  with "‹ 1–3 of 5 ›" on the total's line. From 1280px five holdings are listed
  at a time. The total always includes every holding.
- Column headings say which money each figure is of: "Of the $9,000", "Of all
  money", "Dollars".
- The "Of all money" figures were light grey on white from 768px, a 1.48
  contrast: a width-prefixed colour the light theme does not remap. They now
  measure 10.0.

## Shared

The strip of the weights' totals ("To invest · Assigned · Investments") is gone
from every page. Each page carries its own totals, and on each page it took a
phone past the budget.

## Measurements before the final eight-holding fixes

Screens at a 900px viewport. "Touch" is a phone with a coarse pointer, whose
44px rows and boxes are the tallest the pages get.

| | 390 | 768 | 1024 | 1280 | 1440 | 1920 | Touch |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| How much goes where, 3 | 1.42 | 1.46 | 1.39 | 1.16 | 1.16 | 1.16 | 1.42 |
| How much goes where, 5 | 1.43 | 1.47 | 1.41 | 1.30 | 1.30 | 1.30 | 1.44 |
| What to buy, 5, list | 1.39 | 1.34 | 1.28 | 1.25 | 1.25 | 1.25 | 1.44 |
| What to buy, a fund open, inputs open | 1.22 | 1.04 | 1.01 | 1.25 | 1.25 | 1.25 | 1.25 |
| What to buy, the bond open, inputs open | 1.43 | 1.15 | 1.09 | 1.25 | 1.41 | 1.41 | 1.46 |

Browser tests hold every row of this table to 1.5, and the worksheet rows with
a coarse pointer at every width as well (at most 1.44 above a phone's width).

## Audit, 3 October 2026

A six-width look at both pages, with every worksheet opened at every width,
found two defects in What to buy that the tests above did not cover. The first
version of the worksheet test measured a phone only.

- **Too tall beside the list.** Side by side from 768px, the worksheet had half
  a tablet's width and wrapped: the bond with its inputs open was 1.76 screens
  at 768px, 1.69 at 1024px and 1.51 at 1280px (1.78 on a touch tablet), a fund
  with its inputs open 1.52 at 768px, and the bond with them closed 1.51. At
  1280px each column was 256px of text, narrower than a phone's. The two now
  sit side by side from 1440px only, where each has a phone's width or more.
  Narrower, the worksheet opens in the list's place, with its four figures in
  one row and its three inputs in one row from 640px.
- **The broker's inputs closed while being typed in.** The section was open
  only while a price, date or fee was set, so deleting a price to type it again
  closed the section and took the cursor. Once opened or typed in, it now stays
  open for that investment until another is chosen.
- "Incomplete" under an order's total was 11px and is 12px.

Both defects have a browser test that failed before the change: every
worksheet at every width, mouse and finger, and typing then clearing a price
and a date.

## Final fixes and audit, 3 October 2026

The independent review also found eight-holding overflow, inaccessible full
names, 11px labels, and dollar figures requiring horizontal scrolling at
1280px. These are resolved in the final implementation:

- How much goes where shows three holdings below 1280px and five above it.
  What to buy shows five per page. Portfolio totals and cash always include
  every page; edits on later pages survive reload.
- Pressing an investment's name in the weights table opens its full name in
  a native dialog. Escape and Close dismiss it and return keyboard focus.
- Fixed table columns keep dollar figures visible at 1280px. Long names may
  still use an ellipsis in the row, with the full name available from it.
- Worksheet statistics and portfolio summary labels have a 12px floor.
- The first buying row shows selection styling below 1440px only while its
  worksheet is open. Returning from a worksheet restores its row's page and
  keyboard focus, including after resizing from a desktop.

Final production captures use a 900px viewport. The eight-holding rows below
show the tallest page at each width, including later pages.

| | 390 | 768 | 1024 | 1280 | 1440 | 1920 | Touch phone |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| How much goes where, 8 | 1.44 | 1.47 | 1.41 | 1.31 | 1.31 | 1.31 | 1.44 |
| What to buy, 8, list | 1.42 | 1.37 | 1.31 | 1.26 | 1.26 | 1.26 | 1.50 |
| What to buy, bond open, inputs open | 1.43 | 1.15 | 1.09 | 1.26 | 1.42 | 1.42 | 1.43 |

The stage preamble, measured from the page title to the first table control,
is at most 0.40 screens for weights and 0.47 for buying. The application
navigation above the title is measured separately. Viewport captures confirm
that the header remains sticky at the top; its displaced appearance in some
full-page captures is a screenshot artifact.

The final visual review found no P0 or P1 defects in the captured states.
There is no page overflow, nested vertical scroll region, unexpected console
error, visible text below 12px, or active text below 4.5:1 contrast. Disabled
pager arrows are intentionally dimmed. The touch buying list is very close to
the 1.5-screen limit; future changes to its copy or chrome must remeasure it.

Validation: 1,260 unit tests passed. The production browser suite had 277
passes, five conditional skips, and one filing-reader selection failure; all
14 reader tests passed against the same build on rerun. All Portfolio checks
passed, including mouse and touch worksheets at all six widths, full-name
keyboard dismissal, later-page persistence, and whole-portfolio cash totals.
The separate capture audit passed 11 cases, followed by one viewport-boundary
check. No temporary audit spec is included in the product test suite.
