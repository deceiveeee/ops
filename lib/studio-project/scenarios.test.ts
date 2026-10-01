import { describe, expect, it } from "vitest";
import { exportProjectBackup, importProjectBackup } from "./backup";
import { createStudioProject } from "./create";
import { emptyLimits } from "./limits";
import { addPosition } from "./operations";
import { allocationView, comparisonNeedsReview, saveWeightProposal } from "./portfolio-weights";
import { addScenario, FIRST_SCENARIO_ID, MAX_SCENARIOS, readScenarios, removeScenario, renameScenario, updateScenario } from "./scenarios";
import type { StudioProject } from "./schema";
import { validateStudioProject } from "./validate";
import { exportProjectText } from "./workspace";

const NOW = "2026-09-26T12:00:00.000Z";

/**
 * $100,000 with $20,000 in reserve leaves $80,000. VTI 50%, AAPL 10%, AGG 25%
 * of that is $40,000, $8,000 and $20,000, leaving $32,000 cash (32% of all).
 * The loss you could afford, 12%, is the budget: $12,000.
 */
function project(): StudioProject {
  let value = createStudioProject("practice", NOW);
  for (const id of ["vti", "aapl", "agg"]) value = addPosition(value, id, undefined, NOW);
  return {
    ...value,
    goal: { ...value.goal, budget: 100_000, cashReserve: 20_000, lossTolerancePct: 20 },
    limits: { ...emptyLimits(), lossCapacityPct: 12 },
    stress: { usStocksPct: -30, internationalStocksPct: -30, globalStocksPct: -30, bondsPct: 5, cashPct: 0 },
    scenarioName: "Stocks fall",
    scenarios: [
      { id: "rates", name: "Rates rise", stress: { usStocksPct: -15, internationalStocksPct: -15, globalStocksPct: -15, bondsPct: -12, cashPct: 0 } },
      { id: "inflation", name: "Inflation", stress: { usStocksPct: -10, internationalStocksPct: -10, globalStocksPct: -10, bondsPct: -15, cashPct: -3 } },
    ],
    alternatives: value.alternatives.map((item) => ({
      ...item, positions: item.positions.map((position, index) => ({ ...position, targetWeightPct: [50, 10, 25][index] })),
    })),
  };
}

