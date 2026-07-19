"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "@/components/lessons/intro-course-overview/shared";
import { FormulaCard, Var, Frac } from "./FormulaCard";

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export default function PerpetuityLab() {
  const [c, setC] = useState(100);
  const [r, setR] = useState(10); // percent

  const valid = r > 0;
  const pv = valid ? c / (r / 100) : null;
  // meter fraction relative to a generous ceiling (PV at r=2.5%, C=100 → 4000)
  const meterFrac = pv !== null ? Math.min(pv / 4000, 1) : 0;

  const applyPreset = () => {
    setC(100);
    setR(5);
  };

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Perpetuity lab
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          PV = C ÷ r
        </span>
      </div>

      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
        A perpetuity pays the same cashflow every period, forever. Even though the stream never ends, its value
        is finite — and it rises fast as the discount rate falls.
      </p>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
            <span>Cashflow (C)</span>
            <span className="font-mono text-accent-green">{fmt(c)}</span>
          </span>
          <input
            type="number"
            min={0}
            step={10}
            value={c}
            aria-label="Perpetuity cashflow C"
            onChange={(e) => setC(Math.max(0, Number(e.target.value) || 0))}
            className="ops-body mt-2 w-full rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 font-mono text-[15px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
          />
        </label>
        <label className="block">
          <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
            <span>Discount rate (r)</span>
            <span className={cn("font-mono", valid ? "text-accent-cyan" : "text-accent-red")}>
              {r.toFixed(1)}%
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={r}
            aria-label="Discount rate, 0 to 20 percent"
            onChange={(e) => setR(Number(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#22d3ee]"
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={applyPreset}
            className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2.5 text-[14px] text-slate-100 transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Preset: C = 100, r = 5% → PV = 2,000
          </button>
        </div>
      </div>

      {/* Infinite stream */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
        <div className="ops-caption text-[11px] text-slate-400">
          Infinite cashflow stream
        </div>
        <div className="mt-3 flex items-end gap-1.5" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => {
            const op = Math.max(0.18, 1 - i * 0.06);
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-accent-green"
                  style={{ height: 46, opacity: op }}
                />
                <span className="font-mono text-[10px] text-slate-500">{i + 1}</span>
              </div>
            );
          })}
          <div className="flex h-[46px] flex-col justify-center pl-1 font-mono text-[16px] text-accent-green/70">
            …∞
          </div>
        </div>
        <p className="ops-muted mt-3 text-[13px] text-slate-400">
          Each bar is {fmt(c)}. They fade as distance grows — exactly what discounting does.
        </p>
      </div>

      {/* PV meter */}
      <div className="mt-5">
        {valid ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="ops-caption text-[11px] text-slate-400">
                Present value
              </span>
              <span className="font-mono text-[22px] text-accent-cyan">
                {fmt(pv as number)}
              </span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-accent-cyan/70 to-accent-cyan"
                animate={{ width: `${meterFrac * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <p className="ops-muted mt-2 text-[13px] text-slate-400">
              Lower r → larger PV. At r = {r.toFixed(1)}% the meter reads {Math.round(meterFrac * 100)}% of the
              reference ceiling.
            </p>
          </>
        ) : (
          <div className="rounded-xl border border-accent-red/40 bg-accent-red/10 p-4">
            <div className="ops-caption text-[11px] text-accent-red">
              Invalid rate
            </div>
            <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
              Discount rate must be greater than zero.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5">
        <FormulaCard label="Perpetuity" ariaLabel={`Present value equals cashflow ${fmt(c)} divided by rate ${(r / 100).toFixed(3)}, equals ${pv !== null ? fmt(pv) : "undefined"}`}>
          <Var>PV</Var> = <Frac num={<><Var>C</Var></>} den={<><Var>r</Var></>} /> ={" "}
          <Frac num={<>{fmt(c)}</>} den={<>{(r / 100).toFixed(3)}</>} /> ={" "}
          <span className={valid ? "text-accent-cyan" : "text-accent-red"}>
            {valid ? fmt(pv as number) : "—"}
          </span>
        </FormulaCard>
      </div>
    </InteractiveFrame>
  );
}
