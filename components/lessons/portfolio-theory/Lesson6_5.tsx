"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
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
  MathDerivationStepper,
  type DerivationStep,
  CalculationWorksheet,
} from "./shared";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import ExpandableQA from "@/components/lessons/equities/ExpandableQA";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import PTLayout from "./PTLayout";
import PTSourcePanel from "./PTSourcePanel";
import { useReportPTComplete } from "@/lib/pt-progress";
import {
  MIT_EXPECTED_RETURNS,
  MIT_COVARIANCE_MATRIX,
  MIT_RISK_FREE_RATE,
  portfolioExpectedReturn,
  portfolioStandardDeviation,
  tangencyPortfolio,
  sharpeRatio,
} from "@/lib/portfolio-theory";

const LEARNING_OBJECTIVES = [
  "Explain why a risk-free asset appears at (0, r_f) on the risk-return graph.",
  "Derive why combining a fixed risky portfolio with the risk-free asset produces a straight line.",
  "Define the Sharpe ratio as the slope of the allocation line.",
  "Identify the tangency portfolio as the maximum-Sharpe risky portfolio.",
  "Distinguish lending, full investment, and leverage positions along the same line.",
  "State the two-fund separation principle and its assumptions.",
  "Recognize the limitations of the mean-variance framework with a risk-free asset.",
];

const SUMMARY_POINTS = [
  "A risk-free asset appears at (0, r_f) on the risk-return graph.",
  "Combining a fixed risky portfolio with rf creates a straight allocation line.",
  "The line's slope equals the Sharpe ratio: (E[R_P] - r_f)/σ_P.",
  "The tangency portfolio is the maximum-Sharpe risky portfolio.",
  "Investors can scale total risk using the same risky portfolio (two-fund separation).",
  "Lending (y<1) and leverage (y>1) are positions along the same line.",
  "Leverage does not improve the Sharpe ratio along the same line.",
  "These results depend on equal borrowing/lending rates, stable estimates, and mean-variance assumptions.",
  "The tangency portfolio is NOT automatically the market portfolio.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "rf = 2%, E[R_P] = 8%, σ_P = 12%, y = 0.5. What is E[R_C]?",
    choices: [
      { id: "a", label: "5%" },
      { id: "b", label: "8%" },
      { id: "c", label: "6%" },
    ],
    correctId: "a",
    hint: "E[R_C] = r_f + y(E[R_P] - r_f) = 2% + 0.5 × (8% - 2%) = 5%.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "Same setup. What is σ_C?",
    choices: [
      { id: "a", label: "6%" },
      { id: "b", label: "12%" },
      { id: "c", label: "0%" },
    ],
    correctId: "a",
    hint: "σ_C = y × σ_P = 0.5 × 12% = 6%.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "A portfolio has Sharpe = 0.542, rf = 2%, σ = 12%. What is E[R]?",
    choices: [
      { id: "a", label: "8.5%" },
      { id: "b", label: "2%" },
      { id: "c", label: "12%" },
    ],
    correctId: "a",
    hint: "E[R] = r_f + Sharpe × σ = 2% + 0.542 × 12% ≈ 8.5%.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "If y = 1.5, what is the risk-free weight?",
    choices: [
      { id: "a", label: "-50%" },
      { id: "b", label: "50%" },
      { id: "c", label: "150%" },
    ],
    correctId: "a",
    hint: "Risk-free weight = 1 - y = 1 - 1.5 = -0.5 = -50%.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "Two-fund separation means:",
    choices: [
      { id: "a", label: "Same risky portfolio, different total risk" },
      { id: "b", label: "Different risky portfolios for each investor" },
      { id: "c", label: "Only one portfolio is allowed" },
    ],
    correctId: "a",
    hint: "Every investor holds the same tangency portfolio; only the risky fraction y differs.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Is the tangency portfolio the market portfolio?",
    choices: [
      { id: "a", label: "Not yet — needs CAPM equilibrium assumptions" },
      { id: "b", label: "Yes, always" },
      { id: "c", label: "Only if rf = 0" },
    ],
    correctId: "a",
    hint: "The tangency portfolio is the maximum-Sharpe portfolio. Calling it the market portfolio requires equilibrium assumptions not covered here.",
  },
];

const RF = 2;
const RP_ER = 8;
const RP_SD = 12;

const LINE_POINTS = [
  { y: 0.0, er: 2.0, sd: 0.0 },
  { y: 0.25, er: 3.5, sd: 3.0 },
  { y: 0.5, er: 5.0, sd: 6.0 },
  { y: 0.75, er: 6.5, sd: 9.0 },
  { y: 1.0, er: 8.0, sd: 12.0 },
];

const CW = 560;
const CH = 360;
const CPAD_L = 54;
const CPAD_R = 24;
const CPAD_T = 20;
const CPAD_B = 44;
const X_MIN = 0;
const X_MAX = 20;
const Y_MIN = 0;
const Y_MAX = 15;
const X_TICKS = [0, 5, 10, 15, 20];
const Y_TICKS = [0, 3, 6, 9, 12, 15];

