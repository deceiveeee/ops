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

const LESSON_SLUG = "if-3-3-what-beta-measures";

const STEPS = [
  {
    label: "CAPM",
    title: "Build the required-return model",
    guide:
      "CAPM estimates required return from a risk-free rate, beta, and an equity risk premium. Define each input before calculating.",
    instruction: "Inspect all three CAPM inputs, then calculate required return.",
    next: "Test beta 1",
  },
  {
    label: "Benchmark",
    title: "Use beta 1 as the market benchmark",
    guide:
      "Beta measures market exposure for a diversified investor. Beta 1 matches the market benchmark; 1.20 indicates 20% greater market sensitivity.",
    instruction: "Test at least three positive and negative market moves.",
    next: "Estimate beta",
  },
  {
    label: "Regression",
    title: "See how regression estimates beta",
    guide:
      "Regression fits a line through paired stock and market returns. Its slope is the raw beta estimate.",
    instruction: "Inspect the index, weekly frequency, and historical period choices.",
    next: "Open the uncertainty",
  },
  {
    label: "Uncertainty",
    title: "Treat beta as an estimate",
    guide:
      "Regression beta changes with estimation choices and contains statistical error. The historical number is evidence, not a precise permanent fact.",
    instruction: "Choose the accurate interpretation of the historical estimate.",
    next: "Reject the beta myths",
  },
  {
    label: "Myths",
    title: "Release beta with its qualifications",
    guide:
      "Beta is market exposure, not total risk or investment quality. Correct every statement before using beta in a policy.",
    instruction: "Correctly resolve all four beta statements.",
    next: "Enter Lesson 3.4",
  },
] as const;

export default function BetaRiskJourney() {
  return (
    <EquityRiskJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 3.3 beta journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <CAPMBuilderScene onComplete={onComplete} />;
        if (step === 1) return <BetaBenchmarkScene onComplete={onComplete} />;
        if (step === 2) return <RegressionScene onComplete={onComplete} />;
        if (step === 3) return <BetaUncertaintyScene onComplete={onComplete} />;
        return <BetaMythsScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-3-4-what-makes-beta-rise-or-fall",
        label: "Continue to Lesson 3.4",
      }}
    />
  );
}

const CAPM_INPUTS = [
  {
    id: "riskFree",
    label: "Risk-free rate",
    value: "4%",
    definition: "The return on an investment treated as free of default risk for the relevant horizon.",
  },
  {
    id: "beta",
    label: "Beta",
    value: "1.20",
    definition: "The stock's estimated exposure to broad market risk for a diversified investor.",
  },
  {
    id: "premium",
    label: "Equity risk premium",
    value: "5%",
    definition: "The extra return investors require for bearing broad equity-market risk above the risk-free rate.",
  },
] as const;

