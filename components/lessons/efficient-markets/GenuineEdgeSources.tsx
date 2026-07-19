"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Edge = {
  key: string;
  title: string;
  definition: string;
  example: string;
  limitation: string;
  warning?: string;
};

const EDGES: Edge[] = [
  {
    key: "e1",
    title: "A · Better information",
    definition: "Access to material information before other investors.",
    example: "An industry insider who observes demand trends before they appear in public data.",
    limitation: "Trading on material nonpublic information may violate securities law and professional ethics. Legal informational advantages are rare and often short-lived.",
    warning: "Trading on material nonpublic information may be illegal and unethical.",
  },
  {
    key: "e2",
    title: "B · Better analysis",
    definition: "Interpreting public information more accurately or creatively than others.",
    example: "A deeper model of store-level economics that reveals margins are declining faster than the consensus assumes.",
    limitation: "If your interpretation is correct and valuable, others may eventually reach the same conclusion, compressing the advantage.",
  },
  {
    key: "e3",
    title: "C · Longer time horizon",
    definition: "The ability to tolerate short-term underperformance that other investors cannot.",
    example: "Holding an unloved asset for three years while waiting for a restructuring to play out.",
    limitation: "Being early is indistinguishable from being wrong for long periods. Capital may be locked up while better opportunities pass.",
  },
  {
    key: "e4",
    title: "D · Behavioral discipline",
    definition: "Remaining analytical during panic or excitement when others act emotionally.",
    example: "Buying high-quality assets during a market crash when most investors are selling in fear.",
    limitation: "Discipline alone does not guarantee correctness. You may be disciplined about a wrong thesis.",
  },
  {
    key: "e5",
    title: "E · Structural advantage",
    definition: "The ability to hold an illiquid, unpopular, or institutionally constrained asset that others cannot or will not own.",
    example: "Investing in a small-cap stock that is too illiquid for large institutions to hold meaningfully.",
    limitation: "Structural advantages often come with their own costs: illiquidity, higher fees, or limited ability to exit.",
  },
];

export default function GenuineEdgeSources() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {EDGES.map((e) => {
          const isOpen = active === e.key;
          return (
            <div key={e.key} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <button type="button" aria-expanded={isOpen}
                onClick={() => setActive(isOpen ? null : e.key)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                <span className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                  isOpen ? "border-accent-cyan text-accent-cyan" : "border-white/20 text-slate-400")}>
                  {e.title.charAt(0)}
                </span>
                <span className="flex-1 text-[15px] font-medium text-white">{e.title}</span>
                <span className={cn("font-mono text-sm text-accent-cyan transition-transform", isOpen && "rotate-45")} aria-hidden>+</span>
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
                      <p className="ops-body text-[15px] leading-[1.6] text-slate-100">{e.definition}</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border border-accent-green/20 bg-accent-green/[0.04] p-3">
                          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green">Example</div>
                          <p className="mt-1 text-[13px] leading-[1.55] text-slate-100">{e.example}</p>
                        </div>
                        <div className="rounded-lg border border-accent-red/20 bg-accent-red/[0.04] p-3">
                          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-red">Limitation</div>
                          <p className="mt-1 text-[13px] leading-[1.55] text-slate-100">{e.limitation}</p>
                        </div>
                      </div>
                      {e.warning && (
                        <div className="rounded-lg border border-accent-red/30 bg-accent-red/[0.06] px-3 py-2">
                          <p className="text-[13px] leading-[1.5] text-accent-red font-medium">⚠ {e.warning}</p>
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

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          Claiming an edge is easy. Demonstrating one is difficult.
        </p>
      </div>
    </div>
  );
}
