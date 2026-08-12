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

const LESSON_SLUG = "if-1-3-comparing-investment-philosophy-families";

const STEPS = [
  {
    label: "Survey",
    title: "Six explanations for predictable price moves",
    guide:
      "An investment philosophy explains why an investor expects a future price move to be predictable. Open each file to learn the explanation used by that family.",
    instruction: "Inspect all six family files, then answer the comparison checkpoint.",
    next: "Decode the price mechanisms",
  },
  {
    label: "Decode",
    title: "Decode the economic mechanism",
    guide:
      "Read the cause each investor gives for a predictable price move, then match that cause to its philosophy family.",
    instruction: "Identify the philosophy family behind all four claims.",
    next: "Investigate one company",
  },
  {
    label: "Lens",
    title: "One company, four research lenses",
    guide:
      "Different families can study the same company while prioritizing different evidence. Your task is to preserve each lens’s logic.",
    instruction: "Choose the evidence each research lens would examine first.",
    next: "Stress-test the edges",
  },
  {
    label: "Stress",
    title: "Find what can break each explanation",
    guide:
      "A philosophy becomes useful only when you know what can defeat it. Match every family with evidence that threatens its claimed edge.",
    instruction: "Find the material failure test for all six families.",
    next: "Map the operating coordinates",
  },
  {
    label: "Map",
    title: "Compare how the families operate",
    guide:
      "Stage, investor involvement, and time horizon show where a philosophy enters portfolio decisions and how long its mechanism may take.",
    instruction: "Map all three philosophy profiles to their operating coordinates.",
    next: "Build a research shortlist",
  },
  {
    label: "Shortlist",
    title: "Choose what deserves more research",
    guide:
      "Save one or two families as provisional research candidates and commit to an evidence standard before Lesson 1.4 tests investor fit.",
    instruction: "Choose a shortlist, validate the evidence rules, and save the research card.",
    next: "Return to the course",
  },
] as const;

type SceneProps = { onComplete: () => void };

