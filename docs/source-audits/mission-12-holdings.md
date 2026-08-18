# Mission 12 — holdings: source audit

**Status:** **Gate A source and identity work complete.** Four slate products plus the VTSAX
trap verified against their own current filings; Damodaran Session 37 reviewed at claim level.
No `Blocked - source` or `Blocked - learning` condition. Four open items (O1–O4) ship labelled
rather than asserted — see "Still open" and "Gate A status" at the end.

**Phase prompt:** `docs/agent-prompts/portfolio-builder/07-mission-12-holdings.md`
**Gate 0 orientation and locked slate:** `docs/lesson-plans/mission-12-holdings-gate0.md`
**Retrieval date for everything below:** 2026-08-16

## Approved EDGAR retrieval path

The phase prompt forbids citing an inaccessible overview page as canonically locked, so the
access pattern is recorded here rather than rediscovered.

| Route | State | Use |
| --- | --- | --- |
| `www.sec.gov/cgi-bin/browse-edgar` | **Dead** — 403, then "File Unavailable" even with a declared User-Agent | Not usable. Never cite. |
| `data.sec.gov/submissions/CIK{10-digit}.json` | Works | Filing history per registrant: form, date, accession, primary document and its description |
| `www.sec.gov/files/company_tickers_mf.json` | Works | **Identity.** Maps ticker → CIK + series ID + class ID |
| `www.sec.gov/Archives/edgar/data/{cik}/{acc}/{acc}-index-headers.html` | Works | SGML header: series ID, series name, every class ID, class name and ticker |
| `www.sec.gov/Archives/edgar/data/{cik}/{acc}/…` | Works | The filing documents themselves |
| `efts.sec.gov/LATEST/search-index?q=…&forms=…` | Works | Full-text search. Indexes document bodies **only** |

All requests declare a User-Agent with a contact address, per SEC fair-access policy.

Two limits found by testing, not assumed:

- Full-text search does **not** index the SGML header. Searching a series ID finds `NPORT-P`
  (whose `primary_doc.xml` carries `<seriesId>` in the body) but returns **zero** `485BPOS`
  hits. Series-to-prospectus mapping therefore has to go through `-index-headers.html`.
- Cached artifacts live in the scratchpad and are never committed, per the phase prompt.

## The identity model this mission teaches

EDGAR's own structure carries the lesson, so the mission should not have to assert it:

```
registrant (a trust, has the CIK)
  └── series (the fund, has the portfolio)
        └── class (the ticker you can buy)
```

A ticker is a *class*. It is not the filer, and it is not the portfolio. You cannot look up
"VTI" on EDGAR and get a filer, because no such filer exists.

## Product 1 — VTI

**Verified 2026-08-16.** Growth sleeve.

### Identity

| Field | Value | Canonical location |
| --- | --- | --- |
| Registrant | VANGUARD INDEX FUNDS | `company_tickers_mf.json`; `NPORT-P` `<regName>` |
| CIK | 0000036405 | same |
| Registrant LEI | 549300G6KNDK44WUN559 | `NPORT-P` `<regLei>` |
| Investment Company Act file number | 811-02652 | EDGAR full-text search `file_num` |
| Series (the fund) | VANGUARD TOTAL STOCK MARKET INDEX FUND | `NPORT-P` `<seriesName>`; 497K header |
| Series ID | S000002848 | `company_tickers_mf.json`; 497K header |
| Series LEI | HJ2RZRUQEVF2A5SPRB21 | `NPORT-P` `<seriesLei>` |
| Class ID | C000007808 | 497K `-index-headers.html` |
| Class name | ETF Shares | same |
| Ticker | VTI | same |
| Structure | Exchange-traded share class of an open-end index fund; listed on NYSE Arca; not individually redeemable | 497K cover and "Purchase and Sale of Fund Shares" |

### The six share classes of series S000002848

Read from the SGML header of the 2026 `485BPOS`, accession `0000036405-26-000181`.

| Class ID | Class name | Ticker |
| --- | --- | --- |
| C000007805 | Investor Shares | VTSMX |
| C000007806 | Admiral Shares | **VTSAX** |
| C000007807 | Institutional Shares | VITSX |
| C000007808 | **ETF Shares** | **VTI** |
| C000155407 | Institutional Plus Shares | VSMPX |
| C000170276 | Institutional Select Shares | VSTSX |

This replaces the invented trap planned at Gate 0. VTI and VTSAX are not similar products —
they are **the same series**, one portfolio, filed under one series ID, differing only in
share class. The trap is real, it is on the record, and the learner can be shown the header
that proves it. The same relationship holds for VOO/VFIAX under series S000002839.

### Prospectus facts

Source: **497K summary prospectus**, accession `0000036405-26-000197`, document `f44849d1.htm`
("SP 970"), filed and effective **2026-04-28**, prospectus dated April 28, 2026. Header
confirms it covers exactly S000002848 / C000007808 / VTI. The statutory prospectus and SAI of
the same date are incorporated by reference.

| # | Claim | Location in filing | OPS usable? |
| --- | --- | --- | --- |
| P1-1 | Seeks to track a benchmark index measuring the investment return of the overall stock market | Investment Objective | Yes |
| P1-2 | Target Index is the **CRSP US Total Market Index**, described by the index provider as 100% of the investable U.S. stock market | Principal Investment Strategies | Yes |
| P1-3 | Invests **by sampling** the Target Index — holds a range of securities that in aggregate approximates the full index; at least 80% of net assets in index stocks | Principal Investment Strategies | Yes — this is the replication field, and it is *not* full replication |
| P1-4 | Management fees **0.03%**, 12b-1 **none**, other expenses **0.00%**, total annual fund operating expenses **0.03%** | Fees and Expenses → Annual Fund Operating Expenses | Yes |
| P1-5 | Cost example on $10,000 at an assumed 5% return: **$3 / $10 / $17 / $39** over 1/3/5/10 years, excluding brokerage commissions | Example | Yes |
| P1-6 | Portfolio turnover rate was **3%** of average portfolio value in the most recent fiscal year | Portfolio Turnover | Yes |
| P1-7 | Nine principal risks: general market; investing in equity markets; market capitalization; index investing (including tracking error); nondiversification; concentration; information technology sector; ETF share trading; authorized participants | Principal Risks | Yes |
| P1-8 | Market price of an ETF share may differ significantly from NAV; you may pay more or less than NAV; bid-ask spread is a real cost | ETF Share Trading; Purchase and Sale of Fund Shares | Yes — the premium/discount and spread *concepts* |
| P1-9 | Average annual total returns for periods ended **2025-12-31**: NAV 17.14% / 13.08% / 14.25%; market price 17.10% / 13.06% / 14.25%; CRSP US Total Market Index 17.15% / 13.08% / 14.25% (1/5/10 years) | Average Annual Total Returns | Yes — with the period stated |
| P1-10 | Highest calendar quarter +22.09% (quarter ended 2020-06-30); lowest −20.89% (quarter ended 2020-03-31) | Annual Total Returns | Yes |
| P1-11 | Advisor is The Vanguard Group through Vanguard Capital Management; three named co-managers | Investment Advisor; Portfolio Managers | Yes |
| P1-12 | Not a bank deposit; not insured or guaranteed by the FDIC or any government agency | after Principal Risks | Yes |
| P1-13 | No leverage, inverse exposure or margin feature is described anywhere in the filing | absence across whole document | Yes, as a negative finding |

