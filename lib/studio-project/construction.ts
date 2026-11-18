import type { StudioInstrument } from "@/lib/studio-catalog";
import { SLICES, type SliceId, type StudioLimits } from "./limits";
import type { PortfolioAlternative, PortfolioPosition, StudioProject, StudioStress } from "./schema";

/**
 * Building a portfolio from the top down, the order professionals use.
 *
 * Plan: docs/design/studio-portfolio-top-down-plan-2026-11-16.md. The learner
 * states the goal and limits, works out the return the goal needs, chooses a
 * mix of Ready, Steady and Grow, splits each slice, fills each part with one
 * fund, and only then sizes any picks. Every holding's weight is an output of
 * those choices. Nothing here reads storage, the network or a JSON file: the
 * catalog arrives as an argument, so the validator can import this module.
 *
 * Every percentage is a share of the whole portfolio, cash included, as the
 * limits are. The cash kept aside on Goals is part of Ready.
 */

export const PARTS = ["us-stocks", "international-stocks", "short-bonds", "longer-bonds"] as const;
export type PartId = (typeof PARTS)[number];

/** `inSentence` is the name inside a sentence: "US" keeps its capitals. */
export const PART_NAMES: Record<PartId, { name: string; inSentence: string; slice: Exclude<SliceId, "ready"> }> = {
  "us-stocks": { name: "US stocks", inSentence: "US stocks", slice: "grow" },
  "international-stocks": { name: "International stocks", inSentence: "international stocks", slice: "grow" },
  "short-bonds": { name: "Short-term bonds", inSentence: "short-term bonds", slice: "steady" },
  "longer-bonds": { name: "Longer-term bonds", inSentence: "longer-term bonds", slice: "steady" },
};

/** An assumed yearly return range for one slice, before inflation, from a source the learner names. */
export interface SliceEstimate {
  lowPct: number | null;
  highPct: number | null;
}

/** Another mix the learner holds beside their own on step 3, to see the trade-off. Never used to build anything. */
export interface ComparedMix {
  id: string;
  name: string;
  ready: number | null;
  steady: number | null;
  grow: number | null;
}

/** Project-level choices: they belong to the goal and the policy, not to one portfolio. */
export interface StudioConstruction {
  /** The amount wanted at the goal date, in today's dollars. Null: no target, build wealth. */
  targetAmount: number | null;
  /** The yearly rise in prices the learner assumes, used to turn estimates into returns above inflation. */
  inflationPct: number | null;
  estimates: Record<SliceId, SliceEstimate>;
  /** Where the estimates came from, in the learner's words: who published them and when. */
  estimateSource: string;
  compare: ComparedMix[];
}

/** One stock sized inside the picks budget. */
export interface StockPick {
  instrumentId: string;
  /** Share of the whole portfolio. */
  pct: number | null;
}

/** Per-portfolio choices: steps 4 to 6. */
export interface AlternativeBuild {
  /** Share of Grow in international stocks; the rest is US stocks. */
  growInternationalPct: number | null;
  /** Share of Steady in short-term bonds; the rest is longer-term bonds. */
  steadyShortPct: number | null;
  /** The one fund that fills each part, by instrument id. */
  fills: Record<PartId, string | null>;
  /** Share of the whole portfolio set aside for picks. Comes out of Grow. */
  picksBudgetPct: number | null;
  picks: StockPick[];
}

export const MAX_COMPARED_MIXES = 2;
export const MAX_PICKS = 20;
export const MAX_ESTIMATE_SOURCE = 2_000;
export const MAX_MIX_NAME = 60;
const MAX_MONEY = 1_000_000_000_000;

export function emptyConstruction(): StudioConstruction {
  return {
    targetAmount: null,
    inflationPct: null,
    estimates: { ready: { lowPct: null, highPct: null }, steady: { lowPct: null, highPct: null }, grow: { lowPct: null, highPct: null } },
    estimateSource: "",
    compare: [],
  };
}

