"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { workingAlternative, type PortfolioAlternative, type StudioProject } from "@/lib/studio-project/schema";
import {
  alignHistories, allocationSnapshot, comparedInstruments, computeComparison, monthBreakdown, MIN_COMPARISON_MONTHS,
  periodMonths, seriesSnapshots, type AllocationResult, type AllocationSnapshot, type ComparisonInput, type CoverageRow,
} from "@/lib/studio-project/return-comparison";
import { comparisonChanges, historyOptions } from "@/lib/studio-project/return-comparison-sources";
import {
  createSavedComparison, MAX_COMPARISON_NAME, MAX_COMPARISON_REASON, MAX_SAVED_COMPARISONS, removeReturnComparison,
  saveReturnComparison, type SavedReturnComparison,
} from "@/lib/studio-project/return-comparison-saved";
import { monthAt, monthNumber } from "@/lib/studio-project/total-returns";
import { useWorkspace } from "./WorkspaceProvider";
import ViewTabs from "./ViewTabs";
import WrappingSelect from "./WrappingSelect";
import common from "./quant-workspace.module.css";
import styles from "./return-comparison.module.css";

type View = "choose" | "compare" | "month" | "saved";
const VIEWS: { id: View; label: string }[] = [
  { id: "choose", label: "Choose data" },
  { id: "compare", label: "Compare" },
  { id: "month", label: "Inspect a month" },
  { id: "saved", label: "Saved" },
];
const ROWS_PER_PAGE = 5;
const MONTH_ROWS = 4;
/** Longer allocation names are keyed as First and Second, with the full names shown once beside the work. */
const NAME_ROOM = 24;

const percent = (value: number, digits = 2) => `${(value * 100).toFixed(digits)}%`;
const signed = (value: number, digits = 2) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value * 100).toFixed(digits)}%`;
const points = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value * 100).toFixed(2)} points`;
/** "2025-03" as "Mar 2025", read as a calendar month in any time zone. */
export function monthLabel(month: string): string {
  const n = monthNumber(month);
  if (!Number.isFinite(n)) return month;
  return new Date(Date.UTC(Math.floor(n / 12), n % 12, 1)).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
/** A fall's month-end high and low: "Jan–Apr 2025", or "Dec 2024–Mar 2025" across a year end. "start" is the value before the first month. */
const fallSpan = (peak: string, trough: string) => {
  if (peak === "start") return `Start to ${monthLabel(trough)}`;
  const [high, low] = [monthLabel(peak), monthLabel(trough)];
  return high.slice(-4) === low.slice(-4) ? `${high.slice(0, -5)}–${low}` : `${high}–${low}`;
};

type Draft = { a: string; b: string; choices: Record<string, string>; start: string; end: string; name: string; reason: string };
const draftKey = (project: StudioProject) => `ops-past-returns:${project.id}`;
function readDraft(project: StudioProject): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(draftKey(project));
    if (!raw || raw.length > 100_000) return null;
    const draft = JSON.parse(raw) as Draft;
    const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max;
    if (!draft || typeof draft !== "object" || !text(draft.a, 200) || !text(draft.b, 200) || !text(draft.start, 7) || !text(draft.end, 7)
      || !text(draft.name, MAX_COMPARISON_NAME) || !text(draft.reason, MAX_COMPARISON_REASON)
      || !draft.choices || typeof draft.choices !== "object" || Array.isArray(draft.choices)
      || !Object.values(draft.choices).every((value) => text(value, 300))) return null;
    return draft;
  } catch { return null; }
}

/** Everything the comparison needs, built the same way on screen and inside a save. */
function buildComparison(project: StudioProject, catalogSymbol: (id: string) => string, bondIds: Set<string>, a: PortfolioAlternative, b: PortfolioAlternative, choices: Record<string, string>, range: { start?: string; end?: string }) {
  const snapA = allocationSnapshot(project, a);
  const snapB = allocationSnapshot(project, b);
  const rows: CoverageRow[] = comparedInstruments(snapA, snapB).map((id) => {
    const options = historyOptions(project, id, catalogSymbol(id));
    const key = choices[id] ?? (options.length === 1 ? options[0].key : undefined);
    return { instrumentId: id, symbol: catalogSymbol(id), bond: bondIds.has(id), options, chosen: options.find((option) => option.key === key) ?? null };
  });
  const full = alignHistories(rows, range.start && range.end && !rows.length ? range : {});
  const aligned = rows.length ? alignHistories(rows, range) : full;
  const input: ComparisonInput | null = aligned.ok
    ? { a: snapA, b: snapB, series: seriesSnapshots(rows, { start: aligned.start, months: aligned.months }), period: { start: aligned.start, months: aligned.months } }
    : null;
  return { snapA, snapB, rows, full, aligned, input, result: input ? computeComparison(input) : null };
}

