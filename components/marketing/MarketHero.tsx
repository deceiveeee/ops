"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import HeroObject from "@/components/marketing/HeroObject";
import { marketFragments } from "@/data/marketing";

// A quieter, more atmospheric subset of fragments — fewer, better placed,
// kept out of the hero copy column so the headline breathes.
const heroFragments = marketFragments.filter((_, i) => i % 2 === 0).slice(0, 8);

export default function MarketHero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Parallax fade-out of the hero as the user scrolls into the story.
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const fogOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.3]);

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Background layers */}
      <motion.div style={{ opacity: fogOpacity }} className="absolute inset-0">
        <div className="absolute inset-0 terminal-grid opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(34,211,238,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_80%,rgba(167,139,250,0.08),transparent_50%)]" />
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent" />

      {/* Atmospheric fragments — kept to the periphery, away from the copy column */}
      <div className="pointer-events-none absolute inset-0">
        {heroFragments.map((f, i) => {
          const tone =
            f.tone === "up" ? "text-accent-green" : f.tone === "down" ? "text-accent-red" : "text-slate-400";
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={
                reduce
                  ? { opacity: 0.45 }
                  : { opacity: [0, 0.55, 0.4, 0.55], y: [10, 0, -10, 0], x: [0, 4, 0] }
              }
              transition={{
                duration: 11,
                delay: f.delay,
                repeat: reduce ? 0 : Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
              className={`absolute hidden font-mono text-[10px] sm:block ${tone}`}
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            >
              <span className="rounded border border-white/10 bg-white/[0.02] px-2 py-1 backdrop-blur-sm">
                {f.text}
              </span>
            </motion.span>
          );
        })}
      </div>

      {/* Left terminal rail */}
      <div className="pointer-events-none absolute left-0 top-16 hidden h-[calc(100svh-4rem)] w-10 flex-col items-center gap-4 border-r border-white/5 pt-8 lg:flex">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-600 [writing-mode:vertical-rl]">
          MARKET · LIVE FEED · MOCK
        </div>
        <div className="mt-auto mb-8 flex flex-col items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-accent-green" />
          <span className="h-12 w-px bg-gradient-to-b from-accent-cyan/60 to-transparent" />
        </div>
      </div>

      {/* Hero copy + sculpture */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl items-center px-5 sm:px-8 lg:pl-16"
      >
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl lg:col-span-7"
          >
            <div className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-slate-400">
              <span className="h-1.5 w-1.5 animate-pulseGlow rounded-full bg-accent-cyan" />
              Open Portfolio Studio
              <span className="hidden h-px w-10 bg-white/15 sm:block" />
              <span className="hidden sm:inline">Decode · Investigate · Build</span>
            </div>
            <h1 className="text-balance text-[2.6rem] font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl md:text-7xl">
              Decode the market
              <br />
              <span className="bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-cyan bg-clip-text text-transparent">
                beneath the chart.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-slate-300 sm:text-lg">
              Learn finance by investigating real companies, real filings, portfolios, and market signals. Not by
              memorizing definitions.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="/studio" size="lg">
                Enter the studio
              </Button>
              <Button href="/courses" variant="outline" size="lg">
                Explore courses
              </Button>
              <Button href="#story" variant="ghost" size="lg">
                See how finance works
                <span aria-hidden className="ml-0.5">↓</span>
              </Button>
            </div>
          </motion.div>

          {/* Signature hero object — orbital ring sculpture */}
          <div className="hidden justify-center lg:col-span-5 lg:flex">
            <HeroObject scrollYProgress={scrollYProgress} className="w-[26rem] xl:w-[32rem]" />
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-5 sm:left-8 lg:left-16"
        >
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
            <span className="h-8 w-px animate-pulseGlow bg-gradient-to-b from-accent-cyan to-transparent" />
            Scroll to decode
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom ticker tape — terminal atmosphere */}
      <div className="absolute inset-x-0 bottom-0 z-10 hidden border-t border-white/5 bg-ink-950/60 backdrop-blur-sm md:block">
        <div className="flex items-center">
          <div className="border-r border-white/10 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-accent-cyan">
            TAPE
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div className="flex animate-[scan_28s_linear_infinite] gap-8 whitespace-nowrap py-1.5 font-mono text-[10px] text-slate-400">
              {tickerTape.map((t, i) => (
                <span key={i} className="inline-flex items-center gap-2">
                  <span className="text-slate-500">{t.sym}</span>
                  <span className={t.up ? "text-accent-green" : "text-accent-red"}>
                    {t.up ? "▲" : "▼"} {t.chg}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const tickerTape = [
  { sym: "AAPL", chg: "+1.24%", up: true },
  { sym: "NVDA", chg: "-3.10%", up: false },
  { sym: "MSFT", chg: "+0.62%", up: true },
  { sym: "TSLA", chg: "-2.40%", up: false },
  { sym: "AMZN", chg: "+1.81%", up: true },
  { sym: "META", chg: "+0.34%", up: true },
  { sym: "GOOGL", chg: "-0.72%", up: false },
  { sym: "10Y", chg: "4.31%", up: true },
  { sym: "2Y", chg: "4.78%", up: false },
  { sym: "DXY", chg: "104.2", up: true },
  { sym: "VIX", chg: "17.8", up: false },
  { sym: "CPI", chg: "3.2%", up: false },
  { sym: "WTI", chg: "+0.9%", up: true },
  { sym: "GOLD", chg: "+0.4%", up: true },
  { sym: "BTC", chg: "-1.2%", up: false },
];
