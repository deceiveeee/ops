"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

export type StatementInvestigationStep = {
  label: string;
  title: string;
  guide: string;
  instruction: string;
  next: string;
};

export type StatementSceneProps = { onComplete: () => void };

export default function StatementInvestigationShell({
  lessonSlug,
  ariaLabel,
  steps,
  renderStep,
  nextLesson,
  finishHref = "/courses/investment-foundations",
  finishLabel = "Return to Investment Foundations",
}: {
  lessonSlug: string;
  ariaLabel: string;
  steps: readonly StatementInvestigationStep[];
  renderStep: (step: number, onComplete: () => void) => ReactNode;
  nextLesson?: { href: string; label: string };
  finishHref?: string;
  finishLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const investigationRef = useRef<HTMLElement>(null);
  const { markComplete } = useIFProgress();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() => steps.map(() => false));

  const completeStep = useCallback(
    (index: number) => {
      setCompleted((current) =>
        current.map((done, itemIndex) => (itemIndex === index ? true : done)),
      );
      if (index === steps.length - 1) markComplete(lessonSlug);
    },
    [lessonSlug, markComplete, steps.length],
  );

  const moveTo = (nextStep: number) => {
    setActiveStep(nextStep);
    window.requestAnimationFrame(() => {
      investigationRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const current = steps[activeStep];
  const currentComplete = completed[activeStep];
  const completedCount = completed.filter(Boolean).length;

  return (
    <section
      id="statement-investigation"
      ref={investigationRef}
      className="scroll-mt-24"
      aria-label={ariaLabel}
    >
      <div className="ops-interactive-frame overflow-hidden p-0">
        <div className="border-b border-white/10 bg-white/[0.03] px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="ops-caption text-[12px] text-slate-500">Cedar Works · Filing investigation</div>
              <div className="ops-body-strong mt-1 text-sm text-white">
                Evidence file {activeStep + 1} of {steps.length}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm tabular-nums text-accent-amber">
                {completedCount}/{steps.length} verified
              </span>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-accent-amber"
                  animate={{ width: `${(completedCount / steps.length) * 100}%` }}
                  transition={{ duration: reduceMotion ? 0 : 0.25 }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="border-b border-white/10 bg-white/[0.03] p-3 lg:border-b-0 lg:border-r lg:p-4" aria-label="Evidence files">
            <ol className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {steps.map((step, index) => {
                const available = index === 0 || completed[index - 1];
                const active = index === activeStep;
                const done = completed[index];
                return (
                  <li key={step.label}>
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => moveTo(index)}
                      aria-current={active ? "step" : undefined}
                      className={cn(
                        "w-full rounded-xl border px-3 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                        active
                          ? "border-accent-amber/40 bg-accent-amber/10"
                          : done
                            ? "border-accent-green/30 bg-accent-green/[0.06]"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25",
                      )}
                    >
                      <span className={cn("ops-caption text-[12px]", active ? "text-accent-amber" : done ? "text-accent-green" : "text-slate-500")}>
                        {done ? "Verified" : `File ${index + 1}`}
                      </span>
                      <span className="mt-1 block text-[14px] leading-5 text-slate-200">{step.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="min-w-0">
            <div className="border-b border-white/10 bg-[radial-gradient(circle_at_0%_0%,rgba(251,191,36,0.08),transparent_36%),radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.07),transparent_42%)] px-5 py-5 sm:px-7">
              <div className="flex items-start gap-3">
                <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border", currentComplete ? "border-accent-green/40 bg-accent-green/10 text-accent-green" : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber")} aria-hidden>
                  {currentComplete ? "✓" : <ScanMark />}
                </div>
                <div>
                  <div className="ops-caption text-[12px] text-accent-amber">OPS filing guide</div>
                  <p className="ops-body mt-1 text-[15px] text-slate-200">
                    {currentComplete
                      ? `Evidence verified: ${current.label}. The next file now has the context it needs.`
                      : current.guide}
                  </p>
                  <p className="mt-2 text-[14px] text-slate-400">
                    {currentComplete ? current.next : current.instruction}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-h-[520px] px-5 py-6 sm:px-7 sm:py-8">
              {/* No mode="wait"/exit: under reactStrictMode the exit never fires,
                  which pins the investigation on its first evidence file. */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={activeStep}
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.22 }}
                >
                  <div className="ops-caption text-[12px] text-accent-amber">
                    Evidence file {activeStep + 1} · {current.label}
                  </div>
                  <h2 className="ops-section-title mt-2 text-2xl sm:text-3xl">{current.title}</h2>
                  <div className="mt-6">{renderStep(activeStep, () => completeStep(activeStep))}</div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-white/[0.03] px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => moveTo(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="order-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 disabled:cursor-default disabled:opacity-0 sm:order-1"
            >
              ← Previous file
            </button>
            <div className={cn("order-1 text-center text-[14px] sm:order-2", currentComplete ? "text-accent-green" : "text-slate-400")}>
              {currentComplete ? "Evidence saved to this investigation." : current.instruction}
            </div>
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => moveTo(activeStep + 1)}
                disabled={!currentComplete}
                className="order-3 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
              >
                {current.next} →
              </button>
            ) : currentComplete ? (
              <Link
                href={nextLesson?.href ?? finishHref}
                className="order-3 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-center text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20"
              >
                {nextLesson?.label ?? finishLabel} →
              </Link>
            ) : (
              <button type="button" disabled className="order-3 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-500">
                Verify this file to finish
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScanMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M5 4h14M5 20h14M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
    </svg>
  );
}

export function StatementPanel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5", className)}>{children}</div>;
}

export function DefinitionStrip({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="ops-definition-card p-4 sm:p-5">
      <div className="ops-caption text-[12px] text-accent-cyan">Definition · {term}</div>
      <p className="ops-definition mt-2 text-[15px] leading-6 text-white">{children}</p>
    </div>
  );
}

export function StatementChoice({
  children,
  selected,
  correct,
  incorrect,
  disabled,
  onClick,
}: {
  children: ReactNode;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left text-[14px] leading-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
        correct
          ? "border-accent-green/50 bg-accent-green/[0.06] text-white"
          : incorrect
            ? "border-accent-red/50 bg-accent-red/[0.05] text-slate-200"
            : selected
              ? "border-accent-amber/50 bg-accent-amber/10 text-white"
              : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function StatementFeedback({ correct, children }: { correct: boolean; children: ReactNode }) {
  return (
    <div role="status" className={cn("mt-4 rounded-xl border px-4 py-3 text-[14px] leading-6", correct ? "border-accent-green/30 bg-accent-green/[0.06] text-slate-200" : "border-accent-red/30 bg-accent-red/[0.05] text-slate-300")}>
      <span className={cn("mr-2 font-semibold", correct ? "text-accent-green" : "text-accent-red")}>
        {correct ? "Evidence connected." : "Recheck the filing."}
      </span>
      {children}
    </div>
  );
}

export function StatementMetric({ label, value, detail, tone = "default" }: { label: string; value: string; detail?: string; tone?: "default" | "amber" | "cyan" | "green" | "red" }) {
  const tones = {
    default: "border-white/10 text-white",
    amber: "border-accent-amber/30 text-accent-amber",
    cyan: "border-accent-cyan/30 text-accent-cyan",
    green: "border-accent-green/30 text-accent-green",
    red: "border-accent-red/30 text-accent-red",
  } as const;
  return (
    <div className={cn("rounded-xl border bg-white/[0.03] p-4", tones[tone])}>
      <div className="ops-caption text-[12px] text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {detail && <div className="mt-1 text-xs leading-5 text-slate-400">{detail}</div>}
    </div>
  );
}
