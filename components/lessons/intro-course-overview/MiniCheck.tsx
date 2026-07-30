"use client";

import { useState, type ReactNode } from "react";
import { Feedback } from "./shared";
import { cn } from "@/lib/utils";

export type MiniCheckChoice = { id: string; label: string };

export default function MiniCheck({
  question,
  choices,
  correctId,
  feedback,
}: {
  question: ReactNode;
  choices: MiniCheckChoice[];
  correctId: string;
  feedback: ReactNode;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const correct = picked === correctId;

  return (
    <div className="ops-interactive-frame p-5">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-2.5 py-1 font-sans text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
          Check
        </span>
        <span className="ops-caption text-[11px] text-slate-500">
          Mini-check
        </span>
      </div>
      <p className="ops-body-strong mt-3 text-[16px] text-slate-50">
        {question}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {choices.map((c) => {
          const isPicked = picked === c.id;
          const isCorrect = c.id === correctId;
          return (
            <button
              key={c.id}
              type="button"
              disabled={answered}
              onClick={() => setPicked(c.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default",
                !answered &&
                  "border-white/20 text-slate-100 hover:border-accent-cyan hover:text-accent-cyan",
                answered &&
                  isCorrect &&
                  "border-accent-green bg-accent-green/15 text-accent-green",
                answered &&
                  isPicked &&
                  !isCorrect &&
                  "border-accent-red bg-accent-red/15 text-accent-red",
                answered &&
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
      {answered && (
        <Feedback status={correct ? "correct" : "incorrect"}>
          {correct
            ? feedback
            : "Not quite. Re-read the section, then try again."}
        </Feedback>
      )}
    </div>
  );
}
