import { createElement, type ComponentType, type ReactNode } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it } from "vitest";
import { ProgressProvider } from "@/lib/progress/store";
import { SessionProvider } from "@/lib/supabase/session";
import {
  EMPTY_BOND_BRIEF,
  EMPTY_DRAFT,
  EMPTY_EQUITY_RISK_POLICY,
  EMPTY_EVIDENCE_CHECKLIST,
  EMPTY_FRICTION_BUDGET,
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
