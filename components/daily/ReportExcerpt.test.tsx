import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { PUZZLES } from "@/data/daily-puzzle/puzzles";
import { puzzleNumbered } from "@/lib/daily-puzzle/catalog";
import { excerptNumbers, printedNumber } from "@/lib/daily-puzzle/excerpts";
import ReportExcerpt from "./ReportExcerpt";

/*
 * The caption under every captured excerpt, rendered from the real data, so a
 * learner is never left with a figure the page does not explain.
 */
function rendered(number: number): { caption: string; all: string } {
  const puzzle = puzzleNumbered(number)!;
  const { container } = render(<ReportExcerpt puzzle={puzzle} excerpt={puzzle.excerpt!} />);
  const clean = (text: string | null | undefined) => (text ?? "").replace(/\s+/g, " ");
  return { caption: clean(container.querySelector("figcaption")?.textContent), all: clean(container.textContent) };
}

function caption(number: number): string {
  return rendered(number).caption;
}

describe("ReportExcerpt caption", () => {
  it("covers puzzles whose operating figure is a loss, so the bracket rule is exercised", () => {
    const losses = excerptNumbers().filter((number) => printedNumber(puzzleNumbered(number)!.excerpt!.shows.find((row) => row.clue === "margin")!.printed) < 0);
    expect(losses.length).toBeGreaterThan(0);
  });

  for (const number of excerptNumbers()) {
    const name = PUZZLES[number - 1].answer.name;
    it(`#${number} ${name}: names both lines with the figures as printed`, () => {
      const excerpt = puzzleNumbered(number)!.excerpt!;
      const text = caption(number);
      const revenue = excerpt.shows.find((row) => row.clue === "revenue")!;
      const operating = excerpt.shows.find((row) => row.clue === "margin")!;
      expect(text).toContain(`counts in ${excerpt.units} of dollars`);
      expect(text).toContain(`: ${revenue.printed}.`);
      expect(text).toContain(`, ${operating.printed}, by that revenue`);
      if (excerpt.costs) expect(text).toContain(`${revenue.printed} − ${excerpt.costs.printed} = ${operating.printed}.`);
      else expect(text).not.toContain("It is also revenue minus");

      // A figure in brackets is negative; the caption must say so before a beginner meets it.
      const bracketed = /^\(.*\)$/.test(operating.printed);
      const rule = `The report puts brackets around a negative number, so ${operating.printed} is a loss of ${operating.printed.slice(1, -1)}.`;
      if (bracketed) expect(text).toContain(rule);
      else expect(text).not.toContain("brackets around a negative number");
      if (bracketed && excerpt.costs) expect(text.indexOf(rule)).toBeLessThan(text.indexOf("It is also revenue minus"));

      // Footnote markers are the filing's, not part of the line's name.
      expect(text).not.toMatch(/“[^”]*\((\d|note)[^)]*\)”/i);

      // The gap line names what the cut came from: a statement, or a note table when there is no titled statement.
      const gap = rendered(number).all;
      if (excerpt.leftOut > 0) expect(gap).toContain(`of the ${excerpt.statement ? "statement" : "table"} between these two parts`);
      if (!excerpt.statement) expect(gap).not.toContain("of the statement");
    });
  }
});
