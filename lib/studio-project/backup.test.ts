import { describe, expect, it } from "vitest";
import { createStudioProject } from "./create";
import { exportProjectBackup, importProjectBackup } from "./backup";
import { addPosition, duplicateAlternative, removePosition, setCandidateStatus, updateCandidate } from "./operations";
import { validateStudioProject } from "./validate";
import { createStudioPlan, addStudioHolding, updateStudioHolding } from "@/lib/studio";

const NOW = "2026-09-05T00:00:00.000Z";
function researched() {
  let project = addPosition(createStudioProject("personal", NOW), "aapl", undefined, NOW);
  project = updateCandidate(project, "aapl", { why: "Pricing depends on repeat customers", openQuestions: ["Will customers replace devices less often?"], evidence: [{ id: "ev-1", sourceId: "filing-1", locator: "Risk factors", note: "Demand may slow", role: "challenges", savedAt: NOW }] }, NOW);
  project = duplicateAlternative(project, project.alternatives[0].id, "Comparison", NOW);
  project = removePosition(project, "aapl", project.alternatives[0].id, NOW);
  project = setCandidateStatus(project, "aapl", "rejected", "The price requires stronger growth", NOW);
  return project;
}

describe("v2 backup validation and recovery", () => {
  it("round-trips rejected research, evidence and alternative positions without replacing unknown quotes", () => {
    const project = researched();
    const backup = exportProjectBackup(project);
    if (!backup.ok) throw new Error(backup.error);
    const restored = importProjectBackup(backup.raw);
    if (!restored.ok) throw new Error(restored.error);
    expect(restored.project).toEqual(project);
    expect(restored.project.candidates[0].rejectedBecause).toBe("The price requires stronger growth");
    expect(restored.project.alternatives[0].positions).toEqual([]);
    expect(restored.project.alternatives[1].positions[0].quotePrice).toBeNull();
  });

  it.each([
    ["version tag only", { schemaVersion: 2 }],
    ["missing candidates", { ...researched(), candidates: null }],
    ["missing field", { ...researched(), rules: {} }],
    ["unsupported field", { ...researched(), futureResearch: "must survive" }],
    ["dangling selected alternative", { ...researched(), selectedAlternativeId: "missing" }],
    ["missing investment research", { ...researched(), candidates: [] }],
  ])("refuses %s and preserves the original text", (_name, project) => {
    const raw = JSON.stringify(project, null, 3);
    const result = importProjectBackup(raw);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.preserved).toBe(raw);
  });

  it("refuses repeated candidate/evidence identities and nested unknown fields", () => {
    const project = researched();
    project.candidates[0].evidence.push({ ...project.candidates[0].evidence[0] });
    expect(validateStudioProject(project).join(" ")).toMatch(/evidence reference/i);
    expect(validateStudioProject({ ...researched(), candidates: [{ ...researched().candidates[0], futureMeaning: true }] })).not.toEqual([]);
  });

  it("does not coerce null, strings or nonfinite values into money", () => {
    for (const budget of [null, "100", NaN, Infinity]) {
      const project = researched();
      expect(validateStudioProject({ ...project, goal: { ...project.goal, budget } })).not.toEqual([]);
    }
  });

  it("rejects impossible evidence dates and unsupported future versions", () => {
    const project = researched();
    project.candidates[0].evidence[0].savedAt = "2026-02-31T00:00:00Z";
    expect(validateStudioProject(project)).not.toEqual([]);
    const raw = '{ "schemaVersion": 500, "irreplaceable": "notes" }';
    const result = importProjectBackup(raw);
    expect(result).toMatchObject({ ok: false, preserved: raw });
  });

  it("retains the exact whitespace and contents of the original v1 through another backup", () => {
    let plan = addStudioHolding(createStudioPlan("personal", NOW), "aapl");
    plan = updateStudioHolding(plan, "aapl", { research: { why: "Original reasoning" } });
    const raw = `\n${JSON.stringify(plan, null, 4)}\n`;
    const migrated = importProjectBackup(raw, NOW);
    if (!migrated.ok) throw new Error(migrated.error);
    const backup = exportProjectBackup(migrated.project);
    if (!backup.ok) throw new Error(backup.error);
    const restored = importProjectBackup(backup.raw);
    if (!restored.ok) throw new Error(restored.error);
    expect(restored.project.migratedFrom?.raw).toBe(raw);
    expect(restored.project.candidates[0].why).toBe("Original reasoning");
  });
});
