import { describe, expect, it } from "vitest";
import {
  decomposeRoic,
  economicProfit,
  investedCapital,
  isComputed,
  nopat,
  readAdvantage,
  ROIC_EXCLUDED_SECTORS,
  type RoicDecomposition,
  type RoicInputs,
  type RoicSector,
} from "./roic";
import type { Sector } from "./metrics";

/**
 * The decomposition is checked against an example the paper works through in
 * prose, which is an answer arrived at independently of this code: a supplier
 * on a 10% NOPAT margin with 1.5x invested capital turnover earns a 15% ROIC,
 * and after better information lifts turnover to 2.0x it can cut price to a
 * 7.5% margin and still earn 15%.
 *
 * That example is also the whole point of splitting ROIC in two. The same
 * return arrives by two different routes, and only the split tells them apart.
 */

const inputs = (over: Partial<RoicInputs> = {}): RoicInputs => ({
  operatingIncome: 1_000,
  effectiveTaxRate: 0.25,
  revenue: 10_000,
  totalDebt: 2_000,
  equity: 4_000,
  cash: 1_000,
  ...over,
});

const decomposition = (nopatMargin: number, capitalTurnover: number): RoicDecomposition => ({
  nopat: nopatMargin * 1_000,
  investedCapital: 1_000 / capitalTurnover,
  roic: nopatMargin * capitalTurnover,
  nopatMargin,
  capitalTurnover,
});

describe("the pieces", () => {
  it("taxes operating profit at the company's own rate", () => {
    // 1,000 × (1 − 0.25) = 750, by hand.
    expect(nopat(1_000, 0.25)).toBe(750);
    expect(nopat(1_000, 0)).toBe(1_000);
  });

  it("does not let a tax credit flatter operating performance", () => {
    // Pfizer's effective rate came out at −3.5% and NextEra's at −17.7%, both
    // real. Applying them literally would make NOPAT exceed operating profit,
    // which is a statement about tax, not about the business.
    expect(nopat(1_000, -0.177)).toBe(1_000);
    expect(nopat(1_000, -0.035)).toBe(1_000);
  });

  it("adds what lenders and shareholders put in, less the cash sitting idle", () => {
    // 2,000 + 4,000 − 1,000 = 5,000, by hand.
    expect(investedCapital({ totalDebt: 2_000, equity: 4_000, cash: 1_000 })).toBe(5_000);
  });
});

describe("the decomposition, against the paper's worked example", () => {
  it("gives 15% from a 10% margin and 1.5x turnover", () => {
    // Revenue 10,000 with a 10% NOPAT margin is 1,000 of NOPAT; 1.5x turnover
    // on that revenue means 6,666.67 of capital. NOPAT ÷ capital is 15%.
    const result = decomposeRoic(inputs({ operatingIncome: 1_000 / 0.75, revenue: 10_000, totalDebt: 6_666.6667, equity: 0, cash: 0 }));
    expect(isComputed(result)).toBe(true);
    if (!isComputed(result)) return;

    expect(result.nopatMargin).toBeCloseTo(0.1, 10);
    expect(result.capitalTurnover).toBeCloseTo(1.5, 6);
    expect(result.roic).toBeCloseTo(0.15, 6);
  });

  it("gives the same 15% from a 7.5% margin and 2.0x turnover", () => {
    // The paper's second case: the supplier cuts price, margin falls to 7.5%,
    // turnover rises to 2.0x, and the return is unchanged.
    const result = decomposeRoic(inputs({ operatingIncome: 750 / 0.75, revenue: 10_000, totalDebt: 5_000, equity: 0, cash: 0 }));
    if (!isComputed(result)) throw new Error("expected a value");

    expect(result.nopatMargin).toBeCloseTo(0.075, 10);
    expect(result.capitalTurnover).toBeCloseTo(2.0, 10);
    expect(result.roic).toBeCloseTo(0.15, 10);
  });

  it("holds the identity the paper relies on: the sales cancel", () => {
    // Deliberately awkward numbers, so agreement is arithmetic rather than luck.
    const result = decomposeRoic(inputs({ operatingIncome: 3_137, effectiveTaxRate: 0.213, revenue: 27_411, totalDebt: 8_123, equity: 19_887, cash: 4_002 }));
    if (!isComputed(result)) throw new Error("expected a value");

    expect(result.nopatMargin * result.capitalTurnover).toBeCloseTo(result.roic, 12);
    expect(result.nopat / result.investedCapital).toBeCloseTo(result.roic, 12);
  });

  it("declines when there is more cash than capital", () => {
    // A real shape for a cash-rich company. The ratio would flip sign for a
    // reason that says nothing about how the business performs.
    const result = decomposeRoic(inputs({ totalDebt: 500, equity: 1_000, cash: 2_000 }));
    expect(isComputed(result)).toBe(false);
    if (isComputed(result)) return;
    expect(result.reason).toContain("not positive");
  });

  it("declines without revenue, which the split needs", () => {
    const result = decomposeRoic(inputs({ revenue: 0 }));
    expect(isComputed(result)).toBe(false);
  });

  it("carries a loss through as a negative return rather than hiding it", () => {
    // Atkore's latest year is a loss. A negative ROIC is the answer, not an error.
    const result = decomposeRoic(inputs({ operatingIncome: -400, effectiveTaxRate: 0.25 }));
    if (!isComputed(result)) throw new Error("expected a value");
    expect(result.nopat).toBe(-300);
    expect(result.roic).toBeLessThan(0);
  });
});

