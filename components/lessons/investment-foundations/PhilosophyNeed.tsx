"use client";

import { Reveal, Panel, DefinitionCard } from "./shared";

const SWITCHING_COSTS = [
  {
    title: "Bad timing",
    body: "Recent winners are adopted after they have performed well; abandoned approaches are often sold after they have struggled.",
  },
  {
    title: "Turnover",
    body: "Every switch creates trading costs, bid-ask spreads, and new opportunities for implementation mistakes.",
  },
  {
    title: "Taxes",
    body: "In taxable accounts, selling appreciated positions can realize gains and reduce the capital left to compound.",
  },
  {
    title: "Inconsistent evidence",
    body: "When the method changes repeatedly, the investor never gathers a clean record of whether any one idea actually worked.",
  },
] as const;

const REVIEW_QUESTIONS = [
  "Did new evidence weaken the market belief?",
  "Did the strategy stop capturing the opportunity the philosophy describes?",
  "Did implementation drift away from the stated rules?",
  "Or is the result still plausible variation for a risky strategy?",
] as const;

export default function PhilosophyNeed() {
  return (
    <>
      <Reveal>
        <p className="ops-body max-w-3xl text-[17px] text-slate-200">
          A philosophy does not guarantee superior returns. It gives the
          investor a stable basis for deciding what evidence matters, when to
          persist, and when to revise the approach.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <Panel className="border-accent-red/25 bg-accent-red/[0.04]">
          <div className="ops-caption text-[12px] text-accent-red">
            The performance-chasing loop
          </div>
          <p className="ops-body-strong mt-3 text-[17px] text-white">
            Growth wins, so the investor switches to growth. Value wins next,
            so the investor switches to value. Momentum wins after that, so the
            investor changes again.
          </p>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            Recent performance has become the decision rule. The investor has
            no explanation for why the new strategy should keep working and no
            standard for knowing when a change is justified.
          </p>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SWITCHING_COSTS.map((cost) => (
            <Panel key={cost.title}>
              <h3 className="ops-interactive-title text-[16px] text-white">
                {cost.title}
              </h3>
              <p className="ops-body mt-2 text-[14px] text-slate-300">
                {cost.body}
              </p>
            </Panel>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <DefinitionCard term="A weak period is a prompt to diagnose, not a command to switch">
          A sound strategy can underperform temporarily. A poor strategy can
          outperform temporarily. The result matters, but it must be interpreted
          through the original belief and the evidence supporting it.
        </DefinitionCard>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <div className="ops-caption text-[12px] text-accent-amber">
            Before changing strategy, ask:
          </div>
          <ol className="mt-3 space-y-2">
            {REVIEW_QUESTIONS.map((question, index) => (
              <li
                key={question}
                className="ops-body flex items-start gap-3 text-[15px] text-slate-200"
              >
                <span className="font-sans text-[12px] tabular-nums text-accent-amber">
                  {index + 1}
                </span>
                {question}
              </li>
            ))}
          </ol>
        </Panel>
      </Reveal>
    </>
  );
}
