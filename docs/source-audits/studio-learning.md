# Studio: standalone learning and source coverage

Review date: 2026-09-04. Scope: `lib/studio-guidance.ts` and its integration contract.

This record covers the six stages of a US beginner's portfolio workspace: goal, research,
weights, risk and costs, buying worksheet, and operating rules. The user explicitly chose
access without completing Investment Foundations, a curated real-investment starting set,
individual stocks and bonds, foreign stocks, and a researched portfolio with a buying
worksheet and rules. A completed worksheet does not transmit a trade.

## 1. Edition and source lock

The OPS course is **Investment Foundations**, route `/courses/investment-foundations`,
with the 13-decision Portfolio Builder path in `data/courses/portfolioBuilder.ts`.
Its analytical source is Aswath Damodaran's **38-webcast Investment Philosophies** course,
companion to **Investment Philosophies, second edition, Wiley, 2012**. The controlling
sequence is [the official 38-webcast index](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/webcastinvphil.htm).
This is distinct from CFA Institute's similarly named foundation program and the longer
overhead sequence exposed by Damodaran's companion page.

Existing source reviews reused, with their original limitations intact:

- `damodaran-investment-philosophies-corpus-audit.md`: all 38 decks and tests reviewed;
  canonical narration unavailable for source-topic Sessions 5, 12, 24, 27 and 32.
- `portfolio-builder-practical-tools.md`: mission-to-control slide and caption references,
  current-primary-source layer, and boundaries for personal implementation.
- `mission-05-allocation.md`: goal, capacity, liquidity, allocation and transparent stress
  calculations; no recommended personal weights or universal concentration ceiling.
- `mission-12-holdings.md`: exact product identity, fund structure, overlap, costs, source
  age and order rehearsal. Its reviewed product figures apply only to its named filings.
- `mission-13-capstone.md`: contribution, withdrawal, rebalancing and review rules.

No new Damodaran narration claim is introduced. This audit reuses the established review
ledger; it does not claim to repeat the corpus's complete visual and caption review.

## 2. Supplemental official pages reviewed

The official article text was opened and read on the review date. These are prose pages,
not slide/video lessons. The review adds stable definitions and mechanics, not current
security prices, tax rates, legal conclusions or a market-data licence. This work did not
create hashed local copies and does not claim canonical-cache verification for these pages.

