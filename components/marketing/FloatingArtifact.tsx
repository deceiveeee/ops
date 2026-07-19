"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * FloatingArtifact — a stacked, dimensional document slab.
 *
 * Concept: "the filing as a physical source object."
 * Multiple layered pages with offset shadows give the 10-K preview a
 * sculptural, object-like presence rather than a flat panel. Subtle
 * drift + hover lift. Pure CSS (transforms, gradients, shadows).
 */
export default function FloatingArtifact({
  className,
  children,
  pages = 3,
}: {
  className?: string;
  children: React.ReactNode;
  pages?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative ${className ?? ""}`}
    >
      {/* stacked back pages */}
      {Array.from({ length: pages }).map((_, i) => {
        const offset = (i + 1) * 6;
        const rot = (i % 2 === 0 ? 1 : -1) * (0.6 + i * 0.3);
        return (
          <div
            key={i}
            aria-hidden
            className="absolute inset-0 rounded-2xl border border-white/5 bg-ink-800/40"
            style={{
              transform: `translate(${offset}px, ${offset}px) rotate(${rot}deg)`,
              zIndex: -i - 1,
              opacity: 0.5 - i * 0.12,
            }}
          />
        );
      })}

      {/* front page */}
      <motion.div
        animate={reduce ? {} : { y: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        whileHover={reduce ? {} : { y: -8 }}
        className="relative rounded-2xl border border-white/10 bg-ink-900/60 shadow-panel backdrop-blur-md"
      >
        {/* top edge highlight — gives it dimension */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        {/* page corner fold */}
        <div className="pointer-events-none absolute right-0 top-0 h-8 w-8 rounded-tr-2xl bg-gradient-to-bl from-white/10 to-transparent" />
        {children}
      </motion.div>
    </motion.div>
  );
}
