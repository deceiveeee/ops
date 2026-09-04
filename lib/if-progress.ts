"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgressStore } from "@/lib/progress/store";
import { recordArtifactCheckpoint } from "@/lib/portfolio-workbench";

const MODULE_KEY = "ops-if-completion-v1";
const DRAFT_KEY = "ops-if-philosophy-draft-v1";
const OBSERVATION_NOTE_KEY = "ops-if-market-observation-note-v1";
const BELIEF_STATEMENT_KEY = "ops-if-belief-statement-v1";
const BOND_BRIEF_KEY = "ops-if-bond-risk-brief-v1";
const EQUITY_RISK_POLICY_KEY = "ops-if-equity-risk-policy-v1";
const STATEMENT_BRIEF_KEY = "ops-if-statement-brief-v1";
const VALUATION_RANGE_KEY = "ops-if-valuation-range-v1";
const FRICTION_BUDGET_KEY = "ops-if-friction-budget-v1";
const EVIDENCE_CHECKLIST_KEY = "ops-if-evidence-checklist-v1";
const ARCHITECTURE_DECISION_KEY = "ops-if-architecture-decision-v1";
const TIMING_POLICY_KEY = "ops-if-timing-policy-v1";
const HOLDINGS_SLATE_KEY = "ops-if-holdings-slate-v1";
const OPERATING_PLAN_KEY = "ops-if-operating-plan-v1";

const PROGRESS_EVENT = "ops-if-progress";

export const IF_LESSON_SLUGS = [
  "if-1-1-how-an-investor-builds-a-philosophy",
  "if-1-2-where-philosophy-enters-the-investment-process",
  "if-1-3-comparing-investment-philosophy-families",
  "if-1-4-when-a-philosophy-fits-the-investor",
  "if-2-1-reading-a-bonds-promise",
  "if-2-2-why-market-rates-change-bond-prices",
  "if-2-3-duration-measuring-interest-rate-sensitivity",
  "if-2-4-default-risk-can-the-issuer-deliver",
  "if-2-5-from-credit-rating-to-bond-price",
  "if-3-1-what-risk-means-for-a-shareholder",
  "if-3-2-why-diversification-changes-the-question",
  "if-3-3-what-beta-measures",
  "if-3-4-what-makes-beta-rise-or-fall",
  "if-3-5-choosing-a-risk-measure",
  "if-3-6-build-an-equity-risk-policy",
  "if-pb-05-set-allocation-and-risk-limits",
  "if-4-1-the-three-financial-statements",
  "if-4-2-read-the-balance-sheet",
  "if-4-3-recast-the-business",
  "if-4-4-read-profit-and-leverage",
  "if-4-5-repair-the-investor-view",
  "if-4-6-trace-cash-to-the-investor",
  "if-5-1-estimate-a-valuation-range",
  "if-6-1-count-the-friction",
  "if-7-1-test-the-claim",
  "if-8-1-choose-passive-or-prove-an-edge",
] as const;

export type PhilosophyDraft = {
  marketBelief: string;
  advantageStage: string;
  persistenceReason: string;
  constraints: {
    riskPreference: string;
    horizon: string;
    cashNeeds: string;
    taxConsiderations: string;
    capital: string;
    researchTime: string;
    patience: string;
    analyticalTools: string;
    liquidityNeeds: string;
    underperformanceTolerance: string;
  };
  strategy: string;
  implementationRisks: string;
  executionRule: string;
  evaluationRule: string;
  candidateFamilies: string[];
  familyEvidenceRule: string;
  familyResearchQuestion: string;
  fitFamily: string;
  fitCapacitySummary: string;
  fitReviewRule: string;
  fitOpenQuestion: string;
  evidenceGap: string;
  generatedSummary: string;
  updatedAt: string;
};

/**
 * Mission 2's artifact, as of curriculum amendment 1.
 *
 * The mission used to ask a new learner to originate a market belief before
 * anything had given them grounds for one. It now asks what they can actually
 * observe: read a dated disclosure, watch what the price did, and separate what
 * the evidence supports from what it does not. The belief itself moves to
 * Mission 9, where the evidence method that makes one defensible is taught.
 *
 * `declinedToGeneralise` is a completion state, not a failure. Three cases cannot
 * establish a repeatable pattern, and a learner who says so has given the most
 * evidence-literate answer available to them.
 */
export type MarketObservationNote = {
  /** Which case the note was built from. */
  caseId: "" | "netflix" | "nvidia" | "gamestop";
  /** What the company disclosed. */
  disclosure: string;
  /** What the price did after the disclosure became public. */
  priceResponse: string;
  /** The narrowest explanation the case supports. */
  interpretation: string;
  /** What this case does not establish. */
  uncertainty: string;
  /** What would be needed before generalising from it. */
  nextEvidence: string;
  /** The learner has said three cases are not enough for a market belief. */
  declinedToGeneralise: boolean;
  updatedAt: string;
};

export const EMPTY_OBSERVATION_NOTE: MarketObservationNote = {
  caseId: "",
  disclosure: "",
  priceResponse: "",
  interpretation: "",
  uncertainty: "",
  nextEvidence: "",
  declinedToGeneralise: false,
  updatedAt: "",
};

/**
 * Complete when the learner has recorded an observation they can defend.
 *
 * Declining to generalise satisfies this on purpose: the mission asks what the
 * evidence shows, and "not enough to support a belief" is an answer to that
 * question rather than an evasion of it.
 */
export function isObservationNoteComplete(note: MarketObservationNote): boolean {
  return Boolean(
    note.caseId &&
      note.disclosure.trim() &&
      note.priceResponse.trim() &&
      note.interpretation.trim() &&
      note.uncertainty.trim() &&
      note.nextEvidence.trim(),
  );
}

/**
 * Mission 2's decision, kept in its own record.
 *
 * It used to live inside `PhilosophyDraft`, which six components across three
 * missions wrote to: 1.4 stored the learner's constraints there, 1.2 the process
 * placement, 1.3 the candidate families. One record for three missions meant the
 * Workbench could not tell whose work had arrived, and the curriculum is explicit
 * that every mission is one decision saved into one checkpoint.
 *
 * Mission 1's material stays in the draft for now. Whether Mission 1 should own a
 * Mandate record of its own, rather than Mission 5's Readiness Runway writing the
 * mandate, is the stakeholder review the mission curriculum still has pending —
 * so this splits out what is already settled and leaves that question open.
 */
