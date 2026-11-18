import Link from "next/link";
import { notFound } from "next/navigation";
import { courses, getCourse } from "@/data/courses";
import { getLessonsForModule } from "@/data/lessons";
import { portfolioBuilderPath } from "@/data/courses/portfolioBuilder";
import type { Lesson } from "@/data/courses/types";
import { hasLessonComponent } from "@/lib/lessonSlugs";
import Button from "@/components/ui/Button";
import CompoundingTable from "@/components/courses/CompoundingTable";
import CourseModules, { type ModuleItem } from "@/components/courses/CourseModules";
import PortfolioBuilderPath from "@/components/courses/PortfolioBuilderPath";
import { courseFacts, courseOutcomes, firstStep, publicModules } from "@/components/courses/courseFacts";
import LossRecoveryVisual from "@/components/marketing/LossRecoveryVisual";
import styles from "@/components/courses/courses.module.css";

export function generateStaticParams() {
  return courses.map((c) => ({ courseSlug: c.slug }));
}

export function generateMetadata({ params }: { params: { courseSlug: string } }) {
  const c = getCourse(params.courseSlug);
  if (!c) return { title: "Course — Investing Studio" };
  return {
    title: `${c.title} — Investing Studio`,
    description: c.subtitle,
    openGraph: { title: c.title, description: c.subtitle, type: "website", url: `/courses/${c.slug}`, siteName: "Investing Studio" },
    twitter: { card: "summary_large_image", title: c.title, description: c.subtitle },
  };
}

function lessonType(type: Lesson["type"]): string {
  switch (type) {
    case "interactive": return "Interactive lesson";
    case "reading": return "Reading";
    case "simulation": return "Simulation";
    case "case-study": return "Case study";
    case "filing-reader": return "Filing reader";
    case "quiz": return "Practice";
    default: return "Lesson";
  }
}

/**
 * A course page: what the course is, its first step and its own opening
 * exercise on the first screen, then the whole course folded to one row per
 * module (or per mission). Rules: docs/design/anti-template-restructure-plan-2026-11-04.md.
 */
export default function CoursePage({ params }: { params: { courseSlug: string } }) {
  const course = getCourse(params.courseSlug);
  if (!course) notFound();

  const isPortfolioBuilder = course.slug === "investment-foundations";
  const modules = publicModules(course.slug);
  const outcomes = courseOutcomes(course.slug);
  const start = firstStep(course.slug, modules);
  const facts = courseFacts(course.slug);
  const lessonCount = modules.reduce((sum, module) => sum + getLessonsForModule(module.id).length, 0);

  const moduleItems: ModuleItem[] = modules.map((module) => {
    const lessons = getLessonsForModule(module.id);
    const minutes = lessons.reduce((sum, lesson) => sum + lesson.estimatedMinutes, 0);
    return {
      id: module.id,
      order: module.order,
      title: module.title,
      description: module.description,
      hours: Math.round((minutes / 60) * 10) / 10,
      lessons: lessons.map((lesson) => ({
        slug: lesson.slug,
        title: lesson.title,
        meta: `${lessonType(lesson.type)} · ${lesson.estimatedMinutes} min`,
        open: true,
        note: lesson.status === "coming-soon" ? "Coming soon" : hasLessonComponent(lesson.slug) ? undefined : "In development",
      })),
    };
  });

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="course-title">
        <div>
          <Link href="/courses" className={styles.back}>← All courses</Link>
          <h1 id="course-title" className={styles.title}>{course.title}</h1>
          <p className={styles.lead}>{course.subtitle}</p>
          <p className={styles.facts}>{facts.join(" · ")}</p>
          <div className={styles.actions}>
            <Button href={start.href} size="lg">{start.label}</Button>
            <a href="#curriculum" className={styles.textLink}>
              {isPortfolioBuilder ? `See all ${portfolioBuilderPath.missions.length} missions` : `See all ${lessonCount} lessons`} <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className={styles.firstStep}>{isPortfolioBuilder ? `Mission 1: ${start.title}` : `Lesson 1: ${start.title}`}</p>
          <div className={styles.outcomes}>
            <h2>By the end you can</h2>
            <ul className={styles.checklist}>
              {outcomes.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <p className={styles.note}>{outcomes.source}</p>
          </div>
        </div>
        <div className={styles.exercise}>
          {isPortfolioBuilder ? <LossRecoveryVisual /> : <CompoundingTable />}
        </div>
      </section>

      <section id="curriculum" className={styles.curriculum} aria-labelledby="curriculum-title">
        {isPortfolioBuilder ? (
          <PortfolioBuilderPath path={portfolioBuilderPath} />
        ) : (
          <>
            <h2 id="curriculum-title" className={styles.sectionTitle}>All {lessonCount} lessons, module by module</h2>
            <p className={styles.curriculumLead}>Open a module to see its lessons. The one you are working on opens by itself.</p>
            <CourseModules modules={moduleItems} />
          </>
        )}
      </section>
    </div>
  );
}
