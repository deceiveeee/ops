import { describe, expect, it } from "vitest";
import { fitCookie, fitFor, fitFromCookie, fitsDiffer } from "./fit";
import { DEFAULT_FIT, LINE_CHARS, PAGE_PX } from "./pages";

describe("the room a reader has", () => {
  it("turns a measured column and height into characters to a line and a page's height", () => {
    // The column at 1440 holds 89 characters; a phone's 358px column 47, not
    // half of 89, because every line loses about half a word where it wraps.
    expect(fitFor(643, 600)).toEqual({ lineChars: LINE_CHARS, pagePx: 600, headingFirst: true });
    expect(fitFor(358, 444).lineChars).toBe(47);
  });

  it("keeps a page to at least a few lines, however little room the frame leaves", () => {
    expect(fitFor(300, -200).pagePx).toBe(220);
    expect(fitFor(40, 5_000)).toEqual({ lineChars: 24, pagePx: 1_400, headingFirst: true });
  });

  it("reads back what it writes, and falls back to 1440 for anything else", () => {
    const fit = fitFor(358, 444);
    expect(fitFromCookie(fitCookie(fit))).toEqual(fit);
    for (const value of [undefined, "", "wide", "89x", "1x2x3", "<script>"]) {
      expect(fitFromCookie(value)).toEqual({ lineChars: LINE_CHARS, pagePx: PAGE_PX, headingFirst: true });
    }
    // Values out of range are brought into it rather than trusted.
    expect(fitFromCookie("9999x99999")).toEqual({ lineChars: 110, pagePx: 1_400, headingFirst: true });
  });

  it("pages again only for a difference that moves a page", () => {
    expect(fitsDiffer(fitFor(643, 610), { ...DEFAULT_FIT, headingFirst: true })).toBe(false);
    expect(fitsDiffer(fitFor(643, 700), { ...DEFAULT_FIT, headingFirst: true })).toBe(true);
    expect(fitsDiffer(fitFor(358, 600), { ...DEFAULT_FIT, headingFirst: true })).toBe(true);
  });
});
