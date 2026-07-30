"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

type Category = "loss" | "anchor" | "overconf" | "herd" | "reasoned";

type Card = {
  id: string;
  text: string;
  correct: Category;
  phrase: string;
  disciplined: string;
  note?: string;
};

const CARDS: Card[] = [
  {
    id: "c1",
    text: "\u201CThe stock was once $90, so it must be a bargain at $45.\u201D",
    correct: "anchor",
    phrase: "\u201Conce $90\u201D",
    disciplined: "What cash flows does the current $45 price imply? Has the business changed since $90?",
  },
  {
    id: "c2",
    text: "\u201CI have beaten the market for three months, so I should concentrate my portfolio.\u201D",
    correct: "overconf",
    phrase: "three months of outperformance extrapolated into a concentration decision",
    disciplined: "Three months is mostly noise. Is the record long enough to distinguish skill from luck?",
  },
  {
    id: "c3",
    text: "\u201CI refuse to sell until I recover my original investment.\u201D",
    correct: "loss",
    phrase: "anchoring the decision on the original purchase price",
    disciplined: "At today's price, is this still the best use of my capital? The purchase price is sunk.",
    note: "Anchoring on purchase price reinforces loss aversion. Both biases pull in the same direction here.",
  },
  {
    id: "c4",
    text: "\u201CEveryone in my group is buying it, and I do not want to miss out.\u201D",
    correct: "herd",
    phrase: "the action of others is the stated reason for acting",
    disciplined: "If nobody else were buying, would I still find this attractive on its own merits?",
  },
  {
    id: "c5",
    text: "\u201CThe company's expected cash flows have declined, so I revised my valuation downward.\u201D",
    correct: "reasoned",
    phrase: "the decision follows a change in estimated fundamentals",
    disciplined: "Continue to test the new assumptions, but the reasoning is forward-looking and evidence-driven.",
  },
  {
    id: "c6",
    text: "\u201CI am up 40% this year, so I am clearly a better stock-picker than most professionals.\u201D",
    correct: "overconf",
    phrase: "one year of returns treated as proof of superior skill",
    disciplined: "Was the 40% driven by skill, by market beta, by a single lucky position, or by a rising overall market?",
  },
  {
    id: "c7",
    text: "\u201CThe analyst target is $120, so the stock must be worth at least $100 today.\u201D",
    correct: "anchor",
    phrase: "an external reference number is treated as the truth",
    disciplined: "What assumptions drive that $120 target? Are they still valid? What does the current price imply?",
  },
  {
    id: "c8",
    text: "\u201CI doubled my position after it fell. Now my average cost is lower, so I am safer.\u201D",
    correct: "loss",
    phrase: "the decision is framed around the average cost rather than the marginal use of capital",
    disciplined: "Would I buy this amount today at the current price if I did not already own any? Lower average cost is not lower risk.",
  },
];

const OPTIONS: { key: Category; label: string; tone: "red" | "amber" | "purple" | "cyan" | "green" }[] = [
  { key: "loss", label: "Loss aversion", tone: "red" },
  { key: "anchor", label: "Anchoring", tone: "amber" },
  { key: "overconf", label: "Overconfidence", tone: "purple" },
  { key: "herd", label: "Herding", tone: "cyan" },
  { key: "reasoned", label: "Reasoned decision", tone: "green" },
];

const toneText: Record<string, string> = {
  red: "text-accent-red", amber: "text-accent-amber", purple: "text-accent-purple",
  cyan: "text-accent-cyan", green: "text-accent-green",
};
const toneBorder: Record<string, string> = {
  red: "border-accent-red/40", amber: "border-accent-amber/40", purple: "border-accent-purple/40",
  cyan: "border-accent-cyan/40", green: "border-accent-green/40",
};
const toneBg: Record<string, string> = {
  red: "bg-accent-red/[0.06]", amber: "bg-accent-amber/[0.06]", purple: "bg-accent-purple/[0.06]",
  cyan: "bg-accent-cyan/[0.06]", green: "bg-accent-green/[0.06]",
};

export default function BiasClassifier() {
  const reduce = useReducedMotion();
  const [picks, setPicks] = useState<Record<string, Category>>({});
  const assign = (id: string, c: Category) => setPicks((p) => ({ ...p, [id]: c }));
  const reset = (id: string) => setPicks((p) => { const n = { ...p }; delete n[id]; return n; });

  const doneCount = Object.keys(picks).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className="ops-body text-[15px] leading-[1.65] text-slate-100">
            Classify each statement. There is one best answer per card. After every answer you will
            see the phrase that signals the bias and the disciplined question to ask instead.
          </p>
          <span className="font-sans text-[12px] text-slate-400">{doneCount}/{CARDS.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {CARDS.map((card) => {
          const pick = picks[card.id];
          const isCorrect = pick === card.correct;
          const optionTone = OPTIONS.find((o) => o.key === card.correct)!.tone;
          return (
            <div key={card.id} className="rounded-xl border border-white/10 bg-ink-950/30 p-4">
              <p className="text-[15px] leading-[1.55] text-slate-100">{card.text}</p>

              <div role="radiogroup" aria-label={`Classify statement ${card.id}`} className="mt-3 flex flex-wrap gap-2">
                {OPTIONS.map((o) => {
                  const isPicked = pick === o.key;
                  return (
                    <button key={o.key} type="button"
                      role="radio"
                      aria-checked={isPicked}
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
                      isCorrect ? "border-accent-green/30 bg-accent-green/[0.05]" : "border-accent-red/30 bg-accent-red/[0.05]",
                    )}>
                      <p className={cn("text-[13px] leading-[1.55]", isCorrect ? "text-accent-green" : "text-accent-red")}>
                        {isCorrect ? "✓ Correct. " : "✗ Reconsider. "}
                        <span className="text-slate-200">
                          Signal: {card.phrase}.
                        </span>
                      </p>
                      {!isCorrect && (
                        <p className="mt-1.5 text-[13px] leading-[1.55] text-slate-300">
                          Best classification: <span className={toneText[optionTone]}>{OPTIONS.find((o) => o.key === card.correct)!.label}</span>.
                        </p>
                      )}
                      {card.note && (
                        <p className="mt-1.5 text-[12px] leading-[1.5] text-slate-400">
                          Note: {card.note}
                        </p>
                      )}
                      <p className="mt-1.5 text-[13px] leading-[1.55] text-slate-300">
                        <span className="font-sans text-[10px] uppercase tracking-[0.14em] text-accent-cyan">Disciplined question · </span>
                        {card.disciplined}
                      </p>
                      <button type="button" onClick={() => reset(card.id)}
                        className="mt-2 font-sans text-[11px] uppercase tracking-[0.14em] text-slate-400 hover:text-accent-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50">
                        ↻ Try again
                      </button>
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
