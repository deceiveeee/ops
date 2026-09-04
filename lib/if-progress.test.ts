import { createElement, type ComponentType, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it } from "vitest";
import { ProgressProvider } from "@/lib/progress/store";
import { loadPortfolioWorkbench } from "@/lib/portfolio-workbench";
import { SessionProvider } from "@/lib/supabase/session";
import {
  EMPTY_BELIEF_STATEMENT,
  EMPTY_OBSERVATION_NOTE,
  EMPTY_BOND_BRIEF,
  EMPTY_DRAFT,
  EMPTY_EQUITY_RISK_POLICY,
  EMPTY_ARCHITECTURE_DECISION,
  EMPTY_EVIDENCE_CHECKLIST,
  EMPTY_FRICTION_BUDGET,
  FRICTION_FALLBACK_ONE_WAY_PCT,
  frictionOneWayPct,
  EMPTY_STATEMENT_BRIEF,
  EMPTY_VALUATION_RANGE,
  useIFProgress,
} from "./if-progress";

const fakeClient = {
  auth: {
    getUser: async () => ({ data: { user: null } }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => undefined } },
    }),
  },
} as unknown as SupabaseClient;

const TestSessionProvider = SessionProvider as ComponentType<{
  client?: SupabaseClient;
  children?: ReactNode;
}>;
const TestProgressProvider = ProgressProvider as ComponentType<{
  children?: ReactNode;
}>;

function Wrapper({ children }: { children: ReactNode }) {
  return createElement(
    TestSessionProvider,
    { client: fakeClient },
    createElement(TestProgressProvider, null, children),
  );
}

async function mountProgress() {
  const hook = renderHook(() => useIFProgress(), { wrapper: Wrapper });
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  return hook;
}

beforeEach(() => window.localStorage.clear());

describe("Investment Foundations artifact persistence", () => {
  it("starts every artifact from its documented empty shape", async () => {
    const { result } = await mountProgress();

    expect(result.current.draft).toEqual(EMPTY_DRAFT);
    expect(result.current.bondBrief).toEqual(EMPTY_BOND_BRIEF);
    expect(result.current.equityRiskPolicy).toEqual(EMPTY_EQUITY_RISK_POLICY);
    expect(result.current.statementBrief).toEqual(EMPTY_STATEMENT_BRIEF);
    expect(result.current.valuationRange).toEqual(EMPTY_VALUATION_RANGE);
    expect(result.current.frictionBudget).toEqual(EMPTY_FRICTION_BUDGET);
    expect(result.current.evidenceChecklist).toEqual(EMPTY_EVIDENCE_CHECKLIST);
  });

  it("round-trips all seven artifacts across an unmount and remount", async () => {
    const first = await mountProgress();

    act(() => {
      first.result.current.saveDraft({
        ...EMPTY_DRAFT,
        marketBelief: "Prices can differ from value.",
      });
      first.result.current.saveBondBrief({
        ...EMPTY_BOND_BRIEF,
        paymentPromise: "Coupons and principal",
      });
      first.result.current.saveEquityRiskPolicy({
        ...EMPTY_EQUITY_RISK_POLICY,
        decision: "Use portfolio risk first",
      });
      first.result.current.saveStatementBrief({
        ...EMPTY_STATEMENT_BRIEF,
        cashFlowFinding: "Cash conversion weakened",
      });
      first.result.current.saveValuationRange({
        ...EMPTY_VALUATION_RANGE,
        baseValue: 120,
        decision: "Watch",
      });
      first.result.current.saveFrictionBudget({
        ...EMPTY_FRICTION_BUDGET,
        turnoverExpectation: "Rarely — I buy and hold",
        spreadClass: "Large, liquid, widely covered",
        priceImpactExposure: "My orders are tiny next to daily volume",
        waitingSensitivity: "I can wait weeks without losing the idea",
        taxSetting: "Tax-advantaged account",
        estimatedAnnualDrag: 0.002,
        hurdleRule: "Treat 0.2% as an illustrative hurdle.",
      });
      first.result.current.saveEvidenceChecklist({
        ...EMPTY_EVIDENCE_CHECKLIST,
        benchmark: "Sharpe ratio",
        testDesign: "Portfolio study",
        holdoutRule: "Use a new period",
        samplingRule: "Start-of-period universe",
        hurdleRule: "Clear risk and friction",
        abandonRule: "Stop when the holdout fails",
      });
    });
    first.unmount();

    const second = await mountProgress();
    await waitFor(() =>
      expect(second.result.current.frictionBudget.estimatedAnnualDrag).toBe(0.002),
    );

    expect(second.result.current.draft.marketBelief).toBe(
      "Prices can differ from value.",
    );
    expect(second.result.current.bondBrief.paymentPromise).toBe(
      "Coupons and principal",
    );
    expect(second.result.current.equityRiskPolicy.decision).toBe(
      "Use portfolio risk first",
    );
    expect(second.result.current.statementBrief.cashFlowFinding).toBe(
      "Cash conversion weakened",
    );
    expect(second.result.current.valuationRange).toMatchObject({
      baseValue: 120,
      decision: "Watch",
    });
    expect(second.result.current.frictionBudget).toMatchObject({
      estimatedAnnualDrag: 0.002,
      hurdleRule: "Treat 0.2% as an illustrative hurdle.",
    });
    expect(second.result.current.evidenceChecklist).toMatchObject({
      benchmark: "Sharpe ratio",
      samplingRule: "Start-of-period universe",
      abandonRule: "Stop when the holdout fails",
    });
    expect(second.result.current.evidenceChecklist.updatedAt).not.toBe("");
  });

  it("tolerates corrupt JSON and merges partial valid artifacts with defaults", async () => {
    window.localStorage.setItem("ops-if-friction-budget-v1", "{broken");
    window.localStorage.setItem(
      "ops-if-evidence-checklist-v1",
      JSON.stringify({ benchmark: "Information ratio" }),
    );

    const { result } = await mountProgress();

    expect(result.current.frictionBudget).toEqual(EMPTY_FRICTION_BUDGET);
    expect(result.current.evidenceChecklist).toEqual({
      ...EMPTY_EVIDENCE_CHECKLIST,
      benchmark: "Information ratio",
    });
  });

  it("refreshes an artifact when another tab emits the storage event", async () => {
    const { result } = await mountProgress();
    window.localStorage.setItem(
      "ops-if-friction-budget-v1",
      JSON.stringify({
        ...EMPTY_FRICTION_BUDGET,
        estimatedAnnualDrag: 0.019,
        hurdleRule: "External update",
      }),
    );

    act(() => window.dispatchEvent(new StorageEvent("storage")));

    await waitFor(() =>
      expect(result.current.frictionBudget).toMatchObject({
        estimatedAnnualDrag: 0.019,
        hurdleRule: "External update",
      }),
    );
  });
});