**Tracking behaviour, computed from P1-9:** NAV return trailed the Target Index by 0.01
percentage points over one year and matched it over ten years, both before any brokerage cost
the investor pays. This is arithmetic on filed figures, and must be labelled as such rather
than presented as a disclosed "tracking difference" line — the filing does not publish one.

### Holdings record

Source: **NPORT-P**, accession `0000036405-26-000323`, filed **2026-05-28**.

| Field | Value |
| --- | --- |
| Holdings as-of (`repPdDate`) | **2026-03-31** |
| Reporting period end (`repPdEnd`) | 2026-12-31 — this is the **fiscal year end**, not the holdings date |
| Net assets | $1,991,691,212,321.29 |
| Total assets | $1,993,489,486,128.25 |
| Positions reported | 3,524 |
| Sum of reported position weights | **100.25%** |
| Positions flagged on loan (`isLoanByFund`) | **0** |
| Staleness at retrieval | **138 days** (2026-03-31 → 2026-08-16) |

Concentration computed from the filing: top 10 = 32.10%, top 25 = 43.69%, top 50 = 53.65% of
net assets.

Three findings that are teaching material, not defects:

1. **`repPdEnd` is a trap.** It reads like the holdings date and is not. Any UI that surfaces
   an as-of date must take `repPdDate`.
2. **Weights sum to 100.25%, not 100%.** The Overlap X-Ray must show the residual honestly
   rather than normalising it away.
3. **Alphabet Inc appears twice** — CUSIP 02079K305 at 2.6694% and 02079K107 at 2.1139%,
   4.78% combined. Two share classes of one issuer, inside a holdings table. The look-through
   formula must therefore aggregate by **issuer**, not by CUSIP or ticker, or it will
   understate concentration. This is the same share-class lesson as VTI/VTSAX appearing one
   level down, and it argues for teaching identity before overlap.

Securities lending is **not material in this snapshot** — zero positions are flagged as loaned
— so the mission should not assert a lending story for this product.

### Outstanding for product 1

| Item | State |
| --- | --- |
| Bid-ask spread and premium/discount **figures** | **Not in the prospectus.** It gives the concepts and directs to vanguard.com. Needs an issuer document with visible identity, format, date and limitation, or the field stays qualitative. |
| Material changes vs the prior prospectus | Not yet compared against the 2025-04-29 filing (`0001683863-25-004078`). |

Neither blocks the passport; both are recorded so the record is not silently incomplete.

## Product 2 — VOO

**Verified 2026-08-16.** Growth sleeve. The overlap partner.

### Identity

| Field | Value |
| --- | --- |
| Registrant | VANGUARD INDEX FUNDS, CIK 0000036405 — **the same trust as VTI** |
| Series (the fund) | **VANGUARD 500 INDEX FUND**, S000002839 |
| Class ID / name / ticker | C000092055 / ETF Shares / VOO |
| Structure | Exchange-traded share class of an open-end index fund; NYSE Arca; not individually redeemable |

The legal series name is *Vanguard 500 Index Fund*. "Vanguard S&P 500 ETF" is the class's
marketing name and "S&P 500" is the licensed index, not the fund's legal name — a second,
quieter identity point sitting right on the cover page.

Four share classes of series S000002839: C000007773 Investor (VFINX), C000007774 Admiral
(**VFIAX**), C000092055 **ETF (VOO)**, C000170274 Institutional Select (VFFSX).

### Prospectus facts

Source: **497K**, accession `0000036405-26-000183`, document `f44783d1.htm` ("SP 968"), filed
and effective **2026-04-28**. Header confirms S000002839 / C000092055 / VOO.

| # | Claim | Location | OPS usable? |
| --- | --- | --- | --- |
| P2-1 | Seeks to track a benchmark index measuring the return of **large-capitalization** stocks | Investment Objective | Yes |
| P2-2 | Target Index is the **S&P 500 Index** | Principal Investment Strategies | Yes |
| P2-3 | **Replicates** the Target Index by investing all, or substantially all, of its assets in the index stocks, holding each in approximately its index weight | Principal Investment Strategies | Yes — full replication, in contrast to VTI |
| P2-4 | Management fees **0.02%**, 12b-1 **none**, other expenses **0.01%**, total **0.03%** | Fees and Expenses | Yes |
| P2-5 | Cost example on $10,000: **$3 / $10 / $17 / $39** | Example | Yes |
| P2-6 | Portfolio turnover **2%** in the most recent fiscal year | Portfolio Turnover | Yes |
| P2-7 | The same nine principal risks as VTI, but the Index Investing paragraph is worded for replication — "Although the Fund seeks to hold substantially all of the securities included in the Target Index, it may be unable to do so" — where VTI's is worded for sampling | Principal Risks | Yes — see below |
| P2-8 | Average annual total returns to **2025-12-31**: NAV 17.84% / 14.38% / 14.78%; market price 17.82% / 14.38% / 14.78%; S&P 500 Index 17.88% / 14.42% / 14.82% (1/5/10 years) | Average Annual Total Returns | Yes — with period stated |
| P2-9 | Highest quarter +20.54% (2020-06-30); lowest −19.63% (2020-03-31) | Annual Total Returns | Yes |
| P2-10 | No leverage, inverse exposure or margin feature described | absence across whole document | Yes, as a negative finding |

