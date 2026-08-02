"use client";

import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";

/**
 * Chapter 5 — Build the portfolio.
 *
 * Scroll-driven sequence. Three discrete states, each temporarily
 * becoming the entire composition:
 *
 *   State 1 (scroll 0–33%):   Assets move together   · vol 15.2%
 *   State 2 (scroll 33–66%):  Mixed movement         · vol 13.1%
 *   State 3 (scroll 66–90%):  Diversified            · vol  9.8%
 *   State 4 (scroll 90–100%): Rate shock absorption  · portfolio value falls
 *
 * NO tabs, NO slider. The asset paths visibly smooth as the user scrolls.
 * The macro "rate shock" idea is absorbed as the final state instead of
 * being a separate dashboard section.
 *
 * Layout: long section (~4x viewport height) with sticky visual inside.
 */

// Asset A is stable across all states. Asset B shape changes per state.
function genAsset(seed: number, points = 32, vol = 1): number[] {
  const out: number[] = [];
  let v = 100;
  const wave = Array.from({ length: points }, (_, i) =>
    Math.sin(i * 0.6 + seed) * vol + Math.cos(i * 0.35 + seed * 0.7) * vol * 0.6,
  );
  for (let i = 0; i < points; i++) {
    v += wave[i];
    out.push(v);
  }
  return out;
}

const ASSET_A = genAsset(0.4, 32, 2.2);
// Asset B in each state — Together: very similar; Mixed: partially correlated; Diversified: opposite
const ASSET_B_TOGETHER = genAsset(0.55, 32, 2.0);
const ASSET_B_MIXED = genAsset(2.1, 32, 2.4);
const ASSET_B_DIVERSE = genAsset(5.3, 32, 2.6);

function portfolioPath(a: number[], b: number[]): number[] {
  return a.map((v, i) => (v + b[i]) / 2);
}

const STATES = [
  {
    id: "together",
    label: "Assets move together",
    vol: 15.2,
    note: "Returns move in the same direction most of the time. Diversification barely helps.",
    assetB: ASSET_B_TOGETHER,
    portfolioTrend: 0,
    portfolioColor: "#f87171",
  },
  {
    id: "mixed",
    label: "Mixed movement",
    vol: 13.1,
    note: "Partial co-movement. Some risk is diversified away.",
    assetB: ASSET_B_MIXED,
    portfolioTrend: 0,
    portfolioColor: "#fbbf24",
  },
  {
    id: "diversified",
    label: "Diversified",
    vol: 9.8,
    note: "Returns offset. Portfolio volatility falls sharply.",
    assetB: ASSET_B_DIVERSE,
    portfolioTrend: 0,
    portfolioColor: "#34d399",
  },
  {
    id: "shock",
    label: "Rate shock",
    vol: 11.4,
    note: "A sudden rate hike compresses equity multiples. Even diversified portfolios lose value — but recover faster.",
    assetB: ASSET_B_DIVERSE,
    portfolioTrend: -8,
    portfolioColor: "#f87171",
  },
] as const;

