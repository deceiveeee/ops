import { getLessonsForModule } from "@/data/lessons";
import type { CourseModule } from "@/data/courses/types";
import {
  getPortfolioLessonRequirement,
  type CurriculumRequirement,
} from "@/data/courses/portfolioBuilder";
import LessonRow from "./LessonRow";

/**
 * Substantial curriculum module section.
 *
 * Composition:
 *   ┌─────────────────────────────────────────────────┐
 *   │  02                                  4 lessons  │  ← large faint number + count
 *   │                                                 │
 *   │  Present Value Relations                        │  ← module title (30–38px)
 *   │                                                 │
 *   │  Convert future cash flows into present value  │  ← description (17–19px)
 *   │  using timelines, discount rates and NPV.       │
 *   │                                                 │
 *   │  4 lessons · 3 hours                            │  ← stats (15–16px)
 *   │                                                 │
 *   │  [LessonRow]                                    │
 *   │  [LessonRow]                                    │
 *   │  [LessonRow]                                    │
 *   │  [LessonRow]                                    │
 *   └─────────────────────────────────────────────────┘
 *
 * Substantial vertical space between modules. No dark thin borders
 * around the lesson list — each lesson is its own light card.
 */
export default function ModuleSection({
  module,
  index,
  accentColor = "#22d3ee",
  showCurriculumRequirements = false,
}: {
  module: CourseModule;
  index: number;
  accentColor?: string;
  showCurriculumRequirements?: boolean;
}) {
  const lessons = getLessonsForModule(module.id);
  const totalMinutes = lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const coreLessons = showCurriculumRequirements
    ? lessons.filter(
        (lesson) => getPortfolioLessonRequirement(lesson.slug) !== "lab",
      )
    : lessons;
  const labLessons = showCurriculumRequirements
    ? lessons.filter(
        (lesson) => getPortfolioLessonRequirement(lesson.slug) === "lab",
      )
    : [];
  const coreMinutes = coreLessons.reduce(
    (sum, lesson) => sum + lesson.estimatedMinutes,
    0,
  );

  return (
    <section
      id={`module-${module.order}`}
      className="scroll-mt-24"
      aria-label={`${module.unitLabel ?? `Module ${module.order}`}: ${module.title}`}
    >
      {/* Header row — big faint number on right, content on left */}
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0 flex-1">
          <div
            className="text-[14px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: accentColor }}
          >
            {module.unitLabel ?? `Module ${String(module.order).padStart(2, "0")}`}
          </div>
          <h2 className="module-title mt-3">{module.title}</h2>
          <p className="module-desc mt-4 max-w-[640px]">{module.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[#555A61]">
            <span className="whitespace-nowrap font-medium tabular-nums">
              {showCurriculumRequirements
                ? `${coreLessons.length} required`
                : `${module.lessonSlugs.length} ${module.lessonSlugs.length === 1 ? "lesson" : "lessons"}`}
            </span>
            <span aria-hidden>·</span>
            <span className="whitespace-nowrap tabular-nums">
              {showCurriculumRequirements
                ? `${Math.round((coreMinutes / 60) * 10) / 10} core hours`
                : `${totalHours} hours`}
            </span>
            {showCurriculumRequirements && labLessons.length > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="whitespace-nowrap tabular-nums">
                  {labLessons.length} optional {labLessons.length === 1 ? "lab" : "labs"}
                </span>
              </>
            )}
          </div>
        </div>
        {/* Large faint module number on the right — visual anchor */}
        <div
          className="module-num hidden flex-shrink-0 lg:block"
          aria-hidden
        >
          {String(module.order).padStart(2, "0")}
        </div>
      </div>

      {/* Lessons */}
      <LessonGroup
        title={showCurriculumRequirements ? "Required journey" : undefined}
        description={
          showCurriculumRequirements
            ? "These lessons currently supply evidence for the Portfolio Builder core."
            : undefined
        }
        lessons={coreLessons}
        allLessons={lessons}
        accentColor={accentColor}
        requirement={showCurriculumRequirements ? "core" : undefined}
      />

      {labLessons.length > 0 && (
        <LessonGroup
          title="Optional depth"
          description="Explore the full Damodaran treatment without blocking your portfolio progress."
          lessons={labLessons}
          allLessons={lessons}
          accentColor={accentColor}
          requirement="lab"
        />
      )}
    </section>
  );
}

function LessonGroup({
  title,
  description,
  lessons,
  allLessons,
  accentColor,
  requirement,
}: {
  title?: string;
  description?: string;
  lessons: ReturnType<typeof getLessonsForModule>;
  allLessons: ReturnType<typeof getLessonsForModule>;
  accentColor: string;
  requirement?: CurriculumRequirement;
}) {
  return (
    <div className={title === "Optional depth" ? "mt-12" : "mt-10"}>
      {title && (
        <div className="mb-5">
          <h3 className="text-[19px] font-semibold tracking-[-0.01em] text-[#1D1D1F]">
            {title}
          </h3>
          {description && (
            <p className="mt-1.5 max-w-2xl text-[15px] leading-6 text-[#6E6E73]">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-2.5">
        {lessons.map((lesson) => (
          <LessonRow
            key={lesson.slug}
            lesson={lesson}
            index={allLessons.findIndex((item) => item.slug === lesson.slug)}
            accentColor={accentColor}
            requirement={requirement}
          />
        ))}
      </div>
    </div>
  );
}
