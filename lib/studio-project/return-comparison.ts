/**
 * How two saved allocations behaved over the same past months.
 *
 * Method and sources: docs/source-audits/studio-portfolio-return-comparison.md.
 * Today's target weights are replayed against past monthly total returns,
 * reset to those weights at the start of every month ("rebalanced monthly"),
 * with cash earning an assumed 0% a month. Both allocations always use the same
 * months, histories and method. Nothing here forecasts, optimizes or chooses.
 */
import type { PortfolioAlternative, StudioProject } from "./schema";
import { monthAt, monthNumber, type MonthlyReturn, type ReturnBasis, type ReturnHistory } from "./total-returns";

export const COMPARISON_METHOD = "monthly-rebalanced-cash-zero-v1";
/** A sample variance needs two observations. Two months is a minimum, not a reliable estimate. */
export const MIN_COMPARISON_MONTHS = 2;
export const MAX_COMPARISON_SERIES = 100;
export const MAX_COMPARISON_MONTHS = 1200;
/** The only portfolio money unit Studio supports; no currency conversion in this release. */
export const PORTFOLIO_CURRENCY = "USD";

/** One history the learner can choose for one investment. */
export interface HistoryOption {
  key: string;
  instrumentId: string;
  kind: "public" | "import";
  label: string;
  sourceName: string;
  sourceUrl: string;
  currency: string;
  basis: ReturnBasis;
  method: ReturnHistory["method"];
  seriesId: string | null;
  classId: string | null;
  importedAt: string | null;
  builtOn: string | null;
  observations: MonthlyReturn[];
  /** Public histories: the SEC accession behind each month. */
  accessions: Record<string, string> | null;
}

/** The part of an allocation this comparison depends on, frozen when it runs. */
export interface AllocationSnapshot {
  alternativeId: string;
  name: string;
  budget: number;
  cashReserve: number;
  /** Every position with a positive target, as a percentage of the money after the reserve. */
  positions: { instrumentId: string; targetWeightPct: number }[];
}

/** One chosen history, cut to the comparison's months. */
export interface SeriesSnapshot {
  instrumentId: string;
  key: string;
  kind: "public" | "import";
  label: string;
  sourceName: string;
  sourceUrl: string;
  currency: string;
  basis: ReturnBasis;
  method: ReturnHistory["method"];
  seriesId: string | null;
  classId: string | null;
  importedAt: string | null;
  builtOn: string | null;
  accessions: string[] | null;
  values: number[];
}

export interface ComparisonPeriod { start: string; months: number }

export interface ComparisonInput {
  a: AllocationSnapshot;
  b: AllocationSnapshot;
  series: SeriesSnapshot[];
  period: ComparisonPeriod;
}

export interface LargestFall {
  value: number;
  /** "start" is the boundary before the first return month; otherwise a month-end. Null when nothing fell. */
  peak: string | null;
  trough: string | null;
}

export interface AllocationResult {
  weights: { instrumentId: string; weight: number }[];
  cashWeight: number;
  monthly: number[];
  /** Growth of 100: the starting 100, then one value per month-end. */
  growth: number[];
  periodReturn: number;
  meanMonthly: number;
  /** Null with fewer than two months. */
  variance: number | null;
  volatility: number | null;
  largestFall: LargestFall;
}

export type ComparisonResult =
  | { ok: true; months: string[]; complete: boolean; a: AllocationResult; b: AllocationResult; covariance: number[][] | null }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Weights
// ---------------------------------------------------------------------------

/** The same six-decimal rounding as calculateStudio, so exactly 100% is exactly 100%. */
const round6 = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

export type WeightsResult =
  | { ok: true; weights: { instrumentId: string; weight: number }[]; cash: number }
  | { ok: false; error: string };

