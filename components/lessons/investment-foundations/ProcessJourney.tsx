"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIFProgress, type PhilosophyDraft } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

const LESSON_SLUG =
  "if-1-2-where-philosophy-enters-the-investment-process";

const STEPS = [
  {
    label: "Map",
    title: "Build the investment process",
    guide:
      "First learn the five stages. The process starts with the investor—not with a favorite stock—and ends with a preplanned evaluation.",
    instruction: "Reveal all five stages, then answer the process checkpoint.",
    next: "Separate allocation from selection",
  },
  {
    label: "Separate",
    title: "Allocation is not selection",
    guide:
      "Allocation chooses broad exposures. Selection chooses the securities or vehicles inside those exposures.",
    instruction: "Use the two definitions to classify all four decisions.",
    next: "Locate the claimed advantage",
  },
  {
    label: "Locate",
    title: "Find where the philosophy acts",
    guide:
      "A philosophy’s location is the stage where it claims to improve a decision. Read the claimed advantage before choosing a stage.",
    instruction: "Place all four philosophies at their primary process stage.",
    next: "Trace one belief end to end",
  },
  {
    label: "Trace",
    title: "Keep one belief coherent",
    guide:
      "A sound philosophy should constrain decisions across the entire process. One stage should not quietly contradict another.",
    instruction: "Guide the underreaction belief through all five stages.",
    next: "Repair a broken process",
  },
  {
    label: "Repair",
    title: "Find the process leaks",
    guide:
      "A plausible philosophy can still fail when execution or evaluation no longer matches the original belief and horizon.",
    instruction: "Diagnose the first leak, then repair execution and evaluation.",
    next: "Place your provisional philosophy",
  },
  {
    label: "Place",
    title: "Create your process placement",
    guide:
      "Finish by recording where your provisional philosophy operates and the rules that keep implementation and evaluation honest.",
    instruction: "Choose a stage, validate two rules, and save the process card.",
    next: "Enter Lesson 1.3",
  },
] as const;

type SceneProps = { onComplete: () => void };

