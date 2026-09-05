import { describe, expect, it } from "vitest";
import {
  addStudioHolding,
  createStudioPlan,
  exportStudioJson,
  removeStudioHolding,
  updateStudioHolding,
} from "@/lib/studio";
import { migrateV1ToV2, readStudioRecord } from "./migrate";
import {
  addPosition,
  duplicateAlternative,
  rejectedCandidates,
  removePosition,
  setCandidateStatus,
  unheldCandidates,
  updateCandidate,
} from "./operations";
import { findCandidate, workingAlternative, type StudioProject } from "./schema";

/**
 * These tests exist to prove one thing above all: research survives.
 *
 * The v1 schema deleted a learner's investigation when they removed the holding
 * that carried it. Every assertion here about what remains after a removal would
 * have failed against v1, which is what makes them worth writing.
 */

const NOW = "2026-09-05T00:00:00.000Z";

/** A v1 plan with two researched holdings, as a learner would have left it. */
function v1WithResearch() {
  let plan = createStudioPlan("practice", NOW);
  plan = addStudioHolding(plan, "vti");
  plan = addStudioHolding(plan, "aapl");
  plan = updateStudioHolding(plan, "vti", {
    targetWeightPct: 60,
    research: { why: "Broad US market at low cost", mainRisk: "Falls with the whole market", whatWouldChangeMyMind: "A cheaper equivalent", reviewedSources: true },
  });
  plan = updateStudioHolding(plan, "aapl", {
    targetWeightPct: 40,
    research: { why: "I understand the products", mainRisk: "One company, one set of results", whatWouldChangeMyMind: "Losing pricing power", reviewedSources: false },
  });
  return plan;
}

function migrated(): StudioProject {
  const plan = v1WithResearch();
  const result = migrateV1ToV2(plan, exportStudioJson(plan), NOW);
  if (!result.ok) throw new Error(result.error);
  return result.project;
}

describe("v1 to v2 migration", () => {
  it("carries every holding across as a candidate and a position", () => {
    const project = migrated();
    expect(project.candidates).toHaveLength(2);
    expect(workingAlternative(project)?.positions).toHaveLength(2);
    expect(findCandidate(project, "aapl")?.why).toBe("I understand the products");
    expect(workingAlternative(project)?.positions.find((p) => p.instrumentId === "vti")?.targetWeightPct).toBe(60);
  });

  it("keeps the original record verbatim", () => {
    const plan = v1WithResearch();
    const raw = exportStudioJson(plan);
    const result = migrateV1ToV2(plan, raw, NOW);
    if (!result.ok) throw new Error(result.error);
    // Byte-for-byte, not an equivalent object. A migration bug must never be the
    // reason a learner cannot get their old record back.
    expect(result.project.migratedFrom?.raw).toBe(raw);
    expect(result.project.migratedFrom?.schemaVersion).toBe(1);
    expect(JSON.parse(result.project.migratedFrom!.raw).holdings).toHaveLength(2);
  });

  it("marks migrated candidates selected, and says why in its notes", () => {
    const plan = v1WithResearch();
    const result = migrateV1ToV2(plan, exportStudioJson(plan), NOW);
    if (!result.ok) throw new Error(result.error);
    // v1 had no way to record a rejection, so it cannot have held one.
    expect(result.project.candidates.every((c) => c.status === "selected")).toBe(true);
    expect(result.notes.join(" ")).toMatch(/could not record a rejection/i);
  });

  it("invents nothing v1 could not have held", () => {
    const project = migrated();
    for (const candidate of project.candidates) {
      expect(candidate.openQuestions).toEqual([]);
      expect(candidate.evidence).toEqual([]);
      expect(candidate.rejectedBecause).toBe("");
    }
    expect(project.decisions).toEqual([]);
  });

  it("refuses a newer schema and hands back the original", () => {
    const future = JSON.stringify({ schemaVersion: 99, anything: true });
    const result = readStudioRecord(future, NOW);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected refusal");
    expect(result.error).toMatch(/newer version/i);
    // Preserved exactly, so an older build cannot silently overwrite it.
    expect(result.preserved).toBe(future);
  });

  it("reads a v2 record without migrating it again", () => {
    const project = migrated();
    const result = readStudioRecord(JSON.stringify(project), NOW);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.error);
    expect(result.migrated).toBe(false);
  });

  it("reports unreadable input instead of throwing", () => {
    const result = readStudioRecord("{ not json", NOW);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.error).toMatch(/not a readable/i);
  });
});