/** Whole-portfolio weights: ((budget - reserve) / budget) x after-reserve percentage. Cash is the rest. */
export function wholeWeights(allocation: AllocationSnapshot): WeightsResult {
  const { budget, cashReserve, positions } = allocation;
  if (!Number.isFinite(budget) || budget <= 0) return { ok: false, error: `${allocation.name}: the starting amount must be above zero.` };
  if (!Number.isFinite(cashReserve) || cashReserve < 0 || cashReserve > budget) return { ok: false, error: `${allocation.name}: the cash reserve must be between zero and the starting amount.` };
  if (positions.length > MAX_COMPARISON_SERIES) return { ok: false, error: `${allocation.name}: compare at most ${MAX_COMPARISON_SERIES} investments.` };
  const seen = new Set<string>();
  for (const position of positions) {
    if (!position.instrumentId || seen.has(position.instrumentId)) return { ok: false, error: `${allocation.name}: each investment may appear once.` };
    seen.add(position.instrumentId);
    if (!Number.isFinite(position.targetWeightPct) || position.targetWeightPct <= 0 || position.targetWeightPct > 100) {
      return { ok: false, error: `${allocation.name}: every weight must be a number above 0% and at most 100%.` };
    }
  }
  if (round6(positions.reduce((sum, position) => sum + position.targetWeightPct, 0)) > 100) {
    return { ok: false, error: `${allocation.name}: its weights add up to more than 100% of the money after the reserve.` };
  }
  const investable = (budget - cashReserve) / budget;
  const weights = positions.map((position) => ({ instrumentId: position.instrumentId, weight: investable * position.targetWeightPct / 100 }));
  const invested = weights.reduce((sum, item) => sum + item.weight, 0);
  // Only rounding noise may take cash below zero; anything larger was refused above.
  return { ok: true, weights, cash: Math.max(0, 1 - invested) };
}

/** Freeze the parts of a saved allocation this comparison uses. Zero weights need no history. */
export function allocationSnapshot(project: Pick<StudioProject, "goal">, alternative: PortfolioAlternative): AllocationSnapshot {
  return {
    alternativeId: alternative.id,
    name: alternative.name,
    budget: project.goal.budget,
    cashReserve: project.goal.cashReserve,
    positions: alternative.positions
      .filter((position) => position.targetWeightPct > 0)
      .map((position) => ({ instrumentId: position.instrumentId, targetWeightPct: position.targetWeightPct })),
  };
}

// ---------------------------------------------------------------------------
// Histories and coverage
// ---------------------------------------------------------------------------

export interface CoverageRow {
  instrumentId: string;
  symbol: string;
  /** Unsupported in this release: an individual bond with a positive weight. */
  bond: boolean;
  options: HistoryOption[];
  /** The chosen history, or null when none exists or the learner must pick one. */
  chosen: HistoryOption | null;
}

/** The union of investments with a positive weight in either allocation, in a stable order. */
export function comparedInstruments(a: AllocationSnapshot, b: AllocationSnapshot): string[] {
  const ids: string[] = [];
  for (const position of [...a.positions, ...b.positions]) if (!ids.includes(position.instrumentId)) ids.push(position.instrumentId);
  return ids;
}

export type Alignment =
  | { ok: true; start: string; end: string; months: number; excluded: { instrumentId: string; before: number; after: number }[] }
  | { ok: false; kind: "missing" | "choose" | "bond" | "currency" | "basis" | "no-overlap" | "too-long" | "range" | "all-cash"; error: string; instrumentIds: string[] };

/**
 * One aligned matrix for every compared investment. Only the outer months are
 * trimmed to the common overlap; nothing inside is filled, dropped or replaced.
 * A narrower range applies to both allocations together.
 */
