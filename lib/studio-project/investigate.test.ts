import { describe, expect, it } from "vitest";
import { checkEntries, FIGURES, read, type Entries, type PeerContext } from "./investigate";
import type { RoicDecomposition } from "./roic";

/**
 * These checks exist to catch a person, not a parser. Someone reading a general
 * finance site has no concept name to inspect — just a number under a heading
 * that looks right — so they hit the same traps the XBRL layer hits, harder.
 *
 * The hardest requirement is not catching the wrong numbers. It is leaving the
 * surprising-but-real ones alone: Costco genuinely turns its capital 13.29
 * times, measured from its own filing, and a validator that calls that an error
 * teaches the learner to distrust the tool instead of the number.
 */

const sound: Entries = {
  revenue: 10_000,
  operatingProfit: 2_000,
  pretaxProfit: 1_800,
  taxExpense: 400,
  totalDebt: 3_000,
  equity: 6_000,
  cash: 1_000,
};

const decomposition = (nopatMargin: number, capitalTurnover: number): RoicDecomposition => ({
  nopat: nopatMargin * 1_000,
  investedCapital: 1_000 / capitalTurnover,
  roic: nopatMargin * capitalTurnover,
  nopatMargin,
  capitalTurnover,
});

const peers = (industry = "semiconductors"): PeerContext => ({
  industry,
  medianMargin: 0.1,
  medianTurnover: 1.2,
  peers: [
    decomposition(0.05, 0.8), decomposition(0.08, 1.0), decomposition(0.1, 1.2),
    decomposition(0.14, 1.4), decomposition(0.2, 1.8), decomposition(0.3, 2.4),
  ],
});

describe("the seven figures", () => {
  it("asks for exactly what a return on capital needs, and no more", () => {
    // Seven is the design. A five-year history would be 35 entries and nobody
    // types that; the learner brings one company, Studio brings the peers.
    expect(FIGURES).toHaveLength(7);
    expect(FIGURES.map((f) => f.key)).toEqual([
      "revenue", "operatingProfit", "pretaxProfit", "taxExpense", "totalDebt", "equity", "cash",
    ]);
  });

  it("says where each one lives, and what other sites call it", () => {
    for (const figure of FIGURES) {
      expect(figure.whatItIs.length).toBeGreaterThan(20);
      expect(["income statement", "balance sheet"]).toContain(figure.statement);
      expect(figure.alsoCalled.length).toBeGreaterThan(0);
    }
  });
});

describe("catching what cannot be true", () => {
  it("stops when profit exceeds the sales it came from", () => {
    const checks = checkEntries({ ...sound, operatingProfit: 12_000 }, "general");
    const stop = checks.find((c) => c.severity === "stop");
    expect(stop).toBeDefined();
    expect(stop!.message).toContain("larger than revenue");
    expect(stop!.figures).toContain("operatingProfit");
  });

  it("stops when cash swallows the whole capital base", () => {
    // A real shape when someone reads cash in thousands and the rest in millions.
    const checks = checkEntries({ ...sound, cash: 20_000 }, "general");
    const stop = checks.find((c) => c.severity === "stop");
    expect(stop).toBeDefined();
    expect(stop!.message).toContain("different unit");
  });

  it("stops on negative revenue, which usually means a bracketed figure", () => {
    const checks = checkEntries({ ...sound, revenue: -500 }, "general");
    expect(checks.some((c) => c.severity === "stop" && c.figures.includes("revenue"))).toBe(true);
  });
});

describe("sectors where the measure does not apply", () => {
  it.each([
    ["banking", "raw material"],
    ["insurance", "float"],
    ["real-estate", "what was paid for them"],
  ] as const)("stops for %s and explains why rather than just refusing", (sector, phrase) => {
    const checks = checkEntries(sound, sector);
    const stop = checks.find((c) => c.severity === "stop");
    expect(stop).toBeDefined();
    expect(stop!.message).toContain(phrase);
  });

  it("tells a bank what to use instead", () => {
    const checks = checkEntries(sound, "banking");
    expect(checks[0].message).toContain("return on equity");
  });

  it("leaves ordinary companies alone", () => {
    for (const sector of ["general", "utility", "transport", "extractive"] as const) {
      expect(checkEntries(sound, sector).some((c) => c.severity === "stop")).toBe(false);
    }
  });
});

