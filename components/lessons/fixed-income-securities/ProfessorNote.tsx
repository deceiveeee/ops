"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Reusable professor-style aside callout.
 * A bordered card with a "Professor's note" label and the children.
 * Used across Lesson 3.4 for short, opinionated teaching moments.
 */
const TONE: Record<
  "purple" | "amber" | "cyan",
  { border: string; label: string; dot: string }
> = {
  purple: {
    border: "border-accent-purple/30",
    label: "text-accent-purple",
    dot: "bg-accent-purple",
  },
  amber: {
    border: "border-accent-amber/30",
    label: "text-accent-amber",
    dot: "bg-accent-amber",
  },
  cyan: {
    border: "border-accent-cyan/30",
    label: "text-accent-cyan",
    dot: "bg-accent-cyan",
  },
};

export default function ProfessorNote({
  children,
  tone = "purple",
  className,
}: {
  children: ReactNode;
  tone?: "purple" | "amber" | "cyan";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const t = TONE[tone];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border bg-white/[0.03] p-5 sm:p-6",
        t.border,
        className,
      )}
    >
      <div
        className={cn(
          "ops-caption flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]",
          t.label,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} aria-hidden />
        Professor&apos;s note
      </div>
      <div className="ops-body mt-3 text-[15px] leading-7 text-slate-100">
        {children}
      </div>
    </motion.div>
  );
}
