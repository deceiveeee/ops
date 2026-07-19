"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

function fmt(n: number, d = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function EPSAccretionVsAcquisitionValue() {
  const [buyerEPS, setBuyerEPS] = useState(5.0);
  const [buyerShares, setBuyerShares] = useState(100);
  const [targetEarnings, setTargetEarnings] = useState(30);
  const [synergyEarnings, setSynergyEarnings] = useState(10);
  const [integrationCost, setIntegrationCost] = useState(5);
  const [price, setPrice] = useState(400);
  const [financing, setFinancing] = useState<"stock" | "debt">("stock");
  const [debtRate, setDebtRate] = useState(5);
  const [sharePrice, setSharePrice] = useState(50);

  // Simplified EPS calculation
  const buyerEarnings = buyerEPS * buyerShares;
  const netNewEarnings = targetEarnings + synergyEarnings - integrationCost;
  const postEarnings = buyerEarnings + netNewEarnings;
  const newShares = financing === "stock" ? price / sharePrice : 0;
  const postShares = buyerShares + newShares;
  const debtInterest = financing === "debt" ? (price * debtRate) / 100 : 0;
  const adjustedEarnings = postEarnings - debtInterest;
  const postEPS = adjustedEarnings / postShares;
  const epsChange = ((postEPS - buyerEPS) / buyerEPS) * 100;
  const accretive = postEPS > buyerEPS;

  // NPV (simplified: use earnings as proxy for value, capitalized at share price)
  // Target standalone value, synergy value, minus price and integration
  const targetValue = targetEarnings * sharePrice / buyerEPS; // P/E based
  const synergyValue = synergyEarnings * sharePrice / buyerEPS;
  const npv = targetValue + synergyValue - integrationCost - price;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] px-4 py-3">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent-amber">
          Simplified instructional acquisition model
        </p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Slider label="Buyer EPS" value={buyerEPS} min={1} max={10} step={0.5} prefix="$" onChange={setBuyerEPS} />
          <Slider label="Buyer shares (M)" value={buyerShares} min={50} max={500} step={10} onChange={setBuyerShares} />
          <Slider label="Target earnings" value={targetEarnings} min={0} max={100} step={5} prefix="$" suffix="M" onChange={setTargetEarnings} />
          <Slider label="Synergy earnings" value={synergyEarnings} min={0} max={50} step={5} prefix="$" suffix="M" onChange={setSynergyEarnings} />
          <Slider label="Integration cost" value={integrationCost} min={0} max={30} step={1} prefix="$" suffix="M" onChange={setIntegrationCost} />
          <Slider label="Purchase price" value={price} min={100} max={800} step={25} prefix="$" suffix="M" onChange={setPrice} />
        </div>
        <div className="mt-4">
          <label className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">Financing method</label>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setFinancing("stock")}
              className={cn("rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                financing === "stock" ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/20 text-slate-200 hover:border-accent-amber/60")}>
              Stock
            </button>
            <button type="button" onClick={() => setFinancing("debt")}
              className={cn("rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                financing === "debt" ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/20 text-slate-200 hover:border-accent-amber/60")}>
              Debt
            </button>
          </div>
          {financing === "stock" && (
            <Slider label="Buyer share price" value={sharePrice} min={10} max={100} step={5} prefix="$" onChange={setSharePrice} />
          )}
          {financing === "debt" && (
            <div className="mt-3"><Slider label="Debt interest rate" value={debtRate} min={2} max={10} step={0.5} suffix="%" onChange={setDebtRate} /></div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Readout label="Pre-deal EPS" value={`$${fmt(buyerEPS)}`} />
        <Readout label="Post-deal EPS" value={`$${fmt(postEPS)}`} tone={accretive ? "green" : "red"} />
        <Readout label="EPS change" value={`${epsChange >= 0 ? "+" : ""}${fmt(epsChange)}%`} tone={accretive ? "green" : "red"} />
        <Readout label="Est. acquisition NPV" value={`$${fmt(npv)}M`} tone={npv > 0 ? "green" : "red"} />
      </div>

      {/* The contradiction */}
      <div className={cn(
        "rounded-2xl border p-5 sm:p-6",
        accretive && npv < 0 ? "border-accent-red/30 bg-accent-red/[0.05]"
        : !accretive && npv > 0 ? "border-accent-amber/30 bg-accent-amber/[0.05]"
        : "border-white/12 bg-white/[0.03]",
      )}>
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          EPS accretion vs. economic value
        </div>
        <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
          {accretive && npv < 0 ? (
            <>The deal is <span className="text-accent-green">EPS accretive</span> (+{fmt(epsChange)}%)
            but has <span className="text-accent-red">negative NPV</span> (${fmt(npv)}M). EPS rose
            because of financing effects or accounting treatment — but the buyer paid more than the
            acquired earnings and synergies were worth.</>
          ) : !accretive && npv > 0 ? (
            <>The deal is <span className="text-accent-red">EPS dilutive</span> ({fmt(epsChange)}%)
            but has <span className="text-accent-green">positive NPV</span> (${fmt(npv)}M). Near-term
            dilution may reflect share issuance or integration costs, while the long-term economics
            are attractive.</>
          ) : accretive && npv > 0 ? (
            <>The deal is both <span className="text-accent-green">EPS accretive</span> and{" "}
            <span className="text-accent-green">value-creating</span>. But do not conclude that EPS
            accretion proves value creation — they can easily diverge.</>
          ) : (
            <>Both EPS and NPV are negative. The deal is dilutive and value-destroying.</>
          )}
        </p>
        <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-3">
          <BlockMath>{String.raw`NPV = V_{\text{target}} + V_{\text{synergies}} - \text{integration} - \text{price}`}</BlockMath>
        </div>
        <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-300">
          EPS accretion answers an <span className="text-white">accounting</span> question. NPV
          answers an <span className="text-white">economic value</span> question. They can disagree.
        </p>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix, prefix, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  suffix?: string; prefix?: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
        <span>{label}</span>
        <span className="text-[14px] tabular-nums text-accent-amber">{prefix}{value}{suffix}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent-amber focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
        aria-valuetext={`${prefix}${value}${suffix}`}
      />
    </div>
  );
}

function Readout({ label, value, tone = "neutral" }: {
  label: string; value: string; tone?: "neutral" | "green" | "red";
}) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-mono text-[15px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
