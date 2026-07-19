"use client";

import { BlockMath } from "@/components/ui/Math";

const LEVELS = [
  {
    letter: "1",
    label: "Philosophy",
    description: "A set of beliefs about how markets work, where returns and opportunities may arise, and how decisions should be made under uncertainty.",
    example: "Prices usually incorporate public information quickly, but temporary mispricing can occur when information is difficult to interpret or investors face constraints.",
    scope: "Guides many decisions across years and asset classes.",
    tone: "cyan" as const,
  },
  {
    letter: "2",
    label: "Strategy",
    description: "An operational approach that follows from the philosophy. Specifies how the investor will participate, what they will avoid, and what rules they will follow.",
    example: "Hold a diversified passive core and make limited active investments only when a clear valuation gap, correction mechanism, and risk-control plan exist.",
    scope: "Operationalizes the philosophy across multiple trades.",
    tone: "amber" as const,
  },
  {
    letter: "3",
    label: "Portfolio decision",
    description: "An individual action: a buy, a sell, a rebalance, an allocation change. The smallest unit of investing.",
    example: "Buy a specific company at $42 with a maximum 3% portfolio weight, a written thesis, and a defined invalidation condition.",
    scope: "A single trade is not a philosophy.",
    tone: "green" as const,
  },
];

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan", amber: "text-accent-amber", green: "text-accent-green",
};
const toneBorder: Record<string, string> = {
  cyan: "border-accent-cyan/25", amber: "border-accent-amber/25", green: "border-accent-green/25",
};
const toneBg: Record<string, string> = {
  cyan: "bg-accent-cyan/[0.04]", amber: "bg-accent-amber/[0.04]", green: "bg-accent-green/[0.04]",
};

export default function PhilosophyHierarchy() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          An investment philosophy is a set of beliefs about how markets work, where returns and
          opportunities may arise, and how decisions should be made under uncertainty. It is the
          top of a three-level hierarchy.
        </p>
      </div>

      {/* Hierarchy formula */}
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
          Hierarchy
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-ink-950/40 px-4 py-4 overflow-x-auto">
          <BlockMath>{String.raw`\text{Philosophy} \;\rightarrow\; \text{Strategy} \;\rightarrow\; \text{Portfolio decision}`}</BlockMath>
        </div>
        <p className="ops-body mt-3 text-[14px] leading-[1.65] text-slate-200">
          A philosophy guides many decisions. A strategy operationalizes the philosophy. An isolated
          trade is not a philosophy.
        </p>
      </div>

      {/* Three levels */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {LEVELS.map((l) => (
          <div key={l.letter} className={`rounded-2xl border p-5 ${toneBorder[l.tone]} ${toneBg[l.tone]}`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[12px] ${toneBorder[l.tone]} ${toneText[l.tone]}`}>
                {l.letter}
              </span>
              <span className={`font-mono text-[11px] uppercase tracking-[0.16em] ${toneText[l.tone]}`}>
                {l.label}
              </span>
            </div>
            <p className="ops-body mt-3 text-[14px] leading-[1.6] text-slate-100">{l.description}</p>
            <div className="mt-3 rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-400">Example</div>
              <p className="ops-body mt-1 text-[13px] italic leading-[1.55] text-slate-100">{l.example}</p>
            </div>
            <p className="mt-3 text-[12px] leading-[1.5] text-slate-300">{l.scope}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
          Confusing the levels is a common mistake. An investor who has only a list of stock picks
          has no philosophy. An investor with a philosophy but no operational strategy cannot act
          coherently. Each level must be present, and each must be consistent with the level above.
        </p>
      </div>
    </div>
  );
}
