"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function ROICVsCostOfCapital() {
  const [operatingProfit, setOperatingProfit] = useState(15);
  const [investedCapital, setInvestedCapital] = useState(100);
  const [costOfCapital, setCostOfCapital] = useState(10);

  const roic = investedCapital > 0 ? (operatingProfit / investedCapital) * 100 : 0;
  const spread = roic - costOfCapital;
  const positive = spread > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Slider label="After-tax operating profit" value={operatingProfit} min={0} max={40} step={0.5} prefix="$" suffix="M" onChange={setOperatingProfit} />
          <Slider label="Invested capital" value={investedCapital} min={20} max={300} step={5} prefix="$" suffix="M" onChange={setInvestedCapital} />
          <Slider label="Cost of capital" value={costOfCapital} min={3} max={20} step={0.5} suffix="%" onChange={setCostOfCapital} />
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          ROIC calculation
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
          <BlockMath>{String.raw`ROIC = \frac{\$${fmt(operatingProfit)}\,\text{M}}{\$${fmt(investedCapital)}\,\text{M}} = ${fmt(roic)}\%`}</BlockMath>
        </div>
      </div>

      {/* Spread visualization */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        positive ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]",
      )}>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">ROIC</div>
            <div className="mt-1 font-mono text-[28px] tabular-nums text-white">{fmt(roic)}%</div>
          </div>
          <div className="text-[24px] text-slate-500" aria-hidden>−</div>
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">Cost of capital</div>
            <div className="mt-1 font-mono text-[28px] tabular-nums text-white">{fmt(costOfCapital)}%</div>
          </div>
          <div className="text-[24px] text-slate-500" aria-hidden>=</div>
          <div className="text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">Spread</div>
            <div className={cn("mt-1 font-mono text-[28px] tabular-nums", positive ? "text-accent-green" : "text-accent-red")}>
              {spread >= 0 ? "+" : ""}{fmt(spread)}%
            </div>
          </div>
        </div>
        <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
          {positive ? (
            <>ROIC exceeds the cost of capital by {fmt(spread)} percentage points. This is{" "}
            <span className="text-white">consistent with value creation</span> — the company is
            earning more on its invested capital than that capital costs.</>
          ) : (
            <>ROIC is below the cost of capital by {fmt(Math.abs(spread))} percentage points. This is{" "}
            <span className="text-white">consistent with value destruction</span> — the company is
            earning less on its capital than that capital costs.</>
          )}
        </p>
      </div>

      {/* Limitations */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Important limitations
        </div>
        <ul className="mt-3 space-y-2">
          {[
            "Accounting measurement: book values may differ from economic values.",
            "One-year ROIC may not reflect full-life project economics.",
            "Early ramp-up can depress ROIC temporarily even for value-creating projects.",
            "Aggregate ROIC mixes old and new investments — strong old projects can conceal weak new ones.",
            "ROIC does not show full cash-flow timing or a dollar value estimate.",
          ].map((x) => (
            <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-slate-100">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
              {x}
            </li>
          ))}
        </ul>
        <p className="ops-body mt-3 text-[16px] leading-[1.65] text-white">
          NPV is primarily a forward-looking decision framework. ROIC is primarily an
          operating-performance measure.
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
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}
