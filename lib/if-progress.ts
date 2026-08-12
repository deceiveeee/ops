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
  "if-4-1-the-three-financial-statements",
  "if-4-2-read-the-balance-sheet",
  "if-4-3-recast-the-business",
  "if-4-4-read-profit-and-leverage",
  "if-4-5-repair-the-investor-view",
  "if-4-6-trace-cash-to-the-investor",
  "if-5-1-estimate-a-valuation-range",
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

  useEffect(() => {
    setDraftState(readDraft());
    setBondBriefState(readBondBrief());
    setEquityRiskPolicyState(readEquityRiskPolicy());
    setStatementBriefState(readStatementBrief());
    setValuationRangeState(readValuationRange());
    setFrictionBudgetState(readFrictionBudget());
    const onChange = () => {
      setDraftState(readDraft());
      setBondBriefState(readBondBrief());
      setEquityRiskPolicyState(readEquityRiskPolicy());
      setStatementBriefState(readStatementBrief());
      setValuationRangeState(readValuationRange());
      setFrictionBudgetState(readFrictionBudget());
    setFrictionBudgetState(readFrictionBudget());
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

  return {
    ready: store.ready,
    completion,
    draft,
    bondBrief,
    equityRiskPolicy,
    statementBrief,
    valuationRange,
    frictionBudget,
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
  };
}
