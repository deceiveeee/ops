import { describe, expect, it } from "vitest";
import { newValuation, validValuationCase, type ValuationCase } from "./valuation-cases";
import { sensitivityScenario, valuationSensitivity } from "./valuation-sensitivity";

const CREATED = "2026-09-20T12:00:00.000Z";
const COPIED = "2026-09-25T12:00:00.000Z";

function gridFor(record: ValuationCase, step = 1) {
  const grid = valuationSensitivity(record, step);
  if (!grid) throw new Error("Expected a sensitivity grid for these complete inputs.");
  return grid;
}

function sourcedExample() {
  const record = newValuation(true, CREATED);
  record.name = "Base case";
  record.company = "Example company";
  record.ticker = "EXAMPLE";
  record.cik = "0000000001";
  record.example = false;
  record.priceAsOf = "2026-09-18";
  record.reasoning = "The original growth estimate reflects a mature business.";
  record.source = {
    url: "https://www.sec.gov/Archives/example.htm",
    periodEnd: "2025-12-31",
    fetchedAt: CREATED,
    sharesConcept: "DilutedShares",
    figures: [{ key: "shares", value: 100_000_000, concepts: ["DilutedShares"] }],
  };
  record.costReference = { industry: "Example industry", ratePct: 10, notes: ["Original dated industry reference"] };
  return record;
}

describe("saved valuation sensitivity", () => {
  it("matches nine independently calculated values with figures and return on capital held fixed", () => {
    const record = newValuation(true, CREATED);
    const before = structuredClone(record);
    const grid = gridFor(record);
    // With exactly 1/6 return on capital, 1%, 2%, 3% growth leave annual
    // cash flows of 141, 132, 123. Divide by cost minus growth, subtract
    // net debt of 200, and divide by 100 shares. The saved return rounds
    // to 16.666667%, accounting for differences below one millionth.
    const expected = [
      [15.625, 13.6666666666667, 12.1],
      [16.8571428571429, 14.5, 12.6666666666667],
      [18.5, 15.5714285714286, 13.375],
    ];
    expect(grid).toHaveLength(3);
    grid.forEach((row, rowIndex) => {
      expect(row).toHaveLength(3);
      row.forEach((cell, columnIndex) => {
        expect(cell.rates).toEqual({ growth: String(rowIndex + 1), costOfCapital: String(columnIndex + 9) });
        if (!cell.result.ok) throw new Error(cell.result.reason);
        expect(cell.result.value).toBeCloseTo(expected[rowIndex][columnIndex], 6);
      });
    });
    expect(record).toEqual(before);
  });

  it.each([
    [0.5, "1.5", "2.5", "9.5", "10.5"],
    [2, "0", "4", "8", "12"],
  ] as const)("uses a %s percentage-point step, rather than a relative percentage change", (step, lowGrowth, highGrowth, lowCost, highCost) => {
    const grid = gridFor(newValuation(true, CREATED), step);
    expect(grid[0][0].rates).toEqual({ growth: lowGrowth, costOfCapital: lowCost });
    expect(grid[2][2].rates).toEqual({ growth: highGrowth, costOfCapital: highCost });
  });

  it("retains fractional company shares per traded share throughout the grid", () => {
    const record = newValuation(true, CREATED);
    record.inputs.receipt = "0.5";
    const grid = gridFor(record);
    const expected = [[0, 0, 7.8125], [1, 1, 7.25], [2, 2, 6.6875]];
    expected.forEach(([row, column, value]) => {
      const result = grid[row][column].result;
      if (!result.ok) throw new Error(result.reason);
      expect(result.value).toBeCloseTo(value, 6);
    });
  });

  it("preserves a negative growth row as unavailable instead of clamping it to zero", () => {
    const record = newValuation(true, CREATED);
    record.inputs.growth = "0";
    const grid = gridFor(record);
    for (const cell of grid[0]) {
      expect(cell.rates.growth).toBe("-1");
      expect(cell.result).toMatchObject({ ok: false, reason: expect.stringContaining("cannot shrink") });
    }
    expect(grid[1][1].rates.growth).toBe("0");
    expect(grid[1][1].result).toMatchObject({ ok: true, value: 13 });
  });

  it("keeps distinct refusal reasons for zero cost and growth reaching the cost of capital", () => {
    const record = newValuation(true, CREATED);
    record.inputs.growth = "0";
    record.inputs.costOfCapital = "1";
    const grid = gridFor(record);
    expect(grid[1][0].rates).toEqual({ growth: "0", costOfCapital: "0" });
    expect(grid[1][0].result).toMatchObject({ ok: false, reason: expect.stringContaining("above zero") });
    expect(grid[2][1].rates).toEqual({ growth: "1", costOfCapital: "1" });
    expect(grid[2][1].result).toMatchObject({ ok: false, reason: expect.stringContaining("growth rate below") });
    expect(grid[2][2].result.ok).toBe(true);
  });

  it("preserves the exact centre input text without mutating the saved record", () => {
    const record = newValuation(true, CREATED);
    record.inputs.growth = " 2.0000 ";
    record.inputs.costOfCapital = "+10.000";
    const before = structuredClone(record);
    const grid = gridFor(record);
    expect(grid[1][1].rates).toEqual({ growth: " 2.0000 ", costOfCapital: "+10.000" });
    expect(record).toEqual(before);
    grid[1][1].rates.growth = "3";
    expect(record).toEqual(before);
  });

  it.each([0, -1, 0.25, 3, Number.NaN, Number.POSITIVE_INFINITY])("refuses unsupported step %s", (step) => {
    expect(valuationSensitivity(newValuation(true, CREATED), step)).toBeNull();
  });

  it.each([
    ["nopat", ""], ["receipt", "0"], ["growth", "10"], ["costOfCapital", "0"], ["shares", "1e-320"],
  ] as const)("refuses an invalid base with %s = %s", (key, value) => {
    const record = newValuation(true, CREATED);
    record.inputs[key] = value;
    expect(valuationSensitivity(record, 1)).toBeNull();
  });
});