export function alignHistories(rows: CoverageRow[], range: { start?: string; end?: string } = {}): Alignment {
  const bonds = rows.filter((row) => row.bond);
  if (bonds.length) return { ok: false, kind: "bond", error: `${bonds.map((row) => row.symbol).join(", ")}: individual bonds have no monthly return history in this release. Keep the allocation; compare one without this bond, or set its weight to zero in a copy.`, instrumentIds: bonds.map((row) => row.instrumentId) };
  const missing = rows.filter((row) => !row.options.length);
  if (missing.length) return { ok: false, kind: "missing", error: `No monthly total-return history for ${missing.map((row) => row.symbol).join(", ")}. Import one on this page before comparing.`, instrumentIds: missing.map((row) => row.instrumentId) };
  const unchosen = rows.filter((row) => !row.chosen);
  if (unchosen.length) return { ok: false, kind: "choose", error: `Choose which history to use for ${unchosen.map((row) => row.symbol).join(", ")}.`, instrumentIds: unchosen.map((row) => row.instrumentId) };
  const chosen = rows.map((row) => row.chosen!);
  if (!chosen.length) {
    // Both entirely cash: there is no market history to borrow months from.
    const start = monthNumber(range.start ?? "");
    const end = monthNumber(range.end ?? "");
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return { ok: false, kind: "all-cash", error: "Both allocations are entirely cash. Choose the months to compare.", instrumentIds: [] };
    if (end - start + 1 > MAX_COMPARISON_MONTHS) return { ok: false, kind: "too-long", error: `Compare at most ${MAX_COMPARISON_MONTHS} months.`, instrumentIds: [] };
    return { ok: true, start: monthAt(start), end: monthAt(end), months: end - start + 1, excluded: [] };
  }
  const wrongCurrency = chosen.filter((option) => option.currency !== PORTFOLIO_CURRENCY);
  if (wrongCurrency.length) return { ok: false, kind: "currency", error: `${wrongCurrency.map((option) => `${rows.find((row) => row.instrumentId === option.instrumentId)!.symbol} is in ${option.currency}`).join("; ")}. This comparison uses ${PORTFOLIO_CURRENCY} histories only and does not convert currencies.`, instrumentIds: wrongCurrency.map((option) => option.instrumentId) };
  const bases = new Set(chosen.map((option) => option.basis));
  if (bases.size > 1) {
    const describe = (basis: ReturnBasis) => basis === "net-asset-value" ? "fund net asset value" : "market price";
    return { ok: false, kind: "basis", error: `These histories mix ${[...bases].map(describe).join(" and ")} returns: ${chosen.map((option) => `${rows.find((row) => row.instrumentId === option.instrumentId)!.symbol} ${describe(option.basis)}`).join(", ")}. Choose histories on one basis.`, instrumentIds: chosen.map((option) => option.instrumentId) };
  }
  const spans = chosen.map((option) => ({ id: option.instrumentId, first: monthNumber(option.observations[0].month), last: monthNumber(option.observations.at(-1)!.month) }));
  let start = Math.max(...spans.map((span) => span.first));
  let end = Math.min(...spans.map((span) => span.last));
  if (end < start) {
    const describe = spans.map((span) => `${rows.find((row) => row.instrumentId === span.id)!.symbol} ${monthAt(span.first)} to ${monthAt(span.last)}`).join("; ");
    return { ok: false, kind: "no-overlap", error: `These histories share no month: ${describe}.`, instrumentIds: spans.map((span) => span.id) };
  }
  if (range.start || range.end) {
    const from = range.start ? monthNumber(range.start) : start;
    const to = range.end ? monthNumber(range.end) : end;
    if (!Number.isFinite(from) || !Number.isFinite(to) || from < start || to > end || to < from) {
      return { ok: false, kind: "range", error: `Choose months between ${monthAt(start)} and ${monthAt(end)}, the start no later than the end.`, instrumentIds: [] };
    }
    start = from; end = to;
  }
  if (end - start + 1 > MAX_COMPARISON_MONTHS) return { ok: false, kind: "too-long", error: `Compare at most ${MAX_COMPARISON_MONTHS} months.`, instrumentIds: [] };
  return {
    ok: true, start: monthAt(start), end: monthAt(end), months: end - start + 1,
    excluded: spans.map((span) => ({ instrumentId: span.id, before: start - span.first, after: span.last - end })),
  };
}