export default function ProcessJourney() {
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
      aria-label="Guided Lesson 1.2 journey"
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
                  <ProcessMapScene onComplete={() => completeStep(0)} />
                )}
                {activeStep === 1 && (
                  <AllocationSelectionScene
                    onComplete={() => completeStep(1)}
                  />
                )}
                {activeStep === 2 && (
                  <PhilosophyLocationScene
                    onComplete={() => completeStep(2)}
                  />
                )}
                {activeStep === 3 && (
                  <CoherenceTraceScene onComplete={() => completeStep(3)} />
                )}
                {activeStep === 4 && (
                  <RepairScene onComplete={() => completeStep(4)} />
                )}
                {activeStep === 5 && (
                  <ProcessPlacementScene
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
                href="/lessons/if-1-3-comparing-investment-philosophy-families"
                className="order-3 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-center text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20"
              >
                Continue to Lesson 1.3 →
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="order-3 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-500"
              >
                Save the process card to finish
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
  const completeCount = completed.filter(Boolean).length;
  const percent = Math.round((completeCount / STEPS.length) * 100);

  return (
    <div className="border-b border-white/10 px-5 py-5 sm:px-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="ops-caption text-[12px] text-slate-400">
            Guided lesson path
          </div>
          <div className="ops-body-strong mt-1 text-[14px] text-white">
            {completeCount} of {STEPS.length} decisions complete
          </div>
        </div>
        <span className="font-sans text-[14px] tabular-nums text-accent-amber">
          {percent}%
        </span>
      </div>

      <nav
        aria-label="Lesson steps"
        className="mt-4 grid grid-cols-6 gap-1.5 sm:gap-2"
      >
        {STEPS.map((step, index) => {
          const available =
            index === 0 || completed[index] || completed[index - 1];
          const active = activeStep === index;
          return (
            <button
              key={step.label}
              type="button"
              disabled={!available}
              onClick={() => onSelect(index)}
              aria-label={`${step.label}${active ? ", current" : ""}`}
              className="group min-w-0 text-left disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "block h-1 rounded-full transition-colors",
                  completed[index]
                    ? "bg-accent-green"
                    : active
                      ? "bg-accent-amber"
                      : available
                        ? "bg-white/25 group-hover:bg-white/40"
                        : "bg-white/[0.07]",
                )}
              />
              <span
                className={cn(
                  "mt-2 hidden truncate text-[12px] sm:block",
                  active
                    ? "text-accent-amber"
                    : completed[index]
                      ? "text-accent-green"
                      : available
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
  const reduceMotion = useReducedMotion();
  const current = STEPS[step];

  return (
    <div className="flex items-start gap-3">
      <motion.div
        animate={
          reduceMotion || done
            ? undefined
            : {
                boxShadow: [
                  "0 0 0 0 rgba(251,191,36,0)",
                  "0 0 0 7px rgba(251,191,36,0.10)",
                  "0 0 0 0 rgba(251,191,36,0)",
                ],
              }
        }
        transition={{ duration: 2.4, repeat: Infinity }}
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border",
          done
            ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
            : "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
        )}
        aria-hidden
      >
        {done ? "✓" : <GuideMark />}
      </motion.div>
      <div className="min-w-0">
        <div className="ops-caption text-[12px] text-accent-amber">
          OPS Guide
        </div>
        <p className="ops-body mt-1 text-[15px] text-slate-200">
          {done
            ? `Good. You completed ${current.label.toLowerCase()}. The next decision builds directly on this result.`
            : current.guide}
        </p>
        <div className="mt-2 flex items-start gap-2 text-[14px] text-slate-400">
          <span className="text-accent-amber" aria-hidden>
            →
          </span>
          <span>
            {done
              ? `Continue to ${current.next.toLowerCase()}.`
              : current.instruction}
          </span>
        </div>
      </div>
    </div>
  );
}

function GuideMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M4.5 16.5 9 9.5l4 3 6.5-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="4.5" cy="16.5" r="1.5" fill="currentColor" />
      <circle cx="9" cy="9.5" r="1.5" fill="currentColor" />
      <circle cx="13" cy="12.5" r="1.5" fill="currentColor" />
      <circle cx="19.5" cy="5.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

type ProcessStage = {
  id: "mandate" | "allocation" | "selection" | "execution" | "evaluation";
  title: string;
  question: string;
  meaning: string;
  example: string;
};

const PROCESS_STAGES: ProcessStage[] = [
  {
    id: "mandate",
    title: "Investor & mandate",
    question: "Who is the portfolio for?",
    meaning:
      "Set the objective and constraints: risk capacity, horizon, liquidity, taxes, and available resources.",
    example: "Preserve five years of planned withdrawals while pursuing growth.",
  },
  {
    id: "allocation",
    title: "Asset allocation",
    question: "Which broad exposures—and how much?",
    meaning:
      "Divide capital across asset classes, markets, regions, or other broad sources of risk and return.",
    example: "Hold 60% equities, 30% bonds, and 10% cash.",
  },
  {
    id: "selection",
    title: "Security selection",
    question: "Which specific investments?",
    meaning:
      "Choose securities or vehicles inside the broad exposures already approved for the portfolio.",
    example: "Choose one restaurant company instead of another.",
  },
  {
    id: "execution",
    title: "Execution",
    question: "How will the position be obtained?",
    meaning:
      "Translate the decision into orders that survive spreads, market impact, financing, taxes, and liquidity limits.",
    example: "Use a limit order only when the expected edge exceeds all costs.",
  },
  {
    id: "evaluation",
    title: "Evaluation",
    question: "Did the process meet its objective?",
    meaning:
      "Judge results against a preselected benchmark and horizon after considering risk, costs, and the original mandate.",
    example: "Compare a small-value strategy with a small-value benchmark after costs.",
  },
];

function ProcessMapScene({ onComplete }: SceneProps) {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(1);
  const [choice, setChoice] = useState<string | null>(null);
  const allRevealed = revealed === PROCESS_STAGES.length;
  const correct = choice === "allocation";

  const choose = (id: string) => {
    setChoice(id);
    if (id === "allocation") onComplete();
  };

  return (
    <div>
      <DefinitionPanel
        label="Concept first"
        title="The investment process"
        definition="The investment process is the sequence that turns an investor’s objective and market beliefs into portfolio decisions, implementation, and a disciplined evaluation."
      />

      <div className="mt-5 space-y-3">
        {PROCESS_STAGES.slice(0, revealed).map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/35 bg-accent-amber/10 text-[14px] font-semibold tabular-nums text-accent-amber">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <h3 className="ops-interactive-title text-[17px] text-white">
                    {stage.title}
                  </h3>
                  <span className="ops-body text-[14px] text-accent-amber">
                    {stage.question}
                  </span>
                </div>
                <p className="ops-body mt-2 text-[14px] text-slate-300">
                  {stage.meaning}
                </p>
                <p className="ops-body mt-2 border-l border-white/15 pl-3 text-[14px] text-slate-400">
                  Example: {stage.example}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!allRevealed && (
        <button
          type="button"
          onClick={() => setRevealed((count) => count + 1)}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 sm:w-auto"
        >
          Add stage {revealed + 1}: {PROCESS_STAGES[revealed].title} →
        </button>
      )}

      {allRevealed && (
        <QuestionBlock question="Before choosing an individual stock, which portfolio decision must already be defined?">
          <ChoiceGrid>
            <ChoiceButton
              selected={choice === "allocation"}
              correct={correct}
              disabled={correct}
              onClick={() => choose("allocation")}
            >
              The portfolio’s broad asset allocation.
            </ChoiceButton>
            <ChoiceButton
              selected={choice === "execution"}
              incorrect={choice === "execution"}
              disabled={correct}
              onClick={() => choose("execution")}
            >
              The exact order type for the stock purchase.
            </ChoiceButton>
            <ChoiceButton
              selected={choice === "evaluation"}
              incorrect={choice === "evaluation"}
              disabled={correct}
              onClick={() => choose("evaluation")}
            >
              The stock’s realized return after one month.
            </ChoiceButton>
          </ChoiceGrid>
        </QuestionBlock>
      )}

      {allRevealed && choice && (
        <SceneFeedback correct={correct}>
          {correct
            ? "Correct. The allocation decision establishes whether and how much equity exposure belongs in the portfolio before security selection chooses a stock inside that exposure."
            : "Return to the sequence. The question before ‘which stock?’ is ‘how much equity exposure belongs in this portfolio?’"}
        </SceneFeedback>
      )}
    </div>
  );
}

type AllocationSelection = "allocation" | "selection";

const ALLOCATION_CASES: {
  statement: string;
  answer: AllocationSelection;
  feedback: string;
}[] = [
  {
    statement: "Increase the portfolio’s bond exposure from 20% to 35%.",
    answer: "allocation",
    feedback: "This changes the weight of an entire asset class.",
  },
  {
    statement: "Choose a five-year Atlas bond instead of a five-year Harbor bond.",
    answer: "selection",
    feedback: "The fixed-income exposure already exists; this chooses a specific security inside it.",
  },
  {
    statement: "Shift part of the equity portfolio from domestic to international markets.",
    answer: "allocation",
    feedback: "This changes a broad geographic market exposure.",
  },
  {
    statement: "Choose between two funds for an already approved real-estate allocation.",
    answer: "selection",
    feedback: "The real-estate exposure is approved; the remaining decision is which vehicle to hold.",
  },
];

function AllocationSelectionScene({ onComplete }: SceneProps) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<AllocationSelection | null>(null);
  const current = ALLOCATION_CASES[caseIndex];
  const solved = choice === current.answer;

  const choose = (answer: AllocationSelection) => {
    setChoice(answer);
    if (answer === current.answer && caseIndex === ALLOCATION_CASES.length - 1) {
      onComplete();
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DefinitionTile
          title="Asset allocation"
          body="Chooses broad exposures and their portfolio weights: stocks, bonds, cash, regions, or markets."
        />
        <DefinitionTile
          title="Security selection"
          body="Chooses specific securities or vehicles inside an exposure the portfolio has already decided to hold."
        />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="ops-caption text-[12px] text-accent-amber">
            Decision {caseIndex + 1} of {ALLOCATION_CASES.length}
          </span>
          <span className="font-sans text-[12px] tabular-nums text-slate-500">
            {Math.round(((caseIndex + (solved ? 1 : 0)) / ALLOCATION_CASES.length) * 100)}%
          </span>
        </div>

        <QuestionBlock question={current.statement} compact>
          <ChoiceGrid columns={2}>
            <ChoiceButton
              selected={choice === "allocation"}
              correct={solved && current.answer === "allocation"}
              incorrect={choice === "allocation" && !solved}
              disabled={solved}
              onClick={() => choose("allocation")}
            >
              Asset allocation
            </ChoiceButton>
            <ChoiceButton
              selected={choice === "selection"}
              correct={solved && current.answer === "selection"}
              incorrect={choice === "selection" && !solved}
              disabled={solved}
              onClick={() => choose("selection")}
            >
              Security selection
            </ChoiceButton>
          </ChoiceGrid>
        </QuestionBlock>

        {choice && (
          <SceneFeedback correct={solved}>{current.feedback}</SceneFeedback>
        )}

        {solved && caseIndex < ALLOCATION_CASES.length - 1 && (
          <button
            type="button"
            onClick={() => {
              setCaseIndex((index) => index + 1);
              setChoice(null);
            }}
            className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
          >
            Next decision →
          </button>
        )}
      </div>
    </div>
  );
}

type Location = "allocation" | "selection" | "execution" | "multi";

const LOCATION_LABELS: Record<Location, string> = {
  allocation: "Asset allocation",
  selection: "Security selection",
  execution: "Execution",
  multi: "More than one stage",
};

const LOCATION_CASES: {
  philosophy: string;
  claim: string;
  answer: Location;
  feedback: string;
}[] = [
  {
    philosophy: "Market timing",
    claim: "Forecast which broad asset classes or markets will perform better, then change their portfolio weights.",
    answer: "allocation",
    feedback: "The claimed advantage changes broad market exposures, so its primary location is asset allocation.",
  },
  {
    philosophy: "Value investing",
    claim: "Identify individual securities priced below a defensible estimate of value.",
    answer: "selection",
    feedback: "The broad exposure is already chosen; the philosophy claims an advantage in selecting securities.",
  },
  {
    philosophy: "Relative-value arbitrage",
    claim: "Exploit inconsistent prices between linked assets while controlling order timing, financing, and convergence risk.",
    answer: "execution",
    feedback: "The opportunity depends heavily on implementing linked trades and surviving convergence risk, so execution is primary here.",
  },
  {
    philosophy: "Information-based investing",
    claim: "Interpret public information more accurately to choose a security and respond before its price fully adjusts.",
    answer: "multi",
    feedback: "The claim spans security selection and execution; not every philosophy fits only one stage.",
  },
];

function PhilosophyLocationScene({ onComplete }: SceneProps) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<Location | null>(null);
  const current = LOCATION_CASES[caseIndex];
  const solved = choice === current.answer;

  const choose = (answer: Location) => {
    setChoice(answer);
    if (answer === current.answer && caseIndex === LOCATION_CASES.length - 1) {
      onComplete();
    }
  };

  return (
    <div>
      <DefinitionPanel
        label="Placement rule"
        title="Locate the claimed advantage"
        definition="The location of a philosophy is the process stage where it claims the investor can improve a decision. Read the claim—not merely the philosophy’s name."
      />

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="ops-caption text-[12px] text-accent-amber">
            Placement {caseIndex + 1} of {LOCATION_CASES.length}
          </span>
          <span className="text-[12px] tabular-nums text-slate-500">
            {caseIndex + 1}/{LOCATION_CASES.length}
          </span>
        </div>
        <h3 className="ops-interactive-title mt-4 text-xl text-white">
          {current.philosophy}
        </h3>
        <p className="ops-body mt-2 text-[15px] text-slate-300">
          {current.claim}
        </p>

        <QuestionBlock question="Where does this philosophy primarily claim an advantage?" compact>
          <ChoiceGrid columns={2}>
            {(Object.keys(LOCATION_LABELS) as Location[]).map((location) => (
              <ChoiceButton
                key={location}
                selected={choice === location}
                correct={solved && current.answer === location}
                incorrect={choice === location && !solved}
                disabled={solved}
                onClick={() => choose(location)}
              >
                {LOCATION_LABELS[location]}
              </ChoiceButton>
            ))}
          </ChoiceGrid>
        </QuestionBlock>

        {choice && (
          <SceneFeedback correct={solved}>{current.feedback}</SceneFeedback>
        )}

        {solved && caseIndex < LOCATION_CASES.length - 1 && (
          <button
            type="button"
            onClick={() => {
              setCaseIndex((index) => index + 1);
              setChoice(null);
            }}
            className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
          >
            Place the next philosophy →
          </button>
        )}
      </div>
    </div>
  );
}

const TRACE_STAGES = [
  {
    stage: "Investor & mandate",
    prompt: "Which investor can responsibly use a patient underreaction strategy?",
    options: [
      { id: "fit", text: "An investor with a long horizon, stable liquidity, and time to research surprises.", correct: true },
      { id: "unfit", text: "An investor who needs most of the capital in six months and cannot tolerate drawdowns.", correct: false },
    ],
    feedback: "The philosophy requires time and loss capacity. A shared belief does not erase the investor’s constraints.",
  },
  {
    stage: "Asset allocation",
    prompt: "How should this security-selection belief affect broad allocation?",
    options: [
      { id: "steady", text: "Keep the strategic allocation unless a separate allocation thesis justifies changing it.", correct: true },
      { id: "timing", text: "Move the entire portfolio from bonds to stocks after every positive earnings surprise.", correct: false },
    ],
    feedback: "A stock-selection belief does not automatically justify a market-timing allocation decision.",
  },
  {
    stage: "Security selection",
    prompt: "Which selection rule follows from the underreaction belief?",
    options: [
      { id: "research", text: "Investigate firms where durable cash-flow expectations improved more than the price.", correct: true },
      { id: "popular", text: "Buy whichever firm appears on the greatest number of popular screens.", correct: false },
    ],
    feedback: "The selection rule must test whether the price adjustment lagged the change in fundamentals.",
  },
  {
    stage: "Execution",
    prompt: "When should the idea become a trade?",
    options: [
      { id: "costs", text: "Only when the estimated opportunity remains meaningful after spreads, taxes, and position-size limits.", correct: true },
      { id: "automatic", text: "Immediately after every surprise, regardless of liquidity or trading costs.", correct: false },
    ],
    feedback: "A paper edge is not an executable edge. Costs and capacity are part of the investment process.",
  },
  {
    stage: "Evaluation",
    prompt: "How should the strategy be judged?",
    options: [
      { id: "discipline", text: "Against a preselected comparable benchmark over the thesis horizon, after risk and costs.", correct: true },
      { id: "winner", text: "Against whichever index performed best after the result is known.", correct: false },
    ],
    feedback: "The benchmark and horizon must be chosen before the result; otherwise evaluation becomes performance chasing.",
  },
] as const;

function CoherenceTraceScene({ onComplete }: SceneProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = TRACE_STAGES[stageIndex];
  const selected = current.options.find((option) => option.id === choice);
  const solved = Boolean(selected?.correct);

  const choose = (id: string, correct: boolean) => {
    setChoice(id);
    if (correct && stageIndex === TRACE_STAGES.length - 1) onComplete();
  };

  return (
    <div>
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          Belief carried forward from Lesson 1.1
        </div>
        <p className="ops-definition mt-2 text-[17px] text-white">
          Investors sometimes update durable earnings expectations gradually
          after important new information.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-5 gap-1.5" aria-hidden>
        {TRACE_STAGES.map((item, index) => (
          <div key={item.stage}>
            <div
              className={cn(
                "h-1 rounded-full",
                index < stageIndex
                  ? "bg-accent-green"
                  : index === stageIndex
                    ? "bg-accent-amber"
                    : "bg-white/10",
              )}
            />
            <div className="mt-1 hidden truncate text-[12px] text-slate-500 sm:block">
              {item.stage}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <span className="ops-caption text-[12px] text-accent-amber">
          Stage {stageIndex + 1}: {current.stage}
        </span>
        <QuestionBlock question={current.prompt} compact>
          <ChoiceGrid>
            {current.options.map((option) => (
              <ChoiceButton
                key={option.id}
                selected={choice === option.id}
                correct={choice === option.id && option.correct}
                incorrect={choice === option.id && !option.correct}
                disabled={solved}
                onClick={() => choose(option.id, option.correct)}
              >
                {option.text}
              </ChoiceButton>
            ))}
          </ChoiceGrid>
        </QuestionBlock>

        {choice && (
          <SceneFeedback correct={solved}>{current.feedback}</SceneFeedback>
        )}

        {solved && stageIndex < TRACE_STAGES.length - 1 && (
          <button
            type="button"
            onClick={() => {
              setStageIndex((index) => index + 1);
              setChoice(null);
            }}
            className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
          >
            Carry the belief to {TRACE_STAGES[stageIndex + 1].stage.toLowerCase()} →
          </button>
        )}
      </div>
    </div>
  );
}

const REPAIR_DECISIONS = [
  {
    prompt: "Where is the first serious process leak?",
    options: [
      { id: "selection", text: "Selection—the fund researches profitable small firms trading below value.", correct: false },
      { id: "execution", text: "Execution—the fund turns over the portfolio weekly despite a three-year thesis.", correct: true },
      { id: "mandate", text: "Mandate—the capital is committed for at least five years.", correct: false },
    ],
    feedback: "Weekly turnover contradicts the patient correction mechanism and can consume the claimed edge through costs and taxes.",
  },
  {
    prompt: "Which execution rule repairs that leak?",
    options: [
      { id: "rank", text: "Trade every rank change so the portfolio always holds yesterday’s top screen.", correct: false },
      { id: "threshold", text: "Trade only when the written thesis and valuation threshold hold and the expected edge exceeds costs.", correct: true },
      { id: "volume", text: "Increase turnover whenever recent performance falls behind.", correct: false },
    ],
    feedback: "Execution should serve the thesis, not replace it. A threshold and cost check preserve the original logic.",
  },
  {
    prompt: "Which evaluation rule repairs the final leak?",
    options: [
      { id: "nasdaq", text: "Judge monthly against the Nasdaq-100 because it recently performed best.", correct: false },
      { id: "absolute", text: "Keep the strategy whenever its absolute return is positive.", correct: false },
      { id: "benchmark", text: "Preselect a comparable small-value benchmark and evaluate over the thesis horizon after risk and costs.", correct: true },
    ],
    feedback: "A comparable benchmark and precommitted horizon separate process quality from a convenient after-the-fact comparison.",
  },
] as const;

function RepairScene({ onComplete }: SceneProps) {
  const [decisionIndex, setDecisionIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = REPAIR_DECISIONS[decisionIndex];
  const selected = current.options.find((option) => option.id === choice);
  const solved = Boolean(selected?.correct);

  const choose = (id: string, correct: boolean) => {
    setChoice(id);
    if (correct && decisionIndex === REPAIR_DECISIONS.length - 1) onComplete();
  };

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="ops-caption text-[12px] text-accent-amber">
          Northstar Small Value · committee file
        </div>
        <p className="ops-body-strong mt-3 text-[16px] text-white">
          Belief: forced institutional selling can leave some profitable small
          firms undervalued for up to three years.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MemoRow label="Mandate" value="Capital committed for at least five years" />
          <MemoRow label="Selection" value="Profitable small firms below estimated value" />
          <MemoRow label="Execution" value="Re-rank and trade the portfolio every Friday" warning />
          <MemoRow label="Evaluation" value="Monthly versus the best-performing major index" warning />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <span className="ops-caption text-[12px] text-accent-amber">
          Repair {decisionIndex + 1} of {REPAIR_DECISIONS.length}
        </span>
        <QuestionBlock question={current.prompt} compact>
          <ChoiceGrid>
            {current.options.map((option) => (
              <ChoiceButton
                key={option.id}
                selected={choice === option.id}
                correct={choice === option.id && option.correct}
                incorrect={choice === option.id && !option.correct}
                disabled={solved}
                onClick={() => choose(option.id, option.correct)}
              >
                {option.text}
              </ChoiceButton>
            ))}
          </ChoiceGrid>
        </QuestionBlock>

        {choice && (
          <SceneFeedback correct={solved}>{current.feedback}</SceneFeedback>
        )}

        {solved && decisionIndex < REPAIR_DECISIONS.length - 1 && (
          <button
            type="button"
            onClick={() => {
              setDecisionIndex((index) => index + 1);
              setChoice(null);
            }}
            className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
          >
            Continue the repair →
          </button>
        )}
      </div>
    </div>
  );
}

type PlacementId = "allocation" | "selection" | "execution" | "multi" | "none";

const PLACEMENTS: { id: PlacementId; label: string; note: string }[] = [
  { id: "allocation", label: "Asset allocation", note: "Broad markets or exposure weights" },
  { id: "selection", label: "Security selection", note: "Specific securities inside an exposure" },
  { id: "execution", label: "Execution", note: "Pricing, trading, or convergence" },
  { id: "multi", label: "More than one stage", note: "A claim spanning distinct process decisions" },
  { id: "none", label: "No active advantage yet", note: "Use a passive default while gathering evidence" },
];

const IMPLEMENTATION_RULES: Record<
  PlacementId,
  { correct: string; distractor: string }
> = {
  allocation: {
    correct: "Change broad exposure only when predefined allocation conditions are met; rebalance deliberately.",
    distractor: "Change the entire allocation whenever a favored stock reports surprising news.",
  },
  selection: {
    correct: "Require a written security thesis, price threshold, and cost check before trading.",
    distractor: "Buy a security whenever several popular screens include it.",
  },
  execution: {
    correct: "Act only when the price discrepancy exceeds trading, financing, and convergence risk.",
    distractor: "Trade every apparent discrepancy without estimating costs or funding risk.",
  },
  multi: {
    correct: "Write a separate rule for each claimed stage and identify which decision each rule controls.",
    distractor: "Use one vague rule for every portfolio decision so the stages remain flexible.",
  },
  none: {
    correct: "Use a diversified passive default while gathering evidence for a specific, testable advantage.",
    distractor: "Choose whichever active strategy has the strongest recent return.",
  },
};

const EVALUATION_RULE =
  "Preselect a benchmark that matches the objective and exposure; judge over the stated horizon after risk, costs, and taxes.";

function ProcessPlacementScene({
  draft,
  saveDraft,
  onComplete,
}: SceneProps & {
  draft: PhilosophyDraft;
  saveDraft: (nextDraft: PhilosophyDraft) => void;
}) {
  const [placement, setPlacement] = useState<PlacementId | null>(null);
  const [implementation, setImplementation] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const priorPlacement = PLACEMENTS.find(
      (item) => item.label === draft.advantageStage,
    );
    if (priorPlacement) setPlacement(priorPlacement.id);
    if (draft.executionRule) setImplementation(draft.executionRule);
    if (draft.evaluationRule) setEvaluation(draft.evaluationRule);
  }, [draft.advantageStage, draft.evaluationRule, draft.executionRule]);

  const implementationCorrect =
    placement !== null &&
    implementation === IMPLEMENTATION_RULES[placement].correct;
  const evaluationCorrect = evaluation === EVALUATION_RULE;
  const ready = placement !== null && implementationCorrect && evaluationCorrect;
  const selectedPlacement = PLACEMENTS.find((item) => item.id === placement);

  const save = () => {
    if (!ready || !placement) return;
    saveDraft({
      ...draft,
      advantageStage: PLACEMENTS.find((item) => item.id === placement)?.label ?? "",
      executionRule: IMPLEMENTATION_RULES[placement].correct,
      evaluationRule: EVALUATION_RULE,
    });
    setSaved(true);
    onComplete();
  };

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          Your provisional belief
        </div>
        <p className="ops-body mt-2 text-[15px] text-slate-200">
          {draft.marketBelief.trim()
            ? draft.marketBelief
            : "No belief has been saved yet. You can still place a provisional process approach and revise it after gathering evidence."}
        </p>
      </div>

      <div className="mt-5">
        <QuestionBlock question="Where would your provisional philosophy primarily seek an advantage?" compact>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PLACEMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPlacement(item.id);
                  setImplementation(null);
                  setSaved(false);
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition-colors",
                  placement === item.id
                    ? "border-accent-amber/60 bg-accent-amber/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25",
                )}
              >
                <span className="ops-body-strong block text-[14px] text-white">
                  {item.label}
                </span>
                <span className="ops-body mt-1 block text-[12px] text-slate-400">
                  {item.note}
                </span>
              </button>
            ))}
          </div>
        </QuestionBlock>
      </div>

      {placement && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <QuestionBlock question={`Which rule keeps a ${selectedPlacement?.label.toLowerCase()} philosophy coherent?`} compact>
            <ChoiceGrid>
              {[
                IMPLEMENTATION_RULES[placement].correct,
                IMPLEMENTATION_RULES[placement].distractor,
              ].map((rule) => (
                <ChoiceButton
                  key={rule}
                  selected={implementation === rule}
                  correct={implementation === rule && rule === IMPLEMENTATION_RULES[placement].correct}
                  incorrect={implementation === rule && rule !== IMPLEMENTATION_RULES[placement].correct}
                  disabled={implementationCorrect}
                  onClick={() => setImplementation(rule)}
                >
                  {rule}
                </ChoiceButton>
              ))}
            </ChoiceGrid>
          </QuestionBlock>
          {implementation && (
            <SceneFeedback correct={implementationCorrect}>
              {implementationCorrect
                ? "This rule preserves the claimed source of advantage and constrains implementation before performance is known."
                : "This rule changes behavior without preserving the stated source of advantage. Choose the rule that belongs to the selected stage."}
            </SceneFeedback>
          )}
        </div>
      )}

      {implementationCorrect && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <QuestionBlock question="Which evaluation rule should be committed before results arrive?" compact>
            <ChoiceGrid>
              {[EVALUATION_RULE, "Compare with whichever major index performs best after the result is known.", "Abandon the process after its first negative month."].map((rule) => (
                <ChoiceButton
                  key={rule}
                  selected={evaluation === rule}
                  correct={evaluation === rule && rule === EVALUATION_RULE}
                  incorrect={evaluation === rule && rule !== EVALUATION_RULE}
                  disabled={evaluationCorrect}
                  onClick={() => setEvaluation(rule)}
                >
                  {rule}
                </ChoiceButton>
              ))}
            </ChoiceGrid>
          </QuestionBlock>
          {evaluation && (
            <SceneFeedback correct={evaluationCorrect}>
              {evaluationCorrect
                ? "Good. The benchmark, horizon, risk, and costs are now fixed before the outcome can influence the comparison."
                : "That rule lets the outcome choose the evaluation standard. Precommit the benchmark and horizon instead."}
            </SceneFeedback>
          )}
        </div>
      )}

      {ready && (
        <div className="mt-5 rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-5">
          {/* The card's title, and it heads three rows of evidence — at caption
              size it was the smallest text in the block it titles. */}
          <h3 className="ops-body-strong text-[15px] text-accent-green">
            Process placement ready
          </h3>
          <dl className="mt-3 space-y-3">
            <ProcessCardRow label="Primary stage" value={selectedPlacement?.label ?? ""} />
            <ProcessCardRow label="Implementation rule" value={IMPLEMENTATION_RULES[placement!].correct} />
            <ProcessCardRow label="Evaluation rule" value={EVALUATION_RULE} />
          </dl>
          <button
            type="button"
            onClick={save}
            disabled={saved}
            className="mt-5 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20 disabled:cursor-default disabled:opacity-70"
          >
            {saved ? "Process card saved ✓" : "Save process card to this browser"}
          </button>
        </div>
      )}
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
    <div className="rounded-2xl border border-accent-amber/20 bg-accent-amber/[0.04] p-5">
      <h3 className="ops-interactive-title text-[17px] text-white">{title}</h3>
      <p className="ops-body mt-2 text-[14px] text-slate-300">{body}</p>
    </div>
  );
}

