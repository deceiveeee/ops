"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULE1_LESSONS } from "./lessonContent";
import { cn } from "@/lib/utils";

export default function LessonProgressRail() {
  const pathname = usePathname();
  const activeSlug = pathname?.split("/").pop() ?? "";

  return (
    <nav aria-label="Module progress" className="glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="ops-eyebrow text-[11px] text-slate-400">Module 1</span>
        <span className="ops-caption text-[10px] text-accent-cyan">
          5 lessons
        </span>
      </div>
      <div className="ops-body-strong mt-1.5 text-[15px] text-white">
        Intro &amp; Overview
      </div>
      <ol className="mt-5 space-y-2">
        {MODULE1_LESSONS.map((l) => {
          const active = l.slug === activeSlug;
          return (
            <li key={l.slug}>
              <Link
                href={`/lessons/${l.slug}`}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  active
                    ? "border-accent-cyan/40 bg-accent-cyan/10"
                    : "border-transparent hover:border-white/10 hover:bg-white/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[11px] tabular-nums",
                    active
                      ? "border-accent-cyan bg-accent-cyan/20 text-accent-cyan"
                      : "border-white/15 text-slate-400 group-hover:border-white/30 group-hover:text-slate-200",
                  )}
                >
                  {l.n}
                </span>
                <span
                  className={cn(
                    "text-sm leading-snug",
                    active
                      ? "text-white"
                      : "text-slate-300 group-hover:text-white",
                  )}
                >
                  {l.title}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
