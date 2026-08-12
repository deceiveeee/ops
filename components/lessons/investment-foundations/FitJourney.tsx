"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIFProgress, type PhilosophyDraft } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-1-4-when-a-philosophy-fits-the-investor";

const STEPS = [
  {
    label: "Define",
    title: "Match demands with capacity",
    guide:
      "Investor–philosophy fit compares what a philosophy requires with what the investor can reliably supply. Begin with one value opportunity and two investors.",
    instruction: "Study the worked example, then identify the binding constraint.",
    next: "Separate the three fit questions",
  },
  {
    label: "Separate",
    title: "Demand, capacity, or preference?",
    guide:
      "A fit decision becomes clearer when strategy demands, financial capacity, and personal preference are evaluated separately.",
    instruction: "Classify all three facts in the fit audit.",
    next: "Compare two investors",
  },
  {
    label: "Compare",
    title: "One belief, two implementations",
    guide:
      "Two investors can agree about the same price gap while choosing different position sizes, holding periods, and portfolio actions.",
    instruction: "Build the implementation that follows from each investor profile.",
    next: "Audit family demands",
  },
  {
    label: "Audit",
    title: "Find the capacity shortfall",
    guide:
      "Each philosophy places a different operational demand on the investor. Find the first capacity shortfall that prevents faithful execution.",
    instruction: "Diagnose the binding constraint in four philosophy cases.",
    next: "Rehearse difficult moments",
  },
  {
    label: "Rehearse",
    title: "Follow the rule under pressure",
    guide:
      "Behavioral fit appears when prices fall, evidence changes, or cash needs arrive. Use a review rule that connects evidence to action.",
    instruction: "Choose the disciplined response in all three stress events.",
    next: "Build the fit charter",
  },
  {
    label: "Charter",
    title: "Record your implementation conditions",
    guide:
      "Select one research candidate and record the horizon, liquidity, research, loss-response, and account conditions that require verification.",
    instruction: "Complete and save the provisional investor-fit charter.",
    next: "Return to the course",
  },
] as const;

type SceneProps = { onComplete: () => void };

