"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function LabeledSlider({
  label, value, min, max, step, suffix, prefix, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}

const HORIZON = 5;

function rampFraction(year: number, yearsToMature: number) {
  return Math.min(year / yearsToMature, 1);
}

function computeFlows(
  construction: number, preOpening: number, workingCapital: number,
  matureSales: number, margin: number, yearsToMature: number,
  maintPct: number, cannibalization: number, closureRate: number,
  residual: number,
) {
  const initial = -(construction + preOpening + workingCapital);
  const flows: { year: number; cf: number; ramp: number }[] = [];
  let active = 1;
  for (let y = 1; y <= HORIZON; y++) {
    const ramp = rampFraction(y, yearsToMature);
    const sales = matureSales * ramp * (1 - cannibalization / 100);
    const opProfit = sales * (margin / 100);
    const maint = sales * (maintPct / 100);
    let cf = (opProfit - maint) * active;
    if (y === HORIZON) cf += residual + workingCapital;
    flows.push({ year: y, cf, ramp });
    active *= (1 - closureRate / 100);
  }
  return { initial, flows };
}

function npv(initial: number, flows: { cf: number }[], rate: number) {
  let total = initial;
  for (let t = 0; t < flows.length; t++) {
    total += flows[t].cf / Math.pow(1 + rate / 100, t + 1);
  }
  return total;
}

function pvOfFlows(flows: { cf: number }[], rate: number) {
  return flows.reduce((sum, f, i) => sum + f.cf / Math.pow(1 + rate / 100, i + 1), 0);
}

