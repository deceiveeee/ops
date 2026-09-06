import { describe, expect, it } from "vitest";
import {
  BASIS_UNCERTAIN,
  concentrationRatio,
  herfindahl,
  industryPicture,
  marketShares,
  OTHER_BUCKET,
  profitPool,
  shareInstability,
  type IndustryMember,
  type ShareRow,
} from "./industry";

/**
 * The instability tests check this implementation against figures Morgan Stanley
 * published, which is a genuinely independent answer rather than one derived
 * from the code. Exhibits 13 and 14 of *Measuring the Moat* (Mauboussin and
 * Callahan, Counterpoint Global, 15 October 2024) give both the inputs and the answer.
 *
 * Two of the paper's four exhibits are used. The web-browser and social-media
 * tables are not: their printed per-company changes do not reconcile with their
 * printed shares — Safari is shown moving from 14% to 20% with a stated change
 * of 5% — because the changes were computed from unrounded shares and only the
 * shares were rounded for print. That is a reason to compute from unrounded
 * shares, which this module does, not a reason to match a rounded table.
 */

// Distinct CIKs, because identity is the CIK. The paper's exhibits have none,
// so one is derived from the name purely to keep the fixtures distinguishable.
let nextCik = 1;
const cikOf = new Map<string, number>();
const share = (name: string, value: number): ShareRow => {
  if (!cikOf.has(name)) cikOf.set(name, nextCik++);
  return { name, cik: cikOf.get(name)!, revenue: value * 1000, share: value, basisUncertain: false };
};

