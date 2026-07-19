"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import {
  Reveal,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  Feedback,
  InteractiveFrame,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
  ConceptSection,
  CalculationWorksheet,
} from "./shared";
import BetaRegressionBuilder from "./BetaRegressionBuilder";
import SlopeScatterLab from "./SlopeScatterLab";
import BetaWindowExplorer from "./BetaWindowExplorer";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CAPMLayout from "./CAPMLayout";
import CAPMSourcePanel from "./CAPMSourcePanel";
import { useReportCAPMComplete } from "@/lib/capm-progress";

const LEARNING_OBJECTIVES = [
  "Explain how beta is estimated from historical returns.",
  "Interpret a stock-versus-market scatterplot with excess returns on both axes.",
  "Identify beta as the regression slope.",
  "Distinguish beta, alpha, residuals, R-squared, and standard error.",
  "Explain why beta and R-squared answer different questions.",
  "Explain why estimated beta changes across samples.",
  "Assess whether a historical beta is economically reasonable.",
  "Use beta as an uncertain estimate rather than a permanent company label.",
];

const SUMMARY_POINTS = [
  "Beta is not printed on a security; it is estimated from how the asset moved relative to a market benchmark.",
  "Each period pairs the market excess return with the asset's excess return: one point per period.",
  "Beta is the slope of the fitted stock-versus-market regression line (β̂).",
  "Over the sample, a beta of 1.25 means the asset tended to move about 1.25 points per 1-point market move, on average.",
  "R² measures fit (fraction of variation explained); beta measures slope (sensitivity). They answer different questions.",
  "Residuals are the period-specific vertical gaps between points and the line — not only firm-specific risk.",
  "The covariance formula Cov(R_i, R_M) / Var(R_M) and the regression slope describe the same relationship.",
  "Standard error describes how imprecisely the slope was estimated from the sample.",
  "Beta changes with the time window, return frequency, market proxy, unusual periods, and business or capital-structure changes.",
  "Historical beta is an input to judgment, not a substitute for it — a useful beta must make sense both statistically and economically.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Where does an asset's beta come from?",
    choices: [
      { id: "a", label: "It is estimated from how the asset moved relative to a market benchmark" },
      { id: "b", label: "It is printed on the security" },
      { id: "c", label: "It is set by the company's management" },
    ],
    correctId: "a",
    hint: "Beta is not directly observable; it is estimated from historical return data and is uncertain.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "In the stock-versus-market scatterplot, what is beta?",
    choices: [
      { id: "a", label: "The slope of the fitted regression line" },
      { id: "b", label: "The tightness of the points around the line" },
      { id: "c", label: "The average return of the stock" },
    ],
    correctId: "a",
    hint: "Beta measures sensitivity (slope). Tightness of fit is measured by R².",
  },
  {
    id: "q3",
    type: "single",
    prompt: "If two assets share the same beta but one has much lower R², what differs?",
    choices: [
      { id: "a", label: "Their estimated market sensitivity is similar, but the lower-R² asset's returns are explained less well by the market regression" },
      { id: "b", label: "The lower-R² asset has lower market sensitivity" },
      { id: "c", label: "The lower-R² asset is risk-free" },
    ],
    correctId: "a",
    hint: "Beta measures slope; R² measures fit. Same slope, different tightness around the line.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "What does the beta standard error describe?",
    choices: [
      { id: "a", label: "How imprecisely the slope has been estimated from the sample" },
      { id: "b", label: "The average residual" },
      { id: "c", label: "The risk-free rate" },
    ],
    correctId: "a",
    hint: "A larger standard error means the beta estimate is more uncertain.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "Should a historical beta be used permanently without revision?",
    choices: [
      { id: "a", label: "No — it should be reassessed when the sample, benchmark, business model, or capital structure changes" },
      { id: "b", label: "Yes — once estimated, beta never changes" },
    ],
    correctId: "a",
    hint: "Beta is relative to a benchmark, sample period, and estimation method, and reflects the current business.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Does a beta below one mean the stock is safe?",
    choices: [
      { id: "a", label: "No — it has lower market exposure but may still have substantial other volatility" },
      { id: "b", label: "Yes — low beta means low total risk" },
    ],
    correctId: "a",
    hint: "Beta captures only the market-related component. Total volatility may still be large.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent-cyan">Central question</div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          CAPM needs beta, but where does a company&apos;s beta actually come from?
        </p>
      </div>
    </Reveal>
  );
}

