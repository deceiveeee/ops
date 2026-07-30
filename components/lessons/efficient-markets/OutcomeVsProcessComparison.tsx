"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export default function OutcomeVsProcessComparison() {
  const reduce = useReducedMotion();
  const [answered, setAnswered] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Scenario A */}
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Scenario A</div>
          <p className="ops-body mt-2 text-[15px] leading-[1.6] text-slate-100">
            A diversified investor follows a disciplined process. An unexpected recession causes a loss.
          </p>
          <div className="mt-3 space-y-1.5 text-[13px]">
            <div className="flex items-center gap-2"><span className="text-accent-red">✗</span><span className="text-slate-200">Outcome: negative return</span></div>
            <div className="flex items-center gap-2"><span className="text-accent-green">✓</span><span className="text-slate-200">Process: diversified, evidence-based, risk-aware</span></div>
          </div>
        </div>
        {/* Scenario B */}
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-amber">Scenario B</div>
          <p className="ops-body mt-2 text-[15px] leading-[1.6] text-slate-100">
            An investor concentrates savings in a speculative company based on a rumor. The stock doubles.
          </p>
          <div className="mt-3 space-y-1.5 text-[13px]">
            <div className="flex items-center gap-2"><span className="text-accent-green">✓</span><span className="text-slate-200">Outcome: doubled investment</span></div>
            <div className="flex items-center gap-2"><span className="text-accent-red">✗</span><span className="text-slate-200">Process: rumor-based, concentrated, no risk management</span></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.6] text-slate-100">
          Which decision used the better process?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { val: "A", label: "Scenario A (diversified, disciplined)" },
            { val: "B", label: "Scenario B (rumor-based, doubled)" },
          ].map((o) => (
            <button key={o.val} type="button" disabled={answered !== null}
              onClick={() => setAnswered(o.val)}
              className={cn("rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                answered === o.val && o.val === "A" && "border-accent-green bg-accent-green/15 text-accent-green",
                answered === o.val && o.val === "B" && "border-accent-red bg-accent-red/15 text-accent-red",
                answered && answered !== o.val && "border-white/10 text-slate-500")}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={cn("rounded-2xl border p-5 sm:p-6",
              answered === "A" ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
            <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
              {answered === "A" ? (
                <>Correct. Scenario A used a disciplined, evidence-based process — even though the
                outcome was negative. A profitable result does not validate the reasoning that produced
                it. Scenario B doubled by luck, not by sound analysis.</>
              ) : (
                <>Scenario B had the better outcome, but the worse process. The investor risked
                everything on a rumor. A different roll of the dice could have meant total loss.
                Evaluate decisions by their reasoning, not only by their outcome.</>
              )}
            </p>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-300">
              A profitable result does not validate the reasoning that produced it. Over many decisions,
              sound process produces better risk-adjusted outcomes than impulsive speculation — even if
              any single gamble can succeed by chance.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
