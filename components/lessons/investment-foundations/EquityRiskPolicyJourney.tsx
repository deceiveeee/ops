"use client";

import { useState } from "react";
import { useIFProgress } from "@/lib/if-progress";
import EquityRiskJourneyShell, {
  RiskChoice,
  RiskFeedback,
  RiskMetric,
  RiskPanel,
  RiskPrompt,
  type EquityRiskSceneProps,
} from "./EquityRiskJourneyShell";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-3-6-build-an-equity-risk-policy";

const STEPS = [
  {
    label: "Imply",
    title: "Infer a required return from price",
    guide:
      "A market-implied required return is backed out of price and cash-flow assumptions. State every assumption before treating the result as evidence.",
    instruction: "Inspect all three model inputs, then calculate the implied return.",
    next: "Adjust the cash flow",
  },
  {
    label: "Adjust",
    title: "Create a certainty-equivalent cash flow",
    guide:
      "A certainty equivalent is a smaller safe amount an investor treats as equivalent to an uncertain expected cash flow. The adjustment requires judgment.",
    instruction: "Inspect the uncertain outcomes and choose the fund's safe equivalent.",
    next: "Set the price buffer",
  },
  {
    label: "Buffer",
    title: "Apply the margin-of-safety rule",
    guide:
      "Margin of safety is the discount from estimated intrinsic value required before buying. It creates a decision buffer around valuation uncertainty.",
    instruction: "Calculate the 20% price threshold and test the current $50 price.",
    next: "Write the policy",
  },
  {
    label: "Policy",
    title: "Assemble the Equity Risk Policy",
    guide:
      "Combine the risk lens, portfolio perspective, beta interpretation, fundamental drivers, alternative check, and price rule.",
    instruction: "Choose the coherent statement for every policy field.",
    next: "Defend the decision",
  },
  {
    label: "Defend",
    title: "Submit the committee decision",
    guide:
      "A credible decision states what the evidence supports and what uncertainty remains. Research can reduce estimation uncertainty, not economic uncertainty.",
    instruction: "Correct all four release checks, then save the policy.",
    next: "Finish mission 4",
  },
] as const;

export default function EquityRiskPolicyJourney() {
  return (
    <EquityRiskJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 3.6 equity-risk-policy journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <ImpliedReturnScene onComplete={onComplete} />;
        if (step === 1) return <CertaintyEquivalentScene onComplete={onComplete} />;
        if (step === 2) return <MarginSafetyScene onComplete={onComplete} />;
        if (step === 3) return <PolicyBuilderScene onComplete={onComplete} />;
        return <DefendPolicyScene onComplete={onComplete} />;
      }}
      finishLabel="Return to Investment Foundations"
    />
  );
}

const IMPLIED_INPUTS = [
  {
    id: "price",
    label: "Current price",
    value: "$20",
    note: "The market price paid today in the source example.",
  },
  {
    id: "dividend",
    label: "Next-year dividend",
    value: "$1",
    note: "The cash flow expected one year from now under the dividend model.",
  },
  {
    id: "growth",
    label: "Perpetual growth",
    value: "3%",
    note: "The model assumes dividends grow at 3% forever and required return remains above growth.",
  },
] as const;

