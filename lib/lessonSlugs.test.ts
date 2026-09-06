import { describe, expect, it } from "vitest";
import { LOADER_SLUGS } from "@/components/lessons/LessonMount";
import { INTERACTIVE_LESSON_SLUGS, hasLessonComponent } from "./lessonSlugs";

/**
 * The slug list and the loader map are separate modules on purpose: course
 * pages ask "does this lesson exist?" and must not pull 3.7 MB of lesson code
 * to answer it. Nothing at runtime notices if the two drift, and the failure is
 * quiet in both directions — a lesson silently rendering the "In development"
 * placeholder, or a course page promising a lesson that cannot mount. So the
 * agreement is asserted here instead.
 */
describe("lesson slug list and loader map", () => {
  it("list exactly the same slugs", () => {
    expect([...INTERACTIVE_LESSON_SLUGS].sort()).toEqual([...LOADER_SLUGS].sort());
  });

  it("agree through hasLessonComponent, which is what callers use", () => {
    const disagreeing = LOADER_SLUGS.filter((slug) => !hasLessonComponent(slug));
    expect(disagreeing).toEqual([]);
  });

  it("carry no duplicates", () => {
    expect(new Set(INTERACTIVE_LESSON_SLUGS).size).toBe(INTERACTIVE_LESSON_SLUGS.length);
  });

  it("answers false for a slug with no lesson", () => {
    expect(hasLessonComponent("not-a-lesson-slug")).toBe(false);
  });
});
