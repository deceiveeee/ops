"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type MetricKey = "revenue" | "profit" | "eps" | "payback" | "roic" | "npv";

type Metric = {
  key: MetricKey;
  label: string;
  reveals: string;
  omits: string;
  result: string;
  tone: "cyan" | "amber" | "green" | "purple" | "red" | "slate";
};

const METRICS: Metric[] = [
  {
    key: "revenue",
    label: "Revenue growth",
    reveals: "Sales expansion — the project increases top-line revenue.",
    omits: "Capital required, cost, timing, and risk. Revenue growth can occur while value is destroyed.",
    result: "+15% revenue",
    tone: "cyan",
  },
  {
    key: "profit",
    label: "Accounting profit",
    reveals: "Recognized earnings under accounting rules.",
    omits: "May differ from cash-flow timing and capital investment. Depreciation and accruals distort the picture.",
    result: "+$5M net income",
    tone: "amber",
  },
  {
    key: "eps",
    label: "EPS accretion",
    reveals: "Effect on earnings per share — useful for equity-market signaling.",
    omits: "Does not prove the buyer paid an economically attractive price. EPS can rise while value falls.",
    result: "+3% EPS",
    tone: "purple",
  },
  {
    key: "payback",
    label: "Payback period",
    reveals: "How quickly capital is nominally recovered.",
    omits: "Ignores some later cash flows and may ignore the time value of money.",
    result: "3.2 years",
    tone: "green",
  },
  {
    key: "roic",
    label: "ROIC",
    reveals: "Operating return relative to invested capital — useful for comparing efficiency.",
    omits: "May not fully capture the timing and pattern of all project cash flows.",
    result: "12% ROIC",
    tone: "red",
  },
  {
    key: "npv",
    label: "NPV",
    reveals: "Integrates cash flow, timing, risk, and scale into one value-creation measure.",
    omits: "Still depends on uncertain estimates. The output is only as reliable as the assumptions.",
    result: "+$3.5M NPV",
    tone: "slate",
  },
];

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan", amber: "text-accent-amber", green: "text-accent-green",
  purple: "text-accent-purple", red: "text-accent-red", slate: "text-white",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/40", amber: "border-accent-amber/40", green: "border-accent-green/40",
  purple: "border-accent-purple/40", red: "border-accent-red/40", slate: "border-accent-amber/50",
};

export default function MetricComparisonLens() {
  const [active, setActive] = useState<MetricKey>("npv");
  const m = METRICS.find((x) => x.key === active)!;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Same investment, six metrics
        </div>
        <p className="ops-body mt-2 text-[14px] leading-[1.55] text-slate-300">
          A restaurant expansion project shows different results under each metric. Switch lenses to
          see what each one reveals — and what it misses.
        </p>

        {/* Metric selector */}
        <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Metric lens">
          {METRICS.map((metric) => (
            <button
              key={metric.key} type="button" role="tab"
              aria-selected={active === metric.key}
              onClick={() => setActive(metric.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                active === metric.key
                  ? cn(toneBorder[metric.tone], toneText[metric.tone], "bg-white/[0.04]")
                  : "border-white/15 text-slate-300 hover:border-white/30",
              )}
            >
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active metric detail */}
      <div className={cn("rounded-2xl border p-5 sm:p-6", toneBorder[m.tone], "bg-white/[0.03]")}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className={cn("font-sans text-[12px] uppercase tracking-[0.16em]", toneText[m.tone])}>
            {m.label}
          </span>
          <span className="font-sans text-[18px] tabular-nums text-white">{m.result}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-accent-green/20 bg-accent-green/[0.04] p-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-green">
              What it reveals
            </div>
            <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">{m.reveals}</p>
          </div>
          <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-red">
              What it omits
            </div>
            <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">{m.omits}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          These metrics provide <span className="text-white">evidence</span>. NPV supplies the{" "}
          <span className="text-white">economic decision framework</span>. None of them should be
          ignored — but none of them alone proves whether the investment creates value.
        </p>
      </div>
    </div>
  );
}
