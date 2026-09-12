# Online data and built-in tools for the Studio research workspace

Research run 2026-09-10 from
[`studio-online-data-and-tools-research.md`](../agent-prompts/studio-online-data-and-tools-research.md).

Status: **complete for this run.** Nothing below is a claim unless it is labelled **Verified**
(read firsthand or probed, dated), **Reported** (a provider or third party says so) or
**Inferred** (reasoning, marked as such). No product code was changed and nothing is committed.

## 1. For the user

**What a beginner could do with free public data, without leaving Studio:**
- Read Atkore's figures from its own annual report, each with the report and date beside it,
  instead of copying seven numbers from another site.
- See what Atkore sells, where, and to whom. Its filing breaks revenue into six product lines
  and four regions, and states customer concentration.
- Find where the report discusses resin and steel costs and selling prices, and save that
  passage as evidence for or against an explanation.
- Check the explanation against official producer-price data. For example, resin prices rose
  between January 2024 and August 2026 while plastic-pipe prices fell (BLS).
- Value the company with a dated share price and a dated government borrowing rate, and finish
  "What to buy" with a dated research price instead of a broker's quote.
- See a fund's actual returns and costs, from the fund's own shareholder report.

**Where Studio fell short when this was measured on 2026-09-10.** §13 records what has been
fixed since.
- Finishing the Atkore journey needed **4 outside websites**. Two remain.
- Atkore's industry is not in the industry view. Still open, but no longer silent: Investigate now
  says when a company's industry is not one Studio has researched, instead of reading its figures
  against semiconductors without comment.
- Investigate told learners the government borrowing rate was undated and from January 2025, while
  its source says January 2026. **Fixed.**
- Studio used 3.96% for that rate, against 4.683% at the 10-year auction of 12 August 2026.
  **Fixed:** it now uses the auction of 9 September 2026, 4.834%, with its date beside it.

**Blocked or not yet proven:**
- **Corporate bond prices.** The method works for Treasury bills (checked against Treasury's own
  rates). Corporate bonds need one 16 MB download, which needs your go-ahead.
- **Peer groups.** SEC data leaves out private competitors, and Atkore's industry code is mostly
  battery and EV-charger makers. Atkore's peers must be chosen by hand, with the gaps named.
- **Daily or live prices.** These need a paid licence that permits display. No free source allows
  it; one business plan costs $2,499 a month plus exchange fees. Not recommended.

**Cost.** The recommended sources are free. The ongoing cost is upkeep: roughly half a day a
month to refresh and check the data (an estimate, not measured).

**Decisions for you (§12):**
1. Download one bond-fund filing.
2. Say whether OPS is non-commercial.
3. Fix the borrowing-rate note first.
4. Move the filing reader into Studio.

## 2. Orientation

Working tree at start: the other session's homepage and courses work, uncommitted, plus this
prompt. Studio Phase 1 is committed as `144bfc7` and pushed.

The following contradict the prompt's context snapshot or each other, and are kept here rather
than smoothed over:

1. **The site has accounts.** Sign-up, log-in and password reset run on Supabase, and course
   progress syncs to them. Studio work does not. The prompt was corrected before this run.
2. **Company figures carry no unit.** `ResolvedFigure` in `lib/studio-project/metrics.ts` has
   concept, value, period, accession, form and filing date, but no unit. The source has one:
   company facts key every value by unit (`USD`, `shares`). Verified, §5.1.
3. **Damodaran's data vintage.** `studio-cost-of-capital.md` says his page carries no date and
   the newest dated archive is January 2025. **Verified 2026-09-10:** his cost-of-capital-by-
   industry page (`datafile/wacc.html`) says "Last Updated in January 2026", and his
   current-data page gives the full update as 2026-01-09. So the audit's vintage note is out of
   date. **Inferred:** the 3.96% implied risk-free rate is January 2026's.
   - **Resolved 2026-09-10.** The pipeline was reading `wacc.htm`, which holds the same table as
     `wacc.html` (compared cell for cell) but has no date line. It now reads `wacc.html`, the page
     his index links, and records the vintage as January 2026. No industry figure changed.
4. **Two "Outstanding for M1" items look closed.** Item 2 (Damodaran permitted use) is settled
   in `studio-cost-of-capital.md`. Item 4 (a decision on prices) was taken on 2026-09-05, and D2
   is recorded as resolved in the same file. Both are proposed for closing in §12.
5. **Buying asks for an outside quote.** The "What to buy" page tells the learner to enter the
   price their broker shows. Handoff F10 says the learner should not need an external quote to
   finish the educational workflow. This is logged in the friction walk (§7.1).

## 3. What the learner needs (stream A)

This is the field inventory M1 still lacked, for the Atkore journey (handoff §9) and the basic
portfolio loop.

Kinds: **fact** is a source fact, **assumption** is the learner's own choice with a worked example,
and **judgment** is the learner's own words.

"Has now" means Studio shows it to a learner today, inside Studio.

### 3.1 The Atkore journey

| Step | What the learner needs | Kind | Has now | Time basis and unit | Candidate source |
| --- | --- | --- | --- | --- | --- |
| Find | The industry's registrants and their dated revenue, margins and returns on capital | fact | Only for industries in the industry view; Atkore's SIC 3690 is to be checked | Fiscal years, USD | SEC submissions and XBRL frames |
| Find | Valuation measures: price to earnings, enterprise value to operating profit, free-cash-flow yield | fact, derived | No | Price date plus the latest fiscal year | Price snapshot × shares; debt and cash from company facts |
| Find | Quality measures: return on capital, margin stability, leverage | fact, derived | Partly, in Investigate, from typed figures | Fiscal years | Company facts |
| Find | How the screen is built: metrics, direction, winsorization, weights | assumption | No; no quantile code exists | n/a | Method written up from reviewed sources |
| Find | Why a company made the shortlist or was dropped | judgment | No; the research record comes next | n/a | The learner |
| Understand | What the business does | fact, text | Filing reader, outside Studio, 2,600-character excerpts | Filing date | 10-K Item 1 |
| Understand | Revenue by product line and by region | fact | No | Fiscal years, USD | The filing's XBRL data (dimensional; not in company facts) |
| Understand | Customers and distributors, and customer concentration | fact, text and figures | No | Fiscal years, % | Item 1 text; `ConcentrationRiskPercentage1` in the filing's XBRL data |
| Understand | Industry conditions: demand drivers and input costs | fact | No | Monthly series | Census construction spending; BLS producer prices |
| Investigate | Return on capital, margins and cash flow for several years, with definitions and periods | fact | Investigate, from **learner-typed** figures | Fiscal years, USD | Company facts (with units) |
| Investigate | What each figure means and where it came from | fact | The concept name only | n/a | Taxonomy labels (terms to check, §5.1) |
| Test explanations | Filing passages on pricing, volume, input costs, demand and customer concentration | fact, text | Filing reader outside Studio; no search inside a filing | Filing date | EDGAR documents; EDGAR full-text search to find passages |
| Test explanations | Input-cost series to test an explanation against | fact | No | Monthly index | BLS producer price indexes |
| Test explanations | Evidence saved for and against each explanation | judgment and pointer | Storage only; no screen | Saved date | The learner, pointing at a source id and locator |
| Value | A dated share price | fact | Price snapshot (N-PORT implied); Atkore coverage to check | Report date, USD | Price snapshot |
| Value | Shares outstanding, debt, cash, leases | fact | No | Balance-sheet date | Company facts; cover page (`dei`) |
| Value | Risk-free rate | fact | Damodaran's implied 3.96%, vintage in question | Daily | Treasury par yield curve |
| Value | Equity risk premium, industry cost of capital | fact | Yes, 96 industries | Annual update | Damodaran, industry level |
| Value | Growth, margins, reinvestment, the period after the forecast | assumption | No | n/a | Worked example first (the Damodaran identity is in `valuation-basics.ts`) |
| Compare | The same measures for two or more alternatives | fact | Only for 12 resolved companies, not side by side | Fiscal years | Company facts; price snapshot |
| Decide | Conclusion, role, main risks, what would prove it wrong | judgment | Storage only; no screen | Saved date | The learner |
| Revisit | A newer snapshot and what it changed | fact, versioned | Price snapshots are versioned; there is no dependency graph | Snapshot dates | Snapshot diff |

### 3.2 The portfolio loop

