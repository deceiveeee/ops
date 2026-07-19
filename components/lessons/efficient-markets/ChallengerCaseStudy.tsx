"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export default function ChallengerCaseStudy() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  const STEPS = [
    {
      date: "January 28, 1986",
      title: "The disaster",
      text: "The space shuttle Challenger exploded 73 seconds after launch. The cause was not yet publicly established. Several publicly traded contractors were associated with the shuttle program.",
      detail: null as React.ReactNode,
    },
    {
      date: "Same day",
      title: "Market reaction",
      text: "Among the contractors, Morton Thiokol experienced the most severe stock-price decline — far more than what would be expected from the overall shuttle-program uncertainty alone.",
      detail: null as React.ReactNode,
    },
    {
      date: "The inference",
      title: "Decentralized information aggregation",
      text: "No single investor needed to possess the entire explanation. Engineers, suppliers, industry analysts, and investors familiar with shuttle components may each have held partial information. Their collective trading moved the price.",
      detail: (
        <ul className="mt-3 space-y-2">
          {[
            "Engineers who understood the O-ring design",
            "Suppliers familiar with component specifications",
            "Industry analysts tracking shuttle contractors",
            "Investors observing the actions of other informed traders",
          ].map((x) => (
            <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.55] text-slate-100">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{x}
            </li>
          ))}
        </ul>
      ),
    },
    {
      date: "Months later",
      title: "Official confirmation",
      text: "The Rogers Commission investigation identified the O-ring seal failure — associated with Morton Thiokol's booster rocket — as the cause. The price reaction had anticipated the direction of the finding.",
      detail: null as React.ReactNode,
    },
  ];

  const s = STEPS[step];

  return (
    <div className="space-y-6">
      {/* Original timeline (not reproducing the Elsevier chart) */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Original timeline
        </div>

        {/* Horizontal timeline */}
        <div className="mt-5 flex items-stretch gap-1">
          {STEPS.map((stepData, i) => (
            <button key={i} type="button"
              onClick={() => setStep(i)}
              className={cn(
                "flex-1 rounded-lg border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                step === i ? "border-accent-cyan/50 bg-accent-cyan/10" : "border-white/8 bg-white/[0.02] hover:border-white/20",
              )}>
              <div className={cn("font-mono text-[9px] uppercase tracking-[0.14em]",
                step === i ? "text-accent-cyan" : "text-slate-500")}>
                {i + 1}
              </div>
              <div className={cn("mt-0.5 text-[11px] leading-tight",
                step === i ? "text-white" : "text-slate-400")}>
                {stepData.date}
              </div>
            </button>
          ))}
        </div>

        {/* Simplified relative reaction visualization */}
        <div className="mt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Relative stock reaction (simplified, illustrative)
          </div>
          <div className="mt-2 space-y-1.5">
            {[
              { name: "Morton Thiokol", reaction: -18, width: 100 },
              { name: "Other contractors (average)", reaction: -3, width: 17 },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-40 flex-shrink-0 text-[12px] text-slate-300">{c.name}</div>
                <div className="relative h-6 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
                  <div className="absolute inset-y-0 right-1/2 flex items-center justify-start rounded-lg bg-accent-red/25 px-2"
                    style={{ width: `${c.width}%`, transform: "translateX(0)" }}>
                    <span className="font-mono text-[11px] text-accent-red">{c.reaction}%</span>
                  </div>
                  <div className="absolute inset-y-0 left-1/2 w-px bg-white/20" />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-[1.45] text-slate-500">
            Simplified illustrative visualization. Precise intraday values are not reproduced from the
            original source. Direction and relative magnitude are consistent with the MIT lecture
            discussion.
          </p>
        </div>
      </div>

      {/* Active step detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : undefined}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-accent-cyan/25 bg-white/[0.03] p-5 sm:p-6"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent-cyan/40 font-mono text-[11px] text-accent-cyan">
              {step + 1}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-cyan">{s.date}</span>
          </div>
          <h3 className="ops-section-title mt-3 text-[20px] text-white">{s.title}</h3>
          <p className="ops-body mt-2 text-[16px] leading-[1.65] text-slate-100">{s.text}</p>
          {s.detail}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button type="button" disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={cn("rounded-full border px-4 py-2 font-mono text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            step === 0 ? "border-white/10 text-slate-600" : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan")}>
          ← Previous
        </button>
        <span className="font-mono text-[12px] text-slate-400">{step + 1} / {STEPS.length}</span>
        <button type="button" disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          className={cn("rounded-full border px-4 py-2 font-mono text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            step === STEPS.length - 1 ? "border-white/10 text-slate-600" : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20")}>
          Next →
        </button>
      </div>

      {/* Important limitation */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          The market reaction was informative — it reflected revised expectations. But it was not
          legal proof. A price movement reflects the aggregate judgment of investors under uncertainty,
          not certainty.
        </p>
      </div>
    </div>
  );
}
