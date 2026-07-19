"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

type Direction = "up" | "down";

const LOOPS: Record<Direction, {
  math: string;
  mechanisms: string[];
  note: string;
}> = {
  up: {
    math: String.raw`\text{Rising prices} \rightarrow \text{Higher reported returns} \rightarrow \text{Investor inflows} \rightarrow \text{More purchasing} \rightarrow \text{Further price increases}`,
    mechanisms: [
      "Increased borrowing capacity — collateral is worth more, so lenders extend more credit.",
      "Momentum strategies — systematic buyers enter when prices are already rising.",
      "Media attention — rising prices attract coverage, which attracts new buyers.",
      "Fear of missing out — investors who avoided the trade feel pressured to join.",
      "Benchmark pressure — managers who avoid a rising sector risk underperforming.",
    ],
    note: "The loop is not infinite. At some point prices outrun fundamentals, new capital slows, or an external shock breaks the cycle. But the loop can run far longer than a disciplined investor's patience or financing.",
  },
  down: {
    math: String.raw`\text{Falling prices} \rightarrow \text{Losses} \rightarrow \text{Margin calls and withdrawals} \rightarrow \text{Forced selling} \rightarrow \text{Further price declines}`,
    mechanisms: [
      "Margin calls — leveraged investors must post cash or sell positions.",
      "Redemptions — fund investors withdraw after losses, forcing managers to sell.",
      "Risk-limit triggers — quantitative funds de-risk when volatility rises.",
      "Collateral markdowns — lenders reduce credit lines as asset values fall.",
      "Liquidity withdrawal — dealers stop making markets precisely when sellers need them.",
    ],
    note: "Some selling is emotionally motivated. Some is entirely rational for an investor facing urgent cash needs. The destabilizing aggregate outcome can emerge from individually reasonable decisions.",
  },
};

export default function FeedbackLoops() {
  const reduce = useReducedMotion();
  const [direction, setDirection] = useState<Direction>("up");
  const loop = LOOPS[direction];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Markets can form self-reinforcing loops. The two directions look symmetric in arithmetic
          but feel asymmetric in experience — and they create very different consequences for
          leveraged investors.
        </p>
      </div>

      {/* Direction toggle */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <DirectionButton active={direction === "up"} onClick={() => setDirection("up")}
            label="Upward loop" tone="green" />
          <DirectionButton active={direction === "down"} onClick={() => setDirection("down")}
            label="Downward loop" tone="red" />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={direction}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4">
          <div className={cn("rounded-2xl border bg-white/[0.03] p-5 sm:p-6",
            direction === "up" ? "border-accent-green/25" : "border-accent-red/25")}>
            <div className={cn("font-mono text-[11px] uppercase tracking-[0.16em]",
              direction === "up" ? "text-accent-green" : "text-accent-red")}>
              {direction === "up" ? "Reinforcing loop · upward" : "Reinforcing loop · downward"}
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4 overflow-x-auto">
              <BlockMath>{loop.math}</BlockMath>
            </div>
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Supporting mechanisms
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {loop.mechanisms.map((m) => (
                <li key={m} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-100">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full",
                    direction === "up" ? "bg-accent-green" : "bg-accent-red")} aria-hidden />{m}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
            <p className="ops-body text-[15px] leading-[1.65] text-slate-100">{loop.note}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DirectionButton({ active, onClick, label, tone }: {
  active: boolean; onClick: () => void; label: string; tone: "green" | "red";
}) {
  const text = tone === "green" ? "text-accent-green" : "text-accent-red";
  const border = tone === "green" ? "border-accent-green/40" : "border-accent-red/40";
  const bg = tone === "green" ? "bg-accent-green/[0.08]" : "bg-accent-red/[0.08]";
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("rounded-full border px-5 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        active ? cn(border, bg, text) : "border-white/15 text-slate-200 hover:border-white/30")}>
      {label}
    </button>
  );
}
