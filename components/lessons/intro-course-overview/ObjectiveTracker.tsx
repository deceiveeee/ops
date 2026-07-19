"use client";

import { cn } from "@/lib/utils";

export default function ObjectiveTracker({
  objectives,
  covered,
}: {
  objectives: readonly string[];
  covered: boolean[];
}) {
  const doneCount = covered.filter(Boolean).length;
  return (
    <div className="glass-panel p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="ops-eyebrow text-[11px] text-slate-400">
          Learning objectives
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] tabular-nums",
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
        {objectives.map((o, i) => {
          const done = covered[i];
          return (
            <li key={o} className="flex items-start gap-3.5">
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
              <span
                className={cn(
                  "ops-body text-[15px] leading-7",
                  done ? "text-slate-100" : "text-slate-300",
                )}
              >
                {o}
                {done && (
                  <span className="ml-2 inline-flex rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-accent-cyan">
                    Covered
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
