"use client";

import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { useRef, useState } from "react";

/**
 * Chapter 4 — From cash flow to value.
 *
 * One long scroll-driven sequence. The user physically scrolls through
 * five stages, each temporarily becoming the entire composition:
 *
 *   1. Revenue
 *   2. Operating income
 *   3. Free cash flow
 *   4. Future cash flows (the series of cash flows ahead)
 *   5. Present value (after discounting at the required return)
 *
 * Then three cinematic states cycle the required return: Lower / Base /
 * Higher. NO tabs, NO slider. Scroll position drives everything.
 *
 * Layout: a sticky container holds the visual; the surrounding section
 * is tall (about 5x viewport height) so the user has scroll room.
 */

const STAGES = [
  { label: "Revenue", value: "$24.6B", note: "What the business sells." },
  { label: "Operating income", value: "$6.4B", note: "Profit after operating costs." },
  { label: "Free cash flow", value: "$5.1B", note: "Cash the business actually produces." },
  { label: "Future cash flows", value: "Year 1 → Year N", note: "The series of cash flows still ahead." },
  { label: "Present value", value: "$200B", note: "Discounted at the required return." },
] as const;

const THRESHOLDS = [0, 0.15, 0.30, 0.45, 0.60, 0.75, 0.83, 0.91];

const STAGE_RATES = [9, 9, 9, 9, 9, 7, 11, 9];
const STAGE_PVS = [200, 200, 200, 200, 233, 233, 176, 200];
const STAGE_RATE_LABELS = [
  "Base case", "Base case", "Base case", "Base case",
  "Lower required return", "Lower required return", "Higher required return", "Base case",
];

function indexFromProgress(p: number): number {
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (p >= THRESHOLDS[i]) return i;
  }
  return 0;
}

export default function CashFlowValueChapter() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [activeIdx, setActiveIdx] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = indexFromProgress(latest);
    setActiveIdx((cur) => (cur !== next ? next : cur));
  });

  const currentRate = STAGE_RATES[activeIdx];
  const currentPV = STAGE_PVS[activeIdx];
  const rateLabel = STAGE_RATE_LABELS[activeIdx];

  const stage = STAGES[Math.min(activeIdx, 4)];
  const isPVStage = activeIdx >= 4;
  const displayValue = isPVStage ? `$${currentPV}B` : stage.value;
  const displayLabel = isPVStage ? "Present value" : stage.label;
  const isRangeStage = !isPVStage && stage.label === "Future cash flows";
  const displayNote = isPVStage
    ? `Discounted at r = ${currentRate}% · ${rateLabel}`
    : stage.note;

  return (
    <section
      ref={ref}
      className="relative isolate z-10 hp-atmosphere-deep h-[360vh] sm:h-[480vh] lg:h-[560vh]"
    >
      <div className="sticky top-0 z-10 flex h-[100svh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
          {/* Faint cash-flow stream — animated curves flowing horizontally */}
          <FlowStreamBackground reduce={!!reduce} />
        </div>

        <div className="hp-canvas relative z-10 w-full">
          {/* Top headline — visible throughout the chapter */}
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(12px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8 }}
            className="hp-section"
          >
            Cash flow becomes value.
          </motion.h2>
          <p className="hp-lead mt-8">
            Future cash flows are discounted according to their timing and risk.
          </p>

          {/* Stage progress — minimal horizontal indicator */}
          <div className="mt-16 flex items-center gap-4">
            <div className="flex flex-1 items-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => {
                const stageIdx = Math.min(activeIdx, 4);
                const isActive = i === stageIdx;
                const isDone = i < stageIdx;
                return (
                  <div
                    key={i}
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
              {String(Math.min(activeIdx, 4) + 1).padStart(2, "0")} / 05
            </div>
          </div>

          {/* The dominant stage visual */}
          <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:items-center">
            <motion.div
              key={displayLabel + displayValue}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="text-[16px] font-medium uppercase tracking-[0.06em] text-slate-400">
                {displayLabel}
              </div>
              {isRangeStage ? (
                <div
                  className="hp-numeric mt-4 flex flex-col items-start"
                  style={{ fontSize: "clamp(44px, 6vw, 96px)", lineHeight: 0.98 }}
                >
                  <motion.span
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="block"
                  >
                    Year 1
                  </motion.span>
                  <motion.span
                    aria-hidden
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.08 }}
                    className="block text-slate-500"
                    style={{ fontSize: "0.4em", lineHeight: 1.15, marginLeft: "0.06em" }}
                  >
                    →
                  </motion.span>
                  <motion.span
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.16 }}
                    className="block"
                  >
                    Year N
                  </motion.span>
                </div>
              ) : (
                <div
                  key={displayValue}
                  className="hp-numeric mt-4"
                  style={{ fontSize: "clamp(60px, 8.5vw, 140px)", lineHeight: 0.9 }}
                >
                  <motion.span
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={isPVStage ? "text-accent-cyan" : ""}
                  >
                    {displayValue}
                  </motion.span>
                </div>
              )}
              <p className="hp-body mt-8 max-w-[440px]">{displayNote}</p>
            </motion.div>

            {/* Visual side — the cash flow → PV pipeline */}
            <CashFlowPipeline reduce={!!reduce} activeIdx={activeIdx} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Soft flowing curves in the background, suggesting cash flow into the future. */
