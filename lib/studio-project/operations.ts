import {
  workingAlternative,
  type CandidateInvestigation,
  type CandidateStatus,
  type EvidenceReference,
  type EvidenceRole,
  type FigureInvestigation,
  type FigureSource,
  type KeptPassage,
  type PortfolioAlternative,
  type StudioProject,
} from "./schema";

/**
 * The operations that change a project.
 *
 * All are pure: they take a project and return a new one. Storage, conflict
 * detection and failure reporting stay in the persistence layer, so the rules
 * about what may happen to a candidate can be tested without a browser.
 */

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const touch = <T extends { updatedAt: string }>(record: T, now: string): T => ({ ...record, updatedAt: now });

/** Start investigating something. Idempotent — reopening keeps prior work. */
export function startCandidate(
  project: StudioProject,
  instrumentId: string,
  now = new Date().toISOString(),
): StudioProject {
  if (project.candidates.some((candidate) => candidate.instrumentId === instrumentId)) return project;
  const candidate: CandidateInvestigation = {
    id: makeId("cand"),
    instrumentId,
    status: "researching",
    createdAt: now,
    updatedAt: now,
    why: "",
    mainRisk: "",
    whatWouldChangeMyMind: "",
    openQuestions: [],
    rejectedBecause: "",
    evidence: [],
    reviewedSources: false,
  };
  return { ...project, candidates: [...project.candidates, candidate], updatedAt: now };
}

/**
 * An id for an investigation the caller is about to start.
 *
 * The view needs one *before* the first save so that a debounced autosave
 * addresses the same record every time. Without it the second keystroke would
 * create a second company.
 */
export function newInvestigationId(): string {
  return makeId("inv");
}

/** What a caller may set on a figure investigation. Identity and dates are ours. */
export type InvestigationEdit = {
  company: string;
  sic: string;
  figures: Record<string, number>;
  riskFreePct: number | null;
  /** Where the figures came from, or null once they are the learner's own. */
  source?: FigureSource | null;
};

/**
 * Save the company figures the learner has entered, creating the record the
 * first time and replacing its contents afterwards.
 *
 * `figures` is replaced wholesale rather than merged, because clearing a field
 * is an edit like any other: merging would make a deleted figure impossible to
 * delete, and a learner who realises they read the wrong line needs the number
 * to actually go away.
 *
 * `createdAt` survives a rewrite. When the investigation began is a fact about
 * the learner's work, not about the last keystroke.
 */
export function saveInvestigation(
  project: StudioProject,
  edit: InvestigationEdit,
  id?: string,
  now = new Date().toISOString(),
): StudioProject {
  const existing = id ? project.investigations.find((item) => item.id === id) : undefined;
  const record: FigureInvestigation = {
    id: existing?.id ?? id ?? makeId("inv"),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    company: edit.company,
    sic: edit.sic,
    figures: { ...edit.figures },
    riskFreePct: edit.riskFreePct,
    source: edit.source ?? null,
    /*
     * Carried over, never taken from the edit. Investigate saves as it is typed
     * and knows nothing about passages kept in the reader, so rebuilding the
     * record from its edit alone would delete every kept passage on the next
     * keystroke — silently, and long after the learner kept them.
     */
    ...(existing?.passages ? { passages: existing.passages } : {}),
  };
  const investigations = existing
    ? project.investigations.map((item) => (item.id === existing.id ? record : item))
    : [...project.investigations, record];
  return { ...project, investigations, updatedAt: now };
}

/** Forget one company entirely. Nothing else refers to it, so nothing else changes. */
export function removeInvestigation(
  project: StudioProject,
  id: string,
  now = new Date().toISOString(),
): StudioProject {
  if (!project.investigations.some((item) => item.id === id)) return project;
  return {
    ...project,
    investigations: project.investigations.filter((item) => item.id !== id),
    updatedAt: now,
  };
}

/** What the reader supplies when a passage is kept. The judgment on it comes later. */
export type PassageEdit = Omit<KeptPassage, "id" | "savedAt" | "role" | "note">;

/** An id for a passage about to be kept, so the page can refer to it straight away. */
export function newPassageId(): string {
  return makeId("psg");
}

/** SEC numbers arrive padded and unpadded; they name the same company either way. */
const bareCik = (cik: string) => cik.replace(/\D/g, "").replace(/^0+/, "");

/**
 * Keep a passage from a filing against a company investigation.
 *
 * It is kept as background. Keeping is one action taken while reading; saying
 * whether a passage argues for the business or against it is a judgment, and it
 * is made in Investigate beside the figures the passage bears on.
 *
 * Keeping the same passage twice is not two pieces of evidence, so a second
 * press on the same words at the same place changes nothing.
 */
