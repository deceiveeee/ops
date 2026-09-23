import { describe, expect, it } from "vitest";
import industriesData from "./data/industries.json";
import { industryForSic } from "./cost-of-capital";
import { costOfCapitalFor } from "./investigate-read";
import {
  CURRENCY_RATIO_LIMIT,
  POOLS,
  SHARE_JUMP_LIMIT,
  exampleBlock,
  poolCost,
  poolFor,
  whyLeftOut,
  type PoolIndustry,
} from "./profit-pool";

/*
 * The expected figures below were worked out separately, in Python, straight
 * from industries.json, cost-of-capital.json and treasury-rate.json: the cost of
 * equity rebuilt as rate + beta × premium, weighted with the after-tax cost of
 * debt, and each company's (ROIC − that) × invested capital summed by hand. They
 * share no code with profit-pool.ts, so agreement is evidence rather than a
 * tautology.
 */

const industry = (sic: string) =>
  (industriesData.industries as unknown as PoolIndustry[]).find((entry) => entry.sic === sic)!;
const pool = (sic: string) => POOLS.get(sic)!;
const names = (sic: string) => pool(sic).blocks.map((block) => block.name);
const leftOutAs = (sic: string, reason: string) =>
  pool(sic).leftOut.filter((entry) => entry.reason === reason).map((entry) => entry.name);

describe("the arithmetic, on a pool small enough to check by eye", () => {
  const tiny: PoolIndustry = {
    sic: "0000",
    label: "Two companies",
    totalRevenue: 100,
    leaders: [
      { name: "Wide", cik: 1, revenue: 60, share: 0.6 },
      { name: "Narrow", cik: 2, revenue: 40, share: 0.4 },
    ],
    roic: [
      // NOPAT margin 10% on revenue 60: NOPAT 6, invested capital 75, return 8%.
      { name: "Wide", cik: 1, period: "2025-12-31", roic: 0.08, nopat: 6, nopatMargin: 0.1, investedCapital: 75 },
      // NOPAT margin 20% on revenue 40: NOPAT 8, invested capital 25, return 32%.
      { name: "Narrow", cik: 2, period: "2025-06-30", roic: 0.32, nopat: 8, nopatMargin: 0.2, investedCapital: 25 },
    ],
  };
  const cost = { ...poolCost("4011")!, costOfCapital: 0.1 };
  const built = poolFor(tiny, cost);

  it("makes each block's area its economic profit", () => {
    // Wide: (8% − 10%) × 75 = −1.5. Narrow: (32% − 10%) × 25 = 5.5.
    const wide = built.blocks.find((block) => block.name === "Wide")!;
    const narrow = built.blocks.find((block) => block.name === "Narrow")!;
    expect(wide.spread).toBeCloseTo(-0.02, 12);
    expect(wide.economicProfit).toBeCloseTo(-1.5, 12);
    expect(narrow.economicProfit).toBeCloseTo(5.5, 12);
    expect(built.totalEconomicProfit).toBeCloseTo(4, 12);
    // Height times width, where width is the share of the capital: the area is
    // the economic profit as a share of all the capital in the pool.
    expect(narrow.spread * narrow.capitalShare * built.totalInvestedCapital).toBeCloseTo(narrow.economicProfit, 12);
  });

  it("draws the tallest first and gives the widths in shares of the capital", () => {
    expect(built.blocks.map((block) => block.name)).toEqual(["Narrow", "Wide"]);
    expect(built.blocks.map((block) => block.capitalShare)).toEqual([0.25, 0.75]);
  });

  it("covers the revenue its drawn companies make, and says which years", () => {
    expect(built.revenueCovered).toBeCloseTo(1, 12);
    expect(built.periods).toEqual({ from: "2025-06-30", to: "2025-12-31" });
  });

  it("chooses the widest block that creates value to explain first", () => {
    expect(exampleBlock(built)?.name).toBe("Narrow");
    const allLosing = poolFor(tiny, { ...cost, costOfCapital: 0.5 });
    // Nothing covers a 50% cost of capital, so the widest block is the example.
    expect(exampleBlock(allLosing)?.name).toBe("Wide");
  });
});

