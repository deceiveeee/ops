"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InlineMath } from "@/components/ui/Math";
import { Feedback } from "@/components/lessons/intro-course-overview/shared";
import { seededSample } from "./shared";
import { useLesson77State, type MasteryRecord } from "@/lib/capm-lesson77-state";

type Cat = "equilibrium" | "beta" | "capm-sml" | "regression" | "alpha" | "apt";

export const MASTERY_CATEGORIES: { id: Cat; label: string; guidance: string }[] = [
  { id: "equilibrium", label: "Market portfolio & equilibrium", guidance: "Review why the tangency portfolio becomes the market portfolio under CAPM equilibrium, and how prices and expected returns adjust through market clearing." },
  { id: "beta", label: "Beta interpretation", guidance: "Review beta as systematic market exposure (not total volatility), and how it amplifies market moves in both directions." },
  { id: "capm-sml", label: "CAPM & the SML", guidance: "Review required return, the SML’s intercept and slope, and the distinction among required, forecast, and realized return." },
  { id: "regression", label: "Regression & beta estimation", guidance: "Review beta as the regression slope, the difference between slope (beta) and fit (R²), residuals, and standard error." },
  { id: "alpha", label: "Alpha & model limitations", guidance: "Review alpha as return unexplained by the selected model, and why positive alpha does not prove skill or a guaranteed outcome." },
  { id: "apt", label: "APT & multifactor models", guidance: "Review the no-arbitrage intuition of APT, multifactor required returns, and how APT differs from CAPM without identifying the unique correct factors." },
];

type BankQ =
  | { id: string; cat: Cat; type: "single"; prompt: ReactNode; options: { id: string; label: string }[]; correctId: string; explanation: ReactNode }
  | { id: string; cat: Cat; type: "numeric"; prompt: ReactNode; answer: number; tolerance: number; unit?: string; explanation: ReactNode };

