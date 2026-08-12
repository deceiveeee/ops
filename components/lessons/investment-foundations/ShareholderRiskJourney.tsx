"use client";

import { useState } from "react";
import EquityRiskJourneyShell, {
  RiskChoice,
  RiskFeedback,
  RiskMetric,
  RiskPanel,
  RiskPrompt,
  type EquityRiskSceneProps,
} from "./EquityRiskJourneyShell";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-3-1-what-risk-means-for-a-shareholder";

const STEPS = [
  {
    label: "Define",
    title: "Start with uncertain outcomes",
    guide:
      "Risk is exposure to uncertain outcomes. Actual shareholder results can finish above or below what the investor expected.",
    instruction: "Inspect the three possible one-year shareholder outcomes.",
    next: "Follow the shareholder claim",
  },
  {
    label: "Claim",
    title: "Find what belongs to shareholders",
    guide:
      "Equity is a residual claim. Follow company cash through the claims that are paid before shareholders receive what remains.",
    instruction: "Inspect every stage of the $100 cash waterfall.",
    next: "Open the risk lenses",
  },
  {
    label: "Lens",
    title: "Ask three different risk questions",
    guide:
      "Equity risk has three independent dimensions. Open each lens before using any of them to classify evidence.",
    instruction: "Open all three paired risk lenses.",
    next: "Compare price and cash flow",
  },
  {
    label: "Compare",
    title: "Let two risk lenses disagree",
    guide:
      "A stable dividend can coexist with a changing stock price. Use the evidence to describe both risks separately.",
    instruction: "Choose the statement supported by both the dividend and price evidence.",
    next: "Build the risk map",
  },
  {
    label: "Map",
    title: "Complete the three-lens risk map",
    guide:
      "Classify each question with the definition already introduced. This map becomes the foundation for the rest of mission 4.",
    instruction: "Correctly answer all three lens questions.",
    next: "Enter Lesson 3.2",
  },
] as const;

export default function ShareholderRiskJourney() {
  return (
    <EquityRiskJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 3.1 shareholder-risk journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <OutcomeScene onComplete={onComplete} />;
        if (step === 1) return <ResidualClaimScene onComplete={onComplete} />;
        if (step === 2) return <RiskLensScene onComplete={onComplete} />;
        if (step === 3) return <PriceCashFlowScene onComplete={onComplete} />;
        return <RiskMapScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-3-2-why-diversification-changes-the-question",
        label: "Continue to Lesson 3.2",
      }}
    />
  );
}

const OUTCOMES = [
  {
    id: "down",
    label: "Weak year",
    result: "−12%",
    meaning: "The actual return lands below the expected 6% return.",
    tone: "red",
  },
  {
    id: "base",
    label: "Expected year",
    result: "+6%",
    meaning: "The actual return matches the investor's expected return.",
    tone: "amber",
  },
  {
    id: "up",
    label: "Strong year",
    result: "+19%",
    meaning: "The actual return lands above the expected 6% return.",
    tone: "green",
  },
] as const;

function OutcomeScene({ onComplete }: EquityRiskSceneProps) {
  const [inspected, setInspected] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof OUTCOMES)[number]>(OUTCOMES[1]);
  const inspect = (outcome: (typeof OUTCOMES)[number]) => {
    setActive(outcome);
    if (inspected.includes(outcome.id)) return;
    const next = [...inspected, outcome.id];
    setInspected(next);
    if (next.length === OUTCOMES.length) onComplete();
  };

  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">
          Direct definition
        </div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Risk is exposure to uncertain outcomes. An expected return is the
          probability-weighted average result; the actual return is the result
          that occurs.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Northstar Transit shares have an expected one-year return of 6%. Open
        every possible outcome to see why uncertainty includes upside and downside.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <RiskPanel>
          <div className="grid gap-3 sm:grid-cols-3">
            {OUTCOMES.map((outcome) => (
              <button
                key={outcome.id}
                type="button"
                onClick={() => inspect(outcome)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  active.id === outcome.id
                    ? "border-accent-cyan/50 bg-accent-cyan/[0.08]"
                    : "border-white/10 bg-white/[0.025] hover:border-white/25",
                )}
              >
                <div className="text-xs text-slate-500">{outcome.label}</div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                  {outcome.result}
                </div>
                {inspected.includes(outcome.id) && (
                  <div className="mt-2 text-xs text-accent-green">✓ inspected</div>
                )}
              </button>
            ))}
          </div>
          <div className="relative mt-6 h-2 rounded-full bg-white/10">
            <div className="absolute left-[32%] top-1/2 h-5 w-px -translate-y-1/2 bg-accent-red" />
            <div className="absolute left-[60%] top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-accent-amber" />
            <div className="absolute right-[8%] top-1/2 h-5 w-px -translate-y-1/2 bg-accent-green" />
          </div>
          <div className="mt-3 flex justify-between text-[12px] text-slate-500">
            <span>Below expectation</span>
            <span>Expected 6%</span>
            <span>Above expectation</span>
          </div>
        </RiskPanel>
        <RiskPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
          <div className="ops-caption text-[12px] text-accent-cyan">
            {active.label}
          </div>
          <div className="mt-2 text-4xl font-semibold tabular-nums text-white">
            {active.result}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{active.meaning}</p>
          <div className="mt-5 text-xs text-slate-500">
            {inspected.length} of {OUTCOMES.length} outcomes inspected
          </div>
        </RiskPanel>
      </div>
    </div>
  );
}

