"use client";

import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";

export default function GoodCompanyVsGoodInvestment() {
  return (
    <div className="space-y-6">
      {/* Formula */}
      <div className="rounded-2xl border border-accent-cyan/25 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
          The surprise formula
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4">
          <BlockMath>
            {String.raw`\text{Surprise} = \text{Actual outcome} - \text{Expected outcome}`}
          </BlockMath>
        </div>
        <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-200">
          Stock returns depend heavily on results relative to expectations, not merely on whether the
          result sounds favorable in isolation.
        </p>
      </div>

      {/* Two companies */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Company A */}
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">
            Company A · the faster grower
          </div>
          <div className="mt-3 space-y-2 text-[14px]">
            <Row label="Expected earnings growth" value="20%" />
            <Row label="Market expectation" value="25%" />
            <Row label="Actual result" value="20%" />
            <div className="border-t border-white/10 pt-2">
              <Row label="Surprise relative to expectations" value="−5%" tone="red" />
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-accent-red/20 bg-accent-red/[0.05] px-4 py-3">
            <BlockMath>{String.raw`\text{Surprise}_A = 20\% - 25\% = -5\%`}</BlockMath>
          </div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
            Company A grew 20% — an impressive rate. But the market expected 25%. The disappointment
            relative to expectations may pressure the stock.
          </p>
        </div>

        {/* Company B */}
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-green">
            Company B · the positive surprise
          </div>
          <div className="mt-3 space-y-2 text-[14px]">
            <Row label="Expected earnings growth" value="5%" />
            <Row label="Market expectation" value="0%" />
            <Row label="Actual result" value="5%" />
            <div className="border-t border-white/10 pt-2">
              <Row label="Surprise relative to expectations" value="+5%" tone="green" />
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-accent-green/20 bg-accent-green/[0.05] px-4 py-3">
            <BlockMath>{String.raw`\text{Surprise}_B = 5\% - 0\% = +5\%`}</BlockMath>
          </div>
          <p className="ops-body mt-2 text-[13px] leading-[1.55] text-slate-300">
            Company B grew only 5% — slower than A. But the market expected nothing. The positive
            surprise may lift the stock.
          </p>
        </div>
      </div>

      {/* Key insight */}
      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          A good company can be a poor investment if the price assumes even better performance.
        </p>
        <p className="ops-body mt-3 text-[15px] leading-[1.65] text-slate-200">
          Analyzing the company is insufficient. The investor must also analyze what the price appears
          to assume. Company A is the better business; Company B produced the better investment result
          — because the surprise was positive.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "red" | "green" }) {
  const text = tone === "red" ? "text-accent-red" : tone === "green" ? "text-accent-green" : "text-white";
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-slate-300">{label}</span>
      <span className={cn("font-mono tabular-nums", text)}>{value}</span>
    </div>
  );
}
