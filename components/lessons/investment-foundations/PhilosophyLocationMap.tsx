"use client";

import { useState } from "react";
import { Reveal, Panel, InteractiveFrame, TryItTag, DefinitionCard, Feedback } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 9 — Where does each philosophy seek an advantage?
 * Six philosophy cards + placement interaction.
 */

type Stage = "allocation" | "selection" | "execution" | "multi";

const STAGE_LABELS: { id: Stage; label: string }[] = [
  { id: "allocation", label: "Asset allocation" },
  { id: "selection", label: "Security selection" },
  { id: "execution", label: "Execution" },
  { id: "multi", label: "More than one stage" },
];

type Philosophy = {
  id: string;
  title: string;
  stage: Stage;
  advantage: string;
  examples: string[];
  challenge: string;
};

const PHILOSOPHIES: Philosophy[] = [
  {
    id: "market-timing",
    title: "Market timing",
    stage: "allocation",
    advantage:
      "Predict which broad markets, asset classes, or countries will perform better or worse.",
    examples: [
      "increase or reduce equity exposure;",
      "move between stocks and bonds;",
      "shift between domestic and international markets;",
      "change exposure based on rates, inflation, growth, valuation, or sentiment.",
    ],
    challenge:
      "The investor must be correct not only about direction, but also about timing, magnitude, implementation, and the cost of being out of the market.",
  },
  {
    id: "value",
    title: "Value investing",
    stage: "selection",
    advantage:
      "Identify securities whose prices are below reasonable estimates of value.",
    examples: [
      "low valuation multiples;",
      "discounted cash-flow valuation;",
      "asset value;",
      "contrarian selection.",
    ],
    challenge:
      "A low price may reflect genuine business deterioration, hidden risk, or a value trap.",
  },
  {
    id: "growth",
    title: "Growth investing",
    stage: "selection",
    advantage:
      "Identify companies whose future growth is more valuable or more persistent than the market currently expects.",
    examples: [
      "revenue growth;",
      "expanding margins;",
      "reinvestment opportunities;",
      "market-share gains.",
    ],
    challenge:
      "A strong company can still be a poor investment when the price already assumes exceptional growth.",
  },
  {
    id: "technical-momentum",
    title: "Technical and momentum investing",
    stage: "selection",
    advantage:
      "Use past prices, trading behavior, or trends to identify information not yet fully reflected in the current price.",
    examples: [
      "relative strength;",
      "moving averages;",
      "trend-following;",
      "momentum screens.",
    ],
    challenge:
      "Patterns may disappear after discovery, arise by chance, or produce excessive trading costs.",
  },
  {
    id: "information",
    title: "Information-based investing",
    stage: "multi",
    advantage:
      "Interpret legal public information more accurately or respond before the market fully adjusts.",
    examples: [
      "earnings surprises;",
      "management guidance;",
      "analyst revisions;",
      "industry information;",
      "public filings.",
    ],
    challenge:
      "Information may already be reflected in the price, misinterpreted, or too expensive to trade.",
  },
  {
    id: "arbitrage",
    title: "Arbitrage and relative-value investing",
    stage: "execution",
    advantage:
      "Exploit inconsistent prices between identical or economically linked assets.",
    examples: [
      "the same asset trading at different prices;",
      "linked securities;",
      "closed-end fund discounts;",
      "convergence relationships.",
    ],
    challenge:
      "Many apparent arbitrages contain timing risk, financing risk, short-selling constraints, or uncertainty about whether prices will converge.",
  },
];

export default function PhilosophyLocationMap() {
  const [answers, setAnswers] = useState<Record<string, Stage>>({});
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null);

  const choose = (id: string, stage: Stage) => {
    if (answers[id]) return;
    setAnswers((p) => ({ ...p, [id]: stage }));
    setFeedbackFor(id);
  };

  return (
    <>
      <Reveal>
        <p className="ops-body mt-2 max-w-3xl text-[17px] text-slate-200">
          Investment philosophies can be organized by the stage of the
          investment process where they claim to create value.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <div className="flex items-center justify-center gap-3 sm:gap-6">
          {["Asset allocation", "Security selection", "Execution"].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-3 sm:gap-6">
              <span className="rounded-lg border border-accent-amber/30 bg-accent-amber/[0.06] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">
                {s}
              </span>
              {i < arr.length - 1 && (
                <span className="text-accent-amber" aria-hidden>
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <InteractiveFrame>
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Assign each philosophy to its primary stage
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {PHILOSOPHIES.map((p) => {
              const picked = answers[p.id];
              const correct = picked === p.stage;
              const showFeedback = feedbackFor === p.id || picked !== undefined;
              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="ops-caption text-[10px] text-accent-amber">
                    Philosophy
                  </div>
                  <h3 className="ops-interactive-title mt-1 text-lg text-white">
                    {p.title}
                  </h3>

                  <div className="mt-3">
                    <div className="ops-caption text-[10px] text-slate-400">
                      Claimed advantage
                    </div>
                    <p className="ops-body mt-1 text-[14px] text-slate-300">
                      {p.advantage}
                    </p>
                  </div>

                  <div className="mt-3">
                    <div className="ops-caption text-[10px] text-slate-400">
                      Examples
                    </div>
                    <ul className="mt-1 space-y-1">
                      {p.examples.map((e) => (
                        <li
                          key={e}
                          className="ops-body flex items-start gap-2 text-[13px] text-slate-300"
                        >
                          <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent-amber" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 rounded-lg border border-accent-red/15 bg-accent-red/[0.04] p-2.5">
                    <div className="ops-caption text-[10px] text-accent-red">
                      Primary challenge
                    </div>
                    <p className="ops-body mt-1 text-[13px] text-slate-200">
                      {p.challenge}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="ops-caption text-[10px] text-slate-400">
                      Where does this philosophy primarily operate?
                    </div>
                    <div
                      className="mt-2 flex flex-wrap gap-2"
                      role="radiogroup"
                      aria-label={`Where does ${p.title} primarily operate?`}
                    >
                      {STAGE_LABELS.map((s) => {
                        const isPicked = picked === s.id;
                        const isCorrect = p.stage === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            role="radio"
                            aria-checked={isPicked}
                            disabled={picked !== undefined}
                            onClick={() => choose(p.id, s.id)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                              !picked &&
                                "border-white/20 text-slate-100 hover:border-accent-amber/60 hover:text-accent-amber",
                              picked && isCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                              picked && isPicked && !isCorrect && "border-accent-red bg-accent-red/15 text-accent-red",
                              picked && !isPicked && !isCorrect && "border-white/10 text-slate-500",
                            )}
                          >
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                    {showFeedback && (
                      <div className="mt-2 text-[12px] text-slate-400">
                        <span className={cn("font-mono uppercase tracking-[0.14em]", correct ? "text-accent-green" : "text-accent-amber")}>
                          {correct ? "Correct" : "Review"} · primary stage: {STAGE_LABELS.find((s) => s.id === p.stage)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-accent-red/20 bg-accent-red/[0.04] p-4">
            <div className="ops-caption text-[10px] text-accent-red">
              Legal note
            </div>
            <p className="ops-body mt-1 text-[14px] text-slate-200">
              Investment analysis must rely on legal information and lawful
              research. Material nonpublic information must not be presented as
              a legitimate investment advantage.
            </p>
          </div>
        </InteractiveFrame>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <DefinitionCard>
          The location of the philosophy tells us what type of decision the
          investor believes can be improved.
        </DefinitionCard>
      </Reveal>
    </>
  );
}
