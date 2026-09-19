import { describe, expect, it } from "vitest";
import { findLesson, getAllLessons } from "@/data/courses";
import { hasLessonComponent } from "@/lib/lessonSlugs";
import { BETA_HIDDEN_LESSON_SLUGS, GUEST_ONLY_BETA } from "./beta";

describe("public beta boundary", () => {
  /**
   * Accounts are optional, not absent. The guard is kept and inverted rather
   * than deleted, because the privacy policy's claims depend on this value and
   * flipping it silently is exactly what this test exists to prevent.
   */
  it("offers accounts rather than running guest-only", () => {
    expect(GUEST_ONLY_BETA).toBe(false);
  });

  it("hides every catalog record that lacks an implemented lesson", () => {
    expect(BETA_HIDDEN_LESSON_SLUGS.size).toBe(18);
    for (const slug of BETA_HIDDEN_LESSON_SLUGS) {
      expect(findLesson(slug)).toBeUndefined();
    }
  });

  it("exposes only lesson routes backed by real components", () => {
    const publicLessons = getAllLessons();
    const missing = publicLessons
      .map(({ lesson }) => lesson.slug)
      .filter((slug) => !hasLessonComponent(slug));
    expect(missing).toEqual([]);
  });
});