export type BeliefStatement = {
  marketBelief: string;
  persistenceReason: string;
  evidenceGap: string;
  generatedSummary: string;
  updatedAt: string;
};

export const EMPTY_BELIEF_STATEMENT: BeliefStatement = {
  marketBelief: "",
  persistenceReason: "",
  evidenceGap: "",
  generatedSummary: "",
  updatedAt: "",
};

export const EMPTY_DRAFT: PhilosophyDraft = {
  marketBelief: "",
  advantageStage: "",
  persistenceReason: "",
  constraints: {
    riskPreference: "",
    horizon: "",
    cashNeeds: "",
    taxConsiderations: "",
    capital: "",
    researchTime: "",
    patience: "",
    analyticalTools: "",
    liquidityNeeds: "",
    underperformanceTolerance: "",
  },
  strategy: "",
  implementationRisks: "",
  executionRule: "",
  evaluationRule: "",
  candidateFamilies: [],
  familyEvidenceRule: "",
  familyResearchQuestion: "",
  fitFamily: "",
  fitCapacitySummary: "",
  fitReviewRule: "",
  fitOpenQuestion: "",
  evidenceGap: "",
  generatedSummary: "",
  updatedAt: "",
};

export type BondRiskBrief = {
  paymentPromise: string;
  rateRisk: string;
  durationFinding: string;
  defaultEvidence: string;
  pricingDecision: string;
  updatedAt: string;
};

export const EMPTY_BOND_BRIEF: BondRiskBrief = {
  paymentPromise: "",
  rateRisk: "",
  durationFinding: "",
  defaultEvidence: "",
  pricingDecision: "",
  updatedAt: "",
};

export type EquityRiskPolicy = {
  riskDefinition: string;
  portfolioContext: string;
  betaInterpretation: string;
  fundamentalDrivers: string;
  methodStack: string;
  priceRule: string;
  decision: string;
  remainingUncertainty: string;
  updatedAt: string;
};

export const EMPTY_EQUITY_RISK_POLICY: EquityRiskPolicy = {
  riskDefinition: "",
  portfolioContext: "",
  betaInterpretation: "",
  fundamentalDrivers: "",
  methodStack: "",
  priceRule: "",
  decision: "",
  remainingUncertainty: "",
  updatedAt: "",
};

export type InvestorStatementBrief = {
  statementMap: string;
  balanceSheetFinding: string;
  financialRecast: string;
  profitabilityFinding: string;
  adjustmentFinding: string;
  cashFlowFinding: string;
  decision: string;
  remainingQuestion: string;
  updatedAt: string;
};

export const EMPTY_STATEMENT_BRIEF: InvestorStatementBrief = {
  statementMap: "",
  balanceSheetFinding: "",
  financialRecast: "",
  profitabilityFinding: "",
  adjustmentFinding: "",
  cashFlowFinding: "",
  decision: "",
  remainingQuestion: "",
  updatedAt: "",
};

export type ValuationRangeArtifact = {
  claim: string;
  method: string;
  requiredReturn: number;
  lowValue: number;
  baseValue: number;
  highValue: number;
  observedPrice: number;
  decisionBuffer: number;
  buyBelow: number;
  decision: string;
  relativeCheck: string;
  evidenceTriggers: string[];
  updatedAt: string;
};

export const EMPTY_VALUATION_RANGE: ValuationRangeArtifact = {
  claim: "",
  method: "",
  requiredReturn: 0,
  lowValue: 0,
  baseValue: 0,
  highValue: 0,
  observedPrice: 0,
  decisionBuffer: 0,
  buyBelow: 0,
  decision: "",
  relativeCheck: "",
  evidenceTriggers: [],
  updatedAt: "",
};

/**
 * Mission 8. `estimatedAnnualDrag` is a decimal fraction (0.019 = 1.9%), and
 * `hurdleRule` is the sentence the learner carries into mission 10: the return a
 * strategy must beat before it beats an index.
 */
export type FrictionBudget = {
  turnoverExpectation: string;
  spreadClass: string;
  priceImpactExposure: string;
  waitingSensitivity: string;
  taxSetting: string;
  estimatedAnnualDrag: number;
  hurdleRule: string;
  updatedAt: string;
};

export const EMPTY_FRICTION_BUDGET: FrictionBudget = {
  turnoverExpectation: "",
  spreadClass: "",
  priceImpactExposure: "",
  waitingSensitivity: "",
  taxSetting: "",
  estimatedAnnualDrag: 0,
  hurdleRule: "",
  updatedAt: "",
};

/** One leg of a round trip when Mission 8 has not been done yet, in percent. */
export const FRICTION_FALLBACK_ONE_WAY_PCT = 0.5;

/**
 * Convert Mission 8's decimal-fraction drag into one round-trip leg expressed
 * in percentage points, which is the unit consumed by Missions 11 and 12.
 */
export function frictionOneWayPct(
  budget: FrictionBudget | null | undefined,
): number {
  const annualDrag = Number(budget?.estimatedAnnualDrag ?? 0);
  if (!Number.isFinite(annualDrag) || annualDrag <= 0) {
    return FRICTION_FALLBACK_ONE_WAY_PCT;
  }
  return (annualDrag * 100) / 2;
}

/**
 * Mission 9. How this learner will decide whether a claim about beating the
 * market survives contact with evidence — the test, the guards against the
 * usual biases, and the return it has to clear once risk and their own friction
 * are both charged.
 */
export type EvidenceChecklist = {
  benchmark: string;
  testDesign: string;
  holdoutRule: string;
  samplingRule: string;
  hurdleRule: string;
  abandonRule: string;
  updatedAt: string;
};

export const EMPTY_EVIDENCE_CHECKLIST: EvidenceChecklist = {
  benchmark: "",
  testDesign: "",
  holdoutRule: "",
  samplingRule: "",
  hurdleRule: "",
  abandonRule: "",
  updatedAt: "",
};

