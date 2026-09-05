/**
 * Studio project schema v2.
 *
 * The v1 record put a learner's research inside the holding that used it, so
 * `removeStudioHolding` deleted the investigation along with the position. A
 * rejected candidate could not survive, which contradicts the point of research:
 * deciding *not* to buy something is a result worth keeping, and the reasoning
 * behind a rejection is usually more instructive than the reasoning behind a
 * purchase.
 *
 * v2 inverts that ownership. A `CandidateInvestigation` is a first-class record
 * that exists whether or not anything holds it, and a `PortfolioPosition` merely
 * points at one. Removing a position removes a position.
 *
 * Nothing here reads or writes storage, and nothing here computes finance. Both
 * live elsewhere so this file stays a description of shape.
 */

export const STUDIO_PROJECT_SCHEMA_VERSION = 2 as const;

export type StudioMode = "practice" | "personal";

/** Where an investigation has got to. Not a grade, and not an instruction. */
export type CandidateStatus = "researching" | "shortlisted" | "rejected" | "selected";

/** Whether a saved piece of evidence supports a claim or argues against it. */
export type EvidenceRole = "supports" | "challenges" | "context";

/**
 * One thing a learner has looked into.
 *
 * Independent of any portfolio. A candidate that reaches `rejected` keeps
 * everything that produced the rejection, and can be found again later.
 */
export interface CandidateInvestigation {
  id: string;
  /** Catalog instrument this investigates, where one exists. */
  instrumentId: string;
  status: CandidateStatus;
  createdAt: string;
  updatedAt: string;
  /** Why it is worth owning, in the learner's words. */
  why: string;
  /** The risk being accepted. */
  mainRisk: string;
  /** The observation that would overturn the conclusion. */
  whatWouldChangeMyMind: string;
  /** Questions raised and not yet answered. Uncertainty is a result. */
  openQuestions: string[];
  /** Why a rejection happened, kept so it can be revisited. */
  rejectedBecause: string;
  evidence: EvidenceReference[];
  reviewedSources: boolean;
}

/** A pointer back to something the learner actually read. */
export interface EvidenceReference {
  id: string;
  /** Catalog source id, or a filing accession. */
  sourceId: string;
  /** Where in the source — a section, a statement line, a page. */
  locator: string;
  /** The learner's own note about what it shows. */
  note: string;
  role: EvidenceRole;
  savedAt: string;
}

/**
 * A position inside one portfolio alternative.
 *
 * Carries only what makes it a *position* — size, cost and the quote used.
 * Everything about the investment itself lives on the candidate.
 */
export interface PortfolioPosition {
  instrumentId: string;
  /** Percent of the budget remaining after the cash reserve. */
  targetWeightPct: number;
  currentValue: number;
  /** Stocks and funds: USD per share. Bonds: price per $100 of face value. */
  quotePrice: number | null;
  quoteAsOf: string;
  quantityMode: "whole" | "fractional";
  accruedInterestPer100: number | null;
  tradeFee: number;
}

/**
 * One named portfolio the learner is considering.
 *
 * Alternatives exist so two constructions can be compared without either being
 * destroyed. Deleting a position from one alternative touches no research and no
 * other alternative.
 */
export interface PortfolioAlternative {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  positions: PortfolioPosition[];
  currentCash: number;
  contributionAmount: number;
  /** Why this construction, and what the learner accepted in choosing it. */
  reasoning: string;
}

export interface StudioGoal {
  purpose: string;
  horizonYears: number;
  budget: number;
  cashReserve: number;
  monthlyContribution: number;
  accountType: "taxable" | "ira" | "roth-ira" | "other";
  lossTolerancePct: number;
  constraints: string;
}

export interface StudioRules {
  reviewFrequency: "monthly" | "quarterly" | "yearly";
  /** Difference from target, in percentage points of the full portfolio. */
  driftThresholdPct: number;
  contributionRule: string;
  sellRule: string;
  guardrails: string;
}

/** Learner-chosen price changes. Not forecasts, and not loss probabilities. */
export interface StudioStress {
  usStocksPct: number;
  internationalStocksPct: number;
  globalStocksPct: number;
  bondsPct: number;
  cashPct: number;
}

/**
 * A record of something changing, so a later session can see what moved and why.
 *
 * The handoff requires that a changed input mark dependent work for review
 * rather than silently rewriting it. This is where that cause is written down.
 */
export interface DecisionRecord {
  id: string;
  at: string;
  /** What changed, in plain words. */
  summary: string;
  /** Why the learner changed it. */
  reason: string;
  /** Records that may no longer hold, by id. */
  affects: string[];
}

export interface StudioProject {
  schemaVersion: 2;
  id: string;
  createdAt: string;
  updatedAt: string;
  mode: StudioMode;
  name: string;
  goal: StudioGoal;
  /** Every investigation, held or not, rejected or not. */
  candidates: CandidateInvestigation[];
  /** Named alternatives. The first is the working portfolio. */
  alternatives: PortfolioAlternative[];
  /** Which alternative the learner has actually chosen, by id. */
  selectedAlternativeId: string | null;
  rules: StudioRules;
  stress: StudioStress;
  decisions: DecisionRecord[];
  /**
   * The exact v1 record this project was migrated from, kept verbatim.
   *
   * Migration must never be the reason a learner loses work. If v2 ever reads a
   * v1 field wrongly, the original is still here to recover from, and a v1
   * backup can be re-exported unchanged.
   */
  migratedFrom: { schemaVersion: number; raw: string; migratedAt: string } | null;
}

/** Convenience: the candidate for an instrument, if one has been started. */
export function findCandidate(
  project: StudioProject,
  instrumentId: string,
): CandidateInvestigation | undefined {
  return project.candidates.find((candidate) => candidate.instrumentId === instrumentId);
}

/** The alternative currently being worked on. */
export function workingAlternative(project: StudioProject): PortfolioAlternative | undefined {
  return (
    project.alternatives.find((alternative) => alternative.id === project.selectedAlternativeId) ??
    project.alternatives[0]
  );
}
