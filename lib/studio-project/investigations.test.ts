import { describe, expect, it } from "vitest";
import { createStudioProject } from "./create";
import { readStudioRecord } from "./migrate";
import { removeInvestigation, saveInvestigation } from "./operations";
import { latestInvestigation, type StudioProject } from "./schema";
import { validateStudioProject } from "./validate";

const T1 = "2026-09-07T10:00:00.000Z";
const T2 = "2026-09-07T11:00:00.000Z";
const T3 = "2026-09-07T12:00:00.000Z";

const EDIT = {
  company: "Ampere Instruments",
  sic: "3674",
  figures: { revenue: 4200, operatingProfit: 610 },
  riskFreePct: null,
};

const fresh = () => createStudioProject("personal", T1);

describe("saving a company investigation", () => {
  it("starts a project with none, which is not the same as broken", () => {
    const project = fresh();
    expect(project.investigations).toEqual([]);
    expect(validateStudioProject(project)).toEqual([]);
    expect(latestInvestigation(project)).toBeUndefined();
  });

  it("keeps the figures the learner entered, and stays valid", () => {
    const project = saveInvestigation(fresh(), EDIT, undefined, T2);
    expect(project.investigations).toHaveLength(1);
    expect(project.investigations[0]).toMatchObject({
      company: "Ampere Instruments",
      sic: "3674",
      figures: { revenue: 4200, operatingProfit: 610 },
      riskFreePct: null,
    });
    expect(validateStudioProject(project)).toEqual([]);
  });

  /**
   * The point of the whole exercise: the learner comes back and the work is
   * still there, on the record that was touched most recently.
   */
  it("reopens the most recently touched investigation, not the newest", () => {
    let project = saveInvestigation(fresh(), EDIT, undefined, T1);
    const firstId = project.investigations[0].id;
    project = saveInvestigation(project, { ...EDIT, company: "Second" }, undefined, T2);
    expect(latestInvestigation(project)?.company).toBe("Second");

    // Going back to the older company makes it the one in hand again.
    project = saveInvestigation(project, { ...EDIT, company: "Ampere Instruments" }, firstId, T3);
    expect(latestInvestigation(project)?.id).toBe(firstId);
  });

  it("edits in place rather than accumulating a record per keystroke", () => {
    let project = saveInvestigation(fresh(), EDIT, undefined, T1);
    const id = project.investigations[0].id;
    project = saveInvestigation(project, { ...EDIT, figures: { revenue: 4300 } }, id, T2);
    project = saveInvestigation(project, { ...EDIT, figures: { revenue: 4350 } }, id, T3);
    expect(project.investigations).toHaveLength(1);
    expect(project.investigations[0].figures).toEqual({ revenue: 4350 });
  });

  /**
   * Merging would make a deleted figure impossible to delete. A learner who
   * realises they read the wrong line needs the number to actually go away.
   */
  it("lets a figure be cleared, rather than merging the old value back in", () => {
    let project = saveInvestigation(fresh(), EDIT, undefined, T1);
    const id = project.investigations[0].id;
    project = saveInvestigation(project, { ...EDIT, figures: { revenue: 4200 } }, id, T2);
    expect(project.investigations[0].figures).toEqual({ revenue: 4200 });
    expect(project.investigations[0].figures.operatingProfit).toBeUndefined();
  });

  it("keeps when the work began across a rewrite", () => {
    let project = saveInvestigation(fresh(), EDIT, undefined, T1);
    const id = project.investigations[0].id;
    project = saveInvestigation(project, { ...EDIT, company: "Renamed" }, id, T3);
    expect(project.investigations[0].createdAt).toBe(T1);
    expect(project.investigations[0].updatedAt).toBe(T3);
  });

  it("keeps a supplied risk-free rate as typed, and tells zero from unset", () => {
    const supplied = saveInvestigation(fresh(), { ...EDIT, riskFreePct: 0 }, undefined, T2);
    expect(supplied.investigations[0].riskFreePct).toBe(0);
    expect(validateStudioProject(supplied)).toEqual([]);

    const unset = saveInvestigation(fresh(), { ...EDIT, riskFreePct: null }, undefined, T2);
    expect(unset.investigations[0].riskFreePct).toBeNull();
  });

  it("removes one company without touching anything else", () => {
    let project = saveInvestigation(fresh(), EDIT, undefined, T1);
    const id = project.investigations[0].id;
    project = saveInvestigation(project, { ...EDIT, company: "Kept" }, undefined, T2);
    project = removeInvestigation(project, id, T3);
    expect(project.investigations.map((item) => item.company)).toEqual(["Kept"]);
    expect(validateStudioProject(project)).toEqual([]);
  });
});

describe("validating a stored investigation", () => {
  const withInvestigation = (patch: Record<string, unknown>) => {
    const project = saveInvestigation(fresh(), EDIT, undefined, T2) as unknown as {
      investigations: Record<string, unknown>[];
    };
    project.investigations[0] = { ...project.investigations[0], ...patch };
    return validateStudioProject(project);
  };

  /**
   * A key Studio does not recognise would be silently ignored on read, which is
   * the quiet data loss this schema exists to prevent.
   */
  it("refuses a figure name Studio does not ask for", () => {
    expect(withInvestigation({ figures: { ebitda: 900 } })).not.toEqual([]);
  });

  it("refuses a figure that is not a finite number", () => {
    expect(withInvestigation({ figures: { revenue: "4200" } })).not.toEqual([]);
    expect(withInvestigation({ figures: { revenue: Number.NaN } })).not.toEqual([]);
  });

  it("refuses a risk-free rate that is neither a number nor null", () => {
    expect(withInvestigation({ riskFreePct: "3.9" })).not.toEqual([]);
  });

  it("refuses two investigations sharing an id", () => {
    let project = saveInvestigation(fresh(), EDIT, undefined, T1);
    project = saveInvestigation(project, { ...EDIT, company: "Other" }, undefined, T2);
    const collided = {
      ...project,
      investigations: project.investigations.map((item) => ({ ...item, id: "inv-same" })),
    };
    expect(validateStudioProject(collided)).not.toEqual([]);
  });
});

/**
 * Figure investigations were added after v2 shipped, so records already saved in
 * a learner's browser have no such field. Refusing those would destroy exactly
 * the work this feature exists to protect.
 */
describe("reading a project saved before investigations existed", () => {
  const priorRecord = () => {
    const project = fresh() as Partial<StudioProject>;
    delete project.investigations;
    return JSON.stringify(project);
  };

  it("is still accepted, and gains an empty list rather than being refused", () => {
    const result = readStudioRecord(priorRecord(), T2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.investigations).toEqual([]);
    // Nothing was migrated: the schema version did not change, only a default.
    expect(result.migrated).toBe(false);
  });

  it("leaves an existing list alone", () => {
    const saved = saveInvestigation(fresh(), EDIT, undefined, T2);
    const result = readStudioRecord(JSON.stringify(saved), T3);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.project.investigations).toHaveLength(1);
    expect(result.project.investigations[0].company).toBe("Ampere Instruments");
  });
});
