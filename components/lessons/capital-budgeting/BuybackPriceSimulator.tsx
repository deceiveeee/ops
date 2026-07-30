"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function BuybackPriceSimulator() {
  const [equityValue, setEquityValue] = useState(1000);
  const [shares, setShares] = useState(100);
  const [buybackAmount, setBuybackAmount] = useState(80);
  const [buybackPrice, setBuybackPrice] = useState(8);

  const intrinsicPerShare = equityValue / shares;
  const sharesRetired = buybackAmount / buybackPrice;
  const remainingEquity = equityValue - buybackAmount;
  const remainingShares = shares - sharesRetired;
  const newIntrinsicPerShare = remainingShares > 0 ? remainingEquity / remainingShares : 0;
  const valueChange = newIntrinsicPerShare - intrinsicPerShare;
  const valueChangePct = intrinsicPerShare > 0 ? (valueChange / intrinsicPerShare) * 100 : 0;
  const belowIntrinsic = buybackPrice < intrinsicPerShare;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Slider label="Intrinsic equity value" value={equityValue} min={200} max={2000} step={50} prefix="$" suffix="M" onChange={setEquityValue} />
          <Slider label="Shares outstanding (M)" value={shares} min={20} max={500} step={10} onChange={setShares} />
          <Slider label="Repurchase amount" value={buybackAmount} min={0} max={300} step={10} prefix="$" suffix="M" onChange={setBuybackAmount} />
          <Slider label="Repurchase price" value={buybackPrice} min={2} max={25} step={0.5} prefix="$" onChange={setBuybackPrice} />
        </div>
      </div>

      {/* Intrinsic value comparison */}
      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4 text-center">
            <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">Intrinsic value / share (before)</div>
            <div className="mt-1 font-sans text-[22px] text-white">${fmt(intrinsicPerShare)}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4 text-center">
            <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">Repurchase price</div>
            <div className={cn("mt-1 font-sans text-[22px]", belowIntrinsic ? "text-accent-green" : "text-accent-red")}>${fmt(buybackPrice)}</div>
          </div>
        </div>
      </div>

      {/* Result */}
      <div className={cn("rounded-2xl border p-5 sm:p-6",
        valueChange > 0 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`\text{New IV/share} = \frac{\$${fmt(remainingEquity)}\,\text{M}}{${fmt(remainingShares)}\,\text{M shares}} = \$${fmt(newIntrinsicPerShare)}`}</BlockMath>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Readout label="Shares retired" value={`${fmt(sharesRetired, 1)}M`} />
          <Readout label="Remaining shares" value={`${fmt(remainingShares, 1)}M`} />
          <Readout label="Value change / share" value={`${valueChange >= 0 ? "+" : "−"}$${fmt(Math.abs(valueChange))}`} tone={valueChange > 0 ? "green" : "red"} />
          <Readout label="Value change %" value={`${valueChange >= 0 ? "+" : ""}${fmt(valueChangePct)}%`} tone={valueChange > 0 ? "green" : "red"} />
        </div>
        <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
          {belowIntrinsic ? (
            <>Repurchasing at <span className="text-white">${fmt(buybackPrice)}</span> (below the
            <span className="text-white"> ${fmt(intrinsicPerShare)}</span> intrinsic value){" "}
            <span className="text-accent-green">benefits continuing shareholders</span> by {fmt(valueChangePct)}%.
            The company retires shares cheaply, concentrating the remaining equity among fewer holders.</>
          ) : (
            <>Repurchasing at <span className="text-white">${fmt(buybackPrice)}</span> (above the
            <span className="text-white"> ${fmt(intrinsicPerShare)}</span> intrinsic value){" "}
            <span className="text-accent-red">destroys value for continuing shareholders</span> by {fmt(Math.abs(valueChangePct))}%.
            The company overpays, transferring wealth to selling shareholders.</>
          )}
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          A repurchase transfers value among selling and continuing shareholders. The effect depends
          heavily on the price paid. Intrinsic value is uncertain — this model uses a simplified
          assumption and omits financing, taxes, and signaling effects.
        </p>
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
  label: string; value: string; tone?: "neutral" | "green" | "red";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
