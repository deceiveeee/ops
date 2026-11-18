import Link from "next/link";
import type { LearningPath } from "@/lib/next-step";
import type { FirstSteps } from "@/lib/onboarding/types";
import FedRateChart from "./FedRateChart";
import HomeContents from "./HomeContents";
import HomeGreeting, { HomeNextLine } from "./HomeGreeting";
import HomePuzzle, { type HomePuzzleData } from "./HomePuzzle";
import styles from "./homepage.module.css";

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 19 19 5M7 5h12v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The homepage: a real annual report to work on, one real market figure, a
 * contents list and one closing line. Each part has its own shape, and every
 * number on it is either verified source data or labelled as an example.
 *
 * The look is the earlier homepage's (warm paper, indigo, a pale rounded panel
 * for each part a visitor works in, pill links), put back because the page
 * read as plain without it. The content and its order did not change.
 *
 * Design rules: docs/design/anti-template-restructure-plan-2026-11-04.md.
 */
export default function HomePage({ puzzle, path, steps }: { puzzle: HomePuzzleData | null; path: LearningPath; steps: FirstSteps }) {
  return (
    <div className={styles.home}>
      <section className={`${styles.hero} ${puzzle ? "" : styles.heroSolo}`} aria-labelledby="home-title">
        <div className={styles.heroCopy}>
          <HomeGreeting path={path} steps={steps} />
          <h1 id="home-title" className={styles.title}>Learn investing, then practice on <span className={styles.accent}>real company reports.</span></h1>
          <p className={styles.lead}>Interactive lessons, a daily company puzzle and a workspace for building your own portfolio.</p>
          <div className={styles.actions}>
            <Link href="/start" className={styles.pill}>Find where to start <Arrow /></Link>
            <Link href="/courses" className={styles.pillOutline}>See both courses <Arrow /></Link>
          </div>
          <HomeNextLine path={path} steps={steps} />
        </div>
        {puzzle ? <HomePuzzle {...puzzle} /> : null}
      </section>

      <section className={styles.rates} aria-labelledby="rates-title">
        <div className={styles.ratesCanvas}>
          <p className={styles.tag}>Real data</p>
          <h2 id="rates-title" className={styles.sectionTitle}>Banks’ overnight borrowing rate rose from 0.08% to 5.33% in 19 months</h2>
          <div className={styles.ratesBody}>
            <FedRateChart overview />
            <aside className={styles.margin} aria-label="About this rate">
              <div>
                <h3>What it measures</h3>
                <p>Overnight borrowing between banks. Changes can influence other borrowing rates.</p>
              </div>
              <div>
                <h3>Where to learn it</h3>
                <p>
                  <Link href="/courses/finance-foundations#module-3">Fixed-income securities</Link>, module 3 of Finance Foundations, shows how a bond is priced from interest rates.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <HomeContents />

      <section className={styles.closing} aria-labelledby="closing-title">
        <h2 id="closing-title" className={styles.closingTitle}>Not sure which course fits?</h2>
        <p>Answer two questions to find out.</p>
        <Link href="/start" className={styles.pill}>Find where to start <Arrow /></Link>
      </section>
    </div>
  );
}
