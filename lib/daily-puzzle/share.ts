import { CLUE_COUNT, squares, type GameState } from "./game";

const GLYPH = { miss: "🟥", solve: "🟩", unused: "⬜" } as const;

/**
 * What a learner posts after a puzzle: how it went, never the answer. The
 * squares are the clues in order, so a friend can see how early it fell
 * without learning which company it was.
 */
export function shareText(number: number, state: GameState, url: string): string {
  const outcome =
    state.status === "solved"
      ? `Solved with ${state.shown} of ${CLUE_COUNT} clues`
      : `Not solved with all ${CLUE_COUNT} clues`;
  return [`Investing Studio daily company puzzle #${number}`, outcome, squares(state).map((square) => GLYPH[square]).join(""), url].join("\n");
}
