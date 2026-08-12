# Investment Foundations Module 4 learning and interaction plan

Plan date: 2026-08-09  
Source boundary: `docs/source-audits/damodaran-investment-philosophies-session-4.md`  
Status: Approved for implementation after source-integrity gate

## Module promise

Learners investigate a fictional Cedar Works annual report and produce an Investor Statement Brief. The module teaches them to read the three statements, identify the measurement logic behind reported numbers, calculate compatible ratios, distinguish reported accounting from analyst recasts, and trace cash from the company perspective to FCFE and FCFF.

The experience uses a filing X-ray and statement scanner. Controls exist only to reveal a statement relationship, reclassify an item, calculate a financial result, or test an investor conclusion.

## Beginner teaching sequence

| Lesson | Introduce | Model | Guided practice | Independent application | Assessment and artifact |
| --- | --- | --- | --- | --- | --- |
| 4.1 The Three Statements | Company, financial statement, point in time, period, asset, liability, equity, revenue, expense, cash flow | One sale on credit moves through all three statements without creating immediate cash | Open each Cedar Works statement and follow the sale | Match five investor questions to the statement and time lens that can answer them | Complete a Three-Statement Evidence Map |
| 4.2 Read the Balance Sheet | Accounting equation, current and long-lived assets, receivable, inventory, payable, debt, book value, market value, fair value, goodwill | Reconcile Cedar Works' $250m of assets with $150m of liabilities and $100m of equity | Classify reported line items and inspect each measurement basis | Diagnose which source answer is most likely closer to current value and why it is not guaranteed | Complete a Balance-Sheet X-ray |
| 4.3 Recast the Business | Assets in place, growth assets, debt claim, residual equity claim, reported statement versus analyst framework | Convert the accounting statement into Damodaran's financial balance sheet | Route line items and future projects into four analytical zones | Explain why growth assets are valued but not reported merely because management expects growth | Complete a Financial Balance-Sheet Map |
| 4.4 Read Profit and Leverage | Accrual, operating expense, financing expense, capital expenditure, depreciation, operating income, net income, margin, return, leverage | Run the Cedar Works income waterfall and build each formula from named inputs | Calculate operating margin, net margin, ROE, debt/capital, and interest coverage | Diagnose why pretax operating margin exceeds net margin | Complete a Profit and Leverage Lens |
| 4.5 Repair the Investor View | Lease, right-of-use asset, lease liability, present value, research versus development, analytical capitalization, amortization | Compare the source-era off-balance-sheet lease case with current Topic 842 / IFRS 16 reporting; build a five-year R&D recast | Calculate a 12-payment lease PV and the Cedar Works research asset | Reject double counting when a current statement already recognizes the lease; explain framework-dependent R&D treatment | Complete an Analyst Adjustment Memo |
| 4.6 Trace Cash to the Investor | CFO, CFI, CFF, working capital, capex, debt issuance/repayment, dividend, buyback, FCFE, FCFF | Scan Cedar Works from $39m net income to $47m CFO, then reconcile the $5m change in cash | Classify cash events and switch company/equity/firm perspective | Calculate FCFE and FCFF and answer five corrected source-assessment concepts | Save and defend the final Investor Statement Brief |

## Cedar Works OPS case

All figures are fictional OPS pedagogy in millions of dollars. They are designed to reconcile exactly and are not live market data.

### Balance sheet

| Asset | Amount | Claim | Amount |
| --- | ---: | --- | ---: |
| Cash | 20 | Accounts payable | 35 |
| Accounts receivable | 30 | Lease liabilities | 30 |
| Inventory | 50 | Debt | 65 |
| Property, plant, and equipment | 100 | Other liabilities | 20 |
| Goodwill | 20 | Shareholders' equity | 100 |
| Right-of-use asset | 30 |  |  |
| Total assets | 250 | Total claims | 250 |

### Income statement

| Line | Amount |
| --- | ---: |
| Revenue | 300 |
| Other operating costs | (210) |
| R&D expense | (20) |
| Lease expense | (10) |
| Operating income | 60 |
| Interest expense | (8) |
| Tax expense | (13) |
| Net income | 39 |

For the OPS case, average common equity is $100m, depreciation and amortization are $17m, and the simplified effective tax rate for analytical calculations is 25%.

