"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import CashFlowDemo from "./CashFlowDemo";

const report = "https://www.sec.gov/Archives/edgar/data/1666138/000162828025054049/atkr-20250930.htm";
const observations = [
  { label: "Net sales", previous: "3,202.1", latest: "2,850.4", question: "What changed in sales?", note: "Compare the company’s discussion of prices, sales volumes and its businesses before choosing an explanation." },
  { label: "Operating income", previous: "624.8", latest: "23.2", question: "Why did profit change so much?", note: "The 2025 statement includes $214.4 million of impairment charges. Read that context before treating the change as a recurring result." },
];

export default function HomePage() {
  const [selected, setSelected] = useState(0);
  const observation = observations[selected];
  return (
    <div className="refresh-home">
      <section className="refresh-hero refresh-container">
        <div className="refresh-hero-copy">
          <p className="refresh-kicker">Finance, understood through practice</p>
          <h1>Learn investing.<br />Build a portfolio<br /><em>you can explain.</em></h1>
          <p className="refresh-lead">Explore how money, businesses and markets work. Put your reasoning into practice with finance courses and portfolio tools.</p>
          <div className="refresh-actions"><Button href="/studio" size="lg">Open Studio <span aria-hidden="true">↗</span></Button><Button href="/courses" variant="outline" size="lg">Explore courses</Button></div>
          <p className="refresh-small">Free to explore. No account or course completion required.</p>
          <Link href="/start" className="refresh-text-link">Find your starting point <span aria-hidden="true">→</span></Link>
        </div>
        <CashFlowDemo />
      </section>

      <section className="refresh-evidence-section">
        <div className="refresh-container refresh-evidence-layout">
          <div>
            <p className="refresh-kicker">From a number to a better question</p>
            <h2>Read the business<br /><em>behind the numbers.</em></h2>
            <p className="refresh-lead">A company’s annual report connects its financial results to how it operates. Select a line from this historical example to see where an investigation could begin.</p>
            <Link href="/filings" className="refresh-text-link">Explore company reports <span aria-hidden="true">→</span></Link>
          </div>
          <article className="refresh-report" aria-label="Atkore historical financial results">
            <div className="refresh-report-heading"><strong>Atkore</strong><span>2025 annual report · Form 10-K</span></div>
            <p className="refresh-small">Selected reported figures · USD millions, rounded</p>
            <table>
              <caption className="sr-only">Select a financial statement line for a research question</caption>
              <thead><tr><th scope="col">Statement line</th><th scope="col">2024</th><th scope="col">2025</th></tr></thead>
              <tbody>{observations.map((row, index) => <tr key={row.label} data-selected={selected === index}>
                <th scope="row"><button type="button" onClick={() => setSelected(index)} aria-pressed={selected === index}>{row.label}<span aria-hidden="true">{" ↗"}</span></button></th>
                <td>{row.previous}</td><td>{row.latest}</td>
              </tr>)}</tbody>
            </table>
            <div className="refresh-report-note">
              <div className="refresh-report-note-sizer" aria-hidden="true">{observations.map((row) => <div key={row.label}><strong>{row.question}</strong><p>{row.note}</p></div>)}</div>
              <div role="status" aria-live="polite"><strong>{observation.question}</strong><p>{observation.note}</p></div>
            </div>
            <a href={report} target="_blank" rel="noreferrer" className="refresh-text-link">Read the original SEC report <span aria-hidden="true">↗</span></a>
            <p className="refresh-small">Historical case for learning. Not an investment recommendation.</p>
          </article>
        </div>
      </section>

      <section className="refresh-container refresh-paths">
        <div className="refresh-section-heading"><div><p className="refresh-kicker">Choose your next step</p><h2>Learn the ideas.<br /><em>Put them to work.</em></h2></div><p>Start with a course, or bring your own question to Studio. Your next step depends on what you want to do.</p></div>
        <div className="refresh-path-grid">
          <Link href="/courses/finance-foundations" className="refresh-path"><span className="refresh-kicker">Understand</span><h3>Finance Foundations <span aria-hidden="true">↗</span></h3><p>Explore value, cash flows, risk and how markets work through guided financial interactions.</p></Link>
          <Link href="/courses/investment-foundations" className="refresh-path"><span className="refresh-kicker">Develop your approach</span><h3>Investment Foundations <span aria-hidden="true">↗</span></h3><p>Work through investment decisions, from your goals and philosophy to a portfolio and review rules.</p></Link>
          <Link href="/studio" className="refresh-path"><span className="refresh-kicker">Apply</span><h3>Portfolio Studio <span aria-hidden="true">↗</span></h3><p>Set a goal, compare investments, choose allocations and explore what could happen to your plan.</p></Link>
        </div>
      </section>
    </div>
  );
}
