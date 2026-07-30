"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  Feedback,
} from "@/components/lessons/intro-course-overview/shared";

function fmt(n: number) {
  return "$" + Math.round(n).toLocaleString("en-US");
}
function fmtCents(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(n: number, digits = 3) {
  return (n * 100).toFixed(digits) + "%";
}

type Freq = { label: string; n: number };
const FREQS: Freq[] = [
  { label: "Annually", n: 1 },
  { label: "Semiannually", n: 2 },
  { label: "Quarterly", n: 4 },
  { label: "Monthly", n: 12 },
  { label: "Daily", n: 365 },
];

const W = 320;
const H = 120;

export default function CompoundingSimulator() {
  const reduce = useReducedMotion();
  const [principal, setPrincipal] = useState(10000);
  const [apr, setApr] = useState(6.75); // percent
  const [n, setN] = useState(365);
  const [reflect, setReflect] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const aprDec = apr / 100;
  const perPeriod = aprDec / n;
  const ear = Math.pow(1 + perPeriod, n) - 1;
  const finalBalance = principal * (1 + perPeriod) ** n;

  // balance curve sampled across periods
  const steps = Math.min(n, 60);
  const pts: { x: number; y: number }[] = [];
  const span = finalBalance - principal;
  for (let i = 0; i <= steps; i++) {
    const period = Math.round((n / steps) * i);
    const bal = principal * Math.pow(1 + perPeriod, period);
    const x = (i / steps) * W;
    const y = span > 0 ? H - ((bal - principal) / span) * H : H;
    pts.push({ x, y });
  }
  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${W} ${H} L0 ${H} Z`;

  const reflectCorrect = reflect === "interest";
  const showReflect = checked && reflect !== null;

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Compounding simulator
          </span>
        </div>
        <span className="ops-caption text-[11px] text-slate-400">
          EAR = (1 + r/n)^n − 1
        </span>
      </div>

      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
        When interest compounds more than once a year, you earn interest on interest. The quoted APR understates
        the true annual growth — the effective annual rate (EAR) is what you actually receive.
      </p>

      {/* Controls */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="ops-caption text-[11px] text-slate-400">Principal</span>
          <input
            type="number"
            min={0}
            step={1000}
            value={principal}
            aria-label="Principal amount"
            onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value) || 0))}
            className="ops-body mt-2 w-full rounded-lg border border-white/15 bg-ink-950/60 px-3 py-2 font-sans text-[15px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30"
          />
        </label>
        <label className="block">
          <span className="ops-caption flex items-center justify-between text-[11px] text-slate-400">
            <span>APR (r)</span>
            <span className="font-sans text-accent-amber">{apr.toFixed(2)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={20}
            step={0.05}
            value={apr}
            aria-label="Annual percentage rate, 0 to 20 percent"
            onChange={(e) => setApr(Number(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#fbbf24]"
          />
        </label>
        <div>
          <span className="ops-caption text-[11px] text-slate-400">
            Compounding frequency
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FREQS.map((f) => (
              <button
                key={f.n}
                type="button"
                aria-pressed={n === f.n}
                onClick={() => setN(f.n)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  n === f.n
                    ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                    : "border-white/20 text-slate-200 hover:border-accent-cyan/60",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="ops-caption mt-1.5 block text-[11px] text-slate-500">
            n = {n} periods / year
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-slate-400">Per-period rate</div>
          <div className="mt-1 font-sans text-[15px] text-slate-100">{pct(perPeriod, 4)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-slate-400">Final balance</div>
          <div className="mt-1 font-sans text-[15px] text-accent-green">{fmtCents(finalBalance)}</div>
        </div>
        <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.07] p-4">
          <div className="ops-caption text-[11px] text-accent-green">EAR</div>
          <div className="mt-1 font-sans text-[15px] text-accent-green">{pct(ear)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-slate-400">APR (quoted)</div>
          <div className="mt-1 font-sans text-[15px] text-slate-300">{apr.toFixed(3)}%</div>
        </div>
      </div>

      {ear > aprDec && (
        <p className="ops-muted mt-3 text-[13px] text-slate-400">
          EAR {pct(ear)} &gt; APR {apr.toFixed(3)}% — compounding {n}× per year adds{" "}
          <span className="text-accent-green">{pct(ear - aprDec)}</span> of extra annual growth.
        </p>
      )}

      {/* Balance curve */}
      <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
        <div className="ops-caption text-[11px] text-slate-400">
          Balance curve over one year
        </div>
        <div className="mt-3 overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[140px] w-full min-w-[300px]"
            role="img"
            aria-label={`Balance grows from ${fmt(principal)} to ${fmt(finalBalance)} over ${n} compounding periods. Effective annual rate ${pct(ear)}.`}
          >
            <defs>
              <linearGradient id="compArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="compLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            {/* grid */}
            {[0.25, 0.5, 0.75].map((g) => (
              <line
                key={g}
                x1={0}
                x2={W}
                y1={H * g}
                y2={H * g}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={1}
              />
            ))}
            <motion.path
              d={areaPath}
              fill="url(#compArea)"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#compLine)"
              strokeWidth={2}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </svg>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="ops-caption text-[11px] text-slate-500">Start · {fmtCents(principal)}</span>
          <span className="ops-caption text-[11px] text-accent-green">
            End · {fmtCents(finalBalance)}
          </span>
        </div>
      </div>

      {/* Reflection */}
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <p className="ops-body-strong text-[16px] text-slate-50">
          Reflection — why does compounding make EAR higher than APR?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "interest", label: "Compounding earns interest on interest" },
            { id: "same", label: "EAR always equals APR" },
            { id: "round", label: "Banks round the rate upward" },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={checked}
              aria-pressed={reflect === c.id}
              onClick={() => setReflect(c.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                !checked &&
                  (reflect === c.id
                    ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                    : "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan"),
                checked && reflect === c.id && c.id === "interest" && "border-accent-green bg-accent-green/15 text-accent-green",
                checked && reflect === c.id && c.id !== "interest" && "border-accent-red bg-accent-red/15 text-accent-red",
                checked && reflect !== c.id && "border-white/10 text-slate-500",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setChecked(true)}
            disabled={reflect === null || checked}
            className={cn(
              "inline-flex items-center justify-center rounded-full border border-accent-cyan bg-accent-cyan px-4 py-2 text-[14px] font-medium text-ink-950 transition-all hover:bg-accent-cyan/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              (reflect === null || checked) && "cursor-not-allowed opacity-50",
            )}
          >
            Check answer
          </button>
          {checked && (
            <button
              type="button"
              onClick={() => {
                setChecked(false);
                setReflect(null);
              }}
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-4 py-2 text-[14px] text-slate-100 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              Retry
            </button>
          )}
        </div>
        {showReflect && (
          <Feedback status={reflectCorrect ? "correct" : "incorrect"}>
            {reflectCorrect
              ? "Correct. Each period's interest is added to the balance, so later periods earn interest on a larger base — that is what lifts EAR above APR."
              : "Not quite. EAR exceeds APR because interest is credited more than once a year and each new balance earns interest on the interest already added."}
          </Feedback>
        )}
      </div>
    </InteractiveFrame>
  );
}
