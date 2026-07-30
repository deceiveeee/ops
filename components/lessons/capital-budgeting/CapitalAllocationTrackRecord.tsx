"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Year = "yr1" | "yr2" | "yr3" | "yr4" | "yr5";

const YEARS: { key: Year; label: string }[] = [
  { key: "yr1", label: "Year 1" }, { key: "yr2", label: "Year 2" },
  { key: "yr3", label: "Year 3" }, { key: "yr4", label: "Year 4" },
  { key: "yr5", label: "Year 5" },
];

const DATA: Record<Year, {
  ocf: number; capex: number; acquisitions: number; debtRepaid: number;
  dividends: number; buybacks: number; dilutedShares: number; cash: number; roic: number; impairments: number;
}> = {
  yr1: { ocf: 320, capex: 180, acquisitions: 0, debtRepaid: 40, dividends: 30, buybacks: 20, dilutedShares: 100, cash: 120, roic: 14, impairments: 0 },
  yr2: { ocf: 350, capex: 200, acquisitions: 150, debtRepaid: 20, dividends: 35, buybacks: 50, dilutedShares: 98, cash: 95, roic: 13, impairments: 0 },
  yr3: { ocf: 340, capex: 220, acquisitions: 200, debtRepaid: 10, dividends: 40, buybacks: 60, dilutedShares: 97, cash: 75, roic: 11, impairments: 30 },
  yr4: { ocf: 380, capex: 210, acquisitions: 100, debtRepaid: 15, dividends: 45, buybacks: 80, dilutedShares: 96, cash: 85, roic: 10, impairments: 0 },
  yr5: { ocf: 400, capex: 230, acquisitions: 0, debtRepaid: 30, dividends: 50, buybacks: 70, dilutedShares: 95, cash: 105, roic: 10, impairments: 0 },
};

function fmt(n: number, d = 0) {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

export default function CapitalAllocationTrackRecord() {
  const [active, setActive] = useState<Year>("yr1");
  const d = DATA[active];

  return (
    <div className="space-y-6">
      {/* Year selector */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Year">
        {YEARS.map((y) => (
          <button key={y.key} type="button" role="tab"
            aria-selected={active === y.key}
            onClick={() => setActive(y.key)}
            className={cn("rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              active === y.key ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber")}>
            {y.label}
          </button>
        ))}
      </div>

      {/* Sources and uses */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-green">Sources of cash</div>
          <div className="mt-3 space-y-1 text-[13px]">
            <Row label="Operating cash flow" value={`+$${fmt(d.ocf)}M`} />
            <Row label="Acquisition-related" value={d.acquisitions > 0 ? "Cash deployed" : "—"} />
          </div>
        </div>
        <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-red">Uses of cash</div>
          <div className="mt-3 space-y-1 text-[13px]">
            <Row label="Capital expenditure" value={`−$${fmt(d.capex)}M`} />
            <Row label="Acquisitions" value={d.acquisitions > 0 ? `−$${fmt(d.acquisitions)}M` : "—"} />
            <Row label="Debt repayment" value={`−$${fmt(d.debtRepaid)}M`} />
            <Row label="Dividends" value={`−$${fmt(d.dividends)}M`} />
            <Row label="Buybacks" value={`−$${fmt(d.buybacks)}M`} />
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Diluted shares (M)" value={fmt(d.dilutedShares)} />
        <Metric label="Cash balance" value={`$${fmt(d.cash)}M`} />
        <Metric label="ROIC" value={`${fmt(d.roic)}%`} tone={d.roic >= 12 ? "green" : d.roic >= 10 ? "amber" : "red"} />
        <Metric label="Impairments" value={d.impairments > 0 ? `−$${fmt(d.impairments)}M` : "$0"} tone={d.impairments > 0 ? "red" : "neutral"} />
      </div>

      {/* 5-year trend table */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">5-year trend</div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-white/20 text-right">
                <th className="py-2 pr-4 text-left font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Metric</th>
                {YEARS.map((y) => (
                  <th key={y.key} className={cn("py-2 pr-4 font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400", active === y.key && "text-accent-amber")}>{y.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-sans tabular-nums">
              {([
                { label: "Operating CF", key: "ocf" as const, prefix: "$", suffix: "M" },
                { label: "Capex", key: "capex" as const, prefix: "$", suffix: "M" },
                { label: "Acquisitions", key: "acquisitions" as const, prefix: "$", suffix: "M" },
                { label: "Buybacks", key: "buybacks" as const, prefix: "$", suffix: "M" },
                { label: "Diluted shares", key: "dilutedShares" as const, prefix: "", suffix: "M" },
                { label: "ROIC", key: "roic" as const, prefix: "", suffix: "%" },
                { label: "Impairments", key: "impairments" as const, prefix: "$", suffix: "M" },
              ]).map((row) => (
                <tr key={row.key} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-left text-slate-300">{row.label}</td>
                  {YEARS.map((y) => (
                    <td key={y.key} className={cn("py-2 pr-4 text-right", active === y.key ? "text-white" : "text-slate-400")}>
                      {row.prefix}{fmt(DATA[y.key][row.key])}{row.suffix}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment prompt */}
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Assessment questions</div>
        <ul className="mt-3 space-y-2">
          {[
            "Did acquisitions create value? (Check Year 3 impairments.)",
            "Did buybacks actually reduce diluted shares? (100M → 95M over 5 years.)",
            "Is ROIC trending up or down? (14% → 10%.)",
            "Is capex growing faster than operating cash flow?",
            "Was debt repayment prioritized appropriately?",
          ].map((q) => (
            <li key={q} className="flex items-start gap-2.5 text-[14px] leading-[1.55] text-slate-100">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{q}
            </li>
          ))}
        </ul>
        <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-300">
          Do not produce an automatic letter grade. Require evidence from the data for each conclusion.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-slate-300">{label}</span><span className="font-sans text-white">{value}</span></div>;
}
function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "green" | "red" | "amber" }) {
  const text = tone === "green" ? "text-accent-green" : tone === "red" ? "text-accent-red" : tone === "amber" ? "text-accent-amber" : "text-white";
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950/40 p-3">
      <div className="font-sans text-[10px] uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className={cn("mt-1.5 font-sans text-[16px] tabular-nums", text)}>{value}</div>
    </div>
  );
}