export default function FamilyJourney() {
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
      aria-label="Guided Lesson 1.3 journey"
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
                  <FamilySurveyScene onComplete={() => completeStep(0)} />
                )}
                {activeStep === 1 && (
                  <ClaimDecodeScene onComplete={() => completeStep(1)} />
                )}
                {activeStep === 2 && (
                  <CompanyLensScene onComplete={() => completeStep(2)} />
                )}
                {activeStep === 3 && (
                  <StressTestScene onComplete={() => completeStep(3)} />
                )}
                {activeStep === 4 && (
                  <CoordinateScene onComplete={() => completeStep(4)} />
                )}
                {activeStep === 5 && (
                  <ShortlistScene
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
                href="/lessons/if-1-4-when-a-philosophy-fits-the-investor"
                className="order-3 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2 text-center text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20"
              >
                Enter Lesson 1.4 →
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="order-3 rounded-full border border-white/10 px-5 py-2 text-sm text-slate-500"
              >
                Save the research card to finish
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
            ? `Good. You completed ${current.label.toLowerCase()}. The next decision builds directly on this comparison.`
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
      <circle cx="6" cy="7" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18" cy="7" r="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="17" r="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m7.7 8.1 3.1 6.7m5.5-6.7-3.1 6.7M8 7h8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

type FamilyId =
  | "timing"
  | "value"
  | "growth"
  | "momentum"
  | "information"
  | "arbitrage";

type Family = {
  id: FamilyId;
  name: string;
  claim: string;
  stage: string;
  evidence: string;
  challenge: string;
};

const FAMILIES: Family[] = [
  {
    id: "timing",
    name: "Market timing",
    claim: "Rates, growth, liquidity, and investor sentiment can push broad markets to prices that imply unusually strong or weak future returns.",
    stage: "Asset allocation",
    evidence: "Valuation spreads, rates, inflation, growth, liquidity, or sentiment across markets.",
    challenge: "Direction is not enough; timing, magnitude, implementation, and the cost of being out can erase the call.",
  },
  {
    id: "value",
    name: "Value investing",
    claim: "Investors can overreact to temporary problems, pushing a security's price below a conservative estimate of its long-term cash-flow value.",
    stage: "Security selection",
    evidence: "Cash-flow valuation, normalized earnings, asset values, financial strength, and a possible correction mechanism.",
    challenge: "A low price can reflect permanent deterioration, hidden risk, or an estimate of value that is simply wrong.",
  },
  {
    id: "growth",
    name: "Growth investing",
    claim: "Investors can underestimate how long a company can reinvest at high returns, leaving too little future growth embedded in its price.",
    stage: "Security selection",
    evidence: "Reinvestment runway, unit economics, margins, market share, competitive advantage, and embedded expectations.",
    challenge: "An exceptional company can still be a poor investment when exceptional growth is already priced in.",
  },
  {
    id: "momentum",
    name: "Momentum & technical",
    claim: "Information and investor behavior can adjust gradually, allowing a price trend to persist long enough to measure and trade.",
    stage: "Selection and execution",
    evidence: "Relative strength, trend persistence, volume, breadth, and behavior after costs.",
    challenge: "Patterns can be accidental, crowded, unstable after discovery, or too expensive to trade.",
  },
  {
    id: "information",
    name: "Information-based",
    claim: "A differentiated interpretation of legal public information can reveal a cash-flow change before consensus estimates and prices fully adjust.",
    stage: "Selection and execution",
    evidence: "Filings, guidance, revisions, industry data, and a differentiated interpretation of their implications.",
    challenge: "The information may already be priced, the interpretation may not be different, and legal boundaries are absolute.",
  },
  {
    id: "arbitrage",
    name: "Relative-value arbitrage",
    claim: "Funding, trading, or institutional constraints can push linked assets to inconsistent prices until a convergence mechanism brings them together.",
    stage: "Execution",
    evidence: "Replicating cash flows, price relationships, catalysts, borrow availability, funding, and convergence mechanics.",
    challenge: "Basis risk, shorting limits, financing pressure, and uncertain convergence can turn an apparent arbitrage into a risky trade.",
  },
];

function FamilySurveyScene({ onComplete }: SceneProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const family = FAMILIES[active];
  const allStudied = furthest === FAMILIES.length - 1;
  const correct = choice === "claim";

  const choose = (id: string) => {
    setChoice(id);
    if (id === "claim") onComplete();
  };

  return (
    <div>
      <DefinitionPanel
        label="Concept first"
        title="What makes a philosophy family?"
        definition="An investment philosophy explains why an investor expects a future price move to be predictable. Philosophies belong to the same family when they rely on the same explanation. That shared explanation is the family's proposed edge."
      />

      <div className="mt-5 rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5 sm:p-6">
        <div className="ops-caption text-[12px] text-accent-cyan">
          Worked example · Value investing
        </div>
        <h3 className="ops-interactive-title mt-2 text-xl text-white sm:text-2xl">
          How a price gap becomes an investment opportunity
        </h3>
        <p className="ops-body mt-3 max-w-3xl text-[15px] leading-7 text-slate-200">
          A company reports weak earnings after a temporary factory shutdown.
          Worried investors sell the shares down to $40. A conservative
          cash-flow analysis estimates that the recovered business is worth
          $60 per share.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ["Market price", "$40", "The price available to buyers today."],
            ["Estimated value", "$60", "A cash-flow estimate that the research must test."],
            ["Price gap", "$20", "The difference the value investor is investigating."],
          ].map(([label, value, detail]) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="ops-caption text-[12px] text-slate-400">
                {label}
              </div>
              <div className="ops-interactive-title mt-1 text-2xl text-white">
                {value}
              </div>
              <p className="ops-body mt-2 text-[12px] leading-5 text-slate-400">
                {detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-4">
            <div className="ops-caption text-[12px] text-accent-amber">
              Proposed cause
            </div>
            <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
              Investors treated a temporary earnings decline as permanent
              damage and sold the shares too aggressively.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-4">
            <div className="ops-caption text-[12px] text-accent-green">
              Expected closing condition
            </div>
            <p className="ops-body mt-2 text-[14px] leading-6 text-slate-200">
              The factory reopens, cash flows recover, and later results lead
              market participants to revise the price toward estimated value.
            </p>
          </div>
        </div>

        <p className="ops-definition mt-4 border-t border-white/10 pt-4 text-[15px] leading-7 text-slate-100">
          In this lesson, an <strong>investment opportunity</strong> is a
          measurable price gap or price pattern with a proposed cause and a
          future condition that could close or continue it.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-6 gap-1.5" aria-label="Family files">
        {FAMILIES.map((item, index) => (
          <button
            key={item.id}
            type="button"
            disabled={index > furthest}
            onClick={() => setActive(index)}
            aria-label={`${item.name}${active === index ? ", current" : ""}`}
            className={cn(
              "h-2 rounded-full transition-colors disabled:cursor-not-allowed",
              index < furthest
                ? "bg-accent-green"
                : index === active
                  ? "bg-accent-amber"
                  : index <= furthest
                    ? "bg-white/30"
                    : "bg-white/[0.08]",
            )}
          />
        ))}
      </div>

      {/* No mode="wait"/exit: under reactStrictMode the exit never fires, which
          would pin the learner on the first family file and block completion. */}
      <AnimatePresence initial={false}>
        <motion.article
          key={family.id}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="ops-caption text-[12px] text-accent-amber">
                Family {active + 1} of {FAMILIES.length}
              </div>
              <h3 className="ops-interactive-title mt-2 text-xl text-white sm:text-2xl">
                {family.name}
              </h3>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[12px] text-slate-400">
              {family.stage}
            </span>
          </div>

          <ResearchRow label="Why it expects a price move" value={family.claim} />
          <ResearchRow label="Evidence it watches" value={family.evidence} />
          <ResearchRow label="Must survive" value={family.challenge} warning />

          {active < FAMILIES.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                const next = active + 1;
                setActive(next);
                setFurthest((current) => Math.max(current, next));
              }}
              className="mt-5 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
            >
              Open next family file →
            </button>
          ) : (
            <div className="mt-5 text-[14px] font-medium text-accent-green">
              ✓ All six family files reviewed
            </div>
          )}
        </motion.article>
      </AnimatePresence>

      {allStudied && (
        <QuestionBlock question="What underlying cause best distinguishes these philosophy families?">
          <ChoiceGrid>
            <ChoiceButton selected={choice === "claim"} correct={correct} disabled={correct} onClick={() => choose("claim")}>
              Identify the market behavior, mistake, or constraint that produces a predictable price move.
            </ChoiceButton>
            <ChoiceButton selected={choice === "return"} incorrect={choice === "return"} disabled={correct} onClick={() => choose("return")}>
              Rank the families by whichever produced the highest return last year.
            </ChoiceButton>
            <ChoiceButton selected={choice === "tool"} incorrect={choice === "tool"} disabled={correct} onClick={() => choose("tool")}>
              Classify them only by whether they use charts, valuation models, or filings.
            </ChoiceButton>
          </ChoiceGrid>
        </QuestionBlock>
      )}

      {allStudied && choice && (
        <SceneFeedback correct={correct}>
          {correct
            ? "Correct. That cause explains why the price pattern appears and why this family expects it to continue or close."
            : "That feature describes a tool or an outcome. Return to the cause each family gives for the expected price move."}
        </SceneFeedback>
      )}
    </div>
  );
}

