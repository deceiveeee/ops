"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { filingLines } from "@/data/marketing";

/**
 * Chapter 3 — Start with the source (10-K).
 *
 * Composition: warm off-white paper section with subtle grain texture.
 * A large tactile 10-K document occupies the right side. As the user
 * scrolls, the document lifts subtly (parallax) and the highlighted
 * passage deepens. Headline on the left; one margin annotation on the
 * document.
 *
 * One flagship visual = the document itself. No tabs, no chart, no
 * metric strip.
 */

const ACTIVE_LINE = filingLines[1]; // Risk Factors — most pedagogically interesting

export default function FilingSourceChapter() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const docY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const docRotate = useTransform(scrollYProgress, [0, 0.5, 1], [-0.6, 0, 0.6]);

  return (
    <section
      ref={ref}
      className="hp-chapter hp-paper-grain"
      style={{ background: "var(--ops-paper)" }}
    >
      <div className="hp-canvas">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
          {/* Left — headline + lead */}
          <div className="lg:pt-12">
            <motion.h2
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.8 }}
              className="hp-paper-headline"
            >
              Start with the source.
            </motion.h2>
            <p className="hp-paper-lead mt-8">
              The 10-K shows how the business operates, where the risks are,
              and how the cash is generated.
            </p>

            <div className="mt-12 border-t border-stone-300/60 pt-8">
              <div className="text-[14px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                Investor lens
              </div>
              <p className="mt-4 text-[clamp(20px,1.6vw,24px)] leading-[1.5] text-stone-700">
                {ACTIVE_LINE.note}
              </p>
            </div>

            <div className="mt-12 text-[15px] text-stone-500">
              The full OPS filing reader supports section pinning,
              hover-to-explain terms, and annotation layers across real SEC filings.
            </div>
          </div>

          {/* Right — large tactile 10-K document */}
          <motion.div
            style={{ y: docY, rotate: docRotate }}
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative"
          >
            <DocumentPage reduce={!!reduce} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function DocumentPage({ reduce }: { reduce: boolean }) {
  return (
    <article
      className="relative overflow-hidden rounded-[2px] bg-white shadow-[0_40px_120px_-30px_rgba(40,30,10,0.35),0_8px_30px_-10px_rgba(40,30,10,0.18)]"
      style={{ minHeight: "min(76vh, 720px)" }}
    >
      {/* Subtle paper inner texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.6  0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          mixBlendMode: "multiply",
        }}
        aria-hidden
      />

      {/* Document header */}
      <header className="relative flex items-center justify-between border-b border-stone-200 px-10 py-5">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-stone-500">
          Form 10-K · Annual Report
        </span>
        <span className="font-sans text-[13px] tabular-nums text-stone-400">
          Fiscal Year · Page 47
        </span>
      </header>

      {/* Document body */}
      <div className="relative px-10 py-12 sm:px-14 sm:py-16">
        <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-stone-500">
          Item {ACTIVE_LINE.id === "risk" ? "1A" : ACTIVE_LINE.id === "biz" ? "1" : ACTIVE_LINE.id === "mda" ? "7" : "8"} — {ACTIVE_LINE.section}
        </div>

        <h3 className="mt-4 text-[clamp(28px,2.6vw,40px)] font-semibold leading-[1.15] tracking-[-0.018em] text-stone-900">
          {ACTIVE_LINE.section}.
        </h3>

        {/* Body paragraph (decorative, italicized tone to feel like real document text) */}
        <p className="mt-8 text-[clamp(16px,1.2vw,18px)] leading-[1.7] text-stone-500">
          The following discussion summarizes the most significant factors
          affecting our results of operations and financial condition. It
          should be read together with our audited consolidated financial
          statements and the related notes included elsewhere in this
          Annual Report on Form 10-K.
        </p>

        {/* Highlighted excerpt — the focal passage */}
        <motion.blockquote
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative mt-8 border-l-[3px] border-amber-500 bg-amber-50/60 px-7 py-6"
        >
          {/* Highlight marker effect */}
          <span
            className="absolute inset-0 -z-10 bg-amber-200/30"
            style={{
              maskImage:
                "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
            aria-hidden
          />
          <p className="text-[clamp(20px,1.6vw,26px)] leading-[1.5] text-stone-900">
            “{ACTIVE_LINE.text}”
          </p>

          {/* Margin annotation with hand-drawn-feel connector */}
          <div className="mt-6 flex items-start gap-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              className="mt-0.5 flex-shrink-0 text-amber-700"
              aria-hidden
            >
              <path
                d="M14 4 L14 18 M9 14 L14 19 L19 14"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-[clamp(16px,1.2vw,19px)] leading-[1.55] text-stone-700">
              <span className="font-semibold text-amber-800">Why this matters:</span>{" "}
              {ACTIVE_LINE.note}
            </p>
          </div>
        </motion.blockquote>

        {/* Closing paragraph */}
        <p className="mt-8 text-[clamp(16px,1.2vw,18px)] leading-[1.7] text-stone-500">
          Management believes the items above represent the most material
          risks, results, and operational drivers relevant to an investor’s
          assessment of the company’s financial condition.
        </p>
      </div>

      {/* Page footer */}
      <footer className="relative flex items-center justify-between border-t border-stone-200 px-10 py-4 text-[12px] text-stone-400">
        <span>Annual Report on Form 10-K</span>
        <span className="font-sans tabular-nums">47</span>
      </footer>
    </article>
  );
}
