import Image from "next/image";
import { marginWords } from "@/lib/daily-puzzle/clues";
import type { ReportExcerpt as Excerpt } from "@/lib/daily-puzzle/excerpts";
import { longDate } from "@/lib/daily-puzzle/schedule";
import type { DailyPuzzle } from "@/lib/daily-puzzle/types";
import { archivePath } from "@/lib/filings/edgar";
import styles from "./daily.module.css";

/** A line's name without its footnote markers: "Net sales (Note 2 and Note 13)" -> "Net sales". */
function lineName(label: string): string {
  return label.replace(/\s*\((\d+|[a-z]|note[^)]*)\)\s*$/i, "").trim();
}

/**
 * The company's own income statement behind clues 1 and 2, as the annual
 * report prints it, latest year only, with the clue lines highlighted. Shown
 * only once the puzzle is over, because the statement names the company.
 */
export default function ReportExcerpt({ puzzle, excerpt }: { puzzle: DailyPuzzle; excerpt: Excerpt }) {
  const revenue = excerpt.shows.find((row) => row.clue === "revenue")!;
  const operating = excerpt.shows.find((row) => row.clue === "margin")!;
  const margin = marginWords(puzzle.operatingProfit.value, puzzle.revenue.value);
  // Reports print a loss in brackets; a beginner meets that here first, so it is said before the subtraction uses it.
  const bracketed = /^\(.*\)$/.test(operating.printed.trim());
  // Where the figures sit in a note table rather than a titled statement, say so rather than name a statement.
  const source = excerpt.statement ? `${puzzle.answer.name}'s ${excerpt.statement}` : `a table in ${puzzle.answer.name}'s annual report`;
  const alt = (part: Excerpt["parts"][number]) =>
    `Part of ${source}, in ${excerpt.units} of dollars, from ${part.from} to ${part.to}.` +
    excerpt.shows
      .filter((row) => row.label === part.to)
      .map((row) => ` Highlighted: ${row.label}, ${row.printed}.`)
      .join("");

  return (
    <figure className={styles.excerpt}>
      <p className={styles.excerptTitle}>Clues 1 and 2, as the annual report prints them</p>
      <div className={styles.excerptParts}>
        {excerpt.parts.map((part, index) => (
          <div key={part.src}>
            {index > 0 && excerpt.leftOut > 0 ? (
              <p className={styles.excerptGap}>
                {excerpt.leftOut} {excerpt.leftOut === 1 ? "line" : "lines"} of the {excerpt.statement ? "statement" : "table"} between these two parts {excerpt.leftOut === 1 ? "is" : "are"} left out.
              </p>
            ) : null}
            {/* Captured at twice its laid-out size: never shown wider than that size, so the filing's text stays sharp. */}
            <Image src={part.src} width={part.width} height={part.height} alt={alt(part)} sizes={`${part.width / 2}px`} className={styles.excerptImage} style={{ maxWidth: part.width / 2 }} />
          </div>
        ))}
      </div>
      <figcaption className={styles.excerptCaption}>
        <span>
          The report counts in {excerpt.units} of dollars. Clue 1&rsquo;s revenue is the line &ldquo;{lineName(revenue.label)}&rdquo;: {revenue.printed}. Clue 2
          divides &ldquo;{lineName(operating.label)}&rdquo;, {operating.printed}, by that revenue: {margin.charAt(0).toLowerCase() + margin.slice(1)}.
          {bracketed ? (
            <>
              {" "}The report puts brackets around a negative number, so {operating.printed} is a loss of {operating.printed.trim().slice(1, -1)}.
            </>
          ) : null}
          {excerpt.costs ? (
            <>
              {" "}It is also revenue minus &ldquo;{lineName(excerpt.costs.label)}&rdquo;: {revenue.printed} &minus; {excerpt.costs.printed} = {operating.printed}.
            </>
          ) : null}
        </span>
        <span className={styles.excerptSource}>
          From its annual report (Form 10-K) for the year ending {longDate(puzzle.report.periodEnd)}, filed {longDate(puzzle.report.filed)}, on{" "}
          <a href={archivePath(puzzle.answer.cik, puzzle.report.accession, puzzle.report.document)} target="_blank" rel="noreferrer">
            the SEC&rsquo;s EDGAR<span className="sr-only"> (opens in a new tab)</span>
          </a>
          . Only the latest year&rsquo;s column is shown, and the highlighting is added.
        </span>
      </figcaption>
    </figure>
  );
}