| Area | What the learner needs | Kind | Has now | Candidate source |
| --- | --- | --- | --- | --- |
| Goal and limits | Amounts, dates, horizon, loss limits | assumption and judgment | Yes | The learner |
| Goal and limits | Inflation, to state a real goal | fact | No | BLS consumer price index |
| Funds | Identity, fees, holdings | fact | Five catalogue funds | Prospectus; N-PORT |
| Funds | Total returns and distributions | fact | No (the price snapshot is price only) | Fund shareholder reports (Form N-CSR, inline XBRL) or the risk/return data sets, §5.1 |
| Funds | Duration and credit for bond funds | fact | No | N-PORT per-holding terms; shareholder reports |
| Treasury bond | Issue terms | fact | One note, from the auction record | Fiscal Data auctions |
| Treasury bond | A dated price after issue, and accrued interest | fact and calculation | No; the auction price only; accrued interest deliberately null | FedInvest end-of-day prices, or N-PORT implied per $100 face; day-count code (missing) |
| Corporate bond | Issue terms: coupon, maturity, call terms, seniority | fact | No | Prospectus supplement on EDGAR; N-PORT debt fields |
| Corporate bond | Issuer financial strength | fact | No | Company facts |
| Corporate bond | A dated price | fact | No | N-PORT implied per $100 face; FINRA TRACE (terms to check) |
| Foreign stock | Domicile, listing, reporting currency, depositary ratio | fact | TSMC, in the catalogue | 20-F; catalogue |
| Foreign stock | Financial statements | fact | No | Company facts, `ifrs-full` or `us-gaap`, in reporting currency, §5.1 |
| Foreign stock | Exchange rates | fact | No (N-PORT carries its own rate) | Federal Reserve H.10; ECB reference rates; Treasury rates of exchange |
| Risk | Return histories for covariance | fact | Price returns, monthly by pooling | Price snapshot; dividends and distributions for total return |
| Buying | A dated research price per holding | fact | **No: the learner must enter a broker quote** | Price snapshot; Treasury prices |
| Rules and review | Rules, drift, review dates | assumption and judgment | Yes | The learner |

## 4. Candidates and triage

The candidates considered for each field group, and what happened to each. Verdicts and evidence
are in §5. "Not probed today" means the terms were read but no request was made.

| Field group | Candidates considered | Outcome |
| --- | --- | --- |
| Identity, filings list, industry code | SEC submissions; SEC ticker files; GLEIF LEI; OpenFIGI; CUSIP | SEC submissions: **use**. LEI: **use** (CC0). FIGI: **use** (public domain). CUSIP: **use with conditions** |
| Financial figures | SEC company facts; XBRL frames; each filing's own XBRL data file; Financial Statement and Notes data sets; commercial fundamentals feeds | Company facts and frames: **use**. The filing's data file: **use**, per filing on the server, for product lines, regions and customer concentration. FSN data sets: **needs the user** (bulk: 72–298 MB a month). Commercial feeds: not needed |
| Filing text | EDGAR documents (the existing reader); EDGAR full-text search; commercial transcripts | EDGAR: **use**. Full-text search: **use**, on the server. Transcripts: excluded (licensed, and not needed for §9) |
| Foreign statements | Company facts for 20-F filers; ESEF (filings.xbrl.org); EDINET; SEDAR+; Companies House | Company facts: **use** (verified for SAP, Novo Nordisk, Toyota, ASML and TSMC). Non-SEC registries not pursued: the curated set needs only SEC registrants |
| Fund facts and returns | Prospectus; N-PORT; shareholder reports (N-CSR, `oef` XBRL); risk/return data sets | N-PORT and N-CSR: **use**. Risk/return data sets: bulk, and not needed |
| Stock prices | N-PORT implied (in hand); Tiingo; Alpha Vantage; Stooq; paid display licences | N-PORT implied: **use** (verified 2026-09-05). The free tiers were rejected on terms on 2026-09-05. Paid licences: §11 |
| Treasury prices and rates | N-PORT implied bill and note prices; FedInvest; Treasury's par yield curve and bill rates; Fiscal Data auctions; H.15 through the Board's download program | N-PORT implied: **use** (verified against Treasury's rates). FedInvest: **needs the user** (written consent). Treasury's curve and bill rates: **needs the user** for display, because Treasury's own reuse terms were not found firsthand; used here only to check the bill prices. Fiscal Data auctions: **use**, including each auction's high yield (§5.4). H.15 through the download program: **reject for snapshots** (being retired in favour of FRED) |
| Corporate bond prices and terms | N-PORT implied per $100 face; FINRA TRACE; prospectus supplements (424B2) on EDGAR | N-PORT: method verified on bills; corporate bonds unmeasured and need one bond-fund file (§12). TRACE: §11. 424B2: **use** (SEC terms; not probed today) |
| Exchange rates | H.10 through the download program; ECB reference rates; Treasury rates of exchange; N-PORT's own rates | ECB: **use with conditions** (cite, note changes). Treasury rates of exchange: **use** (quarterly). N-PORT's rates: **use**, dated per filing. H.10 through the download program: **reject for snapshots** |
| Industry conditions | BLS producer prices; Census construction spending; FRED | BLS: **use** (API v1 verified). Census: **use with its notice** (not probed today). FRED: **reject** (no storing) |
| Inflation | BLS consumer prices; FRED | BLS: **use** (same terms, not probed today) |
| Industry cost of capital | Damodaran (in hand) | **Use**, industry level only; vintage January 2026 |
| Business descriptions | 10-K Item 1; Wikipedia; Wikidata | Item 1: **use**. Wikipedia: **reject as a fact source**: secondary, and CC BY-SA 4.0 requires share-alike for adapted text (verified). Wikidata not evaluated |
| Analyst estimates, news | Commercial feeds | Excluded: licensing and labelling burden, and not required by §9 |

## 5. Findings by source, as established

### 5.1 SEC EDGAR

All probed 2026-09-10 with the project's declared User-Agent, throttled to one request per
400 ms. The probe script and raw results sit in the session scratchpad; this section is the
durable record.

- **Terms. Verified.** The SEC's privacy page, "Website Dissemination": information on sec.gov
  "may be copied or further distributed" without the SEC's permission; citation is requested.
  The fair-access page asks automated requests to declare a User-Agent naming a company and a
  contact address.
- **Browser access. Verified.**
  - `data.sec.gov/submissions` returned `Access-Control-Allow-Origin: *` on GET and OPTIONS.
  - `data.sec.gov/api/xbrl/companyfacts` returned **no** allow-origin header on a GET that carried
    an Origin, and 403 on OPTIONS.
  - `www.sec.gov/files/company_tickers.json` returned no allow-origin header.
  - Full-text search (`efts.sec.gov`) returned `*` on one request and nothing on another.
  - **Consequence:** a learner's browser cannot reliably call these directly. Browsers also cannot
    set the User-Agent the SEC asks for. SEC data must be fetched by the server or ahead of time,
    which is what `lib/filings/edgar.ts` and `scripts/source/` already do.
- **Atkore's filings list. Verified.** SIC 3690, "Miscellaneous Electrical Machinery, Equipment
  & Supplies"; NYSE: ATKR; fiscal year ends 30 September. Latest 10-K: `0001628280-25-054049`,
  filed 2025-11-26, for the year ended 2025-09-30, in inline XBRL.
- **Atkore's company facts. Verified.** 2.30 MB uncompressed (161 KB transferred). 460 US-GAAP
  concepts. Every value is keyed by its unit (`USD`, `shares`), and every row carries `start`,
  `end`, `val`, `accn`, `fy`, `fp`, `form`, `filed` and `frame`. Present:
  - revenue as `RevenueFromContractWithCustomerExcludingAssessedTax`;
  - gross profit, operating income, net income;
  - operating cash flow, capital spending;
  - long-term debt, cash, equity, assets;
  - diluted shares, tax expense.

  Absent: `Revenues`, `InterestExpense` (another concept will carry it) and
  `ConcentrationRiskPercentage1`.
- **Atkore's filing data file. Verified.** `atkr-20250930_htm.xml`, 2.42 MB, with 332 contexts.
  What company facts lacks is here, because company facts leaves out dimensional values:
  - revenue by product line, six lines on `srt:ProductOrServiceAxis`: metal electrical conduit
    and fittings; plastic pipe, conduit and fittings; electrical cable and flexible conduit; other
    electrical products; mechanical tube; other safety and infrastructure products;
  - four regions on `srt:StatementGeographicalAxis`;
  - 48 segment contexts;
  - 14 customer-concentration facts;
  - each debt instrument by name, including senior notes due 2031 and a term loan due 2032.
- **Foreign issuers. Verified.** Company facts carries 20-F filers' statements in their reporting
  currency:
  - SAP: `ifrs-full`, 368 concepts, revenue in EUR for 11 annual periods to 2025-12-31;
  - Novo Nordisk: `ifrs-full`, 253 concepts, DKK, 7 periods to 2025-12-31;
  - Toyota: `ifrs-full`, 221 concepts, JPY, 6 periods to 2025-03-31, plus older `us-gaap`;
  - ASML: `us-gaap` only (623 concepts). It files its 20-F under US rules.
  - TSMC, which is in the catalogue: `ifrs-full`, 334 concepts, revenue in TWD and USD, but its
    latest annual period ends 2024-12-31. Its FY2025 20-F (`0001628280-26-025362`) is
    XBRL-tagged: 202 files, including `FilingSummary.xml`. **So company facts can lag a
    filing.** Check each company before relying on it, and fall back to the filing's own data
    file.

  `metrics.ts` reads only `us-gaap`, so foreign stocks need an IFRS concept map and currency
  handling before it can serve them.
- **Full-text search. Verified.** A search for "PVC resin" in Atkore's 10-Ks returned 10 hits as
  JSON, back to 2018. This is the way to find the passages "Test explanations" needs.
  - Limited to filings since 2025-10-01: "PVC resin", "resin", and "steel" with "copper" each
    match the FY2025 10-K. "Average selling prices" matches that 10-K and all three 10-Qs since.
  - Search finds the **document**, not the passage. The reader still needs a find-in-this-filing
    step to reach the paragraph.
- **Atkore's industry code is a poor peer group. Verified.** EDGAR's company list for SIC 3690
  with 10-K filings shows 100 companies on its first page, the page maximum.
  - They are mostly battery and EV-charging makers and dormant shells: Amprius, Clarios,
    ChargePoint, Blink Charging, Beam Global, Dragonfly Energy, and others.
  - Atkore is among them, but makers of conduit, cable and fittings barely are.
  - So an industry-code peer group would compare Atkore with battery companies. Its peer set must
    be chosen deliberately, and private competitors named as missing (moat proposal §6).
- **Bulk data sets. Verified.**
  - The Financial Statement and Notes data sets are monthly since November 2020 and include
    dimensional detail. Sizes: 298 MB (2026-08), 103 MB (2026-07), 72 MB (2026-06). This is bulk;
    it would need the user's go-ahead to download.
  - The Mutual Fund Prospectus Risk/Return Summary data sets exist and update quarterly.

### 5.2 US government and central-bank sources

| Source | Terms, read firsthand 2026-09-10 | Access |
| --- | --- | --- |
| BLS | **Verified:** everything BLS publishes is public domain, except previously copyrighted photographs and illustrations; citation requested | API v1 needs no key: 25 queries a day, 25 series per query, 10 years. v2's key needs an email, an organization and a CAPTCHA, so **needs the user** |
| Census | **Verified:** services may display and analyse Census data. Required notice: the product uses the Census Bureau Data API but is not endorsed or certified by it. No identifying respondents. Terms dated 2026-04-14 | Key not strictly required; limits set by Census |
| Treasury Fiscal Data | **Verified:** "offered free, without restriction", including commercial use | Open, no key or registration. The auctions dataset covers 1979-11-15 to date; last updated 2026-09-10 |
| Treasury par yield curve | **Not verified.** Treasury's reuse statement was not found firsthand, so display **needs the user** (§12). Fiscal Data's auction yields are the verified route (§5.4) | **Verified:** CSV and XML downloads, daily, from 1 month to 30 years |
| Federal Reserve Board | **Verified:** public domain unless otherwise indicated; non-Board material needs the owner's permission | H.10 exchange rates and H.15 interest rates are Board releases |
| ECB | **Verified:** free reuse, commercial included, if reproduced accurately with the ECB cited as the source | Reference rates, daily |
| FRED | **Verified: unsuitable as a source.** Its prohibitions forbid storing, caching or archiving any FRED content. Series owned by third parties need the owner's permission for anything beyond personal use. An API key is required | Use the original publishers (BLS, the Board, Treasury) instead. FRED stays useful for finding a series |

### 5.3 Identifiers

| Source | Terms, read firsthand 2026-09-10 | Use |
| --- | --- | --- |
| GLEIF (LEI) | **Verified:** CC0 1.0 for data through its access service | Issuer identity; already the matching key for fund look-through |
| OpenFIGI | **Verified:** ToS §1 dedicates FIGI identifiers and descriptions to the public domain | Listing and share-class identity. **Verified:** a key is optional. Without one: 25 requests a minute, 10 jobs per request. With one: 25 per 6 seconds, 100 jobs. A key needs an account, so **needs the user**, but a curated set doesn't need one |

### 5.4 Prices, returns and rates

**Stock prices: Atkore is covered.** Verified from the local cache.
- The 2026-09-05 snapshot holds 12 Atkore observations, matched on ISIN `US0476491081` and LEI
  `52990002TI38AM4RPV48`, all Level 1 (quoted market prices). Examples: $61.50 on 2025-02-28,
  $59.99 on 2025-03-31, $65.10 on 2025-05-31.
- Each observation is corroborated by one filing only.
- **No price reaches a learner.** The snapshot sits only in the git-ignored `.source-cache/`, and
  `lib/studio-project/data/` holds industries and cost of capital but no prices.

**Bond prices.**
- Every cached N-PORT file is an equity fund (VOO, VTI, VXUS, a Russell 3000 fund), so a bond
  fund's filing was needed. **With the user's go-ahead on 2026-09-10**, AGG's `primary_doc.xml`
  (15,916,949 bytes, report date 2026-05-31) was downloaded and measured.
- **The filed value is a clean price. Verified, and the check could have failed.**
  - AGG's 295 Treasury notes and bonds were turned into yields at next-day settlement
    (2026-06-01, actual/actual day count), then compared with Treasury's par yield curve for
    2026-05-29.
  - Read as clean (accrued interest excluded): median gap +0.03 points. All 295 are within 0.25,
    and 231 within 0.10.
  - Read as dirty (accrued interest included): median gap +0.17 points, up to +0.83. 207 are
    within 0.25, and 71 within 0.10.
  - So the value excludes accrued interest, as fair value does. Studio must add accrued interest
    itself to show what a buyer pays.
- **Corporate bonds look like investment-grade market prices. Verified.** 8,381 fixed-rate plain
  corporate bonds (asset-backed and mortgage-backed excluded), all Level 2: evaluated prices, not
  trades.
  - Spread over Treasuries of the same maturity: median 0.71 points (5th percentile 0.24, 95th
    1.33). 37 are below zero; none is above 5.
  - Price per $100 of face: median $98.58 (5th percentile $68.80, 95th $106.15).
  - Examples: Apple's 2.65% bond due 2050 at $61.90 (a 5.54% yield); Walmart's 4% due 2029 at
    $99.56 (4.16%).
- **What this settles:**
  - Corporate bond prices can come from N-PORT, dated to the fund's report date and labelled as
    fund-reported evaluated prices. They are clean, and Studio adds accrued interest.
  - Coverage is limited to bonds a US fund holds.
  - The yields here assume 30/360 and ignore call features, so they are a check, not figures to
    show.
  - The par curve was used only for this check (§5.2).
- **Treasury bills, verified.** SGOV's N-PORT (accession `0002071691-26-016719`, report date
  2026-05-31) states 22 bills by principal amount with a USD value. For example, bill `912797QX8`,
  maturing 2026-06-11, implies $99.899472 per $100 of face. All 22 are Level 2.
