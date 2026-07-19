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
  portfolioExpectedReturn,
  portfolioStandardDeviation,
  globalMinVariancePortfolio,
  minVarianceForTargetReturn,
} from "@/lib/portfolio-theory";

const LEARNING_OBJECTIVES = [
  "Define portfolio dominance and explain why northwest is better.",
  "Connect a single weight vector to a single point on the risk-return graph.",
  "Describe the feasible set as the collection of all achievable portfolios.",
  "Construct the minimum-variance boundary by finding the lowest-σ portfolio for each target return.",
  "Identify the global minimum-variance portfolio as the leftmost point.",
  "Explain why only the upper branch of the boundary is efficient.",
  "Recognize that the efficient frontier narrows choice but does not select one portfolio.",
];

const SUMMARY_POINTS = [
  "Portfolio dominance: northwest is better.",
  "The feasible set contains every achievable risk-return combination.",
  "The minimum-variance boundary holds the lowest-σ portfolio for each target return.",
  "The global minimum-variance portfolio is the leftmost point.",
  "Only the upper branch of the boundary is efficient.",
  "The efficient frontier narrows choice but does not select one portfolio.",
  "Efficiency depends on model inputs, which are estimated and uncertain.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Portfolio B has the same expected return as A but lower σ. What is the relationship?",
    choices: [
      { id: "a", label: "B dominates A" },
      { id: "b", label: "A dominates B" },
      { id: "c", label: "Neither dominates" },
    ],
    correctId: "a",
    hint: "Same return, less risk — B is northwest of A.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "The minimum-variance boundary contains:",
    choices: [
      { id: "a", label: "The lowest-variance portfolio for each target return" },
      { id: "b", label: "The highest-return portfolios only" },
      { id: "c", label: "All feasible portfolios" },
    ],
    correctId: "a",
    hint: "For each return level, the boundary picks the leftmost (lowest-σ) feasible point.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Why is the lower branch of the boundary NOT efficient?",
    choices: [
      { id: "a", label: "It is dominated by upper-branch portfolios at the same σ" },
      { id: "b", label: "It is outside the feasible set" },
      { id: "c", label: "It requires negative weights" },
    ],
    correctId: "a",
    hint: "At the same volatility, the upper branch offers higher return.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Using the MIT dataset, the GMV portfolio has approximately:",
    choices: [
      { id: "a", label: "E[R] ≈ 1.23%, σ ≈ 5.25%" },
      { id: "b", label: "E[R] ≈ 1.32%, σ ≈ 6.34%" },
      { id: "c", label: "E[R] ≈ 1.75%, σ ≈ 9.73%" },
    ],
    correctId: "a",
    hint: "GMV is the leftmost point — σ ≈ 5.25%, below all individual assets.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "A portfolio is efficient when:",
    choices: [
      { id: "a", label: "No other portfolio offers more return at the same or less risk" },
      { id: "b", label: "It has the highest expected return" },
      { id: "c", label: "It has the lowest risk" },
    ],
    correctId: "a",
    hint: "Efficiency means no feasible portfolio can improve one dimension without worsening the other.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Does the efficient frontier select one universally best portfolio?",
    choices: [
      { id: "a", label: "No — different investors may choose different efficient points" },
      { id: "b", label: "Yes — the GMV" },
      { id: "c", label: "Yes — the highest-return portfolio" },
    ],
    correctId: "a",
    hint: "The frontier narrows the choice set but does not pick a single portfolio.",
  },
];

const CW = 580;
const CH = 380;
const CPAD_L = 58;
const CPAD_R = 24;
const CPAD_T = 20;
const CPAD_B = 46;
const X_MIN = 0;
const X_MAX = 10;
const Y_MIN = 0.8;
const Y_MAX = 2.0;
const X_TICKS = [0, 2, 4, 6, 8, 10];
const Y_TICKS = [0.8, 1.1, 1.4, 1.7, 2.0];

