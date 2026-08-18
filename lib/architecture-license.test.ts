import { describe, expect, it } from "vitest";
import {
  evaluateEdgeLicense,
  evaluatePassiveOnly,
  lossContributionPct,
  netEdgePct,
  type EdgeProposal,
  type GateCode,
  type InheritedContext,
} from "./architecture-license";

/** A proposal that clears every gate. Individual tests break one thing at a time. */
function validProposal(overrides: Partial<EdgeProposal> = {}): EdgeProposal {
  return {
    replacesExposure: "Part of the Grow sleeve",
    benchmark: "Total world equity index, net of fees",
    pocket: "Small industrials that no analyst covers after a spin-off",
    whoIsWrong: "Index funds must sell the spun-off stub regardless of its price",
    correctionMechanism: "Forced selling ends and coverage resumes within a year",
    horizonMonths: 12,
    capability: "I can read the parent filing and hold through the forced-selling window",
    falsifiableClaim: "Spin-off stubs beat the index by 4 points in the year after listing",
    disconfirming: "Two years of stubs failing to beat the index after costs",
    grossEdgePct: 4,
    durabilityRisk: "More funds run this, and the forced-selling window narrows",
    thesisBreak: "Coverage resumes immediately at listing, so the window closes",
    reviewDate: "2027-08-14",
    allocationPct: 10,
    ...overrides,
  };
}

function validContext(overrides: Partial<InheritedContext> = {}): InheritedContext {
  return {
    frictionPct: 1.2,
    frictionSaved: true,
    evidenceDesign: "Portfolio study — my claim is about a characteristic",
    evidenceHoldout: "Both a different period and a different universe",
    evidenceSampling: "Form the sample from what existed at the start, failures included",
    maxSleevePct: 15,
    assumedSleeveLossPct: 40,
    lossBudgetPct: 6,
    hasValuationRange: true,
    ...overrides,
  };
}

const codes = (unmet: { code: GateCode }[]) => unmet.map((gate) => gate.code);

describe("net edge arithmetic", () => {
  it("subtracts the learner's own friction from the gross claim", () => {
    expect(netEdgePct(4, 1.2)).toBe(2.8);
  });

  it("goes negative when friction exceeds the claimed edge", () => {
    expect(netEdgePct(0.8, 1.2)).toBe(-0.4);
  });

  it("does not accumulate floating-point drift", () => {
    expect(netEdgePct(0.3, 0.1)).toBe(0.2);
  });
});

describe("loss contribution", () => {
  it("is weight times assumed loss on the sleeve", () => {
    expect(lossContributionPct(10, 40)).toBe(4);
    expect(lossContributionPct(20, 40)).toBe(8);
  });
});

