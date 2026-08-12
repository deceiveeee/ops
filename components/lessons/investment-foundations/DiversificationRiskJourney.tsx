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

const LESSON_SLUG = "if-3-2-why-diversification-changes-the-question";

const STEPS = [
  {
    label: "Outcomes",
    title: "Map return uncertainty",
    guide:
      "Expected return summarizes possible outcomes; variance describes how widely those possible returns spread around the expectation.",
    instruction: "Inspect every possible return and reveal the expected return.",
    next: "Build the portfolio",
  },
  {
    label: "Portfolio",
    title: "Combine different businesses",
    guide:
      "A portfolio is a collection of investments. Diversification spreads exposure across investments whose outcomes do not move exactly together.",
    instruction: "Add all four businesses to the scholarship fund.",
    next: "Trigger the shocks",
  },
  {
    label: "Shocks",
    title: "Separate company risk from market risk",
    guide:
      "A company-specific shock can be diluted across other holdings. A market-wide shock reaches many holdings at the same time.",
    instruction: "Trigger both shocks and compare the portfolio result.",
    next: "Meet the marginal investor",
  },
  {
    label: "Price setter",
    title: "Identify the price-setting investor",
    guide:
      "The marginal investor is the investor whose trade sets the current price. Theory-based models assume this investor is diversified.",
    instruction: "Select the trade that sets the current market price.",
    next: "Diagnose the risk",
  },
  {
    label: "Diagnose",
    title: "Classify risk from portfolio evidence",
    guide:
      "Use the event and portfolio response together. The label follows from what caused the move and whether diversification softened it.",
    instruction: "Correctly classify all three events.",
    next: "Enter Lesson 3.3",
  },
] as const;

export default function DiversificationRiskJourney() {
  return (
    <EquityRiskJourneyShell
      lessonSlug={LESSON_SLUG}
      ariaLabel="Guided Lesson 3.2 diversification journey"
      steps={STEPS}
      renderStep={(step, onComplete) => {
        if (step === 0) return <OutcomeSpreadScene onComplete={onComplete} />;
        if (step === 1) return <PortfolioBuildScene onComplete={onComplete} />;
        if (step === 2) return <ShockLabScene onComplete={onComplete} />;
        if (step === 3) return <MarginalInvestorScene onComplete={onComplete} />;
        return <RiskDiagnosisScene onComplete={onComplete} />;
      }}
      nextLesson={{
        href: "/lessons/if-3-3-what-beta-measures",
        label: "Continue to Lesson 3.3",
      }}
    />
  );
}

const OUTCOME_NODES = [
  { id: "weak", label: "Weak economy", probability: "25%", value: "−10%", x: "10%" },
  { id: "normal", label: "Normal economy", probability: "50%", value: "+8%", x: "58%" },
  { id: "strong", label: "Strong economy", probability: "25%", value: "+18%", x: "88%" },
] as const;

function OutcomeSpreadScene({ onComplete }: EquityRiskSceneProps) {
  const [seen, setSeen] = useState<string[]>([]);
  const inspect = (id: string) => {
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    if (next.length === OUTCOME_NODES.length) onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-cyan/20 bg-accent-cyan/[0.035]">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <div className="font-semibold text-white">Possible return</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              A return that could occur under one future scenario.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Expected return</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              The probability-weighted average of the possible returns.
            </p>
          </div>
          <div>
            <div className="font-semibold text-white">Variance</div>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              A measure of how widely possible returns spread around the expectation.
            </p>
          </div>
        </div>
      </RiskPanel>
      <RiskPrompt>
        Inspect all three equally defined OPS scenarios. The probability-weighted
        expected return is 6%, but the actual one-year result can differ.
      </RiskPrompt>
      <RiskPanel className="mt-5 relative overflow-hidden py-8">
        <div className="absolute left-6 right-6 top-1/2 h-px bg-white/15" />
        <div className="relative grid gap-3 sm:grid-cols-3">
          {OUTCOME_NODES.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => inspect(node.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                seen.includes(node.id)
                  ? "border-accent-green/40 bg-accent-green/[0.06]"
                  : "border-white/10 bg-white/[0.03] hover:border-accent-cyan/40",
              )}
            >
              <div className="text-xs text-slate-500">{node.probability} probability</div>
              <div className="mt-1 text-sm font-semibold text-white">{node.label}</div>
              <div className="mt-3 text-3xl font-semibold tabular-nums text-accent-cyan">
                {node.value}
              </div>
            </button>
          ))}
        </div>
        {seen.length === OUTCOME_NODES.length && (
          <RiskFeedback correct>
            25% × −10% + 50% × 8% + 25% × 18% = 6%. Variance is
            created by the spread around 6%, not by 6% alone.
          </RiskFeedback>
        )}
      </RiskPanel>
    </div>
  );
}

