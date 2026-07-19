"use client";

import { cn } from "@/lib/utils";

function fmt(n: number) { return `$${n}M`; }

export default function ValueCreatedVsLossAvoided() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-green">Value created (positive NPV)</div>
          <div className="mt-3 space-y-2">
            {[{ l: "Best 100 stores", v: 21 }, { l: "Debt repayment", v: 12 }, { l: "Buyback", v: 7 }].map((x) => (
              <div key={x.l} className="flex justify-between border-b border-white/5 pb-1 text-[14px]">
                <span className="text-slate-200">{x.l}</span><span className="font-mono text-accent-green">+{fmt(x.v)}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1 text-[15px] font-medium">
              <span className="text-white">Total value created</span><span className="font-mono text-accent-green">+{fmt(40)}</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-red">Value destruction avoided</div>
          <div className="mt-3 space-y-2">
            {[{ l: "Acquisition (avoided)", v: 35 }, { l: "Final 50 stores (avoided)", v: 4 }].map((x) => (
              <div key={x.l} className="flex justify-between border-b border-white/5 pb-1 text-[14px]">
                <span className="text-slate-200">{x.l}</span><span className="font-mono text-accent-red">+{fmt(x.v)} saved</span>
              </div>
            ))}
            <div className="flex justify-between pt-1 text-[15px] font-medium">
              <span className="text-white">Total avoided</span><span className="font-mono text-accent-red">+{fmt(39)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.7] text-slate-100">
          Value created and value destruction avoided are <span className="text-white">different
          concepts</span>. Value created comes from positive-NPV uses undertaken. Value destruction
          avoided comes from negative-NPV uses rejected. Liquidity provides strategic flexibility
          that may not have a defensible precise NPV. Do not mechanically add unlike measures without
          explaining the distinction.
        </p>
      </div>
    </div>
  );
}
