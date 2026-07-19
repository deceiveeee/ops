"use client";

import { cn } from "@/lib/utils";

/**
 * Readable formula rendering without a math dependency.
 * Compose formulas from small typographic primitives: Sup, Sub, Frac, Var.
 * Keeps formulas visually distinct from body copy and screen-reader friendly.
 */

export function Var({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("italic", className)}>{children}</span>;
}

export function Sub({ children }: { children: React.ReactNode }) {
  return <sub className="text-[0.7em] not-italic text-slate-300">{children}</sub>;
}

export function Sup({ children }: { children: React.ReactNode }) {
  return <sup className="text-[0.7em] not-italic text-slate-300">{children}</sup>;
}

/** Stacked fraction rendered with CSS so it reads like real math. */
export function Frac({ num, den }: { num: React.ReactNode; den: React.ReactNode }) {
  return (
    <span className="inline-flex flex-col items-center align-middle leading-none">
      <span className="px-1 pb-0.5">{num}</span>
      <span className="my-0.5 h-px w-full min-w-[1.5em] bg-slate-400/70" aria-hidden />
      <span className="px-1 pt-0.5">{den}</span>
    </span>
  );
}

export function FormulaCard({
  label,
  ariaLabel,
  children,
  className,
}: {
  label?: string;
  ariaLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("ops-interactive-frame relative overflow-hidden px-5 py-5 sm:px-6", className)}
      role="img"
      aria-label={ariaLabel ?? label}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent" />
      {label && (
        <div className="ops-caption mb-3 flex items-center gap-2 text-[11px] text-accent-cyan">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" aria-hidden />
          {label}
        </div>
      )}
      <div className="font-mono text-[17px] leading-relaxed text-slate-50 sm:text-[19px]">
        {children}
      </div>
    </div>
  );
}

/** A compact inline formula for use inside body copy. */
export function Inline({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex items-center rounded-md border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[0.92em] text-slate-100">
      {children}
    </span>
  );
}
