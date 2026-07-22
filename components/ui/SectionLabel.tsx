import { cn } from "@/lib/utils";

/**
 * Quiet orientation marker.
 *
 * Old OPS pattern: "02 — PRICE IS ONLY THE SURFACE" (mono, uppercase, tracked).
 * New pattern: "02 / Price" (sans, normal case, tabular numerals).
 *
 * Kept deliberately small and visually subordinate so it never competes
 * with the section headline.
 */
export default function SectionLabel({
  index,
  eyebrow,
  className,
  tone = "cyan",
}: {
  index?: string | number;
  eyebrow: string;
  className?: string;
  tone?: "cyan" | "green" | "purple" | "amber" | "red";
}) {
  const toneCls = {
    cyan: "text-accent-cyan",
    green: "text-accent-green",
    purple: "text-accent-purple",
    amber: "text-accent-amber",
    red: "text-accent-red",
  }[tone];

  return (
    <div
      className={cn(
        "flex items-center gap-2 font-sans text-[14px] font-medium",
        className,
      )}
    >
      {index !== undefined && (
        <span className={cn("tabular-nums", toneCls)}>{index}</span>
      )}
      {index !== undefined && <span className="text-slate-600" aria-hidden>/</span>}
      <span className="text-slate-400">{eyebrow}</span>
    </div>
  );
}