/** Cut each chosen history to the aligned months, keeping its identity and provenance. */
export function seriesSnapshots(rows: CoverageRow[], period: ComparisonPeriod): SeriesSnapshot[] {
  const first = monthNumber(period.start);
  return rows.map((row) => {
    const option = row.chosen!;
    const offset = first - monthNumber(option.observations[0].month);
    const slice = option.observations.slice(offset, offset + period.months);
    return {
      instrumentId: row.instrumentId, key: option.key, kind: option.kind, label: option.label,
      sourceName: option.sourceName, sourceUrl: option.sourceUrl, currency: option.currency, basis: option.basis, method: option.method,
      seriesId: option.seriesId, classId: option.classId, importedAt: option.importedAt, builtOn: option.builtOn,
      accessions: option.accessions ? slice.map((observation) => option.accessions![observation.month]) : null,
      values: slice.map((observation) => observation.value),
    };
  });
}

// ---------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------

export function periodMonths(period: ComparisonPeriod): string[] {
  const start = monthNumber(period.start);
  return Array.from({ length: period.months }, (_, index) => monthAt(start + index));
}

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

/** Sample covariance matrix with the n - 1 denominator (NIST 6.5.4.1). Needs n >= 2. */
export function sampleCovariance(columns: number[][]): number[][] {
  const n = columns[0]?.length ?? 0;
  if (n < 2) throw new Error("A sample covariance needs at least two observations.");
  const means = columns.map(mean);
  return columns.map((x, i) => columns.map((y, j) => {
    let sum = 0;
    for (let t = 0; t < n; t++) sum += (x[t] - means[i]) * (y[t] - means[j]);
    return sum / (n - 1);
  }));
}

/** Sample variance of one series (NIST 1.3.5.6). */
export function sampleVariance(values: number[]): number {
  return sampleCovariance([values])[0][0];
}

/**
 * The largest fall from an earlier month-end peak. The starting 100 counts as
 * a peak, so a first-month loss is a fall. The peak is the first month-end at
 * the running maximum; the trough is the first month-end at the largest fall.
 */
export function largestFall(growth: number[], months: string[]): LargestFall {
  let peakIndex = 0;
  let best: LargestFall = { value: 0, peak: null, trough: null };
  for (let t = 1; t < growth.length; t++) {
    if (growth[t] > growth[peakIndex]) peakIndex = t;
    const fall = 1 - growth[t] / growth[peakIndex];
    if (fall > best.value) best = { value: fall, peak: peakIndex === 0 ? "start" : months[peakIndex - 1], trough: months[t - 1] };
  }
  return best;
}

function checkInput(input: ComparisonInput): string | null {
  const { period, series } = input;
  if (!Number.isFinite(monthNumber(period.start)) || !Number.isInteger(period.months) || period.months < 1 || period.months > MAX_COMPARISON_MONTHS) return "The comparison period is invalid.";
  if (series.length > MAX_COMPARISON_SERIES) return `Compare at most ${MAX_COMPARISON_SERIES} investments.`;
  const needed = comparedInstruments(input.a, input.b);
  const ids = series.map((item) => item.instrumentId);
  if (new Set(ids).size !== ids.length || ids.length !== needed.length || !needed.every((id) => ids.includes(id))) {
    return "Every investment with a weight needs exactly one history, and no other history may be included.";
  }
  const currencies = new Set(series.map((item) => item.currency));
  const bases = new Set(series.map((item) => item.basis));
  if (series.length && (currencies.size !== 1 || !currencies.has(PORTFOLIO_CURRENCY) || bases.size !== 1)) return "Histories must share one currency (USD) and one basis.";
  for (const item of series) {
    if (item.values.length !== period.months || item.values.some((value) => !Number.isFinite(value) || value <= -1)) {
      return "Each history needs one finite return above −100% for every month in the period.";
    }
  }
  return null;
}

