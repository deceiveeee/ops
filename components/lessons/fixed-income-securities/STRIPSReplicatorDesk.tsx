"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaExplainer,
} from "./shared";
import { formatMoney } from "@/lib/fixed-income";
import { MathText } from "@/components/ui/MathText";

/**
 * Lesson 3.3 — STRIPS replicator desk.
 * A coupon bond can be replicated by a package of zero-coupon STRIPS, one per
 * cash flow. Given STRIPS prices P_{0,1}, P_{0,2}, P_{0,3}, the replicating
 * cost is C·P_{0,1} + C·P_{0,2} + (C+F)·P_{0,3}. Compare to the bond's market
 * price and read off a trade direction.
 */

type Scenario = "same" | "expensive" | "cheap";

export default function STRIPSReplicatorDesk() {
  const reduce = useReducedMotion();
  const [face, setFace] = useState(1000);
  const [couponPct, setCouponPct] = useState(5);
  const [maturity, setMaturity] = useState(3);
  const [p01, setP01] = useState(0.95);
  const [p02, setP02] = useState(0.9);
  const [p03, setP03] = useState(0.85);
  const [bondPrice, setBondPrice] = useState(1000);
  const [replicated, setReplicated] = useState(false);
  const [showTrade, setShowTrade] = useState(false);

  const coupon = (face * couponPct) / 100;
  const periods = Math.max(1, Math.round(maturity));

  // build per-period STRIPS prices (limited to T=3 by inputs)
  const stripPrices = [p01, p02, p03].slice(0, periods);
  const cfs: number[] = [];
  for (let t = 1; t <= periods; t++) {
    cfs.push(t === periods ? coupon + face : coupon);
  }
  const replicatingCost = cfs.reduce(
    (sum, cf, i) => sum + cf * (stripPrices[i] ?? 0),
    0,
  );
  const mismatch = bondPrice - replicatingCost;

  const tradeDir =
    Math.abs(mismatch) < 0.5 ? "fair" : mismatch > 0 ? "sell-bond" : "buy-bond";

  const applyScenario = (s: Scenario) => {
    if (s === "same") {
      setP01(0.95);
      setP02(0.9);
      setP03(0.85);
      const c = (1000 * 5) / 100;
      const cost = c * 0.95 + c * 0.9 + (c + 1000) * 0.85;
      setBondPrice(Math.round(cost * 100) / 100);
    } else if (s === "expensive") {
      setP01(0.95);
      setP02(0.9);
      setP03(0.85);
      const c = (1000 * 5) / 100;
      const cost = c * 0.95 + c * 0.9 + (c + 1000) * 0.85;
      setBondPrice(Math.round((cost + 25) * 100) / 100);
    } else {
      setP01(0.95);
      setP02(0.9);
      setP03(0.85);
      const c = (1000 * 5) / 100;
      const cost = c * 0.95 + c * 0.9 + (c + 1000) * 0.85;
      setBondPrice(Math.round((cost - 25) * 100) / 100);
    }
    setReplicated(false);
    setShowTrade(false);
  };

  return (
    <div className="space-y-6">
      <DefinitionCard term="STRIPS replication">
        Strip a coupon bond into its individual cash flows. Each cash flow is a
        zero-coupon &quot;STRIP.&quot; Reassembling those STRIPS must reproduce
        the bond&apos;s price — or the desk has a trade.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              STRIPS replicator desk
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["same", "Same price"],
                ["expensive", "Bond expensive"],
                ["cheap", "Bond cheap"],
              ] as [Scenario, string][]
            ).map(([s, lbl]) => (
              <button
                key={s}
                type="button"
                onClick={() => applyScenario(s)}
                className="rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-medium text-slate-300 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Replicate the bond with zero-coupon STRIPS
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
          Each coupon and the final principal is bought as a separate STRIPS
          piece. Add up the replicating cost and compare it to the bond&apos;s
          market price.
        </p>

        <FormulaExplainer
          className="mt-4"
          label="Replication formula"
          tone="purple"
          formula={String.raw`P = C P_{0,1} + C P_{0,2} + \cdots + (C+F)P_{0,T}`}
          meaning="The bond's price equals the sum of each cash flow times the price of a zero-coupon STRIPS paying $1 at that date."
          variables={[
            { symbol: "C", description: "Coupon per period" },
            { symbol: "F", description: "Face value (principal)" },
            {
              symbol: "P_{0,t}",
              description: "Today's price of a zero paying $1 at time t",
            },
          ]}
        />

        {/* Inputs */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <NumInput
            label="Face (F)"
            value={face}
            min={100}
            step={100}
            onChange={setFace}
          />
          <NumInput
            label="Coupon %"
            value={couponPct}
            min={0}
            max={20}
            step={0.5}
            onChange={setCouponPct}
          />
          <NumInput
            label="Maturity T (yr)"
            value={maturity}
            min={1}
            max={3}
            step={1}
            onChange={setMaturity}
          />
          <NumInput
            label="Bond price"
            value={bondPrice}
            min={100}
            step={5}
            onChange={setBondPrice}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <NumInput
            label="P_{0,1}"
            value={p01}
            min={0.1}
            max={1.5}
            step={0.01}
            onChange={setP01}
            frac
          />
          <NumInput
            label="P_{0,2}"
            value={p02}
            min={0.1}
            max={1.5}
            step={0.01}
            onChange={setP02}
            frac
          />
          <NumInput
            label="P_{0,3}"
            value={p03}
            min={0.1}
            max={1.5}
            step={0.01}
            onChange={setP03}
            frac
          />
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setReplicated(true);
              setShowTrade(false);
            }}
            aria-label="Replicate bond into STRIPS"
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-4 py-2 text-[13px] font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Replicate (split into STRIPS)
          </button>
          <button
            type="button"
            onClick={() => setShowTrade(true)}
            disabled={!replicated}
            aria-label="Show trade direction"
            className="rounded-full border border-accent-purple/50 bg-accent-purple/10 px-4 py-2 text-[13px] font-medium text-accent-purple transition-colors hover:bg-accent-purple/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Trade
          </button>
        </div>

        <AnimatePresence>
          {replicated && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 space-y-4"
            >
              {/* Offset table */}
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-ink-950/50 p-4">
                <table className="w-full min-w-[420px] border-collapse text-center">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-3 py-2 text-left ops-caption text-[11px] text-slate-400">
                        Date t
                      </th>
                      {cfs.map((_, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 ops-caption text-[11px] text-slate-400"
                        >
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/5">
                      <td className="px-3 py-2 text-left text-[13px] text-slate-300">
                        Bond CF
                      </td>
                      {cfs.map((cf, i) => (
                        <td
                          key={i}
                          className="px-3 py-2 font-mono text-[13px] text-slate-200"
                        >
                          {formatMoney(cf)}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="px-3 py-2 text-left text-[13px] text-slate-300">
                        {"STRIPS P_{0,t}"}
                      </td>
                      {stripPrices.map((p, i) => (
                        <td
                          key={i}
                          className="px-3 py-2 font-mono text-[13px] text-slate-200"
                        >
                          {p.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-3 py-2 text-left text-[13px] text-accent-cyan">
                        CF × STRIP
                      </td>
                      {cfs.map((cf, i) => (
                        <td
                          key={i}
                          className="px-3 py-2 font-mono text-[13px] text-accent-cyan"
                        >
                          {formatMoney(cf * (stripPrices[i] ?? 0))}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ResultCard
                  label="Replicating cost"
                  value={formatMoney(replicatingCost)}
                  tone="cyan"
                />
                <ResultCard
                  label="Bond market price"
                  value={formatMoney(bondPrice)}
                  tone="amber"
                />
                <ResultCard
                  label="Mismatch (bond − replic.)"
                  value={`${mismatch >= 0 ? "+" : "−"}${formatMoney(Math.abs(mismatch))}`}
                  tone={Math.abs(mismatch) < 0.5 ? "green" : "red"}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTrade && replicated && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={cn(
                "mt-4 rounded-xl border p-5",
                tradeDir === "fair"
                  ? "border-accent-green/30 bg-accent-green/[0.06]"
                  : "border-accent-purple/30 bg-accent-purple/[0.06]",
              )}
            >
              <div className="ops-caption text-[11px] text-slate-400">
                Trade direction
              </div>
              {tradeDir === "fair" ? (
                <p className="ops-body-strong mt-1 text-[16px] text-accent-green">
                  Consistent — no trade. Bond price equals STRIPS cost.
                </p>
              ) : (
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  {tradeDir === "sell-bond" ? (
                    <>
                      <TradeArrow
                        label="Sell bond"
                        sub={`+${formatMoney(bondPrice)}`}
                        tone="red"
                      />
                      <span className="text-slate-500">→</span>
                      <TradeArrow
                        label="Buy STRIPS"
                        sub={`−${formatMoney(replicatingCost)}`}
                        tone="cyan"
                      />
                      <span className="text-slate-500">→</span>
                      <TradeArrow
                        label="Lock today"
                        sub={`+${formatMoney(Math.abs(mismatch))}`}
                        tone="green"
                      />
                    </>
                  ) : (
                    <>
                      <TradeArrow
                        label="Buy bond"
                        sub={`−${formatMoney(bondPrice)}`}
                        tone="cyan"
                      />
                      <span className="text-slate-500">→</span>
                      <TradeArrow
                        label="Sell STRIPS"
                        sub={`+${formatMoney(replicatingCost)}`}
                        tone="red"
                      />
                      <span className="text-slate-500">→</span>
                      <TradeArrow
                        label="Lock today"
                        sub={`+${formatMoney(Math.abs(mismatch))}`}
                        tone="green"
                      />
                    </>
                  )}
                </div>
              )}
              <p className="ops-body mt-3 text-[14px] leading-6 text-slate-200">
                Future cash flows cancel exactly: every coupon and principal the
                bond pays is matched by a STRIPS obligation (or vice versa).
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveFrame>
    </div>
  );
}

function NumInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  frac,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step: number;
  onChange: (v: number) => void;
  frac?: boolean;
}) {
  return (
    <label className="block">
      <span className="ops-caption text-[10px] text-slate-500"><MathText>{label}</MathText></span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-1 w-full rounded-md border border-white/10 bg-ink-950/60 px-2 py-1.5 font-mono text-[14px] text-slate-100 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
      />
      {frac && (
        <span className="mt-0.5 block font-mono text-[11px] text-slate-500">
          {value.toFixed(2)}
        </span>
      )}
    </label>
  );
}

function ResultCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "amber" | "green" | "red";
}) {
  const accent = {
    cyan: "text-accent-cyan border-accent-cyan/30",
    amber: "text-accent-amber border-accent-amber/30",
    green: "text-accent-green border-accent-green/30",
    red: "text-accent-red border-accent-red/30",
  }[tone];
  return (
    <div className={cn("rounded-xl border bg-white/[0.02] p-4", accent)}>
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className="mt-1 font-mono text-[18px] text-slate-100">{value}</div>
    </div>
  );
}

function TradeArrow({
  label,
  sub,
  tone,
}: {
  label: string;
  sub: string;
  tone: "red" | "cyan" | "green";
}) {
  const accent = {
    red: "border-accent-red/40 bg-accent-red/10 text-accent-red",
    cyan: "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
    green: "border-accent-green/40 bg-accent-green/10 text-accent-green",
  }[tone];
  return (
    <div className={cn("rounded-lg border px-3 py-2", accent)}>
      <div className="ops-caption text-[10px] opacity-90">{label}</div>
      <div className="mt-0.5 font-mono text-[14px]">{sub}</div>
    </div>
  );
}
