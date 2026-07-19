"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";

const MAX_ATTEMPTS = 3;

type FieldStatus = "idle" | "correct" | "wrong" | "revealed";

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

function isCorrect(value: string, answer: number, tolerance: number): boolean {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) return false;
  return Math.abs(parsed - answer) <= tolerance;
}

function statusMeta(status: FieldStatus): { border: string; label: string; labelCls: string } {
  switch (status) {
    case "correct":
      return {
        border: "border-accent-green/60 focus-visible:ring-accent-green/40",
        label: "✓ Correct",
        labelCls: "text-accent-green",
      };
    case "wrong":
      return {
        border: "border-accent-red/60 focus-visible:ring-accent-red/40",
        label: "Try again",
        labelCls: "text-accent-red",
      };
    case "revealed":
      return {
        border: "border-accent-amber/60 focus-visible:ring-accent-amber/40",
        label: "Answer revealed",
        labelCls: "text-accent-amber",
      };
    default:
      return {
        border: "border-white/20 focus:border-accent-cyan/60 focus-visible:ring-accent-cyan/40",
        label: "",
        labelCls: "text-slate-500",
      };
  }
}

export type WorksheetField = {
  id: string;
  label: ReactNode;
  answer: number;
  tolerance?: number;
  unit?: string;
  prefix?: string;
  decimals?: number;
  hints?: string[];
  solution?: ReactNode;
};

export type WorksheetGroup = {
  heading?: ReactNode;
  hint?: ReactNode;
  fields: WorksheetField[];
};

/**
 * Grouped numeric worksheet with a SINGLE primary submit action. Groups are
 * labelled with plain typography (not nested cards). Provides field-specific
 * feedback, staged hints, solution reveal after the attempt limit, and an
 * interpretation step revealed once every field is correct or revealed.
 *
 * Correct fields are locked and never reset when another field is revised.
 */
