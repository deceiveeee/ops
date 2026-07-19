"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProtectExistingBusinessDecision() {
  const [level, setLevel] = useState<"full" | "partial" | "minimal">("full");

  const OPTIONS = [
    { key: "full" as const, label: "Fully fund ($100M)", detail: "Protects existing earning power.", saved: 0, risk: "None — current operations sustained." },
    { key: "partial" as const, label: "Partially defer ($70M)", detail: "Save $30M for other uses.", saved: 30, risk: "Some renovation delays; equipment aging; gradual customer-experience erosion possible." },
    { key: "minimal" as const, label: "Sharply reduce ($40M)", detail: "Save $60M for growth or acquisition.", saved: 60, risk: "Significant risk: traffic decline, equipment failure, weaker margins, future catch-up spending needed." },
  ];

  const opt = OPTIONS.find((o) => o.key === level)!;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.6] text-slate-100">
          Maintenance covers restaurant renovation, replacement equipment, required technology, kitchen
          systems, and safety work. What happens if Meridian cuts maintenance to preserve cash for the
          acquisition?
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {OPTIONS.map((o) => (
            <button key={o.key} type="button"
              onClick={() => setLevel(o.key)}
              className={cn("rounded-full border px-4 py-2 text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                level === o.key ? "border-accent-amber bg-accent-amber/15 text-accent-amber" : "border-white/20 text-slate-200 hover:border-accent-amber/60 hover:text-accent-amber")}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className={cn("rounded-2xl border p-5 sm:p-6",
        level === "full" ? "border-accent-green/25 bg-accent-green/[0.05]"
        : level === "partial" ? "border-accent-amber/25 bg-accent-amber/[0.05]"
        : "border-accent-red/25 bg-accent-red/[0.05]")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Immediate cash saved</div>
            <div className={cn("mt-1 font-mono text-[20px]", opt.saved > 0 ? "text-accent-green" : "text-white")}>
              {opt.saved > 0 ? `+$${opt.saved}M` : "$0"}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink-950/40 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Risk to existing operations</div>
            <div className="mt-1 text-[14px] text-slate-100">{opt.risk}</div>
          </div>
        </div>
        <p className="ops-body mt-4 text-[15px] leading-[1.65] text-slate-100">
          {level === "full"
            ? "Maintenance capital may not create visible growth, but it protects existing earning power. The cash flows already embedded in Meridian's valuation depend on restaurants remaining in good condition."
            : level === "partial"
              ? "Saving $30M provides flexibility, but the economic cost may appear later as traffic declines or catch-up spending becomes necessary. The investor should monitor same-store sales trends and maintenance backlog."
              : "Cutting maintenance by 60% is risky. Existing-store deterioration could destroy far more value than the $60M saved. This approach funds growth by cannibalizing the base business."}
        </p>
        <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-400">
          Note: the proposed $100M maintenance estimate may itself be insufficient if stores are aging.
          The investor should compare maintenance spending with depreciation and asset age.
        </p>
      </div>
    </div>
  );
}
