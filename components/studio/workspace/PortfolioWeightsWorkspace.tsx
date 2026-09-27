"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { workingAlternative, type PortfolioAlternative, type StudioProject } from "@/lib/studio-project/schema";
import { allocationView, chooseWeightProposal, comparisonNeedsReview, eligibleValuations, holdingInputsChanged, saveWeightProposal } from "@/lib/studio-project/portfolio-weights";
import { validateStudioProject } from "@/lib/studio-project/validate";
import { readInput, valuationResult, type ValuationCase } from "@/lib/studio-project/valuation-cases";
import type { StudioCalculation } from "@/lib/studio";
import { useWorkspace } from "./WorkspaceProvider";
import ViewTabs from "./ViewTabs";
import common from "./quant-workspace.module.css";
import styles from "./portfolio-weights.module.css";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (n: number) => `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}%`;
const points = (n: number) => `${n > 0 ? "+" : ""}${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} points`;
const VIEWS = [{ id: "Weights", label: "Weights" }, { id: "Limits", label: "Limits" }, { id: "Scenario", label: "Loss scenario" }] as const;
type View = typeof VIEWS[number]["id"] | "Valuation" | "Keep";
const status = { met: "Met", "not-met": "Not met", "not-checked": "Not checked" };
const PAGE_SIZE = 3;

export default function PortfolioWeightsWorkspace() {
  const { project } = useWorkspace();
  const [sourceId, setSourceId] = useState("");
  // Wait for the entry URL before mounting the editor; navigation can retain the loaded project.
  const [requestedValue, setRequestedValue] = useState<string | null>(null);
  useEffect(() => { const params = new URLSearchParams(window.location.search); setSourceId(params.get("proposal") ?? ""); setRequestedValue(params.get("valuation") ?? ""); }, []);
  if (!project || requestedValue === null) return null;
  const current = workingAlternative(project);
  const source = project.alternatives.find((item) => item.id === sourceId) ?? current;
  if (!current || !source) return null;
  const open = (id: string) => {
    setSourceId(id);
    const url = new URL(window.location.href); url.searchParams.set("proposal", id); url.searchParams.delete("valuation");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  };
  return <div className={`${common.root} ${styles.root}`}>
    <header className={styles.heading}><h1>Portfolio weights</h1><p>Compare a proposed mix with your saved allocation.</p></header>
    {!source.positions.length ? <section className={common.panel}><h2>Add investments to compare</h2><p>Your valuations remain saved. Add holdings in Research, then return to try their weights.</p><Link className={styles.textLink} href="/studio/research">Open Research →</Link></section> : <WeightsEditor key={source.id} project={project} current={current} source={source} requestedValue={requestedValue} onOpen={open} />}
  </div>;
}

