"use client";

import { cn } from "@/lib/utils";

function ObjectiveRow({
  text,
  done,
  tracked,
}: {
  text: string;
  done: boolean;
  /** False for objectives another lesson covers: listed, with no tick box. */
  tracked: boolean;
}) {
  return (
    <li className="flex items-start gap-3.5">
      {tracked ? (
        <span
          aria-hidden
          className={cn(
            "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border text-xs transition-colors",
            done
              ? "border-accent-cyan bg-accent-cyan/20 text-accent-cyan"
              : "border-white/20 text-transparent",
          )}
        >
          ✓
        </span>
      ) : (
        <span
          aria-hidden
          className="mt-[13px] h-1 w-1 flex-shrink-0 rounded-full bg-slate-400 ml-2.5 mr-2.5"
        />
      )}
      <span
        className={cn(
          "ops-body text-[15px] leading-7",
          done ? "text-slate-100" : "text-slate-300",
        )}
      >
        {text}
        {done && (
          <span className="ml-2 inline-flex rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2 py-0.5 font-sans text-[12px] tracking-[0.01em] text-accent-cyan">
            Covered
          </span>
        )}
      </span>
    </li>
  );
}

export default function ObjectiveTracker({
  objectives,
  covered,
  inThisLesson,
  intro,
}: {
  objectives: readonly string[];
  covered: boolean[];
  /**
   * Indexes of the objectives this lesson covers. When given, the tracker is a
   * one-line strip that counts only those and opens on tap, so the module's
   * full list no longer stands between the learner and the first activity.
   */
  inThisLesson?: readonly number[];
  /**
   * What the lesson covers, in a sentence, shown first when the strip opens.
   * It describes the lesson rather than teaching, so it sits with the
   * objectives instead of between two activities.
   */
  intro?: string;
}) {
  if (inThisLesson) {
    const doneCount = inThisLesson.filter((i) => covered[i]).length;
    const later = objectives
      .map((_, i) => i)
      .filter((i) => !inThisLesson.includes(i));
    return (
      <details className="glass-panel group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 sm:px-6 [&::-webkit-details-marker]:hidden">
          <span className="ops-eyebrow text-[13px] text-slate-400">
            Learning objectives
          </span>
          <span className="flex items-center gap-2.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 font-sans text-[12px] tabular-nums",
                doneCount === inThisLesson.length
                  ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                  : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
              )}
            >
              {doneCount} of {inThisLesson.length} covered
            </span>
            <svg
              aria-hidden
              viewBox="0 0 12 12"
              className="h-3 w-3 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180"
            >
              <path
                d="M2 4.5 6 8.5l4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </summary>
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          {intro ? (
            <p className="ops-body mb-3 text-[15px] text-slate-200">{intro}</p>
          ) : null}
          <p className="ops-body text-[15px] text-slate-300">
            By the end of this lesson, you should be able to:
          </p>
          <ul className="mt-4 space-y-4">
            {inThisLesson.map((i) => (
              <ObjectiveRow
                key={objectives[i]}
                text={objectives[i]}
                done={covered[i]}
                tracked
              />
            ))}
          </ul>
          {later.length > 0 && (
            <>
              <p className="ops-body mt-6 text-[15px] text-slate-300">
                By the end of this module, you should also be able to:
              </p>
              <ul className="mt-4 space-y-3">
                {later.map((i) => (
                  <ObjectiveRow
                    key={objectives[i]}
                    text={objectives[i]}
                    done={false}
                    tracked={false}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      </details>
    );
  }

  const doneCount = covered.filter(Boolean).length;
  return (
    <div className="glass-panel p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="ops-eyebrow text-[11px] text-slate-400">
          Learning objectives
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[11px] tabular-nums",
            doneCount === objectives.length
              ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
              : "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
          )}
        >
          {doneCount}/{objectives.length} covered
        </span>
      </div>
      <p className="ops-body mt-3 text-[15px] text-slate-300">
        By the end of this module, you should be able to:
      </p>
      <ul className="mt-6 space-y-4">
        {objectives.map((o, i) => (
          <ObjectiveRow key={o} text={o} done={covered[i]} tracked />
        ))}
      </ul>
    </div>
  );
}