export default function ReturnComparisonWorkspace({ initialA, initialB, onImport }: { initialA?: string; initialB?: string; onImport: (instrumentId: string) => void }) {
  const { project, catalog, session, report } = useWorkspace();
  if (!project) return null;
  // A comparison in the page's draft but not yet in this browser's storage, after a failed save.
  const storedIds = new Set((session.savedProject?.returnComparisons ?? []).map((item) => item.id));
  return <Comparison key={`${project.id}:${project.mode}`} project={project} catalogSymbol={(id) => catalog.find((item) => item.id === id)?.symbol ?? id}
    bondIds={new Set(catalog.filter((item) => item.kind === "bond").map((item) => item.id))} initialA={initialA} initialB={initialB} onImport={onImport}
    unsaved={(id) => session.dirty && !storedIds.has(id)} save={async (change) => report(await session.update(change))} />;
}

function Comparison({ project, catalogSymbol, bondIds, initialA, initialB, onImport, unsaved, save }: {
  project: StudioProject; catalogSymbol: (id: string) => string; bondIds: Set<string>; initialA?: string; initialB?: string;
  onImport: (instrumentId: string) => void; unsaved: (id: string) => boolean;
  save: (change: (project: StudioProject) => StudioProject) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const current = workingAlternative(project);
  const [draft] = useState(() => readDraft(project));
  const firstOther = (id: string) => project.alternatives.find((item) => item.id !== id)?.id ?? "";
  const [aId, setAId] = useState(() => initialA || draft?.a || current?.id || "");
  const [bId, setBId] = useState(() => initialB || draft?.b || firstOther(initialA || draft?.a || current?.id || ""));
  const [choices, setChoices] = useState<Record<string, string>>(() => draft?.choices ?? {});
  const [start, setStart] = useState(() => draft?.start ?? "");
  const [end, setEnd] = useState(() => draft?.end ?? "");
  const [name, setName] = useState(() => draft?.name ?? "");
  const [reason, setReason] = useState(() => draft?.reason ?? "");
  const [view, setView] = useState<View>("choose");
  const [page, setPage] = useState(0);
  const [monthIndex, setMonthIndex] = useState(0);
  const [allRows, setAllRows] = useState(false);
  const [openSaved, setOpenSaved] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [problem, setProblem] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [focusHeading, setFocusHeading] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  // After a failed save the record stays in the page's draft; saving again replaces it rather than adding a copy.
  const attempt = useRef<string | null>(null);
  useEffect(() => { if (focusHeading) { heading.current?.focus(); setFocusHeading(false); } }, [view, focusHeading]);

  // Unfinished choices and the reason survive navigation and reload in this tab.
  useEffect(() => {
    try { window.sessionStorage.setItem(draftKey(project), JSON.stringify({ a: aId, b: bId, choices, start, end, name, reason } satisfies Draft)); } catch { /* A private window may refuse; the page still works. */ }
  }, [project, aId, bId, choices, start, end, name, reason]);
  // A stable address for the two allocations being compared.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", "compare"); url.searchParams.set("a", aId); url.searchParams.set("b", bId);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [aId, bId]);

  const show = (next: View) => { setView(next); setFocusHeading(true); setMessage(""); };
  const a = project.alternatives.find((item) => item.id === aId) ?? current ?? null;
  const b = project.alternatives.find((item) => item.id === bId && item.id !== a?.id) ?? project.alternatives.find((item) => item.id !== a?.id) ?? null;
  const range = { start: start || undefined, end: end || undefined };
  const built = a && b ? buildComparison(project, catalogSymbol, bondIds, a, b, choices, range) : null;

  const savedList = project.returnComparisons ?? [];
  const opened = savedList.find((item) => item.id === openSaved) ?? null;
  // A reopened comparison is recomputed from its own data, never from today’s inputs.
  const shownInput = opened ? opened.input : built?.input ?? null;
  const shown = opened ? computeComparison(opened.input) : built?.result ?? null;
  const live = shown && shown.ok ? shown : null;
  const nameA = shownInput?.a.name ?? a?.name ?? "";
  const nameB = shownInput?.b.name ?? b?.name ?? "";
  const months = shownInput ? periodMonths(shownInput.period) : [];
  const t = Math.min(monthIndex, Math.max(0, months.length - 1));
  const symbol = (id: string) => shownInput?.series.find((item) => item.instrumentId === id)?.label.split(" · ")[0] ?? catalogSymbol(id);

  if (project.alternatives.length < 2 || !a || !b) {
    return <section className={`${common.panel} ${styles.panel}`} aria-label="Past returns of two allocations">
      <h2>Save a second allocation to compare</h2>
      <p>This compares two saved allocations over the same past months. Save a proposal in Compare allocations, then return here.</p>
      <Link className={styles.link} href="/studio/portfolio/weights">Open Compare allocations →</Link>
    </section>;
  }

  const saveComparison = async () => {
    if (!built?.input || !built.result?.ok) return;
    setPending(true); setMessage(""); setProblem("");
    const onScreen = JSON.stringify(built.input);
    let failure = "";
    const result = await save((latest) => {
      try {
        // Rebuild from the saved project at the moment of saving: a change made elsewhere must not mix into this record.
        const latestA = latest.alternatives.find((item) => item.id === a.id);
        const latestB = latest.alternatives.find((item) => item.id === b.id);
        const rebuilt = latestA && latestB ? buildComparison(latest, catalogSymbol, bondIds, latestA, latestB, choices, range).input : null;
        if (latest.id !== project.id || !rebuilt || JSON.stringify(rebuilt) !== onScreen) throw new Error("The allocations or histories changed while saving. Review the comparison and save again.");
        const now = new Date().toISOString();
        const record = createSavedComparison(built.input!, name, reason, now, attempt.current ?? undefined);
        attempt.current = record.id;
        const rest = { ...latest, returnComparisons: (latest.returnComparisons ?? []).filter((item) => item.id !== record.id) };
        return saveReturnComparison(rest, record, now);
      } catch (error) { failure = error instanceof Error ? error.message : "The comparison could not be saved."; throw error; }
    });
    setPending(false);
    if (result.ok) { attempt.current = null; setMessage("Saved. It keeps its own months, histories and weights; your selected allocation has not changed."); setName(""); setReason(""); }
    else setProblem(failure || result.error);
  };
  const remove = async (id: string) => {
    setPending(true);
    const result = await save((latest) => removeReturnComparison(latest, id, new Date().toISOString()));
    setPending(false); setConfirmRemove(null);
    if (result.ok) { if (openSaved === id) setOpenSaved(null); setMessage("Removed."); } else setProblem(result.error);
  };
  const startAgain = (record: SavedReturnComparison) => {
    setOpenSaved(null);
    if (project.alternatives.some((item) => item.id === record.input.a.alternativeId)) setAId(record.input.a.alternativeId);
    if (project.alternatives.some((item) => item.id === record.input.b.alternativeId)) setBId(record.input.b.alternativeId);
    setChoices(Object.fromEntries(record.input.series.map((item) => [item.instrumentId, item.key])));
    setStart(""); setEnd(""); setMonthIndex(0);
    show("choose");
  };

  const allocationOptions = project.alternatives.map((item) => <option key={item.id} value={item.id}>{item.name}{item.id === current?.id ? " · selected" : ""}</option>);
  const rowsShown = built ? built.rows.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE) : [];
  const weightOf = (snapshot: AllocationSnapshot, id: string) => {
    const investable = (snapshot.budget - snapshot.cashReserve) / snapshot.budget;
    const pct = snapshot.positions.find((position) => position.instrumentId === id)?.targetWeightPct ?? 0;
    return snapshot.budget > 0 ? investable * pct / 100 : 0;
  };
  const cashOf = (snapshot: AllocationSnapshot) => Math.max(0, 1 - snapshot.positions.reduce((sum, position) => sum + weightOf(snapshot, position.instrumentId), 0));

  const rules = `${months.length} ${months.length === 1 ? "month" : "months"} · rebalanced monthly · cash earns 0%`;
  const period = shownInput ? `${monthLabel(months[0])} to ${monthLabel(months.at(-1)!)} · ${rules}` : "";
  const keyed = nameA.length > NAME_ROOM || nameB.length > NAME_ROOM;
  const names = { a: nameA, b: nameB, headA: keyed ? "First" : nameA, headB: keyed ? "Second" : nameB, keyed };
  const savedBanner = opened && <SavedBanner record={opened} changes={comparisonChanges(project, opened)} onStartAgain={() => startAgain(opened)} onClose={() => setOpenSaved(null)} />;

  return <section className={styles.root} aria-label="Past returns of two allocations">
    <ViewTabs label="Comparison views" idPrefix="past" className={styles.tabs} tabs={VIEWS} selected={view} onSelect={(next) => { setView(next); setMessage(""); }} />
    <div className={`${common.panel} ${styles.panel}`} role="tabpanel" id="past-panel" aria-labelledby={`past-tab-${view}`}>
      {message && <p role="status" className={styles.message}>{message}</p>}

      {view === "choose" && built && <>
        <h2 ref={heading} tabIndex={-1}>Which two allocations, and which histories?</h2>
        <div className={styles.pickers}>
          <WrappingSelect label="First allocation" labelClassName={styles.srOnly} valueLabel={`First: ${a.name}${a.id === current?.id ? " · selected" : ""}`} value={a.id} onChange={(event) => { setAId(event.target.value); if (event.target.value === bId) setBId(firstOther(event.target.value)); setPage(0); }}>{allocationOptions}</WrappingSelect>
          <WrappingSelect label="Second allocation" labelClassName={styles.srOnly} valueLabel={`Second: ${b.name}${b.id === current?.id ? " · selected" : ""}`} value={b.id} onChange={(event) => { setBId(event.target.value); setPage(0); }}>{project.alternatives.filter((item) => item.id !== a.id).map((item) => <option key={item.id} value={item.id}>{item.name}{item.id === current?.id ? " · selected" : ""}</option>)}</WrappingSelect>
        </div>
        <table className={styles.coverage}>
          <caption className={styles.tableCaption}>Shares of all money and monthly histories</caption>
          <thead><tr><th scope="col">Investment</th><th scope="col">First</th><th scope="col">Second</th><th scope="col">Monthly history</th></tr></thead>
          <tbody>
            {rowsShown.map((row) => <tr key={row.instrumentId}>
              <th scope="row">{row.symbol}</th>
              <td>{percent(weightOf(built.snapA, row.instrumentId), 1)}</td>
              <td>{percent(weightOf(built.snapB, row.instrumentId), 1)}</td>
              <td>{row.bond ? <span className={styles.warn}>Individual bond: not supported here</span>
                : !row.options.length ? <button className={styles.inlineButton} onClick={() => onImport(row.instrumentId)}>None · import one</button>
                  : row.options.length === 1 ? <span>{row.options[0].kind === "public" ? "Fund’s SEC reports" : row.options[0].sourceName} <small className={styles.span}>{monthLabel(row.options[0].observations[0].month)}–{monthLabel(row.options[0].observations.at(-1)!.month)}</small></span>
                    : <WrappingSelect className={styles.historyPick} labelClassName={styles.srOnly} label={`History for ${row.symbol}`} valueLabel={row.chosen ? row.chosen.label.split(" · ").slice(1).join(" · ") : "Choose a history"} value={row.chosen?.key ?? ""} onChange={(event) => setChoices({ ...choices, [row.instrumentId]: event.target.value })}>
                      <option value="" disabled>Choose a history</option>{row.options.map((option) => <option key={option.key} value={option.key}>{option.label.split(" · ").slice(1).join(" · ")} · {monthLabel(option.observations[0].month)}–{monthLabel(option.observations.at(-1)!.month)}</option>)}
                    </WrappingSelect>}</td>
            </tr>)}
            <tr className={styles.cashRow}><th scope="row">Cash <small>reserve and unassigned</small></th><td>{percent(cashOf(built.snapA), 1)}</td><td>{percent(cashOf(built.snapB), 1)}</td><td>Earns 0% a month; no history needed</td></tr>
          </tbody>
        </table>
        {built.rows.length > ROWS_PER_PAGE && <nav className={styles.pager} aria-label="Investment pages"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><span>{page * ROWS_PER_PAGE + 1}–{Math.min(built.rows.length, (page + 1) * ROWS_PER_PAGE)} of {built.rows.length}</span><button disabled={(page + 1) * ROWS_PER_PAGE >= built.rows.length} onClick={() => setPage(page + 1)}>Next</button></nav>}
        {built.aligned.ok ? <div className={styles.period}>
          <p><strong>Months both share: {monthLabel(built.aligned.start)} to {monthLabel(built.aligned.end)}, {built.aligned.months} {built.aligned.months === 1 ? "month" : "months"}.</strong>{" "}
            {built.aligned.excluded.filter((item) => item.before || item.after).map((item) => `${symbol(item.instrumentId)}: ${[item.before && `${item.before} earlier`, item.after && `${item.after} later`].filter(Boolean).join(" and ")} ${item.before + item.after === 1 ? "month" : "months"} left out`).join("; ")}{built.aligned.excluded.some((item) => item.before || item.after) ? "." : ""}
            {built.aligned.months < MIN_COMPARISON_MONTHS && ` One month can be inspected, but a comparison needs at least ${MIN_COMPARISON_MONTHS}.`}
            {" "}<span className={styles.quiet}>Missing months are never filled or skipped, and no investment is dropped or swapped for another.</span></p>
          {!built.rows.length && <RangePicker full={built.full} rows={built.rows.length} start={start} end={end} onChange={(from, to) => { setStart(from); setEnd(to); setMonthIndex(0); }} />}
        </div> : <p role="status" className={styles.problem}>{built.aligned.error}</p>}
        {built.result && !built.result.ok && <p role="status" className={styles.problem}>{built.result.error}</p>}
        <div className={styles.actions}>
          <button className={`${common.button} ${common.primary}`} disabled={!built.result?.ok} onClick={() => show("compare")}>Compare →</button>
          {built.aligned.ok && built.rows.length > 0 && <RangePicker full={built.full} rows={built.rows.length} start={start} end={end} onChange={(from, to) => { setStart(from); setEnd(to); setMonthIndex(0); }} />}
        </div>
      </>}

      {view === "compare" && <>
        <p className={styles.stageTitle}>{live ? rules : "Growth of 100 over the same months"}</p>
        <h2 ref={heading} tabIndex={-1}>How did the two behave?</h2>
        {savedBanner}
        {!live ? <p className={styles.problem}>{shown && !shown.ok ? shown.error : "Choose the data first."} <button className={styles.inlineButton} onClick={() => show("choose")}>Choose data</button></p> : <>
          <p className={styles.define}>
            <strong>Monthly volatility</strong>: the standard deviation of monthly returns, how much they varied around their average.{" "}
            <strong>Largest fall</strong>: the biggest drop from an earlier month-end high; a fall within a month is missed.{" "}
            <strong>Rebalanced monthly</strong>: reset to the saved weights each month.
          </p>
          <div className={styles.compareGrid}>
            <GrowthChart months={live.months} a={live.a} b={live.b} names={names} />
            <ResultsTable a={live.a} b={live.b} names={names} complete={live.complete} />
          </div>
          <p className={styles.note}>Past months only: not a forecast, a limit on future losses, or proof your goals will be met. It replays today’s weights, without trading costs.</p>
          <Details input={shownInput!} a={live.a} b={live.b} nameA={nameA} nameB={nameB} covariance={live.covariance} />
        </>}
      </>}

      {view === "month" && <>
        <p className={styles.stageTitle}>{live ? period : "One month at a time"}</p>
        <h2 ref={heading} tabIndex={-1}>What made up a month’s return?</h2>
        {savedBanner}
        {!live || !shownInput ? <p className={styles.problem}>{shown && !shown.ok ? shown.error : "Choose the data first."} <button className={styles.inlineButton} onClick={() => show("choose")}>Choose data</button></p> : <>
          {keyed && <p className={styles.key}><span><i className={styles.keyA} aria-hidden="true" />First: {nameA}</span><span><i className={styles.keyB} aria-hidden="true" />Second: {nameB}</span></p>}
          <MonthPicker months={months} index={t} onChange={(next) => { setMonthIndex(next); setAllRows(false); }} />
          <MonthTable input={shownInput} a={live.a} b={live.b} t={t} names={names} symbol={symbol} all={allRows} onAll={setAllRows} />
          <p className={styles.note}>Each row is the investment’s weight of all money times its return that month, in percentage points; cash earns 0%. The rows and cash add up to the month’s return.</p>
        </>}
      </>}

      {view === "saved" && <>
        <h2 ref={heading} tabIndex={-1}>Saved comparisons</h2>
        {!opened && built?.result?.ok && built.result.complete ? <div className={styles.saveForm}>
          <p className={styles.note}>Saving keeps these {built.aligned.ok ? built.aligned.months : 0} months, both allocations’ weights and every history’s values, so it can be reopened exactly. It does not change your selected allocation.</p>
          <label>Name<input value={name} maxLength={MAX_COMPARISON_NAME} placeholder={`${a.name} and ${b.name}`} onChange={(event) => setName(event.target.value)} /></label>
          <label>Why keep it?<textarea value={reason} maxLength={MAX_COMPARISON_REASON} onChange={(event) => setReason(event.target.value)} placeholder="What this comparison showed you, and what you will do with it." /></label>
          {(!name.trim() || !reason.trim()) && <p className={styles.note}>Add a name and a reason to save.</p>}
          <button className={`${common.button} ${common.primary}`} disabled={pending || !name.trim() || !reason.trim() || savedList.length >= MAX_SAVED_COMPARISONS} onClick={() => void saveComparison()}>{pending ? "Saving…" : "Save this comparison"}</button>
          {savedList.length >= MAX_SAVED_COMPARISONS && <p className={styles.note}>You have {MAX_SAVED_COMPARISONS}, the most kept. Remove one to save another.</p>}
          {problem && <p role="alert" className={styles.problem}>{problem} Your name and reason are still here; save again to retry.</p>}
        </div> : !opened && <p className={styles.note}>Complete a comparison of at least {MIN_COMPARISON_MONTHS} months to save it.</p>}
        {savedList.length ? <ul className={styles.savedList}>{savedList.map((record) => <li key={record.id} aria-current={record.id === openSaved ? "true" : undefined}>
          <div><strong>{record.name}</strong><small>{unsaved(record.id) ? <span className={styles.warn}>Not yet stored in this browser · </span> : "Saved "}{record.createdAt.slice(0, 10)} · {record.input.a.name} and {record.input.b.name} · {monthLabel(record.input.period.start)}, {record.input.period.months} months</small></div>
          <div className={styles.savedActions}>
            <button className={common.button} onClick={() => { setOpenSaved(record.id); setMonthIndex(0); show("compare"); }}>Open</button>
            {confirmRemove === record.id
              ? <><span>Remove it?</span><button className={styles.inlineButton} disabled={pending} onClick={() => void remove(record.id)}>Yes, remove</button><button className={styles.inlineButton} onClick={() => setConfirmRemove(null)}>Keep</button></>
              : <button className={styles.inlineButton} onClick={() => setConfirmRemove(record.id)}>Remove</button>}
          </div>
        </li>)}</ul> : <p className={styles.note}>No saved comparisons yet.</p>}
        {problem && opened === null && !built?.result?.ok && <p role="alert" className={styles.problem}>{problem}</p>}
      </>}
    </div>
  </section>;
}