describe("the cost of capital", () => {
  it("is the one Investigate uses by default, so a company reads the same on both", () => {
    for (const entry of industriesData.industries) {
      const industryName = industryForSic(entry.sic)!;
      expect(poolCost(entry.sic)!.costOfCapital).toBeCloseTo(costOfCapitalFor(industryName, null), 12);
      expect(poolCost(entry.sic)!.rateSource).toBe("treasury");
    }
  });

  it("is rebuilt on the Treasury's rate, and matches the figure worked out separately", () => {
    expect(pool("3674").cost.costOfCapital).toBeCloseTo(0.114055, 5);
    expect(pool("4011").cost.costOfCapital).toBeCloseTo(0.079674, 5);
    expect(pool("5331").cost.costOfCapital).toBeCloseTo(0.080973, 5);
    expect(pool("2834").cost.costOfCapital).toBeCloseTo(0.086007, 5);
    expect(pool("7372").cost.costOfCapital).toBeCloseTo(0.10184, 5);
  });

  it("is the same for every company in an industry, which the surface has to say", () => {
    for (const built of POOLS.values()) {
      for (const block of built.blocks) expect(block.wacc).toBe(built.cost.costOfCapital);
    }
  });
});

describe("the five researched industries, against the separate calculation", () => {
  it("builds a pool for every one of them", () => {
    expect([...POOLS.keys()].sort()).toEqual(["2834", "3674", "4011", "5331", "7372"]);
  });

  it("totals each industry's economic profit", () => {
    expect(pool("3674").totalEconomicProfit / 1e9).toBeCloseTo(90.039, 2);
    expect(pool("4011").totalEconomicProfit / 1e9).toBeCloseTo(5.77, 2);
    expect(pool("5331").totalEconomicProfit / 1e9).toBeCloseTo(22.078, 2);
    expect(pool("2834").totalEconomicProfit / 1e9).toBeCloseTo(2.149, 2);
    expect(pool("7372").totalEconomicProfit / 1e9).toBeCloseTo(87.057, 2);
  });

  it("totals the capital each is drawn on", () => {
    expect(pool("3674").totalInvestedCapital / 1e9).toBeCloseTo(635.38, 1);
    expect(pool("4011").totalInvestedCapital / 1e9).toBeCloseTo(110.17, 1);
    expect(pool("7372").totalInvestedCapital / 1e9).toBeCloseTo(753.35, 1);
  });

  it("works Union Pacific through by hand", () => {
    // 15.64% return, 7.97% cost of capital, $49.02B invested: $3.762B.
    const union = pool("4011").blocks.find((block) => block.name === "UNION PACIFIC CORP")!;
    expect(union.spread * 100).toBeCloseTo(7.676, 2);
    expect(union.economicProfit / 1e9).toBeCloseTo(3.762, 2);
    expect(union.capitalShare * 100).toBeCloseTo(44.49, 1);
  });

  it("puts Intel's loss on the largest capital base below the line", () => {
    // Intel earned nothing on $146.6B against an 11.4% cost of capital: the
    // single largest negative area in the semiconductor pool.
    const intel = pool("3674").blocks.find((block) => block.name === "INTEL CORPORATION")!;
    expect(intel.economicProfit / 1e9).toBeCloseTo(-16.757, 2);
    expect(Math.min(...pool("3674").blocks.map((block) => block.economicProfit))).toBe(intel.economicProfit);
  });

  it("orders the railroads as the separate calculation does", () => {
    expect(names("4011")).toEqual(["UNION PACIFIC CORP", "CSX CORPORATION", "NORFOLK SOUTHERN CORPORATION"]);
  });

  it("says how much of each industry it covers", () => {
    expect(pool("3674").revenueCovered * 100).toBeCloseTo(76.5, 0);
    expect(pool("5331").revenueCovered * 100).toBeCloseTo(100, 0);
    // The drug makers' pool is missing its five largest and must not pass for
    // the industry's: it covers about a fifth of the revenue.
    expect(pool("2834").revenueCovered).toBeLessThan(0.25);
    expect(pool("7372").revenueCovered * 100).toBeCloseTo(69.2, 0);
  });

  it("picks the widest value-creating company as each industry's worked example", () => {
    expect(exampleBlock(pool("3674"))?.name).toBe("NVIDIA CORP");
    expect(exampleBlock(pool("4011"))?.name).toBe("UNION PACIFIC CORP");
    expect(exampleBlock(pool("5331"))?.name).toBe("Walmart Inc.");
    expect(exampleBlock(pool("2834"))?.name).toBe("AbbVie Inc.");
    expect(exampleBlock(pool("7372"))?.name).toBe("MICROSOFT CORPORATION");
  });
});