const CLAIMS = [
  {
    id: "operations",
    label: "Operating costs",
    amount: "$55",
    explanation: "Employees, suppliers, and operating needs are paid first in this simplified OPS case.",
  },
  {
    id: "lenders",
    label: "Lenders",
    amount: "$20",
    explanation: "Required interest and debt payments are contractual claims ahead of shareholders.",
  },
  {
    id: "taxes",
    label: "Taxes",
    amount: "$10",
    explanation: "Taxes are another claim on company cash before the shareholder residual.",
  },
  {
    id: "shareholders",
    label: "Shareholders",
    amount: "$15",
    explanation: "Shareholders receive the $15 left after the other claims. That remaining amount is the residual.",
  },
] as const;

function ResidualClaimScene({ onComplete }: EquityRiskSceneProps) {
  const [inspected, setInspected] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof CLAIMS)[number]>(CLAIMS[0]);
  const inspect = (claim: (typeof CLAIMS)[number]) => {
    setActive(claim);
    if (inspected.includes(claim.id)) return;
    const next = [...inspected, claim.id];
    setInspected(next);
    if (next.length === CLAIMS.length) onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-green/25 bg-accent-green/[0.04]">
        <div className="ops-caption text-[12px] text-accent-green">
          Direct definition
        </div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Equity is a residual claim on a company’s earnings and cash flows.
          Shareholders receive what remains after the company meets the claims
          that come before them.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Northstar produces $100 of company cash. Follow every claim, then identify
        the amount exposed to shareholder uncertainty.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <RiskPanel className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
          <div className="relative grid gap-2 sm:grid-cols-4">
            {CLAIMS.map((claim, index) => (
              <button
                key={claim.id}
                type="button"
                onClick={() => inspect(claim)}
                className={cn(
                  "relative rounded-xl border p-4 text-left transition-colors",
                  claim.id === "shareholders"
                    ? "border-accent-green/35 bg-accent-green/[0.06]"
                    : active.id === claim.id
                      ? "border-accent-cyan/40 bg-accent-cyan/[0.05]"
                      : "border-white/10 bg-white/[0.025]",
                )}
              >
                <div className="text-[12px] text-slate-500">Claim {index + 1}</div>
                <div className="mt-2 text-sm font-semibold text-white">{claim.label}</div>
                <div className="mt-3 text-2xl font-semibold tabular-nums text-white">
                  {claim.amount}
                </div>
                {index < CLAIMS.length - 1 && (
                  <span className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-accent-amber sm:block">
                    →
                  </span>
                )}
              </button>
            ))}
          </div>
        </RiskPanel>
        <RiskPanel className="border-accent-amber/20">
          <div className="ops-caption text-[12px] text-accent-amber">{active.label}</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums text-white">
            {active.amount}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{active.explanation}</p>
          <div className="mt-4 text-xs text-slate-500">
            {inspected.length} of {CLAIMS.length} claims inspected
          </div>
        </RiskPanel>
      </div>
    </div>
  );
}

const LENSES = [
  {
    id: "price",
    title: "Price versus cash-flow risk",
    question: "Is the uncertainty in the traded price, the shareholder cash flows, or both?",
    example: "A stable dividend can coexist with a sharply changing stock price.",
  },
  {
    id: "downside",
    title: "Total versus downside risk",
    question: "Does the investor count every deviation, or only outcomes below a chosen target?",
    example: "A surprise gain increases total variability but is not a downside outcome relative to the target.",
  },
  {
    id: "portfolio",
    title: "Standalone versus portfolio-added risk",
    question: "Is the stock being judged alone, or by how it changes an existing portfolio?",
    example: "A volatile stock can add less risk when its outcomes differ from the investor's other holdings.",
  },
] as const;

function RiskLensScene({ onComplete }: EquityRiskSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof LENSES)[number]>(LENSES[0]);
  const open = (lens: (typeof LENSES)[number]) => {
    setActive(lens);
    if (opened.includes(lens.id)) return;
    const next = [...opened, lens.id];
    setOpened(next);
    if (next.length === LENSES.length) onComplete();
  };
  return (
    <div>
      <RiskPrompt>
        Keep Northstar constant and change only the question. Open all three
        lenses to see why “How risky is this stock?” needs a defined perspective.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-2">
          {LENSES.map((lens, index) => (
            <button
              key={lens.id}
              type="button"
              onClick={() => open(lens)}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-colors",
                active.id === lens.id
                  ? "border-accent-cyan/50 bg-accent-cyan/[0.07]"
                  : "border-white/10 bg-white/[0.025] hover:border-white/25",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-white">
                  {index + 1}. {lens.title}
                </div>
                {opened.includes(lens.id) && (
                  <span className="text-xs text-accent-green">✓ opened</span>
                )}
              </div>
            </button>
          ))}
        </div>
        <RiskPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
          <div className="ops-caption text-[12px] text-accent-cyan">Active lens</div>
          <h3 className="mt-2 text-xl font-semibold text-white">{active.title}</h3>
          <p className="mt-3 text-[15px] leading-6 text-slate-200">{active.question}</p>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <div className="text-xs text-slate-500">Concrete example</div>
            <p className="mt-2 text-sm leading-6 text-slate-300">{active.example}</p>
          </div>
          <div className="mt-4 text-xs text-slate-500">
            {opened.length} of {LENSES.length} lenses opened
          </div>
        </RiskPanel>
      </div>
    </div>
  );
}

