import { describe, it, expect } from "vitest";
import { mergeSnapshots } from "./merge";
import type { OnboardingSnapshot } from "./types";

const base: OnboardingSnapshot = {
  answers: {},
  completed_at: null,
  updated_at: "2026-01-01T00:00:00.000Z",
  recommended_course_slug: null,
  recommended_next_step: null,
  confidence_tier: null,
  segment: null,
  prompt_dismissed: false,
};

const withOver = (over: Partial<OnboardingSnapshot>): OnboardingSnapshot => ({
  ...base,
  ...over,
});

describe("mergeSnapshots", () => {
  it("returns null when both inputs are null", () => {
    expect(mergeSnapshots(null, null)).toBeNull();
  });

  it("returns cloud when local is null", () => {
    const c = withOver({ segment: "high-school" });
    expect(mergeSnapshots(null, c)).toBe(c);
  });

  it("returns local when cloud is null", () => {
    const l = withOver({ segment: "adult-learner" });
    expect(mergeSnapshots(l, null)).toBe(l);
  });

  it("completed beats partial regardless of updated_at", () => {
    const partial = withOver({
      updated_at: "2026-12-01T00:00:00.000Z",
      completed_at: null,
    });
    const complete = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
    });
    expect(mergeSnapshots(partial, complete)).toBe(complete);
    expect(mergeSnapshots(complete, partial)).toBe(complete);
  });

  it("both completed -> newer updated_at wins (cloud newer)", () => {
    const older = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
    });
    const newer = withOver({
      updated_at: "2026-06-01T00:00:00.000Z",
      completed_at: "2026-06-01T00:00:00.000Z",
    });
    expect(mergeSnapshots(older, newer)).toBe(newer);
  });

  it("both completed -> newer updated_at wins (local newer)", () => {
    const older = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
    });
    const newer = withOver({
      updated_at: "2026-06-01T00:00:00.000Z",
      completed_at: "2026-06-01T00:00:00.000Z",
    });
    expect(mergeSnapshots(newer, older)).toBe(newer);
  });

  it("both partial -> newer updated_at wins", () => {
    const older = withOver({ updated_at: "2026-01-01T00:00:00.000Z" });
    const newer = withOver({ updated_at: "2026-06-01T00:00:00.000Z" });
    expect(mergeSnapshots(older, newer)).toBe(newer);
  });

  it("both partial with equal updated_at -> local wins (tie-break)", () => {
    const local = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      segment: "adult-learner",
    });
    const cloud = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      segment: "high-school",
    });
    expect(mergeSnapshots(local, cloud)).toBe(local);
  });

  it("both completed with equal updated_at -> local wins (tie-break)", () => {
    const local = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
      segment: "adult-learner",
    });
    const cloud = withOver({
      updated_at: "2026-01-01T00:00:00.000Z",
      completed_at: "2026-01-01T00:00:00.000Z",
      segment: "high-school",
    });
    expect(mergeSnapshots(local, cloud)).toBe(local);
  });

  it("treats invalid updated_at as epoch (numeric 0)", () => {
    const valid = withOver({
      updated_at: "2026-06-01T00:00:00.000Z",
      completed_at: "2026-06-01T00:00:00.000Z",
    });
    const invalid = withOver({
      updated_at: "not-a-date",
      completed_at: "2026-06-01T00:00:00.000Z",
    });
    expect(mergeSnapshots(invalid, valid)).toBe(valid);
  });
});