export function emptyBuild(): AlternativeBuild {
  return {
    growInternationalPct: null,
    steadyShortPct: null,
    fills: { "us-stocks": null, "international-stocks": null, "short-bonds": null, "longer-bonds": null },
    picksBudgetPct: null,
    picks: [],
  };
}

export function readConstruction(project: Pick<StudioProject, "construction">): StudioConstruction {
  return project.construction ?? emptyConstruction();
}

// ---------------------------------------------------------------------------
// Step 2: the return a goal needs
// ---------------------------------------------------------------------------

export type NeededReturn =
  | { status: "unset" }
  | { status: "no-time" }
  | { status: "no-money" }
  | { status: "reached"; withoutGrowth: number; annualPct: number }
  | { status: "ok"; withoutGrowth: number; annualPct: number }
  | { status: "too-high"; withoutGrowth: number };

/**
 * What the money would grow to: `start` now, `monthly` added at the end of each
 * month, for `months`, at a yearly rate compounded monthly. Everything is in
 * today's dollars, so the rate is a return above inflation and the monthly
 * amount is taken to rise with prices.
 */
export function futureValue(start: number, monthly: number, months: number, annualRate: number): number {
  const rate = Math.pow(1 + annualRate, 1 / 12) - 1;
  let value = start;
  for (let month = 0; month < months; month++) value = value * (1 + rate) + monthly;
  return value;
}

/**
 * The yearly return above inflation that takes the money now, plus monthly
 * additions, to the target by the goal date (Vanguard 2017, p. 2: the required
 * rate of return). Solved by halving the interval, which needs no formula that
 * could hide a timing convention: the timing is the loop in `futureValue`.
 */
export function neededReturn(input: { start: number; monthly: number; years: number; target: number | null }): NeededReturn {
  const { start, monthly, years, target } = input;
  if (target === null || !(target > 0)) return { status: "unset" };
  if (!(years > 0)) return { status: "no-time" };
  if (!(start > 0) && !(monthly > 0)) return { status: "no-money" };
  const months = Math.round(years * 12);
  const withoutGrowth = start + monthly * months;
  const HIGHEST = 1;
  if (futureValue(start, monthly, months, HIGHEST) < target) return { status: "too-high", withoutGrowth };
  let low = -0.99;
  let high = HIGHEST;
  for (let step = 0; step < 200; step++) {
    const middle = (low + high) / 2;
    if (futureValue(start, monthly, months, middle) < target) low = middle;
    else high = middle;
  }
  const annualPct = Math.round(((low + high) / 2) * 1_000_000) / 10_000;
  return { status: withoutGrowth >= target ? "reached" : "ok", withoutGrowth, annualPct };
}

// ---------------------------------------------------------------------------
// Step 3: a mix against the goal and the loss budget
// ---------------------------------------------------------------------------

export type Mix = Record<SliceId, number | null>;

export function mixFromLimits(limits: StudioLimits): Mix {
  return { ready: limits.slices.ready.targetPct, steady: limits.slices.steady.targetPct, grow: limits.slices.grow.targetPct };
}

/** The three targets adding up to 100%, or why not. */
export function mixComplete(mix: Mix): { total: number | null; complete: boolean } {
  const values = SLICES.map((slice) => mix[slice]);
  const total = values.every((value) => value !== null) ? values.reduce((sum: number, value) => sum + (value ?? 0), 0) : null;
  return { total, complete: total !== null && Math.abs(total - 100) < 1e-9 };
}

/** Before inflation to above it: (1 + return) / (1 + inflation) - 1. */
export function aboveInflation(returnPct: number, inflationPct: number): number {
  return ((1 + returnPct / 100) / (1 + inflationPct / 100) - 1) * 100;
}

export type MixRange =
  | { status: "incomplete"; missing: SliceId[] }
  | { status: "ok"; lowPct: number; highPct: number; lowRealPct: number | null; highRealPct: number | null };

/**
 * The mix's yearly return if every slice landed at the low end of its range at
 * once, and at the high end at once. Weights times estimates, so a slice with
 * no money needs no estimate. Above inflation only when inflation is set.
 */
