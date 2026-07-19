"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Reveal,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  Feedback,
  InteractiveFrame,
  TryItTag,
  MasteryCheck,
  type MasteryQuestion,
  LessonSummary,
  ConceptSection,
  MathDerivationStepper,
  type DerivationStep,
  PortfolioMatrixVisual,
  Matrix2x2,
  CalculationWorksheet,
} from "./shared";
import { InlineMath, BlockMath } from "@/components/ui/Math";
import ExpandableQA from "@/components/lessons/equities/ExpandableQA";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import PTLayout from "./PTLayout";
import PTSourcePanel from "./PTSourcePanel";
import { useReportPTComplete } from "@/lib/pt-progress";

const LEARNING_OBJECTIVES = [
  "Explain why portfolio standard deviation is not a weighted average of individual standard deviations.",
  "Expand the two-asset portfolio variance and identify the cross-product covariance terms.",
  "Build a weighted covariance matrix and sum its entries to obtain portfolio variance.",
  "Apply the two-asset variance formula and interpret the factor of 2.",
  "Compute portfolio volatility for GM and Motorola using historical estimates.",
  "Show how correlation affects achievable portfolio volatility, including the opportunity curve.",
];

const SUMMARY_POINTS = [
  "Portfolio variance expands the weighted return expression, producing cross-product covariance terms.",
  "The weighted covariance matrix applies row and column weights to each cell.",
  "Portfolio variance = sum of all weighted matrix entries.",
  "The factor of 2 arises from two symmetric covariance cells combining.",
  "Imperfect correlation (ρ < 1) can produce portfolio SD below any individual asset SD.",
  "The two-asset opportunity curve shows achievable risk-return combinations.",
  "Correlations can change, especially during stress — diversification estimates are uncertain.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Why is portfolio SD not a weighted average of individual SDs?",
    choices: [
      { id: "imperfect", label: "Because assets are imperfectly correlated" },
      { id: "sum", label: "Because weights don't sum to 1" },
      { id: "neg", label: "Because returns are negative" },
    ],
    correctId: "imperfect",
    hint: "When assets are not perfectly correlated, their movements partially offset, so risk does not combine linearly.",
  },
  {
    id: "q2",
    type: "single",
    prompt:
      "In the two-asset formula, why is there a factor of 2 in front of the covariance term?",
    choices: [
      { id: "sym", label: "Two symmetric covariance cells combine" },
      { id: "twoa", label: "There are two assets" },
      { id: "twow", label: "There are two weights" },
    ],
    correctId: "sym",
    hint: "The A-B and B-A covariance cells are equal; they combine into 2 × covariance.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "GM/Motorola at 75/25 weights. σ_P ≈ ?",
    choices: [
      { id: "a", label: "6.01%" },
      { id: "b", label: "6.23%" },
      { id: "c", label: "9.73%" },
    ],
    correctId: "a",
    hint: "Sum the weighted matrix (≈ 36.16) and take the square root: √36.16 ≈ 6.01%.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "ρ = 1, equal weights, σ_A = σ_B = 20%. σ_P?",
    choices: [
      { id: "twenty", label: "20%" },
      { id: "fourteen", label: "14.14%" },
      { id: "zero", label: "0%" },
    ],
    correctId: "twenty",
    hint: "At ρ = 1 risk combines linearly: 0.5 × 20% + 0.5 × 20% = 20%.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "ρ = −1, equal weights, σ_A = σ_B = 20%. σ_P?",
    choices: [
      { id: "zero", label: "0%" },
      { id: "twenty", label: "20%" },
      { id: "fourteen", label: "14.14%" },
    ],
    correctId: "zero",
    hint: "At ρ = −1 with equal weights and equal volatilities, the assets perfectly offset: σ_P = 0%.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "60/40, σ_A = 12%, σ_B = 18%, ρ = 0.25. σ_P ≈ ?",
    choices: [
      { id: "a", label: "11.38%" },
      { id: "b", label: "14.4%" },
      { id: "c", label: "12%" },
    ],
    correctId: "a",
    hint: "σ_P = √0.01296 ≈ 0.1138 = 11.38%, below both individual volatilities because ρ < 1.",
  },
];

const GM_ER = 1.08;
const GM_SIGMA = 6.23;
const MOT_ER = 1.75;
const MOT_SIGMA = 9.73;

function portfolioPoint(wMot: number, rho: number) {
  const wGm = 1 - wMot;
  const variance =
    wGm * wGm * GM_SIGMA * GM_SIGMA +
    wMot * wMot * MOT_SIGMA * MOT_SIGMA +
    2 * wGm * wMot * rho * GM_SIGMA * MOT_SIGMA;
  const sigmaP = Math.sqrt(Math.max(variance, 0));
  const eRP = wGm * GM_ER + wMot * MOT_ER;
  return { sigmaP, eRP };
}

