import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PUZZLES } from "@/data/daily-puzzle/puzzles";
import { SKIPPED } from "@/data/daily-puzzle/excerpts";
import { puzzleNumbered } from "./catalog";
import { DIVISOR, excerptFor, excerptNumbers, printedNumber } from "./excerpts";

/** How many decimals a printed figure shows: "37,184.4" -> 1. */
const decimals = (printed: string) => (printed.includes(".") ? printed.split(".")[1].replace(/\D/g, "").length : 0);

/** True when a printed figure is the exact amount, rounded the way the statement rounds it. */
function printedAs(printed: string, exact: number, divisor: number): boolean {
  return Math.abs(printedNumber(printed) * divisor - exact) <= 0.5 * 10 ** -decimals(printed) * divisor + 1e-6;
}

describe("report excerpts", () => {
  const numbers = excerptNumbers();

  it("covers every puzzle, each either captured or skipped with a reason", () => {
    const skipped = SKIPPED.map((line) => Number(line.match(/^#(\d+)/)?.[1]));
    expect([...numbers, ...skipped].sort((a, b) => a - b)).toEqual(PUZZLES.map((puzzle) => puzzle.number));
    for (const line of SKIPPED) expect(line).toMatch(/^#\d+ .+: .+/);
  });

  for (const number of numbers) {
    const excerpt = excerptFor(number)!;
    const puzzle = PUZZLES.find((entry) => entry.number === number)!;

    it(`#${number}: reaches the page with its puzzle`, () => {
      expect(puzzleNumbered(number)?.excerpt).toEqual(excerpt);
    });

    it(`#${number}: each highlighted figure is the puzzle's own, in the statement's units`, () => {
      const divisor = DIVISOR[excerpt.units];
      for (const row of excerpt.shows) {
        const exact = row.clue === "revenue" ? puzzle.revenue.value : puzzle.operatingProfit.value;
        expect(printedAs(row.printed, exact, divisor), `${row.label} ${row.printed} vs ${exact}`).toBe(true);
      }
    });

    if (excerpt.costs) {
      it(`#${number}: the subtraction in the caption holds on the printed figures`, () => {
        const [revenue, operating] = ["revenue", "margin"].map((clue) => excerpt.shows.find((row) => row.clue === clue)!.printed);
        const places = Math.max(decimals(revenue), decimals(operating), decimals(excerpt.costs!.printed));
        expect((printedNumber(revenue) - printedNumber(excerpt.costs!.printed)).toFixed(places)).toBe(printedNumber(operating).toFixed(places));
      });
    }

    for (const [index, part] of excerpt.parts.entries()) {
      it(`#${number} part ${index + 1}: the file exists at the size recorded, under a name that gives nothing away, narrow enough to read`, () => {
        const file = resolve(__dirname, "../../public", part.src.replace(/^\//, ""));
        expect(existsSync(file), file).toBe(true);
        const png = readFileSync(file);
        expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([part.width, part.height]);
        expect(part.src.split("/").pop()).toMatch(/^[0-9a-f]{16}\.png$/);
        // Laid out at 340px and captured at twice that; much wider means the statement did not narrow and its text would be tiny.
        expect(part.width, "picture is too wide to read on a phone").toBeLessThanOrEqual(760);
      });
    }
  }

  it("the figure check fails for a figure from another puzzle", () => {
    const one = excerptFor(numbers[0])!;
    const other = PUZZLES.find((entry) => entry.number !== numbers[0])!;
    expect(printedAs(one.shows[0].printed, other.revenue.value, DIVISOR[one.units])).toBe(false);
  });
});
