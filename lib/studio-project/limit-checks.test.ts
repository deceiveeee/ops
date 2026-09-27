import { describe, expect, it } from "vitest";
import { addStudioHolding, calculateStudio, createStudioPlan, updateStudioHolding, type StudioPlan } from "@/lib/studio";
import { STUDIO_CATALOG } from "@/lib/studio-catalog";
import { checkPortfolio } from "./limit-checks";
import { emptyLimits, type StudioLimits } from "./limits";

/*
 * Every number here was worked by hand before the code existed.
 *
 * $100,000, with $20,000 set aside, leaves $80,000 to invest. Weights are a
 * share of that $80,000; the checks use the whole $100,000:
 *   VTI  50% of $80,000 = $40,000 = 40% of the whole  (US stock fund)
 *   AAPL 10%            =  $8,000 =  8%               (one company)
 *   AGG  25%            = $20,000 = 20%               (bond fund)
 *   cash: $20,000 set aside + $12,000 unassigned = $32,000 = 32%
 * Default scenario: stocks -30%, bonds -10%, cash 0%.
 *   loss = 40,000 x 30% + 8,000 x 30% + 20,000 x 10% = 12,000 + 2,400 + 2,000 = $16,400, 16.4%
 * Slices: Grow 40 + 8 = 48%, Steady 20%, Ready 32%.
 */
function portfolio(): StudioPlan {
  let plan = createStudioPlan("practice", "2026-09-24T00:00:00.000Z");
  plan = { ...plan, goal: { ...plan.goal, budget: 100_000, cashReserve: 20_000, lossTolerancePct: 20 } };
  for (const [id, weight] of [["vti", 50], ["aapl", 10], ["agg", 25]] as const) {
    plan = updateStudioHolding(addStudioHolding(plan, id), id, { targetWeightPct: weight });
  }
  return plan;
}

const limits = (patch: Partial<StudioLimits> = {}): StudioLimits => ({ ...emptyLimits(), ...patch });
const run = (plan: StudioPlan, set: StudioLimits) => checkPortfolio(plan, calculateStudio(plan, STUDIO_CATALOG), set);
const check = (result: ReturnType<typeof run>, key: string) => result.checks.find((item) => item.key === key)!;
const room = (result: ReturnType<typeof run>, id: string) => result.holdings.find((item) => item.instrumentId === id)!;

