"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type ProjectKey =
  | "restaurants"
  | "fab"
  | "drug"
  | "datacenter"
  | "acquisition";

type Project = {
  id: ProjectKey;
  label: string;
  shortLabel: string;
  blurb: string;
  rows: {
    initial: string;
    cashflows: string;
    risk: string;
    performance: string;
  };
};

const PROJECTS: Project[] = [
  {
    id: "restaurants",
    label: "Opening 100 restaurants",
    shortLabel: "Restaurants",
    blurb: "A chain announces a multi-year store-opening program.",
    rows: {
      initial:
        "Construction, equipment, leasehold improvements, pre-opening expenses, and working capital per location.",
      cashflows:
        "Incremental restaurant revenue minus food and labor costs, occupancy, maintenance spending, royalties, and taxes.",
      risk:
        "Sensitivity to consumer demand, recessions, competition, food-cost inflation, and local execution.",
      performance:
        "Opening cost per store, sales per store, restaurant-level margin, maturation period, closures, and cash return on development capital.",
    },
  },
  {
    id: "fab",
    label: "Constructing a semiconductor fab",
    shortLabel: "Semiconductor fab",
    blurb: "A chip company commits to a multi-billion-dollar manufacturing plant.",
    rows: {
      initial:
        "Land, building, clean-room equipment, tool installation, and pre-production qualification spending.",
      cashflows:
        "Wafer sales minus operating costs, yield losses, technology refresh spending, and capacity-expansion follow-on investment.",
      risk:
        "Technology obsolescence, demand cycles, selling-price erosion, geopolitical exposure, and yield ramp risk.",
      performance:
        "Construction timing, production capacity, manufacturing yield, utilization, unit selling prices, and incremental free cash flow.",
    },
  },
  {
    id: "drug",
    label: "Developing a pharmaceutical drug",
    shortLabel: "Drug program",
    blurb: "A biotech advances a clinical-stage molecule through trials.",
    rows: {
      initial:
        "Pre-clinical work, clinical trial costs, regulatory submissions, and manufacturing scale-up.",
      cashflows:
        "Future product sales (or milestone and royalty payments) minus continued development, commercialization, and ongoing R&D.",
      risk:
        "Trial failure, regulatory rejection, competitive therapies, patent challenges, and reimbursement uncertainty.",
      performance:
        "Development-stage milestones, trial results, regulatory progress, remaining cost, probability of approval, and commercial sales trajectory.",
    },
  },
  {
    id: "datacenter",
    label: "Building data centers",
    shortLabel: "Data centers",
    blurb: "A technology company expands cloud infrastructure capacity.",
    rows: {
      initial:
        "Land, buildings, power infrastructure, servers, networking gear, and cooling systems.",
      cashflows:
        "Cloud and hosting revenue minus power, staffing, maintenance, and continuous hardware refresh spending.",
      risk:
        "Demand for compute, power availability and cost, technology shifts, customer concentration, and capacity utilization.",
      performance:
        "Capacity brought online, utilization, revenue per megawatt, operating margin, and capital intensity per unit of revenue.",
    },
  },
  {
    id: "acquisition",
    label: "Acquiring another company",
    shortLabel: "Acquisition",
    blurb: "A buyer announces a transaction to purchase a target.",
    rows: {
      initial:
        "Purchase price, transaction fees, integration spending, and any debt assumed or refinanced.",
      cashflows:
        "Target's future cash flows, plus or minus cost and revenue synergies, minus integration costs and dis-synergies.",
      risk:
        "Integration execution, customer retention, cultural fit, premium paid, financing risk, and competitive response.",
      performance:
        "Purchase price and premium, synergy realization, integration costs, customer retention, margin movement, and post-acquisition ROIC.",
    },
  },
];

const LABELS = [
  { key: "initial", title: "Initial investment", tone: "amber" as const },
  { key: "cashflows", title: "Future cash flows", tone: "green" as const },
  { key: "risk", title: "Project risk", tone: "red" as const },
  { key: "performance", title: "Project performance", tone: "cyan" as const },
];

const toneText: Record<string, string> = {
  amber: "text-accent-amber",
  green: "text-accent-green",
  red: "text-accent-red",
  cyan: "text-accent-cyan",
};
const toneDot: Record<string, string> = {
  amber: "bg-accent-amber",
  green: "bg-accent-green",
  red: "bg-accent-red",
  cyan: "bg-accent-cyan",
};

export default function ProjectTranslationMap() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<ProjectKey>("restaurants");
  const project = PROJECTS.find((p) => p.id === active)!;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Choose an investment type
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Investment type">
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active === p.id}
              onClick={() => setActive(p.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                active === p.id
                  ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                  : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
              )}
            >
              {p.shortLabel}
            </button>
          ))}
        </div>
        <p className="ops-body mt-4 text-[16px] leading-[1.6] text-slate-200">
          <span className="text-white">{project.label}.</span> {project.blurb}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : undefined}
            transition={{ duration: 0.25 }}
            className="md:col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {LABELS.map((label) => (
              <div
                key={label.key}
                className="rounded-2xl border border-white/12 bg-ink-950/40 p-5"
              >
                <div className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", toneDot[label.tone])} aria-hidden />
                  <span
                    className={cn(
                      "font-mono text-[11px] uppercase tracking-[0.16em]",
                      toneText[label.tone],
                    )}
                  >
                    {label.title}
                  </span>
                </div>
                <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
                  {project.rows[label.key as keyof Project["rows"]]}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.7] text-slate-100">
          The textbook terms — initial investment, future cash flows, project risk, project
          performance — are universal. What changes from one investment to the next is{" "}
          <span className="text-white">which operating metrics</span> carry the economic
          information. A restaurant investor watches same-store sales; a fab investor watches
          yield and utilization; a drug investor watches trial endpoints.
        </p>
      </div>
    </div>
  );
}
