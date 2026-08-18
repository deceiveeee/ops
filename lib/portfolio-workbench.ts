import {
  BASIS_POINTS_TOTAL,
  calculateCandidateCeilingBps,
  calculatePortfolioStressLossBps,
  isLiquidityCovered,
  validateAllocationSleeves,
} from "@/lib/allocation-policy";

export const PORTFOLIO_WORKBENCH_SCHEMA_VERSION = 1 as const;
export const PORTFOLIO_WORKBENCH_STORAGE_KEY = "ops-portfolio-workbench-v1";
export const PORTFOLIO_WORKBENCH_EVENT = "ops-portfolio-workbench-change";
export const LEGACY_IF_PROGRESS_EVENT = "ops-if-progress";

export type WorkbenchMode = "personal" | "practice";
export type AssumptionOwner = "source" | "learner" | "ops";

export interface ProvenancedValue<T extends string | number | boolean | null> {
  value: T;
  owner: AssumptionOwner;
  asOf: string;
  note: string;
}

export const WORKBENCH_CHECKPOINT_IDS = [
  "mandate",
  "beliefs",
  "bond-risk",
  "required-return",
  "allocation",
  "evidence",
  "valuation",
  "friction",
  "evidence-test",
  "architecture",
  "timing",
  "holdings",
  "policy",
] as const;

export type WorkbenchCheckpointId = (typeof WORKBENCH_CHECKPOINT_IDS)[number];
export type CheckpointStatus =
  | "empty"
  | "draft"
  | "saved-unverified"
  | "coherent"
  | "review-required"
  | "blocked";
export type SavableCheckpointStatus = "draft" | "saved-unverified" | "coherent";

export interface CheckpointReview {
  sourceCheckpoint: WorkbenchCheckpointId;
  changedField: string;
  reason: string;
  at: string;
}

export interface CheckpointState {
  status: CheckpointStatus;
  revision: number;
  updatedAt: string;
  review?: CheckpointReview;
  acceptedDependencyRevisions: Partial<Record<WorkbenchCheckpointId, number>>;
}

export type ReadinessRoute =
  | "unassessed"
  | "personal-available"
  | "personal-constrained"
  | "practice-only";
export type ReadinessFlag = "unanswered" | "resolved" | "needs-action" | "not-applicable";
export type LossBand = "unanswered" | "low" | "moderate" | "high" | "unsure";

/**
 * Exact learner-facing Mission 1 answers. The normalized flags below drive
 * dependency rules; this payload prevents those summaries from overwriting a
 * learner's more specific readiness facts on reload.
 */
export interface MandateReadinessDetails {
  profileOwner: "unassessed" | "learner" | "fictional-case";
  approximatePortfolioValue: string;
  reserveStatus: "" | "target-met" | "building" | "gap" | "unknown";
  highInterestDebt: "" | "none" | "paying-down" | "present" | "unknown";
  employerMatch: "" | "using" | "available-review" | "not-available" | "not-applicable" | "unknown";
  capacityForLoss: "" | "limited" | "moderate" | "substantial" | "unknown";
  willingnessForLoss: "" | "prefer-stability" | "written-plan" | "untested" | "unknown";
  jurisdiction: "" | "us" | "outside-us" | "unknown";
  accountAuthority: "" | "confirmed" | "custodian-required" | "not-confirmed" | "unknown";
  earnedIncomeStatus: "" | "relevant-confirmed" | "not-relevant" | "verify" | "unknown";
  lifeChangeDiagnosis: "" | "capacity-and-liquidity" | "willingness-only" | "nothing-changed";
  lifeChangeAction: "" | "protect-cash-need" | "increase-risk" | "move-deadline";
}

export interface MandateRecord {
  goal: string;
  targetDate: string;
  horizon: string;
  contributionPlan: string;
  plannedWithdrawals: string;
  nearTermCashNeeds: string;
  emergencyReserve: {
    target: string;
    current: string;
    status: "unanswered" | "on-track" | "gap";
  };
  highInterestDebt: ReadinessFlag;
  employerMatch: ReadinessFlag;
  accountAuthority: ReadinessFlag;
  jurisdiction: ReadinessFlag;
  earnedIncome: ReadinessFlag;
  capacityForLoss: LossBand;
  willingnessForLoss: LossBand;
  existingExposureCategories: string[];
  route: ReadinessRoute;
  deploymentActions: string[];
  acknowledgedAt: string;
  readinessDetails: MandateReadinessDetails;
}

export type AllocationSleeveRole =
  | "liquidity"
  | "stability"
  | "growth"
  | "diversifier"
  | "other";

export interface AllocationSleeve {
  id: string;
  label: string;
  role: AllocationSleeveRole;
  owner: AssumptionOwner;
  minBps: number;
  targetBps: number;
  maxBps: number;
}

export interface StressSleeveLoss {
  sleeveId: string;
  lossBps: ProvenancedValue<number | null>;
}

export interface StressScenario {
  id: string;
  label: string;
  losses: StressSleeveLoss[];
}

export interface AllocationRecord {
  referencePortfolioAmount: ProvenancedValue<number | null>;
  nearTermNeedBps: ProvenancedValue<number | null>;
  sleeves: AllocationSleeve[];
  stressScenarios: StressScenario[];
  selectedStressScenarioId: string;
  portfolioStressLossBudgetBps: ProvenancedValue<number | null>;
  maximumPortfolioLossContributionBps: ProvenancedValue<number | null>;
  candidatePositionStressLossBps: ProvenancedValue<number | null>;
  mandateRationale: string;
  goalImpactAcknowledged: boolean;
  preflight: {
    status: "not-started" | "passed" | "bridge-required" | "bridge-complete";
    passedAt: string;
  };
  transfer: {
    caseId: string;
    status: "not-started" | "passed" | "failed";
    passedAt: string;
  };
  savedAt: string;
}

export interface GraduationRecord {
  status: "not-assessed" | "passed" | "failed";
  outcome: "none" | "execute-ready" | "practice-complete";
  assessedAt: string;
}

export interface WorkbenchCase {
  mode: WorkbenchMode;
  checkpoints: Record<WorkbenchCheckpointId, CheckpointState>;
  mandate: MandateRecord;
  allocation: AllocationRecord;
  graduation: GraduationRecord;
}

export type LegacyArtifactId =
  | "philosophy"
  | "bond-risk"
  | "equity-risk-policy"
  | "statement-brief"
  | "valuation-range"
  | "friction-budget"
  | "evidence-checklist";

export interface LegacyPhilosophyDraft {
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
}

export interface LegacyBondRiskBrief {
  paymentPromise: string;
  rateRisk: string;
  durationFinding: string;
  defaultEvidence: string;
  pricingDecision: string;
  updatedAt: string;
}

export interface LegacyEquityRiskPolicy {
  riskDefinition: string;
  portfolioContext: string;
  betaInterpretation: string;
  fundamentalDrivers: string;
  methodStack: string;
  priceRule: string;
  decision: string;
  remainingUncertainty: string;
  updatedAt: string;
}

export interface LegacyInvestorStatementBrief {
  statementMap: string;
  balanceSheetFinding: string;
  financialRecast: string;
  profitabilityFinding: string;
  adjustmentFinding: string;
  cashFlowFinding: string;
  decision: string;
  remainingQuestion: string;
  updatedAt: string;
}

export interface LegacyValuationRangeArtifact {
  claim: string;
  method: string;
  requiredReturn: string;
  lowValue: string;
  baseValue: string;
  highValue: string;
  observedPrice: string;
  decisionBuffer: string;
  buyBelow: string;
  decision: string;
  relativeCheck: string;
  evidenceTriggers: string[];
  updatedAt: string;
}

export interface LegacyFrictionBudget {
  turnoverExpectation: string;
  spreadClass: string;
  priceImpactExposure: string;
  waitingSensitivity: string;
  taxSetting: string;
  estimatedAnnualDrag: number;
  hurdleRule: string;
  updatedAt: string;
}

export interface LegacyEvidenceChecklist {
  benchmark: string;
  testDesign: string;
  holdoutRule: string;
  samplingRule: string;
  hurdleRule: string;
  abandonRule: string;
  updatedAt: string;
}

