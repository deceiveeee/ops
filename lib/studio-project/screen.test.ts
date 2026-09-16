import { describe, expect, it } from "vitest";
import { places, quantile, screen, standardScores, winsorize, type ScreenRow } from "./screen";

/**
 * The screen's conventions, against the reference calculation in
 * docs/source-audits/studio-quantitative-methods.md §1.4.
 *
 * Every expected number below was worked by hand in that file and cross-checked
 * against a separate implementation of the formulas, not against this module.
 * The five-company group is built to exercise the seven things the published
 * source leaves unstated: the quantile convention, the winsorization limits,
 * sample standard deviation, zero variance, an undefined ratio, weights when a
 * measure is missing, and a tie.
 */

const MEASURES = [
  { id: "return", direction: "higher" as const },
  { id: "borrowings", direction: "lower" as const },
];

/** P, Q, R, S, T as §1.4 sets them out. T's equity is negative, so its borrowings ratio is refused. */
const GROUP: ScreenRow[] = [
  { id: "P", values: { return: { value: 10 }, borrowings: { value: 0.5 } } },
  { id: "Q", values: { return: { value: 20 }, borrowings: { value: 0.5 } } },
  { id: "R", values: { return: { value: 30 }, borrowings: { value: 1 } } },
  { id: "S", values: { return: { value: 40 }, borrowings: { value: 2 } } },
  { id: "T", values: { return: { value: 100 }, borrowings: { missing: "its equity is negative, so this ratio is not defined" } } },
];

const cellOf = (result: ReturnType<typeof screen>, id: string, measureId: string) =>
  result.rows.find((row) => row.id === id)?.cells.find((cell) => cell.measureId === measureId);
const rowOf = (result: ReturnType<typeof screen>, id: string) => result.rows.find((row) => row.id === id)!;

describe("the conventions the method file settles", () => {
  it("takes a quantile by interpolating between order statistics, as a spreadsheet does", () => {
    expect(quantile([10, 20, 30, 40, 100], 0.1)).toBeCloseTo(14, 10);
    expect(quantile([10, 20, 30, 40, 100], 0.9)).toBeCloseTo(76, 10);
    expect(quantile([10, 20, 30, 40, 100], 0.5)).toBeCloseTo(30, 10);
    expect(quantile([7], 0.9)).toBe(7);
  });

  it("pulls the extremes in to the tenth and ninetieth percentiles, and leaves a level group alone", () => {
    const pulled = winsorize([10, 20, 30, 40, 100]);
    expect([pulled.lowerLimit, pulled.upperLimit]).toEqual([14, 76]);
    expect(pulled.used).toEqual([14, 20, 30, 40, 76]);

    const level = winsorize([2, 2, 2]);
    expect(level.used).toEqual([2, 2, 2]);
    expect([level.lowerLimit, level.upperLimit]).toEqual([2, 2]);
  });

  it("standardises on the sample standard deviation, and refuses where there is nothing to compare", () => {
    const { mean, standardDeviation, z } = standardScores([14, 20, 30, 40, 76]);
    expect(mean).toBe(36);
    // √598 = 24.4540, dividing by n − 1. Population would give √478.4 = 21.8723.
    expect(standardDeviation).toBeCloseTo(24.4540, 4);
    expect(z?.[0]).toBeCloseTo(-0.899647, 6);

    const flat = standardScores([3, 3, 3, 3]);
    expect(flat.standardDeviation).toBe(0);
    expect(flat.z).toEqual([0, 0, 0, 0]);

    expect(standardScores([5]).z).toBeNull();
  });

  it("lets a tie share a place and skips the next one", () => {
    expect(places([1, 3, 3, 0])).toEqual([3, 1, 1, 4]);
  });
});

