import { describe, expect, it } from "vitest";

import {
  createEmptyAllocation,
  createEmptyMandate,
} from "@/lib/portfolio-workbench";
import {
  allocationFromWorkbench,
  hasCurrentReadinessEvidence,
  mandateFromReadiness,
  readinessFromWorkbench,
} from "./Mission05AllocationJourney";
import type { AllocationDraft } from "./AllocationStudio";
import {
  EMPTY_READINESS_RECORD,
  MINA_PRACTICE_READINESS,
  readinessPlanningAmountsAreUsable,
  type ReadinessRecord,
} from "./ReadinessRunway";

describe("Mission 5 readiness adapters", () => {
  it("round-trips every detailed personal readiness answer without mutation", () => {
    const record: ReadinessRecord = {
      ...EMPTY_READINESS_RECORD,
      profileOwner: "learner",
      goal: "Protect a home deposit while building long-term flexibility",
      horizon: "two-to-five-years",
      contributionPlan: "$300 monthly",
      plannedWithdrawal: "$12,000 in three years",
      approximatePortfolioValue: "50000",
      nearTermNeed: "7000",
      reserveTarget: "$6,000 learner target",
      reserveStatus: "building",
      highInterestDebt: "paying-down",
      employerMatch: "not-available",
      capacityForLoss: "limited",
      willingnessForLoss: "untested",
      jurisdiction: "outside-us",
      accountAuthority: "custodian-required",
      earnedIncomeStatus: "verify",
      lifeChangeDiagnosis: "capacity-and-liquidity",
      lifeChangeAction: "protect-cash-need",
      route: "personal-constrained",
    };

    const roundTrip = readinessFromWorkbench(
      mandateFromReadiness(record, "personal"),
      "personal",
    );

    expect(roundTrip).toEqual(record);
  });

  it("round-trips the practice case independently", () => {
    const record: ReadinessRecord = {
      ...MINA_PRACTICE_READINESS,
      lifeChangeDiagnosis: "capacity-and-liquidity",
      lifeChangeAction: "protect-cash-need",
    };

    expect(
      readinessFromWorkbench(mandateFromReadiness(record, "practice"), "practice"),
    ).toEqual(record);
  });

  it("does not credit migrated evidence with the fresh life-change check", () => {
    const legacy = {
      ...createEmptyMandate(),
      goal: "A migrated goal",
      horizon: "more than five years",
      targetDate: "more-than-five-years",
      capacityForLoss: "moderate" as const,
      willingnessForLoss: "moderate" as const,
      route: "personal-constrained" as const,
    };

    const readiness = readinessFromWorkbench(legacy, "personal");

    expect(readiness.lifeChangeDiagnosis).toBe("");
    expect(readiness.lifeChangeAction).toBe("");
    expect(hasCurrentReadinessEvidence(legacy, "personal")).toBe(false);
  });

  it("restores stage credit only from the exact mode-owned readiness bridge", () => {
    const practice = {
      ...MINA_PRACTICE_READINESS,
      lifeChangeDiagnosis: "capacity-and-liquidity" as const,
      lifeChangeAction: "protect-cash-need" as const,
    };
    const mandate = mandateFromReadiness(practice, "practice");

    expect(hasCurrentReadinessEvidence(mandate, "practice")).toBe(true);
    expect(hasCurrentReadinessEvidence(mandate, "personal")).toBe(false);
  });

  it.each([
    {
      name: "a zero planning amount",
      approximatePortfolioValue: "0",
      nearTermNeed: "0",
    },
    {
      name: "a near-term cash role above the planning amount",
      approximatePortfolioValue: "40000",
      nearTermNeed: "40001",
    },
  ])("rejects $name before readiness can earn stage credit", ({
    approximatePortfolioValue,
    nearTermNeed,
  }) => {
    const readiness: ReadinessRecord = {
      ...MINA_PRACTICE_READINESS,
      approximatePortfolioValue,
      nearTermNeed,
      lifeChangeDiagnosis: "capacity-and-liquidity",
      lifeChangeAction: "protect-cash-need",
    };
    const mandate = mandateFromReadiness(readiness, "practice");

    expect(readinessPlanningAmountsAreUsable(readiness)).toBe(false);
    expect(hasCurrentReadinessEvidence(mandate, "practice")).toBe(false);
  });

  it("uses the current mandate amount and cash need instead of stale review-required allocation values", () => {
    const readiness: ReadinessRecord = {
      ...MINA_PRACTICE_READINESS,
      approximatePortfolioValue: "90000",
      nearTermNeed: "12345",
      lifeChangeDiagnosis: "capacity-and-liquidity",
      lifeChangeAction: "protect-cash-need",
    };
    const mandate = mandateFromReadiness(readiness, "practice");
    const fallback = createFallbackAllocationDraft();
    const stored = {
      ...createEmptyAllocationForTest(),
      referencePortfolioAmount: {
        value: 67890,
        owner: "ops" as const,
        asOf: "2026-08-12T00:00:00.000Z",
        note: "Fictional practice amount",
      },
      nearTermNeedBps: {
        value: 1819,
        owner: "ops" as const,
        asOf: "2026-08-12T00:00:00.000Z",
        note: "Rounded policy basis points",
      },
      sleeves: fallback.sleeves.map((sleeve) => ({
        id: sleeve.id,
        label: sleeve.id,
        role: sleeve.id === "ready" ? "liquidity" as const : sleeve.id === "steady" ? "stability" as const : "growth" as const,
        owner: "learner" as const,
        minBps: sleeve.minBps,
        targetBps: sleeve.targetBps,
        maxBps: sleeve.maxBps,
      })),
    };

    const restored = allocationFromWorkbench(stored, fallback, mandate);

    expect(restored.portfolioAmount).toBe(90000);
    expect(restored.nearTermNeed).toBe(12345);
  });

  it("hydrates current mandate reference facts before any allocation sleeves exist", () => {
    const readiness: ReadinessRecord = {
      ...MINA_PRACTICE_READINESS,
      approximatePortfolioValue: "73500",
      nearTermNeed: "9876",
      lifeChangeDiagnosis: "capacity-and-liquidity",
      lifeChangeAction: "protect-cash-need",
    };
    const mandate = mandateFromReadiness(readiness, "practice");

    const restored = allocationFromWorkbench(
      createEmptyAllocation(),
      createFallbackAllocationDraft(),
      mandate,
    );

    expect(restored.portfolioAmount).toBe(73500);
    expect(restored.nearTermNeed).toBe(9876);
    expect(restored.sleeves).toEqual(createFallbackAllocationDraft().sleeves);
  });
});