export default function PortfolioChapter() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [stateIdx, setStateIdx] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 4 states across 0..1
    const idx = Math.min(
      STATES.length - 1,
      Math.floor(latest * STATES.length * 0.999),
    );
    setStateIdx((cur) => (cur !== idx ? idx : cur));
  });

  const state = STATES[stateIdx];
  const portfolio = portfolioPath(ASSET_A, state.assetB).map((v, i) =>
    i > 24 ? v + state.portfolioTrend * ((i - 24) / 8) : v,
  );

  return (
    <section
      ref={ref}
      className="relative isolate z-10 hp-atmosphere-teal h-[300vh] sm:h-[380vh] lg:h-[440vh]"
    >
      <div className="sticky top-0 z-10 flex h-[100svh] items-center overflow-hidden">
        <div className="hp-canvas w-full">
          {/* Headline — white, no cyan */}
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(12px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8 }}
            className="hp-section"
          >
            Diversification changes the shape of risk.
          </motion.h2>
          <p className="hp-lead mt-8">
            Portfolio risk depends on how the assets move together, not only on the risk of each asset.
          </p>

          {/* Top: state progress bar */}
          <div className="mt-14 flex items-center gap-5">
            <div className="flex flex-1 items-center gap-2">
              {STATES.map((s, i) => {
                const isActive = i === stateIdx;
                const isDone = i < stateIdx;
                return (
                  <div
                    key={s.id}
                    className="h-[2px] flex-1 transition-all duration-500"
                    style={{
                      background: isActive
                        ? "#22d3ee"
                        : isDone
                          ? "rgba(34,211,238,0.4)"
                          : "rgba(255,255,255,0.08)",
                    }}
                  />
                );
              })}
            </div>
            <div className="ml-4 text-[15px] font-medium tabular-nums text-slate-500">
              {String(stateIdx + 1).padStart(2, "0")} / {String(STATES.length).padStart(2, "0")}
            </div>
          </div>

          {/* Main split: state label + large visual + portfolio readout */}
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
            {/* Left — state description + vol */}
            <div>
              <motion.div
                key={state.id}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="text-[16px] font-medium uppercase tracking-[0.06em] text-slate-400">
                  State
                </div>
                <div className="mt-2 text-[clamp(28px,3vw,48px)] font-semibold leading-[1.05] tracking-[-0.025em] text-white">
                  {state.label}
                </div>

                <div className="mt-10 text-[15px] font-medium uppercase tracking-[0.06em] text-slate-400">
                  Portfolio volatility
                </div>
                <motion.div
                  key={state.vol}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="hp-numeric mt-2"
                  style={{
                    fontSize: "clamp(54px, 6vw, 94px)",
                    lineHeight: 0.95,
                    color: state.portfolioColor,
                  }}
                >
                  {state.vol.toFixed(1)}%
                </motion.div>

                <p className="hp-body mt-6 max-w-[440px]">{state.note}</p>
              </motion.div>
            </div>

            {/* Right — large asset path visual */}
            <AssetPathVisual
              assetA={ASSET_A}
              assetB={state.assetB}
              portfolio={portfolio}
              stateId={state.id}
              portfolioColor={state.portfolioColor}
              reduce={!!reduce}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AssetPathVisual({
  assetA,
  assetB,
  portfolio,
  stateId,
  portfolioColor,
  reduce,
}: {
  assetA: number[];
  assetB: number[];
  portfolio: number[];
  stateId: string;
  portfolioColor: string;
  reduce: boolean;
}) {
  const W = 1200;
  const H = 580;
  const PAD = 36;
  const xs = assetA.map((_, i) => (i / (assetA.length - 1)) * (W - PAD * 2) + PAD);
  const all = [...assetA, ...assetB, ...portfolio];
  const min = Math.min(...all) - 2;
  const max = Math.max(...all) + 2;
  const range = max - min || 1;
  const yFor = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const mk = (arr: number[]) => "M" + xs.map((x, i) => `${x},${yFor(arr[i])}`).join(" L");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label={`Asset paths in the ${stateId} state. Asset A in purple, Asset B in amber, combined portfolio in cyan.`}
    >
      <defs>
        <filter id={`pg-${stateId}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`pgArea-${stateId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={portfolioColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={portfolioColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Subtle grid */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={PAD}
          x2={W - PAD}
          y1={PAD + g * (H - PAD * 2)}
          y2={PAD + g * (H - PAD * 2)}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
      ))}

      {/* Area fill under portfolio */}
      <motion.path
        key={`area-${stateId}`}
        d={`${mk(portfolio)} L${xs[xs.length - 1]},${H - PAD} L${xs[0]},${H - PAD} Z`}
        fill={`url(#pgArea-${stateId})`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Asset A */}
      <motion.path
        key={`A-${stateId}`}
        d={mk(assetA)}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.7"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.0 }}
      />
      {/* Asset B */}
      <motion.path
        key={`B-${stateId}`}
        d={mk(assetB)}
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.7"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.0, delay: 0.1 }}
      />
      {/* Portfolio */}
      <motion.path
        key={`P-${stateId}`}
        d={mk(portfolio)}
        fill="none"
        stroke={portfolioColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#pg-${stateId})`}
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.0, delay: 0.2 }}
      />

      {/* Legend — integrated labels at right edge */}
      <g>
        <circle cx={xs[xs.length - 1] + 16} cy={yFor(assetA[assetA.length - 1])} r="4" fill="#a78bfa" />
        <text x={xs[xs.length - 1] + 28} y={yFor(assetA[assetA.length - 1]) + 5} fill="rgba(245,245,247,0.7)" fontSize="14" fontFamily="var(--font-sans), system-ui, sans-serif">
          Asset A
        </text>
        <circle cx={xs[xs.length - 1] + 16} cy={yFor(assetB[assetB.length - 1])} r="4" fill="#fbbf24" />
        <text x={xs[xs.length - 1] + 28} y={yFor(assetB[assetB.length - 1]) + 5} fill="rgba(245,245,247,0.7)" fontSize="14" fontFamily="var(--font-sans), system-ui, sans-serif">
          Asset B
        </text>
        <circle cx={xs[xs.length - 1] + 16} cy={yFor(portfolio[portfolio.length - 1])} r="5" fill={portfolioColor} />
        <text x={xs[xs.length - 1] + 30} y={yFor(portfolio[portfolio.length - 1]) + 5} fill="#F5F5F7" fontSize="15" fontWeight="600" fontFamily="var(--font-sans), system-ui, sans-serif">
          Portfolio
        </text>
      </g>
    </svg>
  );
}
