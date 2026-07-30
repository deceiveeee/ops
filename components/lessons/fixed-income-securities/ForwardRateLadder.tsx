"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaCard,
  Var,
  Sub,
  Sup,
} from "./shared";
import { forwardRateFromSpotRates, formatPercent } from "@/lib/fixed-income";

/**
 * Section 5 — Forward rates.
 * A forward rate is agreed today for a transaction between future dates.
 * One-year forward f_t spans (t-1 -> t). Visual: timeline 0–5 with spot
 * and forward brackets. Default: r_{0,1}=5%, r_{0,2}=7% -> f_2 = 9.04%.
 */
export default function ForwardRateLadder() {
  return (
    <div className="space-y-6">
      <DefinitionCard term="Forward rate">
        A rate <span className="text-slate-50">agreed today</span> for a
        transaction that happens between two{" "}
        <span className="text-slate-50">future dates</span>. The one-year
        forward <Var>f</Var>
        <Sub>t</Sub> is the rate agreed today for lending or borrowing from{" "}
        <Var>t</Var>&minus;1 to <Var>t</Var>.
      </DefinitionCard>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormulaCard
          label="Forward rate from prices"
          ariaLabel="P sub 0 t minus 1 over P sub 0 t equals 1 plus f sub t"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Var>P</Var>
            <Sub>0,t&minus;1</Sub>
            <span>/</span>
            <Var>P</Var>
            <Sub>0,t</Sub>
            <span>= 1+</span>
            <Var>f</Var>
            <Sub>t</Sub>
            <span className="mx-1 text-slate-500">&rArr;</span>
            <Var>f</Var>
            <Sub>t</Sub>
            <span>=</span>
            <Var>P</Var>
            <Sub>0,t&minus;1</Sub>
            <span>/</span>
            <Var>P</Var>
            <Sub>0,t</Sub>
            <span>&minus; 1</span>
          </div>
        </FormulaCard>
        <FormulaCard
          label="Forward rate from spot rates"
          ariaLabel="1 plus f sub t equals 1 plus r 0 t raised to t over 1 plus r 0 t minus 1 raised to t minus 1"
        >
          <div className="flex flex-wrap items-center gap-2">
            1+<Var>f</Var>
            <Sub>t</Sub>
            <span>=</span>
            <span>
              (1+<Var>r</Var>
              <Sub>0,t</Sub>)<Sup>t</Sup> / (1+<Var>r</Var>
              <Sub>0,t&minus;1</Sub>)<Sup>t&minus;1</Sup>
            </span>
          </div>
        </FormulaCard>
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.05] p-5">
        <div className="ops-caption text-[11px] text-accent-amber">
          Future spot rate vs forward rate
        </div>
        <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
          <span className="text-slate-50">Future spot rate</span> = the actual
          rate that will exist in the future (unknown today).{" "}
          <span className="text-slate-50">Forward rate</span> = the rate
          implied/agreed today for a future period. They can differ.
        </p>
      </div>

      <ForwardLadderInteractive />
    </div>
  );
}

function ForwardLadderInteractive() {
  const reduce = useReducedMotion();
  // default r_{0,1}=5%, r_{0,2}=7%
  const [r1Pct, setR1Pct] = useState(5);
  const [r2Pct, setR2Pct] = useState(7);
  const r1 = r1Pct / 100;
  const r2 = r2Pct / 100;
  const f2 = forwardRateFromSpotRates(r1, r2, 2);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Forward rate ladder
          </span>
        </div>
      </div>

      <h4 className="ops-interactive-title mt-4 text-2xl text-white">
        Today we agree; the transaction happens later
      </h4>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <RateSlider
          label="r(0,1) — 1-yr spot"
          value={r1Pct}
          onChange={setR1Pct}
        />
        <RateSlider
          label="r(0,2) — 2-yr spot"
          value={r2Pct}
          onChange={setR2Pct}
        />
      </div>

      {/* Timeline ladder */}
      <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-5">
        <ForwardLadderSVG r1={r1} r2={r2} reduce={reduce} />
      </div>

      {/* Computation */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-purple/30 bg-accent-purple/[0.06] p-5">
          <div className="ops-caption text-[11px] text-accent-purple">
            Implied one-year forward f₂ (year 1 &rarr; year 2)
          </div>
          <div className="mt-3 space-y-1.5 font-sans text-[15px] text-slate-100">
            <div>
              1+<Var>f</Var>
              <Sub>2</Sub> = (1+{formatPercent(r2, 2)})<Sup>2</Sup> / (1+
              {formatPercent(r1, 2)})
            </div>
            <div>
              = {Math.pow(1 + r2, 2).toFixed(4)} / {(1 + r1).toFixed(4)} ={" "}
              {(Math.pow(1 + r2, 2) / (1 + r1)).toFixed(4)}
            </div>
            <motion.div
              key={f2.toFixed(4)}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-accent-purple"
            >
              <Var>f</Var>
              <Sub>2</Sub> &asymp; {isFinite(f2) ? formatPercent(f2) : "—"}
            </motion.div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Why it makes sense
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
            The two-year rate is{" "}
            <span className="text-slate-50">{formatPercent(r2, 2)}</span> on
            average over two years. If year 1 is{" "}
            <span className="text-slate-50">{formatPercent(r1, 2)}</span>, the
            implied year-2 rate must be{" "}
            <span className="text-accent-purple">
              higher than {formatPercent(r2, 2)}
            </span>{" "}
            to make the two-year average work.
          </p>
        </div>
      </div>
    </InteractiveFrame>
  );
}

function RateSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className="font-sans text-[13px] text-slate-100">
          {value.toFixed(1)}%
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={15}
        step={0.5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-accent-purple"
      />
    </div>
  );
}

function ForwardLadderSVG({
  r1,
  r2,
  reduce,
}: {
  r1: number;
  r2: number;
  reduce: boolean | null;
}) {
  const W = 760;
  const H = 230;
  const padX = 50;
  const baseY = 150;
  const span = (W - padX * 2) / 5; // 0..5
  const xAt = (p: number) => padX + span * p;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full min-w-[620px]"
      role="img"
      aria-label="Timeline of spot rates and forward rates"
    >
      {/* axis */}
      <line
        x1={padX}
        y1={baseY}
        x2={W - padX}
        y2={baseY}
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
      />
      {/* ticks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i}>
          <line
            x1={xAt(i)}
            y1={baseY - 5}
            x2={xAt(i)}
            y2={baseY + 5}
            stroke="rgba(255,255,255,0.3)"
          />
          <text
            x={xAt(i)}
            y={baseY + 22}
            textAnchor="middle"
            className="fill-slate-400 font-sans"
            fontSize="12"
          >
            {i === 0 ? "0" : i}
          </text>
        </g>
      ))}

      {/* spot brackets (below axis) */}
      <SpotBracket
        x1={xAt(0)}
        x2={xAt(1)}
        y={baseY + 44}
        label="r(0,1)"
        value={formatPercent(r1, 2)}
        color="#22d3ee"
      />
      <SpotBracket
        x1={xAt(0)}
        x2={xAt(2)}
        y={baseY + 74}
        label="r(0,2)"
        value={formatPercent(r2, 2)}
        color="#22d3ee"
      />
      <SpotBracket
        x1={xAt(0)}
        x2={xAt(3)}
        y={baseY + 104}
        label="r(0,3)"
        value="…"
        color="rgba(34,211,238,0.5)"
        dim
      />

      {/* forward brackets (above axis) */}
      <ForwardBracket
        x1={xAt(1)}
        x2={xAt(2)}
        y={baseY - 30}
        label="f₂"
        color="#a78bfa"
        glow
        reduce={reduce}
      />
      <ForwardBracket
        x1={xAt(2)}
        x2={xAt(3)}
        y={baseY - 30}
        label="f₃"
        color="#a78bfa"
        reduce={reduce}
      />
      <ForwardBracket
        x1={xAt(3)}
        x2={xAt(4)}
        y={baseY - 30}
        label="f₄"
        color="#a78bfa"
        reduce={reduce}
      />

      <text
        x={W - padX}
        y={28}
        textAnchor="end"
        className="fill-accent-purple font-sans"
        fontSize="11"
      >
        forward rates (agreed today)
      </text>
      <text
        x={W - padX}
        y={H - 4}
        textAnchor="end"
        className="fill-accent-cyan font-sans"
        fontSize="11"
      >
        spot rates (today &rarr; t)
      </text>
    </svg>
  );
}

function SpotBracket({
  x1,
  x2,
  y,
  label,
  value,
  color,
  dim,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  value: string;
  color: string;
  dim?: boolean;
}) {
  return (
    <g opacity={dim ? 0.55 : 1}>
      <path
        d={`M${x1} ${y} L${x1} ${y - 8} L${x2} ${y - 8} L${x2} ${y}`}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
      />
      <text
        x={(x1 + x2) / 2}
        y={y + 14}
        textAnchor="middle"
        fill={color}
        className="font-sans"
        fontSize="11"
      >
        {label} = {value}
      </text>
    </g>
  );
}

function ForwardBracket({
  x1,
  x2,
  y,
  label,
  color,
  glow,
  reduce,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  color: string;
  glow?: boolean;
  reduce: boolean | null;
}) {
  return (
    <g>
      {glow && !reduce && (
        <motion.path
          d={`M${x1} ${y} L${x1} ${y + 22} L${x2} ${y + 22} L${x2} ${y}`}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ opacity: 0.25 }}
          animate={{ opacity: [0.25, 0.7, 0.25] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <path
        d={`M${x1} ${y} L${x1} ${y + 22} L${x2} ${y + 22} L${x2} ${y}`}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
      />
      <text
        x={(x1 + x2) / 2}
        y={y - 6}
        textAnchor="middle"
        fill={color}
        className="font-sans"
        fontSize="12"
      >
        {label}
      </text>
    </g>
  );
}
