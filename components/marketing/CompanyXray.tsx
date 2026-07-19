"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { stockChart, businessDrivers } from "@/data/marketing";

const W = 1000;
const H = 200;
const PAD = 20;

export default function CompanyXray() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const xs = stockChart.map((p) => (p.t / (stockChart.length - 1)) * (W - PAD * 2) + PAD);
  const ys = stockChart.map((p) => p.p);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const yFor = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const d = "M" + stockChart.map((_, i) => `${xs[i]},${yFor(ys[i])}`).join(" L");

  // As the user scrolls, the chart lifts and fades while the driver layers
  // rise up from beneath it — a literal X-ray reveal.
  const chartLift = useTransform(scrollYProgress, [0.05, 0.7], [0, -90]);
  const chartOpacity = useTransform(scrollYProgress, [0.05, 0.7], [1, 0.35]);
  const chartScale = useTransform(scrollYProgress, [0.05, 0.7], [1, 0.92]);
  const driversY = useTransform(scrollYProgress, [0.15, 0.7], [60, 0]);
  const driversOpacity = useTransform(scrollYProgress, [0.15, 0.6], [0, 1]);
  const scanX = useTransform(scrollYProgress, [0.2, 0.7], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative h-[220vh] w-full">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="absolute inset-0 terminal-grid opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(52,211,153,0.06),transparent_60%)]" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
          {/* Header row — full width, not text-left/card-right */}
          <div className="mb-8 max-w-2xl">
            <SectionLabel index="03" eyebrow="Behind every ticker is a business" tone="green" />
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              X-ray the chart into its drivers.
            </h2>
            <p className="mt-5 max-w-md text-balance text-slate-300">
              The visible price is the surface. Underneath: revenue, margin, cash flow, debt, and shares — the levers
              that move price over time.
            </p>
          </div>

          {/* Layered X-ray canvas */}
          <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900/40 sm:h-[460px]">
            {/* scan line traveling across as drivers reveal */}
            <motion.div
              style={{ left: scanX }}
              className="pointer-events-none absolute top-0 z-30 h-full w-px bg-gradient-to-b from-accent-green/0 via-accent-green/60 to-accent-green/0"
            >
              <div className="absolute -left-3 top-2 h-1.5 w-7 rounded-full bg-accent-green/50 blur-[2px]" />
            </motion.div>

            {/* Surface chart — top layer, lifts and fades */}
            <motion.div
              style={{ y: chartLift, opacity: chartOpacity, scale: chartScale }}
              className="absolute inset-x-0 top-6 z-20 px-4"
            >
              <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
                <span>NVCO · surface · price</span>
                <span className="text-accent-cyan">SURFACE</span>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Stock chart surface layer being lifted to reveal drivers">
                <defs>
                  <linearGradient id="xrayFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${d} L${xs[xs.length - 1]},${H - PAD} L${xs[0]},${H - PAD} Z`} fill="url(#xrayFill)" />
                <path d={d} fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            {/* Drivers — underneath, rise up as the surface lifts */}
            <motion.div
              style={{ y: driversY, opacity: driversOpacity }}
              className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4"
            >
              <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-slate-500">
                <span>Underneath · business drivers</span>
                <span className="text-accent-green">X-RAY</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {businessDrivers.map((drv, i) => (
                  <motion.div
                    key={drv.key}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-3"
                  >
                    <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{drv.label}</div>
                    <div className={`mt-1 text-base font-semibold sm:text-lg ${drv.tone === "up" ? "text-accent-green" : drv.tone === "down" ? "text-accent-red" : "text-slate-200"}`}>
                      {drv.value}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-400">{drv.note}</div>
                    <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-green/60" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
