import { CLUE_TITLES } from "@/lib/daily-puzzle/clues";
import { OG_CONTENT_TYPE, OG_SIZE, puzzleCard } from "@/lib/og/card";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Which company is this? Six redacted clues from a real annual report";

/** Never the answer: the card shows the puzzle's number and its six clue titles only. */
export default async function NumberedPuzzleImage({ params }: { params: { number: string } }) {
  const number = /^[1-9]\d{0,4}$/.test(params.number) ? Number(params.number) : null;
  return puzzleCard({ number, clueLabels: [...CLUE_TITLES] });
}
