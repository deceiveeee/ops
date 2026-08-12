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

const LESSON_SLUG = "if-3-4-what-makes-beta-rise-or-fall";

const STEPS = [
  {
    label: "Product",
    title: "Start with customer demand",
    guide:
      "Discretionary and cyclical products tend to react more strongly to broad economic changes than essential products, other things held equal.",
    instruction: "Run the same recession through both demand profiles.",
    next: "Open the operating machine",
  },
  {
    label: "Costs",
    title: "Amplify revenue with fixed operating costs",
    guide:
      "Operating leverage is the sensitivity created by fixed operating costs. The same revenue decline can produce a larger percentage decline in operating profit.",
    instruction: "Stress both cost structures and compare operating profit.",
    next: "Add financial leverage",
  },
  {
    label: "Debt",
    title: "Amplify the shareholder residual with debt",
    guide:
      "Financial leverage adds fixed interest payments. When operating income falls, the cash remaining for shareholders can fall faster.",
    instruction: "Apply the same operating decline to low- and high-debt cases.",
    next: "Build the beta engine",
  },
  {
    label: "Engine",
    title: "Connect the three beta drivers",
    guide:
      "Combine product demand, operating leverage, and financial leverage. Each driver changes how market conditions reach shareholder cash flows.",
    instruction: "Activate all three higher-sensitivity traits.",
    next: "Explain the mechanism",
  },
  {
    label: "Explain",
    title: "Defend the conditional prediction",
    guide:
      "A beta-driver claim needs a causal chain and the qualification 'other things held equal.' Build both before finishing.",
    instruction: "Correctly complete all three causal explanations.",
    next: "Enter Lesson 3.5",
  },
] as const;

export default function BetaDriversJourney() {
  return (
    <EquityRiskJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 3.4 beta-drivers journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <ProductDemandScene onComplete={onComplete} />;
        if (step === 1) return <OperatingLeverageScene onComplete={onComplete} />;
        if (step === 2) return <FinancialLeverageScene onComplete={onComplete} />;
        if (step === 3) return <BetaEngineScene onComplete={onComplete} />;
        return <DriverExplanationScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-3-5-choosing-a-risk-measure",
        label: "Continue to Lesson 3.5",
      }}
    />
  );
}

const PRODUCTS = [
  {
    id: "essential",
    label: "Essential transit pass",
    base: "$100m",
    stressed: "$94m",
    change: "−6%",
    note: "Commuters reduce purchases modestly because the service remains necessary.",
  },
  {
    id: "discretionary",
    label: "Luxury travel package",
    base: "$100m",
    stressed: "$78m",
    change: "−22%",
    note: "Customers can postpone the purchase, so revenue reacts more strongly to the recession.",
  },
] as const;

function ProductDemandScene({ onComplete }: EquityRiskSceneProps) {
  const [tested, setTested] = useState<string[]>([]);
  const test = (id: string) => {
    if (tested.includes(id)) return;
    const next = [...tested, id];
    setTested(next);
    if (next.length === PRODUCTS.length) onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Product cyclicality describes how strongly customer demand responds to
          broad economic conditions. Discretionary products can usually be delayed
          more easily than essentials.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Apply the same recession to two $100 million revenue businesses. These
        values are an original OPS mechanism case, not historical company data.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {PRODUCTS.map((product) => {
          const active = tested.includes(product.id);
          return (
            <RiskPanel key={product.id} className={active ? "border-accent-cyan/35" : undefined}>
              <div className="text-sm font-semibold text-white">{product.label}</div>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <RiskMetric label="Normal revenue" value={product.base} />
                <span className="text-accent-red">→</span>
                <RiskMetric label="Recession revenue" value={active ? product.stressed : "?"} tone={active ? "red" : "default"} />
              </div>
              <button
                type="button"
                onClick={() => test(product.id)}
                disabled={active}
                className="mt-4 w-full rounded-full border border-accent-amber/35 bg-accent-amber/[0.07] px-4 py-2 text-sm font-semibold text-accent-amber disabled:border-accent-green/30 disabled:bg-accent-green/[0.06] disabled:text-accent-green"
              >
                {active ? `${product.change} revenue · tested` : "Run recession"}
              </button>
              {active && <p className="mt-3 text-sm leading-6 text-slate-300">{product.note}</p>}
            </RiskPanel>
          );
        })}
      </div>
    </div>
  );
}

