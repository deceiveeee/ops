"use client";

import { useState } from "react";
import Link from "next/link";
import FedRateChart from "./FedRateChart";
import MoneyTimeExperiment from "./MoneyTimeExperiment";
import styles from "./homepage.module.css";

const report = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm";
const observations = [
  { label: "Net sales", previous: "3,202.1", latest: "2,850.4", question: "What changed in sales?", note: "Compare the company’s discussion of prices, sales volumes and its businesses before choosing an explanation." },
  { label: "Operating income", previous: "624.8", latest: "23.2", question: "Why did profit change so much?", note: "The 2025 statement includes $214.4 million of impairment charges. Read that context before treating the change as a recurring result." },
];

function Arrow({ down = false }: { down?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={down ? "M12 4v16m-6-6 6 6 6-6" : "M5 19 19 5M5 5h14v14"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CourseArtwork({ kind }: { kind: "finance" | "investing" }) {
  return <div className={`${styles.courseArt} ${kind === "finance" ? styles.financeArt : styles.investingArt}`} aria-hidden="true">
    {kind === "finance" ? <>
      <div className={styles.artOrbit} /><div className={styles.artCoin}><span>$</span></div><div className={styles.artChip}>Time × money</div>
      <svg className={styles.artCurve} viewBox="0 0 400 180" fill="none"><path d="M20 160C140 160 270 110 365 20" stroke="currentColor" strokeWidth="3" /><path d="m342 23 24-4-1 25" stroke="currentColor" strokeWidth="3" /></svg>
    </> : <><div className={styles.allocationRing} /><div className={styles.allocationCenter}>Your<br />thinking.</div><span className={styles.artChip}>The bigger picture</span><span className={styles.orbitDot} /></>}
  </div>;
}

export default function HomePage() {
  const [selected, setSelected] = useState(0);
  const observation = observations[selected];
  return (
    <div className={`refresh-home ${styles.home}`}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span className={styles.dot} /> A head start on the real world</p>
          <h1 id="home-title">Your money.<br /><em>Your move.</em></h1>
          <p className={styles.heroLead}>See how money works. Try the ideas.<br className={styles.desktopBreak} /> Build a portfolio you can explain.</p>
          <div className={styles.actions}>
            <Link href="/courses" className={styles.primaryLink}>Explore courses <Arrow /></Link>
            <Link href="/studio" className={styles.secondaryLink}>Open Studio <Arrow /></Link>
          </div>
          <p className={styles.freeNote}>Free to explore. No account needed.</p>
        </div>
        <MoneyTimeExperiment />
        <a href="#explore-money" className={styles.scrollLink}>There’s more beneath the numbers <Arrow down /></a>
      </section>
      <div className={styles.principles} aria-label="How you learn"><p><span>01</span> Try an idea.</p><p><span>02</span> Follow the evidence.</p><p><span>03</span> Make it yours.</p></div>

      <section id="explore-money" className={styles.marketSection} aria-labelledby="market-title">
        <div className={styles.chapterHeading}>
          <p className={styles.eyebrow}><span className={styles.chapterNumber}>01</span> Make the connection</p>
          <div><h2 id="market-title">Small numbers.<br /><em>Big ripple effects.</em></h2><p>Interest rates show up in the news.<br className={styles.desktopBreak} /> And in the cost of a car, a home, or an idea.</p></div>
        </div>
        <div className={styles.marketCanvas}>
          <div className={styles.marketIntro}>
            <span className={styles.dataTag}>Real data. Real consequences.</span>
            <h3>The price of <br />borrowing money <br /><span>can change.</span></h3>
            <p>Start with one connection: higher borrowing costs can change what people and businesses spend.</p>
            <Link href="/courses/finance-foundations" className={styles.textLink}>Understand the forces <Arrow /></Link>
            <div className={styles.ripple} aria-hidden="true"><i /><i /><i /><span>%</span></div>
          </div>
          <FedRateChart overview />
          <div className={styles.causeChain} aria-label="How a rate change can spread"><span>Bank borrowing</span><Arrow /><span>Loan costs</span><Arrow /><span>Spending decisions</span></div>
        </div>
      </section>

      <section className={styles.evidenceSection} aria-labelledby="evidence-title">
        <div className={styles.evidenceCopy}>
          <p className={styles.eyebrow}><span className={styles.chapterNumber}>02</span> Follow the evidence</p>
          <h2 id="evidence-title">Every number <br />has a <em>backstory.</em></h2>
          <p>A company is more than its share price. Open its annual report and find out what’s happening underneath.</p>
          <div className={styles.evidencePrompt}><span aria-hidden="true">↳</span><p>Try it. Select a statement line.<br /><strong>See the question behind the number.</strong></p></div>
          <Link href="/studio/filings" className={styles.lightLink}>Explore company reports <Arrow /></Link>
          <div className={styles.documentMotif} aria-hidden="true"><span>Read.</span><span>Question.</span><span>Connect.</span></div>
        </div>
        <article className={`refresh-report ${styles.report}`} aria-label="Atkore historical financial results">
          <div className={styles.reportTopline}><span className={styles.reportIcon} aria-hidden="true">↗</span><span>Inside an annual report</span><span>{selected === 0 ? "01" : "02"} / 02</span></div>
          <div className="refresh-report-heading"><strong>Atkore</strong><span>2025 annual report · Form 10-K</span></div>
          <p className="refresh-small">Selected reported figures · USD millions, rounded</p>
          <table>
            <caption className="sr-only">Select a financial statement line for a research question</caption>
            <thead><tr><th scope="col">Statement line</th><th scope="col">2024</th><th scope="col">2025</th></tr></thead>
            <tbody>{observations.map((row, index) => <tr key={row.label} data-selected={selected === index}>
              <th scope="row"><button type="button" onClick={() => setSelected(index)} aria-pressed={selected === index}>{row.label}<span aria-hidden="true">{"\u00a0↗"}</span></button></th><td>{row.previous}</td><td>{row.latest}</td>
            </tr>)}</tbody>
          </table>
          <div className="refresh-report-note">
            <div className="refresh-report-note-sizer" aria-hidden="true">{observations.map(row => <div key={row.label}><strong>{row.question}</strong><p>{row.note}</p></div>)}</div>
            <div role="status" aria-live="polite"><strong>{observation.question}</strong><p>{observation.note}</p></div>
          </div>
          <a href={report} target="_blank" rel="noreferrer" className="refresh-text-link">Read the original SEC report <span aria-hidden="true">↗</span></a>
        </article>
      </section>

      <section className={styles.pathsSection} aria-labelledby="paths-title">
        <div className={styles.chapterHeading}>
          <p className={styles.eyebrow}><span className={styles.chapterNumber}>03</span> Make it yours</p>
          <div><h2 id="paths-title">A curious mind.<br /><em>A place to start.</em></h2><p>Learn the fundamentals, develop your thinking,<br className={styles.desktopBreak} /> then put it into practice.</p></div>
        </div>
        <div className={styles.courseGrid}>
          <Link href="/courses/finance-foundations" className={styles.courseLink}>
            <CourseArtwork kind="finance" /><div className={styles.courseCopy}><span className={styles.courseKicker}>Start with the why</span><h3>Finance Foundations <span className={styles.circleArrow}><Arrow /></span></h3><p>How money, value and risk connect.<br />Make the ideas click through practice.</p></div>
          </Link>
          <Link href="/courses/investment-foundations" className={styles.courseLink}>
            <CourseArtwork kind="investing" /><div className={styles.courseCopy}><span className={styles.courseKicker}>Build your approach</span><h3>Investment Foundations <span className={styles.circleArrow}><Arrow /></span></h3><p>From your first question to a reasoned decision.<br />Develop a way of thinking that’s yours.</p></div>
          </Link>
        </div>
        <div className={styles.studioStrip}>
          <div className={styles.studioSymbol} aria-hidden="true"><span /><span /><span /><span /></div>
          <div><span className={styles.courseKicker}>Put your thinking to work</span><h3>Your own investing workspace.</h3><p>Research a business. Build a portfolio. Test your assumptions.</p></div>
          <Link href="/studio" className={styles.primaryLink}>Open Studio <Arrow /></Link>
        </div>
      </section>
      <section className={styles.closing} aria-labelledby="closing-title">
        <p className={styles.eyebrow}>You don’t need all the answers to begin.</p><h2 id="closing-title">Just a little <em>curiosity.</em></h2>
        <Link href="/start" className={styles.primaryLink}>Find your starting point <Arrow /></Link><p className={styles.freeNote}>Your pace. Your questions. Your next move.</p><span className={styles.closingStar} aria-hidden="true">✳</span>
      </section>
    </div>
  );
}
