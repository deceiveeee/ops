"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "./shared";

const scanStops = ["Cash flow", "Reinvestment", "Required return", "Range"];

export default function ValuationLessonHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden pb-10 pt-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_12%,rgba(251,191,36,0.11),transparent_44%),radial-gradient(ellipse_at_88%_20%,rgba(34,211,238,0.10),transparent_40%)]" />

      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <div className="ops-eyebrow flex items-center gap-3 text-xs">
            <span className="tabular-nums text-accent-amber">Mission 7</span>
            <span className="h-px w-8 bg-white/30" />
            <span>Portfolio Builder · Valuation</span>
          </div>
          <h1 className="ops-display mt-5 max-w-4xl text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            Estimate a Valuation Range
          </h1>
          <p className="ops-body mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            Turn cash flow, growth quality, risk, and peer evidence into a price rule you can defend—without pretending valuation is precise.
          </p>
        </div>

        <div
          className="glass-panel relative mx-auto h-64 w-full max-w-[300px] overflow-hidden p-5"
          aria-hidden
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="ops-caption text-[12px] text-slate-500">Valuation scan</span>
            <span className="h-2 w-2 rounded-full bg-accent-amber shadow-[0_0_12px_rgba(251,191,36,0.55)]" />
          </div>

          <div className="relative mt-5 space-y-3">
            {scanStops.map((stop, index) => (
              <motion.div
                key={stop}
                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: index * 0.1 }}
                className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-cyan/30 bg-accent-cyan/10 text-[12px] tabular-nums text-accent-cyan">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-slate-200">{stop}</span>
              </motion.div>
            ))}

            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, 176, 0], opacity: [0.25, 0.9, 0.25] }
              }
              transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-accent-cyan shadow-[0_0_14px_rgba(34,211,238,0.55)]"
            />
          </div>
        </div>
      </div>

      <Reveal delay={0.05} className="relative mt-7">
        <div className="ops-definition-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="ops-caption text-[12px] text-accent-amber">Your investigation</div>
              <p className="ops-body-strong mt-2 max-w-2xl text-[16px] text-white">
                Match the claim and required return, expose the cost of growth, challenge a low-P/E shortcut, and save a valuation range to your plan.
              </p>
            </div>
            <a
              href="#valuation-investigation"
              className="inline-flex flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
            >
              Start the scan →
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08} className="relative mt-4">
        <div className="flex flex-wrap gap-2 text-[14px] text-slate-400">
          <span className="rounded-full border border-white/10 px-3 py-1.5">About 50 minutes</span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">Two guided scans</span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">Valuation Range</span>
        </div>
      </Reveal>
    </section>
  );
}
