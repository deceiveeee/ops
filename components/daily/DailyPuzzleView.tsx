"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { countOnce } from "@/lib/counts/count";
import { cluesFor } from "@/lib/daily-puzzle/clues";
import { CLUE_COUNT, play, type Move } from "@/lib/daily-puzzle/game";
import { dateIn, PUZZLE_TIME_ZONE } from "@/lib/daily-puzzle/schedule";
import { guessId } from "@/lib/daily-puzzle/search";
import { loadSaved, solvedThisMonth, storeSaved, type Saved } from "@/lib/daily-puzzle/storage";
import type { DailyPuzzle, GuessableCompany } from "@/lib/daily-puzzle/types";
import ClueSheet from "./ClueSheet";
import GuessPanel from "./GuessPanel";
import ResultPanel from "./ResultPanel";
import styles from "./daily.module.css";

type Props = {
  puzzle: DailyPuzzle;
  isToday: boolean;
  /** The canonical address of this puzzle, for the shared result. */
  shareUrl: string;
};

/**
 * One day's puzzle. The answer is checked here in the browser and progress is
 * kept in this browser only, so playing sends nothing anywhere. Moves are
 * restored after the page loads; until then the guess box waits, so a guess
 * can never be laid over a game that is about to be restored.
 */
export default function DailyPuzzleView({ puzzle, isToday, shareUrl }: Props) {
  const key = String(puzzle.number);
  const [saved, setSaved] = useState<Saved>({ version: 1, puzzles: {} });
  const [moves, setMoves] = useState<Move[]>([]);
  const [ready, setReady] = useState(false);
  const [fresh, setFresh] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [unsaved, setUnsaved] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const answer = puzzle.answer.ticker;

  useEffect(() => {
    const restored = loadSaved();
    setSaved(restored);
    setMoves(restored.puzzles[key]?.moves ?? []);
    setReady(true);
  }, [key]);

  const state = useMemo(() => play(moves, answer), [moves, answer]);
  const clues = useMemo(() => cluesFor(puzzle), [puzzle]);
  const finished = state.status !== "playing";
  const today = dateIn(PUZZLE_TIME_ZONE, new Date());

  const commit = (move: Move, said: (next: ReturnType<typeof play>) => string) => {
    if (!ready || finished) return;
    const next = play([...state.moves, move], answer);
    const done = next.status !== "playing";
    const updated: Saved = {
      ...saved,
      puzzles: {
        ...saved.puzzles,
        [key]: { moves: next.moves, ...(done ? { finishedOn: dateIn(PUZZLE_TIME_ZONE, new Date()), result: next.status as "solved" | "missed" } : {}) },
      },
    };
    setUnsaved(!storeSaved(updated));
    setSaved(updated);
    setMoves(next.moves);
    setFresh(next.shown > state.shown ? next.shown - 1 : null);
    setAnnouncement(said(next));
    // Only the number of clues showing leaves the browser, never the guesses. Once per puzzle,
    // so the same puzzle solved again in a second tab that had not caught up is not a second solve.
    if (next.status === "solved") countOnce(`puzzle:${key}`, { name: "Puzzle solved", puzzle: puzzle.number, clues: next.shown });
  };

  const guess = (company: GuessableCompany) =>
    commit({ type: "guess", id: guessId(company) }, (next) =>
      next.status === "solved"
        ? `Correct: it was ${puzzle.answer.name}.`
        : next.status === "missed"
          ? `Not ${company.name}. The answer was ${puzzle.answer.name}.`
          : `Not ${company.name}. Clue ${next.shown} is now showing.`,
    );

  const skip = () =>
    commit({ type: "skip" }, (next) =>
      next.status === "missed" ? `The answer was ${puzzle.answer.name}.` : `Clue ${next.shown} is now showing.`,
    );

  // Keyboard and screen reader users land on the answer when the puzzle ends.
  useEffect(() => {
    if (finished && announcement) resultHeading.current?.focus();
  }, [finished, announcement]);

  return (
    <div className={styles.layout}>
      <ClueSheet
        clues={clues}
        shown={finished ? CLUE_COUNT : state.shown}
        finished={finished}
        fresh={fresh}
        answerName={finished ? puzzle.answer.name : null}
        source="From its latest annual report (Form 10-K)"
      />
      <div>
        {finished ? (
          <ResultPanel
            ref={resultHeading}
            puzzle={puzzle}
            state={state}
            shareUrl={shareUrl}
            solvedThisMonth={solvedThisMonth(saved, today)}
            isToday={isToday}
          />
        ) : (
          <GuessPanel state={state} ready={ready} onGuess={guess} onSkip={skip} />
        )}
        {unsaved ? (
          <p className={styles.note}>This browser is not keeping your progress, so it will be lost if you leave the page.</p>
        ) : null}
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>
  );
}
