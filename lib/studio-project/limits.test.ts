import { describe, expect, it } from "vitest";
import { exportProjectBackup, importProjectBackup } from "./backup";
import { createStudioProject } from "./create";
import { checkTargets, emptyLimits, hasAnyLimit, lossBudget, readLimits, setLimits, validLimits, type StudioLimits } from "./limits";
import { validateStudioProject } from "./validate";
import { applyPlanChange } from "./workspace";

const NOW = "2026-09-24T00:00:00.000Z";

const filled = (): StudioLimits => ({
  cashNeeds: [{ id: "need-tuition", label: "Tuition", amount: 8000, dueDate: "2028-03-01" }],
  lossCapacityPct: 15,
  slices: {
    ready: { minPct: 10, targetPct: 20, maxPct: 25 },
    steady: { minPct: 20, targetPct: 25, maxPct: 30 },
    grow: { minPct: 50, targetPct: 55, maxPct: 65 },
  },
  companyCapPct: 5,
  fundCapPct: 40,
});

describe("goals and limits as saved numbers", () => {
  it("opens work saved before limits existed with every limit unset, and adds nothing to it", () => {
    const project = createStudioProject("practice", NOW);
    expect(project.limits).toBeUndefined();
    expect(validateStudioProject(project)).toEqual([]);
    expect(readLimits(project)).toEqual(emptyLimits());
    expect(hasAnyLimit(project.limits)).toBe(false);
    const backup = exportProjectBackup(project);
    if (!backup.ok) throw new Error(backup.error);
    expect(backup.raw).not.toContain("limits");
  });

  it("starts every limit unset, with no suggested numbers", () => {
    const limits = emptyLimits();
    expect(limits.cashNeeds).toEqual([]);
    expect([limits.lossCapacityPct, limits.companyCapPct, limits.fundCapPct]).toEqual([null, null, null]);
    for (const slice of Object.values(limits.slices)) expect(slice).toEqual({ minPct: null, targetPct: null, maxPct: null });
  });

  it("saves limits and brings them back from a backup unchanged", () => {
    const project = setLimits(createStudioProject("personal", NOW), () => filled(), NOW);
    expect(hasAnyLimit(project.limits)).toBe(true);
    expect(validateStudioProject(project)).toEqual([]);
    const backup = exportProjectBackup(project);
    if (!backup.ok) throw new Error(backup.error);
    const restored = importProjectBackup(backup.raw);
    if (!restored.ok) throw new Error(restored.error);
    expect(restored.project).toEqual(project);
  });

  it("keeps limits when the goal or a weight is edited through the portfolio form", () => {
    const project = setLimits(createStudioProject("practice", NOW), () => filled(), NOW);
    const next = applyPlanChange(project, (plan) => ({ ...plan, goal: { ...plan.goal, horizonYears: 9 } }));
    expect(next.goal.horizonYears).toBe(9);
    expect(next.limits).toEqual(project.limits);
  });

  it("keeps half-finished limits as typed rather than refusing the save", () => {
    const limits = filled();
    // A minimum above its target, mid-edit; a bill with no name, amount or date yet.
    limits.slices.grow = { minPct: 60, targetPct: 55, maxPct: null };
    limits.cashNeeds.push({ id: "need-new", label: "", amount: 0, dueDate: "" });
    expect(validLimits(limits)).toBe(true);
    expect(validateStudioProject(setLimits(createStudioProject("practice", NOW), () => limits, NOW))).toEqual([]);
  });

  it("counts one set limit as work worth keeping", () => {
    expect(hasAnyLimit({ ...emptyLimits(), companyCapPct: 5 })).toBe(true);
    expect(hasAnyLimit({ ...emptyLimits(), cashNeeds: [{ id: "n", label: "", amount: 0, dueDate: "" }] })).toBe(true);
    expect(hasAnyLimit({ ...emptyLimits(), slices: { ...emptyLimits().slices, steady: { minPct: null, targetPct: 30, maxPct: null } } })).toBe(true);
  });

  it("takes the smaller of willingness and capacity as the loss budget, and says which", () => {
    expect(lossBudget(20, null)).toEqual({ pct: 20, from: "willingness" });
    expect(lossBudget(20, 15)).toEqual({ pct: 15, from: "capacity" });
    expect(lossBudget(10, 15)).toEqual({ pct: 10, from: "willingness" });
    // A tie is the learner's own limit either way; say willingness, which they set first.
    expect(lossBudget(15, 15)).toEqual({ pct: 15, from: "willingness" });
  });

  it("checks that the slice targets add up and sit inside their ranges", () => {
    expect(checkTargets(filled())).toEqual({ total: 100, totalOff: false, problems: [] });
    expect(checkTargets(emptyLimits())).toEqual({ total: null, totalOff: false, problems: [] });
    const off = filled();
    off.slices.grow = { minPct: 50, targetPct: 70, maxPct: 65 };
    off.slices.steady = { minPct: 30, targetPct: 25, maxPct: 20 };
    expect(checkTargets(off)).toEqual({
      total: 115,
      totalOff: true,
      problems: ["Steady: the lowest is above the highest.", "Grow: the target is outside its range."],
    });
    // Two targets say nothing about the whole; no total until all three are set.
    const partial = emptyLimits();
    partial.slices.ready.targetPct = 20;
    partial.slices.grow.targetPct = 30;
    expect(checkTargets(partial)).toEqual({ total: null, totalOff: false, problems: [] });
    // Rounding in a typed 33.33 + 33.33 + 33.34 is not a problem.
    const thirds = emptyLimits();
    thirds.slices.ready.targetPct = 33.33; thirds.slices.steady.targetPct = 33.33; thirds.slices.grow.targetPct = 33.34;
    expect(checkTargets(thirds)).toMatchObject({ totalOff: false, problems: [] });
  });

  it.each<[string, (limits: StudioLimits) => unknown]>([
    ["a percentage above 100", (l) => ({ ...l, companyCapPct: 120 })],
    ["a negative percentage", (l) => ({ ...l, lossCapacityPct: -1 })],
    ["a percentage that is not a number", (l) => ({ ...l, fundCapPct: NaN })],
    ["a percentage stored as text", (l) => ({ ...l, fundCapPct: "40" })],
    ["a slice percentage above 100", (l) => ({ ...l, slices: { ...l.slices, ready: { minPct: 0, targetPct: 101, maxPct: 101 } } })],
    ["a missing slice", (l) => ({ ...l, slices: { ready: l.slices.ready, steady: l.slices.steady } })],
    ["an unknown slice", (l) => ({ ...l, slices: { ...l.slices, gold: { minPct: null, targetPct: null, maxPct: null } } })],
    ["an unknown limit", (l) => ({ ...l, sectorCapPct: 20 })],
    ["a negative bill", (l) => ({ ...l, cashNeeds: [{ ...l.cashNeeds[0], amount: -5 }] })],
    ["an impossible date", (l) => ({ ...l, cashNeeds: [{ ...l.cashNeeds[0], dueDate: "2028-02-30" }] })],
    ["a bill with an unknown field", (l) => ({ ...l, cashNeeds: [{ ...l.cashNeeds[0], paid: true }] })],
    ["two bills with one id", (l) => ({ ...l, cashNeeds: [l.cashNeeds[0], { ...l.cashNeeds[0], label: "Copy" }] })],
    ["a list instead of limits", () => []],
  ])("refuses %s", (_name, corrupt) => {
    const bad = corrupt(filled());
    expect(validLimits(bad)).toBe(false);
    const project = { ...createStudioProject("practice", NOW), limits: bad } as never;
    expect(validateStudioProject(project)).not.toEqual([]);
  });
});