const MONTHLY = [
  { m: 1, x: 3, y: 5 },
  { m: 2, x: -2, y: -4 },
  { m: 3, x: 1, y: 0 },
  { m: 4, x: 4, y: 7 },
  { m: 5, x: -3, y: -2 },
];

function MonthlyExcessScatter() {
  const W = 360;
  const H = 300;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 42;
  const xMin = -5;
  const xMax = 6;
  const yMin = -6;
  const yMax = 9;
  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const sy = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);
  const xTicks = [-4, -2, 0, 2, 4];
  const yTicks = [-4, -2, 0, 2, 4, 6, 8];
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[340px]" role="img" aria-label="Scatter of five monthly market excess returns against stock excess returns, one point per month.">
        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
            <text x={sx(t)} y={H - padB + 18} fill="rgba(148,163,184,0.85)" fontSize="11" fontFamily="monospace" textAnchor="middle">{t}%</text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={padL - 8} y={sy(t) + 4} fill="rgba(148,163,184,0.85)" fontSize="11" fontFamily="monospace" textAnchor="end">{t}%</text>
          </g>
        ))}
        <line x1={sx(0)} x2={sx(0)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.25)" />
        <line x1={padL} x2={W - padR} y1={sy(0)} y2={sy(0)} stroke="rgba(255,255,255,0.25)" />
        {MONTHLY.map((p) => (
          <g key={p.m}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill="rgba(34,211,238,0.9)" stroke="rgba(5,7,13,0.9)" strokeWidth={1.5} />
            <text x={sx(p.x) + 8} y={sy(p.y) - 8} fill="rgba(148,163,184,0.9)" fontSize="11" fontFamily="monospace">m{p.m}</text>
          </g>
        ))}
        <text x={(padL + W - padR) / 2} y={H - 6} fill="rgba(148,163,184,0.9)" fontSize="12" textAnchor="middle">Market excess return</text>
        <text x={14} y={(padT + H - padB) / 2} fill="rgba(148,163,184,0.9)" fontSize="12" textAnchor="middle" transform={`rotate(-90 14 ${(padT + H - padB) / 2})`}>Stock excess return</text>
      </svg>
      <p className="mt-1.5 text-center text-[14px] text-slate-500">
        Five months of data, one point each. No fitted line yet.
      </p>
    </div>
  );
}

function FinalCheckRow({
  prompt,
  options,
  correctId,
  answerLabel,
  feedback,
}: {
  prompt: ReactNode;
  options: { id: string; label: string }[];
  correctId: string;
  answerLabel: string;
  feedback: ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === correctId;
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
      <div className="text-[16px] leading-[1.6] text-slate-200">{prompt}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const showCorrect = answered && opt.id === correctId;
          const showWrong = isSelected && !isCorrect;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => setSelected(opt.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                answered && !showCorrect && !showWrong && "border-white/10 text-slate-500",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3">
          <Feedback status={isCorrect ? "correct" : "incorrect"}>
            <span className="block font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Expected: {answerLabel}</span>
            <span className="mt-1 block">{feedback}</span>
          </Feedback>
        </div>
      )}
    </div>
  );
}