describe("evaluateEdgeLicense", () => {
  it("licenses a proposal that clears every gate", () => {
    const result = evaluateEdgeLicense(validProposal(), validContext());
    expect(result.unmet).toEqual([]);
    expect(result.licensed).toBe(true);
    expect(result.netEdgePct).toBe(2.8);
    expect(result.lossContributionPct).toBe(4);
  });

  /**
   * The rule the whole module exists for. A proposal carrying one spectacular
   * number and nothing else must stay disabled, and must be told every reason.
   */
  it("refuses to let a single impressive number unlock a sleeve", () => {
    const result = evaluateEdgeLicense(
      {
        ...validProposal(),
        grossEdgePct: 40,
        pocket: "",
        whoIsWrong: "",
        correctionMechanism: "",
        capability: "",
        falsifiableClaim: "",
        disconfirming: "",
        thesisBreak: "",
        reviewDate: "",
        benchmark: "",
        replacesExposure: "",
      },
      validContext(),
    );

    expect(result.licensed).toBe(false);
    expect(result.netEdgePct).toBe(38.8);
    expect(codes(result.unmet)).toEqual(
      expect.arrayContaining([
        "benchmark-undefined",
        "no-specific-pocket",
        "no-correction-mechanism",
        "no-capability",
        "not-falsifiable",
        "no-thesis-break",
        "no-review-date",
      ]),
    );
  });

  /**
   * Reporting only the first failure would let the UI hide conditions behind
   * each other, so the learner repairs one, is refused again, and never sees
   * the shape of what a licence actually requires.
   */
  it("reports every unmet gate rather than stopping at the first", () => {
    const result = evaluateEdgeLicense(
      { ...validProposal(), pocket: "", capability: "", reviewDate: "" },
      validContext(),
    );
    expect(codes(result.unmet)).toEqual([
      "no-specific-pocket",
      "no-capability",
      "no-review-date",
    ]);
  });

  it("rejects a claim the learner cannot keep after their own friction", () => {
    const result = evaluateEdgeLicense(
      validProposal({ grossEdgePct: 0.8 }),
      validContext({ frictionPct: 1.2 }),
    );
    expect(result.netEdgePct).toBe(-0.4);
    expect(codes(result.unmet)).toContain("net-edge-not-positive");
    expect(result.licensed).toBe(false);
  });

  it("treats a net edge of exactly zero as no edge", () => {
    const result = evaluateEdgeLicense(
      validProposal({ grossEdgePct: 1.2 }),
      validContext({ frictionPct: 1.2 }),
    );
    expect(result.netEdgePct).toBe(0);
    expect(codes(result.unmet)).toContain("net-edge-not-positive");
  });

  it("blocks a sleeve larger than mission 5's ceiling", () => {
    const result = evaluateEdgeLicense(
      validProposal({ allocationPct: 20 }),
      validContext({ maxSleevePct: 15, lossBudgetPct: 99 }),
    );
    expect(codes(result.unmet)).toContain("exceeds-sleeve-ceiling");
  });

  /**
   * Planted defect: everything else is valid, and only the loss budget is
   * breached. If the evaluator ever stops charging weight x assumed loss
   * against mission 5's budget, this goes green and the sizing gate is gone.
   */
  it("blocks a sleeve whose stressed loss breaches the budget, with all else valid", () => {
    const result = evaluateEdgeLicense(
      validProposal({ allocationPct: 15 }),
      validContext({ maxSleevePct: 15, assumedSleeveLossPct: 40, lossBudgetPct: 5 }),
    );
    expect(result.lossContributionPct).toBe(6);
    expect(codes(result.unmet)).toEqual(["exceeds-loss-budget"]);
    expect(result.licensed).toBe(false);
  });

  it("requires the mission 9 checklist before any claim can be tested", () => {
    const result = evaluateEdgeLicense(
      validProposal(),
      validContext({ evidenceHoldout: "" }),
    );
    expect(codes(result.unmet)).toContain("evidence-design-missing");
  });

  it("requires a saved friction budget rather than a defaulted one", () => {
    const result = evaluateEdgeLicense(
      validProposal(),
      validContext({ frictionSaved: false }),
    );
    expect(codes(result.unmet)).toContain("friction-unknown");
  });

  it("requires a mission 7 valuation range to be wrong about", () => {
    const result = evaluateEdgeLicense(
      validProposal(),
      validContext({ hasValuationRange: false }),
    );
    expect(codes(result.unmet)).toContain("no-valuation-range");
  });

  it("does not accept a mispricing story too thin to be a claim", () => {
    const result = evaluateEdgeLicense(
      validProposal({ pocket: "stocks are wrong", whoIsWrong: "the market" }),
      validContext(),
    );
    expect(codes(result.unmet)).toContain("no-specific-pocket");
  });

  it("does not accept a correction mechanism with no horizon", () => {
    const result = evaluateEdgeLicense(
      validProposal({ horizonMonths: 0 }),
      validContext(),
    );
    expect(codes(result.unmet)).toContain("no-correction-mechanism");
  });

  it("names the mission each unmet gate came from", () => {
    const result = evaluateEdgeLicense(
      validProposal({ grossEdgePct: 0 }),
      validContext({ frictionSaved: false, hasValuationRange: false }),
    );
    const from = Object.fromEntries(result.unmet.map((gate) => [gate.code, gate.from]));
    expect(from["friction-unknown"]).toBe("mission-8");
    expect(from["no-valuation-range"]).toBe("mission-7");
    expect(from["net-edge-not-positive"]).toBe("mission-8");
  });
});

describe("evaluatePassiveOnly", () => {
  it("is a complete outcome needing only a core, a benchmark and a review date", () => {
    const result = evaluatePassiveOnly(
      "Total world equity",
      "Total world equity index, net of fees",
      "2027-08-14",
    );
    expect(result).toEqual({ licensed: true, unmet: [] });
  });

  it("never asks a passive learner for an edge claim", () => {
    const result = evaluatePassiveOnly("", "", "");
    expect(codes(result.unmet)).toEqual(["benchmark-undefined", "no-review-date"]);
  });
});
