"use client";

import { BlockMath } from "@/components/ui/Math";

const COMPONENTS = [
  {
    label: "Thesis",
    question: "Why is the asset mispriced?",
    example: "The market assumes normalized operating margins of 8%, but the company may return to 12%.",
    points: [
      "The thesis explains what the market appears to assume.",
      "The thesis states your differentiated view in concrete terms.",
      "Without a thesis, the investor merely has an opinion.",
    ],
    tone: "cyan" as const,
  },
  {
    label: "Correction mechanism",
    question: "What may cause expectations to change?",
    example: "Earnings recovery over four to six quarters as new capacity ramps and legacy contracts roll off.",
    points: [
      "Earnings recovery, asset sale, debt repayment, new disclosure, regulatory approval, capital return, index rebalancing, improved unit economics.",
      "A catalyst is not always required — but without a correction mechanism, mispricing can persist indefinitely.",
      "A vague belief that 'the market will eventually realize' is not a correction mechanism.",
    ],
    tone: "amber" as const,
  },
  {
    label: "Survival plan",
    question: "How will the investor survive if early or wrong?",
    example: "Position capped at 2% of portfolio, no leverage, eighteen-month review window, sell if normalized margins fail to recover to 10% within twelve months.",
    points: [
      "Conservative position size, diversification, no leverage, liquidity reserve.",
      "Predefined review conditions and invalidation triggers.",
      "Maximum portfolio exposure that can survive the worst plausible path.",
    ],
    tone: "red" as const,
  },
];

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan", amber: "text-accent-amber", red: "text-accent-red",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/25", amber: "border-accent-amber/25", red: "border-accent-red/25",
};
const toneBg: Record<string, string> = {
  cyan: "bg-accent-cyan/[0.04]", amber: "bg-accent-amber/[0.04]", red: "bg-accent-red/[0.04]",
};
const toneDot: Record<string, string> = {
  cyan: "bg-accent-cyan", amber: "bg-accent-amber", red: "bg-accent-red",
};

export default function ThesisCatalystRisk() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          A complete investment case has three distinct components. Many investors focus on the
          first and ignore the others — and then lose money for reasons they could have anticipated.
        </p>
      </div>

      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          The complete-case framework
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4 overflow-x-auto">
          <BlockMath>{String.raw`\text{Complete investment case} = \text{Thesis} + \text{Correction mechanism} + \text{Survival plan}`}</BlockMath>
        </div>
        <p className="ops-body mt-3 text-[13px] leading-[1.55] text-slate-300">
          Conceptual framework, not a literal valuation equation. Each component must be present.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COMPONENTS.map((c, i) => (
          <div key={c.label} className={`rounded-2xl border p-5 ${toneBorder[c.tone]} ${toneBg[c.tone]}`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[12px] ${toneBorder[c.tone]} ${toneText[c.tone]}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={`font-mono text-[11px] uppercase tracking-[0.16em] ${toneText[c.tone]}`}>
                {c.label}
              </span>
            </div>
            <p className="ops-body mt-3 text-[15px] font-medium leading-[1.5] text-white">{c.question}</p>
            <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Example</div>
              <p className="ops-body mt-1 text-[13px] italic leading-[1.55] text-slate-100">{c.example}</p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {c.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-[12px] leading-[1.5] text-slate-200">
                  <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${toneDot[c.tone]}`} aria-hidden />{p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.08] via-white/[0.03] to-transparent p-5 sm:p-6">
        <p className="ops-body text-[16px] leading-[1.65] text-white">
          A sound thesis does not excuse a missing catalyst. A clear catalyst does not excuse a
          missing survival plan. All three must be present before committing capital.
        </p>
      </div>
    </div>
  );
}
