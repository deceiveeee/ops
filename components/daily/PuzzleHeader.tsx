import Link from "next/link";
import styles from "./daily.module.css";

/**
 * The one heading of a puzzle page: which puzzle, and what to do. Kept short so the clues start in the first screen:
 * on a 390px phone the line above the title fits one line and the lead two, which a long puzzle needs to stay within
 * a screen and a half once it is over.
 */
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
        {lead ?? "Six clues from one company's annual report, numbers first. Guess it in as few as you can."}
      </p>
    </header>
  );
}
