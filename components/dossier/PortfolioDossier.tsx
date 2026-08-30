"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  calculateCandidateCeilingBps,
  calculatePortfolioStressLossBps,
  calculateStressContributionBps,
  isLiquidityCovered,
} from "@/lib/allocation-policy";
import {
  useIFProgress,
  type HoldingsSlate,
  type RebalanceRule,
  type ScenarioResponse,
  type TimingPolicy,
} from "@/lib/if-progress";
import { ALL_FLIGHT_SCENARIOS } from "@/lib/operating-plan";
import {
  type AllocationRecord,
  type AssumptionOwner,
  type CheckpointState,
  type MandateRecord,
  type ProvenancedValue,
  type WorkbenchMode,
} from "@/lib/portfolio-workbench";
import { usePortfolioWorkbench } from "@/lib/use-portfolio-workbench";
import { cn } from "@/lib/utils";

/**
 * The learner writes six artifacts across Investment Foundations and, until this
 * view existed, could never read any of them back. Everything here is rendered
 * from the same localStorage records the lessons write, via useIFProgress, so it
 * updates live and stores nothing of its own.
 */

type Field = { label: string; value: string | string[] };
type Group = { heading?: string; fields: Field[] };

type Section = {
  id: string;
  mission: string;
  title: string;
  purpose: string;
  lessonSlug: string;
  lessonLabel: string;
  willContain: string;
  updatedAt: string;
  groups: Group[];
  statusLabel?: string;
  needsReview?: boolean;
};

// Values arrive from floating-point arithmetic (999.9999999999999, 1333.3333…),
// so round to whole millions. This is a document, not a calculator readout.
const money = (v: number) =>
  `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}m`;
const percent = (v: number, digits = 1) => `${(Number(v) * 100).toFixed(digits)}%`;