Verified results:

- Operating margin: `60 / 300 = 20.0%`
- Net margin: `39 / 300 = 13.0%`
- ROE: `39 / 100 = 39.0%`
- Debt to capital, conventional debt only: `65 / (65 + 100) = 39.4%`
- Debt to capital including lease liability: `95 / (95 + 100) = 48.7%`
- Interest coverage: `60 / 8 = 7.5x`

### R&D analytical recast

Five-year straight-line model using R&D of $20m, $18m, $15m, $12m, and $10m from current through four years ago:

- Research asset: `20(100%) + 18(80%) + 15(60%) + 12(40%) + 10(20%) = $50.2m`
- Current amortization: `18(20%) + 15(20%) + 12(20%) + 10(20%) = $11.0m`
- Adjusted operating income: `60 + 20 - 11 = $69m`
- Base after-tax return on invested capital: `60(75%) / (100 + 65 + 30 - 20) = 25.7%`
- R&D-adjusted return on invested capital: `69(75%) / (175 + 50.2) = 23.0%`

The model demonstrates why adjusted operating income can rise while adjusted return on capital falls.

### Cash-flow statement

| Cash-flow item | Amount |
| --- | ---: |
| Net income | 39 |
| Depreciation and amortization | 17 |
| Increase in accounts receivable | (5) |
| Increase in inventory | (8) |
| Increase in accounts payable | 4 |
| Cash flow from operations | 47 |
| Capital expenditure | (25) |
| Acquisition | (10) |
| Cash flow from investing | (35) |
| New debt | 10 |
| Debt repayment | (5) |
| Dividends | (8) |
| Buybacks | (4) |
| Cash flow from financing | (7) |
| Net change in cash | 5 |

Simplified valuation cash flows:

- FCFE: `47 - 25 + (10 - 5) = $27m`
- FCFF: `47 + 8(1 - 25%) - 25 = $28m`

The acquisition is shown separately from recurring capex so learners can see the modeling choice. The lesson must state its chosen convention rather than silently mixing the two.

## Assessment coverage

| Assessed idea | Introduced | Modeled | Guided | Independent | Final check |
| --- | --- | --- | --- | --- | --- |
| Point-in-time versus period statements | 4.1 | 4.1 | 4.1 | 4.1 | 4.6 brief |
| Accounting equation and line-item classification | 4.1 | 4.2 | 4.2 | 4.2 | 4.6 source concept 1-2 |
| Book value versus current economic value | 4.2 | 4.2 | 4.2 | 4.2 | 4.6 source concept 1-2 |
| Financial balance-sheet recast | 4.3 | 4.3 | 4.3 | 4.3 | 4.6 brief |
| Accrual and expense classification | 4.1 | 4.4 | 4.4 | 4.4 | 4.6 brief |
| Margin, return, and leverage ratios | 4.4 | 4.4 | 4.4 | 4.4 | 4.6 source concept 3-4 |
| Current lease reporting versus analyst recast | 4.5 | 4.5 | 4.5 | 4.5 | 4.6 brief |
| US GAAP versus IFRS R&D treatment | 4.5 | 4.5 | 4.5 | 4.5 | 4.6 brief |
| Working-capital cash direction | 4.1 | 4.6 | 4.6 | 4.6 | 4.6 source concept 5 |
| CFO/CFI/CFF versus FCFE/FCFF | 4.6 | 4.6 | 4.6 | 4.6 | 4.6 brief |

## Visual and accessibility constraints

- Use a filing-as-source-code motif with statement tabs, source-line pins, scanning highlights, and equation traces.
- Keep all surfaces theme-aware through existing OPS classes and mapped Tailwind utilities; never use a hard-coded dark background.
- Use Inter for labels and numeric values, Fraunces for editorial headlines, and tabular figures for aligned statements.
- Every control must have a visible financial result and a keyboard-accessible button or input equivalent.
- Never rely on color alone; pair status colors with labels, icons, and explanatory text.
- Respect reduced motion; scans become immediate state changes when motion is reduced.
- On mobile, statement rows remain readable without horizontal page overflow; wide comparisons use contained overflow with clear labels.
- The learner can revisit completed missions and never loses the explanation that justified a correct answer.