describe("copying a sensitivity preview", () => {
  it("creates a separate scenario with the same figures and sources, and labels the previous reasoning", () => {
    const original = sourcedExample();
    const before = structuredClone(original);
    const copy = sensitivityScenario(original, { growth: "3", costOfCapital: "11" }, "value-sensitivity-copy", COPIED);
    expect(copy).toMatchObject({
      id: "value-sensitivity-copy", createdAt: COPIED, updatedAt: COPIED,
      company: original.company, ticker: original.ticker, cik: original.cik,
      model: original.model, example: original.example, priceAsOf: original.priceAsOf,
      inputs: { ...original.inputs, growth: "3", costOfCapital: "11" },
      source: original.source, costReference: null,
    });
    expect(copy.id).not.toBe(original.id);
    expect(copy.name).toContain("Base case");
    expect(copy.name).toContain("3% growth");
    expect(copy.name).toContain("11% cost");
    expect(copy.reasoning).toContain("Review the changed rates");
    expect(copy.reasoning).toContain(`Original reasoning:\n${original.reasoning}`);
    expect(copy.inputs).not.toBe(original.inputs);
    expect(original).toEqual(before);
    expect(validValuationCase(copy)).toBe(true);
  });

  it("retains the industry reference when the numeric cost is unchanged despite different formatting and metadata precision", () => {
    const original = sourcedExample();
    original.inputs.costOfCapital = "10.123456";
    original.costReference!.ratePct = 10.1234564;
    const copy = sensitivityScenario(original, { growth: "3", costOfCapital: "+10.12345600" }, "value-same-cost", COPIED);
    expect(copy.costReference).toEqual(original.costReference);
    expect(copy.inputs.costOfCapital).toBe("+10.12345600");
  });

  it("clears the reference when cost changes to the metadata rate rather than the original saved rate", () => {
    const original = sourcedExample();
    original.inputs.costOfCapital = "10.123456";
    original.costReference!.ratePct = 10.1234564;
    const copy = sensitivityScenario(original, { growth: "2", costOfCapital: "10.1234564" }, "value-new-cost", COPIED);
    expect(copy.costReference).toBeNull();
    expect(original.costReference!.ratePct).toBe(10.1234564);
    expect(original.inputs.costOfCapital).toBe("10.123456");
  });

  it("refuses to save an unavailable rate combination and leaves the original untouched", () => {
    const original = sourcedExample();
    const before = structuredClone(original);
    expect(() => sensitivityScenario(original, { growth: "10", costOfCapital: "10" }, "value-invalid", COPIED)).toThrow("growth rate below");
    expect(original).toEqual(before);
  });
});
