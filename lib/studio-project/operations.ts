import {
  workingAlternative,
  type CandidateInvestigation,
  type CandidateStatus,
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
