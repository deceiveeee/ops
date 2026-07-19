"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

type AssetSpec = {
  id: string;
  label: string;
  beta: number;
  totalSigma: number;
  residualSigma: number;
  color: string;
};

const SIGMA_M = 0.2;

function buildPoints(spec: AssetSpec, n: number, seed: number) {
  const rng = mulberry32(seed);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const xm = gaussian(rng) * SIGMA_M;
    const eps = gaussian(rng) * spec.residualSigma;
    const y = spec.beta * xm + eps;
    pts.push({ x: xm, y });
  }
  return pts;
}

const ASSETS: AssetSpec[] = [
  {
    id: "A",
    label: "Asset A",
    beta: 1.4,
    totalSigma: 0.3,
    residualSigma: Math.sqrt(Math.max(0.3 * 0.3 - 1.4 * 1.4 * SIGMA_M * SIGMA_M, 0)),
    color: "rgba(34,211,238,0.9)",
  },
  {
    id: "B",
    label: "Asset B",
    beta: 0.4,
    totalSigma: 0.3,
    residualSigma: Math.sqrt(Math.max(0.3 * 0.3 - 0.4 * 0.4 * SIGMA_M * SIGMA_M, 0)),
    color: "rgba(167,139,250,0.9)",
  },
];

const POINTS_A = buildPoints(ASSETS[0], 26, 11);
const POINTS_B = buildPoints(ASSETS[1], 26, 99);

function Scatter({
  spec,
  points,
}: {
  spec: AssetSpec;
  points: { x: number; y: number }[];
}) {
  const W = 320;
  const H = 280;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 38;
  const xMin = -0.5;
  const xMax = 0.5;
  const yMin = -0.6;
  const yMax = 0.6;

  const sx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const sy = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  const xTicks = [-0.4, -0.2, 0, 0.2, 0.4];
  const yTicks = [-0.5, -0.25, 0, 0.25, 0.5];

  const lineX0 = xMin;
  const lineX1 = xMax;
  const lineY0 = spec.beta * lineX0;
  const lineY1 = spec.beta * lineX1;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[280px]" role="img" aria-label={`Scatter of market excess return versus ${spec.label} excess return, fitted slope beta ${spec.beta}`}>
        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
            <text x={sx(t)} y={H - padB + 16} fill="rgba(148,163,184,0.8)" fontSize="11" fontFamily="monospace" textAnchor="middle">
              {(t * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={padL - 6} y={sy(t) + 4} fill="rgba(148,163,184,0.8)" fontSize="11" fontFamily="monospace" textAnchor="end">
              {(t * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        <line x1={sx(0)} x2={sx(0)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.25)" />
        <line x1={padL} x2={W - padR} y1={sy(0)} y2={sy(0)} stroke="rgba(255,255,255,0.25)" />

        <line
          x1={sx(lineX0)}
          y1={sy(lineY0)}
          x2={sx(lineX1)}
          y2={sy(lineY1)}
          stroke={spec.color}
          strokeWidth={2.5}
        />

        {points.map((p, i) => (
          <g key={i}>
            <line
              x1={sx(p.x)}
              y1={sy(spec.beta * p.x)}
              x2={sx(p.x)}
              y2={sy(p.y)}
              stroke="rgba(251,191,36,0.25)"
              strokeWidth={1}
            />
            <circle cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={spec.color} fillOpacity={0.8} />
          </g>
        ))}

        <text x={(padL + W - padR) / 2} y={H - 4} fill="rgba(148,163,184,0.9)" fontSize="12" textAnchor="middle">
          Market excess return
        </text>
        <text x={12} y={(padT + H - padB) / 2} fill="rgba(148,163,184,0.9)" fontSize="12" textAnchor="middle" transform={`rotate(-90 12 ${(padT + H - padB) / 2})`}>
          {spec.label} excess return
        </text>
      </svg>
      <p className="mt-1 text-center text-[14px] text-slate-500">
        Fitted slope = β = {spec.beta.toFixed(1)}. Amber dashes are firm-specific residuals.
      </p>
    </div>
  );
}

function Question({
  prompt,
  options,
  correctId,
  note,
}: {
  prompt: ReactNode;
  options: { id: string; label: string }[];
  correctId: string;
  note: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === correctId;
  return (
    <div>
      <div className="text-[16px] leading-[1.6] text-slate-200">{prompt}</div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const showCorrect = answered && opt.id === correctId;
          const showWrong = isSelected && !isCorrect;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => setSelected(opt.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-[14px] transition-colors",
                showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                answered && !showCorrect && !showWrong && "border-white/10 text-slate-500",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={cn("mt-2 text-[14px] leading-[1.55]", isCorrect ? "text-slate-300" : "text-accent-red/90")}>{note}</p>
      )}
    </div>
  );
}

export default function VolatilityBetaComparison() {
  const opts = [
    { id: "A", label: "Asset A" },
    { id: "B", label: "Asset B" },
    { id: "same", label: "About the same" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent-cyan">Asset A</span>
            <span className="font-mono text-[14px] text-slate-300">σ = 30% · β = 1.4</span>
          </div>
          <Scatter spec={ASSETS[0]} points={POINTS_A} />
        </div>
        <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-accent-purple">Asset B</span>
            <span className="font-mono text-[14px] text-slate-300">σ = 30% · β = 0.4</span>
          </div>
          <Scatter spec={ASSETS[1]} points={POINTS_B} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-white/12 bg-white/[0.03] p-5">
        <Question
          prompt="Which asset has greater total volatility?"
          options={opts}
          correctId="same"
          note="Both have the same standard deviation (30%). Their total return swings are similar in size."
        />
        <Question
          prompt="Which asset has greater market exposure?"
          options={opts}
          correctId="A"
          note="Asset A (β = 1.4) has a much steeper fitted line — its movements are more closely connected to the market."
        />
        <Question
          prompt="Which asset contributes more systematic risk to a diversified portfolio?"
          options={opts}
          correctId="A"
          note="Asset A. In a diversified portfolio the firm-specific residuals mostly wash out; what remains is the market-related component, which is larger for A."
        />
        <Question
          prompt="Why can the answers differ?"
          options={[
            { id: "source", label: "Because total volatility mixes market-related and firm-specific movement in different proportions" },
            { id: "mag", label: "Because beta is always larger than standard deviation" },
          ]}
          correctId="source"
          note="Standard deviation measures total swings. Beta measures only the market-related portion. Same total σ can hide very different splits between systematic and firm-specific risk."
        />
      </div>

      <Feedback status="info">
        Standard deviation measures the typical size of an asset&apos;s total return swings around its
        average. Beta measures the portion of exposure connected to market movements. Identical
        standard deviations do not imply identical betas.
      </Feedback>
    </div>
  );
}
