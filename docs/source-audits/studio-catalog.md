# Studio research catalog: provenance and boundaries

Review date: 2026-09-04. Scope: `lib/studio-catalog.ts` and the exposure handling in
`lib/studio.ts` that consumes it.

This is the file a Studio user is trusting when they decide what to buy. Every fact in it
comes from a named filing with a date, or is `null`. There is no third state, and no
figure is estimated, rounded for presentation, or carried over from memory.

## 1. Source lock

Four of the six entries derive from `lib/holdings-slate.ts`, whose products were reviewed
for Mission 12 and audited in
[`mission-12-holdings.md`](./mission-12-holdings.md). Retrieval date `2026-08-16`, exported
as `CATALOG_REVIEWED_AT`.

| Symbol | Series | CIK | Prospectus | N-PORT holdings | Filed expense |
| --- | --- | --- | --- | --- | --- |
| VTI | Vanguard Total Stock Market Index Fund | 0000036405 | 0000036405-26-000197 | 0000036405-26-000323, as of 2026-03-31 | 0.03% |
| VOO | Vanguard 500 Index Fund | 0000036405 | 0000036405-26-000183 | 0000036405-26-000325, as of 2026-03-31 | 0.03% |
| AGG | iShares Core U.S. Aggregate Bond ETF | 0001100663 | 0001193125-26-287958 | 0001410368-26-075254 | 0.03% |
| SGOV | iShares 0-3 Month Treasury Bond ETF | 0001100663 | 0001193125-26-287938 | 0002071691-26-016719 | 0.09% |

Entries are computed from those records at module load rather than retyped, so there is no
second copy of a filed number to drift from the first.

## 1a. One international stock fund

VXUS, added 2026-09-04. Reviewed from the fund's own filings, not from
`holdings-slate.ts`, which covers Mission 12's four products only.

| Field | Value | Source |
| --- | --- | --- |
| Registrant / CIK | Vanguard Star Funds / 0000736054 | `company_tickers_mf.json` |
| Series / class | S000002932 / C000094038 | `company_tickers_mf.json` |
| Series LEI | BF5U5YXM0ZHVXS3F8G71 | N-PORT `seriesLei` |
| Total annual expenses | **0.05%** — management 0.03%, 12b-1 0.00%, other 0.02% | 485BPOS 0001193125-26-077488, ETF section |
| Expense example on $10,000 | $5 / $16 / $28 / $64 over 1/3/5/10 years | same |
| Target index | FTSE Global All Cap ex US Index | same, Principal Investment Strategies |
| Replication | Full — "generally holds the same stocks … in approximately the same proportions" | same |
| Prospectus date | 2026-02-27, period ended 2025-10-31 | same |
| Holdings as of | 2026-04-30, filed 2026-06-26 | N-PORT 0000736054-26-000191 |
| Net assets | $629,120,124,704.15 | N-PORT `netAssets` |
| Positions | 8,878 | N-PORT |
| Weight sum | 101.3637% — not normalised | N-PORT |

**The fee table is share-class specific.** The filing carries five separate prospectus
sections for this one fund, one per share-class group. Only the ETF section describes
VXUS, and 0.05% is its figure. Reading any other section would state the wrong fee.

**Documented coverage is 12.9901%**, the sum of the eight largest issuers, and that is low
for a defensible reason: the fund's whole top ten is 14.3373% of it. A flat 8,878-position
fund cannot be summarised by a short list, so an overlap check against VXUS sees an eighth
of it. The number is carried through to the interface rather than smoothed.

**One parsing defect, found and fixed during the review.** The filing writes `N/A` in the
`lei` element for a position with no identifier rather than leaving it empty. Treating that
string as an identifier collapsed every unidentified holding into one issuer and produced a
top holding of "Brookfield Infrastructure Corp" at 7.453% spanning 3,172 positions — an
artefact, not a position. With `N/A` normalised to null, the true largest issuer is Taiwan
Semiconductor at 3.9281% in a single position, and 3,222 positions (7.4414%) are correctly
recorded as having no LEI. `holdings-slate.ts` documents the same rule for its own products.

## 1b. One individual Treasury note

Added 2026-09-04 from the US Treasury's own auction record, retrieved that day through the
Fiscal Data auctions query. It exists so the worksheet's face-value and accrued-interest
handling has a real issue to work on.

| Field | Value | Source |
| --- | --- | --- |
| CUSIP | 91282CRF0 | Treasury auction record |
| Term | 10-year note | `security_term` |
| Coupon | 4.625%, semi-annual | `int_rate`, `int_payment_frequency` |
| Maturity | 2036-08-15 | `maturity_date` |
| Auctioned / issued | 2026-08-12 / 2026-08-17 | `auction_date`, `issue_date` |
| Auction price | 99.540696 per $100 face | `price_per100` |
| Minimum / multiples | $100 / $100 | `min_to_issue`, `multiples_to_issue` |

Its issuer LEI, `254900HROIFWPRGM1V77`, is the identifier N-PORT filings use for this
issuer and is cross-referenced from SGOV's holdings record so that a portfolio holding the
note beside AGG or SGOV shows the concentration rather than reading as three separate
things.

