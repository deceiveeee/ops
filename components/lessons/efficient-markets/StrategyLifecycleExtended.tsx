"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type StageKey = 1 | 2 | 3 | 4 | 5 | 6;

const STAGES: {
  n: StageKey;
  label: string;
  detail: string;
  edge: number;
  capital: number;
}[] = [
  { n: 1, label: "Discovery", detail: "A small group identifies a recurring pattern. Capital deployed is modest. Edge per trade is large.", edge: 100, capital: 8 },
  { n: 2, label: "Profit", detail: "The strategy produces attractive results. Early investors benefit. Track records begin to attract attention.", edge: 85, capital: 18 },
  { n: 3, label: "Attention", detail: "Performance becomes visible. Outside capital takes notice. Papers are written. Funds are marketed.", edge: 60, capital: 40 },
  { n: 4, label: "Capital inflow", detail: "More investors attempt the same trades. Position sizes across funds grow. Crowding begins.", edge: 35, capital: 70 },
  { n: 5, label: "Crowding", detail: "Trades occur earlier and at less favorable prices. The spread between entry and exit compresses.", edge: 15, capital: 92 },
  { n: 6, label: "Deterioration", detail: "Expected returns decline, or the strategy becomes vulnerable to sharp reversal when crowded holders exit together.", edge: 5, capital: 80 },
];

export default function StrategyLifecycleExtended() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<StageKey>(1);
  const active = STAGES.find((s) => s.n === stage)!;
  const idx = STAGES.findIndex((s) => s.n === stage);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          A simplified lifecycle. The point is not that every strategy follows these six stages in
          order, but that historical success tends to attract the capital that weakens future
          success. Tap a stage to see what is happening to the edge and to the capital pursuing it.
        </p>
      </div>

      {/* Stage selector */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Strategy lifecycle
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STAGES.map((s) => {
            const isActive = s.n === stage;
            const isPast = s.n < stage;
            return (
              <button key={s.n} type="button"
                onClick={() => setStage(s.n)}
                aria-pressed={isActive}
                className={cn("rounded-xl border px-2 py-2 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isActive ? "border-accent-cyan/50 bg-accent-cyan/[0.08]" : isPast ? "border-white/8 opacity-60" : "border-white/10 bg-white/[0.02] hover:border-white/25")}>
                <div className={cn("font-mono text-[10px]", isActive ? "text-accent-cyan" : "text-slate-400")}>
                  {String(s.n).padStart(2, "0")}
                </div>
                <div className={cn("mt-0.5 text-[11px] leading-tight", isActive ? "text-white" : "text-slate-300")}>
                  {s.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bars */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Bar label="Edge per trade" value={active.edge} tone="green" />
          <Bar label="Capital pursuing strategy" value={active.capital} tone="amber" />
        </div>
      </div>

      {/* Stage detail */}
      <AnimatePresence mode="wait">
        <motion.div key={stage}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
            Stage {active.n} · {active.label}
          </div>
          <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-100">{active.detail}</p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={stage === 1}
          onClick={() => setStage((s) => Math.max(1, s - 1) as StageKey)}
          className={cn("rounded-full border px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            stage === 1 ? "border-white/10 text-slate-500 cursor-not-allowed" : "border-white/20 text-slate-200 hover:border-white/40")}>
          ← Previous
        </button>
        <button type="button" disabled={stage === 6}
          onClick={() => setStage((s) => Math.min(6, s + 1) as StageKey)}
          className={cn("rounded-full border px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            stage === 6 ? "border-white/10 text-slate-500 cursor-not-allowed" : "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20")}>
          Next →
        </button>
      </div>

      {/* Conclusion */}
      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          Historical success can attract the capital that weakens future success.
        </p>
        <p className="ops-body mt-2 text-[14px] leading-[1.65] text-slate-200">
          A strategy may disappear, weaken, become capacity constrained, or return under different
          market conditions. The lifecycle is a warning, not a forecast — some strategies remain
          durable for long periods, and not every strategy follows the same exact path.
        </p>
      </div>
    </div>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "green" | "amber" }) {
  const text = tone === "green" ? "text-accent-green" : "text-accent-amber";
  const fill = tone === "green" ? "bg-accent-green" : "bg-accent-amber";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">{label}</span>
        <span className={cn("font-mono text-[13px] tabular-nums", text)}>{value}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/8">
        <motion.div className={cn("h-full rounded-full", fill)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }} />
      </div>
    </div>
  );
}
