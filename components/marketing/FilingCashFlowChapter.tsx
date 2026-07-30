"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { filingLines, moneyFlow } from "@/data/marketing";
import { cn } from "@/lib/utils";

/**
 * Chapter 3 — Filing + Cash Flow.
 *
 * A deliberate tonal contrast section. Warm paper background, dark ink text.
 * A large 10-K document occupies the central canvas. Selecting a section
 * reveals the excerpt + one Investor Lens annotation. Below the document,
 * a spatial flow connects Customers → Revenue → Operating income →
 * Free cash flow → Value, revealed progressively.
 */

const SECTIONS = filingLines.map((l) => l.section);

const FLOW_STAGES = [
  { label: "Customers", value: "1.2M", note: "active subscriptions" },
  { label: "Revenue", value: "$24.6B", note: "+18% year over year" },
  { label: "Operating income", value: "$6.4B", note: "margin and scale" },
  { label: "Free cash flow", value: "$5.1B", note: "what the business produces" },
  { label: "Value", value: "$210B", note: "the market's collective estimate" },
] as const;

export default function FilingCashFlowChapter() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const line = filingLines[active];

  return (
    <section
      id="section-filing"
      className="hp-chapter"
      style={{ background: "var(--ops-paper)" }}
    >
      <div className="hp-canvas">
        {/* Headline */}
        <div className="max-w-[1000px]">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.7 }}
            className="hp-paper-headline"
          >
            Start with the source.
          </motion.h2>
          <p className="hp-paper-lead mt-8">
            The 10-K explains how the company operates, where the risks are, and
            how accounting earnings become cash.
          </p>
        </div>

        {/* Large document + side annotation */}
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
          {/* Document panel */}
          <div
            className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]"
            style={{ minHeight: "460px" }}
          >
            {/* Document header bar */}
            <div className="flex items-center justify-between border-b border-black/10 bg-[#FAF7F0] px-7 py-4">
              <span className="text-[14px] font-medium uppercase tracking-[0.06em] text-stone-500">
                Form 10-K · Annual Report
              </span>
              <span className="font-sans text-[13px] tabular-nums text-stone-400">
                L{String(active + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Document navigation tabs */}
            <div className="flex flex-wrap gap-x-8 gap-y-1 border-b border-black/10 px-7 pt-5">
              {SECTIONS.map((s, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className={cn(
                      "border-b-2 pb-3 text-[18px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40",
                      isActive
                        ? "border-cyan-600 text-stone-900"
                        : "border-transparent text-stone-400 hover:text-stone-700",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {/* Active excerpt */}
            <div className="px-7 py-10 sm:px-10 sm:py-12">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={line.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="text-[22px] leading-[1.5] text-stone-800 sm:text-[26px] sm:leading-[1.45]">
                    “{line.text}”
                  </p>
                </motion.blockquote>
              </AnimatePresence>
            </div>
          </div>

          {/* Side annotation */}
          <div className="flex flex-col">
            <div className="text-[14px] font-semibold uppercase tracking-[0.06em] text-cyan-700">
              Investor lens
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={line.id}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="hp-paper-body mt-4 text-[19px] leading-[1.5] text-stone-700"
              >
                {line.note}
              </motion.p>
            </AnimatePresence>

            <div className="mt-10 border-t border-black/10 pt-6">
              <div className="text-[14px] font-semibold uppercase tracking-[0.06em] text-stone-500">
                Sections
              </div>
              <p className="hp-paper-body mt-3 text-stone-600">
                The full OPS filing reader supports section pinning, hover-to-explain
                terms, and annotation layers across real SEC filings.
              </p>
            </div>
          </div>
        </div>

        {/* Cash-flow transformation — large spatial flow */}
        <div className="mt-32">
          <div className="max-w-[820px]">
            <h3 className="text-[clamp(32px,3.5vw,56px)] font-semibold leading-[1.05] tracking-[-0.025em] text-stone-900">
              From customers to value.
            </h3>
            <p className="hp-paper-lead mt-6">
              Each transformation in the income statement is a decision with a
              financial consequence. Cash flow is what the business actually produces.
            </p>
          </div>

          {/* Spatial stage layout — progressively revealed */}
          <ol className="mt-16 grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-x-6">
            {FLOW_STAGES.map((s, i) => (
              <motion.li
                key={s.label}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-sans text-[14px] tabular-nums text-stone-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] font-medium uppercase tracking-[0.04em] text-stone-500">
                    {s.label}
                  </span>
                </div>
                <div className="hp-numeric mt-3 text-stone-900" style={{ fontSize: "clamp(36px, 4vw, 56px)", lineHeight: 1 }}>
                  {s.value}
                </div>
                <p className="mt-3 text-[15px] leading-relaxed text-stone-600">{s.note}</p>
                {i < FLOW_STAGES.length - 1 && (
                  <span
                    className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-stone-400 lg:block"
                    aria-hidden
                  >
                    →
                  </span>
                )}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
