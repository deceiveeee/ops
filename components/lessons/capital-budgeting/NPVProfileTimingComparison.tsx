"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

// Project A: earlier cash flows. Project B: later cash flows. Same initial cost.
const FLOWS_A = [-100, 90, 30];
const FLOWS_B = [-100, 10, 125];

function npv(flows: number[], rate: number) {
  const r = rate / 100;
  return flows.reduce((s, f, t) => s + f / Math.pow(1 + r, t), 0);
}

// Binary search IRR
function findIRR(flows: number[]): number | null {
  let lo = -0.9, hi = 10;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const val = npv(flows, mid * 100);
    if (val > 0) lo = mid; else hi = mid;
  }
  const irr = (lo + hi) / 2;
  if (Math.abs(npv(flows, irr * 100)) < 0.01) return irr * 100;
  return null;
}

export default function NPVProfileTimingComparison() {
  const [rate, setRate] = useState(10);

  const rates = useMemo(() => {
    const arr: number[] = [];
    for (let r = 0; r <= 30; r += 0.5) arr.push(r);
    return arr;
  }, []);

  const npvAs = rates.map((r) => npv(FLOWS_A, r));
  const npvBs = rates.map((r) => npv(FLOWS_B, r));

  const irrA = findIRR(FLOWS_A);
  const irrB = findIRR(FLOWS_B);

  // Find crossover rate
  let crossover = 0;
  for (let i = 1; i < rates.length; i++) {
    const diffPrev = npvAs[i - 1] - npvBs[i - 1];
    const diffCurr = npvAs[i] - npvBs[i];
    if (diffPrev * diffCurr < 0) {
      // Linear interpolation
      const frac = diffPrev / (diffPrev - diffCurr);
      crossover = rates[i - 1] + frac * (rates[i] - rates[i - 1]);
      break;
    }
  }

  // Chart dimensions
  const W = 560, H = 320, PAD = 50;
  const chartW = W - PAD * 2, chartH = H - PAD * 2;
  const maxRate = 30;
  const allNPVs = [...npvAs, ...npvBs];
  const maxNPV = Math.max(...allNPVs, 10);
  const minNPV = Math.min(...allNPVs, -10);
  const npvRange = maxNPV - minNPV;

  const xScale = (r: number) => PAD + (r / maxRate) * chartW;
  const yScale = (v: number) => PAD + chartH - ((v - minNPV) / npvRange) * chartH;

  const pathA = npvAs.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(rates[i]).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");
  const pathB = npvBs.map((v, i) => `${i === 0 ? "M" : "L"} ${xScale(rates[i]).toFixed(1)} ${yScale(v).toFixed(1)}`).join(" ");

  const zeroY = yScale(0);
  const npvAtRate_A = npv(FLOWS_A, rate);
  const npvAtRate_B = npv(FLOWS_B, rate);
  const betterAtRate = npvAtRate_A > npvAtRate_B ? "A" : "B";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <span>Required return (discount rate)</span>
          <span className="text-[14px] tabular-nums text-accent-amber">{rate}%</span>
        </label>
        <input type="range" min={0} max={30} step={0.5} value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        />
      </div>

      {/* NPV Profile Chart */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: "480px" }} role="img" aria-label="NPV profile comparison chart">
            {/* Axes */}
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            {/* Zero line */}
            <line x1={PAD} y1={zeroY} x2={W - PAD} y2={zeroY} stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 4" />
            {/* Required return line */}
            <line x1={xScale(rate)} y1={PAD} x2={xScale(rate)} y2={H - PAD} stroke="rgba(251,191,36,0.4)" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={xScale(rate)} y={H - PAD + 18} fill="#fbbf24" fontSize={11} fontFamily="monospace" textAnchor="middle">{rate}%</text>
            {/* Crossover line */}
            <line x1={xScale(crossover)} y1={PAD} x2={xScale(crossover)} y2={H - PAD} stroke="rgba(167,139,250,0.3)" strokeWidth={1} strokeDasharray="2 4" />
            <text x={xScale(crossover)} y={H - PAD + 32} fill="#a78bfa" fontSize={10} fontFamily="monospace" textAnchor="middle">crossover {crossover.toFixed(1)}%</text>
            {/* Path A */}
            <path d={pathA} fill="none" stroke="#22d3ee" strokeWidth={2.5} />
            {/* Path B */}
            <path d={pathB} fill="none" stroke="#fbbf24" strokeWidth={2.5} />
            {/* IRR markers */}
            {irrA !== null && <circle cx={xScale(irrA)} cy={zeroY} r={5} fill="#22d3ee" stroke="#05070d" strokeWidth={2} />}
            {irrB !== null && <circle cx={xScale(irrB)} cy={zeroY} r={5} fill="#fbbf24" stroke="#05070d" strokeWidth={2} />}
            {/* NPV points at current rate */}
            <circle cx={xScale(rate)} cy={yScale(npvAtRate_A)} r={5} fill="#22d3ee" stroke="#05070d" strokeWidth={2} />
            <circle cx={xScale(rate)} cy={yScale(npvAtRate_B)} r={5} fill="#fbbf24" stroke="#05070d" strokeWidth={2} />
            {/* Labels */}
            <text x={PAD} y={PAD - 12} fill="rgba(255,255,255,0.6)" fontSize={11} fontFamily="monospace">NPV ($)</text>
            <text x={W - PAD} y={H - PAD + 18} fill="rgba(255,255,255,0.6)" fontSize={11} fontFamily="monospace" textAnchor="end">Discount rate (%)</text>
            {/* Y-axis ticks */}
            <text x={PAD - 8} y={zeroY + 4} fill="rgba(255,255,255,0.5)" fontSize={10} fontFamily="monospace" textAnchor="end">0</text>
            <text x={PAD - 8} y={yScale(maxNPV) + 4} fill="rgba(255,255,255,0.5)" fontSize={10} fontFamily="monospace" textAnchor="end">{Math.round(maxNPV)}</text>
            {/* Legend */}
            <rect x={W - PAD - 120} y={PAD} width={12} height={3} fill="#22d3ee" />
            <text x={W - PAD - 102} y={PAD + 6} fill="#22d3ee" fontSize={11} fontFamily="monospace">Project A · early</text>
            <rect x={W - PAD - 120} y={PAD + 18} width={12} height={3} fill="#fbbf24" />
            <text x={W - PAD - 102} y={PAD + 24} fill="#fbbf24" fontSize={11} fontFamily="monospace">Project B · late</text>
          </svg>
        </div>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Readout label="NPV_A at current rate" value={`$${fmt(npvAtRate_A)}`} tone={npvAtRate_A > npvAtRate_B ? "green" : "neutral"} />
        <Readout label="NPV_B at current rate" value={`$${fmt(npvAtRate_B)}`} tone={npvAtRate_B > npvAtRate_A ? "green" : "neutral"} />
        {irrA !== null && <Readout label="IRR_A" value={`${fmt(irrA)}%`} tone="cyan" />}
        {irrB !== null && <Readout label="IRR_B" value={`${fmt(irrB)}%`} tone="amber" />}
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          At a {rate}% discount rate, <span className="text-white">Project {betterAtRate}</span> has
          the higher NPV. {rate < crossover ? (
            <>At low discount rates, Project B benefits more because its larger later cash flows are
            discounted less heavily. As the rate rises, earlier cash flows are favored.</>
          ) : (
            <>At higher discount rates, Project A is favored because it receives more cash earlier,
            before heavy discounting erodes distant flows.</>
          )}{" "}
          The crossover occurs at approximately {crossover.toFixed(1)}%. IRR alone cannot identify
          which project is better — the answer depends on the required return.
        </p>
      </div>
    </div>
  );
}

function Readout({ label, value, tone = "neutral" }: {
  label: string; value: string; tone?: "neutral" | "green" | "red" | "amber" | "cyan";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red"
    : tone === "amber" ? "text-accent-amber" : tone === "cyan" ? "text-accent-cyan" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
