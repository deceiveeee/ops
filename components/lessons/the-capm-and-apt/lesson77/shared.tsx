"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

/* ------------------------------------------------------------------ */
/* Completion-gate hook                                                */
/* ------------------------------------------------------------------ */

/**
 * Tracks a set of required answer keys. `mark(key)` records a resolved item;
 * once every key in `keys` has been marked, `onAll` fires once per completion.
 */
export function useResolvedGate(keys: string[], onAll: () => void) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const mark = useCallback(
    (k: string) => setDone((p) => (p[k] ? p : { ...p, [k]: true })),
    [],
  );
  const allDone = keys.every((k) => done[k]);
  useEffect(() => {
    if (allDone) onAll();
  }, [allDone, onAll]);
  return mark;
}

/* ------------------------------------------------------------------ */
/* Choice question — retry until correct, with targeted feedback.      */
/* ------------------------------------------------------------------ */

export type ChoiceOption = { id: string; label: ReactNode };
export type ChoiceItem = {
  id: string;
  prompt: ReactNode;
  options: ChoiceOption[];
  correctId: string;
  /** Feedback shown for a specific wrong option (keyed by option id). */
  optionFeedback?: Record<string, ReactNode>;
  /** Feedback shown when the correct option is chosen. */
  correctFeedback?: ReactNode;
  /** Generic feedback for an un-listed wrong option. */
  fallbackFeedback?: ReactNode;
};

/**
 * Single-select question that permits revision. A wrong selection shows
 * targeted feedback and stays selectable; a correct selection locks the
 * question and calls onResolved. Answers are never revealed before a
 * selection is made.
 */
export function ChoiceQuestion({
  item,
  onResolved,
  compact = false,
}: {
  item: ChoiceItem;
  onResolved?: (correct: boolean) => void;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);

  const choose = (id: string) => {
    if (resolved) return;
    setSelected(id);
    if (id === item.correctId) {
      setResolved(true);
      onResolved?.(true);
    } else {
      setWrongPicks((p) => (p.includes(id) ? p : [...p, id]));
    }
  };

  return (
    <div className={cn(compact ? "" : "rounded-xl border border-white/12 bg-white/[0.03] p-5")}>
      <div className="text-[16px] leading-[1.6] text-slate-200">{item.prompt}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {item.options.map((opt) => {
          const isSelected = selected === opt.id;
          const showCorrect = resolved && opt.id === item.correctId;
          const showWrong = isSelected && !resolved && opt.id !== item.correctId;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={resolved}
              onClick={() => choose(opt.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                !resolved && !isSelected && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                resolved && !showCorrect && !showWrong && opt.id !== item.correctId && "border-white/10 text-slate-500",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {selected && !resolved && (
        <div className="mt-3">
          <Feedback status="incorrect">
            {item.optionFeedback?.[selected] ?? item.fallbackFeedback ?? "Not quite — reconsider the relationship and try again."}
          </Feedback>
        </div>
      )}
      {resolved && item.correctFeedback && (
        <div className="mt-3">
          <Feedback status="correct">{item.correctFeedback}</Feedback>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small UI helpers                                                   */
/* ------------------------------------------------------------------ */

export function ProgressBadge({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[12px] uppercase tracking-[0.12em]",
        done
          ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
          : "border-white/15 text-slate-400",
      )}
    >
      {done ? "✓" : "○"}
      {label}
    </span>
  );
}

export function CategoryHeader({
  letter,
  title,
  done,
}: {
  letter: string;
  title: string;
  done: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span
        className={cn(
          "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border font-display text-[20px]",
          done
            ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
            : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
        )}
      >
        {letter}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">Category {letter}</div>
        <h3 className="ops-interactive-title text-[20px] text-white sm:text-[22px]">{title}</h3>
      </div>
      <ProgressBadge done={done} label={done ? "Complete" : "In progress"} />
    </div>
  );
}

/** A labelled data row used in problem setups (value + label). */
export function DatumRow({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 py-2 last:border-0">
      <span className="text-[14px] text-slate-400">{label}</span>
      <span className="font-mono text-[15px] tabular-nums text-slate-100">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Keyword-based written-response validation (concept based).          */
/* ------------------------------------------------------------------ */

export type ConceptCheck = {
  /** A group is satisfied if the text contains ANY of its keywords. */
  keywords: string[];
  /** Human label for targeted feedback when this concept is missing. */
  concept: string;
  /** Hint shown when this concept is absent. */
  hint: string;
};

export function evaluateConcepts(
  text: string,
  checks: ConceptCheck[],
): { complete: boolean; missing: ConceptCheck[] } {
  const lower = text.toLowerCase();
  const missing = checks.filter((c) => !c.keywords.some((k) => lower.includes(k.toLowerCase())));
  return { complete: missing.length === 0, missing };
}

/** Deterministic shuffle (so SSR and the first client render agree). */
export function seededSample<T>(arr: T[], n: number, seed: number): T[] {
  const pool = [...arr];
  let s = seed >>> 0 || 1;
  const rng = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

/** Memoize a sample so it does not change on re-render. */
export function useStableSample<T>(arr: T[], n: number, seed: number): T[] {
  return useMemo(() => seededSample(arr, n, seed), [arr, n, seed]);
}
