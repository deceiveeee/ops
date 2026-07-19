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
import BetaResponseLab from "./BetaResponseLab";
import VolatilityBetaComparison from "./VolatilityBetaComparison";
import PortfolioBetaBuilder from "./PortfolioBetaBuilder";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import CAPMLayout from "./CAPMLayout";
import CAPMSourcePanel from "./CAPMSourcePanel";
import { useReportCAPMComplete } from "@/lib/capm-progress";

const LEARNING_OBJECTIVES = [
  "Explain why beta is measured relative to the market portfolio.",
  "Distinguish market-related risk from company-specific risk.",
  "Distinguish beta from total standard deviation.",
  "Calculate beta from covariance and market variance.",
  "Interpret beta values below, equal to, and above one.",
  "Explain why zero beta does not mean risk-free.",
  "Calculate portfolio beta as a weighted average.",
  "Interpret how high- and low-beta portfolios behave in positive and negative market periods.",
  "Explain why higher beta is not automatically better.",
  "Use beta as a market-exposure and risk-budgeting measure.",
];

const SUMMARY_POINTS = [
  "Beta is measured relative to the market portfolio because that is the investor's risky benchmark.",
  "Total stock movement decomposes into market-related and company-specific movement.",
  "Beta = Cov(R_i, R_M) / Var(R_M) — covariance with the market over the market's own variance.",
  "Beta is the slope of the market relationship; observations scatter around it.",
  "β = 1 is market-like exposure; β < 1 lower; β > 1 higher; β = 0 no linear market exposure.",
  "Higher beta amplifies both positive and negative market movements, on average.",
  "A positive market excess return is not the same as an economic expansion.",
  "Beta is not total volatility: two assets can share σ but differ in β.",
  "Portfolio beta is a weighted average of asset betas.",
  "Higher beta is greater systematic exposure and higher required return — not guaranteed superiority.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "What does a beta of 1.5 mean?",
    choices: [
      { id: "a", label: "About 1.5 times the market's systematic exposure; tends to respond more strongly to market moves" },
      { id: "b", label: "1.5% expected return" },
      { id: "c", label: "Total volatility of 1.5%" },
    ],
    correctId: "a",
    hint: "Beta measures systematic exposure relative to the market, not total volatility or a return level.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "What happens to a high-beta portfolio when the market falls sharply?",
    choices: [
      { id: "a", label: "Its market-related return tends to fall more strongly than a lower-beta portfolio" },
      { id: "b", label: "It tends to rise" },
      { id: "c", label: "It is unaffected" },
    ],
    correctId: "a",
    hint: "Higher beta means more downside participation when the market falls, on average.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "Does a beta of zero mean risk-free?",
    choices: [
      { id: "a", label: "No — the asset may still have substantial company-specific volatility" },
      { id: "b", label: "Yes — zero beta means zero risk" },
      { id: "c", label: "Only if the risk-free rate is zero" },
    ],
    correctId: "a",
    hint: "Beta captures only market-related exposure. A zero-beta asset can still swing for firm-specific reasons.",
  },
  {
    id: "q4",
    type: "single",
    prompt: "Can two assets have the same standard deviation but different beta?",
    choices: [
      { id: "a", label: "Yes — similar total swings can hide different splits between market-related and firm-specific movement" },
      { id: "b", label: "No — same σ always means same β" },
    ],
    correctId: "a",
    hint: "σ measures total swings; β measures only the market-related portion. They can differ.",
  },
  {
    id: "q5",
    type: "single",
    prompt: "Is a higher beta automatically a better investment?",
    choices: [
      { id: "a", label: "No — it is greater systematic exposure and higher required compensation, not guaranteed superiority" },
      { id: "b", label: "Yes — higher beta always means higher risk-adjusted return" },
      { id: "c", label: "Yes — high-beta stocks always outperform" },
    ],
    correctId: "a",
    hint: "Investors should select systematic exposure consistent with their objectives, not chase the highest beta.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "How is portfolio beta computed?",
    choices: [
      { id: "a", label: "As the weighted average of the asset betas" },
      { id: "b", label: "As the sum of the asset standard deviations" },
      { id: "c", label: "As the highest beta in the portfolio" },
    ],
    correctId: "a",
    hint: "β_P = Σ wᵢ βᵢ — portfolio beta is linear in the weights.",
  },
];

