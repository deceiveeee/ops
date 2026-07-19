"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function FirmValueAdditivity() {
  const [firmBefore, setFirmBefore] = useState(1000);
  const [projectPV, setProjectPV] = useState(125);
  const [projectCost, setProjectCost] = useState(100);

  const npv = projectPV - projectCost;
  const firmAfter = firmBefore + npv;
  const npvPositive = npv > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Adjust the project economics
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Slider label="Firm value before" value={firmBefore} min={500} max={2000} step={10} prefix="$" suffix="M" onChange={setFirmBefore} />
          <Slider label="Project PV (benefits)" value={projectPV} min={50} max={250} step={1} prefix="$" suffix="M" onChange={setProjectPV} />
          <Slider label="Capital committed" value={projectCost} min={50} max={250} step={1} prefix="$" suffix="M" onChange={setProjectCost} />
        </div>
      </div>

      {/* Value additivity formula */}
      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Value additivity
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>
              {String.raw`NPV_{\text{project}} = \$${fmt(projectPV)}\,\text{M} - \$${fmt(projectCost)}\,\text{M} = \$${fmt(npv)}\,\text{M}`}
            </BlockMath>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>
              {String.raw`V_{\text{firm, after}} = V_{\text{firm, before}} + NPV_{\text{project}}`}
            </BlockMath>
          </div>
          <div className={cn(
            "rounded-xl border px-4 py-4",
            npvPositive ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]",
          )}>
            <BlockMath>
              {String.raw`V_{\text{firm, after}} = \$${fmt(firmBefore)}\,\text{M} + \$${fmt(npv)}\,\text{M} = \$${fmt(firmAfter)}\,\text{M}`}
            </BlockMath>
          </div>
        </div>
      </div>

      {/* Visual: the exchange */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          What actually happens
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-accent-red/25 bg-accent-red/[0.04] p-4 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-red">
              Company gives up
            </div>
            <div className="mt-2 font-mono text-[20px] tabular-nums text-white">
              ${fmt(projectCost)}M
            </div>
            <div className="mt-1 text-[12px] text-slate-400">of cash/resources</div>
          </div>
          <div className="flex items-center justify-center">
            <span className="text-[24px] text-accent-amber" aria-hidden>⇄</span>
          </div>
          <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.04] p-4 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green">
              Company receives
            </div>
            <div className="mt-2 font-mono text-[20px] tabular-nums text-white">
              ${fmt(projectPV)}M
            </div>
            <div className="mt-1 text-[12px] text-slate-400">of asset value</div>
          </div>
        </div>
        <p className="ops-body mt-4 text-[15px] leading-[1.7] text-slate-100">
          The company <span className="text-white">exchanges</span> ${fmt(projectCost)}M of resources
          for an asset worth ${fmt(projectPV)}M. The estimated{" "}
          <span className={npvPositive ? "text-accent-green" : "text-accent-red"}>
            ${fmt(Math.abs(npv))}M {npvPositive ? "surplus" : "shortfall"}
          </span>{" "}
          is the value {npvPositive ? "created" : "destroyed"}.
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-400">
          The company does <span className="text-white">not</span> keep both the original cash and
          the new asset — the capital is consumed to create the project. This is value additivity:
          firm value changes by exactly the project&apos;s NPV.
        </p>
      </div>

      {/* Caveat */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.7] text-slate-100">
          This is an <span className="text-white">economic estimate</span>, not a guarantee. The
          stock market may have already anticipated some or all of the project — in which case the
          firm-value increase is already reflected in the share price before the announcement. We
          examine that distinction later in this lesson.
        </p>
      </div>
    </div>
  );
}

function Slider({
  label, value, min, max, step, suffix, prefix, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}
