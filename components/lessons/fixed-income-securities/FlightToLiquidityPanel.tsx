"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";

/**
 * Flight-to-liquidity vs. inflation stress on the short end of the curve.
 * Toggle between Calm / Flight to liquidity / Inflation concern and watch a
 * mini SVG yield curve change shape.
 */
type Mode = "calm" | "flight" | "inflation";

const MODES: { key: Mode; label: string; caption: string }[] = [
  { key: "calm", label: "Calm", caption: "Normal upward-sloping curve" },
  { key: "flight", label: "Flight to liquidity", caption: "Short yields drop, curve steepens" },
  { key: "inflation", label: "Inflation concern", caption: "Long yields rise" },
];

// Yields (percent) at maturities 1m, 1y, 2y, 5y, 10y
const CURVES: Record<Mode, number[]> = {
  calm: [2.0, 3.4, 3.9, 4.6, 5.2],
  flight: [0.3, 3.0, 3.8, 4.6, 5.2],
  inflation: [2.0, 3.6, 4.3, 5.3, 6.6],
};

const MATURITIES = ["1m", "1y", "2y", "5y", "10y"];

export default function FlightToLiquidityPanel() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>("calm");
  const yields = CURVES[mode];

  // SVG geometry
  const W = 760;
  const H = 240;
  const padX = 50;
  const padY = 30;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const yMin = 0;
  const yMax = 7.5;
  const xAt = (i: number) => padX + (innerW * i) / (MATURITIES.length - 1);
  const yAt = (y: number) => padY + innerH - (innerH * (y - yMin)) / (yMax - yMin);

  const pts = yields.map((y, i) => `${xAt(i)},${yAt(y)}`).join(" ");

  return (
    <div className="space-y-6">
      <DefinitionCard term="Flight to liquidity">
        When fear rises, investors pile into the safest, most liquid
        short-term instruments — like T-bills. That buying pushes T-bill{" "}
        <span className="text-accent-cyan">prices up</span> and their{" "}
        <span className="text-accent-amber">yields down</span>, even when nothing
        about the government&apos;s credit changed.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Stress the short end
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          The same curve bends differently under different stresses
        </h4>

        {/* Mode toggle */}
        <div className="mt-5 inline-flex flex-wrap gap-1 rounded-full border border-white/15 bg-ink-950/60 p-1">
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={mode === m.key}
              aria-label={m.label}
              onClick={() => setMode(m.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                mode === m.key
                  ? "bg-accent-cyan/15 text-accent-cyan"
                  : "text-slate-400 hover:text-slate-200",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mini yield curve */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[520px]" role="img" aria-label={`Yield curve under ${mode} conditions`}>
            {/* gridlines */}
            {[0, 2, 4, 6].map((gy) => (
              <g key={gy}>
                <line
                  x1={padX}
                  y1={yAt(gy)}
                  x2={W - padX}
                  y2={yAt(gy)}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={1}
                />
                <text x={padX - 8} y={yAt(gy) + 4} textAnchor="end" className="fill-slate-500 font-sans" fontSize="11">
                  {gy}%
                </text>
              </g>
            ))}
            {/* x-axis maturity labels */}
            {MATURITIES.map((mat, i) => (
              <text key={mat} x={xAt(i)} y={H - padY + 22} textAnchor="middle" className="fill-slate-400 font-sans" fontSize="12">
                {mat}
              </text>
            ))}
            {/* curve */}
            <motion.polyline
              points={pts}
              fill="none"
              stroke="#22d3ee"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : false}
              animate={undefined}
              transition={{ duration: 0.4 }}
              style={reduce ? undefined : { transition: "points 0.4s ease, d 0.4s ease" }}
            />
            {/* points */}
            {yields.map((y, i) => (
              <motion.circle
                key={i}
                cx={xAt(i)}
                cy={yAt(y)}
                r={4}
                fill={i === 0 ? "#fbbf24" : "#22d3ee"}
                initial={reduce ? false : { opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              />
            ))}
            <text x={xAt(0)} y={yAt(yields[0]) - 12} textAnchor="middle" className="fill-accent-amber font-sans" fontSize="11">
              T-bill
            </text>
          </svg>
        </div>

        {/* Readout */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="1m T-bill yield" value={`${yields[0].toFixed(2)}%`} tone={mode === "flight" ? "amber" : "cyan"} />
          <Stat label="2y yield" value={`${yields[2].toFixed(2)}%`} tone="cyan" />
          <Stat label="10y yield" value={`${yields[4].toFixed(2)}%`} tone={mode === "inflation" ? "red" : "cyan"} />
        </div>

        <p className="ops-body mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[15px] leading-7 text-slate-200">
          A <span className="text-accent-amber">very low T-bill yield</span> can
          mean everyone is buying the safest short-term instrument at once — not
          that the government suddenly became more creditworthy.
        </p>
      </InteractiveFrame>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "cyan" | "amber" | "red" }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/50 px-4 py-3">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-sans text-[18px]", tone === "amber" ? "text-accent-amber" : tone === "red" ? "text-accent-red" : "text-accent-cyan")}>
        {value}
      </div>
    </div>
  );
}
