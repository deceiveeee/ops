"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { checkEntries, FIGURES, read, type Entries, type FigureKey } from "@/lib/studio-project/investigate";
import { DEFAULT_INDUSTRY, PEERS_BY_INDUSTRY, peerContextFor } from "@/lib/studio-project/investigate-read";
import {
  TREASURY_RATE,
  estimate,
  forIndustry,
  industryForSic,
  industryNames,
  investigationIndustry,
  longDate,
  sectorForIndustry,
} from "@/lib/studio-project/cost-of-capital";
import type { RoicDecomposition } from "@/lib/studio-project/roic";
import {
  addInvestigatedCompany,
  addPosition,
  newInvestigationId,
  removeInvestigation,
  removePassage,
  removePosition,
  saveInvestigation,
  setCandidateStatus,
  startCandidate,
  updateCandidate,
  updatePassage,
} from "@/lib/studio-project/operations";
import { isHeld, latestInvestigation, type CandidateInvestigation, type EvidenceRole, type FigureSource, type KeptPassage, type LearnerInstrument } from "@/lib/studio-project/schema";
import type { MissingFigure, SuppliedFigure } from "@/lib/studio-project/prefill";
import { sectionLabel as labelForSection } from "@/lib/filings/sections";
import { Field, Panel, StageHeading } from "./shared";
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

// The peer map, the default industry and the peer context live in
// lib/studio-project/investigate-read.ts, because the value stick reads the
// same figures and two definitions of "peer" would drift apart.

/**
 * The two a company the learner found can be. A bond issue or a fund is
 * something Studio researches and carries, not something someone types seven
 * figures into an annual report for.
 */
const ASSET_CLASSES = [
  { value: "us-equity" as const, label: "A US-listed company" },
  { value: "international-equity" as const, label: "Listed outside the US" },
];

/** How long typing settles before a save. Short enough to survive a stray click. */
const SAVE_DELAY_MS = 600;
/** A ticker as the company lookup accepts one. */
const TICKER = /^[A-Z0-9.-]{1,12}$/;

/** A date as a person writes it, for a filing period a learner has to recognise. */
const readableDate = (iso: string): string => {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

/** What the SEC lookup is doing, so the button can say so rather than just sit there. */
type Lookup = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string };

/** The same three words the research record uses, so a role means one thing everywhere. */
const PASSAGE_ROLES: { value: EvidenceRole; label: string; tone: string }[] = [
  { value: "supports", label: "For it", tone: "border-accent-green/40 bg-accent-green/10 text-accent-green" },
  { value: "challenges", label: "Against it", tone: "border-accent-amber/40 bg-accent-amber/10 text-accent-amber" },
  { value: "context", label: "Background", tone: "border-white/25 bg-white/10 text-slate-200" },
];

