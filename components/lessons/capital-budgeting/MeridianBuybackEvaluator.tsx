"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 2) { return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }); }

export default function MeridianBuybackEvaluator() {
  const [sharePrice, setSharePrice] = useState(42);
  const [intrinsicValue, setIntrinsicValue] = useState(45);
  const [buybackAmount, setBuybackAmount] = useState(100);
  const [shares, setShares] = useState(100);
  const [debtFinanced, setDebtFinanced] = useState(0);

  const equityValue = intrinsicValue * shares;
  const cashUsed = buybackAmount - debtFinanced;
  const sharesRetired = buybackAmount / sharePrice;
  const remainingEquity = equityValue - buybackAmount;
  const remainingShares = shares - sharesRetired;
  const newIV = remainingShares > 0 ? remainingEquity / remainingShares : 0;
  const valueChange = newIV - intrinsicValue;
  const valueChangePct = intrinsicValue > 0 ? (valueChange / intrinsicValue) * 100 : 0;
  const discount = ((intrinsicValue - sharePrice) / intrinsicValue) * 100;
  const attractive = sharePrice < intrinsicValue;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Slider label="Share price" value={sharePrice} min={25} max={60} step={1} prefix="$" onChange={setSharePrice} tag="market" />
          <Slider label="Intrinsic value est." value={intrinsicValue} min={25} max={60} step={1} prefix="$" onChange={setIntrinsicValue} tag="analyst est." />
          <Slider label="Buyback amount" value={buybackAmount} min={0} max={300} step={10} prefix="$" suffix="M" onChange={setBuybackAmount} />
          <Slider label="Shares outstanding" value={shares} min={50} max={200} step={5} suffix="M" onChange={setShares} tag="disclosed" />
          <Slider label="Debt-financed portion" value={debtFinanced} min={0} max={buybackAmount} step={10} prefix="$" suffix="M" onChange={(v) => setDebtFinanced(Math.min(v, buybackAmount))} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Readout label="Discount to IV" value={`${fmt(discount)}%`} tone={attractive ? "green" : "red"} />
        <Readout label="Shares retired" value={`${fmt(sharesRetired, 1)}M`} />
        <Readout label="New IV / share" value={`$${fmt(newIV)}`} tone={valueChange > 0 ? "green" : "red"} />
        <Readout label="Value Δ / share" value={`${valueChange >= 0 ? "+" : "−"}$${fmt(Math.abs(valueChange))}`} tone={valueChange > 0 ? "green" : "red"} />
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        valueChange > 0 ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
          {valueChange > 0
            ? <>Shares are estimated <span className="text-accent-green">{fmt(Math.abs(discount))}% below intrinsic value</span>.
            Repurchasing creates value for continuing shareholders (+{fmt(valueChangePct)}% per share). But
            the estimate is uncertain — what if intrinsic value is only $40?</>
            : <>Shares are estimated <span className="text-accent-red">{fmt(Math.abs(discount))}% above intrinsic value</span>.
            Repurchasing destroys value for continuing shareholders (−{fmt(Math.abs(valueChangePct))}% per share).</>}
          {debtFinanced > 0 && <> Additionally, ${debtFinanced}M of the buyback is debt-financed, increasing leverage.</>}
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-300">
          The $45 intrinsic-value estimate is not an objective fact. The investor should test
          what happens at $40, compare the buyback with store investment and debt repayment, and
          check whether the buyback merely offsets stock compensation.
        </p>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix, prefix, onChange, tag }: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void; tag?: string;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label} {tag && <span className="ml-1 text-[9px] text-accent-cyan">{tag}</span>}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`} />
    </div>
  );
}
function Readout({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "green" | "red" }) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-mono text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
