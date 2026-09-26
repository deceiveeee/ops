"use client";

import { useState } from "react";
import { readInput, valuationResult, type ValuationCase, type ValuationInput } from "@/lib/studio-project/valuation-cases";
import styles from "./quant-workspace.module.css";
import design from "./valuation-workspace.module.css";

const PAGE_SIZE = 3;
const money = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const rate = (value: string) => {
  const parsed = readInput(value);
  return Number.isFinite(parsed) ? `${parsed.toLocaleString("en-US", { maximumSignificantDigits: 7 })}%` : "—";
};
const sameNumber = (a: string, b: string) => Number.isFinite(readInput(a)) && Number.isFinite(readInput(b)) ? readInput(a) === readInput(b) : a.trim() === b.trim();
const ticker = (record: ValuationCase) => record.ticker.trim().toUpperCase();
const validRatio = (ratio: number) => Number.isFinite(ratio) && ratio > 0;
const ratioText = (record: ValuationCase) => readInput(record.inputs.receipt).toLocaleString("en-US", { maximumSignificantDigits: 12 });
const sameShareBasis = (a: ValuationCase, b: ValuationCase) => {
  const first = readInput(a.inputs.receipt);
  const second = readInput(b.inputs.receipt);
  return validRatio(first) && validRatio(second) && first === second && ticker(a) === ticker(b);
};

/** Compare saved possibilities using exactly the calculation used by the editor. */
export default function ValuationComparison({ current, cases, onOpen, onCopy }: {
  current: ValuationCase; cases: ValuationCase[]; onOpen: (id: string) => void; onCopy: () => void;
}) {
  const [requestedPage, setPage] = useState(0);
  const page = Math.min(requestedPage, Math.max(0, Math.ceil(cases.length / PAGE_SIZE) - 1));
  const rows = cases.map((record) => ({ record, result: valuationResult(record), comparable: sameShareBasis(record, current) }));
  // A price per receipt cannot share a range or scale with a price per ordinary
  // share. CIK alone also does not establish equal rights across share classes.
  const values = rows.flatMap(({ result, comparable }) => result.ok && comparable ? [result.value] : []);
  const minimum = values.length ? Math.min(...values) : null;
  const maximum = values.length ? Math.max(...values) : null;
  const otherBasis = rows.filter(({ result, comparable }) => result.ok && !comparable).length;
  const unavailable = rows.filter(({ result }) => !result.ok).length;
  const currentRatioValid = validRatio(readInput(current.inputs.receipt));
  const start = page * PAGE_SIZE;
  return <>
    <div className={design.compareSummary} aria-label="Summary of saved estimates">
      <div><span>{values.length > 1 ? "Values on the current share basis" : values.length === 1 ? "One estimate on this share basis" : "No comparable estimate yet"}</span>
        <strong>{minimum === null || maximum === null ? "No estimate yet" : values.length > 1 && minimum !== maximum ? `${money(minimum)} – ${money(maximum)}` : money(minimum)}</strong>
        <p>{values.length} comparable · {otherBasis} other basis · {unavailable} {unavailable === 1 ? "needs" : "need"} inputs</p>
      </div>
      <p>{!currentRatioValid ? "Confirm the current share ratio in Figures to compare estimates." : values.length < 2 && !otherBasis ? "Copy a scenario and change an assumption to compare another possibility." : `${ticker(current) || "Current ticker"} · ${ratioText(current)}:1 company shares per traded share. ${otherBasis ? "Other bases stay separate. " : ""}No probabilities assigned.`}</p>
    </div>
    <table className={design.comparisonTable}>
      <caption className={design.srOnly}>Saved scenarios for {current.company}. Differences are measured against {current.name || "the current scenario"}.</caption>
      <thead><tr><th scope="col">Scenario</th><th scope="col">Growth</th><th scope="col">Return on new capital</th><th scope="col">Cost of capital</th><th scope="col">Value / share</th></tr></thead>
      <tbody>{rows.slice(start, start + PAGE_SIZE).map(({ record, result, comparable }) => {
        const different = (["nopat", "debt", "cash", "shares"] as ValuationInput[]).some((key) => !sameNumber(record.inputs[key], current.inputs[key]));
        const shareBasis = !comparable;
        const sourcePeriod = (record.source?.periodEnd ?? null) !== (current.source?.periodEnd ?? null);
        return <tr key={record.id} aria-current={record.id === current.id ? "true" : undefined}>
          <th scope="row" className={design.scenarioCell}>
            <button type="button" onClick={() => onOpen(record.id)} aria-label={`Open scenario ${record.name || "Unnamed case"}`}>{record.name || "Unnamed case"}<span aria-hidden="true">↗</span></button>
            {record.id === current.id ? <small>Current scenario</small> : <small>{[different && "Financial figures differ", shareBasis && "Traded-share basis differs", sourcePeriod && "Report dates differ"].filter(Boolean).join(" · ") || "Same financial figures"}</small>}
          </th>
          {(["growth", "returnOnCapital", "costOfCapital"] as const).map((key, index) => <td key={key} className={design.rateCell}><span>{["Growth", "Return on new capital", "Cost of capital"][index]}</span>{rate(record.inputs[key])}</td>)}
          <td className={design.estimateCell}>{result.ok ? <><strong>{money(result.value)}</strong>{comparable ? <span className={design.estimateTrack} aria-hidden="true"><i style={{ width: `${maximum ? result.value / maximum * 100 : 0}%` }} /></span> : <span>Other basis: {ticker(record) || "No ticker"} · {ratioText(record)}:1</span>}</> : <span>Needs inputs</span>}</td>
        </tr>;
      })}</tbody>
    </table>
    <div className={design.compareFooter}>
      <p>Differences are compared with <strong>{current.name || "the current scenario"}</strong>. Open a scenario to see its figures, source and reasoning.</p>
      <div className={design.compareActions}>
        <button className={`${styles.button} ${design.compareButton}`} onClick={() => onCopy()}>Copy scenario</button>
        {cases.length > PAGE_SIZE && <nav aria-label="Scenario pages"><button className={`${styles.button} ${design.compareButton}`} disabled={!page} onClick={() => setPage(page - 1)}>Previous<span className={design.pagerWord}> cases</span></button><span>{start + 1}–{Math.min(start + PAGE_SIZE, cases.length)} of {cases.length}</span><button className={`${styles.button} ${design.compareButton}`} disabled={start + PAGE_SIZE >= cases.length} onClick={() => setPage(page + 1)}>Next<span className={design.pagerWord}> cases</span></button></nav>}
      </div>
    </div>
  </>;
}
