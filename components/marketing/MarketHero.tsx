"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import { stockChart } from "@/data/marketing";

/**
 * MarketHero — calm, editorial, one dominant idea.
 *
 * Per homepage rebuild spec:
 *   - Remove MARKET · LIVE FEED · MOCK, Decode · Investigate · Build,
 *     SIGNAL, STRUCTURE, Scroll to decode, TAPE, See how finance works ↓,
 *     ticker tape, hero orbital sculpture, "Open Portfolio Studio" eyebrow.
 *   - Keep: one headline, one short supporting sentence, two CTAs,
 *     one restrained background visual (a single animated market line).
 */
export default function MarketHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Single quiet parallax — no aggressive fade.
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.2]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden"
    >
      {/* ONE background visual — a single restrained market line */}
      <motion.div
        style={{ y: bgY, opacity: bgOpacity }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <BackgroundChart reduce={!!reduce} />
      </motion.div>

      {/* Subtle bottom fade so the chart never collides with content below */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-950 to-transparent" />

      {/* Hero copy — generous negative space */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl flex-col justify-center px-6 sm:px-8">
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="hp-hero max-w-[900px] text-white"
        >
          Decode the market
          <br />
          <span className="text-accent-cyan">beneath the chart.</span>
        </motion.h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
          className="hp-lead mt-7"
        >
          Learn finance through companies, filings, valuation, and portfolios.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.22, ease: "easeOut" }}
          className="mt-10 flex flex-wrap items-center gap-3"
        >
          <Button href="/courses" size="lg">
            Explore courses
          </Button>
          <Button href="/studio" variant="outline" size="lg">
            Enter the studio
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/** A single restrained market line. No grid, no glow, no axes, no labels. */
function BackgroundChart({ reduce }: { reduce: boolean }) {
  const W = 1440;
  const H = 800;
  const xs = stockChart.map((_, i) => (i / (stockChart.length - 1)) * W);
  const ys = stockChart.map((p) => p.p);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;
  const yFor = (v: number) => H * 0.55 + ((v - min) / range - 0.5) * H * 0.5;
  const linePath = "M" + xs.map((x, i) => `${x},${yFor(ys[i])}`).join(" L");
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`;

  return (
    <div className="absolute inset-0">
      {/* Very faint radial atmosphere — single subtle accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(34,211,238,0.06),transparent_60%)]" />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="heroLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#heroLineFill)" />
        <motion.path
          d={linePath}
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.55"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
