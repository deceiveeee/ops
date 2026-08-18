"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * A radiogroup that follows the ARIA authoring practice, replacing the
 * hand-rolled pattern Missions 11 and 12 each carried a copy of.
 *
 * What was wrong with the old shape: every option was a `role="radio"` button
 * with its own tab stop, and the arrow keys did nothing. That is operable — a
 * keyboard user can reach and activate everything — but it is not what a screen
 * reader user is told to expect from a radiogroup, and a five-option group cost
 * five tab stops on the way to the next control.
 *
 * What this does instead:
 *  - **Roving tabindex.** Exactly one option is in the tab order: the selected
 *    one, or the first when nothing is selected yet. Tab enters and leaves the
 *    group in one press.
 *  - **Arrow keys move and select**, wrapping at both ends, as the practice
 *    specifies for a group where selection follows focus.
 *  - **Home and End** jump to the first and last option.
 *  - Enter and Space still select, because these are buttons.
 */
export type ChoiceOption<T extends string> = {
  id: T;
  label: string;
  hint?: string;
};

export default function ChoiceGroup<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  /** Accessible name for the group. */
  label: string;
  value: T | "" | null;
  onChange: (id: T) => void;
  options: readonly ChoiceOption<T>[];
  /** Layout for the group container — the two journeys stack or grid it. */
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = options.findIndex((o) => o.id === value);
  // Nothing selected yet still needs one reachable stop, or the group would be
  // skipped entirely by Tab.
  const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

  const move = (from: number, delta: number) => {
    const next = (from + delta + options.length) % options.length;
    onChange(options[next].id);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        move(index, 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        move(index, -1);
        break;
      case "Home":
        e.preventDefault();
        move(index, -index);
        break;
      case "End":
        e.preventDefault();
        move(index, options.length - 1 - index);
        break;
      default:
        break;
    }
  };

  return (
    <div role="radiogroup" aria-label={label} className={className ?? "space-y-2"}>
      {options.map((option, index) => {
        const checked = option.id === value;
        return (
          <button
            key={option.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "min-h-11 w-full rounded-xl border px-4 py-3 text-left transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              checked
                ? "border-accent-amber/60 bg-accent-amber/10"
                : "border-white/12 hover:border-white/25",
            )}
          >
            <span className="ops-body-strong block text-[15px] text-white">
              {option.label}
            </span>
            {option.hint ? (
              <span className="mt-1 block text-[13px] text-slate-400">
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