describe("market share instability, against the paper's worked examples", () => {
  it("reproduces Exhibit 13, US search engines 2018 to 2023", () => {
    // Shares as printed. Changes: 2, 0, 2, 1, 0 — summing to 5 across five
    // rows, so the average is 1%, which is what the paper prints.
    const of2018 = [share("Google", 0.87), share("Bing", 0.07), share("Yahoo!", 0.05), share("DuckDuckGo", 0.01), share("Others", 0)];
    const of2023 = [share("Google", 0.89), share("Bing", 0.07), share("Yahoo!", 0.03), share("DuckDuckGo", 0.02), share("Others", 0)];

    const result = shareInstability(of2018, of2023, 5);
    expect(result.average).toBeCloseTo(0.01, 10);
    expect(result.stableByRuleOfThumb).toBe(true);
  });

  it("reproduces Exhibit 14, US airlines 2018 to 2023", () => {
    const of2018 = [
      share("American", 0.18), share("Southwest", 0.18), share("Delta", 0.17), share("United", 0.15),
      share("Alaska", 0.06), share("JetBlue", 0.05), share("Spirit", 0.04), share("SkyWest", 0.03),
      share("Frontier", 0.03), share("Other", 0.12),
    ];
    const of2023 = [
      share("American", 0.17), share("Southwest", 0.17), share("Delta", 0.18), share("United", 0.16),
      share("Alaska", 0.06), share("JetBlue", 0.05), share("Spirit", 0.05), share("SkyWest", 0.02),
      share("Frontier", 0.04), share("Other", 0.10),
    ];

    // Changes: 1,1,1,1,0,0,1,1,1,2 = 9 across ten rows = 0.9%, which the paper
    // prints as 1%. The paper calls these shares "relatively consistent".
    const result = shareInstability(of2018, of2023, 5);
    expect(result.average).toBeCloseTo(0.009, 10);
    expect(result.stableByRuleOfThumb).toBe(true);
  });

  it("applies the two-percent rule only to a roughly five-year gap", () => {
    const before = [share("A", 0.5), share("B", 0.5)];
    const after = [share("A", 0.55), share("B", 0.45)];

    // The paper states its threshold for a five-year change. Quoting it against
    // a one-year move would be a different claim than the one it makes.
    expect(shareInstability(before, after, 1).stableByRuleOfThumb).toBeNull();
    expect(shareInstability(before, after, null).stableByRuleOfThumb).toBeNull();
    expect(shareInstability(before, after, 5).stableByRuleOfThumb).toBe(false); // 5pp average
  });

  it("counts an entrant as a full move rather than dropping it", () => {
    const before = [share("Incumbent", 1.0)];
    const after = [share("Incumbent", 0.6), share("Entrant", 0.4)];

    const result = shareInstability(before, after, 5);
    // Incumbent moved 0.4, entrant moved 0.4, averaged over two names.
    expect(result.average).toBeCloseTo(0.4, 10);
    expect(result.rows.find((r) => r.name === "Entrant")?.earlierShare).toBeNull();
    expect(result.stableByRuleOfThumb).toBe(false);
  });

  it("does not mistake a change of company name for a change of share", () => {
    // Union Pacific filed as "UNION PACIFIC CORPORATION" in 2019 and "UNION
    // PACIFIC CORP" in 2024. Matched on name that reads as a 30-point exit plus
    // a 32-point entry, and it alone took the railroad industry's measured
    // instability from about 1.6% to 9.0%.
    const of2019: ShareRow[] = [
      { name: "UNION PACIFIC CORPORATION", cik: 100885, revenue: 21.7e9, share: 0.303, basisUncertain: false },
      { name: "CSX CORPORATION", cik: 277948, revenue: 11.9e9, share: 0.167, basisUncertain: false },
    ];
    const of2024: ShareRow[] = [
      { name: "UNION PACIFIC CORP", cik: 100885, revenue: 24.3e9, share: 0.325, basisUncertain: false },
      { name: "CSX CORPORATION", cik: 277948, revenue: 14.5e9, share: 0.195, basisUncertain: false },
    ];

    const result = shareInstability(of2019, of2024, 5);
    expect(result.rows).toHaveLength(2);

    const unp = result.rows.find((r) => r.name === "UNION PACIFIC CORP");
    expect(unp).toBeDefined();
    expect(unp!.earlierShare).toBeCloseTo(0.303, 10); // matched, not treated as absent
    expect(unp!.absoluteChange).toBeCloseTo(0.022, 10);
    // 2.2 and 2.8 points, averaging 2.5 — not the 30-point phantom move.
    expect(result.average).toBeCloseTo(0.025, 10);
    expect(result.rows.every((r) => r.earlierShare !== null && r.laterShare !== null)).toBe(true);
  });

  it("shows the name a company files under now", () => {
    const before: ShareRow[] = [{ name: "OLD NAME INC", cik: 42, revenue: 100, share: 1, basisUncertain: false }];
    const after: ShareRow[] = [{ name: "New Name Corp", cik: 42, revenue: 100, share: 1, basisUncertain: false }];
    expect(shareInstability(before, after, 5).rows[0].name).toBe("New Name Corp");
  });

  it("does not report a company as gone because it slipped a rank", () => {
    // Analog Devices filed in both 2019 and 2024. Truncating each period to its
    // own top ten dropped it from 2024's list at eleventh, and the surface said
    // "no longer filing" — a strong claim, and false.
    const m = (name: string, cik: number, revenue: number): IndustryMember => ({
      cik, name, revenue, revenueConcept: "Revenues", basisSpread: 1, periodEnd: "2024-12-31", accession: "x",
    });
    const of2019 = [m("Big", 1, 100e9), m("Analog Devices", 6281, 6e9), m("Riser", 3, 1e9)];
    const of2024 = [m("Big", 1, 100e9), m("Riser", 3, 9.5e9), m("Analog Devices", 6281, 9.4e9)];

    // Two leaders per period; ADI is second in 2019 and third in 2024.
    const picture = industryPicture(of2024, of2019, 5, 2);
    const adi = picture.instability!.rows.find((row) => row.name === "Analog Devices");

    expect(adi).toBeDefined();
    expect(adi!.earlierShare).not.toBeNull();
    expect(adi!.laterShare).not.toBeNull();
    expect(picture.instability!.rows.some((row) => row.name === OTHER_BUCKET)).toBe(false);
  });

  it("orders rows by how much each moved", () => {
    const before = [share("Steady", 0.5), share("Mover", 0.5)];
    const after = [share("Steady", 0.48), share("Mover", 0.52)];
    expect(shareInstability(before, after, 5).rows[0].absoluteChange).toBeCloseTo(0.02, 10);
  });
});

