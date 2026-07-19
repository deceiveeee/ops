"use client";

const PASSIVE = [
  "The market is broad, liquid, and heavily researched",
  "The investor lacks a credible edge",
  "Low cost and diversification are priorities",
  "Time available for research is limited",
  "The investor does not want to evaluate managers continuously",
  "The horizon is long",
];

const ACTIVE = [
  "The source of edge is specific and testable",
  "The market or opportunity is less efficiently researched",
  "The investor can tolerate tracking error",
  "Fees and trading costs are manageable relative to expected alpha",
  "Position sizing is explicit and disciplined",
  "The strategy has a plausible reason to persist",
  "The investor can survive periods of underperformance",
];

const BLENDED_TRAITS = [
  "Broad passive core for market exposure at low cost",
  "Smaller active allocation requiring explicit justification",
  "Active positions must explain valuation gap, market expectation, correction mechanism, and downside risk",
  "Active errors must not threaten the overall portfolio",
];

export default function ImplementationChoice() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Implementation follows from beliefs, edge, and constraints — not from a universal
          ranking of approaches. The same investor may reasonably choose different structures
          across different parts of their portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Passive */}
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
            Passive approach
          </div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Accept benchmark weights through low-cost diversified funds.
          </p>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Generally more defensible when
          </div>
          <ul className="mt-2 space-y-2">
            {PASSIVE.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>

        {/* Active */}
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-amber">
            Active approach
          </div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Deliberately depart from benchmark weights to add value or manage risk.
          </p>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Potentially defensible when
          </div>
          <ul className="mt-2 space-y-2">
            {ACTIVE.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>

        {/* Blended */}
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent-green">
            Blended approach
          </div>
          <p className="ops-body mt-2 text-[14px] leading-[1.6] text-slate-100">
            Combine a low-cost passive core with smaller active satellite positions.
          </p>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">
            Coherent when
          </div>
          <ul className="mt-2 space-y-2">
            {BLENDED_TRAITS.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          The portfolio structure should follow the investor&apos;s beliefs, edge, constraints,
          and ability to evaluate decisions.
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-200">
          None of these structures is universally optimal. Blended investing is not prescribed as
          a default — it is one defensible answer when the investor has a core exposure need and a
          specific, limited active opportunity.
        </p>
      </div>
    </div>
  );
}