**The two prospectuses differ in exactly the place the replication field lives.** VTI's index
risk explains that it does *not* hold all index securities and carries sampling risk; VOO's
explains that it *seeks to hold substantially all* of them. Same nine risk headings, different
sentence. That is a findable, filing-grounded target for guided practice — "find the sentence
that tells you how this fund tracks its index" — rather than a fact the course asserts.

**Tracking behaviour, computed from P2-8:** NAV trailed the S&P 500 by 0.04 percentage points
over both one and ten years. Larger than VTI's gap to its own index (0.01pp / 0.00pp) despite
the identical 0.03% headline fee. Computed arithmetic, not a disclosed line.

### Holdings record

Source: **NPORT-P**, accession `0000036405-26-000325`, filed 2026-05-28.

| Field | Value |
| --- | --- |
| Holdings as-of (`repPdDate`) | **2026-03-31** — the same date as VTI's |
| Net assets | $1,421,263,311,402.89 |
| Positions reported | 519 |
| Sum of reported weights | 100.14% |
| Staleness at retrieval | 138 days |

Concentration computed from the filing: top 10 = 36.49%, top 25 = 49.41% — measurably more
concentrated than VTI's 32.10% / 43.69%, from two funds whose headline fee is identical.

## Overlap X-Ray — first real computation

Both N-PORT snapshots carry the **same** as-of date (2026-03-31), so this comparison is clean
and does not mix vintages. Matching on CUSIP, position by position:

| Result | Weight |
| --- | ---: |
| VOO weight whose CUSIP is also held by VTI | **100.015 pp** of VOO's 100.14 pp reported total (**99.88%**) |
| VOO weight not found in VTI | 0.121 pp, across **2** positions |
| VOO positions with no CUSIP | none |

The two exceptions are NXP Semiconductors NV (N6596X109, 0.0886%) and Amcor PLC (G0250X107,
0.0328%).

> **Unverified inference, flagged not used.** Both exceptions are foreign-incorporated issuers
> that sit in the S&P 500 but not in a US-total-market index. That explanation is consistent
> with the data but is **not** stated in either filing; confirming it needs the CRSP and S&P
> index methodology documents. Until then the lesson may show *that* two positions differ, not
> *why*.

Aggregating a hypothetical 60% VTI / 40% VOO blend by issuer gives top-10 issuer exposure of
**35.15%** — higher than either fund's own top-10 weight, which is the duplication the X-Ray
exists to reveal.

**Implementation finding: the issuer key must not be a name.** A scratch name-normaliser was
used for the blend above and it is not good enough for the product — it collapses punctuation
inconsistently and cannot know that two CUSIPs are one company. N-PORT publishes an `<lei>`
per position; **LEI is the correct issuer key**, with CUSIP for the instrument and the legal
name for display only. Without this, Alphabet's two classes stay split and the X-Ray
understates the largest issuer in the portfolio.

## Product 3 — AGG

**Verified 2026-08-16.** Stability sleeve. Different sponsor, different trust.

### Identity

| Field | Value |
| --- | --- |
| Legal name | iShares Core U.S. Aggregate Bond ETF |
| Registrant | iShares Trust, CIK 0001100663 |
| Series / class / ticker | S000004362 / C000012092 / AGG |
| Structure | ETF, NYSE Arca. **Single share class** — unlike the Vanguard products |
| Adviser | BlackRock Fund Advisors (BFA) |

AGG's series has one class, so the ticker and the fund are nearly the same thing here. That
is a useful contrast to make deliberately: the VTI/VTSAX trap is not universal, and a learner
who over-generalises it will misread this filing.

### Prospectus facts

Source: **497K**, accession `0001193125-26-287958`, document `d128878d497k.htm`, filed and
effective **2026-06-29**. Header confirms S000004362 / C000012092 / AGG.

| # | Claim | Location | OPS usable? |
| --- | --- | --- | --- |
| P3-1 | Seeks to track an index composed of the total U.S. investment-grade bond market | Investment Objective | Yes |
| P3-2 | Underlying Index is the **Bloomberg U.S. Aggregate Bond Index**, which had **13,972 issues as of 2026-02-28** | Principal Investment Strategies | Yes — with the as-of date |
| P3-3 | Uses **representative sampling**, defined in the filing as investing in a representative sample with a similar investment profile; "the Fund may or may not hold all of the components of the Underlying Index" | Principal Investment Strategies | Yes — the filing *defines* the term, so the course does not have to |
| P3-4 | At least 80% of assets in index components and TBAs with substantially identical economics; at least 90% in fixed income of index types; no more than 10% in futures, options and swaps plus non-index fixed income | Principal Investment Strategies | Yes |
| P3-5 | Management fee **0.03%**, other expenses **0.00%**, acquired fund fees **0.00%**, total **0.03%**; waiver (0.00)%; total after waiver **0.03%** | Fees and Expenses | Yes |
| P3-6 | **Unitary fee structure** — BFA pays all operating expenses except management fees, interest, taxes, portfolio transaction costs, distribution fees, and litigation/extraordinary expenses | Fees and Expenses preamble | Yes — the fee *table* means something structurally different here than at Vanguard |
| P3-7 | Cost example on $10,000: **$3 / $10 / $17 / $39** | Expense Example | Yes |
| P3-8 | Portfolio turnover **62%** in the most recent fiscal year | Portfolio Turnover | Yes |
| P3-9 | **May lend securities representing up to one-third of total assets** | Principal Investment Strategies | Yes — securities lending is material *as a permission* |
| P3-10 | **24 named principal risks**, including Credit, Interest Rate, Call, Extension, Prepayment, Income, U.S. Agency Mortgage-Backed Securities, Securities Lending, Tracking Error, Valuation, Risk of Investing in China and Risk of Investing in the China Bond Market | Summary of Principal Risks | Yes |
| P3-11 | No nondiversification risk is disclosed, where VTI and VOO both disclose one | Summary of Principal Risks | Yes, as a stated difference between filings |
| P3-12 | Average annual total returns to **2025-12-31**: fund 7.19% / **−0.38%** / 1.97%; Bloomberg U.S. Aggregate Bond Index 7.30% / −0.36% / 2.01%; Bloomberg U.S. Universal Index (broad-based) 7.58% / 0.06% / 2.44% (1/5/10 years) | Average Annual Total Returns | Yes — with period stated |
| P3-13 | After-tax returns: 5.50% / −1.58% / **0.84%** on distributions; 4.23% / −0.81% / 1.01% on distributions and sale | Average Annual Total Returns | Yes, as a directional warning only — never a personal tax calculation |
| P3-14 | Best quarter **+6.69%** (2023-12-31); worst quarter **−5.86%** (2022-03-31); calendar year-to-date **0.04%** to 2026-03-31 | Performance Information | Yes |
| P3-15 | Premium/discount and bid-ask spread described qualitatively, no figures — the same treatment Vanguard gives | Purchase and Sale of Fund Shares; Market Trading Risk | Yes |
| P3-16 | Fund inception 1993-09-22 | Average Annual Total Returns | Yes |

