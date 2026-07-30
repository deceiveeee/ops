"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 0) { return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`; }

export default function MeridianDebtAndLiquidity() {
  const [repayment, setRepayment] = useState(150);
  const [interestRate, setInterestRate] = useState(7);
  const [refinancingBenefit, setRefinancingBenefit] = useState(3);
  const [minLiquidity, setMinLiquidity] = useState(80);
  const [downturnCF, setDownturnCF] = useState(200);

  const annualBenefit = repayment * ((interestRate + refinancingBenefit) / 100);
  const remainingDebt = 1200 - repayment;
  const economicBenefit = annualBenefit * 5; // simplified 5-year PV approximation
  const npv = economicBenefit - repayment;
  const liquidityAfter = 600 - 100 - repayment; // after maintenance
  const liquidityAdequate = liquidityAfter >= minLiquidity;
  const downturnCoverage = liquidityAfter / Math.max(downturnCF, 1);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Slider label="Debt repayment" value={repayment} min={0} max={300} step={10} prefix="$" suffix="M" onChange={setRepayment} />
          <Slider label="Interest rate" value={interestRate} min={3} max={12} step={0.5} suffix="%" onChange={setInterestRate} />
          <Slider label="Refinancing-risk benefit" value={refinancingBenefit} min={0} max={8} step={0.5} suffix="%" onChange={setRefinancingBenefit} />
          <Slider label="Minimum liquidity reserve" value={minLiquidity} min={40} max={150} step={10} prefix="$" suffix="M" onChange={setMinLiquidity} />
          <Slider label="Downturn annual CF need" value={downturnCF} min={50} max={400} step={10} prefix="$" suffix="M" onChange={setDownturnCF} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Readout label="Annual benefit" value={`${fmt(annualBenefit)}M/yr`} tone="green" />
        <Readout label="Remaining debt" value={`${fmt(remainingDebt)}M`} />
        <Readout label="Liquidity after" value={`${fmt(liquidityAfter)}M`} tone={liquidityAdequate ? "green" : "red"} />
        <Readout label="Downturn coverage" value={`${(downturnCoverage * 100).toFixed(0)}%`} tone={downturnCoverage > 0.3 ? "green" : "red"} />
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        liquidityAdequate ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          Debt repayment is not &ldquo;doing nothing.&rdquo; Repaying ${repayment}M reduces annual
          interest and refinancing exposure by an estimated <span className="text-accent-green">${fmt(annualBenefit)}M/year</span>.
          The simplified 5-year economic benefit is approximately ${fmt(economicBenefit)}M.
          {!liquidityAdequate && <> However, liquidity falls below the prudent minimum — the repayment
          may be too aggressive.</>}
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-300">
          The benefit includes interest savings, reduced distress risk, and improved flexibility — not
          just the interest rate. Compare this with the NPV of store investment, the buyback, and the
          acquisition.
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
function Readout({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "green" | "red" }) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