describe("frictionOneWayPct", () => {
  it("converts Mission 8 decimal fractions to one leg in percentage points", () => {
    expect(
      frictionOneWayPct({
        ...EMPTY_FRICTION_BUDGET,
        estimatedAnnualDrag: 0.019,
      }),
    ).toBeCloseTo(0.95, 10);
    expect(
      frictionOneWayPct({
        ...EMPTY_FRICTION_BUDGET,
        estimatedAnnualDrag: 0.002,
      }),
    ).toBeCloseTo(0.1, 10);
    expect(
      frictionOneWayPct({
        ...EMPTY_FRICTION_BUDGET,
        estimatedAnnualDrag: 0.039,
      }),
    ).toBeCloseTo(1.95, 10);
  });

  it("never rounds a reachable saved budget to 0.00%", () => {
    for (const drag of [0.002, 0.008, 0.019, 0.039]) {
      const shown = frictionOneWayPct({
        ...EMPTY_FRICTION_BUDGET,
        estimatedAnnualDrag: drag,
      }).toFixed(2);
      expect(shown).not.toBe("0.00");
    }
  });

  it("uses the labelled fallback when Mission 8 has not been saved", () => {
    expect(frictionOneWayPct(EMPTY_FRICTION_BUDGET)).toBe(
      FRICTION_FALLBACK_ONE_WAY_PCT,
    );
    expect(frictionOneWayPct(null)).toBe(FRICTION_FALLBACK_ONE_WAY_PCT);
    expect(frictionOneWayPct(undefined)).toBe(FRICTION_FALLBACK_ONE_WAY_PCT);
  });
});