describe("concentration", () => {
  it("gives 10,000 for a monopoly and 1,000 for ten equal firms", () => {
    expect(herfindahl([share("Only", 1)])).toBeCloseTo(10_000, 6);
    const ten = Array.from({ length: 10 }, (_, i) => share(`Firm ${i}`, 0.1));
    expect(herfindahl(ten)).toBeCloseTo(1_000, 6);
  });

  it("rises with inequality at the same number of firms", () => {
    const even = [share("A", 0.25), share("B", 0.25), share("C", 0.25), share("D", 0.25)];
    const skewed = [share("A", 0.7), share("B", 0.1), share("C", 0.1), share("D", 0.1)];
    // Both have four firms and both have C4 of 100%. Only the HHI separates
    // them, which is the whole reason it squares the shares.
    expect(concentrationRatio(even)).toBeCloseTo(1, 10);
    expect(concentrationRatio(skewed)).toBeCloseTo(1, 10);
    expect(herfindahl(skewed)).toBeGreaterThan(herfindahl(even));
  });

  it("takes the top four in order of size", () => {
    const shares = [share("A", 0.4), share("B", 0.3), share("C", 0.2), share("D", 0.05), share("E", 0.05)];
    expect(concentrationRatio(shares, 4)).toBeCloseTo(0.95, 10);
    expect(concentrationRatio(shares, 2)).toBeCloseTo(0.7, 10);
  });
});

