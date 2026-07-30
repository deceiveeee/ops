"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function ProjectValueVsMarketExpectation() {
  const [expected, setExpected] = useState(300);
  const [disclosed, setDisclosed] = useState(250);

  const surprise = disclosed - expected;
  const surprisePositive = surprise >= 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Corporate value vs. market expectation
        </div>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Slider label="Market's prior expected NPV" value={expected} min={0} max={500} step={10} prefix="$" suffix="M" onChange={setExpected} />
          <Slider label="Newly disclosed estimated NPV" value={disclosed} min={0} max={500} step={10} prefix="$" suffix="M" onChange={setDisclosed} />
        </div>
      </div>

      {/* Two separate effects */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-green">
            Corporate value created
          </div>
          <div className="mt-3">
            <BlockMath>{String.raw`\text{NPV}_{\text{project}} = +\$${fmt(disclosed)}\,\text{M}`}</BlockMath>
          </div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            The project has positive NPV. It is expected to increase firm value by{" "}
            <span className="text-white">${fmt(disclosed)}M</span>.
          </p>
        </div>
        <div className={cn(
          "rounded-2xl border p-5",
          surprisePositive ? "border-accent-green/25 bg-accent-green/[0.04]" : "border-accent-red/25 bg-accent-red/[0.04]",
        )}>
          <div className={cn(
            "font-sans text-[11px] uppercase tracking-[0.16em]",
            surprisePositive ? "text-accent-green" : "text-accent-red",
          )}>
            Surprise vs. market expectations
          </div>
          <div className="mt-3">
            <BlockMath>{String.raw`\$${fmt(disclosed)} - \$${fmt(expected)} = \$${fmt(surprise)}\,\text{M}`}</BlockMath>
          </div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            {surprisePositive
              ? "The disclosed NPV exceeds what the market expected. This is positive news."
              : "The disclosed NPV is below what the market expected. Despite positive NPV, this is negative news."}
          </p>
        </div>
      </div>

      {/* Market reaction indicator */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        surprisePositive ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]",
      )}>
        <div className="flex items-center gap-4">
          <span className={cn("text-[32px]", surprisePositive ? "text-accent-green" : "text-accent-red")} aria-hidden>
            {surprisePositive ? "▲" : "▼"}
          </span>
          <div>
            <div className={cn(
              "font-sans text-[12px] uppercase tracking-[0.16em]",
              surprisePositive ? "text-accent-green" : "text-accent-red",
            )}>
              Possible market reaction: {surprisePositive ? "upward pressure" : "downward pressure"}
            </div>
            <p className="ops-body mt-1 text-[15px] leading-[1.6] text-slate-100">
              Stock prices respond primarily to{" "}
              <span className="text-white">new information relative to prior expectations</span>, not
              to whether the project is good in absolute terms.
            </p>
          </div>
        </div>
      </div>

      {/* Caveats */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Important caveats
        </div>
        <ul className="mt-3 space-y-2.5">
          {[
            "A positive-NPV project may already be reflected in the stock price if the market anticipated it.",
            "A negative-NPV outcome can produce a positive price reaction if it is less bad than feared.",
            "Immediate stock reactions are noisy and do not perfectly measure long-term NPV.",
            "The stock price will not necessarily move by exactly the amount of the surprise.",
          ].map((x) => (
            <li key={x} className="flex items-start gap-2.5 text-[15px] leading-[1.6] text-slate-100">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
              {x}
            </li>
          ))}
        </ul>
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
      <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
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
