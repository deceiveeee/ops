"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  InlineMath,
} from "./shared";

/**
 * Section 1 — The market as a thermometer, not a crystal ball.
 * A button "Read the market" reveals floating bond prices, which transform into
 * spot rates and connect into a yield curve.
 */
export default function MarketThermometerIntro() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="ops-caption text-[12px] text-slate-400">
        Prices &rarr; Spot rates &rarr; Forward rates &rarr; Market-implied
        expectations.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Crystal ball (crossed out) */}
        <div className="relative overflow-hidden rounded-2xl border border-accent-red/30 bg-accent-red/[0.04] p-6">
          <div className="ops-caption text-[11px] text-accent-red">
            What the market is not
          </div>
          <div className="mt-4 flex items-center gap-4">
            <CrystalBall reduce={reduce} />
            <div>
              <div className="ops-body-strong text-[16px] text-slate-100">
                A crystal ball
              </div>
              <p className="ops-body mt-1 text-[14px] leading-6 text-slate-300">
                Bond prices do not know the future. They cannot guarantee what
                rates will be.
              </p>
            </div>
          </div>
        </div>

        {/* Thermometer / yield curve */}
        <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.04] p-6">
          <div className="ops-caption text-[11px] text-accent-cyan">
            What the market is
          </div>
          <div className="mt-4 flex items-center gap-4">
            <ThermometerIcon reduce={reduce} />
            <div>
              <div className="ops-body-strong text-[16px] text-slate-100">
                A market thermometer
              </div>
              <p className="ops-body mt-1 text-[14px] leading-6 text-slate-300">
                Prices show what investors are willing to pay today for dollars
                arriving at different future dates.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DefinitionCard term="Reading the market">
        Market prices contain information, but they are not a perfect crystal
        ball. Bond prices can imply what the market is pricing about future
        interest rates, but{" "}
        <span className="text-slate-50">
          market-implied information can be wrong
        </span>
        .
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Prices &rarr; rates &rarr; curve
            </span>
          </div>
          <button
            type="button"
            aria-pressed={open}
            aria-label={open ? "Hide the market reading" : "Read the market"}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
              open
                ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
                : "border-white/20 text-slate-200 hover:bg-white/5",
            )}
          >
            {open ? "Hide reading" : "Read the market"}
          </button>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          From scattered prices to a structured curve
        </h4>

        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/50 p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {!open ? (
              <motion.div
                key="dormant"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12 text-center"
              >
                <p className="ops-body max-w-md text-[15px] leading-7 text-slate-300">
                  Discount bond prices are floating in the market. Press{" "}
                  <span className="text-accent-cyan">
                    &ldquo;Read the market&rdquo;
                  </span>{" "}
                  to organize them into spot rates and connect them into a yield
                  curve.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PriceToCurve reduce={reduce} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </InteractiveFrame>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CrystalBall({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      role="img"
      aria-label="Crystal ball, crossed out: the market cannot predict the future"
      animate={reduce ? undefined : { rotate: [0, 2, -2, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      <circle
        cx="32"
        cy="30"
        r="20"
        fill="rgba(248,113,113,0.10)"
        stroke="rgba(248,113,113,0.55)"
        strokeWidth="1.5"
      />
      <circle cx="26" cy="24" r="4" fill="rgba(248,113,113,0.35)" />
      {/* base */}
      <path
        d="M22 50 L42 50 L38 56 L26 56 Z"
        fill="rgba(248,113,113,0.18)"
        stroke="rgba(248,113,113,0.45)"
        strokeWidth="1.2"
      />
      {/* cross out */}
      <line
        x1="8"
        y1="8"
        x2="56"
        y2="58"
        stroke="rgba(248,113,113,0.8)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

function ThermometerIcon({ reduce }: { reduce: boolean | null }) {
  return (
    <motion.svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      role="img"
      aria-label="Thermometer and yield curve: the market shows today's prices"
    >
      <rect
        x="26"
        y="6"
        width="12"
        height="38"
        rx="6"
        fill="rgba(34,211,238,0.10)"
        stroke="rgba(34,211,238,0.55)"
        strokeWidth="1.5"
      />
      <motion.rect
        x="28"
        y="20"
        width="8"
        height="20"
        rx="4"
        fill="rgba(34,211,238,0.55)"
        animate={reduce ? undefined : { y: [24, 16, 24], height: [16, 24, 16] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="32" cy="48" r="8" fill="rgba(34,211,238,0.55)" />
      {/* mini curve */}
      <path
        d="M6 50 Q20 44 34 46 T58 40"
        fill="none"
        stroke="rgba(34,211,238,0.5)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/* The price → rate → curve reveal */
function PriceToCurve({ reduce }: { reduce: boolean | null }) {
  // Three maturities with their discount prices and implied spot rates.
  const points = [
    { t: 1, p: 0.9615, r: 0.04 },
    { t: 3, p: 0.8638, r: 0.05 },
    { t: 5, p: 0.7473, r: 0.06 },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {points.map((pt, i) => (
          <motion.div
            key={pt.t}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i, duration: 0.4 }}
            className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center"
          >
            <div className="ops-caption text-[11px] text-slate-400">
              {pt.t}-yr discount bond
            </div>
            <motion.div
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 * i + 0.3 }}
              className="mt-1 font-sans text-[15px] text-slate-200"
            >
              P = {pt.p.toFixed(4)}
            </motion.div>
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 * i + 0.55, duration: 0.35 }}
              className="mt-1 font-sans text-[15px] text-accent-cyan"
            >
              <InlineMath>{`r_{0,${pt.t}} = ${(pt.r * 100).toFixed(2)}\\%`}</InlineMath>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Connecting curve */}
      <motion.svg
        viewBox="0 0 600 160"
        className="w-full"
        role="img"
        aria-label="Yield curve formed by connecting the three spot rates"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <line
          x1="40"
          y1="130"
          x2="560"
          y2="130"
          stroke="rgba(255,255,255,0.2)"
        />
        <line x1="40" y1="20" x2="40" y2="130" stroke="rgba(255,255,255,0.2)" />
        <text x="40" y="150" className="fill-slate-400 font-sans" fontSize="11">
          t=1
        </text>
        <text
          x="298"
          y="150"
          className="fill-slate-400 font-sans"
          fontSize="11"
        >
          t=3
        </text>
        <text
          x="548"
          y="150"
          className="fill-slate-400 font-sans"
          fontSize="11"
        >
          t=5
        </text>
        <motion.path
          d="M40 90 Q 300 70 560 40"
          fill="none"
          stroke="rgba(34,211,238,0.85)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.3, duration: 0.9, ease: "easeInOut" }}
        />
        {[
          { x: 40, y: 90, r: "4.0%" },
          { x: 300, y: 64, r: "5.0%" },
          { x: 560, y: 40, r: "6.0%" },
        ].map((d, i) => (
          <motion.circle
            key={i}
            cx={d.x}
            cy={d.y}
            r="5"
            fill="#22d3ee"
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.3 + i * 0.25 }}
          />
        ))}
        <text
          x={560}
          y={30}
          textAnchor="end"
          className="fill-accent-cyan font-sans"
          fontSize="11"
        >
          yield curve
        </text>
      </motion.svg>

      <p className="ops-body text-[14px] leading-6 text-slate-300">
        Scattered prices became a structured curve. The curve is the
        market&apos;s current reading — useful, but not a guarantee of what
        rates will actually be.
      </p>
    </div>
  );
}