export function mixRange(mix: Mix, construction: StudioConstruction): MixRange {
  const { complete } = mixComplete(mix);
  const missing = SLICES.filter((slice) => (mix[slice] ?? 0) > 0
    && (construction.estimates[slice].lowPct === null || construction.estimates[slice].highPct === null));
  if (!complete || missing.length) return { status: "incomplete", missing };
  let low = 0;
  let high = 0;
  for (const slice of SLICES) {
    const weight = (mix[slice] ?? 0) / 100;
    if (weight === 0) continue;
    const { lowPct, highPct } = construction.estimates[slice];
    low += weight * Math.min(lowPct ?? 0, highPct ?? 0);
    high += weight * Math.max(lowPct ?? 0, highPct ?? 0);
  }
  const inflation = construction.inflationPct;
  return {
    status: "ok", lowPct: round4(low), highPct: round4(high),
    lowRealPct: inflation === null ? null : round4(aboveInflation(low, inflation)),
    highRealPct: inflation === null ? null : round4(aboveInflation(high, inflation)),
  };
}

export type RangeVerdict = "covered" | "inside" | "above";

/** Where the needed return sits against the range above inflation. */
export function rangeVerdict(neededPct: number, range: MixRange): RangeVerdict | null {
  if (range.status !== "ok" || range.lowRealPct === null || range.highRealPct === null) return null;
  if (neededPct <= range.lowRealPct + 1e-9) return "covered";
  if (neededPct <= range.highRealPct + 1e-9) return "inside";
  return "above";
}

/**
 * A scenario's change to the whole portfolio for a mix, in percent. Grow uses
 * the US and international changes once Grow is split, and the global change
 * until then; Steady uses bonds; Ready uses cash.
 */
export function mixScenarioPct(mix: Mix, stress: StudioStress, growInternationalPct: number | null): number | null {
  if (!mixComplete(mix).complete) return null;
  const grow = growInternationalPct === null
    ? stress.globalStocksPct
    : (1 - growInternationalPct / 100) * stress.usStocksPct + (growInternationalPct / 100) * stress.internationalStocksPct;
  return round4(((mix.grow ?? 0) * grow + (mix.steady ?? 0) * stress.bondsPct + (mix.ready ?? 0) * stress.cashPct) / 100);
}

// ---------------------------------------------------------------------------
// Steps 4 to 6: parts, funds and picks, then each holding's weight
// ---------------------------------------------------------------------------

type Instrument = Pick<StudioInstrument, "id" | "kind" | "assetClass"> & { bond?: StudioInstrument["bond"] };

/**
 * Short-term bonds are Treasury bills or a fund that holds only them. A bill
 * matures within a year by definition; SGOV's stated objective is Treasury
 * bonds maturing in three months or less. Every other bond and bond fund is
 * longer-term here.
 */
const SHORT_TERM_FUNDS = new Set(["sgov"]);

export function partOf(instrument: Instrument | null | undefined, today = new Date().toISOString().slice(0, 10)): PartId | null {
  if (!instrument) return null;
  if (instrument.kind === "stock") return null;
  switch (instrument.assetClass) {
    case "us-equity": return "us-stocks";
    case "international-equity": return "international-stocks";
    case "fixed-income": {
      if (SHORT_TERM_FUNDS.has(instrument.id)) return "short-bonds";
      const maturity = instrument.bond?.maturity;
      if (maturity && Date.parse(maturity) - Date.parse(today) <= 366 * 86_400_000) return "short-bonds";
      return "longer-bonds";
    }
    default: return null;
  }
}

/** Which part a pick's money comes out of: its own region's stocks. */
export function pickPart(instrument: Instrument | null | undefined): PartId | null {
  if (!instrument || instrument.kind !== "stock") return null;
  if (instrument.assetClass === "us-equity") return "us-stocks";
  if (instrument.assetClass === "international-equity") return "international-stocks";
  return null;
}