function NotationGuide() {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 sm:p-6">
      <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-slate-400">
        Notation guide
      </div>
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {[
          { tex: String.raw`\sigma_P`, desc: "portfolio standard deviation (volatility)" },
          { tex: String.raw`\sigma_P^2`, desc: "portfolio variance" },
          { tex: String.raw`\Sigma`, desc: "covariance matrix (uppercase sigma)" },
          { tex: String.raw`\sum`, desc: "summation operator — add a sequence of terms" },
        ].map((row) => (
          <div key={row.tex} className="flex items-center gap-3">
            <span className="min-w-[3rem] text-slate-100">
              <InlineMath>{row.tex}</InlineMath>
            </span>
            <span className="text-[16px] leading-[1.5] text-slate-300">{row.desc}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[15px] leading-[1.6] text-slate-400">
        Lowercase <InlineMath>{String.raw`\sigma`}</InlineMath> is a standard deviation;
        uppercase <InlineMath>{String.raw`\Sigma`}</InlineMath> is the covariance matrix.
        They are not interchangeable.
      </p>
    </div>
  );
}

function ReturnPathVisual() {
  const W = 520;
  const H = 200;
  const padL = 12;
  const padR = 12;
  const padT = 16;
  const padB = 16;
  const n = 40;

  const gen = (seed: number, amp: number, drift: number) => {
    const pts: { x: number; y: number }[] = [];
    let v = 0.5;
    let s = seed;
    for (let i = 0; i <= n; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      v += (r - 0.5) * amp + drift;
      v = Math.max(0.15, Math.min(0.85, v));
      pts.push({
        x: padL + (i / n) * (W - padL - padR),
        y: padT + v * (H - padT - padB),
      });
    }
    return pts;
  };

  const toPath = (pts: { x: number; y: number }[]) =>
    "M " + pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" L ");

  const aTogeth = gen(7, 0.16, 0);
  const bTogetu = gen(91, 0.16, 0);
  const aOffset = gen(13, 0.16, 0);
  const bOffset = gen(299, 0.16, 0).map((p, i) => ({
    x: p.x,
    y: H - p.y + 2 * padT,
  }));

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div className="rounded-xl border border-accent-red/25 bg-accent-red/[0.04] p-5">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-red">
          Case A — move together
        </div>
        <p className="mt-2 text-[16px] leading-[1.6] text-slate-200">
          Each asset alone has <InlineMath>{String.raw`\sigma = 10\%`}</InlineMath>. They
          rise and fall together, so the 50/50 mix swings just as much — portfolio
          SD stays near 10%.
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="Two assets moving together">
          <path d={toPath(aTogeth)} fill="none" stroke="rgba(34,211,238,0.8)" strokeWidth={2} />
          <path d={toPath(bTogetu)} fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth={2} />
        </svg>
      </div>
      <div className="rounded-xl border border-accent-green/25 bg-accent-green/[0.04] p-5">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-green">
          Case B — offset
        </div>
        <p className="mt-2 text-[16px] leading-[1.6] text-slate-200">
          Same individual volatilities, but when A rises B tends to fall. Gains and
          losses partially cancel, so portfolio SD can fall well below 10%.
        </p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 w-full" role="img" aria-label="Two assets moving in offset">
          <path d={toPath(aOffset)} fill="none" stroke="rgba(34,211,238,0.8)" strokeWidth={2} />
          <path d={toPath(bOffset)} fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth={2} />
        </svg>
      </div>
    </div>
  );
}

