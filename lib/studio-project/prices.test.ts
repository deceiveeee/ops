import { describe, expect, it } from "vitest";
import {
  AGREEMENT_TOLERANCE,
  buildSnapshot,
  extractObservations,
  periodReturns,
  poolObservations,
  seriesFor,
  isMarketPrice,
  NEAR_ZERO_PRICE,
  venuesFor,
  venueKey,
  type FilingMeta,
} from "./prices";

/**
 * Every expected price here is verified by multiplying back, never by running
 * the code under test. Apple: 466,211,410 × 253.79 = 118,319,793,743.90, which
 * is the filed value to the cent. Barrick New York: 998,659 × 39.34 =
 * 39,287,245.06, likewise exact.
 *
 * The Apple, Barrick and Taiwan Semiconductor Co blocks are verbatim excerpts of
 * SEC filings, which are public domain:
 *   Apple, in Vanguard Total Stock Market Index Fund NPORT-P for 2026-03-31,
 *     CIK 0000036405, accession 0000036405-26-000323.
 *   Barrick and Taiwan Semiconductor Co, in Vanguard Total International Stock
 *     Index Fund NPORT-P for 2026-04-30, CIK 0000736054, accession
 *     0000736054-26-000191.
 * Everything else is an OPS-written test fixture and is not a market fact.
 *
 * Taiwan Semiconductor Co Ltd, ISIN TW0005425003, is *not* TSMC, which is ISIN
 * TW0002330008. Two different companies with near-identical names, which is the
 * argument for keying on identifiers rather than names in one line.
 */

const filing = (overrides: Partial<FilingMeta> = {}): FilingMeta => ({
  cik: "0000036405",
  accession: "0000036405-26-000323",
  filedAt: "2026-05-22",
  entity: "Vanguard Index Funds",
  ...overrides,
});

const doc = (period: string, positions: string) =>
  `<edgarSubmission><repPdDate>${period}</repPdDate><invstOrSecs>${positions}</invstOrSecs></edgarSubmission>`;

/** Verbatim from the filing named above. */
const APPLE = `<invstOrSec>
  <name>Apple Inc</name>
  <lei>HWUPKR0MPOU8FGXBT394</lei>
  <cusip>037833100</cusip>
  <identifiers><isin value="US0378331005"/></identifiers>
  <balance>466211410.00000000</balance>
  <units>NS</units>
  <curCd>USD</curCd>
  <valUSD>118319793743.90000000</valUSD>
  <assetCat>EC</assetCat>
  <invCountry>US</invCountry>
  <fairValLevel>1</fairValLevel>
</invstOrSec>`;

/** Verbatim. One security, three exchanges, two fair-value levels. */
const BARRICK_NEW_YORK = `<invstOrSec>
  <name>Barrick Mining Corp</name>
  <lei>0O4KBQCJZX82UKGCBV73</lei>
  <cusip>06849F108</cusip>
  <identifiers><isin value="CA06849F1080"/></identifiers>
  <balance>998659.00000000</balance>
  <units>NS</units>
  <curCd>USD</curCd>
  <valUSD>39287245.06000000</valUSD>
  <invCountry>US</invCountry>
  <fairValLevel>1</fairValLevel>
</invstOrSec>`;

const BARRICK_TORONTO = `<invstOrSec>
  <name>Barrick Mining Corp</name>
  <lei>0O4KBQCJZX82UKGCBV73</lei>
  <cusip>06849F108</cusip>
  <identifiers><isin value="CA06849F1080"/></identifiers>
  <balance>14331068.00000000</balance>
  <units>NS</units>
  <currencyConditional curCd="CAD" exchangeRt="0.73618700"/>
  <valUSD>563072182.54000000</valUSD>
  <invCountry>CA</invCountry>
  <fairValLevel>1</fairValLevel>
</invstOrSec>`;

