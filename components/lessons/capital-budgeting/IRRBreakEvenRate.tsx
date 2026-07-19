"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function IRRBreakEvenRate() {
  const [cost, setCost] = useState(100);
  const [payoff, setPayoff] = useState(115);
  const [required, setRequired] = useState(10);

  // IRR for one-period: cost = payoff / (1 + IRR) → IRR = payoff/cost - 1
  const irr = cost > 0 ? (payoff / cost - 1) * 100 : 0;
  const npv = payoff / (1 + required / 100) - cost;
  const irrExceeds = irr >= required;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Slider label="Initial investment" value={cost} min={50} max={200} step={1} prefix="$" onChange={setCost} />
          <Slider label="Expected payoff (1 yr)" value={payoff} min={50} max={250} step={1} prefix="$" onChange={setPayoff} />
          <Slider label="Required return" value={required} min={3} max={25} step={0.5} suffix="%" onChange={setRequired} />
        </div>
      </div>

      {/* Definition */}
      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          IRR definition
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
          <BlockMath>
            {String.raw`0 = -CF_0 + \frac{CF_1}{1+IRR} + \frac{CF_2}{(1+IRR)^2} + \cdots + \frac{CF_T}{(1+IRR)^T}`}
          </BlockMath>
        </div>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-200">
          IRR is the discount rate that makes the project&apos;s NPV equal to zero.
        </p>
      </div>

      {/* Solve for IRR */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`\$${fmt(cost)} = \frac{\$${fmt(payoff)}}{1 + IRR}`}</BlockMath>
          </div>
          <div className={cn(
            "rounded-xl border px-4 py-3",
            irrExceeds ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]",
          )}>
            <BlockMath>{String.raw`IRR = \frac{\$${fmt(payoff)}}{\$${fmt(cost)}} - 1 = ${fmt(irr)}\%`}</BlockMath>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Readout label="IRR" value={`${fmt(irr)}%`} tone={irrExceeds ? "green" : "red"} />
        <Readout label="Required return" value={`${fmt(required)}%`} tone="amber" />
        <Readout label="NPV at required return" value={`${npv >= 0 ? "+" : "−"}$${fmt(Math.abs(npv))}`} tone={npv > 0 ? "green" : "red"} />
      </div>

      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        irrExceeds ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]",
      )}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          At a {fmt(irr)}% discount rate, the present value of the expected payoff exactly equals the
          initial investment. {irrExceeds ? (
            <>Since IRR exceeds the {fmt(required)}% required return, NPV is positive.</>
          ) : (
            <>Since IRR is below the {fmt(required)}% required return, NPV is negative.</>
          )}{" "}
          IRR is an internal property of the cash flows. The required return is an external
          benchmark set by the opportunity cost of capital.
        </p>
        <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
          <BlockMath>
            {String.raw`IRR > r \;\Longleftrightarrow\; NPV > 0`}
          </BlockMath>
        </div>
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

function Readout({ label, value, tone = "neutral" }: {
  label: string; value: string; tone?: "neutral" | "green" | "red" | "amber";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : tone === "amber" ? "text-accent-amber" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-2 font-mono text-[17px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
