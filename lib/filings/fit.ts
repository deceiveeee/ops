import { DEFAULT_FIT, LINE_CHARS, type Fit } from "./pages";

/**
 * How much of a report fits on the reader's screen, as the reader's own browser
 * measured it, carried to the server in a cookie so it can size pages.
 *
 * Pages were sized for 1440 alone. Measured on 2026-09-18 on Netflix's
 * quarterly report, the frame around a page's text took 1,131px of a phone's
 * 1,266px budget (one and a half 844px screens), 922px at 1024 by 768, and the
 * text column held 42 characters to a line against 89. No one size fits, so
 * the browser measures its column and the room its frame leaves, and the
 * server pages to that.
 */

export const FIT_COOKIE = "ops-reader-fit";

/**
 * Characters a line loses where it wraps, about half a word, whatever the
 * column's width. On a phone's 358px column, sizing by width alone put a
 * 652-character paragraph of Intel's on 14 lines; it took 15 (2026-09-18).
 */
const WRAP_CHARS = 6;
/** Width of an average character of the reader's 15px text, calibrated so the 643px column at 1440 holds 89 to a line. */
export const CHAR_PX = 643 / (LINE_CHARS + WRAP_CHARS);

/** The least a page holds, however little room the frame leaves: a few lines, not a word. */
const PAGE_PX_MIN = 220;
const PAGE_PX_MAX = 1_400;
const LINE_CHARS_MIN = 24;
const LINE_CHARS_MAX = 110;

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, Math.round(value)));

/** The fit for a text column `columnPx` wide with `roomPx` of height for text. */
export function fitFor(columnPx: number, roomPx: number): Fit {
  return {
    lineChars: clamp(columnPx / CHAR_PX - WRAP_CHARS, LINE_CHARS_MIN, LINE_CHARS_MAX),
    pagePx: clamp(roomPx, PAGE_PX_MIN, PAGE_PX_MAX),
    headingFirst: true,
  };
}

export function fitCookie(fit: Fit): string {
  return `${fit.lineChars}x${fit.pagePx}`;
}

/** The fit a cookie carries, or the one for 1440 when there is none or it is not one. */
export function fitFromCookie(value: string | undefined): Fit {
  const match = value?.match(/^(\d{1,4})x(\d{1,5})$/);
  if (!match) return { ...DEFAULT_FIT, headingFirst: true };
  return {
    lineChars: clamp(Number(match[1]), LINE_CHARS_MIN, LINE_CHARS_MAX),
    pagePx: clamp(Number(match[2]), PAGE_PX_MIN, PAGE_PX_MAX),
    headingFirst: true,
  };
}

/** Whether two fits page a section differently enough to page it again. */
export function fitsDiffer(a: Fit, b: Fit): boolean {
  return Math.abs(a.lineChars - b.lineChars) / b.lineChars > 0.06 || Math.abs(a.pagePx - b.pagePx) > 40;
}
