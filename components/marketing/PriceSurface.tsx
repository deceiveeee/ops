"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { stockChart, chartEvents } from "@/data/marketing";
import { cn } from "@/lib/utils";

/**
 * Section 02 — Price.
 *
 * One chart. One active event at a time. Quiet sans-serif event names.
 * Removed: PRICE IS ONLY THE SURFACE label, multi-legend chips, decorative
 * orbital echo, paragraph, mono chips. Active event is selected, not all-on.
 */
const W = 1000;
const H = 360;
const PAD = 28;

export default function PriceSurface() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const [activeEvent, setActiveEvent] = useState(0);

  const xs = stockChart.map((_, i) => (i / (stockChart.length - 1)) * (W - PAD * 2) + PAD);
  const ys = stockChart.map((p) => p.p);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const yFor = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  const drawLength = useTransform(scrollYProgress, [0.08, 0.5], [0, 1]);
  const labelOpacity = useTransform(scrollYProgress, [0.12, 0.22], [0, 1]);

  const linePath = "M" + xs.map((x, i) => `${x},${yFor(ys[i])}`).join(" L");
  const areaPath = `${linePath} L${xs[xs.length - 1]},${H} L${xs[0]},${H} Z`;

  const event = chartEvents[activeEvent];
  const eventColor =
    event.tone === "up" ? "#34d399" : event.tone === "down" ? "#f87171" : "#a78bfa";

  return (
    <section
      id="story"
      ref={ref}
      className="hp-section-pad relative w-full overflow-hidden"
    >
      <div className="hp-container">
        {/* Quiet marker — replaces spaced uppercase eyebrow */}
        <div className="hp-marker">02 / Price</div>

        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-section mt-5"
        >
          A chart shows what happened.
          <br />
          <span className="text-accent-cyan">Finance asks why.</span>
        </motion.h2>

        <p className="hp-lead mt-6">
          Select an event to see what changed.
        </p>

        {/* Single chart */}
        <div className="mt-12">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`Stock chart with the event ${event.label} highlighted.`}
          >
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d={areaPath}
              fill="url(#priceFill)"
              style={{ opacity: drawLength }}
            />
            <motion.path
              d={linePath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: drawLength }}
            />
            {/* Render all event nodes, but only the active one is prominent */}
            {chartEvents.map((e, i) => {
              const x = xs[e.t];
              const y = yFor(ys[e.t]);
              const color =
                e.tone === "up" ? "#34d399" : e.tone === "down" ? "#f87171" : "#a78bfa";
              const isActive = i === activeEvent;
              return (
                <g key={e.t}>
                  <line
                    x1={x}
                    x2={x}
                    y1={y}
                    y2={H}
                    stroke={color}
                    strokeOpacity={isActive ? 0.5 : 0.12}
                    strokeDasharray="2 4"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 5 : 3}
                    fill={color}
                    fillOpacity={isActive ? 1 : 0.4}
                  />
                  {isActive && (
                    <circle cx={x} cy={y} r={10} fill="none" stroke={color} strokeOpacity="0.5" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Event selector — sans-serif, single-row, no chips */}
        <motion.div
          style={{ opacity: labelOpacity }}
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
        >
          {chartEvents.map((e, i) => {
            const isActive = i === activeEvent;
            const toneColor =
              e.tone === "up"
                ? "text-accent-green"
                : e.tone === "down"
                  ? "text-accent-red"
                  : "text-accent-purple";
            return (
              <button
                key={e.t}
                type="button"
                onClick={() => setActiveEvent(i)}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center gap-2 text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 rounded-md",
                  isActive ? "text-white" : "text-slate-500 hover:text-slate-300",
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", isActive ? toneColor : "bg-slate-600")}
                  aria-hidden
                />
                {e.label}
              </button>
            );
          })}
        </motion.div>

        {/* One active event explanation only */}
        <motion.div
          key={event.label}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 flex items-baseline gap-4 border-t border-white/10 pt-5"
        >
          <span
            className="hp-numeric text-[28px] sm:text-[32px]"
            style={{ color: eventColor }}
          >
            {event.label}
          </span>
          <span className="hp-body">
            The market moved on this event. The chart records the move; the
            rest of OPS teaches you to read the cause.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