export interface PartResult {
  part: PartId;
  /** Dollars of the whole portfolio assigned to this part, before picks. */
  money: number;
  fundId: string | null;
  /** What the fund holds once picks from this part are taken out. */
  fundMoney: number;
  picksMoney: number;
}

export interface PickResult {
  instrumentId: string;
  part: PartId | null;
  pct: number;
  money: number;
}

export interface BuildResult {
  /** Problems that stop Studio from working out the holdings at all. */
  problems: string[];
  /** Money that stays in cash for now, and why. Not a problem: an unfinished step. */
  notes: string[];
  whole: number;
  ready: number;
  /** Ready beyond the cash kept aside on Goals. */
  unassigned: number;
  slices: Record<SliceId, number>;
  parts: PartResult[];
  picks: PickResult[];
  /** Whole-portfolio dollars for every instrument the build puts money in. */
  holdings: { instrumentId: string; money: number }[];
}

const cents = (value: number) => Math.round((value + Number.EPSILON) * 100);
const round4 = (value: number) => Math.round(value * 10_000) / 10_000;
const usd = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const pctText = (value: number) => `${Number(value.toFixed(2))}%`;

/**
 * The dollars behind every choice, in cents throughout. Problems leave
 * `holdings` empty: a portfolio that does not add up is not worked out.
 */
