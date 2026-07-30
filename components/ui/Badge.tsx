import { cn } from "@/lib/utils";

type Tone = "cyan" | "green" | "purple" | "amber" | "red" | "neutral";

const tones: Record<Tone, string> = {
  cyan: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
  green: "border-accent-green/30 bg-accent-green/10 text-accent-green",
  purple: "border-accent-purple/30 bg-accent-purple/10 text-accent-purple",
  amber: "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
  red: "border-accent-red/30 bg-accent-red/10 text-accent-red",
  neutral: "border-white/15 bg-white/5 text-slate-300",
};

export default function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-[0.18em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
