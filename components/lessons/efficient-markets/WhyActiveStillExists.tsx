"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const FUNCTIONS = [
  {
    key: "f1", title: "A · Price discovery",
    detail: "Active research and trading help incorporate information into prices.",
    paradox: "If nobody analyzed securities because markets were efficient, who would perform the analysis that keeps prices informative?",
  },
  {
    key: "f2", title: "B · Specialized or less-followed markets",
    detail: "Less competition may create more opportunity — but also greater uncertainty, trading difficulty, and risk.",
    examples: ["Illiquid securities", "Complex companies", "Small or less-covered markets", "Distressed assets", "Forced institutional transactions"],
  },
  {
    key: "f3", title: "C · Investor-specific objectives",
    detail: "Active management may serve a specific portfolio need, not just maximum return.",
    examples: ["Unusual cash-flow needs", "Concentrated employer stock", "Tax considerations", "Liability matching", "Ethical restrictions", "Downside-risk limits"],
  },
  {
    key: "f4", title: "D · Risk management",
    detail: "An active strategy may seek less leverage, lower concentration, capital preservation, or downside control.",
    examples: ["Lower industry concentration", "Reduced leverage exposure", "Capital preservation", "Liquidity management"],
  },
];

export default function WhyActiveStillExists() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>("f1");

  return (
    <div className="space-y-3">
      {FUNCTIONS.map((f) => {
        const isOpen = open === f.key;
        return (
          <div key={f.key} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <button type="button" aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : f.key)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
              <span className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[10px]",
                isOpen ? "border-accent-cyan text-accent-cyan" : "border-white/20 text-slate-400")}>
                {f.title.charAt(0)}
              </span>
              <span className="flex-1 text-[15px] font-medium text-white">{f.title}</span>
              <span className={cn("font-sans text-sm text-accent-cyan transition-transform", isOpen && "rotate-45")} aria-hidden>+</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-3">
                    <p className="ops-body text-[15px] leading-[1.6] text-slate-100">{f.detail}</p>
                    {"paradox" in f && f.paradox && (
                      <div className="rounded-lg border border-accent-amber/25 bg-accent-amber/[0.05] px-3 py-2.5">
                        <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-amber">The paradox</span>
                        <p className="mt-1 text-[14px] leading-[1.55] text-slate-100">{f.paradox}</p>
                      </div>
                    )}
                    {"examples" in f && f.examples && (
                      <div className="flex flex-wrap gap-2">
                        {f.examples.map((e) => (
                          <span key={e} className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[12px] text-slate-200">{e}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
