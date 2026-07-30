"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  InlineMath,
} from "./shared";
import { formatMoney } from "@/lib/fixed-income";

/**
 * Lesson 3.3 — Law of One Price engine.
 * Two cash-flow streams A and B (editable). If the streams are identical but
 * the prices differ, the engine flags an arbitrage direction and shows the gap.
 * Includes a friction disclaimer: this is the frictionless, textbook version.
 */

export default function LawOfOnePriceEngine() {
  const reduce = useReducedMotion();
  const [a1, setA1] = useState(50);
  const [a2, setA2] = useState(50);
  const [a3, setA3] = useState(1050);
  const [b1, setB1] = useState(50);
  const [b2, setB2] = useState(50);
  const [b3, setB3] = useState(1050);
  const [priceA, setPriceA] = useState(1020);
  const [priceB, setPriceB] = useState(1000);

  const streamA = [a1, a2, a3];
  const streamB = [b1, b2, b3];
  const identical = streamA.every((v, i) => v === streamB[i]);

  const verdict = (() => {
    if (!identical) {
      return {
        kind: "mismatch" as const,
        title: "Not identical",
        msg: "The cash-flow streams differ in amount or timing. The Law of One Price only binds on identical future payments.",
      };
    }
    const gap = priceA - priceB;
    if (Math.abs(gap) < 0.5) {
      return {
        kind: "fair" as const,
        title: "No arbitrage signal",
        msg: "Identical streams, identical price. The market is internally consistent at this quote.",
      };
    }
    if (gap > 0) {
      return {
        kind: "arb" as const,
        title: "A is expensive · sell A, buy B",
        msg: `Same future dollars, but A costs more. Sell the expensive one (${formatMoney(priceA)}), buy the cheap one (${formatMoney(priceB)}), lock ${formatMoney(gap)} today with zero net future obligation.`,
      };
    }
    return {
      kind: "arb" as const,
      title: "A is cheap · buy A, sell B",
      msg: `Same future dollars, but A costs less. Buy the cheap one (${formatMoney(priceA)}), sell the expensive one (${formatMoney(priceB)}), lock ${formatMoney(-gap)} today with zero net future obligation.`,
    };
  })();

  const gap = Math.abs(priceA - priceB);
  const maxBar = Math.max(40, gap * 1.4);
  const barA = (priceA / maxBar) * 100;
  const barB = (priceB / maxBar) * 100;

  const verdictTone: Record<string, string> = {
    mismatch: "border-accent-red/30 bg-accent-red/[0.06]",
    fair: "border-accent-green/30 bg-accent-green/[0.06]",
    arb: "border-accent-purple/30 bg-accent-purple/[0.06]",
  };
  const verdictAccent: Record<string, string> = {
    mismatch: "text-accent-red",
    fair: "text-accent-green",
    arb: "text-accent-purple",
  };

  return (
    <div className="space-y-6">
      <DefinitionCard term="Law of One Price">
        If two investments produce the{" "}
        <span className="text-slate-50">same future cash flows</span>, they must
        trade for the <span className="text-slate-50">same price today</span>.
        Any difference is an arbitrage signal — before frictions.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Law of One Price engine
            </span>
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Same future dollars, same price?
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Edit the cash flows and prices for stream A and stream B. The engine
          checks identity, then flags an arbitrage direction if the prices
          disagree.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Stream A inputs */}
          <StreamEditor
            title="Stream A"
            tone="cyan"
            values={streamA}
            setters={[setA1, setA2, setA3]}
            price={priceA}
            setPrice={setPriceA}
          />
          <StreamEditor
            title="Stream B"
            tone="purple"
            values={streamB}
            setters={[setB1, setB2, setB3]}
            price={priceB}
            setPrice={setPriceB}
          />
        </div>

        {/* Visual gap */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-ink-950/50 p-5">
          <div className="ops-caption text-[11px] text-slate-400">
            Price comparison
          </div>
          <div className="mt-3 space-y-3">
            <PriceBar
              label="A"
              tone="cyan"
              pct={barA}
              value={priceA}
              reduce={reduce}
            />
            <PriceBar
              label="B"
              tone="purple"
              pct={barB}
              value={priceB}
              reduce={reduce}
            />
          </div>
          {identical && gap >= 0.5 && (
            <div className="mt-3 flex items-center gap-2 font-sans text-[14px] text-accent-amber">
              <span>Arbitrage gap</span>
              <span className="text-accent-amber">{formatMoney(gap)}</span>
              <InlineMath>{"\\Rightarrow"}</InlineMath>
              <span className="text-slate-300">risk-free profit today</span>
            </div>
          )}
        </div>

        {/* Verdict */}
        <motion.div
          key={verdict.kind + verdict.title}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "mt-5 rounded-xl border p-5",
            verdictTone[verdict.kind],
          )}
        >
          <div
            className={cn(
              "ops-caption text-[11px]",
              verdictAccent[verdict.kind],
            )}
          >
            Verdict
          </div>
          <div className="ops-body-strong mt-1 text-[17px] text-slate-50">
            {verdict.title}
          </div>
          <p className="ops-body mt-1.5 text-[15px] leading-7 text-slate-200">
            {verdict.msg}
          </p>
        </motion.div>

        {/* Friction disclaimer */}
        <p className="ops-muted mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-[13px] leading-6 text-slate-400">
          <span className="text-slate-300">Friction disclaimer:</span> this is
          the frictionless, textbook version. Real execution pays bid-ask
          spreads, transaction costs, and may be blocked by short-sale
          constraints — see the friction switches that follow.
        </p>
      </InteractiveFrame>
    </div>
  );
}

