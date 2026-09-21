import { describe, expect, it } from "vitest";
import manifest from "../../scripts/source/input-cost-library-manifest.json";
import library from "./data/input-cost-library.json";
import { compactMonths, monthsOf, type InputCostLibrary } from "./input-costs";

/**
 * The library the Input costs tab suggests from, as it is in the repository.
 *
 * scripts/source/fetch-input-cost-library.mjs checks every title against the
 * index's own BLS page and every month against BLS's API, and writes this file
 * only when every check passes. This checks the file itself: that it holds the
 * manifest's choices and nothing else, and that every index is an unbroken run
 * of months a fiscal year can be averaged over.
 */

const data = library as unknown as InputCostLibrary;

describe("the input-cost library", () => {
  it("holds the manifest's choices, and nothing else", () => {
    expect(data.series.map(({ id, title, name, words, exclude }) => ({ id, title, name, words, exclude }))).toEqual(manifest.series);
  });

  it("gives no word to two indexes, so one mention never suggests two", () => {
    const words = data.series.flatMap((series) => series.words.map((word) => word.toLowerCase().replace(/\s+/g, " ")));
    expect(new Set(words).size).toBe(words.length);
  });

  it("holds an unbroken run of at least five years for every index, preliminary months only at its end, all ending in the same month", () => {
    const ends = new Set<string>();
    for (const series of data.series) {
      const months = monthsOf(series);
      expect(compactMonths(months).problems, series.id).toEqual([]);
      expect(months.length, series.id).toBeGreaterThanOrEqual(60);
      expect(series.values.every((value) => Number.isFinite(value) && value > 0), series.id).toBe(true);
      expect(series.url, series.id).toBe(`https://data.bls.gov/timeseries/${series.id}`);
      expect(series.baseDate, series.id).toMatch(/^(?:[A-Z][a-z]+ )?\d{4} = 100$/);
      ends.add(months[months.length - 1].month);
    }
    expect([...ends]).toHaveLength(1);
  });

  it("says when it was built", () => {
    expect(data.builtOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
