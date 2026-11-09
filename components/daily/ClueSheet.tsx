"use client";

import { useEffect, useId, useState } from "react";
import { blanks, type Clue } from "@/lib/daily-puzzle/clues";
import styles from "./daily.module.css";

/** Clue text with each blanked name drawn as a black bar that a screen reader reads as "name removed". */
export function Words({ text }: { text: string }) {
  return (
    <>
      {blanks(text).map((part, index) =>
        part.blank ? (
          <span key={index} className={styles.blank} role="img" aria-label="name removed" />
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

function Body({ clue }: { clue: Clue }) {
  if (clue.kind === "mix") {
    return (
      <ul className={styles.mix}>
        {clue.rows.map((row, index) => (
          <li key={index} className={styles.mixRow}>
            <span>
              <Words text={row.label} />
            </span>
            <span className={styles.mixShare}>{row.share}</span>
            <span className={styles.mixTrack} aria-hidden="true">
              <span className={styles.mixFill} style={{ display: "block", width: shareWidth(row.share) }} />
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className={clue.kind === "quote" ? styles.quote : styles.clueText}>
      {clue.kind === "quote" ? "“" : null}
      <Words text={clue.text} />
      {clue.kind === "quote" ? "”" : null}
    </p>
  );
}

/** "53%" -> "53%", "under 0.1%" -> "0%": only the bar's width, never shown as text. */
function shareWidth(share: string): string {
  const value = Number.parseFloat(share.replace(/[^0-9.]/g, ""));
  return `${Number.isFinite(value) && !share.startsWith("under") ? value : 0}%`;
}

type Props = {
  clues: Clue[];
  /** How many clues are showing. */
  shown: number;
  finished: boolean;
  /** The clue that has just been revealed, which alone animates. */
  fresh: number | null;
  answerName: string | null;
  source: string;
};

/**
 * The redacted annual report.
 *
 * On a wide screen it is the whole page: hidden clues show only their title,
 * so the learner knows what kind of evidence comes next; the newest clue
 * shows the meaning of its term in full and earlier ones keep it one tap away.
 *
 * Below 1024px the six rows would run past a screen and a half, so the sheet
 * shows one clue at a time with a numbered button for each: the newest is
 * selected as it arrives, and earlier ones stay a tap away. Both layouts are
 * the same rows; the narrow one only hides the rows not selected.
 */
export default function ClueSheet({ clues, shown, finished, fresh, answerName, source }: Props) {
  const ids = useId();
  const [selected, setSelected] = useState(shown - 1);
  // A newly revealed clue is the one to read next, so it takes the narrow view.
  useEffect(() => setSelected(shown - 1), [shown]);

  return (
    <section className={styles.sheet} aria-labelledby="clue-sheet-heading">
      <div className={styles.sheetHead}>
        <h2 id="clue-sheet-heading" className="text-[13px] font-medium">
          {source}
        </h2>
        <span className={styles.sheetName}>
          {answerName ? (
            <span className={styles.answerName}>{answerName}</span>
          ) : (
            <span className={styles.nameBar} role="img" aria-label="company name removed" />
          )}
        </span>
      </div>

      <div className={styles.clueTabs} role="group" aria-label="Choose a clue to read">
        {clues.map((clue, index) => (
          <button
            key={clue.id}
            type="button"
            className={styles.clueTab}
            aria-pressed={selected === index}
            aria-controls={`${ids}-${clue.id}`}
            disabled={index >= shown}
            onClick={() => setSelected(index)}
          >
            <span className="sr-only">Clue </span>
            {index + 1}
            {index >= shown ? <span className="sr-only"> (not shown yet)</span> : null}
          </button>
        ))}
      </div>

      <ol className={styles.clues}>
        {clues.map((clue, index) => {
          const visible = index < shown;
          const newest = visible && index === shown - 1 && !finished;
          return (
            <li
              key={clue.id}
              id={`${ids}-${clue.id}`}
              className={`${styles.clue} ${fresh === index ? styles.revealed : ""}`}
              data-clue={clue.id}
              data-state={visible ? "shown" : "hidden"}
              data-selected={selected === index}
            >
              <span className={styles.clueNumber} aria-hidden="true">
                {index + 1}
              </span>
              <h3 className={styles.clueTitle}>
                <span className="sr-only">Clue {index + 1}: </span>
                {clue.title}
                {visible ? null : <span className="sr-only"> (not shown yet)</span>}
              </h3>
              {visible ? (
                <div className={styles.clueBody}>
                  <Body clue={clue} />
                  {newest ? (
                    <p className={styles.definition}>{clue.definition}</p>
                  ) : finished ? (
                    // With the answer showing, the result needs the room more than the definitions do.
                    <details className={styles.defineToggle}>
                      <summary>What this means</summary>
                      {clue.definition}
                    </details>
                  ) : (
                    <>
                      {/* One clue at a time leaves room to say what it means. */}
                      <p className={`${styles.definition} ${styles.narrowOnly}`}>{clue.definition}</p>
                      <details className={`${styles.defineToggle} ${styles.wideOnly}`}>
                        <summary>What this means</summary>
                        {clue.definition}
                      </details>
                    </>
                  )}
                </div>
              ) : (
                <span className={styles.hidden} aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
