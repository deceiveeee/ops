"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const PRICE_PATH = [100, 130, 150, 90, 60];
const INTRINSIC = 60;

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

const STAGES: { label: string; price: number; insight: string }[] = [
  { label: "Open short", price: 100, insight: "Investor shorts the stock at $100. Intrinsic value is estimated at $60." },
  { label: "Rise continues", price: 130, insight: "Losses grow. The position is now under water by $30 per share." },
  { label: "Worst point", price: 150, insight: "Losses per share exceed the original short proceeds would suggest. Collateral requirements climb. The broker may demand more cash." },
  { label: "Painful recovery", price: 90, insight: "Price falls back toward the entry — but the position may already have been closed at a loss." },
  { label: "Eventually correct", price: 60, insight: "Price reaches the original intrinsic value estimate. The thesis was right. Was the position still open?" },
];

export default function ShortSaleRiskStory() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>(0);
  const [answer, setAnswer] = useState<string | null>(null);

  const current = STAGES[stage];
  const loss = stage > 0 ? Math.max(0, current.price - PRICE_PATH[0]) : 0;
  const wouldGain = INTRINSIC - PRICE_PATH[0];
  const maxPrice = 160;

  const advance = () => setStage((s) => Math.min(STAGES.length - 1, s + 1) as Stage);
  const reset = () => { setStage(0); setAnswer(null); };

  const yScale = (p: number) => 100 - ((p - 30) / (maxPrice - 30)) * 80;

  return (
    <div className="space-y-6">
      {/* Setup */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">The setup</div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Current price" value="$100" tone="amber" />
          <Stat label="Est. intrinsic value" value="$60" tone="cyan" />
          <Stat label="Position" value="Short" tone="red" />
        </div>
        <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-100">
          The investor believes the stock is overvalued by <span className="text-accent-cyan">$40</span> per
          share. The trade seems obvious: short now, profit when the price falls.
        </p>
      </div>

      {/* Question */}
      {stage === 0 && answer === null && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
            Before stepping through the price path: can the investor be fundamentally correct about
            value and still lose money on this trade?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              { val: "yes", label: "Yes — being right is not enough" },
              { val: "no", label: "No — correct valuation wins eventually" },
            ].map((o) => (
              <button key={o.val} type="button"
                onClick={() => { setAnswer(o.val); }}
                className="rounded-full border border-white/20 px-4 py-2 text-[14px] text-slate-200 transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {answer && stage === 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
          <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
            {answer === "yes" ? (
              <>Correct intuition. Step through the price path to see exactly how a correct thesis can become a losing trade.</>
            ) : (
              <>Many investors assume this. Step through the price path to see why even a correct thesis can produce a loss.</>
            )}
          </p>
          <button type="button" onClick={advance}
            className="mt-4 rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
            Step through price path →
          </button>
        </motion.div>
      )}

      {/* Price path visualization */}
      {stage > 0 && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
            Price path · {current.label}
          </div>

          <div className="mt-4 overflow-x-auto">
            <svg viewBox="0 0 600 220" className="w-full" style={{ minWidth: "420px" }}
              role="img" aria-label={`Stage ${stage}: price is $${current.price}. Intrinsic value is $${INTRINSIC}.`}>
              {/* axes */}
              <line x1={50} y1={20} x2={50} y2={180} stroke="rgba(255,255,255,0.2)" />
              <line x1={50} y1={180} x2={580} y2={180} stroke="rgba(255,255,255,0.2)" />

              {/* intrinsic value line */}
            <line x1={50} y1={yScale(INTRINSIC)} x2={580} y2={yScale(INTRINSIC)} stroke="#22d3ee" strokeDasharray="4 4" strokeWidth={1.5} />
            <text x={58} y={yScale(INTRINSIC) - 6} fill="#22d3ee" fontSize={11} fontFamily="monospace">{`Intrinsic value $${INTRINSIC}`}</text>

              {/* price points */}
              {PRICE_PATH.map((p, i) => {
                const x = 80 + (i / (PRICE_PATH.length - 1)) * 480;
                const y = yScale(p);
                const reached = i < stage;
                const current2 = i === stage - 1;
                return (
                  <g key={i}>
                    {i > 0 && (
                      <line
                        x1={80 + ((i - 1) / (PRICE_PATH.length - 1)) * 480}
                        y1={yScale(PRICE_PATH[i - 1])}
                        x2={x}
                        y2={y}
                        stroke={reached || current2 ? "#f87171" : "rgba(255,255,255,0.15)"}
                        strokeWidth={reached || current2 ? 2.5 : 1.5}
                      />
                    )}
                    <circle cx={x} cy={y} r={current2 ? 6 : reached ? 4 : 3}
                      fill={current2 ? "#fbbf24" : reached ? "#f87171" : "rgba(255,255,255,0.3)"}
                      stroke={current2 ? "#fbbf24" : "rgba(255,255,255,0.5)"}
                    />
                    <text x={x} y={y - 12} fill={current2 ? "#fbbf24" : reached ? "#f87171" : "rgba(255,255,255,0.5)"}
                      fontSize={11} fontFamily="monospace" textAnchor="middle">${p}</text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Current price" value={`$${current.price}`} tone={current.price > INTRINSIC ? "red" : "green"} />
            <Stat label="Unrealized loss / share" value={loss > 0 ? `-$${loss}` : "$0"} tone={loss > 0 ? "red" : "neutral"} />
            <Stat label="If held to $60" value={`+$${wouldGain}`} tone={stage === STAGES.length ? "green" : "amber"} />
          </div>

          <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-100">{current.insight}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {stage < STAGES.length - 1 ? (
              <button type="button" onClick={advance}
                className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                Next stage →
              </button>
            ) : (
              <button type="button" onClick={reset}
                className="rounded-full border border-white/20 px-5 py-2 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                ↻ Restart
              </button>
            )}
          </div>
        </div>
      )}

      {/* Why shorts fail */}
      <AnimatePresence>
        {stage > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5 sm:p-6">
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">
              Why a correct short can lose money
            </div>
            <ul className="mt-3 space-y-2">
              {[
                "Short losses increase as the price rises — gains are capped, losses are not.",
                "Collateral requirements may increase exactly when cash is most constrained.",
                "The broker may demand additional margin at the worst moment.",
                "Investors may withdraw from the fund after seeing losses on the statement.",
                "The position may have to be closed before the price falls.",
                "Share borrowing may become expensive or unavailable.",
              ].map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />{x}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conclusion */}
      <AnimatePresence>
        {stage === STAGES.length - 1 && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-accent-red/30 bg-gradient-to-br from-accent-red/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
            <p className="ops-body text-[18px] leading-[1.5] text-white">
              A mispricing can become larger before it disappears.
            </p>
            <p className="ops-body mt-2 text-[14px] leading-[1.65] text-slate-200">
              The investor was directionally right — the stock did eventually trade at $60. But the
              path mattered. The trip through $150 may have forced an exit at a loss long before the
              thesis played out.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "cyan" | "amber" | "red" | "green" | "neutral" }) {
  const text = tone === "cyan" ? "text-accent-cyan" : tone === "amber" ? "text-accent-amber" : tone === "red" ? "text-accent-red" : tone === "green" ? "text-accent-green" : "text-white";
  return (
    <div className={cn("rounded-xl border bg-ink-950/40 px-3 py-2.5",
      tone === "cyan" ? "border-accent-cyan/25" : tone === "amber" ? "border-accent-amber/25" : tone === "red" ? "border-accent-red/25" : tone === "green" ? "border-accent-green/25" : "border-white/10")}>
      <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className={cn("mt-0.5 font-sans text-[16px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
