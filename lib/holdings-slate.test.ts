import { describe, expect, it } from "vitest";
import {
  aggregate,
  exposureKey,
  IDENTITY_CONFLICTS,
  lookThrough,
  overlapBetween,
  PRODUCTS,
  PRODUCT_TICKERS,
  RECORDED_OVERLAP,
  stalenessDays,
  VTI_SHARE_CLASSES,
  type Position,
} from "./holdings-slate";

const round4 = (n: number) => Math.round(n * 1e4) / 1e4;

// ---------------------------------------------------------------------------
// Shipped-constant integrity
//
// These guard the data, not the maths. Four `shownCoveragePct` values were
// wrong when this module was first written — stated rather than computed — and
// every one of them would have been shown to a learner as "you are looking at
// N% of this fund". A number that describes the shipped subset must be derived
// from the shipped subset.
// ---------------------------------------------------------------------------

describe("shipped constants agree with the shipped data", () => {
  it.each(PRODUCT_TICKERS)(
    "%s shownCoveragePct equals the sum of its top positions",
    (ticker) => {
      const h = PRODUCTS[ticker].holdings;
      const summed = round4(
        h.topPositions.reduce((total, p) => total + p.weightPct, 0),
      );
      expect(h.shownCoveragePct).toBe(summed);
    },
  );

  it.each(PRODUCT_TICKERS)(
    "%s discloses a weight sum that is not 100%%",
    (ticker) => {
      // Every real filing in this slate reports weights that miss 100. If a
      // future edit "tidies" one to exactly 100, the X-Ray's residual band
      // silently becomes a lie.
      expect(PRODUCTS[ticker].holdings.weightSumPct).not.toBe(100);
    },
  );

  it.each(PRODUCT_TICKERS)(
    "%s keeps the holdings date separate from the fiscal period end",
    (ticker) => {
      const h = PRODUCTS[ticker].holdings;
      expect(h.asOf).not.toBe(h.fiscalPeriodEnd);
      expect(Date.parse(h.asOf)).toBeLessThan(Date.parse(h.fiscalPeriodEnd));
    },
  );

  it.each(PRODUCT_TICKERS)("%s describes no leverage", (ticker) => {
    expect(PRODUCTS[ticker].leverageDescribed).toBe(false);
  });

  it.each(PRODUCT_TICKERS)(
    "%s publishes no spread or premium/discount figure",
    (ticker) => {
      expect(PRODUCTS[ticker].spreadDisclosure).toBe("qualitative-only");
    },
  );

  it.each(PRODUCT_TICKERS)(
    "%s states what changed since the prior year",
    (ticker) => {
      // Compared filing to filing at Gate A. "Nothing substantive changed" is
      // a finding, so an empty string is a regression, not a valid state.
      const mc = PRODUCTS[ticker].materialChanges;
      expect(mc.trim().length).toBeGreaterThan(0);
      expect(mc).toMatch(/\d{4}/);
    },
  );

  it("flags SGOV's turnover as not comparable and explains why", () => {
    const sgov = PRODUCTS.SGOV;
    expect(sgov.turnoverPct).toBe(0);
    expect(sgov.turnoverComparable).toBe(false);
    expect(sgov.turnoverNote).toMatch(/N-1A/);
    // The comparable funds must not carry the flag, or it means nothing.
    expect(PRODUCTS.AGG.turnoverComparable).toBe(true);
    expect(PRODUCTS.AGG.turnoverNote).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

describe("share-class identity", () => {
  it("puts VTI and VTSAX in the same series with different class ids", () => {
    const vti = VTI_SHARE_CLASSES.find((c) => c.ticker === "VTI");
    const vtsax = VTI_SHARE_CLASSES.find((c) => c.ticker === "VTSAX");
    expect(vti?.classId).toBe("C000007808");
    expect(vtsax?.classId).toBe("C000007806");
    expect(vti?.classId).not.toBe(vtsax?.classId);
    // Same portfolio, different price and different access terms.
    expect(vti?.totalExpensePct).toBe(0.03);
    expect(vtsax?.totalExpensePct).toBe(0.04);
    expect(vti?.minimumUsd).toBeNull();
    expect(vtsax?.minimumUsd).toBe(3000);
  });

  it("gives VTI and VOO the same registrant but different series", () => {
    expect(PRODUCTS.VTI.cik).toBe(PRODUCTS.VOO.cik);
    expect(PRODUCTS.VTI.seriesId).not.toBe(PRODUCTS.VOO.seriesId);
  });

  it("keys on LEI when present and falls back to CUSIP when not", () => {
    const withLei: Position = {
      name: "Apple Inc",
      cusip: "037833100",
      lei: "HWUPKR0MPOU8FGXBT394",
      weightPct: 1,
    };
    const withoutLei: Position = {
      name: "BLACKROCK CASH FUNDS",
      cusip: "066922477",
      lei: null,
      weightPct: 1,
    };
    expect(exposureKey(withLei, "issuer")).toBe("lei:HWUPKR0MPOU8FGXBT394");
    expect(exposureKey(withLei, "instrument")).toBe("cusip:037833100");
    expect(exposureKey(withoutLei, "issuer")).toBe("cusip:066922477");
  });
});

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

describe("aggregate", () => {
  it("merges Alphabet's two share classes under the issuer key", () => {
    const positions = PRODUCTS.VTI.holdings.topPositions;
    const byInstrument = aggregate(positions, "instrument");
    const byIssuer = aggregate(positions, "issuer");

    const alphabetInstruments = byInstrument.filter((r) =>
      r.name.startsWith("Alphabet"),
    );
    expect(alphabetInstruments).toHaveLength(2);

    const alphabetIssuer = byIssuer.filter((r) => r.name.startsWith("Alphabet"));
    expect(alphabetIssuer).toHaveLength(1);
    expect(alphabetIssuer[0].positions).toBe(2);
    expect(alphabetIssuer[0].weightPct).toBe(round4(2.6694 + 2.1139));
  });

  it("changes Alphabet's rank, which is the point of the toggle", () => {
    const positions = PRODUCTS.VTI.holdings.topPositions;
    const instrumentRank =
      aggregate(positions, "instrument").findIndex((r) =>
        r.name.startsWith("Alphabet"),
      ) + 1;
    const issuerRank =
      aggregate(positions, "issuer").findIndex((r) =>
        r.name.startsWith("Alphabet"),
      ) + 1;
    expect(instrumentRank).toBe(5);
    expect(issuerRank).toBe(3);
  });

  it("marks a position with no filed LEI as uncovered rather than dropping it", () => {
    const byIssuer = aggregate(PRODUCTS.AGG.holdings.topPositions, "issuer");
    const cash = byIssuer.find((r) => r.name === "BLACKROCK CASH FUNDS");
    expect(cash).toBeDefined();
    expect(cash?.uncovered).toBe(true);
    // Nothing is lost: total weight in equals total weight out.
    const totalIn = round4(
      PRODUCTS.AGG.holdings.topPositions.reduce((t, p) => t + p.weightPct, 0),
    );
    const totalOut = round4(byIssuer.reduce((t, r) => t + r.weightPct, 0));
    expect(totalOut).toBe(totalIn);
  });
});

// ---------------------------------------------------------------------------
// The planted defect: name matching
//
// Per docs/lesson-plans/missions-10-13-forward-plan.md §1.2, a check ships with
// a test that plants the defect and requires the check to report it. The defect
// here is the obvious implementation — aggregating by issuer *name* — and the
// slate contains a real case that breaks it in both directions.
// ---------------------------------------------------------------------------

function aggregateByNameDefect(positions: readonly Position[]) {
  const out = new Map<string, number>();
  for (const p of positions) {
    const key = p.name.trim().toUpperCase();
    out.set(key, (out.get(key) ?? 0) + p.weightPct);
  }
  return out;
}

describe("name matching is not an issuer key", () => {
  const treasuryLei = "254900HROIFWPRGM1V77";

  it("LEI merges the U.S. Treasury across two funds where the name does not", () => {
    // AGG files it as "United States Treasury"; SGOV files it as "United States
    // of America". Same issuer, same LEI, different strings.
    const aggTreasury = PRODUCTS.AGG.holdings.topPositions.find(
      (p) => p.lei === treasuryLei,
    );
    const sgovTreasury = PRODUCTS.SGOV.holdings.topPositions.find(
      (p) => p.lei === treasuryLei,
    );
    expect(aggTreasury).toBeDefined();
    expect(sgovTreasury).toBeDefined();
    expect(aggTreasury!.name).not.toBe(sgovTreasury!.name);

    // The real key matches them.
    expect(exposureKey(aggTreasury!, "issuer")).toBe(
      exposureKey(sgovTreasury!, "issuer"),
    );

    // The defect does not — a name-keyed build reports no Treasury overlap
    // between the stability and liquidity sleeves at all.
    const aggByName = aggregateByNameDefect(PRODUCTS.AGG.holdings.topPositions);
    const sgovByName = aggregateByNameDefect(
      PRODUCTS.SGOV.holdings.topPositions,
    );
    const sharedNames = [...sgovByName.keys()].filter((k) => aggByName.has(k));
    expect(sharedNames).not.toContain("UNITED STATES OF AMERICA");
  });

  it("LEI separates two different BlackRock entities that share a name", () => {
    // The same string, "BlackRock Funds III", is two different legal entities
    // across these two funds — and they share a CUSIP. Name matching merges
    // them; the LEI key does not.
    const aggBlackRock = PRODUCTS.AGG.holdings.topPositions.find(
      (p) => p.name === "BlackRock Funds III",
    );
    const sgovBlackRock = PRODUCTS.SGOV.holdings.topPositions.find(
      (p) => p.name === "BlackRock Funds III",
    );
    expect(aggBlackRock!.name).toBe(sgovBlackRock!.name);
    expect(aggBlackRock!.lei).not.toBe(sgovBlackRock!.lei);
    expect(exposureKey(aggBlackRock!, "issuer")).not.toBe(
      exposureKey(sgovBlackRock!, "issuer"),
    );
    // And they do share a CUSIP, so the instrument key merges what the issuer
    // key splits. Neither key is universally right, which the lesson states.
    expect(aggBlackRock!.cusip).toBe(sgovBlackRock!.cusip);
  });

  it("records the identity conflict rather than silently picking a winner", () => {
    const cusips = new Set(IDENTITY_CONFLICTS.map((c) => c.cusip));
    expect(cusips.size).toBe(1);
    const leis = new Set(IDENTITY_CONFLICTS.map((c) => c.lei));
    expect(leis.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// Overlap
// ---------------------------------------------------------------------------

describe("overlapBetween", () => {
  const vti = {
    positions: PRODUCTS.VTI.holdings.topPositions,
    asOf: PRODUCTS.VTI.holdings.asOf,
  };
  const voo = {
    positions: PRODUCTS.VOO.holdings.topPositions,
    asOf: PRODUCTS.VOO.holdings.asOf,
  };
  const agg = {
    positions: PRODUCTS.AGG.holdings.topPositions,
    asOf: PRODUCTS.AGG.holdings.asOf,
  };

  it("finds every shown VOO position inside VTI", () => {
    const result = overlapBetween(voo, vti, "instrument");
    expect(result.sharedKeys).toBe(voo.positions.length);
    expect(result.sharedPct).toBe(PRODUCTS.VOO.holdings.shownCoveragePct);
    expect(result.datesAligned).toBe(true);
  });

  it("reports a date mismatch across sponsors instead of hiding it", () => {
    const result = overlapBetween(agg, vti, "instrument");
    expect(result.datesAligned).toBe(false);
    expect(result.innerAsOf).toBe("2026-05-31");
    expect(result.outerAsOf).toBe("2026-03-31");
  });

  it("reports the uncovered share when keying on issuer", () => {
    const result = overlapBetween(agg, vti, "issuer");
    // AGG's largest shown holding has no LEI, so it cannot be issuer-keyed.
    expect(result.uncoveredPct).toBe(2.7786);
  });
});

describe("RECORDED_OVERLAP", () => {
  it("reports both keys for every pair, because the key changes the answer", () => {
    for (const row of RECORDED_OVERLAP) {
      expect(row.byInstrumentPct).not.toBe(row.byIssuerPct);
    }
  });

  it("keeps the AGG/VTI pair marked as date-misaligned", () => {
    const pair = RECORDED_OVERLAP.find(
      (r) => r.inner === "AGG" && r.outer === "VTI",
    );
    expect(pair?.datesAligned).toBe(false);
    // Zero by instrument, materially non-zero by issuer. This is the finding
    // that retired the "clean negative" framing.
    expect(pair?.byInstrumentPct).toBe(0);
    expect(pair?.byIssuerPct).toBeGreaterThan(10);
  });
});

// ---------------------------------------------------------------------------
// Look-through
// ---------------------------------------------------------------------------

describe("lookThrough", () => {
  const slate = [
    { ticker: "VTI", weightPct: 60 },
    { ticker: "VOO", weightPct: 40 },
  ];

  it("adds a duplicated issuer across both funds", () => {
    const { rows } = lookThrough(slate, "issuer");
    const apple = rows.find((r) => r.name === "Apple Inc");
    expect(apple?.viaFund).toHaveLength(2);
    expect(apple?.totalPct).toBe(
      round4((60 * 5.9407) / 100 + (40 * 6.6619) / 100),
    );
  });

  it("ranks Alphabet higher on the issuer key than on the instrument key", () => {
    const issuerRows = lookThrough(slate, "issuer").rows;
    const instrumentRows = lookThrough(slate, "instrument").rows;
    const issuerRank =
      issuerRows.findIndex((r) => r.name.startsWith("Alphabet")) + 1;
    const instrumentRank =
      instrumentRows.findIndex((r) => r.name.startsWith("Alphabet")) + 1;
    expect(issuerRank).toBeLessThan(instrumentRank);
  });

  it("reports coverage rather than implying the table is the whole portfolio", () => {
    const { coveragePct, asOfDates } = lookThrough(slate, "issuer");
    expect(coveragePct).toBeGreaterThan(0);
    expect(coveragePct).toBeLessThan(100);
    expect(asOfDates).toEqual(["2026-03-31"]);
  });

  it("surfaces every distinct as-of date in a cross-sponsor slate", () => {
    const { asOfDates } = lookThrough(
      [
        { ticker: "VTI", weightPct: 60 },
        { ticker: "AGG", weightPct: 40 },
      ],
      "issuer",
    );
    expect(asOfDates).toEqual(["2026-03-31", "2026-05-31"]);
  });

  it("ignores products at zero weight and unknown tickers", () => {
    const { rows } = lookThrough(
      [
        { ticker: "VTI", weightPct: 0 },
        { ticker: "NOPE", weightPct: 50 },
      ],
      "issuer",
    );
    expect(rows).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Staleness
// ---------------------------------------------------------------------------

describe("stalenessDays", () => {
  it("matches the audited figures at the recorded retrieval date", () => {
    expect(stalenessDays("2026-03-31", "2026-08-16")).toBe(138);
    expect(stalenessDays("2026-05-31", "2026-08-16")).toBe(77);
  });

  it("never returns a negative age", () => {
    expect(stalenessDays("2026-08-16", "2026-03-31")).toBe(0);
  });

  it("returns 0 rather than NaN on an unparseable date", () => {
    expect(stalenessDays("not-a-date", "2026-08-16")).toBe(0);
  });
});