function WeightsEditor({ project, current, source, requestedValue, onOpen }: { project: StudioProject; current: PortfolioAlternative; source: PortfolioAlternative; requestedValue: string; onOpen: (id: string) => void }) {
  const { session, report, catalog, setDraft } = useWorkspace();
  const cacheKey = `ops-weight-preview:${project.id}:${source.id}`;
  const [cached] = useState(() => readPreview(cacheKey, project, source));
  const [original] = useState(() => cached?.original ?? structuredClone(source));
  const [weights, setWeights] = useState<Record<string, string>>(() => cached?.weights ?? Object.fromEntries(source.positions.map((position) => [position.instrumentId, String(position.targetWeightPct)])));
  const [links, setLinks] = useState<Record<string, string>>(cached?.links ?? {});
  const defaultName = `${original.name.slice(0, 270)} proposal`;
  const [name, setName] = useState(cached?.name ?? defaultName);
  const [reasoning, setReasoning] = useState(cached?.reasoning ?? source.reasoning);
  const [acceptedReason, setAcceptedReason] = useState(source.reasoning);
  const [view, setView] = useState<View>(source.id === current.id ? "Weights" : "Keep");
  const [holding, setHolding] = useState(source.positions[0].instrumentId);
  const [page, setPage] = useState(0);
  const [check, setCheck] = useState("loss");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [focusHeading, setFocusHeading] = useState(false);
  const [focusPicker, setFocusPicker] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const picker = useRef<HTMLSelectElement>(null);
  useEffect(() => { picker.current?.focus(); }, []);
  const changed = Object.entries(weights).some(([id, value]) => readInput(value) !== original.positions.find((position) => position.instrumentId === id)?.targetWeightPct) || Object.keys(links).length > 0;
  const dirty = changed || name !== defaultName || reasoning !== acceptedReason;
  const [cacheFailed, setCacheFailed] = useState(false);
  useEffect(() => { setDraft(dirty && cacheFailed); return () => setDraft(false); }, [dirty, cacheFailed, setDraft]);
  useEffect(() => { if (focusPicker && !busy) { picker.current?.focus(); setFocusPicker(false); } }, [focusPicker, busy]);
  useEffect(() => {
    try {
      if (dirty) window.sessionStorage.setItem(cacheKey, JSON.stringify({ original, weights, links, name, reasoning }));
      else window.sessionStorage.removeItem(cacheKey);
      setCacheFailed(false);
    } catch { setCacheFailed(true); }
  }, [cacheKey, dirty, original, weights, links, name, reasoning]);
  useEffect(() => {
    if (!dirty || !cacheFailed) return;
    const leaving = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const navigation = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (link instanceof HTMLAnchorElement && link.target !== "_blank" && !window.confirm("This preview could not be kept in this tab. Leave and discard it?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", leaving); document.addEventListener("click", navigation, true);
    return () => { window.removeEventListener("beforeunload", leaving); document.removeEventListener("click", navigation, true); };
  }, [dirty, cacheFailed]);
  const stale = original.updatedAt !== source.updatedAt;
  const previewAlternative = { ...original, positions: original.positions.map((position) => ({ ...position, targetWeightPct: readInput(weights[position.instrumentId]) })) };
  const base = allocationView(project, current);
  const preview = allocationView(project, previewAlternative);
  const valid = preview.calculation.valid;
  const candidate = project.alternatives.find((item) => item.id === original.id)!;
  const isCurrent = original.id === current.id;
  const changedBasis = comparisonNeedsReview(project, original);
  const changedHoldings = holdingInputsChanged(project, original);
  const saveAsNew = isCurrent || changed || changedBasis;
  const instrument = (id: string) => catalog.find((item) => item.id === id);
  const label = (id: string) => instrument(id)?.symbol ?? id;
  const show = (next: View) => { setView(next); setPage(0); setFocusHeading(true); };
  useEffect(() => { if (focusHeading) { heading.current?.focus(); setFocusHeading(false); } }, [view, focusHeading]);
  useEffect(() => {
    if (!requestedValue) return;
    const match = original.positions.find((position) => eligibleValuations(project, position.instrumentId).some((value) => value.id === requestedValue));
    if (match) { setHolding(match.instrumentId); show("Valuation"); setMessage("Choose the saved valuation to attach it to this proposal."); }
    else setMessage("Add the matching company to your holdings in Research before linking this valuation.");
    // Apply the entry link once; project saves must not switch views again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const reset = () => { setWeights(Object.fromEntries(original.positions.map((p) => [p.instrumentId, String(p.targetWeightPct)]))); setLinks({}); setName(defaultName); setReasoning(acceptedReason); setMessage(""); };
  const save = async () => {
    setBusy(true);
    let savedId = "";
    let problem = "";
    const result = report(await session.update((latest) => {
      let next: StudioProject;
      try { next = saveWeightProposal(latest, original.id, { name, reasoning, weights, valuationCaseIds: links }, undefined, original.updatedAt); }
      catch (error) { problem = error instanceof Error ? error.message : "Review the proposed inputs."; throw error; }
      savedId = next.alternatives.at(-1)!.id;
      return next;
    }));
    setBusy(false);
    if (result.ok) { try { window.sessionStorage.removeItem(cacheKey); } catch { /* The proposal is already persisted. */ } onOpen(savedId); }
    else setMessage(problem || result.error);
  };
  const choose = async () => {
    setBusy(true);
    let problem = "";
    const result = report(await session.update((latest) => { try { return chooseWeightProposal(latest, original.id, reasoning); } catch (error) { problem = error instanceof Error ? error.message : "Review the proposal."; throw error; } }));
    setBusy(false);
    if (result.ok) { setAcceptedReason(reasoning); setMessage("This is now your selected allocation. Your other allocations remain saved."); setFocusPicker(true); }
    else setMessage(problem || result.error);
  };
  const contributionRows = Array.from(new Set([...base.calculation.rows.map((row) => row.holding.instrumentId), ...preview.calculation.rows.map((row) => row.holding.instrumentId)]));
  const visible = (view === "Scenario" ? contributionRows : original.positions.map((p) => p.instrumentId)).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalRows = view === "Scenario" ? contributionRows.length : original.positions.length;
  const snapshot = links[holding] !== undefined ? project.valuations?.find((value) => value.id === links[holding]) : original.valuationLinks?.find((link) => link.instrumentId === holding)?.snapshot;
  const live = snapshot && project.valuations?.find((value) => value.id === snapshot.id);
  const obsolete = snapshot && (!live || live.updatedAt !== snapshot.updatedAt);
  const options = eligibleValuations(project, holding);
  const ownHolding = project.instruments?.find((item) => item.id === holding);
  const manuallyMatched = Boolean(ownHolding && !project.investigations.find((item) => item.id === ownHolding.investigationId)?.source);
  const selectedCheck = preview.checks.checks.find((item) => item.key === check)!;
  const failedCount = preview.checks.checks.filter((item) => item.status === "not-met").length;
  return <fieldset disabled={busy} className={styles.editor}>
    <div className={styles.context}>
      <label>Start from allocation<select aria-label="Start from allocation" ref={picker} value={source.id} onChange={(event) => { if (!dirty || !cacheFailed || window.confirm("Discard this preview and open another saved allocation?")) onOpen(event.target.value); }}>{project.alternatives.map((item) => <option key={item.id} value={item.id}>{item.name}{item.id === current.id ? " · selected" : ""}</option>)}</select></label>
      <button className={common.button} onClick={() => show("Keep")}>Review proposal →</button>
    </div>
    {message && <p role="status" className={styles.message}>{message}</p>}
    <ViewTabs label="Allocation views" idPrefix="weights" className={styles.tabs} tabs={VIEWS} selected={VIEWS.find((item) => item.id === view)?.id ?? null} onSelect={(next) => { setView(next); setPage(0); }} />
    <section className={`${common.panel} ${styles.work}`} aria-label={`${view} for this allocation`} {...(VIEWS.some((v) => v.id === view) ? { role: "tabpanel", id: "weights-panel", "aria-labelledby": `weights-tab-${view}` } : {})}>
      {view === "Weights" && <>
        <div className={styles.stageTitle}><span>{changed ? "Preview only · not saved" : "Saved starting allocation"}</span>{changed && <button onClick={reset}>Reset preview</button>}</div>
        <h2 ref={heading} tabIndex={-1}>Try a different mix</h2>
        <p className={styles.intro}>{money(project.goal.budget)} total − {money(project.goal.cashReserve)} reserve = {money(Math.max(0, project.goal.budget - project.goal.cashReserve))} to allocate. Enter percentages of that amount; unassigned money stays in cash.</p>
        <table className={styles.weightsTable}><caption className={styles.srOnly}>Saved and proposed weights after the cash reserve</caption><thead><tr><th scope="col">Investment</th><th scope="col">Selected</th><th scope="col">Proposed</th></tr></thead><tbody>{visible.map((id) => {
          const old = base.calculation.rows.find((row) => row.holding.instrumentId === id);
          const row = preview.calculation.rows.find((row) => row.holding.instrumentId === id);
          return <tr key={id}><th scope="row"><strong>{label(id)}</strong>{instrument(id)?.kind === "stock" && <button onClick={() => { setHolding(id); show("Valuation"); }}>Valuation {original.valuationLinks?.some((link) => link.instrumentId === id) || links[id] ? "↗" : "+"}</button>}</th><td>{pct(old?.holding.targetWeightPct ?? 0)}</td><td><label><span className={styles.srOnly}>{label(id)} proposed percentage</span><input inputMode="decimal" value={weights[id]} maxLength={30} onChange={(event) => { setWeights({ ...weights, [id]: event.target.value }); setMessage(""); }} /></label><small>{valid && row ? `${money(row.targetValue)} · ${pct(row.targetPortfolioWeightPct)} of all money` : "Check percentages"}</small></td></tr>;
        })}</tbody></table>
        <Pager page={page} setPage={setPage} total={totalRows} />
        <AllocationBars current={base.calculation} preview={preview.calculation} />
      </>}
      {view === "Limits" && <>
        <div className={styles.stageTitle}><span>Same goals, two allocations</span><Link href="/studio/goals">Edit limits ↗</Link></div><h2 ref={heading} tabIndex={-1}>Does the proposal fit?</h2>
        <p className={styles.intro}>Checks use the whole portfolio, including your cash reserve. An unset limit is shown as not checked.</p>
        <table className={styles.checksTable}><caption className={styles.srOnly}>Selected and proposed allocation limit checks</caption><thead><tr><th scope="col">Your limit</th><th scope="col">Selected</th><th scope="col">Proposed</th></tr></thead><tbody>{preview.checks.checks.map((item) => <tr key={item.key}><th scope="row">{item.title}</th><td>{status[base.checks.checks.find((v) => v.key === item.key)!.status]}</td><td data-status={item.status}>{status[item.status]}</td></tr>)}</tbody></table>
        <label className={styles.checkPicker}>Explain a check<select aria-label="Explain a check" value={check} onChange={(event) => setCheck(event.target.value)}>{preview.checks.checks.map((item) => <option value={item.key} key={item.key}>{item.title}</option>)}</select></label><p className={styles.explanation}><strong>Proposed allocation: </strong>{selectedCheck.detail}</p>
        <p className={styles.note}>Company caps check direct holdings. Fund overlap and sector exposure need separate review in <Link href="/studio/portfolio/risk">Risk and cost</Link>.</p>
      </>}
      {view === "Scenario" && <>
        <div className={styles.stageTitle}><span>One assumed market move</span><Link href="/studio/portfolio/risk">Edit scenario ↗</Link></div><h2 ref={heading} tabIndex={-1}>Where does the change come from?</h2>
        <p className={styles.intro}>Each holding’s change adds to the portfolio’s result. A 10% whole-portfolio weight falling 30% subtracts 3 percentage points.</p>
        <p className={styles.shocks}>US stocks {pct(project.stress.usStocksPct)} · International {pct(project.stress.internationalStocksPct)} · Global {pct(project.stress.globalStocksPct)} · Bonds {pct(project.stress.bondsPct)} · Cash {pct(project.stress.cashPct)}</p>
        {valid && base.calculation.valid ? <>
          <div className={styles.scenarioHeadline}><div><span>Selected allocation</span><strong>{money(base.calculation.stress.changeDollars)}</strong><small>{pct(base.calculation.stress.changePct)} of all money</small></div><span aria-hidden="true">→</span><div><span>Proposed allocation</span><strong>{money(preview.calculation.stress.changeDollars)}</strong><small>{pct(preview.calculation.stress.changePct)} of all money</small></div></div>
          <table className={styles.scenarioTable}><caption className={styles.srOnly}>Contribution to the scenario change</caption><thead><tr><th scope="col">Holding</th><th scope="col">Selected</th><th scope="col">Proposed</th></tr></thead><tbody>{visible.map((id) => <Contribution key={id} name={label(id)} before={base.calculation.stress.rows.find((row) => row.instrumentId === id)?.changeDollars ?? 0} after={preview.calculation.stress.rows.find((row) => row.instrumentId === id)?.changeDollars ?? 0} budget={project.goal.budget} />)}<Contribution name="Cash reserve + unassigned" before={cashChange(base.calculation)} after={cashChange(preview.calculation)} budget={project.goal.budget} /></tbody></table><Pager page={page} setPage={setPage} total={totalRows} />
        </> : <p className={styles.explanation}>Complete valid weights for both allocations to compare the scenario.</p>}
        <p className={styles.note}>These are assumed price changes, before costs, taxes and distributions. They are not forecasts, a worst-case loss, or a measure of volatility.</p>
      </>}
      {view === "Valuation" && <>
        <div className={styles.stageTitle}><span>Evidence behind a weight</span></div><h2 ref={heading} tabIndex={-1}>Keep the valuation you used</h2>
        <label>Company holding<select value={holding} onChange={(event) => setHolding(event.target.value)}>{original.positions.filter((p) => instrument(p.instrumentId)?.kind === "stock").map((p) => <option key={p.instrumentId} value={p.instrumentId}>{label(p.instrumentId)}</option>)}</select></label>
        <label className={styles.checkPicker}>Saved valuation<select value={links[holding] ?? snapshot?.id ?? ""} onChange={(event) => setLinks({ ...links, [holding]: event.target.value })}><option value="">No valuation attached</option>{snapshot && !options.some((v) => v.id === snapshot.id) && <option value={snapshot.id}>Kept: {snapshot.name}</option>}{options.map((value) => <option key={value.id} value={value.id}>{value.name} · {value.ticker || value.company}</option>)}</select></label>
        {manuallyMatched && <p className={styles.note}>Matched using your company name. Confirm the listing and share ratio yourself before keeping this valuation.</p>}
        {snapshot ? <ValuationEvidence snapshot={snapshot} obsolete={Boolean(obsolete)} pending={links[holding] !== undefined} /> : <p className={styles.explanation}>{options.length ? "Choose a scenario to preserve its figures and assumptions with this proposal." : "No compatible, completed valuation is saved for this holding. Check the company, ticker and traded-share ratio in Valuation."}</p>}
        {obsolete && options.some((value) => value.id === snapshot?.id) && <button className={common.button} onClick={() => setLinks({ ...links, [holding]: snapshot!.id })}>Use the latest valuation in this preview</button>}
        <p className={styles.note}>A valuation supports your reasoning. Its price gap does not specify an investment return or choose a weight.</p>{!snapshot && <Link className={styles.textLink} href="/studio/valuation">Open Valuation →</Link>}
      </>}
      {view === "Keep" && <>
        <div className={styles.stageTitle}><span>{saveAsNew ? "Keep a separate alternative" : "Saved proposal"}</span></div><h2 ref={heading} tabIndex={-1}>{saveAsNew ? "Save the proposal and your reason" : candidate.name}</h2>
        <p className={styles.intro}>Saving keeps the selected allocation intact. Choose a saved proposal to make it the allocation used by the buying and review pages.</p>
        {saveAsNew && <label>Proposal name<input value={name} maxLength={300} onChange={(event) => setName(event.target.value)} /></label>}
        <label className={styles.checkPicker}>Why these weights?<textarea aria-label="Why these weights?" value={reasoning} maxLength={10000} onChange={(event) => setReasoning(event.target.value)} placeholder="Explain the trade-off you are accepting." /></label>
        <p className={styles.explanation}>{failedCount} {failedCount === 1 ? "limit" : "limits"} not met · {preview.checks.checks.filter((item) => item.status === "not-checked").length} not checked. <button onClick={() => show("Limits")}>Review limits</button></p>
        <div className={styles.actions}>{saveAsNew ? <button className={`${common.button} ${common.primary}`} disabled={!valid || stale || changedHoldings || !name.trim() || !reasoning.trim()} onClick={() => void save()}>Save proposal</button> : <button className={`${common.button} ${common.primary}`} disabled={!valid || stale || changedHoldings || !reasoning.trim()} onClick={() => void choose()}>Use this allocation</button>}<button className={common.button} onClick={() => show("Weights")}>Back to weights</button></div>
        <p className={styles.note}>You can keep a proposal that exceeds a limit; its failed checks remain visible. Selecting an allocation places no orders.</p>
      </>}
      {!valid && <p role="status" className={styles.problem}>{Object.values(weights).some((value) => !Number.isFinite(readInput(value)) || readInput(value) < 0 || readInput(value) > 100) ? "Enter each weight as a number from 0 to 100. Blank weights stay unfinished." : preview.calculation.issues[0]}</p>}
      {stale && <p role="alert" className={styles.problem}>The starting allocation changed elsewhere. <button onClick={() => { try { window.sessionStorage.removeItem(cacheKey); } catch { /* Reload still reads the saved allocation. */ } window.location.reload(); }}>Discard preview and reload it</button> before saving.</p>}
      {changedBasis && <p role="status" className={styles.problem}>Goals, limits or scenario assumptions changed since this proposal was saved. These comparisons use the current settings; review them and save a fresh proposal.</p>}
      {changedHoldings && <p role="status" className={styles.problem}>Holdings or buying inputs changed. Start from the selected allocation before saving or choosing a new proposal.</p>}
      {cacheFailed && dirty && <p role="alert" className={styles.problem}>This browser could not keep the preview in this tab. Save the proposal before leaving.</p>}
    </section>
    <p className={styles.footnote}>Compared with <strong>{current.name}</strong>, your selected target. Preview edits stay in this tab until saved.</p>
  </fieldset>;
}

type PreviewDraft = { original: PortfolioAlternative; weights: Record<string, string>; links: Record<string, string>; name: string; reasoning: string };
/** A tab-local preview survives navigation without changing any saved allocation. */
function readPreview(key: string, project: StudioProject, source: PortfolioAlternative): PreviewDraft | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw || raw.length > 1_000_000) return null;
    const draft = JSON.parse(raw) as PreviewDraft;
    if (!draft || typeof draft !== "object" || draft.original?.id !== source.id
      || typeof draft.name !== "string" || draft.name.length > 300 || typeof draft.reasoning !== "string" || draft.reasoning.length > 10000
      || !draft.weights || typeof draft.weights !== "object" || Array.isArray(draft.weights)
      || !draft.links || typeof draft.links !== "object" || Array.isArray(draft.links)
      || validateStudioProject({ ...project, alternatives: [draft.original], selectedAlternativeId: source.id }).length) return null;
    const held = new Set(draft.original.positions.map((position) => position.instrumentId));
    if (Object.keys(draft.weights).length !== held.size
      || !Object.entries(draft.weights).every(([id, value]) => held.has(id) && typeof value === "string" && value.length <= 30)
      || !Object.entries(draft.links).every(([id, value]) => held.has(id) && typeof value === "string" && value.length <= 300)) return null;
    return draft;
  } catch { return null; }
}

