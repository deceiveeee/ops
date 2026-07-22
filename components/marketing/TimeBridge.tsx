"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Quiet transition between cash flow and valuation.
 *
 * Per spec: one simple timeline, one future cash flow, one present value,
 * one discounting animation. Removed: Bridge · time value eyebrow,
 * Duration/Maturity/Discounting/Present value pill cluster, TimeValueObject
 * sculpture, long explanatory paragraph.
 */
export default function TimeBridge() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  // Future cash flow collapses toward present value as user scrolls.
  const collapseY = useTransform(scrollYProgress, [0.1, 0.7], [60, 0]);
  const collapseOpacity = useTransform(scrollYProgress, [0.1, 0.7], [0.4, 1]);
  const drawLine = useTransform(scrollYProgress, [0.1, 0.6], [0, 1]);

  return (
    <section
      ref={ref}
      className="hp-section-pad-sm relative w-full overflow-hidden border-t border-white/5"
    >
      <div className="hp-container">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-section"
        >
          Time changes value.
        </motion.h2>
        <p className="hp-lead mt-6">
          Discounting converts future cash flows into present value.
        </p>

        {/* One timeline: today (PV) ──── future cash flow */}
        <div className="mt-16">
          <div className="relative h-[180px]">
            {/* The discounting connector — drawn as user scrolls */}
            <svg
              viewBox="0 0 1000 180"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <motion.line
                x1="120"
                y1="90"
                x2="880"
                y2="90"
                stroke="#22d3ee"
                strokeWidth="1.5"
                strokeDasharray="2 6"
                style={{ pathLength: drawLine, opacity: 0.6 }}
              />
            </svg>

            {/* Present value (left) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2">
              <div className="text-[14px] font-medium text-slate-500">Today</div>
              <div className="hp-numeric mt-1 text-[36px] text-accent-cyan sm:text-[44px]">
                $95.24
              </div>
              <div className="text-[14px] text-slate-500">Present value</div>
            </div>

            {/* Future cash flow (right) — collapses toward PV */}
            <motion.div
              style={{ y: collapseY, opacity: collapseOpacity }}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-right"
            >
              <div className="text-[14px] font-medium text-slate-500">Year 1</div>
              <div className="hp-numeric mt-1 text-[36px] text-slate-200 sm:text-[44px]">
                $100
              </div>
              <div className="text-[14px] text-slate-500">Future cash flow</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
