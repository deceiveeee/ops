"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
} from "@/components/lessons/intro-course-overview/shared";

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

type TermKey = "t20" | "t50" | "inf";

function annuityPV(c: number, rDec: number, t: number) {
  if (rDec <= 0) return c * t;
  return c * (1 / rDec) * (1 - 1 / Math.pow(1 + rDec, t));
}

const TERM_OPTIONS: { key: TermKey; label: string; t: number | null }[] = [
  { key: "t20", label: "20 years", t: 20 },
  { key: "t50", label: "50 years", t: 50 },
  { key: "inf", label: "Forever", t: null },
];

export default function AnnuityBuilder() {
  const reduce = useReducedMotion();
  const [c, setC] = useState(100000);
  const [r, setR] = useState(10); // percent
  const [selected, setSelected] = useState<TermKey>("t20");
  const [reveal, setReveal] = useState(false);

  const rDec = r / 100;
  const pv20 = annuityPV(c, rDec, 20);
  const pv50 = annuityPV(c, rDec, 50);
  const pvInf = rDec > 0 ? c / rDec : c * 0;
  const ceiling = Math.max(pvInf, pv50, pv20, 1);

  const data: { key: TermKey; label: string; pv: number }[] = [
    { key: "t20", label: "20 years", pv: pv20 },
    { key: "t50", label: "50 years", pv: pv50 },
    { key: "inf", label: "Forever", pv: pvInf },
  ];

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Annuity builder
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          PV = C × (1/r) × [1 − 1/(1+r)^T]
        </span>
      </div>

      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
        An annuity pays a fixed cashflow for a finite number of years, then stops. The longer it runs, the
        closer it gets to a perpetuity — but only the forever version reaches the full perpetuity value.
      </p>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
            <span>Cashflow (C)</span>
            <span className="font-mono text-accent-green">{fmt(c)}</span>
          </span>
          <input
            type="number"
            min={0}
            step={10000}
            value={c}
            aria-label="Annuity cashflow C"
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
            min={1}
            max={20}
            step={0.5}
            value={r}
            aria-label="Discount rate, 1 to 20 percent"
            onChange={(e) => setR(Number(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#22d3ee]"
          />
        </label>
      </div>

      {/* Term toggle */}
      <div className="mt-5">
        <div className="ops-caption text-[11px] text-slate-400">Term</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {TERM_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              aria-pressed={selected === opt.key}
              onClick={() => setSelected(opt.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                selected === opt.key
                  ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                  : "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison bars */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
        <div className="space-y-4">
          {data.map((d) => {
            const frac = d.pv / ceiling;
            const isSel = selected === d.key;
            const isLimit = d.key === "inf";
            return (
              <div key={d.key}>
                <div className="flex items-baseline justify-between">
                  <span
                    className={cn(
                      "ops-body-strong text-[15px]",
                      isSel ? "text-accent-cyan" : "text-slate-200",
                    )}
                  >
                    {d.label}
                    {isLimit && (
                      <span className="ops-caption ml-2 text-[11px] text-accent-green">
                        perpetuity limit
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[15px]",
                      isSel ? "text-accent-cyan" : "text-slate-300",
                    )}
                  >
                    {fmt(d.pv)}
                  </span>
                </div>
                <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      isLimit
                        ? "bg-gradient-to-r from-accent-cyan/60 to-accent-green"
                        : isSel
                          ? "bg-gradient-to-r from-accent-cyan/70 to-accent-cyan"
                          : "bg-accent-cyan/40",
                    )}
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${Math.max(frac * 100, 2)}%` }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="ops-muted mt-4 text-[13px] text-slate-400">
          Selected value: <span className="font-mono text-slate-200">{fmt(data.find((d) => d.key === selected)!.pv)}</span>. The
          50-year bar nearly reaches the forever bar; the 20-year bar sits well below it.
        </p>
      </div>

      {/* Millionaire prompt */}
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <p className="ops-body-strong text-[16px] text-slate-50">
          With C = {fmt(c)} and r = {r.toFixed(1)}% — are you a millionaire today?
        </p>
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={reveal}
            onClick={() => setReveal((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-accent-cyan bg-accent-cyan px-4 py-2 text-[14px] font-medium text-ink-950 transition-all hover:bg-accent-cyan/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            {reveal ? "Hide answer" : "Reveal answer"}
          </button>
        </div>
        {reveal && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-3 rounded-lg border border-accent-green/40 bg-accent-green/10 p-4"
          >
            <div className="ops-caption text-[11px] text-accent-green">Answer</div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-100">
              Only the perpetuity version is worth exactly {fmt(pvInf)} at r = {r.toFixed(1)}%. The annuity
              versions fall short — {fmt(pv20)} for 20 years and {fmt(pv50)} for 50 years — because they stop
              paying.
            </p>
          </motion.div>
        )}
      </div>
    </InteractiveFrame>
  );
}
