import { PUZZLES } from "@/data/daily-puzzle/puzzles";
import { excerptFor } from "./excerpts";
import type { DailyPuzzle } from "./types";

/**
 * The published puzzles, for the server only. A page passes the one puzzle it
 * shows to the browser, never this whole list: the answers to puzzles that
 * have not opened yet stay off the page.
 */
export const LAST_PUZZLE = PUZZLES.length;

export function puzzleNumbered(number: number): DailyPuzzle | null {
  const puzzle = PUZZLES.find((entry) => entry.number === number);
  if (!puzzle) return null;
  // The report excerpt, where one has been captured, travels with the one puzzle shown.
  const excerpt = excerptFor(number);
  return excerpt ? { ...puzzle, excerpt } : puzzle;
}

/** "12" -> 12; anything that is not a plain positive whole number -> null. */
export function parsePuzzleNumber(raw: string): number | null {
  if (!/^[1-9]\d{0,4}$/.test(raw)) return null;
  return Number(raw);
}