/**
 * Mission 10. The architecture this learner will actually run: a passive core,
 * and an active sleeve only if a specific falsifiable edge survived the base
 * rate, their evidence design, their own friction, and mission 5's loss budget.
 *
 * `mode: "passive-only"` is a complete outcome, not an unfinished one — the
 * sleeve fields stay empty and nothing downstream should treat that as a gap.
 */
/**
 * Mission 11's artifact. Two outcomes are equally complete:
 *
 * `mode: "no-timing"` is a decision, not an empty policy — the bounded fields
 * stay blank and nothing downstream should read that as a gap.
 *
 * `mode: "bounded"` requires every bounded field. A rule without an expiry and
 * a stop is not a policy; Session 34 slide 18 is explicit that an unbounded
 * switch raises the cost of being wrong, and "wait until it feels safe" is the
 * unbounded case wearing a reasonable face.
 */
export type TimingPolicy = {
  mode: "" | "no-timing" | "bounded";
  /** Why, in the learner's words. Required for both modes. */
  reason: string;
  /** Bounded fields — populated only when mode is "bounded". */
  signal: string;
  benchmark: string;
  maxDeviationPct: number;
  eligibleSleeve: string;
  expiryDate: string;
  falsifier: string;
  reviewDate: string;
  /** Percentage points, charged from the saved Mission 8 budget, not typed by the learner. */
  frictionCostPct: number;
  updatedAt: string;
};

export const EMPTY_TIMING_POLICY: TimingPolicy = {
  mode: "",
  reason: "",
  signal: "",
  benchmark: "",
  maxDeviationPct: 0,
  eligibleSleeve: "",
  expiryDate: "",
  falsifier: "",
  reviewDate: "",
  frictionCostPct: 0,
  updatedAt: "",
};

/**
 * A saved policy is complete only if its own mode's requirements are met.
 * Kept here rather than in the component so the dossier and the course rail
 * agree with the lesson about what "saved" means.
 */
export function isTimingPolicyComplete(policy: TimingPolicy): boolean {
  if (!policy.updatedAt) return false;
  if (policy.mode === "no-timing") return policy.reason.trim().length > 0;
  if (policy.mode === "bounded") {
    return (
      policy.reason.trim().length > 0 &&
      policy.signal.trim().length > 0 &&
      policy.benchmark.trim().length > 0 &&
      policy.maxDeviationPct > 0 &&
      policy.eligibleSleeve.trim().length > 0 &&
      policy.expiryDate.trim().length > 0 &&
      policy.falsifier.trim().length > 0 &&
      policy.reviewDate.trim().length > 0
    );
  }
  return false;
}

export type ArchitectureDecision = {
  mode: "" | "passive-only" | "active-sleeve";
  coreExposure: string;
  coreBenchmark: string;
  /** Dated current base rate, kept with its scope so it cannot be quoted bare. */
  baseRate: string;
  baseRateDate: string;
  baseRateScope: string;
  /** Sleeve fields — populated only when mode is "active-sleeve". */
  pocket: string;
  whoIsWrong: string;
  correctionMechanism: string;
  capability: string;
  falsifiableClaim: string;
  disconfirming: string;
  evidenceDesign: string;
  grossEdgePct: number;
  frictionPct: number;
  netEdgePct: number;
  maxAllocationPct: number;
  lossContributionPct: number;
  durabilityRisk: string;
  thesisBreak: string;
  reviewDate: string;
  updatedAt: string;
};

export const EMPTY_ARCHITECTURE_DECISION: ArchitectureDecision = {
  mode: "",
  coreExposure: "",
  coreBenchmark: "",
  baseRate: "",
  baseRateDate: "",
  baseRateScope: "",
  pocket: "",
  whoIsWrong: "",
  correctionMechanism: "",
  capability: "",
  falsifiableClaim: "",
  disconfirming: "",
  evidenceDesign: "",
  grossEdgePct: 0,
  frictionPct: 0,
  netEdgePct: 0,
  maxAllocationPct: 0,
  lossContributionPct: 0,
  durabilityRisk: "",
  thesisBreak: "",
  reviewDate: "",
  updatedAt: "",
};

/**
 * Mission 12 — the Holdings Slate.
 *
 * A slate line names a *class*, not a ticker. That is the whole mission: a
 * ticker identifies a share class of a series, and two tickers can be the
 * same portfolio, so an order recording only "VTI" has not recorded what
 * was bought.
 */
export type SlateLine = {
  ticker: string;
  seriesId: string;
  classId: string;
  sleeve: string;
  targetWeightPct: number;
};

/**
 * A draft, and only ever a draft. `transmitted` is typed as `false` rather
 * than `boolean` so no code path can set it: there is no submission endpoint
 * in this product, and the type says so.
 */
export type OrderDraft = {
  ticker: string;
  classId: string;
  direction: "" | "buy" | "sell";
  approxAmountUsd: number;
  orderType: "" | "market" | "limit";
  /** Percentage points, charged from the saved Mission 8 budget, not typed by the learner. */
  estimatedFrictionPct: number;
  transmitted: false;
};

export const EMPTY_ORDER_DRAFT: OrderDraft = {
  ticker: "",
  classId: "",
  direction: "",
  approxAmountUsd: 0,
  orderType: "",
  estimatedFrictionPct: 0,
  transmitted: false,
};

export type HoldingsSlate = {
  lines: SlateLine[];
  /** Which key the learner ran the look-through on. The key changes the answer. */
  issuerKeyMode: "" | "instrument" | "issuer";
  /** The learner saw the duplication and repaired or annotated it. */
  overlapAcknowledged: boolean;
  /** The learner stated what the stale holdings date does and does not support. */
  staleDataAcknowledged: boolean;
  orderDraft: OrderDraft;
  /** Set when an upstream artifact changed after this slate was saved. */
  reviewRequired: boolean;
  updatedAt: string;
};

export const EMPTY_HOLDINGS_SLATE: HoldingsSlate = {
  lines: [],
  issuerKeyMode: "",
  overlapAcknowledged: false,
  staleDataAcknowledged: false,
  orderDraft: EMPTY_ORDER_DRAFT,
  reviewRequired: false,
  updatedAt: "",
};

/**
 * Complete on its own terms. Upstream validity is a separate question — see
 * `holdingsSlateBlockers` — because a slate can be internally finished and
 * still be invalidated by a Mission 10 or 11 change.
 */