export type LegacyArtifactData =
  | { kind: "philosophy"; value: LegacyPhilosophyDraft }
  | { kind: "bond-risk"; value: LegacyBondRiskBrief }
  | { kind: "equity-risk-policy"; value: LegacyEquityRiskPolicy }
  | { kind: "statement-brief"; value: LegacyInvestorStatementBrief }
  | { kind: "valuation-range"; value: LegacyValuationRangeArtifact }
  | { kind: "friction-budget"; value: LegacyFrictionBudget }
  | { kind: "evidence-checklist"; value: LegacyEvidenceChecklist };

export interface LegacyEvidenceRecord {
  status: "migrated-unconfirmed";
  sourceKey: string;
  sourceUpdatedAt: string;
  timestampKind: "source" | "synthesized";
  migratedAt: string;
  sourceSignature: string;
  artifact: LegacyArtifactData;
}

export interface DependencyEvent {
  mode: WorkbenchMode;
  sourceCheckpoint: WorkbenchCheckpointId;
  sourceRevision: number;
  changedField: string;
  reason: string;
  affectedCheckpoints: WorkbenchCheckpointId[];
  at: string;
}

export interface PortfolioWorkbenchV1 {
  schemaVersion: typeof PORTFOLIO_WORKBENCH_SCHEMA_VERSION;
  activeMode: WorkbenchMode;
  cases: Record<WorkbenchMode, WorkbenchCase>;
  legacyEvidence: Partial<Record<LegacyArtifactId, LegacyEvidenceRecord>>;
  dependencyHistory: DependencyEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkbenchIssue {
  code:
    | "invalid-json"
    | "invalid-record"
    | "invalid-field"
    | "unsupported-version"
    | "storage-read-failed"
    | "storage-write-failed"
    | "legacy-invalid-json"
    | "legacy-invalid-record";
  path: string;
  message: string;
}

export type PortfolioWorkbenchLoadResult =
  | {
      kind: "ok";
      workbench: PortfolioWorkbenchV1;
      issues: WorkbenchIssue[];
      migrated: boolean;
    }
  | {
      kind: "recovered-with-issues";
      workbench: PortfolioWorkbenchV1;
      issues: WorkbenchIssue[];
      migrated: false;
      raw: string;
    }
  | {
      kind: "corrupt";
      workbench: PortfolioWorkbenchV1;
      issues: WorkbenchIssue[];
      migrated: false;
      raw: string;
    }
  | {
      kind: "future-version";
      workbench: PortfolioWorkbenchV1;
      issues: WorkbenchIssue[];
      migrated: false;
      raw: string;
      futureVersion: number;
    };

export interface WorkbenchStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface WorkbenchWriteResult {
  ok: boolean;
  issue?: WorkbenchIssue;
}

export class WorkbenchValidationError extends Error {
  readonly issues: readonly string[];

  constructor(message: string, issues: readonly string[]) {
    super(message);
    this.name = "WorkbenchValidationError";
    this.issues = issues;
  }
}

export const LEGACY_ARTIFACT_STORAGE_KEYS: Record<LegacyArtifactId, string> = {
  philosophy: "ops-if-philosophy-draft-v1",
  "bond-risk": "ops-if-bond-risk-brief-v1",
  "equity-risk-policy": "ops-if-equity-risk-policy-v1",
  "statement-brief": "ops-if-statement-brief-v1",
  "valuation-range": "ops-if-valuation-range-v1",
  "friction-budget": "ops-if-friction-budget-v1",
  "evidence-checklist": "ops-if-evidence-checklist-v1",
};

/** Direct dependency edges. Invalidation walks this graph transitively. */
export const WORKBENCH_DEPENDENCIES: Record<
  WorkbenchCheckpointId,
  readonly WorkbenchCheckpointId[]
> = {
  mandate: ["allocation", "architecture", "holdings", "policy"],
  beliefs: ["architecture", "policy"],
  "bond-risk": ["allocation", "architecture", "policy"],
  "required-return": ["allocation", "architecture", "policy"],
  allocation: ["architecture", "timing", "holdings", "policy"],
  evidence: ["architecture", "holdings", "policy"],
  valuation: ["architecture", "holdings", "policy"],
  friction: ["architecture", "timing", "policy"],
  "evidence-test": ["architecture", "timing", "policy"],
  architecture: ["timing", "holdings", "policy"],
  timing: ["holdings", "policy"],
  holdings: ["policy"],
  policy: [],
};

const COHERENCE_PREREQUISITES: Partial<
  Record<WorkbenchCheckpointId, readonly WorkbenchCheckpointId[]>
> = {
  allocation: ["mandate"],
  architecture: ["allocation", "evidence", "valuation", "friction", "evidence-test"],
  timing: ["allocation", "architecture"],
  holdings: ["allocation", "architecture", "timing"],
  policy: ["mandate", "allocation", "architecture", "timing", "holdings"],
};

const CHECKPOINT_STATUS_VALUES: readonly CheckpointStatus[] = [
  "empty",
  "draft",
  "saved-unverified",
  "coherent",
  "review-required",
  "blocked",
];
const READINESS_FLAGS: readonly ReadinessFlag[] = [
  "unanswered",
  "resolved",
  "needs-action",
  "not-applicable",
];
const LOSS_BANDS: readonly LossBand[] = ["unanswered", "low", "moderate", "high", "unsure"];
const READINESS_ROUTES: readonly ReadinessRoute[] = [
  "unassessed",
  "personal-available",
  "personal-constrained",
  "practice-only",
];
const SLEEVE_ROLES: readonly AllocationSleeveRole[] = [
  "liquidity",
  "stability",
  "growth",
  "diversifier",
  "other",
];

const READINESS_DETAIL_VALUES = {
  profileOwner: ["unassessed", "learner", "fictional-case"],
  reserveStatus: ["", "target-met", "building", "gap", "unknown"],
  highInterestDebt: ["", "none", "paying-down", "present", "unknown"],
  employerMatch: ["", "using", "available-review", "not-available", "not-applicable", "unknown"],
  capacityForLoss: ["", "limited", "moderate", "substantial", "unknown"],
  willingnessForLoss: ["", "prefer-stability", "written-plan", "untested", "unknown"],
  jurisdiction: ["", "us", "outside-us", "unknown"],
  accountAuthority: ["", "confirmed", "custodian-required", "not-confirmed", "unknown"],
  earnedIncomeStatus: ["", "relevant-confirmed", "not-relevant", "verify", "unknown"],
  lifeChangeDiagnosis: ["", "capacity-and-liquidity", "willingness-only", "nothing-changed"],
  lifeChangeAction: ["", "protect-cash-need", "increase-risk", "move-deadline"],
} as const;

function createEmptyReadinessDetails(): MandateReadinessDetails {
  return {
    profileOwner: "unassessed",
    approximatePortfolioValue: "",
    reserveStatus: "",
    highInterestDebt: "",
    employerMatch: "",
    capacityForLoss: "",
    willingnessForLoss: "",
    jurisdiction: "",
    accountAuthority: "",
    earnedIncomeStatus: "",
    lifeChangeDiagnosis: "",
    lifeChangeAction: "",
  };
}

function emptyCheckpoint(): CheckpointState {
  return {
    status: "empty",
    revision: 0,
    updatedAt: "",
    acceptedDependencyRevisions: {},
  };
}

function createCheckpointMap(): Record<WorkbenchCheckpointId, CheckpointState> {
  return Object.fromEntries(
    WORKBENCH_CHECKPOINT_IDS.map((checkpoint) => [checkpoint, emptyCheckpoint()]),
  ) as Record<WorkbenchCheckpointId, CheckpointState>;
}

export function createEmptyMandate(): MandateRecord {
  return {
    goal: "",
    targetDate: "",
    horizon: "",
    contributionPlan: "",
    plannedWithdrawals: "",
    nearTermCashNeeds: "",
    emergencyReserve: { target: "", current: "", status: "unanswered" },
    highInterestDebt: "unanswered",
    employerMatch: "unanswered",
    accountAuthority: "unanswered",
    jurisdiction: "unanswered",
    earnedIncome: "unanswered",
    capacityForLoss: "unanswered",
    willingnessForLoss: "unanswered",
    existingExposureCategories: [],
    route: "unassessed",
    deploymentActions: [],
    acknowledgedAt: "",
    readinessDetails: createEmptyReadinessDetails(),
  };
}

function emptyProvenancedNumber(owner: AssumptionOwner = "learner"): ProvenancedValue<number | null> {
  return { value: null, owner, asOf: "", note: "" };
}

export function createEmptyAllocation(): AllocationRecord {
  return {
    referencePortfolioAmount: emptyProvenancedNumber(),
    nearTermNeedBps: emptyProvenancedNumber(),
    sleeves: [],
    stressScenarios: [],
    selectedStressScenarioId: "",
    portfolioStressLossBudgetBps: emptyProvenancedNumber(),
    maximumPortfolioLossContributionBps: emptyProvenancedNumber(),
    candidatePositionStressLossBps: emptyProvenancedNumber(),
    mandateRationale: "",
    goalImpactAcknowledged: false,
    preflight: { status: "not-started", passedAt: "" },
    transfer: { caseId: "", status: "not-started", passedAt: "" },
    savedAt: "",
  };
}

function createEmptyCase(mode: WorkbenchMode): WorkbenchCase {
  return {
    mode,
    checkpoints: createCheckpointMap(),
    mandate: createEmptyMandate(),
    allocation: createEmptyAllocation(),
    graduation: { status: "not-assessed", outcome: "none", assessedAt: "" },
  };
}

export function createEmptyPortfolioWorkbench(now = new Date().toISOString()): PortfolioWorkbenchV1 {
  return {
    schemaVersion: PORTFOLIO_WORKBENCH_SCHEMA_VERSION,
    activeMode: "personal",
    cases: {
      personal: createEmptyCase("personal"),
      practice: createEmptyCase("practice"),
    },
    legacyEvidence: {},
    dependencyHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isTimestamp(value: string): boolean {
  return value !== "" && Number.isFinite(Date.parse(value));
}

function cloneWorkbench(workbench: PortfolioWorkbenchV1): PortfolioWorkbenchV1 {
  return JSON.parse(JSON.stringify(workbench)) as PortfolioWorkbenchV1;
}

function directString(record: Record<string, unknown>, field: string): string {
  return typeof record[field] === "string" ? record[field] : "";
}

function directStringArray(record: Record<string, unknown>, field: string): string[] {
  const value = record[field];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function legacyStringObject(
  record: Record<string, unknown>,
  fields: readonly string[],
): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field, directString(record, field)]));
}

