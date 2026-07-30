"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type RiskClass = "idiosyncratic" | "systematic" | "mixed";

type Milestone = {
  id: string;
  name: string;
  shortName: string;
  remainingCost: string;
  uncertainty: string;
  conditionalValue: string;
  probToCommercial: string;
  riskClass: RiskClass;
  seekDisclosure: string;
};

const MILESTONES: Milestone[] = [
  {
    id: "preclinical",
    name: "Preclinical",
    shortName: "Preclinical",
    remainingCost: "$15M",
    uncertainty: "Does the molecule show activity and acceptable safety in animal models?",
    conditionalValue: "Very low — far from revenue; science-driven",
    probToCommercial: "Very low",
    riskClass: "idiosyncratic",
    seekDisclosure: "Preclinical data, mechanism of action, animal safety profile, competitive landscape.",
  },
  {
    id: "phase1",
    name: "Phase 1",
    shortName: "Phase 1",
    remainingCost: "$25M",
    uncertainty: "Is the drug safe in humans at therapeutic doses?",
    conditionalValue: "Low — safety established, efficacy unproven",
    probToCommercial: "Low",
    riskClass: "idiosyncratic",
    seekDisclosure: "Trial design, enrollment timeline, safety endpoints, dose-ranging results.",
  },
  {
    id: "phase2",
    name: "Phase 2",
    shortName: "Phase 2",
    remainingCost: "$40M",
    uncertainty: "Does the drug show efficacy in the target patient population?",
    conditionalValue: "Moderate — proof-of-concept begins to reveal commercial potential",
    probToCommercial: "Moderate",
    riskClass: "mixed",
    seekDisclosure: "Efficacy endpoints, effect size, patient population definition, comparator data.",
  },
  {
    id: "phase3",
    name: "Phase 3",
    shortName: "Phase 3",
    remainingCost: "$80M",
    uncertainty: "Does efficacy hold in a large, controlled trial? Safety profile remains acceptable?",
    conditionalValue: "Higher — regulatory and commercial picture sharpens",
    probToCommercial: "Higher",
    riskClass: "mixed",
    seekDisclosure: "Trial enrollment, interim results, regulatory interactions, safety database size.",
  },
  {
    id: "regulatory",
    name: "Regulatory decision",
    shortName: "Regulatory",
    remainingCost: "$10M",
    uncertainty: "Will the agency approve the drug, and with what label?",
    conditionalValue: "High conditional on approval — commercial-stage risk now dominates",
    probToCommercial: "High",
    riskClass: "idiosyncratic",
    seekDisclosure: "Filing acceptance, review timeline, advisory committee, labeling restrictions.",
  },
  {
    id: "launch",
    name: "Launch",
    shortName: "Launch",
    remainingCost: "$50M",
    uncertainty: "Will payers reimburse? Will physicians adopt? Will competitors respond?",
    conditionalValue: "Commercial value now driven by market factors",
    probToCommercial: "Approved — commercial execution begins",
    riskClass: "systematic",
    seekDisclosure: "Pricing, reimbursement status, formulary placement, launch geography, sales force scale.",
  },
  {
    id: "mature",
    name: "Mature sales",
    shortName: "Mature",
    remainingCost: "$20M/yr",
    uncertainty: "Demand, pricing pressure, competition, patent expiry timeline.",
    conditionalValue: "Steady-state cash flows — systematic risk now the dominant priced factor",
    probToCommercial: "Commercialized",
    riskClass: "systematic",
    seekDisclosure: "Prescription volumes, market share, price trends, competitive entries, patent life.",
  },
];

const RISK_INFO: Record<RiskClass, { label: string; tone: "cyan" | "red" | "amber"; desc: string }> = {
  idiosyncratic: {
    label: "Primarily idiosyncratic",
    tone: "cyan",
    desc: "Largely unrelated to broad market conditions. Affects probability-weighted cash flow more than the discount rate.",
  },
  systematic: {
    label: "Primarily systematic",
    tone: "red",
    desc: "Moves with market conditions. Affects the discount rate for commercial cash flows.",
  },
  mixed: {
    label: "Mixed",
    tone: "amber",
    desc: "Both idiosyncratic and systematic components. Requires careful decomposition.",
  },
};

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  red: "text-accent-red",
  amber: "text-accent-amber",
};
const toneDot: Record<string, string> = {
  cyan: "bg-accent-cyan",
  red: "bg-accent-red",
  amber: "bg-accent-amber",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/40",
  red: "border-accent-red/40",
  amber: "border-accent-amber/40",
};
const toneBorderSoft: Record<string, string> = {
  cyan: "border-accent-cyan/25",
  red: "border-accent-red/25",
  amber: "border-accent-amber/25",
};

export default function DrugMilestoneValuationTimeline() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string>("preclinical");
  const m = MILESTONES.find((x) => x.id === active)!;
  const activeIdx = MILESTONES.findIndex((x) => x.id === active);
  const risk = RISK_INFO[m.riskClass];

  return (
    <div className="space-y-6">
      {/* Timeline rail */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Pharmaceutical development timeline
        </div>
        <p className="ops-body mt-2 text-[13px] leading-[1.5] text-slate-400">
          Illustrative scenario. Probabilities and costs are teaching examples, not industry benchmarks.
        </p>

        {/* Horizontal milestone scroller */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {MILESTONES.map((ms, i) => (
            <button
              key={ms.id}
              type="button"
              onClick={() => setActive(ms.id)}
              className={cn(
                "flex flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border px-3 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                active === ms.id
                  ? "border-accent-amber/50 bg-accent-amber/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border font-sans text-[10px]",
                  active === ms.id
                    ? "border-accent-amber text-accent-amber"
                    : "border-white/20 text-slate-400",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("text-[12px] whitespace-nowrap", active === ms.id ? "text-white" : "text-slate-300")}>
                {ms.shortName}
              </span>
              <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[RISK_INFO[ms.riskClass].tone])} aria-hidden />
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent-amber transition-all duration-300"
            style={{ width: `${((activeIdx + 1) / MILESTONES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Active milestone detail */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : undefined}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-display text-[18px] font-medium text-white">
              {m.name}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sans text-[11px] uppercase tracking-[0.14em]",
                toneBorder[risk.tone],
                toneText[risk.tone],
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[risk.tone])} aria-hidden />
              {risk.label}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label="Remaining cost" value={m.remainingCost} />
            <Detail label="Probability to commercialization" value={m.probToCommercial} />
            <Detail label="Conditional value" value={m.conditionalValue} fullWidth />
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 p-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">
              Major uncertainty
            </div>
            <p className="ops-body mt-1.5 text-[15px] leading-[1.6] text-slate-100">
              {m.uncertainty}
            </p>
          </div>

          <div className={cn("mt-3 rounded-xl border p-4", toneBorderSoft[risk.tone])}>
            <div className={cn("font-sans text-[10px] uppercase tracking-[0.14em]", toneText[risk.tone])}>
              Risk classification
            </div>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-100">
              {risk.desc}
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 p-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">
              What an investor would seek
            </div>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-200">
              {m.seekDisclosure}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Key insight */}
      <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          A successful trial does not merely increase the probability of success. It can also{" "}
          <span className="text-white">change the project&apos;s remaining risk profile</span>. As
          the project moves from scientific uncertainty toward commercial market exposure, the
          dominant source of priced risk shifts — and the appropriate valuation treatment may shift
          with it.
        </p>
      </div>
    </div>
  );
}

function Detail({ label, value, fullWidth }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={cn("rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2.5", fullWidth && "sm:col-span-2")}>
      <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 text-[14px] text-slate-100">{value}</div>
    </div>
  );
}
