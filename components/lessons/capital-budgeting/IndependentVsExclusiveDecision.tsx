"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Verdict = "accept-all" | "select-highest" | "reject-all" | "more-info";

type Case = {
  id: string;
  title: string;
  blurb: string;
  options: { name: string; npv: string; irr?: string }[];
  correct: Verdict;
  explanation: string;
};

const CASES: Case[] = [
  {
    id: "c1",
    title: "Two independent product launches",
    blurb: "The company can undertake both a software upgrade (NPV +$2M) and a hardware refresh (NPV +$5M). Neither prevents the other.",
    options: [
      { name: "Software upgrade", npv: "+$2M" },
      { name: "Hardware refresh", npv: "+$5M" },
    ],
    correct: "accept-all",
    explanation: "Independent positive-NPV investments should both be accepted, subject to practical financing and implementation constraints. There is no need to choose between them.",
  },
  {
    id: "c2",
    title: "Two factory locations (mutually exclusive)",
    blurb: "The company needs one new factory. Site A has NPV +$8M (IRR 28%). Site B has NPV +$15M (IRR 19%). Only one can be built.",
    options: [
      { name: "Site A", npv: "+$8M", irr: "28%" },
      { name: "Site B", npv: "+$15M", irr: "19%" },
    ],
    correct: "select-highest",
    explanation: "For mutually exclusive investments, select the highest positive NPV: Site B (+$15M). Site A has a higher IRR, but IRR can mislead when scale differs. NPV measures total value created.",
  },
  {
    id: "c3",
    title: "Three R&D projects, only one is positive",
    blurb: "Project X: NPV −$3M. Project Y: NPV +$4M. Project Z: NPV −$1M. The company can undertake any combination.",
    options: [
      { name: "Project X", npv: "−$3M" },
      { name: "Project Y", npv: "+$4M" },
      { name: "Project Z", npv: "−$1M" },
    ],
    correct: "reject-all",
    explanation: "Reject X and Z (negative NPV). Accept only Y. The NPV rule accepts positive-NPV projects and rejects negative-NPV projects — independently of each other.",
  },
  {
    id: "c4",
    title: "Two acquisition targets",
    blurb: "The company can acquire Target A (NPV +$20M) or Target B (NPV +$12M), but only has financing capacity for one.",
    options: [
      { name: "Target A", npv: "+$20M" },
      { name: "Target B", npv: "+$12M" },
    ],
    correct: "more-info",
    explanation: "If they are truly mutually exclusive due to financing constraints, select Target A (higher NPV). But the financing constraint itself may warrant investigation — the constraint could reflect a capital-structure decision rather than a project-quality decision.",
  },
];

const OPTIONS: { key: Verdict; label: string }[] = [
  { key: "accept-all", label: "Accept all positive-NPV choices" },
  { key: "select-highest", label: "Select one highest-NPV alternative" },
  { key: "reject-all", label: "Reject all" },
  { key: "more-info", label: "Request more information" },
];

export default function IndependentVsExclusiveDecision() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Verdict>>({});

  const assign = (id: string, v: Verdict) => setPicks((p) => ({ ...p, [id]: v }));

  return (
    <div className="space-y-6">
      {/* Rules */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-green">
            Independent investments
          </div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Undertaking one does not prevent undertaking the other. Accept each positive-NPV
            investment, subject to practical constraints.
          </p>
        </div>
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">
            Mutually exclusive investments
          </div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Choosing one prevents choosing another. Select the alternative with the highest positive
            NPV — not necessarily the highest IRR, shortest payback, or lowest upfront cost.
          </p>
        </div>
      </div>

      {/* Cases */}
      <div className="space-y-4">
        {CASES.map((c) => {
          const pick = picks[c.id];
          const isCorrect = pick === c.correct;
          return (
            <div key={c.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <div className="font-display text-[15px] font-medium text-white">{c.title}</div>
              <p className="ops-body mt-1 text-[14px] leading-[1.55] text-slate-300">{c.blurb}</p>

              {/* Options */}
              <div className="mt-3 flex flex-wrap gap-3">
                {c.options.map((o) => (
                  <div key={o.name} className={cn(
                    "rounded-lg border px-3 py-2 text-[13px]",
                    o.npv.startsWith("+") ? "border-accent-green/25 bg-accent-green/[0.04]" : "border-accent-red/25 bg-accent-red/[0.04]",
                  )}>
                    <span className="text-slate-200">{o.name}</span>
                    <span className={cn("ml-2 font-mono", o.npv.startsWith("+") ? "text-accent-green" : "text-accent-red")}>{o.npv}</span>
                    {o.irr && <span className="ml-2 font-mono text-slate-400">IRR {o.irr}</span>}
                  </div>
                ))}
              </div>

              {/* Decision selector */}
              <div className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button
                      key={o.key} type="button"
                      onClick={() => assign(c.id, o.key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                        !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                        isPicked && pick === c.correct && "border-accent-green bg-accent-green/15 text-accent-green",
                        isPicked && pick !== c.correct && "border-accent-red bg-accent-red/15 text-accent-red",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {pick && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <p className={cn("mt-2.5 text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                      {isCorrect ? "✓ " : "✗ Reconsider — "}
                      <span className="text-slate-300">{c.explanation}</span>
                    </p>
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
