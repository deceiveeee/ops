"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import { formatPercent } from "@/lib/fixed-income";

/**
 * Lesson 3.3 — The market as a thermometer.
 * Toggle a regime (Panic / Calmer / Inflation concern) and watch the short and
 * long ends of the Treasury curve move. The point is not whether each price is
 * "correct" but what information each price reflects.
 */

type Regime = "panic" | "calmer" | "inflation";

type Point = { m: number; y: number };

const BASELINE: Point[] = [
  { m: 1, y: 0.040 },
  { m: 2, y: 0.043 },
  { m: 5, y: 0.045 },
  { m: 10, y: 0.047 },
  { m: 20, y: 0.050 },
];

const REGIMES: Record<
  Regime,
  {
    label: string;
    tone: "amber" | "cyan" | "red";
    curve: Point[];
    shortPrice: string;
    longPrice: string;
    shortNote: string;
    longNote: string;
    headline: string;
  }
> = {
  panic: {
    label: "Panic",
    tone: "red",
    curve: [
      { m: 1, y: 0.020 },
      { m: 2, y: 0.028 },
      { m: 5, y: 0.038 },
      { m: 10, y: 0.045 },
      { m: 20, y: 0.050 },
    ],
    shortPrice: "Rises",
    longPrice: "Steady",
    shortNote: "Short Treasury prices rise, yields fall — flight to liquidity.",
    longNote: "Long end barely moves; the demand is for safe, liquid cash now.",
    headline: "Flight to liquidity",
  },
  calmer: {
    label: "Calmer",
    tone: "cyan",
    curve: [
      { m: 1, y: 0.042 },
      { m: 2, y: 0.044 },
      { m: 5, y: 0.046 },
      { m: 10, y: 0.047 },
      { m: 20, y: 0.050 },
    ],
    shortPrice: "Falls",
    longPrice: "Steady",
    shortNote: "Short yields move up — less urgent demand for safety.",
    longNote: "Investors no longer pay up for liquidity at the front end.",
    headline: "Less urgent demand for safety",
  },
  inflation: {
    label: "Inflation concern",
    tone: "amber",
    curve: [
      { m: 1, y: 0.040 },
      { m: 2, y: 0.043 },
      { m: 5, y: 0.050 },
      { m: 10, y: 0.058 },
      { m: 20, y: 0.065 },
    ],
    shortPrice: "Steady",
    longPrice: "Falls",
    shortNote: "Short end holds — near-term policy not yet the issue.",
    longNote: "Long yields rise — compensation for purchasing-power risk.",
    headline: "Compensation for purchasing-power risk",
  },
};

const toneRing: Record<string, string> = {
  amber: "border-accent-amber/60 bg-accent-amber/15 text-accent-amber",
  cyan: "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan",
  red: "border-accent-red/60 bg-accent-red/15 text-accent-red",
};