function RangePicker({ full, rows, start, end, onChange }: { full: ReturnType<typeof alignHistories>; rows: number; start: string; end: string; onChange: (start: string, end: string) => void }) {
  if (!full.ok && rows) return null;
  const from = full.ok ? monthNumber(full.start) : NaN;
  const to = full.ok ? monthNumber(full.end) : NaN;
  const options = Number.isFinite(from) ? Array.from({ length: to - from + 1 }, (_, i) => monthAt(from + i)) : [];
  if (!rows) {
    // Both entirely cash: there are no market months, so the learner states the period.
    return <div className={styles.range}><label>From month<input type="month" value={start} onChange={(event) => onChange(event.target.value, end)} /></label><label>To month<input type="month" value={end} onChange={(event) => onChange(start, event.target.value)} /></label></div>;
  }
  if (options.length < 3) return null;
  return <details className={styles.narrow}><summary>Use fewer months</summary><div className={styles.range}>
    <label>From<select value={start || options[0]} onChange={(event) => onChange(event.target.value, end || options.at(-1)!)}>{options.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}</select></label>
    <label>To<select value={end || options.at(-1)!} onChange={(event) => onChange(start || options[0], event.target.value)}>{options.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}</select></label>
    {(start || end) && <button className={styles.inlineButton} onClick={() => onChange("", "")}>Use every shared month</button>}
  </div><p className={styles.note}>A narrower range applies to both allocations.</p></details>;
}