export function buildPortfolio(input: {
  whole: number;
  cashKept: number;
  mix: Mix;
  build: AlternativeBuild;
  catalog: readonly Instrument[];
  names?: (instrumentId: string) => string;
  companyCapPct?: number | null;
  /** Leave picks out: the benchmark is the same mix held only in index funds. */
  withoutPicks?: boolean;
}): BuildResult {
  const { whole, cashKept, mix, build, catalog } = input;
  const name = input.names ?? ((id: string) => id);
  const byId = new Map(catalog.map((instrument) => [instrument.id, instrument]));
  const problems: string[] = [];
  const notes: string[] = [];
  const empty = (): BuildResult => ({
    problems, notes, whole, ready: 0, unassigned: 0, slices: { ready: 0, steady: 0, grow: 0 }, parts: [], picks: [], holdings: [],
  });
  if (!(whole > 0)) {
    problems.push("Enter the money available now on Goals.");
    return empty();
  }
  const { complete } = mixComplete(mix);
  if (!complete) {
    problems.push("Give Ready, Steady and Grow each a target, adding up to 100%.");
    return empty();
  }
  const wholeCents = cents(whole);
  const growCents = Math.round(wholeCents * (mix.grow ?? 0) / 100);
  const steadyCents = Math.round(wholeCents * (mix.steady ?? 0) / 100);
  const readyCents = wholeCents - growCents - steadyCents;
  const keptCents = cents(cashKept);
  if (keptCents > wholeCents) {
    problems.push("The cash kept aside on Goals is more than the money available.");
    return empty();
  }
  if (readyCents < keptCents) {
    problems.push(`Ready is ${usd(readyCents / 100)}, less than the ${usd(keptCents / 100)} you keep aside as cash on Goals. Ready needs to be at least ${pctText(keptCents / wholeCents * 100)}.`);
    return empty();
  }

  // Parts within each slice. An unset split keeps that slice's money in cash for now.
  const partCents: Record<PartId, number> = { "us-stocks": 0, "international-stocks": 0, "short-bonds": 0, "longer-bonds": 0 };
  let heldBack = 0;
  if (growCents > 0) {
    if (build.growInternationalPct === null) {
      notes.push(`Grow's ${usd(growCents / 100)} is not split yet, so it stays in cash for now.`);
      heldBack += growCents;
    } else {
      partCents["international-stocks"] = Math.round(growCents * build.growInternationalPct / 100);
      partCents["us-stocks"] = growCents - partCents["international-stocks"];
    }
  }
  if (steadyCents > 0) {
    if (build.steadyShortPct === null) {
      notes.push(`Steady's ${usd(steadyCents / 100)} is not split yet, so it stays in cash for now.`);
      heldBack += steadyCents;
    } else {
      partCents["short-bonds"] = Math.round(steadyCents * build.steadyShortPct / 100);
      partCents["longer-bonds"] = steadyCents - partCents["short-bonds"];
    }
  }

  // Picks come out of their own region's part.
  const picks: PickResult[] = [];
  const picksByPart: Record<PartId, number> = { "us-stocks": 0, "international-stocks": 0, "short-bonds": 0, "longer-bonds": 0 };
  if (!input.withoutPicks) {
    const budget = build.picksBudgetPct;
    const sized = build.picks.filter((pick) => (pick.pct ?? 0) > 0);
    if (sized.length && budget === null) problems.push("Set a picks budget before sizing picks.");
    if (budget !== null && budget > (mix.grow ?? 0) + 1e-9) problems.push(`The picks budget, ${pctText(budget)}, is more than Grow's ${pctText(mix.grow ?? 0)}. Picks come out of Grow.`);
    const used = sized.reduce((sum, pick) => sum + (pick.pct ?? 0), 0);
    if (budget !== null && used > budget + 1e-9) problems.push(`Your picks add up to ${pctText(used)}, more than the ${pctText(budget)} budget.`);
    for (const pick of sized) {
      const instrument = byId.get(pick.instrumentId);
      const part = pickPart(instrument);
      const pct = pick.pct ?? 0;
      if (!instrument) { problems.push(`${name(pick.instrumentId)} is not in the research library.`); continue; }
      if (!part) { problems.push(`${name(pick.instrumentId)} is not a stock Studio can place in US or international stocks.`); continue; }
      if (input.companyCapPct != null && pct > input.companyCapPct + 1e-9) {
        problems.push(`${name(pick.instrumentId)} is ${pctText(pct)}, over your ${pctText(input.companyCapPct)} cap for one company.`);
      }
      const money = Math.round(wholeCents * pct / 100);
      picksByPart[part] += money;
      picks.push({ instrumentId: pick.instrumentId, part, pct, money: money / 100 });
    }
    for (const part of ["us-stocks", "international-stocks"] as const) {
      if (picksByPart[part] > partCents[part]) {
        problems.push(`Picks from ${PART_NAMES[part].inSentence} come to ${usd(picksByPart[part] / 100)}, more than the part's ${usd(partCents[part] / 100)}.`);
      }
    }
  }
  if (problems.length) return empty();

  const parts: PartResult[] = [];
  const money = new Map<string, number>();
  const add = (id: string, value: number) => money.set(id, (money.get(id) ?? 0) + value);
  for (const part of PARTS) {
    const total = partCents[part];
    const fundId = build.fills[part];
    const fundCents = total - picksByPart[part];
    const fund = fundId ? byId.get(fundId) : undefined;
    if (total > 0 && fundCents > 0 && (!fundId || !fund || partOf(fund) !== part)) {
      notes.push(`No fund is chosen for ${PART_NAMES[part].inSentence} yet, so its ${usd(fundCents / 100)} stays in cash for now.`);
      heldBack += fundCents;
      parts.push({ part, money: total / 100, fundId: null, fundMoney: 0, picksMoney: picksByPart[part] / 100 });
      continue;
    }
    if (fundId && fundCents > 0) add(fundId, fundCents);
    parts.push({ part, money: total / 100, fundId: total > 0 ? fundId : null, fundMoney: total > 0 ? fundCents / 100 : 0, picksMoney: picksByPart[part] / 100 });
  }
  for (const pick of picks) add(pick.instrumentId, cents(pick.money));

  return {
    problems, notes, whole,
    ready: (readyCents + heldBack) / 100,
    unassigned: (readyCents + heldBack - keptCents) / 100,
    slices: { ready: readyCents / 100, steady: steadyCents / 100, grow: growCents / 100 },
    parts, picks,
    holdings: [...money.entries()].filter(([, value]) => value > 0).map(([instrumentId, value]) => ({ instrumentId, money: value / 100 })),
  };
}