describe("questioning without blocking", () => {
  it("does not flag Costco's real capital turnover", () => {
    // Measured from Costco's own filing: 13.29x, on a 2.8% margin, for a 37.5%
    // return. The most extreme real reading in our data, and it must pass.
    const costcoish: Entries = { revenue: 275_000, operatingProfit: 9_500, pretaxProfit: 9_600, taxExpense: 2_400, totalDebt: 5_800, equity: 25_000, cash: 10_100 };
    const checks = checkEntries(costcoish, "general");
    expect(checks.filter((c) => c.severity === "stop")).toHaveLength(0);
    expect(checks.some((c) => c.message.includes("times the capital"))).toBe(false);
  });

  it("does question a turnover no real company reaches", () => {
    const checks = checkEntries({ ...sound, revenue: 400_000 }, "general");
    const q = checks.find((c) => c.message.includes("times the capital"));
    expect(q).toBeDefined();
    expect(q!.severity).toBe("question");
    // It cites the real ceiling rather than asserting a limit.
    expect(q!.message).toContain("Costco");
  });

  it("questions a tax rate that is probably a one-off", () => {
    const checks = checkEntries({ ...sound, taxExpense: 1_400 }, "general");
    expect(checks.some((c) => c.severity === "question" && c.figures.includes("taxExpense"))).toBe(true);
  });

  it("treats negative equity as real but worth care", () => {
    // Years of buybacks produce it. Not an error.
    const checks = checkEntries({ ...sound, equity: -500, totalDebt: 8_000 }, "general");
    const q = checks.find((c) => c.figures.includes("equity"));
    expect(q?.severity).toBe("question");
    expect(q!.message).toContain("not always a warning");
  });

  it("treats an operating loss as the answer, not a mistake", () => {
    const checks = checkEntries({ ...sound, operatingProfit: -400 }, "general");
    const q = checks.find((c) => c.figures.includes("operatingProfit"));
    expect(q?.severity).toBe("question");
    expect(q!.message).toContain("is the answer");
  });

  it("uses the peers to spot a margin that may be the wrong line", () => {
    // Gross profit sits higher up the statement and is easy to grab by mistake.
    const checks = checkEntries({ ...sound, operatingProfit: 5_000 }, "general", peers());
    const q = checks.find((c) => c.message.includes("gross profit"));
    expect(q?.severity).toBe("question");
    expect(q!.message).toContain("semiconductors");
  });
});

describe("the reading", () => {
  it("says plainly whether the business creates value, and by how much", () => {
    const result = read(sound, "general", 0.08);
    expect("blocked" in result).toBe(false);
    if ("blocked" in result) return;

    // NOPAT = 2,000 × (1 − 400/1,800) = 1,555.6. Capital = 3,000 + 6,000 − 1,000
    // = 8,000. So ROIC = 19.4%, against 8%.
    expect(result.decomposition.roic).toBeCloseTo(0.1944, 3);
    expect(result.createsValue).toBe(true);
    expect(result.spread).toBeCloseTo(0.1144, 3);
    expect(result.says[0]).toContain("comes back worth more than it cost");
  });

  it("says the opposite just as plainly when it does not", () => {
    const result = read(sound, "general", 0.25);
    if ("blocked" in result) throw new Error("expected a reading");
    expect(result.createsValue).toBe(false);
    expect(result.says[0]).toContain("going the wrong way");
  });

  it("shows the two things the return is made of", () => {
    const result = read(sound, "general", 0.08);
    if ("blocked" in result) throw new Error("expected a reading");
    expect(result.says[1]).toContain("multiplied");
    expect(result.decomposition.nopatMargin * result.decomposition.capitalTurnover).toBeCloseTo(result.decomposition.roic, 10);
  });

  it("reads the advantage against real peers", () => {
    const highMargin: Entries = { ...sound, operatingProfit: 4_000, pretaxProfit: 3_800, taxExpense: 800 };
    const result = read(highMargin, "general", 0.08, peers());
    if ("blocked" in result) throw new Error("expected a reading");
    expect(result.howEarned).toBe("differentiation");
    expect(result.says.some((s) => s.includes("charges more"))).toBe(true);
  });

  it("always states what a single year cannot settle", () => {
    const result = read(sound, "general", 0.08, peers());
    if ("blocked" in result) throw new Error("expected a reading");
    expect(result.cannotTell.some((s) => s.includes("one year"))).toBe(true);
    expect(result.cannotTell.some((s) => s.includes("lease"))).toBe(true);
    expect(result.cannotTell.some((s) => s.includes("estimate"))).toBe(true);
  });

  it("names what is still missing rather than failing silently", () => {
    const result = read({ revenue: 10_000, operatingProfit: 2_000 }, "general", 0.08);
    expect("blocked" in result).toBe(true);
    if (!("blocked" in result)) return;
    expect(result.blocked).toContain("shareholders' equity");
    expect(result.blocked).toContain("cash");
  });

  it("refuses for a bank rather than producing a confident wrong answer", () => {
    const result = read(sound, "banking", 0.08);
    expect("blocked" in result).toBe(true);
  });
});
