"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import industriesData from "@/lib/studio-project/data/industries.json";
import { checkEntries, FIGURES, read, type Entries, type FigureKey, type PeerContext } from "@/lib/studio-project/investigate";
import {
  COST_OF_CAPITAL_SOURCE,
  estimate,
  forIndustry,
  industryForSic,
  industryNames,
  investigationIndustry,
  sectorForIndustry,
} from "@/lib/studio-project/cost-of-capital";
import type { RoicDecomposition } from "@/lib/studio-project/roic";
import { useStudioProject } from "@/lib/use-studio-project";
import { useStudioMode } from "@/lib/studio-mode";
import {
  addInvestigatedCompany,
  newInvestigationId,
  removeInvestigation,
  removePosition,
  saveInvestigation,
  setCandidateStatus,
  startCandidate,
} from "@/lib/studio-project/operations";
import { latestInvestigation, type LearnerInstrument } from "@/lib/studio-project/schema";
import { Field, Panel, StageHeading } from "./shared";

/** What the learner is told about their work being kept. */
type SaveNote =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

/**
 * One company, seven figures the learner looked up, and what they mean.
 *
 * Studio does not hold every company's financials. The learner brings the
 * numbers for the business they care about; this surface says which ones matter
 * and where to find them, catches what is typed wrong, and interprets the
 * result against real peers and a real cost of capital.
 *
 * Three kinds of value appear here and are deliberately styled apart, because a
 * learner mistaking their own guess for a filed fact is the central danger:
 * what they looked up, what Studio calculated, and what is assumed.
 */

const pct = (value: number, digits = 1) => `${(value * 100).toFixed(digits)}%`;

/** The industries Studio has already researched, with peers to compare against. */
const RESEARCHED = industriesData.industries.map((entry) => ({
  sic: entry.sic,
  label: entry.label,
  peers: (entry.roic ?? []).filter((row): row is typeof row & { roic: number; nopatMargin: number; capitalTurnover: number } =>
    typeof row.roic === "number" && typeof row.nopatMargin === "number" && typeof row.capitalTurnover === "number",
  ),
}));

/**
 * The researched peer sets, found by the industry the learner picked.
 *
 * Two lists of different sizes meet here. Ninety-six industries have a
 * published cost of capital, which is the figure the whole investigation turns
 * on, and five of them have peer figures built from filings. Until now the
 * picker offered only those five, so a company in any other industry could not
 * be investigated at all — the scarcer fact was gating the commoner one.
 */
const PEERS_BY_INDUSTRY = new Map(
  RESEARCHED.flatMap((entry) => {
    const name = industryForSic(entry.sic);
    return name ? ([[name, entry]] as const) : [];
  }),
);

/**
 * Where someone starts before they have said what the business does.
 *
 * The whole market rather than a plausible-looking industry: a beginner who has
 * not chosen yet should be reading their company against everything, not
 * against semiconductors because it sorted first. Financials are excluded from
 * it because their cost of capital is built on a different capital structure.
 */
const DEFAULT_INDUSTRY = "Total Market (without financials)";

/**
 * The two a company the learner found can be.
 *
 * Not the whole asset-class list: a bond issue and a fund are things Studio
 * researches and carries, not things someone types seven figures into an
 * annual report for.
 */
const ASSET_CLASSES = [
  { value: "us-equity" as const, label: "A US-listed company" },
  { value: "international-equity" as const, label: "Listed outside the US" },
];

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** How long typing settles before a save. Short enough to survive a stray click. */
const SAVE_DELAY_MS = 600;