const DECODE_CASES: {
  claim: string;
  answer: FamilyId;
  feedback: string;
}[] = [
  {
    claim: "Reduce broad equity exposure when market valuations and risk premiums imply unusually weak prospective returns.",
    answer: "timing",
    feedback: "The claim changes broad market exposure, making this market timing rather than security selection.",
  },
  {
    claim: "Buy financially resilient firms only when their price is below a conservative estimate of normalized cash-flow value.",
    answer: "value",
    feedback: "The claimed edge is a gap between price and estimated value.",
  },
  {
    claim: "Use new segment disclosures in a public filing to identify a margin improvement the market has not understood.",
    answer: "information",
    feedback: "The edge depends on interpreting legal public information differently from the market.",
  },
  {
    claim: "Buy one linked security and short another when their prices imply inconsistent cash flows and convergence remains financeable.",
    answer: "arbitrage",
    feedback: "The claim is an inconsistent relative price between economically linked assets.",
  },
];

function ClaimDecodeScene({ onComplete }: SceneProps) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<FamilyId | null>(null);
  const current = DECODE_CASES[caseIndex];
  const solved = choice === current.answer;

  const choose = (family: FamilyId) => {
    setChoice(family);
    if (family === current.answer && caseIndex === DECODE_CASES.length - 1) {
      onComplete();
    }
  };

  return (
    <SequentialCard
      eyebrow={`Claim ${caseIndex + 1} of ${DECODE_CASES.length}`}
      prompt={current.claim}
      feedback={choice ? current.feedback : null}
      correct={solved}
      next={
        solved && caseIndex < DECODE_CASES.length - 1
          ? () => {
              setCaseIndex((index) => index + 1);
              setChoice(null);
            }
          : undefined
      }
      nextLabel="Decode the next claim"
    >
      <ChoiceGrid columns={2}>
        {FAMILIES.map((family) => (
          <ChoiceButton
            key={family.id}
            selected={choice === family.id}
            correct={solved && family.id === current.answer}
            incorrect={choice === family.id && !solved}
            disabled={solved}
            onClick={() => choose(family.id)}
          >
            {family.name}
          </ChoiceButton>
        ))}
      </ChoiceGrid>
    </SequentialCard>
  );
}

