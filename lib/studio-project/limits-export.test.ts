import { describe, expect, it } from "vitest";
import { addStudioHolding, updateStudioHolding } from "@/lib/studio";
import { createStudioProject } from "./create";
import { describeRoom, describeRoomShort, type HoldingRoom } from "./limit-checks";
import { emptyLimits, limitsText, setLimits } from "./limits";
import { applyPlanChange, exportProjectText } from "./workspace";

const NOW = "2026-09-27T00:00:00.000Z";
const room = (weightPct: number, label: string, pct: number, over: boolean): HoldingRoom =>
  ({ instrumentId: "x", weightPct, slice: null, ceilings: [{ label, pct }], tightest: { label, pct }, over });

describe("limits in words, on Portfolio and in the readable plan", () => {
  it("says what holds a weight back in one of three ways", () => {
    expect(describeRoom(room(8, "your cap for one company", 5, true))).toBe("3.0 points over what your cap for one company allows (5.0% of the whole portfolio).");
    expect(describeRoom(room(40, "your cap for one fund", 40, false))).toBe("At the most your cap for one fund allows (40.0% of the whole portfolio).");
    expect(describeRoom(room(20, "Steady's highest", 25, false))).toBe("Can rise to 25.0% of the whole portfolio before it reaches Steady's highest.");
    expect(describeRoom({ ...room(20, "", 0, false), ceilings: [], tightest: null })).toBeNull();
  });

  it("says the same in one line beside the weight, the three ways and none", () => {
    expect(describeRoomShort(room(8, "your cap for one company", 5, true))).toBe("3.0 points over: your cap for one company allows 5.0%");
    expect(describeRoomShort(room(40, "your cap for one fund", 40, false))).toBe("At the most your cap for one fund allows, 40.0%");
    expect(describeRoomShort(room(20, "Steady's highest", 25, false))).toBe("Can rise to 25.0% before Steady's highest");
    expect(describeRoomShort({ ...room(20, "", 0, false), ceilings: [], tightest: null })).toBeNull();
  });

  it("writes every limit out, unset ones included, so a reader sees what was never decided", () => {
    expect(limitsText(emptyLimits(), 20)).toEqual([
      "Every percentage is a share of the whole portfolio, cash included.",
      "Bills you know are coming: none listed.",
      "Loss you could live with: 20%. Loss you could afford: not set. Loss budget: 20%, the loss you could live with.",
      "Ready (cash for bills): target not set, lowest not set, highest not set.",
      "Steady (bonds, for stability): target not set, lowest not set, highest not set.",
      "Grow (stocks, for growth): target not set, lowest not set, highest not set.",
      "Cap for one company: not set. Cap for one fund: not set.",
    ]);
    const set = emptyLimits();
    set.cashNeeds = [
      { id: "a", label: "Tuition", amount: 8000, dueDate: "2028-03-01" },
      { id: "b", label: "", amount: 2500, dueDate: "" },
      { id: "c", label: "", amount: 0, dueDate: "" }, // an empty row nobody filled in
    ];
    set.lossCapacityPct = 15;
    set.slices.grow = { minPct: 50, targetPct: 55, maxPct: 65 };
    set.companyCapPct = 5;
    expect(limitsText(set, 20)).toEqual([
      "Every percentage is a share of the whole portfolio, cash included.",
      "Bills you know are coming: Tuition $8,000, due 2028-03-01; Unnamed bill $2,500, no date yet.",
      "Loss you could live with: 20%. Loss you could afford: 15%. Loss budget: 15%, the loss you could afford.",
      "Ready (cash for bills): target not set, lowest not set, highest not set.",
      "Steady (bonds, for stability): target not set, lowest not set, highest not set.",
      "Grow (stocks, for growth): target 55%, lowest 50%, highest 65%.",
      "Cap for one company: 5%. Cap for one fund: not set.",
    ]);
  });

  it("puts the limits, each portfolio's checks and each weight's limit into the readable plan", () => {
    // The step 3 portfolio: $100,000 with $20,000 aside; VTI 40%, AAPL 8%, AGG 20% of the whole.
    let project = createStudioProject("practice", NOW);
    project = applyPlanChange(project, (plan) => {
      let next = { ...plan, goal: { ...plan.goal, budget: 100_000, cashReserve: 20_000, lossTolerancePct: 20 } };
      for (const [id, weight] of [["vti", 50], ["aapl", 10], ["agg", 25]] as const) {
        next = updateStudioHolding(addStudioHolding(next, id), id, { targetWeightPct: weight });
      }
      return next;
    });
    project = setLimits(project, () => ({ ...emptyLimits(), companyCapPct: 5 }), NOW);
    const text = exportProjectText(project);
    expect(text).toContain("YOUR LIMITS\nEvery percentage is a share of the whole portfolio, cash included.");
    expect(text).toContain("Cap for one company: 5%. Cap for one fund: not set.");
    // The limits come before the portfolios that are checked against them.
    expect(text.indexOf("YOUR LIMITS")).toBeLessThan(text.indexOf("PORTFOLIO: "));
    expect(text).toContain("Checked against your limits");
    expect(text).toContain("No holding is over its cap: not met. AAPL is 8.0%, 3.0 points over your cap for one company (5%).");
    expect(text).toContain("Bills are covered: not checked. No bills listed.");
    expect(text).toContain("The scenario stays within your loss budget: met. This allocation loses $16,400 in the scenario. Your loss budget is $20,000, the loss you could live with.");
    expect(text).toContain("What limits each weight");
    expect(text).toContain("AAPL: 3.0 points over what your cap for one company allows (5.0% of the whole portfolio).");
    // VTI: 40 + 3.6 / 0.30 = 52, the loss budget; no fund cap is set.
    expect(text).toContain("VTI: Can rise to 52.0% of the whole portfolio before it reaches your loss budget.");
  });
});