function CAPMBuilderScene({ onComplete }: EquityRiskSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof CAPM_INPUTS)[number]>(CAPM_INPUTS[0]);
  const [calculated, setCalculated] = useState(false);
  const inspect = (item: (typeof CAPM_INPUTS)[number]) => {
    setActive(item);
    if (!opened.includes(item.id)) setOpened([...opened, item.id]);
  };
  const calculate = () => {
    if (opened.length !== CAPM_INPUTS.length) return;
    setCalculated(true);
    onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          The Capital Asset Pricing Model, or CAPM, estimates the required return
          for a stock as the risk-free rate plus beta times the equity risk premium.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Inspect every input in this OPS teaching case, then build Northstar’s
        required return. These inputs are illustrative, not current market data.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <RiskPanel>
          <div className="grid gap-2 sm:grid-cols-3">
            {CAPM_INPUTS.map((item) => (
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
                <div className="mt-2 text-2xl font-semibold tabular-nums text-white">
                  {item.value}
                </div>
                {opened.includes(item.id) && (
                  <div className="mt-2 text-xs text-accent-green">✓ defined</div>
                )}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <div className="text-sm text-slate-400">Required return = 4% + 1.20 × 5%</div>
            <div className="mt-2 text-4xl font-semibold tabular-nums text-accent-amber">
              {calculated ? "10.0%" : "?"}
            </div>
          </div>
          <button
            type="button"
            onClick={calculate}
            disabled={opened.length !== CAPM_INPUTS.length || calculated}
            className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
          >
            Calculate required return
          </button>
        </RiskPanel>
        <RiskPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
          <div className="ops-caption text-[12px] text-accent-cyan">{active.label}</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums text-white">{active.value}</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{active.definition}</p>
        </RiskPanel>
      </div>
      {calculated && (
        <RiskFeedback correct>
          4% + 1.20 × 5% = 10%. CAPM maps market exposure to a required
          return; it does not promise that the realized return will be 10%.
        </RiskFeedback>
      )}
    </div>
  );
}

const MARKET_MOVES = [-10, -5, 5, 10] as const;

function BetaBenchmarkScene({ onComplete }: EquityRiskSceneProps) {
  const [move, setMove] = useState(0);
  const [tested, setTested] = useState<number[]>([]);
  const test = (value: number) => {
    setMove(value);
    if (tested.includes(value)) return;
    const next = [...tested, value];
    setTested(next);
    if (next.length >= 3) onComplete();
  };
  const response = move * 1.2;
  return (
    <div>
      <RiskPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <div className="font-semibold text-white">Beta 1.00</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">Matches the market-exposure benchmark.</p>
          </div>
          <div>
            <div className="font-semibold text-white">Beta above 1</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">Greater sensitivity to broad market moves.</p>
          </div>
          <div>
            <div className="font-semibold text-white">Beta below 1</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">Lower sensitivity to broad market moves.</p>
          </div>
        </div>
      </RiskPanel>
      <RiskPrompt>
        Northstar has an illustrative beta of 1.20. Test at least three market
        moves. This simplified response isolates market exposure; actual returns
        also include company-specific events and estimation error.
      </RiskPrompt>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MARKET_MOVES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => test(value)}
            className={cn(
              "rounded-xl border p-3 text-center text-sm font-semibold",
              move === value
                ? "border-accent-amber/50 bg-accent-amber/10 text-accent-amber"
                : "border-white/10 bg-white/[0.025] text-slate-300",
            )}
          >
            Market {value > 0 ? "+" : ""}{value}%
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <RiskMetric label="Market move" value={`${move > 0 ? "+" : ""}${move}%`} tone={move < 0 ? "red" : move > 0 ? "green" : "default"} />
        <div className="text-center text-xl text-accent-amber">× 1.20 →</div>
        <RiskMetric label="Illustrative stock response" value={`${response > 0 ? "+" : ""}${response.toFixed(0)}%`} tone={response < 0 ? "red" : response > 0 ? "green" : "default"} />
      </div>
      <div className="mt-3 text-xs text-slate-500">{tested.length} of 3 required moves tested</div>
    </div>
  );
}

const ESTIMATION_CHOICES = [
  {
    id: "index",
    label: "Market index",
    value: "S&P 500",
    note: "Changing the benchmark changes the paired market returns and can change the slope.",
  },
  {
    id: "frequency",
    label: "Return frequency",
    value: "Weekly",
    note: "The source chart uses weekly observations. The narration's monthly wording conflicts with the slide; the slide controls.",
  },
  {
    id: "period",
    label: "Historical period",
    value: "2005–07",
    note: "The Amgen example is historical evidence from 103 weekly observations, not a current beta.",
  },
] as const;

const SCATTER = [
  [42, 110], [70, 95], [98, 122], [126, 83], [151, 96], [178, 64],
  [205, 78], [230, 52], [259, 68], [287, 39], [319, 55], [348, 28],
] as const;

function RegressionScene({ onComplete }: EquityRiskSceneProps) {
  const [opened, setOpened] = useState<string[]>([]);
  const [active, setActive] = useState<(typeof ESTIMATION_CHOICES)[number]>(ESTIMATION_CHOICES[0]);
  const inspect = (item: (typeof ESTIMATION_CHOICES)[number]) => {
    setActive(item);
    if (opened.includes(item.id)) return;
    const next = [...opened, item.id];
    setOpened(next);
    if (next.length === ESTIMATION_CHOICES.length) onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Regression beta is the estimated slope of a line relating historical
          stock returns to historical market returns.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Inspect the three estimation choices attached to the source’s historical
        Amgen regression. The chart below is an original OPS reconstruction.
      </RiskPrompt>
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <RiskPanel>
          <svg viewBox="0 0 390 165" className="h-auto w-full" aria-label="Illustrative regression scatter with upward sloping fitted line">
            <line x1="28" y1="140" x2="370" y2="140" stroke="rgba(255,255,255,.2)" />
            <line x1="28" y1="14" x2="28" y2="140" stroke="rgba(255,255,255,.2)" />
            <line x1="42" y1="125" x2="355" y2="30" stroke="#fbbf24" strokeWidth="2" />
            {SCATTER.map(([x, y], index) => (
              <circle key={index} cx={x} cy={y} r="4" fill="#22d3ee" opacity=".8" />
            ))}
            <text x="300" y="158" fill="#94a3b8" fontSize="10">Market return</text>
            <text x="8" y="24" fill="#94a3b8" fontSize="10" transform="rotate(-90 8 24)">Stock return</text>
          </svg>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {ESTIMATION_CHOICES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => inspect(item)}
                className={cn(
                  "rounded-xl border p-3 text-left",
                  active.id === item.id
                    ? "border-accent-cyan/45 bg-accent-cyan/[0.06]"
                    : "border-white/10 bg-white/[0.025]",
                )}
              >
                <div className="text-[12px] text-slate-500">{item.label}</div>
                <div className="mt-1 text-sm font-semibold text-white">{item.value}</div>
              </button>
            ))}
          </div>
        </RiskPanel>
        <RiskPanel className="border-accent-cyan/20">
          <div className="ops-caption text-[12px] text-accent-cyan">{active.label}</div>
          <div className="mt-2 text-xl font-semibold text-white">{active.value}</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{active.note}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <RiskMetric label="Raw beta" value="0.75" tone="amber" />
            <RiskMetric label="R²" value="0.10" detail="Historical fit" />
          </div>
          <div className="mt-4 text-xs text-slate-500">{opened.length} of 3 choices inspected</div>
        </RiskPanel>
      </div>
    </div>
  );
}