const COST_CASES = [
  {
    id: "flexible",
    label: "More flexible costs",
    before: "$20m",
    after: "$16m",
    change: "−20%",
    formula: "$90m revenue − $54m variable costs − $20m fixed costs",
  },
  {
    id: "fixed",
    label: "Higher fixed costs",
    before: "$20m",
    after: "$12m",
    change: "−40%",
    formula: "$90m revenue − $18m variable costs − $60m fixed costs",
  },
] as const;

function OperatingLeverageScene({ onComplete }: EquityRiskSceneProps) {
  const [tested, setTested] = useState<string[]>([]);
  const test = (id: string) => {
    if (tested.includes(id)) return;
    const next = [...tested, id];
    setTested(next);
    if (next.length === COST_CASES.length) onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="ops-caption text-[12px] text-accent-cyan">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Operating leverage is the sensitivity of operating profit created by
          fixed operating costs. Fixed costs do not fall automatically when revenue falls.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Both businesses begin with $100 million revenue and $20 million operating
        profit. Reduce revenue by 10% and compare the profit response.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {COST_CASES.map((item) => {
          const active = tested.includes(item.id);
          return (
            <RiskPanel key={item.id}>
              <div className="ops-caption text-[12px] text-slate-500">{item.label}</div>
              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <RiskMetric label="Before" value={item.before} tone="green" />
                <span className="text-accent-red">→</span>
                <RiskMetric label="After" value={active ? item.after : "?"} tone={active ? "red" : "default"} />
              </div>
              <button
                type="button"
                onClick={() => test(item.id)}
                disabled={active}
                className="mt-4 w-full rounded-full border border-accent-amber/35 bg-accent-amber/[0.07] px-4 py-2 text-sm font-semibold text-accent-amber disabled:border-accent-green/30 disabled:text-accent-green"
              >
                {active ? `${item.change} operating profit` : "Stress the cost structure"}
              </button>
              {active && <p className="mt-3 text-xs leading-5 text-slate-400">{item.formula} = {item.after}</p>}
            </RiskPanel>
          );
        })}
      </div>
      {tested.length === 2 && (
        <RiskFeedback correct>
          The same 10% revenue decline produces a 20% profit decline with more
          flexible costs and a 40% decline with higher fixed costs.
        </RiskFeedback>
      )}
    </div>
  );
}

const DEBT_CASES = [
  {
    id: "low",
    label: "Low debt",
    interest: "$2m",
    before: "$18m",
    after: "$10m",
    change: "−44%",
  },
  {
    id: "high",
    label: "High debt",
    interest: "$8m",
    before: "$12m",
    after: "$4m",
    change: "−67%",
  },
] as const;

function FinancialLeverageScene({ onComplete }: EquityRiskSceneProps) {
  const [tested, setTested] = useState<string[]>([]);
  const test = (id: string) => {
    if (tested.includes(id)) return;
    const next = [...tested, id];
    setTested(next);
    if (next.length === DEBT_CASES.length) onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Financial leverage is the shareholder sensitivity created by debt and
          its fixed interest payments. Lenders are paid before shareholders receive the residual.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Operating income falls from $20 million to $12 million in both cases.
        Apply each fixed interest bill and compare shareholder income.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {DEBT_CASES.map((item) => {
          const active = tested.includes(item.id);
          return (
            <RiskPanel key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-white">{item.label}</div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                  Interest {item.interest}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <RiskMetric label="Shareholder income before" value={item.before} tone="green" />
                <span className="text-accent-red">→</span>
                <RiskMetric label="After decline" value={active ? item.after : "?"} tone={active ? "red" : "default"} />
              </div>
              <button
                type="button"
                onClick={() => test(item.id)}
                disabled={active}
                className="mt-4 w-full rounded-full border border-accent-amber/35 bg-accent-amber/[0.07] px-4 py-2 text-sm font-semibold text-accent-amber disabled:border-accent-green/30 disabled:text-accent-green"
              >
                {active ? `${item.change} shareholder income` : "Apply fixed interest"}
              </button>
            </RiskPanel>
          );
        })}
      </div>
    </div>
  );
}

const DRIVERS = [
  ["product", "Product demand", "Essential", "Discretionary"],
  ["costs", "Operating costs", "Flexible", "High fixed costs"],
  ["debt", "Financial leverage", "Low debt", "High debt"],
] as const;

