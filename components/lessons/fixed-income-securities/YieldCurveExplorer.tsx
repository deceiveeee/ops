"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";

/**
 * Section 10 — Yield curve explorer.
 * STATIC fallback Treasury-like data (no live fetch). Buttons switch between
 * current/fallback and four shape presets. Hover/tap tooltip on points.
 * Curve morphs smoothly; steepness badge + market read update.
 */

type Point = { t: number; label: string; y: number };

const FALLBACK: Point[] = [
  { t: 1 / 12, label: "1Mo", y: 4.3 },
  { t: 0.25, label: "3Mo", y: 4.35 },
  { t: 0.5, label: "6Mo", y: 4.2 },
  { t: 1, label: "1Yr", y: 3.95 },
  { t: 2, label: "2Yr", y: 3.8 },
  { t: 3, label: "3Yr", y: 3.85 },
  { t: 5, label: "5Yr", y: 4.0 },
  { t: 7, label: "7Yr", y: 4.15 },
  { t: 10, label: "10Yr", y: 4.3 },
  { t: 20, label: "20Yr", y: 4.65 },
  { t: 30, label: "30Yr", y: 4.55 },
];

const SHAPES: Record<string, { label: string; points: Point[]; read: string }> = {
  upward: {
    label: "Upward",
    read: "Longer maturities have higher yields.",
    points: [
      { t: 1, label: "1Yr", y: 3.0 },
      { t: 2, label: "2Yr", y: 3.4 },
      { t: 5, label: "5Yr", y: 4.1 },
      { t: 10, label: "10Yr", y: 4.6 },
      { t: 30, label: "30Yr", y: 5.0 },
    ],
  },
  flat: {
    label: "Flat",
    read: "Maturity adds little yield difference.",
    points: [
      { t: 1, label: "1Yr", y: 4.0 },
      { t: 2, label: "2Yr", y: 4.0 },
      { t: 5, label: "5Yr", y: 4.0 },
      { t: 10, label: "10Yr", y: 4.0 },
      { t: 30, label: "30Yr", y: 4.0 },
    ],
  },
  inverted: {
    label: "Inverted",
    read: "Short rates are above long rates.",
    points: [
      { t: 1, label: "1Yr", y: 5.0 },
      { t: 2, label: "2Yr", y: 4.7 },
      { t: 5, label: "5Yr", y: 4.2 },
      { t: 10, label: "10Yr", y: 3.9 },
      { t: 30, label: "30Yr", y: 3.8 },
    ],
  },
  humped: {
    label: "Humped",
    read: "Middle maturities are highest.",
    points: [
      { t: 1, label: "1Yr", y: 3.5 },
      { t: 2, label: "2Yr", y: 4.2 },
      { t: 5, label: "5Yr", y: 4.8 },
      { t: 10, label: "10Yr", y: 4.4 },
      { t: 30, label: "30Yr", y: 4.1 },
    ],
  },
};

type Sel = "current" | "upward" | "flat" | "inverted" | "humped";