function sanitizeLegacyArtifact(
  id: LegacyArtifactId,
  input: unknown,
  path: string,
  issues: WorkbenchIssue[],
): LegacyArtifactData | null {
  if (!isRecord(input)) {
    issues.push({
      code: "legacy-invalid-record",
      path,
      message: "Legacy artifact was not an object and was left untouched.",
    });
    return null;
  }

  for (const [field, value] of Object.entries(input)) {
    if (
      field !== "estimatedAnnualDrag" &&
      field !== "candidateFamilies" &&
      field !== "evidenceTriggers" &&
      field !== "constraints" &&
      typeof value !== "string"
    ) {
      issues.push({
        code: "legacy-invalid-record",
        path: `${path}.${field}`,
        message: "An incompatible legacy field was recovered with its safe default.",
      });
    }
  }

  if (id === "philosophy") {
    const strings = legacyStringObject(input, [
      "marketBelief",
      "advantageStage",
      "persistenceReason",
      "strategy",
      "implementationRisks",
      "executionRule",
      "evaluationRule",
      "familyEvidenceRule",
      "familyResearchQuestion",
      "fitFamily",
      "fitCapacitySummary",
      "fitReviewRule",
      "fitOpenQuestion",
      "evidenceGap",
      "generatedSummary",
      "updatedAt",
    ]);
    const constraintsInput = isRecord(input.constraints) ? input.constraints : {};
    const constraints = legacyStringObject(constraintsInput, [
      "riskPreference",
      "horizon",
      "cashNeeds",
      "taxConsiderations",
      "capital",
      "researchTime",
      "patience",
      "analyticalTools",
      "liquidityNeeds",
      "underperformanceTolerance",
    ]);
    return {
      kind: id,
      value: {
        ...(strings as unknown as Omit<LegacyPhilosophyDraft, "constraints" | "candidateFamilies">),
        constraints: constraints as unknown as LegacyPhilosophyDraft["constraints"],
        candidateFamilies: directStringArray(input, "candidateFamilies"),
      },
    };
  }

  if (id === "bond-risk") {
    return {
      kind: id,
      value: legacyStringObject(input, [
        "paymentPromise",
        "rateRisk",
        "durationFinding",
        "defaultEvidence",
        "pricingDecision",
        "updatedAt",
      ]) as unknown as LegacyBondRiskBrief,
    };
  }

  if (id === "equity-risk-policy") {
    return {
      kind: id,
      value: legacyStringObject(input, [
        "riskDefinition",
        "portfolioContext",
        "betaInterpretation",
        "fundamentalDrivers",
        "methodStack",
        "priceRule",
        "decision",
        "remainingUncertainty",
        "updatedAt",
      ]) as unknown as LegacyEquityRiskPolicy,
    };
  }

  if (id === "statement-brief") {
    return {
      kind: id,
      value: legacyStringObject(input, [
        "statementMap",
        "balanceSheetFinding",
        "financialRecast",
        "profitabilityFinding",
        "adjustmentFinding",
        "cashFlowFinding",
        "decision",
        "remainingQuestion",
        "updatedAt",
      ]) as unknown as LegacyInvestorStatementBrief,
    };
  }

  if (id === "valuation-range") {
    return {
      kind: id,
      value: {
        ...(legacyStringObject(input, [
          "claim",
          "method",
          "requiredReturn",
          "lowValue",
          "baseValue",
          "highValue",
          "observedPrice",
          "decisionBuffer",
          "buyBelow",
          "decision",
          "relativeCheck",
          "updatedAt",
        ]) as unknown as Omit<LegacyValuationRangeArtifact, "evidenceTriggers">),
        evidenceTriggers: directStringArray(input, "evidenceTriggers"),
      },
    };
  }

  if (id === "friction-budget") {
    const strings = legacyStringObject(input, [
      "turnoverExpectation",
      "spreadClass",
      "priceImpactExposure",
      "waitingSensitivity",
      "taxSetting",
      "hurdleRule",
      "updatedAt",
    ]);
    return {
      kind: id,
      value: {
        ...(strings as unknown as Omit<LegacyFrictionBudget, "estimatedAnnualDrag">),
        estimatedAnnualDrag: isFiniteNumber(input.estimatedAnnualDrag)
          ? input.estimatedAnnualDrag
          : 0,
      },
    };
  }

  return {
    kind: id,
    value: legacyStringObject(input, [
      "benchmark",
      "testDesign",
      "holdoutRule",
      "samplingRule",
      "hurdleRule",
      "abandonRule",
      "updatedAt",
    ]) as unknown as LegacyEvidenceChecklist,
  };
}

function artifactUpdatedAt(artifact: LegacyArtifactData): string {
  return artifact.value.updatedAt;
}

function migrateLegacyEvidence(
  workbench: PortfolioWorkbenchV1,
  storage: WorkbenchStorage,
  now: string,
): { workbench: PortfolioWorkbenchV1; issues: WorkbenchIssue[]; changed: boolean } {
  const next = cloneWorkbench(workbench);
  const issues: WorkbenchIssue[] = [];
  let changed = false;

  for (const id of Object.keys(LEGACY_ARTIFACT_STORAGE_KEYS) as LegacyArtifactId[]) {
    const sourceKey = LEGACY_ARTIFACT_STORAGE_KEYS[id];
    let raw: string | null;
    try {
      raw = storage.getItem(sourceKey);
    } catch {
      issues.push({
        code: "storage-read-failed",
        path: sourceKey,
        message: "Legacy evidence could not be read and was left untouched.",
      });
      continue;
    }
    if (raw === null) continue;

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      issues.push({
        code: "legacy-invalid-json",
        path: sourceKey,
        message: "Legacy evidence contains invalid JSON and was left untouched.",
      });
      continue;
    }

    const artifact = sanitizeLegacyArtifact(id, parsed, sourceKey, issues);
    if (!artifact) continue;
    const sourceSignature = JSON.stringify(artifact);
    if (next.legacyEvidence[id]?.sourceSignature === sourceSignature) continue;

    const sourceUpdatedAt = artifactUpdatedAt(artifact);
    next.legacyEvidence[id] = {
      status: "migrated-unconfirmed",
      sourceKey,
      sourceUpdatedAt: isTimestamp(sourceUpdatedAt) ? sourceUpdatedAt : now,
      timestampKind: isTimestamp(sourceUpdatedAt) ? "source" : "synthesized",
      migratedAt: now,
      sourceSignature,
      artifact,
    };
    changed = true;
  }

  if (changed) next.updatedAt = now;
  return { workbench: next, issues, changed };
}

