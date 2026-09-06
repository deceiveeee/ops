"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import { stockChart } from "@/data/marketing";

/**
 * Chapter 1 — Hero.
 *
 * Cinematic full-bleed visual: a price chart that opens to reveal the
 * business drivers beneath it. The viewer sees the surface first, then
 * the structure. One entrance animation only (no scroll dependency,
 * because this IS the first viewport).
 *
 * Composition: massive headline anchored top-left over a full-bleed
 * layered visual occupying the lower 60% of the viewport. Headline is
 * pure white — cyan is reserved for the price line itself.
 */
export default function HeroChapter() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden hp-atmosphere-deep"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: bgOpacity,
          background:
            "radial-gradient(ellipse 72% 50% at 48% 42%, rgba(34,211,238,0.07), rgba(12,29,40,0.035) 44%, transparent 74%)",
        }}
      />

      <motion.div
        style={{ y: bgY, opacity: bgOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[72svh]"
        aria-hidden
      >
        <HeroVisual reduce={!!reduce} />
      </motion.div>

      <div className="hp-canvas relative z-10 flex min-h-[100svh] flex-col justify-start pt-[clamp(120px,17vh,180px)]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="max-w-[1100px]"
        >
          <h1 className="hp-hero">
            Decode the market
            <br />
            beneath the chart.
          </h1>
        </motion.div>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: "easeOut" }}
          className="hp-lead mt-9"
        >
          Learn how businesses, filings, cash flows, valuation, and portfolios connect.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <Button href="/start" size="lg">
            Find your starting point
          </Button>
          <Button href="/plan" variant="outline" size="lg">
            Open your plan
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * The hero flagship visual — a layered SVG scene.
 *
 * Layer order (back to front):
 *   1. Faint horizontal gridlines (graph paper memory)
 *   2. Three driver bands (revenue / margin / cash flow) — visible from the start
 *      but masked by the chart surface, which lifts as the animation plays
 *   3. Cyan price chart line (the surface) with glow
 *   4. Bright "now" endpoint
 *
 * The animation: chart line draws in, then the area fill fades, then the
 * chart surface lifts up and partially fades, revealing the driver bands
 * beneath. This IS the homepage's thesis in one image.
 */
function HeroVisual({ reduce }: { reduce: boolean }) {
  const W = 1440;
  const H = 620;

  // Price path
  const xs = stockChart.map((_, i) => (i / (stockChart.length - 1)) * W);
  const ys = stockChart.map((p) => p.p);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const yFor = (v: number) => H * 0.24 + ((v - min) / range) * H * 0.19;
  const linePath = "M" + xs.map((x, i) => `${x},${yFor(ys[i])}`).join(" L");
  const areaPath = `${linePath} L${W},${H * 0.60} L0,${H * 0.60} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0ea5b7" />
          <stop offset="60%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#67e8f9" />
        </linearGradient>
        <linearGradient id="driverRevenue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#36a083" stopOpacity="0.24" />
          <stop offset="100%" stopColor="#36a083" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="driverMargin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8275c4" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#8275c4" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id="driverCash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c89a3a" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#c89a3a" stopOpacity="0.03" />
        </linearGradient>
        <filter id="heroGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Mask used to "lift" the price surface away from the drivers */}
        <linearGradient id="surfaceFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="1" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* 1. Faint graph-paper memory */}
      {[0.15, 0.30, 0.45, 0.60, 0.75, 0.90].map((g) => (
        <line
          key={g}
          x1="0"
          x2={W}
          y1={g * H}
          y2={g * H}
          stroke="rgba(255,255,255,0.035)"
          strokeWidth="1"
        />
      ))}

      {/* 2. Driver bands — visible from the start; the chart lifts to reveal them */}
      <DriverBand
        delay={0.6}
        label="Revenue"
        value="$24.6B"
        color="url(#driverRevenue)"
        strokeColor="#36a083"
        topY={H * 0.46}
        bottomY={H * 0.60}
        reduce={reduce}
      />
      <DriverBand
        delay={0.85}
        label="Gross margin"
        value="41.2%"
        color="url(#driverMargin)"
        strokeColor="#8275c4"
        topY={H * 0.62}
        bottomY={H * 0.76}
        reduce={reduce}
      />
      <DriverBand
        delay={1.10}
        label="Free cash flow"
        value="$5.1B"
        color="url(#driverCash)"
        strokeColor="#c89a3a"
        topY={H * 0.78}
        bottomY={H * 0.96}
        reduce={reduce}
      />

      {/* 3. Price chart surface — draws in first, then lifts and fades to reveal drivers */}
      <motion.g
        initial={reduce ? false : { y: 0, opacity: 0 }}
        animate={{ y: [0, 0, -28], opacity: [0, 1, 0.85] }}
        transition={{
          duration: 3.2,
          times: [0, 0.35, 1],
          ease: "easeInOut",
        }}
      >
        <path d={areaPath} fill="url(#heroArea)" />
        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#heroLine)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#heroGlow)"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />
      </motion.g>

      {/* 4. Bright endpoint — the "now" moment */}
      <motion.circle
        cx={xs[xs.length - 1]}
        cy={yFor(ys[ys.length - 1])}
        r="7"
        fill="#67e8f9"
        initial={reduce ? false : { opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
      />
      <motion.circle
        cx={xs[xs.length - 1]}
        cy={yFor(ys[ys.length - 1])}
        r="16"
        fill="none"
        stroke="#67e8f9"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        initial={reduce ? false : { opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.0, duration: 0.6 }}
      />
    </svg>
  );
}

function DriverBand({
  delay,
  label,
  value,
  color,
  strokeColor,
  topY,
  bottomY,
  reduce,
}: {
  delay: number;
  label: string;
  value: string;
  color: string;
  strokeColor: string;
  topY: number;
  bottomY: number;
  reduce: boolean;
}) {
  const W = 1440;
  // Subtle wave path for each band's top edge — gives a "data signal" feel
  const wave = Array.from({ length: 32 }, (_, i) => {
    const x = (i / 31) * W;
    const offset = Math.sin(i * 0.7 + delay * 6) * 4 + Math.cos(i * 0.4) * 3;
    return `${x},${topY + offset}`;
  });
  const bandPath = `M0,${bottomY} L${wave.join(" L")} L${W},${bottomY} Z`;

  return (
    <motion.g
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
    >
      <path d={bandPath} fill={color} />
      <line
        x1="0"
        x2={W}
        y1={topY}
        y2={topY}
        stroke={strokeColor}
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      <text
        x={36}
        y={topY + 28}
        fill={strokeColor}
        fontSize="14"
        fontFamily="var(--font-sans), system-ui, sans-serif"
        fontWeight="500"
        opacity="0.55"
      >
        {label}
      </text>
      <text
        x={36}
        y={topY + 54}
        fill="#D2D2D7"
        fontSize="24"
        fontFamily="var(--font-sans), system-ui, sans-serif"
        fontWeight="600"
        opacity="0.8"
      >
        {value}
      </text>
    </motion.g>
  );
}
