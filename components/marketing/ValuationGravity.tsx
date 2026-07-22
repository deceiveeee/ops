"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Section 06 — Valuation.
 *
 * One assumption slider, one implied value, one before-and-after response.
 * Removed: FORCE SYSTEM label, valuation gravity copy, Bear/Base/Bull chips
 * that compete with the slider, orbit ring animation, side stabilizer bar.
 *
 * Deterministic toy model: simple perpetual cash flow growing at g,
 * discounted at r. Implied value = CF next year / (r − g). Slider changes r.
 */
const CF_NEXT = 10; // $10B next-year cash flow (illustrative)
const GROWTH = 4; // 4% perpetual growth

function impliedValue(r: number): number {
  const denom = r - GROWTH;
  if (denom <= 0) return NaN;
  return CF_NEXT / (denom / 100);
}

const R_MIN = 6;
const R_MAX = 12;
const R_STEP = 0.25;
const BASE_R = 9;

function fmt(n: number): string {
  if (!isFinite(n)) return "—";
  return `$${Math.round(n).toLocaleString()}B`;
}

export default function ValuationGravity() {
  const reduce = useReducedMotion();
  const [r, setR] = useState(BASE_R);
  const value = impliedValue(r);
  const baseValue = impliedValue(BASE_R);
  const delta = value - baseValue;
  const deltaPct = baseValue ? (delta / baseValue) * 100 : 0;

  return (
    <section
      id="section-value"
      className="hp-section-pad relative w-full overflow-hidden border-t border-white/5"
    >
      <div className="hp-container">
        <div className="hp-marker">06 / Value</div>
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-section mt-5"
        >
          Value depends on cash flow, growth, and required return.
        </motion.h2>
        <p className="hp-lead mt-6">
          Change one assumption to see how value responds.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Assumption control */}
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="discount-rate" className="text-[15px] font-medium text-slate-300">
                Discount rate
              </label>
              <span className="hp-numeric text-[24px] text-white sm:text-[28px]">
                {r.toFixed(2)}%
              </span>
            </div>
            <input
              id="discount-rate"
              type="range"
              min={R_MIN}
              max={R_MAX}
              step={R_STEP}
              value={r}
              onChange={(e) => setR(parseFloat(e.target.value))}
              aria-label="Discount rate"
              aria-valuemin={R_MIN}
              aria-valuemax={R_MAX}
              aria-valuenow={r}
              aria-valuetext={`${r.toFixed(2)} percent`}
              className="mt-5 w-full accent-accent-cyan"
            />
            <div className="mt-2 flex justify-between text-[13px] text-slate-500">
              <span className="tabular-nums">{R_MIN}%</span>
              <span className="tabular-nums">{R_MAX}%</span>
            </div>
            <p className="hp-body mt-6 max-w-sm">
              Growth held at {GROWTH}%; next-year cash flow held at ${CF_NEXT}B.
              Required return is the only variable.
            </p>
          </div>

          {/* Implied value — one dominant readout */}
          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <div className="text-[15px] font-medium text-slate-400">
              Implied value
            </div>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={r}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  "hp-numeric mt-2 text-[64px] leading-none sm:text-[88px]",
                  isFinite(value) ? "text-accent-cyan" : "text-accent-red",
                )}
              >
                {fmt(value)}
              </motion.div>
            </AnimatePresence>
            <div className="mt-5 flex items-baseline gap-4">
              <span className="text-[14px] text-slate-500">From base</span>
              <span
                className={cn(
                  "hp-numeric text-[20px]",
                  delta > 0
                    ? "text-accent-green"
                    : delta < 0
                      ? "text-accent-red"
                      : "text-slate-300",
                )}
              >
                {delta >= 0 ? "+" : "−"}
                {fmt(Math.abs(delta))}
                <span className="ml-2 text-[15px]">
                  ({delta >= 0 ? "+" : "−"}
                  {Math.abs(deltaPct).toFixed(1)}%)
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
