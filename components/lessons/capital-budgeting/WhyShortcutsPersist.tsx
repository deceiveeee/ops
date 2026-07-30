"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type ReasonKey = "communication" | "liquidity" | "uncertainty" | "constraints" | "monitoring" | "incentives";

const REASONS: Record<ReasonKey, { title: string; detail: string }> = {
  communication: {
    title: "Communication",
    detail: "\u201C20% IRR\u201D is easy to summarize. \u201CFive-year payback\u201D is intuitive. EPS accretion is familiar to public-company analysts. These metrics travel well in meetings and press releases.",
  },
  liquidity: {
    title: "Liquidity",
    detail: "Companies may care how quickly cash is recovered. A long-duration positive-NPV project may create financing pressure even when it is economically attractive.",
  },
  uncertainty: {
    title: "Forecast uncertainty",
    detail: "Distant cash flows are often harder to estimate. Payback highlights dependence on remote assumptions that may be less reliable.",
  },
  constraints: {
    title: "Capital constraints",
    detail: "Companies may not be able to fund every positive-NPV project. When capital is scarce, efficiency per dollar becomes relevant \u2014 though it does not replace NPV.",
  },
  monitoring: {
    title: "Performance monitoring",
    detail: "ROIC, EPS, and payback can help track how an investment is developing over time, long after the initial NPV estimate was made.",
  },
  incentives: {
    title: "Organizational incentives",
    detail: "Managers may prefer projects that improve visible short-term metrics. A project that boosts next year\u2019s EPS or ROIC may be favored even if its NPV is marginal.",
  },
};

export default function WhyShortcutsPersist() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<ReasonKey | null>("communication");

  return (
    <div className="space-y-3">
      {(Object.keys(REASONS) as ReasonKey[]).map((key, i) => {
        const r = REASONS[key];
        const isOpen = open === key;
        return (
          <div key={key} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : key)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
            >
              <span className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[10px]",
                isOpen ? "border-accent-amber text-accent-amber" : "border-white/20 text-slate-400",
              )}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 text-[15px] font-medium text-white">{r.title}</span>
              <span className={cn("font-sans text-sm text-accent-amber transition-transform", isOpen && "rotate-45")} aria-hidden>+</span>
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
                  <p className="ops-body px-5 pb-5 text-[15px] leading-[1.7] text-slate-200">{r.detail}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] px-5 py-4">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          The problem is not that these measures contain no information. The problem is treating one
          narrow measure as if it answers the entire investment decision.
        </p>
      </div>
    </div>
  );
}