export function isHoldingsSlateComplete(slate: HoldingsSlate): boolean {
  if (!slate.updatedAt) return false;
  if (slate.lines.length === 0) return false;

  const weighted = slate.lines.filter((l) => l.targetWeightPct > 0);
  if (weighted.length === 0) return false;

  // Exact identity: a line without a class id has not identified a product.
  if (weighted.some((l) => !l.classId.trim() || !l.seriesId.trim())) return false;

  // Every holding maps to a sleeve.
  if (weighted.some((l) => !l.sleeve.trim())) return false;

  // Total target weights remain coherent.
  const total = weighted.reduce((t, l) => t + l.targetWeightPct, 0);
  if (total <= 0 || total > 100) return false;

  // No duplicate legal product in the slate.
  const classIds = weighted.map((l) => l.classId);
  if (new Set(classIds).size !== classIds.length) return false;

  if (!slate.overlapAcknowledged || !slate.staleDataAcknowledged) return false;
  if (!slate.issuerKeyMode) return false;

  const order = slate.orderDraft;
  return (
    Boolean(order.classId.trim()) &&
    order.direction !== "" &&
    order.orderType !== "" &&
    order.approxAmountUsd > 0
  );
}

/**
 * Reasons the slate cannot be marked "Products verified", in learner-facing
 * words. Kept here rather than in the component so the dossier and the course
 * rail give the same answer as the lesson.
 */
export function holdingsSlateBlockers(
  slate: HoldingsSlate,
  architecture: ArchitectureDecision,
  timing: TimingPolicy,
): string[] {
  const blockers: string[] = [];

  if (!architecture.updatedAt) {
    blockers.push("Mission 10's architecture licence has not been saved yet.");
  }
  // An explicit "no timing" is a valid policy, not a missing one.
  if (!isTimingPolicyComplete(timing)) {
    blockers.push(
      "Mission 11's timing policy is missing or incomplete. Choosing no timing counts, but it has to be written down.",
    );
  }
  if (slate.reviewRequired) {
    blockers.push(
      "An upstream decision changed after this slate was saved. Review it before relying on it.",
    );
  }
  if (!isHoldingsSlateComplete(slate)) {
    blockers.push("The slate itself is not finished.");
  }
  return blockers;
}

/**
 * Mission 13 — the Operating Plan and IPS.
 *
 * Only two of the CFA's sixteen IPS elements are new work here: the review
 * process (2b) and the rebalancing process (4c). The other fourteen are read
 * from Missions 1-12, which is why this type carries rules and responses
 * rather than a copy of the portfolio.
 */
export type ScenarioResponse = {
  /** What changed, in the learner's words. */
  whatChanged: string;
  /** Which saved policy or checkpoint controls the response. */
  controllingPolicy: string;
  /** Act, do not act, or review. */
  response: "" | "act" | "no-action" | "review";
  /** What downstream work this affects. */
  downstream: string;
  /** The evidence that would change the answer. */
  wouldChangeIf: string;
  /**
   * True where the learner's saved policy is silent on this scenario. Not a
   * failure — it is the most useful thing the flight test can surface, and it
   * sends them back to the rule writer with a specific gap.
   */
  policySilent: boolean;
};

export const EMPTY_SCENARIO_RESPONSE: ScenarioResponse = {
  whatChanged: "",
  controllingPolicy: "",
  response: "",
  downstream: "",
  wouldChangeIf: "",
  policySilent: false,
};

export type RebalanceRule = {
  /** Investor.gov gives two trigger types; the number is the learner's own. */
  trigger: "" | "calendar" | "threshold";
  /** Months between reviews, when the trigger is calendar-based. */
  cadenceMonths: number;
  /** The band in basis points, when the trigger is threshold-based. */
  bandBps: number;
  /** Which of the three Investor.gov methods the plan uses by default. */
  method: "" | "sell-and-buy" | "new-money" | "redirect-flows";
};

export const EMPTY_REBALANCE_RULE: RebalanceRule = {
  trigger: "",
  cadenceMonths: 0,
  bandBps: 0,
  method: "",
};

export type OperatingPlan = {
  mode: "" | "personal" | "practice";
  /** CFA element 2b — the one governance element with real force for a solo investor. */
  reviewProcess: string;
  /** CFA element 4c. */
  rebalanceRule: RebalanceRule;
  contributionRule: string;
  withdrawalRule: string;
  sellReplaceRule: string;
  thesisBreakRule: string;
  /** Keyed by scenario id; the flight test has nine. */
  scenarioResponses: Record<string, ScenarioResponse>;
  transferCaseId: string;
  transferCasePassed: boolean;
  /** Any one of these fails the case outright. Never a score. */
  criticalFailures: string[];
  updatedAt: string;
};

export const EMPTY_OPERATING_PLAN: OperatingPlan = {
  mode: "",
  reviewProcess: "",
  rebalanceRule: EMPTY_REBALANCE_RULE,
  contributionRule: "",
  withdrawalRule: "",
  sellReplaceRule: "",
  thesisBreakRule: "",
  scenarioResponses: {},
  transferCaseId: "",
  transferCasePassed: false,
  criticalFailures: [],
  updatedAt: "",
};

/** A rebalance rule is complete only if its chosen trigger carries its number. */
export function isRebalanceRuleComplete(rule: RebalanceRule): boolean {
  if (!rule.method) return false;
  if (rule.trigger === "calendar") return rule.cadenceMonths > 0;
  if (rule.trigger === "threshold") return rule.bandBps > 0;
  return false;
}

/**
 * Complete on its own terms. Whether it reaches Practice-complete or
 * Execute-ready is a separate question answered by `completionState` in
 * lib/operating-plan.ts, because that depends on all twelve prior checkpoints.
 */
export function isOperatingPlanComplete(plan: OperatingPlan): boolean {
  if (!plan.updatedAt || !plan.mode) return false;
  if (!plan.reviewProcess.trim()) return false;
  if (!isRebalanceRuleComplete(plan.rebalanceRule)) return false;
  if (!plan.contributionRule.trim()) return false;
  if (!plan.withdrawalRule.trim()) return false;
  if (!plan.sellReplaceRule.trim()) return false;
  if (!plan.thesisBreakRule.trim()) return false;

  // Every scenario answered, and a silent policy counts as answered only when
  // the learner has said what would control instead.
  const answered = Object.values(plan.scenarioResponses).filter(
    (r) => r.response !== "" && r.controllingPolicy.trim().length > 0,
  );
  if (answered.length < 9) return false;

  return plan.transferCasePassed && plan.criticalFailures.length === 0;
}

