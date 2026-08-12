"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIFProgress } from "@/lib/if-progress";
import { cn } from "@/lib/utils";

const LESSON_SLUG = "if-1-1-how-an-investor-builds-a-philosophy";

const STEPS = [
  {
    label: "Investigate",
    title: "Learn the lens, then investigate",
    guide:
      "Before judging Maya and Daniel, learn what an investment philosophy is and the three features that make it usable.",
    instruction: "Learn the three-part philosophy lens, then use it to compare their reasoning.",
    next: "Build the reasoning chain",
  },
  {
    label: "Connect",
    title: "Rebuild Maya's decision",
    guide:
      "A philosophy is not a slogan. It connects evidence to a market belief and then to an action.",
    instruction: "Select Maya's five reasoning cards in the order they belong.",
    next: "Classify the layers",
  },
  {
    label: "Classify",
    title: "Name the layer",
    guide:
      "Investors often confuse a belief, a philosophy, a strategy, and a trade. The wording tells you which layer you are seeing.",
    instruction: "Solve all four cases. Incorrect answers can be revised immediately.",
    next: "Enter the decision room",
  },
  {
    label: "Diagnose",
    title: "Do not chase the winner",
    guide:
      "Underperformance is information, but it is not a diagnosis. Separate a broken belief from broken implementation.",
    instruction: "Work through the committee review and repair the decision process.",
    next: "Draft your hypothesis",
  },
  {
    label: "Build",
    title: "Create a testable hypothesis",
    guide:
      "You are not choosing a final philosophy yet. You are writing a claim that later evidence can strengthen or reject.",
    instruction: "Answer one prompt at a time, then save the completed hypothesis.",
    next: "Take the final challenge",
  },
  {
    label: "Apply",
    title: "Audit the investment memo",
    guide:
      "The final challenge combines the entire lesson. Inspect the memo's logic instead of judging its latest return.",
    instruction: "Correct all three reasoning errors to complete Lesson 1.1.",
    next: "Enter Lesson 1.2",
  },
] as const;

type SceneProps = {
  onComplete: () => void;
};

