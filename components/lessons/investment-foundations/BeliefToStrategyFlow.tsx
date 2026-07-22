"use client";

import { Reveal, Panel, DefinitionCard, InteractiveFrame } from "./shared";

/**
 * Section 2 — Hierarchy: Belief → Philosophy → Strategy → Decision → Trade.
 * Section 3 — Worked example: from a market belief to an actual trade.
 */

const HIERARCHY = [
  {
    label: "Belief about markets",
    desc: "A claim about how prices, information, risk, or investor behavior operate.",
    tone: "cyan",
  },
  {
    label: "Investment philosophy",
    desc: "A coherent explanation of where an investment opportunity may come from.",
    tone: "purple",
  },
  {
    label: "Investment strategy",
    desc: "A repeatable method used to act on the philosophy.",
    tone: "amber",
  },
  {
    label: "Portfolio decision",
    desc: "A decision about whether an investment belongs in the portfolio and how large the position should be.",
    tone: "green",
  },
  {
    label: "Trade",
    desc: "The actual purchase, sale, or adjustment.",
    tone: "red",
  },
] as const;

const toneRing: Record<string, string> = {
  cyan: "border-accent-cyan/40",
  purple: "border-accent-purple/40",
  amber: "border-accent-amber/40",
  green: "border-accent-green/40",
  red: "border-accent-red/40",
};
const toneDot: Record<string, string> = {
  cyan: "bg-accent-cyan",
  purple: "bg-accent-purple",
  amber: "bg-accent-amber",
  green: "bg-accent-green",
  red: "bg-accent-red",
};
const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  purple: "text-accent-purple",
  amber: "text-accent-amber",
  green: "text-accent-green",
  red: "text-accent-red",
};

const WORKED_STEPS = [
  {
    n: 1,
    eyebrow: "Belief about investors",
    body: "Investors sometimes react too strongly to dramatic negative news.",
  },
  {
    n: 2,
    eyebrow: "Investment philosophy",
    body: "Market overreaction can temporarily push a company’s price below a reasonable estimate of its long-term value.",
  },
  {
    n: 3,
    eyebrow: "Investment strategy",
    body: "Search for financially sound companies that experienced unusually large price declines after negative announcements.",
  },
  {
    n: 4,
    eyebrow: "Portfolio decision",
    body: "Approve a company only after confirming that the decline appears larger than the deterioration in expected cash flows and that the resulting portfolio risk is acceptable.",
  },
  {
    n: 5,
    eyebrow: "Trade",
    body: "Purchase the approved company at the selected position size.",
  },
] as const;

const WARNING_GAPS = [
  "why the undervaluation exists;",
  "how the investor will identify it;",
  "why other investors have not corrected it;",
  "what could cause the price to recover;",
  "how long the correction may take;",
  "whether the investor can survive if the price falls further.",
];

export default function BeliefToStrategyFlow() {
  return (
    <>
      <Reveal>
        <DefinitionCard term="Investment philosophy">
          A coherent set of beliefs about how markets work, where prices may go
          wrong, and why those mistakes or return opportunities may persist.
        </DefinitionCard>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            An investment philosophy is broader than a rule for buying or selling.
            It explains:
          </p>
          <ul className="mt-3 space-y-2">
            {[
              "what the investor believes;",
              "what market behavior creates the opportunity;",
              "why the opportunity is not immediately eliminated;",
              "which strategies are consistent with the belief;",
              "what evidence would weaken or reject the belief.",
            ].map((t) => (
              <li
                key={t}
                className="ops-body flex items-start gap-2.5 text-[15px] text-slate-200"
              >
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                {t}
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <InteractiveFrame>
          <div className="ops-eyebrow text-[11px] text-slate-400">
            Hierarchy · belief to trade
          </div>
          <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
            A complete investment approach moves through five connected layers.
          </p>

          <ol
            className="mt-6 space-y-3"
            aria-label="Investment belief to trade hierarchy"
          >
            {HIERARCHY.map((h, i) => (
              <li key={h.label}>
                <div
                  className={`flex flex-col gap-2 rounded-xl border ${toneRing[h.tone]} bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${toneRing[h.tone]} bg-white/[0.04] font-mono text-[12px] ${toneText[h.tone]}`}
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <span className="ops-interactive-title text-[16px] text-white">
                      {h.label}
                    </span>
                  </div>
                  <p className="ops-body text-[14px] text-slate-300 sm:max-w-md sm:text-right">
                    {h.desc}
                  </p>
                </div>
                {i < HIERARCHY.length - 1 && (
                  <div
                    className="ml-4 flex items-center gap-1 py-1.5"
                    aria-hidden
                  >
                    <span className={`h-3 w-px ${toneDot[HIERARCHY[i + 1].tone]}`} />
                    <span className={`text-xs ${toneText[HIERARCHY[i + 1].tone]}`}>↓</span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </InteractiveFrame>
      </Reveal>

      <Reveal delay={0.05} className="mt-10">
        <h3 className="ops-section-title text-2xl text-white sm:text-3xl">
          From a market belief to an actual trade
        </h3>
        <p className="ops-body mt-3 max-w-2xl text-[16px] text-slate-300">
          A worked example showing the same five layers applied to one specific
          opportunity.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <ol className="space-y-3">
          {WORKED_STEPS.map((s) => (
            <li
              key={s.n}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 font-mono text-[12px] text-accent-amber">
                {s.n}
              </span>
              <div>
                <div className="ops-caption text-[10px] text-accent-amber">
                  {s.eyebrow}
                </div>
                <p className="ops-body mt-1 text-[15px] text-slate-200">
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <Panel className="border-accent-red/25 bg-accent-red/[0.04]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-accent-red/40 bg-accent-red/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-red">
              Warning
            </span>
            <span className="ops-caption text-[11px] text-slate-400">
              Why “buy undervalued companies” is incomplete
            </span>
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-200">
            The statement does not explain:
          </p>
          <ul className="mt-2 space-y-1.5">
            {WARNING_GAPS.map((g) => (
              <li
                key={g}
                className="ops-body flex items-start gap-2 text-[14px] text-slate-300"
              >
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" />
                {g}
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <DefinitionCard>
          A philosophy explains the <em>opportunity</em>. A strategy explains
          how the investor will <em>pursue</em> it.
        </DefinitionCard>
      </Reveal>
    </>
  );
}