export default function CalculationWorksheet({
  groups,
  prompt,
  interpretation,
  submitLabel = "Check answers",
  retryLabel = "Clear wrong answers",
  interpretationTone = "correct",
  onSolved,
  onReveal,
  className,
  extraOnSolved,
}: {
  groups: WorksheetGroup[];
  prompt?: ReactNode;
  /** Revealed once every field is correct OR all solutions are revealed. */
  interpretation?: ReactNode;
  submitLabel?: string;
  retryLabel?: string;
  interpretationTone?: "correct" | "info";
  onSolved?: () => void;
  onReveal?: () => void;
  className?: string;
  /** Extra content revealed alongside interpretation. */
  extraOnSolved?: ReactNode;
}) {
  const allFields = useMemo(() => groups.flatMap((g) => g.fields), [groups]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(allFields.map((f) => [f.id, ""])),
  );
  const [results, setResults] = useState<Record<string, FieldStatus>>({});
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const locked = solved || revealed;

  const check = () => {
    if (locked) return;
    const next = attempts + 1;
    setAttempts(next);
    const nextResults: Record<string, FieldStatus> = {};
    let every = true;
    for (const f of allFields) {
      const ok = isCorrect(values[f.id] ?? "", f.answer, f.tolerance ?? 0.05);
      if (ok) {
        nextResults[f.id] = "correct";
      } else {
        nextResults[f.id] = next >= MAX_ATTEMPTS ? "revealed" : "wrong";
        every = false;
      }
    }
    setResults(nextResults);
    if (every) {
      setSolved(true);
      onSolved?.();
    } else if (next >= MAX_ATTEMPTS) {
      setRevealed(true);
      onReveal?.();
    }
  };

  const clearWrong = () => {
    const clearedValues: Record<string, string> = { ...values };
    const clearedResults: Record<string, FieldStatus> = { ...results };
    for (const f of allFields) {
      if (clearedResults[f.id] === "wrong" || clearedResults[f.id] === undefined) {
        clearedValues[f.id] = "";
        delete clearedResults[f.id];
      }
    }
    setValues(clearedValues);
    setResults(clearedResults);
  };

  const reset = () => {
    setValues(Object.fromEntries(allFields.map((f) => [f.id, ""])));
    setResults({});
    setAttempts(0);
    setSolved(false);
    setRevealed(false);
  };

  const allCorrect = allFields.every((f) => results[f.id] === "correct");

  return (
    <div className={cn("space-y-7", className)}>
      {prompt !== undefined && (
        <p className="ops-body max-w-3xl text-[17px] leading-[1.7] text-slate-200">{prompt}</p>
      )}

      {groups.map((group, gi) => (
        <div key={gi} className="border-l border-white/10 pl-5 sm:pl-6">
          {group.heading !== undefined && (
            <div className="mb-1 font-mono text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
              {group.heading}
            </div>
          )}
          {group.hint !== undefined && (
            <p className="mb-4 max-w-2xl text-[15px] leading-[1.6] text-slate-400">{group.hint}</p>
          )}
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {group.fields.map((f) => {
              const st = results[f.id] ?? "idle";
              const fLocked = locked || st === "correct" || st === "revealed";
              const meta = statusMeta(st);
              const stagedHint =
                st === "wrong"
                  ? (f.hints ?? [])[Math.min(attempts - 1, (f.hints ?? []).length - 1)]
                  : undefined;
              return (
                <div key={f.id}>
                  <label
                    className="block text-[15px] leading-[1.5] text-slate-200"
                    htmlFor={`ws-${f.id}`}
                  >
                    {f.label}
                  </label>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <div className="relative inline-flex items-center">
                      {f.prefix && (
                        <span
                          className="pointer-events-none absolute left-3 font-mono text-[15px] text-slate-400"
                          aria-hidden
                        >
                          {f.prefix}
                        </span>
                      )}
                      <input
                        id={`ws-${f.id}`}
                        type="number"
                        inputMode="decimal"
                        value={values[f.id] ?? ""}
                        disabled={fLocked}
                        onChange={(e) => {
                          setValues((p) => ({ ...p, [f.id]: e.target.value }));
                          if (results[f.id] === "wrong") {
                            setResults((p) => ({ ...p, [f.id]: "idle" }));
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !locked) {
                            e.preventDefault();
                            check();
                          }
                        }}
                        aria-label={
                          typeof f.label === "string" ? f.label : `worksheet field ${f.id}`
                        }
                        aria-invalid={st === "wrong"}
                        className={cn(
                          "w-44 rounded-lg border bg-ink-950/60 py-2.5 font-mono text-[16px] text-slate-100 focus:outline-none focus-visible:ring-2 disabled:cursor-default",
                          f.prefix ? "pl-8" : "pl-3.5",
                          f.unit ? "pr-10" : "pr-3.5",
                          meta.border,
                        )}
                      />
                      {f.unit && (
                        <span
                          className="pointer-events-none absolute right-3 font-mono text-[15px] text-slate-400"
                          aria-hidden
                        >
                          {f.unit}
                        </span>
                      )}
                    </div>
                    {st !== "idle" && (
                      <span className={cn("font-mono text-[13px]", meta.labelCls)} aria-live="polite">
                        {st === "revealed"
                          ? `answer: ${f.prefix ?? ""}${fmt(f.answer, f.decimals ?? 2)}${f.unit ?? ""}`
                          : meta.label}
                      </span>
                    )}
                  </div>
                  {stagedHint && (
                    <p className="mt-2 max-w-md text-[15px] leading-[1.55] text-accent-red/90">
                      {stagedHint}
                    </p>
                  )}
                  {st === "revealed" && f.solution && (
                    <p className="mt-1 max-w-md text-[15px] leading-[1.55] text-slate-400">
                      {f.solution}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
        {!locked && (
          <button
            type="button"
            onClick={check}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-6 py-2.5 text-[15px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            {attempts === 0 ? submitLabel : "Check again"}
          </button>
        )}
        {!locked && attempts > 0 && attempts < MAX_ATTEMPTS && (
          <button
            type="button"
            onClick={clearWrong}
            className="rounded-full border border-white/15 px-5 py-2 text-[14px] text-slate-400 transition-colors hover:border-white/30 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            {retryLabel}
          </button>
        )}
        {locked && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/15 px-5 py-2 text-[14px] text-slate-400 transition-colors hover:border-white/30 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            Start over
          </button>
        )}
        {attempts > 0 && (
          <span
            className={cn(
              "font-mono text-[14px] tabular-nums",
              solved || allCorrect ? "text-accent-green" : "text-slate-400",
            )}
            aria-live="polite"
          >
            {solved || allCorrect
              ? "All correct"
              : `Attempt ${Math.min(attempts, MAX_ATTEMPTS)} of ${MAX_ATTEMPTS}`}
          </span>
        )}
      </div>

      {locked && interpretation && (
        <Feedback status={interpretationTone === "info" ? "info" : solved || allCorrect ? "correct" : "info"}>
          {interpretation}
        </Feedback>
      )}
      {locked && extraOnSolved}
    </div>
  );
}
