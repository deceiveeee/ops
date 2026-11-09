"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CLUE_COUNT } from "@/lib/daily-puzzle/game";
import { loadSaved, type PuzzleRecord } from "@/lib/daily-puzzle/storage";
import styles from "./daily.module.css";

function status(record: PuzzleRecord | undefined): string {
  if (!record || record.moves.length === 0) return "Not played";
  if (record.result === "solved") return `Solved with ${record.moves.length} of ${CLUE_COUNT}`;
  if (record.result === "missed") return "Not solved";
  return "In progress";
}

/** Every puzzle that has opened, newest first, with how each went in this browser. Answers are never listed. */
export default function PastPuzzles({ puzzles }: { puzzles: { number: number; date: string }[] }) {
  const [records, setRecords] = useState<Record<string, PuzzleRecord>>({});
  useEffect(() => setRecords(loadSaved().puzzles), []);

  return (
    <ol className={styles.grid} reversed>
      {puzzles.map(({ number, date }) => (
        <li key={number}>
          <Link className={styles.tile} href={`/daily/${number}`} aria-label={`Puzzle ${number}, ${date}: ${status(records[String(number)])}`}>
            <span className={styles.tileNumber}>#{number}</span>
            <span>{date}</span>
            <span>{status(records[String(number)])}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
