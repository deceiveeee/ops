import type { Move } from "./game";

/**
 * Puzzle progress, kept in this browser only.
 *
 * Nothing about a puzzle is sent anywhere: the answer is checked on the page
 * and the moves are kept here so a learner who leaves mid-puzzle comes back to
 * the same clues. A record that is missing, unreadable or from a future
 * version is treated as no progress, never as an error.
 */
export const STORAGE_KEY = "ops-daily-puzzle-v1";

export type PuzzleRecord = {
  /** The moves the rules kept (see `play`), so a solved record's length is the clues it took. */
  moves: Move[];
  /** The New York date the puzzle was finished, YYYY-MM-DD, once it is. */
  finishedOn?: string;
  /** How it ended, kept so the archive can say without knowing every answer. */
  result?: "solved" | "missed";
};

export type Saved = { version: 1; puzzles: Record<string, PuzzleRecord> };

const empty = (): Saved => ({ version: 1, puzzles: {} });

const isMove = (value: unknown): value is Move => {
  if (!value || typeof value !== "object") return false;
  const move = value as Record<string, unknown>;
  return move.type === "skip" || (move.type === "guess" && typeof move.id === "string" && move.id.length > 0 && move.id.length <= 60);
};

export function parseSaved(raw: string | null): Saved {
  if (!raw) return empty();
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (value?.version !== 1 || !value.puzzles || typeof value.puzzles !== "object") return empty();
    const puzzles: Record<string, PuzzleRecord> = {};
    for (const [key, record] of Object.entries(value.puzzles as Record<string, unknown>)) {
      if (!/^\d{1,5}$/.test(key) || !record || typeof record !== "object") continue;
      const { moves, finishedOn, result } = record as Record<string, unknown>;
      if (!Array.isArray(moves) || !moves.every(isMove)) continue;
      const finished = typeof finishedOn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(finishedOn);
      puzzles[key] = {
        moves: moves.slice(0, 40),
        ...(finished ? { finishedOn } : {}),
        ...(finished && (result === "solved" || result === "missed") ? { result } : {}),
      };
    }
    return { version: 1, puzzles };
  } catch {
    return empty();
  }
}

export function loadSaved(): Saved {
  try {
    return parseSaved(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return empty();
  }
}

export function storeSaved(saved: Saved): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    return true;
  } catch {
    // Private windows and full storage refuse writes; the puzzle still plays, it just will not be remembered.
    return false;
  }
}

/** Puzzles solved in the calendar month of `today`, from what was kept. */
export function solvedThisMonth(saved: Saved, today: string): number {
  const month = today.slice(0, 7);
  return Object.values(saved.puzzles).filter((record) => record.result === "solved" && record.finishedOn?.startsWith(month)).length;
}
