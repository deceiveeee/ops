"use client";

import { useState, Fragment } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Period = "year1" | "year2" | "year3";

type Metric = {
  label: string;
  forecast: Record<Period, number>;
  actual: Record<Period, number>;
  unit: string;
  category: "execution" | "operating" | "financial";
  betterWhenHigher: boolean;
};

const METRICS: Metric[] = [
  {
    label: "Stores opened",
    forecast: { year1: 50, year2: 50, year3: 0 },
    actual: { year1: 42, year2: 48, year3: 0 },
    unit: "",
    category: "execution",
    betterWhenHigher: true,
  },
  {
    label: "Cost per store",
    forecast: { year1: 1.2, year2: 1.2, year3: 1.2 },
    actual: { year1: 1.34, year2: 1.29, year3: 1.27 },
    unit: "M",
    category: "execution",
    betterWhenHigher: false,
  },
  {
    label: "Mature sales / store",
    forecast: { year1: 2.5, year2: 2.5, year3: 2.5 },
    actual: { year1: 2.2, year2: 2.35, year3: 2.42 },
    unit: "M",
    category: "operating",
    betterWhenHigher: true,
  },
  {
    label: "Store-level margin",
    forecast: { year1: 20, year2: 20, year3: 20 },
    actual: { year1: 16, year2: 18, year3: 19 },
    unit: "%",
    category: "operating",
    betterWhenHigher: true,
  },
  {
    label: "Incremental free cash flow",
    forecast: { year1: -45, year2: 8, year3: 22 },
    actual: { year1: -58, year2: -4, year3: 14 },
    unit: "M",
    category: "financial",
    betterWhenHigher: true,
  },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: "year1", label: "Year 1" },
  { key: "year2", label: "Year 2" },
  { key: "year3", label: "Year 3" },
];

const CATEGORY_INFO = {
  execution: { label: "Execution", desc: "Schedule, budget, milestones", tone: "cyan" as const },
  operating: { label: "Operating", desc: "Sales, utilization, margins", tone: "amber" as const },
  financial: { label: "Financial", desc: "Cash flow, ROIC, value creation", tone: "green" as const },
};

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  amber: "text-accent-amber",
  green: "text-accent-green",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/30",
  amber: "border-accent-amber/30",
  green: "border-accent-green/30",
};

function fmt(n: number, unit: string) {
  const prefix = unit === "M" ? "$" : "";
  const suffix = unit === "%" ? "%" : unit === "M" ? "M" : "";
  return `${prefix}${n.toLocaleString("en-US", { minimumFractionDigits: unit === "" ? 0 : 2, maximumFractionDigits: 2 })}${suffix}`;
}

function variancePct(m: Metric, p: Period): number {
  const f = m.forecast[p];
  const a = m.actual[p];
  if (f === 0) return 0;
  return ((a - f) / Math.abs(f)) * 100;
}

