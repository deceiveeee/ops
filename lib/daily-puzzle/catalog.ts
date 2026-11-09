import { PUZZLES } from "@/data/daily-puzzle/puzzles";
import type { DailyPuzzle } from "./types";

/**
 * The published puzzles, for the server only. A page passes the one puzzle it
 * shows to the browser, never this whole list: the answers to puzzles that
 * have not opened yet stay off the page.
 */
export const LAST_PUZZLE = PUZZLES.length;

export function puzzleNumbered(number: number): DailyPuzzle | null {
  return PUZZLES.find((puzzle) => puzzle.number === number) ?? null;
}

/** "12" -> 12; anything that is not a plain positive whole number -> null. */
export function parsePuzzleNumber(raw: string): number | null {
  if (!/^[1-9]\d{0,4}$/.test(raw)) return null;
  return Number(raw);
}
