import { describe, expect, it } from "vitest";
import {
  calculateBufferedPrice,
  calculateGrowthValuation,
  calculateValueToPriceGap,
} from "./valuation-basics";

describe("valuation basics", () => {
  it("reproduces the source's neutral-growth valuation", () => {
    const result = calculateGrowthValuation({
      afterTaxOperatingIncome: 120,
      growthRate: 0.04,
      returnOnCapital: 0.1,
      costOfCapital: 0.1,
    });

    expect(result.reinvestmentRate).toBeCloseTo(0.4, 10);
    expect(result.cashFlowAfterReinvestment).toBeCloseTo(72, 10);
    expect(result.enterpriseValue).toBeCloseTo(1200, 10);
    expect(result.valueSpread).toBeCloseTo(0, 10);
  });

  it("shows value destruction when return on capital is below the cost of capital", () => {
    const result = calculateGrowthValuation({
      afterTaxOperatingIncome: 120,
      growthRate: 0.04,
      returnOnCapital: 0.08,
      costOfCapital: 0.1,
    });

    expect(result.reinvestmentRate).toBeCloseTo(0.5, 10);
    expect(result.cashFlowAfterReinvestment).toBeCloseTo(60, 10);
    expect(result.enterpriseValue).toBeCloseTo(1000, 10);
    expect(result.valueSpread).toBeCloseTo(-0.02, 10);
  });

  it("shows value creation when return on capital exceeds the cost of capital", () => {
    const result = calculateGrowthValuation({
      afterTaxOperatingIncome: 120,
      growthRate: 0.04,
      returnOnCapital: 0.12,
      costOfCapital: 0.1,
    });

    expect(result.reinvestmentRate).toBeCloseTo(1 / 3, 10);
    expect(result.cashFlowAfterReinvestment).toBeCloseTo(80, 10);
    expect(result.enterpriseValue).toBeCloseTo(1333.333333, 5);
    expect(result.valueSpread).toBeCloseTo(0.02, 10);
  });

  it("calculates the decision buffer and value-to-price gap", () => {
    expect(calculateBufferedPrice(1200, 0.2)).toBeCloseTo(960, 10);
    expect(calculateValueToPriceGap(1200, 1100)).toBeCloseTo(0.090909, 5);
  });

  it("rejects a growth rate that makes the perpetuity denominator invalid", () => {
    expect(() =>
      calculateGrowthValuation({
        afterTaxOperatingIncome: 120,
        growthRate: 0.1,
        returnOnCapital: 0.12,
        costOfCapital: 0.1,
      }),
    ).toThrow(/below cost of capital/i);
  });
});