| ID | Official source and edition | Sections used |
| --- | --- | --- |
| P1 | [SEC Investor Preparedness Checklist](https://www.investor.gov/introduction-investing/general-resources/investor-preparedness-checklist), current page | Goals, debt, fees, research and periodic review |
| P2 | [SEC Beginners' Guide](https://www.investor.gov/additional-resources/general-resources/publications-research/info-sheets/beginners-guide-asset), current page | Allocation 101; time horizon; diversification within and across categories; three rebalancing methods; calendar/weight triggers |
| P3 | [SEC International Investing](https://www.investor.gov/introduction-investing/investing-basics/investment-products/international-investing), current page | International risks; ADRs; US-listed foreign shares; foreign-market access |
| P4 | [SEC American Depositary Receipts](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-88), August 17, 2012 | What an ADR represents; share ratio; depositary fees; research before investing. Historical program counts and example fee levels are excluded |
| P5 | [FINRA Currency Risk](https://www.finra.org/investors/insights/currency-risk-why-it-matters-you), December 5, 2024 | Currency exposure through securities and business operations. The source's return arithmetic is corrected below |
| P6 | [FINRA Bonds](https://www.finra.org/investors/investing/investment-products/bonds), current page | Bond pricing; selling between payment dates; broker compensation; duration/default risk; relevant glossary entries |
| P7 | [SEC Understanding Order Types](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-14), July 12, 2017, updated August 18, 2026 | Market and limit orders; broker-dependent availability and instructions |
| P8 | [SEC Mutual Funds](https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-funds-etfs/mutual-funds), current destination of the earlier fund-guide URL | Fund structure, expenses and fee tables; complements Mission 12's filing review |

The CFPB emergency-fund source in `goal.sources` reuses the reviewed Mission 5 source lock:
[An essential guide to building an emergency fund](https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/).
Its rule is situation-dependent reserve planning; Studio supplies no universal reserve size.

## 3. Claim and control coverage matrix

All sample amounts, scenarios, prompts and arithmetic exercises are **OPS adaptations**.
They illustrate a method; they do not recommend the sample portfolio, weights or review band.
Session page/time references below come from the existing practical-tools coverage matrix.

| Guidance / proposed control | Introduced concept and supporting source | OPS model and prerequisite | Guided action / independent application |
| --- | --- | --- | --- |
| `goal`: goal, deadline, cash, contributions | Investor-first process: S1 p4, 02:54–06:19; fit: S38 pp2–9, 00:20–07:35; P1 | Define portfolio, horizon and needs; $10,000 minus $2,000 leaves $8,000 | Enter a goal and near-term need; then enter the learner's own budget and date |
| `goal`: reserve, debt and loss limit | Mission 5 supplemental source review; P1; CFPB | Define reserve and distinguish loss capacity from willingness before asking either | Record each fact; uncertain answers remain visible and practice remains available |
| `research`: type, identity and official source | S4 pp3–7, 01:00–07:20; S37 pp2–3, 00:40–03:30; Mission 12 audit | Define stock, bond, fund and ETF before using those type labels | Inspect a candidate, compare an alternative, record date and reason; select another candidate independently |
| `research`: stock evidence and value | S4 pp8–18, 07:20–20:20; S5 pp2–13, slides only | Define a valuation range through cash, growth and risk assumptions | Write why the evidence supports the price assumption and what would change it |
| `research`: foreign shares and ADRs | P3; P4; P5 | Define ADR, business exposure, domicile and trading currency; fictional manufacturer's foreign customers affect profits | Inspect listing, ratio, depositary fees and operating exposure separately; repeat for chosen foreign holding |
| `build`: weights, cash and total | Mission 5; P2 | Weight = holding value / total; 25% of $10,000 = $2,500 | Change a weight and inspect dollars/cash; make all chosen weights plus cash total 100% |
| `build`: repeated exposures | Mission 12 instrument/issuer distinction; P2 | Two funds may own the same company; country labels alone do not establish diversification | Inspect available overlap and uncovered data; explain or adjust a repeated exposure |
| `risk`: stress and loss contribution | Mission 5 audited OPS policy; S3 p3, 00:28–02:39 and pp8–10, 09:12–14:51 | Define stress as an assumed outcome; 40% weight × 25% loss = 10% portfolio loss | Change an assumption; compare dollars lost with the goal's limit; independently revise/justify weights |
| `risk`: fees and trading costs | S6 pp5–17, 04:54–21:14; Mission 12 fee review; P8 | Define expense ratio and bid-ask spread; $10,000 × 0.20% = about $20 for constant value | Inspect annual and trading costs separately; enter dated assumptions for the selected products |
| `risk`: bond and currency risks | S2 pp4–6, 01:51–06:51, pp8–10, 07:33–11:08; P5–P6 | Define duration and default; show independent compounded FX arithmetic below | Review exposure assumptions and source dates; no future-loss ceiling or correlation guarantee |
| `buy`: shares, estimate and residual cash | Mission 12 order rehearsal; P7 | $500 / $60 gives 8 whole shares, $480 spent, $20 remaining before costs | Check quote date, currency, share unit and cash; independently choose final worksheet quantities |
| `buy`: bond face and cash price | P6 Bond Pricing and Selling Before the Maturity Date | Define face, accrued interest and trading increment; face × quote / 100, then separately stated extras | Verify quote convention, minimum face amount and broker accrual; use selected issue's data |
| `buy`: market/limit choice | P7 Market Order and Limit Order | Define each before use; price control and execution certainty are separate | Record a rehearsal instruction and review availability with the broker; no trade transmission |
| `review`: drift, rules and source changes | Mission 13; P2 Rebalancing / When to Consider Rebalancing; S38 p4, 02:35–03:59 | Define drift/percentage points; 26% minus 20% = 6 points | Set a personal trigger and review date; record actions for contributions, cash need, life change and contrary evidence |

## 4. Standalone learner sequence

Every stage must show its `definition` before the associated control. `example` models the
relationship, `action` guides the first attempt, and `terms` remain reachable beside the
work without opening a course lesson. The user then applies the same method to their own
selected candidates. Stage navigation has no lesson-completion lock.

Show examples, definitions and sources in a side panel or disclosure when necessary for
the screen budget. Do not turn all six stages into one long page. Validation explains the
specific missing input or inconsistent total and points back to the concept already
introduced. A reason/date/amount field being filled establishes a saved record, not proof
that an investment is sound. The final output is a reviewed worksheet with assumptions and
open issues, not a course grade or financial-competence certificate.

Before release, a fresh user must construct a plan, research a fund and a foreign security,
set weights, change a stress assumption, prepare a bond quantity and save rules entirely
within Studio. This source/sequence specification does not substitute for that UI test.

## 5. Independent numerical verification

| OPS example | Calculation | Result |
| --- | --- | --- |
| Money after near-term reserve | 10,000 − 2,000 | $8,000 |
| One year's new contributions | 200 × 12 | $2,400, before returns |
| Weight converted to dollars | 10,000 × 25 / 100 | $2,500 |
| One holding's stress contribution | 10,000 × 0.40 × 0.25 | $1,000 = 10% of portfolio |
| Constant-value expense illustration | 10,000 × 0.002 | $20; other costs excluded |
| Foreign asset and currency | (1 + 0.10) × (1 − 0.10) − 1 | −0.01 = −1% dollar return |
| Whole shares | floor(500 / 60) = 8; 8 × 60 = 480 | $20 left before costs |
| Conventional bond quote | 1,000 × 98.5 / 100 = 985; 985 + 10 + 2 | $997 with stated accrued interest and separate fees |
| Drift | 26 − 20 | 6 percentage points, exceeding an OPS example user-chosen 5-point review band |

The arithmetic was checked separately from the UI calculations using PowerShell decimal
operations. The examples introduce no expected-return forecast, standard stress magnitude
or recommended allocation.

## 6. Discrepancies and boundaries

- **FX arithmetic correction.** P5 says a 10% local-stock gain and 10% currency decline
  cancel. Compounding gives a 1% dollar loss. Studio uses the independently checked result.
- **Currency scope.** The FX example concerns an unhedged foreign-priced asset converted
  to dollars. ADR pricing also depends on the underlying shares and ratio; a US-dollar
  quote does not remove the business's currency exposure. Trading currency, legal domicile
  and operating geography are separate facts. The operating-geography separation is an
  OPS synthesis from P3–P5, not a measured exposure percentage.
- **Diversification scope.** International holdings or additional tickers do not guarantee
  reduced risk. No country or domicile percentage is represented as revenue exposure; no
  incomplete fund sample is represented as complete issuer overlap.
- **Bond scope.** The example uses a conventional fixed-principal bond with a quote that
  excludes accrued interest. It does not calculate an accrual convention or imply a $1,000
  universal minimum. Quotes already including accrued interest must not have it added
  twice. Broker markups can be embedded in price; only separate charges are added again.
  Inflation-linked principal, mortgage factors, defaulted flat trading, convertible terms,
  auction discount-rate formats and other special conventions need their own modelling.
- **Source breadth.** P6 is used only for the listed stable mechanics. Its broad product
  descriptions, tax examples, Treasury issuance lists and dated operational statements
  are not imported as current rules. P2's historical return statements and minimum stock
  counts are likewise excluded. P4 supplies ADR mechanics, not current fees or program totals.
- **Product evidence.** Each curated security needs its own official identity/source-date
  record. These explanatory pages do not verify a catalog's fee, quote, duration, domicile,
  bond terms or availability. Individual stock/bond research must preserve missing facts.
- **Model limits.** Stress results reflect entered scenarios, not probabilities or maximum
  possible losses. Annual fund expenses, trading charges and tax estimates are distinct.
  This layer computes no personalized tax liability or required-return recommendation.
- **Reuse boundary.** Old course-completion gates and the optional team/competition Studio
  specification do not apply to standalone entry. Existing course records must remain
  preserved; importing them requires clear ownership and dates rather than presumed truth.

## 7. Gate status

Source mapping, definitions and example verification are complete for this guidance file.
Supplemental pages have current official-web review, not new cache/hash verification.
No current product data or full source-authentic lesson release is claimed here.
Actual control coverage, fresh-user practice, persistence, numerical engine verification,
accessibility, themes, all six responsive widths and visual audit remain the implementation
cycle's release evidence. The Studio must not be marked release-ready from this document.
