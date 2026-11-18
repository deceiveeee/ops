import { getCourse } from "@/data/courses";
import { portfolioBuilderPath } from "@/data/courses/portfolioBuilder";
import { getLessonsForModule } from "@/data/lessons";
import { hasLessonComponent } from "@/lib/lessonSlugs";
import { firstStep, publicModules } from "@/components/courses/courseFacts";
import type { FirstSteps } from "@/lib/onboarding/types";
import type { LearningPath } from "@/lib/next-step";

/**
 * Both courses as ordered steps, for the "next up" line. Server-side: it reads
 * the lesson registry, and pages pass the small result down as a prop so the
 * registry never ships to the browser.
 *
 * Finance Foundations records completion per module under
 * `ops-m{order}-completion-v1` (the same key components/courses/CourseModules
 * reads). Module 1's five lessons record none, so a learner who has done only
 * those reads as not started. Investment Foundations records every lesson
 * under one key, and a mission is done when its required lessons are.
 */
export function learningPath(): LearningPath {
  const finance = publicModules("finance-foundations").flatMap((module) =>
    getLessonsForModule(module.id)
      .filter((lesson) => lesson.status === "available" && hasLessonComponent(lesson.slug))
      .map((lesson) => ({
        title: lesson.title,
        href: `/lessons/${lesson.slug}`,
        key: `ops-m${module.order}-completion-v1`,
        requires: [lesson.slug],
      })),
  );
  const missions = portfolioBuilderPath.missions
    .filter((mission) => mission.status === "available" && mission.startLessonSlug)
    .map((mission) => ({
      title: `Mission ${mission.order}: ${mission.title}`,
      href: `/lessons/${mission.startLessonSlug}`,
      key: "ops-if-completion-v1",
      requires: mission.legacyCompletionSlugs.length ? mission.legacyCompletionSlugs : [mission.startLessonSlug!],
    }));
  return { "finance-foundations": finance, "investment-foundations": missions };
}

/** Where the start guide can send someone, named the way the course pages name it. */
export function firstSteps(): FirstSteps {
  const ff = firstStep("finance-foundations");
  const iff = firstStep("investment-foundations");
  return {
    "finance-foundations": { title: `Lesson 1: ${ff.title}`, href: ff.href, action: ff.label },
    "investment-foundations": { title: `Mission 1: ${iff.title}`, href: iff.href, action: iff.label },
    daily: { title: "Today's company puzzle: guess a real company from its annual report, in as few clues as you can.", href: "/daily", action: "Play today's puzzle" },
  };
}

export function courseTitle(slug: "finance-foundations" | "investment-foundations"): string {
  return getCourse(slug)?.title ?? slug;
}
