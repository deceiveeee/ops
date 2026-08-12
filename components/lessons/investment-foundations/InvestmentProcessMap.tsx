"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, InteractiveFrame, TryItTag, DefinitionCard } from "./shared";
import { cn } from "@/lib/utils";

/**
 * Section 7 — The investment process.
 * Five-stage progressive map: investor → allocation → selection → execution → evaluation.
 */

type StageId = "investor" | "allocation" | "selection" | "execution" | "evaluation";

const STAGES: {
  id: StageId;
  n: number;
  title: string;
  question: string;
  explanation: string;
  bulletTitle?: string;
  bullets?: string[];
  example?: string;
  mistake?: string;
  futureCourse?: string;
  inputsTitle?: string;
  inputs?: string[];
  subBlocks?: { heading: string; items: string[] }[];
}[] = [
  {
    id: "investor",
    n: 1,
    title: "Understand the investor",
    question: "Who is the portfolio being built for?",
    explanation:
      "A portfolio is not inherently appropriate. It is appropriate or inappropriate for a particular investor.",
    inputsTitle: "Investor inputs",
    inputs: [
      "Risk tolerance or aversion — How much uncertainty and loss can the investor realistically tolerate?",
      "Investment horizon — How long can the capital remain invested before it may be needed?",
      "Tax status — How much of the investment return can the investor actually retain?",
      "Wealth and resources — How much capital, research time, data access, and diversification capacity does the investor possess?",
      "Liquidity needs — How much cash may be required, and when?",
    ],
    mistake:
      "Starting with a favorite security before defining the investor’s objective and constraints.",
    futureCourse:
      "Later lessons will examine risk, taxes, trading constraints, and the fit between the investor and the investment philosophy.",
  },
  {
    id: "allocation",
    n: 2,
    title: "Choose the broad allocation",
    question: "How should capital be divided across broad asset classes and markets?",
    explanation:
      "Asset allocation is a broad portfolio decision. The investor is deciding how much exposure to hold in different markets before selecting individual securities.",
    inputsTitle: "Categories",
    inputs: [
      "Stocks",
      "Bonds",
      "Real assets",
      "Cash",
      "Domestic markets",
      "International markets",
    ],
    subBlocks: [
      {
        heading: "Influences on the allocation",
        items: [
          "risk preference;",
          "horizon;",
          "liquidity;",
          "inflation expectations;",
          "interest-rate expectations;",
          "economic-growth expectations;",
          "diversification.",
        ],
      },
    ],
    example: "Allocate 60% to stocks, 30% to bonds, and 10% to cash.",
    mistake:
      "Confusing a decision about how much to hold in stocks with a decision about which stock to buy.",
  },
  {
    id: "selection",
    n: 3,
    title: "Select individual investments",
    question: "Which specific stocks, bonds, funds, or real assets should the portfolio hold?",
    explanation:
      "Security selection is a decision within an asset class. The investor has already decided to own stocks. The next question is which stocks.",
    inputsTitle: "Possible inputs",
    inputs: [
      "estimated future cash flows;",
      "comparable-company valuation;",
      "business quality;",
      "growth expectations;",
      "charts and price indicators;",
      "public information;",
      "differentiated analysis;",
      "security-specific risk.",
    ],
    example:
      "Choose one restaurant company instead of another after comparing growth, cash flow, valuation, and risk.",
    mistake: "Treating a good company as automatically being a good investment at any price.",
  },
  {
    id: "execution",
    n: 4,
    title: "Execute the decision",
    question: "How will the investor obtain or change the position?",
    explanation:
      "An attractive idea must survive implementation. A strategy that appears profitable before costs may become unattractive after trading.",
    inputsTitle: "Questions to answer",
    inputs: [
      "How often will the investor trade?",
      "How large will the trade be?",
      "How quickly must it be completed?",
      "How liquid is the security?",
      "What spread or price impact may occur?",
      "Will the order itself affect the market price?",
      "Are hedging instruments involved?",
    ],
    subBlocks: [
      {
        heading: "Trading costs",
        items: [
          "commissions;",
          "bid-ask spread;",
          "price impact;",
          "delay;",
          "taxes;",
          "financing costs.",
        ],
      },
    ],
    mistake:
      "Evaluating a strategy using paper returns while ignoring how frequently and expensively it must trade.",
  },
  {
    id: "evaluation",
    n: 5,
    title: "Evaluate the portfolio",
    question: "Did the portfolio meet its objective after accounting for risk?",
    explanation:
      "“Did I make money?” is not a sufficient evaluation. A serious evaluation combines three questions and a defensible benchmark.",
    subBlocks: [
      {
        heading: "Three evaluation questions",
        items: [
          "How much risk did the portfolio take?",
          "What return did the portfolio earn?",
          "Did the portfolio outperform or underperform an appropriate benchmark?",
        ],
      },
      {
        heading: "Four examples",
        items: [
          "A portfolio earned 8%, while a comparable benchmark earned 15%. → Positive return, but benchmark underperformance.",
          "A portfolio lost 3%, while a comparable benchmark lost 12%. → Negative absolute return, but strong benchmark-relative performance.",
          "A portfolio earned 14% by taking substantially more risk than the benchmark. → The higher return may reflect higher risk rather than superior investment skill.",
          "A conservative portfolio met its required cash-flow objective but trailed an equity index. → The equity index may not be the appropriate benchmark.",
        ],
      },
    ],
    mistake: "Selecting a benchmark only after seeing the portfolio’s result.",
  },
];

