"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";

function LabeledSlider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  prefix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  prefix?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400"
      >
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">
          {prefix}
          {value}
          {suffix}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
}

function fmtM(n: number, d = 2) {
  return `$${fmt(n, d)}M`;
}

// Per-store cash flows modeled over HORIZON years after opening, plus terminal value.
const HORIZON = 8;

function perStoreCashFlows(
  devCost: number,
  matureSales: number,
  margin: number,
  yearsToMature: number,
  maintPct: number,
  closureRate: number,
  cannibalization: number,
): number[] {
  const flows: number[] = [];
  // Year 0: development cost only (in $M)
  flows.push(-devCost);
  let active = 1;
  for (let y = 1; y <= HORIZON; y++) {
    const ramp = Math.min(y / yearsToMature, 1);
    const sales = matureSales * ramp * (1 - cannibalization / 100);
    const opProfit = sales * (margin / 100);
    const maint = sales * (maintPct / 100);
    const net = opProfit - maint;
    flows.push(net * active);
    // Apply closure at end of year (reduces active stores for next year)
    active = active * (1 - closureRate / 100);
  }
  // Terminal value: capitalize final-year cash flow at a conservative multiple, then apply survival
  const finalFlow = flows[flows.length - 1];
  const terminalMultiple = 4;
  const terminal = (finalFlow * terminalMultiple) / (1 + 0); // already in final year
  flows[flows.length - 1] += terminal;
  return flows;
}

function npv(flows: number[], rate: number): number {
  let total = 0;
  for (let t = 0; t < flows.length; t++) {
    total += flows[t] / Math.pow(1 + rate / 100, t);
  }
  return total;
}

