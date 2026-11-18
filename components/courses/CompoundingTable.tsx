"use client";

import { useId, useState } from "react";
import styles from "./courses.module.css";

const START = 100;
const YEARS = 10;
const RATES = [2, 5, 8];
const HIGHEST = Math.max(...RATES) / 100;
const money = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * An OPS example, not a market figure: $100 left to grow at a fixed rate for
 * ten years. The growth column is the lesson. Each year's growth is larger than
 * the last because it is earned on the earlier growth too, and the bar beside
 * each figure makes that visible. Every bar shares one scale, the largest
 * single year at the highest rate, so changing the rate compares honestly.
 */
export default function CompoundingTable() {
  const [rate, setRate] = useState(5);
  const id = useId();
  const r = rate / 100;
  const widest = START * (1 + HIGHEST) ** (YEARS - 1) * HIGHEST;
  const rows = Array.from({ length: YEARS }, (_, index) => {
    const opening = START * (1 + r) ** index;
    return { year: index + 1, growth: opening * r, balance: opening * (1 + r) };
  });
  const final = rows[rows.length - 1].balance;

  return (
    <figure className="teaching-visual" aria-labelledby={`${id}-title`}>
      <figcaption>
        <span className="teaching-visual-kicker">An OPS example to try</span>
        <strong id={`${id}-title`}>What ten years do to $100</strong>
        <span className="teaching-visual-unit">Choose a growth rate per year</span>
      </figcaption>
      <div className={styles.rateButtons} role="group" aria-label="Growth rate per year">
        {RATES.map((option) => (
          <button key={option} type="button" aria-pressed={rate === option} onClick={() => setRate(option)}>
            {option}%
          </button>
        ))}
      </div>
      <table className={styles.growthTable}>
        <caption className="sr-only">$100 growing at {rate}% a year for ten years</caption>
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">Growth that year</th>
            <th scope="col">Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year}>
              <th scope="row">{row.year}</th>
              <td>
                <span className={styles.growthCell}>
                  <span className={styles.growthBar} style={{ width: `${(row.growth / widest) * 100}%` }} aria-hidden="true" />
                  <span>{money(row.growth)}</span>
                </span>
              </td>
              <td>{money(row.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className={styles.growthResult} role="status" aria-live="polite" aria-atomic="true">
        After {YEARS} years at {rate}%: {money(final)}
      </p>
      <p className="teaching-visual-explanation">
        Compounding means earning growth on earlier growth. Each year&apos;s growth is larger than the last because it is worked out on a larger balance.
      </p>
      <p className="teaching-visual-source">Fixed rate, growth added once a year, no deposits, withdrawals, fees or tax. Real investment returns vary and can be negative.</p>
    </figure>
  );
}