- **The bill prices behave like market prices. Verified, and the check could have failed.**
  - Treasury published bank-discount rates of 3.60–3.64% for 2026-05-29, the last business day
    of May, across 4- to 52-week bills.
  - For each SGOV bill I computed the discount rate its price implies: (100 − price) × 360 ÷ days
    to maturity.
  - Measured from the standard next-business-day settlement (T+1, 2026-06-01), all 22 bills fall
    within 0.05 points of Treasury's range: minimum 3.566%, median 3.626%, maximum 3.650%.
  - Measured from the valuation date (2026-05-29), 0 of 22 do. Measured from the report date
    (2026-05-31), 5 of 22 do.
  - So the result depends on the settlement convention. T+1 is the market's own convention
    (**Reported**). I chose it after trying three, and that is recorded here rather than hidden.
  - What a learner should take from this: a bill's price means nothing without its settlement
    date, which is exactly what handoff F5 asks Studio to show.

**Fund total returns.** Verified.
- The annual shareholder report is Form N-CSR in inline XBRL, `oef` taxonomy. Vanguard Index Funds,
  period 2025-12-31, accession `0001104659-26-021519`; data file 5.44 MB, 16 share classes.
- It carries:
  - 156 `oef:AvgAnnlRtrPct` facts (average annual returns);
  - 1,965 `oef:AccmVal` facts (the growth-of-$10,000 chart);
  - expense ratio, advisory fees paid, holdings count, and a holdings breakdown (`oef:PctOfNav`,
    192 facts).
- Sample: 17.71% for calendar 2025, share class `C000007773`, without sales load.
- Semiannual reports (N-CSRS) carry expenses and holdings but not returns.
- The VTI prospectus filing in the catalogue has no XBRL; it's a 107 KB supplement.

**Industry inputs, BLS producer price indexes.** Verified. API v1, no key, one query returned
monthly data from January 2024 to August 2026 (August preliminary):

