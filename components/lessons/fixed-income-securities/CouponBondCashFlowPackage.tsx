"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";
import CashFlowTimeline from "./CashFlowTimeline";
import type { CashFlow } from "./CashFlowTimeline";

/**
 * A coupon bond is a package of dated cash flows.
 * 3yr 5% bond, $1000 face: Y1 $50, Y2 $50, Y3 $1050.
 * "Break apart" animates the bond splitting into 3 dated claims (zero-coupons).
 * "Recombine" reassembles them.
 */
const FACE = 1000;
const COUPON = 50;
const FLOWS = [
  { period: 1, amount: COUPON, label: "Year 1 coupon" },
  { period: 2, amount: COUPON, label: "Year 2 coupon" },
  { period: 3, amount: FACE + COUPON, label: "Year 3 coupon + face" },
];

export default function CouponBondCashFlowPackage() {
  const reduce = useReducedMotion();
  const [broken, setBroken] = useState(false);

  const timelineFlows: CashFlow[] = FLOWS.map((f) => ({
    period: f.period,
    amount: f.amount,
  }));

  return (
    <div className="space-y-6">
      <DefinitionCard term="A coupon bond is a package">
        A coupon bond is not one instrument — it is a{" "}
        <span className="text-accent-cyan">package of dated cash flows</span>.
        Each payment is, on its own, a tiny zero-coupon bond. STRIPS literally
        separate them.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              3yr · 5% coupon · $1,000 face
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBroken((b) => !b)}
            aria-pressed={broken}
            className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-4 py-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            {broken ? "Recombine" : "Break apart"}
          </button>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          One bond, three dated claims
        </h4>

        {/* Whole bond vs broken strips */}
        <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-ink-950/40 p-5">
          <AnimatePresence mode="wait" initial={false}>
            {!broken ? (
              <motion.div
                key="whole"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-center">
                  <div className="rounded-2xl border border-accent-cyan/40 bg-accent-cyan/[0.08] px-8 py-6 text-center">
                    <div className="ops-caption text-[11px] text-accent-cyan">
                      Whole coupon bond
                    </div>
                    <div className="mt-1 font-mono text-[20px] text-white">
                      3yr · 5% · $1,000
                    </div>
                    <div className="ops-caption mt-1 text-[11px] text-slate-400">
                      three promised payments bundled together
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="strips"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              >
                {FLOWS.map((f, i) => (
                  <motion.div
                    key={f.period}
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.08 }}
                    className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] px-4 py-4 text-center"
                  >
                    <div className="ops-caption text-[11px] text-accent-green">
                      Zero-coupon claim
                    </div>
                    <div className="mt-1 font-mono text-[18px] text-white">
                      ${f.amount.toLocaleString()}
                    </div>
                    <div className="ops-caption mt-1 text-[11px] text-slate-400">
                      paid at year {f.period}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timeline (always shows the underlying cash flows) */}
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <CashFlowTimeline
            flows={timelineFlows}
            maxPeriod={3}
            highlightFinal
            ariaLabel="Coupon bond cash flows: 50, 50, 1050"
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            {broken ? (
              <>
                Broken apart, the bond is three independent zero-coupon bonds:{" "}
                <span className="font-mono text-accent-green">$50 / $50 / $1,050</span>{" "}
                at years 1, 2, and 3. Each can be priced and traded on its own.
              </>
            ) : (
              <>
                Bundled together, the three payments trade as a single coupon
                bond. The bond&apos;s price is just the sum of the prices of its
                three pieces.
              </>
            )}
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}
