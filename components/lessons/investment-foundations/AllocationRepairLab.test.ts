import { describe, expect, it } from "vitest";

import { checkAllocationRepair } from "./AllocationRepairLab";

describe("checkAllocationRepair", () => {
  it("accepts different coherent repairs instead of matching one prescribed allocation", () => {
    const first = checkAllocationRepair({
      weightsBps: { ready: 2_500, steady: 3_500, grow: 4_000 },
      portfolioAmount: 60_000,
      nearTermNeed: 15_000,
      suppliedLossBps: { ready: 0, steady: 800, grow: 4_000 },
      lossBudgetBps: 2_000,
    });
    const second = checkAllocationRepair({
      weightsBps: { ready: 3_000, steady: 3_000, grow: 4_000 },
      portfolioAmount: 60_000,
      nearTermNeed: 15_000,
      suppliedLossBps: { ready: 0, steady: 800, grow: 4_000 },
      lossBudgetBps: 2_000,
    });

    expect(first.coherent).toBe(true);
    expect(first.totalStressLossBps).toBe(1_880);
    expect(second.coherent).toBe(true);
    expect(second.totalStressLossBps).toBe(1_840);
  });

  it("rejects a policy that misses the dated liquidity need even when stress fits", () => {
    const result = checkAllocationRepair({
      weightsBps: { ready: 2_000, steady: 4_000, grow: 4_000 },
      portfolioAmount: 60_000,
      nearTermNeed: 15_000,
      suppliedLossBps: { ready: 0, steady: 800, grow: 4_000 },
      lossBudgetBps: 2_000,
    });

    expect(result.checks.liquidity.passed).toBe(false);
    expect(result.checks.stressBudget.passed).toBe(true);
    expect(result.coherent).toBe(false);
  });

  it("can isolate one guided relationship when numeric inputs are valid", () => {
    const result = checkAllocationRepair({
      weightsBps: { ready: 1_500, steady: 3_000, grow: 5_500 },
      portfolioAmount: 40_000,
      nearTermNeed: 0,
      suppliedLossBps: { ready: 0, steady: 0, grow: 0 },
      lossBudgetBps: 10_000,
      constraints: {
        liquidity: { enforced: false, displayed: false },
        stressBudget: { enforced: false, displayed: false },
      },
    });

    expect(result.weightTotalBps).toBe(10_000);
    expect(result.coherent).toBe(true);
  });

  it.each([
    ["a blank weight", null],
    ["a non-finite weight", Number.NaN],
    ["a negative weight", -1],
    ["a fractional weight", 1_500.5],
    ["a weight above 100%", 10_001],
  ])("rejects %s even when its teaching checks are hidden", (_label, readyWeight) => {
    const result = checkAllocationRepair({
      weightsBps: { ready: readyWeight, steady: 3_000, grow: 5_500 },
      portfolioAmount: 40_000,
      nearTermNeed: 0,
      suppliedLossBps: { ready: 0, steady: 0, grow: 0 },
      lossBudgetBps: 10_000,
      constraints: {
        bounds: { enforced: false, displayed: false },
        weightTotal: { enforced: false, displayed: false },
        liquidity: { enforced: false, displayed: false },
        stressBudget: { enforced: false, displayed: false },
      },
    });

    expect(result.weightsAreUsable).toBe(false);
    expect(result.caseInputsAreUsable).toBe(true);
    expect(result.weightTotalBps).toBeNull();
    expect(result.coherent).toBe(false);
  });

  it.each([
    {
      label: "a negative portfolio amount",
      portfolioAmount: -1,
      nearTermNeed: 0,
      suppliedLossBps: { ready: 0, steady: 0, grow: 0 },
      lossBudgetBps: 10_000,
    },
    {
      label: "a near-term need above the portfolio amount",
      portfolioAmount: 40_000,
      nearTermNeed: 40_001,
      suppliedLossBps: { ready: 0, steady: 0, grow: 0 },
      lossBudgetBps: 10_000,
    },
    {
      label: "an out-of-range supplied loss",
      portfolioAmount: 40_000,
      nearTermNeed: 0,
      suppliedLossBps: { ready: 0, steady: 0, grow: 10_001 },
      lossBudgetBps: 10_000,
    },
    {
      label: "a non-finite loss budget",
      portfolioAmount: 40_000,
      nearTermNeed: 0,
      suppliedLossBps: { ready: 0, steady: 0, grow: 0 },
      lossBudgetBps: Number.NaN,
    },
  ])("rejects $label even when related teaching checks are hidden", ({
    portfolioAmount,
    nearTermNeed,
    suppliedLossBps,
    lossBudgetBps,
  }) => {
    const result = checkAllocationRepair({
      weightsBps: { ready: 1_500, steady: 3_000, grow: 5_500 },
      portfolioAmount,
      nearTermNeed,
      suppliedLossBps,
      lossBudgetBps,
      constraints: {
        liquidity: { enforced: false, displayed: false },
        stressBudget: { enforced: false, displayed: false },
      },
    });

    expect(result.weightsAreUsable).toBe(true);
    expect(result.caseInputsAreUsable).toBe(false);
    expect(result.coherent).toBe(false);
  });
});