/**
 * A holding's stored weight: its share of the money after the cash kept aside,
 * which is what the rest of Studio reads. Rounded to a millionth of a percent,
 * and never adding up past 100% through rounding.
 */
export function storedWeights(result: BuildResult, cashKept: number): Map<string, number> {
  const investableCents = cents(result.whole) - cents(cashKept);
  const weights = new Map<string, number>();
  if (investableCents <= 0) return weights;
  for (const { instrumentId, money } of result.holdings) {
    weights.set(instrumentId, Math.floor(cents(money) / investableCents * 100 * 1_000_000) / 1_000_000);
  }
  return weights;
}

const blankPosition = (instrumentId: string): PortfolioPosition => ({
  instrumentId, targetWeightPct: 0, currentValue: 0, quotePrice: null, quoteAsOf: "",
  quantityMode: "whole", accruedInterestPer100: null, tradeFee: 0,
});

/**
 * One portfolio's positions rewritten from its build. Holdings the build puts
 * money in keep everything else the learner entered for them. A holding the
 * build does not use goes to 0% and stays, so Review can still show it as owned
 * and something added from Research is not undone by the next save; step 5
 * lists such holdings with a way to remove them. Problems leave the positions
 * exactly as they were.
 */
export function positionsFromBuild(positions: PortfolioPosition[], result: BuildResult, cashKept: number): PortfolioPosition[] | null {
  if (result.problems.length) return null;
  const weights = storedWeights(result, cashKept);
  const next: PortfolioPosition[] = [];
  for (const position of positions) {
    const weight = weights.get(position.instrumentId);
    next.push({ ...position, targetWeightPct: weight ?? 0 });
  }
  for (const [instrumentId, weight] of weights) {
    if (!next.some((position) => position.instrumentId === instrumentId)) next.push({ ...blankPosition(instrumentId), targetWeightPct: weight });
  }
  return next;
}

/** The research record every holding needs, started where none exists yet. */
function withCandidates(project: StudioProject, instrumentIds: string[], now: string): StudioProject {
  const missing = instrumentIds.filter((id) => !project.candidates.some((candidate) => candidate.instrumentId === id));
  if (!missing.length) return project;
  return {
    ...project,
    candidates: [...project.candidates, ...missing.map((instrumentId) => ({
      id: `cand-${instrumentId}-${now}`, instrumentId, status: "researching" as const, createdAt: now, updatedAt: now,
      why: "", mainRisk: "", whatWouldChangeMyMind: "", openQuestions: [], rejectedBecause: "", evidence: [], reviewedSources: false,
    }))],
  };
}

/**
 * Every portfolio that has a build follows it: called after any change to the
 * goal, the limits or a build. A portfolio without a build keeps the weights
 * typed for it.
 */
export function applyBuilds(project: StudioProject, catalog: readonly Instrument[], now = new Date().toISOString()): StudioProject {
  const limits = project.limits;
  if (!limits || !project.alternatives.some((alternative) => alternative.build)) return project;
  const mix = mixFromLimits(limits);
  let changed = false;
  const added: string[] = [];
  const alternatives = project.alternatives.map((alternative) => {
    if (!alternative.build) return alternative;
    const result = buildPortfolio({
      whole: project.goal.budget, cashKept: project.goal.cashReserve, mix, build: alternative.build, catalog, companyCapPct: limits.companyCapPct,
    });
    const positions = positionsFromBuild(alternative.positions, result, project.goal.cashReserve);
    if (!positions || JSON.stringify(positions) === JSON.stringify(alternative.positions)) return alternative;
    changed = true;
    added.push(...positions.map((position) => position.instrumentId));
    return { ...alternative, positions, updatedAt: now };
  });
  if (!changed) return project;
  return withCandidates({ ...project, alternatives }, [...new Set(added)], now);
}

// ---------------------------------------------------------------------------
// Starting from a portfolio typed by hand
// ---------------------------------------------------------------------------

