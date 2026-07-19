"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Choice = "A" | "B" | "neither" | "both";

const PROFILES = [
  {
    key: "A" as const,
    label: "Investor A",
    quote: "Markets are efficient, so I never need to analyze anything. I buy whatever is popular and hold it.",
    flaw: "Confuses passive investing with thoughtlessness. Passive investing is a deliberate decision to accept market weights at low cost — not a license to buy whatever is popular without reasoning.",
  },
  {
    key: "B" as const,
    label: "Investor B",
    quote: "Markets are irrational, so I can beat them by buying stocks that look cheap.",
    flaw: "Confuses the existence of mispricing with the ability to identify and exploit it. Markets can be inefficient in aggregate without giving any particular investor a reliable way to profit from it.",
  },
];

export default function TwoIncompletePhilosophiesOpening() {
  const reduce = useReducedMotion();
  const [choice, setChoice] = useState<Choice | null>(null);

  const isCorrect = choice === "neither";

  return (
    <div className="space-y-6">
      {/* Two profiles */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {PROFILES.map((p) => (
          <div key={p.key}
            className={cn("rounded-2xl border p-5",
              choice === p.key ? "border-accent-amber/40 bg-accent-amber/[0.06]" : "border-white/12 bg-white/[0.03]")}>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
              {p.label}
            </div>
            <p className="ops-body mt-3 text-[16px] italic leading-[1.6] text-slate-100">
              &ldquo;{p.quote}&rdquo;
            </p>
          </div>
        ))}
      </div>

      {/* Question */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
          Which investor has the stronger investment philosophy?
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            { val: "A" as Choice, label: "Investor A" },
            { val: "B" as Choice, label: "Investor B" },
            { val: "neither" as Choice, label: "Neither" },
            { val: "both" as Choice, label: "Both are equally strong" },
          ]).map((o) => (
            <button key={o.val} type="button"
              disabled={choice !== null}
              onClick={() => setChoice(o.val)}
              className={cn(
                "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                !choice && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                choice === o.val && o.val === "neither" && "border-accent-green bg-accent-green/15 text-accent-green",
                choice === o.val && o.val !== "neither" && "border-accent-red bg-accent-red/15 text-accent-red",
                choice && choice !== o.val && "border-white/10 text-slate-500",
              )}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reveal */}
      <AnimatePresence>
        {choice && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4">
            <div className={cn("rounded-2xl border p-5 sm:p-6",
              isCorrect ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]")}>
              <div className={cn("font-mono text-[12px] uppercase tracking-[0.16em]",
                isCorrect ? "text-accent-green" : "text-accent-red")}>
                {isCorrect ? "Correct" : "Reconsider"}
              </div>
              <p className="ops-body mt-2 text-[16px] leading-[1.65] text-slate-100">
                {choice === "A" && "Investor A confuses passive investing with thoughtlessness. Passive is a deliberate strategy — not the absence of one."}
                {choice === "B" && "Investor B confuses the existence of mispricing with the ability to profit from it. Markets can be imperfect without offering any particular investor a reliable edge."}
                {choice === "both" && "Both philosophies are incomplete in different ways. Neither explains why the strategy should work or why the investor can execute it successfully."}
                {choice === "neither" && "Neither. Each investor states a conclusion without the supporting beliefs and rules that make a philosophy actionable."}
              </p>
            </div>

            {/* Why each is flawed */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {PROFILES.map((p) => (
                <div key={p.key} className="rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-red">
                    {p.label} · the flaw
                  </div>
                  <p className="ops-body mt-1.5 text-[13px] leading-[1.55] text-slate-100">{p.flaw}</p>
                </div>
              ))}
            </div>

            {/* Conclusion */}
            <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[18px] leading-[1.5] text-white">
                A sound investment philosophy must explain both why the strategy should work and why
                the investor can execute it successfully.
              </p>
              <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-200">
                A belief about markets is the beginning, not the end. The next sections build the
                structure that turns a belief into a defensible plan.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
