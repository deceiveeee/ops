"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type StageKey = "development" | "commercial";

type RiskItem = { q: string };

const STAGES: Record<
  StageKey,
  {
    label: string;
    timelineLabel: string;
    tone: "cyan" | "amber";
    risks: RiskItem[];
  }
> = {
  development: {
    label: "Development stage",
    timelineLabel: "Clinical trials → regulatory review",
    tone: "cyan",
    risks: [
      { q: "Will clinical trials succeed?" },
      { q: "Will the drug meet safety and efficacy standards?" },
      { q: "Will regulators approve it?" },
      { q: "How much additional development spending will be required?" },
    ],
  },
  commercial: {
    label: "Commercial stage",
    timelineLabel: "Launch → mature sales",
    tone: "amber",
    risks: [
      { q: "How many patients will use the drug?" },
      { q: "What price will insurers accept?" },
      { q: "Will competitors launch substitutes?" },
      { q: "What manufacturing and marketing costs will be required?" },
      { q: "How will sales respond to economic and industry conditions?" },
    ],
  },
};

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/40",
  amber: "border-accent-amber/40",
};
const toneBg: Record<string, string> = {
  cyan: "bg-accent-cyan/10",
  amber: "bg-accent-amber/10",
};
const toneDot: Record<string, string> = {
  cyan: "bg-accent-cyan",
  amber: "bg-accent-amber",
};

type Choice = "same" | "different" | "not-sure";

export default function OneProjectDifferentStagesOpening() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<StageKey>("development");
  const [choice, setChoice] = useState<Choice | null>(null);
  const revealed = choice !== null;

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          One project, connected timeline
        </div>

        {/* Timeline visual */}
        <div className="mt-5 flex items-center gap-2">
          {(Object.keys(STAGES) as StageKey[]).map((key, i) => (
            <div key={key} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => setActive(key)}
                className={cn(
                  "flex-1 rounded-xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                  active === key
                    ? cn(toneBorder[STAGES[key].tone], toneBg[STAGES[key].tone])
                    : "border-white/12 bg-white/[0.02] hover:border-white/25",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", active === key ? toneDot[STAGES[key].tone] : "bg-white/30")} aria-hidden />
                  <span className={cn("font-mono text-[11px] uppercase tracking-[0.14em]", active === key ? toneText[STAGES[key].tone] : "text-slate-400")}>
                    {STAGES[key].label}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-[1.45] text-slate-300">
                  {STAGES[key].timelineLabel}
                </p>
              </button>
              {i === 0 && (
                <span className="hidden text-accent-amber sm:inline" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Active stage risks */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : undefined}
            transition={{ duration: 0.2 }}
            className={cn("mt-5 rounded-xl border p-5", toneBorder[STAGES[active].tone], "bg-white/[0.02]")}
          >
            <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]", toneText[STAGES[active].tone])}>
              {STAGES[active].label} · key uncertainties
            </div>
            <ul className="mt-3 space-y-2">
              {STAGES[active].risks.map((r) => (
                <li key={r.q} className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-slate-100">
                  <span className={cn("mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full", toneDot[STAGES[active].tone])} aria-hidden />
                  {r.q}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* The question */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
          The project is the same molecule from preclinical through mature sales. But the{" "}
          <span className="text-white">economic source of risk changes</span> across stages.
        </p>
        <p className="ops-body mt-3 text-[16px] leading-[1.6] text-slate-200">
          Should every stage automatically use the same discount rate?
        </p>

        {!revealed && (
          <div className="mt-4 flex flex-wrap gap-2">
            {([
              { id: "same", label: "Yes — one rate for the whole project" },
              { id: "different", label: "No — the risks look different" },
              { id: "not-sure", label: "Not sure yet" },
            ] as { id: Choice; label: string }[]).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChoice(c.id)}
                className="rounded-full border border-white/20 px-4 py-2 text-[14px] text-slate-200 transition-colors hover:border-accent-amber/60 hover:text-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {revealed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4"
          >
            <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
              A discount rate should reflect the risk of the{" "}
              <span className="text-white">cash flow being valued</span>. If the risk changes across
              stages, the appropriate rate may also change. The development stage is dominated by
              scientific and regulatory uncertainty; the commercial stage is dominated by demand,
              pricing, and competitive exposure.
            </p>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-300">
              The key question is not which stage is &ldquo;riskier&rdquo; in total — it is whether the{" "}
              <span className="text-white">source</span> of risk at each stage is economically
              different. This lesson builds the analytical tools to answer that.
            </p>
            <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-400">
              Note: the development stage is not automatically the highest-beta stage. Whether it
              carries high systematic risk depends on whether its outcomes move with broad market
              conditions — a question we examine next.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
