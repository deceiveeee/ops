import { describe, expect, it } from "vitest";
import {
  compactMonths,
  fiscalYearAverage,
  fiscalYearFor,
  fiscalYearMonths,
  fiscalYearOf,
  formatChange,
  mentionsOf,
  missingMonths,
  monthsFromBls,
  monthsOf,
  names,
  rebase,
  sentenceAround,
  suggestInputs,
  yearOnYear,
  type IndexMonth,
} from "./input-costs";

/** Monthly values from a first month, one per entry. */
function series(from: string, values: number[], preliminaryFrom = Infinity): IndexMonth[] {
  const [year, month] = from.split("-").map(Number);
  return values.map((value, index) => {
    const total = year * 12 + (month - 1) + index;
    return {
      month: `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`,
      value,
      preliminary: index >= preliminaryFrom,
    };
  });
}

describe("reading BLS's answer", () => {
  it("keeps months oldest first, leaves out the annual average and marks preliminary months", () => {
    const { months, problems } = monthsFromBls([
      { year: "2026", period: "M08", value: "381.162", footnotes: [{ code: "P", text: "Preliminary." }] },
      { year: "2025", period: "M13", value: "300.0", footnotes: [] },
      { year: "2025", period: "M12", value: "350.5", footnotes: [{}] },
      { year: "2026", period: "M01", value: "360", footnotes: [null] },
    ]);
    expect(problems).toEqual([]);
    expect(months).toEqual([
      { month: "2025-12", value: 350.5, preliminary: false },
      { month: "2026-01", value: 360, preliminary: false },
      { month: "2026-08", value: 381.162, preliminary: true },
    ]);
  });

  it("refuses what is not a usable month rather than guessing", () => {
    const { months, problems } = monthsFromBls([
      { year: "2025", period: "Q01", value: "300" },
      { year: "2025", period: "M02", value: "-" },
      { year: "2025", period: "M03", value: "" },
      { year: "2025", period: "M04", value: "300" },
      { year: "2025", period: "M04", value: "301" },
    ]);
    expect(months).toEqual([{ month: "2025-04", value: 300, preliminary: false }]);
    expect(problems).toHaveLength(4);
  });

  it("names every month missing between two, across a year end", () => {
    expect(missingMonths(series("2025-11", [1, 1, 1]).filter((entry) => entry.month !== "2025-12"), "2025-10", "2026-02")).toEqual([
      "2025-10",
      "2025-12",
      "2026-02",
    ]);
    expect(missingMonths(series("2025-10", [1, 1, 1, 1, 1]), "2025-10", "2026-02")).toEqual([]);
  });

  it("stores an unbroken run compactly and reads it back as it was", () => {
    const months = series("2025-06", [10, 11, 12, 13], 2);
    const compact = compactMonths(months);
    expect(compact).toEqual({ start: "2025-06", values: [10, 11, 12, 13], preliminaryFrom: 2, problems: [] });
    expect(monthsOf(compact)).toEqual(months);
  });

  it("refuses to store a run with a gap, or with a final month after a preliminary one", () => {
    expect(compactMonths(series("2025-06", [10, 11, 12]).filter((entry) => entry.month !== "2025-07")).problems).toEqual(["No value for 2025-07."]);
    const mixed = series("2025-06", [10, 11, 12]).map((entry, index) => ({ ...entry, preliminary: index === 1 }));
    expect(compactMonths(mixed).problems).toEqual(["A final month comes after a preliminary one."]);
  });
});

describe("fiscal years", () => {
  it("names a fiscal year by the calendar year it ends in", () => {
    expect(fiscalYearOf("2024-10", 9)).toBe(2025);
    expect(fiscalYearOf("2025-09", 9)).toBe(2025);
    expect(fiscalYearOf("2025-12", 12)).toBe(2025);
    expect(fiscalYearMonths(2025, 9)).toEqual(["2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09"]);
    expect(fiscalYearMonths(2026, 1)[0]).toBe("2025-02");
    expect(fiscalYearMonths(2025, 12)[11]).toBe("2025-12");
  });

  it("reads the fiscal year from any report's period end, a 52-week year ending early in a month included", () => {
    expect(fiscalYearFor("2025-09-30")).toEqual({ fiscalYear: 2025, endMonth: 9 });
    expect(fiscalYearFor("2025-09-27")).toEqual({ fiscalYear: 2025, endMonth: 9 });
    expect(fiscalYearFor("2025-10-03")).toEqual({ fiscalYear: 2025, endMonth: 9 });
    expect(fiscalYearFor("2026-01-31")).toEqual({ fiscalYear: 2026, endMonth: 1 });
    expect(fiscalYearFor("2026-01-02")).toEqual({ fiscalYear: 2025, endMonth: 12 });
    expect(fiscalYearFor("2025-12-31")).toEqual({ fiscalYear: 2025, endMonth: 12 });
    expect(fiscalYearFor("")).toBeNull();
    expect(fiscalYearFor("2025-13-01")).toBeNull();
  });

  it("averages all twelve months of a year, and nothing less", () => {
    const year = series("2024-10", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 10);
    expect(fiscalYearAverage(year, 2025, 9)).toEqual({ fiscalYear: 2025, average: 6.5, preliminary: 2 });
    expect(fiscalYearAverage(year.slice(1), 2025, 9)).toBeNull();
    // Twelve months of the wrong year are not this one.
    expect(fiscalYearAverage(year, 2025, 12)).toBeNull();
  });

  it("compares a year's average with the year before's", () => {
    const months = series("2022-10", [...Array(12).fill(100), ...Array(12).fill(110), ...Array(12).fill(99)]);
    expect(yearOnYear(months, 2024, 9)).toMatchObject({ fiscalYear: 2024, preliminary: 0 });
    expect(yearOnYear(months, 2024, 9)?.change).toBeCloseTo(0.1, 12);
    expect(yearOnYear(months, 2025, 9)?.change).toBeCloseTo(-0.1, 12);
    expect(yearOnYear(months, 2023, 9)).toBeNull();
  });

  it("rebases an index so the base reads 100", () => {
    const rebased = rebase(series("2025-01", [300, 330, 270]), 300).map((entry) => entry.value);
    [100, 110, 90].forEach((value, index) => expect(rebased[index]).toBeCloseTo(value, 12));
  });

  it("formats a change with its sign, and a change that rounds to nothing as nothing", () => {
    expect(formatChange(0.039)).toBe("+3.9%");
    expect(formatChange(-0.0824)).toBe("−8.2%");
    expect(formatChange(-0.0004)).toBe("0.0%");
    expect(formatChange(0.123)).toBe("+12.3%");
  });
});

