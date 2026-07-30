"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, FormulaExplainer } from "./shared";
import { MathText } from "@/components/ui/MathText";

/**
 * Compresses a chain of one-year rates R1..R_T into a single r_{0,T}.
 * Button toggles between the "chain" view and the "compressed" view.
 * Two FormulaExplainers show the price relationship both ways.
 */
const T = 5;

export default function RateChainCompressor() {
  const reduce = useReducedMotion();
  const [compressed, setCompressed] = useState(false);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Chain → single rate
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCompressed((c) => !c)}
          aria-pressed={compressed}
          className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-1.5 font-sans text-[12px] uppercase tracking-[0.12em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          <MathText>{compressed ? "Expand back into chain" : "Compress into r_{0,T}"}</MathText>
        </button>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        A spot rate is a chain of one-year rates, collapsed
      </h4>

      {/* Visual */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-5">
        <div className="min-w-[520px]">
          <AnimatePresence mode="wait" initial={false}>
            {!compressed ? (
              <motion.div
                key="chain"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full border border-accent-purple/40 bg-accent-purple/10 px-2.5 py-1 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-purple">
                    Chain of one-year rates
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: T }).map((_, i) => (
                    <motion.div
                      key={i}
                      layout={!reduce}
                      className="rounded-lg border border-accent-purple/25 bg-accent-purple/[0.05] px-2 py-4 text-center"
                    >
                      <div className="font-sans text-[15px] text-accent-purple">
                        R{sub(i + 1)}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <p className="ops-caption mt-3 text-[11px] text-slate-400">
                  Each <span className="font-sans text-accent-purple">R</span>{" "}
                  is one slice. Multiplied together, they compound across the
                  whole timeline.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="compressed"
                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35 }}
                className="flex justify-center"
              >
                <div className="w-full rounded-lg border border-accent-cyan/40 bg-accent-cyan/[0.08] px-4 py-6 text-center">
                  <div className="font-sans text-[22px] text-accent-cyan">
                    r{sub("{0,T}")}
                  </div>
                  <div className="ops-caption mt-1 text-[11px] text-slate-400">
                    one annualized rate for the whole interval 0 → T
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Two formulas */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FormulaExplainer
          label="If future one-year rates were known"
          tone="purple"
          formula={"P_0 = \\frac{F}{(1+R_1)(1+R_2)\\cdots(1+R_T)}"}
          meaning="If future one-year rates were known."
        />
        <FormulaExplainer
          label="We observe today's price"
          tone="cyan"
          formula={"P_0 = \\frac{F}{(1+r_{0,T})^T}"}
          meaning="We observe today's price, so define r_{0,T}."
        />
      </div>

      <div
        className={cn(
          "mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5",
        )}
      >
        <p className="ops-body text-[15px] leading-7 text-slate-100">
          <span className="text-accent-cyan">r{sub("{0,T}")}</span> is a{" "}
          <span className="text-accent-amber">geometric average</span> of
          one-year rates. Compounding once at{" "}
          <span className="font-sans">r</span> for T years must equal
          compounding once at each{" "}
          <span className="font-sans text-accent-purple">R{sub("t")}</span> for
          its own year.
        </p>
      </div>
    </InteractiveFrame>
  );
}

/** Small subscript helper using spans (kept inline; not a formula). */
function sub(s: string | number) {
  return <sub className="text-[0.7em]">{s}</sub>;
}
