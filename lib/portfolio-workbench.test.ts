import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePortfolioWorkbench } from "@/lib/use-portfolio-workbench";
import {
  LEGACY_ARTIFACT_STORAGE_KEYS,
  PORTFOLIO_WORKBENCH_EVENT,
  PORTFOLIO_WORKBENCH_STORAGE_KEY,
  WorkbenchValidationError,
  createEmptyAllocation,
  createEmptyMandate,
  createEmptyPortfolioWorkbench,
  deriveWorkbenchLifecycle,
  loadPortfolioWorkbench,
  persistPortfolioWorkbench,
  saveAllocationRecord,
  saveCheckpointStatus,
  saveMandateRecord,
  switchWorkbenchMode,
  type AllocationRecord,
  type LegacyArtifactId,
  type MandateRecord,
  validateMandateForCoherence,
  type WorkbenchStorage,
} from "@/lib/portfolio-workbench";

const NOW = "2026-08-12T12:00:00.000Z";
const LATER = "2026-08-12T13:00:00.000Z";

class MemoryStorage implements WorkbenchStorage {
  readonly values = new Map<string, string>();
  readonly writes: Array<{ key: string; value: string }> = [];

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
    this.writes.push({ key, value });
  }
}

function legacyValue(id: LegacyArtifactId): Record<string, unknown> {
  switch (id) {
    case "philosophy":
      return { marketBelief: "Prices can diverge from value.", candidateFamilies: ["quality"], updatedAt: NOW };
    case "bond-risk":
      return { paymentPromise: "Coupon and principal", updatedAt: NOW };
    case "equity-risk-policy":
      return { riskDefinition: "Permanent impairment", updatedAt: NOW };
    case "statement-brief":
      return { statementMap: "Income to cash flow", updatedAt: NOW };
    case "valuation-range":
      return { claim: "Value is a range", evidenceTriggers: ["margin"], updatedAt: NOW };
    case "friction-budget":
      return { estimatedAnnualDrag: 0.4, hurdleRule: "Clear the drag", updatedAt: NOW };
    case "evidence-checklist":
      return { benchmark: "Policy benchmark", updatedAt: NOW };
  }
}

function coherentMandate(): MandateRecord {
  return {
    ...createEmptyMandate(),
    goal: "Fund a future education expense",
    horizon: "8 years",
    nearTermCashNeeds: "15000",
    capacityForLoss: "moderate",
    willingnessForLoss: "moderate",
    route: "personal-available",
    acknowledgedAt: NOW,
    readinessDetails: {
      ...createEmptyMandate().readinessDetails,
      profileOwner: "learner",
      approximatePortfolioValue: "100000",
    },
  };
}

function coherentAllocation(): AllocationRecord {
  return {
    ...createEmptyAllocation(),
    referencePortfolioAmount: { value: 100_000, owner: "learner", asOf: NOW, note: "Mandate amount" },
    nearTermNeedBps: { value: 1_500, owner: "learner", asOf: NOW, note: "Mandate need" },
    sleeves: [
      { id: "liquidity", label: "Liquidity", role: "liquidity", owner: "learner", minBps: 1_500, targetBps: 2_000, maxBps: 3_000 },
      { id: "growth", label: "Growth", role: "growth", owner: "learner", minBps: 7_000, targetBps: 8_000, maxBps: 8_500 },
    ],
    stressScenarios: [{
      id: "drawdown",
      label: "Drawdown",
      losses: [
        { sleeveId: "liquidity", lossBps: { value: 0, owner: "ops", asOf: NOW, note: "Illustrative" } },
        { sleeveId: "growth", lossBps: { value: 5_000, owner: "learner", asOf: NOW, note: "Learner assumption" } },
      ],
    }],
    selectedStressScenarioId: "drawdown",
    portfolioStressLossBudgetBps: { value: 4_000, owner: "learner", asOf: NOW, note: "Goal-based stress budget" },
    maximumPortfolioLossContributionBps: { value: 200, owner: "learner", asOf: NOW, note: "Policy ceiling" },
    candidatePositionStressLossBps: { value: 5_000, owner: "learner", asOf: NOW, note: "Candidate stress" },
    mandateRationale: "The dated need stays liquid while the remaining risk supports the longer goal.",
    goalImpactAcknowledged: true,
    preflight: { status: "passed", passedAt: NOW },
    transfer: { caseId: "transfer-a", status: "passed", passedAt: NOW },
    savedAt: NOW,
  };
}

