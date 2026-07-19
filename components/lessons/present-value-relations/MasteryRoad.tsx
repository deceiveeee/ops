"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "@/components/lessons/intro-course-overview/shared";
import {
  usePVProgress,
  MASTERY_SKILLS,
  type MasteryLevel,
} from "@/lib/pv-progress";

const LEVEL_STYLES: Record<
  MasteryLevel,
  { ring: string; dot: string; label: string; text: string; glow: string }
> = {
  "not-started": {
    ring: "border-white/15",
    dot: "bg-slate-600",
    label: "Not started",
    text: "text-slate-400",
    glow: "",
  },
  learning: {
    ring: "border-accent-amber/50",
    dot: "bg-accent-amber",
    label: "Learning",
    text: "text-accent-amber",
    glow: "bg-accent-amber/15",
  },
  mastered: {
    ring: "border-accent-green/60",
    dot: "bg-accent-green",
    label: "Mastered",
    text: "text-accent-green",
    glow: "bg-accent-green/20",
  },
};

export default function MasteryRoad() {
  const reduce = useReducedMotion();
  const { mastery, masteredCount, ready } = usePVProgress();

  const total = MASTERY_SKILLS.length;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Module 2 · skill map
          </span>
        </div>
        <span className="ops-caption font-mono text-[12px] text-slate-300">
          <span className="text-accent-green">{ready ? masteredCount : 0}</span>
          <span className="text-slate-500"> / {total} mastered</span>
        </span>
      </div>

      <h3 className="ops-interactive-title mt-4 text-2xl text-white">
        Mastery Road
      </h3>
      <p className="ops-body mt-3 max-w-2xl text-[15px] leading-7 text-slate-200">
        Seven skills connect the module into one integrated understanding.
        Nodes brighten as you complete lessons, capstone steps, and Practice
        Arena modes.
      </p>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
          <motion.div
            initial={reduce ? false : { width: 0 }}
            animate={{
              width: `${((ready ? masteredCount : 0) / total) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-green"
          />
        </div>
      </div>

      {/* Road of 7 nodes */}
      <ol className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {MASTERY_SKILLS.map((skill, i) => {
          const level: MasteryLevel = mastery[skill.key] ?? "not-started";
          const s = LEVEL_STYLES[level];
          return (
            <motion.li
              key={skill.key}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: reduce ? 0 : i * 0.06,
                ease: "easeOut",
              }}
              className="relative flex flex-col items-center text-center"
            >
              {/* connector to next node */}
              {i < total - 1 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-[calc(50%+14px)] top-[14px] hidden h-px w-[calc(100%-28px)] bg-white/10 lg:block"
                />
              )}
              <span
                aria-label={`${skill.label}: ${s.label}`}
                className={cn(
                  "relative flex h-7 w-7 items-center justify-center rounded-full border-2 ring-4 ring-ink-950",
                  s.ring,
                )}
              >
                {s.glow && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-0 -z-10 rounded-full blur-md",
                      s.glow,
                    )}
                  />
                )}
                <span
                  className={cn("h-2.5 w-2.5 rounded-full", s.dot)}
                  aria-hidden
                />
                <span
                  className="absolute -top-1 -right-1 font-mono text-[10px] text-slate-500"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <div className="ops-body-strong mt-3 text-[13px] text-slate-100">
                {skill.label}
              </div>
              <div
                className={cn(
                  "mt-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                  s.text,
                )}
              >
                {s.label}
              </div>
            </motion.li>
          );
        })}
      </ol>

      {ready && masteredCount === total && (
        <div className="mt-8 rounded-xl border border-accent-green/40 bg-accent-green/10 p-5">
          <div className="ops-caption text-[11px] text-accent-green">
            Module complete
          </div>
          <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
            All seven skills mastered. You can read any asset as a sequence of
            cashflows and convert it into value today.
          </p>
        </div>
      )}
    </InteractiveFrame>
  );
}
