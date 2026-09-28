/**
 * Saved return comparisons: the evidence itself, recomputed whenever it is read.
 * Method: docs/source-audits/studio-portfolio-return-comparison.md.
 */
import {
  computeComparison, COMPARISON_METHOD, MAX_COMPARISON_MONTHS, MAX_COMPARISON_SERIES,
  MIN_COMPARISON_MONTHS, type AllocationResult, type AllocationSnapshot, type ComparisonInput, type SeriesSnapshot,
} from "./return-comparison";
import type { StudioProject } from "./schema";

export const MAX_SAVED_COMPARISONS = 20;
export const MAX_COMPARISON_NAME = 300;
export const MAX_COMPARISON_REASON = 10_000;

export interface StoredResult {
  periodReturn: number;
  endValue: number;
  volatility: number;
  largestFall: number;
  peak: string | null;
  trough: string | null;
}

export interface SavedReturnComparison {
  id: string;
  name: string;
  reason: string;
  createdAt: string;
  method: typeof COMPARISON_METHOD;
  /** Stated assumption: cash earns 0% a month. */
  cashReturnPct: 0;
  input: ComparisonInput;
  results: { a: StoredResult; b: StoredResult };
}

const storedResult = (result: AllocationResult): StoredResult => ({
  periodReturn: result.periodReturn, endValue: result.growth.at(-1)!, volatility: result.volatility!,
  largestFall: result.largestFall.value, peak: result.largestFall.peak, trough: result.largestFall.trough,
});

/** A complete comparison, frozen with its data, weights, method and results. */
export function createSavedComparison(input: ComparisonInput, name: string, reason: string, now: string, id = `comparison-${crypto.randomUUID()}`): SavedReturnComparison {
  if (!name.trim() || name.length > MAX_COMPARISON_NAME) throw new Error(`Name the comparison in up to ${MAX_COMPARISON_NAME} characters.`);
  if (!reason.trim() || reason.length > MAX_COMPARISON_REASON) throw new Error("Write why you are keeping this comparison.");
  const result = computeComparison(input);
  if (!result.ok) throw new Error(result.error);
  if (!result.complete) throw new Error(`A comparison needs at least ${MIN_COMPARISON_MONTHS} months to save.`);
  return {
    id, name: name.trim(), reason: reason.trim(), createdAt: now, method: COMPARISON_METHOD, cashReturnPct: 0,
    input: structuredClone(input), results: { a: storedResult(result.a), b: storedResult(result.b) },
  };
}

const plainObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const onlyKeys = (value: Record<string, unknown>, keys: string[]) => Object.keys(value).every((key) => keys.includes(key));
const shortText = (value: unknown, max: number, empty = false) => typeof value === "string" && value.length <= max && (empty || value.trim().length > 0);
const nullableText = (value: unknown, max: number) => value === null || shortText(value, max);
const closeTo = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

function validAllocation(value: unknown): value is AllocationSnapshot {
  if (!plainObject(value) || !onlyKeys(value, ["alternativeId", "name", "budget", "cashReserve", "positions"])) return false;
  if (!shortText(value.alternativeId, 200) || !shortText(value.name, 300, true) || typeof value.budget !== "number" || typeof value.cashReserve !== "number") return false;
  return Array.isArray(value.positions) && value.positions.length <= MAX_COMPARISON_SERIES && value.positions.every((position) =>
    plainObject(position) && onlyKeys(position, ["instrumentId", "targetWeightPct"]) && shortText(position.instrumentId, 200) && typeof position.targetWeightPct === "number");
}

function validSeries(value: unknown): value is SeriesSnapshot {
  if (!plainObject(value) || !onlyKeys(value, ["instrumentId", "key", "kind", "label", "sourceName", "sourceUrl", "currency", "basis", "method", "seriesId", "classId", "importedAt", "builtOn", "accessions", "values"])) return false;
  return shortText(value.instrumentId, 200) && shortText(value.key, 300) && (value.kind === "public" || value.kind === "import")
    && shortText(value.label, 400) && shortText(value.sourceName, 400) && shortText(value.sourceUrl, 2000, true)
    && typeof value.currency === "string" && /^[A-Z]{3}$/.test(value.currency)
    && (value.basis === "net-asset-value" || value.basis === "market-price")
    && (value.method === "reported-total-return" || value.method === "adjusted-close")
    && nullableText(value.seriesId, 40) && nullableText(value.classId, 40) && nullableText(value.importedAt, 40) && nullableText(value.builtOn, 40)
    && (value.accessions === null || (Array.isArray(value.accessions) && value.accessions.length <= MAX_COMPARISON_MONTHS && value.accessions.every((item) => shortText(item, 40))))
    && Array.isArray(value.values) && value.values.length <= MAX_COMPARISON_MONTHS && value.values.every((item) => typeof item === "number");
}

