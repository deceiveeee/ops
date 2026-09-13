# Prices for what a learner buys, from fund holdings filings

A research pass on 2026-09-13, before building R5 in `studio-online-data-and-tools.md`. R5 promises
that a learner can finish "What to buy" without looking up a price at a broker, which is the last
outside website on the Atkore journey. This checks whether the data exists to keep that promise.

## The answer

**Every one of the eight investments in "What to buy" can carry a dated price from public SEC
filings.** The newest usable date on 13 September 2026 is **30 June 2026**, because holdings filings
become public about two months after the month they report.

| What a learner buys | CUSIP | Price on 30 June 2026 | Where it comes from | Funds that agree |
| --- | --- | ---: | --- | ---: |
| VTI | 922908769 | $370.04 | Other funds' holdings filings | 3 |
| VOO | 922908363 | $686.81 | Other funds' holdings filings | 2 |
| VXUS | 921909768 | $85.49 | Other funds' holdings filings | 2 |
| AGG | 464287226 | $98.98 | Other funds' holdings filings | 9 |
| SGOV | 46436E718 | $100.67 | Other funds' holdings filings | 7 |
| TSM, the American depositary share | 874039100 | $477.57 | Other funds' holdings filings | 8 |
| AAPL | 037833100 | $289.36 | Studio's existing price snapshot, from Vanguard funds' filings | — |
| Treasury note | 91282CRF0 | 99.540696 per $100 | Its auction on 12 August 2026, already in the catalogue | — |

Every price from a holdings filing here is fair-value level 1: a quoted market price.

## How a price is established

A fund that owns shares of VTI reports, for each month, how many shares it holds and what they were
worth in US dollars. Worth divided by shares is the price the fund used, which for an
exchange-traded holding is the closing market price that month-end.

**The check that could have failed.** A price read from one fund's filing is one sample. So for every
investment, several unrelated funds that filed for the same month-end were read and compared. On
every date where more than one fund was read, they agreed **to the cent**:

| | Dates with two or more funds, and how many agreed |
| --- | --- |
| VTI | 31 Mar (4), 30 Apr (4), 30 Jun (3) |
| VOO | 28 Feb (2), 31 Mar (2), 30 Apr (2), 31 May (2), 30 Jun (2) |
| VXUS | 30 Apr (4), 31 May (4), 30 Jun (2) |
| AGG | 31 May (3), 30 Jun (9) |
| SGOV | 31 May (5), 30 Jun (7) |
| TSM ADS | 31 May (4), 30 Jun (8) |

The funds are unrelated to one another: VTI's price for 30 June was read from LVIP Vanguard Domestic
Equity ETF Fund, Potomac Tactical Rotation Fund and Morningstar Aggressive Growth ETF Asset
Allocation Portfolio. TSMC's was read from eight funds including Nomura Focused Large Growth ETF and
Baron Durable Advantage Fund.

**The CUSIPs** were first written from memory, then confirmed by the holding each one found: its own
name in the filing and, where the filer gave one, its ISIN (VOO `US9229083632`, VXUS `US9219097683`,
AGG `US4642872265`, TSM `US8740391003`, whose title reads "SPON ADS REP 5 ORD TWD10"). Names are not a
safe key on their own: one filer titled AGG "ISHARES CORE U.S. AGGREGATE MUTUAL FUND".

## How fresh

- Holdings are reported for every month-end, and the filings read became public **37 to 60 days**
  after the month they report. Two filings were later, at 102 and 106 days, both for an earlier month.
- So on 13 September 2026 the newest date is 30 June; 31 July filings arrive through late September.
  A learner would see a price roughly two to three months old, **always with its date**.
- That fits how Studio already treats prices: a dated research price, never a live quote. The page
  must say the price is what funds reported at that month-end, not what the investment costs today.
- Monthly reporting was observed in these filings. The rule text was not read, so whether every fund
  files every month is not established here.

## Routes checked and set aside

- **Studio's existing price snapshot** is built from 24 filings of Vanguard index funds. It prices the
  companies those funds hold, so Apple and Atkore, but none of the five funds and not TSMC's American
  share.
- **Matching by name** is unsafe. "Taiwan Semiconductor" in the snapshot also matches Taiwan
  Semiconductor Co., a different company, at $2.03 on 30 April; and TSMC's Taiwan-listed share,
  $69.42 and level 2, is not what a US learner buys. Match on the CUSIP or ISIN of the exact listing.
- **The funds' own shareholder reports** are tagged in inline XBRL, but Vanguard Index Funds' N-CSRS
  for 30 June 2026 (`0001104659-26-102230`) uses 173 tags and none is a per-share value or price;
  the nearest is a percentage of net assets. iShares Trust's report document is 37 MB and was not
  pulled.
- **The SEC's quarterly N-PORT data sets** hold every fund's holdings at once. The ten most recent
  quarters listed run from 387 to 483 MB each, updated quarterly. Not downloaded: too large to pull
  without asking, and not needed, because a search and a few small filings per investment is enough.

## Terms

SEC dissemination terms, read firsthand on 2026-09-10 (`studio-online-data-and-tools.md` §5.1):
information on sec.gov may be copied or further distributed, and citation is requested. Automated
requests must identify themselves with a contact address, which every request here did.

## Limits

- **A price exists only while other funds hold the investment.** Filings found by CUSIP since
  1 October 2025: VTI 182, VOO 545, VXUS 35, AGG 403, SGOV 89, TSMC's American share 3,705. VXUS is the
  thinnest, with two agreeing funds on the newest date.
- **EDGAR's full-text search refused a fast run.** The last five of twelve queries, 400ms apart,
  returned server errors; retried 1.5 seconds apart with backoff, all succeeded. Anything built on it
  must pace itself and retry.
- The filings read were 5 to 21 KB each. Large multi-holding filings were skipped at a size cap, and a
  build should keep one.
- A price from a holdings filing is a price, not a return: it carries no dividends.

## What this means for R5

R5 can meet its check. "What to buy" can start from a dated price for all eight investments, the
broker's quote becomes an optional override, and the last outside website on the Atkore journey goes.

Suggested shape, as a source step like the others under `scripts/source/`:

1. Record the CUSIP of the exact listing bought for each catalogue investment.
2. For each, search EDGAR's full text for that CUSIP in holdings filings, paced and retried.
3. Read up to a handful of small filings, capped by size, and take the newest month-end on which at
   least two unrelated funds agree to the cent. Record the price, the date, the fair-value level and
   the accessions that agreed.
4. Where no two funds agree, record no price, say so, and keep asking for the broker's quote.
5. Show every price with its date and what it is. Refresh monthly, once late-month filings are in.
