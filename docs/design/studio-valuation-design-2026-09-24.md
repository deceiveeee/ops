# Valuation workspace design

The main task is now three steps: Figures → Assumptions → Value and price.
Saved scenario comparison and source inspection are supporting views. The
company/scenario selector remains visible; scenario actions share a compact
disclosure so the phone reaches financial inputs sooner.

The existing model, records and source snapshots remain unchanged. This is an
OPS presentation of the stable-growth model audited in
`../source-audits/damodaran-session-5-valuation-basics.md` and section 3 of
`../source-audits/studio-quantitative-methods.md`, not an investment firm's
proprietary valuation or a new multi-stage forecast.

| Visible element | Existing support | Learning sequence |
| --- | --- | --- |
| Filed figures, annual period, original source | Saved SEC snapshot and existing figure definitions | Inspect evidence before choosing assumptions |
| Explicit shares-per-traded-share confirmation | Existing equity bridge and receipt input | Explain ordinary shares and depositary receipts next to the control |
| Growth, return on new capital, cost of capital | Existing audited stable-growth method | Define each beside its input; show the cash consequence |
| Profit split into reinvestment and remaining cash | `firmValue`: reinvestment = growth / return; cash flow = profit × (1 − reinvestment) | Direct numerical cause and effect, derived only from current inputs |
| Business → shareholders → traded share | `equityFromFirm` | Explain debt, cash and share-count adjustments |
| Entered price, date and implied growth | Existing `impliedGrowth` result and validity guards | Compare only after a value can be calculated |

No assumed probabilities, live stock quotes, recommendations, or portfolio
weights are added. Missing inputs stay blank. Invalid values retain their
specific explanations. Loaded figures are never described as user-reviewed.

Validation covers existing persistence, recovery, source and keyboard behavior;
the three-step flow and changing reinvestment; and all six required widths.
Studio uses the site's fixed light theme with a dark calculation panel.

The phone's Value step separates price comparison from the full calculation
through See calculation / Back to price comparison. This keeps both tasks usable
within the screen budget. Invalid-input recovery opens and focuses the relevant
control, and secondary navigation moves focus to the new heading.

Final screenshot review: Figures, Assumptions, empty/filled prices, calculation,
scenario comparison and source views at 390, 768, 1024, 1280, 1440 and 1920px.
The recorded views measure 1.11–1.50 screens at a 900px viewport height, with no
horizontal overflow or page errors. The separate visual review found no remaining
P0/P1/P2 defects after repairing phone height, rate clipping and amount alignment.
Evidence: `.agent-shots/valuation-history-report.md` and matching PNG captures.

Release checks: TypeScript passed; production build passed; the full browser
suite passed 213 tests with 5 optional/environment-dependent skips. Live company
search returned Apple and the existing saved Apple case reopened in the preview.

## Comparison continuation, 25 September

The saved-scenario comparison uses the full work area. It shows growth, return
on new capital and cost of capital alongside each calculated share value, with
an action to reopen that exact record. The same-company filter is retained.
Changes to financial figures, share basis or filing period are identified
relative to the current scenario; growth alone must not appear to explain the
value difference. Numeric formatting must not mutate saved assumptions.

The displayed minimum and maximum span calculated same-company cases on the
current share basis (the same ticker and the same number of company shares per
traded share), including other pages. A value per receipt cannot share a range
or scale with a value per ordinary share, so calculated cases on another basis
stay listed with their ticker and ratio, outside the range, and are counted
separately. Cases which cannot be calculated remain visible and are counted
separately. One case shows one estimate, with an invitation to copy it.
This is an OPS comparison of user-created possibilities, without probabilities,
confidence intervals, an average target, or a portfolio-weight recommendation.
The existing audited calculation and source snapshots are reused unchanged.

Three scenarios show per page at every width. On a phone, each scenario's name
and value share a line, its differences sit under the name, and all three
labelled rates follow on one line. A value on another share basis carries its
ticker and ratio under it, wrapped to two short lines on a phone. Copy scenario
and the page controls share one row; the page buttons read Previous and Next
there, and keep the names Previous cases and Next cases for assistive
technology. The note under the table names the scenario the differences are
compared with.

Test assumptions, in Scenario options, shows value per traded share in a
three-by-three grid: growth and cost of capital each move down, stay, or move up
by 0.5, 1 or 2 percentage points around the current case. Company figures and
return on new capital stay fixed; a cell outside the model shows why.
Selecting a cell previews it. Save as new scenario creates a separate case with
those two rates and a note in its reasoning; the current scenario is unchanged.
No probabilities are assigned. On a phone the cells are 44px high, the preview
puts the value beside the rates, and Save as new scenario sits beside its note;
from 768px the grid and preview sit side by side.

Browser coverage (`e2e/studio-valuation-sensitivity.spec.ts`): all nine cells
against hand-worked values, keyboard selection, preview without saving, saving a
separate scenario with the original and its source unchanged, a wider step that
returns the selection to the centre, a cell beyond the model's limit that
explains itself and cannot be saved, and an unfinished scenario that leads back
to its missing input. Screen check with the widest one-point value ($103.00) and
a selected preview: 1.47 screens at 390px (1.62 before the compact layout), 1.40
at 768 (1.62 before), 1.34 at 1024, 1280, 1440 and 1920; no horizontal
overflow, broken values or page errors. Evidence:
`.agent-shots/valuation-sensitivity-report.md` and matching PNG captures.

Screen check with three dense rows (different figures, traded-share basis and
report dates): 1.47 screens at 390px (1.71 before the phone layout), 1.46 at
768, 1.40 at 1024, 1.43 at 1280 and 1.41 at 1440 and 1920, each at a 900px
viewport height, with no horizontal overflow or page errors. Evidence:
`.agent-shots/valuation-comparison-report.md` and matching PNG captures.

Release checks, 25 September, with the share-basis and sensitivity work in
place: TypeScript passed; unit tests passed 1,120 of 1,120; the production build
passed; after the sensitivity browser test and compact layout, the full browser
suite passed 224 tests with 5 optional or environment-dependent skips and no
failures. An earlier full run of the same
day failed one company report reader test, which shares no code with valuation;
it and a second reader test that failed once on a rerun each passed repeatedly
when run alone.
