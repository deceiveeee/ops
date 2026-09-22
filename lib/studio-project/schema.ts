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

// A finding's shape belongs with the framework it comes from, which is a cited
// paper rather than a decision of this schema's. The dependency runs one way.
import type { ForceFinding } from "./five-forces";
import type { ValueClaim } from "./value-stick";

export type { ForceFinding, ValueClaim };

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

/**
 * One company the learner looked up the figures for themselves.
 *
 * Deliberately not a `CandidateInvestigation`. That record is qualitative — why
 * it is worth owning, what would change my mind — and it points at a catalog
 * instrument. This one is quantitative, and the whole premise is that the
 * business need *not* be one Studio holds data for: the learner reads seven
 * figures out of an annual report and Studio says what they mean. Forcing an
 * `instrumentId` onto it would be inventing a fact, and the uniqueness rule on
 * that field would stop two learners investigating the same company twice.
 *
 * The two are meant to meet eventually — a figure investigation is evidence for
 * a candidate — but nothing here assumes that has happened.
 */
export interface FigureInvestigation {
  id: string;
  createdAt: string;
  updatedAt: string;
  /** The learner's own name for the business. Free text, and never resolved. */
  company: string;
  /**
   * The researched industry it is being read against, by SIC code.
   *
   * Only the handful of industries Studio has built peer figures for. Kept
   * because it is what a peer comparison is keyed on, and empty for a company
   * placed in an industry that has no peers yet.
   */
  sic: string;
  /**
   * The industry whose cost of capital this is judged against, by name.
   *
   * Separate from `sic` because the two lists are different sizes and always
   * will be. Cost of capital is published for ninety-six industries, so almost
   * any company can be judged; peer figures are built one industry at a time
   * and there are five. Storing only the SIC limited the learner to those five
   * for no reason other than that the two facts shared a field.
   *
   * Optional, because records saved before this existed have only a SIC. Read
   * it through `investigationIndustry`, which falls back to the industry that
   * SIC maps to, so an older record keeps answering the same as it always did.
   */
  industry?: string;
  /**
   * The figures entered so far, keyed by figure name.
   *
   * Partial by design: a half-finished investigation is a real state, and the
   * reading surface already says what it cannot tell you yet. Values are stored
   * exactly as typed — Studio never normalises the learner's units, because it
   * cannot know them.
   */
  figures: Record<string, number>;
  /**
   * A risk-free rate the learner supplied, in percent, or null to use the
   * published one. Stored as typed rather than as a fraction, so what comes
   * back is what they entered.
   */
  riskFreePct: number | null;
  /**
   * Where the figures came from, when they were filled in from a filing.
   *
   * Null for figures the learner typed, and absent on every record saved before
   * the SEC lookup existed. Kept because "every supplied figure shows where it
   * came from" has to survive closing the tab: without this, a reopened
   * investigation would show seven numbers with no way to tell which were the
   * company's and which were the learner's own.
   */
  source?: FigureSource | null;
  /**
   * Passages kept from the company's own filings, as evidence for or against
   * the reading these figures produce.
   *
   * They live here rather than on a catalogue record because the company does:
   * Atkore is an investigation of seven figures, not an entry in the catalogue,
   * and its passages belong beside its figures. Absent on every record saved
   * before the reader could keep a passage.
   */
  passages?: KeptPassage[];
  /**
   * Inputs the learner decided the company buys, each tied to a price index
   * through a passage of its own report they kept. Absent on every record saved
   * before 2026-09-14.
   */
  inputs?: InputLink[];
  /**
   * Companies the learner counts as competitors. Absent on every record saved
   * before 2026-09-14.
   */
  peers?: PeerLink[];
  /**
   * What the learner has worked out about the competition this business faces,
   * one finding at a time. Absent on every record saved before 2026-09-22.
   *
   * On the investigation rather than on the industry, because it is a reading of
   * one company's position and two learners looking at the same industry may
   * reach different findings from different filings.
   */
  forces?: ForceFinding[];
  /**
   * Claims that a particular lever on the value stick is at work in this
   * business. Absent on every record saved before 2026-09-22.
   *
   * No numbers: two of the stick's four marks cannot be measured for a real
   * company, so what is kept is which lever, how it is supposed to work, what
   * in the filings shows it, and what would say it was not there.
   */
  valueClaims?: ValueClaim[];
}

/**
 * An input the learner decided the company buys, and the price index standing
 * in for it.
 *
 * It points at a kept passage rather than carrying a quote of its own, so the
 * evidence for the link is a passage the learner can also mark for or against
 * the business in Investigate, and letting that passage go lets the link go.
 */
export interface InputLink {
  id: string;
  savedAt: string;
  /** A series id in lib/studio-project/data/input-cost-library.json. */
  seriesId: string;
  /** The kept passage showing the company buys it. */
  passageId: string;
}

/** A company the learner counts as a competitor. */
export interface PeerLink {
  id: string;
  savedAt: string;
  /** As the report names it, or as EDGAR names it when added by ticker. */
  name: string;
  /** The SEC's number for it, or empty when no company filing with the SEC goes by that name. */
  cik: string;
  ticker: string;
  /** The kept passage naming it, or empty when the learner added it by ticker. */
  passageId: string;
}

/**
 * The filing a set of figures was read out of, and how each one was read.
 *
 * Only the figures still exactly as EDGAR supplied them are listed. Overtyping
 * one drops it from here, because at that moment it stops being the company's
 * number and becomes the learner's.
 */
