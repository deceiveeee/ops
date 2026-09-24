"use client";
import { useRef, useState } from "react";
import data from "@/lib/studio-project/data/fund-total-returns.json";
import { cumulativeReturn, importMonthlyReturns, validSourceUrl, type MonthlyReturn, type ReturnHistory, type ReturnBasis } from "@/lib/studio-project/total-returns";
import { useWorkspace } from "./WorkspaceProvider";
import { downloadFile } from "../shared";
import ViewTabs from "./ViewTabs";
import styles from "./quant-workspace.module.css";

type View = "history" | "import" | "growth";
const VIEWS: { id: View; label: string; className?: string }[] = [
  { id: "history", label: "Inspect history" },
  { id: "growth", label: "Growth of 100", className: styles.mobileTab },
  { id: "import", label: "Import a local history" },
];

export default function ReturnHistoryWorkspace() {
  const { project, catalog, session, report } = useWorkspace();
  const [view, setView] = useState<View>("history");
  const [importStep, setImportStep] = useState<"source" | "file">("source");
  const [choice, setChoice] = useState("public-vti");
  const [instrumentId, setInstrumentId] = useState("aapl");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [basis, setBasis] = useState<ReturnBasis>("market-price");
  const [csv, setCsv] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [monthIndex, setMonthIndex] = useState(0);
  const fileRequest = useRef(0);
  if (!project) return null;
  const published = data.histories.find((h) => `public-${h.instrumentId}` === choice);
  const imported = project.returnHistories?.find((h) => h.id === choice);
  const rows = published?.observations ?? imported?.observations ?? [];
  const selectedMonth = rows[Math.min(monthIndex, Math.max(0, rows.length - 1))];
  const compound = cumulativeReturn(rows);
  const name = published?.symbol ?? catalog.find((c) => c.id === imported?.instrumentId)?.symbol ?? imported?.instrumentId ?? "History";
  const selectedSource = published && selectedMonth ? published.sources.find((s) => s.accession === (selectedMonth as typeof published.observations[number]).accession) : null;
  const sourceProblem = () => !sourceName.trim() || !/^[A-Z]{3}$/.test(currency) || !validSourceUrl(sourceUrl)
    ? "Name the source, use a three-letter currency, and use a full http(s) source link if supplied." : "";
  const save = async () => {
    setError("");
    if (sourceProblem()) { setError(sourceProblem()); return; }
    const parsed = importMonthlyReturns(csv, confirmed);
    if (!parsed.ok) { setError(parsed.error); return; }
    const record: ReturnHistory = { id: `returns-${crypto.randomUUID()}`, instrumentId, sourceName: sourceName.trim(), sourceUrl, currency, basis, method: parsed.method, importedAt: new Date().toISOString(), observations: parsed.observations };
    setPending(true);
    try {
      const result = report(await session.update((current) => ({ ...current, updatedAt: record.importedAt, returnHistories: [...(current.returnHistories ?? []), record] })));
      if (result.ok) { setChoice(record.id); setMonthIndex(0); setView("history"); setImportStep("source"); setCsv(""); setConfirmed(false); }
      else setError(result.error);
    } finally { setPending(false); }
  };
  return <div className={styles.root}>
    <header className={styles.heading}><h1>Return history</h1><p>Total return includes price changes and reinvested payouts, such as dividends. These histories include those payouts once.</p></header>
    <ViewTabs label="Return history views" idPrefix="returns" className={styles.tabs} tabs={VIEWS} selected={view} onSelect={setView} />
    {view !== "import" ? <>
      {view === "history" && <p className={styles.mobileSummary}>{name} · {compound === null ? "Incomplete history" : `${(compound * 100).toFixed(2)}% total return`} · {rows.length} months</p>}
      <div className={`${styles.layout} ${view === "growth" ? styles.single : ""}`} role="tabpanel" id="returns-panel" aria-labelledby={`returns-tab-${view}`}>
      {view === "history" && <section className={styles.panel} aria-label="History source and months">
        <label>Return series<select value={choice} onChange={(e) => { setChoice(e.target.value); setMonthIndex(0); }}>{data.histories.map((h) => <option key={h.instrumentId} value={`public-${h.instrumentId}`}>{h.symbol} · public fund total returns</option>)}{project.returnHistories?.map((h) => <option key={h.id} value={h.id}>{catalog.find((c) => c.id === h.instrumentId)?.symbol ?? h.instrumentId} · {h.sourceName} · local import</option>)}</select></label>
        <p className={styles.note}>{published ? `The fund's own monthly returns, as reported to the SEC for this exact version of the fund (class ${published.classId}). Measured on net asset value: what its holdings are worth per share, after what it owes. In US dollars with distributions reinvested, and not the price it traded at on the exchange.` :`${imported?.sourceName}. ${imported?.basis === "net-asset-value" ? "Net asset value" : "Market-price basis"} in ${imported?.currency}. Local import; adjustments are stated by your source.`}</p>
        {selectedMonth && <><label className={styles.note}>Inspect a month<select value={selectedMonth.month} onChange={(e) => setMonthIndex(rows.findIndex((r) => r.month === e.target.value))}>{rows.map((r) => <option key={r.month}>{r.month}</option>)}</select></label><table className={styles.table}><thead><tr><th>Month</th><th>Total return</th></tr></thead><tbody><tr><td>{selectedMonth.month}</td><td>{(selectedMonth.value * 100).toFixed(4)}%</td></tr></tbody></table></>}
        {selectedSource && <p className={styles.note}><a href={selectedSource.url} target="_blank" rel="noreferrer">Read this month’s SEC source</a><br />Report date {selectedSource.reportDate} · filed {selectedSource.filedAt}</p>}
        {imported && <p className={styles.note}>Imported {imported.importedAt.slice(0, 10)}. {imported.sourceUrl && <a href={imported.sourceUrl} target="_blank" rel="noreferrer">Original source</a>}</p>}
        <button className={styles.button} style={{ marginTop: 14 }} onClick={() => downloadFile(`${name.replace(/[^a-z0-9-]/gi, "_")}-total-returns.csv`, ["month,total_return_pct", ...rows.map((r) => `${r.month},${Number((r.value * 100).toPrecision(12))}`)].join("\n"), "text/csv")}>Download monthly returns</button>
        <p className={styles.note}>{rows.length} months · {rows[0]?.month} to {rows.at(-1)?.month}. This is historical evidence, not an expected-return forecast. Short histories do not establish long-term risk.</p>
      </section>}
      <section className={`${styles.graphic} ${view === "history" ? styles.desktopGraphic : ""}`} aria-label="Reinvested return chart"><h2>{name} · distributions reinvested</h2><strong className={styles.value}>{compound === null ? "Incomplete history" : `${(compound * 100).toFixed(2)}%`}</strong><p>{rows[0]?.month} to {rows.at(-1)?.month} · compounded return</p><ReturnChart rows={rows} /><p>{compound === null ? "Missing months are not filled with zero." : `100 becomes ${(100 * (1 + compound)).toFixed(2)} in the history's currency.`}</p><p>Fund reports include their reported expenses. Personal taxes and investor trading costs are not included here.</p></section>
    </div></> : <section className={styles.panel} style={{ marginTop: 16 }} role="tabpanel" id="returns-panel" aria-label="Import a total-return history">
      {importStep === "source" ? <>
      <h2>1. Identify the source</h2>
      <div className={styles.fields}>
        <label className={styles.full}>Investment<select value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>{catalog.filter((c) => c.kind !== "bond").map((c) => <option key={c.id} value={c.id}>{c.symbol} · {c.name}</option>)}</select></label>
        <label className={styles.full}>Source name<input value={sourceName} maxLength={300} onChange={(e) => setSourceName(e.target.value)} placeholder="Provider or broker export" /></label>
        <label>Currency<input value={currency} maxLength={3} onChange={(e) => setCurrency(e.target.value.toUpperCase())} /></label>
        <label>Return basis<select value={basis} onChange={(e) => setBasis(e.target.value as ReturnBasis)}><option value="market-price">Market price</option><option value="net-asset-value">Fund net asset value</option></select></label>
        <label className={styles.full}>Source link (optional)<input type="url" value={sourceUrl} maxLength={2000} onChange={(e) => setSourceUrl(e.target.value)} /></label>
      </div>
      <p className={styles.note}>Market-price returns follow the traded shares. Fund net asset value follows the value of a fund’s underlying assets after liabilities, per share. Keep the basis and currency stated by your source.</p>
      <button className={`${styles.button} ${styles.primary}`} style={{ marginTop: 12 }} onClick={() => { const problem = sourceProblem(); setError(problem); if (!problem) setImportStep("file"); }}>Continue to file</button>
      </> : <>
      <h2>2. Check and import the file</h2>
      <p className={styles.note}>{catalog.find((c) => c.id === instrumentId)?.symbol ?? instrumentId} · {currency} · {basis === "market-price" ? "Market price" : "Fund net asset value"} · {sourceName}</p>
      <p className={styles.note}>Two columns: <strong>month,total_return_pct</strong> (2 means 2%), or <strong>month,adjusted_close</strong>. Use consecutive YYYY-MM months, oldest first. Adjusted levels need a preceding month to calculate the first return. Raw closes are refused.</p>
        <label className={styles.full}>Monthly CSV file<input type="file" accept=".csv,text/csv" onChange={async (e) => {
          const request = ++fileRequest.current;
          const file = e.target.files?.[0];
          setCsv(""); setConfirmed(false); setError("");
          if (!file) return;
          if (file.size > 250000) { setError("Use a monthly CSV smaller than 250 KB."); return; }
          try { const text = await file.text(); if (request === fileRequest.current) setCsv(text); }
          catch { if (request === fileRequest.current) setError("This file could not be read."); }
        }} /></label>
      <label className={`${styles.checkbox} ${styles.note}`}><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />For adjusted closes, my source confirms that both distributions and stock splits are included.</label>
      <div className={styles.row} style={{ marginTop: 12 }}><button className={`${styles.button} ${styles.primary}`} disabled={!csv || pending} onClick={() => void save()}>{pending ? "Saving…" : "Validate and save history"}</button><button className={styles.button} onClick={() => downloadFile("monthly-total-return-template.csv", "month,total_return_pct\n2025-01,2\n2025-02,-1\n", "text/csv")}>Download example CSV</button></div>
      <p className={styles.note}>The file stays in this browser’s project. The example CSV contains invented teaching numbers.</p>
      <details className={styles.details}><summary>Why a raw price can mislead</summary><p>A raw price falling from 100 to 98 alongside a 2 dividend can leave wealth unchanged; price alone misses the payout.</p></details>
      <button className={styles.button} onClick={() => { setImportStep("source"); setError(""); }}>Edit source details</button>
      </>}
      {error && <p className={styles.alert} role="alert">{error}</p>}
    </section>}
  </div>;
}
function ReturnChart({ rows }: { rows: MonthlyReturn[] }) {
  if (cumulativeReturn(rows) === null) return null;
  let wealth = 100;
  const levels = [100, ...rows.map((r) => wealth *= 1 + r.value)];
  const peak = Math.max(...levels);
  const normalized = levels.map((value) => value / peak);
  const min = Math.min(...normalized) * .97;
  const path = normalized.map((v, i) => `${i ? "L" : "M"}${10 + i * 310 / Math.max(1, levels.length - 1)},${115 - (v - min) / (1.03 - min) * 100}`).join(" ");
  return <svg viewBox="0 0 330 140" role="img" aria-label="Growth of 100 with distributions reinvested"><path d={path} stroke="#d5f39e" strokeWidth="2.5" fill="none" /><text x="10" y="137" fill="#cbd5c4" fontSize="12">Start: 100</text><text x="320" y="137" textAnchor="end" fill="#cbd5c4" fontSize="12">End: {levels.at(-1)!.toFixed(2)}</text></svg>;
}