const COMPANY_LENSES = [
  {
    family: "Value investing",
    prompt: "Which NovaGrid finding belongs first in a value-investing file?",
    options: [
      { id: "value", text: "The shares trade below a conservative cash-flow valuation even after normalizing margins.", correct: true },
      { id: "growth", text: "Revenue has grown 28% and the addressable market is expanding.", correct: false },
      { id: "momentum", text: "The stock has outperformed its sector for six months on rising volume.", correct: false },
    ],
    feedback: "Value starts with a defensible gap between price and estimated value, then asks why that gap exists.",
  },
  {
    family: "Growth investing",
    prompt: "Which finding belongs first in a growth-investing file?",
    options: [
      { id: "multiple", text: "The valuation multiple is below the sector median.", correct: false },
      { id: "growth", text: "Unit economics and reinvestment capacity support growth above the rate embedded in the price.", correct: true },
      { id: "trend", text: "The 50-day moving average crossed above the 200-day average.", correct: false },
    ],
    feedback: "Growth investing compares the value and durability of future growth with the expectations already in the price.",
  },
  {
    family: "Momentum & technical",
    prompt: "Which finding belongs first in a momentum research file?",
    options: [
      { id: "trend", text: "Relative strength, breadth, and volume show a persistent trend after estimated trading costs.", correct: true },
      { id: "assets", text: "Replacement value of the company’s assets exceeds enterprise value.", correct: false },
      { id: "filing", text: "A footnote reveals an underappreciated segment margin.", correct: false },
    ],
    feedback: "Momentum examines whether price behavior itself contains a persistent, executable signal.",
  },
  {
    family: "Information-based",
    prompt: "Which finding belongs first in an information-based research file?",
    options: [
      { id: "filing", text: "A new public segment disclosure changes the cash-flow interpretation before consensus estimates adjust.", correct: true },
      { id: "cheap", text: "The stock has the lowest price-to-book ratio in its sector.", correct: false },
      { id: "market", text: "Broad equity valuations are above their historical median.", correct: false },
    ],
    feedback: "The claimed advantage is a differentiated, lawful interpretation of public information and its valuation consequences.",
  },
] as const;

