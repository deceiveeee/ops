"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function fmt(n: number) { return `$${n}M`; }

type Use = { key: string; label: string; amount: number; required: boolean; note: string };

const USES: Use[] = [
  { key: "maintenance", label: "Maintenance investment", amount: 100, required: true, note: "Protects existing operations" },
  { key: "expansion", label: "Store expansion (150 stores, all-in)", amount: 250, required: false, note: "Full program budget" },
  { key: "acquisition", label: "Coastal Kitchen acquisition", amount: 300, required: false, note: "Purchase price" },
  { key: "buyback", label: "Share repurchase (residual)", amount: 0, required: false, note: "Remaining capital" },
];

export default function MeridianSourcesAndUses() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    maintenance: true, expansion: true, acquisition: true, buyback: true,
  });

  const available = 600;
  const totalUses = USES.filter((u) => enabled[u.key]).reduce((s, u) => s + u.amount, 0);
  const gap = totalUses - available;
  const minLiquidity = 80;
  const actualAvailable = available - minLiquidity;
  const fundingGap = totalUses - actualAvailable;

  const toggle = (key: string) => {
    if (USES.find((u) => u.key === key)?.required) return;
    setEnabled((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Sources and uses of cash
        </div>

        {/* Sources */}
        <div className="mt-4 rounded-xl border border-accent-green/25 bg-accent-green/[0.04] p-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-green">Sources</div>
          <div className="mt-2 flex justify-between text-[15px]">
            <span className="text-slate-200">Cash available for allocation</span>
            <span className="font-mono text-white">{fmt(available)}</span>
          </div>
          <div className="mt-1 flex justify-between text-[13px] border-t border-white/10 pt-1">
            <span className="text-slate-400">Less: minimum prudent liquidity</span>
            <span className="font-mono text-accent-red">−{fmt(minLiquidity)}</span>
          </div>
          <div className="mt-1 flex justify-between text-[14px] font-medium border-t border-white/10 pt-1">
            <span className="text-slate-200">Truly discretionary capital</span>
            <span className="font-mono text-accent-amber">{fmt(actualAvailable)}</span>
          </div>
        </div>

        {/* Uses */}
        <div className="mt-3 rounded-xl border border-accent-red/25 bg-accent-red/[0.04] p-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-red">Proposed uses</div>
          <div className="mt-2 space-y-2">
            {USES.map((u) => (
              <div key={u.key} className="flex items-center gap-3">
                <button
                  type="button" disabled={u.required}
                  onClick={() => toggle(u.key)}
                  className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border text-[10px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                    u.required ? "border-accent-cyan/40 bg-accent-cyan/20 text-accent-cyan cursor-default"
                    : enabled[u.key] ? "border-accent-amber/50 bg-accent-amber/15 text-accent-amber"
                    : "border-white/20 text-transparent hover:border-white/40")}
                  aria-label={`${enabled[u.key] ? "Disable" : "Enable"} ${u.label}`}
                >
                  ✓
                </button>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between">
                    <span className={cn("text-[14px]", enabled[u.key] ? "text-white" : "text-slate-500")}>
                      {u.label} {u.required && <span className="text-[10px] uppercase tracking-[0.14em] text-accent-cyan">required</span>}
                    </span>
                    <span className={cn("font-mono text-[14px] tabular-nums", enabled[u.key] ? "text-white" : "text-slate-600 line-through")}>
                      {enabled[u.key] ? `−${fmt(u.amount)}` : ""}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">{u.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Funding gap */}
      <div className={cn("rounded-2xl border p-5 sm:p-6",
        fundingGap > 0 ? "border-accent-red/30 bg-accent-red/[0.06]" : "border-accent-green/25 bg-accent-green/[0.05]")}>
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
            {fundingGap > 0 ? "Funding gap" : "Surplus available"}
          </span>
          <span className={cn("font-mono text-[28px] tabular-nums", fundingGap > 0 ? "text-accent-red" : "text-accent-green")}>
            {fundingGap > 0 ? "−" : "+"}{fmt(Math.abs(fundingGap))}
          </span>
        </div>
        {fundingGap > 0 && (
          <>
            <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
              The proposed plan requires <span className="text-white">{fmt(totalUses)}</span> but only{" "}
              <span className="text-white">{fmt(actualAvailable)}</span> is truly discretionary after
              preserving liquidity. The gap is <span className="text-accent-red">{fmt(fundingGap)}</span>.
            </p>
            <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-300">
              Is management planning to borrow? Is some &ldquo;available cash&rdquo; already needed for
              operations? Will the store program be reduced? Will the buyback disappear? Is maintenance
              being understated? Capital-allocation decisions interact.
            </p>
          </>
        )}
        {fundingGap <= 0 && (
          <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-100">
            After preserving liquidity, the selected uses fit within discretionary capital. But this
            does not mean each use creates value — that requires project-level NPV analysis.
          </p>
        )}
      </div>
    </div>
  );
}
