"use client";

import IFLessonLayout from "./IFLessonLayout";
import PhilosophyOpeningCards from "./PhilosophyOpeningCards";
import BeliefToStrategyFlow from "./BeliefToStrategyFlow";
import PhilosophyClassifier from "./PhilosophyClassifier";
import PhilosophyNeed from "./PhilosophyNeed";
import StrategyChaser from "./StrategyChaser";
import InvestmentProcessMap from "./InvestmentProcessMap";
import AllocationVsSelection from "./AllocationVsSelection";
import PhilosophyLocationMap from "./PhilosophyLocationMap";
import PhilosophyCoordinates from "./PhilosophyCoordinates";
import InvestorFitPanels from "./InvestorFitPanels";
import SameBeliefDifferentInvestor from "./SameBeliefDifferentInvestor";
import PhilosophyDraftBuilder from "./PhilosophyDraftBuilder";
import LessonAssessment from "./LessonAssessment";
import { Reveal, SectionHeading, Panel, DefinitionCard } from "./shared";
import { IF_LEARNING_OBJECTIVES } from "./shared";

export default function LessonIF_1_1() {
  return (
    <IFLessonLayout>
      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(251,191,36,0.10),transparent_55%)]" />
        <div className="relative pt-4 pb-10">
          <div className="ops-eyebrow flex items-center gap-3 text-xs">
            <span className="tabular-nums text-accent-amber">1.1</span>
            <span className="h-px w-8 bg-white/30" />
            <span>Investment Foundations · Module 1</span>
          </div>
          <h1 className="ops-display mt-5 text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            How an Investor Builds a Philosophy
          </h1>
          <p className="ops-body mt-5 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            Map the investment process, identify where strategies seek an
            advantage, and begin defining the approach that fits you.
          </p>

          <Reveal delay={0.05} className="mt-8">
            <div className="ops-definition-card p-5">
              <div className="ops-caption text-[10px] text-accent-amber">
                Central question
              </div>
              <p className="ops-definition mt-2 text-[17px] text-slate-50">
                Where in the investment process do you believe you can make
                better decisions than the market, and does that approach fit
                you as an investor?
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="mt-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="ops-caption text-[10px] text-slate-400">
                Central conclusion
              </div>
              <p className="ops-body-strong mt-2 text-[16px] text-white">
                A sound investment approach requires both a coherent belief
                about how markets work and an implementation that the investor
                can realistically sustain.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Learning objectives */}
      <Reveal className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-accent-amber">
            By the end of this lesson, you should be able to:
          </div>
          <ol className="mt-3 space-y-2">
            {IF_LEARNING_OBJECTIVES.map((o, i) => (
              <li
                key={o}
                className="ops-body flex items-start gap-3 text-[15px] text-slate-200"
              >
                <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 font-mono text-[12px] text-accent-amber">
                  {i + 1}
                </span>
                <span>{o}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </Reveal>

      {/* Section 1 — Opening */}
      <Reveal className="mt-14">
        <SectionHeading
          index="01"
          eyebrow="Opening"
          title="Successful investors do not all invest the same way"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyOpeningCards />
      </div>

      {/* Section 2 — What is an investment philosophy? */}
      <Reveal className="mt-14">
        <SectionHeading
          index="02"
          eyebrow="Definition"
          title="What is an investment philosophy?"
        />
      </Reveal>
      <div className="mt-6">
        <BeliefToStrategyFlow />
      </div>

      {/* Section 4 — Classifier (interaction) */}
      <Reveal className="mt-14">
        <SectionHeading
          index="03"
          eyebrow="Interaction"
          title="Philosophy, strategy, or trade?"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyClassifier />
      </div>

      {/* Section 5 — Why need a philosophy */}
      <Reveal className="mt-14">
        <SectionHeading
          index="04"
          eyebrow="Why it matters"
          title="Why does an investor need a philosophy?"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyNeed />
      </div>

      {/* Section 6 — Strategy Chaser */}
      <Reveal className="mt-14">
        <SectionHeading
          index="05"
          eyebrow="Simulation"
          title="The strategy chaser"
        />
      </Reveal>
      <div className="mt-6">
        <StrategyChaser />
      </div>

      {/* Section 7 — Investment Process Map */}
      <Reveal className="mt-14">
        <SectionHeading
          index="06"
          eyebrow="Interactive framework"
          title="The investment process"
        />
      </Reveal>
      <div className="mt-6">
        <InvestmentProcessMap />
      </div>

      {/* Section 8 — Allocation vs Selection */}
      <Reveal className="mt-14">
        <SectionHeading
          index="07"
          eyebrow="Quick classification"
          title="Where does the decision belong?"
        />
      </Reveal>
      <div className="mt-6">
        <AllocationVsSelection />
      </div>

      {/* Section 9 — Philosophy Location Map */}
      <Reveal className="mt-14">
        <SectionHeading
          index="08"
          eyebrow="Interactive framework"
          title="Where does each philosophy seek an advantage?"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyLocationMap />
      </div>

      {/* Section 10 — Three dimensions */}
      <Reveal className="mt-14">
        <SectionHeading
          index="09"
          eyebrow="Framework"
          title="Three dimensions of an investment philosophy"
        />
      </Reveal>
      <div className="mt-6">
        <ThreeDimensions />
      </div>

      {/* Section 11 — Coordinates */}
      <Reveal className="mt-14">
        <SectionHeading
          index="10"
          eyebrow="Interaction"
          title="Map the philosophy"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyCoordinates />
      </div>

      {/* Section 12 — How developed */}
      <Reveal className="mt-14">
        <SectionHeading
          index="11"
          eyebrow="Process"
          title="How an investment philosophy is developed"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyDevelopment />
      </div>

      {/* Section 13 — Investor Fit */}
      <Reveal className="mt-14">
        <SectionHeading
          index="12"
          eyebrow="Fit"
          title="The best philosophy must also fit the investor"
        />
      </Reveal>
      <div className="mt-6">
        <InvestorFitPanels />
      </div>

      {/* Section 14 — Same belief, different investors */}
      <Reveal className="mt-14">
        <SectionHeading
          index="13"
          eyebrow="Interaction"
          title="The same belief does not create the same portfolio"
        />
      </Reveal>
      <div className="mt-6">
        <SameBeliefDifferentInvestor />
      </div>

      {/* Section 15 — Philosophy Draft 0.1 */}
      <Reveal className="mt-14">
        <SectionHeading
          index="14"
          eyebrow="Final learner artifact"
          title="Create your Investment Philosophy Draft 0.1"
        />
      </Reveal>
      <div className="mt-6">
        <PhilosophyDraftBuilder />
      </div>

      {/* Section 16 — Assessment */}
      <Reveal className="mt-14">
        <SectionHeading
          index="15"
          eyebrow="Final assessment"
          title="Check your understanding"
        />
      </Reveal>
      <div className="mt-6">
        <LessonAssessment />
      </div>

      {/* Section 17 — Closing synthesis */}
      <Reveal className="mt-14">
        <SectionHeading
          index="16"
          eyebrow="Closing synthesis"
          title="What you should carry forward"
        />
      </Reveal>
      <div className="mt-6">
        <ClosingSynthesis />
      </div>
    </IFLessonLayout>
  );
}

/* ---------- Section 10 — Three Dimensions (kept inline: mostly static) ---------- */

function ThreeDimensions() {
  return (
    <>
      <Reveal>
        <p className="ops-body mt-2 max-w-3xl text-[17px] text-slate-200">
          Three independent dimensions help describe any philosophy: where it
          makes decisions, how involved the investor is, and how long the
          strategy expects to wait.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <Panel>
          <div className="ops-caption text-[10px] text-accent-amber">
            Dimension 1 · Market timing or asset selection
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="ops-interactive-title text-[15px] text-white">
                Market timing
              </div>
              <p className="ops-body mt-1 text-[14px] text-slate-300">
                Attempts to choose among entire markets, asset classes,
                countries, or broad exposures.
              </p>
            </div>
            <div>
              <div className="ops-interactive-title text-[15px] text-white">
                Asset selection
              </div>
              <p className="ops-body mt-1 text-[14px] text-slate-300">
                Attempts to choose superior individual securities within a market.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <div className="ops-caption text-[10px] text-accent-amber">
            Dimension 2 · Activist or non-activist
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="ops-interactive-title text-[15px] text-white">
                Non-activist
              </div>
              <ul className="mt-1 space-y-1">
                <li className="ops-body flex items-start gap-2 text-[14px] text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                  wait for the market to recognize value;
                </li>
                <li className="ops-body flex items-start gap-2 text-[14px] text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                  wait for earnings to improve;
                </li>
                <li className="ops-body flex items-start gap-2 text-[14px] text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                  wait for a price discrepancy to close.
                </li>
              </ul>
            </div>
            <div>
              <div className="ops-interactive-title text-[15px] text-white">
                Activist
              </div>
              <ul className="mt-1 space-y-1">
                <li className="ops-body flex items-start gap-2 text-[14px] text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                  influence the board;
                </li>
                <li className="ops-body flex items-start gap-2 text-[14px] text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                  push for an asset sale;
                </li>
                <li className="ops-body flex items-start gap-2 text-[14px] text-slate-300">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
                  change capital allocation, restructuring, management, or financing.
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-accent-cyan/20 bg-accent-cyan/[0.04] p-3">
            <div className="ops-caption text-[10px] text-accent-cyan">
              Terminology note
            </div>
            <p className="ops-body mt-1 text-[14px] text-slate-200">
              <strong className="text-white">Passive involvement is not the same as passive indexing.</strong>{" "}
              A non-activist investor buys an asset and waits for management,
              markets, or external events to create value. An activist investor
              attempts to create the change directly.
            </p>
          </div>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-5">
        <Panel>
          <div className="ops-caption text-[10px] text-accent-amber">
            Dimension 3 · Time horizon
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className="ops-interactive-title text-[15px] text-white">Short</div>
              <p className="ops-body mt-1 text-[14px] text-slate-300">
                The strategy expects the relevant information or price
                correction to occur quickly.
              </p>
            </div>
            <div>
              <div className="ops-interactive-title text-[15px] text-white">Medium</div>
              <p className="ops-body mt-1 text-[14px] text-slate-300">
                The strategy may require several quarters or years.
              </p>
            </div>
            <div>
              <div className="ops-interactive-title text-[15px] text-white">Long</div>
              <p className="ops-body mt-1 text-[14px] text-slate-300">
                The strategy depends on business development, compounding,
                restructuring, or gradual market correction.
              </p>
            </div>
          </div>
          <p className="ops-body-strong mt-4 text-[15px] text-white">
            No time horizon is automatically superior. The relevant question is
            whether the investor can remain committed for as long as the
            philosophy requires.
          </p>
        </Panel>
      </Reveal>
    </>
  );
}

/* ---------- Section 12 — How a philosophy is developed ---------- */

const DEV_STEPS = [
  {
    n: 1,
    title: "Acquire the tools of the trade",
    body: "Before evaluating investment philosophies, an investor must be able to assess risk; read financial statements; estimate value; understand trading costs and market frictions; and test whether a strategy works after risk and costs.",
    connection: "These tools form the first part of Investment Foundations.",
  },
  {
    n: 2,
    title: "Develop a view of how markets work",
    body: "Ask: do markets make recurring mistakes? Which mistakes? Why do they occur? Why are they not immediately corrected? Can the investor identify them reliably? Can the opportunity survive costs, taxes, and competition?",
    connection: "The later philosophy modules examine competing answers to these questions.",
  },
  {
    n: 3,
    title: "Find the philosophy that fits the investor",
    body: "Evaluate the philosophy against risk aversion; time horizon; tax status; wealth; liquidity; patience; research time; analytical skill; data access; and ability to tolerate underperformance.",
    connection:
      "The final course project will require the learner to choose and defend a philosophy that is supported by evidence and compatible with the investor.",
  },
] as const;

const COURSE_PATH = [
  "Learn the tools",
  "Examine market beliefs",
  "Test competing philosophies",
  "Find the best fit",
  "Build and defend a portfolio",
] as const;

function PhilosophyDevelopment() {
  return (
    <>
      <Reveal>
        <p className="ops-body mt-2 max-w-3xl text-[17px] text-slate-200">
          A philosophy should not begin with a favorite stock screen. It
          develops through three steps.
        </p>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <ol className="space-y-3">
          {DEV_STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 font-mono text-[13px] text-accent-amber">
                  {s.n}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="ops-interactive-title text-[16px] text-white">
                    Step {s.n} — {s.title}
                  </h3>
                  <p className="ops-body mt-2 text-[15px] text-slate-200">
                    {s.body}
                  </p>
                  <div className="mt-3 rounded-lg border border-accent-cyan/20 bg-accent-cyan/[0.04] p-2.5">
                    <span className="ops-caption text-[10px] text-accent-cyan">
                      Course connection:{" "}
                    </span>
                    <span className="text-[13px] text-slate-200">{s.connection}</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={0.05} className="mt-6">
        <Panel>
          <div className="ops-caption text-[11px] text-accent-amber">Course path</div>
          <ol className="mt-3 flex flex-col gap-2">
            {COURSE_PATH.map((p, i) => (
              <li key={p} className="flex items-center gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-accent-amber/40 bg-accent-amber/10 font-mono text-[11px] text-accent-amber">
                  {i + 1}
                </span>
                <span className="text-[14px] text-slate-200">{p}</span>
                {i < COURSE_PATH.length - 1 && (
                  <span className="ml-auto text-accent-amber" aria-hidden>
                    ↓
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Panel>
      </Reveal>
    </>
  );
}

/* ---------- Section 17 — Closing Synthesis ---------- */

const PRINCIPLES = [
  {
    title: "Begin with a market belief",
    body: "Explain why the opportunity should exist.",
  },
  {
    title: "Connect belief to strategy",
    body: "A trading rule without an economic explanation is not a complete philosophy.",
  },
  {
    title: "Map the complete process",
    body:
      "An idea must survive asset allocation, security selection, execution, costs, risk, and evaluation.",
  },
  {
    title: "Choose a philosophy that fits",
    body: "A strategy that cannot be sustained by the investor is not a suitable strategy.",
  },
] as const;

function ClosingSynthesis() {
  return (
    <>
      <Reveal>
        <DefinitionCard>
          An investment philosophy is not a list of securities to buy. It is an
          explanation of:
          <ul className="mt-2 space-y-1">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
              how markets work;
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
              where an opportunity may arise;
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
              why the opportunity may persist;
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
              which strategy can capture it;
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" />
              and why the investor is equipped to follow that strategy.
            </li>
          </ul>
        </DefinitionCard>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <Panel key={p.title}>
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-2 font-mono text-[12px] text-accent-amber">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="ops-interactive-title text-[16px] text-white">
                    {p.title}
                  </h3>
                  <p className="ops-body mt-1 text-[14px] text-slate-300">
                    {p.body}
                  </p>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <Panel className="border-accent-amber/25 bg-accent-amber/[0.05]">
          <div className="ops-caption text-[11px] text-accent-amber">Final course path</div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {COURSE_PATH.map((p, i) => (
              <span key={p} className="flex items-center gap-2">
                <span className="rounded-full border border-accent-amber/30 bg-accent-amber/[0.06] px-3 py-1 text-[13px] text-slate-100">
                  {p}
                </span>
                {i < COURSE_PATH.length - 1 && (
                  <span className="text-accent-amber" aria-hidden>
                    ↓
                  </span>
                )}
              </span>
            ))}
          </div>
        </Panel>
      </Reveal>

      <Reveal delay={0.05} className="mt-7">
        <div className="ops-definition-card p-6">
          <div className="ops-caption text-[10px] text-accent-cyan">Final message</div>
          <p className="ops-definition mt-2 text-[17px] text-slate-50">
            Your Investment Philosophy Draft 0.1 is not a conclusion. It is the
            hypothesis that the rest of Investment Foundations will test.
          </p>
          <p className="ops-body mt-4 text-[15px] text-slate-300">
            <span className="ops-caption mr-2 text-[10px] text-accent-amber">
              Next
            </span>
            What does risk actually mean to an investor?
          </p>
        </div>
      </Reveal>
    </>
  );
}