export default function YieldCurveExplorer() {
  const [sel, setSel] = useState<Sel>("current");
  const [hover, setHover] = useState<number | null>(null);

  const points: Point[] = sel === "current" ? FALLBACK : SHAPES[sel].points;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Yield curve">
        A plot of yields or rates across maturities. Public curves often use
        U.S. Treasuries as the benchmark. The curve is one of the most-watched
        signals in finance.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Static reference data (no live feed)
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Explore curve shapes
        </h4>

        <div className="mt-4 flex flex-wrap gap-2">
          {([
            ["current", "Current (fallback)"],
            ["upward", SHAPES.upward.label],
            ["flat", SHAPES.flat.label],
            ["inverted", SHAPES.inverted.label],
            ["humped", SHAPES.humped.label],
          ] as [Sel, string][]).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={sel === id}
              onClick={() => setSel(id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                sel === id
                  ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                  : "border-white/20 text-slate-200 hover:bg-white/5",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(0,260px)]">
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
            <CurveChart points={points} hover={hover} setHover={setHover} />
          </div>
          <div className="space-y-3">
            <SteepnessBadge points={points} />
            <div className="rounded-xl border border-accent-purple/30 bg-accent-purple/[0.06] p-4">
              <div className="ops-caption text-[11px] text-accent-purple">Market read</div>
              <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
                {sel === "current" ? "Mixed shape; short rates near long rates." : SHAPES[sel].read}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="ops-caption text-[11px] text-slate-400">Clarification</div>
              <p className="ops-body mt-1.5 text-[13px] leading-6 text-slate-300">
                Treasury par yield curves are not identical to zero-coupon
                STRIPS spot curves, but they are useful for visual intuition.
              </p>
            </div>
          </div>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function CurveChart({
  points,
  hover,
  setHover,
}: {
  points: Point[];
  hover: number | null;
  setHover: (i: number | null) => void;
}) {
  const reduce = useReducedMotion();
  const W = 620;
  const H = 280;
  const padX = 46;
  const padY = 24;
  const maxT = 30;
  const yMin = 2.5;
  const yMax = 5.5;
  const xAt = (t: number) =>
    padX + ((W - padX * 2) * Math.log(t * 12 + 1)) / Math.log(maxT * 12 + 1);
  const yAt = (y: number) =>
    H - padY - ((H - padY * 2) * (Math.min(yMax, Math.max(yMin, y)) - yMin)) / (yMax - yMin);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.t).toFixed(1)} ${yAt(p.y).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full min-w-[520px]"
      role="img"
      aria-label="Yield curve across maturities"
    >
      {/* gridlines */}
      {[3, 4, 5].map((gy) => (
        <g key={gy}>
          <line x1={padX} y1={yAt(gy)} x2={W - 10} y2={yAt(gy)} stroke="rgba(255,255,255,0.08)" />
          <text x={padX - 6} y={yAt(gy) + 3} textAnchor="end" className="fill-slate-500 font-sans" fontSize="9">{gy}%</text>
        </g>
      ))}
      <line x1={padX} y1={H - padY} x2={W - 10} y2={H - padY} stroke="rgba(255,255,255,0.2)" />
      <line x1={padX} y1={8} x2={padX} y2={H - padY} stroke="rgba(255,255,255,0.2)" />

      <motion.path
        key={path}
        d={path}
        fill="none"
        stroke="rgba(34,211,238,0.85)"
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />

      {points.map((p, i) => {
        const cx = xAt(p.t);
        const cy = yAt(p.y);
        const isHover = hover === i;
        return (
          <g
            key={p.label}
            tabIndex={0}
            role="button"
            aria-label={`${p.label}: ${p.y.toFixed(2)} percent`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => setHover(isHover ? null : i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setHover(isHover ? null : i);
              }
            }}
            style={{ cursor: "pointer" }}
            className="focus:outline-none"
          >
            {/* invisible hit area */}
            <rect x={cx - 16} y={cy - 16} width={32} height={32} fill="transparent" />
            <circle cx={cx} cy={cy} r={isHover ? 6 : 4} fill="#22d3ee" stroke="#05070d" strokeWidth="1.5" />
            <text x={cx} y={H - padY + 16} textAnchor="middle" className="fill-slate-400 font-sans" fontSize="9">{p.label}</text>
            {isHover && (
              <g>
                <rect x={cx - 34} y={cy - 34} width={68} height={20} rx={4} fill="#0a0e18" stroke="rgba(34,211,238,0.5)" />
                <text x={cx} y={cy - 20} textAnchor="middle" className="fill-accent-cyan font-sans" fontSize="11">
                  {p.y.toFixed(2)}%
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function SteepnessBadge({ points }: { points: Point[] }) {
  const sorted = useMemo(
    () => [...points].sort((a, b) => a.t - b.t),
    [points],
  );
  if (sorted.length < 2) return null;
  const short = sorted[0].y;
  const long = sorted[sorted.length - 1].y;
  const slope = long - short; // percentage points
  const label =
    Math.abs(slope) < 0.15
      ? "Flat"
      : slope > 0
        ? "Upward"
        : "Inverted";
  const tone =
    label === "Upward"
      ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
      : label === "Inverted"
        ? "border-accent-red/40 bg-accent-red/10 text-accent-red"
        : "border-white/30 bg-white/5 text-slate-200";
  return (
    <div className={cn("rounded-xl border p-4", tone)}>
      <div className="ops-caption text-[11px]">Shape</div>
      <div className="mt-1 font-sans text-[22px]">{label}</div>
      <div className="ops-muted mt-1 font-sans text-[12px]">
        {short.toFixed(2)}% → {long.toFixed(2)}% (Δ {slope >= 0 ? "+" : "−"}
        {Math.abs(slope).toFixed(2)} pp)
      </div>
    </div>
  );
}
