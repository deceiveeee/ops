/**
 * The screen that puts a company beside the competitors it names, with every
 * step of the arithmetic kept so the surface can show it.
 *
 * Conventions here are decided, not inherited. The published screen this
 * project studied (docs/source-audits/studio-research-coverage.md §2) leaves
 * seven questions open — the quantile convention, the winsorization limits,
 * sample or population standard deviation, zero variance, undefined ratios,
 * weights when a measure is missing, and ties — and each one changes the
 * answer. They are settled in docs/source-audits/studio-quantitative-methods.md
 * §1.2, worked by hand in §1.4, and restated at the function that implements
 * them.
 *
 * Two properties matter more than any of the arithmetic:
 *
 * - **Nothing missing becomes a zero.** A ratio that is not defined — a company
 *   with negative equity, a bank whose return on capital means something else —
 *   comes through as missing with its reason, and is left out of that measure's
 *   mean, its standard deviation and its order.
 * - **Every intermediate value is returned**, not just the score: the limits
 *   winsorization used, who was pulled to them, the mean, the standard
 *   deviation, each company's value before and after, its z-score, and how many
 *   measures its composite rests on. A screen whose working cannot be read is
 *   an oracle, and the point of this one is that a learner can follow it.
 *
 * Nothing here touches the network, and none of it decides anything: the order
 * that comes out ranks these companies on these measures for one year.
 */

/** Which way a measure is read. Stated on screen, because it is a choice. */
export type Direction = "higher" | "lower";

/** One company's value for one measure, or why it has none. */
export type Observation = { value: number } | { missing: string };
export const hasValue = (observation: Observation): observation is { value: number } => "value" in observation;

export interface MeasureSpec {
  id: string;
  direction: Direction;
  /**
   * How much this measure counts, relative to the others. Equal by default.
   * A company missing a measure has the remaining weights rescaled to sum to
   * one over what it does have, and its row says how many measures that is.
   */
  weight?: number;
}

export interface ScreenRow {
  id: string;
  values: Record<string, Observation>;
}

/** What winsorizing and standardising one measure did, in full. */
export interface MeasureWorking {
  id: string;
  direction: Direction;
  weight: number;
  /** Companies holding a value for this measure. */
  counted: number;
  /** The winsorization limits, or null when no value was counted. */
  lowerLimit: number | null;
  upperLimit: number | null;
  /** Companies whose value was pulled to a limit, in row order. */
  pulledIn: string[];
  mean: number | null;
  /** Sample standard deviation. Zero when every counted value is the same. */
  standardDeviation: number | null;
  /** Every counted company has the same value, so no order comes from this measure. */
  level: boolean;
  /** Fewer than two companies have it, so there is nothing to compare against. */
  tooFewToCompare: boolean;
  /** Whether the extremes were pulled in at all. Below four companies they are not. */
  winsorized: boolean;
}

export interface Cell {
  measureId: string;
  /** As measured. */
  value: number;
  /** After winsorizing; the same number unless it was pulled to a limit. */
  used: number;
  pulled: boolean;
  /** Already turned round where the measure counts better when lower. */
  z: number;
  /** Place on this measure alone, ties sharing a place. */
  place: number;
}

export interface RowScore {
  id: string;
  cells: Cell[];
  /** Measures this company has no usable value for, each with its reason. */
  missing: { measureId: string; reason: string }[];
  /** The weighted mean of its z-scores, or null when it has none. */
  composite: number | null;
  /** How many measures the composite rests on, out of how many were asked for. */
  scored: number;
  of: number;
  /** Place overall, ties sharing a place. Null when nothing could be scored. */
  place: number | null;
}

export interface ScreenResult {
  measures: MeasureWorking[];
  rows: RowScore[];
  /** Row ids in the order they placed, best first; unscored companies last, in the order given. */
  order: string[];
}

/**
 * A quantile by linear interpolation between order statistics: `h = (n − 1)p`,
 * then between the values either side of it.
 *
 * The convention NumPy, Excel's PERCENTILE.INC, R's type 7 and d3 use, chosen
 * so a learner checking a limit in a spreadsheet gets the number Studio shows.
 * The list must be sorted; one value returns itself.
 */
export function quantile(sorted: number[], p: number): number {
  if (!sorted.length) return NaN;
  const h = (sorted.length - 1) * p;
  const low = Math.floor(h);
  const high = Math.ceil(h);
  return sorted[low] + (h - low) * (sorted[high] - sorted[low]);
}

/**
 * Values with the extremes pulled in to the 10th and 90th percentiles.
 *
 * The 10th and 90th rather than the published screen's 5th and 95th: with the
 * ten names that screen used, the 5th percentile falls less than half way from
 * the lowest value to the second-lowest, so it barely reaches the one
 * observation it exists to hold back, and a learner's list is often shorter
 * still. Reported rather than applied silently — with a short list the usual
 * answer is that nothing moved.
 */
export function winsorize(values: number[], lower = 0.1, upper = 0.9): { used: number[]; lowerLimit: number; upperLimit: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const lowerLimit = quantile(sorted, lower);
  const upperLimit = quantile(sorted, upper);
  return { used: values.map((value) => Math.min(upperLimit, Math.max(lowerLimit, value))), lowerLimit, upperLimit };
}

/**
 * Standard scores against the group's own mean, using the **sample** standard
 * deviation.
 *
 * Sample, dividing by n − 1, because these companies are a sample of the ones
 * that could have been compared, and because it is what a spreadsheet's STDEV
 * gives. Two cases return no scores rather than a wrong one: fewer than two
 * values, where there is nothing to compare against, and a group whose values
 * are all the same, where the spread is zero and any order would be invented.
 */
