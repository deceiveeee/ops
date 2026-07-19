"use client";

import { motion, useReducedMotion } from "motion/react";
import Button from "@/components/ui/Button";
import SectionLabel from "@/components/ui/SectionLabel";
import { coursePath } from "@/data/marketing";

export default function CourseMapCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel index="09" eyebrow="Open Portfolio Studio" className="justify-center" />
          <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Don&apos;t memorize finance.
            <br />
            <span className="bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan bg-clip-text text-transparent">
              Decode it.
            </span>
          </h2>
          <p className="mt-5 text-balance text-slate-300">
            The path from market noise to portfolio studio — one investigation at a time.
          </p>
        </div>

        {/* Path */}
        <div className="mt-14">
          <div className="glass-panel relative overflow-hidden p-6 sm:p-10">
            <div className="mb-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span>Course path · investigation sequence</span>
              <span className="text-accent-cyan">DECODER MAP</span>
            </div>

            {/* horizontal path on desktop */}
            <div className="relative hidden lg:block">
              <svg viewBox="0 0 1200 160" className="w-full" preserveAspectRatio="none" aria-hidden>
                <path
                  d="M60,80 C200,80 200,30 360,30 C520,30 520,130 680,130 C840,130 840,50 1000,50 C1080,50 1120,80 1140,80"
                  fill="none"
                  stroke="rgba(34,211,238,0.35)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                />
                {!reduce && (
                  <motion.circle
                    r="5"
                    fill="#22d3ee"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: ["0%", "100%"] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{ offsetPath: "path('M60,80 C200,80 200,30 360,30 C520,30 520,130 680,130 C840,130 840,50 1000,50 C1080,50 1120,80 1140,80')" } as React.CSSProperties}
                  />
                )}
              </svg>
              <div className="absolute inset-0 grid grid-cols-9">
                {coursePath.map((p, i) => (
                  <motion.div
                    key={p.key}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-cyan/40 bg-ink-950 font-mono text-[11px] text-accent-cyan">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="mt-2 max-w-[100px] font-mono text-[10px] uppercase tracking-[0.14em] text-slate-300">
                      {p.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* vertical path on mobile — connected timeline */}
            <div className="lg:hidden">
              <div className="relative">
                <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-accent-cyan/50 via-accent-cyan/20 to-accent-cyan/0" />
                <div className="space-y-3">
                  {coursePath.map((p, i) => (
                    <motion.div
                      key={p.key}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="relative flex items-center gap-3"
                    >
                      <div className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-accent-cyan/40 bg-ink-950 font-mono text-[11px] text-accent-cyan">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-slate-200">
                        {p.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button href="/courses" size="lg">
            Explore the course
          </Button>
          <Button href="/studio" variant="outline" size="lg">
            Enter the studio
          </Button>
        </div>
      </div>
    </section>
  );
}
