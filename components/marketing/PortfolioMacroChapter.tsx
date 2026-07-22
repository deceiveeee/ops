"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Chapter 5 — Portfolio + Macro.
 *
 * Two linked parts in one chapter:
 *  Part A (Portfolio): three discrete states Moves together / Mixed / Diversified.
 *    Two large asset paths shown side by side; combined portfolio line below.
 *    No slider.
 *  Part B (Macro): three discrete scenarios Inflation shock / Rate hike / Soft
 *    landing. Wide transmission chain. Active portfolio effect as a large
 *    concluding result.
 */

// ─── Part A: Portfolio ────────────────────────────────────────────────────
type CorrState = "together" | "mixed" | "diversified";

const CORR_STATES: {
  id: CorrState;
  label: string;
  rho: number;
  vol: number; // combined volatility %
  note: string;
}[] = [
  { id: "together", label: "Moves together", rho: 0.85, vol: 15.2, note: "Returns move in the same direction most of the time. Diversification barely helps." },
  { id: "mixed", label: "Mixed movement", rho: 0.30, vol: 13.1, note: "Partial co-movement. Some risk is diversified away." },
  { id: "diversified", label: "Diversified", rho: -0.40, vol: 9.8, note: "Returns offset. Portfolio volatility falls sharply." },
];

// Deterministic asset return paths for visual storytelling (20 points each)
function path(seed: number, points = 24, trend = 0): number[] {
  const out: number[] = [];
  let v = 100;
  const wave = [0.6, -0.4, 1.1, 0.3, -0.8, 0.9, -0.3, 0.7, -1.1, 0.5, 0.8, -0.6, 1.2, -0.4, 0.3, -0.9, 1.0, 0.4, -0.7, 0.8, -0.5, 0.9, -0.2, 0.6];
  for (let i = 0; i < points; i++) {
    v += wave[(i + seed) % wave.length] + trend * 0.2;
    out.push(v);
  }
  return out;
}

const ASSET_A = path(0);
const ASSET_B_TOGETHER = path(1);    // similar shape
const ASSET_B_MIXED = path(5);
const ASSET_B_DIVERSIFIED = path(11); // opposite shape

// ─── Part B: Macro ────────────────────────────────────────────────────────
type MacroId = "inflation" | "rate-hike" | "soft-landing";

const MACRO_STATES: {
  id: MacroId;
  label: string;
  chain: string[];
  outcome: string;
  tone: "red" | "amber" | "green";
}[] = [
  {
    id: "inflation",
    label: "Inflation shock",
    chain: ["Policy rate", "Bond yields", "Equity valuation", "Company financing", "Portfolio value"],
    outcome: "Higher rates across the curve. Growth hit hardest.",
    tone: "red",
  },
  {
    id: "rate-hike",
    label: "Rate hike",
    chain: ["Policy rate", "Bond yields", "Equity valuation", "Company financing", "Portfolio value"],
    outcome: "Tighter financial conditions. Bond–equity correlation turns positive.",
    tone: "amber",
  },
  {
    id: "soft-landing",
    label: "Soft landing",
    chain: ["Policy rate", "Bond yields", "Equity valuation", "Company financing", "Portfolio value"],
    outcome: "Risk-on. Quality and growth both supported.",
    tone: "green",
  },
];

const toneText: Record<string, string> = {
  red: "text-accent-red",
  amber: "text-accent-amber",
  green: "text-accent-green",
};
const toneColorHex: Record<string, string> = {
  red: "#f87171",
  amber: "#fbbf24",
  green: "#34d399",
};

export default function PortfolioMacroChapter() {
  return (
    <section
      id="section-portfolio"
      className="hp-chapter border-t border-white/5"
      style={{ background: "linear-gradient(180deg, #06080f 0%, #07111a 50%, #06080f 100%)" }}
    >
      <PortfolioPart />
      <div className="mt-32 border-t border-white/10 pt-32">
        <MacroPart />
      </div>
    </section>
  );
}