function readDraft(): PhilosophyDraft {

  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? ({ ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<PhilosophyDraft>) }) : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}

/**
 * The economic content of an artifact, with the save timestamp removed.
 *
 * Every saver stamps `updatedAt`, so comparing stored JSON directly would call
 * each re-save a change. `commitCheckpoint` reopens dependent work whenever a
 * checkpoint moves, which would mean pressing save twice on one mission sent
 * every downstream mission back for review. `saveMandateRecord` already refuses
 * that trade in the Workbench; this refuses it on the way in.
 */
function economicContent(value: unknown): string {
  if (!value || typeof value !== "object") return JSON.stringify(value);
  const { updatedAt: _updatedAt, ...rest } = value as Record<string, unknown>;
  return JSON.stringify(rest);
}

function storedArtifact(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : (JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

function artifactChanged(key: string, next: unknown): boolean {
  const previous = storedArtifact(key);
  if (previous === null) return true;
  return economicContent(previous) !== economicContent(next);
}

/**
 * The draft carries Mission 1's constraints and the optional lab's candidate
 * families. It owns no checkpoint: Mission 2's belief moved to its own record,
 * and Mission 1's mandate is written by Mission 5's Readiness Runway.
 */
function writeDraft(d: PhilosophyDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readObservationNote(): MarketObservationNote {
  if (typeof window === "undefined") return EMPTY_OBSERVATION_NOTE;
  try {
    const raw = window.localStorage.getItem(OBSERVATION_NOTE_KEY);
    return raw
      ? { ...EMPTY_OBSERVATION_NOTE, ...(JSON.parse(raw) as Partial<MarketObservationNote>) }
      : EMPTY_OBSERVATION_NOTE;
  } catch {
    return EMPTY_OBSERVATION_NOTE;
  }
}

function writeObservationNote(note: MarketObservationNote) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(OBSERVATION_NOTE_KEY, note);
    window.localStorage.setItem(OBSERVATION_NOTE_KEY, JSON.stringify(note));
    // Mission 2's checkpoint. It moves only on a note the learner could defend,
    // which is what isObservationNoteComplete tests.
    if (changed && isObservationNoteComplete(note)) {
      recordArtifactCheckpoint(window.localStorage, "beliefs", "market observation", "Market observations changed; the architecture and operating plan that rest on them need review.");
    }
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

/**
 * Reads the belief statement, adopting a pre-split draft where one exists.
 *
 * Migration is by derivation rather than by rewriting storage on read: a learner
 * who stated a belief before the split keeps seeing it, in the dossier and in
 * the lesson, and the old fields are superseded the first time they save.
 */
function readBeliefStatement(): BeliefStatement {
  if (typeof window === "undefined") return EMPTY_BELIEF_STATEMENT;
  try {
    const raw = window.localStorage.getItem(BELIEF_STATEMENT_KEY);
    if (raw) {
      return { ...EMPTY_BELIEF_STATEMENT, ...(JSON.parse(raw) as Partial<BeliefStatement>) };
    }
    const legacy = readDraft();
    if (!legacy.marketBelief.trim() && !legacy.persistenceReason.trim() && !legacy.evidenceGap.trim()) {
      return EMPTY_BELIEF_STATEMENT;
    }
    return {
      marketBelief: legacy.marketBelief,
      persistenceReason: legacy.persistenceReason,
      evidenceGap: legacy.evidenceGap,
      generatedSummary: legacy.generatedSummary,
      updatedAt: legacy.updatedAt,
    };
  } catch {
    return EMPTY_BELIEF_STATEMENT;
  }
}

function writeBeliefStatement(statement: BeliefStatement) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(BELIEF_STATEMENT_KEY, statement);
    window.localStorage.setItem(BELIEF_STATEMENT_KEY, JSON.stringify(statement));
    // Curriculum amendment 1 moved the belief statement to Mission 9 and gave
    // Mission 2's beliefs checkpoint to the observation note. The belief rides
    // on Mission 9's own checkpoint instead: the mission owns the evidence
    // method, and the learner's belief is the first claim that method is
    // applied to. Declining to hold a position counts - Mission 10 treats a
    // fully passive decision as a complete outcome for the same reason.
    const stated =
      statement.marketBelief.trim().length > 0 &&
      statement.persistenceReason.trim().length > 0 &&
      statement.evidenceGap.trim().length > 0;
    if (changed && stated) {
      recordArtifactCheckpoint(window.localStorage, "evidence-test", "market belief", "The market belief changed; the architecture, timing policy and operating plan that rest on it need review.");
    }
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readBondBrief(): BondRiskBrief {
  if (typeof window === "undefined") return EMPTY_BOND_BRIEF;
  try {
    const raw = window.localStorage.getItem(BOND_BRIEF_KEY);
    return raw
      ? { ...EMPTY_BOND_BRIEF, ...(JSON.parse(raw) as Partial<BondRiskBrief>) }
      : EMPTY_BOND_BRIEF;
  } catch {
    return EMPTY_BOND_BRIEF;
  }
}

function writeBondBrief(brief: BondRiskBrief) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(BOND_BRIEF_KEY, brief);
    window.localStorage.setItem(BOND_BRIEF_KEY, JSON.stringify(brief));
    if (changed) recordArtifactCheckpoint(window.localStorage, "bond-risk", "bond risk policy", "Bond risk policy changed; allocation, architecture and the operating plan need review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readEquityRiskPolicy(): EquityRiskPolicy {
  if (typeof window === "undefined") return EMPTY_EQUITY_RISK_POLICY;
  try {
    const raw = window.localStorage.getItem(EQUITY_RISK_POLICY_KEY);
    return raw
      ? {
          ...EMPTY_EQUITY_RISK_POLICY,
          ...(JSON.parse(raw) as Partial<EquityRiskPolicy>),
        }
      : EMPTY_EQUITY_RISK_POLICY;
  } catch {
    return EMPTY_EQUITY_RISK_POLICY;
  }
}

function writeEquityRiskPolicy(policy: EquityRiskPolicy) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(EQUITY_RISK_POLICY_KEY, policy);
    window.localStorage.setItem(EQUITY_RISK_POLICY_KEY, JSON.stringify(policy));
    if (changed) recordArtifactCheckpoint(window.localStorage, "required-return", "required return", "Required return changed; allocation, architecture and the operating plan need review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readStatementBrief(): InvestorStatementBrief {
  if (typeof window === "undefined") return EMPTY_STATEMENT_BRIEF;
  try {
    const raw = window.localStorage.getItem(STATEMENT_BRIEF_KEY);
    return raw
      ? {
          ...EMPTY_STATEMENT_BRIEF,
          ...(JSON.parse(raw) as Partial<InvestorStatementBrief>),
        }
      : EMPTY_STATEMENT_BRIEF;
  } catch {
    return EMPTY_STATEMENT_BRIEF;
  }
}

function writeStatementBrief(brief: InvestorStatementBrief) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(STATEMENT_BRIEF_KEY, brief);
    window.localStorage.setItem(STATEMENT_BRIEF_KEY, JSON.stringify(brief));
    if (changed) recordArtifactCheckpoint(window.localStorage, "evidence", "business evidence", "Business evidence changed; architecture, holdings and the operating plan need review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readValuationRange(): ValuationRangeArtifact {
  if (typeof window === "undefined") return EMPTY_VALUATION_RANGE;
  try {
    const raw = window.localStorage.getItem(VALUATION_RANGE_KEY);
    return raw
      ? {
          ...EMPTY_VALUATION_RANGE,
          ...(JSON.parse(raw) as Partial<ValuationRangeArtifact>),
        }
      : EMPTY_VALUATION_RANGE;
  } catch {
    return EMPTY_VALUATION_RANGE;
  }
}

function writeValuationRange(artifact: ValuationRangeArtifact) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(VALUATION_RANGE_KEY, artifact);
    window.localStorage.setItem(VALUATION_RANGE_KEY, JSON.stringify(artifact));
    if (changed) recordArtifactCheckpoint(window.localStorage, "valuation", "valuation range", "Valuation changed; architecture, holdings and the operating plan need review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readFrictionBudget(): FrictionBudget {
  if (typeof window === "undefined") return EMPTY_FRICTION_BUDGET;
  try {
    const raw = window.localStorage.getItem(FRICTION_BUDGET_KEY);
    return raw
      ? {
          ...EMPTY_FRICTION_BUDGET,
          ...(JSON.parse(raw) as Partial<FrictionBudget>),
        }
      : EMPTY_FRICTION_BUDGET;
  } catch {
    return EMPTY_FRICTION_BUDGET;
  }
}

function readEvidenceChecklist(): EvidenceChecklist {
  if (typeof window === "undefined") return EMPTY_EVIDENCE_CHECKLIST;
  try {
    const raw = window.localStorage.getItem(EVIDENCE_CHECKLIST_KEY);
    return raw
      ? {
          ...EMPTY_EVIDENCE_CHECKLIST,
          ...(JSON.parse(raw) as Partial<EvidenceChecklist>),
        }
      : EMPTY_EVIDENCE_CHECKLIST;
  } catch {
    return EMPTY_EVIDENCE_CHECKLIST;
  }
}

function writeEvidenceChecklist(checklist: EvidenceChecklist) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(EVIDENCE_CHECKLIST_KEY, checklist);
    window.localStorage.setItem(EVIDENCE_CHECKLIST_KEY, JSON.stringify(checklist));
    if (changed) recordArtifactCheckpoint(window.localStorage, "evidence-test", "evidence test", "Evidence test changed; architecture, timing and the operating plan need review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readTimingPolicy(): TimingPolicy {
  if (typeof window === "undefined") return EMPTY_TIMING_POLICY;
  try {
    const raw = window.localStorage.getItem(TIMING_POLICY_KEY);
    return raw
      ? { ...EMPTY_TIMING_POLICY, ...(JSON.parse(raw) as Partial<TimingPolicy>) }
      : EMPTY_TIMING_POLICY;
  } catch {
    return EMPTY_TIMING_POLICY;
  }
}

function writeTimingPolicy(policy: TimingPolicy) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(TIMING_POLICY_KEY, policy);
    window.localStorage.setItem(TIMING_POLICY_KEY, JSON.stringify(policy));
    if (changed) recordArtifactCheckpoint(window.localStorage, "timing", "timing policy", "Timing policy changed; holdings and the operating plan need review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readArchitectureDecision(): ArchitectureDecision {
  if (typeof window === "undefined") return EMPTY_ARCHITECTURE_DECISION;
  try {
    const raw = window.localStorage.getItem(ARCHITECTURE_DECISION_KEY);
    return raw
      ? {
          ...EMPTY_ARCHITECTURE_DECISION,
          ...(JSON.parse(raw) as Partial<ArchitectureDecision>),
        }
      : EMPTY_ARCHITECTURE_DECISION;
  } catch {
    return EMPTY_ARCHITECTURE_DECISION;
  }
}

function writeArchitectureDecision(decision: ArchitectureDecision) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(ARCHITECTURE_DECISION_KEY, decision);
    window.localStorage.setItem(ARCHITECTURE_DECISION_KEY, JSON.stringify(decision));
    if (changed) recordArtifactCheckpoint(window.localStorage, "architecture", "architecture decision", "Architecture changed; timing, holdings and the operating plan need review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readHoldingsSlate(): HoldingsSlate {
  if (typeof window === "undefined") return EMPTY_HOLDINGS_SLATE;
  try {
    const raw = window.localStorage.getItem(HOLDINGS_SLATE_KEY);
    if (!raw) return EMPTY_HOLDINGS_SLATE;
    const parsed = JSON.parse(raw) as Partial<HoldingsSlate>;
    return {
      ...EMPTY_HOLDINGS_SLATE,
      ...parsed,
      // Arrays and the nested draft need their own defaults, or a slate saved
      // by an older build arrives with `lines` undefined and every consumer
      // has to guard it.
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
      orderDraft: { ...EMPTY_ORDER_DRAFT, ...(parsed.orderDraft ?? {}) },
    };
  } catch {
    return EMPTY_HOLDINGS_SLATE;
  }
}

function writeHoldingsSlate(slate: HoldingsSlate) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(HOLDINGS_SLATE_KEY, slate);
    window.localStorage.setItem(HOLDINGS_SLATE_KEY, JSON.stringify(slate));
    if (changed) recordArtifactCheckpoint(window.localStorage, "holdings", "holdings slate", "Holdings changed; the operating plan needs review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function readOperatingPlan(): OperatingPlan {
  if (typeof window === "undefined") return EMPTY_OPERATING_PLAN;
  try {
    const raw = window.localStorage.getItem(OPERATING_PLAN_KEY);
    if (!raw) return EMPTY_OPERATING_PLAN;
    const parsed = JSON.parse(raw) as Partial<OperatingPlan>;
    return {
      ...EMPTY_OPERATING_PLAN,
      ...parsed,
      // Nested shapes need their own defaults, or a plan saved by an older
      // build arrives with an undefined rule and every consumer guards it.
      rebalanceRule: {
        ...EMPTY_REBALANCE_RULE,
        ...(parsed.rebalanceRule ?? {}),
      },
      scenarioResponses: parsed.scenarioResponses ?? {},
      criticalFailures: Array.isArray(parsed.criticalFailures)
        ? parsed.criticalFailures
        : [],
    };
  } catch {
    return EMPTY_OPERATING_PLAN;
  }
}

function writeOperatingPlan(plan: OperatingPlan) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(OPERATING_PLAN_KEY, plan);
    window.localStorage.setItem(OPERATING_PLAN_KEY, JSON.stringify(plan));
    if (changed) recordArtifactCheckpoint(window.localStorage, "policy", "operating plan", "Operating plan changed.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function writeFrictionBudget(budget: FrictionBudget) {
  if (typeof window === "undefined") return;
  try {
    const changed = artifactChanged(FRICTION_BUDGET_KEY, budget);
    window.localStorage.setItem(FRICTION_BUDGET_KEY, JSON.stringify(budget));
    if (changed) recordArtifactCheckpoint(window.localStorage, "friction", "friction budget", "Friction budget changed; architecture, timing and the operating plan need review.");
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

export function useIFProgress() {
  const store = useProgressStore();
  const completion = useMemo(
    () => store.getModuleCompletion(MODULE_KEY),
    [store],
  );
  const [draft, setDraftState] = useState<PhilosophyDraft>(EMPTY_DRAFT);
  const [beliefStatement, setBeliefStatementState] =
    useState<BeliefStatement>(EMPTY_BELIEF_STATEMENT);
  const [observationNote, setObservationNoteState] =
    useState<MarketObservationNote>(EMPTY_OBSERVATION_NOTE);
  const [bondBrief, setBondBriefState] =
    useState<BondRiskBrief>(EMPTY_BOND_BRIEF);
  const [equityRiskPolicy, setEquityRiskPolicyState] =
    useState<EquityRiskPolicy>(EMPTY_EQUITY_RISK_POLICY);
  const [statementBrief, setStatementBriefState] =
    useState<InvestorStatementBrief>(EMPTY_STATEMENT_BRIEF);
  const [valuationRange, setValuationRangeState] =
    useState<ValuationRangeArtifact>(EMPTY_VALUATION_RANGE);
  const [frictionBudget, setFrictionBudgetState] =
    useState<FrictionBudget>(EMPTY_FRICTION_BUDGET);
  const [evidenceChecklist, setEvidenceChecklistState] =
    useState<EvidenceChecklist>(EMPTY_EVIDENCE_CHECKLIST);
  const [architectureDecision, setArchitectureDecisionState] =
    useState<ArchitectureDecision>(EMPTY_ARCHITECTURE_DECISION);
  const [timingPolicy, setTimingPolicyState] =
    useState<TimingPolicy>(EMPTY_TIMING_POLICY);
  const [holdingsSlate, setHoldingsSlateState] =
    useState<HoldingsSlate>(EMPTY_HOLDINGS_SLATE);
  const [operatingPlan, setOperatingPlanState] =
    useState<OperatingPlan>(EMPTY_OPERATING_PLAN);

  useEffect(() => {
    setDraftState(readDraft());
    setBeliefStatementState(readBeliefStatement());
    setObservationNoteState(readObservationNote());
    setBondBriefState(readBondBrief());
    setEquityRiskPolicyState(readEquityRiskPolicy());
    setStatementBriefState(readStatementBrief());
    setValuationRangeState(readValuationRange());
    setFrictionBudgetState(readFrictionBudget());
    setEvidenceChecklistState(readEvidenceChecklist());
    setArchitectureDecisionState(readArchitectureDecision());
    setTimingPolicyState(readTimingPolicy());
    setHoldingsSlateState(readHoldingsSlate());
    setOperatingPlanState(readOperatingPlan());
    const onChange = () => {
      setDraftState(readDraft());
      setBeliefStatementState(readBeliefStatement());
      setObservationNoteState(readObservationNote());
      setBondBriefState(readBondBrief());
      setEquityRiskPolicyState(readEquityRiskPolicy());
      setStatementBriefState(readStatementBrief());
      setValuationRangeState(readValuationRange());
      setFrictionBudgetState(readFrictionBudget());
      setEvidenceChecklistState(readEvidenceChecklist());
      setArchitectureDecisionState(readArchitectureDecision());
      setTimingPolicyState(readTimingPolicy());
      setHoldingsSlateState(readHoldingsSlate());
      setOperatingPlanState(readOperatingPlan());
    };
    window.addEventListener(PROGRESS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const markComplete = useCallback(
    (slug: string) => store.markComplete(MODULE_KEY, slug),
    [store],
  );

  const isComplete = useCallback(
    (slug: string) => Boolean(completion[slug]),
    [completion],
  );

  const saveObservationNote = useCallback((note: MarketObservationNote) => {
    const stamped = { ...note, updatedAt: new Date().toISOString() };
    writeObservationNote(stamped);
    setObservationNoteState(stamped);
  }, []);

  const saveBeliefStatement = useCallback((statement: BeliefStatement) => {
    const stamped = { ...statement, updatedAt: new Date().toISOString() };
    writeBeliefStatement(stamped);
    setBeliefStatementState(stamped);
  }, []);

  const saveDraft = useCallback((d: PhilosophyDraft) => {
    const stamped = { ...d, updatedAt: new Date().toISOString() };
    writeDraft(stamped);
    setDraftState(stamped);
  }, []);

  const clearDraft = useCallback(() => {
    writeDraft(EMPTY_DRAFT);
    setDraftState(EMPTY_DRAFT);
  }, []);

  const saveBondBrief = useCallback((brief: BondRiskBrief) => {
    const stamped = { ...brief, updatedAt: new Date().toISOString() };
    writeBondBrief(stamped);
    setBondBriefState(stamped);
  }, []);

  const clearBondBrief = useCallback(() => {
    writeBondBrief(EMPTY_BOND_BRIEF);
    setBondBriefState(EMPTY_BOND_BRIEF);
  }, []);

  const saveEquityRiskPolicy = useCallback((policy: EquityRiskPolicy) => {
    const stamped = { ...policy, updatedAt: new Date().toISOString() };
    writeEquityRiskPolicy(stamped);
    setEquityRiskPolicyState(stamped);
  }, []);

  const clearEquityRiskPolicy = useCallback(() => {
    writeEquityRiskPolicy(EMPTY_EQUITY_RISK_POLICY);
    setEquityRiskPolicyState(EMPTY_EQUITY_RISK_POLICY);
  }, []);

  const saveStatementBrief = useCallback((brief: InvestorStatementBrief) => {
    const stamped = { ...brief, updatedAt: new Date().toISOString() };
    writeStatementBrief(stamped);
    setStatementBriefState(stamped);
  }, []);

  const clearStatementBrief = useCallback(() => {
    writeStatementBrief(EMPTY_STATEMENT_BRIEF);
    setStatementBriefState(EMPTY_STATEMENT_BRIEF);
  }, []);

  const saveValuationRange = useCallback((artifact: ValuationRangeArtifact) => {
    const stamped = { ...artifact, updatedAt: new Date().toISOString() };
    writeValuationRange(stamped);
    setValuationRangeState(stamped);
  }, []);

  const clearValuationRange = useCallback(() => {
    writeValuationRange(EMPTY_VALUATION_RANGE);
    setValuationRangeState(EMPTY_VALUATION_RANGE);
  }, []);

  const saveFrictionBudget = useCallback((budget: FrictionBudget) => {
    const stamped = { ...budget, updatedAt: new Date().toISOString() };
    writeFrictionBudget(stamped);
    setFrictionBudgetState(stamped);
  }, []);

  const clearFrictionBudget = useCallback(() => {
    writeFrictionBudget(EMPTY_FRICTION_BUDGET);
    setFrictionBudgetState(EMPTY_FRICTION_BUDGET);
  }, []);

  const saveEvidenceChecklist = useCallback((checklist: EvidenceChecklist) => {
    const stamped = { ...checklist, updatedAt: new Date().toISOString() };
    writeEvidenceChecklist(stamped);
    setEvidenceChecklistState(stamped);
  }, []);

  const clearEvidenceChecklist = useCallback(() => {
    writeEvidenceChecklist(EMPTY_EVIDENCE_CHECKLIST);
    setEvidenceChecklistState(EMPTY_EVIDENCE_CHECKLIST);
  }, []);

  const saveArchitectureDecision = useCallback((decision: ArchitectureDecision) => {
    const stamped = { ...decision, updatedAt: new Date().toISOString() };
    writeArchitectureDecision(stamped);
    setArchitectureDecisionState(stamped);
  }, []);

  const saveTimingPolicy = useCallback((policy: TimingPolicy) => {
    const stamped = { ...policy, updatedAt: new Date().toISOString() };
    writeTimingPolicy(stamped);
    setTimingPolicyState(stamped);
  }, []);

  const clearTimingPolicy = useCallback(() => {
    writeTimingPolicy(EMPTY_TIMING_POLICY);
    setTimingPolicyState(EMPTY_TIMING_POLICY);
  }, []);

  const clearArchitectureDecision = useCallback(() => {
    writeArchitectureDecision(EMPTY_ARCHITECTURE_DECISION);
    setArchitectureDecisionState(EMPTY_ARCHITECTURE_DECISION);
  }, []);

  const saveHoldingsSlate = useCallback((slate: HoldingsSlate) => {
    const stamped = { ...slate, updatedAt: new Date().toISOString() };
    writeHoldingsSlate(stamped);
    setHoldingsSlateState(stamped);
  }, []);

  const clearHoldingsSlate = useCallback(() => {
    writeHoldingsSlate(EMPTY_HOLDINGS_SLATE);
    setHoldingsSlateState(EMPTY_HOLDINGS_SLATE);
  }, []);

  const saveOperatingPlan = useCallback((plan: OperatingPlan) => {
    const stamped = { ...plan, updatedAt: new Date().toISOString() };
    writeOperatingPlan(stamped);
    setOperatingPlanState(stamped);
  }, []);

  const clearOperatingPlan = useCallback(() => {
    writeOperatingPlan(EMPTY_OPERATING_PLAN);
    setOperatingPlanState(EMPTY_OPERATING_PLAN);
  }, []);

  return {
    ready: store.ready,
    completion,
    draft,
    beliefStatement,
    observationNote,
    bondBrief,
    equityRiskPolicy,
    statementBrief,
    valuationRange,
    frictionBudget,
    evidenceChecklist,
    architectureDecision,
    timingPolicy,
    holdingsSlate,
    operatingPlan,
    isComplete,
    markComplete,
    saveDraft,
    saveBeliefStatement,
    saveObservationNote,
    clearDraft,
    saveBondBrief,
    clearBondBrief,
    saveEquityRiskPolicy,
    clearEquityRiskPolicy,
    saveStatementBrief,
    clearStatementBrief,
    saveValuationRange,
    clearValuationRange,
    saveFrictionBudget,
    clearFrictionBudget,
    saveEvidenceChecklist,
    clearEvidenceChecklist,
    saveArchitectureDecision,
    clearArchitectureDecision,
    saveTimingPolicy,
    clearTimingPolicy,
    saveHoldingsSlate,
    clearHoldingsSlate,
    saveOperatingPlan,
    clearOperatingPlan,
  };
}