function ImpliedReturnScene({ onComplete }: EquityRiskSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof IMPLIED_INPUTS)[number]>(IMPLIED_INPUTS[0]);
  const [calculated, setCalculated] = useState(false);
  const inspect = (item: (typeof IMPLIED_INPUTS)[number]) => {
    setActive(item);
    if (!opened.includes(item.id)) setOpened([...opened, item.id]);
  };
  const calculate = () => {
    if (opened.length !== IMPLIED_INPUTS.length) return;
    setCalculated(true);
    onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          A market-implied required return is the discount rate that makes a
          valuation model’s expected cash flows and growth consistent with the current price.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Reconstruct the source’s constant-growth dividend example. Inspect each
        assumption before calculating; 8% is model-implied, not promised.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <RiskPanel>
          <div className="grid gap-2 sm:grid-cols-3">
            {IMPLIED_INPUTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => inspect(item)}
                className={cn(
                  "rounded-xl border p-4 text-left",
                  active.id === item.id
                    ? "border-accent-cyan/50 bg-accent-cyan/[0.07]"
                    : "border-white/10 bg-white/[0.025]",
                )}
              >
                <div className="text-xs text-slate-500">{item.label}</div>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-white">{item.value}</div>
                {opened.includes(item.id) && <div className="mt-2 text-xs text-accent-green">✓ inspected</div>}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-sm text-slate-400">$1 ÷ $20 + 3% growth</div>
            <div className="mt-2 text-4xl font-semibold tabular-nums text-accent-amber">
              {calculated ? "8%" : "?"}
            </div>
          </div>
          <button
            type="button"
            onClick={calculate}
            disabled={opened.length !== IMPLIED_INPUTS.length || calculated}
            className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
          >
            Calculate implied return
          </button>
        </RiskPanel>
        <RiskPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
          <div className="ops-caption text-[12px] text-accent-cyan">{active.label}</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums text-white">{active.value}</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{active.note}</p>
        </RiskPanel>
      </div>
      {calculated && (
        <RiskFeedback correct>
          $1 ÷ $20 = 5%; 5% + 3% = 8%. The result depends on the dividend,
          perpetual-growth, and constant-required-return assumptions.
        </RiskFeedback>
      )}
    </div>
  );
}

const CASH_OUTCOMES = [
  ["weak", "Weak case", "$4", "25%"],
  ["base", "Base case", "$10", "50%"],
  ["strong", "Strong case", "$16", "25%"],
] as const;

function CertaintyEquivalentScene({ onComplete }: EquityRiskSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [choice, setChoice] = useState("");
  const inspect = (id: string) => {
    if (!opened.includes(id)) setOpened([...opened, id]);
  };
  const choose = (value: string) => {
    if (opened.length !== CASH_OUTCOMES.length) return;
    setChoice(value);
    if (value === "8") onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="ops-caption text-[12px] text-accent-cyan">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          A certainty-equivalent cash flow is a smaller safe amount the investor
          treats as equivalent to an uncertain expected cash flow.
        </p>
      </RiskPanel>
      <RiskPrompt>
        This original OPS policy case has an expected cash flow of $10. Inspect
        all outcomes, then apply the scholarship fund’s stated judgment that $8
        safe is equivalent to the uncertain $10 expectation.
      </RiskPrompt>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {CASH_OUTCOMES.map(([id, label, value, probability]) => (
          <button
            key={id}
            type="button"
            onClick={() => inspect(id)}
            className={cn(
              "rounded-xl border p-4 text-left",
              opened.includes(id)
                ? "border-accent-green/35 bg-accent-green/[0.06]"
                : "border-white/10 bg-white/[0.025]",
            )}
          >
            <div className="text-xs text-slate-500">{probability} probability</div>
            <div className="mt-1 text-sm font-semibold text-white">{label}</div>
            <div className="mt-3 text-3xl font-semibold tabular-nums text-accent-cyan">{value}</div>
          </button>
        ))}
      </div>
      <RiskPanel className="mt-5">
        <div className="text-sm font-semibold text-white">Choose the fund’s stated safe equivalent</div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["10", "8", "6"].map((value) => (
            <RiskChoice
              key={value}
              selected={choice === value}
              correct={choice === value && value === "8"}
              incorrect={choice === value && value !== "8"}
              disabled={opened.length !== CASH_OUTCOMES.length}
              onClick={() => choose(value)}
            >
              ${value} safe
            </RiskChoice>
          ))}
        </div>
        {choice && (
          <RiskFeedback correct={choice === "8"}>
            {choice === "8"
              ? "The $8 value comes from this fund's stated risk judgment. It is not a universal conversion from $10 expected cash flow."
              : "Use the policy judgment stated in the prompt. A certainty equivalent depends on the investor's risk assessment."}
          </RiskFeedback>
        )}
      </RiskPanel>
    </div>
  );
}

