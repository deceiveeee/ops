import { cn } from "@/lib/utils";
import { MathText } from "@/components/ui/MathText";

/**
 * Lesson opener H1 — Fraunces, used exactly once per lesson.
 * Spec §4.1 token: d-hero (60px / 1.05 / -0.02em / 600).
 */
export function LessonH1({
  children,
  eyebrow,
  index,
  className,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  index?: string | number;
  className?: string;
}) {
  return (
    <header className={className}>
      {(eyebrow || index !== undefined) && (
        <div className="ops-eyebrow flex items-center gap-3" style={{ fontSize: "var(--type-eyebrow-size)", fontWeight: 600, letterSpacing: "var(--type-eyebrow-track)" }}>
          {index !== undefined && (
            <span className="tabular-nums" style={{ color: "var(--ops-accent-strong)" }}>
              {index}
            </span>
          )}
          {index !== undefined && eyebrow && <span className="h-px w-8" style={{ background: "var(--ops-surface-border)" }} />}
          {eyebrow && <span style={{ color: "var(--ops-text-tertiary)" }}>{eyebrow}</span>}
        </div>
      )}
      <h1
        className="font-display mt-4"
        style={{
          fontSize: "var(--type-d-hero-size)",
          lineHeight: "var(--type-d-hero-lh)",
          letterSpacing: "var(--type-d-hero-track)",
          fontWeight: 600,
          color: "var(--ops-text-primary)",
        }}
      >
        <MathText>{children}</MathText>
      </h1>
    </header>
  );
}

/**
 * Major section H2 — Fraunces, at most three per lesson page.
 * Spec §4.1 token: d-section (38px / 1.1 / -0.015em / 600).
 */
export function LessonH2({
  children,
  index,
  emphasis = false,
  className,
}: {
  children: React.ReactNode;
  index?: string | number;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {index !== undefined && (
        <div
          className="tabular-nums mb-3"
          style={{
            fontSize: "var(--type-eyebrow-size)",
            fontWeight: 600,
            letterSpacing: "var(--type-eyebrow-track)",
            color: emphasis ? "var(--ops-accent-strong)" : "var(--ops-text-tertiary)",
          }}
        >
          {index}
        </div>
      )}
      <h2
        className="font-display"
        style={{
          fontSize: "var(--type-d-section-size)",
          lineHeight: "var(--type-d-section-lh)",
          letterSpacing: "var(--type-d-section-track)",
          fontWeight: 600,
          color: "var(--ops-text-primary)",
        }}
      >
        <MathText>{children}</MathText>
      </h2>
    </div>
  );
}

/**
 * Subsection H3 — Inter sans (contrasts Fraunces H2 above it).
 * Spec §4.2 token: t-subsection (22px / 1.25 / -0.01em / 600).
 */
export function Subsection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn("font-sans", className)}
      style={{
        fontSize: "var(--type-subsection-size)",
        lineHeight: "var(--type-subsection-lh)",
        letterSpacing: "var(--type-subsection-track)",
        fontWeight: 600,
        color: "var(--ops-text-primary)",
      }}
    >
      {children}
    </h3>
  );
}

/**
 * Lead paragraph — first paragraph after any head.
 * Spec §4.2 token: body-lead (20px / 1.6 / 0 / 400).
 */
export function BodyLead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("font-sans", className)}
      style={{
        fontSize: "var(--type-body-lead-size)",
        lineHeight: "var(--type-body-lead-lh)",
        color: "var(--ops-text-secondary)",
        maxWidth: "var(--width-prose)",
      }}
    >
      {children}
    </p>
  );
}

/**
 * Default body text. Width-capped to --width-prose.
 * Spec §4.2 token: body (18px / 1.65 / 0 / 400).
 */
export function BodyText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn("font-sans", className)}
      style={{
        fontSize: "var(--type-body-size)",
        lineHeight: "var(--type-body-lh)",
        color: "var(--ops-text-secondary)",
        maxWidth: "var(--width-prose)",
      }}
    >
      {children}
    </p>
  );
}
