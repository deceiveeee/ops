"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type DestKey = "maintain" | "grow" | "acquire" | "balance" | "distribute" | "cash";

const DESTINATIONS: Record<DestKey, {
  name: string; shortName: string; examples: string[]; valueInfo: string; requiredInfo: string; mistake: string; tone: string;
}> = {
  maintain: {
    name: "Maintain current operations", shortName: "Maintain",
    examples: ["Replacement equipment", "Safety and repairs", "Required software", "Regulatory spending"],
    valueInfo: "Protects current cash flows. Underfunding maintenance can erode existing value.",
    requiredInfo: "What is the minimum required to sustain capacity? What happens if spending is deferred?",
    mistake: "Treating all capital expenditure as optional discretionary spending.",
    tone: "cyan",
  },
  grow: {
    name: "Organic growth", shortName: "Grow",
    examples: ["New stores", "Factories", "Data centers", "Products", "R&D"],
    valueInfo: "Creates value only when incremental returns exceed the required return.",
    requiredInfo: "What return on new capital? How much can be deployed? How long will opportunities last?",
    mistake: "Assuming all growth spending creates value because revenue increases.",
    tone: "amber",
  },
  acquire: {
    name: "Acquisitions", shortName: "Acquire",
    examples: ["Businesses", "Technologies", "Assets", "Customer bases"],
    valueInfo: "A good target can still destroy value if the buyer overpays.",
    requiredInfo: "What is the target worth standalone? What synergies are credible? What price?",
    mistake: "Focusing on target quality while ignoring the premium paid.",
    tone: "purple",
  },
  balance: {
    name: "Balance-sheet strengthening", shortName: "Balance sheet",
    examples: ["Debt repayment", "Pension funding", "Liquidity reserves"],
    valueInfo: "Reduces interest expense, distress risk, and financing constraints.",
    requiredInfo: "What interest and distress costs are being reduced? What is the opportunity cost?",
    mistake: "Treating debt repayment as unproductive because revenue does not increase.",
    tone: "green",
  },
  distribute: {
    name: "Shareholder distributions", shortName: "Distribute",
    examples: ["Dividends", "Share repurchases"],
    valueInfo: "Transfers cash to shareholders. May protect value by preventing poor reinvestment.",
    requiredInfo: "Are there better internal uses? Is the stock undervalued (buyback)? Is the dividend sustainable?",
    mistake: "Treating EPS accretion from buybacks as proof of value creation.",
    tone: "red",
  },
  cash: {
    name: "Cash retention", shortName: "Retain",
    examples: ["Future opportunities", "Downturn protection", "Strategic flexibility"],
    valueInfo: "Provides resilience and optionality. Can become inefficient without a credible purpose.",
    requiredInfo: "What commitments justify the balance? Is the amount above prudent minimums?",
    mistake: "Assuming all cash is wasted, or conversely, that any accumulation is prudent.",
    tone: "slate",
  },
};

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan", amber: "text-accent-amber", purple: "text-accent-purple",
  green: "text-accent-green", red: "text-accent-red", slate: "text-white",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/40", amber: "border-accent-amber/40", purple: "border-accent-purple/40",
  green: "border-accent-green/40", red: "border-accent-red/40", slate: "border-white/30",
};

export default function CorporateCashAllocationMap() {
  const [active, setActive] = useState<DestKey>("maintain");
  const d = DESTINATIONS[active];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-slate-100">
          Cash used for one alternative is{" "}
          <span className="text-white">unavailable</span> for another. Capital allocation is an
          opportunity-cost problem.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="tablist" aria-label="Capital destination">
        {(Object.keys(DESTINATIONS) as DestKey[]).map((key) => (
          <button
            key={key} type="button" role="tab"
            aria-selected={active === key}
            onClick={() => setActive(key)}
            className={cn(
              "rounded-xl border p-3 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              active === key ? cn(toneBorder[DESTINATIONS[key].tone], "bg-white/[0.06]") : "border-white/10 bg-white/[0.02] hover:border-white/25",
            )}
          >
            <div className={cn("font-mono text-[10px] uppercase tracking-[0.14em]",
              active === key ? toneText[DESTINATIONS[key].tone] : "text-slate-400")}>
              {DESTINATIONS[key].shortName}
            </div>
          </button>
        ))}
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6", toneBorder[d.tone], "bg-white/[0.03]")}>
        <div className={cn("font-mono text-[12px] uppercase tracking-[0.16em]", toneText[d.tone])}>{d.name}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {d.examples.map((e) => (
            <span key={e} className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[12px] text-slate-200">{e}</span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-accent-green/20 bg-accent-green/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green">Value it may create</div>
            <p className="ops-body mt-1.5 text-[13px] leading-[1.55] text-slate-100">{d.valueInfo}</p>
          </div>
          <div className="rounded-xl border border-accent-amber/20 bg-accent-amber/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber">Information required</div>
            <p className="ops-body mt-1.5 text-[13px] leading-[1.55] text-slate-100">{d.requiredInfo}</p>
          </div>
          <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-red">Common mistake</div>
            <p className="ops-body mt-1.5 text-[13px] leading-[1.55] text-slate-100">{d.mistake}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
