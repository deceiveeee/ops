"use client";

import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Feedback } from "./shared";

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

function inputBorder(status: FieldStatus): string {
  switch (status) {
    case "correct":
      return "border-accent-green/60 focus-visible:ring-accent-green/40";
    case "wrong":
      return "border-accent-red/60 focus-visible:ring-accent-red/40";
    case "revealed":
      return "border-accent-amber/60 focus-visible:ring-accent-amber/40";
    default:
      return "border-white/15 focus:border-accent-cyan/50 focus-visible:ring-accent-cyan/30";
  }
}

/**
 * Single numeric answer field with tolerance-based validation, staged hints,
 * and solution reveal after MAX_ATTEMPTS wrong attempts.
 *
 * Flow: type → check → feedback (correct / wrong+hint) → revise → reveal.
 */
export function AnswerInput({
  label,
  answer,
  tolerance = 0.05,
  unit = "%",
  prefix,
  hints = [],
  solution,
  decimals = 2,
  ariaLabel,
  className,
}: {
  label: ReactNode;
  answer: number;
  tolerance?: number;
  unit?: string;
  prefix?: string;
  hints?: string[];
  solution?: ReactNode;
  decimals?: number;
  ariaLabel?: string;
  className?: string;
}) {
  const [value, setValue] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<FieldStatus>("idle");

  const locked = status === "correct" || status === "revealed";

  const check = () => {
    if (locked || value === "") return;
    const next = attempts + 1;
    setAttempts(next);
    if (isCorrect(value, answer, tolerance)) {
      setStatus("correct");
    } else if (next >= MAX_ATTEMPTS) {
      setStatus("revealed");
    } else {
      setStatus("wrong");
    }
  };

  const reset = () => {
    setValue("");
    setAttempts(0);
    setStatus("idle");
  };

  const stagedHint =
    status === "wrong"
      ? hints[Math.min(attempts - 1, hints.length - 1)]
      : undefined;

  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/[0.02] p-4", className)}>
      <label className="ops-body block text-[15px] leading-6 text-slate-200">
        {label}
      </label>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <div className="relative inline-flex items-center">
          {prefix && (
            <span
              className="pointer-events-none absolute left-3 font-sans text-[14px] text-slate-400"
              aria-hidden
            >
              {prefix}
            </span>
          )}
          <input
            type="number"
            inputMode="decimal"
            value={value}
            disabled={locked}
            onChange={(e) => {
              setValue(e.target.value);
              if (status === "wrong") setStatus("idle");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") check();
            }}
            aria-label={ariaLabel ?? (typeof label === "string" ? label : "numeric answer")}
            className={cn(
              "w-36 rounded-lg border bg-ink-950/60 py-2 font-sans text-[15px] text-slate-100 focus:outline-none focus-visible:ring-2 disabled:cursor-default",
              prefix ? "pl-7" : "pl-3",
              unit ? "pr-8" : "pr-3",
              inputBorder(status),
            )}
          />
          {unit && (
            <span
              className="pointer-events-none absolute right-3 font-sans text-[14px] text-slate-400"
              aria-hidden
            >
              {unit}
            </span>
          )}
        </div>
        {!locked && (
          <button
            type="button"
            onClick={check}
            disabled={value === ""}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[13px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-default disabled:opacity-50"
          >
            {attempts === 0 ? "Check" : "Check again"}
          </button>
        )}
        {locked && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/15 px-3 py-2 text-[12px] text-slate-400 transition-colors hover:border-white/30 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            Reset
          </button>
        )}
        <span className="ops-caption font-sans text-[11px] text-slate-500">
          Attempt {Math.min(attempts + (locked ? 0 : 1), MAX_ATTEMPTS)} of {MAX_ATTEMPTS}
        </span>
      </div>

      {status === "correct" && (
        <Feedback status="correct">
          Correct — the value is{" "}
          <span className="font-sans">
            {prefix}
            {fmt(answer, decimals)}
            {unit}
          </span>
          .
        </Feedback>
      )}
      {status === "wrong" && (
        <Feedback status="incorrect">
          {stagedHint ?? `Not quite — try again. (${attempts}/${MAX_ATTEMPTS} attempts used)`}
        </Feedback>
      )}
      {status === "revealed" && (
        <Feedback status="incorrect">
          The answer is{" "}
          <span className="font-sans text-accent-amber">
            {prefix}
            {fmt(answer, decimals)}
            {unit}
          </span>
          .{solution && <span className="mt-1 block text-slate-300">{solution}</span>}
        </Feedback>
      )}
    </div>
  );
}

