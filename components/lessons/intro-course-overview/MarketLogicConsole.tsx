"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { SIX_PRINCIPLES } from "./lessonContent";
import { Feedback, InteractiveFrame, TryItTag } from "./shared";
import { cn } from "@/lib/utils";

const SCENARIOS: {
  id: string;
  text: string;
  correct: string;
  feedback: string;
}[] = [
  {
    id: "s1",
    text: "A website claims you can earn 20% per month with no risk.",
    correct: "P1",
    feedback:
      "High returns usually come with risk, cost, illiquidity, fraud risk, or hidden assumptions.",
  },
  {
    id: "s2",
    text: "You can receive $100 today or $100 next year.",
    correct: "P2",
    feedback: "Receiving money earlier gives you more flexibility.",
  },
  {
    id: "s3",
    text: "A company's management recommends a merger that increases executive bonuses but may not benefit shareholders.",
    correct: "P3",
    feedback:
      "Finance often studies incentives because decision-makers may not always act for the same objective.",
  },
  {
    id: "s4",
    text: "A company reports unexpectedly strong earnings. Many investors want to buy the stock.",
    correct: "P4",
    feedback: "Increased demand can push the price upward.",
  },
  {
    id: "s5",
    text: "A trading strategy worked well for years. Then many investors copied it, and the profits disappeared.",
    correct: "P5",
    feedback: "Competition can reduce or eliminate excess profits.",
  },
  {
    id: "s6",
    text: "An insurance company sells policies that help homeowners transfer the risk of fire damage.",
    correct: "P6",
    feedback:
      "Many financial products exist because people want to transfer, reduce, or manage risk.",
  },
];

export default function MarketLogicConsole({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const reduce = useReducedMotion();
  const allDone = Object.keys(answers).length === SCENARIOS.length;

  const choose = (sid: string, pid: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [sid]: pid };
      if (Object.keys(next).length === SCENARIOS.length) onComplete?.();
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Principles reference */}
      <div className="glass-panel p-6 sm:p-7">
        <div className="ops-caption text-[11px] text-slate-400">
          Six fundamental principles
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SIX_PRINCIPLES.map((p) => (
            <div
              key={p.id}
              className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-sans text-[11px] text-accent-cyan">
                {p.id}
              </span>
              <span className="ops-body text-[14px] text-slate-100">
                {p.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Diagnostic scenarios */}
      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Match each scenario to its principle
          </span>
        </div>
        <div className="mt-5 space-y-3.5">
          {SCENARIOS.map((s) => {
            const picked = answers[s.id];
            const correct = picked === s.correct;
            return (
              <div
                key={s.id}
                className={cn(
                  "rounded-xl border bg-white/[0.02] p-5",
                  picked
                    ? correct
                      ? "border-accent-green/50"
                      : "border-accent-red/50"
                    : "border-white/10",
                )}
              >
                <p className="ops-body-strong text-[16px] text-slate-50">
                  {s.text}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {SIX_PRINCIPLES.map((p) => {
                    const isPicked = picked === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={isPicked}
                        onClick={() => choose(s.id, p.id)}
                        className={cn(
                          "rounded-full border px-4 py-1.5 font-sans text-[11px] uppercase tracking-[0.14em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                          isPicked
                            ? correct
                              ? "border-accent-green bg-accent-green/15 text-accent-green"
                              : "border-accent-red bg-accent-red/15 text-accent-red"
                            : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                        )}
                      >
                        {p.id}
                      </button>
                    );
                  })}
                </div>
                {picked && (
                  <Feedback status={correct ? "correct" : "incorrect"}>
                    {correct
                      ? s.feedback
                      : "Try again — re-read the principles, then reclassify."}
                  </Feedback>
                )}
              </div>
            );
          })}
        </div>
      </InteractiveFrame>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ops-definition-card p-6"
          >
            <div className="ops-caption text-[11px] text-accent-cyan">Note</div>
            <p className="ops-definition mt-3 text-[16px]">
              These principles are approximations, not perfect descriptions of
              every human decision. But they are useful starting points for
              financial analysis.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
