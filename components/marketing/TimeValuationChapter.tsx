"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Chapter 4 — Time + Valuation.
 *
 * Cinematic timeline. Future cash flow converts to present value using a
 * required return. NO SLIDER. Three discrete states: Lower / Base / Higher
 * required return. Each selection animates PV and implied enterprise value.
 */

type StateId = "lower" | "base" | "higher";

const STATES: {
  id: StateId;
  label: string;
  r: number; // required return %
  pv: number; // present value of $100 in 1 year, = 100 / (1 + r/100)
  impliedValue: number; // implied enterprise value $B, simple Gordon: CF/(r − g)
  note: string;
}[] = [
  {
    id: "lower",
    label: "Lower required return",
    r: 7,
    pv: 93.46,
    impliedValue: 233,
    note: "A lower discount rate raises the present value of every future cash flow. Growth stocks are most sensitive.",
  },
  {
    id: "base",
    label: "Base case",
    r: 9,
    pv: 91.74,
    impliedValue: 200,
    note: "The required return an investor demands for the risk of holding the asset.",
  },
  {
    id: "higher",
    label: "Higher required return",
    r: 11,
    pv: 90.09,
    impliedValue: 176,
    note: "A higher discount rate compresses value. Long-duration assets are most affected.",
  },
];

const FUTURE_CF = 100;
const FUTURE_VALUE_GROWTH = 4; // g = 4%
const FUTURE_CF_NEXT = 10; // $10B next year, used for implied enterprise value

export default function TimeValuationChapter() {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState<StateId>("base");
  const active = STATES.find((s) => s.id === activeId)!;

  return (
    <section
      id="section-value"
      className="hp-chapter border-t border-white/5"
      style={{ background: "linear-gradient(180deg, #060810 0%, #0a0e18 100%)" }}
    >
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
            Future cash flows are <span className="text-accent-cyan">worth less today.</span>
          </motion.h2>
          <p className="hp-lead mt-8">
            Valuation converts expected future cash into a present value using a required return.
          </p>
        </div>

        {/* Cinematic timeline — large PV ↔ FV layout */}
        <div className="mt-20">
          <div className="relative">
            {/* The connector — full-width horizontal line, drawn dynamically */}
            <svg
              viewBox="0 0 1200 200"
              preserveAspectRatio="none"
              className="absolute left-0 top-1/2 hidden h-[200px] w-full -translate-y-1/2 sm:block"
              aria-hidden
            >
              <line
                x1="160"
                y1="100"
                x2="1040"
                y2="100"
                stroke="rgba(34,211,238,0.18)"
                strokeWidth="1.5"
                strokeDasharray="2 6"
              />
              {/* discount-rate label centered above the line */}
              <text
                x="600"
                y="80"
                textAnchor="middle"
                fill="rgba(245,245,247,0.55)"
                fontSize="16"
                fontFamily="var(--font-sans), system-ui, sans-serif"
              >
                discount at r = {active.r}%
              </text>
              <AnimatePresence mode="wait">
                <motion.circle
                  key={active.r}
                  cx={1040}
                  cy={100}
                  r="8"
                  fill="#22d3ee"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </svg>

            <div className="relative grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-0">
              {/* Present value */}
              <div>
                <div className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-400">
                  Today
                </div>
                <div className="text-[15px] font-medium text-slate-500">Present value</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.r}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="hp-numeric-mega mt-4 text-accent-cyan"
                  >
                    ${active.pv.toFixed(2)}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Future cash flow */}
              <div className="sm:text-right">
                <div className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-400">
                  Year 1
                </div>
                <div className="text-[15px] font-medium text-slate-500">Future cash flow</div>
                <div className="hp-numeric-mega mt-4 text-slate-200">${FUTURE_CF.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Discrete state selectors — large text tabs, NO SLIDER */}
        <div className="mt-24 border-t border-white/10 pt-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <div className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-400">
                Required return
              </div>
              <div className="mt-5 flex flex-col gap-1">
                {STATES.map((s) => {
                  const isActive = s.id === activeId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setActiveId(s.id)}
                      aria-pressed={isActive}
                      className={cn(
                        "flex items-baseline justify-between border-b border-white/10 py-5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
                        isActive ? "text-white" : "text-slate-500 hover:text-slate-300",
                      )}
                    >
                      <span className="text-[clamp(22px,2.2vw,32px)] font-medium leading-tight">
                        {s.label}
                      </span>
                      <span
                        className={cn(
                          "hp-numeric ml-6 text-[clamp(24px,2.4vw,36px)]",
                          isActive ? "text-accent-cyan" : "text-slate-500",
                        )}
                      >
                        {s.r}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Implied enterprise value — the dominant readout */}
            <div className="border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
              <div className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-400">
                Implied value
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.impliedValue}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="hp-numeric mt-4 text-accent-cyan"
                  style={{ fontSize: "clamp(72px, 9vw, 144px)", lineHeight: 0.9 }}
                >
                  ${active.impliedValue}B
                </motion.div>
              </AnimatePresence>
              <p className="hp-body mt-6 max-w-[480px]">
                {active.note}
              </p>
              <p className="mt-6 text-[15px] text-slate-500">
                Next-year cash flow ${FUTURE_CF_NEXT}B · Perpetual growth {FUTURE_VALUE_GROWTH}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
