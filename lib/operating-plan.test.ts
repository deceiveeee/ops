import { describe, expect, it } from "vitest";
import {
  breachedSleeves,
  completionState,
  computeDrift,
  CRITICAL_FAILURES,
  evaluateAllMethods,
  evaluateRebalance,
  PREREQUISITE_CHECKPOINTS,
  readinessGaps,
  totalDeviationBps,
  transferCaseFailed,
  type CompletionInputs,
} from "./operating-plan";
import type { AllocationSleeve } from "./portfolio-workbench";

const sleeve = (
  id: string,
  targetBps: number,
  minBps: number,
  maxBps: number,
): AllocationSleeve => ({
  id,
  label: id,
  role: "growth",
  owner: "learner",
  minBps,
  targetBps,
  maxBps,
});

// 60/40 with ±5pp bands, which is what Mission 5 stores.
const SLEEVES = [
  sleeve("growth", 6000, 5500, 6500),
  sleeve("stability", 4000, 3500, 4500),
];

describe("computeDrift", () => {
  it("measures against the learner's own target, not an external ideal", () => {
    const drift = computeDrift(SLEEVES, { growth: 7000, stability: 3000 });
    expect(drift[0].driftBps).toBe(1000);
    expect(drift[1].driftBps).toBe(-1000);
  });

  it("treats a sleeve inside its own band as undrifted, however far from target", () => {
    // 6400 is 400bps from target but still inside the 5500-6500 band.
    const drift = computeDrift(SLEEVES, { growth: 6400, stability: 3600 });
    expect(drift[0].withinBand).toBe(true);
    expect(drift[1].withinBand).toBe(true);
    expect(breachedSleeves(drift)).toHaveLength(0);
    // The drift is real even though no band is breached.
    expect(drift[0].driftBps).toBe(400);
  });

  it("flags a breach on either side of the band", () => {
    const over = computeDrift(SLEEVES, { growth: 6600, stability: 3400 });
    expect(breachedSleeves(over)).toHaveLength(2);
    const under = computeDrift(SLEEVES, { growth: 5400, stability: 4600 });
    expect(breachedSleeves(under)).toHaveLength(2);
  });

  it("treats a missing sleeve reading as zero rather than skipping it", () => {
    const drift = computeDrift(SLEEVES, { growth: 10_000 });
    expect(drift[1].actualBps).toBe(0);
    expect(drift[1].driftBps).toBe(-4000);
  });
});

describe("totalDeviationBps", () => {
  it("halves the raw sum, because moving 1% from A to B repairs 2% of raw drift", () => {
    const drift = computeDrift(SLEEVES, { growth: 7000, stability: 3000 });
    // raw = 1000 + 1000; the actual money that must move is 1000.
    expect(totalDeviationBps(drift)).toBe(1000);
  });

  it("is zero for a portfolio sitting exactly on target", () => {
    expect(totalDeviationBps(computeDrift(SLEEVES, { growth: 6000, stability: 4000 }))).toBe(0);
  });
});

describe("the three rebalancing methods", () => {
  const drift = computeDrift(SLEEVES, { growth: 7000, stability: 3000 });
  const input = {
    drift,
    annualFrictionDragBps: 80, // one leg = 40bps
    newMoneyBps: 400,
    periodicFlowBps: 200,
  };

  it("sell-and-buy repairs fully and pays for both legs", () => {
    const r = evaluateRebalance("sell-and-buy", input);
    expect(r.repairedBps).toBe(1000);
    expect(r.remainingDeviationBps).toBe(0);
    // 1000bps of the portfolio moved, at 40bps per leg, twice.
    expect(r.frictionBps).toBe(round2((1000 / 10_000) * 40 * 2));
    expect(r.mayRealiseGains).toBe(true);
    expect(r.requiresNewMoney).toBe(false);
  });

  it("new-money buys only, so it pays one leg and cannot realise a gain", () => {
    const r = evaluateRebalance("new-money", input);
    expect(r.repairedBps).toBe(400);
    expect(r.remainingDeviationBps).toBe(600);
    expect(r.frictionBps).toBe(round2((400 / 10_000) * 40));
    expect(r.mayRealiseGains).toBe(false);
    expect(r.requiresNewMoney).toBe(true);
  });

  it("redirect-flows adds no incremental trading cost but repairs slowest", () => {
    const r = evaluateRebalance("redirect-flows", input);
    expect(r.frictionBps).toBe(0);
    expect(r.mayRealiseGains).toBe(false);
    expect(r.repairedBps).toBe(200);
    expect(r.remainingDeviationBps).toBe(800);
  });

  it("redirect-flows cannot run for someone who is no longer contributing", () => {
    // This is why cheapest is not best, and why the interface must say so.
    const r = evaluateRebalance("redirect-flows", { ...input, periodicFlowBps: 0 });
    expect(r.repairedBps).toBe(0);
    expect(r.remainingDeviationBps).toBe(1000);
    expect(r.requiresNewMoney).toBe(true);
  });

  it("never returns a method flagged as optimal", () => {
    const outcomes = evaluateAllMethods(input);
    for (const o of outcomes) {
      expect(Object.keys(o)).not.toContain("recommended");
      expect(Object.keys(o)).not.toContain("optimal");
      expect(Object.keys(o)).not.toContain("best");
    }
  });

  it("orders the comparison cheapest-first without implying a ranking of merit", () => {
    const outcomes = evaluateAllMethods(input);
    expect(outcomes.map((o) => o.method)).toEqual([
      "redirect-flows",
      "new-money",
      "sell-and-buy",
    ]);
    // The cheapest option is also the one that repairs least. Both are true,
    // and the trade-off is the lesson.
    expect(outcomes[0].frictionBps).toBeLessThan(outcomes[2].frictionBps);
    expect(outcomes[0].repairedBps).toBeLessThan(outcomes[2].repairedBps);
  });

  it("falls back to a labelled default when Mission 8 has not been done", () => {
    const r = evaluateRebalance("sell-and-buy", { ...input, annualFrictionDragBps: 0 });
    // 25bps per leg, the same shape of fallback Missions 11 and 12 use.
    expect(r.frictionBps).toBe(round2((1000 / 10_000) * 25 * 2));
  });

  it("reports remaining band breaches rather than implying a full repair", () => {
    const wide = computeDrift(SLEEVES, { growth: 8000, stability: 2000 });
    const r = evaluateRebalance("new-money", {
      drift: wide,
      annualFrictionDragBps: 80,
      newMoneyBps: 100,
      periodicFlowBps: 0,
    });
    expect(r.remainingDeviationBps).toBeGreaterThan(0);
    expect(r.stillBreached).toBeGreaterThan(0);
  });
});