function pushFieldIssue(issues: WorkbenchIssue[], path: string, message: string): void {
  issues.push({ code: "invalid-field", path, message });
}

function parsedString(
  record: Record<string, unknown>,
  field: string,
  fallback: string,
  path: string,
  issues: WorkbenchIssue[],
): string {
  if (typeof record[field] === "string") return record[field];
  pushFieldIssue(issues, `${path}.${field}`, "Expected a string; recovered with a safe default.");
  return fallback;
}

function parsedStringArray(
  record: Record<string, unknown>,
  field: string,
  fallback: string[],
  path: string,
  issues: WorkbenchIssue[],
): string[] {
  const value = record[field];
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return [...value];
  pushFieldIssue(issues, `${path}.${field}`, "Expected a string array; recovered safely.");
  return [...fallback];
}

function parsedEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
  path: string,
  issues: WorkbenchIssue[],
): T {
  if (typeof value === "string" && allowed.includes(value as T)) return value as T;
  pushFieldIssue(issues, path, "Value was outside the supported set; recovered safely.");
  return fallback;
}

function parseMandate(input: unknown, path: string, issues: WorkbenchIssue[]): MandateRecord {
  const fallback = createEmptyMandate();
  if (!isRecord(input)) {
    pushFieldIssue(issues, path, "Mandate record was missing or invalid; recovered empty.");
    return fallback;
  }
  const reserve = isRecord(input.emergencyReserve) ? input.emergencyReserve : {};
  const readinessDetails = isRecord(input.readinessDetails)
    ? input.readinessDetails
    : null;
  if (input.readinessDetails !== undefined && readinessDetails === null) {
    pushFieldIssue(issues, `${path}.readinessDetails`, "Readiness details were invalid; recovered empty.");
  }
  const parsedReadinessDetails: MandateReadinessDetails = readinessDetails
    ? {
        profileOwner: parsedEnum(readinessDetails.profileOwner, READINESS_DETAIL_VALUES.profileOwner, "unassessed", `${path}.readinessDetails.profileOwner`, issues),
        approximatePortfolioValue: parsedString(readinessDetails, "approximatePortfolioValue", "", `${path}.readinessDetails`, issues),
        reserveStatus: parsedEnum(readinessDetails.reserveStatus, READINESS_DETAIL_VALUES.reserveStatus, "", `${path}.readinessDetails.reserveStatus`, issues),
        highInterestDebt: parsedEnum(readinessDetails.highInterestDebt, READINESS_DETAIL_VALUES.highInterestDebt, "", `${path}.readinessDetails.highInterestDebt`, issues),
        employerMatch: parsedEnum(readinessDetails.employerMatch, READINESS_DETAIL_VALUES.employerMatch, "", `${path}.readinessDetails.employerMatch`, issues),
        capacityForLoss: parsedEnum(readinessDetails.capacityForLoss, READINESS_DETAIL_VALUES.capacityForLoss, "", `${path}.readinessDetails.capacityForLoss`, issues),
        willingnessForLoss: parsedEnum(readinessDetails.willingnessForLoss, READINESS_DETAIL_VALUES.willingnessForLoss, "", `${path}.readinessDetails.willingnessForLoss`, issues),
        jurisdiction: parsedEnum(readinessDetails.jurisdiction, READINESS_DETAIL_VALUES.jurisdiction, "", `${path}.readinessDetails.jurisdiction`, issues),
        accountAuthority: parsedEnum(readinessDetails.accountAuthority, READINESS_DETAIL_VALUES.accountAuthority, "", `${path}.readinessDetails.accountAuthority`, issues),
        earnedIncomeStatus: parsedEnum(readinessDetails.earnedIncomeStatus, READINESS_DETAIL_VALUES.earnedIncomeStatus, "", `${path}.readinessDetails.earnedIncomeStatus`, issues),
        lifeChangeDiagnosis: parsedEnum(readinessDetails.lifeChangeDiagnosis, READINESS_DETAIL_VALUES.lifeChangeDiagnosis, "", `${path}.readinessDetails.lifeChangeDiagnosis`, issues),
        lifeChangeAction: parsedEnum(readinessDetails.lifeChangeAction, READINESS_DETAIL_VALUES.lifeChangeAction, "", `${path}.readinessDetails.lifeChangeAction`, issues),
      }
    : fallback.readinessDetails;
  return {
    goal: parsedString(input, "goal", fallback.goal, path, issues),
    targetDate: parsedString(input, "targetDate", fallback.targetDate, path, issues),
    horizon: parsedString(input, "horizon", fallback.horizon, path, issues),
    contributionPlan: parsedString(input, "contributionPlan", fallback.contributionPlan, path, issues),
    plannedWithdrawals: parsedString(input, "plannedWithdrawals", fallback.plannedWithdrawals, path, issues),
    nearTermCashNeeds: parsedString(input, "nearTermCashNeeds", fallback.nearTermCashNeeds, path, issues),
    emergencyReserve: {
      target: parsedString(reserve, "target", "", `${path}.emergencyReserve`, issues),
      current: parsedString(reserve, "current", "", `${path}.emergencyReserve`, issues),
      status: parsedEnum(
        reserve.status,
        ["unanswered", "on-track", "gap"] as const,
        "unanswered",
        `${path}.emergencyReserve.status`,
        issues,
      ),
    },
    highInterestDebt: parsedEnum(input.highInterestDebt, READINESS_FLAGS, "unanswered", `${path}.highInterestDebt`, issues),
    employerMatch: parsedEnum(input.employerMatch, READINESS_FLAGS, "unanswered", `${path}.employerMatch`, issues),
    accountAuthority: parsedEnum(input.accountAuthority, READINESS_FLAGS, "unanswered", `${path}.accountAuthority`, issues),
    jurisdiction: parsedEnum(input.jurisdiction, READINESS_FLAGS, "unanswered", `${path}.jurisdiction`, issues),
    earnedIncome: parsedEnum(input.earnedIncome, READINESS_FLAGS, "unanswered", `${path}.earnedIncome`, issues),
    capacityForLoss: parsedEnum(input.capacityForLoss, LOSS_BANDS, "unanswered", `${path}.capacityForLoss`, issues),
    willingnessForLoss: parsedEnum(input.willingnessForLoss, LOSS_BANDS, "unanswered", `${path}.willingnessForLoss`, issues),
    existingExposureCategories: parsedStringArray(input, "existingExposureCategories", [], path, issues),
    route: parsedEnum(input.route, READINESS_ROUTES, "unassessed", `${path}.route`, issues),
    deploymentActions: parsedStringArray(input, "deploymentActions", [], path, issues),
    acknowledgedAt: parsedString(input, "acknowledgedAt", "", path, issues),
    readinessDetails: parsedReadinessDetails,
  };
}

function parseProvenancedNumber(
  input: unknown,
  path: string,
  issues: WorkbenchIssue[],
  domain: "basis-points" | "non-negative-number" = "basis-points",
): ProvenancedValue<number | null> {
  if (!isRecord(input)) {
    pushFieldIssue(issues, path, "Provenance record was invalid; recovered empty.");
    return emptyProvenancedNumber();
  }
  const valueIsValid =
    input.value === null ||
    (domain === "basis-points"
      ? isFiniteNumber(input.value) &&
        Number.isSafeInteger(input.value) &&
        input.value >= 0 &&
        input.value <= BASIS_POINTS_TOTAL
      : isFiniteNumber(input.value) && input.value >= 0);
  const value = valueIsValid ? (input.value as number | null) : null;
  if (!valueIsValid) {
    pushFieldIssue(
      issues,
      `${path}.value`,
      domain === "basis-points"
        ? `Expected whole basis points from 0 to ${BASIS_POINTS_TOTAL} or null; recovered empty.`
        : "Expected a non-negative finite number or null; recovered empty.",
    );
  }
  return {
    value,
    owner: parsedEnum(input.owner, ["source", "learner", "ops"] as const, "learner", `${path}.owner`, issues),
    asOf: parsedString(input, "asOf", "", path, issues),
    note: parsedString(input, "note", "", path, issues),
  };
}