**The stability sleeve lost money over five years.** P3-12 is the single most important fact on
this page for a novice: the fund a learner reaches for to be *safe* returned −0.38% annualised
over five years, with a −5.86% quarter in early 2022. It is filed, it is not editorialising,
and Mission 12 should not hide it behind the word "stability". Over ten years the pre-tax
1.97% falls to **0.84%** after tax on distributions — proportionally a far heavier tax drag
than the equity funds carry, which is the honest basis for the order rehearsal's
account-context flag.

### Holdings record

Source: **NPORT-P**, accession `0001410368-26-075254`, filed 2026-07-24.

| Field | Value |
| --- | --- |
| Holdings as-of (`repPdDate`) | **2026-05-31** |
| Reporting period end (`repPdEnd`) | 2027-02-28 — fiscal year end, again not the holdings date |
| Net assets | $136,455,697,043.74 |
| Total assets | $141,075,629,361.98 |
| Positions reported | **13,269** |
| Sum of reported weights | **101.88%** |
| Positions flagged on loan | **0** |
| Staleness at retrieval | **77 days** |

Asset categories by weight: corporate/government debt 73.4%, ABS-MBS 24.7%, short-term
investment vehicles 3.4%, other ABS 0.3%. Concentration computed from the filing: top 10 =
**6.61%**, top 25 = 11.60% — against VTI's 32.10% / 43.69%. The diversification difference
between the sleeves is enormous and measurable, not rhetorical.

Four findings:

1. **Permission is not practice.** The prospectus permits lending up to one-third of total
   assets (P3-9); the actual snapshot shows **zero** positions on loan. The passport must
   carry both, labelled — "permitted by the prospectus" and "observed in this filing" are
   different fields and a learner who conflates them is being taught wrongly.
2. **Sampling is visible in the count.** The index had 13,972 issues; the fund reports 13,269
   positions. The learner can *see* representative sampling rather than take P3-3 on faith.
3. **The largest holding is an affiliated cash fund** — BLACKROCK CASH FUNDS at 2.7786%, plus
   BlackRock Funds III at 0.6195%. This ties directly to the acquired-fund-fee disclosure and
   the TBA cash management in P3-4, and it is exactly the kind of thing a holdings table shows
   and a fact sheet does not.
4. **Total assets exceed net assets by ~3.4%**, consistent with the 101.88% weight sum. The
   X-Ray must show this residual rather than normalise it.

### Cross-sponsor overlap — the clean negative

AGG weight whose CUSIP also appears in VTI: **0.0000%, across 0 positions.** The Gate 0 plan
predicted a clean negative result and the filings deliver one.

> **Vintage warning, and it is now a real constraint.** AGG's holdings are as-of 2026-05-31;
> VTI's and VOO's are as-of 2026-03-31. The two sponsors are on different fiscal calendars, so
> **no cross-sponsor overlap figure in this mission can be computed from a single as-of date.**
> A zero intersection between a stock fund and a bond fund is robust to that gap, but a
> non-zero one would not be. Every cross-sponsor overlap number the UI shows must display both
> dates, and the mission cannot claim a common snapshot.

## Product 4 — SGOV

**Verified 2026-08-16.** Liquidity sleeve.

### Identity

| Field | Value |
| --- | --- |
| Legal name | iShares 0-3 Month Treasury Bond ETF |
| Registrant | iShares Trust, CIK 0001100663 — the same trust as AGG |
| Series / class / ticker | S000068768 / C000219740 / SGOV |
| Structure | ETF, single share class, listed on **NYSE** — not NYSE Arca, where the other three trade |
| Adviser | BlackRock Fund Advisors |

### Prospectus facts

Source: **497K**, accession `0001193125-26-287938`, document `d126195d497k.htm`, filed and
effective **2026-06-29**. Header confirms S000068768 / C000219740 / SGOV.

| # | Claim | Location | OPS usable? |
| --- | --- | --- | --- |
| P4-1 | Seeks to track an index of U.S. Treasury bonds with remaining maturities of **three months or less** | Investment Objective | Yes |
| P4-2 | Underlying Index is the **ICE 0-3 Month US Treasury Securities Index**, which had **39 issues as of 2026-02-28** | Principal Investment Strategies | Yes — with the as-of date |
| P4-3 | Index requires $1bn+ outstanding face value, excludes Federal Reserve SOMA holdings, inflation-linked securities, stripped zero-coupons and retail-marketed securities; rebalanced the last calendar day of each month | Principal Investment Strategies | Yes — concrete proof that an index is a **rulebook**, not a market |
| P4-4 | Uses representative sampling; may or may not hold all index components | Principal Investment Strategies | Yes |
| P4-5 | Management fee **0.09%**, other expenses 0.00%, total **0.09%** — three times the other three products | Fees and Expenses | Yes |
| P4-6 | Cost example on $10,000: **$9 / $29 / $51 / $115** against $3 / $10 / $17 / $39 for the other three | Expense Example | Yes |
| P4-7 | Portfolio turnover **0%** in the most recent fiscal year | Portfolio Turnover | Yes as a figure — **see the warning below before using it** |
| P4-8 | May lend securities representing up to one-third of total assets | Principal Investment Strategies | Yes, as a permission |
| P4-9 | **15 named principal risks** — and **no Credit Risk, Call Risk, Extension Risk or Prepayment Risk**, all of which AGG carries | Summary of Principal Risks | Yes — the risk list *differs by mandate*, which is the point |
| P4-10 | Average annual total returns to **2025-12-31**: fund 4.24% / 3.23% / 2.89%; ICE 0-3 Month US Treasury Securities Index (Spliced) 3.41% / 2.54% / 2.27%; ICE BofA US Broad Market Index 7.15% / −0.42% / 0.04% (1yr / 5yr / since inception 2020-05-26) | Average Annual Total Returns | Yes — with periods stated |
| P4-11 | After-tax returns 2.51% / 1.93% / 1.73% on distributions — the 1-year return falls from 4.24% to **2.51%** | Average Annual Total Returns | Yes, directional warning only |
| P4-12 | Best quarter **+1.36%** (2023-12-31); worst quarter **0.00%** (2021-12-31); year-to-date 0.87% to 2026-03-31 | Performance Information | Yes |
| P4-13 | **Material change with a date:** prior to **2025-10-31**, the Underlying Index's cash from coupon payments and maturing securities earned **no reinvestment income** | Principal Investment Strategies | Yes — this is the "material changes" field, filled from a filing |
| P4-14 | The benchmark row is a **spliced** series: standard pricing variant through 2021-02-28, the 4 PM variant from 2021-03-01 to 2023-11-30, and the standard variant using 4 PM pricing thereafter | footnote 1 to the returns table | Yes |

