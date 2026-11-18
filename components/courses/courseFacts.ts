import { getCourse } from "@/data/courses";
import { portfolioBuilderPath } from "@/data/courses/portfolioBuilder";
import type { CourseModule } from "@/data/courses/types";
import { getLesson, getLessonsForModule } from "@/data/lessons";

/**
 * One source for a course's size and first step, so the Courses list and the
 * course page can never disagree. Server-side: it reads the lesson registry.
 */

export function publicModules(slug: string): CourseModule[] {
  return getCourse(slug)?.modules.filter((module) => getLessonsForModule(module.id).length > 0) ?? [];
}

/** "9 modules", "46 lessons", "About 40 hours" — plain facts, one per line. */
export function courseFacts(slug: string): string[] {
  const course = getCourse(slug);
  if (!course) return [];
  if (slug === "investment-foundations") {
    const labs = portfolioBuilderPath.depthLabs.length;
    return [
      `${portfolioBuilderPath.missions.length} missions`,
      `About ${Math.round(portfolioBuilderPath.targetMinutes / 60)} hours`,
      `${labs} optional ${labs === 1 ? "investigation" : "investigations"}`,
    ];
  }
  const modules = publicModules(slug);
  const lessons = modules.reduce((total, module) => total + getLessonsForModule(module.id).length, 0);
  return [`${modules.length} modules`, `${lessons} lessons`, `About ${course.estimatedHours} hours`];
}

/** What a learner can do by the end, and where the sequence comes from. */
const OUTCOMES: Record<string, { points: string[]; source: string }> = {
  "finance-foundations": {
    points: [
      "Read financial statements and 10-K filings",
      "Value cash flows, bonds, and equities",
      "Measure risk and construct portfolios",
    ],
    source: "The lesson sequence is adapted from MIT 15.401.",
  },
  "investment-foundations": {
    points: [
      "Set a goal, an allocation, and a loss budget",
      "Evaluate business evidence and expected return",
      "Choose a passive core, or defend an active slice",
    ],
    source: "Optional investigations go deeper into Damodaran's strategies without blocking your progress.",
  },
};

export function courseOutcomes(slug: string): { points: string[]; source: string } {
  return OUTCOMES[slug] ?? OUTCOMES["finance-foundations"];
}

/** The first thing a learner does in a course, named. */
export function firstStep(slug: string, modules: CourseModule[] = publicModules(slug)): { href: string; label: string; title: string } {
  if (slug === "investment-foundations") {
    const mission = portfolioBuilderPath.missions[0];
    const lesson = mission.startLessonSlug ? getLesson(mission.startLessonSlug) : undefined;
    return {
      href: lesson ? `/lessons/${lesson.slug}` : `/courses/${slug}#curriculum`,
      label: "Start mission 1",
      title: mission.title,
    };
  }
  const lesson = getLessonsForModule((modules.length ? modules : publicModules(slug))[0]?.id ?? "")[0];
  return {
    href: lesson ? `/lessons/${lesson.slug}` : `/courses/${slug}#curriculum`,
    label: "Start lesson 1",
    title: lesson ? `${lesson.title} · ${lesson.estimatedMinutes} min` : "",
  };
}

/**
 * What each course teaches, item by item, for the Courses page: Finance
 * Foundations by module, Investment Foundations by mission.
 *
 * Each module's line restates its own description in data/courses/courses.ts
 * in plain words; acronyms are spelled out, because a visitor reads this page
 * before any lesson defines them. A module added without a line fails
 * components/courses/curriculum.test.ts rather than appearing blank.
 */
const MODULE_LINES: Record<string, string> = {
  "m01-introduction-and-course-overview": "What finance tries to solve: value, time and risk.",
  "m02-present-value-relations": "What money paid in the future is worth today.",
  "m03-fixed-income-securities": "How bonds work, and why their prices move when interest rates change.",
  "m04-equities": "What owning a stock means, and how to value one.",
  "m07-risk-and-return": "How to measure risk and return, and how diversification changes risk.",
  "m08-portfolio-theory": "How to combine investments, and what that does to a portfolio's risk.",
  "m09-the-capm-and-apt": "How much return a risk should earn: the capital asset pricing model (CAPM) and arbitrage pricing theory (APT).",
  "m10-capital-budgeting": "How a company decides which projects are worth the money.",
  "m11-efficient-markets": "How prices reflect information, and what that means for investing.",
};

export type CurriculumItem = { number: number; title: string; line?: string; href: string };

export function curriculum(slug: string): CurriculumItem[] {
  if (slug === "investment-foundations") {
    return portfolioBuilderPath.missions
      .filter((mission) => mission.status === "available")
      .map((mission) => ({
        number: mission.order,
        title: mission.title,
        href: mission.startLessonSlug ? `/lessons/${mission.startLessonSlug}` : `/courses/${slug}#curriculum`,
      }));
  }
  return publicModules(slug).map((module) => ({
    number: module.order,
    title: module.title,
    line: MODULE_LINES[module.id],
    href: `/courses/${slug}#module-${module.order}`,
  }));
}
