"use client";

import { useState } from "react";
import EquityRiskJourneyShell, {
  RiskChoice,
  RiskFeedback,
  RiskPanel,
  RiskPrompt,
  type EquityRiskSceneProps,
} from "./EquityRiskJourneyShell";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-3-5-choosing-a-risk-measure";

const STEPS = [
  {
    label: "Challenge",
    title: "State CAPM's limitations",
    guide:
      "CAPM is one theory-based answer to one risk question. Inspect its assumptions, noisy inputs, and limited empirical explanatory power.",
    instruction: "Open all three limitations before comparing alternatives.",
    next: "Open the theory alternatives",
  },
  {
    label: "Theory",
    title: "Move from one factor to several",
    guide:
      "APT and multi-factor models allow several common forces to affect returns. Their factors and interpretation still require judgment.",
    instruction: "Inspect CAPM, APT, multi-factor, and proxy structures.",
    next: "Read company and proxy evidence",
  },
  {
    label: "Evidence",
    title: "Separate accounting indicators from proxies",
    guide:
      "Accounting measures use company financial evidence. Proxy models use characteristics historically associated with returns; association does not prove causation.",
    instruction: "Correctly sort all six evidence signals.",
    next: "Compare the methods",
  },
  {
    label: "Methods",
    title: "Begin with the investor's question",
    guide:
      "Every risk method answers a different question. Open each question, method, and limitation before choosing which ones you rely on.",
    instruction: "Inspect all seven method paths.",
    next: "Match method to decision",
  },
  {
    label: "Choose",
    title: "Match method to decision",
    guide:
      "There is no universally best measure. Match each investor question to a method whose perspective and limitation fit the decision.",
    instruction: "Correctly match all three decision cases.",
    next: "Enter Lesson 3.6",
  },
] as const;

export default function RiskMeasureJourney() {
  return (
    <EquityRiskJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 3.5 risk-measure journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <CAPMLimitsScene onComplete={onComplete} />;
        if (step === 1) return <TheoryAlternativesScene onComplete={onComplete} />;
        if (step === 2) return <EvidenceSortScene onComplete={onComplete} />;
        if (step === 3) return <MethodSwitchboardScene onComplete={onComplete} />;
        return <RiskStackScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-3-6-build-an-equity-risk-policy",
        label: "Continue to Lesson 3.6",
      }}
    />
  );
}

const LIMITS = [
  {
    id: "assumptions",
    label: "Strong assumptions",
    evidence: "The model assumes investors can diversify and share a common market-risk framework.",
    consequence: "The result is conditional on a simplified model of investor behavior and markets.",
  },
  {
    id: "inputs",
    label: "Noisy inputs",
    evidence: "Beta, the risk-free rate, and the equity risk premium are estimated rather than known with certainty.",
    consequence: "Different defensible inputs can produce different required returns.",
  },
  {
    id: "evidence",
    label: "Weak explanatory power",
    evidence: "Beta alone has explained realized stock-return differences imperfectly in empirical tests.",
    consequence: "A single beta should not be treated as a complete description of equity risk.",
  },
] as const;

function CAPMLimitsScene({ onComplete }: EquityRiskSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof LIMITS)[number]>(LIMITS[0]);
  const inspect = (item: (typeof LIMITS)[number]) => {
    setActive(item);
    if (opened.includes(item.id)) return;
    const next = [...opened, item.id];
    setOpened(next);
    if (next.length === LIMITS.length) onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Model status</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          CAPM is a theory-based model that prices market exposure for a
          diversified investor. Its usefulness depends on its assumptions,
          estimated inputs, and the question being asked.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Open all three limitations. The goal is to understand CAPM’s boundary,
        not to discard the model automatically.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-2">
          {LIMITS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => inspect(item)}
              className={cn(
                "w-full rounded-xl border p-4 text-left",
                active.id === item.id
                  ? "border-accent-red/45 bg-accent-red/[0.07]"
                  : "border-white/10 bg-white/[0.025] hover:border-white/25",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-white">{item.label}</span>
                {opened.includes(item.id) && <span className="text-xs text-accent-green">✓ opened</span>}
              </div>
            </button>
          ))}
        </div>
        <RiskPanel className="border-accent-red/20">
          <div className="ops-caption text-[12px] text-accent-red">{active.label}</div>
          <h3 className="mt-2 text-xl font-semibold text-white">Evidence</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{active.evidence}</p>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-xs text-slate-500">Decision consequence</div>
            <p className="mt-2 text-sm leading-6 text-slate-200">{active.consequence}</p>
          </div>
        </RiskPanel>
      </div>
    </div>
  );
}

const THEORY_MODELS = [
  {
    id: "capm",
    label: "CAPM",
    structure: "One market factor",
    explanation: "Uses beta to measure exposure to broad market risk.",
  },
  {
    id: "apt",
    label: "Arbitrage Pricing Model",
    structure: "Several named macro factors",
    explanation: "Allows returns to respond to common economic forces such as rates or inflation.",
  },
  {
    id: "multi",
    label: "Multi-factor model",
    structure: "Several statistical factors",
    explanation: "Extracts common return patterns, which may be harder to interpret economically.",
  },
  {
    id: "proxy",
    label: "Proxy model",
    structure: "Observable characteristics",
    explanation: "Uses characteristics associated with return differences, such as size or price-to-book.",
  },
] as const;

