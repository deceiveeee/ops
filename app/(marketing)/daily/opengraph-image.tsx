import { CLUE_TITLES } from "@/lib/daily-puzzle/clues";
import { OG_CONTENT_TYPE, OG_SIZE, puzzleCard } from "@/lib/og/card";

export const runtime = "edge";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Which company is this? Six redacted clues from a real annual report";

export default async function DailyImage() {
  return puzzleCard({ number: null, clueLabels: [...CLUE_TITLES] });
}
