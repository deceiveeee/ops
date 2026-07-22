"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";

/**
 * Section 05 — Financial statements → cash flow.
 *
 * Progressive sequence: Customers → Revenue → Operating income →
 * Free cash flow → Value. Reveal one stage at a time through scroll.
 * Removed: MONEY MACHINE label, FLOW label, side decision-lever cards,
 * desktop/mobile duplicate copies, dashed particle animations.
 */
const STAGES = [
  { label: "Customers", value: "1.2M", note: "active subscriptions" },
  { label: "Revenue", value: "$24.6B", note: "+18% year over year" },
  { label: "Operating income", value: "$6.4B", note: "margin and scale" },
  { label: "Free cash flow", value: "$5.1B", note: "what the business produces" },
  { label: "Value", value: "$210B", note: "the market's collective estimate" },
] as const;

export default function MoneyMachine() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 20%"],
  });

  return (
    <section
      id="section-cashflow"
      ref={ref}
      className="hp-section-pad relative w-full overflow-hidden border-t border-white/5"
    >
      <div className="hp-container">
        <div className="hp-marker">05 / Cash flow</div>
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-section mt-5"
        >
          Follow how operations become cash flow.
        </motion.h2>
      </div>

      <div className="hp-container mt-16">
        <ol className="flex flex-col">
          {STAGES.map((s, i) => (
            <StageRow
              key={s.label}
              stage={s}
              index={i}
              total={STAGES.length}
              scrollYProgress={scrollYProgress}
              reduce={!!reduce}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function StageRow({
  stage,
  index,
  total,
  scrollYProgress,
  reduce,
}: {
  stage: (typeof STAGES)[number];
  index: number;
  total: number;
  scrollYProgress: MotionValue<number>;
  reduce: boolean;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.1), start, end, Math.min(1, end + 0.1)],
    [0.25, 1, 1, 0.45],
  );
  const x = useTransform(
    scrollYProgress,
    [Math.max(0, start - 0.1), start],
    reduce ? [0, 0] : [16, 0],
  );
  return (
    <li>
      <motion.div
        style={{ opacity, x }}
        className="flex items-baseline gap-6 border-t border-white/10 py-7 sm:gap-10 sm:py-9"
      >
        <span className="hp-marker w-8 flex-shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[22px] font-medium text-white sm:text-[28px]">
          {stage.label}
        </span>
        <span className="hp-numeric ml-auto text-[28px] text-accent-cyan sm:text-[40px]">
          {stage.value}
        </span>
        <span className="hidden max-w-[200px] text-right text-[14px] text-slate-500 sm:block">
          {stage.note}
        </span>
      </motion.div>
    </li>
  );
}