describe("readinessGaps", () => {
  it("covers the twelve prior missions and excludes this mission's own artifact", () => {
    expect(PREREQUISITE_CHECKPOINTS).toHaveLength(12);
    expect(PREREQUISITE_CHECKPOINTS).not.toContain("policy");
  });

  it("returns every checkpoint as a gap when nothing has been done", () => {
    expect(readinessGaps({})).toHaveLength(12);
  });

  it("does not accept saved-unverified as satisfied", () => {
    // The phase prompt requires every checkpoint valid *and* current.
    const gaps = readinessGaps({ mandate: "saved-unverified" });
    expect(gaps.some((g) => g.id === "mandate")).toBe(true);
  });

  it("treats review-required as a gap", () => {
    const gaps = readinessGaps({ allocation: "review-required" });
    expect(gaps.some((g) => g.id === "allocation")).toBe(true);
  });

  it("clears only on coherent", () => {
    const all = Object.fromEntries(
      PREREQUISITE_CHECKPOINTS.map((id) => [id, "coherent" as const]),
    );
    expect(readinessGaps(all)).toHaveLength(0);
  });
});

describe("critical failures gate the transfer case", () => {
  it("lists all eight from the phase prompt", () => {
    expect(CRITICAL_FAILURES).toHaveLength(8);
  });

  it("fails on any single one, regardless of everything else", () => {
    expect(transferCaseFailed([])).toBe(false);
    for (const f of CRITICAL_FAILURES) {
      expect(transferCaseFailed([f])).toBe(true);
    }
  });
});

describe("completionState", () => {
  const base: CompletionInputs = {
    mode: "personal",
    gaps: [],
    reviewProcessWritten: true,
    rebalanceRuleWritten: true,
    transferCasePassed: true,
    criticalFailures: [],
    readinessBlockersResolved: true,
  };

  it("reaches execute-ready only with a personal dossier and no gaps", () => {
    expect(completionState(base)).toBe("execute-ready");
  });

  it("caps a practice dossier at practice-complete", () => {
    expect(completionState({ ...base, mode: "practice" })).toBe("practice-complete");
  });

  it("caps at practice-complete while any checkpoint gap remains", () => {
    const gaps = [{ id: "allocation" as const, status: "empty" as const, blocking: true }];
    expect(completionState({ ...base, gaps })).toBe("practice-complete");
  });

  it("caps at practice-complete while readiness blockers are open", () => {
    expect(completionState({ ...base, readinessBlockersResolved: false })).toBe(
      "practice-complete",
    );
  });

  it("is incomplete without both new IPS elements", () => {
    expect(completionState({ ...base, reviewProcessWritten: false })).toBe("incomplete");
    expect(completionState({ ...base, rebalanceRuleWritten: false })).toBe("incomplete");
  });

  it("is incomplete until the transfer case passes", () => {
    expect(completionState({ ...base, transferCasePassed: false })).toBe("incomplete");
  });

  it("is incomplete on a single critical failure even when everything else is done", () => {
    expect(
      completionState({ ...base, criticalFailures: ["hidden-leverage"] }),
    ).toBe("incomplete");
  });
});

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
