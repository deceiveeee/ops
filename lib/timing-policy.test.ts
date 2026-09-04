import { describe, expect, it } from "vitest";
import {
  CASH_MONTHLY_RETURN,
  EXPIRY_MONTHS,
  ILLUSTRATIVE_PATH,
  simulateTiming,
} from "./timing-policy";
import {
  EMPTY_FRICTION_BUDGET,
  EMPTY_TIMING_POLICY,
  frictionOneWayPct,
  isTimingPolicyComplete,
} from "./if-progress";

const FRICTION = 0.5;

describe("simulateTiming", () => {
  it("holding policy costs nothing and matches the policy path exactly", () => {
    const out = simulateTiming("hold", "expiry", FRICTION);
    expect(out.frictionChargedPct).toBe(0);
    expect(out.monthsOutOfPolicy).toBe(0);
    expect(out.gapVsPolicyPct).toBe(0);
    expect(out.series).toEqual(out.policySeries);
    expect(out.resolved).toBe(true);
  });

  it("charges friction on both legs of a completed round trip", () => {
    const out = simulateTiming("first-drop", "expiry", FRICTION);
    expect(out.resolved).toBe(true);
    expect(out.frictionChargedPct).toBeCloseTo(FRICTION * 2, 10);
  });

  it("a fixed expiry returns exactly EXPIRY_MONTHS later", () => {
    const out = simulateTiming("first-drop", "expiry", FRICTION);
    expect(out.exitMonth).toBe(4);
    expect(out.reentryMonth).toBe(4 + EXPIRY_MONTHS);
    expect(out.monthsOutOfPolicy).toBe(EXPIRY_MONTHS);
  });

  it("a stop rule returns only once the index regains the exit level", () => {
    const out = simulateTiming("first-drop", "stop-rule", FRICTION);
    expect(out.reentryMonth).not.toBeNull();
    const exitLevel = ILLUSTRATIVE_PATH[out.exitMonth!];
    expect(ILLUSTRATIVE_PATH[out.reentryMonth!]).toBeGreaterThanOrEqual(exitLevel);
    // and not one month earlier
    expect(ILLUSTRATIVE_PATH[out.reentryMonth! - 1]).toBeLessThan(exitLevel);
  });

  it("'when it feels safe' never resolves and never stops costing", () => {
    const out = simulateTiming("confirmed", "feels-safe", FRICTION);
    expect(out.resolved).toBe(false);
    expect(out.reentryMonth).toBeNull();
    // Out of policy from the exit to the end of the window.
    expect(out.monthsOutOfPolicy).toBe(ILLUSTRATIVE_PATH.length - out.exitMonth!);
    // Only one leg was ever paid, because the learner never came back.
    expect(out.frictionChargedPct).toBeCloseTo(FRICTION, 10);
  });

  it("exiting after confirmation and never returning is the worst outcome", () => {
    const paths = [
      simulateTiming("hold", "expiry", FRICTION),
      simulateTiming("first-drop", "expiry", FRICTION),
      simulateTiming("first-drop", "stop-rule", FRICTION),
      simulateTiming("confirmed", "feels-safe", FRICTION),
    ];
    const worst = paths.reduce((a, b) => (a.endingValue < b.endingValue ? a : b));
    expect(worst.exitMonth).toBe(7);
    expect(worst.resolved).toBe(false);
  });

  it("selling into the decline and holding cash trails policy on this path", () => {
    // The point of the lesson: the deviation is not free, and on a path that
    // recovers, being out is what costs — not the trade itself.
    const out = simulateTiming("confirmed", "feels-safe", FRICTION);
    expect(out.gapVsPolicyPct).toBeLessThan(0);
  });

  it("zero friction still leaves a gap, so the cost is time out, not fees", () => {
    const free = simulateTiming("confirmed", "feels-safe", 0);
    expect(free.frictionChargedPct).toBe(0);
    expect(free.gapVsPolicyPct).toBeLessThan(0);
  });

  it("higher friction always leaves the learner worse off, never better", () => {
    const cheap = simulateTiming("first-drop", "expiry", 0.1);
    const dear = simulateTiming("first-drop", "expiry", 2);
    expect(dear.endingValue).toBeLessThan(cheap.endingValue);
  });

  it("cash compounds at the stated rate while out of the market", () => {
    const out = simulateTiming("confirmed", "feels-safe", 0);
    const afterExit = out.series[out.exitMonth! + 1];
    const atExit = out.series[out.exitMonth!];
    expect(afterExit / atExit).toBeCloseTo(1 + CASH_MONTHLY_RETURN, 10);
  });

  it("series and policySeries always cover the whole window", () => {
    const out = simulateTiming("first-drop", "stop-rule", FRICTION);
    expect(out.series).toHaveLength(ILLUSTRATIVE_PATH.length);
    expect(out.policySeries).toHaveLength(ILLUSTRATIVE_PATH.length);
  });
});