function CompanyLensScene({ onComplete }: SceneProps) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = COMPANY_LENSES[caseIndex];
  const selected = current.options.find((option) => option.id === choice);
  const solved = Boolean(selected?.correct);

  const choose = (id: string, correct: boolean) => {
    setChoice(id);
    if (correct && caseIndex === COMPANY_LENSES.length - 1) onComplete();
  };

  return (
    <div>
      <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-5">
        <div className="ops-caption text-[12px] text-accent-amber">
          Shared company file · NovaGrid
        </div>
        <p className="ops-body mt-2 text-[15px] text-slate-200">
          Every analyst sees the same company and legal public information. The
          philosophy determines which question they investigate first.
        </p>
      </div>

      <SequentialCard
        eyebrow={`Lens ${caseIndex + 1} of ${COMPANY_LENSES.length} · ${current.family}`}
        prompt={current.prompt}
        feedback={choice ? current.feedback : null}
        correct={solved}
        next={
          solved && caseIndex < COMPANY_LENSES.length - 1
            ? () => {
                setCaseIndex((index) => index + 1);
                setChoice(null);
              }
            : undefined
        }
        nextLabel="Switch research lens"
      >
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
      </SequentialCard>
    </div>
  );
}

const STRESS_CASES = [
  {
    family: "Market timing",
    prompt: "Which result most directly threatens the claimed timing edge?",
    options: [
      { id: "timing", text: "Signals predict direction weakly, but entry and exit timing costs more than the forecast adds.", correct: true },
      { id: "firm", text: "One selected company misses its quarterly revenue estimate.", correct: false },
      { id: "borrow", text: "Borrow for one linked security becomes expensive.", correct: false },
    ],
    feedback: "A timing philosophy must survive direction, timing, magnitude, and opportunity-cost tests at the allocation level.",
  },
  {
    family: "Value investing",
    prompt: "Which result most directly threatens the value claim?",
    options: [
      { id: "trap", text: "The apparent discount disappears after permanent cash-flow deterioration and hidden liabilities are included.", correct: true },
      { id: "trend", text: "The stock’s short-term relative strength weakens.", correct: false },
      { id: "index", text: "The broad market rises for one month.", correct: false },
    ],
    feedback: "A low price is not evidence of value when the estimate omitted deterioration or risk.",
  },
  {
    family: "Growth investing",
    prompt: "Which result most directly threatens the growth claim?",
    options: [
      { id: "priced", text: "The company grows rapidly, but the price had already assumed even faster growth and margins.", correct: true },
      { id: "cheap", text: "The price-to-book ratio remains below one.", correct: false },
      { id: "spread", text: "A linked instrument trades at a temporary basis difference.", correct: false },
    ],
    feedback: "Business growth creates an investment edge only when its value exceeds the expectations already priced in.",
  },
  {
    family: "Momentum & technical",
    prompt: "Which result most directly threatens the momentum claim?",
    options: [
      { id: "decay", text: "The pattern disappears out of sample and turnover consumes the remaining gross return.", correct: true },
      { id: "dcf", text: "A cash-flow model produces a wide valuation range.", correct: false },
      { id: "macro", text: "Inflation expectations change slowly.", correct: false },
    ],
    feedback: "A visible pattern is not an edge if it is unstable, accidental, or uneconomic after trading.",
  },
  {
    family: "Information-based",
    prompt: "Which result most directly threatens the information edge?",
    options: [
      { id: "priced", text: "Prices and consensus estimates adjust before the analysis can be completed and traded legally.", correct: true },
      { id: "multiple", text: "The company’s valuation multiple is above its historical median.", correct: false },
      { id: "horizon", text: "The investor prefers a long holding period.", correct: false },
    ],
    feedback: "Public information creates no edge when the interpretation is not differentiated or cannot be acted on before prices adjust.",
  },
  {
    family: "Relative-value arbitrage",
    prompt: "Which result most directly threatens the relative-value claim?",
    options: [
      { id: "basis", text: "The assets are not truly equivalent, convergence is uncertain, and funding pressure can force an early exit.", correct: true },
      { id: "growth", text: "Revenue growth is lower than the sector median.", correct: false },
      { id: "sentiment", text: "Consumer sentiment improves unexpectedly.", correct: false },
    ],
    feedback: "An apparent price inconsistency is not riskless when cash flows differ or the investor cannot finance the path to convergence.",
  },
] as const;

