"use client";

const MORE_EFFICIENT = [
  "Many sophisticated investors compete for the same information",
  "Information is widely available and cheap to distribute",
  "Liquidity is high — positions can be taken and exited easily",
  "Financing is stable — leverage is available on consistent terms",
  "Trading costs are low and transparent",
  "Arbitrage capital is abundant and patient",
];

const LESS_EFFICIENT = [
  "Informed capital has withdrawn after losses",
  "Uncertainty rises beyond what existing models can price",
  "Liquidity collapses — bid-ask spreads widen, depth disappears",
  "Leverage is reduced — banks pull credit lines and raise hurdles",
  "Forced selling dominates — price moves reflect position unwinds, not views",
  "Inexperienced participants enter rapidly and trade on sentiment",
  "Institutional constraints become binding — risk limits, mandates, regulations",
];

export default function AdaptiveMarketsComparison() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Market efficiency is not a fixed property. It varies across markets, across time, and
          across market conditions. The <span className="text-accent-cyan">adaptive markets</span>{" "}
          view synthesizes traditional and behavioral finance: investors make mistakes, learn from
          them, attract capital when successful, lose capital when wrong, and reshape the
          competitive environment as they enter and leave.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-green">
            Markets may be more efficient when
          </div>
          <ul className="mt-3 space-y-2">
            {MORE_EFFICIENT.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-green" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-red">
            Markets may be less efficient when
          </div>
          <ul className="mt-3 space-y-2">
            {LESS_EFFICIENT.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[17px] leading-[1.5] text-white">
          The strength of market efficiency depends partly on who is trading, what constraints they
          face, and how competitive the environment is.
        </p>
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-amber">
          Caveat
        </div>
        <p className="ops-body mt-2 text-[14px] leading-[1.65] text-slate-100">
          Identifying that conditions are conducive to inefficiency does not mean the timing or
          direction of mispricings can be predicted reliably. Less efficient environments offer
          more opportunity in principle — and more ways to be wrong in practice.
        </p>
      </div>
    </div>
  );
}
