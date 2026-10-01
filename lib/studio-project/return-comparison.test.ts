import { describe, expect, it } from "vitest";
import {
  alignHistories, computeComparison, largestFall, monthBreakdown, sampleCovariance, seriesSnapshots, wholeWeights,
  type AllocationSnapshot, type ComparisonInput, type CoverageRow, type HistoryOption, type SeriesSnapshot,
} from "./return-comparison";
import { historyOptions } from "./return-comparison-sources";
import type { ReturnHistory } from "./total-returns";

/**
 * Every expected figure below was computed outside this code: the synthetic
 * fixture and NIST's matrix in PowerShell 5.1 on 2026-09-27 (see
 * docs/source-audits/studio-portfolio-return-comparison.md section 4), the rest
 * by hand in the comments beside them.
 */
const allocation = (name: string, weights: Record<string, number>, budget = 100_000, cashReserve = 20_000): AllocationSnapshot => ({
  alternativeId: `alt-${name}`, name, budget, cashReserve,
  positions: Object.entries(weights).map(([instrumentId, targetWeightPct]) => ({ instrumentId, targetWeightPct })),
});

const series = (instrumentId: string, values: number[], patch: Partial<SeriesSnapshot> = {}): SeriesSnapshot => ({
  instrumentId, key: `import:${instrumentId}`, kind: "import", label: `${instrumentId.toUpperCase()} · test · your import`,
  sourceName: "Synthetic OPS fixture", sourceUrl: "", currency: "USD", basis: "market-price", method: "reported-total-return",
  seriesId: null, classId: null, importedAt: "2026-09-27T00:00:00.000Z", builtOn: null, accessions: null, values, ...patch,
});

const input = (a: AllocationSnapshot, b: AllocationSnapshot, list: SeriesSnapshot[], start = "2025-01"): ComparisonInput => ({
  a, b, series: list, period: { start, months: list[0]?.values.length ?? 0 },
});

// Synthetic fixture: A +10%, -10%, +5%; B 0%, +4%, -2%.
const A = [0.10, -0.10, 0.05];
const B = [0, 0.04, -0.02];

describe("the reference fixture", () => {
  const fixture = input(allocation("Half and half", { a: 50, b: 50 }), allocation("All A", { a: 100 }), [series("a", A), series("b", B)]);

  it("uses whole-portfolio weights and cash, and compounds monthly returns", () => {
    const result = computeComparison(fixture);
    if (!result.ok) throw new Error(result.error);
    const half = result.a;
    expect(half.weights.map((item) => item.weight)).toEqual([0.4, 0.4]);
    expect(half.cashWeight).toBeCloseTo(0.2, 15);
    expect(half.monthly[0]).toBeCloseTo(0.04, 15);
    expect(half.monthly[1]).toBeCloseTo(-0.024, 15);
    expect(half.monthly[2]).toBeCloseTo(0.012, 15);
    expect(half.growth.at(-1)).toBeCloseTo(102.722048, 10);
    expect(half.periodReturn).toBeCloseTo(0.02722048, 12);
    expect(half.meanMonthly).toBeCloseTo(0.0093333333333333, 14);
  });

  it("measures variance, volatility and covariance with the n - 1 denominator", () => {
    const result = computeComparison(fixture);
    if (!result.ok) throw new Error(result.error);
    expect(result.a.variance).toBeCloseTo(0.0010293333333333333, 16);
    expect(result.a.volatility).toBeCloseTo(0.032083225108042575, 15);
    expect(result.covariance![0][1]).toBeCloseTo(-0.002666666666666667, 16);
    expect(result.covariance![1][0]).toBe(result.covariance![0][1]);
    expect(result.covariance![0][0]).toBeCloseTo(0.010833333333333334, 16);
    expect(result.covariance![1][1]).toBeCloseTo(0.00093333333333333332, 16);
  });

  it("finds the largest month-end fall with its peak and trough", () => {
    // 100 -> 104 -> 101.504 -> 102.722048: 1 - 101.504 / 104 = 2.4%.
    const result = computeComparison(fixture);
    if (!result.ok) throw new Error(result.error);
    expect(result.a.largestFall.value).toBeCloseTo(0.024, 14);
    expect(result.a.largestFall).toMatchObject({ peak: "2025-01", trough: "2025-02" });
  });

  it("gives both allocations the same months", () => {
    const result = computeComparison(fixture);
    if (!result.ok) throw new Error(result.error);
    expect(result.months).toEqual(["2025-01", "2025-02", "2025-03"]);
    expect(result.a.monthly).toHaveLength(3);
    expect(result.b.monthly).toHaveLength(3);
    // All A at 80% of all money: 0.8 x (+10%, -10%, +5%) = +8%, -8%, +4%.
    expect(result.b.monthly.map((value) => Number(value.toFixed(12)))).toEqual([0.08, -0.08, 0.04]);
  });

  it("breaks a month into weighted returns that, with cash, add up to the total", () => {
    const result = computeComparison(fixture);
    if (!result.ok) throw new Error(result.error);
    const month = monthBreakdown(fixture, result.a, result.b, 1);
    // Month 2 for Half and half: 0.4 x -10% + 0.4 x +4% + 0.2 x 0% = -4% + 1.6% = -2.4%.
    expect(month.rows.map((row) => [row.instrumentId, Number(row.a.contribution.toFixed(12))])).toEqual([["a", -0.04], ["b", 0.016]]);
    expect(month.cash.a).toBeCloseTo(0.2, 15);
    expect(month.rows.reduce((sum, row) => sum + row.a.contribution, 0)).toBeCloseTo(month.total.a, 15);
  });
});

