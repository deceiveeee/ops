"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LessonTakeaway({
  takeaway,
  points,
  nextSlug,
  nextLabel,
  finishModule = false,
}: {
  takeaway: string;
  points: string[];
  nextSlug?: string;
  nextLabel?: string;
  finishModule?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-cyan/10 blur-3xl" />
      <div className="ops-eyebrow text-[11px] text-accent-cyan">
        Lesson takeaway
      </div>
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="ops-display mt-4 text-2xl leading-snug sm:text-3xl md:text-[2.25rem]"
      >
        {takeaway}
      </motion.p>
      <ul className="mt-7 space-y-3">
        {points.map((p) => (
          <li
            key={p}
            className="ops-body flex items-start gap-3 text-[16px] text-slate-200"
          >
            <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {nextSlug && nextLabel && (
          <Button href={`/lessons/${nextSlug}`} size="md">
            {nextLabel}
          </Button>
        )}
        {finishModule && (
          <Button
            href="/courses/finance-foundations#module-2"
            variant="outline"
            size="md"
          >
            Finish Module → Continue to Present Value
          </Button>
        )}
      </div>
    </section>
  );
}
