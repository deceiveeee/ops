"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function ProfitabilityIndexExplainer() {
  const [pv, setPv] = useState(120);
  const [investment, setInvestment] = useState(100);

  const pi = investment > 0 ? pv / investment : 0;
  const npv = pv - investment;
  const piPositive = pi > 1;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Slider label="PV of future cash inflows" value={pv} min={40} max={250} step={1} prefix="$" onChange={setPv} />
          <Slider label="Initial investment" value={investment} min={40} max={250} step={1} prefix="$" onChange={setInvestment} />
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Profitability index
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
          <BlockMath>{String.raw`PI = \frac{\text{PV of inflows}}{\text{Initial investment}} = \frac{\$${fmt(pv)}}{\$${fmt(investment)}} = ${fmt(pi)}`}</BlockMath>
        </div>
        <div className={cn("mt-3 rounded-xl border px-4 py-3",
          piPositive ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]")}>
          <BlockMath>{String.raw`NPV = \$${fmt(pv)} - \$${fmt(investment)} = \$${fmt(npv)}`}</BlockMath>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Readout label="Profitability index" value={fmt(pi)} tone={piPositive ? "green" : "red"} />
        <Readout label="Value per $1 invested" value={`$${fmt(pi)}`} />
        <Readout label="NPV" value={`${npv >= 0 ? "+" : "−"}$${fmt(Math.abs(npv))}`} tone={npv > 0 ? "green" : "red"} />
      </div>

      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        piPositive ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]",
      )}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {piPositive ? (
            <>Each $1 invested produces <span className="text-accent-green">${fmt(pi)}</span> of present
            value. PI &gt; 1 generally corresponds to positive NPV for a conventional independent project.</>
          ) : (
            <>Each $1 invested produces only <span className="text-accent-red">${fmt(pi)}</span> of
            present value — less than the dollar committed. PI &lt; 1 corresponds to negative NPV.</>
          )}{" "}
          PI measures capital efficiency: how much present value is created per dollar committed.
        </p>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, prefix, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  prefix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}`}
      />
    </div>
  );
}

function Readout({ label, value, tone = "neutral" }: {
  label: string; value: string; tone?: "neutral" | "green" | "red";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-2 font-mono text-[17px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
