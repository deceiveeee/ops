"use client";

import { useId, useState } from "react";

const PAYMENT = 1000;
const YEARS = 5;
const BASE_RATE = 4;
/** Both strings stay in the layout, so the block cannot change height when the rate changes. */
const EXPLANATIONS = [
  "Try a higher rate. The payment and its date stay the same; only the return used to value it changes.",
  "A higher required return means a lower value today for the same future payment. You would pay less now to receive the same $1,000 in five years.",
];
const money = (value: number) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 2,
}).format(value);

/** An isolated teaching example: no market inputs, portfolio writes or progress events. */
export default function CashFlowDemo() {
  const [rate, setRate] = useState(BASE_RATE);
  const id = useId();
  const presentValue = PAYMENT / (1 + rate / 100) ** YEARS;
  const referenceValue = PAYMENT / (1 + BASE_RATE / 100) ** YEARS;
  const difference = presentValue - referenceValue;

  return (
    <section className="cash-demo" aria-labelledby={`${id}-title`}>
      <div className="cash-demo-intro">
        <span className="refresh-kicker">Try a financial idea</span>
        <h2 id={`${id}-title`}>What is a future payment worth today?</h2>
        <p>Present value is what a future payment is worth today. The discount rate is the annual return used to translate that payment into today’s dollars.</p>
      </div>

      <div className="cash-demo-result" role="status" aria-live="polite" aria-atomic="true">
        <span>Value today at {rate}%</span>
        <strong className="tabular-nums">{money(presentValue)}</strong>
        <span>{difference === 0 ? "$1,000 received in five years" : `${money(Math.abs(difference))} less than at 4%`}</span>
      </div>

      <div className="cash-demo-chart" aria-label="Payment and present value, on the same dollar scale">
        <div className="cash-demo-row">
          <div><span>Payment in five years</span><span className="tabular-nums">$1,000.00</span></div>
          <div className="cash-demo-track"><div className="cash-demo-payment" style={{ width: "100%" }} /></div>
        </div>
        <div className="cash-demo-row">
          <div><span>Value today at {rate}%</span><span className="tabular-nums">{money(presentValue)}</span></div>
          <div className="cash-demo-track">
            <div className="cash-demo-current" style={{ transform: `scaleX(${presentValue / PAYMENT})` }} />
            {/* Absolutely placed, so showing or hiding it cannot move the layout. */}
            <div className="cash-demo-mark" data-shown={rate !== BASE_RATE} style={{ left: `${referenceValue / PAYMENT * 100}%` }} aria-hidden="true" />
          </div>
        </div>
        <div className="cash-demo-axis" aria-hidden="true"><span>$0</span><span>$500</span><span>$1,000</span></div>
        <p className="cash-demo-legend" data-shown={rate !== BASE_RATE}>The marker shows the value at {BASE_RATE}%, {money(referenceValue)}.</p>
      </div>

      <fieldset className="cash-demo-controls">
        <legend>Compare annual discount rates</legend>
        <div>
          {[4, 6, 8].map((choice) => (
            <button key={choice} type="button" aria-pressed={rate === choice} onClick={() => setRate(choice)}>{choice}%</button>
          ))}
        </div>
      </fieldset>
      <p className="cash-demo-explanation">
        {EXPLANATIONS.map((text) => (
          <span key={text} data-shown={text === EXPLANATIONS[rate === BASE_RATE ? 0 : 1]}>{text}</span>
        ))}
      </p>
      <details className="cash-demo-math">
        <summary>See the calculation</summary>
        <p>Value today = $1,000 ÷ (1 + {rate / 100})⁵ = {money(presentValue)}.</p>
        <p>This example uses annual compounding and one payment, with no intermediate cash flows.</p>
      </details>
      <p className="cash-demo-caption">Illustrative example · USD · Not a market quote</p>
    </section>
  );
}