function BetaUncertaintyScene({ onComplete }: EquityRiskSceneProps) {
  const [answer, setAnswer] = useState("");
  const correct = answer === "estimate";
  const choose = (value: string) => {
    setAnswer(value);
    if (value === "estimate") onComplete();
  };
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <RiskMetric label="Raw beta" value="0.75" tone="cyan" />
        <RiskMetric label="Adjusted beta" value="0.83" detail="0.67 × 0.75 + 0.33 × 1.00" tone="amber" />
        <RiskMetric label="Beta standard error" value="0.22" tone="red" />
      </div>
      <RiskPrompt>
        What is the accurate interpretation of this historical 2005–07 weekly estimate?
      </RiskPrompt>
      <RiskPanel className="mt-5">
        <div className="space-y-2">
          <RiskChoice selected={answer === "fact"} incorrect={answer === "fact"} onClick={() => choose("fact")}>
            Amgen’s true and permanent beta is exactly 0.75.
          </RiskChoice>
          <RiskChoice selected={answer === "total"} incorrect={answer === "total"} onClick={() => choose("total")}>
            Amgen had exactly 25% less total business risk than the market.
          </RiskChoice>
          <RiskChoice selected={answer === "estimate"} correct={correct} onClick={() => choose("estimate")}>
            The regression estimated market exposure at 0.75 for this index,
            weekly frequency, and historical period, with meaningful statistical error.
          </RiskChoice>
        </div>
        {answer && (
          <RiskFeedback correct={correct}>
            {correct
              ? "The estimate is conditional on the data and choices. The 0.22 standard error makes false precision especially inappropriate."
              : "The source reports a regression estimate and its error. It is neither exact nor a measure of total business risk."}
          </RiskFeedback>
        )}
      </RiskPanel>
    </div>
  );
}

const MYTHS = [
  {
    id: "meaning",
    statement: "A beta of 1.20 means 20% more market exposure than beta 1 for a diversified investor.",
    answer: "true",
  },
  {
    id: "total",
    statement: "A company can have substantial company-specific risk and still have a low beta.",
    answer: "true",
  },
  {
    id: "crisis",
    statement: "A market crisis must make every company's beta rise.",
    answer: "false",
  },
  {
    id: "quality",
    statement: "A lower beta proves that a company is a better investment.",
    answer: "false",
  },
] as const;

function BetaMythsScene({ onComplete }: EquityRiskSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (MYTHS.every((item) => next[item.id] === item.answer)) onComplete();
  };
  const allAnswered = Object.keys(answers).length === MYTHS.length;
  const correct = MYTHS.every((item) => answers[item.id] === item.answer);
  return (
    <div>
      <RiskPrompt>
        Mark each statement true or false. Every answer follows from the beta
        definition and estimation evidence already practiced.
      </RiskPrompt>
      <div className="mt-5 space-y-3">
        {MYTHS.map((item, index) => (
          <RiskPanel key={item.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="text-xs tabular-nums text-accent-amber">{index + 1}</span>
                <p className="font-semibold leading-6 text-white">{item.statement}</p>
              </div>
              <div className="grid w-full flex-shrink-0 grid-cols-2 gap-2 sm:w-52">
                {[
                  ["true", "True"],
                  ["false", "False"],
                ].map(([value, label]) => (
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
            </div>
          </RiskPanel>
        ))}
      </div>
      {allAnswered && (
        <RiskFeedback correct={correct}>
          {correct
            ? "Beta is a noisy estimate of relative market exposure. A crisis can increase total volatility without forcing every beta upward."
            : "Recheck whether each statement describes market exposure, total risk, estimation precision, or investment quality."}
        </RiskFeedback>
      )}
    </div>
  );
}