export default function MarketThermometerBridge() {
  const reduce = useReducedMotion();
  const [regime, setRegime] = useState<Regime>("panic");
  const cfg = REGIMES[regime];

  // SVG geometry
  const W = 560;
  const H = 260;
  const padX = 46;
  const padY = 26;
  const mMin = 0;
  const mMax = 20;
  const yMin = 0;
  const yMax = 0.08;

  const xAt = (m: number) =>
    padX + ((m - mMin) / (mMax - mMin)) * (W - padX * 2);
  const yAt = (y: number) =>
    H - padY - ((y - yMin) / (yMax - yMin)) * (H - padY * 2);

  const buildPath = (pts: Point[]) => {
    if (pts.length === 0) return "";
    return pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.m)} ${yAt(p.y)}`)
      .join(" ");
  };

  const basePath = buildPath(BASELINE);
  const livePath = buildPath(cfg.curve);

  return (
    <div className="space-y-6">
      <DefinitionCard term="The market is a thermometer, not a judge">
        A Treasury price does not announce whether it is{" "}
        <span className="text-slate-50">fair</span>. It reports what investors
        collectively demand right now for time, safety, and inflation risk.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Market regime bridge
            </span>
          </div>
          <div className="inline-flex rounded-full border border-white/15 bg-ink-950/60 p-1">
            {(Object.keys(REGIMES) as Regime[]).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={regime === r}
                onClick={() => setRegime(r)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  regime === r
                    ? toneRing[REGIMES[r].tone]
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {REGIMES[r].label}
              </button>
            ))}
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          What information does each price reflect?
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Switch the regime. Watch which end of the curve bends. Each move is a
          signal about <span className="text-accent-cyan">what investors
          want</span> — not a verdict on whether the bond is correctly priced.
        </p>

        {/* Yield curve SVG */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full min-w-[520px]"
            role="img"
            aria-label={`Treasury yield curve under the ${cfg.label} regime. ${cfg.shortNote} ${cfg.longNote}`}
          >
            {/* gridlines */}
            {[0, 0.02, 0.04, 0.06, 0.08].map((y) => (
              <g key={y}>
                <line
                  x1={padX}
                  y1={yAt(y)}
                  x2={W - padX}
                  y2={yAt(y)}
                  stroke="rgba(255,255,255,0.06)"
                />
                <text
                  x={padX - 8}
                  y={yAt(y) + 3}
                  textAnchor="end"
                  className="fill-slate-500 font-sans"
                  fontSize="10"
                >
                  {formatPercent(y, 1)}
                </text>
              </g>
            ))}
            {[1, 5, 10, 20].map((m) => (
              <text
                key={m}
                x={xAt(m)}
                y={H - padY + 16}
                textAnchor="middle"
                className="fill-slate-500 font-sans"
                fontSize="10"
              >
                {m}y
              </text>
            ))}
            {/* baseline curve */}
            <path
              d={basePath}
              fill="none"
              stroke="rgba(148,163,184,0.4)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
            {/* live curve */}
            <motion.path
              key={regime}
              d={livePath}
              fill="none"
              stroke={
                cfg.tone === "red"
                  ? "#f87171"
                  : cfg.tone === "amber"
                    ? "#fbbf24"
                    : "#22d3ee"
              }
              strokeWidth={2.5}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            />
            {/* points on live curve */}
            {cfg.curve.map((p) => (
              <circle
                key={p.m}
                cx={xAt(p.m)}
                cy={yAt(p.y)}
                r={4}
                fill="#05070d"
                stroke={
                  cfg.tone === "red"
                    ? "#f87171"
                    : cfg.tone === "amber"
                      ? "#fbbf24"
                      : "#22d3ee"
                }
                strokeWidth={2}
              />
            ))}
            <text
              x={W - padX}
              y={padY - 8}
              textAnchor="end"
              className="fill-slate-500 font-sans"
              fontSize="10"
            >
              dashed = baseline
            </text>
          </svg>
        </div>

        {/* Price reaction cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PriceCard
            tag="Short end (1–2y)"
            priceMove={cfg.shortPrice}
            note={cfg.shortNote}
            tone={cfg.tone}
          />
          <PriceCard
            tag="Long end (10–20y)"
            priceMove={cfg.longPrice}
            note={cfg.longNote}
            tone={cfg.tone}
          />
        </div>

        {/* Headline */}
        <AnimatePresence mode="wait">
          <motion.div
            key={regime}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "mt-5 rounded-xl border p-4",
              cfg.tone === "red"
                ? "border-accent-red/30 bg-accent-red/[0.05]"
                : cfg.tone === "amber"
                  ? "border-accent-amber/30 bg-accent-amber/[0.05]"
                  : "border-accent-cyan/30 bg-accent-cyan/[0.05]",
            )}
          >
            <div className="ops-caption text-[11px] text-slate-400">
              Regime reading
            </div>
            <p className="ops-body-strong mt-1.5 text-[16px] leading-7 text-slate-50">
              {cfg.headline}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Professor's note */}
        <div className="mt-5 rounded-xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            Professor&apos;s note
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            Do not ask whether the price is correct. Ask{" "}
            <span className="text-accent-purple">
              what information the price reflects
            </span>
            .
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function PriceCard({
  tag,
  priceMove,
  note,
  tone,
}: {
  tag: string;
  priceMove: string;
  note: string;
  tone: "amber" | "cyan" | "red";
}) {
  const accent =
    tone === "red"
      ? "text-accent-red"
      : tone === "amber"
        ? "text-accent-amber"
        : "text-accent-cyan";
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="ops-caption text-[11px] text-slate-400">{tag}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="ops-caption text-[11px] text-slate-500">
          Treasury price
        </span>
        <span className={cn("font-sans text-[18px]", accent)}>
          {priceMove}
        </span>
      </div>
      <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
        {note}
      </p>
    </div>
  );
}