### The finding that breaks the tidy lesson

**SGOV's reported return exceeds its own Underlying Index in every period shown** — 4.24% vs
3.41%, 3.23% vs 2.54%, 2.89% vs 2.27% — *after* a 0.09% fee.

The obvious version of this mission teaches "an index fund charges a fee, so it trails its
index." VTI, VOO and AGG all behave that way. SGOV, on the record, does not. Two facts on the
same page are plainly relevant — the spliced benchmark (P4-14) and the index earning no cash
reinvestment income before 2025-10-31 (P4-13) — but **neither filing states that either fact
causes the gap**, and I am not asserting it.

> **Unverified inference, flagged not used.** A benchmark can be beaten because it is
> constructed differently from the portfolio, not because the manager added value. That is the
> likely story here and it is *not* in the filing. Confirming it needs the ICE index
> methodology and the fund's annual report.

This is worth keeping rather than engineering around. A mission that only shows funds trailing
their benchmarks teaches a rule the fourth product falsifies. Showing all four teaches the
real skill: **compare the fund to its stated benchmark, then check what the benchmark
actually is.**

### Warning on the turnover figure

P4-7 reports **0%** turnover for a fund whose entire portfolio matures and is replaced inside
three months — the N-PORT maturities run 2026-06-02 to 2026-08-27 against a 2026-05-31 as-of
date. The figure is arithmetically filed and substantively uninformative, and a learner
comparing "0%" here to "62%" at AGG and "3%" at VTI would draw a false conclusion.

**Verified 2026-08-16 against Form N-1A** (`sec.gov/files/form-n-1a.pdf`, HTTP 200 with a
declared User-Agent; the 403 recorded in the forward plan was a wrong URL, not a block). Item 3
instruction (d)(ii):

> "Exclude from both the numerator and the denominator amounts relating to all securities,
> including options, whose maturities or expiration dates at the time of acquisition were one
> year or less."

Every security SGOV holds has a maturity of three months or less at acquisition, so **every
holding is excluded from both the numerator and the denominator** and the rate computes to 0%
by construction. Instruction (c) confirms the direction of travel: a money market fund may omit
the portfolio turnover rate altogether.

The 0% is therefore not a measurement of trading activity at all — it is an artifact of a
formula that was never meant to describe a short-maturity portfolio. This is now a *teachable*
fact rather than a caveat: **the number is real, correctly filed, and means nothing here.** It
is the strongest available demonstration that reading a filing means knowing what a figure is
defined to measure, not just where it sits on the page. The passport still shows the filed
figure with a "not comparable across mandates" flag, but the mission can now explain why.

### Holdings record

Source: **NPORT-P**, accession `0002071691-26-016719`, filed 2026-07-24.

| Field | Value |
| --- | --- |
| Holdings as-of (`repPdDate`) | **2026-05-31** |
| Net assets | $91,903,313,184.45 |
| Total assets | $100,008,690,233.96 |
| Positions reported | **24** |
| Sum of reported weights | **108.82%** — the largest residual in the slate |
| Asset categories | 100% short-term investment vehicles |
| Maturity range | 2026-06-02 → 2026-08-27 |
| Positions flagged on loan | **0**, despite the one-third permission in P4-8 |
| Staleness at retrieval | **77 days** |

Top 5 positions are 42.74% of net assets — concentrated by position count, though every
position is a U.S. Treasury obligation. Total assets exceed net assets by roughly 8.8%, which
is why the weights sum to 108.82%. **The X-Ray's "unknown/uncovered share" logic has to cope
with a fund whose disclosed weights exceed 100% by nearly nine points**; normalising silently
would hide the most interesting thing on the page.

"Cash" here is 24 dated Treasury obligations with a fee, a listing venue, a bid-ask spread, a
tax profile that cuts the 1-year return from 4.24% to 2.51%, and a ten-year cost of $115 per
$10,000 against $39 for the stock funds. That is the sleeve's whole lesson, and all of it is
filed.

### Overlap SGOV vs AGG — the clean comparison

Both filings are as-of **2026-05-31**: same sponsor, same fiscal calendar, same snapshot date.
This is the **only** cross-fund pair in the slate whose overlap can be computed without mixing
vintages.

**SGOV weight whose CUSIP also appears in AGG: 0.9406%, across 2 positions.**

**Correction.** This document previously described those as "two Treasury obligations". They are
not. Both are **BlackRock Funds III**, an affiliated money-market position, CUSIP 066922477 —
the funds' cash management, not their mandate. The Treasury overlap between these two funds is
real but shows up only on the issuer key, not this one.

That single CUSIP is also the mission's best evidence that identity in holdings data is
genuinely imperfect:

| Fund | Name as filed | CUSIP | LEI |
| --- | --- | --- | --- |
| SGOV | BlackRock Funds III | 066922477 | 5493005PQV5UQG4OSI49 |
| SGOV | BlackRock Funds III | 066922477 | 5493005PQV5UQG4OSI49 |
| AGG | BlackRock Funds III | 066922477 | **5493008LW2651I1QB503** |
| AGG | BLACKROCK CASH FUNDS TREASURY SL AGENCY SHARES | 066922477 | 5493008LW2651I1QB503 |
| AGG | BLACKROCK CASH FUNDS | 066922477 | **N/A** |

