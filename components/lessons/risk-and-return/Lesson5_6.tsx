"use client";

import { useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Reveal,
  SectionHeading,
  Panel,
  Feedback,
  InteractiveFrame,
  TryItTag,
  DefinitionCard,
  FormulaExplainer,
  type MasteryQuestion,
  LessonSummary,
  MasteryCheck,
} from "./shared";
import { AnswerInput } from "./AnswerInput";
import RRLayout from "./RRLayout";
import RRSourcePanel from "./RRSourcePanel";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import ExpandableQA from "@/components/lessons/equities/ExpandableQA";
import { useReportRRComplete } from "@/lib/rr-progress";

// ===================== Case data (fictional) =====================
// Fictional monthly returns created for the OPS Portfolio Risk Lab.
// Values are expressed in percent for display.
const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8];
const MARKET_PCT = [2.0, -1.0, 3.0, -2.0, 4.0, -3.0, 1.0, 2.0];
const ATLAS_PCT = [1.2, -0.4, 1.8, -0.8, 2.1, -1.0, 0.7, 1.1];
const NOVA_PCT = [4.0, -3.0, 6.0, -5.0, 7.0, -6.0, 2.0, 3.0];
const MERIDIAN_PCT = [2.0, 1.0, -1.0, 0.0, 3.0, -1.0, 2.0, 1.0];

const SUMMARY_POINTS = [
  "Portfolio return is a weighted average of asset returns.",
  "Portfolio volatility depends on correlations, not just individual volatilities.",
  "Beta measures market exposure; beta ≠ total risk.",
  "Lower correlation creates more diversification benefit.",
  "Portfolio A (concentrated) violates the beta ≤ 1.00 mandate.",
  "Portfolio B (diversified) satisfies the return, beta, and diversification criteria.",
  "Stress tests show both idiosyncratic and systematic risk matter.",
  "Eight observations cannot establish stable long-run parameters.",
  "A defensible recommendation requires evidence, comparison, risk analysis, and stated limitations.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "m1",
    type: "single",
    prompt: "Portfolio A beta ≈ ?",
    choices: [
      { id: "a", label: "1.54" },
      { id: "b", label: "0.96" },
      { id: "c", label: "2.00" },
    ],
    correctId: "a",
    hint: "Portfolio A is 30% Atlas (β≈0.47) and 70% Nova (β≈2.00): 0.30×0.47 + 0.70×2.00 ≈ 1.54.",
  },
  {
    id: "m2",
    type: "single",
    prompt: "Portfolio B beta ≈ ?",
    choices: [
      { id: "a", label: "0.96" },
      { id: "b", label: "1.54" },
      { id: "c", label: "0.47" },
    ],
    correctId: "a",
    hint: "Portfolio B is 35/35/30 across Atlas, Nova, Meridian: 0.35×0.47 + 0.35×2.00 + 0.30×0.32 ≈ 0.96.",
  },
  {
    id: "m3",
    type: "single",
    prompt: "Which portfolio satisfies the beta ≤ 1.00 mandate?",
    choices: [
      { id: "a", label: "Portfolio B" },
      { id: "b", label: "Portfolio A" },
      { id: "c", label: "Both" },
    ],
    correctId: "a",
    hint: "Portfolio A β ≈ 1.54 violates the limit; Portfolio B β ≈ 0.96 satisfies it.",
  },
  {
    id: "m4",
    type: "single",
    prompt: "Nova falls 40%. What is the approximate impact on Portfolio A?",
    choices: [
      { id: "a", label: "−28%" },
      { id: "b", label: "−14%" },
      { id: "c", label: "−40%" },
    ],
    correctId: "a",
    hint: "Portfolio A holds 70% in Nova: 0.70 × (−40%) = −28%.",
  },
  {
    id: "m5",
    type: "single",
    prompt: "Atlas–Nova correlation ≈ ?",
    choices: [
      { id: "a", label: "0.998" },
      { id: "b", label: "0.487" },
      { id: "c", label: "0.508" },
    ],
    correctId: "a",
    hint: "Atlas and Nova move almost perfectly together in this sample: ρ ≈ 0.998.",
  },
  {
    id: "m6",
    type: "single",
    prompt:
      "Why does Meridian provide more diversification than simply adding more Atlas?",
    choices: [
      { id: "a", label: "Lower correlation with Atlas and Nova" },
      { id: "b", label: "Higher return" },
      { id: "c", label: "Lower cost" },
    ],
    correctId: "a",
    hint: "Diversification benefit comes from low correlation, not from return or cost.",
  },
];

const COMMON_HINTS = [
  "Sum the returns and divide by 8.",
  "Use T − 1 = 7 in the denominator.",
  "Take the square root of the variance.",
];

