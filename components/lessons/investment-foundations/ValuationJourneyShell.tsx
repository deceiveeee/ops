"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

export type ValuationStage = {
  label: string;
  title: string;
  guide: string;
  instruction: string;
  next: string;
};

export type ValuationSceneProps = {
  onComplete: () => void;
};

export default function ValuationJourneyShell({
  lessonSlug,
  ariaLabel,
  stages,
  renderStage,
  finishHref = "/courses/investment-foundations",
  finishLabel = "Return to Investment Foundations",
  labLabel = "Guided valuation lab",
}: {
  lessonSlug: string;
  ariaLabel: string;
  stages: readonly ValuationStage[];
  renderStage: (stage: number, onComplete: () => void) => ReactNode;
  finishHref?: string;
  finishLabel?: string;
  /** Only string that is lab-specific; everything else here is generic. */
  labLabel?: string;
}) {
  const reduceMotion = useReducedMotion();
  const journeyRef = useRef<HTMLElement>(null);
  const { markComplete } = useIFProgress();
  const [activeStage, setActiveStage] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() =>
    stages.map(() => false),
  );

  const completeStage = useCallback((index: number) => {
    setCompleted((current) =>
      current[index]
        ? current
        : current.map((done, itemIndex) => (itemIndex === index ? true : done)),
    );
  }, []);

  // Record lesson completion as an effect rather than inside the state updater.
  // Updaters must be pure, and React may run them during the render phase.
  const lessonComplete = completed[stages.length - 1];
  useEffect(() => {
    if (lessonComplete) markComplete(lessonSlug);
  }, [lessonComplete, lessonSlug, markComplete]);

  const moveTo = (nextStage: number) => {
    setActiveStage(nextStage);
    window.requestAnimationFrame(() => {
      journeyRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const current = stages[activeStage];
  const currentComplete = completed[activeStage];
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
                {labLabel}
              </div>
              <div className="ops-body-strong mt-1 text-sm text-white">
                {progress} of {stages.length} stages complete
              </div>
            </div>
            <div className="text-sm tabular-nums text-accent-amber">
              {Math.round((progress / stages.length) * 100)}%
            </div>
          </div>

          <div
            className="mt-4 grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
            }}
            role="navigation"
            aria-label="Lesson stages"
          >
            {stages.map((stage, index) => {
              const available = index === 0 || completed[index - 1];
              const active = activeStage === index;
              const done = completed[index];
              return (
                <button
                  key={stage.label}
                  type="button"
                  disabled={!available}
                  onClick={() => moveTo(index)}
                  aria-label={`${stage.label}${done ? ", complete" : active ? ", current" : ""}`}
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
                    {stage.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_5%_0%,rgba(251,191,36,0.10),transparent_44%)] px-5 py-5 sm:px-7">
          <GuideMessage
            current={current}
            done={currentComplete}
            isLast={activeStage === stages.length - 1}
          />
        </div>

        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {/*
           * A changing `key` remounts the scene, and initial→animate supplies the
           * enter transition. AnimatePresence is deliberately not used here: with
           * reactStrictMode its exit bookkeeping never fires under `mode="wait"`,
           * which pins the journey on its first scene forever.
           */}
          <motion.div
            key={activeStage}
            initial={reduceMotion ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.24 }}
          >
            <div className="ops-caption text-[12px] text-accent-amber">
              Stage {activeStage + 1} of {stages.length} · {current.label}
            </div>
            <h2 className="ops-section-title mt-2 text-2xl sm:text-3xl">
              {current.title}
            </h2>
            <div className="mt-6">
              {renderStage(activeStage, () => completeStage(activeStage))}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => moveTo(Math.max(0, activeStage - 1))}
              disabled={activeStage === 0}
              className="order-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 disabled:cursor-default disabled:opacity-0 sm:order-1"
            >
              ← Previous stage
            </button>

            <div className="order-1 text-center sm:order-2 sm:max-w-xs">
              <div
                className={cn(
                  "ops-body-strong text-[14px]",
                  currentComplete ? "text-accent-green" : "text-slate-400",
                )}
              >
                {currentComplete
                  ? "Stage complete. The next stage uses this result."
                  : current.instruction}
              </div>
            </div>

            {activeStage < stages.length - 1 ? (
              <button
                type="button"
                onClick={() => moveTo(activeStage + 1)}
                disabled={!currentComplete}
                className="order-3 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
              >
                {current.next} →
              </button>
            ) : currentComplete ? (
              <Link
                href={finishHref}
                className="order-3 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-center text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20"
              >
                {finishLabel} →
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="order-3 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-500"
              >
                Complete this stage to finish
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
  isLast,
}: {
  current: ValuationStage;
  done: boolean;
  isLast: boolean;
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
            ? isLast
              ? `${current.label} complete. You have finished the lesson, and your valuation range is saved to the dossier.`
              : `${current.label} complete. The next stage builds directly on this result.`
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
