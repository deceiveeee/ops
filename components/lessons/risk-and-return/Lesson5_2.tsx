"use client";

import {
  Reveal,
  SectionHeading,
  Panel,
  DefinitionCard,
  FormulaExplainer,
  InteractiveFrame,
  TryItTag,
  type MasteryQuestion,
  LessonSummary,
  MasteryCheck,
} from "./shared";
import { AnswerInput, AnswerWorksheet } from "./AnswerInput";
import RRLayout from "./RRLayout";
import RRSourcePanel from "./RRSourcePanel";
import PVHero from "@/components/lessons/present-value-relations/PVHero";
import { useReportRRComplete } from "@/lib/rr-progress";
import {
  arithmeticMean,
  geometricMean,
  endingWealth,
  requiredRecoveryReturn,
  sampleStandardDeviation,
  annualizeVolatility,
} from "@/lib/risk-return";

const LEARNING_OBJECTIVES = [
  "Compute the arithmetic mean return and interpret it as the average one-period outcome.",
  "Compute the geometric mean return and interpret it as the realized compound growth rate.",
  "Explain volatility drag and why gains and losses do not cancel.",
  "Compute sample variance and sample standard deviation of a return series.",
  "Interpret standard deviation as a typical fluctuation size in percentage points.",
  "Annualize volatility using the square-root-of-time rule, not simple multiplication.",
];

const SUMMARY_POINTS = [
  "Arithmetic mean answers 'what was the average annual return?'",
  "Geometric mean answers 'what constant rate reproduces the wealth path?'",
  "Volatility drag: gains and losses don't cancel because they apply to different bases.",
  "Sample variance divides by T−1; standard deviation is its square root.",
  "Standard deviation measures typical fluctuation size — in percentage points, not as a fraction of the mean.",
  "Annualize volatility by multiplying by √n, not n.",
  "Historical averages and volatilities are estimates, not exact future forecasts.",
];

const QUESTIONS: MasteryQuestion[] = [
  {
    id: "q1",
    type: "single",
    prompt: "Returns: 20%, −10%, 15%. What is the arithmetic mean?",
    choices: [
      { id: "a", label: "8.33%" },
      { id: "b", label: "7.49%" },
      { id: "c", label: "25%" },
    ],
    correctId: "a",
    hint: "Sum the returns (25%) and divide by 3 → 8.33%.",
  },
  {
    id: "q2",
    type: "single",
    prompt: "Same returns. What is the geometric mean (approximately)?",
    choices: [
      { id: "a", label: "7.49%" },
      { id: "b", label: "8.33%" },
      { id: "c", label: "10%" },
    ],
    correctId: "a",
    hint: "Take the product 1.20 × 0.90 × 1.15 = 1.242, then 1.242^(1/3) − 1.",
  },
  {
    id: "q3",
    type: "single",
    prompt: "+20% then −20%. What is the ending wealth from a $100 start?",
    choices: [
      { id: "a", label: "$96" },
      { id: "b", label: "$100" },
      { id: "c", label: "$120" },
    ],
    correctId: "a",
    hint: "$100 × 1.20 × 0.80 = $96.",
  },
  {
    id: "q4",
    type: "single",
    prompt:
      "Returns: 10%, −5%, 20%, 0%. What is the sample standard deviation (approximately)?",
    choices: [
      { id: "a", label: "11.09%" },
      { id: "b", label: "6.25%" },
      { id: "c", label: "10%" },
    ],
    correctId: "a",
    hint: "Mean = 6.25%, deviations squared sum to 0.036875, divide by T−1 = 3, take the square root.",
  },
  {
    id: "q5",
    type: "single",
    prompt:
      "Monthly volatility is 5%. What is the annualized volatility (approximately)?",
    choices: [
      { id: "a", label: "17.32%" },
      { id: "b", label: "60%" },
      { id: "c", label: "5%" },
    ],
    correctId: "a",
    hint: "Multiply by √12 ≈ 3.464: 5% × 3.464 ≈ 17.32%.",
  },
  {
    id: "q6",
    type: "single",
    prompt: "Which statement about standard deviation is correct?",
    choices: [
      {
        id: "a",
        label: "It measures typical fluctuation size in percentage points",
      },
      { id: "b", label: "It is the expected loss" },
      { id: "c", label: "It is a guaranteed maximum loss" },
    ],
    correctId: "a",
    hint: "Standard deviation is a spread measure — a typical distance from the mean, not a loss or a ceiling.",
  },
];