export default function InvestigateView() {
  const [company, setCompany] = useState("");
  /** A ticker from the address to look up as soon as it is in the company box. */
  const [autoFill, setAutoFill] = useState<string | null>(null);
  const [industry, setIndustry] = useState(DEFAULT_INDUSTRY);
  const [assetClass, setAssetClass] = useState<LearnerInstrument["assetClass"]>("us-equity");
  const [decisionNote, setDecisionNote] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
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
  const router = useRouter();
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
  const editRef = useRef({ company, industry, entries, riskFree, source });
  editRef.current = { company, industry, entries, riskFree, source };
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
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get("company");
    // Research's company search names a ticker: reopen that company if it has
    // been investigated, or start on it and look its figures up.
    const ticker = params.get("ticker")?.trim().toUpperCase() ?? "";
    // The ticker is an instruction, carried out once. Left in the address, a
    // reload after deleting the company started it again (found 2026-09-16).
    // Replaced at once rather than through the router, whose navigation had not
    // finished when a quick reload came.
    if (params.has("ticker")) window.history.replaceState(window.history.state, "", window.location.pathname);
    const byTicker = TICKER.test(ticker)
      ? project.project.investigations.find((item) => item.source?.ticker.toUpperCase() === ticker)
      : undefined;
    if (TICKER.test(ticker) && !byTicker) {
      setCompany(ticker);
      setAutoFill(ticker);
      return;
    }
    const saved = byTicker ?? project.project.investigations.find((item) => item.id === wanted) ?? latestInvestigation(project.project);
    if (!saved) return;
    idRef.current = saved.id;
    setInvestigationId(saved.id);
    setCompany(saved.company);
    // A record saved before the industry could be chosen carries only a SIC,
    // and reopens against the industry that SIC was read with.
    setIndustry(investigationIndustry(saved) ?? DEFAULT_INDUSTRY);
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
        industry: edit.industry,
        // Only where peers exist, because that is all a SIC is used for here.
        // Storing one for an industry with no peer figures would imply a
        // comparison that cannot be made.
        sic: PEERS_BY_INDUSTRY.get(edit.industry)?.sic ?? "",
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
  }, [company, industry, entries, riskFree, source, flush, setDraft]);

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
    setIndustry(investigationIndustry(target) ?? DEFAULT_INDUSTRY);
    setRejecting(false);
    setDecisionNote(null);
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
          ? `Studio looks companies up by ticker symbol, the short code its shares trade under, and "${typed}" is not one.`
          : "Type the company's ticker symbol first: the short code its shares trade under.",
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
    // Where the SEC's code is one of the industries Studio has peers for, it
    // names the industry. Otherwise the select keeps what it had, and the page
    // says so rather than pretending to know.
    const named = body.sic ? industryForSic(body.sic) : null;
    if (named) setIndustry(named);
    setCouldNotFill(body.missing ?? []);
    setLookup({ kind: "idle" });
  }, [company, entries, source]);

  // A ticker arriving from Research's search is looked up once it is in the box.
  useEffect(() => {
    if (autoFill === null || company !== autoFill) return;
    setAutoFill(null);
    void fill();
  }, [autoFill, company, fill]);

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
    setRejecting(false);
    setRejectReason("");
    setDecisionNote(null);
    setSaveNote({ kind: "idle" });
  }, [flush]);

  /**
   * Forget one company, on purpose and with a confirmation.
   *
   * Everything else on this page saves silently, so deletion is the one action
   * that cannot be undone by carrying on typing. It asks first.
   */
  const forget = useCallback(async (id: string, label: string) => {
    // Kept passages go with the company, so the warning names them.
    const keptCount = sessionRef.current.project?.investigations.find((item) => item.id === id)?.passages?.length ?? 0;
    const alsoGone = keptCount ? ` and the ${keptCount} ${keptCount === 1 ? "passage" : "passages"} you kept from its filings` : "";
    if (!window.confirm(`Delete ${label}? The figures you entered for it${alsoGone} will be gone.`)) return;
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
   * Where the research becomes a decision.
   *
   * Studio would investigate any business and hold any of eight, and those were
   * different sets, so reading a company's annual report ended on a screen the
   * portfolio could not see. Holding it records the company as the learner's own
   * instrument; deciding against it records a reason on a candidate, which
   * exists whether or not anything holds it. They are the two honest ends of the
   * same piece of work, not a success and a failure.
   *
   * Held is read from the portfolio, not from the instrument having been added
   * once: a company taken out in Portfolio is not held, and can be added again.
   */
  const ownId = investigationId ? `own-${investigationId}` : null;
  const heldNow = Boolean(ownId && project.project && isHeld(project.project, ownId));
  const decided = ownId ? project.project?.candidates.find((candidate) => candidate.instrumentId === ownId) : undefined;
  const against = decided?.status === "rejected" ? decided.rejectedBecause : null;
  const canDecide = Boolean(investigationId) && company.trim() !== "" && project.status === "ready";

  const hold = useCallback(async () => {
    const id = idRef.current;
    if (!id) return;
    // Anything typed since the last save goes in first, so the holding is added
    // against the figures on screen rather than the ones from a moment ago.
    await flush();
    setDecisionNote(null);
    const result = await sessionRef.current.update((current) => {
      const withInstrument = addInvestigatedCompany(current, id, assetClass);
      return isHeld(withInstrument, `own-${id}`) ? withInstrument : addPosition(withInstrument, `own-${id}`);
    });
    if (!result.ok) setDecisionNote(`Not added: ${result.error}`);
  }, [assetClass, flush]);

  const decideAgainst = useCallback(async () => {
    const id = idRef.current;
    const reason = rejectReason.trim();
    if (!id || !reason) return;
    await flush();
    setDecisionNote(null);
    const instrumentId = `own-${id}`;
    const result = await sessionRef.current.update((current) =>
      setCandidateStatus(removePosition(startCandidate(current, instrumentId), instrumentId), instrumentId, "rejected", reason),
    );
    if (result.ok) {
      setRejecting(false);
      setRejectReason("");
    } else {
      setDecisionNote(`Not recorded: ${result.error}`);
    }
  }, [flush, rejectReason]);

  const reconsider = useCallback(async () => {
    const id = idRef.current;
    if (!id) return;
    const result = await sessionRef.current.update((current) => setCandidateStatus(current, `own-${id}`, "researching"));
    if (!result.ok) setDecisionNote(`Not changed: ${result.error}`);
  }, []);

  /** Why this company is owned, on the candidate the portfolio already keeps for it. */
  const note = (patch: Partial<Pick<CandidateInvestigation, "why" | "mainRisk" | "whatWouldChangeMyMind">>) => {
    const id = idRef.current;
    if (!id) return undefined;
    return sessionRef.current.update((current) => updateCandidate(current, `own-${id}`, patch));
  };

  /*
   * Passages kept from this company’s filings, read from the saved project
   * rather than held in page state. The reader writes them, not this page, so
   * the stored record is the only place that knows them.
   */
  const passages: KeptPassage[] = saved.find((item) => item.id === investigationId)?.passages ?? [];
  const [passageNote, setPassageNote] = useState<{ id: string; message: string; search?: string } | null>(null);

  const markPassage = (passageId: string, patch: Partial<Pick<KeptPassage, "role" | "note">>) => {
    const target = idRef.current;
    if (!target) return undefined;
    return sessionRef.current.update((current) => updatePassage(current, target, passageId, patch));
  };

  const dropPassage = async (passageId: string) => {
    const target = idRef.current;
    if (!target) return;
    const result = await sessionRef.current.update((current) => removePassage(current, target, passageId));
    if (!result.ok) setSaveNote({ kind: "error", message: result.error });
  };

  /**
   * Open a kept passage where it is now.
   *
   * The report is fetched fresh and the passage found again across its whole
   * section by the locate-passage route, so what opens is where the words are
   * today. When they cannot be found, that is said, with a search for their
   * opening words as the way to look.
   */
  const openPassage = async (passage: KeptPassage) => {
    setPassageNote(null);
    const opening = passage.quote.split(/\s+/).slice(0, 5).join(" ");
    const reader = `/studio/filings/${passage.cik}/${passage.accession}?doc=${encodeURIComponent(passage.document)}`;
    let answer: { found?: boolean; strategy?: string; sectionId?: string; start?: number; end?: number; message?: string; error?: string };
    try {
      const response = await fetch("/api/studio/locate-passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cik: passage.cik, accession: passage.accession, document: passage.document, sectionId: passage.sectionId,
          quote: passage.quote, prefix: passage.prefix, suffix: passage.suffix, offset: passage.offset,
        }),
      });
      answer = await response.json();
    } catch {
      setPassageNote({ id: passage.id, message: "The report could not be reached just now." });
      return;
    }
    if (!answer.found || answer.start === undefined || answer.end === undefined) {
      setPassageNote({
        id: passage.id,
        message: answer.message ?? answer.error ?? "This passage could not be found in the report any more.",
        search: `${reader}&q=${encodeURIComponent(opening)}`,
      });
      return;
    }
    const moved = answer.strategy && answer.strategy !== "position" ? `&moved=${answer.strategy}` : "";
    router.push(`${reader}&section=${answer.sectionId}&at=${answer.start}&len=${answer.end - answer.start}${moved}#passage`);
  };

  /*
   * Peers are a bonus, not a requirement. Five industries have them and
   * ninety-six do not, so this is usually undefined, which the checks and the
   * reading allow for: without it the learner loses the comparison with a
   * median, not the answer.
   */
  const researched = PEERS_BY_INDUSTRY.get(industry);
  const sector = sectorForIndustry(industry);

  const peerContext = useMemo(() => peerContextFor(industry), [industry]);

  const industryCost = forIndustry(industry) ?? forIndustry(DEFAULT_INDUSTRY)!;
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
      {/* Below 1024px the sections live in a menu, so this is the only way back
          to Research on the page. From 1024 the sidebar is drawn with Research
          marked as the section in hand, and saying it twice costs 36px of a
          budget this page was over. */}
      <nav aria-label="Breadcrumb" className="text-[13px] text-slate-500 lg:hidden">
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

      {/*
        * The reading gets the wider half.
        *
        * Both columns were equal, and they hold different things: seven labelled
        * number boxes on the left, which need about 340px and no more, and
        * sentences on the right, which at the same width ran to six lines each.
        * Widening the prose by a sixth takes a line off every paragraph.
        */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* ---------------------------------------------------------- entry */}
        <Panel>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="ops-caption text-[11px] text-slate-500">Company</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                onBlur={() => void flush()}
                placeholder="Its ticker symbol"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[14px] text-white placeholder:text-slate-600 focus:border-accent-cyan/50 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="ops-caption text-[11px] text-slate-500">Industry</span>
              <select
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[14px] text-white focus:border-accent-cyan/50 focus:outline-none"
              >
                {industryNames().map((name) => (
                  <option key={name} value={name} className="bg-slate-900">
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {/*
            * Said rather than left to be noticed: an absent comparison would
            * otherwise read as the learner's figures being wrong.
            *
            * It used to say the peer figures were "below", and they are not:
            * this page has no peer table, only the sentence the reading draws
            * from them. Naming what actually happens keeps the promise.
            */}
          <p className="mt-2 text-[12px] leading-5 text-slate-500">
            {researched
              ? `The reading compares it with ${researched.peers.length} companies in this industry.`
              : "No peer figures for this industry yet; the return on capital is still worked out in full."}
          </p>

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
            {/* How to fill the boxes by hand, until they are filled. Once a
                filing has answered, the learner has done it and the two lines
                are just height beside the figures they came back with. */}
            {source ? null : (
              <p className="text-[13px] leading-6 text-slate-400">
                Or type them from the annual report — open one in{" "}
                <Link href="/studio/filings" className="text-accent-cyan hover:underline">
                  Company reports
                </Link>
                .
              </p>
            )}
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
              {/*
                * Which filing, on one line; the rest of it a press away.
                *
                * Set out in full this block ran to 279px at 1440 -- a fifth of
                * the page's whole budget, on the path a learner takes every
                * time. Which filing answered is the part worth that space; when
                * it was filed and the filing itself are a press behind it.
                */}
              <details className="group">
                <summary className="flex cursor-pointer list-none items-baseline gap-2 text-[13px] leading-6 text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
                  <span>
                    Filled from <span className="font-semibold text-white">{source.entityName}</span>
                    {source.form ? `'s ${source.form}` : null}
                    {source.periodEnd ? `, the year to ${readableDate(source.periodEnd)}` : null}
                  </span>
                  <span className="text-[12px] text-slate-400 group-open:hidden">More</span>
                  <span className="hidden text-[12px] text-slate-400 group-open:inline">Hide</span>
                </summary>
                <p className="mt-1 text-[12px] leading-5 text-slate-400">
                  Highlighted boxes are its own figures. Type over any to use yours.
                  {source.filed ? ` Filed ${readableDate(source.filed)}.` : null}
                  {source.accession && source.cik ? (
                    <>
                      {" "}
                      <a
                        href={`https://www.sec.gov/Archives/edgar/data/${source.cik.replace(/^0+/, "")}/${source.accession.replace(/-/g, "")}/${source.accession}-index.htm`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-accent-cyan underline underline-offset-2"
                      >
                        Open the filing
                      </a>
                    </>
                  ) : null}
                </p>
              </details>
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
              ? "In US dollars, as filed. Keep any you type in the same units."
              : "Keep all seven in the same units — millions, or billions."}
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
            {/* The second half of this used to say that a return above it
                creates value and a return below it does not. The reading below
                says the same thing in the learner's own numbers, so it was
                being told twice. */}
            <p className="mt-2 text-[13px] leading-6 text-slate-400">
              No company reports this — it has to be estimated.
            </p>

            {/* Which rate is in force stays beside the box rather than under
                it: at 1440 there is room on the same line, and on a phone it
                wraps to where it was. */}
            <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <label className="flex flex-wrap items-center gap-2 text-[13px] text-slate-400">
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
              <p className="text-[12px] leading-5 text-slate-500">
                {learnerRate === undefined
                  ? `Treasury 10-year auction, ${longDate(TREASURY_RATE.auctionDate)}.`
                  : "Your own rate. Clear the box to use the Treasury's."}
              </p>
            </div>

            {/*
              * When the SEC's code for the company is not one Studio has a cost
              * of capital for, that is a fault in this number, so it is said
              * here rather than up beside the figures. Atkore files under SIC
              * 3690, mostly battery and EV-charging makers: reading it against
              * semiconductors without saying so was the one dead end the
              * friction walk found (2026-09-10).
              */}
            {source?.sic && !industryForSic(source.sic) ? (
              <p className="mt-3 border-t border-st-hair pt-2 text-[12px] leading-5 text-accent-amber">
                The SEC files it under{" "}
                {source.sicDescription ? `${source.sicDescription.toLowerCase()} (${source.sic})` : source.sic},
                which Studio cannot match to an industry, so this is{" "}
                {industry === DEFAULT_INDUSTRY ? "the whole market's cost of capital" : `${industry}'s`}. Pick
                the industry that fits the business best.
                {/* Any company's annual report has a Competitors tab reading who it names. */}
                {source.ticker ? (
                  <>
                    {" "}
                    <Link
                      href={`/studio/filings?ticker=${encodeURIComponent(source.ticker)}`}
                      className="text-accent-cyan underline underline-offset-2"
                    >
                      Find the competitors its own annual report names →
                    </Link>
                  </>
                ) : null}
              </p>
            ) : null}

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
                  {/* Three kinds of value are styled apart on this page, and
                      this is the calculated one. It says so on the number's own
                      line, which costs no height, rather than in a footnote
                      under the reading. */}
                  <span className="flex items-baseline gap-2">
                    <span className="text-[12px] font-normal text-slate-500">calculated, not filed</span>
                    <span
                      className={cn(
                        "text-[24px] font-semibold tabular-nums",
                        reading.createsValue ? "text-accent-green" : "text-accent-red",
                      )}
                    >
                      {pct(reading.decomposition.roic)}
                    </span>
                  </span>
                </div>
                <div className="mt-3 space-y-3">
                  {reading.says.map((line, index) => (
                    <p key={index} className="text-[13px] leading-6 text-slate-300">
                      {line}
                    </p>
                  ))}
                </div>

                {/*
                  * The limits of the reading, under the reading, one press away.
                  *
                  * Set out as a list these four cost 323px at 1440 and 335px on
                  * a phone -- a fifth of the page's budget on text read once.
                  * Closed, the heading still says the reading has limits and
                  * how many, which is the part that must not be hidden; open,
                  * nothing is shortened.
                  */}
                <details className="group mt-4 border-t border-st-hair pt-2">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 text-[14px] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
                    What this cannot tell you
                    <span className="text-[12px] font-normal text-slate-500 group-open:hidden">
                      {reading.cannotTell.length} things
                    </span>
                    <span className="hidden text-[12px] font-normal text-slate-500 group-open:inline">Hide</span>
                  </summary>
                  <ul className="mt-1 space-y-2">
                    {reading.cannotTell.map((line, index) => (
                      <li key={index} className="text-[12px] leading-5 text-slate-500">
                        {line}
                      </li>
                    ))}
                  </ul>
                </details>
              </Panel>
            </>
          )}
        </div>
      </div>

      {/*
        * Where the research becomes a decision, in one row.
        *
        * Held and turned down are the two honest ends of the same piece of
        * work, so they sit together, under the figures they follow from. One
        * row rather than a block of prose because this page has a screen
        * budget: at 1440 the reading already runs to 1.41 screens, and a panel
        * that explained itself in paragraphs took it to 1.73.
        */}
      {canDecide ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2">
          {heldNow ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <p className="text-[13px] leading-6 text-slate-300">
                <span className="font-semibold text-white">{company.trim()}</span> is in your portfolio. Choose how
                much to hold in{" "}
                <Link href="/studio/portfolio" className="text-accent-cyan hover:underline">
                  Portfolio
                </Link>
                .
              </p>
              {/* Asked in the same words as any other holding, and kept on the
                  company's own page rather than in the library of eight, which
                  is where its figures and its filings already are. */}
              <details className="group">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-[13px] font-semibold text-accent-cyan focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
                  Why you own it
                  <span className="ml-2 text-[12px] font-normal text-slate-500 group-open:hidden">Write it down</span>
                  <span className="ml-2 hidden text-[12px] font-normal text-slate-500 group-open:inline">Hide</span>
                </summary>
                <div className="mt-2 space-y-3">
                  <Field label="Why it belongs" value={decided?.why ?? ""} onChange={(value) => note({ why: value })} multiline />
                  <Field label="The main risk I accept" value={decided?.mainRisk ?? ""} onChange={(value) => note({ mainRisk: value })} multiline />
                  <Field
                    label="What would change my mind"
                    value={decided?.whatWouldChangeMyMind ?? ""}
                    onChange={(value) => note({ whatWouldChangeMyMind: value })}
                    multiline
                  />
                </div>
              </details>
            </div>
          ) : against !== null ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[13px] text-slate-500">You decided against it:</span>
              <span className="text-[13px] leading-6 text-slate-300">{against}</span>
              <button
                type="button"
                onClick={() => void reconsider()}
                className="inline-flex min-h-11 items-center text-[13px] font-semibold text-accent-cyan hover:underline"
              >
                Put it back on the table
              </button>
            </div>
          ) : rejecting ? (
            <>
              <Field
                label={`Why ${company.trim()} is not for you`}
                hint="Kept with these figures, so you can check later whether it still holds."
                value={rejectReason}
                onChange={setRejectReason}
                placeholder="It earns less than its capital costs and I could not see that changing"
                multiline
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!rejectReason.trim()}
                  onClick={() => void decideAgainst()}
                  className="inline-flex min-h-11 items-center rounded-lg border border-white/15 px-3.5 text-[13px] font-semibold text-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Record this decision
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejecting(false);
                    setRejectReason("");
                  }}
                  className="inline-flex min-h-11 items-center px-2 text-[13px] text-slate-400"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              {/* Asked, not guessed: an investment whose kind Studio does not know is
                  dealt no fall in the scenario test, which understates the loss
                  rather than showing an error. */}
              <label className="text-[13px] text-slate-400">
                Where it trades{" "}
                <select
                  value={assetClass}
                  onChange={(event) => setAssetClass(event.target.value as LearnerInstrument["assetClass"])}
                  className="min-h-11 rounded-lg border border-white/10 bg-white/[0.03] px-2 text-[13px] text-white focus:border-accent-cyan/50 focus:outline-none"
                >
                  {ASSET_CLASSES.map((option) => (
                    <option key={option.value} value={option.value} className="bg-slate-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => void hold()}
                className="inline-flex min-h-11 items-center rounded-lg border border-accent-cyan/40 bg-accent-cyan/10 px-3.5 text-[13px] font-semibold text-white hover:border-accent-cyan/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
              >
                Add {company.trim()} to your portfolio
              </button>
              {/* A business can be worth reading and still not worth owning, and that
                  conclusion is the one a learner can check later against what happened. */}
              <button
                type="button"
                onClick={() => setRejecting(true)}
                className="inline-flex min-h-11 items-center text-[13px] text-slate-300 underline underline-offset-2 hover:text-white"
              >
                Decide against {company.trim()}
              </button>
            </div>
          )}
          {decisionNote ? (
            <p role="alert" className="mt-2 text-[13px] leading-6 text-accent-amber">
              {decisionNote}
            </p>
          ) : null}
        </div>
      ) : null}
      {/*
        * Passages kept while reading this company’s reports, beside the reading
        * they bear on. Absent until one is kept, so the page is no taller for
        * a learner who has not used the reader.
        */}
      {passages.length ? (
        <Panel>
          <h3 className="text-[15px] font-semibold text-white">
            From its own filings <span className="font-normal text-slate-500">({passages.length})</span>
          </h3>
          <p className="mt-1 text-[13px] leading-6 text-slate-400">
            Passages you kept while reading. Say whether each argues for this business or against it.
          </p>
          <ul className="mt-3 space-y-4">
            {passages.map((passage) => {
              const sectionLabel = labelForSection(passage.sectionId, passage.form);
              return (
                <li key={passage.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <blockquote className="line-clamp-4 border-l-2 border-accent-cyan/40 pl-3 text-[14px] leading-6 text-slate-200">
                    {passage.quote}
                  </blockquote>
                  <p className="mt-1.5 text-[12px] leading-5 text-slate-500">
                    {passage.form || "Report"} · {sectionLabel}
                    {passage.filed ? ` · filed ${passage.filed}` : ""}
                  </p>
                  <div className="mt-3 grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)]">
                    <fieldset>
                      <legend className="text-[13px] font-semibold text-white">Does it argue for it or against it?</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {PASSAGE_ROLES.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3.5 text-[13px] transition-colors focus-within:ring-2 focus-within:ring-accent-cyan/40",
                              passage.role === option.value ? option.tone : "border-white/12 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
                            )}
                          >
                            <input
                              type="radio"
                              name={`passage-role-${passage.id}`}
                              value={option.value}
                              checked={passage.role === option.value}
                              onChange={() => void markPassage(passage.id, { role: option.value })}
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <Field label="What it shows" value={passage.note} onChange={(value) => markPassage(passage.id, { note: value })} multiline />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <button
                      type="button"
                      onClick={() => void openPassage(passage)}
                      className="inline-flex min-h-11 items-center text-[13px] font-semibold text-accent-cyan hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
                    >
                      Open it in the report
                    </button>
                    <button
                      type="button"
                      onClick={() => void dropPassage(passage.id)}
                      aria-label="Remove this passage"
                      className="inline-flex min-h-11 items-center text-[13px] text-slate-400 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
                    >
                      Remove
                    </button>
                  </div>
                  {passageNote?.id === passage.id ? (
                    <p role="alert" className="mt-1 text-[13px] leading-6 text-accent-amber">
                      {passageNote.message}{" "}
                      {passageNote.search ? (
                        <Link href={passageNote.search} className="underline underline-offset-2">
                          Search the report for it
                        </Link>
                      ) : null}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}

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