export function keepPassage(
  project: StudioProject,
  investigationId: string,
  passage: PassageEdit,
  id: string = makeId("psg"),
  now = new Date().toISOString(),
): StudioProject {
  const target = project.investigations.find((item) => item.id === investigationId);
  if (!target) return project;
  const already = (target.passages ?? []).some(
    (kept) =>
      kept.accession === passage.accession &&
      kept.sectionId === passage.sectionId &&
      kept.offset === passage.offset &&
      kept.quote === passage.quote,
  );
  if (already) return project;
  const kept: KeptPassage = { ...passage, id, savedAt: now, role: "context", note: "" };
  return {
    ...project,
    updatedAt: now,
    investigations: project.investigations.map((item) =>
      item.id === investigationId ? touch({ ...item, passages: [...(item.passages ?? []), kept] }, now) : item,
    ),
  };
}

/** Say what a kept passage argues, or what it shows, in the learner's own words. */
export function updatePassage(
  project: StudioProject,
  investigationId: string,
  passageId: string,
  patch: Partial<Pick<KeptPassage, "role" | "note">>,
  now = new Date().toISOString(),
): StudioProject {
  const target = project.investigations.find((item) => item.id === investigationId);
  if (!target?.passages?.some((kept) => kept.id === passageId)) return project;
  return {
    ...project,
    updatedAt: now,
    investigations: project.investigations.map((item) =>
      item.id === investigationId
        ? touch({ ...item, passages: item.passages!.map((kept) => (kept.id === passageId ? { ...kept, ...patch } : kept)) }, now)
        : item,
    ),
  };
}

/** Let one passage go. The figures and every other passage stay. */
export function removePassage(
  project: StudioProject,
  investigationId: string,
  passageId: string,
  now = new Date().toISOString(),
): StudioProject {
  const target = project.investigations.find((item) => item.id === investigationId);
  if (!target?.passages?.some((kept) => kept.id === passageId)) return project;
  return {
    ...project,
    updatedAt: now,
    investigations: project.investigations.map((item) =>
      item.id === investigationId
        ? touch({ ...item, passages: item.passages!.filter((kept) => kept.id !== passageId) }, now)
        : item,
    ),
  };
}

/**
 * The investigation a company's filing belongs with, when the learner has one.
 *
 * Three honest links, any one of which is enough: the figures were filled from
 * this company's filings, a passage has already been kept from them, or the
 * learner's name for the company is EDGAR's name for it. The most recently
 * touched wins, which is the one the learner was last working on. Nothing is
 * matched on a near-miss name: "Atkore" typed by hand is not treated as
 * "Atkore Inc." here, and the reader offers the choice instead of guessing.
 */