function StressTestScene({ onComplete }: SceneProps) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = STRESS_CASES[caseIndex];
  const selected = current.options.find((option) => option.id === choice);
  const solved = Boolean(selected?.correct);

  const choose = (id: string, correct: boolean) => {
    setChoice(id);
    if (correct && caseIndex === STRESS_CASES.length - 1) onComplete();
  };

  return (
    <SequentialCard
      eyebrow={`Stress test ${caseIndex + 1} of ${STRESS_CASES.length} · ${current.family}`}
      prompt={current.prompt}
      feedback={choice ? current.feedback : null}
      correct={solved}
      next={
        solved && caseIndex < STRESS_CASES.length - 1
          ? () => {
              setCaseIndex((index) => index + 1);
              setChoice(null);
            }
          : undefined
      }
      nextLabel="Stress-test the next family"
    >
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
    </SequentialCard>
  );
}

const COORDINATE_CASES = [
  {
    family: "Momentum",
    claim: "Use persistent relative-strength trends without attempting to change the company.",
    options: [
      { id: "correct", text: "Security selection · non-activist · typically short-to-medium horizon", correct: true },
      { id: "allocation", text: "Asset allocation · activist · long horizon", correct: false },
      { id: "execution", text: "Execution only · activist · no horizon", correct: false },
    ],
    feedback: "Momentum usually selects securities from price behavior, remains non-activist, and relies on a shorter correction window.",
  },
  {
    family: "Activist value",
    claim: "Buy an undervalued company and use ownership influence to create or accelerate the catalyst.",
    options: [
      { id: "timing", text: "Asset allocation · non-activist · short horizon", correct: false },
      { id: "correct", text: "Security selection · activist · typically medium-to-long horizon", correct: true },
      { id: "arbitrage", text: "Execution only · non-activist · intraday horizon", correct: false },
    ],
    feedback: "The edge is selected at the company level, the investor may influence the catalyst, and the change can require patience.",
  },
  {
    family: "Market timing",
    claim: "Change broad market exposure when macro and valuation conditions imply different prospective returns.",
    options: [
      { id: "correct", text: "Asset allocation · non-activist · horizon varies with the timing signal", correct: true },
      { id: "value", text: "Security selection · activist · fixed ten-year horizon", correct: false },
      { id: "filing", text: "Execution only · activist · one-day horizon", correct: false },
    ],
    feedback: "Timing acts on broad allocation, does not change underlying companies, and can range from frequent to infrequent decisions.",
  },
] as const;

