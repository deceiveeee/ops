"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { forwardRef, useEffect, useState } from "react";
import { count } from "@/lib/counts/count";
import { filingIndexUrl } from "@/lib/filings/edgar";
import type { GameState } from "@/lib/daily-puzzle/game";
import { longDate } from "@/lib/daily-puzzle/schedule";
import { shareHeadline, shareText } from "@/lib/daily-puzzle/share";
import type { DailyPuzzle } from "@/lib/daily-puzzle/types";
import { markShared } from "@/lib/share";
import { Squares } from "./GuessPanel";
import styles from "./daily.module.css";

type Props = {
  puzzle: DailyPuzzle;
  state: GameState;
  shareUrl: string;
  solvedThisMonth: number;
  isToday: boolean;
};

/** The lesson that teaches where these three figures are reported. */
const STATEMENTS_LESSON = "/lessons/if-4-1-the-three-financial-statements";

/**
 * The answer, and where to go from it: challenge a friend with the result,
 * open the very passage the last clue quoted, or read the whole report in
 * Studio. The message to send is shown first, link and all, so sharing is the
 * obvious next step and nobody has to guess what will be posted.
 */
const ResultPanel = forwardRef<HTMLHeadingElement, Props>(function ResultPanel({ puzzle, state, shareUrl, solvedThisMonth, isToday }, heading) {
  const router = useRouter();
  const [note, setNote] = useState<{ message: string; search?: string } | null>(null);
  const [opening, setOpening] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [canShareNatively, setCanShareNatively] = useState(false);
  const { answer, report, description } = puzzle;
  const reader = `/studio/filings/${answer.cik}/${report.accession}?doc=${encodeURIComponent(report.document)}&ticker=${encodeURIComponent(answer.ticker)}`;
  // The link in the post says how it was shared (see `markShared`), so an arrival from it can be counted.
  const textVia = (how: "app" | "link") => shareText(puzzle.number, state, markShared(shareUrl, how));
  // The preview shows the plain address; the mark is added only to what is actually sent.
  const shownLink = shareUrl.replace(/^https?:\/\/(www\.)?/, "");

  useEffect(() => {
    setCanShareNatively(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const share = async () => {
    if (canShareNatively) {
      try {
        await navigator.share({ text: textVia("app") });
        count({ name: "Shared", page: "puzzle", how: "app" });
        return;
      } catch (error) {
        // Closing the share sheet is a choice, not a failure. Any other refusal falls back to copying.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(textVia("link"));
      count({ name: "Shared", page: "puzzle", how: "link" });
      setShareNote("Result copied. Paste it anywhere: it shows how you did, not the answer.");
    } catch {
      setShareNote("Copying was blocked by this browser.");
    }
  };

  /** Finds the quoted words in a fresh copy of the report, the way Investigate opens a kept passage. */
  const openPassage = async () => {
    setNote(null);
    setOpening(true);
    const opening5 = description.anchor.quote.split(/\s+/).slice(0, 5).join(" ");
    try {
      const response = await fetch("/api/studio/locate-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cik: answer.cik,
          accession: report.accession,
          document: report.document,
          sectionId: description.anchor.sectionId,
          quote: description.anchor.quote,
          prefix: description.anchor.prefix,
          suffix: description.anchor.suffix,
          offset: description.anchor.offset,
        }),
      });
      const found = (await response.json()) as { found?: boolean; strategy?: string; sectionId?: string; start?: number; end?: number; message?: string; error?: string };
      if (found.found && found.start !== undefined && found.end !== undefined) {
        const moved = found.strategy && found.strategy !== "position" ? `&moved=${found.strategy}` : "";
        router.push(`${reader}&section=${found.sectionId}&at=${found.start}&len=${found.end - found.start}${moved}#passage`);
        return;
      }
      setNote({ message: found.message ?? found.error ?? "The passage could not be found in the report.", search: `${reader}&q=${encodeURIComponent(opening5)}` });
    } catch {
      setNote({ message: "The report could not be reached just now.", search: `${reader}&q=${encodeURIComponent(opening5)}` });
    } finally {
      setOpening(false);
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="daily-result">
      <h2 id="daily-result" ref={heading} tabIndex={-1} className={styles.result}>
        It was {answer.name}.
      </h2>
      {/*
        * The result is said once, as the message a friend would receive. It is
        * set as a quoted note rather than a boxed card: on a phone the box's
        * padding alone pushed the finished puzzle past a screen and a half.
        */}
      <figure className={styles.sharePreview} aria-label="Your result, ready to send">
        <p className={styles.shareHeadline}>{shareHeadline(state)}</p>
        <div className={styles.shareMeta}>
          <Squares state={state} />
          <span>{solvedThisMonth} solved this month</span>
        </div>
        <p className={styles.shareLink}>{shownLink}</p>
      </figure>

      <div className={styles.row}>
        <button type="button" className={styles.button} onClick={share}>
          Challenge a friend
        </button>
        <button type="button" className={styles.ghost} onClick={openPassage} disabled={opening}>
          {opening ? "Finding it…" : "Open the quote"}
        </button>
      </div>
      <p role="status" aria-live="polite" className={shareNote ? styles.note : "sr-only"}>
        {shareNote ?? ""}
      </p>
      {note ? (
        <p className={styles.note} role="alert">
          {note.message}{" "}
          {note.search ? (
            <Link className="underline underline-offset-4" href={note.search}>
              Search the report for it
            </Link>
          ) : null}
        </p>
      ) : null}

      {/*
        * Where the clues came from, and where to read more, one tap away: drawn
        * open it took a phone past a screen and a half once the answer showed.
        */}
      <details className={styles.more}>
        <summary>Where these clues came from</summary>
        <p>
          The figures and words are from its annual report (Form 10-K) for the year ending {longDate(report.periodEnd)}, filed{" "}
          {longDate(report.filed)}. The industry is the code the SEC files it under.
        </p>
        <ul>
          <li>
            <Link href={reader}>Read its whole annual report</Link>
          </li>
          <li>
            <a href={filingIndexUrl(answer.cik, report.accession)} target="_blank" rel="noreferrer">
              See the filing at the SEC
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <Link href={STATEMENTS_LESSON}>Learn where revenue, profit and assets are reported</Link>
          </li>
        </ul>
      </details>
      {isToday ? <p className={styles.note}>A new puzzle starts at midnight, New York time.</p> : null}
    </section>
  );
});

export default ResultPanel;
