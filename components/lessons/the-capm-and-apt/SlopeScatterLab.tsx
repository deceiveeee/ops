"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
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

const SIGMA_M = 0.1;

function build(beta: number, residualSigma: number, n: number, seed: number) {
  const rng = mulberry32(seed);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const xm = gaussian(rng) * SIGMA_M;
    const eps = gaussian(rng) * residualSigma;
    pts.push({ x: xm, y: beta * xm + eps });
  }
  return pts;
}

function computeStats(pts: { x: number; y: number }[]) {
  const n = pts.length;
  const meanX = pts.reduce((s, p) => s + p.x, 0) / n;
  const meanY = pts.reduce((s, p) => s + p.y, 0) / n;
  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (const p of pts) {
    cov += (p.x - meanX) * (p.y - meanY);
    varX += (p.x - meanX) ** 2;
    varY += (p.y - meanY) ** 2;
  }
  const estBeta = cov / varX;
  const ssTot = varY;
  let ssRes = 0;
  const alpha = meanY - estBeta * meanX;
  for (const p of pts) {
    const pred = alpha + estBeta * p.x;
    ssRes += (p.y - pred) ** 2;
  }
  const r2 = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;
  return { estBeta, r2 };
}

const W = 380;
const H = 320;
const padL = 44;
const padR = 16;
const padT = 16;
const padB = 42;
const xMin = -0.4;
const xMax = 0.4;
const yMin = -0.6;
const yMax = 0.6;

const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
const sy = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

const xTicks = [-0.3, -0.15, 0, 0.15, 0.3];
const yTicks = [-0.5, -0.25, 0, 0.25, 0.5];

const PRESETS = [
  { id: "hh", label: "High β, high R²", beta: 1.5, residualSigma: 0.04, tone: "text-accent-red" },
  { id: "hl", label: "High β, low R²", beta: 1.5, residualSigma: 0.14, tone: "text-accent-amber" },
  { id: "lh", label: "Low β, high R²", beta: 0.5, residualSigma: 0.03, tone: "text-accent-green" },
];

export default function SlopeScatterLab() {
  const [beta, setBeta] = useState(1.2);
  const [noise, setNoise] = useState(7);

  const residualSigma = noise / 100;
  const pts = useMemo(() => build(beta, residualSigma, 30, 42), [beta, residualSigma]);
  const { estBeta, r2 } = useMemo(() => computeStats(pts), [pts]);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setBeta(p.beta);
    setNoise(Math.round(p.residualSigma * 100));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-x-auto rounded-xl border border-white/12 bg-white/[0.03] p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[340px]" role="img" aria-label={`Scatter of market versus stock excess return with estimated beta ${estBeta.toFixed(2)} and R-squared ${(r2 * 100).toFixed(0)} percent.`}>
            {xTicks.map((t) => (
              <g key={`x${t}`}>
                <line x1={sx(t)} x2={sx(t)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
                <text x={sx(t)} y={H - padB + 16} fill="rgba(148,163,184,0.85)" fontSize="11" fontFamily="monospace" textAnchor="middle">
                  {(t * 100).toFixed(0)}%
                </text>
              </g>
            ))}
            {yTicks.map((t) => (
              <g key={`y${t}`}>
                <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
                <text x={padL - 8} y={sy(t) + 4} fill="rgba(148,163,184,0.85)" fontSize="11" fontFamily="monospace" textAnchor="end">
                  {(t * 100).toFixed(0)}%
                </text>
              </g>
            ))}
            <line x1={sx(0)} x2={sx(0)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.25)" />
            <line x1={padL} x2={W - padR} y1={sy(0)} y2={sy(0)} stroke="rgba(255,255,255,0.25)" />
            <line x1={sx(xMin)} y1={sy(estBeta * xMin)} x2={sx(xMax)} y2={sy(estBeta * xMax)} stroke="rgba(34,211,238,0.9)" strokeWidth={2.5} />
            {pts.map((p, i) => (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill="rgba(167,139,250,0.8)" />
            ))}
            <text x={(padL + W - padR) / 2} y={H - 4} fill="rgba(148,163,184,0.9)" fontSize="12" textAnchor="middle">
              Market excess return
            </text>
            <text x={13} y={(padT + H - padB) / 2} fill="rgba(148,163,184,0.9)" fontSize="12" textAnchor="middle" transform={`rotate(-90 13 ${(padT + H - padB) / 2})`}>
              Stock excess return
            </text>
          </svg>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-cyan">Estimated β</div>
              <div className="mt-1 font-mono text-[22px] text-slate-100">{estBeta.toFixed(2)}</div>
            </div>
            <div className="rounded-xl border border-accent-purple/25 bg-accent-purple/[0.05] p-4 text-center">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-purple">R²</div>
              <div className="mt-1 font-mono text-[22px] text-slate-100">{(r2 * 100).toFixed(0)}%</div>
            </div>
          </div>

          <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
            <label className="block font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400" htmlFor="ssl-beta">
              Market sensitivity
            </label>
            <input
              id="ssl-beta"
              type="range"
              min={0.2}
              max={2}
              step={0.1}
              value={beta}
              onChange={(e) => setBeta(Number(e.target.value))}
              className="mt-2 w-full accent-accent-cyan"
              aria-label="Market sensitivity (true beta)"
            />
            <p className="mt-1 font-mono text-[13px] text-slate-300">True β = {beta.toFixed(1)}</p>

            <label className="mt-4 block font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400" htmlFor="ssl-noise">
              Company-specific noise
            </label>
            <input
              id="ssl-noise"
              type="range"
              min={1}
              max={18}
              step={1}
              value={noise}
              onChange={(e) => setNoise(Number(e.target.value))}
              className="mt-2 w-full accent-accent-amber"
              aria-label="Company-specific noise (residual standard deviation)"
            />
            <p className="mt-1 font-mono text-[13px] text-slate-300">σ(ε) = {(noise / 100).toFixed(2)}</p>
          </div>

          <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
            <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400">Try these targets</div>
            <div className="mt-2 space-y-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="flex w-full items-center justify-between rounded-lg border border-white/15 px-3 py-2 text-left text-[13px] text-slate-200 transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan"
                >
                  <span>{p.label}</span>
                  <span className={cn("font-mono text-[12px]", p.tone)}>β {p.beta.toFixed(1)} · σ {p.residualSigma.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Raising market sensitivity</div>
          <ul className="mt-3 space-y-2">
            {[
              "steepens the fitted line;",
              "increases the estimated beta;",
              "does not by itself improve the fit.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-slate-200">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">Raising company-specific noise</div>
          <ul className="mt-3 space-y-2">
            {[
              "spreads points farther from the line;",
              "generally lowers R²;",
              "does not automatically change beta.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[15px] leading-[1.55] text-slate-200">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Feedback status="info">
        <InlineMath>{String.raw`\beta`}</InlineMath> measures slope. <InlineMath>{String.raw`R^2`}</InlineMath>{" "}
        measures fit. Two assets can share the same beta with very different <InlineMath>{String.raw`R^2`}</InlineMath>,
        or share the same <InlineMath>{String.raw`R^2`}</InlineMath> with very different betas.
      </Feedback>
    </div>
  );
}
