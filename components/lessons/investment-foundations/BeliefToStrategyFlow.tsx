"use client";

import { Reveal, Panel, DefinitionCard, InteractiveFrame } from "./shared";

const LAYERS = [
  {
    label: "Evidence",
    description:
      "A repeatable pattern, mechanism, or body of research—not a single successful trade.",
    example:
      "Historically, some stocks continue to adjust after unexpectedly strong earnings, even after controlling for risk and costs.",
    tone: "cyan",
  },
  {
    label: "Market belief",
    description:
      "A claim about how prices, information, risk, or investor behavior operate.",
    example:
      "Investors sometimes incorporate new information into expectations gradually.",
    tone: "purple",
  },
  {
    label: "Investment philosophy",
    description:
      "A reasoned view of where an opportunity may arise and why it may persist.",
    example:
      "Market underreaction can create temporary opportunities after important new information.",
    tone: "amber",
  },
  {
    label: "Investment strategy",
    description:
      "A repeatable method for finding and acting on opportunities consistent with the philosophy.",
    example:
      "After a positive earnings surprise, investigate whether expectations changed more than the price and hold while revisions continue.",
    tone: "green",
  },
  {
    label: "Individual trade",
    description:
      "A specific action taken after the company and portfolio have passed the strategy's rules.",
    example:
      "Buy a 2% position in Company A after confirming the surprise is durable and the price has not fully adjusted.",
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

const toneText: Record<string, string> = {
  cyan: "text-accent-cyan",
  purple: "text-accent-purple",
  amber: "text-accent-amber",
  green: "text-accent-green",
  red: "text-accent-red",
};

export default function BeliefToStrategyFlow() {
  return (
    <>
      <Reveal>
        <DefinitionCard term="Investment philosophy">
          A coherent explanation of how markets work, where an opportunity may
          come from, why it may persist, and what evidence would weaken the
          explanation.
        </DefinitionCard>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] text-slate-200">
            A philosophy is broader than a buying rule. It should answer four
            questions:
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              "What market behavior creates the opportunity?",
              "Why has competition not removed it?",
              "Which actions follow from the belief?",
              "What evidence would make the belief less credible?",
            ].map((question) => (
              <li
                key={question}
                className="ops-body flex items-start gap-2.5 text-[15px] text-slate-200"
              >
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                {question}
              </li>
            ))}
          </ul>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <InteractiveFrame>
          <div className="ops-eyebrow text-[11px] text-slate-400">
            Worked example · post-earnings underreaction
          </div>
          <p className="ops-body-strong mt-2 text-[16px] text-slate-50">
            Each layer has a different job. Removing one weakens the chain.
          </p>

          <ol className="mt-6 space-y-3" aria-label="Evidence to trade reasoning chain">
            {LAYERS.map((layer, index) => (
              <li key={layer.label}>
                <div
                  className={`rounded-xl border ${toneRing[layer.tone]} bg-white/[0.03] p-4`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${toneRing[layer.tone]} bg-white/[0.04] font-sans text-[12px] ${toneText[layer.tone]}`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="ops-interactive-title text-[16px] text-white">
                        {layer.label}
                      </h3>
                      <p className="ops-body mt-1 text-[13px] text-slate-400">
                        {layer.description}
                      </p>
                    </div>
                  </div>
                  <p className="ops-body mt-3 border-t border-white/10 pt-3 text-[15px] text-slate-200">
                    {layer.example}
                  </p>
                </div>
                {index < LAYERS.length - 1 && (
                  <div className="ml-4 py-1.5 text-sm text-accent-amber" aria-hidden>
                    ↓
                  </div>
                )}
              </li>
            ))}
          </ol>
        </InteractiveFrame>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <Panel className="border-accent-red/25 bg-accent-red/[0.04]">
          <div className="ops-caption text-[10px] text-accent-red">
            Why “buy undervalued companies” is not yet a philosophy
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-200">
            It does not identify why undervaluation exists, how value will be
            estimated, why the gap may close, how long that could take, or what
            evidence would show that the investor is wrong.
          </p>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <DefinitionCard>
          A philosophy explains the <em>opportunity</em>. A strategy explains
          how the investor will <em>pursue</em> it. A trade is one application of
          that strategy.
        </DefinitionCard>
      </Reveal>
    </>
  );
}