describe("Portfolio Workbench schema", () => {
  it("creates independent personal and practice cases with a stable v1 envelope", () => {
    const workbench = createEmptyPortfolioWorkbench(NOW);
    expect(workbench.schemaVersion).toBe(1);
    expect(workbench.activeMode).toBe("personal");
    expect(workbench.cases.personal).not.toBe(workbench.cases.practice);
    workbench.cases.personal.mandate.goal = "Personal goal";
    expect(workbench.cases.practice.mandate.goal).toBe("");
    expect(deriveWorkbenchLifecycle(workbench.cases.personal)).toBe("draft");
  });

  it("is safe without browser storage during SSR", () => {
    const result = loadPortfolioWorkbench(null, NOW);
    expect(result.kind).toBe("ok");
    expect(result.workbench.createdAt).toBe(NOW);
  });

  it("round-trips every exact readiness detail without changing learner answers", () => {
    const storage = new MemoryStorage();
    const workbench = createEmptyPortfolioWorkbench(NOW);
    workbench.cases.personal.mandate.readinessDetails = {
      profileOwner: "learner",
      approximatePortfolioValue: "12500",
      reserveStatus: "building",
      highInterestDebt: "paying-down",
      employerMatch: "available-review",
      capacityForLoss: "limited",
      willingnessForLoss: "untested",
      jurisdiction: "outside-us",
      accountAuthority: "custodian-required",
      earnedIncomeStatus: "verify",
      lifeChangeDiagnosis: "capacity-and-liquidity",
      lifeChangeAction: "protect-cash-need",
    };
    workbench.cases.practice.mandate.readinessDetails = {
      profileOwner: "fictional-case",
      approximatePortfolioValue: "40000",
      reserveStatus: "target-met",
      highInterestDebt: "none",
      employerMatch: "not-applicable",
      capacityForLoss: "moderate",
      willingnessForLoss: "written-plan",
      jurisdiction: "us",
      accountAuthority: "confirmed",
      earnedIncomeStatus: "not-relevant",
      lifeChangeDiagnosis: "nothing-changed",
      lifeChangeAction: "move-deadline",
    };
    expect(persistPortfolioWorkbench(storage, workbench).ok).toBe(true);

    const loaded = loadPortfolioWorkbench(storage, LATER);
    expect(loaded.kind).toBe("ok");
    expect(loaded.workbench.cases.personal.mandate.readinessDetails).toEqual(
      workbench.cases.personal.mandate.readinessDetails,
    );
    expect(loaded.workbench.cases.practice.mandate.readinessDetails).toEqual(
      workbench.cases.practice.mandate.readinessDetails,
    );
  });

  it("loads an earlier schema-v1 record without readiness details or mandate rationale compatibly", () => {
    const storage = new MemoryStorage();
    const workbench = createEmptyPortfolioWorkbench(NOW) as unknown as Record<string, unknown>;
    const cases = workbench.cases as Record<string, { mandate: Record<string, unknown>; allocation: Record<string, unknown> }>;
    for (const mode of ["personal", "practice"] as const) {
      delete cases[mode].mandate.readinessDetails;
      delete cases[mode].allocation.mandateRationale;
    }
    storage.setItem(PORTFOLIO_WORKBENCH_STORAGE_KEY, JSON.stringify(workbench));

    const loaded = loadPortfolioWorkbench(storage, LATER);
    expect(loaded.kind).toBe("ok");
    expect(loaded.issues).toEqual([]);
    expect(loaded.workbench.cases.personal.mandate.readinessDetails.profileOwner).toBe("unassessed");
    expect(loaded.workbench.cases.practice.allocation.mandateRationale).toBe("");
  });

  it.each(Object.keys(LEGACY_ARTIFACT_STORAGE_KEYS) as LegacyArtifactId[])(
    "migrates %s alone as neutral, unconfirmed evidence",
    (id) => {
      const storage = new MemoryStorage();
      const key = LEGACY_ARTIFACT_STORAGE_KEYS[id];
      const raw = JSON.stringify(legacyValue(id));
      storage.values.set(key, raw);

      const result = loadPortfolioWorkbench(storage, NOW);

      expect(result.kind).toBe("ok");
      expect(result.migrated).toBe(true);
      expect(result.workbench.legacyEvidence[id]).toMatchObject({
        status: "migrated-unconfirmed",
        sourceKey: key,
        sourceUpdatedAt: NOW,
        timestampKind: "source",
      });
      expect(result.workbench.cases.personal.checkpoints[id === "philosophy" ? "beliefs" : id === "equity-risk-policy" ? "required-return" : id === "statement-brief" ? "evidence" : id === "valuation-range" ? "valuation" : id === "friction-budget" ? "friction" : id === "evidence-checklist" ? "evidence-test" : "bond-risk"].status).toBe("empty");
      expect(storage.getItem(key)).toBe(raw);
    },
  );

  it("migrates every legacy artifact together and remains idempotent", () => {
    const storage = new MemoryStorage();
    for (const id of Object.keys(LEGACY_ARTIFACT_STORAGE_KEYS) as LegacyArtifactId[]) {
      storage.values.set(LEGACY_ARTIFACT_STORAGE_KEYS[id], JSON.stringify(legacyValue(id)));
    }
    const first = loadPortfolioWorkbench(storage, NOW);
    const firstRaw = storage.getItem(PORTFOLIO_WORKBENCH_STORAGE_KEY);
    const second = loadPortfolioWorkbench(storage, LATER);

    expect(Object.keys(first.workbench.legacyEvidence)).toHaveLength(7);
    expect(second.kind).toBe("ok");
    expect(second.migrated).toBe(false);
    expect(storage.getItem(PORTFOLIO_WORKBENCH_STORAGE_KEY)).toBe(firstRaw);
    expect(second.workbench.updatedAt).toBe(NOW);
  });

  it("synthesizes missing legacy timestamps without changing the source", () => {
    const storage = new MemoryStorage();
    const key = LEGACY_ARTIFACT_STORAGE_KEYS["bond-risk"];
    const raw = JSON.stringify({ paymentPromise: "Coupon and principal" });
    storage.values.set(key, raw);
    const result = loadPortfolioWorkbench(storage, NOW);
    expect(result.workbench.legacyEvidence["bond-risk"]).toMatchObject({
      sourceUpdatedAt: NOW,
      timestampKind: "synthesized",
    });
    expect(storage.getItem(key)).toBe(raw);
  });

  it("skips corrupt legacy JSON while keeping a writable empty Workbench", () => {
    const storage = new MemoryStorage();
    const key = LEGACY_ARTIFACT_STORAGE_KEYS.philosophy;
    storage.values.set(key, "{bad");
    const result = loadPortfolioWorkbench(storage, NOW);
    expect(result.kind).toBe("ok");
    expect(result.issues.some((issue) => issue.code === "legacy-invalid-json")).toBe(true);
    expect(result.workbench.legacyEvidence.philosophy).toBeUndefined();
    expect(storage.getItem(key)).toBe("{bad");
  });

  it("preserves a future-version record byte-for-byte", () => {
    const storage = new MemoryStorage();
    const raw = JSON.stringify({ schemaVersion: 99, future: { field: "keep me" } });
    storage.values.set(PORTFOLIO_WORKBENCH_STORAGE_KEY, raw);
    const result = loadPortfolioWorkbench(storage, NOW);
    expect(result.kind).toBe("future-version");
    expect(storage.getItem(PORTFOLIO_WORKBENCH_STORAGE_KEY)).toBe(raw);
    expect(storage.writes).toEqual([]);
  });

  it("preserves corrupt Workbench JSON byte-for-byte", () => {
    const storage = new MemoryStorage();
    storage.values.set(PORTFOLIO_WORKBENCH_STORAGE_KEY, "{broken");
    const result = loadPortfolioWorkbench(storage, NOW);
    expect(result.kind).toBe("corrupt");
    expect(storage.getItem(PORTFOLIO_WORKBENCH_STORAGE_KEY)).toBe("{broken");
    expect(storage.writes).toEqual([]);
  });

  it("recovers valid fields from a partial v1 record without overwriting it", () => {
    const storage = new MemoryStorage();
    const raw = JSON.stringify({
      schemaVersion: 1,
      activeMode: "personal",
      cases: { personal: { mode: "personal", mandate: { goal: "Keep this goal" } } },
      createdAt: NOW,
      updatedAt: NOW,
    });
    storage.values.set(PORTFOLIO_WORKBENCH_STORAGE_KEY, raw);
    const result = loadPortfolioWorkbench(storage, NOW);
    expect(result.kind).toBe("recovered-with-issues");
    expect(result.workbench.cases.personal.mandate.goal).toBe("Keep this goal");
    expect(storage.getItem(PORTFOLIO_WORKBENCH_STORAGE_KEY)).toBe(raw);
    expect(storage.writes).toEqual([]);
  });

  it("recovers invalid nested allocation fields with precise issues and safe values", () => {
    const storage = new MemoryStorage();
    const workbench = createEmptyPortfolioWorkbench(NOW);
    workbench.cases.personal.allocation = coherentAllocation();
    const allocation = workbench.cases.personal.allocation as unknown as {
      sleeves: Array<Record<string, unknown>>;
      stressScenarios: Array<Record<string, unknown>>;
      referencePortfolioAmount: Record<string, unknown>;
      portfolioStressLossBudgetBps: Record<string, unknown>;
    };

    allocation.sleeves[0].owner = "regulator";
    allocation.sleeves[0].minBps = -1;
    allocation.sleeves[0].targetBps = 2_000.5;
    allocation.sleeves[0].maxBps = 10_001;
    const losses = allocation.stressScenarios[0].losses as Array<Record<string, unknown>>;
    const lossBps = losses[0].lossBps as Record<string, unknown>;
    lossBps.value = -50;
    lossBps.owner = "regulator";
    lossBps.asOf = 42;
    lossBps.note = [];
    allocation.stressScenarios.push({
      id: "malformed-losses",
      label: "Malformed losses",
      losses: {},
    });
    allocation.referencePortfolioAmount.value = -100;
    allocation.portfolioStressLossBudgetBps.value = 10_001;
    const raw = JSON.stringify(workbench);
    storage.values.set(PORTFOLIO_WORKBENCH_STORAGE_KEY, raw);

    const result = loadPortfolioWorkbench(storage, LATER);

    expect(result.kind).toBe("recovered-with-issues");
    expect(result.issues).toHaveLength(11);
    expect(result.issues).toEqual(expect.arrayContaining([
      {
        code: "invalid-field",
        path: "cases.personal.allocation.sleeves[0].owner",
        message: "Value was outside the supported set; recovered safely.",
      },
      ...["minBps", "targetBps", "maxBps"].map((field) => ({
        code: "invalid-field" as const,
        path: `cases.personal.allocation.sleeves[0].${field}`,
        message: "Expected whole basis points from 0 to 10000; recovered as 0.",
      })),
      {
        code: "invalid-field",
        path: "cases.personal.allocation.stressScenarios[0].losses[0].lossBps.value",
        message: "Expected whole basis points from 0 to 10000 or null; recovered empty.",
      },
      {
        code: "invalid-field",
        path: "cases.personal.allocation.stressScenarios[0].losses[0].lossBps.owner",
        message: "Value was outside the supported set; recovered safely.",
      },
      {
        code: "invalid-field",
        path: "cases.personal.allocation.stressScenarios[0].losses[0].lossBps.asOf",
        message: "Expected a string; recovered with a safe default.",
      },
      {
        code: "invalid-field",
        path: "cases.personal.allocation.stressScenarios[0].losses[0].lossBps.note",
        message: "Expected a string; recovered with a safe default.",
      },
      {
        code: "invalid-field",
        path: "cases.personal.allocation.stressScenarios[1].losses",
        message: "Expected a loss array; recovered empty.",
      },
      {
        code: "invalid-field",
        path: "cases.personal.allocation.referencePortfolioAmount.value",
        message: "Expected a non-negative finite number or null; recovered empty.",
      },
      {
        code: "invalid-field",
        path: "cases.personal.allocation.portfolioStressLossBudgetBps.value",
        message: "Expected whole basis points from 0 to 10000 or null; recovered empty.",
      },
    ]));
    const recovered = result.workbench.cases.personal.allocation;
    expect(recovered.sleeves[0]).toMatchObject({
      owner: "learner",
      minBps: 0,
      targetBps: 0,
      maxBps: 0,
    });
    expect(recovered.stressScenarios[0].losses[0].lossBps).toEqual({
      value: null,
      owner: "learner",
      asOf: "",
      note: "",
    });
    expect(recovered.stressScenarios[1].losses).toEqual([]);
    expect(recovered.referencePortfolioAmount.value).toBeNull();
    expect(recovered.portfolioStressLossBudgetBps.value).toBeNull();
    expect(storage.getItem(PORTFOLIO_WORKBENCH_STORAGE_KEY)).toBe(raw);
    expect(storage.writes).toEqual([]);
  });

  it("reports quota-style write failures", () => {
    const storage: WorkbenchStorage = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("Quota exceeded", "QuotaExceededError");
      },
    };
    const result = persistPortfolioWorkbench(storage, createEmptyPortfolioWorkbench(NOW));
    expect(result).toMatchObject({ ok: false, issue: { code: "storage-write-failed" } });
  });
});