type Names = { a: string; b: string; headA: string; headB: string; keyed: boolean };
/** A column heading that says First or Second on screen and the full name to a screen reader. */
const columnHead = (names: Names, side: "a" | "b") => <>{side === "a" ? names.headA : names.headB}{names.keyed && <span className={styles.srOnly}>: {names[side]}</span>}</>;

function GrowthChart({ months, a, b, names }: { months: string[]; a: AllocationResult; b: AllocationResult; names: Names }) {
  const values = [...a.growth, ...b.growth];
  const low = Math.min(...values);
  const high = Math.max(...values);
  const pad = Math.max((high - low) * 0.08, 0.5);
  const y = (value: number) => 100 - ((value - (low - pad)) / (high - low + 2 * pad)) * 100;
  const x = (index: number) => (index / Math.max(1, a.growth.length - 1)) * 100;
  const path = (growth: number[]) => growth.map((value, i) => `${i ? "L" : "M"}${x(i).toFixed(3)},${y(value).toFixed(3)}`).join(" ");
  const endA = a.growth.at(-1)!.toFixed(2);
  const endB = b.growth.at(-1)!.toFixed(2);
  // Direct labels at the line ends, kept apart when the two end close together; a label may wrap to two lines.
  let topA = y(a.growth.at(-1)!);
  let topB = y(b.growth.at(-1)!);
  if (Math.abs(topA - topB) < 22) { const mid = (topA + topB) / 2; const up = topA <= topB; topA = mid + (up ? -11 : 11); topB = mid + (up ? 11 : -11); }
  const clamp = (value: number) => Math.min(90, Math.max(8, value));
  return <figure className={`${styles.chart} ${names.keyed ? styles.keyedChart : ""}`}>
    <figcaption className={styles.srOnly}>Growth of 100 for {names.a}, ending at {endA}, and {names.b}, ending at {endB}, from {monthLabel(months[0])} to {monthLabel(months.at(-1)!)}. The table gives the same results.</figcaption>
    {/* Where there is no room beside the lines, or the names are long, the key sits above the chart. */}
    <div className={styles.legend} aria-hidden="true">
      <span className={styles.labelA}><i />{names.keyed && "First: "}{names.a} · {endA}</span>
      <span className={styles.labelB}><i />{names.keyed && "Second: "}{names.b} · {endB}</span>
    </div>
    <div className={styles.plot} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="0" x2="100" y1={y(100)} y2={y(100)} className={styles.base} vectorEffect="non-scaling-stroke" />
        <path d={path(b.growth)} className={styles.lineB} vectorEffect="non-scaling-stroke" />
        <path d={path(a.growth)} className={styles.lineA} vectorEffect="non-scaling-stroke" />
      </svg>
      {!names.keyed && <>
        <span className={`${styles.endLabel} ${styles.labelA}`} style={{ top: `${clamp(topA)}%` }}><i />{names.a} · {endA}</span>
        <span className={`${styles.endLabel} ${styles.labelB}`} style={{ top: `${clamp(topB)}%` }}><i />{names.b} · {endB}</span>
      </>}
      <span className={styles.baseLabel} style={{ top: `${clamp(y(100))}%` }}>100</span>
    </div>
    <div className={styles.axis} aria-hidden="true"><span>100 at the start of {monthLabel(months[0])}</span><span>End of {monthLabel(months.at(-1)!)}</span></div>
  </figure>;
}

