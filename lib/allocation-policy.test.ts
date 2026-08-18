import { describe, expect, it } from "vitest";

import {
  BASIS_POINTS_TOTAL,
  allocationWeightsAreComplete,
  assertBasisPoints,
  calculateCandidateCeilingBps,
  calculatePortfolioStressLossBps,
  calculateStressContributionBps,
  isLiquidityCovered,
  sumWeightBps,
  validateAllocationSleeves,
} from "@/lib/allocation-policy";

describe("allocation policy math", () => {
  it("requires exact integer basis points", () => {
    expect(() => assertBasisPoints(0)).not.toThrow();
    expect(() => assertBasisPoints(BASIS_POINTS_TOTAL)).not.toThrow();
    expect(() => assertBasisPoints(12.5)).toThrow(RangeError);
    expect(() => assertBasisPoints(-1)).toThrow(RangeError);
    expect(() => assertBasisPoints(10_001)).toThrow(RangeError);
    expect(() => assertBasisPoints(Number.NaN)).toThrow(RangeError);
  });

  it("accepts only a complete 100% target allocation", () => {
    const sleeves = [{ targetBps: 2_500 }, { targetBps: 7_500 }];
    expect(sumWeightBps(sleeves)).toBe(10_000);
    expect(allocationWeightsAreComplete(sleeves)).toBe(true);
    expect(allocationWeightsAreComplete([{ targetBps: 9_999 }])).toBe(false);
  });

  it("calculates sleeve and portfolio stress contributions", () => {
    expect(calculateStressContributionBps(4_000, 5_000)).toBe(2_000);
    expect(
      calculatePortfolioStressLossBps([
        { targetBps: 4_000, assumedLossBps: 5_000 },
        { targetBps: 6_000, assumedLossBps: 1_000 },
      ]),
    ).toBe(2_600);
  });

  it("rounds once after summing unrounded sleeve contributions", () => {
    expect(calculateStressContributionBps(5_000, 1)).toBe(1);
    expect(
      calculatePortfolioStressLossBps([
        { targetBps: 5_000, assumedLossBps: 1 },
        { targetBps: 5_000, assumedLossBps: 1 },
      ]),
    ).toBe(1);
  });

  it("solves and caps a candidate position ceiling", () => {
    expect(calculateCandidateCeilingBps(200, 5_000)).toBe(400);
    expect(calculateCandidateCeilingBps(2_000, 1_000)).toBe(10_000);
    expect(() => calculateCandidateCeilingBps(200, 0)).toThrow(RangeError);
  });

  it("checks liquidity coverage without prescribing a universal reserve", () => {
    expect(isLiquidityCovered(1_500, 1_500)).toBe(true);
    expect(isLiquidityCovered(1_499, 1_500)).toBe(false);
  });

  it("reports duplicate IDs, invalid ranges, invalid values, and incomplete weights", () => {
    const issues = validateAllocationSleeves([
      { id: "growth", minBps: 5_000, targetBps: 4_000, maxBps: 6_000, assumedLossBps: 4_000 },
      { id: "growth", minBps: 0, targetBps: 5_999.5, maxBps: 6_000, assumedLossBps: 10_001 },
    ]);

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["duplicate-id", "invalid-range", "invalid-basis-points"]),
    );
  });

  it("accepts a well-formed allocation including zero and 100% boundaries", () => {
    expect(
      validateAllocationSleeves([
        { id: "cash", minBps: 0, targetBps: 0, maxBps: 1_000, assumedLossBps: 0 },
        {
          id: "portfolio",
          minBps: 9_000,
          targetBps: 10_000,
          maxBps: 10_000,
          assumedLossBps: 10_000,
        },
      ]),
    ).toEqual([]);
  });
});