describe("the hand-worked peer group", () => {
  const result = screen(GROUP, MEASURES);

  it("scores each measure as the method file works it by hand", () => {
    const expectedReturn = { P: -0.899647, Q: -0.654289, R: -0.245358, S: 0.163572, T: 1.635722 };
    for (const [id, z] of Object.entries(expectedReturn)) expect(cellOf(result, id, "return")?.z).toBeCloseTo(z, 6);

    // Counted better when lower, so the order turns round: the two least indebted score highest.
    const expectedBorrowings = { P: 0.748383, Q: 0.748383, R: -0.132068, S: -1.364699 };
    for (const [id, z] of Object.entries(expectedBorrowings)) expect(cellOf(result, id, "borrowings")?.z).toBeCloseTo(z, 6);
  });

  it("averages each company's scores over the measures it has, and says how many that is", () => {
    const expected = { P: -0.075632, Q: 0.047047, R: -0.188713, S: -0.600563, T: 1.635722 };
    for (const [id, composite] of Object.entries(expected)) expect(rowOf(result, id).composite).toBeCloseTo(composite, 6);
    expect(result.order).toEqual(["T", "Q", "P", "R", "S"]);
    expect(result.rows.map((row) => [row.id, row.scored, row.of, row.place])).toEqual([
      ["P", 2, 2, 3],
      ["Q", 2, 2, 2],
      ["R", 2, 2, 4],
      ["S", 2, 2, 5],
      ["T", 1, 2, 1],
    ]);
  });

  it("never turns a missing ratio into a zero", () => {
    // A zero would have halved T's composite to 0.8179 and dropped it to second.
    expect(rowOf(result, "T").composite).toBeCloseTo(1.635722, 6);
    expect(rowOf(result, "T").missing).toEqual([
      { measureId: "borrowings", reason: "its equity is negative, so this ratio is not defined" },
    ]);
    expect(result.measures.find((measure) => measure.id === "borrowings")?.counted).toBe(4);
  });

  it("reports what winsorizing did, and to whom", () => {
    const [byReturn, byBorrowings] = result.measures;
    expect([byReturn.lowerLimit, byReturn.upperLimit]).toEqual([14, 76]);
    expect(byReturn.pulledIn).toEqual(["P", "T"]);
    expect(cellOf(result, "P", "return")).toMatchObject({ value: 10, used: 14, pulled: true });
    expect(cellOf(result, "Q", "return")).toMatchObject({ value: 20, used: 20, pulled: false });

    expect(byBorrowings.lowerLimit).toBeCloseTo(0.5, 10);
    expect(byBorrowings.upperLimit).toBeCloseTo(1.7, 10);
    expect(byBorrowings.pulledIn).toEqual(["S"]);
    expect(byBorrowings.mean).toBeCloseTo(0.925, 10);
    expect(byBorrowings.standardDeviation).toBeCloseTo(0.567891, 6);
  });

  it("gives a tie the same score and the same place on that measure", () => {
    expect(cellOf(result, "P", "borrowings")?.z).toBe(cellOf(result, "Q", "borrowings")?.z);
    expect(result.rows.map((row) => [row.id, row.cells.find((cell) => cell.measureId === "borrowings")?.place])).toEqual([
      ["P", 1],
      ["Q", 1],
      ["R", 3],
      ["S", 4],
      ["T", undefined],
    ]);
  });
});

describe("weights", () => {
  it("changes the order when one measure is made to count for more", () => {
    const heavier = screen(GROUP, [
      { id: "return", direction: "higher", weight: 3 },
      { id: "borrowings", direction: "lower", weight: 1 },
    ]);
    const expected = { P: -0.487639, Q: -0.303621, R: -0.217036, S: -0.218496, T: 1.635722 };
    for (const [id, composite] of Object.entries(expected)) expect(rowOf(heavier, id).composite).toBeCloseTo(composite, 6);
    // Equal weights put Q second and S last; three to one puts R second and P last.
    expect(heavier.order).toEqual(["T", "R", "S", "Q", "P"]);
  });

  it("rescales the weights a company has, rather than counting a gap as a low score", () => {
    const rows: ScreenRow[] = [
      { id: "X", values: { return: { missing: "not tagged" }, borrowings: { value: 0.5 } } },
      { id: "Y", values: { return: { value: 20 }, borrowings: { value: 1 } } },
      { id: "Z", values: { return: { value: 30 }, borrowings: { value: 2 } } },
    ];
    const result = screen(rows, [
      { id: "return", direction: "higher", weight: 3 },
      { id: "borrowings", direction: "lower", weight: 1 },
    ]);
    // X is scored on the light measure alone, at its full z-score rather than a quarter of it.
    expect(rowOf(result, "X").composite).toBeCloseTo(cellOf(result, "X", "borrowings")!.z, 12);
    expect(rowOf(result, "X").scored).toBe(1);
  });
});

