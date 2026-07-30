"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function DebtRepaymentOpportunityCost() {
  const [debt, setDebt] = useState(200);
  const [borrowingCost, setBorrowingCost] = useState(8);
  const [distressBenefit, setDistressBenefit] = useState(2);
  const [altReturn, setAltReturn] = useState(6);

  // Annual benefit of repayment: interest saved + distress-risk reduction
  const annualBenefit = debt * ((borrowingCost + distressBenefit) / 100);
  const altBenefit = debt * (altReturn / 100);
  const debtBetter = annualBenefit > altBenefit;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Slider label="Debt amount" value={debt} min={50} max={500} step={10} prefix="$" suffix="M" onChange={setDebt} />
          <Slider label="Borrowing cost" value={borrowingCost} min={2} max={15} step={0.5} suffix="%" onChange={setBorrowingCost} />
          <Slider label="Distress-risk benefit" value={distressBenefit} min={0} max={8} step={0.5} suffix="%" onChange={setDistressBenefit} />
          <Slider label="Alternative investment return" value={altReturn} min={2} max={20} step={0.5} suffix="%" onChange={setAltReturn} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={cn("rounded-2xl border p-5",
          debtBetter ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-white/12 bg-white/[0.02]")}>
          <div className={cn("font-sans text-[11px] uppercase tracking-[0.16em]",
            debtBetter ? "text-accent-green" : "text-slate-400")}>Repay debt</div>
          <div className="mt-2 font-sans text-[24px] tabular-nums text-white">${fmt(annualBenefit)}M/yr</div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
            Interest saving ({borrowingCost}%) + distress-risk reduction ({distressBenefit}%) on ${debt}M.
          </p>
        </div>
        <div className={cn("rounded-2xl border p-5",
          !debtBetter ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-white/12 bg-white/[0.02]")}>
          <div className={cn("font-sans text-[11px] uppercase tracking-[0.16em]",
            !debtBetter ? "text-accent-green" : "text-slate-400")}>Invest instead</div>
          <div className="mt-2 font-sans text-[24px] tabular-nums text-white">${fmt(altBenefit)}M/yr</div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
            Expected return of {altReturn}% on ${debt}M deployed elsewhere.
          </p>
        </div>
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        debtBetter ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-amber/25 bg-accent-amber/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {debtBetter ? (
            <>Debt repayment appears more attractive. The combined benefit of interest savings and
            distress-risk reduction (${fmt(annualBenefit)}M/yr) exceeds the expected return from
            investing the same capital (${fmt(altBenefit)}M/yr).</>
          ) : (
            <>The alternative investment appears more attractive (${fmt(altBenefit)}M/yr vs.
            ${fmt(annualBenefit)}M/yr for debt repayment). But this comparison depends on the risk
            of the alternative — a certain interest saving may be preferable to a risky expected return.</>
          )}
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          Debt repayment is not automatically optimal. A stable company with inexpensive debt and
          strong positive-NPV opportunities may rationally maintain leverage. The relevant comparison
          is the economic benefit of repayment relative to other uses, adjusted for risk.
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
