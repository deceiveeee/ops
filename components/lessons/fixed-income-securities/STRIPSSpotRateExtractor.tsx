"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  InlineMath,
  BlockMath,
  FormulaExplainer,
} from "./shared";
import { solveZeroCouponRate, formatPercent, formatPercentTex } from "@/lib/fixed-income";

/**
 * Section 3 — Extract spot rates from STRIPS discount bond prices.
 * MIT 2001-08-01 data. Clicking a row fills the formula and reveals the rate.
 * A $1 payment travels back through a discount tunnel.
 */

type Row = {
  t: number;
  label: string;
  price: number;
};

const ROWS: Row[] = [
  { t: 0.25, label: "3-Mo", price: 0.991 },
  { t: 0.5, label: "6-Mo", price: 0.983 },
  { t: 1, label: "1-Yr", price: 0.967 },
  { t: 2, label: "2-Yr", price: 0.927 },
  { t: 5, label: "5-Yr", price: 0.797 },
  { t: 10, label: "10-Yr", price: 0.605 },
  { t: 30, label: "30-Yr", price: 0.187 },
];

export default function STRIPSSpotRateExtractor() {
  const [selectedIdx, setSelectedIdx] = useState(4); // default 5-year
  const row = ROWS[selectedIdx];
  const rate = solveZeroCouponRate(1, row.price, row.t);

  // all computed rates for the mini curve
  const allRates = ROWS.map((r) => ({
    t: r.t,
    r: solveZeroCouponRate(1, r.price, r.t),
    label: r.label,
  }));

  return (
    <div className="space-y-6">
      <DefinitionCard term="STRIPS spot rate extraction">
        A STRIPS discount bond pays exactly $1 at maturity. From its price{" "}
        <InlineMath>{"P_0"}</InlineMath> and maturity{" "}
        <InlineMath>{"T"}</InlineMath>, we solve for today&apos;s spot rate{" "}
        <InlineMath>{"r_{0,T}"}</InlineMath>.
      </DefinitionCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="ops-caption mb-3 flex items-center gap-2 text-[11px] text-accent-cyan">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent-cyan"
              aria-hidden
            />
            Zero-coupon bond price
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/50 px-4 py-4 text-slate-50">
            <BlockMath>{"P_0 = \\frac{F}{(1+r_{0,T})^T}"}</BlockMath>
          </div>
        </div>
        <FormulaExplainer
          label="Solve for the spot rate (F = 1)"
          tone="cyan"
          formula={"r_{0,T} = \\left(\\frac{1}{P_0}\\right)^{1/T} - 1"}
          variables={[
            { symbol: "P_0", description: "price today (per $1 face)" },
            { symbol: "T", description: "maturity in years" },
            { symbol: "r_{0,T}", description: "today's T-year spot rate" },
          ]}
        />
      </div>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              STRIPS prices &middot; 2001-08-01
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Pick a maturity, extract its spot rate
        </h4>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,360px)_1fr]">
          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                    Maturity
                  </th>
                  <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                    Price / $1
                  </th>
                  <th className="px-4 py-2.5 ops-caption text-[11px] text-slate-400">
                    Spot rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => {
                  const isSel = i === selectedIdx;
                  const rr = solveZeroCouponRate(1, r.price, r.t);
                  return (
                    <tr key={r.label}>
                      <td className="p-0">
                        <button
                          type="button"
                          aria-pressed={isSel}
                          aria-label={`Select ${r.label} maturity, price ${r.price} per dollar`}
                          onClick={() => setSelectedIdx(i)}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-cyan/60",
                            isSel
                              ? "bg-accent-cyan/10"
                              : "hover:bg-white/[0.03]",
                          )}
                        >
                          <span
                            className={cn(
                              "font-mono text-[14px]",
                              isSel ? "text-accent-cyan" : "text-slate-200",
                            )}
                          >
                            {r.label}
                          </span>
                          <span className="ops-caption text-[11px] text-slate-500">
                            {r.t} yr
                          </span>
                        </button>
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 font-mono text-[14px]",
                          isSel ? "text-slate-50" : "text-slate-300",
                        )}
                      >
                        {r.price.toFixed(3)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 font-mono text-[14px]",
                          isSel ? "text-accent-cyan" : "text-slate-300",
                        )}
                      >
                        {isFinite(rr) ? formatPercent(rr) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right: formula substitution + tunnel */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIdx}
                initial={false}
                animate={{ opacity: 1 }}
                className="rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5"
              >
                <div className="ops-caption text-[11px] text-accent-cyan">
                  Worked substitution &middot; {row.label}
                </div>
                <div className="mt-3 space-y-3 text-slate-100">
                  <div className="rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2">
                    <InlineMath>{`${row.price.toFixed(3)} = \\frac{1}{(1+r)^{${row.t}}}`}</InlineMath>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2">
                    <InlineMath>{`r = \\left(\\frac{1}{${row.price.toFixed(3)}}\\right)^{1/${row.t}} - 1`}</InlineMath>
                  </div>
                  <div className="rounded-lg border border-accent-cyan/20 bg-accent-cyan/[0.06] px-3 py-2 text-accent-cyan">
                    <InlineMath>{`r_{0,${row.t}} \\approx ${isFinite(rate) ? formatPercentTex(rate) : "\\text{—}"}`}</InlineMath>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Discount tunnel */}
            <DiscountTunnel price={row.price} maturity={row.t} rate={rate} />

            {/* Mini curve */}
            <MiniCurve points={allRates} selectedT={row.t} />
          </div>
        </div>

        {/* MIT 5-year callout */}
        <div className="mt-6 rounded-2xl border border-accent-purple/30 bg-accent-purple/[0.05] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            Worked example &middot; 5-year STRIPS (MIT 15.401)
          </div>
          <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
            The 5-year STRIPS costs 0.797 per $1 of face. With{" "}
            <InlineMath>{"F = 1"}</InlineMath>:{" "}
            <InlineMath>{"0.797 = \\frac{1}{(1+r)^5}"}</InlineMath>, so{" "}
            <span className="text-accent-cyan">
              <InlineMath>
                {
                  "r = \\left(\\tfrac{1}{0.797}\\right)^{1/5} - 1 \\approx 4.64\\%"
                }
              </InlineMath>
            </span>
            .
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function DiscountTunnel({
  price,
  maturity,
  rate,
}: {
  price: number;
  maturity: number;
  rate: number;
}) {
  const reduce = useReducedMotion();
  const ratio = Math.min(1, Math.max(0.05, price));
  // tunnel length scales with maturity (log-ish so 30yr isn't absurd)
  const tunnelWidth = Math.min(100, 18 + Math.log10(maturity + 1) * 55);
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-ink-950/50 p-5">
      <div className="ops-caption text-[11px] text-slate-400">
        $1 future payment travels back through the discount tunnel
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        {/* Today */}
        <div className="text-center">
          <div className="ops-caption text-[11px] text-accent-cyan">Today</div>
          <motion.div
            key={price}
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-2 flex items-center justify-center rounded-lg border border-accent-cyan/50 bg-accent-cyan/10 px-3 py-2 font-mono text-[14px] text-accent-cyan"
            style={{ minWidth: 78 }}
          >
            ${price.toFixed(3)}
          </motion.div>
        </div>

        {/* Tunnel */}
        <div className="relative mx-1 h-10 flex-1">
          <div
            className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-gradient-to-r from-accent-cyan/60 to-accent-amber/60"
            style={{ width: `${tunnelWidth}%` }}
            aria-hidden
          />
          <motion.span
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white"
            style={{ boxShadow: "0 0 12px rgba(255,255,255,0.7)" }}
            initial={reduce ? false : { left: "0%" }}
            animate={
              reduce
                ? { left: "0%" }
                : { left: ["0%", `${tunnelWidth}%`, "0%"] }
            }
            transition={{
              duration: 1.8 + Math.log10(maturity + 1),
              repeat: reduce ? 0 : Infinity,
              ease: "easeInOut",
            }}
            aria-hidden
          />
          <div className="absolute -bottom-5 left-0 ops-caption text-[10px] text-slate-500">
            longer maturity &rarr; longer tunnel &rarr; more discounting
          </div>
        </div>

        {/* Future */}
        <div className="text-center">
          <div className="ops-caption text-[11px] text-accent-amber">
            Year {maturity}
          </div>
          <div
            className="mt-2 flex items-center justify-center rounded-lg border border-accent-amber/50 bg-accent-amber/10 px-3 py-2 font-mono text-[14px] text-accent-amber"
            style={{ minWidth: 78 }}
          >
            $1.000
          </div>
        </div>
      </div>
      <p className="ops-muted mt-8 text-center text-[12px] text-slate-400">
        The $1 payment is fixed; today it is worth{" "}
        <span className="text-accent-cyan">{(ratio * 100).toFixed(1)}%</span> of
        face &rarr; spot rate{" "}
        <span className="text-accent-cyan">
          {isFinite(rate) ? formatPercent(rate) : "—"}
        </span>
      </p>
    </div>
  );
}