export default function PhilosophyJourney() {
  const reduceMotion = useReducedMotion();
  const journeyRef = useRef<HTMLElement>(null);
  const { markComplete } = useIFProgress();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState<boolean[]>(() =>
    STEPS.map(() => false),
  );

  const completeStep = useCallback(
    (index: number) => {
      setCompleted((current) => {
        if (current[index]) return current;
        return current.map((done, itemIndex) =>
          itemIndex === index ? true : done,
        );
      });
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

  const currentComplete = completed[activeStep];
  const current = STEPS[activeStep];

  return (
    <section
      id="lesson-journey"
      ref={journeyRef}
      className="scroll-mt-24"
      aria-label="Guided Lesson 1.1 journey"
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
                  <InvestorScene onComplete={() => completeStep(0)} />
                )}
                {activeStep === 1 && (
                  <ReasoningChainScene onComplete={() => completeStep(1)} />
                )}
                {activeStep === 2 && (
                  <ClassificationScene onComplete={() => completeStep(2)} />
                )}
                {activeStep === 3 && (
                  <DiagnosisScene onComplete={() => completeStep(3)} />
                )}
                {activeStep === 4 && (
                  <HypothesisScene onComplete={() => completeStep(4)} />
                )}
                {activeStep === 5 && (
                  <FinalChallengeScene onComplete={() => completeStep(5)} />
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
                href="/lessons/if-1-2-where-philosophy-enters-the-investment-process"
                className="order-3 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-center text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20"
              >
                Continue to Lesson 1.2 →
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="order-3 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-500"
              >
                Complete the challenge to finish
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
  const progress = completed.filter(Boolean).length;

  return (
    <div className="border-b border-white/10 px-5 py-4 sm:px-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="ops-caption text-[12px] text-slate-400">
            Guided lesson path
          </div>
          <div className="ops-body-strong mt-1 text-sm text-white">
            {progress} of {STEPS.length} decisions complete
          </div>
        </div>
        <div className="font-sans text-sm tabular-nums text-accent-amber">
          {Math.round((progress / STEPS.length) * 100)}%
        </div>
      </div>

      <div
        className="mt-4 grid grid-cols-6 gap-1.5"
        role="navigation"
        aria-label="Lesson steps"
      >
        {STEPS.map((step, index) => {
          const available = index === 0 || completed[index - 1];
          const active = activeStep === index;
          const done = completed[index];
          return (
            <button
              key={step.label}
              type="button"
              disabled={!available}
              onClick={() => onSelect(index)}
              aria-label={`${step.label}${done ? ", complete" : active ? ", current" : ""}`}
              aria-current={active ? "step" : undefined}
              className="group min-w-0 text-left disabled:cursor-not-allowed"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-colors",
                  done
                    ? "bg-accent-green"
                    : active
                      ? "bg-accent-amber"
                      : available
                        ? "bg-white/20 group-hover:bg-accent-amber/50"
                        : "bg-white/10",
                )}
              />
              <span
                className={cn(
                  "ops-caption mt-2 hidden truncate text-[12px] sm:block",
                  active
                    ? "text-accent-amber"
                    : done
                      ? "text-accent-green"
                      : "text-slate-500",
                )}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
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
            : { boxShadow: ["0 0 0 0 rgba(251,191,36,0)", "0 0 0 7px rgba(251,191,36,0.10)", "0 0 0 0 rgba(251,191,36,0)"] }
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
        <div className="ops-caption text-[12px] text-accent-amber">OPS Guide</div>
        <p className="ops-body mt-1 text-[15px] text-slate-200">
          {done
            ? `Good. You completed ${current.label.toLowerCase()}. The next step will build directly on this decision.`
            : current.guide}
        </p>
        <div className="mt-2 flex items-start gap-2 text-[14px] text-slate-400">
          <span className="text-accent-amber" aria-hidden>→</span>
          <span>{done ? `Continue to ${current.next.toLowerCase()}.` : current.instruction}</span>
        </div>
      </div>
    </div>
  );
}

function GuideMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path
        d="M5 15.5c2.2-5.6 4.8-8.4 7.7-8.4 2.4 0 4.5 1.5 6.3 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="6" cy="16" r="1.6" fill="currentColor" />
      <circle cx="13" cy="7" r="1.6" fill="currentColor" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

const INVESTORS = [
  {
    id: "maya",
    name: "Maya",
    action: "Bought Arclight two days after unexpectedly strong earnings.",
    notes: [
      "Investors can revise long-term expectations gradually.",
      "She checks whether cash-flow expectations changed more than the price.",
      "She can state what evidence would make her reject the idea.",
    ],
  },
  {
    id: "daniel",
    name: "Daniel",
    action: "Bought Arclight at the same price and on the same day.",
    notes: [
      "The stock ranks highly on three popular screens.",
      "Several investors he follows recently bought it.",
      "He has not stated why these facts should predict a return.",
    ],
  },
] as const;

const PHILOSOPHY_LENS = [
  {
    title: "Explains the opportunity",
    body: "It identifies a market behavior, mistake, or constraint that could create an opportunity.",
  },
  {
    title: "Guides the strategy",
    body: "It explains why some investment actions follow from that view of the market and others do not.",
  },
  {
    title: "Can be challenged",
    body: "It names evidence that could weaken or reject the view instead of protecting it from every result.",
  },
] as const;

function InvestorScene({ onComplete }: SceneProps) {
  const reduceMotion = useReducedMotion();
  const [lensReady, setLensReady] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const correct = choice === "maya";

  const choose = (id: string) => {
    setChoice(id);
    if (id === "maya") onComplete();
  };

  return (
    <div>
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
        <div className="ops-caption text-[12px] text-accent-amber">
          First, learn the lens
        </div>
        <h3 className="ops-interactive-title mt-2 text-xl text-white sm:text-2xl">
          What is an investment philosophy?
        </h3>
        <p className="ops-definition mt-3 max-w-3xl text-[17px] leading-7 text-slate-100">
          An investment philosophy is a coherent, testable view of how markets
          behave—and where opportunities can arise—that determines which
          investment strategies make sense.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {PHILOSOPHY_LENS.map((item, index) => (
            <div
              key={item.title}
              className="rounded-xl border border-white/10 bg-black/10 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-amber/15 text-[12px] font-semibold tabular-nums text-accent-amber">
                  {index + 1}
                </span>
                <h4 className="ops-body-strong text-[14px] text-white">
                  {item.title}
                </h4>
              </div>
              <p className="ops-body mt-2 text-[14px] leading-5 text-slate-300">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        {!lensReady ? (
          <button
            type="button"
            onClick={() => setLensReady(true)}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2.5 text-sm font-semibold text-accent-amber transition-colors hover:bg-accent-amber/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40 sm:w-auto"
          >
            Use this lens on Maya and Daniel →
          </button>
        ) : (
          <div
            role="status"
            className="mt-5 flex items-center gap-2 text-[14px] font-medium text-accent-green"
          >
            <span aria-hidden>✓</span>
            Lens ready: explain, guide, challenge.
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {lensReady && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
            className="mt-6"
          >
            <ScenePrompt>
              Maya and Daniel bought the same stock at the same price. The
              future return is hidden, so judge only whether their reasoning
              explains, guides, and can be challenged.
            </ScenePrompt>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {INVESTORS.map((investor) => (
                <article
                  key={investor.id}
                  className={cn(
                    "rounded-2xl border p-5 transition-colors",
                    choice === investor.id
                      ? correct
                        ? "border-accent-green/50 bg-accent-green/[0.06]"
                        : "border-accent-red/50 bg-accent-red/[0.05]"
                      : "border-white/10 bg-white/[0.02]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="ops-interactive-title text-xl">
                      {investor.name}
                    </h3>
                    <span className="ops-caption text-[12px] text-slate-500">
                      Investor notes
                    </span>
                  </div>
                  <p className="ops-body mt-2 text-[14px] text-slate-300">
                    {investor.action}
                  </p>
                  <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {investor.notes.map((note) => (
                      <li
                        key={note}
                        className="ops-body flex items-start gap-2.5 text-[14px] text-slate-300"
                      >
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <QuestionBlock question="Who is acting from an investment philosophy?">
              <ChoiceGrid>
                <ChoiceButton
                  selected={choice === "maya"}
                  correct={correct && choice === "maya"}
                  disabled={correct}
                  onClick={() => choose("maya")}
                >
                  Maya—her trade follows from a testable account of market
                  behavior.
                </ChoiceButton>
                <ChoiceButton
                  selected={choice === "daniel"}
                  incorrect={choice === "daniel"}
                  disabled={correct}
                  onClick={() => choose("daniel")}
                >
                  Daniel—multiple screens make his reasoning more reliable.
                </ChoiceButton>
                <ChoiceButton
                  selected={choice === "both"}
                  incorrect={choice === "both"}
                  disabled={correct}
                  onClick={() => choose("both")}
                >
                  Both—the trade and entry price are identical.
                </ChoiceButton>
              </ChoiceGrid>
            </QuestionBlock>

            {choice && (
              <SceneFeedback correct={correct}>
                {correct
                  ? "Maya has not proved that the stock will win. She explains a possible market opportunity, lets that view guide her process, and names evidence that could change her mind. Her reasoning passes all three parts of the philosophy lens."
                  : "The outcome and number of signals do not create a philosophy. Apply the three-part lens: explain the opportunity, connect it to a strategy, and identify what could challenge it. Then revise your choice."}
              </SceneFeedback>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ChainItem = {
  id: "evidence" | "belief" | "philosophy" | "strategy" | "trade";
  label: string;
  statement: string;
};

const CHAIN: ChainItem[] = [
  {
    id: "evidence",
    label: "Evidence",
    statement:
      "Some stocks continue adjusting after unexpectedly strong earnings, even after risk and costs are considered.",
  },
  {
    id: "belief",
    label: "Market belief",
    statement:
      "Investors sometimes incorporate important new information into expectations gradually.",
  },
  {
    id: "philosophy",
    label: "Investment philosophy",
    statement:
      "Market underreaction can create temporary opportunities after important announcements.",
  },
  {
    id: "strategy",
    label: "Investment strategy",
    statement:
      "Investigate positive earnings surprises when cash-flow expectations changed more than the price.",
  },
  {
    id: "trade",
    label: "Individual trade",
    statement:
      "Buy a 2% Arclight position after the thesis and portfolio-risk checks pass.",
  },
];

const SHUFFLED_CHAIN = [CHAIN[3], CHAIN[0], CHAIN[4], CHAIN[2], CHAIN[1]];

function ReasoningChainScene({ onComplete }: SceneProps) {
  const [placed, setPlaced] = useState<ChainItem["id"][]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const finished = placed.length === CHAIN.length;
  const expected = CHAIN[placed.length];

  const place = (item: ChainItem) => {
    if (finished || placed.includes(item.id)) return;
    if (item.id !== expected.id) {
      setMessage(
        `That card belongs to ${item.label.toLowerCase()}. The chain needs ${expected.label.toLowerCase()} next.`,
      );
      return;
    }
    const next = [...placed, item.id];
    setPlaced(next);
    setMessage(
      next.length === CHAIN.length
        ? "The reasoning is complete. Every trade can now be traced back to evidence."
        : `${item.label} is in place. Now find ${CHAIN[next.length].label.toLowerCase()}.`,
    );
    if (next.length === CHAIN.length) onComplete();
  };

  return (
    <div>
      <ScenePrompt>
        Maya’s notes were shuffled before the committee meeting. Build the
        reasoning from evidence to action.
      </ScenePrompt>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        {/* Titles the five-step chain below it, so it is a heading, not a
            label on a single value. */}
        <h3 className="ops-body-strong text-[15px] text-white">
          Decision chain · choose the next card
        </h3>
        <ol className="mt-4 space-y-2">
          {CHAIN.map((slot, index) => {
            const filled = placed[index] === slot.id;
            const current = index === placed.length;
            return (
              <li
                key={slot.id}
                className={cn(
                  "rounded-xl border px-4 py-3 transition-colors",
                  filled
                    ? "border-accent-green/35 bg-accent-green/[0.05]"
                    : current
                      ? "border-accent-amber/45 bg-accent-amber/[0.05]"
                      : "border-white/10 bg-transparent",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[12px] tabular-nums",
                      filled
                        ? "border-accent-green/40 text-accent-green"
                        : current
                          ? "border-accent-amber/40 text-accent-amber"
                          : "border-white/10 text-slate-500",
                    )}
                  >
                    {filled ? "✓" : index + 1}
                  </span>
                  <div>
                    <div className="ops-body-strong text-[14px] text-white">
                      {filled ? slot.label : current ? `Find: ${slot.label}` : "Locked"}
                    </div>
                    {filled && (
                      <p className="ops-body mt-1 text-[14px] text-slate-300">
                        {slot.statement}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {!finished && (
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SHUFFLED_CHAIN.filter((item) => !placed.includes(item.id)).map(
            (item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => place(item)}
                className="rounded-xl border border-white/15 bg-white/[0.02] px-4 py-3 text-left transition-colors hover:border-accent-amber/50 hover:bg-accent-amber/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40"
              >
                <span className="ops-body text-[14px] text-slate-200">
                  {item.statement}
                </span>
              </button>
            ),
          )}
        </div>
      )}

      {message && (
        <SceneFeedback correct={finished || placed.length > 0} neutral={!finished}>
          {message}
        </SceneFeedback>
      )}
    </div>
  );
}

type Category = "Market belief" | "Investment philosophy" | "Investment strategy" | "Individual trade";

const CATEGORIES: Category[] = [
  "Market belief",
  "Investment philosophy",
  "Investment strategy",
  "Individual trade",
];

const CLASSIFICATION_CASES: {
  statement: string;
  answer: Category;
  feedback: string;
}[] = [
  {
    statement:
      "Investors often extrapolate recent growth too far into the future.",
    answer: "Market belief",
    feedback:
      "This is a claim about investor behavior. It does not yet identify the resulting opportunity or a method for acting on it.",
  },
  {
    statement:
      "When investors extrapolate temporary deterioration, prices can fall below long-term value and later normalize.",
    answer: "Investment philosophy",
    feedback:
      "This connects a behavioral mistake to a pricing opportunity and explains how a return may arise.",
  },
  {
    statement:
      "Each year, investigate the ten lowest-P/E companies in every industry and reject firms with deteriorating cash flows.",
    answer: "Investment strategy",
    feedback:
      "This is a repeatable selection method. It still relies on a philosophy explaining why the screen can reveal mispricing.",
  },
  {
    statement:
      "Reduce Arclight from 4% to 2% after its largest customer cancels a contract.",
    answer: "Individual trade",
    feedback:
      "This is one portfolio action. Its quality depends on the thesis and position-sizing rules that came before it.",
  },
];

function ClassificationScene({ onComplete }: SceneProps) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<Category | null>(null);
  const solved = choice === CLASSIFICATION_CASES[caseIndex].answer;
  const current = CLASSIFICATION_CASES[caseIndex];

  const choose = (category: Category) => {
    setChoice(category);
    if (category === current.answer && caseIndex === CLASSIFICATION_CASES.length - 1) {
      onComplete();
    }
  };

  const next = () => {
    setCaseIndex((index) => index + 1);
    setChoice(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <ScenePrompt>
          Decide what the statement does—not whether you personally agree with it.
        </ScenePrompt>
        <span className="font-sans text-sm tabular-nums text-slate-500">
          {caseIndex + 1}/{CLASSIFICATION_CASES.length}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="ops-caption text-[12px] text-accent-amber">Statement</div>
        <p className="ops-body-strong mt-2 text-lg text-white">
          {current.statement}
        </p>
      </div>

      <QuestionBlock question="Which layer is this?">
        <ChoiceGrid>
          {CATEGORIES.map((category) => (
            <ChoiceButton
              key={category}
              selected={choice === category}
              correct={solved && choice === category}
              incorrect={choice === category && !solved}
              disabled={solved}
              onClick={() => choose(category)}
            >
              {category}
            </ChoiceButton>
          ))}
        </ChoiceGrid>
      </QuestionBlock>

      {choice && (
        <SceneFeedback correct={solved}>
          {solved
            ? current.feedback
            : `Not quite. ${choice} has a different job in the chain. Re-read what this statement actually explains, then choose again.`}
        </SceneFeedback>
      )}

      {solved && caseIndex < CLASSIFICATION_CASES.length - 1 && (
        <button
          type="button"
          onClick={next}
          className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
        >
          Next case →
        </button>
      )}
    </div>
  );
}

const DIAGNOSIS_STAGES = [
  {
    label: "First question",
    prompt:
      "Maya's strategy has trailed the market for 18 months. What should the committee do first?",
    choices: [
      "Switch to the best-performing strategy immediately.",
      "Keep the strategy forever because philosophies should never change.",
      "Check whether the market belief, evidence, or implementation changed.",
    ],
    answer: 2,
    feedback:
      "Underperformance alone cannot identify the failure. The committee must separate belief, strategy, implementation, and ordinary variation.",
    record: "Question asked: What changed?",
  },
  {
    label: "Evidence review",
    prompt:
      "Independent studies still find post-announcement drift after costs, but Maya has started buying before earnings announcements. What failed?",
    choices: [
      "The underreaction belief was disproved.",
      "Implementation drifted away from the stated strategy.",
      "Nothing failed because the historical evidence still exists.",
    ],
    answer: 1,
    feedback:
      "Buying before an announcement depends on forecasting the surprise. That is a different claim from reacting to confirmed information.",
    record: "Finding: Implementation drift",
  },
  {
    label: "Committee decision",
    prompt: "Which response follows from that diagnosis?",
    choices: [
      "Restore the after-announcement rule, document it, and monitor new evidence.",
      "Replace the philosophy with momentum because it performed best recently.",
      "Ignore realized results because only theory matters.",
    ],
    answer: 0,
    feedback:
      "The response repairs the process without pretending that evidence or realized results are irrelevant.",
    record: "Action: Restore the rule and monitor",
  },
] as const;

function DiagnosisScene({ onComplete }: SceneProps) {
  const [stage, setStage] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [record, setRecord] = useState<string[]>([]);
  const current = DIAGNOSIS_STAGES[stage];
  const solved = choice === current.answer;

  const choose = (index: number) => {
    setChoice(index);
    if (index === current.answer && !record.includes(current.record)) {
      setRecord((items) => [...items, current.record]);
      if (stage === DIAGNOSIS_STAGES.length - 1) onComplete();
    }
  };

  const next = () => {
    setStage((index) => index + 1);
    setChoice(null);
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
      <div>
        <div className="rounded-2xl border border-accent-red/20 bg-accent-red/[0.04] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="ops-caption text-[12px] text-accent-red">
              Strategy review · Month 18
            </div>
            <span className="rounded-full border border-accent-red/30 px-2.5 py-1 font-sans text-[12px] tabular-nums text-accent-red">
              −7.4% vs benchmark
            </span>
          </div>
          <p className="ops-body mt-3 text-[14px] text-slate-300">
            The return is real. The cause is still unknown. Your committee must
            decide what to investigate before changing course.
          </p>
        </div>

        <QuestionBlock question={current.prompt} label={current.label}>
          <div className="space-y-2">
            {current.choices.map((option, index) => (
              <ChoiceButton
                key={option}
                selected={choice === index}
                correct={solved && choice === index}
                incorrect={choice === index && !solved}
                disabled={solved}
                onClick={() => choose(index)}
              >
                {option}
              </ChoiceButton>
            ))}
          </div>
        </QuestionBlock>

        {choice !== null && (
          <SceneFeedback correct={solved}>
            {solved
              ? current.feedback
              : "That response jumps to a conclusion before locating the failure. Use the philosophy to decide what evidence must be checked first."}
          </SceneFeedback>
        )}

        {solved && stage < DIAGNOSIS_STAGES.length - 1 && (
          <button
            type="button"
            onClick={next}
            className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
          >
            Continue the review →
          </button>
        )}
      </div>

      <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        {/* Titles the record's rows below it. */}
        <h3 className="ops-body-strong text-[15px] text-white">Decision record</h3>
        <ol className="mt-3 space-y-3">
          {DIAGNOSIS_STAGES.map((item, index) => {
            const resolved = Boolean(record[index]);
            return (
              <li key={item.label} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-sans text-[12px]",
                    resolved
                      ? "border-accent-green/40 text-accent-green"
                      : index === stage
                        ? "border-accent-amber/40 text-accent-amber"
                        : "border-white/10 text-slate-500",
                  )}
                >
                  {resolved ? "✓" : index + 1}
                </span>
                <div>
                  <div className="ops-body-strong text-[12px] text-white">
                    {item.label}
                  </div>
                  <div className="ops-body mt-1 text-[12px] text-slate-400">
                    {resolved ? record[index] : index === stage ? "Awaiting your decision" : "Locked"}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}

const HYPOTHESIS_PROMPTS = [
  {
    key: "belief" as const,
    label: "What do you currently believe about markets or investor behavior?",
    hint: "State a claim that could be true or false—not a screen or a trade.",
    placeholder:
      "Investors sometimes revise long-term expectations too slowly after important new information.",
  },
  {
    key: "persistence" as const,
    label: "Why might the opportunity persist?",
    hint: "Consider risk, uncertainty, costs, competition, or institutional limits.",
    placeholder:
      "The signal is uncertain and can underperform long enough to drive investors away.",
  },
  {
    key: "rejection" as const,
    label: "What evidence would make you change your mind?",
    hint: "Name a result that would weaken the belief—not merely one losing trade.",
    placeholder:
      "The pattern disappears out of sample after realistic risk and trading costs.",
  },
] as const;

type HypothesisAnswers = {
  belief: string;
  persistence: string;
  rejection: string;
};

function HypothesisScene({ onComplete }: SceneProps) {
  const { draft, saveDraft } = useIFProgress();
  const [answers, setAnswers] = useState<HypothesisAnswers>({
    belief: "",
    persistence: "",
    rejection: "",
  });
  const [promptIndex, setPromptIndex] = useState(0);
  const [locked, setLocked] = useState([false, false, false]);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAnswers({
      belief: draft.marketBelief,
      persistence: draft.persistenceReason,
      rejection: draft.evidenceGap,
    });
    setLoaded(true);
  }, [draft]);

  const current = HYPOTHESIS_PROMPTS[promptIndex];
  const value = answers[current.key];
  const allLocked = locked.every(Boolean);
  const summary = `I currently believe ${answers.belief || "[state a market belief]"}. The opportunity may persist because ${answers.persistence || "[explain why it may persist]"}. I would weaken or reject this belief if ${answers.rejection || "[name disconfirming evidence]"}.`;

  const lockAnswer = () => {
    if (value.trim().length < 20) return;
    setLocked((items) =>
      items.map((item, index) => (index === promptIndex ? true : item)),
    );
    if (promptIndex < HYPOTHESIS_PROMPTS.length - 1) {
      setPromptIndex((index) => index + 1);
    }
  };

  const editAnswer = (index: number) => {
    setPromptIndex(index);
    setLocked((items) => items.map((item, itemIndex) => itemIndex < index && item));
    setSaved(false);
  };

  const save = () => {
    saveDraft({
      ...draft,
      marketBelief: answers.belief.trim(),
      persistenceReason: answers.persistence.trim(),
      evidenceGap: answers.rejection.trim(),
      generatedSummary: summary,
    });
    setSaved(true);
    onComplete();
  };

  if (!loaded) return null;

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {HYPOTHESIS_PROMPTS.map((prompt, index) => (
          <button
            key={prompt.key}
            type="button"
            disabled={index > promptIndex && !locked[index - 1]}
            onClick={() => locked[index] && editAnswer(index)}
            className={cn(
              "rounded-xl border px-3 py-3 text-left transition-colors",
              locked[index]
                ? "border-accent-green/35 bg-accent-green/[0.05]"
                : index === promptIndex
                  ? "border-accent-amber/40 bg-accent-amber/[0.05]"
                  : "border-white/10 text-slate-500",
            )}
          >
            <span className="flex items-center gap-2">
              <span className="font-sans text-[12px] tabular-nums text-accent-amber">
                {locked[index] ? "✓" : index + 1}
              </span>
              <span className="ops-body-strong text-[12px] text-white">
                {index === 0 ? "Belief" : index === 1 ? "Persistence" : "Disproof"}
              </span>
            </span>
          </button>
        ))}
      </div>

      {!allLocked && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
          <div className="ops-caption text-[12px] text-accent-amber">
            Prompt {promptIndex + 1} of {HYPOTHESIS_PROMPTS.length}
          </div>
          <label className="mt-2 block">
            <span className="ops-body-strong text-[17px] text-white">
              {current.label}
            </span>
            <span className="ops-body mt-2 block text-[14px] text-slate-400">
              {current.hint}
            </span>
            <textarea
              value={value}
              onChange={(event) => {
                setAnswers((currentAnswers) => ({
                  ...currentAnswers,
                  [current.key]: event.target.value,
                }));
                setSaved(false);
              }}
              rows={4}
              placeholder={current.placeholder}
              className="ops-body mt-4 w-full resize-y rounded-xl border border-white/15 bg-ink-950/40 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-amber/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/30"
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={lockAnswer}
              disabled={value.trim().length < 20}
              className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {promptIndex === HYPOTHESIS_PROMPTS.length - 1
                ? "Build my hypothesis"
                : "Lock answer and continue"} →
            </button>
            <span className="ops-body text-[12px] text-slate-500">
              {Math.max(0, 20 - value.trim().length)} more characters recommended
            </span>
          </div>
        </div>
      )}

      {allLocked && (
        <div className="mt-5 rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5 sm:p-6">
          <div className="ops-caption text-[12px] text-accent-amber">
            Working hypothesis 0.1
          </div>
          <p className="ops-body mt-3 text-[16px] leading-relaxed text-slate-100">
            {summary}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saved}
              className="rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-sm font-semibold text-accent-green hover:bg-accent-green/20 disabled:cursor-default disabled:opacity-70"
            >
              {saved ? "Saved to this browser ✓" : "Save hypothesis and continue →"}
            </button>
            <button
              type="button"
              onClick={() => editAnswer(0)}
              disabled={saved}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:border-white/30 disabled:opacity-40"
            >
              Revise answers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const FINAL_QUESTIONS = [
  {
    prompt:
      "Memo line: ‘Buy companies after strong earnings because the screen has worked recently.’ What is the deepest missing layer?",
    choices: [
      "A specific trade ticket",
      "A philosophy explaining why the signal should create a persistent opportunity",
      "A second valuation screen",
    ],
    answer: 1,
    feedback:
      "A strategy and recent performance do not explain why the opportunity exists or why it should survive competition and costs.",
  },
  {
    prompt:
      "The memo claims underreaction, but the portfolio buys before announcements. What should the reviewer conclude?",
    choices: [
      "The trades test a different belief from the one stated in the memo.",
      "The strategy is consistent because both approaches involve earnings.",
      "The belief is automatically false because the timing changed.",
    ],
    answer: 0,
    feedback:
      "Pre-announcement buying requires forecasting the news. Post-announcement underreaction begins only after confirmed information arrives.",
  },
  {
    prompt: "Which evidence would genuinely weaken the underreaction philosophy?",
    choices: [
      "One carefully selected stock loses money.",
      "Growth outperforms for one calendar year.",
      "The return pattern disappears out of sample after risk and realistic costs.",
    ],
    answer: 2,
    feedback:
      "A broad out-of-sample failure attacks the claimed pattern. A single trade or unrelated style return does not.",
  },
] as const;

function FinalChallengeScene({ onComplete }: SceneProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [audit, setAudit] = useState<string[]>([]);
  const current = FINAL_QUESTIONS[questionIndex];
  const solved = choice === current.answer;

  const choose = (index: number) => {
    setChoice(index);
    if (index === current.answer && audit.length === questionIndex) {
      const nextAudit = [...audit, current.feedback];
      setAudit(nextAudit);
      if (questionIndex === FINAL_QUESTIONS.length - 1) onComplete();
    }
  };

  const next = () => {
    setQuestionIndex((index) => index + 1);
    setChoice(null);
  };

  const finished = audit.length === FINAL_QUESTIONS.length;

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="ops-caption text-[12px] text-slate-500">
              Arclight committee memo
            </div>
            <div className="ops-body-strong mt-1 text-[15px] text-white">
              Logic audit · three findings required
            </div>
          </div>
          <div className="flex gap-2">
            {FINAL_QUESTIONS.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border font-sans text-[12px]",
                  audit[index]
                    ? "border-accent-green/40 bg-accent-green/10 text-accent-green"
                    : index === questionIndex
                      ? "border-accent-amber/40 text-accent-amber"
                      : "border-white/10 text-slate-500",
                )}
              >
                {audit[index] ? "✓" : index + 1}
              </span>
            ))}
          </div>
        </div>
      </div>

      {!finished && (
        <>
          <QuestionBlock question={current.prompt} label={`Finding ${questionIndex + 1}`}>
            <div className="space-y-2">
              {current.choices.map((option, index) => (
                <ChoiceButton
                  key={option}
                  selected={choice === index}
                  correct={solved && choice === index}
                  incorrect={choice === index && !solved}
                  disabled={solved}
                  onClick={() => choose(index)}
                >
                  {option}
                </ChoiceButton>
              ))}
            </div>
          </QuestionBlock>

          {choice !== null && (
            <SceneFeedback correct={solved}>
              {solved
                ? current.feedback
                : "That answer reacts to the result or adds another rule without repairing the memo's logic. Try again."}
            </SceneFeedback>
          )}

          {solved && questionIndex < FINAL_QUESTIONS.length - 1 && (
            <button
              type="button"
              onClick={next}
              className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-5 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
            >
              Audit the next line →
            </button>
          )}
        </>
      )}

      {finished && (
        <div className="mt-5 rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-accent-green/40 text-accent-green">
              ✓
            </span>
            <div>
              <div className="ops-caption text-[12px] text-accent-green">
                Lesson complete
              </div>
              <h3 className="ops-interactive-title mt-1 text-xl">
                You audited the reasoning, not the outcome.
              </h3>
              <p className="ops-body mt-2 text-[14px] text-slate-300">
                You can now separate a market belief, a philosophy, a strategy,
                and a trade—and diagnose whether poor results challenge the idea
                or its implementation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScenePrompt({ children }: { children: ReactNode }) {
  return (
    <p className="ops-body max-w-3xl text-[16px] text-slate-200">{children}</p>
  );
}

function QuestionBlock({
  question,
  label = "Your decision",
  children,
}: {
  question: string;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-5">
      <div className="ops-caption text-[12px] text-accent-amber">{label}</div>
      <p className="ops-body-strong mt-2 text-[17px] text-white">{question}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{children}</div>;
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
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/40 disabled:cursor-default",
        correct
          ? "border-accent-green/50 bg-accent-green/[0.08] text-accent-green"
          : incorrect
            ? "border-accent-red/50 bg-accent-red/[0.06] text-accent-red"
            : selected
              ? "border-accent-amber/50 bg-accent-amber/[0.06] text-white"
              : "border-white/15 bg-white/[0.02] text-slate-200 hover:border-accent-amber/50 hover:bg-accent-amber/[0.04]",
      )}
    >
      {children}
    </button>
  );
}

function SceneFeedback({
  correct,
  neutral = false,
  children,
}: {
  correct: boolean;
  neutral?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "mt-4 rounded-xl border px-4 py-3",
        neutral
          ? "border-accent-amber/25 bg-accent-amber/[0.04]"
          : correct
            ? "border-accent-green/25 bg-accent-green/[0.05]"
            : "border-accent-red/25 bg-accent-red/[0.04]",
      )}
    >
      <div
        className={cn(
          "ops-caption text-[12px]",
          neutral
            ? "text-accent-amber"
            : correct
              ? "text-accent-green"
              : "text-accent-red",
        )}
      >
        {neutral ? "Guide" : correct ? "Correct" : "Revise your answer"}
      </div>
      <p className="ops-body mt-1.5 text-[14px] text-slate-300">{children}</p>
    </div>
  );
}