describe("compounding and falls", () => {
  it("compounds +10% then -10% to -1%, not zero", () => {
    const result = computeComparison(input(allocation("A", { a: 100 }, 1, 0), allocation("A too", { a: 100 }, 1, 0), [series("a", [0.1, -0.1])]));
    if (!result.ok) throw new Error(result.error);
    expect(result.a.periodReturn).toBeCloseTo(-0.01, 14);
  });

  it("counts a first-month loss as a fall from the starting 100", () => {
    // 100 -> 95 -> 96.9: the largest fall is 5%, from the start to the first month.
    const fall = largestFall([100, 95, 96.9], ["2025-01", "2025-02"]);
    expect(fall.value).toBeCloseTo(0.05, 14);
    expect(fall).toMatchObject({ peak: "start", trough: "2025-01" });
  });

  it("reports no fall, and no dates, when nothing fell", () => {
    expect(largestFall([100, 101, 103], ["2025-01", "2025-02"])).toEqual({ value: 0, peak: null, trough: null });
  });

  it("keeps the first of equal peaks and the first of equal troughs", () => {
    // 100, 110, 99, 110, 99: two 10% falls; the first peak and first trough stand.
    const fall = largestFall([100, 110, 99, 110, 99], ["m1", "m2", "m3", "m4"]);
    expect(fall).toEqual({ value: expect.closeTo(0.1, 14), peak: "m1", trough: "m2" });
  });
});