function ResultsTable({ a, b, names, complete }: { a: AllocationResult; b: AllocationResult; names: Names; complete: boolean }) {
  const fall = (result: AllocationResult) => result.largestFall.value === 0 ? "No month-end fall"
    : <>{percent(result.largestFall.value)}<small>{fallSpan(result.largestFall.peak!, result.largestFall.trough!)}</small></>;
  return <table className={styles.results}>
    <caption className={styles.srOnly}>Results over the same months</caption>
    <thead><tr><th scope="col"><span className={styles.srOnly}>Measure</span></th><th scope="col"><i className={styles.keyA} aria-hidden="true" />{columnHead(names, "a")}</th><th scope="col"><i className={styles.keyB} aria-hidden="true" />{columnHead(names, "b")}</th></tr></thead>
    <tbody>
      <tr><th scope="row">Compounded return</th><td>{signed(a.periodReturn)}</td><td>{signed(b.periodReturn)}</td></tr>
      <tr><th scope="row">Monthly volatility</th><td>{complete ? percent(a.volatility!) : "Needs 2 months"}</td><td>{complete ? percent(b.volatility!) : "Needs 2 months"}</td></tr>
      <tr><th scope="row">Largest fall</th><td>{fall(a)}</td><td>{fall(b)}</td></tr>
    </tbody>
  </table>;
}

