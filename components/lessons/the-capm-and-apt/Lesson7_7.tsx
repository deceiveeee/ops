"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BlockMath } from "@/components/ui/Math";
import {
  Reveal,
  Panel,
  DefinitionCard,
  Feedback,
  InteractiveFrame,
  LessonSummary,
  ConceptSection,
} from "./shared";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CAPMLayout from "./CAPMLayout";
import CAPMSourcePanel from "./CAPMSourcePanel";
import { useReportCAPMComplete } from "@/lib/capm-progress";
import { useLesson77State, PRACTICE_CATEGORIES } from "@/lib/capm-lesson77-state";
import ModuleSevenConceptMap from "./lesson77/ModuleSevenConceptMap";
import RiskPricingPracticeStudio from "./lesson77/RiskPricingPracticeStudio";
import RiskModelErrorClinic from "./lesson77/RiskModelErrorClinic";
import OrionFundCase from "./lesson77/OrionFundCase";
import ModuleSevenMasteryCheck from "./lesson77/ModuleSevenMasteryCheck";
import Challenges from "./lesson77/Challenges";

const LEARNING_OBJECTIVES = [
  "Explain why CAPM equilibrium implies that the tangency portfolio becomes the market portfolio.",
  "Calculate and interpret portfolio beta.",
  "Distinguish beta from total volatility.",
  "Calculate CAPM required return.",
  "Interpret points above, on, or below the Security Market Line.",
  "Distinguish required, forecast, and realized return.",
  "Read a basic beta regression.",
  "Distinguish beta, R-squared, residuals, alpha, and standard error.",
  "Calculate CAPM alpha.",
  "Evaluate whether apparent alpha may reflect omitted factor exposure.",
  "Calculate a multifactor required return and explain the no-arbitrage intuition of APT.",
  "Compare CAPM and APT.",
  "Write a cautious, evidence-based performance conclusion.",
];

const SUMMARY_POINTS = [
  "Under CAPM equilibrium, the tangency portfolio becomes the market portfolio because aggregate demand must match the supply of risky assets.",
  "Beta measures how aggressively an investment participates in broad market movements — not total volatility.",
  "The Security Market Line sets the required return for systematic exposure: R_f + β(E[R_M] − R_f).",
  "Required return is an equilibrium benchmark, distinct from a forecast and from the realized return.",
  "Beta is the regression slope; R² is the fit. Residuals are unexplained period-specific returns, not only firm-specific risk.",
  "Estimated beta is uncertain (standard error) and changes with the window, frequency, proxy, and business mix.",
  "Alpha is return unexplained by the selected model. Positive CAPM alpha does not prove skill.",
  "Multifactor models can show that apparent alpha reflects omitted systematic exposures.",
  "APT uses no-arbitrage pricing pressure and allows multiple factors, but does not identify the uniquely correct factors.",
  "A defensible conclusion weighs the evidence cautiously: risk-adjusted, model-relative, and uncertain.",
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent-cyan">Central question</div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          Can you move from portfolio theory to a defensible conclusion about an investment’s risk,
          required return, and performance?
        </p>
      </div>
    </Reveal>
  );
}

function GateRow({ done, label }: { done: boolean; label: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border font-mono text-[12px]",
          done ? "border-accent-green/50 bg-accent-green/10 text-accent-green" : "border-white/20 text-slate-500",
        )}
      >
        {done ? "✓" : "○"}
      </span>
      <span className={cn("text-[15px] leading-[1.55]", done ? "text-slate-200" : "text-slate-400")}>{label}</span>
    </li>
  );
}

function CompletionGate() {
  const { state, categoriesDoneCount, gateSatisfied } = useLesson77State();
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
      <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Completion checklist</div>
      <ul className="mt-4 space-y-2.5">
        <GateRow done={categoriesDoneCount === PRACTICE_CATEGORIES.length} label={<>Guided practice — all six categories complete ({categoriesDoneCount}/6)</>} />
        <GateRow done={state.clinicDone} label="Error diagnosis clinic complete" />
        <GateRow done={state.orionComplete} label="Orion Fund case — memo submitted and accepted" />
        <GateRow done={Boolean(state.mastery?.passed)} label={`Mastery check passed (${state.mastery ? state.mastery.lastScorePct + "%" : "not attempted"})`} />
      </ul>
      {gateSatisfied ? (
        <div className="mt-4">
          <Feedback status="correct">
            All requirements met — Lesson 7.7 is complete. Module 7 is finished. The conclusions below
            summarize the whole module.
          </Feedback>
        </div>
      ) : (
        <p className="mt-4 text-[14px] leading-[1.55] text-slate-400">
          Complete each item above to finish the lesson. Your progress is saved as you work.
        </p>
      )}
    </div>
  );
}

const CONCLUSIONS = [
  "The market portfolio is the market treated as one value-weighted portfolio.",
  "Under CAPM equilibrium, the tangency portfolio becomes the market portfolio because aggregate investor demand must match the supply of risky assets.",
  "Beta measures how aggressively an investment participates in broad market movements.",
  "Higher expected return is not automatically better. It must be evaluated relative to the systematic risk required to earn it.",
  "Estimated alpha is return unexplained by the selected model. It does not automatically prove skill.",
  "CAPM prices one systematic exposure. APT allows multiple exposures, but it does not identify the correct factors automatically.",
];

