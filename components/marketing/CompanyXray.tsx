"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { businessDrivers } from "@/data/marketing";
import { cn } from "@/lib/utils";

/**
 * Section 03 — Business drivers.
 *
 * One active metric prominent; others as quiet selectable labels.
 * Removed: SURFACE label, X-RAY label, NVCO mono identifier, scan line,
 * excessive bordered cards. Active metric is selected, not all-on.
 */
export default function CompanyXray() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const driver = businessDrivers[active];

  const toneColor =
    driver.tone === "up"
      ? "#34d399"
      : driver.tone === "down"
        ? "#f87171"
        : "#cbd5e1";

  return (
    <section
      id="section-business"
      className="hp-section-pad relative w-full overflow-hidden border-t border-white/5"
    >
      <div className="hp-container">
        <div className="hp-marker">03 / Business</div>
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6 }}
          className="hp-section mt-5"
        >
          X-ray the chart into its drivers.
        </motion.h2>
        <p className="hp-lead mt-6">
          Revenue, margins, cash flow, debt, and share count drive valuation.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_auto] lg:gap-16">
          {/* Active metric — prominent */}
          <div className="min-w-0">
            <motion.div
              key={driver.key}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-[15px] font-medium text-slate-400">
                {driver.label}
              </div>
              <div
                className="hp-numeric mt-2 text-[64px] leading-none sm:text-[88px]"
                style={{ color: toneColor }}
              >
                {driver.value}
              </div>
              <div className="hp-body mt-4 max-w-md">{driver.note}</div>
            </motion.div>
          </div>

          {/* Quiet selectors — labels only, no bordered cards */}
          <div className="flex flex-col gap-2 border-l border-white/10 pl-6 lg:w-64">
            {businessDrivers.map((d, i) => {
              const isActive = i === active;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/40",
                    isActive
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  <span className="text-[15px] font-medium">{d.label}</span>
                  <span
                    className={cn(
                      "hp-numeric text-[15px]",
                      isActive ? "text-accent-cyan" : "text-slate-500",
                    )}
                  >
                    {d.value}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
