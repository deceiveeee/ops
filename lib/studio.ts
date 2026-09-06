import type { StudioInstrument } from "@/lib/studio-catalog";

/** A separate record: course examples and lesson decisions are never imported implicitly. */
export const STUDIO_STORAGE_KEY = "ops-studio-portfolio-v1";
export const STUDIO_STORAGE_EVENT = "ops-studio-portfolio-change";
export const STUDIO_SCHEMA_VERSION = 1 as const;
const MAX_MONEY = 1_000_000_000_000;

export type StudioMode = "practice" | "personal";
export interface StudioResearch {
  why: string;
  mainRisk: string;
  whatWouldChangeMyMind: string;
  reviewedSources: boolean;
}
export interface StudioHolding {
  instrumentId: string;
  /** Percent of the budget remaining AFTER the cash reserve. */
  targetWeightPct: number;
  currentValue: number;
  research: StudioResearch;
  /** Stocks/funds: USD per share. Individual bonds: price per $100 face value. */
  quotePrice: number | null;
  quoteAsOf: string;
  quantityMode: "whole" | "fractional";
  accruedInterestPer100: number | null;
  tradeFee: number;
}
export interface StudioPlan {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  updatedAt: string;
  mode: StudioMode;
  name: string;
  goal: {
    purpose: string;
    horizonYears: number;
    budget: number;
    cashReserve: number;
    monthlyContribution: number;
    accountType: "taxable" | "ira" | "roth-ira" | "other";
    lossTolerancePct: number;
    constraints: string;
  };
  holdings: StudioHolding[];
  currentCash: number;
  contributionAmount: number;
  rules: {
    reviewFrequency: "monthly" | "quarterly" | "yearly";
    /** Difference from target, in percentage points of the FULL portfolio. */
    driftThresholdPct: number;
    contributionRule: string;
    sellRule: string;
    guardrails: string;
  };
  /** User-chosen price changes, not return forecasts or loss probabilities. */
  stress: {
    usStocksPct: number;
    internationalStocksPct: number;
    globalStocksPct: number;
    bondsPct: number;
    cashPct: number;
  };
}

