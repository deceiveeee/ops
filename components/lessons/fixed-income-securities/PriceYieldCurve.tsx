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
  modifiedDuration,
  macaulayDuration,
  formatMoney,
  formatPercent,
} from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Price–yield curve for a coupon bond.
 * Face 100, coupon 7%, 4yr, semiannual. Yield slider 2–10%. The curve slopes
 * downward and is convex. A selected point slides; a tangent line shows the
 * duration slope at that point. Steeper slope = more price risk.
 */

const FACE = 100;
const COUPON = 0.07;
const MATURITY = 4;
const FREQ = 2;

export default function PriceYieldCurve() {
  const reduce = useReducedMotion();
  const [yieldPct, setYieldPct] = useState(6);
  const ytm = yieldPct / 100;

  const cfs = useMemo(
    () => couponCashFlows(FACE, COUPON, MATURITY, FREQ),
    [],
  );

  const priceAt = (y: number) => priceCouponBondFromYTM(cfs, y, FREQ);

  const price = priceAt(ytm);

  // duration for the tangent slope (annual modified duration)
  const macPeriods = macaulayDuration(cfs, ytm, FREQ);
  const modPeriods = modifiedDuration(macPeriods, ytm, FREQ);
  const modAnnual = modPeriods / FREQ;

  // SVG geometry
  const W = 560;
  const H = 280;
  const padX = 48;
  const padY = 26;
  const yMin = 0.02;
  const yMax = 0.10;
  // price range across the curve
  const pMin = priceAt(yMax) * 0.9;
  const pMax = priceAt(yMin) * 1.05;

  const xAt = (y: number) =>
    padX + ((y - yMin) / (yMax - yMin)) * (W - padX * 2);
  const yPxAt = (p: number) =>
    H - padY - ((p - pMin) / (pMax - pMin)) * (H - padY * 2);

  const pts: string[] = [];
  for (let y = yMin; y <= yMax + 1e-9; y += 0.002) {
    pts.push(`${xAt(y).toFixed(1)},${yPxAt(priceAt(y)).toFixed(1)}`);
  }
  const path = `M ${pts.join(" L ")}`;

  const dotX = xAt(ytm);
  const dotY = yPxAt(price);

  // tangent line: dP/dy = -modAnnual * P (using decimal yield). Draw across chart width.
  const slopePx =
    (modAnnual * price) / ((yMax - yMin) / (W - padX * 2)); // price drop per pixel-x (approx)
  // We need slope in pixel space: dP/dy in price units per yield unit,
  // converted to px: dyPx = dP * (H - 2padY)/(pMax-pMin) ; dxPx = dy * (W - 2padX)/(yMax-yMin)
  const dPperdy = -modAnnual * price; // negative
  const slopeYperX =
    (dPperdy * (H - padY * 2) / (pMax - pMin)) /
    ((W - padX * 2) / (yMax - yMin));
  const tanX1 = padX;
  const tanX2 = W - padX;
  const tanY1 = dotY - slopeYperX * (dotX - tanX1);
  const tanY2 = dotY + slopeYperX * (tanX2 - dotX);

  // slope steepness gauge
  const slopeAtPoint = Math.abs(dPperdy); // price drop per 1.0 (100%) yield

  return (
    <div className="space-y-6">
      <DefinitionCard term="Price–yield relationship">
        For a coupon bond the curve is{" "}
        <span className="text-slate-50">downward-sloping and convex</span>:
        higher yield means lower price, and the price falls more slowly as
        yields rise. The slope at a point is the bond&apos;s{" "}
        <span className="text-accent-amber">duration</span>.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Price vs yield · coupon bond
            </span>
          </div>
          <span className="font-mono text-[13px] text-accent-amber">
            y = {formatPercent(ytm, 2)} · P = {formatMoney(price)}
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          The curve and its tangent
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          A 4-year, 7% semiannual coupon bond. Drag the yield. The amber dot is
          the price; the dashed line is the duration tangent. A{" "}
          <span className="text-accent-amber">steeper slope means more price
          risk</span> — small yield moves produce large price moves.
        </p>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full min-w-[520px]"
            role="img"
            aria-label={`Price versus yield curve for a 4 year 7 percent coupon bond. At yield ${formatPercent(ytm, 2)} the price is ${formatMoney(price)} and the duration slope is steep.`}
          >
            {/* gridlines + axis labels */}
            {[0.02, 0.04, 0.06, 0.08, 0.10].map((y) => (
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
            ))}
            {[
              Math.round(pMin),
              Math.round((pMin + pMax) / 2),
              Math.round(pMax),
            ].map((p) => (
              <text
                key={p}
                x={padX - 8}
                y={yPxAt(p) + 3}
                textAnchor="end"
                className="fill-slate-500 font-mono"
                fontSize="10"
              >
                {p}
              </text>
            ))}
            <text
              x={W - padX}
              y={H - 4}
              textAnchor="end"
              className="fill-slate-500 font-mono"
              fontSize="10"
            >
              yield →
            </text>
            <text
              x={padX}
              y={padY - 8}
              textAnchor="start"
              className="fill-slate-500 font-mono"
              fontSize="10"
            >
              price
            </text>

            {/* curve */}
            <path d={path} fill="none" stroke="#22d3ee" strokeWidth={2.5} />

            {/* tangent line */}
            <line
              x1={tanX1}
              y1={tanY1}
              x2={tanX2}
              y2={tanY2}
              stroke="rgba(251,191,36,0.6)"
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
            <text
              x={tanX2 - 4}
              y={tanY2 - 6}
              textAnchor="end"
              className="fill-accent-amber/80 font-mono"
              fontSize="10"
            >
              tangent (duration)
            </text>

            {/* moving point */}
            <motion.circle
              cx={dotX}
              cy={dotY}
              r={6}
              fill="#fbbf24"
              stroke="#05070d"
              strokeWidth={2}
              animate={reduce ? false : { r: [6, 7.5, 6] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <line
              x1={dotX}
              y1={dotY}
              x2={dotX}
              y2={H - padY}
              stroke="rgba(251,191,36,0.3)"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* Slider */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <span className="ops-caption text-[11px] text-slate-400">
              Yield (y)
            </span>
            <span className="font-mono text-[13px] text-accent-amber">
              {formatPercent(ytm, 2)}
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={10}
            step={0.1}
            value={yieldPct}
            onChange={(e) => setYieldPct(Number(e.target.value))}
            aria-label="Yield percentage"
            className="mt-2 w-full accent-accent-amber"
          />
          <div className="mt-1 flex justify-between font-mono text-[11px] text-slate-500">
            <span>2%</span>
            <span>10%</span>
          </div>
        </div>

        {/* Readouts */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <ReadCard label="Price" value={formatMoney(price)} tone="cyan" />
          <ReadCard
            label="Mod. duration (annual)"
            value={modAnnual.toFixed(2)}
            tone="amber"
          />
          <ReadCard
            label="Slope |dP/dy|"
            value={slopeAtPoint.toFixed(2)}
            tone="purple"
            caption="price drop per +1.0 yield"
          />
        </div>

        <p className="ops-body mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[14px] leading-6 text-slate-200">
          <span className="text-accent-amber">Steeper slope = more price
          risk.</span> Notice the curve is flattest at high yields (low prices)
          and steepest at low yields (high prices) — the same bond is riskier
          when it trades at a premium.
        </p>
      </InteractiveFrame>
    </div>
  );
}

function ReadCard({
  label,
  value,
  tone,
  caption,
}: {
  label: string;
  value: string;
  tone: "cyan" | "amber" | "purple";
  caption?: string;
}) {
  const accent = {
    cyan: "text-accent-cyan",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[18px]", accent)}>{value}</div>
      {caption && (
        <div className="ops-caption mt-0.5 text-[11px] text-slate-500">
          {caption}
        </div>
      )}
    </div>
  );
}