function CoordinateScene({ onComplete }: SceneProps) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const current = COORDINATE_CASES[caseIndex];
  const selected = current.options.find((option) => option.id === choice);
  const solved = Boolean(selected?.correct);

  const choose = (id: string, correct: boolean) => {
    setChoice(id);
    if (correct && caseIndex === COORDINATE_CASES.length - 1) onComplete();
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DefinitionTile title="Decision stage" body="Where in the investment process the edge is claimed." />
        <DefinitionTile title="Involvement" body="Whether the investor waits for change or attempts to cause it." />
        <DefinitionTile
          title="Typical horizon"
          body="The usual time the proposed mechanism may need to produce evidence or a price response."
        />
      </div>

      <SequentialCard
        eyebrow={`Coordinate map ${caseIndex + 1} of ${COORDINATE_CASES.length} · ${current.family}`}
        prompt={current.claim}
        feedback={choice ? current.feedback : null}
        correct={solved}
        next={
          solved && caseIndex < COORDINATE_CASES.length - 1
            ? () => {
                setCaseIndex((index) => index + 1);
                setChoice(null);
              }
            : undefined
        }
        nextLabel="Map the next family"
      >
        <ChoiceGrid>
          {current.options.map((option) => (
            <ChoiceButton
              key={option.text}
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
      </SequentialCard>
    </div>
  );
}

const EVIDENCE_RULE =
  "Require evidence that survives an out-of-sample test after relevant risk, trading costs, taxes, and realistic implementation constraints.";
const RESEARCH_QUESTION =
  "What mechanism creates the opportunity, why can it persist, and what evidence would show that the claimed edge is absent?";

const SHORTLIST_OPTIONS = [
  ...FAMILIES.map((family) => family.name),
  "Passive baseline while evidence is incomplete",
];

function ShortlistScene({
  draft,
  saveDraft,
  onComplete,
}: SceneProps & {
  draft: PhilosophyDraft;
  saveDraft: (nextDraft: PhilosophyDraft) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [evidenceRule, setEvidenceRule] = useState<string | null>(null);
  const [researchQuestion, setResearchQuestion] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelected(draft.candidateFamilies.slice(0, 2));
    if (draft.familyEvidenceRule) setEvidenceRule(draft.familyEvidenceRule);
    if (draft.familyResearchQuestion)
      setResearchQuestion(draft.familyResearchQuestion);
  }, [
    draft.candidateFamilies,
    draft.familyEvidenceRule,
    draft.familyResearchQuestion,
  ]);

  const evidenceCorrect = evidenceRule === EVIDENCE_RULE;
  const questionCorrect = researchQuestion === RESEARCH_QUESTION;
  const ready = selected.length > 0 && evidenceCorrect && questionCorrect;

  const toggle = (family: string) => {
    setSaved(false);
    setSelected((current) => {
      if (current.includes(family)) return current.filter((item) => item !== family);
      if (current.length === 2) return current;
      return [...current, family];
    });
  };

  const save = () => {
    if (!ready) return;
    saveDraft({
      ...draft,
      candidateFamilies: selected,
      familyEvidenceRule: EVIDENCE_RULE,
      familyResearchQuestion: RESEARCH_QUESTION,
    });
    setSaved(true);
    onComplete();
  };

  return (
    <div>
      <DefinitionPanel
        label="Research status"
        title="Provisional research shortlist"
        definition="Choose only what deserves further investigation. A family remains provisional until its claimed mechanism, evidence, implementation, and investor fit survive later lessons."
      />

      <QuestionBlock question="Which one or two approaches should remain on your research desk?">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SHORTLIST_OPTIONS.map((family) => {
            const active = selected.includes(family);
            const atLimit = selected.length === 2 && !active;
            return (
              <button
                key={family}
                type="button"
                aria-pressed={active}
                disabled={atLimit}
                onClick={() => toggle(family)}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  active
                    ? "border-accent-amber/55 bg-accent-amber/[0.08] text-white"
                    : "border-white/10 bg-white/[0.02] text-slate-200 hover:border-white/25",
                )}
              >
                {family}
              </button>
            );
          })}
        </div>
        <p className="ops-body mt-2 text-[12px] text-slate-500">
          {selected.length}/2 selected. Choosing the passive baseline is valid when no active edge is yet defensible.
        </p>
      </QuestionBlock>

      {selected.length > 0 && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <QuestionBlock question="What evidence standard should every shortlisted family meet?" compact>
            <ChoiceGrid>
              {[EVIDENCE_RULE, "Require strong returns in the most recent calendar year.", "Require agreement from several well-known investors."].map((rule) => (
                <ChoiceButton
                  key={rule}
                  selected={evidenceRule === rule}
                  correct={evidenceRule === rule && rule === EVIDENCE_RULE}
                  incorrect={evidenceRule === rule && rule !== EVIDENCE_RULE}
                  disabled={evidenceCorrect}
                  onClick={() => setEvidenceRule(rule)}
                >
                  {rule}
                </ChoiceButton>
              ))}
            </ChoiceGrid>
          </QuestionBlock>
          {evidenceRule && (
            <SceneFeedback correct={evidenceCorrect}>
              {evidenceCorrect
                ? "Good. The test now asks whether the edge survives evidence, risk, and implementation—not whether it recently won."
                : "That is a popularity or recent-performance test. It does not establish a persistent, implementable edge."}
            </SceneFeedback>
          )}
        </div>
      )}

      {evidenceCorrect && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <QuestionBlock question="Which research question keeps the shortlist falsifiable?" compact>
            <ChoiceGrid>
              {[RESEARCH_QUESTION, "Which family currently has the most enthusiastic online following?", "Which family can be described without naming any evidence that would reject it?"].map((question) => (
                <ChoiceButton
                  key={question}
                  selected={researchQuestion === question}
                  correct={researchQuestion === question && question === RESEARCH_QUESTION}
                  incorrect={researchQuestion === question && question !== RESEARCH_QUESTION}
                  disabled={questionCorrect}
                  onClick={() => setResearchQuestion(question)}
                >
                  {question}
                </ChoiceButton>
              ))}
            </ChoiceGrid>
          </QuestionBlock>
          {researchQuestion && (
            <SceneFeedback correct={questionCorrect}>
              {questionCorrect
                ? "This question demands a mechanism, persistence, and disconfirming evidence before capital is committed."
                : "That question protects the idea from evidence. A research shortlist must remain falsifiable."}
            </SceneFeedback>
          )}
        </div>
      )}

      {ready && (
        <div className="mt-5 rounded-2xl border border-accent-green/25 bg-accent-green/[0.05] p-5">
          {/* The card's title, and it heads three rows of evidence — at caption
              size it was the smallest text in the block it titles. */}
          <h3 className="ops-body-strong text-[15px] text-accent-green">
            Research card ready
          </h3>
          <dl className="mt-3 space-y-3">
            <ResearchCardRow label="Shortlist" value={selected.join(" · ")} />
            <ResearchCardRow label="Evidence standard" value={EVIDENCE_RULE} />
            <ResearchCardRow label="Research question" value={RESEARCH_QUESTION} />
          </dl>
          <button
            type="button"
            onClick={save}
            disabled={saved}
            className="mt-5 rounded-full border border-accent-green/40 bg-accent-green/10 px-5 py-2.5 text-sm font-semibold text-accent-green transition-colors hover:bg-accent-green/20 disabled:cursor-default disabled:opacity-70"
          >
            {saved ? "Research card saved ✓" : "Save research card to this browser"}
          </button>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-accent-red/20 bg-accent-red/[0.04] p-4">
        <div className="ops-caption text-[12px] text-accent-red">Legal boundary</div>
        <p className="ops-body mt-1 text-[14px] text-slate-300">
          Information-based research must use lawful sources. Material nonpublic information is never a legitimate investment advantage.
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
    <div className="rounded-2xl border border-accent-amber/20 bg-accent-amber/[0.04] p-5">
      <h3 className="ops-interactive-title text-[16px] text-white">{title}</h3>
      <p className="ops-body mt-2 text-[14px] text-slate-300">{body}</p>
    </div>
  );
}

