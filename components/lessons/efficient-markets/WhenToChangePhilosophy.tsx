"use client";

const DO_NOT_CHANGE_BECAUSE = [
  "Another strategy recently performed better",
  "One year was disappointing",
  "A popular manager became famous",
  "Market sentiment shifted",
  "Friends are earning higher returns",
  "A speculative sector is temporarily leading",
];

const RECONSIDER_WHEN = [
  "Evidence supporting the philosophy weakens",
  "The assumed edge disappears",
  "Costs rise materially",
  "Market structure changes",
  "Investor constraints change",
  "Implementation becomes inconsistent with stated beliefs",
  "Performance contradicts the thesis over an appropriate horizon",
  "Hidden risks explain previous results",
  "Strategy capacity deteriorates",
  "The benchmark is no longer appropriate",
];

export default function WhenToChangePhilosophy() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          The line between disciplined consistency and stubborn refusal to update is one of the
          hardest judgments in investing. The two columns below describe the kinds of evidence that
          should — and should not — trigger a revision.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-amber">
            Do not change merely because
          </div>
          <ul className="mt-3 space-y-2">
            {DO_NOT_CHANGE_BECAUSE.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5">
          <div className="font-sans text-[11px] uppercase tracking-[0.16em] text-accent-cyan">
            Reconsider when
          </div>
          <ul className="mt-3 space-y-2">
            {RECONSIDER_WHEN.map((x) => (
              <li key={x} className="flex items-start gap-2 text-[14px] leading-[1.55] text-slate-100">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />{x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[18px] leading-[1.5] text-white">
          A philosophy should be stable enough to guide behavior but flexible enough to respond to
          evidence.
        </p>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-200">
          Disciplined consistency holds the course through normal noise. Stubborn refusal holds the
          course after the original reasoning has been invalidated. The difference is whether the
          <span className="text-white"> evidence</span> has changed — not whether the price has moved.
        </p>
      </div>
    </div>
  );
}