const BARRICK_LONDON = `<invstOrSec>
  <name>Barrick Mining Corp</name>
  <lei>0O4KBQCJZX82UKGCBV73</lei>
  <cusip>06849F108</cusip>
  <identifiers><isin value="CA06849F1080"/></identifiers>
  <balance>9008462.00000000</balance>
  <units>NS</units>
  <currencyConditional curCd="GBP" exchangeRt="1.36075000"/>
  <valUSD>354393450.63000000</valUSD>
  <invCountry>GB</invCountry>
  <fairValLevel>2</fairValLevel>
</invstOrSec>`;

describe("deriving a price from a filed position", () => {
  it("divides value by shares, exactly", () => {
    const result = extractObservations(doc("2026-03-31", APPLE), filing());
    expect(result.observations).toHaveLength(1);
    const apple = result.observations[0];

    // 466,211,410 × 253.79 = 118,319,793,743.90, the filed value to the cent.
    expect(apple.price).toBeCloseTo(253.79, 10);
    expect(apple.shares * apple.price).toBeCloseTo(118_319_793_743.9, 2);
    expect(apple.asOf).toBe("2026-03-31");
    expect(apple.fairValueLevel).toBe("1");
    expect(apple.securityId).toBe("ISIN:US0378331005");
  });

  it("prefers the ISIN, because a third of foreign positions have nothing else", () => {
    const result = extractObservations(doc("2026-03-31", APPLE), filing());
    // Both identifiers are filed here, and the ISIN wins. For a US security the
    // two are not independent — the ISIN is "US" plus the CUSIP plus a check
    // digit — so this costs nothing domestically and gains the 34% of
    // international positions that file an ISIN and nothing else.
    expect(result.observations[0].securityId).toBe("ISIN:US0378331005");
    expect(result.observations[0].securityId.startsWith("CUSIP:")).toBe(false);
  });

  it("falls back to the CUSIP when no ISIN is filed", () => {
    const noIsin = `<invstOrSec><name>Fixture Co</name><cusip>123456789</cusip>
      <balance>100</balance><units>NS</units><valUSD>2500</valUSD>
      <invCountry>US</invCountry><fairValLevel>1</fairValLevel></invstOrSec>`;
    const result = extractObservations(doc("2026-03-31", noIsin), filing());
    expect(result.observations[0].securityId).toBe("CUSIP:123456789");
    expect(result.observations[0].price).toBe(25); // 2500 / 100
  });

  it("refuses to price a position identified only by its issuer LEI", () => {
    // Measured: 217 VXUS issuers carry more than one security under one LEI.
    // Cemex is $12.30 as a US ADR and $1.23 as a Mexican local share.
    const leiOnly = `<invstOrSec><name>Two Class Co</name>
      <lei>1I6HV0TLSTR3A4XQ6L78</lei><cusip>N/A</cusip>
      <balance>100</balance><units>NS</units><valUSD>9999</valUSD>
      <invCountry>US</invCountry><fairValLevel>1</fairValLevel></invstOrSec>`;
    const result = extractObservations(doc("2026-03-31", leiOnly), filing());

    expect(result.observations).toHaveLength(0);
    expect(result.exclusions).toHaveLength(1);
    expect(result.exclusions[0].reason).toBe("no security identifier");
    expect(result.exclusions[0].detail).toContain("1I6HV0TLSTR3A4XQ6L78");
  });

  it("treats the literal string N/A as an absent identifier", () => {
    const na = `<invstOrSec><name>Foreign Co</name><lei>N/A</lei><cusip>N/A</cusip>
      <identifiers><isin value="TW0005425003"/></identifiers>
      <balance>3014342.00000000</balance><units>NS</units>
      <currencyConditional curCd="TWD" exchangeRt="0.03156100"/>
      <valUSD>6112423.26000000</valUSD>
      <invCountry>TW</invCountry><fairValLevel>2</fairValLevel></invstOrSec>`;
    const result = extractObservations(doc("2026-04-30", na), filing());

    expect(result.observations).toHaveLength(1);
    expect(result.observations[0].lei).toBeNull();
    expect(result.observations[0].securityId).toBe("ISIN:TW0005425003");
    expect(result.observations[0].venue).toEqual({ currency: "TWD", country: "TW" });
    // 0.031561 USD per TWD, so a $2.0278 share is about 64 TWD. Recovering the
    // local price is the point of carrying the rate.
    expect(result.observations[0].price / result.observations[0].exchangeRate!).toBeCloseTo(64.25, 1);
  });
});

