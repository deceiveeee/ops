"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaCard,
  Inline,
} from "./shared";
import CashFlowTimeline, { type CashFlow } from "./CashFlowTimeline";
import { formatMoney } from "@/lib/fixed-income";

type Freq = "annual" | "semiannual";

const ANATOMY_DEFS: { term: string; def: string }[] = [
  { term: "Principal / face value / par value", def: "The amount repaid at maturity." },
  { term: "Coupon", def: "A periodic interest payment." },
  { term: "Coupon rate", def: "Annual coupon ÷ face value." },
  { term: "Maturity", def: "The final date on which principal is repaid." },
];

/**
 * Section 9 — Bond cash-flow builder.
 * Anatomy definitions + a responsive builder that produces a cash-flow
 * timeline and table from face value, coupon rate, maturity, and frequency.
 */
export default function BondCashFlowBuilder() {
  const [face, setFace] = useState(1000);
  const [ratePct, setRatePct] = useState(5);
  const [maturity, setMaturity] = useState(3);
  const [freq, setFreq] = useState<Freq>("annual");

  const reduce = useReducedMotion();

  const perYear = freq === "annual" ? 1 : 2;
  const couponAnnual = (face * ratePct) / 100;
  const couponPerPeriod = couponAnnual / perYear;

  const flows: CashFlow[] = useMemo(() => {
    const periods = maturity * perYear;
    const out: CashFlow[] = [];
    for (let i = 1; i <= periods; i++) {
      const isFinal = i === periods;
      out.push({
        period: i,
        amount: isFinal ? couponPerPeriod + face : couponPerPeriod,
        label: isFinal ? "Coupon + Principal" : "Coupon",
      });
    }
    return out;
  }, [maturity, perYear, couponPerPeriod, face]);

  const totalPromised = flows.reduce((s, f) => s + f.amount, 0);
  const finalPayment = flows[flows.length - 1]?.amount ?? 0;

  // guarded clamps
  const safeFace = Math.max(1, face);
  const safeMaturity = Math.max(1, Math.min(10, maturity));
  const safeRate = Math.max(0, Math.min(50, ratePct));

  return (
    <div className="space-y-6">
      {/* Anatomy definitions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ANATOMY_DEFS.map((d) => (
          <DefinitionCard key={d.term} term={d.term}>
            {d.def}
          </DefinitionCard>
        ))}
      </div>

      {/* MIT example */}
      <div className="glass-panel p-6 sm:p-7">
        <div className="ops-caption text-[11px] text-accent-purple">Worked example</div>
        <h4 className="ops-interactive-title mt-2 text-xl text-white">
          A 3-year, 5% coupon bond with $1,000 face value
        </h4>
        <p className="ops-body mt-3 text-[15px] leading-7 text-slate-300">
          Year 1 pays <span className="text-accent-green">$50</span>, Year 2 pays{" "}
          <span className="text-accent-green">$50</span>, and Year 3 pays{" "}
          <span className="text-accent-amber">$1,050</span> — the $50 coupon plus
          the $1,000 principal returned at maturity.
        </p>

        <div className="mt-5">
          <FormulaCard label="Annual coupon = Coupon rate × Face value" ariaLabel="Annual coupon equals coupon rate times face value equals 5 percent times 1000 dollars equals 50 dollars">
            <div className="space-y-2">
              <div>Annual coupon = 5% × $1,000 = <span className="text-accent-green">$50</span></div>
            </div>
          </FormulaCard>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <CashFlowTimeline
            flows={[
              { period: 1, amount: 50 },
              { period: 2, amount: 50 },
              { period: 3, amount: 1050 },
            ]}
            highlightFinal
            ariaLabel="Example 3-year 5 percent coupon bond cash flow timeline"
          />
        </div>
      </div>

      {/* Builder */}
      <InteractiveFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Cash-flow builder
            </span>
          </div>
          <span className="ops-caption text-[11px] text-slate-400">
            Adjust the contract, watch the schedule update
          </span>
        </div>

        <h4 className="ops-interactive-title mt-4 text-2xl text-white">
          Build a promised cash-flow schedule
        </h4>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
          {/* Controls */}
          <div className="space-y-4 rounded-2xl border border-white/10 bg-ink-950/40 p-5">
            <ControlSlider
              label="Face value"
              value={safeFace}
              min={100}
              max={10000}
              step={100}
              display={formatMoney(safeFace)}
              onChange={setFace}
            />
            <ControlSlider
              label="Coupon rate"
              value={safeRate}
              min={0}
              max={15}
              step={0.5}
              display={`${safeRate.toFixed(1)}%`}
              onChange={setRatePct}
            />
            <ControlSlider
              label="Maturity (years)"
              value={safeMaturity}
              min={1}
              max={10}
              step={1}
              display={`${safeMaturity} yr`}
              onChange={setMaturity}
            />
            <div>
              <div className="ops-caption text-[11px] text-slate-400">Frequency</div>
              <div className="mt-2 inline-flex rounded-full border border-white/15 bg-ink-950/60 p-1">
                <FreqBtn active={freq === "annual"} onClick={() => setFreq("annual")}>
                  Annual
                </FreqBtn>
                <FreqBtn active={freq === "semiannual"} onClick={() => setFreq("semiannual")}>
                  Semiannual
                </FreqBtn>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40 p-4">
              <CashFlowTimeline
                flows={flows}
                maxPeriod={flows.length}
                highlightFinal
                ariaLabel="Builder cash flow timeline"
              />
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/10 bg-ink-950/40">
              <table className="w-full min-w-[420px] text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="ops-caption p-3 text-[11px] text-slate-400">Period</th>
                    <th className="ops-caption p-3 text-right text-[11px] text-slate-400">Coupon</th>
                    <th className="ops-caption p-3 text-right text-[11px] text-slate-400">Principal</th>
                    <th className="ops-caption p-3 text-right text-[11px] text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {flows.map((f, i) => {
                    const isFinal = i === flows.length - 1;
                    return (
                      <tr key={f.period} className="border-b border-white/5">
                        <td className="ops-body p-3 font-sans text-[13px] text-slate-300">{f.period}</td>
                        <td className="p-3 text-right font-sans text-[13px] text-accent-green">{formatMoney(couponPerPeriod)}</td>
                        <td className="p-3 text-right font-sans text-[13px] text-accent-amber">{isFinal ? formatMoney(face) : "—"}</td>
                        <td className={cn("p-3 text-right font-sans text-[13px]", isFinal ? "text-accent-amber" : "text-slate-100")}>
                          {formatMoney(f.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SummaryStat label="Final payment" value={formatMoney(finalPayment)} tone="amber" />
              <SummaryStat label="Total promised" value={formatMoney(totalPromised)} tone="green" />
            </div>

            {/* Feedback line */}
            <motion.div
              key={`${safeRate}-${face}-${freq}`}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <p className="ops-body text-[14px] leading-6 text-slate-200">
                At <span className="text-accent-cyan">{safeRate.toFixed(1)}%</span> coupon on{" "}
                {formatMoney(face)} face value, the {freq === "annual" ? "annual" : "semiannual"} coupon is{" "}
                <span className="text-accent-green">{formatMoney(couponPerPeriod)}</span>.
                The last payment is larger because principal is returned at maturity.
              </p>
              <p className="ops-muted mt-2 text-[13px] leading-6 text-slate-400">
                This is <span className="text-slate-200">promised cash flow</span>, not risk-adjusted value.{" "}
                <Inline>Discounting</Inline> comes next.
              </p>
            </motion.div>
          </div>
        </div>
      </InteractiveFrame>
    </div>
  );
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="ops-caption text-[11px] text-slate-400">{label}</span>
        <span className="font-sans text-[13px] text-slate-100">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-2 w-full accent-accent-cyan"
      />
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone: "amber" | "green" }) {
  const c = tone === "amber" ? "text-accent-amber" : "text-accent-green";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="ops-caption text-[11px] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-sans text-[18px]", c)}>{value}</div>
    </div>
  );
}

function FreqBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        active ? "bg-accent-cyan/15 text-accent-cyan" : "text-slate-400 hover:text-slate-200",
      )}
    >
      {children}
    </button>
  );
}