export interface WorksheetField {
  id: string;
  label: ReactNode;
  answer: number;
  tolerance?: number;
  unit?: string;
  prefix?: string;
  decimals?: number;
  hints?: string[];
}

/**
 * Multi-field numeric worksheet with a single check button. Tracks attempts
 * across all fields; reveals solutions after MAX_ATTEMPTS failed checks and
 * exposes interpretation/visualize content once solved.
 */
export function AnswerWorksheet({
  fields,
  title = "Worksheet",
  prompt,
  interpretation,
  children,
  className,
}: {
  fields: WorksheetField[];
  title?: string;
  prompt?: ReactNode;
  /** Revealed once every field is correct OR solutions are revealed. */
  interpretation?: ReactNode;
  /** Extra visualize content (charts, comparisons) revealed alongside interpretation. */
  children?: ReactNode;
  className?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.id, ""])),
  );
  const [results, setResults] = useState<Record<string, FieldStatus>>({});
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const allCorrect = useMemo(
    () => fields.every((f) => results[f.id] === "correct"),
    [fields, results],
  );

  const locked = solved || revealed;

  const check = () => {
    if (locked) return;
    const next = attempts + 1;
    setAttempts(next);
    const nextResults: Record<string, FieldStatus> = {};
    let every = true;
    for (const f of fields) {
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
    } else if (next >= MAX_ATTEMPTS) {
      setRevealed(true);
    }
  };

  const reset = () => {
    setValues(Object.fromEntries(fields.map((f) => [f.id, ""])));
    setResults({});
    setAttempts(0);
    setSolved(false);
    setRevealed(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {prompt && (
        <p className="ops-body text-[15px] leading-7 text-slate-200">{prompt}</p>
      )}
      <div className="grid grid-cols-1 gap-3">
        {fields.map((f) => {
          const st = results[f.id] ?? "idle";
          const fLocked = locked || st === "correct" || st === "revealed";
          const hint =
            st === "wrong"
              ? (f.hints ?? [])[Math.min(attempts - 1, (f.hints ?? []).length - 1)]
              : undefined;
          return (
            <div
              key={f.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <label className="ops-body block text-[14px] leading-6 text-slate-200">
                {f.label}
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <div className="relative inline-flex items-center">
                  {f.prefix && (
                    <span className="pointer-events-none absolute left-3 font-sans text-[14px] text-slate-400" aria-hidden>
                      {f.prefix}
                    </span>
                  )}
                  <input
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
                    aria-label={
                      typeof f.label === "string" ? f.label : `worksheet field ${f.id}`
                    }
                    className={cn(
                      "w-36 rounded-lg border bg-ink-950/60 py-2 font-sans text-[15px] text-slate-100 focus:outline-none focus-visible:ring-2 disabled:cursor-default",
                      f.prefix ? "pl-7" : "pl-3",
                      f.unit ? "pr-8" : "pr-3",
                      inputBorder(st),
                    )}
                  />
                  {f.unit && (
                    <span className="pointer-events-none absolute right-3 font-sans text-[14px] text-slate-400" aria-hidden>
                      {f.unit}
                    </span>
                  )}
                </div>
                {st === "correct" && (
                  <span className="ops-caption font-sans text-[12px] text-accent-green">
                    ✓ correct
                  </span>
                )}
                {st === "revealed" && (
                  <span className="ops-caption font-sans text-[12px] text-accent-amber">
                    answer: {f.prefix}
                    {fmt(f.answer, f.decimals ?? 2)}
                    {f.unit}
                  </span>
                )}
              </div>
              {st === "wrong" && hint && (
                <p className="ops-body mt-2 text-[13px] leading-6 text-accent-red/90">{hint}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!locked && (
          <button
            type="button"
            onClick={check}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-5 py-2.5 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            {attempts === 0 ? `Check ${title.toLowerCase()}` : "Check again"}
          </button>
        )}
        {locked && (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-white/15 px-4 py-2 text-[13px] text-slate-400 transition-colors hover:border-white/30 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
          >
            Start over
          </button>
        )}
        {attempts > 0 && (
          <span
            className={cn(
              "ops-caption font-sans text-[12px]",
              solved ? "text-accent-green" : "text-slate-500",
            )}
          >
            {solved
              ? "All correct"
              : `Attempt ${Math.min(attempts, MAX_ATTEMPTS)}/${MAX_ATTEMPTS}`}
          </span>
        )}
      </div>

      {locked && interpretation && (
        <Feedback status={solved ? "correct" : "info"}>
          {interpretation}
        </Feedback>
      )}
      {locked && children}
    </div>
  );
}