describe("building shares from filed revenue", () => {
  const member = (name: string, revenue: number, basisSpread = 1): IndustryMember => ({
    cik: name.length,
    name,
    revenue,
    revenueConcept: "Revenues",
    basisSpread,
    periodEnd: "2024-12-31",
    accession: "0000000000-25-000001",
  });

  it("divides by the industry total and orders by size", () => {
    // Union Pacific, CSX and Norfolk Southern, CY2024, rounded to $0.1B.
    const rail = [member("Union Pacific", 24.3e9), member("CSX", 14.5e9), member("Norfolk Southern", 12.1e9)];
    const shares = marketShares(rail);

    expect(shares.map((s) => s.name)).toEqual(["Union Pacific", "CSX", "Norfolk Southern"]);
    // 24.3 / 50.9 = 47.7%, computed by hand.
    expect(shares[0].share).toBeCloseTo(24.3 / 50.9, 6);
    expect(shares.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(1, 10);
  });

  it("flags a company whose revenue basis is doubtful", () => {
    // Measured: 1,083 of 5,086 filers report under more than one revenue
    // concept and 245 disagree by more than half again, because the
    // contract-revenue concepts capture a subset. Humana's is $4.43B against
    // $117.8B of total revenue.
    const shares = marketShares([member("Humana", 117.8e9, 27), member("Steady Co", 50e9, 1)]);
    expect(shares.find((s) => s.name === "Humana")?.basisUncertain).toBe(true);
    expect(shares.find((s) => s.name === "Steady Co")?.basisUncertain).toBe(false);
    expect(BASIS_UNCERTAIN).toBe(1.5);
  });

  it("drops a company whose competing figures cannot be adjudicated", () => {
    // Tigo Energy's own filing tags Revenues at $54.0M and contract revenue at
    // $54,014.0M — the same period, exactly a thousand times apart. Taking the
    // larger made it 10.4% of semiconductors, ahead of Intel.
    const shares = marketShares([
      member("NVIDIA", 130.5e9),
      member("Intel", 53.1e9),
      member("Tigo Energy", 54.0e9, 1000),
    ]);
    expect(shares.map((s) => s.name)).toEqual(["NVIDIA", "Intel"]);
    // Its revenue is out of the denominator too, not merely hidden from view.
    expect(shares[0].share).toBeCloseTo(130.5 / 183.6, 6);
  });

  it("drops it from both periods, so the exclusion invents no movement", () => {
    // Excluding Burlington Northern from 2024 while leaving it in 2019 read as
    // an exit and took the railroads from 1.6% to 10.5% instability — the
    // exclusion manufacturing the very mobility it exists to avoid distorting.
    const of2019 = [member("Union Pacific", 21.7e9), member("Burlington Northern", 23.5e9, 258)];
    const of2024 = [member("Union Pacific", 24.3e9), member("Burlington Northern", 23.4e9, 258)];

    const picture = industryPicture(of2024, of2019, 5);
    expect(picture.shares.map((s) => s.name)).toEqual(["Union Pacific"]);
    expect(picture.unresolvable.map((u) => u.name)).toEqual(["Burlington Northern"]);
    // One company left in both periods, holding 100% of what remains, so
    // nothing moved. Not a 100-point exit.
    expect(picture.instability!.average).toBeCloseTo(0, 10);
  });

  it("returns nothing rather than dividing by zero", () => {
    expect(marketShares([])).toEqual([]);
    expect(marketShares([member("Zero", 0)])).toEqual([]);
  });

  it("assembles the whole outside-in picture in one call", () => {
    const picture = industryPicture([member("Big", 60e9), member("Small", 40e9)]);
    expect(picture.hhi).toBeCloseTo(3600 + 1600, 6);
    expect(picture.c4).toBeCloseTo(1, 10);
    expect(picture.instability).toBeNull(); // no earlier period was given
    expect(picture.uncertainBasis).toEqual([]);
  });
});

describe("the profit pool", () => {
  it("makes economic profit the area of a band", () => {
    // Spread of 5 points on $100B of capital is $5B of economic profit.
    const { bands, totalEconomicProfit } = profitPool([
      { name: "Airports", roic: 0.04, wacc: 0.09, investedCapital: 100e9 },
      { name: "Fuel", roic: 0.15, wacc: 0.09, investedCapital: 20e9 },
    ]);

    expect(bands[0].name).toBe("Fuel"); // ordered by spread, highest first
    expect(bands[0].spread).toBeCloseTo(0.06, 10);
    expect(bands[0].economicProfit).toBeCloseTo(1.2e9, 2);
    expect(bands[1].economicProfit).toBeCloseTo(-5e9, 2);
    // The paper's aviation pool is negative overall for exactly this shape:
    // most of the capital sits where the spread is negative.
    expect(totalEconomicProfit).toBeCloseTo(-3.8e9, 2);
  });

  it("gives each band a width that is its share of the capital", () => {
    const { bands, totalInvestedCapital } = profitPool([
      { name: "Heavy", roic: 0.13, wacc: 0.08, investedCapital: 75e9 },
      { name: "Light", roic: 0.2, wacc: 0.08, investedCapital: 25e9 },
    ]);
    expect(totalInvestedCapital).toBeCloseTo(100e9, 2);
    expect(bands.find((b) => b.name === "Heavy")?.capitalShare).toBeCloseTo(0.75, 10);

    // Light has the better spread, 12 points against 5, and is listed first.
    expect(bands[0].name).toBe("Light");
    // But Heavy makes more money: 0.05 × $75B = $3.75B against 0.12 × $25B =
    // $3.0B. The best percentage return is not where the most profit sits, and
    // drawing the pool by area is what makes that visible.
    expect(bands.find((b) => b.name === "Heavy")!.economicProfit).toBeCloseTo(3.75e9, 2);
    expect(bands.find((b) => b.name === "Light")!.economicProfit).toBeCloseTo(3e9, 2);
    expect(bands.find((b) => b.name === "Heavy")!.economicProfit).toBeGreaterThan(
      bands.find((b) => b.name === "Light")!.economicProfit,
    );
  });

  it("handles an empty pool without dividing by zero", () => {
    const { bands, totalEconomicProfit, totalInvestedCapital } = profitPool([]);
    expect(bands).toEqual([]);
    expect(totalEconomicProfit).toBe(0);
    expect(totalInvestedCapital).toBe(0);
  });
});
