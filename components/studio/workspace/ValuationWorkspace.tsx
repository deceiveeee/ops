"use client";

import { useEffect, useRef, useState } from "react";
import { estimate, forSic } from "@/lib/studio-project/cost-of-capital";
import { decomposeRoic, isComputed, ROIC_EXCLUDED_SECTORS, type RoicSector } from "@/lib/studio-project/roic";
import { newValuation, saveValuation, type ValuationCase } from "@/lib/studio-project/valuation-cases";
import { useWorkspace } from "./WorkspaceProvider";
import { useCompanySearch, type Company } from "./CompanySearch";
import ValuationEditor from "./ValuationEditor";
import { sensitivityScenario, type SensitivityRates } from "@/lib/studio-project/valuation-sensitivity";
import styles from "./quant-workspace.module.css";
import design from "./valuation-workspace.module.css";

const NONE = new Set<string>();
const rateText = (rate: number) => String(Number((rate * 100).toFixed(6)));
type CompanyFigures = { cik: string; name: string; sic: string; sector: RoicSector; periodEnd: string; unavailable?: string; figures: { key: string; value: number; concepts: string[] }[]; shares?: { value?: number; concept?: string }; filing?: { url: string } };

export default function ValuationWorkspace() {
  const { project, session, report } = useWorkspace();
  const [selected, setSelected] = useState<string | null>(null);
  const [focusOnOpen, setFocusOnOpen] = useState(false);
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
  const copyScenario = async (id: string, rates?: SensitivityRates) => {
    setBusy(true);
    const copyId = `value-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const result = report(await session.update((current) => {
      // Read after queued edits finish, so a quick copy includes the latest keystroke.
      const original = current.valuations?.find((v) => v.id === id);
      if (!original) throw new Error("The scenario is no longer available.");
      return saveValuation(current, rates ? sensitivityScenario(original, rates, copyId, now) : { ...original, id: copyId, name: `${original.name} copy`.slice(0, 300), createdAt: now, updatedAt: now });
    }));
    if (result.ok) { setFocusOnOpen(true); chooseCase(copyId); }
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
  return <div className={`${styles.root} ${design.root}`}>
    <header className={`${styles.heading} ${design.heading}`}><h1>Valuation</h1><p>{record ? "Turn company figures into a value per share." : "Start with a company. We’ll load its annual figures, then help you estimate what a share is worth under your assumptions."}</p></header>
    {record ? <>
      {notice && <p role="status" className={design.srOnly}>{notice}</p>}
      <ValuationEditor key={record.id} disabled={busy} focusOnOpen={focusOnOpen} record={record} alternatives={project.valuations ?? []}
        onSelect={(id) => { setFocusOnOpen(true); chooseCase(id); setNotice(""); }}
        onCopy={(rates) => void copyScenario(record.id, rates)}
        onChooseCompany={() => { chooseCase(null); setNotice(""); setManual(false); setProblem(""); setFailedCompany(null); }} />
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
