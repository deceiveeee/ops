"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 1) { return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }

export default function CoastalKitchenAcquisitionModel() {
  const [price, setPrice] = useState(300);
  const [standalone, setStandalone] = useState(235);
  const [synergies, setSynergies] = useState(25);
  const [synergyProb, setSynergyProb] = useState(70);
  const [integration, setIntegration] = useState(40);
  const [discountRate, setDiscountRate] = useState(10.5);

  // PV of synergies (simplified: perpetuity at discount rate)
  const synergyPV = synergies > 0 && discountRate > 0
    ? (synergies * (synergyProb / 100)) / (discountRate / 100)
    : 0;
  const totalValue = standalone + synergyPV - integration;
  const npv = totalValue - price;
  const premium = price - standalone;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
        <p className="font-sans text-[12px] uppercase tracking-[0.14em] text-accent-amber">Simplified instructional model</p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Slider label="Purchase price" value={price} min={150} max={500} step={10} prefix="$" suffix="M" onChange={setPrice} tag="disclosed" />
          <Slider label="Standalone target value" value={standalone} min={100} max={400} step={5} prefix="$" suffix="M" onChange={setStandalone} tag="investor est." />
          <Slider label="Annual cost synergies" value={synergies} min={0} max={50} step={1} prefix="$" suffix="M" onChange={setSynergies} tag="mgmt forecast" />
          <Slider label="Synergy realization prob." value={synergyProb} min={20} max={100} step={5} suffix="%" onChange={setSynergyProb} tag="assumption" />
          <Slider label="Integration cost" value={integration} min={10} max={100} step={5} prefix="$" suffix="M" onChange={setIntegration} tag="disclosed" />
          <Slider label="Discount rate" value={discountRate} min={7} max={15} step={0.5} suffix="%" onChange={setDiscountRate} tag="assumption" />
        </div>
      </div>

      {/* Calculation */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`PV_{\text{synergies}} = \frac{\$${synergies} \times ${synergyProb}\%}{${discountRate}\%} = \$${fmt(synergyPV)}\,\text{M}`}</BlockMath>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`\text{Total value} = \$${fmt(standalone)} + \$${fmt(synergyPV)} - \$${fmt(integration)} = \$${fmt(totalValue)}\,\text{M}`}</BlockMath>
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
        <Readout label="Premium paid" value={`$${fmt(premium)}M`} tone="amber" />
        <Readout label="EPS accretion (Yr 2)" value="+3%" tone="amber" />
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        npv > 0 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {npv > 0
            ? <>Under these assumptions, the acquisition creates an estimated <span className="text-accent-green">${fmt(npv)}M</span> of value.</>
            : <>The target may be profitable and strategically interesting. The acquisition still{" "}
            <span className="text-accent-red">destroys ${fmt(Math.abs(npv))}M</span> of estimated value
            because Meridian pays more than the standalone business and achievable synergies are worth.
            EPS is accretive — but EPS accretion does not override negative NPV.</>}
        </p>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix, prefix, onChange, tag }: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void; tag?: string;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label} {tag && <span className="ml-1 text-[9px] text-accent-cyan">{tag}</span>}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`} />
    </div>
  );
}
function Readout({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "green" | "red" | "amber" }) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : tone === "amber" ? "text-accent-amber" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
