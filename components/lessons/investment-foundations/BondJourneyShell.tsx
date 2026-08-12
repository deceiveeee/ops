"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

export type BondJourneyStep = {
  label: string;
  title: string;
  guide: string;
  instruction: string;
  next: string;
};

export type BondSceneProps = {
  onComplete: () => void;
};

export default function BondJourneyShell({
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
  steps: readonly BondJourneyStep[];
  renderStep: (step: number, onComplete: () => void) => ReactNode;
  nextLesson?: { href: string; label: string };
  finishHref?: string;
  finishLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const journeyRef = useRef<HTMLElement>(null);
  const { markComplete } = useIFProgress();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() =>
    steps.map(() => false),
  );

  const completeStep = useCallback(
    (index: number) => {
      setCompleted((current) =>
        current.map((done, itemIndex) =>
          itemIndex === index ? true : done,
        ),
      );
      if (index === steps.length - 1) markComplete(lessonSlug);
    },
    [lessonSlug, markComplete, steps.length],
  );

  const moveTo = (nextStep: number) => {
    setActiveStep(nextStep);
    window.requestAnimationFrame(() => {
      journeyRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const current = steps[activeStep];
  const currentComplete = completed[activeStep];
  const progress = completed.filter(Boolean).length;

  return (
    <section
      id="lesson-journey"
      ref={journeyRef}
      className="scroll-mt-24"
      aria-label={ariaLabel}
    >
      <div className="ops-interactive-frame overflow-hidden p-0">
        <div className="border-b border-white/10 px-5 py-4 sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="ops-caption text-[12px] text-slate-400">
                Guided bond lab
              </div>
              <div className="ops-body-strong mt-1 text-sm text-white">
                {progress} of {steps.length} missions complete
              </div>
            </div>
            <div className="text-sm tabular-nums text-accent-amber">
              {Math.round((progress / steps.length) * 100)}%
            </div>
          </div>

          <div
            className="mt-4 grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
            role="navigation"
            aria-label="Lesson missions"
          >
            {steps.map((step, index) => {
              const available = index === 0 || completed[index - 1];
              const active = activeStep === index;
              const done = completed[index];
              return (
                <button
                  key={step.label}
                  type="button"
                  disabled={!available}
                  onClick={() => moveTo(index)}
                  aria-label={`${step.label}${done ? ", complete" : active ? ", current" : ""}`}
                  aria-current={active ? "step" : undefined}
                  className="group min-w-0 text-left disabled:cursor-not-allowed"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-colors",
                      done
                        ? "bg-accent-green"
                        : active
                          ? "bg-accent-amber"
                          : available
                            ? "bg-white/20 group-hover:bg-accent-amber/50"
                            : "bg-white/10",
                    )}
                  />
                  <span
                    className={cn(
                      "ops-caption mt-2 hidden truncate text-[12px] sm:block",
                      active
                        ? "text-accent-amber"
                        : done
                          ? "text-accent-green"
                          : "text-slate-500",
                    )}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_5%_0%,rgba(251,191,36,0.10),transparent_44%)] px-5 py-5 sm:px-7">
          <GuideMessage current={current} done={currentComplete} />
        </div>

        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {/* No mode="wait"/exit: under reactStrictMode the exit never fires,
              which pins the journey on its first scene. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={activeStep}
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.24 }}
            >
              <div className="ops-caption text-[12px] text-accent-amber">
                Mission {activeStep + 1} of {steps.length} · {current.label}
              </div>
              <h2 className="ops-section-title mt-2 text-2xl sm:text-3xl">
                {current.title}
              </h2>
              <div className="mt-6">
                {renderStep(activeStep, () => completeStep(activeStep))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => moveTo(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="order-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 disabled:cursor-default disabled:opacity-0 sm:order-1"
            >
              ← Previous mission
            </button>

            <div className="order-1 text-center sm:order-2 sm:max-w-xs">
              <div
                className={cn(
                  "ops-body-strong text-[14px]",
                  currentComplete ? "text-accent-green" : "text-slate-400",
                )}
              >
                {currentComplete
                  ? "Mission complete. The next activity uses this result."
                  : current.instruction}
              </div>
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
              <button
                type="button"
                disabled
                className="order-3 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-500"
              >
                Complete this mission to finish
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function GuideMessage({
  current,
  done,
}: {
  current: BondJourneyStep;
  done: boolean;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="flex items-start gap-3">
      <motion.div
        animate={
          reduceMotion || done
            ? undefined
            : {
                boxShadow: [
                  "0 0 0 0 rgba(251,191,36,0)",
                  "0 0 0 7px rgba(251,191,36,0.10)",
                  "0 0 0 0 rgba(251,191,36,0)",
                ],
              }
        }
        transition={{ duration: 2.4, repeat: Infinity }}
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
            : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
        )}
        aria-hidden
      >
        {done ? "✓" : <GuideMark />}
      </motion.div>
      <div className="min-w-0">
        <div className="ops-caption text-[12px] text-accent-amber">OPS Guide</div>
        <p className="ops-body mt-1 text-[15px] text-slate-200">
          {done
            ? `You completed ${current.label.toLowerCase()}. Keep this evidence; the next mission builds on it.`
            : current.guide}
        </p>
        <div className="mt-2 flex items-start gap-2 text-[14px] text-slate-400">
          <span className="text-accent-amber" aria-hidden>
            →
          </span>
          <span>{done ? current.next : current.instruction}</span>
        </div>
      </div>
    </div>
  );
}

function GuideMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5 15.5c2.2-5.6 4.8-8.4 7.7-8.4 2.4 0 4.5 1.5 6.3 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="6" cy="16" r="1.6" fill="currentColor" />
      <circle cx="13" cy="7" r="1.6" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function BondPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function MissionPrompt({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-4 text-[15px] leading-6 text-slate-200 sm:p-5">
      <span className="mr-2 text-accent-amber" aria-hidden>
        →
      </span>
      {children}
    </div>
  );
}

export function BondChoice({
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
          ? "border-accent-green/50 bg-accent-green/[0.08] text-white"
          : incorrect
            ? "border-accent-red/50 bg-accent-red/[0.07] text-slate-200"
            : selected
              ? "border-accent-amber/50 bg-accent-amber/10 text-white"
              : "border-white/10 bg-white/[0.025] text-slate-300 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function BondFeedback({
  correct,
  children,
}: {
  correct: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "mt-4 rounded-xl border px-4 py-3 text-[14px] leading-6",
        correct
          ? "border-accent-green/30 bg-accent-green/[0.06] text-slate-200"
          : "border-accent-red/30 bg-accent-red/[0.05] text-slate-300",
      )}
    >
      <span
        className={cn(
          "mr-2 font-semibold",
          correct ? "text-accent-green" : "text-accent-red",
        )}
      >
        {correct ? "Connected." : "Recheck the chain."}
      </span>
      {children}
    </div>
  );
}

export function Metric({
  label,
  value,
  tone = "amber",
}: {
  label: string;
  value: string;
  tone?: "amber" | "green" | "red" | "cyan";
}) {
  const toneClass = {
    amber: "text-accent-amber",
    green: "text-accent-green",
    red: "text-accent-red",
    cyan: "text-accent-cyan",
  }[tone];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="ops-caption text-[12px] text-slate-500">{label}</div>
      <div className={cn("mt-1 text-xl font-semibold tabular-nums", toneClass)}>
        {value}
      </div>
    </div>
  );
}