describe("finding an input's words in a report", () => {
  it("matches whole words only, ignoring capitals and spacing", () => {
    expect(names("Our primary suppliers of steel are Cleveland-Cliffs", "steel")).toBe(true);
    expect(names("the steelworks", "steel")).toBe(false);
    expect(mentionsOf("NATURAL\ngas and Natural Gas", ["natural gas"])).toEqual([
      { start: 0, end: 11 },
      { start: 16, end: 27 },
    ]);
  });

  it("does not count a word inside an excluded phrase", () => {
    const text = "We issue commercial paper. We buy paper for packaging.";
    expect(mentionsOf(text, ["paper"], ["commercial paper"])).toEqual([{ start: 34, end: 39 }]);
  });

  it("counts overlapping words for one input as one mention", () => {
    expect(mentionsOf("natural gas", ["natural gas", "gas"])).toEqual([{ start: 0, end: 11 }]);
    expect(mentionsOf('polyvinyl chloride ("PVC") resin', ["resin", "polyvinyl chloride", "PVC"])).toHaveLength(3);
  });

  it("takes the whole sentence around a mention, within its paragraph", () => {
    const text = "Competition is intense.\nIn many countries, PepsiCo, Inc. is a primary competitor. Other rivals exist.";
    const at = text.indexOf("PepsiCo");
    const { start, end } = sentenceAround(text, at);
    expect(text.slice(start, end)).toBe("In many countries, PepsiCo, Inc. is a primary competitor.");
    // From a mention after "Inc.", too: the stop before "is" does not end the sentence.
    const later = sentenceAround(text, text.indexOf("primary"));
    expect(text.slice(later.start, later.end)).toBe("In many countries, PepsiCo, Inc. is a primary competitor.");
  });

  it("cuts a sentence longer than the limit to the words around the mention", () => {
    const text = `${"word ".repeat(200)}steel ${"word ".repeat(200)}`.trim();
    const { start, end } = sentenceAround(text, text.indexOf("steel"), 100);
    expect(end - start).toBeLessThanOrEqual(100);
    expect(text.slice(start, end)).toContain("steel");
    expect(text[start - 1]).toBe(" ");
  });
});

describe("suggesting inputs", () => {
  const library = [
    { id: "STEEL", words: ["steel"], exclude: [] },
    { id: "PAPER", words: ["paper"], exclude: ["commercial paper"] },
    { id: "COPPER", words: ["copper"], exclude: [] },
  ];
  const sections = [
    {
      id: "business",
      text: [
        "We sell steel conduit to contractors.",
        "Steel prices rose in the year. Demand held.",
        "Our primary suppliers of steel are A, B and C.",
        "We also issue commercial paper.",
      ].join("\n"),
    },
    { id: "risk-factors", text: "Our results depend on the cost of steel and copper." },
  ];

  it("lists each input a report mentions, most mentioned first, and nothing it does not", () => {
    const suggestions = suggestInputs(sections, library);
    expect(suggestions.map((entry) => [entry.seriesId, entry.count])).toEqual([
      ["STEEL", 4],
      ["COPPER", 1],
    ]);
  });

  it("brings sentences about buying forward, then the rest in the order the report has them", () => {
    const steel = suggestInputs(sections, library).find((entry) => entry.seriesId === "STEEL");
    expect(steel?.sentences.map((passage) => [passage.sectionId, passage.quote])).toEqual([
      ["business", "Our primary suppliers of steel are A, B and C."],
      ["risk-factors", "Our results depend on the cost of steel and copper."],
      ["business", "We sell steel conduit to contractors."],
    ]);
  });

  it("anchors each sentence where it is in its section", () => {
    const steel = suggestInputs(sections, library).find((entry) => entry.seriesId === "STEEL");
    for (const passage of steel?.sentences ?? []) {
      const text = sections.find((section) => section.id === passage.sectionId)!.text;
      expect(text.slice(passage.offset, passage.offset + passage.quote.length)).toBe(passage.quote);
    }
  });
});
