"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CAPM_MODULE_LESSONS, useCAPMProgress } from "@/lib/capm-progress";
import { cn } from "@/lib/utils";

export default function CAPMProgressRail() {
  const pathname = usePathname();
  const activeSlug = pathname?.split("/").pop() ?? "";
  const { isComplete } = useCAPMProgress();

  return (
    <nav aria-label="Module 7 progress" className="glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="ops-eyebrow text-[11px] text-slate-400">Module 7</span>
        <span className="ops-caption text-[10px] text-accent-cyan">5 lessons</span>
      </div>
      <div className="ops-body-strong mt-1.5 text-[15px] text-white">
        The CAPM and APT
      </div>
      <ol className="mt-5 space-y-2">
        {CAPM_MODULE_LESSONS.map((l) => {
          const active = l.slug === activeSlug;
          const done = isComplete(l.slug);
          return (
            <li key={l.slug}>
              <Link
                href={`/lessons/${l.slug}`}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                  active
                    ? "border-accent-cyan/40 bg-accent-cyan/10"
                    : "border-transparent hover:border-white/10 hover:bg-white/5",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[11px] tabular-nums",
                    active
                      ? "border-accent-cyan bg-accent-cyan/20 text-accent-cyan"
                      : done
                        ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                        : "border-white/15 text-slate-400 group-hover:border-white/30 group-hover:text-slate-200",
                  )}
                >
                  {l.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm leading-snug",
                      active ? "text-white" : "text-slate-300 group-hover:text-white",
                    )}
                  >
                    {l.shortTitle}
                  </span>
                </span>
                {done && <span className="ops-caption text-[10px] text-accent-green">✓</span>}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
