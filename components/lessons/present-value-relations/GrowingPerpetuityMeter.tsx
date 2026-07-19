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

export default function GrowingPerpetuityMeter() {
  const [c, setC] = useState(100);
  const [r, setR] = useState(10); // percent
  const [g, setG] = useState(3); // percent

  const rDec = r / 100;
  const gDec = g / 100;
  const diff = r - g; // percentage points
  const diffSmall = Math.abs(diff) < 0.05;

  // status
  let status: "ok" | "equal" | "exceeds" = "ok";
  if (diffSmall) status = "equal";
  else if (diff < 0) status = "exceeds";

  const pv = status === "ok" ? c / (diff / 100) : null;

  // stability gauge: position of g relative to r
  const ratio = r > 0 ? g / r : 2;
  const fillFrac = Math.min(Math.max(ratio, 0), 1);
  let gaugeColor = "bg-accent-green";
  if (status === "exceeds") gaugeColor = "bg-accent-red";
  else if (fillFrac >= 0.8) gaugeColor = "bg-accent-amber";
  else if (fillFrac >= 0.6) gaugeColor = "bg-accent-amber/80";

  const borderTone =
    status === "ok"
      ? "border-white/15"
      : status === "equal"
        ? "border-accent-amber/50"
        : "border-accent-red/50";

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Growing perpetuity meter
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          PV = C ÷ (r − g)
        </span>
      </div>

      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
        Growth pushes value up, but the formula only holds while the discount rate stays above the growth rate.
        Drag g toward r and watch the stability gauge turn cautionary — past r, the value stops converging.
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
            aria-label="Growing perpetuity cashflow C"
            onChange={(e) => setC(Math.max(0, Number(e.target.value) || 0))}
            className="ops-body mt-2 w-full rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 font-mono text-[15px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
          />
        </label>
        <label className="block">
          <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
            <span>Discount rate (r)</span>
            <span className="font-mono text-accent-cyan">{r.toFixed(1)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={r}
            aria-label="Discount rate r, 0 to 20 percent"
            onChange={(e) => setR(Number(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#22d3ee]"
          />
        </label>
        <label className="block">
          <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
            <span>Growth rate (g)</span>
            <span className={cn("font-mono", status === "ok" ? "text-accent-purple" : "text-accent-red")}>
              {g.toFixed(1)}%
            </span>
          </span>
          <input
            type="range"
            min={0}
            max={20}
            step={0.5}
            value={g}
            aria-label="Growth rate g, 0 to 20 percent"
            onChange={(e) => setG(Number(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#a78bfa]"
          />
        </label>
      </div>

      {/* Stability gauge */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
        <div className="flex items-center justify-between">
          <span className="ops-caption text-[11px] text-slate-400">
            Stability gauge
          </span>
          <span
            className={cn(
              "font-mono text-[12px]",
              status === "exceeds"
                ? "text-accent-red"
                : fillFrac >= 0.8
                  ? "text-accent-amber"
                  : "text-accent-green",
            )}
          >
            r − g = {diff.toFixed(1)} pp
          </span>
        </div>
        <div className="relative mt-3 h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
          <motion.div
            className={cn("h-full rounded-full", gaugeColor)}
            animate={{ width: `${fillFrac * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          {/* convergence-limit marker at r (100%) */}
          <div
            className="absolute bottom-0 top-0 right-0 w-[2px] bg-accent-cyan"
            aria-hidden
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="ops-caption text-[11px] text-slate-500">g = 0%</span>
          <span className="ops-caption text-[11px] text-accent-cyan">
            limit: g = r ({r.toFixed(1)}%)
          </span>
        </div>
      </div>

      {/* Formula / blocked result */}
      <div className="mt-5">
        {status === "ok" ? (
          <FormulaCard label="Growing perpetuity" ariaLabel={`Present value equals cashflow ${fmt(c)} divided by r minus g equals ${fmt(pv as number)}`}>
            <Var>PV</Var> ={" "}
            <Frac num={<><Var>C</Var></>} den={<><Var>r</Var> − <Var>g</Var></>} /> ={" "}
            <Frac num={<>{fmt(c)}</>} den={<>{(diff / 100).toFixed(3)}</>} /> ={" "}
            <span className="text-accent-cyan">{fmt(pv as number)}</span>
          </FormulaCard>
        ) : (
          <div
            className={cn(
              "ops-interactive-frame relative overflow-hidden rounded-2xl border bg-white/[0.02] px-5 py-5 sm:px-6",
              borderTone,
            )}
          >
            <div className="ops-caption mb-3 flex items-center gap-2 text-[11px] text-accent-red">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-red" aria-hidden />
              Formula blocked · no finite value
            </div>
            <div className="font-mono text-[17px] leading-relaxed text-slate-500 sm:text-[19px]">
              <Var>PV</Var> ={" "}
              <Frac num={<><Var>C</Var></>} den={<><Var>r</Var> − <Var>g</Var></>} /> ={" "}
              <span className="text-accent-red">undefined</span>
            </div>
            <p
              className={cn(
                "ops-body-strong mt-3 text-[16px]",
                status === "equal" ? "text-accent-amber" : "text-accent-red",
              )}
            >
              {status === "equal"
                ? "Value does not converge. With r = g the denominator is zero."
                : "Formula cannot be used because growth exceeds the discount rate forever."}
            </p>
          </div>
        )}
      </div>
    </InteractiveFrame>
  );
}