function Details({ input, a, b, nameA, nameB, covariance }: { input: ComparisonInput; a: AllocationResult; b: AllocationResult; nameA: string; nameB: string; covariance: number[][] | null }) {
  const label = (id: string) => input.series.find((item) => item.instrumentId === id)?.label.split(" · ")[0] ?? id;
  return <details className={styles.details}>
    <summary>How these are calculated, and the data used</summary>
    <p><strong>Growth of 100</strong> multiplies month by month: 100 × (1 + each month’s return). A month up 10% then a month down 10% leaves 99, a 1% loss, not zero.</p>
    <p><strong>A month’s return</strong> is each investment’s weight of all money times its return, plus cash at 0%. Weights of all money: the money after the reserve times each saved percentage.</p>
    <p><strong>Volatility, worked example:</strong> monthly returns of +4%, −2.4% and +1.2% average 0.93%. Their squared distances from that average, added and divided by 2 (one fewer than the 3 months), give 0.103%² a month; the square root is 3.21%.</p>
    <p>Average monthly return: {nameA} {signed(a.meanMonthly, 3)}, {nameB} {signed(b.meanMonthly, 3)}. An average of past months is not the compounded return and not a forecast.</p>
    {covariance && input.series.length <= 6 && <table className={styles.matrix}><caption>How the monthly returns moved together (sample covariance, in %² a month)</caption>
      <thead><tr><th scope="col"><span className={styles.srOnly}>Investment</span></th>{input.series.map((item) => <th scope="col" key={item.instrumentId}>{label(item.instrumentId)}</th>)}</tr></thead>
      <tbody>{input.series.map((row, i) => <tr key={row.instrumentId}><th scope="row">{label(row.instrumentId)}</th>{covariance[i].map((value, j) => <td key={j}>{(value * 10_000).toFixed(3)}</td>)}</tr>)}</tbody></table>}
    <p>Portfolio variance is the weights applied to that table, and matches the variance of the portfolio’s own monthly returns.</p>
    <ul className={styles.sources}>{input.series.map((item) => <li key={item.instrumentId}><strong>{label(item.instrumentId)}</strong>: {item.sourceName}. {item.currency}, {item.basis === "net-asset-value" ? "fund net asset value" : "market price"}, distributions included once.{item.sourceUrl && <> <a href={item.sourceUrl} target="_blank" rel="noreferrer">Source</a></>}</li>)}</ul>
    <p>Method: {`monthly-rebalanced-cash-zero-v1`}. Sources and checks: the portfolio return comparison audit.</p>
  </details>;
}