function validStored(value: unknown): value is StoredResult {
  return plainObject(value) && onlyKeys(value, ["periodReturn", "endValue", "volatility", "largestFall", "peak", "trough"])
    && ["periodReturn", "endValue", "volatility", "largestFall"].every((key) => typeof value[key] === "number")
    && nullableText(value.peak, 10) && nullableText(value.trough, 10);
}

/**
 * Backups are untrusted, and a pasted number is not evidence: the inputs are
 * validated and the results recomputed, and a saved figure that disagrees
 * with its own inputs makes the record invalid.
 */
export function validSavedComparison(value: unknown): value is SavedReturnComparison {
  if (!plainObject(value) || !onlyKeys(value, ["id", "name", "reason", "createdAt", "method", "cashReturnPct", "input", "results"])) return false;
  if (!shortText(value.id, 200) || !shortText(value.name, MAX_COMPARISON_NAME) || !shortText(value.reason, MAX_COMPARISON_REASON)
    || typeof value.createdAt !== "string" || !Number.isFinite(Date.parse(value.createdAt))
    || value.method !== COMPARISON_METHOD || value.cashReturnPct !== 0) return false;
  const input = value.input;
  if (!plainObject(input) || !onlyKeys(input, ["a", "b", "series", "period"]) || !validAllocation(input.a) || !validAllocation(input.b)) return false;
  if (!Array.isArray(input.series) || input.series.length > MAX_COMPARISON_SERIES || !input.series.every(validSeries)) return false;
  const period = input.period;
  if (!plainObject(period) || !onlyKeys(period, ["start", "months"]) || typeof period.start !== "string" || typeof period.months !== "number") return false;
  if ((input.series as SeriesSnapshot[]).some((item) => item.accessions !== null && item.accessions.length !== period.months)) return false;
  const results = value.results;
  if (!plainObject(results) || !onlyKeys(results, ["a", "b"]) || !validStored(results.a) || !validStored(results.b)) return false;
  const recomputed = computeComparison(input as unknown as ComparisonInput);
  if (!recomputed.ok || !recomputed.complete) return false;
  const matches = (stored: StoredResult, fresh: AllocationResult) => {
    const expected = storedResult(fresh);
    return closeTo(stored.periodReturn, expected.periodReturn) && closeTo(stored.endValue, expected.endValue)
      && closeTo(stored.volatility, expected.volatility) && closeTo(stored.largestFall, expected.largestFall)
      && stored.peak === expected.peak && stored.trough === expected.trough;
  };
  return matches(results.a as unknown as StoredResult, recomputed.a) && matches(results.b as unknown as StoredResult, recomputed.b);
}

/** Add a saved comparison. It never touches the selected allocation. */
export function saveReturnComparison<T extends Pick<StudioProject, "returnComparisons">>(project: T, record: SavedReturnComparison, now: string): T & { updatedAt: string } {
  const existing = project.returnComparisons ?? [];
  if (existing.length >= MAX_SAVED_COMPARISONS) throw new Error(`Keep at most ${MAX_SAVED_COMPARISONS} saved comparisons. Remove one first.`);
  if (!validSavedComparison(record)) throw new Error("This comparison could not be verified from its own data.");
  return { ...project, updatedAt: now, returnComparisons: [...existing, structuredClone(record)] };
}

export function removeReturnComparison<T extends Pick<StudioProject, "returnComparisons">>(project: T, id: string, now: string): T & { updatedAt: string } {
  return { ...project, updatedAt: now, returnComparisons: (project.returnComparisons ?? []).filter((item) => item.id !== id) };
}
