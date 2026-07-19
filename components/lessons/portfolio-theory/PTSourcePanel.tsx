"use client";

import { PT_SOURCES } from "./shared";

export default function PTSourcePanel({ sources = PT_SOURCES }: { sources?: string[] }) {
  return (
    <aside
      aria-label="Sources and Notes"
      className="glass-panel relative overflow-hidden p-5 sm:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />
      <div className="ops-eyebrow flex items-center gap-2 text-[11px] text-slate-400">
        <span className="h-px w-6 bg-accent-cyan/50" />
        Sources and Notes
      </div>
      <ul className="mt-4 space-y-2.5">
        {sources.map((s) => (
          <li key={s} className="ops-muted flex items-start gap-2.5 text-[13px]">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan/60" aria-hidden />
            {s}
          </li>
        ))}
      </ul>
      <p className="ops-muted mt-4 text-[12px]">
        Lesson content is adapted from MIT 15.401 Lectures 13–14 for educational use. Historical GM and Motorola
        data are from 1946–2001 and are not current estimates.
      </p>
    </aside>
  );
}
