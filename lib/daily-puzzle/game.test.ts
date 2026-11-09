import { describe, expect, it } from "vitest";
import { CLUE_COUNT, play, squares, type Move } from "./game";
import { shareHeadline, shareText } from "./share";

const guess = (id: string): Move => ({ type: "guess", id });
const skip: Move = { type: "skip" };

describe("play", () => {
  it("starts with one clue showing", () => {
    expect(play([], "AAPL")).toMatchObject({ shown: 1, status: "playing", guessed: [] });
  });

  it("shows one more clue for each wrong guess or skip", () => {
    expect(play([guess("MSFT")], "AAPL").shown).toBe(2);
    expect(play([guess("MSFT"), skip], "AAPL").shown).toBe(3);
  });

  it("solves with however many clues were showing", () => {
    const state = play([guess("MSFT"), skip, guess("AAPL")], "AAPL");
    expect(state).toMatchObject({ shown: 3, status: "solved" });
    expect(squares(state)).toEqual(["miss", "miss", "solve", "unused", "unused", "unused"]);
  });

  it("solves on the first clue", () => {
    const state = play([guess("AAPL")], "AAPL");
    expect(state).toMatchObject({ shown: 1, status: "solved" });
    expect(squares(state)[0]).toBe("solve");
  });

  it("still allows a guess with all six clues showing, and ends unsolved after a miss there", () => {
    const fiveMisses = [skip, skip, skip, skip, skip];
    expect(play(fiveMisses, "AAPL")).toMatchObject({ shown: CLUE_COUNT, status: "playing" });
    expect(play([...fiveMisses, guess("AAPL")], "AAPL")).toMatchObject({ shown: CLUE_COUNT, status: "solved" });
    const missed = play([...fiveMisses, guess("MSFT")], "AAPL");
    expect(missed).toMatchObject({ shown: CLUE_COUNT, status: "missed" });
    expect(squares(missed)).toEqual(Array(CLUE_COUNT).fill("miss"));
  });

  it("does not charge a clue for guessing the same wrong company twice", () => {
    expect(play([guess("MSFT"), guess("MSFT")], "AAPL")).toMatchObject({ shown: 2, guessed: ["MSFT"] });
  });

  it("ignores anything after the puzzle ended, so a tampered record cannot reopen it", () => {
    const state = play([guess("AAPL"), guess("MSFT"), skip], "AAPL");
    expect(state).toMatchObject({ status: "solved", shown: 1 });
    expect(state.moves).toHaveLength(1);
  });
});

describe("shareText", () => {
  it("says how it went, invites a friend, and links the same puzzle without naming the company", () => {
    const text = shareText(12, play([guess("Nike"), guess("AAPL")], "AAPL"), "https://example.org/daily/12");
    expect(text).toBe(
      [
        "I guessed it in 2 clues. Your turn.",
        "🟥🟩⬜⬜⬜⬜",
        "Investing Studio daily puzzle #12: guess a real company from its annual report.",
        "https://example.org/daily/12",
      ].join("\n"),
    );
    expect(text).not.toMatch(/AAPL|Apple/);
  });

  it("counts clues, so a skipped clue costs the same as a wrong guess", () => {
    const text = shareText(12, play([skip, skip, guess("AAPL")], "AAPL"), "https://example.org/daily/12");
    expect(text.split("\n")[0]).toBe("I guessed it in 3 clues. Your turn.");
    expect(text.split("\n")[1]).toBe("🟥🟥🟩⬜⬜⬜");
  });

  it("says 1 clue, not 1 clues, for a first-clue solve", () => {
    expect(shareHeadline(play([guess("AAPL")], "AAPL"))).toBe("I guessed it in 1 clue. Your turn.");
  });

  it("names the puzzle by number in the invitation, so a friend plays the same one", () => {
    const text = shareText(7, play([guess("AAPL")], "AAPL"), "https://example.org/daily/7");
    expect(text.split("\n")[2]).toBe("Investing Studio daily puzzle #7: guess a real company from its annual report.");
  });

  it("reports an unsolved puzzle as six misses and still invites a friend", () => {
    const text = shareText(3, play(Array<Move>(6).fill(skip), "AAPL"), "https://example.org/daily/3");
    expect(text.split("\n")[0]).toBe("I missed it after 6 clues. Your turn.");
    expect(text.split("\n")[1]).toBe("🟥".repeat(6));
  });

  it("ends with the link on its own line, so chat apps can preview it", () => {
    const text = shareText(3, play([guess("AAPL")], "AAPL"), "https://example.org/daily/3?via=link");
    expect(text.split("\n").at(-1)).toBe("https://example.org/daily/3?via=link");
  });
});
