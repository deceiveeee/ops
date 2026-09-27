import type { StudioCalculation, StudioPlan } from "@/lib/studio";
import type { StudioInstrument } from "@/lib/studio-catalog";
import { lossBudget, SLICE_NAMES, SLICES, type SliceId, type StudioLimits } from "./limits";

/**
 * A portfolio checked against the learner's own limits.
 *
 * Plan: docs/design/studio-goals-and-limits-plan-2026-09-24.md. Every figure is
 * a share of the whole portfolio, cash included. A limit nobody set is "not
 * checked", never "met", and nothing here changes a limit to make a portfolio
 * pass: it says what does not fit and leaves the choice to the learner.
 */

export type CheckStatus = "met" | "not-met" | "not-checked";
export type CheckKey = "bills" | "slices" | "caps" | "loss";
export interface LimitCheck { key: CheckKey; title: string; status: CheckStatus; detail: string }

/** The most a holding may be under one limit, and which limit that is. */
export interface WeightCeiling { label: string; pct: number }
export interface HoldingRoom {
  instrumentId: string;
  weightPct: number;
  slice: SliceId | null;
  ceilings: WeightCeiling[];
  /** The lowest ceiling: what limits this weight. Null when no limit applies to it. */
  tightest: WeightCeiling | null;
  over: boolean;
}
export interface PortfolioChecks {
  checks: LimitCheck[];
  holdings: HoldingRoom[];
  sliceShares: Record<SliceId, number>;
  /** Holdings Studio cannot sort into a slice, by symbol. They are left out of the slice check, and said to be. */
  unsorted: string[];
}

export const CHECK_TITLES: Record<CheckKey, string> = {
  bills: "Bills are covered",
  slices: "Slices are inside their ranges",
  caps: "No holding is over its cap",
  loss: "The scenario stays within your loss budget",
};

const EPS = 1e-9;
const dollars = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const plain = (value: number) => `${Number(value.toFixed(2))}%`;

/** Mission 5's slices by what a holding is: cash is Ready, bonds Steady, stocks Grow. */
export function sliceOf(instrument: StudioInstrument | null): SliceId | null {
  switch (instrument?.assetClass) {
    case "cash": return "ready";
    case "fixed-income": return "steady";
    case "us-equity": case "international-equity": case "global-equity": return "grow";
    default: return null;
  }
}

/**
 * The company cap applies to one company's shares, the fund cap to a fund.
 * The catalog's only individual bond is a Treasury note, which is neither; a
 * company's bond, if one is ever added, is money owed by one company and would
 * need the company cap.
 */
function capFor(instrument: StudioInstrument | null, limits: StudioLimits): WeightCeiling | null {
  if (instrument?.kind === "stock" && limits.companyCapPct !== null) return { label: "your cap for one company", pct: limits.companyCapPct };
  if (instrument?.kind === "fund" && limits.fundCapPct !== null) return { label: "your cap for one fund", pct: limits.fundCapPct };
  return null;
}

