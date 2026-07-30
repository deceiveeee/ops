"use client";

import { useReducedMotion } from "motion/react";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";

/**
 * Reality check on published yield curves.
 * Two overlaid mini SVG curves: STRIPS spot curve vs. coupon-bond YTM curve.
 * The plotted yields are YTMs, not pure spot rates — a proxy, not identical.
 */
const MATURITIES = [1, 2, 3, 5, 7, 10];

// Spot (STRIPS) yields — true zero-coupon spot rates
const SPOT_YIELDS = [3.4, 3.9, 4.2, 4.6, 4.9, 5.2];
// Coupon-bond YTM curve — what the Treasury publishes; slightly lower than spots
const YTM_YIELDS = [3.35, 3.8, 4.05, 4.4, 4.65, 4.9];

export default function YieldCurveRealityCheck() {
  const reduce = useReducedMotion();

  const W = 760;
  const H = 280;
  const padX = 52;
  const padY = 30;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;
  const yMin = 0;
  const yMax = 6;
  const xAt = (i: number) => padX + (innerW * i) / (MATURITIES.length - 1);
  const yAt = (y: number) => padY + innerH - (innerH * (y - yMin)) / (yMax - yMin);

  const spotPts = SPOT_YIELDS.map((y, i) => `${xAt(i)},${yAt(y)}`).join(" ");
  const ytmPts = YTM_YIELDS.map((y, i) => `${xAt(i)},${yAt(y)}`).join(" ");

  return (
    <div className="space-y-6">
      <DefinitionCard term="What the published curve really is">
        The Treasury&apos;s daily yield curve is built from{" "}
        <span className="text-accent-purple">coupon-bearing bonds</span>, not
        pure STRIPS. The plotted yields are{" "}
        <span className="text-accent-cyan">yields-to-maturity</span> — a
        reasonable proxy for spot rates, but not identical.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Spot vs. YTM curves
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          STRIPS spots sit above coupon-bond YTMs
        </h4>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Legend color="#22d3ee" label="STRIPS spot curve (true zeros)" />
          <Legend color="#a78bfa" label="Coupon-bond YTM curve (published)" />
        </div>

        {/* Overlaid curves */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[560px]" role="img" aria-label="STRIPS spot curve overlaid on coupon-bond YTM curve">
            {/* gridlines */}
            {[0, 1, 2, 3, 4, 5, 6].map((gy) => (
              <g key={gy}>
                <line x1={padX} y1={yAt(gy)} x2={W - padX} y2={yAt(gy)} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                <text x={padX - 10} y={yAt(gy) + 4} textAnchor="end" className="fill-slate-500 font-sans" fontSize="11">
                  {gy}%
                </text>
              </g>
            ))}
            {/* maturity labels */}
            {MATURITIES.map((m, i) => (
              <text key={m} x={xAt(i)} y={H - padY + 22} textAnchor="middle" className="fill-slate-400 font-sans" fontSize="12">
                {m}y
              </text>
            ))}

            {/* YTM curve (drawn first, behind) */}
            <polyline
              points={ytmPts}
              fill="none"
              stroke="#a78bfa"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="7 5"
              style={reduce ? undefined : { transition: "points 0.4s ease" }}
            />
            {/* Spot curve */}
            <polyline
              points={spotPts}
              fill="none"
              stroke="#22d3ee"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={reduce ? undefined : { transition: "points 0.4s ease" }}
            />
            {/* points */}
            {SPOT_YIELDS.map((y, i) => (
              <circle key={`s${i}`} cx={xAt(i)} cy={yAt(y)} r={4} fill="#22d3ee" />
            ))}
            {YTM_YIELDS.map((y, i) => (
              <circle key={`y${i}`} cx={xAt(i)} cy={yAt(y)} r={4} fill="#a78bfa" />
            ))}
          </svg>
        </div>

        <p className="ops-body mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[15px] leading-7 text-slate-200">
          Public yield curves use <span className="text-accent-purple">coupon
          Treasuries</span>, not pure STRIPS. The plotted yields are{" "}
          <span className="text-accent-cyan">YTMs</span>, not pure spot rates — a
          reasonable proxy but not identical. Because each coupon gets discounted
          at one blended rate, the YTM curve smooths over the true term structure.
        </p>
      </InteractiveFrame>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-[3px] w-6 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span className="ops-caption text-[11px] text-slate-300">{label}</span>
    </div>
  );
}
