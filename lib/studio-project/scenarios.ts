import type { StudioProject, StudioScenario, StudioStress } from "./schema";

/**
 * Several hypothetical scenarios, checked together.
 *
 * The first scenario is the project's original `stress`, so work saved before
 * there could be more than one reads unchanged. Every scenario is the
 * learner's own assumption: none is a forecast, a probability, or the worst
 * that could happen, and Studio supplies no scenario magnitudes of its own.
 */
export const FIRST_SCENARIO_ID = "first";
export const MAX_SCENARIOS = 5;
export const MAX_SCENARIO_NAME = 60;

type ScenarioProject = Pick<StudioProject, "stress" | "scenarioName" | "scenarios">;

/** Every scenario, first included, with the name to show for each. */
export function readScenarios(project: ScenarioProject): StudioScenario[] {
  const all = [{ id: FIRST_SCENARIO_ID, name: project.scenarioName ?? "", stress: project.stress }, ...(project.scenarios ?? [])];
  return all.map((scenario, index) => ({ ...scenario, name: scenario.name.trim() || `Scenario ${index + 1}` }));
}

const makeId = () => `scenario-${crypto.randomUUID()}`;

/** A new scenario starts as a copy of one the learner already set; Studio never picks the numbers. */
export function addScenario<T extends ScenarioProject>(project: T, copyOf: string, now: string, id = makeId()): T & { updatedAt: string } {
  const all = readScenarios(project);
  if (all.length >= MAX_SCENARIOS) throw new Error(`You can compare up to ${MAX_SCENARIOS} scenarios.`);
  const source = all.find((scenario) => scenario.id === copyOf) ?? all[0];
  return { ...project, updatedAt: now, scenarios: [...(project.scenarios ?? []), { id, name: "", stress: { ...source.stress } }] };
}

export function updateScenario<T extends ScenarioProject>(project: T, id: string, patch: Partial<StudioStress>, now: string): T & { updatedAt: string } {
  if (id === FIRST_SCENARIO_ID) return { ...project, updatedAt: now, stress: { ...project.stress, ...patch } };
  if (!(project.scenarios ?? []).some((scenario) => scenario.id === id)) throw new Error("That scenario is no longer available.");
  return { ...project, updatedAt: now, scenarios: project.scenarios!.map((scenario) => scenario.id === id ? { ...scenario, stress: { ...scenario.stress, ...patch } } : scenario) };
}

export function renameScenario<T extends ScenarioProject>(project: T, id: string, name: string, now: string): T & { updatedAt: string } {
  if (name.length > MAX_SCENARIO_NAME) throw new Error(`Keep a scenario name to ${MAX_SCENARIO_NAME} characters.`);
  if (id === FIRST_SCENARIO_ID) return { ...project, updatedAt: now, scenarioName: name };
  if (!(project.scenarios ?? []).some((scenario) => scenario.id === id)) throw new Error("That scenario is no longer available.");
  return { ...project, updatedAt: now, scenarios: project.scenarios!.map((scenario) => scenario.id === id ? { ...scenario, name } : scenario) };
}

/** Removing the first promotes the next, so there is always exactly one `stress`. */
export function removeScenario<T extends ScenarioProject>(project: T, id: string, now: string): T & { updatedAt: string } {
  const others = project.scenarios ?? [];
  if (!others.length) throw new Error("Keep at least one scenario.");
  if (id === FIRST_SCENARIO_ID) {
    const [next, ...rest] = others;
    return { ...project, updatedAt: now, stress: { ...next.stress }, scenarioName: next.name, scenarios: rest };
  }
  if (!others.some((scenario) => scenario.id === id)) throw new Error("That scenario is no longer available.");
  return { ...project, updatedAt: now, scenarios: others.filter((scenario) => scenario.id !== id) };
}
