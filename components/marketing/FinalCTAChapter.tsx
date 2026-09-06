"use client";

import { motion, useReducedMotion } from "motion/react";
import Button from "@/components/ui/Button";

/**
 * Chapter 6 — Final CTA.
 *
 * Centered, calm, minimal. One large white headline, one readable
 * supporting sentence, two CTAs. A single restrained cyan line beneath
 * the headline is the only visual echo — not a chart, not a dashboard.
 */
export default function FinalCTAChapter() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative w-full overflow-hidden border-t border-white/10 hp-atmosphere-deep"
      style={{
        paddingTop: "clamp(140px, 22vh, 280px)",
        paddingBottom: "clamp(140px, 22vh, 280px)",
      }}
    >
      <div className="hp-canvas-narrow relative z-10 text-center">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 16, filter: "blur(12px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9 }}
          className="hp-hero mx-auto"
        >
          Don’t memorize finance.
          <br />
          Understand how it connects.
        </motion.h2>

        {/* Single restrained cyan accent — one stroke only */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-10 h-px w-24 origin-center bg-accent-cyan"
          aria-hidden
        />

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="hp-lead mx-auto mt-10 text-balance"
        >
          Build the foundation, then apply it in the portfolio studio.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-4"
        >
          <Button href="/courses" size="lg">
            Explore courses
          </Button>
          <Button href="/plan" variant="outline" size="lg">
            Open your plan
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
