import { describe, expect, it } from "vitest";
import { read, type Entries } from "./investigate";
import { measuresFrom, PEER_MEASURES } from "./peer-measures";
import { hasValue, type Observation } from "./screen";

/**
 * The four peer measures, against figures worked by hand, and against
 * Investigate's own reading of the same company so the two cannot drift apart.
 */

/** Round figures chosen so every measure can be checked in one's head. */
const COMPANY: Entries = {
  revenue: 1000,
  operatingProfit: 200,
  pretaxProfit: 160,
  taxExpense: 40,
  totalDebt: 500,
  equity: 700,
  cash: 200,
};

const valueOf = (measures: Record<string, Observation>, id: string) => {
  const observation = measures[id];
  return observation && hasValue(observation) ? observation.value : null;
};
const reasonOf = (measures: Record<string, Observation>, id: string) => {
  const observation = measures[id];
  return observation && !hasValue(observation) ? observation.missing : null;
};

describe("the four measures", () => {
  it("works them out from the seven figures", () => {
    // Tax rate 40 ÷ 160 = 25%, so after-tax operating profit is 150.
    // Invested capital is 500 + 700 − 200 = 1,000.
    const measures = measuresFrom(COMPANY, "general");
    expect(valueOf(measures, "roic")).toBeCloseTo(0.15, 12);
    expect(valueOf(measures, "margin")).toBeCloseTo(0.15, 12);
    expect(valueOf(measures, "turnover")).toBeCloseTo(1, 12);
    expect(valueOf(measures, "borrowings")).toBeCloseTo(500 / 700, 12);
  });

  it("gives the same return Investigate gives the learner for their own company", () => {
    const reading = read(COMPANY, "general", 0.08);
    if ("blocked" in reading) throw new Error(reading.blocked);
    const measures = measuresFrom(COMPANY, "general");
    expect(valueOf(measures, "roic")).toBe(reading.decomposition.roic);
    expect(valueOf(measures, "margin")).toBe(reading.decomposition.nopatMargin);
    expect(valueOf(measures, "turnover")).toBe(reading.decomposition.capitalTurnover);
  });

  it("charges no tax on a loss-making year, as Investigate does", () => {
    const loss: Entries = { ...COMPANY, operatingProfit: -50, pretaxProfit: -90, taxExpense: -20 };
    const measures = measuresFrom(loss, "general");
    // A tax credit is not operating performance: the rate is held at zero, so NOPAT is the −50 itself.
    expect(valueOf(measures, "roic")).toBeCloseTo(-0.05, 12);
    expect(valueOf(measures, "margin")).toBeCloseTo(-0.05, 12);
    const reading = read(loss, "general", 0.08);
    if ("blocked" in reading) throw new Error(reading.blocked);
    expect(valueOf(measures, "roic")).toBe(reading.decomposition.roic);
  });

  it("names the figure it was waiting on rather than returning nothing", () => {
    const { cash, equity, ...rest } = COMPANY;
    void cash;
    void equity;
    const measures = measuresFrom(rest, "general");
    expect(reasonOf(measures, "roic")).toBe("Studio could not read its shareholders' equity and cash for that year");
    expect(reasonOf(measures, "borrowings")).toBe("Studio could not read its shareholders' equity for that year");
  });

  it("measures the bottom line against sales, and refuses it where there is no bottom line to read", () => {
    // Every one of ten large companies tags this, where three of them tag no operating profit
    // and three no borrowings (measured 2026-09-15), so it is what keeps such a company in the list.
    expect(valueOf(measuresFrom(COMPANY, "general", 120), "netMargin")).toBeCloseTo(0.12, 12);
    expect(reasonOf(measuresFrom(COMPANY, "general"), "netMargin")).toContain("after everything");
    expect(reasonOf(measuresFrom({ ...COMPANY, revenue: 0 }, "general", 120), "netMargin")).toContain("not positive");
  });

  it("refuses the ratio rather than dividing by a negative or absent stake", () => {
    const measures = measuresFrom({ ...COMPANY, equity: -100, totalDebt: 900 }, "general");
    expect(reasonOf(measures, "borrowings")).toContain("equity is not positive");
    // Debt still exceeds the negative equity and the cash, so the return itself is defined.
    expect(valueOf(measures, "roic")).toBeCloseTo(150 / 600, 12);
  });

  it("declines the return measures for a bank, and says why, while the plain ratio stands", () => {
    const measures = measuresFrom(COMPANY, "banking");
    for (const id of ["roic", "margin"]) expect(reasonOf(measures, id)).toContain("not a meaningful measure for a bank");
    expect(reasonOf(measures, "turnover")).toContain("does not mean the same thing for this kind of company");
    expect(valueOf(measures, "borrowings")).toBeCloseTo(500 / 700, 12);
  });

  it("still measures how hard capital works where no operating profit is tagged", () => {
    // Eaton, Nucor and Deere tag no operating profit Studio will read (measured 2026-09-15),
    // and turnover needs no profit figure at all, so it must not wait on one.
    const { operatingProfit, ...noOperatingProfit } = COMPANY;
    void operatingProfit;
    const measures = measuresFrom(noOperatingProfit, "general", 120);
    expect(valueOf(measures, "turnover")).toBeCloseTo(1, 12);
    expect(valueOf(measures, "netMargin")).toBeCloseTo(0.12, 12);
    expect(reasonOf(measures, "roic")).toContain("operating profit");
  });

  it("refuses a company whose cash is larger than its capital, rather than flipping the sign", () => {
    const measures = measuresFrom({ ...COMPANY, cash: 1400 }, "general");
    expect(reasonOf(measures, "roic")).toContain("invested capital is not positive");
    expect(reasonOf(measures, "turnover")).toContain("invested capital is not positive");
  });
});

describe("what the surface is told about each measure", () => {
  it("carries one direction that runs the other way, and says the direction is a choice", () => {
    expect(PEER_MEASURES.map((measure) => measure.direction)).toEqual(["higher", "higher", "higher", "higher", "lower"]);
    const borrowings = PEER_MEASURES.find((measure) => measure.id === "borrowings")!;
    expect(borrowings.what).toContain("choice");
  });

  it("has a label and a plain description for every measure it computes", () => {
    const measures = measuresFrom(COMPANY, "general");
    expect(PEER_MEASURES.map((measure) => measure.id).sort()).toEqual(Object.keys(measures).sort());
    for (const measure of PEER_MEASURES) {
      expect(measure.label.length).toBeGreaterThan(3);
      expect(measure.what.length).toBeGreaterThan(40);
    }
  });
});