export default function ForecastVsActualTracker() {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<Period>("year1");

  const executionMiss = METRICS.filter((m) => m.category === "execution").some(
    (m) => (m.betterWhenHigher ? m.actual[period] < m.forecast[period] : m.actual[period] > m.forecast[period]),
  );
  const operatingMiss = METRICS.filter((m) => m.category === "operating").some(
    (m) => (m.betterWhenHigher ? m.actual[period] < m.forecast[period] : m.actual[period] > m.forecast[period]),
  );
  const financialMiss = METRICS.filter((m) => m.category === "financial").some(
    (m) => (m.betterWhenHigher ? m.actual[period] < m.forecast[period] : m.actual[period] > m.forecast[period]),
  );

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Original target vs. actual result
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Reporting period">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={period === p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                period === p.key
                  ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                  : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric table */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-white/20 text-left">
                <th className="py-2 pr-6 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Metric</th>
                <th className="py-2 pr-6 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Original target</th>
                <th className="py-2 pr-6 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Actual</th>
                <th className="py-2 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">Variance</th>
              </tr>
            </thead>
            <tbody>
              {(["execution", "operating", "financial"] as const).map((cat) => (
                <Fragment key={cat}>
                  <tr className="border-b border-white/5">
                    <td colSpan={4} className="pt-4 pb-1">
                      <span className={cn("font-mono text-[11px] uppercase tracking-[0.16em]", toneText[CATEGORY_INFO[cat].tone])}>
                        {CATEGORY_INFO[cat].label} · {CATEGORY_INFO[cat].desc}
                      </span>
                    </td>
                  </tr>
                  {METRICS.filter((m) => m.category === cat).map((m) => {
                    const v = variancePct(m, period);
                    const f = m.forecast[period];
                    const a = m.actual[period];
                    const adverse = m.betterWhenHigher ? a < f : a > f;
                    return (
                      <tr key={m.label} className="border-b border-white/5">
                        <td className="py-2.5 pr-6 text-slate-200">{m.label}</td>
                        <td className="py-2.5 pr-6 text-right font-mono tabular-nums text-slate-300">{fmt(f, m.unit)}</td>
                        <td className="py-2.5 pr-6 text-right font-mono tabular-nums text-white">{fmt(a, m.unit)}</td>
                        <td className={cn("py-2.5 text-right font-mono tabular-nums", adverse ? "text-accent-red" : "text-accent-green")}>
                          {v > 0 ? "+" : ""}{v.toFixed(0)}%
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category status pills */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(["execution", "operating", "financial"] as const).map((cat) => {
          const miss = cat === "execution" ? executionMiss : cat === "operating" ? operatingMiss : financialMiss;
          return (
            <div key={cat} className={cn("rounded-xl border p-4", toneBorder[cat])}>
              <div className="flex items-center justify-between gap-2">
                <span className={cn("font-mono text-[11px] uppercase tracking-[0.16em]", toneText[cat])}>
                  {CATEGORY_INFO[cat].label}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
                    miss ? "bg-accent-red/15 text-accent-red" : "bg-accent-green/15 text-accent-green",
                  )}
                >
                  {miss ? "Below target" : "On target"}
                </span>
              </div>
              <p className="ops-body mt-2 text-[12px] leading-[1.5] text-slate-300">
                {CATEGORY_INFO[cat].desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Interpretation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={period}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : undefined}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6"
        >
          <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
            Interpretation · {PERIODS.find((p) => p.key === period)?.label}
          </div>
          <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
            {period === "year1" && (
              <>
                Year 1 shows{" "}
                <span className="text-white">execution misses</span> — fewer stores opened and
                higher cost per store — combined with{" "}
                <span className="text-white">operating underperformance</span> as new locations
                ramped more slowly than planned. The financial consequence is a larger cash
                outflow than forecast. The investor must judge whether this reflects start-up
                friction that will normalize, or a structural problem with the unit economics.
              </>
            )}
            {period === "year2" && (
              <>
                By Year 2, openings are closer to plan and cost per store is improving, but sales
                per store and margins remain below target. Free cash flow is still negative. The
                picture is <span className="text-white">recovering but not yet recovered</span> —
                the investor should watch whether maturing cohorts reach the original margin
                target before concluding the program is on track.
              </>
            )}
            {period === "year3" && (
              <>
                By Year 3, margins approach target and free cash flow turns positive, though still
                below the original forecast. A missed short-term target in earlier years has not
                necessarily destroyed long-term value — but cumulative cash returns remain below
                what management originally implied. The investor compares the realized return on
                invested capital against the cost of capital before judging the program a success.
              </>
            )}
          </p>
          <div className="mt-4 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <p className="ops-body text-[14px] leading-[1.65] text-slate-200">
              A missed short-term target does not automatically mean long-term value destruction.
              Execution delays, operating surprises, and external conditions can all produce
              near-term misses without changing the project&apos;s fundamental economics. The
              investor separates{" "}
              <span className="text-white">temporary friction</span> from{" "}
              <span className="text-white">capital-allocation error</span>.
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
