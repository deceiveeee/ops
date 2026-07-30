"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) { return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }
function fmtK(n: number, d = 0) { return `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`; }

const HORIZON = 5;

function LabeledSlider({ label, value, min, max, step, suffix, prefix, onChange, tag }: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void; tag?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label} {tag && <span className="ml-1 text-[9px] text-accent-cyan">{tag}</span>}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`} />
    </div>
  );
}

export default function MeridianStoreNPVModel() {
  const [devCost, setDevCost] = useState(1.30);
  const [preOpening, setPreOpening] = useState(0.10);
  const [workingCap, setWorkingCap] = useState(0.10);
  const [matureSales, setMatureSales] = useState(2.7);
  const [margin, setMargin] = useState(21);
  const [ramp1, setRamp1] = useState(15);
  const [ramp2, setRamp2] = useState(50);
  const [maintPct, setMaintPct] = useState(4);
  const [cannibalization, setCannibalization] = useState(3);
  const [taxRate, setTaxRate] = useState(21);
  const [discountRate, setDiscountRate] = useState(10);
  const [continuingMultiple, setContinuingMultiple] = useState(4);

  const totalInitial = devCost + preOpening + workingCap;
  const flows: number[] = [];
  for (let y = 1; y <= HORIZON; y++) {
    const ramp = y === 1 ? ramp1 / 100 : y === 2 ? ramp2 / 100 : 1;
    const sales = matureSales * 1000 * ramp * (1 - cannibalization / 100);
    const opProfit = sales * (margin / 100);
    const maint = sales * (maintPct / 100);
    const afterTax = (opProfit - maint) * (1 - taxRate / 100);
    flows.push(afterTax);
  }
  // Continuing value at end of Year 5
  const finalCF = flows[HORIZON - 1];
  const continuingValue = finalCF * continuingMultiple;
  flows[HORIZON - 1] += continuingValue + workingCap * 1000;

  let pvTotal = -totalInitial * 1000;
  const pvByYear: number[] = [];
  for (let t = 0; t < flows.length; t++) {
    const pv = flows[t] / Math.pow(1 + discountRate / 100, t + 1);
    pvByYear.push(pv);
    pvTotal += pv;
  }
  const pvBenefits = pvTotal + totalInitial * 1000;
  const npv = pvTotal;
  const npvPositive = npv > 0;

  // IRR via bisection
  let irrLo = -0.9, irrHi = 5;
  for (let i = 0; i < 60; i++) {
    const mid = (irrLo + irrHi) / 2;
    const r = mid * 100;
    let v = -totalInitial * 1000;
    for (let t = 0; t < HORIZON; t++) {
      const ramp = t === 0 ? ramp1 / 100 : t === 1 ? ramp2 / 100 : 1;
      const sales = matureSales * 1000 * ramp * (1 - cannibalization / 100);
      const afterTax = (sales * (margin / 100) - sales * (maintPct / 100)) * (1 - taxRate / 100);
      let cf = afterTax;
      if (t === HORIZON - 1) cf += afterTax * continuingMultiple + workingCap * 1000;
      v += cf / Math.pow(1 + r / 100, t + 1);
    }
    if (v > 0) irrLo = mid; else irrHi = mid;
  }
  const irr = ((irrLo + irrHi) / 2) * 100;

  // Payback
  let cumCF = -totalInitial * 1000;
  let payback = -1;
  for (let t = 0; t < HORIZON; t++) {
    const prev = cumCF;
    cumCF += flows[t];
    if (cumCF >= 0) { payback = t + (0 - prev) / flows[t]; break; }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
        <p className="font-sans text-[12px] uppercase tracking-[0.14em] text-accent-amber">
          Fictional case · simplified model · all figures illustrative
        </p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Per-store assumptions</div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <LabeledSlider label="Physical development" value={devCost} min={1.0} max={2.0} step={0.05} prefix="$" suffix="M" onChange={setDevCost} tag="mgmt target" />
          <LabeledSlider label="Pre-opening costs" value={preOpening} min={0} max={0.3} step={0.05} prefix="$" suffix="M" onChange={setPreOpening} tag="assumption" />
          <LabeledSlider label="Working capital" value={workingCap} min={0} max={0.3} step={0.05} prefix="$" suffix="M" onChange={setWorkingCap} tag="assumption" />
          <LabeledSlider label="Mature annual sales" value={matureSales} min={1.5} max={4.0} step={0.1} prefix="$" suffix="M" onChange={setMatureSales} tag="mgmt target" />
          <LabeledSlider label="Restaurant margin" value={margin} min={10} max={30} step={1} suffix="%" onChange={setMargin} tag="mgmt target" />
          <LabeledSlider label="Year 1 ramp" value={ramp1} min={5} max={40} step={5} suffix="%" onChange={setRamp1} tag="assumption" />
          <LabeledSlider label="Year 2 ramp" value={ramp2} min={20} max={80} step={5} suffix="%" onChange={setRamp2} tag="assumption" />
          <LabeledSlider label="Maintenance capex" value={maintPct} min={1} max={8} step={0.5} suffix="% sales" onChange={setMaintPct} tag="assumption" />
          <LabeledSlider label="Cannibalization" value={cannibalization} min={0} max={15} step={1} suffix="%" onChange={setCannibalization} tag="assumption" />
          <LabeledSlider label="Tax rate" value={taxRate} min={0} max={35} step={1} suffix="%" onChange={setTaxRate} tag="assumption" />
          <LabeledSlider label="Discount rate" value={discountRate} min={7} max={14} step={0.5} suffix="%" onChange={setDiscountRate} tag="assumption" />
          <LabeledSlider label="Continuing multiple" value={continuingMultiple} min={0} max={8} step={1} suffix="×" onChange={setContinuingMultiple} tag="assumption" />
        </div>
      </div>

      {/* Cash flow table */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/20 text-right">
                <th className="py-2 pr-4 text-left font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Year</th>
                <th className="py-2 pr-4 font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Cash flow</th>
                <th className="py-2 pr-4 font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Disc. factor</th>
                <th className="py-2 font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">PV</th>
              </tr>
            </thead>
            <tbody className="font-sans tabular-nums">
              <tr className="border-b border-white/5">
                <td className="py-2 pr-4 text-left text-slate-300">Year 0</td>
                <td className="py-2 pr-4 text-accent-red">−{fmtK(Math.round(totalInitial * 1000))}</td>
                <td className="py-2 pr-4 text-slate-500">1.000</td>
                <td className="py-2 text-accent-red">−{fmtK(Math.round(totalInitial * 1000))}</td>
              </tr>
              {flows.map((f, i) => {
                const df = 1 / Math.pow(1 + discountRate / 100, i + 1);
                return (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 pr-4 text-left text-slate-300">Year {i + 1}{i === HORIZON - 1 && " + cont."}</td>
                    <td className={cn("py-2 pr-4", f >= 0 ? "text-accent-green" : "text-accent-red")}>{fmtK(Math.round(f))}</td>
                    <td className="py-2 pr-4 text-slate-400">{df.toFixed(3)}</td>
                    <td className="py-2 text-white">{fmtK(Math.round(pvByYear[i]))}</td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-white/20">
                <td className="py-3 pr-4 text-left font-sans text-[11px] uppercase text-slate-400">NPV per store</td>
                <td colSpan={2} />
                <td className={cn("py-3 text-[16px]", npvPositive ? "text-accent-green" : "text-accent-red")}>
                  {npv >= 0 ? "+" : "−"}{fmtK(Math.abs(Math.round(npv)))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Readout label="NPV / store" value={`${npv >= 0 ? "+" : "−"}${fmtK(Math.abs(Math.round(npv)))}`} tone={npvPositive ? "green" : "red"} />
        <Readout label="IRR" value={`${fmt(irr)}%`} tone={irr >= discountRate ? "green" : "red"} />
        <Readout label="Payback" value={payback > 0 ? `${fmt(payback, 1)} yrs` : "> 5 yrs"} tone="amber" />
        <Readout label="Total initial invest." value={fmtK(Math.round(totalInitial * 1000))} />
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        npvPositive ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <p className="ops-body text-[15px] leading-[1.7] text-slate-100">
          {npvPositive
            ? <>Under these assumptions, each new store creates an estimated <span className="text-accent-green">{fmtK(Math.round(npv))}</span> of value. The IRR of {fmt(irr)}% exceeds the {discountRate}% required return.</>
            : <>Under these assumptions, each new store destroys an estimated <span className="text-accent-red">{fmtK(Math.abs(Math.round(npv)))}</span> of value. The IRR of {fmt(irr)}% is below the {discountRate}% required return.</>}
          {" "}The continuing-value assumption contributes {fmtK(Math.round(continuingValue))} ({Math.round(continuingValue / Math.max(pvBenefits, 1) * 100)}% of PV). If long-run margins or growth assumptions are too aggressive, the NPV may be overstated.
        </p>
      </div>
    </div>
  );
}

function Readout({ label, value, tone = "neutral" }: {
  label: string; value: string; tone?: "neutral" | "green" | "red" | "amber";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : tone === "amber" ? "text-accent-amber" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