function BetaEngineScene({ onComplete }: EquityRiskSceneProps) {
  const [active, setActive] = useState<string[]>([]);
  const toggle = (id: string) => {
    const next = active.includes(id) ? active.filter((item) => item !== id) : [...active, id];
    setActive(next);
    if (next.length === DRIVERS.length) onComplete();
  };
  const score = active.length;
  return (
    <div>
      <RiskPrompt>
        Reconfigure the same company. Activate every higher-sensitivity trait and
        watch a shared economic shock travel toward the shareholder residual.
      </RiskPrompt>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {DRIVERS.map(([id, label, low, high]) => (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            aria-pressed={active.includes(id)}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              active.includes(id)
                ? "border-accent-red/40 bg-accent-red/[0.07]"
                : "border-accent-green/30 bg-accent-green/[0.05]",
            )}
          >
            <div className="text-xs text-slate-500">{label}</div>
            <div className="mt-2 font-semibold text-white">{active.includes(id) ? high : low}</div>
            <div className={cn("mt-3 text-xs", active.includes(id) ? "text-accent-red" : "text-accent-green")}>
              {active.includes(id) ? "Higher sensitivity" : "Lower sensitivity"}
            </div>
          </button>
        ))}
      </div>
      <RiskPanel className="mt-5 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 terminal-grid opacity-20" />
        <div className="relative flex flex-col items-stretch gap-2 text-center sm:flex-row sm:items-center">
          {[
            "Broad economy changes",
            score >= 1 ? "Revenue reacts more" : "Revenue response is muted",
            score >= 2 ? "Operating profit amplifies" : "Operating profit is steadier",
            score >= 3 ? "Shareholder residual amplifies" : "Shareholder residual is steadier",
            score >= 3 ? "Predicted beta: higher" : score >= 2 ? "Predicted beta: rising" : "Predicted beta: lower",
          ].map((label, index, list) => (
            <div key={label} className="contents">
              <div className={cn(
                "flex-1 rounded-xl border p-3 text-xs font-semibold",
                index === list.length - 1
                  ? score === 3
                    ? "border-accent-red/40 bg-accent-red/[0.07] text-accent-red"
                    : "border-accent-cyan/30 bg-accent-cyan/[0.05] text-accent-cyan"
                  : "border-white/10 bg-white/[0.025] text-slate-200",
              )}>
                {label}
              </div>
              {index < list.length - 1 && <span className="text-accent-amber">→</span>}
            </div>
          ))}
        </div>
      </RiskPanel>
      <div className="mt-3 text-xs text-slate-500">
        Conditional prediction: other business, market, and estimation conditions held equal.
      </div>
    </div>
  );
}

const EXPLANATIONS = [
  {
    id: "product",
    prompt: "Why can a discretionary product raise predicted beta?",
    answer: "demand",
    options: [
      ["demand", "Economic changes can move customer demand and revenue more strongly."],
      ["quality", "Discretionary products are automatically worse investments."],
    ],
  },
  {
    id: "cost",
    prompt: "Why can higher fixed operating costs raise predicted beta?",
    answer: "profit",
    options: [
      ["profit", "Fixed costs can make operating profit change faster than revenue."],
      ["revenue", "Fixed costs prevent revenue from changing."],
    ],
  },
  {
    id: "debt",
    prompt: "Why can more debt raise predicted equity beta?",
    answer: "residual",
    options: [
      ["residual", "Fixed interest payments can amplify changes in the shareholder residual."],
      ["safe", "Debt removes uncertainty from shareholder cash flows."],
    ],
  },
] as const;

function DriverExplanationScene({ onComplete }: EquityRiskSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (EXPLANATIONS.every((item) => next[item.id] === item.answer)) onComplete();
  };
  const complete = Object.keys(answers).length === EXPLANATIONS.length;
  const correct = EXPLANATIONS.every((item) => answers[item.id] === item.answer);
  return (
    <div>
      <RiskPrompt>
        Complete every causal explanation. None of the company labels alone determines beta.
      </RiskPrompt>
      <div className="mt-5 space-y-4">
        {EXPLANATIONS.map((item) => (
          <RiskPanel key={item.id}>
            <p className="font-semibold leading-6 text-white">{item.prompt}</p>
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
            ? "Each driver is connected through cash-flow sensitivity. The relationships are conditional predictions, not deterministic company labels."
            : "Use the cause-and-effect mechanism: economy → revenue → operating profit → shareholder residual."}
        </RiskFeedback>
      )}
    </div>
  );
}