function CentralQuestion() {
  return (
    <Reveal className="mt-10">
      <div className="relative overflow-hidden rounded-2xl border border-accent-cyan/25 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent-cyan/10 blur-3xl" />
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-accent-cyan">Central question</div>
        <p className="ops-body mt-4 max-w-3xl text-[20px] leading-[1.5] text-white sm:text-[22px]">
          Once the market portfolio is our benchmark, how strongly does an individual asset
          participate in market movements?
        </p>
      </div>
    </Reveal>
  );
}

function BetaScatterSlope() {
  const beta = 1.5;
  const W = 360;
  const H = 300;
  const padL = 44;
  const padR = 16;
  const padT = 16;
  const padB = 42;
  const xMin = -0.3;
  const xMax = 0.3;
  const yMin = -0.5;
  const yMax = 0.5;
  const sx = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * (W - padL - padR);
  const sy = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * (H - padT - padB);

  let seed = 23;
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 24; i++) {
    const xm = gauss() * 0.1;
    const eps = gauss() * 0.1;
    pts.push({ x: xm, y: beta * xm + eps });
  }
  const xTicks = [-0.2, -0.1, 0, 0.1, 0.2];
  const yTicks = [-0.4, -0.2, 0, 0.2, 0.4];

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[320px]" role="img" aria-label="Scatter of market excess return versus asset excess return with a fitted line of slope 1.5 and visible residuals">
        {xTicks.map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} x2={sx(t)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.06)" />
            <text x={sx(t)} y={H - padB + 18} fill="rgba(148,163,184,0.85)" fontSize="12" fontFamily="monospace" textAnchor="middle">{(t * 100).toFixed(0)}%</text>
          </g>
        ))}
        {yTicks.map((t) => (
          <g key={`y${t}`}>
            <line x1={padL} x2={W - padR} y1={sy(t)} y2={sy(t)} stroke="rgba(255,255,255,0.06)" />
            <text x={padL - 8} y={sy(t) + 4} fill="rgba(148,163,184,0.85)" fontSize="12" fontFamily="monospace" textAnchor="end">{(t * 100).toFixed(0)}%</text>
          </g>
        ))}
        <line x1={sx(0)} x2={sx(0)} y1={padT} y2={H - padB} stroke="rgba(255,255,255,0.25)" />
        <line x1={padL} x2={W - padR} y1={sy(0)} y2={sy(0)} stroke="rgba(255,255,255,0.25)" />

        <line x1={sx(xMin)} y1={sy(beta * xMin)} x2={sx(xMax)} y2={sy(beta * xMax)} stroke="rgba(34,211,238,0.9)" strokeWidth={2.5} />

        {pts.map((p, i) => (
          <g key={i}>
            <line x1={sx(p.x)} y1={sy(beta * p.x)} x2={sx(p.x)} y2={sy(p.y)} stroke="rgba(251,191,36,0.3)" strokeWidth={1} />
            <circle cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill="rgba(34,211,238,0.85)" />
          </g>
        ))}

        <text x={(padL + W - padR) / 2} y={H - 6} fill="rgba(148,163,184,0.9)" fontSize="13" textAnchor="middle">Market excess return</text>
        <text x={14} y={(padT + H - padB) / 2} fill="rgba(148,163,184,0.9)" fontSize="13" textAnchor="middle" transform={`rotate(-90 14 ${(padT + H - padB) / 2})`}>Asset excess return</text>
      </svg>
      <p className="mt-1 text-center text-[14px] text-slate-500">
        Fitted line slope = β ≈ 1.5. Amber dashes are residuals (firm-specific scatter).
      </p>
    </div>
  );
}