export interface FigureSource {
  /** The ticker looked up, as EDGAR spells it. */
  ticker: string;
  cik: string;
  /** The company as EDGAR names it, which is often not how the learner does. */
  entityName: string;
  /** The industry SEC files it under, which need not be one Studio researches. */
  sic: string;
  sicDescription: string;
  /** The annual period every figure below covers. */
  periodEnd: string;
  accession: string;
  form: string;
  filed: string;
  /** Keyed by figure name: the XBRL tags read, and how they were combined. */
  figures: Record<string, { concepts: string[]; addedUp: string | null }>;
}

/**
 * A passage kept from a filing, stored so it can be found again.
 *
 * The quote alone is not enough and neither is the offset alone. The filed
 * document never changes, but the text Studio extracts from it can when the
 * extractor improves, and a bare offset would then point at a paragraph the
 * learner never read. So the exact quote travels with up to 32 characters
 * either side and the position it was kept at; `lib/filings/anchor.ts` uses
 * all three to find it again, and says plainly when it cannot.
 */
export interface KeptPassage {
  id: string;
  savedAt: string;
  cik: string;
  accession: string;
  /** The document inside the filing, which is what the reader opens. */
  document: string;
  form: string;
  /** The filing date, or empty for a filing older than the company's index lists. */
  filed: string;
  sectionId: string;
  quote: string;
  prefix: string;
  suffix: string;
  /** Where the quote began in the section text when it was kept. */
  offset: number;
  /**
   * Kept as background until the learner says otherwise. Keeping a passage is
   * one action; deciding what it argues is a judgment, and it is made beside
   * the figures rather than forced at the moment of reading.
   */
  role: EvidenceRole;
  note: string;
}

/**
 * A company the learner investigated and then chose to hold.
 *
 * Studio's own catalogue carries eight investments, each researched here with
 * its filings, fee table and holdings behind it. This is the other kind: a
 * business the learner found, whose figures they read out of its annual report
 * themselves. Keeping the two apart in storage is the point — the interface
 * must never present a company nobody researched as though it came with the
 * same evidence.
 *
 * Deliberately thin. Everything Studio would otherwise claim about an
 * investment — what it holds, what it costs to own, what its filing calls its
 * risks — is absent here because nobody has established it, and an empty field
 * is honest where a plausible-looking one is not.
 */
export interface LearnerInstrument {
  /** Prefixed so it can never collide with a catalogue id. */
  id: string;
  /** What the learner calls the business. */
  name: string;
  /**
   * Which shock the scenario test applies to it.
   *
   * Asked rather than assumed. An instrument whose class is unknown is dealt a
   * zero shock, so guessing wrong here does not produce a visible error — it
   * quietly leaves a holding out of the fall and understates the loss.
   */
  assetClass: "us-equity" | "international-equity";
  /** The investigation this came from, so the figures behind it stay findable. */
  investigationId: string;
  addedAt: string;
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
  /**
   * Companies the learner added themselves, which the catalogue does not carry.
   *
   * Optional, because records saved before this existed have none. Read it as
   * `project.instruments ?? []`.
   */
  instruments?: LearnerInstrument[];
  /**
   * Companies the learner looked the figures up for.
   *
   * Added after v2 shipped, so a record saved before it simply has none;
   * `readStudioRecord` fills the empty list rather than rejecting the project.
   */
  investigations: FigureInvestigation[];
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

/** Whether any portfolio in this project holds it. Matches `unheldCandidates`. */
export function isHeld(project: StudioProject, instrumentId: string): boolean {
  return project.alternatives.some((alternative) =>
    alternative.positions.some((position) => position.instrumentId === instrumentId),
  );
}

/**
 * Where a candidate actually stands, rather than what its record last said.
 *
 * The stored status has never been maintained. `startCandidate` writes
 * `researching` and nothing ever moved it on, so an investment owned outright
 * and fully weighted still described itself as under investigation — which is
 * what the downloadable plan has been printing next to every holding. The one
 * exception ran the other way: the v1 migration marked everything it carried
 * across `selected`, and it stayed selected after the learner removed it.
 *
 * Being held is a fact about the portfolio, so it is read from the portfolio and
 * never stored. Rejecting something is a decision, so that is read from the
 * record, where the learner put it.
 *
 * A stored `selected` on something no longer held is deliberately *not* read as
 * a rejection. The shapes match — it was in, it is out — but the learner never
 * said so. They may have removed it by accident, or to add it back at a
 * different weight, or the migration may simply have assumed it. Writing
 * "rejected" there would fabricate a judgement and put their name on it.
 */
export function candidateStanding(project: StudioProject, instrumentId: string): CandidateStatus {
  if (isHeld(project, instrumentId)) return "selected";
  const status = findCandidate(project, instrumentId)?.status;
  return status === "rejected" || status === "shortlisted" ? status : "researching";
}

/**
 * The investigation to reopen when the learner returns.
 *
 * Most recently touched rather than most recently created, because coming back
 * to an earlier company and adding a figure makes it the one in hand.
 */
export function latestInvestigation(
  project: StudioProject,
): FigureInvestigation | undefined {
  return project.investigations.reduce<FigureInvestigation | undefined>(
    (latest, item) => (!latest || item.updatedAt > latest.updatedAt ? item : latest),
    undefined,
  );
}

/** The alternative currently being worked on. */
export function workingAlternative(project: StudioProject): PortfolioAlternative | undefined {
  return (
    project.alternatives.find((alternative) => alternative.id === project.selectedAlternativeId) ??
    project.alternatives[0]
  );
}
