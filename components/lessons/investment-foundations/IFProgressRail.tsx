"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IF_MODULE_LESSONS } from "./shared";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

export default function IFProgressRail() {
  const pathname = usePathname();
  const activeSlug = pathname?.split("/").pop() ?? "";
  const { isComplete, ready } = useIFProgress();

  return (
    <nav
      aria-label="Investment Foundations Module 1 progress"
      className="glass-panel p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="ops-eyebrow text-[11px] text-slate-400">
          Investment Foundations · Module 1
        </span>
        <span className="ops-caption text-[10px] text-accent-amber">
          {IF_MODULE_LESSONS.length} lesson
          {IF_MODULE_LESSONS.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="ops-body-strong mt-1.5 text-[15px] text-white">
        Building an Investment Philosophy
      </div>
      <ol className="mt-5 space-y-2">
        {IF_MODULE_LESSONS.map((l) => {
          const active = l.slug === activeSlug;
          const done = ready && isComplete(l.slug);
          return (
            <li key={l.slug}>
              <Link
                href={`/lessons/${l.slug}`}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  active
                    ? "border-accent-amber/40 bg-accent-amber/10"
                    : "border-transparent hover:border-white/10 hover:bg-white/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[11px] tabular-nums",
                    active
                      ? "border-accent-amber bg-accent-amber/20 text-accent-amber"
                      : done
                        ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                        : "border-white/15 text-slate-400 group-hover:border-white/30 group-hover:text-slate-200",
                  )}
                >
                  {l.n}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 text-sm leading-snug",
                    active ? "text-white" : "text-slate-300 group-hover:text-white",
                  )}
                >
                  {l.shortTitle}
                </span>
                {done && (
                  <span className="ops-caption text-[10px] text-accent-green" aria-hidden>
                    ✓
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 border-t border-white/10 pt-4">
        <Link
          href="/courses/investment-foundations"
          className="ops-caption text-[11px] text-slate-400 hover:text-accent-amber"
        >
          ← Back to Investment Foundations
        </Link>
      </div>
    </nav>
  );
}
