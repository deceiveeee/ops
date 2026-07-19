"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { stockChart, chartEvents } from "@/data/marketing";

const W = 1000;
const H = 360;
const PAD = 28;

function buildPath(points: { t: number; p: number }[]) {
  const xs = points.map((p) => (p.t / (points.length - 1)) * (W - PAD * 2) + PAD);
  const ys = points.map((p) => p.p);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  return { xs, ys, min, range };
}

export default function PriceSurface() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { xs, ys, min, range } = buildPath(stockChart);
  const yFor = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  const drawLength = useTransform(scrollYProgress, [0.08, 0.5], [0, 1]);
  const labelOpacity = useTransform(scrollYProgress, [0.12, 0.22], [0, 1]);

  return (
    <section ref={ref} id="story" className="relative min-h-[140vh] w-full">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        {/* full-bleed chart backdrop */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 terminal-grid opacity-20" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(34,211,238,0.06),transparent_60%)]" />
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Mock stock price chart as the surface layer">
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* gridlines */}
            {[0.2, 0.4, 0.6, 0.8].map((g) => (
              <line key={g} x1={0} x2={W} y1={PAD + g * (H - PAD * 2)} y2={PAD + g * (H - PAD * 2)} stroke="rgba(255,255,255,0.05)" />
            ))}
            {/* area + line */}
            <motion.path
              d={`M${xs.map((x, i) => `${x},${yFor(ys[i])}`).join(" L")} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`}
              fill="url(#priceFill)"
              style={{ opacity: drawLength }}
            />
            <motion.path
              d={`M${xs.map((x, i) => `${x},${yFor(ys[i])}`).join(" L")}`}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: drawLength }}
            />
            {/* event markers */}
            {chartEvents.map((e, i) => {
              const x = xs[e.t];
              const y = yFor(ys[e.t]);
              const color = e.tone === "up" ? "#34d399" : e.tone === "down" ? "#f87171" : "#a78bfa";
              return (
                <motion.g
                  key={e.t}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                >
                  <line x1={x} x2={x} y1={y} y2={H} stroke={color} strokeOpacity="0.3" strokeDasharray="2 4" />
                  <circle cx={x} cy={y} r="4" fill={color} />
                  <circle cx={x} cy={y} r="9" fill="none" stroke={color} strokeOpacity="0.4" />
                </motion.g>
              );
            })}
          </svg>
          {/* surface label overlay */}
          <motion.div style={{ opacity: labelOpacity }} className="pointer-events-none absolute right-5 top-5 sm:right-8 sm:top-8">
            <div className="rounded-full border border-accent-cyan/30 bg-ink-950/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-cyan backdrop-blur-sm">
              Surface layer · price
            </div>
          </motion.div>

          {/* Echo of the hero orbital sculpture — a faded ring motif that
              visually connects this section back to the hero object. The
              chart "resolves" out of the same circular structure. */}
          <motion.div
            style={{ opacity: labelOpacity }}
            className="pointer-events-none absolute -right-20 top-1/2 hidden -translate-y-1/2 lg:block"
            aria-hidden
          >
            <svg viewBox="0 0 300 300" className="w-72 opacity-20">
              <ellipse cx="150" cy="150" rx="140" ry="50" fill="none" stroke="#22d3ee" strokeWidth="0.8" transform="rotate(-15 150 150)" />
              <circle cx="150" cy="150" r="100" fill="none" stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.6" />
              <circle cx="150" cy="150" r="60" fill="none" stroke="#22d3ee" strokeWidth="0.5" opacity="0.4" />
              <circle cx="150" cy="150" r="4" fill="#22d3ee" />
            </svg>
          </motion.div>
        </div>

        {/* foreground copy */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
          <div className="max-w-md">
            <SectionLabel index="02" eyebrow="Price is only the surface" />
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl"
            >
              A chart shows what happened.
              <br />
              <span className="text-accent-cyan">Finance asks why.</span>
            </motion.h2>
            <p className="mt-5 max-w-sm text-balance text-slate-300">
              Every chart is the visible output of decisions, cash flows, expectations, and risk. The events on the
              timeline are where the story lives.
            </p>
          </div>
        </div>

        {/* event legend rail (mobile-friendly, stacked, no overlap) */}
        <div className="absolute bottom-6 left-5 right-5 z-10 sm:left-8 sm:right-8">
          <div className="flex flex-wrap gap-2">
            {chartEvents.map((e) => (
              <span
                key={e.t}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/70 px-3 py-1 font-mono text-[10px] text-slate-300 backdrop-blur-sm"
              >
                <span className={e.tone === "up" ? "text-accent-green" : e.tone === "down" ? "text-accent-red" : "text-accent-purple"}>
                  ●
                </span>
                {e.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
