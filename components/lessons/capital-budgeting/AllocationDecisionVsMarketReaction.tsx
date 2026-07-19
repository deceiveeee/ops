"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function AllocationDecisionVsMarketReaction() {
  const [expectedBuyback, setExpectedBuyback] = useState(500);
  const [actualBuyback, setActualBuyback] = useState(300);
  const [expectedGrowth, setExpectedGrowth] = useState(400);
  const [actualGrowth, setActualGrowth] = useState(400);

  const buybackSurprise = actualBuyback - expectedBuyback;
  const growthSurprise = actualGrowth - expectedGrowth;
  const positiveSurprise = buybackSurprise > 0 || growthSurprise > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Buyback decision</div>
            <div className="mt-2 space-y-2">
              <Slider label="Market expected" value={expectedBuyback} min={0} max={1000} step={50} prefix="$" suffix="M" onChange={setExpectedBuyback} />
              <Slider label="Company announced" value={actualBuyback} min={0} max={1000} step={50} prefix="$" suffix="M" onChange={setActualBuyback} />
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Growth investment</div>
            <div className="mt-2 space-y-2">
              <Slider label="Market expected" value={expectedGrowth} min={0} max={800} step={50} prefix="$" suffix="M" onChange={setExpectedGrowth} />
              <Slider label="Company announced" value={actualGrowth} min={0} max={800} step={50} prefix="$" suffix="M" onChange={setActualGrowth} />
            </div>
          </div>
        </div>
      </div>

      {/* Surprise panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={cn("rounded-2xl border p-5",
          buybackSurprise >= 0 ? "border-accent-green/25 bg-accent-green/[0.04]" : "border-accent-red/25 bg-accent-red/[0.04]")}>
          <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]",
            buybackSurprise >= 0 ? "text-accent-green" : "text-accent-red")}>Buyback surprise</div>
          <div className="mt-2 font-mono text-[22px] tabular-nums text-white">
            {buybackSurprise >= 0 ? "+" : "−"}${fmt(Math.abs(buybackSurprise))}M
          </div>
          <p className="ops-body mt-1.5 text-[13px] leading-[1.5] text-slate-300">
            {buybackSurprise >= 0 ? "More buyback than expected — positive surprise." : "Less buyback than expected — negative surprise."}
          </p>
        </div>
        <div className={cn("rounded-2xl border p-5",
          growthSurprise >= 0 ? "border-accent-green/25 bg-accent-green/[0.04]" : "border-accent-red/25 bg-accent-red/[0.04]")}>
          <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]",
            growthSurprise >= 0 ? "text-accent-green" : "text-accent-red")}>Growth surprise</div>
          <div className="mt-2 font-mono text-[22px] tabular-nums text-white">
            {growthSurprise >= 0 ? "+" : "−"}${fmt(Math.abs(growthSurprise))}M
          </div>
          <p className="ops-body mt-1.5 text-[13px] leading-[1.5] text-slate-300">
            {growthSurprise >= 0 ? "More growth investment than expected — positive surprise." : "Less growth investment than expected — negative surprise."}
          </p>
        </div>
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        positiveSurprise ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {positiveSurprise ? (
            <>The allocation is more shareholder-friendly or growth-oriented than expected. Stock
            reaction may be <span className="text-white">positive</span> — even if the decision itself
            is only mediocre in absolute terms.</>
          ) : (
            <>The allocation disappoints relative to expectations. Stock reaction may be{" "}
            <span className="text-white">negative</span> — even if the capital-allocation decisions
            are individually sensible.</>
          )}{" "}
          Investors must separate corporate value creation from the surprise relative to expectations.
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
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span><span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`} />
    </div>
  );
}