const BANK: BankQ[] = [
  // equilibrium
  { id: "e1", cat: "equilibrium", type: "single", prompt: "In CAPM equilibrium, why does the tangency portfolio equal the market portfolio?", options: [{ id: "a", label: "All investors demand the same risky portfolio, all assets must be held, and prices adjust until demand matches supply" }, { id: "b", label: "It is a definition" }, { id: "c", label: "The risk-free rate forces it" }], correctId: "a", explanation: "It holds through market clearing, not by definition." },
  { id: "e2", cat: "equilibrium", type: "single", prompt: "If an asset is over-demanded, what happens to its expected return (holding the payoff fixed)?", options: [{ id: "a", label: "It falls because its price is bid up" }, { id: "b", label: "It rises" }, { id: "c", label: "It stays constant" }], correctId: "a", explanation: "A higher price for the same payoff lowers expected return." },
  { id: "e3", cat: "equilibrium", type: "single", prompt: "A large-cap stock index is necessarily the complete theoretical market portfolio.", options: [{ id: "a", label: "False — it is only a proxy" }, { id: "b", label: "True by definition" }], correctId: "a", explanation: "The market includes all risky assets, not just large-cap public stocks." },
  { id: "e4", cat: "equilibrium", type: "single", prompt: "Market weights tell us which companies are the best investments.", options: [{ id: "a", label: "False — weights reflect relative size, not quality" }, { id: "b", label: "True — bigger means better" }], correctId: "a", explanation: "Weights are supply shares, not investment recommendations." },
  { id: "e5", cat: "equilibrium", type: "single", prompt: "Under two-fund separation, investors hold the same risky portfolio but may choose different total risk.", options: [{ id: "a", label: "True" }, { id: "b", label: "False" }], correctId: "a", explanation: "Everyone holds M; total risk is tuned by mixing with the risk-free asset." },
  // beta
  { id: "b1", cat: "beta", type: "single", prompt: "A beta of 1.4 means the asset:", options: [{ id: "a", label: "Has about 1.4× the market’s systematic exposure, on average" }, { id: "b", label: "Is 40% more volatile in total" }, { id: "c", label: "Will always move 1.4× the market" }], correctId: "a", explanation: "Beta is systematic exposure, an average tendency." },
  { id: "b2", cat: "beta", type: "single", prompt: "Two assets can have the same standard deviation but different beta.", options: [{ id: "a", label: "True — total swings can hide different market-related portions" }, { id: "b", label: "False — same σ forces same β" }], correctId: "a", explanation: "σ measures total swings; β measures only the market-related portion." },
  { id: "b3", cat: "beta", type: "numeric", prompt: "A portfolio is 50% in an asset with β = 1.20 and 50% in one with β = 0.80. Compute β_P.", answer: 1.0, tolerance: 0.01, explanation: "0.5(1.20) + 0.5(0.80) = 1.00." },
  { id: "b4", cat: "beta", type: "single", prompt: "Does a beta of zero mean the asset is risk-free?", options: [{ id: "a", label: "No — it may still have company-specific volatility" }, { id: "b", label: "Yes — zero beta means zero risk" }], correctId: "a", explanation: "Beta captures only market exposure." },
  { id: "b5", cat: "beta", type: "single", prompt: "When the market falls sharply, a high-beta portfolio tends to:", options: [{ id: "a", label: "Fall more strongly than a low-beta portfolio" }, { id: "b", label: "Rise" }, { id: "c", label: "Be unaffected" }], correctId: "a", explanation: "Higher beta amplifies downside participation too." },
  // capm-sml
  { id: "c1", cat: "capm-sml", type: "numeric", prompt: "With R_f = 3.5% and a market risk premium of 6.5%, compute the required return for β = 1.2 (in %).", answer: 11.3, tolerance: 0.05, unit: "%", explanation: "3.5% + 1.2 × 6.5% = 11.3%." },
  { id: "c2", cat: "capm-sml", type: "single", prompt: "Why is the SML a straight line?", options: [{ id: "a", label: "Each unit of beta earns the same market risk premium" }, { id: "b", label: "The risk-free rate is zero" }, { id: "c", label: "Beta is capped at one" }], correctId: "a", explanation: "A constant price per unit of market risk gives a constant slope." },
  { id: "c3", cat: "capm-sml", type: "single", prompt: "The CAPM required return is a guaranteed realized outcome.", options: [{ id: "a", label: "False — it is an equilibrium benchmark" }, { id: "b", label: "True" }], correctId: "a", explanation: "Required return ≠ realized return." },
  { id: "c4", cat: "capm-sml", type: "single", prompt: "Which line uses beta on its horizontal axis?", options: [{ id: "a", label: "Security Market Line" }, { id: "b", label: "Capital Market Line" }], correctId: "a", explanation: "The SML plots E[R] against β." },
  { id: "c5", cat: "capm-sml", type: "single", prompt: "A higher required return means the investment is superior.", options: [{ id: "a", label: "False — it compensates for greater systematic risk" }, { id: "b", label: "True — higher is always better" }], correctId: "a", explanation: "Return must be judged relative to the beta required to earn it." },
  // regression
  { id: "r1", cat: "regression", type: "single", prompt: "In the stock-versus-market regression, beta is:", options: [{ id: "a", label: "The slope of the fitted line" }, { id: "b", label: "The tightness of fit" }, { id: "c", label: "The intercept" }], correctId: "a", explanation: "Beta is the slope; the intercept is alpha." },
  { id: "r2", cat: "regression", type: "single", prompt: "If R² = 30%, then:", options: [{ id: "a", label: "The regression explained 30% of the asset’s sample variation" }, { id: "b", label: "Beta is 0.30" }, { id: "c", label: "The asset is risk-free" }], correctId: "a", explanation: "R² measures fit, not slope." },
  { id: "r3", cat: "regression", type: "single", prompt: "A residual is:", options: [{ id: "a", label: "The period-specific return not explained by the fitted line" }, { id: "b", label: "Proof of skill" }, { id: "c", label: "The beta" }], correctId: "a", explanation: "Residuals are vertical gaps from the line." },
  { id: "r4", cat: "regression", type: "single", prompt: "A larger standard error of beta means:", options: [{ id: "a", label: "The beta estimate is more imprecise" }, { id: "b", label: "Beta is definitely higher" }, { id: "c", label: "The fit is better" }], correctId: "a", explanation: "SE measures estimation uncertainty." },
  { id: "r5", cat: "regression", type: "single", prompt: "An estimated beta is a permanent, exact company trait.", options: [{ id: "a", label: "False — it changes with sample, benchmark, and business mix" }, { id: "b", label: "True" }], correctId: "a", explanation: "Beta is relative to choices of window, proxy, and method." },
  // alpha
  { id: "a1", cat: "alpha", type: "numeric", prompt: "A fund earned 12%. Its CAPM-required return was 7.6%. Compute CAPM alpha (in %).", answer: 4.4, tolerance: 0.05, unit: "%", explanation: "12% − 7.6% = 4.4%." },
  { id: "a2", cat: "alpha", type: "single", prompt: "Positive CAPM alpha proves manager skill.", options: [{ id: "a", label: "False — it may reflect chance, beta error, benchmark choice, or omitted factors" }, { id: "b", label: "True" }], correctId: "a", explanation: "Alpha is model-relative and uncertain." },
  { id: "a3", cat: "alpha", type: "single", prompt: "Alpha is best described as:", options: [{ id: "a", label: "Return not explained by the selected risk model" }, { id: "b", label: "A guaranteed extra return" }, { id: "c", label: "The asset’s total volatility" }], correctId: "a", explanation: "Alpha depends on the benchmark/model chosen." },
  { id: "a4", cat: "alpha", type: "single", prompt: "If multifactor alpha is much smaller than CAPM alpha, the most likely explanation is:", options: [{ id: "a", label: "Extra systematic factors explain part of the apparent alpha" }, { id: "b", label: "The CAPM was computed correctly and the multifactor model is wrong" }, { id: "c", label: "Alpha is unaffected by model choice" }], correctId: "a", explanation: "Omitted factors can masquerade as alpha in a one-factor model." },
  { id: "a5", cat: "alpha", type: "single", prompt: "Two funds with the same raw return must have performed equally.", options: [{ id: "a", label: "False — risk-adjusted alpha can differ" }, { id: "b", label: "True" }], correctId: "a", explanation: "Risk exposure must be considered." },
  // apt
  { id: "p1", cat: "apt", type: "numeric", prompt: "With R_f = 3%, β_M = 1.1, λ_M = 5%, β_S = 0.5, λ_S = 2%, β_V = −0.2, λ_V = 1.5%, compute E[R] (in %).", answer: 9.2, tolerance: 0.05, unit: "%", explanation: "3% + 1.1(5%) + 0.5(2%) − 0.2(1.5%) = 9.2%." },
  { id: "p2", cat: "apt", type: "single", prompt: "APT prices assets through:", options: [{ id: "a", label: "No-arbitrage pricing pressure" }, { id: "b", label: "A single market-clearing equilibrium only" }, { id: "c", label: "Government regulation" }], correctId: "a", explanation: "APT relies on the absence of arbitrage." },
  { id: "p3", cat: "apt", type: "single", prompt: "Two portfolios with identical factor exposures should persistently offer different expected returns.", options: [{ id: "a", label: "False — arbitrage pressure should narrow the gap" }, { id: "b", label: "True — they can differ forever" }], correctId: "a", explanation: "Same exposures ⇒ same expected return under APT." },
  { id: "p4", cat: "apt", type: "single", prompt: "APT identifies the uniquely correct risk factors.", options: [{ id: "a", label: "False — it does not determine the correct factors" }, { id: "b", label: "True" }], correctId: "a", explanation: "Factor selection remains a judgment." },
  { id: "p5", cat: "apt", type: "single", prompt: "Compared with CAPM, APT:", options: [{ id: "a", label: "Allows multiple systematic factors" }, { id: "b", label: "Requires exactly one market factor" }, { id: "c", label: "Identifies the market portfolio precisely" }], correctId: "a", explanation: "APT generalizes beyond a single factor." },
];

