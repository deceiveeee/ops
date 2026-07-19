"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Choice = "buy" | "wait" | "avoid";

export default function EarningsAnnouncementOpening() {
  const reduce = useReducedMotion();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-6">
      {/* News flash */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent-cyan/40 font-mono text-[10px] text-accent-cyan" aria-hidden>!</span>
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
            Breaking news · earnings release
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {[
            "Quarterly earnings increased 30% year over year.",
            "Revenue exceeded analyst expectations.",
            "Management raised its full-year forecast.",
          ].map((line) => (
            <div key={line} className="flex items-start gap-2.5 text-[16px] leading-[1.6] text-slate-100">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Initial choice */}
      {!revealed && (
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <p className="ops-body text-[17px] leading-[1.6] text-slate-100">
            Should you buy the stock?
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {([
              { key: "buy" as Choice, label: "Yes, buy now" },
              { key: "wait" as Choice, label: "Wait for more information" },
              { key: "avoid" as Choice, label: "It depends on the price" },
            ]).map((o) => (
              <button key={o.key} type="button"
                disabled={choice !== null}
                onClick={() => { setChoice(o.key); setRevealed(true); }}
                className={cn(
                  "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                  choice === o.key
                    ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                    : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                )}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reveal */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
                The market already reacted
              </div>
              <p className="ops-body mt-3 text-[18px] leading-[1.5] text-white">
                The stock is already up <span className="font-mono text-accent-amber">12%</span>.
              </p>
              <p className="ops-body mt-2 text-[15px] leading-[1.65] text-slate-200">
                By the time you read the earnings release, thousands of other investors had already
                seen the same information. Their buying pushed the price up before you could act.
              </p>
            </div>

            {/* Follow-up questions */}
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
                Questions to consider
              </div>
              <ul className="mt-3 space-y-2.5">
                {[
                  "Is the company now more valuable than yesterday?",
                  "Is the stock still undervalued?",
                  "Did you discover something, or merely receive information the market had already processed?",
                  "Does good news imply the stock must continue rising?",
                ].map((q) => (
                  <li key={q} className="flex items-start gap-2.5 text-[15px] leading-[1.6] text-slate-100">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                    {q}
                  </li>
                ))}
              </ul>
            </div>

            {/* Conclusion */}
            <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[17px] leading-[1.5] text-white">
                An investment is attractive only when future results are{" "}
                <span className="text-accent-cyan">better than what the current price already
                assumes</span>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
