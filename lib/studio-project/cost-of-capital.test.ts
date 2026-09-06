import { describe, expect, it } from "vitest";
import {
  COST_OF_CAPITAL_SOURCE,
  costOfEquity,
  estimate,
  forIndustry,
  forSic,
  industryNames,
  weightedAverageCost,
} from "./cost-of-capital";
import data from "./data/cost-of-capital.json";

/**
 * The strongest test here is a round trip. The published cost of capital is not
 * recomputed from its parts anywhere in the ingestion — it is taken as given.
 * So rebuilding it from the recovered risk-free rate, the recovered premium,
 * each industry's beta, and its debt weights is a genuinely independent check
 * that the recovery was right. If Damodaran's method changes, this fails.
 */

describe("the recovered components", () => {
  it("rebuilds every published cost of equity from one rate and one premium", () => {
    const { impliedRiskFreeRate: rate, impliedEquityRiskPremium: premium } = COST_OF_CAPITAL_SOURCE;
    let worst = 0;
    for (const industry of data.industries) {
      worst = Math.max(worst, Math.abs(costOfEquity(industry.beta, rate, premium) - industry.costOfEquity));
    }
    // Beta is published to two decimals, so half a unit in the last place times
    // the premium is all that rounding alone can explain.
    expect(worst).toBeLessThanOrEqual(0.005 * premium * 1.15);
  });

  it("rebuilds every published cost of capital from the weighted parts", () => {
    let worst = 0;
    for (const industry of data.industries) {
      const rebuilt = weightedAverageCost(industry.costOfEquity, industry.afterTaxCostOfDebt, industry.debtWeight);
      worst = Math.max(worst, Math.abs(rebuilt - industry.costOfCapital));
    }
    expect(worst).toBeLessThan(0.0006); // under six hundredths of a point
  });

  it("recovered a rate and premium that are plausible rather than arbitrary", () => {
    // A sanity floor and ceiling. If the regression ever returns something
    // outside these, the recovery is wrong however small its residual.
    expect(COST_OF_CAPITAL_SOURCE.impliedRiskFreeRate).toBeGreaterThan(0);
    expect(COST_OF_CAPITAL_SOURCE.impliedRiskFreeRate).toBeLessThan(0.12);
    expect(COST_OF_CAPITAL_SOURCE.impliedEquityRiskPremium).toBeGreaterThan(0.02);
    expect(COST_OF_CAPITAL_SOURCE.impliedEquityRiskPremium).toBeLessThan(0.10);
  });
});

describe("estimating for an industry", () => {
  const semis = forIndustry("Semiconductor")!;

  it("returns the source's own figure when nothing is changed", () => {
    // A learner who accepts the default must see the published number, not an
    // approximation of it.
    const result = estimate(semis);
    expect(result.costOfCapital).toBe(semis.costOfCapital);
    expect(result.costOfEquity).toBe(semis.costOfEquity);
    expect(result.riskFreeRateReplaced).toBe(false);
  });

  it("reproduces the published figure even when the learner re-supplies the same rate", () => {
    // The rebuild path and the published path must agree, or changing the rate
    // by a hair would jump the answer for a reason unrelated to the change.
    const result = estimate(semis, COST_OF_CAPITAL_SOURCE.impliedRiskFreeRate);
    expect(result.riskFreeRateReplaced).toBe(true);
    expect(result.costOfCapital).toBeCloseTo(semis.costOfCapital, 3);
  });

  it("moves the answer when the government rate moves", () => {
    // Both rebuilt, so this measures the sensitivity rather than the step
    // between the published figure and the rebuilt one.
    const at = (rate: number) => estimate(semis, rate).costOfCapital;
    const base = COST_OF_CAPITAL_SOURCE.impliedRiskFreeRate;

    expect(at(base + 0.01)).toBeGreaterThan(at(base));
    // A point on the risk-free rate lifts the equity cost by a point, and the
    // whole cost by that point times the equity share of capital.
    expect(at(base + 0.01) - at(base)).toBeCloseTo(0.01 * (1 - semis.debtWeight), 9);
  });

  it("steps by less than a twentieth of a point between the published and rebuilt figures", () => {
    // The default shows the source's own number; changing the rate rebuilds it
    // from inputs rounded to two decimals. So there is a small discontinuity at
    // the moment a learner first touches the rate. Measured across every
    // industry rather than assumed small.
    let worst = 0;
    for (const industry of data.industries) {
      const published = estimate(industry).costOfCapital;
      const rebuilt = estimate(industry, COST_OF_CAPITAL_SOURCE.impliedRiskFreeRate).costOfCapital;
      worst = Math.max(worst, Math.abs(published - rebuilt));
    }
    expect(worst).toBeLessThan(0.0005);
  });

  it("says where every part of the number came from", () => {
    const result = estimate(semis);
    expect(result.provenance.join(" ")).toContain("Damodaran");
    expect(result.provenance.join(" ")).toContain("beta");
    // The undated vintage must reach the learner, not sit in a comment.
    expect(result.provenance.join(" ")).toContain("undated");
    expect(result.provenance.join(" ")).toContain("Treasury");
  });

  it("tells the learner it was rebuilt once they change the rate", () => {
    const result = estimate(semis, 0.045);
    expect(result.provenance.join(" ")).toContain("You supplied");
  });
});

describe("finding the right industry", () => {
  it("maps every industry Studio has already researched", () => {
    for (const [sic, expected] of Object.entries(data.sicToIndustry)) {
      const row = forSic(sic);
      expect(row, `SIC ${sic}`).not.toBeNull();
      expect(row!.industry).toBe(expected);
    }
  });

  it("offers the whole list for a company Studio has not researched", () => {
    const names = industryNames();
    expect(names.length).toBeGreaterThan(80);
    expect(names).toContain("Semiconductor");
    expect(names).toContain("Drugs (Pharmaceutical)");
    // Sorted, so a learner can find theirs.
    expect([...names].sort()).toEqual(names);
  });

  it("returns nothing rather than a market average for an unknown industry", () => {
    // Falling back to an average would hide that we do not know, and the spread
    // across industries is the whole reason a single number is not good enough.
    expect(forIndustry("Interstellar Freight")).toBeNull();
    expect(forSic("9999")).toBeNull();
  });

  it("spans a range wide enough that one number would not do", () => {
    const costs = data.industries.map((i) => i.costOfCapital);
    expect(Math.max(...costs) - Math.min(...costs)).toBeGreaterThan(0.03);
  });
});
