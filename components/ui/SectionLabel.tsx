import { cn } from "@/lib/utils";

export default function SectionLabel({
  index,
  eyebrow,
  className,
  tone = "cyan",
}: {
  index?: string;
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
    <div className={cn("flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em]", className)}>
      {index && <span className={cn("tabular-nums", toneCls)}>{index}</span>}
      <span className="h-px w-8 bg-white/20" />
      <span className="text-slate-400">{eyebrow}</span>
    </div>
  );
}
