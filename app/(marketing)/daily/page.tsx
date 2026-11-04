import type { Metadata } from "next";
import Link from "next/link";
import DailyPuzzleView from "@/components/daily/DailyPuzzleView";
import PuzzleHeader from "@/components/daily/PuzzleHeader";
import styles from "@/components/daily/daily.module.css";
import { LAST_PUZZLE, puzzleNumbered } from "@/lib/daily-puzzle/catalog";
import { dateOfPuzzle, longDate, todaysNumber } from "@/lib/daily-puzzle/schedule";
import { canonicalUrl } from "@/lib/share";
import { getSiteUrl } from "@/lib/site-url";

// Which puzzle is today's depends on the date, so this page is drawn per visit.
export const dynamic = "force-dynamic";

const DESCRIPTION = "A new puzzle every day: six clues from one company's annual report. Guess the company in as few clues as you can.";

export const metadata: Metadata = {
  title: "Daily company puzzle — Investing Studio",
  description: DESCRIPTION,
  openGraph: { title: "Which company is this?", description: DESCRIPTION, type: "website", url: "/daily", siteName: "Investing Studio" },
  twitter: { card: "summary_large_image", title: "Which company is this?", description: DESCRIPTION },
};

export default function DailyPage() {
  const today = todaysNumber(new Date());
  const puzzle = today >= 1 && today <= LAST_PUZZLE ? puzzleNumbered(today) : null;

  if (!puzzle) {
    return (
      <div className={styles.page}>
        <PuzzleHeader
          eyebrow="Daily company puzzle"
          lead={
            today < 1
              ? `The first puzzle opens on ${longDate(dateOfPuzzle(1))}.`
              : "There is no new puzzle today. Every earlier puzzle is still open to play."
          }
        />
        {today > LAST_PUZZLE ? (
          <p className="mt-4">
            <Link href="/daily/past" className={styles.button}>
              Play a past puzzle
            </Link>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PuzzleHeader eyebrow={`Daily company puzzle #${puzzle.number} · ${longDate(dateOfPuzzle(puzzle.number))}`} />
      <DailyPuzzleView puzzle={puzzle} isToday shareUrl={canonicalUrl(`/daily/${puzzle.number}`, getSiteUrl())} />
    </div>
  );
}
