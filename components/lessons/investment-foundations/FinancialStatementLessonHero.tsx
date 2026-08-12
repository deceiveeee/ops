"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "./shared";

export default function FinancialStatementLessonHero({
  number,
  title,
  intro,
  mission,
  action,
  minutes,
  artifact,
}: {
  number: string;
  title: string;
  intro: string;
  mission: string;
  action: string;
  minutes: string;
  artifact: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden pb-10 pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_16%_14%,rgba(251,191,36,0.10),transparent_46%),radial-gradient(ellipse_at_88%_22%,rgba(34,211,238,0.10),transparent_42%)]" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <div className="ops-eyebrow flex items-center gap-3 text-xs">
            <span className="tabular-nums text-accent-amber">{number}</span>
            <span className="h-px w-8 bg-white/30" />
            <span>Investment Foundations · Mission 6</span>
          </div>
          <h1 className="ops-display mt-5 max-w-4xl text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="ops-body mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            {intro}
          </p>
        </div>

        <div className="relative mx-auto hidden h-56 w-56 lg:block" aria-hidden>
          {[0, 1, 2].map((page) => (
            <motion.div
              key={page}
              initial={reduceMotion ? false : { opacity: 0, y: 14, rotate: 0 }}
              animate={{
                opacity: 1,
                y: page * 14,
                rotate: (page - 1) * 3,
              }}
              transition={{ duration: 0.45, delay: page * 0.08 }}
              className="glass-panel absolute inset-x-5 top-0 h-44 p-4"
              style={{ zIndex: 3 - page }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="ops-caption text-[12px] text-slate-500">
                  Cedar Works · Annual report
                </span>
                <span className="h-2 w-2 rounded-full bg-accent-amber" />
              </div>
              <div className="mt-4 space-y-2">
                {[82, 64, 91, 70, 46].map((width, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan/60" />
                    <span
                      className="h-1.5 rounded-full bg-white/10"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                ))}
              </div>
              {page === 0 && (
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : { y: [0, 92, 0], opacity: [0.25, 0.8, 0.25] }
                  }
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-x-3 top-12 h-px bg-accent-cyan shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <Reveal delay={0.05} className="relative mt-7">
        <div className="ops-definition-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="ops-caption text-[12px] text-accent-amber">Your investigation</div>
              <p className="ops-body-strong mt-2 max-w-xl text-[16px] text-white">{mission}</p>
            </div>
            <a
              href="#statement-investigation"
              className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
            >
              {action} →
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="relative mt-4">
        <div className="flex flex-wrap gap-2 text-[14px] text-slate-400">
          <span className="rounded-full border border-white/10 px-3 py-1.5">{minutes}</span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">Four evidence scans</span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">{artifact}</span>
        </div>
      </Reveal>
    </section>
  );
}