function sx(x: number): number {
  return CPAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * (CW - CPAD_L - CPAD_R);
}
function sy(y: number): number {
  return CPAD_T + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * (CH - CPAD_T - CPAD_B);
}
function buildPath(pts: { x: number; y: number }[]): string {
  return "M " + pts.map((p) => `${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" L ");
}

function ChartAxes() {
  return (
    <>
      {X_TICKS.map((t) => (
        <g key={`xt${t}`}>
          <line x1={sx(t)} x2={sx(t)} y1={CPAD_T} y2={CH - CPAD_B} stroke="rgba(255,255,255,0.06)" />
          <text x={sx(t)} y={CH - CPAD_B + 20} fill="rgba(148,163,184,0.85)" fontSize="13" fontFamily="monospace" textAnchor="middle">
            {t}%
          </text>
        </g>
      ))}
      {Y_TICKS.map((t) => (
        <g key={`yt${t}`}>
          <line x1={CPAD_L} x2={CW - CPAD_R} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
          <text x={CPAD_L - 12} y={sy(t) + 5} fill="rgba(148,163,184,0.85)" fontSize="13" fontFamily="monospace" textAnchor="end">
            {t}%
          </text>
        </g>
      ))}
      <text x={(CPAD_L + CW - CPAD_R) / 2} y={CH - 6} fill="rgba(148,163,184,0.9)" fontSize="14" textAnchor="middle">
        σ (risk, %)
      </text>
      <text x={16} y={(CPAD_T + CH - CPAD_B) / 2} fill="rgba(148,163,184,0.9)" fontSize="14" textAnchor="middle" transform={`rotate(-90 16 ${(CPAD_T + CH - CPAD_B) / 2})`}>
        E[R] (%)
      </text>
    </>
  );
}

function ChartFrame({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full min-w-[400px]" role="img" aria-label={ariaLabel}>
        <ChartAxes />
        {children}
      </svg>
    </div>
  );
}

const SHARPE_PORTFOLIOS = [
  { id: "A", er: 7, sd: 10, excess: 5, sharpe: 0.5 },
  { id: "B", er: 8.5, sd: 12, excess: 6.5, sharpe: 0.542 },
  { id: "C", er: 10, sd: 16, excess: 8, sharpe: 0.5 },
];

const LINE_DERIVATION: DerivationStep[] = [
  {
    heading: "Both quantities scale with y",
    explanation:
      "The expected excess return is y × (E[R_P] − r_f), and the volatility is y × σ_P. Both are proportional to y.",
    formula: String.raw`E[R_C] - r_f = y(E[R_P] - r_f), \qquad \sigma_C = y\sigma_P`,
    changeNote: "The risk-free asset contributes no variance, so σ_C is perfectly linear in y.",
  },
  {
    heading: "Divide — y cancels",
    explanation:
      "Divide the excess return by the volatility. The y in each cancels, leaving a constant ratio independent of y.",
    formula: String.raw`\frac{E[R_C] - r_f}{\sigma_C} = \frac{E[R_P] - r_f}{\sigma_P} = \text{constant}`,
    changeNote: "A constant ratio of y-coordinates to x-coordinates is exactly a straight line.",
  },
  {
    heading: "Write the line equation",
    explanation:
      "That constant is the slope. The line starts at (0, r_f) and rises with that slope — the allocation line.",
    formula: String.raw`E[R_C] = r_f + \frac{E[R_P] - r_f}{\sigma_P}\,\sigma_C`,
    changeNote: "The slope (E[R_P] − r_f)/σ_P is the Sharpe ratio of the risky portfolio.",
  },
];

function LineBuilder() {
  const reduce = useReducedMotion();
  const [solved, setSolved] = useState<boolean[]>([false, false, false, false, false]);
  const allSolved = solved.every(Boolean);

  const markSolved = (i: number) =>
    setSolved((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });

  return (
    <div>
      <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
        Fill in the expected return and volatility for each value of y. Once a row is
        correct, its point appears on the chart. Use{" "}
        <InlineMath>{String.raw`r_f = 2\%`}</InlineMath>,{" "}
        <InlineMath>{String.raw`E[R_P] = 8\%`}</InlineMath>,{" "}
        <InlineMath>{String.raw`\sigma_P = 12\%`}</InlineMath>.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          {LINE_POINTS.map((pt, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                solved[i] ? "border-accent-green/40 bg-accent-green/[0.05]" : "border-white/12 bg-white/[0.03]",
              )}
            >
              <div className="font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
                y = <span className="text-accent-cyan">{pt.y.toFixed(2)}</span>
              </div>
              <CalculationWorksheet
                submitLabel={`Check y = ${pt.y.toFixed(2)}`}
                retryLabel="Clear"
                groups={[
                  {
                    fields: [
                      {
                        id: `er-${i}`,
                        label: "E[R_C] (%)",
                        answer: pt.er,
                        tolerance: 0.02,
                        unit: "%",
                        decimals: 2,
                        hints: [`E[R_C] = r_f + y(E[R_P] - r_f).`, `${RF}% + ${pt.y} × (${RP_ER}% - ${RF}%)`],
                        solution: <span>{RF}% + {pt.y} × {RP_ER - RF}% = {pt.er}%</span>,
                      },
                      {
                        id: `sd-${i}`,
                        label: "σ_C (%)",
                        answer: pt.sd,
                        tolerance: 0.02,
                        unit: "%",
                        decimals: 2,
                        hints: ["σ_C = y × σ_P.", `${pt.y} × ${RP_SD}%`],
                        solution: <span>{pt.y} × {RP_SD}% = {pt.sd}%</span>,
                      },
                    ],
                  },
                ]}
                onSolved={() => markSolved(i)}
              />
            </div>
          ))}
        </div>

        <div>
          <ChartFrame ariaLabel="Risk-free allocation line builder">
            {LINE_POINTS.map((pt, i) =>
              solved[i] ? (
                <motion.circle
                  key={i}
                  cx={sx(pt.sd)}
                  cy={sy(pt.er)}
                  r={6}
                  fill="rgba(34,211,238,1)"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth={1.5}
                  initial={reduce ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ transformOrigin: `${sx(pt.sd)}px ${sy(pt.er)}px` }}
                />
              ) : null,
            )}
            {LINE_POINTS.map((pt, i) =>
              solved[i] ? (
                <text key={`l${i}`} x={sx(pt.sd) + 9} y={sy(pt.er) - 7} fill="rgba(34,211,238,0.9)" fontSize="13" fontFamily="monospace">
                  y={pt.y.toFixed(2)}
                </text>
              ) : null,
            )}
            {allSolved && (
              <motion.line
                x1={sx(0)}
                y1={sy(RF)}
                x2={sx(RP_SD * 1.3)}
                y2={sy(RF + 1.3 * (RP_ER - RF))}
                stroke="rgba(34,211,238,0.6)"
                strokeWidth={2.5}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}
            <circle cx={sx(0)} cy={sy(RF)} r={6} fill="rgba(251,191,36,0.95)" stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
            <text x={sx(0) + 10} y={sy(RF) + 5} fill="rgba(251,191,36,0.95)" fontSize="13" fontFamily="monospace">
              r_f
            </text>
          </ChartFrame>
          <p className="mt-2 text-[14px] text-slate-500">
            Each additional 25% in y adds exactly 3pp volatility and 1.5pp expected return.
          </p>
        </div>
      </div>

      {allSolved && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-5 rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5"
        >
          <div className="text-[16px] leading-[1.6] text-slate-200">
            Five points, evenly spaced — they lie on a straight line because both excess
            return and volatility scale by the same factor y.
          </div>
        </motion.div>
      )}
    </div>
  );
}

function MaxSharpeChallenge() {
  const reduce = useReducedMotion();
  const [bestAnswered, setBestAnswered] = useState(false);
  const [whyAnswered, setWhyAnswered] = useState(false);
  const both = bestAnswered && whyAnswered;

  return (
    <div>
      <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
        Three portfolios are available. With <InlineMath>{String.raw`r_f = 2\%`}</InlineMath>,
        compute the excess return and Sharpe ratio for each, then identify the
        maximum-Sharpe portfolio.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SHARPE_PORTFOLIOS.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
            <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">Portfolio {p.id}</div>
            <div className="mt-2 font-sans text-[14px] text-slate-200">E[R] = {p.er}%, σ = {p.sd}%</div>
            <div className="mt-3">
              <CalculationWorksheet
                submitLabel={`Check ${p.id}`}
                retryLabel="Clear"
                groups={[
                  {
                    fields: [
                      {
                        id: `ex-${p.id}`,
                        label: "Excess return (%)",
                        answer: p.excess,
                        tolerance: 0.02,
                        unit: "%",
                        hints: ["E[R] − r_f.", `${p.er}% − ${RF}%`],
                        solution: <span>{p.er}% − {RF}% = {p.excess}%</span>,
                      },
                      {
                        id: `sh-${p.id}`,
                        label: "Sharpe ratio",
                        answer: p.sharpe,
                        tolerance: 0.005,
                        unit: "",
                        decimals: 3,
                        hints: ["(E[R] − r_f) / σ.", `${p.excess}% / ${p.sd}%`],
                        solution: <span>{p.excess} / {p.sd} = {p.sharpe.toFixed(3)}</span>,
                      },
                    ],
                  },
                ]}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <ChoiceBlock
          prompt="Which portfolio has the highest Sharpe ratio?"
          options={[
            { id: "A", label: "Portfolio A" },
            { id: "B", label: "Portfolio B" },
            { id: "C", label: "Portfolio C" },
          ]}
          correctId="B"
          feedbackCorrect="Portfolio B has Sharpe = 0.542, the highest. Its allocation line from (0, r_f) is the steepest."
          feedbackIncorrect="Portfolio B has Sharpe = 0.542, the highest. Even though C has the highest return, B has the best excess return per unit of risk."
          onAnswered={() => setBestAnswered(true)}
        />
        <ChoiceBlock
          prompt="Why isn't Portfolio C selected, despite the highest expected return?"
          options={[
            { id: "a", label: "Additional excess return not large enough relative to higher volatility" },
            { id: "b", label: "Its return is negative" },
            { id: "c", label: "It has zero risk" },
          ]}
          correctId="a"
          feedbackCorrect="C's extra 1.5% of excess return comes with 4% more volatility. The ratio falls to 0.500, below B's 0.542. Sharpe measures efficiency, not absolute return."
          feedbackIncorrect="C earns 10% expected return, but its 8% excess return requires 16% volatility — the ratio (0.500) is below B's (0.542)."
          onAnswered={() => setWhyAnswered(true)}
        />
      </div>

      {both && (
        <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <ChartFrame ariaLabel="Three allocation lines from the risk-free rate, Portfolio B's line steepest">
            <circle cx={sx(0)} cy={sy(RF)} r={6} fill="rgba(251,191,36,0.95)" stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
            <text x={sx(0) + 10} y={sy(RF) + 5} fill="rgba(251,191,36,0.95)" fontSize="13" fontFamily="monospace">r_f</text>
            {SHARPE_PORTFOLIOS.map((p) => {
              const isMax = p.sharpe === Math.max(...SHARPE_PORTFOLIOS.map((s) => s.sharpe));
              const slope = (p.er - RF) / p.sd;
              return (
                <line
                  key={p.id}
                  x1={sx(0)}
                  y1={sy(RF)}
                  x2={sx(X_MAX)}
                  y2={sy(RF + slope * X_MAX)}
                  stroke={isMax ? "rgba(34,211,238,0.9)" : "rgba(148,163,184,0.25)"}
                  strokeWidth={isMax ? 2.5 : 1.5}
                />
              );
            })}
            {SHARPE_PORTFOLIOS.map((p) => {
              const isMax = p.sharpe === Math.max(...SHARPE_PORTFOLIOS.map((s) => s.sharpe));
              return (
                <g key={`pt${p.id}`}>
                  <circle cx={sx(p.sd)} cy={sy(p.er)} r={isMax ? 6 : 4} fill={isMax ? "rgba(34,211,238,1)" : "rgba(148,163,184,0.6)"} stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
                  <text x={sx(p.sd) + 9} y={sy(p.er) - 7} fill={isMax ? "rgba(34,211,238,0.95)" : "rgba(148,163,184,0.7)"} fontSize="13" fontFamily="monospace">{p.id}</text>
                </g>
              );
            })}
            <text x={sx(16)} y={sy(11.5)} fill="rgba(34,211,238,0.9)" fontSize="13" fontFamily="monospace">B (steepest)</text>
          </ChartFrame>
          <p className="mt-2 text-[14px] text-slate-500">
            Each line starts at (0, r_f). The steepest line has the highest Sharpe ratio.
          </p>
        </motion.div>
      )}
    </div>
  );
}

function ChoiceBlock({
  prompt,
  options,
  correctId,
  feedbackCorrect,
  feedbackIncorrect,
  onAnswered,
}: {
  prompt: ReactNode;
  options: { id: string; label: string }[];
  correctId: string;
  feedbackCorrect: ReactNode;
  feedbackIncorrect: ReactNode;
  onAnswered?: () => void;
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
          const showAsCorrect = answered && opt.id === correctId;
          const showAsWrong = isSelected && !isCorrect;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={answered}
              onClick={() => {
                setSelected(opt.id);
                onAnswered?.();
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors",
                showAsCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                showAsWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                answered && !showAsCorrect && !showAsWrong && "border-white/10 text-slate-500",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3">
          <Feedback status={isCorrect ? "correct" : "incorrect"}>{isCorrect ? feedbackCorrect : feedbackIncorrect}</Feedback>
        </div>
      )}
    </div>
  );
}

function AllocationWorksheet() {
  const investors = [
    { id: "A", label: "Conservative", y: 0.4, rfWeight: 60, er: 4.4, sd: 4.8, classification: "Lending", note: "y = 0.40: 60% in rf, 40% in tangency. Lending at the risk-free rate." },
    { id: "B", label: "Moderate", y: 1.0, rfWeight: 0, er: 8, sd: 12, classification: "Fully invested", note: "y = 1.00: 100% in tangency, nothing in rf. Fully invested." },
    { id: "C", label: "Aggressive", y: 1.5, rfWeight: -50, er: 11, sd: 18, classification: "Borrowing / leverage", note: "y = 1.50: borrow 50% at rf, invest 150% in tangency. Leverage." },
  ];
  return (
    <div>
      <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
        Three investors choose different y with{" "}
        <InlineMath>{String.raw`r_f = 2\%`}</InlineMath>,{" "}
        <InlineMath>{String.raw`E[R_T] = 8\%`}</InlineMath>,{" "}
        <InlineMath>{String.raw`\sigma_T = 12\%`}</InlineMath>. Compute the risk-free
        weight, expected return, and volatility for each.
      </p>
      <div className="mt-6 space-y-5">
        {investors.map((inv) => (
          <div key={inv.id} className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
            <div className="font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Investor {inv.id} — {inv.label} · y = <span className="text-accent-cyan">{inv.y.toFixed(2)}</span>
            </div>
            <div className="mt-4">
              <CalculationWorksheet
                submitLabel={`Check investor ${inv.id}`}
                retryLabel="Clear"
                groups={[
                  {
                    fields: [
                      { id: `rfw-${inv.id}`, label: "Risk-free weight (%)", answer: inv.rfWeight, tolerance: 0.5, unit: "%", hints: ["1 − y.", `1 − ${inv.y}`], solution: <span>1 − {inv.y} = {inv.rfWeight}%</span> },
                      { id: `erc-${inv.id}`, label: "E[R_C] (%)", answer: inv.er, tolerance: 0.05, unit: "%", hints: ["r_f + y(E[R_T] − r_f).", `2% + ${inv.y} × 6%`], solution: <span>2% + {inv.y} × 6% = {inv.er}%</span> },
                      { id: `sdc-${inv.id}`, label: "σ_C (%)", answer: inv.sd, tolerance: 0.05, unit: "%", hints: ["y × σ_T.", `${inv.y} × 12%`], solution: <span>{inv.y} × 12% = {inv.sd}%</span> },
                    ],
                  },
                ]}
                interpretation={<span>{inv.note}</span>}
                interpretationTone="info"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <Feedback status="info">
          All three investors sit on the <em className="text-slate-100">same straight line</em>{" "}
          from <InlineMath>{String.raw`(0, r_f)`}</InlineMath> through the tangency
          portfolio. They differ only in their position along it — determined by y.
        </Feedback>
      </div>
    </div>
  );
}

function FinalCheck() {
  return (
    <div>
      <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
        Use <InlineMath>{String.raw`r_f = 3\%`}</InlineMath>. Two risky portfolios: X at{" "}
        <InlineMath>{String.raw`(\sigma = 10\%, E[R] = 9\%)`}</InlineMath> and Y at{" "}
        <InlineMath>{String.raw`(\sigma = 16\%, E[R] = 11\%)`}</InlineMath>.
      </p>
      <div className="mt-6">
        <CalculationWorksheet
          submitLabel="Check final"
          retryLabel="Clear wrong answers"
          groups={[
            {
              heading: "Sharpe ratios",
              fields: [
                { id: "sx", label: "Sharpe ratio of X (S_X)", answer: 0.6, tolerance: 0.005, decimals: 3, hints: ["(E[R_X] − r_f) / σ_X.", "(9% − 3%) / 10%"], solution: <span>(9 − 3) / 10 = 0.600</span> },
                { id: "sy", label: "Sharpe ratio of Y (S_Y)", answer: 0.5, tolerance: 0.005, decimals: 3, hints: ["(E[R_Y] − r_f) / σ_Y.", "(11% − 3%) / 16%"], solution: <span>(11 − 3) / 16 = 0.500</span> },
              ],
            },
            {
              heading: "Combine X with rf using y = 0.50",
              fields: [
                { id: "erc", label: "E[R_C] (%)", answer: 6, tolerance: 0.02, unit: "%", hints: ["r_f + y(E[R_X] − r_f).", "3% + 0.50 × 6%"], solution: <span>3% + 0.50 × 6% = 6.0%</span> },
                { id: "sdc", label: "σ_C (%)", answer: 5, tolerance: 0.02, unit: "%", hints: ["y × σ_X.", "0.50 × 10%"], solution: <span>0.50 × 10% = 5.0%</span> },
              ],
            },
          ]}
        />
      </div>
      <div className="mt-5 space-y-4">
        <ChoiceBlock
          prompt="Why is X a better risky portfolio than Y for combining with rf?"
          options={[
            { id: "a", label: "X has a higher Sharpe ratio — steeper allocation line" },
            { id: "b", label: "X has higher expected return" },
            { id: "c", label: "X has lower correlation with rf" },
          ]}
          correctId="a"
          feedbackCorrect="X has Sharpe = 0.600 vs Y's 0.500. A steeper line means more excess return per unit of risk at every volatility level."
          feedbackIncorrect="X actually has lower expected return (9% vs 11%). The key is the Sharpe ratio: X's 0.600 beats Y's 0.500."
        />
        <ChoiceBlock
          prompt="The 50/50 combination (y = 0.50) and full investment (y = 1.0) in X both…"
          options={[
            { id: "a", label: "Lie on the same straight line from (0, r_f)" },
            { id: "b", label: "Have the same Sharpe ratio as Y" },
            { id: "c", label: "Are outside the feasible set" },
          ]}
          correctId="a"
          feedbackCorrect="Every combination of rf and portfolio X lies on one straight line. The slope is X's Sharpe ratio everywhere along the line."
          feedbackIncorrect="All combinations of rf and portfolio X lie on the same line, sharing the same slope (Sharpe of X)."
        />
      </div>
    </div>
  );
}

export default function Lesson6_5() {
  const report = useReportPTComplete("portfolio-risk-free-tangency-sharpe");

  const tangencyWeights = tangencyPortfolio(MIT_COVARIANCE_MATRIX, MIT_EXPECTED_RETURNS, MIT_RISK_FREE_RATE)!;
  const tangencyER = portfolioExpectedReturn(tangencyWeights, MIT_EXPECTED_RETURNS) * 100;
  const tangencySD = portfolioStandardDeviation(tangencyWeights, MIT_COVARIANCE_MATRIX) * 100;
  const tangencySharpe = sharpeRatio(
    portfolioExpectedReturn(tangencyWeights, MIT_EXPECTED_RETURNS),
    MIT_RISK_FREE_RATE,
    portfolioStandardDeviation(tangencyWeights, MIT_COVARIANCE_MATRIX),
  );

  return (
    <PTLayout>
      <PVHero
        index="6.5"
        eyebrow="Lesson 6.5 · Module 6 — Portfolio Theory"
        heading="The Risk-Free Asset, Tangency Portfolio, and Sharpe Ratio"
        subheading="Why risk-free plus risky creates a straight line, what the Sharpe ratio measures, and why the tangency portfolio is the maximum-Sharpe portfolio."
        bullets={[
          "Risk-free asset has σ = 0",
          "Risky + risk-free = straight line",
          "Slope = Sharpe ratio",
          "Tangency = maximum Sharpe",
          "Two-fund separation",
        ]}
        primaryLabel="Start"
      />

      <Reveal className="mt-8">
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 sm:p-7">
          <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-slate-400">Learning objectives</div>
          <p className="mt-3 text-[16px] text-slate-300">By the end of this lesson, you should be able to:</p>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LEARNING_OBJECTIVES.map((o, i) => (
              <li key={o} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-sans text-[13px] text-accent-cyan">
                  {i + 1}
                </span>
                <span className="text-[16px] leading-[1.6] text-slate-200">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* ===================== SCENE 1 — RISK-FREE POINT ===================== */}
      <ConceptSection
        index="6.5.1"
        eyebrow="Scene 1 · The risk-free point"
        title="The risk-free asset"
        intro="A risk-free asset has a known return with zero volatility. On the risk-return graph it appears at (0, r_f) — directly on the vertical axis. A short-term Treasury bill is the standard example: the government promises a specific nominal return, so over the bill's maturity σ_f = 0."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Important caveat</div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                Risk-free in this model does not mean free of every economic risk. Treasury
                bills still carry:
              </p>
              <ul className="mt-3 space-y-2">
                <li className="text-[16px] leading-[1.6] text-slate-200">
                  • <strong className="text-white">Inflation risk</strong> — nominal return is known, real purchasing power is not.
                </li>
                <li className="text-[16px] leading-[1.6] text-slate-200">
                  • <strong className="text-white">Reinvestment risk</strong> — future rates are unknown when the bill matures.
                </li>
                <li className="text-[16px] leading-[1.6] text-slate-200">
                  • <strong className="text-white">Price risk if sold early</strong> — selling before maturity exposes you to market prices.
                </li>
              </ul>
            </div>
            <ChartFrame ariaLabel="Risk-free asset at zero volatility">
              <circle cx={sx(0)} cy={sy(RF)} r={7} fill="rgba(251,191,36,1)" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} />
              <text x={sx(0) + 11} y={sy(RF) + 5} fill="rgba(251,191,36,0.95)" fontSize="14" fontFamily="monospace">r_f (σ = 0)</text>
            </ChartFrame>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Risk-free rate (r_f)">
            The return on an asset with zero volatility in this model. It anchors the
            allocation line and is the baseline for measuring excess returns.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 2 — BUILD THE LINE ===================== */}
      <ConceptSection
        index="6.5.2"
        eyebrow="Scene 2 · Build the line manually"
        title="Risky + risk-free = a straight line"
        intro="Combine a fixed risky portfolio with the risk-free asset, changing only y — the fraction in the risky portfolio. Build the line point by point before any algebra."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Complete portfolio return</div>
              <div className="mt-3">
                <BlockMath>{String.raw`E[R_C] = r_f + y(E[R_P] - r_f)`}</BlockMath>
              </div>
            </div>
            <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Complete portfolio volatility</div>
              <div className="mt-3">
                <BlockMath>{String.raw`\sigma_C = y\sigma_P`}</BlockMath>
              </div>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            Because <InlineMath>{String.raw`\sigma_f = 0`}</InlineMath> and{" "}
            <InlineMath>{String.raw`\operatorname{Cov}(R_f, R_P) = 0`}</InlineMath>, the
            risk-free asset contributes no variance — volatility scales linearly with y.
          </p>
        </Reveal>

        <Reveal>
          <InteractiveFrame>
            <LineBuilder />
          </InteractiveFrame>
        </Reveal>

        <Reveal>
          <MathDerivationStepper
            steps={LINE_DERIVATION}
            title="Why it is a straight line"
            ariaSummary="The expected excess return and the volatility both scale linearly with y. Dividing excess return by volatility cancels y, leaving a constant ratio equal to the Sharpe ratio. A constant ratio is a straight line from (0, r_f)."
          />
        </Reveal>

        <Reveal>
          <FormulaExplainer
            label="Allocation line equation"
            formula={String.raw`E[R_C] = r_f + \frac{E[R_P] - r_f}{\sigma_P}\,\sigma_C`}
            meaning="The complete portfolio's expected return is a linear function of its volatility. The slope is the Sharpe ratio of the risky portfolio."
            variables={[
              { symbol: String.raw`r_f`, description: "Risk-free rate (the y-intercept)." },
              { symbol: String.raw`\sigma_C`, description: "Volatility of the complete portfolio." },
            ]}
            interpretation="Every combination of rf and portfolio P lies on this line — starting at (0, r_f) with slope equal to P's Sharpe ratio."
            tone="green"
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 3 — COMPARE ALLOCATION LINES ===================== */}
      <ConceptSection
        index="6.5.3"
        eyebrow="Scene 3 · Compare allocation lines"
        title="Not every allocation line is equally good"
        intro="Different risky portfolios produce different lines from (0, r_f). A steeper line delivers more excess return per unit of risk. Compute the Sharpe ratios first, then see the lines reveal the winner."
      >
        <Reveal>
          <InteractiveFrame>
            <MaxSharpeChallenge />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 4 — TANGENCY ===================== */}
      <ConceptSection
        index="6.5.4"
        eyebrow="Scene 4 · Tangency"
        title="The steepest line touches the frontier"
        intro="Rotate the line upward from (0, r_f). The steepest line that still touches the risky efficient frontier is tangent to it — and that contact point is the tangency portfolio, the maximum-Sharpe risky portfolio."
      >
        <Reveal>
          <ChartFrame ariaLabel="Three allocation lines from rf with the steepest tangent to the frontier">
            <circle cx={sx(0)} cy={sy(RF)} r={6} fill="rgba(251,191,36,0.95)" stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
            <text x={sx(0) + 10} y={sy(RF) + 5} fill="rgba(251,191,36,0.95)" fontSize="13" fontFamily="monospace">r_f</text>
            <line x1={sx(0)} y1={sy(RF)} x2={sx(X_MAX)} y2={sy(RF + 0.2 * X_MAX)} stroke="rgba(248,113,113,0.3)" strokeWidth={1.5} />
            <line x1={sx(0)} y1={sy(RF)} x2={sx(X_MAX)} y2={sy(RF + 0.4 * X_MAX)} stroke="rgba(251,191,36,0.35)" strokeWidth={1.5} />
            <line x1={sx(0)} y1={sy(RF)} x2={sx(X_MAX)} y2={sy(RF + 0.55 * X_MAX)} stroke="rgba(34,211,238,0.9)" strokeWidth={2.5} />
            <circle cx={sx(10)} cy={sy(RF + 0.55 * 10)} r={6} fill="rgba(34,211,238,1)" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} />
            <text x={sx(10) + 9} y={sy(RF + 0.55 * 10) - 7} fill="rgba(34,211,238,0.95)" fontSize="13" fontFamily="monospace">Tangency</text>
            <text x={sx(17)} y={sy(5.5)} fill="rgba(248,113,113,0.6)" fontSize="13" fontFamily="monospace">Flat</text>
            <text x={sx(17)} y={sy(9)} fill="rgba(251,191,36,0.6)" fontSize="13" fontFamily="monospace">Medium</text>
            <text x={sx(16)} y={sy(13)} fill="rgba(34,211,238,0.9)" fontSize="13" fontFamily="monospace">Steepest</text>
          </ChartFrame>
        </Reveal>
        <Reveal>
          <FormulaExplainer
            label="Sharpe ratio"
            formula={String.raw`S_P = \frac{E[R_P] - r_f}{\sigma_P}`}
            meaning="Expected excess return per unit of volatility — the slope of the allocation line from (0, r_f)."
            variables={[
              { symbol: String.raw`E[R_P]`, description: "Expected return of the risky portfolio." },
              { symbol: String.raw`r_f`, description: "Risk-free rate." },
              { symbol: String.raw`\sigma_P`, description: "Volatility of the risky portfolio." },
            ]}
            interpretation="A higher Sharpe ratio means a steeper line. It is not highest return, not lowest volatility, not a probability of profit, and not alpha."
            tone="green"
          />
        </Reveal>
        <Reveal>
          <DefinitionCard term="Tangency portfolio">
            The risky portfolio where the steepest allocation line from (0, r_f) touches
            the risky efficient frontier — the maximum-Sharpe risky portfolio.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Asset</th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Tangency weight</th>
                </tr>
              </thead>
              <tbody className="font-sans tabular-nums text-slate-100">
                <tr className="border-b border-white/5"><td className="py-3 pr-8">GM</td><td className="py-3 text-accent-cyan">{(tangencyWeights[0] * 100).toFixed(2)}%</td></tr>
                <tr className="border-b border-white/5"><td className="py-3 pr-8">IBM</td><td className="py-3 text-accent-cyan">{(tangencyWeights[1] * 100).toFixed(2)}%</td></tr>
                <tr className="border-b border-white/5"><td className="py-3 pr-8">Motorola</td><td className="py-3 text-accent-cyan">{(tangencyWeights[2] * 100).toFixed(2)}%</td></tr>
                <tr><td className="py-3 pr-8 font-semibold text-slate-50">E[R] / σ / Sharpe</td><td className="py-3 font-semibold text-accent-green">{tangencyER.toFixed(2)}% / {tangencySD.toFixed(2)}% / {tangencySharpe.toFixed(3)}</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-[15px] text-slate-500">
            Historical monthly instructional estimates · MIT 15.401 · 1946–2001 — not
            current estimates. With r_f = 0.12% (monthly), the tangency portfolio has the
            highest Sharpe ratio achievable with these three assets.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 5 — SCALE EXPOSURE ===================== */}
      <ConceptSection
        index="6.5.5"
        eyebrow="Scene 5 · Scale exposure"
        title="Lending, full investment, and leverage"
        intro="One tangency portfolio, three positions along the same line. Only the split between risky and risk-free changes — the internal risky weights stay the same."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Position</th>
                  <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">y</th>
                  <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">rf weight</th>
                  <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">E[R_C]</th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">σ_C</th>
                </tr>
              </thead>
              <tbody className="font-sans tabular-nums text-slate-100">
                <tr className="border-b border-white/5"><td className="py-3 pr-6">Lending</td><td className="py-3 pr-6">0.40</td><td className="py-3 pr-6 text-accent-green">+60%</td><td className="py-3 pr-6">4.4%</td><td className="py-3">4.8%</td></tr>
                <tr className="border-b border-white/5"><td className="py-3 pr-6">Full investment</td><td className="py-3 pr-6">1.00</td><td className="py-3 pr-6">0%</td><td className="py-3 pr-6">8.0%</td><td className="py-3">12.0%</td></tr>
                <tr><td className="py-3 pr-6">Leverage</td><td className="py-3 pr-6">1.50</td><td className="py-3 pr-6 text-accent-red">-50%</td><td className="py-3 pr-6">11.0%</td><td className="py-3">18.0%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            At y = 1.5 the investor borrows 50% at <InlineMath>{String.raw`r_f`}</InlineMath>{" "}
            and invests 150% in the tangency portfolio. Expected return rises to 11%,
            volatility to 18%. <strong className="text-white">Leverage increases both in
            the same proportion — it does not improve the Sharpe ratio.</strong>
          </p>
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <AllocationWorksheet />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 6 — TWO-FUND SEPARATION ===================== */}
      <ConceptSection
        index="6.5.6"
        eyebrow="Scene 6 · Two-fund separation"
        title="Separate the risky choice from the risk level"
        intro="Every investor makes two independent decisions: which risky portfolio (the tangency — the same for everyone) and how much total risk (the split y — different for each)."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Decision 1 · Which risky portfolio?</div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                The tangency portfolio — maximum Sharpe ratio. This decision is the{" "}
                <em className="text-slate-100">same</em> for every investor.
              </p>
            </div>
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Decision 2 · How much total risk?</div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                Choose y — the split between tangency and rf. This decision is{" "}
                <em className="text-slate-100">different</em> for each investor.
              </p>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Investor type</th>
                  <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Tangency</th>
                  <th className="py-3 pr-6 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Risk-free</th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Position</th>
                </tr>
              </thead>
              <tbody className="font-sans tabular-nums text-slate-100">
                <tr className="border-b border-white/5"><td className="py-3 pr-6">Conservative</td><td className="py-3 pr-6">40%</td><td className="py-3 pr-6 text-accent-green">+60%</td><td className="py-3">Lending</td></tr>
                <tr className="border-b border-white/5"><td className="py-3 pr-6">Moderate</td><td className="py-3 pr-6">100%</td><td className="py-3 pr-6">0%</td><td className="py-3">Full</td></tr>
                <tr><td className="py-3 pr-6">Aggressive</td><td className="py-3 pr-6">130%</td><td className="py-3 pr-6 text-accent-red">-30%</td><td className="py-3">Leverage</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            <strong className="text-white">All three hold the same risky portfolio.</strong>{" "}
            They differ only in the fraction invested in it. The risky-mix decision is
            separated from the risk-level decision.
          </p>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">Why the line replaces the curve</div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                Under equal borrowing/lending rates, the tangency line dominates the curved
                frontier at every risk level (except at the tangency point itself). The
                curved frontier is still needed to <em className="text-slate-100">find</em>{" "}
                the tangency point — once found, the line becomes the new efficient set.
              </p>
            </div>
            <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">Borrowing assumption</div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                This result assumes investors can borrow and lend at the{" "}
                <em className="text-slate-100">same</em> rate r_f. In reality borrowing
                rates exceed lending rates — which would create a kink at the tangency
                point. We state this assumption explicitly.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">Assumptions and limitations</div>
            <ol className="mt-4 space-y-3">
              {[
                ["Equal borrowing/lending rate.", "In reality borrowing exceeds lending, producing a kinked efficient set above the tangency point."],
                ["Stable estimates.", "Small changes in expected returns or covariances can shift the tangency weights significantly."],
                ["Mean-variance framework.", "Standard deviation treats upside and downside symmetrically, ignoring skewness, drawdowns, tail risk, liquidity, costs, and taxes."],
                ["Leverage is not frictionless.", "Borrowing introduces margin calls, collateral, and the risk of forced selling at unfavorable prices."],
                ["Tangency ≠ market portfolio.", "Identifying it with the market portfolio requires equilibrium assumptions beyond this lesson."],
              ].map(([head, body], i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 font-sans text-[13px] text-accent-amber">{i + 1}</span>
                  <span className="text-[16px] leading-[1.6] text-slate-200">
                    <strong className="text-white">{head}</strong> {body}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== FINAL CHECK ===================== */}
      <ConceptSection
        index="6.5.7"
        eyebrow="Final check · Sharpe and the allocation line"
        title="rf = 3%, X(9%, 10%), Y(11%, 16%)"
        intro="Tie it together: compute Sharpe ratios, build a combination with rf, and reason about which risky portfolio to combine with the risk-free asset."
      >
        <Reveal>
          <InteractiveFrame>
            <FinalCheck />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== OPTIONAL QA ===================== */}
      <ConceptSection
        index="6.5.8"
        eyebrow="Optional · Common questions"
        title="Questions you may still have"
        topMargin="mt-16"
      >
        <Reveal>
          <div className="space-y-3">
            <ExpandableQA question="Why combine a risky portfolio with the risk-free asset?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                It separates two decisions: which risky mix to hold, and how much total
                risk to take. Without rf, every risk level requires a different risky mix.
                With rf, you hold one optimal risky portfolio and scale risk by changing
                the split.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Does leverage improve the Sharpe ratio?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                No. Leverage moves you along the same line. At y = 1.5 you have more return
                and more risk in the same proportion. The Sharpe ratio equals the slope of
                the line, and leverage does not change the slope.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Do conservative investors avoid the tangency portfolio?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                No — they still hold it. They simply allocate less to it (lower y) and more
                to the risk-free asset. Two-fund separation means every investor holds the
                same tangency portfolio; only the fraction differs.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Is the tangency portfolio the same as the market portfolio?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                Not automatically. The tangency portfolio is the maximum-Sharpe portfolio
                for a given set of assets and inputs. Identifying it with the market
                portfolio requires equilibrium assumptions — that all investors hold it,
                that prices reflect consensus expectations, and that risky supply equals
                risky demand. Those assumptions are beyond this lesson.
              </p>
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-16">
        <MasteryCheck
          passCount={4}
          onComplete={() => report()}
          continueLabel="Return to the Finance Foundations course"
          continueHref="/courses/finance-foundations"
          questions={QUESTIONS}
        />
      </Reveal>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Return to the Finance Foundations course"
          continueHref="/courses/finance-foundations"
        />
      </Reveal>

      <Reveal className="mt-8">
        <PTSourcePanel />
      </Reveal>
    </PTLayout>
  );
}