function ResearchRow({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className={cn("ops-caption text-[12px]", warning ? "text-accent-red" : "text-slate-500")}>
        {label}
      </div>
      <p className="ops-body mt-1 text-[14px] text-slate-200">{value}</p>
    </div>
  );
}

function SequentialCard({
  eyebrow,
  prompt,
  children,
  feedback,
  correct,
  next,
  nextLabel,
}: {
  eyebrow: string;
  prompt: string;
  children: ReactNode;
  feedback: string | null;
  correct: boolean;
  next?: () => void;
  nextLabel: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="ops-caption text-[12px] text-accent-amber">{eyebrow}</div>
      <QuestionBlock question={prompt} compact>
        {children}
      </QuestionBlock>
      {feedback && <SceneFeedback correct={correct}>{feedback}</SceneFeedback>}
      {next && (
        <button
          type="button"
          onClick={next}
          className="mt-4 rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-2 text-sm font-semibold text-accent-amber hover:bg-accent-amber/20"
        >
          {nextLabel} →
        </button>
      )}
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
      <div className="ops-caption text-[12px] text-accent-amber">Your decision</div>
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
      <div className={cn("ops-caption text-[12px]", correct ? "text-accent-green" : "text-accent-red")}>
        {correct ? "Claim decoded" : "Revise the comparison"}
      </div>
      <p className="ops-body mt-1 text-[14px] text-slate-200">{children}</p>
    </div>
  );
}

function ResearchCardRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-t border-white/10 pt-3 first:border-t-0 first:pt-0 sm:grid-cols-[135px_1fr] sm:gap-4">
      <dt className="ops-caption text-[12px] text-slate-500">{label}</dt>
      <dd className="ops-body text-[14px] text-slate-100">{value}</dd>
    </div>
  );
}
