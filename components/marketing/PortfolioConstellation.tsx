"use client";

import { motion, useReducedMotion } from "motion/react";
import SectionLabel from "@/components/ui/SectionLabel";
import PortfolioObject from "@/components/marketing/PortfolioObject";
import { assetNodes, assetEdges } from "@/data/marketing";

const toneColor: Record<string, string> = {
  cyan: "#22d3ee",
  green: "#34d399",
  purple: "#a78bfa",
  amber: "#fbbf24",
  red: "#f87171",
};

export default function PortfolioConstellation() {
  const reduce = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_50%,rgba(167,139,250,0.10),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header — varied layout: stats inline as a terminal strip */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <SectionLabel index="07" eyebrow="Portfolios change risk through interaction" tone="purple" />
            <h2 className="mt-6 text-balance text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              A portfolio is a system of relationships.
            </h2>
            <p className="mt-5 max-w-md text-balance text-slate-300">
              Risk changes when assets interact. Correlation, volatility, and weights — not just individual names —
              determine what the portfolio actually does.
            </p>
          </div>
          {/* stat strip */}
          <div className="flex gap-6 font-mono text-xs">
            <Stat label="Portfolio vol" value="11.4%" tone="purple" />
            <Stat label="Avg correlation" value="0.21" tone="purple" />
            <Stat label="Diversification" value="1.62x" tone="green" />
          </div>
        </div>

        {/* Full-bleed constellation canvas with signature object anchor */}
        <div className="mt-8">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-900/40 sm:aspect-[16/9]">
            {/* subtle grid */}
            <div className="absolute inset-0 terminal-grid opacity-20" />

            {/* signature portfolio object — floating focal anchor, top-left */}
            <div className="absolute left-2 top-2 z-20 w-28 opacity-90 sm:w-36 md:w-44">
              <PortfolioObject className="w-full" />
            </div>

            {/* edges */}
            <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              {assetEdges.map((e, i) => {
                const a = assetNodes.find((n) => n.id === e.from)!;
                const b = assetNodes.find((n) => n.id === e.to)!;
                const positive = e.corr >= 0;
                const color = positive
                  ? `rgba(248,113,113,${0.15 + Math.abs(e.corr) * 0.5})`
                  : `rgba(52,211,153,${0.15 + Math.abs(e.corr) * 0.5})`;
                return (
                  <line
                    key={i}
                    x1={a.x}
                    y1={a.y * 0.75}
                    x2={b.x}
                    y2={b.y * 0.75}
                    stroke={color}
                    strokeWidth={0.4 + Math.abs(e.corr) * 1.6}
                    strokeDasharray={positive ? "0" : "1.5 1.5"}
                  />
                );
              })}
            </svg>

            {/* nodes */}
            {assetNodes.map((n, i) => {
              const color = toneColor[n.tone];
              const size = 36 + n.weight / 2;
              return (
                <motion.div
                  key={n.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${n.x}%`, top: `${n.y * 0.75}%` }}
                  animate={
                    reduce
                      ? {}
                      : {
                          x: [0, i % 2 === 0 ? 10 : -10, 0],
                          y: [0, i % 2 === 0 ? -8 : 8, 0],
                        }
                  }
                  transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                >
                  <div className="relative flex flex-col items-center">
                    <div
                      className="flex items-center justify-center rounded-full border-2 bg-ink-950/80 backdrop-blur-sm"
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderColor: color,
                        boxShadow: `0 0 28px -6px ${color}`,
                      }}
                    >
                      <span className="font-mono text-[10px] font-semibold sm:text-xs" style={{ color }}>
                        {n.weight}%
                      </span>
                    </div>
                    {/* label pill — positioned to avoid overlap */}
                    <div className="mt-1.5 whitespace-nowrap rounded bg-ink-950/80 px-2 py-0.5 font-mono text-[9px] text-slate-200 backdrop-blur-sm">
                      {n.label}
                    </div>
                    <div className="mt-0.5 font-mono text-[8px] text-slate-500">σ {n.vol}%</div>
                  </div>
                </motion.div>
              );
            })}

            {/* legend — top-right, compact */}
            <div className="absolute right-3 top-3 flex flex-col gap-1.5 rounded-lg border border-white/10 bg-ink-950/70 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400 backdrop-blur-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-accent-red/70" /> positive corr
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-accent-green/70" /> negative corr
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-4 rounded-full bg-white/30" /> size = weight
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "purple" | "green" }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold ${tone === "purple" ? "text-accent-purple" : "text-accent-green"}`}>
        {value}
      </div>
    </div>
  );
}
