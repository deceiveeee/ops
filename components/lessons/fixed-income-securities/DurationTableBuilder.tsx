"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaExplainer,
} from "./shared";
import { macaulayDuration, formatMoney } from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Duration table builder.
 * MIT 4yr Treasury note: face 100, coupon 7%, price 103.50, yield 6%,
 * semiannual (q=2). 8 periods, coupon $3.50, per-period yield 3%.
 * Step-by-step reveal of the table building up to:
 *   D_m = Σ t·PV(CF_t) / Σ PV(CF_t) = 738.28 / 103.50 = 7.13 half-years.
 * Then convert to years: 7.13 / 2 = 3.57 years.
 */

const FACE = 100;
const COUPON = 0.07;
const MATURITY = 4;
const FREQ = 2;
const YTM = 0.06;

export default function DurationTableBuilder() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0); // 0..6
  const [converted, setConverted] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [showFinal, setShowFinal] = useState(false);

  const perRate = YTM / FREQ; // 0.03
  const couponPerPeriod = (FACE * COUPON) / FREQ; // 3.50
  const periods = MATURITY * FREQ; // 8

  const rows = useMemo(() => {
    const arr: {
      t: number;
      cf: number;
      pv: number;
      tPV: number;
    }[] = [];
    for (let t = 1; t <= periods; t++) {
      const cf = t === periods ? couponPerPeriod + FACE : couponPerPeriod;
      const pv = cf / Math.pow(1 + perRate, t);
      arr.push({ t, cf, pv, tPV: t * pv });
    }
    return arr;
  }, [perRate, couponPerPeriod, periods]);

  const sumPV = rows.reduce((s, r) => s + r.pv, 0); // 103.50
  const sumTPV = rows.reduce((s, r) => s + r.tPV, 0); // 738.28
  const macPeriods = sumTPV / sumPV; // 7.13
  const macYears = macPeriods / FREQ; // 3.57

  // cross-check with library
  const cfs = rows.map((r) => r.cf);
  const libMac = macaulayDuration(cfs, YTM, FREQ);

  const steps = [
    "Cash flows",
    "Present values PV(CF_t)",
    "Weighted t·PV(CF_t)",
    "Sum the PV column",
    "Sum the t·PV column",
    "Divide: D_m = Σt·PV / ΣPV",
  ];

  const revealCol = (col: "pv" | "tPV" | "sum") => {
    if (col === "pv") return step >= 1;
    if (col === "tPV") return step >= 2;
    return step >= 3;
  };

  return (
    <div className="space-y-6">
      <DefinitionCard term="Computing Macaulay duration">
        Build a table: each row is a period&apos;s cash flow, its present value,
        and the time-weighted present value. Sum the last two columns and
        divide. The result is duration{" "}
        <span className="text-slate-50">in periods</span> — divide by the
        frequency to annualize.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Duration table builder
            </span>
          </div>
          <div className="font-mono text-[12px] text-slate-400">
            MIT 4yr Treasury · 7% coupon · y=6% · semiannual
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Build the duration, row by row
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          8 half-year periods, coupon {formatMoney(couponPerPeriod)} each,
          per-period yield {(perRate * 100).toFixed(0)}%. Reveal each column in
          turn to see how the weighted average assembles.
        </p>

        {/* Step chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(Math.max(step, i + 1))}
              aria-pressed={step >= i + 1}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                step >= i + 1
                  ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                  : "border-white/10 text-slate-500",
              )}
            >
              <span>{i + 1}</span>
              <span className="hidden sm:inline">{s}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setStep(6);
            }}
            disabled={step >= 6}
            aria-label="Reveal all steps"
            className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:opacity-35"
          >
            Reveal all
          </button>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
          <table className="w-full min-w-[460px] border-collapse text-center">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2.5 text-left ops-caption text-[11px] text-slate-400">
                  t (half-yr)
                </th>
                <th className="px-3 py-2.5 ops-caption text-[11px] text-slate-400">
                  CF_t
                </th>
                <th className="px-3 py-2.5 ops-caption text-[11px] text-slate-400">
                  PV(CF_t)
                </th>
                <th className="px-3 py-2.5 ops-caption text-[11px] text-slate-400">
                  t × PV(CF_t)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.t}
                  onMouseEnter={() => setHoverRow(r.t)}
                  onMouseLeave={() => setHoverRow(null)}
                  onFocus={() => setHoverRow(r.t)}
                  className={cn(
                    "border-b border-white/5 transition-colors",
                    hoverRow === r.t ? "bg-accent-cyan/[0.06]" : "",
                  )}
                >
                  <td className="px-3 py-2 text-left font-mono text-[13px] text-slate-300">
                    {r.t}
                  </td>
                  <td className="px-3 py-2 font-mono text-[13px] text-slate-200">
                    {formatMoney(r.cf)}
                  </td>
                  <td className="px-3 py-2 font-mono text-[13px]">
                    <RevealCell
                      show={revealCol("pv")}
                      tone="cyan"
                      reduce={reduce}
                    >
                      {formatMoney(r.pv)}
                    </RevealCell>
                  </td>
                  <td className="px-3 py-2 font-mono text-[13px]">
                    <RevealCell
                      show={revealCol("tPV")}
                      tone="purple"
                      reduce={reduce}
                    >
                      {formatMoney(r.tPV)}
                    </RevealCell>
                  </td>
                </tr>
              ))}
              {/* Sum rows */}
              <tr className="border-t border-white/15">
                <td className="px-3 py-2.5 text-left font-mono text-[13px] text-slate-300">
                  Σ
                </td>
                <td className="px-3 py-2.5" />
                <td className="px-3 py-2.5 font-mono text-[14px]">
                  <RevealCell
                    show={revealCol("sum")}
                    tone="green"
                    reduce={reduce}
                    strong
                  >
                    {formatMoney(sumPV)}
                  </RevealCell>
                </td>
                <td className="px-3 py-2.5 font-mono text-[14px]">
                  <RevealCell
                    show={step >= 4}
                    tone="green"
                    reduce={reduce}
                    strong
                  >
                    {formatMoney(sumTPV)}
                  </RevealCell>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="ops-caption mt-3 text-[11px] text-slate-500">
            Hover a row to highlight that period on the timeline below.
          </div>
        </div>

        {/* Mini timeline highlight */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/40 p-4">
          <div className="ops-caption text-[11px] text-slate-400">
            Half-year timeline
          </div>
          <div className="mt-3 flex min-w-[460px] items-end gap-1.5">
            {rows.map((r) => (
              <div key={r.t} className="flex-1 text-center">
                <motion.div
                  animate={{
                    height:
                      hoverRow === r.t
                        ? 44
                        : 20 + (r.pv / rows[rows.length - 1].pv) * 24,
                  }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "mx-auto rounded-t",
                    hoverRow === r.t ? "bg-accent-cyan" : "bg-accent-cyan/40",
                  )}
                />
                <div className="ops-caption mt-1 text-[10px] text-slate-500">
                  {r.t}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result + "last row so large" reveal */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
            <div className="ops-caption text-[11px] text-accent-amber">
              Duration in half-years
            </div>
            <AnimatePresence>
              {step >= 5 ? (
                <motion.div
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 font-mono text-[24px] text-white"
                >
                  D_m = {formatMoney(sumTPV)} / {formatMoney(sumPV)} ={" "}
                  <span className="text-accent-amber">
                    {macPeriods.toFixed(2)}
                  </span>
                </motion.div>
              ) : (
                <div className="mt-1 font-mono text-[16px] text-slate-600">
                  Reveal step 6…
                </div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setConverted((c) => !c)}
              disabled={step < 5}
              aria-label="Convert duration to years"
              className="mt-4 rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-2 text-[13px] font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Convert to years
            </button>
            <AnimatePresence>
              {converted && step >= 5 && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 font-mono text-[16px] text-accent-green"
                >
                  {macPeriods.toFixed(2)} / {FREQ} ={" "}
                  <span className="text-accent-green">
                    {macYears.toFixed(2)} years
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="ops-caption text-[11px] text-slate-400">
              Why is the last row so large?
            </div>
            <button
              type="button"
              onClick={() => setShowFinal((s) => !s)}
              aria-expanded={showFinal}
              className="mt-2 rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              {showFinal ? "Hide" : "Reveal"}
            </button>
            <AnimatePresence>
              {showFinal && (
                <motion.p
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="ops-body mt-3 text-[14px] leading-6 text-slate-200"
                >
                  The final row includes the{" "}
                  <span className="text-slate-50">principal</span> (
                  {formatMoney(FACE)}) plus the last coupon. That single payment
                  dominates the weighting — which is why duration sits closer to
                  maturity than to the early coupons.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <FormulaExplainer
          className="mt-4"
          label="Macaulay duration definition"
          tone="amber"
          formula={String.raw`D_m = \frac{\sum_{t=1}^{T} t \cdot PV(CF_t)}{\sum_{t=1}^{T} PV(CF_t)}`}
          substitution={String.raw`D_m = \frac{${sumTPV.toFixed(2)}}{${sumPV.toFixed(2)}} = ${macPeriods.toFixed(2)}\ \text{ half-years}`}
          result={`Annual = ${macPeriods.toFixed(2)} / ${FREQ} = ${macYears.toFixed(2)} yr (lib: ${(libMac / FREQ).toFixed(2)} yr)`}
          interpretation="Weighted-average time to receive the bond's cash flows, in periods. Divide by q to express in years."
        />
      </InteractiveFrame>
    </div>
  );
}

function RevealCell({
  show,
  tone,
  reduce,
  strong,
  children,
}: {
  show: boolean;
  tone: "cyan" | "purple" | "green";
  reduce: boolean | null;
  strong?: boolean;
  children: React.ReactNode;
}) {
  const accent = {
    cyan: "text-accent-cyan",
    purple: "text-accent-purple",
    green: "text-accent-green",
  }[tone];
  return (
    <AnimatePresence mode="wait">
      {show ? (
        <motion.span
          key="on"
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(accent, strong && "font-semibold")}
        >
          {children}
        </motion.span>
      ) : (
        <span key="off" className="text-slate-700">
          ···
        </span>
      )}
    </AnimatePresence>
  );
}