function MonthPicker({ months, index, onChange }: { months: string[]; index: number; onChange: (index: number) => void }) {
  const id = useId();
  return <div className={styles.monthPicker}>
    <button className={styles.stepButton} disabled={index === 0} onClick={() => onChange(index - 1)} aria-label="Previous month">←</button>
    <div className={styles.monthControl}>
      <div className={styles.monthHead}><label htmlFor={id}>Month</label><strong aria-live="polite">{monthLabel(months[index])}</strong></div>
      <input id={id} type="range" min={0} max={months.length - 1} value={index} aria-valuetext={monthLabel(months[index])} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
    <button className={styles.stepButton} disabled={index === months.length - 1} onClick={() => onChange(index + 1)} aria-label="Next month">→</button>
  </div>;
}

function MonthTable({ input, a, b, t, names, symbol, all, onAll }: { input: ComparisonInput; a: AllocationResult; b: AllocationResult; t: number; names: Names; symbol: (id: string) => string; all: boolean; onAll: (all: boolean) => void }) {
  const month = monthBreakdown(input, a, b, t);
  const size = (row: typeof month.rows[number]) => Math.max(Math.abs(row.a.contribution), Math.abs(row.b.contribution));
  const sorted = [...month.rows].sort((x, y) => size(y) - size(x));
  const shown = all ? sorted : sorted.slice(0, MONTH_ROWS);
  const others = sorted.slice(shown.length);
  const sum = (rows: typeof sorted, side: "a" | "b") => rows.reduce((total, row) => total + row[side].contribution, 0);
  return <>
    <table className={styles.monthTable}>
      <caption className={styles.srOnly}>Each investment’s part of the month’s return, in percentage points of all money</caption>
      <thead><tr><th scope="col">Investment <small>return that month</small></th><th scope="col"><i className={styles.keyA} aria-hidden="true" />{columnHead(names, "a")}</th><th scope="col"><i className={styles.keyB} aria-hidden="true" />{columnHead(names, "b")}</th></tr></thead>
      <tbody>
        {shown.map((row) => <tr key={row.instrumentId}><th scope="row">{symbol(row.instrumentId)} <small>{signed(row.monthReturn)}</small></th><td>{points(row.a.contribution)}<small>{percent(row.a.weight, 1)} of all</small></td><td>{points(row.b.contribution)}<small>{percent(row.b.weight, 1)} of all</small></td></tr>)}
        {others.length > 0 && <tr><th scope="row">Other holdings ({others.length}) <button className={styles.inlineButton} aria-expanded={false} onClick={() => onAll(true)}>Show them</button></th><td>{points(sum(others, "a"))}</td><td>{points(sum(others, "b"))}</td></tr>}
        <tr><th scope="row">Cash <small>0% a month</small></th><td>{points(0)}<small>{percent(month.cash.a, 1)} of all</small></td><td>{points(0)}<small>{percent(month.cash.b, 1)} of all</small></td></tr>
      </tbody>
      <tfoot><tr><th scope="row">Month’s return</th><td>{signed(month.total.a)}</td><td>{signed(month.total.b)}</td></tr></tfoot>
    </table>
    {all && sorted.length > MONTH_ROWS && <button className={styles.inlineButton} aria-expanded onClick={() => onAll(false)}>Show the largest {MONTH_ROWS} only</button>}
  </>;
}

function SavedBanner({ record, changes, onStartAgain, onClose }: { record: SavedReturnComparison; changes: { affects: string[]; notes: string[] }; onStartAgain: () => void; onClose: () => void }) {
  return <div className={styles.banner} role="status">
    {/* One paragraph: what was saved, the learner's own reason in quotes, then what has changed since. */}
    <p><strong>Saved {record.createdAt.slice(0, 10)}: {record.name}.</strong> “{record.reason}”{" "}
      {changes.affects.length > 0 ? <>Since then: {changes.affects.join(" ")} <strong>These results stay as saved.</strong></> : "Reopened from its own saved data."}{changes.notes.length > 0 && ` ${changes.notes.join(" ")}`}</p>
    <div className={styles.bannerActions}>{changes.affects.length > 0 && <button className={styles.inlineButton} onClick={onStartAgain}>Compare again with today’s inputs</button>}<button className={styles.inlineButton} onClick={onClose} aria-label="Close the saved comparison">Close</button></div>
  </div>;
}