export default function Lesson7_4() {
  const report = useReportCAPMComplete("capm-estimating-beta");

  return (
    <CAPMLayout>
      <PVHero
        index="7.4"
        eyebrow="Lesson 7.4 · Module 7 — The CAPM and APT"
        heading="Estimating Beta: From Return Data to Market Exposure"
        subheading="CAPM can compute a required return once beta is known — but beta is not directly observable. It must be estimated from return data, and the estimate is uncertain."
        bullets={[
          "β̂ = slope of the stock-vs-market regression",
          "Excess returns on both axes",
          "Beta ≠ R²: slope vs fit",
          "Residuals are the vertical gaps",
          "Beta is an estimate, with standard error",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== SECTION 1 — BETA NOT OBSERVABLE ===================== */}
      <ConceptSection
        index="7.4.1"
        eyebrow="Section 1 · Beta is not directly observable"
        title="A required input that nobody can see"
        intro={<>From Lesson 7.3, the CAPM required return is:</>}
      >
        <Reveal>
          <div className="max-w-2xl">
            <BlockMath>{String.raw`E[R_i] = R_f + \beta_i\bigl(E[R_M] - R_f\bigr)`}</BlockMath>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">The question</div>
            <p className="mt-3 text-[20px] leading-[1.45] text-white sm:text-[22px]">
              We can observe market prices and historical returns, but where do we obtain beta?
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required statement</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Beta is not printed on a security and is not known with certainty. It is estimated from
              how the security moved relative to a selected market benchmark.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="The hat notation">
            An estimate is written with a hat: <InlineMath>{String.raw`\hat{\beta}`}</InlineMath>. The hat
            means &ldquo;estimated from data.&rdquo; Throughout this lesson, <InlineMath>{String.raw`\hat{\beta}`}</InlineMath>{" "}
            is an estimate of the unknown true beta <InlineMath>{String.raw`\beta`}</InlineMath>.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 2 — PAIR RETURNS ===================== */}
      <ConceptSection
        index="7.4.2"
        eyebrow="Section 2 · Pair stock returns with market returns"
        title="One point per period"
        intro="To estimate beta, pair each period's market excess return with the stock's excess return over the same period."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Month</th>
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-cyan">Market excess return</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-purple">Stock excess return</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                {MONTHLY.map((r) => (
                  <tr key={r.m} className="border-b border-white/5">
                    <td className="py-3 pr-8">{r.m}</td>
                    <td className="py-3 pr-8">{r.x >= 0 ? "+" : ""}{r.x}%</td>
                    <td className="py-3">{r.y >= 0 ? "+" : ""}{r.y}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <div className="max-w-2xl">
            <BlockMath>{String.raw`(x, y) = \bigl(R_M - R_f,\; R_i - R_f\bigr)`}</BlockMath>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-4">
            <MonthlyExcessScatter />
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="What each point asks">
            Each point asks: when the market produced this excess return, what excess return did the
            stock produce during the same period?
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 3 — FIT THE RELATIONSHIP ===================== */}
      <ConceptSection
        index="7.4.3"
        eyebrow="Section 3 · Fit the market relationship"
        title="A line through the cloud"
        intro="The market model expresses each period's stock excess return as a market-linked component, an average intercept, and a period-specific residual."
      >
        <Reveal>
          <FormulaExplainer
            label="Market-model regression"
            tone="cyan"
            formula={String.raw`R_{i,t} - R_{f,t} = \alpha_i + \beta_i\bigl(R_{M,t} - R_{f,t}\bigr) + \varepsilon_{i,t}`}
            meaning="The stock's excess return in each period is decomposed into a market-linked piece, an average intercept, and a residual."
            variables={[
              { symbol: String.raw`\beta_i(R_{M,t} - R_{f,t})`, description: "Market-linked component: how the stock tends to respond to market movements." },
              { symbol: String.raw`\alpha_i`, description: "Average fitted return not explained by market exposure (the intercept)." },
              { symbol: String.raw`\varepsilon_{i,t}`, description: "Period-specific difference between actual return and the fitted line (the residual)." },
            ]}
            interpretation="Full performance interpretation of alpha belongs in Lesson 7.5. Here it is only the fitted intercept."
          />
        </Reveal>
        <Reveal>
          <Feedback status="info">
            Alpha appears here as a regression intercept. It is <em>not yet</em> treated as proof of
            skill — that interpretation is deferred to Lesson 7.5.
          </Feedback>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 4 — BETA IS THE SLOPE ===================== */}
      <ConceptSection
        index="7.4.4"
        eyebrow="Section 4 · Beta is the slope"
        title="The slope of the fitted line"
        intro="The central result of beta estimation: the fitted slope is the beta estimate."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="max-w-xl">
              <BlockMath>{String.raw`\boxed{\hat{\beta}_i = \text{slope of the stock-versus-market regression line}}`}</BlockMath>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <FormulaExplainer
            label="A fitted example"
            tone="cyan"
            formula={String.raw`R_i - R_f = 0.10\% + 1.25\,\bigl(R_M - R_f\bigr) + \varepsilon_i`}
            result={String.raw`\hat{\beta} = 1.25`}
            interpretation="Over the sample period, when the market excess return changed by 1 percentage point, the stock's excess return tended to change by approximately 1.25 percentage points in the same direction, on average."
          />
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">Three words that matter</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {["tended to", "approximately", "on average"].map((w) => (
                <span key={w} className="rounded-full border border-accent-amber/40 bg-accent-amber/10 px-4 py-1.5 font-mono text-[14px] text-accent-amber">
                  {w}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
              Beta is <em>not</em> an exact next-period prediction. The stock will not always move
              exactly 1.25 times the market.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== INTERACTION 1 — BUILD THE REGRESSION LINE ===================== */}
      <ConceptSection
        index="7.4.5"
        eyebrow="Interaction · Build the regression line"
        title="Classify, estimate, then reveal"
        intro="Read the scatter, pick a slope, then reveal the fitted line and its residuals."
      >
        <Reveal>
          <InteractiveFrame>
            <BetaRegressionBuilder />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 5 — SLOPE VS SCATTER ===================== */}
      <ConceptSection
        index="7.4.6"
        eyebrow="Section 5 · Slope and scatter are different"
        title="Beta asks what; R² asks how well"
        intro="Beta and R² answer two different questions about the same regression."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Beta asks</div>
              <p className="mt-3 text-[17px] leading-[1.55] text-white">How strongly does the asset tend to respond to the market?</p>
            </div>
            <div className="rounded-2xl border border-accent-purple/25 bg-accent-purple/[0.05] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-purple">R² asks</div>
              <p className="mt-3 text-[17px] leading-[1.55] text-white">How much of the asset&apos;s historical variation did the market regression explain?</p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <Panel>
            <div className="max-w-xl">
              <BlockMath>{String.raw`R^2 = 32\%`}</BlockMath>
            </div>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
              Approximately 32% of the stock&apos;s return variation in the sample was associated with the
              fitted market relationship.
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-accent-amber/90">
              The remaining 68% is variation <em>not explained by this particular regression</em>. It is
              not necessarily pure firm-specific risk — it may include omitted factors and noise.
            </p>
          </Panel>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">Same beta, different R²</div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[200px] border-collapse text-[15px]">
                  <thead>
                    <tr className="border-b border-white/20 text-left">
                      <th className="py-2 pr-6 font-mono text-[12px] uppercase tracking-[0.12em] text-slate-400">Asset</th>
                      <th className="py-2 pr-6 font-mono text-[12px] uppercase tracking-[0.12em] text-slate-400">Beta</th>
                      <th className="py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-slate-400">R²</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums text-slate-100">
                    <tr className="border-b border-white/5"><td className="py-2 pr-6">A</td><td className="py-2 pr-6">1.2</td><td className="py-2 text-accent-green">70%</td></tr>
                    <tr><td className="py-2 pr-6">B</td><td className="py-2 pr-6">1.2</td><td className="py-2 text-accent-red">18%</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[14px] leading-[1.55] text-slate-400">Same estimated sensitivity; different tightness around the line.</p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">Different beta, same R²</div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[200px] border-collapse text-[15px]">
                  <thead>
                    <tr className="border-b border-white/20 text-left">
                      <th className="py-2 pr-6 font-mono text-[12px] uppercase tracking-[0.12em] text-slate-400">Asset</th>
                      <th className="py-2 pr-6 font-mono text-[12px] uppercase tracking-[0.12em] text-slate-400">Beta</th>
                      <th className="py-2 font-mono text-[12px] uppercase tracking-[0.12em] text-slate-400">R²</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono tabular-nums text-slate-100">
                    <tr className="border-b border-white/5"><td className="py-2 pr-6">C</td><td className="py-2 pr-6 text-accent-green">0.6</td><td className="py-2">45%</td></tr>
                    <tr><td className="py-2 pr-6">D</td><td className="py-2 pr-6 text-accent-red">1.5</td><td className="py-2">45%</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[14px] leading-[1.55] text-slate-400">Same proportion explained; different response magnitude.</p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required conclusion</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Beta measures slope. R² measures fit.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 6 — RESIDUALS ===================== */}
      <ConceptSection
        index="7.4.7"
        eyebrow="Section 6 · Residuals explain period-by-period deviations"
        title="Why points do not sit on the line"
        intro="Beta describes the fitted market component; residuals explain the gap between each actual point and the line."
      >
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <ul className="space-y-3 font-mono text-[15px] text-slate-200">
              <li><InlineMath>{String.raw`\hat{\beta} = 1.25`}</InlineMath></li>
              <li>Market excess return: <InlineMath>{String.raw`4\%`}</InlineMath></li>
              <li>Predicted market-linked stock return: <InlineMath>{String.raw`1.25 \times 4\% = 5\%`}</InlineMath></li>
              <li>Actual stock excess return: <InlineMath>{String.raw`2\%`}</InlineMath></li>
              <li className="text-accent-amber">Approximate residual: <InlineMath>{String.raw`\varepsilon = 2\% - 5\% = -3\%`}</InlineMath></li>
            </ul>
          </div>
        </Reveal>
        <Reveal>
          <ul className="space-y-2.5">
            {[
              "Beta describes the fitted market component.",
              "Residuals explain why actual points do not lie exactly on the line.",
              "Company events and omitted influences may create residuals.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required statement</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Beta is an average relationship, not a mechanical return multiplier.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 7 — CONNECT TO COVARIANCE ===================== */}
      <ConceptSection
        index="7.4.8"
        eyebrow="Section 7 · Connect regression to the covariance formula"
        title="The same relationship, two forms"
        intro="The regression slope and the covariance-over-variance formula describe the same stock-versus-market relationship."
      >
        <Reveal>
          <FormulaExplainer
            label="Beta from covariance and variance"
            tone="cyan"
            formula={String.raw`\hat{\beta}_i = \frac{\widehat{\operatorname{Cov}}(R_i, R_M)}{\widehat{\operatorname{Var}}(R_M)}`}
            substitution={String.raw`\hat{\beta} = \frac{0.024}{0.020}`}
            result="= 1.20"
            interpretation="The covariance formula and the regression slope describe the same simple stock-versus-market relationship. You are not asked to compute covariance from a long raw dataset here."
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 8 — BETA ESTIMATED WITH UNCERTAINTY ===================== */}
      <ConceptSection
        index="7.4.9"
        eyebrow="Section 8 · Beta is estimated with uncertainty"
        title="An estimate, not a fact"
        intro="Because beta is computed from a sample of returns, the slope estimate comes with a standard error."
      >
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">Estimate</div>
                <div className="mt-2"><BlockMath>{String.raw`\hat{\beta} = 1.25`}</BlockMath></div>
              </div>
              <div>
                <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">Standard error</div>
                <div className="mt-2"><BlockMath>{String.raw`SE(\hat{\beta}) = 0.18`}</BlockMath></div>
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Standard error, intuitively">
            The standard error describes how imprecisely the slope has been estimated from the sample.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">A rough uncertainty range</div>
            <div className="mt-3 max-w-xl">
              <BlockMath>{String.raw`\hat{\beta} \pm 2\,SE = 1.25 \pm 0.36`}</BlockMath>
            </div>
            <div className="mt-2 max-w-xl">
              <BlockMath>{String.raw`\approx 0.89 \text{ to } 1.61`}</BlockMath>
            </div>
            <p className="mt-3 text-[15px] leading-[1.6] text-slate-300">
              An approximate uncertainty range — not a guarantee or a permanent interval.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required conclusion</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              The data do not prove that the asset&apos;s beta is exactly 1.25.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== INTERACTION 2 — SLOPE VS SCATTER LAB ===================== */}
      <ConceptSection
        index="7.4.10"
        eyebrow="Interaction · Slope versus scatter"
        title="Separate sensitivity from noise"
        intro="Two controls: market sensitivity (steepens the line, raises beta) and company-specific noise (spreads points, lowers R²). Build the three target combinations."
      >
        <Reveal>
          <InteractiveFrame>
            <SlopeScatterLab />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 9 — WHY ESTIMATED BETA CHANGES ===================== */}
      <ConceptSection
        index="7.4.11"
        eyebrow="Section 9 · Why estimated beta changes"
        title="Five sources of instability"
        intro="The same stock can produce different beta estimates from different reasonable estimation choices."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[
              { n: 1, t: "Time window", d: "A two-year estimate may differ from a ten-year estimate." },
              { n: 2, t: "Return frequency", d: "Daily, weekly, and monthly observations can produce different estimates." },
              { n: 3, t: "Market proxy", d: "Beta relative to a domestic index may differ from beta relative to a global index." },
              { n: 4, t: "Unusual periods", d: "Crises, sharp rallies, regulatory events, or structural shocks may influence the result." },
              { n: 5, t: "Business and capital-structure changes", d: "Acquisitions, divestitures, operating leverage, and financial leverage may change equity beta." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-accent-cyan/50 font-mono text-[13px] text-accent-cyan">{s.n}</span>
                  <span className="font-mono text-[13px] uppercase tracking-[0.14em] text-slate-200">{s.t}</span>
                </div>
                <p className="mt-3 text-[15px] leading-[1.6] text-slate-300">{s.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required statement</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Beta is always relative to a benchmark, sample period, and estimation method.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 10 — HISTORICAL VS FUTURE BETA ===================== */}
      <ConceptSection
        index="7.4.12"
        eyebrow="Section 10 · Historical beta versus future beta"
        title="CAPM needs the beta relevant to future returns"
        intro="Regression provides an estimate of how the asset behaved in the past — not a guarantee about the future."
      >
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <div className="max-w-xl">
              <BlockMath>{String.raw`\text{historical estimated beta} \;\neq\; \text{guaranteed future beta}`}</BlockMath>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">Business example</div>
            <p className="mt-3 text-[17px] leading-[1.6] text-slate-200">
              A historically defensive company sells its stable division and enters a highly cyclical
              industry.
            </p>
            <p className="mt-3 text-[20px] leading-[1.45] text-white">
              Should its old historical beta still be used automatically?
            </p>
            <p className="mt-3 text-[16px] leading-[1.6] text-accent-green">
              No. A statistically correct historical estimate may no longer represent the company&apos;s
              current business risk.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required conclusion</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              A useful beta should make sense statistically and economically.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== INTERACTION 3 — BETA ACROSS WINDOWS ===================== */}
      <ConceptSection
        index="7.4.13"
        eyebrow="Interaction · Beta across different windows"
        title="Same company, different estimates"
        intro="Helix Industries moved through three phases. Choose a window and watch both the beta estimate and its uncertainty change."
      >
        <Reveal>
          <InteractiveFrame>
            <BetaWindowExplorer />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 11 — READ A REGRESSION OUTPUT ===================== */}
      <ConceptSection
        index="7.4.14"
        eyebrow="Section 11 · Read a regression output"
        title="Nova — interpret every line"
        intro="A single regression printout contains beta, the standard error, R², and alpha. Interpret each one carefully."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Nova — fitted regression</div>
            <div className="mt-3 max-w-xl">
              <BlockMath>{String.raw`R_{\text{Nova},t} - R_{f,t} = 0.12\% + 1.30\,\bigl(R_{M,t} - R_{f,t}\bigr) + \varepsilon_t`}</BlockMath>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse text-[15px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Statistic</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-cyan">Estimate</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                {[
                  { k: "Alpha", v: "0.12% monthly" },
                  { k: "Beta", v: "1.30" },
                  { k: "Beta standard error", v: "0.20" },
                  { k: "R²", v: "27%" },
                  { k: "Sample", v: "60 monthly observations" },
                ].map((r) => (
                  <tr key={r.k} className="border-b border-white/5">
                    <td className="py-3 pr-8 text-slate-300">{r.k}</td>
                    <td className="py-3">{r.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { label: "Beta", text: "Nova historically had greater market exposure than the benchmark.", tone: "cyan" as const },
              { label: "R²", text: "The market regression explained approximately 27% of Nova's sample return variation.", tone: "purple" as const },
              { label: "Standard error", text: "The beta estimate is uncertain and should not be treated as exactly 1.30.", tone: "amber" as const },
              { label: "Alpha", text: "The fitted intercept was positive, but this alone does not establish skill or future outperformance.", tone: "green" as const },
            ].map((c) => (
              <div
                key={c.label}
                className={cn(
                  "rounded-xl border p-4",
                  c.tone === "cyan" && "border-accent-cyan/25 bg-accent-cyan/[0.05]",
                  c.tone === "purple" && "border-accent-purple/25 bg-accent-purple/[0.05]",
                  c.tone === "amber" && "border-accent-amber/25 bg-accent-amber/[0.05]",
                  c.tone === "green" && "border-accent-green/25 bg-accent-green/[0.05]",
                )}
              >
                <div
                  className={cn(
                    "font-mono text-[12px] uppercase tracking-[0.14em]",
                    c.tone === "cyan" && "text-accent-cyan",
                    c.tone === "purple" && "text-accent-purple",
                    c.tone === "amber" && "text-accent-amber",
                    c.tone === "green" && "text-accent-green",
                  )}
                >
                  {c.label}
                </div>
                <p className="mt-2 text-[15px] leading-[1.55] text-slate-200">{c.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== EXERCISE — READ THE REGRESSION ===================== */}
      <ConceptSection
        index="7.4.15"
        eyebrow="Exercise · Read the regression"
        title="Read off beta, then interpret"
        intro={<>Given the fitted regression <InlineMath>{String.raw`R_i - R_f = -0.05\% + 0.85\,(R_M - R_f) + \varepsilon_i`}</InlineMath>, with <InlineMath>{String.raw`R^2 = 40\%`}</InlineMath> and <InlineMath>{String.raw`SE(\hat{\beta}) = 0.12`}</InlineMath>.</>}
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check beta"
              retryLabel="Clear wrong answers"
              groups={[
                {
                  heading: "Estimated beta",
                  hint: "Beta is the coefficient on (R_M − R_f).",
                  fields: [
                    { id: "beta", label: "Estimated β̂", answer: 0.85, tolerance: 0.01, hints: ["Read the slope coefficient.", "= 0.85."], solution: "The slope coefficient is 0.85." },
                  ],
                },
              ]}
              interpretationTone="correct"
              interpretation={<span>The fitted slope is 0.85 — the stock&apos;s estimated market sensitivity.</span>}
              extraOnSolved={
                <div className="space-y-4">
                  <FinalCheckRow
                    prompt="2. Interpret beta = 0.85."
                    options={[
                      { id: "a", label: "The stock historically had approximately 85% of the benchmark's systematic market exposure" },
                      { id: "b", label: "The stock earns 0.85% per year" },
                      { id: "c", label: "The stock is risk-free" },
                    ]}
                    correctId="a"
                    answerLabel="≈85% market exposure"
                    feedback="Beta is the slope: about 85% of the benchmark's systematic exposure, on average."
                  />
                  <FinalCheckRow
                    prompt="3. Interpret R² = 40%."
                    options={[
                      { id: "a", label: "The selected market regression explained approximately 40% of the stock's sample return variation" },
                      { id: "b", label: "The stock's beta is 0.40" },
                    ]}
                    correctId="a"
                    answerLabel="40% of variation explained"
                    feedback="R² measures fit — the fraction of sample variation the regression explains — not the slope."
                  />
                  <FinalCheckRow
                    prompt="4. Does beta below one mean the stock is safe?"
                    options={[
                      { id: "a", label: "No — it has lower market exposure but may still have substantial other volatility" },
                      { id: "b", label: "Yes — low beta means low total risk" },
                    ]}
                    correctId="a"
                    answerLabel="No"
                    feedback="No. Beta captures only the market-related component. The stock may still have large company-specific swings."
                  />
                  <FinalCheckRow
                    prompt="5. Should this beta be used permanently?"
                    options={[
                      { id: "a", label: "No — it should be reassessed when the sample, benchmark, business model, or capital structure changes" },
                      { id: "b", label: "Yes — once estimated, beta is fixed forever" },
                    ]}
                    correctId="a"
                    answerLabel="No"
                    feedback="No. Beta is relative to a benchmark, sample, and method, and should be revised when the business or capital structure changes."
                  />
                </div>
              }
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== EXPLICIT ENDING ===================== */}
      <ConceptSection
        index="7.4.16"
        eyebrow="Explicit ending · The takeaway"
        title="Beta is an evidence-based estimate, not a permanent fact"
        intro="This conclusion must be visible before the completion gate."
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <div className="max-w-xl">
              <BlockMath>{String.raw`\boxed{\begin{aligned} \hat{\beta} &:\ \text{estimated market sensitivity} \\ R^2 &:\ \text{fraction of sample variation explained} \\ \varepsilon &:\ \text{period-specific unexplained return} \\ SE(\hat{\beta}) &:\ \text{uncertainty in the beta estimate} \end{aligned}}`}</BlockMath>
            </div>
            <ul className="mt-6 space-y-2.5">
              {[
                "Regression provides an evidence-based beta estimate, not a permanent or perfectly precise fact.",
                "A useful beta should be evaluated both statistically and economically.",
                "Historical beta is an input to judgment, not a substitute for judgment.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                  <span className="text-[17px] leading-[1.6] text-slate-100">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== FINAL CHECK ===================== */}
      <ConceptSection
        index="7.4.17"
        eyebrow="Final check · The core conclusions"
        title="Confirm what beta estimation does and does not mean"
        intro="Five questions on the regression, R², residuals, and uncertainty."
      >
        <Reveal>
          <InteractiveFrame>
            <div className="space-y-4">
              <FinalCheckRow
                prompt="1. What is beta in the stock-versus-market regression?"
                options={[
                  { id: "a", label: "The slope of the fitted line" },
                  { id: "b", label: "The tightness of fit" },
                  { id: "c", label: "The intercept" },
                ]}
                correctId="a"
                answerLabel="The slope"
                feedback="Beta is the slope. The intercept is alpha, and tightness of fit is R²."
              />
              <FinalCheckRow
                prompt="2. What does R² measure?"
                options={[
                  { id: "a", label: "The fraction of the asset's sample variation explained by the market regression" },
                  { id: "b", label: "The asset's market sensitivity" },
                ]}
                correctId="a"
                answerLabel="Fit"
                feedback="R² measures fit, not slope."
              />
              <FinalCheckRow
                prompt="3. Are residuals only firm-specific risk?"
                options={[
                  { id: "a", label: "No — they are variation not explained by this regression, which may include omitted factors and noise" },
                  { id: "b", label: "Yes — residuals are always pure firm-specific risk" },
                ]}
                correctId="a"
                answerLabel="No"
                feedback="No. Residuals are whatever the regression does not explain — they may include omitted factors and noise."
              />
              <FinalCheckRow
                prompt="4. What does the standard error of beta describe?"
                options={[
                  { id: "a", label: "How imprecisely the slope was estimated from the sample" },
                  { id: "b", label: "The average residual" },
                ]}
                correctId="a"
                answerLabel="Estimation uncertainty"
                feedback="The standard error describes the imprecision of the beta estimate from the sample."
              />
              <FinalCheckRow
                prompt="5. Is historical beta the same as guaranteed future beta?"
                options={[
                  { id: "a", label: "No — it is how the asset behaved in the past, and should be revised when the business changes" },
                  { id: "b", label: "Yes — past beta guarantees future beta" },
                ]}
                correctId="a"
                answerLabel="No"
                feedback="No. Historical beta is an estimate of past behavior and may not represent future risk."
              />
            </div>
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== TRANSITION TO 7.5 ===================== */}
      <ConceptSection
        index="7.4.18"
        eyebrow="Transition · Toward alpha and performance"
        title="If returns repeatedly exceed what beta justifies"
        intro="The regression intercept reappears in the next lesson as a measure of performance."
        topMargin="mt-12"
      >
        <Reveal>
          <Panel>
            <p className="text-[17px] leading-[1.7] text-slate-200">
              Beta gives CAPM its benchmark required return. But the regression also produced an
              intercept — alpha:
            </p>
            <div className="mt-4 max-w-xl">
              <BlockMath>{String.raw`\alpha_i`}</BlockMath>
            </div>
            <p className="mt-4 text-[20px] leading-[1.45] text-accent-cyan">
              If an investment repeatedly earns more than its estimated beta appears to justify, does
              that prove skill — or did CAPM fail to capture another risk?
            </p>
            <p className="mt-4 text-[15px] leading-[1.6] text-slate-400">
              That question is the heart of Lesson 7.5 — Alpha, Performance Evaluation, and the Limits
              of CAPM.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-16">
        <MasteryCheck
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Alpha, Performance, and the Limits of CAPM"
          continueHref="/lessons/capm-alpha-and-performance"
          questions={QUESTIONS}
        />
      </Reveal>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Alpha, Performance, and the Limits of CAPM"
          continueHref="/lessons/capm-alpha-and-performance"
        />
      </Reveal>

      <Reveal className="mt-8">
        <CAPMSourcePanel />
      </Reveal>
    </CAPMLayout>
  );
}
