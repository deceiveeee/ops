"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function AcquisitionCapitalAllocationCase() {
  const [targetValue, setTargetValue] = useState(800);
  const [synergyValue, setSynergyValue] = useState(250);
  const [integrationCost, setIntegrationCost] = useState(50);
  const [price, setPrice] = useState(1100);

  const totalValue = targetValue + synergyValue - integrationCost;
  const npv = totalValue - price;
  const premium = price - targetValue;
  const synergyPct = price > 0 ? (synergyValue / price) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Slider label="Target standalone value" value={targetValue} min={300} max={1500} step={25} prefix="$" suffix="M" onChange={setTargetValue} />
          <Slider label="Synergy value" value={synergyValue} min={0} max={500} step={25} prefix="$" suffix="M" onChange={setSynergyValue} />
          <Slider label="Integration cost" value={integrationCost} min={0} max={200} step={10} prefix="$" suffix="M" onChange={setIntegrationCost} />
          <Slider label="Purchase price" value={price} min={500} max={2000} step={25} prefix="$" suffix="M" onChange={setPrice} />
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`\text{Total value} = \$${fmt(targetValue)} + \$${fmt(synergyValue)} - \$${fmt(integrationCost)} = \$${fmt(totalValue)}\,\text{M}`}</BlockMath>
          </div>
          <div className={cn("rounded-xl border px-4 py-3",
            npv > 0 ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]")}>
            <BlockMath>{String.raw`NPV = \$${fmt(totalValue)} - \$${fmt(price)} = \$${fmt(npv)}\,\text{M}`}</BlockMath>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Readout label="Total value received" value={`$${fmt(totalValue)}M`} tone="green" />
        <Readout label="NPV" value={`$${fmt(npv)}M`} tone={npv > 0 ? "green" : "red"} />
        <Readout label="Premium over standalone" value={`$${fmt(premium)}M`} tone="amber" />
        <Readout label="Synergy % of price" value={`${fmt(synergyPct)}%`} tone="amber" />
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        npv > 0 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {npv > 0 ? (
            <>The acquisition creates an estimated <span className="text-accent-green">${fmt(npv)}M</span> of value.
            The price paid is justified by the combination of standalone value and synergies.</>
          ) : (
            <>The target can be a strong business, but the buyer destroys an estimated{" "}
            <span className="text-accent-red">${fmt(Math.abs(npv))}M</span> of value by paying ${fmt(premium)}M more
            than the standalone target is worth. Only {fmt(synergyPct)}% of the price is justified by synergies.</>
          )}
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Required investor questions</div>
          <ul className="mt-2 space-y-1.5">
            {["What premium was paid over standalone value?", "How much value depends on synergies?", "Are synergies cost-based or revenue-based?", "Are integration costs fully included?", "Did prior acquisitions meet their targets?", "Were past goodwill impairments recorded?"].map((q) => (
              <li key={q} className="flex items-start gap-2 text-[13px] leading-[1.5] text-slate-200">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{q}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix, prefix, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span><span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`} />
    </div>
  );
}
function Readout({ label, value, tone = "neutral" }: {
  label: string; value: string; tone?: "neutral" | "green" | "red" | "amber";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : tone === "amber" ? "text-accent-amber" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
