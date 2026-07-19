"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

const DOWNWARD_EFFECTS = [
  "Increased financing difficulty",
  "Higher borrowing costs",
  "Weaker supplier confidence",
  "Reduced employee retention",
  "Reduced acquisition capacity",
  "Weaker customer confidence",
];

const UPWARD_EFFECTS = [
  "Improved access to capital",
  "Acquisitions become affordable",
  "Easier talent recruitment",
  "Strengthened counterparty confidence",
  "Funded expansion and R&D",
];

export default function PricesAffectFundamentals() {
  const reduce = useReducedMotion();
  const [direction, setDirection] = useState<"up" | "down">("down");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Prices do not merely reflect the economy. In some cases, they influence it. A falling
          stock price can directly damage the business. A rising stock price can directly help it.
        </p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          The reflexive loop
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4 overflow-x-auto">
          <BlockMath>{String.raw`\text{Price} \;\leftrightarrow\; \text{Financing conditions} \;\leftrightarrow\; \text{Business performance}`}</BlockMath>
        </div>

        {/* Circular SVG diagram */}
        <div className="mt-5 overflow-x-auto">
          <svg viewBox="0 0 480 260" className="w-full" style={{ minWidth: "380px" }}
            role="img" aria-label="Reflexive loop: stock price, financing conditions, and business performance all influence each other in both directions.">
            <defs>
              <marker id="arrow-cyan" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 Z" fill="#22d3ee" />
              </marker>
              <marker id="arrow-cyan-rev" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M10,0 L0,5 L10,10 Z" fill="#22d3ee" />
              </marker>
            </defs>

            {/* Triangle of nodes */}
            <NodeCircle x={240} y={50} label="Price" tone="#fbbf24" />
            <NodeCircle x={110} y={200} label="Financing" tone="#22d3ee" />
            <NodeCircle x={370} y={200} label="Fundamentals" tone="#34d399" />

            {/* Bidirectional arrows */}
            <BidirectionalArrow x1={240} y1={75} x2={130} y2={185} />
            <BidirectionalArrow x1={250} y1={75} x2={360} y2={185} />
            <BidirectionalArrow x1={140} y1={210} x2={350} y2={210} />
          </svg>
        </div>
      </div>

      {/* Direction toggle */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Direction of initial move
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setDirection("down")} aria-pressed={direction === "down"}
            className={cn("rounded-full border px-4 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              direction === "down" ? "border-accent-red/40 bg-accent-red/[0.08] text-accent-red" : "border-white/15 text-slate-200 hover:border-white/30")}>
            Falling price →
          </button>
          <button type="button" onClick={() => setDirection("up")} aria-pressed={direction === "up"}
            className={cn("rounded-full border px-4 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              direction === "up" ? "border-accent-green/40 bg-accent-green/[0.08] text-accent-green" : "border-white/15 text-slate-200 hover:border-white/30")}>
            Rising price →
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={direction}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={cn("rounded-2xl border p-5 sm:p-6",
            direction === "down" ? "border-accent-red/25 bg-accent-red/[0.04]" : "border-accent-green/25 bg-accent-green/[0.04]")}>
          <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]",
            direction === "down" ? "text-accent-red" : "text-accent-green")}>
            {direction === "down" ? "When price falls" : "When price rises"}
          </div>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {(direction === "down" ? DOWNWARD_EFFECTS : UPWARD_EFFECTS).map((e) => (
              <li key={e} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-100">
                <span className={cn("mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full",
                  direction === "down" ? "bg-accent-red" : "bg-accent-green")} aria-hidden />{e}
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          This feedback can partially validate an initial price change. A stock that falls may
          become genuinely worth less because the fall itself weakens the business. A stock that
          rises may become genuinely worth more because the rise itself strengthens the business.
        </p>
        <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-300">
          Not every market movement affects fundamentals materially. The effect is strongest for
          companies that depend on access to capital, on counterparty confidence, or on talent that
          watches the stock price.
        </p>
      </div>
    </div>
  );
}

function NodeCircle({ x, y, label, tone }: { x: number; y: number; label: string; tone: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={34} fill="rgba(255,255,255,0.04)" stroke={tone} strokeWidth={1.5} />
      <text x={x} y={y + 4} fill={tone} fontSize={11} fontFamily="monospace" textAnchor="middle" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

function BidirectionalArrow({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  // Offset two parallel arrows to show bidirectionality
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const offset = 8;
  const px = -dy / len * offset;
  const py = dx / len * offset;

  return (
    <g>
      <line x1={x1 + px} y1={y1 + py} x2={x2 + px} y2={y2 + py}
        stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#arrow-cyan)" opacity={0.75} />
      <line x1={x2 - px} y1={y2 - py} x2={x1 - px} y2={y1 - py}
        stroke="#22d3ee" strokeWidth={1.5} markerEnd="url(#arrow-cyan)" opacity={0.75} />
    </g>
  );
}
