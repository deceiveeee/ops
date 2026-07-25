"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { InteractiveFrame, TryItTag, DefinitionCard } from "./shared";
import { InlineMath } from "./shared";
import { MathText } from "@/components/ui/MathText";

/**
 * THE key conceptual component of the lesson.
 * Splits capital R_t (one-year rate for one slice of time) from lowercase
 * r_{0,T} (one annualized rate for the whole interval 0 to T).
 * TOP ROW: R1, R2, R3 ... R_T year-by-year blocks.
 * BOTTOM ROW: r_{0,T} spanning the whole timeline.
 */
const T = 5;

export default function RateNotationSplitScreen() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<"R" | "r" | null>(null);

  return (
    <div className="space-y-6">
      <DefinitionCard term="Two different rate objects">
        Capital <InlineMath>{"R_t"}</InlineMath> is a one-year rate for{" "}
        <span className="text-accent-purple">one slice of time</span>. Lowercase{" "}
        <InlineMath>{"r_{0,T}"}</InlineMath> is one annualized rate for the{" "}
        <span className="text-accent-cyan">whole interval 0 to T</span>.
      </DefinitionCard>

      <InteractiveFrame>
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Capital R vs lowercase r
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          One slice of time vs. one rate for the whole stretch
        </h4>

        {/* Split visual */}
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-5">
          <div className="min-w-[560px] space-y-7">
            {/* TOP ROW — year-by-year R blocks */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-accent-purple/40 bg-accent-purple/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-purple">
                  Capital R · one slice each
                </span>
                <span className="ops-caption text-[11px] text-slate-400">
                  future one-year rates (not observed today)
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: T }).map((_, i) => (
                  <motion.div
                    key={i}
                    onMouseEnter={() => setHovered("R")}
                    onMouseLeave={() => setHovered(null)}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                    className={cn(
                      "rounded-lg border px-2 py-3 text-center transition-colors",
                      hovered === "R"
                        ? "border-accent-purple/60 bg-accent-purple/[0.10]"
                        : "border-accent-purple/25 bg-accent-purple/[0.05]",
                    )}
                  >
                    <div className="font-mono text-[15px] text-accent-purple">
                      <InlineMath>{`R_{${i + 1}}`}</InlineMath>
                    </div>
                    <div className="ops-caption mt-1 text-[11px] text-slate-400">
                      yr {i}→{i + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* connector */}
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <span className="h-px w-12 bg-white/15" />
              <span className="font-mono text-[12px] text-slate-400">
                compressed into
              </span>
              <span className="h-px w-12 bg-white/15" />
            </div>

            {/* BOTTOM ROW — single r_{0,T} spanning whole timeline */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-accent-cyan/40 bg-accent-cyan/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-cyan">
                  Lowercase r · whole interval
                </span>
                <span className="ops-caption text-[11px] text-slate-400">
                  one annualized rate, inferred from today&apos;s price
                </span>
              </div>
              <motion.div
                onMouseEnter={() => setHovered("r")}
                onMouseLeave={() => setHovered(null)}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "rounded-lg border px-3 py-4 text-center transition-colors",
                  hovered === "r"
                    ? "border-accent-cyan/60 bg-accent-cyan/[0.10]"
                    : "border-accent-cyan/25 bg-accent-cyan/[0.05]",
                )}
              >
                <div className="font-mono text-[18px] text-accent-cyan">
                  <InlineMath>{"r_{0,T}"}</InlineMath>
                </div>
                <div className="ops-caption mt-1 text-[11px] text-slate-400">
                  yr 0 → T · spans the whole timeline
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Explanation columns */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-purple">
              Capital <MathText>R_t</MathText>
            </div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              <InlineMath>{"R_t"}</InlineMath> is the one-year rate that applies
              to the single year from <span className="font-mono">t−1</span> to{" "}
              <span className="font-mono">t</span>. Each{" "}
              <InlineMath>{"R_t"}</InlineMath> is its own slice.
            </p>
          </div>
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5">
            <div className="ops-caption text-[11px] text-accent-cyan">
              Lowercase r_{"{0,T}"}
            </div>
            <p className="ops-body mt-2 text-[15px] leading-7 text-slate-200">
              <InlineMath>{"r_{0,T}"}</InlineMath> is one annualized rate for the
              whole interval from today (0) to maturity (T). It collapses all the
              slices into a single number.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
          <p className="ops-body text-[15px] leading-7 text-slate-100">
            We do <span className="text-accent-amber">not</span> observe the
            future <InlineMath>{"R_t"}</InlineMath>&apos;s today. We observe{" "}
            <span className="text-accent-cyan">prices</span>, and infer{" "}
            <InlineMath>{"r_{0,T}"}</InlineMath>.
          </p>
        </div>
      </InteractiveFrame>
    </div>
  );
}
