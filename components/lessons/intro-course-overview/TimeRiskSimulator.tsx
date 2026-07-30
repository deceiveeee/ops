"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Feedback, InteractiveFrame, TryItTag } from "./shared";
import { cn } from "@/lib/utils";

type Choice = { id: string; label: string };

export default function TimeRiskSimulator({
  onComplete,
}: {
  onComplete?: () => void;
}) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const STEPS: {
    prompt: string;
    choices: Choice[];
    reveal: string;
    correctId?: string;
  }[] = [
    {
      prompt: "Which would you rather receive?",
      choices: [
        { id: "today", label: "$100 today" },
        { id: "year", label: "$100 one year from now" },
      ],
      reveal:
        "Money today is usually more valuable because it can be used, saved, or invested immediately.",
      correctId: "today",
    },
    {
      prompt: "Which would you rather receive?",
      choices: [
        { id: "today", label: "$100 today" },
        { id: "year", label: "$110 one year from now" },
      ],
      reveal:
        "Now the decision depends on the return you require for waiting. This prepares the idea of present value, which later lessons will formalize.",
    },
    {
      prompt: "Which would you rather receive?",
      choices: [
        { id: "sure", label: "$100 for sure" },
        { id: "risk", label: "50% chance of $220 and 50% chance of $0" },
      ],
      reveal:
        "The risky option has an expected payoff of $110, but many people may still prefer the certain $100 because they dislike risk.",
      correctId: "sure",
    },
  ];

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const choose = (id: string) => {
    setPicked(id);
    if (isLast) onComplete?.();
  };

  const next = () => {
    setPicked(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Time &amp; Risk · decision simulator
          </span>
        </div>
        <span className="font-sans text-[12px] tabular-nums text-accent-cyan">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <p className="ops-body-strong text-[17px] text-slate-50">
            {cur.prompt}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            {cur.choices.map((c) => {
              const isPicked = picked === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => choose(c.id)}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-[15px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                    !picked &&
                      "border-white/20 text-slate-100 hover:border-accent-cyan hover:bg-accent-cyan/10 hover:text-accent-cyan",
                    picked &&
                      isPicked &&
                      "border-accent-cyan bg-accent-cyan/15 text-accent-cyan",
                    picked && !isPicked && "border-white/10 text-slate-500",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {picked && <Feedback status="info">{cur.reveal}</Feedback>}
        </motion.div>
      </AnimatePresence>

      {picked && !isLast && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={next}
            className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-5 py-2.5 text-[15px] text-accent-cyan transition-colors hover:bg-accent-cyan/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Next decision →
          </button>
        </div>
      )}
    </InteractiveFrame>
  );
}
