"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function FeeCompoundingCalculator() {
  const [pv, setPv] = useState(10000);
  const [gross, setGross] = useState(8);
  const [feeA, setFeeA] = useState(0.10);
  const [feeB, setFeeB] = useState(1.20);
  const [years, setYears] = useState(30);

  const netA = gross - feeA;
  const netB = gross - feeB;
  const fvA = pv * Math.pow(1 + netA / 100, years);
  const fvB = pv * Math.pow(1 + netB / 100, years);
  const diff = fvA - fvB;

  // Chart data points
  const W = 520, H = 280, PAD = 50;
  const chartW = W - PAD * 2, chartH = H - PAD * 2;
  const maxY = Math.max(fvA, fvB, pv) * 1.05;
  const xScale = (y: number) => PAD + (y / years) * chartW;
  const yScale = (v: number) => PAD + chartH - (v / maxY) * chartH;

  const pointsA: string[] = [];
  const pointsB: string[] = [];
  for (let y = 0; y <= years; y++) {
    const va = pv * Math.pow(1 + netA / 100, y);
    const vb = pv * Math.pow(1 + netB / 100, y);
    pointsA.push(`${y === 0 ? "M" : "L"} ${xScale(y).toFixed(1)} ${yScale(va).toFixed(1)}`);
    pointsB.push(`${y === 0 ? "M" : "L"} ${xScale(y).toFixed(1)} ${yScale(vb).toFixed(1)}`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Slider label="Starting investment" value={pv} min={1000} max={100000} step={1000} prefix="$" onChange={setPv} />
          <Slider label="Gross annual return" value={gross} min={3} max={12} step={0.5} suffix="%" onChange={setGross} />
          <Slider label="Investment horizon" value={years} min={5} max={40} step={1} suffix=" yrs" onChange={setYears} />
          <Slider label="Strategy A fee (low-cost)" value={feeA} min={0} max={2} step={0.05} suffix="%" onChange={setFeeA} />
          <Slider label="Strategy B fee (higher)" value={feeB} min={0} max={3} step={0.05} suffix="%" onChange={setFeeB} />
        </div>
      </div>

      {/* Formula */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="space-y-2">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`FV = PV \times (1 + r_{\text{net}})^n`}</BlockMath>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>{String.raw`r_{\text{net}} = r_{\text{gross}} - f`}</BlockMath>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400 mb-3">
          Ending value over {years} years
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: "380px" }} role="img" aria-label={`After ${years} years, Strategy A reaches $${fmt(fvA)} and Strategy B reaches $${fmt(fvB)}`}>
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <text x={PAD} y={PAD - 10} fill="rgba(255,255,255,0.6)" fontSize={11} fontFamily="monospace">Value ($)</text>
            <text x={W - PAD} y={H - PAD + 18} fill="rgba(255,255,255,0.6)" fontSize={11} fontFamily="monospace" textAnchor="end">Years</text>
            <path d={pointsA.join(" ")} fill="none" stroke="#34d399" strokeWidth={2.5} />
            <path d={pointsB.join(" ")} fill="none" stroke="#f87171" strokeWidth={2.5} />
            {/* End labels */}
            <text x={xScale(years)} y={yScale(fvA) - 8} fill="#34d399" fontSize={11} fontFamily="monospace" textAnchor="end">${fmt(fvA)}</text>
            <text x={xScale(years)} y={yScale(fvB) + 16} fill="#f87171" fontSize={11} fontFamily="monospace" textAnchor="end">${fmt(fvB)}</text>
            {/* Legend */}
            <rect x={PAD + 8} y={PAD} width={10} height={3} fill="#34d399" />
            <text x={PAD + 24} y={PAD + 6} fill="#34d399" fontSize={10} fontFamily="monospace">A: {feeA}% fee → ${fmt(fvA)}</text>
            <rect x={PAD + 8} y={PAD + 16} width={10} height={3} fill="#f87171" />
            <text x={PAD + 24} y={PAD + 22} fill="#f87171" fontSize={10} fontFamily="monospace">B: {feeB}% fee → ${fmt(fvB)}</text>
          </svg>
        </div>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Readout label="Strategy A ending value" value={`$${fmt(fvA)}`} tone="green" sub={`${feeA}% fee`} />
        <Readout label="Strategy B ending value" value={`$${fmt(fvB)}`} tone="red" sub={`${feeB}% fee`} />
        <Readout label="Difference" value={`$${fmt(diff)}`} tone="amber" sub={`over ${years} years`} />
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          A {feeB}% fee versus a {feeA}% fee costs{" "}
          <span className="text-accent-amber">${fmt(diff)}</span> over {years} years on a ${fmt(pv)}
          {" "}investment. The difference is not just the fee itself — it is the lost compounding on
          every dollar paid in fees. This simplified example assumes a constant return and fee for
          teaching purposes. It is not a forecast.
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
      <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span><span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`} />
    </div>
  );
}

function Readout({ label, value, tone, sub }: {
  label: string; value: string; tone: "green" | "red" | "amber"; sub?: string;
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-accent-amber";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[18px] tabular-nums", text)}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}
