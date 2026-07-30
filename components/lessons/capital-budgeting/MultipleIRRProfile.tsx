"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// Nonconventional: Year 0: -100, Year 1: +230, Year 2: -132
const FLOWS_NONCONV = [-100, 230, -132];
// Conventional: Year 0: -100, Year 1: 50, Year 2: 80
const FLOWS_CONV = [-100, 50, 80];

function npv(flows: number[], rate: number) {
  const r = rate / 100;
  return flows.reduce((s, f, t) => s + f / Math.pow(1 + r, t), 0);
}

function findAllIRRs(flows: number[]): number[] {
  const irrs: number[] = [];
  let prevVal = npv(flows, -50);
  for (let r = -49.5; r <= 100; r += 0.5) {
    const val = npv(flows, r);
    if (prevVal * val < 0) {
      // Binary search between r-0.5 and r
      let lo = r - 0.5, hi = r;
      for (let i = 0; i < 50; i++) {
        const mid = (lo + hi) / 2;
        const midVal = npv(flows, mid);
        if (npv(flows, lo) * midVal < 0) hi = mid; else lo = mid;
      }
      const irr = (lo + hi) / 2;
      if (Math.abs(npv(flows, irr)) < 0.01) irrs.push(irr);
    }
    prevVal = val;
  }
  return irrs;
}