function parseAllocation(input: unknown, path: string, issues: WorkbenchIssue[]): AllocationRecord {
  const fallback = createEmptyAllocation();
  if (!isRecord(input)) {
    pushFieldIssue(issues, path, "Allocation record was missing or invalid; recovered empty.");
    return fallback;
  }

  const rawSleeves = Array.isArray(input.sleeves) ? input.sleeves : [];
  if (!Array.isArray(input.sleeves)) pushFieldIssue(issues, `${path}.sleeves`, "Expected a sleeve array.");
  const sleeves = rawSleeves.flatMap((entry, index): AllocationSleeve[] => {
    if (!isRecord(entry)) {
      pushFieldIssue(issues, `${path}.sleeves[${index}]`, "Invalid sleeve was omitted.");
      return [];
    }
    const basisPoints = (field: string): number => {
      const value = entry[field];
      if (
        isFiniteNumber(value) &&
        Number.isSafeInteger(value) &&
        value >= 0 &&
        value <= BASIS_POINTS_TOTAL
      ) return value;
      pushFieldIssue(
        issues,
        `${path}.sleeves[${index}].${field}`,
        `Expected whole basis points from 0 to ${BASIS_POINTS_TOTAL}; recovered as 0.`,
      );
      return 0;
    };
    return [{
      id: parsedString(entry, "id", "", `${path}.sleeves[${index}]`, issues),
      label: parsedString(entry, "label", "", `${path}.sleeves[${index}]`, issues),
      role: parsedEnum(entry.role, SLEEVE_ROLES, "other", `${path}.sleeves[${index}].role`, issues),
      owner:
        entry.owner === undefined
          ? "learner"
          : parsedEnum(entry.owner, ["source", "learner", "ops"] as const, "learner", `${path}.sleeves[${index}].owner`, issues),
      minBps: basisPoints("minBps"),
      targetBps: basisPoints("targetBps"),
      maxBps: basisPoints("maxBps"),
    }];
  });

  const rawScenarios = Array.isArray(input.stressScenarios) ? input.stressScenarios : [];
  if (!Array.isArray(input.stressScenarios)) pushFieldIssue(issues, `${path}.stressScenarios`, "Expected a scenario array.");
  const stressScenarios = rawScenarios.flatMap((entry, index): StressScenario[] => {
    if (!isRecord(entry)) {
      pushFieldIssue(issues, `${path}.stressScenarios[${index}]`, "Invalid scenario was omitted.");
      return [];
    }
    const rawLosses = Array.isArray(entry.losses) ? entry.losses : [];
    if (!Array.isArray(entry.losses)) {
      pushFieldIssue(
        issues,
        `${path}.stressScenarios[${index}].losses`,
        "Expected a loss array; recovered empty.",
      );
    }
    const losses = rawLosses.flatMap((loss, lossIndex): StressSleeveLoss[] => {
      if (!isRecord(loss)) {
        pushFieldIssue(issues, `${path}.stressScenarios[${index}].losses[${lossIndex}]`, "Invalid loss was omitted.");
        return [];
      }
      return [{
        sleeveId: parsedString(loss, "sleeveId", "", `${path}.stressScenarios[${index}].losses[${lossIndex}]`, issues),
        lossBps: parseProvenancedNumber(loss.lossBps, `${path}.stressScenarios[${index}].losses[${lossIndex}].lossBps`, issues),
      }];
    });
    return [{
      id: parsedString(entry, "id", "", `${path}.stressScenarios[${index}]`, issues),
      label: parsedString(entry, "label", "", `${path}.stressScenarios[${index}]`, issues),
      losses,
    }];
  });

  const preflight = isRecord(input.preflight) ? input.preflight : {};
  const transfer = isRecord(input.transfer) ? input.transfer : {};
  return {
    referencePortfolioAmount: parseProvenancedNumber(
      input.referencePortfolioAmount,
      `${path}.referencePortfolioAmount`,
      issues,
      "non-negative-number",
    ),
    nearTermNeedBps: parseProvenancedNumber(input.nearTermNeedBps, `${path}.nearTermNeedBps`, issues),
    sleeves,
    stressScenarios,
    selectedStressScenarioId: parsedString(input, "selectedStressScenarioId", "", path, issues),
    portfolioStressLossBudgetBps: parseProvenancedNumber(input.portfolioStressLossBudgetBps, `${path}.portfolioStressLossBudgetBps`, issues),
    maximumPortfolioLossContributionBps: parseProvenancedNumber(input.maximumPortfolioLossContributionBps, `${path}.maximumPortfolioLossContributionBps`, issues),
    candidatePositionStressLossBps: parseProvenancedNumber(input.candidatePositionStressLossBps, `${path}.candidatePositionStressLossBps`, issues),
    mandateRationale:
      input.mandateRationale === undefined
        ? ""
        : parsedString(input, "mandateRationale", "", path, issues),
    goalImpactAcknowledged: typeof input.goalImpactAcknowledged === "boolean" ? input.goalImpactAcknowledged : false,
    preflight: {
      status: parsedEnum(preflight.status, ["not-started", "passed", "bridge-required", "bridge-complete"] as const, "not-started", `${path}.preflight.status`, issues),
      passedAt: parsedString(preflight, "passedAt", "", `${path}.preflight`, issues),
    },
    transfer: {
      caseId: parsedString(transfer, "caseId", "", `${path}.transfer`, issues),
      status: parsedEnum(transfer.status, ["not-started", "passed", "failed"] as const, "not-started", `${path}.transfer.status`, issues),
      passedAt: parsedString(transfer, "passedAt", "", `${path}.transfer`, issues),
    },
    savedAt: parsedString(input, "savedAt", "", path, issues),
  };
}

function parseCheckpoint(
  input: unknown,
  path: string,
  issues: WorkbenchIssue[],
): CheckpointState {
  if (!isRecord(input)) {
    pushFieldIssue(issues, path, "Checkpoint was invalid; recovered empty.");
    return emptyCheckpoint();
  }
  const revision = Number.isSafeInteger(input.revision) && (input.revision as number) >= 0
    ? (input.revision as number)
    : 0;
  if (revision === 0 && input.revision !== 0) pushFieldIssue(issues, `${path}.revision`, "Invalid revision was reset.");
  const accepted: Partial<Record<WorkbenchCheckpointId, number>> = {};
  if (isRecord(input.acceptedDependencyRevisions)) {
    for (const checkpoint of WORKBENCH_CHECKPOINT_IDS) {
      const value = input.acceptedDependencyRevisions[checkpoint];
      if (Number.isSafeInteger(value) && (value as number) >= 0) accepted[checkpoint] = value as number;
    }
  } else {
    pushFieldIssue(issues, `${path}.acceptedDependencyRevisions`, "Dependency snapshot was recovered empty.");
  }
  const state: CheckpointState = {
    status: parsedEnum(input.status, CHECKPOINT_STATUS_VALUES, "empty", `${path}.status`, issues),
    revision,
    updatedAt: parsedString(input, "updatedAt", "", path, issues),
    acceptedDependencyRevisions: accepted,
  };
  if (isRecord(input.review)) {
    state.review = {
      sourceCheckpoint: parsedEnum(input.review.sourceCheckpoint, WORKBENCH_CHECKPOINT_IDS, "mandate", `${path}.review.sourceCheckpoint`, issues),
      changedField: parsedString(input.review, "changedField", "", `${path}.review`, issues),
      reason: parsedString(input.review, "reason", "", `${path}.review`, issues),
      at: parsedString(input.review, "at", "", `${path}.review`, issues),
    };
  }
  return state;
}