function BetaInterpretationGrid() {
  const rows: { range: string; meaning: string; tone: "green" | "cyan" | "red" | "amber" | "purple" }[] = [
    { range: String.raw`\beta = 1`, meaning: "Market-like systematic exposure. Does not necessarily mean the asset has the same total volatility as the market.", tone: "cyan" },
    { range: String.raw`0 < \beta < 1`, meaning: "Positive but lower market exposure. Tends to participate less strongly in both market gains and losses.", tone: "green" },
    { range: String.raw`\beta > 1`, meaning: "Greater market exposure. Tends to participate more strongly in both market gains and losses.", tone: "red" },
    { range: String.raw`\beta = 0`, meaning: "No consistent linear exposure to market movements. May still have substantial company-specific volatility — not equivalent to a risk-free asset.", tone: "amber" },
    { range: String.raw`\beta < 0`, meaning: "Tends to move opposite the market; may provide hedging value. Introduced briefly — not the focus here.", tone: "purple" },
  ];
  const toneCls: Record<string, string> = {
    green: "border-accent-green/30 bg-accent-green/[0.05]",
    cyan: "border-accent-cyan/30 bg-accent-cyan/[0.05]",
    red: "border-accent-red/30 bg-accent-red/[0.05]",
    amber: "border-accent-amber/30 bg-accent-amber/[0.05]",
    purple: "border-accent-purple/30 bg-accent-purple/[0.05]",
  };
  const textCls: Record<string, string> = {
    green: "text-accent-green",
    cyan: "text-accent-cyan",
    red: "text-accent-red",
    amber: "text-accent-amber",
    purple: "text-accent-purple",
  };
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.range} className={cn("flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center", toneCls[r.tone])}>
          <div className={cn("min-w-[120px] font-mono text-[16px]", textCls[r.tone])}>
            <BlockMath>{r.range}</BlockMath>
          </div>
          <p className="text-[16px] leading-[1.6] text-slate-200">{r.meaning}</p>
        </div>
      ))}
    </div>
  );
}

