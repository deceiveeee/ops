"use client";

import { useEffect, useRef, useState } from "react";
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
  const options = question.options;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIdx = options.findIndex((o) => o.id === selectedValue);
  const tabStopIdx = selectedIdx === -1 ? 0 : selectedIdx;
  const [focusedIdx, setFocusedIdx] = useState(tabStopIdx);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    setFocusedIdx(tabStopIdx);
  }, [tabStopIdx]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const count = options.length;
    if (count === 0) return;
    let nextIdx: number;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      nextIdx = (focusedIdx + 1) % count;
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      nextIdx = (focusedIdx - 1 + count) % count;
    } else {
      return;
    }
    e.preventDefault();
    setFocusedIdx(nextIdx);
    cardRefs.current[nextIdx]?.focus();
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[36px] leading-[1.1] text-slate-50 outline-none md:text-[44px]"
      >
        {question.prompt}
      </h2>
      {question.helper && (
        <p className="mt-3 text-[15px] tracking-[0.01em] text-slate-300">
          {question.helper}
        </p>
      )}
      <div
        role="radiogroup"
        aria-label={question.prompt}
        onKeyDown={handleKeyDown}
        className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        {options.map((opt, i) => (
          <AnswerCard
            key={opt.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            option={opt}
            selected={selectedValue === opt.id}
            onSelect={() => onSelect(opt.id)}
            tabIndex={i === focusedIdx ? 0 : -1}
          />
        ))}
      </div>
      {question.optional && (
        <div className="mt-8">
          <button
            type="button"
            onClick={onSkip}
            className="text-[14px] text-slate-300 underline-offset-4 hover:text-slate-200 hover:underline"
          >
            Skip
          </button>
        </div>
      )}
    </div>
  );
}
