"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Course, CourseModule } from "@/data/courses/types";
import { cn } from "@/lib/utils";

/**
 * Sticky course navigation rail (desktop only).
 *
 * Width: ~260px. Sits to the left of the curriculum content.
 * Shows: course overview link + module list + active-module indicator.
 * Tracks scroll position to highlight the current module.
 *
 * Mobile: hidden entirely. Mobile users get a compact module selector
 * at the top of the curriculum section (rendered separately in the page).
 */
export default function CourseRail({
  course,
  modules,
  accentColor = "#22d3ee",
}: {
  course: Course;
  modules: CourseModule[];
  accentColor?: string;
}) {
  const [activeOrder, setActiveOrder] = useState<number | null>(null);

  useEffect(() => {
    const sectionEls = modules
      .map((m) => document.getElementById(`module-${m.order}`))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.id;
          const match = id.match(/^module-(\d+)$/);
          if (match) setActiveOrder(parseInt(match[1], 10));
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.3, 0.7] },
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [modules]);

  return (
    <nav
      aria-label={`${course.title} modules`}
      className="hidden lg:block"
    >
      <div className="sticky top-24 space-y-6">
        {/* Course label */}
        <div>
          <Link
            href={`/courses/${course.slug}`}
            className="text-[14px] font-medium text-[#555A61] transition-colors hover:text-[#111214]"
          >
            ← Course overview
          </Link>
        </div>

        {/* Module list — module-level only, no lessons */}
        <ol className="space-y-1">
          {modules.map((m) => {
            const isActive = activeOrder === m.order;
            return (
              <li key={m.id}>
                <a
                  href={`#module-${m.order}`}
                  className={cn(
                    "flex items-baseline gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors",
                    isActive
                      ? "bg-white text-[#111214]"
                      : "text-[#555A61] hover:bg-white/50 hover:text-[#111214]",
                  )}
                >
                  <span
                    className={cn(
                      "text-[13px] font-semibold tabular-nums",
                      isActive ? "" : "text-[#555A61]",
                    )}
                    style={isActive ? { color: accentColor } : undefined}
                  >
                    {String(m.order).padStart(2, "0")}
                  </span>
                  <span className="flex-1 leading-tight">{m.title}</span>
                </a>
              </li>
            );
          })}
        </ol>

        {/* Continue / Start CTA */}
        <div className="border-t border-black/10 pt-5">
          <Link
            href={
              course.slug === "investment-foundations"
                ? `/courses/${course.slug}#portfolio-path`
                : `/courses/${course.slug}#module-1`
            }
            className="inline-flex items-center gap-2 text-[15px] font-medium"
            style={{ color: accentColor }}
          >
            {course.slug === "investment-foundations"
              ? "Open mission path"
              : "Start course"}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
