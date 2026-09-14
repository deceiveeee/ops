"use client";

import { useId, useState } from "react";
import styles from "./homepage.module.css";

const START = 100;
const RATE = 0.05;
const money = (amount: number) => amount.toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Original hypothetical example. Both column heights use the same zero baseline and dollar scale. */
export default function MoneyTimeExperiment() {
  const [years, setYears] = useState(5);
  const id = useId();
  const value = START * (1 + RATE) ** years;
  const lift = (value - START) * 1.3;
  return <section className={styles.experiment} aria-labelledby={`${id}-title`}>
    <div className={styles.experimentHeading}><span className={styles.experimentLabel}><span aria-hidden="true">✳</span> A little experiment</span><span className={styles.tryTag}>Try it</span></div>
    <h2 id={`${id}-title`}>What can time do to $100?</h2>
    <div className={styles.timeControls} role="group" aria-label="Choose how long the money grows">
      {[1, 5, 10].map(year => <button key={year} type="button" aria-pressed={years === year} onClick={() => setYears(year)}>{year} {year === 1 ? "year" : "years"}</button>)}
    </div>
    <div className={styles.sculpture}>
      <div className={styles.sculptureHalo} aria-hidden="true" />
      <svg viewBox="0 0 600 340" className={styles.moneySculpture} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-front`} x1="0" x2="1"><stop stopColor="#5054ee" /><stop offset="1" stopColor="#3537bf" /></linearGradient>
          <linearGradient id={`${id}-growth`} x1="0" x2="1"><stop stopColor="#d3f684" /><stop offset="1" stopColor="#b3de5b" /></linearGradient>
          <linearGradient id={`${id}-shadow`}><stop stopColor="#555183" stopOpacity=".16" /><stop offset="1" stopColor="#555183" stopOpacity="0" /></linearGradient>
        </defs>
        <g stroke="#cbc7de" strokeWidth=".8" opacity=".6">{[0, 1, 2, 3, 4, 5].map(n => <path key={n} d={`M${40 + n * 85} 306l105-63M55 ${254 + n * 12}h505`} />)}</g>
        <ellipse cx="202" cy="299" rx="110" ry="16" fill={`url(#${id}-shadow)`} /><ellipse cx="434" cy="299" rx="120" ry="16" fill={`url(#${id}-shadow)`} />
        <g><path d="M236 155l36-23v130l-36 23Z" fill="#282782" /><path d="M108 155h128v130H108Z" fill={`url(#${id}-front)`} /><path d="M108 155l36-23h128l-36 23Z" fill="#8384ff" /><path d="M111 158h122" stroke="#a6a6ff" strokeOpacity=".65" /><path d="M116 277h111" stroke="#8585f6" strokeOpacity=".4" /></g>
        <g>
          <g transform="translate(484 285) skewY(-32.574)"><rect className={styles.growthSide} x="0" y="-130" width="36" height="130" fill="#7aab36" style={{ transform: `scaleY(${value / START})` }} /></g>
          <path className={styles.growthColumn} d="M356 285h128V155H356Z" fill={`url(#${id}-growth)`} style={{ transform: `scaleY(${value / START})` }} />
          <path className={styles.growthTop} d="M356 155l36-23h128l-36 23Z" fill="#e7ffaf" style={{ transform: `translateY(${-lift}px)` }} />
          <path className={styles.growthTop} d="M359 158h122" stroke="#f3ffd9" style={{ transform: `translateY(${-lift}px)` }} />
          <path d="M364 277h111" stroke="#e6ffb5" strokeOpacity=".8" />
        </g>
        <path d="M255 211c33-32 50-46 80-51m-12-7 13 7-7 13" fill="none" stroke="#5d5978" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 6" />
      </svg>
      <div className={styles.sculptureLabels} aria-hidden="true"><div><span>You start with</span><strong>$100.00</strong></div><div><span>After {years} {years === 1 ? "year" : "years"}</span><strong>{money(value)}</strong></div></div>
    </div>
    <div className={styles.experimentResult} role="status" aria-live="polite" aria-atomic="true"><span>Same $100. More time to grow.</span><strong>{money(value)} <span>after {years} {years === 1 ? "year" : "years"}</span></strong></div>
    <p className={styles.experimentExplanation}>Compounding means earning growth on earlier growth. Here, you leave the money in and it grows by 5% each year.</p>
    <details className={styles.experimentDetails}><summary>How this example works <span aria-hidden="true">+</span></summary><p>{money(START)} × 1.05<sup>{years}</sup> = {money(value)}. The rate stays at 5%, with annual compounding and no deposits, withdrawals, fees or tax. Real investment returns vary and can be negative.</p></details>
  </section>;
}
