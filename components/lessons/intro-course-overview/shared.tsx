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
  emphasis = false,
}: {
  index: string;
  eyebrow: string;
  title: string;
  emphasis?: boolean;
}) {
  return (
    <div>
      <div className="ops-eyebrow flex items-center gap-3" style={{ fontSize: "var(--type-eyebrow-size)", fontWeight: 600, letterSpacing: "var(--type-eyebrow-track)" }}>
        <span className="tabular-nums" style={{ color: emphasis ? "var(--ops-accent-strong)" : "var(--ops-text-tertiary)" }}>{index}</span>
        <span className="h-px w-8" style={{ background: "var(--ops-surface-border)" }} />
        <span style={{ color: "var(--ops-text-tertiary)" }}>{eyebrow}</span>
      </div>
      <h2
        className="font-display mt-4"
        style={{
          fontSize: "var(--type-d-section-size)",
          lineHeight: "var(--type-d-section-lh)",
          letterSpacing: "var(--type-d-section-track)",
          fontWeight: 600,
          color: "var(--ops-text-primary)",
        }}
      >
        <MathText>{title}</MathText>
      </h2>
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-panel p-6 sm:p-7", className)}>
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
    <div
      className={cn("ops-definition-card p-6 sm:p-7", className)}
      style={{
        background: "var(--ops-surface)",
        border: "1px solid var(--ops-surface-border)",
        borderRadius: "16px",
      }}
    >
      {term && (
        <div
          style={{
            fontSize: "var(--type-eyebrow-size)",
            fontWeight: 600,
            letterSpacing: "var(--type-eyebrow-track)",
            color: "var(--ops-accent-strong)",
          }}
        >
          Definition · <MathText>{term}</MathText>
        </div>
      )}
      <div
        className="mt-2.5"
        style={{
          fontSize: "var(--type-definition-size)",
          lineHeight: "var(--type-definition-lh)",
          color: "var(--ops-text-secondary)",
        }}
      >
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
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1", className)}
      style={{
        background: "var(--ops-accent-soft)",
        border: "1px solid color-mix(in srgb, var(--ops-accent-strong) 25%, transparent)",
        fontSize: "var(--type-eyebrow-size)",
        fontWeight: 600,
        letterSpacing: "var(--type-eyebrow-track)",
        color: "var(--ops-accent-strong)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--ops-accent-strong)" }} aria-hidden />
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

const CONCEPT_STYLES: Record<ConceptKey, { bg: string; border: string; color: string; icon: string }> = {
  value:    { bg: "var(--ops-accent-soft)",           border: "var(--ops-accent-strong)",       color: "var(--ops-accent-strong)",       icon: "•" },
  time:     { bg: "var(--ops-accent-warm-soft)",      border: "var(--ops-accent-warm-strong)",  color: "var(--ops-accent-warm-strong)",  icon: "•" },
  risk:     { bg: "color-mix(in srgb, var(--ops-error-strong) 8%, transparent)",   border: "var(--ops-error-strong)",   color: "var(--ops-error-strong)",   icon: "⚠" },
  market:   { bg: "var(--ops-surface-2)",             border: "var(--ops-surface-border)",      color: "var(--ops-text-primary)",        icon: "◆" },
  cashflow: { bg: "color-mix(in srgb, var(--ops-success-strong) 8%, transparent)", border: "var(--ops-success-strong)", color: "var(--ops-success-strong)", icon: "+" },
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
  const s = CONCEPT_STYLES[concept];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1", CONCEPT_TEXT[concept], className)}
      style={{
        background: s.bg,
        border: `1px solid color-mix(in srgb, ${s.border} 25%, transparent)`,
        fontSize: "var(--type-eyebrow-size)",
        fontWeight: 600,
        letterSpacing: "var(--type-eyebrow-track)",
        color: s.color,
      }}
    >
      <span aria-hidden>{s.icon}</span>
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
    correct:   { label: "Correct",   token: "var(--ops-success-strong)" },
    incorrect: { label: "Try again", token: "var(--ops-error-strong)" },
    info:      { label: "Note",      token: "var(--ops-text-tertiary)" },
  } as const;
  const m = map[status];
  return (
    <div
      className="feedback mt-4 rounded-xl px-4 py-3.5"
      style={{
        background: `color-mix(in srgb, ${m.token} 8%, transparent)`,
        border: `1px solid color-mix(in srgb, ${m.token} 25%, transparent)`,
        color: m.token,
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center rounded-full border border-current px-2 py-0.5"
          style={{
            fontSize: "var(--type-eyebrow-size)",
            fontWeight: 600,
            letterSpacing: "var(--type-eyebrow-track)",
          }}
        >
          {status === "correct" && <span className="mr-1" aria-hidden>✓</span>}
          {m.label}
        </span>
      </div>
      <p
        className="mt-2.5"
        style={{
          fontSize: "var(--type-body-size)",
          lineHeight: "var(--type-body-lh)",
          color: "var(--ops-text-secondary)",
        }}
      >
        {children}
      </p>
    </div>
  );
}
