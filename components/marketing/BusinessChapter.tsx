"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

/**
 * Chapter 2 — The business behind the chart.
 *
 * Recomposed to let typography and the three metrics carry the section.
 * No skyline, no rectangles, no window dots, no decorative metaphor.
 *
 * Composition (top to bottom):
 *   - Massive white headline
 *   - Short readable supporting sentence (visually secondary)
 *   - Generous intentional negative space
 *   - Three large metrics anchored at the bottom, separated by alignment
 *     and a single quiet measurement line — not by visible cards
 *
 * Background: deep graphite with one subtle cyan radial atmosphere.
 *
 * Success criterion: if the background atmosphere were removed entirely,
 * the section would still feel strong. It does.
 */

const METRICS = [
  {
    label: "Revenue",
    value: "$24.6B",
    note: "+18% year over year",
    color: "#F5F5F7", // primary white — the headline metric
    accent: false,
  },
  {
    label: "Gross margin",
    value: "41.2%",
    note: "pricing power and mix",
    color: "#F5F5F7",
    accent: false,
  },
  {
    label: "Free cash flow",
    value: "$5.1B",
    note: "what the business produces",
    color: "#22d3ee", // the one focal cyan value — the metric that connects to value
    accent: true,
  },
] as const;

export default function BusinessChapter() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Reveal metrics progressively as the user scrolls into the section.
  const metric1 = useTransform(scrollYProgress, [0.15, 0.32], [0, 1]);
  const metric2 = useTransform(scrollYProgress, [0.22, 0.40], [0, 1]);
  const metric3 = useTransform(scrollYProgress, [0.30, 0.48], [0, 1]);
  // The quiet measurement line draws in after the metrics settle.
  const lineDraw = useTransform(scrollYProgress, [0.25, 0.55], [0, 1]);
  const metricOpacities = [metric1, metric2, metric3];

  return (
    <section ref={ref} className="hp-chapter hp-atmosphere-graphite">
      <div className="hp-canvas">
        {/* Headline + lead — anchored top, pure white */}
        <div className="max-w-[1100px]">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8 }}
            className="hp-section"
          >
            Behind every ticker is a business.
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15%" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="hp-lead mt-8"
          >
            Price begins with customers, operations, cash flow, and expectations.
          </motion.p>
        </div>

        {/* Three metrics — anchored lower, separated by alignment + one quiet line.
            No cards. No rectangles. The metrics themselves are the visual. */}
        <div className="mt-[18vh] sm:mt-[22vh] lg:mt-[28vh]">
          {/* Quiet horizontal measurement line — single subtle connector.
              Suggests "these are measured quantities" without being decorative. */}
          <div className="relative h-px w-full bg-white/8">
            <motion.div
              style={{ scaleX: lineDraw }}
              className="absolute left-0 top-0 h-px w-full origin-left bg-gradient-to-r from-accent-cyan/40 via-accent-cyan/20 to-transparent"
            />
          </div>

          <div className="mt-12 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-10 lg:gap-16">
            {METRICS.map((m, i) => (
              <motion.div
                key={m.label}
                style={{ opacity: metricOpacities[i] }}
                initial={reduce ? false : { y: 24 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="text-[15px] font-medium uppercase tracking-[0.06em] text-slate-400">
                  {m.label}
                </div>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="hp-numeric mt-3"
                  style={{
                    fontSize: "clamp(56px, 7vw, 104px)",
                    lineHeight: 0.95,
                    color: m.color,
                  }}
                >
                  {m.value}
                </motion.div>
                <div className="mt-4 text-[17px] text-slate-400 sm:text-[18px]">
                  {m.note}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
