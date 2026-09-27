"use client";

import { useState } from "react";
import { readInput, valuationResult, type ValuationCase } from "@/lib/studio-project/valuation-cases";
import { SENSITIVITY_STEPS, valuationSensitivity, type SensitivityRates } from "@/lib/studio-project/valuation-sensitivity";
import styles from "./quant-workspace.module.css";
import design from "./valuation-workspace.module.css";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const rate = (value: string) => `${readInput(value).toLocaleString("en-US", { maximumSignificantDigits: 7 })}%`;

export default function ValuationSensitivity({ record, onSave, onReview }: {
  record: ValuationCase; onSave: (rates: SensitivityRates) => void; onReview: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState([1, 1]);
  const grid = valuationSensitivity(record, step);
  const base = valuationResult(record);
  if (!grid || !base.ok) return <div className={design.sensitivityEmpty}><p>Complete a valid starting case to test nearby assumptions.</p>{!base.ok && <p>{base.reason}</p>}<button className={styles.button} onClick={onReview}>Review inputs</button></div>;
  const cell = grid[selected[0]][selected[1]];
  const isCurrent = selected[0] === 1 && selected[1] === 1;
  return <>
    <div className={design.sensitivityControls}>
      <p>Test growth and cost of capital. Company figures and the {rate(record.inputs.returnOnCapital)} return on new capital stay fixed.</p>
      <label>Change by<select value={step} onChange={(event) => { setStep(Number(event.target.value)); setSelected([1, 1]); }}>{SENSITIVITY_STEPS.map((value) => <option key={value} value={value}>{value} percentage {value === 1 ? "point" : "points"}</option>)}</select></label>
    </div>
    <p className={design.sensitivityHelp}>One percentage point changes 10% to 9% or 11%. Select a value to preview it.</p>
    <div className={design.sensitivityLayout}>
      <table className={design.sensitivityTable}>
        <caption>Value per traded share · cost of capital across</caption>
        <thead><tr><th scope="col">Growth ↓</th>{grid[0].map(({ rates }, col) => <th scope="col" key={col}>{rate(rates.costOfCapital)}</th>)}</tr></thead>
        <tbody>{grid.map((row, rowIndex) => <tr key={rowIndex}><th scope="row">{rate(row[0].rates.growth)}</th>{row.map(({ rates, result }, colIndex) => <td key={colIndex}><button type="button" aria-pressed={selected[0] === rowIndex && selected[1] === colIndex} aria-label={`${rate(rates.growth)} growth, ${rate(rates.costOfCapital)} cost of capital: ${result.ok ? money(result.value) : "outside model"}${rowIndex === 1 && colIndex === 1 ? ", current case" : ""}`} onClick={() => setSelected([rowIndex, colIndex])} data-valid={result.ok}>
          <strong>{result.ok ? money(result.value) : "—"}</strong><span>{rowIndex === 1 && colIndex === 1 ? "Current" : result.ok ? "Preview" : "Outside model"}</span>
        </button></td>)}</tr>)}</tbody>
      </table>
      <section className={design.sensitivityPreview} aria-label="Selected assumption preview" aria-live="polite">
        <span>{isCurrent ? "Current case" : "Preview only"}</span>
        <p>{rate(cell.rates.growth)} growth · {rate(cell.rates.costOfCapital)} cost of capital</p>
        {cell.result.ok ? <><strong>{money(cell.result.value)}</strong><p>{isCurrent ? "Your saved assumptions are at the center." : `${money(Math.abs(cell.result.value - base.value))} ${cell.result.value >= base.value ? "above" : "below"} the current estimate of ${money(base.value)}.`}</p></> : <p className={design.sensitivityRefusal}>{cell.result.reason}</p>}
        <div className={design.sensitivitySave}>
          <button className={`${styles.button} ${styles.primary}`} disabled={isCurrent || !cell.result.ok} onClick={() => onSave(cell.rates)}>Save as new scenario</button>
          <small>Your current scenario stays unchanged.</small>
        </div>
      </section>
    </div>
    <p className={design.sensitivityHelp}>This is sensitivity analysis: changing assumptions to see their effect. The cells are model estimates, with no probabilities assigned.</p>
  </>;
}
