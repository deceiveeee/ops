"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { StudioGuidance } from "@/lib/studio-guidance";

export const usd = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);

export const usdWhole = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export const pct = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-st-hair bg-st-paper p-5 sm:p-6", className)}>
      {children}
    </div>
  );
}

/**
 * The stage title. No eyebrow: the toolbar above already names the destination
 * and its position, and printing "Step 1" a second time 40px lower was the same
 * fact twice.
 */
export function StageHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div>
      <h2 className="ops-display text-2xl leading-tight text-st-ink sm:text-3xl">{title}</h2>
      {children ? <p className="ops-body mt-3 max-w-2xl text-[15px] leading-7 text-st-sub">{children}</p> : null}
    </div>
  );
}

/**
 * The stage's definition, shown above its controls rather than behind a link.
 *
 * Studio can be entered without taking Investment Foundations, so a term has to
 * be explained where it is first used. The worked example and glossary sit in a
 * disclosure so the explanation does not push the actual work off the screen.
 *
 * Not a card. As a tinted bordered panel this outranked the step heading
 * directly beneath it -- the page opened twice, and the louder of the two
 * openings was the preamble rather than the task. A rule and quieter type say
 * the same thing without competing, and remove one box from a screen that had
 * boxes inside boxes.
 */
export function GuidancePanel({ guidance }: { guidance: StudioGuidance }) {
  return (
    <div className="border-l-2 border-st-blue-edge pl-4 sm:pl-5">
      <div className="ops-caption text-[12px] text-st-blue">Before you start</div>
      <p className="ops-body mt-2 text-[15px] leading-7 text-st-sub">{guidance.definition}</p>
      {/* Only the definition stays open. The screen budget caps preamble at half
          a viewport, and the learner has to be able to act without scrolling. */}
      <details className="group mt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[13px] font-semibold text-st-blue">
          <span>How to do this, with an example</span>
          <span className="text-[12px] font-normal text-st-muted group-open:hidden">Show</span>
          <span className="hidden text-[12px] font-normal text-st-muted group-open:inline">Hide</span>
        </summary>
        <p className="ops-body mt-3 text-[14px] leading-6 text-st-sub">{guidance.action}</p>
        <p className="ops-body mt-3 text-[14px] leading-6 text-st-sub">{guidance.example}</p>
        <dl className="mt-3 space-y-2">
          {guidance.terms.map((term) => (
            <div key={term.term} className="text-[14px] leading-6">
              <dt className="inline font-semibold text-st-ink">{term.term}: </dt>
              <dd className="inline text-st-muted">{term.definition}</dd>
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
                className="text-[13px] text-st-muted underline decoration-white/20 underline-offset-2 hover:text-st-blue"
              >
                {source.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

type FieldProps = {
  label: string;
  hint?: string;
  value: string | number;
  onChange: (value: string) => unknown;
  type?: "text" | "number" | "date";
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
  // Browser storage acknowledges edits asynchronously. Keep keystrokes local
  // until the queued edits settle, so an earlier save cannot move the cursor
  // or replace the text being typed with an older value.
  const [input, setInput] = useState(String(value));
  const [settled, setSettled] = useState(0);
  const focused = useRef(false);
  const pending = useRef(0);
  useEffect(() => {
    if (!focused.current && pending.current === 0) setInput(String(value));
  }, [value, settled]);
  const edit = (raw: string) => {
    setInput(raw); pending.current += 1;
    void Promise.resolve(onChange(raw)).finally(() => {
      pending.current -= 1; setSettled((count) => count + 1);
    });
  };
  const focus = () => { focused.current = true; };
  const blur = () => { focused.current = false; setSettled((count) => count + 1); };
  const inputClass =
    "min-h-11 w-full rounded-lg border border-st-bound bg-st-paper px-3 py-2 text-[15px] text-st-ink placeholder:text-st-faint focus:border-st-blue-edge focus:outline-none focus-visible:ring-2 focus-visible:ring-st-blue-edge";
  /*
   * A unit belongs inside the control it qualifies, not beside it.
   *
   * Sitting outside, an affix was a flex sibling: it took width from the input,
   * so a row of "same" fields rendered at four different widths depending on
   * whether each had a `$` or a `%`. Inside, every control in a row is the
   * width of its column and the row finally has a rhythm. The padding scales
   * with the affix because a symbol and the word "years" need different room.
   */
  const affix = "pointer-events-none absolute inset-y-0 flex items-center text-[15px] text-st-muted";
  const pad = (text: string | undefined, side: "l" | "r") => {
    if (!text) return undefined;
    if (text.length <= 1) return side === "l" ? "pl-7" : "pr-7";
    if (text.length <= 3) return side === "l" ? "pl-10" : "pr-10";
    return side === "l" ? "pl-16" : "pr-16";
  };
  return (
    /*
     * `mt-auto` on the control is what makes a row of these line up. Labels and
     * hints are different heights from field to field -- one has a hint, its
     * neighbour does not, a third wraps to two lines -- so while the control
     * simply followed them in flow, four fields on one row sat at three
     * different heights.
     *
     * Deliberately without `h-full`. A grid stretches its direct children to
     * the row height already, which is the extra space `mt-auto` distributes;
     * `h-full` additionally resolved against auto-height parents when a field
     * was nested inside a wrapper, and pushed the control clean out of its
     * cell and over the row below. Left to `mt-auto` alone, a nested field just
     * has no slack to distribute and stays exactly where it was.
     */
    <div className="flex flex-col">
      <label htmlFor={id} className="block text-[13px] font-semibold text-st-ink">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-[12px] leading-5 text-st-faint">
          {hint}
        </p>
      ) : null}
      <div className={cn("relative flex items-center", multiline ? "mt-1.5" : "mt-auto pt-1.5")}>
        {prefix ? <span className={cn(affix, "left-3")}>{prefix}</span> : null}
        {multiline ? (
          <textarea
            id={id}
            rows={3}
            value={input}
            onFocus={focus}
            onBlur={blur}
            placeholder={placeholder}
            aria-describedby={hint ? hintId : undefined}
            onChange={(event) => edit(event.currentTarget.value)}
            className={cn(inputClass, "resize-y")}
          />
        ) : (
          <input
            id={id}
            type={type}
            inputMode={type === "number" ? "decimal" : undefined}
            value={input}
            onFocus={focus}
            onBlur={blur}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
            aria-describedby={hint ? hintId : undefined}
            onChange={(event) => edit(event.currentTarget.value)}
            className={cn(
              inputClass,
              type === "number" && "tabular-nums",
              pad(prefix, "l"),
              pad(suffix, "r"),
            )}
          />
        )}
        {suffix ? <span className={cn(affix, "right-3")}>{suffix}</span> : null}
      </div>
    </div>
  );
}

export function Choice<T extends string>({
  label, value, options, onChange,
}: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const id = useId();
  // Bottom-aligned for the same reason as Field, and without `h-full` for the
  // same reason too: it only holds when the control is a direct grid child.
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="block text-[13px] font-semibold text-st-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as T)}
        className="mt-auto min-h-11 w-full rounded-lg border border-st-bound bg-st-canvas px-3 py-2 text-[15px] text-st-ink focus:border-st-blue-edge focus:outline-none focus-visible:ring-2 focus-visible:ring-st-blue-edge"
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
    amber: "border-st-warn-edge bg-st-warn-soft text-st-warn",
    green: "border-st-good-edge bg-st-good-soft text-st-good",
    red: "border-st-bad-edge bg-st-bad-soft text-st-bad",
    slate: "border-st-bound bg-st-paper text-st-sub",
  } as const;
  return (
    <div className={cn("rounded-xl border p-4", tones[tone])} role={tone === "red" ? "alert" : undefined}>
      {title ? <div className="text-[14px] font-semibold">{title}</div> : null}
      <div className={cn("text-[14px] leading-6", title && "mt-1", tone !== "slate" && "text-st-body")}>{children}</div>
    </div>
  );
}

export function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div>
      <div className="ops-caption text-[11px] text-st-faint">{label}</div>
      <div className="mt-1 text-[18px] font-semibold tabular-nums text-st-ink">{value}</div>
      {detail ? <div className="mt-0.5 text-[12px] leading-5 text-st-faint">{detail}</div> : null}
    </div>
  );
}

/** Wraps a wide table so the page itself never scrolls sideways. */
export function TableScroll({ children }: { children: ReactNode }) {
  return <div className="-mx-1 overflow-x-auto px-1">{children}</div>;
}

/**
 * One labelled fact in a definition list. Used where several small facts have
 * to stay visibly distinct from each other — a foreign share's domicile,
 * exchange, listing form and reporting currency being the case it exists for.
 */
export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="text-[13px] text-st-faint">{label}</dt>
      <dd className="text-[13px] text-st-sub">{value}</dd>
    </div>
  );
}