const dollars = (value: number) =>
  `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const bpsPercent = (basisPoints: number) =>
  `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    basisPoints / 100,
  )}%`;

const approximateDollars = (referenceAmount: number | null, basisPoints: number) =>
  referenceAmount === null
    ? "Reference amount not recorded"
    : `approximately ${dollars((referenceAmount * basisPoints) / 10_000)}`;

const modeLabel = (mode: WorkbenchMode) =>
  mode === "personal" ? "Personal planning case" : "Practice case";

const ownerLabel = (owner: AssumptionOwner) => {
  if (owner === "learner") return "Learner-defined";
  if (owner === "ops") return "OPS practice adaptation";
  return "Reviewed source";
};

const readinessRouteLabel = (route: MandateRecord["route"]) => {
  if (route === "personal-available") return "Personal path available";
  if (route === "personal-constrained") return "Personal path constrained";
  if (route === "practice-only") return "Practice path only";
  return "Not assessed";
};

/**
 * Already in percentage points, unlike `percent` above, which takes a decimal
 * fraction and multiplies. Mission 11 stores a deviation limit and a friction
 * cost in points, and running either through `percent` would report them a
 * hundred times too large.
 */
const pointsPercent = (value: number) =>
  `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    Number(value),
  )}%`;

const timingModeLabel = (mode: TimingPolicy["mode"]) => {
  if (mode === "no-timing") return "No timing — the strategic weights stand";
  if (mode === "bounded") return "Bounded timing, inside a written limit";
  return "";
};

const issuerKeyLabel = (mode: HoldingsSlate["issuerKeyMode"]) => {
  if (mode === "instrument") return "Instrument identity — one security at a time";
  if (mode === "issuer") return "Issuer identity — everything one issuer stands behind";
  return "";
};

const rebalanceTriggerLabel = (rule: RebalanceRule) => {
  if (rule.trigger === "calendar") {
    return rule.cadenceMonths > 0 ? `Calendar — every ${rule.cadenceMonths} months` : "";
  }
  if (rule.trigger === "threshold") {
    return rule.bandBps > 0
      ? `Threshold — when a sleeve drifts ${bpsPercent(rule.bandBps)} from target`
      : "";
  }
  return "";
};

const rebalanceMethodLabel = (method: RebalanceRule["method"]) => {
  if (method === "sell-and-buy") return "Sell what is over, buy what is under";
  if (method === "new-money") return "Direct new money to what is under";
  if (method === "redirect-flows") return "Redirect income and distributions";
  return "";
};

/**
 * One flight-test answer, read back as a sentence.
 *
 * `policySilent` is carried rather than hidden. A gap the learner found is the
 * most useful thing the flight test produces, and a dossier that quietly dropped
 * it would report a plan as more complete than it is.
 */
const scenarioSummary = (response: ScenarioResponse) => {
  const verdict =
    response.response === "act"
      ? "Act"
      : response.response === "no-action"
        ? "No action"
        : response.response === "review"
          ? "Review"
          : "";
  if (!verdict) return "";
  const parts = [verdict];
  if (response.controllingPolicy.trim()) parts.push(`under ${response.controllingPolicy.trim()}`);
  if (response.policySilent) parts.push("policy silent — returned to the rule writer");
  return parts.join(" · ");
};

const checkpointStatusLabel = (checkpoint: CheckpointState) => {
  if (checkpoint.status === "saved-unverified") return "Saved, not independently verified";
  if (checkpoint.status === "review-required") return "Review required";
  if (checkpoint.status === "coherent") return "Coherence checks passed";
  if (checkpoint.status === "blocked") return "Blocked pending review";
  if (checkpoint.status === "draft") return "Draft";
  return "Not started";
};

const assumptionDetail = <T extends string | number | boolean | null>(
  assumption: ProvenancedValue<T>,
) => {
  const parts = [ownerLabel(assumption.owner)];
  if (assumption.note.trim()) parts.push(assumption.note.trim());
  if (assumption.asOf) parts.push(`As of ${formatWhen(assumption.asOf) || assumption.asOf}`);
  return parts.join(". ");
};

const safeStressContribution = (weightBps: number, lossBps: number | null) => {
  if (lossBps === null) return null;
  try {
    return calculateStressContributionBps(weightBps, lossBps);
  } catch {
    return null;
  }
};

function selectedStressDetails(allocation: AllocationRecord) {
  const scenario = allocation.stressScenarios.find(
    (candidate) => candidate.id === allocation.selectedStressScenarioId,
  );
  if (!scenario) return null;

  const losses = new Map(
    scenario.losses.map((loss) => [loss.sleeveId, loss.lossBps] as const),
  );
  const completeInputs = allocation.sleeves.every(
    (sleeve) => losses.get(sleeve.id)?.value !== null && losses.has(sleeve.id),
  );

  let totalStressLossBps: number | null = null;
  if (completeInputs && allocation.sleeves.length > 0) {
    try {
      totalStressLossBps = calculatePortfolioStressLossBps(
        allocation.sleeves.map((sleeve) => ({
          targetBps: sleeve.targetBps,
          assumedLossBps: losses.get(sleeve.id)?.value as number,
        })),
      );
    } catch {
      totalStressLossBps = null;
    }
  }

  return { scenario, losses, totalStressLossBps };
}

/** Drop empty fields so a partially filled artifact shows only real answers. */
function present(groups: Group[]): Group[] {
  return groups
    .map((g) => ({
      ...g,
      fields: g.fields.filter((f) =>
        Array.isArray(f.value) ? f.value.length > 0 : f.value.trim().length > 0,
      ),
    }))
    .filter((g) => g.fields.length > 0);
}

function formatWhen(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function sentenceCase(value: string) {
  const words = value.replaceAll("-", " ");
  return words ? `${words.charAt(0).toUpperCase()}${words.slice(1)}` : "";
}

function workbenchStatusGroup(mode: WorkbenchMode, checkpoint: CheckpointState): Group {
  return {
    heading: "Record status",
    fields: [
      { label: "Selected mode", value: modeLabel(mode) },
      { label: "Checkpoint", value: checkpointStatusLabel(checkpoint) },
      { label: "Revision", value: checkpoint.revision ? String(checkpoint.revision) : "" },
      { label: "Review trigger", value: checkpoint.review?.changedField ?? "" },
      { label: "Review reason", value: checkpoint.review?.reason ?? "" },
    ],
  };
}

function mandateSection(
  mode: WorkbenchMode,
  mandate: MandateRecord,
  checkpoint: CheckpointState,
): Section {
  const details = mandate.readinessDetails;
  const hasExactDetails = details.profileOwner !== "unassessed";
  return {
    id: "mandate",
    mission: "Mission 1 · readiness bridge updated in Mission 5",
    title: "Mandate",
    purpose:
      "The planning constraints and readiness route that frame this case before allocation.",
    lessonSlug: "if-pb-05-set-allocation-and-risk-limits",
    lessonLabel: "Set allocation and risk limits",
    willContain:
      "the selected case mode, goal, horizon, liquidity constraints, readiness route, and any action required before a personal allocation is treated as coherent",
    updatedAt: checkpoint.updatedAt,
    statusLabel: checkpointStatusLabel(checkpoint),
    needsReview:
      checkpoint.status === "review-required" || checkpoint.status === "blocked",
    groups: present([
      workbenchStatusGroup(mode, checkpoint),
      {
        heading: "Objective and runway",
        fields: [
          { label: "Goal", value: mandate.goal },
          { label: "Target date", value: mandate.targetDate },
          { label: "Horizon", value: mandate.horizon },
          { label: "Contribution plan", value: mandate.contributionPlan },
          { label: "Planned withdrawals", value: mandate.plannedWithdrawals },
          {
            label: "Approximate planning amount",
            value:
              hasExactDetails && details.approximatePortfolioValue
                ? dollars(Number(details.approximatePortfolioValue))
                : "",
          },
        ],
      },
      {
        heading: "Liquidity and capacity",
        fields: [
          { label: "Near-term cash need", value: mandate.nearTermCashNeeds },
          { label: "Reserve target", value: mandate.emergencyReserve.target },
          { label: "Reserve recorded", value: mandate.emergencyReserve.current },
          {
            label: "Reserve status",
            value: sentenceCase(hasExactDetails ? details.reserveStatus : mandate.emergencyReserve.status),
          },
          { label: "Capacity for loss", value: sentenceCase(hasExactDetails ? details.capacityForLoss : mandate.capacityForLoss) },
          {
            label: "Willingness for loss",
            value: sentenceCase(hasExactDetails ? details.willingnessForLoss : mandate.willingnessForLoss),
          },
        ],
      },
      {
        heading: "Readiness checks",
        fields: [
          { label: "High-interest debt", value: sentenceCase(hasExactDetails ? details.highInterestDebt : mandate.highInterestDebt) },
          { label: "Employer match", value: sentenceCase(hasExactDetails ? details.employerMatch : mandate.employerMatch) },
          { label: "Account authority", value: sentenceCase(hasExactDetails ? details.accountAuthority : mandate.accountAuthority) },
          { label: "Jurisdiction", value: sentenceCase(hasExactDetails ? details.jurisdiction : mandate.jurisdiction) },
          { label: "Earned income", value: sentenceCase(hasExactDetails ? details.earnedIncomeStatus : mandate.earnedIncome) },
          { label: "Existing exposure categories", value: mandate.existingExposureCategories },
          { label: "Life-change diagnosis", value: hasExactDetails ? sentenceCase(details.lifeChangeDiagnosis) : "" },
          { label: "Life-change response", value: hasExactDetails ? sentenceCase(details.lifeChangeAction) : "" },
        ],
      },
      {
        heading: "Route",
        fields: [
          { label: "Readiness route", value: readinessRouteLabel(mandate.route) },
          { label: "Next actions", value: mandate.deploymentActions },
          {
            label: "Acknowledged",
            value: formatWhen(mandate.acknowledgedAt),
          },
        ],
      },
    ]),
  };
}

function allocationSection(
  mode: WorkbenchMode,
  allocation: AllocationRecord,
  checkpoint: CheckpointState,
): Section {
  const referenceAmount = allocation.referencePortfolioAmount.value;
  const stress = selectedStressDetails(allocation);
  const budgetBps = allocation.portfolioStressLossBudgetBps.value;
  const nearTermNeedBps = allocation.nearTermNeedBps.value;
  const liquidityTargetBps = allocation.sleeves
    .filter((sleeve) => sleeve.role === "liquidity")
    .reduce((total, sleeve) => total + sleeve.targetBps, 0);

  let liquidityCoverage = "Not calculated";
  if (nearTermNeedBps !== null) {
    try {
      liquidityCoverage = isLiquidityCovered(liquidityTargetBps, nearTermNeedBps)
        ? "Covered by the target liquidity weight in this draft"
        : "Not covered by the target liquidity weight in this draft";
    } catch {
      liquidityCoverage = "Could not be calculated from the saved inputs";
    }
  }

  const candidateContribution = allocation.maximumPortfolioLossContributionBps.value;
  const candidateLoss = allocation.candidatePositionStressLossBps.value;
  let candidateCeiling = "Omitted from this policy draft";
  if ((candidateContribution === null) !== (candidateLoss === null)) {
    candidateCeiling = "Incomplete: both candidate-risk inputs are needed";
  } else if (candidateContribution !== null && candidateLoss !== null) {
    try {
      const ceilingBps = calculateCandidateCeilingBps(candidateContribution, candidateLoss);
      candidateCeiling = `${bpsPercent(ceilingBps)} of the reference portfolio (${approximateDollars(
        referenceAmount,
        ceilingBps,
      )})`;
    } catch {
      candidateCeiling = "Could not be calculated from the saved inputs";
    }
  }

  const sleeveFields: Field[] = allocation.sleeves.map((sleeve) => {
    const loss = stress?.losses.get(sleeve.id)?.value ?? null;
    const contribution = safeStressContribution(sleeve.targetBps, loss);
    const details = [
      `${sentenceCase(sleeve.role)} role. Range ${bpsPercent(sleeve.minBps)} to ${bpsPercent(
        sleeve.maxBps,
      )}; target ${bpsPercent(sleeve.targetBps)}. ${ownerLabel(sleeve.owner)} policy.`,
      `Target reference value: ${approximateDollars(referenceAmount, sleeve.targetBps)}.`,
    ];
    if (loss !== null && contribution !== null) {
      details.push(
        `${stress?.scenario.label ?? "Selected scenario"}: ${bpsPercent(
          loss,
        )} assumed loss, contributing ${bpsPercent(contribution)} to portfolio loss (${approximateDollars(
          referenceAmount,
          contribution,
        )}).`,
      );
    }
    return { label: sleeve.label, value: details };
  });

  const scenarioAssumptions: Field[] = stress
    ? allocation.sleeves.map((sleeve) => {
        const loss = stress.losses.get(sleeve.id);
        return {
          label: `${sleeve.label} assumption`,
          value: loss ? assumptionDetail(loss) : "No assumption recorded",
        };
      })
    : [];

  const totalStress = stress?.totalStressLossBps ?? null;
  const stressComparison =
    totalStress === null
      ? "Not calculated"
      : budgetBps === null
        ? `${bpsPercent(totalStress)} (${approximateDollars(referenceAmount, totalStress)}); no budget recorded`
        : `${bpsPercent(totalStress)} (${approximateDollars(
            referenceAmount,
            totalStress,
          )}) versus ${bpsPercent(budgetBps)} budget (${approximateDollars(
            referenceAmount,
            budgetBps,
          )})`;

  const candidateInputs =
    candidateContribution === null && candidateLoss === null
      ? "Not included"
      : `Maximum portfolio-loss contribution ${
          candidateContribution === null ? "not recorded" : bpsPercent(candidateContribution)
        }; assumed candidate loss ${candidateLoss === null ? "not recorded" : bpsPercent(candidateLoss)}`;

  return {
    id: "allocation-policy",
    mission: "Mission 5",
    title: "Allocation & risk policy",
    purpose:
      "A saved policy draft linking sleeve roles, ranges, liquidity needs, and labeled stress assumptions.",
    lessonSlug: "if-pb-05-set-allocation-and-risk-limits",
    lessonLabel: "Set allocation and risk limits",
    willContain:
      "target ranges, reference values, scenario provenance, stress contributions, the recorded loss budget, liquidity coverage, and an optional candidate-position ceiling",
    updatedAt: checkpoint.updatedAt || allocation.savedAt,
    statusLabel: checkpointStatusLabel(checkpoint),
    needsReview:
      checkpoint.status === "review-required" || checkpoint.status === "blocked",
    groups: present([
      workbenchStatusGroup(mode, checkpoint),
      {
        heading: "Reference case",
        fields: [
          {
            label: "Reference amount",
            value:
              referenceAmount === null
                ? "Not recorded"
                : `${dollars(referenceAmount)}. ${assumptionDetail(
                    allocation.referencePortfolioAmount,
                  )}`,
          },
          {
            label: "Policy meaning",
            value:
              "These are planning targets for the selected case, not a statement of owned holdings or permission to trade.",
          },
          {
            label: "Mandate rationale and accepted trade-off",
            value: allocation.mandateRationale,
          },
        ],
      },
      { heading: "Sleeve policy", fields: sleeveFields },
      {
        heading: "Selected stress scenario",
        fields: [
          { label: "Scenario", value: stress?.scenario.label ?? "Not selected" },
          ...scenarioAssumptions,
          { label: "Total stress vs budget", value: stressComparison },
          {
            label: "Budget provenance",
            value:
              budgetBps === null
                ? "Not recorded"
                : assumptionDetail(allocation.portfolioStressLossBudgetBps),
          },
          {
            label: "Interpretation",
            value:
              "This is arithmetic under saved assumptions, not a forecast, guarantee, or live-market estimate.",
          },
        ],
      },
      {
        heading: "Liquidity check",
        fields: [
          {
            label: "Near-term need",
            value:
              nearTermNeedBps === null
                ? "Not recorded"
                : `${bpsPercent(nearTermNeedBps)} (${approximateDollars(
                    referenceAmount,
                    nearTermNeedBps,
                  )}). ${assumptionDetail(allocation.nearTermNeedBps)}`,
          },
          {
            label: "Liquidity target",
            value: `${bpsPercent(liquidityTargetBps)} (${approximateDollars(
              referenceAmount,
              liquidityTargetBps,
            )})`,
          },
          { label: "Coverage", value: liquidityCoverage },
          {
            label: "Limits",
            value:
              "Coverage compares entered percentages only; it does not guarantee access, price stability, or suitability.",
          },
        ],
      },
      {
        heading: "Optional candidate ceiling",
        fields: [
          { label: "Inputs", value: candidateInputs },
          {
            label: "Contribution provenance",
            value:
              candidateContribution === null
                ? ""
                : assumptionDetail(allocation.maximumPortfolioLossContributionBps),
          },
          {
            label: "Loss provenance",
            value:
              candidateLoss === null
                ? ""
                : assumptionDetail(allocation.candidatePositionStressLossBps),
          },
          { label: "Calculated ceiling", value: candidateCeiling },
          {
            label: "Use",
            value:
              "A planning constraint under an assumed candidate loss, not a recommendation or trading authorization.",
          },
        ],
      },
    ]),
  };
}

export default function PortfolioDossier() {
  const {
    draft,
    bondBrief,
    equityRiskPolicy,
    statementBrief,
    valuationRange,
    frictionBudget,
    evidenceChecklist,
    architectureDecision,
    beliefStatement,
    observationNote,
    timingPolicy,
    holdingsSlate,
    operatingPlan,
  } = useIFProgress();
  const {
    ready: workbenchReady,
    activeMode,
    activeCase,
  } = usePortfolioWorkbench();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  /**
   * Which artifacts are open. Absent means "use the default for this section",
   * which is closed unless the record is asking to be looked at.
   *
   * Thirteen artifacts fully expanded ran to 8.4 screens at 1440 and 12.5 on a
   * phone, so the compiled document could not be scanned without scrolling past
   * the thing you came for. Collapsed, the page is a list of thirteen decisions
   * you open one at a time.
   */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Artifacts load in an effect, so the first paint has none. Gate on mount to
  // avoid rendering an "empty dossier" that immediately replaces itself.
  useEffect(() => setMounted(true), []);

  const sections = useMemo<Section[]>(
    () => [
      mandateSection(activeMode, activeCase.mandate, activeCase.checkpoints.mandate),
      allocationSection(
        activeMode,
        activeCase.allocation,
        activeCase.checkpoints.allocation,
      ),
      {
        id: "philosophy",
        mission: "Mission 1",
        title: "Investment philosophy draft",
        purpose: "Who you are building this for, and what you can actually run.",
        lessonSlug: "if-1-4-when-a-philosophy-fits-the-investor",
        lessonLabel: "Investor–philosophy fit",
        willContain:
          "the constraints you actually face, a candidate strategy, and the rules you would follow to run it",
        updatedAt: draft.updatedAt,
        groups: present([
          {
            heading: "Where the advantage arises",
            fields: [{ label: "Stage of the process", value: draft.advantageStage }],
          },
          {
            heading: "Investor constraints",
            fields: [
              { label: "Risk preference", value: draft.constraints.riskPreference },
              { label: "Horizon", value: draft.constraints.horizon },
              { label: "Cash needs", value: draft.constraints.cashNeeds },
              { label: "Liquidity needs", value: draft.constraints.liquidityNeeds },
              { label: "Tax considerations", value: draft.constraints.taxConsiderations },
              { label: "Capital", value: draft.constraints.capital },
              { label: "Research time", value: draft.constraints.researchTime },
              { label: "Patience", value: draft.constraints.patience },
              { label: "Analytical tools", value: draft.constraints.analyticalTools },
              {
                label: "Underperformance tolerance",
                value: draft.constraints.underperformanceTolerance,
              },
            ],
          },
          {
            heading: "Strategy and rules",
            fields: [
              { label: "Strategy", value: draft.strategy },
              { label: "Implementation risks", value: draft.implementationRisks },
              { label: "Execution rule", value: draft.executionRule },
              { label: "Evaluation rule", value: draft.evaluationRule },
            ],
          },
          {
            heading: "Philosophy families considered",
            fields: [
              { label: "Candidates", value: draft.candidateFamilies },
              { label: "Evidence rule", value: draft.familyEvidenceRule },
              { label: "Open research question", value: draft.familyResearchQuestion },
            ],
          },
          {
            heading: "Fit",
            fields: [
              { label: "Chosen family", value: draft.fitFamily },
              { label: "Capacity to run it", value: draft.fitCapacitySummary },
              { label: "Review rule", value: draft.fitReviewRule },
              { label: "Open question", value: draft.fitOpenQuestion },
            ],
          },
        ]),
      },
      {
        id: "beliefs",
        mission: "Mission 2",
        title: "Market observation note",
        purpose: "What you can actually observe about markets, and what it does not settle.",
        lessonSlug: "if-1-1-how-an-investor-builds-a-philosophy",
        lessonLabel: "Observe the market first",
        willContain:
          "one dated disclosure, what the price did afterwards, the narrowest explanation it supports, and what it cannot show",
        updatedAt: observationNote.updatedAt,
        groups: present([
          {
            heading: "The case",
            fields: [
              { label: "What was disclosed", value: observationNote.disclosure },
              { label: "What the price did", value: observationNote.priceResponse },
            ],
          },
          {
            heading: "What it shows, and what it does not",
            fields: [
              { label: "Narrowest explanation", value: observationNote.interpretation },
              { label: "Not established by this case", value: observationNote.uncertainty },
              { label: "Needed before generalising", value: observationNote.nextEvidence },
              {
                label: "Enough for a market belief?",
                // The mission's most literate outcome, so the dossier records it
                // as a finding rather than leaving the field blank.
                value: observationNote.declinedToGeneralise
                  ? "Not yet — three cases cannot support a belief. The belief is written in Mission 9."
                  : "",
              },
            ],
          },
        ]),
      },
      {
        id: "bond-risk",
        mission: "Mission 3",
        title: "Bond risk brief",
        purpose: "What a bond can do to you, and what you would pay for it.",
        lessonSlug: "if-2-5-from-credit-rating-to-bond-price",
        lessonLabel: "From credit rating to bond price",
        willContain:
          "the payments promised, your reading of interest-rate and default risk, and a pricing decision",
        updatedAt: bondBrief.updatedAt,
        groups: present([
          {
            fields: [
              { label: "Payment promise", value: bondBrief.paymentPromise },
              { label: "Interest-rate risk", value: bondBrief.rateRisk },
              { label: "Duration finding", value: bondBrief.durationFinding },
              { label: "Default evidence", value: bondBrief.defaultEvidence },
              { label: "Pricing decision", value: bondBrief.pricingDecision },
            ],
          },
        ]),
      },
      {
        id: "equity-risk",
        mission: "Mission 4",
        title: "Equity risk policy",
        purpose: "How you measure equity risk, and the return you demand for it.",
        lessonSlug: "if-3-6-build-an-equity-risk-policy",
        lessonLabel: "Build an equity risk policy",
        willContain:
          "your definition of risk, how you read beta, which measures you rely on, and your price rule",
        updatedAt: equityRiskPolicy.updatedAt,
        groups: present([
          {
            fields: [
              { label: "Risk definition", value: equityRiskPolicy.riskDefinition },
              { label: "Portfolio context", value: equityRiskPolicy.portfolioContext },
              { label: "Reading beta", value: equityRiskPolicy.betaInterpretation },
              { label: "Fundamental drivers", value: equityRiskPolicy.fundamentalDrivers },
              { label: "Measures relied on", value: equityRiskPolicy.methodStack },
              { label: "Price rule", value: equityRiskPolicy.priceRule },
              { label: "Decision", value: equityRiskPolicy.decision },
              {
                label: "Remaining uncertainty",
                value: equityRiskPolicy.remainingUncertainty,
              },
            ],
          },
        ]),
      },
      {
        id: "statements",
        mission: "Mission 6",
        title: "Business evidence brief",
        purpose: "What the statements say about the business behind the security.",
        lessonSlug: "if-4-6-trace-cash-to-the-investor",
        lessonLabel: "Trace cash to the investor",
        willContain:
          "how the three statements connect, what you found on profitability, leverage and cash, and what you still need to know",
        updatedAt: statementBrief.updatedAt,
        groups: present([
          {
            fields: [
              { label: "Statement map", value: statementBrief.statementMap },
              { label: "Balance sheet finding", value: statementBrief.balanceSheetFinding },
              { label: "Financial recast", value: statementBrief.financialRecast },
              { label: "Profitability", value: statementBrief.profitabilityFinding },
              { label: "Adjustments", value: statementBrief.adjustmentFinding },
              { label: "Cash flow", value: statementBrief.cashFlowFinding },
              { label: "Decision", value: statementBrief.decision },
              { label: "Remaining question", value: statementBrief.remainingQuestion },
            ],
          },
        ]),
      },
      {
        id: "valuation",
        mission: "Mission 7",
        title: "Valuation and return range",
        purpose: "What it is worth, and the price at which you would act.",
        lessonSlug: "if-5-1-estimate-a-valuation-range",
        lessonLabel: "Estimate a valuation range",
        willContain:
          "the claim you valued, a low/base/high range, your decision buffer, and the evidence that would change your mind",
        updatedAt: valuationRange.updatedAt,
        groups: valuationRange.updatedAt
          ? present([
              {
                fields: [
                  { label: "Claim valued", value: valuationRange.claim },
                  { label: "Method", value: valuationRange.method },
                ],
              },
              {
                heading: "The range",
                fields: [
                  { label: "Low case", value: money(valuationRange.lowValue) },
                  { label: "Base case", value: money(valuationRange.baseValue) },
                  { label: "Quality case", value: money(valuationRange.highValue) },
                  { label: "Observed price", value: money(valuationRange.observedPrice) },
                  {
                    label: "Required return",
                    value: percent(valuationRange.requiredReturn, 0),
                  },
                  {
                    label: "Decision buffer",
                    value: percent(valuationRange.decisionBuffer, 0),
                  },
                  { label: "Buy below", value: money(valuationRange.buyBelow) },
                ],
              },
              {
                heading: "Decision",
                fields: [
                  { label: "Verdict", value: valuationRange.decision },
                  { label: "Relative check", value: valuationRange.relativeCheck },
                  { label: "Would change my mind", value: valuationRange.evidenceTriggers },
                ],
              },
            ])
          : [],
      },
      {
        id: "friction",
        mission: "Mission 8",
        title: "Friction budget",
        purpose: "What acting will cost you, and the hurdle that creates.",
        lessonSlug: "if-6-1-count-the-friction",
        lessonLabel: "Count the friction",
        willContain:
          "your expected turnover, the liquidity of what you hold, your price-impact and waiting exposure, your tax setting, and the annual drag they add up to",
        updatedAt: frictionBudget.updatedAt,
        groups: frictionBudget.updatedAt
          ? present([
              {
                fields: [
                  { label: "Expected turnover", value: frictionBudget.turnoverExpectation },
                  { label: "Holdings liquidity", value: frictionBudget.spreadClass },
                  { label: "Price-impact exposure", value: frictionBudget.priceImpactExposure },
                  { label: "Waiting sensitivity", value: frictionBudget.waitingSensitivity },
                  { label: "Tax setting", value: frictionBudget.taxSetting },
                ],
              },
              {
                heading: "The hurdle",
                fields: [
                  {
                    label: "Estimated annual drag",
                    value: percent(frictionBudget.estimatedAnnualDrag, 1),
                  },
                  { label: "Rule", value: frictionBudget.hurdleRule },
                ],
              },
            ])
          : [],
      },
      {
        id: "evidence",
        mission: "Mission 9",
        title: "Evidence test checklist and market belief",
        purpose:
          "How you will decide whether a claim about beating the market is real, and what you believe once you can test one.",
        lessonSlug: "if-7-1-test-the-claim",
        lessonLabel: "Test the claim",
        willContain:
          "the measure you judge a claim by, the test your claim calls for, what you hold back, how you build the sample, the return the claim must clear, and what would make you drop it",
        updatedAt: evidenceChecklist.updatedAt,
        groups: evidenceChecklist.updatedAt
          ? present([
              {
                fields: [
                  { label: "Benchmark", value: evidenceChecklist.benchmark },
                  { label: "Test design", value: evidenceChecklist.testDesign },
                  { label: "Holdout", value: evidenceChecklist.holdoutRule },
                  { label: "Sampling", value: evidenceChecklist.samplingRule },
                ],
              },
              {
                heading: "The bar",
                fields: [
                  { label: "Hurdle", value: evidenceChecklist.hurdleRule },
                  { label: "Abandon if", value: evidenceChecklist.abandonRule },
                ],
              },
              {
                // Curriculum amendment 1 moved the belief here from Mission 2,
                // so it is written once the learner can test a claim.
                heading: "Market belief",
                fields: [
                  { label: "Summary", value: beliefStatement.generatedSummary },
                  { label: "Position", value: beliefStatement.marketBelief },
                  { label: "Why it might persist", value: beliefStatement.persistenceReason },
                  { label: "What would change your mind", value: beliefStatement.evidenceGap },
                ],
              },
            ])
          : [],
      },
      {
        id: "architecture",
        mission: "Mission 10",
        title: "Architecture and edge decision",
        purpose: "Whether you will run a passive core, and what it took to justify anything else.",
        lessonSlug: "if-8-1-choose-passive-or-prove-an-edge",
        lessonLabel: "Choose passive, or prove an edge",
        willContain:
          "the exposure your core holds, the benchmark it is judged against, the base rate you decided under with its date, and — only if every condition was met — the sleeve you licensed, what would close it, and when you will review",
        updatedAt: architectureDecision.updatedAt,
        groups: architectureDecision.updatedAt
          ? present([
              {
                fields: [
                  {
                    label: "Architecture",
                    value:
                      architectureDecision.mode === "active-sleeve"
                        ? "Passive core plus a licensed active sleeve"
                        : "Passive core only",
                  },
                  { label: "Core exposure", value: architectureDecision.coreExposure },
                  { label: "Benchmark", value: architectureDecision.coreBenchmark },
                  { label: "Review on", value: architectureDecision.reviewDate },
                ],
              },
              {
                heading: "The base rate you decided under",
                fields: [
                  { label: "Base rate", value: architectureDecision.baseRate },
                  { label: "As of", value: architectureDecision.baseRateDate },
                  { label: "Scope", value: architectureDecision.baseRateScope },
                ],
              },
              // Sleeve detail is omitted entirely for a passive-only decision —
              // that outcome is complete, not a record with gaps in it.
              ...(architectureDecision.mode === "active-sleeve"
                ? [
                    {
                      heading: "The licensed sleeve",
                      fields: [
                        { label: "Mispricing", value: architectureDecision.pocket },
                        { label: "Who is wrong", value: architectureDecision.whoIsWrong },
                        {
                          label: "What corrects it",
                          value: architectureDecision.correctionMechanism,
                        },
                        { label: "Claim", value: architectureDecision.falsifiableClaim },
                        { label: "Refuted by", value: architectureDecision.disconfirming },
                        { label: "Evidence design", value: architectureDecision.evidenceDesign },
                      ],
                    },
                    {
                      heading: "What it survives on",
                      fields: [
                        {
                          label: "Net edge",
                          value: `${architectureDecision.netEdgePct}% after ${architectureDecision.frictionPct}% friction`,
                        },
                        {
                          label: "Size",
                          value: `${architectureDecision.maxAllocationPct}% of the portfolio, contributing ${architectureDecision.lossContributionPct} points of stressed loss`,
                        },
                        { label: "Durability", value: architectureDecision.durabilityRisk },
                        { label: "Close it if", value: architectureDecision.thesisBreak },
                      ],
                    },
                  ]
                : []),
            ])
          : [],
      },
      {
        id: "timing",
        mission: "Mission 11",
        title: "Timing policy",
        purpose:
          "Whether you will ever move away from your policy weights on purpose, and what brings you back if you do.",
        lessonSlug: "if-pb-11-set-a-market-timing-policy",
        lessonLabel: "Set a market-timing policy",
        willContain:
          "the policy you chose and why — and, only if you wrote a bounded tilt, the signal, the limit, what ends it, and the friction it has to clear first",
        updatedAt: timingPolicy.updatedAt,
        groups: timingPolicy.updatedAt
          ? present([
              {
                fields: [
                  { label: "Policy", value: timingModeLabel(timingPolicy.mode) },
                  { label: "Reason", value: timingPolicy.reason },
                ],
              },
              // No timing is a finished answer, not a record with holes in it,
              // so the bound is omitted entirely rather than shown empty. This
              // matches how Mission 10 treats a passive-only architecture.
              ...(timingPolicy.mode === "bounded"
                ? [
                    {
                      heading: "The bound",
                      fields: [
                        { label: "Signal", value: timingPolicy.signal },
                        { label: "Benchmark", value: timingPolicy.benchmark },
                        {
                          label: "Most it may deviate",
                          value: timingPolicy.maxDeviationPct
                            ? pointsPercent(timingPolicy.maxDeviationPct)
                            : "",
                        },
                        { label: "Eligible sleeve", value: timingPolicy.eligibleSleeve },
                      ],
                    },
                    {
                      heading: "What ends it",
                      fields: [
                        { label: "Expires", value: timingPolicy.expiryDate },
                        { label: "Falsified by", value: timingPolicy.falsifier },
                        { label: "Review on", value: timingPolicy.reviewDate },
                        {
                          label: "Round-trip friction it must clear",
                          value: timingPolicy.frictionCostPct
                            ? pointsPercent(timingPolicy.frictionCostPct)
                            : "",
                        },
                      ],
                    },
                  ]
                : []),
            ])
          : [],
      },
      {
        id: "holdings",
        mission: "Mission 12",
        title: "Holdings slate and order draft",
        purpose:
          "The exact products you would hold, identified by more than a ticker, and the order you rehearsed without sending.",
        lessonSlug: "if-pb-12-choose-the-actual-holdings",
        lessonLabel: "Choose the actual holdings",
        willContain:
          "each line's series and class identity with its sleeve and target weight, the key you ran the look-through on, what you acknowledged about overlap and the holdings date, and an order draft that is never transmitted",
        updatedAt: holdingsSlate.updatedAt,
        statusLabel: holdingsSlate.reviewRequired ? "Review required" : undefined,
        needsReview: holdingsSlate.reviewRequired,
        groups: holdingsSlate.updatedAt
          ? present([
              {
                heading: "The slate",
                fields: [
                  ...holdingsSlate.lines.map((line) => ({
                    label: `${line.ticker} · ${sentenceCase(line.sleeve)}`,
                    value: `${pointsPercent(line.targetWeightPct)} — series ${line.seriesId}, class ${line.classId}`,
                  })),
                  // A slate that does not total 100% is one of Mission 13's
                  // critical failures, so the sum is stated rather than left for
                  // the reader to do in their head.
                  {
                    label: "Total weight",
                    value: holdingsSlate.lines.length
                      ? pointsPercent(
                          holdingsSlate.lines.reduce(
                            (sum, line) => sum + Number(line.targetWeightPct || 0),
                            0,
                          ),
                        )
                      : "",
                  },
                ],
              },
              {
                heading: "What you checked",
                fields: [
                  { label: "Look-through key", value: issuerKeyLabel(holdingsSlate.issuerKeyMode) },
                  {
                    label: "Overlap",
                    value: holdingsSlate.overlapAcknowledged
                      ? "Seen, and repaired or annotated"
                      : "",
                  },
                  {
                    label: "Holdings date",
                    value: holdingsSlate.staleDataAcknowledged
                      ? "Stated what the date does and does not support"
                      : "",
                  },
                ],
              },
              // Only shown once a draft exists, so the standing "not transmitted"
              // line cannot appear on its own and imply an order was written.
              ...(holdingsSlate.orderDraft.ticker
                ? [
                    {
                      heading: "Order draft",
                      fields: [
                        {
                          label: "Instrument",
                          value: `${holdingsSlate.orderDraft.ticker}${
                            holdingsSlate.orderDraft.classId
                              ? ` · class ${holdingsSlate.orderDraft.classId}`
                              : ""
                          }`,
                        },
                        {
                          label: "Direction",
                          value: sentenceCase(holdingsSlate.orderDraft.direction),
                        },
                        {
                          label: "Approximate amount",
                          value: holdingsSlate.orderDraft.approxAmountUsd
                            ? dollars(holdingsSlate.orderDraft.approxAmountUsd)
                            : "",
                        },
                        {
                          label: "Order type",
                          value: sentenceCase(holdingsSlate.orderDraft.orderType),
                        },
                        {
                          label: "Estimated friction",
                          value: holdingsSlate.orderDraft.estimatedFrictionPct
                            ? pointsPercent(holdingsSlate.orderDraft.estimatedFrictionPct)
                            : "",
                        },
                        {
                          label: "Transmitted",
                          value: "No. This product has no submission endpoint.",
                        },
                      ],
                    },
                  ]
                : []),
            ])
          : [],
      },
      {
        id: "policy",
        mission: "Mission 13",
        title: "Operating plan and investment policy statement",
        purpose:
          "How the portfolio is maintained once it exists, and what your own rules did when nine things went wrong.",
        lessonSlug: "if-pb-13-write-the-rules-and-defend-the-portfolio",
        lessonLabel: "Write the rules and defend the portfolio",
        willContain:
          "your review process, the rebalance trigger and the method it uses, your rules for new money, withdrawals, selling and a broken thesis, your nine flight-test answers, and any critical failure that blocks the transfer case",
        updatedAt: operatingPlan.updatedAt,
        groups: operatingPlan.updatedAt
          ? present([
              {
                fields: [
                  { label: "Review process", value: operatingPlan.reviewProcess },
                ],
              },
              {
                heading: "Rebalancing",
                fields: [
                  { label: "Trigger", value: rebalanceTriggerLabel(operatingPlan.rebalanceRule) },
                  {
                    label: "Method",
                    value: rebalanceMethodLabel(operatingPlan.rebalanceRule.method),
                  },
                ],
              },
              {
                heading: "Standing rules",
                fields: [
                  { label: "New money", value: operatingPlan.contributionRule },
                  { label: "Withdrawals", value: operatingPlan.withdrawalRule },
                  { label: "Selling and replacing", value: operatingPlan.sellReplaceRule },
                  { label: "A broken thesis", value: operatingPlan.thesisBreakRule },
                ],
              },
              {
                // Driven by the shared scenario list rather than by whatever
                // keys happen to be in the saved record, so a scenario the
                // learner never answered is visibly absent instead of silently
                // dropped from the compiled document.
                heading: "Flight test",
                fields: ALL_FLIGHT_SCENARIOS.map((scenario) => ({
                  label: scenario.title,
                  value: scenarioSummary(
                    operatingPlan.scenarioResponses[scenario.id] ?? {
                      whatChanged: "",
                      controllingPolicy: "",
                      response: "",
                      downstream: "",
                      wouldChangeIf: "",
                      policySilent: false,
                    },
                  ),
                })),
              },
              {
                heading: "Transfer case",
                fields: [
                  { label: "Case", value: operatingPlan.transferCaseId },
                  {
                    label: "Result",
                    value: operatingPlan.transferCaseId
                      ? operatingPlan.transferCasePassed
                        ? "Passed"
                        : "Not passed"
                      : "",
                  },
                  {
                    label: "Critical failures",
                    value: operatingPlan.criticalFailures.map(sentenceCase),
                  },
                ],
              },
            ])
          : [],
      },
    ],
    [
      activeMode,
      activeCase,
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
    ],
  );

  // A record that wants attention opens itself. Hiding a review-required
  // artifact behind a click is the one case where the compression costs more
  // than it saves.
  const isOpen = (section: Section) =>
    expanded[section.id] ?? Boolean(section.needsReview);
  const setAllExpanded = (open: boolean) =>
    setExpanded(Object.fromEntries(sections.map((s) => [s.id, open])));
  const allOpen = sections.length > 0 && sections.every(isOpen);

  /**
   * Print with everything open.
   *
   * A collapsed `details` prints collapsed, which would turn a printed dossier
   * into thirteen headings. `Copy as text` is unaffected either way — it reads
   * the section data, never the DOM — so this only covers the browser's own
   * print path.
   */
  useEffect(() => {
    const openAll = () =>
      setExpanded(Object.fromEntries(sections.map((s) => [s.id, true])));
    window.addEventListener("beforeprint", openAll);
    return () => window.removeEventListener("beforeprint", openAll);
  }, [sections]);

  const recorded = sections.filter((s) => Boolean(s.updatedAt));
  const lastUpdated = recorded
    .map((s) => s.updatedAt)
    .sort()
    .reverse()[0];

  const copyAsText = async () => {
    const lines: string[] = ["PORTFOLIO DOSSIER", ""];
    for (const s of recorded) {
      lines.push(`${s.mission.toUpperCase()} — ${s.title.toUpperCase()}`);
      for (const g of s.groups) {
        if (g.heading) lines.push(`  ${g.heading}`);
        for (const f of g.fields) {
          const v = Array.isArray(f.value) ? f.value.join("; ") : f.value;
          lines.push(`    ${f.label}: ${v}`);
        }
      }
      lines.push("");
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* clipboard unavailable; the page still shows everything */
    }
  };

  if (!mounted || !workbenchReady) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-white/5" />
        <div className="mt-10 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <header>
        <div className="ops-eyebrow flex items-center gap-3 text-xs">
          <span>Investment Foundations</span>
          <span className="h-px w-8 bg-white/30" />
          <span className="text-accent-amber">Portfolio Builder</span>
        </div>
        {/*
         * Sized down below `sm` only. At 390 this preamble ran to 476px — over
         * half a viewport before the first control, which is the one thing on
         * this page that broke a stated rule rather than merely reading long.
         * The words are unchanged; only the type scale and rhythm are.
         */}
        <h1 className="ops-display mt-4 text-3xl leading-[1.05] sm:mt-5 sm:text-5xl">
          Your portfolio dossier
        </h1>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200 sm:mt-5 sm:text-lg sm:leading-8">
          Your saved lesson artifacts and selected Workbench case, in one place. Each
          mission adds a decision you can inspect, revise, and eventually defend.
        </p>

        {/*
         * Five wrapping pills came to 188px on a phone, four rows deep. The
         * padding and type shrink below `sm`, and two labels drop the words a
         * narrow screen can infer: the mode pill loses "Showing", the count loses
         * "artifacts". Nothing is abbreviated into something a reader has to
         * decode, and desktop reads exactly as it did.
         */}
        <div className="mt-5 flex flex-wrap items-center gap-2 sm:mt-7 sm:gap-3">
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-slate-300 sm:px-4 sm:py-2 sm:text-sm">
            <span className="hidden sm:inline">Showing </span>
            {modeLabel(activeMode)}
          </span>
          <span
            className={cn(
              "rounded-full border px-3 py-1.5 text-[13px] tabular-nums sm:px-4 sm:py-2 sm:text-sm",
              recorded.length === sections.length
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
            )}
          >
            {recorded.length} of {sections.length}
            <span className="hidden sm:inline"> artifacts</span> recorded
          </span>
          {lastUpdated && (
            <span className="text-[13px] text-slate-400 sm:text-[14px]">
              <span className="hidden sm:inline">Last u</span>
              <span className="sm:hidden">U</span>
              pdated {formatWhen(lastUpdated)}
            </span>
          )}
          {recorded.length > 0 && (
            <button
              type="button"
              onClick={copyAsText}
              className="min-h-11 rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-slate-300 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40 sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm"
            >
              {copied ? "Copied" : "Copy as text"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setAllExpanded(!allOpen)}
            className="min-h-11 rounded-full border border-white/15 px-3 py-1.5 text-[13px] text-slate-300 transition-colors hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40 sm:min-h-0 sm:px-4 sm:py-2 sm:text-sm"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
      </header>

      {recorded.length === 0 && (
        <div className="ops-definition-card mt-10 p-6">
          {/* The empty state's title, not a label on something else. Heading
              semantics, caption styling — the look is unchanged. */}
          <h2 className="ops-caption text-[12px] text-accent-amber">Nothing recorded yet</h2>
          <p className="ops-body mt-3 text-[15px] text-slate-200">
            Your dossier fills in as you finish missions. Each one ends with a decision
            that is saved here, so the work accumulates instead of disappearing.
          </p>
          <Link
            href="/lessons/if-1-1-how-an-investor-builds-a-philosophy"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20"
          >
            Start with mission 1 →
          </Link>
        </div>
      )}

      <div className="mt-8 space-y-3 sm:mt-12 sm:space-y-6">
        {sections.map((s) => (
          <ArtifactCard
            key={s.id}
            section={s}
            open={isOpen(s)}
            onToggle={(next) => setExpanded((current) => ({ ...current, [s.id]: next }))}
          />
        ))}
      </div>

      <footer className="mt-14 border-t border-white/10 pt-6">
        <p className="text-[14px] leading-6 text-slate-400">
          This dossier is your own work, stored in this browser only. It is educational
          material, not investment advice.
        </p>
        <p className="mt-2 text-[13px] leading-6 text-slate-400">
          Workbench cases use a separate local record. This dossier can display and copy
          the selected case, but it does not clear or delete Workbench data.
        </p>
        <Link
          href="/courses/investment-foundations"
          className="ops-caption mt-4 inline-flex min-h-[44px] items-center text-[12px] text-slate-400 hover:text-accent-amber"
        >
          ← Back to Investment Foundations
        </Link>
      </footer>
    </div>
  );
}

function ArtifactCard({
  section,
  open,
  onToggle,
}: {
  section: Section;
  open: boolean;
  onToggle: (next: boolean) => void;
}) {
  const recorded = Boolean(section.updatedAt) && section.groups.length > 0;

  return (
    <section
      aria-labelledby={`artifact-${section.id}`}
      className={cn(
        "rounded-2xl border",
        recorded
          ? "border-white/12 bg-white/[0.03]"
          : "border-dashed border-white/12 bg-transparent",
      )}
    >
      {/*
       * The mission, the artifact's name and its status stay on the summary, so
       * a closed dossier still answers "what have I decided, and where is it
       * unfinished?" without opening anything. The purpose line and the record
       * move inside: they are what you came to read once you have chosen a row.
       */}
      <details
        open={open}
        onToggle={(event) => onToggle((event.currentTarget as HTMLDetailsElement).open)}
        className="group"
      >
      {/*
       * No `flex-wrap`. On a phone the status group used to drop onto its own
       * line, which cost a flat 40px on every row it happened to: rows measured
       * 94px unwrapped and 134px wrapped, 162px where the title also ran to two
       * lines. Letting the title column shrink instead keeps the pill on the
       * right and wraps only the text, which is the part that can afford it.
       *
       * The Show/Hide words go with it below `sm` and a chevron carries the
       * affordance. Nothing is lost to a screen reader either way — `summary`
       * is a native disclosure button and announces its own expanded state.
       */}
        <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-3 p-4 sm:p-7">
          <div className="min-w-0">
            <div className="ops-caption text-[12px] text-accent-amber">{section.mission}</div>
            <h2
              id={`artifact-${section.id}`}
              className={cn(
                "ops-section-title mt-1.5 text-lg sm:mt-2 sm:text-2xl",
                !recorded && "text-slate-400",
              )}
            >
              {section.title}
            </h2>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <span
              className={cn(
                "ops-caption rounded-full border px-2.5 py-1 text-[12px] sm:px-3",
                section.needsReview
                  ? "border-accent-amber/40 bg-accent-amber/10 text-accent-amber"
                  : recorded
                  ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                  // The dossier is a dark page: slate-500 measured 4.23:1 here,
                  // and this pill is the artifact's status, not decoration.
                  : "border-white/15 text-slate-400",
              )}
            >
              {recorded ? section.statusLabel ?? "Recorded" : "Not yet"}
            </span>
            <span className="hidden text-[13px] text-slate-400 group-open:hidden sm:inline">
              Show
            </span>
            <span className="hidden text-[13px] text-slate-400 sm:group-open:inline">Hide</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-90 motion-reduce:transition-none sm:hidden"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </summary>

        <div className="px-4 pb-4 sm:px-7 sm:pb-7">
          <p className="ops-body text-[14px] text-slate-400">{section.purpose}</p>

      {recorded ? (
        <>
          <div className="mt-6 space-y-6">
            {section.groups.map((g, gi) => (
              <div key={g.heading ?? `g${gi}`}>
                {g.heading && (
                  <div className="ops-caption mb-3 text-[12px] text-slate-500">
                    {g.heading}
                  </div>
                )}
                <dl className="space-y-3">
                  {g.fields.map((f) => (
                    <Row key={f.label} label={f.label} value={f.value} />
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <span className="text-[12px] text-slate-500">
              Saved {formatWhen(section.updatedAt)}
            </span>
            <Link
              href={`/lessons/${section.lessonSlug}`}
              className="text-[14px] text-slate-300 transition-colors hover:text-accent-amber"
            >
              Revise in {section.lessonLabel} →
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="ops-body text-[14px] leading-6 text-slate-400">
            Will contain {section.willContain}.
          </p>
          <Link
            href={`/lessons/${section.lessonSlug}`}
            className="mt-4 inline-block text-[14px] font-semibold text-accent-amber transition-colors hover:text-accent-amber/80"
          >
            Go to {section.lessonLabel} →
          </Link>
        </div>
      )}
        </div>
      </details>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | string[] }): ReactNode {
  return (
    <div className="grid gap-1 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[14px] leading-6 text-slate-500">{label}</dt>
      <dd className="ops-body text-[15px] leading-7 text-slate-100">
        {Array.isArray(value) ? (
          <ul className="space-y-1.5">
            {value.map((v) => (
              <li key={v} className="flex gap-2.5">
                <span className="mt-[0.55rem] h-1 w-1 flex-shrink-0 rounded-full bg-accent-amber" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