One CUSIP, three names, two different LEIs, and one row with no LEI at all — across two funds
from the same sponsor, filed the same day. **Neither key is universally correct.** CUSIP finds
this overlap and LEI misses it; LEI finds the Treasury overlap and CUSIP misses that.

The implementation therefore keys on LEI, falls back to CUSIP, and **surfaces identity
conflicts** — the same CUSIP carrying different LEIs — instead of silently picking a winner.
The lesson states the limit plainly rather than implying the X-Ray is exact.

## Cross-product summary

Every figure below is from the product's own current filing, retrieved 2026-08-16.

| | VTI | VOO | AGG | SGOV |
| --- | --- | --- | --- | --- |
| Registrant CIK | 0000036405 | 0000036405 | 0001100663 | 0001100663 |
| Series | S000002848 | S000002839 | S000004362 | S000068768 |
| Class | C000007808 | C000092055 | C000012092 | C000219740 |
| Classes in series | 6 | 4 | 1 | 1 |
| Listing | NYSE Arca | NYSE Arca | NYSE Arca | **NYSE** |
| Total expense | 0.03% | 0.03% | 0.03% | **0.09%** |
| 10-yr cost per $10,000 | $39 | $39 | $39 | **$115** |
| Turnover | 3% | 2% | 62% | 0% ⚠ |
| Replication | sampling | full | rep. sampling | rep. sampling |
| Named principal risks | 9 | 9 | 24 | 15 |
| Positions (N-PORT) | 3,524 | 519 | 13,269 | 24 |
| Weights sum to | 100.25% | 100.14% | 101.88% | 108.82% |
| Top-10 weight | 32.10% | 36.49% | 6.61% | — (top 5: 42.74%) |
| Holdings as-of | 2026-03-31 | 2026-03-31 | 2026-05-31 | 2026-05-31 |
| Staleness at retrieval | 138 days | 138 days | 77 days | 77 days |
| Positions on loan | 0 | n/a | 0 (⅓ permitted) | 0 (⅓ permitted) |
| Prospectus date | 2026-04-28 | 2026-04-28 | 2026-06-29 | 2026-06-29 |

Overlap results, all computed from the filings. **The key changes the answer**, so both are
reported — this is the finding, not a caveat:

| Pair | By instrument (CUSIP) | By issuer (LEI) | Dates aligned? |
| --- | ---: | ---: | --- |
| VOO inside VTI | 99.88% | 100.01% across 501 issuers | Yes — both 2026-03-31 |
| SGOV inside AGG | 0.94%, 2 positions | **107.88% across 1 issuer** | Yes — both 2026-05-31 |
| AGG inside VTI | 0.00%, 0 positions | **14.94% across 469 issuers** | **No** — 2026-05-31 vs 2026-03-31 |

**Correction to this document's earlier reading.** The AGG/VTI row was recorded as "the clean
negative the Gate 0 plan predicted". That is true only at the instrument level. Keyed on issuer
it is **14.94%**, and the match is genuine: the matched AGG positions are 14.93% corporate debt
(`assetCat` DBT), led by JPMorgan Chase 0.59%, Bank of America 0.55%, Morgan Stanley 0.48%,
Goldman Sachs 0.45%, Wells Fargo 0.38%, Oracle, Citigroup, AT&T, Verizon and Amazon — every one
of them an issuer whose *equity* VTI also holds.

The learner-facing statement is therefore not "stocks and bonds do not overlap". It is:

> **Your stability sleeve lends money to the same companies your growth sleeve owns.**

Likewise SGOV inside AGG is 0.94% by CUSIP and **essentially total by issuer**, because that one
issuer is the U.S. Treasury (LEI 254900HROIFWPRGM1V77). The >100% reflects SGOV's own 108.82%
weight sum.

This makes the issuer-versus-instrument toggle the centre of the Overlap X-Ray rather than a
refinement, and it retires the "clean negative" framing entirely.

### LEI coverage — the unknown share, measured

The phase prompt requires the X-Ray to disclose an unknown/uncovered share. It is a real
computable number, not a placeholder:

| Fund | Positions with no usable LEI | Share of net assets |
| --- | ---: | ---: |
| VTI | 1,031 | **3.34%** |
| VOO | 29 | 1.60% |
| AGG | 686 | **5.67%** |
| SGOV | 0 | 0.00% |

Where the LEI is absent the implementation falls back to CUSIP and **counts the position toward
the disclosed uncovered share** rather than silently dropping it. One real case to handle: AGG's
largest holding, BLACKROCK CASH FUNDS, carries `lei` of `N/A` while a second BlackRock row with
the same CUSIP carries a real LEI.

Not one of these weights sums to 100%, no two sponsors share an as-of date, one product beats
its own benchmark, and the headline overlap number depends on a choice the learner has to make.
The slate is honest material precisely because it does not behave.

## Trap product — VTSAX

**Verified 2026-08-16.** Not a slate product. The near-identical-wrong-share-class trap the
phase prompt requires.

Source: **497K**, accession `0000036405-26-000214`, document `f44873d1.htm` ("SP 585"), filed
and effective 2026-04-28. Header confirms series S000002848, class **C000007806**, VTSAX.

| Field | VTI (C000007808, ETF Shares) | VTSAX (C000007806, Admiral Shares) |
| --- | --- | --- |
| Series | S000002848 | **S000002848 — identical** |
| Objective | track the overall stock market | **identical wording** |
| Target index | CRSP US Total Market | **identical** |
| Replication | sampling | **identical** |
| Turnover | 3% | **3% — the same portfolio** |
| Management fee | 0.03% | 0.04% |
| **Total annual operating expenses** | **0.03%** | **0.04%** |
| 10-year cost per $10,000 | **$39** | **$51** |
| Account service fee | none | **$25/year** on balances below $5,000,000 |
| Minimum to open | none beyond broker rules | **$3,000** ($1 to add) |
| How you buy | secondary market, market price, bid-ask spread | direct with Vanguard at NAV |

One portfolio, one index, one turnover figure, two prices. The trap is not that these are
confusable products — it is that they are **the same product** with different access terms,
and only the class ID distinguishes them.

## Damodaran Session 37 — source-era product framework

**Reviewed 2026-08-16.** All 10 slide pages, the 3-page quiz with solutions, and the complete
official caption track.