function MarginSafetyScene({ onComplete }: EquityRiskSceneProps) {
  const [calculated, setCalculated] = useState(false);
  const [decision, setDecision] = useState("");
  const correct = decision === "wait";
  const choose = (value: string) => {
    setDecision(value);
    if (calculated && value === "wait") onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Margin of safety is the percentage discount from estimated intrinsic
          value an investor requires before buying.
        </p>
      </RiskPanel>
      <RiskPrompt>
        The estimated value is $55, the current price is $50, and the fund
        requires a 20% margin of safety. Calculate the maximum qualifying price.
      </RiskPrompt>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <RiskMetric label="Estimated value" value="$55" tone="cyan" />
        <RiskMetric label="Required buffer" value="20%" tone="amber" />
        <RiskMetric label="Current price" value="$50" />
      </div>
      <RiskPanel className="mt-5">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <div className="rounded-xl border border-white/10 p-4 text-center text-xl tabular-nums text-white">$55</div>
          <div className="text-center text-slate-500">×</div>
          <div className="rounded-xl border border-white/10 p-4 text-center text-xl tabular-nums text-white">(1 − 20%)</div>
          <div className="text-center text-slate-500">=</div>
          <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-4 text-center text-2xl font-semibold tabular-nums text-accent-amber">
            {calculated ? "$44" : "?"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCalculated(true)}
          disabled={calculated}
          className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber disabled:border-accent-green/30 disabled:text-accent-green"
        >
          {calculated ? "✓ Maximum price calculated" : "Calculate maximum price"}
        </button>
      </RiskPanel>
      {calculated && (
        <RiskPanel className="mt-4">
          <div className="text-sm font-semibold text-white">What should the fund do at $50?</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <RiskChoice selected={decision === "buy"} incorrect={decision === "buy"} onClick={() => choose("buy")}>
              Buy. Any price below $55 satisfies a 20% margin of safety.
            </RiskChoice>
            <RiskChoice selected={decision === "wait"} correct={correct} onClick={() => choose("wait")}>
              Wait. $50 is only 9.09% below $55 and is above the $44 threshold.
            </RiskChoice>
          </div>
          {decision && (
            <RiskFeedback correct={correct}>
              {correct
                ? "The buffer protects against some valuation error. It does not eliminate business risk, market risk, or the chance that $55 is wrong."
                : "Compare the current $50 price with the calculated $44 purchase threshold, not only with estimated value."}
            </RiskFeedback>
          )}
        </RiskPanel>
      )}
    </div>
  );
}

const POLICY_FIELDS = [
  {
    id: "lens",
    label: "Risk lens",
    answer: "separate",
    options: [
      ["separate", "Separate price, cash-flow, downside, and portfolio-added risk."],
      ["one", "Use one undefined meaning of risk for every decision."],
    ],
  },
  {
    id: "portfolio",
    label: "Portfolio perspective",
    answer: "diversified",
    options: [
      ["diversified", "Distinguish diversifiable company risk from shared market risk."],
      ["ignore", "Ignore the investor's other holdings."],
    ],
  },
  {
    id: "beta",
    label: "Beta interpretation",
    answer: "market",
    options: [
      ["market", "Treat beta as an uncertain estimate of market exposure for a diversified investor."],
      ["total", "Treat beta as an exact measure of total risk and investment quality."],
    ],
  },
  {
    id: "method",
    label: "Method stack",
    answer: "stack",
    options: [
      ["stack", "Use CAPM for market exposure, fundamental evidence as a check, and a price buffer for valuation uncertainty."],
      ["single", "Use the lowest available beta and ignore assumptions."],
    ],
  },
] as const;