describe("Workbench modes, gates, and dependencies", () => {
  it("switches modes without copying personal values into practice", () => {
    const personal = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "draft",
      "goal",
      NOW,
    );
    const switched = switchWorkbenchMode(personal, "practice", LATER);
    expect(switched.activeMode).toBe("practice");
    expect(switched.cases.personal.mandate.goal).toContain("education");
    expect(switched.cases.practice.mandate.goal).toBe("");
  });

  it.each(["personal-available", "personal-constrained"] as const)(
    "rejects the %s readiness route when a practice mandate becomes coherent",
    (route) => {
      expect(() =>
        saveMandateRecord(
          createEmptyPortfolioWorkbench(NOW),
          "practice",
          { ...coherentMandate(), route },
          "coherent",
          "readiness route",
          NOW,
        ),
      ).toThrow(WorkbenchValidationError);
    },
  );

  it("rejects the practice-only readiness route when a personal mandate becomes coherent", () => {
    expect(() =>
      saveMandateRecord(
        createEmptyPortfolioWorkbench(NOW),
        "personal",
        { ...coherentMandate(), route: "practice-only" },
        "coherent",
        "readiness route",
        NOW,
      ),
    ).toThrow(WorkbenchValidationError);
  });

  it("accepts a complete practice-only mandate in practice mode without touching personal state", () => {
    const workbench = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "practice",
      { ...coherentMandate(), route: "practice-only" },
      "coherent",
      "readiness route",
      NOW,
    );

    expect(workbench.cases.practice.checkpoints.mandate.status).toBe("coherent");
    expect(workbench.cases.practice.mandate.route).toBe("practice-only");
    expect(workbench.cases.personal.checkpoints.mandate.status).toBe("empty");
    expect(workbench.cases.personal.mandate.route).toBe("unassessed");
  });

  it.each([
    {
      name: "a zero planning amount",
      patch: {
        approximatePortfolioValue: "0",
        nearTermCashNeeds: "0",
      },
      issue: "Define a positive planning portfolio amount or use the complete practice case.",
    },
    {
      name: "a near-term cash role above the planning amount",
      patch: {
        approximatePortfolioValue: "100000",
        nearTermCashNeeds: "100001",
      },
      issue: "The near-term cash role cannot exceed the planning portfolio amount; use the practice case while the personal funding gap is unresolved.",
    },
  ])("rejects $name at the mandate coherence boundary", ({ patch, issue }) => {
    const mandate = coherentMandate();
    mandate.readinessDetails.approximatePortfolioValue =
      patch.approximatePortfolioValue;
    mandate.nearTermCashNeeds = patch.nearTermCashNeeds;

    expect(validateMandateForCoherence(mandate, "personal")).toContain(issue);
    expect(() =>
      saveMandateRecord(
        createEmptyPortfolioWorkbench(NOW),
        "personal",
        mandate,
        "coherent",
        "readiness route",
        NOW,
      ),
    ).toThrow(WorkbenchValidationError);
  });

  it("cannot mark allocation coherent before the mandate checkpoint", () => {
    expect(() =>
      saveAllocationRecord(
        createEmptyPortfolioWorkbench(NOW),
        "personal",
        coherentAllocation(),
        "coherent",
        "weights",
        NOW,
      ),
    ).toThrow(WorkbenchValidationError);
  });

  it("advances through mandate and allocation only after domain gates pass", () => {
    const mandate = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "mandate",
      NOW,
    );
    const allocation = saveAllocationRecord(
      mandate,
      "personal",
      coherentAllocation(),
      "coherent",
      "weights",
      LATER,
    );
    expect(allocation.cases.personal.checkpoints.allocation.status).toBe("coherent");
    expect(deriveWorkbenchLifecycle(allocation.cases.personal)).toBe("policy-coherent");
  });

  it("rejects a selected scenario whose total stress loss exceeds the learner budget", () => {
    const mandate = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "mandate",
      NOW,
    );
    const overBudget = {
      ...coherentAllocation(),
      portfolioStressLossBudgetBps: {
        value: 3_999,
        owner: "learner" as const,
        asOf: NOW,
        note: "Goal-based stress budget",
      },
    };
    expect(() =>
      saveAllocationRecord(mandate, "personal", overBudget, "coherent", "stress budget", LATER),
    ).toThrow(WorkbenchValidationError);
  });

  it("rejects an allocation that understates the saved mandate cash need", () => {
    const mandate = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "mandate",
      NOW,
    );
    const understated = coherentAllocation();
    understated.nearTermNeedBps.value = 0;
    understated.sleeves = [
      { ...understated.sleeves[0], minBps: 0, targetBps: 0 },
      { ...understated.sleeves[1], minBps: 9_000, targetBps: 10_000, maxBps: 10_000 },
    ];

    expect(() =>
      saveAllocationRecord(mandate, "personal", understated, "coherent", "cash need", LATER),
    ).toThrow(WorkbenchValidationError);
  });

  it("returns a validation error instead of throwing finance math for fractional need basis points", () => {
    const mandate = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "mandate",
      NOW,
    );
    const fractional = coherentAllocation();
    fractional.nearTermNeedBps.value = 1_500.5;

    expect(() =>
      saveAllocationRecord(mandate, "personal", fractional, "coherent", "cash need", LATER),
    ).toThrow(WorkbenchValidationError);
  });

  it("allows a coherent allocation to omit the optional candidate ceiling explicitly", () => {
    const mandate = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "mandate",
      NOW,
    );
    const allocation = coherentAllocation();
    allocation.maximumPortfolioLossContributionBps.value = null;
    allocation.candidatePositionStressLossBps.value = null;

    const saved = saveAllocationRecord(
      mandate,
      "personal",
      allocation,
      "coherent",
      "candidate ceiling omitted",
      LATER,
    );

    expect(saved.cases.personal.checkpoints.allocation.status).toBe("coherent");
  });

  it.each([
    [null, 5_000],
    [200, null],
  ] as const)(
    "rejects an incomplete candidate ceiling with contribution %s and loss %s",
    (maximumContribution, assumedLoss) => {
      const mandate = saveMandateRecord(
        createEmptyPortfolioWorkbench(NOW),
        "personal",
        coherentMandate(),
        "coherent",
        "mandate",
        NOW,
      );
      const allocation = coherentAllocation();
      allocation.maximumPortfolioLossContributionBps.value = maximumContribution;
      allocation.candidatePositionStressLossBps.value = assumedLoss;

      expect(() =>
        saveAllocationRecord(
          mandate,
          "personal",
          allocation,
          "coherent",
          "candidate ceiling",
          LATER,
        ),
      ).toThrow(WorkbenchValidationError);
    },
  );

  it("rejects complete candidate-ceiling inputs that cannot produce valid math", () => {
    const mandate = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "mandate",
      NOW,
    );
    const allocation = coherentAllocation();
    allocation.candidatePositionStressLossBps.value = 0;

    expect(() =>
      saveAllocationRecord(
        mandate,
        "personal",
        allocation,
        "coherent",
        "candidate ceiling",
        LATER,
      ),
    ).toThrow(WorkbenchValidationError);
  });

  it("rejects a candidate loss contribution above the total portfolio stress budget", () => {
    const mandate = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "mandate",
      NOW,
    );
    const allocation = coherentAllocation();
    allocation.maximumPortfolioLossContributionBps.value = 4_001;

    expect(() =>
      saveAllocationRecord(
        mandate,
        "personal",
        allocation,
        "coherent",
        "candidate ceiling",
        LATER,
      ),
    ).toThrow(WorkbenchValidationError);
  });

  it("marks transitive downstream work Review required and leaves siblings untouched", () => {
    let workbench = createEmptyPortfolioWorkbench(NOW);
    workbench = saveCheckpointStatus(workbench, "personal", "beliefs", "saved-unverified", "belief", "Belief saved", NOW);
    workbench = saveCheckpointStatus(workbench, "personal", "architecture", "saved-unverified", "vehicle", "Architecture saved", NOW);
    workbench = saveCheckpointStatus(workbench, "personal", "timing", "saved-unverified", "cadence", "Timing saved", NOW);
    workbench = saveCheckpointStatus(workbench, "personal", "holdings", "saved-unverified", "product", "Holding saved", NOW);
    workbench = saveCheckpointStatus(workbench, "personal", "policy", "saved-unverified", "rule", "Policy saved", NOW);

    const next = saveAllocationRecord(
      workbench,
      "personal",
      { ...createEmptyAllocation(), savedAt: LATER },
      "draft",
      "target ranges",
      LATER,
    );

    expect(next.cases.personal.checkpoints.architecture.status).toBe("review-required");
    expect(next.cases.personal.checkpoints.timing.status).toBe("review-required");
    expect(next.cases.personal.checkpoints.holdings.status).toBe("review-required");
    expect(next.cases.personal.checkpoints.policy.status).toBe("review-required");
    expect(next.cases.personal.checkpoints.beliefs.status).toBe("saved-unverified");
    expect(next.cases.practice.checkpoints.policy.status).toBe("empty");
    expect(next.dependencyHistory.at(-1)).toMatchObject({
      mode: "personal",
      sourceCheckpoint: "allocation",
      changedField: "target ranges",
      affectedCheckpoints: ["architecture", "timing", "holdings", "policy"],
    });
  });

  it("invalidates allocation and every downstream checkpoint after a semantic mandate change", () => {
    const changedAt = "2026-08-12T14:00:00.000Z";
    let workbench = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "mandate",
      NOW,
    );
    workbench = saveAllocationRecord(
      workbench,
      "personal",
      coherentAllocation(),
      "coherent",
      "allocation",
      LATER,
    );
    workbench = saveCheckpointStatus(workbench, "personal", "architecture", "saved-unverified", "vehicle", "Architecture saved", LATER);
    workbench = saveCheckpointStatus(workbench, "personal", "timing", "saved-unverified", "cadence", "Timing saved", LATER);
    workbench = saveCheckpointStatus(workbench, "personal", "holdings", "saved-unverified", "product", "Holding saved", LATER);
    workbench = saveCheckpointStatus(workbench, "personal", "policy", "saved-unverified", "rule", "Policy saved", LATER);

    const changedMandate = {
      ...workbench.cases.personal.mandate,
      nearTermCashNeeds: "20000",
    };
    const next = saveMandateRecord(
      workbench,
      "personal",
      changedMandate,
      "coherent",
      "near-term cash need",
      changedAt,
    );
    const affectedCheckpoints = [
      "allocation",
      "architecture",
      "timing",
      "holdings",
      "policy",
    ] as const;

    for (const checkpoint of affectedCheckpoints) {
      expect(next.cases.personal.checkpoints[checkpoint]).toMatchObject({
        status: "review-required",
        updatedAt: changedAt,
        review: {
          sourceCheckpoint: "mandate",
          changedField: "near-term cash need",
          reason: "Mandate inputs changed; dependent portfolio decisions must be reconsidered.",
          at: changedAt,
        },
      });
    }
    expect(next.cases.practice.checkpoints.allocation.status).toBe("empty");
    expect(next.dependencyHistory).toEqual([{
      mode: "personal",
      sourceCheckpoint: "mandate",
      sourceRevision: 2,
      changedField: "near-term cash need",
      reason: "Mandate inputs changed; dependent portfolio decisions must be reconsidered.",
      affectedCheckpoints: [...affectedCheckpoints],
      at: changedAt,
    }]);
  });

  it("does not invalidate on an exact no-op save", () => {
    const workbench = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "draft",
      "goal",
      NOW,
    );
    const noOp = saveMandateRecord(
      workbench,
      "personal",
      workbench.cases.personal.mandate,
      "draft",
      "goal",
      LATER,
    );
    expect(noOp).toBe(workbench);
    expect(noOp.dependencyHistory).toEqual([]);
  });

  it("does not invalidate dependent work when only the mandate acknowledgement time changes", () => {
    let workbench = saveMandateRecord(
      createEmptyPortfolioWorkbench(NOW),
      "personal",
      coherentMandate(),
      "coherent",
      "readiness route",
      NOW,
    );
    workbench = saveAllocationRecord(
      workbench,
      "personal",
      coherentAllocation(),
      "coherent",
      "allocation",
      LATER,
    );
    const reacknowledged = {
      ...workbench.cases.personal.mandate,
      acknowledgedAt: "2026-08-12T14:00:00.000Z",
    };

    const noOp = saveMandateRecord(
      workbench,
      "personal",
      reacknowledged,
      "coherent",
      "readiness route",
      "2026-08-12T14:00:00.000Z",
    );

    expect(noOp).toBe(workbench);
    expect(noOp.cases.personal.checkpoints.allocation.status).toBe("coherent");
    expect(noOp.dependencyHistory).toEqual([]);
  });
});