function parseCase(
  input: unknown,
  mode: WorkbenchMode,
  path: string,
  issues: WorkbenchIssue[],
): WorkbenchCase {
  if (!isRecord(input)) {
    pushFieldIssue(issues, path, "Workbench case was invalid; recovered empty.");
    return createEmptyCase(mode);
  }
  if (input.mode !== mode) pushFieldIssue(issues, `${path}.mode`, "Mode identity was restored from its case slot.");
  const rawCheckpoints = isRecord(input.checkpoints) ? input.checkpoints : {};
  const checkpoints = Object.fromEntries(
    WORKBENCH_CHECKPOINT_IDS.map((id) => [
      id,
      parseCheckpoint(rawCheckpoints[id], `${path}.checkpoints.${id}`, issues),
    ]),
  ) as Record<WorkbenchCheckpointId, CheckpointState>;
  const graduation = isRecord(input.graduation) ? input.graduation : {};
  return {
    mode,
    checkpoints,
    mandate: parseMandate(input.mandate, `${path}.mandate`, issues),
    allocation: parseAllocation(input.allocation, `${path}.allocation`, issues),
    graduation: {
      status: parsedEnum(graduation.status, ["not-assessed", "passed", "failed"] as const, "not-assessed", `${path}.graduation.status`, issues),
      outcome: parsedEnum(graduation.outcome, ["none", "execute-ready", "practice-complete"] as const, "none", `${path}.graduation.outcome`, issues),
      assessedAt: parsedString(graduation, "assessedAt", "", `${path}.graduation`, issues),
    },
  };
}

function parseLegacyEvidenceMap(
  input: unknown,
  path: string,
  issues: WorkbenchIssue[],
): Partial<Record<LegacyArtifactId, LegacyEvidenceRecord>> {
  if (!isRecord(input)) {
    pushFieldIssue(issues, path, "Legacy evidence map was invalid; recovered empty.");
    return {};
  }
  const result: Partial<Record<LegacyArtifactId, LegacyEvidenceRecord>> = {};
  for (const id of Object.keys(LEGACY_ARTIFACT_STORAGE_KEYS) as LegacyArtifactId[]) {
    const item = input[id];
    if (item === undefined) continue;
    if (!isRecord(item)) {
      pushFieldIssue(issues, `${path}.${id}`, "Invalid migrated evidence was omitted.");
      continue;
    }
    const artifact = sanitizeLegacyArtifact(id, item.artifact && isRecord(item.artifact) ? item.artifact.value : null, `${path}.${id}.artifact.value`, issues);
    if (!artifact || !isRecord(item.artifact) || item.artifact.kind !== id) {
      pushFieldIssue(issues, `${path}.${id}.artifact`, "Migrated artifact discriminator was invalid.");
      continue;
    }
    result[id] = {
      status: "migrated-unconfirmed",
      sourceKey: parsedString(item, "sourceKey", LEGACY_ARTIFACT_STORAGE_KEYS[id], `${path}.${id}`, issues),
      sourceUpdatedAt: parsedString(item, "sourceUpdatedAt", "", `${path}.${id}`, issues),
      timestampKind: parsedEnum(item.timestampKind, ["source", "synthesized"] as const, "synthesized", `${path}.${id}.timestampKind`, issues),
      migratedAt: parsedString(item, "migratedAt", "", `${path}.${id}`, issues),
      sourceSignature: parsedString(item, "sourceSignature", JSON.stringify(artifact), `${path}.${id}`, issues),
      artifact,
    };
  }
  return result;
}

function parseDependencyHistory(input: unknown, issues: WorkbenchIssue[]): DependencyEvent[] {
  if (!Array.isArray(input)) {
    pushFieldIssue(issues, "dependencyHistory", "Dependency history was invalid; recovered empty.");
    return [];
  }
  return input.flatMap((item, index): DependencyEvent[] => {
    if (!isRecord(item)) {
      pushFieldIssue(issues, `dependencyHistory[${index}]`, "Invalid event was omitted.");
      return [];
    }
    const affected = Array.isArray(item.affectedCheckpoints)
      ? item.affectedCheckpoints.filter(
          (value): value is WorkbenchCheckpointId =>
            typeof value === "string" && WORKBENCH_CHECKPOINT_IDS.includes(value as WorkbenchCheckpointId),
        )
      : [];
    return [{
      mode: parsedEnum(item.mode, ["personal", "practice"] as const, "personal", `dependencyHistory[${index}].mode`, issues),
      sourceCheckpoint: parsedEnum(item.sourceCheckpoint, WORKBENCH_CHECKPOINT_IDS, "mandate", `dependencyHistory[${index}].sourceCheckpoint`, issues),
      sourceRevision: Number.isSafeInteger(item.sourceRevision) && (item.sourceRevision as number) >= 0 ? item.sourceRevision as number : 0,
      changedField: parsedString(item, "changedField", "", `dependencyHistory[${index}]`, issues),
      reason: parsedString(item, "reason", "", `dependencyHistory[${index}]`, issues),
      affectedCheckpoints: affected,
      at: parsedString(item, "at", "", `dependencyHistory[${index}]`, issues),
    }];
  });
}

function parseWorkbenchV1(input: Record<string, unknown>, now: string): {
  workbench: PortfolioWorkbenchV1;
  issues: WorkbenchIssue[];
} {
  const issues: WorkbenchIssue[] = [];
  const cases = isRecord(input.cases) ? input.cases : {};
  const createdAt = typeof input.createdAt === "string" ? input.createdAt : now;
  const updatedAt = typeof input.updatedAt === "string" ? input.updatedAt : createdAt;
  if (typeof input.createdAt !== "string") pushFieldIssue(issues, "createdAt", "Creation time was recovered.");
  if (typeof input.updatedAt !== "string") pushFieldIssue(issues, "updatedAt", "Update time was recovered.");
  return {
    workbench: {
      schemaVersion: PORTFOLIO_WORKBENCH_SCHEMA_VERSION,
      activeMode: parsedEnum(input.activeMode, ["personal", "practice"] as const, "personal", "activeMode", issues),
      cases: {
        personal: parseCase(cases.personal, "personal", "cases.personal", issues),
        practice: parseCase(cases.practice, "practice", "cases.practice", issues),
      },
      legacyEvidence: parseLegacyEvidenceMap(input.legacyEvidence, "legacyEvidence", issues),
      dependencyHistory: parseDependencyHistory(input.dependencyHistory, issues),
      createdAt,
      updatedAt,
    },
    issues,
  };
}

export function persistPortfolioWorkbench(
  storage: WorkbenchStorage,
  workbench: PortfolioWorkbenchV1,
): WorkbenchWriteResult {
  try {
    storage.setItem(PORTFOLIO_WORKBENCH_STORAGE_KEY, JSON.stringify(workbench));
    return { ok: true };
  } catch {
    return {
      ok: false,
      issue: {
        code: "storage-write-failed",
        path: PORTFOLIO_WORKBENCH_STORAGE_KEY,
        message: "The Workbench could not be saved in local storage.",
      },
    };
  }
}

