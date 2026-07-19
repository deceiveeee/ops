"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import { InlineMath } from "./shared";
import { solveZeroCouponRate, formatPercent } from "@/lib/fixed-income";

/**
 * Section — The price comes first.
 * Four zero-coupon bonds, each promising $1 at a different maturity.
 * Each is "auctioned" to a market price. Click a bond to back the rate
 * out of its price. The market sets the price; the rate is derived.
 */
type Bond = {
  maturity: number;
  price: number;
  unit: "1yr" | "2yr" | "5yr" | "10yr";
  label: string;
};

const BONDS: Bond[] = [
  { maturity: 1, price: 0.967, unit: "1yr", label: "1-year claim" },
  { maturity: 2, price: 0.927, unit: "2yr", label: "2-year claim" },
  { maturity: 5, price: 0.797, unit: "5yr", label: "5-year claim" },
  { maturity: 10, price: 0.605, unit: "10yr", label: "10-year claim" },
];

export default function AuctionFutureDollar() {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const reveal = (maturity: number) =>
    setRevealed((prev) => ({ ...prev, [maturity]: true }));

  return (
    <div className="space-y-6">
      <DefinitionCard term="The price comes first">
        Markets do not announce rates. Markets announce{" "}
        <span className="text-accent-cyan">prices</span>. The rate is{" "}
        <span className="text-accent-amber">backed out</span> from the price an
        investor is willing to pay for a future dollar.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Auction · four claims on $1
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Buy a dollar in the future. Read the rate off the price.
        </h4>

        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Each bond below pays exactly <span className="font-mono text-accent-green">$1</span>{" "}
          at maturity and nothing before. Click a bond to discover what market
          price that implies for today&apos;s spot rate.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BONDS.map((b) => {
            const isOpen = !!revealed[b.maturity];
            const rate = solveZeroCouponRate(1, b.price, b.maturity);
            return (
              <button
                key={b.maturity}
                type="button"
                onClick={() => reveal(b.maturity)}
                aria-label={`${b.label}, price ${b.price.toFixed(3)} dollars, reveal implied rate`}
                className={cn(
                  "group flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isOpen
                    ? "border-accent-cyan/40 bg-accent-cyan/[0.06]"
                    : "border-white/10 bg-ink-950/40 hover:border-white/25",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="ops-caption text-[11px] text-accent-amber">
                    {b.label}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    T = {b.maturity}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-ink-950/60 px-3 py-3 text-center">
                  <div className="ops-caption text-[11px] text-slate-400">
                    Market price
                  </div>
                  <div className="mt-1 font-mono text-[22px] text-white">
                    ${b.price.toFixed(3)}
                  </div>
                  <div className="ops-caption mt-1 text-[11px] text-slate-500">
                    per $1 face
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="rate"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.08] px-3 py-3 text-center"
                    >
                      <div className="ops-caption text-[11px] text-accent-cyan">
                        Implied rate
                      </div>
                      <div className="mt-1 font-mono text-[22px] text-accent-cyan">
                        {formatPercent(rate, 2)}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hint"
                      initial={false}
                      className="rounded-xl border border-dashed border-white/15 px-3 py-3 text-center"
                    >
                      <div className="font-mono text-[12px] text-slate-400">
                        Tap to solve rate
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            The price comes first. The rate is{" "}
            <span className="text-accent-amber">backed out</span> from the price.
            Notice the longer you wait for your dollar, the lower the price — and
            the higher the implied rate.
          </p>
          <div className="mt-3 flex items-center gap-2 font-mono text-[15px] text-slate-100">
            <InlineMath>{"r_{0,T} = \\left(\\tfrac{1}{P_0}\\right)^{1/T} - 1"}</InlineMath>
          </div>
        </div>
      </InteractiveFrame>
    </div>
  );
}