function fmtK(n: number, d = 0) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;
}
function fmtM(n: number, d = 2) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}M`;
}

export default function RestaurantNPVBuilder() {
  const [construction, setConstruction] = useState(900);
  const [preOpening, setPreOpening] = useState(100);
  const [workingCapital, setWorkingCapital] = useState(100);
  const [matureSales, setMatureSales] = useState(2.5);
  const [margin, setMargin] = useState(20);
  const [yearsToMature, setYearsToMature] = useState(3);
  const [maintPct, setMaintPct] = useState(4);
  const [cannibalization, setCannibalization] = useState(0);
  const [closureRate, setClosureRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(10);
  const [residual, setResidual] = useState(150);

  const { initial, flows } = computeFlows(
    construction, preOpening, workingCapital,
    matureSales * 1000, margin, yearsToMature,
    maintPct, cannibalization, closureRate, residual,
  );
  const totalPV = pvOfFlows(flows, discountRate);
  const totalInvestment = construction + preOpening + workingCapital;
  const projectNPV = npv(initial, flows, discountRate);
  const npvPositive = projectNPV > 0;

  // Break-even mature sales: solve for matureSales where NPV = 0
  const breakEvenSales = (() => {
    const testSales = (s: number) => {
      const { initial: init, flows: f } = computeFlows(
        construction, preOpening, workingCapital,
        s * 1000, margin, yearsToMature, maintPct, cannibalization, closureRate, residual,
      );
      return npv(init, f, discountRate);
    };
    let lo = 0, hi = 10;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      if (testSales(mid) < 0) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  })();

  // Break-even development cost: solve for total investment where NPV = 0
  const breakEvenCost = totalPV;

  return (
    <div className="space-y-6">
      {/* Illustrative label */}
      <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent-amber">
          Illustrative investor estimate based on simplified assumptions
        </p>
      </div>

      {/* Management-provided facts vs investor assumptions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
            Management-provided facts
          </div>
          <div className="mt-3 space-y-1 text-[13px] text-slate-200">
            <div className="flex justify-between"><span>Construction & equipment</span><span className="font-mono">{fmtK(construction)}</span></div>
            <div className="flex justify-between"><span>Pre-opening expenses</span><span className="font-mono">{fmtK(preOpening)}</span></div>
            <div className="flex justify-between"><span>Working capital</span><span className="font-mono">{fmtK(workingCapital)}</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">
            Investor assumptions
          </div>
          <div className="mt-3 space-y-1 text-[13px] text-slate-200">
            <div className="flex justify-between"><span>Mature sales</span><span className="font-mono">{fmtM(matureSales)}/yr</span></div>
            <div className="flex justify-between"><span>Operating margin</span><span className="font-mono">{margin}%</span></div>
            <div className="flex justify-between"><span>Discount rate</span><span className="font-mono">{discountRate}%</span></div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Investment assumptions
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <LabeledSlider label="Construction & equipment" value={construction} min={500} max={1500} step={25} prefix="$" suffix="K" onChange={setConstruction} />
          <LabeledSlider label="Pre-opening expenses" value={preOpening} min={0} max={300} step={10} prefix="$" suffix="K" onChange={setPreOpening} />
          <LabeledSlider label="Working capital" value={workingCapital} min={0} max={300} step={10} prefix="$" suffix="K" onChange={setWorkingCapital} />
          <LabeledSlider label="Mature annual sales" value={matureSales} min={1} max={4} step={0.1} prefix="$" suffix="M" onChange={setMatureSales} />
          <LabeledSlider label="Operating margin" value={margin} min={8} max={30} step={1} suffix="%" onChange={setMargin} />
          <LabeledSlider label="Years to maturity" value={yearsToMature} min={2} max={5} step={1} onChange={setYearsToMature} />
          <LabeledSlider label="Maintenance capex" value={maintPct} min={1} max={8} step={0.5} suffix="% sales" onChange={setMaintPct} />
          <LabeledSlider label="Cannibalization" value={cannibalization} min={0} max={15} step={1} suffix="%" onChange={setCannibalization} />
          <LabeledSlider label="Discount rate" value={discountRate} min={6} max={16} step={0.5} suffix="%" onChange={setDiscountRate} />
          <LabeledSlider label="Residual value (Yr 5)" value={residual} min={0} max={400} step={25} prefix="$" suffix="K" onChange={setResidual} />
        </div>
      </div>

      {/* Cash flow table */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
          Incremental cash flows and present values
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-white/20 text-right">
                <th className="py-2 pr-4 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Year</th>
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Cash flow</th>
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Ramp</th>
                <th className="py-2 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Disc. factor</th>
                <th className="py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">PV</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 text-left text-slate-300">Year 0 (initial)</td>
                <td className="py-2 pr-4 text-accent-red">{fmtK(initial)}</td>
                <td className="py-2 pr-4 text-slate-500">—</td>
                <td className="py-2 pr-4 text-slate-500">1.000</td>
                <td className="py-2 text-accent-red">{fmtK(initial)}</td>
              </tr>
              {flows.map((f) => {
                const df = 1 / Math.pow(1 + discountRate / 100, f.year);
                const pv = f.cf * df;
                return (
                  <tr key={f.year} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-left text-slate-300">
                      Year {f.year}{f.year === HORIZON && " + residual"}
                    </td>
                    <td className={cn("py-2 pr-4", f.cf >= 0 ? "text-accent-green" : "text-accent-red")}>{fmtK(f.cf)}</td>
                    <td className="py-2 pr-4 text-slate-400">{(f.ramp * 100).toFixed(0)}%</td>
                    <td className="py-2 pr-4 text-slate-400">{df.toFixed(3)}</td>
                    <td className="py-2 text-white">{fmtK(pv)}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-white/20">
                <td className="py-3 pr-4 text-left font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400">Total PV of cash flows</td>
                <td colSpan={3} />
                <td className="py-3 text-accent-cyan">{fmtK(totalPV)}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-left font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400">Initial investment</td>
                <td colSpan={3} />
                <td className="py-2 text-accent-red">−{fmtK(totalInvestment)}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 text-left font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400">NPV</td>
                <td colSpan={3} />
                <td className={cn("py-3 text-[16px]", npvPositive ? "text-accent-green" : "text-accent-red")}>
                  {npvPositive ? "+" : "−"}{fmtK(Math.abs(projectNPV))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* NPV formula */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
          <BlockMath>
            {String.raw`NPV = \sum_{t=1}^{5} \frac{CF_t}{(1+r)^t} - C_0 = ${fmtK(Math.round(projectNPV))}`}
          </BlockMath>
        </div>
      </div>

      {/* Break-even readouts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">NPV</div>
          <div className={cn("mt-2 font-mono text-[18px] tabular-nums", npvPositive ? "text-accent-green" : "text-accent-red")}>
            {npvPositive ? "+" : "−"}{fmtK(Math.abs(projectNPV))}
          </div>
        </div>
        <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-amber">Break-even mature sales</div>
          <div className="mt-2 font-mono text-[18px] tabular-nums text-white">{fmtM(breakEvenSales)}</div>
          <div className="mt-1 text-[11px] text-slate-400">per store / year</div>
        </div>
        <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-amber">Max tolerable dev cost</div>
          <div className="mt-2 font-mono text-[18px] tabular-nums text-white">{fmtK(Math.round(breakEvenCost))}</div>
          <div className="mt-1 text-[11px] text-slate-400">total initial investment</div>
        </div>
      </div>

      {/* Interpretation */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        npvPositive ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]",
      )}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {npvPositive ? (
            <>
              The location creates an estimated{" "}
              <span className="text-accent-green">{fmtK(Math.round(projectNPV))}</span> of value.
              Sales would need to fall to{" "}
              <span className="text-white">{fmtM(breakEvenSales)}/year</span> at maturity before
              NPV turns negative — that is the cushion the investment has.
            </>
          ) : (
            <>
              The location destroys an estimated{" "}
              <span className="text-accent-red">{fmtK(Math.abs(Math.round(projectNPV)))}</span> of
              value under these assumptions. Mature sales of{" "}
              <span className="text-white">{fmtM(breakEvenSales)}/year</span> would be required to
              reach break-even.
            </>
          )}
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-300">
          Note: restaurant-level operating margin is not the same as free cash flow. Maintenance
          capital expenditure, working capital, and the recovery of working capital at the end of
          the horizon all affect the incremental cash flow. This simplified model excludes detailed
          tax effects.
        </p>
      </div>
    </div>
  );
}
