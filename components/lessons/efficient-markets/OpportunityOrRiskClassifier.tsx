"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Category = "mispricing" | "compensation" | "repricing" | "insufficient";

type CardTone = "cyan" | "red" | "green" | "amber";

type Case = {
  id: string;
  label: string;
  scenario: string;
  acceptable: Category[];
  primary: Category;
  explanation: string;
  moreInfo: string;
};

const CASES: Case[] = [
  {
    id: "caseA",
    label: "Case A",
    scenario:
      "A small company has a low price-to-earnings ratio. It depends on a single customer for 65% of its revenue. That customer has been renegotiating prices downward.",
    acceptable: ["compensation"],
    primary: "compensation",
    explanation:
      "Best classification: likely compensation for risk. The low P/E plausibly reflects customer concentration, renegotiation risk, and the possibility that the customer leaves entirely. Further analysis is still required — but the discount should not be treated as a free lunch.",
    moreInfo:
      "Required additional information: contract length, customer financial health, switching costs, alternative customers, and the margin impact if renegotiation continues.",
  },
  {
    id: "caseB",
    label: "Case B",
    scenario:
      "A closed-end fund trades at a 12% discount to the market value of its holdings. The same discount has persisted for over a decade with no signs of closing.",
    acceptable: ["insufficient", "mispricing"],
    primary: "insufficient",
    explanation:
      "Best classification: insufficient information, or possible persistent mispricing without a catalyst. A long-standing discount may reflect fees, poor expected future performance, illiquidity of the fund's shares, governance concerns, tax overhangs, or simply the absence of any mechanism to force convergence.",
    moreInfo:
      "Required additional information: fund mandate, fee structure, distribution policy, activist presence, historical liquidation or conversion precedent, and reason for original discount.",
  },
  {
    id: "caseC",
    label: "Case C",
    scenario:
      "A mid-cap stock falls 6% in two days after a major index fund announces it must remove the stock from its benchmark during the next reconstitution. No fundamental news has been released.",
    acceptable: ["mispricing"],
    primary: "mispricing",
    explanation:
      "Best classification: possible temporary mispricing caused by mechanical selling. The decline can create a gap between price and fundamentals — but realizing it requires accounting for trading costs, the size of the index-driven flow, the willingness of other buyers to step in, and the underlying business risk that may have been masked by the index event.",
    moreInfo:
      "Required additional information: size of the index-driven sell flow, presence of competing buyers, time horizon of the investor, and whether the underlying fundamentals support the prior price.",
  },
  {
    id: "caseD",
    label: "Case D",
    scenario:
      "A stock rises sharply after management materially raises its expected future cash flows, supported by new signed contracts and confirmed margin improvement.",
    acceptable: ["repricing"],
    primary: "repricing",
    explanation:
      "Best classification: rational repricing. The price moved because the cash-flow expectations embedded in the prior price were superseded by new information. The post-move price may be efficient — the question for any buyer is whether the new price still leaves room for further upside.",
    moreInfo:
      "Required additional information: how much of the new guidance is already in the price, whether management has a track record of accurate guidance, and how much of the change is timing versus permanent.",
  },
  {
    id: "caseE",
    label: "Case E",
    scenario:
      "A high-yield bond offers a yield 4 percentage points above Treasuries of similar duration. The issuer operates in a cyclical industry and historically defaults at high rates during recessions.",
    acceptable: ["compensation"],
    primary: "compensation",
    explanation:
      "Best classification: likely compensation for risk. The extra yield plausibly compensates for expected default losses during downturns — exactly when an investor is least able to absorb losses. A high yield is not the same as a high expected return.",
    moreInfo:
      "Required additional information: historical default and recovery rates for similar issuers, the investor's ability to tolerate drawdowns, and the correlation with the rest of the portfolio.",
  },
  {
    id: "caseF",
    label: "Case F",
    scenario:
      "Two virtually identical share classes of the same company trade at different prices on different exchanges. The price gap has persisted for years. There are no restrictions on converting one into the other, and trading costs are minimal.",
    acceptable: ["mispricing"],
    primary: "mispricing",
    explanation:
      "Best classification: possible genuine mispricing — but only on the surface. Persistent gaps on identical claims usually hide something: tax overhangs, settlement frictions, withholding differences, custody restrictions, or borrow costs for shorting the expensive share class. The visible gap may not be capturable.",
    moreInfo:
      "Required additional information: legal convertibility in practice, custodial constraints, withholding tax treatment, borrow availability on the expensive leg, and any historical precedent of the gap closing.",
  },
];

