import { describe, expect, it } from "vitest";
import { dayPart, greeting } from "./greeting";

const at = (hour: number, minute = 0) => new Date(2026, 10, 13, hour, minute);

describe("greeting", () => {
  it("changes at 5:00, 12:00 and 18:00 local time", () => {
    expect([at(4, 59), at(5), at(11, 59), at(12), at(17, 59), at(18), at(23, 59), at(0)].map(dayPart)).toEqual([
      "evening", "morning", "morning", "afternoon", "afternoon", "evening", "evening", "evening",
    ]);
  });

  it("reads as a greeting", () => {
    expect(greeting(at(9))).toBe("Good morning");
    expect(greeting(at(14))).toBe("Good afternoon");
    expect(greeting(at(21))).toBe("Good evening");
  });
});
