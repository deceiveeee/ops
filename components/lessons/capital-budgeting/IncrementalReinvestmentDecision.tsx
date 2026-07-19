"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function IncrementalReinvestmentDecision() {
  const [capital, setCapital] = useState(100);
  const [payoff, setPayoff] = useState(118);
  const [required, setRequired] = useState(10);

  const expectedReturn = capital > 0 ? ((payoff - capital) / capital) * 100 : 0;
  const pv = payoff / (1 + required / 100);
  const npv = pv - capital;
  const createsValue = npv > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Slider label="Capital invested" value={capital} min={20} max={300} step={5} prefix="$" suffix="M" onChange={setCapital} />
          <Slider label="Expected payoff (1 yr)" value={payoff} min={20} max={350} step={5} prefix="$" suffix="M" onChange={setPayoff} />
          <Slider label="Required return" value={required} min={3} max={25} step={0.5} suffix="%" onChange={setRequired} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Readout label="Expected return" value={`${fmt(expectedReturn)}%`} tone={expectedReturn >= required ? "green" : "red"} />
        <Readout label="Required return" value={`${fmt(required)}%`} tone="amber" />
        <Readout label="PV" value={`$${fmt(pv)}M`} />
        <Readout label="NPV" value={`$${fmt(npv)}M`} tone={createsValue ? "green" : "red"} />
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        createsValue ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <div className={cn("font-mono text-[12px] uppercase tracking-[0.16em]",
          createsValue ? "text-accent-green" : "text-accent-red")}>
          {createsValue ? "Growth creates value" : "Growth destroys value"}
        </div>
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`NPV = \frac{\$${fmt(payoff)}}{1 + ${required}\%} - \$${fmt(capital)} = \$${fmt(npv)}\,\text{M}`}</BlockMath>
          </div>
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
          {createsValue ? (
            <>The incremental return of <span className="text-white">{fmt(expectedReturn)}%</span> exceeds
            the {fmt(required)}% required return. Reinvestment creates value.</>
          ) : (
            <>The incremental return of <span className="text-white">{fmt(expectedReturn)}%</span> is below
            the {fmt(required)}% required return. Reinvestment destroys value — even though the company
            grows its asset base and may increase revenue.</>
          )}
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          A company&apos;s historical ROIC may be excellent because of investments made years ago.
          Investors need the expected return on <span className="text-white">new capital deployed today</span>.
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
function Readout({ label, value, tone = "neutral" }: {
  label: string; value: string; tone?: "neutral" | "green" | "red" | "amber";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : tone === "amber" ? "text-accent-amber" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-mono text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