function FlowStreamBackground({ reduce }: { reduce: boolean }) {
  const W = 1440;
  const H = 900;
  const curves = [
    "M0,300 C400,200 800,400 1440,260",
    "M0,500 C400,400 800,600 1440,460",
    "M0,700 C400,600 800,800 1440,660",
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      {curves.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1"
          strokeOpacity="0.18"
          strokeDasharray="2 8"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, delay: i * 0.4, repeat: reduce ? 0 : Infinity, repeatType: "reverse" }}
        />
      ))}
    </svg>
  );
}

/** Side visual: a cash-flow stream collapsing into a single PV number as the user advances. */
function CashFlowPipeline({
  reduce,
  activeIdx,
}: {
  reduce: boolean;
  activeIdx: number;
}) {
  // Render a series of future cash flow bars; in the early stages they're at the right side.
  // As user advances to stage 4-5, the bars collapse toward PV (single value at left).
  const showPV = activeIdx >= 4;
  const collapse = Math.max(0, Math.min(1, (activeIdx - 3) / 2));

  return (
    <div className="relative">
      <svg viewBox="0 0 600 400" className="w-full" role="img" aria-label="Cash flow pipeline.">
        <defs>
          <linearGradient id="cfBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        {/* Year axis */}
        {[0, 1, 2, 3, 4, 5].map((y) => {
          const x = 60 + y * 90;
          // Each year's cash flow bar; the further out, the more it discounts toward 0 when collapse is on
          const fullHeight = 220 - y * 20;
          const effectiveHeight = fullHeight * (1 - collapse * (y / 5));
          return (
            <g key={y}>
              <motion.rect
                key={y}
                x={x - 24}
                y={320 - effectiveHeight}
                width="48"
                height={effectiveHeight}
                fill="url(#cfBar)"
                stroke="#22d3ee"
                strokeOpacity="0.4"
                strokeWidth="1"
                initial={reduce ? false : { scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: y * 0.1, duration: 0.5 }}
                style={{ transformOrigin: `${x}px 320px` }}
              />
              <text
                x={x}
                y={350}
                textAnchor="middle"
                fontSize="14"
                fill="rgba(245,245,247,0.5)"
                fontFamily="var(--font-sans), system-ui, sans-serif"
              >
                Y{y}
              </text>
            </g>
          );
        })}

        {/* PV point at left — visible once user reaches stage 5 */}
        {showPV && (
          <motion.g
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="60" cy="180" r="8" fill="#22d3ee" />
            <circle cx="60" cy="180" r="20" fill="none" stroke="#22d3ee" strokeOpacity="0.4" strokeWidth="1.5" />
          </motion.g>
        )}
      </svg>
    </div>
  );
}