describe("who is left out, and why", () => {
  it("leaves out the two companies whose figures are in yuan, and no others", () => {
    expect(leftOutAs("7372", "not-dollars")).toEqual(["NETEASE, INC."]);
    expect(leftOutAs("3674", "not-dollars")).toEqual(["JinkoSolar Holding Co., Ltd."]);
    for (const sic of ["4011", "5331", "2834"]) expect(leftOutAs(sic, "not-dollars")).toEqual([]);
    const netease = pool("7372").leftOut.find((entry) => entry.reason === "not-dollars")!;
    expect(netease.says).toContain("7.8 times");
  });

  it("leaves out Universe Pharmaceuticals' figure, the one the share check exists for", () => {
    expect(leftOutAs("2834", "doubtful-figure")).toEqual(["Universe Pharmaceuticals INC"]);
    const universe = pool("2834").leftOut.find((entry) => entry.reason === "doubtful-figure")!;
    expect(universe.says).toContain("0.008%");
    expect(universe.says).toContain("3.9%");
    for (const sic of ["3674", "4011", "5331", "7372"]) expect(leftOutAs(sic, "doubtful-figure")).toEqual([]);
  });

  it("names the drug makers whose filings give no return to draw", () => {
    expect(leftOutAs("2834", "no-return").sort()).toEqual(
      ["BRISTOL-MYERS SQUIBB COMPANY", "ELI LILLY AND COMPANY", "Johnson & Johnson", "Merck & Co., Inc.", "PFIZER INC"].sort(),
    );
  });

  it("names a company the industry figures never counted, so a coverage near 100% is not misread", () => {
    expect(leftOutAs("4011", "not-counted")).toEqual(["BURLINGTON NORTHERN SANTA FE, LLC"]);
  });

  it("accounts for every leading company once: drawn or named", () => {
    for (const [sic, built] of POOLS) {
      const earners = industry(sic).roic.map((earner) => earner.name).sort();
      const accounted = [
        ...built.blocks.map((block) => block.name),
        ...built.leftOut.filter((entry) => entry.reason !== "not-counted").map((entry) => entry.name),
      ].sort();
      expect(accounted).toEqual(earners);
    }
  });

  it("keeps every drawn company's figures within the currency check's bounds", () => {
    for (const [sic, built] of POOLS) {
      const leaders = new Map(industry(sic).leaders.map((leader) => [leader.cik, leader]));
      const earners = new Map(industry(sic).roic.map((earner) => [earner.cik, earner]));
      for (const block of built.blocks) {
        const earner = earners.get(block.cik)!;
        const ratio = earner.nopat! / earner.nopatMargin! / leaders.get(block.cik)!.revenue;
        // 0.89 to 1.65 across all five industries: growth between the two
        // years, not a currency.
        expect(ratio).toBeGreaterThan(0.85);
        expect(ratio).toBeLessThan(1.7);
      }
    }
  });
});

describe("the checks on one company", () => {
  const leader = { name: "Co", cik: 9, revenue: 100, share: 0.1 };
  const earner = (revenueBehind: number) => ({
    name: "Co",
    cik: 9,
    roic: 0.1,
    nopat: revenueBehind * 0.1,
    nopatMargin: 0.1,
    investedCapital: 50,
  });

  it("takes figures several times the dollar revenue, either way, to be another currency", () => {
    expect(whyLeftOut(earner(100 * (CURRENCY_RATIO_LIMIT + 0.5)), leader, undefined)?.reason).toBe("not-dollars");
    expect(whyLeftOut(earner(100 / (CURRENCY_RATIO_LIMIT + 0.5)), leader, undefined)?.reason).toBe("not-dollars");
    // Doubling in a year is growth, and is drawn.
    expect(whyLeftOut(earner(200), leader, undefined)).toBeNull();
  });

  it("holds back a share that rose past the limit, and not a company that is new", () => {
    const risen = { earlierShare: 0.0001, laterShare: 0.0001 * (SHARE_JUMP_LIMIT + 1) };
    expect(whyLeftOut(earner(100), leader, risen)?.reason).toBe("doubtful-figure");
    // A company not filing in the earlier year has no earlier share to jump from.
    expect(whyLeftOut(earner(100), leader, { earlierShare: null, laterShare: 0.05 })).toBeNull();
    expect(whyLeftOut(earner(100), leader, { earlierShare: 0.01, laterShare: 0.05 })).toBeNull();
  });

  it("refuses a width for capital that is not there", () => {
    expect(whyLeftOut({ ...earner(100), investedCapital: -5 }, leader, undefined)?.reason).toBe("no-capital");
    expect(whyLeftOut({ ...earner(100), investedCapital: 0 }, leader, undefined)?.reason).toBe("no-capital");
  });

  it("gives the pipeline's reason when there is no return", () => {
    const none = whyLeftOut({ name: "Co", cik: 9, reason: "needs operating profit" }, leader, undefined)!;
    expect(none.reason).toBe("no-return");
    expect(none.says).toContain("operating profit");
  });
});