describe("checking a portfolio against its limits", () => {
  it("sorts the whole portfolio into slices, cash included", () => {
    const result = run(portfolio(), limits());
    expect(result.sliceShares.grow).toBeCloseTo(48, 9);
    expect(result.sliceShares.steady).toBeCloseTo(20, 9);
    expect(result.sliceShares.ready).toBeCloseTo(32, 9);
    expect(result.unsorted).toEqual([]);
  });

  it("reports every unset limit as not checked, never as met", () => {
    const result = run(portfolio(), limits());
    expect(check(result, "bills")).toMatchObject({ status: "not-checked", detail: "No bills listed." });
    expect(check(result, "slices")).toMatchObject({ status: "not-checked", detail: "No ranges set." });
    expect(check(result, "caps")).toMatchObject({ status: "not-checked", detail: "No caps set." });
    // Willingness always has a value, so the scenario is always checked: $16,400 against 20% of $100,000.
    expect(check(result, "loss")).toMatchObject({
      status: "met",
      detail: "The scenario on the Risk page loses $16,400. Your loss budget is $20,000, the loss you could live with.",
    });
  });

  it("checks bills against the cash the portfolio holds", () => {
    const covered = run(portfolio(), limits({ cashNeeds: [{ id: "n1", label: "Tuition", amount: 25_000, dueDate: "2028-03-01" }] }));
    expect(check(covered, "bills")).toMatchObject({ status: "met", detail: "Your bills total $25,000. The portfolio holds $32,000 as cash." });
    const short = run(portfolio(), limits({ cashNeeds: [
      { id: "n1", label: "Tuition", amount: 25_000, dueDate: "2028-03-01" },
      { id: "n2", label: "Deposit", amount: 10_000, dueDate: "" },
    ] }));
    expect(check(short, "bills")).toMatchObject({ status: "not-met", detail: "Your bills total $35,000. The portfolio holds $32,000 as cash, $3,000 short." });
  });

  it("checks each slice with a range, and names the ones outside it", () => {
    const set = limits();
    set.slices.ready = { minPct: 20, targetPct: 25, maxPct: 30 };
    set.slices.steady = { minPct: 15, targetPct: 20, maxPct: 25 };
    set.slices.grow = { minPct: 50, targetPct: 55, maxPct: 65 };
    expect(check(run(portfolio(), set), "slices")).toMatchObject({
      status: "not-met",
      detail: "Ready is 32.0%; your range is 20–30%. Grow is 48.0%; your range is 50–65%.",
    });
    const onlySteady = limits();
    onlySteady.slices.steady = { minPct: null, targetPct: null, maxPct: 25 };
    expect(check(run(portfolio(), onlySteady), "slices")).toMatchObject({ status: "met", detail: "Steady is inside its range." });
  });

  it("checks companies against the company cap and funds against the fund cap", () => {
    expect(check(run(portfolio(), limits({ companyCapPct: 5, fundCapPct: 40 })), "caps")).toMatchObject({
      status: "not-met",
      detail: "AAPL is 8.0%, 3.0 points over your cap for one company (5%).",
    });
    // VTI at exactly 40% is at its cap, not over it.
    expect(check(run(portfolio(), limits({ companyCapPct: 10, fundCapPct: 40 })), "caps")).toMatchObject({
      status: "met",
      detail: "No company above 10%; no fund above 40%.",
    });
  });

  it("checks the scenario against the loss budget and names what loses most", () => {
    // Capacity 15% is below willingness 20%: the budget is $15,000.
    expect(check(run(portfolio(), limits({ lossCapacityPct: 15 })), "loss")).toMatchObject({
      status: "not-met",
      detail: "The scenario on the Risk page loses $16,400. Your loss budget is $15,000, the loss you could afford. Most of the loss: VTI $12,000, AAPL $2,400, AGG $2,000.",
    });
  });

  it("says what limits each weight: the lowest of its cap, its slice's highest, and the loss budget", () => {
    const set = limits({ companyCapPct: 5, fundCapPct: 40 });
    set.slices.steady = { minPct: null, targetPct: null, maxPct: 25 };
    set.slices.grow = { minPct: null, targetPct: null, maxPct: 65 };
    const result = run(portfolio(), set);
    // Budget 20% = $20,000; the scenario uses 16.4 points, leaving 3.6.
    // AAPL: cap 5; Grow 65 - (48 - 8) = 25; loss 8 + 3.6 / 0.30 = 20. Cap binds, and it is over.
    expect(room(result, "aapl")).toMatchObject({ weightPct: 8, over: true, tightest: { label: "your cap for one company", pct: 5 } });
    expect(room(result, "aapl").ceilings.map((c) => [c.label, Number(c.pct.toFixed(6))])).toEqual([
      ["your cap for one company", 5], ["Grow's highest", 25], ["your loss budget", 20],
    ]);
    // VTI: fund cap 40; Grow 65 - 8 = 57; loss 40 + 12 = 52. At its cap, not over.
    expect(room(result, "vti")).toMatchObject({ over: false, tightest: { label: "your cap for one fund", pct: 40 } });
    // AGG: fund cap 40; Steady 25 - 0 = 25; loss 20 + 3.6 / 0.10 = 56. Steady's highest binds.
    expect(room(result, "agg")).toMatchObject({ over: false, tightest: { label: "Steady's highest", pct: 25 } });
  });

  it("finds a holding over the loss budget once the scenario is larger than the budget", () => {
    // Budget 15%: 1.4 points over. AAPL 8 - 1.4 / 0.30 = 3.33...; AGG 20 - 1.4 / 0.10 = 6.
    const result = run(portfolio(), limits({ lossCapacityPct: 15 }));
    expect(room(result, "aapl").tightest?.label).toBe("your loss budget");
    expect(room(result, "aapl").tightest?.pct).toBeCloseTo(8 - 1.4 / 0.3, 9);
    expect(room(result, "agg").tightest?.pct).toBeCloseTo(6, 9);
    expect(room(result, "agg").over).toBe(true);
  });

  it("leaves a holding with no applicable limit unlimited rather than inventing one", () => {
    const result = run(portfolio(), limits());
    // With only the loss budget, every holding has that one ceiling and nothing else.
    expect(room(result, "vti").ceilings.map((c) => c.label)).toEqual(["your loss budget"]);
    const noLossBudget = { ...portfolio() };
    noLossBudget.goal = { ...noLossBudget.goal, lossTolerancePct: 0 };
    const none = run(noLossBudget, limits());
    expect(room(none, "vti")).toMatchObject({ ceilings: [], tightest: null, over: false });
    expect(check(none, "loss")).toMatchObject({ status: "not-checked" });
  });

  it("checks nothing while the portfolio itself does not add up", () => {
    let plan = portfolio();
    plan = updateStudioHolding(plan, "vti", { targetWeightPct: 90 }); // 90 + 10 + 25 = 125% of the money to invest
    const result = run(plan, limits({ companyCapPct: 5 }));
    for (const item of result.checks) expect(item.status).toBe("not-checked");
    expect(check(result, "caps").detail).toBe("The weights add up to more than 100%. Fix that first.");
    expect(result.holdings).toEqual([]);
  });
});