function PolicyBuilderScene({ onComplete }: EquityRiskSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (POLICY_FIELDS.every((field) => next[field.id] === field.answer)) onComplete();
  };
  const correct = POLICY_FIELDS.every((field) => answers[field.id] === field.answer);
  const complete = Object.keys(answers).length === POLICY_FIELDS.length;
  return (
    <div>
      <RiskPrompt>
        Assemble a policy using concepts already introduced and practiced in this module.
      </RiskPrompt>
      <div className="mt-5 space-y-4">
        {POLICY_FIELDS.map((field, index) => (
          <RiskPanel key={field.id}>
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-accent-amber/30 bg-accent-amber/10 text-xs text-accent-amber">
                {index + 1}
              </div>
              <h3 className="font-semibold text-white">{field.label}</h3>
            </div>
            <div className="mt-3 grid gap-2">
              {field.options.map(([value, label]) => (
                <RiskChoice
                  key={value}
                  selected={answers[field.id] === value}
                  correct={answers[field.id] === value && value === field.answer}
                  incorrect={answers[field.id] === value && value !== field.answer}
                  onClick={() => choose(field.id, value)}
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
            ? "The policy now connects definitions, portfolio context, model interpretation, business evidence, and a decision rule."
            : "A policy should preserve the distinction among risk dimensions and the limits of every model."}
        </RiskFeedback>
      )}
    </div>
  );
}

const RELEASE_CHECKS = [
  {
    id: "decision",
    prompt: "At $50 with a $44 maximum purchase price, what is the decision?",
    answer: "wait",
    options: [["wait", "Wait for $44 or below."], ["buy", "Buy because $50 is below $55."]],
  },
  {
    id: "beta",
    prompt: "What does beta 1.20 support?",
    answer: "exposure",
    options: [["exposure", "20% more market sensitivity than beta 1 for a diversified investor."], ["total", "20% more total business risk."]],
  },
  {
    id: "proxy",
    prompt: "What does a proxy-return association prove?",
    answer: "association",
    options: [["association", "Only an association unless causal evidence is established."], ["cause", "That the characteristic causes future returns."]],
  },
  {
    id: "uncertainty",
    prompt: "What can additional research accomplish?",
    answer: "reduce",
    options: [["reduce", "Reduce estimation uncertainty while economic uncertainty remains."], ["remove", "Remove all economic risk from the investment."]],
  },
] as const;

function DefendPolicyScene({ onComplete }: EquityRiskSceneProps) {
  const { saveEquityRiskPolicy } = useIFProgress();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const correct = RELEASE_CHECKS.every((check) => answers[check.id] === check.answer);
  const choose = (id: string, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }));
    setSaved(false);
  };
  const save = () => {
    if (!correct) return;
    saveEquityRiskPolicy({
      riskDefinition: "Separate price, cash-flow, downside, standalone, and portfolio-added risk.",
      portfolioContext: "Distinguish diversifiable company risk from market risk for the diversified scholarship fund.",
      betaInterpretation: "Beta is an uncertain estimate of relative market exposure, not total risk or investment quality.",
      fundamentalDrivers: "Review product cyclicality, operating leverage, and financial leverage with other conditions held equal.",
      methodStack: "Use CAPM for market exposure, fundamental evidence as a check, and margin of safety for valuation uncertainty.",
      priceRule: "Require a 20% discount to estimated value; for $55 value, buy only at $44 or below.",
      decision: "Wait at the current $50 price.",
      remainingUncertainty: "Future cash flows, market conditions, model inputs, and estimated value can still be wrong.",
      updatedAt: "",
    });
    setSaved(true);
    onComplete();
  };
  return (
    <div>
      <RiskPrompt>
        Complete the four release checks, then save the Equity Risk Policy to
        the scholarship fund’s committee file.
      </RiskPrompt>
      <div className="mt-5 space-y-4">
        {RELEASE_CHECKS.map((check, index) => (
          <RiskPanel key={check.id}>
            <div className="text-xs text-accent-amber">Release check {index + 1}</div>
            <p className="mt-2 font-semibold leading-6 text-white">{check.prompt}</p>
            <div className="mt-3 grid gap-2">
              {check.options.map(([value, label]) => (
                <RiskChoice
                  key={value}
                  selected={answers[check.id] === value}
                  correct={answers[check.id] === value && value === check.answer}
                  incorrect={answers[check.id] === value && value !== check.answer}
                  onClick={() => choose(check.id, value)}
                >
                  {label}
                </RiskChoice>
              ))}
            </div>
          </RiskPanel>
        ))}
      </div>
      <RiskPanel className={cn("mt-5", correct ? "border-accent-green/30" : undefined)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="ops-caption text-[12px] text-slate-500">Equity Risk Policy</div>
            <div className={cn("mt-1 font-semibold", correct ? "text-accent-green" : "text-slate-400")}>
              {saved
                ? "Saved to your Investment Foundations work"
                : correct
                  ? "All release checks passed"
                  : `${Object.keys(answers).length} of ${RELEASE_CHECKS.length} checks answered`}
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!correct || saved}
            className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2.5 text-sm font-semibold text-accent-green disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
          >
            {saved ? "✓ Equity Risk Policy saved" : "Save the Equity Risk Policy"}
          </button>
        </div>
      </RiskPanel>
    </div>
  );
}
