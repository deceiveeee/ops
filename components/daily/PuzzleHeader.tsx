import Link from "next/link";
import styles from "./daily.module.css";

/** The one heading of a puzzle page: which puzzle, and what to do. Kept short so the clues start in the first screen. */
export default function PuzzleHeader({ eyebrow, lead }: { eyebrow: string; lead?: string }) {
  return (
    <header>
      <p className={styles.eyebrow}>
        {eyebrow} ·{" "}
        <Link href="/daily/past" className="underline underline-offset-4">
          Past puzzles
        </Link>
      </p>
      <h1 className={styles.title}>Which company is this?</h1>
      <p className={styles.lead}>
        {lead ?? "Six clues from one company's latest annual report, starting with its numbers. Guess the company in as few clues as you can."}
      </p>
    </header>
  );
}
