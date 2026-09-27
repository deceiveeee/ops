"use client";

import Link from "next/link";
import type { CheckStatus, LimitCheck } from "@/lib/studio-project/limit-checks";
import { cn } from "@/lib/utils";

const MARK: Record<CheckStatus, { symbol: string; word: string; tone: string }> = {
  met: { symbol: "✓", word: "Met", tone: "text-accent-green" },
  "not-met": { symbol: "!", word: "Not met", tone: "text-accent-amber" },
  "not-checked": { symbol: "–", word: "Not checked", tone: "text-st-muted" },
};

/**
 * The portfolio against the learner's own limits.
 *
 * One line until opened -- its count of what is not met in amber -- because
 * open it is a screen of its own, which took the page past its screen budget
 * even beside the work, and each holding's own line already says what holds
 * it back. Each status is said in words as well as marked, since colour alone
 * tells a screen reader nothing.
 */
export default function LimitChecks({ checks }: { checks: LimitCheck[] }) {
  const count = (status: CheckStatus) => checks.filter((check) => check.status === status).length;
  const summary = [
    count("not-met") ? `${count("not-met")} not met` : null,
    count("met") ? `${count("met")} met` : null,
    count("not-checked") ? `${count("not-checked")} not checked` : null,
  ].filter(Boolean).join(" · ");
  return (
    <details className="group rounded-2xl border border-st-hair bg-st-paper px-5 sm:px-6">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ops-accent-strong)]">
        <span className="text-[14px] font-semibold text-st-ink">Your limits</span>
        <span className={cn("text-[13px]", count("not-met") ? "text-accent-amber" : "text-st-muted")}>
          {summary}
          <span aria-hidden="true" className="ml-2 inline-block transition-transform group-open:rotate-180">▾</span>
        </span>
      </summary>
      <ul className="space-y-3 pb-4">
        {checks.map((check) => {
          const mark = MARK[check.status];
          return (
            <li key={check.key} className="flex gap-3 text-[13px] leading-5">
              <span aria-hidden="true" className={cn("w-4 shrink-0 text-center font-semibold", mark.tone)}>{mark.symbol}</span>
              <div className="min-w-0">
                <p className="font-semibold text-st-ink">
                  {check.title} <span className={cn("font-normal", mark.tone)}>· {mark.word}</span>
                </p>
                <p className="text-st-sub">{check.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-st-hair py-3 text-[13px] text-st-muted">
        Set or change your limits on{" "}
        <Link href="/studio/goals" className="font-semibold text-accent-cyan underline underline-offset-2">Goals</Link>.
      </p>
    </details>
  );
}