export interface StartingPoint {
  mix: Mix;
  build: AlternativeBuild;
  /** Funds that share a part with a larger one, whose money moves into it. */
  merged: { from: string; into: string }[];
  /** Holdings Studio cannot place in a part or as a pick. Their money stays in cash. */
  unplaced: string[];
}

const two = (value: number) => Math.round(value * 100) / 100;

/**
 * The mix and build a hand-typed portfolio adds up to, for the learner to
 * confirm before anything is rewritten. `rows` carry whole-portfolio weights.
 * Cash, and anything Studio cannot place, is whatever Ready is left with.
 */
export function startingPoint(rows: { instrumentId: string; instrument: Instrument | null; wholePct: number }[]): StartingPoint {
  const partSums: Record<PartId, number> = { "us-stocks": 0, "international-stocks": 0, "short-bonds": 0, "longer-bonds": 0 };
  const funds: Record<PartId, { id: string; pct: number }[]> = { "us-stocks": [], "international-stocks": [], "short-bonds": [], "longer-bonds": [] };
  const unplaced: string[] = [];
  const picks: StockPick[] = [];
  for (const row of rows) {
    if (row.wholePct <= 0) continue;
    const region = pickPart(row.instrument);
    if (region) {
      partSums[region] += row.wholePct;
      picks.push({ instrumentId: row.instrumentId, pct: two(row.wholePct) });
      continue;
    }
    const part = partOf(row.instrument);
    if (!part) { unplaced.push(row.instrumentId); continue; }
    partSums[part] += row.wholePct;
    funds[part].push({ id: row.instrumentId, pct: row.wholePct });
  }
  // One fund per part: the largest keeps it, and the others' money moves into it.
  const merged: { from: string; into: string }[] = [];
  const fills = Object.fromEntries(PARTS.map((part) => {
    const [first, ...rest] = [...funds[part]].sort((a, b) => b.pct - a.pct);
    rest.forEach((fund) => merged.push({ from: fund.id, into: first.id }));
    return [part, first?.id ?? null];
  })) as Record<PartId, string | null>;
  const grow = partSums["us-stocks"] + partSums["international-stocks"];
  const steady = partSums["short-bonds"] + partSums["longer-bonds"];
  const picksTotal = picks.reduce((sum, pick) => sum + (pick.pct ?? 0), 0);
  return {
    mix: { ready: two(100 - two(grow) - two(steady)), steady: two(steady), grow: two(grow) },
    build: {
      growInternationalPct: grow > 0 ? two(partSums["international-stocks"] / grow * 100) : null,
      steadyShortPct: steady > 0 ? two(partSums["short-bonds"] / steady * 100) : null,
      fills,
      picksBudgetPct: picks.length ? two(picksTotal) : null,
      picks,
    },
    merged,
    unplaced,
  };
}

// ---------------------------------------------------------------------------
// Validation: half-finished values are valid, wrong types and units are not
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Step 7: looking inside the funds
// ---------------------------------------------------------------------------

export interface LookThroughRow {
  /** The issuer's identifier where filed, otherwise its name, lower-cased. */
  key: string;
  label: string;
  /** Share of the whole portfolio. */
  pct: number;
  /** Holdings it reaches the portfolio through, by instrument id. */
  through: string[];
}

/**
 * The companies and issuers a portfolio owns through every holding, from the
 * holdings each fund reports. Two holdings name the same issuer when they file
 * the same identifier (an LEI), not when they spell it the same way. A filed
 * weight above 100% (SGOV's Treasury line) counts as the whole holding.
 */