function Pager({ page, setPage, total }: { page: number; setPage: (page: number) => void; total: number }) {
  return total > PAGE_SIZE ? <nav className={styles.pager} aria-label="Holdings pages"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>{page * PAGE_SIZE + 1}–{Math.min(total, (page + 1) * PAGE_SIZE)} of {total}</span><button disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(page + 1)}>Next</button></nav> : null;
}
function AllocationBars({ current, preview }: { current: StudioCalculation; preview: StudioCalculation }) {
  return <div className={styles.allocationBars} aria-label="Cash and investment comparison">{[{ name: "Selected", value: current }, { name: "Proposed", value: preview }].map(({ name, value }) => <div key={name}><div><span>{name}</span><span>{value.valid ? `${money(value.targetCash)} cash · ${pct(value.targetCashWeightPct)}` : "Complete valid weights"}</span></div><div className={styles.bar} aria-hidden="true">{value.valid && <><span style={{ width: `${100 - value.targetCashWeightPct}%` }} /><i style={{ width: `${value.targetCashWeightPct}%` }} /></>}</div></div>)}<small>Filled: investments · pale: cash reserve and unassigned money.</small></div>;
}
function cashChange(calculation: StudioCalculation) { return calculation.stress.changeDollars - calculation.stress.rows.reduce((sum, row) => sum + row.changeDollars, 0); }
function Contribution({ name, before, after, budget }: { name: string; before: number; after: number; budget: number }) {
  return <tr><th scope="row">{name}</th><td>{money(before)}<small>{points(before / budget * 100)}</small></td><td>{money(after)}<small>{points(after / budget * 100)}</small></td></tr>;
}
function ValuationEvidence({ snapshot, obsolete, pending }: { snapshot: ValuationCase; obsolete: boolean; pending: boolean }) {
  const result = valuationResult(snapshot);
  return <div className={styles.evidence}><span>{obsolete ? "Valuation changed · review this saved version" : pending ? "Preview of the valuation to keep" : "Version kept with the allocation"}</span><h3>{snapshot.company} · {snapshot.name}</h3><strong>{result.ok ? `${result.value.toLocaleString("en-US", { style: "currency", currency: "USD" })} per traded share` : "Inputs need review"}</strong><p>{snapshot.inputs.growth}% growth · {snapshot.inputs.returnOnCapital}% return on new capital · {snapshot.inputs.costOfCapital}% cost of capital.</p><p>{snapshot.inputs.receipt} company shares per traded share · saved {snapshot.updatedAt.slice(0, 10)}.</p><Link href={`/studio/valuation?case=${encodeURIComponent(snapshot.id)}`}>Open valuation →</Link></div>;
}
