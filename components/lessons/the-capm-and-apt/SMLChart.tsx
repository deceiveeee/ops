"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type SMLPoint = {
  beta: number;
  /** Expected return to plot (forecast or required). If `onLine`, it is ignored and recomputed. */
  expectedReturn?: number;
  label?: string;
  tone?: "cyan" | "amber" | "red" | "green" | "purple";
  onLine?: boolean;
};

export type SMLChartProps = {
  rf?: number;
  mrp?: number;
  showLine?: boolean;
  showMarket?: boolean;
  points?: SMLPoint[];
  betaMax?: number;
  rMax?: number;
  betaMin?: number;
  ariaLabel?: string;
  caption?: ReactNode;
  highlightBeta?: number | null;
  className?: string;
};

const TONE: Record<string, string> = {
  cyan: "rgba(34,211,238,0.95)",
  amber: "rgba(251,191,36,0.95)",
  red: "rgba(248,113,113,0.95)",
  green: "rgba(52,211,153,0.95)",
  purple: "rgba(167,139,250,0.95)",
};

export default function SMLChart({
  rf = 4,
  mrp = 6,
  showLine = true,
  showMarket = true,
  points = [],
  betaMin = -0.5,
  betaMax = 2.2,
  rMax = 18,
  ariaLabel = "Security Market Line plotting beta against expected return.",
  caption,
  highlightBeta = null,
  className,
}: SMLChartProps) {
  const reduce = useReducedMotion();
  const W = 560;
  const H = 360;
  const padL = 56;
  const padR = 26;
  const padT = 20;
  const padB = 50;

  const sx = (b: number) => padL + ((b - betaMin) / (betaMax - betaMin)) * (W - padL - padR);
  const sy = (r: number) => padT + (1 - r / rMax) * (H - padT - padB);

  const rOf = (b: number) => rf + b * mrp;

  const betaTicks: number[] = [];
  for (let b = 0; b <= betaMax + 0.001; b += 0.5) betaTicks.push(Math.round(b * 100) / 100);
  const rStep = rMax <= 14 ? 2 : 3;
  const rTicks: number[] = [];
  for (let r = 0; r <= rMax + 0.001; r += rStep) rTicks.push(Math.round(r * 100) / 100);

  const lineLeft = betaMin;
  const lineRight = betaMax;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[460px]" role="img" aria-label={ariaLabel}>
        {betaTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
            <text x={sx(t)} y={H - padB + 18} fill="rgba(148,163,184,0.85)" fontSize="12" fontFamily="monospace" textAnchor="middle">
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        {rTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={padL - 10} y={sy(t) + 4} fill="rgba(148,163,184,0.85)" fontSize="12" fontFamily="monospace" textAnchor="end">
              {t.toFixed(0)}%
            </text>
          </g>
        ))}
        <line x1={padL} x2={W - padR} y1={padT} y2={padT} stroke="rgba(255,255,255,0.18)" />
        <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.18)" />

        {showLine && (
          <motion.line
            x1={sx(lineLeft)}
            y1={sy(rOf(lineLeft))}
            x2={sx(lineRight)}
            y2={sy(rOf(lineRight))}
            stroke="rgba(34,211,238,0.9)"
            strokeWidth={2.5}
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        )}

        {showMarket && showLine && (
          <g>
            <line x1={sx(1)} y1={sy(rf + mrp)} x2={sx(1)} y2={sy(0)} stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
            <line x1={padL} y1={sy(rf + mrp)} x2={sx(1)} y2={sy(rf + mrp)} stroke="rgba(148,163,184,0.18)" strokeDasharray="3 3" />
            <circle cx={sx(1)} cy={sy(rf + mrp)} r={5.5} fill="rgba(34,211,238,0.95)" stroke="rgba(5,7,13,0.9)" strokeWidth={1.5} />
            <text x={sx(1) + 10} y={sy(rf + mrp) - 8} fill="rgba(34,211,238,0.95)" fontSize="12" fontFamily="monospace">
              M ({(rf + mrp).toFixed(0)}%)
            </text>
          </g>
        )}

        {highlightBeta !== null && showLine && (
          <g>
            <line x1={sx(highlightBeta)} y1={sy(rOf(highlightBeta))} x2={sx(highlightBeta)} y2={sy(0)} stroke="rgba(251,191,36,0.4)" strokeDasharray="3 3" />
            <line x1={padL} y1={sy(rOf(highlightBeta))} x2={sx(highlightBeta)} y2={sy(rOf(highlightBeta))} stroke="rgba(251,191,36,0.4)" strokeDasharray="3 3" />
            <circle cx={sx(highlightBeta)} cy={sy(rOf(highlightBeta))} r={5} fill="rgba(251,191,36,0.95)" stroke="rgba(5,7,13,0.9)" strokeWidth={1.5} />
          </g>
        )}

        {points.map((p, i) => {
          const tone = TONE[p.tone ?? "purple"];
          const r = p.onLine ? rOf(p.beta) : p.expectedReturn ?? rOf(p.beta);
          return (
            <g key={i}>
              <circle cx={sx(p.beta)} cy={sy(r)} r={5} fill={tone} stroke="rgba(5,7,13,0.9)" strokeWidth={1.5} />
              {p.label && (
                <text x={sx(p.beta) + 9} y={sy(r) - 9} fill={tone} fontSize="12" fontFamily="monospace">
                  {p.label}
                </text>
              )}
            </g>
          );
        })}

        <text x={(padL + W - padR) / 2} y={H - 8} fill="rgba(148,163,184,0.9)" fontSize="13" textAnchor="middle">
          β (market exposure)
        </text>
        <text
          x={15}
          y={(padT + H - padB) / 2}
          fill="rgba(148,163,184,0.9)"
          fontSize="13"
          textAnchor="middle"
          transform={`rotate(-90 15 ${(padT + H - padB) / 2})`}
        >
          Expected return E[R]
        </text>
      </svg>
      {caption && <p className="mt-1.5 text-center text-[14px] text-slate-500">{caption}</p>}
    </div>
  );
}
