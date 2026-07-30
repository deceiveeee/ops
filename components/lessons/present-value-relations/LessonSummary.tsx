"use client";

import Button from "@/components/ui/Button";
import { MathText } from "@/components/ui/MathText";

export default function LessonSummary({
  recapTitle = "Lesson summary",
  points,
  backLabel,
  backHref,
  replayLabel = "Replay this lesson",
  continueLabel,
  continueHref,
}: {
  recapTitle?: string;
  points: string[];
  backLabel?: string;
  backHref?: string;
  replayLabel?: string;
  continueLabel?: string;
  continueHref?: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-cyan/10 blur-3xl" />
      <div className="ops-eyebrow text-[11px] text-accent-cyan">{recapTitle}</div>
      <ol className="mt-6 space-y-3">
        {points.map((p, i) => (
          <li key={p} className="ops-body flex items-start gap-3 text-[16px] text-slate-200">
            <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-sans text-[12px] text-accent-cyan">
              {i + 1}
            </span>
            <MathText>{p}</MathText>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {backLabel && backHref && (
          <Button href={backHref} variant="outline" size="md">
            {backLabel}
          </Button>
        )}
        <Button href="#top" variant="ghost" size="md">
          {replayLabel}
        </Button>
        {continueLabel && continueHref && (
          <Button href={continueHref} size="md">
            {continueLabel}
          </Button>
        )}
      </div>
    </section>
  );
}