const PASS_PCT = 80;
const PER_CATEGORY = 2;

function shuffle<T>(arr: T[], seed: number): T[] {
  return seededSample(arr, arr.length, seed);
}

function QuestionView({
  q,
  selected,
  numericValue,
  locked,
  correct,
  onSingle,
  onNumeric,
}: {
  q: BankQ;
  selected?: string;
  numericValue: string;
  locked: boolean;
  correct: boolean;
  onSingle: (id: string) => void;
  onNumeric: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-accent-cyan/40 font-mono text-[11px] text-accent-cyan">
          {q.cat[0].toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] leading-[1.55] text-slate-200">{q.prompt}</div>
          {q.type === "single" ? (
            <div className="mt-2.5 flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const isSel = selected === opt.id;
                const showCorrect = locked && opt.id === q.correctId;
                const showWrong = locked && isSel && opt.id !== q.correctId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={locked}
                    onClick={() => onSingle(opt.id)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-left text-[13px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50",
                      showCorrect && "border-accent-green bg-accent-green/15 text-accent-green",
                      showWrong && "border-accent-red bg-accent-red/15 text-accent-red",
                      !locked && !isSel && "border-white/20 text-slate-200 hover:border-accent-cyan/60 hover:text-accent-cyan",
                      locked && !showCorrect && !showWrong && "border-white/10 text-slate-500",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <div className="relative inline-flex items-center">
                <input
                  type="number"
                  inputMode="decimal"
                  value={numericValue}
                  disabled={locked}
                  onChange={(e) => onNumeric(e.target.value)}
                  aria-label="numeric answer"
                  className={cn(
                    "w-32 rounded-lg border bg-ink-950/60 py-2 pl-3 pr-8 font-mono text-[15px] text-slate-100 focus:outline-none focus-visible:ring-2 disabled:cursor-default",
                    locked && correct && "border-accent-green/60 focus-visible:ring-accent-green/40",
                    locked && !correct && "border-accent-red/60 focus-visible:ring-accent-red/40",
                    !locked && "border-white/20 focus:border-accent-cyan/60 focus-visible:ring-accent-cyan/40",
                  )}
                />
                {q.unit && <span className="pointer-events-none absolute right-2.5 font-mono text-[13px] text-slate-400">{q.unit}</span>}
              </div>
              {locked && !correct && (
                <span className="font-mono text-[12px] text-accent-red">answer: {q.answer}{q.unit ?? ""}</span>
              )}
            </div>
          )}
          {locked && (
            <p className={cn("mt-2 text-[13px] leading-[1.5]", correct ? "text-accent-green" : "text-slate-400")}>
              {correct ? "✓ " : ""}{q.explanation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ModuleSevenMasteryCheck() {
  const { state, setMastery } = useLesson77State();
  const [seed, setSeed] = useState<number>(1);
  const [sample, setSample] = useState<BankQ[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Build the sample on the client to avoid hydration mismatch.
  useEffect(() => {
    const perCat = MASTERY_CATEGORIES.map((c) => shuffle(BANK.filter((q) => q.cat === c.id), seed + c.id.length).slice(0, PER_CATEGORY));
    setSample(shuffle(perCat.flat(), seed + 99));
  }, [seed]);

  const results = useMemo(() => {
    if (!sample || !submitted) return null;
    let correctCount = 0;
    const byCat: Record<string, { correct: number; total: number }> = {};
    for (const q of sample) {
      let ok = false;
      if (q.type === "single") {
        ok = answers[q.id] === q.correctId;
      } else {
        const v = parseFloat(answers[q.id] ?? "");
        ok = !isNaN(v) && Math.abs(v - q.answer) <= q.tolerance;
      }
      if (ok) correctCount++;
      byCat[q.cat] = byCat[q.cat] ?? { correct: 0, total: 0 };
      byCat[q.cat].total++;
      if (ok) byCat[q.cat].correct++;
    }
    const pct = Math.round((correctCount / sample.length) * 100);
    const weak = MASTERY_CATEGORIES.filter((c) => {
      const r = byCat[c.id];
      return r && r.total > 0 && r.correct / r.total < 0.5;
    });
    const noCategoryEntirelyWrong = MASTERY_CATEGORIES.every(
      (c) => (byCat[c.id]?.correct ?? 0) > 0,
    );
    const passed = pct >= PASS_PCT && noCategoryEntirelyWrong;
    return { correctCount, total: sample.length, pct, byCat, weak, passed };
  }, [sample, submitted, answers]);

  // Persist mastery result.
  useEffect(() => {
    if (results) {
      const rec: MasteryRecord = {
        attempts: (state.mastery?.attempts ?? 0) + 1,
        lastScorePct: results.pct,
        passed: results.passed,
        weakCategories: results.weak.map((c) => c.id),
      };
      setMastery(rec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const check = () => setSubmitted(true);
  const retry = () => {
    setSubmitted(false);
    setAnswers({});
    setSeed((s) => s + 7);
  };

  if (!sample) {
    return <div className="rounded-xl border border-white/12 bg-white/[0.03] p-5 text-[14px] text-slate-400">Preparing a fresh question sample…</div>;
  }

  const allAnswered = sample.every((q) => (answers[q.id] ?? "").toString().trim() !== "");

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-5">
        <div className="font-mono text-[12px] uppercase tracking-[0.16em] text-accent-cyan">Module 7 mastery check</div>
        <p className="mt-1 text-[15px] leading-[1.55] text-slate-200">
          A fresh sample of {sample.length} questions drawn across all six categories. Standard: at
          least {PASS_PCT}% overall, with no category entirely wrong. Each retry draws a new sample.
        </p>
      </div>

      <div className="space-y-3">
        {sample.map((q, i) => {
          const correct = results
            ? q.type === "single"
              ? answers[q.id] === q.correctId
              : !isNaN(parseFloat(answers[q.id] ?? "")) && Math.abs(parseFloat(answers[q.id] ?? "0") - q.answer) <= q.tolerance
            : false;
          return (
            <QuestionView
              key={q.id}
              q={q}
              selected={answers[q.id]}
              numericValue={answers[q.id] ?? ""}
              locked={submitted}
              correct={correct}
              onSingle={(id) => setAnswers((p) => ({ ...p, [q.id]: id }))}
              onNumeric={(v) => setAnswers((p) => ({ ...p, [q.id]: v }))}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!submitted && (
          <button
            type="button"
            onClick={check}
            disabled={!allAnswered}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-6 py-2.5 text-[15px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check answers
          </button>
        )}
        {submitted && (
          <button
            type="button"
            onClick={retry}
            className="rounded-full border border-accent-cyan/50 bg-accent-cyan/15 px-6 py-2.5 text-[15px] text-accent-cyan transition-colors hover:bg-accent-cyan/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50"
          >
            Retry with a new sample
          </button>
        )}
        {state.mastery && (
          <span className="font-mono text-[13px] text-slate-400">
            Attempts: {state.mastery.attempts} · Best status: {state.mastery.passed ? "passed" : "not yet passed"}
          </span>
        )}
      </div>

      {results && (
        <div className="space-y-4" aria-live="polite">
          <Feedback status={results.passed ? "correct" : "incorrect"}>
            <span className="block text-[16px]">
              Score: {results.correctCount}/{results.total} ({results.pct}%) —{" "}
              {results.passed ? "mastery standard met." : "not yet at the mastery standard."}
            </span>
          </Feedback>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {MASTERY_CATEGORIES.map((c) => {
              const r = results.byCat[c.id] ?? { correct: 0, total: 0 };
              const catOk = r.total > 0 && r.correct === r.total;
              const catWeak = r.total > 0 && r.correct / r.total < 0.5;
              return (
                <div
                  key={c.id}
                  className={cn(
                    "rounded-lg border p-2.5 text-center",
                    catOk ? "border-accent-green/40 bg-accent-green/10" : catWeak ? "border-accent-red/40 bg-accent-red/10" : "border-white/12 bg-white/[0.02]",
                  )}
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-slate-400">{c.label}</div>
                  <div className="mt-1 font-mono text-[14px] text-slate-100">{r.correct}/{r.total}</div>
                </div>
              );
            })}
          </div>

          {results.weak.length > 0 && (
            <div className="rounded-xl border border-accent-amber/25 bg-accent-amber/[0.05] p-4">
              <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-accent-amber">Targeted review</div>
              <ul className="mt-2 space-y-2">
                {results.weak.map((c) => (
                  <li key={c.id} className="text-[14px] leading-[1.55] text-slate-200">
                    <strong className="text-slate-100">{c.label}.</strong> {c.guidance}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.passed && (
            <Feedback status="correct">
              Mastery standard met. You may continue, or retry to practice with a fresh sample.
            </Feedback>
          )}
          {!results.passed && (
            <p className="text-[14px] leading-[1.55] text-slate-400">
              You are not locked out. Review the guidance above, then retry — completed case work and
              practice progress are preserved.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
