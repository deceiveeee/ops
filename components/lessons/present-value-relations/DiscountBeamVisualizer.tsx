"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "@/components/lessons/intro-course-overview/shared";
import { FormulaCard, Var, Sup, Frac } from "./FormulaCard";

const MAXPX = 130;

function fmt(n: number) {
  if (Math.abs(n) >= 1000) return "$" + Math.round(n).toLocaleString("en-US");
  if (Math.abs(n) >= 1) return "$" + n.toFixed(2);
  return "$" + n.toFixed(3);
}

export default function DiscountBeamVisualizer() {
  const reduce = useReducedMotion();
  const [cf, setCf] = useState(1);
  const [year, setYear] = useState(10);
  const [rate, setRate] = useState(8); // percent
  const [playId, setPlayId] = useState(0);

  const rateDec = rate / 100;
  const pv = cf / Math.pow(1 + rateDec, year);

  // value-at-each-year k (0..year): value of the future CF measured at year k.
  const bars = Array.from({ length: year + 1 }, (_, k) => {
    const factor = Math.pow(1 + rateDec, year - k);
    const frac = 1 / factor; // 1 at k=year, smallest at k=0
    return { k, frac, px: Math.max(3, frac * MAXPX) };
  });

  const discount = () => setPlayId((p) => p + 1);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Discount beam visualizer
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          PV = CF ÷ (1 + r)^t
        </span>
      </div>

      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
        A future cashflow sits out on the timeline. Run it back through the Year 0 conversion gate and watch it
        shrink: the higher the rate, the faster distant dollars shrink into present value.
      </p>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="ops-caption text-[11px] text-slate-400">
            Cashflow amount (CF)
          </span>
          <input
            type="number"
            min={0}
            step={1}
            value={cf}
            aria-label="Cashflow amount"
            onChange={(e) => setCf(Math.max(0, Number(e.target.value) || 0))}
            className="ops-body mt-2 w-full rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 font-mono text-[15px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
          />
        </label>
        <label className="block">
          <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
            <span>Year (t)</span>
            <span className="font-mono text-accent-amber">{year}</span>
          </span>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={year}
            aria-label="Year, 1 to 30"
            onChange={(e) => setYear(Number(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#fbbf24]"
          />
        </label>
        <label className="block">
          <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
            <span>Discount rate (r)</span>
            <span className="font-mono text-accent-cyan">{rate.toFixed(1)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={rate}
            aria-label="Discount rate, 0 to 20 percent"
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#22d3ee]"
          />
        </label>
      </div>

      {/* Timeline visualization */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
        <div className="relative flex h-[150px] items-end gap-1" role="img" aria-label={`Discount beam from year ${year} back to year 0. Present value is ${fmt(pv)}.`}>
          {/* Year 0 gate */}
          <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[3px] bg-accent-cyan/70" aria-hidden />
          <div className="pointer-events-none absolute bottom-full left-0 mb-1 -ml-1">
            <span className="ops-caption whitespace-nowrap text-[10px] text-accent-cyan">
              Year 0 · PV gate
            </span>
          </div>

          {bars.map((b) => {
            const isLast = b.k === year;
            const isFirst = b.k === 0;
            return (
              <motion.div
                key={`${playId}-${b.k}`}
                initial={reduce ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{
                  duration: 0.45,
                  delay: reduce ? 0 : (year - b.k) * 0.08,
                  ease: "easeOut",
                }}
                style={{ height: b.px, transformOrigin: "bottom" }}
                className={cn(
                  "relative flex-1 rounded-t-sm",
                  isFirst
                    ? "bg-accent-cyan"
                    : isLast
                      ? "bg-accent-green"
                      : "bg-accent-amber/70",
                )}
                aria-hidden
              />
            );
          })}
        </div>
        {/* axis */}
        <div className="mt-1 h-px w-full bg-accent-amber/40" aria-hidden />
        <div className="mt-2 flex items-center justify-between">
          <span className="ops-caption text-[11px] text-accent-cyan">
            Year 0 · PV {fmt(pv)}
          </span>
          <span className="ops-caption text-[11px] text-accent-green">
            Year {year} · CF {fmt(cf)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={discount}
          className="inline-flex items-center justify-center rounded-full border border-accent-cyan bg-accent-cyan px-5 py-2.5 text-[14px] font-medium text-ink-950 transition-all hover:bg-accent-cyan/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
        >
          Discount to today
        </button>
        <span className="ops-muted text-[13px] text-slate-400">
          Replays the beam from Year {year} back through the gate.
        </span>
      </div>

      <div className="mt-5">
        <FormulaCard label="Present value" ariaLabel={`Present value equals ${fmt(cf)} divided by 1 plus ${rate} percent to the power of ${year}, equals ${fmt(pv)}`}>
          <Var>PV</Var> ={" "}
          <Frac num={<><Var>CF</Var></>} den={<>(1+<Var>r</Var>)<Sup>{year}</Sup></>} /> ={" "}
          <Frac num={<>{fmt(cf)}</>} den={<>(1+{(rate / 100).toFixed(3)})<Sup>{year}</Sup></>} /> ={" "}
          <span className="text-accent-cyan">{fmt(pv)}</span>
        </FormulaCard>
      </div>
    </InteractiveFrame>
  );
}
