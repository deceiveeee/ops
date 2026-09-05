"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StudioGuidance } from "@/lib/studio-guidance";

export const usd = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

export const usdWhole = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export const pct = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}

export function StageHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div>
      <div className="ops-caption text-[12px] text-accent-amber">{eyebrow}</div>
      <h2 className="ops-display mt-2 text-2xl leading-tight text-white sm:text-3xl">{title}</h2>
      {children ? <p className="ops-body mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">{children}</p> : null}
    </div>
  );
}

/**
 * The stage's definition, shown above its controls rather than behind a link.
 *
 * Studio can be entered without taking Investment Foundations, so a term has to
 * be explained where it is first used. The worked example and glossary sit in a
 * disclosure so the explanation does not push the actual work off the screen.
 */
export function GuidancePanel({ guidance }: { guidance: StudioGuidance }) {
  return (
    <Panel className="border-accent-cyan/25 bg-accent-cyan/[0.05]">
      <div className="ops-caption text-[12px] text-accent-cyan">Before you start</div>
      <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">{guidance.definition}</p>
      {/* Only the definition stays open. The screen budget caps preamble at half
          a viewport, and the learner has to be able to act without scrolling. */}
      <details className="group mt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[13px] font-semibold text-accent-cyan">
          <span>How to do this, with an example</span>
          <span className="text-[12px] font-normal text-slate-400 group-open:hidden">Show</span>
          <span className="hidden text-[12px] font-normal text-slate-400 group-open:inline">Hide</span>
        </summary>
        <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">{guidance.action}</p>
        <p className="ops-body mt-3 text-[14px] leading-6 text-slate-300">{guidance.example}</p>
        <dl className="mt-3 space-y-2">
          {guidance.terms.map((term) => (
            <div key={term.term} className="text-[14px] leading-6">
              <dt className="inline font-semibold text-white">{term.term}: </dt>
              <dd className="inline text-slate-400">{term.definition}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-3 space-y-1">
          {guidance.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-slate-400 underline decoration-white/20 underline-offset-2 hover:text-accent-cyan"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </Panel>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  multiline?: boolean;
};

export function Field({
  label, hint, value, onChange, type = "text", prefix, suffix, min, max, step, placeholder, multiline,
}: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const inputClass =
    "min-h-11 w-full rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[15px] text-white placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40";
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-white">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-[12px] leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
      <div className="mt-1.5 flex items-center gap-2">
        {prefix ? <span className="text-[15px] text-slate-400">{prefix}</span> : null}
        {multiline ? (
          <textarea
            id={id}
            rows={2}
            value={value}
            placeholder={placeholder}
            aria-describedby={hint ? hintId : undefined}
            onChange={(event) => onChange(event.currentTarget.value)}
            className={cn(inputClass, "resize-y")}
          />
        ) : (
          <input
            id={id}
            type={type}
            inputMode={type === "number" ? "decimal" : undefined}
            value={value}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            aria-describedby={hint ? hintId : undefined}
            onChange={(event) => onChange(event.currentTarget.value)}
            className={cn(inputClass, type === "number" && "tabular-nums")}
          />
        )}
        {suffix ? <span className="text-[15px] text-slate-400">{suffix}</span> : null}
      </div>
    </div>
  );
}

export function Choice<T extends string>({
  label, value, options, onChange,
}: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-white">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as T)}
        className="mt-1.5 min-h-11 w-full rounded-lg border border-white/12 bg-ink-900 px-3 py-2 text-[15px] text-white focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** An unresolved issue, stated rather than blocking. Unknown stays visibly unknown. */
export function Notice({
  tone = "amber", title, children,
}: { tone?: "amber" | "green" | "red" | "slate"; title?: string; children: ReactNode }) {
  const tones = {
    amber: "border-accent-amber/30 bg-accent-amber/[0.07] text-accent-amber",
    green: "border-accent-green/30 bg-accent-green/[0.07] text-accent-green",
    red: "border-accent-red/30 bg-accent-red/[0.07] text-accent-red",
    slate: "border-white/12 bg-white/[0.03] text-slate-300",
  } as const;
  return (
    <div className={cn("rounded-xl border p-4", tones[tone])} role={tone === "red" ? "alert" : undefined}>
      {title ? <div className="text-[14px] font-semibold">{title}</div> : null}
      <div className={cn("text-[14px] leading-6", title && "mt-1", tone !== "slate" && "text-slate-200")}>{children}</div>
    </div>
  );
}

export function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div>
      <div className="ops-caption text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 text-[18px] font-semibold tabular-nums text-white">{value}</div>
      {detail ? <div className="mt-0.5 text-[12px] leading-5 text-slate-500">{detail}</div> : null}
    </div>
  );
}

/** Wraps a wide table so the page itself never scrolls sideways. */
export function TableScroll({ children }: { children: ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}