export default function Lesson7_7() {
  const report = useReportCAPMComplete("capm-apt-in-practice");
  const { gateSatisfied, setCompleted } = useLesson77State();

  useEffect(() => {
    if (gateSatisfied) {
      report();
      setCompleted(true);
    }
  }, [gateSatisfied, report, setCompleted]);

  return (
    <CAPMLayout>
      <PVHero
        index="7.7"
        eyebrow="Lesson 7.7 · Module 7 — The CAPM and APT"
        heading="CAPM and APT in Practice"
        subheading="From market exposure to a defensible investment conclusion. A synthesis and mastery lesson that moves through the full Module 7 reasoning chain."
        bullets={[
          "Connected module recap",
          "Guided mixed practice (6 categories)",
          "Error diagnosis",
          "Integrated Orion Fund case",
          "Randomized mastery check",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* PHASE 1 — RECAP */}
      <ConceptSection
        index="7.7.1"
        eyebrow="Phase 1 · Connected module recap"
        title="The Module 7 reasoning chain"
        intro="One connected sequence from portfolio theory to multiple factors. Select any stage to see the question it answers, its formula, the key interpretation, and a common mistake."
      >
        <Reveal>
          <InteractiveFrame>
            <ModuleSevenConceptMap />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* PHASE 2 — GUIDED PRACTICE */}
      <ConceptSection
        index="7.7.2"
        eyebrow="Phase 2 · Guided mixed practice"
        title="Calculate, interpret, and apply"
        intro="Six categories of structured practice. For each problem, calculate, submit, then interpret. A numerically correct answer with a wrong interpretation is not complete."
      >
        <Reveal>
          <RiskPricingPracticeStudio />
        </Reveal>
      </ConceptSection>

      {/* PHASE 3 — ERROR DIAGNOSIS */}
      <ConceptSection
        index="7.7.3"
        eyebrow="Phase 3 · Model comparison & error diagnosis"
        title="Find the broken reasoning"
        intro="Five analyst statements each contain one error. Identify the faulty phrase and choose the corrected interpretation."
      >
        <Reveal>
          <InteractiveFrame>
            <RiskModelErrorClinic />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* PHASE 4 — ORION CASE */}
      <ConceptSection
        index="7.7.4"
        eyebrow="Phase 4 · Integrated case"
        title="Evaluate the Orion Fund"
        intro="Move from exposure to a defensible conclusion. New evidence appears stage by stage — update your judgment as it arrives."
      >
        <Reveal>
          <InteractiveFrame>
            <OrionFundCase />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* PHASE 5 — MASTERY CHECK */}
      <ConceptSection
        index="7.7.5"
        eyebrow="Phase 5 · Final mastery check"
        title="Module 7 mastery"
        intro="A fresh sample of questions across all six categories. Standard: at least 80% overall, with no category entirely wrong. Retry draws a new sample; completed case work is preserved."
      >
        <Reveal>
          <InteractiveFrame>
            <ModuleSevenMasteryCheck />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* OPTIONAL CHALLENGES */}
      <ConceptSection
        index="7.7.6"
        eyebrow="Optional · Challenge problems"
        title="Stretch problems for advanced learners"
        intro="These do not affect completion. Use them to test the edges of the reasoning."
      >
        <Reveal>
          <Challenges />
        </Reveal>
      </ConceptSection>

      {/* COMPLETION GATE */}
      <ConceptSection
        index="7.7.7"
        eyebrow="Completion · Module 7 synthesis"
        title="Completion checklist"
        intro="Lesson completion requires all six practice categories, the error clinic, the Orion case, and a passed mastery check."
      >
        <Reveal>
          <CompletionGate />
        </Reveal>
      </ConceptSection>

      {/* FINAL MODULE CONCLUSIONS */}
      <ConceptSection
        index="7.7.8"
        eyebrow="Conclusion · The module in six statements"
        title="What Module 7 establishes"
        intro="If the checklist is satisfied, these are the conclusions you should carry forward."
        topMargin="mt-16"
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {CONCLUSIONS.map((c, i) => (
              <div key={i} className="rounded-2xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-5">
                <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent-cyan">Conclusion {i + 1}</div>
                <p className="mt-2 text-[16px] leading-[1.6] text-slate-100">{c}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-gradient-to-br from-accent-green/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="max-w-2xl">
              <BlockMath>{String.raw`\boxed{\text{Expected return must be evaluated relative to systematic risk}}`}</BlockMath>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <Panel>
            <p className="text-[16px] leading-[1.7] text-slate-200">
              Portfolio theory identifies an optimal risky portfolio. CAPM uses equilibrium to connect
              that portfolio to the market. Beta measures market exposure, and the Security Market Line
              determines the expected return required for that exposure. Historical regression
              estimates beta and alpha, but those estimates are uncertain. APT and multifactor models
              broaden the analysis when one market beta is insufficient.
            </p>
            <div className="mt-4 rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-amber">Final caution</div>
              <p className="mt-2 text-[15px] leading-[1.6] text-slate-200">
                No model provides a guaranteed return, a perfectly correct discount rate, or automatic
                proof of manager skill. These models provide disciplined benchmarks for comparing risk
                and return.
              </p>
            </div>
          </Panel>
        </Reveal>
        <Reveal>
          <DefinitionCard term="The defensible conclusion">
            Weigh the evidence, adjust for the relevant systematic risks, respect the uncertainty in
            every estimate, and avoid claiming more than the data support.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Return to the Finance Foundations course"
          continueHref="/courses/finance-foundations"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CAPMSourcePanel />
      </Reveal>
    </CAPMLayout>
  );
}
