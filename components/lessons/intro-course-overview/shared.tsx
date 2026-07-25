"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/ui/MathText";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
}: {
  index: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <div className="ops-eyebrow flex items-center gap-3 text-xs">
        <span className="tabular-nums text-accent-cyan">{index}</span>
        <span className="h-px w-8 bg-white/25" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="ops-section-title mt-4 text-3xl leading-tight sm:text-4xl">
        <MathText>{title}</MathText>
      </h2>
    </div>
  );
}

export function Panel({
  children,
  className,
  tone = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={
        tone === "light"
          ? `rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-800 sm:p-7 ${className ?? ""}`
          : `glass-panel p-6 sm:p-7 ${className ?? ""}`
      }
    >
      {children}
    </div>
  );
}

/** Elevated, readable surface for the core definition of a section. */
export function DefinitionCard({
  term,
  children,
  className,
}: {
  term?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`ops-definition-card p-5 sm:p-6 ${className ?? ""}`}>
      {term && (
        <div className="ops-caption text-[11px] text-accent-cyan">
          Definition · <MathText>{term}</MathText>
        </div>
      )}
      <div className="ops-definition mt-2.5 text-[17px] sm:text-lg">
        {children}
      </div>
    </div>
  );
}

/** Frame that distinguishes interactive panels from static explanation cards. */
export function InteractiveFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ops-interactive-frame p-6 sm:p-7", className)}>
      {children}
    </div>
  );
}

/** Small concept-colored "Interactive / Try it" marker. */
export function TryItTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-cyan",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" aria-hidden />
      Try it
    </span>
  );
}

export type ConceptKey = "value" | "time" | "risk" | "market" | "cashflow";

const CONCEPT_TEXT: Record<ConceptKey, string> = {
  value: "concept-value",
  time: "concept-time",
  risk: "concept-risk",
  market: "concept-market",
  cashflow: "concept-cashflow",
};

/** Colored tag whose color communicates a finance concept. */
export function ConceptTag({
  concept = "value",
  children,
  className,
}: {
  concept?: ConceptKey;
  children: React.ReactNode;
  className?: string;
}) {
  const color = {
    value: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
    time: "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
    risk: "border-accent-red/30 bg-accent-red/10 text-accent-red",
    market: "border-accent-purple/30 bg-accent-purple/10 text-accent-purple",
    cashflow: "border-accent-green/30 bg-accent-green/10 text-accent-green",
  }[concept];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em]",
        color,
        CONCEPT_TEXT[concept],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Feedback({
  status,
  children,
}: {
  status: "correct" | "incorrect" | "info";
  children: React.ReactNode;
}) {
  const map = {
    correct: {
      label: "Correct",
      cls: "border-accent-green/40 bg-accent-green/10 text-accent-green",
    },
    incorrect: {
      label: "Try again",
      cls: "border-accent-red/40 bg-accent-red/10 text-accent-red",
    },
    info: { label: "Note", cls: "border-white/15 bg-white/5 text-slate-200" },
  } as const;
  const m = map[status];
  return (
    <div className={`mt-4 rounded-xl border px-4 py-3.5 ${m.cls}`}>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-current px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.14em] opacity-90">
          {status === "correct" && (
            <span className="mr-1" aria-hidden>
              ✓
            </span>
          )}
          {m.label}
        </span>
      </div>
      <p className="ops-body mt-2.5 text-[15px] leading-7 text-slate-100">
        {children}
      </p>
    </div>
  );
}
