"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
} from "./shared";
import { formatMoney } from "@/lib/fixed-income";

/**
 * Section 13 — Arbitrage alarm.
 * If a coupon bond and its matching STRIPS portfolio produce identical future
 * cash flows, they should have the same price; otherwise arbitrage may exist.
 * Inputs: price of coupon bond, price of STRIPS portfolio.
 */

export default function ArbitrageAlarm() {
  const reduce = useReducedMotion();
  const [bondPrice, setBondPrice] = useState(1000);
  const [stripsPrice, setStripsPrice] = useState(1000);

  const diff = bondPrice - stripsPrice;
  const status =
    Math.abs(diff) < 1
      ? "fair"
      : diff > 0
        ? "bondExpensive"
        : "bondCheap";

  return (
    <div className="space-y-6">
      <DefinitionCard term="Arbitrage principle (idealized)">
        If two strategies produce <span className="text-slate-50">identical
        future cash flows</span>, they must have the same price today. If they
        do not, an arbitrage opportunity may exist.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Price the bond vs its STRIPS
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Arbitrage alarm
        </h4>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,320px)_1fr]">
          {/* Inputs */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <PriceSlider
              label="Coupon bond price"
              value={bondPrice}
              onChange={setBondPrice}
            />
            <PriceSlider
              label="STRIPS portfolio price"
              value={stripsPrice}
              onChange={setStripsPrice}
            />
            <div className="flex flex-wrap gap-2">
              {[1000, 1020, 980].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setBondPrice(v); setStripsPrice(1000); }}
                  className="rounded-full border border-white/20 px-3 py-1 text-[12px] text-slate-200 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
                >
                  Bond {v}
                </button>
              ))}
            </div>
          </div>

          {/* Alarm + trade */}
          <AlarmPanel status={status} diff={Math.abs(diff)} bondPrice={bondPrice} stripsPrice={stripsPrice} reduce={reduce} />
        </div>

        {/* Disclaimer */}
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="ops-caption text-[11px] text-slate-400">Disclaimer</div>
          <p className="ops-body mt-1.5 text-[13px] leading-6 text-slate-300">
            This is idealized arbitrage logic. Real markets include transaction
            costs, funding costs, short-sale constraints, taxes, liquidity, and
            model risk.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function PriceSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className="font-sans text-[14px] text-slate-100">{formatMoney(value)}</span>
      </div>
      <input
        type="range"
        min={900}
        max={1100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-accent-cyan"
      />
    </div>
  );
}

function AlarmPanel({
  status,
  diff,
  bondPrice,
  stripsPrice,
  reduce,
}: {
  status: "fair" | "bondExpensive" | "bondCheap";
  diff: number;
  bondPrice: number;
  stripsPrice: number;
  reduce: boolean | null;
}) {
  const config = {
    fair: {
      border: "border-accent-green/40",
      bg: "bg-accent-green/[0.06]",
      text: "text-accent-green",
      label: "No arbitrage signal",
      msg: "Identical cash flows, identical prices. The market is internally consistent at these prices.",
    },
    bondExpensive: {
      border: "border-accent-red/50",
      bg: "bg-accent-red/[0.07]",
      text: "text-accent-red",
      label: "Arbitrage alarm — coupon bond looks expensive",
      msg: "Strategy: short the coupon bond, buy the STRIPS portfolio. Future cash flows offset; you pocket the price difference today.",
    },
    bondCheap: {
      border: "border-accent-amber/50",
      bg: "bg-accent-amber/[0.07]",
      text: "text-accent-amber",
      label: "Arbitrage alarm — coupon bond looks cheap",
      msg: "Strategy: buy the coupon bond, short the STRIPS portfolio. Future cash flows offset; you pocket the price difference today.",
    },
  }[status];

  return (
    <div className={cn("rounded-2xl border p-5", config.border, config.bg)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={status}
          initial={reduce ? false : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={cn("ops-caption text-[11px] uppercase tracking-[0.14em]", config.text)}>
            {config.label}
          </div>
          <div className="mt-2 flex items-center gap-4">
            <div>
              <div className="ops-caption text-[11px] text-slate-400">Coupon bond</div>
              <div className="font-sans text-[20px] text-slate-100">{formatMoney(bondPrice)}</div>
            </div>
            <div className="ops-caption text-[16px] text-slate-500">vs</div>
            <div>
              <div className="ops-caption text-[11px] text-slate-400">STRIPS</div>
              <div className="font-sans text-[20px] text-slate-100">{formatMoney(stripsPrice)}</div>
            </div>
            {status !== "fair" && (
              <div className={cn("ml-auto font-sans text-[16px]", config.text)}>
                Δ {formatMoney(diff)}
              </div>
            )}
          </div>
          <p className="ops-body mt-3 text-[14px] leading-6 text-slate-200">{config.msg}</p>
        </motion.div>
      </AnimatePresence>

      {/* Paired trade arrows */}
      <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 p-3">
        <div className="ops-caption text-[11px] text-slate-400">
          Future cash flows offset
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          {status === "bondExpensive" && (
            <TradeArrow from="Short coupon bond" to="Buy STRIPS" tone="red" reduce={reduce} />
          )}
          {status === "bondCheap" && (
            <TradeArrow from="Buy coupon bond" to="Short STRIPS" tone="amber" reduce={reduce} />
          )}
          {status === "fair" && (
            <div className="w-full py-2 text-center font-sans text-[13px] text-slate-400">
              No trade — prices are aligned
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TradeArrow({ from, to, tone, reduce }: { from: string; to: string; tone: "red" | "amber"; reduce: boolean | null }) {
  const toneText = tone === "red" ? "text-accent-red" : "text-accent-amber";
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span className={cn("rounded-md border border-current/40 px-3 py-1.5 font-sans text-[12px]", toneText)}>
        {from}
      </span>
      <motion.span
        className={cn("text-[18px]", toneText)}
        animate={reduce ? undefined : { x: [0, 6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        ⇄
      </motion.span>
      <span className={cn("rounded-md border border-current/40 px-3 py-1.5 font-sans text-[12px]", toneText)}>
        {to}
      </span>
    </div>
  );
}
