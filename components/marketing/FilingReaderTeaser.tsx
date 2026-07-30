"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { filingLines } from "@/data/marketing";
import { cn } from "@/lib/utils";

/**
 * Section 04 — 10-K filing reader.
 *
 * One selected section, one excerpt, one Investor Lens annotation.
 * Removed: duplicate document map, multi-section navigation chips,
 * FORM 10-K · ANNUAL REPORT · MOCK header, all Investor Lens annotations
 * shown at once.
 */
const SECTIONS = filingLines.map((l) => l.section);

export default function FilingReaderTeaser() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const line = filingLines[active];

  return (
    <section
      id="section-filing"
      className="hp-section-pad relative w-full overflow-hidden border-t border-white/5"
    >
      <div className="hp-container">
        <div className="hp-marker">04 / Filing</div>
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-section mt-5"
        >
          Real investors read source documents.
        </motion.h2>
        <p className="hp-lead mt-6">
          Use the 10-K to examine the business, risks, management commentary,
          and cash flow.
        </p>

        {/* Tabs — sans-serif */}
        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-b border-white/10 pb-3">
          {SECTIONS.map((s, i) => {
            const isActive = i === active;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={isActive}
                className={cn(
                  "text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40 rounded-md",
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-300",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* One excerpt + one annotation */}
        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div>
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={line.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="border-l border-accent-amber/40 pl-6"
              >
                <p className="font-sans text-[20px] leading-relaxed text-slate-100 sm:text-[22px]">
                  {line.text}
                </p>
                <footer className="mt-4 text-[13px] text-slate-500">
                  <span className="font-sans tabular-nums">
                    10-K · L{String(active + 1).padStart(2, "0")}
                  </span>
                  <span className="mx-2 text-slate-700">·</span>
                  <span>{line.section}</span>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div>
            <div className="text-[13px] font-medium uppercase tracking-[0.06em] text-accent-cyan">
              Investor lens
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={line.id}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="mt-3 hp-body max-w-md"
              >
                {line.note}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
