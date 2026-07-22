"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { stockChart, chartEvents, businessDrivers } from "@/data/marketing";
import { cn } from "@/lib/utils";

/**
 * Chapter 2 — Price & Business.
 *
 * Combines old Price (02) and Business (03) sections into one cinematic
 * chapter. Layout: large headline on left, large chart on right that
 * transforms into business drivers as the user changes the selected event.
 *
 * No sliders. Four large text-tab states: Earnings / Margins / Rates /
 * Repricing. Selecting an event highlights that chart event AND promotes
 * a single driver beneath the chart.
 */

const EVENTS = chartEvents; // 4 events
const DRIVERS_BY_EVENT: Record<string, (typeof businessDrivers)[number]> = {
  4: businessDrivers[0], // Earnings surprise → Revenue
  9: businessDrivers[1], // Margin pressure → Gross Margin
  15: businessDrivers[4], // Rate expectations → Shares (rates hit valuation)
  21: businessDrivers[2], // Market repricing → Free cash flow
};
const DRIVER_HINT: Record<string, string> = {
  4: "Revenue beat drives a re-rating of expected growth.",
  9: "Margin compression cuts the cash-flow base the multiple rests on.",
  15: "Higher rates raise the discount rate and compress valuation.",
  21: "A broad repricing reflects a reset of expectations across the market.",
};

const W = 1200;
const H = 560;
const PAD_X = 36;
const PAD_TOP = 36;
const PAD_BOT = 60;

export default function PriceBusinessChapter() {
  const reduce = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const event = EVENTS[activeIdx];

  const xs = stockChart.map(
    (_, i) => (i / (stockChart.length - 1)) * (W - PAD_X * 2) + PAD_X,
  );
  const ys = stockChart.map((p) => p.p);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const yFor = (v: number) =>
    H - PAD_BOT - ((v - min) / range) * (H - PAD_TOP - PAD_BOT);
  const linePath = "M" + xs.map((x, i) => `${x},${yFor(ys[i])}`).join(" L");
  const areaPath = `${linePath} L${xs[xs.length - 1]},${H - PAD_BOT} L${xs[0]},${H - PAD_BOT} Z`;

  const driver = DRIVERS_BY_EVENT[event.t];
  const driverColor =
    driver.tone === "up" ? "#34d399" : driver.tone === "down" ? "#f87171" : "#cbd5e1";

  return (
    <section
      id="story"
      className="hp-chapter border-t border-white/5"
      style={{ background: "linear-gradient(180deg, #05070d 0%, #0a0e18 100%)" }}
    >
      <div className="hp-canvas">
        {/* Headline + lead — left-aligned, generous */}
        <div className="max-w-[820px]">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7 }}
            className="hp-section"
          >
            A chart shows what happened.
            <br />
            <span className="text-accent-cyan">Finance explains why.</span>
          </motion.h2>
          <p className="hp-lead mt-8">
            Price is the result of changes in the business and in investor expectations.
          </p>
        </div>

        {/* State tabs — readable, no pills, no mono */}
        <div className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-white/10 pb-5">
          {EVENTS.map((e, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={e.t}
                type="button"
                onClick={() => setActiveIdx(i)}
                aria-pressed={isActive}
                className={cn(
                  "hp-tab border-b-2 pb-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
                  isActive
                    ? "hp-tab-active border-accent-cyan"
                    : "border-transparent hover:text-slate-300",
                )}
              >
                {e.label}
              </button>
            );
          })}
        </div>

        {/* Large chart — full canvas width */}
        <div className="relative mt-10">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`Stock chart highlighting the ${event.label} event and the resulting price move.`}
          >
            <defs>
              <linearGradient id="pbArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <filter id="pbGlow" x="-10%" y="-10%" width="120%" height="120%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* subtle horizontal reference lines */}
            {[0.25, 0.5, 0.75].map((g) => (
              <line
                key={g}
                x1={PAD_X}
                x2={W - PAD_X}
                y1={PAD_TOP + g * (H - PAD_TOP - PAD_BOT)}
                y2={PAD_TOP + g * (H - PAD_TOP - PAD_BOT)}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
              />
            ))}
            <motion.path
              d={areaPath}
              fill="url(#pbArea)"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />
            <motion.path
              d={linePath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#pbGlow)"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
            {/* Events — all visible, active one emphasized */}
            {EVENTS.map((e, i) => {
              const x = xs[e.t];
              const y = yFor(ys[e.t]);
              const color =
                e.tone === "up" ? "#34d399" : e.tone === "down" ? "#f87171" : "#a78bfa";
              const isActive = i === activeIdx;
              return (
                <g key={e.t}>
                  <line
                    x1={x}
                    x2={x}
                    y1={y}
                    y2={H - PAD_BOT}
                    stroke={color}
                    strokeOpacity={isActive ? 0.5 : 0.15}
                    strokeDasharray="3 5"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 8 : 5}
                    fill={color}
                    fillOpacity={isActive ? 1 : 0.5}
                  />
                  {isActive && (
                    <circle cx={x} cy={y} r="14" fill="none" stroke={color} strokeOpacity="0.55" strokeWidth="2" />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Active event description — large, readable */}
          <div className="mt-8 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-end sm:justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={event.t}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="max-w-[640px]"
              >
                <div className="text-[16px] font-medium uppercase tracking-[0.04em] text-accent-cyan">
                  {event.label}
                </div>
                <p className="hp-body mt-3">
                  {DRIVER_HINT[event.t]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* The single promoted business driver — large numerical moment */}
            <AnimatePresence mode="wait">
              <motion.div
                key={driver.key + event.t}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="text-left sm:text-right"
              >
                <div className="text-[15px] font-medium uppercase tracking-[0.04em] text-slate-400">
                  {driver.label}
                </div>
                <div
                  className="hp-numeric mt-1"
                  style={{ fontSize: "clamp(48px, 5vw, 72px)", lineHeight: 1, color: driverColor }}
                >
                  {driver.value}
                </div>
                <div className="hp-body mt-2 max-w-[260px] sm:ml-auto">{driver.note}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Secondary driver navigation — readable, not tiny */}
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-8 sm:grid-cols-3 lg:grid-cols-5">
          {businessDrivers.map((d) => (
            <div key={d.key} className="flex flex-col gap-1">
              <div className="text-[14px] font-medium uppercase tracking-[0.04em] text-slate-500">
                {d.label}
              </div>
              <div
                className={cn(
                  "hp-numeric text-[24px]",
                  d.tone === "up" && "text-accent-green",
                  d.tone === "down" && "text-accent-red",
                  d.tone === "neutral" && "text-slate-100",
                )}
              >
                {d.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
