"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

const MISSING = [
  "Pre-opening costs", "Initial working capital", "Sales ramp (not immediate maturity)",
  "Taxes", "Maintenance capital expenditure", "Corporate overhead allocation",
  "Lease obligations", "Cannibalization of existing stores", "Store closures",
  "Construction inflation", "Timing of cash flows", "Continuing or residual value",
  "Risk-appropriate discount rate",
];

export default function HeadlineUnitEconomicsTrap() {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          Management headline assumptions
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[{ l: "Dev cost", v: "$1.3M" }, { l: "Mature sales", v: "$2.7M" }, { l: "Margin", v: "21%" }, { l: "Time to maturity", v: "3 yrs" }].map((s) => (
            <div key={s.l} className="rounded-lg border border-white/10 bg-ink-950/40 p-3 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">{s.l}</div>
              <div className="mt-1 font-mono text-[15px] text-white">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The shortcut */}
      <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-red">
          The tempting shortcut
        </div>
        <div className="mt-3 space-y-2">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`\text{Mature profit} = \$2.7\,\text{M} \times 21\% = \$567{,}000`}</BlockMath>
          </div>
          <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.05] px-4 py-3">
            <BlockMath>{String.raw`\frac{\$567{,}000}{\$1.3\,\text{M}} \approx 43.6\%`}</BlockMath>
          </div>
        </div>
        <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
          A 43.6% apparent return looks extraordinary. But is this a valid project-return estimate?
        </p>
      </div>

      {!revealed && (
        <button type="button" onClick={() => setRevealed(true)}
          className="rounded-full border border-accent-amber/50 bg-accent-amber/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50">
          Reveal what is missing
        </button>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
                Items excluded from the shortcut
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {MISSING.map((m) => (
                  <span key={m} className="rounded-full border border-accent-amber/30 bg-accent-amber/[0.06] px-3 py-1 text-[12px] text-accent-amber">
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-accent-red/30 bg-gradient-to-br from-accent-red/[0.06] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[17px] leading-[1.55] text-white">
                Restaurant-level margin divided by development cost is not the same as project IRR,
                ROIC, free-cash-flow yield, or NPV.
              </p>
              <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-200">
                The shortcut ignores timing, taxes, maintenance spending, pre-opening costs, working
                capital, ramp-up, cannibalization, closures, and risk. It compares a steady-state
                operating margin to a one-time development cost without discounting.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