describe("covariance and portfolio variance", () => {
  it("reproduces NIST 6.5.4.1's worked matrix", () => {
    const X = [[4.0, 2.0, 0.60], [4.2, 2.1, 0.59], [3.9, 2.0, 0.58], [4.3, 2.1, 0.62], [4.1, 2.2, 0.63]];
    const S = sampleCovariance([0, 1, 2].map((j) => X.map((row) => row[j])));
    const expected = [[0.025, 0.0075, 0.00175], [0.0075, 0.0070, 0.00135], [0.00175, 0.00135, 0.00043]];
    expected.forEach((row, i) => row.forEach((value, j) => expect(S[i][j]).toBeCloseTo(value, 12)));
  });

  it("does not depend on the order the histories are listed in", () => {
    const one = computeComparison(input(allocation("x", { a: 30, b: 50 }), allocation("y", { a: 70 }), [series("a", A), series("b", B)]));
    const two = computeComparison(input(allocation("x", { b: 50, a: 30 }), allocation("y", { a: 70 }), [series("b", B), series("a", A)]));
    if (!one.ok || !two.ok) throw new Error("both should compute");
    expect(two.a.volatility).toBeCloseTo(one.a.volatility!, 15);
    expect(two.a.periodReturn).toBeCloseTo(one.a.periodReturn, 15);
  });

  it("handles identical, offsetting, constant and collinear histories without an inverse", () => {
    // Identical: 40% + 40% of the same series is 80% of it; volatility 0.8 x its standard deviation.
    const same = computeComparison(input(allocation("x", { a: 50, b: 50 }), allocation("y", { a: 100 }), [series("a", A), series("b", A)]));
    if (!same.ok) throw new Error(same.error);
    expect(same.a.volatility).toBeCloseTo(same.b.volatility!, 15);
    // Offsetting: b = -a at equal weights cancels every month; variance is exactly zero, not an error.
    const offset = computeComparison(input(allocation("x", { a: 50, b: 50 }), allocation("y", { a: 100 }), [series("a", A), series("b", A.map((v) => -v))]));
    if (!offset.ok) throw new Error(offset.error);
    expect(offset.a.volatility).toBe(0);
    expect(offset.a.periodReturn).toBeCloseTo(0, 15);
    // Constant: every month +1%; variance zero; 1.01^3 on the 80% invested = 0.8 x 1% a month.
    const constant = computeComparison(input(allocation("x", { c: 100 }), allocation("y", { c: 50 }), [series("c", [0.01, 0.01, 0.01])]));
    if (!constant.ok) throw new Error(constant.error);
    expect(constant.a.volatility).toBe(0);
    expect(constant.a.periodReturn).toBeCloseTo(1.008 ** 3 - 1, 14);
    // Collinear: d = 2a; a singular covariance matrix is fine for w'Sw.
    const collinear = computeComparison(input(allocation("x", { a: 50, d: 50 }), allocation("y", { a: 100 }), [series("a", A), series("d", A.map((v) => 2 * v))]));
    expect(collinear.ok).toBe(true);
  });

  it("agrees with the portfolio series' own variance for more than three investments", () => {
    const five = ["p", "q", "r", "s", "t"].map((id, k) => series(id, [0.01 * (k + 1), -0.02 + 0.005 * k, 0.03 - 0.01 * k, 0.004 * k, -0.01]));
    const result = computeComparison(input(allocation("x", { p: 10, q: 20, r: 30, s: 15, t: 25 }), allocation("y", { p: 50, t: 50 }), five));
    if (!result.ok) throw new Error(result.error);
    // Independent: sample variance of the monthly series itself, computed here with plain loops.
    const m = result.a.monthly;
    const avg = m.reduce((s, v) => s + v, 0) / m.length;
    const direct = m.reduce((s, v) => s + (v - avg) ** 2, 0) / (m.length - 1);
    expect(result.a.variance).toBeCloseTo(direct, 17);
  });

  it("stays finite near the limits of the input contract", () => {
    const extreme = computeComparison(input(allocation("x", { a: 100 }, 1, 0), allocation("y", { a: 1e-9 }, 1, 0), [series("a", [5, -0.999999, 1e-12, -0.5])]));
    if (!extreme.ok) throw new Error(extreme.error);
    expect(Number.isFinite(extreme.a.volatility!)).toBe(true);
    expect(extreme.a.growth.every((value) => Number.isFinite(value) && value > 0)).toBe(true);
  });
});

