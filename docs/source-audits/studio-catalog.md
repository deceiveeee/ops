# Studio research catalog: provenance and boundaries

Review date: 2026-09-04. Scope: `lib/studio-catalog.ts` and the exposure handling in
`lib/studio.ts` that consumes it.

This is the file a Studio user is trusting when they decide what to buy. Every fact in it
comes from a named filing with a date, or is `null`. There is no third state, and no
figure is estimated, rounded for presentation, or carried over from memory.

## 1. Source lock

The catalog holds no independent research. It derives from `lib/holdings-slate.ts`, whose
four products were reviewed for Mission 12 and audited in
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

## 2. Prices are absent by design

`referencePrice` is `null` and `priceAsOf` is empty for every instrument. OPS holds no
market-data licence, and EDGAR publishes filings, not quotes. The buying worksheet already
handles this correctly: it keeps the user's dollar target, declines to invent a share
count, and asks for a dated broker quote. A user must therefore bring one price from their
broker — the same broker they would place the order with — and that is stated in the
worksheet rather than implied.

## 3. Two findings that changed the code

Both were caught by `lib/studio-catalog.test.ts` rather than by reading, and both would
have produced a confidently wrong answer on screen.

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
as a complete one. All four reviewed products track US indexes.

| Missing | Consequence | What it needs |
| --- | --- | --- |
| International and global stock funds | A portfolio built only from this library is entirely US companies. The stress model's international and global settings have nothing to apply to. | Prospectus and N-PORT review per candidate, matching the Mission 12 standard. |
| Individual company shares, US and foreign | No individual-stock research path. For a foreign company, domicile, trading currency and where the business earns are three separate facts. | Per-company filing review, plus the ADR mechanics already sourced as P3/P4 in [`studio-learning.md`](./studio-learning.md). |
| Individual bonds, including Treasuries | The worksheet prices bonds by face value and accrued interest, with no reviewed issue to apply it to. | Per-issue CUSIP, coupon, maturity and accrual basis from an official source such as TreasuryDirect, with the settlement date any accrued figure assumes. |

The user's confirmed launch scope requires individual stocks, foreign stocks and individual
bonds. Those are not in this catalog and must not be represented as available until each
security carries its own dated source record.

## 5. Verification

`lib/studio-catalog.test.ts`, 15 assertions. Expected values come from the filings or from
arithmetic worked by hand in the test comments, never read back out of the code under test:
a 60/40 split of $10,000 is $6,000 and $4,000; the default scenario gives −$1,800 and −$400
for −22%; expense at 0.03% on each side is $3.00 a year; 8 whole shares at $700 spend
$5,600 and leave $400. Provenance assertions check that every source carries an ISO date
and an EDGAR URL, that no price is stated, and that the declared gaps match what the
catalog actually contains.

## 6. Gate status

Catalog provenance and exposure handling are verified for the four reviewed funds. No
market data, no international fund, no individual security, and no UI are covered here.
Studio must not be marked release-ready from this document.
