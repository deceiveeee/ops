"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Feedback, InteractiveFrame, TryItTag } from "./shared";
import { cn } from "@/lib/utils";

type Q = {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctId: string;
  feedback: string;
};

const QUESTIONS: Q[] = [
  {
    id: "q1",
    prompt: "What are the two fundamental challenges of finance?",
    choices: [
      { id: "vm", label: "Valuation and management" },
      { id: "tr", label: "Time and risk only" },
      { id: "bs", label: "Buying and selling" },
    ],
    correctId: "vm",
    feedback:
      "All business activities reduce to valuation of assets and management of assets.",
  },
  {
    id: "q2",
    prompt:
      "Why does Professor Lo describe accounting as the language of finance?",
    choices: [
      {
        id: "vocab",
        label:
          "Because accounting provides the vocabulary and structure used to measure financial status and performance.",
      },
      { id: "tax", label: "Because accounting is required for taxes." },
      { id: "math", label: "Because accounting uses mathematics." },
    ],
    correctId: "vocab",
    feedback:
      "Accounting provides the vocabulary, structure, and measurement system of finance.",
  },
  {
    id: "q3",
    prompt:
      "A company's cash balance on December 31 is a stock variable or a flow variable?",
    choices: [
      { id: "stock", label: "Stock variable" },
      { id: "flow", label: "Flow variable" },
    ],
    correctId: "stock",
    feedback:
      "A cash balance is measured at a point in time, so it is a stock variable.",
  },
  {
    id: "q4",
    prompt: "Revenue during a year is a stock variable or a flow variable?",
    choices: [
      { id: "stock", label: "Stock variable" },
      { id: "flow", label: "Flow variable" },
    ],
    correctId: "flow",
    feedback: "Revenue is measured over a period, so it is a flow variable.",
  },
  {
    id: "q5",
    prompt: "Why is price discovery important?",
    choices: [
      {
        id: "mkt",
        label:
          "It allows markets to determine prices through the interaction of buyers and sellers, even when information is incomplete.",
      },
      { id: "fix", label: "It fixes prices at retail value." },
      { id: "tax", label: "It sets prices for taxes." },
    ],
    correctId: "mkt",
    feedback:
      "Price discovery is one of the central functions of financial markets.",
  },
  {
    id: "q6",
    prompt: "Why do time and risk make finance difficult?",
    choices: [
      {
        id: "tr",
        label:
          "Because cash flows occur at different times and future outcomes are uncertain.",
      },
      { id: "math", label: "Because finance uses too much math." },
      { id: "banks", label: "Because banks are complicated." },
    ],
    correctId: "tr",
    feedback:
      "Time shifts the value of money; risk makes future outcomes uncertain.",
  },
  {
    id: "q7",
    prompt:
      "Which principle warns against guaranteed high returns with no risk?",
    choices: [
      { id: "free", label: "There is no such thing as a free lunch." },
      { id: "now", label: "Individuals prefer money now." },
      { id: "self", label: "Agents act in their own self-interest." },
    ],
    correctId: "free",
    feedback:
      "High returns usually come with risk, cost, or hidden assumptions.",
  },
];

export default function AppliedDiagnostic({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const reduce = useReducedMotion();
  const done = Object.keys(answers).length === QUESTIONS.length;
  const correctCount = QUESTIONS.filter(
    (q) => answers[q.id] === q.correctId,
  ).length;

  const choose = (qid: string, cid: string) => {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: cid };
      if (Object.keys(next).length === QUESTIONS.length) onComplete?.();
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Applied diagnostic
            </span>
          </div>
          <span className="font-sans text-[12px] tabular-nums text-accent-cyan">
            {Object.keys(answers).length}/{QUESTIONS.length} answered
          </span>
        </div>
        <div className="mt-5 space-y-4">
          {QUESTIONS.map((q, qi) => {
            const picked = answers[q.id];
            const correct = picked === q.correctId;
            return (
              <div
                key={q.id}
                className={cn(
                  "rounded-xl border bg-white/[0.02] p-5",
                  picked
                    ? correct
                      ? "border-accent-green/50"
                      : "border-accent-red/50"
                    : "border-white/10",
                )}
              >
                <div className="flex items-start gap-3.5">
                  <span className="ops-caption mt-1 text-[10px] text-slate-500">
                    {String(qi + 1).padStart(2, "0")}
                  </span>
                  <p className="ops-body-strong text-[16px] text-slate-50">
                    {q.prompt}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 pl-9">
                  {q.choices.map((c) => {
                    const isPicked = picked === c.id;
                    const isCorrect = c.id === q.correctId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        disabled={picked !== undefined}
                        onClick={() => choose(q.id, c.id)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                          !picked &&
                            "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan",
                          picked &&
                            isCorrect &&
                            "border-accent-green bg-accent-green/15 text-accent-green",
                          picked &&
                            isPicked &&
                            !isCorrect &&
                            "border-accent-red bg-accent-red/15 text-accent-red",
                          picked &&
                            !isPicked &&
                            !isCorrect &&
                            "border-white/10 text-slate-500",
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                {picked && (
                  <div className="pl-8">
                    <Feedback status={correct ? "correct" : "incorrect"}>
                      {correct ? q.feedback : "Try again."}
                    </Feedback>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </InteractiveFrame>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "ops-interactive-frame p-6",
              correctCount === QUESTIONS.length
                ? "border-accent-green/40"
                : "border-accent-cyan/40",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 font-sans text-[12px] uppercase tracking-[0.14em]",
                  correctCount === QUESTIONS.length
                    ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                    : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
                )}
              >
                {correctCount === QUESTIONS.length
                  ? "Module complete"
                  : "Module complete"}{" "}
                · {correctCount}/{QUESTIONS.length} correct
              </span>
            </div>
            <p className="ops-definition mt-3 text-[16px]">
              You now have the core map of finance: value assets, manage
              decisions, account for time, account for risk, and understand how
              markets discover prices.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
