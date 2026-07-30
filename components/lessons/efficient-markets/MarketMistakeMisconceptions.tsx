"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Myth = {
  id: string;
  myth: string;
  reality: string;
  explanation: string;
};

const MYTHS: Myth[] = [
  {
    id: "m1",
    myth: "Markets make mistakes, so active investing is easy.",
    reality: "Mispricing may be difficult to identify, finance, and survive.",
    explanation:
      "Recognizing a mistake is not the same as being able to profit from it. Timing risk, financing constraints, short-sale mechanics, and career risk all stand between the analyst and the realized profit.",
  },
  {
    id: "m2",
    myth: "A price decline proves investors are irrational.",
    reality: "The decline may reflect new information or a change in risk.",
    explanation:
      "Prices move when expectations change. A decline can be the rational response to lower expected cash flows, higher risk, dilution, or a damaged competitive position. The price action alone does not reveal whether it was rational.",
  },
  {
    id: "m3",
    myth: "Professional investors can always correct prices.",
    reality: "Professionals face funding, client, regulatory, benchmark, and career constraints.",
    explanation:
      "Even informed capital must obey mandates, redemption terms, risk limits, and the patience of capital providers. A professional can be directionally correct and still be unable or unwilling to hold the position long enough.",
  },
  {
    id: "m4",
    myth: "If my valuation is correct, I will make money.",
    reality: "Timing, liquidity, financing, and company developments still matter.",
    explanation:
      "A correct valuation is one input. The path between today and realization can break even a sound thesis — through leverage, withdrawal, forced liquidation, or fundamental change in the business before the gap closes.",
  },
  {
    id: "m5",
    myth: "Behavioral finance disproves traditional finance.",
    reality: "Behavioral finance explains when traditional assumptions may weaken — it does not eliminate them.",
    explanation:
      "Valuation, diversification, risk adjustment, and market competition remain useful. Behavioral finance adds nuance about how those tools interact with human decision-making and with limits to arbitrage.",
  },
];

export default function MarketMistakeMisconceptions() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>("m1");

  return (
    <div className="space-y-3">
      {MYTHS.map((m, i) => {
        const isOpen = open === m.id;
        return (
          <div key={m.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : m.id)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
            >
              <span className={cn(
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[10px]",
                isOpen ? "border-accent-cyan text-accent-cyan" : "border-accent-red/40 text-accent-red",
              )}>
                {i + 1}
              </span>
              <span className="flex-1 text-[15px] font-medium leading-snug text-white">
                <span className="text-accent-red/80">Myth: </span>{m.myth}
              </span>
              <span className={cn("flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-sm text-accent-cyan transition-transform",
                isOpen && "rotate-45")} aria-hidden>+</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="ops-body px-5 pb-5">
                    <div className="rounded-lg border border-accent-green/20 bg-accent-green/[0.05] p-3">
                      <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-green">Reality</span>
                      <p className="mt-1 text-[15px] leading-[1.65] text-slate-100">{m.reality}</p>
                    </div>
                    <p className="mt-3 text-[14px] leading-[1.65] text-slate-300">{m.explanation}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] px-5 py-4">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Markets make mistakes. They also correct mistakes ruthlessly when capital can flow, when
          financing is available, and when participants are free to act. Both statements are true at
          the same time.
        </p>
      </div>
    </div>
  );
}