const EXPANSION_STEPS: DerivationStep[] = [
  {
    heading: "Start from portfolio return",
    explanation:
      "We begin with the two-asset portfolio return and ask what happens when we measure its spread around the mean.",
    formula: String.raw`R_P = w_A R_A + w_B R_B`,
  },
  {
    heading: "Subtract the expected return",
    explanation:
      "Subtract E[R_P] from both sides. Because expectation is linear, E[R_P] = w_A E[R_A] + w_B E[R_B].",
    changeNote: (
      <>
        Each weight now multiplies a return <em>deviation</em> from that asset&apos;s own
        mean: <InlineMath>{String.raw`(R_i - E[R_i])`}</InlineMath>.
      </>
    ),
    formula: String.raw`R_P - E[R_P] = w_A(R_A - E[R_A]) + w_B(R_B - E[R_B])`,
  },
  {
    heading: "Square the whole expression",
    explanation:
      "Variance is the expectation of the square. We square the entire right-hand side — the familiar (a + b)² pattern.",
    formula: String.raw`(a + b)^2 = a^2 + ab + ba + b^2`,
    changeNote: "Four products appear: two diagonal, two cross.",
  },
  {
    heading: "Map the four products into cells",
    explanation:
      "Replace a with asset A's deviation term and b with asset B's. Each product lands in one cell of a 2×2 matrix.",
    changeNote: "The two off-diagonal cells are the cross-products — the co-movement terms.",
    formula: (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <BlockMath>{String.raw`\sigma_P^2 = a^2 + ab + ba + b^2`}</BlockMath>
          <p className="mt-3 text-center text-[15px] text-slate-400">
            with <InlineMath>{String.raw`a = w_A(R_A - E[R_A])`}</InlineMath>,{" "}
            <InlineMath>{String.raw`b = w_B(R_B - E[R_B])`}</InlineMath>
          </p>
        </div>
        <div className="mx-auto w-full max-w-[260px]">
          <Matrix2x2
            rowLabels={["A", "B"]}
            colLabels={["A", "B"]}
            topLeft={<span className="font-mono text-[15px]">a²</span>}
            topRight={<span className="font-mono text-[15px]">ab</span>}
            bottomLeft={<span className="font-mono text-[15px]">ba</span>}
            bottomRight={<span className="font-mono text-[15px]">b²</span>}
            highlight={["tl", "tr", "bl", "br"]}
            highlightTone="cyan"
          />
        </div>
      </div>
    ),
  },
  {
    heading: "Combine the symmetric covariance cells",
    explanation:
      "The two off-diagonal cells hold the same covariance (Cov is symmetric), so they combine into a single 2 × covariance term.",
    changeNote:
      "This is exactly where the factor of 2 in the two-asset formula comes from.",
    formula: (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <BlockMath>{String.raw`ab + ba = 2\,w_A w_B\,\operatorname{Cov}(R_A, R_B)`}</BlockMath>
        </div>
        <div className="mx-auto w-full max-w-[260px]">
          <Matrix2x2
            rowLabels={["A", "B"]}
            colLabels={["A", "B"]}
            topLeft={<span className="font-mono text-[14px]">w²σ²</span>}
            topRight={<span className="font-mono text-[14px] text-accent-amber">Cov</span>}
            bottomLeft={<span className="font-mono text-[14px] text-accent-amber">Cov</span>}
            bottomRight={<span className="font-mono text-[14px]">w²σ²</span>}
            highlight={["tr", "bl"]}
            highlightTone="amber"
          />
        </div>
      </div>
    ),
  },
];

