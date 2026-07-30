"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaExplainer,
} from "./shared";

/**
 * Lesson 3.2 opening recap.
 * Connects Lesson 3.1 (pure discount bond) to Lesson 3.2 (spot rates).
 * A pure discount bond has one payment and one date, so it is the cleanest
 * instrument for learning how to back a rate out of a price.
 */
export default function OnePaymentBondRecap() {
  const reduce = useReducedMotion();

  return (
    <div className="space-y-6">
      <DefinitionCard term="Why start with a pure discount bond?">
        A pure discount bond is the cleanest instrument for learning rates because
        it has <span className="text-accent-cyan">one payment</span> and
        <span className="text-accent-amber"> one date</span>. No coupons, no
        reinvestment ambiguity — just a price today and a face value at maturity.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Recap from Lesson 3.1
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          One payment, one date, one rate
        </h4>

        {/* Visual: today P0 → future F at T */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-5">
          <div className="flex min-w-[480px] items-center justify-between gap-4">
            {/* Today */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-xl border border-accent-cyan/40 bg-accent-cyan/[0.08] px-4 py-3">
                <div className="ops-caption text-[11px] text-accent-cyan">
                  Today · t = 0
                </div>
                <div className="mt-1 font-sans text-[20px] text-white">
                  P<sub>0</sub>
                </div>
                <div className="ops-caption mt-1 text-[11px] text-slate-400">
                  price today
                </div>
              </div>
            </div>

            {/* Arrow with discounting label */}
            <div className="relative flex-1">
              <svg
                viewBox="0 0 320 60"
                className="w-full"
                role="img"
                aria-label="Discount a single future payment back to today"
              >
                <motion.line
                  x1={300}
                  y1={30}
                  x2={24}
                  y2={30}
                  stroke="#22d3ee"
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  initial={reduce ? false : { pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <polygon points="24,30 36,24 36,36" fill="#22d3ee" />
                <text
                  x={160}
                  y={18}
                  textAnchor="middle"
                  className="fill-slate-300 font-sans"
                  fontSize="12"
                >
                  discount back
                </text>
                <text
                  x={160}
                  y={50}
                  textAnchor="middle"
                  className="fill-accent-amber font-sans"
                  fontSize="12"
                >
                  T years
                </text>
              </svg>
            </div>

            {/* Future */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="rounded-xl border border-accent-green/40 bg-accent-green/[0.08] px-4 py-3">
                <div className="ops-caption text-[11px] text-accent-green">
                  Maturity · t = T
                </div>
                <div className="mt-1 font-sans text-[20px] text-white">
                  F
                </div>
                <div className="ops-caption mt-1 text-[11px] text-slate-400">
                  face value at maturity
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="ops-body mt-5 text-[15px] leading-7 text-slate-200">
          If you know <span className="text-accent-green font-sans">F</span>,{" "}
          <span className="text-accent-cyan font-sans">P<sub>0</sub></span>, and{" "}
          <span className="text-accent-amber font-sans">T</span>, you can solve
          for <span className="font-sans text-slate-100">r</span>. That
          single rate — the price-implied rate for the whole interval — is exactly
          what we will turn into the <span className="text-accent-cyan">spot rate</span>{" "}
          in this lesson.
        </p>

        <FormulaExplainer
          className="mt-5"
          label="Pure discount bond"
          tone="cyan"
          formula={"P_0 = \\frac{F}{(1+r)^T}"}
          variables={[
            { symbol: "P_0", description: "price today" },
            { symbol: "F", description: "face value at maturity" },
            { symbol: "r", description: "discount rate" },
            { symbol: "T", description: "maturity in years" },
          ]}
          interpretation="If you know F, P₀, and T, you can solve for r."
        />
      </InteractiveFrame>
    </div>
  );
}
