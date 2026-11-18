"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export default function ChapterHero({
  index,
  eyebrow,
  title,
  subtitle,
  artifacts,
  compact = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  artifacts?: { label: string; tone: "cyan" | "amber" | "red" }[];
  /**
   * A title block only, with no subtitle or artwork, for a lesson that opens
   * on an activity: the title must leave room for it on the first screen.
   */
  compact?: boolean;
}) {
  const reduce = useReducedMotion();

  // Below 1024px the module's lesson list sits under the lesson, so the title
  // row carries the way to it. The link is 44px tall to tap but takes only a
  // line of height, which is what the negative margin is for.
  const allLessons = (
    <a
      href="#module-lessons"
      className="-my-3 ml-auto inline-flex min-h-11 items-center font-sans text-[12px] font-medium tracking-[0.01em] text-accent-cyan hover:underline lg:hidden"
    >
      All 5 lessons ↓
    </a>
  );

  if (compact) {
    return (
      <header className="w-full">
        <div className="ops-eyebrow flex items-center gap-3 text-xs">
          <span className="tabular-nums text-accent-cyan">{index}</span>
          <span className="h-px w-8 bg-white/30" />
          <span>{eyebrow}</span>
          {allLessons}
        </div>
        {/* 36px at most: the longest Module 1 title then takes one line beside
            the lesson list, which keeps the first activity inside the top half
            of a 1440x900 screen. */}
        <h1 className="ops-display mt-2 text-[28px] leading-[1.1] sm:mt-3 sm:text-4xl">
          {title}
        </h1>
      </header>
    );
  }

  const toneRing: Record<string, string> = {
    cyan: "border-accent-cyan/40 text-accent-cyan",
    amber: "border-accent-amber/40 text-accent-amber",
    red: "border-accent-red/40 text-accent-red",
  };
  const toneGlow: Record<string, string> = {
    cyan: "bg-accent-cyan/10",
    amber: "bg-accent-amber/10",
    red: "bg-accent-red/10",
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(34,211,238,0.10),transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl px-5 pt-16 pb-12 sm:px-8 sm:pt-28 sm:pb-16">
        <div className="ops-eyebrow flex items-center gap-3 text-xs">
          <span className="tabular-nums text-accent-cyan">{index}</span>
          <span className="h-px w-8 bg-white/30" />
          <span>{eyebrow}</span>
          {allLessons}
        </div>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="ops-display mt-7 text-4xl leading-[1.05] sm:text-6xl md:text-7xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
            className="ops-body mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl"
          >
            {subtitle}
          </motion.p>
        )}

        {artifacts && artifacts.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-3">
            {artifacts.map((a, i) => (
              <motion.div
                key={a.label}
                initial={reduce ? false : { opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.15 + i * 0.1,
                  ease: "easeOut",
                }}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl border bg-white/[0.02] px-5 py-3.5",
                  toneRing[a.tone],
                )}
              >
                <span
                  className={cn(
                    "absolute inset-0 -z-10 rounded-xl blur-xl",
                    toneGlow[a.tone],
                  )}
                />
                <span className="ops-caption text-[10px] text-slate-500">
                  0{i + 1}
                </span>
                <span className="font-display text-xl font-medium tracking-tight text-white">
                  {a.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