export function loadPortfolioWorkbench(
  storage?: WorkbenchStorage | null,
  now = new Date().toISOString(),
): PortfolioWorkbenchLoadResult {
  const empty = createEmptyPortfolioWorkbench(now);
  if (!storage) return { kind: "ok", workbench: empty, issues: [], migrated: false };

  let raw: string | null;
  try {
    raw = storage.getItem(PORTFOLIO_WORKBENCH_STORAGE_KEY);
  } catch {
    return {
      kind: "corrupt",
      workbench: empty,
      issues: [{
        code: "storage-read-failed",
        path: PORTFOLIO_WORKBENCH_STORAGE_KEY,
        message: "The Workbench could not be read from local storage.",
      }],
      migrated: false,
      raw: "",
    };
  }

  if (raw === null) {
    const migration = migrateLegacyEvidence(empty, storage, now);
    const write = persistPortfolioWorkbench(storage, migration.workbench);
    const issues = write.issue ? [...migration.issues, write.issue] : migration.issues;
    return {
      kind: "ok",
      workbench: migration.workbench,
      issues,
      migrated: migration.changed,
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return {
      kind: "corrupt",
      workbench: empty,
      issues: [{ code: "invalid-json", path: PORTFOLIO_WORKBENCH_STORAGE_KEY, message: "Stored Workbench JSON is corrupt and was preserved." }],
      migrated: false,
      raw,
    };
  }

  if (!isRecord(parsed)) {
    return {
      kind: "corrupt",
      workbench: empty,
      issues: [{ code: "invalid-record", path: PORTFOLIO_WORKBENCH_STORAGE_KEY, message: "Stored Workbench was not an object and was preserved." }],
      migrated: false,
      raw,
    };
  }

  if (typeof parsed.schemaVersion === "number" && parsed.schemaVersion > PORTFOLIO_WORKBENCH_SCHEMA_VERSION) {
    return {
      kind: "future-version",
      workbench: empty,
      issues: [{ code: "unsupported-version", path: "schemaVersion", message: "A newer Workbench version was preserved without modification." }],
      migrated: false,
      raw,
      futureVersion: parsed.schemaVersion,
    };
  }

  if (parsed.schemaVersion !== PORTFOLIO_WORKBENCH_SCHEMA_VERSION) {
    return {
      kind: "corrupt",
      workbench: empty,
      issues: [{ code: "unsupported-version", path: "schemaVersion", message: "The Workbench version is missing or unsupported and was preserved." }],
      migrated: false,
      raw,
    };
  }

  const recovered = parseWorkbenchV1(parsed, now);
  if (recovered.issues.length > 0) {
    return {
      kind: "recovered-with-issues",
      workbench: recovered.workbench,
      issues: recovered.issues,
      migrated: false,
      raw,
    };
  }

  const migration = migrateLegacyEvidence(recovered.workbench, storage, now);
  if (migration.changed) persistPortfolioWorkbench(storage, migration.workbench);
  return {
    kind: "ok",
    workbench: migration.workbench,
    issues: migration.issues,
    migrated: migration.changed,
  };
}

function transitiveDependents(source: WorkbenchCheckpointId): WorkbenchCheckpointId[] {
  const seen = new Set<WorkbenchCheckpointId>();
  const queue = [...WORKBENCH_DEPENDENCIES[source]];
  while (queue.length > 0) {
    const candidate = queue.shift();
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    queue.push(...WORKBENCH_DEPENDENCIES[candidate]);
  }
  return WORKBENCH_CHECKPOINT_IDS.filter((checkpoint) => seen.has(checkpoint));
}

function dependencySnapshot(workbenchCase: WorkbenchCase): Partial<Record<WorkbenchCheckpointId, number>> {
  const snapshot: Partial<Record<WorkbenchCheckpointId, number>> = {};
  for (const checkpoint of WORKBENCH_CHECKPOINT_IDS) {
    const revision = workbenchCase.checkpoints[checkpoint].revision;
    if (revision > 0) snapshot[checkpoint] = revision;
  }
  return snapshot;
}

function assertCoherencePrerequisites(
  workbenchCase: WorkbenchCase,
  checkpoint: WorkbenchCheckpointId,
): void {
  const missing = (COHERENCE_PREREQUISITES[checkpoint] ?? []).filter(
    (dependency) => workbenchCase.checkpoints[dependency].status !== "coherent",
  );
  if (missing.length > 0) {
    throw new WorkbenchValidationError(
      `${checkpoint} cannot become coherent until its prerequisites are coherent.`,
      missing.map((dependency) => `${dependency} requires review`),
    );
  }
}

function commitCheckpoint(
  workbench: PortfolioWorkbenchV1,
  mode: WorkbenchMode,
  checkpoint: WorkbenchCheckpointId,
  status: SavableCheckpointStatus,
  changedField: string,
  reason: string,
  now: string,
): PortfolioWorkbenchV1 {
  const next = cloneWorkbench(workbench);
  const currentCase = next.cases[mode];
  if (status === "coherent") assertCoherencePrerequisites(currentCase, checkpoint);

  const source = currentCase.checkpoints[checkpoint];
  source.status = status;
  source.revision += 1;
  source.updatedAt = now;
  source.acceptedDependencyRevisions = dependencySnapshot(currentCase);
  delete source.review;

  const affected: WorkbenchCheckpointId[] = [];
  for (const dependent of transitiveDependents(checkpoint)) {
    const state = currentCase.checkpoints[dependent];
    if (
      state.status !== "saved-unverified" &&
      state.status !== "coherent" &&
      state.status !== "review-required"
    ) continue;
    state.status = "review-required";
    state.review = {
      sourceCheckpoint: checkpoint,
      changedField,
      reason,
      at: now,
    };
    state.updatedAt = now;
    affected.push(dependent);
  }

  if (affected.length > 0) {
    next.dependencyHistory.push({
      mode,
      sourceCheckpoint: checkpoint,
      sourceRevision: source.revision,
      changedField,
      reason,
      affectedCheckpoints: affected,
      at: now,
    });
  }
  next.updatedAt = now;
  return next;
}

export function switchWorkbenchMode(
  workbench: PortfolioWorkbenchV1,
  mode: WorkbenchMode,
  now = new Date().toISOString(),
): PortfolioWorkbenchV1 {
  if (workbench.activeMode === mode) return workbench;
  const next = cloneWorkbench(workbench);
  next.activeMode = mode;
  next.updatedAt = now;
  return next;
}

export function validateMandateForCoherence(
  mandate: MandateRecord,
  mode: WorkbenchMode,
): string[] {
  const issues: string[] = [];
  if (!mandate.goal.trim()) issues.push("Define the portfolio goal.");
  if (!mandate.horizon.trim()) issues.push("Define the investment horizon.");
  const portfolioAmount = Number(mandate.readinessDetails.approximatePortfolioValue);
  const nearTermNeed = Number(mandate.nearTermCashNeeds);
  if (
    !mandate.readinessDetails.approximatePortfolioValue.trim() ||
    !Number.isFinite(portfolioAmount) ||
    portfolioAmount <= 0
  ) {
    issues.push("Define a positive planning portfolio amount or use the complete practice case.");
  }
  if (
    !mandate.nearTermCashNeeds.trim() ||
    !Number.isFinite(nearTermNeed) ||
    nearTermNeed < 0
  ) {
    issues.push("Define a non-negative near-term cash need.");
  } else if (Number.isFinite(portfolioAmount) && portfolioAmount > 0 && nearTermNeed > portfolioAmount) {
    issues.push("The near-term cash role cannot exceed the planning portfolio amount; use the practice case while the personal funding gap is unresolved.");
  }
  if (mandate.capacityForLoss === "unanswered") issues.push("Assess capacity for loss.");
  if (mandate.willingnessForLoss === "unanswered") issues.push("Assess willingness for loss.");
  if (mandate.route === "unassessed") issues.push("Complete the readiness route.");
  if (mode === "practice" && mandate.route !== "unassessed" && mandate.route !== "practice-only") {
    issues.push("Practice mode requires the practice-only readiness route.");
  }
  if (mode === "personal" && mandate.route === "practice-only") {
    issues.push("Personal mode requires a personal readiness route.");
  }
  if (!mandate.acknowledgedAt) issues.push("Acknowledge the mandate constraints.");
  return issues;
}

export function validateAllocationForCoherence(
  allocation: AllocationRecord,
  mandate: MandateRecord,
): string[] {
  const issues: string[] = [];
  const referenceAmount = allocation.referencePortfolioAmount.value;
  if (
    referenceAmount === null ||
    !Number.isFinite(referenceAmount) ||
    referenceAmount <= 0
  ) {
    issues.push("Define a positive reference portfolio amount.");
  }
  const selected = allocation.stressScenarios.find(
    (scenario) => scenario.id === allocation.selectedStressScenarioId,
  );
  const losses = new Map(selected?.losses.map((loss) => [loss.sleeveId, loss.lossBps.value]) ?? []);
  issues.push(
    ...validateAllocationSleeves(
      allocation.sleeves.map((sleeve) => ({
        ...sleeve,
        assumedLossBps: losses.get(sleeve.id) ?? -1,
      })),
    ).map((issue) => issue.message),
  );
  if (!selected) issues.push("Select a stress scenario.");
  const stressBudget = allocation.portfolioStressLossBudgetBps.value;
  if (stressBudget === null) {
    issues.push("Define a total portfolio stress-loss budget.");
  } else if (
    Number.isSafeInteger(stressBudget) &&
    stressBudget >= 0 &&
    stressBudget <= BASIS_POINTS_TOTAL &&
    selected
  ) {
    const selectedLosses = new Map(selected.losses.map((loss) => [loss.sleeveId, loss.lossBps.value]));
    const completeStressInputs = allocation.sleeves.every((sleeve) => {
      const value = selectedLosses.get(sleeve.id);
      return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= BASIS_POINTS_TOTAL;
    });
    if (completeStressInputs) {
      const portfolioStressLossBps = calculatePortfolioStressLossBps(
        allocation.sleeves.map((sleeve) => ({
          targetBps: sleeve.targetBps,
          assumedLossBps: selectedLosses.get(sleeve.id) as number,
        })),
      );
      if (portfolioStressLossBps > stressBudget) {
        issues.push(
          `Selected scenario stress loss (${portfolioStressLossBps} bps) exceeds the learner-defined portfolio stress-loss budget (${stressBudget} bps).`,
        );
      }
    }
  } else if (!Number.isSafeInteger(stressBudget) || stressBudget < 0 || stressBudget > BASIS_POINTS_TOTAL) {
    issues.push("The total portfolio stress-loss budget must be valid basis points.");
  }
  if (allocation.nearTermNeedBps.value === null) {
    issues.push("Estimate near-term liquidity needs.");
  } else if (
    Number.isSafeInteger(allocation.nearTermNeedBps.value) &&
    allocation.nearTermNeedBps.value >= 0 &&
    allocation.nearTermNeedBps.value <= BASIS_POINTS_TOTAL
  ) {
    const liquidityTarget = allocation.sleeves
      .filter((sleeve) => sleeve.role === "liquidity")
      .reduce((sum, sleeve) => sum + sleeve.targetBps, 0);
    if (!isLiquidityCovered(liquidityTarget, allocation.nearTermNeedBps.value)) {
      issues.push("The liquidity sleeve does not cover the learner-defined near-term need.");
    }
  } else {
    issues.push("Near-term liquidity needs must be whole, valid basis points.");
  }
  const mandateAmountText = mandate.readinessDetails.approximatePortfolioValue.trim();
  const mandateNeedText = mandate.nearTermCashNeeds.trim();
  const mandateAmount = mandateAmountText ? Number(mandateAmountText) : Number.NaN;
  const mandateNeed = mandateNeedText ? Number(mandateNeedText) : Number.NaN;
  if (
    Number.isFinite(mandateAmount) &&
    mandateAmount > 0 &&
    referenceAmount !== mandateAmount
  ) {
    issues.push("The allocation reference amount must match the saved mandate.");
  }
  if (
    Number.isFinite(mandateNeed) &&
    mandateNeed >= 0 &&
    referenceAmount !== null &&
    Number.isFinite(referenceAmount) &&
    referenceAmount > 0
  ) {
    const requiredNeedBps = Math.ceil((mandateNeed / referenceAmount) * BASIS_POINTS_TOTAL);
    if (allocation.nearTermNeedBps.value !== requiredNeedBps) {
      issues.push("The allocation must preserve the saved mandate's near-term cash need.");
    }
  }
  const maximumContribution = allocation.maximumPortfolioLossContributionBps.value;
  const assumedCandidateLoss = allocation.candidatePositionStressLossBps.value;
  const candidateCeilingWasOmitted = maximumContribution === null && assumedCandidateLoss === null;
  const candidateCeilingIsIncomplete =
    (maximumContribution === null) !== (assumedCandidateLoss === null);
  if (candidateCeilingIsIncomplete) {
    issues.push("Provide both candidate-ceiling inputs or leave both blank.");
  } else if (!candidateCeilingWasOmitted) {
    try {
      calculateCandidateCeilingBps(
        maximumContribution as number,
        assumedCandidateLoss as number,
      );
      if (
        allocation.portfolioStressLossBudgetBps.value !== null &&
        (maximumContribution as number) > allocation.portfolioStressLossBudgetBps.value
      ) {
        issues.push("A candidate's allowed loss contribution cannot exceed the total portfolio stress-loss budget.");
      }
    } catch {
      issues.push("Candidate risk assumptions cannot produce a valid position ceiling.");
    }
  }
  if (allocation.mandateRationale.trim().length < 20) {
    issues.push("Explain how the allocation and loss budget connect to the saved mandate and its trade-off.");
  }
  if (!allocation.goalImpactAcknowledged) issues.push("Acknowledge the allocation's goal impact.");
  if (allocation.preflight.status !== "passed" && allocation.preflight.status !== "bridge-complete") {
    issues.push("Complete the allocation preflight or bridge.");
  }
  if (allocation.transfer.status !== "passed") issues.push("Pass the independent transfer case.");
  if (mandate.route === "unassessed") issues.push("The mandate readiness route is unresolved.");
  return [...new Set(issues)];
}

export function saveMandateRecord(
  workbench: PortfolioWorkbenchV1,
  mode: WorkbenchMode,
  mandate: MandateRecord,
  status: SavableCheckpointStatus,
  changedField: string,
  now = new Date().toISOString(),
): PortfolioWorkbenchV1 {
  if (status === "coherent") {
    const issues = validateMandateForCoherence(mandate, mode);
    if (issues.length > 0) throw new WorkbenchValidationError("Mandate is not coherent yet.", issues);
  }
  // Re-acknowledging identical facts produces a fresh timestamp in the UI. A
  // timestamp-only change is not an economic change and must not invalidate
  // every dependent portfolio decision.
  const semanticMandate = ({ acknowledgedAt: _acknowledgedAt, ...rest }: MandateRecord) => rest;
  const dataChanged = JSON.stringify(semanticMandate(workbench.cases[mode].mandate)) !==
    JSON.stringify(semanticMandate(mandate));
  const statusChanged = workbench.cases[mode].checkpoints.mandate.status !== status;
  if (!dataChanged && !statusChanged) return workbench;
  const next = cloneWorkbench(workbench);
  next.cases[mode].mandate = JSON.parse(JSON.stringify(mandate)) as MandateRecord;
  return commitCheckpoint(
    next,
    mode,
    "mandate",
    status,
    changedField,
    "Mandate inputs changed; dependent portfolio decisions must be reconsidered.",
    now,
  );
}

export function saveAllocationRecord(
  workbench: PortfolioWorkbenchV1,
  mode: WorkbenchMode,
  allocation: AllocationRecord,
  status: SavableCheckpointStatus,
  changedField: string,
  now = new Date().toISOString(),
): PortfolioWorkbenchV1 {
  if (status === "coherent") {
    const issues = validateAllocationForCoherence(allocation, workbench.cases[mode].mandate);
    if (issues.length > 0) throw new WorkbenchValidationError("Allocation policy is not coherent yet.", issues);
  }
  const dataChanged = JSON.stringify(workbench.cases[mode].allocation) !== JSON.stringify(allocation);
  const statusChanged = workbench.cases[mode].checkpoints.allocation.status !== status;
  if (!dataChanged && !statusChanged) return workbench;
  const next = cloneWorkbench(workbench);
  next.cases[mode].allocation = JSON.parse(JSON.stringify(allocation)) as AllocationRecord;
  return commitCheckpoint(
    next,
    mode,
    "allocation",
    status,
    changedField,
    "Allocation policy changed; downstream construction decisions require review.",
    now,
  );
}

export function saveCheckpointStatus(
  workbench: PortfolioWorkbenchV1,
  mode: WorkbenchMode,
  checkpoint: Exclude<WorkbenchCheckpointId, "mandate" | "allocation">,
  status: SavableCheckpointStatus,
  changedField: string,
  reason: string,
  now = new Date().toISOString(),
): PortfolioWorkbenchV1 {
  return commitCheckpoint(workbench, mode, checkpoint, status, changedField, reason, now);
}

export type WorkbenchLifecycle =
  | "draft"
  | "mandate-drafted"
  | "policy-coherent"
  | "research-checked"
  | "architecture-licensed"
  | "products-verified"
  | "operating-plan-ready"
  | "execute-ready"
  | "practice-complete";

export function deriveWorkbenchLifecycle(workbenchCase: WorkbenchCase): WorkbenchLifecycle {
  if (workbenchCase.graduation.status === "passed") {
    if (workbenchCase.graduation.outcome === "execute-ready" && workbenchCase.mode === "personal") {
      return "execute-ready";
    }
    if (workbenchCase.graduation.outcome === "practice-complete") return "practice-complete";
  }
  if (workbenchCase.checkpoints.policy.status === "coherent") return "operating-plan-ready";
  if (workbenchCase.checkpoints.holdings.status === "coherent") return "products-verified";
  if (workbenchCase.checkpoints.architecture.status === "coherent") return "architecture-licensed";
  if (
    workbenchCase.checkpoints.evidence.status === "coherent" &&
    workbenchCase.checkpoints.valuation.status === "coherent"
  ) return "research-checked";
  if (workbenchCase.checkpoints.allocation.status === "coherent") return "policy-coherent";
  if (workbenchCase.checkpoints.mandate.status === "coherent") return "mandate-drafted";
  return "draft";
}
