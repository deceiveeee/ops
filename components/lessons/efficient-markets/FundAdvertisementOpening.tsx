"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Stage = 0 | 1 | 2 | 3 | 4;

const REVEALS = [
  {
    label: "Fund strategy",
    text: "The Atlas Growth Fund invested primarily in technology companies.",
    impact: "Technology stocks had a strong year. Comparing to the broad S&P 500 may flatter the fund.",
  },
  {
    label: "Comparable benchmark",
    text: "A comparable technology-sector index returned 21%.",
    impact: "The fund underperformed a more appropriate benchmark by 3 percentage points before fees.",
  },
  {
    label: "Fees",
    text: "The fund charged a 1.2% annual management fee.",
    impact: "After fees, the fund returned approximately 16.8% — still below the tech index on a net basis.",
  },
  {
    label: "Risk",
    text: "The fund took more risk than the S&P 500, with higher volatility and sector concentration.",
    impact: "Higher risk should command a higher expected return. Outperforming a lower-risk index is not the same as adding value.",
  },
];

export default function FundAdvertisementOpening() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>(0);
  const [initialAnswer, setInitialAnswer] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Advertisement */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          Fund advertisement
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 p-5">
          <p className="text-[20px] font-medium text-white">
            &ldquo;Atlas Growth Fund returned <span className="text-accent-green">18%</span> last year.
            The S&amp;P 500 returned <span className="text-slate-300">12%</span>.&rdquo;
          </p>
        </div>
      </div>

      {/* Initial question */}
      {stage === 0 && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
            Did the manager add 6 percentage points of value?
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "Yes, clearly", val: "yes" },
              { label: "Probably", val: "probably" },
              { label: "Not enough information", val: "need-more" },
            ].map((o) => (
              <button key={o.val} type="button"
                onClick={() => { setInitialAnswer(o.val); setStage(1); }}
                className="rounded-full border border-white/20 px-5 py-2 text-[14px] text-slate-200 transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progressive reveals */}
      {stage > 0 && (
        <div className="space-y-3">
          {REVEALS.slice(0, stage).map((r, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.04] p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 font-sans text-[10px] text-accent-amber">{i + 1}</span>
                <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-amber">{r.label}</span>
              </div>
              <p className="ops-body mt-2 text-[15px] leading-[1.6] text-slate-100">{r.text}</p>
              <p className="ops-body mt-1 text-[13px] leading-[1.55] text-slate-300">{r.impact}</p>
            </motion.div>
          ))}

          {stage < REVEALS.length && (
            <button type="button" onClick={() => setStage((s) => Math.min(REVEALS.length, s + 1) as Stage)}
              className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
              Reveal more →
            </button>
          )}
        </div>
      )}

      {/* Conclusion */}
      <AnimatePresence>
        {stage === REVEALS.length && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6"
          >
            <p className="ops-body text-[17px] leading-[1.5] text-white">
              Performance can only be evaluated relative to an{" "}
              <span className="text-accent-cyan">appropriate alternative</span>. The fund&apos;s 18%
              return looked impressive against the S&amp;P 500 — but the manager invested in technology
              stocks, took more risk, charged fees, and still underperformed a comparable tech index.
            </p>
            {initialAnswer && initialAnswer !== "need-more" && (
              <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-300">
                Your initial reaction was understandable — the advertisement was designed to persuade.
                The missing context changed the conclusion entirely.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