function sx(x: number): number {
  return CPAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * (CW - CPAD_L - CPAD_R);
}
function sy(y: number): number {
  return CPAD_T + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * (CH - CPAD_T - CPAD_B);
}
function buildPath(pts: { x: number; y: number }[]): string {
  return "M " + pts.map((p) => `${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" L ");
}

const GMV_WEIGHTS = globalMinVariancePortfolio(MIT_COVARIANCE_MATRIX)!;
const GMV_ER = portfolioExpectedReturn(GMV_WEIGHTS, MIT_EXPECTED_RETURNS) * 100;
const GMV_SD = portfolioStandardDeviation(GMV_WEIGHTS, MIT_COVARIANCE_MATRIX) * 100;

const FEASIBLE_POINTS: { x: number; y: number }[] = (() => {
  const pts: { x: number; y: number }[] = [];
  const N = 20;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N - i; j++) {
      const w1 = i / N;
      const w2 = j / N;
      const w3 = 1 - w1 - w2;
      if (w3 < -0.001) continue;
      const w = [w1, w2, Math.max(0, w3)];
      const er = portfolioExpectedReturn(w, MIT_EXPECTED_RETURNS) * 100;
      const sd = portfolioStandardDeviation(w, MIT_COVARIANCE_MATRIX) * 100;
      pts.push({ x: sd, y: er });
    }
  }
  return pts;
})();

const BOUNDARY_ALL: { x: number; y: number }[] = (() => {
  const pts: { x: number; y: number }[] = [];
  for (let t = 0.0085; t <= 0.0175; t += 0.0003) {
    const w = minVarianceForTargetReturn(MIT_COVARIANCE_MATRIX, MIT_EXPECTED_RETURNS, t);
    if (!w) continue;
    const sd = portfolioStandardDeviation(w, MIT_COVARIANCE_MATRIX) * 100;
    pts.push({ x: sd, y: t * 100 });
  }
  return pts;
})();

const BOUNDARY_LOWER = BOUNDARY_ALL.filter((p) => p.y <= GMV_ER);
const BOUNDARY_UPPER = BOUNDARY_ALL.filter((p) => p.y >= GMV_ER);

const ASSET_POINTS = [
  { label: "GM", x: 6.23, y: 1.08, color: "rgba(251,191,36,0.9)" },
  { label: "IBM", x: 6.34, y: 1.32, color: "rgba(167,139,250,0.9)" },
  { label: "MOT", x: 9.73, y: 1.75, color: "rgba(52,211,153,0.9)" },
];

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
            {t.toFixed(1)}%
          </text>
        </g>
      ))}
      <text x={(CPAD_L + CW - CPAD_R) / 2} y={CH - 6} fill="rgba(148,163,184,0.9)" fontSize="14" textAnchor="middle">
        σ (risk, %)
      </text>
      <text x={16} y={(CPAD_T + CH - CPAD_B) / 2} fill="rgba(148,163,184,0.9)" fontSize="14" textAnchor="middle" transform={`rotate(-90 16 ${(CPAD_T + CH - CPAD_B) / 2})`}>
        E[R] (%, monthly)
      </text>
    </>
  );
}

function ChartFrame({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full min-w-[440px]" role="img" aria-label={ariaLabel}>
        <ChartAxes />
        {children}
      </svg>
    </div>
  );
}

function AssetMarkers({ faded }: { faded?: boolean }) {
  const opacity = faded ? 0.35 : 1;
  return (
    <>
      {ASSET_POINTS.map((a) => (
        <g key={a.label} opacity={opacity}>
          <circle cx={sx(a.x)} cy={sy(a.y)} r={5} fill={a.color} stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
          <text x={sx(a.x) + 9} y={sy(a.y) - 7} fill={a.color} fontSize="13" fontFamily="monospace">
            {a.label}
          </text>
        </g>
      ))}
    </>
  );
}

function FeasibleCloud({ opacity = 0.2 }: { opacity?: number }) {
  return (
    <>
      {FEASIBLE_POINTS.map((p, i) => (
        <circle key={`f${i}`} cx={sx(p.x)} cy={sy(p.y)} r={2.5} fill={`rgba(148,163,184,${opacity})`} />
      ))}
    </>
  );
}

function ChoiceMCQ({
  prompt,
  options,
  correctId,
  feedbackCorrect,
  feedbackIncorrect,
}: {
  prompt: ReactNode;
  options: { id: string; label: string }[];
  correctId: string;
  feedbackCorrect: ReactNode;
  feedbackIncorrect: ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === correctId;
  return (
    <div>
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
              onClick={() => setSelected(opt.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
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
          <Feedback status={isCorrect ? "correct" : "incorrect"}>
            {isCorrect ? feedbackCorrect : feedbackIncorrect}
          </Feedback>
        </div>
      )}
    </div>
  );
}

function DominanceCheck() {
  const pairs = [
    { aLabel: "A", aEr: 8, aSd: 12, bLabel: "B", bEr: 8, bSd: 9, correct: "B_dominates", note: "Same return, less risk → B dominates A." },
    { aLabel: "C", aEr: 10, aSd: 11, bLabel: "D", bEr: 7, bSd: 11, correct: "A_dominates", note: "Same risk, more return → C dominates D." },
    { aLabel: "E", aEr: 6, aSd: 5, bLabel: "F", bEr: 10, bSd: 12, correct: "neither", note: "E has less risk but also less return — neither dominates." },
    { aLabel: "G", aEr: 9, aSd: 8, bLabel: "H", bEr: 8, bSd: 10, correct: "A_dominates", note: "G has more return AND less risk → G dominates H." },
  ];
  return (
    <div className="space-y-5">
      {pairs.map((pair) => (
        <div key={pair.aLabel + pair.bLabel} className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[300px] border-collapse text-[16px]">
              <tbody className="font-mono tabular-nums text-slate-100">
                <tr className="border-b border-white/10">
                  <td className="py-2 pr-6 text-slate-400">{pair.aLabel}</td>
                  <td className="py-2 pr-6">E[R] = {pair.aEr}%</td>
                  <td className="py-2">σ = {pair.aSd}%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-6 text-slate-400">{pair.bLabel}</td>
                  <td className="py-2 pr-6">E[R] = {pair.bEr}%</td>
                  <td className="py-2">σ = {pair.bSd}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ChoiceMCQ
            prompt="Which is correct?"
            options={[
              { id: "A_dominates", label: `${pair.aLabel} dominates ${pair.bLabel}` },
              { id: "B_dominates", label: `${pair.bLabel} dominates ${pair.aLabel}` },
              { id: "neither", label: "Neither" },
            ]}
            correctId={pair.correct}
            feedbackCorrect={pair.note}
            feedbackIncorrect={pair.note}
          />
        </div>
      ))}
    </div>
  );
}

const BOUNDARY_ROUNDS = [
  { target: 1.2, candidates: [{ id: "r1a", label: "α", sd: 5.55 }, { id: "r1b", label: "β", sd: 5.26 }, { id: "r1c", label: "γ", sd: 5.72 }], correctId: "r1b" },
  { target: 1.3, candidates: [{ id: "r2a", label: "α", sd: 5.62 }, { id: "r2b", label: "β", sd: 5.34 }, { id: "r2c", label: "γ", sd: 5.85 }], correctId: "r2b" },
  { target: 1.4, candidates: [{ id: "r3a", label: "α", sd: 6.05 }, { id: "r3b", label: "β", sd: 6.3 }, { id: "r3c", label: "γ", sd: 5.76 }], correctId: "r3c" },
  { target: 1.5, candidates: [{ id: "r4a", label: "α", sd: 6.75 }, { id: "r4b", label: "β", sd: 7.05 }, { id: "r4c", label: "γ", sd: 6.46 }], correctId: "r4c" },
];

function BoundaryBuilder() {
  const reduce = useReducedMotion();
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [solvedPoints, setSolvedPoints] = useState<{ x: number; y: number }[]>([]);

  const current = BOUNDARY_ROUNDS[roundIdx];
  const answered = selected !== null;
  const isCorrect = answered && selected === current.correctId;
  const allDone = solvedPoints.length === BOUNDARY_ROUNDS.length;

  const handleSelect = (cid: string) => {
    if (answered) return;
    setSelected(cid);
    if (cid === current.correctId) {
      const candidate = current.candidates.find((c) => c.id === cid)!;
      setSolvedPoints((prev) => [...prev, { x: candidate.sd, y: current.target }]);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
      <div>
        <div className="flex items-center gap-2.5">
          {BOUNDARY_ROUNDS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[13px]",
                i < roundIdx || (i === roundIdx && isCorrect)
                  ? "border-accent-green bg-accent-green/15 text-accent-green"
                  : i === roundIdx
                    ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                    : "border-white/15 text-slate-500",
              )}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <div className="font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
            Round {roundIdx + 1} of {BOUNDARY_ROUNDS.length} · Target E[R] ={" "}
            <span className="text-accent-cyan">{current.target.toFixed(2)}%</span>
          </div>
          <p className="mt-2 max-w-md text-[16px] leading-[1.6] text-slate-200">
            Three candidates all hit the target return. Pick the one with the{" "}
            <strong className="text-white">lowest σ</strong> — the leftmost point at this
            return level.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[300px] border-collapse text-[16px]">
              <tbody className="font-mono tabular-nums text-slate-100">
                {current.candidates.map((c) => {
                  const isSelected = selected === c.id;
                  const showAsCorrect = answered && c.id === current.correctId;
                  const showAsWrong = isSelected && !isCorrect;
                  return (
                    <tr
                      key={c.id}
                      className={cn("border-b border-white/5", showAsCorrect && "bg-accent-green/5", showAsWrong && "bg-accent-red/5")}
                    >
                      <td className="py-2.5 pr-6">{c.label}</td>
                      <td className="py-2.5">σ = {c.sd.toFixed(2)}%</td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          disabled={answered}
                          onClick={() => handleSelect(c.id)}
                          className={cn(
                            "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                            showAsCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                            showAsWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                            !answered && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                            answered && !showAsCorrect && !showAsWrong && "border-white/10 text-slate-500",
                          )}
                        >
                          Select {c.label}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {answered && (
            <div className="mt-4">
              <Feedback status={isCorrect ? "correct" : "incorrect"}>
                {isCorrect
                  ? `Correct — portfolio ${current.candidates.find((c) => c.id === selected)?.label} has the lowest σ at E[R] = ${current.target.toFixed(2)}%. Plotted on the boundary.`
                  : `Not the lowest σ. The leftmost candidate is portfolio ${current.candidates.find((c) => c.id === current.correctId)?.label}.`}
              </Feedback>
              {isCorrect && !allDone && (
                <button
                  type="button"
                  onClick={() => {
                    setRoundIdx(roundIdx + 1);
                    setSelected(null);
                  }}
                  className="mt-3 rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-5 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25"
                >
                  Next round →
                </button>
              )}
              {allDone && (
                <Feedback status="correct">
                  All four points plotted. The connecting curve traces the
                  minimum-variance boundary — the leftmost edge of the feasible set.
                </Feedback>
              )}
            </div>
          )}
        </div>
      </div>

      <ChartFrame ariaLabel="Minimum-variance boundary builder chart">
        <FeasibleCloud opacity={0.12} />
        {solvedPoints.map((p, i) => (
          <motion.circle
            key={`s${i}`}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={5}
            fill="rgba(34,211,238,1)"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={1.5}
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ transformOrigin: `${sx(p.x)}px ${sy(p.y)}px` }}
          />
        ))}
        {allDone && (
          <motion.path
            d={buildPath(solvedPoints)}
            fill="none"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth={2}
            strokeDasharray="4 3"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1 }}
          />
        )}
        {solvedPoints.map((p, i) => (
          <text key={`sl${i}`} x={sx(p.x) + 8} y={sy(p.y) - 8} fill="rgba(34,211,238,0.95)" fontSize="13" fontFamily="monospace">
            {p.y.toFixed(2)}%
          </text>
        ))}
      </ChartFrame>
    </div>
  );
}

const BRANCH_PAIRS = [
  { id: "b1", p1Label: "P1", p1Sd: 5.8, p1Er: 1.45, p2Label: "P2", p2Sd: 5.8, p2Er: 0.95, correct: "p1", note: "Same σ, P1 has higher return → P1 dominates P2 (upper branch)." },
  { id: "b2", p1Label: "P3", p1Sd: 5.5, p1Er: 1.35, p2Label: "P4", p2Sd: 5.5, p2Er: 0.85, correct: "p1", note: "Same σ, P3 has higher return → P3 dominates P4 (upper branch)." },
  { id: "b3", p1Label: "P5", p1Sd: 6.0, p1Er: 1.5, p2Label: "P6", p2Sd: 8.0, p2Er: 1.8, correct: "neither", note: "P5 has less risk but also less return. Neither dominates." },
];

function EfficientBranchClassifier() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const allAnswered = Object.keys(answers).length === BRANCH_PAIRS.length;
  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {BRANCH_PAIRS.map((pair) => {
          const selected = answers[pair.id];
          const answered = selected !== undefined;
          const isCorrect = selected === pair.correct;
          return (
            <div key={pair.id} className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[300px] border-collapse text-[16px]">
                  <tbody className="font-mono tabular-nums text-slate-100">
                    <tr className="border-b border-white/10">
                      <td className="py-2 pr-6 text-slate-400">{pair.p1Label}</td>
                      <td className="py-2 pr-6">σ = {pair.p1Sd.toFixed(2)}</td>
                      <td className="py-2">E[R] = {pair.p1Er.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-6 text-slate-400">{pair.p2Label}</td>
                      <td className="py-2 pr-6">σ = {pair.p2Sd.toFixed(2)}</td>
                      <td className="py-2">E[R] = {pair.p2Er.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "p1", label: `${pair.p1Label} dominates` },
                  { id: "p2", label: `${pair.p2Label} dominates` },
                  { id: "neither", label: "Neither" },
                ].map((opt) => {
                  const isSelected = selected === opt.id;
                  const showAsCorrect = answered && opt.id === pair.correct;
                  const showAsWrong = isSelected && !isCorrect;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={answered}
                      onClick={() => setAnswers((prev) => ({ ...prev, [pair.id]: opt.id }))}
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
                <div className="sm:col-span-2">
                  <Feedback status={isCorrect ? "correct" : "incorrect"}>{pair.note}</Feedback>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allAnswered && (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.04] p-5"
        >
          <div className="text-[16px] leading-[1.6] text-slate-200">
            <strong className="text-white">A portfolio is efficient when:</strong>
          </div>
          <div className="mt-3">
            <ChoiceMCQ
              prompt="Complete the definition."
              options={[
                { id: "a", label: "No other feasible portfolio offers higher return with same or less risk, or less risk with same or greater return" },
                { id: "b", label: "It has the highest expected return of all portfolios" },
                { id: "c", label: "It has the lowest standard deviation of all portfolios" },
              ]}
              correctId="a"
              feedbackCorrect="Exactly. Efficiency means no feasible portfolio can improve one dimension without worsening the other."
              feedbackIncorrect="That describes one specific portfolio, not the general definition of efficiency."
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

const FINAL_PORTFOLIOS = [
  { id: "f1", label: "W", sd: 7.0, er: 1.1, correct: "inefficient", note: "Interior of the feasible set — dominated by portfolios with same return, less risk." },
  { id: "f2", label: "X", sd: 5.5, er: 0.9, correct: "inefficient", note: "On the lower branch — same σ as an upper-branch point with higher return." },
  { id: "f3", label: "Y", sd: 5.25, er: 1.23, correct: "efficient", note: "GMV — the leftmost point. Nothing has less risk." },
  { id: "f4", label: "Z₁", sd: 5.76, er: 1.4, correct: "efficient", note: "On the upper branch — no portfolio offers more return at this σ." },
  { id: "f5", label: "Z₂", sd: 6.46, er: 1.5, correct: "efficient", note: "On the upper branch — no portfolio offers less risk at this return." },
];

function FinalCheck() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const allAnswered = Object.keys(answers).length === FINAL_PORTFOLIOS.length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FINAL_PORTFOLIOS.map((p) => {
          const selected = answers[p.id];
          const answered = selected !== undefined;
          const isCorrect = selected === p.correct;
          return (
            <div key={p.id} className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
              <div className="flex items-center gap-5">
                <div className="flex gap-5 font-mono tabular-nums text-slate-100">
                  <div>
                    <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400">Port.</div>
                    <div className="text-[16px]">{p.label}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400">σ %</div>
                    <div className="text-[16px]">{p.sd.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400">E[R] %</div>
                    <div className="text-[16px]">{p.er.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { id: "efficient", label: "Efficient" },
                  { id: "inefficient", label: "Inefficient" },
                ].map((opt) => {
                  const isSelected = selected === opt.id;
                  const showAsCorrect = answered && opt.id === p.correct;
                  const showAsWrong = isSelected && !isCorrect;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={answered}
                      onClick={() => setAnswers((prev) => ({ ...prev, [p.id]: opt.id }))}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-[14px] transition-colors",
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
                  <Feedback status={isCorrect ? "correct" : "incorrect"}>{p.note}</Feedback>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allAnswered && (
        <Feedback status="info">
          Five portfolios, one curve. Efficiency is not about being the best in one
          dimension — it is about being impossible to improve without a trade-off.
        </Feedback>
      )}
    </div>
  );
}

const STAGES = [
  "Two points · dominance",
  "One weight vector · one point",
  "Many feasible portfolios",
  "Target-return slices",
  "Minimum-variance boundary",
  "Global minimum-variance point",
  "Upper vs lower branch",
  "Efficient frontier revealed",
];

function StageNav({ stage, setStage }: { stage: number; setStage: (n: number) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STAGES.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => setStage(i)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 font-mono text-[13px] transition-colors",
            stage === i
              ? "border-accent-cyan/60 bg-accent-cyan/15 text-accent-cyan"
              : i < stage
                ? "border-accent-green/40 bg-accent-green/10 text-accent-green/80 hover:border-accent-green/60"
                : "border-white/15 text-slate-400 hover:border-white/30 hover:text-slate-200",
          )}
        >
          <span className="tabular-nums">{i + 1}</span>
          <span className="ml-1.5 hidden font-sans text-[13px] normal-case tracking-normal sm:inline">{s}</span>
        </button>
      ))}
    </div>
  );
}

function FrontierCanvas({ stage }: { stage: number }) {
  const reduce = useReducedMotion();
  const showCloud = stage >= 2;
  const showBoundary = stage >= 4;
  const showGmv = stage >= 5;
  const showBranchCompare = stage === 6;
  const showEfficient = stage >= 7;

  return (
    <ChartFrame ariaLabel={`Frontier construction, stage ${stage + 1}`}>
      {showCloud && <FeasibleCloud opacity={stage >= 4 ? 0.1 : 0.2} />}

      {stage === 0 && (
        <>
          <circle cx={sx(9)} cy={sy(1.2)} r={6} fill="rgba(148,163,184,0.7)" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
          <text x={sx(9) + 9} y={sy(1.2) - 7} fill="rgba(148,163,184,0.9)" fontSize="13" fontFamily="monospace">A</text>
          <circle cx={sx(9)} cy={sy(1.7)} r={6} fill="rgba(34,211,238,0.95)" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          <text x={sx(9) + 9} y={sy(1.7) - 7} fill="rgba(34,211,238,0.95)" fontSize="13" fontFamily="monospace">B (NW)</text>
          <line x1={sx(9)} y1={sy(1.2)} x2={sx(9)} y2={sy(1.7)} stroke="rgba(34,211,238,0.4)" strokeWidth={1.5} strokeDasharray="3 3" />
        </>
      )}

      {stage === 1 && (
        <>
          <circle cx={sx(5.34)} cy={sy(1.29)} r={6} fill="rgba(34,211,238,1)" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          <text x={sx(5.34) + 9} y={sy(1.29) - 7} fill="rgba(34,211,238,0.95)" fontSize="13" fontFamily="monospace">50/30/20</text>
          <AssetMarkers faded />
        </>
      )}

      {stage >= 2 && stage <= 3 && <AssetMarkers faded={stage === 3} />}

      {stage === 3 && (
        <>
          {[1.2, 1.4, 1.6].map((t) => (
            <line key={t} x1={CPAD_L} x2={CW - CPAD_R} y1={sy(t)} y2={sy(t)} stroke="rgba(251,191,36,0.45)" strokeWidth={1.5} strokeDasharray="4 4" />
          ))}
          <text x={CW - CPAD_R} y={sy(1.4) - 6} fill="rgba(251,191,36,0.9)" fontSize="12" fontFamily="monospace" textAnchor="end">
            target-return slices
          </text>
        </>
      )}

      {showBoundary && (
        <>
          <path
            d={buildPath(BOUNDARY_LOWER)}
            fill="none"
            stroke={showEfficient ? "rgba(248,113,113,0.25)" : showBranchCompare ? "rgba(248,113,113,0.35)" : "rgba(255,255,255,0.4)"}
            strokeWidth={2}
            strokeDasharray={showBranchCompare || showEfficient ? "4 4" : undefined}
          />
          <path
            d={buildPath(BOUNDARY_UPPER)}
            fill="none"
            stroke={showEfficient ? "rgba(34,211,238,0.95)" : "rgba(255,255,255,0.4)"}
            strokeWidth={showEfficient ? 3 : 2}
          />
        </>
      )}

      {showGmv && (
        <>
          <circle cx={sx(GMV_SD)} cy={sy(GMV_ER)} r={6} fill="rgba(34,211,238,1)" stroke="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          <text x={sx(GMV_SD) - 10} y={sy(GMV_ER) + 20} fill="rgba(34,211,238,0.95)" fontSize="13" fontFamily="monospace" textAnchor="end">
            GMV
          </text>
        </>
      )}

      {showBranchCompare && (
        <>
          <circle cx={sx(5.8)} cy={sy(0.95)} r={5} fill="rgba(248,113,113,0.8)" stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
          <text x={sx(5.8) + 9} y={sy(0.95) + 5} fill="rgba(248,113,113,0.9)" fontSize="12" fontFamily="monospace">lower (dominated)</text>
          <circle cx={sx(5.8)} cy={sy(1.45)} r={5} fill="rgba(34,211,238,0.9)" stroke="rgba(255,255,255,0.8)" strokeWidth={1} />
          <text x={sx(5.8) + 9} y={sy(1.45) - 7} fill="rgba(34,211,238,0.95)" fontSize="12" fontFamily="monospace">upper (efficient)</text>
        </>
      )}

      {showEfficient && (
        <motion.text
          x={sx(7.6)}
          y={sy(1.66)}
          fill="rgba(34,211,238,0.95)"
          fontSize="14"
          fontFamily="monospace"
          fontWeight="bold"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Efficient frontier
        </motion.text>
      )}
    </ChartFrame>
  );
}

export default function Lesson6_4() {
  const report = useReportPTComplete("portfolio-efficient-frontier");
  const [stage, setStage] = useState(0);

  const stageCopy = [
    {
      title: "Two points and a rule",
      body: "Plot two portfolios. The one up and to the left — more return at no more risk, or less risk at no less return — dominates. Northwest is better.",
    },
    {
      title: "One weight vector, one point",
      body: "A specific set of weights (here 50% GM, 30% IBM, 20% MOT) maps to a single point. Each dot is an allocation, not a time period or a future outcome.",
    },
    {
      title: "The feasible set",
      body: "Plot every long-only weight combination and you get a cloud of achievable risk-return combinations. This is the feasible set.",
    },
    {
      title: "Horizontal target-return slices",
      body: "For each target return, sweep horizontally and find the leftmost (lowest-σ) feasible point. Those leftmost points form the boundary.",
    },
    {
      title: "The minimum-variance boundary",
      body: "Connecting the leftmost points traces a curve wrapping around the left edge of the cloud. Every point on it has the lowest σ for its return level.",
    },
    {
      title: "The global minimum-variance portfolio",
      body: "The leftmost point on the entire boundary is the GMV — the lowest volatility achievable with any feasible portfolio.",
    },
    {
      title: "Upper branch vs lower branch",
      body: "At the same σ, an upper-branch point beats a lower-branch point on return. The lower branch is dominated and cannot be efficient.",
    },
    {
      title: "The efficient frontier",
      body: "Fade the lower branch. What remains — the upper branch from the GMV upward — is the efficient frontier. No point on it can be improved upon.",
    },
  ][stage];

  return (
    <PTLayout>
      <PVHero
        index="6.4"
        eyebrow="Lesson 6.4 · Module 6 — Portfolio Theory"
        heading="The Efficient Frontier"
        subheading="Many portfolios are feasible, but only the upper minimum-variance boundary is efficient. Watch one canvas build the frontier from scratch."
        bullets={[
          "Dominance: northwest is better",
          "Feasible set from weight vectors",
          "Minimum-variance boundary",
          "Global minimum-variance portfolio",
          "Only upper branch is efficient",
        ]}
        primaryLabel="Start"
      />

      <Reveal className="mt-8">
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 sm:p-7">
          <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-slate-400">Learning objectives</div>
          <p className="mt-3 text-[16px] text-slate-300">By the end of this lesson, you should be able to:</p>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LEARNING_OBJECTIVES.map((o, i) => (
              <li key={o} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-cyan/40 bg-accent-cyan/10 px-1.5 font-mono text-[13px] text-accent-cyan">
                  {i + 1}
                </span>
                <span className="text-[16px] leading-[1.6] text-slate-200">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* ===================== SECTION 1 — DOMINANCE ===================== */}
      <ConceptSection
        index="6.4.1"
        eyebrow="Section 1 · Dominance"
        title="Northwest is better"
        intro="Before building the frontier, we need a rule for comparing two portfolios: a portfolio that offers more return at the same risk, or less risk at the same return, dominates."
      >
        <Reveal>
          <FormulaExplainer
            label="Portfolio dominance"
            formula={String.raw`\text{A dominates B if } E[R_A] \geq E[R_B] \text{ and } \sigma_A \leq \sigma_B`}
            meaning="With at least one strict inequality. On the graph, the dominating portfolio sits to the upper-left (northwest)."
            variables={[
              { symbol: String.raw`E[R_A], E[R_B]`, description: "Expected returns of portfolios A and B." },
              { symbol: String.raw`\sigma_A, \sigma_B`, description: "Standard deviations of A and B." },
            ]}
          />
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <div className="mb-1 font-mono text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
              Interaction · Dominance check
            </div>
            <p className="mb-4 max-w-2xl text-[16px] leading-[1.6] text-slate-200">
              For each pair, decide whether one dominates the other — or neither. Remember:
              northwest is better.
            </p>
            <DominanceCheck />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 2 — THE CANVAS ===================== */}
      <ConceptSection
        index="6.4.2"
        eyebrow="Section 2 · The construction"
        title="Building the frontier on one canvas"
        intro="The same coordinate system develops through eight stages. Step through to watch the feasible set, the boundary, the GMV, and finally the efficient frontier emerge — rather than meeting several disconnected charts."
      >
        <Reveal>
          <InteractiveFrame>
            <StageNav stage={stage} setStage={setStage} />
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <FrontierCanvas stage={stage} />
              <div>
                <div className="font-mono text-[13px] uppercase tracking-[0.16em] text-accent-cyan">
                  Stage {stage + 1}
                </div>
                <h4 className="mt-2 text-[20px] text-white">{stageCopy.title}</h4>
                <p className="mt-3 text-[17px] leading-[1.7] text-slate-200">{stageCopy.body}</p>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStage(Math.max(0, stage - 1))}
                    disabled={stage === 0}
                    className="rounded-full border border-white/15 px-4 py-2 text-[14px] text-slate-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-40"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage(Math.min(7, stage + 1))}
                    disabled={stage === 7}
                    className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-4 py-2 text-[14px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[14px] text-slate-500">
              Historical monthly instructional estimates · MIT 15.401 · 1946–2001 — not
              current estimates.
            </p>
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 3 — DOMINANCE INTERACTION ===================== */}
      <ConceptSection
        index="6.4.3"
        eyebrow="Interaction · Find the leftmost point"
        title="Minimum-variance boundary builder"
        intro="Each round presents three candidates at the same target return. Select the lowest σ. After four rounds the points connect into the boundary."
      >
        <Reveal>
          <InteractiveFrame>
            <BoundaryBuilder />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 4 — OPTIMIZATION ===================== */}
      <ConceptSection
        index="6.4.4"
        eyebrow="Section 4 · The optimization"
        title="What 'leftmost' means mathematically"
        intro="For each target return level, the boundary point solves a constrained minimization. You do not solve it by hand — the key idea is 'leftmost feasible point for each return.'"
      >
        <Reveal>
          <FormulaExplainer
            label="Minimum-variance optimization"
            formula={String.raw`\min_{\mathbf{w}} \mathbf{w}^\mathsf{T}\Sigma\mathbf{w} \text{ s.t. } \mathbf{w}^\mathsf{T}\boldsymbol{\mu} = \mu^*, \quad \mathbf{1}^\mathsf{T}\mathbf{w} = 1`}
            meaning="For a target return μ*, find the weight vector minimizing portfolio variance subject to achieving that return and weights summing to 1."
            variables={[
              { symbol: String.raw`\mathbf{w}`, description: "Portfolio weight vector." },
              { symbol: String.raw`\Sigma`, description: "Covariance matrix." },
              { symbol: String.raw`\boldsymbol{\mu}`, description: "Vector of expected returns." },
              { symbol: String.raw`\mu^*`, description: "Target expected return." },
            ]}
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 5 — GMV ===================== */}
      <ConceptSection
        index="6.4.5"
        eyebrow="Section 5 · Global minimum-variance"
        title="The leftmost point of all"
        intro="The global minimum-variance portfolio (GMV) has the lowest volatility of any feasible portfolio — no allocation achieves less risk."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Asset</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">GMV weight</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                <tr className="border-b border-white/5"><td className="py-3 pr-8">GM</td><td className="py-3 text-accent-cyan">48.58%</td></tr>
                <tr className="border-b border-white/5"><td className="py-3 pr-8">IBM</td><td className="py-3 text-accent-cyan">45.34%</td></tr>
                <tr className="border-b border-white/5"><td className="py-3 pr-8">Motorola</td><td className="py-3 text-accent-cyan">6.08%</td></tr>
                <tr><td className="py-3 pr-8 font-semibold text-slate-50">E[R] / σ</td><td className="py-3 font-semibold text-accent-green">1.23% / 5.25%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            The GMV is a single point, not a curve. The{" "}
            <em className="text-slate-100">boundary</em> wraps around the left edge of the
            feasible set; the <em className="text-slate-100">GMV</em> is the leftmost point
            on that curve.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 6 — BRANCH CLASSIFIER ===================== */}
      <ConceptSection
        index="6.4.6"
        eyebrow="Section 6 · Why only the upper branch is efficient"
        title="Eliminate the dominated branch"
        intro="The boundary has two branches meeting at the GMV. Every point on the lower branch is dominated by an upper-branch twin at the same σ. Classify each pair below."
      >
        <Reveal>
          <InteractiveFrame>
            <EfficientBranchClassifier />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 7 — DEFINITION ===================== */}
      <ConceptSection
        index="6.4.7"
        eyebrow="Section 7 · The efficient frontier"
        title="The efficient frontier"
        intro="The efficient frontier is the upper portion of the minimum-variance boundary, from the GMV upward. No portfolio on it can be improved upon."
      >
        <Reveal>
          <DefinitionCard term="Efficient frontier">
            The set of portfolios offering the highest expected return for each level of
            risk. No other feasible portfolio offers more return at the same or lower
            volatility.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            The frontier narrows the choice set, but it does not pick a single best
            portfolio. Multiple points are efficient — different risk-return trade-offs.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Efficient point</th>
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">E[R] (%)</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">σ (%)</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                <tr className="border-b border-white/5"><td className="py-3 pr-8">GMV (lowest risk)</td><td className="py-3 pr-8">1.23</td><td className="py-3">5.25</td></tr>
                <tr className="border-b border-white/5"><td className="py-3 pr-8">Moderate</td><td className="py-3 pr-8">1.40</td><td className="py-3">5.76</td></tr>
                <tr><td className="py-3 pr-8">Higher risk / return</td><td className="py-3 pr-8">1.50</td><td className="py-3">6.46</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            Different investors may choose different efficient points depending on risk
            tolerance. The frontier shows what is available — the choice depends on
            preferences.
          </p>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">
              Assumptions and limitations
            </div>
            <ul className="mt-4 space-y-3">
              {[
                "Which assets are in the universe — add or remove one and the frontier changes.",
                "Estimated expected returns, volatilities, and correlations — all uncertain.",
                "Portfolio constraints — long-only, short-selling allowed, or other restrictions.",
                "The time horizon — monthly estimates may not match annual goals.",
                "Standard deviation as the risk measure — it treats upside and downside symmetrically.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                  <span className="text-[16px] leading-[1.6] text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[16px] leading-[1.65] text-slate-300">
              <strong className="text-white">Efficiency is relative to a model.</strong>{" "}
              Change the inputs and the frontier shifts.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== FINAL CHECK ===================== */}
      <ConceptSection
        index="6.4.8"
        eyebrow="Final check · Classify five portfolios"
        title="Which are efficient?"
        intro="Five portfolios: one in the interior, one on the lower branch, one is the GMV, two are on the upper frontier. Classify each."
      >
        <Reveal>
          <InteractiveFrame>
            <FinalCheck />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== TRANSITION ===================== */}
      <ConceptSection
        index="6.4.9"
        eyebrow="Transition · A point on the axis"
        title="What if you can also hold something risk-free?"
        intro="We now have a curve of efficient choices. But what changes if an investor can also hold an asset whose return is known in advance?"
        topMargin="mt-12"
      >
        <Reveal>
          <Panel>
            <ChartFrame ariaLabel="Risk-free point appearing at zero volatility">
              <path d={buildPath(BOUNDARY_UPPER)} fill="none" stroke="rgba(34,211,238,0.25)" strokeWidth={2} />
              <motion.circle
                cx={sx(0)}
                cy={sy(0.12 * 100)}
                r={6}
                fill="rgba(251,191,36,1)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth={1.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
              <text x={sx(0) + 10} y={sy(0.12 * 100) + 5} fill="rgba(251,191,36,0.95)" fontSize="13" fontFamily="monospace">
                r_f (σ = 0)
              </text>
            </ChartFrame>
            <p className="mt-4 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
              A risk-free asset sits at <InlineMath>{String.raw`(0, r_f)`}</InlineMath> — zero
              volatility, known return. The next lesson explores what happens when this
              point enters the picture.
            </p>
          </Panel>
        </Reveal>
      </ConceptSection>

      {/* ===================== OPTIONAL QA ===================== */}
      <ConceptSection
        index="6.4.10"
        eyebrow="Optional · Common questions"
        title="Questions you may still have"
        topMargin="mt-16"
      >
        <Reveal>
          <div className="space-y-3">
            <ExpandableQA question="Is a diversified portfolio always efficient?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                Not necessarily. Diversification can reduce risk below any individual
                asset, but a diversified portfolio can still sit inside the feasible set,
                dominated by a boundary portfolio with the same return and lower σ.
                Diversification is necessary for efficiency, but not sufficient.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Is the minimum-variance boundary the same as the efficient frontier?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                No. The boundary includes both branches meeting at the GMV. The efficient
                frontier is only the upper branch, from the GMV upward.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Is the efficient frontier fixed?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                No. It depends on the asset universe, estimated inputs, and constraints.
                Change any of these and the frontier shifts — especially during stress.
              </p>
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-16">
        <MasteryCheck
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Risk-Free Asset, Tangency, and Sharpe"
          continueHref="/lessons/portfolio-risk-free-tangency-sharpe"
          questions={QUESTIONS}
        />
      </Reveal>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Risk-Free Asset, Tangency, and Sharpe"
          continueHref="/lessons/portfolio-risk-free-tangency-sharpe"
        />
      </Reveal>

      <Reveal className="mt-8">
        <PTSourcePanel />
      </Reveal>
    </PTLayout>
  );
}
