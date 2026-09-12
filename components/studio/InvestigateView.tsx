"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import industriesData from "@/lib/studio-project/data/industries.json";
import { checkEntries, FIGURES, read, type Entries, type FigureKey, type PeerContext } from "@/lib/studio-project/investigate";
import { TREASURY_RATE, estimate, forSic, industryNames, forIndustry, longDate } from "@/lib/studio-project/cost-of-capital";
import type { RoicDecomposition, RoicSector } from "@/lib/studio-project/roic";
import { newInvestigationId, removeInvestigation, saveInvestigation } from "@/lib/studio-project/operations";
import { latestInvestigation, type FigureSource } from "@/lib/studio-project/schema";
import type { MissingFigure, SuppliedFigure } from "@/lib/studio-project/prefill";
import { Panel, StageHeading } from "./shared";
import StudioAside from "./workspace/StudioAside";
import { useWorkspace } from "./workspace/WorkspaceProvider";

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

const SECTOR_BY_SIC: Record<string, RoicSector> = {
  "3674": "general", "7372": "general", "5331": "general", "4011": "transport", "2834": "general",
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** How long typing settles before a save. Short enough to survive a stray click. */
const SAVE_DELAY_MS = 600;

/** A date as a person writes it, for a filing period a learner has to recognise. */
const readableDate = (iso: string): string => {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

/** What the SEC lookup is doing, so the button can say so rather than just sit there. */
type Lookup = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

export default function InvestigateView() {
  const [company, setCompany] = useState("");
  const [sic, setSic] = useState(RESEARCHED[0].sic);
  const [entries, setEntries] = useState<Entries>({});
  const [riskFree, setRiskFree] = useState<string>("");
  const [openHint, setOpenHint] = useState<FigureKey | null>(null);
  /*
   * Where the figures came from, when they were filled in from a filing.
   *
   * Saved with the record, because "every supplied figure shows where it came
   * from" has to survive closing the tab. What is *not* saved is the list of
   * figures the SEC could not supply: those are the empty boxes, which say it
   * themselves, and the reasons are only worth the words in the visit that
   * fetched them.
   */
  const [source, setSource] = useState<FigureSource | null>(null);
  const [couldNotFill, setCouldNotFill] = useState<MissingFigure[]>([]);
  const [lookup, setLookup] = useState<Lookup>({ kind: "idle" });

  /*
   * The work is saved as it is typed.
   *
   * There is no save button on purpose. This surface is where a learner copies
   * seven numbers out of an annual report, and asking them to press something
   * afterwards is how the numbers get lost -- which is the failure this exists
   * to remove. Storage is the same versioned, conflict-checked project record
   * the rest of Studio uses; nothing here writes its own store.
   */
  const { session: project, setDraft } = useWorkspace();
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState<SaveNote>({ kind: "idle" });
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
  const editRef = useRef({ company, sic, entries, riskFree, source });
  editRef.current = { company, sic, entries, riskFree, source };
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
    // Overview links name the company to open; otherwise reopen the one last touched.
    const wanted = new URLSearchParams(window.location.search).get("company");
    const saved = project.project.investigations.find((item) => item.id === wanted) ?? latestInvestigation(project.project);
    if (!saved) return;
    idRef.current = saved.id;
    setInvestigationId(saved.id);
    setCompany(saved.company);
    // An industry Studio no longer researches would leave the select showing
    // one thing and reading against another, so it falls back rather than lies.
    if (RESEARCHED.some((entry) => entry.sic === saved.sic)) setSic(saved.sic);
    setEntries(saved.figures as Entries);
    setRiskFree(saved.riskFreePct === null ? "" : String(saved.riskFreePct));
    setSource(saved.source ?? null);
    setSaveNote({ kind: "saved" });
  }, [project.status, project.project]);

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
        sic: edit.sic,
        figures: edit.entries as Record<string, number>,
        riskFreePct: rate !== null && Number.isFinite(rate) ? rate : null,
        source: edit.source,
      }, id),
    );
    setSaveNote(result.ok ? { kind: "saved" } : { kind: "error", message: result.error });
  }, []);

  // Save after typing settles. Hydration must not trigger one of its own.
  // Until then the project bar says "Saving…": an edit that exists only on
  // this page is not yet kept, and must not be reported as saved.
  useEffect(() => {
    if (!hydrated.current) return;
    setDraft(true);
    const timer = setTimeout(() => void flush().finally(() => setDraft(false)), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [company, sic, entries, riskFree, source, flush, setDraft]);

  // Leaving for another section inside the typing pause would drop the last
  // edit. The workspace keeps the session open, so write it on the way out.
  useEffect(
    () => () => {
      void flush().finally(() => setDraft(false));
    },
    [flush, setDraft],
  );

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
    if (RESEARCHED.some((entry) => entry.sic === target.sic)) setSic(target.sic);
    setEntries(target.figures as Entries);
    setRiskFree(target.riskFreePct === null ? "" : String(target.riskFreePct));
    setSource(target.source ?? null);
    setCouldNotFill([]);
    setLookup({ kind: "idle" });
    setOpenHint(null);
    setSaveNote({ kind: "saved" });
  }, [flush]);

  /**
   * Fill the seven boxes from what the company filed with the SEC.
   *
   * The lookup runs on the server: `data.sec.gov`'s company-facts endpoint sends
   * no cross-origin header, and a browser cannot set the User-Agent the SEC's
   * fair-access policy asks for. So this asks Studio's own route, which fetches
   * identified and returns the seven numbers rather than the two megabytes they
   * were read out of.
   *
   * Typed work is never replaced without asking. Figures already filled in from
   * a filing are another matter -- looking up a second time is how a learner
   * corrects a mistyped ticker, and pausing to confirm that would be noise.
   */
  const fill = useCallback(async () => {
    /*
     * One box holds both the company's name and the ticker to look up, because
     * two boxes for one company is a question a learner should not have to
     * answer twice. A successful lookup writes EDGAR's name into it -- "Atkore
     * Inc." -- so a second press must recognise that as the company already
     * found rather than send it back as a ticker, while a name that matches
     * nothing still asks for a symbol instead of quietly refetching the last one.
     */
    const typed = company.trim();
    const symbol = /^[A-Za-z0-9.-]{1,12}$/.test(typed)
      ? typed
      : source && typed === source.entityName
        ? source.ticker
        : "";
    if (!symbol) {
      setLookup({
        kind: "error",
        message: typed
          ? `Studio looks companies up by ticker symbol, and "${typed}" is not one. Atkore's is ATKR.`
          : "Type the company's ticker symbol first — Atkore's is ATKR.",
      });
      return;
    }
    const typedByHand = Object.keys(entries).some((key) => !source || !(key in source.figures));
    if (typedByHand && !window.confirm(`Replace the figures with ${symbol.toUpperCase()}'s own, as filed? What you typed will be gone.`)) {
      return;
    }

    setLookup({ kind: "loading" });
    let body: {
      error?: string;
      ticker?: string;
      cik?: string;
      entityName?: string;
      sic?: string;
      sicDescription?: string;
      periodEnd?: string;
      supplied?: SuppliedFigure[];
      missing?: MissingFigure[];
      filing?: { accession: string; form: string; filed: string } | null;
    };
    try {
      const response = await fetch(`/api/studio/company-figures?ticker=${encodeURIComponent(symbol)}`);
      body = await response.json();
      if (!response.ok) {
        setLookup({ kind: "error", message: body.error ?? "The SEC could not be reached just now." });
        return;
      }
    } catch {
      setLookup({ kind: "error", message: "The SEC could not be reached just now. Type the figures from the annual report instead." });
      return;
    }

    const supplied = body.supplied ?? [];
    if (!supplied.length) {
      setLookup({
        kind: "error",
        message: `Nothing could be read from ${body.entityName ?? symbol.toUpperCase()}'s filings for the year ending ${body.periodEnd ?? "the latest period"}. Type the seven from the annual report.`,
      });
      setCouldNotFill(body.missing ?? []);
      return;
    }

    const filled: Entries = {};
    const figures: FigureSource["figures"] = {};
    for (const figure of supplied) {
      filled[figure.key] = figure.value;
      figures[figure.key] = { concepts: figure.concepts, addedUp: figure.addedUp };
    }

    setEntries(filled);
    setSource({
      ticker: body.ticker ?? symbol.toUpperCase(),
      cik: body.cik ?? "",
      entityName: body.entityName ?? "",
      sic: body.sic ?? "",
      sicDescription: body.sicDescription ?? "",
      periodEnd: body.periodEnd ?? "",
      accession: body.filing?.accession ?? "",
      form: body.filing?.form ?? "",
      filed: body.filing?.filed ?? "",
      figures,
    });
    // EDGAR's name for the company, which is the one on the filing the figures
    // came from, so the two agree on screen.
    if (body.entityName) setCompany(body.entityName);
    // Only where Studio has actually researched that industry. Where it has not,
    // the select keeps what it had and the page says so rather than pretending.
    if (body.sic && RESEARCHED.some((entry) => entry.sic === body.sic)) setSic(body.sic);
    setCouldNotFill(body.missing ?? []);
    setLookup({ kind: "idle" });
  }, [company, entries, source]);

  /** A blank sheet. Nothing is written until something is actually entered. */
  const startNew = useCallback(async () => {
    await flush();
    idRef.current = null;
    setInvestigationId(null);
    setCompany("");
    setEntries({});
    setRiskFree("");
    setSource(null);
    setCouldNotFill([]);
    setLookup({ kind: "idle" });
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

  const researched = RESEARCHED.find((entry) => entry.sic === sic)!;
  const sector = SECTOR_BY_SIC[sic] ?? "general";

  const peerContext: PeerContext | undefined = useMemo(() => {
    if (researched.peers.length < 5) return undefined;
    return {
      industry: researched.label.toLowerCase(),
      medianMargin: median(researched.peers.map((p) => p.nopatMargin)),
      medianTurnover: median(researched.peers.map((p) => p.capitalTurnover)),
      peers: researched.peers as unknown as RoicDecomposition[],
    };
  }, [researched]);

  const industryCost = forSic(sic) ?? forIndustry(industryNames()[0])!;
  const typedRate = riskFree.trim() === "" ? undefined : Number(riskFree) / 100;
  const learnerRate = typedRate !== undefined && Number.isFinite(typedRate) ? typedRate : undefined;
  // With nothing typed, the rate is the Treasury's latest 10-year auction, dated and
  // sourced, rather than the older one inside the source's January figures.
  const cost =
    learnerRate === undefined
      ? estimate(industryCost, TREASURY_RATE.rate, "treasury")
      : estimate(industryCost, learnerRate, "learner");

  const checks = checkEntries(entries, sector, peerContext);
  const stops = checks.filter((c) => c.severity === "stop");
  const questions = checks.filter((c) => c.severity === "question");
  const reading = stops.length ? { blocked: stops[0].message } : read(entries, sector, cost.costOfCapital, peerContext);

  const set = (key: FigureKey, raw: string) => {
    setEntries((current) => {
      const next = { ...current };
      if (raw.trim() === "") delete next[key];
      else if (Number.isFinite(Number(raw))) next[key] = Number(raw);
      return next;
    });
    /*
     * Touching a figure makes it the learner's own.
     *
     * The moment a box is edited it is no longer what the company filed, so its
     * provenance goes with it -- keeping the tag beside a number the learner
     * changed would be the worst kind of wrong: a false source note on a figure
     * they have every right to overrule. When the last one goes, so does the
     * filing reference, because nothing on the page comes from it any more.
     */
    setSource((current) => {
      if (!current || !(key in current.figures)) return current;
      const figures = { ...current.figures };
      delete figures[key];
      return Object.keys(figures).length ? { ...current, figures } : null;
    });
  };

  const flagged = new Set(checks.flatMap((c) => c.figures));

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="text-[13px] text-slate-500">
        <Link href="/studio/research" className="text-accent-cyan hover:underline">
          Research
        </Link>
        <span aria-hidden="true"> › </span>
        <span>Investigate a company</span>
      </nav>

      <StageHeading as="h1" title="Is this business creating value?">
        Look up seven figures from one annual report, then read them against real competitors.
      </StageHeading>

      {/*
        * One row, and it scrolls sideways rather than wrapping.
        *
        * A list of companies cannot cost vertical space that grows with how much
        * work you have done -- the more you use the page, the worse that would get.
        *
        * The row is always there, holding the company in hand even before it is
        * saved. It used to appear with the first save, and a learner who typed a
        * company's name and then clicked a link or a "?" below saw nothing
        * happen: leaving the box saved the record, the row pushed the form down
        * 66px between the press and the release, and the click landed on empty
        * space (found 2026-09-10). The placeholder is a label, not a button,
        * because there is nothing to open or delete until it is saved.
        */}
      <nav aria-label="Companies you have looked at" className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex items-center gap-2">
          {!saved.some((item) => item.id === investigationId) ? (
            <li className="flex-shrink-0">
              <span
                aria-current="true"
                className="inline-flex min-h-11 items-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-3.5 text-[13px] text-white"
              >
                {company.trim() || "New company"}
                <span className="ml-2 text-[11px] text-slate-500">
                  {Object.keys(entries).length}/{FIGURES.length}
                </span>
              </span>
            </li>
          ) : null}
          {saved.map((item) => {
            const active = item.id === investigationId;
            const label = item.company.trim() || "Unnamed company";
            return (
              <li key={item.id} className="flex-shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border text-[13px] transition-colors",
                    active
                      ? "border-accent-cyan/40 bg-accent-cyan/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:text-white",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => void open(item.id)}
                    aria-current={active ? "true" : undefined}
                    className="min-h-11 rounded-full px-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
                  >
                    {label}
                    <span className="ml-2 text-[11px] text-slate-500">
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
                      className="min-h-11 rounded-full pl-1 pr-3 text-slate-400 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                    >
                      ×
                    </button>
                  )}
                </span>
              </li>
            );
          })}
          {/* With nothing saved yet there is no other company to make room for. */}
          {saved.length > 0 ? (
            <li className="flex-shrink-0">
              <button
                type="button"
                onClick={() => void startNew()}
                className="min-h-11 rounded-full border border-dashed border-white/15 px-3.5 text-[13px] text-slate-400 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
              >
                + Another company
              </button>
            </li>
          ) : null}
        </ul>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* ---------------------------------------------------------- entry */}
        <Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="ops-caption text-[11px] text-slate-500">Company</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                onBlur={() => void flush()}
                placeholder="Its ticker, such as ATKR"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[14px] text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="ops-caption text-[11px] text-slate-500">Industry</span>
              <select
                value={sic}
                onChange={(event) => setSic(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[14px] text-white focus:border-accent-cyan/50 focus:outline-none"
              >
                {RESEARCHED.map((entry) => (
                  <option key={entry.sic} value={entry.sic} className="bg-slate-900">
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/*
            * The lookup replaces the paragraph that used to sit here, rather
            * than being added below it, so the first figure box does not move
            * further down the screen. Everything it says, that paragraph said.
            */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              type="button"
              onClick={() => void fill()}
              disabled={lookup.kind === "loading"}
              className="inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3.5 text-[13px] font-semibold text-white transition-colors hover:border-accent-cyan/70 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
            >
              {lookup.kind === "loading" ? "Reading the filing…" : "Fill these from the SEC"}
            </button>
            <p className="text-[13px] leading-6 text-slate-400">
              Or type them from the annual report, which you can open in{" "}
              <Link href="/studio/filings" className="text-accent-cyan hover:underline">
                Company reports
              </Link>
              .
            </p>
          </div>

          {/*
            * Where the figures came from, once they came from somewhere.
            *
            * Absent until a lookup succeeds, so the page at rest is no taller
            * than it was. The tint on a box is explained here rather than left
            * to be guessed, and every supplied box also says it in its label,
            * because colour on its own tells a screen reader nothing.
            */}
          {source ? (
            <div className="mt-3 rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.06] p-3">
              <p className="text-[13px] leading-6 text-slate-200">
                <span className="font-semibold text-white">{source.entityName}</span>
                {source.periodEnd ? ` · the year to ${readableDate(source.periodEnd)}` : null}
                {source.form && source.filed ? ` · from its ${source.form} filed ${readableDate(source.filed)}` : null}
                {source.accession && source.cik ? (
                  <>
                    {" · "}
                    <a
                      href={`https://www.sec.gov/Archives/edgar/data/${source.cik.replace(/^0+/, "")}/${source.accession.replace(/-/g, "")}/${source.accession}-index.htm`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-accent-cyan underline underline-offset-2"
                    >
                      open the filing
                    </a>
                  </>
                ) : null}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-slate-400">
                Highlighted boxes are its own figures. Type over any to use yours.
              </p>
              {/*
                * Atkore files under SIC 3690, mostly battery and EV-charging
                * makers, which is not one of the five industries Studio has
                * researched. Reading its figures against semiconductors without
                * saying so was the one dead end the friction walk found
                * (2026-09-10). It shares this block rather than taking one of
                * its own, which on a phone is 50px of border and padding.
                */}
              {source.sic && !RESEARCHED.some((entry) => entry.sic === source.sic) ? (
                <p className="mt-2 border-t border-accent-cyan/20 pt-2 text-[12px] leading-5 text-accent-amber">
                  The SEC files it under {source.sic}
                  {source.sicDescription ? `, ${source.sicDescription.toLowerCase()}` : null} — not one of
                  the five industries Studio has researched. The peers and the cost of capital below are{" "}
                  {researched.label.toLowerCase()}, so read the comparison with that in mind.
                </p>
              ) : null}
            </div>
          ) : null}

          {lookup.kind === "error" ? (
            <p
              role="alert"
              className="mt-2 rounded-lg border border-accent-amber/30 bg-accent-amber/[0.05] p-3 text-[13px] leading-6 text-slate-300"
            >
              {lookup.message}
            </p>
          ) : null}

          <div className="mt-3 space-y-2">
            {FIGURES.map((figure) => {
              const open = openHint === figure.key;
              const marked = flagged.has(figure.key);
              const filed = source?.figures[figure.key];
              const couldNot = couldNotFill.find((entry) => entry.key === figure.key);
              return (
                <div key={figure.key}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenHint(open ? null : figure.key)}
                      aria-expanded={open}
                      className="min-w-[150px] shrink-0 text-left text-[13px] text-slate-300 hover:text-white"
                    >
                      {figure.label}
                      <span className="ml-1 text-slate-600">?</span>
                    </button>
                    <input
                      inputMode="decimal"
                      value={entries[figure.key] ?? ""}
                      onChange={(event) => set(figure.key, event.target.value)}
                      onBlur={() => void flush()}
                      placeholder="0"
                      /* The tint says where a figure came from; this says it in words. */
                      aria-label={filed ? `${figure.label}, as the company filed it` : figure.label}
                      className={cn(
                        "w-full rounded-lg border px-3 py-1.5 text-right text-[14px] tabular-nums text-white placeholder:text-slate-700 focus:outline-none",
                        marked
                          ? "border-accent-amber/50 bg-white/[0.03]"
                          : filed
                            ? "border-accent-cyan/40 bg-accent-cyan/[0.07] focus:border-accent-cyan/70"
                            : "border-white/10 bg-white/[0.03] focus:border-accent-cyan/50",
                      )}
                    />
                  </div>
                  {open ? (
                    <div className="mt-1 space-y-1 pl-[158px] text-[12px] leading-5 text-slate-500">
                      <p>
                        {figure.whatItIs} On the {figure.statement}. Also called{" "}
                        {figure.alsoCalled.join(", ")}.
                      </p>
                      {/*
                        * The SEC's own viewer pattern: a supplied figure opens to
                        * the tag it was read from and the period it covers, so a
                        * learner can check it against the statement rather than
                        * take it on trust.
                        */}
                      {filed && source ? (
                        <p className="text-slate-400">
                          Read from {source.entityName}&rsquo;s {source.form || "filing"} as{" "}
                          <span className="text-slate-300">{filed.concepts.join(" + ")}</span>
                          {filed.addedUp ? `, which is ${filed.addedUp}` : null}, for the year to{" "}
                          {readableDate(source.periodEnd)}.
                        </p>
                      ) : null}
                      {couldNot ? <p className="text-slate-400">{couldNot.reason}</p> : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/*
            * Which of the seven the filing could not give, named where the empty
            * boxes are rather than in a list somewhere else. Only after a lookup:
            * before one, every box is empty and saying so would be noise.
            */}
          {couldNotFill.length ? (
            <p className="mt-3 text-[12px] leading-5 text-slate-400">
              Not tagged in this filing:{" "}
              {couldNotFill
                .map((entry) => FIGURES.find((figure) => figure.key === entry.key)?.label.toLowerCase() ?? entry.key)
                .join(", ")}
              . Click the name of each to see why, then read it off the statement.
            </p>
          ) : null}

          <p className="mt-3 text-[12px] leading-5 text-slate-600">
            {source
              ? "Every figure is in US dollars, as filed. Keep any you type in the same units."
              : "Use the same units throughout — all millions, or all billions. Studio only compares them with each other."}
          </p>

          {checks.length ? (
            <div className="mt-4 space-y-2">
              {[...stops, ...questions].map((check, index) => (
                <p
                  key={index}
                  className={cn(
                    "rounded-lg border p-3 text-[13px] leading-6",
                    check.severity === "stop"
                      ? "border-accent-red/30 bg-accent-red/[0.06] text-slate-200"
                      : "border-accent-amber/30 bg-accent-amber/[0.05] text-slate-300",
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
              <h3 className="text-[15px] font-semibold text-white">What the money costs</h3>
              <span className="text-[20px] font-semibold tabular-nums text-white">{pct(cost.costOfCapital, 2)}</span>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-slate-400">
              No company reports this — it has to be estimated. A return above it means the business
              creates value; below it, the money would do better elsewhere.
            </p>

            <label className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-slate-400">
              <span>Government borrowing rate</span>
              <input
                inputMode="decimal"
                value={riskFree}
                onChange={(event) => setRiskFree(event.target.value)}
                onBlur={() => void flush()}
                placeholder={TREASURY_RATE.yieldPct.toFixed(2)}
                className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-right text-[13px] tabular-nums text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none"
              />
              <span>%</span>
            </label>
            <p className="mt-1 text-[12px] leading-5 text-slate-500">
              {learnerRate === undefined
                ? `From the Treasury's 10-year auction on ${longDate(TREASURY_RATE.auctionDate)}.`
                : "Your own rate. Clear the box to use the Treasury's."}
            </p>

            <StudioAside
              inline={
                <details className="mt-3">
                  <summary className="cursor-pointer text-[12px] text-slate-500">Where this number comes from</summary>
                  <ul className="mt-2 space-y-1 text-[12px] leading-5 text-slate-500">
                    {cost.provenance.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                </details>
              }
              beside={
                <Panel>
                  <h2 className="text-[14px] font-semibold text-white">Where the cost of capital comes from</h2>
                  <ul className="mt-2 space-y-2 text-[13px] leading-5 text-slate-400">
                    {cost.provenance.map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ul>
                </Panel>
              }
            />
          </Panel>

          {"blocked" in reading ? (
            <Panel>
              <p className="text-[13px] leading-6 text-slate-500">{reading.blocked}</p>
            </Panel>
          ) : (
            <>
              <Panel>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-white">
                    {company.trim() || "This business"} earns
                  </h3>
                  <span
                    className={cn(
                      "text-[24px] font-semibold tabular-nums",
                      reading.createsValue ? "text-accent-green" : "text-accent-red",
                    )}
                  >
                    {pct(reading.decomposition.roic)}
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {reading.says.map((line, index) => (
                    <p key={index} className="text-[13px] leading-6 text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="mt-3 text-[12px] leading-5 text-slate-600">
                  Calculated from the figures above — not a figure any company reports.
                </p>
              </Panel>

              <Panel>
                <h3 className="text-[14px] font-semibold text-white">What this cannot tell you</h3>
                <ul className="mt-2 space-y-2">
                  {reading.cannotTell.map((line, index) => (
                    <li key={index} className="text-[12px] leading-5 text-slate-500">
                      {line}
                    </li>
                  ))}
                </ul>
              </Panel>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-[12px] leading-5 text-slate-600">
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
            saveNote.kind === "error" ? "text-accent-amber" : "text-slate-600",
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