export function standardScores(values: number[]): { mean: number | null; standardDeviation: number | null; z: number[] | null } {
  if (values.length < 2) return { mean: values.length ? values[0] : null, standardDeviation: null, z: null };
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / (values.length - 1);
  const standardDeviation = Math.sqrt(variance);
  if (standardDeviation === 0) return { mean, standardDeviation, z: values.map(() => 0) };
  return { mean, standardDeviation, z: values.map((value) => (value - mean) / standardDeviation) };
}

/**
 * Places from scores, best first, ties sharing a place and the next place
 * skipped: 1, 1, 3. Nothing breaks a tie, because any rule that did would be
 * inventing an order the figures do not support.
 */
export function places(scores: number[]): number[] {
  const sorted = [...scores].sort((a, b) => b - a);
  return scores.map((score) => sorted.indexOf(score) + 1);
}

/** Why a company is left out of a measure it holds no comparable value for. */
const TOO_FEW = "only this company has this figure, so there is nothing here to compare it with";

/**
 * Companies needed before the extremes are pulled in at all.
 *
 * Winsorization exists to stop one unusual company setting the scale. With two
 * or three, every company is an edge: the 10th percentile of three values falls
 * a fifth of the way from the lowest to the middle one, so clipping pulls both
 * ends towards the centre and shortens real differences rather than a freak one.
 * Below four the values are standardised as they are, and the surface says so.
 */
const MINIMUM_TO_WINSORIZE = 4;

/**
 * The whole screen: winsorize each measure, standardise it, turn round the ones
 * that count better when lower, and average each company's scores over the
 * measures it has.
 *
 * Weights are equal unless given, and are rescaled over the measures a company
 * actually has — so a company scored on two measures out of four is not
 * penalised for the gap, and its row carries the count instead. That choice is
 * argued in the method file: refusing a composite to every company with a gap
 * drops exactly the companies a learner most wants beside their own.
 */
export function screen(
  rows: ScreenRow[],
  measures: MeasureSpec[],
  limits: { lower?: number; upper?: number; minimum?: number } = {},
): ScreenResult {
  const cells = new Map<string, Cell[]>(rows.map((row) => [row.id, []]));
  const missing = new Map<string, { measureId: string; reason: string }[]>(rows.map((row) => [row.id, []]));
  const weightOf = new Map<string, number>();

  const working = measures.map((measure) => {
    const weight = measure.weight ?? 1;
    weightOf.set(measure.id, weight);
    const held = rows.filter((row) => {
      const observation = row.values[measure.id];
      return observation !== undefined && hasValue(observation);
    });
    const values = held.map((row) => (row.values[measure.id] as { value: number }).value);

    for (const row of rows) {
      const observation = row.values[measure.id];
      if (observation === undefined) missing.get(row.id)!.push({ measureId: measure.id, reason: "not measured" });
      else if (!hasValue(observation)) missing.get(row.id)!.push({ measureId: measure.id, reason: observation.missing });
    }

    const base: MeasureWorking = {
      id: measure.id,
      direction: measure.direction,
      weight,
      counted: held.length,
      lowerLimit: null,
      upperLimit: null,
      pulledIn: [],
      mean: null,
      standardDeviation: null,
      level: false,
      tooFewToCompare: held.length < 2,
      winsorized: false,
    };
    if (!held.length) return base;

    // Below four companies there is no edge to hold back — the limits would sit
      // inside the group and pull every company towards the middle — so the values
      // are standardised as they are. The surface says which happened.
      const pull = held.length >= (limits.minimum ?? MINIMUM_TO_WINSORIZE);
      const { used, lowerLimit, upperLimit } = pull
        ? winsorize(values, limits.lower, limits.upper)
        : { used: values, lowerLimit: null, upperLimit: null };
    const { mean, standardDeviation, z } = standardScores(used);
    // Turning a level group round would give −0, which reads as a negative score on screen.
    const turned = z ? z.map((score) => (measure.direction === "lower" && score !== 0 ? -score : score)) : null;
    const order = turned ? places(turned) : [];

    held.forEach((row, index) => {
      if (!turned) {
        missing.get(row.id)!.push({ measureId: measure.id, reason: TOO_FEW });
        return;
      }
      cells.get(row.id)!.push({
        measureId: measure.id,
        value: values[index],
        used: used[index],
        pulled: used[index] !== values[index],
        z: turned[index],
        place: order[index],
      });
    });

    return {
      ...base,
      lowerLimit,
      upperLimit,
      pulledIn: held.filter((_, index) => used[index] !== values[index]).map((row) => row.id),
      mean,
      standardDeviation,
      level: standardDeviation === 0,
      winsorized: pull,
    };
  });

  const scored: RowScore[] = rows.map((row) => {
    const own = cells.get(row.id)!;
    const weights = own.reduce((total, cell) => total + (weightOf.get(cell.measureId) ?? 1), 0);
    const composite = weights > 0 ? own.reduce((total, cell) => total + cell.z * (weightOf.get(cell.measureId) ?? 1), 0) / weights : null;
    return {
      id: row.id,
      cells: own,
      missing: missing.get(row.id)!,
      composite,
      scored: own.length,
      of: measures.length,
      place: null,
    };
  });

  const composites = scored.filter((row) => row.composite !== null).map((row) => row.composite as number);
  const placed = places(composites);
  let index = 0;
  for (const row of scored) if (row.composite !== null) row.place = placed[index++];

  const order = [
    ...scored.filter((row) => row.composite !== null).sort((a, b) => (b.composite as number) - (a.composite as number)),
    ...scored.filter((row) => row.composite === null),
  ].map((row) => row.id);

  return { measures: working, rows: scored, order };
}
