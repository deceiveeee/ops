"use client";

import { Reveal } from "./shared";
import { default as MasteryCheck, type MasteryQuestion } from "@/components/lessons/present-value-relations/MasteryCheck";
import { useIFProgress } from "@/lib/if-progress";

/**
 * Section 16 — Check your understanding.
 * Six questions. Pass with 5 of 6 correct to mark Lesson 1.1 complete.
 * Uses the existing MasteryCheck component to preserve OPS quiz design.
 */

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt:
      "Which statement is an investment philosophy rather than merely a strategy?",
    choices: [
      { id: "a", label: "“Buy stocks with low P/E ratios.”" },
      { id: "b", label: "“Buy companies that pay high dividends.”" },
      { id: "c", label: "“Buy undervalued companies.”" },
      { id: "d", label: "“Investors tend to overreact to major announcements, and prices may correct gradually.”" },
    ],
    correctId: "d",
    hint:
      "The other choices describe actions without explaining why they should work. (A low-P/E rule is a strategy that requires an underlying belief about why low-P/E stocks may be mispriced. A high-dividend rule needs an explanation of why dividends create a return advantage. “Buy undervalued companies” states an intention, not the market mistake, valuation method, catalyst, or implementation rule.)",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "Suppose your philosophy is based on the belief that investors update their expectations slowly after positive earnings surprises. Which strategy best fits that belief?",
    choices: [
      { id: "a", label: "Buy after a significant positive earnings surprise, then investigate whether the price has fully adjusted." },
      { id: "b", label: "Buy after a significant negative earnings surprise." },
      { id: "c", label: "Buy before every earnings announcement." },
      { id: "d", label: "Sell every company that reports earnings growth." },
    ],
    correctId: "a",
    hint:
      "If investors respond slowly to positive news, the price may continue adjusting after the announcement. The strategy must occur after the information that investors are supposedly processing slowly.",
  },
  {
    id: "q3",
    type: "single",
    prompt:
      "A portfolio manager reduces stocks from 70% of the portfolio to 50% because expectations for the economy and interest rates changed. Which stage of the process is this?",
    choices: [
      { id: "a", label: "Investor analysis" },
      { id: "b", label: "Asset allocation" },
      { id: "c", label: "Security selection" },
      { id: "d", label: "Execution" },
      { id: "e", label: "Performance evaluation" },
    ],
    correctId: "b",
    hint:
      "The manager changed exposure to an entire asset class rather than choosing a specific stock.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "A manager compares expected cash flows and valuation multiples to choose between two restaurant companies. Which stage is this?",
    choices: [
      { id: "a", label: "Investor analysis" },
      { id: "b", label: "Asset allocation" },
      { id: "c", label: "Security selection" },
      { id: "d", label: "Execution" },
      { id: "e", label: "Performance evaluation" },
    ],
    correctId: "c",
    hint:
      "The manager is choosing a specific security within the equity allocation.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "An investor searches for the same or economically linked asset trading at inconsistent prices in two markets. Which philosophy is most closely associated with this activity?",
    choices: [
      { id: "a", label: "Market timing" },
      { id: "b", label: "Growth investing" },
      { id: "c", label: "Arbitrage" },
      { id: "d", label: "Indexing" },
      { id: "e", label: "Asset allocation" },
    ],
    correctId: "c",
    hint:
      "Arbitrage and relative-value approaches attempt to exploit inconsistent pricing relationships, usually through execution.",
  },
  {
    id: "q6",
    type: "single",
    prompt:
      "Two investors believe that markets overreact to negative news. One has a 20-year horizon and stable income. The other needs the money in 18 months. What is the best conclusion?",
    choices: [
      { id: "a", label: "They should use the same portfolio because they share the same belief." },
      { id: "b", label: "The second investor should take more risk because the horizon is shorter." },
      { id: "c", label: "They may require different strategies, position sizes, or no trade at all." },
      { id: "d", label: "The first investor’s belief must be correct." },
    ],
    correctId: "c",
    hint:
      "Market beliefs are only one part of the decision. Horizon, liquidity, risk tolerance, taxes, and resources affect whether and how the strategy can be implemented.",
  },
];

export default function LessonAssessment() {
  const { markComplete } = useIFProgress();

  return (
    <Reveal>
      <MasteryCheck
        title="Check your understanding"
        questions={QUESTIONS}
        passCount={5}
        onComplete={() => markComplete("if-1-1-how-an-investor-builds-a-philosophy")}
        continueLabel="Back to Investment Foundations"
        continueHref="/courses/investment-foundations"
      />
    </Reveal>
  );
}
