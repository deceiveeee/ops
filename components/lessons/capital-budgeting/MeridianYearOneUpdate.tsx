"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Area = "openings" | "cost" | "sales" | "margin" | "synergies" | "integration" | "shares";

const DATA: Record<Area, { label: string; original: string; actual: string; tone: "red" | "amber" | "green" }> = {
  openings: { label: "Stores opened", original: "50 planned", actual: "40 actual", tone: "amber" },
  cost: { label: "Opening cost / store", original: "$1.60M all-in", actual: "$1.75M", tone: "red" },
  sales: { label: "Initial sales trajectory", original: "On plan", actual: "8% below plan", tone: "red" },
  margin: { label: "Restaurant margin", original: "21% target", actual: "18%", tone: "red" },
  synergies: { label: "Acquisition synergies", original: "$25M annual target", actual: "$8M annualized", tone: "red" },
  integration: { label: "Integration cost", original: "$40M", actual: "$65M updated", tone: "red" },
  shares: { label: "Diluted share count", original: "Remaining capital for buyback", actual: "Unchanged — no net reduction", tone: "red" },
};

const ORDER: Area[] = ["openings", "cost", "sales", "margin", "synergies", "integration", "shares"];

export default function MeridianYearOneUpdate() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          One year has passed. Here are the actual results compared with the original plan. How should
          the investment thesis change?
        </p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-white/20 text-left">
                <th className="py-2 pr-4 font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Metric</th>
                <th className="py-2 pr-4 font-sans text-[10px] uppercase tracking-[0.14em] text-slate-400">Original</th>
                <th className="py-2 font-sans text-[10px] uppercase tracking-[0.14em] text-accent-red">Year 1 Actual</th>
              </tr>
            </thead>
            <tbody>
              {ORDER.map((key) => {
                const d = DATA[key];
                return (
                  <tr key={key} className="border-b border-white/5">
                    <td className="py-2.5 pr-4 text-slate-200">{d.label}</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-400">{d.original}</td>
                    <td className={cn("py-2.5 font-sans", d.tone === "red" ? "text-accent-red" : d.tone === "amber" ? "text-accent-amber" : "text-accent-green")}>{d.actual}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">Impact on the thesis</div>
        <ul className="mt-3 space-y-2.5">
          {[
            "Store NPV is lower: higher cost, slower ramp, weaker margins, more cannibalization.",
            "Acquisition NPV is more negative: synergies far below target, integration costs higher.",
            "No share-count reduction despite announced buyback — possibly offsetting stock compensation.",
            "Debt increased — possibly to fund the gap between planned uses and available cash.",
            "The revised plan may need to reduce the store program and abandon further acquisition spending.",
          ].map((x) => (
            <li key={x} className="flex items-start gap-2.5 text-[14px] leading-[1.6] text-slate-100">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />{x}
            </li>
          ))}
        </ul>
        <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-300">
          Do not automatically declare the entire strategy a failure. Some misses may reflect temporary
          execution issues, while others may indicate structural problems. The investor must classify
          each variance.
        </p>
      </div>
    </div>
  );
}
