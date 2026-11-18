import Link from "next/link";
import DailyPuzzleView from "@/components/daily/DailyPuzzleView";
import type { DailyPuzzle } from "@/lib/daily-puzzle/types";
import styles from "./homepage.module.css";

export type HomePuzzleData = {
  puzzle: DailyPuzzle;
  /** False once the published puzzles run out and the newest stays up. */
  isToday: boolean;
  /** "November 4, 2026". */
  date: string;
  shareUrl: string;
};

/**
 * The real daily puzzle, playable in place. Progress is the same record the
 * /daily page keeps in this browser, so a game started here carries on there.
 */
export default function HomePuzzle({ puzzle, isToday, date, shareUrl }: HomePuzzleData) {
  return (
    <section className={styles.puzzle} aria-labelledby="home-puzzle-title">
      <div className={styles.puzzleTop}>
        <p className={styles.puzzleMeta}>
          {isToday ? "Today's company puzzle" : "The newest company puzzle"} · #{puzzle.number} · {date} ·{" "}
          <Link href="/daily/past">Past puzzles</Link>
        </p>
        <span className={styles.tryTag} aria-hidden="true">Try it</span>
      </div>
      <h2 id="home-puzzle-title" className={styles.puzzleTitle}>Which company is this?</h2>
      <p className={styles.puzzleLead}>Guess the company from its latest annual report, in as few clues as you can.</p>
      <DailyPuzzleView puzzle={puzzle} isToday={isToday} shareUrl={shareUrl} layout="stacked" />
    </section>
  );
}