### Source locks

| Artifact | URL | Bytes | SHA-256 | Extent |
| --- | --- | ---: | --- | --- |
| Slides | `pages.stern.nyu.edu/~adamodar/pdfiles/invphilslides/session37.pdf` | 595,463 | `b6a0df1f…c906dfcc` | 10 pp |
| Quiz | `pages.stern.nyu.edu/~adamodar/pdfiles/invphiltests/quiz37.pdf` | 66,776 | `aab22bf8…106c6cf0` | 3 pp |
| Captions | video `eQbZlbmbIJs` | 140,628 | `057d6d76…0d486eaf88` | 803 cues, 2,838 words |

Cached 2026-08-13, `captionStatus: "ok"`, provenance in `.source-cache/provenance/session37.json`.
Title: *Passive Investing Choices*. Cached artifacts are never committed.

**Tooling note.** Slides 4, 8, 9 and 10 are charts and yield no extractable text. They were
read visually from the corpus contact sheet, and quiz page 2 was re-rendered through Chrome's
new-headless PDF viewer via Playwright to recover bold answer marking, which text extraction
discards. Poppler is still absent on this machine, so `Read` cannot rasterise PDFs directly.

### Source-era boundary

Figure 13.2 is captioned *US Index funds at end of 2010*; the active-share chart ends at 2009;
the ETF example is SPDRs and the too-many-stocks example is the Wilshire 5000. **Session 37 is
a taxonomy and a measurement discipline, not a current product guide**, and every OPS use must
be framed that way. Its current-product claims are superseded by the filings verified above.

### Verified claims

| # | Claim | Canonical location | OPS usable? |
| --- | --- | --- | --- |
| S37-1 | Passive investing offers three choices: classic index funds, enhanced index funds, exchange-traded funds | Slide 2; narration 00:00:40–00:01:25 | Yes — the taxonomy |
| S37-2 | A fully indexed fund identifies the index, estimates total market values of equity, and holds a market-value-weighted portfolio; it is self-correcting and needs adjustment only when stocks enter or leave the index | Slide 3; narration 00:01:45–00:02:29 | Yes |
| S37-3 | A sampled index fund is used when the index has too many stocks (Wilshire 5000; 40,000 global stocks in narration) or is too expensive to replicate; the sample "has to be both random and weighted, which is kind of tough to do" | Slide 3; narration 00:02:29–00:02:52 | Yes — and it is the source-era name for what VTI, AGG and SGOV all do |
| S37-4 | **A good index fund is measured by correlation with its index close to one, not by beating it** — "A good index fund is one that tracks the market perfectly, not one that out performs the market" | Quiz Q2 solution and explanation; narration 00:02:52–00:03:12 | Yes — **the standard by which the SGOV finding is read** |
| S37-5 | A classic index fund holds all index stocks at index weights; the objective is to replicate the index, not to build a better one | Quiz Q1 solution and explanation | Yes |
| S37-6 | US index fund total net assets grew from near zero in the early 1990s through end-2010, split across S&P 500, other domestic equity, global and hybrid/bond funds | Slide 4, Figure 13.2 | Yes, **only** as history ending 2010 |
| S37-7 | ETFs replicate an index at low cost while preserving liquidity; priced continuously, tradable by symbol like a share | Slides 5–6; narration 00:05:04–00:05:48 | Yes |
| S37-8 | The costs of ETFs are slightly higher than index funds over the long term, though the trade-off may still favour them, especially for obscure indices or shifting allocations | Slide 6; narration 00:05:48–00:06:11 | **Restricted — see defect D3** |
| S37-9 | The ETF advantage is tradability (buy, sell short); this "increases the transactions costs (from a bid ask spread)" but suits strategies needing quick trading or shorting | Quiz Q4 solution and explanation | Yes — the source-era basis for the spread field |
| S37-10 | Three enhanced-index approaches: synthetic (derivatives and mispricing), stock-based (conventional selection within the index), quantitative (mean-variance optimisation) | Slide 7; narration 00:06:32–00:09:30 | Yes |
| S37-11 | Enhanced index funds seek higher return *per unit of risk* by holding a subset of index stocks; observed excess returns are "30 basis points, 50 basis points, half a percent" and they carry slightly more risk; calling them index funds "is an oxymoron — they're really mildly active funds" | Quiz Q5 solution; slides 9–10; narration 00:11:24–00:12:35 | Yes, labelled as an old study |
| S37-12 | Fidelity Magellan's active share fell from about 96–97% in 1980 to about 60% by 1988 under Lynch, and to roughly 35% by 2001–02 under Stansky, before rising again through 2009 — many large "active" funds are really enhanced index funds | Slide 8; narration 00:09:51–00:11:03 | Yes, labelled 1980–2009 |
| S37-13 | **"Unless you want to be a market timer, you're not picking an ETF because you think that that particular index is cheap or expensive — it's to bring exposure to that risk into your portfolio"** | Narration 00:13:38–00:14:00 | Yes — **canonical support for the mission's policy-role→product rule** |
| S37-14 | You can hold only index funds and still be an active investor, by timing the market or by borrowing to buy index funds in asset classes you think are severely undervalued | Quiz Q3 **explanation** | Yes — **but see defect D1** |

### Two claims that decide mission design

**S37-13 authorises the learner sequence from the source.** The phase prompt requires the
learner to move from policy role to evidence to product, never from a recommendation list to a
purchase. Damodaran states the same rule in his own closing: you choose an ETF to bring an
exposure into the portfolio, not because you judge the index cheap. Mission 12's central
constraint is therefore canonically supported rather than an OPS house rule.

**S37-4 resolves the SGOV problem.** Under the source's own standard, a fund whose return
*exceeds* its index is not thereby a better index fund — the measure is tracking, correlation
close to one, not outperformance. SGOV's positive gap against its spliced benchmark is
therefore a prompt to **inspect the benchmark**, exactly as recorded in Product 4. The
source-era framework and the 2026 filing agree, and the mission can teach the discipline
without asserting any cause for the gap.

### Defects and reconciliations

**D1 — the quiz's marked answer contradicts its own explanation.** Quiz Q3 asks whether you can
invest only in index funds and still be an active investor. The solution page marks **"b.
False"** in bold, while the explanation immediately below argues the opposite: you can time the
market with index funds and can borrow to buy them. The explanation is the substantive
content and is consistent with the rest of the corpus, including Mission 11's timing material.
**OPS uses the explanation (S37-14) and must never reproduce the marked letter.** Verified by
re-rendering quiz page 2 rather than trusting text extraction, which discards bold.