function allocationResult(allocation: AllocationSnapshot, input: ComparisonInput, months: string[], covariance: number[][] | null): AllocationResult | string {
  const weights = wholeWeights(allocation);
  if (!weights.ok) return weights.error;
  const vector = input.series.map((item) => weights.weights.find((weight) => weight.instrumentId === item.instrumentId)?.weight ?? 0);
  const monthly = months.map((_, t) => input.series.reduce((sum, item, i) => sum + vector[i] * item.values[t], 0) + weights.cash * 0);
  const growth = [100];
  for (const r of monthly) growth.push(growth.at(-1)! * (1 + r));
  if (growth.some((value) => !Number.isFinite(value) || value <= 0)) return "These returns are outside the range this comparison can represent.";
  const n = monthly.length;
  let variance: number | null = null;
  if (covariance && n >= MIN_COMPARISON_MONTHS) {
    let quadratic = 0;
    let scale = 0;
    for (let i = 0; i < vector.length; i++) for (let j = 0; j < vector.length; j++) {
      const term = vector[i] * vector[j] * covariance[i][j];
      quadratic += term;
      scale += Math.abs(term);
    }
    // w'Sw must agree with the portfolio series' own sample variance (see the audit's derivation).
    const direct = sampleVariance(monthly);
    const tolerance = 1e-9 * scale + 1e-18;
    if (!Number.isFinite(quadratic) || !Number.isFinite(direct) || Math.abs(quadratic - direct) > Math.max(tolerance, 1e-9 * Math.abs(direct))) {
      return "The variance calculation did not reconcile; no result is shown.";
    }
    const zeroNoise = 1e-12 * (1 + scale);
    if (quadratic < -zeroNoise) return "The variance calculation produced a negative value; no result is shown.";
    variance = Math.max(0, quadratic);
  }
  return {
    weights: weights.weights, cashWeight: weights.cash, monthly, growth,
    periodReturn: growth.at(-1)! / 100 - 1,
    meanMonthly: mean(monthly),
    variance, volatility: variance === null ? null : Math.sqrt(variance),
    largestFall: largestFall(growth, months),
  };
}

/** Both allocations over the same months, histories and method. */
export function computeComparison(input: ComparisonInput): ComparisonResult {
  const problem = checkInput(input);
  if (problem) return { ok: false, error: problem };
  const months = periodMonths(input.period);
  const complete = months.length >= MIN_COMPARISON_MONTHS;
  const covariance = complete && input.series.length ? sampleCovariance(input.series.map((item) => item.values)) : complete ? [] : null;
  const a = allocationResult(input.a, input, months, covariance);
  if (typeof a === "string") return { ok: false, error: a };
  const b = allocationResult(input.b, input, months, covariance);
  if (typeof b === "string") return { ok: false, error: b };
  return { ok: true, months, complete, a, b, covariance: covariance && covariance.length ? covariance : null };
}

export interface MonthRow {
  instrumentId: string;
  monthReturn: number;
  a: { weight: number; contribution: number };
  b: { weight: number; contribution: number };
}

/** One month: each investment's weighted return, and cash. Rows plus cash equal each total. */
export function monthBreakdown(input: ComparisonInput, a: AllocationResult, b: AllocationResult, t: number): { rows: MonthRow[]; cash: { a: number; b: number }; total: { a: number; b: number } } {
  const weightOf = (result: AllocationResult, id: string) => result.weights.find((item) => item.instrumentId === id)?.weight ?? 0;
  const rows = input.series.map((item) => {
    const monthReturn = item.values[t];
    const wa = weightOf(a, item.instrumentId);
    const wb = weightOf(b, item.instrumentId);
    return { instrumentId: item.instrumentId, monthReturn, a: { weight: wa, contribution: wa * monthReturn }, b: { weight: wb, contribution: wb * monthReturn } };
  });
  return { rows, cash: { a: a.cashWeight, b: b.cashWeight }, total: { a: a.monthly[t], b: b.monthly[t] } };
}