function StreamEditor({
  title,
  tone,
  values,
  setters,
  price,
  setPrice,
}: {
  title: string;
  tone: "cyan" | "purple";
  values: number[];
  setters: ((v: number) => void)[];
  price: number;
  setPrice: (v: number) => void;
}) {
  const accent = tone === "cyan" ? "text-accent-cyan" : "text-accent-purple";
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className={cn("ops-caption text-[11px]", accent)}>{title}</div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {values.map((v, i) => (
          <label key={i} className="block">
            <span className="ops-caption text-[10px] text-slate-500">
              Year {i + 1}
            </span>
            <input
              type="number"
              value={v}
              min={0}
              step={10}
              onChange={(e) => setters[i](Number(e.target.value))}
              aria-label={`${title} year ${i + 1} cash flow`}
              className="mt-1 w-full rounded-md border border-white/10 bg-ink-950/60 px-2 py-1.5 font-sans text-[14px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
            />
          </label>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="ops-caption text-[10px] text-slate-500">
          Price today
        </span>
        <input
          type="number"
          value={price}
          min={0}
          step={5}
          onChange={(e) => setPrice(Number(e.target.value))}
          aria-label={`${title} price today`}
          className="mt-1 w-full rounded-md border border-white/10 bg-ink-950/60 px-2 py-1.5 font-sans text-[14px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
        />
      </label>
    </div>
  );
}

function PriceBar({
  label,
  tone,
  pct,
  value,
  reduce,
}: {
  label: string;
  tone: "cyan" | "purple";
  pct: number;
  value: number;
  reduce: boolean | null;
}) {
  const color = tone === "cyan" ? "bg-accent-cyan/70" : "bg-accent-purple/70";
  return (
    <div className="flex items-center gap-3">
      <span className="w-5 font-sans text-[13px] text-slate-300">{label}</span>
      <div className="h-7 flex-1 overflow-hidden rounded-md bg-white/5">
        <motion.div
          className={cn("h-full rounded-md", color)}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      <span className="w-20 text-right font-sans text-[14px] text-slate-100">
        {formatMoney(value)}
      </span>
    </div>
  );
}