**D2 — Test and Solution disagree on option lettering.** Quiz Q1 has four options on the Test
page (a–d), where the correct text sits at **c** and "None of the above" at d. The Solution
page has five options (a–e), inserting a new option at c and placing the correct text at **d**.
A learner who works the Test and checks the Solution gets a mismatched letter. **OPS cites
answer text, never option letters**, for every Session 37 item.

**D3 — S37-8 is contradicted by this mission's own verified filings.** Session 37 states ETFs
cost slightly more than index funds over the long term. On the record retrieved above, for the
**same series, same portfolio, same index and same 3% turnover**:

| | VTI, ETF Shares | VTSAX, Admiral Shares |
| --- | --- | --- |
| Total annual operating expenses | **0.03%** | **0.04%** |
| Filing's own 10-year example per $10,000 | **$39** | **$51** |
| Account service fee | none | $25/year below $5,000,000 |

The ETF class is the cheaper one, and the comparison is perfectly controlled because it is one
fund. S37-8 is **restricted to source-era history** and may not be carried into OPS as a
current claim. This is precisely the kind of defect Gate A exists to catch: the framework
survives, one of its factual claims does not.

## Material changes — closed 2026-08-17

Each product’s current summary prospectus compared against the prior year’s, field by field.
Prior-year sources: VTI `0001683863-25-004087`, VOO `0001683863-25-004106` (both filed
2025-04-29), AGG `0001193125-25-151199` (2025-06-27).

| Product | What moved |
| --- | --- |
| **VTI** | Management fee **0.02% → 0.03%**, other expenses **0.01% → 0.00%** — the total is unchanged at 0.03%. Turnover **2% → 3%**. Index, replication and cost example unchanged. |
| **VOO** | Nothing substantive. Fees, turnover, index and replication identical. The filing renamed its defined term for the benchmark from “the Index” to “the Target Index” — wording, not substance. |
| **AGG** | Turnover **81% → 62%**. The contractual acquired-fund-fee waiver was extended from **2026-06-30 to 2027-06-30**. Fee table, index, replication and lending permission unchanged. |
| **SGOV** | Already recorded at P4-13, and the only one stated inside the filing itself: before **2025-10-31** the Underlying Index’s cash earned no reinvestment income. |

**VTI is the interesting one.** The headline fee did not move, and the composition underneath it
did — which is exactly the reading skill this mission teaches. A learner who checks only the
total would report “no change”.

Two cautions recorded from doing the comparison. The first extraction run reported AGG’s fee
table as changed; it had not. The 2025 table carries an extra distribution-and-service row,
which shifted a positional parser by one cell. The figures above were read from the tables
directly afterwards. And “nothing substantive changed” is now a stated finding rather than an
empty field — `materialChanges` is typed as a required string and a unit test fails if any
product ships without one.

## Still open

| # | Item | Blocks what | Severity |
| --- | --- | --- | --- |
| O1 | Bid-ask spread and premium/discount **figures** for all four products. Every prospectus gives the concepts and directs to the sponsor's website; none carries numbers. | The ETF spread and premium/discount field of the required product record | Needs an issuer document with visible identity, format, date and limitation — or the field stays qualitative for all four, stated as such |
| O2 | ~~Material changes for VTI, VOO and AGG~~ | — | **Closed 2026-08-17.** Each current summary prospectus was compared field by field against its prior-year counterpart. See “Material changes” below |
| O3 | ~~Whether the SEC turnover computation excludes short-maturity securities~~ | — | **Closed 2026-08-16.** Form N-1A Item 3 instruction (d)(ii) confirms it. SGOV's 0% is a formula artifact and is now explainable rather than merely flagged |
| O4 | Why VOO's two non-VTI positions and SGOV's two AGG-shared positions are what they are. | Nothing — these are flagged inferences, excluded from the lesson | Would need CRSP, S&P and ICE index methodologies |
| O5 | ~~Damodaran Session 37 claim-level review~~ | — | **Closed 2026-08-16.** 14 claims verified, 3 defects recorded (D1–D3) |

Neither O1 nor O4 is a `Blocked - source` condition: each is a field that will ship
labelled as unverified or qualitative rather than asserted.

**Correction to `docs/lesson-plans/missions-10-13-forward-plan.md` §3.** That plan records
Mission 12 as "blocked — two sources 403" (`sec-form-n1a`, `sec-nport-datasets`) and schedules
the mission last for that reason. Both blockers are gone: **Form N-1A returns 200** at
`sec.gov/files/form-n-1a.pdf` and `sec.gov/about/forms/formn-1a.pdf`, and N-PORT holdings were
never needed from the dataset overview page — they come from each fund's own `NPORT-P` filing
through the Archives path. Mission 12 was never blocked on a source we did not hold; it was
blocked on two URLs. The manifest entries should be repointed.

## Gate A status

Source and identity work for Mission 12 is **complete**. Four slate products and one trap
product are verified against their own current filings; Session 37 is reviewed at claim level
with its defects recorded; the overlap arithmetic is demonstrated on real holdings with its
vintage limits stated.

No `Blocked - source` condition was found. No `Blocked - learning` condition was found: the
learner sequence the phase prompt requires is canonically supported by S37-13, and the identity
model the mission teaches is EDGAR's own structure rather than an OPS invention.

Carry into lesson planning:

1. **Identity before overlap.** The share-class lesson recurs at three levels — trust/series/
   class, VTI/VTSAX, and Alphabet's two CUSIPs inside a holdings table. Overlap arithmetic is
   wrong without it.
2. **LEI is the issuer key.** Not name, not CUSIP, not ticker.
3. **Never normalise the weights.** They sum to 100.25%, 100.14%, 101.88% and 108.82%.
4. **Two as-of dates, always shown.** No cross-sponsor overlap has a common snapshot.
5. **Permitted vs observed are separate fields.** Securities lending proves it.
6. **Compare a fund to its stated benchmark, then check what the benchmark is** (S37-4 and
   SGOV together).

## Damodaran Session 37

Cached, not yet reviewed. To be recorded as a source-era product framework, not a current
product guide.
