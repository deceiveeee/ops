"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function CashReserveTradeoff() {
  const [volatility, setVolatility] = useState(40);
  const [debtMaturities, setDebtMaturities] = useState(30);
  const [commitments, setCommitments] = useState(50);
  const [financingAccess, setFinancingAccess] = useState(60);
  const [cashBalance, setCashBalance] = useState(200);

  // Simplified minimum reserve estimate (higher volatility/maturities/commitments → higher reserve)
  const minReserve = Math.round((volatility + debtMaturities + commitments) * (1 - financingAccess / 100) * 0.5);
  const excess = Math.max(0, cashBalance - minReserve);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
        <p className="font-sans text-[12px] uppercase tracking-[0.14em] text-accent-amber">
          Simplified analytical framework
        </p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Slider label="Operating volatility" value={volatility} min={10} max={100} step={5} suffix="%" onChange={setVolatility} />
          <Slider label="Debt maturity pressure" value={debtMaturities} min={0} max={100} step={5} suffix="%" onChange={setDebtMaturities} />
          <Slider label="Committed investment" value={commitments} min={0} max={100} step={5} suffix="%" onChange={setCommitments} />
          <Slider label="Financing access" value={financingAccess} min={10} max={100} step={5} suffix="%" onChange={setFinancingAccess} />
          <Slider label="Cash balance" value={cashBalance} min={50} max={500} step={10} prefix="$" suffix="M" onChange={setCashBalance} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-4">
          <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-accent-amber">Estimated minimum reserve</div>
          <div className="mt-1.5 font-sans text-[20px] text-white">${fmt(minReserve)}M</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">Current balance</div>
          <div className="mt-1.5 font-sans text-[20px] text-white">${fmt(cashBalance)}M</div>
        </div>
        <div className={cn("rounded-xl border p-4", excess > 0 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
          <div className={cn("font-sans text-[10px] uppercase tracking-[0.16em]", excess > 0 ? "text-accent-green" : "text-accent-red")}>{excess > 0 ? "Excess cash" : "Shortfall"}</div>
          <div className={cn("mt-1.5 font-sans text-[20px]", excess > 0 ? "text-accent-green" : "text-accent-red")}>${fmt(Math.abs(excess))}M</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-green">Benefits of holding cash</div>
          <ul className="mt-2 space-y-1.5">
            {["Liquidity and resilience", "Future opportunity capacity", "Downturn protection", "Regulatory or contractual flexibility", "Reduced dependence on external financing"].map((x) => (
              <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.5] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-red">Costs of holding cash</div>
          <ul className="mt-2 space-y-1.5">
            {["Low returns on cash", "Reduced aggregate ROIC", "Temptation to overpay for acquisitions", "Unclear strategic purpose", "Potential agency problems"].map((x) => (
              <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.5] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          Cash can have option value, but option value does not justify unlimited accumulation.
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
