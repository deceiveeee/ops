"use client";

import { useState } from "react";
import { Reveal, Panel, Feedback, InteractiveFrame, TryItTag } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 1 — Successful investors do not all invest the same way.
 * Four fictional investor cards + a classification question with reveal.
 */

const INVESTOR_CARDS = [
  {
    id: "low-pe",
    title: "The Low-P/E Investor",
    body: "Buys companies whose price-to-earnings ratios are lower than those of comparable firms.",
    belief:
      "Investors may overreact to disappointing news and push some companies below reasonable estimates of value.",
  },
  {
    id: "growth",
    title: "The Growth Investor",
    body: "Buys companies with rapidly increasing revenue, earnings, customers, or market share.",
    belief:
      "Markets may underestimate how long a company can reinvest at attractive rates.",
  },
  {
    id: "momentum",
    title: "The Momentum Investor",
    body: "Buys stocks whose prices have recently risen relative to other stocks.",
    belief:
      "Investors may update their expectations gradually, allowing price trends to continue.",
  },
  {
    id: "index",
    title: "The Index Investor",
    body: "Owns a broad market portfolio instead of trying to select individual winners.",
    belief:
      "Public markets may be too competitive for most investors to outperform consistently after risk, fees, trading costs, and taxes.",
  },
] as const;

const CHOICES = [
  { id: "low-pe", label: "The Low-P/E Investor" },
  { id: "growth", label: "The Growth Investor" },
  { id: "momentum", label: "The Momentum Investor" },
  { id: "index", label: "The Index Investor" },
  { id: "all", label: "All four investors" },
  { id: "insufficient", label: "There is not enough information" },
] as const;

const CORRECT_ID = "insufficient";

export default function PhilosophyOpeningCards() {
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const answered = picked !== null;
  const correct = picked === CORRECT_ID;

  return (
    <>
      <Reveal>
        <p className="ops-body mt-2 text-[17px] text-slate-200">
          Some successful investors search for inexpensive companies. Others pay
          for growth. Some rely on price trends. Others conclude that trying to
          beat the market is not worth the cost.
        </p>
        <p className="ops-body mt-4 text-[17px] text-slate-200">
          This creates an important problem:
        </p>
        <p className="ops-body-strong mt-2 text-[18px] text-white">
          If successful investors can follow very different strategies, how can
          an investor decide which strategy to use?
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {INVESTOR_CARDS.map((c) => (
            <Panel key={c.id} className="flex flex-col">
              <div className="ops-caption text-[10px] text-accent-amber">
                Card {c.id === "low-pe" ? "A" : c.id === "growth" ? "B" : c.id === "momentum" ? "C" : "D"}
              </div>
              <h3 className="ops-interactive-title mt-2 text-lg text-white">
                {c.title}
              </h3>
              <p className="ops-body mt-2 flex-1 text-[15px] text-slate-300">
                {c.body}
              </p>
              {revealed && (
                <div className="mt-3 rounded-lg border border-accent-amber/20 bg-accent-amber/[0.06] p-3">
                  <div className="ops-caption text-[10px] text-accent-amber">
                    One possible belief beneath this strategy
                  </div>
                  <p className="ops-body mt-1.5 text-[14px] text-slate-200">
                    {c.belief}
                  </p>
                </div>
              )}
            </Panel>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <InteractiveFrame>
          <div className="flex items-center gap-2.5">
            <TryItTag />
            <span className="ops-caption text-[11px] text-slate-400">
              Question
            </span>
          </div>
          <p className="ops-body-strong mt-3 text-[17px] text-slate-50">
            Which investor has an investment philosophy?
          </p>
          <div
            className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"
            role="radiogroup"
            aria-label="Which investor has an investment philosophy?"
          >
            {CHOICES.map((c) => {
              const isPicked = picked === c.id;
              const isCorrect = c.id === CORRECT_ID;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={isPicked}
                  disabled={answered}
                  onClick={() => setPicked(c.id)}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                    !answered &&
                      "border-white/15 text-slate-100 hover:border-accent-amber/60 hover:bg-accent-amber/[0.04]",
                    answered && isCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                    answered && isPicked && !isCorrect && "border-accent-red bg-accent-red/15 text-accent-red",
                    answered && !isPicked && !isCorrect && "border-white/10 text-slate-500",
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          {answered && (
            <>
              <Feedback status={correct ? "correct" : "incorrect"}>
                {correct ? (
                  <span>
                    Each card describes <em>what</em> the investor does. None
                    explains <em>why</em> the investor expects the strategy to
                    work. A strategy becomes meaningful only when it is connected
                    to a belief about markets, investor behavior, or a persistent
                    source of return.
                  </span>
                ) : (
                  <span>
                    Look again — the question is asking about philosophy, not
                    about strategy. The cards describe what each investor does,
                    but none explains why they expect it to work.
                  </span>
                )}
              </Feedback>
              {!revealed && (
                <button
                  type="button"
                  onClick={() => setRevealed(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                >
                  Reveal one possible belief beneath each card
                </button>
              )}
              {!correct && (
                <button
                  type="button"
                  onClick={() => setPicked(null)}
                  className="mt-3 ml-2 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
                >
                  Retry
                </button>
              )}
            </>
          )}
        </InteractiveFrame>
      </Reveal>

      <Reveal delay={0.05} className="mt-8">
        <Panel className="bg-accent-amber/[0.04]">
          <p className="ops-body-strong text-[17px] text-white">
            The important question is not simply <em>what</em> an investor buys.
          </p>
          <p className="ops-body mt-2 text-[17px] text-slate-200">
            The important question is <em>why</em> the investor believes the
            approach should work.
          </p>
        </Panel>
      </Reveal>
    </>
  );
}
