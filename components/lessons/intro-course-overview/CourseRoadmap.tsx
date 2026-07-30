"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { COURSE_ROADMAP } from "./lessonContent";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag } from "./shared";

export default function CourseRoadmap() {
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Finance Foundations · roadmap
          </span>
        </div>
        <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
          5 stages
        </span>
      </div>

      {/* horizontal path */}
      <div className="mt-5 overflow-x-auto">
        <div className="flex min-w-[640px] items-stretch gap-2">
          {COURSE_ROADMAP.map((r, i) => {
            const isActive = active === i;
            return (
              <div key={r.key} className="flex items-center gap-2">
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-32 flex-col items-start rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                    isActive
                      ? "border-accent-cyan bg-accent-cyan/10"
                      : "border-white/15 bg-white/[0.02] hover:border-white/30",
                  )}
                >
                  <span className="ops-caption text-[10px] text-slate-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display mt-1.5 text-[16px] font-medium leading-snug text-slate-100">
                    {r.label}
                  </span>
                </button>
                {i < COURSE_ROADMAP.length - 1 && (
                  <span className="text-lg text-accent-cyan" aria-hidden>
                    →
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {active !== null && (
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="ops-definition-card mt-4 p-5"
          >
            <div className="ops-caption text-[11px] text-accent-cyan">
              {COURSE_ROADMAP[active].label}
            </div>
            <p className="ops-definition mt-2.5 text-[16px]">
              {COURSE_ROADMAP[active].body}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </InteractiveFrame>
  );
}
