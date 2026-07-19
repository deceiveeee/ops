"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const PROFILE = {
  horizon: "20-year horizon",
  time: "Limited research time",
  volatility: "Moderate tolerance for volatility",
  liquidity: "No near-term withdrawal needs",
  knowledge: "No specialized industry knowledge",
  interest: "Interest in learning company analysis",
};

const PHILOSOPHY = `Most of my portfolio will remain in diversified low-cost funds because I lack a reliable broad-market edge. I may allocate up to 10% to individual companies where I can explain the valuation, identify the market expectation, and define the downside. No single active position may exceed 3% of the total portfolio. I will not use leverage. Active positions will be reviewed quarterly or when material information changes.`;

const EVAL_QUESTIONS = [
  "Is the philosophy internally consistent?",
  "Does the active allocation fit the investor's experience?",
  "Are the rules measurable?",
  "What is missing?",
  "How should results be benchmarked?",
  "What evidence would justify increasing or reducing the active allocation?",
];

const MISSING_ITEMS = [
  "An explicit benchmark for both the passive core and the active sleeve",
  "Sell or revision criteria beyond quarterly reviews",
  "A documentation method (written thesis, decision journal)",
  "Tax treatment of rebalancing and active turnover",
  "A minimum expected-return hurdle for active positions",
  "A maximum total concentration limit (e.g., cap across all active positions in one sector)",
  "An evaluation horizon matched to the strategy",
];

const STRENGTHS = [
  "The belief ('I lack a reliable broad-market edge') is consistent with the implementation (low-cost diversified core).",
  "Position-size limits (3% per position) and a maximum active allocation (10%) are concrete and measurable.",
  "The 'no leverage' rule matches the long horizon and absence of withdrawal needs.",
  "The review cadence (quarterly or on material information) is reasonable for a long-horizon investor.",
];

export default function PhilosophyCaseStudy() {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Investor profile */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          Fictional investor profile
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {Object.entries(PROFILE).map(([k, v]) => (
            <li key={k} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-100">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{v}
            </li>
          ))}
        </ul>
      </div>

      {/* Proposed philosophy */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Proposed philosophy
        </div>
        <p className="ops-body mt-3 text-[16px] italic leading-[1.65] text-slate-100">
          &ldquo;{PHILOSOPHY}&rdquo;
        </p>
      </div>

      {/* Evaluation questions */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Evaluate the philosophy
        </div>
        <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-300">
          Draft brief responses to each question. The expert review will become available once you
          submit.
        </p>

        <div className="mt-4 space-y-4">
          {EVAL_QUESTIONS.map((q, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-cyan/40 font-mono text-[11px] text-accent-cyan">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-white">{q}</div>
                  <textarea
                    value={answers[i] ?? ""}
                    onChange={(e) => setAnswers((p) => ({ ...p, [i]: e.target.value }))}
                    disabled={revealed}
                    rows={2}
                    placeholder="Draft your analysis…"
                    className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[14px] text-slate-100 placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30 disabled:opacity-70"
                    aria-label={q} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {!revealed ? (
            <button type="button"
              onClick={() => setRevealed(true)}
              className="rounded-full border border-accent-cyan/50 bg-accent-cyan/10 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
              Reveal expert review →
            </button>
          ) : (
            <button type="button"
              onClick={() => setRevealed(false)}
              className="rounded-full border border-white/20 px-5 py-2 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
              ← Hide expert review
            </button>
          )}
        </div>
      </div>

      {/* Expert review */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4">
            <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-green">
                Strengths of the philosophy
              </div>
              <ul className="mt-3 space-y-2">
                {STRENGTHS.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />{s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-accent-amber/30 bg-accent-amber/[0.05] p-5 sm:p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
                Likely missing items
              </div>
              <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-200">
                A strong analysis typically identifies one or more of the following gaps:
              </p>
              <ul className="mt-3 space-y-2">
                {MISSING_ITEMS.map((m) => (
                  <li key={m} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
              <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
                Multiple defensible conclusions exist. The point is not to mark the philosophy
                right or wrong, but to identify where the rules are concrete enough to be tested
                and where they remain aspirational.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
