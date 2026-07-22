"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Section 07 — Portfolio risk.
 *
 * One correlation slider. Two-asset demo. One portfolio volatility readout.
 * Removed: PORT system labels, relationship-network map, multiple asset cards,
 * full allocation table, summary ratios, separate correlation legend.
 *
 * Deterministic two-asset demo: same volatility, varied correlation.
 * σp = sqrt(w1²σ1² + w2²σ2² + 2 w1 w2 σ1 σ2 ρ)
 */
const W1 = 0.5;
const W2 = 0.5;
const SIGMA = 16; // % — both assets at 16% vol for clarity

function portfolioVol(correlation: number): number {
  const variance =
    W1 * W1 * SIGMA * SIGMA +
    W2 * W2 * SIGMA * SIGMA +
    2 * W1 * W2 * SIGMA * SIGMA * correlation;
  return Math.sqrt(variance);
}

export default function PortfolioConstellation() {
  const reduce = useReducedMotion();
  const [corr, setCorr] = useState(0.8);
  const vol = portfolioVol(corr);
  const volAtZero = portfolioVol(0);

  return (
    <section
      id="section-portfolio"
      className="hp-section-pad relative w-full overflow-hidden border-t border-white/5"
    >
      <div className="hp-container">
        <div className="hp-marker">07 / Portfolio</div>
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-section mt-5"
        >
          Portfolio risk depends on how assets move together.
        </motion.h2>
        <p className="hp-lead mt-6">
          Weights, volatility, and correlation determine portfolio risk.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Correlation control */}
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="correlation" className="text-[15px] font-medium text-slate-300">
                Correlation
              </label>
              <span className="hp-numeric text-[24px] text-white sm:text-[28px]">
                {corr.toFixed(2)}
              </span>
            </div>
            <input
              id="correlation"
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={corr}
              onChange={(e) => setCorr(parseFloat(e.target.value))}
              aria-label="Asset correlation"
              aria-valuemin={-1}
              aria-valuemax={1}
              aria-valuenow={corr}
              aria-valuetext={`${corr.toFixed(2)} correlation`}
              className="mt-5 w-full accent-accent-cyan"
            />
            <div className="mt-2 flex justify-between text-[13px] text-slate-500">
              <span className="tabular-nums">−1.00</span>
              <span className="tabular-nums">0.00</span>
              <span className="tabular-nums">1.00</span>
            </div>
            <p className="hp-body mt-6 max-w-sm">
              Two assets, each at {SIGMA}% volatility, equal weight. Only the
              correlation changes.
            </p>

            {/* Two-asset visual — minimal dots moving together or apart */}
            <div className="mt-8 h-[80px] rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="relative h-full w-full">
                <AssetDot
                  label="Asset A"
                  side="left"
                  corr={corr}
                  reduce={!!reduce}
                />
                <AssetDot
                  label="Asset B"
                  side="right"
                  corr={corr}
                  reduce={!!reduce}
                />
              </div>
            </div>
          </div>

          {/* Result — portfolio volatility */}
          <div className="lg:border-l lg:border-white/10 lg:pl-16">
            <div className="text-[15px] font-medium text-slate-400">
              Portfolio volatility
            </div>
            <motion.div
              key={corr.toFixed(2)}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="hp-numeric mt-2 text-[64px] leading-none text-accent-cyan sm:text-[88px]"
            >
              {vol.toFixed(1)}%
            </motion.div>
            <div className="mt-5 flex items-baseline gap-4">
              <span className="text-[14px] text-slate-500">
                From uncorrelated baseline
              </span>
              <span
                className={cn(
                  "hp-numeric text-[20px]",
                  vol < volAtZero
                    ? "text-accent-green"
                    : vol > volAtZero
                      ? "text-accent-red"
                      : "text-slate-300",
                )}
              >
                {vol < volAtZero ? "−" : vol > volAtZero ? "+" : ""}
                {Math.abs(vol - volAtZero).toFixed(1)}pp
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AssetDot({
  label,
  side,
  corr,
  reduce,
}: {
  label: string;
  side: "left" | "right";
  corr: number;
  reduce: boolean;
}) {
  // Higher correlation = dots swing together; lower = dots drift apart.
  // Map correlation [-1, 1] to vertical offset for visual cue.
  const offset = (1 - Math.abs(corr)) * 18;
  const dir = side === "left" ? -1 : 1;
  return (
    <motion.div
      initial={false}
      animate={reduce ? {} : { y: dir * offset }}
      transition={{ type: "spring", stiffness: 80, damping: 14 }}
      className={cn(
        "absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-1.5",
        side === "left" ? "left-[20%]" : "right-[20%]",
      )}
    >
      <span className="h-3 w-3 rounded-full bg-accent-cyan" />
      <span className="text-[12px] font-medium text-slate-400">{label}</span>
    </motion.div>
  );
}
