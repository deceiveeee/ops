"use client";

import { cn } from "@/lib/utils";

export default function PlanVsMarketExpectations() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">Prior market expectations</div>
          <ul className="mt-3 space-y-2 text-[14px] text-slate-100">
            {["~100 new stores", "No major acquisition", "$150M share repurchase", "Stable leverage"].map((x) => (
              <li key={x} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{x}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">Management&apos;s announced plan</div>
          <ul className="mt-3 space-y-2 text-[14px] text-slate-100">
            {["150 new stores (50 more than expected)", "$300M acquisition (none expected)", "Minimal immediate buyback", "Possible additional borrowing"].map((x) => (
              <li key={x} className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-red">Information surprise</div>
        <p className="ops-body mt-3 text-[16px] leading-[1.7] text-slate-100">
          The core store expansion may create value. The final store tranche and acquisition appear
          unattractive. The announced plan is <span className="text-white">worse than prior
          expectations</span>. The stock could fall even though part of the plan has positive NPV —
          because investors previously expected a more disciplined allocation.
        </p>
        <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-300">
          This does not predict an exact stock-price move. Stock prices respond to the surprise
          relative to expectations, not to whether the plan is good in absolute terms.
        </p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-accent-green/20 bg-accent-green/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green">Question 1: Does it create value?</div>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.55] text-slate-100">Partially — the first 100 stores and debt repayment create value, but the acquisition and final stores destroy it.</p>
          </div>
          <div className="rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-red">Question 2: Better or worse than expected?</div>
            <p className="ops-body mt-1.5 text-[14px] leading-[1.55] text-slate-100">Worse — the market expected discipline (100 stores, no acquisition). The plan adds negative-NPV projects.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