**Accrued interest is deliberately null.** The auction record states it only for issue-date
settlement, and the figure depends on when a buyer actually settles. The worksheet excludes
it and says the estimated total is incomplete, which is true; carrying the auction's figure
would be wrong for every date except 2026-08-17.

## 2. Prices, and the one exception

`referencePrice` is `null` and `priceAsOf` empty for all five funds. OPS holds no
market-data licence, and EDGAR publishes filings, not quotes. The buying worksheet handles
this correctly: it keeps the user's dollar target, declines to invent a share count, and
asks for a dated broker quote from the broker they would actually order through.

The Treasury note is the single exception, and the reason is narrow: Treasury publishes its
own auction price, so 99.540696 as of 2026-08-12 is an official dated figure rather than
licensed market data. It is one auction on one date, not a current quote. The worksheet
already warns that a price taken from the catalog is a dated research price to verify with
a broker, and a test asserts that a fund never gains a price without that being a
deliberate licence decision.

## 3. Three findings that changed the code

The first two were caught by `lib/studio-catalog.test.ts` rather than by reading, and both
would have produced a confidently wrong answer on screen. The third was caught by driving
the page.

**The scenario had no international input.** While every reviewed fund tracked a US index,
offering only US stocks, bonds and cash was right — there was nothing for an international
shock to act on. Adding VXUS made `internationalStocksPct` apply to a real holding that a
user could not reach, so the scenario silently used whatever value was already stored.
The field is now in the panel. Global stays out for the same reason in reverse: no global
instrument exists, and a control with nothing to act on is the same defect.

**Issuer coverage was paired with the wrong figure.** `HoldingsRecord.shownCoveragePct`
describes the top *positions* slice. `topIssuers` is a different slice: each row already
aggregates every position that issuer holds. AGG shows the gap — its top ten positions are
4.6399% of the fund, while the same holdings rolled up by issuer account for about 72%,
because United States Treasury alone spans 295 positions at 45.7192%. The catalog now
reports coverage as the sum of the listed issuers, capped at 100.

**Overlap was matched on the issuer's name.** AGG files its largest issuer as
"United States Treasury"; SGOV files the same issuer as "United States of America". Both
carry LEI `254900HROIFWPRGM1V77`. A user holding both funds would have been told they had
no repeated exposure while roughly 73% of the portfolio was one issuer. `StudioExposure`
now carries the filed LEI as `key`, and `calculateStudio` matches on it, falling back to
the label only where a filing left the LEI empty.

A related guard was dropping data: exposures above 100% were discarded as out of range.
Filed weights are not normalised — SGOV's holdings sum to 108.8162% and its Treasury line
is 107.8756% — so that rule silently removed the largest exposure the fund has. Weights are
now clamped where they are used, not discarded on intake. `holdings-slate.ts` already
carried the instruction "Not 100. Never normalise it."

## 4. What this catalog cannot answer

Exported as `CATALOG_GAPS` so the interface can say so rather than let a short library read
as a complete one. All four reviewed funds track US indexes.

| Missing | Consequence | What it needs |
| --- | --- | --- |
| A global fund, and deeper holdings for the international one | Nothing here is a single global holding: VXUS excludes the United States. Its documented issuers are 12.9901% of the fund, so an overlap check against it sees an eighth. | Prospectus and N-PORT review per additional fund, and a deeper issuer list where holdings are too flat for a short one. |
| Individual company shares, US and foreign | No individual-stock research path. For a foreign company, domicile, trading currency and where the business earns are three separate facts. | Per-company filing review, plus the ADR mechanics already sourced as P3/P4 in [`studio-learning.md`](./studio-learning.md). |
| More individual bonds | One Treasury note is present. No corporate or municipal bonds, and no issue states accrued interest for a chosen settlement date, so a bond total is short by exactly that unstated amount. | Per-issue terms from each issuer official source, and an accrual basis worked out for the settlement date rather than the auction. |

The user's confirmed launch scope requires individual stocks, foreign stocks and individual
bonds. Those are not in this catalog and must not be represented as available until each
security carries its own dated source record.

## 5. Verification

`lib/studio-catalog.test.ts`, 20 assertions. Expected values come from the filings and the
auction record, or from arithmetic worked by hand in the test comments, never read back out
of the code under test: a 60/40 split of $10,000 is $6,000 and $4,000; the default scenario
gives −$1,800 and −$400 for −22%; expense at 0.03% on each side is $3.00 a year; 8 whole
shares at $700 spend $5,600 and leave $400; $4,000 of target at 99.540696 per $100 buys
$4,000 of face value for $3,981.63 and leaves $18.37, because Treasury sells in $100
multiples.

Provenance assertions check that every source carries an ISO date and an official-domain
URL, that a price appears only where an official source publishes one and never on a fund,
that bond accrued interest stays null, and that the declared gaps match what the catalog
actually contains.

## 6. Gate status

Catalog provenance and exposure handling are verified for the four Mission 12 funds, VXUS
and the Treasury note. No market data, no individual company share, and no UI are covered
here. Studio must not be marked release-ready from this document.