function TheoryAlternativesScene({ onComplete }: EquityRiskSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof THEORY_MODELS)[number]>(THEORY_MODELS[0]);
  const inspect = (item: (typeof THEORY_MODELS)[number]) => {
    setActive(item);
    if (opened.includes(item.id)) return;
    const next = [...opened, item.id];
    setOpened(next);
    if (next.length === THEORY_MODELS.length) onComplete();
  };
  return (
    <div>
      <RiskPrompt>
        Move across the model path. Count what each model uses to explain risk,
        then read what becomes harder to estimate or interpret.
      </RiskPrompt>
      <RiskPanel className="mt-5 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-12 top-[72px] hidden h-px bg-white/15 sm:block" />
        <div className="relative grid gap-3 sm:grid-cols-4">
          {THEORY_MODELS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => inspect(item)}
              className={cn(
                "rounded-xl border p-4 text-left",
                active.id === item.id
                  ? "border-accent-cyan/50 bg-accent-cyan/[0.07]"
                  : "border-white/10 bg-white/[0.03]",
              )}
            >
              <div className="text-[12px] text-slate-500">Model {index + 1}</div>
              <div className="mt-2 text-sm font-semibold text-white">{item.label}</div>
              <div className="mt-3 text-xs text-accent-cyan">{item.structure}</div>
            </button>
          ))}
        </div>
      </RiskPanel>
      <RiskPanel className="mt-4 border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="ops-caption text-[12px] text-accent-cyan">{active.label}</div>
        <div className="mt-2 text-xl font-semibold text-white">{active.structure}</div>
        <p className="mt-3 text-sm leading-6 text-slate-300">{active.explanation}</p>
        <div className="mt-4 text-xs text-slate-500">{opened.length} of {THEORY_MODELS.length} structures inspected</div>
      </RiskPanel>
    </div>
  );
}

const EVIDENCE_ITEMS = [
  ["debt", "Debt ratio", "accounting"],
  ["earnings", "Earnings variability", "accounting"],
  ["accountingBeta", "Accounting beta: company earnings change versus market earnings change", "accounting"],
  ["size", "Company size", "proxy"],
  ["momentum", "Earnings or price momentum", "proxy"],
  ["liquidity", "Trading liquidity", "proxy"],
] as const;

function EvidenceSortScene({ onComplete }: EquityRiskSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (EVIDENCE_ITEMS.every(([itemId, , answer]) => next[itemId] === answer)) onComplete();
  };
  const correct = EVIDENCE_ITEMS.every(([id, , answer]) => answers[id] === answer);
  const complete = Object.keys(answers).length === EVIDENCE_ITEMS.length;
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="font-semibold text-white">Accounting measure</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">Uses reported financial-statement values or earnings changes as risk indicators.</p>
          </div>
          <div>
            <div className="font-semibold text-white">Proxy characteristic</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">Uses an observable characteristic historically associated with return differences.</p>
          </div>
        </div>
      </RiskPanel>
      <RiskPrompt>
        Sort each signal. A historical association does not prove that a proxy
        characteristic causes risk or future return.
      </RiskPrompt>
      <div className="mt-5 space-y-3">
        {EVIDENCE_ITEMS.map(([id, label, answer]) => (
          <RiskPanel key={id} className="py-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_260px] sm:items-center">
              <div className="text-sm font-semibold leading-6 text-white">{label}</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["accounting", "Accounting"],
                  ["proxy", "Proxy"],
                ].map(([value, option]) => (
                  <RiskChoice
                    key={value}
                    selected={answers[id] === value}
                    correct={answers[id] === value && value === answer}
                    incorrect={answers[id] === value && value !== answer}
                    onClick={() => choose(id, value)}
                  >
                    {option}
                  </RiskChoice>
                ))}
              </div>
            </div>
          </RiskPanel>
        ))}
      </div>
      {complete && (
        <RiskFeedback correct={correct}>
          {correct
            ? "Accounting signals come from company reports; proxies come from return associations. Both depend on measurement choices and interpretation."
            : "Ask whether the signal is reported company evidence or an observable characteristic associated with returns."}
        </RiskFeedback>
      )}
    </div>
  );
}

