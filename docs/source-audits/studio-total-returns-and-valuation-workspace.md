# Total returns and the valuation workspace

Method lock: 2026-09-20. OPS implementation conventions are stated separately from sources. No new course session or multi-stage valuation model is introduced.

## Sources and coverage

- SEC [Form N-PORT](https://www.sec.gov/files/formn-port.pdf), effective December 11, 2023 reference copy, Item B.5 (PDF page 9): reports monthly total returns for each share class and refers to Form N-1A Item 26(b)(1). Relevant instructions read in full.
- SEC [Form N-1A](https://www.sec.gov/files/form-n-1a.pdf), Item 26(b)(1), instructions 2-4 (PDF page 63): distributions are reinvested on the stated reinvestment dates and charges follow the prescribed conventions. These are fund-reported returns, not a reconstruction from the fund's holdings. Relevant instructions read in full.
- Existing share-class identity evidence: `lib/studio-project/data/fund-reports.json` and `studio-fund-reports.md`. Match both series and class; never pick the first class in a multi-class filing.
- Existing stable-growth valuation evidence: `damodaran-session-5-valuation-basics.md` and `studio-quantitative-methods.md` section 3. The new workspace reuses the audited arithmetic; it does not extend it to multi-stage forecasts, financial companies or loss-making businesses.
- Provider research: [Alpha Vantage documentation](https://www.alphavantage.co/documentation/) lists adjusted prices and split/dividend events; [Tiingo terms](https://api.tiingo.com/tos/) distinguish redistribution permissions. No commercial feed is enabled. The user selected public sources and local imports on 2026-09-20.

## Return conventions, before implementation

1. A total return includes distributions. A supplied total-return series already incorporates its source's reinvestment convention. Adding dividends again would double-count them.
2. Public fund histories use the reported ETF share class's monthly returns. Preserve SEC source URLs, class, reporting date, filing date and raw-file SHA-256. Read reporting dates from the XML itself, not a cached index or an accession's year. `rtn1`, `rtn2`, `rtn3` refer to the first, second and third months of the reported three-month period. Match overlapping months and refuse conflicts. Never mix ETF net-asset-value returns with exchange-price returns without identifying the basis.
3. Local CSV imports have one of two explicit monthly contracts: `month,total_return_pct` or `month,adjusted_close`. Month is `YYYY-MM`. For adjusted closes the user must confirm the source adjusts for both distributions and splits. The latter represents a source's total-return adjustment convention, not an executable market price. Raw `close` and separate dividend/split columns are refused. They cannot establish reinvestment returns without a complete event and price history.
4. Convert percentage returns to decimals once. Adjusted returns are `adjustedClose[t] / adjustedClose[t-1] - 1`. Require unique, ordered, consecutive months and finite, valid values; never fill missing months with zero. Imported series remain local, with a source label, currency and market-price/NAV basis. Imports do not certify provider data quality.
5. Compound a history as `product(1 + monthlyReturn) - 1`. Do not add the monthly percentages. Past return is not an expected-return forecast. This release supplies histories, not a covariance estimator or optimizer.
6. Public fund returns include the fund's reported expenses/distributions convention. Investor trading costs and personal taxes are not reconstructed. The user can inspect source months and dates. A short history is not evidence of a robust long-term risk model.

## Independent reference cases

- Adjusted levels 100, 102, 99 produce returns +2% and approximately -2.941176%; compounded result -1%.
- Returns +10%, -10% compound to -1%, not zero.
- A raw share price falling from 100 to 98 while a 2 distribution is paid has zero simple holding-period return if the cash is retained and there are no other changes. A raw-price-only calculation would say -2%. This example explains why raw closes are refused; it does not substitute for a reinvested history.
- A 2-for-1 split halves the raw per-share price without halving an unchanged investor's wealth. Properly adjusted levels preserve zero return in that controlled case.
- Existing valuation case: after-tax operating profit 150, cost of capital 10%, net debt 200 and 100 shares gives 13 per share with no growth. At 2% growth and a 1/6 incremental return on capital, reinvestment is 12%, business value 1,650 and equity value 14.50 per share.

## Learning and interaction map

| Surface | Introduce | Model/practice | Decision |
| --- | --- | --- | --- |
| Return history | Define total return including distributions | Inspect a public fund history and its source; example explains a dividend price drop | Choose a named holding, review basis and import a compatible local monthly series |
| Valuation | Define estimated value under stated assumptions | Clearly labeled OPS example; sourced figures before editable assumptions; live value/price comparison | Save separate scenarios with reasons, price dates and calculation inputs |

New valuation records preserve exact inputs, source metadata, assumptions and model version. Reopening restores those values rather than refreshing filings invisibly. Saved cases are independent of portfolio membership. Models explain unsupported figures and invalid growth/discount combinations. Dates, units, diluted-average-share limitations, and the single stable-growth assumption stay visible or one disclosure away.

## Release evidence

The public monthly histories were independently compounded over the periods covered by the separately extracted annual shareholder reports:

| Fund | Months checked | Compounded monthly returns | Annual report | Result |
| --- | --- | --- | --- | --- |
| VTI | 12 | 17.1360949252% | 17.14% | Agrees at reported precision |
| VOO | 12 | 17.8425730186% | 17.84% | Agrees at reported precision |
| VXUS | 12 | 24.8327881709% | 24.83% | Agrees at reported precision |

The test uses each annual report's actual period, including VXUS's October year end; it does not assume every fund has a calendar reporting year. All 54 public monthly observations have a matching exact-class source with a SHA-256 record. The offline rebuild checks raw-cache hashes and overlapping observations before writing the bundle.

The complete unit suite passed 1,052 tests across 81 files. New tests cover percentage conversion, compounding, split-adjusted levels, explicit adjustment confirmation, missing/duplicate/out-of-order months, nonfinite data, numerical overflow, share-class identity and cross-year quarters, valuation limits, share-receipt ratios, and backup round trips retaining source snapshots and unfinished scenarios. Rates prefilled from computations display up to six decimal places; source snapshots retain the original figures. The repeating-rate teaching example remains $14.50 per share at cent precision.

Initial visual review at all six widths identified P1 mobile height violations (up to 1.99 screens) and chart labels repainted dark by the global light theme. P2: excessive decimal digits. These findings were recorded before restructuring: phones now have a live value summary and a separate calculation view; source figures and the methodology have separate views; SVG labels preserve their intended contrast. The native scenario-copy interaction also exposed a pending-save race, corrected by copying the latest queued record and disabling the old form while the copy opens.

Production build, TypeScript checks and the complete browser regression suite passed. The browser run's saved result reports `passed` with no failed tests (September 20, confirmed September 21, 2026). New browser coverage exercises immediate scenario copying after edits, saved reasons and inputs, company-figure source snapshots, reopening the exact scenario without a silent data refresh, unsupported financial companies, import validation, and persisted total returns. The existing reader test now checks the visible page and restoration after reload, matching the reader's intentional conversion of page navigation to a paragraph anchor.

Final visual captures cover 390, 768, 1024, 1280, 1440 and 1920 pixels wide, each with a 900-pixel viewport height. Valuation figures, assumptions, sources, methodology and comparison views, plus return histories and both import steps, occupy 1.13-1.43 screens. Mobile calculation and growth-chart views are included. No captured view exceeds the 1.5-screen budget; horizontal overflow is zero and there are no browser page errors. Screenshot review confirmed readable chart labels and the corrected input precision. Detailed measurements and captures are recorded locally in `.agent-shots/valuation-history-report.md`.

This release provides a stable-growth valuation workspace and explicitly identified total-return histories. It does not claim an automatic dividend-adjusted history for every stock or a completed optimization engine.

## Company-search incident, September 21, 2026

The original local preview was launched inside a network-restricted process. Both SEC hosts failed with `EACCES`; requests from the same machine outside that restriction returned HTTP 200. The search message incorrectly attributed the failure to SEC availability. Restarting the preview with authorized network access restored the real directory and Apple annual figures. Fixture-based regression results had not established that the preview could reach those services.

The live check also exposed a source-save defect: `peer-figures` supplies `addedUp` and `periodEnd` on each figure, but the valuation's stricter source record accepts only `key`, `value` and `concepts`. Spreading API objects into the record caused a validation rejection. The mapping now explicitly selects the supported fields, with the annual period retained on the parent source record. The browser fixture includes the real API's extra fields to prevent this gap recurring. Editable figures in millions are rounded to six decimals; the source snapshot retains the original numbers.

Company search now falls back to a bundled, dated SEC directory when the live request fails, times out, returns malformed data, or lacks a configured contact. The snapshot contains 10,459 ticker entries fetched from `https://www.sec.gov/files/company_tickers.json` on September 21, 2026. Its retrieval time, canonical URL and raw-response SHA-256 are stored in `lib/filings/data/company-directory.json`; `scripts/source/update-company-directory.mjs` refreshes it using the declared contact. Saved-directory results disclose their date and possible missing new listings. It contains identities, not financial data or prices.

The start screen offers search retry and manual company entry. Failed figure loading retains the selected company, offers retry, and allows entry from an annual report without inventing figures. A case missing financial inputs opens on Figures and offers an explicit next step to Assumptions. Financial models and their limitations are unchanged.

Verification of the incident repair: TypeScript checks and 197 tests across the filing and valuation-record modules passed, including seven new directory-failure tests. A live in-app-browser run against the corrected preview searched Apple, loaded and saved its actual annual figures, reloaded the case, and inspected the retained SEC source for the year ended September 27, 2025. No fixture mode was used for that preview. Its saved inputs included $98,657 million of borrowings, $35,934 million of cash and 15,004.697 million diluted-average shares; the share ratio and future growth were left for user confirmation rather than supplied as guesses.

The final production-build browser suite passed 206 tests, with five existing opt-in/environment-dependent skips. Search results, failed figure loading and manual entry were captured at all six required widths, including all four visible Apple-name matches. These views occupy 1.00-1.47 screens with zero horizontal overflow; the complete valuation/return-history capture suite also passed. The final 390px and 1440px search/recovery screenshots and 390px Figures screenshot were inspected alongside the real Apple desktop case. No P0 or P1 defects remain in those captured states. P2: the “Load figures” arrow wraps onto a second line beside some longer company names on a phone; the complete action remains visible and clickable. Evidence: `.agent-shots/valuation-recovery-report.md` and `.agent-shots/valuation-history-report.md`.

September 24 follow-up: independent review found that the saved-case picker remained enabled during a pending company-figure request, allowing the eventual response to override a newly selected case. The picker now waits with the other company controls. A browser regression verifies that it becomes available after the request finishes and reopens the existing case correctly. All nine valuation/history/recovery browser tests passed against a fresh production build, including the six-width captures; the updated 390px Figures and 1440px results screenshots were reviewed. The local preview was rebuilt and restarted with network access, and live Apple search and seven annual figures were confirmed again. The existing Apple case reopened with its original saved inputs intact.
