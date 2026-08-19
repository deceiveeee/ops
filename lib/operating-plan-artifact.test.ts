import { describe, expect, it } from "vitest";
import {
  EMPTY_OPERATING_PLAN,
  EMPTY_REBALANCE_RULE,
  EMPTY_SCENARIO_RESPONSE,
  isOperatingPlanComplete,
  isRebalanceRuleComplete,
  type OperatingPlan,
  type ScenarioResponse,
} from "./if-progress";

const answered = (over: Partial<ScenarioResponse> = {}): ScenarioResponse => ({
  ...EMPTY_SCENARIO_RESPONSE,
  whatChanged: "The market fell 30%.",
  controllingPolicy: "Timing policy: no timing.",
  response: "no-action",
  downstream: "None.",
  wouldChangeIf: "My income stopped.",
  ...over,
});

const nineScenarios = () =>
  Object.fromEntries(
    ["crash", "income", "cash", "contribution", "drift", "thesis", "stale", "licence", "mandate"].map(
      (id) => [id, answered()],
    ),
  );

const complete = (over: Partial<OperatingPlan> = {}): OperatingPlan => ({
  ...EMPTY_OPERATING_PLAN,
  mode: "personal",
  reviewProcess: "Reviewed every January, and never during a drawdown.",
  rebalanceRule: {
    trigger: "threshold",
    cadenceMonths: 0,
    bandBps: 500,
    method: "redirect-flows",
  },
  contributionRule: "Monthly, into the most underweight sleeve.",
  withdrawalRule: "From liquidity first, never from growth in a drawdown.",
  sellReplaceRule: "Replace only on a cheaper identical exposure.",
  thesisBreakRule: "If the fund changes its index, the reason I bought is gone.",
  scenarioResponses: nineScenarios(),
  transferCaseId: "case-a",
  transferCasePassed: true,
  criticalFailures: [],
  updatedAt: "2026-08-17T00:00:00.000Z",
  ...over,
});

describe("isRebalanceRuleComplete", () => {
  it("rejects an empty rule", () => {
    expect(isRebalanceRuleComplete(EMPTY_REBALANCE_RULE)).toBe(false);
  });

  it("requires a cadence when the trigger is calendar", () => {
    const base = { ...EMPTY_REBALANCE_RULE, method: "new-money" as const, trigger: "calendar" as const };
    expect(isRebalanceRuleComplete(base)).toBe(false);
    expect(isRebalanceRuleComplete({ ...base, cadenceMonths: 12 })).toBe(true);
  });

  it("requires a band when the trigger is threshold", () => {
    const base = { ...EMPTY_REBALANCE_RULE, method: "new-money" as const, trigger: "threshold" as const };
    expect(isRebalanceRuleComplete(base)).toBe(false);
    expect(isRebalanceRuleComplete({ ...base, bandBps: 500 })).toBe(true);
  });

  it("rejects a trigger with the wrong number filled in", () => {
    // A calendar rule with only a band, or a threshold rule with only a
    // cadence, is a half-written rule and reads as complete if unchecked.
    expect(
      isRebalanceRuleComplete({ trigger: "calendar", cadenceMonths: 0, bandBps: 500, method: "new-money" }),
    ).toBe(false);
    expect(
      isRebalanceRuleComplete({ trigger: "threshold", cadenceMonths: 12, bandBps: 0, method: "new-money" }),
    ).toBe(false);
  });

  it("requires a method as well as a trigger", () => {
    expect(
      isRebalanceRuleComplete({ trigger: "threshold", cadenceMonths: 0, bandBps: 500, method: "" }),
    ).toBe(false);
  });
});

describe("isOperatingPlanComplete", () => {
  it("accepts a finished plan", () => {
    expect(isOperatingPlanComplete(complete())).toBe(true);
  });

  it("rejects the empty plan", () => {
    expect(isOperatingPlanComplete(EMPTY_OPERATING_PLAN)).toBe(false);
  });

  it("requires the two genuinely new CFA elements", () => {
    // 2b, the review process, and 4c, the rebalancing rule. The other fourteen
    // IPS elements come from Missions 1-12 and are not re-asked here.
    expect(isOperatingPlanComplete(complete({ reviewProcess: "  " }))).toBe(false);
    expect(
      isOperatingPlanComplete(complete({ rebalanceRule: EMPTY_REBALANCE_RULE })),
    ).toBe(false);
  });

  it("requires all four operating rules", () => {
    for (const k of ["contributionRule", "withdrawalRule", "sellReplaceRule", "thesisBreakRule"] as const) {
      expect(isOperatingPlanComplete(complete({ [k]: "" }))).toBe(false);
    }
  });

  it("requires all nine flight-test scenarios", () => {
    const eight = nineScenarios();
    delete (eight as Record<string, unknown>).mandate;
    expect(isOperatingPlanComplete(complete({ scenarioResponses: eight }))).toBe(false);
  });

  it("does not count a scenario answered without naming what controls it", () => {
    const responses = nineScenarios();
    responses.crash = answered({ controllingPolicy: "   " });
    expect(isOperatingPlanComplete(complete({ scenarioResponses: responses }))).toBe(false);
  });

  it("accepts a silent policy so long as the learner says what controls instead", () => {
    // "Your plan is silent here" is a result, not a failure state — but it
    // still has to be resolved rather than skipped.
    const responses = nineScenarios();
    responses.stale = answered({
      policySilent: true,
      controllingPolicy: "Nothing covers this yet; I am adding a source-age rule.",
      response: "review",
    });
    expect(isOperatingPlanComplete(complete({ scenarioResponses: responses }))).toBe(true);
  });

  it("requires the transfer case to pass", () => {
    expect(isOperatingPlanComplete(complete({ transferCasePassed: false }))).toBe(false);
  });

  it("fails on a single critical failure, however complete everything else is", () => {
    expect(
      isOperatingPlanComplete(complete({ criticalFailures: ["hidden-leverage"] })),
    ).toBe(false);
  });

  it("requires a mode, because practice and personal are different artifacts", () => {
    expect(isOperatingPlanComplete(complete({ mode: "" }))).toBe(false);
  });
});