const METHODS = [
  {
    id: "capm",
    question: "How strongly does this stock move with broad market returns?",
    method: "CAPM / beta",
    answer: "Market exposure for a diversified investor.",
    caveat: "Beta is estimated with error and is not total risk.",
  },
  {
    id: "multi",
    question: "Which several common forces explain the stock's return exposure?",
    method: "APT / multi-factor model",
    answer: "Several factor exposures rather than one market beta.",
    caveat: "Factor choice, meaning, and exposure estimates remain uncertain.",
  },
  {
    id: "accounting",
    question: "Are debt and earnings measures showing greater financial fragility?",
    method: "Accounting indicators",
    answer: "Company ratios and changes in reported earnings.",
    caveat: "Accounting data are low-frequency and measurement-dependent.",
  },
  {
    id: "proxy",
    question: "Which stock characteristics have been associated with return differences?",
    method: "Proxy model",
    answer: "Size, price-to-book, momentum, or liquidity patterns.",
    caveat: "Association does not establish causation or persistence.",
  },
  {
    id: "implied",
    question: "What required return is embedded in today's price and cash-flow assumptions?",
    method: "Market-implied return",
    answer: "Back the discount rate out of price, expected cash flow, and growth.",
    caveat: "The result is model-dependent, not promised.",
  },
  {
    id: "certainty",
    question: "What smaller safe amount is equivalent to an uncertain expected cash flow?",
    method: "Certainty-equivalent cash flow",
    answer: "Move the risk adjustment into the cash-flow estimate.",
    caveat: "The equivalence requires a defensible risk judgment.",
  },
  {
    id: "margin",
    question: "How far below estimated value must price fall before the fund buys?",
    method: "Margin of safety",
    answer: "Turn valuation uncertainty into an explicit price buffer.",
    caveat: "A buffer does not eliminate business or market risk.",
  },
] as const;

function MethodSwitchboardScene({ onComplete }: EquityRiskSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof METHODS)[number]>(METHODS[0]);
  const inspect = (item: (typeof METHODS)[number]) => {
    setActive(item);
    if (opened.includes(item.id)) return;
    const next = [...opened, item.id];
    setOpened(next);
    if (next.length === METHODS.length) onComplete();
  };
  return (
    <div>
      <RiskPrompt>
        Start with the question, then reveal the matching method and its limitation.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-2">
          {METHODS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => inspect(item)}
              className={cn(
                "w-full rounded-xl border p-3 text-left text-[14px] leading-5",
                active.id === item.id
                  ? "border-accent-cyan/50 bg-accent-cyan/[0.07] text-white"
                  : "border-white/10 bg-white/[0.025] text-slate-300",
              )}
            >
              {item.question}
            </button>
          ))}
        </div>
        <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
          <div className="ops-caption text-[12px] text-accent-amber">Selected method</div>
          <div className="mt-2 text-2xl font-semibold text-white">{active.method}</div>
          <p className="mt-3 text-sm leading-6 text-slate-200">{active.answer}</p>
          <div className="mt-5 rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4">
            <div className="text-xs font-semibold text-accent-red">Limitation</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{active.caveat}</p>
          </div>
          <div className="mt-4 text-xs text-slate-500">{opened.length} of {METHODS.length} paths inspected</div>
        </RiskPanel>
      </div>
    </div>
  );
}

const STACK_CASES = [
  {
    id: "diversified",
    prompt: "A diversified fund needs a required return tied to broad market exposure.",
    answer: "capm",
    options: [
      ["capm", "Use CAPM / beta, while stating its estimation limits."],
      ["liquidity", "Use liquidity alone because it explains every return."],
    ],
  },
  {
    id: "cash",
    prompt: "A concentrated owner cares about uncertain business cash flows and a safe comparable amount.",
    answer: "certainty",
    options: [
      ["certainty", "Use certainty-equivalent cash flow with an explicit risk judgment."],
      ["beta", "Use beta as a complete measure of total business risk."],
    ],
  },
  {
    id: "buffer",
    prompt: "An investor has an intrinsic-value estimate and needs an explicit purchase-price buffer.",
    answer: "margin",
    options: [
      ["margin", "Use a margin-of-safety rule and preserve the valuation uncertainty."],
      ["quality", "Buy whenever beta is low because low beta proves investment quality."],
    ],
  },
] as const;

function RiskStackScene({ onComplete }: EquityRiskSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (STACK_CASES.every((item) => next[item.id] === item.answer)) onComplete();
  };
  const complete = Object.keys(answers).length === STACK_CASES.length;
  const correct = STACK_CASES.every((item) => answers[item.id] === item.answer);
  return (
    <div>
      <RiskPrompt>
        Match each decision to a method. The correct answer depends on the investor’s
        question and the risk dimension, not on a universal ranking.
      </RiskPrompt>
      <div className="mt-5 space-y-4">
        {STACK_CASES.map((item, index) => (
          <RiskPanel key={item.id}>
            <div className="text-xs text-accent-amber">Decision case {index + 1}</div>
            <p className="mt-2 font-semibold leading-6 text-white">{item.prompt}</p>
            <div className="mt-3 grid gap-2">
              {item.options.map(([value, label]) => (
                <RiskChoice
                  key={value}
                  selected={answers[item.id] === value}
                  correct={answers[item.id] === value && value === item.answer}
                  incorrect={answers[item.id] === value && value !== item.answer}
                  onClick={() => choose(item.id, value)}
                >
                  {label}
                </RiskChoice>
              ))}
            </div>
          </RiskPanel>
        ))}
      </div>
      {complete && (
        <RiskFeedback correct={correct}>
          {correct
            ? "The method follows the question. Lesson 3.6 turns these choices into an explicit equity-risk policy."
            : "Identify the decision first: market exposure, cash-flow adjustment, or purchase-price buffer."}
        </RiskFeedback>
      )}
    </div>
  );
}