export function investigationForCompany(
  project: StudioProject,
  company: { cik: string; name: string },
): FigureInvestigation | undefined {
  const cik = bareCik(company.cik);
  const name = company.name.trim().toLowerCase();
  return project.investigations
    .filter(
      (item) =>
        (item.source != null && bareCik(item.source.cik) === cik) ||
        (item.passages ?? []).some((kept) => bareCik(kept.cik) === cik) ||
        (name !== "" && item.company.trim().toLowerCase() === name),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

/**
 * Write on an investigation, starting one if there is none.
 *
 * The seeding matters now that research is not tied to owning something. Until
 * the research record shipped, the only way to write a note was to add the
 * investment to a portfolio first, so a candidate always existed by the time
 * anything wrote to it. A learner reading an investment and deciding against it
 * never holds it, and their reason has to land somewhere — dropping the write
 * because no record existed yet would lose exactly the work this exists to keep.
 */
export function updateCandidate(
  project: StudioProject,
  instrumentId: string,
  patch: Partial<Omit<CandidateInvestigation, "id" | "instrumentId" | "createdAt">>,
  now = new Date().toISOString(),
): StudioProject {
  const seeded = startCandidate(project, instrumentId, now);
  return {
    ...seeded,
    updatedAt: now,
    candidates: seeded.candidates.map((candidate) =>
      candidate.instrumentId === instrumentId ? touch({ ...candidate, ...patch }, now) : candidate,
    ),
  };
}

/** What a learner may attach to an investigation. Identity and time are ours. */
export type EvidenceEdit = {
  /** The source it came from: a catalog source id, or a filing accession. */
  sourceId: string;
  /** Where in the source — a section, a statement line, a page. May be empty. */
  locator: string;
  /** What it shows, in the learner's own words. */
  note: string;
  role: EvidenceRole;
};

/**
 * Keep a piece of evidence against an investment.
 *
 * Evidence that only supports a conclusion is not evidence, it is decoration,
 * which is why the role is required rather than assumed: a learner has to say
 * whether what they read argues for the investment or against it. Nothing here
 * judges the note or counts the sides.
 *
 * The investigation is started if there is none, because the first thing a
 * learner does with an investment is often to read something about it.
 */
export function addEvidence(
  project: StudioProject,
  instrumentId: string,
  entry: EvidenceEdit,
  now = new Date().toISOString(),
): StudioProject {
  const reference: EvidenceReference = {
    id: makeId("ev"),
    sourceId: entry.sourceId,
    locator: entry.locator,
    note: entry.note,
    role: entry.role,
    savedAt: now,
  };
  const seeded = startCandidate(project, instrumentId, now);
  return {
    ...seeded,
    updatedAt: now,
    candidates: seeded.candidates.map((candidate) =>
      candidate.instrumentId === instrumentId
        ? touch({ ...candidate, evidence: [...candidate.evidence, reference] }, now)
        : candidate,
    ),
  };
}

/** Drop one piece of evidence. Nothing else about the investigation changes. */
export function removeEvidence(
  project: StudioProject,
  instrumentId: string,
  evidenceId: string,
  now = new Date().toISOString(),
): StudioProject {
  const candidate = project.candidates.find((item) => item.instrumentId === instrumentId);
  if (!candidate?.evidence.some((item) => item.id === evidenceId)) return project;
  return {
    ...project,
    updatedAt: now,
    candidates: project.candidates.map((item) =>
      item.instrumentId === instrumentId
        ? touch({ ...item, evidence: item.evidence.filter((entry) => entry.id !== evidenceId) }, now)
        : item,
    ),
  };
}

export function setCandidateStatus(
  project: StudioProject,
  instrumentId: string,
  status: CandidateStatus,
  rejectedBecause = "",
  now = new Date().toISOString(),
): StudioProject {
  return updateCandidate(
    project,
    instrumentId,
    status === "rejected" ? { status, rejectedBecause } : { status },
    now,
  );
}

/**
 * Add a position to an alternative, starting its investigation if needed.
 *
 * Holding something and having researched it are different states, and the
 * second is not implied by the first — a position added here begins at
 * `researching`, not `selected`.
 */
export function addPosition(
  project: StudioProject,
  instrumentId: string,
  alternativeId?: string,
  now = new Date().toISOString(),
): StudioProject {
  const started = startCandidate(project, instrumentId, now);
  const targetId = alternativeId ?? workingAlternative(started)?.id;
  if (!targetId) return started;
  return {
    ...started,
    updatedAt: now,
    alternatives: started.alternatives.map((alternative) => {
      if (alternative.id !== targetId) return alternative;
      if (alternative.positions.some((position) => position.instrumentId === instrumentId)) return alternative;
      return touch(
        {
          ...alternative,
          positions: [
            ...alternative.positions,
            {
              instrumentId,
              targetWeightPct: 0,
              currentValue: 0,
              quotePrice: null,
              quoteAsOf: "",
              quantityMode: "whole" as const,
              accruedInterestPer100: null,
              tradeFee: 0,
            },
          ],
        },
        now,
      );
    }),
  };
}

/**
 * Remove a position from one alternative.
 *
 * **This is the defect v2 exists to fix.** In v1 the research lived inside the
 * holding, so removing the holding destroyed the investigation. Here the
 * candidate is untouched: only the position goes. The learner keeps why they
 * looked at it, what worried them, and what would have changed their mind.
 */
export function removePosition(
  project: StudioProject,
  instrumentId: string,
  alternativeId?: string,
  now = new Date().toISOString(),
): StudioProject {
  const targetId = alternativeId ?? workingAlternative(project)?.id;
  if (!targetId) return project;
  return {
    ...project,
    updatedAt: now,
    alternatives: project.alternatives.map((alternative) =>
      alternative.id === targetId
        ? touch(
            {
              ...alternative,
              positions: alternative.positions.filter((position) => position.instrumentId !== instrumentId),
            },
            now,
          )
        : alternative,
    ),
  };
}

/**
 * Copy an alternative so two constructions can be compared.
 *
 * Positions are copied; candidates are not, because they are shared. Two
 * alternatives holding the same investment refer to one investigation of it,
 * which is the point — research is about the investment, not about the slot.
 */
export function duplicateAlternative(
  project: StudioProject,
  alternativeId: string,
  name: string,
  now = new Date().toISOString(),
): StudioProject {
  const source = project.alternatives.find((alternative) => alternative.id === alternativeId);
  if (!source) return project;
  const copy: PortfolioAlternative = {
    ...source,
    id: makeId("alt"),
    name,
    createdAt: now,
    updatedAt: now,
    positions: source.positions.map((position) => ({ ...position })),
  };
  return { ...project, alternatives: [...project.alternatives, copy], updatedAt: now };
}

/** Candidates the learner looked at and decided against. Kept findable. */
export function rejectedCandidates(project: StudioProject): CandidateInvestigation[] {
  return project.candidates.filter((candidate) => candidate.status === "rejected");
}

/** Candidates investigated but held in no alternative. */
export function unheldCandidates(project: StudioProject): CandidateInvestigation[] {
  const held = new Set(
    project.alternatives.flatMap((alternative) => alternative.positions.map((position) => position.instrumentId)),
  );
  return project.candidates.filter((candidate) => !held.has(candidate.instrumentId));
}