function PriceCashFlowScene({ onComplete }: EquityRiskSceneProps) {
  const [answer, setAnswer] = useState("");
  const correct = answer === "separate";
  const choose = (value: string) => {
    setAnswer(value);
    if (value === "separate") onComplete();
  };
  return (
    <div>
      <RiskPrompt>
        Northstar pays a stable $2 dividend in all three years, while its market
        price moves from $48 to $30 to $62. What does the evidence support?
      </RiskPrompt>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <RiskMetric label="Year 1" value="$48 price" detail="$2 dividend" tone="cyan" />
        <RiskMetric label="Year 2" value="$30 price" detail="$2 dividend" tone="red" />
        <RiskMetric label="Year 3" value="$62 price" detail="$2 dividend" tone="green" />
      </div>
      <RiskPanel className="mt-5">
        <div className="space-y-2">
          <RiskChoice
            selected={answer === "none"}
            incorrect={answer === "none"}
            onClick={() => choose("none")}
          >
            The stock has little price risk because its dividend is stable.
          </RiskChoice>
          <RiskChoice
            selected={answer === "separate"}
            correct={correct}
            onClick={() => choose("separate")}
          >
            The dividend shows little cash-flow variation, while the changing
            market price shows significant price risk.
          </RiskChoice>
          <RiskChoice
            selected={answer === "same"}
            incorrect={answer === "same"}
            onClick={() => choose("same")}
          >
            Price risk and cash-flow risk must always move together.
          </RiskChoice>
        </div>
        {answer && (
          <RiskFeedback correct={correct}>
            {correct
              ? "The two lenses use different evidence. Stable dividends do not make the traded price stable."
              : "Read the dividend series and price series separately; one stays fixed while the other changes."}
          </RiskFeedback>
        )}
      </RiskPanel>
    </div>
  );
}

const MAP_QUESTIONS = [
  {
    id: "q1",
    prompt: "Does a surprise gain count as uncertainty, even though it is favorable?",
    answer: "total",
    options: [
      ["total", "Yes under total risk; downside risk focuses on results below a target."],
      ["down", "No. Risk only includes negative outcomes."],
    ],
  },
  {
    id: "q2",
    prompt: "Which lens asks how Northstar changes a fund that already holds other stocks?",
    answer: "portfolio",
    options: [
      ["standalone", "Standalone risk"],
      ["portfolio", "Portfolio-added risk"],
    ],
  },
  {
    id: "q3",
    prompt: "A dividend is steady while price changes sharply. Which conclusion follows?",
    answer: "different",
    options: [
      ["same", "Cash-flow risk and price risk are identical."],
      ["different", "The cash-flow and price lenses can give different answers."],
    ],
  },
] as const;

function RiskMapScene({ onComplete }: EquityRiskSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const correct = MAP_QUESTIONS.every((q) => answers[q.id] === q.answer);
  const choose = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (MAP_QUESTIONS.every((q) => next[q.id] === q.answer)) onComplete();
  };
  return (
    <div>
      <RiskPrompt>
        Complete the map using only definitions and examples already practiced.
      </RiskPrompt>
      <div className="mt-5 space-y-4">
        {MAP_QUESTIONS.map((question, index) => (
          <RiskPanel key={question.id}>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/30 bg-accent-amber/10 text-xs text-accent-amber">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-6 text-white">{question.prompt}</p>
                <div className="mt-3 grid gap-2">
                  {question.options.map(([value, label]) => (
                    <RiskChoice
                      key={value}
                      selected={answers[question.id] === value}
                      correct={answers[question.id] === value && value === question.answer}
                      incorrect={answers[question.id] === value && value !== question.answer}
                      onClick={() => choose(question.id, value)}
                    >
                      {label}
                    </RiskChoice>
                  ))}
                </div>
              </div>
            </div>
          </RiskPanel>
        ))}
      </div>
      {Object.keys(answers).length === MAP_QUESTIONS.length && (
        <RiskFeedback correct={correct}>
          {correct
            ? "The three dimensions are now defined independently. The next lesson asks which risk survives inside a portfolio."
            : "One or more answers conflicts with the lens definition. Reopen the evidence in that question."}
        </RiskFeedback>
      )}
    </div>
  );
}