describe("positions that cannot yield a share price", () => {
  it("excludes derivative contracts, naming what they are", () => {
    // Measured: an NC quotient came out at −$2.67 and another at $2,367,874.
    const contracts = `<invstOrSec><name>N/A</name>
      <identifiers><isin value="US0000000001"/></identifiers>
      <balance>1025000</balance><units>NC</units><valUSD>-2736750</valUSD></invstOrSec>`;
    const result = extractObservations(doc("2026-03-31", contracts), filing());

    expect(result.observations).toHaveLength(0);
    expect(result.exclusions[0]).toMatchObject({ reason: "not a share count", detail: "derivative contracts" });
  });

  it("excludes bond principal, whose quotient is a price per unit of face", () => {
    const bond = `<invstOrSec><name>Argentine Republic Government International Bond</name>
      <identifiers><isin value="US040114HS26"/></identifiers>
      <balance>22</balance><units>PA</units><valUSD>16.4</valUSD></invstOrSec>`;
    const result = extractObservations(doc("2025-10-31", bond), filing());

    expect(result.observations).toHaveLength(0);
    expect(result.exclusions[0]).toMatchObject({ reason: "not a share count", detail: "bond principal amount" });
  });

  it("records a reason for every position it drops, never a zero price", () => {
    const mixed = `${APPLE}
      <invstOrSec><name>No Shares</name><identifiers><isin value="US0000000002"/></identifiers>
        <balance>0</balance><units>NS</units><valUSD>500</valUSD></invstOrSec>
      <invstOrSec><name>No Value</name><identifiers><isin value="US0000000003"/></identifiers>
        <balance>500</balance><units>NS</units><valUSD>0</valUSD></invstOrSec>`;
    const result = extractObservations(doc("2026-03-31", mixed), filing());

    expect(result.observations).toHaveLength(1);
    expect(result.exclusions.map((e) => e.reason)).toEqual(["no share count", "no dollar value"]);
    // The point of the reason: nothing anywhere claims these are worth nothing.
    expect(result.observations.some((o) => o.price === 0)).toBe(false);
  });
});

describe("one security listed on several exchanges", () => {
  const result = extractObservations(
    doc("2026-04-30", `${BARRICK_NEW_YORK}${BARRICK_TORONTO}${BARRICK_LONDON}`),
    filing({ cik: "0000736054", accession: "0000736054-26-000191", entity: "Vanguard STAR Funds" }),
  );

  it("keeps each venue as its own observation rather than averaging them", () => {
    expect(result.observations).toHaveLength(3);
    expect(new Set(result.observations.map((o) => o.securityId))).toEqual(new Set(["ISIN:CA06849F1080"]));
    expect(result.observations.map((o) => o.venue.country).sort()).toEqual(["CA", "GB", "US"]);
  });

  it("prices each venue independently, verified against the filed values", () => {
    const byCountry = new Map(result.observations.map((o) => [o.venue.country, o]));
    // 998,659 × 39.34 = 39,287,245.06 exactly.
    expect(byCountry.get("US")!.price).toBeCloseTo(39.34, 10);
    expect(byCountry.get("CA")!.price).toBeCloseTo(39.2903155, 6);
    expect(byCountry.get("GB")!.price).toBeCloseTo(39.3400617, 6);
  });

  it("carries the fair-value level, which differs by venue on the same day", () => {
    const byCountry = new Map(result.observations.map((o) => [o.venue.country, o]));
    // London had already closed, so its price is a struck fair value, not a quote.
    expect(byCountry.get("US")!.fairValueLevel).toBe("1");
    expect(byCountry.get("CA")!.fairValueLevel).toBe("1");
    expect(byCountry.get("GB")!.fairValueLevel).toBe("2");
  });

  it("carries the exchange rate for foreign venues and none for USD", () => {
    const byCountry = new Map(result.observations.map((o) => [o.venue.country, o]));
    expect(byCountry.get("US")!.exchangeRate).toBeNull();
    expect(byCountry.get("CA")!.exchangeRate).toBe(0.736187);
    expect(byCountry.get("GB")!.exchangeRate).toBe(1.36075);
    // 39.290315 USD ÷ 0.736187 USD per CAD = 53.37 CAD, the Toronto quote.
    expect(byCountry.get("CA")!.price / byCountry.get("CA")!.exchangeRate!).toBeCloseTo(53.37, 2);
  });

  it("lists venues deepest holding first, so a caller can pick one honestly", () => {
    const { snapshot } = buildSnapshot("test", [result]);
    const venues = venuesFor(snapshot, "ISIN:CA06849F1080");
    expect(venues.map((v) => v.venue.country)).toEqual(["CA", "GB", "US"]);
    expect(venues[0].value).toBeGreaterThan(venues[1].value);
    expect(snapshot.quality.multiVenue).toBe(1);
  });
});

