import { describe, expect, it } from "vitest";
import { addStudioHolding, updateStudioHolding } from "@/lib/studio";
import { createStudioProject } from "./create";
import { migrateV1ToV2 } from "./migrate";
import { addPosition, removePosition, setCandidateStatus } from "./operations";
import { candidateStanding } from "./schema";
import { applyPlanChange, exportProjectText } from "./workspace";
import type { StudioProject } from "./schema";

/**
 * What a candidate's record says about it, against what is true.
 *
 * The stored status was never maintained. Every candidate began `researching`
 * and nothing moved it on, so an investment owned outright and fully weighted
 * still described itself as under investigation — in the plan a learner
 * downloads to explain their decisions to someone else. The migration ran the
 * other way and marked everything it carried `selected`, which then survived
 * the learner removing it.
 */

const T = "2026-09-08T10:00:00.000Z";

const V1_PLAN = {
  schemaVersion: 1 as const,
  id: "plan-legacy",
  createdAt: T,
  updatedAt: T,
  mode: "practice" as const,
  name: "My practice portfolio",
  goal: {
    purpose: "A deposit", horizonYears: 8, budget: 10_000, cashReserve: 0,
    monthlyContribution: 0, accountType: "taxable" as const, lossTolerancePct: 20, constraints: "",
  },
  holdings: [
    {
      instrumentId: "aapl", targetWeightPct: 100, currentValue: 0,
      research: { why: "It earns more than its capital costs.", mainRisk: "", whatWouldChangeMyMind: "", reviewedSources: false },
      quotePrice: null, quoteAsOf: "", quantityMode: "whole" as const, accruedInterestPer100: null, tradeFee: 0,
    },
  ],
  currentCash: 0,
  contributionAmount: 0,
  rules: { reviewFrequency: "quarterly" as const, driftThresholdPct: 5, contributionRule: "", sellRule: "", guardrails: "" },
  stress: { usStocksPct: -30, internationalStocksPct: -30, globalStocksPct: -30, bondsPct: -10, cashPct: 0 },
};

/** A project carried over from v1, where every holding was marked selected. */
function migrated(): StudioProject {
  const result = migrateV1ToV2(V1_PLAN, JSON.stringify(V1_PLAN), T);
  if (!result.ok) throw new Error(result.error);
  return result.project;
}

describe("where a candidate stands", () => {
  it("says an investment in the portfolio is in the portfolio", () => {
    const project = addPosition(createStudioProject("practice", T), "aapl", undefined, T);
    // Stored as researching by startCandidate, and nothing has ever moved it on.
    expect(project.candidates[0].status).toBe("researching");
    // What is true is read from the portfolio, which is where it is knowable.
    expect(candidateStanding(project, "aapl")).toBe("selected");
  });

  it("stops calling something selected once it is no longer held", () => {
    const project = removePosition(migrated(), "aapl", undefined, T);
    expect(project.candidates[0].status).toBe("selected");
    expect(candidateStanding(project, "aapl")).not.toBe("selected");
  });

  it("does not read a removed holding as a decision against it", () => {
    /*
     * The trap this exists to avoid. It was in, it is out, and the shapes match
     * a rejection — but the learner never said so. They may have removed it by
     * accident, or to add it back at a different weight, or the migration may
     * have assumed it. "Decided against" would be a judgement with their name
     * on it that they did not make.
     */
    const project = removePosition(migrated(), "aapl", undefined, T);
    expect(candidateStanding(project, "aapl")).toBe("researching");
  });

  it("says decided against only where the learner said so", () => {
    const project = setCandidateStatus(removePosition(migrated(), "aapl", undefined, T), "aapl", "rejected", "Too much in one company", T);
    expect(candidateStanding(project, "aapl")).toBe("rejected");
  });

  it("keeps a decision against something visible even while it is held", () => {
    // Holding it wins, because being held is a fact and the plan has to describe
    // the portfolio that exists. The reason stays on the record either way.
    const project = setCandidateStatus(addPosition(createStudioProject("practice", T), "aapl", undefined, T), "aapl", "rejected", "Changed my mind", T);
    expect(candidateStanding(project, "aapl")).toBe("selected");
    expect(project.candidates[0].rejectedBecause).toBe("Changed my mind");
  });

  it("treats an investment never looked at as still being looked into", () => {
    expect(candidateStanding(createStudioProject("practice", T), "vxus")).toBe("researching");
  });
});

describe("the plan a learner downloads", () => {
  it("no longer files a fully weighted holding as under investigation", () => {
    const text = exportProjectText(migrated());
    expect(text).toContain("Apple Inc. — in the portfolio");
    expect(text).not.toContain("researching");
  });

  it("prints only the lines that have something in them", () => {
    const text = exportProjectText(migrated());
    // Both were printed against every candidate and neither could ever be
    // filled, so they read as a form somebody failed to complete.
    expect(text).not.toContain("Open questions:");
    expect(text).not.toContain("Reason decided against:");
    expect(text).toContain("Why: It earns more than its capital costs.");
  });

  it("gives the reason once a decision against it is recorded", () => {
    const project = setCandidateStatus(removePosition(migrated(), "aapl", undefined, T), "aapl", "rejected", "Too much in one company", T);
    const text = exportProjectText(project);
    expect(text).toContain("Apple Inc. — decided against");
    expect(text).toContain("Reason decided against: Too much in one company");
  });
});

describe("editing a holding and its research together", () => {
  it("keeps research written in the same change as the holding it belongs to", () => {
    /*
     * The interface adds a holding and writes its reason as two separate saves,
     * so this never showed. Anything shaped like "decide against this, and here
     * is why" does both at once and would have lost the reason.
     */
    const project = applyPlanChange(createStudioProject("practice", T), (plan) =>
      updateStudioHolding(addStudioHolding(plan, "aapl"), "aapl", {
        research: { why: "It earns more than its capital costs.", mainRisk: "One product line carries the profit." },
      }),
    );
    expect(project.candidates[0]).toMatchObject({
      why: "It earns more than its capital costs.",
      mainRisk: "One product line carries the profit.",
    });
  });

  it("still refuses to wipe an investigation with a blank one", () => {
    // The rule the old guard was protecting, kept. A holding arrives from
    // `addStudioHolding` with empty research; writing it over real notes would
    // delete work the learner cannot get back.
    let project = applyPlanChange(createStudioProject("practice", T), (plan) =>
      updateStudioHolding(addStudioHolding(plan, "aapl"), "aapl", {
        research: { why: "Worth owning", mainRisk: "Concentration" },
      }),
    );
    project = removePosition(project, "aapl", undefined, T);
    project = applyPlanChange(project, (plan) => addStudioHolding(plan, "aapl"));
    expect(project.candidates[0]).toMatchObject({ why: "Worth owning", mainRisk: "Concentration" });
  });
});