describe("several scenarios", () => {
  it("reads the original scenario first, and names unnamed ones by position", () => {
    const value = project();
    expect(readScenarios(value).map((scenario) => [scenario.id, scenario.name])).toEqual([[FIRST_SCENARIO_ID, "Stocks fall"], ["rates", "Rates rise"], ["inflation", "Inflation"]]);
    const unnamed = { ...value, scenarioName: undefined, scenarios: [{ ...value.scenarios![0], name: " " }] };
    expect(readScenarios(unnamed).map((scenario) => scenario.name)).toEqual(["Scenario 1", "Scenario 2"]);
    // Work saved before scenarios existed has exactly one.
    expect(readScenarios({ stress: value.stress })).toEqual([{ id: FIRST_SCENARIO_ID, name: "Scenario 1", stress: value.stress }]);
  });

  it("holds the loss budget against the worst scenario and names it", () => {
    // Stocks fall: VTI -$12,000, AAPL -$2,400, AGG +$1,000 = -$13,400.
    // Rates rise: -$6,000 - $1,200 - $2,400 = -$9,600.
    // Inflation: -$4,000 - $800 - $3,000, and $32,000 cash x -3% = -$960: -$8,760.
    const { checks, calculation } = allocationView(project(), project().alternatives[0]);
    expect(calculation.stress.changeDollars).toBe(-13_400);
    const loss = checks.checks.find((check) => check.key === "loss")!;
    expect(loss).toEqual({
      key: "loss", title: "Every scenario stays within your loss budget", status: "not-met",
      detail: "This allocation loses $13,400 in “Stocks fall”, the worst of your 3 scenarios. Your loss budget is $12,000, the loss you could afford. Most of the loss: VTI $12,000, AAPL $2,400.",
    });
  });

  it("finds the worst scenario wherever it is in the list", () => {
    // With stocks rising in the first scenario, Rates rise (-$9,600) is the worst and fits $12,000.
    const value = { ...project(), stress: { ...project().stress, usStocksPct: 5 } };
    const loss = allocationView(value, value.alternatives[0]).checks.checks.find((check) => check.key === "loss")!;
    expect(loss.status).toBe("met");
    expect(loss.detail).toBe("This allocation loses $9,600 in “Rates rise”, the worst of your 3 scenarios. Your loss budget is $12,000, the loss you could afford.");
  });

  it("limits each holding by its tightest scenario", () => {
    // Room = weight + (12% budget - scenario loss %) / (holding's fall - cash's fall), per scenario.
    // VTI at 40% of all money: Stocks fall 40 + (12 - 13.4) / 0.30 = 35.33%; Rates rise 40 + 2.4 / 0.15 = 56%;
    //   Inflation 40 + 3.24 / (0.10 - 0.03) = 86.29%. Tightest: Stocks fall, and VTI is over it.
    // AGG at 20%: rises in Stocks fall, so no ceiling there; Rates rise 20 + 2.4 / 0.12 = 40%;
    //   Inflation 20 + 3.24 / (0.15 - 0.03) = 47%. Tightest: Rates rise.
    const { holdings } = allocationView(project(), project().alternatives[0]).checks;
    const vti = holdings.find((room) => room.instrumentId === "vti")!;
    expect(vti.tightest?.label).toBe("your loss budget in “Stocks fall”");
    expect(vti.tightest?.pct).toBeCloseTo(35.3333, 3);
    expect(vti.over).toBe(true);
    const agg = holdings.find((room) => room.instrumentId === "agg")!;
    expect(agg.tightest?.label).toBe("your loss budget in “Rates rise”");
    expect(agg.tightest?.pct).toBeCloseTo(40, 6);
    expect(agg.over).toBe(false);
  });

  it("reads exactly as before with one scenario", () => {
    const one = { ...project(), scenarioName: undefined, scenarios: undefined };
    const view = allocationView(one, one.alternatives[0]);
    const loss = view.checks.checks.find((check) => check.key === "loss")!;
    expect(loss.title).toBe("The scenario stays within your loss budget");
    expect(loss.detail).toBe("This allocation loses $13,400 in the scenario. Your loss budget is $12,000, the loss you could afford. Most of the loss: VTI $12,000, AAPL $2,400.");
    expect(view.checks.holdings.find((room) => room.instrumentId === "vti")?.tightest?.label).toBe("your loss budget");
  });

  it("adds a scenario as a copy of the one on screen, up to five", () => {
    let value = addScenario(project(), "rates", NOW, "copy");
    expect(value.scenarios!.at(-1)).toEqual({ id: "copy", name: "", stress: project().scenarios![0].stress });
    expect(value.scenarios!.at(-1)!.stress).not.toBe(value.scenarios![0].stress);
    value = addScenario(value, FIRST_SCENARIO_ID, NOW, "fifth");
    expect(readScenarios(value)).toHaveLength(MAX_SCENARIOS);
    expect(() => addScenario(value, FIRST_SCENARIO_ID, NOW, "sixth")).toThrow(/up to 5/);
    expect(validateStudioProject(value)).toEqual([]);
  });

  it("edits, renames and removes, keeping exactly one first scenario", () => {
    let value = updateScenario(project(), FIRST_SCENARIO_ID, { bondsPct: -2 }, NOW);
    expect(value.stress.bondsPct).toBe(-2);
    value = updateScenario(value, "inflation", { cashPct: -1 }, NOW);
    expect(value.scenarios![1].stress.cashPct).toBe(-1);
    value = renameScenario(value, "rates", "Rates jump", NOW);
    expect(readScenarios(value)[1].name).toBe("Rates jump");
    expect(() => renameScenario(value, "rates", "x".repeat(61), NOW)).toThrow(/60 characters/);
    // Removing the first promotes the next into its place.
    value = removeScenario(value, FIRST_SCENARIO_ID, NOW);
    expect(value.stress).toEqual(project().scenarios![0].stress);
    expect(readScenarios(value).map((scenario) => scenario.name)).toEqual(["Rates jump", "Inflation"]);
    value = removeScenario(value, "inflation", NOW);
    expect(() => removeScenario(value, FIRST_SCENARIO_ID, NOW)).toThrow(/at least one/);
    expect(() => updateScenario(value, "gone", { bondsPct: 1 }, NOW)).toThrow(/no longer available/);
    expect(validateStudioProject(value)).toEqual([]);
  });

  it("round-trips through a backup, and still accepts a backup with none", () => {
    const value = project();
    const backup = exportProjectBackup(value);
    if (!backup.ok) throw new Error(backup.error);
    const restored = importProjectBackup(backup.raw);
    expect(restored.ok && restored.project.scenarios).toEqual(value.scenarios);
    const { scenarioName: _name, scenarios: _scenarios, ...older } = value;
    expect(validateStudioProject(older)).toEqual([]);
  });

  it.each([
    ["six scenarios", (value: StudioProject) => ({ ...value, scenarios: Array.from({ length: 5 }, (_, index) => ({ ...value.scenarios![0], id: `s${index}` })) })],
    ["a change beyond -100%", (value: StudioProject) => ({ ...value, scenarios: [{ ...value.scenarios![0], stress: { ...value.scenarios![0].stress, bondsPct: -150 } }] })],
    ["a repeated id", (value: StudioProject) => ({ ...value, scenarios: [value.scenarios![0], value.scenarios![0]] })],
    ["the first scenario's id", (value: StudioProject) => ({ ...value, scenarios: [{ ...value.scenarios![0], id: FIRST_SCENARIO_ID }] })],
    ["a long name", (value: StudioProject) => ({ ...value, scenarioName: "x".repeat(61) })],
    ["an unknown field", (value: StudioProject) => ({ ...value, scenarios: [{ ...value.scenarios![0], probability: 0.5 }] })],
  ])("refuses %s", (_label, change) => {
    expect(validateStudioProject(change(project()))).toContainEqual(expect.stringMatching(/^Scenarios must be/));
  });

  it("lists every scenario and the selected allocation's result in the text export", () => {
    const text = exportProjectText(project());
    expect(text).toContain("SCENARIOS (ASSUMPTIONS YOU CHOSE, NOT FORECASTS)");
    expect(text).toContain("Stocks fall: US stocks -30%; international stocks -30%; global stocks -30%; bonds 5%; cash 0%. Selected allocation: -$13,400.00 (-13.4%).");
    expect(text).toContain("Inflation: US stocks -10%; international stocks -10%; global stocks -10%; bonds -15%; cash -3%. Selected allocation: -$8,760.00 (-8.76%).");
    expect(exportProjectText({ ...project(), scenarios: undefined })).not.toContain("SCENARIOS");
  });

  it("asks for a fresh proposal once scenarios change, but not for work saved before they existed", () => {
    const one = { ...project(), scenarioName: undefined, scenarios: undefined };
    const saved = saveWeightProposal(one, one.alternatives[0].id, { name: "Proposal", reasoning: "Test", weights: { aapl: "5" }, valuationCaseIds: {} }, NOW);
    const proposal = saved.alternatives[1];
    expect(comparisonNeedsReview(saved, proposal)).toBe(false);
    const withSecond = addScenario(saved, FIRST_SCENARIO_ID, NOW, "second");
    expect(comparisonNeedsReview(withSecond, proposal)).toBe(true);
    expect(comparisonNeedsReview(removeScenario(withSecond, "second", NOW), proposal)).toBe(false);
  });
});