export default function InvestigateView() {
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState(DEFAULT_INDUSTRY);
  const [entries, setEntries] = useState<Entries>({});
  const [riskFree, setRiskFree] = useState<string>("");
  const [openHint, setOpenHint] = useState<FigureKey | null>(null);

  /*
   * The work is saved as it is typed.
   *
   * There is no save button on purpose. This surface is where a learner copies
   * seven numbers out of an annual report, and asking them to press something
   * afterwards is how the numbers get lost -- which is the failure this exists
   * to remove. Storage is the same versioned, conflict-checked project record
   * the rest of Studio uses; nothing here writes its own store.
   */
  /*
   * The same portfolio the workspace has open, not a second one.
   *
   * This asked for `personal` while the workspace read `practice`, so a company
   * investigated here was filed against a record the rest of Studio could not
   * see -- and the workspace's overview linked to this page directly beneath a
   * summary of holdings it would never show.
   */
  // Set when a filing hands a company over. Read once, on the first open.
  const requestedCompany = useSearchParams().get("company")?.trim() ?? "";
  const { mode } = useStudioMode();
  const project = useStudioProject(mode);
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<SaveNote>({ kind: "idle" });
  const [assetClass, setAssetClass] = useState<LearnerInstrument["assetClass"]>("us-equity");
  const [addNote, setAddNote] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const hydrated = useRef(false);
  /*
   * The latest edit and the latest session, readable from a timer that captured
   * an older render.
   *
   * Both are refs so `flush` can stay identity-stable. Depending on the session
   * directly would rebuild `flush` on every render -- and the debounce effect
   * depends on `flush`, so its timer would be cleared and restarted each time,
   * which is the one way to make an autosave that never fires.
   */
  const editRef = useRef({ company, industry, entries, riskFree });
  editRef.current = { company, industry, entries, riskFree };
  const sessionRef = useRef(project);
  sessionRef.current = project;
  /*
   * Which record is being written, held synchronously.
   *
   * This cannot come from state. `setInvestigationId` does not take effect
   * until React re-renders, so two saves firing before that -- a debounce and a
   * blur landing together, say -- would both read null, both mint an id, and
   * write the same company twice. That is not hypothetical: it produced a
   * duplicate for every company entered during browser testing. The ref is
   * assigned before any await, so the second save sees the first one's id.
   */
  const idRef = useRef<string | null>(null);

  // Reopen what the learner last worked on, once, when the project opens.
  useEffect(() => {
    if (hydrated.current || project.status !== "ready" || !project.project) return;
    hydrated.current = true;

    /*
     * Arriving from a filing, with the company named in the address.
     *
     * Reopening the last company here would be actively wrong: someone who has
     * just read Netflix's annual report and pressed a button that says so does
     * not want the business they were looking at on Tuesday. An investigation
     * of that company already on file is reopened rather than duplicated, and
     * only the name is carried across — the figures are the learner's to read
     * out of the document, which is the exercise.
     */
    if (requestedCompany) {
      const existing = project.project.investigations.find(
        (item) => item.company.trim().toLowerCase() === requestedCompany.trim().toLowerCase(),
      );
      if (existing) {
        idRef.current = existing.id;
        setInvestigationId(existing.id);
        setCompany(existing.company);
        setIndustry(investigationIndustry(existing) ?? DEFAULT_INDUSTRY);
        setEntries(existing.figures as Entries);
        setRiskFree(existing.riskFreePct === null ? "" : String(existing.riskFreePct));
        setSaveNote({ kind: "saved" });
      } else {
        setCompany(requestedCompany);
      }
      return;
    }

    const saved = latestInvestigation(project.project);
    if (!saved) return;
    idRef.current = saved.id;
    setInvestigationId(saved.id);
    setCompany(saved.company);
    // An industry Studio no longer researches would leave the select showing
    // one thing and reading against another, so it falls back rather than lies.
    setIndustry(investigationIndustry(saved) ?? DEFAULT_INDUSTRY);
    setEntries(saved.figures as Entries);
    setRiskFree(saved.riskFreePct === null ? "" : String(saved.riskFreePct));
    setSaveNote({ kind: "saved" });
    // `requestedCompany` is read above; the `hydrated` guard is what keeps this
    // to one run, not the dependency list.
  }, [project.status, project.project, requestedCompany]);

  const flush = useCallback(async () => {
    const edit = editRef.current;
    const session = sessionRef.current;
    // An empty visit is not work. Saving it would leave a nameless, figureless
    // record behind for anyone who merely opened the page.
    if (edit.company.trim() === "" && Object.keys(edit.entries).length === 0) return;
    if (session.status !== "ready") return;
    const id = idRef.current ?? newInvestigationId();
    idRef.current = id;
    setInvestigationId(id);
    setSaveNote({ kind: "saving" });
    const rate = edit.riskFree.trim() === "" ? null : Number(edit.riskFree);
    const result = await session.update((current) =>
      saveInvestigation(current, {
        company: edit.company,
        industry: edit.industry,
        // Only set where peers exist, because that is all a SIC is used for
        // here. Storing one for an industry with no peer figures would imply a
        // comparison that cannot be made.
        sic: PEERS_BY_INDUSTRY.get(edit.industry)?.sic ?? "",
        figures: edit.entries as Record<string, number>,
        riskFreePct: rate !== null && Number.isFinite(rate) ? rate : null,
      }, id),
    );
    setSaveNote(result.ok ? { kind: "saved" } : { kind: "error", message: result.error });
  }, []);

  // Save after typing settles. Hydration must not trigger one of its own.
  useEffect(() => {
    if (!hydrated.current) return;
    const timer = setTimeout(() => void flush(), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [company, industry, entries, riskFree, flush]);

  /* Most recently touched first, which is the order they were last cared about. */
  const saved = useMemo(
    () => [...(project.project?.investigations ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [project.project],
  );

  /**
   * Put one company on screen.
   *
   * The outgoing one is written first. Switching is exactly the moment a
   * half-typed figure would otherwise be dropped, and losing it here would be a
   * worse version of the bug this whole surface exists to fix.
   */
  const open = useCallback(async (id: string) => {
    await flush();
    const target = sessionRef.current.project?.investigations.find((item) => item.id === id);
    if (!target) return;
    idRef.current = target.id;
    setInvestigationId(target.id);
    setCompany(target.company);
    setIndustry(investigationIndustry(target) ?? DEFAULT_INDUSTRY);
    setEntries(target.figures as Entries);
    setRiskFree(target.riskFreePct === null ? "" : String(target.riskFreePct));
    setOpenHint(null);
    setSaveNote({ kind: "saved" });
  }, [flush]);

  /** A blank sheet. Nothing is written until something is actually entered. */
  const startNew = useCallback(async () => {
    await flush();
    idRef.current = null;
    setInvestigationId(null);
    setCompany("");
    setEntries({});
    setRiskFree("");
    setOpenHint(null);
    setSaveNote({ kind: "idle" });
  }, [flush]);

  /**
   * Forget one company, on purpose and with a confirmation.
   *
   * Everything else on this page saves silently, so deletion is the one action
   * that cannot be undone by carrying on typing. It asks first.
   */
  const forget = useCallback(async (id: string, label: string) => {
    if (!window.confirm(`Delete ${label}? The figures you entered for it will be gone.`)) return;
    const result = await sessionRef.current.update((current) => removeInvestigation(current, id));
    if (!result.ok) { setSaveNote({ kind: "error", message: result.error }); return; }
    if (idRef.current !== id) return;
    // The open one just went. Show the next most recent, or a blank sheet.
    const next = sessionRef.current.project?.investigations
      .filter((item) => item.id !== id)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    if (next) await open(next.id);
    else await startNew();
  }, [open, startNew]);

  /*
   * Peers are a bonus, not a requirement.
   *
   * Five industries have them and ninety-six do not, so this is undefined most
   * of the time — which `checkEntries` and `read` already allow for. What the
   * learner loses without it is the sanity check against a median, not the
   * answer: the return on capital and the cost it is judged against are both
   * still there.
   */
  const researched = PEERS_BY_INDUSTRY.get(industry);
  const sector = sectorForIndustry(industry);

  const peerContext: PeerContext | undefined = useMemo(() => {
    if (!researched || researched.peers.length < 5) return undefined;
    return {
      industry: researched.label.toLowerCase(),
      medianMargin: median(researched.peers.map((p) => p.nopatMargin)),
      medianTurnover: median(researched.peers.map((p) => p.capitalTurnover)),
      peers: researched.peers as unknown as RoicDecomposition[],
    };
  }, [researched]);

  const industryCost = forIndustry(industry) ?? forIndustry(DEFAULT_INDUSTRY)!;

  const alreadyHeld = (project.project?.instruments ?? []).some(
    (instrument) => instrument.investigationId === investigationId,
  );
  /*
   * There has to be a saved record to point at. The instrument keeps the
   * investigation's id so the figures behind a holding stay findable, and an
   * unsaved investigation has no id to keep.
   */
  const canAdd = Boolean(investigationId) && company.trim() !== "" && project.status === "ready";

  const addToPortfolio = useCallback(async () => {
    const id = idRef.current;
    if (!id) return;
    // Anything typed since the last save goes in first, so the holding is added
    // against the figures on screen rather than the ones from a moment ago.
    await flush();
    setAddNote(null);
    const result = await sessionRef.current.update((current) => addInvestigatedCompany(current, id, assetClass));
    if (!result.ok) setAddNote(`Not added — ${result.error}`);
  }, [assetClass, flush]);

  /*
   * The decision is recorded as a candidate, not on the figures.
   *
   * `FigureInvestigation` is deliberately quantitative — seven numbers read out
   * of a report — and says so: judgements belong on a `CandidateInvestigation`,
   * which exists whether or not anything holds it. So turning a company down
   * opens one for it, which is the schema's own "the two are meant to meet
   * eventually". Nothing new had to be stored to do it.
   */
  const candidateId = investigationId ? `own-${investigationId}` : null;
  const rejectedCandidate = candidateId
    ? project.project?.candidates.find((candidate) => candidate.instrumentId === candidateId)
    : undefined;
  const against = rejectedCandidate?.status === "rejected" ? rejectedCandidate.rejectedBecause : null;

  const decideAgainst = useCallback(async () => {
    const id = idRef.current;
    if (!id) return;
    await flush();
    setAddNote(null);
    const instrumentId = `own-${id}`;
    const reason = rejectReason.trim();
    const result = await sessionRef.current.update((current) =>
      setCandidateStatus(
        removePosition(startCandidate(current, instrumentId), instrumentId),
        instrumentId,
        "rejected",
        reason,
      ),
    );
    if (result.ok) {
      setRejecting(false);
      setRejectReason("");
    } else {
      setAddNote(`Not recorded — ${result.error}`);
    }
  }, [flush, rejectReason]);

  const reconsider = useCallback(async () => {
    const id = idRef.current;
    if (!id) return;
    await sessionRef.current.update((current) => setCandidateStatus(current, `own-${id}`, "researching"));
  }, []);
  const suppliedRate = riskFree.trim() === "" ? undefined : Number(riskFree) / 100;
  const cost = estimate(industryCost, Number.isFinite(suppliedRate) ? suppliedRate : undefined);

  const checks = checkEntries(entries, sector, peerContext);
  const stops = checks.filter((c) => c.severity === "stop");
  const questions = checks.filter((c) => c.severity === "question");
  const reading = stops.length ? { blocked: stops[0].message } : read(entries, sector, cost.costOfCapital, peerContext);

  const set = (key: FigureKey, raw: string) =>
    setEntries((current) => {
      const next = { ...current };
      if (raw.trim() === "") delete next[key];
      else if (Number.isFinite(Number(raw))) next[key] = Number(raw);
      return next;
    });

  const flagged = new Set(checks.flatMap((c) => c.figures));

  return (
    <div className="space-y-4">
      <Link href="/studio" className="inline-block text-[13px] text-st-faint hover:text-st-sub">
        ← Back to your plan
      </Link>

      <StageHeading title="Is this business creating value?">
        Look up seven figures for a company you care about. Studio says which ones matter, checks
        what you typed, and tells you what the answer means against real competitors.
      </StageHeading>

      {/*
        * One row, and it scrolls sideways rather than wrapping.
        *
        * This page is already over the screen budget, so a list of companies
        * cannot cost vertical space that grows with how much work you have
        * done -- the more you use it, the worse that would get.
        */}
      {saved.length > 0 && (
        <nav aria-label="Companies you have looked at" className="-mx-1 overflow-x-auto px-1 pb-1">
          <ul className="flex items-center gap-2">
            {saved.map((item) => {
              const active = item.id === investigationId;
              const label = item.company.trim() || "Unnamed company";
              return (
                <li key={item.id} className="flex-shrink-0">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full border text-[13px] transition-colors",
                      active
                        ? "border-st-blue-edge bg-st-blue-soft text-st-ink"
                        : "border-st-hair bg-st-paper text-st-sub hover:border-st-bound hover:text-st-ink",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => void open(item.id)}
                      aria-current={active ? "true" : undefined}
                      className="min-h-11 rounded-full px-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-st-blue-edge"
                    >
                      {label}
                      <span className="ml-2 text-[11px] text-st-faint">
                        {Object.keys(item.figures).length}/{FIGURES.length}
                      </span>
                    </button>
                    {/*
                      * Only on the company in hand. On every chip it would be a
                      * row of delete buttons a thumb can hit by accident, and
                      * hiding them until hover fails on touch entirely.
                      */}
                    {active && (
                      <button
                        type="button"
                        onClick={() => void forget(item.id, label)}
                        aria-label={`Delete ${label}`}
                        className="min-h-11 rounded-full pl-1 pr-3 text-st-muted hover:text-st-warn focus:outline-none focus-visible:ring-2 focus-visible:ring-st-warn-edge"
                      >
                        ×
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
            <li className="flex-shrink-0">
              <button
                type="button"
                onClick={() => void startNew()}
                className="min-h-11 rounded-full border border-dashed border-st-bound px-3.5 text-[13px] text-st-muted transition-colors hover:border-st-bound hover:text-st-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-st-blue-edge"
              >
                + Another company
              </button>
            </li>
          </ul>
        </nav>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---------------------------------------------------------- entry */}
        <Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="ops-caption text-[11px] text-st-faint">Company</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                onBlur={() => void flush()}
                placeholder="The one you want to understand"
                className="mt-1 w-full rounded-lg border border-st-hair bg-st-paper px-3 py-2 text-[14px] text-st-ink placeholder:text-st-faint focus:border-st-blue-edge focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="ops-caption text-[11px] text-st-faint">Industry</span>
              <select
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="mt-1 w-full rounded-lg border border-st-hair bg-st-paper px-3 py-2 text-[14px] text-st-ink focus:border-st-blue-edge focus:outline-none"
              >
                {industryNames().map((name) => (
                  <option key={name} value={name} className="bg-slate-900">
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Said rather than left to be noticed. The comparison simply does not
              appear for most industries, and an absence explains nothing on its
              own — a learner would reasonably read it as their figures being
              wrong rather than as data Studio has not built yet. */}
          <p className="mt-3 text-[13px] leading-6 text-st-muted">
            {researched
              ? `Studio has figures for ${researched.peers.length} companies in this industry, so your result is placed against them below.`
              : "Studio has not built peer figures for this industry yet, so there is no median to place your company against. The return on capital and what the money costs are still worked out in full."}
          </p>

          <p className="mt-4 text-[13px] leading-6 text-st-muted">
            All seven come from one annual report. Click a name to see where it sits and what other
            sites call it.
          </p>

          <div className="mt-3 space-y-2">
            {FIGURES.map((figure) => {
              const open = openHint === figure.key;
              const marked = flagged.has(figure.key);
              return (
                <div key={figure.key}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenHint(open ? null : figure.key)}
                      aria-expanded={open}
                      className="min-w-[150px] shrink-0 text-left text-[13px] text-st-sub hover:text-st-ink"
                    >
                      {figure.label}
                      <span className="ml-1 text-st-faint">?</span>
                    </button>
                    <input
                      inputMode="decimal"
                      value={entries[figure.key] ?? ""}
                      onChange={(event) => set(figure.key, event.target.value)}
                      onBlur={() => void flush()}
                      placeholder="0"
                      aria-label={figure.label}
                      className={cn(
                        "w-full rounded-lg border bg-st-paper px-3 py-1.5 text-right text-[14px] tabular-nums text-st-ink placeholder:text-st-faint focus:outline-none",
                        marked ? "border-st-warn-edge" : "border-st-hair focus:border-st-blue-edge",
                      )}
                    />
                  </div>
                  {open ? (
                    <p className="mt-1 pl-[158px] text-[12px] leading-5 text-st-faint">
                      {figure.whatItIs} On the {figure.statement}. Also called{" "}
                      {figure.alsoCalled.join(", ")}.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-[12px] leading-5 text-st-faint">
            Use the same units throughout — all millions, or all billions. Studio only compares them
            with each other.
          </p>

          {checks.length ? (
            <div className="mt-4 space-y-2">
              {[...stops, ...questions].map((check, index) => (
                <p
                  key={index}
                  className={cn(
                    "rounded-lg border p-3 text-[13px] leading-6",
                    check.severity === "stop"
                      ? "border-st-bad-edge bg-st-bad-soft text-st-body"
                      : "border-st-warn-edge bg-st-warn-soft text-st-sub",
                  )}
                >
                  {check.message}
                </p>
              ))}
            </div>
          ) : null}
        </Panel>

        {/* -------------------------------------------------------- reading */}
        <div className="space-y-4">
          <Panel>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-st-ink">What the money costs</h3>
              <span className="text-[20px] font-semibold tabular-nums text-st-ink">{pct(cost.costOfCapital, 2)}</span>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-st-muted">
              No company reports this — it has to be estimated. A return above it means the business
              creates value; below it, the money would do better elsewhere.
            </p>

            <label className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-st-muted">
              <span>Government borrowing rate</span>
              <input
                inputMode="decimal"
                value={riskFree}
                onChange={(event) => setRiskFree(event.target.value)}
                onBlur={() => void flush()}
                placeholder={(COST_OF_CAPITAL_SOURCE.impliedRiskFreeRate * 100).toFixed(2)}
                className="w-20 rounded-lg border border-st-hair bg-st-paper px-2 py-1 text-right text-[13px] tabular-nums text-st-ink placeholder:text-st-faint focus:border-st-blue-edge focus:outline-none"
              />
              <span>%</span>
            </label>

            <details className="mt-3">
              <summary className="cursor-pointer text-[12px] text-st-faint">Where this number comes from</summary>
              <ul className="mt-2 space-y-1 text-[12px] leading-5 text-st-faint">
                {cost.provenance.map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </details>
          </Panel>

          {"blocked" in reading ? (
            <Panel>
              <p className="text-[13px] leading-6 text-st-faint">{reading.blocked}</p>
            </Panel>
          ) : (
            <>
              <Panel>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-st-ink">
                    {company.trim() || "This business"} earns
                  </h3>
                  <span
                    className={cn(
                      "text-[24px] font-semibold tabular-nums",
                      reading.createsValue ? "text-st-good" : "text-st-bad",
                    )}
                  >
                    {pct(reading.decomposition.roic)}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {reading.says.map((line, index) => (
                    <p key={index} className="text-[13px] leading-6 text-st-sub">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="mt-3 text-[12px] leading-5 text-st-faint">
                  Calculated from what you entered — not a figure any company reports.
                </p>
              </Panel>

              <Panel>
                <h3 className="text-[14px] font-semibold text-st-ink">What this cannot tell you</h3>
                <ul className="mt-2 space-y-2">
                  {reading.cannotTell.map((line, index) => (
                    <li key={index} className="text-[12px] leading-5 text-st-faint">
                      {line}
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          )}
        </div>
      </div>

      {/*
        * Where the research becomes a decision.
        *
        * Until this existed, reading a company's annual report and building a
        * portfolio were separate activities that could not reach each other:
        * Studio would investigate any business and would hold any of eight, and
        * those were different sets. The work ended on a screen the portfolio
        * could not see.
        */}
      <Panel>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <h3 className="text-[15px] font-semibold text-st-ink">Put this company in your portfolio</h3>
          {alreadyHeld ? (
            <span className="text-[13px] text-st-good">Already in your portfolio</span>
          ) : null}
        </div>
        <p className="mt-2 text-[13px] leading-6 text-st-muted">
          It joins at nothing, so nothing moves until you decide how much to hold in step 3. Your
          figures stay here, and the reason you would own it is asked for in step 2.
        </p>

        {alreadyHeld ? null : (
          <>
            {/*
              * Asked, not guessed. An investment whose kind Studio does not know
              * is dealt a zero in the scenario test — so a wrong guess here does
              * not show up as an error, it quietly leaves this holding out of the
              * fall and reports a smaller loss than the portfolio would take.
              */}
            <fieldset className="mt-4">
              <legend className="ops-caption text-[11px] text-st-faint">Where it trades</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {ASSET_CLASSES.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "min-h-11 cursor-pointer rounded-full border px-4 text-[13px] leading-[2.75rem]",
                      assetClass === option.value
                        ? "border-st-blue-edge bg-st-blue-soft text-st-blue"
                        : "border-st-bound text-st-body",
                    )}
                  >
                    <input
                      type="radio"
                      name="asset-class"
                      className="sr-only"
                      checked={assetClass === option.value}
                      onChange={() => setAssetClass(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-[12px] leading-5 text-st-faint">
                This decides which fall in your scenario test applies to it.
              </p>
            </fieldset>

            <button
              type="button"
              disabled={!canAdd}
              onClick={() => void addToPortfolio()}
              className="mt-4 min-h-11 rounded-full border border-st-blue-edge bg-st-blue-soft px-5 text-[14px] font-semibold text-st-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              Add {company.trim() || "this company"} to your portfolio
            </button>
            {!canAdd ? (
              <p className="mt-2 text-[12px] leading-5 text-st-faint">
                Give the company a name and save a figure first, so there is something to add.
              </p>
            ) : null}
          </>
        )}
        {addNote ? <p className="mt-3 text-[13px] leading-6 text-st-warn">{addNote}</p> : null}

        {/*
          * Deciding against it is a result, not the absence of one.
          *
          * A company can be worth the afternoon it took to read and still not be
          * worth owning, and that conclusion is the one most worth keeping — it
          * is the only one a learner can check later against what actually
          * happened. Sitting beside "add", because they are the two honest ends
          * of the same piece of work rather than a success and a failure.
          */}
        <div className="mt-5 border-t border-st-hair pt-4">
          {against !== null ? (
            <>
              <div className="ops-caption text-[11px] text-st-faint">You decided against this</div>
              <p className="mt-1 text-[14px] leading-6 text-st-sub">{against}</p>
              <button
                type="button"
                onClick={() => void reconsider()}
                className="mt-2 min-h-11 text-[14px] font-semibold text-st-blue underline underline-offset-2"
              >
                Put it back on the table
              </button>
            </>
          ) : rejecting ? (
            <>
              <Field
                label="Why it is not for you"
                hint="Kept with these figures, so you can check later whether it still holds."
                value={rejectReason}
                onChange={setRejectReason}
                placeholder="It earns less than its capital costs and I could not see that changing…"
                multiline
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!rejectReason.trim() || !canAdd}
                  onClick={() => void decideAgainst()}
                  className="min-h-11 rounded-full border border-st-bound px-5 text-[14px] font-semibold text-st-body disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Record this decision
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(false);
                    setRejectReason("");
                  }}
                  className="min-h-11 px-2 text-[14px] text-st-muted"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="min-h-11 text-[13px] text-st-muted underline underline-offset-2 hover:text-st-ink"
            >
              Decide against this company
            </button>
          )}
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-[12px] leading-5 text-st-faint">
          Peer figures come from company filings; the cost of capital from Aswath Damodaran, NYU
          Stern.
        </p>
        {/*
          * Polite, because a save is not news the learner asked for. It becomes
          * assertive only on failure, which is the one case worth interrupting
          * for -- work they can still see on screen is not yet kept.
          */}
        <p
          aria-live={saveNote.kind === "error" ? "assertive" : "polite"}
          className={cn(
            "text-[12px] leading-5",
            saveNote.kind === "error" ? "text-st-warn" : "text-st-faint",
          )}
        >
          {saveNote.kind === "saving" && "Saving…"}
          {saveNote.kind === "saved" && "Saved in this browser"}
          {saveNote.kind === "error" && `Not saved — ${saveNote.message}`}
        </p>
      </div>
    </div>
  );
}