export default function FitJourney() {
  const reduceMotion = useReducedMotion();
  const journeyRef = useRef<HTMLElement>(null);
  const { draft, saveDraft, markComplete } = useIFProgress();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() =>
    STEPS.map(() => false),
  );

  const completeStep = useCallback(
    (index: number) => {
      setCompleted((current) =>
        current.map((done, itemIndex) =>
          itemIndex === index ? true : done,
        ),
      );
      if (index === STEPS.length - 1) markComplete(LESSON_SLUG);
    },
    [markComplete],
  );

  const moveTo = (nextStep: number) => {
    setActiveStep(nextStep);
    window.requestAnimationFrame(() => {
      journeyRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  };

  const current = STEPS[activeStep];
  const currentComplete = completed[activeStep];

  return (
    <section
      id="lesson-journey"
      ref={journeyRef}
      className="scroll-mt-24"
      aria-label="Guided Lesson 1.4 journey"
    >
      <div className="ops-interactive-frame overflow-hidden p-0">
        <JourneyHeader
          activeStep={activeStep}
          completed={completed}
          onSelect={moveTo}
        />

        <div className="border-b border-white/10 px-5 py-5 sm:px-7">
          <GuideMessage step={activeStep} done={currentComplete} />
        </div>

        <div className="px-5 py-6 sm:px-7 sm:py-8">
          {/* No mode="wait"/exit: under reactStrictMode the exit never fires,
              which pins the journey on its first scene. */}
          <AnimatePresence initial={false}>
            <motion.div
              key={activeStep}
              initial={reduceMotion ? false : { opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.24 }}
            >
              <div className="ops-caption text-[12px] text-accent-amber">
                Step {activeStep + 1} of {STEPS.length} · {current.label}
              </div>
              <h2 className="ops-section-title mt-2 text-2xl sm:text-3xl">
                {current.title}
              </h2>

              <div className="mt-6">
                {activeStep === 0 && (
                  <FitDefinitionScene onComplete={() => completeStep(0)} />
                )}
                {activeStep === 1 && (
                  <FitTermsScene onComplete={() => completeStep(1)} />
                )}
                {activeStep === 2 && (
                  <TwoInvestorScene onComplete={() => completeStep(2)} />
                )}
                {activeStep === 3 && (
                  <DemandAuditScene onComplete={() => completeStep(3)} />
                )}
                {activeStep === 4 && (
                  <StressRehearsalScene onComplete={() => completeStep(4)} />
                )}
                {activeStep === 5 && (
                  <FitCharterScene
                    draft={draft}
                    saveDraft={saveDraft}
                    onComplete={() => completeStep(5)}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4 sm:px-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => moveTo(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="order-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-white/30 disabled:cursor-default disabled:opacity-0 sm:order-1"
            >
              ← Previous step
            </button>

            <div className="order-1 text-center sm:order-2 sm:max-w-xs">
              <div
                className={cn(
                  "ops-body-strong text-[14px]",
                  currentComplete ? "text-accent-green" : "text-slate-400",
                )}
              >
                {currentComplete
                  ? "Step complete. Continue when you are ready."
                  : current.instruction}
              </div>
            </div>

            {activeStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => moveTo(activeStep + 1)}
                disabled={!currentComplete}
                className="order-3 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-transparent disabled:text-slate-500"
              >
                Continue: {current.next} →
              </button>
            ) : currentComplete ? (
              <Link
                href="/courses/investment-foundations"
                className="order-3 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-center text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20"
              >
                Return to Investment Foundations →
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="order-3 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-500"
              >
                Save the fit charter to finish
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function JourneyHeader({
  activeStep,
  completed,
  onSelect,
}: {
  activeStep: number;
  completed: boolean[];
  onSelect: (index: number) => void;
}) {
  const count = completed.filter(Boolean).length;
  const progress = Math.round((count / STEPS.length) * 100);

  return (
    <div className="border-b border-white/10 bg-white/[0.025] px-5 py-5 sm:px-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="ops-caption text-[12px] text-slate-500">
            Guided lesson path
          </div>
          <div className="ops-body-strong mt-1 text-[15px] text-white">
            {count} of {STEPS.length} decisions complete
          </div>
        </div>
        <div className="text-[14px] font-semibold tabular-nums text-accent-amber">
          {progress}%
        </div>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-accent-amber transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <nav className="mt-4 grid grid-cols-6 gap-1.5" aria-label="Lesson steps">
        {STEPS.map((step, index) => {
          const unlocked =
            index === 0 || index <= activeStep || completed[index - 1];
          return (
            <button
              key={step.label}
              type="button"
              disabled={!unlocked}
              onClick={() => onSelect(index)}
              aria-label={`${step.label}${index === activeStep ? ", current" : ""}`}
              className="group min-w-0 text-left disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "block h-1 rounded-full transition-colors",
                  completed[index]
                    ? "bg-accent-green"
                    : index === activeStep
                      ? "bg-accent-amber"
                      : unlocked
                        ? "bg-white/25"
                        : "bg-white/[0.07]",
                )}
              />
              <span
                className={cn(
                  "mt-1.5 hidden truncate text-[12px] sm:block",
                  index === activeStep
                    ? "text-accent-amber"
                    : unlocked
                      ? "text-slate-400"
                      : "text-slate-600",
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function GuideMessage({ step, done }: { step: number; done: boolean }) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border text-[15px]",
          done
            ? "border-accent-green/35 bg-accent-green/10 text-accent-green"
            : "border-accent-amber/35 bg-accent-amber/10 text-accent-amber",
        )}
      >
        {done ? "✓" : "⌘"}
      </div>
      <div>
        <div
          className={cn(
            "ops-caption text-[12px]",
            done ? "text-accent-green" : "text-accent-amber",
          )}
        >
          OPS Guide
        </div>
        <p className="ops-body mt-1 text-[15px] leading-6 text-slate-200">
          {done
            ? `You completed ${STEPS[step].label.toLowerCase()}. The next decision builds on this fit analysis.`
            : STEPS[step].guide}
        </p>
        <div className="ops-body mt-2 flex items-start gap-2 text-[14px] text-slate-400">
          <span className="text-accent-amber">→</span>
          <span>
            {done ? `Continue to ${STEPS[step].next}.` : STEPS[step].instruction}
          </span>
        </div>
      </div>
    </div>
  );
}

function FitDefinitionScene({ onComplete }: SceneProps) {
  const [choice, setChoice] = useState<string | null>(null);
  const correct = choice === "deadline";

  const choose = (id: string) => {
    setChoice(id);
    if (id === "deadline") onComplete();
  };

  return (
    <div>
      <DefinitionPanel
        label="Concept first"
        title="What is investor–philosophy fit?"
        definition="Investor–philosophy fit is the match between what a philosophy requires and what the investor can reliably supply. The comparison includes time, liquidity, loss capacity, behavior, research resources, market access, costs, and account context."
      />

      <div className="mt-5 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="ops-caption text-[12px] text-accent-cyan">
          Worked example · One value opportunity
        </div>
        <h3 className="ops-interactive-title mt-2 text-xl text-white sm:text-2xl">
          The same $40 share, two different capital deadlines
        </h3>
        <p className="ops-body mt-3 max-w-3xl text-[15px] leading-7 text-slate-200">
          Both investors estimate the recovered business at $60 per share. The
          value thesis may need three to five years, could experience a 35%
          temporary decline, and requires six hours of research each month.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <InvestorCard
            label="Investor A"
            accent="green"
            facts={[
              "Capital dedicated for seven years",
              "Emergency reserve held separately",
              "Eight research hours available each month",
              "Predefined valuation and position-risk review rule",
            ]}
          />
          <InvestorCard
            label="Investor B"
            accent="amber"
            facts={[
              "Tuition payment due in 18 months",
              "Investment account may fund that payment",
              "One research hour available each month",
              "Existing portfolio concentrated in similar companies",
            ]}
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 p-4">
          <div className="ops-caption text-[12px] text-accent-amber">
            How to read the example
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
            The value mechanism has a three-to-five-year clock. Investor B has
            an 18-month cash deadline. That deadline is a binding constraint:
            it can force the capital out before the proposed price correction
            has time to occur.
          </p>
        </div>
      </div>

      <QuestionBlock question="Which fact creates the clearest implementation mismatch for Investor B?">
        <ChoiceGrid>
          <ChoiceButton
            selected={choice === "deadline"}
            correct={correct}
            disabled={correct}
            onClick={() => choose("deadline")}
          >
            The tuition capital may be needed 18 months into a thesis that may require three to five years.
          </ChoiceButton>
          <ChoiceButton
            selected={choice === "agreement"}
            incorrect={choice === "agreement"}
            disabled={correct}
            onClick={() => choose("agreement")}
          >
            Investor B agrees that the recovered business may be worth $60.
          </ChoiceButton>
          <ChoiceButton
            selected={choice === "quote"}
            incorrect={choice === "quote"}
            disabled={correct}
            onClick={() => choose("quote")}
          >
            Both investors observe the same $40 market price.
          </ChoiceButton>
        </ChoiceGrid>
      </QuestionBlock>

      {choice && (
        <SceneFeedback correct={correct}>
          {correct
            ? "Correct. The cash deadline can interrupt the holding period before the value mechanism has time to produce evidence or a price response."
            : "That fact describes the shared investment idea. Compare the strategy's required time with the date when Investor B may need the capital."}
        </SceneFeedback>
      )}
    </div>
  );
}

const FIT_DIMENSIONS = [
  ["Horizon & liquidity", "When the capital may be needed and how quickly it must become cash."],
  ["Loss capacity", "The financial ability to absorb a decline without disrupting required spending or liabilities."],
  ["Loss preference", "The price variability and underperformance experience the investor is willing to carry."],
  ["Research resources", "The time, skill, data, and tools available to maintain the process."],
  ["Access & costs", "The trading, borrowing, diversification, turnover, and funding conditions required."],
  ["Account context", "The fees and tax effects that shape the return the investor retains."],
] as const;

const TERM_CASES = [
  {
    label: "Fact 1 of 3",
    prompt: "A momentum process requires daily signal updates and same-day execution.",
    answer: "demand",
    feedback: "This describes work and execution required by the philosophy.",
  },
  {
    label: "Fact 2 of 3",
    prompt: "The capital is assigned to a home purchase fourteen months from today.",
    answer: "capacity",
    feedback: "The cash deadline limits how long this investor can keep the capital exposed.",
  },
  {
    label: "Fact 3 of 3",
    prompt: "The investor chooses a smoother return experience even though the capital can remain invested for ten years.",
    answer: "preference",
    feedback: "The financial horizon is long; the stated choice describes the return experience the investor prefers.",
  },
] as const;

function FitTermsScene({ onComplete }: SceneProps) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = TERM_CASES[index];
  const correct = choice === current.answer;

  const choose = (id: string) => {
    setChoice(id);
    if (id === current.answer && index === TERM_CASES.length - 1) onComplete();
  };

  return (
    <div>
      <DefinitionPanel
        label="Three fit questions"
        title="Separate the requirement from the investor"
        definition="Strategy demand states what the philosophy requires. Investor capacity states what the investor's finances and resources can support. Investor preference states the experience the investor is willing to carry."
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FIT_DIMENSIONS.map(([title, body]) => (
          <DefinitionTile key={title} title={title} body={body} />
        ))}
      </div>

      <SequentialCard
        eyebrow={current.label}
        prompt={current.prompt}
        feedback={choice ? current.feedback : undefined}
        correct={correct}
      >
        <ChoiceGrid>
          {[
            ["demand", "Strategy demand"],
            ["capacity", "Investor capacity"],
            ["preference", "Investor preference"],
          ].map(([id, label]) => (
            <ChoiceButton
              key={id}
              selected={choice === id}
              correct={correct && choice === id}
              incorrect={Boolean(choice && choice === id && !correct)}
              disabled={correct}
              onClick={() => choose(id)}
            >
              {label}
            </ChoiceButton>
          ))}
        </ChoiceGrid>

        {correct && index < TERM_CASES.length - 1 && (
          <NextCaseButton
            onClick={() => {
              setIndex((currentIndex) => currentIndex + 1);
              setChoice(null);
            }}
          >
            Classify the next fact →
          </NextCaseButton>
        )}
      </SequentialCard>
    </div>
  );
}

const IMPLEMENTATION_CASES = [
  {
    label: "Decision 1 of 4 · Holding period",
    prompt: "Who can supply capital for the full three-to-five-year correction window?",
    answer: "a",
    options: [
      ["a", "Investor A, whose capital is dedicated for seven years."],
      ["b", "Investor B, whose tuition payment is due in 18 months."],
      ["same", "Both investors have the same effective horizon."],
    ],
    feedback: "Investor A's seven-year capital window covers the proposed correction period.",
  },
  {
    label: "Decision 2 of 4 · Liquidity",
    prompt: "Which implementation protects Investor B's tuition obligation?",
    answer: "reserve",
    options: [
      ["reserve", "Keep tuition capital available and evaluate the value strategy only with capital beyond that obligation."],
      ["all", "Invest the tuition capital because both investors share the same valuation estimate."],
      ["extend", "Treat the 18-month payment date as a flexible five-year horizon."],
    ],
    feedback: "The cash obligation defines which capital can remain exposed to a multi-year mechanism.",
  },
  {
    label: "Decision 3 of 4 · Position risk",
    prompt: "How should the two profiles affect position construction?",
    answer: "different",
    options: [
      ["different", "Use each investor's loss capacity, liquidity, and existing concentration to set a different exposure."],
      ["equal", "Use equal position sizes because the market belief is equal."],
      ["price", "Use the $40 share price as the position-size rule."],
    ],
    feedback: "A belief supports research; the investor profile determines how much capital can responsibly carry the implementation.",
  },
  {
    label: "Decision 4 of 4 · Portfolio action",
    prompt: "What does the shared value belief imply for these two investors?",
    answer: "portfolios",
    options: [
      ["portfolios", "The shared belief can lead to different position sizes, holding periods, or a decision to leave some capital uncommitted."],
      ["identical", "The shared belief requires identical portfolios."],
      ["deadline", "The shared belief removes Investor B's tuition deadline."],
    ],
    feedback: "Implementation translates one market belief through each investor's actual constraints.",
  },
] as const;

function TwoInvestorScene({ onComplete }: SceneProps) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = IMPLEMENTATION_CASES[index];
  const correct = choice === current.answer;

  const choose = (id: string) => {
    setChoice(id);
    if (id === current.answer && index === IMPLEMENTATION_CASES.length - 1)
      onComplete();
  };

  return (
    <div>
      <DefinitionPanel
        label="Implementation"
        title="A belief becomes a portfolio through investor constraints"
        definition="Implementation converts a market belief into position size, diversification, expected holding period, turnover, and capital-allocation rules. Each rule must fit the investor who will carry it."
      />

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InvestorCard
          label="Investor A · Seven-year capital"
          accent="green"
          facts={[
            "Stable income and separate emergency reserve",
            "Diversified existing portfolio",
            "Moderate financial capacity for temporary losses",
            "Eight research hours each month",
          ]}
        />
        <InvestorCard
          label="Investor B · 18-month tuition capital"
          accent="amber"
          facts={[
            "Large known cash payment approaching",
            "Concentrated existing portfolio",
            "Limited financial capacity for a prolonged decline",
            "One research hour each month",
          ]}
        />
      </div>

      <SequentialCard
        eyebrow={current.label}
        prompt={current.prompt}
        feedback={choice ? current.feedback : undefined}
        correct={correct}
      >
        <ChoiceGrid>
          {current.options.map(([id, label]) => (
            <ChoiceButton
              key={id}
              selected={choice === id}
              correct={correct && choice === id}
              incorrect={Boolean(choice && choice === id && !correct)}
              disabled={correct}
              onClick={() => choose(id)}
            >
              {label}
            </ChoiceButton>
          ))}
        </ChoiceGrid>
        {correct && index < IMPLEMENTATION_CASES.length - 1 && (
          <NextCaseButton
            onClick={() => {
              setIndex((currentIndex) => currentIndex + 1);
              setChoice(null);
            }}
          >
            Build the next rule →
          </NextCaseButton>
        )}
      </SequentialCard>
    </div>
  );
}

const DEMAND_CASES = [
  {
    family: "Value investing",
    mechanism: "A price gap may take four years to close and can deepen before evidence improves.",
    profile: "The investor needs most of the capital for a down payment in twelve months.",
    answer: "horizon",
    options: [
      ["horizon", "Horizon and liquidity"],
      ["tools", "Charting software"],
      ["tax", "Dividend tax treatment"],
    ],
    feedback: "The cash deadline arrives years before the proposed correction window.",
  },
  {
    family: "Momentum & technical",
    mechanism: "The process updates signals daily and trades when trend and risk rules change.",
    profile: "The investor checks the portfolio once each month and has no automated process.",
    answer: "operations",
    options: [
      ["operations", "Research time and execution system"],
      ["wealth", "Total lifetime wealth"],
      ["belief", "Belief that trends can persist"],
    ],
    feedback: "The signal can change between reviews, so the process cannot be executed as designed.",
  },
  {
    family: "Information-based investing",
    mechanism: "The edge requires ten hours of weekly filing and industry research using lawful public information.",
    profile: "The investor has one research hour each week and limited accounting experience.",
    answer: "research",
    options: [
      ["research", "Research time and analytical skill"],
      ["horizon", "Calendar age"],
      ["quote", "Access to a delayed price quote"],
    ],
    feedback: "The proposed information edge depends on research capacity the profile cannot currently supply.",
  },
  {
    family: "Relative-value arbitrage",
    mechanism: "The trade requires short borrow, stable funding, and the ability to survive a widening price difference.",
    profile: "The account has no borrowing access and must remain fully liquid.",
    answer: "access",
    options: [
      ["access", "Market access, funding, and liquidity"],
      ["preference", "Preference for financial news"],
      ["valuation", "A long-term earnings-growth forecast"],
    ],
    feedback: "Borrow and funding access are required parts of this mechanism.",
  },
] as const;

function DemandAuditScene({ onComplete }: SceneProps) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = DEMAND_CASES[index];
  const correct = choice === current.answer;

  const choose = (id: string) => {
    setChoice(id);
    if (id === current.answer && index === DEMAND_CASES.length - 1)
      onComplete();
  };

  return (
    <div>
      <DefinitionPanel
        label="Constraint diagnosis"
        title="What is a binding constraint?"
        definition="A binding constraint is the first capacity shortfall that prevents a philosophy from being executed as designed. The audit compares a specific strategy demand with a specific investor resource."
      />

      <SequentialCard
        eyebrow={`Audit ${index + 1} of ${DEMAND_CASES.length} · ${current.family}`}
        prompt="Which fit dimension is the binding constraint?"
        feedback={choice ? current.feedback : undefined}
        correct={correct}
      >
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <FactCard label="Philosophy demand" value={current.mechanism} />
          <FactCard label="Investor profile" value={current.profile} />
        </div>
        <ChoiceGrid>
          {current.options.map(([id, label]) => (
            <ChoiceButton
              key={id}
              selected={choice === id}
              correct={correct && choice === id}
              incorrect={Boolean(choice && choice === id && !correct)}
              disabled={correct}
              onClick={() => choose(id)}
            >
              {label}
            </ChoiceButton>
          ))}
        </ChoiceGrid>
        {correct && index < DEMAND_CASES.length - 1 && (
          <NextCaseButton
            onClick={() => {
              setIndex((currentIndex) => currentIndex + 1);
              setChoice(null);
            }}
          >
            Audit the next family →
          </NextCaseButton>
        )}
      </SequentialCard>
    </div>
  );
}

const STRESS_CASES = [
  {
    label: "Stress event 1 of 3 · Price decline",
    prompt: "The position falls 25%. New operating evidence remains consistent with the valuation thesis, and the position remains within its risk limit.",
    answer: "review",
    options: [
      ["review", "Review the thesis evidence, valuation range, and position risk at the scheduled checkpoint, then follow the predefined rule."],
      ["sell", "Sell solely because the market price fell 25%."],
      ["double", "Double the position solely because the market price is lower."],
    ],
    feedback: "The review rule checks evidence and risk before translating the price move into an action.",
  },
  {
    label: "Stress event 2 of 3 · Thesis evidence",
    prompt: "A major customer leaves permanently. Updated cash flows remove the estimated value gap that supported the position.",
    answer: "update",
    options: [
      ["update", "Update the value estimate and resize or exit according to the thesis-invalidation rule."],
      ["wait", "Keep the original estimate unchanged until the market price recovers."],
      ["headline", "Base the decision on the emotional tone of the latest headline."],
    ],
    feedback: "The original mechanism depended on recovered cash flows, so permanent cash-flow evidence changes the thesis.",
  },
  {
    label: "Stress event 3 of 3 · Cash need",
    prompt: "The thesis remains plausible, but a required tuition payment is now due within twelve months.",
    answer: "liquidity",
    options: [
      ["liquidity", "Restore the required liquidity by reducing exposure according to the cash-needs rule."],
      ["ignore", "Keep all capital exposed because the thesis remains plausible."],
      ["extend", "Move the tuition deadline to match the strategy horizon."],
    ],
    feedback: "A required cash payment changes capacity even when the market belief remains plausible.",
  },
] as const;

function StressRehearsalScene({ onComplete }: SceneProps) {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = STRESS_CASES[index];
  const correct = choice === current.answer;

  const choose = (id: string) => {
    setChoice(id);
    if (id === current.answer && index === STRESS_CASES.length - 1)
      onComplete();
  };

  return (
    <div>
      <DefinitionPanel
        label="Process under pressure"
        title="What is a review rule?"
        definition="A review rule states which evidence triggers reassessment and what action follows. Behavioral fit is the investor's demonstrated ability to use that rule during losses, prolonged underperformance, and changing cash needs."
      />

      <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.04] p-4">
        <div className="ops-caption text-[12px] text-accent-amber">
          Model rule
        </div>
        <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
          At scheduled checkpoints, review thesis evidence, valuation, position
          risk, costs, and investor constraints. Resize or exit when a
          predefined invalidation or capacity condition is reached.
        </p>
      </div>

      <SequentialCard
        eyebrow={current.label}
        prompt={current.prompt}
        feedback={choice ? current.feedback : undefined}
        correct={correct}
      >
        <ChoiceGrid>
          {current.options.map(([id, label]) => (
            <ChoiceButton
              key={id}
              selected={choice === id}
              correct={correct && choice === id}
              incorrect={Boolean(choice && choice === id && !correct)}
              disabled={correct}
              onClick={() => choose(id)}
            >
              {label}
            </ChoiceButton>
          ))}
        </ChoiceGrid>
        {correct && index < STRESS_CASES.length - 1 && (
          <NextCaseButton
            onClick={() => {
              setIndex((currentIndex) => currentIndex + 1);
              setChoice(null);
            }}
          >
            Rehearse the next event →
          </NextCaseButton>
        )}
      </SequentialCard>
    </div>
  );
}

const FAMILY_DEMANDS: Record<string, string> = {
  "Market timing":
    "macro and valuation research, explicit allocation signals, and patience when markets move against the signal",
  "Value investing":
    "multi-year capital, valuation skill, drawdown capacity, and ongoing fundamental review",
  "Growth investing":
    "expectation modeling, long-duration research, and discipline around the price paid for growth",
  "Momentum & technical":
    "reliable data, repeatable signal testing, timely execution, and capacity for turnover and trading costs",
  "Information-based":
    "lawful public-information research, differentiated analysis, and timely execution",
  "Relative-value arbitrage":
    "borrow and funding access, basis-risk controls, liquidity, and capacity to wait for convergence",
  "Passive baseline while evidence is incomplete":
    "broad low-cost access, diversification, and a disciplined rebalancing process",
};

const HORIZON_OPTIONS = [
  "Under two years",
  "Two to five years",
  "More than five years",
] as const;

const LIQUIDITY_OPTIONS = [
  "Most of this capital may be needed within twelve months",
  "Part of this capital may be needed during the strategy horizon",
  "Near-term cash needs are funded separately from this capital",
] as const;

const RESEARCH_OPTIONS = [
  "Less than one hour per week",
  "One to five hours per week",
  "More than five hours per week with appropriate tools",
] as const;

const LOSS_RESPONSE_OPTIONS = [
  "A large decline would threaten a required financial goal",
  "I can carry a controlled allocation through a decline while following a review rule",
  "My response is untested, so simulation or a smaller research allocation comes first",
] as const;

const REVIEW_RULE =
  "At scheduled checkpoints, reassess thesis evidence, valuation, position risk, costs, and investor constraints; act when a predefined condition is reached.";

const ACCOUNT_RULE =
  "Estimate fees, turnover, financing, and applicable tax effects before judging the implementation's retained return.";

function FitCharterScene({
  draft,
  saveDraft,
  onComplete,
}: {
  draft: PhilosophyDraft;
  saveDraft: (next: PhilosophyDraft) => void;
  onComplete: () => void;
}) {
  const familyOptions = useMemo(
    () =>
      draft.candidateFamilies.length > 0
        ? draft.candidateFamilies
        : ["Value investing", "Momentum & technical"],
    [draft.candidateFamilies],
  );
  const [family, setFamily] = useState("");
  const [horizon, setHorizon] = useState("");
  const [liquidity, setLiquidity] = useState("");
  const [research, setResearch] = useState("");
  const [lossResponse, setLossResponse] = useState("");
  const [reviewChoice, setReviewChoice] = useState<string | null>(null);
  const [accountChoice, setAccountChoice] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFamily(draft.fitFamily);
    setHorizon(draft.constraints.horizon);
    setLiquidity(draft.constraints.liquidityNeeds);
    setResearch(draft.constraints.researchTime);
    setLossResponse(draft.constraints.riskPreference);
    if (draft.fitReviewRule === REVIEW_RULE) setReviewChoice("evidence");
    if (draft.constraints.taxConsiderations === ACCOUNT_RULE)
      setAccountChoice("retained");
    setLoaded(true);
  }, [draft]);

  const reviewCorrect = reviewChoice === "evidence";
  const accountCorrect = accountChoice === "retained";
  const complete = Boolean(
    family &&
      horizon &&
      liquidity &&
      research &&
      lossResponse &&
      reviewCorrect &&
      accountCorrect,
  );

  const demand = FAMILY_DEMANDS[family] ?? "a documented implementation process";
  const capacitySummary = family
    ? `${horizon}; ${liquidity}; ${research}; ${lossResponse}.`
    : "Select a family and record the capacity conditions.";
  const openQuestion = family
    ? `Can ${family} be executed with ${demand} inside the recorded horizon, liquidity, research, and loss-response conditions?`
    : "Select a family to generate the implementation question.";

  const save = () => {
    if (!ready || !complete) return;
    saveDraft({
      ...draft,
      constraints: {
        ...draft.constraints,
        riskPreference: lossResponse,
        horizon,
        cashNeeds: liquidity,
        taxConsiderations: ACCOUNT_RULE,
        capital: liquidity,
        researchTime: research,
        patience: horizon,
        analyticalTools: demand,
        liquidityNeeds: liquidity,
        underperformanceTolerance: REVIEW_RULE,
      },
      fitFamily: family,
      fitCapacitySummary: capacitySummary,
      fitReviewRule: REVIEW_RULE,
      fitOpenQuestion: openQuestion,
    });
    setSaved(true);
    onComplete();
  };

  if (!loaded) return null;

  return (
    <div>
      <DefinitionPanel
        label="Final artifact"
        title="What is a fit charter?"
        definition="A fit charter records the conditions an investor must verify before implementing a philosophy. It names the candidate, available capacity, review rule, cost and account rule, and the remaining implementation question."
      />

      {draft.candidateFamilies.length === 0 && (
        <p className="ops-body mt-4 rounded-xl border border-accent-amber/20 bg-accent-amber/[0.04] p-4 text-[14px] text-slate-300">
          Sample candidates are shown until a Lesson 1.3 research shortlist is
          saved in this browser.
        </p>
      )}

      <ChoiceSection question="Which research candidate will you audit?">
        <ChoiceGrid>
          {familyOptions.map((item) => (
            <ToggleButton
              key={item}
              selected={family === item}
              disabled={saved}
              onClick={() => {
                setFamily(item);
                setReady(false);
              }}
            >
              {item}
            </ToggleButton>
          ))}
        </ChoiceGrid>
      </ChoiceSection>

      {family && (
        <div className="mt-4 rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-4">
          <div className="ops-caption text-[12px] text-accent-cyan">
            Philosophy demand to verify
          </div>
          <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
            {family} requires {demand}.
          </p>
        </div>
      )}

      {family && (
        <ChoiceSection question="How long can this strategy capital remain invested?">
          <ChoiceGrid>
            {HORIZON_OPTIONS.map((item) => (
              <ToggleButton
                key={item}
                selected={horizon === item}
                disabled={saved}
                onClick={() => {
                  setHorizon(item);
                  setReady(false);
                }}
              >
                {item}
              </ToggleButton>
            ))}
          </ChoiceGrid>
        </ChoiceSection>
      )}

      {horizon && (
        <ChoiceSection question="What cash-access condition applies to this capital?">
          <ChoiceGrid>
            {LIQUIDITY_OPTIONS.map((item) => (
              <ToggleButton
                key={item}
                selected={liquidity === item}
                disabled={saved}
                onClick={() => {
                  setLiquidity(item);
                  setReady(false);
                }}
              >
                {item}
              </ToggleButton>
            ))}
          </ChoiceGrid>
        </ChoiceSection>
      )}

      {liquidity && (
        <ChoiceSection question="What recurring research capacity is available?">
          <ChoiceGrid>
            {RESEARCH_OPTIONS.map((item) => (
              <ToggleButton
                key={item}
                selected={research === item}
                disabled={saved}
                onClick={() => {
                  setResearch(item);
                  setReady(false);
                }}
              >
                {item}
              </ToggleButton>
            ))}
          </ChoiceGrid>
        </ChoiceSection>
      )}

      {research && (
        <ChoiceSection question="Which loss-response condition belongs in the audit?">
          <ChoiceGrid>
            {LOSS_RESPONSE_OPTIONS.map((item) => (
              <ToggleButton
                key={item}
                selected={lossResponse === item}
                disabled={saved}
                onClick={() => {
                  setLossResponse(item);
                  setReady(false);
                }}
              >
                {item}
              </ToggleButton>
            ))}
          </ChoiceGrid>
        </ChoiceSection>
      )}

      {lossResponse && (
        <QuestionBlock question="Which review rule connects evidence to action?">
          <ChoiceGrid>
            <ChoiceButton
              selected={reviewChoice === "evidence"}
              correct={reviewCorrect}
              disabled={reviewCorrect || saved}
              onClick={() => {
                setReviewChoice("evidence");
                setReady(false);
              }}
            >
              {REVIEW_RULE}
            </ChoiceButton>
            <ChoiceButton
              selected={reviewChoice === "price"}
              incorrect={reviewChoice === "price"}
              disabled={reviewCorrect || saved}
              onClick={() => {
                setReviewChoice("price");
                setReady(false);
              }}
            >
              Change the position whenever a daily price move feels unusually large.
            </ChoiceButton>
            <ChoiceButton
              selected={reviewChoice === "forever"}
              incorrect={reviewChoice === "forever"}
              disabled={reviewCorrect || saved}
              onClick={() => {
                setReviewChoice("forever");
                setReady(false);
              }}
            >
              Keep the original position through every evidence and capacity change.
            </ChoiceButton>
          </ChoiceGrid>
        </QuestionBlock>
      )}

      {reviewChoice && (
        <SceneFeedback correct={reviewCorrect}>
          {reviewCorrect
            ? "This rule links action to evidence, risk, costs, and the investor's current constraints."
            : "This rule needs a predefined evidence or capacity condition. Return to the model review rule from the stress rehearsal."}
        </SceneFeedback>
      )}

      {reviewCorrect && (
        <QuestionBlock question="Which account rule belongs in every implementation audit?">
          <ChoiceGrid>
            <ChoiceButton
              selected={accountChoice === "retained"}
              correct={accountCorrect}
              disabled={accountCorrect || saved}
              onClick={() => {
                setAccountChoice("retained");
                setReady(false);
              }}
            >
              {ACCOUNT_RULE}
            </ChoiceButton>
            <ChoiceButton
              selected={accountChoice === "gross"}
              incorrect={accountChoice === "gross"}
              disabled={accountCorrect || saved}
              onClick={() => {
                setAccountChoice("gross");
                setReady(false);
              }}
            >
              Evaluate every process using gross returns before fees, funding, turnover, and applicable taxes.
            </ChoiceButton>
            <ChoiceButton
              selected={accountChoice === "universal"}
              incorrect={accountChoice === "universal"}
              disabled={accountCorrect || saved}
              onClick={() => {
                setAccountChoice("universal");
                setReady(false);
              }}
            >
              Assume one tax treatment applies to every investor and account.
            </ChoiceButton>
          </ChoiceGrid>
        </QuestionBlock>
      )}

      {accountChoice && (
        <SceneFeedback correct={accountCorrect}>
          {accountCorrect
            ? "The fit audit now evaluates the return the investor may retain after implementation frictions."
            : "Account, jurisdiction, turnover, and financing can change retained return. The audit must estimate the applicable effects."}
        </SceneFeedback>
      )}

      {complete && !ready && !saved && (
        <button
          type="button"
          onClick={() => setReady(true)}
          className="mt-6 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20"
        >
          Assemble the provisional fit charter →
        </button>
      )}

      {ready && (
        <div className="mt-6 rounded-2xl border border-accent-green/30 bg-accent-green/[0.04] p-5 sm:p-6">
          {/* The charter's title, above the six rows it summarises. */}
          <h3 className="ops-body-strong text-[15px] text-accent-green">
            Provisional fit charter
          </h3>
          <dl className="mt-3">
            <CharterRow label="Research candidate" value={family} />
            <CharterRow label="Capacity conditions" value={capacitySummary} />
            <CharterRow label="Philosophy demand" value={demand} />
            <CharterRow label="Review rule" value={REVIEW_RULE} />
            <CharterRow label="Account rule" value={ACCOUNT_RULE} />
            <CharterRow label="Open implementation question" value={openQuestion} />
          </dl>
          <button
            type="button"
            onClick={save}
            disabled={saved}
            className="mt-5 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20 disabled:cursor-default disabled:opacity-70"
          >
            {saved ? "Fit charter saved ✓" : "Save fit charter to this browser"}
          </button>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-4">
        <div className="ops-caption text-[12px] text-accent-cyan">
          Educational boundary
        </div>
        <p className="ops-body mt-1 text-[14px] text-slate-300">
          This charter organizes research questions. Personal tax, legal,
          liquidity, and suitability decisions require current information and
          the investor&apos;s complete financial circumstances.
        </p>
      </div>
    </div>
  );
}

function DefinitionPanel({
  label,
  title,
  definition,
}: {
  label: string;
  title: string;
  definition: string;
}) {
  return (
    <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
      <div className="ops-caption text-[12px] text-accent-amber">{label}</div>
      <h3 className="ops-interactive-title mt-2 text-xl text-white sm:text-2xl">
        {title}
      </h3>
      <p className="ops-definition mt-3 max-w-3xl text-[17px] leading-7 text-slate-100">
        {definition}
      </p>
    </div>
  );
}

function DefinitionTile({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <h3 className="ops-interactive-title text-[15px] text-white">{title}</h3>
      <p className="ops-body mt-2 text-[14px] leading-5 text-slate-300">{body}</p>
    </div>
  );
}

function InvestorCard({
  label,
  facts,
  accent,
}: {
  label: string;
  facts: string[];
  accent: "green" | "amber";
}) {
  return (
    <article
      className={cn(
        "rounded-2xl border bg-white/[0.025] p-5",
        accent === "green"
          ? "border-accent-green/30"
          : "border-accent-amber/30",
      )}
    >
      <div
        className={cn(
          "ops-caption text-[12px]",
          accent === "green" ? "text-accent-green" : "text-accent-amber",
        )}
      >
        Investor profile
      </div>
      <h4 className="ops-interactive-title mt-2 text-lg text-white">{label}</h4>
      <ul className="mt-3 space-y-2">
        {facts.map((fact) => (
          <li
            key={fact}
            className="ops-body flex items-start gap-2 text-[14px] leading-5 text-slate-300"
          >
            <span
              className={cn(
                "mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full",
                accent === "green" ? "bg-accent-green" : "bg-accent-amber",
              )}
            />
            {fact}
          </li>
        ))}
      </ul>
    </article>
  );
}

function FactCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="ops-caption text-[12px] text-accent-amber">{label}</div>
      <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function QuestionBlock({
  question,
  children,
}: {
  question: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="ops-caption text-[12px] text-accent-amber">
        Your decision
      </div>
      <p className="ops-body-strong mt-2 text-[16px] leading-6 text-white">
        {question}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChoiceSection({
  question,
  children,
}: {
  question: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="ops-caption text-[12px] text-accent-amber">
        Your condition
      </div>
      <p className="ops-body-strong mt-2 text-[15px] text-white">{question}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-2 sm:grid-cols-2">{children}</div>;
}

function ChoiceButton({
  children,
  selected = false,
  correct = false,
  incorrect = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl border px-4 py-3 text-left text-[14px] leading-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40 disabled:cursor-default",
        !selected && !correct && !incorrect &&
          "border-white/15 bg-white/[0.02] text-slate-200 hover:border-accent-amber/45 hover:bg-accent-amber/[0.04]",
        selected && !correct && !incorrect &&
          "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan",
        correct &&
          "border-accent-green/45 bg-accent-green/10 text-accent-green",
        incorrect &&
          "border-accent-red/45 bg-accent-red/[0.07] text-accent-red",
        disabled && !selected && !correct && !incorrect && "opacity-45",
      )}
    >
      {children}
    </button>
  );
}

function ToggleButton({
  children,
  selected,
  disabled,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-3 text-left text-[14px] leading-6 transition-colors disabled:cursor-default",
        selected
          ? "border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan"
          : "border-white/15 bg-white/[0.02] text-slate-200 hover:border-accent-amber/45",
      )}
    >
      {children}
    </button>
  );
}

function SceneFeedback({
  correct,
  children,
}: {
  correct: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "mt-4 rounded-xl border p-4",
        correct
          ? "border-accent-green/30 bg-accent-green/[0.05]"
          : "border-accent-red/30 bg-accent-red/[0.05]",
      )}
    >
      <div
        className={cn(
          "ops-caption text-[12px]",
          correct ? "text-accent-green" : "text-accent-red",
        )}
      >
        {correct ? "Fit logic confirmed" : "Recheck the demand–capacity match"}
      </div>
      <p className="ops-body mt-1 text-[14px] leading-6 text-slate-200">
        {children}
      </p>
    </div>
  );
}

function SequentialCard({
  eyebrow,
  prompt,
  children,
  feedback,
  correct,
}: {
  eyebrow: string;
  prompt: string;
  children: ReactNode;
  feedback?: string;
  correct: boolean;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="ops-caption text-[12px] text-accent-amber">{eyebrow}</div>
      <p className="ops-body-strong mt-2 text-[16px] leading-7 text-white">
        {prompt}
      </p>
      <div className="mt-4">{children}</div>
      {feedback && (
        <SceneFeedback correct={correct}>{feedback}</SceneFeedback>
      )}
    </div>
  );
}

function NextCaseButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20"
    >
      {children}
    </button>
  );
}

function CharterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-white/10 py-3 first:border-t-0 sm:grid-cols-[150px_1fr] sm:gap-4">
      <dt className="ops-caption text-[12px] text-slate-500">{label}</dt>
      <dd className="ops-body text-[14px] leading-6 text-slate-200">{value}</dd>
    </div>
  );
}
