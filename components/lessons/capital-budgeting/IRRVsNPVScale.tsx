"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

const RATE = 10;

export default function IRRVsNPVScale() {
  const [scaleA, setScaleA] = useState(1);
  const [scaleB, setScaleB] = useState(100);

  // Both projects have the same percentage return structure
  // A: 30% return, B: 20% return
  const irrA = 30;
  const irrB = 20;
  const npvA = (scaleA * 1.3) / (1 + RATE / 100) - scaleA;
  const npvB = (scaleB * 1.2) / (1 + RATE / 100) - scaleB;
  const higherIRR = irrA > irrB ? "A" : "B";
  const higherNPV = npvA > npvB ? "A" : "B";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
              <span>Project A scale (IRR 30%)</span>
              <span className="text-[14px] tabular-nums text-accent-cyan">${scaleA}M</span>
            </label>
            <input type="range" min={1} max={100} step={1} value={scaleA}
              onChange={(e) => setScaleA(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
            />
          </div>
          <div>
            <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
              <span>Project B scale (IRR 20%)</span>
              <span className="text-[14px] tabular-nums text-accent-amber">${scaleB}M</span>
            </label>
            <input type="range" min={10} max={200} step={5} value={scaleB}
              onChange={(e) => setScaleB(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
            />
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse text-[15px]">
            <thead>
              <tr className="border-b border-white/20 text-right">
                <th className="py-2 pr-6 text-left font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">Metric</th>
                <th className="py-2 pr-6 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-cyan">Project A</th>
                <th className="py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-amber">Project B</th>
              </tr>
            </thead>
            <tbody className="font-sans tabular-nums">
              <tr className="border-b border-white/5">
                <td className="py-2.5 pr-6 text-left text-slate-300">Investment</td>
                <td className="py-2.5 pr-6 text-right text-white">${fmt(scaleA)}M</td>
                <td className="py-2.5 text-right text-white">${fmt(scaleB)}M</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2.5 pr-6 text-left text-slate-300">IRR</td>
                <td className={cn("py-2.5 pr-6 text-right", higherIRR === "A" ? "text-accent-green" : "text-white")}>{irrA}%</td>
                <td className={cn("py-2.5 text-right", higherIRR === "B" ? "text-accent-green" : "text-white")}>{irrB}%</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2.5 pr-6 text-left text-slate-300">NPV</td>
                <td className={cn("py-2.5 pr-6 text-right", higherNPV === "A" ? "text-accent-green" : "text-slate-400")}>${fmt(npvA)}M</td>
                <td className={cn("py-2.5 text-right", higherNPV === "B" ? "text-accent-green" : "text-slate-400")}>${fmt(npvB)}M</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-6 text-left text-slate-300">Ranking winner</td>
                <td className="py-2.5 pr-6 text-right">
                  {higherIRR === "A" && <span className="text-accent-cyan">Higher IRR</span>}
                  {higherNPV === "A" && <span className="text-accent-green"> Higher NPV</span>}
                </td>
                <td className="py-2.5 text-right">
                  {higherIRR === "B" && <span className="text-accent-cyan">Higher IRR</span>}
                  {higherNPV === "B" && <span className="text-accent-green"> Higher NPV</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">IRR says</div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Project {higherIRR} has a higher return per dollar invested.
            {higherIRR === higherNPV ? " It also creates more total value." : " But it does NOT create the most total value."}
          </p>
        </div>
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-green">NPV says</div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Project {higherNPV} creates ${fmt(Math.max(npvA, npvB))}M of value versus ${fmt(Math.min(npvA, npvB))}M.
            If the projects are mutually exclusive, select Project {higherNPV}.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          IRR tells us return per dollar. NPV tells us total dollars of value created. If projects
          are independent and capital is available, both may be acceptable. If mutually exclusive,
          choose the highest positive NPV.
        </p>
      </div>
    </div>
  );
}
