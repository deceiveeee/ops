"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function AcquisitionPriceVsValue() {
  const [standalone, setStandalone] = useState(800);
  const [synergies, setSynergies] = useState(150);
  const [integrationCost, setIntegrationCost] = useState(0);
  const [price, setPrice] = useState(1000);

  const totalValue = standalone + synergies - integrationCost;
  const npv = totalValue - price;
  const npvPositive = npv > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Slider label="Target standalone value" value={standalone} min={400} max={1500} step={10} prefix="$" suffix="M" onChange={setStandalone} />
          <Slider label="Synergy value" value={synergies} min={0} max={400} step={10} prefix="$" suffix="M" onChange={setSynergies} />
          <Slider label="Integration cost" value={integrationCost} min={0} max={200} step={5} prefix="$" suffix="M" onChange={setIntegrationCost} />
          <Slider label="Purchase price" value={price} min={500} max={2000} step={10} prefix="$" suffix="M" onChange={setPrice} />
        </div>
      </div>

      {/* Calculation */}
      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>
              {String.raw`\text{Value acquired} = \$${fmt(standalone)} + \$${fmt(synergies)} - \$${fmt(integrationCost)} = \$${fmt(totalValue)}\,\text{M}`}
            </BlockMath>
          </div>
          <div className={cn(
            "rounded-xl border px-4 py-3",
            npvPositive ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]",
          )}>
            <BlockMath>
              {String.raw`NPV = \$${fmt(totalValue)} - \$${fmt(price)} = \$${fmt(npv)}\,\text{M}`}
            </BlockMath>
          </div>
        </div>
      </div>

      {/* Visual */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-green">
            Value acquired
          </div>
          <div className="mt-2 font-mono text-[24px] tabular-nums text-white">${fmt(totalValue)}M</div>
          <div className="mt-2 space-y-1 text-[13px] text-slate-300">
            <div className="flex justify-between"><span>Standalone</span><span className="font-mono">${fmt(standalone)}M</span></div>
            <div className="flex justify-between"><span>Synergies</span><span className="font-mono">+${fmt(synergies)}M</span></div>
            {integrationCost > 0 && <div className="flex justify-between"><span>Integration</span><span className="font-mono">−${fmt(integrationCost)}M</span></div>}
          </div>
        </div>
        <div className="rounded-xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-red">
            Price paid
          </div>
          <div className="mt-2 font-mono text-[24px] tabular-nums text-white">${fmt(price)}M</div>
          <div className="mt-2 text-[13px] text-slate-300">
            The premium over standalone value:{" "}
            <span className="font-mono text-white">${fmt(price - standalone)}M</span>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        npvPositive ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]",
      )}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {npvPositive ? (
            <>
              The acquisition creates an estimated <span className="text-accent-green">${fmt(npv)}M</span> of
              value — the combined standalone and synergy value exceeds the price paid.
            </>
          ) : (
            <>
              The acquisition destroys an estimated{" "}
              <span className="text-accent-red">${fmt(Math.abs(npv))}M</span> of value. The buyer
              paid more than the acquired cash flows and synergies were worth.
            </>
          )}{" "}
          The acquisition may increase revenue, total earnings, market share, or EPS — but it can
          still destroy value if the price exceeds the economic value acquired.
        </p>
      </div>

      {/* Three questions */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="space-y-3">
          {[
            { q: "Did the target make money?", a: "Possibly — the target has positive standalone cash flows." },
            { q: "Did the acquisition create value?", a: npvPositive ? "Yes, under these assumptions." : "No — the price exceeded the value acquired." },
            { q: "Are these the same question?", a: "No. A target can be profitable while the acquisition destroys value, because value creation depends on the price paid relative to the value acquired." },
          ].map((x) => (
            <div key={x.q} className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">{x.q}</div>
              <p className="ops-body mt-1.5 text-[14px] leading-[1.6] text-slate-200">{x.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, suffix, prefix, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}
