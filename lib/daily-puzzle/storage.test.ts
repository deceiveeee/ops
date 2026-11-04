import { describe, expect, it } from "vitest";
import { parseSaved, solvedThisMonth } from "./storage";

describe("parseSaved", () => {
  it("treats nothing, garbage and other versions as no progress", () => {
    for (const raw of [null, "", "not json", "[]", '{"version":2,"puzzles":{}}', '{"version":1}', '{"version":1,"puzzles":null}']) {
      expect(parseSaved(raw)).toEqual({ version: 1, puzzles: {} });
    }
  });

  it("keeps well-formed records and drops malformed ones", () => {
    const raw = JSON.stringify({
      version: 1,
      puzzles: {
        "1": { moves: [{ type: "guess", id: "AAPL" }], finishedOn: "2026-11-03", result: "solved" },
        "2": { moves: [{ type: "skip" }, { type: "guess", id: "Nike" }] },
        "3": { moves: [{ type: "guess" }] },
        "4": { moves: "nope" },
        abc: { moves: [] },
        "5": { moves: [], finishedOn: "yesterday", result: "solved" },
        "6": { moves: [], finishedOn: "2026-11-04", result: "won" },
      },
    });
    const saved = parseSaved(raw);
    expect(Object.keys(saved.puzzles).sort()).toEqual(["1", "2", "5", "6"]);
    expect(saved.puzzles["1"]).toEqual({ moves: [{ type: "guess", id: "AAPL" }], finishedOn: "2026-11-03", result: "solved" });
    // A result means nothing without the day it was reached, and an unknown result is dropped.
    expect(saved.puzzles["5"]).toEqual({ moves: [] });
    expect(saved.puzzles["6"]).toEqual({ moves: [], finishedOn: "2026-11-04" });
  });
});

describe("solvedThisMonth", () => {
  it("counts puzzles solved in the same calendar month, not missed ones or other months", () => {
    const saved = parseSaved(
      JSON.stringify({
        version: 1,
        puzzles: {
          "1": { moves: [], finishedOn: "2026-11-03", result: "solved" },
          "2": { moves: [], finishedOn: "2026-11-04", result: "solved" },
          "3": { moves: [], finishedOn: "2026-11-05", result: "missed" },
          "4": { moves: [], finishedOn: "2026-10-31", result: "solved" },
          "5": { moves: [] },
        },
      }),
    );
    expect(solvedThisMonth(saved, "2026-11-20")).toBe(2);
    expect(solvedThisMonth(saved, "2026-10-02")).toBe(1);
  });
});
