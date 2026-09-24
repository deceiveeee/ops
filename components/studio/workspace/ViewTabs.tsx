"use client";

import { useRef, type KeyboardEvent } from "react";

/**
 * Buttons that switch what one area of a page shows, marked up as tabs.
 *
 * As plain buttons in a labelled box a screen reader announced neither the
 * label nor which view was open. As tabs it says how many there are and which
 * is selected, and the arrow keys, Home and End move between them, as on the
 * Goals page. A tab hidden at this width is skipped.
 *
 * The panel they control takes `role="tabpanel"`, the id `${idPrefix}-panel`
 * and `aria-labelledby` the selected tab's id, `${idPrefix}-tab-${id}`.
 */
export default function ViewTabs<T extends string>({
  label, idPrefix, tabs, selected, onSelect, className,
}: {
  label: string;
  idPrefix: string;
  tabs: readonly { id: T; label: string; className?: string }[];
  /** Null when the area shows something no tab stands for. */
  selected: T | null;
  onSelect: (id: T) => void;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = tabs.findIndex((tab) => tab.id === selected);
  const move = (event: KeyboardEvent, index: number) => {
    const shown = tabs.map((_, i) => i).filter((i) => refs.current[i]?.getClientRects().length);
    const at = shown.indexOf(index);
    const next =
      event.key === "ArrowRight" ? shown[(at + 1) % shown.length]
        : event.key === "ArrowLeft" ? shown[(at - 1 + shown.length) % shown.length]
          : event.key === "Home" ? shown[0]
            : event.key === "End" ? shown[shown.length - 1]
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    onSelect(tabs[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={className}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(element) => { refs.current[index] = element; }}
          id={`${idPrefix}-tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={index === current}
          aria-controls={index === current ? `${idPrefix}-panel` : undefined}
          // One stop in the tab order: the open tab, or the first when none is.
          tabIndex={index === (current < 0 ? 0 : current) ? 0 : -1}
          className={tab.className}
          onClick={() => onSelect(tab.id)}
          onKeyDown={(event) => move(event, index)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
