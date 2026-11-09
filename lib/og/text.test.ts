import { describe, expect, it } from "vitest";
import { getAllLessons } from "@/data/courses";
import { clip, titleSize } from "./text";

describe("clip", () => {
  it("leaves text that fits alone", () => {
    expect(clip("Why market rates change bond prices", 150)).toBe("Why market rates change bond prices");
  });

  it("ends a long line on a whole word and an ellipsis, inside the limit", () => {
    const text = "How markets discover prices under uncertainty, and why accounting becomes the language used to interpret those prices.";
    const out = clip(text, 60);
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out.endsWith("…")).toBe(true);
    // The word before the ellipsis is a word of the original, not a fragment of one.
    const lastWord = out.slice(0, -1).split(" ").at(-1)!;
    expect(text.split(/[\s,]+/)).toContain(lastWord.replace(/[,;:.]$/, ""));
  });

  it("collapses runs of whitespace from multi-line source strings", () => {
    expect(clip("Present value\n   and   time", 150)).toBe("Present value and time");
  });

  it("keeps every public lesson's card description within its limit", () => {
    for (const { lesson } of getAllLessons()) {
      expect(clip(lesson.subtitle, 150).length, lesson.slug).toBeLessThanOrEqual(150);
    }
  });
});

describe("titleSize", () => {
  it("steps down for longer titles", () => {
    expect(titleSize("Read the Balance Sheet")).toBe(68);
    expect(titleSize("x".repeat(60))).toBe(58);
    expect(titleSize("x".repeat(90))).toBe(50);
  });
});