describe("weights", () => {
  it("counts reserved and unassigned money as cash", () => {
    // $100,000, $20,000 reserve, 25% of the rest invested: 20% invested, 80% cash.
    const weights = wholeWeights(allocation("x", { a: 25 }));
    if (!weights.ok) throw new Error(weights.error);
    expect(weights.weights[0].weight).toBeCloseTo(0.2, 15);
    expect(weights.cash).toBeCloseTo(0.8, 15);
  });

  it("accepts weights that are exactly 100% after rounding, and refuses more", () => {
    expect(5.4 + 69.9 + 24.7).toBeGreaterThan(100);
    expect(wholeWeights(allocation("x", { a: 5.4, b: 69.9, c: 24.7 })).ok).toBe(true);
    expect(wholeWeights(allocation("x", { a: 5.4, b: 69.9, c: 24.71 })).ok).toBe(false);
  });

  it.each([
    ["a zero budget", allocation("x", { a: 10 }, 0, 0)],
    ["a reserve above the budget", allocation("x", { a: 10 }, 100, 101)],
    ["a negative weight", allocation("x", { a: -5 })],
    ["a weight that is not a number", allocation("x", { a: Number.NaN })],
    ["a weight above 100%", allocation("x", { a: 101 })],
  ])("refuses %s and never shows a result", (_label, bad) => {
    const result = computeComparison(input(bad, allocation("y", { a: 100 }), [series("a", A)]));
    expect(result.ok).toBe(false);
  });

  it("compares an allocation that is entirely cash on the other one's months", () => {
    const result = computeComparison(input(allocation("Cash", {}), allocation("A", { a: 100 }), [series("a", A)]));
    if (!result.ok) throw new Error(result.error);
    expect(result.a.monthly).toEqual([0, 0, 0]);
    expect(result.a.growth).toEqual([100, 100, 100, 100]);
    expect(result.a.volatility).toBe(0);
    expect(result.a.largestFall.value).toBe(0);
  });
});

