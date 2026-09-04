import { describe, expect, it } from "vitest";
import { JOURNEY_GROUPS } from "./IFProgressRail";
import { hasLessonComponent } from "@/lib/lessonSlugs";
import { lessons } from "@/data/lessons/lessons";

/**
 * Mission 10 shipped with the rail showing "Missions 1-2" on its own page.
 *
 * The rail picks the group containing the active slug and falls back to the
 * first group when nothing matches, so a lesson whose module was never
 * registered renders a confidently wrong module instead of failing. Nothing in
 * the suite noticed, because every assertion was about the lesson body.
 */
describe("the lesson rail resolves a module for every lesson", () => {
  const railSlugs: string[] = JOURNEY_GROUPS.flatMap((group) =>
    group.lessons.map((lesson) => lesson.slug as string),
  );

  const ifLessonSlugs = lessons
    .filter((lesson) => lesson.moduleId.startsWith("if-m"))
    .map((lesson) => lesson.slug);

  it("covers every Investment Foundations lesson", () => {
    const missing = ifLessonSlugs.filter((slug) => !railSlugs.includes(slug));
    expect(
      missing,
      `these lessons would render the wrong module in the rail: ${missing.join(", ")}`,
    ).toEqual([]);
  });

  it("never lists the same lesson under two modules", () => {
    const seen = new Set<string>();
    const duplicated = railSlugs.filter((slug) => {
      if (seen.has(slug)) return true;
      seen.add(slug);
      return false;
    });
    expect(duplicated).toEqual([]);
  });

  it("only lists lessons that actually render", () => {
    const unrenderable = railSlugs.filter((slug) => !hasLessonComponent(slug));
    expect(unrenderable).toEqual([]);
  });

  it("gives every group a mission label and a title", () => {
    for (const group of JOURNEY_GROUPS) {
      expect(group.missionLabel.trim().length).toBeGreaterThan(0);
      expect(group.title.trim().length).toBeGreaterThan(0);
      expect(group.lessons.length).toBeGreaterThan(0);
    }
  });
});