describe("usePortfolioWorkbench event contract", () => {
  beforeEach(() => window.localStorage.clear());

  it("publishes a same-tab change event after a durable write", async () => {
    const listener = vi.fn();
    window.addEventListener(PORTFOLIO_WORKBENCH_EVENT, listener);
    const { result, unmount } = renderHook(() => usePortfolioWorkbench());
    await waitFor(() => expect(result.current.ready).toBe(true));

    act(() => {
      expect(result.current.setActiveMode("practice").ok).toBe(true);
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(JSON.parse(window.localStorage.getItem(PORTFOLIO_WORKBENCH_STORAGE_KEY) ?? "{}").activeMode).toBe("practice");
    window.removeEventListener(PORTFOLIO_WORKBENCH_EVENT, listener);
    unmount();
  });

  it("refreshes after a cross-tab storage event", async () => {
    const { result } = renderHook(() => usePortfolioWorkbench());
    await waitFor(() => expect(result.current.ready).toBe(true));
    const external = switchWorkbenchMode(result.current.workbench, "practice", LATER);
    window.localStorage.setItem(PORTFOLIO_WORKBENCH_STORAGE_KEY, JSON.stringify(external));

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: PORTFOLIO_WORKBENCH_STORAGE_KEY }),
      );
    });

    await waitFor(() => expect(result.current.activeMode).toBe("practice"));
  });
});
