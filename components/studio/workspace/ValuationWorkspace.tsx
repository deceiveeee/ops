"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { estimate, forSic, forIndustry, industryNames } from "@/lib/studio-project/cost-of-capital";
import { decomposeRoic, isComputed, ROIC_EXCLUDED_SECTORS, type RoicSector } from "@/lib/studio-project/roic";
import { isValued } from "@/lib/studio-project/valuation";
import { newValuation, readInput, saveValuation, VALUATION_LABELS, valuationResult, type ValuationCase, type ValuationInput } from "@/lib/studio-project/valuation-cases";
import { useWorkspace } from "./WorkspaceProvider";
import { useCompanySearch, type Company } from "./CompanySearch";
import ViewTabs from "./ViewTabs";
import styles from "./quant-workspace.module.css";

const NONE = new Set<string>();
const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const VIEWS = (["Figures", "Assumptions", "Compare", "Sources"] as const).map((id) => ({ id, label: id }));
const rateText = (rate: number) => String(Number((rate * 100).toFixed(6)));
type CompanyFigures = { cik: string; name: string; sic: string; sector: RoicSector; periodEnd: string; unavailable?: string; figures: { key: string; value: number; concepts: string[] }[]; shares?: { value?: number; concept?: string }; filing?: { url: string } };