const OPTIONS: { key: Category; label: string; tone: CardTone }[] = [
  { key: "mispricing", label: "Possible mispricing", tone: "cyan" },
  { key: "compensation", label: "Likely compensation for risk", tone: "red" },
  { key: "repricing", label: "Rational repricing", tone: "green" },
  { key: "insufficient", label: "Insufficient information", tone: "amber" },
];

const toneText: Record<CardTone, string> = {
  cyan: "text-accent-cyan", red: "text-accent-red", green: "text-accent-green", amber: "text-accent-amber",
};
const toneBorder: Record<CardTone, string> = {
  cyan: "border-accent-cyan/40", red: "border-accent-red/40", green: "border-accent-green/40", amber: "border-accent-amber/40",
};
const toneBg: Record<CardTone, string> = {
  cyan: "bg-accent-cyan/[0.06]", red: "bg-accent-red/[0.06]", green: "bg-accent-green/[0.06]", amber: "bg-accent-amber/[0.06]",
};

export default function OpportunityOrRiskClassifier() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Category>>({});
  const assign = (id: string, c: Category) => setPicks((p) => ({ ...p, [id]: c }));

  const doneCount = Object.keys(picks).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
            Classify each case. Some cases admit more than one defensible answer — when in doubt,
            the lesson is to identify what additional information would resolve the question.
          </p>
          <span className="font-mono text-[12px] text-slate-400">{doneCount}/{CASES.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {CASES.map((card) => {
          const pick = picks[card.id];
          const isAcceptable = pick && card.acceptable.includes(pick);
          const primaryTone = OPTIONS.find((o) => o.key === card.primary)!.tone;
          return (
            <div key={card.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{card.label}</span>
              </div>
              <p className="mt-1.5 text-[14px] leading-[1.55] text-slate-100">{card.scenario}</p>

              <div role="radiogroup" aria-label={`Classify ${card.label}`} className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button key={o.key} type="button"
                      role="radio" aria-checked={isPicked}
                      onClick={() => assign(card.id, o.key)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        !isPicked && "border-white/15 text-slate-300 hover:border-white/30",
                        isPicked && cn(toneBorder[o.tone], toneBg[o.tone], toneText[o.tone]),
                      )}>
                      {o.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {pick && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden">
                    <div className={cn(
                      "mt-2.5 rounded-lg border px-3 py-2.5",
                      isAcceptable ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]",
                    )}>
                      <p className={cn("text-[13px] leading-[1.55]", isAcceptable ? "text-accent-green" : "text-accent-red")}>
                        {isAcceptable ? "✓ Defensible interpretation. " : "✗ Reconsider — "}
                        <span className="text-slate-200">{card.explanation}</span>
                      </p>
                      {card.acceptable.length > 1 && (
                        <p className="mt-1.5 text-[12px] leading-[1.5] text-slate-400">
                          Multiple interpretations are defensible here. Primary classification:{" "}
                          <span className={toneText[primaryTone]}>{OPTIONS.find((o) => o.key === card.primary)!.label}</span>.
                        </p>
                      )}
                      <p className="mt-1.5 text-[12px] leading-[1.5] text-slate-300">
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-cyan">What you would need · </span>
                        {card.moreInfo}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
