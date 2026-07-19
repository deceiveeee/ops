"use client";

import { useState, Fragment } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Period = "yr1" | "yr2" | "yr3";

type Metric = {
  label: string;
  forecast: Record<Period, string>;
  actual: Record<Period, string>;
  category: "capital" | "operating" | "cash";
};

const METRICS: Metric[] = [
  {
    label: "Construction cost / store",
    forecast: { yr1: "$900K", yr2: "$900K", yr3: "$900K" },
    actual: { yr1: "$980K", yr2: "$950K", yr3: "$930K" },
    category: "capital",
  },
  {
    label: "Stores opened",
    forecast: { yr1: "20", yr2: "30", yr3: "30" },
    actual: { yr1: "16", yr2: "28", yr3: "32" },
    category: "capital",
  },
  {
    label: "Mature sales / store",
    forecast: { yr1: "$2.5M", yr2: "$2.5M", yr3: "$2.5M" },
    actual: { yr1: "$2.1M", yr2: "$2.3M", yr3: "$2.42M" },
    category: "operating",
  },
  {
    label: "Operating margin",
    forecast: { yr1: "20%", yr2: "20%", yr3: "20%" },
    actual: { yr1: "16%", yr2: "18%", yr3: "19%" },
    category: "operating",
  },
  {
    label: "Incremental free cash flow",
    forecast: { yr1: "−$8M", yr2: "+$3M", yr3: "+$12M" },
    actual: { yr1: "−$14M", yr2: "−$2M", yr3: "+$7M" },
    category: "cash",
  },
];

const PERIODS: { key: Period; label: string }[] = [
  { key: "yr1", label: "Year 1" },
  { key: "yr2", label: "Year 2" },
  { key: "yr3", label: "Year 3" },
];

const CAT_INFO = {
  capital: { label: "Capital & timing", tone: "cyan" as const },
  operating: { label: "Operating results", tone: "amber" as const },
  cash: { label: "Cash returns", tone: "green" as const },
};

const toneText: Record<string, string> = { cyan: "text-accent-cyan", amber: "text-accent-amber", green: "text-accent-green" };

function isAdverse(m: Metric, p: Period): boolean {
  const f = m.forecast[p];
  const a = m.actual[p];
  // Parse numeric value
  const parseNum = (s: string) => parseFloat(s.replace(/[^0-9.\-]/g, ""));
  const fv = parseNum(f);
  const av = parseNum(a);
  if (m.label.includes("cost")) return av > fv; // higher cost is adverse
  if (m.label.includes("free cash flow")) return av < fv; // lower FCF is adverse
  return av < fv; // lower is adverse for sales, margin, stores
}

export default function NPVForecastVsActual() {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<Period>("yr1");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Original forecast vs. actual result
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p.key} type="button" role="tab"
              aria-selected={period === p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                period === p.key ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
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
          <table className="w-full min-w-[440px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-white/20 text-left">
                <th className="py-2 pr-6 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Metric</th>
                <th className="py-2 pr-6 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Forecast</th>
                <th className="py-2 pr-6 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Actual</th>
                <th className="py-2 text-right font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">Status</th>
              </tr>
            </thead>
            <tbody>
              {(["capital", "operating", "cash"] as const).map((cat) => (
                <Fragment key={cat}>
                  <tr className="border-b border-white/5">
                    <td colSpan={4} className="pt-3 pb-1">
                      <span className={cn("font-mono text-[11px] uppercase tracking-[0.16em]", toneText[CAT_INFO[cat].tone])}>
                        {CAT_INFO[cat].label}
                      </span>
                    </td>
                  </tr>
                  {METRICS.filter((m) => m.category === cat).map((m) => {
                    const adverse = isAdverse(m, period);
                    return (
                      <tr key={m.label} className="border-b border-white/5">
                        <td className="py-2.5 pr-6 text-slate-200">{m.label}</td>
                        <td className="py-2.5 pr-6 text-right font-mono tabular-nums text-slate-400">{m.forecast[period]}</td>
                        <td className="py-2.5 pr-6 text-right font-mono tabular-nums text-white">{m.actual[period]}</td>
                        <td className={cn("py-2.5 text-right font-mono text-[12px] uppercase tracking-[0.14em]", adverse ? "text-accent-red" : "text-accent-green")}>
                          {adverse ? "Below" : "On target"}
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
            Variance interpretation · {PERIODS.find((p) => p.key === period)?.label}
          </div>
          <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
            {period === "yr1" && (
              <>Year 1 shows capital overruns (higher construction cost, fewer stores opened) combined
              with operating underperformance (lower sales, thinner margins). Free cash flow is
              significantly worse than forecast. The investor must determine whether this reflects
              start-up friction or a structural problem with the unit economics.</>
            )}
            {period === "yr2" && (
              <>By Year 2, openings are recovering but sales per store and margins remain below plan.
              Cumulative free cash flow is still negative. The picture is improving but not yet
              recovered — the investor should watch whether maturing cohorts reach the original margin.</>
            )}
            {period === "yr3" && (
              <>By Year 3, margins approach target and free cash flow turns positive, though below
              forecast. A missed short-term target does not automatically mean long-term value
              destruction. But cumulative returns remain below what the original NPV estimate implied.
              Compare realized ROIC with the cost of capital before judging success.</>
            )}
          </p>
          <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
            An initial positive NPV estimate does not end the analysis. Investors must determine
            whether the assumptions are being realized — or whether the original thesis was wrong.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