describe("one filing reporting a venue in separate lots", () => {
  it("blends them by value, which needs no assumption", () => {
    const lots = `<invstOrSec><name>Split Lot Co</name>
        <identifiers><isin value="US0000000010"/></identifiers>
        <balance>100</balance><units>NS</units><valUSD>3000</valUSD>
        <invCountry>US</invCountry><fairValLevel>1</fairValLevel></invstOrSec>
      <invstOrSec><name>Split Lot Co</name>
        <identifiers><isin value="US0000000010"/></identifiers>
        <balance>50</balance><units>NS</units><valUSD>1400</valUSD>
        <invCountry>US</invCountry><fairValLevel>1</fairValLevel></invstOrSec>`;
    const result = extractObservations(doc("2026-03-31", lots), filing());

    expect(result.observations).toHaveLength(1);
    // (3000 + 1400) / (100 + 50) = 4400 / 150 = 29.333...
    expect(result.observations[0].price).toBeCloseTo(29.3333333, 6);
    expect(result.observations[0].shares).toBe(150);
    expect(result.observations[0].value).toBe(4400);
    // Not the mean of 30 and 28, which would be 29 and would be wrong.
    expect(result.observations[0].price).not.toBeCloseTo(29, 4);
  });
});

describe("pooling independent filings", () => {
  const withPrice = (isin: string, shares: number, value: number, name = "Shared Co") =>
    `<invstOrSec><name>${name}</name><identifiers><isin value="${isin}"/></identifiers>
      <balance>${shares}</balance><units>NS</units><valUSD>${value}</valUSD>
      <invCountry>US</invCountry><fairValLevel>1</fairValLevel></invstOrSec>`;

  it("records corroboration when two filings agree", () => {
    const a = extractObservations(doc("2026-03-31", withPrice("US0000000020", 100, 2500)), filing());
    const b = extractObservations(
      doc("2026-03-31", withPrice("US0000000020", 400, 10000)),
      filing({ accession: "0000036405-26-000325" }),
    );
    const pooled = poolObservations([a, b]);

    expect(pooled.observations).toHaveLength(1);
    expect(pooled.observations[0].price).toBe(25); // both imply exactly 25
    expect(pooled.observations[0].corroborations).toBe(2);
    expect(pooled.conflicts).toHaveLength(0);
  });

  it("withholds the price when filings disagree beyond tolerance", () => {
    const a = extractObservations(doc("2026-03-31", withPrice("US0000000021", 100, 2500)), filing());
    const b = extractObservations(
      doc("2026-03-31", withPrice("US0000000021", 100, 250)),
      filing({ accession: "0000036405-26-000325" }),
    );
    const pooled = poolObservations([a, b]);

    // A price two filings cannot agree on is not published at all.
    expect(pooled.observations).toHaveLength(0);
    expect(pooled.conflicts).toHaveLength(1);
    expect(pooled.conflicts[0].prices.sort((x, y) => x - y)).toEqual([2.5, 25]);
    expect(pooled.exclusions.some((e) => e.reason === "filings disagree")).toBe(true);
  });

  it("accepts a difference just inside tolerance and rejects one just outside", () => {
    const base = 100;
    const inside = base * (1 + AGREEMENT_TOLERANCE * 0.5);
    const outside = base * (1 + AGREEMENT_TOLERANCE * 4);

    const pair = (other: number, isin: string) =>
      poolObservations([
        extractObservations(doc("2026-03-31", withPrice(isin, 1, base)), filing()),
        extractObservations(doc("2026-03-31", withPrice(isin, 1, other)), filing({ accession: "x" })),
      ]);

    expect(pair(inside, "US0000000022").observations).toHaveLength(1);
    expect(pair(outside, "US0000000023").observations).toHaveLength(0);
  });

  it("takes the median of three, so one bad filing cannot drag the result", () => {
    const runs = [
      extractObservations(doc("2026-03-31", withPrice("US0000000024", 1, 100)), filing({ accession: "a" })),
      extractObservations(doc("2026-03-31", withPrice("US0000000024", 1, 100.02)), filing({ accession: "b" })),
      extractObservations(doc("2026-03-31", withPrice("US0000000024", 1, 100.04)), filing({ accession: "c" })),
    ];
    const pooled = poolObservations(runs);
    expect(pooled.observations[0].price).toBeCloseTo(100.02, 10);
    expect(pooled.observations[0].corroborations).toBe(3);
  });

  it("never pools two venues of one security into a single number", () => {
    const result = extractObservations(doc("2026-04-30", `${BARRICK_NEW_YORK}${BARRICK_TORONTO}`), filing());
    const pooled = poolObservations([result, result]);

    expect(pooled.observations).toHaveLength(2);
    expect(pooled.conflicts).toHaveLength(0);
    expect(new Set(pooled.observations.map((o) => o.observationKey))).toEqual(
      new Set([venueKey("ISIN:CA06849F1080", { currency: "USD", country: "US" }), venueKey("ISIN:CA06849F1080", { currency: "CAD", country: "CA" })]),
    );
  });
});

