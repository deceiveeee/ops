import { getLessonsForModule } from "@/data/lessons";
import type { CourseModule } from "@/data/courses/types";
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
}: {
  module: CourseModule;
  index: number;
  accentColor?: string;
}) {
  const lessons = getLessonsForModule(module.id);
  const totalMinutes = lessons.reduce((sum, l) => sum + l.estimatedMinutes, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <section
      id={`module-${module.order}`}
      className="scroll-mt-24"
      aria-label={`Module ${module.order}: ${module.title}`}
    >
      {/* Header row — big faint number on right, content on left */}
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0 flex-1">
          <div
            className="text-[14px] font-semibold uppercase tracking-[0.06em]"
            style={{ color: accentColor }}
          >
            Module {String(module.order).padStart(2, "0")}
          </div>
          <h2 className="module-title mt-3">{module.title}</h2>
          <p className="module-desc mt-4 max-w-[640px]">{module.description}</p>
          <div className="mt-5 flex items-center gap-3 text-[15px] text-[#555A61]">
            <span className="font-medium tabular-nums">
              {module.lessonSlugs.length}{" "}
              {module.lessonSlugs.length === 1 ? "lesson" : "lessons"}
            </span>
            <span aria-hidden>·</span>
            <span className="tabular-nums">{totalHours} hours</span>
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
      <div className="mt-10 space-y-2.5">
        {lessons.map((lesson, i) => (
          <LessonRow
            key={lesson.slug}
            lesson={lesson}
            index={i}
            accentColor={accentColor}
          />
        ))}
      </div>
    </section>
  );
}
