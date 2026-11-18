import { describe, expect, it } from "vitest";
import { nextInCourse, nextStep, type LearningPath, type PathStep } from "./next-step";

const lesson = (slug: string, key = "ops-m2-completion-v1"): PathStep => ({ title: slug, href: `/lessons/${slug}`, key, requires: [slug] });
const ff = [lesson("a"), lesson("b"), lesson("c", "ops-m3-completion-v1"), lesson("d", "ops-m3-completion-v1")];
const mission = (n: number, requires: string[]): PathStep => ({ title: `m${n}`, href: `/lessons/${requires[0]}`, key: "ops-if-completion-v1", requires });
const iff = [mission(1, ["m1a", "m1b"]), mission(2, ["m2a"]), mission(3, ["m3a"])];
const path: LearningPath = { "finance-foundations": ff, "investment-foundations": iff };

/** Completion as the progress store keeps it: per key, per slug. */
const done = (...entries: string[]) => (key: string, slug: string) => entries.includes(`${key}:${slug}`) || entries.includes(slug);

describe("nextInCourse", () => {
  it("returns nothing for a course not started", () => {
    expect(nextInCourse(ff, done())).toBeNull();
  });

  it("goes to the step after the last one finished", () => {
    expect(nextInCourse(ff, done("a"))?.title).toBe("b");
    expect(nextInCourse(ff, done("a", "b", "c"))?.title).toBe("d");
  });

  it("goes past a later finished step, not back to an earlier gap", () => {
    // Opened lesson c out of order: the next step is d, not the skipped b.
    expect(nextInCourse(ff, done("a", "c"))?.title).toBe("d");
  });

  it("falls back to the first gap when everything after the latest is done", () => {
    expect(nextInCourse(ff, done("a", "c", "d"))?.title).toBe("b");
  });

  it("returns nothing when the whole course is finished", () => {
    expect(nextInCourse(ff, done("a", "b", "c", "d"))).toBeNull();
  });

  it("stays on a part-finished mission", () => {
    expect(nextInCourse(iff, done("m1a"))?.title).toBe("m1");
    expect(nextInCourse(iff, done("m1a", "m1b"))?.title).toBe("m2");
  });

  it("reads completion under each step's own key", () => {
    // "c" finished under the wrong module's key does not count.
    expect(nextInCourse(ff, done("ops-m2-completion-v1:c"))).toBeNull();
    expect(nextInCourse(ff, done("ops-m3-completion-v1:c"))?.title).toBe("d");
  });
});

describe("nextStep", () => {
  it("prefers Finance Foundations when both are started and nothing is preferred", () => {
    expect(nextStep(path, done("a", "m1a"))).toEqual({ course: "finance-foundations", title: "b", href: "/lessons/b" });
  });

  it("prefers the course the start guide pointed to", () => {
    expect(nextStep(path, done("a", "m1a"), "investment-foundations")?.title).toBe("m1");
  });

  it("uses the other course when the preferred one is not started", () => {
    expect(nextStep(path, done("m2a"), "finance-foundations")?.title).toBe("m3");
  });

  it("returns nothing for a newcomer", () => {
    expect(nextStep(path, done())).toBeNull();
  });
});
