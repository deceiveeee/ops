"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const INITIAL_QUESTION = {
  prompt: "Should informed buying immediately push the company back toward $1 billion?",
  options: [
    { val: "yes", label: "Yes — informed buyers should close the gap quickly" },
    { val: "unclear", label: "It depends on constraints we have not seen yet" },
    { val: "no", label: "No — the gap may persist or even widen" },
  ],
};

const COMPLICATIONS = [
  {
    label: "Cash needs",
    text: "The company may need to raise cash before the valuation gap closes. A dilutive equity issuance could destroy the very discount that attracted the buyers.",
    impact: "Even correct valuation analysis cannot prevent a financing that harms current shareholders.",
  },
  {
    label: "Timing unknown",
    text: "Nobody knows when the gap will close. It could be months. It could be years. It could close only after the existing shareholders have given up.",
    impact: "Capital tied up in a 'certain' mispricing cannot be deployed elsewhere. Opportunity cost accumulates daily.",
  },
  {
    label: "Client withdrawals",
    text: "The professional managers who recognize the discount are simultaneously experiencing client withdrawals from their own funds.",
    impact: "A manager cannot buy more of an undervalued asset while forced to sell other positions to meet redemptions.",
  },
  {
    label: "Credit lines reduced",
    text: "Lenders — spooked by the same price decline that created the opportunity — are reducing credit lines to the manager's fund and to the company itself.",
    impact: "The very price decline that produced the discount also reduces the financing available to exploit it.",
  },
  {
    label: "Sector decline",
    text: "Similar companies are also declining. The relative-value argument that 'this company is cheaper than its peers' weakens when every peer is falling together.",
    impact: "A spread can stay wide or widen even when the original analysis was correct.",
  },
  {
    label: "Illiquid trading",
    text: "The stock is difficult to trade in size. Buying a meaningful position pushes the price up against the buyer; the apparent discount evaporates as it is pursued.",
    impact: "Market impact converts a paper discount into a much smaller realized discount.",
  },
  {
    label: "Career risk",
    text: "A manager who buys now may appear wrong for months or years. Clients, risk officers, and supervisors may demand an exit before the thesis plays out.",
    impact: "Being right eventually is not the same as being permitted to remain right.",
  },
];

export default function UndervaluedDangerousOpening() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>(0);
  const [initialAnswer, setInitialAnswer] = useState<string | null>(null);

  const advance = () => setStage((s) => Math.min(COMPLICATIONS.length, s + 1) as Stage);
  const reset = () => {
    setStage(0);
    setInitialAnswer(null);
  };

  return (
    <div className="space-y-6">
      {/* Initial facts */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          The situation
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Fact label="Estimated asset value" value="≈ $1.0B" tone="cyan" />
          <Fact label="Debt" value="Minimal" tone="green" />
          <Fact label="Market capitalization" value="≈ $600M" tone="red" />
        </div>
        <p className="ops-body mt-4 text-[15px] leading-[1.65] text-slate-100">
          Several professional investors believe the company is materially undervalued. The market
          is pricing the equity at roughly <span className="text-accent-red">60%</span> of the
          estimated value of its assets.
        </p>
      </div>

      {/* Initial question */}
      {stage === 0 && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
            {INITIAL_QUESTION.prompt}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {INITIAL_QUESTION.options.map((o) => (
              <button key={o.val} type="button"
                onClick={() => { setInitialAnswer(o.val); setStage(1); }}
                className="rounded-full border border-white/20 px-5 py-2 text-left text-[14px] text-slate-200 transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Complications reveal */}
      {stage > 0 && (
        <div className="space-y-3">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Complications · {stage} of {COMPLICATIONS.length}
          </div>
          {COMPLICATIONS.slice(0, stage).map((c, i) => (
            <motion.div
              key={i}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.04] p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 font-mono text-[10px] text-accent-amber">{i + 1}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-amber">{c.label}</span>
              </div>
              <p className="ops-body mt-2 text-[15px] leading-[1.6] text-slate-100">{c.text}</p>
              <p className="ops-body mt-1 text-[13px] leading-[1.55] text-slate-300">{c.impact}</p>
            </motion.div>
          ))}

          {stage < COMPLICATIONS.length ? (
            <button type="button" onClick={advance}
              className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
              Reveal another complication →
            </button>
          ) : (
            <button type="button" onClick={reset}
              className="rounded-full border border-white/20 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
              ↻ Restart scenario
            </button>
          )}
        </div>
      )}

      {/* Final question + conclusion */}
      <AnimatePresence>
        {stage === COMPLICATIONS.length && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.05] p-5 sm:p-6">
              <p className="ops-body text-[19px] leading-[1.5] text-white">
                Can an investment be undervalued and still be too dangerous to buy?
              </p>
              <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-200">
                The original math was simple: $1 billion of assets minus minimal debt implies the
                equity should be worth roughly $1 billion. The market says $600 million. Yet each
                complication added a reason that even informed buyers may not be able to close that
                gap.
              </p>
            </div>

            <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[17px] leading-[1.5] text-white">
                Recognizing a mistake is not the same as being able to profit from it.
              </p>
              {initialAnswer === "yes" && (
                <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-200">
                  Your initial reaction — that informed buying should immediately close the gap — is
                  the natural one. The complications above show why professional investors often
                  cannot act on mispricings they genuinely recognize.
                </p>
              )}
              {initialAnswer === "no" && (
                <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-200">
                  Your initial reaction was correct in spirit. Even obvious mispricings can persist
                  when the investors who recognize them face financing, timing, and career
                  constraints.
                </p>
              )}
              {initialAnswer === "unclear" && (
                <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-200">
                  Your instinct to wait for more context was appropriate. The same gap can look
                  exploitable or impossible depending on the constraints faced by the investors who
                  see it.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Fact({ label, value, tone }: { label: string; value: string; tone: "cyan" | "green" | "red" }) {
  const text = tone === "cyan" ? "text-accent-cyan" : tone === "green" ? "text-accent-green" : "text-accent-red";
  const border = tone === "cyan" ? "border-accent-cyan/25" : tone === "green" ? "border-accent-green/25" : "border-accent-red/25";
  return (
    <div className={cn("rounded-xl border bg-ink-950/40 px-4 py-3", border)}>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[18px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
