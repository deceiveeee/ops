"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";
import { InlineMath } from "./shared";

/**
 * Decodes the spot-rate notation r_{0,T}.
 * Four clickable notation cards; selecting one highlights the matching
 * interval on a timeline and explains the two subscripts.
 */
type CardKey = "r01" | "r02" | "r05" | "r0T";

const CARDS: {
  key: CardKey;
  tex: string;
  maturity: number;
  plain: string;
}[] = [
  { key: "r01", tex: "r_{0,1}", maturity: 1, plain: "today's 1-year spot rate" },
  { key: "r02", tex: "r_{0,2}", maturity: 2, plain: "today's 2-year spot rate" },
  { key: "r05", tex: "r_{0,5}", maturity: 5, plain: "today's 5-year spot rate" },
  { key: "r0T", tex: "r_{0,T}", maturity: 7, plain: "today's T-year spot rate (any maturity)" },
];

const MAX_T = 7;

export default function SpotRateDecoder() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<CardKey | null>("r05");
  const activeCard = CARDS.find((c) => c.key === active) ?? null;
  const maturity = activeCard?.maturity ?? 0;

  const padX = 44;
  const W = 760;
  const H = 120;
  const innerW = W - padX * 2;
  const xAt = (p: number) => padX + (innerW * p) / MAX_T;
  const midY = H / 2 + 8;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Spot rate notation">
        <InlineMath>{"r_{0,T}"}</InlineMath> reads as{" "}
        <span className="font-mono text-slate-100">r-sub-zero-T</span>. The{" "}
        <span className="text-accent-cyan">first subscript</span> is the pricing
        date. The <span className="text-accent-amber">second subscript</span> is
        the maturity date.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Notation decoder
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          What do the subscripts mean?
        </h4>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CARDS.map((c) => {
            const isActive = active === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={isActive}
                aria-label={`Decode ${c.tex}`}
                onClick={() => setActive(c.key)}
                className={cn(
                  "flex items-center justify-center rounded-2xl border px-4 py-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isActive
                    ? "border-accent-cyan/50 bg-accent-cyan/[0.08]"
                    : "border-white/10 bg-ink-950/40 hover:border-white/25",
                )}
              >
                <span
                  className={cn(
                    "text-[18px]",
                    isActive ? "text-accent-cyan" : "text-slate-200",
                  )}
                >
                  <InlineMath>{c.tex}</InlineMath>
                </span>
              </button>
            );
          })}
        </div>

        {/* Timeline with highlighted interval */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full min-w-[520px]"
            role="img"
            aria-label="Timeline from today to maturity showing the spot-rate interval"
          >
            <line
              x1={padX}
              y1={midY}
              x2={W - padX}
              y2={midY}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth={1.5}
            />
            {/* highlighted interval */}
            {maturity > 0 && (
              <motion.rect
                x={xAt(0)}
                y={midY - 14}
                width={Math.max(2, xAt(maturity) - xAt(0))}
                height={28}
                rx={6}
                fill="#22d3ee"
                fillOpacity={0.14}
                stroke="#22d3ee"
                strokeOpacity={0.5}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            {Array.from({ length: MAX_T + 1 }).map((_, i) => (
              <g key={i}>
                <line
                  x1={xAt(i)}
                  y1={midY - 5}
                  x2={xAt(i)}
                  y2={midY + 5}
                  stroke="rgba(255,255,255,0.3)"
                />
                <text
                  x={xAt(i)}
                  y={midY + 24}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono"
                  fontSize="12"
                >
                  {i === 0 ? "t=0" : `${i}yr`}
                </text>
              </g>
            ))}
            {/* pricing + maturity callouts */}
            <text
              x={xAt(0)}
              y={midY - 26}
              textAnchor="middle"
              className="fill-accent-cyan font-mono"
              fontSize="12"
            >
              pricing date
            </text>
            {maturity > 0 && (
              <text
                x={xAt(maturity)}
                y={midY - 26}
                textAnchor="middle"
                className="fill-accent-amber font-mono"
                fontSize="12"
              >
                maturity
              </text>
            )}
          </svg>
        </div>

        {/* Plain-English readout */}
        <div className="mt-5 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5">
          {activeCard ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[16px] text-slate-100">
                <span className="text-accent-cyan">
                  <InlineMath>{activeCard.tex}</InlineMath>
                </span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-200">{activeCard.plain}</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <ReadRow
                  label="Pricing date"
                  value="0 (today)"
                  tone="cyan"
                />
                <ReadRow
                  label="Maturity date"
                  value={activeCard.key === "r0T" ? "T (variable)" : `t = ${activeCard.maturity}`}
                  tone="amber"
                />
              </div>
            </div>
          ) : (
            <p className="ops-body text-[15px] text-slate-300">
              Pick a notation card above to decode its interval.
            </p>
          )}
        </div>

        <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
          <span className="text-accent-cyan">First subscript</span> = pricing
          date. <span className="text-accent-amber">Second subscript</span> =
          maturity date. Both dates are measured from today.
        </p>
      </InteractiveFrame>
    </div>
  );
}

function ReadRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "amber";
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/50 px-4 py-3">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-[15px]",
          tone === "cyan" ? "text-accent-cyan" : "text-accent-amber",
        )}
      >
        {value}
      </div>
    </div>
  );
}
