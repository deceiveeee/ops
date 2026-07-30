"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";

/**
 * Section 8 — Coupon bond discounting.
 * A 3-yr 5% bond, F=$1000: Year1 $50, Year2 $50, Year3 $1050.
 * Each cash flow gets its own discount path to today; learner toggles Y1/Y2/Y3
 * rates; PV bars shrink by discount factor and stack into total price.
 */
const FLOWS = [
  { year: 1, amount: 50 },
  { year: 2, amount: 50 },
  { year: 3, amount: 1050 },
];

export default function CouponBondDiscountingVisual() {
  const reduce = useReducedMotion();
  const [rates, setRates] = useState<number[]>([5, 5, 5]); // percent per year

  const pvs = FLOWS.map(
    (f, i) => f.amount / Math.pow(1 + rates[i] / 100, f.year),
  );
  const total = pvs.reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <DefinitionCard term="Coupon bond">
          A bond that makes{" "}
          <span className="text-slate-50">intermediate coupon payments</span>{" "}
          before maturity and repays the principal at maturity. It can trade at
          a discount, par, or premium, and is valued by NPV.
        </DefinitionCard>
        <DefinitionCard term="Our running example">
          A 3-year bond, face{" "}
          <span className="font-sans text-slate-100">$1,000</span>, 5% annual
          coupon = <span className="font-sans text-slate-100">$50</span> per
          year: Year 1 $50, Year 2 $50, Year 3 $1,050.
        </DefinitionCard>
      </div>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Discount each cash flow separately
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Each coupon rides its own discount path to today
        </h4>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_minmax(0,300px)]">
          {/* Discount paths SVG */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-5">
            <DiscountPaths rates={rates} pvs={pvs} reduce={reduce} />
          </div>

          {/* Rate controls */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <div className="ops-caption text-[11px] text-slate-400">
              Discount rate per year
            </div>
            {FLOWS.map((f, i) => (
              <RateRow
                key={f.year}
                year={f.year}
                amount={f.amount}
                ratePct={rates[i]}
                pv={pvs[i]}
                onChange={(v) =>
                  setRates((prev) => prev.map((r, j) => (j === i ? v : r)))
                }
              />
            ))}
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.06] p-4">
              <div className="ops-caption text-[11px] text-accent-green">
                Sum of PVs = bond price
              </div>
              <motion.div
                key={total.toFixed(2)}
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-1 font-sans text-[26px] text-accent-green"
              >
                $
                {total.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </motion.div>
              <p className="ops-muted mt-1 text-[12px] text-slate-400">
                A coupon bond is just a stack of separately-discounted cash
                flows.
              </p>
            </div>
          </div>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function RateRow({
  year,
  amount,
  ratePct,
  pv,
  onChange,
}: {
  year: number;
  amount: number;
  ratePct: number;
  pv: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">
          Year {year} (${amount})
        </span>
        <span className="font-sans text-[13px] text-slate-100">
          {ratePct.toFixed(1)}% → PV ${pv.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={15}
        step={0.5}
        value={ratePct}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`Discount rate for year ${year} cash flow`}
        className="mt-2 w-full accent-accent-cyan"
      />
    </div>
  );
}

function DiscountPaths({
  rates,
  pvs,
  reduce,
}: {
  rates: number[];
  pvs: number[];
  reduce: boolean | null;
}) {
  const W = 620;
  const H = 280;
  const padX = 70;
  const padY = 28;
  const span = (W - padX * 2) / 3;
  const xAt = (y: number) => padX + span * (y - 1);
  const todayX = 28;
  const maxBar = Math.max(...FLOWS.map((f) => f.amount));
  const barScale = (H / 2 - padY - 10) / maxBar;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full min-w-[520px]"
      role="img"
      aria-label="Each coupon discounted along its own path back to today"
    >
      {/* today axis */}
      <line
        x1={todayX}
        y1={padY}
        x2={todayX}
        y2={H - padY}
        stroke="rgba(34,211,238,0.4)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />
      <text
        x={todayX}
        y={padY - 8}
        textAnchor="middle"
        className="fill-accent-cyan font-sans"
        fontSize="11"
      >
        today
      </text>
      {/* year axis */}
      <line
        x1={padX}
        y1={H - padY}
        x2={W - 20}
        y2={H - padY}
        stroke="rgba(255,255,255,0.2)"
      />
      {[1, 2, 3].map((y) => (
        <text
          key={y}
          x={xAt(y)}
          y={H - padY + 18}
          textAnchor="middle"
          className="fill-slate-400 font-sans"
          fontSize="12"
        >
          Y{y}
        </text>
      ))}

      {FLOWS.map((f, i) => {
        const x = xAt(f.year);
        const r = rates[i] / 100;
        const faceH = f.amount * barScale;
        const pvH = pvs[i] * barScale;
        const color = f.year === 3 ? "#34d399" : "#22d3ee";
        // discount path: curved line from top of face bar to top of pv bar (at todayX)
        const midX = (todayX + x) / 2;
        return (
          <g key={f.year}>
            {/* future face bar */}
            <rect
              x={x - 14}
              y={H - padY - faceH}
              width={28}
              height={faceH}
              rx={3}
              fill={color}
              fillOpacity={0.85}
            />
            <text
              x={x}
              y={H - padY - faceH - 6}
              textAnchor="middle"
              fill={color}
              className="font-sans"
              fontSize="11"
            >
              ${f.amount}
            </text>
            {/* discount path */}
            <motion.path
              d={`M ${x} ${H - padY - faceH} Q ${midX} ${H - padY - faceH * 0.5} ${todayX} ${H - padY - pvH}`}
              fill="none"
              stroke="rgba(251,191,36,0.55)"
              strokeWidth="1.4"
              strokeDasharray="3 3"
              animate={reduce ? undefined : { pathLength: [0, 1] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
            {/* PV bar at today */}
            <rect
              x={todayX - 12}
              y={H - padY - pvH}
              width={24}
              height={pvH}
              rx={3}
              fill={color}
              fillOpacity={0.55}
              style={reduce ? undefined : { transition: "all 0.3s ease" }}
            />
            <text
              x={todayX}
              y={H - padY - pvH - 6}
              textAnchor="middle"
              className="fill-slate-200 font-sans"
              fontSize="10"
            >
              ${pvs[i].toFixed(0)}
            </text>
            {/* rate label */}
            <text
              x={midX}
              y={H - padY - faceH * 0.5 + 3}
              textAnchor="middle"
              className="fill-accent-amber font-sans"
              fontSize="10"
            >
              {formatPct(r)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function formatPct(r: number) {
  return `${(r * 100).toFixed(1)}%`;
}