function makeId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `studio-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function createStudioPlan(mode: StudioMode = "practice", now = new Date().toISOString()): StudioPlan {
  return {
    schemaVersion: 1,
    id: makeId(),
    createdAt: now,
    updatedAt: now,
    mode,
    name: mode === "practice" ? "My practice portfolio" : "My portfolio",
    goal: {
      purpose: "", horizonYears: 10, budget: mode === "practice" ? 10_000 : 0,
      cashReserve: 0, monthlyContribution: 0, accountType: "taxable", lossTolerancePct: 20, constraints: "",
    },
    holdings: [], currentCash: 0, contributionAmount: 0,
    rules: { reviewFrequency: "quarterly", driftThresholdPct: 5, contributionRule: "", sellRule: "", guardrails: "" },
    stress: { usStocksPct: -30, internationalStocksPct: -30, globalStocksPct: -30, bondsPct: -10, cashPct: 0 },
  };
}

export function addStudioHolding(plan: StudioPlan, instrumentId: string): StudioPlan {
  if (plan.holdings.some((holding) => holding.instrumentId === instrumentId)) return plan;
  return { ...plan, holdings: [...plan.holdings, {
    instrumentId, targetWeightPct: 0, currentValue: 0,
    research: { why: "", mainRisk: "", whatWouldChangeMyMind: "", reviewedSources: false },
    quotePrice: null, quoteAsOf: "", quantityMode: "whole", accruedInterestPer100: null, tradeFee: 0,
  }], updatedAt: new Date().toISOString() };
}

export function updateStudioHolding(
  plan: StudioPlan,
  instrumentId: string,
  patch: Partial<Omit<StudioHolding, "instrumentId" | "research">> & { research?: Partial<StudioResearch> },
): StudioPlan {
  return { ...plan, updatedAt: new Date().toISOString(), holdings: plan.holdings.map((holding) =>
    holding.instrumentId === instrumentId
      ? { ...holding, ...patch, instrumentId, research: { ...holding.research, ...patch.research } }
      : holding) };
}

export function removeStudioHolding(plan: StudioPlan, instrumentId: string): StudioPlan {
  return { ...plan, updatedAt: new Date().toISOString(), holdings: plan.holdings.filter((holding) => holding.instrumentId !== instrumentId) };
}

type UnknownRecord = Record<string, unknown>;
function record(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function string(value: unknown, max = 20_000): value is string {
  return typeof value === "string" && value.length <= max;
}
function number(value: unknown, min = 0, max = MAX_MONEY): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}
function oneOf(value: unknown, values: readonly string[]): boolean {
  return typeof value === "string" && values.includes(value);
}
function date(value: unknown, blank = false): boolean {
  if (blank && value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function timestamp(value: unknown): boolean {
  return typeof value === "string" && value.length < 40 && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
}
function onlyKeys(value: UnknownRecord, keys: string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

/** Structural validation allows unfinished drafts, but never coerces numeric strings, NaN, or null into money. */
export function validateStudioPlan(value: unknown): string[] {
  if (!record(value)) return ["The backup must contain a Studio portfolio object."];
  if (value.schemaVersion !== 1) return [typeof value.schemaVersion === "number" && value.schemaVersion > 1
    ? "This portfolio was saved by a newer version of Studio. Its original data has been preserved."
    : "This is not a supported Studio portfolio backup."];
  const issues: string[] = [];
  if (!onlyKeys(value, ["schemaVersion", "id", "createdAt", "updatedAt", "mode", "name", "goal", "holdings", "currentCash", "contributionAmount", "rules", "stress"])) {
    issues.push("The portfolio contains fields this version does not understand; keep the original backup.");
  }
  if (!string(value.id, 200) || !value.id || !timestamp(value.createdAt) || !timestamp(value.updatedAt)) issues.push("The portfolio identity or saved dates are invalid.");
  if (!oneOf(value.mode, ["practice", "personal"]) || !string(value.name, 300)) issues.push("The portfolio name or mode is invalid.");
  const goal = value.goal;
  if (!record(goal) || !onlyKeys(goal, ["purpose", "horizonYears", "budget", "cashReserve", "monthlyContribution", "accountType", "lossTolerancePct", "constraints"])
    || !string(goal.purpose) || !string(goal.constraints) || !number(goal.horizonYears, 0, 100)
    || !number(goal.budget) || !number(goal.cashReserve) || !number(goal.monthlyContribution)
    || !number(goal.lossTolerancePct, 0, 100) || !oneOf(goal.accountType, ["taxable", "ira", "roth-ira", "other"])) issues.push("Goal and limits contain a missing or invalid field.");
  if (!number(value.currentCash) || !number(value.contributionAmount)) issues.push("Current cash and contributions must be finite, nonnegative dollar amounts.");
  const rules = value.rules;
  if (!record(rules) || !onlyKeys(rules, ["reviewFrequency", "driftThresholdPct", "contributionRule", "sellRule", "guardrails"])
    || !oneOf(rules.reviewFrequency, ["monthly", "quarterly", "yearly"]) || !number(rules.driftThresholdPct, 0, 100)
    || !string(rules.contributionRule) || !string(rules.sellRule) || !string(rules.guardrails)) issues.push("Operating rules contain a missing or invalid field.");
  const stress = value.stress;
  const stressKeys = ["usStocksPct", "internationalStocksPct", "globalStocksPct", "bondsPct", "cashPct"];
  if (!record(stress) || !onlyKeys(stress, stressKeys) || !stressKeys.every((key) => number(stress[key], -100, 100))) issues.push("Scenario changes must each be between -100% and +100%.");
  if (!Array.isArray(value.holdings) || value.holdings.length > 100) issues.push("A portfolio must have a holdings list with at most 100 investments.");
  else {
    const ids = new Set<string>();
    value.holdings.forEach((holding, index) => {
      const prefix = `Investment ${index + 1}`;
      if (!record(holding)) { issues.push(`${prefix} is invalid.`); return; }
      if (!onlyKeys(holding, ["instrumentId", "targetWeightPct", "currentValue", "research", "quotePrice", "quoteAsOf", "quantityMode", "accruedInterestPer100", "tradeFee"])) issues.push(`${prefix} contains unsupported fields.`);
      if (!string(holding.instrumentId, 200) || !holding.instrumentId || ids.has(holding.instrumentId)) issues.push(`${prefix} has a missing or repeated investment ID.`);
      else ids.add(holding.instrumentId);
      if (!number(holding.targetWeightPct, 0, 100) || !number(holding.currentValue) || !number(holding.tradeFee)) issues.push(`${prefix} has an invalid weight, current value, or fee.`);
      if (!(holding.quotePrice === null || number(holding.quotePrice, 0.000001, 100_000_000)) || !date(holding.quoteAsOf, true)
        || !oneOf(holding.quantityMode, ["whole", "fractional"])
        || !(holding.accruedInterestPer100 === null || number(holding.accruedInterestPer100, 0, 100_000))) issues.push(`${prefix} has invalid quote or quantity settings.`);
      const research = holding.research;
      if (!record(research) || !onlyKeys(research, ["why", "mainRisk", "whatWouldChangeMyMind", "reviewedSources"])
        || !string(research.why) || !string(research.mainRisk) || !string(research.whatWouldChangeMyMind)
        || typeof research.reviewedSources !== "boolean") issues.push(`${prefix} has incomplete research fields.`);
    });
  }
  return issues;
}

export type StudioParseResult = { ok: true; plan: StudioPlan } | { ok: false; error: string };
export function parseStudioJson(text: string): StudioParseResult {
  if (text.length > 2_000_000) return { ok: false, error: "The backup is too large. Studio supports files up to 2 MB." };
  let value: unknown;
  try { value = JSON.parse(text); } catch { return { ok: false, error: "The backup is not valid JSON. The saved portfolio has been preserved." }; }
  const issues = validateStudioPlan(value);
  return issues.length ? { ok: false, error: issues.join(" ") } : { ok: true, plan: value as StudioPlan };
}

export function exportStudioJson(plan: StudioPlan): string {
  const issues = validateStudioPlan(plan);
  if (issues.length) throw new Error(issues.join(" "));
  return JSON.stringify(plan, null, 2);
}

export interface StudioStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }
export type StudioLoadResult =
  | { status: "ready"; plan: StudioPlan; raw: string | null; error: null }
  | { status: "blocked"; plan: StudioPlan; raw: string; error: string }
  | { status: "memory"; plan: StudioPlan; raw: null; error: string };

export function loadStudio(storage: StudioStorage | null, fallback = createStudioPlan()): StudioLoadResult {
  if (!storage) return { status: "memory", plan: fallback, raw: null, error: "Browser storage is unavailable. Download a backup to keep your work." };
  let raw: string | null;
  try { raw = storage.getItem(STUDIO_STORAGE_KEY); }
  catch { return { status: "memory", plan: fallback, raw: null, error: "Studio could not read browser storage. Download a backup to keep your work." }; }
  if (raw === null) return { status: "ready", plan: fallback, raw, error: null };
  const parsed = parseStudioJson(raw);
  return parsed.ok
    ? { status: "ready", plan: parsed.plan, raw, error: null }
    : { status: "blocked", plan: fallback, raw, error: parsed.error };
}

export type StudioSaveResult = { ok: true; raw: string } | { ok: false; error: string; conflict: boolean };
/** Compare before writing, including imports/reset: another tab's changes must not be silently replaced. */
export function saveStudio(storage: StudioStorage | null, plan: StudioPlan, expectedRaw: string | null): StudioSaveResult {
  if (!storage) return { ok: false, error: "Browser storage is unavailable. Download a backup to keep your work.", conflict: false };
  const issues = validateStudioPlan(plan);
  if (issues.length) return { ok: false, error: issues.join(" "), conflict: false };
  try {
    if (storage.getItem(STUDIO_STORAGE_KEY) !== expectedRaw) return {
      ok: false, conflict: true, error: "The saved portfolio changed in another tab. Download your current work, then reload before replacing it.",
    };
    const raw = exportStudioJson(plan);
    storage.setItem(STUDIO_STORAGE_KEY, raw);
    return { ok: true, raw };
  } catch { return { ok: false, conflict: false, error: "Studio could not save in this browser. Download a backup to keep your work." }; }
}

function cents(value: number): number { return Math.round((value + Number.EPSILON) * 100); }
function money(value: number): number { return cents(value) / 100; }
function pct(value: number): number { return Math.round(value * 1_000_000) / 1_000_000; }

/** Largest-remainder apportionment conserves a finite number of cents across every row. */
function apportion(totalCents: number, weights: number[]): number[] {
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  if (sum <= 0 || totalCents <= 0) return weights.map(() => 0);
  const raw = weights.map((weight) => totalCents * weight / sum);
  const result = raw.map(Math.floor);
  const order = raw.map((value, index) => ({ index, fraction: value - result[index] })).sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  let left = totalCents - result.reduce((acc, value) => acc + value, 0);
  for (let index = 0; left > 0; index = (index + 1) % order.length, left--) result[order[index].index]++;
  return result;
}

export interface StudioCalculatedRow {
  holding: StudioHolding;
  instrument: StudioInstrument | null;
  targetValue: number;
  targetPortfolioWeightPct: number;
  currentWeightPct: number;
  driftPct: number;
  rebalanceDelta: number;
}
export interface StudioOrder {
  instrumentId: string;
  price: number | null;
  priceAsOf: string;
  quantity: number;
  unit: "shares" | "face value";
  principalCost: number;
  accruedInterest: number | null;
  estimatedCost: number;
  leftover: number;
  complete: boolean;
  warnings: string[];
}
export interface StudioCalculation {
  valid: boolean;
  issues: string[];
  budget: number;
  investableBudget: number;
  totalWeightPct: number;
  targetCash: number;
  targetCashWeightPct: number;
  currentTotal: number;
  rows: StudioCalculatedRow[];
  fees: { annualKnownCost: number; weightedKnownExpenseRatioPct: number; coveragePct: number; unknownInstrumentIds: string[] };
  stress: { rows: { instrumentId: string; changePct: number; changeDollars: number; endingValue: number }[]; changeDollars: number; changePct: number; endingValue: number };
  contributions: { rows: { instrumentId: string; amount: number }[]; cash: number; amount: number };
  orders: StudioOrder[];
  overlaps: { label: string; portfolioWeightPct: number; instrumentIds: string[] }[];
  exposureCoveragePct: number;
}

function orderFor(row: StudioCalculatedRow): StudioOrder {
  const { holding, instrument, targetValue } = row;
  const bond = instrument?.bond;
  const isBond = instrument?.kind === "bond";
  const price = holding.quotePrice ?? instrument?.referencePrice ?? null;
  const priceAsOf = holding.quotePrice !== null ? holding.quoteAsOf : instrument?.priceAsOf ?? "";
  const warnings: string[] = [];
  const accruedRate = isBond ? holding.accruedInterestPer100 ?? bond?.accruedInterestPer100 ?? null : 0;
  const blank: StudioOrder = {
    instrumentId: holding.instrumentId, price, priceAsOf, quantity: 0, unit: isBond ? "face value" : "shares",
    principalCost: 0, accruedInterest: accruedRate === null ? null : 0, estimatedCost: 0, leftover: targetValue, complete: true, warnings,
  };
  if (targetValue <= 0) return blank;
  if (!instrument) return { ...blank, complete: false, warnings: ["This investment is missing from the current research library."] };
  if (price === null || !Number.isFinite(price) || price <= 0) return { ...blank, complete: false, warnings: ["Enter a dated broker quote to estimate a quantity. Your dollar target is saved."] };
  if (!priceAsOf) warnings.push("Add the date of this quote.");
  if (holding.quotePrice === null) warnings.push("This is a dated research price. Verify a current broker quote before placing an order.");
  if (isBond && !bond) return { ...blank, complete: false, warnings: ["Bond terms are missing. Verify the bond before estimating face value."] };
  if (accruedRate === null) warnings.push("Accrued interest is unknown and excluded. The quantity and total cost are incomplete estimates.");
  if (isBond) warnings.push("Confirm the broker's minimum face value, increments, accrued interest, and fees before buying.");
  if (!isBond && holding.quantityMode === "fractional") warnings.push("Fractional estimates use 0.001-share increments. Confirm your broker supports this investment and increment.");

  const step = isBond ? instrument.quantityStep : holding.quantityMode === "fractional" ? 0.001 : Math.max(1, instrument.quantityStep);
  const minimum = isBond ? instrument.minimumUnits : holding.quantityMode === "fractional" ? 0.001 : Math.max(1, instrument.minimumUnits);
  if (!Number.isFinite(step) || step <= 0 || !Number.isFinite(minimum) || minimum <= 0) return { ...blank, complete: false, warnings: [...warnings, "Investment quantity limits are invalid."] };
  const perUnitPrice = isBond ? price / 100 : price;
  const perUnitAccrued = isBond ? (accruedRate ?? 0) / 100 : 0;
  const availableCents = Math.max(0, cents(targetValue) - cents(holding.tradeFee));
  let steps = Math.max(0, Math.floor((availableCents / 100) / ((perUnitPrice + perUnitAccrued) * step) + 1e-10));
  let quantity = Number((steps * step).toFixed(6));
  if (quantity < minimum) { quantity = 0; steps = 0; }
  let principalCents = cents(quantity * perUnitPrice);
  let accruedCents = cents(quantity * perUnitAccrued);
  // Individually rounding principal and accrued interest must never overspend the row's cash budget.
  while (steps > 0 && principalCents + accruedCents > availableCents) {
    steps--; quantity = Number((steps * step).toFixed(6));
    if (quantity < minimum) { quantity = 0; steps = 0; }
    principalCents = cents(quantity * perUnitPrice); accruedCents = cents(quantity * perUnitAccrued);
  }
  const totalCents = principalCents + accruedCents + (quantity > 0 ? cents(holding.tradeFee) : 0);
  if (quantity === 0) warnings.push("This dollar target does not cover the minimum purchase plus entered fees. The money stays in cash.");
  return {
    ...blank, quantity, principalCost: principalCents / 100, accruedInterest: accruedRate === null ? null : accruedCents / 100,
    estimatedCost: totalCents / 100, leftover: (cents(targetValue) - totalCents) / 100,
    complete: Boolean(priceAsOf) && accruedRate !== null, warnings,
  };
}

/** Dollar and percentage planning only. No optimizer, forecasts, or order execution. */
export function calculateStudio(plan: StudioPlan, catalog: readonly StudioInstrument[]): StudioCalculation {
  const schemaIssues = validateStudioPlan(plan);
  if (schemaIssues.length) return {
    valid: false, issues: schemaIssues, budget: 0, investableBudget: 0, totalWeightPct: 0, targetCash: 0,
    targetCashWeightPct: 0, currentTotal: 0, rows: [], fees: { annualKnownCost: 0, weightedKnownExpenseRatioPct: 0, coveragePct: 0, unknownInstrumentIds: [] },
    stress: { rows: [], changeDollars: 0, changePct: 0, endingValue: 0 }, contributions: { rows: [], cash: 0, amount: 0 }, orders: [], overlaps: [], exposureCoveragePct: 0,
  };
  const byId = new Map(catalog.map((instrument) => [instrument.id, instrument]));
  const budgetCents = cents(plan.goal.budget);
  const reserveCents = cents(plan.goal.cashReserve);
  const investableCents = Math.max(0, budgetCents - reserveCents);
  const totalWeightPct = pct(plan.holdings.reduce((total, holding) => total + holding.targetWeightPct, 0));
  const issues: string[] = [];
  if (budgetCents <= 0) issues.push("Enter a starting portfolio amount greater than zero.");
  if (reserveCents > budgetCents) issues.push("The cash reserve cannot exceed the starting portfolio amount.");
  if (totalWeightPct > 100) issues.push("Investment targets exceed 100% of the amount available after the cash reserve.");
  plan.holdings.forEach((holding) => { if (!byId.has(holding.instrumentId)) issues.push(`Investment ${holding.instrumentId} is unavailable in this library. Its saved research is preserved.`); });
  const valid = issues.length === 0;
  const targetCents = valid
    ? apportion(investableCents, [...plan.holdings.map((holding) => holding.targetWeightPct), Math.max(0, 100 - totalWeightPct)])
    : [...plan.holdings.map(() => 0), 0];
  const targetCashCents = valid ? reserveCents + targetCents[targetCents.length - 1] : budgetCents;
  const currentCashCents = cents(plan.currentCash);
  const currentValuesCents = plan.holdings.map((holding) => cents(holding.currentValue));
  const currentTotalCents = currentCashCents + currentValuesCents.reduce((total, value) => total + value, 0);
  // Allocation proportions remain unrounded; cents are only apportioned when creating dollar amounts.
  const fractions = plan.holdings.map((holding) => valid && budgetCents > 0 ? investableCents / budgetCents * holding.targetWeightPct / 100 : 0);
  const cashFraction = Math.max(0, 1 - fractions.reduce((total, value) => total + value, 0));
  const currentTargets = apportion(currentTotalCents, [...fractions, cashFraction]);
  const rows: StudioCalculatedRow[] = plan.holdings.map((holding, index) => {
    const targetPortfolioWeightPct = fractions[index] * 100;
    const currentWeightPct = currentTotalCents ? currentValuesCents[index] / currentTotalCents * 100 : 0;
    return {
      holding, instrument: byId.get(holding.instrumentId) ?? null, targetValue: targetCents[index] / 100,
      targetPortfolioWeightPct: pct(targetPortfolioWeightPct), currentWeightPct: pct(currentWeightPct),
      driftPct: pct(currentWeightPct - targetPortfolioWeightPct),
      rebalanceDelta: valid ? (currentTargets[index] - currentValuesCents[index]) / 100 : 0,
    };
  });
  const fundRows = rows.filter((row) => row.instrument?.kind === "fund");
  const fundCents = fundRows.reduce((total, row) => total + cents(row.targetValue), 0);
  const knownFundCents = fundRows.reduce((total, row) => total + (row.instrument?.expenseRatioPct !== null ? cents(row.targetValue) : 0), 0);
  const annualKnownCost = money(fundRows.reduce((total, row) => total + row.targetValue * (row.instrument?.expenseRatioPct ?? 0) / 100, 0));
  const fees = {
    annualKnownCost, weightedKnownExpenseRatioPct: budgetCents > 0 ? pct(annualKnownCost / (budgetCents / 100) * 100) : 0,
    coveragePct: fundCents > 0 ? pct(knownFundCents / fundCents * 100) : 100,
    unknownInstrumentIds: fundRows.filter((row) => row.instrument?.expenseRatioPct === null && row.targetValue > 0).map((row) => row.holding.instrumentId),
  };
  const shockFor = (instrument: StudioInstrument | null) => {
    switch (instrument?.assetClass) {
      case "us-equity": return plan.stress.usStocksPct;
      case "international-equity": return plan.stress.internationalStocksPct;
      case "global-equity": return plan.stress.globalStocksPct;
      case "fixed-income": return plan.stress.bondsPct;
      default: return 0;
    }
  };
  const stressRows = rows.map((row) => {
    const changePct = shockFor(row.instrument);
    const changeDollars = money(row.targetValue * changePct / 100);
    return { instrumentId: row.holding.instrumentId, changePct, changeDollars, endingValue: money(row.targetValue + changeDollars) };
  });
  const cashChange = money(targetCashCents / 100 * plan.stress.cashPct / 100);
  const changeDollars = money(stressRows.reduce((total, row) => total + row.changeDollars, cashChange));
  const contributionCents = cents(plan.contributionAmount);
  const futureTargets = apportion(currentTotalCents + contributionCents, [...fractions, cashFraction]);
  const gaps = plan.holdings.map((_, index) => valid ? Math.max(0, futureTargets[index] - currentValuesCents[index]) : 0);
  const gapTotal = gaps.reduce((total, gap) => total + gap, 0);
  const buyCents = apportion(Math.min(contributionCents, gapTotal), gaps);

  const exposureMap = new Map<string, { label: string; portfolioWeightPct: number; instrumentIds: string[] }>();
  let knownExposurePct = 0;
  rows.forEach((row) => {
    const instrument = row.instrument;
    if (!instrument) return;
    // Coverage describes documented issuer holdings only. Missing issuer data remains unknown.
    const exposedPct = instrument.exposures.reduce((total, exposure) => total + exposure.weightPct, 0);
    const coverage = Math.min(100, Math.max(0, instrument.exposureCoveragePct ?? 0), Math.max(0, exposedPct));
    knownExposurePct += row.targetPortfolioWeightPct * coverage / 100;
    const merged = new Map<string, { label: string; weight: number }>();
    instrument.exposures.forEach((exposure) => {
      if (!Number.isFinite(exposure.weightPct) || exposure.weightPct <= 0) return;
      // Two funds are the same exposure when they name the same issuer identifier,
      // not when they spell the issuer the same way. AGG files its largest issuer
      // as "United States Treasury" and SGOV files it as "United States of
      // America", both under LEI 254900HROIFWPRGM1V77.
      const key = (exposure.key ?? exposure.label).trim().toLowerCase();
      const previous = merged.get(key);
      // Filed weights are not normalised and a single issuer can exceed 100%
      // (SGOV's Treasury line is 107.8756%). Clamping keeps that issuer in the
      // overlap check; discarding it as out of range would hide the largest
      // exposure the fund has.
      merged.set(key, { label: exposure.label, weight: (previous?.weight ?? 0) + exposure.weightPct });
    });
    merged.forEach(({ label, weight }, key) => {
      if (row.targetPortfolioWeightPct <= 0) return;
      const existing = exposureMap.get(key);
      const portfolioWeightPct = row.targetPortfolioWeightPct * Math.min(100, weight) / 100;
      exposureMap.set(key, { label, portfolioWeightPct: (existing?.portfolioWeightPct ?? 0) + portfolioWeightPct, instrumentIds: [...existing?.instrumentIds ?? [], instrument.id] });
    });
  });
  return {
    valid, issues, budget: budgetCents / 100, investableBudget: investableCents / 100, totalWeightPct,
    targetCash: targetCashCents / 100, targetCashWeightPct: pct(cashFraction * 100), currentTotal: currentTotalCents / 100,
    rows, fees, stress: { rows: stressRows, changeDollars, changePct: budgetCents ? pct(changeDollars / (budgetCents / 100) * 100) : 0, endingValue: money(budgetCents / 100 + changeDollars) },
    contributions: { rows: plan.holdings.map((holding, index) => ({ instrumentId: holding.instrumentId, amount: buyCents[index] / 100 })), cash: (contributionCents - buyCents.reduce((total, value) => total + value, 0)) / 100, amount: contributionCents / 100 },
    orders: valid ? rows.map(orderFor) : [],
    overlaps: [...exposureMap.values()].filter((exposure) => exposure.instrumentIds.length > 1).map((exposure) => ({ ...exposure, portfolioWeightPct: pct(exposure.portfolioWeightPct) })).sort((a, b) => b.portfolioWeightPct - a.portfolioWeightPct),
    exposureCoveragePct: pct(knownExposurePct),
  };
}

/** Prevent a spreadsheet application from treating user-authored fields as formulas. */
function csvCell(value: string | number | boolean | null): string {
  let text = value === null ? "" : String(value);
  if (typeof value === "string" && /^\s*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function exportStudioCsv(plan: StudioPlan, catalog: readonly StudioInstrument[]): string {
  const result = calculateStudio(plan, catalog);
  const headers = ["Portfolio", "Mode", "Investment", "Symbol", "Investment target % after reserve", "Full portfolio target %", "Target USD", "Current USD", "Quote", "Quote date", "Quantity", "Quantity unit", "Principal USD", "Accrued interest USD", "Entered trade fee USD", "Estimated cost USD", "Unspent target USD", "Estimate complete", "Warnings", "Why I chose it", "Main risk", "What would change my mind"];
  const lines: (string | number | boolean | null)[][] = result.rows.map((row) => {
    const order = result.orders.find((item) => item.instrumentId === row.holding.instrumentId);
    return [plan.name, plan.mode, row.instrument?.name ?? row.holding.instrumentId, row.instrument?.symbol ?? "", row.holding.targetWeightPct,
      row.targetPortfolioWeightPct, row.targetValue, row.holding.currentValue, order?.price ?? null, order?.priceAsOf ?? "",
      order?.quantity ?? null, order?.unit ?? "", order?.principalCost ?? null, order?.accruedInterest ?? null,
      row.holding.tradeFee, order?.estimatedCost ?? null, order?.leftover ?? row.targetValue, order?.complete ?? false,
      [...result.issues, ...order?.warnings ?? []].join(" "), row.holding.research.why, row.holding.research.mainRisk, row.holding.research.whatWouldChangeMyMind];
  });
  lines.push([plan.name, plan.mode, "Cash reserve and unassigned cash", "USD", "", result.targetCashWeightPct, result.targetCash, plan.currentCash]);
  return [headers, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n");
}

export function exportStudioText(plan: StudioPlan, catalog: readonly StudioInstrument[]): string {
  const result = calculateStudio(plan, catalog);
  const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  const lines = [plan.name, `Mode: ${plan.mode}. Saved: ${plan.updatedAt}. Portfolio ID: ${plan.id}.`, "",
    "Goal and limits", `Purpose: ${plan.goal.purpose || "Not recorded"}`, `Time available: ${plan.goal.horizonYears} years. Account: ${plan.goal.accountType}.`,
    `Starting amount: ${dollars(plan.goal.budget)}. Cash reserve: ${dollars(plan.goal.cashReserve)}. Monthly contribution: ${dollars(plan.goal.monthlyContribution)}.`,
    `Loss I am willing to consider: ${plan.goal.lossTolerancePct}%. Constraints: ${plan.goal.constraints || "Not recorded"}`, "",
    "Holdings and research", "Investment target percentages apply to the amount remaining after the cash reserve.",
    ...result.issues.map((issue) => `Needs attention: ${issue}`)];
  result.rows.forEach((row) => {
    const instrument = row.instrument;
    lines.push("", `${instrument?.name ?? row.holding.instrumentId} (${instrument?.symbol ?? row.holding.instrumentId})`,
      `Target: ${row.holding.targetWeightPct}% after reserve; ${row.targetPortfolioWeightPct}% of total; ${dollars(row.targetValue)}. Current: ${dollars(row.holding.currentValue)}.`,
      `Why: ${row.holding.research.why || "Not recorded"}`, `Main risk: ${row.holding.research.mainRisk || "Not recorded"}`,
      `What would change my mind: ${row.holding.research.whatWouldChangeMyMind || "Not recorded"}`,
      `Sources reviewed: ${row.holding.research.reviewedSources ? "Yes" : "No"}`,
      ...instrument?.sources.map((source) => `Source: ${source.label}; ${source.asOf}; ${source.url}`) ?? []);
  });
  lines.push("", `Cash reserve plus unassigned money: ${dollars(result.targetCash)}.`, "", "Buying worksheet",
    "Estimates are based on entered quotes; verify prices, quantities, available cash, taxes, and broker fees before buying. No orders have been placed.");
  result.orders.forEach((order) => {
    const instrument = catalog.find((item) => item.id === order.instrumentId);
    lines.push(`${instrument?.symbol ?? order.instrumentId}: ${order.price === null ? "Quote needed; dollar target only." : `${order.quantity} ${order.unit}; quote ${order.price} as of ${order.priceAsOf || "date missing"}; principal ${dollars(order.principalCost)}; accrued interest ${order.accruedInterest === null ? "unknown, excluded" : dollars(order.accruedInterest)}; estimated cost ${dollars(order.estimatedCost)}; unspent ${dollars(order.leftover)}.`}`,
      ...order.warnings.map((warning) => `  ${warning}`));
  });
  lines.push("", "Checks", `Known annual fund cost at unchanged value: ${dollars(result.fees.annualKnownCost)}. Fund fee coverage: ${result.fees.coveragePct}%. Trading costs and taxes are separate.`,
    `Hypothetical scenario: US stocks ${plan.stress.usStocksPct}%; international stocks ${plan.stress.internationalStocksPct}%; global stocks ${plan.stress.globalStocksPct}%; bonds ${plan.stress.bondsPct}%; cash ${plan.stress.cashPct}%.`,
    `Scenario change: ${dollars(result.stress.changeDollars)} (${result.stress.changePct}%); ending value: ${dollars(result.stress.endingValue)}. This is an assumed scenario, not a forecast.`,
    `Documented issuer exposure: ${result.exposureCoveragePct}% of the portfolio. Unknown holdings prevent a complete overlap check.`,
    ...result.overlaps.map((overlap) => `Known overlap: ${overlap.label}, ${overlap.portfolioWeightPct}% of total across ${overlap.instrumentIds.join(", ")}.`),
    "", "Operating rules", `Review: ${plan.rules.reviewFrequency}. Check when a weight moves ${plan.rules.driftThresholdPct} percentage points from target.`,
    `Contributions: ${plan.rules.contributionRule || "Not recorded"}`, `Before selling: ${plan.rules.sellRule || "Not recorded"}`, `Guardrails: ${plan.rules.guardrails || "Not recorded"}`, "",
    `New contribution worksheet: ${dollars(result.contributions.amount)}. Existing cash stays separate.`,
    ...result.contributions.rows.map((row) => `${catalog.find((item) => item.id === row.instrumentId)?.symbol ?? row.instrumentId}: ${dollars(row.amount)} toward its shortfall.`),
    `Contribution remaining in cash: ${dollars(result.contributions.cash)}. Dollar targets do not account for broker purchase minimums.`, "",
    "This file is a planning record. Keep a JSON backup to restore the editable portfolio in Studio.");
  return lines.join("\n");
}
