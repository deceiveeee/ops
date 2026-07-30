"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Reveal,
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

const SUMMARY_POINTS = [
  "The n×n covariance matrix has n variance entries and n²−n covariance entries.",
  "Equal-weight variance: σ²_P = (1/n)σ̄² + ((n−1)/n)Cōv.",
  "As n grows, the individual-variance component shrinks toward zero.",
  "The average-covariance component approaches Cōv — the systematic risk floor.",
  "Diversification reduces idiosyncratic risk but not systematic risk.",
  "Diversification depends on distinct risk sources, not just the number of tickers.",
  "The equal-weight model is a simplification with stated assumptions and limitations.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Equal-weight, n = 10, σ̄² = 0.01, Cōv = 0.004. What is σ²_P?",
    choices: [
      { id: "a", label: "0.0046" },
      { id: "b", label: "0.01" },
      { id: "c", label: "0.004" },
    ],
    correctId: "a",
    hint: "σ²_P = (1/10)(0.01) + (9/10)(0.004) = 0.001 + 0.0036 = 0.0046.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "As n → ∞, σ²_P approaches:",
    choices: [
      { id: "a", label: "Average covariance" },
      { id: "b", label: "Zero" },
      { id: "c", label: "Average variance" },
    ],
    correctId: "a",
    hint: "The variance term (1/n)σ̄² → 0, leaving only ((n−1)/n)Cōv → Cōv, the average covariance.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "n = 20, σ̄² = 0.01, Cōv = 0.004. σ_P ≈ ?",
    choices: [
      { id: "a", label: "6.56%" },
      { id: "b", label: "10%" },
      { id: "c", label: "6.32%" },
    ],
    correctId: "a",
    hint: "σ²_P = 0.0043, so σ_P = √0.0043 ≈ 0.0656 = 6.56%.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "ρ = 1, equal weights, σ = 10%. σ_P for any n?",
    choices: [
      { id: "a", label: "10%" },
      { id: "b", label: "10%/√n" },
      { id: "c", label: "0%" },
    ],
    correctId: "a",
    hint: "At ρ = 1 there is no diversification benefit — σ_P stays at 10% regardless of n.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "Why doesn't σ_P approach zero when ρ > 0?",
    choices: [
      { id: "a", label: "Average covariance remains" },
      { id: "b", label: "n is too small" },
      { id: "c", label: "Weights are wrong" },
    ],
    correctId: "a",
    hint: "When ρ > 0, Cōv > 0, so even as n grows the covariance floor remains — that is systematic risk.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "50 semiconductor companies in a portfolio:",
    choices: [
      { id: "a", label: "May still be concentrated" },
      { id: "b", label: "Is always diversified" },
      { id: "c", label: "Has zero risk" },
    ],
    correctId: "a",
    hint: "They share an industry risk source, so count alone does not guarantee diversification.",
  },
];

const BASE_VAR = 0.01;

function diversificationSD(n: number, rho: number): number {
  const cov = rho * BASE_VAR;
  const variance = (1 / n) * BASE_VAR + ((n - 1) / n) * cov;
  return Math.sqrt(Math.max(variance, 0));
}

function MatrixSchematic({ size }: { size: number }) {
  const cell = 26;
  const gap = 3;
  const total = size * cell + (size - 1) * gap;
  return (
    <svg viewBox={`0 0 ${total} ${total}`} className="w-full max-w-[260px]" role="img" aria-label={`${size} by ${size} covariance matrix schematic`}>
      {Array.from({ length: size }).map((_, i) =>
        Array.from({ length: size }).map((_, j) => {
          const isDiag = i === j;
          return (
            <rect
              key={`${i}-${j}`}
              x={j * (cell + gap)}
              y={i * (cell + gap)}
              width={cell}
              height={cell}
              rx={3}
              fill={isDiag ? "rgba(34,211,238,0.55)" : "rgba(251,191,36,0.32)"}
              stroke={isDiag ? "rgba(34,211,238,0.9)" : "rgba(251,191,36,0.6)"}
              strokeWidth={1}
            />
          );
        }),
      )}
    </svg>
  );
}

