import { describe, expect, it } from "vitest";
import { findLesson, getAllLessons } from "@/data/courses";
import { getLessonComponent } from "@/lib/lessonRegistry";
import { BETA_HIDDEN_LESSON_SLUGS, GUEST_ONLY_BETA } from "./beta";

describe("public beta boundary", () => {
  it("runs as a guest-only release", () => {
    expect(GUEST_ONLY_BETA).toBe(true);
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
      .filter((slug) => !getLessonComponent(slug));
    expect(missing).toEqual([]);
  });
});