const COMPANIES = [
  ["northstar", "Northstar Transit", "Transport"],
  ["harbor", "Harbor Grocery", "Consumer staples"],
  ["orbit", "Orbit Software", "Technology"],
  ["clearwater", "Clearwater Utility", "Utilities"],
] as const;

function PortfolioBuildScene({ onComplete }: EquityRiskSceneProps) {
  const [holdings, setHoldings] = useState<string[]>([]);
  const add = (id: string) => {
    if (holdings.includes(id)) return;
    const next = [...holdings, id];
    setHoldings(next);
    if (next.length === COMPANIES.length) onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          Diversification combines investments whose outcomes do not move
          exactly together, reducing the portfolio’s dependence on any one company.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Build an equal-weight portfolio by adding one business from each operating area.
      </RiskPrompt>
      <RiskPanel className="mt-5 relative overflow-hidden">
        <svg
          viewBox="0 0 520 190"
          className="h-auto w-full"
          aria-label={`${holdings.length} of 4 companies connected to the scholarship fund`}
        >
          <circle cx="260" cy="95" r="42" fill="rgba(251,191,36,.10)" stroke="rgba(251,191,36,.55)" />
          <text x="260" y="91" textAnchor="middle" fill="#f8fafc" fontSize="13" fontWeight="700">Scholarship</text>
          <text x="260" y="110" textAnchor="middle" fill="#fbbf24" fontSize="12">fund</text>
          {COMPANIES.map(([id], index) => {
            const positions = [[70,50],[450,50],[70,150],[450,150]];
            const [x, y] = positions[index];
            const added = holdings.includes(id);
            return (
              <g key={id}>
                <line x1="260" y1="95" x2={x} y2={y} stroke={added ? "#22d3ee" : "rgba(255,255,255,.12)"} strokeWidth={added ? 2 : 1} />
                <circle cx={x} cy={y} r="18" fill={added ? "rgba(34,211,238,.14)" : "rgba(255,255,255,.04)"} stroke={added ? "#22d3ee" : "rgba(255,255,255,.18)"} />
              </g>
            );
          })}
        </svg>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {COMPANIES.map(([id, name, sector]) => (
            <button
              key={id}
              type="button"
              onClick={() => add(id)}
              disabled={holdings.includes(id)}
              className={cn(
                "rounded-xl border p-3 text-left",
                holdings.includes(id)
                  ? "border-accent-green/35 bg-accent-green/[0.06]"
                  : "border-white/10 bg-white/[0.025] hover:border-accent-cyan/40",
              )}
            >
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="mt-1 text-xs text-slate-500">{sector}</div>
              <div className="mt-2 text-xs text-accent-green">
                {holdings.includes(id) ? "✓ added" : "+ add holding"}
              </div>
            </button>
          ))}
        </div>
      </RiskPanel>
    </div>
  );
}

function ShockLabScene({ onComplete }: EquityRiskSceneProps) {
  const [active, setActive] = useState<"company" | "market" | "">("");
  const [tested, setTested] = useState<string[]>([]);
  const test = (shock: "company" | "market") => {
    setActive(shock);
    if (tested.includes(shock)) return;
    const next = [...tested, shock];
    setTested(next);
    if (next.length === 2) onComplete();
  };
  return (
    <div>
      <RiskPrompt>
        Apply both shocks to the same equal-weight portfolio. Compare the company
        move with the total portfolio move.
      </RiskPrompt>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => test("company")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm",
            active === "company"
              ? "border-accent-red/50 bg-accent-red/10 text-accent-red"
              : "border-white/15 text-slate-300",
          )}
        >
          Northstar-only disruption
        </button>
        <button
          type="button"
          onClick={() => test("market")}
          className={cn(
            "rounded-full border px-4 py-2 text-sm",
            active === "market"
              ? "border-accent-red/50 bg-accent-red/10 text-accent-red"
              : "border-white/15 text-slate-300",
          )}
        >
          Economy-wide recession
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        {COMPANIES.map(([id, name]) => {
          const hit = active === "market" || (active === "company" && id === "northstar");
          return (
            <div
              key={id}
              className={cn(
                "rounded-xl border p-4 text-center transition-colors",
                hit
                  ? "border-accent-red/35 bg-accent-red/[0.06]"
                  : "border-accent-green/25 bg-accent-green/[0.04]",
              )}
            >
              <div className={cn("mx-auto h-5 w-5 rounded-full", hit ? "bg-accent-red" : "bg-accent-green")} />
              <div className="mt-3 text-xs text-slate-300">{name}</div>
              <div className={cn("mt-1 text-xl font-semibold tabular-nums", hit ? "text-accent-red" : "text-accent-green")}>
                {active ? (hit ? (active === "market" ? "−9%" : "−20%") : "+1%") : "—"}
              </div>
            </div>
          );
        })}
      </div>
      {active && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <RiskMetric label="Northstar move" value={active === "company" ? "−20%" : "−9%"} tone="red" />
          <RiskMetric label="Portfolio move" value={active === "company" ? "−4.3%" : "−8.5%"} tone={active === "company" ? "amber" : "red"} />
        </div>
      )}
      {active && (
        <RiskFeedback correct>
          {active === "company"
            ? "One holding absorbs the disruption while the other businesses remain stable. Diversification dilutes this company-specific shock."
            : "All four holdings react to the shared economic event. Diversification provides much less protection from market risk."}
        </RiskFeedback>
      )}
    </div>
  );
}