// ===================== Shared dataset table =====================
function ReturnTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
              Month
            </th>
            <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-300">
              Market
            </th>
            <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-cyan">
              Atlas
            </th>
            <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-purple">
              Nova
            </th>
            <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-green">
              Meridian
            </th>
          </tr>
        </thead>
        <tbody className="font-mono text-[14px] text-slate-200">
          {MONTHS.map((m, i) => (
            <tr key={m} className="border-b border-white/[0.06]">
              <td className="px-4 py-2.5 text-slate-400">{m}</td>
              <td className="px-4 py-2.5">{MARKET_PCT[i].toFixed(1)}</td>
              <td className="px-4 py-2.5 text-accent-cyan/90">
                {ATLAS_PCT[i].toFixed(1)}
              </td>
              <td className="px-4 py-2.5 text-accent-purple/90">
                {NOVA_PCT[i].toFixed(1)}
              </td>
              <td className="px-4 py-2.5 text-accent-green/90">
                {MERIDIAN_PCT[i].toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===================== Choice question (button-based) =====================
function ChoiceQuestion({
  prompt,
  choices,
  correctId,
  onResolvedChange,
  explain,
}: {
  prompt: ReactNode;
  choices: { id: string; label: string }[];
  correctId: string;
  onResolvedChange?: (resolved: boolean) => void;
  explain?: ReactNode;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const resolved = picked === correctId;

  const pick = (id: string) => {
    setPicked(id);
    onResolvedChange?.(id === correctId);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <p className="ops-body-strong text-[15px] leading-7 text-slate-100">
        {prompt}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {choices.map((c) => {
          const isPicked = picked === c.id;
          const isCorrect = c.id === correctId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => pick(c.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                !isPicked &&
                  "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan",
                isPicked &&
                  isCorrect &&
                  "border-accent-green bg-accent-green/15 text-accent-green",
                isPicked &&
                  !isCorrect &&
                  "border-accent-red bg-accent-red/15 text-accent-red",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>
      {picked && (
        <Feedback status={resolved ? "correct" : "incorrect"}>
          {resolved ? (
            <span>{explain ?? "Correct."}</span>
          ) : (
            <span>Not quite — try another option.</span>
          )}
        </Feedback>
      )}
    </div>
  );
}

// ===================== Continue button =====================
function ContinueButton({
  enabled = true,
  label,
  onClick,
}: {
  enabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      className={cn(
        "mt-2 rounded-full border px-5 py-2.5 text-[14px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
        enabled
          ? "border-accent-cyan bg-accent-cyan text-ink-950 hover:bg-accent-cyan/90"
          : "cursor-not-allowed border-white/10 text-slate-500 opacity-60",
      )}
    >
      {label}
    </button>
  );
}

function RoundTag({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <TryItTag />
      <span className="ops-caption text-[11px] text-slate-400">
        Round {n} · {label}
      </span>
    </div>
  );
}

// ===================== ROUND 1 — Data Inspection =====================
function Round1DataInspection({ onComplete }: { onComplete: () => void }) {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const allResolved =
    resolved["q1"] && resolved["q2"] && resolved["q3"] && resolved["q4"];

  return (
    <InteractiveFrame>
      <RoundTag n={1} label="Data Inspection" />
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Before computing anything, inspect the fictional return table. Form a
        visual hypothesis — then confirm or reject it with numbers in later
        rounds.
      </p>
      <div className="mt-5">
        <ReturnTable />
        <p className="ops-muted mt-2 text-[12px]">
          Fictional monthly returns created for the OPS Portfolio Risk Lab.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <ChoiceQuestion
          prompt="Which stock has the largest apparent swings?"
          choices={[
            { id: "atlas", label: "Atlas" },
            { id: "nova", label: "Nova" },
            { id: "meridian", label: "Meridian" },
          ]}
          correctId="nova"
          explain="Nova Technology fluctuates the most month to month — it spans from −6.0% to +7.0%."
          onResolvedChange={(v) => setResolved((p) => ({ ...p, q1: v }))}
        />
        <ChoiceQuestion
          prompt="Which pair appears to move together most closely?"
          choices={[
            { id: "an", label: "Atlas and Nova" },
            { id: "am", label: "Atlas and Meridian" },
            { id: "nm", label: "Nova and Meridian" },
          ]}
          correctId="an"
          explain="Atlas and Nova rise and fall together in nearly every month."
          onResolvedChange={(v) => setResolved((p) => ({ ...p, q2: v }))}
        />
        <ChoiceQuestion
          prompt="Which stock appears most different from the other two?"
          choices={[
            { id: "atlas", label: "Atlas" },
            { id: "nova", label: "Nova" },
            { id: "meridian", label: "Meridian" },
          ]}
          correctId="meridian"
          explain="Meridian often moves in the opposite direction to Atlas and Nova — a hint of low correlation."
          onResolvedChange={(v) => setResolved((p) => ({ ...p, q3: v }))}
        />
        <ChoiceQuestion
          prompt="Why are visual impressions insufficient?"
          choices={[
            {
              id: "precise",
              label:
                "Cannot precisely determine averages, volatility, correlation, or beta",
            },
            { id: "small", label: "The table is too small to read" },
            { id: "colors", label: "The colors are misleading" },
          ]}
          correctId="precise"
          explain="Eyeballing cannot quantify means, standard deviations, correlations, or betas — those require calculation."
          onResolvedChange={(v) => setResolved((p) => ({ ...p, q4: v }))}
        />
      </div>

      <ContinueButton
        enabled={allResolved}
        label="Continue to Round 2"
        onClick={onComplete}
      />
      {!allResolved && (
        <p className="ops-muted mt-2 text-[12px]">
          Answer all four questions to continue.
        </p>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 2 — Return and Volatility =====================
function Round2ReturnVol({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <InteractiveFrame>
      <RoundTag n={2} label="Return and Volatility" />
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Compute the arithmetic mean and sample standard deviation (T − 1 = 7 in
        the denominator) for each stock. Use percent values exactly as shown in
        the table.
      </p>

      <div className="mt-5">
        <FormulaExplainer
          tone="amber"
          label="Arithmetic mean and sample standard deviation"
          formula={String.raw`\bar{R} = \frac{1}{T}\sum_{t=1}^{T} R_t, \qquad s = \sqrt{\frac{1}{T-1}\sum_{t=1}^{T}(R_t - \bar{R})^2}`}
          meaning="The arithmetic mean is the simple average of returns. The sample standard deviation uses T − 1 to remain an unbiased estimator of volatility."
          variables={[
            {
              symbol: String.raw`R_t`,
              description: "Return in month t (in percent).",
            },
            {
              symbol: String.raw`T`,
              description: "Number of observations (here 8).",
            },
            {
              symbol: String.raw`\bar{R}`,
              description: "Arithmetic mean monthly return.",
            },
            {
              symbol: String.raw`s`,
              description: "Sample standard deviation of returns.",
            },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Atlas arithmetic mean (%)"
          answer={0.5875}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={COMMON_HINTS}
          solution={<span>Mean = sum of returns / 8 = 0.5875%</span>}
        />
        <AnswerInput
          label="Atlas sample standard deviation (%)"
          answer={1.185}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={COMMON_HINTS}
          solution={<span>SD = √(variance with T−1=7) ≈ 1.1850%</span>}
        />
        <AnswerInput
          label="Nova arithmetic mean (%)"
          answer={1.0}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={COMMON_HINTS}
          solution={<span>Mean = sum of returns / 8 = 1.0000%</span>}
        />
        <AnswerInput
          label="Nova sample standard deviation (%)"
          answer={5.0143}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={COMMON_HINTS}
          solution={<span>SD ≈ 5.0143% — by far the most volatile stock.</span>}
        />
        <AnswerInput
          label="Meridian arithmetic mean (%)"
          answer={0.875}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={COMMON_HINTS}
          solution={<span>Mean = sum of returns / 8 = 0.8750%</span>}
        />
        <AnswerInput
          label="Meridian sample standard deviation (%)"
          answer={1.4577}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={COMMON_HINTS}
          solution={<span>SD ≈ 1.4577%.</span>}
        />
      </div>

      <ContinueButton
        label="Continue to Round 3"
        onClick={() => {
          setRevealed(true);
          onComplete();
        }}
      />
      {!revealed && (
        <p className="ops-muted mt-2 text-[12px]">
          Check all six values, then continue.
        </p>
      )}

      {revealed && (
        <div className="mt-5 space-y-3">
          <Feedback status="info">
            Nova has both the highest arithmetic return (1.00%) and the highest
            volatility (≈ 5.01%). Atlas is the calmest (≈ 1.19%). Because
            volatility compounds asymmetrically, Nova’s geometric (compound)
            return sits well below its arithmetic return — this gap is
            <strong className="text-white"> volatility drag</strong>.
          </Feedback>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 3 — Covariance and Correlation =====================
function Round3Correlation({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <InteractiveFrame>
      <RoundTag n={3} label="Covariance and Correlation" />
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Correlation standardizes covariance to the range [−1, +1]. It tells you
        how strongly two assets move together — the key input for
        diversification.
      </p>
      <div className="mt-5">
        <FormulaExplainer
          tone="purple"
          label="Correlation coefficient"
          formula={String.raw`\rho_{ij} = \frac{\sigma_{ij}}{\sigma_i\,\sigma_j}`}
          meaning="Correlation divides covariance by the product of the two standard deviations, producing a unit-free measure between −1 and +1."
          variables={[
            {
              symbol: String.raw`\sigma_{ij}`,
              description: "Covariance between asset i and j.",
            },
            {
              symbol: String.raw`\sigma_i,\,\sigma_j`,
              description: "Standard deviations of assets i and j.",
            },
            {
              symbol: String.raw`\rho_{ij}`,
              description: "Correlation between the two assets.",
            },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Atlas–Nova correlation"
          answer={0.9978}
          tolerance={0.02}
          decimals={4}
          hints={[
            "Check whether deviations share the same sign each month.",
            "Standardize covariance by both standard deviations.",
            "Values near +1 mean the pair moves almost in lockstep.",
          ]}
          solution={<span>ρ(Atlas, Nova) ≈ 0.9978.</span>}
        />
        <AnswerInput
          label="Atlas–Meridian correlation"
          answer={0.4869}
          tolerance={0.02}
          decimals={4}
          hints={[
            "Check whether deviations share the same sign each month.",
            "Standardize covariance by both standard deviations.",
          ]}
          solution={<span>ρ(Atlas, Meridian) ≈ 0.4869.</span>}
        />
        <AnswerInput
          label="Nova–Meridian correlation"
          answer={0.5081}
          tolerance={0.02}
          decimals={4}
          hints={[
            "Check whether deviations share the same sign each month.",
            "Standardize covariance by both standard deviations.",
          ]}
          solution={<span>ρ(Nova, Meridian) ≈ 0.5081.</span>}
        />
      </div>

      <ContinueButton
        label="Continue to Round 4"
        onClick={() => {
          setRevealed(true);
          onComplete();
        }}
      />
      {!revealed && (
        <p className="ops-muted mt-2 text-[12px]">
          Check all three correlations, then continue.
        </p>
      )}

      {revealed && (
        <div className="mt-5 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
                    Correlation
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-cyan">
                    Atlas
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-purple">
                    Nova
                  </th>
                  <th className="px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-accent-green">
                    Meridian
                  </th>
                </tr>
              </thead>
              <tbody className="font-mono text-[14px] text-slate-200">
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2.5 text-accent-cyan/90">Atlas</td>
                  <td className="px-4 py-2.5">1.0000</td>
                  <td className="px-4 py-2.5">0.9978</td>
                  <td className="px-4 py-2.5">0.4869</td>
                </tr>
                <tr className="border-b border-white/[0.06]">
                  <td className="px-4 py-2.5 text-accent-purple/90">Nova</td>
                  <td className="px-4 py-2.5">0.9978</td>
                  <td className="px-4 py-2.5">1.0000</td>
                  <td className="px-4 py-2.5">0.5081</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 text-accent-green/90">Meridian</td>
                  <td className="px-4 py-2.5">0.4869</td>
                  <td className="px-4 py-2.5">0.5081</td>
                  <td className="px-4 py-2.5">1.0000</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Feedback status="info">
            Atlas and Nova are almost perfectly correlated (ρ ≈ 0.998). Meridian
            has materially lower correlation with both (≈ 0.49–0.51). This is
            why Meridian provides more diversification than simply adding more
            Atlas or Nova.
          </Feedback>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 4 — Portfolio Comparison =====================
function Round4PortfolioCompare({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <InteractiveFrame>
      <RoundTag n={4} label="Portfolio Comparison" />
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Two portfolios are proposed. Portfolio A is concentrated in Nova;
        Portfolio B adds Meridian for diversification. Compute each portfolio’s
        arithmetic mean and sample standard deviation.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.06] p-5">
          <div className="ops-caption text-[11px] text-accent-red">
            Portfolio A · Concentrated
          </div>
          <p className="ops-body mt-2 text-[15px] text-slate-200">
            30% Atlas · 70% Nova · 0% Meridian
          </p>
        </div>
        <div className="rounded-xl border border-accent-green/30 bg-accent-green/[0.06] p-5">
          <div className="ops-caption text-[11px] text-accent-green">
            Portfolio B · Diversified
          </div>
          <p className="ops-body mt-2 text-[15px] text-slate-200">
            35% Atlas · 35% Nova · 30% Meridian
          </p>
        </div>
      </div>

      <div className="mt-5">
        <FormulaExplainer
          tone="cyan"
          label="Portfolio return and portfolio variance"
          formula={String.raw`\bar{R}_p = \sum_i w_i \bar{R}_i, \qquad \sigma_p^2 = \sum_i \sum_j w_i w_j \sigma_{ij}`}
          meaning="Portfolio return is a simple weighted average. Portfolio variance must account for every pairwise covariance — that is where diversification enters."
          variables={[
            {
              symbol: String.raw`w_i`,
              description: "Weight of asset i in the portfolio.",
            },
            {
              symbol: String.raw`\sigma_{ij}`,
              description: "Covariance (or variance when i = j).",
            },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Portfolio A arithmetic mean (%)"
          answer={0.8763}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={[
            "Mean of a portfolio = weighted average of asset means.",
            "Weights are 0.30 and 0.70.",
          ]}
          solution={<span>0.30×0.5875 + 0.70×1.0000 ≈ 0.8763%.</span>}
        />
        <AnswerInput
          label="Portfolio A sample standard deviation (%)"
          answer={3.8648}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={[
            "Use the full variance formula with all pairwise covariances.",
            "Atlas–Nova covariance is large and positive.",
          ]}
          solution={<span>SD ≈ 3.8648%.</span>}
        />
        <AnswerInput
          label="Portfolio B arithmetic mean (%)"
          answer={0.8181}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={[
            "Mean of a portfolio = weighted average of asset means.",
            "Weights are 0.35, 0.35, 0.30.",
          ]}
          solution={
            <span>0.35×0.5875 + 0.35×1.0000 + 0.30×0.8750 ≈ 0.8181%.</span>
          }
        />
        <AnswerInput
          label="Portfolio B sample standard deviation (%)"
          answer={2.4192}
          tolerance={0.02}
          unit="%"
          decimals={4}
          hints={[
            "Use the full variance formula with all pairwise covariances.",
            "Meridian’s lower correlations reduce total variance.",
          ]}
          solution={<span>SD ≈ 2.4192%.</span>}
        />
      </div>

      <ContinueButton
        label="Continue to Round 5"
        onClick={() => {
          setRevealed(true);
          onComplete();
        }}
      />
      {!revealed && (
        <p className="ops-muted mt-2 text-[12px]">
          Check all four portfolio values, then continue.
        </p>
      )}

      {revealed && (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="ops-caption text-[11px] text-slate-400">Return</div>
            <p className="ops-body mt-2 text-[15px] text-slate-200">
              Portfolio A{" "}
              <span className="font-mono text-accent-red">0.876%</span> vs
              Portfolio B{" "}
              <span className="font-mono text-accent-green">0.818%</span>
            </p>
            <p className="ops-muted mt-1 text-[12px]">
              A is higher by ≈ 0.058 percentage points per month — a tiny edge.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
            <div className="ops-caption text-[11px] text-slate-400">
              Volatility
            </div>
            <p className="ops-body mt-2 text-[15px] text-slate-200">
              Portfolio A{" "}
              <span className="font-mono text-accent-red">3.86%</span> vs
              Portfolio B{" "}
              <span className="font-mono text-accent-green">2.42%</span>
            </p>
            <p className="ops-muted mt-1 text-[12px]">
              B is lower by ≈ 1.45 percentage points — a material risk
              reduction.
            </p>
          </div>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 5 — Beta =====================
function Round5Beta({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <InteractiveFrame>
      <RoundTag n={5} label="Beta" />
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Beta measures an asset’s sensitivity to the market. A portfolio’s beta
        is the weighted average of its holdings’ betas.
      </p>
      <div className="mt-5">
        <FormulaExplainer
          tone="amber"
          label="Beta of an asset"
          formula={String.raw`\beta_i = \frac{\mathrm{Cov}(R_i, R_M)}{\mathrm{Var}(R_M)}, \qquad \beta_p = \sum_i w_i \beta_i`}
          meaning="Beta divides the asset–market covariance by the market variance. Portfolio beta is the weighted average of asset betas."
          variables={[
            { symbol: String.raw`R_i`, description: "Return of asset i." },
            { symbol: String.raw`R_M`, description: "Market return." },
            {
              symbol: String.raw`\beta_i`,
              description: "Beta of asset i versus the market.",
            },
          ]}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Atlas beta vs market"
          answer={0.473}
          tolerance={0.03}
          decimals={4}
          hints={[
            "Beta = Cov(R_i, R_M) / Var(R_M).",
            "Do not divide market variance by covariance.",
          ]}
          solution={<span>β_Atlas ≈ 0.4730.</span>}
        />
        <AnswerInput
          label="Nova beta vs market"
          answer={2.0}
          tolerance={0.03}
          decimals={4}
          hints={[
            "Beta = Cov(R_i, R_M) / Var(R_M).",
            "Nova swings about twice as widely as the market.",
          ]}
          solution={<span>β_Nova ≈ 2.0000.</span>}
        />
        <AnswerInput
          label="Meridian beta vs market"
          answer={0.3161}
          tolerance={0.03}
          decimals={4}
          hints={[
            "Beta = Cov(R_i, R_M) / Var(R_M).",
            "Meridian is the least market-sensitive of the three.",
          ]}
          solution={<span>β_Meridian ≈ 0.3161.</span>}
        />
        <AnswerInput
          label="Portfolio A beta"
          answer={1.5419}
          tolerance={0.03}
          decimals={4}
          hints={[
            "Portfolio beta = weighted average of asset betas.",
            "Weights are 0.30 Atlas, 0.70 Nova.",
          ]}
          solution={<span>0.30×0.4730 + 0.70×2.0000 ≈ 1.5419.</span>}
        />
        <AnswerInput
          label="Portfolio B beta"
          answer={0.9604}
          tolerance={0.03}
          decimals={4}
          hints={[
            "Portfolio beta = weighted average of asset betas.",
            "Weights are 0.35, 0.35, 0.30 across Atlas, Nova, Meridian.",
          ]}
          solution={
            <span>0.35×0.4730 + 0.35×2.0000 + 0.30×0.3161 ≈ 0.9604.</span>
          }
        />
      </div>

      <ContinueButton
        label="Continue to Round 6"
        onClick={() => {
          setRevealed(true);
          onComplete();
        }}
      />
      {!revealed && (
        <p className="ops-muted mt-2 text-[12px]">
          Check all five beta values, then continue.
        </p>
      )}

      {revealed && (
        <div className="mt-5 space-y-3">
          <div className="rounded-xl border border-accent-red/30 bg-accent-red/[0.06] p-5">
            <div className="ops-caption text-[11px] text-accent-red">
              Mandate check · beta ≤ 1.00
            </div>
            <p className="ops-body mt-2 text-[15px] text-slate-200">
              Portfolio A beta ≈ <span className="font-mono">1.54</span> →{" "}
              <strong className="text-accent-red">VIOLATES</strong> the mandate.
            </p>
            <p className="ops-body mt-1 text-[15px] text-slate-200">
              Portfolio B beta ≈ <span className="font-mono">0.96</span> →{" "}
              <strong className="text-accent-green">SATISFIES</strong> the
              mandate.
            </p>
          </div>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 6 — Stress Tests =====================
function Round6Stress({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <InteractiveFrame>
      <RoundTag n={6} label="Stress Tests" />
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Stress tests translate risk metrics into dollar-style impact. Scenario A
        isolates company-specific (idiosyncratic) risk. Scenario B applies a
        market (systematic) shock through portfolio beta.
      </p>

      <div className="mt-5 rounded-xl border border-accent-amber/30 bg-accent-amber/[0.06] p-5">
        <div className="ops-caption text-[11px] text-accent-amber">
          Scenario A · Nova product failure (idiosyncratic)
        </div>
        <p className="ops-body mt-2 text-[15px] text-slate-200">
          Nova falls 40%. Atlas and Meridian are unchanged. Compute the impact
          on each portfolio from the Nova weight alone.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnswerInput
            label="Portfolio A impact (%)"
            answer={-28.0}
            tolerance={0.5}
            unit="%"
            decimals={2}
            hints={[
              "Only Nova moves — weight × Nova’s move.",
              "Portfolio A holds 70% in Nova.",
            ]}
            solution={<span>0.70 × (−40%) = −28.0%.</span>}
          />
          <AnswerInput
            label="Portfolio B impact (%)"
            answer={-14.0}
            tolerance={0.5}
            unit="%"
            decimals={2}
            hints={[
              "Only Nova moves — weight × Nova’s move.",
              "Portfolio B holds 35% in Nova.",
            ]}
            solution={<span>0.35 × (−40%) = −14.0%.</span>}
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-accent-red/30 bg-accent-red/[0.06] p-5">
        <div className="ops-caption text-[11px] text-accent-red">
          Scenario B · Market recession shock (systematic)
        </div>
        <p className="ops-body mt-2 text-[15px] text-slate-200">
          Unexpected market return = −15%. Apply each portfolio’s beta to
          estimate the market-related component of the return.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <AnswerInput
            label="Portfolio A market-related return (%)"
            answer={-23.13}
            tolerance={0.5}
            unit="%"
            decimals={2}
            hints={[
              "Market-related component ≈ β × market shock.",
              "Portfolio A beta ≈ 1.5419.",
            ]}
            solution={<span>1.5419 × (−15%) ≈ −23.13%.</span>}
          />
          <AnswerInput
            label="Portfolio B market-related return (%)"
            answer={-14.41}
            tolerance={0.5}
            unit="%"
            decimals={2}
            hints={[
              "Market-related component ≈ β × market shock.",
              "Portfolio B beta ≈ 0.9604.",
            ]}
            solution={<span>0.9604 × (−15%) ≈ −14.41%.</span>}
          />
        </div>
      </div>

      <ContinueButton
        label="Continue to Round 7"
        onClick={() => {
          setRevealed(true);
          onComplete();
        }}
      />

      {revealed && (
        <div className="mt-5">
          <Feedback status="info">
            These are estimated market-related components, not guaranteed
            complete returns. Actual outcomes can differ — betas and
            correlations are estimated, and idiosyncratic shocks can layer on
            top of systematic ones.
          </Feedback>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 7 — Empirical Evidence Review =====================
const EVIDENCE_PAIRS = [
  {
    id: "e1",
    evidence:
      "Individual stock volatility is far larger than index volatility.",
    choices: [
      "Diversification removes idiosyncratic risk",
      "Common market exposure remains",
      "Estimates may be unstable",
    ],
    correct: "Diversification removes idiosyncratic risk",
  },
  {
    id: "e2",
    evidence: "Stocks show same-period co-movement.",
    choices: [
      "Diversification removes idiosyncratic risk",
      "Common market exposure remains",
      "Estimates may be unstable",
    ],
    correct: "Common market exposure remains",
  },
  {
    id: "e3",
    evidence: "Rolling volatility changes sharply through time.",
    choices: [
      "Diversification removes idiosyncratic risk",
      "Common market exposure remains",
      "Estimates may be unstable",
    ],
    correct: "Estimates may be unstable",
  },
];

function Round7Evidence({ onComplete }: { onComplete: () => void }) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [obsAnswer, setObsAnswer] = useState<string | null>(null);
  const [sufficient, setSufficient] = useState<string | null>(null);

  const allPairsCorrect = EVIDENCE_PAIRS.every(
    (ep) => picks[ep.id] === ep.correct,
  );
  const obsCorrect = obsAnswer === "8";
  const suffCorrect = sufficient === "no";
  const allResolved = allPairsCorrect && obsCorrect && suffCorrect;

  return (
    <InteractiveFrame>
      <RoundTag n={7} label="Empirical Evidence Review" />
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Match each piece of empirical evidence to the conclusion it supports.
      </p>

      <div className="mt-5 space-y-3">
        {EVIDENCE_PAIRS.map((ep) => {
          const picked = picks[ep.id];
          const correct = picked === ep.correct;
          return (
            <div
              key={ep.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <p className="ops-body-strong text-[15px] leading-7 text-slate-100">
                Evidence: {ep.evidence}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ep.choices.map((c) => {
                  const isPicked = picked === c;
                  const isCorrect = c === ep.correct;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPicks((p) => ({ ...p, [ep.id]: c }))}
                      className={cn(
                        "rounded-full border px-4 py-2 text-left text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                        !isPicked &&
                          "border-white/20 text-slate-100 hover:border-accent-cyan/60 hover:text-accent-cyan",
                        isPicked &&
                          isCorrect &&
                          "border-accent-green bg-accent-green/15 text-accent-green",
                        isPicked &&
                          !isCorrect &&
                          "border-accent-red bg-accent-red/15 text-accent-red",
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              {picked && !correct && (
                <Feedback status="incorrect">Not quite — try another.</Feedback>
              )}
              {correct && <Feedback status="correct">Correct.</Feedback>}
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        <ChoiceQuestion
          prompt="How many observations are in this fictional sample?"
          choices={[
            { id: "6", label: "6" },
            { id: "8", label: "8" },
            { id: "12", label: "12" },
          ]}
          correctId="8"
          onResolvedChange={(v) => v && setObsAnswer("8")}
        />
        <ChoiceQuestion
          prompt="Is 8 months sufficient for stable long-run parameter estimates?"
          choices={[
            { id: "yes", label: "Yes" },
            { id: "no", label: "No" },
          ]}
          correctId="no"
          explain="No. Eight observations produce noisy, unstable estimates of means, volatilities, correlations, and betas."
          onResolvedChange={(v) => v && setSufficient("no")}
        />
      </div>

      <ContinueButton
        enabled={allResolved}
        label="Continue to Round 8"
        onClick={onComplete}
      />
      {!allResolved && (
        <p className="ops-muted mt-2 text-[12px]">
          Resolve every item to continue.
        </p>
      )}
    </InteractiveFrame>
  );
}

// ===================== ROUND 8 — Analyst Memo =====================
function Round8Memo({ onComplete }: { onComplete: () => void }) {
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [s3, setS3] = useState("");
  const [s4, setS4] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const sections = [
    {
      key: "s1",
      label: "Recommendation",
      ph: "Which portfolio do you recommend for Cedar Ridge, and why?",
      val: s1,
      set: setS1,
    },
    {
      key: "s2",
      label: "Evidence",
      ph: "Cite arithmetic/geometric returns, standard deviations, and correlations.",
      val: s2,
      set: setS2,
    },
    {
      key: "s3",
      label: "Risk",
      ph: "Compare betas, and discuss idiosyncratic and systematic stress results.",
      val: s3,
      set: setS3,
    },
    {
      key: "s4",
      label: "Limitations",
      ph: "List at least two limitations of this analysis.",
      val: s4,
      set: setS4,
    },
  ];

  const allFilled = sections.every((s) => s.val.trim().length >= 20);

  return (
    <InteractiveFrame>
      <RoundTag n={8} label="Analyst Memo" />
      <p className="ops-body mt-4 text-[15px] leading-7 text-slate-200">
        Write a defensible recommendation for the Cedar Ridge Education Reserve
        mandate. Each section needs at least 20 characters to submit.
      </p>

      <div className="mt-5 space-y-5">
        {sections.map((s) => (
          <div key={s.key}>
            <label
              className="ops-body-strong text-[15px] text-slate-50"
              htmlFor={s.key}
            >
              {s.label}
            </label>
            <textarea
              id={s.key}
              value={s.val}
              onChange={(e) => s.set(e.target.value)}
              disabled={submitted}
              rows={3}
              placeholder={s.ph}
              className="ops-body mt-2 w-full resize-y rounded-xl border border-white/15 bg-ink-950/60 px-4 py-3 text-[15px] text-slate-100 placeholder:text-slate-500 focus:border-accent-cyan/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/30 disabled:cursor-default"
            />
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={() => {
            setSubmitted(true);
            onComplete();
          }}
          disabled={!allFilled}
          className={cn(
            "mt-5 rounded-full border px-5 py-2.5 text-[14px] font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
            allFilled
              ? "border-accent-cyan bg-accent-cyan text-ink-950 hover:bg-accent-cyan/90"
              : "cursor-not-allowed border-white/10 text-slate-500 opacity-60",
          )}
        >
          Submit memo
        </button>
      ) : (
        <div className="ops-definition-card mt-5 p-5">
          <div className="ops-caption text-[11px] text-accent-green">
            Memo recorded · model reasoning
          </div>
          <p className="ops-definition mt-2.5 text-[16px] leading-7">
            Portfolio B is recommended because: (1) its sample arithmetic return
            exceeds 0.80%; (2) its beta ≈ 0.96 satisfies the ≤ 1.00 limit; (3)
            it has materially lower volatility; (4) Meridian provides meaningful
            diversification. Portfolio A violates the beta constraint. However,
            8 observations are insufficient for reliable estimates.
          </p>
        </div>
      )}
    </InteractiveFrame>
  );
}

// ===================== Round tracker =====================
const ROUND_LABELS = [
  { n: 1, label: "Data" },
  { n: 2, label: "Return/Vol" },
  { n: 3, label: "Correlation" },
  { n: 4, label: "Portfolios" },
  { n: 5, label: "Beta" },
  { n: 6, label: "Stress" },
  { n: 7, label: "Evidence" },
  { n: 8, label: "Memo" },
];

function RoundTabs({
  round,
  setRound,
  completed,
  maxUnlocked,
}: {
  round: number;
  setRound: (n: number) => void;
  completed: Set<number>;
  maxUnlocked: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ROUND_LABELS.map((r) => {
        const isDone = completed.has(r.n);
        const isLocked = r.n > maxUnlocked;
        return (
          <button
            key={r.n}
            type="button"
            disabled={isLocked}
            onClick={() => !isLocked && setRound(r.n)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber/50",
              isDone &&
                "border-accent-green/40 bg-accent-green/10 text-accent-green",
              round === r.n &&
                !isDone &&
                "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
              !isDone &&
                r.n !== round &&
                !isLocked &&
                "border-white/15 text-slate-300 hover:border-white/30",
              isLocked && "cursor-not-allowed border-white/5 text-slate-600",
            )}
          >
            <span className="font-mono">
              {isDone ? "✓" : isLocked ? "🔒" : r.n}
            </span>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

// ===================== Rounds container =====================
function PortfolioRiskLab() {
  const reduce = useReducedMotion();
  const [round, setRound] = useState(1);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const complete = useCallback((r: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(r);
      if (r < 8 && !next.has(r + 1)) setRound(r + 1);
      return next;
    });
  }, []);

  const maxUnlocked = Math.max(
    1,
    ...Array.from(completed)
      .map((r) => r + 1)
      .filter((r) => r <= 8),
  );

  return (
    <div className="space-y-6">
      <RoundTabs
        round={round}
        setRound={setRound}
        completed={completed}
        maxUnlocked={maxUnlocked}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {round === 1 && (
            <Round1DataInspection onComplete={() => complete(1)} />
          )}
          {round === 2 && <Round2ReturnVol onComplete={() => complete(2)} />}
          {round === 3 && <Round3Correlation onComplete={() => complete(3)} />}
          {round === 4 && (
            <Round4PortfolioCompare onComplete={() => complete(4)} />
          )}
          {round === 5 && <Round5Beta onComplete={() => complete(5)} />}
          {round === 6 && <Round6Stress onComplete={() => complete(6)} />}
          {round === 7 && <Round7Evidence onComplete={() => complete(7)} />}
          {round === 8 && <Round8Memo onComplete={() => complete(8)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ===================== Module 5 synthesis =====================
const SYNTHESIS_CHAIN = [
  {
    step: "Total return",
    note: "Cash distribution + price change over a period.",
  },
  {
    step: "Expected return",
    note: "Probability-weighted average of possible future returns.",
  },
  {
    step: "Arithmetic vs geometric",
    note: "Arithmetic averages returns; geometric compounds them. Volatility widens the gap.",
  },
  {
    step: "Volatility",
    note: "Standard deviation measures dispersion of returns.",
  },
  {
    step: "Covariance & correlation",
    note: "How assets move together — the engine of diversification.",
  },
  {
    step: "Diversification",
    note: "Low correlation reduces portfolio variance below the weighted average of variances.",
  },
  {
    step: "Systematic vs idiosyncratic",
    note: "Market risk cannot be diversified away; firm-specific risk can.",
  },
  {
    step: "Beta",
    note: "Sensitivity to the market — the systematic-risk measure.",
  },
  {
    step: "Empirical evidence",
    note: "Real data confirms diversification, co-movement, and unstable estimates.",
  },
  {
    step: "Analyst judgment",
    note: "Numbers inform but do not replace a defensible recommendation.",
  },
];

// ===================== Main lesson =====================
export default function Lesson5_6() {
  const report = useReportRRComplete("risk-portfolio-risk-lab");

  return (
    <RRLayout>
      {/* HERO */}
      <PVHero
        index="5.6"
        eyebrow="Lesson 5.6 · Module 5 — Risk and Return"
        heading="Portfolio Risk Lab"
        subheading="Apply the complete Module 5 toolkit — return, volatility, correlation, beta, diversification — to a realistic portfolio decision for Cedar Ridge Education Reserve."
        bullets={[
          "Inspect fictional return data",
          "Calculate return, volatility, correlation, and beta",
          "Compare two proposed portfolios",
          "Stress-test idiosyncratic and systematic risks",
          "Write a defensible analyst recommendation",
        ]}
        primaryLabel="Start the Portfolio Risk Lab"
      />

      {/* CLIENT MANDATE */}
      <Reveal className="mt-8">
        <div className="glass-panel p-6 sm:p-7">
          <div className="ops-eyebrow flex items-center gap-2 text-[11px] text-accent-amber">
            <span className="h-px w-6 bg-accent-amber/50" />
            Client mandate
          </div>
          <h2 className="ops-display mt-3 text-2xl text-white sm:text-3xl">
            Cedar Ridge Education Reserve
          </h2>
          <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
            Cedar Ridge has asked you to evaluate two proposed portfolios built
            from three fictional securities. Your recommendation must satisfy
            the mandate below and acknowledge the limits of the evidence.
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {[
              "Average monthly return ≥ 0.80% in the sample",
              "Estimated portfolio beta ≤ 1.00",
              "Avoid excessive concentration",
              "Prefer meaningful diversification",
              "Explain limitations of the 8-observation sample",
            ].map((m) => (
              <li
                key={m}
                className="ops-body flex items-start gap-2.5 text-[15px] text-slate-200"
              >
                <span
                  className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                  aria-hidden
                />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* DATASET */}
      <Reveal className="mt-10">
        <SectionHeading
          index="5.6.1"
          eyebrow="The data"
          title="Fictional monthly returns"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Three fictional companies plus a market index, observed over eight
            months. All figures are illustrative.
          </p>
          <div className="mt-5">
            <ReturnTable />
          </div>
          <p className="ops-muted mt-3 text-[12px]">
            Fictional monthly returns created for the OPS Portfolio Risk Lab.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DefinitionCard term="Atlas Consumer">
              Stable, mature consumer business. Lower volatility, cyclical but
              less extreme than Nova.
            </DefinitionCard>
            <DefinitionCard term="Nova Technology">
              Highly cyclical with high operating leverage. The largest swings
              of the three in both directions.
            </DefinitionCard>
            <DefinitionCard term="Meridian Health">
              Less correlated with Atlas and Nova than they are with each other
              — the strongest diversifier in the set.
            </DefinitionCard>
          </div>
        </Panel>
      </Reveal>

      {/* PORTFOLIO RISK LAB — 8 ROUNDS */}
      <Reveal className="mt-10">
        <SectionHeading
          index="5.6.2"
          eyebrow="The lab"
          title="Eight-round portfolio investigation"
        />
      </Reveal>
      <Reveal className="mt-5">
        <p className="ops-body mb-5 text-[15px] leading-7 text-slate-300">
          Work through the rounds in order. Completing a round unlocks the next.
        </p>
        <PortfolioRiskLab />
      </Reveal>

      {/* MODULE 5 SYNTHESIS */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.6.3"
          eyebrow="Module 5 synthesis"
          title="Connecting the full risk-and-return chain"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SYNTHESIS_CHAIN.map((c, i) => (
              <div
                key={c.step}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 font-mono text-[12px] text-accent-amber">
                  {i + 1}
                </span>
                <div>
                  <div className="ops-body-strong text-[15px] text-slate-100">
                    {c.step}
                  </div>
                  <div className="ops-body text-[14px] leading-6 text-slate-300">
                    {c.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Reveal>

      {/* Q&A */}
      <Reveal className="mt-10">
        <SectionHeading
          index="5.6.4"
          eyebrow="Common questions"
          title="Frequently asked"
        />
      </Reveal>
      <Reveal className="mt-5 space-y-3">
        <ExpandableQA question="Why is portfolio risk not just the weighted average of individual risks?">
          Because assets co-move. Portfolio variance includes every pairwise
          covariance term, so low (or negative) correlation can pull total risk
          well below the weighted average of the individual standard deviations.
        </ExpandableQA>
        <ExpandableQA question="Is beta the same thing as total risk?">
          No. Beta measures sensitivity to the market — systematic risk only.
          Total risk (standard deviation) also includes idiosyncratic risk,
          which diversification can reduce but the market does not reward.
        </ExpandableQA>
        <ExpandableQA question="Why does Meridian diversify the portfolio more than adding Atlas?">
          Atlas and Nova are almost perfectly correlated (ρ ≈ 0.998), so adding
          Atlas to a Nova-heavy portfolio adds little diversification.
          Meridian’s correlation with both is far lower (≈ 0.49–0.51), so it
          reduces portfolio variance meaningfully.
        </ExpandableQA>
      </Reveal>

      {/* MASTERY CHECK */}
      <Reveal className="mt-12">
        <MasteryCheck
          title="Mastery check"
          passCount={4}
          onComplete={() => report()}
          questions={QUESTIONS}
        />
      </Reveal>

      {/* SUMMARY */}
      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Portfolio Theory"
          continueHref="/lessons/portfolio-weights-returns"
        />
      </Reveal>

      {/* SOURCES */}
      <Reveal className="mt-8">
        <RRSourcePanel />
      </Reveal>
    </RRLayout>
  );
}