function GMMotorolaLedger() {
  const rows = [
    { cell: "GM diagonal", formula: "0.75² × 6.23²", value: "21.83", tone: "diag" as const },
    { cell: "GM × MOT", formula: "0.75 × 0.25 × 0.37 × 6.23 × 9.73", value: "4.21", tone: "off" as const },
    { cell: "MOT × GM", formula: "0.25 × 0.75 × 0.37 × 9.73 × 6.23", value: "4.21", tone: "off" as const },
    { cell: "MOT diagonal", formula: "0.25² × 9.73²", value: "5.92", tone: "diag" as const },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] border-collapse text-[16px]">
        <thead>
          <tr className="border-b border-white/20 text-left">
            <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Weighted cell
            </th>
            <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Calculation
            </th>
            <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
              Value
            </th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums text-slate-100">
          {rows.map((r) => (
            <tr
              key={r.cell}
              className={cn(
                "border-b border-white/5",
                r.tone === "off" && "bg-accent-amber/[0.04]",
              )}
            >
              <td className="py-3 pr-6">{r.cell}</td>
              <td className="py-3 pr-6 text-slate-300">{r.formula}</td>
              <td
                className={cn(
                  "py-3",
                  r.tone === "off" ? "text-accent-amber" : "text-accent-cyan",
                )}
              >
                {r.value}
              </td>
            </tr>
          ))}
          <tr>
            <td className="py-3 pr-6 font-semibold text-slate-50" colSpan={2}>
              Two off-diagonals combine → 2 × 4.21
            </td>
            <td className="py-3 font-mono text-accent-amber">8.42</td>
          </tr>
          <tr className="border-t border-white/15">
            <td className="py-3 pr-6 font-semibold text-slate-50" colSpan={2}>
              Sum = σ²_P (21.83 + 8.42 + 5.92)
            </td>
            <td className="py-3 font-mono font-semibold text-accent-green">36.16</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function OpportunityCurveExplorer() {
  const reduce = useReducedMotion();
  const [wMot, setWMot] = useState(0.25);
  const [rho, setRho] = useState(0.37);

  const curve = useMemo(() => {
    const pts: { x: number; y: number; wMot: number }[] = [];
    for (let i = 0; i <= 100; i++) {
      const w = i / 100;
      const { sigmaP, eRP } = portfolioPoint(w, rho);
      pts.push({ x: sigmaP, y: eRP, wMot: w });
    }
    return pts;
  }, [rho]);

  const xMin = 0;
  const xMax = 12;
  const yMin = 0.8;
  const yMax = 2.0;
  const W = 560;
  const H = 400;
  const padL = 60;
  const padR = 24;
  const padT = 24;
  const padB = 52;

  const sx = (x: number) =>
    padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const sy = (y: number) =>
    padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  const path =
    "M " +
    curve.map((p) => `${sx(p.x).toFixed(1)} ${sy(p.y).toFixed(1)}`).join(" L ");

  const current = portfolioPoint(wMot, rho);
  const gmPoint = portfolioPoint(0, rho);
  const motPoint = portfolioPoint(1, rho);

  const xTicks = [0, 3, 6, 9, 12];
  const yTicks = [0.8, 1.1, 1.4, 1.7, 2.0];

  const rhoPresets = [
    { label: "1", value: 1 },
    { label: "0.37", value: 0.37 },
    { label: "0", value: 0 },
    { label: "−0.5", value: -0.5 },
    { label: "−1", value: -1 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[480px]"
          role="img"
          aria-label="Opportunity curve of portfolio risk versus expected return"
        >
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={sx(t)} x2={sx(t)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
              <text x={sx(t)} y={H - padB + 22} fill="rgba(148,163,184,0.85)" fontSize="13" fontFamily="monospace" textAnchor="middle">
                {t}%
              </text>
            </g>
          ))}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
              <text x={padL - 12} y={sy(t) + 5} fill="rgba(148,163,184,0.85)" fontSize="13" fontFamily="monospace" textAnchor="end">
                {t.toFixed(1)}%
              </text>
            </g>
          ))}
          <text x={(padL + W - padR) / 2} y={H - 8} fill="rgba(148,163,184,0.9)" fontSize="14" textAnchor="middle">
            σ_P (risk, %)
          </text>
          <text x={16} y={(padT + H - padB) / 2} fill="rgba(148,163,184,0.9)" fontSize="14" textAnchor="middle" transform={`rotate(-90 16 ${(padT + H - padB) / 2})`}>
            E[R_P] (%, monthly)
          </text>

          <path d={path} fill="none" stroke="rgba(34,211,238,0.7)" strokeWidth={2.5} />

          <circle cx={sx(gmPoint.sigmaP)} cy={sy(gmPoint.eRP)} r={5} fill="rgba(251,191,36,0.95)" />
          <text x={sx(gmPoint.sigmaP) + 9} y={sy(gmPoint.eRP) - 7} fill="rgba(251,191,36,0.95)" fontSize="13" fontFamily="monospace">
            GM
          </text>
          <circle cx={sx(motPoint.sigmaP)} cy={sy(motPoint.eRP)} r={5} fill="rgba(167,139,250,0.95)" />
          <text x={sx(motPoint.sigmaP) + 9} y={sy(motPoint.eRP) - 7} fill="rgba(167,139,250,0.95)" fontSize="13" fontFamily="monospace">
            Motorola
          </text>

          <motion.circle
            cx={sx(current.sigmaP)}
            cy={sy(current.eRP)}
            r={7}
            fill="rgba(34,211,238,1)"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={1.5}
            animate={reduce ? undefined : { cx: sx(current.sigmaP), cy: sy(current.eRP) }}
            transition={{ duration: 0.15 }}
          />
        </svg>
        <p className="mt-2 text-[14px] text-slate-500">
          Historical monthly instructional estimates, GM and Motorola, 1946–2001 — not
          current estimates.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
            Motorola weight: <span className="text-accent-cyan">{(wMot * 100).toFixed(0)}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(wMot * 100)}
            onChange={(e) => setWMot(Number(e.target.value) / 100)}
            className="mt-2 w-full accent-accent-cyan"
            aria-label="Motorola weight"
          />
          <label className="mt-4 block font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
            Correlation ρ: <span className="text-accent-cyan">{rho.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={rho}
            onChange={(e) => setRho(Number(e.target.value))}
            className="mt-2 w-full accent-accent-cyan"
            aria-label="Correlation"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {rhoPresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setRho(p.value)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-[13px] transition-colors",
                  Math.abs(rho - p.value) < 0.005
                    ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                    : "border-white/20 text-slate-300 hover:border-accent-cyan/60 hover:text-accent-cyan",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Readout label="GM weight" value={`${((1 - wMot) * 100).toFixed(0)}%`} />
          <Readout label="MOT weight" value={`${(wMot * 100).toFixed(0)}%`} />
          <Readout label="E[R_P]" value={`${current.eRP.toFixed(2)}%`} />
          <Readout label="σ_P" value={`${current.sigmaP.toFixed(2)}%`} tone="cyan" />
        </div>
        <p className="text-[15px] leading-[1.6] text-slate-300">
          At ρ = {rho.toFixed(2)},{" "}
          {rho < 1
            ? "the curve bends left — imperfect correlation creates volatility reductions. "
            : "the curve is a straight line — no diversification benefit. "}
          {current.sigmaP < Math.max(GM_SIGMA, MOT_SIGMA)
            ? `The current mix has σ_P = ${current.sigmaP.toFixed(2)}%, below Motorola's ${MOT_SIGMA}%.`
            : `The current mix has σ_P = ${current.sigmaP.toFixed(2)}%.`}
          {rho <= -0.99 && " Near ρ = −1, a specific mix can drive portfolio volatility toward zero."}
        </p>
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "cyan";
}) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3">
      <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-mono text-[18px]", tone === "cyan" ? "text-accent-cyan" : "text-slate-100")}>
        {value}
      </div>
    </div>
  );
}

