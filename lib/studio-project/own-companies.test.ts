import { describe, expect, it } from "vitest";
import { calculateStudio } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { createStudioProject } from "./create";
import { addInvestigatedCompany, saveInvestigation } from "./operations";
import { projectCatalog, projectToPlan, applyPlanChange } from "./workspace";
import { validateStudioProject } from "./validate";
import type { StudioProject } from "./schema";

/**
 * A company the learner found, held in the portfolio they are building.
 *
 * Studio could investigate any business and could hold any of eight, and those
 * were different sets — so reading an annual report ended on a screen the
 * portfolio could not see. These tests hold the bridge, and the thing that
 * makes it more than a stored name: that the portfolio actually computes with
 * it, and that the scenario test does not quietly leave it out of the fall.
 */

const T = "2026-09-08T10:00:00.000Z";

/** A project with one investigated company, added to the portfolio at 40%. */
function withOwnCompany(): { project: StudioProject; instrumentId: string } {
  let project = createStudioProject("practice", T);
  project = saveInvestigation(
    project,
    {
      company: "Nordic Pulp",
      sic: "",
      industry: "Paper/Forest Products",
      figures: { revenue: 4200, operatingProfit: 610 },
      riskFreePct: null,
    },
    "inv-nordic",
    T,
  );
  project = addInvestigatedCompany(project, "inv-nordic", "us-equity", T);
  const instrumentId = "own-inv-nordic";
  project = applyPlanChange(project, (plan) => ({
    ...plan,
    goal: { ...plan.goal, purpose: "A deposit", budget: 10_000, cashReserve: 0 },
    holdings: plan.holdings.map((holding) =>
      holding.instrumentId === instrumentId ? { ...holding, targetWeightPct: 100 } : holding,
    ),
  }));
  return { project, instrumentId };
}

describe("adding a company you investigated", () => {
  it("records the company, opens its research, and holds none of it yet", () => {
    const { project, instrumentId } = withOwnCompany();

    expect(project.instruments).toHaveLength(1);
    expect(project.instruments?.[0]).toMatchObject({
      id: instrumentId,
      name: "Nordic Pulp",
      assetClass: "us-equity",
      investigationId: "inv-nordic",
    });
    // The six steps ask why each holding is owned, so there has to be somewhere
    // to answer. How much to hold is a later, separate decision.
    expect(project.candidates.some((candidate) => candidate.instrumentId === instrumentId)).toBe(true);
    expect(validateStudioProject(project)).toEqual([]);
  });

  it("adds a position starting at nothing rather than guessing a weight", () => {
    let project = createStudioProject("practice", T);
    project = saveInvestigation(
      project,
      { company: "Nordic Pulp", sic: "", industry: "Paper/Forest Products", figures: {}, riskFreePct: null },
      "inv-nordic",
      T,
    );
    project = addInvestigatedCompany(project, "inv-nordic", "us-equity", T);
    const positions = project.alternatives[0].positions;
    expect(positions).toHaveLength(1);
    expect(positions[0].targetWeightPct).toBe(0);
  });

  it("adds the same company once, however many times it is asked", () => {
    let { project } = withOwnCompany();
    const before = JSON.stringify(project.instruments);
    project = addInvestigatedCompany(project, "inv-nordic", "us-equity", T);
    project = addInvestigatedCompany(project, "inv-nordic", "international-equity", T);
    expect(JSON.stringify(project.instruments)).toBe(before);
    expect(project.alternatives[0].positions).toHaveLength(1);
  });

  it("does nothing for an investigation that is missing or unnamed", () => {
    let project = createStudioProject("practice", T);
    expect(addInvestigatedCompany(project, "inv-nobody", "us-equity", T)).toBe(project);

    project = saveInvestigation(
      project,
      { company: "   ", sic: "", industry: "Paper/Forest Products", figures: {}, riskFreePct: null },
      "inv-blank",
      T,
    );
    // A nameless holding would appear in the portfolio as an empty row that
    // nothing could explain, so it is refused at the point of adding.
    expect(addInvestigatedCompany(project, "inv-blank", "us-equity", T).instruments ?? []).toEqual([]);
  });
});

describe("computing a portfolio that holds one", () => {
  it("is only possible against the catalogue the project carries", () => {
    const { project } = withOwnCompany();
    const plan = projectToPlan(project);

    /*
     * The discriminating pair. An unresolved holding does not fail loudly — the
     * calculator marks the whole plan invalid and every target, including the
     * ones it understood, drops to zero. So the bare catalogue is not merely
     * less complete here, it is wrong.
     */
    const withoutOwn = calculateStudio(plan, STUDIO_CATALOG);
    expect(withoutOwn.valid).toBe(false);
    expect(withoutOwn.rows[0].targetValue).toBe(0);

    const withOwn = calculateStudio(plan, projectCatalog(project));
    expect(withOwn.valid).toBe(true);
    expect(withOwn.totalWeightPct).toBe(100);
    expect(withOwn.rows[0].targetValue).toBe(10_000);
  });

  it("puts it in the scenario fall rather than treating it as immune", () => {
    const { project } = withOwnCompany();
    const calculation = calculateStudio(projectToPlan(project), projectCatalog(project));

    // An instrument whose class is unknown is dealt a zero shock, which is why
    // the class is asked for when the company is added. Zero here would mean a
    // portfolio reporting a smaller loss than it would actually take.
    expect(calculation.stress.changeDollars).toBe(-3_000);
    expect(calculation.stress.changePct).toBe(-30);
  });

  it("claims nothing about it that nobody established", () => {
    const { project, instrumentId } = withOwnCompany();
    const own = projectCatalog(project).find((instrument) => instrument.id === instrumentId)!;

    // Every one of these is an absence on purpose. A zero fee would read as
    // free, a reference price would be invented, and a risk list is quoted from
    // a filing in the catalogue or it is nothing.
    expect(own.expenseRatioPct).toBeNull();
    expect(own.referencePrice).toBeNull();
    expect(own.mainRisks).toEqual([]);
    expect(own.sources).toEqual([]);

    // The exposure is not empty, though: for one business there is exactly one
    // issuer to report, which is what makes an overlap check possible.
    expect(own.exposures).toEqual([{ label: "Nordic Pulp", weightPct: 100 }]);
    expect(own.exposureCoveragePct).toBe(100);
  });

  it("leaves the catalogue Studio researched untouched", () => {
    const { project } = withOwnCompany();
    const merged = projectCatalog(project);
    expect(merged).toHaveLength(STUDIO_CATALOG.length + 1);
    expect(merged.slice(0, STUDIO_CATALOG.length)).toEqual(STUDIO_CATALOG);
  });

  it("carries no companies for a project where none were added", () => {
    expect(projectCatalog(createStudioProject("practice", T))).toEqual(STUDIO_CATALOG);
  });
});
