import type { StudioProject } from "./schema";

/**
 * A learner's limits, as numbers Studio can check.
 *
 * Plan and sources: docs/design/studio-goals-and-limits-plan-2026-09-24.md.
 * Every percentage is a share of the whole portfolio, cash included. Nothing
 * has a default: no reviewed source supplies one, so a limit nobody set is
 * null, and is reported as not checked -- never as met.
 */

/** Mission 5's slices, grouped by the job the money does. */
export const SLICES = ["ready", "steady", "grow"] as const;
export type SliceId = (typeof SLICES)[number];

/** A bill the portfolio has to pay on a date: what Mission 5 calls a liquidity bucket. */
export interface CashNeed {
  id: string;
  label: string;
  /** Dollars. */
  amount: number;
  /** YYYY-MM-DD, or "" until one is chosen. */
  dueDate: string;
}

/** A slice's long-run target and the range it may drift within before a review. */
export interface SliceTarget {
  minPct: number | null;
  targetPct: number | null;
  maxPct: number | null;
}

export interface StudioLimits {
  cashNeeds: CashNeed[];
  /**
   * Capacity: the fall the learner's finances could take without missing a
   * bill. Willingness, the fall they could sit through, is the goal's
   * `lossTolerancePct`; the smaller of the two is the loss budget.
   */
  lossCapacityPct: number | null;
  slices: Record<SliceId, SliceTarget>;
  companyCapPct: number | null;
  fundCapPct: number | null;
}

const unsetSlice = (): SliceTarget => ({ minPct: null, targetPct: null, maxPct: null });

export function emptyLimits(): StudioLimits {
  return {
    cashNeeds: [],
    lossCapacityPct: null,
    slices: { ready: unsetSlice(), steady: unsetSlice(), grow: unsetSlice() },
    companyCapPct: null,
    fundCapPct: null,
  };
}

/** The project's limits, or every limit unset for work saved before they existed. */
export function readLimits(project: Pick<StudioProject, "limits">): StudioLimits {
  return project.limits ?? emptyLimits();
}

/** Whether a learner has set anything here, so the record is work worth keeping. */
export function hasAnyLimit(limits: StudioLimits | undefined): boolean {
  if (!limits) return false;
  return (
    limits.cashNeeds.length > 0 ||
    [limits.lossCapacityPct, limits.companyCapPct, limits.fundCapPct].some((value) => value !== null) ||
    SLICES.some((slice) => Object.values(limits.slices[slice]).some((value) => value !== null))
  );
}

/** How each slice is named on screen, and the job Mission 5 gives it. */
export const SLICE_NAMES: Record<SliceId, { name: string; job: string }> = {
  ready: { name: "Ready", job: "Cash for bills" },
  steady: { name: "Steady", job: "Bonds, for stability" },
  grow: { name: "Grow", job: "Stocks, for growth" },
};

/**
 * The loss budget: the smaller of the fall a learner could sit through
 * (willingness) and the fall their finances could take (capacity), and which
 * one set it. Until capacity is given, willingness alone.
 */
export function lossBudget(willingnessPct: number, capacityPct: number | null): { pct: number; from: "willingness" | "capacity" } {
  return capacityPct !== null && capacityPct < willingnessPct
    ? { pct: capacityPct, from: "capacity" }
    : { pct: willingnessPct, from: "willingness" };
}

/**
 * Whether the slice targets hang together: each target inside its own range,
 * each range the right way round, and the three targets adding up to 100%.
 * `total` is null until every target is set, because a sum of some of them
 * says nothing. `problems` are the slices' own; `totalOff` is the sum's, so a
 * screen already showing the total need not repeat it.
 */
export function checkTargets(limits: StudioLimits): { total: number | null; totalOff: boolean; problems: string[] } {
  const problems: string[] = [];
  for (const slice of SLICES) {
    const { minPct, targetPct, maxPct } = limits.slices[slice];
    const { name } = SLICE_NAMES[slice];
    if (minPct !== null && maxPct !== null && minPct > maxPct) problems.push(`${name}: the lowest is above the highest.`);
    else if (targetPct !== null && ((minPct !== null && targetPct < minPct) || (maxPct !== null && targetPct > maxPct))) {
      problems.push(`${name}: the target is outside its range.`);
    }
  }
  const targets = SLICES.map((slice) => limits.slices[slice].targetPct);
  const total = targets.every((value) => value !== null) ? targets.reduce((sum: number, value) => sum + (value ?? 0), 0) : null;
  return { total, totalOff: total !== null && Math.abs(total - 100) > 1e-9, problems };
}

export function setLimits(
  project: StudioProject,
  change: (limits: StudioLimits) => StudioLimits,
  now = new Date().toISOString(),
): StudioProject {
  return { ...project, updatedAt: now, limits: change(readLimits(project)) };
}

type Fields = Record<string, unknown>;
const object = (value: unknown): value is Fields => typeof value === "object" && value !== null && !Array.isArray(value);
const exactly = (value: Fields, keys: readonly string[]) =>
  Object.keys(value).length === keys.length && keys.every((key) => key in value);
const percent = (value: unknown) =>
  value === null || (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100);
const date = (value: unknown) =>
  value === "" ||
  (typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value);

/**
 * Whether a stored or imported record holds limits this version understands.
 *
 * Half-finished values are valid -- a minimum above its target while it is
 * being typed, a bill with no date yet -- because refusing them would refuse
 * the save. Checks report those. Types, units and unknown fields are refused.
 */
export function validLimits(value: unknown): value is StudioLimits {
  if (!object(value) || !exactly(value, ["cashNeeds", "lossCapacityPct", "slices", "companyCapPct", "fundCapPct"])) return false;
  if (![value.lossCapacityPct, value.companyCapPct, value.fundCapPct].every(percent)) return false;
  const slices = value.slices;
  if (!object(slices) || !exactly(slices, SLICES)) return false;
  for (const slice of SLICES) {
    const target = slices[slice];
    if (!object(target) || !exactly(target, ["minPct", "targetPct", "maxPct"])) return false;
    if (![target.minPct, target.targetPct, target.maxPct].every(percent)) return false;
  }
  if (!Array.isArray(value.cashNeeds) || value.cashNeeds.length > 100) return false;
  const ids = new Set<string>();
  for (const need of value.cashNeeds) {
    if (!object(need) || !exactly(need, ["id", "label", "amount", "dueDate"])) return false;
    if (typeof need.id !== "string" || !need.id.trim() || need.id.length > 200 || ids.has(need.id)) return false;
    ids.add(need.id);
    if (typeof need.label !== "string" || need.label.length > 300) return false;
    if (typeof need.amount !== "number" || !Number.isFinite(need.amount) || need.amount < 0 || need.amount > 1e12) return false;
    if (!date(need.dueDate)) return false;
  }
  return true;
}