export default function Lesson6_2() {
  const report = useReportPTComplete("portfolio-risk-covariance-correlation");

  return (
    <PTLayout>
      <PVHero
        index="6.2"
        eyebrow="Lesson 6.2 · Module 6 — Portfolio Theory"
        heading="Portfolio Risk, Covariance, and Correlation"
        subheading="Why portfolio volatility is not a weighted average. Expand the variance, build the weighted covariance matrix, and explore the opportunity curve."
        bullets={[
          "Variance expansion shows cross-products",
          "Weighted covariance matrix = raw matrix × weights",
          "Factor of 2 from symmetric covariance",
          "Imperfect correlation lowers volatility",
          "Two-asset opportunity curve",
        ]}
        primaryLabel="Start"
      />

      <Reveal className="mt-8">
        <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6 sm:p-7">
          <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-slate-400">
            Learning objectives
          </div>
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

      <Reveal className="mt-8">
        <NotationGuide />
      </Reveal>

      {/* ===================== ACT I ===================== */}
      <ConceptSection
        index="6.2.1"
        eyebrow="Act I · Why weighted-average volatility fails"
        title="Same volatility, different portfolio risk"
        topMargin="mt-16 sm:mt-20"
        intro="Before any formula, see the problem. Two assets, each with a volatility of 10%. Depending on how they move, a 50/50 portfolio can be very safe or just as risky as either asset alone."
      >
        <Reveal>
          <ReturnPathVisual />
        </Reveal>
        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            Same individual volatilities in both cases — different portfolio risk.
            Portfolio risk depends on each asset&apos;s own volatility{" "}
            <strong className="text-white">and</strong> how they move together. A
            weighted average of the individual <InlineMath>{String.raw`\sigma`}</InlineMath>
            {" "}cannot capture that.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== ACT II ===================== */}
      <ConceptSection
        index="6.2.2"
        eyebrow="Act II · Where the covariance terms come from"
        title="Expanding the two-asset variance"
        intro="The cross-product covariance terms are not an accident. They appear because both assets sit inside the same squared expression. Walk through the expansion one step at a time."
      >
        <Reveal>
          <MathDerivationStepper
            steps={EXPANSION_STEPS}
            title="Variance expansion"
            ariaSummary="The two-asset portfolio variance is derived by starting from portfolio return, subtracting expected return, squaring the whole expression using (a+b)-squared, mapping the four products into a two-by-two matrix, and combining the two symmetric covariance cells into the factor of two."
          />
        </Reveal>

        <Reveal>
          <FormulaExplainer
            label="Two-asset portfolio variance"
            formula={String.raw`\sigma_P^2 = w_A^2\sigma_A^2 + w_B^2\sigma_B^2 + 2\,w_A w_B\,\rho_{A,B}\,\sigma_A\sigma_B`}
            meaning="Portfolio variance has three parts: A's weighted variance, B's weighted variance, and a cross term from their covariance (written here with correlation ρ)."
            variables={[
              { symbol: String.raw`w_A, w_B`, description: "Portfolio weights." },
              { symbol: String.raw`\sigma_A, \sigma_B`, description: "Individual standard deviations." },
              { symbol: String.raw`\rho_{A,B}`, description: "Correlation between A and B." },
            ]}
            interpretation="The factor of 2 appears because covariance shows up in both the A-B cell and the B-A cell of the weighted matrix. Since they are equal, they combine into 2 × covariance. Then σ_P = √(σ_P²)."
          />
        </Reveal>

        <Reveal>
          <FormulaExplainer
            label="Correlation"
            formula={String.raw`\rho_{A,B} = \frac{\operatorname{Cov}(R_A,R_B)}{\sigma_A\sigma_B}`}
            meaning="Correlation is covariance scaled into the range [−1, 1]. Rearranging: Cov(R_A,R_B) = ρ σ_A σ_B."
            variables={[
              { symbol: String.raw`\rho_{A,B}`, description: "Correlation, always between −1 and 1." },
              { symbol: String.raw`\operatorname{Cov}`, description: "Covariance between A and B." },
            ]}
            interpretation="Correlation measures only linear co-movement. It can change — often rising during market stress. Zero correlation is not the same as independence."
          />
        </Reveal>
      </ConceptSection>

      {/* ===================== ACT III — MATRICES ===================== */}
      <ConceptSection
        index="6.2.3"
        eyebrow="Act III · Calculate and explore"
        title="Raw matrix vs weighted matrix"
        intro="The expansion produces four terms that fit naturally into a 2×2 matrix. The raw covariance matrix describes the assets. The weighted matrix describes contributions to a specific portfolio."
      >
        <Reveal>
          <PortfolioMatrixVisual
            rowLabels={["GM", "MOT"]}
            colLabels={["GM", "MOT"]}
            rawCells={{
              tl: (
                <span className="font-mono">
                  <InlineMath>{String.raw`\sigma_A^2`}</InlineMath>
                </span>
              ),
              tr: <span className="font-mono">Cov(A,B)</span>,
              bl: <span className="font-mono">Cov(B,A)</span>,
              br: (
                <span className="font-mono">
                  <InlineMath>{String.raw`\sigma_B^2`}</InlineMath>
                </span>
              ),
            }}
            weightedCells={{
              tl: <span className="font-mono">w²ₐ σ²ₐ</span>,
              tr: <span className="font-mono">wₐw_b Cov</span>,
              bl: <span className="font-mono">w_b wₐ Cov</span>,
              br: <span className="font-mono">w²_b σ²_b</span>,
            }}
            sumNote={
              <span>
                Portfolio variance <InlineMath>{String.raw`\sigma_P^2`}</InlineMath> = the
                sum of <strong>all four</strong> weighted cells. Add them, then take the
                square root to recover <InlineMath>{String.raw`\sigma_P`}</InlineMath>.
              </span>
            }
          />
        </Reveal>

        <Reveal>
          <DefinitionCard term="Portfolio standard deviation (σ_P)">
            The typical size of portfolio return swings, in percentage points. It is
            the square root of portfolio variance.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== GM / MOTOROLA EXAMPLE ===================== */}
      <ConceptSection
        index="6.2.4"
        eyebrow="Worked example · GM & Motorola"
        title="A 75/25 portfolio, step by step"
        intro="Historical monthly instructional estimates, 1946–2001. These are teaching numbers, not current estimates."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
                    Asset
                  </th>
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
                    Mean return
                  </th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">
                    Std dev σ
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-8">GM</td>
                  <td className="py-3 pr-8">1.08%</td>
                  <td className="py-3">6.23%</td>
                </tr>
                <tr>
                  <td className="py-3 pr-8">Motorola</td>
                  <td className="py-3 pr-8">1.75%</td>
                  <td className="py-3">9.73%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            Correlation over this period was{" "}
            <InlineMath>{String.raw`\rho = 0.37`}</InlineMath>. Build a portfolio of 75% GM
            and 25% Motorola.
          </p>
        </Reveal>

        <Reveal>
          <FormulaExplainer
            label="Expected portfolio return"
            formula={String.raw`E[R_P] = w_A E[R_A] + w_B E[R_B]`}
            substitution={String.raw`E[R_P] = 0.75 \times 1.08\% + 0.25 \times 1.75\% = 0.81\% + 0.4375\%`}
            result="E[R_P] ≈ 1.25%"
            tone="green"
          />
        </Reveal>

        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-200">
            Now the weighted covariance matrix entries (units: percentage-points
            squared). Combine the two off-diagonal cells, then take the square root
            only after the variance sum is complete.
          </p>
          <div className="mt-5">
            <GMMotorolaLedger />
          </div>
        </Reveal>

        <Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
                Final outputs
              </div>
              <div className="mt-4">
                <BlockMath>{String.raw`\sigma_P = \sqrt{36.16} \approx 6.01\%`}</BlockMath>
              </div>
              <p className="mt-3 text-[16px] leading-[1.6] text-slate-200">
                <InlineMath>{String.raw`E[R_P] \approx 1.25\%`}</InlineMath>,{" "}
                <InlineMath>{String.raw`\sigma_P \approx 6.01\%`}</InlineMath>.
              </p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">
                Interpretation
              </div>
              <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
                The portfolio volatility of 6.01% sits below Motorola&apos;s 9.73% and close
                to GM&apos;s 6.23%. The partial offset from imperfect correlation pulled risk
                down.
              </p>
            </div>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== WORKSHEET 1 ===================== */}
      <ConceptSection
        index="6.2.5"
        eyebrow="Worksheet · Build the weighted matrix"
        title="Fill in the weighted covariance matrix"
        intro="Using GM (σ = 6.23%, E[R] = 1.08%) and Motorola (σ = 9.73%, E[R] = 1.75%), with ρ = 0.37, at a 75/25 mix. Each cell receives row weight × column weight. Work in percentage-points squared."
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check worksheet"
              groups={[
                {
                  heading: "Weights",
                  fields: [
                    { id: "wg", label: "GM weight", answer: 75, tolerance: 0.05, unit: "%", decimals: 2, hints: ["Given in the example.", "75% in GM."], solution: "GM weight = 75%." },
                    { id: "wm", label: "Motorola weight", answer: 25, tolerance: 0.05, unit: "%", decimals: 2, hints: ["Given.", "25% in Motorola."], solution: "Motorola weight = 25%." },
                  ],
                },
                {
                  heading: "Diagonal cells (w² × σ²)",
                  fields: [
                    { id: "dg", label: "GM diagonal (0.75² × 6.23²)", answer: 21.83, tolerance: 0.05, decimals: 2, hints: ["Diagonal uses w².", "0.75² × 6.23²."], solution: "0.75² × 6.23² = 21.83." },
                    { id: "dm", label: "Motorola diagonal (0.25² × 9.73²)", answer: 5.92, tolerance: 0.05, decimals: 2, hints: ["w_B² × σ_B².", "0.25² × 9.73²."], solution: "0.25² × 9.73² = 5.92." },
                  ],
                },
                {
                  heading: "Off-diagonal cell (wₐ × w_b × ρ × σₐ × σ_b)",
                  fields: [
                    { id: "od", label: "Each off-diagonal cell", answer: 4.21, tolerance: 0.05, decimals: 2, hints: ["0.75 × 0.25 × 0.37 × 6.23 × 9.73.", "Covariance is symmetric, so both cells equal this."], solution: "0.75 × 0.25 × 0.37 × 6.23 × 9.73 = 4.21." },
                  ],
                },
                {
                  heading: "Sum and outputs",
                  fields: [
                    { id: "sum", label: "σ²_P (21.83 + 2×4.21 + 5.92)", answer: 36.16, tolerance: 0.05, decimals: 2, hints: ["Add both diagonals and both off-diagonals.", "21.83 + 4.21 + 4.21 + 5.92."], solution: "21.83 + 4.21 + 4.21 + 5.92 = 36.16." },
                    { id: "sd", label: "σ_P = √(σ²_P)", answer: 6.01, tolerance: 0.02, unit: "%", decimals: 2, hints: ["√36.16.", "≈ 6.01."], solution: "√36.16 ≈ 6.01%." },
                    { id: "er", label: "E[R_P] (weighted average)", answer: 1.25, tolerance: 0.02, unit: "%", decimals: 2, hints: ["0.75 × 1.08% + 0.25 × 1.75%.", "0.81 + 0.4375 ≈ 1.25."], solution: "0.75 × 1.08% + 0.25 × 1.75% ≈ 1.25%." },
                  ],
                },
              ]}
              interpretation={
                <span>
                  The four cells sum to <span className="font-mono text-slate-100">36.16</span>,
                  and <InlineMath>{String.raw`\sigma_P = \sqrt{36.16} \approx 6.01\%`}</InlineMath>{" "}
                  — below Motorola&apos;s 9.73% because the assets are imperfectly correlated.
                </span>
              }
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== WORKSHEET 2 — CORRELATION COMPARISON ===================== */}
      <ConceptSection
        index="6.2.6"
        eyebrow="Worksheet · Correlation comparison"
        title="How low can correlation drive σ_P?"
        intro="Two assets, equal weights (50/50), each with σ = 20%. The only thing changing is the correlation. Compute σ_P for each case with the two-asset formula."
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check comparison"
              groups={[
                {
                  heading: "σ_P at each correlation",
                  fields: [
                    { id: "p1", label: "σ_P when ρ = 1", answer: 20, tolerance: 0.05, unit: "%", decimals: 2, hints: ["Risk combines linearly.", "0.5 × 20% + 0.5 × 20%."], solution: "σ_P = w_A σ_A + w_B σ_B = 20%." },
                    { id: "p0", label: "σ_P when ρ = 0", answer: 14.14, tolerance: 0.05, unit: "%", decimals: 2, hints: ["σ_P² = 0.5²×20² + 0.5²×20².", "σ_P = √200."], solution: "σ_P = √200 ≈ 14.14%." },
                    { id: "pn", label: "σ_P when ρ = −0.5", answer: 10, tolerance: 0.05, unit: "%", decimals: 2, hints: ["Cross term becomes negative.", "σ_P² = 100 + 100 + 2×0.25×(−0.5)×400 = 100."], solution: "σ_P = √100 = 10%." },
                    { id: "pm", label: "σ_P when ρ = −1", answer: 0, tolerance: 0.05, unit: "%", decimals: 2, hints: ["Perfect negative correlation offsets fully.", "σ_P² = 0."], solution: "σ_P = √0 = 0%." },
                  ],
                },
              ]}
              interpretation={
                <span>
                  Correlation is the dial that controls diversification. From ρ = 1 to
                  ρ = −1, the same two assets produce portfolio volatility from{" "}
                  <span className="font-mono text-slate-100">20%</span> down to{" "}
                  <span className="font-mono text-slate-100">0%</span>.
                </span>
              }
              interpretationTone="info"
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== OPPORTUNITY CURVE ===================== */}
      <ConceptSection
        index="6.2.7"
        eyebrow="Exploratory · Opportunity curve"
        title="The two-asset opportunity curve"
        intro="Every possible GM/Motorola mix plots as a point on a risk-return graph. Drag the Motorola weight to move along the curve; change the correlation to reshape it."
      >
        <Reveal>
          <InteractiveFrame>
            <OpportunityCurveExplorer />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== CORRELATION CAN CHANGE ===================== */}
      <ConceptSection
        index="6.2.8"
        eyebrow="Caution · Correlation can change"
        title="Diversification estimates are uncertain"
        intro="The diversification benefit depends on the correlation you assume. But correlations are not fixed."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Regime</th>
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">ρ</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Curve position</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                <tr className="border-b border-white/5">
                  <td className="py-3 pr-8">Normal</td>
                  <td className="py-3 pr-8">0.37</td>
                  <td className="py-3 text-accent-green">Bends left — real diversification</td>
                </tr>
                <tr>
                  <td className="py-3 pr-8">Stress</td>
                  <td className="py-3 pr-8">0.80</td>
                  <td className="py-3 text-accent-red">Shifts right — benefit shrinks</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            When correlations rise during stress, assets that seemed to diversify begin
            moving together — exactly when you need the protection most. This does not
            mean correlations always go to 1, but the direction matters.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== FINAL CHECK ===================== */}
      <ConceptSection
        index="6.2.9"
        eyebrow="Final check · Decimals to percentage"
        title="A 60/40 portfolio, ρ = 0.25"
        intro="w_A = 60%, w_B = 40%, σ_A = 12%, σ_B = 18%, ρ = 0.25. Work in decimals (e.g. σ_A = 0.12) so the variance is a clean decimal, then convert σ_P back to a percentage at the end."
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check final calculation"
              groups={[
                {
                  heading: "Diagonal cells (decimals)",
                  fields: [
                    { id: "da", label: "A diagonal (w_A² × σ_A²)", answer: 0.005184, tolerance: 0.0001, decimals: 6, hints: ["0.6² × 0.12².", "0.36 × 0.0144."], solution: "0.36 × 0.0144 = 0.005184." },
                    { id: "db", label: "B diagonal (w_B² × σ_B²)", answer: 0.005184, tolerance: 0.0001, decimals: 6, hints: ["0.4² × 0.18².", "0.16 × 0.0324."], solution: "0.16 × 0.0324 = 0.005184." },
                  ],
                },
                {
                  heading: "Variance and volatility",
                  fields: [
                    { id: "off", label: "Each off-diagonal (wₐ×w_b×ρ×σₐ×σ_b)", answer: 0.001296, tolerance: 0.0001, decimals: 6, hints: ["0.6 × 0.4 × 0.25 × 0.12 × 0.18.", "= 0.001296."], solution: "0.06 × 0.0216 = 0.001296." },
                    { id: "var", label: "Portfolio variance (sum of all 4 cells)", answer: 0.01296, tolerance: 0.0001, decimals: 5, hints: ["0.005184 + 0.005184 + 0.001296 + 0.001296.", "Add both diagonals and both off-diagonals."], solution: "0.005184×2 + 0.001296×2 = 0.01296." },
                    { id: "sd", label: "σ_P = √(variance), in percent", answer: 11.38, tolerance: 0.05, unit: "%", decimals: 2, hints: ["√0.01296 = 0.1138.", "→ 11.38%."], solution: "√0.01296 ≈ 0.1138 = 11.38%." },
                  ],
                },
              ]}
              interpretation={
                <span>
                  <InlineMath>{String.raw`\sigma_P \approx 11.38\%`}</InlineMath> is below
                  both 12% and 18% because the assets are imperfectly correlated
                  (ρ = 0.25). The partial offset shaves portfolio risk below either asset
                  alone.
                </span>
              }
              interpretationTone="correct"
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== OPTIONAL QA ===================== */}
      <ConceptSection
        index="6.2.10"
        eyebrow="Optional · Common questions"
        title="Questions you may still have"
        intro="Optional reminders and extensions. The core argument above stays visible; these expand on it."
        topMargin="mt-16"
      >
        <Reveal>
          <div className="space-y-3">
            <ExpandableQA question="Why does covariance appear twice in the formula?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                The weighted matrix has two off-diagonal cells: A-with-B and B-with-A.
                Covariance is symmetric, so both cells hold the same value. When summed,
                the two identical covariances combine into 2 × covariance.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Can I just sum the raw covariance matrix?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                No. The raw matrix describes the assets, not the portfolio. You must
                weight each cell by the row and column weights before summing. Summing
                the raw entries ignores how much of each asset you actually hold.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Why is the diagonal weighted by w²?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                On the diagonal, the row and column refer to the same asset. So the cell
                receives row weight × column weight = w_i × w_i = w_i². The off-diagonal
                cells receive w_i × w_j, two different weights.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Does lowering correlation increase expected return?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                No. Correlation only affects risk. E[R_P] is always the weighted average
                of expected returns regardless of ρ. Lower correlation reduces portfolio
                variance without changing the expected return.
              </p>
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-16">
        <MasteryCheck
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Diversification Across Many Assets"
          continueHref="/lessons/portfolio-diversification-many-assets"
          questions={QUESTIONS}
        />
      </Reveal>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Diversification Across Many Assets"
          continueHref="/lessons/portfolio-diversification-many-assets"
        />
      </Reveal>

      <Reveal className="mt-8">
        <PTSourcePanel />
      </Reveal>
    </PTLayout>
  );
}