describe("the snapshot", () => {
  const march = extractObservations(doc("2026-03-31", `${APPLE}${BARRICK_NEW_YORK}`), filing());
  const october = extractObservations(
    doc("2025-10-31", `${BARRICK_NEW_YORK}${BARRICK_LONDON}`),
    filing({ accession: "0000036405-25-000372", filedAt: "2025-12-19" }),
  );

  it("counts what it holds, by date and by valuation level", () => {
    const { snapshot } = buildSnapshot("2026-09-05", [march, october], "2026-09-05T00:00:00.000Z");

    expect(snapshot.quality.dates).toEqual(["2025-10-31", "2026-03-31"]);
    expect(snapshot.quality.observations).toBe(4);
    expect(snapshot.quality.securities).toBe(2);
    expect(snapshot.quality.byLevel["1"]).toBe(3);
    expect(snapshot.quality.byLevel["2"]).toBe(1);
    expect(snapshot.quality.conflicts).toBe(0);
  });

  it("names every filing behind it, so any number traces back", () => {
    const { snapshot } = buildSnapshot("2026-09-05", [march, october]);
    expect(snapshot.sources.map((s) => s.accession)).toEqual([
      "0000036405-26-000323",
      "0000036405-25-000372",
    ]);
    expect(snapshot.version).toBe("2026-09-05");
  });

  it("returns a series in date order without inventing the gap between", () => {
    const { snapshot } = buildSnapshot("2026-09-05", [march, october]);
    const series = seriesFor(snapshot, venueKey("ISIN:CA06849F1080", { currency: "USD", country: "US" }));

    expect(series.map((o) => o.asOf)).toEqual(["2025-10-31", "2026-03-31"]);
    // Five months apart, and the snapshot says so rather than filling it in.
    expect(series).toHaveLength(2);
  });
});