export function lookThrough(rows: { instrumentId: string; wholePct: number; exposures: { label: string; key?: string; weightPct: number }[] }[]): LookThroughRow[] {
  const found = new Map<string, LookThroughRow>();
  for (const row of rows) {
    if (row.wholePct <= 0) continue;
    const merged = new Map<string, { label: string; weight: number }>();
    for (const exposure of row.exposures) {
      if (!Number.isFinite(exposure.weightPct) || exposure.weightPct <= 0) continue;
      const key = (exposure.key ?? exposure.label).trim().toLowerCase();
      merged.set(key, { label: merged.get(key)?.label ?? exposure.label, weight: (merged.get(key)?.weight ?? 0) + exposure.weightPct });
    }
    for (const [key, { label, weight }] of merged) {
      const share = row.wholePct * Math.min(100, weight) / 100;
      const existing = found.get(key);
      found.set(key, { key, label: existing?.label ?? label, pct: (existing?.pct ?? 0) + share, through: [...(existing?.through ?? []), row.instrumentId] });
    }
  }
  return [...found.values()].map((row) => ({ ...row, pct: round4(row.pct) })).sort((a, b) => b.pct - a.pct || a.label.localeCompare(b.label));
}

type Fields = Record<string, unknown>;
const object = (value: unknown): value is Fields => typeof value === "object" && value !== null && !Array.isArray(value);
const exactly = (value: Fields, keys: readonly string[]) => Object.keys(value).length === keys.length && keys.every((key) => key in value);
const between = (value: unknown, min: number, max: number) =>
  value === null || (typeof value === "number" && Number.isFinite(value) && value >= min && value <= max);
const id = (value: unknown) => typeof value === "string" && value.trim() !== "" && value.length <= 200;

export function validConstruction(value: unknown): value is StudioConstruction {
  if (!object(value) || !exactly(value, ["targetAmount", "inflationPct", "estimates", "estimateSource", "compare"])) return false;
  if (!between(value.targetAmount, 0, MAX_MONEY) || !between(value.inflationPct, -20, 50)) return false;
  if (typeof value.estimateSource !== "string" || value.estimateSource.length > MAX_ESTIMATE_SOURCE) return false;
  const estimates = value.estimates;
  if (!object(estimates) || !exactly(estimates, SLICES)) return false;
  for (const slice of SLICES) {
    const estimate = estimates[slice];
    if (!object(estimate) || !exactly(estimate, ["lowPct", "highPct"]) || !between(estimate.lowPct, -100, 100) || !between(estimate.highPct, -100, 100)) return false;
  }
  if (!Array.isArray(value.compare) || value.compare.length > MAX_COMPARED_MIXES) return false;
  const ids = new Set<string>();
  for (const mix of value.compare) {
    if (!object(mix) || !exactly(mix, ["id", "name", "ready", "steady", "grow"]) || !id(mix.id) || ids.has(mix.id as string)) return false;
    ids.add(mix.id as string);
    if (typeof mix.name !== "string" || mix.name.length > MAX_MIX_NAME) return false;
    if (![mix.ready, mix.steady, mix.grow].every((part) => between(part, 0, 100))) return false;
  }
  return true;
}

export function validBuild(value: unknown): value is AlternativeBuild {
  if (!object(value) || !exactly(value, ["growInternationalPct", "steadyShortPct", "fills", "picksBudgetPct", "picks"])) return false;
  if (![value.growInternationalPct, value.steadyShortPct, value.picksBudgetPct].every((part) => between(part, 0, 100))) return false;
  const fills = value.fills;
  if (!object(fills) || !exactly(fills, PARTS) || !PARTS.every((part) => fills[part] === null || id(fills[part]))) return false;
  if (!Array.isArray(value.picks) || value.picks.length > MAX_PICKS) return false;
  const ids = new Set<string>();
  for (const pick of value.picks) {
    if (!object(pick) || !exactly(pick, ["instrumentId", "pct"]) || !id(pick.instrumentId) || ids.has(pick.instrumentId as string)) return false;
    ids.add(pick.instrumentId as string);
    if (!between(pick.pct, 0, 100)) return false;
  }
  return true;
}

/** Convenience for the pages: an alternative's build, or a blank one. */
export function readBuild(alternative: Pick<PortfolioAlternative, "build"> | undefined): AlternativeBuild {
  return alternative?.build ?? emptyBuild();
}
