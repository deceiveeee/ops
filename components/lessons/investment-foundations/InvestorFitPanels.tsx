"use client";

import { useState } from "react";
import { Reveal, Panel, Feedback } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 13 — The best philosophy must also fit the investor.
 * Four expandable panels including a 4-choice risk scenario.
 */

type PanelId = "risk" | "horizon" | "tax" | "wealth";

const PANEL_ORDER: PanelId[] = ["risk", "horizon", "tax", "wealth"];

const RISK_CHOICES: { id: string; label: string; feedback: string }[] = [
  {
    id: "sell",
    label: "I would sell immediately.",
    feedback:
      "This response may indicate that strategies involving large temporary declines are difficult for you to sustain.",
  },
  {
    id: "review",
    label: "I would review the thesis and risk before deciding.",
    feedback:
      "This separates the price change from the investment thesis.",
  },
  {
    id: "buy-more",
    label: "I would automatically buy more.",
    feedback:
      "A lower price can improve expected return, but only if the value estimate remains valid and portfolio risk remains acceptable.",
  },
  {
    id: "ignore",
    label: "I would ignore the portfolio completely.",
    feedback:
      "Patience can be useful, but refusing to review changed information is not disciplined long-term investing.",
  },
];

export default function InvestorFitPanels() {
  const [open, setOpen] = useState<PanelId | null>("risk");
  const [riskPick, setRiskPick] = useState<string | null>(null);

  return (
    <Reveal>
      <p className="ops-body mt-2 max-w-3xl text-[17px] text-slate-200">
        A strategy may be economically sensible and still fail because the
        investor cannot sustain it.
      </p>

      <div className="mt-6 space-y-3">
        {PANEL_ORDER.map((id) => {
          const isOpen = open === id;
          return (
            <div
              key={id}
              className="rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : id)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 rounded-xl"
              >
                <span className="ops-interactive-title text-[16px] text-white">
                  {id === "risk" && "Risk preference"}
                  {id === "horizon" && "Time horizon"}
                  {id === "tax" && "Tax status"}
                  {id === "wealth" && "Wealth, liquidity, and resources"}
                </span>
                <span
                  className={cn(
                    "font-sans text-[14px] text-accent-amber transition-transform",
                    isOpen && "rotate-90",
                  )}
                  aria-hidden
                >
                  →
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-white/10 px-5 py-4">
                  {id === "risk" && (
                    <>
                      <p className="ops-body text-[15px] text-slate-200">
                        Most investors prefer less risk when two investments
                        offer the same expected return. To accept greater
                        uncertainty, investors generally require the possibility
                        of a higher expected return. The difficulty is that
                        stated tolerance and actual behavior may differ.
                      </p>
                      <div className="ops-definition-card mt-4 p-4">
                        <div className="ops-caption text-[12px] text-accent-cyan">
                          Scenario
                        </div>
                        <p className="ops-body-strong mt-1.5 text-[16px] text-slate-100">
                          Your portfolio falls 25%. The original investment
                          thesis has not changed.
                        </p>
                        <div
                          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
                          role="radiogroup"
                          aria-label="Your response to a 25% portfolio decline"
                        >
                          {RISK_CHOICES.map((c) => {
                            const isPicked = riskPick === c.id;
                            return (
                              <button
                                key={c.id}
                                type="button"
                                role="radio"
                                aria-checked={isPicked}
                                disabled={riskPick !== null}
                                onClick={() => setRiskPick(c.id)}
                                className={cn(
                                  "rounded-lg border px-4 py-2.5 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50 disabled:cursor-default",
                                  !riskPick &&
                                    "border-white/20 text-slate-100 hover:border-accent-amber/60 hover:bg-accent-amber/[0.04]",
                                  isPicked &&
                                    "border-accent-cyan bg-accent-cyan/15 text-accent-cyan",
                                  riskPick && !isPicked && "border-white/10 text-slate-500",
                                )}
                              >
                                {c.label}
                              </button>
                            );
                          })}
                        </div>
                        {riskPick && (
                          <Feedback status="info">
                            {RISK_CHOICES.find((c) => c.id === riskPick)?.feedback}
                          </Feedback>
                        )}
                        <p className="ops-body mt-3 text-[14px] text-slate-400">
                          This scenario does not produce a definitive
                          psychological score — it surfaces a tendency to
                          examine further.
                        </p>
                      </div>
                    </>
                  )}
                  {id === "horizon" && (
                    <>
                      <p className="ops-body text-[15px] text-slate-200">
                        An investor’s effective horizon depends on more than
                        stated intentions. It depends on:
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {[
                          "patience;",
                          "expected cash needs;",
                          "employment stability;",
                          "liabilities;",
                          "external constraints;",
                          "ability to remain invested during underperformance.",
                        ].map((t) => (
                          <li
                            key={t}
                            className="ops-body flex items-start gap-2 text-[14px] text-slate-300"
                          >
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                            {t}
                          </li>
                        ))}
                      </ul>
                      <p className="ops-body-strong mt-3 rounded-lg border border-accent-amber/20 bg-accent-amber/[0.05] p-3 text-[15px] text-white">
                        Calling yourself a long-term investor does not create a
                        long horizon if you need the money next year.
                      </p>
                    </>
                  )}
                  {id === "tax" && (
                    <>
                      <p className="ops-body text-[15px] text-slate-200">
                        Investors can spend only the returns they retain after
                        taxes. Different accounts may treat interest, dividends,
                        realized gains, short-term trading, and long-term
                        holdings differently.
                      </p>
                      <Panel className="mt-3 border-accent-amber/20 bg-accent-amber/[0.04]">
                        <div className="ops-caption text-[12px] text-accent-amber">
                          Important note
                        </div>
                        <p className="ops-body mt-1 text-[14px] text-slate-200">
                          Tax rules vary by jurisdiction and change over time.
                          This course will discuss tax effects conceptually
                          rather than provide current personal tax advice.
                        </p>
                      </Panel>
                    </>
                  )}
                  {id === "wealth" && (
                    <>
                      <p className="ops-body text-[15px] text-slate-200">
                        Wealth can affect capacity to absorb losses, ability to
                        diversify, access to certain investments, tolerance for
                        illiquidity, research resources, and ability to wait.
                      </p>
                      <p className="ops-body mt-3 text-[15px] text-slate-200">
                        Liquidity needs can shorten the investor’s effective
                        horizon even when the investor is personally patient.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Reveal>
  );
}