describe("alignment", () => {
  const option = (instrumentId: string, start: string, values: number[], patch: Partial<HistoryOption> = {}): HistoryOption => {
    const first = Number(start.slice(0, 4)) * 12 + Number(start.slice(5)) - 1;
    const month = (i: number) => `${Math.floor((first + i) / 12)}-${String((first + i) % 12 + 1).padStart(2, "0")}`;
    return {
      key: `import:${instrumentId}-${start}`, instrumentId, kind: "import", label: `${instrumentId.toUpperCase()} · test`, sourceName: "test", sourceUrl: "",
      currency: "USD", basis: "market-price", method: "reported-total-return", seriesId: null, classId: null, importedAt: "2026-09-27T00:00:00.000Z", builtOn: null,
      observations: values.map((value, i) => ({ month: month(i), value })), accessions: null, ...patch,
    };
  };
  const row = (chosen: HistoryOption | null, options: HistoryOption[] = chosen ? [chosen] : [], bond = false): CoverageRow => ({ instrumentId: chosen?.instrumentId ?? options[0]?.instrumentId ?? "x", symbol: (chosen?.instrumentId ?? options[0]?.instrumentId ?? "x").toUpperCase(), bond, options, chosen });

  it("trims only the outer months to the common overlap and says how many", () => {
    // a: 2025-01..2025-06; b: 2025-03..2025-08. Common: 2025-03..2025-06.
    const aligned = alignHistories([row(option("a", "2025-01", [1, 2, 3, 4, 5, 6].map((v) => v / 100))), row(option("b", "2025-03", [1, 2, 3, 4, 5, 6].map((v) => v / 100)))]);
    expect(aligned).toEqual({ ok: true, start: "2025-03", end: "2025-06", months: 4, excluded: [{ instrumentId: "a", before: 2, after: 0 }, { instrumentId: "b", before: 0, after: 2 }] });
  });

  it("applies a narrower range to both, and refuses one outside the overlap", () => {
    const rows = [row(option("a", "2025-01", [0.01, 0.02, 0.03, 0.04])), row(option("b", "2025-01", [0.01, 0.02, 0.03, 0.04]))];
    expect(alignHistories(rows, { start: "2025-02", end: "2025-03" })).toMatchObject({ ok: true, start: "2025-02", end: "2025-03", months: 2 });
    expect(alignHistories(rows, { start: "2024-12" })).toMatchObject({ ok: false, kind: "range" });
  });

  it("reports no overlap instead of inventing months", () => {
    expect(alignHistories([row(option("a", "2020-01", [0.01, 0.02])), row(option("b", "2025-01", [0.01, 0.02]))])).toMatchObject({ ok: false, kind: "no-overlap" });
  });

  it("refuses mixed currencies and mixed bases, naming each", () => {
    const eur = alignHistories([row(option("a", "2025-01", [0.01, 0.02])), row(option("b", "2025-01", [0.01, 0.02], { currency: "EUR" }))]);
    expect(eur).toMatchObject({ ok: false, kind: "currency", instrumentIds: ["b"] });
    const mixed = alignHistories([row(option("a", "2025-01", [0.01, 0.02])), row(option("b", "2025-01", [0.01, 0.02], { basis: "net-asset-value" }))]);
    expect(mixed).toMatchObject({ ok: false, kind: "basis" });
  });

  it("asks for a choice when several histories fit, and blocks a missing one or a bond", () => {
    const two = [option("a", "2025-01", [0.01, 0.02]), option("a", "2024-01", [0.01, 0.02])];
    expect(alignHistories([row(null, two)])).toMatchObject({ ok: false, kind: "choose", instrumentIds: ["a"] });
    expect(alignHistories([{ instrumentId: "tsm", symbol: "TSM", bond: false, options: [], chosen: null }])).toMatchObject({ ok: false, kind: "missing", instrumentIds: ["tsm"] });
    expect(alignHistories([{ instrumentId: "ust", symbol: "91282CRF0", bond: true, options: [], chosen: null }])).toMatchObject({ ok: false, kind: "bond" });
  });

  it("needs an explicit period when both allocations are entirely cash", () => {
    expect(alignHistories([])).toMatchObject({ ok: false, kind: "all-cash" });
    expect(alignHistories([], { start: "2025-01", end: "2025-06" })).toMatchObject({ ok: true, months: 6 });
  });

  it("cuts each history to the aligned months, keeping its source", () => {
    const rows = [row(option("a", "2025-01", [0.01, 0.02, 0.03])), row(option("b", "2025-02", [0.05, 0.06]))];
    const aligned = alignHistories(rows);
    if (!aligned.ok) throw new Error(aligned.error);
    const cut = seriesSnapshots(rows, { start: aligned.start, months: aligned.months });
    expect(cut.map((item) => item.values)).toEqual([[0.02, 0.03], [0.05, 0.06]]);
    expect(cut[0].sourceName).toBe("test");
  });

  it("ignores an import with a gap, a duplicate or months out of order", () => {
    const bad = (observations: { month: string; value: number }[]): ReturnHistory => ({ id: "h", instrumentId: "aapl", sourceName: "x", sourceUrl: "", currency: "USD", basis: "market-price", method: "reported-total-return", importedAt: "2026-09-27T00:00:00.000Z", observations });
    for (const observations of [
      [{ month: "2025-01", value: 0.01 }, { month: "2025-03", value: 0.01 }],
      [{ month: "2025-01", value: 0.01 }, { month: "2025-01", value: 0.01 }],
      [{ month: "2025-02", value: 0.01 }, { month: "2025-01", value: 0.01 }],
    ]) expect(historyOptions({ returnHistories: [bad(observations)] }, "aapl")).toEqual([]);
  });

  it("offers the bundled public history for its own fund only", () => {
    const vti = historyOptions({}, "vti");
    expect(vti).toHaveLength(1);
    expect(vti[0]).toMatchObject({ kind: "public", classId: "C000007808", currency: "USD", basis: "net-asset-value" });
    expect(historyOptions({}, "aapl")).toEqual([]);
  });

  it("includes a holding held only by the second allocation", () => {
    const result = computeComparison(input(allocation("x", { a: 100 }), allocation("y", { a: 50, b: 50 }), [series("a", A), series("b", B)]));
    if (!result.ok) throw new Error(result.error);
    expect(result.a.weights.map((item) => item.instrumentId)).toEqual(["a"]);
    expect(result.b.weights.map((item) => item.instrumentId)).toEqual(["a", "b"]);
  });

  it("refuses a history nobody holds, or a held investment without one", () => {
    expect(computeComparison(input(allocation("x", { a: 100 }), allocation("y", { a: 100 }), [series("a", A), series("b", B)])).ok).toBe(false);
    expect(computeComparison(input(allocation("x", { a: 50, b: 50 }), allocation("y", { a: 100 }), [series("a", A)])).ok).toBe(false);
  });

  it("marks one month as history to inspect, not a completed comparison", () => {
    const one = computeComparison(input(allocation("x", { a: 100 }), allocation("y", { a: 50 }), [series("a", [0.02])]));
    if (!one.ok) throw new Error(one.error);
    expect(one.complete).toBe(false);
    expect(one.a.volatility).toBeNull();
  });
});
