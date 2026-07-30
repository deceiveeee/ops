"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type QKey = "efficiency" | "return" | "edge" | "risk" | "evaluation";

const QUESTIONS: {
  key: QKey;
  num: string;
  title: string;
  question: string;
  intro: string;
  examples?: string[];
  balancedExample?: string;
  callout?: string;
  warning?: string;
}[] = [
  {
    key: "efficiency",
    num: "3.1",
    title: "How efficient do I believe markets are?",
    question: "What do I believe about how prices incorporate information?",
    intro:
      "A philosophy begins with a defensible position on market efficiency. Avoid extreme views; both perfect efficiency and pervasive inefficiency are hard to defend.",
    examples: [
      "Broad liquid markets are highly competitive.",
      "Complex or less-followed markets may be less efficient.",
      "Markets are usually informative but may weaken under stress.",
      "Obvious opportunities are rare even if prices are not always correct.",
    ],
    balancedExample:
      "Markets are usually competitive, but prices can deviate from value when information is difficult to interpret or investors face behavioral or financial constraints.",
    callout: "You are not forced into an extreme. A nuanced belief is more defensible than either 'markets are always right' or 'markets are always wrong.'",
  },
  {
    key: "return",
    num: "3.2",
    title: "What is my source of expected return?",
    question: "Where do I expect the return to come from?",
    intro:
      "Returns come from identifiable sources. Distinguish exposure (being compensated for taking risk) from skill (profiting from a differentiated edge). Both can be valid — but they should not be confused.",
    examples: [
      "Broad equity risk", "Credit risk", "Duration or term risk", "Illiquidity premium",
      "Factor exposure (size, value, momentum, quality)", "Security selection",
      "Market timing", "Behavioral discipline", "Structural constraints",
      "Tax efficiency", "Rebalancing discipline",
    ],
    callout: "Am I being compensated for taking risk, or do I believe I possess an edge?",
  },
  {
    key: "edge",
    num: "3.3",
    title: "What is my edge?",
    question: "Why can I execute the strategy successfully when others cannot?",
    intro:
      "Require specificity. 'I work hard and research companies' is weak. A stronger claim identifies the asset class, the analytical lens, the time horizon, and the reason competitors have not already exploited the same opportunity.",
    balancedExample:
      "I focus on small industrial companies with limited analyst coverage and evaluate unit economics, reinvestment returns, and capital allocation over a five-year horizon.",
    examples: [
      "Specific", "Observable", "Repeatable", "Difficult to copy",
      "Large enough to overcome costs", "Compatible with my time horizon",
      "Sustainable at the intended portfolio size",
    ],
    callout: "An investment edge is not a personality trait. It is an analytical, behavioral, informational, or structural advantage that changes decisions.",
    warning: "Even a specific edge remains a hypothesis until supported by evidence.",
  },
  {
    key: "risk",
    num: "3.4",
    title: "What risks could make the strategy fail?",
    question: "What could break a conceptually valid strategy?",
    intro:
      "Most strategies do not fail because the underlying idea was wrong. They fail because the investor could not sustain or implement the idea through drawdowns, costs, or changing conditions.",
    examples: [
      "Valuation error", "Business deterioration", "Leverage", "Liquidity",
      "Concentration", "Behavioral mistakes", "Model error",
      "Changing market conditions", "Crowding", "Implementation costs",
      "Time-horizon mismatch", "Benchmark mismatch", "Tax consequences",
      "Loss of the original edge",
    ],
    callout: "A strategy can be conceptually valid and still fail because the investor cannot sustain or implement it.",
  },
  {
    key: "evaluation",
    num: "3.5",
    title: "How will I know whether the philosophy is working?",
    question: "What evidence will tell me the philosophy is succeeding or failing?",
    intro:
      "Define evaluation measures in advance. The evaluation horizon must match the strategy — a five-year value thesis should not be judged after one quarter, and a short-horizon trading strategy should not be excused indefinitely.",
    examples: [
      "Performance relative to an appropriate benchmark",
      "Risk-adjusted results",
      "Results after fees and taxes",
      "Adherence to the stated process",
      "Position-limit compliance",
      "Realized trading costs",
      "Drawdowns",
      "Behavior during stressful periods",
      "Evidence that the original edge still exists",
    ],
    callout: "A passive allocation should not be abandoned because one speculative sector outperformed for one year.",
  },
];

export default function FiveQuestionsFramework() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<QKey>("efficiency");
  const current = QUESTIONS.find((q) => q.key === active)!;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          A defensible philosophy must answer five questions. The questions are connected: an edge
          claim only matters if you can implement it, and an evaluation plan only works if the
          horizon matches the strategy.
        </p>
      </div>

      {/* Question selector */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4 sm:p-5">
        <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Five organizing questions
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {QUESTIONS.map((q) => {
            const isActive = active === q.key;
            return (
              <button key={q.key} type="button"
                onClick={() => setActive(q.key)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                  isActive ? "border-accent-cyan/50 bg-accent-cyan/[0.08]" : "border-white/10 bg-white/[0.02] hover:border-white/25",
                )}>
                <div className={cn("font-sans text-[10px]", isActive ? "text-accent-cyan" : "text-slate-400")}>
                  {q.num}
                </div>
                <div className={cn("mt-0.5 text-[12px] leading-tight font-medium", isActive ? "text-white" : "text-slate-200")}>
                  {q.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active question detail */}
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
            Question {current.num} · {current.title}
          </div>
          <p className="ops-body mt-3 text-[17px] leading-[1.5] text-white">{current.question}</p>
          <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">{current.intro}</p>

          {current.examples && (
            <div className="mt-4">
              <div className="font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
                Defensible answers / examples
              </div>
              <ul className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {current.examples.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{x}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {current.balancedExample && (
            <div className="mt-4 rounded-lg border border-accent-green/25 bg-accent-green/[0.05] px-3 py-2.5">
              <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-green">
                Balanced example
              </div>
              <p className="ops-body mt-1 text-[14px] italic leading-[1.55] text-slate-100">
                &ldquo;{current.balancedExample}&rdquo;
              </p>
            </div>
          )}

          {current.warning && (
            <div className="mt-3 rounded-lg border border-accent-amber/25 bg-accent-amber/[0.05] px-3 py-2.5">
              <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-amber">Caveat · </span>
              <span className="text-[13px] leading-[1.55] text-slate-100">{current.warning}</span>
            </div>
          )}

          {current.callout && (
            <div className="mt-3 rounded-lg border border-accent-cyan/25 bg-accent-cyan/[0.05] px-3 py-2.5">
              <p className="text-[14px] leading-[1.55] text-slate-100">{current.callout}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
