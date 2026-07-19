"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

const VALUE = 60;
const ROUNDS = [
  { round: 1, price: 50.0, buyers: 2 },
  { round: 2, price: 53.0, buyers: 5 },
  { round: 3, price: 57.0, buyers: 12 },
  { round: 4, price: 59.5, buyers: 25 },
];

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function TradeAwayOpportunity() {
  const reduce = useReducedMotion();
  const [round, setRound] = useState(0);
  const current = ROUNDS[round];
  const potentialGain = ((VALUE - current.price) / current.price) * 100;
  const maxScale = 65;

  const advance = () => {
    if (round < ROUNDS.length - 1) setRound((r) => r + 1);
  };
  const reset = () => setRound(0);

  const pctOfScale = (v: number) => (v / maxScale) * 100;

  return (
    <div className="space-y-6">
      {/* Setup */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          The opportunity
        </div>
        <p className="ops-body mt-2 text-[16px] leading-[1.6] text-slate-100">
          You estimate the stock is worth <span className="font-mono text-accent-cyan">${VALUE}</span>.
          The current market price is{" "}
          <span className="font-mono text-accent-amber">${fmt(ROUNDS[0].price)}</span>. Press{" "}
          &ldquo;Advance&rdquo; to see what happens as competing investors notice the same opportunity.
        </p>
      </div>

      {/* Price scale visualization */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Price and remaining opportunity · Round {current.round} of {ROUNDS.length}
        </div>

        {/* Visual scale */}
        <div className="mt-5 space-y-3">
          {/* Value line */}
          <div className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0 font-mono text-[11px] text-accent-cyan">Est. value</div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
              <div className="absolute inset-y-0 left-0 bg-accent-cyan/20" style={{ width: `${pctOfScale(VALUE)}%` }} />
              <div className="absolute inset-y-0 flex items-center px-3" style={{ left: `${pctOfScale(VALUE)}%`, transform: "translateX(-100%)" }}>
                <span className="font-mono text-[12px] text-accent-cyan">${VALUE}</span>
              </div>
              <div className="absolute inset-y-0 border-l-2 border-accent-cyan/60" style={{ left: `${pctOfScale(VALUE)}%` }} />
            </div>
          </div>

          {/* Current price */}
          <div className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0 font-mono text-[11px] text-accent-amber">Price</div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
              <motion.div
                className="absolute inset-y-0 left-0 bg-accent-amber/25"
                animate={{ width: `${pctOfScale(current.price)}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-y-0 flex items-center px-3"
                animate={{ left: `${pctOfScale(current.price)}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
              >
                <span className="whitespace-nowrap font-mono text-[12px] text-accent-amber">${fmt(current.price)}</span>
              </motion.div>
            </div>
          </div>

          {/* Potential gain */}
          <div className="flex items-center gap-3">
            <div className="w-24 flex-shrink-0 font-mono text-[11px] text-accent-green">Gain left</div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
              <motion.div
                className={cn("absolute inset-y-0 rounded-lg", potentialGain > 5 ? "bg-accent-green/25" : "bg-accent-red/20")}
                animate={{ width: `${pctOfScale(VALUE) - pctOfScale(current.price)}%`, left: `${pctOfScale(current.price)}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Buyers entering */}
        <div className="mt-4 flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Competing investors:</span>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: current.buyers }, (_, i) => (
              <motion.span
                key={`${current.round}-${i}`}
                initial={reduce ? false : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex h-6 w-6 items-center justify-center rounded-full border border-accent-amber/30 bg-accent-amber/10 text-[10px] text-accent-amber"
                aria-hidden
              >
                ★
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Calculation */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
          <BlockMath>
            {String.raw`\text{Potential gain} = \frac{${VALUE} - ${fmt(current.price)}}{${fmt(current.price)}} = ${fmt(potentialGain)}\%`}
          </BlockMath>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {round < ROUNDS.length - 1 ? (
          <button type="button" onClick={advance}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
            Advance to round {current.round + 1} →
          </button>
        ) : (
          <button type="button" onClick={reset}
            className="rounded-full border border-white/20 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
            ↻ Reset
          </button>
        )}
      </div>

      {/* Conclusion */}
      <AnimatePresence>
        {round === ROUNDS.length - 1 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6"
          >
            <p className="ops-body text-[17px] leading-[1.5] text-white">
              The more visible the opportunity becomes, the more investors compete for it, and the
              less profitable it becomes.
            </p>
            <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-200">
              No authority declared the price efficient. Competition among investors moved the price.
              The opportunity shrank not because the value changed, but because the gap between price
              and value closed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