function createFallbackAllocationDraft(): AllocationDraft {
  return {
    portfolioAmount: 67890,
    nearTermNeed: 0,
    sleeves: [
      { id: "ready", targetBps: 2000, minBps: 1500, maxBps: 3000, assumedLossBps: 0 },
      { id: "steady", targetBps: 3000, minBps: 2500, maxBps: 4000, assumedLossBps: 1000 },
      { id: "grow", targetBps: 5000, minBps: 3000, maxBps: 6000, assumedLossBps: 3500 },
    ],
    lossBudgetBps: 2500,
    candidateMaxContributionBps: null,
    candidateAssumedLossBps: null,
    mandateRationale: "The policy protects the stated cash need before assigning growth risk.",
    acknowledged: true,
  };
}

function createEmptyAllocationForTest() {
  const emptyLearnerNumber = {
    value: null,
    owner: "learner" as const,
    asOf: "",
    note: "",
  };
  return {
    referencePortfolioAmount: { ...emptyLearnerNumber },
    nearTermNeedBps: { ...emptyLearnerNumber },
    sleeves: [],
    stressScenarios: [],
    selectedStressScenarioId: "",
    portfolioStressLossBudgetBps: { ...emptyLearnerNumber },
    maximumPortfolioLossContributionBps: { ...emptyLearnerNumber },
    candidatePositionStressLossBps: { ...emptyLearnerNumber },
    mandateRationale: "",
    goalImpactAcknowledged: false,
    preflight: { status: "not-started" as const, passedAt: "" },
    transfer: { caseId: "", status: "not-started" as const, passedAt: "" },
    savedAt: "",
  };
}
