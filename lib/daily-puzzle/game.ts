/**
 * The rules of one puzzle, as a list of what the learner did.
 *
 * Everything shown is worked out from that list, so a saved game can only
 * ever be in a state the rules allow:
 *
 * - The first clue is showing from the start.
 * - A wrong guess, or asking for the next clue, shows one more clue.
 * - A right guess solves the puzzle with however many clues were showing.
 * - A wrong guess or a skip with all six clues showing ends it unsolved.
 */
export const CLUE_COUNT = 6;

/** A guess names a company by `guessId`: its ticker where it has one, else its name. */
export type Move = { type: "guess"; id: string } | { type: "skip" };

export type GameState = {
  moves: Move[];
  /** How many clues are showing, 1 to 6. */
  shown: number;
  status: "playing" | "solved" | "missed";
  /** The companies guessed so far, wrong ones included, by guess id. */
  guessed: string[];
};

export function play(moves: readonly Move[], answer: string): GameState {
  const kept: Move[] = [];
  let misses = 0;
  let status: GameState["status"] = "playing";
  const guessed: string[] = [];
  for (const move of moves) {
    if (status !== "playing") break;
    if (move.type === "guess") {
      // The same wrong company twice costs nothing the second time.
      if (guessed.includes(move.id)) continue;
      guessed.push(move.id);
      kept.push(move);
      if (move.id === answer) {
        status = "solved";
        break;
      }
    } else {
      kept.push(move);
    }
    misses += 1;
    if (misses >= CLUE_COUNT) status = "missed";
  }
  return { moves: kept, shown: Math.min(CLUE_COUNT, 1 + misses), status, guessed };
}

/** One square per clue: a miss, the solve, or a clue never needed. */
export type Square = "miss" | "solve" | "unused";

export function squares(state: GameState): Square[] {
  const misses = state.status === "solved" ? state.shown - 1 : state.status === "missed" ? CLUE_COUNT : state.shown - 1;
  return Array.from({ length: CLUE_COUNT }, (_, index) =>
    index < misses ? "miss" : index === misses && state.status === "solved" ? "solve" : "unused",
  );
}
