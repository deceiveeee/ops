"use client";

import AnswerCard from "./AnswerCard";
import type { Question } from "@/lib/onboarding/types";

export default function OnboardingQuestion({
  question,
  selectedValue,
  onSelect,
  onSkip,
}: {
  question: Question;
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
  onSkip: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <h2 className="font-display text-[36px] leading-[1.1] text-slate-50 md:text-[44px]">
        {question.prompt}
      </h2>
      {question.helper && (
        <p className="mt-3 text-[14px] tracking-[0.01em] text-slate-400">
          {question.helper}
        </p>
      )}
      <div
        role="radiogroup"
        aria-label={question.prompt}
        className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        {question.options.map((opt) => (
          <AnswerCard
            key={opt.id}
            option={opt}
            selected={selectedValue === opt.id}
            onSelect={() => onSelect(opt.id)}
          />
        ))}
      </div>
      {question.optional && (
        <div className="mt-8">
          <button
            type="button"
            onClick={onSkip}
            className="text-[14px] text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