function MatrixGrowthVisual() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {[
        { n: 2, diag: 2, off: 2, label: "2×2 (Lesson 6.2)" },
        { n: 3, diag: 3, off: 6, label: "3×3" },
        { n: 10, diag: 10, off: 90, label: "n×n" },
      ].map((m) => (
        <div key={m.n} className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-slate-400">
            {m.label}
          </div>
          <div className="mt-4">
            <MatrixSchematic size={m.n} />
          </div>
          <div className="mt-4 space-y-1.5 text-[15px] text-slate-200">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-accent-cyan/70" />
              <span>
                <strong className="text-accent-cyan">{m.diag}</strong> variance cells
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-sm bg-accent-amber/50" />
              <span>
                <strong className="text-accent-amber">{m.off}</strong> covariance cells
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const DERIVATION_STEPS: DerivationStep[] = [
  {
    heading: "Every cell gets 1/n²",
    explanation:
      "With equal weights w_i = 1/n, each of the n² cells receives (1/n) × (1/n) = 1/n². Portfolio variance is the sum of all cells, each divided by n².",
    formula: String.raw`\sigma_P^2 = \frac{1}{n^2}\Big[\,\textstyle\sum\text{variances} + \sum\text{covariances}\,\Big]`,
    changeNote: "Diagonal cells (cyan) hold variances; off-diagonal cells (amber) hold covariances.",
  },
  {
    heading: "n diagonal variance cells",
    explanation:
      "There are n variance cells along the diagonal, averaging to σ̄², so their total is n × σ̄².",
    formula: String.raw`\sum_{\text{diag}} = n\,\bar{\sigma}^2`,
    changeNote: "Each diagonal cell is one asset with itself.",
  },
  {
    heading: "n(n−1) off-diagonal covariance cells",
    explanation:
      "There are n²−n = n(n−1) ordered covariance cells, averaging to Cōv. Their total is n(n−1) × Cōv.",
    formula: String.raw`\sum_{\text{off}} = n(n-1)\,\overline{\operatorname{Cov}}`,
    changeNote: "Ordered pairs: both (i,j) and (j,i) are counted.",
  },
  {
    heading: "Combine and simplify",
    explanation:
      "Substitute both sums, factor out n, and cancel one n. The result splits portfolio variance into two pieces.",
    formula: String.raw`\sigma_P^2 = \frac{1}{n^2}\big[n\bar{\sigma}^2 + n(n-1)\overline{\operatorname{Cov}}\big] = \frac{1}{n}\bar{\sigma}^2 + \frac{n-1}{n}\overline{\operatorname{Cov}}`,
    changeNote: "The first piece shrinks with n; the second piece approaches Cōv.",
  },
];

function EqualWeightSummary() {
  return (
    <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6 sm:p-8">
      <div className="font-sans text-[12px] uppercase tracking-[0.18em] text-accent-cyan">
        Equal-weight portfolio variance
      </div>
      <div className="mt-5">
        <BlockMath>{String.raw`\sigma_P^2 = \frac{1}{n}\overline{\sigma^2} + \frac{n-1}{n}\overline{\operatorname{Cov}}`}</BlockMath>
      </div>
      <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-cyan">
            Company-specific component
          </div>
          <div className="mt-3">
            <BlockMath>{String.raw`\frac{1}{n}\overline{\sigma^2}`}</BlockMath>
          </div>
          <p className="mt-3 text-[16px] leading-[1.6] text-slate-200">
            Shrinks toward zero as n grows — this is the diversifiable part.
          </p>
        </div>
        <div className="rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
          <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
            Common component
          </div>
          <div className="mt-3">
            <BlockMath>{String.raw`\frac{n-1}{n}\overline{\operatorname{Cov}}`}</BlockMath>
          </div>
          <p className="mt-3 text-[16px] leading-[1.6] text-slate-200">
            Approaches average covariance Cōv — the floor you cannot diversify below.
          </p>
        </div>
      </div>
    </div>
  );
}

function DiversificationCurveExplorer() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(10);
  const [rho, setRho] = useState(0.4);

  const curve = useMemo(() => {
    const pts: { n: number; sd: number }[] = [];
    for (let i = 1; i <= 100; i++) pts.push({ n: i, sd: diversificationSD(i, rho) });
    return pts;
  }, [rho]);

  const nMin = 1;
  const nMax = 100;
  const sdMin = 0;
  const sdMax = 10.5;
  const W = 560;
  const H = 400;
  const padL = 56;
  const padR = 24;
  const padT = 24;
  const padB = 52;

  const sx = (nv: number) =>
    padL + ((nv - nMin) / (nMax - nMin)) * (W - padL - padR);
  const sy = (sd: number) =>
    padT + (1 - (sd - sdMin) / (sdMax - sdMin)) * (H - padT - padB);

  const path =
    "M " + curve.map((p) => `${sx(p.n).toFixed(1)} ${sy(p.sd * 100).toFixed(1)}`).join(" L ");

  const currentSD = diversificationSD(n, rho);
  const floorSD = Math.sqrt(rho * BASE_VAR) * 100;
  const covComponent = ((n - 1) / n) * rho * BASE_VAR;
  const varComponent = (1 / n) * BASE_VAR;

  const xTicks = [1, 20, 40, 60, 80, 100];
  const yTicks = [0, 2, 4, 6, 8, 10];

  const rhoPresets = [
    { label: "1", value: 1 },
    { label: "0.40", value: 0.4 },
    { label: "0", value: 0 },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" role="img" aria-label="Portfolio standard deviation versus number of assets">
          {xTicks.map((t) => (
            <g key={`x${t}`}>
              <line x1={sx(t)} x2={sx(t)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
              <text x={sx(t)} y={H - padB + 22} fill="rgba(148,163,184,0.85)" fontSize="13" fontFamily="monospace" textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          {yTicks.map((t) => (
            <g key={`y${t}`}>
              <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
              <text x={padL - 12} y={sy(t) + 5} fill="rgba(148,163,184,0.85)" fontSize="13" fontFamily="monospace" textAnchor="end">
                {t}%
              </text>
            </g>
          ))}
          <text x={(padL + W - padR) / 2} y={H - 8} fill="rgba(148,163,184,0.9)" fontSize="14" textAnchor="middle">
            Number of assets (n)
          </text>
          <text x={16} y={(padT + H - padB) / 2} fill="rgba(148,163,184,0.9)" fontSize="14" textAnchor="middle" transform={`rotate(-90 16 ${(padT + H - padB) / 2})`}>
            σ_P (%)
          </text>

          {rho > 0 && (
            <>
              <line x1={padL} x2={W - padR} y1={sy(floorSD)} y2={sy(floorSD)} stroke="rgba(251,191,36,0.55)" strokeWidth={1.5} strokeDasharray="5 4" />
              <text x={W - padR} y={sy(floorSD) - 7} fill="rgba(251,191,36,0.95)" fontSize="13" fontFamily="monospace" textAnchor="end">
                floor ≈ {floorSD.toFixed(2)}%
              </text>
            </>
          )}

          <path d={path} fill="none" stroke="rgba(34,211,238,0.75)" strokeWidth={2.5} />

          <motion.circle
            cx={sx(n)}
            cy={sy(currentSD * 100)}
            r={7}
            fill="rgba(34,211,238,1)"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={1.5}
            animate={reduce ? undefined : { cx: sx(n), cy: sy(currentSD * 100) }}
            transition={{ duration: 0.12 }}
          />
        </svg>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
            Assets (n): <span className="text-accent-cyan">{n}</span>
          </label>
          <input type="range" min={1} max={100} step={1} value={n} onChange={(e) => setN(Number(e.target.value))} className="mt-2 w-full accent-accent-cyan" aria-label="Number of assets" />
          <label className="mt-4 block font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">
            Correlation ρ: <span className="text-accent-cyan">{rho.toFixed(2)}</span>
          </label>
          <input type="range" min={0} max={1} step={0.01} value={rho} onChange={(e) => setRho(Number(e.target.value))} className="mt-2 w-full accent-accent-cyan" aria-label="Correlation" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {rhoPresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setRho(p.value)}
                className={cn(
                  "rounded-full border px-3 py-1 font-sans text-[13px] transition-colors",
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
          <Readout label="Assets (n)" value={String(n)} />
          <Readout label="σ_P" value={`${(currentSD * 100).toFixed(2)}%`} tone="cyan" />
          <Readout label="Variance comp." value={varComponent.toFixed(4)} />
          <Readout label="Covariance comp." value={covComponent.toFixed(4)} />
        </div>
        <p className="text-[15px] leading-[1.6] text-slate-300">
          At ρ = {rho.toFixed(2)}{" "}
          {rho === 1
            ? "the curve is flat at 10% — no diversification when everything moves together."
            : rho === 0
              ? "volatility follows 10%/√n, falling steadily, but each additional asset removes less risk than the last."
              : `the curve falls quickly then flattens toward the ${floorSD.toFixed(2)}% covariance floor.`}
          {" "}At n = {n}, σ_P = {(currentSD * 100).toFixed(2)}%.
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
      <div className="font-sans text-[12px] uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className={cn("mt-1 font-sans text-[17px]", tone === "cyan" ? "text-accent-cyan" : "text-slate-100")}>
        {value}
      </div>
    </div>
  );
}

const GROWTH_TABLE = [
  [3, 3, 6, 9],
  [100, 100, "9,900", "10,000"],
] as const;

export default function Lesson6_3() {
  const report = useReportPTComplete("portfolio-diversification-many-assets");

  return (
    <PTLayout>
      <PVHero
        index="6.3"
        eyebrow="Lesson 6.3 · Module 6 — Portfolio Theory"
        heading="Diversification Across Many Assets"
        subheading="How the two-asset matrix generalizes to many assets, why company-specific risk shrinks, and why average covariance remains."
        bullets={[
          "n×n covariance matrix: n variances, n²−n covariances",
          "Equal-weight formula: σ²_P = (1/n)σ̄² + ((n−1)/n)Cōv",
          "Individual variance shrinks as n grows",
          "Average covariance remains as systematic risk",
          "Diversification has a floor",
        ]}
        primaryLabel="Start"
      />

      {/* ===================== SCENE 1 — MATRIX GROWTH ===================== */}
      <ConceptSection
        index="6.3.1"
        eyebrow="Scene 1 · Matrix growth"
        title="From two to many assets"
        intro="The two-asset matrix generalizes cleanly. With n assets you build an n×n covariance matrix: each diagonal cell holds a variance, each off-diagonal cell holds a covariance."
      >
        <Reveal>
          <FormulaExplainer
            label="Portfolio variance (compact form)"
            formula={String.raw`\sigma_P^2 = \mathbf{w}^\mathsf{T}\Sigma\mathbf{w}`}
            meaning="Portfolio variance equals the weight vector transposed, times the covariance matrix, times the weight vector. It sums every weighted covariance cell."
            variables={[
              { symbol: String.raw`\mathbf{w}`, description: "Column vector of portfolio weights." },
              { symbol: String.raw`\Sigma`, description: "n×n covariance matrix (uppercase sigma)." },
              { symbol: String.raw`\mathbf{w}^\mathsf{T}`, description: "Row vector (weights transposed)." },
            ]}
          />
        </Reveal>

        <Reveal>
          <MatrixGrowthVisual />
        </Reveal>

        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">n</th>
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Variance cells</th>
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Covariance cells</th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">Total</th>
                </tr>
              </thead>
              <tbody className="font-sans tabular-nums text-slate-100">
                {GROWTH_TABLE.map((row) => (
                  <tr key={String(row[0])} className="border-b border-white/5">
                    <td className="py-3 pr-8">{row[0]}</td>
                    <td className="py-3 pr-8">{row[1]}</td>
                    <td className="py-3 pr-8 text-accent-cyan">{row[2]}</td>
                    <td className="py-3">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            With 100 assets there are 9,900 covariance cells versus only 100 variance
            cells. But covariances matter not just because there are more of them — each
            cell is weighted, and the weight on any single cell shrinks as the portfolio
            spreads out.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 2 — EQUAL-WEIGHT DERIVATION ===================== */}
      <ConceptSection
        index="6.3.2"
        eyebrow="Scene 2 · Equal-weight derivation"
        title="Deriving the equal-weight variance"
        intro="Set every weight to 1/n. The four-stage derivation below splits portfolio variance into two pieces with very different futures."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DefinitionCard term="σ̄² (average variance)">
              The mean of the n individual variances along the diagonal.
            </DefinitionCard>
            <DefinitionCard term="Cōv (average covariance)">
              The mean of the n²−n off-diagonal covariances.
            </DefinitionCard>
          </div>
        </Reveal>

        <Reveal>
          <MathDerivationStepper
            steps={DERIVATION_STEPS}
            title="Equal-weight derivation"
            ariaSummary="Set every weight to one over n so each of the n-squared cells receives one over n-squared. The n diagonal cells sum to n times average variance. The n times n minus one off-diagonal cells sum to n times n minus one times average covariance. Substituting and simplifying yields one over n times average variance plus n minus one over n times average covariance."
          />
        </Reveal>

        <Reveal>
          <EqualWeightSummary />
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 3 — WORKSHEET n=10 ===================== */}
      <ConceptSection
        index="6.3.3"
        eyebrow="Scene 3 · Worksheet"
        title="Decompose the variance at n = 10"
        intro="Same scenario: σ̄² = 0.01, Cōv = 0.004, with 10 equal-weight assets. Build σ²_P from its two components, then convert to σ_P."
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check worksheet"
              groups={[
                {
                  heading: "Coefficients",
                  fields: [
                    { id: "cv", label: "Coefficient on variance (1/n)", answer: 0.1, tolerance: 0.005, decimals: 2, hints: ["1/n.", "1/10 = 0.10."], solution: "1/10 = 0.10." },
                    { id: "cc", label: "Coefficient on covariance ((n−1)/n)", answer: 0.9, tolerance: 0.005, decimals: 2, hints: ["(n−1)/n.", "(10−1)/10 = 9/10."], solution: "9/10 = 0.90." },
                  ],
                },
                {
                  heading: "Variance components",
                  fields: [
                    { id: "vv", label: "Variance component ((1/n) × σ̄²)", answer: 0.001, tolerance: 0.00005, decimals: 3, hints: ["0.10 × 0.01.", "= 0.001."], solution: "0.10 × 0.01 = 0.001." },
                    { id: "cvv", label: "Covariance component (((n−1)/n) × Cōv)", answer: 0.0036, tolerance: 0.00005, decimals: 4, hints: ["0.90 × 0.004.", "= 0.0036."], solution: "0.90 × 0.004 = 0.0036." },
                  ],
                },
                {
                  heading: "Total and standard deviation",
                  fields: [
                    { id: "tot", label: "Portfolio variance (sum of components)", answer: 0.0046, tolerance: 0.00005, decimals: 4, hints: ["0.001 + 0.0036.", "= 0.0046."], solution: "0.001 + 0.0036 = 0.0046." },
                    { id: "sd", label: "σ_P = √(variance), in percent", answer: 6.78, tolerance: 0.05, unit: "%", decimals: 2, hints: ["√0.0046 = 0.0678.", "→ 6.78%."], solution: "√0.0046 ≈ 6.78%." },
                  ],
                },
              ]}
              interpretation={
                <span>
                  At n = 10, the variance component (0.0010) is already small relative to
                  the covariance component (0.0036). Most of the diversifiable risk is gone
                  early; what remains is dominated by average covariance.
                </span>
              }
              interpretationTone="info"
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 3b — TABLE ===================== */}
      <ConceptSection
        index="6.3.4"
        eyebrow="Reference · σ_P as n grows"
        title="The curve in numbers"
        intro="Every asset has σ = 10% (so σ̄² = 0.01), average correlation ρ = 0.40 (so Cōv = 0.004). Watch what happens to the equal-weight portfolio as n grows."
        topMargin="mt-12"
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">n</th>
                  <th className="py-3 pr-8 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">σ²_P</th>
                  <th className="py-3 font-sans text-[13px] uppercase tracking-[0.14em] text-slate-400">σ_P</th>
                </tr>
              </thead>
              <tbody className="font-sans tabular-nums text-slate-100">
                {[
                  [1, "0.010000", "10.00%"],
                  [2, "0.007000", "8.37%"],
                  [5, "0.005200", "7.21%"],
                  [10, "0.004600", "6.78%"],
                  [20, "0.004300", "6.56%"],
                  [50, "0.004120", "6.42%"],
                  [100, "0.004060", "6.37%"],
                ].map(([n, v, sd]) => (
                  <tr key={n as number} className="border-b border-white/5">
                    <td className="py-3 pr-8">{n}</td>
                    <td className="py-3 pr-8">{v}</td>
                    <td className="py-3 text-accent-cyan">{sd}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-3 pr-8 font-semibold text-slate-50">∞ (limit)</td>
                  <td className="py-3 pr-8 font-semibold text-slate-50">0.004000</td>
                  <td className="py-3 font-semibold text-accent-green">6.32%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-5 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            At n = 100 the portfolio sits at 6.37%, close to but not identical to the
            limiting 6.32%. The bulk of the diversification happens in the first handful
            of assets; each new position after that removes only a sliver of risk.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 4 — DIVERSIFICATION CURVE ===================== */}
      <ConceptSection
        index="6.3.5"
        eyebrow="Scene 4 · Diversification curve"
        title="How many assets does it take?"
        intro="See the equal-weight formula in motion. Slide the number of assets and switch correlation presets to watch the curve bend toward its floor — or stay flat when correlation is 1."
      >
        <Reveal>
          <InteractiveFrame>
            <DiversificationCurveExplorer />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SCENE 5 — SYSTEMATIC vs IDIOSYNCRATIC ===================== */}
      <ConceptSection
        index="6.3.6"
        eyebrow="Scene 5 · Systematic vs idiosyncratic"
        title="The two components are two kinds of risk"
        intro="The two mathematical pieces map directly to two economic kinds of risk (Module 5 covers this in depth)."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-green">
                Idiosyncratic (diversifiable)
              </div>
              <div className="mt-3">
                <BlockMath>{String.raw`\frac{1}{n}\overline{\sigma^2}`}</BlockMath>
              </div>
              <p className="mt-3 text-[16px] leading-[1.6] text-slate-200">
                Company-specific events — a product failure, accounting fraud, a lawsuit.
                This is the part that washes away as n grows.
              </p>
            </div>
            <div className="rounded-2xl border border-accent-red/30 bg-accent-red/[0.05] p-6">
              <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-red">
                Systematic (non-diversifiable)
              </div>
              <div className="mt-3">
                <BlockMath>{String.raw`\frac{n-1}{n}\overline{\operatorname{Cov}}`}</BlockMath>
              </div>
              <p className="mt-3 text-[16px] leading-[1.6] text-slate-200">
                Market-wide forces — recession, inflation, financial crisis. This is the
                average-covariance floor that remains.
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            Diversification reduces idiosyncratic risk. It does{" "}
            <strong className="text-white">not</strong> eliminate systematic risk — that is
            the price of participating in the market.
          </p>
        </Reveal>

        <Reveal>
          <p className="max-w-3xl text-[17px] leading-[1.7] text-slate-300">
            Holding 50 semiconductor companies is <em className="text-slate-100">not</em>{" "}
            the same as being diversified. Neither is holding many banks, or many oil
            producers. The covariance floor stays high because the assets share the same
            risk source. Diversification depends on{" "}
            <strong className="text-white">distinct risk sources</strong>, not the number
            of tickers.
          </p>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
            <div className="font-sans text-[12px] uppercase tracking-[0.16em] text-accent-amber">
              Limitations of the model
            </div>
            <ul className="mt-4 space-y-3">
              {[
                "It assumes equal weights — real portfolios rarely hold every asset at 1/n.",
                "It assumes variances and covariances are stable — they are estimated and can shift.",
                "It ignores transaction costs, liquidity, and taxes — adding many assets is not free.",
                "It treats correlation as fixed — in stress, correlations can rise together.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                  <span className="text-[16px] leading-[1.6] text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[16px] leading-[1.65] text-slate-300">
              The diversification curve is a model, not a recommendation. It teaches the
              shape of the benefit and the existence of a floor — the real portfolio must
              account for everything the model leaves out.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== FINAL CHECK n=20 ===================== */}
      <ConceptSection
        index="6.3.7"
        eyebrow="Final check · n = 20"
        title="Decompose σ²_P at n = 20"
        intro="Same parameters: σ̄² = 0.01, Cōv = 0.004, now with 20 equal-weight assets. Find each component, the total variance, and σ_P."
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check final calculation"
              groups={[
                {
                  heading: "Components",
                  fields: [
                    { id: "vv", label: "Variance component ((1/n) × σ̄²)", answer: 0.0005, tolerance: 0.00005, decimals: 4, hints: ["1/20 = 0.05.", "0.05 × 0.01."], solution: "(1/20) × 0.01 = 0.0005." },
                    { id: "cv", label: "Covariance component (((n−1)/n) × Cōv)", answer: 0.0038, tolerance: 0.00005, decimals: 4, hints: ["19/20 = 0.95.", "0.95 × 0.004."], solution: "(19/20) × 0.004 = 0.0038." },
                  ],
                },
                {
                  heading: "Total and standard deviation",
                  fields: [
                    { id: "var", label: "Portfolio variance (sum of components)", answer: 0.0043, tolerance: 0.00005, decimals: 4, hints: ["0.0005 + 0.0038.", "Add the two components."], solution: "0.0005 + 0.0038 = 0.0043." },
                    { id: "sd", label: "σ_P = √(variance), in percent", answer: 6.56, tolerance: 0.05, unit: "%", decimals: 2, hints: ["√0.0043 = 0.0656.", "→ 6.56%."], solution: "√0.0043 ≈ 6.56%." },
                  ],
                },
              ]}
              interpretation={
                <span>
                  At n = 20, <InlineMath>{String.raw`\sigma_P \approx 6.56\%`}</InlineMath> —
                  already close to the 6.32% floor. Most of the diversifiable risk is gone;
                  what remains is dominated by the average covariance.
                </span>
              }
              interpretationTone="correct"
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== OPTIONAL QA ===================== */}
      <ConceptSection
        index="6.3.8"
        eyebrow="Optional · Common questions"
        title="Questions you may still have"
        intro="Optional reminders and extensions."
        topMargin="mt-16"
      >
        <Reveal>
          <div className="space-y-3">
            <ExpandableQA question="Can two risky assets form a safer portfolio than either alone?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                Yes — when their correlation is below 1. The cross term in the variance
                formula becomes smaller, lowering total portfolio variance below the lower
                individual variance (with the right weights). The lower the correlation,
                the stronger the effect.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Does diversification prevent losses?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                No. Diversification reduces the spread of outcomes around the expected
                return; it does not raise the expected return or guarantee a gain. In a
                market-wide downturn, the systematic floor still loses money.
              </p>
            </ExpandableQA>
            <ExpandableQA question="Does zero correlation mean independence?">
              <p className="text-[16px] leading-[1.7] text-slate-200">
                No. Zero correlation removes only the linear co-movement term. Two assets
                can be uncorrelated yet still dependent through nonlinear relationships.
                For the variance math, zero correlation zeroes the covariance component —
                but it is weaker than full statistical independence.
              </p>
            </ExpandableQA>
          </div>
        </Reveal>
      </ConceptSection>

      <Reveal className="mt-16">
        <MasteryCheck
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to the Efficient Frontier"
          continueHref="/lessons/portfolio-efficient-frontier"
          questions={QUESTIONS}
        />
      </Reveal>

      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to the Efficient Frontier"
          continueHref="/lessons/portfolio-efficient-frontier"
        />
      </Reveal>

      <Reveal className="mt-8">
        <PTSourcePanel />
      </Reveal>
    </PTLayout>
  );
}
