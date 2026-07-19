"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

const RF = 4;
const MRP = 6;
const PARENT_BETA = 0.8;
const PROJECT_BETA = 1.4;
const CF1 = 120;
const COST = 108;

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

type Mode = "company" | "project";

export default function CompanyRateVsProjectRate() {
  const [mode, setMode] = useState<Mode>("company");
  const beta = mode === "company" ? PARENT_BETA : PROJECT_BETA;
  const requiredReturn = RF + beta * MRP;
  const pv = CF1 / (1 + requiredReturn / 100);
  const npv = pv - COST;
  const accept = npv > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-slate-100">
          Should a project use the same discount rate as every other investment the parent
          company undertakes? A core restaurant expansion may reasonably resemble the
          company&apos;s current operations. A biotechnology subsidiary, a financial-services
          venture, or a foreign mining investment would not. Ownership by the same parent does
          not make the cash flows economically identical.
        </p>
        <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] px-4 py-3">
          <BlockMath>
            {String.raw`r_{\text{project}} = R_f + \beta_{\text{project}}\bigl(E[R_M] - R_f\bigr)`}
          </BlockMath>
          <p className="ops-body mt-2 text-center text-[13px] text-slate-300">
            The discount rate must match the systematic risk of the investment&apos;s own cash flows.
          </p>
        </div>
      </div>

      {/* Fixed inputs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Risk-free rate" value={`${RF}%`} />
        <Stat label="Market risk premium" value={`${MRP}%`} />
        <Stat label="Expected cash flow" value={`$${CF1}`} />
        <Stat label="Project cost" value={`$${COST}`} />
      </div>

      {/* Mode toggle */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Which discount rate should the investor use?
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Discount rate source">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "company"}
            onClick={() => setMode("company")}
            className={cn(
              "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              mode === "company"
                ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                : "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
            )}
          >
            Parent-company beta · 0.8
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "project"}
            onClick={() => setMode("project")}
            className={cn(
              "rounded-full border px-5 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              mode === "project"
                ? "border-accent-amber bg-accent-amber/15 text-accent-amber"
                : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
            )}
          >
            Project-specific beta · 1.4
          </button>
        </div>
      </div>

      {/* Calculation */}
      <div
        className={cn(
          "rounded-2xl border p-5 sm:p-6",
          mode === "company"
            ? "border-accent-cyan/25 bg-accent-cyan/[0.04]"
            : "border-accent-amber/25 bg-accent-amber/[0.04]",
        )}
      >
        <div
          className={cn(
            "font-mono text-[12px] uppercase tracking-[0.16em]",
            mode === "company" ? "text-accent-cyan" : "text-accent-amber",
          )}
        >
          {mode === "company" ? "Using the parent company's rate" : "Using the project's own rate"}
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>
              {String.raw`r = ${RF}\% + ${beta}\times ${MRP}\% = ${fmt(requiredReturn)}\%`}
            </BlockMath>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
            <BlockMath>
              {String.raw`PV = \frac{\$${CF1}}{1 + ${fmt(requiredReturn)}\%} = \$${fmt(pv)}`}
            </BlockMath>
          </div>
          <div
            className={cn(
              "rounded-xl border px-4 py-4",
              accept ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]",
            )}
          >
            <BlockMath>
              {String.raw`NPV = \$${fmt(pv)} - \$${COST} = \$${fmt(npv)}`}
            </BlockMath>
          </div>
        </div>

        {/* Decision */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[13px] uppercase tracking-[0.14em]",
              accept
                ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                : "border-accent-red/50 bg-accent-red/10 text-accent-red",
            )}
          >
            {accept ? "Accept" : "Reject"}
          </span>
          <span className="font-mono text-[13px] tabular-nums text-slate-300">
            {fmt(requiredReturn)}% required
          </span>
        </div>
        <p className="ops-body mt-4 text-[15px] leading-[1.7] text-slate-100">
          {mode === "company" ? (
            <>
              Using the parent company&apos;s historical beta of{" "}
              <InlineMath>{String.raw`\beta = 0.8`}</InlineMath>, the required return is only{" "}
              <span className="text-white">{fmt(requiredReturn)}%</span>. The project appears
              attractive — its NPV is positive. But this rate reflects the risk of the company&apos;s
              existing business, not necessarily the risk of the proposed activity.
            </>
          ) : (
            <>
              Using the project&apos;s own beta of{" "}
              <InlineMath>{String.raw`\beta = 1.4`}</InlineMath> — derived from comparable
              businesses engaged in the same activity — the required return rises to{" "}
              <span className="text-white">{fmt(requiredReturn)}%</span>. The same cash-flow
              forecast now produces a <span className="text-white">negative NPV</span>.
            </>
          )}
        </p>
      </div>

      {/* Side-by-side summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          title="Parent-company rate"
          beta={PARENT_BETA}
          rate={RF + PARENT_BETA * MRP}
          npv={CF1 / (1 + (RF + PARENT_BETA * MRP) / 100) - COST}
        />
        <SummaryCard
          title="Project-specific rate"
          beta={PROJECT_BETA}
          rate={RF + PROJECT_BETA * MRP}
          npv={CF1 / (1 + (RF + PROJECT_BETA * MRP) / 100) - COST}
          highlight
        />
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.55] text-white">
          The cash-flow forecast did not change. The investment decision changed because the
          parent company&apos;s historical risk was not an appropriate proxy for the proposed
          activity.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 font-mono text-[17px] tabular-nums text-white">{value}</div>
    </div>
  );
}

function SummaryCard({
  title,
  beta,
  rate,
  npv,
  highlight,
}: {
  title: string;
  beta: number;
  rate: number;
  npv: number;
  highlight?: boolean;
}) {
  const accept = npv > 0;
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        highlight ? "border-accent-amber/30 bg-accent-amber/[0.04]" : "border-white/12 bg-white/[0.02]",
      )}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
        {title}
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-slate-300">Beta</span>
          <span className="font-mono text-[15px] tabular-nums text-white">{beta}</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-slate-300">Required return</span>
          <span className="font-mono text-[15px] tabular-nums text-accent-amber">{fmt(rate)}%</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-slate-300">Present value</span>
          <span className="font-mono text-[15px] tabular-nums text-white">${fmt(CF1 / (1 + rate / 100))}</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
          <span className="text-[13px] text-slate-300">NPV</span>
          <span className={cn("font-mono text-[17px] tabular-nums", accept ? "text-accent-green" : "text-accent-red")}>
            ${fmt(npv)}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[13px] text-slate-300">Decision</span>
          <span
            className={cn(
              "font-mono text-[13px] uppercase tracking-[0.14em]",
              accept ? "text-accent-green" : "text-accent-red",
            )}
          >
            {accept ? "Accept" : "Reject"}
          </span>
        </div>
      </div>
    </div>
  );
}
