"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

const RATE = 10; // the single market-determined rate, shown identically in every perspective

type PerspectiveId = "investor" | "valuation" | "company";

const PERSPECTIVES: Record<
  PerspectiveId,
  {
    id: PerspectiveId;
    name: string;
    role: string;
    question: string;
    statement: string;
    tone: "cyan" | "amber" | "green";
    n: number;
  }
> = {
  investor: {
    id: "investor",
    name: "Required return",
    role: "Investor perspective",
    question: "What return do I require for bearing this risk?",
    statement:
      "As an investor, this is the expected return you demand before committing capital to an investment with this level of systematic risk.",
    tone: "cyan",
    n: 1,
  },
  valuation: {
    id: "valuation",
    name: "Discount rate",
    role: "Valuation perspective",
    question: "At what rate should I discount these risky future cash flows?",
    statement:
      "When valuing future cash flows, the same rate is the rate you use to bring them back to present value. A higher rate produces a lower present value.",
    tone: "amber",
    n: 2,
  },
  company: {
    id: "company",
    name: "Opportunity cost of capital",
    role: "Company perspective",
    question:
      "What return must this investment offer to justify using investors' capital?",
    statement:
      "From inside the company, this is the hurdle a project must beat. It is the return investors could have earned elsewhere at comparable risk, so using their capital costs exactly this much.",
    tone: "green",
    n: 3,
  },
};

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
  green: "text-accent-green",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/40",
  amber: "border-accent-amber/40",
  green: "border-accent-green/40",
};
const toneBg: Record<string, string> = {
  cyan: "bg-accent-cyan/10",
  amber: "bg-accent-amber/10",
  green: "bg-accent-green/10",
};

export default function ThreePerspectivesRate() {
  const [active, setActive] = useState<PerspectiveId>("investor");
  const p = PERSPECTIVES[active];

  return (
    <div className="space-y-6">
      {/* The shared rate — unchanged across perspectives */}
      <div className="rounded-2xl border border-white/12 bg-ink-950/50 p-6 text-center">
        <div className="font-sans text-[11px] uppercase tracking-[0.18em] text-slate-400">
          The market-determined rate
        </div>
        <div className="mt-3">
          <BlockMath>{String.raw`r = 10\%`}</BlockMath>
        </div>
        <p className="ops-body mx-auto mt-3 max-w-xl text-[14px] leading-[1.6] text-slate-300">
          This number does not change as you switch perspectives. Only the question it
          answers changes.
        </p>
      </div>

      {/* Perspective selector */}
      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        role="tablist"
        aria-label="Perspective on the same rate"
      >
        {(Object.keys(PERSPECTIVES) as PerspectiveId[]).map((key) => {
          const item = PERSPECTIVES[key];
          const isActive = key === active;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(key)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                isActive
                  ? cn(toneBorder[item.tone], toneBg[item.tone])
                  : "border-white/12 bg-white/[0.02] hover:border-white/25",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border font-sans text-[11px]",
                    isActive
                      ? cn(toneBorder[item.tone], toneText[item.tone])
                      : "border-white/20 text-slate-400",
                  )}
                >
                  {item.n}
                </span>
                <span
                  className={cn(
                    "font-sans text-[11px] uppercase tracking-[0.14em]",
                    isActive ? toneText[item.tone] : "text-slate-400",
                  )}
                >
                  {item.role}
                </span>
              </div>
              <div className="mt-2 font-display text-[18px] font-medium tracking-tight text-white">
                {item.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active perspective detail */}
      <div className={cn("rounded-2xl border bg-white/[0.03] p-6", toneBorder[p.tone])}>
        <div className={cn("font-sans text-[12px] uppercase tracking-[0.16em]", toneText[p.tone])}>
          {p.role}
        </div>
        <p className="ops-body mt-3 text-[20px] leading-[1.45] text-white sm:text-[22px]">
          {p.question}
        </p>
        <div className="mt-5 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
          <div className="text-slate-200">
            <BlockMath>{String.raw`r = 10\%`}</BlockMath>
          </div>
        </div>
        <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-200">
          {p.statement}
        </p>
      </div>

      {/* The unifying statement */}
      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-6 sm:p-7">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          One rate, three viewpoints
        </div>
        <div className="mt-4 max-w-3xl">
          <BlockMath>
            {String.raw`\underbrace{\text{required return}}_{\text{investor}} \;=\; \underbrace{\text{discount rate}}_{\text{valuation}} \;=\; \underbrace{\text{opportunity cost of capital}}_{\text{company}}`}
          </BlockMath>
        </div>
        <p className="ops-body mt-4 max-w-3xl text-[15px] leading-[1.7] text-slate-100">
          These are not three independently selected rates. They are three interpretations
          of the same market-determined opportunity cost. No separate formula is needed for
          each &mdash; the rate is set by what investors require for comparable systematic
          risk, and that one number is then read as a required return, a discount rate, or a
          cost of capital depending on who is asking.
        </p>
      </div>
    </div>
  );
}
