"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type MetricKey = "npv" | "irr" | "payback" | "eps" | "roic";

const METRICS: Record<MetricKey, { result: string; question: string; reveals: string; omits: string; tone: string }> = {
  npv: { result: "−$35M", question: "How many dollars of value are created?", reveals: "Estimated value destruction. The acquisition is economically unattractive.", omits: "Nothing fundamental — NPV is the primary measure. It depends on uncertain estimates.", tone: "amber" },
  irr: { result: "8.5%", question: "What percentage return is implied?", reveals: "Below the 10.5% required return. Confirms the NPV conclusion.", omits: "Does not measure total value destroyed.", tone: "cyan" },
  payback: { result: "7 years", question: "How long is capital exposed?", reveals: "Capital remains committed for a relatively long period before recovery.", omits: "Ignores time value and post-payback cash flows.", tone: "green" },
  eps: { result: "+3% (Yr 2)", question: "How does this affect near-term EPS?", reveals: "Accounting earnings per share increase. The deal looks good on an earnings basis.", omits: "Does not prove the price was economically attractive. EPS is an accounting result.", tone: "purple" },
  roic: { result: "8.8%", question: "What operating return is earned?", reveals: "Expected post-deal ROIC remains below the 9% cost of capital.", omits: "Accounting measure that may not capture full cash-flow timing.", tone: "red" },
};

const toneText: Record<string, string> = { amber: "text-accent-amber", cyan: "text-accent-cyan", green: "text-accent-green", purple: "text-accent-purple", red: "text-accent-red" };
const toneBorder: Record<string, string> = { amber: "border-accent-amber/40", cyan: "border-accent-cyan/40", green: "border-accent-green/40", purple: "border-accent-purple/40", red: "border-accent-red/40" };

export default function CoastalMetricsLens() {
  const [active, setActive] = useState<MetricKey>("npv");
  const m = METRICS[active];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="tablist" aria-label="Metric lens">
        {(Object.keys(METRICS) as MetricKey[]).map((key) => (
          <button key={key} type="button" role="tab" aria-selected={active === key}
            onClick={() => setActive(key)}
            className={cn("rounded-xl border p-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              active === key ? cn(toneBorder[METRICS[key].tone], "bg-white/[0.06]") : "border-white/10 bg-white/[0.02] hover:border-white/25")}>
            <div className={cn("font-sans text-[10px] uppercase tracking-[0.14em]", active === key ? toneText[METRICS[key].tone] : "text-slate-400")}>{key.toUpperCase()}</div>
            <div className="mt-1 font-sans text-[15px] tabular-nums text-white">{METRICS[key].result}</div>
          </button>
        ))}
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6", toneBorder[m.tone], "bg-white/[0.03]")}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className={cn("font-sans text-[12px] uppercase tracking-[0.16em]", toneText[m.tone])}>{active.toUpperCase()}</span>
          <span className="font-sans text-[18px] tabular-nums text-white">{m.result}</span>
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Question answered</div>
          <p className="ops-body mt-1.5 text-[15px] leading-[1.6] text-white">{m.question}</p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-accent-green/20 bg-accent-green/[0.04] p-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-green">Reveals</div>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-100">{m.reveals}</p>
          </div>
          <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-red">Omits</div>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-100">{m.omits}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          EPS accretion does not override negative NPV. The acquisition is EPS-accretive (+3%) yet
          destroys an estimated $35M of value. The metrics disagree because they answer different
          questions — and NPV is the one that measures economic value creation.
        </p>
      </div>
    </div>
  );
}