describe("artifacts reach the Portfolio Workbench", () => {
  /**
   * This is the assertion whose absence let the spine ship disconnected.
   *
   * Eleven of the thirteen Workbench checkpoints had no writer anywhere in the
   * application. Every artifact test above passed - the artifacts really were
   * saved and really did round-trip - while the checkpoints they were supposed
   * to move stayed "empty" forever, so Mission 13's readiness map reported ten
   * of twelve outstanding for a learner who had completed everything, and
   * Execute-ready could not be reached at all.
   *
   * Testing the artifact and the checkpoint separately is what hid it. This
   * asserts the connection.
   */
  it("moves the owning checkpoint when a lesson saves its artifact", async () => {
    const { result } = await mountProgress();

    expect(
      loadPortfolioWorkbench(window.localStorage).workbench.cases.personal.checkpoints["bond-risk"].status,
    ).toBe("empty");

    act(() => {
      result.current.saveBondBrief({
        ...EMPTY_BOND_BRIEF,
        paymentPromise: "Coupon twice a year, principal at maturity.",
      });
    });

    expect(
      loadPortfolioWorkbench(window.localStorage).workbench.cases.personal.checkpoints["bond-risk"].status,
    ).toBe("coherent");
  });

  it("gives Mission 2's checkpoint to the observation note, not to a belief", async () => {
    const { result } = await mountProgress();
    const beliefs = () =>
      loadPortfolioWorkbench(window.localStorage).workbench.cases.personal.checkpoints.beliefs.status;

    // Mission 1's constraints and a belief written under the old design are both
    // stored, and neither is Mission 2's decision any more. Curriculum amendment
    // 1 moved the belief statement to Mission 9.
    act(() => {
      result.current.saveDraft({
        ...EMPTY_DRAFT,
        constraints: { ...EMPTY_DRAFT.constraints, horizon: "Twelve years", riskPreference: "Hold" },
      });
    });
    act(() => {
      result.current.saveBeliefStatement({
        ...EMPTY_BELIEF_STATEMENT,
        marketBelief: "Prices can diverge from value.",
        persistenceReason: "Few investors hold long enough to close the gap.",
        evidenceGap: "A decade where patient holding stopped paying.",
      });
    });
    expect(beliefs()).toBe("empty");

    act(() => {
      result.current.saveObservationNote({
        ...EMPTY_OBSERVATION_NOTE,
        caseId: "netflix",
        disclosure: "Revenue grew while paid net additions came in below guidance.",
        priceResponse: "The shares fell by roughly a third in the next session.",
        interpretation: "What investors expected changed, and the price moved with it.",
        uncertainty: "It does not show the pattern repeats.",
        nextEvidence: "More events, not just memorable ones.",
        declinedToGeneralise: true,
      });
    });
    expect(beliefs()).toBe("coherent");
  });

  it("does not move Mission 2's checkpoint on a half-finished note", async () => {
    const { result } = await mountProgress();

    act(() => {
      result.current.saveObservationNote({
        ...EMPTY_OBSERVATION_NOTE,
        caseId: "nvidia",
        disclosure: "Revenue fell on the year while the outlook rose.",
      });
    });

    expect(
      loadPortfolioWorkbench(window.localStorage).workbench.cases.personal.checkpoints.beliefs.status,
    ).toBe("empty");
  });

  it("adopts a belief stated before the record was split out", async () => {
    // A learner who answered Mission 2 while the belief still lived inside the
    // philosophy draft must not lose it, in the lesson or in the dossier.
    window.localStorage.setItem(
      "ops-if-philosophy-draft-v1",
      JSON.stringify({
        ...EMPTY_DRAFT,
        marketBelief: "Prices can diverge from value.",
        persistenceReason: "Few investors hold long enough.",
        evidenceGap: "A decade where patience stopped paying.",
        generatedSummary: "I currently believe prices can diverge from value.",
        updatedAt: "2026-08-01T00:00:00.000Z",
      }),
    );

    const { result } = await mountProgress();

    expect(result.current.beliefStatement.marketBelief).toBe("Prices can diverge from value.");
    expect(result.current.beliefStatement.evidenceGap).toBe("A decade where patience stopped paying.");
  });

  it("does not reopen downstream work when a save changes nothing", async () => {
    const { result } = await mountProgress();

    const brief = { ...EMPTY_BOND_BRIEF, paymentPromise: "Coupon twice a year." };
    act(() => result.current.saveBondBrief(brief));
    const first = loadPortfolioWorkbench(window.localStorage)
      .workbench.cases.personal.checkpoints["bond-risk"].revision;

    // Pressing save again on an unchanged mission is not an economic change,
    // and must not send every dependent mission back for review.
    act(() => result.current.saveBondBrief(brief));
    const second = loadPortfolioWorkbench(window.localStorage)
      .workbench.cases.personal.checkpoints["bond-risk"].revision;

    expect(second).toBe(first);
  });

  it("reopens downstream work, with a reason a learner can read", async () => {
    const { result } = await mountProgress();

    // Architecture depends on beliefs. It is saved first and cannot be coherent
    // yet - its own prerequisites are missing - but it is recorded, which is
    // what makes it eligible for review when an input beneath it moves.
    act(() => {
      result.current.saveArchitectureDecision({
        ...EMPTY_ARCHITECTURE_DECISION,
        coreBenchmark: "Total market index",
      });
    });
    act(() => {
      result.current.saveObservationNote({
        ...EMPTY_OBSERVATION_NOTE,
        caseId: "netflix",
        disclosure: "Revenue grew while paid net additions came in below guidance.",
        priceResponse: "The shares fell by roughly a third in the next session.",
        interpretation: "What investors expected changed, and the price moved with it.",
        uncertainty: "It does not show the pattern repeats.",
        nextEvidence: "More events, not just memorable ones.",
        declinedToGeneralise: true,
      });
    });

    const architecture = loadPortfolioWorkbench(window.localStorage)
      .workbench.cases.personal.checkpoints.architecture;
    expect(architecture.status).toBe("review-required");
    expect(architecture.review?.sourceCheckpoint).toBe("beliefs");
    expect(architecture.review?.reason).toMatch(/Market observations changed/);
  });
});