function QuestionBlock({
  question,
  children,
  compact = false,
}: {
  question: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "mt-4" : "mt-6"}>
      <div className="ops-caption text-[12px] text-accent-amber">
        Your decision
      </div>
      <p className="ops-body-strong mt-1 text-[16px] text-white">{question}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ChoiceGrid({
  children,
  columns = 1,
}: {
  children: ReactNode;
  columns?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-2", columns === 2 && "sm:grid-cols-2")}>
      {children}
    </div>
  );
}

function ChoiceButton({
  selected,
  correct = false,
  incorrect = false,
  disabled = false,
  onClick,
  children,
}: {
  selected: boolean;
  correct?: boolean;
  incorrect?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-xl border px-4 py-3 text-left text-[14px] leading-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40 disabled:cursor-default",
        correct
          ? "border-accent-green/55 bg-accent-green/[0.08] text-slate-50"
          : incorrect
            ? "border-accent-red/55 bg-accent-red/[0.07] text-slate-100"
            : selected
              ? "border-accent-amber/55 bg-accent-amber/[0.08] text-white"
              : "border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/25 hover:bg-white/[0.04]",
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
          ? "border-accent-green/25 bg-accent-green/[0.05]"
          : "border-accent-red/25 bg-accent-red/[0.05]",
      )}
    >
      <div
        className={cn(
          "ops-caption text-[12px]",
          correct ? "text-accent-green" : "text-accent-red",
        )}
      >
        {correct ? "Logic holds" : "Revise the decision"}
      </div>
      <p className="ops-body mt-1 text-[14px] text-slate-200">{children}</p>
    </div>
  );
}

function MemoRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        warning
          ? "border-accent-red/25 bg-accent-red/[0.05]"
          : "border-white/10 bg-white/[0.02]",
      )}
    >
      <div
        className={cn(
          "ops-caption text-[12px]",
          warning ? "text-accent-red" : "text-slate-500",
        )}
      >
        {label}
      </div>
      <p className="ops-body mt-1 text-[14px] text-slate-200">{value}</p>
    </div>
  );
}

function ProcessCardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-white/10 pt-3 first:border-t-0 first:pt-0 sm:grid-cols-[140px_1fr] sm:gap-4">
      <dt className="ops-caption text-[12px] text-slate-500">{label}</dt>
      <dd className="ops-body text-[14px] text-slate-100">{value}</dd>
    </div>
  );
}
