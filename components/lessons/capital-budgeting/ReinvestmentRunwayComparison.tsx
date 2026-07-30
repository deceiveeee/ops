"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function ReinvestmentRunwayComparison() {
  const [returnA, setReturnA] = useState(25);
  const [capitalA, setCapitalA] = useState(10);
  const [returnB, setReturnB] = useState(18);
  const [capitalB, setCapitalB] = useState(1000);
  const [years, setYears] = useState(10);
  const [required, setRequired] = useState(10);

  const excessA = Math.max(0, returnA - required) / 100;
  const excessB = Math.max(0, returnB - required) / 100;
  const annualA = excessA * capitalA;
  const annualB = excessB * capitalB;
  // Simplified: approximate value creation ≈ annual excess return × years (no discounting for simplicity)
  const valueA = annualA * years;
  const valueB = annualB * years;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Slider label="Required return" value={required} min={5} max={20} step={0.5} suffix="%" onChange={setRequired} />
          <Slider label="Runway (years)" value={years} min={3} max={20} step={1} onChange={setYears} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Company A */}
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Company A · high return, small scale</div>
          <div className="mt-3 space-y-3">
            <Slider label="Incremental return" value={returnA} min={5} max={40} step={1} suffix="%" onChange={setReturnA} />
            <Slider label="Capital deployed / yr" value={capitalA} min={1} max={100} step={1} prefix="$" suffix="M" onChange={setCapitalA} />
          </div>
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[13px]">
            <div className="flex justify-between"><span className="text-slate-400">Excess return</span><span className="font-sans text-white">{fmt(returnA - required)}%</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Annual value creation</span><span className="font-sans text-accent-green">${fmt(annualA)}M/yr</span></div>
            <div className="flex justify-between"><span className="text-slate-400">{years}-yr value capacity</span><span className="font-sans text-accent-green">${fmt(valueA)}M</span></div>
          </div>
        </div>
        {/* Company B */}
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-amber">Company B · moderate return, large scale</div>
          <div className="mt-3 space-y-3">
            <Slider label="Incremental return" value={returnB} min={5} max={40} step={1} suffix="%" onChange={setReturnB} />
            <Slider label="Capital deployed / yr" value={capitalB} min={100} max={3000} step={50} prefix="$" suffix="M" onChange={setCapitalB} />
          </div>
          <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[13px]">
            <div className="flex justify-between"><span className="text-slate-400">Excess return</span><span className="font-sans text-white">{fmt(returnB - required)}%</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Annual value creation</span><span className="font-sans text-accent-green">${fmt(annualB)}M/yr</span></div>
            <div className="flex justify-between"><span className="text-slate-400">{years}-yr value capacity</span><span className="font-sans text-accent-green">${fmt(valueB)}M</span></div>
          </div>
        </div>
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6", valueB > valueA ? "border-accent-amber/25 bg-accent-amber/[0.05]" : "border-accent-cyan/25 bg-accent-cyan/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {valueB > valueA ? (
            <>Company A has a higher return ({returnA}%), but Company B creates <span className="text-white">${fmt(valueB)}M</span> vs
            ${fmt(valueA)}M over {years} years because it can deploy far more capital. A high return on a
            very small opportunity may create less total value than a moderately high return sustained
            across a large capital base.</>
          ) : (
            <>Company A creates more value here despite its smaller scale, because its excess return is high
            enough to compensate. Scale matters — but only when the return on capital exceeds the cost of capital.</>
          )}
        </p>
        <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-400">
          Simplified model: no discounting, constant returns, no taxes. Real analysis requires
          discounting and testing whether returns decline as scale increases.
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
