"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function SunkCostDecision() {
  const [pastSpending, setPastSpending] = useState(10);
  const [remainingCost, setRemainingCost] = useState(5);
  const [remainingPV, setRemainingPV] = useState(7);

  const npvRemaining = remainingPV - remainingCost;
  const shouldContinue = npvRemaining > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Slider label="Past spending (sunk)" value={pastSpending} min={0} max={30} step={1} prefix="$" suffix="M" onChange={setPastSpending} tone="slate" />
          <Slider label="Remaining cost to continue" value={remainingCost} min={0} max={20} step={0.5} prefix="$" suffix="M" onChange={setRemainingCost} tone="red" />
          <Slider label="PV of remaining benefits" value={remainingPV} min={0} max={20} step={0.5} prefix="$" suffix="M" onChange={setRemainingPV} tone="green" />
        </div>
      </div>

      {/* Two views */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Wrong view: including sunk cost */}
        <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-red">
            Wrong view · including sunk cost
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>
              {String.raw`(PV - C_{\text{remaining}}) - C_{\text{sunk}} = \$${fmt(remainingPV)} - \$${fmt(remainingCost)} - \$${fmt(pastSpending)} = \$${fmt(remainingPV - remainingCost - pastSpending)}`}
            </BlockMath>
          </div>
          <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-300">
            If the sunk cost is included, the project looks worse than it is. The company might
            abandon a project that would actually create value going forward.
          </p>
        </div>

        {/* Correct view */}
        <div className={cn(
          "rounded-2xl border p-5",
          shouldContinue ? "border-accent-green/25 bg-accent-green/[0.04]" : "border-accent-red/25 bg-accent-red/[0.04]",
        )}>
          <div className={cn(
            "font-mono text-[12px] uppercase tracking-[0.16em]",
            shouldContinue ? "text-accent-green" : "text-accent-red",
          )}>
            Correct view · forward-looking only
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>
              {String.raw`NPV_{\text{remaining}} = \$${fmt(remainingPV)} - \$${fmt(remainingCost)} = \$${fmt(npvRemaining)}`}
            </BlockMath>
          </div>
          <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-100">
            {shouldContinue ? (
              <>Continue. The remaining benefits exceed the remaining cost by{" "}
              <span className="text-accent-green">${fmt(npvRemaining)}M</span>. The past spending is
              irrelevant to this decision.</>
            ) : (
              <>Abandon. The remaining benefits (${fmt(remainingPV)}M) do not justify the remaining
              cost (${fmt(remainingCost)}M).</>
            )}
          </p>
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          The decision changes only with future costs and benefits — not with the sunk cost. Move
          the sunk-cost slider and watch: the correct decision does not change.
        </p>
        <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-200">
          However, the original spending remains relevant when judging management&apos;s past
          capital-allocation performance. A project that required $10M of sunk spending to reach a
          marginal continue/abandon decision was probably a poor initial investment — even if
          continuing is now correct.
        </p>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, suffix, prefix, onChange, tone = "amber",
}: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void; tone?: "amber" | "red" | "green" | "slate";
}) {
  const accent = tone === "red" ? "accent-accent-red" : tone === "green" ? "accent-accent-green" : tone === "slate" ? "accent-slate-400" : "accent-accent-amber";
  const valColor = tone === "red" ? "text-accent-red" : tone === "green" ? "text-accent-green" : tone === "slate" ? "text-slate-400" : "text-accent-amber";
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className={cn("text-[14px] tabular-nums", valColor)}>{prefix}{value}{suffix}</span>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn("mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50", accent)}
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}