| Series | Title (from BLS's June 2026 id list) | Jan 2024 | Aug 2026 |
| --- | --- | ---: | ---: |
| WPU0662 | Thermoplastic resins and plastics materials | 264.566 | 283.105 |
| WPU06621201 | Thermoplastic resins and plastics materials, a sub-index (base December 2003; verified on data.bls.gov) | 183.846 | 196.728 |
| WPU07210603 | Plastics pipe | 191.252 | 182.506 |
| WPU101706 | Steel pipe and tube | 389.270 | 434.299 |
| WPU10260314 | Copper wire and cable | 385.557 | 602.480 |
| WPU1017 | Steel mill products | 321.392 | 381.162 |

**Inferred, and not a finding about Atkore:** resin prices rising while plastic pipe prices fall is
exactly the kind of evidence the journey's "Test explanations" step asks a learner to weigh
against other explanations. It can come from public-domain data, inside Studio.

**Rates.**
- **TreasuryDirect, including FedInvest prices. Verified** (`treasurydirect.gov/terms.htm`): its
  material may be viewed, downloaded and printed for non-commercial personal use only. Publicly
  displaying Fiscal Service intellectual property needs prior written consent. The historical
  price page is a POST form with a session token, not a feed. Verdict: **needs the user**
  (written consent). The N-PORT route above is the lawful alternative.
- **Treasury's daily bill rates. Verified:** CSV and XML are available. For 2026-05-29 the
  bank-discount rates were 3.60–3.64% across 4 to 52 weeks. They are secondary-market quotations
  the New York Fed obtains at about 3:30 pm. Treasury's own copyright statement was not found
  firsthand; **Reported** by search: federal employees' work on the site may be freely copied,
  with credit requested.
- **H.15, Federal Reserve Board. Verified:** Treasury constant-maturity yields from 1 month to 30
  years, sourced to the US Treasury. **But the Board's Data Download Program is being retired.**
  Its "Build Your Package" feature goes in the week of 9 November, and users are pointed to
  FRED, whose terms forbid storing data (§5.2). So H.15 is no longer a clean snapshot route.
  Take Treasury yields from Fiscal Data's auction records instead (next item).
- **Exchange rates, Treasury Fiscal Data. Verified:** the `rates_of_exchange` endpoint (quarterly)
  is under Fiscal Data's open terms.
- **The risk-free rate: auction yields. Verified** from Fiscal Data's `auctions_query` (open API,
  no key):
  - The 10-year note `91282CRF0`, auctioned 2026-08-12, yielded **4.683%** (coupon 4.625%, price
    99.540696). The one auctioned 2026-05-12 yielded 4.468%.
  - **A trap:** the newest record labelled "10-Year" (`91282CRE3`, auctioned 2026-07-23, 2.438%)
    has `inflation_index_security = Yes`. It is an inflation-protected note, whose yield is a real
    rate. A query for "the latest 10-year" must filter on that field.
  - Studio's default is 3.96% (Damodaran, January 2026). **Inferred:** the gap comes from yields
    moving since January. The figures themselves are verified.
  - The pipeline built for R1 found a newer auction. The note reopened on 2026-09-09 at
    **4.834%**, and news coverage of that auction gives the same figure (**Reported**, and
    independent of Fiscal Data).

**Bond trade data and CUSIPs.**
- **FINRA TRACE. Verified** (`finra.org/filing-reporting/trace/pricing`):
  - real-time display costs $60 a month per professional user;
  - redistributing enhanced historic TRACE data costs $1 per CUSIP per calendar year, at most
    $1,000 a year;
  - personal, non-commercial use is free;
  - end-of-day market aggregate statistics and the FINRA–Bloomberg indices are free.

  This is an option in §11, not a current source.
- **CUSIPs. Verified** from CGS's own licence FAQ (a PDF with fees stated for 2015, so it is
  dated):
  - A licence is required to receive CUSIP data directly from CGS, or in downloadable,
    machine-readable or bulk form from anyone.
  - Display-only access through a distributor's screen needs no licence.
  - CUSIPs in public documents may be collected and stored "for non-commercial use", provided the
    source has the legal authority to permit reproduction. The SEC does (§5.1).
  - **Verdict: use with conditions.**
    - Take CUSIPs only from SEC filings or Treasury records.
    - Show one only where a learner needs it, for example to find a bond at a broker.
    - Never offer CUSIPs as a download.
    - Match records on LEI or FIGI instead.
  - If OPS becomes commercial, this **needs the user**: it becomes a CGS licence question. The FAQ's
    age is a reason to confirm it before launch in any case.

### 5.5 Hosting

**Verified**, Vercel documentation last updated 2026-08-24:
- Functions return at most **4.5 MB** of response body.
- Duration: 300 s on Hobby; 800 s on Pro.
- Memory: 2 GB on Hobby.

**Inferred:** a server route can fetch and slim a 2.4 MB filing data file or a 2.3 MB company-facts
file, but must never pass a raw N-PORT file (up to 8 MB) through to the browser.

### 5.6 Libraries

**Verified** from the npm registry, 2026-09-10. "Weekly" is last week's downloads.

| Package | Licence | Latest, published | Unpacked | Weekly | Use | Verdict |
| --- | --- | --- | ---: | ---: | --- | --- |
| `ml-matrix` | MIT | 6.15.0, 2026-08-05 | 1.1 MB | 874k | n×n algebra, Cholesky, eigen | Use |
| `simple-statistics` | ISC | 7.12.0, 2026-09-08 | 1.3 MB | 652k | Quantiles, z-scores, no dependencies | Use |
| `d3-array` | ISC | 3.2.4, 2023-05-30 | 160 KB | 55M | Quantiles | Use (small) |
| `quadprog` | MIT | 2.0.0, 2026-06-25 | 44 KB | 28k | Constrained mean-variance | Use, pending an independent test |
| `javascript-lp-solver` | Unlicense | 1.0.3, 2026-01-24 | 2.3 MB | 51k | Linear programmes, including CVaR | Maybe |
| `mathjs` | Apache-2.0 | 15.2.0, 2026-04-07 | 9.2 MB | 2.0M | General maths | Reject, too heavy for what it adds |
| `jstat` | none stated | 1.9.6, 2022-11-21 | 690 KB | 500k | Distributions | Reject: no licence in the registry, and stale |
| `uplot` | MIT | 1.6.32, 2025-03-14 | 533 KB | 302k | Fast time-series charts | Use for long series |
| `recharts` | MIT | 3.10.1, 2026-07-25 | 7.3 MB | 30M | Simple charts (named in `AGENTS.md`) | Use, lazy-loaded |
| `@visx/xychart` | MIT | 4.0.0, 2026-06-11 | 421 KB | 252k | Composable charts | Maybe |
| `dompurify` | MPL-2.0 or Apache-2.0 | 3.4.15, 2026-09-06 | 1.8 MB | 35M | Making filing HTML safe | Use |
| `sanitize-html` | MIT | 2.17.7, 2026-08-13 | 74 KB | 5.7M | Server-side sanitizing | Use |
| `xbrl-parser` | MIT | 1.2.4, 2024-08-02 | 185 KB | 28 | XBRL | Reject: effectively unmaintained |
| `ixbrl-viewer` | Apache-2.0 | 1.5.4, 2026-09-10 | 1.7 MB | 150 | Arelle's inline XBRL viewer | A pattern to study, not a dependency |

## 6. Tools (stream E)

**Default: build.** Source integrity, the evidence trail and the teaching all depend on owning the
tool. Every tool below uses only sources with a Use or Use-with-conditions verdict in §5.

"Outside sites removed" refers to the four counted in §7.1:
1. the annual-report figures;
2. the Treasury yield;
3. the broker quote;
4. the full filing on sec.gov.

