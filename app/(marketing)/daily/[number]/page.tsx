import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DailyPuzzleView from "@/components/daily/DailyPuzzleView";
import PuzzleHeader from "@/components/daily/PuzzleHeader";
import styles from "@/components/daily/daily.module.css";
import { LAST_PUZZLE, parsePuzzleNumber, puzzleNumbered } from "@/lib/daily-puzzle/catalog";
import { dateOfPuzzle, longDate, todaysNumber } from "@/lib/daily-puzzle/schedule";
import { canonicalUrl } from "@/lib/share";
import { getSiteUrl } from "@/lib/site-url";

// Whether a puzzle has opened yet depends on the date, so this page is drawn per visit.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { number: string } }): Metadata {
  const number = parsePuzzleNumber(params.number);
  if (number === null || number > LAST_PUZZLE) return { title: "Daily company puzzle — Investing Studio" };
  const description = "Six clues from one company's annual report. Guess the company in as few clues as you can.";
  return {
    title: `Daily company puzzle #${number} — Investing Studio`,
    description,
    openGraph: { title: `Which company is this? Puzzle #${number}`, description, type: "website", url: `/daily/${number}`, siteName: "Investing Studio" },
    twitter: { card: "summary_large_image", title: `Which company is this? Puzzle #${number}`, description },
  };
}

/**
 * One puzzle by number, for a shared result and for the archive. A puzzle
 * whose day has not come says when it opens and sends none of its clues.
 */
export default function NumberedPuzzlePage({ params }: { params: { number: string } }) {
  const number = parsePuzzleNumber(params.number);
  if (number === null || number > LAST_PUZZLE) notFound();
  const today = todaysNumber(new Date());
  const eyebrow = `Daily company puzzle #${number} · ${longDate(dateOfPuzzle(number))}`;

  if (number > today) {
    return (
      <div className={styles.page}>
        <PuzzleHeader eyebrow={eyebrow} lead={`This puzzle opens on ${longDate(dateOfPuzzle(number))}, at midnight New York time.`} />
        <p className="mt-4">
          <Link href="/daily" className={styles.button}>
            Play today&apos;s puzzle
          </Link>
        </p>
      </div>
    );
  }

  const puzzle = puzzleNumbered(number);
  if (!puzzle) notFound();
  return (
    <div className={styles.page}>
      <PuzzleHeader eyebrow={number === today ? `${eyebrow} · today's puzzle` : eyebrow} />
      <DailyPuzzleView puzzle={puzzle} isToday={number === today} shareUrl={canonicalUrl(`/daily/${number}`, getSiteUrl())} />
    </div>
  );
}