export default function MultipleIRRProfile() {
  const rates = useMemo(() => {
    const arr: number[] = [];
    for (let r = -20; r <= 60; r += 0.5) arr.push(r);
    return arr;
  }, []);

  const npvsNonConv = rates.map((r) => npv(FLOWS_NONCONV, r));
  const npvsConv = rates.map((r) => npv(FLOWS_CONV, r));

  const irrsNonConv = findAllIRRs(FLOWS_NONCONV);
  const irrsConv = findAllIRRs(FLOWS_CONV);

  // Chart dimensions
  const W = 560, H = 340, PAD = 50;
  const chartW = W - PAD * 2, chartH = H - PAD * 2;
  const maxRate = 60, minRate = -20;
  const rateRange = maxRate - minRate;
  const allNPVs = [...npvsNonConv, ...npvsConv];
  const maxNPV = Math.max(...allNPVs, 10);
  const minNPV = Math.min(...allNPVs, -10);
  const npvRange = maxNPV - minNPV;

  const xScale = (r: number) => PAD + ((r - minRate) / rateRange) * chartW;
  const yScale = (v: number) => PAD + chartH - ((v - minNPV) / npvRange) * chartH;
  const zeroY = yScale(0);

  const pathNonConv = npvsNonConv.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(rates[i]).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");
  const pathConv = npvsConv.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(rates[i]).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");

  return (
    <div className="space-y-6">
      {/* Cash flow display */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-red">
            Nonconventional cash flows
          </div>
          <div className="mt-3 flex gap-2">
            {FLOWS_NONCONV.map((f, i) => (
              <div key={i} className="flex-1 rounded-lg border border-white/10 bg-ink-950/40 p-2 text-center">
                <div className="font-sans text-[10px] text-slate-400">Yr {i}</div>
                <div className={cn("font-sans text-[13px]", f >= 0 ? "text-accent-green" : "text-accent-red")}>
                  {f >= 0 ? "+" : ""}{f}
                </div>
              </div>
            ))}
          </div>
          <p className="ops-body mt-3 text-[13px] leading-[1.55] text-slate-300">
            Signs change twice: outflow, inflow, outflow. The NPV curve can cross zero more than once.
          </p>
          <div className="mt-2 font-sans text-[14px] text-white">
            IRRs found: {irrsNonConv.length === 0 ? "none" : irrsNonConv.map((r) => `${r.toFixed(1)}%`).join(" and ")}
          </div>
        </div>
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-green">
            Conventional cash flows
          </div>
          <div className="mt-3 flex gap-2">
            {FLOWS_CONV.map((f, i) => (
              <div key={i} className="flex-1 rounded-lg border border-white/10 bg-ink-950/40 p-2 text-center">
                <div className="font-sans text-[10px] text-slate-400">Yr {i}</div>
                <div className={cn("font-sans text-[13px]", f >= 0 ? "text-accent-green" : "text-accent-red")}>
                  {f >= 0 ? "+" : ""}{f}
                </div>
              </div>
            ))}
          </div>
          <p className="ops-body mt-3 text-[13px] leading-[1.55] text-slate-300">
            One outflow, then positive inflows. The NPV curve crosses zero exactly once.
          </p>
          <div className="mt-2 font-sans text-[14px] text-white">
            IRR: {irrsConv.length === 1 ? `${irrsConv[0].toFixed(1)}%` : "none found"}
          </div>
        </div>
      </div>

      {/* NPV Profile Chart */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400 mb-3">
          NPV profile: NPV vs. discount rate
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: "480px" }} role="img" aria-label="NPV profile showing multiple IRRs">
            {/* Axes */}
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            {/* Zero NPV line */}
            <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="rgba(255,255,255,0.2)" strokeWidth={1} strokeDasharray="6 4" />
            {/* Zero rate line */}
            {(() => {
              const x0 = xScale(0);
              return <line x1={x0} y1={PAD} x2={x0} y2={H - PAD} stroke="rgba(255,255,255,0.1)" strokeWidth={1} strokeDasharray="3 3" />;
            })()}
            {/* Nonconventional curve */}
            <path d={pathNonConv} fill="none" stroke="#f87171" strokeWidth={2.5} />
            {/* Conventional curve */}
            <path d={pathConv} fill="none" stroke="#34d399" strokeWidth={2.5} />
            {/* IRR markers for nonconventional */}
            {irrsNonConv.map((irr, i) => (
              <g key={`nc-${i}`}>
                <circle cx={xScale(irr)} cy={zeroY} r={6} fill="#f87171" stroke="#05070d" strokeWidth={2} />
                <text x={xScale(irr)} y={zeroY - 12} fill="#f87171" fontSize={11} fontFamily="monospace" textAnchor="middle">{irr.toFixed(0)}%</text>
              </g>
            ))}
            {/* IRR marker for conventional */}
            {irrsConv.map((irr, i) => (
              <g key={`c-${i}`}>
                <circle cx={xScale(irr)} cy={zeroY} r={6} fill="#34d399" stroke="#05070d" strokeWidth={2} />
                <text x={xScale(irr)} y={zeroY + 22} fill="#34d399" fontSize={11} fontFamily="monospace" textAnchor="middle">{irr.toFixed(0)}%</text>
              </g>
            ))}
            {/* Labels */}
            <text x={PAD} y={PAD - 12} fill="rgba(255,255,255,0.6)" fontSize={11} fontFamily="monospace">NPV ($)</text>
            <text x={W - PAD} y={H - PAD + 18} fill="rgba(255,255,255,0.6)" fontSize={11} fontFamily="monospace" textAnchor="end">Discount rate (%)</text>
            <text x={PAD - 8} y={zeroY + 4} fill="rgba(255,255,255,0.5)" fontSize={10} fontFamily="monospace" textAnchor="end">0</text>
            {/* Legend */}
            <rect x={PAD + 10} y={PAD} width={12} height={3} fill="#f87171" />
            <text x={PAD + 28} y={PAD + 6} fill="#f87171" fontSize={11} fontFamily="monospace">Nonconventional (multiple IRRs)</text>
            <rect x={PAD + 10} y={PAD + 18} width={12} height={3} fill="#34d399" />
            <text x={PAD + 28} y={PAD + 24} fill="#34d399" fontSize={11} fontFamily="monospace">Conventional (one IRR)</text>
          </svg>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          The nonconventional project&apos;s NPV curve crosses zero {irrsNonConv.length === 2 ? "twice" : irrsNonConv.length === 0 ? "never" : `${irrsNonConv.length} times`}.
          {irrsNonConv.length === 2 ? (
            <> Two IRRs exist ({irrsNonConv.map((r) => `${r.toFixed(1)}%`).join(" and ")}). The rule
            &ldquo;accept if IRR &gt; required return&rdquo; breaks down — which IRR should be used?</>
          ) : irrsNonConv.length === 0 ? (
            <> No economically meaningful IRR exists. The decision must be made using NPV directly.</>
          ) : (
            <> One IRR exists, but the interpretation may differ from a conventional project.</>
          )}{" "}
          The conventional project has exactly one IRR ({irrsConv[0]?.toFixed(1)}%) and the standard
          rule applies cleanly.
        </p>
      </div>
    </div>
  );
}
