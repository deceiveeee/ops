"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { q: "What is the manager's benchmark?", detail: "Without a benchmark, there is no way to separate market exposure from manager-added return." },
  { q: "What risks differ from that benchmark?", detail: "Sector concentration, size bias, cash positioning, and factor exposures all create risk differences that explain performance." },
  { q: "How much return is explained by beta or other systematic exposures?", detail: "If most of the return comes from market exposure (beta), the manager is selling cheap beta at an expensive price." },
  { q: "What is the claimed source of alpha?", detail: "The manager should articulate a specific, testable reason why their departures from the benchmark should add value." },
  { q: "Is that source credible and repeatable?", detail: "A one-time event is not a repeatable edge. The process should work across multiple opportunities and time periods." },
  { q: "What are the total fees and trading costs?", detail: "Include management fees, operating expenses, bid-ask spreads, brokerage costs, market impact, and tax consequences of turnover." },
  { q: "How long is the performance record?", detail: "Short records are dominated by luck. A meaningful track record spans multiple years and market environments." },
  { q: "Did the strategy operate across different market environments?", detail: "A strategy that only worked in bull markets may fail when conditions change. Look for performance across expansions, contractions, and sector rotations." },
  { q: "Has the strategy changed after poor performance?", detail: "If the manager keeps shifting the stated approach, the historical record may not describe what the manager will do next." },
  { q: "Could the same exposure be obtained more cheaply?", detail: "Many active strategies replicate systematic factor exposures that are available through low-cost index funds." },
  { q: "How much capital can the strategy manage before its advantage weakens?", detail: "Capacity constraints erode edges. A strategy that worked with $100M may struggle with $10B." },
  { q: "What evidence would indicate that the manager has lost the edge?", detail: "Define in advance what would cause you to exit. Without a selling discipline, hope replaces analysis." },
];

const STORAGE_KEY = "ops-m9-l92-checklist";

export default function ManagerEvaluationChecklist() {
  const reduce = useReducedMotion();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  useEffect(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setChecked(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = { ...prev, [i]: !prev[i] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const completed = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Manager evaluation checklist</span>
          <span className="font-sans text-[12px] text-slate-400">{completed}/{ITEMS.length}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
          <div className="h-full rounded-full bg-accent-cyan transition-all duration-300" style={{ width: `${(completed / ITEMS.length) * 100}%` }} />
        </div>
      </div>

      <div className="space-y-2.5">
        {ITEMS.map((item, i) => {
          const isChecked = checked[i];
          return (
            <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
              <button type="button" onClick={() => toggle(i)}
                className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                aria-pressed={isChecked}>
                <span className={cn("mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border text-[11px] transition-colors",
                  isChecked ? "border-accent-green bg-accent-green/20 text-accent-green" : "border-white/20 text-transparent")}>✓</span>
                <span className={cn("flex-1 text-[14px] leading-[1.5]", isChecked ? "text-slate-300" : "text-white")}>{item.q}</span>
                <span className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center font-sans text-xs text-accent-cyan transition-transform", isChecked && "rotate-45")} aria-hidden>+</span>
              </button>
              <AnimatePresence initial={false}>
                {isChecked && (
                  <motion.div initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <p className="ops-body px-5 pb-4 pl-14 text-[13px] leading-[1.6] text-slate-300">{item.detail}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
