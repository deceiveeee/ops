import { describe, it, expect, beforeEach } from "vitest";
import {
  ONBOARDING_LS_KEY,
  readLocalSnapshot,
  writeLocalSnapshot,
  clearLocalSnapshot,
} from "./localStorage";
import type { OnboardingSnapshot } from "./types";

const snap: OnboardingSnapshot = {
  answers: { goal: "learn-to-analyze-companies" },
  completed_at: "2026-08-05T12:00:00.000Z",
  updated_at: "2026-08-05T12:00:00.000Z",
  recommended_course_slug: "finance-foundations",
  recommended_next_step: "Work through equities and valuation, then try a company case.",
  confidence_tier: "somewhat-confident",
  segment: "adult-learner",
  prompt_dismissed: false,
};

describe("localStorage helpers", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("ONBOARDING_LS_KEY is ops-onboarding-v1", () => {
    expect(ONBOARDING_LS_KEY).toBe("ops-onboarding-v1");
  });

  it("returns null when no key present", () => {
    expect(readLocalSnapshot()).toBeNull();
  });

  it("round-trips a snapshot", () => {
    writeLocalSnapshot(snap);
    expect(readLocalSnapshot()).toEqual(snap);
  });

  it("returns null for malformed JSON", () => {
    localStorage.setItem(ONBOARDING_LS_KEY, "{not json");
    expect(readLocalSnapshot()).toBeNull();
  });

  it("returns null when stored value is not an object", () => {
    localStorage.setItem(ONBOARDING_LS_KEY, JSON.stringify("string"));
    expect(readLocalSnapshot()).toBeNull();
  });

  it("clearLocalSnapshot removes the key", () => {
    writeLocalSnapshot(snap);
    clearLocalSnapshot();
    expect(readLocalSnapshot()).toBeNull();
    expect(localStorage.getItem(ONBOARDING_LS_KEY)).toBeNull();
  });

  it("writeLocalSnapshot dispatches an ops-onboarding-change event", () => {
    let fired = 0;
    const handler = () => { fired++; };
    window.addEventListener("ops-onboarding-change", handler);
    writeLocalSnapshot(snap);
    expect(fired).toBe(1);
    window.removeEventListener("ops-onboarding-change", handler);
  });
});
