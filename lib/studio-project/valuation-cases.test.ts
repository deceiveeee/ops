import { describe, expect, it } from "vitest";
import { newValuation, saveValuation, valuationResult, validValuationCase } from "./valuation-cases";
import { createStudioProject } from "./create";
import { exportProjectBackup, importProjectBackup } from "./backup";
import { validateStudioProject } from "./validate";

describe("saved valuation cases", () => {
  it("bridges cash flow to equity and reverse-solves the entered price", () => {
    const example = newValuation(true);
    const result = valuationResult(example);
    if (!result.ok) throw new Error(result.reason);
    // The input displays six decimal places for the repeating 16 2/3% rate.
    expect(result.business.reinvestmentRate).toBeCloseTo(.12, 8);
    expect(result.business.value).toBeCloseTo(1650, 4);
    expect(result.value).toBeCloseTo(14.5, 6);
    expect(result.reverse).toBeCloseTo(0, 12);
    example.inputs.growth = "0";
    expect(valuationResult(example)).toMatchObject({ ok: true, value: 13 });
    example.inputs.receipt = "5";
    expect(valuationResult(example)).toMatchObject({ ok: true, value: 65 });
  });
  it.each([
    ["growth", "10"], ["growth", "-1"], ["shares", "0"], ["receipt", "0"], ["receipt", "-5"],
    ["nopat", ""], ["nopat", "-1"], ["costOfCapital", "0"], ["returnOnCapital", "1"], ["shares", "1e-320"],
  ] as const)("preserves unfinished or invalid %s but refuses a misleading value", (key, value) => {
    const record = newValuation(true);
    record.inputs[key] = value;
    expect(validValuationCase(record)).toBe(true);
    expect(valuationResult(record).ok).toBe(false);
  });
  it("round-trips scenarios, their source snapshots and local histories independently of holdings", () => {
    const record = newValuation(true);
    record.source = { url: "https://www.sec.gov/Archives/example.htm", periodEnd: "2025-12-31", fetchedAt: record.createdAt, sharesConcept: "DilutedShares", figures: [{ key: "revenue", value: 1000, concepts: ["Revenue"] }] };
    record.costReference = { industry: "Example industry", ratePct: 10, notes: ["Original dated reference"] };
    record.reasoning = "A steady business with limited reinvestment needs.";
    record.priceAsOf = "2026-09-18";
    let project = saveValuation(createStudioProject("personal"), record);
    project = saveValuation(project, { ...record, id: "copy", name: "Slower growth", inputs: { ...record.inputs, growth: "0" } });
    project.returnHistories = [{ id: "return-history", instrumentId: "aapl", sourceName: "Local source", sourceUrl: "", currency: "USD", basis: "market-price", method: "reported-total-return", importedAt: record.createdAt, observations: [{ month: "2025-01", value: .02 }] }];
    expect(project.candidates).toHaveLength(0);
    expect(validateStudioProject(project)).toEqual([]);
    const backup = exportProjectBackup(project);
    if (!backup.ok) throw new Error(backup.error);
    const restored = importProjectBackup(backup.raw);
    if (!restored.ok) throw new Error(restored.error);
    expect(restored.project).toEqual(project);
    expect(validateStudioProject({ ...project, valuations: [record, record] })).not.toEqual([]);
    expect(validateStudioProject({ ...project, returnHistories: [project.returnHistories[0], project.returnHistories[0]] })).not.toEqual([]);
  });
  it("rejects altered model versions, hidden fields and impossible price dates", () => {
    const record = newValuation(true);
    expect(validValuationCase({ ...record, model: "future-model" })).toBe(false);
    expect(validValuationCase({ ...record, priceAsOf: "2026-02-31" })).toBe(false);
    expect(validValuationCase({ ...record, invisibleAssumption: 1 })).toBe(false);
  });
});
