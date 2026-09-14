"use client";

import { useId, useState } from "react";
import { federalFundsHistory, federalFundsSource } from "@/data/marketing/teachingVisuals";

const milestones = [
  { index: 0, label: "Jan 2022", note: "The monthly average was close to zero at the start of 2022." },
  { index: 19, label: "Aug 2023", note: "The rate reached 5.33%. It stayed at that monthly average through August 2024." },
  { index: 35, label: "Dec 2024", note: "The rate had eased to 4.48%, still above its January 2022 level." },
];
const x = (index: number) => 30 + index / 35 * 330;
const y = (rate: number) => 132 - rate / 6 * 116;
const points = federalFundsHistory.map(([, rate], index) => `${x(index)},${y(rate)}`).join(" ");

/** A dated educational snapshot, never a live quote or a valuation discount-rate input. */
export default function FedRateChart({ compact = false, embeddedInLink = false, overview = false }: { compact?: boolean; embeddedInLink?: boolean; overview?: boolean }) {
  const id = useId();
  const [selected, setSelected] = useState(1);
  const milestone = milestones[selected];
  const rate = federalFundsHistory[milestone.index][1];
  const staticView = compact || overview;
  return (
    <figure className={`teaching-visual rate-history ${compact ? "teaching-visual-compact" : ""} ${overview ? "rate-history-overview" : ""}`} aria-labelledby={`${id}-title`}>
      <figcaption>
        <span className="teaching-visual-kicker">Real-world example · 2022–2024</span>
        <strong id={`${id}-title`}>{overview ? "Banks’ overnight borrowing rate" : "Interest rates can change quickly."}</strong>
        <span className="teaching-visual-unit">{overview ? "Monthly average · % per year" : "Effective federal funds rate · monthly average · % per year"}</span>
      </figcaption>
      <div className="rate-history-graphic">
      <svg className="rate-history-plot" viewBox="0 0 390 162" preserveAspectRatio="none" role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}>
        <title id={`${id}-chart-title`}>U.S. effective federal funds rate, January 2022 to December 2024</title>
        <desc id={`${id}-chart-desc`}>Monthly average rates rise from 0.08% in January 2022 to 5.33% in August 2023, remain there through August 2024, then ease to 4.48% in December 2024. The vertical scale starts at zero and ends at six percent.</desc>
        {[0, 3, 6].map(tick => <g key={tick}>
          <line x1="30" x2="360" y1={y(tick)} y2={y(tick)} className="teaching-gridline" />
        </g>)}
        <polygon points={`30,132 ${points} 360,132`} className="rate-history-area" />
        <polyline points={points} className="rate-history-line" />
        {!staticView && <line x1={x(milestone.index)} x2={x(milestone.index)} y1="16" y2="132" className="rate-history-marker" />}
        {(staticView ? milestones : [milestone]).map(point => <circle key={point.index} cx={x(point.index)} cy={y(federalFundsHistory[point.index][1])} r="4.5" className="rate-history-point" />)}
      </svg>
      <div className="rate-history-y" aria-hidden="true"><span>6%</span><span>3%</span><span>0%</span></div>
      <div className="rate-history-x" aria-hidden="true"><span>2022</span><span>2023</span><span>Dec 2024</span></div>
      </div>
      {overview ? (
        <>
          <dl className="rate-history-milestones">
            {milestones.map(point => <div key={point.index}>
              <dt>{point.label}</dt>
              <dd>{federalFundsHistory[point.index][1].toFixed(2)}%</dd>
            </div>)}
          </dl>
          <p className="teaching-visual-explanation">Higher interest rates generally make borrowing more expensive, which can slow spending and investment.</p>
        </>
      ) : compact ? (
        <div className="rate-history-summary">0.08% in Jan 2022 → 5.33% in Aug 2023</div>
      ) : (
        <>
          <div className="rate-history-controls" aria-label="Choose a historical observation">
            {milestones.map((point, index) => <button key={point.index} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{point.label}</button>)}
          </div>
          <div className="rate-history-observation" role="status" aria-live="polite" aria-atomic="true">
            <strong>{rate.toFixed(2)}%</strong><p>{milestone.note}</p>
          </div>
          <p className="teaching-visual-explanation">This measures overnight borrowing between banks. Changes can influence other borrowing rates. A valuation discount rate also depends on the cash flow’s timing and risk.</p>
          <details className="teaching-visual-data">
            <summary>Read the monthly values</summary>
            <table>
              <caption>Effective federal funds rate, percent per year</caption>
              <thead><tr><th scope="col">Month</th><th scope="col">Rate</th></tr></thead>
              <tbody>{federalFundsHistory.map(([date, value]) => <tr key={date}><th scope="row">{date}</th><td>{value.toFixed(2)}%</td></tr>)}</tbody>
            </table>
          </details>
        </>
      )}
      <div className="teaching-visual-source">
        <p>Source: {embeddedInLink ? <span>Federal Reserve Board, H.15.</span> : <a href={federalFundsSource} target="_blank" rel="noreferrer">Federal Reserve Board, H.15 ↗</a>} Historical data.</p>
        {overview && <a className="rate-history-learn-more" href="https://www.federalreserve.gov/monetarypolicy/monetary-policy-what-are-its-goals-how-does-it-work.htm" target="_blank" rel="noreferrer">Explore why <span aria-hidden="true">↗</span></a>}
      </div>
    </figure>
  );
}
