"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  ConceptTag,
  InlineMath,
} from "./shared";
import { solveZeroCouponRate, formatPercent } from "@/lib/fixed-income";

/**
 * Section 4 — The term structure of interest rates.
 * Observing many discount bond prices lets us infer the full {r_{0,1}...r_{0,T}}
 * mapping — the term structure. A yield curve plots rates vs maturities.
 */

type Shape = "upward" | "flat" | "inverted" | "humped";

const PRICE_SEED: { t: number; price: number }[] = [
  { t: 1, price: 0.9615 },
  { t: 2, price: 0.9246 },
  { t: 3, price: 0.883 },
  { t: 5, price: 0.7835 },
  { t: 7, price: 0.695 },
  { t: 10, price: 0.585 },
  { t: 20, price: 0.35 },
  { t: 30, price: 0.215 },
];

const SHAPE_PRESETS: Record<
  Shape,
  {
    label: string;
    beginner: string;
    careful: string;
    rates: Record<number, number>;
  }
> = {
  upward: {
    label: "Upward",
    beginner: "Rates are expected to rise.",
    careful:
      "May reflect expected future rates plus compensation for maturity/liquidity risk.",
    rates: { 1: 0.03, 2: 0.034, 5: 0.041, 10: 0.046, 30: 0.05 },
  },
  flat: {
    label: "Flat",
    beginner: "Rates are expected to stay about the same.",
    careful:
      "Maturity adds little yield difference; expectations and premia roughly offset.",
    rates: { 1: 0.04, 2: 0.04, 5: 0.04, 10: 0.04, 30: 0.04 },
  },
  inverted: {
    label: "Inverted",
    beginner: "Rates are expected to fall.",
    careful:
      "May reflect expected rate cuts, recession concerns, or demand for longer-term bonds.",
    rates: { 1: 0.05, 2: 0.047, 5: 0.042, 10: 0.039, 30: 0.038 },
  },
  humped: {
    label: "Humped",
    beginner: "Middle maturities have the highest rates.",
    careful:
      "Short rates are low, medium rates peak, long rates ease — often tied to policy and term-premia mixes.",
    rates: { 1: 0.035, 2: 0.042, 5: 0.048, 10: 0.044, 30: 0.041 },
  },
};

export default function TermStructureTransformer() {
  return (
    <div className="space-y-6">
      <DefinitionCard term="Term structure of interest rates">
        Observing many discount bond prices ({" "}
        <InlineMath>{"P_{0,1} \\ldots P_{0,T}"}</InlineMath>) lets us infer the
        set of spot rates ( <InlineMath>{"r_{0,1} \\ldots r_{0,T}"}</InlineMath>
        ) — this maturity-to-rate mapping is the{" "}
        <span className="text-slate-50">term structure</span>.
      </DefinitionCard>

      <div className="flex flex-wrap gap-2.5">
        <ConceptTag concept="market">Maturity &rarr; rate</ConceptTag>
        <ConceptTag concept="value">Yield curve</ConceptTag>
        <ConceptTag concept="risk">Not a guarantee of the future</ConceptTag>
      </div>

      <p className="ops-body text-[15px] leading-7 text-slate-200">
        A <span className="text-accent-cyan">yield curve</span> plots rates
        against maturities. An <span className="text-slate-50">upward</span>{" "}
        curve often suggests higher future rates and/or term premia; a{" "}
        <span className="text-slate-50">downward/inverted</span> curve suggests
        lower future rates and/or risk and liquidity effects. But the curve does{" "}
        <span className="text-slate-50">not</span> guarantee the future.
      </p>

      <TermStructureInteractive />
    </div>
  );
}

