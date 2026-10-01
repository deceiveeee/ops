import { describe, expect, it } from "vitest";
import { createStudioProject } from "./create";
import { emptyLimits, setLimits } from "./limits";
import { addPosition } from "./operations";
import { chooseWeightProposal, chosenBeforeChange, comparisonNeedsReview, saveWeightProposal } from "./portfolio-weights";
import { addScenario, FIRST_SCENARIO_ID, removeScenario, renameScenario, updateScenario } from "./scenarios";
import type { StudioProject } from "./schema";

const SAVED = "2026-09-25T12:00:00.000Z";
const CHOSEN = "2026-09-26T09:30:00.000Z";

/** Three holdings, a company cap and a capacity: enough for a proposal to be saved and chosen. */
function portfolio(): StudioProject {
  let project = createStudioProject("practice", SAVED);
  for (const id of ["aapl", "vti", "agg"]) project = addPosition(project, id, undefined, SAVED);
  return {
    ...project,
    goal: { ...project.goal, budget: 100_000, cashReserve: 20_000, lossTolerancePct: 20 },
    limits: { ...emptyLimits(), companyCapPct: 5, lossCapacityPct: 15 },
    alternatives: project.alternatives.map((alternative) => ({
      ...alternative, name: "Original allocation",
      positions: alternative.positions.map((position, index) => ({ ...position, targetWeightPct: [10, 50, 25][index] })),
    })),
  };
}

function chosen(): StudioProject {
  let project = portfolio();
  project = saveWeightProposal(project, project.alternatives[0].id,
    { name: "Lower company concentration", reasoning: "Apple down to the cap.", weights: { aapl: "6.25" }, valuationCaseIds: {} }, SAVED);
  return chooseWeightProposal(project, project.alternatives[1].id, "Keep one company under 5%.", CHOSEN);
}

describe("naming, on Goals, the chosen allocation a change predates", () => {
  it("says nothing while the goal, limits and scenario are what it was chosen under", () => {
    expect(chosenBeforeChange(chosen())).toBeNull();
  });

  it("names it, with the date it was chosen, once a limit changes", () => {
    const project = setLimits(chosen(), (limits) => ({ ...limits, companyCapPct: 4 }), "2026-09-28T00:00:00.000Z");
    expect(chosenBeforeChange(project)).toEqual({ name: "Lower company concentration", chosenAt: CHOSEN, changed: ["limits"] });
  });

  it("says which of the goal, the limits and the scenario changed, in that order", () => {
    let project = chosen();
    project = { ...project, stress: { ...project.stress, bondsPct: -15 } };
    expect(chosenBeforeChange(project)?.changed).toEqual(["scenario"]);
    project = { ...project, goal: { ...project.goal, lossTolerancePct: 25 } };
    project = setLimits(project, (limits) => ({ ...limits, fundCapPct: 40 }));
    expect(chosenBeforeChange(project)?.changed).toEqual(["goal", "limits", "scenario"]);
  });

  it("goes quiet again when the change is undone", () => {
    const changed = setLimits(chosen(), (limits) => ({ ...limits, companyCapPct: 4 }));
    const undone = setLimits(changed, (limits) => ({ ...limits, companyCapPct: 5 }));
    expect(chosenBeforeChange(undone)).toBeNull();
  });

  it("leaves alone an allocation nobody chose, which has no decision behind it", () => {
    // Saved as a proposal but never chosen: the original is still selected.
    let project = portfolio();
    project = saveWeightProposal(project, project.alternatives[0].id,
      { name: "Only a proposal", reasoning: "", weights: { aapl: "6.25" }, valuationCaseIds: {} }, SAVED);
    expect(chosenBeforeChange(setLimits(project, (limits) => ({ ...limits, companyCapPct: 4 })))).toBeNull();
    // The starting allocation was never compared or chosen either.
    expect(chosenBeforeChange(setLimits(portfolio(), (limits) => ({ ...limits, companyCapPct: 4 })))).toBeNull();
  });
});

/*
 * With several scenarios. Compare allocations and Goals share one rule, so a
 * change asks for a fresh proposal exactly when Goals names it; before, Goals
 * read only the first scenario and missed a change to any other.
 */
describe("the chosen allocation, with several scenarios", () => {
  const withSecond = () => {
    let project = addScenario(portfolio(), FIRST_SCENARIO_ID, SAVED, "second");
    project = saveWeightProposal(project, project.alternatives[0].id,
      { name: "Lower company concentration", reasoning: "Apple down to the cap.", weights: { aapl: "6.25" }, valuationCaseIds: {} }, SAVED);
    return chooseWeightProposal(project, project.alternatives[1].id, "Keep one company under 5%.", CHOSEN);
  };
  const selected = (project: StudioProject) => project.alternatives.find((item) => item.id === project.selectedAlternativeId)!;
  const agree = (project: StudioProject) => expect(chosenBeforeChange(project) !== null).toBe(comparisonNeedsReview(project, selected(project)));

  it("names a change to a scenario other than the first", () => {
    const project = updateScenario(withSecond(), "second", { bondsPct: -40 }, "2026-09-28T00:00:00.000Z");
    expect(chosenBeforeChange(project)?.changed).toEqual(["scenario"]);
    expect(comparisonNeedsReview(project, selected(project))).toBe(true);
  });

  it("names a scenario added or removed since", () => {
    const added = addScenario(chosen(), FIRST_SCENARIO_ID, "2026-09-28T00:00:00.000Z", "later");
    expect(chosenBeforeChange(added)?.changed).toEqual(["scenario"]);
    expect(chosenBeforeChange(removeScenario(withSecond(), "second", "2026-09-28T00:00:00.000Z"))?.changed).toEqual(["scenario"]);
  });

  it("does not count a renamed scenario, which changes no figure", () => {
    let project = renameScenario(withSecond(), "second", "Rates rise", "2026-09-28T00:00:00.000Z");
    project = renameScenario(project, FIRST_SCENARIO_ID, "Stocks fall", "2026-09-28T00:00:00.000Z");
    expect(chosenBeforeChange(project)).toBeNull();
    expect(comparisonNeedsReview(project, selected(project))).toBe(false);
  });

  it("agrees with Compare allocations after every kind of change", () => {
    const at = "2026-09-28T00:00:00.000Z";
    const cases: StudioProject[] = [
      withSecond(),
      updateScenario(withSecond(), FIRST_SCENARIO_ID, { usStocksPct: -45 }, at),
      updateScenario(withSecond(), "second", { cashPct: -2 }, at),
      renameScenario(withSecond(), "second", "Rates rise", at),
      addScenario(withSecond(), "second", at, "third"),
      removeScenario(withSecond(), FIRST_SCENARIO_ID, at),
      setLimits(withSecond(), (limits) => ({ ...limits, companyCapPct: 4 }), at),
      { ...withSecond(), goal: { ...withSecond().goal, lossTolerancePct: 25 } },
    ];
    cases.forEach(agree);
  });
});
