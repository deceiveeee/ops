"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import {
  couponCashFlows,
  priceCouponBondFromYTM,
  macaulayDuration,
  modifiedDuration,
  bondConvexity,
  formatPercent,
  formatMoney,
} from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Bending price curve.
 * Compare the true (convex) price-yield curve against the duration-only tangent
 * estimate and the duration+convexity estimate. As the yield shock grows, the
 * duration-only line diverges while the convexity-adjusted estimate hugs the
 * true curve.
 */

const FACE = 100;
const COUPON = 0.07;
const MATURITY = 5;
const FREQ = 2;
const BASE_Y = 0.06;

export default function BendingPriceCurve() {
  const reduce = useReducedMotion();
  const [shockBps, setShockBps] = useState(100);

  const cfs = useMemo(
    () => couponCashFlows(FACE, COUPON, MATURITY, FREQ),
    [],
  );
  const basePrice = priceCouponBondFromYTM(cfs, BASE_Y, FREQ);
  const macPeriods = macaulayDuration(cfs, BASE_Y, FREQ);
  const modPeriods = modifiedDuration(macPeriods, BASE_Y, FREQ);
  const modAnnual = modPeriods / FREQ;
  const conv = bondConvexity(cfs, BASE_Y, FREQ);

  const shock = shockBps / 10000;
  const newY = BASE_Y + shock;

  const truePrice = priceCouponBondFromYTM(cfs, newY, FREQ);
  const durOnly = basePrice * (1 - modAnnual * shock);
  const durConv = basePrice * (1 - modAnnual * shock + 0.5 * conv * shock * shock);

  // SVG geometry
  const W = 580;
  const H = 300;
  const padX = 48;
  const padY = 26;
  const yMin = BASE_Y - 0.04;
  const yMax = BASE_Y + 0.04;
  // price range across the curve
  const pAt = (y: number) => priceCouponBondFromYTM(cfs, y, FREQ);
  const pMin = pAt(yMax) * 0.9;
  const pMax = pAt(yMin) * 1.05;

  const xAt = (y: number) =>
    padX + ((y - yMin) / (yMax - yMin)) * (W - padX * 2);
  const yPxAt = (p: number) =>
    H - padY - ((p - pMin) / (pMax - pMin)) * (H - padY * 2);

  // true curve path
  const truePts: string[] = [];
  for (let y = yMin; y <= yMax + 1e-9; y += 0.001) {
    truePts.push(`${xAt(y).toFixed(1)},${yPxAt(pAt(y)).toFixed(1)}`);
  }
  const truePath = `M ${truePts.join(" L ")}`;

  // duration-only tangent line (linear from base)
  const durLine = (y: number) =>
    basePrice * (1 - modAnnual * (y - BASE_Y));
  const tanX1 = padX;
  const tanX2 = W - padX;
  const tanY1 = yPxAt(durLine(yMin));
  const tanY2 = yPxAt(durLine(yMax));

  const newX = xAt(newY);
  const trueDotY = yPxAt(truePrice);
  const durDotY = yPxAt(durOnly);
  const convDotY = yPxAt(durConv);

  const gapDur = Math.abs(truePrice - durOnly);
  const gapConv = Math.abs(truePrice - durConv);

  return (
    <div className="space-y-6">
      <DefinitionCard term="Why the curve bends">
        Duration is a{" "}
        <span className="text-slate-50">linear, first-order</span> estimate — it
        ignores the curve&apos;s curvature. Convexity is the second-order term
        that captures the bend. For small shocks duration is enough; for large
        shocks, convexity matters.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Bending price curve
            </span>
          </div>
          <span className="font-mono text-[12px] text-slate-400">
            base y = {formatPercent(BASE_Y, 2)} · P₀ = {formatMoney(basePrice)}
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Tangent line vs the real curve
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          The cyan curve is the true price. The amber dashed line is the
          duration-only tangent. The purple mark is the convexity-adjusted
          estimate. Shock the yield and watch the duration line pull away while
          convexity stays close.
        </p>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full min-w-[540px]"
            role="img"
            aria-label={`True price-yield curve versus duration tangent and convexity estimate. At a ${shockBps} basis point shock, the duration estimate is off by ${formatMoney(gapDur)} and the convexity estimate by ${formatMoney(gapConv)}.`}
          >
            {/* gridlines */}
            {[0.02, 0.04, 0.06, 0.08, 0.1].map((y) => {
              if (y < yMin || y > yMax) return null;
              return (
                <g key={y}>
                  <line
                    x1={xAt(y)}
                    y1={padY}
                    x2={xAt(y)}
                    y2={H - padY}
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <text
                    x={xAt(y)}
                    y={H - padY + 16}
                    textAnchor="middle"
                    className="fill-slate-500 font-mono"
                    fontSize="10"
                  >
                    {formatPercent(y, 0)}
                  </text>
                </g>
              );
            })}
            {/* true curve */}
            <path d={truePath} fill="none" stroke="#22d3ee" strokeWidth={2.5} />
            <text
              x={xAt(yMin) + 4}
              y={yPxAt(pAt(yMin)) + 4}
              className="fill-accent-cyan/80 font-mono"
              fontSize="10"
            >
              true (convex)
            </text>

            {/* duration-only tangent */}
            <line
              x1={tanX1}
              y1={tanY1}
              x2={tanX2}
              y2={tanY2}
              stroke="rgba(251,191,36,0.7)"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />
            <text
              x={tanX2 - 4}
              y={tanY2 - 6}
              textAnchor="end"
              className="fill-accent-amber/80 font-mono"
              fontSize="10"
            >
              duration-only
            </text>

            {/* vertical shock line */}
            <line
              x1={newX}
              y1={padY}
              x2={newX}
              y2={H - padY}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="3 3"
            />

            {/* base point */}
            <circle
              cx={xAt(BASE_Y)}
              cy={yPxAt(basePrice)}
              r={4}
              fill="#94a3b8"
            />

            {/* true point */}
            <circle cx={newX} cy={trueDotY} r={6} fill="#22d3ee" stroke="#05070d" strokeWidth={2} />
            {/* duration point */}
            <circle cx={newX} cy={durDotY} r={5} fill="#fbbf24" stroke="#05070d" strokeWidth={2} />
            {/* convexity point */}
            <circle cx={newX} cy={convDotY} r={5} fill="#a78bfa" stroke="#05070d" strokeWidth={2} />

            {/* error brackets */}
            <line
              x1={newX + 10}
              y1={durDotY}
              x2={newX + 10}
              y2={trueDotY}
              stroke="rgba(251,191,36,0.5)"
              strokeWidth={1}
            />
            <line
              x1={newX + 18}
              y1={convDotY}
              x2={newX + 18}
              y2={trueDotY}
              stroke="rgba(167,139,250,0.5)"
              strokeWidth={1}
            />
          </svg>
        </div>

        {/* Shock slider */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="ops-caption text-[11px] text-slate-400">
              Yield shock Δy
            </span>
            <span
              className={cn(
                "font-mono text-[13px]",
                shockBps >= 0 ? "text-accent-red" : "text-accent-green",
              )}
            >
              {shockBps >= 0 ? "+" : "−"}
              {Math.abs(shockBps)} bps → y = {formatPercent(newY, 2)}
            </span>
          </div>
          <input
            type="range"
            min={-300}
            max={300}
            step={10}
            value={shockBps}
            onChange={(e) => setShockBps(Number(e.target.value))}
            aria-label="Yield shock in basis points"
            className="mt-2 w-full accent-accent-amber"
          />
          <div className="mt-1 flex justify-between font-mono text-[11px] text-slate-500">
            <span>−300 bps</span>
            <span>+300 bps</span>
          </div>
        </div>

        {/* Price comparison */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <PriceRow label="True price" value={truePrice} tone="cyan" />
          <PriceRow
            label="Duration-only"
            value={durOnly}
            tone="amber"
            err={gapDur}
          />
          <PriceRow
            label="Duration + convexity"
            value={durConv}
            tone="purple"
            err={gapConv}
          />
        </div>

        <p className="ops-body mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[14px] leading-6 text-slate-200">
          <span className="text-accent-amber">Duration-only</span> moves in a
          straight line; the real curve{" "}
          <span className="text-accent-cyan">bends</span>. The gap widens with
          larger shocks — and{" "}
          <span className="text-accent-purple">convexity closes most of that
          gap</span>.
        </p>

        {/* Professor's note */}
        <div className="mt-5 rounded-xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            Professor&apos;s note
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            Today Excel can reprice directly, but duration and convexity give{" "}
            <span className="text-accent-purple">quick risk intuition</span> —
            how much pain a yield move causes before you recompute anything.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function PriceRow({
  label,
  value,
  tone,
  err,
}: {
  label: string;
  value: number;
  tone: "cyan" | "amber" | "purple";
  err?: number;
}) {
  const accent = {
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[20px]", accent)}>
        {formatMoney(value)}
      </div>
      {err !== undefined && (
        <div className="ops-caption mt-0.5 text-[11px] text-slate-500">
          error vs true: {formatMoney(err)}
        </div>
      )}
    </div>
  );
}
