"use client";

import { useId, useMemo, useRef, useState } from "react";
import { GUESSABLE } from "@/data/daily-puzzle/companies";
import { CLUE_COUNT, squares, type GameState } from "@/lib/daily-puzzle/game";
import { guessId, searchCompanies } from "@/lib/daily-puzzle/search";
import type { GuessableCompany } from "@/lib/daily-puzzle/types";
import styles from "./daily.module.css";

export function Squares({ state }: { state: GameState }) {
  const marks = squares(state);
  const words = { miss: "missed", solve: "solved", unused: "not needed" } as const;
  return (
    <span className={styles.squares} role="img" aria-label={marks.map((mark, index) => `clue ${index + 1} ${words[mark]}`).join(", ")}>
      {marks.map((mark, index) => (
        <span key={index} className={styles.square} data-square={mark} />
      ))}
    </span>
  );
}

type Props = {
  state: GameState;
  ready: boolean;
  onGuess: (company: GuessableCompany) => void;
  onSkip: () => void;
};

/**
 * Typing a name lists up to five companies to choose from; choosing one is
 * the guess. Enter takes the first. A company already guessed is not offered
 * again, so a learner cannot spend a clue on the same wrong answer twice.
 */
export default function GuessPanel({ state, ready, onGuess, onSkip }: Props) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const listId = useId();
  const found = useMemo(() => searchCompanies(query, GUESSABLE, 8), [query]);
  const matches = useMemo(
    () => found.filter((company) => !state.guessed.includes(guessId(company))).slice(0, 5),
    [found, state.guessed],
  );
  const guessedNames = state.guessed.map((id) => GUESSABLE.find((company) => guessId(company) === id)?.name ?? id);

  const choose = (company: GuessableCompany) => {
    onGuess(company);
    setQuery("");
    input.current?.focus();
  };

  return (
    <section className={styles.panel} aria-labelledby={`${inputId}-label`}>
      <div className={styles.panelHead}>
        <label id={`${inputId}-label`} htmlFor={inputId} className={styles.panelTitle}>
          Your guess
        </label>
        <span className={styles.count}>
          {state.shown} of {CLUE_COUNT} clues showing
        </span>
      </div>
      <input
        ref={input}
        id={inputId}
        className={styles.input}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="Type a company name"
        value={query}
        disabled={!ready}
        aria-controls={listId}
        aria-describedby={`${inputId}-hint`}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && matches[0]) {
            event.preventDefault();
            choose(matches[0]);
          }
        }}
      />
      <p id={`${inputId}-hint`} className="sr-only">
        Matching companies appear below the box. Enter guesses the first one.
      </p>
      <ul id={listId} className={styles.matches} aria-label="Matching companies">
        {matches.map((company) => (
          <li key={guessId(company)}>
            <button type="button" className={styles.match} onClick={() => choose(company)}>
              <span>{company.name}</span>
              <span className={styles.matchHint} aria-hidden="true">
                Guess
              </span>
            </button>
          </li>
        ))}
      </ul>
      {query.trim() && matches.length === 0 ? (
        <p className={styles.noMatch}>
          {found.length
            ? "You have already guessed that one."
            : "No company on the list matches that. The answer is always one you can find here."}
        </p>
      ) : null}

      <div className={`${styles.row} ${styles.spread}`}>
        <button type="button" className={styles.ghost} onClick={onSkip} disabled={!ready}>
          {state.shown < CLUE_COUNT ? "Show the next clue" : "Give up and see the answer"}
        </button>
        <Squares state={state} />
      </div>
      {guessedNames.length ? (
        <>
          <p className="sr-only">Wrong guesses so far:</p>
          <ul className={styles.guessed}>
            {guessedNames.map((name) => (
              <li key={name} className={styles.guessedItem}>
                {name}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  );
}
