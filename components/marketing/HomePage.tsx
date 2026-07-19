"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import MarketHero from "@/components/marketing/MarketHero";
import PriceSurface from "@/components/marketing/PriceSurface";
import CompanyXray from "@/components/marketing/CompanyXray";
import FilingReaderTeaser from "@/components/marketing/FilingReaderTeaser";
import MoneyMachine from "@/components/marketing/MoneyMachine";
import TimeValueObject from "@/components/marketing/TimeValueObject";
import ValuationGravity from "@/components/marketing/ValuationGravity";
import PortfolioConstellation from "@/components/marketing/PortfolioConstellation";
import MacroControlRoom from "@/components/marketing/MacroControlRoom";
import CourseMapCTA from "@/components/marketing/CourseMapCTA";
import { homepageScenes } from "@/data/marketing";

export default function HomePage() {
  return (
    <>
      <MarketHero />
      <NarrativeSpine />
      <PriceSurface />
      <CompanyXray />
      <FilingReaderTeaser />
      <MoneyMachine />
      <TimeBridge />
      <ValuationGravity />
      <PortfolioConstellation />
      <MacroControlRoom />
      <CourseMapCTA />
    </>
  );
}

/**
 * TimeBridge — a transitional signature object between MoneyMachine and
 * ValuationGravity. The timing wheel reinforces that cash flows happen over
 * time and must be discounted, bridging "how money moves" → "how money is
 * valued." Keeps the section count unchanged (it's a bridge, not a new
 * narrative beat).
 */
function TimeBridge() {
  return (
    <section className="relative w-full overflow-hidden border-y border-white/5 bg-ink-950 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-15" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(167,139,250,0.06),transparent_60%)]" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">Bridge · time value</div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl"
          >
            Cash flows happen over time. Time is the axis of value.
          </motion.h2>
          <p className="mt-4 max-w-md text-balance text-slate-300">
            A dollar today is not a dollar tomorrow. Duration, maturity, and discounting are how finance connects the
            future to the present — the bridge from the money machine to valuation.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Duration", "Maturity", "Discounting", "Present value"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-accent-purple/30 bg-accent-purple/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-purple"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex justify-center lg:col-span-5">
          <TimeValueObject className="w-72 sm:w-80" />
        </div>
      </div>
    </section>
  );
}

/**
 * Compact decoder-journey rail.
 * Kept short (single viewport) — not a redundant second TOC.
 * The scroll progress indicator is driven by actual scroll progress
 * (not a hardcoded px-per-item), so it stays accurate.
 */
function NarrativeSpine() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} id="spine" className="relative h-[140vh] w-full border-y border-white/5 bg-ink-950">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.05),transparent_60%)]" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="font-mono text-xs uppercase tracking-[0.22em] text-slate-400">The decoder journey</div>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl"
              >
                Nine moves from noise to clarity.
              </motion.h2>
              <p className="mt-4 max-w-md text-balance text-slate-300">
                Each step peels a layer off the market. Scroll to traverse the path the studio teaches you to walk.
              </p>
            </div>

            <div className="lg:col-span-7">
              <ol className="relative">
                {/* progress rail — driven by actual scroll progress, not px-per-item */}
                <div className="absolute left-[5.5rem] top-2 bottom-2 hidden w-px bg-white/5 sm:block">
                  <motion.div
                    style={{ scaleY: railScale, transformOrigin: "top" }}
                    className="h-full w-px bg-gradient-to-b from-accent-cyan via-accent-cyan/60 to-accent-cyan/0"
                  />
                </div>
                {homepageScenes.map((s) => (
                  <motion.li
                    key={s.id}
                    className="flex items-start gap-4 border-b border-white/5 py-2.5"
                    initial={{ opacity: 0.25 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ amount: 0.5 }}
                  >
                    <span className="mt-0.5 w-8 text-right font-mono text-xs tabular-nums text-accent-cyan">{s.index}</span>
                    <span className="mt-1.5 hidden h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan/50 sm:block" />
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">{s.eyebrow}</div>
                      <div className="text-base font-medium text-slate-100">{s.title}</div>
                    </div>
                  </motion.li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
