"use client";

import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type CashFlow = {
  period: number; // 0, 1, 2, ... (0 = today)
  amount: number; // signed
  label?: string;
};

/**
 * Responsive SVG cash-flow timeline.
 * Negative flows point down (cost), positive flows point up (income).
 * The final period can be highlighted.
 */
export default function CashFlowTimeline({
  flows,
  maxPeriod,
  height = 200,
  highlightFinal = false,
  showToday = true,
  ariaLabel = "Cash flow timeline",
}: {
  flows: CashFlow[];
  maxPeriod?: number;
  height?: number;
  highlightFinal?: boolean;
  showToday?: boolean;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const T = maxPeriod ?? Math.max(...flows.map((f) => f.period), 1);
  const padX = 40;
  const padY = 28;
  const W = 760;
  const H = height;
  const innerW = W - padX * 2;
  const xAt = (p: number) => padX + (T === 0 ? innerW / 2 : (innerW * p) / T);
  const midY = H / 2;
  const maxAbs = Math.max(...flows.map((f) => Math.abs(f.amount)), 1);
  const scale = (H / 2 - padY - 8) / maxAbs;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full min-w-[420px]"
      role="img"
      aria-label={ariaLabel}
    >
      {/* axis */}
      <line x1={padX} y1={midY} x2={W - padX} y2={midY} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
      {/* period ticks */}
      {Array.from({ length: T + 1 }).map((_, i) => (
        <g key={i}>
          <line x1={xAt(i)} y1={midY - 5} x2={xAt(i)} y2={midY + 5} stroke="rgba(255,255,255,0.3)" />
          <text x={xAt(i)} y={midY + 22} textAnchor="middle" className="fill-slate-400 font-mono" fontSize="12">
            {i === 0 && showToday ? "t=0" : `${i}`}
          </text>
        </g>
      ))}
      {/* flows */}
      {flows.map((f, i) => {
        const x = xAt(f.period);
        const isCost = f.amount < 0;
        const barH = Math.max(6, Math.abs(f.amount) * scale);
        const isFinal = highlightFinal && f.period === T;
        const color = isCost ? "#f87171" : isFinal ? "#34d399" : "#22d3ee";
        const top = isCost ? midY : midY - barH;
        return (
          <g key={i}>
            <rect
              x={x - 10}
              y={top}
              width={20}
              height={barH}
              rx={3}
              fill={color}
              fillOpacity={0.85}
              style={reduce ? undefined : { transition: "all 0.3s ease" }}
            />
            <text
              x={x}
              y={isCost ? top + barH + 16 : top - 8}
              textAnchor="middle"
              className="font-mono"
              fontSize="12"
              fontWeight="600"
              fill={color}
            >
              {f.amount >= 0 ? "+" : "−"}
              {Math.abs(f.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