function rangeText(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${Number(min.toFixed(2))}–${plain(max)}`;
  return min !== null ? `at least ${plain(min)}` : `at most ${plain(max ?? 0)}`;
}

export function checkPortfolio(plan: StudioPlan, calculation: StudioCalculation, limits: StudioLimits): PortfolioChecks {
  const keys: CheckKey[] = ["bills", "slices", "caps", "loss"];
  if (!calculation.valid || calculation.budget <= 0) {
    const detail = calculation.totalWeightPct > 100 + EPS
      ? "The weights add up to more than 100%. Fix that first."
      : calculation.issues[0] ?? "The portfolio's amounts need fixing first.";
    return {
      checks: keys.map((key) => ({ key, title: CHECK_TITLES[key], status: "not-checked", detail })),
      holdings: [], sliceShares: { ready: 0, steady: 0, grow: 0 }, unsorted: [],
    };
  }
  const whole = calculation.budget;

  // Ready starts with the portfolio's own cash: what was set aside and anything not yet invested.
  const sliceShares: Record<SliceId, number> = { ready: calculation.targetCashWeightPct, steady: 0, grow: 0 };
  const unsorted: string[] = [];
  for (const row of calculation.rows) {
    const slice = sliceOf(row.instrument);
    if (slice) sliceShares[slice] += row.targetPortfolioWeightPct;
    else unsorted.push(row.instrument?.symbol ?? row.holding.instrumentId);
  }
  const symbol = (row: StudioCalculation["rows"][number]) => row.instrument?.symbol ?? row.holding.instrumentId;

  // Bills: the cash the portfolio holds against the total of the bills listed.
  const billsTotal = limits.cashNeeds.reduce((sum, need) => sum + need.amount, 0);
  const cash = calculation.targetCash;
  const bills: LimitCheck = billsTotal <= 0
    ? { key: "bills", title: CHECK_TITLES.bills, status: "not-checked", detail: "No bills listed." }
    : {
      key: "bills", title: CHECK_TITLES.bills, status: cash + 0.005 >= billsTotal ? "met" : "not-met",
      detail: `Your bills total ${dollars(billsTotal)}. The portfolio holds ${dollars(cash)} as cash${cash + 0.005 >= billsTotal ? "." : `, ${dollars(billsTotal - cash)} short.`}`,
    };

  // Slices: each slice with a lowest or highest set.
  const ranged = SLICES.filter((slice) => limits.slices[slice].minPct !== null || limits.slices[slice].maxPct !== null);
  const outside = ranged.filter((slice) => {
    const { minPct, maxPct } = limits.slices[slice];
    return (minPct !== null && sliceShares[slice] < minPct - EPS) || (maxPct !== null && sliceShares[slice] > maxPct + EPS);
  });
  const leftOut = unsorted.length ? ` ${unsorted.join(", ")} ${unsorted.length === 1 ? "is" : "are"} not sorted into a slice, so ${unsorted.length === 1 ? "it is" : "they are"} left out.` : "";
  const names = (list: SliceId[]) => list.map((slice) => SLICE_NAMES[slice].name).join(list.length > 2 ? ", " : " and ").replace(/, ([^,]*)$/, " and $1");
  const slices: LimitCheck = !ranged.length
    ? { key: "slices", title: CHECK_TITLES.slices, status: "not-checked", detail: "No ranges set." }
    : outside.length
      ? {
        key: "slices", title: CHECK_TITLES.slices, status: "not-met",
        detail: outside.map((slice) => `${SLICE_NAMES[slice].name} is ${sliceShares[slice].toFixed(1)}%; your range is ${rangeText(limits.slices[slice].minPct, limits.slices[slice].maxPct)}.`).join(" ") + leftOut,
      }
      : {
        key: "slices", title: CHECK_TITLES.slices, status: "met",
        detail: `${names(ranged)} ${ranged.length === 1 ? "is inside its range" : "are inside their ranges"}.${leftOut}`,
      };

  // Caps: one company, one fund.
  const overCaps = calculation.rows.flatMap((row) => {
    const cap = capFor(row.instrument, limits);
    return cap && row.targetPortfolioWeightPct > cap.pct + EPS
      ? [`${symbol(row)} is ${row.targetPortfolioWeightPct.toFixed(1)}%, ${(row.targetPortfolioWeightPct - cap.pct).toFixed(1)} points over ${cap.label} (${plain(cap.pct)}).`]
      : [];
  });
  const capsSet = [limits.companyCapPct !== null ? `no company above ${plain(limits.companyCapPct)}` : null, limits.fundCapPct !== null ? `no fund above ${plain(limits.fundCapPct)}` : null].filter(Boolean).join("; ");
  const caps: LimitCheck = !capsSet
    ? { key: "caps", title: CHECK_TITLES.caps, status: "not-checked", detail: "No caps set." }
    : overCaps.length
      ? { key: "caps", title: CHECK_TITLES.caps, status: "not-met", detail: overCaps.join(" ") }
      : { key: "caps", title: CHECK_TITLES.caps, status: "met", detail: `${capsSet.charAt(0).toUpperCase()}${capsSet.slice(1)}.` };

  // The scenario on the Risk page against the loss budget.
  const budget = lossBudget(plan.goal.lossTolerancePct, limits.lossCapacityPct);
  const allowed = whole * budget.pct / 100;
  const loses = Math.max(0, -calculation.stress.changeDollars);
  const setBy = `the loss you could ${budget.from === "capacity" ? "afford" : "live with"}`;
  const biggest = calculation.stress.rows
    .filter((row) => row.changeDollars < 0)
    .sort((a, b) => a.changeDollars - b.changeDollars)
    .slice(0, 3)
    .map((row) => `${symbol(calculation.rows.find((r) => r.holding.instrumentId === row.instrumentId)!)} ${dollars(-row.changeDollars)}`);
  const lossMet = loses <= allowed + 0.005;
  const loss: LimitCheck = budget.pct <= 0
    ? { key: "loss", title: CHECK_TITLES.loss, status: "not-checked", detail: "Set the loss you could live with on Goals." }
    : {
      key: "loss", title: CHECK_TITLES.loss, status: lossMet ? "met" : "not-met",
      detail: `The scenario on the Risk page loses ${dollars(loses)}. Your loss budget is ${dollars(allowed)}, ${setBy}.${lossMet || !biggest.length ? "" : ` Most of the loss: ${biggest.join(", ")}.`}`,
    };

  /*
   * What limits each weight. Each ceiling holds everything else still and
   * takes the money from cash: the cap as it stands; the slice's highest less
   * the rest of the slice; and the loss budget less the scenario's loss, over
   * how much more this holding falls than the cash it replaces.
   */
  const lossPct = -calculation.stress.changeDollars / whole * 100;
  const cashFall = -plan.stress.cashPct / 100;
  const holdings: HoldingRoom[] = calculation.rows.map((row) => {
    const weightPct = row.targetPortfolioWeightPct;
    const slice = sliceOf(row.instrument);
    const ceilings: WeightCeiling[] = [];
    const cap = capFor(row.instrument, limits);
    if (cap) ceilings.push(cap);
    const highest = slice ? limits.slices[slice].maxPct : null;
    if (slice && highest !== null) ceilings.push({ label: `${SLICE_NAMES[slice].name}'s highest`, pct: highest - (sliceShares[slice] - weightPct) });
    const fall = -(calculation.stress.rows.find((r) => r.instrumentId === row.holding.instrumentId)?.changePct ?? 0) / 100;
    if (budget.pct > 0 && fall - cashFall > EPS) ceilings.push({ label: "your loss budget", pct: weightPct + (budget.pct - lossPct) / (fall - cashFall) });
    const clamped = ceilings.map((ceiling) => ({ ...ceiling, pct: Math.max(0, ceiling.pct) }));
    const tightest = clamped.reduce<WeightCeiling | null>((low, ceiling) => (!low || ceiling.pct < low.pct - EPS ? ceiling : low), null);
    return { instrumentId: row.holding.instrumentId, weightPct, slice, ceilings: clamped, tightest, over: tightest !== null && weightPct > tightest.pct + EPS };
  });

  return { checks: [bills, slices, caps, loss], holdings, sliceShares, unsorted };
}
