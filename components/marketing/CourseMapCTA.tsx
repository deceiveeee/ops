"use client";

import { motion, useReducedMotion } from "motion/react";
import Button from "@/components/ui/Button";

/**
 * Final CTA — calm and conclusive.
 *
 * Per spec: a large headline, one sentence, two CTAs, substantial negative
 * space. Removed: the full 01–09 Decoder Map, mobile/desktop duplicate maps,
 * DECODER MAP label, course-path explanation, additional slogan text.
 */
export default function CourseMapCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden border-t border-white/10 py-40 sm:py-56">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(34,211,238,0.05),transparent_60%)]" />
      <div className="hp-container text-center">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-hero mx-auto max-w-[900px]"
        >
          Don’t memorize finance.
          <br />
          <span className="text-accent-cyan">Decode it.</span>
        </motion.h2>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hp-lead mx-auto mt-7 text-balance"
        >
          Choose a course or enter the studio.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <Button href="/courses" size="lg">
            Explore courses
          </Button>
          <Button href="/studio" variant="outline" size="lg">
            Enter the studio
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
