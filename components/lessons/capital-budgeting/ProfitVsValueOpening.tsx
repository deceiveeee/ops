"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

export default function ProfitVsValueOpening() {
  const reduce = useReducedMotion();
  const [cost, setCost] = useState(100);
  const [payoff, setPayoff] = useState(108);
  const [rate, setRate] = useState(12);
  const [revealed, setRevealed] = useState(false);

  const profit = payoff - cost;
  const pctReturn = cost > 0 ? ((payoff - cost) / cost) * 100 : 0;
  const pv = payoff / (1 + rate / 100);
  const npv = pv - cost;
  const opportunity = cost * (1 + rate / 100);

  const profitPositive = profit > 0;
  const npvPositive = npv > 0;

  return (
    <div className="space-y-6">
      {/* The deal */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          The investment
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Control label="Capital invested today" value={cost} min={50} max={200} step={1} prefix="$" suffix="M" onChange={setCost} />
          <Control label="Expected payoff (1 year)" value={payoff} min={50} max={250} step={1} prefix="$" suffix="M" onChange={setPayoff} />
          <Control label="Required return" value={rate} min={3} max={25} step={0.5} suffix="%" onChange={setRate} />
        </div>
      </div>

      {/* Initial question */}
      {!revealed && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
            The project is expected to make{" "}
            <span className="font-mono text-accent-amber">${fmt(Math.abs(profit))}M</span>{" "}
            {profit >= 0 ? "in profit" : "in loss"}. Does it create value?
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-full border border-accent-amber/50 bg-accent-amber/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
            >
              Reveal the calculation
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Step 1: Undiscounted profit */}
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
                Step 1 · Expected dollar profit
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
                <BlockMath>
                  {String.raw`\$${fmt(payoff)}\,\text{M} - \$${fmt(cost)}\,\text{M} = \$${fmt(profit)}\,\text{M}`}
                </BlockMath>
              </div>
              <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-200">
                The project is expected to return{" "}
                <span className={profitPositive ? "text-accent-green" : "text-accent-red"}>
                  ${fmt(Math.abs(profit))}M {profitPositive ? "more" : "less"}
                </span>{" "}
                than it costs. Expected return:{" "}
                <span className="font-mono text-white">{fmt(pctReturn)}%</span>.
              </p>
            </div>

            {/* Step 2: Present value */}
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
                Step 2 · Present value at the required return
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
                <BlockMath>
                  {String.raw`PV = \frac{\$${fmt(payoff)}\,\text{M}}{1 + ${rate}\%} = \$${fmt(pv)}\,\text{M}`}
                </BlockMath>
              </div>
            </div>

            {/* Step 3: NPV */}
            <div className={cn(
              "rounded-2xl border p-5 sm:p-6",
              npvPositive ? "border-accent-green/30 bg-accent-green/[0.06]" : "border-accent-red/30 bg-accent-red/[0.06]",
            )}>
              <div className={cn(
                "font-mono text-[12px] uppercase tracking-[0.16em]",
                npvPositive ? "text-accent-green" : "text-accent-red",
              )}>
                Step 3 · Net present value
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
                <BlockMath>
                  {String.raw`NPV = \$${fmt(pv)}\,\text{M} - \$${fmt(cost)}\,\text{M} = \$${fmt(npv)}\,\text{M}`}
                </BlockMath>
              </div>

              {/* Readouts — distinguish profit vs NPV using shape+text, not color alone */}
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Readout label="Expected profit" value={`$${fmt(profit)}M`} mark={profitPositive ? "▲" : "▼"} tone={profitPositive ? "green" : "red"} />
                <Readout label="Expected return" value={`${fmt(pctReturn)}%`} mark={pctReturn >= rate ? "▲" : "▼"} tone={pctReturn >= rate ? "green" : "red"} />
                <Readout label="Required return" value={`${fmt(rate)}%`} tone="amber" />
                <Readout label="NPV" value={`$${fmt(npv)}M`} mark={npvPositive ? "▲" : "▼"} tone={npvPositive ? "green" : "red"} />
              </div>

              {/* Interpretation */}
              <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
                {profitPositive && !npvPositive ? (
                  <>
                    The project is expected to return <span className="text-white">${fmt(Math.abs(profit))}M</span> more
                    than it costs — yet its NPV is{" "}
                    <span className="text-accent-red">negative</span>. The payoff is inadequate relative
                    to the return investors require for this level of risk.
                  </>
                ) : profitPositive && npvPositive ? (
                  <>
                    The project is both profitable in dollar terms and value-creating. Its expected
                    return of <span className="text-white">{fmt(pctReturn)}%</span> exceeds the{" "}
                    {fmt(rate)}% required, producing a positive NPV of{" "}
                    <span className="text-accent-green">${fmt(npv)}M</span>.
                  </>
                ) : !profitPositive && !npvPositive ? (
                  <>
                    The project is expected to lose money on a dollar basis{" "}
                    (<span className="text-accent-red">${fmt(profit)}M</span>) and destroy even more
                    value once risk is accounted for (NPV ={" "}
                    <span className="text-accent-red">${fmt(npv)}M</span>).
                  </>
                ) : (
                  <>
                    An unusual case: the dollar payoff is below cost, but when discounted at a very
                    low required return the NPV is marginally positive. The conclusion is fragile.
                  </>
                )}
              </p>

              {/* Opportunity cost comparison */}
              <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  Opportunity cost comparison
                </div>
                <div className="mt-2">
                  <BlockMath>
                    {String.raw`\$${fmt(cost)}\,\text{M} \times (1 + ${rate}\%) = \$${fmt(opportunity)}\,\text{M}`}
                  </BlockMath>
                </div>
                <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-300">
                  The same capital in a comparable-risk opportunity would be expected to grow to{" "}
                  <span className="text-white">${fmt(opportunity)}M</span>. The project offers only{" "}
                  <span className="text-white">${fmt(payoff)}M</span>.{" "}
                  {payoff < opportunity
                    ? "That gap is why NPV is negative."
                    : "The project exceeds the opportunity cost, so NPV is positive."}
                </p>
              </div>
            </div>

            {/* Conclusion */}
            <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[18px] leading-[1.5] text-white">
                Positive expected profit does not necessarily mean positive NPV.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Control({
  label,
  value,
  min,
  max,
  step,
  suffix,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">
          {prefix}{value}{suffix}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}

function Readout({
  label,
  value,
  tone = "neutral",
  mark,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red" | "amber";
  mark?: string;
}) {
  const text =
    tone === "green" ? "text-accent-green"
    : tone === "red" ? "text-accent-red"
    : tone === "amber" ? "text-accent-amber"
    : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-2 font-mono text-[16px] tabular-nums", text)}>
        {mark && <span className="mr-1">{mark}</span>}
        {value}
      </div>
    </div>
  );
}
