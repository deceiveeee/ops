import type { Metadata } from "next";
import Link from "next/link";
import PastPuzzles from "@/components/daily/PastPuzzles";
import styles from "@/components/daily/daily.module.css";
import { LAST_PUZZLE } from "@/lib/daily-puzzle/catalog";
import { dateOfPuzzle, todaysNumber } from "@/lib/daily-puzzle/schedule";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Past daily company puzzles — Investing Studio",
  description: "Every daily company puzzle so far, each built from one company's annual report.",
};

const SHORT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export default function PastPuzzlesPage() {
  const today = Math.min(todaysNumber(new Date()), LAST_PUZZLE);
  const puzzles = Array.from({ length: Math.max(today, 0) }, (_, index) => today - index).map((number) => ({
    number,
    date: SHORT.format(new Date(`${dateOfPuzzle(number)}T12:00:00Z`)),
  }));
  return (
    <div className={styles.page}>
      <header>
        <p className={styles.eyebrow}>
          <Link href="/daily" className="underline underline-offset-4">
            Today&apos;s puzzle
          </Link>
        </p>
        <h1 className={styles.title}>Past puzzles</h1>
        <p className={styles.lead}>
          Every puzzle so far, newest first. A new one opens each day at midnight, New York time. How you did is kept in this browser.
        </p>
      </header>
      {puzzles.length ? <PastPuzzles puzzles={puzzles} /> : <p className={styles.lead}>The first puzzle has not opened yet.</p>}
    </div>
  );
}
