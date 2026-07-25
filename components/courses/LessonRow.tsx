import Link from "next/link";
import { getLessonComponent } from "@/lib/lessonRegistry";
import type { Lesson } from "@/data/courses/types";
import { cn } from "@/lib/utils";

/**
 * Readable lesson row — replaces compressed database-style rows.
 *
 * Layout (desktop):
 *   [num/icon]  Lesson title                  duration  →
 *              Interactive lesson · 25 min
 *
 * Layout (mobile):
 *   [num]  Lesson title
 *          Interactive lesson · 25 min · 25m →
 *
 * States:
 *   - Not started: neutral, subdued arrow
 *   - Coming soon / In development: pill with readable label
 *   - Available: normal
 *
 * No mono, no tiny uppercase, no thin dark borders.
 */
export default function LessonRow({
  lesson,
  index,
  accentColor = "#22d3ee",
}: {
  lesson: Lesson;
  index: number;
  accentColor?: string;
}) {
  const hasComponent = Boolean(getLessonComponent(lesson.slug));
  const isComingSoon = lesson.status === "coming-soon";
  const statusText = isComingSoon
    ? "Coming soon"
    : hasComponent
      ? null
      : "In development";

  const typeLabel = lessonTypeLabel(lesson.type);

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      className="group flex items-center gap-5 rounded-2xl bg-white px-5 py-5 transition-all hover:bg-white hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 sm:px-7 sm:py-6"
      style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
    >
      {/* Number indicator */}
      <span
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-[15px] font-semibold tabular-nums"
        style={{
          borderColor: "rgba(0,0,0,0.10)",
          color: "#555A61",
          background: "rgba(0,0,0,0.02)",
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Title + meta */}
      <div className="min-w-0 flex-1">
        <div className="lesson-title">{lesson.title}</div>
        <div className="lesson-meta mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{typeLabel}</span>
          <span aria-hidden>·</span>
          <span>{lesson.estimatedMinutes} min</span>
          {statusText && (
            <span
              className="ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-medium"
              style={{
                background: "rgba(34,211,238,0.08)",
                color: accentColor,
                border: `1px solid ${accentColor}33`,
              }}
            >
              {statusText}
            </span>
          )}
        </div>
      </div>

      {/* Right: duration + arrow */}
      <div className="hidden flex-shrink-0 text-right sm:block">
        <div
          className="text-[15px] font-semibold tabular-nums"
          style={{ color: "#111214" }}
        >
          {lesson.estimatedMinutes}
          <span className="ml-0.5 text-[13px] font-normal text-[#555A61]">min</span>
        </div>
      </div>
      <span
        aria-hidden
        className="flex-shrink-0 text-[20px] transition-transform duration-200 group-hover:translate-x-1"
        style={{ color: "#555A61" }}
      >
        →
      </span>
    </Link>
  );
}

function lessonTypeLabel(type: Lesson["type"]): string {
  switch (type) {
    case "interactive":
      return "Interactive lesson";
    case "reading":
      return "Reading";
    case "simulation":
      return "Simulation";
    case "case-study":
      return "Case study";
    case "filing-reader":
      return "Filing reader";
    case "quiz":
      return "Practice";
    default:
      return "Lesson";
  }
}
