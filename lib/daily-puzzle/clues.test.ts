import { describe, expect, it } from "vitest";
import { GUESSABLE } from "@/data/daily-puzzle/companies";
import { PUZZLES } from "@/data/daily-puzzle/puzzles";
import { blanks, cluesFor, dollars, marginWords, percent } from "./clues";
import { play, type Move } from "./game";
import { guessId, normalize } from "./search";
import { shareText } from "./share";

describe("number wording", () => {
  it("writes dollars at the scale a reader expects", () => {
    expect(dollars(478_834_000_000)).toBe("$478.8 billion");
    expect(dollars(842_000_000)).toBe("$842 million");
    expect(dollars(9_500)).toBe("$9,500");
    expect(dollars(-1_232_342_000)).toBe("-$1.2 billion");
  });

  it("never rounds a share to a misleading 100% or 0%", () => {
    expect(percent(0.995)).toBe("99.5%");
    expect(percent(0.005)).toBe("0.5%");
    expect(percent(0.0004)).toBe("under 0.1%");
    expect(percent(0.531)).toBe("53%");
    expect(percent(0.079)).toBe("7.9%");
  });

  it("states profit and loss per dollar of revenue", () => {
    expect(marginWords(33, 100)).toBe("About 33 cents of operating profit from each dollar of revenue");
    expect(marginWords(0.2, 100)).toBe("Less than 1 cent of operating profit from each dollar of revenue");
    expect(marginWords(-0.2, 100)).toBe("An operating loss of less than 1 cent on each dollar of revenue");
    expect(marginWords(-9, 100)).toBe("An operating loss of about 9 cents on each dollar of revenue");
  });
});

describe("blanks", () => {
  it("splits blanked names out so each can be drawn as a bar", () => {
    expect(blanks("[[name]] is the premier roaster")).toEqual([
      { text: "name removed", blank: true },
      { text: " is the premier roaster", blank: false },
    ]);
  });
});

/** Every name a learner could read the answer from, for one puzzle. */
function giveaways(puzzle: (typeof PUZZLES)[number]): string[] {
  const listed = GUESSABLE.find((company) => company.ticker === puzzle.answer.ticker);
  return [puzzle.answer.name, ...(listed?.aliases ?? []), ...(puzzle.answer.ticker.length >= 3 ? [puzzle.answer.ticker] : [])];
}

const visible = (text: string) => normalize(text.replace(/\[\[name\]\]/g, " "));

describe("the published puzzles", () => {
  it("are numbered 1, 2, 3 … with one company each", () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(30);
    PUZZLES.forEach((puzzle, index) => expect(puzzle.number).toBe(index + 1));
    expect(new Set(PUZZLES.map((puzzle) => puzzle.answer.ticker)).size).toBe(PUZZLES.length);
  });

  it("only ask for companies the learner can choose from the list", () => {
    const ids = new Set(GUESSABLE.map(guessId));
    for (const puzzle of PUZZLES) expect(ids.has(puzzle.answer.ticker), puzzle.answer.ticker).toBe(true);
  });

  it("never show the company's name, ticker or a name people use for it", () => {
    for (const puzzle of PUZZLES) {
      for (const clue of cluesFor(puzzle)) {
        const words = clue.kind === "mix" ? clue.rows.map((row) => row.label).join(" | ") : clue.text;
        for (const giveaway of giveaways(puzzle)) {
          const pattern = new RegExp(`(^| )${normalize(giveaway)}( |$)`);
          expect(pattern.test(visible(words)), `#${puzzle.number} ${clue.id} shows "${giveaway}": ${words}`).toBe(false);
        }
      }
    }
  });

  it("would catch a name left in a clue (the check above can fail)", () => {
    const puzzle = PUZZLES.find((item) => item.answer.ticker === "META")!;
    const planted = { ...puzzle, description: { ...puzzle.description, shown: "We build Instagram and other apps." } };
    const text = cluesFor(planted).find((clue) => clue.id === "description")!;
    const caught = giveaways(planted).some((giveaway) =>
      new RegExp(`(^| )${normalize(giveaway)}( |$)`).test(visible(text.kind === "quote" ? text.text : "")),
    );
    expect(caught).toBe(true);
    // And a blanked name is not a leak.
    expect(visible("We build [[name]] and other apps.")).not.toContain("instagram");
  });

  it("split revenue into shares that add up to the whole", () => {
    for (const puzzle of PUZZLES) {
      const total = puzzle.mix.rows.reduce((sum, row) => sum + row.share, 0);
      expect(Math.abs(total - 1), `#${puzzle.number}`).toBeLessThan(1e-6);
      expect(puzzle.mix.rows.length).toBeGreaterThanOrEqual(2);
      expect(puzzle.mix.rows.length).toBeLessThanOrEqual(7);
    }
  });

  it("hold figures a balance sheet allows", () => {
    for (const puzzle of PUZZLES) {
      expect(puzzle.revenue.value, `#${puzzle.number}`).toBeGreaterThan(0);
      expect(puzzle.assets.value).toBeGreaterThanOrEqual(puzzle.cash.value);
      expect(puzzle.cash.value).toBeGreaterThan(0);
      expect(Math.abs(puzzle.operatingProfit.value)).toBeLessThan(puzzle.revenue.value);
    }
  });

  it("point to a report and a passage the reader can open", () => {
    for (const puzzle of PUZZLES) {
      expect(puzzle.report.accession, `#${puzzle.number}`).toMatch(/^\d{10}-\d{2}-\d{6}$/);
      expect(puzzle.report.document).toMatch(/^[A-Za-z0-9._-]{1,200}$/);
      expect(puzzle.report.periodEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const { anchor } = puzzle.description;
      expect(anchor.quote.length).toBeGreaterThan(40);
      // The locate-passage route accepts 64 characters either side.
      expect(anchor.prefix.length).toBeLessThanOrEqual(64);
      expect(anchor.suffix.length).toBeLessThanOrEqual(64);
      // What is shown is the passage, cut and blanked, never other words.
      const shownWords = puzzle.description.shown.replace(/^…|…$/g, "").split("[[name]]").map((part) => part.trim()).filter(Boolean);
      for (const words of shownWords) expect(normalize(anchor.quote)).toContain(normalize(words));
    }
  });

  it("define the one term each figure clue uses, before the learner needs it", () => {
    const clues = cluesFor(PUZZLES[0]);
    expect(clues.map((clue) => clue.id)).toEqual(["revenue", "margin", "assets", "industry", "mix", "description"]);
    expect(clues[0].definition).toMatch(/^Revenue is /);
    expect(clues[1].definition).toMatch(/^Operating profit, also called operating income, is /);
    expect(clues[2].definition).toMatch(/^Assets are /);
  });

  it("can be shared after any ending without giving the answer away", () => {
    for (const puzzle of PUZZLES) {
      const solved = shareText(puzzle.number, play([{ type: "guess", id: puzzle.answer.ticker }], puzzle.answer.ticker), "https://example.org/daily");
      const missed = shareText(puzzle.number, play(Array<Move>(6).fill({ type: "skip" }), puzzle.answer.ticker), "https://example.org/daily");
      for (const text of [solved, missed]) {
        for (const giveaway of giveaways(puzzle)) expect(new RegExp(`(^| )${normalize(giveaway)}( |$)`).test(normalize(text))).toBe(false);
      }
    }
  });
});
