"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const TRANCHES = [
  { amount: 100, return: 22 },
  { amount: 100, return: 17 },
  { amount: 100, return: 12 },
  { amount: 100, return: 8 },
  { amount: 100, return: 5 },
];

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function MarginalReinvestmentCurve() {
  const [cutoff, setCutoff] = useState(3); // number of tranches to invest
  const [required, setRequired] = useState(10);

  const W = 520, H = 300, PAD = 50;
  const chartW = W - PAD * 2, chartH = H - PAD * 2;
  const maxReturn = 25;
  const totalAmount = TRANCHES.reduce((s, t) => s + t.amount, 0);

  const barWidth = chartW / TRANCHES.length;
  const yScale = (r: number) => PAD + chartH - (r / maxReturn) * chartH;

  let totalInvested = 0;
  let totalNPV = 0;
  TRANCHES.forEach((t, i) => {
    if (i < cutoff) {
      totalInvested += t.amount;
      totalNPV += t.amount * ((t.return - required) / 100);
    }
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <label className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
          <span>Required return (opportunity cost of capital)</span>
          <span className="text-[14px] tabular-nums text-accent-amber">{required}%</span>
        </label>
        <input type="range" min={3} max={20} step={0.5} value={required}
          onChange={(e) => setRequired(Number(e.target.value))}
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        />
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400 mb-3">
          Declining marginal return schedule
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: "420px" }} role="img" aria-label="Marginal reinvestment curve">
            {/* Required return line */}
            <line x1={PAD} y1={yScale(required)} x2={W - PAD} y2={yScale(required)} stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 4" />
            <text x={W - PAD} y={yScale(required) - 6} fill="#fbbf24" fontSize={11} fontFamily="monospace" textAnchor="end">Required: {required}%</text>
            {/* Bars */}
            {TRANCHES.map((t, i) => {
              const invested = i < cutoff;
              const above = t.return >= required;
              const x = PAD + i * barWidth + barWidth * 0.1;
              const w = barWidth * 0.8;
              const barH = ((Math.min(t.return, maxReturn)) / maxReturn) * chartH;
              const y = PAD + chartH - barH;
              return (
                <g key={i}>
                  <rect x={x} y={y} width={w} height={barH} rx={3}
                    fill={invested ? (above ? "#34d399" : "#f87171") : "#2a3450"}
                    opacity={invested ? 0.7 : 0.4}
                  />
                  <text x={x + w / 2} y={y - 6} fill={invested ? (above ? "#34d399" : "#f87171") : "#64748b"} fontSize={12} fontFamily="monospace" textAnchor="middle">{t.return}%</text>
                  <text x={x + w / 2} y={H - PAD + 18} fill="#94a3b8" fontSize={10} fontFamily="monospace" textAnchor="middle">${t.amount}M</text>
                </g>
              );
            })}
            {/* Axes */}
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
            <text x={PAD} y={PAD - 10} fill="rgba(255,255,255,0.6)" fontSize={11} fontFamily="monospace">Return (%)</text>
          </svg>
        </div>
      </div>

      {/* Cutoff control */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Select the investment cutoff
        </div>
        <div className="mt-3 flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button"
              onClick={() => setCutoff(n)}
              className={cn("rounded-lg border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                cutoff === n ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/15 text-slate-300 hover:border-white/30")}>
              {n === 0 ? "None" : `$${n * 100}M`}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Readout label="Total invested" value={`$${fmt(totalInvested)}M`} />
        <Readout label="Est. value created" value={`$${fmt(totalNPV)}M`} tone={totalNPV > 0 ? "green" : "red"} />
        <Readout label="Last tranche return" value={cutoff > 0 ? `${TRANCHES[cutoff - 1].return}%` : "—"} tone={cutoff > 0 ? (TRANCHES[cutoff - 1].return >= required ? "green" : "red") : "neutral"} />
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6", totalNPV > 0 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {cutoff === 0 ? (
            <>With a {required}% required return, no block earns enough. Management should not invest
            and should return capital to shareholders or repay debt instead.</>
          ) : (
            <>Under these assumptions, management should invest the first <span className="text-white">${fmt(totalInvested)}M</span>{" "}
            where returns exceed {required}%, creating an estimated <span className="text-accent-green">${fmt(totalNPV)}M</span> of value.
            {cutoff < TRANCHES.length && (
              <> The ${fmt((TRANCHES.length - cutoff) * 100)}M remaining earns only {TRANCHES[cutoff]?.return ?? TRANCHES[TRANCHES.length - 1].return}%, below the {required}% opportunity cost.</>
            )}
            </>
          )}
        </p>
        <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-200">
          Capital-allocation decisions should be made at the margin. A category can contain both
          excellent and poor investments. &ldquo;Organic growth is good&rdquo; is too broad a rule.
        </p>
      </div>
    </div>
  );
}

function Readout({ label, value, tone = "neutral" }: {
  label: string; value: string; tone?: "neutral" | "green" | "red";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-2 font-sans text-[17px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
