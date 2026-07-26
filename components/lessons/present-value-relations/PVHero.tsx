"use client";

import { motion, useReducedMotion } from "motion/react";
import Button from "@/components/ui/Button";
import { MathText } from "@/components/ui/MathText";
import { LessonH1, BodyLead } from "@/components/lessons/typography";

export default function PVHero({
  index,
  eyebrow,
  heading,
  subheading,
  bullets,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref = "#module-map",
}: {
  index: string;
  eyebrow: string;
  heading: string;
  subheading: string;
  bullets?: string[];
  primaryLabel: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 terminal-grid opacity-30" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(34,211,238,0.10),transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl px-5 pt-16 pb-12 sm:px-8 sm:pt-28 sm:pb-16">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <LessonH1 index={index} eyebrow={eyebrow} className="mt-7">
            {heading}
          </LessonH1>
        </motion.div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
        >
          <BodyLead className="mt-6">{subheading}</BodyLead>
        </motion.div>

        {bullets && bullets.length > 0 && (
          <motion.ul
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: "easeOut" }}
            className="mt-7 grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2"
          >
            {bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5"
                style={{
                  fontSize: "var(--type-small-size)",
                  lineHeight: "var(--type-small-lh)",
                  color: "var(--ops-text-secondary)",
                }}
              >
                <span
                  className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: "var(--ops-accent-strong)" }}
                  aria-hidden
                />
                <MathText>{b}</MathText>
              </li>
            ))}
          </motion.ul>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button href={primaryHref ?? "#lesson-content"} size="lg">
            {primaryLabel}
          </Button>
          {secondaryLabel && (
            <Button href={secondaryHref} variant="secondary" size="lg">
              {secondaryLabel}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
