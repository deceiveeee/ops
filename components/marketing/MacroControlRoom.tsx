"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import { macroScenarios } from "@/data/marketing";
import { cn } from "@/lib/utils";

const transmissionSteps = ["Rates", "Bonds", "Equities", "Companies", "Portfolios"];

export default function MacroControlRoom() {
  const [active, setActive] = useState(macroScenarios[2].key);
  const s = macroScenarios.find((m) => m.key === active)!;

  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(248,113,113,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header — varied: full-width with scenario chips inline */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <SectionLabel index="08" eyebrow="Macro policy ripples through markets" tone="red" />
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              One decision. Many transmission paths.
            </h2>
            <p className="mt-5 max-w-md text-balance text-slate-300">
              Rates → bonds → equities → companies → portfolios. The Fed&apos;s lever moves all of them. Pick a scenario
              to see the gauges respond.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {macroScenarios.map((m) => (
              <button
                key={m.key}
                onClick={() => setActive(m.key)}
                className={cn(
                  "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.16em] transition-all",
                  active === m.key
                    ? "border-accent-red/50 bg-accent-red/10 text-accent-red"
                    : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Control room — full-width dashboard */}
        <div className="mt-8">
          <div className="glass-panel relative overflow-hidden p-5 sm:p-8">
            <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span>Macro control room · scenario simulator</span>
              <span className="text-accent-red">FED LEVER</span>
            </div>

            {/* Gauges — 2 cols mobile, 4 cols desktop */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Gauge label="Fed Rate" value={`${s.fedRate.toFixed(2)}%`} pct={(s.fedRate / 6) * 100} tone="red" />
              <Gauge label="Inflation" value={`${s.inflation.toFixed(1)}%`} pct={(s.inflation / 6) * 100} tone="amber" />
              <Gauge label="Unemployment" value={`${s.unemployment.toFixed(1)}%`} pct={(s.unemployment / 6) * 100} tone="cyan" />
              <Gauge label="10Y Yield" value={`${s.tenYear.toFixed(2)}%`} pct={(s.tenYear / 6) * 100} tone="purple" />
            </div>

            {/* Transmission flow — horizontal chain that lights up sequentially */}
            <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                <span>Transmission chain</span>
                <span className="text-accent-red">RIPPLE</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {transmissionSteps.map((step, i) => (
                  <div key={step} className="flex flex-1 items-center gap-1.5 sm:gap-2" style={{ flex: "1 1 0" }}>
                    <motion.div
                      key={s.key + step}
                      initial={{ opacity: 0.3, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.12, duration: 0.4 }}
                      className={cn(
                        "flex-1 rounded-lg border px-2 py-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] sm:text-xs",
                        i === 0
                          ? "border-accent-red/40 bg-accent-red/10 text-accent-red"
                          : "border-white/10 bg-white/[0.02] text-slate-300",
                      )}
                    >
                      {step}
                    </motion.div>
                    {i < transmissionSteps.length - 1 && (
                      <motion.svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        className="flex-shrink-0 text-accent-red/50"
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.12 + 0.06 }}
                      >
                        <path d="M2 8h10M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Equity reaction + yield curve */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">Equity reaction</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "mt-1 text-lg font-semibold",
                      s.tone === "up" ? "text-accent-green" : s.tone === "down" ? "text-accent-red" : "text-slate-200",
                    )}
                  >
                    {s.equityReaction}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  <span>Yield curve response</span>
                  <span className="text-accent-purple">2Y → 10Y → 30Y</span>
                </div>
                <YieldCurve scenario={s} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Gauge({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: string;
  pct: number;
  tone: "red" | "amber" | "cyan" | "purple";
}) {
  const color = { red: "#f87171", amber: "#fbbf24", cyan: "#22d3ee", purple: "#a78bfa" }[tone];
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <motion.div
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-1 text-lg font-semibold sm:text-xl"
        style={{ color }}
      >
        {value}
      </motion.div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function YieldCurve({ scenario }: { scenario: (typeof macroScenarios)[number] }) {
  const pts = [
    { t: "2Y", y: scenario.fedRate - 0.1 },
    { t: "10Y", y: scenario.tenYear },
    { t: "30Y", y: scenario.tenYear + 0.4 },
  ];
  const W = 600;
  const H = 100;
  const xs = pts.map((_, i) => 30 + (i / (pts.length - 1)) * (W - 60));
  const ys = pts.map((p) => p.y);
  const min = 2;
  const max = 6;
  const yFor = (v: number) => H - 16 - ((v - min) / (max - min)) * (H - 32);
  const d = "M" + pts.map((_, i) => `${xs[i]},${yFor(ys[i])}`).join(" L");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Yield curve">
      {[3, 4, 5].map((g) => (
        <line key={g} x1={30} x2={W - 30} y1={yFor(g)} y2={yFor(g)} stroke="rgba(255,255,255,0.06)" />
      ))}
      <motion.path
        key={scenario.key}
        d={d}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      {pts.map((p, i) => (
        <g key={p.t}>
          <circle cx={xs[i]} cy={yFor(ys[i])} r="3" fill="#a78bfa" />
          <text x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="ui-monospace, monospace">
            {p.t}
          </text>
          <text x={xs[i]} y={yFor(ys[i]) - 8} textAnchor="middle" fontSize="9" fill="#cbd5e1" fontFamily="ui-monospace, monospace">
            {p.y.toFixed(2)}%
          </text>
        </g>
      ))}
    </svg>
  );
}