describe("groups the arithmetic cannot rank", () => {
  it("declines a measure only one company holds, and says why", () => {
    const rows: ScreenRow[] = [
      { id: "A", values: { return: { value: 10 }, borrowings: { value: 1 } } },
      { id: "B", values: { return: { value: 20 }, borrowings: { missing: "not tagged" } } },
    ];
    const result = screen(rows, MEASURES);
    const borrowings = result.measures.find((measure) => measure.id === "borrowings")!;
    expect(borrowings.tooFewToCompare).toBe(true);
    expect(cellOf(result, "A", "borrowings")).toBeUndefined();
    expect(rowOf(result, "A").missing[0].reason).toContain("nothing here to compare it with");
    expect(rowOf(result, "A").scored).toBe(1);
  });

  it("says a group is level on a measure instead of ordering it, and still uses the others", () => {
    const rows: ScreenRow[] = [
      { id: "A", values: { return: { value: 10 }, borrowings: { value: 1 } } },
      { id: "B", values: { return: { value: 20 }, borrowings: { value: 1 } } },
      { id: "C", values: { return: { value: 30 }, borrowings: { value: 1 } } },
    ];
    const result = screen(rows, MEASURES);
    const borrowings = result.measures.find((measure) => measure.id === "borrowings")!;
    expect(borrowings.level).toBe(true);
    expect(result.rows.map((row) => row.cells.find((cell) => cell.measureId === "borrowings")?.z)).toEqual([0, 0, 0]);
    expect(result.order).toEqual(["C", "B", "A"]);
  });

  it("keeps a company with nothing usable in the list, unscored and last", () => {
    const rows: ScreenRow[] = [
      { id: "A", values: { return: { value: 10 }, borrowings: { value: 1 } } },
      { id: "B", values: { return: { value: 20 }, borrowings: { value: 2 } } },
      { id: "C", values: { return: { missing: "reports under IFRS" }, borrowings: { missing: "reports under IFRS" } } },
    ];
    const result = screen(rows, MEASURES);
    expect(rowOf(result, "C").composite).toBeNull();
    expect(rowOf(result, "C").place).toBeNull();
    expect(result.order[result.order.length - 1]).toBe("C");
    expect(rowOf(result, "C").missing.map((entry) => entry.reason)).toEqual(["reports under IFRS", "reports under IFRS"]);
  });
});

describe("groups too small to have an edge", () => {
  const rowsOf = (values: number[]): ScreenRow[] =>
    values.map((value, index) => ({ id: String.fromCharCode(65 + index), values: { return: { value } } }));

  it("pulls nothing in below four companies, and standardises the values as they are", () => {
    const result = screen(rowsOf([10, 20, 100]), [{ id: "return", direction: "higher" }]);
    const measure = result.measures[0];
    expect(measure.winsorized).toBe(false);
    expect([measure.lowerLimit, measure.upperLimit]).toEqual([null, null]);
    expect(measure.pulledIn).toEqual([]);
    // Mean 43.3333, sample standard deviation 49.3288, worked apart from this module.
    expect(measure.mean).toBeCloseTo(43.333333, 6);
    expect(measure.standardDeviation).toBeCloseTo(49.328829, 6);
    expect(cellOf(result, "A", "return")?.z).toBeCloseTo(-0.675737, 6);
    expect(cellOf(result, "C", "return")).toMatchObject({ value: 100, used: 100, pulled: false });
  });

  it("pulls them in from four companies up", () => {
    const result = screen(rowsOf([10, 20, 30, 100]), [{ id: "return", direction: "higher" }]);
    const measure = result.measures[0];
    expect(measure.winsorized).toBe(true);
    expect(measure.lowerLimit).toBeCloseTo(13, 10);
    expect(measure.upperLimit).toBeCloseTo(79, 10);
    expect(measure.pulledIn).toEqual(["A", "D"]);
  });
});
