"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, DefinitionCard, Feedback } from "./shared";

/**
 * Condensed arbitrage preview for the end of Lesson 3.2.
 * Two price inputs: coupon bond vs. identical STRIPS portfolio.
 * If they mismatch, show the trade direction (buy cheaper, short expensive).
 * Full law-of-one-price treatment is deferred to Lesson 3.3.
 */
export default function ArbitragePreview() {
  const reduce = useReducedMotion();
  const [bondPrice, setBondPrice] = useState(1000);
  const [stripsPrice, setStripsPrice] = useState(1000);

  const diff = bondPrice - stripsPrice;
  const mismatch = Math.abs(diff) > 0.5;

  return (
    <div className="space-y-6">
      <DefinitionCard term="Law of one price (preview)">
        Identical future cash flows should have{" "}
        <span className="text-accent-cyan">identical prices</span>. A coupon bond
        and its matching STRIPS portfolio deliver the exact same dollars on the
        exact same dates — so they should cost the same.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Arbitrage preview
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          If two identical cash-flow packages disagree on price
        </h4>

        {/* Price inputs */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PriceInput
            label="Coupon bond price"
            value={bondPrice}
            onChange={setBondPrice}
            tone="cyan"
          />
          <PriceInput
            label="STRIPS portfolio price"
            value={stripsPrice}
            onChange={setStripsPrice}
            tone="purple"
          />
        </div>

        {/* Signal */}
        <motion.div
          key={`${bondPrice}-${stripsPrice}`}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-5"
        >
          {!mismatch ? (
            <Feedback status="correct">
              The two packages are priced identically. No trade — the market is
              internally consistent here.
            </Feedback>
          ) : (
            <Feedback status="info">
              <span className="font-mono text-accent-amber">
                Price gap: ${Math.abs(diff).toFixed(2)}
              </span>
              <br />
              <span className="font-semibold">
                Trade direction:
              </span>{" "}
              {diff > 0 ? (
                <>
                  <span className="text-accent-red">Short</span> the coupon bond
                  (expensive), <span className="text-accent-green">buy</span> the
                  STRIPS portfolio (cheap).
                </>
              ) : (
                <>
                  <span className="text-accent-green">Buy</span> the coupon bond
                  (cheap), <span className="text-accent-red">short</span> the
                  STRIPS portfolio (expensive).
                </>
              )}{" "}
              The identical future cash flows offset each other; you keep the
              price difference today.
            </Feedback>
          )}
        </motion.div>

        {/* Disclaimer */}
        <div className="mt-5 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            <span className="text-accent-amber">Idealized.</span> Real markets
            have frictions — bid-ask spreads, transaction costs, financing, and
            shorting constraints — that can keep small gaps from being truly
            free money. Lesson 3.3 covers the law of one price fully.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function PriceInput({
  label,
  value,
  onChange,
  tone,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  tone: "cyan" | "purple";
}) {
  const border = tone === "cyan" ? "border-accent-cyan/25" : "border-accent-purple/25";
  const bg = tone === "cyan" ? "bg-accent-cyan/[0.05]" : "bg-accent-purple/[0.05]";
  const text = tone === "cyan" ? "text-accent-cyan" : "text-accent-purple";
  return (
    <div className={cn("rounded-2xl border p-5", border, bg)}>
      <label className="ops-caption text-[11px] text-slate-400" htmlFor={`${label}-input`}>
        {label}
      </label>
      <div className="mt-2 flex items-center gap-2">
        <span className={cn("font-mono text-[18px]", text)}>$</span>
        <input
          id={`${label}-input`}
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={label}
          className={cn(
            "w-full rounded-lg border border-white/10 bg-ink-950/60 px-3 py-2 font-mono text-[18px] text-slate-100",
            "focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
          )}
        />
      </div>
    </div>
  );
}