function PracticalPayoffTable() {
  const rows = [
    { label: "Defensive", beta: 0.5, tone: "green" as const },
    { label: "Market-like", beta: 1.0, tone: "cyan" as const },
    { label: "Aggressive", beta: 1.5, tone: "red" as const },
  ];
  const toneText: Record<string, string> = { green: "text-accent-green", cyan: "text-accent-cyan", red: "text-accent-red" };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] border-collapse text-[16px]">
        <thead>
          <tr className="border-b border-white/20 text-left">
            <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Portfolio</th>
            <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">β_P</th>
            <th className="py-3 pr-6 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-green">+8% market</th>
            <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-accent-red">−8% market</th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums text-slate-100">
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-white/5">
              <td className="py-3 pr-6">{r.label}</td>
              <td className={cn("py-3 pr-6", toneText[r.tone])}>{r.beta.toFixed(1)}</td>
              <td className="py-3 pr-6 text-accent-green">+{(r.beta * 8).toFixed(0)}%</td>
              <td className="py-3 text-accent-red">{(r.beta * -8).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default function Lesson7_2() {
  const report = useReportCAPMComplete("capm-beta-market-risk");

  return (
    <CAPMLayout>
      <PVHero
        index="7.2"
        eyebrow="Lesson 7.2 · Module 7 — The CAPM and APT"
        heading="Beta: How Much Market Risk Does an Asset Add?"
        subheading="With the market portfolio as our benchmark, beta measures how strongly an individual asset participates in market movements — and why that is not the same as total volatility."
        bullets={[
          "Beta = Cov(R_i, R_M) / Var(R_M)",
          "Market-related vs company-specific movement",
          "β amplifies market moves in both directions",
          "Beta is not total volatility",
          "Portfolio beta is a weighted average",
        ]}
        primaryLabel="Start"
      />

      <CentralQuestion />

      {/* ===================== SECTION 1 — THE QUESTION CHANGES ===================== */}
      <ConceptSection
        index="7.2.1"
        eyebrow="Section 1 · The question changes"
        title="From 'how much does it fluctuate' to 'how does it move with the market'"
        intro={<>From Lesson 7.1 we have <InlineMath>{String.raw`T = M`}</InlineMath>. The investor is assumed to hold a broadly diversified market portfolio. When a new stock is introduced, the relevant question changes.</>}
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-slate-400">Standalone question</div>
              <p className="mt-3 text-[18px] leading-[1.5] text-white">How much does this stock fluctuate?</p>
              <p className="mt-2 text-[15px] leading-[1.6] text-slate-400">Asked in isolation — the stock by itself.</p>
            </div>
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Portfolio question</div>
              <p className="mt-3 text-[18px] leading-[1.5] text-white">How does this stock behave relative to the market portfolio I already hold?</p>
              <p className="mt-2 text-[15px] leading-[1.6] text-slate-400">Asked inside the portfolio — relative to existing holdings.</p>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Why CAPM uses the second question">
            CAPM is concerned with the portfolio question because portfolio risk depends on how an
            asset moves with the investor&apos;s existing holdings, not on how much it moves on its own.
          </DefinitionCard>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 2 — TWO SOURCES OF MOVEMENT ===================== */}
      <ConceptSection
        index="7.2.2"
        eyebrow="Section 2 · Two sources of stock movement"
        title="Market-related plus company-specific"
        intro="A stock's total movement has two sources. One is shared with the whole market; the other is specific to the company."
      >
        <Reveal>
          <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
            <BlockMath>{String.raw`\text{total stock movement} = \text{market-related movement} + \text{company-specific movement}`}</BlockMath>
          </div>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Market-related events</div>
              <ul className="mt-3 space-y-2">
                {[
                  "Broad recession expectations",
                  "Market-wide changes in risk appetite",
                  "Broad interest-rate shocks",
                  "Economy-wide earnings revisions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[16px] leading-[1.6] text-slate-200">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">Company-specific events</div>
              <ul className="mt-3 space-y-2">
                {[
                  "Product failure",
                  "Factory shutdown",
                  "Management resignation",
                  "Company-specific lawsuit",
                  "Individual competitor action",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[16px] leading-[1.6] text-slate-200">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <Feedback status="info">
            Company-specific risks can partially offset across many holdings. Market-wide risks
            affect many holdings simultaneously. Broad diversification reduces idiosyncratic risk
            but cannot eliminate common market risk — the lesson of Module 5 and Lesson 6.3.
          </Feedback>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required conclusion</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Investors are not expected to receive additional return merely for bearing
              company-specific risk that could have been diversified away.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 3 — BETA DEFINITION ===================== */}
      <ConceptSection
        index="7.2.3"
        eyebrow="Section 3 · Beta definition"
        title="Covariance with the market, scaled by the market's variance"
        intro="Beta measures how strongly an asset tends to respond to market movements, on average — relative to the market portfolio."
      >
        <Reveal>
          <FormulaExplainer
            label="Beta"
            formula={String.raw`\beta_i = \frac{\operatorname{Cov}(R_i, R_M)}{\operatorname{Var}(R_M)}`}
            meaning="Beta is the covariance of the asset's return with the market's return, divided by the market's own variance."
            variables={[
              { symbol: String.raw`\operatorname{Cov}(R_i, R_M)`, description: "Numerator: how strongly does the asset tend to move with the market?" },
              { symbol: String.raw`\operatorname{Var}(R_M)`, description: "Denominator: how much does the market itself vary?" },
            ]}
            interpretation="Beta measures the amount of market-related exposure an asset carries relative to the market portfolio — equivalently, how strongly an asset tends to respond to market movements, on average."
          />
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-red">What beta is NOT</div>
            <ul className="mt-3 space-y-2">
              {[
                "It is not the ratio of two standard deviations.",
                "It is not total risk.",
                "It is not a guaranteed movement multiplier.",
                "It is not a measure of investment quality.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[16px] leading-[1.6] text-slate-200">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 4 — BETA AS A SLOPE ===================== */}
      <ConceptSection
        index="7.2.4"
        eyebrow="Section 4 · Beta as a slope"
        title="The slope of the market relationship"
        intro="Plot market excess return against asset excess return, one point per period. Beta is the slope of the fitted line. Observations do not fall exactly on it — company-specific events create the scatter."
      >
        <Reveal>
          <BetaScatterSlope />
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Interpreting β = 1.5</div>
            <p className="mt-3 text-[17px] leading-[1.65] text-slate-200">
              When the market excess return changes by 1 percentage point, the asset&apos;s excess return{" "}
              <em className="text-slate-100">tends to</em> change by{" "}
              <em className="text-slate-100">approximately</em> 1.5 percentage points in the same
              direction, <em className="text-slate-100">on average</em>.
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-accent-amber/90">
              The stock will <strong>not</strong> always move exactly 1.5 times the market. The
              words &ldquo;tends to,&rdquo; &ldquo;approximately,&rdquo; and &ldquo;on average&rdquo; matter.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <p className="max-w-3xl text-[15px] leading-[1.6] text-slate-400">
            Formal regression estimation, alpha, standard errors, and{" "}
            <InlineMath>{String.raw`R^2`}</InlineMath> belong in later lessons. This section
            establishes only the slope intuition.
          </p>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 5 — INTERPRETING BETA VALUES ===================== */}
      <ConceptSection
        index="7.2.5"
        eyebrow="Section 5 · Interpreting beta values"
        title="What each beta range means"
        intro="Use one consistent interpretation across the full range of beta values."
      >
        <Reveal>
          <BetaInterpretationGrid />
        </Reveal>
      </ConceptSection>

      {/* ===================== INTERACTION 1 — BETA RESPONSE LAB ===================== */}
      <ConceptSection
        index="7.2.6"
        eyebrow="Interaction · Beta response lab"
        title="Predict, then watch beta work"
        intro="Three portfolios — defensive (β = 0.5), market-like (β = 1.0), aggressive (β = 1.5). First predict how each responds, then visualize positive and negative market scenarios."
      >
        <Reveal>
          <InteractiveFrame>
            <BetaResponseLab />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 6 — PRACTICAL PAYOFF ===================== */}
      <ConceptSection
        index="7.2.7"
        eyebrow="Section 6 · The practical payoff of beta"
        title="How beta translates market moves into portfolio moves"
        intro="Use the simplified market-response relationship to see exactly what beta does — in both positive and negative markets."
      >
        <Reveal>
          <div className="max-w-2xl">
            <BlockMath>{String.raw`\text{market-related excess return} \approx \beta_P\,(R_M - R_f)`}</BlockMath>
          </div>
        </Reveal>
        <Reveal>
          <PracticalPayoffTable />
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { beta: 0.5, expr: String.raw`0.5(8\%) = 4\%` },
              { beta: 1.0, expr: String.raw`1.0(8\%) = 8\%` },
              { beta: 1.5, expr: String.raw`1.5(8\%) = 12\%` },
            ].map((r) => (
              <div key={r.beta} className="rounded-xl border border-accent-green/25 bg-accent-green/[0.05] p-4 text-center">
                <BlockMath>{r.expr}</BlockMath>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { beta: 0.5, expr: String.raw`0.5(-8\%) = -4\%` },
              { beta: 1.0, expr: String.raw`1.0(-8\%) = -8\%` },
              { beta: 1.5, expr: String.raw`1.5(-8\%) = -12\%` },
            ].map((r) => (
              <div key={r.beta} className="rounded-xl border border-accent-red/25 bg-accent-red/[0.05] p-4 text-center">
                <BlockMath>{r.expr}</BlockMath>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <DefinitionCard term="The asymmetry beta captures">
            A higher-beta portfolio tends to benefit more when the market performs strongly, but it
            also tends to lose more when the market performs poorly. Beta measures how aggressively
            a portfolio participates in broad market movements.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-amber/25 bg-accent-amber/[0.05] p-6">
            <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-amber">Important qualification</div>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-200">
              Do not equate a positive market return with an economic expansion. Use &ldquo;when the
              market&apos;s excess return is positive,&rdquo; not &ldquo;during every economic expansion.&rdquo; Stock
              markets reflect expectations and may rise or fall differently from current GDP or
              business-cycle conditions.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 7 — HIGHER BETA NOT BETTER ===================== */}
      <ConceptSection
        index="7.2.8"
        eyebrow="Section 7 · Higher beta is not automatically better"
        title="More exposure, not more quality"
        intro="State the conclusion explicitly: higher beta is not a virtue."
      >
        <Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-accent-red/25 bg-accent-red/[0.05] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-red">A higher beta does NOT mean</div>
              <ul className="mt-3 space-y-2">
                {[
                  "a better company",
                  "a better investment",
                  "superior management",
                  "guaranteed outperformance",
                  "higher risk-adjusted performance",
                  "undervaluation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[16px] leading-[1.6] text-slate-200">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-6">
              <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">It DOES mean</div>
              <ul className="mt-3 space-y-2">
                {[
                  "greater exposure to broad market movements",
                  "more upside participation when the market rises",
                  "more downside participation when the market falls",
                  "a higher required expected return under CAPM",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[16px] leading-[1.6] text-slate-200">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal>
          <div className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.06] p-6">
            <p className="text-[18px] leading-[1.5] text-white">Required conclusion</p>
            <p className="mt-2 text-[16px] leading-[1.65] text-slate-200">
              Investors should not seek the highest beta. They should select an amount of
              systematic exposure consistent with their objectives and ability to tolerate market
              losses.
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-slate-400">
              Preview: CAPM will next determine how much expected return investors require for each
              level of beta.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 8 — BETA VS VOLATILITY ===================== */}
      <ConceptSection
        index="7.2.9"
        eyebrow="Section 8 · Beta versus volatility"
        title="Same total volatility, different beta"
        intro="Two assets can swing by the same total amount but differ in how much of that swing comes from the market."
      >
        <Reveal>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-[16px]">
              <thead>
                <tr className="border-b border-white/20 text-left">
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Asset</th>
                  <th className="py-3 pr-8 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Standard deviation</th>
                  <th className="py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-slate-400">Beta</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums text-slate-100">
                <tr className="border-b border-white/5"><td className="py-3 pr-8">Asset A</td><td className="py-3 pr-8">30%</td><td className="py-3 text-accent-cyan">1.4</td></tr>
                <tr><td className="py-3 pr-8">Asset B</td><td className="py-3 pr-8">30%</td><td className="py-3 text-accent-purple">0.4</td></tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Reveal>
          <ul className="space-y-2.5">
            {[
              "Both experience similarly sized total return swings.",
              "Asset A's movements are more closely connected to the market.",
              "Asset B's movements are more heavily company-specific.",
              "Asset A adds more systematic exposure to a diversified portfolio.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" aria-hidden />
                <span className="text-[17px] leading-[1.6] text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal>
          <DefinitionCard term="Standard deviation vs beta">
            Standard deviation measures the typical size of an asset&apos;s total return swings around
            its average. Beta measures the portion of exposure connected to market movements.
          </DefinitionCard>
        </Reveal>
        <Reveal>
          <div className="max-w-2xl">
            <BlockMath>{String.raw`\sigma_A = \sigma_B \;\not\Rightarrow\; \beta_A = \beta_B`}</BlockMath>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== INTERACTION 2 — VOLATILITY VS BETA ===================== */}
      <ConceptSection
        index="7.2.10"
        eyebrow="Interaction · Same volatility, different beta"
        title="See the source of the swings"
        intro="Two scatterplots, identical standard deviation, very different relationships with the market. The fitted line is the market component; the scatter is the firm-specific component."
      >
        <Reveal>
          <InteractiveFrame>
            <VolatilityBetaComparison />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 9 — NUMERICAL BETA CALCULATION ===================== */}
      <ConceptSection
        index="7.2.11"
        eyebrow="Section 9 · Numerical beta calculation"
        title="Compute beta from covariance and market variance"
        intro="Given the covariance of an asset with the market and the market's variance, beta is a single division. You are not asked to compute covariance from a raw return table here."
      >
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check beta calculation"
              retryLabel="Clear wrong answers"
              groups={[
                {
                  heading: "Beta from Cov and Var",
                  hint: "β = Cov(R_i, R_M) / Var(R_M). Use Cov = 0.027 and Var(R_M) = 0.018.",
                  fields: [
                    { id: "num", label: "Numerator — Cov(R_i, R_M)", answer: 0.027, tolerance: 0.0005, decimals: 3, hints: ["Given.", "Cov = 0.027."], solution: "Cov(R_i, R_M) = 0.027." },
                    { id: "den", label: "Denominator — Var(R_M)", answer: 0.018, tolerance: 0.0005, decimals: 3, hints: ["Given.", "Var(R_M) = 0.018."], solution: "Var(R_M) = 0.018." },
                    { id: "beta", label: "β_i = Cov / Var", answer: 1.5, tolerance: 0.02, decimals: 2, hints: ["0.027 / 0.018.", "= 1.5."], solution: "0.027 / 0.018 = 1.50." },
                  ],
                },
              ]}
              interpretation={
                <span>
                  The asset carries approximately 1.5 times the market exposure of the market
                  portfolio — it tends to respond more strongly to market movements, on average.
                </span>
              }
              interpretationTone="correct"
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== SECTION 10 — PORTFOLIO BETA ===================== */}
      <ConceptSection
        index="7.2.12"
        eyebrow="Section 10 · Portfolio beta"
        title="Beta of a portfolio is a weighted average"
        intro="Portfolio beta is linear in the portfolio weights — the weighted average of the individual betas."
      >
        <Reveal>
          <FormulaExplainer
            label="Portfolio beta"
            formula={String.raw`\beta_P = \sum_{i=1}^{n} w_i\,\beta_i`}
            meaning="Multiply each asset's beta by its portfolio weight and sum. Because the relationship is linear, mixing assets scales their market exposure proportionally."
            variables={[
              { symbol: String.raw`w_i`, description: "Weight of asset i in the portfolio." },
              { symbol: String.raw`\beta_i`, description: "Beta of asset i." },
            ]}
          />
        </Reveal>
        <Reveal>
          <InteractiveFrame>
            <CalculationWorksheet
              submitLabel="Check portfolio beta"
              retryLabel="Clear wrong answers"
              groups={[
                {
                  heading: "Weighted contributions (wᵢ × βᵢ)",
                  fields: [
                    { id: "cm", label: "Broad market fund (0.50 × 1.00)", answer: 0.5, tolerance: 0.005, decimals: 3, hints: ["0.50 × 1.00.", "= 0.500."], solution: "0.50 × 1.00 = 0.500." },
                    { id: "cd", label: "Defensive asset (0.30 × 0.60)", answer: 0.18, tolerance: 0.005, decimals: 3, hints: ["0.30 × 0.60.", "= 0.180."], solution: "0.30 × 0.60 = 0.180." },
                    { id: "cc", label: "Cyclical asset (0.20 × 1.50)", answer: 0.3, tolerance: 0.005, decimals: 3, hints: ["0.20 × 1.50.", "= 0.300."], solution: "0.20 × 1.50 = 0.300." },
                  ],
                },
                {
                  heading: "Portfolio beta",
                  fields: [
                    { id: "bp", label: "β_P (sum of contributions)", answer: 0.98, tolerance: 0.005, decimals: 2, hints: ["0.500 + 0.180 + 0.300.", "= 0.98."], solution: "0.500 + 0.180 + 0.300 = 0.98." },
                  ],
                },
              ]}
              interpretation={
                <span>
                  The portfolio has approximately the same market exposure as the market portfolio
                  (β_P ≈ 0.98). This does not guarantee that its total standard deviation equals the
                  market&apos;s standard deviation.
                </span>
              }
              interpretationTone="info"
            />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== REQUIRED EXERCISE — BUILD A PORTFOLIO BETA ===================== */}
      <ConceptSection
        index="7.2.13"
        eyebrow="Exercise · Build a portfolio beta"
        title="Compute β_P, then reduce it"
        intro="First compute the portfolio beta for a 40/35/25 mix. Then adjust the weights to lower beta toward approximately 0.90 — the correct weights are not revealed live; you check after submitting."
      >
        <Reveal>
          <InteractiveFrame>
            <PortfolioBetaBuilder />
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== EXPLICIT ENDING ===================== */}
      <ConceptSection
        index="7.2.14"
        eyebrow="Explicit ending · The takeaway"
        title="Beta measures how aggressively a portfolio participates in market movements"
        intro="This conclusion must be visible before the completion gate."
        topMargin="mt-16"
      >
        <Reveal>
          <div className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/[0.08] via-white/[0.03] to-transparent p-7 sm:p-9">
            <p className="text-[20px] leading-[1.45] text-white sm:text-[22px]">
              Beta measures how aggressively a portfolio participates in market movements.
            </p>
            <div className="mt-5">
              <BlockMath>{String.raw`\text{Higher beta} \;\Rightarrow\; \begin{cases} \text{more upside participation when the market rises} \\ \text{more downside participation when the market falls} \\ \text{higher required expected return under CAPM} \end{cases}`}</BlockMath>
            </div>
            <p className="mt-5 text-[17px] leading-[1.65] text-slate-200">
              Higher expected return is compensation for bearing greater non-diversifiable market
              risk. It is not guaranteed performance and does not prove that the investment is
              superior.
            </p>
          </div>
        </Reveal>
      </ConceptSection>

      {/* ===================== FINAL CHECK ===================== */}
      <ConceptSection
        index="7.2.15"
        eyebrow="Final check · The core conclusions"
        title="Confirm what beta does and does not mean"
        intro="Five questions on beta, volatility, and market exposure."
      >
        <Reveal>
          <InteractiveFrame>
            <div className="space-y-4">
              <FinalCheckRow
                prompt="1. What does a beta of 1.5 mean?"
                options={[
                  { id: "a", label: "About 1.5 times the market's systematic exposure; responds more strongly to market moves, on average" },
                  { id: "b", label: "1.5% expected return" },
                  { id: "c", label: "Total volatility of 15%" },
                ]}
                correctId="a"
                answerLabel="~1.5× systematic exposure"
                feedback="The portfolio has approximately 1.5 times the market's systematic exposure and tends to respond more strongly to market movements, on average."
              />
              <FinalCheckRow
                prompt="2. What happens to a high-beta portfolio when the market falls sharply?"
                options={[
                  { id: "a", label: "Its market-related return tends to fall more strongly than a lower-beta portfolio" },
                  { id: "b", label: "It tends to rise" },
                  { id: "c", label: "It is unaffected" },
                ]}
                correctId="a"
                answerLabel="Falls more strongly"
                feedback="Its market-related return tends to fall more strongly than that of a lower-beta portfolio."
              />
              <FinalCheckRow
                prompt="3. Does a beta of zero mean risk-free?"
                options={[
                  { id: "a", label: "No — the asset may still have company-specific volatility" },
                  { id: "b", label: "Yes — zero beta means zero risk" },
                ]}
                correctId="a"
                answerLabel="No"
                feedback="No. The asset may still have company-specific volatility. Beta captures only the market-related component."
              />
              <FinalCheckRow
                prompt="4. Can two assets have the same standard deviation but different beta?"
                options={[
                  { id: "a", label: "Yes — similar total swings can hide different market-related portions" },
                  { id: "b", label: "No — same σ forces same β" },
                ]}
                correctId="a"
                answerLabel="Yes"
                feedback="Yes. Their total return swings may be similar even though different portions are connected to market movements."
              />
              <FinalCheckRow
                prompt="5. Is higher beta automatically better?"
                options={[
                  { id: "a", label: "No — it is greater systematic exposure and greater expected compensation for risk, not guaranteed superiority" },
                  { id: "b", label: "Yes — high-beta always outperforms" },
                ]}
                correctId="a"
                answerLabel="No"
                feedback="No. It represents greater systematic exposure and greater expected compensation for risk, not guaranteed superior performance."
              />
            </div>
          </InteractiveFrame>
        </Reveal>
      </ConceptSection>

      {/* ===================== TRANSITION TO 7.3 ===================== */}
      <ConceptSection
        index="7.2.16"
        eyebrow="Transition · Toward the Security Market Line"
        title="Beta measures risk — but not yet the return required for that risk"
        intro="Beta tells us how much market risk an asset carries. It does not yet tell us how much expected return investors should require for carrying that exposure."
        topMargin="mt-12"
      >
        <Reveal>
          <Panel>
            <p className="text-[17px] leading-[1.7] text-slate-200">
              The next step — the Security Market Line — links beta to required expected return:
            </p>
            <div className="mt-4 max-w-xl">
              <BlockMath>{String.raw`E[R_i] = R_f + \beta_i\,\bigl(E[R_M] - R_f\bigr)`}</BlockMath>
            </div>
            <p className="mt-3 text-[16px] leading-[1.65] text-slate-400">
              We preview the relationship here but do not yet fully teach the Security Market Line —
              that is Lesson 7.3.
            </p>
          </Panel>
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
        <CAPMSourcePanel />
      </Reveal>
    </CAPMLayout>
  );
}