describe("research survives", () => {
  it("v1 destroyed it — the behaviour this schema exists to change", () => {
    // Not a test of v2. It pins the old behaviour so the contrast below is a
    // demonstrated difference rather than a claim, and so anyone tempted to
    // reintroduce research-inside-holding can see what it cost.
    const plan = v1WithResearch();
    expect(plan.holdings.find((h) => h.instrumentId === "aapl")?.research.why).toBe(
      "I understand the products",
    );

    const afterRemoval = removeStudioHolding(plan, "aapl");

    expect(afterRemoval.holdings.find((h) => h.instrumentId === "aapl")).toBeUndefined();
    // There is nowhere else in a v1 plan for it to be. The research is gone.
    expect(JSON.stringify(afterRemoval)).not.toContain("I understand the products");
  });

  it("keeps the investigation when the position is removed", () => {
    // The v1 defect, directly. Under v1 this research was deleted.
    let project = migrated();
    expect(findCandidate(project, "aapl")?.why).toBe("I understand the products");

    project = removePosition(project, "aapl", undefined, NOW);

    expect(workingAlternative(project)?.positions.map((p) => p.instrumentId)).toEqual(["vti"]);
    const candidate = findCandidate(project, "aapl");
    expect(candidate).toBeDefined();
    expect(candidate?.why).toBe("I understand the products");
    expect(candidate?.mainRisk).toBe("One company, one set of results");
    expect(candidate?.whatWouldChangeMyMind).toBe("Losing pricing power");
  });

  it("keeps a rejection and its reason findable", () => {
    let project = migrated();
    project = removePosition(project, "aapl", undefined, NOW);
    project = setCandidateStatus(project, "aapl", "rejected", "Too much of the portfolio in one company", NOW);

    const rejected = rejectedCandidates(project);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].instrumentId).toBe("aapl");
    expect(rejected[0].rejectedBecause).toBe("Too much of the portfolio in one company");
    // And the original reasoning is still attached to it.
    expect(rejected[0].why).toBe("I understand the products");
  });

  it("finds candidates researched but held nowhere", () => {
    let project = migrated();
    project = removePosition(project, "aapl", undefined, NOW);
    expect(unheldCandidates(project).map((c) => c.instrumentId)).toEqual(["aapl"]);
  });

  it("does not treat holding something as having researched it", () => {
    let project = migrated();
    project = addPosition(project, "agg", undefined, NOW);
    // Added to the portfolio, but nothing has been investigated yet.
    expect(findCandidate(project, "agg")?.status).toBe("researching");
    expect(findCandidate(project, "agg")?.why).toBe("");
  });

  it("does not restart an investigation already under way", () => {
    let project = migrated();
    project = updateCandidate(project, "vti", { openQuestions: ["Does it hold the whole market?"] }, NOW);
    project = addPosition(project, "vti", undefined, NOW);
    expect(project.candidates.filter((c) => c.instrumentId === "vti")).toHaveLength(1);
    expect(findCandidate(project, "vti")?.openQuestions).toEqual(["Does it hold the whole market?"]);
  });
});

describe("alternatives", () => {
  it("shares research between alternatives rather than copying it", () => {
    let project = migrated();
    const original = workingAlternative(project)!.id;
    project = duplicateAlternative(project, original, "More bonds", NOW);

    expect(project.alternatives).toHaveLength(2);
    // Two alternatives, still one investigation per investment.
    expect(project.candidates).toHaveLength(2);
  });

  it("removing a position from one alternative leaves the other alone", () => {
    let project = migrated();
    const original = workingAlternative(project)!.id;
    project = duplicateAlternative(project, original, "More bonds", NOW);
    const copy = project.alternatives.find((a) => a.id !== original)!.id;

    project = removePosition(project, "aapl", copy, NOW);

    expect(project.alternatives.find((a) => a.id === copy)!.positions.map((p) => p.instrumentId)).toEqual(["vti"]);
    expect(project.alternatives.find((a) => a.id === original)!.positions.map((p) => p.instrumentId)).toEqual([
      "vti",
      "aapl",
    ]);
    expect(findCandidate(project, "aapl")?.why).toBe("I understand the products");
  });

  it("changing a position in a copy does not change the original", () => {
    let project = migrated();
    const original = workingAlternative(project)!.id;
    project = duplicateAlternative(project, original, "Experiment", NOW);
    const copy = project.alternatives.find((a) => a.id !== original)!.id;

    project = removePosition(project, "vti", copy, NOW);
    project = addPosition(project, "sgov", copy, NOW);

    expect(project.alternatives.find((a) => a.id === original)!.positions).toHaveLength(2);
    expect(project.alternatives.find((a) => a.id === copy)!.positions.map((p) => p.instrumentId)).toEqual([
      "aapl",
      "sgov",
    ]);
  });
});
