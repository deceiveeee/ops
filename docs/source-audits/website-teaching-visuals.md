# Website teaching visuals

Reviewed 2026-09-10. These are original OPS visual explanations, not reproductions of a source course's slides. Each visual has a specific learning purpose. The approved homepage treatment is one static Fed chart in the hero, three dated observations, one interpretation, source credit, and an optional link to the Board's fuller explanation. The earlier additional Fed section and company bar chart have been removed from the homepage. Course discovery and introduction visuals remain separate from this homepage revision.

## 1. Source lock and reuse

### Interest-rate history

- Provider: Board of Governors of the Federal Reserve System, H.15 Selected Interest Rates.
- Series: `H15/H15/RIFSPFF_N.M` / `RIFSPFF_N.M`, Federal funds effective rate.
- Period: January 2022–December 2024, 36 monthly observations.
- Units: percent per year, multiplier 1; monthly averages include every calendar day. H.15 specifies a 360-day annualization basis.
- [Official release and footnotes](https://www.federalreserve.gov/releases/h15/).
- [Exact download](https://www.federalreserve.gov/datadownload/Output.aspx?rel=H15&series=40afb80a445c5903ca2c4888e40f3f1f&lastobs=&from=01/01/2022&to=12/31/2024&filetype=csv&label=include&layout=seriescolumn).
- Original downloaded CSV is preserved at `data/h15-effective-federal-funds-2022-2024.csv`, alongside this audit. All UI values are compared against it in the tests.
- [Board reuse policy](https://www.federalreserve.gov/disclaimer.htm): information is generally public domain unless otherwise indicated; source attribution is requested. No additional copyright notice appeared in the selected data. OPS draws its own graph and includes source credit; it does not copy seals, logos, a source chart image, or an embedded Board webpage.
- Data came directly from the Board, not from FRED. FRED's third-party series and service terms are not assumed to grant blanket reuse permission.
- [Definition and transmission explanation](https://www.federalreserve.gov/monetarypolicy/monetary-policy-what-are-its-goals-how-does-it-work.htm).

### Atkore results

- Source: Atkore Inc., 2025 Form 10-K, fiscal year ended September 30, 2025, Item 7, Results of Operations, fiscal 2025 compared with fiscal 2024 (printed pages 40–41).
- [Original filing](https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm).
- Net sales, USD thousands: 2024 = 3,202,053; 2025 = 2,850,378.
- Operating income, USD thousands: 2024 = 624,784; 2025 = 23,173.
- Asset impairment charges, USD thousands: 2025 = 214,386; 2024 = zero.
- OPS draws an original comparison from reported numerical facts, not a screenshot or reproduction of company artwork. The existing original filing link remains immediately available. A filing hosted by SEC is not assumed to make the company's entire document public domain.

### Loss and recovery

Original OPS arithmetic illustration. Start at $100, lose 20% ($20), retain $80, then gain 25% of $80 ($20) to return to $100. No historical return, forecast, trading strategy or recommended allocation is implied. No deposits, withdrawals, fees or taxes are included.

## 2. Learning coverage and limits

| Visual | What the learner should understand | Evidence / boundary |
| --- | --- | --- |
| Federal funds history | An interest-rate assumption should be checked against its time period; the rate environment can change materially. | Actual monthly observations; 0.08% in Jan 2022, 5.33% in Aug 2023, 4.48% in Dec 2024. |
| Historical observation buttons | A specific point on the line represents a dated monthly average. | Keyboard-operable buttons update the point, rate and plain-language explanation together. |
| Company results comparison | Sales and operating profit can move by very different percentages; the report provides the context. | Same 0–3,500 million dollar scale for both selected metrics; source definitions precede further investigation. |
| Loss-recovery bars | Percentage gains after a loss apply to a smaller base. | $100 → $80 → $100, with −20% and +25% explicitly labeled. |

The homepage uses the plain label “Banks’ overnight borrowing rate” for the effective federal funds rate. It highlights January 2022 (0.08%), August 2023 (5.33%) and December 2024 (4.48%) with dates beside the values. The effective rate is distinct from a policy target range, consumer borrowing rate, savings yield, or valuation discount rate. The chart is marked historical, not live. Monthly points use equal month spacing and straight segments between observed monthly averages; the line does not claim to plot intra-month daily policy decisions. The homepage overview has no rate buttons or data table. The component's detailed mode retains those features for deeper explanations.

The homepage takeaway is “Higher interest rates generally make borrowing more expensive, which can slow spending and investment.” It summarizes the Board's monetary-policy transmission explanation linked above; “generally” and “can” preserve the conditional relationship. The chart replaces the homepage's illustrative cash-flow demo. No causal claim is made that a particular Fed move explains a particular company's results.

The Atkore chart does not attribute the entire profit decline to impairment charges. The existing note retains the charge context and points to the full filing. Percentage changes are calculated from unrounded source numbers, then displayed to one decimal place. Dollar labels convert thousands to millions and round to one decimal place.

No lesson assessments, source-edition claims, or course lecture content are introduced by these entry-page illustrations. Lecture deck/caption review and learner progression gates are not applicable to this bounded change.

## 3. Numerical checks

- Net sales: `(2,850,378 / 3,202,053 - 1) × 100`, rounding to −11.0%.
- Operating income: `(23,173 / 624,784 - 1) × 100`, rounding to −96.3%.
- Loss recovery: `loss / (100 - loss) × 100`; 20% loss requires 25% recovery. Tests also verify the identity for 0%, 10%, 50% and 90% loss and reject total loss.
- All 36 Fed observations are tested against the preserved original CSV.

## 4. Accessibility and implementation

Source links, dates and units accompany the graphs. SVG descriptions state the time range, scale and key values. Axis labels use HTML so they keep a readable font size at narrow widths. Color is supplemented by years, dollar amounts, positive/negative signs and text explanations. Rate buttons expose their pressed state and changes through a live region. Compact linked course previews contain no nested links or controls. Motion honors reduced-motion preferences.

Validation results are recorded after the final checks. Browser visual QA is not claimed unless it has been performed.

## Approved homepage validation

- TypeScript check passed.
- Focused chart suite: 6 tests passed, including all 36 historical observations and the static homepage presentation.
- Isolated production build passed using the project's public application settings. Two pre-existing React hook warnings remain in onboarding files.
- Full production end-to-end suite: 74 passed, 4 optional tests skipped.
- After the axis-label alignment correction, the production build and the two homepage/mobile-navigation checks passed again.
- Final preview uses that verified production build at http://127.0.0.1:3012. Relevant source files match the preview copy by SHA-256.
- The previous development preview had missing JavaScript chunks; it was replaced with the verified production preview.
- No publication or deployment was performed. No manual screenshot-based visual QA is claimed.