export default function RestaurantInvestmentReconstruction() {
  // Per-store assumptions
  const [devCost, setDevCost] = useState(1.2); // $M
  const [matureSales, setMatureSales] = useState(2.5); // $M
  const [margin, setMargin] = useState(20); // %
  const [yearsToMature, setYearsToMature] = useState(3);
  const [maintPct, setMaintPct] = useState(4); // % of sales
  const [closureRate, setClosureRate] = useState(3); // % per year
  const [cannibalization, setCannibalization] = useState(5); // % sales reduction
  const [discountRate, setDiscountRate] = useState(10); // %

  const flows = perStoreCashFlows(
    devCost,
    matureSales,
    margin,
    yearsToMature,
    maintPct,
    closureRate,
    cannibalization,
  );
  const perStoreNPV = npv(flows, discountRate);
  const perStorePV = perStoreNPV + devCost; // PV of operating flows (excludes initial cost)

  // Program: 100 stores — 50 open in year 0, 50 in year 1
  const TOTAL_STORES = 100;
  const programNPV = perStoreNPV * 50 + perStoreNPV * 50 / Math.pow(1 + discountRate / 100, 1);

  // Naive shortcut: mature profit / dev cost
  const matureProfit = matureSales * (margin / 100);
  const naiveReturn = (matureProfit / devCost) * 100;

  // Break-even mature sales (solve for sales where per-store NPV = 0)
  // Linear approximation: scale sales until NPV ≈ 0
  const breakEvenSales = (() => {
    // NPV is roughly linear in matureSales. Find the sales that zeroes NPV.
    const low = perStoreCashFlows(devCost, 0, margin, yearsToMature, maintPct, closureRate, cannibalization);
    const npvAtZero = npv(low, discountRate);
    const npvAtCurrent = perStoreNPV;
    // slope = (npvAtCurrent - npvAtZero) / matureSales
    const slope = npvAtCurrent - npvAtZero;
    if (Math.abs(slope) < 0.001) return matureSales;
    // npvAtZero + slope * breakEvenSales/matureSales ... wait, we want NPV = 0
    // npvAtZero + slope * (beSales/matureSales) ... hmm let me redo.
    // Actually npvAtZero is NPV when matureSales = 0, and npvAtCurrent when matureSales = current.
    // Linear: NPV(sales) = npvAtZero + (npvAtCurrent - npvAtZero) * (sales / matureSales)
    // Set = 0: sales = -npvAtZero * matureSales / (npvAtCurrent - npvAtZero)
    const be = (-npvAtZero * matureSales) / slope;
    return Math.max(0, be);
  })();

  // One-factor sensitivity: perturb each assumption ±reasonable amount, measure NPV change
  const perturbations = [
    { label: "Mature sales", base: matureSales, lo: matureSales * 0.8, hi: matureSales * 1.2, set: (v: number) => perStoreCashFlows(devCost, v, margin, yearsToMature, maintPct, closureRate, cannibalization) },
    { label: "Margin", base: margin, lo: margin - 4, hi: margin + 4, set: (v: number) => perStoreCashFlows(devCost, matureSales, v, yearsToMature, maintPct, closureRate, cannibalization) },
    { label: "Dev cost", base: devCost, lo: devCost * 1.2, hi: devCost * 0.8, set: (v: number) => perStoreCashFlows(v, matureSales, margin, yearsToMature, maintPct, closureRate, cannibalization) },
    { label: "Discount rate", base: discountRate, lo: discountRate + 3, hi: discountRate - 3, set: (_v: number) => flows },
  ];

  const sensitivity = perturbations.map((p) => {
    const loFlows = p.label === "Discount rate" ? flows : p.set(p.lo);
    const hiFlows = p.label === "Discount rate" ? flows : p.set(p.hi);
    const loNPV = p.label === "Discount rate"
      ? npv(flows, discountRate + 3)
      : npv(loFlows, discountRate);
    const hiNPV = p.label === "Discount rate"
      ? npv(flows, discountRate - 3)
      : npv(hiFlows, discountRate);
    return { label: p.label, lo: loNPV, hi: hiNPV, swing: Math.abs(hiNPV - loNPV) };
  });
  sensitivity.sort((a, b) => b.swing - a.swing);
  const maxSwing = sensitivity[0]?.swing ?? 1;

  const npvPositive = perStoreNPV > 0;

  return (
    <div className="space-y-6">
      {/* Illustrative label */}
      <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
        <p className="font-sans text-[12px] uppercase tracking-[0.14em] text-accent-amber">
          Illustrative investor estimate, not management&apos;s internal project model
        </p>
      </div>

      {/* Scenario: management-provided facts */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          Management-provided information
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">New locations</div>
            <div className="mt-1 text-[18px] text-white">100 stores</div>
          </div>
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Opening schedule</div>
            <div className="mt-1 text-[18px] text-white">50/yr over 2 yrs</div>
          </div>
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Dev cost / store</div>
            <div className="mt-1 text-[18px] text-white">{fmtM(devCost)}</div>
          </div>
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Mature sales / store</div>
            <div className="mt-1 text-[18px] text-white">{fmtM(matureSales)}/yr</div>
          </div>
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Store-level margin</div>
            <div className="mt-1 text-[18px] text-white">{margin}%</div>
          </div>
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Time to maturity</div>
            <div className="mt-1 text-[18px] text-white">{yearsToMature} yrs</div>
          </div>
        </div>
      </div>

      {/* Investor assumption controls */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Investor assumptions (what is still missing)
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <LabeledSlider label="Dev cost / store" value={devCost} min={0.8} max={2.0} step={0.05} prefix="$" suffix="M" onChange={setDevCost} />
          <LabeledSlider label="Mature sales / store" value={matureSales} min={1.5} max={3.5} step={0.05} prefix="$" suffix="M" onChange={setMatureSales} />
          <LabeledSlider label="Store-level margin" value={margin} min={10} max={30} step={1} suffix="%" onChange={setMargin} />
          <LabeledSlider label="Years to maturity" value={yearsToMature} min={2} max={5} step={1} onChange={setYearsToMature} />
          <LabeledSlider label="Maintenance capex" value={maintPct} min={2} max={8} step={0.5} suffix="% of sales" onChange={setMaintPct} />
          <LabeledSlider label="Closure rate" value={closureRate} min={0} max={8} step={0.5} suffix="%/yr" onChange={setClosureRate} />
          <LabeledSlider label="Cannibalization" value={cannibalization} min={0} max={15} step={1} suffix="%" onChange={setCannibalization} />
          <LabeledSlider label="Discount rate" value={discountRate} min={6} max={16} step={0.5} suffix="%" onChange={setDiscountRate} />
        </div>
      </div>

      {/* The naive shortcut and why it is wrong */}
      <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">
          Why the obvious shortcut is incomplete
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
            <BlockMath>
              {String.raw`\frac{\text{mature profit}}{\text{dev cost}} = \frac{\$${fmt(matureProfit)}M}{\$${fmt(devCost)}M} = ${fmt(naiveReturn)}\%`}
            </BlockMath>
          </div>
        </div>
        <p className="ops-body mt-4 text-[15px] leading-[1.7] text-slate-100">
          The {fmt(naiveReturn)}% looks attractive — but it ignores{" "}
          <span className="text-white">timing, ramp-up losses, taxes, maintenance spending,
          additional investment, closures, cannibalization, and risk</span>. It is a ratio of a
          steady-state operating number to a one-time development cost, not a discounted cash-flow
          return.
        </p>
      </div>

      {/* Per-store cash-flow model output */}
      <div className="rounded-2xl border border-accent-amber/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Per-store illustrative cash-flow model
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-white/20 text-left">
                <th className="py-2 pr-4 font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">Year after opening</th>
                {Array.from({ length: HORIZON + 1 }, (_, i) => i).map((y) => (
                  <th key={y} className="py-2 pr-3 text-right font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    {y === 0 ? "Yr 0" : `Yr ${y}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-sans tabular-nums text-slate-100">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 text-slate-300">Cash flow ($M)</td>
                {flows.map((f, i) => (
                  <td key={i} className={cn("py-2 pr-3 text-right", f < 0 ? "text-accent-red" : "text-accent-green")}>
                    {fmt(f)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-4 text-slate-300">Discount factor</td>
                {flows.map((_, i) => (
                  <td key={i} className="py-2 pr-3 text-right text-slate-400">
                    {fmt(1 / Math.pow(1 + discountRate / 100, i), 3)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="ops-body mt-3 text-[12px] leading-[1.55] text-slate-400">
          Terminal value capitalizes the final-year cash flow at a conservative 4× multiple. The
          schedule shows a single representative store; the program opens 50 in year 0 and 50 in
          year 1.
        </p>
      </div>

      {/* Readouts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Readout label="PV of cash flows / store" value={fmtM(perStorePV)} />
        <Readout label="NPV / store" value={fmtM(perStoreNPV)} tone={npvPositive ? "green" : "red"} />
        <Readout label="Program NPV (100 stores)" value={fmtM(programNPV, 1)} tone={npvPositive ? "green" : "red"} />
        <Readout label="Break-even mature sales" value={fmtM(breakEvenSales)} tone="amber" />
      </div>

      {/* Sensitivity: which assumptions matter most */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Which assumptions move NPV the most?
        </div>
        <div className="mt-4 space-y-3">
          {sensitivity.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="w-32 flex-shrink-0 text-[13px] text-slate-200">{s.label}</div>
              <div className="relative h-7 flex-1 overflow-hidden rounded-lg border border-white/10 bg-ink-950/40">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-r",
                    s.swing / maxSwing > 0.66 ? "bg-accent-red/40" : s.swing / maxSwing > 0.33 ? "bg-accent-amber/40" : "bg-accent-cyan/30",
                  )}
                  style={{ width: `${Math.max(8, (s.swing / maxSwing) * 100)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3 font-sans text-[11px] tabular-nums">
                  <span className="text-accent-red/90">{fmtM(s.lo)}</span>
                  <span className="text-accent-green/90">{fmtM(s.hi)}</span>
                </div>
              </div>
              <div className="w-14 flex-shrink-0 text-right font-sans text-[11px] tabular-nums text-slate-400">
                ±{fmtM(s.swing / 2)}
              </div>
            </div>
          ))}
        </div>
        <p className="ops-body mt-4 text-[14px] leading-[1.65] text-slate-300">
          Each bar shows the swing in per-store NPV when the assumption moves to its adverse
          versus favorable end. <span className="text-white">{sensitivity[0]?.label}</span> has the
          largest impact on value here — that is the assumption the investor should scrutinize most
          carefully in filings and calls.
        </p>
      </div>

      <div
        className={cn(
          "rounded-2xl border p-5 sm:p-6",
          npvPositive
            ? "border-accent-green/30 bg-accent-green/[0.06]"
            : "border-accent-red/30 bg-accent-red/[0.06]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-sans text-[13px] uppercase tracking-[0.14em]",
              npvPositive
                ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                : "border-accent-red/50 bg-accent-red/10 text-accent-red",
            )}
          >
            {npvPositive ? "Appears value-creating" : "Appears value-destroying"}
          </span>
          <span className="font-sans text-[13px] tabular-nums text-slate-300">
            per-store NPV {fmtM(perStoreNPV)} at {discountRate}%
          </span>
        </div>
        <p className="ops-body mt-4 text-[16px] leading-[1.7] text-slate-100">
          {npvPositive ? (
            <>
              Under these assumptions, the program appears to create value. But the conclusion
              depends on every assumption above. The break-even mature-sales figure of{" "}
              <span className="text-white">{fmtM(breakEvenSales)}</span> shows how much cushion
              exists before the program stops creating value at this discount rate.
            </>
          ) : (
            <>
              Under these assumptions, the program does not appear to create value once timing,
              ramp-up, maintenance, closures, and risk are accounted for. The break-even mature
              sales of <span className="text-white">{fmtM(breakEvenSales)}</span> would be required
              to reach a zero NPV at this discount rate.
            </>
          )}
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          This is an illustrative estimate, not a precise forecast. The purpose is to identify
          which assumptions drive the conclusion — not to produce a single false-precision number.
        </p>
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const text =
    tone === "green"
      ? "text-accent-green"
      : tone === "red"
        ? "text-accent-red"
        : tone === "amber"
          ? "text-accent-amber"
          : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className={cn("mt-2 font-sans text-[17px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
