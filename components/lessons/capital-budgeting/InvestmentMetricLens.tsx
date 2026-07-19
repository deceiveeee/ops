"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type MetricKey = "npv" | "irr" | "payback" | "pi" | "eps" | "roic";

type Metric = {
  key: MetricKey;
  label: string;
  shortLabel: string;
  result: string;
  question: string;
  reveals: string;
  omits: string;
  supports: "supports" | "complicates";
  tone: "amber" | "cyan" | "green" | "purple" | "red" | "slate";
};

const METRICS: Metric[] = [
  {
    key: "npv", label: "NPV", shortLabel: "NPV",
    result: "+$15M",
    question: "How many dollars of economic value are expected to be created?",
    reveals: "Total estimated value creation after accounting for cash flow, timing, risk, and scale.",
    omits: "Nothing fundamental — NPV is the primary economic measure. It does depend on uncertain estimates.",
    supports: "supports",
    tone: "amber",
  },
  {
    key: "irr", label: "IRR", shortLabel: "IRR",
    result: "14%",
    question: "What percentage return is implied by the forecast cash flows?",
    reveals: "The implied return exceeds the 10% required return, confirming the NPV conclusion.",
    omits: "Does not measure total value — a high IRR on a small project creates little value.",
    supports: "supports",
    tone: "cyan",
  },
  {
    key: "payback", label: "Payback", shortLabel: "Payback",
    result: "5 years",
    question: "How quickly is the invested capital recovered?",
    reveals: "Capital remains exposed for five years. This highlights liquidity and forecasting dependence.",
    omits: "Ignores cash flows after recovery and the time value of money within the payback period.",
    supports: "complicates",
    tone: "green",
  },
  {
    key: "pi", label: "Profitability index", shortLabel: "PI",
    result: "1.15",
    question: "How much present value is produced per dollar invested?",
    reveals: "$1.15 of present value per $1 committed. Capital efficiency is positive but modest.",
    omits: "Does not measure total value. PI can misrank mutually exclusive projects of different scale.",
    supports: "supports",
    tone: "purple",
  },
  {
    key: "eps", label: "EPS effect (Year 1)", shortLabel: "EPS",
    result: "−2%",
    question: "How does the decision affect near-term accounting earnings per share?",
    reveals: "Near-term accounting dilution. This may reflect ramp-up costs and pre-opening expenses.",
    omits: "Accounting result, not economic value. Near-term dilution does not prove long-term value destruction.",
    supports: "complicates",
    tone: "red",
  },
  {
    key: "roic", label: "Long-run ROIC", shortLabel: "ROIC",
    result: "13%",
    question: "What operating return is being earned relative to invested capital?",
    reveals: "Expected long-run operating return exceeds the 10% cost of capital by 3 percentage points.",
    omits: "Forward-looking estimate, not realized performance. Aggregate ROIC mixes old and new investments.",
    supports: "supports",
    tone: "slate",
  },
];

const toneText: Record<string, string> = {
  amber: "text-accent-amber", cyan: "text-accent-cyan", green: "text-accent-green",
  purple: "text-accent-purple", red: "text-accent-red", slate: "text-white",
};
const toneBorder: Record<string, string> = {
  amber: "border-accent-amber/40", cyan: "border-accent-cyan/40", green: "border-accent-green/40",
  purple: "border-accent-purple/40", red: "border-accent-red/40", slate: "border-white/30",
};

export default function InvestmentMetricLens() {
  const [active, setActive] = useState<MetricKey>("npv");
  const m = METRICS.find((x) => x.key === active)!;

  return (
    <div className="space-y-6">
      {/* Program summary */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Restaurant expansion program
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Initial capital" value="$100M" />
          <Stat label="PV of cash flows" value="$115M" />
          <Stat label="Required return" value="10%" />
        </div>
      </div>

      {/* Metric selector */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="tablist" aria-label="Metric lens">
        {METRICS.map((metric) => (
          <button
            key={metric.key} type="button" role="tab"
            aria-selected={active === metric.key}
            onClick={() => setActive(metric.key)}
            className={cn(
              "rounded-xl border p-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              active === metric.key
                ? cn(toneBorder[metric.tone], "bg-white/[0.06]")
                : "border-white/10 bg-white/[0.02] hover:border-white/25",
            )}
          >
            <div className={cn("font-mono text-[10px] uppercase tracking-[0.14em]",
              active === metric.key ? toneText[metric.tone] : "text-slate-400")}>
              {metric.shortLabel}
            </div>
            <div className="mt-1 font-mono text-[16px] tabular-nums text-white">{metric.result}</div>
          </button>
        ))}
      </div>

      {/* Active metric detail */}
      <div className={cn("rounded-2xl border p-5 sm:p-6", toneBorder[m.tone], "bg-white/[0.03]")}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className={cn("font-mono text-[12px] uppercase tracking-[0.16em]", toneText[m.tone])}>
            {m.label}
          </span>
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
            m.supports === "supports"
              ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
              : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
          )}>
            {m.supports === "supports" ? "Supports thesis" : "Complicates thesis"}
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Question answered
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-[1.6] text-white">{m.question}</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-accent-green/20 bg-accent-green/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green">
              What it reveals
            </div>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-100">{m.reveals}</p>
          </div>
          <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-red">
              What it omits
            </div>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-100">{m.omits}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-ink-950/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-[15px] text-white">{value}</div>
    </div>
  );
}
