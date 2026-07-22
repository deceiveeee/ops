"use client";

import { useEffect, useState } from "react";

/**
 * Minimal progress indicator — replaces the old nine-step Decoder Journey.
 *
 * Desktop: a single quiet horizontal line.
 *   Price → Business → Filing → Cash Flow → Value → Portfolio
 *
 * Mobile: only the current position.
 *   02 / 06
 *   Price
 *
 * Uses sans-serif. No monospace section numbers, no cards, no paragraph.
 */

const STEPS = [
  "Price",
  "Business",
  "Filing",
  "Cash flow",
  "Value",
  "Portfolio",
] as const;

export default function ProgressIndicator() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = STEPS.map((s) => {
      // Map step name back to the section id used in DOM order.
      // We rely on the document order of major homepage sections.
      const idMap: Record<(typeof STEPS)[number], string> = {
        Price: "story",
        Business: "section-business",
        Filing: "section-filing",
        "Cash flow": "section-cashflow",
        Value: "section-value",
        Portfolio: "section-portfolio",
      };
      return document.getElementById(idMap[s]);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the viewport center.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const id = visible[0].target.id;
          const idx = STEPS.findIndex((s) => {
            const idMap: Record<(typeof STEPS)[number], string> = {
              Price: "story",
              Business: "section-business",
              Filing: "section-filing",
              "Cash flow": "section-cashflow",
              Value: "section-value",
              Portfolio: "section-portfolio",
            };
            return idMap[s] === id;
          });
          if (idx >= 0) setActive(idx);
        }
      },
      { threshold: [0.15, 0.4, 0.7], rootMargin: "-30% 0px -30% 0px" },
    );

    sections.forEach((s) => s && observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-label="Homepage progress"
      className="border-y border-white/5 bg-ink-950"
    >
      <div className="mx-auto max-w-6xl px-6 py-5 sm:px-8">
        {/* Desktop: single horizontal line */}
        <ol className="hidden items-center justify-between sm:flex">
          {STEPS.map((s, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={
                    isActive
                      ? "text-[14px] font-medium text-white"
                      : isDone
                        ? "text-[14px] font-medium text-slate-500"
                        : "text-[14px] font-medium text-slate-600"
                  }
                >
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className={
                      isDone
                        ? "h-px w-8 bg-slate-600 sm:w-12"
                        : "h-px w-8 bg-white/10 sm:w-12"
                    }
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Mobile: only current position */}
        <div className="flex items-baseline gap-3 sm:hidden">
          <span className="hp-marker tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
          <span className="text-[15px] font-medium text-white">
            {STEPS[active]}
          </span>
        </div>
      </div>
    </section>
  );
}
