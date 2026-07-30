"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

const INITIAL = 100;
const FLOWS_A = [90, 10, 0, 0];
const FLOWS_B = [10, 90, 0, 0];

function payback(flows: number[], initial: number, rate: number | null) {
  let cum = 0;
  let prevCum = 0;
  for (let i = 0; i < flows.length; i++) {
    const cf = rate !== null ? flows[i] / Math.pow(1 + rate / 100, i + 1) : flows[i];
    prevCum = cum;
    cum += cf;
    if (cum >= initial) {
      const needed = initial - prevCum;
      return i + (needed > 0 && cf > 0 ? needed / cf : 0);
    }
  }
  return -1;
}

export default function BasicVsDiscountedPayback() {
  const [rate, setRate] = useState(10);
  const [view, setView] = useState<"project" | "comparison">("comparison");

  const pbA = payback(FLOWS_A, INITIAL, null);
  const pbB = payback(FLOWS_B, INITIAL, null);
  const dpbA = payback(FLOWS_A, INITIAL, rate);
  const dpbB = payback(FLOWS_B, INITIAL, rate);

  const npvA = FLOWS_A.reduce((s, f, i) => s + f / Math.pow(1 + rate / 100, i + 1), 0) - INITIAL;
  const npvB = FLOWS_B.reduce((s, f, i) => s + f / Math.pow(1 + rate / 100, i + 1), 0) - INITIAL;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <span>Discount rate</span>
          <span className="text-[14px] tabular-nums text-accent-amber">{rate}%</span>
        </label>
        <input type="range" min={0} max={25} step={1} value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        />
      </div>

      {/* Side-by-side projects */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {([
          { name: "Project A · early cash", flows: FLOWS_A, tone: "cyan" as const, pb: pbA, dpb: dpbA, npv: npvA },
          { name: "Project B · late cash", flows: FLOWS_B, tone: "amber" as const, pb: pbB, dpb: dpbB, npv: npvB },
        ]).map((p) => (
          <div key={p.name} className={cn(
            "rounded-2xl border p-5",
            p.tone === "cyan" ? "border-accent-cyan/25 bg-accent-cyan/[0.04]" : "border-accent-amber/25 bg-accent-amber/[0.04]",
          )}>
            <div className={cn("font-sans text-[11px] uppercase tracking-[0.16em]",
              p.tone === "cyan" ? "text-accent-cyan" : "text-accent-amber")}>{p.name}</div>
            <div className="mt-3 flex gap-1">
              {p.flows.map((f, i) => (
                <div key={i} className="flex-1 rounded-lg border border-white/10 bg-ink-950/40 p-2 text-center">
                  <div className="font-sans text-[10px] text-slate-400">Yr {i + 1}</div>
                  <div className={cn("font-sans text-[13px]", f > 0 ? "text-accent-green" : "text-slate-500")}>${f}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 text-[13px]">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Basic payback</span>
                <span className="font-sans text-white">{p.pb > 0 ? `${fmt(p.pb)} yrs` : "—"}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-slate-400">Discounted payback ({rate}%)</span>
                <span className="font-sans text-white">{p.dpb > 0 ? `${fmt(p.dpb)} yrs` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">NPV ({rate}%)</span>
                <span className={cn("font-sans", p.npv > 0 ? "text-accent-green" : "text-accent-red")}>
                  {p.npv >= 0 ? "+" : "−"}${fmt(Math.abs(p.npv))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Key insight */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          What discounting reveals
        </div>
        <p className="ops-body mt-3 text-[15px] leading-[1.7] text-slate-100">
          Basic payback treats both projects as equivalent — each recovers $100 by the end of Year 2.
          But Project A receives most of its cash <span className="text-white">sooner</span>. Once
          cash flows are discounted, Project A recovers its investment faster and has a higher NPV.
          Early cash flows receive greater weight because of the time value of money.
        </p>
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
          <BlockMath>
            {String.raw`\text{Discounted payback corrects the timing problem, but does not solve every payback limitation.}`}
          </BlockMath>
        </div>
      </div>
    </div>
  );
}
