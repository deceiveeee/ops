import { describe, expect, it } from "vitest";
import { FIRST_PUZZLE_DATE, dateIn, dateOfPuzzle, longDate, puzzleNumberOn, todaysNumber } from "./schedule";

describe("dateIn", () => {
  it("turns the day over at midnight in New York, not in UTC", () => {
    // 04:30 UTC on 4 November is 11:30 p.m. on 3 November in New York (EST, UTC-5).
    expect(dateIn("America/New_York", new Date("2026-11-04T04:30:00Z"))).toBe("2026-11-03");
    expect(dateIn("America/New_York", new Date("2026-11-04T05:30:00Z"))).toBe("2026-11-04");
  });

  it("follows daylight saving time", () => {
    // In July New York is UTC-4, so 03:30 UTC is still the previous evening.
    expect(dateIn("America/New_York", new Date("2027-07-01T03:30:00Z"))).toBe("2027-06-30");
    expect(dateIn("America/New_York", new Date("2027-07-01T04:30:00Z"))).toBe("2027-07-01");
  });
});

describe("puzzle numbers", () => {
  it("starts at 1 on the first puzzle's date and counts days", () => {
    expect(puzzleNumberOn(FIRST_PUZZLE_DATE)).toBe(1);
    expect(puzzleNumberOn(dateOfPuzzle(2))).toBe(2);
  });

  it("is 0 or less before the first puzzle", () => {
    const before = new Date(Date.parse(`${FIRST_PUZZLE_DATE}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
    expect(puzzleNumberOn(before)).toBe(0);
  });

  it("maps every number to one date and back, across month, year and clock changes", () => {
    const seen = new Set<string>();
    for (let number = 1; number <= 800; number += 1) {
      const date = dateOfPuzzle(number);
      expect(puzzleNumberOn(date)).toBe(number);
      seen.add(date);
    }
    expect(seen.size).toBe(800);
  });

  it("reads today's number from the New York date", () => {
    const evening = new Date(`${FIRST_PUZZLE_DATE}T23:00:00-05:00`);
    expect(todaysNumber(evening)).toBe(1);
    const nextMorning = new Date(evening.getTime() + 2 * 3_600_000);
    expect(todaysNumber(nextMorning)).toBe(2);
  });
});

describe("longDate", () => {
  it("writes a date the way a US reader says it", () => {
    expect(longDate("2026-09-26")).toBe("September 26, 2026");
    expect(longDate("2026-02-01")).toBe("February 1, 2026");
  });
});
