"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Choice = "A" | "B";

export default function HighestReturnOpening() {
  const reduce = useReducedMotion();
  const [pick, setPick] = useState<Choice | null>(null);
  const [revealed, setRevealed] = useState(false);

  const npvA = 1.3 / 1.1 - 1;
  const npvB = 120 / 1.1 - 100;
  const higherReturn = "A";
  const higherNPV = "B";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {([
          { id: "A" as Choice, name: "Project A", cost: "$1M", payoff: "$1.30M", tone: "cyan" as const },
          { id: "B" as Choice, name: "Project B", cost: "$100M", payoff: "$120M", tone: "amber" as const },
        ]).map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={revealed}
            onClick={() => setPick(p.id)}
            className={cn(
              "rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
              !revealed && (pick === p.id
                ? p.tone === "cyan" ? "border-accent-cyan/50 bg-accent-cyan/10" : "border-accent-amber/50 bg-accent-amber/10"
                : "border-white/12 hover:border-white/25"),
              revealed && p.id === higherReturn && "border-accent-cyan/40 bg-accent-cyan/[0.04]",
              revealed && p.id === higherNPV && "border-accent-amber/40 bg-accent-amber/[0.04]",
            )}
          >
            <div className={cn(
              "font-mono text-[11px] uppercase tracking-[0.16em]",
              p.tone === "cyan" ? "text-accent-cyan" : "text-accent-amber",
            )}>{p.name}</div>
            <div className="mt-3 space-y-1 text-[14px]">
              <div className="flex justify-between"><span className="text-slate-400">Investment</span><span className="font-mono text-white">{p.cost}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Payoff (1 yr)</span><span className="font-mono text-white">{p.payoff}</span></div>
            </div>
          </button>
        ))}
      </div>

      {!revealed && pick && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="rounded-full border border-accent-amber/50 bg-accent-amber/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        >
          Reveal the calculations
        </button>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Project A</div>
                <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
                  <BlockMath>{String.raw`NPV_A = \frac{\$1.30}{1.10} - 1 \approx \$${fmt(npvA)}\,\text{M}`}</BlockMath>
                </div>
                <div className="mt-2 text-[13px] text-slate-300">IRR: <span className="font-mono text-accent-cyan">30%</span> · Required: 10%</div>
              </div>
              <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">Project B</div>
                <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
                  <BlockMath>{String.raw`NPV_B = \frac{\$120}{1.10} - 100 \approx \$${fmt(npvB)}\,\text{M}`}</BlockMath>
                </div>
                <div className="mt-2 text-[13px] text-slate-300">IRR: <span className="font-mono text-accent-amber">20%</span> · Required: 10%</div>
              </div>
            </div>
            <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[17px] leading-[1.55] text-white">
                Project A has the higher percentage return. Project B creates far more total value.
                If the company can choose only one, Project B is the economically superior choice.
              </p>
              <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-200">
                A return percentage measures efficiency relative to capital invested. It does not
                measure the total dollars of value created.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