function TermStructureInteractive() {
  const reduce = useReducedMotion();
  const [shape, setShape] = useState<Shape>("upward");

  // base curve from prices
  const priceCurve = PRICE_SEED.map((p) => ({
    t: p.t,
    r: solveZeroCouponRate(1, p.price, p.t),
  }));

  const preset = SHAPE_PRESETS[shape];
  const presetPoints = Object.entries(preset.rates).map(([t, r]) => ({
    t: Number(t),
    r,
  }));

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Prices &rarr; rates &rarr; curve
          </span>
        </div>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Transform prices into rates
      </h4>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,220px)_1fr_minmax(0,300px)]">
        {/* Left: price list */}
        <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            Discount prices (input)
          </div>
          <ul className="mt-3 space-y-1.5">
            {PRICE_SEED.map((p) => (
              <li
                key={p.t}
                className="flex items-center justify-between font-sans text-[13px] text-slate-300"
              >
                <span className="text-slate-400">{p.t} yr</span>
                <motion.span
                  key={p.price}
                  initial={reduce ? false : { opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  className="text-slate-200"
                >
                  {p.price.toFixed(4)}
                </motion.span>
              </li>
            ))}
          </ul>
        </div>

        {/* Middle: calc engine */}
        <div className="rounded-2xl border border-accent-purple/30 bg-accent-purple/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            Calc engine{" "}
            <InlineMath>
              {"r = \\left(\\tfrac{1}{P}\\right)^{1/T} - 1"}
            </InlineMath>
          </div>
          <div className="mt-3 space-y-1.5">
            {priceCurve.map((p) => (
              <div
                key={p.t}
                className="flex items-center justify-between gap-2 font-sans text-[13px]"
              >
                <span className="text-slate-400">{p.t} yr</span>
                <span className="text-slate-500">&rarr;</span>
                <span className="text-accent-cyan">
                  {isFinite(p.r) ? formatPercent(p.r) : "—"}
                </span>
              </div>
            ))}
          </div>
          <p className="ops-muted mt-4 text-[12px] leading-5 text-slate-400">
            Each price becomes a spot rate. Plotting rate vs maturity gives the
            term structure.
          </p>
        </div>

        {/* Right: yield curve */}
        <CurveChart points={presetPoints} title={`${preset.label} curve`} />
      </div>

      {/* Shape toggle */}
      <div className="mt-6">
        <div className="ops-caption mb-2 text-[11px] text-slate-400">
          Curve shape
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SHAPE_PRESETS) as Shape[]).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={shape === s}
              onClick={() => setShape(s)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                shape === s
                  ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                  : "border-white/20 text-slate-200 hover:bg-white/5",
              )}
            >
              {SHAPE_PRESETS[s].label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="ops-caption text-[11px] text-slate-400">
              Simple read
            </div>
            <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
              {preset.beginner}
            </p>
          </div>
          <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.05] p-4">
            <div className="ops-caption text-[11px] text-accent-amber">
              Careful read
            </div>
            <p className="ops-body mt-1.5 text-[14px] leading-6 text-slate-200">
              {preset.careful}
            </p>
          </div>
        </div>
      </div>
    </InteractiveFrame>
  );
}

function CurveChart({
  points,
  title,
}: {
  points: { t: number; r: number }[];
  title: string;
}) {
  const reduce = useReducedMotion();
  const W = 300;
  const H = 200;
  const padX = 34;
  const padY = 20;
  const maxT = 30;
  const minR = 0.03;
  const maxR = 0.052;
  const xAt = (t: number) =>
    padX + ((W - padX * 2) * Math.log(t + 1)) / Math.log(maxT + 1);
  const yAt = (r: number) =>
    H -
    padY -
    ((H - padY * 2) * (Math.min(maxR, Math.max(minR, r)) - minR)) /
      (maxR - minR);

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(p.t)} ${yAt(p.r)}`)
    .join(" ");

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
      <div className="ops-caption text-[11px] text-slate-400">{title}</div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 w-full min-w-[260px]"
        role="img"
        aria-label={title}
      >
        <line
          x1={padX}
          y1={H - padY}
          x2={W - 6}
          y2={H - padY}
          stroke="rgba(255,255,255,0.2)"
        />
        <line
          x1={padX}
          y1={6}
          x2={padX}
          y2={H - padY}
          stroke="rgba(255,255,255,0.2)"
        />
        <text
          x={padX - 4}
          y={12}
          textAnchor="end"
          className="fill-slate-500 font-sans"
          fontSize="9"
        >
          5%
        </text>
        <text
          x={padX - 4}
          y={H - padY}
          textAnchor="end"
          className="fill-slate-500 font-sans"
          fontSize="9"
        >
          3%
        </text>
        <motion.path
          d={path}
          fill="none"
          stroke="rgba(167,139,250,0.85)"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
        {points.map((p) => (
          <circle key={p.t} cx={xAt(p.t)} cy={yAt(p.r)} r="4" fill="#a78bfa" />
        ))}
      </svg>
    </div>
  );
}
