"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { QuestionOption } from "@/lib/onboarding/types";

type AnswerCardProps = {
  option: QuestionOption;
  selected: boolean;
  onSelect: () => void;
  tabIndex?: number;
};

const AnswerCard = forwardRef<HTMLButtonElement, AnswerCardProps>(
  function AnswerCard({ option, selected, onSelect, tabIndex }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        tabIndex={tabIndex}
        className={cn(
          "group w-full rounded-xl border px-5 py-4 text-left transition-all duration-200",
          "border-white/10 bg-white/[0.02] hover:border-accent-cyan/40 hover:bg-white/[0.04]",
          selected &&
            "border-accent-cyan bg-accent-cyan/[0.06] shadow-[0_0_0_1px_rgba(34,211,238,0.35)]",
        )}
      >
        <span
          className={cn(
            "font-sans text-[16px] tracking-[-0.005em]",
            selected ? "text-slate-50" : "text-slate-200",
          )}
        >
          {option.label}
        </span>
      </button>
    );
  },
);

export default AnswerCard;