// ─── Portfolio Part ───────────────────────────────────────────────────────
function PortfolioPart() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<CorrState>("together");
  const active = CORR_STATES.find((s) => s.id === activeId)!;
  const assetB =
    activeId === "together"
      ? ASSET_B_TOGETHER
      : activeId === "mixed"
        ? ASSET_B_MIXED
        : ASSET_B_DIVERSIFIED;
  const portfolio = ASSET_A.map((v, i) => (v + assetB[i]) / 2);

  return (
    <div className="hp-canvas">
      {/* Headline */}
      <div className="max-w-[1000px]">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7 }}
          className="hp-section"
        >
          Diversification depends on <span className="text-accent-cyan">how assets move together.</span>
        </motion.h2>
        <p className="hp-lead mt-8">
          Combining assets only reduces risk when their returns do not move in the same way.
        </p>
      </div>

      {/* State tabs */}
      <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-white/10 pb-5">
        {CORR_STATES.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              aria-pressed={isActive}
              className={cn(
                "hp-tab border-b-2 pb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
                isActive
                  ? "hp-tab-active border-accent-cyan"
                  : "border-transparent hover:text-slate-300",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Large visual: two asset paths above + portfolio line below */}
      <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <AssetPathVisual
          assetA={ASSET_A}
          assetB={assetB}
          portfolio={portfolio}
          reduce={!!reduce}
          rho={active.rho}
        />

        <div className="flex flex-col justify-center">
          <div className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-400">
            Portfolio volatility
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.vol}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="hp-numeric mt-3 text-accent-cyan"
              style={{ fontSize: "clamp(72px, 8vw, 128px)", lineHeight: 0.9 }}
            >
              {active.vol.toFixed(1)}%
            </motion.div>
          </AnimatePresence>
          <p className="hp-body mt-6 max-w-[440px]">
            {active.note}
          </p>
        </div>
      </div>
    </div>
  );
}

function AssetPathVisual({
  assetA,
  assetB,
  portfolio,
  reduce,
  rho,
}: {
  assetA: number[];
  assetB: number[];
  portfolio: number[];
  reduce: boolean;
  rho: number;
}) {
  const W = 1200;
  const H = 520;
  const PAD = 30;
  const xs = assetA.map((_, i) => (i / (assetA.length - 1)) * (W - PAD * 2) + PAD);
  const all = [...assetA, ...assetB, ...portfolio];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const yFor = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  const mk = (arr: number[]) => "M" + xs.map((x, i) => `${x},${yFor(arr[i])}`).join(" L");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Two asset paths shown side by side with correlation ${rho.toFixed(2)}. The portfolio combines them.`}
    >
      <defs>
        <filter id="portGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={PAD}
          x2={W - PAD}
          y1={PAD + g * (H - PAD * 2)}
          y2={PAD + g * (H - PAD * 2)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      <motion.path
        key={"A" + assetB[0]}
        d={mk(assetA)}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      <motion.path
        key={"B" + assetB[0]}
        d={mk(assetB)}
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.15, ease: "easeInOut" }}
      />
      <motion.path
        key={"P" + assetB[0]}
        d={mk(portfolio)}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#portGlow)"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── Macro Part ──────────────────────────────────────────────────────────
function MacroPart() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<MacroId>("rate-hike");
  const active = MACRO_STATES.find((s) => s.id === activeId)!;

  return (
    <div className="hp-canvas">
      <div className="max-w-[1000px]">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7 }}
          className="hp-section"
        >
          Policy changes reach <span className="text-accent-cyan">every portfolio.</span>
        </motion.h2>
        <p className="hp-lead mt-8">
          A single decision by the central bank transmits through yields, equities, and companies to your portfolio.
        </p>
      </div>

      {/* Scenario tabs */}
      <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-white/10 pb-5">
        {MACRO_STATES.map((s) => {
          const isActive = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              aria-pressed={isActive}
              className={cn(
                "hp-tab border-b-2 pb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
                isActive
                  ? "border-accent-cyan " + toneText[s.tone]
                  : "border-transparent hover:text-slate-300 text-slate-500",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Transmission chain — large horizontal path with sequential reveal */}
      <div className="mt-16">
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-4">
          {active.chain.map((step, i) => {
            const isLast = i === active.chain.length - 1;
            const colorHex = toneColorHex[active.tone];
            return (
              <motion.div
                key={step + active.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative border-t border-white/10 pt-5"
                style={{ borderTopColor: isLast ? colorHex : "rgba(255,255,255,0.1)" }}
              >
                <div className="font-mono text-[14px] tabular-nums text-slate-500">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  className="mt-2 text-[clamp(20px,2vw,28px)] font-medium leading-tight"
                  style={{ color: isLast ? colorHex : "var(--ops-soft)" }}
                >
                  {step}
                </div>
                {!isLast && (
                  <span
                    className="absolute right-0 top-5 hidden text-slate-500 lg:block"
                    aria-hidden
                  >
                    →
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Large concluding result */}
        <div className="mt-16 border-t border-white/10 pt-12">
          <div className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-400">
            Portfolio consequence
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={active.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "mt-4 text-[clamp(28px,3.5vw,48px)] font-semibold leading-[1.1] tracking-[-0.02em]",
                toneText[active.tone],
              )}
            >
              {active.outcome}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