function MarginalInvestorScene({ onComplete }: EquityRiskSceneProps) {
  const [answer, setAnswer] = useState("");
  const correct = answer === "fund";
  const choose = (value: string) => {
    setAnswer(value);
    if (value === "fund") onComplete();
  };
  return (
    <div>
      <RiskPanel className="border-accent-amber/25 bg-accent-amber/[0.04]">
        <div className="ops-caption text-[12px] text-accent-amber">Direct definition</div>
        <p className="ops-definition mt-2 text-[17px] leading-7 text-white">
          The marginal investor is the investor whose trade sets the current
          market price. CAPM assumes that price-setting investor is diversified.
        </p>
      </RiskPanel>
      <RiskPrompt>
        Northstar’s last trade at $42 becomes the quoted market price. Which
        investor is marginal in this moment?
      </RiskPrompt>
      <RiskPanel className="mt-5">
        <div className="space-y-2">
          <RiskChoice selected={answer === "founder"} incorrect={answer === "founder"} onClick={() => choose("founder")}>
            The founder who has held one concentrated block for twelve years and did not trade today.
          </RiskChoice>
          <RiskChoice selected={answer === "student"} incorrect={answer === "student"} onClick={() => choose("student")}>
            A student who placed a $39 limit order that did not execute.
          </RiskChoice>
          <RiskChoice selected={answer === "fund"} correct={correct} onClick={() => choose("fund")}>
            The diversified fund whose buy order executed against a seller at $42.
          </RiskChoice>
        </div>
        {answer && (
          <RiskFeedback correct={correct}>
            {correct
              ? "The executed $42 trade sets the current price. Theory uses that diversified price setter's perspective."
              : "Ownership alone does not set today's price. Look for the investor whose order actually executed at $42."}
          </RiskFeedback>
        )}
      </RiskPanel>
    </div>
  );
}

const DIAGNOSES = [
  {
    id: "plant",
    prompt: "A fire closes only Northstar's Phoenix depot; the other holdings are unchanged.",
    answer: "company",
  },
  {
    id: "recession",
    prompt: "A recession lowers demand and prices across all four holdings.",
    answer: "market",
  },
  {
    id: "approval",
    prompt: "A regulator rejects one drug owned by a single biotech company.",
    answer: "company",
  },
] as const;

function RiskDiagnosisScene({ onComplete }: EquityRiskSceneProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const choose = (id: string, value: string) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (DIAGNOSES.every((item) => next[item.id] === item.answer)) onComplete();
  };
  const allAnswered = Object.keys(answers).length === DIAGNOSES.length;
  const correct = DIAGNOSES.every((item) => answers[item.id] === item.answer);
  return (
    <div>
      <RiskPrompt>
        Classify each event by its source and likely portfolio reach.
      </RiskPrompt>
      <div className="mt-5 space-y-4">
        {DIAGNOSES.map((item, index) => (
          <RiskPanel key={item.id}>
            <div className="text-xs text-slate-500">Event {index + 1}</div>
            <p className="mt-2 font-semibold leading-6 text-white">{item.prompt}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ["company", "Company-specific risk"],
                ["market", "Market risk"],
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
          </RiskPanel>
        ))}
      </div>
      {allAnswered && (
        <RiskFeedback correct={correct}>
          {correct
            ? "Company-specific shocks can be diversified; market risk remains shared across many holdings. Beta begins with that surviving market exposure."
            : "Check whether the cause belongs to one company or reaches many companies through a shared market force."}
        </RiskFeedback>
      )}
    </div>
  );
}
