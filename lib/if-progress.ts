"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useProgressStore } from "@/lib/progress/store";

const MODULE_KEY = "ops-if-completion-v1";
const DRAFT_KEY = "ops-if-philosophy-draft-v1";
const BOND_BRIEF_KEY = "ops-if-bond-risk-brief-v1";
const EQUITY_RISK_POLICY_KEY = "ops-if-equity-risk-policy-v1";
const STATEMENT_BRIEF_KEY = "ops-if-statement-brief-v1";
const VALUATION_RANGE_KEY = "ops-if-valuation-range-v1";
const FRICTION_BUDGET_KEY = "ops-if-friction-budget-v1";
const EVIDENCE_CHECKLIST_KEY = "ops-if-evidence-checklist-v1";
const ARCHITECTURE_DECISION_KEY = "ops-if-architecture-decision-v1";
const TIMING_POLICY_KEY = "ops-if-timing-policy-v1";
const HOLDINGS_SLATE_KEY = "ops-if-holdings-slate-v1";
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
  /** Charged from the saved Mission 8 friction budget, not typed by the learner. */
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
  /** Charged from the saved Mission 8 friction budget, not typed by the learner. */
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

function readDraft(): PhilosophyDraft {
  if (typeof window === "undefined") return EMPTY_DRAFT;
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    return raw ? ({ ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<PhilosophyDraft>) }) : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}

function writeDraft(d: PhilosophyDraft) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
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
    window.localStorage.setItem(BOND_BRIEF_KEY, JSON.stringify(brief));
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
    window.localStorage.setItem(EQUITY_RISK_POLICY_KEY, JSON.stringify(policy));
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
    window.localStorage.setItem(STATEMENT_BRIEF_KEY, JSON.stringify(brief));
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
    window.localStorage.setItem(VALUATION_RANGE_KEY, JSON.stringify(artifact));
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
    window.localStorage.setItem(EVIDENCE_CHECKLIST_KEY, JSON.stringify(checklist));
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
    window.localStorage.setItem(TIMING_POLICY_KEY, JSON.stringify(policy));
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
    window.localStorage.setItem(ARCHITECTURE_DECISION_KEY, JSON.stringify(decision));
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
    window.localStorage.setItem(HOLDINGS_SLATE_KEY, JSON.stringify(slate));
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  } catch {
    /* ignore */
  }
}

function writeFrictionBudget(budget: FrictionBudget) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FRICTION_BUDGET_KEY, JSON.stringify(budget));
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

  useEffect(() => {
    setDraftState(readDraft());
    setBondBriefState(readBondBrief());
    setEquityRiskPolicyState(readEquityRiskPolicy());
    setStatementBriefState(readStatementBrief());
    setValuationRangeState(readValuationRange());
    setFrictionBudgetState(readFrictionBudget());
    setEvidenceChecklistState(readEvidenceChecklist());
    setArchitectureDecisionState(readArchitectureDecision());
    setTimingPolicyState(readTimingPolicy());
    setHoldingsSlateState(readHoldingsSlate());
    const onChange = () => {
      setDraftState(readDraft());
      setBondBriefState(readBondBrief());
      setEquityRiskPolicyState(readEquityRiskPolicy());
      setStatementBriefState(readStatementBrief());
      setValuationRangeState(readValuationRange());
      setFrictionBudgetState(readFrictionBudget());
      setEvidenceChecklistState(readEvidenceChecklist());
      setArchitectureDecisionState(readArchitectureDecision());
      setTimingPolicyState(readTimingPolicy());
      setHoldingsSlateState(readHoldingsSlate());
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

  return {
    ready: store.ready,
    completion,
    draft,
    bondBrief,
    equityRiskPolicy,
    statementBrief,
    valuationRange,
    frictionBudget,
    evidenceChecklist,
    architectureDecision,
    timingPolicy,
    holdingsSlate,
    isComplete,
    markComplete,
    saveDraft,
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
  };
}