| Tool | The learner's question | Journey step | Data (verdict) | Code to reuse | New maths, and its independent check | Runs where | Teach first | Effort and main risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Evidence panel with "Save as evidence"** | What supports or challenges my explanation? | Test explanations; Decide | Any passage or figure with a stable source id and locator: SEC accession plus section or concept (use). Catalogue sources first need ids | `EvidenceReference`, `updateCandidate`, `lib/filings/sections.ts` | None. Anchor passages the Hypothesis way (verified, §7.3): exact quote plus prefix and suffix plus position, so a changed page can still be matched | Stored in the browser; passages extracted on the server | Evidence is not a conclusion; supports, challenges, background | M. Risk: the catalogue sources have no ids | **Build first**, with the research record |
| **Filing reader inside Research: whole sections, and "find in this filing"** | Where does the company say this? | Understand; Test explanations | EDGAR documents and full-text search (use) | `lib/filings/edgar.ts`, `sections.ts` | None | Server fetches, caches, sanitizes and pages the text; the browser shows one section at a time | What each Item is for (the reader's "What to look for" text exists) | M. Risks: a 4.5 MB response ceiling; sections the parser cannot find (it already says so) | **Build.** Removes outside site 4, and handoff F3 asks for whole sections inside Studio |
| **Investigate, filled from the annual report** | Is this business creating value? | Investigate | Company facts, with units (use) | `metrics.ts`, `roic.ts`, `fetch-fundamentals.mjs` | None. Carry the unit through `ResolvedFigure` | Curated companies ahead of time; any SEC registrant on request through the server, slimmed | Exists: each figure's "?" | S–M. Risk: company facts can lag (TSMC), so fall back to the filing's own data file and say so | **Build.** Removes outside site 1; the learner can still type over any figure |
| **Dated research prices in the app** | What did it cost, on what date? | Value; What to buy | N-PORT implied prices for stocks and Treasury bills (use) | `prices.ts`, the 2026-09-05 snapshot | None; label Level 1 and Level 2 | Shipped ahead of time as a slim versioned file, as industries and cost of capital already are | What a fund-reported value is, and why its date matters | S. Risk: prices for the catalogue ETFs' own shares are not yet measured | **Build.** Removes outside site 3 for stocks and bills; the broker quote stays as an optional override |
| **Dated risk-free rate** | What does lending to the government pay? | Investigate; Value | The latest nominal 10-year note's auction high yield, from Fiscal Data (use). Treasury's daily curve only once its terms are confirmed | The cost-of-capital pipeline | None | Ahead of time, dated | Exists in Investigate | S | **Build now.** Removes outside site 2 and replaces the stale note (§7.1) |
| **Product lines, regions and customers** | What does it sell, where, and to whom? | Understand | The filing's own XBRL data file (use) | None | Shares of a total, reconciled to the segment total | Server or ahead of time. Custom members need labels from the filing's label file (`_lab.xml`, 1.1 MB for Atkore) | Segment; customer concentration | M. Risk: company-specific member names | **Build**, after the first three |
| **Input costs and demand** | Did costs or demand explain the change? | Test explanations | BLS producer prices (use); Census construction spending (use with its notice) | None | Rebasing an index; percentage change. Say plainly that moving together is not proof | Ahead of time; BLS v1 allows 25 queries a day, which is ample | What a price index is | S–M. Risk: choosing the wrong series. Tie each series to an input the filing itself names | **Build**, Phase 2 |
| **Fund returns and costs** | What has this fund returned, after costs? | Portfolio loop (funds) | Shareholder reports, `oef` XBRL (use) | Catalogue pipeline | None. Match share class to ticker through `company_tickers_mf.json` | Ahead of time, twice a year | Past returns do not predict (the report's own tagged statement) | S–M. Risk: matching share classes | **Build** |
| **Peer table and screen with its working shown** | Why did this one make my shortlist, and why not that one? | Find | Company facts and frames; N-PORT prices; per-sector templates (use) | `industry.ts`, `metrics.ts`, `prices.ts` | Quantiles, winsorization, z-scores (`simple-statistics` ISC or `d3-array` ISC), checked against a hand-worked peer group (handoff §12 case 3) | Data ahead of time; small calculations in the browser | Direction, winsorization and z-score, taught before the learner configures anything | L. Risks: peer-group definition (§5.1, SIC 3690), and undefined ratios from negative earnings (Atkore) | **Build**, Phase 2 |
| **Bond cash flows and accrued interest** | What will this bond pay me, and when? | Portfolio loop (bonds) | Fiscal Data auctions; 424B2; N-PORT debt fields and implied prices (use) | `lib/fixed-income.ts` | Day count (actual/actual for Treasuries, 30/360 for corporates) and accrued interest. Check against Treasury's own issue-date accrued interest, and against the bill check in §5.4 | Browser | Settlement date; clean and dirty price | M | **Build**, Phase 2 |
| **Valuation with sensitivities, and the reverse question** | What would have to happen for this price to make sense? | Value | Figures, price, risk-free rate, Damodaran's industry inputs (use) | `valuation-basics.ts`, `northstar-case.ts` | A sensitivity grid; solving for implied growth by bisection (as `fixed-income.ts` already does). Checked against hand-worked cases | Browser | Taught in a worked model before any input | M–L. Risk: negative earnings | **Build**, Phase 2 |
| **Portfolio construction and comparison** | Which mix fits my goal and limits? | Portfolio loop | Price histories (use) | `risk-return.ts` | Covariance, shrinkage, optimisers: `ml-matrix` (MIT), `quadprog` (MIT), `javascript-lp-solver` (Unlicense). Checked against independent numerical cases (handoff §12, cases 7–8) | A Web Worker | Each method, before use | L | **Phase 3**; libraries shortlisted in §5.6 |

**Not to build, embed or link:**
- **Automatic grades, ratings or "moat scores".** The moat proposal rules them out: no grade,
  recommendation or completion tick produced by filling in fields. A screen shows its breakdown
  (§7.3), never a verdict.
- **Third-party chart or screener widgets.** Their terms were not checked today, so **Inferred**:
  they would show figures Studio cannot date, source or label, and they bring their own tracking.
- **Live quotes, news feeds, analyst estimates.** Excluded by decision, or by licensing (§4).
- **Wikipedia text** (§4).

## 7. The learner's experience (stream F)

### 7.1 Friction walk through today's Studio

Production build on port 3100, browser storage cleared first, 2026-09-10. The learner is a newcomer
trying the Atkore journey. Screenshots stopped partway, because the app window was hidden and
pages would not draw; the rest was read as page text and measured with scripts.

**Baseline counts.** These are the prompt's §1 measures; every recommendation should move them.

| Measure | Count | Where |
| --- | --- | --- |
| Outside websites needed to finish | **4** | (1) Investigate asks for "seven figures" from "one annual report". Nothing on the page links to the filing reader or the SEC; its three outside links go to investor.gov (twice) and a course page. (2) Investigate's cost-of-capital note tells the learner to check the government rate "against today's Treasury yield". (3) "What to buy" asks for "the quote your broker shows" (`components/studio/stages.tsx:662`). (4) The filing reader's excerpts leave out the input-cost passages, so testing that explanation means opening the full filing on sec.gov |
| Dead ends | **1** | Atkore's industry, SIC 3690, is not among the five industries, and Investigate preselects Semiconductors. Atkore's figures would be read against chipmakers unless the learner notices |
| Stale or wrong statements shown to learners | **1** | Investigate's note says the 3.96% rate "is undated — the newest dated file in the archive is the January 2025 update". Damodaran's page says January 2026 (§2, item 3). This is a source-integrity defect in live copy |
| Blank inputs with no worked example | 0 in Investigate | Each of the seven figures has a "?" explaining where it sits in a report and what other sites call it. A worked example sits behind "How to do this, with an example" |
| Two competing numbers on one screen | none found | |
| Clicks from a figure to where it came from | Industry: 0. Catalogue facts: 1. Investigate: **none possible** | Industry puts its source note beside the table. Catalogue facts show sources once an entry is opened. Investigate's figures are typed by the learner and carry no source |

**Since measured.** The changes of 2026-09-11 (§13) removed two of the four. The government
borrowing rate now arrives inside Investigate with its date and its source; and the seven figures
arrive from the company's own filing, each carrying the tag it was read from, so they no longer
have to be copied from anywhere. Two remain: the input-cost passages still need the full filing,
because the reader inside Studio shows an excerpt of each section, and "What to buy" still asks for
a broker quote.

The dead end is also no longer silent. Investigate still preselects an industry, but where the SEC
files a company under one Studio has not researched it now says so, and names the industry whose
peers and cost of capital the reading actually uses. The industry itself is still missing.

Investigate's figures now carry a source. The walk recorded "clicks from a figure to where it came
from — Investigate: **none possible**", because every figure there was typed. A supplied figure now
opens to its tag, its period and its filing in one click; a figure the learner types still carries
none, which is correct.

**Page by page.**
- **Overview:** reads cleanly for a newcomer. There is one suggested next step ("Say what this money
  is for"), and each empty list says how to fill it. It shows the defaults "10 years · $10,000
  available" under "Not written yet".
- **Research:** 6 outside links (investor.gov 4, NYU Stern 2). They are guidance, not needed to
  finish.
- **Investigate:** as above.
- **Industry:** five industries (Semiconductors, Railroads, Variety stores, Pharmaceutical
  preparations, Prepackaged software). Headline figures carry their definitions, and "Where these
  numbers come from" is on the page.
- **Filing reader** (`/filings`, the top navigation's "Company reports"): outside Studio. ATKR
  resolves, and it lists 10-Ks and 10-Qs back to 2023 with filing and period dates.
  - The FY2025 10-K opens as seven sections (Business, Risk Factors, Legal Proceedings, Market,
    Management's Discussion, Market Risk, Financial Statements) out of 404,322 characters of
    text.
  - The page is **9.52 screens tall at 1440**.
  - It has **no link back to Studio and no way to save evidence**: no buttons, and 0 Studio
    links. Its 7 outside links all go to the full filing on sec.gov.
  - The excerpts shown contain "customer" 11 times but **"PVC" and "resin" not once**, although
    full-text search finds PVC resin discussed in Atkore's 10-Ks (§5.1). A learner testing an
    input-cost explanation must leave for sec.gov. That makes **4 outside sites**, not 3.
- **At 390 wide:**
  - Overview: the heading sits at 322 px, and the first control ("Change it in Goals") at
    **541 px of 844**. The page is 1.74 screens.
  - Investigate: the heading sits at 332 px and the first figure box at **551 px**. The page is
    2.35 screens.
  - The stale cost-of-capital note sits at 1,491 px, below the form, so a phone user reaches it
    only after typing.
  - The screen-budget rule is set at 1440, but on a phone the project bar and menu push the first
    action past the middle of the screen.

### 7.2 Evidence on beginners and disclosure

Each item was read firsthand from the abstract or the primary document.

1. **Attention sets the choice set.** Barber and Odean, *Review of Financial Studies* 21(2),
   785–818, 2008. Individual investors are net buyers of attention-grabbing stocks, and
   "preferences determine choices after attention has determined the choice set". Read from the
   authors' own PDF.
2. **Decluttering alone does not rescue beginners.** Agnew and Szykman, *Journal of Behavioral
   Finance* 6(2), 57–70, 2005; Boston College CRR working paper 2004-15.
   - Low-knowledge participants chose the default far more often: 20% against 2%.
   - Easier-to-compare displays or fewer choices did not reduce their overload.
   - Participants with above-average knowledge did report less overload with fewer choices.
3. **People split money evenly across whatever is offered.** Benartzi and Thaler, *American Economic
   Review* 91(1), 79–98, 2001: the "1/n" strategy. The share put in stocks tracks the share of stock
   funds offered. Read from the AEA's article page.
4. **Key facts first, detail one layer down.** The SEC's tailored shareholder reports, adopted
   2022-10-26 (Release 33-11125), per its fact sheet:
   - reports must be "concise and visually engaging", with the information "particularly
     important for retail shareholders";
   - fuller detail is available online and on Form N-CSR;
   - the report is tagged in inline XBRL, which is where the fund returns in §5.4 come from.
5. **Progressive disclosure.** Nielsen, NN/g, 2006: at first show only the most important options;
   keep to at most two levels; label the way to the rest clearly.

### 7.3 Patterns from other tools

Only tools whose own pages or documents were read today are listed.

| Pattern | Seen in (verified) | What it does | For Studio |
| --- | --- | --- | --- |
| Click a number to see where it came from | SEC Inline XBRL Viewer (sec.gov page, last reviewed 2025-01-17) | Clicking a tagged figure shows its definition, reporting period, and links to the accounting guidance | **Borrow.** Every supplied figure gets a one-click "where this came from": concept, period, unit, filing, date |
| A note anchored to a passage that survives changes | Hypothesis (engineering post, 2013) | Stores the exact quote with 32 characters either side, a character position and a range, and re-finds the passage by four strategies, down to fuzzy matching | **Borrow** for "Save as evidence": store the accession, section, quote, surrounding text and position |
| A score with its parts shown | Stockopedia StockRanks (product page) | Three component scores from 0 to 100, each shown, combined into one overall rank | **Borrow the breakdown; drop the overall verdict.** Show each metric's raw value, rank and weight. No composite grade |
| Key facts first, detail one layer down | SEC tailored shareholder reports (fact sheet) | A short report of what retail holders need, with full detail online and on Form N-CSR | **Borrow.** Each tool opens with one question and the few figures that answer it |

**Not examined, so no claims are made:** Koyfin, TIKR, Morningstar, Finviz, YCharts, Quartr,
Portfolio Visualizer, Readwise, Zotero. Simply Wall St's model repository is CC BY-NC-SA 4.0
(verified), but its method page was not readable, so it is not used as evidence.

### 7.4 Principles

Each principle names its evidence, the Studio screen it changes, and a check that can fail.

| # | Principle | Evidence | Changes | Check |
| --- | --- | --- | --- | --- |
| 1 | Everything needed to finish is inside Studio | Handoff §12: every required fact readable inside Studio. The walk found 4 outside sites | Investigate, Research, What to buy, the reader | Outside sites needed to finish the Atkore journey = **0**. Verification links may stay |
| 2 | Every supplied figure shows where it came from, in one click | The SEC viewer pattern; handoff §5 "source fact" | Investigate; Understand tables; prices | Figures with no source = 0; at most 1 click to the source |
| 3 | Studio's numbers and the learner's numbers look different | Handoff §5: three kinds of input | Investigate (typed or supplied); valuation assumptions | Every input is labelled as a source fact, your assumption, or your judgment |
| 4 | Show a screen's working, never a verdict | Stockopedia's breakdown; the moat proposal's rule; Barber and Odean on attention and the choice set | Peer screen; industry view | Every ranked row opens to its raw inputs and weights. No grade and no "buy" label anywhere |
| 5 | The few facts that answer the question come first; the rest is one labelled step away, two levels at most | SEC shareholder reports; NN/g | The reader (9.5 screens today); catalogue entries | The screen budget: 1.5 screens at 1440, first control within half a screen, each reader view included |
| 6 | Structure and teach the decision; decluttering alone does not help beginners | Agnew and Szykman: 20% against 2% defaulting, and simpler displays did not reduce beginners' overload | Every tool: a worked example before any input | Tools asking for a judgment before a worked example = 0 |
| 7 | Don't let the list decide the mix | Benartzi and Thaler, 1/n | "How much goes where" | The resulting stock, bond and cash mix is visible beside the weights, without scrolling at 1440 |
| 8 | Evidence stays beside the decision | The design doc's evidence panel; Hypothesis anchoring | Research records; the reader | Saving a passage takes at most 2 actions from the passage, and it is found again after a re-fetch (a test) |
| 9 | A date wherever a number can go stale | Handoff §6 (price date, period, publication and retrieval differ); the stale 3.96% note; the bill check (settlement date decides the answer) | Prices, rates, figures | Undated prices, rates or figures = 0 |
| 10 | On a phone, the first action is on the first screen | Measured: first controls at 541 and 551 px of 844 | The project bar at narrow widths | At 390×844 the first control sits above 422 px (half the screen). **Proposed target** |

## 8. Data flow and maintenance

**The rule.** Anything a calculation depends on is fetched ahead of time into a reviewed, dated
snapshot that ships with the app. Documents a learner *reads* are fetched when asked for, through
Studio's server, and cached, as the filing reader already does. The learner's browser never calls
a source directly. Four reasons:
1. The browser cannot, reliably: CORS is missing on company facts and the ticker files, and the
   SEC's User-Agent rule applies (§5.1).
2. The no-live-prices rule.
3. Reproducibility: saved research refers to the snapshot it used.
4. Hosting: responses are capped at 4.5 MB, so large sources are slimmed on the server (§5.5).

| Data | Source | When fetched | Refresh | Notes and limits |
| --- | --- | --- | --- | --- |
| Figures for curated companies | SEC company facts | Ahead of time (`fetch-fundamentals.mjs`) | After each 10-K and 10-Q season | 1–7 MB per company. Company facts can lag a filing, so check the filing's date |
| Figures for any SEC registrant, in Investigate | SEC company facts | On request, through the server, slimmed and cached | Cache for days, labelled "fetched on" | Keeps the learner's typed figures as an override |
| Product lines, regions, customers | The filing's own XBRL data file | Ahead of time for curated companies; on request for others | Per annual report | About 2.4 MB per filing, plus the label file |
| Filing text and passage search | EDGAR documents; full-text search | On request, cached (existing) | n/a | Sanitize on the server with `sanitize-html` or DOMPurify; never run document scripts |
| Stock and bill prices | N-PORT implied, pooled across filers | Ahead of time (`fetch-nport-prices.mjs`), shipped as a slim file | Monthly | **Verified:** the 2026-09-05 snapshot's newest report date is 2026-06-30, about two months behind. Say so on screen |
| Risk-free rate | Fiscal Data auctions: the latest nominal 10-year note's high yield | Ahead of time | After each 10-year auction (monthly) | Replaces the undated 3.96%. Exclude inflation-indexed notes (§5.4) |
| Fund returns and costs | Shareholder reports (N-CSR, N-CSRS) | Ahead of time | Twice a year | 1.4–5.4 MB per filing |
| Producer and consumer prices | BLS API v1 | Ahead of time | Monthly | 25 queries a day without a key |
| Exchange rates | ECB daily; Treasury quarterly; N-PORT's own rates | Ahead of time | Monthly | Show the rate's date beside every conversion |
| Industry cost of capital | Damodaran | Ahead of time (existing) | Each January | Industry level only |

**The maintainer's work.** There is one command per source, the existing `scripts/source/*.mjs`
pattern. Each run writes the snapshot, an audit page and a change list. The maintainer reads the
change list and quality report, spot-checks a few values against the source, then commits.
**Inferred, not measured:** 30–60 minutes per source per refresh; roughly half a day a month
across all of them.

**Failure behaviour.** A failed refresh keeps the previous snapshot and its date. Old values are
never re-dated. Every figure carries its snapshot id.

**How review flags work.** When a newer snapshot changes a value a saved conclusion depends on,
the conclusion is flagged and names the cause. This needs saved research to record the snapshot
id beside each figure it used. That is the dependency work M2 still lists, and it should be
designed together with the evidence panel.

## 9. Decisions

**1. Supply.** Free public sources can put every essential fact of the Atkore journey inside
Studio (§3, §5), with two exceptions:
- **Corporate bond prices are unmeasured.** The N-PORT method works for Treasury bills (§5.4) and
  should work for corporate bonds, but that needs one bond-fund file, which needs the user's
  go-ahead (§12).
- **SEC data only covers SEC registrants.** Private and foreign competitors are missing from any
  peer group, and Studio must name them as missing (moat proposal §6).

*What would change this:* if the corporate-bond check fails, historic FINRA TRACE data becomes
the fallback (§11).

**2. Timing.** Calculations use dated snapshots fetched ahead of time. Documents a learner reads
are fetched through the server when asked for. The browser never calls a source (§8). *What would
change this:* a decision to add live data (§11).

**3. Tools.** In this order:
1. the dated risk-free rate;
2. the research record with its evidence panel;
3. Investigate filled from the filing;
4. the reader inside Research, with whole sections and search;
5. research prices in the app;
6. fund returns.

Then, in Phase 2: product lines and customers, input costs, the peer screen, valuation, and bonds.
Portfolio construction waits for Phase 3.

Do not build grades, third-party widgets, live quotes or Wikipedia text (§6). *What would change
this:* the corporate-bond result, and your answer on commercial status (§12).

**4. Experience.** The ten principles in §7.4. Today's baseline is 4 outside sites, 1 dead end and
1 stale claim; the target is 0, 0 and 0.

**5. Going further.** The options, with their costs, are in §11. None is recommended now.

## 10. Roadmap

Each item names what the learner gains and the check that proves it.

**Before or alongside the research record:**
- **R1. A dated Treasury rate** replaces the stale risk-free note. This fixes a source-integrity
  defect that is live now.
  - Learner: Investigate shows the government borrowing rate with its date and Treasury as the
    source.
  - Source: Fiscal Data's auction records (open terms), the latest nominal 10-year note,
    excluding inflation-indexed notes.
  - Check: no undated rate; a test against the 2026-08-12 record (4.683%), read by hand.
  - Milestone: M3.
- **R2. The research record and the evidence panel,** with ids for catalogue sources.
  - Learner: can record research, reject an investment with a reason, and save evidence for and
    against.
  - Check: end-to-end tests that read IndexedDB. Rejected research survives removal and reload;
    evidence survives a backup and restore.
  - Milestone: M2.
- **R3. Investigate filled from company facts,** with units and provenance, and the learner can
  override. **Done 2026-09-11 (§13).**
  - Learner: sees Atkore's seven figures with their filing and period.
  - Check: the values equal an independent read of company facts for FY2025, and outside site 1
    is gone. Both met: the seven match Atkore's FY2025 10-K to the dollar, and the figures no
    longer have to be copied from anywhere.
  - Milestone: M3.
- **R4. The reader inside Research:** whole sections, paged; find in a filing; save a passage as
  evidence.
  - Learner: finds "PVC resin" in Atkore's 10-K without leaving Studio.
  - Check: a full-text hit leads to the passage in the app; a saved passage is found again after
    a re-fetch; each view is within 1.5 screens. Outside site 4 is gone.
  - Milestone: M3.
- **R5. Research prices in the app,** for stocks and bills, with dates and fair-value levels. The
  broker quote becomes an optional override.
  - Learner: can finish "What to buy" with no outside quote.
  - Check: outside site 3 is gone, and every price shows its date. Also measure price coverage
    for the catalogue ETFs' own shares.
  - Milestones: M3 and M5.
- **R6. Fund returns and costs** from shareholder reports.
  - Learner: sees 1-, 5- and 10-year returns by share class, with their period.
  - Check: they equal the tagged values, and each share class is matched to its ticker.
  - Milestones: M4 and M5.

**Phase 2, with the Atkore journey as its acceptance test:**
- **R7. A peer set for Atkore, chosen deliberately.** SIC 3690 is mostly batteries and EV chargers
  (§5.1). Build the set from companies whose filings describe the same products (full-text
  search), record why each is in, and name the private competitors that are missing. Check: the
  Find step can show why Atkore appears, and every peer has a stated reason.
- **R8. Product lines, regions and customers** from the filing's data file. Check: the shares
  reconcile to total revenue.
- **R9. Input-cost series,** each tied to an input the filing itself names. Check: every series
  cites that passage.
- **R10. The peer screen with its working shown; valuation with sensitivities; bond cash flows and
  accrued interest.** Checks: handoff §12 cases 3, 4 and 5.

**Phase 3:** portfolio construction (M6–M7) with the shortlisted libraries.

## 11. Options for going further

| Option | What it buys | Cost | Upkeep | Legal risk | Effect on the learner |
| --- | --- | --- | --- | --- | --- |
| A paid price licence that allows display | Daily prices for any stock | **Verified:** no Tiingo plan permits public display, and redistribution means contacting sales. Massive's Stocks Business plan costs $2,499 a month plus exchange fees, and its page does not state display rights. **Reported, not verified:** Intrinio display plans from $333 to $999 a month | Integration, then monthly | Contract terms | Daily prices, which still must be dated. Live use conflicts with the no-live-prices rule |
| Historic FINRA TRACE data for the chosen bonds | Actual trade prices | **Verified:** $1 per CUSIP per year, at most $1,000 a year, for redistribution. Data purchase fees not researched | Yearly | A licence agreement | Real trade prices in the bond worksheet |
| A wider set of investments | More companies and funds | SEC data is free. The cost is review work: company facts lag, sector templates, units | High; per company | Low for SEC data | More choice. Agnew and Szykman, and Barber and Odean, warn that choice can overwhelm beginners |
| Live data | Current quotes | Licence costs as above | High | High | Undermines the dated-snapshot teaching. **Not recommended** |
| Syncing Studio work to accounts | The same work on several devices | Accounts already exist in Supabase, and the storage adapter was built for this | Moderate | Privacy duties for personal portfolios | Continuity across devices |
| Bulk Financial Statement and Notes data sets | Dimensional data for every filer | Free; 72–298 MB a month to download | Moderate | None | Product-line data for many companies |
| A BLS API v2 key | 500 queries a day | Free; needs an email and a CAPTCHA, which you would do | None | None | Not needed for a curated set |

## 12. Questions for the user

**Answered by the user on 2026-09-10:**
1. The download: yes. Done, §5.4.
2. OPS is non-commercial.
3. Fix the borrowing rate: yes.
4. Move the filing reader into Studio: yes.

What was done is in §13. Question 5 stands as written. The questions as they were put follow.

1. **May I download one corporate-bond fund's holdings filing** to measure corporate bond prices
   the way the bills were measured? AGG's `primary_doc.xml`, 15.9 MB, from sec.gov.
   *Recommended: yes.*
2. **Is OPS non-commercial?** That settles the CUSIP question (CGS allows storing CUSIPs from
   public sources for non-commercial use) and affects every licence option in §11. *Recommended:
   record the answer in the ledger.*
3. **Fix the stale risk-free note first,** before the research record? It is live copy that
   contradicts its source. *Recommended: yes; it is a small change.*
4. **Move the filing reader into Studio's Research section,** and point the top navigation's
   "Company reports" there? *Recommended: yes.* Today it is a separate place with no way back and
   no way to save evidence.
5. **Treasury's copyright statement** was not found firsthand. It matters only for showing the
   daily par yield curve; the auction route in R1 needs no confirmation. US government works are
   not copyrightable (17 U.S.C. §105), so the risk is low (**Inferred**). Confirm with Treasury
   only if the daily curve is wanted.

## 13. Done on 2026-09-10 and 11

The user answered §12 the same day, and the work was done and verified. The ledger entry
"2026-09-11: the borrowing rate, company reports inside Studio, and a lost click" carries the
detail. In short:

- **R1, a dated rate.** A new pipeline takes the latest ordinary 10-year Treasury auction from
  Fiscal Data: 4.834% on 2026-09-09. Studio rebuilds each industry's cost of capital on it, names
  the source's own implied 3.96% beside it, and the stale "undated, January 2025" claim is gone.
  Inflation-protected notes are excluded by the query and by a check that fails the run.
- **The vintage.** The pipeline now reads the page Damodaran's own index links, which says "Last
  Updated in January 2026". The two pages hold identical tables, so no figure changed.
- **Company reports inside Studio**, one section at a time, with permanent redirects from the old
  address. The report page fell from 9.52 screens to 1.14 at 1440.
- **A defect this work exposed.** The first click after naming a new company was lost: the
  companies row appeared between the press and the release and moved the target 66px. The row is
  now always there.
- **Corporate bond prices** measured from the approved AGG download (§5.4).

### R3, done 2026-09-11

**Investigate fills its seven figures from the company's own filing.** A learner types a ticker,
presses one button, and gets the seven numbers with the tag each was read from, the period it
covers and the filing that reported it. Every one can be typed over, and doing so removes its
source rather than leaving a false one attached. The provenance is saved with the record, so it
survives closing the tab. Detail and the measurement: [`studio-investigate-prefill.md`](./studio-investigate-prefill.md).

- **Coverage: 8 of the 12 manifest companies gave all seven.** The four short all lack operating
  profit, which they do not tag; two of those are a bank and an insurer, for which Investigate
  already declines to compute a return on capital. Exxon also lacks borrowings, by refusal rather
  than by failure (below).
- **Three ways of building total borrowings wrongly, all found by measuring rather than reading.**
  A noncurrent tag dropped the instalment due this year (Pfizer $3.0bn, NextEra $3.5bn); a
  combined tag had short-term borrowings added to it twice (Verizon $441m); and Exxon's only
  borrowing tag bundles finance leases in with debt, which is not what the box asks for, so it is
  refused and the learner is told why. Each produced a plausible number, not an error.
- **The dead end is no longer silent.** Where the SEC files a company under an industry Studio has
  not researched — Atkore under 3690, mostly battery and EV-charging makers — the page says so and
  names the industry its peers and cost of capital actually belong to.
- **US GAAP only.** An IFRS filer returns a message saying its figures cannot be read, not an
  empty form.

Outside websites needed to finish the Atkore journey: 2, down from 4. Investigate's figures now
carry a source, which they never could while they were typed. Next in §10: R2, the research record
with its evidence panel, or R4, the reader with whole sections and find-in-filing.

## Appendix A. Probe log

| When (2026-09-10) | What | Result |
| --- | --- | --- |
| SEC probe 1, 23 requests | CORS on four SEC endpoints; Atkore filings list, company facts, filing index and data file; four 20-F filers; full-text search; five SEC policy and data pages | As in §5.1. The fund-return check found no XML in the VTI prospectus filing (6 items), so it moved to shareholder reports |
| SEC probe 2, 8 requests | Vanguard semiannual report XBRL; VTI prospectus listing; TSMC company facts; SGOV N-PORT; AGG N-PORT listing | N-CSRS carries expenses but no returns. TSMC: `ifrs-full`, 334 concepts, revenue in TWD, 10 annual periods, the latest ending 2024-12-31. SGOV: 22 bills and 2 share positions. AGG's file: 15.9 MB, not fetched |
| SEC probe 3, 3 requests | Vanguard annual report XBRL; TSMC FY2025 20-F listing | Returns present (§5.4). The TSMC listing showed only exhibits in its first 12 files, so it's re-checked below |
| Local cache | Atkore in the price snapshot; debt positions in 24 cached N-PORT files | §5.4 |
| BLS API v1, 1 query | Six producer price series, 2024–2026 | §5.4 |
| FedInvest form | GET of the historical-price page | A POST form with a session token; no notes on where prices come from, and no CSV link |
| npm registry | 16 packages | §5.6 |
| Bill check | SGOV's 22 bill prices against Treasury's 2026-05-29 bill rates, under three settlement dates | §5.4: 22 of 22 within 0.05 points at T+1 |
| TSMC listing, 1 request | FY2025 20-F index | 202 files including XBRL; company facts ends at FY2024 |
| CGS FAQ | Licence FAQ PDF, text extracted with `pdftotext` | §5.4 |
| SEC probe 4, 5 requests | Full-text search in Atkore's filings since 2025-10-01 | §5.1: document-level hits for resin, steel and copper, and selling prices |
| EDGAR company list, 1 request | SIC 3690, 10-K filers | 100 companies on the first page, mostly batteries and EV charging (§5.1). An earlier Atom-format request returned no list and is disregarded |
| Studio walk | Production build on port 3100, storage cleared, 1440 and 390 wide | §7.1 |
| Fiscal Data, 3 requests | 10-year auctions since 2026-05-01; the full record for one note | §5.4: yields present, and `91282CRE3` is inflation-indexed. A request naming fields that do not exist returned 400 and is disregarded |
| AGG download and bond check (approved) | AGG `primary_doc.xml`, 15,916,949 bytes; Treasury par curve for 2026-05-29 | §5.4: clean prices confirmed (295 Treasuries); 8,381 corporate bonds at a median spread of 0.71 points |
| Damodaran comparison, 2 requests | `wacc.htm` against `wacc.html`, both parsed by the pipeline's own parser | Identical tables: 96 industries, 3.958% and 4.45% recovered on both. Only `.html` carries "Last Updated in January 2026" |

## Appendix B. Citations

All retrieved 2026-09-10 unless noted.

- **SEC:**
  - privacy page, "Website Dissemination": https://www.sec.gov/about/privacy-information
  - fair access: https://www.sec.gov/search-filings/edgar-search-assistance/accessing-edgar-data
  - developer resources: https://www.sec.gov/about/developer-resources
  - Financial Statement and Notes data sets: https://www.sec.gov/data-research/sec-markets-data/financial-statement-notes-data-sets
  - risk/return data sets: https://www.sec.gov/data-research/sec-markets-data/mutual-fund-prospectus-riskreturn-summary-data-sets
  - Inline XBRL: https://www.sec.gov/data-research/structured-data/inline-xbrl
  - shareholder reports rule: https://www.sec.gov/rules-regulations/2022/10/s7-09-20, and fact sheet https://www.sec.gov/files/33-11125-fact-sheet.pdf
- **BLS:**
  - copyright: https://www.bls.gov/opub/copyright-information.htm
  - API FAQ: https://www.bls.gov/developers/api_faqs.htm
  - producer price series ids (June 2026): https://www.bls.gov/ppi/data-retrieval-guide/producer-price-index-commodity-data-series-id-codes.txt
  - series page: https://data.bls.gov/timeseries/WPU06621201
- **Census** API terms: https://www.census.gov/data/developers/about/terms-of-service.html
- **FRED** terms: https://fred.stlouisfed.org/legal/
- **Treasury:**
  - Fiscal Data API: https://fiscaldata.treasury.gov/api-documentation/
  - auctions dataset: https://fiscaldata.treasury.gov/datasets/treasury-securities-auctions-data/
  - par yield curve: https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value=2026
  - bill rates for May 2026: https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_bill_rates&field_tdr_date_value_month=202605
  - TreasuryDirect terms: https://www.treasurydirect.gov/terms.htm
  - FedInvest historical prices: https://www.treasurydirect.gov/GA-FI/FedInvest/selectSecurityPriceDate
- **Federal Reserve Board:** https://www.federalreserve.gov/disclaimer.htm and https://www.federalreserve.gov/releases/h15/
- **ECB:** https://www.ecb.europa.eu/services/disclaimer/html/index.en.html
- **GLEIF:** https://www.gleif.org/en/meta/lei-data-terms-of-use/
- **OpenFIGI:** https://www.openfigi.com/docs/terms-of-service and https://www.openfigi.com/api/documentation
- **CGS** licence FAQ (fees stated for 2015): https://www.cusip.com/pdf/CGS%20Website%20FAQ12.4.15%20(ACS)_seb.pdf
- **FINRA** TRACE pricing: https://www.finra.org/filing-reporting/trace/pricing
- **Damodaran:**
  - https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datacurrent.html
  - https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/wacc.html
  - the usage-rules pages `datafile/datahistory.html` and `.htm` returned 404
- **Wikipedia:** https://en.wikipedia.org/wiki/Wikipedia:Copyrights
- **Tiingo:** https://www.tiingo.com/about/pricing
- **Massive:** https://massive.com/pricing and https://massive.com/business
- **Vercel:** https://vercel.com/docs/functions/limitations (updated 2026-08-24)
- **Nielsen, NN/g:** https://www.nngroup.com/articles/progressive-disclosure/
- **Hypothesis:** https://web.hypothes.is/blog/fuzzy-anchoring/
- **Stockopedia:** https://www.stockopedia.com/features/stockranks/
- **Simply Wall St:** https://github.com/SimplyWallSt/Company-Analysis-Model
- **Studies:**
  - Benartzi and Thaler: https://www.aeaweb.org/articles?id=10.1257/aer.91.1.79
  - Barber and Odean: https://faculty.haas.berkeley.edu/odean/papers%20current%20versions/allthatglitters_rfs_2008.pdf
  - Agnew and Szykman: https://crr.bc.edu/wp-content/uploads/2004/05/wp_2004-151.pdf
- **npm registry:** https://registry.npmjs.org/

## Appendix C. Contradictions found

1. Every contradiction in §2.
2. A search summary described Tiingo's commercial plan as "redistribution-friendly". Tiingo's own
   pricing page permits public display on no plan (§11). The repository's 2026-09-05 audit was
   right.
3. FedInvest looked like a public Treasury price feed. TreasuryDirect's terms allow only
   non-commercial personal use (§5.4).
4. H.15 looked like a clean source for Treasury yields. The Board is retiring its download program
   in favour of FRED, whose terms forbid storing data (§5.4).

