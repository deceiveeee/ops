import { beforeEach, describe, expect, it } from "vitest";
import { GUIDE_LS_KEY, readGuideSnapshot, writeGuideSnapshot } from "./localStorage";
import { firstStepFor } from "./questions";

describe("start guide storage", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a snapshot", () => {
    const snapshot = { answers: { goal: "learn" as const, start: "new" as const }, completedAt: "2026-11-13T10:00:00.000Z", updatedAt: "2026-11-13T10:00:00.000Z" };
    writeGuideSnapshot(snapshot);
    expect(readGuideSnapshot()).toEqual(snapshot);
  });

  it("drops answers this version does not know, such as the old quiz's", () => {
    localStorage.setItem(GUIDE_LS_KEY, JSON.stringify({ answers: { goal: "learn-to-analyze-companies", start: "new", segment: "high-school" }, completedAt: null, updatedAt: "x" }));
    expect(readGuideSnapshot()?.answers).toEqual({ start: "new" });
  });

  it("treats a completed guide with a missing answer as still in progress", () => {
    localStorage.setItem(GUIDE_LS_KEY, JSON.stringify({ answers: { goal: "build" }, completedAt: "2026-11-13T10:00:00.000Z", updatedAt: "x" }));
    expect(readGuideSnapshot()?.completedAt).toBeNull();
  });

  it("returns null for unreadable storage", () => {
    localStorage.setItem(GUIDE_LS_KEY, "{not json");
    expect(readGuideSnapshot()).toBeNull();
  });
});

describe("first step", () => {
  it("sends every answer combination somewhere", () => {
    const table = (["learn", "company", "build", "unsure"] as const).flatMap((goal) =>
      (["new", "some"] as const).map((start) => `${goal}/${start} -> ${firstStepFor({ goal, start })}`),
    );
    expect(table).toEqual([
      "learn/new -> finance-foundations",
      "learn/some -> finance-foundations",
      "company/new -> daily",
      "company/some -> daily",
      "build/new -> finance-foundations",
      "build/some -> investment-foundations",
      "unsure/new -> finance-foundations",
      "unsure/some -> finance-foundations",
    ]);
  });
});
