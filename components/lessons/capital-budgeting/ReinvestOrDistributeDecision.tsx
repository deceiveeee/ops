"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number, d = 1) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

type Action = "reinvest" | "distribute" | "retain" | "mixed";

export default function ReinvestOrDistributeDecision() {
  const [reinvestReturn, setReinvestReturn] = useState(7);
  const [required, setRequired] = useState(10);
  const [liquidity, setLiquidity] = useState(50);
  const [balanceSheet, setBalanceSheet] = useState(60);
  const [pick, setPick] = useState<Action | null>(null);

  const reinvestAttractive = reinvestReturn > required;
  const liquidityAdequate = liquidity >= 40;
  const balanceSheetStrong = balanceSheet >= 50;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Slider label="Expected reinvestment return" value={reinvestReturn} min={2} max={25} step={0.5} suffix="%" onChange={setReinvestReturn} />
          <Slider label="Required return" value={required} min={5} max={20} step={0.5} suffix="%" onChange={setRequired} />
          <Slider label="Liquidity position" value={liquidity} min={10} max={100} step={5} suffix="%" onChange={setLiquidity} />
          <Slider label="Balance-sheet strength" value={balanceSheet} min={10} max={100} step={5} suffix="%" onChange={setBalanceSheet} />
        </div>
      </div>

      {/* Status indicators */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatusCard label="Reinvestment" status={reinvestAttractive ? "attractive" : "inadequate"} detail={`${reinvestReturn}% vs ${required}% required`} />
        <StatusCard label="Liquidity" status={liquidityAdequate ? "adequate" : "thin"} detail={`${liquidity}% position`} />
        <StatusCard label="Balance sheet" status={balanceSheetStrong ? "strong" : "stretched"} detail={`${balanceSheet}% strength`} />
      </div>

      {/* Decision */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          What should the company do with excess cash?
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {([
            { key: "reinvest" as Action, label: "Reinvest" },
            { key: "distribute" as Action, label: "Distribute" },
            { key: "retain" as Action, label: "Retain cash" },
            { key: "mixed" as Action, label: "Mixed allocation" },
          ]).map((o) => (
            <button key={o.key} type="button" disabled={pick !== null}
              onClick={() => setPick(o.key)}
              className={cn("rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                !pick && "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber",
                pick === o.key && "border-accent-amber bg-accent-amber/15 text-accent-amber",
                pick !== null && pick !== o.key && "border-white/10 text-slate-500")}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {pick && (
        <div className={cn("rounded-2xl border p-5 sm:p-6",
          (pick === "reinvest" && reinvestAttractive) || (pick === "distribute" && !reinvestAttractive) || pick === "mixed"
            ? "border-accent-green/25 bg-accent-green/[0.05]" : "border-accent-amber/25 bg-accent-amber/[0.05]")}>
          <p className="ops-body text-[16px] leading-[1.7] text-slate-100">
            {pick === "reinvest" && reinvestAttractive && (
              <>Reinvestment is justified: the {reinvestReturn}% expected return exceeds the {required}%
              required return. The company creates value by deploying capital internally.</>
            )}
            {pick === "reinvest" && !reinvestAttractive && (
              <>Reinvestment at {reinvestReturn}% (below the {required}% required) would destroy value.
              A dividend or buyback may protect shareholder value by preventing poor reinvestment.</>
            )}
            {pick === "distribute" && !reinvestAttractive && (
              <>Distribution is appropriate: without attractive internal opportunities, returning cash
              prevents value-destroying reinvestment. Dividends transfer cash to shareholders; buybacks
              add value only if the stock is attractively priced.</>
            )}
            {pick === "distribute" && reinvestAttractive && (
              <>Distribution forgoes a {reinvestReturn}% reinvestment return that exceeds the {required}%
              cost of capital. Unless capacity constraints limit reinvestment, distributing cash here
              may leave value on the table.</>
            )}
            {pick === "retain" && (
              <>Retaining cash provides flexibility, but it earns a low return. Cash retention is most
              defensible when liquidity is thin ({liquidity}%) or credible future opportunities exist.
              Otherwise, it can become inefficient.</>
            )}
            {pick === "mixed" && (
              <>A mixed allocation can be appropriate when reinvestment is marginally attractive,
              liquidity needs some reinforcement, and residual capital can be distributed. The exact
              split depends on the scale and risk of each use.</>
            )}
          </p>
          <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-300">
            Dividends primarily transfer cash to shareholders. They may protect value by preventing
            capital from being reinvested at inadequate returns — but they do not directly create new
            economic value at the moment of distribution.
          </p>
        </div>
      )}
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span><span className="text-[14px] tabular-nums text-accent-amber">{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${value}${suffix}`} />
    </div>
  );
}

function StatusCard({ label, status, detail }: { label: string; status: "attractive" | "inadequate" | "adequate" | "thin" | "strong" | "stretched"; detail: string }) {
  const positive = status === "attractive" || status === "adequate" || status === "strong";
  return (
    <div className={cn("rounded-xl border p-4",
      positive ? "border-accent-green/25 bg-accent-green/[0.04]" : "border-accent-red/25 bg-accent-red/[0.04]")}>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[14px]", positive ? "text-accent-green" : "text-accent-red")}>{status}</div>
      <div className="mt-0.5 text-[12px] text-slate-300">{detail}</div>
    </div>
  );
}