const STAGE_TONES: Record<StageId, string> = {
  investor: "text-accent-cyan",
  allocation: "text-accent-amber",
  selection: "text-accent-purple",
  execution: "text-accent-green",
  evaluation: "text-accent-red",
};
const STAGE_RING: Record<StageId, string> = {
  investor: "border-accent-cyan/40",
  allocation: "border-accent-amber/40",
  selection: "border-accent-purple/40",
  execution: "border-accent-green/40",
  evaluation: "border-accent-red/40",
};
const STAGE_DOT: Record<StageId, string> = {
  investor: "bg-accent-cyan",
  allocation: "bg-accent-amber",
  selection: "bg-accent-purple",
  execution: "bg-accent-green",
  evaluation: "bg-accent-red",
};

export default function InvestmentProcessMap() {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState<StageId[]>(["investor"]);
  const [active, setActive] = useState<StageId>("investor");

  const allRevealed = revealed.length === STAGES.length;

  const revealNext = () => {
    if (allRevealed) return;
    const next = STAGES.find((s) => !revealed.includes(s.id));
    if (next) {
      setRevealed((p) => [...p, next.id]);
      setActive(next.id);
    }
  };

  const revealAll = () => {
    setRevealed(STAGES.map((s) => s.id));
  };

  return (
    <>
      <Reveal>
        <p className="ops-body mt-2 max-w-3xl text-[17px] text-slate-200">
          Every portfolio begins before the first security is selected. The
          process starts with the investor, moves through portfolio decisions
          and execution, and ends with an evaluation of both return and risk.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <InteractiveFrame>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <TryItTag />
              <span className="ops-caption text-[12px] text-slate-400">
                Investment process · 5 stages
              </span>
            </div>
            <span className="ops-caption text-[12px] text-slate-400">
              {revealed.length}/{STAGES.length} revealed
            </span>
          </div>

          {/* Stage rail */}
          <ol
            className="mt-5 flex flex-col gap-2"
            aria-label="Investment process stages"
          >
            {STAGES.map((s, i) => {
              const isRevealed = revealed.includes(s.id);
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <div className="flex items-stretch gap-3">
                    {/* Connector */}
                    <div className="flex w-8 flex-col items-center">
                      <button
                        type="button"
                        onClick={() => isRevealed && setActive(s.id)}
                        disabled={!isRevealed}
                        aria-expanded={isActive}
                        aria-label={`Stage ${s.n}: ${s.title}`}
                        className={cn(
                          "mt-1 flex h-8 w-8 items-center justify-center rounded-full border font-sans text-[12px] tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
                          isRevealed
                            ? `${STAGE_RING[s.id]} bg-white/[0.04] ${STAGE_TONES[s.id]} hover:bg-white/[0.08]`
                            : "border-white/10 text-slate-600",
                          isActive && "ring-2 ring-accent-amber/40",
                        )}
                      >
                        {isRevealed ? s.n : "·"}
                      </button>
                      {i < STAGES.length - 1 && (
                        <span
                          className={cn(
                            "mt-1 w-px flex-1",
                            revealed.includes(STAGES[i + 1].id) ? STAGE_DOT[s.id] : "bg-white/10",
                          )}
                          aria-hidden
                        />
                      )}
                    </div>

                    {/* Stage body */}
                    {isRevealed ? (
                      <div
                        className={cn(
                          "flex-1 rounded-xl border bg-white/[0.02] p-4 transition-all sm:p-5",
                          isActive ? `${STAGE_RING[s.id]} bg-white/[0.04]` : "border-white/10",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => setActive(s.id)}
                          className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40 rounded-md"
                          aria-expanded={isActive}
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn("ops-caption text-[12px]", STAGE_TONES[s.id])}>
                              Stage {s.n}
                            </span>
                          </div>
                          <h4 className="ops-interactive-title mt-1 text-[17px] text-white">
                            {s.title}
                          </h4>
                          <p className="ops-body mt-1 text-[14px] text-slate-300">
                            {s.question}
                          </p>
                        </button>

                        {isActive && (
                          <motion.div
                            initial={reduce ? false : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 space-y-3"
                          >
                            <p className="ops-body text-[15px] text-slate-200">
                              {s.explanation}
                            </p>

                            {s.inputs && s.inputs.length > 0 && (
                              <div>
                                <div className="ops-caption text-[12px] text-slate-400">
                                  {s.inputsTitle}
                                </div>
                                <ul className="mt-2 space-y-1.5">
                                  {s.inputs.map((it) => (
                                    <li
                                      key={it}
                                      className="ops-body flex items-start gap-2 text-[14px] text-slate-300"
                                    >
                                      <span className={cn("mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full", STAGE_DOT[s.id])} />
                                      {it}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {s.subBlocks?.map((sb) => (
                              <div key={sb.heading}>
                                <div className="ops-caption text-[12px] text-slate-400">
                                  {sb.heading}
                                </div>
                                <ul className="mt-2 space-y-1.5">
                                  {sb.items.map((it) => (
                                    <li
                                      key={it}
                                      className="ops-body flex items-start gap-2 text-[14px] text-slate-300"
                                    >
                                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white/40" />
                                      {it}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}

                            {s.example && (
                              <div className="rounded-lg border border-white/10 bg-ink-950/40 p-3">
                                <div className="ops-caption text-[12px] text-slate-500">
                                  Example
                                </div>
                                <p className="ops-body mt-1 text-[14px] text-slate-200">
                                  {s.example}
                                </p>
                              </div>
                            )}

                            {s.mistake && (
                              <div className="rounded-lg border border-accent-red/20 bg-accent-red/[0.04] p-3">
                                <div className="ops-caption text-[12px] text-accent-red">
                                  Common mistake
                                </div>
                                <p className="ops-body mt-1 text-[14px] text-slate-200">
                                  {s.mistake}
                                </p>
                              </div>
                            )}

                            {s.futureCourse && (
                              <div className="rounded-lg border border-accent-cyan/20 bg-accent-cyan/[0.04] p-3">
                                <div className="ops-caption text-[12px] text-accent-cyan">
                                  Later in the course
                                </div>
                                <p className="ops-body mt-1 text-[14px] text-slate-200">
                                  {s.futureCourse}
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-1 items-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] p-4 text-slate-600">
                        <span className="ops-caption text-[12px]">
                          Stage {s.n} · locked
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {!allRevealed && (
              <button
                type="button"
                onClick={revealNext}
                className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
              >
                Reveal next stage →
              </button>
            )}
            {!allRevealed && revealed.length > 1 && (
              <button
                type="button"
                onClick={revealAll}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:border-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50"
              >
                Reveal all
              </button>
            )}
            {allRevealed && (
              <span className="ops-caption text-[12px] text-accent-green">
                All five stages revealed.
              </span>
            )}
          </div>
        </InteractiveFrame>
      </Reveal>

      {allRevealed && (
        <Reveal delay={0.05} className="mt-6">
          <DefinitionCard term="Complete process">
            Every investment philosophy attempts to create an advantage
            somewhere inside this five-stage process:{" "}
            <span className="text-accent-cyan">investor</span> →{" "}
            <span className="text-accent-amber">asset allocation</span> →{" "}
            <span className="text-accent-purple">security selection</span> →{" "}
            <span className="text-accent-green">execution</span> →{" "}
            <span className="text-accent-red">performance evaluation</span>.
          </DefinitionCard>
        </Reveal>
      )}
    </>
  );
}
