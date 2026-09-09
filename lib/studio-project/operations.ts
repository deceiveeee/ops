import {
  workingAlternative,
  type CandidateInvestigation,
  type CandidateStatus,
  type FigureInvestigation,
  type LearnerInstrument,
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
  /** Empty unless the industry is one of the few with peer figures built. */
  sic: string;
  /** The industry whose cost of capital this is read against, by name. */
  industry: string;
  figures: Record<string, number>;
  riskFreePct: number | null;
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
    industry: edit.industry,
    figures: { ...edit.figures },
    riskFreePct: edit.riskFreePct,
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

export function updateCandidate(
  project: StudioProject,
  instrumentId: string,
  patch: Partial<Omit<CandidateInvestigation, "id" | "instrumentId" | "createdAt">>,
  now = new Date().toISOString(),
): StudioProject {
  return {
    ...project,
    updatedAt: now,
    candidates: project.candidates.map((candidate) =>
      candidate.instrumentId === instrumentId ? touch({ ...candidate, ...patch }, now) : candidate,
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

/**
 * Put a company the learner investigated into the portfolio.
 *
 * The bridge that was missing. Studio could research any business and could
 * hold any of eight, and those were different sets — so the work of reading an
 * annual report ended at a screen the portfolio could not see.
 *
 * It records the company as an instrument, because the calculator resolves
 * every holding through the catalogue and silently zeroes the whole portfolio
 * when it cannot. `addPosition` does the rest: it opens the candidate the six
 * steps ask "why do you own this?" of, and adds the position at zero, because
 * how much to hold is a separate decision belonging to the Build step rather
 * than something to assume here.
 *
 * Idempotent. Adding the same company twice returns the project unchanged
 * rather than creating a second one to weight.
 */
export function addInvestigatedCompany(
  project: StudioProject,
  investigationId: string,
  assetClass: LearnerInstrument["assetClass"],
  now = new Date().toISOString(),
): StudioProject {
  const investigation = project.investigations.find((item) => item.id === investigationId);
  if (!investigation || !investigation.company.trim()) return project;

  const existing = (project.instruments ?? []).find((item) => item.investigationId === investigationId);
  if (existing) return project;

  const instrument: LearnerInstrument = {
    id: `own-${investigationId}`,
    name: investigation.company.trim(),
    assetClass,
    investigationId,
    addedAt: now,
  };
  const withInstrument: StudioProject = {
    ...project,
    instruments: [...(project.instruments ?? []), instrument],
    updatedAt: now,
  };
  return addPosition(withInstrument, instrument.id, undefined, now);
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