function MiniCurve({
  points,
  selectedT,
}: {
  points: { t: number; r: number; label: string }[];
  selectedT: number;
}) {
  const reduce = useReducedMotion();
  const W = 520;
  const H = 150;
  const padX = 36;
  const padY = 20;
  const maxT = 30;
  const minR = 0.03;
  const maxR = 0.06;
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
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[420px]"
        role="img"
        aria-label="Spot rate curve across STRIPS maturities"
      >
        <line
          x1={padX}
          y1={H - padY}
          x2={W - padX}
          y2={H - padY}
          stroke="rgba(255,255,255,0.2)"
        />
        <line
          x1={padX}
          y1={padY}
          x2={padX}
          y2={H - padY}
          stroke="rgba(255,255,255,0.2)"
        />
        <text
          x={padX - 4}
          y={padY + 6}
          textAnchor="end"
          className="fill-slate-500 font-mono"
          fontSize="10"
        >
          6%
        </text>
        <text
          x={padX - 4}
          y={H - padY}
          textAnchor="end"
          className="fill-slate-500 font-mono"
          fontSize="10"
        >
          3%
        </text>
        {!reduce && (
          <motion.path
            d={path}
            fill="none"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}
        {reduce && (
          <path
            d={path}
            fill="none"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        {points.map((p) => {
          const sel = Math.abs(p.t - selectedT) < 0.001;
          return (
            <g key={p.label}>
              <circle
                cx={xAt(p.t)}
                cy={yAt(p.r)}
                r={sel ? 5.5 : 3.5}
                fill={sel ? "#22d3ee" : "rgba(148,163,184,0.7)"}
              />
              <text
                x={xAt(p.t)}
                y={H - 6}
                textAnchor="middle"
                className="fill-slate-500 font-mono"
                fontSize="9"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="ops-caption mt-1 text-center text-[11px] text-slate-400">
        Spot rate curve (selected maturity highlighted)
      </div>
    </div>
  );
}
