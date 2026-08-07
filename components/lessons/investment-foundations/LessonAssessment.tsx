"use client";

import { Reveal } from "./shared";
import {
  default as MasteryCheck,
  type MasteryQuestion,
} from "@/components/lessons/present-value-relations/MasteryCheck";
import { useIFProgress } from "@/lib/if-progress";

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "coherent-process",
    type: "single",
    prompt:
      "Two investors buy the same stock after a positive earnings surprise. Investor A expects gradual revisions, checks whether the surprise changes long-term cash flows, and states what evidence would reject the idea. Investor B buys because the stock ranks highly on three screens. Which conclusion is strongest?",
    choices: [
      {
        id: "a",
        label:
          "Investor A has the stronger philosophy because the trade follows from a testable account of market behavior.",
      },
      {
        id: "b",
        label:
          "Investor B has the stronger philosophy because several independent screens reduce model risk.",
      },
      {
        id: "c",
        label:
          "Both have equally strong philosophies because the position and entry price are identical.",
      },
      {
        id: "d",
        label:
          "Neither can have a philosophy until the outcome reveals which reasoning was correct.",
      },
    ],
    correctId: "a",
    hint:
      "Multiple signals can improve a strategy, but they do not replace an explanation for why the signals should predict returns. A philosophy can be evaluated before one trade succeeds or fails.",
  },
  {
    id: "underreaction-strategy",
    type: "single",
    prompt:
      "An investor believes prices sometimes underreact when new earnings information changes long-term expectations. Which strategy most faithfully implements that belief?",
    choices: [
      {
        id: "a",
        label:
          "Buy every company with a positive surprise immediately, because the belief makes further analysis unnecessary.",
      },
      {
        id: "b",
        label:
          "After a positive surprise, test whether expected cash flows changed more than the price and hold while revisions diffuse.",
      },
      {
        id: "c",
        label:
          "Buy before earnings announcements, because underreaction implies positive surprises can be forecast reliably.",
      },
      {
        id: "d",
        label:
          "Buy low-P/E companies after negative surprises, because any contrarian strategy follows from underreaction.",
      },
    ],
    correctId: "b",
    hint:
      "The strategy must occur after the new information, verify that the information matters, and depend on gradual—not instantaneous or contrarian—price adjustment.",
  },
  {
    id: "implementation-drift",
    type: "single",
    prompt:
      "A post-earnings strategy trails its benchmark for 18 months. Independent evidence still finds post-announcement drift after costs, but the manager has begun buying before announcements rather than after confirmed surprises. What is the best diagnosis?",
    choices: [
      {
        id: "a",
        label:
          "The philosophy has been disproved because any 18-month underperformance is long enough to reject it.",
      },
      {
        id: "b",
        label:
          "The philosophy remains plausible, but the manager's implementation no longer tests the stated belief cleanly.",
      },
      {
        id: "c",
        label:
          "The strategy should be retained unchanged because evidence matters and realized performance does not.",
      },
      {
        id: "d",
        label:
          "The manager should switch to the best recent strategy until post-announcement drift begins working again.",
      },
    ],
    correctId: "b",
    hint:
      "The market belief and the manager's actions must be diagnosed separately. Buying before the surprise introduces a different forecasting claim.",
  },
  {
    id: "strategy-switching",
    type: "single",
    prompt:
      "An investor moves from growth to value to momentum, each time after the new strategy leads the market. Which criticism is most precise?",
    choices: [
      {
        id: "a",
        label:
          "Switching is always irrational because a portfolio should never change once it is built.",
      },
      {
        id: "b",
        label:
          "The investor may be buying after outperformance, realizing costs and taxes, and abandoning methods without testing their underlying beliefs.",
      },
      {
        id: "c",
        label:
          "The only problem is tax; in a tax-advantaged account, recent performance becomes sufficient evidence for switching.",
      },
      {
        id: "d",
        label:
          "The sequence is sound if each chosen strategy has a positive long-run average return, regardless of entry timing.",
      },
    ],
    correctId: "b",
    hint:
      "Changing strategy can be rational when evidence changes. The problem here is that recent performance—not a revised market belief—is driving every decision.",
  },
];

export default function LessonAssessment() {
  const { markComplete } = useIFProgress();

  return (
    <Reveal>
      <MasteryCheck
        title="Philosophy before strategy"
        questions={QUESTIONS}
        passCount={3}
        onComplete={() =>
          markComplete("if-1-1-how-an-investor-builds-a-philosophy")
        }
        continueLabel="Back to Investment Foundations"
        continueHref="/courses/investment-foundations"
      />
    </Reveal>
  );
}