export default function ValuationWorkspace() {
  const { project, session, report } = useWorkspace();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { lookup, retry } = useCompanySearch(query, NONE);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [notice, setNotice] = useState("");
  const [failedCompany, setFailedCompany] = useState<Company | null>(null);
  const [manual, setManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualTicker, setManualTicker] = useState("");
  const initialized = useRef(false);
  const request = useRef(0);
  useEffect(() => () => { request.current += 1; }, []);
  useEffect(() => {
    if (!project || initialized.current) return;
    initialized.current = true;
    const params = new URLSearchParams(window.location.search);
    const requestedCase = project.valuations?.find((v) => v.id === params.get("case"));
    const ticker = params.get("ticker") ?? params.get("company");
    if (requestedCase) setSelected(requestedCase.id);
    else if (ticker) setQuery(ticker);
    else if (project.valuations?.length) setSelected(project.valuations.at(-1)!.id);
  }, [project]);
  if (!project) return null;
  const chooseCase = (id: string | null) => {
    setSelected(id);
    const url = new URL(window.location.href);
    url.searchParams.delete("ticker"); url.searchParams.delete("company");
    if (id) url.searchParams.set("case", id); else url.searchParams.delete("case");
    // A hard reload returns to this exact local scenario, including one opened from research.
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  };
  const add = async (record: ValuationCase) => {
    const result = report(await session.update((current) => saveValuation(current, record)));
    if (result.ok) { chooseCase(record.id); setProblem(""); }
  };
  const openManual = () => {
    setManualName(failedCompany?.name ?? query.trim());
    setManualTicker(failedCompany?.ticker ?? "");
    setManual(true);
  };
  const startManual = async () => {
    if (!manualName.trim()) return;
    const next = newValuation();
    next.company = manualName.trim(); next.ticker = manualTicker.trim().toUpperCase();
    // A name typed by the user is not an SEC-verified identity.
    if (failedCompany?.name === next.company && failedCompany.ticker === next.ticker) next.cik = failedCompany.cik;
    next.inputs.receipt = "";
    setBusy(true);
    setNotice("Enter the figures from the company’s annual report. Your work saves as you go.");
    try { await add(next); setManual(false); } finally { setBusy(false); }
  };
  const copyScenario = async (id: string) => {
    setBusy(true);
    const copyId = `value-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const result = report(await session.update((current) => {
      // Read after queued edits finish, so a quick copy includes the latest keystroke.
      const original = current.valuations?.find((v) => v.id === id);
      if (!original) throw new Error("The scenario is no longer available.");
      return saveValuation(current, { ...original, id: copyId, name: `${original.name} copy`.slice(0, 300), createdAt: now, updatedAt: now });
    }));
    if (result.ok) chooseCase(copyId);
    setBusy(false);
  };
  const readCompany = async (company: Company) => {
    const token = ++request.current;
    setBusy(true); setProblem(""); setNotice(""); setFailedCompany(null);
    try {
      const response = await fetch(`/api/studio/peer-figures?ciks=${encodeURIComponent(company.cik)}`, { signal: AbortSignal.timeout(35_000) });
      const payload = await response.json() as { companies?: CompanyFigures[]; error?: string };
      if (token !== request.current) return;
      const supplied = payload.companies?.[0];
      if (!response.ok || !supplied || supplied.unavailable) {
        setFailedCompany(company);
        setProblem(`Studio could not load ${company.name}’s annual figures. Retry, or enter the figures from its annual report yourself.`);
        return;
      }
      if (ROIC_EXCLUDED_SECTORS.includes(supplied.sector)) throw new Error("This stable-growth business model does not support financial or property companies. Their cash flows need a different model.");
      const values = Object.fromEntries(supplied.figures.map((f) => [f.key, f.value]));
      const record = newValuation();
      record.company = supplied.name; record.ticker = company.ticker; record.cik = company.cik;
      const taxRate = values.pretaxProfit > 0 && Number.isFinite(values.taxExpense) ? values.taxExpense / values.pretaxProfit : null;
      const nopat = taxRate !== null && taxRate >= 0 && taxRate <= 1 && Number.isFinite(values.operatingProfit) ? values.operatingProfit * (1 - taxRate) : null;
      const roic = decomposeRoic({ sector: supplied.sector, revenue: values.revenue, operatingIncome: values.operatingProfit, effectiveTaxRate: taxRate ?? NaN, totalDebt: values.totalDebt, equity: values.equity, cash: values.cash });
      const industry = forSic(supplied.sic);
      if (industry) { const ref = estimate(industry); record.costReference = { industry: industry.industry, ratePct: ref.costOfCapital * 100, notes: ref.provenance }; }
      const dollars = (n: number | null | undefined) => typeof n === "number" && Number.isFinite(n) ? String(Number((n / 1e6).toFixed(6))) : "";
      record.inputs = { ...record.inputs, nopat: dollars(nopat), debt: dollars(values.totalDebt), cash: dollars(values.cash), shares: dollars(supplied.shares?.value), growth: "", returnOnCapital: isComputed(roic) ? rateText(roic.roic) : "", costOfCapital: industry ? rateText(estimate(industry).costOfCapital) : "", receipt: "" };
      if (supplied.filing?.url) record.source = { url: supplied.filing.url, periodEnd: supplied.periodEnd, fetchedAt: record.createdAt, sharesConcept: supplied.shares?.concept ?? "Not supplied", figures: [...supplied.figures.map(({ key, value, concepts }) => ({ key, value, concepts })), ...(supplied.shares?.value ? [{ key: "shares", value: supplied.shares.value, concepts: [supplied.shares.concept ?? "Not supplied"] }] : [])] };
      setNotice("Annual figures loaded. Check the figures, fill in company shares per traded share, then continue to assumptions.");
      await add(record);
    } catch (error) { if (token === request.current) {
      if (error instanceof Error && error.message.startsWith("This stable-growth")) setProblem(error.message);
      else { setFailedCompany(company); setProblem(`Studio could not load ${company.name}’s annual figures. Retry, or enter the figures from its annual report yourself.`); }
    } }
    finally { if (token === request.current) setBusy(false); }
  };
  const record = project.valuations?.find((v) => v.id === selected);
  return <div className={styles.root}>
    <header className={styles.heading}><h1>Valuation</h1><p>{record ? "Check the company’s figures, choose future assumptions, then compare the estimated value with its price." : "Start with a company. We’ll load its annual figures, then help you estimate what a share is worth under your assumptions."}</p></header>
    {record ? <>
      <div className={styles.scenario}>
        <label>Saved scenario<select disabled={busy} value={selected ?? ""} onChange={(e) => { chooseCase(e.target.value); setNotice(""); }}>{project.valuations?.map((v) => <option key={v.id} value={v.id}>{v.company || "Unnamed company"} · {v.name || "Unnamed case"}</option>)}</select></label>
        <button disabled={busy} className={styles.button} onClick={() => void copyScenario(record.id)}>Copy scenario</button>
        <button disabled={busy} className={styles.button} onClick={() => { chooseCase(null); setNotice(""); setManual(false); setProblem(""); setFailedCompany(null); }}>Choose company</button>
      </div>
      {notice && <p className={styles.note}>{notice}</p>}
      <ValuationEditor key={record.id} disabled={busy} record={record} alternatives={project.valuations ?? []} />
    </> : manual ? <section className={styles.panel} aria-label="Enter a company yourself">
      <h2>Start with your own figures</h2><p>Use figures from the company’s annual report. Nothing is filled in or treated as verified automatically.</p>
      <form onSubmit={(event) => { event.preventDefault(); void startManual(); }}>
        <div className={styles.fields}><label>Company name<input required maxLength={300} value={manualName} onChange={(event) => setManualName(event.target.value)} /></label><label>Ticker (optional)<input maxLength={30} value={manualTicker} onChange={(event) => setManualTicker(event.target.value)} /></label></div>
        <div className={`${styles.row} ${styles.actions}`}><button disabled={busy || !manualName.trim()} className={`${styles.button} ${styles.primary}`} type="submit">Continue to figures</button><button type="button" disabled={busy} className={styles.button} onClick={() => setManual(false)}>Back to search</button></div>
      </form>
    </section> : <section className={styles.panel} aria-label="Choose a company to value">
      <label>Find a company<input type="search" value={query} maxLength={60} disabled={busy} onChange={(e) => { setQuery(e.target.value); setProblem(""); setFailedCompany(null); }} placeholder="e.g. Apple or AAPL" /></label>
      {lookup.kind === "loading" && <p role="status" className={styles.note}>Searching the SEC company list…</p>}
      {lookup.kind === "error" && <div role="alert" className={styles.alert}><p>{lookup.message}</p><button className={styles.button} onClick={retry}>Retry company search</button></div>}
      {lookup.kind === "done" && <>
        {lookup.source?.kind === "saved" && <p className={styles.note}>Using the saved SEC company list from {lookup.source.fetchedAt?.slice(0, 10)}. New listings may be missing.</p>}
        <div className={styles.list}>{lookup.companies.slice(0, 4).map((company) => <button key={company.cik} disabled={busy} onClick={() => void readCompany(company)}><span><strong>{company.ticker}</strong> · {company.name}</span><span>Load figures →</span></button>)}{!lookup.companies.length && <p className={styles.note}>No match in this company list. Try its ticker or enter the company yourself.</p>}</div>
      </>}
      {!query && project.investigations.some((v) => v.source?.cik) && <div className={styles.list}>{project.investigations.filter((v) => v.source?.cik).slice(-3).map((v) => <button key={v.id} disabled={busy} onClick={() => void readCompany({ cik: v.source!.cik, ticker: v.source!.ticker, name: v.company })}>Continue with {v.company}<span>→</span></button>)}</div>}
      {busy && <p role="status" className={styles.note}>Loading annual figures. This can take up to 30 seconds…</p>}
      {problem && <div role="alert" className={styles.alert}><p>{problem}</p>{failedCompany && <button disabled={busy} className={styles.button} onClick={() => void readCompany(failedCompany)}>Retry loading figures</button>}</div>}
      <div className={`${styles.row} ${styles.actions}`}><button disabled={busy} className={styles.button} onClick={openManual}>Enter figures yourself</button><button disabled={busy} className={styles.button} onClick={() => void add(newValuation(true))}>Try a worked example</button></div>
      <p className={styles.note}>For profitable businesses with steady long-term growth. Banks, insurers and property companies need a different model.</p>
      {!!project.valuations?.length && <label>Open a saved scenario<select disabled={busy} value="" onChange={(e) => chooseCase(e.target.value)}><option value="">Choose a saved case</option>{project.valuations.map((v) => <option key={v.id} value={v.id}>{v.company} · {v.name}</option>)}</select></label>}
      <details className={styles.details}><summary>How the example works</summary><p>Original OPS example: $150 million of annual operating profit after tax, a 10% cost of capital, $200 million of net debt and 100 million shares give $13 per share with no growth. At 2% growth and a 16⅔% return on new capital, 12% of profit is reinvested and the model gives $14.50 per share.</p></details>
    </section>}
  </div>;
}

function ValuationEditor({ record, alternatives, disabled }: { record: ValuationCase; alternatives: ValuationCase[]; disabled: boolean }) {
  const { session, report } = useWorkspace();
  const reasoningId = useId();
  const [draft, setDraft] = useState(record);
  const latest = useRef(record);
  const [view, setView] = useState<"Figures" | "Assumptions" | "Compare" | "Sources" | "Value">(
    ["nopat", "debt", "cash", "shares", "receipt"].some((key) => !record.inputs[key as ValuationInput].trim()) ? "Figures" : "Assumptions",
  );
  const [sourceView, setSourceView] = useState("figures");
  const [comparePage, setComparePage] = useState(0);
  useEffect(() => {
    if (!session.pending && !session.dirty && session.status === "ready") { latest.current = record; setDraft(record); }
  }, [record, session.pending, session.dirty, session.status]);
  const change = (patch: Partial<ValuationCase>) => {
    const next = { ...latest.current, ...patch, updatedAt: new Date().toISOString() };
    latest.current = next; setDraft(next);
    void session.update((current) => saveValuation(current, next)).then(report);
  };
  const field = (key: ValuationInput) => <label key={key}>{VALUATION_LABELS[key]}<input inputMode="decimal" value={draft.inputs[key]} maxLength={100} onChange={(e) => change({ inputs: { ...latest.current.inputs, [key]: e.target.value }, ...(key === "costOfCapital" ? { costReference: null } : {}) })} /></label>;
  const result = valuationResult(draft);
  const sameCompany = alternatives.filter((v) => draft.cik ? v.cik === draft.cik : v.company === draft.company);
  return <fieldset disabled={disabled} className={styles.editor}>
    <ViewTabs label="Valuation views" idPrefix="valuation" className={styles.tabs} tabs={VIEWS} selected={view === "Value" ? null : view} onSelect={setView} />
    {/* A phone hides the value panel, so the reason a value is missing is said here too. */}
    <div className={styles.mobileSummary}><span>{result.ok ? `Model value: ${money(result.value)} / share` : result.reason}</span><button className={styles.button} onClick={() => setView(view === "Value" ? "Assumptions" : "Value")}>{view === "Value" ? "Edit assumptions" : "See calculation"}</button></div>
    {/* The phone's calculation view is reached by its own button, not a tab, so it is not a tab panel. */}
    <div className={`${styles.layout} ${view === "Value" ? styles.single : ""}`} {...(view === "Value" ? {} : { role: "tabpanel", id: "valuation-panel", "aria-labelledby": `valuation-tab-${view}` })}>
      {view !== "Value" && <section className={styles.panel} aria-label={`${view} for this valuation`}>
        {view === "Figures" && <><h2>{draft.company} · check the figures</h2><div className={styles.fields}>{(["nopat", "debt", "cash", "shares", "receipt"] as const).map(field)}</div><p className={styles.note}>Figures are in millions of US dollars; shares are in millions. Company shares per traded share is 1 for most companies. Some foreign companies trade in the US as depositary receipts, each standing for a set number of their own shares: enter that number. Filed shares may be a yearly average.</p><button className={`${styles.button} ${styles.actions}`} onClick={() => setView("Assumptions")}>Continue to assumptions →</button></>}
        {view === "Assumptions" && <>
          <p className={styles.note}>Return on new capital is what future investment earns. Cost of capital is the return required by investors. Growth needs reinvestment; change these assumptions to see its effect.</p>
          <div className={styles.fields}>{(["growth", "returnOnCapital", "costOfCapital", "price"] as const).map(field)}
            <label>Price date<input type="date" value={draft.priceAsOf} onChange={(e) => change({ priceAsOf: e.target.value })} /></label>
            <label>Industry cost reference<select value={draft.costReference?.industry ?? ""} onChange={(e) => {
              const found = forIndustry(e.target.value);
              if (!found) { change({ costReference: null }); return; }
              const reference = estimate(found);
              change({ inputs: { ...latest.current.inputs, costOfCapital: rateText(reference.costOfCapital) }, costReference: { industry: found.industry, ratePct: reference.costOfCapital * 100, notes: reference.provenance } });
            }}><option value="">Your own assumption</option>{industryNames().map((name) => <option key={name}>{name}</option>)}</select></label>
          </div>
          {draft.source && <p className={styles.note}>The starting return comes from existing capital in the filing. Future investment may earn a different return.</p>}
          {draft.inputs.price && !draft.priceAsOf && <p className={styles.note}>Add the price date to make this comparison traceable.</p>}
        </>}
        {view === "Compare" && <><h2>Same company, different assumptions</h2><table className={styles.table}><thead><tr><th>Scenario</th><th>Growth</th><th>Value / share</th></tr></thead><tbody>{sameCompany.slice(comparePage * 5, comparePage * 5 + 5).map((v) => { const r = valuationResult(v); return <tr key={v.id}><td>{v.name}</td><td>{v.inputs.growth || "—"}%</td><td>{r.ok ? money(r.value) : "Incomplete"}</td></tr>; })}</tbody></table>{sameCompany.length > 5 && <div className={styles.row}><button className={styles.button} disabled={!comparePage} onClick={() => setComparePage(comparePage - 1)}>Previous cases</button><button className={styles.button} disabled={(comparePage + 1) * 5 >= sameCompany.length} onClick={() => setComparePage(comparePage + 1)}>Next cases</button></div>}<p className={styles.note}>Copy a scenario, change its assumptions and name it. These cases are possibilities; no probabilities are assigned.</p></>}
        {view === "Sources" && <>
          <h2>Where the figures came from</h2>
          <label>Source to inspect<select value={sourceView} onChange={(e) => setSourceView(e.target.value)}><option value="figures">Company figures</option><option value="method">Valuation method and industry reference</option></select></label>
          {sourceView === "figures" ? (draft.source ? <SourceFigures source={draft.source} /> : <p>{draft.example ? "All figures are an original OPS teaching example. They are not a real company or market quote." : "These figures were entered by you."}</p>) : <>
          {draft.costReference && <p className={styles.note}>{draft.costReference.industry}: {draft.costReference.ratePct.toFixed(2)}% cost of capital. {draft.costReference.notes.slice(2).join(" ")}</p>}
          {draft.costReference && <details className={styles.details}><summary>How the industry reference is built</summary>{draft.costReference.notes.slice(0, 2).map((line) => <p key={line}>{line}</p>)}</details>}
          <p className={styles.note}>Valuation method: <Link href="/lessons/if-5-1-estimate-a-valuation-range">valuation basics</Link>. Industry cost references: <a href="https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/wacc.html" target="_blank" rel="noreferrer">Aswath Damodaran, NYU Stern</a>. References are dated estimates, not current quotes.</p>
          </>}
        </>}
        <details className={styles.details}><summary>Scenario name and reasoning</summary><div className={styles.fields}><label className={styles.full}>Scenario name<input value={draft.name} maxLength={300} onChange={(e) => change({ name: e.target.value })} /></label><div className={`${styles.full} ${styles.field}`}><label htmlFor={reasoningId}>Why these assumptions?</label><textarea id={reasoningId} value={draft.reasoning} maxLength={10000} onChange={(e) => change({ reasoning: e.target.value })} /></div></div></details>
      </section>}
      <section className={`${styles.graphic} ${view !== "Value" ? styles.desktopGraphic : ""}`} aria-label="Value and market price">
        <h2>{draft.example ? "OPS worked example" : draft.company} · model value</h2>
        {result.ok ? <>
          <strong className={styles.value}>{money(result.value)}</strong><p>Per traded share at your assumptions</p>
          <ValueBars value={result.value} price={result.price} />
          <dl className={styles.bridge}><div><dt>Profit reinvested</dt><dd>{(result.business.reinvestmentRate * 100).toFixed(1)}%</dd></div><div><dt>Business value</dt><dd>{money(result.business.value)}m</dd></div><div><dt>Less debt, plus cash</dt><dd>{money(result.equity.equityValue)}m</dd></div></dl>
          {result.reverse !== null && <p>{!isValued(result.reverse) ? result.reverse.reason
            : Math.abs(readInput(draft.inputs.returnOnCapital) - readInput(draft.inputs.costOfCapital)) < 1e-10
              ? "Growth leaves value unchanged when new capital earns exactly its cost. This price does not identify a unique growth rate."
              : result.reverse < 0
                ? `The reverse calculation gives ${(result.reverse * 100).toFixed(1)}% growth, outside this model’s nonnegative-growth scenarios.`
                : `At the entered price, this model implies ${(result.reverse * 100).toFixed(1)}% growth each year.`}</p>}
        </> : <><strong className={styles.value}>Build the case.</strong><p>{result.reason}</p><p>Start with Figures, then choose the assumptions.</p></>}
        <p>One growth rate and one return on new capital, continuing indefinitely. This simplified model does not produce a guaranteed price target or an expected investment return.</p>
      </section>
    </div>
  </fieldset>;
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
function ValueBars({ value, price }: { value: number; price: number | null }) {
  const max = Math.max(value, price ?? 0);
  return <svg viewBox="0 0 330 102" role="img" aria-label={`Model value ${money(value)}${price === null ? "; enter a market price to compare" : `; market price ${money(price)}`}`}><text x="0" y="13" fill="#cbd5c4" fontSize="12">Model value</text><rect x="0" y="23" width={300 * (value / max)} height="16" rx="3" fill="#d5f39e" /><text x="0" y="64" fill="#cbd5c4" fontSize="12">{price === null ? "Enter a market price" : `Market price · ${money(price)}`}</text>{price !== null && <rect x="0" y="74" width={300 * (price / max)} height="16" rx="3" fill="#bfb1e5" />}</svg>;
}
