"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { estimate, forIndustry, industryNames } from "@/lib/studio-project/cost-of-capital";
import { isValued } from "@/lib/studio-project/valuation";
import { readInput, saveValuation, VALUATION_LABELS, valuationResult, type ValuationCase, type ValuationInput } from "@/lib/studio-project/valuation-cases";
import { useWorkspace } from "./WorkspaceProvider";
import ViewTabs from "./ViewTabs";
import ValuationComparison from "./ValuationComparison";
import ValuationSensitivity from "./ValuationSensitivity";
import type { SensitivityRates } from "@/lib/studio-project/valuation-sensitivity";
import styles from "./quant-workspace.module.css";
import design from "./valuation-workspace.module.css";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const millions = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}m`;
const FIGURES = ["nopat", "debt", "cash", "shares", "receipt"] as const;
const ASSUMPTIONS = ["growth", "returnOnCapital", "costOfCapital"] as const;
const VIEWS = [{ id: "Figures", label: "Figures" }, { id: "Assumptions", label: "Assumptions" }, { id: "Value", label: "Value and price" }] as const;
type View = typeof VIEWS[number]["id"] | "Compare" | "Sources" | "Sensitivity";
type Result = ReturnType<typeof valuationResult>;

export default function ValuationEditor({ record, alternatives, disabled, focusOnOpen, onSelect, onCopy, onChooseCompany }: {
  record: ValuationCase; alternatives: ValuationCase[]; disabled: boolean;
  focusOnOpen?: boolean;
  onSelect: (id: string) => void; onCopy: (rates?: SensitivityRates) => void; onChooseCompany: () => void;
}) {
  const { session, report } = useWorkspace();
  const reasoningId = useId();
  const [draft, setDraft] = useState(record);
  const latest = useRef(record);
  const [view, setView] = useState<View>(FIGURES.some((key) => !record.inputs[key].trim()) ? "Figures" : "Assumptions");
  const [sourceView, setSourceView] = useState("figures");
  const [calculation, setCalculation] = useState(false);
  const [focusKey, setFocusKey] = useState<ValuationInput | null>(null);
  const [focusHeading, setFocusHeading] = useState(false);
  const secondaryHeading = useRef<HTMLHeadingElement>(null);
  const inputs = useRef<Partial<Record<ValuationInput, HTMLInputElement | null>>>({});
  const options = useRef<HTMLDetailsElement>(null);
  const savedSelect = useRef<HTMLSelectElement>(null);
  useEffect(() => { if (focusOnOpen) savedSelect.current?.focus(); }, [focusOnOpen]);
  useEffect(() => {
    if (!session.pending && !session.dirty && session.status === "ready") { latest.current = record; setDraft(record); }
  }, [record, session.pending, session.dirty, session.status]);
  useEffect(() => { if (focusKey && inputs.current[focusKey]) { inputs.current[focusKey]?.focus(); setFocusKey(null); } }, [view, focusKey]);
  useEffect(() => { if (focusHeading) { secondaryHeading.current?.focus(); setFocusHeading(false); } }, [view, focusHeading]);
  useEffect(() => { setCalculation(false); }, [view]);
  const showSecondary = (next: "Sources" | "Compare" | "Sensitivity") => { setView(next); setFocusHeading(true); };
  const change = (patch: Partial<ValuationCase>) => {
    const next = { ...latest.current, ...patch, updatedAt: new Date().toISOString() };
    latest.current = next; setDraft(next);
    void session.update((current) => saveValuation(current, next)).then(report);
  };
  const changeInput = (key: ValuationInput, value: string) => change({ inputs: { ...latest.current.inputs, [key]: value }, ...(key === "costOfCapital" ? { costReference: null } : {}) });
  const field = (key: ValuationInput, help?: string) => <label key={key}>{VALUATION_LABELS[key]}<input ref={(el) => { inputs.current[key] = el; }} aria-label={VALUATION_LABELS[key]} aria-describedby={help ? `${reasoningId}-${key}-help` : undefined} inputMode="decimal" value={draft.inputs[key]} maxLength={100} onChange={(e) => changeInput(key, e.target.value)} />{help && <span id={`${reasoningId}-${key}-help`} className={design.fieldHelp}>{help}</span>}</label>;
  const action = (fn: () => void) => { if (options.current) { options.current.open = false; options.current.querySelector("summary")?.focus(); } fn(); };
  const result = valuationResult(draft);
  const missing = [...FIGURES, ...ASSUMPTIONS].find((key) => !draft.inputs[key].trim());
  const goToMissing = () => { const key = inputToReview(draft); setCalculation(false); setView(key === "price" ? "Value" : FIGURES.includes(key as typeof FIGURES[number]) ? "Figures" : "Assumptions"); setFocusKey(key); };
  const sameCompany = alternatives.filter((v) => draft.cik ? v.cik === draft.cik : v.company === draft.company);
  const openScenario = (id: string) => {
    if (id !== draft.id) onSelect(id);
    else { const key = FIGURES.find((key) => !draft.inputs[key].trim()); setView(key ? "Figures" : "Assumptions"); setFocusKey(key ?? "growth"); }
  };
  const mainView = VIEWS.find((v) => v.id === view);
  const wideView = view === "Compare" || view === "Sensitivity";
  return <fieldset disabled={disabled} className={styles.editor}>
    <div className={design.context}>
      <label>Saved scenario<select ref={savedSelect} value={record.id} onChange={(e) => onSelect(e.target.value)}>{alternatives.map((v) => <option key={v.id} value={v.id}>{v.company || "Unnamed company"} · {v.name || "Unnamed case"}</option>)}</select></label>
      <details ref={options} className={design.options} onKeyDown={(event) => { if (event.key === "Escape" && options.current) { options.current.open = false; options.current.querySelector("summary")?.focus(); } }}>
        <summary>Scenario options</summary>
        <div className={design.optionList}>
          <button type="button" onClick={() => action(onCopy)}>Copy scenario</button>
          <button type="button" onClick={() => action(() => showSecondary("Compare"))}>Compare scenarios</button>
          <button type="button" onClick={() => action(() => showSecondary("Sensitivity"))}>Test assumptions</button>
          <button type="button" onClick={() => action(() => showSecondary("Sources"))}>Sources</button>
          <button type="button" onClick={() => action(onChooseCompany)}>Choose company</button>
        </div>
      </details>
    </div>
    <ViewTabs label="Valuation views" idPrefix="valuation" className={design.steps} tabs={VIEWS} selected={mainView?.id ?? null} onSelect={(next) => { setCalculation(false); setView(next); }} />
    <div className={`${design.layout} ${view === "Value" ? design.valueStage : ""} ${wideView ? design.compareLayout : ""} ${calculation ? design.calculationView : ""}`} {...(mainView ? { role: "tabpanel", id: "valuation-panel", "aria-labelledby": `valuation-tab-${view}` } : {})}>
      <section className={`${styles.panel} ${design.work}`} aria-label={`${view} for this valuation`}>
        {view === "Figures" && <>
          <div className={design.stageTitle}><span>Step 1 of 3</span><button onClick={() => showSecondary("Sources")}>View sources ↗</button></div>
          <h2>Check the starting figures</h2>
          <p className={design.intro}>{draft.source ? `From annual figures to ${draft.source.periodEnd}. Check them against the report.` : draft.example ? "OPS example company · invented figures to explore the method." : "Enter figures from the company’s annual report."} Dollar figures and shares are in millions.</p>
          <div className={styles.fields}>{FIGURES.slice(0, 4).map((key) => field(key))}</div>
          <div className={design.receipt}>
            {field("receipt")}
            <button className={styles.button} onClick={() => changeInput("receipt", "1")}>Use 1 for an ordinary share</button>
            <p>An ordinary share represents one company share. A depositary receipt may represent several; check its ratio. Filed share counts may be yearly averages.</p>
          </div>
          <button className={`${styles.button} ${styles.primary} ${design.next}`} onClick={() => setView("Assumptions")}>Continue to assumptions →</button>
        </>}
        {view === "Assumptions" && <>
          <div className={design.stageTitle}><span>Step 2 of 3</span><button onClick={() => showSecondary("Sensitivity")}>Test assumptions ↗</button></div>
          <h2>What can this business sustain?</h2>
          <p className={design.intro}>These three rates continue indefinitely in this model. Growth requires part of the profit to be reinvested.</p>
          <div className={design.assumptions}>
            {field("growth", "How quickly operating profit grows each year.")}
            {field("returnOnCapital", "What each new dollar invested in the business earns.")}
            {field("costOfCapital", "The return required by the business’s lenders and shareholders.")}
          </div>
          {draft.source && <p className={design.startingReturn}>The starting return is calculated from existing capital in the filing. Choose what future investment can earn.</p>}
          <details className={design.reference}>
            <summary>{draft.costReference ? `Industry reference: ${draft.costReference.ratePct.toFixed(2)}%` : "Use an industry cost reference"}</summary>
            <label>Industry cost reference<select value={draft.costReference?.industry ?? ""} onChange={(e) => {
              const found = forIndustry(e.target.value);
              if (!found) { change({ costReference: null }); return; }
              const reference = estimate(found);
              change({ inputs: { ...latest.current.inputs, costOfCapital: String(Number((reference.costOfCapital * 100).toFixed(6))) }, costReference: { industry: found.industry, ratePct: reference.costOfCapital * 100, notes: reference.provenance } });
            }}><option value="">Your own assumption</option>{industryNames().map((name) => <option key={name}>{name}</option>)}</select></label>
            <p>A dated industry estimate from NYU Stern. Choosing one fills the cost of capital. Review its basis in Sources.</p>
          </details>
          <button className={`${styles.button} ${styles.primary} ${design.next}`} onClick={() => setView("Value")}>Continue to value and price →</button>
        </>}
        {view === "Value" && <>
          <div className={design.stageTitle}><span>Step 3 of 3</span><span>Price is your input</span></div>
          <h2>Compare value and price</h2>
          <p className={design.intro}>Use a price from a dated quote. The estimate comes from your assumptions.</p>
          <div className={styles.fields}>{field("price")}<label>Price date<input type="date" value={draft.priceAsOf} onChange={(e) => change({ priceAsOf: e.target.value })} /></label></div>
          {draft.inputs.price && !draft.priceAsOf && <p className={styles.note}>Add the price date to make this comparison traceable.</p>}
          {result.ok && result.reverse !== null && <div className={design.priceQuestion}><span>Growth implied by this price</span><p>{reverseExplanation(draft, result)}</p></div>}
          <div className={`${styles.row} ${design.next}`}><button className={styles.button} onClick={() => setView("Assumptions")}>Edit assumptions</button><button className={styles.button} onClick={() => showSecondary("Compare")}>Compare scenarios</button></div>
        </>}
        {view === "Compare" && <>
          <div className={design.stageTitle}><span>Saved possibilities</span></div><h2 ref={secondaryHeading} tabIndex={-1}>Same company, different assumptions</h2>
          <ValuationComparison current={draft} cases={sameCompany.map((v) => v.id === draft.id ? draft : v)} onOpen={openScenario} onCopy={onCopy} />
        </>}
        {view === "Sensitivity" && <>
          <div className={design.stageTitle}><span>Explore nearby assumptions</span></div><h2 ref={secondaryHeading} tabIndex={-1}>How much does the value change?</h2>
          <ValuationSensitivity key={JSON.stringify(draft.inputs)} record={draft} onSave={onCopy} onReview={goToMissing} />
        </>}
        {view === "Sources" && <>
          <div className={design.stageTitle}><span>Evidence and method</span></div><h2 ref={secondaryHeading} tabIndex={-1}>Where the figures came from</h2>
          <label>Source to inspect<select value={sourceView} onChange={(e) => setSourceView(e.target.value)}><option value="figures">Company figures</option><option value="method">Valuation method and industry reference</option></select></label>
          {sourceView === "figures" ? (draft.source ? <SourceFigures source={draft.source} /> : <p>{draft.example ? "All figures are an original OPS teaching example. They are not a real company or market quote." : "These figures were entered by you."}</p>) : <>
            {draft.costReference && <p className={styles.note}>{draft.costReference.industry}: {draft.costReference.ratePct.toFixed(2)}% cost of capital. {draft.costReference.notes.slice(2).join(" ")}</p>}
            {draft.costReference && <details className={styles.details}><summary>How the industry reference is built</summary>{draft.costReference.notes.slice(0, 2).map((line) => <p key={line}>{line}</p>)}</details>}
            <p className={styles.note}>Valuation method: <Link href="/lessons/if-5-1-estimate-a-valuation-range">valuation basics</Link>. Industry cost references: <a href="https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/wacc.html" target="_blank" rel="noreferrer">Aswath Damodaran, NYU Stern</a>. References are dated estimates, not current quotes.</p>
          </>}
        </>}
        {!result.ok && (!missing || Object.values(draft.inputs).some((value) => value.trim() && !Number.isFinite(readInput(value)))) && <p role="status" className={design.validation}>{result.reason}</p>}
        {!wideView && <details className={styles.details}><summary>Scenario name and reasoning</summary><div className={styles.fields}><label className={styles.full}>Scenario name<input value={draft.name} maxLength={300} onChange={(e) => change({ name: e.target.value })} /></label><div className={`${styles.full} ${styles.field}`}><label htmlFor={reasoningId}>Why these assumptions?</label><textarea id={reasoningId} value={draft.reasoning} maxLength={10000} onChange={(e) => change({ reasoning: e.target.value })} /></div></div></details>}
      </section>
      {!wideView && <section className={`${design.result} ${view === "Value" ? "" : design.desktopResult}`} aria-label="Value and market price">
        <div className={design.resultHeader}><span>{draft.example ? "OPS worked example" : draft.ticker || draft.company}</span><span>Stable-growth model</span></div>
        {result.ok ? <>
          <div className={design.valueHeadline}><div><span>Estimated value / traded share</span><strong>{money(result.value)}</strong></div><span>At your<br />assumptions</span></div>
          {view === "Value" && <ValueBars value={result.value} price={result.price} date={draft.priceAsOf} />}
          {view === "Value" && <button className={design.calculationToggle} aria-expanded={calculation} onClick={() => setCalculation(!calculation)}>{calculation ? "Back to price comparison" : "See calculation"}</button>}
          <CashFlow record={draft} result={result} />
        </> : <div className={design.incomplete}>
          <span>Next:</span><h2>{missing ? `Enter ${VALUATION_LABELS[missing].replace(/ \([^)]*\)$/, "").toLowerCase()}` : "Check the inputs"}</h2>
          <p>{missing === "receipt" ? "Confirm how many company shares one traded share represents. Use 1 for an ordinary share." : result.reason}</p>
          <ol><li>Start with the company’s figures.</li><li>Choose three future assumptions.</li><li>See what a share is worth in this case.</li></ol>
          <button onClick={goToMissing}>{missing ? "Enter the missing figure →" : "Review this input →"}</button>
        </div>}
        <details className={design.modelNote}><summary>What this model assumes</summary><p>The same growth, return on new capital and cost of capital continue indefinitely. This simplified model does not produce a guaranteed price target or an expected investment return. It uses annual profit as the starting point; reinvestment and value depend on your assumptions.</p></details>
      </section>}
    </div>
  </fieldset>;
}

/** Route recovery to the offending control; valuationResult remains the calculation authority. */
function inputToReview(record: ValuationCase): ValuationInput {
  const keys = [...FIGURES, ...ASSUMPTIONS, "price"] as const;
  const unreadable = keys.find((key) => record.inputs[key].trim() && !Number.isFinite(readInput(record.inputs[key])));
  if (unreadable) return unreadable;
  const missing = [...FIGURES, ...ASSUMPTIONS].find((key) => !record.inputs[key].trim());
  if (missing) return missing;
  const positive = (["receipt", "nopat", "costOfCapital", "returnOnCapital", "shares"] as const).find((key) => readInput(record.inputs[key]) <= 0);
  if (positive) return positive;
  const nonnegative = (["debt", "cash", "growth"] as const).find((key) => readInput(record.inputs[key]) < 0);
  return nonnegative ?? "growth";
}

function CashFlow({ record, result }: { record: ValuationCase; result: Extract<Result, { ok: true }> }) {
  const profit = readInput(record.inputs.nopat);
  const reinvestment = profit - result.business.cashFlow;
  const growth = readInput(record.inputs.growth);
  const effect = growth === 0 ? "No growth: no profit is reinvested for growth in this model." : result.business.growthEffect === "adds" ? "Growth adds value because new investment earns more than its cost." : result.business.growthEffect === "removes" ? "Growth reduces value because new investment earns less than its cost." : "Growth leaves value unchanged because new investment earns exactly its cost.";
  return <section className={design.cashFlow} aria-label="How profit becomes value">
    <h3>How profit becomes value <span>US dollars</span></h3>
    <div className={design.profit}><span>Annual operating profit after tax</span><strong>${millions(profit)}</strong></div>
    <div className={design.profitStrip} aria-hidden="true"><span style={{ width: `${result.business.reinvestmentRate * 100}%` }} /></div>
    <div className={design.split}><div><span><i />Reinvested for growth</span><strong>${millions(reinvestment)}</strong><small>{(result.business.reinvestmentRate * 100).toFixed(1)}% of profit</small></div><div><span><i />Cash left before debt payments</span><strong>${millions(result.business.cashFlow)}</strong></div></div>
    <p className={design.effect} data-effect={growth === 0 ? "neither" : result.business.growthEffect}>{effect}</p>
    <dl className={design.bridge}>
      <div><dt>Business value today<small>Cash flow ÷ (cost of capital − growth)</small></dt><dd>${millions(result.business.value)}</dd></div>
      <div><dt>Value for shareholders<small>Business value − borrowings + cash</small></dt><dd>${millions(result.equity.equityValue)}</dd></div>
    </dl>
    <details className={design.shareMath}><summary>From the business to one traded share</summary><p>${millions(result.equity.equityValue)} ÷ {millions(readInput(record.inputs.shares))} company shares × {readInput(record.inputs.receipt).toLocaleString("en-US")} company shares per traded share = {money(result.value)}.</p></details>
  </section>;
}

function reverseExplanation(record: ValuationCase, result: Extract<Result, { ok: true }>) {
  if (result.reverse === null) return "Add a positive market price to see the growth it would require under these assumptions.";
  if (!isValued(result.reverse)) return result.reverse.reason;
  if (Math.abs(readInput(record.inputs.returnOnCapital) - readInput(record.inputs.costOfCapital)) < 1e-10) return "Growth leaves value unchanged when new capital earns exactly its cost. This price does not identify a unique growth rate.";
  return result.reverse < 0 ? `The reverse calculation gives ${(result.reverse * 100).toFixed(1)}% growth, outside this model’s nonnegative-growth scenarios.` : `At the entered price, this model implies ${(result.reverse * 100).toFixed(1)}% growth each year.`;
}

function ValueBars({ value, price, date }: { value: number; price: number | null; date: string }) {
  const max = Math.max(value, price ?? 0);
  return <div className={design.valueBars} role="img" aria-label={`Model value ${money(value)}${price === null ? "; enter a market price to compare" : `; market price ${money(price)}`}`}>
    <div><span>Your value estimate</span><strong>{money(value)}</strong></div><div className={design.barTrack}><span style={{ width: `${value / max * 100}%` }} /></div>
    <div><span>Entered price{date ? ` · ${date}` : ""}</span><strong>{price === null ? "—" : money(price)}</strong></div><div className={`${design.barTrack} ${design.priceBar}`}><span style={{ width: `${(price ?? 0) / max * 100}%` }} /></div>
  </div>;
}

function SourceFigures({ source }: { source: NonNullable<ValuationCase["source"]> }) {
  const [index, setIndex] = useState(0);
  const figure = source.figures[index];
  const names: Record<string, string> = { revenue: "Revenue", operatingProfit: "Operating profit", pretaxProfit: "Profit before tax", taxExpense: "Tax expense", totalDebt: "Borrowings", equity: "Book equity", cash: "Cash", shares: "Share count" };
  return <>
    <p><a href={source.url} target="_blank" rel="noreferrer">SEC filing · year to {source.periodEnd}</a></p>
    <p className={styles.note}>Read {source.fetchedAt.slice(0, 10)}. Saved inputs stay fixed until you edit them. Source values use original dollars and shares.</p>
    <label>Inspect a source figure<select value={index} onChange={(e) => setIndex(Number(e.target.value))}>{source.figures.map((f, i) => <option key={f.key} value={i}>{names[f.key] ?? f.key}</option>)}</select></label>
    {figure && <p className={styles.sourceList}><strong>{figure.value.toLocaleString("en-US")}</strong><br />{figure.concepts.join(" + ")}</p>}
    <p className={styles.note}>Filed shares may be a yearly average. Check today’s share count, and how many company shares each traded share stands for, before using a value per share.</p>
  </>;
}
