import { describe, expect, it } from "vitest";
import {
  EMPTY_ARCHITECTURE_DECISION,
  EMPTY_HOLDINGS_SLATE,
  EMPTY_ORDER_DRAFT,
  EMPTY_TIMING_POLICY,
  holdingsSlateBlockers,
  isHoldingsSlateComplete,
  type ArchitectureDecision,
  type HoldingsSlate,
  type TimingPolicy,
} from "./if-progress";

const line = (over: Partial<HoldingsSlate["lines"][number]> = {}) => ({
  ticker: "VTI",
  seriesId: "S000002848",
  classId: "C000007808",
  sleeve: "growth",
  targetWeightPct: 60,
  ...over,
});

const complete = (over: Partial<HoldingsSlate> = {}): HoldingsSlate => ({
  ...EMPTY_HOLDINGS_SLATE,
  lines: [line(), line({ ticker: "AGG", seriesId: "S000004362", classId: "C000012092", sleeve: "stability", targetWeightPct: 40 })],
  issuerKeyMode: "issuer",
  overlapAcknowledged: true,
  staleDataAcknowledged: true,
  orderDraft: {
    ...EMPTY_ORDER_DRAFT,
    ticker: "VTI",
    classId: "C000007808",
    direction: "buy",
    approxAmountUsd: 2500,
    orderType: "limit",
    estimatedFrictionPct: 0.4,
  },
  updatedAt: "2026-08-16T00:00:00.000Z",
  ...over,
});

const validTiming: TimingPolicy = {
  ...EMPTY_TIMING_POLICY,
  mode: "no-timing",
  reason: "My horizon is long and I have no signal I trust.",
  updatedAt: "2026-08-15T00:00:00.000Z",
};

const validArchitecture: ArchitectureDecision = {
  ...EMPTY_ARCHITECTURE_DECISION,
  mode: "passive-only",
  coreExposure: "Total US market",
  updatedAt: "2026-08-15T00:00:00.000Z",
};

describe("isHoldingsSlateComplete", () => {
  it("accepts a finished slate", () => {
    expect(isHoldingsSlateComplete(complete())).toBe(true);
  });

  it("rejects an empty slate", () => {
    expect(isHoldingsSlateComplete(EMPTY_HOLDINGS_SLATE)).toBe(false);
  });

  it("rejects a line identified only by ticker", () => {
    // The mission's whole point: a ticker is a share class, and a slate line
    // without a class id has not said what was bought.
    const slate = complete({ lines: [line({ classId: "" })] });
    expect(isHoldingsSlateComplete(slate)).toBe(false);
  });

  it("rejects a holding with no sleeve", () => {
    expect(
      isHoldingsSlateComplete(complete({ lines: [line({ sleeve: "" })] })),
    ).toBe(false);
  });

  it("rejects the same legal product twice", () => {
    // VTI entered under two rows is one product, not two holdings.
    const slate = complete({
      lines: [line({ targetWeightPct: 30 }), line({ targetWeightPct: 30 })],
    });
    expect(isHoldingsSlateComplete(slate)).toBe(false);
  });

  it("rejects target weights above 100%", () => {
    const slate = complete({
      lines: [
        line({ targetWeightPct: 70 }),
        line({ ticker: "AGG", seriesId: "S000004362", classId: "C000012092", sleeve: "stability", targetWeightPct: 45 }),
      ],
    });
    expect(isHoldingsSlateComplete(slate)).toBe(false);
  });

  it("requires the overlap and staleness findings to be acknowledged", () => {
    expect(isHoldingsSlateComplete(complete({ overlapAcknowledged: false }))).toBe(false);
    expect(isHoldingsSlateComplete(complete({ staleDataAcknowledged: false }))).toBe(false);
  });

  it("requires the order draft to name a class, a direction, a type and an amount", () => {
    const bad = (over: Partial<HoldingsSlate["orderDraft"]>) =>
      isHoldingsSlateComplete(
        complete({ orderDraft: { ...complete().orderDraft, ...over } }),
      );
    expect(bad({ classId: "" })).toBe(false);
    expect(bad({ direction: "" })).toBe(false);
    expect(bad({ orderType: "" })).toBe(false);
    expect(bad({ approxAmountUsd: 0 })).toBe(false);
  });

  it("keeps the order draft untransmitted by construction", () => {
    // `transmitted` is typed `false`, so this is a type-level guarantee as much
    // as a runtime one. If it ever widens to boolean, this test is the tripwire.
    expect(complete().orderDraft.transmitted).toBe(false);
    expect(EMPTY_ORDER_DRAFT.transmitted).toBe(false);
  });
});

describe("holdingsSlateBlockers", () => {
  it("clears when the slate and both upstream artifacts are valid", () => {
    expect(
      holdingsSlateBlockers(complete(), validArchitecture, validTiming),
    ).toEqual([]);
  });

  it("treats an explicit no-timing policy as valid, not as missing", () => {
    const blockers = holdingsSlateBlockers(
      complete(),
      validArchitecture,
      validTiming,
    );
    expect(blockers.join(" ")).not.toMatch(/timing/i);
  });

  it("blocks when Mission 11 has not been decided at all", () => {
    const blockers = holdingsSlateBlockers(
      complete(),
      validArchitecture,
      EMPTY_TIMING_POLICY,
    );
    expect(blockers.some((b) => /timing policy/i.test(b))).toBe(true);
  });

  it("blocks when Mission 10's licence is missing", () => {
    const blockers = holdingsSlateBlockers(
      complete(),
      EMPTY_ARCHITECTURE_DECISION,
      validTiming,
    );
    expect(blockers.some((b) => /architecture licence/i.test(b))).toBe(true);
  });

  it("blocks when an upstream change marked the slate for review", () => {
    const blockers = holdingsSlateBlockers(
      complete({ reviewRequired: true }),
      validArchitecture,
      validTiming,
    );
    expect(blockers.some((b) => /upstream decision changed/i.test(b))).toBe(true);
  });

  it("reports every blocker at once rather than one at a time", () => {
    const blockers = holdingsSlateBlockers(
      EMPTY_HOLDINGS_SLATE,
      EMPTY_ARCHITECTURE_DECISION,
      EMPTY_TIMING_POLICY,
    );
    expect(blockers.length).toBeGreaterThanOrEqual(3);
  });
});