describe("reading which advantage a company has", () => {
  // A peer group whose margins and turnovers both run from low to high.
  const peers = [
    decomposition(0.04, 0.6),
    decomposition(0.06, 0.9),
    decomposition(0.08, 1.2),
    decomposition(0.1, 1.6),
    decomposition(0.12, 2.0),
    decomposition(0.15, 2.6),
  ];

  it("calls a high margin on ordinary turnover differentiation", () => {
    // The paper's bottom right: it charges more, and does not turn its capital
    // unusually fast.
    const read = readAdvantage(decomposition(0.3, 0.8), peers);
    expect("advantage" in read).toBe(true);
    if (!("advantage" in read)) return;
    expect(read.advantage).toBe("differentiation");
    expect(read.marginPercentile).toBe(1);
  });

  it("calls an ordinary margin on high turnover cost leadership", () => {
    // The paper's top left: thin margins, but the capital works hard. Costco's
    // measured gross margin of 12.8% is the shape of this.
    const read = readAdvantage(decomposition(0.05, 4.0), peers);
    if (!("advantage" in read)) throw new Error("expected a read");
    expect(read.advantage).toBe("cost leadership");
    expect(read.turnoverPercentile).toBe(1);
  });

  it("calls out a company strong on both", () => {
    const read = readAdvantage(decomposition(0.3, 4.0), peers);
    if (!("advantage" in read)) throw new Error("expected a read");
    expect(read.advantage).toBe("both");
  });

  it("says neither rather than forcing a company into a box", () => {
    // A 12.6% return, earned without standing out on either axis: margin and
    // turnover both sit at the peer median. There is no story to tell here.
    const read = readAdvantage(decomposition(0.09, 1.4), peers);
    if (!("advantage" in read)) throw new Error("expected a read");
    expect(read.advantage).toBe("neither");
    expect(read.marginPercentile).toBeLessThan(0.6);
    expect(read.turnoverPercentile).toBeLessThan(0.6);
  });

  it("shows the peer medians, so the comparison can be checked", () => {
    const read = readAdvantage(decomposition(0.3, 0.8), peers);
    if (!("advantage" in read)) throw new Error("expected a read");
    // Six peers, so the median is between the third and fourth: (0.08+0.1)/2.
    expect(read.medianMargin).toBeCloseTo(0.09, 10);
    expect(read.medianTurnover).toBeCloseTo(1.4, 10);
    expect(read.peerCount).toBe(6);
  });

  it("will not describe a poor return as a strategy", () => {
    // Atkore, in a loss year, came out as cost leadership on a 0.6% margin
    // because its capital happened to turn over quickly. The paper describes
    // these as the routes to an *attractive* return.
    const read = readAdvantage(decomposition(0.006, 1.73), peers);
    expect("advantage" in read).toBe(false);
    if ("advantage" in read) return;
    expect(read.reason).toContain("attractive return");
  });

  it("refuses to call high or low against too few peers", () => {
    // With four companies the medians are an artefact of who is in the list.
    const read = readAdvantage(decomposition(0.3, 0.8), peers.slice(0, 4));
    expect("advantage" in read).toBe(false);
    if ("advantage" in read) return;
    expect(read.reason).toContain("at least 5");
  });
});

describe("sectors the papers exclude", () => {
  it.each(["banking", "insurance", "real-estate"] as const)("declines for %s, as both papers do", (sector) => {
    // Prologis computes to a 46.9% NOPAT margin on 0.10x turnover, which reads
    // as textbook differentiation and is really an artefact: a property
    // company's capital is buildings at depreciated cost.
    const result = decomposeRoic(inputs({ sector }));
    expect(isComputed(result)).toBe(false);
    if (isComputed(result)) return;
    expect(result.reason).toContain("not a meaningful measure");
  });

  it("computes for the sectors they keep", () => {
    for (const sector of ["general", "utility", "transport", "extractive"] as const) {
      expect(isComputed(decomposeRoic(inputs({ sector })))).toBe(true);
    }
  });

  it("still computes when no sector is given", () => {
    expect(isComputed(decomposeRoic(inputs()))).toBe(true);
  });

  it("keeps its sector list in step with the metric layer", () => {
    // roic.ts restates the union rather than importing it, so that Node's type
    // stripper can load it straight from a script. This is the guard.
    const fromMetrics: Sector = "general";
    const asRoic: RoicSector = fromMetrics;
    const back: Sector = asRoic;
    expect(back).toBe("general");
    expect([...ROIC_EXCLUDED_SECTORS].sort()).toEqual(["banking", "insurance", "real-estate"]);
  });
});

describe("economic profit", () => {
  it("is the spread over the cost of capital, times the capital", () => {
    // The helper is built on revenue of 1,000, so 1.5x turnover is 666.67 of
    // capital and a 10% margin is 100 of NOPAT: a 15% return.
    const company = decomposition(0.1, 1.5);
    const { spread, economicProfit: profit } = economicProfit(company, 0.08);

    expect(company.investedCapital).toBeCloseTo(666.667, 2);
    expect(spread).toBeCloseTo(0.07, 10);
    // 0.07 × 666.67 = 46.67, by hand.
    expect(profit).toBeCloseTo(46.667, 2);
  });

  it("goes negative where the return does not cover the capital", () => {
    // The paper's aviation pool is negative overall for exactly this reason.
    const company = decomposition(0.02, 0.5); // 1% ROIC
    expect(economicProfit(company, 0.08).economicProfit).toBeLessThan(0);
  });
});