export default function Lesson5_2() {
  const report = useReportRRComplete(
    "risk-measuring-historical-return-volatility",
  );

  return (
    <RRLayout>
      {/* =================================================================== */}
      {/* HERO                                                                */}
      {/* =================================================================== */}
      <PVHero
        index="5.2"
        eyebrow="Lesson 5.2 · Module 5 — Risk and Return"
        heading="Measuring Historical Return and Volatility"
        subheading="Arithmetic and geometric averages, volatility drag, sample variance and standard deviation, and annualization."
        bullets={[
          "Arithmetic mean: average one-period return",
          "Geometric mean: realized compound growth",
          "Volatility drag: why gains and losses don't cancel",
          "Standard deviation: typical size of fluctuations",
          "Annualize volatility with √n, not ×n",
        ]}
        primaryLabel="Start"
      />

      {/* =================================================================== */}
      {/* LEARNING OBJECTIVES                                                 */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <div className="glass-panel p-6 sm:p-7">
          <div className="ops-eyebrow text-[11px] text-slate-400">
            Learning objectives
          </div>
          <p className="ops-body mt-3 text-[15px] text-slate-300">
            By the end of this lesson, you should be able to:
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LEARNING_OBJECTIVES.map((o, i) => (
              <li key={o} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-6 min-w-6 flex-shrink-0 items-center justify-center rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 font-sans text-[12px] text-accent-amber">
                  {i + 1}
                </span>
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  {o}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 1 — Arithmetic Average                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.1"
          eyebrow="Section 1"
          title="Arithmetic average return"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Suppose a stock returned{" "}
            <span className="font-sans text-accent-green">+20%</span>,{" "}
            <span className="font-sans text-accent-red">−10%</span>, and{" "}
            <span className="font-sans text-accent-green">+15%</span> over three
            years. The simplest summary is the{" "}
            <strong className="text-white">arithmetic average</strong> — the
            plain mean of the yearly returns.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Arithmetic mean"
          formula={String.raw`\bar{R} = \frac{1}{T}\sum_{t=1}^{T} R_t`}
          meaning="The arithmetic mean adds up each period's return and divides by the number of periods."
          variables={[
            { symbol: String.raw`R_t`, description: "Return in period t." },
            { symbol: String.raw`T`, description: "Number of periods." },
            {
              symbol: String.raw`\bar{R}`,
              description: "Arithmetic mean return.",
            },
          ]}
          substitution={String.raw`\bar{R} = \frac{0.20 + (-0.10) + 0.15}{3} = \frac{0.25}{3} \approx 0.0833`}
          result="Arithmetic mean ≈ 8.33%"
          interpretation="Interpret this as the average return in a randomly selected year — the typical one-period outcome you would have earned over this stretch."
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 2 — Geometric Average                                        */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.2"
          eyebrow="Section 2"
          title="Geometric average return"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            The arithmetic mean tells you the average year, but it does{" "}
            <strong className="text-white">not</strong> tell you what actually
            happened to a dollar invested across all three years. For that we
            use the <strong className="text-white">geometric mean</strong> — the
            constant growth rate that reproduces the actual wealth path.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Geometric mean"
          formula={String.raw`R_G = \left[\prod_{t=1}^{T}(1+R_t)\right]^{1/T} - 1`}
          meaning="Multiply one plus each return together (the total wealth ratio), take the T-th root, and subtract one. The result is the constant rate that reproduces the wealth path."
          variables={[
            {
              symbol: String.raw`(1+R_t)`,
              description: "Growth factor in period t.",
            },
            { symbol: String.raw`T`, description: "Number of periods." },
            { symbol: String.raw`R_G`, description: "Geometric mean return." },
          ]}
          substitution={String.raw`R_G = \left[(1.20)(0.90)(1.15)\right]^{1/3} - 1 = (1.242)^{1/3} - 1 \approx 0.0749`}
          result="Geometric mean ≈ 7.49%"
          interpretation="A constant 7.49% per year would have turned $100 into the same $124.20 that the actual sequence produced. Notice the geometric mean (7.49%) is below the arithmetic mean (8.33%) — this gap is volatility drag."
          tone="purple"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            The wealth path makes this concrete. A $100 investment grows and
            shrinks each year:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Start
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Return
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    End
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-400">Year 1</td>
                  <td className="py-2 pr-8">$100.00</td>
                  <td className="py-2 pr-8 text-accent-green">+20%</td>
                  <td className="py-2 text-slate-100">$120.00</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-400">Year 2</td>
                  <td className="py-2 pr-8">$120.00</td>
                  <td className="py-2 pr-8 text-accent-red">−10%</td>
                  <td className="py-2 text-slate-100">$108.00</td>
                </tr>
                <tr>
                  <td className="py-2 pr-8 text-slate-400">Year 3</td>
                  <td className="py-2 pr-8">$108.00</td>
                  <td className="py-2 pr-8 text-accent-green">+15%</td>
                  <td className="py-2 font-semibold text-accent-cyan">
                    $124.20
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 3 — Volatility Drag                                          */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.3"
          eyebrow="Section 3"
          title="Volatility drag"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Here is the puzzle at the heart of volatility drag. A stock gains{" "}
            <span className="font-sans text-accent-green">+20%</span> one year,
            then loses <span className="font-sans text-accent-red">−20%</span>{" "}
            the next. The arithmetic mean is{" "}
            <span className="font-sans text-accent-cyan">0%</span>. But did you
            break even?
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Time
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Start
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Return
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    End
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-400">Year 1</td>
                  <td className="py-2 pr-8">$100</td>
                  <td className="py-2 pr-8 text-accent-green">+20%</td>
                  <td className="py-2 text-slate-100">$120</td>
                </tr>
                <tr>
                  <td className="py-2 pr-8 text-slate-400">Year 2</td>
                  <td className="py-2 pr-8">$120</td>
                  <td className="py-2 pr-8 text-accent-red">−20%</td>
                  <td className="py-2 font-semibold text-accent-red">$96</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            No. You end with{" "}
            <span className="font-sans text-accent-red">$96</span>. The
            geometric mean is approximately{" "}
            <span className="font-sans">−2.02%</span>. Why? Because the gain and
            the loss apply to{" "}
            <strong className="text-white">different bases</strong>: +20% grows
            $100 to $120, but −20% shrinks $120 to $96. Returns compound
            multiplicatively, not additively — so equal-and-opposite percentages
            do not cancel.
          </p>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            The recovery math is stark. After a 20% loss you need more than a
            20% gain to get back: you need{" "}
            <span className="font-sans text-accent-amber">+25%</span>, because{" "}
            <span className="font-sans">1 / 0.80 − 1 = 0.25</span>. The deeper
            the hole, the steeper the climb.
          </p>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <CompoundingWorksheet />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 4 — When Each Average Is Used                                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.4"
          eyebrow="Section 4"
          title="When to use each average"
        />
      </Reveal>
      <Reveal className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DefinitionCard term="Arithmetic mean — use for">
            The{" "}
            <span className="text-slate-50">average one-period outcome</span>{" "}
            and as an estimator for the expected return in a typical future
            period. It answers: &ldquo;what did an average year look
            like?&rdquo;
          </DefinitionCard>
          <DefinitionCard term="Geometric mean — use for">
            The{" "}
            <span className="text-slate-50">realized compound performance</span>{" "}
            and long-term wealth growth. It answers: &ldquo;what constant rate
            reproduces the actual wealth path?&rdquo;
          </DefinitionCard>
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            <strong className="text-white">Warning:</strong> neither average is
            automatically the correct forecast of the future. The arithmetic
            mean is a reasonable estimate of next period&apos;s expected return;
            the geometric mean describes what compound growth you actually
            realized. Always be explicit about which one you are using and why.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 5 — Sample Mean, Variance, Standard Deviation                */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.5"
          eyebrow="Section 5"
          title="Sample mean, variance, and standard deviation"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            To measure how spread out returns are, we use the{" "}
            <strong className="text-white">sample variance</strong> and its
            square root, the{" "}
            <strong className="text-white">standard deviation</strong>. Consider
            a stock with four annual returns:{" "}
            <span className="font-sans">+10%</span>,{" "}
            <span className="font-sans">−5%</span>,{" "}
            <span className="font-sans">+20%</span>,{" "}
            <span className="font-sans">0%</span>. The mean is{" "}
            <span className="font-sans text-accent-cyan">6.25%</span>.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    t
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Rₜ
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Rₜ − R̄
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    (Rₜ − R̄)²
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-400">1</td>
                  <td className="py-2 pr-8">0.10</td>
                  <td className="py-2 pr-8 text-slate-300">0.0375</td>
                  <td className="py-2 text-slate-300">0.001406</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-400">2</td>
                  <td className="py-2 pr-8">−0.05</td>
                  <td className="py-2 pr-8 text-slate-300">−0.1125</td>
                  <td className="py-2 text-slate-300">0.012656</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-400">3</td>
                  <td className="py-2 pr-8">0.20</td>
                  <td className="py-2 pr-8 text-slate-300">0.1375</td>
                  <td className="py-2 text-slate-300">0.018906</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8 text-slate-400">4</td>
                  <td className="py-2 pr-8">0.00</td>
                  <td className="py-2 pr-8 text-slate-300">−0.0625</td>
                  <td className="py-2 text-slate-300">0.003906</td>
                </tr>
                <tr>
                  <td className="py-2 pr-8 text-slate-50" />
                  <td className="py-2 pr-8 text-slate-50">R̄ = 0.0625</td>
                  <td className="py-2 pr-8 text-slate-400">sum →</td>
                  <td className="py-2 font-semibold text-accent-cyan">
                    0.036875
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormulaExplainer
            label="Sample variance"
            formula={String.raw`s^2 = \frac{\sum_{t=1}^{T}(R_t - \bar{R})^2}{T-1}`}
            meaning="Square each deviation from the mean, sum them, and divide by T−1 (not T)."
            variables={[
              {
                symbol: String.raw`R_t - \bar{R}`,
                description: "Deviation of period t from the mean.",
              },
              {
                symbol: String.raw`T-1`,
                description: "Degrees of freedom (sample correction).",
              },
            ]}
            substitution={String.raw`s^2 = \frac{0.036875}{3} \approx 0.012292`}
            result="s² ≈ 0.012292"
            tone="amber"
          />
          <FormulaExplainer
            label="Standard deviation"
            formula={String.raw`s = \sqrt{s^2}`}
            meaning="The square root of the variance returns the spread to the same units as the returns themselves."
            substitution={String.raw`s = \sqrt{0.012292} \approx 0.1109`}
            result="s ≈ 11.09%"
            tone="amber"
          />
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            <strong className="text-white">Interpreting the result:</strong> the
            stock&apos;s average annual return was{" "}
            <span className="font-sans text-accent-cyan">6.25%</span>, while its
            standard deviation was{" "}
            <span className="font-sans text-accent-amber">11.09%</span>. This
            means an individual year&apos;s return typically moved by roughly{" "}
            <strong className="text-white">11 percentage points</strong> away
            from the average. A typical &plusmn;1&sigma; range is{" "}
            <span className="font-sans text-slate-100">
              6.25% &plusmn; 11.09%
            </span>
            , i.e. about <span className="font-sans">−4.84%</span> to{" "}
            <span className="font-sans">+17.34%</span>.
          </p>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            Be careful with units. The <span className="font-sans">11.09</span>{" "}
            is <strong className="text-white">percentage points</strong> of
            return — not 11.09% of the mean, and not an expected loss. It is a
            measure of how widely individual yearly returns scattered around the
            average.
          </p>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <VolatilityWorksheet />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 6 — Why Square Deviations                                    */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.6"
          eyebrow="Section 6"
          title="Why square the deviations?"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Why not just average the raw deviations? Because positive and
            negative deviations would{" "}
            <strong className="text-white">cancel</strong> — their sum is always
            zero by construction of the mean. Squaring every deviation solves
            two problems at once:
          </p>
          <ul className="mt-5 space-y-3">
            <li className="flex items-start gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                aria-hidden
              />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">
                  It makes everything positive.
                </strong>{" "}
                A squared number is never negative, so gains and losses both add
                to the spread.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                aria-hidden
              />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">
                  It weights large movements more.
                </strong>{" "}
                A small deviation like <span className="font-sans">3.75</span>{" "}
                contributes <span className="font-sans">3.75² = 14.06</span>,
                but a large one like <span className="font-sans">13.75</span>{" "}
                contributes <span className="font-sans">13.75² = 189.06</span> —
                over thirteen times more. Big swings dominate the measure.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                aria-hidden
              />
              <span className="ops-body text-[15px] leading-7 text-slate-200">
                <strong className="text-white">
                  The square root returns to original units.
                </strong>{" "}
                Variance is in &ldquo;percent-squared&rdquo;; taking the root
                brings it back to plain percentage points.
              </span>
            </li>
          </ul>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            Note: standard deviation is{" "}
            <strong className="text-white">not</strong> the average distance
            from the mean (that quantity is the mean absolute deviation, MAD).
            Standard deviation is the root-mean-square deviation — it punishes
            large swings more heavily.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 7 — Sample vs Population Variance                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.7"
          eyebrow="Section 7"
          title="Sample variance versus population variance"
        />
      </Reveal>
      <Reveal className="mt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormulaExplainer
            label="Population variance"
            formula={String.raw`\sigma^2 = \frac{\sum_{t=1}^{T}(R_t - \bar{R})^2}{T}`}
            meaning="Divide by T when you have the entire population of returns."
            tone="cyan"
          />
          <FormulaExplainer
            label="Sample variance"
            formula={String.raw`s^2 = \frac{\sum_{t=1}^{T}(R_t - \bar{R})^2}{T-1}`}
            meaning="Divide by T−1 (Bessel's correction) when your data is a sample of a larger process."
            tone="amber"
          />
        </div>
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Historical investment data is almost always a{" "}
            <strong className="text-white">sample</strong> — a finite window
            drawn from an ongoing, unknown return-generating process. Dividing
            by <span className="font-sans">T−1</span> corrects the downward bias
            that comes from using the sample mean (which sits closer to the data
            than the true mean). For the rest of this module, always use the
            sample formula.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 8 — Annualizing Returns and Volatility                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.8"
          eyebrow="Section 8"
          title="Annualizing returns and volatility"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            Returns and volatility scale differently when you move between
            periods. A monthly average return of{" "}
            <span className="font-sans">1%</span> annualizes arithmetically to{" "}
            <span className="font-sans text-accent-cyan">12%</span>, but
            compounds to{" "}
            <span className="font-sans text-accent-cyan">
              (1.01)¹² − 1 ≈ 12.68%
            </span>
            . Volatility, however, scales with the{" "}
            <strong className="text-white">square root</strong> of time.
          </p>
        </Panel>
      </Reveal>
      <Reveal className="mt-5">
        <FormulaExplainer
          label="Annualizing volatility"
          formula={String.raw`\sigma_{\text{annual}} = \sigma_{\text{period}} \times \sqrt{n}`}
          meaning="To annualize volatility, multiply the periodic standard deviation by the square root of the number of periods per year. Do NOT multiply by n."
          variables={[
            {
              symbol: String.raw`\sigma_{\text{period}}`,
              description:
                "Standard deviation over one period (e.g. one month).",
            },
            {
              symbol: String.raw`n`,
              description:
                "Number of periods per year (12 for monthly, 252 for daily).",
            },
          ]}
          substitution={String.raw`\sigma_{\text{annual}} = 0.04 \times \sqrt{12} \approx 0.04 \times 3.464 \approx 0.1386`}
          result="4% monthly → 13.86% annual"
          interpretation="The square-root rule comes from the fact that independent variances add. With 12 independent months, total variance is 12× a single month, so the standard deviation grows by √12 ≈ 3.464 — not by 12."
          tone="amber"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[15px] leading-7 text-slate-200">
            Two quick examples at monthly frequency:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-white/15 text-left">
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Monthly σ
                  </th>
                  <th className="py-2 pr-8 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    × √12
                  </th>
                  <th className="py-2 font-sans text-[12px] uppercase tracking-wider text-slate-400">
                    Annual σ
                  </th>
                </tr>
              </thead>
              <tbody className="font-sans text-slate-200">
                <tr className="border-b border-white/5">
                  <td className="py-2 pr-8">4%</td>
                  <td className="py-2 pr-8 text-slate-300">0.04 × 3.464</td>
                  <td className="py-2 text-accent-amber">13.86%</td>
                </tr>
                <tr>
                  <td className="py-2 pr-8">5%</td>
                  <td className="py-2 pr-8 text-slate-300">0.05 × 3.464</td>
                  <td className="py-2 text-accent-amber">17.32%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="ops-body mt-4 text-[15px] leading-7 text-slate-300">
            The common mistake is to multiply volatility by 12 (giving 48% or
            60%). That overstates risk by treating consecutive months as
            perfectly correlated. The square-root rule reflects how independent
            fluctuations accumulate.
          </p>
        </Panel>
      </Reveal>

      <Reveal className="mt-6">
        <AnnualizationChallenge />
      </Reveal>

      {/* =================================================================== */}
      {/* SECTION 9 — Estimation Uncertainty                                   */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <SectionHeading
          index="5.2.9"
          eyebrow="Section 9"
          title="Estimation uncertainty"
        />
      </Reveal>
      <Reveal className="mt-5">
        <Panel>
          <p className="ops-body text-[16px] leading-7 text-slate-200">
            A historical average of <span className="font-sans">12%</span> does{" "}
            <strong className="text-white">not</strong> establish that the true
            future expected return is exactly 12%. Historical estimates are just
            estimates, and they are plagued by several problems:
          </p>
          <ul className="mt-5 space-y-3">
            {[
              [
                "Limited sample",
                "A few years of data produce a noisy estimate of the true mean.",
              ],
              [
                "Unusual periods",
                "A single boom or crash can dominate a short window.",
              ],
              [
                "Extreme observations",
                "Outliers inflate or deflate both mean and volatility.",
              ],
              [
                "Changing models",
                "The process generating returns can shift over time.",
              ],
              [
                "Survivorship bias",
                "We only see the companies and funds that survived.",
              ],
              [
                "Regime changes",
                "Inflation, policy, and structure evolve, so the past may not resemble the future.",
              ],
            ].map(([term, desc]) => (
              <li key={term} className="flex items-start gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-amber"
                  aria-hidden
                />
                <span className="ops-body text-[15px] leading-7 text-slate-200">
                  <strong className="text-white">{term}.</strong> {desc}
                </span>
              </li>
            ))}
          </ul>
          <p className="ops-body mt-5 text-[15px] leading-7 text-slate-300">
            Treat historical means and volatilities as{" "}
            <em className="text-slate-100">noisy estimates</em> with a range of
            plausible true values — not as exact future forecasts.
          </p>
        </Panel>
      </Reveal>

      {/* =================================================================== */}
      {/* MASTERY CHECK                                                       */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <MasteryCheck
          title="Mastery check"
          passCount={4}
          onComplete={() => report()}
          continueLabel="Continue to Covariance, Correlation, and Diversification"
          continueHref="/lessons/risk-covariance-correlation-diversification"
          questions={QUESTIONS}
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SUMMARY                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-12">
        <LessonSummary
          points={SUMMARY_POINTS}
          continueLabel="Continue to Covariance, Correlation, and Diversification"
          continueHref="/lessons/risk-covariance-correlation-diversification"
        />
      </Reveal>

      {/* =================================================================== */}
      {/* SOURCES                                                             */}
      {/* =================================================================== */}
      <Reveal className="mt-8">
        <RRSourcePanel />
      </Reveal>
    </RRLayout>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Compounding worksheet (Section 3)                            */
/* ========================================================================= */
function CompoundingWorksheet() {
  // +20%, -20% sequence
  const rets = [0.2, -0.2];
  const wealth = endingWealth(100, rets);
  const am = arithmeticMean(rets);
  const gm = geometricMean(rets);
  const recovery = requiredRecoveryReturn(0.2);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Compounding worksheet
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Trace the wealth path for +20% then −20%
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Start with <span className="font-sans">$100</span>. Apply{" "}
        <span className="font-sans">+20%</span> then{" "}
        <span className="font-sans">−20%</span>. Compute the ending wealth, both
        averages, and the return needed to recover from the loss.
      </p>

      <div className="mt-5">
        <AnswerWorksheet
          title="Compounding"
          prompt="Work each value out by hand, then check. Hints appear when an answer is off."
          fields={[
            {
              id: "wealth",
              label: "Ending wealth from $100",
              answer: wealth,
              tolerance: 0.5,
              prefix: "$",
              unit: "",
              decimals: 0,
              hints: ["$100 × 1.20 × 0.80.", "120 × 0.80 = 96."],
            },
            {
              id: "am",
              label: "Arithmetic mean of the two returns",
              answer: am * 100,
              tolerance: 0.1,
              unit: "%",
              hints: ["(20% + (−20%)) / 2.", "0 / 2 = 0%."],
            },
            {
              id: "gm",
              label: "Geometric mean of the two returns",
              answer: gm * 100,
              tolerance: 0.1,
              unit: "%",
              hints: [
                "Geometric mean = (1.20 × 0.80)^(1/2) − 1.",
                "0.96^(1/2) − 1 ≈ −0.0202.",
              ],
            },
            {
              id: "recovery",
              label: "Return needed to recover from a 20% loss",
              answer: recovery * 100,
              tolerance: 0.5,
              unit: "%",
              hints: ["Recovery = 1 / (1 − 0.20) − 1.", "1 / 0.80 − 1 = 0.25."],
            },
          ]}
          interpretation={
            <>
              The arithmetic mean is{" "}
              <span className="font-sans">{(am * 100).toFixed(2)}%</span> but
              the geometric mean is{" "}
              <span className="font-sans text-accent-red">
                {(gm * 100).toFixed(2)}%
              </span>{" "}
              — the gap is volatility drag. You ended at{" "}
              <span className="font-sans text-accent-red">
                ${wealth.toFixed(0)}
              </span>
              , not $100, and recovering the loss requires a{" "}
              <span className="font-sans">+25%</span> gain, not +20%. This is
              why volatility itself erodes compound growth.
            </>
          }
        />
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Volatility worksheet (Section 5)                             */
/* ========================================================================= */
function VolatilityWorksheet() {
  // 10%, -5%, 20%, 0%
  const rets = [0.1, -0.05, 0.2, 0.0];
  const mean = arithmeticMean(rets);
  const sd = sampleStandardDeviation(rets);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Volatility worksheet
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Compute mean, variance, and standard deviation
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        Returns are <span className="font-sans">+10%</span>,{" "}
        <span className="font-sans">−5%</span>,{" "}
        <span className="font-sans">+20%</span>,{" "}
        <span className="font-sans">0%</span>. Enter each as a percentage (e.g.{" "}
        <span className="font-sans">10</span>), except variance which is a
        decimal.
      </p>

      <div className="mt-5">
        <AnswerWorksheet
          title="Volatility"
          fields={[
            {
              id: "mean",
              label: "Mean return R̄",
              answer: mean * 100,
              tolerance: 0.05,
              unit: "%",
              hints: ["(10 − 5 + 20 + 0) / 4.", "25 / 4 = 6.25."],
            },
            {
              id: "var",
              label: "Sample variance s² (enter as a decimal, e.g. 0.0123)",
              answer: sd * sd,
              tolerance: 0.0005,
              unit: "",
              decimals: 6,
              hints: [
                "Sum the squared deviations, then divide by T−1 = 3.",
                "Sum of squared deviations ≈ 0.036875; divide by 3 → 0.012292.",
              ],
            },
            {
              id: "sd",
              label: "Sample standard deviation s",
              answer: sd * 100,
              tolerance: 0.05,
              unit: "%",
              hints: [
                "Take the square root of the variance.",
                "√0.012292 ≈ 0.1109 → 11.09%.",
              ],
            },
          ]}
          interpretation={
            <>
              The mean return was{" "}
              <span className="font-sans">{(mean * 100).toFixed(2)}%</span> and
              the standard deviation{" "}
              <span className="font-sans">{(sd * 100).toFixed(2)}%</span>. An
              individual year typically moved about{" "}
              <span className="font-sans text-accent-amber">
                {(sd * 100).toFixed(0)} percentage points
              </span>{" "}
              away from the average — a &plusmn;1&sigma; band of roughly{" "}
              <span className="font-sans">
                {((mean - sd) * 100).toFixed(2)}% to{" "}
                {((mean + sd) * 100).toFixed(2)}%
              </span>
              .
            </>
          }
        />
      </div>
    </InteractiveFrame>
  );
}

/* ========================================================================= */
/* INTERACTIVE: Annualization challenge (Section 8)                          */
/* ========================================================================= */
function AnnualizationChallenge() {
  const monthlyVol = 0.05;
  const annualVol = annualizeVolatility(monthlyVol, 12);

  return (
    <InteractiveFrame>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <TryItTag />
          <span className="ops-caption text-[11px] text-slate-400">
            Annualization challenge
          </span>
        </div>
      </div>
      <h4 className="ops-interactive-title mt-4 text-xl text-white">
        Annualize a monthly volatility
      </h4>
      <p className="ops-body mt-3 text-[15px] leading-7 text-slate-200">
        A stock has a monthly standard deviation of{" "}
        <span className="font-sans">{(monthlyVol * 100).toFixed(0)}%</span>.
        What is its annualized volatility? Enter the answer as a percent (e.g.{" "}
        <span className="font-sans">17.32</span>).
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3">
        <AnswerInput
          label="Annualized volatility σ_annual"
          answer={annualVol * 100}
          tolerance={0.15}
          unit="%"
          hints={[
            "Multiply the monthly volatility by √12 ≈ 3.464 — not by 12.",
            "0.05 × 3.464 ≈ 0.1732 → 17.32%.",
          ]}
          solution="σ_annual = σ_month × √12. Independent monthly variances add, so the standard deviation scales with the square root of time."
          ariaLabel="Annualized volatility in percent"
        />
      </div>
    </InteractiveFrame>
  );
}
