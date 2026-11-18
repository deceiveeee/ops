import { CLUE_COUNT, squares, type GameState } from "./game";

const GLYPH = { miss: "🟥", solve: "🟩", unused: "⬜" } as const;

/**
 * The opening line of a shared result: how it went, then an invitation. It
 * counts clues, because that is the score the squares show; a skipped clue
 * costs the same as a wrong guess. Kept to one line on a phone, where it is
 * also the result line under the answer.
 */
export function shareHeadline(state: GameState): string {
  if (state.status === "solved") {
    return `I guessed it in ${state.shown === 1 ? "1 clue" : `${state.shown} clues`}. Your turn.`;
  }
  return `I missed it after ${CLUE_COUNT} clues. Your turn.`;
}

/** What the puzzle is, for a friend who has never seen it. */
export function shareInvite(number: number): string {
  return `Investing Studio daily puzzle #${number}: guess a real company from its annual report.`;
}

/**
 * What a learner posts after a puzzle: how it went and a link to play the same
 * puzzle, never the answer. The squares are the clues in order, so a friend can
 * see how early it fell without learning which company it was. The link comes
 * last, on its own line, so chat apps turn it into a preview card.
 */
export function shareText(number: number, state: GameState, url: string): string {
  return [shareHeadline(state), squares(state).map((square) => GLYPH[square]).join(""), shareInvite(number), url].join("\n");
}