describe("values that are not quoted prices", () => {
  const modelled = `<invstOrSec><name>Sanctioned Holding</name>
      <identifiers><isin value="RU0000000001"/></identifiers>
      <balance>1000000</balance><units>NS</units><valUSD>10</valUSD>
      <invCountry>RU</invCountry><fairValLevel>3</fairValLevel></invstOrSec>
    <invstOrSec><name>Halted Large Holding</name>
      <identifiers><isin value="KR0000000001"/></identifiers>
      <balance>100</balance><units>NS</units><valUSD>85500</valUSD>
      <invCountry>KR</invCountry><fairValLevel>3</fairValLevel></invstOrSec>`;

  it("keeps Level 3 but marks it as not a market price", () => {
    const result = extractObservations(doc("2025-10-31", `${APPLE}${modelled}`), filing());
    const { snapshot } = buildSnapshot("test", [result]);

    // Kept, because a written-down holding is a fact the learner needs.
    expect(snapshot.quality.observations).toBe(3);
    expect(snapshot.quality.modelled).toBe(2);
    expect(snapshot.observations.filter(isMarketPrice)).toHaveLength(1);
    expect(snapshot.observations.filter(isMarketPrice)[0].name).toBe("Apple Inc");
  });

  it("separates a write-down from a credible unquoted value", () => {
    const result = extractObservations(doc("2025-10-31", modelled), filing());
    const byName = new Map(result.observations.map((o) => [o.name, o]));

    // 10 / 1,000,000 = 0.00001, below a hundredth of a cent: written down.
    expect(byName.get("Sanctioned Holding")!.price).toBeCloseTo(0.00001, 10);
    expect(byName.get("Sanctioned Holding")!.price).toBeLessThan(NEAR_ZERO_PRICE);
    // 85,500 / 100 = 855, a real value that simply was not quoted that day.
    expect(byName.get("Halted Large Holding")!.price).toBe(855);
    expect(byName.get("Halted Large Holding")!.price).toBeGreaterThan(NEAR_ZERO_PRICE);

    const { snapshot } = buildSnapshot("test", [result]);
    expect(snapshot.quality.nearZero).toBe(1);
    expect(snapshot.quality.modelled).toBe(2);
  });

  it("counts a quoted price as a market price at either observable level", () => {
    const result = extractObservations(doc("2026-04-30", `${BARRICK_NEW_YORK}${BARRICK_LONDON}`), filing());
    // Level 1 in New York, Level 2 in London. Both came from a market.
    expect(result.observations.every(isMarketPrice)).toBe(true);
  });
});

describe("returns between observations", () => {
  it("carries the real gap in days, because observations are not evenly spaced", () => {
    const at = (asOf: string, price: number) =>
      ({ asOf, price, observationKey: "k" }) as Parameters<typeof periodReturns>[0][number];

    const returns = periodReturns([at("2026-01-31", 100), at("2026-02-28", 110), at("2026-05-31", 99)]);

    expect(returns).toHaveLength(2);
    expect(returns[0]).toMatchObject({ from: "2026-01-31", to: "2026-02-28", days: 28 });
    expect(returns[0].return).toBeCloseTo(0.1, 10); // 110 / 100 − 1
    expect(returns[1].days).toBe(92); // 28 Feb to 31 May 2026
    expect(returns[1].return).toBeCloseTo(-0.1, 10); // 99 / 110 − 1
  });

  it("produces nothing from a single observation", () => {
    const one = [{ asOf: "2026-01-31", price: 100 }] as Parameters<typeof periodReturns>[0];
    expect(periodReturns(one)).toEqual([]);
  });
});