describe("friction carried from a saved Mission 8 budget", () => {
  const budget = (estimatedAnnualDrag: number) => ({
    ...EMPTY_FRICTION_BUDGET,
    estimatedAnnualDrag,
  });

  it("charges a heavy budget as whole percentage points", () => {
    const out = simulateTiming(
      "first-drop",
      "expiry",
      frictionOneWayPct(budget(0.039)),
    );
    expect(out.frictionChargedPct).toBeCloseTo(3.9, 10);
  });

  it("charges even the cheapest reachable budget", () => {
    const charged = simulateTiming(
      "first-drop",
      "expiry",
      frictionOneWayPct(budget(0.002)),
    );
    const free = simulateTiming("first-drop", "expiry", 0);
    expect(charged.frictionChargedPct).toBeCloseTo(0.2, 10);
    expect(free.endingValue - charged.endingValue).toBeGreaterThan(0.1);
  });
});

describe("isTimingPolicyComplete", () => {
  it("rejects an unsaved policy", () => {
    expect(isTimingPolicyComplete(EMPTY_TIMING_POLICY)).toBe(false);
  });

  it("accepts no-timing with a stated reason", () => {
    expect(
      isTimingPolicyComplete({
        ...EMPTY_TIMING_POLICY,
        mode: "no-timing",
        reason: "My horizon is long and I have no tested signal.",
        updatedAt: "2026-08-16T00:00:00.000Z",
      }),
    ).toBe(true);
  });

  it("rejects no-timing with no reason — a decision needs one", () => {
    expect(
      isTimingPolicyComplete({
        ...EMPTY_TIMING_POLICY,
        mode: "no-timing",
        updatedAt: "2026-08-16T00:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("rejects a bounded rule that is missing its expiry", () => {
    expect(
      isTimingPolicyComplete({
        ...EMPTY_TIMING_POLICY,
        mode: "bounded",
        reason: "r",
        signal: "s",
        benchmark: "b",
        maxDeviationPct: 5,
        eligibleSleeve: "equity",
        expiryDate: "",
        falsifier: "f",
        reviewDate: "2027-01-01",
        updatedAt: "2026-08-16T00:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("rejects a bounded rule with no maximum deviation", () => {
    expect(
      isTimingPolicyComplete({
        ...EMPTY_TIMING_POLICY,
        mode: "bounded",
        reason: "r",
        signal: "s",
        benchmark: "b",
        maxDeviationPct: 0,
        eligibleSleeve: "equity",
        expiryDate: "2026-12-01",
        falsifier: "f",
        reviewDate: "2027-01-01",
        updatedAt: "2026-08-16T00:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("accepts a fully specified bounded rule", () => {
    expect(
      isTimingPolicyComplete({
        ...EMPTY_TIMING_POLICY,
        mode: "bounded",
        reason: "r",
        signal: "s",
        benchmark: "b",
        maxDeviationPct: 5,
        eligibleSleeve: "equity",
        expiryDate: "2026-12-01",
        falsifier: "f",
        reviewDate: "2027-01-01",
        updatedAt: "2026-08-16T00:00:00.000Z",
      }),
    ).toBe(true);
  });
});
